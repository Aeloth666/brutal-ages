// =====================================================================
//  JÍZDNÍ ZVÍŘATA DOBY KAMENNÉ – podle národa: mamut, obří vlk, jeskynní medvěd, pratur (+ šavlozubý tygr jako boss)
//  Velikosti podle skutečnosti (člověk ≈ 58 px ≈ 1,75 m): mamut v kohoutku ~2,6 m, pratur ~1,8 m, medvěd ~1,4 m, vlk ~1,2 m.
//  Nohy mají tři články jako u skutečných zvířat: zadní = stehno (koleno vpředu) → bérec (hlezno vzadu) → nárt;
//  přední = paže (loket vzadu) → předloktí → záprstí. Chodidlo stojí na zemi (y = 0), při kroku se zvedne.
// =====================================================================
// body/head/neck/legs slouží i k rozsekání v brutal módu (world.js BEAST_M)
// legs: [x kloubu, přední?, bližší?, y kloubu]; hs/fs: délky článků zadní/přední nohy; lw: šířky [kyčel/rameno, koleno/loket, hlezno/zápěstí]
const MOUNT = {
  mammoth: { body: [0, -63, 40, 27], legs: [[-24, 0, 0, -54], [20, 1, 0, -56], [-17, 0, 1, -54], [27, 1, 1, -56]], hs: [25, 23, 4], fs: [26, 24, 4],
    lw: [[24, 16, 15], [20, 15.5, 15]], foot: 'pad', col: ['#7a5230', '#563820', '#a2714a'], head: [50, -82], neck: [36, -76, 14], seat: [-6, -86], stride: 9, lift: 4, bob: 1.8, hp: 150 },
  wolf: { body: [-1, -33, 27, 10], legs: [[-20, 0, 0, -32], [13, 1, 0, -31], [-15, 0, 1, -32], [18, 1, 1, -31]], hs: [13, 13, 9], fs: [10, 14, 7],
    lw: [[13, 5.4, 3.8], [9, 4.8, 3.8]], foot: 'paw', col: ['#80868f', '#585d66', '#aab0b8'], head: [37, -50], neck: [24, -44, 7], seat: [-4, -41], stride: 11, lift: 5, bob: 1.3, hp: 104 },
  bear: { body: [-2, -37, 31, 17], legs: [[-23, 0, 0, -32], [14, 1, 0, -34], [-17, 0, 1, -32], [20, 1, 1, -34]], hs: [16, 15, 0], fs: [18, 16, 0],
    lw: [[20, 13, 10], [17, 12.5, 10]], foot: 'plant', col: ['#62402a', '#3f2716', '#87603e'], head: [42, -44], neck: [28, -44, 11], seat: [-4, -50], stride: 9, lift: 4, bob: 1.5, hp: 112 },
  aurochs: { body: [-2, -45, 34, 14], legs: [[-26, 0, 0, -40], [18, 1, 0, -39], [-20, 0, 1, -40], [24, 1, 1, -39]], hs: [16, 16, 12], fs: [14, 16, 10],
    lw: [[16, 6.6, 4.6], [12, 6.2, 4.6]], foot: 'hoof', col: ['#3f2e24', '#271b13', '#614737'], head: [46, -48], neck: [30, -52, 9], seat: [-4, -58], stride: 11, lift: 5, bob: 1.3, hp: 122 },
  smilodon: { body: [-2, -44, 40, 18], legs: [[-28, 0, 0, -40], [20, 1, 0, -38], [-21, 0, 1, -40], [26, 1, 1, -38]], hs: [18, 16, 10], fs: [16, 17, 5],
    lw: [[26, 11, 7.5], [16, 11, 8.5]], foot: 'paw', pawK: 2.2, col: ['#d9822b', '#a85a18', '#f2b062'], head: [50, -58], neck: [34, -54, 14], seat: [-4, -62], stride: 13, lift: 5, bob: 1.4, hp: 112 },
};
// kůň (středověk, v kohoutku ~1,6 m) a T-Rex (událost, kyčel ~3,6 m – kreslí se zvětšený)
MOUNT.horse = { body: [-1, -43, 30, 12], legs: [[-22, 0, 0, -40], [17, 1, 0, -38], [-16, 0, 1, -40], [23, 1, 1, -38]], hs: [16, 16, 14], fs: [14, 15, 12],
  lw: [[15, 6.4, 4.4], [12, 6, 4.4]], foot: 'hoof', col: ['#8b5a33', '#5e3a1f', '#b07a4a'], head: [42, -64], neck: [26, -56, 8], seat: [-3, -56], stride: 12, lift: 6, bob: 1.4, hp: 104 };
MOUNT.trex = { body: [0, -42, 26, 12], legs: [[-3, 0, 0, -40], [3, 0, 1, -40]], hs: [17, 16, 11], fs: [17, 16, 11],
  lw: [[24, 10, 7], [24, 10, 7]], foot: 'claw', col: ['#7b6a3a', '#55471f', '#a8975c'], head: [44, -48], neck: [30, -46, 10], seat: [0, -52], stride: 14, lift: 6, bob: 2, hp: 0 };
MOUNT.mammoth.mod = { hp: 1.3, d: 1.15 };            // mamut: o 30 % víc zdraví a o 15 % silnější úder (pomalý, ale nezastavitelný)
for (const [k, w] of Object.entries({ mammoth: 100, wolf: 72, bear: 80, aurochs: 84, horse: 78 })) MOUNT[k].gw = w;   // šířka v boji (core.js unitW)
const MOUNT_OF = ['mammoth', 'wolf', 'bear', 'aurochs'];                  // pořadí národů doby kamenné (AGEFAC[0])
const mountKind = team => MOUNT_OF[(team && team.af && team.af[0]) | 0] || 'mammoth';
const FOOT_H = { hoof: 5, paw: 3, pad: 7, plant: 8, claw: 4 };                     // výška chodidla nad zemí, odkud začíná noha

