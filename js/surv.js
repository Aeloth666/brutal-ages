// =====================================================================
//  NEKONEČNÉ PŘEŽITÍ – vlny nepřátel, každá silnější; každá 10. vlna přivede bosse.
//  Nepřátelská základna je nezničitelná, počítač nestaví – jde jen o to vydržet co nejdéle.
// =====================================================================
const SURV = { n: 'Nekonečné přežití', diff: 1, mods: { endless: 1 } };
const SURVB = load('aow-surv', { best: 0, t: 0 });
let survNext = false, curSurv = false;

// simulace (volá step): odpočet do další vlny a postupné vypouštění nepřátel
function survTick(dt) {
  const V2 = S.surv, e = S.pl[1];
  V2.t -= dt;
  const alive = S.units.some(u => u.side === 1);
  if (!alive && !V2.pend.length && V2.t > 6 && V2.wave > 0) V2.t = 6;          // vyčištěno → další vlna dřív
  if (V2.t <= 0) {
    V2.wave++; V2.t = 30;
    const w = V2.wave, a = Math.min(4, Math.floor((w - 1) / 5));
    if (a > e.age) { e.age = a; e.hp = e.mhp = AGES[a].baseHp * 3; }
    e.af = e.af || [0, 0, 0, 0, 0];
    const n = 3 + Math.floor(w * 1.2);
    for (let i = 0; i < n; i++) {
      const r = Math.random(), heavy = Math.min(0.35, 0.08 + w * 0.012);
      V2.pend.push(r < heavy ? 2 : r < heavy + 0.06 ? 6 : r < 0.6 ? 0 : 1);
    }
    if (w % 10 === 0) V2.pend.push(5);
    S.ev.push([W / 2, 200, 'evt', 'wave', w]);
  }
  if (V2.pend.length && (V2.st = (V2.st || 0) - dt) <= 0) {
    const ty = V2.pend[0], a = e.age;
    if (spawnFree(1, ty === 5 ? 2 : ty)) {
      V2.pend.shift(); V2.st = ty === 2 ? 1.4 : 0.7;
      spawn(1, { a, ty, f: (Math.random() * 4) | 0 });
      const u = S.units[S.units.length - 1], m = 1 + V2.wave * 0.05;   // vlny sílí i uvnitř věku
      u.mx = u.hp = Math.round(u.hp * m);
    }
  }
}
function survStart() { S.surv = { wave: 0, t: 12, pend: [] }; const e = S.pl[1]; e.hp = e.mhp = AGES[0].baseHp * 3; S.pl[0].gold = 300; }
// konec hry: rekord do telefonu a do online žebříčku
function survEnd(V) {
  const w = Math.max(0, V.surv - 1);
  if (w > SURVB.best) { SURVB.best = w; SURVB.t = Math.round(V.time); store('aow-surv', SURVB); toasts.push({ a: { n: `${w} ${w === 1 ? 'vlna' : w < 5 ? 'vlny' : 'vln'}` }, h: '♾ NOVÝ REKORD', l: 4 }); }
  if (typeof survPush === 'function') survPush();
}
$('bSurv').onclick = () => { $('spPanel').classList.add('hidden'); cleanupNet(); survNext = true; startGame('solo'); };
