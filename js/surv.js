// =====================================================================
//  NEKONEČNÉ PŘEŽITÍ – vlny nepřátel, každá silnější; každá 10. vlna přivede bosse (od 25. vlny každá 5.).
//  Po dosažení budoucnosti (vlna 21+) roste síla nepřátel exponenciálně – dřív nebo později padne každý.
//  Nepřátelská základna je nezničitelná, počítač nestaví – jde jen o to vydržet co nejdéle.
// =====================================================================
const SURV = { n: 'Nekonečné přežití', diff: 1, mods: { endless: 1 } };
const SURVB = load('aow-surv', { best: 0, t: 0 });
let survNext = false, curSurv = false;
// po každé 10. vlně si hráč vybere jeden ze tří bonusů (sčítají se); bez volby do 15 s se vezme první
const SBON = [
  { ic: '💰', n: 'Kořist', d: '+25 % zlata za zabití', f: p => { p.gm *= 1.25; } },
  { ic: '⚔️', n: 'Ostré zbraně', d: 'Jednotky útočí o 15 % silněji', f: p => { p.sb.dmg *= 1.15; } },
  { ic: '🛡️', n: 'Zbroj', d: 'Jednotky mají o 15 % víc zdraví', f: p => { p.sb.hp *= 1.15; } },
  { ic: '⏱️', n: 'Výcvik', d: 'Výroba jednotek o 15 % rychlejší', f: p => { p.sb.bld *= 0.85; } },
  { ic: '🏹', n: 'Opevnění', d: 'Věže útočí o 30 % silněji', f: p => { p.sb.tur *= 1.3; } },
  { ic: '✨', n: 'Nabití', d: 'Schopnosti armády se nabíjí o 25 % rychleji', f: p => { p.sb.ab *= 1.25; } },
  { ic: '🧱', n: 'Nové hradby', d: 'Základna má o 30 % víc zdraví a opraví se', f: p => { p.mhp = Math.round(p.mhp * 1.3); p.hp = p.mhp; } },
  { ic: '🪙', n: 'Poklad', d: 'Hned dostaneš zlato podle věku', f: p => { p.gold += [400, 2000, 7000, 25000, 80000][p.age]; } },
];
const SB0 = () => ({ dmg: 1, hp: 1, bld: 1, tur: 1, ab: 1 });
const sbOf = p => p.sb || SB0();
function survPickBon(i) {
  const V2 = S.surv; if (!V2 || !V2.pick) return;
  const k = V2.pick[Math.min(V2.pick.length - 1, Math.max(0, i | 0))], p = S.pl[0];
  p.sb = p.sb || SB0(); SBON[k].f(p); V2.got.push(k); V2.pick = null;
  S.ev.push([BX[0] + 200, GY - 140, 'sbon', 0, k]);
}

// simulace (volá step): odpočet do další vlny a postupné vypouštění nepřátel
function survTick(dt) {
  const V2 = S.surv, e = S.pl[1];
  V2.t -= dt;
  if (V2.pick && (V2.pt -= dt / (S.speed || 1)) <= 0) survPickBon(0);
  const alive = S.units.some(u => u.side === 1);
  if (!alive && !V2.pend.length && V2.t > 6 && V2.wave > 0) V2.t = 6;          // vyčištěno → další vlna dřív
  if (V2.t <= 0) {
    V2.wave++; V2.t = 30;
    const w = V2.wave, a = Math.min(4, Math.floor((w - 1) / 5));
    if (a > e.age) { e.age = a; e.hp = e.mhp = AGES[a].baseHp * 3; }
    e.af = e.af || [0, 0, 0, 0, 0];
    const n = Math.min(36, 3 + Math.floor(w * 1.2));
    for (let i = 0; i < n; i++) {
      const r = Math.random(), heavy = Math.min(0.35, 0.08 + w * 0.012), sup = a === 4 ? Math.min(0.12, (w - 20) * 0.004) : 0;
      V2.pend.push(r < sup ? 3 : r < sup + heavy ? 2 : r < sup + heavy + 0.06 ? 6 : r < 0.6 ? 0 : 1);
    }
    // boss jde hned za prvními dvěma vojáky (ne až na konci vlny); později jich chodí víc
    const nb = w % 10 === 0 ? 1 + Math.floor(Math.max(0, w - 10) / 30) : w >= 25 && w % 5 === 0 ? 1 : 0;
    for (let b = 0; b < nb; b++) V2.pend.splice(Math.min(2 + b * 3, V2.pend.length), 0, 5);
    S.ev.push([W / 2, 200, 'evt', 'wave', w]);
    if (w > 1 && (w - 1) % 10 === 0) {                 // po bossovi: výběr bonusu
      const all = SBON.map((_, k) => k); V2.pick = [];
      while (V2.pick.length < 3) V2.pick.push(all.splice((Math.random() * all.length) | 0, 1)[0]);
      V2.pt = 15;
    }
  }
  if (V2.pend.length && (V2.st = (V2.st || 0) - dt) <= 0) {
    const ty = V2.pend[0], a = e.age;
    if (spawnFree(1, ty === 5 ? 2 : ty)) {
      V2.pend.shift(); V2.st = (ty === 2 || ty === 5 ? 1.4 : 0.7) * Math.max(0.5, 1 - V2.wave * 0.006);
      spawn(1, { a, ty, f: (Math.random() * 4) | 0 });
      const u = S.units[S.units.length - 1], w = V2.wave, over = Math.max(0, w - 20);
      u.mx = u.hp = Math.round(u.hp * (1 + w * 0.05) * Math.pow(1.055, over));   // vlny sílí i uvnitř věku, v budoucnosti rychleji
      if (over) u.sm = 1 + over * 0.045;                                         // a víc bolí
    }
  }
}
function survStart() { S.surv = { wave: 0, t: 12, pend: [], pick: null, got: [] }; const e = S.pl[1]; e.hp = e.mhp = AGES[0].baseHp * 3; S.pl[0].gold = 300; }
// konec hry: rekord do telefonu a do online žebříčku
function survEnd(V) {
  const w = Math.max(0, V.surv - 1);
  if (w > SURVB.best) { SURVB.best = w; SURVB.t = Math.round(V.time); store('aow-surv', SURVB); toasts.push({ a: { n: `${w} ${w === 1 ? 'vlna' : w < 5 ? 'vlny' : 'vln'}` }, h: '♾ NOVÝ REKORD', l: 4 }); }
  if (typeof survPush === 'function') survPush();
}
$('bSurv').onclick = () => { $('spPanel').classList.add('hidden'); cleanupNet(); survNext = true; startGame('solo'); };
