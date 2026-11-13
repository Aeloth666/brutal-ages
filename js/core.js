// =====================================================================
//  SIMULACE (běží jen u hostitele / v sólo hře)
// =====================================================================
let S = null;

// obtížnost počítače: rychlost rozhodování, bonus zlata/XP za zabití, zpoždění evoluce, „chytrost“
const DIFF = [
  { n: 'Lehká',    think: [1.4, 2.0],   gm: 0.75, xm: 0.8, evo: 25, smart: 0,   spMin: 6, gold: START_GOLD },
  { n: 'Normální', think: [0.7, 1.1],   gm: 1.0,  xm: 1.0, evo: 6,  smart: 0.3, spMin: 4, gold: START_GOLD },
  { n: 'Těžká',    think: [0.45, 0.7],  gm: 1.35, xm: 1.25, evo: 0, smart: 0.7, spMin: 3, gold: 250 },
  { n: 'Nemožná',  think: [0.3, 0.45],  gm: 1.8,  xm: 1.6, evo: 0,  smart: 1,   spMin: 2, gold: 450 },
  { n: 'Šílená',   think: [0.2, 0.3],   gm: 2.4,  xm: 2.0, evo: 0,  smart: 1,   spMin: 1, gold: 800 },   // odemkne se po dohrání kampaně
];

// schopnosti armády: tlačítka dole „v zemi“; na pár sekund posílí celou armádu, pak se nabíjí (t = trvání, cd = nabíjení v s)
const ABIL = [
  { ic: '⚔️', n: 'Do útoku!', d: 'Celá armáda útočí o 35 % silněji.', t: 8, cd: 60, col: '239,68,68' },
  { ic: '🛡️', n: 'Štíty!', d: 'Celá armáda dostává o 40 % menší zranění.', t: 8, cd: 60, col: '59,130,246' },
  { ic: '💨', n: 'Vpřed!', d: 'Armáda běží o 50 % rychleji a útočí o 30 % rychleji.', t: 6, cd: 50, col: '34,197,94' },
  { ic: '❤️', n: 'Lazaret', d: 'Armáda si každou sekundu doplní 4 % zdraví.', t: 8, cd: 75, col: '236,72,153' },
];
const ABIL_START = 20, ABIL_GAP = 4;                   // ABIL_GAP: po použití schopnosti jde další až za 4 s (nejdou zapnout všechny naráz)
const abOn = (s, k) => { const p = S.pl[s]; return p && p.ab && p.ab[k] > 0; };
function newPlayer() {
  return { gold: START_GOLD, xp: 0, age: 0, hp: AGES[0].baseHp, mhp: AGES[0].baseHp,
    slots: 1, tur: [], q: [], qt: 0, spcd: 0,
    gm: 1, xm: 1, kills: 0, spk: 0, spBest: 0, supers: 0, built: 0, up: [0, 0, 0], hcd: 0, acd: 0, ord: 0, emb: 0,
    af: [0, 0, 0, 0, 0], pref: [0, 0, 0, 0, 0], bm: 1, pick: 0, ab: [0, 0, 0, 0], abc: ABIL.map(() => ABIL_START) };
}
function newState() { return { pl: [newPlayer(), newPlayer()], units: [], proj: [], nid: 1, over: -1, ev: [], time: 0, mods: null, chal: null, camp: null, daily: 0, speed: 1, events: false, evT: 75, dark: 0, chest: null }; }

// --- události v bitvě (jen pro hostitele / hru proti počítači) ---
const EVENTS = { wave: '', storm: 'Písečná bouře – střelci nedostřelí daleko!', trex: '🦖 T-REX SE VRÁTIL!', quake: 'Zemětřesení!', chest: 'Truhla se zlatem!', merc: 'Žoldáci se přidali k slabším!', eclipse: 'Zatmění slunce', meteors: 'Déšť meteoritů!' };
// „palba z nebe“ podle doby – zasáhne obě strany (nezaměňovat se speciálem počítače)
const SKYFIRE = ['Déšť meteoritů – zasáhne obě strany!', 'Zbloudilé šípy – zasáhnou obě strany!', 'Zbloudilá dělostřelba – zasáhne obě strany!',
  'Zbloudilý nálet – zasáhne obě strany!', 'Porucha orbitálního laseru – zasáhne obě strany!'];