// koleno ze dvou délek (inverzní kinematika); fwd = koleno vpředu
function ik2(hx, hy, fx, fy, L1, L2, fwd) {
  const dx = fx - hx, dy = fy - hy, d = Math.max(0.01, Math.min(Math.hypot(dx, dy), L1 + L2 - 0.01));
  const a = Math.acos(Math.max(-1, Math.min(1, (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d)))), ka = Math.atan2(dy, dx) + (fwd ? -a : a);
  return [hx + Math.cos(ka) * L1, hy + Math.sin(ka) * L1];
}
// zúžený článek končetiny (lichoběžník se zaoblenými konci)
function taper(ax, ay, bx, by, wa, wb) {
  const dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
  c.beginPath(); c.moveTo(ax + nx * wa / 2, ay + ny * wa / 2); c.lineTo(bx + nx * wb / 2, by + ny * wb / 2); c.lineTo(bx - nx * wb / 2, by - ny * wb / 2); c.lineTo(ax - nx * wa / 2, ay - ny * wa / 2); c.closePath(); c.fill();
  circ(ax, ay, wa / 2); circ(bx, by, wb / 2);
}
// zužující se trubice podél kubické Bézierovy křivky p = [x0,y0, x1,y1, x2,y2, x3,y3]: šířka w0 → w1 (cestu jen vytvoří)
function tubeP(p, w0, w1, n = 16) {
  const P = [], N = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, u = 1 - t, x = u * u * u * p[0] + 3 * u * u * t * p[2] + 3 * u * t * t * p[4] + t * t * t * p[6], y = u * u * u * p[1] + 3 * u * u * t * p[3] + 3 * u * t * t * p[5] + t * t * t * p[7];
    const dx = 3 * u * u * (p[2] - p[0]) + 6 * u * t * (p[4] - p[2]) + 3 * t * t * (p[6] - p[4]), dy = 3 * u * u * (p[3] - p[1]) + 6 * u * t * (p[5] - p[3]) + 3 * t * t * (p[7] - p[5]), L = Math.hypot(dx, dy) || 1;
    P.push([x, y]); N.push([-dy / L, dx / L, (w0 + (w1 - w0) * t) / 2]);
  }
  c.beginPath(); P.forEach(([x, y], i) => c.lineTo(x + N[i][0] * N[i][2], y + N[i][1] * N[i][2]));
  for (let i = n; i >= 0; i--) c.lineTo(P[i][0] - N[i][0] * N[i][2], P[i][1] - N[i][1] * N[i][2]);
  c.closePath(); return { P, N };
}
// svalnatý článek: na jedné straně vyboulený (sval), kreslený jako obrys z křivek
function muscle(ax, ay, bx, by, wa, wb, bulge) {
  const dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L, mx = (ax + bx) / 2, my = (ay + by) / 2;
  const wm = (wa + wb) / 2 * (1 + bulge);
  c.beginPath(); c.moveTo(ax + nx * wa / 2, ay + ny * wa / 2);
  c.quadraticCurveTo(mx + nx * wm * 0.62, my + ny * wm * 0.62, bx + nx * wb / 2, by + ny * wb / 2);
  c.lineTo(bx - nx * wb / 2, by - ny * wb / 2);
  c.quadraticCurveTo(mx - nx * wm * 0.55, my - ny * wm * 0.55, ax - nx * wa / 2, ay - ny * wa / 2); c.closePath(); c.fill();
  circ(ax, ay, wa / 2); circ(bx, by, wb / 2);
}
// noha: spočítá klouby a nakreslí ji (nejdřív obrys, pak výplň, ať spoje nemají vnitřní čáry)
function qLeg(kind, hx, hy, phase, walk, front, col, near) {
  const M = MOUNT[kind], [L1, L2, L3] = front ? M.fs : M.hs, [w1, w2, w3] = M.lw[front ? 1 : 0], s = walk ? Math.sin(phase) : 0, v = walk ? Math.cos(phase) : 0;
  const lift = v > 0 ? M.lift * v : 0, fx = hx + M.stride * s + (front ? 2 : -3), fy = -lift, ft = FOOT_H[M.foot] * (M.pawK || 1);
  // spodní kloub: hlezno / zápěstí (u medvěda pata, u mamuta skoro nad chodidlem – sloupovité nohy)
  let jx, jy;
  if (M.foot === 'plant') { jx = fx - (front ? 2 : 5); jy = fy - ft; }
  else if (M.foot === 'pad') { jx = fx - (front ? 0 : 1); jy = fy - ft - L3; }
  else { const t = front ? 0.32 - s * 0.1 : 0.3 + s * 0.12; jx = fx - Math.sin(t) * L3 - (front ? 1 : 2); jy = fy - ft - Math.cos(t) * L3; }
  const [kx, ky] = ik2(hx, hy, jx, jy, L1, L2, !front);                // zadní: koleno vpředu, přední: loket vzadu
  const ax = M.foot === 'plant' ? jx : fx, ay = fy - ft;
  for (const pass of [0, 1]) {
    c.fillStyle = pass ? col : OL; const g = pass ? 0 : 2.4;
    muscle(hx, hy, kx, ky, w1 + g, w2 + g, front ? 0.18 : 0.3);
    muscle(kx, ky, jx, jy, w2 + g, w3 + g, front ? 0.12 : 0.06);
    if (M.foot !== 'plant') taper(jx, jy, ax, ay, w3 + g, w3 * 0.92 + g);
  }
  if (near) { c.fillStyle = 'rgba(255,255,255,.13)'; muscle(hx - w1 * 0.16, hy + 1, kx - w2 * 0.2, ky, w1 * 0.36, w2 * 0.3, 0.2); }   // odlesk svalu
  mountFoot(kind, fx, fy, col, jx);
}
// chodidlo: y = spodek (země), x = střed chodidla
function mountFoot(kind, x, y, col, heel) {
  const F = MOUNT[kind].foot;
  if (F === 'hoof') {
    c.beginPath(); c.moveTo(x - 3.2, y - 5); c.lineTo(x + 2.6, y - 5); c.lineTo(x + 5, y); c.lineTo(x - 3.8, y); c.closePath(); fo('#1a1410', 1);
    c.strokeStyle = '#4a3a2a'; c.lineWidth = 0.8; ln(x + 1, y - 4, x + 1.8, y); return;
  }
  if (F === 'pad') {
    c.beginPath(); c.moveTo(x - 8, y); c.quadraticCurveTo(x - 9, y - 6, x - 7, y - 8); c.lineTo(x + 7, y - 8); c.quadraticCurveTo(x + 9.5, y - 6, x + 8.5, y); c.closePath(); fo(col, 1.2);
    c.fillStyle = '#ece2c8'; for (const k of [-2, 2.2, 6]) { c.beginPath(); c.ellipse(x + k, y - 1.4, 1.8, 1.4, 0, 0, Math.PI * 2); c.fill(); } return;
  }
  if (F === 'plant') {                                                                 // ploská tlapa: od paty po prsty, drápy vpředu
    const hx = heel ?? x - 7;
    c.beginPath(); c.moveTo(hx - 6, y); c.bezierCurveTo(hx - 7, y - 6, hx - 5, y - 11, hx, y - 11); c.bezierCurveTo(hx + 5, y - 11, x - 1, y - 7, x + 3, y - 6); c.quadraticCurveTo(x + 7, y - 4.5, x + 7, y); c.closePath(); fo(col, 1.2);   // tlapa zakryje konec nohy
    c.fillStyle = '#e8dcc0'; for (const k of [2.5, 4.6, 6.6]) { c.beginPath(); c.moveTo(x + k - 1.4, y - 2.4); c.quadraticCurveTo(x + k + 2.6, y - 2, x + k + 2.2, y + 0.2); c.lineTo(x + k - 0.8, y - 0.6); c.closePath(); c.fill(); } return;
  }
  if (F === 'claw') {                                                                 // tři prsty dopředu, drápy, ostruha vzadu
    c.beginPath(); c.moveTo(x - 5, y); c.quadraticCurveTo(x - 6, y - 4, x - 1, y - 5); c.lineTo(x + 8, y - 3.5); c.quadraticCurveTo(x + 13, y - 2.6, x + 13, y); c.closePath(); fo(col, 1.2);
    c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 0.8; ln(x + 3, y - 4, x + 5, y); ln(x + 7.5, y - 3.2, x + 9, y);
    c.fillStyle = '#efe6cf'; for (const d of [5.5, 10, 13.5]) poly([x + d, y - 2.2, x + d + 2.6, y + 0.4, x + d - 0.6, y + 0.4]), c.fill();
    poly([x - 5, y - 1.5, x - 8, y + 0.4, x - 4.5, y + 0.4]); c.fill(); return;
  }
  // tlapa na prstech (vlk, tygr)
  const k = MOUNT[kind].pawK || 1;
  c.beginPath(); c.moveTo(x - 3 * k, y); c.quadraticCurveTo(x - 3.5 * k, y - 3.5 * k, x + 0.5 * k, y - 3.6 * k); c.quadraticCurveTo(x + 5.5 * k, y - 3 * k, x + 5.5 * k, y); c.closePath(); fo(col, 1);
  c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 0.7; for (const d of [1.2, 3.2]) ln(x + d * k, y - 2.6 * k, x + d * k, y);
  c.fillStyle = '#f2ead6'; for (const d of [1.5, 3.5, 5.3]) poly([x + d * k, y - 0.6, x + (d + 1.4) * k, y + 0.4, x + (d - 0.2) * k, y + 0.4]), c.fill();
}
// obrys těla (bez hlavy) – podle druhu
function mountBody(kind) {
  c.beginPath();
  if (kind === 'mammoth') {                     // vysoký hrb za hlavou, záda se svažují dozadu
    c.moveTo(-40, -48); c.bezierCurveTo(-46, -58, -44, -72, -33, -75); c.bezierCurveTo(-18, -80, 2, -88, 18, -91);
    c.bezierCurveTo(30, -93, 40, -86, 42, -76); c.bezierCurveTo(46, -64, 44, -50, 36, -42);
    c.bezierCurveTo(24, -36, -10, -36, -26, -38); c.bezierCurveTo(-34, -39, -40, -43, -40, -48);
  } else if (kind === 'wolf') {                 // hluboký hrudník, vtažené břicho
    c.moveTo(-28, -31); c.bezierCurveTo(-32, -37, -28, -41, -20, -41); c.bezierCurveTo(-8, -41, 4, -42, 12, -44);
    c.bezierCurveTo(19, -45, 25, -42, 27, -36); c.bezierCurveTo(28, -28, 23, -23, 15, -23);
    c.bezierCurveTo(6, -23, 0, -30, -10, -30); c.bezierCurveTo(-18, -30, -24, -28, -28, -31);
  } else if (kind === 'bear') {                 // hrb nad plecemi, mohutný zadek
    c.moveTo(-33, -27); c.bezierCurveTo(-39, -38, -35, -49, -22, -49); c.bezierCurveTo(-8, -49, 2, -53, 10, -55);
    c.bezierCurveTo(20, -57, 29, -51, 31, -43); c.bezierCurveTo(33, -33, 27, -24, 18, -22); c.bezierCurveTo(4, -19, -20, -19, -33, -27);
  } else if (kind === 'horse') {                // kohoutek vpředu, rovný hřbet, zakulacená záď
    c.moveTo(-30, -38); c.bezierCurveTo(-34, -47, -30, -53, -22, -53); c.bezierCurveTo(-10, -52, 4, -50, 12, -52);
    c.bezierCurveTo(18, -54, 24, -56, 28, -52); c.bezierCurveTo(32, -46, 32, -38, 26, -33); c.bezierCurveTo(14, -30, -4, -31, -14, -32); c.bezierCurveTo(-22, -32, -28, -33, -30, -38);
  } else if (kind === 'smilodon') {             // mohutná plec, kratší svažitá záda
    c.moveTo(-42, -40); c.bezierCurveTo(-46, -52, -40, -60, -28, -60); c.bezierCurveTo(-12, -60, 4, -63, 16, -64);
    c.bezierCurveTo(30, -65, 40, -58, 42, -48); c.bezierCurveTo(44, -38, 38, -30, 28, -29);
    c.bezierCurveTo(12, -27, -2, -32, -16, -31); c.bezierCurveTo(-28, -30, -38, -32, -42, -40);
  } else {                                      // pratur: hrb v kohoutku, lalok pod krkem
    c.moveTo(-36, -40); c.bezierCurveTo(-42, -49, -38, -57, -28, -57); c.bezierCurveTo(-12, -57, 4, -59, 14, -62);
    c.bezierCurveTo(23, -64, 31, -60, 33, -52); c.bezierCurveTo(35, -44, 33, -36, 26, -32);
    c.bezierCurveTo(10, -30, -14, -31, -26, -33); c.bezierCurveTo(-32, -34, -36, -36, -36, -40);
  }
  c.closePath();
}
function mountHead(kind, at, ph = 0) {
  if (kind === 'horse') return horseHead2(at);
  const [C, CD, CL] = MOUNT[kind].col;
  if (kind === 'mammoth') {
    // vysoká klenutá lebka, malé ucho, dlouhé zatočené kly, chobot
    c.beginPath(); c.moveTo(30, -90); c.bezierCurveTo(30, -104, 46, -110, 55, -100); c.bezierCurveTo(61, -92, 61, -80, 59, -70);
    c.lineTo(51, -62); c.bezierCurveTo(44, -64, 38, -70, 36, -76); c.bezierCurveTo(32, -78, 30, -84, 30, -90); c.closePath();
    fo(lg('mamHead3', 0, -108, 0, -62, [[0, CL], [1, C]]), 1.6);
    c.strokeStyle = 'rgba(40,24,10,.45)'; c.lineWidth = 1.2; for (let k = 0; k < 6; k++) { c.beginPath(); c.moveTo(33 + k * 3.6, -102 + Math.abs(k - 3) * 1.2); c.quadraticCurveTo(31 + k * 3.6, -96, 34 + k * 3.6, -90); c.stroke(); }
    c.beginPath(); c.moveTo(38, -86); c.bezierCurveTo(33, -84, 33, -74, 38, -72); c.bezierCurveTo(42, -74, 43, -82, 38, -86); c.closePath(); fo(CD, 1.2);   // malé chlupaté ucho
    const tr = Math.sin(T * 2 + ph) * 3 - at * 18, p = [[56, -70], [60, -52 + tr * 0.2], [60 + tr * 0.25, -32 + tr * 0.6], [55 + tr * 0.5, -14 + tr]];
    for (const pass of [0, 1]) { c.fillStyle = pass ? C : OL; const g = pass ? 0 : 2.4; for (let i = 0; i < 3; i++) taper(p[i][0], p[i][1], p[i + 1][0], p[i + 1][1], 13 - i * 3 + g, 10 - i * 3 + g); }
    c.save(); c.translate(p[3][0], p[3][1]); c.beginPath(); c.arc(-3, 0, 4, -0.3, Math.PI * 1.1); c.strokeStyle = OL; c.lineWidth = 4.6; c.stroke(); c.strokeStyle = C; c.lineWidth = 2.4; c.stroke(); c.restore();
    c.strokeStyle = 'rgba(40,24,10,.5)'; c.lineWidth = 1; for (let i = 0; i < 9; i++) { const t = i / 9, j = Math.min(2, (t * 3) | 0), f = t * 3 - j, x = p[j][0] + (p[j + 1][0] - p[j][0]) * f, y = p[j][1] + (p[j + 1][1] - p[j][1]) * f; ln(x - 4, y, x + 4, y + 0.6); }
    for (const [o, col] of [[-4, ['#c9bc9c', '#e8dfc8']], [0, ['#d8ccb0', '#fffaf0']]]) {               // kly (vzdálenější tmavší)
      c.beginPath(); c.moveTo(52 + o, -64); c.bezierCurveTo(64 + o, -40, 92 + o, -42, 92 + o, -66); c.bezierCurveTo(92 + o, -72, 88 + o, -76, 84 + o, -76);
      c.bezierCurveTo(87 + o, -70, 87 + o, -54, 72 + o, -54); c.bezierCurveTo(64 + o, -54, 58 + o, -60, 55 + o, -68); c.closePath();
      fo(lg('mamTusk3' + o, 52, -60, 92, -70, [[0, col[0]], [0.6, col[1]], [1, col[0]]]), 1.3);
    }
    c.fillStyle = '#1a1208'; circ(52, -84, 1.9); c.fillStyle = 'rgba(255,255,255,.7)'; circ(52.6, -84.6, 0.7);
    c.strokeStyle = '#2a1608'; c.lineWidth = 1.6; ln(48, -88, 56, -87);
  } else if (kind === 'wolf') {
    c.beginPath(); c.moveTo(14, -43); c.bezierCurveTo(18, -50, 24, -54, 30, -54); c.lineTo(32, -44); c.bezierCurveTo(28, -38, 24, -32, 20, -28); c.closePath();
    fo(lg('wolfNeck3', 0, -54, 0, -28, [[0, CL], [1, C]]), 1.2);                                    // krk s hřívou
    poly([28, -56, 29, -65, 33, -57]); fo(CD, 1.1); poly([31, -57, 34, -66, 36, -56]); fo(C, 1.1); c.fillStyle = '#d9b0a0'; poly([32, -57.5, 34, -63, 35, -57]); c.fill();
    c.beginPath(); c.moveTo(26, -50); c.bezierCurveTo(27, -58, 35, -59, 39, -55); c.lineTo(49, -50); c.quadraticCurveTo(50.5, -47, 47, -46); c.lineTo(38, -44); c.bezierCurveTo(32, -43, 27, -45, 26, -50); c.closePath();
    fo(lg('wolfHead3', 0, -59, 0, -43, [[0, CL], [1, C]]), 1.3);
    c.save(); c.translate(38, -44.5); c.rotate(at * 0.45); c.beginPath(); c.moveTo(0, 0); c.lineTo(9.5, -0.5); c.quadraticCurveTo(10, 2, 7.5, 2.6); c.lineTo(0, 2.8); c.closePath(); fo(CD, 1);
    c.fillStyle = '#fff'; poly([3.5, 0, 4.5, 2, 5.5, 0]); c.fill(); c.restore();
    c.fillStyle = '#f5f5f5'; c.beginPath(); c.moveTo(39, -47.5); c.lineTo(47.5, -48); c.lineTo(46.5, -46); c.lineTo(38, -44.5); c.closePath(); c.fill();
    c.fillStyle = '#111'; ell(49, -49, 1.5, 1.1); c.fillStyle = '#fde047'; ell(36, -52.5, 1.7, 1.2); c.fillStyle = '#111'; ell(36.4, -52.5, 0.6, 1);
  } else if (kind === 'bear') {
    c.fillStyle = CD; circ(32, -54, 4); circ(38, -56, 4); c.fillStyle = '#8a6040'; circ(32, -54, 1.8); circ(38, -56, 1.8);
    // kulatá hlava, krátký zaoblený čenich se světlejší tlamou, nos na špičce
    c.beginPath(); c.moveTo(26, -46); c.bezierCurveTo(26, -58, 40, -61, 46, -53); c.bezierCurveTo(48, -50, 51, -49.5, 54, -49);
    c.bezierCurveTo(58.5, -48, 58.5, -41.5, 54.5, -40.5); c.bezierCurveTo(50, -38.5, 46, -37.5, 42, -37.5); c.bezierCurveTo(32, -35.5, 26, -39, 26, -46); c.closePath();
    fo(lg('bearHead4', 0, -60, 0, -36, [[0, CL], [1, C]]), 1.4);
    c.save(); c.clip(); c.fillStyle = 'rgba(214,180,140,.55)'; c.beginPath(); c.ellipse(52, -44, 7, 5, 0.05, 0, Math.PI * 2); c.fill(); c.restore();
    c.fillStyle = '#111'; c.beginPath(); c.ellipse(56.2, -46.6, 2.4, 1.8, 0.2, 0, Math.PI * 2); c.fill(); c.fillStyle = 'rgba(255,255,255,.4)'; circ(55.6, -47.3, 0.6);
    c.strokeStyle = '#2a1608'; c.lineWidth = 1.1; c.beginPath(); c.moveTo(56, -44.8); c.quadraticCurveTo(55, -41.5, 50.5, -41); c.stroke();
    c.fillStyle = '#111'; circ(42, -50, 1.5); c.fillStyle = 'rgba(255,255,255,.6)'; circ(42.4, -50.4, 0.5);
    if (at > 0.2) { c.fillStyle = '#7f1d1d'; c.beginPath(); c.ellipse(50, -39, 3.8, 1.4 + at * 1.6, 0.15, 0, Math.PI * 2); c.fill(); c.fillStyle = '#fff'; poly([47.5, -40, 48.5, -38, 49.5, -40]); c.fill(); }
  } else if (kind === 'smilodon') {
    // šavlozubec ze strany: klenutá lebka, krátký čenich, výrazná brada; vidět je bližší šavle, vzdálená jen vykukuje za ní
    const op = Math.min(1, at * 1.6), HG = [42, -52];
    c.beginPath(); c.ellipse(41, -70, 4.2, 4, -0.4, 0, Math.PI * 2); fo(C, 1.3); c.fillStyle = '#e59a8f'; circ(41.3, -69.6, 1.8);   // ucho
    c.beginPath(); c.moveTo(52.5, -53); c.quadraticCurveTo(54.5, -45, 53.5, -38); c.quadraticCurveTo(56, -45, 55.5, -53); c.closePath(); fo('#cfc5ad', 0.9);   // vzdálená šavle
    if (op > 0.1) {                                                                  // hrdlo: mezi horním rtem a přední hranou sklopené čelisti
      const a = op * 0.9, jx = HG[0] + 15.5 * Math.cos(a) - 0.5 * Math.sin(a), jy = HG[1] + 15.5 * Math.sin(a) + 0.5 * Math.cos(a);
      c.fillStyle = '#4a0d0d'; c.beginPath(); c.moveTo(HG[0] + 1, HG[1]); c.lineTo(59.5, -52); c.lineTo(jx, jy); c.closePath(); c.fill();
    }
    c.save(); c.translate(...HG); c.rotate(op * 0.9); c.translate(-HG[0], -HG[1]);                                   // spodní čelist s bradou
    c.beginPath(); c.moveTo(41, -52); c.lineTo(58, -51.5); c.quadraticCurveTo(61, -51, 60, -47.5); c.lineTo(57.5, -44.5); c.quadraticCurveTo(49, -43.5, 42, -47.5); c.closePath();
    fo(lg('smiJaw', 0, -52, 0, -44, [[0, CL], [0.5, '#f6ead2'], [1, '#e8d8b8']]), 1.3);
    c.restore();
    c.beginPath(); c.moveTo(34, -60); c.bezierCurveTo(34, -72, 46, -76, 54, -70); c.bezierCurveTo(57, -67.5, 60, -64.5, 63, -62); c.quadraticCurveTo(66.5, -59.5, 65.5, -55.5);
    c.quadraticCurveTo(64.5, -52, 60, -52); c.lineTo(48, -52); c.bezierCurveTo(43, -51.5, 39, -49, 36, -51.5); c.bezierCurveTo(32.5, -54, 33, -57, 34, -60); c.closePath();
    fo(lg('smiHead2', 0, -75, 0, -50, [[0, CL], [1, C]]), 1.6);
    c.save(); c.clip();
    c.fillStyle = '#f6ead2'; c.beginPath(); c.ellipse(60, -54.5, 6.5, 3.6, -0.1, 0, Math.PI * 2); c.fill(); c.beginPath(); c.ellipse(46, -53, 7, 3, 0, 0, Math.PI * 2); c.fill();   // světlá tlama a líce
    c.fillStyle = '#2a1608'; for (const [x, y, r, l] of [[44, -69, 0.2, 3.6], [48, -71, 0.1, 3], [40, -64, 0.7, 4], [38, -58, 0.9, 3.4]]) { c.beginPath(); c.ellipse(x, y, 1.1, l, r, 0, Math.PI * 2); c.fill(); }
    c.restore();
    c.fillStyle = C; for (let k = 0; k < 4; k++) poly([35 + k * 2.6, -52.5 + k * 0.4, 34 + k * 2.6, -48 + k * 0.3, 37.5 + k * 2.6, -51.5 + k * 0.4]), c.fill();   // lícní srst
    c.fillStyle = '#3a1a14'; poly([63.5, -60.5, 66, -58.5, 63.5, -57]); c.fill();                                          // nos
    c.strokeStyle = '#2a1608'; c.lineWidth = 1; c.beginPath(); c.moveTo(64.5, -56); c.quadraticCurveTo(63, -53, 60, -52.5); c.stroke();
    c.fillStyle = '#1a1208'; c.beginPath(); c.ellipse(53, -64, 3, 1.9, -0.2, 0, Math.PI * 2); c.fill();                       // oko
    c.fillStyle = '#fbbf24'; c.beginPath(); c.ellipse(53.2, -64, 2.3, 1.4, -0.2, 0, Math.PI * 2); c.fill(); c.fillStyle = '#111'; ell(53.6, -64, 0.6, 1.3);
    c.strokeStyle = '#2a1608'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(48.5, -66.5); c.quadraticCurveTo(53, -68.5, 57, -66); c.stroke();   // obočí
    c.beginPath(); c.moveTo(56, -53); c.quadraticCurveTo(59.5, -43, 57.5, -33.5); c.quadraticCurveTo(62, -43, 59.5, -53); c.closePath();    // bližší šavle
    fo(lg('smiSab', 56, -53, 60, -34, [[0, '#fffdf5'], [1, '#e6dcc4']]), 1.1);
    c.strokeStyle = 'rgba(255,255,255,.75)'; c.lineWidth = 0.6; for (const d of [-1, 0.5, 2]) ln(61, -55 + d * 0.8, 70, -56 + d * 1.8);   // vousy
  } else {
    c.beginPath(); c.moveTo(26, -60); c.bezierCurveTo(34, -62, 42, -60, 46, -55); c.lineTo(55, -38); c.quadraticCurveTo(56.5, -33, 51, -33); c.lineTo(46, -34);
    c.bezierCurveTo(40, -37, 34, -42, 30, -46); c.bezierCurveTo(28, -40, 30, -34, 28, -30); c.lineTo(24, -40); c.closePath();               // hlava a lalok
    fo(lg('aurHead3', 0, -62, 0, -30, [[0, CL], [1, C]]), 1.3);
    c.fillStyle = '#cbb58c'; c.beginPath(); c.ellipse(52.5, -35, 3.6, 2.4, 0.4, 0, Math.PI * 2); c.fill(); c.fillStyle = '#111'; circ(53.6, -35.5, 0.8);
    c.beginPath(); c.moveTo(38, -57); c.bezierCurveTo(32, -58, 31, -53, 35, -52); c.closePath(); fo(CD, 1);                                    // ucho
    for (const [m, col] of [[0, '#bfae8a'], [1, '#e9dfc8']]) {                                                     // rohy: ven, dopředu a nahoru (lyra)
      c.beginPath(); c.moveTo(40 + m * 2, -58); c.bezierCurveTo(38 + m * 2, -68, 48 + m, -74, 57 + m, -70); c.bezierCurveTo(60 + m, -68, 60 + m, -64, 58 + m, -62);
      c.lineTo(56.5 + m, -63.5); c.bezierCurveTo(57 + m, -68, 50 + m, -69, 46 + m * 2, -64); c.lineTo(44 + m * 2, -57); c.closePath(); fo(col, 1);
      c.fillStyle = '#2a2018'; c.beginPath(); c.ellipse(58 + m, -63, 1.4, 1, 0.6, 0, Math.PI * 2); c.fill();
    }
    c.fillStyle = '#111'; circ(43, -53, 1.5); c.fillStyle = 'rgba(255,255,255,.6)'; circ(43.4, -53.4, 0.5);
  }
}
// hlava koně: dlouhý krk s hřívou, protáhlá hlava, uzdečka
function horseHead2(at) {
  const [C, CD, CL] = MOUNT.horse.col, MN = '#2b1a0e';
  c.beginPath(); c.moveTo(14, -52); c.bezierCurveTo(20, -62, 27, -71, 34, -75); c.lineTo(37.5, -74.5); c.bezierCurveTo(41.5, -70, 46.5, -63, 49.5, -57.5);
  c.quadraticCurveTo(52.5, -53, 48.5, -51.5); c.lineTo(43.5, -52.5); c.bezierCurveTo(39.5, -56, 36.5, -59, 33.5, -58); c.bezierCurveTo(30.5, -52, 30, -44, 26, -36); c.closePath();
  fo(lg('horseNH', 0, -76, 0, -36, [[0, CL], [0.6, C], [1, CD]]), 1.4);
  c.fillStyle = 'rgba(0,0,0,.12)'; c.beginPath(); c.ellipse(41, -60, 5, 3, 0.9, 0, Math.PI * 2); c.fill();                   // lícní kost
  poly([34, -74.5, 34.6, -81, 37.8, -74.5]); fo(C, 1.1);                                                                     // ucho
  c.fillStyle = MN; c.strokeStyle = OL; c.lineWidth = 1;                                                                      // hříva po hřebeni krku
  c.beginPath(); c.moveTo(13, -51); for (let k = 0; k <= 8; k++) { const t = k / 8, x = 14 + t * 21, y = -52 - t * 22.5 + t * t * 0.5; c.lineTo(x - 1.5 - Math.sin(T * 3 + k) * 0.8, y + 6 - t * 1.5); c.lineTo(x + 1.3, y - 0.6); } c.lineTo(36.5, -73); c.closePath(); c.fill(); c.stroke();
  poly([36, -73.5, 40.5, -70, 38, -68]); c.fill();                                                                            // čupřina
  c.fillStyle = '#111'; circ(41.6, -66.2, 1.3); c.fillStyle = 'rgba(255,255,255,.6)'; circ(42, -66.6, 0.45);
  c.fillStyle = '#2a1a10'; c.beginPath(); c.ellipse(49.3, -55, 1.2, 0.8, 0.5, 0, Math.PI * 2); c.fill();                     // nozdra
  c.strokeStyle = '#3a2412'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(38, -71); c.lineTo(44, -57.5); c.moveTo(39.5, -60.5); c.lineTo(48, -56); c.stroke();   // uzdečka
  c.strokeStyle = '#d4b04a'; c.lineWidth = 0.8; circ(45.5, -56.5, 1.2);
}
function mountTail(kind, sw) {
  const [C, CD, CL] = MOUNT[kind].col;
  c.lineCap = 'round';
  if (kind === 'horse') { c.beginPath(); c.moveTo(-29, -49); c.bezierCurveTo(-40, -48, -42, -34 + sw * 2, -38 + sw * 3, -20); c.bezierCurveTo(-34, -28, -32, -38, -27, -43); c.closePath(); fo('#2b1a0e', 1.1); return; }
  if (kind === 'wolf') { c.beginPath(); c.moveTo(-26, -38); c.bezierCurveTo(-38, -40, -42, -28 + sw * 3, -38, -18 + sw * 3); c.bezierCurveTo(-34, -26, -30, -32, -26, -33); c.closePath(); fo(lg('wolfTail3', 0, -40, 0, -18, [[0, CL], [1, C]]), 1.1); c.fillStyle = '#e7e9ec'; circ(-38, -19 + sw * 3, 2.6); return; }
  if (kind === 'bear') { c.beginPath(); c.ellipse(-35, -40, 4, 3.4, 0.4, 0, Math.PI * 2); fo(CD, 1); return; }
  if (kind === 'smilodon') { c.beginPath(); c.moveTo(-40, -54); c.bezierCurveTo(-48, -54, -52, -48 + sw * 2, -50, -42 + sw * 2); c.bezierCurveTo(-46, -44, -44, -48, -40, -48); c.closePath(); fo(C, 1.2); c.fillStyle = '#2a1608'; circ(-50, -43 + sw * 2, 2.2); return; }   // šavlozubec měl krátký ocas
  const [x0, y0, L] = kind === 'mammoth' ? [-38, -70, 16] : [-35, -52, 26];
  c.strokeStyle = OL; c.lineWidth = 3.6; c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo(x0 - 5, y0 + L * 0.45 + sw, x0 - 3, y0 + L + sw * 2); c.stroke(); c.strokeStyle = CD; c.lineWidth = 2; c.stroke();
  c.fillStyle = '#2a1a10'; c.beginPath(); c.ellipse(x0 - 3, y0 + L + 2 + sw * 2, 2.4, 3.8, 0, 0, Math.PI * 2); c.fill();
}
function mount(team, kind, ph, walk, at) {
  const M = MOUNT[kind], [C, CD, CL] = M.col, bob = legBob(ph, walk, M.bob), sw = walk ? Math.sin(ph) : 0;
  const PH = [ph, ph + Math.PI / 2, ph + Math.PI, ph + Math.PI * 1.5];                     // krok: zadní L, přední L, zadní P, přední P
  const leg = i => { const [hx, front, near, hy] = M.legs[i]; qLeg(kind, hx, hy + bob, PH[i], walk, front, near ? C : CD, near); };
  // mamut a medvěd mají nohy jako sloupy schované v srsti – kreslí se celé pod tělem; ostatním vystupuje stehno
  const under = kind === 'mammoth' || kind === 'bear';
  if (!NO_LEGS) { leg(0); leg(1); if (under) { leg(2); leg(3); } }
  c.save(); c.translate(0, bob);
  mountTail(kind, sw);
  if (kind === 'smilodon') {                                                                   // silný krk – pod tělem, ať plynule vyrůstá z hřbetu
    c.beginPath(); c.moveTo(14, -64); c.bezierCurveTo(26, -68, 36, -70, 42, -66); c.lineTo(44, -52); c.bezierCurveTo(40, -46, 34, -42, 28, -40); c.lineTo(14, -44); c.closePath(); fo(lg('smiNeck2', 0, -70, 0, -40, [[0, CL], [1, C]]), 1.6);
    c.fillStyle = '#2a1608'; for (const x of [30, 35]) { c.beginPath(); c.ellipse(x, -62, 1.2, 4, 0.3, 0, Math.PI * 2); c.fill(); }
  }
  // dlouhá srst visící z břicha – kreslená pod tělem, ať horní okraj zakryje obrys břicha
  if (kind === 'mammoth' || kind === 'bear') {
    const [x0, x1, y0, L] = kind === 'mammoth' ? [-36, 38, -44, 19] : [-30, 20, -27, 9];
    c.beginPath(); c.moveTo(x0, y0);
    for (let k = 0, n = kind === 'mammoth' ? 18 : 12; k <= n; k++) { const x = x0 + (x1 - x0) * k / n, l = L * (0.6 + 0.4 * Math.sin(k * 2.3) ** 2) * (1 - Math.abs(k / n - 0.45) * 0.6);
      c.quadraticCurveTo(x - 1.5, y0 + l * 0.6, x + Math.sin(T * 2 + k) * 0.8, y0 + l); c.quadraticCurveTo(x + 1, y0 + l * 0.5, x + (x1 - x0) / n * 0.5, y0 + l * 0.35); }
    c.lineTo(x1, y0); c.closePath(); fo(CD, 1);
  }
  // tělo: obrys, stínování a srst
  const top = M.body[1] - M.body[3];
  mountBody(kind); fo(lg('mntB3' + kind, 0, top, 0, M.body[1] + M.body[3], [[0, CL], [0.5, C], [1, CD]]), 1.8);
  c.save(); mountBody(kind); c.clip();
  c.fillStyle = 'rgba(0,0,0,.2)'; c.beginPath(); c.ellipse(0, M.body[1] + M.body[3], M.body[2] * 1.1, M.body[3] * 0.5, 0, 0, Math.PI * 2); c.fill();   // stín pod břichem
  c.fillStyle = 'rgba(255,255,255,.12)'; c.beginPath(); c.ellipse(-4, top + 4, M.body[2] * 0.8, 4, -0.05, 0, Math.PI * 2); c.fill();                 // lesk hřbetu
  c.fillStyle = 'rgba(0,0,0,.1)'; c.beginPath(); c.ellipse(M.legs[2][0], M.body[1] + 2, M.body[3] * 0.9, M.body[3] * 1.1, 0.2, 0, Math.PI * 2); c.fill();  // stín stehna
  if (kind === 'mammoth' || kind === 'bear') {
    c.strokeStyle = 'rgba(30,16,6,.35)'; c.lineWidth = 1.3; const n = kind === 'mammoth' ? 22 : 16;
    for (let k = 0; k < n; k++) { const x = -M.body[2] + 2 + k * (M.body[2] * 2 / n), y = M.body[1] - M.body[3] * 0.6 + (k % 3) * 6; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x - 1.5, y + 6, x + Math.sin(T * 2 + k) * 1.2, y + 12); c.stroke(); }
  }
  if (kind === 'aurochs') { c.strokeStyle = 'rgba(230,205,160,.5)'; c.lineWidth = 2.4; c.beginPath(); c.moveTo(-28, -56); c.bezierCurveTo(-10, -57, 4, -59, 16, -62); c.stroke(); }   // světlý pruh na hřbetě
  if (kind === 'wolf') { c.fillStyle = 'rgba(235,238,242,.55)'; c.beginPath(); c.moveTo(27, -36); c.bezierCurveTo(24, -27, 16, -23, 6, -25); c.lineTo(12, -31); c.closePath(); c.fill(); }   // světlá hruď
  if (kind === 'smilodon') {
    c.fillStyle = '#f6ead2'; c.beginPath(); c.ellipse(4, -28, 38, 7, 0, 0, Math.PI * 2); c.fill();         // světlé břicho
    c.fillStyle = '#2a1608'; for (let k = 0; k < 8; k++) { const x = -38 + k * 9.5; c.beginPath(); c.moveTo(x, -66); c.quadraticCurveTo(x + 5, -54, x + 1, -42); c.quadraticCurveTo(x + 2, -54, x - 3, -64); c.closePath(); c.fill(); }
  }
  c.restore();
  // hlava; u tygra až po bližších nohách, ať rameno nezakryje čelist
  const head = () => { if (NO_BHEAD) stump(M.neck[0], M.neck[1], M.neck[2] * 0.8); else { c.save(); c.translate(0, walk ? Math.sin(ph * 2) * 0.8 : 0); mountHead(kind, at, ph); c.restore(); } };
  if (kind !== 'smilodon') head();
  if (kind === 'horse') {
    // čabraka v barvě týmu se zlatým lemem a znakem, sedí na ní rytíř
    const [sx, sy] = M.seat;
    c.save(); c.translate(sx, sy);
    c.beginPath(); c.moveTo(-19, 2); c.quadraticCurveTo(0, -2, 17, 1); c.lineTo(19, 15);
    for (let i = 0; i < 6; i++) c.quadraticCurveTo(16 - i * 6.4, 20, 13 - i * 6.4, 15.5);
    c.lineTo(-20, 15); c.closePath(); fo(lg('capar2' + team[0], 0, 0, 0, 18, [[0, team[0]], [1, team[1]]]), 1.2);
    c.strokeStyle = '#e5c04a'; c.lineWidth = 1.3; ln(-18, 4, 17, 3);
    c.fillStyle = '#e5c04a'; circ(-1, 9, 2.8); c.fillStyle = team[1]; circ(-1, 9, 1.4);
    c.restore();
    if (!NO_RIDER) { c.save(); c.translate(sx + 1, sy + 17 + (walk ? Math.abs(Math.cos(ph)) * 0.8 : 0)); c.scale(0.85, 0.85); human(team, 1, 0, ph, at, 1, { sit: 1, plume: 1 }); c.restore(); }
  } else if (kind !== 'smilodon' && kind !== 'trex') {
    // přikrývka v barvě týmu na hřbetě a jezdec
    const [sx, sy] = M.seat;
    c.save(); c.translate(sx, sy);
    c.beginPath(); c.moveTo(-12, 2); c.quadraticCurveTo(0, -3, 12, 1); c.lineTo(11, 12); c.quadraticCurveTo(0, 14, -11, 12); c.closePath();
    fo(lg('mntBl' + team[0], 0, -2, 0, 12, [[0, team[0]], [1, team[1]]]), 1.1);
    c.fillStyle = '#e5c04a'; c.fillRect(-11, 9, 22, 1.4);
    c.restore();
    if (!NO_RIDER) { c.save(); c.translate(sx + 1, sy + 17 + (walk ? Math.abs(Math.cos(ph)) * 0.8 : 0)); c.scale(0.85, 0.85); human(team, 0, 0, ph, at, 1, { sit: 1 }); c.restore(); }
  }
  c.restore();
  if (!NO_LEGS && !under) { leg(2); leg(3); }                                                                   // bližší nohy
  if (kind === 'smilodon') { c.save(); c.translate(0, bob); head(); c.restore(); }
}

