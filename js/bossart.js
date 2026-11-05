// =====================================================================
//  BOSSOVÉ KAMPANĚ – obří nepřátelé na konci každého věku
// =====================================================================
function drawBoss(team, a, ph, at, st) {
  const walk = st === 0 ? 1 : 0, bob = Math.sin(ph * 0.5) * 2 * walk;
  BOSS_ART[a](team, ph, at, st, walk, bob);
}
// pomocníci pro bosse
function rivets(pts, r = 1.4) { for (const [x, y] of pts) { c.fillStyle = 'rgba(0,0,0,.45)'; circ(x + 0.5, y + 0.6, r); c.fillStyle = 'rgba(255,255,255,.55)'; circ(x - 0.3, y - 0.3, r * 0.6); } }
function furTufts(cx, cy, rx, ry, n, cols, seed) {
  let q = seed; const r = () => (q = (q * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < n; i++) {
    const a = r() * Math.PI * 2, d = Math.sqrt(r()), x = cx + Math.cos(a) * rx * d, y = cy + Math.sin(a) * ry * d, l = 8 + r() * 10;
    c.strokeStyle = cols[i % cols.length]; c.lineWidth = 1.6 + r() * 1.4;
    c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x - 2 + r() * 4, y + l * 0.6, x + Math.sin(T * 1.6 + i) * 1.5 - 1, y + l); c.stroke();
  }
}
const BOSS_ART = [
  // ---------------- šavlozubý tygr (Smilodon: mohutné tělo, krátký ocas, šavle) ----------------
  (team, ph, at, st, walk) => {
    const pounce = at > 0 ? Math.sin(at * Math.PI) : 0;
    c.save(); c.scale(0.85, 0.85);                     // ~1,6 m v kohoutku (skutečný šavlozubec ~1,1 m, boss je o něco větší)
    c.translate(pounce * 12, -pounce * 6); c.rotate(-pounce * 0.1);
    mount(team, 'smilodon', ph * 0.8, walk, at);
    c.restore();
    if (pounce > 0.3) for (let k = 0; k < 3; k++) { c.fillStyle = 'rgba(160,130,90,' + 0.4 * pounce + ')'; circ(-20 + k * 18, -3, 5 + k * 2); }   // prach při skoku
  },

  // ---------------- drak: štíhlé tělo, esovitý krk, blanitá křídla s prsty, svalnaté nohy pod tělem ----------------
  (team, ph, at) => {
    const y0 = BOSS_STILL ? -112 : -112 + Math.sin(T * 2.5) * 7, flap = BOSS_STILL ? -0.5 : Math.sin(T * 5.5);
    c.save(); c.translate(0, y0);
    const SC = ['#24502a', '#357a3a', '#58a352'], BEL = ['#f3dd96', '#c49a45'], SPK = '#8f1d1d';
    // zužující se trubice podél Bézierovy křivky (krk, ocas): w0 → w1
    const tube = (p, w0, w1, n = 18) => {
      const P = [], N = [];
      for (let i = 0; i <= n; i++) {
        const t = i / n, u = 1 - t, x = u * u * u * p[0] + 3 * u * u * t * p[2] + 3 * u * t * t * p[4] + t * t * t * p[6], y = u * u * u * p[1] + 3 * u * u * t * p[3] + 3 * u * t * t * p[5] + t * t * t * p[7];
        const dx = 3 * u * u * (p[2] - p[0]) + 6 * u * t * (p[4] - p[2]) + 3 * t * t * (p[6] - p[4]), dy = 3 * u * u * (p[3] - p[1]) + 6 * u * t * (p[5] - p[3]) + 3 * t * t * (p[7] - p[5]), L = Math.hypot(dx, dy) || 1;
        P.push([x, y]); N.push([-dy / L, dx / L, (w0 + (w1 - w0) * t) / 2]);
      }
      c.beginPath(); P.forEach(([x, y], i) => c.lineTo(x + N[i][0] * N[i][2], y + N[i][1] * N[i][2]));
      for (let i = n; i >= 0; i--) c.lineTo(P[i][0] - N[i][0] * N[i][2], P[i][1] - N[i][1] * N[i][2]);
      c.closePath(); return { P, N };
    };
    // křídlo: pevný tvar (rameno → loket → zápěstí, z něj tři prsty, blána vykrojená mezi nimi); mávání = naklápění kolem ramene
    const wing = (k, back) => {
      c.save(); c.translate(4, -14); c.scale(1, k); c.rotate(back ? -0.08 : 0);
      const E = [-20, -38], W = [8, -78], F = [[-52, -88], [-92, -60], [-104, -18]];
      c.beginPath(); c.moveTo(0, 0); c.lineTo(...E); c.lineTo(...W);
      let prev = W;
      for (const f of F) { const mx = (prev[0] + f[0]) / 2, my = (prev[1] + f[1]) / 2; c.quadraticCurveTo(mx + (W[0] - mx) * 0.08 + 10, my + 14, f[0], f[1]); prev = f; }
      c.quadraticCurveTo(-66, 6, -36, 14); c.closePath();
      c.globalAlpha *= 0.94; fo(lg('drW4' + back + team[0], -100, -90, -10, 10, [[0, back ? team[1] : team[0]], [0.75, back ? '#141414' : team[1]], [1, '#0d0d0d']]), 2); c.globalAlpha /= 0.94;
      c.save(); c.clip(); c.fillStyle = 'rgba(0,0,0,.22)'; c.beginPath(); c.moveTo(...W); c.lineTo(...F[0]); c.lineTo(...F[1]); c.lineTo(...W); c.fill();
      c.fillStyle = 'rgba(255,255,255,.08)'; c.beginPath(); c.moveTo(...W); c.lineTo(...F[1]); c.lineTo(...F[2]); c.closePath(); c.fill(); c.restore();
      // kosti: tmavší odstín blány (ne zelené čáry přes křídlo), prsty jemné a zužující se
      c.lineCap = 'round'; c.lineJoin = 'round';
      c.strokeStyle = 'rgba(0,0,0,.5)'; c.lineWidth = 4.2; c.beginPath(); c.moveTo(0, 0); c.lineTo(...E); c.lineTo(...W); c.stroke();
      c.strokeStyle = 'rgba(255,255,255,.18)'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(0, -1); c.lineTo(E[0], E[1] - 1); c.lineTo(W[0], W[1] - 1); c.stroke();
      c.fillStyle = back ? '#10141c' : '#1c2333'; for (const f of F) { const p = [W[0], W[1], (W[0] * 2 + f[0]) / 3 + 2, (W[1] * 2 + f[1]) / 3 - 2, (W[0] + f[0] * 2) / 3 + 2, (W[1] + f[1] * 2) / 3 - 2, f[0], f[1]]; tube(p, 3, 0.6, 10); c.fill(); }
      c.fillStyle = '#e5e7eb'; poly([W[0] - 2, W[1] + 2, W[0] + 4, W[1] - 8, W[0] + 4, W[1] + 3]); c.fill();      // dráp na zápěstí
      c.restore();
    };
    // zadní noha (sedí pod bokem, v letu přitažená): stehno dopředu, holeň dozadu, pařát s drápy
    const legD = (hx, back) => {
      const col = back ? SC[0] : SC[1], sw = Math.sin(T * 2.5 + hx) * 2;
      const H = [hx, 6], K = [hx + 12, 20 + sw * 0.3], A = [hx + 2, 32 + sw], Fo = [hx + 9, 38 + sw];
      for (const pass of [0, 1]) { c.fillStyle = pass ? col : OL; const g = pass ? 0 : 2.4; muscle(H[0], H[1], K[0], K[1], 20 + g, 10 + g, 0.35); muscle(K[0], K[1], A[0], A[1], 10 + g, 6 + g, 0.1); taper(A[0], A[1], Fo[0], Fo[1], 6 + g, 5 + g); }
      c.fillStyle = '#e5e7eb'; for (let j = 0; j < 3; j++) { c.beginPath(); c.moveTo(Fo[0] - 2 + j * 3.2, Fo[1] + 1); c.quadraticCurveTo(Fo[0] + 2 + j * 3.2, Fo[1] + 4, Fo[0] + j * 3.2, Fo[1] + 8); c.lineTo(Fo[0] + 2 + j * 3.2, Fo[1] + 1); c.closePath(); c.fill(); }
    };
    const armD = (sx, back) => {                         // přední pracka (menší, pod hrudí)
      const col = back ? SC[0] : SC[1], k = Math.sin(T * 3 + sx) * 2;
      const S = [sx, 4], E = [sx - 4, 16], W = [sx + 6, 24 + k];
      for (const pass of [0, 1]) { c.fillStyle = pass ? col : OL; const g = pass ? 0 : 2.4; muscle(S[0], S[1], E[0], E[1], 11 + g, 7 + g, 0.25); muscle(E[0], E[1], W[0], W[1], 7 + g, 5 + g, 0.1); }
      c.fillStyle = '#e5e7eb'; for (let j = 0; j < 3; j++) poly([W[0] + j * 2.6, W[1] + 1, W[0] + 2.5 + j * 2.6, W[1] + 6, W[0] + 3.2 + j * 2.6, W[1]]), c.fill();
    };
    wing(0.72 + flap * 0.3, 1);
    // ocas: dlouhá zužující se trubice s ostny a šipkou na konci
    const tw = Math.sin(T * 3) * 12, tail = [-34, 4, -70, 22, -100, tw - 6, -140, 10 + tw * 0.6];
    const TL = tube(tail, 22, 4); fo(lg('drTail', 0, -10, 0, 30, [[0, SC[2]], [0.5, SC[1]], [1, SC[0]]]), 2);
    c.fillStyle = SPK; for (let i = 3; i < 17; i += 2) { const [x, y] = TL.P[i], [nx, ny, w] = TL.N[i]; poly([x + nx * w - ny * 3, y + ny * w + nx * 3, x + nx * (w + 8 - i * 0.3), y + ny * (w + 8 - i * 0.3), x + nx * w + ny * 3, y + ny * w - nx * 3]); c.fill(); }
    { const [x, y] = TL.P[18], [nx, ny] = TL.N[18], dx = ny, dy = -nx; c.beginPath(); c.moveTo(x + dx * 2, y + dy * 2); c.lineTo(x - dx * 16 - nx * 9, y - dy * 16 - ny * 9); c.lineTo(x - dx * 10, y - dy * 10); c.lineTo(x - dx * 16 + nx * 9, y - dy * 16 + ny * 9); c.closePath(); fo(SPK, 1.6); }
    legD(-26, 1); armD(30, 1);
    // tělo: obrys z křivek, šupiny, světlé břišní pláty
    const bodyP = () => { c.beginPath(); c.moveTo(-40, 6); c.bezierCurveTo(-42, -10, -24, -20, -2, -20); c.bezierCurveTo(18, -20, 34, -16, 40, -4);
      c.bezierCurveTo(44, 8, 34, 18, 16, 19); c.bezierCurveTo(-6, 21, -30, 18, -40, 6); c.closePath(); };
    bodyP(); fo(lg('drB3', 0, -22, 0, 22, [[0, SC[2]], [0.45, SC[1]], [1, SC[0]]]), 2.4);
    c.save(); bodyP(); c.clip();
    c.strokeStyle = 'rgba(16,40,16,.4)'; c.lineWidth = 1;
    for (let r = 0; r < 5; r++) for (let x = -46 + (r % 2) * 5; x < 46; x += 10) { c.beginPath(); c.arc(x, -18 + r * 7, 5, 0.25, Math.PI - 0.25); c.stroke(); }
    c.fillStyle = 'rgba(255,255,255,.14)'; c.beginPath(); c.ellipse(-2, -14, 30, 4, -0.05, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.moveTo(-36, 12); c.bezierCurveTo(-16, 8, 14, 6, 40, 0); c.lineTo(44, 30); c.lineTo(-40, 30); c.closePath();
    c.fillStyle = lg('drBel3', 0, 4, 0, 20, [[0, BEL[0]], [1, BEL[1]]]); c.fill();
    c.strokeStyle = 'rgba(110,80,30,.6)'; c.lineWidth = 1.2; for (let x = -30; x < 40; x += 7) ln(x, 4, x - 2, 24);
    c.restore();
    c.fillStyle = SPK; for (let k = 0; k < 6; k++) { const x = -30 + k * 10; poly([x - 4, -18 - Math.sin(k / 5 * 3) * 1.5, x + 1, -30 + Math.abs(k - 2.5) * 1.6, x + 5, -18.5]); c.fill(); }   // hřbetní ostny
    // krk: esovitá trubice od plece k hlavě, světlé pláty na spodní straně
    const nk = [26, -8, 46, -10, 46, -34, 64, -42];
    const NK = tube(nk, 24, 14); fo(lg('drNk', 30, -40, 50, 0, [[0, SC[2]], [1, SC[1]]]), 2);
    c.save(); tube(nk, 24, 14); c.clip(); c.strokeStyle = BEL[0]; c.lineWidth = 7; c.beginPath(); NK.P.forEach(([x, y], i) => c.lineTo(x - NK.N[i][0] * NK.N[i][2], y - NK.N[i][1] * NK.N[i][2])); c.stroke();
    c.strokeStyle = 'rgba(110,80,30,.55)'; c.lineWidth = 1; for (let i = 2; i < 18; i += 2) { const [x, y] = NK.P[i], [nx, ny, w] = NK.N[i]; ln(x - nx * w, y - ny * w, x - nx * (w - 5), y - ny * (w - 5)); } c.restore();
    c.fillStyle = SPK; for (let i = 2; i < 16; i += 3) { const [x, y] = NK.P[i], [nx, ny, w] = NK.N[i]; poly([x + nx * w - ny * 3, y + ny * w + nx * 3, x + nx * (w + 7), y + ny * (w + 7), x + nx * w + ny * 3, y + ny * w - nx * 3]); c.fill(); }
    // hlava: jeden tvar lebky s linkou tlamy; spodní čelist se otevírá kolem kloubu vzadu, v zavřené tlamě jen tesáky
    c.save(); c.translate(64, -44); c.rotate(0.1 + at * 0.12);
    const jaw = at * 0.6, HG = [-6, 3];
    for (const [x, l, cl] of [[-6, 30, '#bdb5a0'], [0, 24, '#ece7da']]) {               // rohy zahnuté dozadu (zužující se)
      const p = [x + 2, -9, x - l * 0.35, -l * 0.5 - 8, x - l * 0.75, -l * 0.62 - 10, x - l, -l * 0.5 - 14];
      tube(p, 7, 1, 10); fo(cl, 1.3);
    }
    if (jaw > 0.05) {                                                                 // hrdlo a horní zuby (vidět jen při otevřené tlamě)
      c.fillStyle = '#4a0d0d'; c.beginPath(); c.moveTo(-8, 4); c.lineTo(33, 2); c.lineTo(HG[0] + Math.cos(jaw) * 36, HG[1] + Math.sin(jaw) * 36 + 4); c.closePath(); c.fill();
      c.fillStyle = '#f5f1e6'; for (let k = 0; k < 6; k++) { const x = 6 + k * 4.6; poly([x, 2, x + 1.6, 6 + (k === 4 ? 2 : 0), x + 3.2, 2]); c.fill(); }
    }
    c.save(); c.translate(...HG); c.rotate(jaw); c.translate(-HG[0], -HG[1]);           // spodní čelist
    c.beginPath(); c.moveTo(-9, 3); c.lineTo(31, 2.4); c.quadraticCurveTo(35, 3.5, 32.5, 6.5); c.bezierCurveTo(22, 10, 6, 11.5, -5, 9.5); c.quadraticCurveTo(-10, 8, -9, 3); c.closePath();
    fo(lg('drJaw', 0, 2, 0, 11, [[0, SC[1]], [0.6, SC[0]], [1, '#e0c27a']]), 1.6);
    if (jaw > 0.05) { c.fillStyle = '#f5f1e6'; for (let k = 0; k < 5; k++) { const x = 8 + k * 4.8; poly([x, 2.6, x + 1.5, -1.5, x + 3, 2.6]); c.fill(); } }
    c.restore();
    c.beginPath(); c.moveTo(-14, -4); c.bezierCurveTo(-14, -14, -2, -19, 10, -16); c.bezierCurveTo(18, -14, 26, -10, 34, -7.5); c.quadraticCurveTo(40, -5.5, 39.5, -1.5);
    c.quadraticCurveTo(39, 2.5, 33, 2.5); c.lineTo(4, 2.5); c.quadraticCurveTo(-4, 2.5, -8, 5.5); c.bezierCurveTo(-12, 6.5, -14, 2, -14, -4); c.closePath();
    fo(lg('drHd4', 0, -18, 0, 4, [[0, SC[2]], [1, SC[1]]]), 2);
    c.save(); c.clip(); c.fillStyle = 'rgba(255,255,255,.14)'; c.beginPath(); c.ellipse(14, -12, 16, 3, 0.15, 0, Math.PI * 2); c.fill();
    c.strokeStyle = 'rgba(16,40,16,.35)'; c.lineWidth = 0.9; for (let x = -8; x < 30; x += 6) { c.beginPath(); c.arc(x, -6 + x * 0.05, 3.5, 0.3, Math.PI - 0.3); c.stroke(); } c.restore();
    c.strokeStyle = '#163018'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(33, 2.5); c.lineTo(4, 2.5); c.quadraticCurveTo(-4, 2.5, -8, 5.5); c.stroke();   // linka tlamy
    if (jaw <= 0.05) { c.fillStyle = '#f5f1e6'; for (const x of [14, 27]) { poly([x, 2, x + 1.2, 6.5, x + 2.6, 2]); c.fill(); } }                       // tesáky přes ret
    c.fillStyle = SPK; for (const x of [-12, -7]) poly([x, 1, x - 7, 7, x - 1, 5]), c.fill();           // ostny na lících
    c.fillStyle = '#1a1a1a'; ell(9, -8, 5, 3.6); glowDot(9, -8, 7, '#fbbf24'); c.fillStyle = '#fde047'; ell(9, -8, 3.6, 2.6); c.fillStyle = '#111'; ell(9.6, -8, 1, 2.4);
    c.strokeStyle = '#163018'; c.lineWidth = 2.4; c.beginPath(); c.moveTo(1, -12.5); c.quadraticCurveTo(9, -15, 18, -11.5); c.stroke();     // nadočnicový val
    c.fillStyle = '#163018'; c.beginPath(); c.ellipse(35.5, -4.5, 1.9, 1.1, 0.3, 0, Math.PI * 2); c.fill();                                 // nozdra
    if (!at && Math.sin(T * 2) > 0.6) { c.fillStyle = 'rgba(120,120,120,.4)'; circ(42 + (T * 20) % 10, -8 - (T * 20) % 10, 3 + (T * 4) % 3); }
    c.restore();
    // ohnivý dech
    if (at > 0.05) {
      const g = c.createLinearGradient(80, -30, 190, 80);
      g.addColorStop(0, `rgba(255,250,200,${0.95 * at})`); g.addColorStop(0.3, `rgba(253,186,40,${0.9 * at})`); g.addColorStop(0.7, `rgba(239,68,30,${0.7 * at})`); g.addColorStop(1, 'rgba(120,20,10,0)');
      c.fillStyle = g; c.beginPath(); c.moveTo(94, -30); c.quadraticCurveTo(150, -26 + Math.sin(T * 30) * 6, 196, 70); c.quadraticCurveTo(160, 84, 130, 66); c.quadraticCurveTo(110, 20, 94, -24); c.closePath(); c.fill();
      for (let k = 0; k < 8; k++) { const t = Math.random(); c.fillStyle = `rgba(255,${180 + (t * 60) | 0},60,${at})`; circ(100 + t * 90 + Math.random() * 14, -20 + t * 86 + Math.random() * 14, 1.5 + Math.random() * 2); }
    }
    legD(-18, 0);
    armD(34, 0);
    wing(0.72 - flap * 0.26, 0);
    c.restore();
  },

  // ---------------- Leonardův obrněný vůz ----------------
  (team, ph, at, st, walk) => {
    const W1 = '#8a5a30', W2 = '#5c3a1e', W3 = '#b07a48', IR = '#4b5563';
    // kola s paprsky (otáčí se při jízdě)
    const wheel = (x, back) => {
      c.save(); c.translate(x, -14); c.beginPath(); c.arc(0, 0, 14, 0, Math.PI * 2); fo(back ? W2 : W1, 1.6);
      c.rotate(ph * 0.35); c.strokeStyle = back ? '#3c2412' : W2; c.lineWidth = 2.6; for (let k = 0; k < 6; k++) { c.rotate(Math.PI / 3); ln(0, 0, 12, 0); }
      c.fillStyle = IR; circ(0, 0, 3.4); c.restore();
      c.strokeStyle = IR; c.lineWidth = 2.2; c.beginPath(); c.arc(x, -14, 14, 0, Math.PI * 2); c.stroke();
    };
    wheel(-40, 1); wheel(40, 1);
    // spodní věnec s dělovými otvory
    c.beginPath(); c.moveTo(-78, -24); c.lineTo(78, -24); c.lineTo(72, -6); c.lineTo(-72, -6); c.closePath(); fo(lg('leoBase', 0, -24, 0, -6, [[0, W3], [1, W2]]), 1.8);
    // děla vystrčená do všech stran (zpětný ráz při výstřelu)
    for (const [x, d] of [[-70, -1], [-40, -1], [40, 1], [70, 1]]) {
      const rec = d > 0 ? at * 6 : 0;
      c.save(); c.translate(x, -16); rr(d > 0 ? -rec : -12, -2.8, 12, 5.6, 2); fo('#2b2b2b', 1.1); c.restore();
      c.fillStyle = '#111'; circ(x, -16, 2.4);
    }
    // kuželová střecha ze šindelů (jako želví krunýř)
    const roof = () => { c.beginPath(); c.moveTo(-76, -24); c.quadraticCurveTo(-66, -70, -14, -86); c.lineTo(14, -86); c.quadraticCurveTo(66, -70, 76, -24); c.closePath(); };
    roof(); fo(lg('leoRoof', 0, -86, 0, -24, [[0, W3], [0.6, W1], [1, W2]]), 2.2);
    c.save(); roof(); c.clip();
    c.strokeStyle = 'rgba(40,24,10,.45)'; c.lineWidth = 1.2;
    for (let r = 0; r < 6; r++) { const y = -30 - r * 10; c.beginPath(); c.moveTo(-90, y); c.quadraticCurveTo(0, y - 8, 90, y); c.stroke();
      for (let x = -80 + (r % 2) * 8; x < 80; x += 16) ln(x, y, x + 1, y - 10); }
    c.fillStyle = 'rgba(255,255,255,.12)'; c.beginPath(); c.ellipse(-20, -66, 30, 8, -0.3, 0, Math.PI * 2); c.fill();
    c.restore();
    // železné pásy a nýty
    c.strokeStyle = IR; c.lineWidth = 3; c.beginPath(); c.moveTo(-70, -36); c.quadraticCurveTo(0, -56, 70, -36); c.stroke();
    rivets([-50, -25, 0, 25, 50].map(x => [x, -40 - (1 - Math.abs(x) / 70) * 8]), 1.2);
    // pozorovatelna s prapory
    rr(-14, -100, 28, 16, 4); fo(W1, 1.6); c.fillStyle = '#1a1208'; for (const x of [-8, 0, 8]) c.fillRect(x - 2, -95, 4, 6);
    c.beginPath(); c.moveTo(-17, -100); c.lineTo(0, -112); c.lineTo(17, -100); c.closePath(); fo(W2, 1.5);
    c.strokeStyle = W2; c.lineWidth = 2.2; ln(0, -112, 0, -134);
    const fl = Math.sin(T * 4) * 3;
    c.beginPath(); c.moveTo(0, -134); c.quadraticCurveTo(12, -134 + fl, 24, -130 + fl); c.lineTo(22, -122 + fl); c.quadraticCurveTo(12, -124 + fl, 0, -124); c.closePath(); fo(team[0], 1.2);
    c.fillStyle = '#e5c04a'; circ(10, -128 + fl * 0.5, 2.2);
    // Leonardův podpis na boku – vitruviánský kruh
    c.strokeStyle = 'rgba(40,24,10,.6)'; c.lineWidth = 1.2; c.beginPath(); c.arc(0, -46, 7, 0, Math.PI * 2); c.stroke(); ln(-7, -46, 7, -46); ln(0, -53, 0, -39);
    wheel(-30, 0); wheel(30, 0);
    // dým z hlavní při výstřelu
    if (at > 0.5) for (let k = 0; k < 3; k++) { c.fillStyle = `rgba(200,200,200,${0.5 * at})`; circ(86 + k * 8, -16 - k * 4, 5 + k * 3); }
  },

  // ---------------- pozemní křižník – obří tank se třemi věžemi ----------------
  (team, ph, at, st, walk) => {
    const tw = ph * 1.6;
    // pásy s články a koly
    const track = () => { rr(-82, -34, 166, 34, 17); };
    track(); fo('#1a1c18', 2.2);
    c.save(); track(); c.clip();
    c.fillStyle = '#2a2d26'; for (let k = 0; k < 24; k++) { const x = -86 + ((k * 7.4 + tw * 4) % 177); c.fillRect(x, -36, 4.2, 5); c.fillRect(x, -4, 4.2, 5); }
    c.restore();
    for (let k = 0; k < 8; k++) { const x = -64 + k * 18.5; c.beginPath(); c.arc(x, -15, 9.5, 0, Math.PI * 2); fo('#3a3f36', 1.4); c.fillStyle = '#5a6054'; circ(x, -15, 5); c.save(); c.translate(x, -15); c.rotate(tw * 0.6); c.fillStyle = '#2a2d26'; for (let s = 0; s < 4; s++) { c.rotate(Math.PI / 2); c.fillRect(1.5, -1, 3, 2); } c.restore(); }
    for (const x of [-78, 78]) { c.beginPath(); c.arc(x, -18, 11, 0, Math.PI * 2); fo('#3a3f36', 1.4); c.fillStyle = '#5a6054'; circ(x, -18, 5); }
    // bláto
    c.fillStyle = 'rgba(90,70,40,.55)'; for (const [x, r] of [[-70, 6], [-30, 5], [10, 7], [50, 5], [76, 6]]) ell(x, -4, r, 3);
    // boční pancéřové zástěrky
    c.beginPath(); c.moveTo(-86, -34); c.lineTo(86, -34); c.lineTo(84, -22); c.lineTo(-84, -22); c.closePath(); fo(lg('btSk', 0, -34, 0, -22, [[0, '#6d7a52'], [1, '#3d4630']]), 1.6);
    rivets(Array.from({ length: 12 }, (_, i) => [-78 + i * 14.4, -28]), 1);
    // korba se šikmým pancířem
    const hull = () => { c.beginPath(); c.moveTo(-88, -34); c.lineTo(-80, -70); c.lineTo(58, -70); c.lineTo(92, -46); c.lineTo(90, -34); c.closePath(); };
    hull(); fo(lg('btH', 0, -70, 0, -34, [[0, '#86946a'], [0.5, '#5d6a44'], [1, '#3a4228']]), 2.4);
    c.save(); hull(); c.clip();
    c.fillStyle = 'rgba(40,46,28,.55)'; for (const [x, y, r] of [[-56, -58, 14], [-10, -46, 12], [30, -60, 10], [70, -48, 9]]) ell(x, y, r, r * 0.5);
    c.fillStyle = 'rgba(120,90,50,.35)'; for (const [x, y, r] of [[-30, -62, 9], [48, -40, 8]]) ell(x, y, r, r * 0.5);
    c.strokeStyle = 'rgba(20,24,14,.5)'; c.lineWidth = 1.2; ln(-86, -50, 92, -50); ln(-20, -70, -24, -34); ln(40, -70, 44, -34);
    c.fillStyle = 'rgba(255,255,255,.15)'; c.fillRect(-90, -70, 190, 4);
    c.restore();
    rivets([[-76, -66], [-40, -66], [0, -66], [40, -66], [-78, -40], [-40, -40], [0, -40], [40, -40], [80, -40]], 1.2);
    c.fillStyle = team[0]; c.fillRect(-80, -56, 30, 4); c.fillStyle = '#f5f0e1'; c.font = '900 10px system-ui'; c.textAlign = 'center'; c.fillText('666', -64, -40);
    // výfuky s kouřem
    for (const x of [-76, -66]) { rr(x, -84, 6, 16, 2); fo('#2a2d26', 1.2); }
    for (let k = 0; k < 4; k++) { const t = (T * 0.7 + k / 4) % 1; c.fillStyle = `rgba(60,60,60,${0.4 * (1 - t)})`; circ(-70 - t * 20, -88 - t * 50, 3 + t * 9); }
    // zadní věž s kulometem
    c.beginPath(); c.moveTo(-60, -70); c.lineTo(-56, -86); c.lineTo(-26, -86); c.lineTo(-20, -70); c.closePath(); fo('#56603f', 1.8);
    rr(-24 - at * 3, -82, 34, 4, 2); fo('#1f2320', 1.2);
    // hlavní věž
    const tur = () => { c.beginPath(); c.moveTo(-18, -70); c.lineTo(-10, -104); c.lineTo(46, -108); c.lineTo(60, -92); c.lineTo(62, -70); c.closePath(); };
    tur(); fo(lg('btT', 0, -108, 0, -70, [[0, '#8fa070'], [0.6, '#5d6a44'], [1, '#3a4228']]), 2.2);
    c.save(); tur(); c.clip(); c.fillStyle = 'rgba(40,46,28,.5)'; ell(14, -90, 14, 6); c.fillStyle = 'rgba(255,255,255,.14)'; c.fillRect(-20, -108, 90, 5); c.restore();
    rivets([[-6, -100], [10, -102], [28, -104], [44, -102], [-10, -76], [56, -76]], 1.2);
    // dvojhlaveň s úsťovými brzdami
    for (const y of [-98, -86]) {
      rr(56 - at * 10, y, 84, 8, 2); fo(lg('btBr', 0, y, 0, y + 8, [[0, '#4a5040'], [1, '#1f2320']]), 1.4);
      rr(136 - at * 10, y - 2.5, 14, 13, 2); fo('#1a1c18', 1.2); c.fillStyle = '#000'; c.fillRect(140 - at * 10, y + 1, 2, 6); c.fillRect(145 - at * 10, y + 1, 2, 6);
      if (at > 0.7) { c.fillStyle = `rgba(255,200,80,${at})`; circ(156 - at * 10, y + 4, 8 * at); }
    }
    rr(52, -100, 8, 26, 2); fo('#3a4228', 1.2);
    // velitel v průlezu
    rr(8, -116, 22, 10, 3); fo('#4a5438', 1.4);
    c.fillStyle = '#2a2d22'; rr(14, -128, 10, 12, 3); c.fill(); c.fillStyle = '#d9a066'; circ(19, -131, 4); c.fillStyle = team[1]; c.beginPath(); c.arc(19, -132, 4.6, Math.PI, 0); c.fill();
    // lebka na věži, anténa
    c.fillStyle = '#e5e7eb'; ell(26, -90, 7, 6); c.fillRect(22.5, -86, 7, 4); c.fillStyle = '#1a1c14'; circ(23.5, -91, 1.8); circ(28.5, -91, 1.8);
    c.strokeStyle = '#2a2d22'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(-4, -104); c.quadraticCurveTo(-8 - Math.sin(T * 3) * 4, -130, -14 - Math.sin(T * 3) * 6, -150); c.stroke();
    c.fillStyle = team[0]; poly([-14 - Math.sin(T * 3) * 6, -150, -2, -146, -12 - Math.sin(T * 3) * 6, -142]); c.fill();
    // přední kulometné hnízdo
    c.beginPath(); c.arc(78, -50, 8, Math.PI, 0); fo('#56603f', 1.4); rr(80 - at * 3, -54, 22, 3.4, 1.5); fo('#1f2320', 1);
  },

  // ---------------- Titán – obří bojový mech budoucnosti ----------------
  (team, ph, at, st, walk, bob) => {
    const sw = Math.sin(ph * 0.45) * walk;
    const ARM = (k) => lg('tiA' + k, -20, 0, 20, 0, [[0, '#3f4756'], [0.5, '#9aa4b5'], [1, '#4a5160']]);
    // noha: stehno, píst, holeň (zpětné koleno), chodidlo s prsty
    const leg = (o, back) => {
      const k = Math.sin(ph * 0.45 + o) * walk;
      c.save(); c.translate(o ? -14 : 14, -96 + bob); c.rotate(k * 0.3);
      if (back) c.globalAlpha *= 0.85;
      c.beginPath(); c.moveTo(-14, -4); c.lineTo(14, -4); c.lineTo(10, 46); c.lineTo(-10, 46); c.closePath(); fo(back ? '#3a414e' : ARM(0), 2);
      c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 1; ln(-8, 6, 6, 6); ln(-6, 30, 6, 30);
      c.strokeStyle = '#c0c7d2'; c.lineWidth = 3; ln(-12, 8, -8, 50);
      c.fillStyle = '#1f2430'; circ(0, 48, 9); c.fillStyle = '#5f6878'; circ(0, 48, 4.4);
      c.translate(0, 48); c.rotate(-k * 0.5 - 0.15 * walk);
      c.beginPath(); c.moveTo(-10, 0); c.lineTo(12, 0); c.lineTo(8, 38); c.lineTo(-6, 38); c.closePath(); fo(back ? '#363c48' : ARM(1), 2);
      c.fillStyle = 'rgba(255,170,40,.6)'; for (let v = 0; v < 3; v++) c.fillRect(-3, 10 + v * 6, 8, 2);
      c.translate(0, 38); c.rotate(k * 0.25);
      c.beginPath(); c.moveTo(-16, 0); c.lineTo(18, 0); c.lineTo(26, 8); c.lineTo(-20, 8); c.closePath(); fo('#2b3040', 1.6);
      c.fillStyle = '#1f2430'; for (const x of [-18, 4, 22]) { poly([x - 4, 8, x, 13, x + 4, 8]); c.fill(); }
      c.restore();
    };
    leg(Math.PI, 1);
    c.save(); c.translate(0, bob);
    // pánev
    rr(-32, -108, 64, 22, 7); fo(lg('tiP', 0, -108, 0, -86, [[0, '#5f6878'], [1, '#2b3040']]), 2);
    c.fillStyle = '#e5c04a'; c.save(); rr(-28, -94, 56, 6, 2); c.clip(); for (let x = -30; x < 30; x += 8) { c.fillStyle = (x / 8) & 1 ? '#111' : '#e5c04a'; poly([x, -94, x + 4, -94, x + 8, -88, x + 4, -88]); c.fill(); } c.restore();
    // kabely
    c.strokeStyle = '#1f2430'; c.lineWidth = 3;
    for (const [x, d] of [[-20, -1], [20, 1]]) { c.beginPath(); c.moveTo(x, -104); c.quadraticCurveTo(x + d * 14, -118, x + d * 8, -132); c.stroke(); }
    // trup – vrstvený pancíř
    const torso = () => { c.beginPath(); c.moveTo(-44, -104); c.lineTo(-52, -150); c.lineTo(-34, -180); c.lineTo(34, -180); c.lineTo(52, -152); c.lineTo(42, -104); c.closePath(); };
    torso(); fo(lg('tiT', -52, 0, 52, 0, [[0, '#3f4756'], [0.45, '#a8b2c2'], [0.6, '#8b95a5'], [1, '#3a414e']]), 2.6);
    c.save(); torso(); c.clip();
    c.strokeStyle = 'rgba(20,24,34,.55)'; c.lineWidth = 1.2;
    ln(-50, -146, 50, -146); ln(-46, -124, 46, -124); ln(-20, -180, -26, -104); ln(20, -180, 24, -104);
    c.fillStyle = 'rgba(255,255,255,.18)'; c.beginPath(); c.moveTo(-34, -180); c.lineTo(34, -180); c.lineTo(28, -170); c.lineTo(-28, -170); c.closePath(); c.fill();
    // průduchy s žárem
    for (const x of [-38, 26]) for (let v = 0; v < 3; v++) { rr(x, -138 + v * 6, 12, 3, 1); c.fillStyle = `rgba(255,${100 + v * 30},30,${0.5 + Math.sin(T * 6 + v) * 0.25})`; c.fill(); }
    c.restore();
    rivets([[-40, -110], [38, -110], [-46, -146], [46, -146], [-30, -176], [30, -176]], 1.4);
    // pás v barvě týmu a znak
    c.beginPath(); c.moveTo(-48, -128); c.lineTo(48, -128); c.lineTo(46, -120); c.lineTo(-46, -120); c.closePath(); fo(team[0], 1.2);
    // reaktor v hrudi
    const pr = 0.75 + Math.sin(T * 4) * 0.25;
    c.globalAlpha *= pr; glowDot(0, -150, 30, team[2]); c.globalAlpha /= pr;
    c.beginPath(); c.arc(0, -150, 13, 0, Math.PI * 2); fo('#11151f', 2);
    c.strokeStyle = team[2]; c.lineWidth = 2; for (let k = 0; k < 6; k++) { const a = T * 2 + k * Math.PI / 3; ln(Math.cos(a) * 5, -150 + Math.sin(a) * 5, Math.cos(a) * 10, -150 + Math.sin(a) * 10); }
    glowDot(0, -150, 9, '#e0f7ff');
    // zadní rameno s raketometem
    c.save(); c.translate(-48, -170);
    rr(-22, -22, 36, 28, 5); fo(lg('tiRk', 0, -22, 0, 6, [[0, '#5f6878'], [1, '#2b3040']]), 1.8);
    c.fillStyle = '#11151f'; for (let r = 0; r < 2; r++) for (let k = 0; k < 3; k++) circ(-14 + k * 10, -14 + r * 11, 3.4);
    c.fillStyle = '#ef4444'; for (let r = 0; r < 2; r++) for (let k = 0; k < 3; k++) circ(-14 + k * 10, -14 + r * 11, 1.4);
    c.fillStyle = team[0]; c.fillRect(-22, 2, 36, 4);
    c.restore();
    // hlava s průzorem a anténami
    c.save(); c.translate(2, -190);
    c.beginPath(); c.moveTo(-18, 12); c.lineTo(-20, -6); c.lineTo(-10, -18); c.lineTo(14, -18); c.lineTo(22, -6); c.lineTo(20, 12); c.closePath(); fo(lg('tiH', 0, -18, 0, 12, [[0, '#a8b2c2'], [1, '#3f4756']]), 2);
    rr(-14, -6, 32, 8, 3); fo('#11151f', 1.4);
    glowLine(-10, -2, 14, -2, '#ef4444', 2.4);
    const sc = Math.sin(T * 1.5) * 10; glowDot(2 + sc, -2, 6, '#ff6b6b');
    c.strokeStyle = '#9aa3b2'; c.lineWidth = 1.6; ln(-12, -18, -16, -34); ln(10, -18, 12, -28);
    c.fillStyle = Math.sin(T * 6) > 0 ? '#ef4444' : '#7f1d1d'; circ(-16, -35, 2.2);
    c.restore();
    // přední rameno – mohutný nárameník a iontové dělo
    c.save(); c.translate(46, -162); c.rotate(-0.12 + sw * 0.05);
    c.beginPath(); c.moveTo(-22, -16); c.quadraticCurveTo(4, -32, 24, -14); c.lineTo(22, 6); c.lineTo(-20, 6); c.closePath();
    fo(lg('tiSh' + team[0], 0, -30, 0, 6, [[0, team[2]], [0.5, team[0]], [1, team[1]]]), 2);
    rivets([[-14, -6], [0, -12], [14, -6]], 1.4);
    c.fillStyle = '#e5c04a'; c.fillRect(-18, 0, 38, 3);
    rr(-10, 4, 22, 40, 6); fo(ARM(2), 1.8);
    c.strokeStyle = '#c0c7d2'; c.lineWidth = 2.4; ln(-6, 8, -6, 40);
    // dělo
    c.translate(2, 46);
    rr(-14, -12, 30, 26, 6); fo('#2b3040', 1.8);
    rr(10 - at * 10, -9, 74, 20, 6); fo(lg('tiG', 0, -9, 0, 11, [[0, '#b2bccb'], [0.5, '#6b7590'], [1, '#2b3040']]), 2);
    for (let k = 0; k < 4; k++) { rr(18 - at * 10 + k * 14, -11, 6, 24, 2); fo('#3a414e', 1.2); glowLine(21 - at * 10 + k * 14, -7, 21 - at * 10 + k * 14, 9, '#b388ff', 1.1); }
    rr(80 - at * 10, -12, 10, 26, 3); fo('#1f2430', 1.4);
    const ch = 0.6 + Math.sin(T * 8) * 0.2 + at;
    c.globalAlpha *= Math.min(1, ch); glowDot(92 - at * 10, 1, 10 + at * 18, '#b388ff'); c.globalAlpha /= Math.min(1, ch);
    c.restore();
    // pára z ventilů
    for (let k = 0; k < 3; k++) { const t = (T * 0.9 + k / 3) % 1; c.fillStyle = `rgba(220,225,235,${0.35 * (1 - t)})`; circ(-46 - t * 18, -110 - t * 40, 3 + t * 8); }
    c.restore();
    leg(0, 0);
  },
];
