// =====================================================================
//  TĚŽKÉ JEDNOTKY – jezdci, T-Rex, kůň, dělo, tank, robot a výběr kresby jednotky
// =====================================================================
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