function heavy(team, age, ph, at, st) {
  const walk = st === 0;
  switch (age) {
    case 0: return mount(team, mountKind(team), ph, walk, at);
    case 1: return horse(team, ph, walk, at);
    case 2: return cannon(team, ph, at, st);
    case 3: return tank(team, ph, at);
    case 4: return mech(team, ph, walk, at);
  }
}

// noha se dvěma klouby: chodidlo stojí na zemi a posouvá se dozadu,
// při přenášení dopředu se zvedne (inverzní kinematika pro koleno)
function ikLeg(hx, hy, phase, walk, A, lift, L1, L2, kneeFwd, col, w, fy0 = -2) {
  const s = walk ? Math.sin(phase) : 0, v = walk ? Math.cos(phase) : 0;
  const fx = hx + A * s, fy = (v > 0 ? -lift * v : 0) + fy0;
  const dx = fx - hx, dy = fy - hy;
  const d = Math.min(Math.hypot(dx, dy), L1 + L2 - 0.01);
  const base = Math.atan2(dy, dx);
  const a = Math.acos(Math.max(-1, Math.min(1, (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d))));
  const ka = base + (kneeFwd ? -a : a);
  const kx = hx + Math.cos(ka) * L1, ky = hy + Math.sin(ka) * L1;
  limb([hx, hy, kx, ky, ...tipIn(kx, ky, fx, fy, w / 2)], col, w);
  return [fx, fy];
}
const legBob = (ph, walk, k) => walk ? -Math.abs(Math.cos(ph)) * k : 0;