function battleEvent() {
  const k = Math.random() < 0.07 ? 'trex' : ['quake', 'chest', 'merc', 'eclipse', 'meteors'][(Math.random() * 5) | 0];
  if (k === 'trex') { const dir = Math.random() < 0.5 ? 1 : -1; S.trex = { x: dir > 0 ? -140 : W + 140, dir, hit: [] }; S.ev.push([W / 2, 200, 'roar']); }
  const ea = Math.max(S.pl[0].age, S.pl[1].age);
  S.ev.push([W / 2, 200, 'evt', k, ea]);
  if (k === 'quake') for (const u of S.units) hurt(u, u.mx * 0.15, -1);
  else if (k === 'chest') S.chest = { x: rnd(480, 820), g: Math.round(AGE_GOLD[Math.max(S.pl[0].age, S.pl[1].age)] * 1.5) };
  else if (k === 'merc') {
    const n0 = S.units.filter(u => u.side === 0).length, n1 = S.units.filter(u => u.side === 1).length, s = n0 <= n1 ? 0 : 1, p = S.pl[s];
    for (let i = 0; i < 3; i++) p.q.push({ a: p.age, ty: i === 2 ? 0 : 1 });
  } else if (k === 'eclipse') S.dark = 20;
  else {
    const sp = AGES[ea].sp, beam = sp.p === 'beam';
    for (let i = 0; i < 12; i++)
      S.proj.push({ id: S.nid++, fall: 1, x: rnd(220, 1080), y: -40 - Math.random() * (beam ? 900 : 600), vx: beam ? 0 : rnd(-60, 60), vy: beam ? 1400 : 480,
        d: sp.d * 0.8, side: -1, p: sp.p, sp: 40 });
  }
}

// m = hráč v týmu (0/1), který příkaz dal – platí ze své peněženky a jednotky jsou jeho národa
function applyCmd(s, c, m = 0) {
  const p = S && S.pl[s], W = p && p.w;
  if (!p) return;
  m = W ? Math.min(1, Math.max(0, m | 0)) : 0;
  if (W) { p.gold = W[m]; p.inCmd = true; }
  p.cm = m; dmgMem = W ? m : null;
  try { applyCmd0(s, c); } finally { if (W) { W[m] = p.gold; p.inCmd = false; p.gold = W[0] + W[1]; } }
}
function applyCmd0(s, c) {
  if (!S || S.over >= 0 || !c) return;
  const p = S.pl[s], M = S.mods || {};
  switch (c.a) {
    case 'buy': {
      if (c.ty === 3 && p.age < 4) return;
      if (s === 0 && M.only != null && c.ty !== M.only) return;
      if (![0, 1, 2, 3, 6].includes(c.ty)) return;
      const af = p.afm ? p.afm[p.cm | 0] : p.af, f = (af && af[p.age]) | 0, d = uDef(p.age, c.ty, f), k = d && unitCost(p, c.ty);
      if (!d || p.gold < k || p.q.length >= qMax(p)) return;
      p.gold -= k; p.q.push({ a: p.age, ty: c.ty, f, m: p.cm | 0 }); break;
    }
    case 'turret': {
      const d = AGES[p.age].turrets[c.i];
      if (s === 0 && M.noTower) return;
      if (!d || p.tur.length >= p.slots || p.gold < turCost(p, d)) return;
      p.gold -= turCost(p, d); p.tur.push({ a: p.age, i: c.i, cd: 0 }); p.built++; break;
    }
    case 'slot': {
      if (p.slots >= 4) return;
      const k = SLOT_COST[p.slots - 1];
      if (p.gold < k) return;
      p.gold -= k; p.slots++; break;
    }
    case 'sell': {
      // c.k = která věž (0 = horní); bez něj poslední postavená
      const k = Number.isInteger(c.k) && c.k >= 0 && c.k < p.tur.length ? c.k : p.tur.length - 1;
      const t = k >= 0 ? p.tur.splice(k, 1)[0] : null;
      if (t) p.gold += Math.floor(AGES[t.a].turrets[t.i].c / 2);
      break;
    }
    case 'special': {
      if (p.spcd > 0) return;
      p.spcd = SP_CD * (facOf(s).spcd || 1); p.spk = 0; special(s); S.ev.push([W / 2, 200, 'sp', s]); break;
    }
    case 'sbon': if (s === 0 && S.surv) survPickBon(c.i); break;
    case 'abil': {
      const k = c.k | 0, A = ABIL[k];
      if (!A || !p.abc || p.abc[k] > 0 || p.abl > 0 || (s === 0 && M.noAbil)) return;
      p.ab[k] = A.t; p.abc[k] = A.cd; p.abl = ABIL_GAP;
      S.ev.push([BX[s] + (s ? -160 : 160), GY - 120, 'abil', s, k]); break;
    }
    case 'rage': {
      if (!S.rage || p.rgcd > 0 || S.units.some(u => u.side === s && u.rage)) return;
      const dir = s ? -1 : 1, u = S.units.filter(u => u.side === s && u.ty <= 2 && !u.dead).sort((a, b) => (b.x - a.x) * dir)[0];
      if (!u) return;
      u.rage = 1; u.mx = Math.round(u.mx * 1.25); u.hp = Math.round(u.hp * 1.25);
      S.ev.push([u.x, GY - 50, 'rage', s]); break;
    }
    case 'fac': {
      if (!(p.pick > 0)) break;
      if (!p.afm) { setAgeFac(p, c.i); p.pick = 0; break; }
      // tým: každý si volí svůj národ; bonusy strany se řídí prvním hráčem, výběr končí, až zvolí oba
      const i = Math.min(3, Math.max(0, c.i | 0)), m = p.cm | 0;
      p.afm[m][p.age] = i; if (m === 0) setAgeFac(p, i);
      p.pd = p.pd || [0, 0]; p.pd[m] = 1; if (p.pd[0] && p.pd[1]) p.pick = 0;
      break;
    }
    case 'ord': { const o = c.o | 0; if (o >= 0 && o < 3) p.ord = o; break; }
    case 'up': {
      const k = c.k | 0;
      if (!UPS[k] || p.up[k] >= upMax(p) || p.gold < upCost(p, k)) return;
      p.gold -= upCost(p, k); p.up[k]++;
      if (k === 2) { const add = AGES[p.age].baseHp * UPS[2].k; p.mhp += add; p.hp += add; }
      S.ev.push([BX[s], GY - 120, 'up']); break;
    }
    case 'hero': {
      const h = S.units.find(u => u.side === s && u.ty === 4);
      if (h) {                                            // ničivý úder kolem hrdiny
        if (p.acd > 0) return;
        p.acd = HERO_ACD;
        const dir = s ? -1 : 1, x = h.x + dir * 45;
        dmgSrc = 'h'; splash(x, 90, uDef(h.a, 4).d * 2.5 * atkMul(s) * GB(p).heroD, s);
        h.at = 1; S.ev.push([x, GY - 20, 'slam', s]); break;
      }
      const d = HEROES[p.age];
      if (p.hcd > 0 || p.gold < d.c || !spawnFree(s, 4)) return;
      p.gold -= d.c; spawn(s, { a: p.age, ty: 4, m: p.cm | 0 }); p.acd = 3; break;
    }
    case 'evolve': {
      if (M.noEvo || p.age >= 4 || p.xp < AGES[p.age].xp) return;
      p.age++;
      const nm = AGES[p.age].baseHp * (1 + UPS[2].k * p.up[2]);
      p.hp += nm - p.mhp; p.mhp = nm; p.bm = 1;
      setAgeFac(p, p.pref[p.age]); p.pick = FAC_PICK;     // nový věk = nový výběr národa
      if (p.afm) { p.afm.forEach((af, i) => af[p.age] = p.prefm[i][p.age]); p.pd = [0, 0]; if (S.bot && S.bot.s === s) p.pd[S.bot.m] = 1; }
      S.ev.push([BX[s], GY - 90, 'evo']); break;
    }
  }
}

