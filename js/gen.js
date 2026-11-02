// =====================================================================
//  GENERÁL – strom dovedností, dobytá území, úkoly, skiny, výbava hrdinů a statistiky bitvy.
//  Bonusy platí jen proti počítači (online zůstává férové).
// =====================================================================
const GEN = load('aow-gen', { a: 0, o: 0, e: 0 });                    // úrovně větví (0–5)
const GEN_TREE = [
  { k: 'a', n: 'Armáda', ic: '⚔️', lv: ['Jednotky +5 % zdraví a útoku', 'Jednotky dalších +5 % zdraví a útoku', 'Jednotky o 6 % levnější', 'Hrdina +10 % zdraví a útoku',
    '📯 Válečný pokřik: každých 45 s útočí celá armáda 8 s o 30 % silněji'] },
  { k: 'o', n: 'Obrana', ic: '🏰', lv: ['Hradby +8 %', 'Věže o 8 % levnější', 'Hradby dalších +8 %', 'Věže dalších o 8 % levnější',
    '🛡 Poslední bašta: jednou za bitvu se základna pod 20 % zdraví zacelí na polovinu'] },
  { k: 'e', n: 'Hospodářství', ic: '💰', lv: ['+6 % zlata za zabití', '+25 % zlata na začátku bitvy', '+6 % zlata a XP za zabití', 'Výroba jednotek o 8 % rychlejší',
    '💎 Válečná kořist: těžké jednotky a bossové dávají dvojnásobek zlata'] },
];
// úroveň n stojí n bodů; body = úrovně profilu + hvězdy z kampaně + odměny z úkolů
const genSpent = () => ['a', 'o', 'e'].reduce((n, k) => n + GEN[k] * (GEN[k] + 1) / 2, 0);
const genPoints = () => (profLevel() - 1) + Object.values(CAMPS).reduce((a, b) => a + b, 0) + (QST.pts || 0);
const genFree = () => genPoints() - genSpent();

// území kampaně: každé dobyté dává malý trvalý bonus (neplatí, když je pod útokem)
const TERR = [
  { k: 'gold', v: 1.03, t: '+3 % zlata za zabití' }, { k: 'hp', v: 1.03, t: '+3 % zdraví jednotek' }, { k: 'dmg', v: 1.03, t: '+3 % útoku jednotek' },
  { k: 'build', v: 0.97, t: 'Výroba o 3 % rychlejší' }, { k: 'base', v: 1.05, t: 'Hradby +5 %' }, { k: 'dmg', v: 1.03, t: '+3 % útoku jednotek' },
  { k: 'sgold', v: 1.15, t: '+15 % zlata na začátku' }, { k: 'tur', v: 0.96, t: 'Věže o 4 % levnější' }, { k: 'hp', v: 1.03, t: '+3 % zdraví jednotek' },
  { k: 'build', v: 0.97, t: 'Výroba o 3 % rychlejší' }, { k: 'base', v: 1.05, t: 'Hradby +5 %' }, { k: 'gold', v: 1.04, t: '+4 % zlata za zabití' },
  { k: 'xp', v: 1.05, t: '+5 % XP za zabití' }, { k: 'cost', v: 0.97, t: 'Jednotky o 3 % levnější' }, { k: 'heroD', v: 1.1, t: 'Hrdina +10 % útoku' },
];
const WORLD = load('aow-world', { att: null, n: 0 });                   // att = území pod útokem Rudé hordy
const terrActive = () => CAMP.map((_, i) => i).filter(i => CAMPS[i] && WORLD.att !== i);
let curDef = null, defNext = null;                                     // probíhá obrana území
const defMission = i => { const m = CAMP[i], a = m.mods.age || 0;
  return { ...m, diff: Math.min(3, m.diff + 1), mods: { age: a || undefined, survive: 180, eGold: Math.round(AGE_GOLD[a] * 0.6) } }; };

