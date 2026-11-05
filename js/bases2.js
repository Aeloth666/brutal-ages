// =====================================================================
//  ZÁKLADNY – renesance, moderní doba, budoucnost (pokračování bases.js)
// =====================================================================
function hazard(x, y, w, h) {
  c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip(); c.fillStyle = '#facc15'; c.fillRect(x, y, w, h);
  c.fillStyle = '#1f2937'; for (let k = -h; k < w; k += 10) { c.beginPath(); c.moveTo(x + k, y + h); c.lineTo(x + k + 5, y + h); c.lineTo(x + k + 5 + h, y); c.lineTo(x + k + h, y); c.closePath(); c.fill(); }
  c.restore(); c.strokeStyle = OL; c.lineWidth = 1.2; c.strokeRect(x, y, w, h);
}
function texCorrugated(x0, y0, x1, y1, col, step = 6) {
  for (let x = x0; x < x1; x += step) { c.fillStyle = linG(x, 0, x + step, 0, [[0, tone(col, 0.18)], [0.5, tone(col, -0.05)], [1, tone(col, -0.3)]]); c.fillRect(x, y0, step, y1 - y0); }
  const r = BRng(41); for (let i = 0; i < 12; i++) { const x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0); c.fillStyle = linG(0, y, 0, y + 30, [[0, 'rgba(120,60,20,.35)'], [1, 'rgba(120,60,20,0)']]); c.fillRect(x, y, 3, 30); }
}
function camo(x0, y0, x1, y1, seed, cols = ['rgba(70,85,45,.55)', 'rgba(110,95,60,.45)', 'rgba(40,45,30,.45)']) {
  const r = BRng(seed);
  for (let i = 0; i < 16; i++) {
    const x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0), s = 8 + r() * 14;
    c.fillStyle = cols[i % cols.length]; c.beginPath(); for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2, q = 0.6 + r() * 0.5; c.lineTo(x + Math.cos(a) * s * q, y + Math.sin(a) * s * 0.6 * q); } c.closePath(); c.fill();
  }
}
function sandbagRow(x0, x1, rows, seed = 3) {
  const r = BRng(seed);
  for (let k = 0; k < rows; k++) for (let x = x0 + k * 6; x < x1 - k * 6; x += 15) {
    const y = -10 - k * 9; rr(x, y, 16, 10, 5);
    fo(linG(0, y, 0, y + 10, [[0, tone('#cbbd8e', (r() - 0.5) * 0.15)], [1, tone('#9a8b5e', (r() - 0.5) * 0.15)]]), 1.1);
    c.strokeStyle = 'rgba(80,60,30,.45)'; c.lineWidth = 0.7; ln(x + 4, y + 2, x + 4, y + 8); ln(x + 12, y + 2, x + 12, y + 8);
  }
}
function barbed(x0, x1, y) {
  c.strokeStyle = '#4b4b4b'; c.lineWidth = 1;
  for (let x = x0; x < x1; x += 10) { c.beginPath(); c.ellipse(x + 5, y, 6, 4, 0, 0, Math.PI * 2); c.stroke(); ln(x + 2, y - 3, x + 4, y - 6); ln(x + 7, y + 3, x + 9, y + 6); }
}
function lattice(x, y0, y1, w, col = '#4b5563') {
  c.strokeStyle = OL; c.lineWidth = 4.2; ln(x, y1, x + w * 0.2, y0); ln(x + w, y1, x + w * 0.8, y0);
  c.strokeStyle = col; c.lineWidth = 2.4; ln(x, y1, x + w * 0.2, y0); ln(x + w, y1, x + w * 0.8, y0);
  c.lineWidth = 1.3; for (let y = y1, k = 0; y > y0 + 6; y -= 18, k++) { const f1 = (y1 - y) / (y1 - y0), f2 = (y1 - y + 18) / (y1 - y0); const a1 = x + w * 0.2 * f1, b1 = x + w - w * 0.2 * f1, a2 = x + w * 0.2 * Math.min(1, f2), b2 = x + w - w * 0.2 * Math.min(1, f2); ln(a1, y, b1, y); ln(a1, y, b2, y - 18); ln(b1, y, a2, y - 18); }
}
function crate(x, y, w, h, col = '#8a6a3a', mark) {
  solid(rectP(x, y, w, h), col, [x, y, x + w, y + h], () => texPlanks(x, y, x + w, y + h, col, { w: h / 3, hor: true, seed: x | 0 }), 0.8, 1.3);
  c.strokeStyle = tone(col, -0.35); c.lineWidth = 2; ln(x + 1, y + 1, x + w - 1, y + h - 1);
  if (mark) { c.fillStyle = mark; c.font = 'bold 7px system-ui'; c.textAlign = 'center'; c.fillText('★', x + w / 2, y + h / 2 + 3); }
}
function porthole(x, y, r, lit = true) {
  c.beginPath(); c.arc(x, y, r + 2.4, 0, Math.PI * 2); fo('#9aa3b2', 1.4);
  c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fillStyle = lit ? radG(x - r * 0.3, y - r * 0.3, 0, r, [[0, '#e0faff'], [0.5, '#5ad7ff'], [1, '#1b6b8f']]) : '#1b2333'; c.fill();
  c.strokeStyle = OL; c.lineWidth = 1; c.stroke();
  c.fillStyle = '#9aa3b2'; for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; circ(x + Math.cos(a) * (r + 1.2), y + Math.sin(a) * (r + 1.2), 0.7); }
  if (lit && curWins) curWins.push([x, y, r * 1.6]);
}