// chodidlo pod kotníkem (y = kotník): pata, prsty na zemi a drápy – zakryje konec nohy
function dinoFoot(x, y, col) {
  c.beginPath(); c.moveTo(x - 5, y + 1); c.quadraticCurveTo(x - 5, y - 3, x, y - 3.5); c.lineTo(x + 6, y + 1); c.lineTo(x + 10, y + 3.5);
  c.quadraticCurveTo(x + 11, y + 6.5, x + 8, y + 6.5); c.lineTo(x - 4, y + 6.5); c.quadraticCurveTo(x - 6, y + 4, x - 5, y + 1); c.closePath(); fo(col, 1.2);
  c.fillStyle = '#f5f0e0'; poly([x + 9, y + 3, x + 13, y + 6.2, x + 8.5, y + 6.2]); c.fill(); poly([x + 4, y + 4, x + 7, y + 6.2, x + 3.5, y + 6.2]); c.fill();
}

function dinoHead(at) {
  const G = '#5aa64a';
  c.beginPath(); c.moveTo(10, -38); c.quadraticCurveTo(20, -48, 24, -56); c.lineTo(42, -55); c.quadraticCurveTo(46, -53, 44, -49);
  c.lineTo(31, -47); c.quadraticCurveTo(24, -38, 18, -24); c.closePath();
  fo(lg('dinoH', 0, -58, 0, -24, [[0, '#86d06e'], [1, G]]));
  c.save(); c.translate(30, -47); c.rotate(at * 0.45);
  c.beginPath(); c.moveTo(0, 0); c.lineTo(14, -1); c.quadraticCurveTo(15, 3, 11, 4); c.lineTo(1, 4); c.closePath(); fo('#4f9440', 1.3);
  c.fillStyle = '#fff'; for (let k = 0; k < 4; k++) { poly([3 + k * 3, -0.5, 4.5 + k * 3, -3, 6 + k * 3, -0.5]); c.fill(); }
  c.restore();
  c.fillStyle = '#fff'; for (let k = 0; k < 4; k++) { poly([32 + k * 3, -49, 33.5 + k * 3, -46, 35 + k * 3, -49]); c.fill(); }
  c.fillStyle = '#fff6c0'; ell(31, -52.5, 2.6, 2.2); c.fillStyle = '#111'; circ(32, -52.3, 1.2);
  c.strokeStyle = OL; c.lineWidth = 1.3; ln(28.5, -55.5, 33, -54.5);
  c.fillStyle = '#2f5f27'; circ(42, -53, 0.9);
}