// výbava hrdiny: výhry, kdy jsi skončil v daném věku → zbraň (2 výhry), zbroj (5), legendární (10)
const GEAR = load('aow-gear', { w: [0, 0, 0, 0, 0] });
const GEAR_N = ['⚔️ Zbraň', '🛡 Zbroj', '✨ Legendární kus'], GEAR_AT = [2, 5, 10];
const gearLv = a => GEAR_AT.filter(n => GEAR.w[a] >= n).length;
const gearMul = a => { const l = gearLv(a); return [(l >= 2 ? 1.2 : 1) * (l >= 3 ? 1.15 : 1), (l >= 1 ? 1.15 : 1) * (l >= 3 ? 1.15 : 1)]; };

function genBonus() {
  const b = { ...GB0 }, A = GEN.a, O = GEN.o, E = GEN.e;
  if (A >= 1) { b.hp *= 1.05; b.dmg *= 1.05; } if (A >= 2) { b.hp *= 1.05; b.dmg *= 1.05; } if (A >= 3) b.cost *= 0.94; if (A >= 4) { b.heroHp *= 1.1; b.heroD *= 1.1; } if (A >= 5) b.cry = 1;
  if (O >= 1) b.base *= 1.08; if (O >= 2) b.tur *= 0.92; if (O >= 3) b.base *= 1.08; if (O >= 4) b.tur *= 0.92; if (O >= 5) b.bastion = 1;
  if (E >= 1) b.gold *= 1.06; if (E >= 2) b.sgold *= 1.25; if (E >= 3) { b.gold *= 1.06; b.xp *= 1.06; } if (E >= 4) b.build *= 0.92; if (E >= 5) b.loot = 1;
  for (const i of terrActive()) { const t = TERR[i]; b[t.k] *= t.v; }
  b.gear = AGES.map((_, a) => gearMul(a));
  return b;
}
// použije se při startu hry proti počítači (hráč na straně 0)
function genApply(p) {
  const b = p.gb = genBonus();
  p.gold = Math.round(p.gold * b.sgold);
  p.mhp = Math.round(p.mhp * b.base); p.hp = Math.round(p.hp * b.base);
}

// ---------- panel generála ----------
function renderGen() {
  const free = genFree();
  $('genBody').innerHTML = `
    <div class="gen-pts"><b>${free}</b> volných bodů <small>(${genPoints()} celkem: úroveň profilu, hvězdy z kampaně a úkoly)</small></div>
    <div class="gen-tree">${GEN_TREE.map(B => `<div class="gen-br"><h3>${B.ic} ${B.n}</h3>${B.lv.map((t, i) => {
      const have = GEN[B.k] > i, next = GEN[B.k] === i, cost = i + 1;
      return `<button class="gen-n ${have ? 'have' : next && free >= cost ? 'can' : ''} ${i === 4 ? 'cap' : ''}" data-k="${B.k}" data-i="${i}" ${next && free >= cost ? '' : 'disabled'}>
        <span>${t}</span><small>${have ? '✔ získáno' : 'cena ' + cost + ' b.'}</small></button>`; }).join('')}</div>`).join('')}</div>
    <button id="bGenReset" class="ghost">↺ Rozdělit body znovu</button>
    <h3 class="gen-h">🗺 Bonusy dobytých území</h3>
    <div class="gen-terr">${CAMP.map((m, i) => `<span class="${CAMPS[i] ? (WORLD.att === i ? 'att' : 'on') : ''}">${m.ic} ${CAMPS[i] ? TERR[i].t : '<i>nedobyto</i>'}${WORLD.att === i ? ' ⚔ pod útokem' : ''}</span>`).join('')}</div>
    <h3 class="gen-h">🎖 Výbava hrdinů <small>(výhry, kdy jsi skončil v daném věku)</small></h3>
    <div class="gen-gear">${AGES.map((A, a) => `<div><b>${A.name}: ${HERO_N[a]}</b> <small>${GEAR.w[a]} výher</small><br>${GEAR_N.map((n, k) => `<span class="${gearLv(a) > k ? 'on' : ''}">${n}${gearLv(a) > k ? '' : ' (' + GEAR_AT[k] + ')'}</span>`).join(' ')}</div>`).join('')}</div>
    <p class="muted">Zbraň: hrdina +15 % útoku · Zbroj: +20 % zdraví · Legendární kus: dalších +15 % obojího. Všechny bonusy platí jen proti počítači.</p>`;
  document.querySelectorAll('#genBody .gen-n').forEach(b => b.onclick = () => { const k = b.dataset.k; if (GEN[k] === +b.dataset.i && genFree() >= GEN[k] + 1) { GEN[k]++; store('aow-gen', GEN); sfx('up'); if (GEN[k] === 5) achId('gen5'); if (GEN.a + GEN.o + GEN.e === 15) achId('genAll'); renderGen(); } });
  $('bGenReset').onclick = () => { GEN.a = GEN.o = GEN.e = 0; store('aow-gen', GEN); sfx('click'); renderGen(); };
}
$('bGen').onclick = () => { renderGen(); openPanel('genPanel'); };