function special(s) {
  const sp = AGES[S.pl[s].age].sp, dir = s ? -1 : 1, beam = sp.p === 'beam';
  for (let i = 0; i < sp.count; i++) {
    const x = rnd(200, 1100);
    S.proj.push({ id: S.nid++, fall: 1, x: beam ? x : x - dir * 80, y: -30 - Math.random() * (beam ? 900 : 650),
      vx: beam ? 0 : dir * 80, vy: beam ? 1400 : 520, d: sp.d, side: s, p: sp.p, sp: 40 });
  }
}

function spawnFree(s, ty, a, m) {
  const w = unitW(ty, s, a, m);
  return !S.units.some(u => u.side === s && Math.abs(u.x - SPAWN[s]) < (u.w + w) / 2 + 2);
}
function spawn(s, q) {
  const d = uDef(q.a, q.ty, q.f), g = GB(S.pl[s]);
  const F = facOf(s), hp = Math.round(d.hp * (1 + UPS[1].k * S.pl[s].up[1]) * (F.hp || 1) * (q.ty === 2 ? F.heavy || 1 : 1) * (q.ty === 4 ? g.heroHp * ((g.gear && g.gear[q.a][0]) || 1) : g.hp));
  const mm = q.a === 0 && q.ty === 2 ? mountMod(s, q.m) : null;
  const hp2 = Math.round((mm && mm.hp ? hp * mm.hp : hp) * (S.pl[s].sb ? S.pl[s].sb.hp : 1));
  S.units.push({ id: S.nid++, side: s, a: q.a, ty: q.ty, f: q.f | 0, x: SPAWN[s], hp: hp2, mx: hp2,
    w: unitW(q.ty, s, q.a, q.m), m: q.m | 0, st: 0, at: 0, cd: 0.3 });
  if (S.st) { S.st.made[s]++; if (q.ty === 6) S.st.spec[s]++; }
  if (q.ty === 3) S.pl[s].supers++;
  // pokřik národa (hráč ho slyší jen občas, hrdina a supervoják vždy)
  const p = S.pl[s], afx = p.afm ? p.afm[q.m | 0] : p.af; S.ev.push([SPAWN[s], GY - 40, 'cry', s, q.a * 4 + ((afx && afx[q.a]) | 0), q.ty]);
}

