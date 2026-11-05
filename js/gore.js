// =====================================================================
//  BRUTÁLNÍ REŽIM – jen vzhled: krev, useknuté hlavy a končetiny, kaluže
// =====================================================================
let pools = [];
function addPool(x, r) {
  const X = EXTREME();
  pools.push({ x, r: 0, mr: r * (X ? 2 : 1), l: X ? 60 : 22, ml: X ? 60 : 22 });
  if (pools.length > (X ? 200 : 90)) pools.shift();
}
function drawPools(dt) {
  if (!pools.length) return;
  for (const p of pools) {
    p.l -= dt; p.r = Math.min(p.mr, p.r + dt * p.mr * 3);
    c.globalAlpha = Math.min(1, p.l / 4) * 0.85;
    c.fillStyle = '#6b0b0b'; ell(MX(p.x), GY + 3, p.r * 1.9, p.r * 0.42);
    c.fillStyle = '#a3141480'; ell(MX(p.x) - p.r * 0.4, GY + 2.4, p.r, p.r * 0.2);
  }
  c.globalAlpha = 1;
  pools = pools.filter(p => p.l > 0);
}
// krvavé cákance „na skle“ – stečou a vyblednou (jen EXTREME)
let splats = [], bloodCode = null, bloodCodeUsed = false;
// nápověda k tajemství: na zemi se objeví krví napsaný kód (jen s Brutalem, jednou za hru)
function drawBloodCode(dt) {
  const B = bloodCode; B.l -= dt;
  const a = Math.min(1, (B.ml - B.l) * 1.2, B.l / 2), run = Math.min(1, (B.ml - B.l) / 4), y0 = GY + 52;
  // písmena křivě, různě velká a tmavá, napůl vsáklá do hlíny – přečte to jen ten, kdo se zadívá
  if (!B.lt) B.lt = 'BRUTL'.split('').map((ch, i) => ({ ch, dx: -44 + i * 21 + rnd(-3, 3), dy: rnd(-5, 5), rot: rnd(-0.32, 0.32), sz: rnd(22, 31), al: rnd(0.38, 0.62), cut: rnd(0.25, 0.6), ca: rnd(0, Math.PI * 2) }));
  c.save(); c.textAlign = 'center'; c.textBaseline = 'middle';
  for (const L of B.lt) {
    c.save(); c.translate(B.x + L.dx, y0 + L.dy); c.rotate(L.rot);
    c.globalAlpha = a * L.al; c.font = `900 ${L.sz | 0}px system-ui`;
    c.fillStyle = '#4a0606'; c.fillText(L.ch, 1.5, 1.5);
    c.fillStyle = '#7a0d0d'; c.fillText(L.ch, 0, 0);
    // kus písmene vsáklý do země
    c.globalAlpha = a * 0.75; c.fillStyle = FIELDS[FIELD].gnd[1];
    c.save(); c.rotate(L.ca); c.fillRect(-L.sz * 0.5, L.sz * (0.5 - L.cut), L.sz, L.sz * 0.13); c.restore();
    c.restore();
  }
  // rozmazané šmouhy a skvrny přes nápis
  c.globalAlpha = a * 0.55; c.fillStyle = '#6b0b0b';
  for (let i = 0; i < 9; i++) { const k = (i * 37) % 11 / 11; ell(B.x - 52 + i * 13 + k * 6, y0 - 6 + k * 14, 4 + k * 7, 1.6 + k * 2); }
  c.globalAlpha = a * 0.7;
  for (let i = 0; i < 5; i++) { const dx = -40 + i * 22 + (i % 2) * 5, h = (5 + (i * 7) % 9) * run; rr(B.x + dx - 1.2, y0 + 8, 2.4, h, 1.2); c.fill(); circ(B.x + dx, y0 + 8 + h, 1.9); }
  c.restore();
  if (B.l <= 0) { bloodCode = null; bloodCodeUsed = true; }
}
// ---------- tajemství: klepnutí na krvavý nápis odvede ke zlatému vejci ----------
// vejce se jednou za 4 s zaleskne; klepnutím na něj se otevře a odemkne se tajný znak (proti počítači hra mezitím stojí)
let eggScene = null;
const bloodCodeHit = (x, y) => bloodCode && bloodCode.l > 0 && Math.abs(x - bloodCode.x) < 70 && Math.abs(y - (GY + 52)) < 34;
function eggStart() { eggScene = { t0: performance.now(), x0: bloodCode.x, y0: GY + 52 }; bloodCode = null; bloodCodeUsed = true; sfx('evt'); vib(40); }
const eggT = () => (performance.now() - eggScene.t0) / 1000;
// cesta vejce: vynoří se z nápisu a přeletí doprostřed obrazovky
function eggPos() { const k = Math.min(1, eggT() / 1.4), e = k * k * (3 - 2 * k); return [lerp(eggScene.x0, W / 2, e), lerp(eggScene.y0, H * 0.56, e), lerp(0.5, 2.8, e)]; }
const eggClose = () => ({ x: W - 62, y: HUD + 14, w: 46, h: 40 });
function eggPath(open) {
  c.beginPath(); c.moveTo(0, -22); c.bezierCurveTo(13, -22, 17, -2, 16, 7); c.bezierCurveTo(15, 19, -15, 19, -16, 7); c.bezierCurveTo(-17, -2, -13, -22, 0, -22); c.closePath();
}
function drawEggScene() {
  const E = eggScene, t = eggT(), [x, y, s] = eggPos(), done = E.done ? t - E.done : -1;
  c.save();
  c.globalAlpha = Math.min(0.9, t * 1.3); c.fillStyle = '#05030a'; c.fillRect(0, 0, W, H);
  c.globalAlpha = Math.min(1, t * 1.6);
  const R = 60 + 50 * s, g = c.createRadialGradient(x, y, 6, x, y, R);
  g.addColorStop(0, `rgba(255,214,110,${done >= 0 ? 0.75 : 0.32})`); g.addColorStop(1, 'rgba(255,214,110,0)'); c.fillStyle = g; circ(x, y, R);
  c.translate(x, y); c.scale(s, s);
  // hnízdo z hlíny a kostí
  c.fillStyle = '#3b2412'; c.beginPath(); c.ellipse(0, 16, 26, 7, 0, 0, Math.PI * 2); c.fill();
  c.strokeStyle = '#e7dcc4'; c.lineWidth = 1.6; c.lineCap = 'round'; for (const [a, b] of [[-22, -6], [10, 22], [-12, 6]]) ln(a, 15 + (a % 3), b, 12 + (b % 4));
  if (done < 0) {
    // celé vejce: zlatý přechod, obrys, stálý odlesk
    eggPath(); c.fillStyle = lg('goldEgg', 0, -22, 0, 19, [[0, '#fff7c2'], [0.45, '#facc15'], [1, '#a16207']]); c.fill(); c.strokeStyle = '#5c3a06'; c.lineWidth = 1.4; c.stroke();
    c.fillStyle = 'rgba(255,255,255,.55)'; c.beginPath(); c.ellipse(-6, -11, 3.2, 6, -0.4, 0, Math.PI * 2); c.fill();
    // jednou za 4 s přeběhne po vejci záblesk a nahoře zajiskří hvězdička
    const gl = (t - 1.4) % 4;
    if (t > 1.4 && gl < 0.7) {
      const k = gl / 0.7;
      c.save(); eggPath(); c.clip(); c.globalAlpha = Math.sin(k * Math.PI) * 0.9; c.fillStyle = '#fff';
      c.beginPath(); c.moveTo(-30 + k * 50, -26); c.lineTo(-22 + k * 50, -26); c.lineTo(-38 + k * 50, 22); c.lineTo(-46 + k * 50, 22); c.closePath(); c.fill(); c.restore();
      const st = Math.sin(k * Math.PI) * 5; c.fillStyle = '#fff'; c.globalAlpha = Math.sin(k * Math.PI);
      c.beginPath(); c.moveTo(8, -24 - st); c.lineTo(9, -21); c.lineTo(8 + st, -20); c.lineTo(9, -19); c.lineTo(8, -16 + st); c.lineTo(7, -19); c.lineTo(8 - st, -20); c.lineTo(7, -21); c.closePath(); c.fill();
    }
  } else {
    // otevřené vejce: skořápka se rozlomí, vyletí zlaté světlo a objeví se tajný znak
    const k = Math.min(1, done / 0.6);
    for (const side of [-1, 1]) {
      c.save(); c.translate(side * k * 10, -k * 8 * (side < 0 ? 1 : 0.6)); c.rotate(side * k * 0.6);
      c.beginPath(); c.moveTo(0, -22); c.bezierCurveTo(side * 13, -22, side * 17, -2, side * 16, 7); c.bezierCurveTo(side * 15, 19, 0, 19, 0, 19);
      for (let i = 0; i < 4; i++) c.lineTo(side * (i % 2 ? 4 : 0), 13 - i * 9); c.lineTo(0, -22); c.closePath();
      c.fillStyle = lg('goldEgg', 0, -22, 0, 19, [[0, '#fff7c2'], [0.45, '#facc15'], [1, '#a16207']]); c.fill(); c.strokeStyle = '#5c3a06'; c.lineWidth = 1.2; c.stroke(); c.restore();
    }
    c.globalAlpha = Math.min(1, done * 2); c.font = '22px system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('🥚', 0, -18 - Math.min(1, done) * 14);
  }
  c.restore();
  if (done >= 0) {
    c.save(); c.globalAlpha = Math.min(1, done * 1.5); c.textAlign = 'center'; c.fillStyle = '#fde68a'; c.font = '900 34px system-ui'; c.fillText('ZLATÉ VEJCE', W / 2, H * 0.8);
    c.fillStyle = '#e2e8f0'; c.font = '700 17px system-ui'; c.fillText('V profilu máš nový tajný znak 🥚', W / 2, H * 0.8 + 30); c.restore();
    if (done > 3.2) eggScene = null;
  } else {
    const b = eggClose(); c.save(); c.globalAlpha = Math.min(0.8, t);                  // zavřít bez vejce
    rr(b.x, b.y, b.w, b.h, 9); c.fillStyle = '#1e293b'; c.fill(); c.strokeStyle = '#cbd5e1'; c.lineWidth = 3; c.lineCap = 'round';
    ln(b.x + 15, b.y + 12, b.x + 31, b.y + 28); ln(b.x + 31, b.y + 12, b.x + 15, b.y + 28); c.restore();
  }
}
function eggClick(x, y) {
  const E = eggScene; if (E.done) return;
  const b = eggClose(); if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) { eggScene = null; return; }
  const [ex, ey, s] = eggPos();
  if (eggT() > 1.2 && Math.hypot(x - ex, (y - ey) * 0.85) < 22 * s) {
    E.done = eggT(); if (!SET.egg) { SET.egg = 1; saveSet(); }
    achId('egg'); sfx('evo'); vib([60, 40, 120]);
  }
}
// cákanec „na skle“: nepravidelná skvrna s kapičkami, z níž stékají pramínky dolů (zpomalují a mají kapku na konci)
function screenSplat(x, y, big) {
  const r = rnd(20, 36) * (big ? 1.4 : 1);
  const s = { x: Math.max(50, Math.min(W - 50, x + rnd(-160, 160))), y: Math.max(HUD + 20, Math.min(H - 140, y + rnd(-150, 20))), r, l: 4, ml: 4,
    blobs: Array.from({ length: 9 }, () => [rnd(-1, 1), rnd(-0.8, 0.8), rnd(0.22, 0.55)]),
    dots: Array.from({ length: 10 }, () => [rnd(-2.2, 2.2), rnd(-1.8, 1.4), rnd(1.2, 3.4)]),
    drips: Array.from({ length: 3 + ((Math.random() * 4) | 0) }, () => ({ dx: rnd(-0.75, 0.75), v: rnd(26, 70), len: 0, w: rnd(2.6, 5) })) };
  splats.push(s); if (splats.length > 10) splats.shift();
}
function drawSplats(dt) {
  for (const s of splats) {
    s.l -= dt;
    if (s.l <= 0) continue;
    const a = Math.max(0, Math.min(1, s.l / 1.5));
    // pramínky stékají dolů a postupně zpomalují (krev zasychá)
    for (const d of s.drips) { d.len += d.v * dt; d.v = Math.max(4, d.v - dt * 9); }
    c.globalAlpha = a * 0.8; c.fillStyle = '#7f0a0a';
    for (const d of s.drips) {
      const x = s.x + d.dx * s.r * 0.7, y0 = s.y + s.r * 0.3, h = d.len;
      c.beginPath(); c.moveTo(x - d.w / 2, y0); c.lineTo(x + d.w / 2, y0); c.lineTo(x + d.w * 0.35, y0 + h); c.lineTo(x - d.w * 0.35, y0 + h); c.closePath(); c.fill();
      circ(x, y0 + h, d.w * 0.62);
    }
    // skvrna a kapičky okolo
    c.fillStyle = '#8b0a0a';
    circ(s.x, s.y, s.r * 0.72);
    for (const [bx, by, br] of s.blobs) circ(s.x + bx * s.r, s.y + by * s.r, s.r * br);
    for (const [px, py, pr] of s.dots) circ(s.x + px * s.r, s.y + py * s.r, pr);
    // odlesk jako na skle
    c.globalAlpha = a * 0.3; c.fillStyle = '#fda4af'; ell(s.x - s.r * 0.3, s.y - s.r * 0.3, s.r * 0.28, s.r * 0.12);
    c.globalAlpha = a * 0.25; c.fillStyle = '#e11d48'; circ(s.x + s.r * 0.15, s.y + s.r * 0.1, s.r * 0.35);
  }
  c.globalAlpha = 1;
  splats = splats.filter(s => s.l > 0);
}
function bloodBurst(x, y, n, sp, np) {   // np = krev ze zásahu (kaluže jen výjimečně)
  if (EXTREME()) { n *= 5; sp *= 1.5; }
  for (let i = 0; i < n; i++)
    fx.push({ blood: 1, np, x, y, vx: rnd(-sp, sp), vy: rnd(-sp * 1.5, sp * 0.1), l: 0.9, ml: 0.9,
      col: Math.random() < 0.5 ? '#991b1b' : '#dc2626', r: rnd(1.2, 2.8), g: 650 });
}
// rozsekání zvířat: tělo (s hlavou) + každá noha zvlášť
// c = střed těla, box = obrys těla bez nohou, legs = [kyčel x, kyčel y, koleno dopředu, barva, šířka]
// jízdní zvířata doby kamenné (rozsekání podle druhu – údaje z MOUNT)
const BEAST_M = Object.fromEntries(Object.entries(MOUNT).map(([k, M]) => { const [bx, by, rx, ry] = M.body, [hx, hy] = M.head;
  return [k, { kind: k, c: [bx, by], box: [bx - rx - 8, hx + 16, Math.min(by - ry, hy - 14) - 2, by + ry], L: M.L, hc: [hx, hy], hbox: [hx - 12, hx + 26, hy - 16, hy + 28],
    neck: [M.neck[0], M.neck[1], M.neck[2]], legs: M.legs.map(([lx, front, near, ly]) => [lx, ly, !!front, M.col[near ? 0 : 1], M.lw[front ? 1 : 0][1]]) }]; }));