// ---------- denní a týdenní úkoly ----------
const QST = load('aow-quest', { day: '', d: [], week: '', w: null, pts: 0, done: 0 });
const QDEF = {
  win: { n: k => `Vyhraj ${k} ${k < 5 ? 'hry' : 'her'}`, f: r => r.won ? 1 : 0, k: [2, 3], wk: 10 },
  kills: { n: k => `Zabij ${k} nepřátel`, f: r => r.kills, k: [100, 200], wk: 1500 },
  tur: { n: k => `Postav ${k} věží`, f: r => r.built, k: [4, 7], wk: 40 },
  spec: { n: k => `Vyrob ${k} speciálních jednotek`, f: r => r.spec, k: [3, 6], wk: 30 },
  age: { n: k => `Dožij se v bitvě věku ${AGES[k].name}`, f: (r, k) => r.age >= k ? k : 0, k: [2, 3], set: 1 },
  fac: { n: k => `Vyhraj za národ ${AGEFAC[(k / 4) | 0][k % 4].ic} ${AGEFAC[(k / 4) | 0][k % 4].n}`, f: (r, k) => r.won && r.fac === k ? k + 1 : 0, set: 1, eq: 1 },
  online: { n: k => `Odehraj ${k} ${k < 2 ? 'hru' : 'hry'} s kámoši`, f: r => r.online ? 1 : 0, k: [1, 2], wk: 8 },
  stars: { n: k => `Získej ${k} ${k < 5 ? 'hvězdy' : 'hvězd'} v kampani`, f: r => r.stars, k: [2, 3], wk: 12 },
};
const weekKey = () => { const d = new Date(), j = new Date(d.getFullYear(), 0, 1); return d.getFullYear() + '-' + Math.ceil(((d - j) / 864e5 + j.getDay() + 1) / 7); };
function questRoll() {
  const dk = dayKey(), wk = weekKey();
  if (QST.day !== dk) {
    const r = seeded(dk + SET.pid), ids = Object.keys(QDEF).filter(i => i !== 'online' || ST.vs && Object.keys(ST.vs).length), pick = [];
    while (pick.length < 3) { const id = ids[(r() * ids.length) | 0]; if (!pick.includes(id)) pick.push(id); }
    QST.d = pick.map(id => { const D = QDEF[id]; const k = id === 'fac' ? (r() * 20) | 0 : D.k[(r() * D.k.length) | 0]; return { id, k, p: 0, ok: 0 }; });
    QST.day = dk;
  }
  if (QST.week !== wk) {
    const r = seeded(wk + SET.pid), ids = Object.keys(QDEF).filter(i => QDEF[i].wk && (i !== 'online' || Object.keys(ST.vs || {}).length)), id = ids[(r() * ids.length) | 0];
    QST.w = { id, k: QDEF[id].wk, p: 0, ok: 0 }; QST.week = wk;
  }
  store('aow-quest', QST);
}
const qGoal = q => QDEF[q.id].eq ? q.k + 1 : q.k;
// výsledek bitvy → postup v úkolech
function questTrack(r) {
  questRoll();
  for (const [q, rew] of [...QST.d.map(q => [q, 1]), [QST.w, 3]]) {
    if (!q || q.ok) continue;
    const D = QDEF[q.id], v = D.f(r, q.k);
    q.p = D.set ? Math.max(q.p, v) : q.p + v;
    if (q.p >= qGoal(q)) {
      q.ok = 1; QST.pts += rew; QST.done++;
      achId('q1'); if (QST.done >= 25) achId('q25');
      toasts.push({ a: { n: D.n(q.k) + ` · +${rew} ${rew === 1 ? 'bod' : 'body'} generála` }, h: '✅ ÚKOL SPLNĚN', l: 4 });
      const sk = SKINS.find(s => s.need === QST.done);
      if (sk) toasts.push({ a: { n: 'Nový skin armády: ' + sk.n }, h: '🎨 ODEMČENO', l: 4 });
    }
  }
  store('aow-quest', QST);
}
function renderQuest() {
  questRoll();
  const row = (q, rew) => { const D = QDEF[q.id], g = qGoal(q), p = Math.min(g, q.p), pct = Math.round(p / g * 100);
    return `<div class="q-row ${q.ok ? 'ok' : ''}"><span>${q.ok ? '✅' : '▫️'} ${D.n(q.k)}</span><small>${D.eq || D.set ? (q.ok ? 'splněno' : 'zatím ne') : p + ' / ' + g} · odměna ${rew} b.</small><i style="width:${pct}%"></i></div>`; };
  $('questBody').innerHTML = `
    <h3>📅 Dnešní úkoly <small>(nové každý den)</small></h3>${QST.d.map(q => row(q, 1)).join('')}
    <h3>🗓 Týdenní úkol</h3>${row(QST.w, 3)}
    <p class="muted">Splněno celkem: <b>${QST.done}</b> úkolů · získáno ${QST.pts} bodů generála.</p>
    <h3>🎨 Skiny armády <small>(odemykají se splněnými úkoly)</small></h3>
    <div class="skins">${SKINS.map((s, i) => { const lock = QST.done < s.need; return `<button class="skin ${(SET.skin || 0) === i ? 'on' : ''} ${lock ? 'locked' : ''}" data-i="${i}">
      <span class="sw" style="background:${s.col ? `linear-gradient(135deg,${s.col[2]},${s.col[0]},${s.col[1]})` : '#334155'}"></span>${s.n}<small>${lock ? '🔒 ' + s.need + ' úkolů' : s.d}</small></button>`; }).join('')}</div>`;
  document.querySelectorAll('#questBody .skin').forEach(b => b.onclick = () => { const i = +b.dataset.i; if (QST.done < SKINS[i].need) return; SET.skin = i; saveSet(); TEAMC.clear(); sfx('click'); if (i) achId('skin'); if (SKINS[i].sk) achId('skel'); renderQuest(); });
}
$('bQuest').onclick = () => { renderQuest(); openPanel('questPanel'); };