let dmgSrc = 'u';                                  // odkud škoda je (u jednotky, t věže, s speciál, h hrdina) – pro statistiky
let dmgMem = null;                                 // který hráč týmu škodu způsobil (null = věž, speciál… → odměna napůl)
// V týmu (co-op, 2 na 2) má každý hráč vlastní peněženku p.w[m]; p.gold je pak součet.
// Kdo zabil, dostane celou odměnu a spoluhráč k tomu podíl podle obtížnosti (ať má příjem, i když zrovna nebojuje).
// Bez určeného hráče (věž, speciální útok, truhla) se odměna dělí napůl.
// Během příkazu (p.inCmd) drží p.gold peněženku hráče, který příkaz dal (p.cm).
const MATE_SHARE = [0.35, 0.25, 0.2, 0.15, 0.1];          // podíl spoluhráče podle obtížnosti (Lehká … Šílená); 2 na 2 = 25 %
const mateShare = () => MATE_SHARE[S.diff ?? 1] ?? 0.25;
function addGold(s, g, m, kill) {
  const p = S.pl[s]; if (!p) return;
  const W = p.w; if (!W) { p.gold += g; return; }
  const add = (i, v) => { if (p.inCmd && i === p.cm) p.gold += v; else W[i] += v; };
  if (m == null) { add(0, g / 2); add(1, g / 2); }
  else { add(m, g); if (kill) add(1 - m, g * mateShare()); }
  if (!p.inCmd) p.gold = W[0] + W[1];
}
function hurt(t, dmg, by, fromSpecial) {
  if (t.dead) return;
  if (t.ty === 6 && uDefU(t).ab === 'dodge' && Math.random() < 0.4) return;   // ninja uhne
  if (S.st && by >= 0) S.st.dmg[by][fromSpecial ? 's' : dmgSrc] += Math.min(dmg, Math.max(0, t.hp));
  if (abOn(t.side, 1)) dmg *= 0.6;                     // schopnost Štíty!
  t.hp -= dmg;
  if (t.hp <= 0) {
    t.dead = 1;
    if (t.ty === 5 && by >= 0) { S.bossK = S.bossK || [0, 0]; S.bossK[by]++; }
    const d = uDefU(t), p = S.pl[by], g = p && GB(p);
    if (t.ty === 6 && d.ab === 'boom') { const src = dmgSrc; dmgSrc = 'u'; splash(t.x, 80, d.d * 4, t.side); dmgSrc = src; S.ev.push([t.x, GY - 20, 'boom']); }
    if (p) {
      const loot = g.loot && (t.ty === 2 || t.ty === 5) ? 2 : 1, gg = Math.round(d.c * KILL_GOLD * p.gm * (facOf(by).gold || 1) * g.gold * loot);
      addGold(by, gg, dmgMem, true); if (S.st) S.st.gold[by] += gg;
      p.xp += Math.round(d.c * KILL_XP * p.xm * g.xp);
      p.kills++;
      if (fromSpecial) { p.spk++; p.spBest = Math.max(p.spBest, p.spk); }
    }
    if (t.ty === 4) S.pl[t.side].hcd = HERO_CD;
    if (t.rage) S.pl[t.side].rgcd = RAGE_CD;
    S.ev.push([t.x, GY - 22, 'die', t.side, t.a, t.ty, t.m | 0]);
  }
}
function hitBase(s, dmg, by) {
  const p = S.pl[s];
  if (S.over >= 0 || (S.surv && s === 1)) return;          // v přežití je nepřátelská základna nezničitelná
  p.hp -= dmg;
  S.pl[by].xp += Math.round(dmg * 0.5);
  if (S.st) S.st.dmg[by].b += dmg;
  if (GB(p).bastion && !p.bastUsed && p.hp > 0 && p.hp < p.mhp * 0.2) { p.bastUsed = 1; p.hp = p.mhp * 0.5; S.ev.push([BX[s], GY - 90, 'bast', s]); }
  if (p.hp <= 0) { p.hp = 0; S.over = by; S.ev.push([BX[s], GY - 80, 'boom']); }
}
function splash(x, r, d, side, fromSpecial) {
  for (const u of S.units) if (u.side !== side && !u.dead && Math.abs(u.x - x) <= r + u.w / 2) hurt(u, d, side, fromSpecial);
}
// speciální útoky bossů – každý boss je použije zhruba každých 11–15 s, když má nepřátele na dosah
const BOSS_SK = [
  { ic: '🐯', n: 'Řev', d: 'Omráčí nepřátele kolem sebe na 1,6 s.' },
  { ic: '🔥', n: 'Ohnivý dech', d: 'Spálí nepřátele před sebou a na 5 s vyřadí jejich věže.' },
  { ic: '💥', n: 'Salva', d: 'Zasype pole před sebou pěti granáty.' },
  { ic: '✈️', n: 'Nálet', d: 'Přivolá dělostřelectvo na přední linii nepřítele.' },
  { ic: '🤖', n: 'Drony', d: 'Vypustí tři bojové drony.' },
];
function bossSkill(u) {
  const s = u.side, dir = s ? -1 : 1, d = uDefU(u), dmg = d.d * atkMul(s) * (u.sm || 1);
  const ahead = (R, back = 40) => S.units.filter(e => e.side !== s && !e.dead && (e.x - u.x) * dir > -back && (e.x - u.x) * dir < R);
  dmgSrc = 'u'; dmgMem = null;
  switch (u.a) {
    case 0: { const L = ahead(230, 120); if (!L.length) return false; L.forEach(e => { if (e.ty !== 5) e.stun = 1.6; }); break; }
    case 1: { const L = ahead(270); if (!L.length) return false; L.forEach(e => hurt(e, dmg * 1.2, s, true)); S.pl[1 - s].turOff = 5; S.ev.push([BX[1 - s], GY - 150, 'burn', 1 - s]); break; }
    case 2: { if (!ahead(420).length) return false; for (let i = 0; i < 5; i++) { const x = u.x + dir * (110 + i * 65); splash(x, 50, dmg * 0.8, s, true); S.ev.push([x, GY - 10, 'boom']); } break; }
    case 3: { const L = ahead(700).sort((a, b) => (a.x - b.x) * dir); if (!L.length) return false;
      for (let i = 0; i < 3; i++) { const x = L[Math.min(L.length - 1, i * 2)].x + rnd(-20, 20); splash(x, 70, dmg * 1.4, s, true); S.ev.push([x, GY - 10, 'boom']); } break; }
    case 4: { if (!ahead(600).length) return false;
      for (let i = 0; i < 3; i++) { spawn(s, { a: 4, ty: 1, f: 0 }); const r = S.units[S.units.length - 1]; r.x = u.x - dir * (40 + i * 30); if (u.sm) { r.mx = r.hp = Math.round(r.hp * (u.mx / d.hp)); r.sm = u.sm; } } break; }
  }
  S.ev.push([u.x, GY - (d.y || 60) - 40, 'bsk', s, u.a]);
  return true;
}
function slotPos(s, k) { return { x: BX[s] + (s ? -1 : 1) * 70, y: GY - 172 + k * 36 }; }