const beastOf = f => f.k ? BEAST_M[f.k] : BEAST[f.a];
const BEAST = [
  { c: [0, -36], box: [-58, 46, -58, -17], L: [12, 12], hc: [28, -42], hbox: [10, 46, -58, -24], neck: [14, -31, 5],
    legs: [[-3, -24, true, '#3f7d33', 7.5], [4, -24, true, '#5aa64a', 8]] },
  { c: [0, -40], box: [-34, 40, -64, -22], L: [13, 15], hc: [27, -46], hbox: [13, 41, -64, -30], neck: [16, -34, 4.5],
    legs: [[-14, -28, false, '#5e3a1f', 4.5], [12, -28, true, '#5e3a1f', 4.5], [-9, -28, false, '#8b5a33', 4.8], [17, -28, true, '#8b5a33', 4.8]] },
];
function tearBeast(cp) {
  const { x, side, a } = cp, k = cp.k || (a === 0 ? mountKind(teamColM(side, cp.m)) : a === 1 ? 'horse' : null), B = k ? BEAST_M[k] : BEAST[a], m = side === 0 ? 1 : -1;    // m: směr dopředu ve světě
  cp.l = 0;                                                            // celé zvíře nahradí kusy
  const sc = k === 'smilodon' ? 0.85 : 1, US0 = US * sc;               // tygr (boss) je kreslený zmenšený
  const base = { side, a, k, m: cp.m, s: US0, l: 9, ml: 9, gr: 0, bled: 0, rot: 0 };
  fx.push({ ...base, gib: 'body', x: x + m * B.c[0] * US0, y: GY + B.c[1] * US0,
    vx: rnd(-50, 50), vy: -rnd(160, 260), vr: rnd(-2.5, 2.5) });
  // useknutá hlava s krkem odletí dopředu
  fx.push({ ...base, gib: 'bhead', x: x + m * B.hc[0] * US0, y: GY + B.hc[1] * US0,
    vx: m * rnd(90, 220) + rnd(-30, 30), vy: -rnd(380, 540), vr: rnd(-11, 11) });
  bloodBurst(x + m * B.neck[0] * US0, GY + B.neck[1] * US0, 26, 260);
  B.legs.forEach(([hx, hy], i) => {
    fx.push({ ...base, gib: 'bleg', i, x: x + m * hx * US0, y: GY + (hy - 11) * US0,
      vx: m * (hx >= 0 ? 1 : -1) * rnd(70, 210) + rnd(-40, 40), vy: -rnd(260, 440), vr: rnd(-13, 13) });
    bloodBurst(x + m * hx * US0, GY + hy * US0, 12, 200);
  });
  bloodBurst(x, GY - 34 * US, 18, 220);
  addPool(x, rnd(18, 26)); addPool(x + m * 25, rnd(8, 12)); addPool(x - m * 25, rnd(8, 12));
  if (k === 'smilodon') return;                                        // boss nikoho neveze
  // jezdec spadne zvlášť a dopadne jako obyčejný voják
  const rider = { corpse: 1, x: x - m * 3 * US, side, a, ty: 0, m: cp.m, l: 1.3, ml: 1.3 };
  fx.push(rider); gore(rider);
}
// noha zvířete: kyčel nahoře, kopyto/pařát dole, kreslená kolem svého středu
const bLegMid = hy => (hy - 2) / 2;
function drawBeastLeg(f) {
  const B = beastOf(f), [, hy, knee, col, w] = B.legs[f.i];
  c.translate(0, -bLegMid(hy));
  if (B.kind) { qLeg(B.kind, 0, hy, 0, false, knee, col, false); stump(0, hy, w * 0.9); return; }
  const [px, py] = !B.kind && f.a === 1 && !knee ? hindLeg(0, hy, 0, false, 0, 0, col, w) : ikLeg(0, hy, 0, false, 0, 0, B.L[0], B.L[1], knee, col, w, !B.kind && f.a === 0 ? -6.5 : -2);
  if (B.kind) mountFoot(B.kind, px, py, col); else if (f.a === 0) dinoFoot(px, py, '#2f5f27'); else hoof(px, py);
  stump(0, hy, w * 0.6);
}
function drawBeastHead(f) {
  const B = beastOf(f);
  c.translate(-B.hc[0], -B.hc[1]);
  if (B.kind) mountHead(B.kind, 0); else if (f.a === 0) dinoHead(0); else horseHead();
  stump(B.neck[0], B.neck[1], B.neck[2]);
}
function drawBeastBody(f) {
  const B = beastOf(f);
  c.translate(-B.c[0], -B.c[1]);
  NO_RIDER = NO_LEGS = NO_BHEAD = true; if (B.kind) mount(teamColM(f.side, f.m), B.kind, 0, false, 0); else heavy(teamColM(f.side, f.m), f.a, 0, 0, 1); NO_RIDER = NO_LEGS = NO_BHEAD = false;
  for (const [hx, hy, , , w] of B.legs) stump(hx, hy + 1.5, w * 0.62);
}
function gore(cp) {
  const { x, side, a, ty } = cp, sup = ty === 3, s = US * (sup ? 1.45 : 1);
  const back = -(side === 0 ? 1 : -1);                // mrtvola padá dozadu
  if (ty === 5) {
    if (a === 0) { tearBeast({ ...cp, k: 'smilodon' }); cp.l = 0; return; }
    if (a === 1) {                                       // drak: přestane mávat a zřítí se k zemi, cestou krvácí
      cp.l = 0; const m = side === 0 ? 1 : -1;
      fx.push({ gib: 'dragon', side, a, x, y: GY - 112 * US, vx: m * rnd(20, 60), vy: -rnd(40, 90), vr: m * rnd(0.3, 0.7), rot: 0, s: US, l: 12, ml: 12, gr: 0, bled: 0 });
      bloodBurst(x, GY - 112 * US, 40, 260); return;
    }
    return;
  }
  if (ty === 2) {
    if (a <= 1) return tearBeast(cp);
    if (a >= 3) return;                                 // tank a mech nikoho nevezou – jen výbuch
    // dělo: hlavu přijde obsluha stojící za kanónem
    cp.gore = { head: true }; cp.l = cp.ml = 7;
    fx.push({ gib: 'head', x: x + back * 30 * US, y: GY - 42 * US, vx: back * rnd(40, 160), vy: -rnd(320, 500), rot: 0, vr: rnd(-14, 14),
      side, a, sup: false, s: US, l: 9, ml: 9, gr: 7 * US, bled: 0 });
    bloodBurst(x + back * 30 * US, GY - 36 * US, 22, 200);
    addPool(x + back * 34 * US, rnd(10, 14));
    return;
  }
  // co přesně se urve – hlava skoro vždy, končetiny náhodně
  cp.l = cp.ml = 7;                                     // bezhlavá mrtvola leží déle
  // hlava skoro vždy, končetiny často – obě ruce i obě nohy zvlášť
  const ch = p => Math.random() < p;
  const X = EXTREME(), G = cp.gore = X ? { head: true, arm: ch(0.9), armB: ch(0.8), leg: ch(0.85), legB: ch(0.7) }
    : { head: ch(0.85), arm: ch(0.75), armB: ch(0.55), leg: ch(0.65), legB: ch(0.45) };
  if (!G.head && !G.arm && !G.leg) G.head = true;
  const gib = (kind, y, vx, vy) => fx.push({ gib: kind, x, y, vx, vy, rot: rnd(-0.5, 0.5), vr: rnd(-14, 14),
    side, a: sup ? 4 : a, sup, s, l: 9, ml: 9, gr: kind === 'head' ? 7 * s : 3 * s, bled: 0 });
  if (G.head) gib('head', GY - (ty === 2 ? 70 : 42) * s, back * rnd(40, 170) + rnd(-30, 30), -rnd(320, 520));
  if (G.arm) gib('arm', GY - 31 * s, rnd(-160, 160), -rnd(200, 380));
  if (G.leg) gib('leg', GY - 14 * s, rnd(-120, 120), -rnd(140, 260));
  if (G.armB) gib('arm', GY - 31 * s, rnd(-160, 160), -rnd(220, 400));
  if (G.legB) gib('leg', GY - 14 * s, rnd(-140, 140), -rnd(160, 280));
  bloodBurst(x, GY - 36 * s, 26, 210);
  if (X) {                                              // kusy masa a krvavé cákance na obrazovce
    for (let i = 0; i < 6; i++) fx.push({ blood: 1, x, y: GY - 30 * s, vx: rnd(-180, 180), vy: -rnd(150, 380), l: 1.4, ml: 1.4, col: i % 2 ? '#7f1010' : '#5c0a0a', r: rnd(2.6, 4.2), g: 800 });
    if (Math.random() < 0.45) screenSplat(MX(x), GY - 40 * s);
  }
  if (ty !== 2) fx.push({ spurt: 1, x, side, l: X ? 1.2 : 0.75, ml: X ? 1.2 : 0.75 });
  addPool(x + back * 22 * s, rnd(10, 16) * s);
}
// obrys kusu kolem jeho středu (lokální souřadnice) – pro výpočet, kde se dotkne země
const GIB_BOX = { head: [-8, 8, -8, 8], arm: [-3, 3, -7, 8], leg: [-3, 6, -10, 11], dragon: [-60, 60, -30, 40] };
function gibBottom(f) {
  let b;
  if (f.gib === 'bhead') {
    const B = beastOf(f);
    b = [B.hbox[0] - B.hc[0], B.hbox[1] - B.hc[0], B.hbox[2] - B.hc[1], B.hbox[3] - B.hc[1]];
  } else if (f.gib === 'body') {
    const B = beastOf(f);
    b = [B.box[0] - B.c[0], B.box[1] - B.c[0], B.box[2] - B.c[1], B.box[3] - B.c[1]];
  } else if (f.gib === 'bleg') {
    const hy = beastOf(f).legs[f.i][1], mid = bLegMid(hy);
    b = [-6, 10, hy - mid, 2 - mid];  } else b = GIB_BOX[f.gib];
  const sn = Math.sin(f.rot), cs = Math.cos(f.rot);
  let m = 0;
  for (const px of [b[0], b[1]]) for (const py of [b[2], b[3]]) m = Math.max(m, px * sn + py * cs);
  return m * f.s;
}
function drawGib(f, dt) {
  if (f.rest) {
    // leží: žádná gravitace ani odskoky, jen dojede, překlopí se naplocho a drží se země
    f.vx *= Math.max(0, 1 - dt * 8); f.x += f.vx * dt;
    const P = Math.PI, tgt = f.gib === 'body' || f.gib === 'dragon' ? Math.round(f.rot / (2 * P)) * 2 * P
      : f.gib === 'head' || f.gib === 'bhead' ? Math.round(f.rot / P) * P
      : Math.round((f.rot - P / 2) / P) * P + P / 2;
    f.rot += (tgt - f.rot) * Math.min(1, dt * 7);
    f.gr = gibBottom(f); f.y = GY + 2 - f.gr;
  } else {
  f.x += f.vx * dt; f.y += f.vy * dt; f.vy += 950 * dt; f.rot += f.vr * dt;
  f.gr = gibBottom(f);
  if (f.y > GY + 2 - f.gr) {
    if (!f.bled) { f.bled = 1; addPool(f.x, rnd(5, 9)); bloodBurst(f.x, GY - 4, 6, 70, true); }
    // práh odskoku podle délky snímku – při nízkém FPS by gravitace za snímek přidala dost na věčné poskakování
    f.y = GY + 2 - f.gr; f.vy = Math.abs(f.vy) > 140 + 950 * dt * 2 ? -f.vy * 0.35 : 0; f.vx *= 0.55; f.vr *= 0.5;
    if (!f.vy) { f.rest = 1; f.vr = 0; }            // dopadl – dál už jen leží (překlopení naplocho řeší větev nahoře)
  } else if (dt > 0 && Math.random() < 0.5) {
    fx.push({ blood: 1, x: f.x, y: f.y, vx: rnd(-20, 20), vy: rnd(-30, 10), l: 0.6, ml: 0.6, col: '#9f1212', r: rnd(1, 2), g: 600 });
  }
  }
  const team = teamColM(f.side, f.m);
  c.globalAlpha = Math.min(1, f.l / 1.5);
  c.save(); c.translate(MX(f.x), f.y); c.scale(facing(f.side) * f.s, f.s); c.rotate(f.rot);
  const OFg = outfitOf(team, f.a); SK = (OFg && OFg.skin) || SKIN3;
  if (f.gib === 'dragon') { BOSS_STILL = true; c.translate(0, 112); BOSS_ART[1](team, 0, 0); BOSS_STILL = false; }
  else if (f.gib === 'body') drawBeastBody(f);
  else if (f.gib === 'bleg') drawBeastLeg(f);
  else if (f.gib === 'bhead') drawBeastHead(f);
  else if (f.gib === 'head') {
    c.translate(-1, 42.5);
    head(team, f.a, f.sup ? { super: 1 } : {});
    stump(0, -35.5, 3.4);
  } else if (f.gib === 'arm') {
    limb([0, -6, 0.9, 0, 0, 6], SK[0], 3.8);
    c.beginPath(); c.arc(0, 6.5, 2.5, 0, Math.PI * 2); fo(SK[0], 1.2);
    stump(0, -6.5, 2.4);
  } else {
    limb([0, -9, 0.6, 0, 0, 8], (OFg && OFg.pants || PANTS[f.a])[0], 4.6);
    rr(-2.5, 6.5, 7.5, 3.8, 1.6); fo((OFg && OFg.boots) || BOOTS[f.a], 1.2);
    stump(0, -9.5, 2.8);
  }
  c.restore();
}