// skiny: přebarví vlastní armádu (soupeř je vidí také, posílají se v pozdravu)
const SKINS = [
  { n: 'Výchozí', need: 0, d: 'barva armády podle profilu' },
  { n: 'Zlatá garda', need: 3, d: 'zlaté brnění', col: ['#eab308', '#854d0e', '#fde047'] },
  { n: 'Maskáč', need: 6, d: 'vojenská zeleň', col: ['#55663a', '#2a331a', '#8a9a5e'] },
  { n: 'Kostlivci', need: 10, d: 'nemrtvá armáda', col: ['#d6d0bf', '#3a3530', '#f5f1e6'], sk: ['#e7e2d3', '#b9b2a0', '#fffaf0'] },
  { n: 'Neon', need: 15, d: 'zářivá budoucnost', col: ['#22d3ee', '#0e7490', '#a5f3fc'] },
  { n: 'Krvaví', need: 20, d: 'pro opravdové brutály', col: ['#991b1b', '#450a0a', '#ef4444'] },
];

// ---------- výsledek bitvy (volá record) ----------
function genRecord(won, V) {
  const me = V.pl[mySide], online = role !== 'solo' && !coop;
  if (won && (role === 'solo' || coop)) { GEAR.w[me.age]++; store('aow-gear', GEAR); if (GEAR_AT.includes(GEAR.w[me.age])) achId('gear'), toasts.push({ a: { n: `${HERO_N[me.age]}: ${GEAR_N[GEAR_AT.indexOf(GEAR.w[me.age])]}` }, h: '🎖 VÝBAVA HRDINY', l: 4 }); }
  questTrack({ won, kills: me.kills, built: me.built, age: me.age, online: role !== 'solo', stars: V.camp != null && curDef == null ? lastStars : 0,
    spec: S && S.st ? S.st.spec[mySide] : 0, fac: me.age * 4 + ((me.af && me.af[me.age]) | 0) });
  // Rudá horda občas zaútočí na dobyté území
  if (role === 'solo' && !online) {
    const held = terrActive();
    WORLD.n++;
    if (WORLD.att == null && held.length >= 2 && WORLD.n >= 3 && Math.random() < 0.5) {
      WORLD.att = held[(Math.random() * held.length) | 0]; WORLD.n = 0;
      toasts.push({ a: { n: CAMP[WORLD.att].n + ' – ubraň ho v Kampani!' }, h: '⚔ RUDÁ HORDA ÚTOČÍ', l: 5 });
    }
    store('aow-world', WORLD);
  }
  setTimeout(cloudAuto, 1500);
}
// po každé hře se postup sám zálohuje do cloudu (když má hráč kód zálohy)
function cloudAuto() { if (typeof CLOUD !== 'undefined' && CLOUD.code) cloudBackup(true).catch(() => {}); }
// obrana území skončila
function defResult(won) {
  lastStars = 0;
  if (won) { achId('def'); WORLD.att = null; store('aow-world', WORLD); toasts.push({ a: { n: CAMP[curDef].n + ' – bonus zase platí' }, h: '🛡 ÚZEMÍ UBRÁNĚNO', l: 4 }); }
}