function attack(u, d0, tgt, dir) {
  const F = facOf(u.side), WP = u.ty === 1 && F.g && WEAP[F.g], pp = (WP && WP.proj) || d0.p, P = S.pl[u.side], g = GB(P);
  let k = (u.ty === 4 ? g.heroD * ((g.gear && g.gear[u.a][1]) || 1) : g.dmg) * (P.cryT > 0 ? 1.3 : 1) * (u.sm || 1) * (P.ab && P.ab[0] > 0 ? 1.35 : 1) * (P.sb ? P.sb.dmg : 1);
  if (u.ty === 6) {                                    // schopnosti speciálních jednotek
    if (d0.ab === 'charge' && !u.hit) k *= d0.chg || 3;          // nájezd: první úder násobně silnější
    if (d0.ab === 'berserk') k *= 2 - u.hp / u.mx;
  }
  if (S.units.some(a => a.side === u.side && a !== u && a.ty === 6 && !a.dead && Math.abs(a.x - u.x) < 160 && uDefU(a).ab === 'drum')) k *= 1.4;
  u.hit = 1;
  if (u.a === 0 && u.ty === 2) { const mm = mountMod(u.side, u.m); if (mm && mm.d) k *= mm.d; }
  const d = { ...d0, d: d0.d * atkMul(u.side) * ((d0.p ? F.ranged : F.melee) || 1) * (u.rage ? 1.3 : 1) * k };
  dmgSrc = u.ty === 4 ? 'h' : 'u'; dmgMem = u.m ?? null;
  if (d.p) {
    const y0 = GY - (u.ty === 5 ? d.y : u.ty === 2 ? 50 : u.ty === 3 ? 62 : 38), x0 = u.x + dir * (u.w / 2 + 4);
    const base = tgt === 'base';
    S.proj.push({ id: S.nid++, x: x0, y: y0, tid: base ? -1 : tgt.id,
      tx: base ? BF[1 - u.side] - dir * 15 : tgt.x, ty: base ? GY - 60 : GY - 22,
      d: d.d, side: u.side, p: pp, sp: d.sp || 0, v: SPD[pp], src: u.ty === 4 ? 'h' : 'u', m: u.m });
    if (pp !== 'stone' && pp !== 'arrow' && pp !== 'axe') S.ev.push([x0 + dir * 6, y0, 'muz']);
  } else if (tgt === 'base') {
    hitBase(1 - u.side, d.d, u.side); S.ev.push([BF[1 - u.side], GY - 30, 'hit']);
  } else if (d.sw) {                                     // boss: plošný úder (dupnutí, plamen)
    splash(tgt.x, d.sw, d.d, u.side); S.ev.push([tgt.x, GY - 20, 'slam', u.side]);
  } else {
    const hp0 = tgt.hp;
    hurt(tgt, d.d, u.side); S.ev.push([tgt.x - dir * 6, GY - 26, u.rage ? 'rhit' : 'hit']);
    if (u.ty === 6) {
      const done = Math.max(0, hp0 - Math.max(0, tgt.hp));
      if (d0.ab === 'leech') u.hp = Math.min(u.mx, u.hp + done);
      if (d0.ab === 'thief') { const g2 = Math.round(done * 0.35); addGold(u.side, g2, u.m); if (S.st) S.st.gold[u.side] += g2; }
    }
  }
}