// T-Rex (událost): vodorovné tělo vyvážené ocasem, mohutná stehna, velká hlava, malé ručky
function trex(ph, walk, at) {
  const M = MOUNT.trex, [C, CD, CL] = M.col, bob = legBob(ph, walk, M.bob), sw = walk ? Math.sin(ph) : 0;
  if (!NO_LEGS) qLeg('trex', -3, -40 + bob, ph + Math.PI, walk, 0, CD, 0);
  c.save(); c.translate(0, bob);
  const arm = (x, col) => { for (const pass of [0, 1]) { c.fillStyle = pass ? col : OL; const g = pass ? 0 : 2; muscle(x, -36, x + 1, -30, 4.5 + g, 3 + g, 0.2); taper(x + 1, -30, x + 5, -28, 3 + g, 2.4 + g); } c.fillStyle = '#efe6cf'; poly([x + 5, -29, x + 7, -27, x + 5, -27.6]); c.fill(); poly([x + 5, -28, x + 6.6, -25.6, x + 4.6, -26.6]); c.fill(); };
  arm(22, CD);
  const tail = [6, -42, -30, -50 + sw, -56, -46 + sw * 3, -82, -40 + sw * 5];   // začíná uvnitř těla, ať konec nevyčnívá
  const TL = tubeP(tail, 22, 2); fo(lg('trexT', 0, -56, 0, -34, [[0, CL], [0.5, C], [1, CD]]), 1.8);
  c.save(); tubeP(tail, 22, 2); c.clip(); c.fillStyle = 'rgba(40,30,10,.45)'; for (let i = 2; i < 14; i += 2) { const [x, y] = TL.P[i], [nx, ny, w] = TL.N[i]; c.beginPath(); c.moveTo(x + nx * w, y + ny * w); c.lineTo(x - nx * w * 0.2 + 2, y - ny * w * 0.2); c.lineTo(x + nx * w + 3, y + ny * w); c.fill(); } c.restore();
  // krk pod tělem, ať na spoji není čára
  tubeP([12, -44, 24, -52, 32, -50, 37, -47], 16, 13); fo(lg('trexN', 0, -58, 0, -38, [[0, CL], [1, C]]), 1.8);
  const body = () => { c.beginPath(); c.moveTo(-18, -50); c.bezierCurveTo(-6, -57, 12, -57, 24, -51); c.bezierCurveTo(31, -47, 32, -38, 25, -32); c.bezierCurveTo(14, -27, -4, -28, -15, -33); c.bezierCurveTo(-21, -37, -22, -46, -18, -50); c.closePath(); };
  body(); fo(lg('trexB', 0, -57, 0, -28, [[0, CL], [0.5, C], [1, CD]]), 2);
  c.save(); body(); c.clip();
  c.fillStyle = '#d8c89a'; c.beginPath(); c.ellipse(10, -28, 22, 6, -0.1, 0, Math.PI * 2); c.fill();                                   // světlé břicho
  c.fillStyle = 'rgba(40,30,10,.45)'; for (let k = 0; k < 6; k++) { const x = -14 + k * 7; c.beginPath(); c.moveTo(x, -56); c.quadraticCurveTo(x + 4, -50, x + 1, -43); c.quadraticCurveTo(x + 1.5, -50, x - 3, -55); c.fill(); }
  c.fillStyle = 'rgba(255,255,255,.12)'; c.beginPath(); c.ellipse(2, -53, 20, 2.6, -0.05, 0, Math.PI * 2); c.fill();
  c.restore();
  // krk a hlava; spodní čelist se otevírá na kloubu, zuby jsou vidět i při zavřené tlamě
  if (NO_BHEAD) stump(32, -48, 6);
  else {
    c.save(); c.translate(37, -47); c.rotate(0.06 - at * 0.12);
    const jaw = at * 0.55, HG = [0, 3];
    if (jaw > 0.05) { const jx = HG[0] + 26 * Math.cos(jaw) - 3 * Math.sin(jaw), jy = HG[1] + 26 * Math.sin(jaw) + 3 * Math.cos(jaw); c.fillStyle = '#4a0d0d'; c.beginPath(); c.moveTo(1, 3); c.lineTo(28, 3.5); c.lineTo(jx, jy); c.closePath(); c.fill(); }
    c.save(); c.translate(...HG); c.rotate(jaw); c.translate(-HG[0], -HG[1]);
    c.beginPath(); c.moveTo(-2, 3); c.lineTo(27, 4); c.quadraticCurveTo(30, 5.5, 27.5, 8); c.bezierCurveTo(18, 11.5, 6, 12, -3, 9.5); c.quadraticCurveTo(-6, 7, -2, 3); c.closePath(); fo(lg('trexJ', 0, 3, 0, 12, [[0, C], [1, '#c9b88a']]), 1.5);
    c.fillStyle = '#f5efdc'; for (let k = 0; k < 7; k++) { const x = 4 + k * 3.4; poly([x, 4, x + 1.2, 1 - (k % 2) * 0.6, x + 2.4, 4]); c.fill(); }
    c.restore();
    c.beginPath(); c.moveTo(-6, -2); c.bezierCurveTo(-6, -11, 6, -14, 14, -12); c.bezierCurveTo(21, -11, 28, -8, 31, -5); c.quadraticCurveTo(33.5, -2, 31.5, 1.5);
    c.lineTo(28.5, 3.5); c.lineTo(3, 3.5); c.quadraticCurveTo(-3, 4, -5, 8); c.bezierCurveTo(-9, 7.5, -8, 2, -6, -2); c.closePath();
    fo(lg('trexH', 0, -14, 0, 4, [[0, CL], [1, C]]), 1.8);
    c.fillStyle = '#f5efdc'; for (let k = 0; k < 8; k++) { const x = 3 + k * 3.3; poly([x, 3, x + 1.3, 6.5 - (k % 2) * 1.2, x + 2.6, 3]); c.fill(); }   // horní zuby přes ret
    c.strokeStyle = '#3a2e10'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(29, 3.5); c.lineTo(3, 3.5); c.quadraticCurveTo(-3, 4, -5, 8); c.stroke();
    c.fillStyle = 'rgba(40,30,10,.5)'; for (const [x, y] of [[14, -7], [19, -6], [24, -4.5]]) { c.beginPath(); c.ellipse(x, y, 1.6, 0.9, 0.2, 0, Math.PI * 2); c.fill(); }
    c.fillStyle = CD; c.beginPath(); c.moveTo(4, -11); c.quadraticCurveTo(8, -15, 12, -11.5); c.closePath(); c.fill();                // hrbolek nad okem
    c.fillStyle = '#1a1208'; c.beginPath(); c.ellipse(8, -7, 2.4, 1.7, 0, 0, Math.PI * 2); c.fill(); c.fillStyle = '#e8a33c'; c.beginPath(); c.ellipse(8.2, -7, 1.7, 1.2, 0, 0, Math.PI * 2); c.fill(); c.fillStyle = '#111'; ell(8.5, -7, 0.45, 1.1);
    c.strokeStyle = '#3a2e10'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(4, -9.5); c.quadraticCurveTo(8, -11, 12, -9); c.stroke();
    c.fillStyle = '#2a1a08'; c.beginPath(); c.ellipse(29, -3.5, 1.4, 0.8, 0.4, 0, Math.PI * 2); c.fill();
    c.restore();
  }
  arm(26, C);
  c.restore();
  if (!NO_LEGS) qLeg('trex', 3, -40 + bob, ph, walk, 0, C, 1);
}
function dino(team, ph, walk, at) {
  const G = '#5aa64a', GD = '#3f7d33', bob = legBob(ph, walk, 1.8), sw = walk ? Math.sin(ph) : 0;
  c.save(); c.translate(0, bob);
  c.beginPath(); c.moveTo(-10, -34); c.quadraticCurveTo(-36, -34 + sw * 2, -58, -26 + sw * 3); c.quadraticCurveTo(-34, -22, -10, -20); c.closePath();
  fo(lg('dinoT', 0, -36, 0, -20, [[0, '#7cc466'], [1, GD]]));
  c.restore();
  if (!NO_LEGS) { const [bx, by] = ikLeg(-3, -24 + bob, ph + Math.PI, walk, 12, 6, 12, 12, true, GD, 7.5, -6.5); dinoFoot(bx, by, '#2f5f27'); }
  c.save(); c.translate(0, bob);
  c.beginPath(); c.ellipse(0, -30, 22, 13, -0.08, 0, Math.PI * 2);
  fo(lg('dinoB', 0, -43, 0, -17, [[0, '#86d06e'], [0.6, G], [1, GD]]));
  c.fillStyle = '#d8e8a0'; ell(4, -23, 14, 5);
  c.strokeStyle = 'rgba(40,80,30,.7)'; c.lineWidth = 2.2; c.lineCap = 'round';
  for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(-14 + i * 7, -42); c.quadraticCurveTo(-12 + i * 7, -36, -15 + i * 7, -31); c.stroke(); }
  for (let i = 0; i < 5; i++) { poly([-20 + i * 7, -40.5 + Math.abs(i - 2) * 0.6, -17 + i * 7, -47.5, -14 + i * 7, -41.5]); fo('#e8a33c', 1); }
  // krk a hlava (lehce kývá do kroku); v brutálním režimu může být useknutá
  if (NO_BHEAD) stump(14, -33, 5.5);
  else { c.save(); c.translate(0, walk ? Math.sin(ph * 2) * 0.8 : 0); dinoHead(at); c.restore(); }
  limb([15, -31, 19, -26 + sw, 22, -28 + sw], G, 3);
  // sedlo a jezdec
  rr(-12, -45, 20, 6, 2); fo(team[0], 1.2);
  c.fillStyle = '#e5c04a'; c.fillRect(-12, -41, 20, 1.5);
  if (!NO_RIDER) { c.save(); c.translate(-3, -26 + (walk ? Math.abs(Math.cos(ph)) * 0.8 : 0)); c.scale(0.85, 0.85); human(team, 0, 0, ph, at, 1, { sit: 1 }); c.restore(); }
  c.restore();
  if (!NO_LEGS) { const [fx, fy] = ikLeg(4, -24 + bob, ph, walk, 12, 6, 12, 12, true, G, 8, -6.5); dinoFoot(fx, fy, '#2f5f27'); }
}