// ---------- statistiky bitvy ----------
let lastBst = null;
const newBst = () => ({ t: [0], army: [[0], [0]], kills: [[0], [0]], dmg: [{ u: 0, t: 0, s: 0, h: 0, b: 0 }, { u: 0, t: 0, s: 0, h: 0, b: 0 }], made: [0, 0], gold: [0, 0], spec: [0, 0] });
function renderBst() {
  const B = lastBst; if (!B) return;
  achId('stats');
  const me = mySide, op = 1 - me, names = [SET.name || 'Ty', role === 'solo' ? 'Počítač' : OPP.n || 'Soupeř'];
  const col = [teamCol(me)[0], teamCol(op)[0]];
  const row = (n, a, b) => `<tr><td>${n}</td><td>${(a | 0).toLocaleString('cs')}</td><td>${(b | 0).toLocaleString('cs')}</td></tr>`;
  const dm = k => row({ u: 'Škoda jednotkami', t: 'Škoda věžemi', s: 'Škoda speciálem', h: 'Škoda hrdinou', b: 'Škoda základně' }[k], B.dmg[me][k], B.dmg[op][k]);
  $('bstBody').innerHTML = `
    <div class="bst-legend"><span style="color:${col[0]}">■ ${esc(names[0])}</span><span style="color:${col[1]}">■ ${esc(names[1])}</span></div>
    <canvas id="bstChart" width="720" height="240"></canvas>
    <table class="bst"><tr><th></th><th>${esc(names[0])}</th><th>${esc(names[1])}</th></tr>
      ${row('Zabito nepřátel', B.kills[me].at(-1), B.kills[op].at(-1))}${row('Vyrobeno jednotek', B.made[me], B.made[op])}
      ${row('Zlato za zabití', B.gold[me], B.gold[op])}${['u', 't', 's', 'h', 'b'].map(dm).join('')}</table>`;
  const cv2 = $('bstChart'), g = cv2.getContext('2d'), Wc = cv2.width, Hc = cv2.height, pad = 34;
  g.fillStyle = '#0f1522'; g.fillRect(0, 0, Wc, Hc);
  const n = B.t.length, maxT = Math.max(1, B.t[n - 1]), maxA = Math.max(1, ...B.army[0], ...B.army[1]);
  g.strokeStyle = '#263046'; g.fillStyle = '#94a3b8'; g.font = '11px system-ui';
  for (let k = 0; k <= 4; k++) { const y = pad + (Hc - pad * 2) * k / 4; g.beginPath(); g.moveTo(pad, y); g.lineTo(Wc - 10, y); g.stroke(); }
  g.fillText('Síla armády (cena živých jednotek)', pad, 16); g.fillText(fmtTime(maxT), Wc - 40, Hc - 10); g.fillText('0:00', pad, Hc - 10);
  [me, op].forEach((s, i) => {
    g.strokeStyle = col[i]; g.lineWidth = 3; g.beginPath();
    B.army[s].forEach((v, k) => { const x = pad + (Wc - pad - 10) * B.t[k] / maxT, y = Hc - pad - (Hc - pad * 2) * v / maxA; k ? g.lineTo(x, y) : g.moveTo(x, y); });
    g.stroke();
  });
}
$('bBstClose') && ($('bBstClose').onclick = () => $('bstPanel').classList.add('hidden'));