// vlastnosti bojiště – platí pro obě strany
const FIELD_FX = { swamp: { spd: 0.85, n: 'Bažina: všichni jsou o 15 % pomalejší' }, forest: { rng: 0.85, n: 'Les: střelci mají o 15 % menší dosah' },
  winter: { spd: 0.92, n: 'Sníh: všichni jsou o 8 % pomalejší' }, desert: { storm: 1, n: 'Poušť: písečné bouře občas zkrátí dosah střelců' },
  volcano: { lava: 1, n: 'Sopka: ze země občas vytryskne láva' }, meadow: { n: 'Louka: žádná omezení' } };
const fieldSpd = u => (FIELD_FX[S.field] || {}).spd || 1;
const fieldRng = () => ((FIELD_FX[S.field] || {}).rng || 1) * (S.storm > 0 ? 0.7 : 1);
function fieldTick(dt) {
  const F = FIELD_FX[S.field] || {};
  if (S.storm > 0) S.storm -= dt;
  if (F.storm && (S.stormT = (S.stormT ?? rnd(50, 80)) - dt) <= 0) { S.stormT = rnd(70, 110); S.storm = 12; S.ev.push([W / 2, 200, 'evt', 'storm']); }
  if (F.lava && (S.lavaT = (S.lavaT ?? rnd(30, 50)) - dt) <= 0) {
    S.lavaT = rnd(35, 60);
    const x = rnd(300, W - 300), a = Math.max(S.pl[0].age, S.pl[1].age);
    dmgSrc = 'u'; for (const u of S.units) if (!u.dead && Math.abs(u.x - x) < 55) hurt(u, AGES[a].sp.d * 0.8, -1);
    S.ev.push([x, GY - 6, 'lava']);
  }
}
function step(dt) {
  S.time += dt;
  if (S.over < 0) fieldTick(dt);
  if (S.surv && S.over < 0) survTick(dt);
  if (S.events && S.over < 0) {
    S.evT -= dt;
    if (S.evT <= 0) { S.evT = rnd(70, 120); battleEvent(); }
    if (S.dark > 0) S.dark = Math.max(0, S.dark - dt);
    if (S.trex) {                                      // rozdupe každého, koho potká – obě strany
      const R = S.trex; R.x += R.dir * 250 * dt;
      for (const u of S.units) if (!u.dead && !R.hit.includes(u.id) && Math.abs(u.x - R.x) < 45) { R.hit.push(u.id); hurt(u, u.mx * 2, -1); S.ev.push([u.x, GY - 30, 'hit']); }
      if (R.x < -200 || R.x > W + 200) S.trex = null;
    }
    if (S.chest) {                                     // truhlu sebere první jednotka, která k ní dojde
      const u = S.units.find(u => Math.abs(u.x - S.chest.x) < 16);
      if (u) { addGold(u.side, S.chest.g, u.m); S.ev.push([S.chest.x, GY - 30, 'chest', u.side, S.chest.g]); S.chest = null; }
    }
  }
  // fronty výroby + cooldown speciálu
  for (let s = 0; s < 2; s++) {
    const p = S.pl[s];
    if (p.spcd > 0) p.spcd = Math.max(0, p.spcd - dt);
    if (p.hcd > 0) p.hcd = Math.max(0, p.hcd - dt);
    if (p.pick > 0) p.pick = Math.max(0, p.pick - dt / (S.speed || 1));   // reálné sekundy i při 2×
    if (p.rgcd > 0) p.rgcd = Math.max(0, p.rgcd - dt);
    if (p.acd > 0) p.acd = Math.max(0, p.acd - dt);
    if (p.abl > 0) p.abl = Math.max(0, p.abl - dt);
    if (p.ab) for (let k = 0; k < ABIL.length; k++) {
      if (p.ab[k] > 0) p.ab[k] = Math.max(0, p.ab[k] - dt);
      if (p.abc[k] > 0) p.abc[k] = Math.max(0, p.abc[k] - dt * (p.sb ? p.sb.ab : 1));
    }
    if (p.ab && p.ab[3] > 0) for (const u of S.units) if (u.side === s && !u.dead && u.hp < u.mx) u.hp = Math.min(u.mx, u.hp + u.mx * 0.04 * dt);
    if (GB(p).cry) {                                  // generálův pokřik: každých 45 s armáda útočí o 30 % silněji
      p.cryC = (p.cryC ?? 30) - dt; if (p.cryT > 0) p.cryT -= dt;
      if (p.cryC <= 0) { p.cryC = 45; p.cryT = 8; S.ev.push([BX[s], GY - 120, 'gcry', s]); }
    }
    if (p.q.length) {
      const q = p.q[0], d = uDef(q.a, q.ty, q.f), bt = d.t * (facOf(s).build || 1) * GB(p).build * (p.sb ? p.sb.bld : 1);
      p.qt += dt;
      if (p.qt >= bt) {
        p.qt = bt;
        if (spawnFree(s, q.ty, q.a, q.m)) { spawn(s, q); p.q.shift(); p.qt = 0; }
      }
    }
  }

  // léčitelé: každou sekundu doplní zdraví spojencům kolem sebe
  for (const u of S.units) if (u.ty === 6 && !u.dead && (u.ht = (u.ht || 0) - dt) <= 0) {
    const d = uDefU(u);
    if (d.ab !== 'healer') { u.ht = 1e9; continue; }
    u.ht = 1;
    for (const a of S.units) if (a.side === u.side && !a.dead && a.hp < a.mx && Math.abs(a.x - u.x) < 140) a.hp = Math.min(a.mx, a.hp + a.mx * 0.03 + d.d * 0.15);
  }
  // statistiky bitvy: každých 5 s velikost armády, zlato a zabití
  if (S.st && (S.st.acc = (S.st.acc || 0) + dt) >= 5) {
    S.st.acc = 0; S.st.t.push(Math.round(S.time));
    for (let s = 0; s < 2; s++) {
      S.st.army[s].push(S.units.reduce((n, u) => n + (u.side === s ? uDefU(u).c : 0), 0));
      S.st.kills[s].push(S.pl[s].kills);
    }
  }
  const byId = new Map(S.units.map(u => [u.id, u]));
  const side = [[], []];
  for (const u of S.units) side[u.side].push(u);
  side[0].sort((a, b) => b.x - a.x);   // nejpřednější první
  side[1].sort((a, b) => a.x - b.x);

  // jednotky
  for (let s = 0; s < 2; s++) {
    const dir = s ? -1 : 1, F = side[s], E = side[1 - s];
    let fe = E.find(e => !e.dead);
    for (let i = 0; i < F.length; i++) {
      const u = F[i];
      if (u.dead) continue;
      if (fe && fe.dead) fe = E.find(e => !e.dead);
      if (u.stun > 0) { u.stun -= dt; u.st = 1; continue; }        // omráčený (řev tygra)
      const d = uDefU(u);
      if (u.ty === 5 && (u.bt = (u.bt ?? 7) - dt) <= 0) u.bt = bossSkill(u) ? rnd(11, 15) : 1;
      u.at = Math.max(0, u.at - dt * 3);
      u.cd = Math.max(0, u.cd - dt);
      const de = fe ? (fe.x - u.x) * dir - (u.w + fe.w) / 2 : 1e9;
      const db = (BF[1 - s] - u.x) * dir - u.w / 2;
      let tgt = null;
      const rr = d.r * (d.p ? fieldRng() : 1);
      if (fe && de <= rr) tgt = fe;
      else if (db <= rr && db <= de) tgt = 'base';
      // při ústupu se armáda seřadí do řady u základny (přední jednotka nejdál)
      const ord = S.pl[s].ord || 0, slot = RALLY + (F.length - 1 - i) * Math.min(26, 220 / F.length);
      const back = (u.x - (BX[s] + dir * slot)) * dir;
      u.back = 0;
      if (ord === 2 && back > 1) {                     // ústup ke shromaždišti u vlastní základny
        u.x -= Math.min(d.s * (facOf(s).spd || 1) * 1.25 * dt, back) * dir; u.st = 0; u.back = 1;
      } else if (tgt) {
        u.st = 2;
        if (u.cd <= 0) { u.cd = d.cd * (u.rage ? 0.8 : 1) * (abOn(s, 2) ? 0.77 : 1); u.at = 1; attack(u, d, tgt, dir); }
      } else {
        let mv = d.s * (facOf(s).spd || 1) * (u.rage ? 1.2 : 1) * (abOn(s, 2) ? 1.5 : 1) * (u.vm || 1) * fieldSpd(u) * dt;
        if (ord === 2) mv = 0;
        if (ord === 1) mv = Math.min(mv, (BX[s] + dir * HOLD - u.x) * dir);   // drž linii u věží
        for (let j = i - 1; j >= 0; j--) if (!F[j].dead) {
          mv = Math.min(mv, (F[j].x - u.x) * dir - (F[j].w + u.w) / 2 - 4); break;
        }
        mv = Math.min(mv, de - 1, db);
        if (mv > 0.05) { u.x += mv * dir; u.st = 0; } else u.st = 1;
      }
    }
  }

  // věže
  for (let s = 0; s < 2; s++) {
    const p = S.pl[s], fe = side[1 - s].find(e => !e.dead);
    if (p.turOff > 0) { p.turOff = Math.max(0, p.turOff - dt); continue; }   // věže hoří (dračí dech)
    p.tur.forEach((t, k) => {
      const d = AGES[t.a].turrets[t.i];
      t.cd = Math.max(0, t.cd - dt);
      if (fe && t.cd <= 0 && Math.abs(fe.x - BX[s]) <= d.r) {
        t.cd = d.cd;
        const o = slotPos(s, k);
        S.proj.push({ id: S.nid++, x: o.x, y: o.y, tid: fe.id, tx: fe.x, ty: GY - 22,
          d: d.d * atkMul(s) * (p.sb ? p.sb.tur : 1), side: s, p: d.p, sp: d.sp || 0, v: SPD[d.p], src: 't',
          arc: d.arc ? Math.min(130, Math.abs(fe.x - o.x) * 0.38) : 0 });   // arc u věže = střela letí obloukem
        S.ev.push([o.x + (s ? -12 : 12), o.y, 'muz', s, k]);       // s, k: která věž střílí (animace výstřelu)
      }
    });
  }

  // projektily
  for (const pr of S.proj) {
    if (pr.fall) {
      pr.x += pr.vx * dt; pr.y += pr.vy * dt; pr.dx = pr.vx; pr.dy = pr.vy;
      if (pr.y >= GY - 4) {
        pr.dead = 1; splash(pr.x, pr.sp, pr.d, pr.side, true);
        S.ev.push([pr.x, GY - 6, pr.p === 'beam' ? 'zap' : pr.p === 'arrow' ? 'hit' : 'boom']);
      }
      continue;
    }
    dmgSrc = pr.src || 'u'; dmgMem = pr.m ?? null;
    if (pr.tid >= 0) {
      const t = byId.get(pr.tid);
      if (t && !t.dead) { pr.tx = t.x; pr.ty = GY - unitY(t); } else pr.lost = 1;
    }
    const dx = pr.tx - pr.x, dy = pr.ty - pr.y, L = Math.hypot(dx, dy), st = pr.v * dt;
    pr.dx = dx; pr.dy = dy;
    if (L > st) {
      const vx0 = pr.x, vy0 = pr.y - (pr.h || 0);
      pr.x += dx / L * st; pr.y += dy / L * st;
      if (pr.arc) {                                   // vrhací stroje a hmoždíř: střela letí obloukem (jen vzhled, zásah se počítá stejně)
        pr.tr = (pr.tr || 0) + st; const t = pr.tr / (pr.tr + L - st); pr.h = 4 * pr.arc * t * (1 - t);
        pr.dx = pr.x - vx0; pr.dy = pr.y - pr.h - vy0;
      }
      continue;
    }
    pr.dead = 1;
    if (pr.sp) {
      splash(pr.tx, pr.sp, pr.d, pr.side);
      if (pr.tid === -1) hitBase(1 - pr.side, pr.d, pr.side);
      S.ev.push([pr.tx, pr.ty, pr.p === 'oil' ? 'oilsp' : 'boom']);
    } else {
      if (pr.tid === -1) hitBase(1 - pr.side, pr.d, pr.side);
      else if (!pr.lost) hurt(byId.get(pr.tid), pr.d, pr.side);
      if (!pr.lost || pr.tid === -1) S.ev.push([pr.tx, pr.ty, 'hit']);
    }
  }

  S.units = S.units.filter(u => !u.dead);
  S.proj = S.proj.filter(p => !p.dead);

  // podmínky výzev: přežít daný čas / vyhrát do časového limitu
  const M = S.mods;
  if (M && S.over < 0) {
    if (M.survive && S.time >= M.survive) S.over = 0;
    else if (M.limit && S.time >= M.limit) S.over = 1;
    // boss na konci věku: přijde po čase nebo když nepřátelská základna slábne
    const e = S.pl[1];
    if (M.boss != null && !S.boss && (S.time >= (M.survive ? M.survive * 0.45 : 240) || e.hp < e.mhp * 0.6)) {
      S.boss = 1; spawn(1, { a: M.boss, ty: 5 });
      S.ev.push([W / 2, 200, 'evt', 'boss', M.boss]); S.ev.push([W / 2, 200, 'roar']);
    }
    // finále: bossové všech věků jeden po druhém (první ve 2:30, pak každých 100 s)
    if (M.bossRush && (S.bossN || 0) < M.bossRush.length && S.time >= (S.bossT ?? 150)) {
      const a = M.bossRush[S.bossN || 0]; S.bossN = (S.bossN || 0) + 1; S.bossT = S.time + 100;
      spawn(1, { a, ty: 5 }); S.ev.push([W / 2, 200, 'evt', 'boss', a]); S.ev.push([W / 2, 200, 'roar']);
    }
  }
}