Object.assign(BDEF, {
  // =====================================================================
  //  RENESANCE
  // =====================================================================
  // ---------- Mušketýři: kamenné přízemí s dělovými střílnami, hrázděné patro, zvonice ----------
  age2: {
    st: team => {
      // zvonice (pravý okraj)
      solid(rectP(24, -206, 38, 206), '#a49c8e', [24, -206, 62, 0], () => texStones(24, -206, 62, 0, '#a49c8e', { sh: 12, sw: 14, seed: 4, moss: 3 }), 1);
      win(35, -186, 16, 24, { arch: true, fr: '#3a2a1a', bars: true });
      solid(polyP([20, -204, 43, -252, 66, -204]), '#2f4a5a', [20, -252, 66, -204], () => texTiles(20, -252, 66, -204, '#3a5a6a', { tw: 7, th: 6, seed: 3 }), 1.1);
      c.strokeStyle = '#c9a43c'; c.lineWidth = 2; ln(43, -252, 43, -262); circ(43, -264, 2);
      // kamenné přízemí
      solid(rectP(-96, -74, 122, 74), '#9d9586', [-96, -74, 26, 0], () => texStones(-96, -74, 26, 0, '#9d9586', { sh: 15, sw: 26, seed: 6, moss: 6 }), 1.1);
      for (const x of [-74, -2]) { c.beginPath(); c.arc(x, -38, 12, 0, Math.PI * 2); fo('#5d574d', 1.6); c.beginPath(); c.arc(x, -38, 8, 0, Math.PI * 2); c.fillStyle = '#15130f'; c.fill(); rr(x - 3, -42, 14, 8, 3); fo(linG(0, -42, 0, -34, [[0, '#6b7280'], [1, '#2b2f36']]), 1.1); }
      door(-48, -60, 28, 60, { col: '#5c3a1e', frame: '#8d8578' });
      // hrázděné patro
      const up = rectP(-90, -170, 112, 98);
      solid(up, '#efe2c2', [-90, -170, 22, -72], () => {
        texPlaster(-90, -170, 22, -72, '#efe2c2', { bricks: 2, seed: 3 });
        c.strokeStyle = '#4a2c14'; c.lineWidth = 5; c.lineCap = 'butt';
        ln(-90, -142, 22, -142); ln(-90, -100, 22, -100); for (const x of [-60, -28, 4]) ln(x, -170, x, -72); ln(-90, -170, -60, -142); ln(-60, -100, -90, -72); ln(4, -170, 22, -152); ln(-28, -142, -60, -100);
        c.strokeStyle = 'rgba(255,220,180,.18)'; c.lineWidth = 1.2; ln(-90, -143.5, 22, -143.5); ln(-90, -101.5, 22, -101.5);
      }, 1);
      win(-50, -136, 14, 22, { fr: '#4a2c14', shut: '#2f5d3a' }); win(-16, -136, 14, 22, { fr: '#4a2c14', shut: '#2f5d3a' });
      win(-82, -134, 14, 18, { fr: '#4a2c14' });
      // střecha s taškami a vikýřem
      const roof = polyP([-104, -168, -34, -238, 36, -168]);
      solid(roof, '#b4462e', [-104, -238, 36, -168], () => texTiles(-104, -240, 36, -168, '#b4462e', { tw: 9, th: 7, seed: 5 }), 1.2);
      // hodiny ve štítu
      c.beginPath(); c.arc(-34, -200, 10, 0, Math.PI * 2); fo('#f8f3e6', 1.6); c.strokeStyle = '#c9a43c'; c.lineWidth = 1.4; c.stroke();
      c.fillStyle = '#1a1a1a'; for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; circ(-34 + Math.cos(a) * 7.5, -200 + Math.sin(a) * 7.5, 0.7); }
      // komín
      solid(rectP(-74, -232, 12, 34), '#9a4a30', [-74, -232, -62, -198], () => texStones(-74, -232, -62, -198, '#9a4a30', { sh: 5, sw: 8, seed: 2 }), 0.8, 1.4);
      banner(-88, -66, 16, 30, team, 'lion');
      // sudy s prachem a dělové koule
      for (const x of [-104, -92]) { rr(x - 5, -16, 11, 16, 3); fo(linG(x - 5, 0, x + 6, 0, [[0, '#a0703c'], [1, '#5c3a1e']]), 1.2); c.strokeStyle = '#3c3f46'; c.lineWidth = 1.4; ln(x - 5, -12, x + 6, -12); ln(x - 5, -4, x + 6, -4); }
      c.fillStyle = '#2b2f36'; for (const [x, y] of [[66, -4], [74, -4], [70, -11]]) { c.beginPath(); c.arc(x, y, 4, 0, Math.PI * 2); fo('#2b2f36', 1); }
      foot(-108, 80, { seed: 18 });
    },
    an: team => {
      puffs(-68, -236, 4, '120,115,110', 0.35);
      c.save(); c.translate(-34, -200); c.strokeStyle = '#1a1a1a'; c.lineWidth = 1.4; c.rotate(T * 0.1); ln(0, 0, 0, -6); c.rotate(T * 1.1); ln(0, 0, 0, -8); c.restore();
      flag(43, -262, team, '#4b5563', 0.1);
    },
  },
  // ---------- Konkvistadoři: bílá misijní stavba s barokním štítem a zvonicí ----------
  conq: {
    st: team => {
      const W0 = '#f1e8d6';
      // zvonice (pravý okraj)
      solid(rectP(22, -214, 40, 214), W0, [22, -214, 62, 0], () => texPlaster(22, -214, 62, 0, W0, { bricks: 2, seed: 9 }), 1.1);
      c.beginPath(); c.moveTo(32, -150); c.lineTo(32, -178); c.arc(42, -178, 10, Math.PI, 0); c.lineTo(52, -150); c.closePath(); c.fillStyle = '#2a2118'; c.fill(); outl(() => { c.beginPath(); c.moveTo(32, -150); c.lineTo(32, -178); c.arc(42, -178, 10, Math.PI, 0); c.lineTo(52, -150); }, 1.6);
      rr(18, -150, 48, 5, 1); fo('#d8c9ad', 1.2); rr(18, -218, 48, 6, 1); fo('#d8c9ad', 1.2);
      c.beginPath(); c.moveTo(24, -218); c.quadraticCurveTo(24, -246, 42, -250); c.quadraticCurveTo(60, -246, 60, -218); c.closePath(); fo(linG(24, 0, 60, 0, [[0, '#d97a4a'], [1, '#8a3a1e']]), 1.6);
      c.strokeStyle = OL; c.lineWidth = 4; ln(42, -250, 42, -268); ln(36, -262, 48, -262); c.strokeStyle = '#c9a43c'; c.lineWidth = 2.2; ln(42, -250, 42, -268); ln(36, -262, 48, -262);
      win(36, -110, 12, 22, { arch: true, fr: '#5c3a1e', sillCol: '#d8c9ad' });
      // hlavní loď kostela s barokním štítem
      const body = () => { c.beginPath(); c.moveTo(-96, 0); c.lineTo(-96, -120); c.quadraticCurveTo(-90, -140, -76, -138); c.quadraticCurveTo(-64, -170, -38, -176); c.quadraticCurveTo(-12, -170, 0, -138); c.quadraticCurveTo(14, -140, 20, -120); c.lineTo(20, 0); c.closePath(); };
      solid(body, W0, [-96, -176, 20, 0], () => { texPlaster(-96, -176, 20, 0, W0, { bricks: 3, seed: 5, cracks: 4 }); c.fillStyle = 'rgba(160,120,70,.18)'; c.fillRect(-96, -14, 116, 14); }, 1.1);
      c.strokeStyle = '#d8c9ad'; c.lineWidth = 4; c.beginPath(); c.moveTo(-96, -120); c.quadraticCurveTo(-90, -140, -76, -138); c.quadraticCurveTo(-64, -170, -38, -176); c.quadraticCurveTo(-12, -170, 0, -138); c.quadraticCurveTo(14, -140, 20, -120); c.stroke(); outl(body, 2.2);
      c.beginPath(); c.arc(-38, -146, 11, 0, Math.PI * 2); fo('#c9a43c', 1.5); c.beginPath(); c.arc(-38, -146, 7, 0, Math.PI * 2); fo('#7c2d12', 1); c.fillStyle = '#fde68a'; for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; circ(-38 + Math.cos(a) * 4.5, -146 + Math.sin(a) * 4.5, 1); }
      c.strokeStyle = OL; c.lineWidth = 4; ln(-38, -176, -38, -194); ln(-44, -188, -32, -188); c.strokeStyle = '#3a2410'; c.lineWidth = 2.2; ln(-38, -176, -38, -194); ln(-44, -188, -32, -188);
      // taškový okap
      solid(rectP(-100, -126, 124, 9), '#b4532a', [-100, -126, 24, -117], () => texTiles(-100, -128, 24, -117, '#b4532a', { tw: 7, th: 5, seed: 4 }), 1, 1.4);
      win(-82, -104, 14, 26, { arch: true, fr: '#5c3a1e', sillCol: '#d8c9ad' }); win(2, -104, 14, 26, { arch: true, fr: '#5c3a1e', sillCol: '#d8c9ad' });
      door(-54, -70, 32, 70, { col: '#6b3a1e', frame: '#d8c9ad' });
      // kaktusy a agáve
      c.fillStyle = '#4d7c3a'; rr(-108, -40, 8, 40, 4); fo('#4d7c3a', 1.2); rr(-114, -28, 7, 4, 2); fo('#4d7c3a', 1); rr(-114, -34, 4, 10, 2); fo('#4d7c3a', 1);
      for (let k = -3; k <= 3; k++) { c.beginPath(); c.moveTo(72, 0); c.quadraticCurveTo(72 + k * 5, -10, 72 + k * 7, -20 + Math.abs(k) * 3); c.lineTo(73 + k * 6, -14 + Math.abs(k) * 3); c.closePath(); fo('#6a8f5a', 1); }
      foot(-112, 82, { seed: 21, gcol: '#8a9a4a' });
    },
    an: team => {
      // zvon se houpe
      const a = Math.sin(T * 2.4) * 0.35;
      c.save(); c.translate(42, -176); c.rotate(a);
      c.beginPath(); c.moveTo(-6, 4); c.quadraticCurveTo(-7, 18, -10, 22); c.lineTo(10, 22); c.quadraticCurveTo(7, 18, 6, 4); c.quadraticCurveTo(0, 0, -6, 4); c.closePath(); fo(linG(-10, 0, 10, 0, [[0, '#f5d76e'], [1, '#a16207']]), 1.4);
      c.fillStyle = '#5c3a0a'; circ(0, 24, 2.2); c.restore();
      flag(-38, -194, team, '#3a2410', 0.1);
    },
  },
  // ---------- Piráti: loď vytažená na pláž, záďová nástavba, plachta s lebkou ----------
  pirate: {
    st: team => {
      // písek
      c.beginPath(); c.moveTo(-118, 0); c.quadraticCurveTo(-20, -18, 90, 0); c.closePath(); fo('#e4cf96', 1.4);
      // trup
      const hull = () => { c.beginPath(); c.moveTo(-112, -98); c.lineTo(44, -98); c.lineTo(60, -150); c.lineTo(66, -150); c.lineTo(62, -40); c.quadraticCurveTo(50, -6, 10, -4); c.lineTo(-70, -4); c.quadraticCurveTo(-104, -14, -112, -98); c.closePath(); };
      solid(hull, '#6b4423', [-112, -150, 66, -4], () => {
        texPlanks(-112, -150, 66, -4, '#6b4423', { w: 9, hor: true, seed: 5, nails: true });
        c.fillStyle = team[0]; c.fillRect(-112, -84, 180, 6); c.fillStyle = team[1]; c.fillRect(-112, -78, 180, 2);
        c.fillStyle = 'rgba(60,90,60,.35)'; c.fillRect(-112, -16, 180, 12);     // řasy u kýlu
      }, 1.2);
      // záďová nástavba (pravý okraj – věže)
      solid(rectP(18, -178, 46, 80), '#7a4f2a', [18, -178, 64, -98], () => texPlanks(18, -178, 64, -98, '#7a4f2a', { w: 8, seed: 7 }), 1.1);
      for (const x of [26, 44]) win(x, -160, 10, 14, { fr: '#c9a43c', sillCol: '#5c3a1e' });
      rr(14, -184, 54, 7, 2); fo('#5c3a1e', 1.4); c.fillStyle = '#c9a43c'; for (let x = 18; x < 66; x += 8) c.fillRect(x, -192, 2, 8); rr(14, -194, 54, 3, 1); fo('#5c3a1e', 1);
      // dělové střílny
      for (const x of [-86, -56, -26, 4, 32]) { rr(x, -70, 14, 12, 2); fo('#1a120a', 1.4); c.fillStyle = '#2b2f36'; rr(x + 8, -67, 12, 6, 2); c.fill(); }
      // zábradlí paluby
      c.strokeStyle = '#4a2c14'; c.lineWidth = 2.4; ln(-112, -108, 18, -108); for (let x = -108; x < 18; x += 10) ln(x, -98, x, -108);
      // stěžeň
      c.strokeStyle = OL; c.lineWidth = 7; ln(-30, -98, -30, -262); c.strokeStyle = '#7a4f2a'; c.lineWidth = 4.6; ln(-30, -98, -30, -262);
      c.strokeStyle = OL; c.lineWidth = 5; ln(-72, -236, 12, -236); ln(-64, -152, 4, -152); c.strokeStyle = '#7a4f2a'; c.lineWidth = 3; ln(-72, -236, 12, -236); ln(-64, -152, 4, -152);
      // koš na stěžni
      c.beginPath(); c.moveTo(-42, -248); c.lineTo(-18, -248); c.lineTo(-21, -238); c.lineTo(-39, -238); c.closePath(); fo('#6b4423', 1.4);
      // lanoví
      c.strokeStyle = 'rgba(40,30,20,.75)'; c.lineWidth = 0.9;
      for (let k = 0; k < 6; k++) { ln(-30, -236 + k * 2, -108 + k * 6, -102); ln(-30, -236 + k * 2, 16 + k * 3, -102); }
      for (let y = -210; y < -110; y += 12) { ln(-30 - (y + 236) * 0.62, y, -30, y); }
      // kotva a sudy
      c.strokeStyle = '#2b2f36'; c.lineWidth = 3; ln(-100, -20, -100, -50); c.beginPath(); c.arc(-100, -24, 10, 0.2, Math.PI - 0.2); c.stroke(); ln(-106, -46, -94, -46);
      for (const x of [74, 84]) { rr(x - 5, -16, 11, 16, 3); fo(linG(x - 5, 0, x + 6, 0, [[0, '#a0703c'], [1, '#5c3a1e']]), 1.2); c.strokeStyle = '#3c3f46'; c.lineWidth = 1.4; ln(x - 5, -12, x + 6, -12); ln(x - 5, -4, x + 6, -4); }
      // truhla s pokladem
      rr(-64, -14, 22, 14, 2); fo('#7a4f2a', 1.3); c.beginPath(); c.moveTo(-64, -14); c.quadraticCurveTo(-53, -24, -42, -14); c.closePath(); fo('#8a5a32', 1.2); c.fillStyle = '#facc15'; circ(-53, -9, 2); for (const [x, y] of [[-60, -16], [-50, -18], [-46, -15]]) circ(x, y, 1.6);
      foot(-112, 92, { seed: 25, gcol: '#9aa04a', n: 4 });
    },
    an: team => {
      // plachta vlaje
      const w = Math.sin(T * 2) * 4;
      const sail = () => { c.beginPath(); c.moveTo(-66, -232); c.quadraticCurveTo(-30 + w, -224, 6, -232); c.quadraticCurveTo(12 + w, -194, 0, -156); c.quadraticCurveTo(-32 + w, -150, -60, -156); c.quadraticCurveTo(-72 + w, -194, -66, -232); c.closePath(); };
      sail(); c.fillStyle = linG(-66, 0, 6, 0, [[0, '#f1ead6'], [0.6, '#ddd2b4'], [1, '#b9ad8e']]); c.fill(); outl(sail, 1.8);
      c.save(); c.translate(-30 + w * 0.5, -196); skull(0, -4, 1.6); c.strokeStyle = '#1a1a1a'; c.lineWidth = 3; ln(-12, 6, 12, 18); ln(12, 6, -12, 18); c.restore();
      flag(-30, -262, team, '#7a4f2a', 0.1);
      // racek
      const gx = -60 + ((T * 30) % 220), gy = -270 + Math.sin(T * 2) * 6; c.strokeStyle = '#f8fafc'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(gx - 6, gy); c.quadraticCurveTo(gx - 3, gy - 4, gx, gy); c.quadraticCurveTo(gx + 3, gy - 4, gx + 6, gy); c.stroke();
    },
  },
  // ---------- Janičáři: osmanská stavba s kupolí, pruhované zdivo, minaret ----------
  janissary: {
    st: team => {
      // minaret (pravý okraj)
      const min = rectP(32, -228, 20, 228);
      solid(min, '#efe6d0', [32, -228, 52, 0], () => { texStones(32, -228, 52, 0, '#efe6d0', { sh: 10, sw: 12, seed: 3 }); c.strokeStyle = 'rgba(180,150,100,.4)'; c.lineWidth = 1; for (let k = 0; k < 4; k++) ln(36 + k * 4, -228, 36 + k * 4, 0); }, 1);
      rr(26, -184, 32, 7, 2); fo('#d8c9ad', 1.4); c.fillStyle = '#5c3a1e'; for (let x = 28; x < 56; x += 5) c.fillRect(x, -192, 1.6, 8); rr(26, -194, 32, 3, 1); fo('#d8c9ad', 1);
      win(38, -150, 8, 16, { arch: true, fr: '#3a2a1a', cross: false, sill: false });
      solid(polyP([30, -228, 42, -276, 54, -228]), '#4a6f8a', [30, -276, 54, -228], () => texTiles(30, -276, 54, -228, '#5a7f9a', { tw: 5, th: 5, seed: 2 }), 1, 1.6);
      // pruhovaná budova (ablaq)
      const body = rectP(-96, -118, 122, 118);
      solid(body, '#e8dcc0', [-96, -118, 26, 0], () => {
        for (let y = 0, k = 0; y > -118; y -= 12, k++) { c.fillStyle = k % 2 ? '#c2593a' : '#ece2c8'; c.fillRect(-96, y - 12, 122, 12); }
        texStones(-96, -118, 26, 0, '#e8dcc0', { sh: 12, sw: 26, seed: 5 }); c.globalCompositeOperation = 'multiply';
        for (let y = 0, k = 0; y > -118; y -= 12, k++) { c.fillStyle = k % 2 ? 'rgba(200,90,58,.85)' : 'rgba(255,255,255,0)'; c.fillRect(-96, y - 12, 122, 12); }
        c.globalCompositeOperation = 'source-over';
      }, 1.1);
      rr(-100, -124, 130, 8, 2); fo('#d8c9ad', 1.4);
      // kupole s žebry
      const domeP = () => { c.beginPath(); c.moveTo(-80, -124); c.bezierCurveTo(-80, -200, 4, -200, 4, -124); c.closePath(); };
      solid(domeP, '#7a96a8', [-80, -186, 4, -124], () => { c.strokeStyle = 'rgba(40,60,80,.5)'; c.lineWidth = 1.4; for (let k = -3; k <= 3; k++) { c.beginPath(); c.moveTo(-38 + k * 3, -183); c.quadraticCurveTo(-38 + k * 14, -160, -38 + k * 12, -124); c.stroke(); } }, 1.2);
      rr(-84, -130, 92, 8, 2); fo('#d8c9ad', 1.4);
      c.strokeStyle = OL; c.lineWidth = 3.4; ln(-38, -183, -38, -200); c.strokeStyle = '#c9a43c'; c.lineWidth = 2; ln(-38, -183, -38, -200);
      c.beginPath(); c.arc(-38, -207, 6, 0.6, Math.PI * 2 - 0.6); c.arc(-35, -207, 4.6, Math.PI * 2 - 0.9, 0.9, true); c.closePath(); fo('#e5c04a', 1);
      // portál a okna s ornamentem
      c.beginPath(); c.moveTo(-58, 0); c.lineTo(-58, -64); c.quadraticCurveTo(-38, -94, -18, -64); c.lineTo(-18, 0); c.closePath(); fo('#2f6f8f', 1.8);
      c.save(); c.beginPath(); c.moveTo(-58, 0); c.lineTo(-58, -64); c.quadraticCurveTo(-38, -94, -18, -64); c.lineTo(-18, 0); c.closePath(); c.clip();
      c.strokeStyle = 'rgba(255,255,255,.45)'; c.lineWidth = 1; for (let y = -88; y < 0; y += 8) for (let x = -58; x < -18; x += 8) { c.beginPath(); c.moveTo(x + 4, y); c.lineTo(x + 8, y + 4); c.lineTo(x + 4, y + 8); c.lineTo(x, y + 4); c.closePath(); c.stroke(); }
      c.restore();
      door(-50, -52, 24, 52, { col: '#5c2a1a', frame: null });
      for (const x of [-86, 2]) win(x, -96, 14, 26, { arch: true, fr: '#2f6f8f', sillCol: '#d8c9ad' });
      // koberce na zábradlí a nádoby
      rr(-96, -44, 26, 30, 1); fo(linG(-96, 0, -70, 0, [[0, '#9a2a2a'], [1, '#6a1a1a']]), 1.3); c.strokeStyle = '#facc15'; c.lineWidth = 1; c.strokeRect(-93, -41, 20, 24); c.fillStyle = '#facc15'; poly([-83, -36, -78, -29, -83, -22, -88, -29]); c.fill();
      for (const x of [62, 72]) { c.beginPath(); c.ellipse(x, -10, 5, 10, 0, 0, Math.PI * 2); fo(linG(x - 5, 0, x + 5, 0, [[0, '#d07a4a'], [1, '#7a3a1a']]), 1.2); }
      foot(-110, 82, { seed: 28, gcol: '#8a9a4a' });
    },
    an: team => { flag(-38, -212, team, '#c9a43c', 0.1); },
  },

  // =====================================================================
  //  MODERNÍ DOBA
  // =====================================================================
  // ---------- Pěchota: betonový bunkr, pozorovací věž, pytle s pískem, radar ----------
  age3: {
    st: team => {
      const CC = '#9a9c8e';
      // pozorovací věž (pravý okraj)
      solid(rectP(22, -196, 40, 196), CC, [22, -196, 62, 0], () => { texConcrete(22, -196, 62, 0, CC, { seed: 3 }); camo(22, -196, 62, 0, 4); }, 1.1);
      rr(18, -204, 48, 10, 2); fo(tone(CC, -0.1), 1.6);
      for (const y of [-180, -120]) { rr(28, y, 28, 7, 2); c.fillStyle = '#0f100d'; c.fill(); c.fillStyle = 'rgba(255,200,80,.2)'; c.fillRect(30, y + 1.5, 24, 1.5); }
      // hlavní bunkr
      const b = () => { c.beginPath(); c.moveTo(-98, 0); c.lineTo(-92, -116); c.quadraticCurveTo(-88, -138, -64, -140); c.lineTo(6, -140); c.quadraticCurveTo(26, -138, 30, -116); c.lineTo(32, 0); c.closePath(); };
      solid(b, CC, [-98, -140, 32, 0], () => { texConcrete(-98, -140, 32, 0, CC, { seed: 7 }); camo(-98, -140, 32, 0, 9); }, 1.2);
      for (const [x, y, w] of [[-80, -112, 34], [-30, -112, 34], [-58, -74, 48]]) {
        rr(x - 3, y - 3, w + 6, 15, 3); fo(tone(CC, -0.15), 1.4);
        rr(x, y, w, 9, 2); c.fillStyle = '#0d0e0b'; c.fill(); c.fillStyle = 'rgba(255,200,80,.25)'; c.fillRect(x + 2, y + 2, w - 4, 2);
        c.strokeStyle = 'rgba(0,0,0,.45)'; c.lineWidth = 1; ln(x, y + 13, x + w, y + 13);
      }
      // ocelové dveře
      solid(rectP(-30, -50, 30, 50), '#4b5340', [-30, -50, 0, 0], () => texMetal(-30, -50, 0, 0, '#4b5340', { pw: 30, ph: 25, seed: 3 }), 0.8, 1.8);
      c.fillStyle = '#9ca3af'; rr(-8, -28, 4, 8, 1); c.fill(); c.fillStyle = '#facc15'; c.font = 'bold 8px system-ui'; c.textAlign = 'center'; c.fillText('⚠', -15, -38);
      // stožár s anténou a ostnatý drát
      c.strokeStyle = OL; c.lineWidth = 3.6; ln(-30, -140, -30, -196); ln(4, -140, 4, -226); c.strokeStyle = '#4b5563'; c.lineWidth = 2; ln(-30, -140, -30, -196); ln(4, -140, 4, -226);
      for (let k = 0; k < 3; k++) { c.strokeStyle = '#4b5563'; c.lineWidth = 1.2; ln(4, -220 + k * 10, -2 + k * 2, -214 + k * 10); ln(4, -220 + k * 10, 10 - k * 2, -214 + k * 10); }
      barbed(-90, 20, -146);
      sandbagRow(-104, -40, 3, 5); sandbagRow(-4, 62, 2, 8);
      // bedny s municí
      crate(66, -18, 20, 18, '#55623a', '#e5c04a');
      foot(-110, 90, { seed: 31, n: 5 });
    },
    an: team => {
      c.save(); c.translate(-30, -198); c.scale(Math.cos(T * 1.6), 1); c.beginPath(); c.ellipse(0, 0, 15, 7, 0, Math.PI, 0); c.closePath(); fo(linG(-15, 0, 15, 0, [[0, '#e5e7eb'], [1, '#6b7280']]), 1.4); c.strokeStyle = '#4b5563'; c.lineWidth = 1.2; ln(0, 0, 0, -8); c.restore();
      beacon(4, -228, '#ef4444', 1.4);
      flag(44, -204, team, '#4b5563', 34);
    },
  },
  // ---------- Obrněná divize: oblý plechový hangár s tankem, věž s reflektorem ----------
  tank: {
    st: team => {
      // příhradová věž (pravý okraj)
      lattice(28, -206, 0, 36, '#4b5563');
      rr(22, -214, 48, 10, 2); fo('#4b5563', 1.5); c.strokeStyle = '#4b5563'; c.lineWidth = 1.4; for (let x = 24; x < 70; x += 6) ln(x, -214, x, -224); ln(22, -224, 70, -224);
      // hangár
      const h = () => { c.beginPath(); c.moveTo(-100, 0); c.lineTo(-100, -60); c.bezierCurveTo(-100, -150, 30, -150, 30, -60); c.lineTo(30, 0); c.closePath(); };
      solid(h, '#6b7258', [-100, -150, 30, 0], () => { texCorrugated(-100, -150, 30, 0, '#6b7258', 5); camo(-100, -150, 30, 0, 12); c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 1.4; for (const y of [-40, -80, -112]) { c.beginPath(); c.moveTo(-100, y); c.quadraticCurveTo(-35, y - 30 + (y + 40) * 0.2, 30, y); c.stroke(); } }, 1.3);
      // hvězda
      c.save(); c.translate(-35, -110); c.beginPath(); for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, r = k % 2 ? 6 : 14; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.closePath(); fo('#f8fafc', 1.4); c.restore();
      // otevřená vrata a tank uvnitř
      rr(-74, -72, 78, 72, [4, 4, 0, 0]); c.fillStyle = radG(-35, -20, 6, 80, [[0, '#3a3a2e'], [1, '#0e0f0b']]); c.fill(); outl(() => rr(-74, -72, 78, 72, [4, 4, 0, 0]), 1.8);
      c.save(); rr(-74, -72, 78, 72, [4, 4, 0, 0]); c.clip();
      rr(-62, -24, 60, 18, 8); fo('#3d4530', 1.4); c.fillStyle = '#1f2418'; for (let k = 0; k < 6; k++) circ(-55 + k * 9.5, -14, 4);
      rr(-54, -40, 40, 16, 4); fo('#4d5638', 1.4); rr(-36, -36, 46, 5, 2); fo('#3d4530', 1.2); c.fillStyle = '#f8fafc'; c.font = 'bold 7px system-ui'; c.fillText('★', -38, -28);
      c.fillStyle = 'rgba(255,220,140,.12)'; c.fillRect(-74, -72, 78, 6);
      c.restore();
      hazard(-74, -78, 78, 6);
      // rolovací vrata vytažená nahoru
      c.strokeStyle = 'rgba(0,0,0,.4)'; c.lineWidth = 1; for (let y = -70; y < -60; y += 3) ln(-74, y, 4, y);
      sandbagRow(-110, -74, 2, 4);
      // sudy s palivem
      for (const x of [44, 56]) { rr(x - 5, -16, 11, 16, 2); fo(linG(x - 5, 0, x + 6, 0, [[0, '#7a8a4a'], [1, '#3a4520']]), 1.2); c.strokeStyle = 'rgba(0,0,0,.4)'; c.lineWidth = 1.2; ln(x - 5, -11, x + 6, -11); ln(x - 5, -5, x + 6, -5); }
      foot(-112, 84, { seed: 34, n: 5 });
    },
    an: team => {
      // reflektor otáčí kužel světla
      const a = Math.sin(T * 0.8) * 0.5 - 0.2;
      c.save(); c.translate(46, -230);
      const op = c.globalCompositeOperation; c.globalCompositeOperation = 'lighter';
      c.rotate(a); c.fillStyle = linG(0, 0, 160, 0, [[0, 'rgba(255,250,210,.38)'], [1, 'rgba(255,250,210,0)']]); c.beginPath(); c.moveTo(4, -3); c.lineTo(170, -32); c.lineTo(170, 32); c.lineTo(4, 3); c.closePath(); c.fill();
      c.globalCompositeOperation = op;
      rr(-8, -7, 16, 14, 3); fo('#3c4038', 1.4); c.beginPath(); c.arc(7, 0, 5, -Math.PI / 2, Math.PI / 2); fo('#fffbe0', 1); c.restore();
      flag(-35, -150, team, '#4b5563', 26);
    },
  },
  // ---------- Partyzáni: srub v lese, maskovací síť, pozorovatelna na stromě ----------
  partisan: {
    st: team => {
      // jedle vzadu
      const pineT = (x, h, s) => { c.fillStyle = '#4a2c1a'; c.fillRect(x - 3, -h * 0.25, 6, h * 0.25); for (let k = 0; k < 4; k++) { const y = -h * 0.2 - k * h * 0.2, w = s * (1 - k * 0.2); poly([x - w, y, x, y - h * 0.32, x + w, y]); fo(linG(x - w, 0, x + w, 0, [[0, '#3f7a3a'], [1, '#1f4a22']]), 1.4); } };
      pineT(-92, 210, 34); pineT(-50, 240, 38);
      // strom s pozorovatelnou (pravý okraj)
      c.beginPath(); c.moveTo(30, 0); c.lineTo(34, -230); c.lineTo(46, -230); c.lineTo(52, 0); c.closePath();
      solid(() => { c.beginPath(); c.moveTo(30, 0); c.lineTo(34, -230); c.lineTo(46, -230); c.lineTo(52, 0); c.closePath(); }, '#5c3a1e', [30, -230, 52, 0], () => { c.strokeStyle = 'rgba(30,15,5,.45)'; c.lineWidth = 1; for (let y = -220; y < 0; y += 9) ln(32, y, 50, y + 4); }, 1.1);
      solid(rectP(18, -196, 56, 8), '#7a4f2a', [18, -196, 74, -188], () => texPlanks(18, -196, 74, -188, '#7a4f2a', { w: 7, seed: 3 }), 0.8, 1.4);
      c.strokeStyle = '#5c3a1e'; c.lineWidth = 2; for (const x of [20, 72]) ln(x, -196, x, -214); ln(20, -212, 72, -212);
      c.strokeStyle = '#7a4f2a'; c.lineWidth = 2; ln(26, 0, 26, -188); ln(18, 0, 18, -188); for (let y = -10; y > -188; y -= 11) ln(18, y, 26, y);
      for (let k = 0; k < 3; k++) { const y = -240 - k * 26, w = 40 - k * 10; poly([40 - w, y + 30, 40, y - 6, 40 + w, y + 30]); fo(linG(0, y, 0, y + 30, [[0, '#3f7a3a'], [1, '#1f4a22']]), 1.4); }
      // srub
      const hut = rectP(-84, -78, 106, 78);
      solid(hut, '#7a4a28', [-84, -78, 22, 0], () => texLogs(-84, -78, 22, 0, '#7a4a28', 11, { seed: 5 }), 1.1);
      logEnds(-84, -78, 0, 11, '#8a5a32'); logEnds(22, -78, 0, 11, '#8a5a32');
      const roof = polyP([-96, -74, -31, -136, 34, -74]);
      solid(roof, '#4a6a3a', [-96, -136, 34, -74], () => { texPlanks(-96, -136, 34, -74, '#5a4a32', { w: 7, seed: 9 }); moss(-96, -136, 34, -74, 14, 4); }, 1.1);
      // maskovací síť
      c.save(); c.beginPath(); c.moveTo(-104, -70); c.quadraticCurveTo(-31, -150, 40, -70); c.lineTo(40, -60); c.quadraticCurveTo(-31, -128, -104, -60); c.closePath(); c.clip();
      c.strokeStyle = 'rgba(30,40,20,.7)'; c.lineWidth = 0.9; for (let x = -110; x < 50; x += 6) { ln(x, -150, x + 40, -50); ln(x, -50, x + 40, -150); }
      const r = BRng(7); for (let i = 0; i < 40; i++) { c.fillStyle = ['#4d6a2a', '#6a5a2a', '#2f4a1a'][i % 3]; ell(-104 + r() * 144, -140 + r() * 80, 3 + r() * 3, 2 + r() * 2); }
      c.restore();
      door(-24, -56, 22, 56, { col: '#5c3a1e', arch: false });
      win(-70, -56, 18, 16, { fr: '#4a2c14' });
      // dříví a ohniště
      for (let i = 0; i < 4; i++) { c.beginPath(); c.ellipse(-104 + (i % 2) * 8, -6 - ((i / 2) | 0) * 9, 5, 5, 0, 0, Math.PI * 2); fo('#b08050', 1); c.fillStyle = '#6b4423'; circ(-104 + (i % 2) * 8, -6 - ((i / 2) | 0) * 9, 2); }
      for (let i = 0; i < 5; i++) { c.beginPath(); c.ellipse(58 + i * 5, -2.5, 3.4, 2.4, 0, 0, Math.PI * 2); fo('#8a8075', 1); }
      foot(-112, 86, { seed: 37, gcol: '#3f7a2c', g: 14 });
    },
    an: team => { fire(68, -5, 0.8); puffs(-60, -132, 3, '130,125,118', 0.3, 0.8); flag(46, -214, team, '#5c3a1e', 24); },
  },
  // ---------- Výsadkáři: polní stan, sušící se padák, rádiový stožár ----------
  para: {
    st: team => {
      // rádiový stožár (pravý okraj)
      lattice(30, -232, 0, 30, '#55623a');
      c.strokeStyle = 'rgba(40,40,40,.6)'; c.lineWidth = 0.8; ln(45, -230, 80, 0); ln(45, -230, 10, 0);
      // stan
      const tent = () => { c.beginPath(); c.moveTo(-96, 0); c.lineTo(-74, -96); c.lineTo(10, -96); c.lineTo(28, 0); c.closePath(); };
      solid(tent, '#6b7a4a', [-96, -96, 28, 0], () => { texHide(-96, -96, 28, 0, '#6b7a4a', { seams: 2, seed: 4 }); c.strokeStyle = 'rgba(40,50,25,.5)'; c.lineWidth = 1.4; for (const x of [-54, -16]) ln(x, -96, x + (x + 34) * 0.15, 0); }, 1.2);
      c.beginPath(); c.moveTo(-50, 0); c.lineTo(-36, -70); c.lineTo(-22, 0); c.closePath(); c.fillStyle = radG(-36, -10, 2, 60, [[0, '#3a3a24'], [1, '#121208']]); c.fill(); outl(() => { c.beginPath(); c.moveTo(-50, 0); c.lineTo(-36, -70); c.lineTo(-22, 0); }, 1.4);
      c.beginPath(); c.moveTo(-22, 0); c.lineTo(-36, -70); c.lineTo(-6, -8); c.closePath(); fo('#7d8c58', 1.3);
      rr(-74, -82, 18, 12, 1); fo('#f8fafc', 1.2); c.fillStyle = '#dc2626'; c.fillRect(-67, -80, 4, 8); c.fillRect(-71, -77, 12, 3);
      // kolíky a lana
      c.strokeStyle = 'rgba(60,50,30,.8)'; c.lineWidth = 0.9; ln(-74, -96, -108, 0); ln(10, -96, 30, -40);
      // padák na rámu
      c.strokeStyle = '#5c4a2a'; c.lineWidth = 2.6; ln(-104, 0, -100, -150); ln(-104, -150, -60, -150);
      const ch = () => { c.beginPath(); c.moveTo(-122, -150); c.quadraticCurveTo(-100, -214, -60, -210); c.quadraticCurveTo(-26, -204, -24, -150); c.closePath(); };
      ch(); c.fillStyle = '#f1f5f9'; c.fill();
      c.save(); ch(); c.clip(); for (let k = 0; k < 6; k++) { if (k % 2) continue; c.fillStyle = team[0]; c.beginPath(); c.moveTo(-73, -150); c.lineTo(-122 + k * 17, -220); c.lineTo(-122 + (k + 1) * 17, -220); c.closePath(); c.fill(); } lit(ch, -122, -214, -24, -150); c.restore(); outl(ch, 1.8);
      c.strokeStyle = 'rgba(80,80,80,.7)'; c.lineWidth = 0.7; for (let k = 0; k < 7; k++) ln(-122 + k * 16.3, -150, -72, -110);
      // bedny, pytle a vysílačka
      crate(-104, -18, 22, 18, '#55623a', '#e5c04a'); crate(-100, -34, 16, 16, '#6b7a4a');
      sandbagRow(6, 74, 2, 9);
      rr(62, -36, 16, 14, 2); fo('#3d4530', 1.3); c.strokeStyle = '#1a1a1a'; c.lineWidth = 1.2; ln(74, -36, 78, -52); c.fillStyle = '#22c55e'; c.fillRect(65, -32, 4, 3);
      foot(-114, 86, { seed: 40, n: 5 });
    },
    an: team => {
      beacon(45, -234, '#ef4444', 1.2);
      // rádiové vlny
      for (let k = 0; k < 3; k++) { const t = (T * 0.6 + k / 3) % 1; c.strokeStyle = `rgba(56,225,255,${0.5 * (1 - t)})`; c.lineWidth = 1.4; c.beginPath(); c.arc(45, -234, 8 + t * 26, -Math.PI * 0.85, -Math.PI * 0.15); c.stroke(); }
      flag(-36, -98, team, '#3a3a24', 24);
    },
  },

  // =====================================================================
  //  BUDOUCNOST
  // =====================================================================
  // ---------- Kyborgové: štíhlá věž z panelů se zářícími švy a jádrem ----------
  age4: {
    st: team => {
      // přistávací plošina
      rr(-106, -14, 186, 14, 3); fo(linG(0, -14, 0, 0, [[0, '#5b6478'], [1, '#262b38']]), 1.6); hazard(-100, -14, 30, 4); hazard(44, -14, 30, 4);
      const tw = () => { c.beginPath(); c.moveTo(-80, -14); c.lineTo(-52, -214); c.lineTo(32, -214); c.lineTo(62, -14); c.closePath(); };
      solid(tw, '#4b5368', [-80, -214, 62, -14], () => texMetal(-80, -214, 62, -14, '#4b5368', { pw: 24, ph: 34, seed: 5, grime: 0.15 }), 1.3);
      // horní hlava
      c.beginPath(); c.moveTo(-60, -214); c.lineTo(40, -214); c.lineTo(28, -236); c.lineTo(-48, -236); c.closePath(); fo(linG(0, -236, 0, -214, [[0, '#8691a8'], [1, '#2b3040']]), 1.8);
      // jádro – zapuštěný kruh
      c.beginPath(); c.arc(-10, -118, 24, 0, Math.PI * 2); fo('#11151f', 2); c.strokeStyle = '#6b7488'; c.lineWidth = 3; c.stroke();
      // vchod
      rr(-30, -64, 40, 50, [8, 8, 0, 0]); fo('#0d1018', 1.8); c.fillStyle = 'rgba(56,225,255,.15)'; c.fillRect(-26, -60, 32, 46);
      // anténa
      c.strokeStyle = OL; c.lineWidth = 3.6; ln(-10, -236, -10, -270); c.strokeStyle = '#cbd5e1'; c.lineWidth = 2; ln(-10, -236, -10, -270);
      foot(-112, 86, { seed: 43, grass: false, n: 4 });
    },
    an: team => {
      const p = 0.65 + Math.sin(T * 3) * 0.25;
      glowLine(-74, -60, 56, -60, team[2], 1.2); glowLine(-62, -150, 42, -150, '#38e1ff', 1.2); glowLine(-55, -200, 35, -200, team[2], 1);
      c.globalAlpha = p; glowDot(-10, -118, 50, team[0]); c.globalAlpha = 1; glowDot(-10, -118, 16, team[2]);
      for (let k = 0; k < 2; k++) { const y = -250 - k * 12 + Math.sin(T * 2 + k) * 3; c.strokeStyle = k ? team[2] : '#38e1ff'; c.globalAlpha = 0.8; c.lineWidth = 2.2; c.beginPath(); c.ellipse(-10, y, 30 - k * 8, 5 - k, 0, 0, Math.PI * 2); c.stroke(); c.globalAlpha = 1; }
      glowLine(-24, -58, 4, -58, team[0], 1.2); beacon(-10, -272, '#38e1ff', 0.8);
      flag(-10, -270, team, '#cbd5e1', 0.1);
    },
  },
  // ---------- Mimozemšťané: živý úl s žilkami, zárodky a rohem ----------
  alien: {
    st: team => {
      // roh (pravý okraj)
      const horn = () => { c.beginPath(); c.moveTo(28, 0); c.bezierCurveTo(30, -100, 40, -180, 64, -250); c.bezierCurveTo(58, -180, 58, -100, 62, 0); c.closePath(); };
      solid(horn, '#3b1d5c', [28, -250, 64, 0], () => { c.strokeStyle = 'rgba(200,150,255,.35)'; c.lineWidth = 1.4; for (let y = -230; y < 0; y += 14) { c.beginPath(); c.moveTo(30, y + 6); c.quadraticCurveTo(46, y - 2, 62, y + 4); c.stroke(); } }, 1.2);
      // tělo úlu
      const hive = () => { c.beginPath(); c.moveTo(-104, 0); c.bezierCurveTo(-110, -80, -90, -168, -40, -186); c.bezierCurveTo(4, -198, 30, -150, 34, -100); c.bezierCurveTo(38, -60, 40, -30, 38, 0); c.closePath(); };
      solid(hive, '#5b2d8a', [-104, -190, 38, 0], () => {
        const r = BRng(13);
        for (let i = 0; i < 18; i++) { const x = -96 + r() * 130, y = -170 + r() * 160; c.fillStyle = radG(x - 4, y - 4, 1, 16, [[0, 'rgba(200,140,255,.35)'], [1, 'rgba(60,20,90,0)']]); circ(x, y, 14 + r() * 8); }
        c.strokeStyle = 'rgba(30,8,50,.55)'; c.lineWidth = 2; for (let i = 0; i < 9; i++) { let x = -100 + r() * 130, y = -10; c.beginPath(); c.moveTo(x, y); for (let k = 0; k < 7; k++) { x += (r() - 0.5) * 22; y -= 18 + r() * 8; c.lineTo(x, y); } c.stroke(); }
        c.strokeStyle = 'rgba(255,120,220,.35)'; c.lineWidth = 1; for (let i = 0; i < 9; i++) { let x = -100 + r() * 130, y = -10; c.beginPath(); c.moveTo(x, y); for (let k = 0; k < 5; k++) { x += (r() - 0.5) * 16; y -= 16 + r() * 8; c.lineTo(x, y); } c.stroke(); }
      }, 1.2);
      // ústí úlu
      c.beginPath(); c.moveTo(-58, 0); c.bezierCurveTo(-60, -56, -40, -82, -24, -82); c.bezierCurveTo(-8, -82, 10, -56, 8, 0); c.closePath(); c.fillStyle = radG(-24, -20, 4, 70, [[0, '#7dff6a'], [0.35, '#1f8a3a'], [1, '#0a1a10']]); c.fill(); outl(() => { c.beginPath(); c.moveTo(-58, 0); c.bezierCurveTo(-60, -56, -40, -82, -24, -82); c.bezierCurveTo(-8, -82, 10, -56, 8, 0); }, 2);
      c.fillStyle = '#e9d5ff'; for (let k = 0; k < 7; k++) { const a = Math.PI + k / 6 * Math.PI, x = -24 + Math.cos(a) * 30, y = -40 + Math.sin(a) * 40; c.save(); c.translate(x, y); c.rotate(a + Math.PI / 2); poly([-3, 0, 0, 12, 3, 0]); fo('#e9d5ff', 1); c.restore(); }
      // chapadla na zemi
      c.strokeStyle = '#3b1d5c'; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.moveTo(-100, -4); c.quadraticCurveTo(-116, -2, -120, -12); c.stroke(); c.beginPath(); c.moveTo(36, -4); c.quadraticCurveTo(60, 0, 78, -8); c.stroke();
      c.strokeStyle = '#7b4aaa'; c.lineWidth = 3; c.beginPath(); c.moveTo(-100, -4); c.quadraticCurveTo(-116, -2, -120, -12); c.stroke(); c.beginPath(); c.moveTo(36, -4); c.quadraticCurveTo(60, 0, 78, -8); c.stroke();
      c.fillStyle = 'rgba(120,255,120,.5)'; ell(-10, -2, 50, 4);    // sliz
      foot(-112, 86, { seed: 46, rocks: false, gcol: '#6a3a8a' });
    },
    an: team => {
      // pulzující zárodky
      for (const [x, y, s] of [[-78, -120, 9], [-50, -150, 8], [-12, -158, 10], [12, -110, 8], [-80, -60, 7]]) {
        const p = 0.8 + Math.sin(T * 3 + x) * 0.2;
        c.beginPath(); c.ellipse(x, y, s * p, s * 1.2 * p, 0, 0, Math.PI * 2); fo(radG(x - 2, y - 3, 0, s * 1.4, [[0, '#d9ff9a'], [0.5, '#5bd16a'], [1, '#1f6a2a']]), 1.4);
        c.fillStyle = 'rgba(0,40,10,.6)'; ell(x, y, s * 0.3, s * 0.5 * p);
      }
      c.globalAlpha = 0.5 + Math.sin(T * 2) * 0.2; glowDot(-24, -24, 50, '#7dff6a'); c.globalAlpha = 1;
      c.globalAlpha = 0.7; glowDot(64, -250, 14, '#ff4fd8'); c.globalAlpha = 1;
      flag(-40, -186, team, '#3b1d5c', 26);
    },
  },
  // ---------- Roboti: továrna s pilovou střechou, ozubená kola, komíny, radar ----------
  robot: {
    st: team => {
      // komíny (pravý okraj)
      for (const [x, h] of [[28, 226], [48, 196]]) { solid(rectP(x, -h, 16, h), '#6b7280', [x, -h, x + 16, 0], () => texMetal(x, -h, x + 16, 0, '#6b7280', { pw: 16, ph: 24, seed: x }), 1, 1.8); rr(x - 2, -h - 6, 20, 8, 2); fo('#4b5563', 1.4); hazard(x, -h + 10, 16, 5); }
      // hala s pilovou střechou
      solid(rectP(-98, -128, 124, 128), '#7c8494', [-98, -128, 26, 0], () => texMetal(-98, -128, 26, 0, '#7c8494', { pw: 31, ph: 32, seed: 7 }), 1.2);
      for (let k = 0; k < 4; k++) { const x = -98 + k * 31; c.beginPath(); c.moveTo(x, -128); c.lineTo(x, -158); c.lineTo(x + 31, -128); c.closePath(); fo(linG(x, 0, x + 31, 0, [[0, '#9aa3b2'], [1, '#4b5368']]), 1.6); c.fillStyle = 'rgba(56,225,255,.55)'; poly([x + 2, -132, x + 2, -152, x + 6, -148, x + 6, -132]); c.fill(); }
      // vrata s výstražným pruhem
      solid(rectP(-62, -70, 56, 70), '#3a4150', [-62, -70, -6, 0], () => { c.strokeStyle = 'rgba(0,0,0,.45)'; c.lineWidth = 1.2; for (let y = -66; y < 0; y += 5) ln(-62, y, -6, y); }, 0.8, 1.8);
      hazard(-62, -76, 56, 6);
      // panel s obrazovkou a kabely
      rr(-92, -112, 26, 18, 2); fo('#1f2430', 1.4); c.fillStyle = '#22c55e'; for (let k = 0; k < 4; k++) c.fillRect(-89 + k * 6, -106 + (k % 2) * 3, 4, 2);
      c.strokeStyle = '#1f2430'; c.lineWidth = 2.4; c.beginPath(); c.moveTo(26, -60); c.bezierCurveTo(10, -40, 16, -20, 0, -10); c.stroke();
      // radar na střeše
      c.strokeStyle = OL; c.lineWidth = 3.6; ln(-80, -158, -80, -186); c.strokeStyle = '#9aa3b2'; c.lineWidth = 2; ln(-80, -158, -80, -186);
      // bedny s díly
      crate(66, -16, 18, 16, '#4b5563');
      foot(-110, 86, { seed: 49, grass: false, n: 5 });
    },
    an: team => {
      gear(-30, -102, 15, 10, T * 0.8, '#9aa3b2'); gear(-6, -96, 10, 8, -T * 1.2, '#b9c2d0');
      puffs(36, -232, 5, '90,90,95', 0.45); puffs(56, -202, 4, '110,110,115', 0.4);
      c.save(); c.translate(-80, -188); c.scale(Math.cos(T * 1.8), 1); c.beginPath(); c.ellipse(0, 0, 14, 6, 0, Math.PI, 0); c.closePath(); fo('#d1d5db', 1.3); c.restore();
      beacon(36, -234, '#f59e0b', 1);
      glowLine(-60, -40, -8, -40, team[2], 1);
      flag(-36, -158, team, '#9aa3b2', 26);
    },
  },
  // ---------- Vesmírní mariňáci: přistávací modul na plošině, komunikační věž ----------
  marine: {
    st: team => {
      // komunikační věž (pravý okraj)
      lattice(32, -236, -14, 26, '#9aa3b2');
      c.beginPath(); c.arc(45, -240, 10, Math.PI * 0.15, Math.PI * 0.85, true); fo('#cbd5e1', 1.4);
      // plošina
      rr(-108, -16, 190, 16, 3); fo(linG(0, -16, 0, 0, [[0, '#6b7488'], [1, '#2b3040']]), 1.6); hazard(-104, -16, 186, 5);
      // přistávací nohy
      for (const [x0, x1] of [[-74, -98], [10, 34]]) { c.strokeStyle = OL; c.lineWidth = 6; ln(x0, -70, x1, -16); c.strokeStyle = '#9aa3b2'; c.lineWidth = 3.6; ln(x0, -70, x1, -16); rr(x1 - 9, -20, 18, 5, 2); fo('#4b5563', 1.2); }
      // modul
      const pod = () => { c.beginPath(); c.moveTo(-74, -40); c.lineTo(-70, -150); c.bezierCurveTo(-66, -210, -40, -234, -26, -236); c.bezierCurveTo(-12, -234, 14, -210, 18, -150); c.lineTo(22, -40); c.closePath(); };
      solid(pod, '#b8c0cc', [-74, -236, 22, -40], () => { texMetal(-74, -236, 22, -40, '#b8c0cc', { pw: 24, ph: 28, seed: 9, grime: 0.25 }); c.fillStyle = team[0]; c.fillRect(-80, -150, 110, 8); c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(-80, -142, 110, 2); }, 1.3);
      // tryska
      c.beginPath(); c.moveTo(-58, -40); c.lineTo(6, -40); c.lineTo(12, -24); c.lineTo(-64, -24); c.closePath(); fo(linG(0, -40, 0, -24, [[0, '#4b5563'], [1, '#1f2430']]), 1.6);
      porthole(-26, -196, 9); porthole(-46, -118, 6); porthole(-6, -118, 6);
      // vstupní rampa
      c.beginPath(); c.moveTo(-40, -40); c.lineTo(-12, -40); c.lineTo(-2, -16); c.lineTo(-50, -16); c.closePath(); fo('#6b7488', 1.4); c.strokeStyle = 'rgba(0,0,0,.4)'; c.lineWidth = 1; for (let k = 1; k < 5; k++) ln(-40 - k * 2, -40 + k * 5, -12 + k * 2, -40 + k * 5);
      rr(-38, -84, 24, 44, [6, 6, 0, 0]); fo('#1f2430', 1.6); c.fillStyle = 'rgba(56,225,255,.2)'; c.fillRect(-35, -80, 18, 38);
      c.fillStyle = '#e5e7eb'; c.font = 'bold 8px system-ui'; c.textAlign = 'center'; c.fillText('USS-7', -26, -164);
      crate(56, -34, 20, 18, '#4b5563'); crate(60, -48, 14, 14, '#55623a');
      foot(-112, 88, { seed: 52, grass: false, n: 4 });
    },
    an: team => {
      const op = c.globalCompositeOperation; c.globalCompositeOperation = 'lighter';
      c.fillStyle = `rgba(80,200,255,${0.25 + Math.sin(T * 9) * 0.06})`; ell(-26, -20, 34, 6); c.globalCompositeOperation = op;
      beacon(45, -250, '#ef4444', 1.2); beacon(-104, -18, '#22c55e', 0.7); beacon(78, -18, '#22c55e', 0.7);
      glowLine(-34, -44, -18, -44, team[2], 1);
      flag(-26, -236, team, '#9aa3b2', 26);
    },
  },
});