// ---------- den a noc během delší bitvy (jen vzhled) ----------
// cyklus 8 minut: den, soumrak, noc, svítání; vojáci v noci svítí pochodněmi a laserovými zbraněmi
function nightK(t) {
  if (SET.daynight === false || WX.night) return 0;
  const p = (t % 480) / 480;
  return p < 0.45 ? 0 : p < 0.55 ? (p - 0.45) / 0.1 : p < 0.9 ? 1 : 1 - (p - 0.9) / 0.1;
}
function drawNight() {
  tipTick();
  const k = nightK(V.time) * 0.55; if (k <= 0.01) return;
  c.fillStyle = `rgba(8,12,40,${k})`; c.fillRect(0, 0, W, H);
  if (GFXL === 0) return;
  const op = c.globalCompositeOperation; c.globalCompositeOperation = 'lighter';
  for (const u of V.units) {
    const x = MX(u.x), warm = u.a < 3;
    c.fillStyle = rg(warm ? 'torchL' : 'laserL', 0, 0, 0, 1, warm ? [[0, 'rgba(255,170,70,.55)'], [1, 'rgba(255,120,30,0)']] : [[0, 'rgba(120,200,255,.5)'], [1, 'rgba(60,120,255,0)']]);
    c.save(); c.translate(x, GY - 40); c.scale(60 * k + 20, 50 * k + 16); c.globalAlpha = Math.min(1, k * 1.6); circ(0, 0, 1); c.restore();
  }
  for (const s of [0, 1]) { c.fillStyle = rg('baseL', 0, 0, 0, 1, [[0, 'rgba(255,190,90,.5)'], [1, 'rgba(255,140,40,0)']]); c.save(); c.translate(MX(BX[s]), GY - 90); c.scale(130, 110); c.globalAlpha = k * 1.5; circ(0, 0, 1); c.restore(); }
  c.globalAlpha = 1; c.globalCompositeOperation = op;
}
// písečná bouře na poušti
function drawStorm() {
  if (!V.storm) return;
  c.fillStyle = 'rgba(214,170,100,.32)'; c.fillRect(0, HUD, W, H - HUD);
  c.strokeStyle = 'rgba(240,210,150,.5)'; c.lineWidth = 1.5;
  for (let i = 0; i < 60; i++) { const y = HUD + ((i * 97) % (H - HUD)), x = ((T * 600 + i * 173) % (W + 200)) - 100; c.beginPath(); c.moveTo(x, y); c.lineTo(x - 40, y + 4); c.stroke(); }
}