// zadní noha koně (3 články): stehno dopředu ke kolenu, holeň dozadu k hleznu, spěnka svisle ke kopytu
function hindLeg(hx, hy, phase, walk, A, lift, col, w) {
  const s = walk ? Math.sin(phase) : 0, v = walk ? Math.cos(phase) : 0, up = v > 0 ? v : 0;
  hy -= 4;                                            // kyčel je schovaná v těle, stehno z něj vyrůstá
  const fx = hx + A * s, fy = -lift * up - 2;
  const kx = fx - 2 - lift * up * 0.6, ky = fy - 11 + lift * up * 0.3;   // hlezno; při zvednutí se noha víc složí
  const L1 = 13, L2 = 11, dx = kx - hx, dy = ky - hy, d = Math.min(Math.hypot(dx, dy), L1 + L2 - 0.01);
  const a = Math.acos(Math.max(-1, Math.min(1, (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d))));
  const ka = Math.atan2(dy, dx) - a;                  // koleno (stifle) směřuje dopředu
  const sx = hx + Math.cos(ka) * L1, sy = hy + Math.sin(ka) * L1;
  limb([hx, hy, sx, sy], col, w * 1.9);               // svalnaté stehno
  limb([sx, sy, kx, ky], col, w * 1.25);              // holeň
  limb([kx, ky, ...tipIn(kx, ky, fx, fy, w * 0.42)], col, w * 0.85);   // spěnka (končí v kopytu)
  return [fx, fy];
}
function hoof(x, y) { rr(x - 2.5, y - 1.5, 6, 3.5, 1); fo('#1a1a1a', 1); }   // spodek kopyta = zem (y je o 2 výš)