// ---------- tipy pro nové věci (každý se ukáže jen jednou) ----------
const TIPS = load('aow-tips', {});
function tip(id, text) {
  if (TIPS[id] || tut) return;
  TIPS[id] = 1; store('aow-tips', TIPS);
  toasts.push({ a: { n: text }, h: 'TIP', l: 8, tip: 1 });
}
$('bSP').addEventListener('click', () => {
  tip('gen', '🎖 Generál: body za úrovně profilu, hvězdy a úkoly rozděl do stromu dovedností – armáda bude silnější.');
  tip('quest', '✅ Úkoly: každý den tři nové a jeden týdenní. Odměnou jsou body generála a skiny armády.');
});
$('bCamp').addEventListener('click', () => tip('terr', '🗺 Každé dobyté území dává trvalý bonus. Když na něj Rudá horda zaútočí (⚔), ubraň ho.'));
$('bMP').addEventListener('click', () => tip('mpNew', '🌍 Online žebříček, emoty v chatu a 👁 divácký režim – zadej kód hry a klikni na oko.'));
function tipTick() {
  if (!V || !role || replay || V.over >= 0) return;
  if (V.time > 3) tip('spec', '⭐ Každý národ má speciální jednotku se zlatou šerpou – tlačítko je hned za těžkou jednotkou.');
  if (V.time > 3 && FIELD !== 'meadow' && FIELD_FX[FIELD]) tip('field-' + FIELD, '🗺 ' + FIELD_FX[FIELD].n + '.');
  if (nightK(V.time) > 0.5) tip('night', '🌙 Padla noc – je to jen vzhled, bojuje se úplně stejně.');
  if (V.units.some(u => u.ty === 5)) tip('boss', '👹 Boss! Má obrovské zdraví – soustřeď na něj věže, hrdinu a speciální útok.');
}

// ---------- emoty (online) ----------
const EMOTES = ['😂', '💀', '🔥', '👑', '🤡', '😭'];
let emotes = [];
function showEmote(side, i) {
  const e = i === 6 ? '🖕' : EMOTES[i]; if (!e) return;
  emotes.push({ side, e, l: 2.2 }); sfx('click');
}
function sayEmote(i) {
  const now = performance.now(); if (now - chatLast < 900) return;
  chatLast = now; chatOpen = false;
  send({ t: 'emo', i, side: mySide }); showEmote(mySide, i);
  achId(i === 6 ? 'finger' : 'emote');
}
function drawEmotes(dt) {
  for (const m of emotes) {
    m.l -= dt;
    const p = 1 - m.l / 2.2, x = MX(BX[m.side]) + (m.side === mySide ? 1 : -1) * (mirror ? -1 : 1) * 30, y = GY - 200 - p * 90;
    c.globalAlpha = Math.min(1, m.l * 2); c.font = `${48 + Math.sin(p * Math.PI) * 26}px system-ui`; c.textAlign = 'center';
    c.save(); c.translate(x, y); c.rotate(Math.sin(T * 9) * 0.15); c.fillText(m.e, 0, 0); c.restore(); c.globalAlpha = 1;
  }
  emotes = emotes.filter(m => m.l > 0);
}