function horseHead() {
  const B = '#8b5a33';
  c.beginPath(); c.moveTo(13, -38); c.lineTo(23, -56); c.quadraticCurveTo(28, -60, 32, -57); c.lineTo(40, -47); c.quadraticCurveTo(39, -43, 35, -44);
  c.lineTo(28, -48); c.lineTo(20, -30); c.closePath();
  fo(lg('horseH', 0, -60, 0, -30, [[0, '#b07a4a'], [1, B]]));
  c.fillStyle = '#2b1a0e'; c.beginPath(); c.moveTo(14, -40); c.lineTo(23, -57); c.lineTo(26, -57); c.lineTo(18, -38); c.closePath(); c.fill();
  poly([27, -58, 28, -64, 31, -58]); fo(B, 1);
  c.fillStyle = '#111'; circ(32, -53, 1.3);
}

// kůň v kohoutku ~1,6 m: kreslený o 18 % větší než původní předloha (jezdec zůstává ve své velikosti)
function horse(team, ph, walk, at) { mount(team, 'horse', ph, walk, at); }
// původní kresba koně (zůstává jen pro srovnání, hra ji nepoužívá)
function horseArt(team, ph, walk, at) {
  const B = '#8b5a33', BD = '#5e3a1f', bob = legBob(ph, walk, 1.2), sw = walk ? Math.sin(ph) : 0;
  // vzdálenější nohy
  if (!NO_LEGS) {
    hoof(...hindLeg(-14, -28 + bob, ph, walk, 10, 6, BD, 4.5));
    hoof(...ikLeg(12, -28 + bob, ph + Math.PI / 2, walk, 10, 6, 13, 15, true, BD, 4.5));
  }
  c.save(); c.translate(0, bob);
  c.beginPath(); c.moveTo(-20, -36); c.quadraticCurveTo(-34, -32, -32 + sw * 2, -14); c.quadraticCurveTo(-28, -26, -20, -30); c.closePath(); fo('#2b1a0e', 1.2);
  const hb = () => { c.beginPath(); c.moveTo(-22, -31); c.bezierCurveTo(-26, -39, -21, -45, -11, -44); c.bezierCurveTo(-1, -43, 6, -43, 11, -45);
    c.bezierCurveTo(16, -47, 21, -46, 23, -41); c.bezierCurveTo(25, -34, 21, -26, 13, -24); c.bezierCurveTo(4, -22, -8, -23, -15, -25); c.bezierCurveTo(-19, -26, -22, -28, -22, -31); c.closePath(); };
  hb(); fo(lg('horseB2', 0, -46, 0, -22, [[0, '#c08a58'], [0.5, '#a06c40'], [1, BD]]));
  c.save(); hb(); c.clip(); c.fillStyle = 'rgba(255,255,255,.14)'; c.beginPath(); c.ellipse(-4, -43, 16, 3, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = 'rgba(0,0,0,.18)'; c.beginPath(); c.ellipse(0, -22, 22, 4, 0, 0, Math.PI * 2); c.fill(); c.restore();
  if (NO_BHEAD) stump(17, -35, 4.5);
  else { c.save(); c.translate(0, walk ? Math.sin(ph * 2) * 1 : 0); horseHead(); c.restore(); }
  // bližší zadní noha pod čabrakou, ať stehno vyrůstá z těla
  if (!NO_LEGS) { c.save(); c.translate(0, -bob); hoof(...hindLeg(-9, -28 + bob, ph + Math.PI, walk, 10, 6, B, 4.8)); c.restore(); }
  // čabraka
  c.beginPath(); c.moveTo(-20, -40); c.lineTo(14, -40); c.lineTo(16, -26);
  for (let i = 0; i < 6; i++) c.quadraticCurveTo(13 - i * 6, -21, 10 - i * 6, -26);
  c.lineTo(-21, -27); c.closePath();
  fo(lg('capar' + team[0], 0, -40, 0, -22, [[0, team[0]], [1, team[1]]]), 1.2);
  c.strokeStyle = '#e5c04a'; c.lineWidth = 1.4; ln(-20, -38, 14, -38);
  c.fillStyle = '#e5c04a'; circ(-3, -32, 3); c.fillStyle = team[1]; circ(-3, -32, 1.5);
  if (!NO_RIDER) { c.save(); c.translate(-3, -29); c.scale(0.73, 0.73); human(team, 1, 0, ph, at, 1, { sit: 1, plume: 1 }); c.restore(); }
  c.restore();
  // bližší nohy
  if (!NO_LEGS) {
    hoof(...ikLeg(17, -28 + bob, ph + Math.PI * 1.5, walk, 10, 6, 13, 15, true, B, 4.8));
  }
}

function cannon(team, ph, at, st) {
  c.save(); c.translate(-30, 0); human(team, 2, -1, ph, 0, st); c.restore();
  c.beginPath(); c.moveTo(-22, -3); c.lineTo(4, -20); c.lineTo(10, -16); c.lineTo(-18, 1); c.closePath();
  fo(lg('carr', 0, -20, 0, 0, [[0, '#9b6a3c'], [1, '#5c3a1e']]), 1.3);
  c.save(); c.translate(4 - at * 7, -22); c.rotate(-0.14);
  rr(-16, -6.5, 42, 13, 6); fo(lg('bronze', 0, -7, 0, 7, [[0, '#f3d27a'], [0.45, '#c08a2e'], [1, '#6e4a14']]), 1.4);
  for (const x of [-8, 6, 18]) { rr(x, -7.5, 3, 15, 1); fo('#a8741f', 1); }
  rr(24, -8.5, 6, 17, 2); fo('#c08a2e', 1.3);
  c.fillStyle = '#1a1a1a'; ell(30, 0, 1.6, 5);
  c.beginPath(); c.arc(-17, 0, 4, 0, Math.PI * 2); fo('#a8741f', 1.2);
  c.restore();
  const wr = ph * 0.35;
  c.beginPath(); c.arc(0, -12, 12, 0, Math.PI * 2); fo('#7a4a24', 1.6);
  c.beginPath(); c.arc(0, -12, 9, 0, Math.PI * 2); c.fillStyle = '#9b6a3c'; c.fill();
  c.strokeStyle = '#5c3a1e'; c.lineWidth = 2;
  for (let i = 0; i < 4; i++) { const a = wr + i * Math.PI / 4; ln(-Math.cos(a) * 9, -12 - Math.sin(a) * 9, Math.cos(a) * 9, -12 + Math.sin(a) * 9); }
  c.beginPath(); c.arc(0, -12, 3, 0, Math.PI * 2); fo('#3c3f46', 1);
}

function tank(team, ph, at) {
  c.save(); c.translate(0, -2);
  rr(-35, -16, 70, 17, 8.5); fo('#262626', 1.6);
  c.fillStyle = '#4a4a4a';
  const off = (ph * 2) % 6;
  for (let x = -32 + off; x < 32; x += 6) { c.fillRect(x, -16, 3, 2); c.fillRect(x, -1, 3, 2); }
  for (let i = 0; i < 6; i++) { c.beginPath(); c.arc(-26 + i * 10.4, -7.5, 5, 0, Math.PI * 2); fo('#555b61', 1.1); c.fillStyle = '#2d3136'; circ(-26 + i * 10.4, -7.5, 1.8); }
  rr(-37, -20, 74, 5, 2); fo('#4b5530', 1.2);
  c.beginPath(); c.moveTo(-34, -20); c.lineTo(-28, -32); c.lineTo(24, -32); c.lineTo(35, -20); c.closePath();
  fo(lg('hull', 0, -32, 0, -20, [[0, '#8a9a5b'], [1, '#4f5c33']]), 1.4);
  c.fillStyle = 'rgba(55,65,35,.8)'; ell(-14, -26, 6, 3); ell(10, -27, 7, 2.5);
  c.fillStyle = team[0]; c.fillRect(-28, -24, 56, 2.5);
  c.beginPath(); c.arc(-20, -27, 3, 0, Math.PI * 2); fo('#fff', 0.8); c.fillStyle = team[0]; circ(-20, -27, 1.6);
  c.strokeStyle = '#2b2b2b'; c.lineWidth = 1; ln(-12, -46, -17, -68);
  rr(12 - at * 7, -42, 34, 5.5, 2); fo(lg('barrel', 0, -42, 0, -36, [[0, '#6f7f45'], [1, '#384126']]), 1.2);
  rr(42 - at * 7, -43, 7, 7.5, 1.5); fo('#384126', 1.2);
  c.beginPath(); c.moveTo(-16, -32); c.lineTo(-13, -45); c.quadraticCurveTo(0, -48, 14, -44); c.lineTo(18, -32); c.closePath();
  fo(lg('turret', 0, -48, 0, -32, [[0, '#93a463'], [1, '#55623a']]), 1.4);
  c.beginPath(); c.ellipse(-4, -46, 6, 2.2, 0, 0, Math.PI * 2); fo('#5f6d40', 1);
  c.restore();
}

function mech(team, ph, walk, at) {
  const L = '#5b6478', LD = '#3a4152', bob = legBob(ph, walk, 2);
  const [bx, by] = ikLeg(-4, -40 + bob, ph + Math.PI, walk, 12, 8, 20, 20, false, LD, 7);
  rr(bx - 6, by - 2, 13, 4, 1.5); fo('#262b38', 1.2);
  c.save(); c.translate(0, bob);
  c.beginPath(); c.moveTo(-20, -70); c.lineTo(16, -73); c.lineTo(24, -58); c.lineTo(17, -40); c.lineTo(-17, -40); c.lineTo(-23, -56); c.closePath();
  fo(lg('mechB', 0, -73, 0, -40, [[0, '#7c869c'], [0.5, L], [1, '#262b38']]), 1.6);
  rr(-17, -88, 16, 13, 2); fo('#3a4152', 1.3);
  c.fillStyle = '#11151f'; for (let k = 0; k < 3; k++) circ(-13 + k * 4.5, -81.5, 1.4);
  limb([-9, -75, -9, -70], '#3a4152', 3);
  c.fillStyle = team[0]; c.fillRect(-19, -54, 40, 3.5);
  glowLine(-17, -52.3, 19, -52.3, team[2], 0.7);
  rr(4, -68, 14, 7, 2.5); c.fillStyle = '#0b1220'; c.fill();
  glowLine(6.5, -64.5, 15.5, -64.5, '#38e1ff', 2);
  c.restore();
  const [fx, fy] = ikLeg(4, -40 + bob, ph, walk, 12, 8, 20, 20, false, L, 7.5);
  rr(fx - 6, fy - 2, 14, 4, 1.5); fo('#2f3544', 1.2);
  c.save(); c.translate(0, bob);
  c.beginPath(); c.arc(0, -40, 5, 0, Math.PI * 2); fo('#2f3544', 1.2);
  rr(10 - at * 6, -56, 36, 10, 3); fo(lg('mechG', 0, -56, 0, -46, [[0, '#6b7590'], [1, '#1f2430']]), 1.4);
  c.fillStyle = team[0]; for (let k = 0; k < 3; k++) c.fillRect(16 - at * 6 + k * 6, -55.5, 2.2, 9);
  glowDot(48 - at * 6, -51, 6 + Math.sin(T * 9) * 1.5, '#b388ff');
  c.restore();
}

function drawUnitLocal(team, a, ty, ph, at, st) {
  if (ty === 5) drawBoss(team, a, ph, at, st);
  else if (ty === 6) {                                 // speciální jednotka národa: větší, zlatý lem a znak schopnosti
    const d = SPECS[a][(team.af && team.af[a]) | 0];
    c.fillStyle = 'rgba(229,192,74,.35)'; ell(0, 1, 15, 3.5);
    c.save(); c.scale(1.15, 1.15); human(team, a, d.p ? 1 : 0, ph, at, st, { elite: 1 }); c.restore();
    c.save(); c.translate(0, -74); if (c.getTransform().a < 0) c.scale(-1, 1);
    c.font = '12px system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillStyle = 'rgba(15,20,30,.75)'; circ(0, 0, 8); c.fillStyle = '#fff'; c.fillText(SPEC_IC[d.ab], 0, 0.5); c.textBaseline = 'alphabetic';
    c.restore();
  }
  else if (ty === 2) heavy(team, a, ph, at, st);
  else if (ty === 3) {
    const op = c.globalCompositeOperation; c.globalCompositeOperation = 'lighter';
    c.globalAlpha *= 0.35 + Math.sin(T * 5) * 0.1;
    c.fillStyle = rg('aura', 0, -30, 2, 40, [[0, 'rgba(255,220,80,.9)'], [1, 'rgba(255,160,0,0)']]); ell(0, -30, 26, 44);
    c.globalAlpha /= 0.35 + Math.sin(T * 5) * 0.1; c.globalCompositeOperation = op;
    c.save(); c.scale(1.45, 1.45); human(team, 4, 1, ph, at, st, { super: 1 }); c.restore();
  } else if (ty === 4) {
    const op = c.globalCompositeOperation; c.globalCompositeOperation = 'lighter';
    c.fillStyle = rg('haura', 0, -34, 2, 34, [[0, 'rgba(255,230,120,.35)'], [1, 'rgba(255,200,60,0)']]); ell(0, -34, 22, 38);
    c.globalCompositeOperation = op;
    c.save(); c.scale(1.3, 1.3); human(team, a, 0, ph, at, st, { hero: 1 }); c.restore();
  } else human(team, a, ty, ph, at, st);
}
