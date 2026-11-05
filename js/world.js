// =====================================================================
//  ZÁKLADNY A VĚŽE
// =====================================================================
function drawBase(s, p) {
  const team = teamCol(s), f = facing(s);
  c.save(); c.translate(MX(BX[s]), GY); c.scale(f, 1);
  curEmb = (EMBS[p.emb] || EMBS[0]).ic;
  (FBASES[facAt(p, p.age).g] || BASES[p.age])(team);
  curEmb = '';
  for (let k = 0; k < p.slots; k++) {
    const y = -170 + k * 36;
    rr(38, y + 8, 30, 6, 2); fo(lg('ledge', 0, y, 0, y + 14, [[0, '#6b7280'], [1, '#374151']]), 1.2);
    c.fillStyle = '#374151'; poly([40, y + 14, 48, y + 14, 40, y + 22]); c.fill();
    if (p.tur[k]) drawTurret(p.tur[k].a, p.tur[k].i, 54, y + 2);
  }
  c.restore();
  if (p.hp > 0 && p.hp < p.mhp * 0.5) baseDamage(MX(BX[s]), p.hp < p.mhp * 0.2, s);
  const x = MX(BX[s]) - 55, y = GY - 248;
  rr(x - 3, y - 3, 116, 14, 6); c.fillStyle = 'rgba(15,20,30,.75)'; c.fill();
  rr(x, y, 110 * Math.max(0, p.hp / p.mhp), 8, 4);
  c.fillStyle = s === mySide ? '#4ade80' : '#f87171'; c.fill();
  c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(x + 2, y + 1, Math.max(0, 110 * p.hp / p.mhp - 4), 2);
  c.font = '800 13px system-ui'; c.textAlign = 'center';
  c.lineWidth = 3; c.strokeStyle = 'rgba(0,0,0,.6)'; const hpTxt = `${Math.max(0, Math.round(p.hp))} / ${Math.round(p.mhp)}`; c.strokeText(hpTxt, x + 55, y - 7);
  c.fillStyle = '#fff'; c.fillText(hpTxt, x + 55, y - 7);
}

// poškozená základna: pod 50 % HP kouří, pod 20 % navíc hoří
function baseDamage(bx, fire, s) {
  const spots = [[-28, -150], [22, -105], [-6, -205]], n = GFXL >= 2 ? 6 : 3;
  spots.forEach(([dx, dy], k) => {
    const x = bx + dx * facing(s), y = GY + dy;
    for (let i = 0; i < n; i++) {                       // kouř stoupá a rozplývá se
      const t = (T * 0.45 + i / n + k * 0.37) % 1, r = 7 + t * 20;
      c.fillStyle = `rgba(${fire ? 40 : 70},${fire ? 36 : 66},${fire ? 34 : 62},${(1 - t) * (fire ? 0.5 : 0.35)})`;
      circ(x + Math.sin(t * 5 + k * 2 + i) * 7 + t * 18, y - 8 - t * 95, r);
    }
    if (!fire) return;
    const op = c.globalCompositeOperation; c.globalCompositeOperation = 'lighter';
    c.fillStyle = 'rgba(255,120,20,.28)'; circ(x, y - 6, 22);
    c.globalCompositeOperation = op;
    for (const [w, h, col] of [[11, 30, '#ea580c'], [7, 20, '#f59e0b'], [3.5, 11, '#fde68a']]) {
      const fl = Math.sin(T * 13 + k * 3) * 3, fh = h * (0.85 + Math.sin(T * 9 + k) * 0.15);
      c.beginPath(); c.moveTo(x - w, y); c.quadraticCurveTo(x - w * 1.2, y - fh * 0.55, x + fl, y - fh);
      c.quadraticCurveTo(x + w * 1.2, y - fh * 0.5, x + w, y); c.closePath(); c.fillStyle = col; c.fill();
    }
  });
}
function flag(x, y, team, pole, h = 34) {
  c.strokeStyle = OL; c.lineWidth = 4.4; ln(x, y, x, y - h);
  c.strokeStyle = pole; c.lineWidth = 2.4; ln(x, y, x, y - h);
  const w1 = Math.sin(T * 4) * 3, w2 = Math.sin(T * 4 + 1.5) * 3;
  c.beginPath(); c.moveTo(x, y - h); c.quadraticCurveTo(x + 14, y - h - 4 + w1, x + 28, y - h + 2 + w2);
  c.lineTo(x + 28, y - h + 18 + w2); c.quadraticCurveTo(x + 14, y - h + 12 + w1, x, y - h + 16); c.closePath();
  fo(team[0], 1.3);
  if (curEmb) {                                       // znak hráče (zrcadlení zpět, ať není obrácený)
    c.save(); c.translate(x + 14, y - h + 9 + w1 * 0.5); if (c.getTransform().a < 0) c.scale(-1, 1);
    c.font = '11px system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(curEmb, 0, 0); c.textBaseline = 'alphabetic'; c.restore();
  } else { c.fillStyle = team[2]; circ(x + 13, y - h + 8 + w1 * 0.5, 3); }
  c.fillStyle = '#e5c04a'; circ(x, y - h - 1, 2.2);
}
function torch(x, y) {
  rr(x - 2, y, 4, 20, 1); fo('#6b4423', 1);
  rr(x - 3.5, y - 2, 7, 4, 1); fo('#3c3f46', 1);
  const fl = Math.sin(T * 14 + x) * 2;
  const op = c.globalCompositeOperation; c.globalCompositeOperation = 'lighter';
  c.fillStyle = 'rgba(255,140,30,.35)'; circ(x, y - 8, 14);
  c.globalCompositeOperation = op;
  c.beginPath(); c.moveTo(x - 5, y - 2); c.quadraticCurveTo(x - 6, y - 12, x + fl, y - 20); c.quadraticCurveTo(x + 6, y - 10, x + 5, y - 2); c.closePath();
  c.fillStyle = '#f97316'; c.fill();
  c.beginPath(); c.moveTo(x - 2.5, y - 2); c.quadraticCurveTo(x - 3, y - 8, x + fl * 0.5, y - 13); c.quadraticCurveTo(x + 3, y - 7, x + 2.5, y - 2); c.closePath();
  c.fillStyle = '#fde68a'; c.fill();
}
function bricks(x0, y0, w, h, bw, bh, col) {
  c.save(); c.beginPath(); c.rect(x0, y0, w, h); c.clip();
  c.strokeStyle = col; c.lineWidth = 1;
  for (let y = y0, r = 0; y < y0 + h; y += bh, r++) {
    ln(x0, y, x0 + w, y);
    for (let x = x0 + (r % 2 ? bw / 2 : 0); x < x0 + w; x += bw) ln(x, y, x, y + bh);
  }
  c.restore();
}

// jeskyně doby kamenné: vrstvená skála, mech a liány, krápníky, mamutí kly,
// jeskynní malby, ohniště s kouřem, palisáda, kožešina a kosti
const CAVE_SPECK = (() => { let q = 5; const r = () => (q = (q * 16807) % 2147483647) / 2147483647; return Array.from({ length: 70 }, () => [r() * 130 - 72, -r() * 190 - 8, 0.6 + r() * 1.8, r()]); })();
function caveRockPath() {
  c.beginPath(); c.moveTo(-80, 0);
  c.bezierCurveTo(-90, -60, -86, -112, -66, -146); c.bezierCurveTo(-58, -170, -40, -192, -18, -204);
  c.bezierCurveTo(-4, -214, 16, -212, 30, -200); c.bezierCurveTo(48, -184, 58, -160, 62, -128);
  c.bezierCurveTo(70, -90, 74, -46, 70, 0); c.closePath();
}
function drawCave(team) {
  // zadní balvan (hloubka)
  c.beginPath(); c.moveTo(-60, -120); c.bezierCurveTo(-74, -170, -40, -222, 6, -222); c.bezierCurveTo(40, -220, 52, -190, 40, -160); c.closePath();
  fo(lg('caveBack', 0, -222, 0, -120, [[0, '#8a7764'], [1, '#5a4a3c']]), 2);
  // hlavní skála
  caveRockPath();
  fo(lg('caveR', -70, -210, 50, 0, [[0, '#b7a48c'], [0.35, '#94806a'], [0.7, '#6f5c4a'], [1, '#4a3c30']]), 2.2);
  c.save(); caveRockPath(); c.clip();
  // vrstvy horniny
  c.strokeStyle = 'rgba(60,46,34,.35)'; c.lineWidth = 2;
  for (let i = 0; i < 6; i++) { const y = -30 - i * 30; c.beginPath(); c.moveTo(-90, y + 6); c.quadraticCurveTo(-20, y - 8 + (i % 2) * 10, 80, y + 4); c.stroke(); }
  // tečkování a skvrny
  for (const [x, y, r, k] of CAVE_SPECK) { c.fillStyle = k < 0.5 ? 'rgba(60,46,34,.28)' : 'rgba(220,205,180,.22)'; circ(x, y, r); }
  // světlá hrana nahoře vlevo, stín vpravo
  c.strokeStyle = 'rgba(255,240,215,.35)'; c.lineWidth = 6;
  c.beginPath(); c.moveTo(-84, -40); c.bezierCurveTo(-88, -100, -70, -150, -40, -190); c.quadraticCurveTo(-10, -212, 26, -202); c.stroke();
  c.fillStyle = 'rgba(30,22,16,.25)'; c.beginPath(); c.moveTo(70, 0); c.bezierCurveTo(74, -60, 66, -110, 56, -140); c.lineTo(40, -120); c.bezierCurveTo(50, -80, 52, -40, 48, 0); c.closePath(); c.fill();
  // praskliny
  c.strokeStyle = 'rgba(40,30,22,.6)'; c.lineWidth = 1.6; c.lineJoin = 'round';
  c.beginPath(); c.moveTo(-52, -160); c.lineTo(-44, -140); c.lineTo(-50, -122); c.lineTo(-42, -104);
  c.moveTo(16, -192); c.lineTo(26, -172); c.lineTo(20, -156); c.moveTo(-70, -70); c.lineTo(-58, -60); c.lineTo(-62, -46);
  c.moveTo(50, -110); c.lineTo(58, -98); c.stroke();
  // jeskynní malby: lovci a mamut (okr)
  c.strokeStyle = '#b4532a'; c.fillStyle = '#b4532a'; c.lineWidth = 1.6; c.lineCap = 'round';
  c.save(); c.translate(-58, -112);
  c.beginPath(); c.ellipse(0, 0, 9, 6, 0, 0, Math.PI * 2); c.fill();                         // mamut
  ln(-6, 4, -6, 11); ln(-2, 5, -2, 11); ln(3, 5, 3, 11); ln(6, 4, 6, 11);
  c.beginPath(); c.moveTo(8, -1); c.quadraticCurveTo(15, 2, 12, 10); c.stroke();               // chobot
  c.beginPath(); c.moveTo(8, 2); c.quadraticCurveTo(14, 6, 16, 2); c.stroke();                 // kel
  for (const hx of [-20, -14]) { circ(hx, -6, 1.6); ln(hx, -4, hx, 3); ln(hx, 3, hx - 2, 9); ln(hx, 3, hx + 2, 9); ln(hx, -2, hx + 5, -6); ln(hx + 5, -6, hx + 9, -8); }
  c.restore();
  c.fillStyle = 'rgba(180,83,42,.8)'; for (const [x, y] of [[-30, -150], [-24, -146], [-34, -144]]) circ(x, y, 1.8);   // otisky dlaní (tečky)
  c.restore();
  // mech nahoře a liány
  c.fillStyle = '#5f9a42'; ell(-24, -206, 26, 8); ell(12, -205, 20, 6); ell(-60, -158, 12, 5); ell(48, -150, 9, 4);
  c.fillStyle = '#7cbf5a'; ell(-28, -209, 14, 4); ell(10, -208, 10, 3);
  c.strokeStyle = '#4f8a36'; c.lineWidth = 2;
  for (const [x, y, len] of [[-36, -204, 46], [-10, -208, 34], [22, -200, 52], [-62, -152, 30]]) {
    const sw = Math.sin(T * 1.4 + x) * 3;
    c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + sw, y + len / 2, x + sw * 1.6, y + len); c.stroke();
    c.fillStyle = '#6aa84f'; for (let k = 8; k < len; k += 9) ell(x + sw * (k / len) * 1.5 + (k % 18 ? 3 : -3), y + k, 3, 1.8);
  }
  // vchod: hluboký otvor s krápníky
  const ent = () => { c.beginPath(); c.moveTo(-24, 0); c.bezierCurveTo(-28, -50, -10, -88, 12, -90); c.bezierCurveTo(36, -88, 52, -54, 48, 0); c.closePath(); };
  ent(); fo(rg('caveIn', 12, -14, 4, 86, [[0, '#4a3220'], [0.5, '#24170e'], [1, '#0c0805']]), 2.4);
  const op = c.globalCompositeOperation; c.globalCompositeOperation = 'lighter';
  c.fillStyle = `rgba(255,130,40,${0.22 + Math.sin(T * 9) * 0.04})`; ell(12, -18, 30, 26); c.globalCompositeOperation = op;
  c.save(); ent(); c.clip();
  c.fillStyle = '#5c4a3a';
  for (const [x, h] of [[-10, 14], [-2, 22], [6, 12], [14, 26], [22, 16], [30, 20], [38, 11]]) { c.beginPath(); c.moveTo(x - 4, -92); c.lineTo(x, -92 + h); c.lineTo(x + 4, -92); c.fill(); }
  c.fillStyle = '#3a2c20'; for (const [x, h] of [[-16, 12], [42, 14]]) { c.beginPath(); c.moveTo(x - 5, 0); c.lineTo(x, -h); c.lineTo(x + 5, 0); c.fill(); }
  c.restore();
  // mamutí kly kolem vchodu
  for (const m of [-1, 1]) {
    const bx = m < 0 ? -30 : 54;
    c.beginPath(); c.moveTo(bx, 0); c.bezierCurveTo(bx - m * 6, -40, bx + m * 4, -86, 12 + m * 8, -108);
    c.bezierCurveTo(bx + m * 12, -84, bx + m * 4, -40, bx + m * 9, 0); c.closePath();
    fo(lg('tusk', 0, -108, 0, 0, [[0, '#fffaf0'], [1, '#d9ccb0']]), 1.6);
    c.strokeStyle = 'rgba(150,130,100,.5)'; c.lineWidth = 1; for (let k = 1; k < 5; k++) ln(bx + m * 2, -k * 18, bx + m * 7, -k * 18 + 3);
  }
  // natažená kožešina vlevo od vchodu
  c.beginPath(); c.moveTo(-58, -78); c.lineTo(-34, -82); c.lineTo(-30, -40); c.quadraticCurveTo(-44, -30, -60, -42); c.closePath();
  fo(lg('hide', 0, -82, 0, -36, [[0, '#c9a06a'], [1, '#93683a']]), 1.4);
  c.fillStyle = '#6e4a24'; for (const [x, y] of [[-50, -70], [-42, -58], [-52, -52], [-40, -46]]) ell(x, y, 2.6, 1.8);
  c.strokeStyle = '#5c3a1e'; c.lineWidth = 2; ln(-60, -80, -32, -84);
  // palisáda z kůlů (vpředu vlevo)
  for (let i = 0; i < 5; i++) {
    const x = -88 + i * 8, h = 30 + (i % 2) * 8;
    c.beginPath(); c.moveTo(x - 3, 0); c.lineTo(x - 3, -h); c.lineTo(x, -h - 7); c.lineTo(x + 3, -h); c.lineTo(x + 3, 0); c.closePath(); fo('#8b5e34', 1.2);
  }
  c.strokeStyle = '#5c3a1e'; c.lineWidth = 2.5; ln(-92, -14, -54, -16); ln(-92, -24, -54, -27);
  // ohniště: kameny, polena, plameny, kouř
  for (let i = 0; i < 6; i++) { c.beginPath(); c.ellipse(-2 + i * 6, -2, 3.6, 2.6, 0, 0, Math.PI * 2); fo(i % 2 ? '#7a7066' : '#918679', 1); }
  c.strokeStyle = '#4a2c14'; c.lineWidth = 3.2; ln(2, -2, 26, -8); ln(4, -8, 26, -1);
  c.globalCompositeOperation = 'lighter'; c.fillStyle = 'rgba(255,150,50,.35)'; circ(13, -10, 16 + Math.sin(T * 11) * 2); c.globalCompositeOperation = op;
  for (let i = 0; i < 4; i++) {
    const h = 13 + Math.sin(T * 13 + i * 1.7) * 5, x = 5 + i * 5;
    c.beginPath(); c.moveTo(x - 3, -4); c.quadraticCurveTo(x - 2, -4 - h * 0.6, x + Math.sin(T * 9 + i) * 2, -4 - h); c.quadraticCurveTo(x + 3, -4 - h * 0.5, x + 3, -4); c.closePath();
    c.fillStyle = i % 2 ? '#fbbf24' : '#f97316'; c.fill();
  }
  for (let i = 0; i < 4; i++) {
    const t = (T * 0.5 + i / 4) % 1;
    c.fillStyle = `rgba(120,115,110,${0.35 * (1 - t)})`; circ(14 + Math.sin(T + i * 2) * 6 + t * 10, -22 - t * 70, 4 + t * 9);
  }
  // kosti a lebky
  c.fillStyle = '#f0ead8'; circ(-40, -7, 5.4); c.fillStyle = '#1a1a1a'; circ(-42, -8, 1.4); circ(-38, -8, 1.4); c.fillRect(-41, -4, 2, 1.5);
  c.fillStyle = '#f0ead8'; rr(56, -5, 14, 3, 1.5); c.fill(); circ(56, -3.5, 2.2); circ(70, -3.5, 2.2);
  rr(-20, -3, 10, 2.4, 1.2); c.fill(); circ(-20, -2, 1.7); circ(-10, -2, 1.7);
  torch(-30, -44); torch(58, -44);
  flag(-22, -212, team, '#8b5a2b', 40);
}

const BASES = [
  // jeskyně
  drawCave,
  // hrad
  team => {
    c.beginPath(); c.rect(-66, -186, 108, 186); fo(lg('keep', -66, 0, 42, 0, [[0, '#9ea3ab'], [0.5, '#8a8f98'], [1, '#5f646d']]), 2);
    bricks(-66, -186, 108, 186, 18, 12, 'rgba(60,64,72,.35)');
    for (let i = 0; i < 5; i++) { c.beginPath(); c.rect(-66 + i * 23, -200, 13, 15); fo('#8a8f98', 1.6); }
    c.beginPath(); c.rect(30, -214, 34, 214); fo(lg('tower', 30, 0, 64, 0, [[0, '#a7acb4'], [1, '#666b74']]), 2);
    bricks(30, -214, 34, 214, 14, 12, 'rgba(60,64,72,.35)');
    poly([26, -214, 47, -252, 68, -214]); fo(lg('roof' + team[0], 26, -252, 68, -214, [[0, team[2]], [0.5, team[0]], [1, team[1]]]), 2);
    flag(47, -252, team, '#4b5563', 30);
    for (const [x, y] of [[-46, -140], [-14, -140], [40, -170], [40, -120]]) {
      c.beginPath(); c.moveTo(x, y + 18); c.lineTo(x, y + 5); c.arc(x + 5, y + 5, 5, Math.PI, 0); c.lineTo(x + 10, y + 18); c.closePath();
      fo('#ffcf6b', 1.4); c.fillStyle = 'rgba(120,60,0,.4)'; c.fillRect(x + 4.3, y, 1.4, 18);
    }
    c.beginPath(); c.moveTo(-30, 0); c.lineTo(-30, -48); c.arc(-10, -48, 20, Math.PI, 0); c.lineTo(10, 0); c.closePath();
    fo('#2a1d12', 2);
    c.strokeStyle = '#4b5563'; c.lineWidth = 2;
    for (let x = -26; x < 10; x += 7) ln(x, -62, x, -4);
    for (let y = -56; y < 0; y += 8) ln(-30, y, 10, y);
    c.beginPath(); c.moveTo(-62, -110); c.lineTo(-36, -110); c.lineTo(-36, -64); c.lineTo(-49, -72); c.lineTo(-62, -64); c.closePath();
    fo(team[0], 1.5); c.fillStyle = '#e5c04a'; poly([-49, -102, -42, -90, -49, -78, -56, -90]); c.fill();
  },
  // renesanční pevnost
  team => {
    c.beginPath(); c.moveTo(-72, 0); c.lineTo(-66, -70); c.lineTo(52, -70); c.lineTo(60, 0); c.closePath();
    fo(lg('fortL', 0, -70, 0, 0, [[0, '#b9b0a0'], [1, '#7f7668']]), 2);
    bricks(-70, -70, 130, 70, 20, 14, 'rgba(70,60,50,.35)');
    c.beginPath(); c.rect(-60, -176, 104, 108); fo(lg('fortU', -60, 0, 44, 0, [[0, '#f0e2c4'], [1, '#c9b48e']]), 2);
    c.strokeStyle = '#6b4423'; c.lineWidth = 4;
    ln(-60, -150, 44, -150); ln(-60, -104, 44, -104); ln(-24, -176, -24, -70); ln(14, -176, 14, -70); ln(-60, -176, -24, -104); ln(14, -176, 44, -150);
    c.beginPath(); c.rect(-60, -176, 104, 108); c.strokeStyle = OL; c.lineWidth = 2; c.stroke();
    poly([-70, -174, -8, -232, 54, -174]); fo(lg('tiles', 0, -232, 0, -174, [[0, '#c0533a'], [1, '#7c2d1e']]), 2);
    c.strokeStyle = 'rgba(60,20,10,.5)'; c.lineWidth = 1.2;
    for (let k = 1; k < 5; k++) { const y = -174 - k * 11; const hw = (232 - 174 - k * 11) / 58 * 62; ln(-8 - hw, y, -8 + hw, y); }
    c.beginPath(); c.arc(-8, -196, 8, 0, Math.PI * 2); fo('#f8f3e6', 1.5);
    c.strokeStyle = OL; c.lineWidth = 1.4; ln(-8, -196, -8, -201); ln(-8, -196, -4, -196);
    for (const x of [-46, -6, 26]) { c.beginPath(); c.rect(x, -140, 12, 18); fo('#ffcf6b', 1.4); c.fillStyle = '#6b4423'; c.fillRect(x + 5.3, -140, 1.4, 18); c.fillRect(x, -132, 12, 1.4); }
    for (const x of [-44, 4]) { c.beginPath(); c.arc(x, -38, 10, 0, Math.PI * 2); fo('#2a2a2a', 1.6); c.fillStyle = '#111'; circ(x, -38, 5); }
    rr(-20, -54, 18, 54, [9, 9, 0, 0]); fo('#5c3a1e', 1.8);
    c.fillStyle = '#e5c04a'; circ(-6, -26, 1.6);
    flag(-8, -232, team, '#3b2414', 34);
  },
  // bunkr
  team => {
    c.beginPath(); c.moveTo(-74, 0); c.lineTo(-70, -128); c.lineTo(-48, -150); c.lineTo(36, -150); c.lineTo(58, -128); c.lineTo(62, 0); c.closePath();
    fo(lg('conc', -70, 0, 60, 0, [[0, '#9aa08e'], [0.5, '#80877a'], [1, '#585e52']]), 2);
    c.fillStyle = 'rgba(70,85,50,.55)';
    for (const [x, y, rx, ry] of [[-44, -120, 18, 9], [10, -132, 22, 8], [-20, -86, 14, 10], [30, -70, 16, 9], [-54, -50, 12, 14]]) ell(x, y, rx, ry);
    c.strokeStyle = 'rgba(40,40,40,.35)'; c.lineWidth = 1; ln(-70, -100, 60, -100); ln(-71, -60, 61, -60);
    for (const [x, y, w] of [[-50, -120, 36], [4, -120, 36], [-24, -82, 48]]) { rr(x, y, w, 9, 2); fo('#151515', 1.4); c.fillStyle = 'rgba(255,200,80,.25)'; c.fillRect(x + 2, y + 2, w - 4, 2); }
    rr(-40, -44, 30, 44, 2); fo('#3c4038', 1.8); c.fillStyle = '#9ca3af'; c.fillRect(-16, -24, 3, 6);
    c.strokeStyle = '#3a3a3a'; c.lineWidth = 2.4; ln(-30, -150, -30, -196); ln(20, -150, 20, -184);
    c.save(); c.translate(-30, -196); c.scale(Math.cos(T * 2), 1);
    c.beginPath(); c.ellipse(0, 0, 14, 6, 0, Math.PI, 0); c.closePath(); fo('#b8bec6', 1.4); c.restore();
    c.fillStyle = Math.sin(T * 6) > 0 ? '#ef4444' : '#7f1d1d'; circ(20, -186, 2.6);
    for (let r = 0; r < 3; r++) for (let i = 0; i < 6 - r; i++) { rr(-70 + r * 10 + i * 20, -12 - r * 11, 20, 12, 5); fo(r % 2 ? '#c8b98a' : '#b9a979', 1.2); }
    c.strokeStyle = '#5b5b5b'; c.lineWidth = 1;
    c.beginPath(); for (let i = 0; i < 7; i++) c.ellipse(-60 + i * 9, -40, 5, 6, 0, 0, Math.PI * 2); c.stroke();
    flag(46, -150, team, '#4b5563', 36);
  },
  // budoucnost
  team => {
    c.beginPath(); c.moveTo(-74, 0); c.lineTo(-44, -206); c.lineTo(28, -206); c.lineTo(62, 0); c.closePath();
    fo(lg('futT', -70, 0, 60, 0, [[0, '#8691a8'], [0.45, '#4b5368'], [1, '#1e2230']]), 2);
    c.strokeStyle = 'rgba(160,175,200,.35)'; c.lineWidth = 1;
    for (const y of [-170, -130, -90, -50]) { const k = (-y) / 206; ln(-74 + 30 * k + 4, y, 62 - 34 * k - 4, y); }
    ln(-8, -206, -8, -176); ln(-8, -40, -8, 0);
    c.beginPath(); c.moveTo(-50, -206); c.lineTo(34, -206); c.lineTo(24, -222); c.lineTo(-40, -222); c.closePath(); fo('#2b3040', 1.8);
    const pulse = 0.65 + Math.sin(T * 3) * 0.25;
    c.globalAlpha = pulse; glowDot(-8, -104, 46, team[0]); c.globalAlpha = 1;
    c.beginPath(); c.arc(-8, -104, 18, 0, Math.PI * 2); fo('#11151f', 2);
    glowDot(-8, -104, 14, team[2]);
    for (let k = 0; k < 2; k++) {
      const y = -234 - k * 12 + Math.sin(T * 2 + k) * 3;
      c.strokeStyle = k ? team[2] : '#38e1ff'; c.globalAlpha = 0.8; c.lineWidth = 2.2;
      c.beginPath(); c.ellipse(-8, y, 30 - k * 8, 5 - k, 0, 0, Math.PI * 2); c.stroke(); c.globalAlpha = 1;
    }
    glowLine(-62, -30, 52, -30, '#38e1ff', 1.4);
    glowLine(-40, -170, 26, -170, '#38e1ff', 1.2);
    rr(-28, -40, 36, 40, [6, 6, 0, 0]); fo('#11151f', 1.8); glowLine(-22, -36, 2, -36, team[0], 1.2);
    flag(-8, -222, team, '#9aa3b2', 24);
  },
];

// =====================================================================
//  ZÁKLADNY PODLE NÁRODA (výchozí národ věku má základnu z BASES)
// =====================================================================
function gear(x, y, r, n, a, col) {
  c.save(); c.translate(x, y); c.rotate(a);
  c.beginPath();
  for (let i = 0; i < n * 2; i++) { const ang = i / (n * 2) * Math.PI * 2, rad = i % 2 ? r : r * 1.22; c.lineTo(Math.cos(ang) * rad, Math.sin(ang) * rad); }
  c.closePath(); fo(col, 1.4);
  c.fillStyle = '#1f2430'; circ(0, 0, r * 0.35);
  c.restore();
}
function smoke(x, y, n, col, sp = 0.4) {
  for (let i = 0; i < n; i++) {
    const t = (T * sp + i / n) % 1;
    c.fillStyle = `rgba(${col},${0.4 * (1 - t)})`; circ(x + Math.sin(T + i * 2) * 5 + t * 14, y - t * 70, 4 + t * 10);
  }
}
function sandbags(x0, w, rows) {
  for (let r = 0; r < rows; r++) for (let x = x0 + r * 7; x < x0 + w - r * 7; x += 16) { rr(x, -10 - r * 9, 16, 10, 5); fo(r % 2 ? '#c8b98a' : '#b4a474', 1.1); }
}
const FBASES = {
  // Kmen Vlka: týpí z kůží, vlčí totem s lebkou
  wolf: team => {
    poly([-86, 0, -60, -118, -34, 0]); fo(lg('tpB', 0, -118, 0, 0, [[0, '#c9a679'], [1, '#8a6a44']]), 1.8);
    c.strokeStyle = '#5c3a1e'; c.lineWidth = 2.4; ln(-60, -112, -68, -132); ln(-60, -112, -52, -132);
    const tp = () => poly([-64, 0, -8, -194, 48, 0]);
    tp(); fo(lg('tpA', -64, 0, 48, 0, [[0, '#ead2a4'], [0.6, '#c49a63'], [1, '#8f6a3e']]), 2.2);
    c.save(); tp(); c.clip();
    c.fillStyle = team[0]; c.fillRect(-70, -64, 124, 10); c.fillStyle = team[1]; c.fillRect(-70, -54, 124, 3);
    c.fillStyle = '#7f1d1d'; for (let x = -60; x < 50; x += 12) poly([x, -140, x + 6, -130, x + 12, -140]), c.fill();
    c.fillStyle = '#3b2a1a';
    for (const [x, y] of [[-30, -96], [-18, -108], [4, -100], [16, -112]]) { ell(x, y, 3.2, 3.8); for (let k = -1; k <= 1; k++) circ(x + k * 2.8, y - 5.5, 1.3); }
    c.strokeStyle = 'rgba(80,50,25,.45)'; c.lineWidth = 1.2; ln(-8, -194, -42, 0); ln(-8, -194, 26, 0);
    c.restore();
    c.strokeStyle = '#5c3a1e'; c.lineWidth = 3; ln(-8, -186, -24, -224); ln(-8, -186, 8, -226); ln(-8, -186, -4, -230);
    c.beginPath(); c.moveTo(-24, 0); c.quadraticCurveTo(-8, -70, 8, 0); c.closePath(); fo('#22150b', 1.6);
    c.beginPath(); c.moveTo(-8, -66); c.quadraticCurveTo(-28, -40, -34, 0); c.lineTo(-24, 0); c.quadraticCurveTo(-14, -40, -8, -66); c.closePath(); fo('#b88a55', 1.2);
    // vlčí totem
    rr(42, -164, 10, 164, 2); fo(lg('totW', 42, 0, 52, 0, [[0, '#8b5e34'], [1, '#5c3a1e']]), 1.6);
    c.strokeStyle = 'rgba(40,20,8,.5)'; c.lineWidth = 1; for (let y = -150; y < 0; y += 22) ln(42, y, 52, y + 4);
    poly([34, -164, 36, -178, 42, -166]); fo('#ece3cc', 1.2); poly([52, -166, 58, -178, 60, -164]); fo('#ece3cc', 1.2);
    c.beginPath(); c.moveTo(34, -166); c.lineTo(60, -166); c.lineTo(56, -146); c.lineTo(47, -132); c.lineTo(38, -146); c.closePath(); fo('#efe6d2', 1.4);
    c.fillStyle = '#1a1208'; ell(41, -156, 3, 2.4); ell(53, -156, 3, 2.4); circ(47, -138, 1.6);
    c.fillStyle = '#fff'; poly([42, -136, 44, -128, 45, -136]); c.fill(); poly([49, -136, 50, -128, 52, -136]); c.fill();
    for (const [x, col] of [[38, team[0]], [56, '#e5c04a']]) { c.strokeStyle = '#5c3a1e'; c.lineWidth = 1; ln(x, -146, x, -124); c.fillStyle = col; ell(x, -120, 2.4, 6); }
    torch(-76, -36);
    flag(-8, -226, team, '#5c3a1e', 26);
  },
  // Kmen Medvěda: zemní srub z klád pod drnem, medvědí lebka a strážní věž
  bear: team => {
    const mound = () => { c.beginPath(); c.moveTo(-84, 0); c.bezierCurveTo(-84, -118, -44, -162, -4, -162); c.bezierCurveTo(32, -162, 56, -120, 56, 0); c.closePath(); };
    mound(); fo('#6b4a2c', 2.2);
    c.save(); mound(); c.clip();
    for (let i = 0; i < 8; i++) {
      const y = -10 - i * 20; rr(-92, y - 9, 160, 18, 9); fo(lg('bLog' + (i % 2), 0, -9, 0, 9, [[0, i % 2 ? '#94683c' : '#a8774a'], [1, '#5f3f22']]), 1.2);
      c.fillStyle = '#d9b98a'; ell(-82 + (i % 2) * 4, y, 4, 7); c.fillStyle = '#7a5530'; ell(-82 + (i % 2) * 4, y, 1.6, 3);
    }
    c.fillStyle = '#5f8a3a'; c.beginPath(); c.moveTo(-90, -110); c.bezierCurveTo(-60, -170, 40, -180, 64, -104); c.lineTo(64, -170); c.lineTo(-90, -170); c.closePath(); c.fill();
    c.restore();
    c.fillStyle = '#7cb04a'; for (let x = -66; x < 40; x += 9) { const y = -150 - Math.sin((x + 10) / 40) * 10 + (x > 0 ? x * 0.4 : -x * 0.3); poly([x, y + 4, x + 3, y - 6, x + 6, y + 4]); c.fill(); }
    // vchod s medvědí kožešinou a lebkou
    c.beginPath(); c.moveTo(-36, 0); c.lineTo(-36, -54); c.quadraticCurveTo(-14, -74, 8, -54); c.lineTo(8, 0); c.closePath(); fo('#1a110a', 2);
    c.beginPath(); c.moveTo(-40, -58); c.quadraticCurveTo(-14, -80, 12, -58); c.lineTo(10, -20); c.quadraticCurveTo(0, -30, -2, -46); c.lineTo(-26, -46); c.quadraticCurveTo(-28, -30, -38, -20); c.closePath();
    fo(lg('bPelt', 0, -80, 0, -20, [[0, '#6b4a30'], [1, '#3c2818']]), 1.4);
    c.fillStyle = '#f0e8d4'; ell(-14, -78, 13, 10); c.fillStyle = '#f0e8d4'; circ(-24, -86, 4.5); circ(-4, -86, 4.5);
    c.fillStyle = '#1a1208'; ell(-19, -79, 3, 3.4); ell(-9, -79, 3, 3.4); c.fillRect(-15.5, -72, 3, 3);
    c.fillStyle = '#fff'; for (const x of [-20, -8]) { poly([x, -69, x + 1.5, -62, x + 3, -69]); c.fill(); }
    // drápy po stranách
    c.strokeStyle = 'rgba(30,18,8,.7)'; c.lineWidth = 2; for (let k = 0; k < 3; k++) ln(-64 + k * 5, -96, -58 + k * 5, -72);
    smoke(-30, -164, 4, '120,115,110');
    // strážní věž z klád
    for (const x of [34, 60]) { rr(x - 3, -180, 6, 180, 2); fo('#7a5230', 1.4); }
    c.strokeStyle = '#5c3a1e'; c.lineWidth = 2.4; ln(34, -40, 60, -90); ln(60, -40, 34, -90); ln(34, -100, 60, -150); ln(60, -100, 34, -150);
    rr(28, -186, 38, 8, 2); fo('#8b5e34', 1.4); poly([26, -186, 47, -212, 68, -186]); fo('#6b4a2c', 1.6);
    torch(-76, -30);
    flag(47, -212, team, '#5c3a1e', 24);
  },
  // Kmen Orla: rákosová chýše a vysoký totem s orlími křídly
  eagle: team => {
    const hut = () => { c.beginPath(); c.moveTo(-84, 0); c.lineTo(-80, -78); c.quadraticCurveTo(-36, -134, 16, -78); c.lineTo(18, 0); c.closePath(); };
    hut(); fo(lg('eHut', 0, -130, 0, 0, [[0, '#d8bd7c'], [1, '#8a6c3c']]), 2);
    c.save(); hut(); c.clip(); c.strokeStyle = 'rgba(110,80,40,.5)'; c.lineWidth = 1.2;
    for (let x = -90; x < 30; x += 5) ln(x, 0, x + 4, -140);
    c.fillStyle = team[0]; c.fillRect(-90, -50, 120, 6); c.restore();
    c.beginPath(); c.moveTo(-92, -74); c.quadraticCurveTo(-36, -146, 26, -74); c.quadraticCurveTo(-36, -120, -92, -74); c.closePath(); fo('#b8964f', 1.6);
    c.beginPath(); c.moveTo(-50, 0); c.lineTo(-50, -40); c.quadraticCurveTo(-36, -56, -22, -40); c.lineTo(-22, 0); c.closePath(); fo('#22150b', 1.6);
    // totem: tři tváře a orel nahoře
    const cols = ['#b4532a', team[0], '#2f6f8f'];
    for (let k = 0; k < 3; k++) {
      const y = -56 - k * 52; rr(28, y, 28, 54, 4); fo(cols[k], 1.6);
      c.fillStyle = '#f5f0e1'; ell(36, y + 16, 4.5, 3.4); ell(48, y + 16, 4.5, 3.4); c.fillStyle = '#111'; circ(36, y + 16, 1.8); circ(48, y + 16, 1.8);
      c.fillStyle = '#111'; rr(34, y + 32, 16, 6, 3); c.fill(); c.fillStyle = '#e5c04a'; poly([42, y + 20, 38, y + 28, 46, y + 28]); c.fill();
    }
    rr(30, -2, 24, 4, 1); fo('#5c3a1e', 1);
    const fl = Math.sin(T * 2) * 3;
    c.save(); c.translate(0, 38);
    for (const m of [-1, 1]) {
      c.beginPath(); c.moveTo(42, -206); c.quadraticCurveTo(42 + m * 22, -226 + fl, 42 + m * 44, -222 + fl); c.lineTo(42 + m * 38, -212 + fl); c.lineTo(42 + m * 42, -206 + fl); c.lineTo(42 + m * 32, -200); c.lineTo(42 + m * 34, -192); c.quadraticCurveTo(42 + m * 16, -196, 42, -190); c.closePath();
      fo(lg('eWing', 0, -226, 0, -190, [[0, '#5a3a1e'], [1, '#2a1a0c']]), 1.4);
      c.fillStyle = '#f5f0e1'; poly([42 + m * 36, -214 + fl, 42 + m * 44, -222 + fl, 42 + m * 40, -208 + fl]); c.fill();
    }
    c.beginPath(); c.ellipse(42, -206, 9, 11, 0, 0, Math.PI * 2); fo('#f5f0e1', 1.4);
    c.fillStyle = '#111'; circ(46, -209, 1.6); c.fillStyle = '#e5a50a'; poly([48, -206, 56, -203, 49, -199]); c.fill();
    c.restore();
    torch(-84, -40);
    flag(-36, -110, team, '#5c3a1e', 34);
  },
  // Vikingové: dlouhý dům se štíty a dračími hlavami na štítech
  viking: team => {
    rr(-82, -20, 146, 20, 3); fo('#7c7f86', 1.6);
    c.fillStyle = 'rgba(40,40,40,.3)'; for (let x = -76; x < 60; x += 14) ell(x, -10, 5, 4);
    c.beginPath(); c.rect(-76, -98, 134, 80); fo(lg('vkW', 0, -98, 0, -18, [[0, '#9a6a3c'], [1, '#5c3a1e']]), 2);
    c.strokeStyle = 'rgba(40,22,10,.55)'; c.lineWidth = 1.2; for (let x = -68; x < 58; x += 9) ln(x, -98, x, -20);
    const roof = () => { c.beginPath(); c.moveTo(-94, -92); c.lineTo(-62, -186); c.quadraticCurveTo(-8, -170, 46, -186); c.lineTo(76, -92); c.quadraticCurveTo(-8, -104, -94, -92); c.closePath(); };
    roof(); fo(lg('vkR', 0, -186, 0, -92, [[0, '#6b4a2c'], [1, '#3c2818']]), 2.2);
    c.save(); roof(); c.clip(); c.strokeStyle = 'rgba(20,10,4,.45)'; c.lineWidth = 1.4;
    for (let y = -176; y < -92; y += 10) { c.beginPath(); c.moveTo(-96, y + 6); c.quadraticCurveTo(-8, y - 6, 80, y + 6); c.stroke(); }
    c.fillStyle = 'rgba(110,150,60,.35)'; ell(-30, -172, 30, 6); ell(20, -170, 20, 5); c.restore();
    // dračí hlavy na koncích hřebene
    for (const m of [-1, 1]) {
      const x = m < 0 ? -62 : 46;
      c.beginPath(); c.moveTo(x, -186); c.bezierCurveTo(x + m * 6, -204, x + m * 22, -206, x + m * 18, -222); c.lineTo(x + m * 28, -226); c.lineTo(x + m * 22, -214); c.bezierCurveTo(x + m * 28, -204, x + m * 14, -192, x + m * 8, -184); c.closePath();
      fo('#7a4a24', 1.6); c.fillStyle = '#e5c04a'; circ(x + m * 20, -220, 1.6);
    }
    // kulaté štíty podél stěny
    for (let i = 0; i < 5; i++) {
      const x = -60 + i * 26, y = -66;
      c.beginPath(); c.arc(x, y, 11, 0, Math.PI * 2); fo(i % 2 ? '#e5c04a' : team[0], 1.6);
      c.save(); c.beginPath(); c.arc(x, y, 11, 0, Math.PI * 2); c.clip(); c.fillStyle = i % 2 ? team[0] : '#f5f0e1';
      c.beginPath(); c.moveTo(x, y); c.arc(x, y, 11, 0, Math.PI / 2); c.fill(); c.beginPath(); c.moveTo(x, y); c.arc(x, y, 11, Math.PI, Math.PI * 1.5); c.fill(); c.restore();
      c.fillStyle = '#9ca3af'; circ(x, y, 3);
    }
    rr(-20, -52, 22, 52, [10, 10, 0, 0]); fo('#3c2412', 1.8); c.fillStyle = '#9ca3af'; circ(-4, -26, 1.8);
    // vyřezávaný sloup a krkavčí korouhev
    rr(56, -176, 8, 176, 2); fo('#7a4a24', 1.4);
    c.strokeStyle = 'rgba(40,20,8,.6)'; c.lineWidth = 1; for (let y = -170; y < 0; y += 12) { ln(56, y, 64, y + 6); ln(64, y, 56, y + 6); }
    torch(-86, -40);
    flag(60, -176, team, '#5c3a1e', 30);
  },
  // Samurajové: třípatrová pagoda a brána torii
  samurai: team => {
    rr(-80, -24, 148, 24, 3); fo(lg('pgSt', 0, -24, 0, 0, [[0, '#9aa0a8'], [1, '#5f646d']]), 1.6);
    c.strokeStyle = 'rgba(40,44,52,.4)'; c.lineWidth = 1; for (let x = -70; x < 64; x += 18) ln(x, -24, x + 4, 0); ln(-80, -12, 68, -12);
    const cx = -8;
    for (let i = 0; i < 3; i++) {
      const hw = 52 - i * 12, yb = -24 - i * 54, yt = yb - 36;
      c.beginPath(); c.rect(cx - hw, yt, hw * 2, 36); fo('#f2ead8', 1.8);
      c.fillStyle = '#b91c1c'; for (const x of [cx - hw, cx - hw / 3, cx + hw / 3 - 5, cx + hw - 5]) c.fillRect(x, yt, 5, 36);
      c.strokeStyle = '#3c2412'; c.lineWidth = 1; for (let x = cx - hw + 8; x < cx + hw - 6; x += 6) ln(x, yt + 8, x, yt + 30);
      ln(cx - hw, yt + 19, cx + hw, yt + 19);
      const ry = yt, rw = hw + 22;
      c.beginPath(); c.moveTo(cx - rw - 6, ry - 10); c.quadraticCurveTo(cx - rw + 6, ry + 4, cx - hw + 4, ry + 2); c.lineTo(cx + hw - 4, ry + 2);
      c.quadraticCurveTo(cx + rw - 6, ry + 4, cx + rw + 6, ry - 10); c.lineTo(cx + hw * 0.55, ry - 22); c.lineTo(cx - hw * 0.55, ry - 22); c.closePath();
      fo(lg('pgR' + i, 0, ry - 22, 0, ry + 4, [[0, '#3c4a5c'], [1, '#1f2833']]), 1.8);
      c.fillStyle = '#e5c04a'; circ(cx - rw - 6, ry - 11, 2.2); circ(cx + rw + 6, ry - 11, 2.2);
      c.fillStyle = 'rgba(255,255,255,.12)'; c.fillRect(cx - hw * 0.5, ry - 20, hw, 3);
    }
    c.strokeStyle = '#3c3f46'; c.lineWidth = 3; ln(cx, -208, cx, -232);
    c.fillStyle = '#e5c04a'; for (let k = 0; k < 4; k++) ell(cx, -212 - k * 5, 4 - k * 0.6, 1.6);
    // vstup a lucerny
    rr(cx - 12, -60, 24, 36, 2); fo('#3c2412', 1.4);
    for (const x of [-72, 60]) { c.fillStyle = '#e5c04a'; c.globalAlpha = 0.25 + Math.sin(T * 4 + x) * 0.08; circ(x, -50, 12); c.globalAlpha = 1; rr(x - 5, -58, 10, 14, 3); fo('#fde68a', 1.2); rr(x - 1.5, -44, 3, 20, 1); fo('#5f646d', 1); }
    // torii (na ní jsou police pro věže)
    for (const x of [36, 62]) { rr(x - 3.5, -170, 7, 170, 2); fo('#c0392b', 1.4); rr(x - 5, -8, 10, 8, 1); fo('#1f1f1f', 1); }
    c.beginPath(); c.moveTo(24, -176); c.quadraticCurveTo(49, -170, 74, -176); c.lineTo(76, -184); c.quadraticCurveTo(49, -178, 22, -184); c.closePath(); fo('#1f1f1f', 1.4);
    rr(26, -174, 46, 6, 1); fo('#c0392b', 1.2); rr(30, -152, 38, 6, 1); fo('#c0392b', 1.2);
    flag(cx, -232, team, '#3c3f46', 0.1);
    // nobori – svislý prapor
    c.strokeStyle = '#3c2412'; c.lineWidth = 2.4; ln(-88, 0, -88, -150);
    const w = Math.sin(T * 3) * 2; c.beginPath(); c.moveTo(-86, -146); c.lineTo(-70 + w, -146); c.lineTo(-70 + w, -80); c.lineTo(-86, -80); c.closePath(); fo(team[0], 1.2);
    c.fillStyle = '#f5f0e1'; circ(-78 + w / 2, -124, 5);
  },
  // Mongolové: jurty z plsti a tug – koňský ohon na kopí
  mongol: team => {
    const yurt = (x, s, key) => {
      c.save(); c.translate(x, 0); c.scale(s, s);
      rr(-50, -60, 100, 60, 6); fo(lg(key + 'w', 0, -60, 0, 0, [[0, '#f5efe0'], [1, '#cfc4a8']]), 2 / s);
      c.fillStyle = team[0]; c.fillRect(-50, -46, 100, 6); c.fillRect(-50, -20, 100, 6);
      c.fillStyle = '#e5c04a'; for (let k = -44; k < 48; k += 12) { poly([k, -43, k + 3, -40, k, -37, k - 3, -40]); c.fill(); }
      c.beginPath(); c.moveTo(-56, -58); c.quadraticCurveTo(-30, -100, -6, -108); c.lineTo(6, -108); c.quadraticCurveTo(30, -100, 56, -58); c.closePath();
      fo(lg(key + 'r', 0, -108, 0, -58, [[0, '#e8dfc8'], [1, '#bdb090']]), 2 / s);
      c.strokeStyle = team[1]; c.lineWidth = 2.4; for (const k of [-30, 0, 30]) ln(k * 0.2, -106, k * 1.6, -60);
      rr(-8, -114, 16, 7, 2); fo('#8b5e34', 1.4 / s);
      c.restore();
    };
    yurt(-64, 0.7, 'yB'); smoke(-64, -82, 3, '150,145,140');
    yurt(-14, 1.15, 'yA');
    rr(-28, -54, 28, 54, [4, 4, 0, 0]); fo('#b91c1c', 1.8);
    c.strokeStyle = '#e5c04a'; c.lineWidth = 1.4; c.strokeRect(-24, -50, 20, 46); ln(-14, -50, -14, -4);
    c.beginPath(); c.arc(-14, -32, 5, 0, Math.PI * 2); c.stroke();
    // tug – koňský ohon
    c.strokeStyle = '#5c3a1e'; c.lineWidth = 3.4; ln(50, 0, 50, -192);
    c.strokeStyle = '#c0c4cc'; c.lineWidth = 2.4; ln(50, -192, 50, -212); ln(44, -198, 44, -206); ln(56, -198, 56, -206); ln(44, -198, 56, -198);
    c.fillStyle = '#e5c04a'; circ(50, -190, 4);
    const sw = Math.sin(T * 2.4) * 4;
    for (let k = 0; k < 9; k++) { c.strokeStyle = k % 3 ? '#1a1a1a' : '#e8e2d6'; c.lineWidth = 2; c.beginPath(); c.moveTo(50 + (k - 4) * 1.6, -186); c.quadraticCurveTo(50 + (k - 4) * 3 + sw, -160, 50 + (k - 4) * 2.2 + sw * 1.6, -132); c.stroke(); }
    torch(-90, -36);
    flag(-14, -132, team, '#8b5e34', 6);
  },
  // Konkvistadoři: bílá misijní pevnost se zvonicí
  conq: team => {
    const fac = () => { c.beginPath(); c.moveTo(-80, 0); c.lineTo(-80, -112); c.lineTo(-64, -112); c.quadraticCurveTo(-60, -150, -36, -152); c.quadraticCurveTo(-30, -172, -22, -174); c.quadraticCurveTo(-14, -172, -8, -152); c.quadraticCurveTo(16, -150, 20, -112); c.lineTo(28, -112); c.lineTo(28, 0); c.closePath(); };
    fac(); fo(lg('cqW', -80, 0, 28, 0, [[0, '#fbf6ea'], [0.7, '#e7dcc4'], [1, '#bfb193']]), 2.2);
    c.save(); fac(); c.clip(); c.fillStyle = 'rgba(150,120,80,.25)'; for (const [x, y, r] of [[-70, -20, 14], [10, -40, 10], [-40, -96, 9], [-6, -10, 16]]) ell(x, y, r, r * 0.6);
    c.strokeStyle = 'rgba(120,96,60,.5)'; c.lineWidth = 1; ln(-60, -80, -54, -66); ln(-54, -66, -58, -56); ln(8, -100, 14, -86); c.restore();
    c.fillStyle = '#b8a07a'; c.fillRect(-82, -118, 112, 6);
    c.beginPath(); c.arc(-22, -128, 9, 0, Math.PI * 2); fo('#5c3a1e', 1.4); c.strokeStyle = '#e5c04a'; c.lineWidth = 1.4; c.beginPath(); c.arc(-22, -128, 6, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.moveTo(-40, 0); c.lineTo(-40, -50); c.arc(-22, -50, 18, Math.PI, 0); c.lineTo(-4, 0); c.closePath(); fo('#5c3a1e', 2);
    c.strokeStyle = '#3c2412'; c.lineWidth = 1.2; ln(-22, -68, -22, 0); for (const y of [-40, -20]) ln(-40, y, -4, y);
    for (const x of [-66, 8]) { c.beginPath(); c.moveTo(x, -76); c.lineTo(x, -92); c.arc(x + 6, -92, 6, Math.PI, 0); c.lineTo(x + 12, -76); c.closePath(); fo('#3c2412', 1.4); }
    // zvonice
    c.beginPath(); c.rect(30, -200, 34, 200); fo(lg('cqT', 30, 0, 64, 0, [[0, '#f5efe0'], [1, '#c9bb9a']]), 2);
    c.fillStyle = '#b8a07a'; c.fillRect(28, -204, 38, 6); c.fillRect(28, -150, 38, 5);
    c.beginPath(); c.moveTo(38, -152); c.lineTo(38, -180); c.arc(47, -180, 9, Math.PI, 0); c.lineTo(56, -152); c.closePath(); fo('#22150b', 1.4);
    const sw = Math.sin(T * 2) * 0.25; c.save(); c.translate(47, -186); c.rotate(sw);
    c.beginPath(); c.moveTo(-6, 14); c.quadraticCurveTo(-6, 0, 0, 0); c.quadraticCurveTo(6, 0, 6, 14); c.closePath(); fo('#c08a2e', 1.2); c.restore();
    c.beginPath(); c.arc(47, -204, 17, Math.PI, 0); fo('#c0533a', 1.6);
    c.strokeStyle = '#3c3f46'; c.lineWidth = 2.6; ln(47, -221, 47, -236); ln(41, -230, 53, -230);
    torch(-88, -40);
    flag(-22, -174, team, '#3c2412', 30);
  },
  // Piráti: loď vytažená na břeh, plachta s lebkou
  pirate: team => {
    c.fillStyle = '#c9b27a'; ell(-6, 0, 92, 8);
    const hull = () => { c.beginPath(); c.moveTo(-82, -118); c.lineTo(-30, -118); c.lineTo(-30, -74); c.lineTo(70, -74); c.quadraticCurveTo(66, -20, 36, 0); c.lineTo(-48, 0); c.quadraticCurveTo(-76, -10, -82, -60); c.closePath(); };
    hull(); fo(lg('prH', 0, -118, 0, 0, [[0, '#7a4a24'], [0.6, '#5c3a1e'], [1, '#3c2412']]), 2.4);
    c.save(); hull(); c.clip(); c.strokeStyle = 'rgba(20,10,4,.5)'; c.lineWidth = 1.2;
    for (let y = -110; y < 0; y += 9) { c.beginPath(); c.moveTo(-90, y); c.quadraticCurveTo(0, y + 4, 80, y - 4); c.stroke(); }
    c.fillStyle = team[0]; c.fillRect(-90, -78, 170, 5); c.restore();
    for (const x of [-60, -48]) { rr(x, -108, 9, 12, 2); fo('#fcd34d', 1.2); }
    for (const x of [-40, -12, 16, 44]) { rr(x, -56, 12, 10, 1); fo('#111', 1.2); rr(x + 8, -53, 12, 4, 2); fo('#2a2a2a', 1); }
    c.strokeStyle = '#3c2412'; c.lineWidth = 3; ln(70, -74, 92, -96);
    // stěžeň, plachta a koš
    rr(-10, -224, 7, 150, 2); fo('#6b4423', 1.4); rr(-26, -184, 40, 4, 2); fo('#6b4423', 1.2);
    const bl = Math.sin(T * 2) * 3;
    c.beginPath(); c.moveTo(-44, -182); c.lineTo(32, -182); c.quadraticCurveTo(38 + bl, -140, 30, -100); c.lineTo(22, -104); c.lineTo(14, -98); c.lineTo(-38, -100); c.quadraticCurveTo(-48 + bl, -140, -44, -182); c.closePath();
    fo(lg('prS', 0, -182, 0, -100, [[0, '#ece2c8'], [1, '#c9b994']]), 1.6);
    c.fillStyle = '#1a1a1a'; ell(-6, -150, 10, 9); c.fillRect(-11, -144, 10, 6);
    c.fillStyle = '#ece2c8'; ell(-10, -152, 3, 3.2); ell(-2, -152, 3, 3.2);
    c.strokeStyle = '#1a1a1a'; c.lineWidth = 4; c.lineCap = 'round'; ln(-20, -132, 8, -118); ln(8, -132, -20, -118);
    rr(-18, -208, 23, 10, 2); fo('#5c3a1e', 1.4);
    c.strokeStyle = 'rgba(60,40,20,.7)'; c.lineWidth = 1; ln(-6, -224, -82, -118); ln(-6, -224, 68, -74);
    // sudy a dělové koule
    for (const x of [-92, 52]) { rr(x, -22, 16, 22, 5); fo('#8b5e34', 1.4); c.strokeStyle = '#3c3f46'; c.lineWidth = 1.6; ln(x, -16, x + 16, -16); ln(x, -6, x + 16, -6); }
    c.fillStyle = '#2a2a2a'; circ(36, -4, 4); circ(44, -4, 4); circ(40, -10, 4);
    flag(-6, -224, team, '#6b4423', 1);
  },
  // Janičáři: osmanská stavba s kupolí a minaretem
  janissary: team => {
    const body = () => { c.beginPath(); c.rect(-80, -96, 108, 96); };
    body(); fo('#e8d6b0', 2);
    c.save(); body(); c.clip(); for (let y = -96; y < 0; y += 12) { c.fillStyle = (y / 12) % 2 ? '#b0503a' : '#e8d6b0'; c.fillRect(-80, y, 108, 6); } c.restore();
    for (const x of [-64, -12]) { c.beginPath(); c.moveTo(x, -40); c.lineTo(x, -66); c.quadraticCurveTo(x + 8, -80, x + 16, -66); c.lineTo(x + 16, -40); c.closePath(); fo('#1e3a5f', 1.4); }
    c.beginPath(); c.moveTo(-44, 0); c.lineTo(-44, -44); c.quadraticCurveTo(-26, -70, -8, -44); c.lineTo(-8, 0); c.closePath(); fo('#3c2412', 2);
    c.fillStyle = '#c9b48e'; c.fillRect(-84, -102, 116, 8);
    c.beginPath(); c.arc(-26, -102, 44, Math.PI, 0); fo(lg('jnD', 0, -146, 0, -102, [[0, '#9fb3c8'], [1, '#5f7389']]), 2);
    c.strokeStyle = 'rgba(40,60,80,.4)'; c.lineWidth = 1; for (const a of [0.3, 0.55, 0.8]) { c.beginPath(); c.ellipse(-26, -102, 44 * (1 - a), 44, 0, Math.PI, 0); c.stroke(); }
    for (const x of [-74, 22]) { c.beginPath(); c.arc(x, -102, 10, Math.PI, 0); fo('#7f93a8', 1.4); }
    c.strokeStyle = '#c9a227'; c.lineWidth = 2; ln(-26, -146, -26, -160);
    c.fillStyle = '#e5c04a'; c.beginPath(); c.arc(-26, -166, 6, 0, Math.PI * 2); c.fill(); c.fillStyle = '#9fb3c8'; circ(-23, -167, 5);
    // minaret
    c.beginPath(); c.rect(38, -196, 18, 196); fo(lg('jnM', 38, 0, 56, 0, [[0, '#f5efe0'], [1, '#c9bb9a']]), 1.8);
    for (const y of [-120, -176]) { rr(34, y, 26, 6, 2); fo('#c9b48e', 1.4); c.strokeStyle = '#8a7a5a'; c.lineWidth = 1; for (let x = 36; x < 60; x += 4) ln(x, y, x, y - 6); }
    poly([36, -196, 47, -228, 58, -196]); fo('#5f7389', 1.6);
    c.fillStyle = '#e5c04a'; c.beginPath(); c.arc(47, -234, 4.5, 0, Math.PI * 2); c.fill(); c.fillStyle = '#5f7389'; circ(49, -235, 3.6);
    torch(-90, -40);
    flag(-80, -102, team, '#3c2412', 40);
  },
  // Obrněná divize: plechový hangár s tankem uvnitř a věž s reflektorem
  tank: team => {
    const arch = () => { c.beginPath(); c.moveTo(-86, 0); c.ellipse(-22, 0, 64, 132, 0, Math.PI, 0); c.closePath(); };
    arch(); fo(lg('tkA', -86, 0, 42, 0, [[0, '#8a9270'], [0.5, '#6c7456'], [1, '#474d38']]), 2.2);
    c.save(); arch(); c.clip(); c.strokeStyle = 'rgba(30,34,24,.35)'; c.lineWidth = 1.2;
    for (let x = -84; x < 44; x += 6) ln(x, 0, x, -140);
    c.fillStyle = 'rgba(60,70,40,.5)'; for (const [x, y, r] of [[-60, -100, 16], [-10, -116, 14], [20, -60, 12], [-70, -40, 12]]) ell(x, y, r, r * 0.6);
    c.restore();
    c.beginPath(); c.rect(-64, -76, 84, 76); fo('#2a2d22', 2);
    c.fillStyle = '#3c4030'; rr(-56, -34, 66, 16, 6); c.fill(); rr(-46, -48, 40, 16, 4); c.fill(); c.fillRect(-10, -44, 34, 5);
    c.fillStyle = '#1a1c14'; for (let x = -52; x < 10; x += 10) circ(x, -14, 5);
    c.fillStyle = 'rgba(255,230,120,.8)'; circ(10, -28, 2.6);
    c.strokeStyle = '#9ca3a0'; c.lineWidth = 1; for (let y = -70; y < 0; y += 8) ln(-64, y, 20, y);
    c.fillStyle = '#e5c04a'; c.fillRect(-64, -80, 84, 4); c.fillStyle = '#111'; for (let x = -62; x < 20; x += 10) poly([x, -80, x + 5, -80, x + 1, -76, x - 4, -76]), c.fill();
    // hvězda / znak v barvě týmu
    c.fillStyle = team[2]; c.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 5 : 12; c.lineTo(-22 + Math.cos(a) * r, -102 + Math.sin(a) * r); } c.closePath(); c.fill();
    // ocelová věž
    c.strokeStyle = '#3a3d34'; c.lineWidth = 3; ln(40, 0, 44, -184); ln(64, 0, 60, -184);
    c.lineWidth = 1.6; for (let y = 0; y > -180; y -= 30) { ln(41, y, 63, y - 30); ln(63, y, 41, y - 30); ln(41, y, 63, y); }
    rr(34, -194, 36, 10, 2); fo('#4b5040', 1.4);
    const a = Math.sin(T * 0.8) * 0.5;
    c.save(); c.translate(52, -200); c.rotate(a);
    const op = c.globalCompositeOperation; c.globalCompositeOperation = 'lighter';
    c.fillStyle = 'rgba(255,240,180,.12)'; c.beginPath(); c.moveTo(6, 0); c.lineTo(160, -40); c.lineTo(160, 40); c.closePath(); c.fill();
    c.globalCompositeOperation = op; rr(-7, -6, 14, 12, 3); fo('#3a3d34', 1.2); c.fillStyle = '#fff7c2'; circ(6, 0, 4); c.restore();
    sandbags(-96, 34, 2);
    flag(-22, -132, team, '#4b5563', 30);
  },
  // Partyzáni: srub v lese s maskovací sítí a pozorovatelna na stromě
  partisan: team => {
    for (const [x, h, s] of [[-70, 200, 1], [-20, 170, 0.9], [-96, 150, 0.8]]) {
      rr(x - 3, -40, 6, 40, 1); fo('#4a3220', 1);
      for (let k = 0; k < 4; k++) { const w = (34 - k * 6) * s, y = -40 - k * (h - 40) / 4.4; poly([x - w, y, x, y - (h - 40) / 3, x + w, y]); fo(k % 2 ? '#1f4d2e' : '#2a5e38', 1.4); }
    }
    const cab = () => { c.beginPath(); c.rect(-76, -62, 96, 62); };
    cab(); fo('#6b4a2c', 2);
    c.save(); cab(); c.clip(); for (let i = 0; i < 6; i++) { const y = -6 - i * 11; rr(-80, y - 5, 104, 10, 5); fo(i % 2 ? '#7a5530' : '#8b6238', 1); } c.restore();
    c.beginPath(); c.moveTo(-90, -58); c.lineTo(-28, -96); c.lineTo(34, -58); c.closePath(); fo('#4a5e2e', 1.8);
    c.strokeStyle = 'rgba(20,40,20,.6)'; c.lineWidth = 1; for (let x = -80; x < 30; x += 7) ln(x, -60, x + 10, -80);
    c.fillStyle = '#3e6b2e'; for (const [x, y] of [[-60, -70], [-30, -88], [0, -72], [16, -64], [-46, -62]]) ell(x, y, 9, 4);
    rr(-40, -44, 20, 44, 2); fo('#2a1a0e', 1.6);
    rr(-6, -46, 16, 12, 1); fo('#fcd34d', 1.2); c.strokeStyle = '#3c2412'; c.lineWidth = 1.4; ln(2, -46, 2, -34); ln(-6, -40, 10, -40);
    sandbags(-96, 40, 2);
    // strom s pozorovatelnou
    rr(44, -206, 9, 206, 3); fo(lg('psT', 44, 0, 53, 0, [[0, '#6b4a30'], [1, '#3c2818']]), 1.6);
    for (let k = 0; k < 3; k++) { const y = -200 + k * 22, w = 20 + k * 6; poly([48 - w, y + 20, 48, y - 14, 48 + w, y + 20]); fo(k % 2 ? '#1f4d2e' : '#2a5e38', 1.4); }
    rr(30, -132, 38, 6, 1); fo('#8b5e34', 1.4); c.strokeStyle = '#8b5e34'; c.lineWidth = 1.6; ln(32, -132, 32, -118); ln(66, -132, 66, -118);
    c.strokeStyle = '#5c3a1e'; c.lineWidth = 1.6; ln(36, 0, 36, -126); ln(42, 0, 42, -126); for (let y = -10; y > -126; y -= 12) ln(36, y, 42, y);
    smoke(-60, -64, 3, '140,140,130', 0.3);
    flag(60, -132, team, '#5c3a1e', 30);
  },
  // Výsadkáři: polní velitelství – stan, sušící se padák a rádiový stožár
  para: team => {
    const tent = () => { c.beginPath(); c.moveTo(-86, 0); c.lineTo(-62, -92); c.lineTo(10, -92); c.lineTo(34, 0); c.closePath(); };
    tent(); fo(lg('paT', 0, -92, 0, 0, [[0, '#8a9468'], [1, '#5a6242']]), 2);
    c.strokeStyle = 'rgba(40,46,28,.5)'; c.lineWidth = 1.2; ln(-26, -92, -26, 0); ln(-74, -46, 22, -46);
    c.beginPath(); c.moveTo(-40, 0); c.lineTo(-30, -70); c.lineTo(-22, -70); c.lineTo(-12, 0); c.closePath(); fo('#2a2d22', 1.4);
    c.beginPath(); c.moveTo(-30, -70); c.lineTo(-50, -10); c.lineTo(-40, 0); c.closePath(); fo('#7a8458', 1.2);
    c.fillStyle = '#f5f0e1'; c.fillRect(-72, -66, 24, 16); c.fillStyle = '#b91c1c'; c.fillRect(-63, -64, 6, 12); c.fillRect(-69, -61, 18, 6);
    // padák nad stanem
    const bl = Math.sin(T * 1.6) * 3;
    c.save(); c.translate(-26, -150 + bl);
    for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(0, 6); c.arc(0, 6, 56, Math.PI + i * Math.PI / 6, Math.PI + (i + 1) * Math.PI / 6); c.closePath(); fo(i % 2 ? '#f5f0e1' : team[0], 1.2); }
    c.strokeStyle = 'rgba(60,60,60,.6)'; c.lineWidth = 0.8; for (let i = 0; i <= 6; i++) { const a = Math.PI + i * Math.PI / 6; ln(Math.cos(a) * 56, 6 + Math.sin(a) * 56 + 50, 0, 58 - bl); }
    c.restore();
    // stožár s anténou
    c.strokeStyle = '#4b5040'; c.lineWidth = 2.4; ln(42, 0, 52, -206); ln(62, 0, 52, -206);
    c.lineWidth = 1.2; for (let y = 0; y > -190; y -= 24) { const k = -y / 206; ln(42 + 10 * k, y, 62 - 10 * k, y - 24); ln(62 - 10 * k, y, 42 + 10 * k, y - 24); }
    c.fillStyle = Math.sin(T * 5) > 0 ? '#ef4444' : '#7f1d1d'; circ(52, -210, 3);
    c.strokeStyle = 'rgba(56,225,255,.5)'; c.lineWidth = 1.4; for (let k = 1; k <= 2; k++) { const r = ((T * 30 + k * 12) % 30) + 6; c.globalAlpha = 1 - r / 36; c.beginPath(); c.arc(52, -210, r, -0.9, 0.9); c.stroke(); c.globalAlpha = 1; }
    for (const x of [-96, 16]) { rr(x, -18, 22, 18, 2); fo('#5a6242', 1.4); c.fillStyle = '#e5c04a'; c.fillRect(x + 3, -12, 16, 2); }
    sandbags(30, 44, 2);
    flag(-62, -92, team, '#4b5040', 30);
  },
  // Mimozemšťané: živý úl s pulzujícími zárodky a rohem
  alien: team => {
    const hive = () => { c.beginPath(); c.moveTo(-88, 0); c.bezierCurveTo(-96, -60, -70, -110, -50, -128); c.bezierCurveTo(-36, -170, 0, -180, 12, -150); c.bezierCurveTo(40, -140, 56, -90, 58, 0); c.closePath(); };
    hive(); fo(lg('alH', 0, -180, 0, 0, [[0, '#6d4a8c'], [0.5, '#4a2e66'], [1, '#2a1a3c']]), 2.4);
    c.save(); hive(); c.clip(); c.strokeStyle = 'rgba(150,110,190,.35)'; c.lineWidth = 3;
    for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(-90 + i * 26, 0); c.bezierCurveTo(-80 + i * 22, -60, -50 + i * 14, -120, -20 + i * 6, -176); c.stroke(); }
    c.restore();
    const pulse = 0.6 + Math.sin(T * 3) * 0.3;
    for (const [x, y, r] of [[-62, -70, 9], [-30, -128, 7], [24, -96, 8], [-8, -150, 6], [36, -40, 7]]) {
      c.globalAlpha = pulse; glowDot(x, y, r * 2.6, '#84ff6a'); c.globalAlpha = 1;
      c.beginPath(); c.ellipse(x, y, r, r * 1.3, 0, 0, Math.PI * 2); fo('#a3e635', 1.4); c.fillStyle = 'rgba(20,60,10,.5)'; ell(x, y + 2, r * 0.4, r * 0.6);
    }
    // tlama
    c.beginPath(); c.moveTo(-46, 0); c.bezierCurveTo(-46, -50, -24, -72, -12, -72); c.bezierCurveTo(0, -72, 20, -50, 20, 0); c.closePath(); fo(rg('alM', -12, -20, 4, 70, [[0, '#84ff6a'], [0.3, '#2e6a1a'], [1, '#0c140a']]), 2);
    c.fillStyle = '#e8e2f0';
    for (let k = 0; k < 6; k++) { const a = Math.PI + (k + 0.5) * Math.PI / 6, x = -12 + Math.cos(a) * 30, y = -34 + Math.sin(a) * 36; poly([x - 3.5, y, x + 3.5, y, -12 + Math.cos(a) * 20, -34 + Math.sin(a) * 26]); c.fill(); }
    // chapadla
    c.strokeStyle = '#4a2e66'; c.lineWidth = 5; c.lineCap = 'round';
    for (const [x, d] of [[-80, -1], [50, 1]]) { const w = Math.sin(T * 2 + x) * 6; c.beginPath(); c.moveTo(x, -6); c.quadraticCurveTo(x + d * 18, -10 + w, x + d * 26, -2); c.stroke(); }
    // roh – na něm jsou věže
    c.beginPath(); c.moveTo(34, 0); c.bezierCurveTo(30, -90, 42, -160, 62, -212); c.bezierCurveTo(60, -160, 62, -90, 66, 0); c.closePath();
    fo(lg('alR', 34, 0, 66, 0, [[0, '#3c2452'], [1, '#1e1030']]), 1.8);
    c.strokeStyle = 'rgba(132,255,106,.6)'; c.lineWidth = 1.4; for (let y = -30; y > -190; y -= 26) ln(36 + (-y) * 0.06, y, 64, y - 6);
    c.globalAlpha = pulse; glowDot(62, -212, 14, team[2]); c.globalAlpha = 1;
    flag(-20, -176, team, '#3c2452', 26);
  },
  // Roboti: továrna s ozubenými koly, komíny a radarem
  robot: team => {
    const fac = () => { c.beginPath(); c.moveTo(-82, 0); c.lineTo(-82, -120); for (let i = 0; i < 4; i++) { c.lineTo(-82 + i * 28 + 20, -146); c.lineTo(-82 + i * 28 + 28, -120); } c.lineTo(32, -120); c.lineTo(32, 0); c.closePath(); };
    fac(); fo(lg('rbF', -82, 0, 32, 0, [[0, '#a8b0bc'], [0.5, '#7c8594'], [1, '#4a5160']]), 2.2);
    c.save(); fac(); c.clip(); c.strokeStyle = 'rgba(40,46,56,.4)'; c.lineWidth = 1;
    for (let x = -82; x < 32; x += 28) ln(x, 0, x, -150); ln(-82, -60, 32, -60);
    c.fillStyle = 'rgba(30,34,40,.6)'; for (let x = -78; x < 32; x += 28) for (let y = -116; y < 0; y += 28) { circ(x, y, 1.4); circ(x + 22, y, 1.4); }
    c.fillStyle = '#7dd3fc'; for (let i = 0; i < 4; i++) { poly([-82 + i * 28 + 21, -144, -82 + i * 28 + 27, -122, -82 + i * 28 + 21, -122]); c.fill(); }
    c.restore();
    for (const [x, h] of [[-72, 186], [-52, 168]]) { rr(x, -h, 12, h - 120, 1); fo('#5f6672', 1.4); c.fillStyle = '#ef4444'; c.fillRect(x, -h + 8, 12, 4); smoke(x + 6, -h - 4, 3, '90,95,100', 0.5); }
    gear(-34, -92, 16, 9, T * 0.8, '#c0c7d2'); gear(-8, -78, 10, 7, -T * 1.3, '#9aa3b0');
    rr(-48, -52, 46, 52, 2); fo('#2b3040', 2);
    c.save(); rr(-48, -52, 46, 8, 0); c.clip(); c.fillStyle = '#e5c04a'; c.fillRect(-48, -52, 46, 8); c.fillStyle = '#111';
    for (let x = -56 + (T * 20) % 12; x < 0; x += 12) poly([x, -44, x + 6, -44, x + 14, -52, x + 8, -52]), c.fill(); c.restore();
    c.globalAlpha = 0.7 + Math.sin(T * 6) * 0.2; glowLine(-44, -10, -6, -10, team[0], 1.6); c.globalAlpha = 1;
    // oko-kamera
    const ex = Math.sin(T * 1.2) * 4;
    c.beginPath(); c.arc(14, -96, 9, 0, Math.PI * 2); fo('#1f2430', 1.4); glowDot(14 + ex, -96, 9, '#ef4444'); c.fillStyle = '#fecaca'; circ(14 + ex, -96, 2);
    // stožár s radarem
    rr(42, -190, 14, 190, 2); fo(lg('rbM', 42, 0, 56, 0, [[0, '#8a93a0'], [1, '#4a5160']]), 1.6);
    c.strokeStyle = 'rgba(30,34,40,.5)'; c.lineWidth = 1; for (let y = -180; y < 0; y += 20) ln(42, y, 56, y);
    c.save(); c.translate(49, -198); c.scale(Math.cos(T * 1.5), 1);
    c.beginPath(); c.ellipse(0, 0, 18, 7, 0, Math.PI, 0); c.closePath(); fo('#c0c7d2', 1.4); c.restore();
    c.fillStyle = Math.sin(T * 7) > 0 ? team[2] : team[1]; circ(49, -208, 2.6);
    flag(-82, -120, team, '#5f6672', 40);
  },
  // Vesmírní mariňáci: přistávací modul na plošině a komunikační věž
  marine: team => {
    rr(-90, -14, 150, 14, 3); fo(lg('mrP', 0, -14, 0, 0, [[0, '#5f6878'], [1, '#2b3040']]), 1.6);
    c.fillStyle = '#e5c04a'; for (let x = -86; x < 56; x += 16) poly([x, -14, x + 8, -14, x + 4, -8, x - 4, -8]), c.fill();
    const pod = () => { c.beginPath(); c.moveTo(-70, -14); c.lineTo(-64, -128); c.quadraticCurveTo(-56, -196, -18, -206); c.quadraticCurveTo(20, -196, 28, -128); c.lineTo(34, -14); c.closePath(); };
    pod(); fo(lg('mrD', -70, 0, 34, 0, [[0, '#c9d0da'], [0.45, '#8b95a5'], [1, '#3f4756']]), 2.4);
    c.save(); pod(); c.clip();
    c.fillStyle = team[0]; c.fillRect(-80, -150, 120, 10); c.fillStyle = team[1]; c.fillRect(-80, -140, 120, 3);
    c.fillStyle = 'rgba(30,20,10,.45)'; ell(-18, -20, 60, 18); ell(-50, -60, 10, 20); ell(20, -50, 8, 18);
    c.strokeStyle = 'rgba(30,36,46,.5)'; c.lineWidth = 1.2; ln(-80, -120, 40, -120); ln(-18, -206, -18, -150);
    c.restore();
    for (const m of [-1, 1]) { const x = m < 0 ? -66 : 30; poly([x, -110, x + m * 22, -40, x + m * 22, -14, x, -40]); fo('#5f6878', 1.6); }
    c.beginPath(); c.arc(-18, -170, 10, 0, Math.PI * 2); fo('#11151f', 1.6); glowDot(-18, -170, 8, '#38e1ff');
    // otevřený průlez s rampou
    rr(-40, -96, 44, 82, 4); fo('#11151f', 2);
    c.globalAlpha = 0.5 + Math.sin(T * 4) * 0.15; glowDot(-18, -50, 30, '#38e1ff'); c.globalAlpha = 1;
    poly([-40, -14, 4, -14, 14, 0, -50, 0]); fo('#5f6878', 1.4);
    c.strokeStyle = '#e5c04a'; c.lineWidth = 1.4; for (let x = -42; x < 10; x += 8) ln(x, -12, x - 2, -2);
    // trysky
    const op = c.globalCompositeOperation; c.globalCompositeOperation = 'lighter';
    c.fillStyle = `rgba(255,140,40,${0.15 + Math.sin(T * 20) * 0.05})`; ell(-58, -16, 10, 5); ell(22, -16, 10, 5); c.globalCompositeOperation = op;
    // komunikační věž
    rr(44, -196, 12, 182, 2); fo(lg('mrT', 44, 0, 56, 0, [[0, '#8b95a5'], [1, '#3f4756']]), 1.6);
    for (let y = -180; y < -14; y += 30) glowLine(46, y, 54, y, '#38e1ff', 1);
    c.strokeStyle = '#9aa3b2'; c.lineWidth = 2; ln(50, -196, 50, -224); ln(42, -212, 58, -212);
    c.fillStyle = Math.sin(T * 4) > 0 ? '#ef4444' : '#7f1d1d'; circ(50, -226, 2.6);
    flag(-18, -206, team, '#9aa3b2', 20);
  },
};

const TUR = [
  // doba kamenná
  (i, a) => {
    rr(-12, -2, 24, 10, 2); fo('#7a5230', 1.3);
    if (i === 1) { limb([-2, -2, -2, -12], '#8b5a2b', 3); limb([-2, -12, -7, -20], '#8b5a2b', 2.6); limb([-2, -12, 3, -20], '#8b5a2b', 2.6); c.strokeStyle = '#ddd'; c.lineWidth = 0.8; ln(-7, -20, 3, -20); }
    else if (i === 2) {
      limb([-6, -2, 8, -10], '#8b5a2b', 3); c.beginPath(); c.ellipse(2, -5, 10, 5, 0, 0, Math.PI); fo('#a0703c', 1.3);
      c.beginPath(); c.ellipse(2, -10, 6, 7.5, 0, 0, Math.PI * 2); fo('#b98f4e', 1.2);
      c.strokeStyle = 'rgba(90,60,20,.7)'; c.lineWidth = 1; for (const y of [-14, -10, -6]) { c.beginPath(); c.ellipse(2, y, 5.2, 1.4, 0, 0, Math.PI); c.stroke(); }
      c.fillStyle = '#2a1a0a'; circ(2, -8, 1.4);
      c.fillStyle = '#facc15'; for (let k = 0; k < 3; k++) { const a = T * 6 + k * 2.1; circ(2 + Math.cos(a) * 9, -12 + Math.sin(a * 1.3) * 5, 1.1); }
    }
    else { limb([-8, -2, 10, -14], '#8b5a2b', 3); c.beginPath(); c.arc(11, -16, 4.5, 0, Math.PI * 2); fo('#8a8a8a', 1.2); }
  },
  // středověk
  (i) => {
    if (i === 0) { rr(-12, -4, 24, 10, 2); fo('#7a4a24', 1.3); limb([-6, -4, 10, -18], '#8b5a2b', 3); c.beginPath(); c.arc(11, -20, 5, 0, Math.PI * 2); fo('#6b6b6b', 1.2); c.beginPath(); c.arc(-8, 6, 3, 0, Math.PI * 2); fo('#5c3a1e', 1); }
    else if (i === 1) { rr(-10, -4, 20, 10, 2); fo('#7a4a24', 1.3); c.beginPath(); c.moveTo(4, -14); c.quadraticCurveTo(14, -4, 4, 6); c.strokeStyle = OL; c.lineWidth = 3.6; c.stroke(); c.strokeStyle = '#8b5a2b'; c.lineWidth = 2; c.stroke(); limb([-8, -4, 16, -4], '#6b4423', 1.6); c.fillStyle = '#f97316'; circ(17, -4, 2.4); }
    else { c.beginPath(); c.moveTo(-12, -10); c.lineTo(12, -10); c.lineTo(9, 6); c.lineTo(-9, 6); c.closePath(); fo('#3c3f46', 1.4); c.fillStyle = '#2b1a0a'; ell(0, -10, 11, 3); const op = c.globalCompositeOperation; c.globalCompositeOperation = 'lighter'; c.fillStyle = 'rgba(255,140,30,.5)'; ell(0, 8, 10, 4); c.globalCompositeOperation = op; }
  },
  // renesance
  (i) => {
    rr(-12, 0, 22, 8, 2); fo('#6b4423', 1.3);
    const bars = i === 1 ? [-4, 2] : [0];
    for (const y of bars) { rr(-8, y - 5 - (i === 2 ? 2 : 0), i === 2 ? 30 : 26, i === 2 ? 10 : 6, 3); fo(lg('tb' + i, 0, y - 6, 0, y + 4, [[0, '#575d66'], [1, '#1f2227']]), 1.3); }
    c.beginPath(); c.arc(-6, 8, 4, 0, Math.PI * 2); fo('#5c3a1e', 1.2);
  },
  // moderní
  (i) => {
    rr(-12, -2, 22, 10, 2); fo('#4b5530', 1.4);
    if (i === 0) { rr(-6, -8, 14, 7, 1.5); fo('#2b2b2b', 1.2); rr(8, -6, 16, 3, 1); fo('#1a1a1a', 1); rr(-4, -16, 4, 10, 1); fo('#55623a', 1); }
    else if (i === 1) { rr(-8, -14, 22, 12, 2); fo('#55623a', 1.4); c.fillStyle = '#1a1a1a'; for (let r = 0; r < 2; r++) for (let k = 0; k < 3; k++) circ(14, -11 + r * 5 + 0, 1.6); c.fillStyle = '#ef4444'; circ(16, -8, 1); }
    else { rr(-8, -10, 14, 9, 2); fo('#55623a', 1.4); rr(4, -7, 26, 4, 1.5); fo('#384126', 1.2); rr(28, -8, 5, 6, 1); fo('#384126', 1); }
  },
  // budoucnost
  (i) => {
    c.beginPath(); c.moveTo(-12, 8); c.lineTo(-8, -8); c.lineTo(8, -8); c.lineTo(12, 8); c.closePath();
    fo(lg('tf', 0, -8, 0, 8, [[0, '#9aa3b5'], [1, '#3a4152']]), 1.4);
    if (i === 0) { rr(4, -5, 20, 4, 1.5); fo('#d1d5db', 1.1); glowDot(25, -3, 5, '#38e1ff'); }
    else if (i === 1) { rr(2, -8, 22, 9, 3); fo('#4b5368', 1.3); glowDot(25, -3.5, 7, '#b388ff'); }
    else { c.beginPath(); c.arc(4, -10, 8, 0, Math.PI * 2); fo('#2b3040', 1.4); glowDot(4, -10, 12 + Math.sin(T * 6) * 2, '#ff4fd8'); rr(8, -6, 20, 4, 1.5); fo('#9aa3b5', 1.1); }
  },
];
function drawTurret(a, i, x, y) { c.save(); c.translate(x, y); TUR[a](i, a); c.restore(); }

// =====================================================================
//  PROJEKTILY
// =====================================================================
function drawProj(pr) {
  const x = MX(pr.x), y = pr.y;
  let dx = mirror ? -pr.dx : pr.dx, dy = pr.dy;
  const L = Math.hypot(dx, dy) || 1; dx /= L; dy /= L;
  c.lineCap = 'round';
  switch (pr.p) {
    case 'stone': c.beginPath(); c.arc(x, y, 3.2, 0, Math.PI * 2); fo('#8a8a8a', 1); break;
    case 'rock': c.beginPath(); c.arc(x, y, 6, 0, Math.PI * 2); fo('#77736d', 1.3); c.fillStyle = '#a3a09a'; circ(x - 2, y - 2, 2); break;
    case 'egg':                                       // vosí hnízdo s rojem vos
      c.beginPath(); c.ellipse(x, y, 5, 6.2, 0, 0, Math.PI * 2); fo('#b98f4e', 1.1);
      c.strokeStyle = 'rgba(90,60,20,.7)'; c.lineWidth = 0.8; for (const k of [-3, 0, 3]) { c.beginPath(); c.ellipse(x, y + k, 4.4, 1.1, 0, 0, Math.PI); c.stroke(); }
      c.fillStyle = '#facc15'; for (let k = 0; k < 4; k++) { const a = T * 9 + k * 1.6; circ(x + Math.cos(a) * 8, y + Math.sin(a) * 6, 0.9); }
      break;
    case 'oil': c.beginPath(); c.arc(x, y, 6, 0, Math.PI * 2); fo('#2b1a0a', 1.2); glowDot(x, y, 8, '#f97316'); break;
    case 'arrow': case 'fire':
      c.strokeStyle = OL; c.lineWidth = 3; ln(x - dx * 16, y - dy * 16, x, y);
      c.strokeStyle = '#a0703c'; c.lineWidth = 1.6; ln(x - dx * 16, y - dy * 16, x, y);
      c.fillStyle = '#e5e7eb'; c.beginPath(); c.moveTo(x - dx * 16, y - dy * 16); c.lineTo(x - dx * 20 - dy * 3, y - dy * 20 + dx * 3); c.lineTo(x - dx * 12, y - dy * 12); c.lineTo(x - dx * 20 + dy * 3, y - dy * 20 - dx * 3); c.fill();
      c.fillStyle = '#9aa1ab'; c.beginPath(); c.moveTo(x + dx * 4, y + dy * 4); c.lineTo(x - dy * 2.5, y + dx * 2.5); c.lineTo(x + dy * 2.5, y - dx * 2.5); c.fill();
      if (pr.p === 'fire') glowDot(x, y, 9, '#f97316');
      break;
    case 'bullet': glowLine(x - dx * 12, y - dy * 12, x, y, '#facc15', 1.6); break;
    case 'shell': c.beginPath(); c.arc(x, y, 4.8, 0, Math.PI * 2); fo('#1f1f1f', 1); c.fillStyle = '#6b7280'; circ(x - 1.5, y - 1.5, 1.5); break;
    case 'rocket':
      c.save(); c.translate(x, y); c.rotate(Math.atan2(dy, dx));
      rr(-14, -2.6, 16, 5.2, 2.6); fo('#d1d5db', 1); c.fillStyle = '#ef4444'; poly([2, -2.6, 6, 0, 2, 2.6]); c.fill();
      c.fillStyle = '#6b7280'; poly([-14, -2.6, -18, -6, -12, -2.6]); c.fill(); poly([-14, 2.6, -18, 6, -12, 2.6]); c.fill();
      c.restore(); glowDot(x - dx * 18, y - dy * 18, 8, '#f97316'); break;
    case 'laser': glowLine(x - dx * 24, y - dy * 24, x, y, '#38e1ff', 2.2); break;
    case 'rlaser': glowLine(x - dx * 24, y - dy * 24, x, y, '#f43f5e', 2.2); break;
    case 'plasma': glowDot(x, y, 10, '#4ade80'); glowDot(x, y, 4, '#ffffff'); break;
    case 'axe': {                                       // rotující vrhací sekera
      c.save(); c.translate(x, y); c.rotate(T * 18);
      rr(-6, -1, 12, 2, 1); fo('#6b4423', 0.8);
      c.beginPath(); c.moveTo(2, -1); c.lineTo(4, -6.5); c.quadraticCurveTo(8, -4, 7.5, 1.5); c.closePath(); fo('#c4cad3', 0.9);
      c.restore(); break;
    }
    case 'ion': glowDot(x, y, 14, '#b388ff'); glowDot(x, y, 6, '#ffffff'); break;
    case 'meteor':
      for (let k = 5; k >= 1; k--) { c.globalAlpha = 0.16 * (6 - k); glowDot(x - dx * k * 10, y - dy * k * 10, 13 - k, '#f97316'); }
      c.globalAlpha = 1;
      c.beginPath(); c.arc(x, y, 9, 0, Math.PI * 2); fo(rg('met', 0, 0, 0, 9, [[0, '#b45309'], [1, '#451a03']]), 1.3);
      c.fillStyle = '#7c2d12'; circ(x - 3, y + 2, 2.2); circ(x + 3, y - 2, 1.6);
      glowDot(x + dx * 3, y + dy * 3, 10, '#fb923c'); break;
    case 'bomb':
      c.save(); c.translate(x, y); c.rotate(Math.atan2(dy, dx));
      c.beginPath(); c.ellipse(0, 0, 9, 4.5, 0, 0, Math.PI * 2); fo('#3f4a2a', 1.2);
      c.fillStyle = '#2a2a2a'; poly([-8, 0, -13, -5, -12, 0, -13, 5]); c.fill(); c.restore(); break;
    case 'beam': {
      const top = Math.max(0, y - 360);
      glowLine(x, top, x, y, '#38e1ff', 5);
      glowDot(x, y, 18, '#38e1ff'); break;
    }
  }
}

// =====================================================================
//  EFEKTY
// =====================================================================
function addFx(e) {
  const [x, y, k] = e;
  sfx(k, x);
  const part =(n, col, sp, r, l, g = 320) => { n = Math.round(n * GFX_PART[GFXL]); for (let i = 0; i < n; i++) fx.push({ x, y, vx: rnd(-sp, sp), vy: rnd(-sp * 1.4, sp * 0.2), l, ml: l, col, r, g }); };
  const smoke = (n, r, l) => { n = Math.max(1, Math.round(n * GFX_PART[GFXL])); for (let i = 0; i < n; i++) fx.push({ smoke: 1, x: x + rnd(-10, 10), y: y + rnd(-8, 4), vx: rnd(-15, 15), vy: rnd(-40, -15), r: r * rnd(0.6, 1.2), l, ml: l }); };
  switch (k) {
    case 'hit':
      part(5, '#ffeaa0', 90, 1.6, 0.25, 200); part(3, '#e11d48', 60, 2, 0.4);
      if (BRUT() && !BF.includes(x)) bloodBurst(x, y, 9, 150, true);   // zásah bez zabití – skoro bez kaluží
      break;
    case 'die': {
      if (BRUT() && !SET.egg && !bloodCode && !bloodCodeUsed && V && V.time > 90 && Math.random() < 0.05) bloodCode = { x: Math.max(160, Math.min(W - 160, MX(x))), l: 14, ml: 14 };
      if (SET.chicken) { part(10, '#f8fafc', 110, 2.2, 1, 120); sfx('cluck', x); }
      seasonDie(x);
      const cp = { corpse: 1, x, side: e[3], a: e[4], ty: e[5], m: e[6] | 0, l: e[5] === 5 ? 3 : 1.3, ml: e[5] === 5 ? 3 : 1.3 };
      if (e[5] === 5) {                                   // padlý boss: série výbuchů a velký nápis
        if (e[3] !== mySide) achBoss(e[4]);
        shake = 2; vib([150, 60, 250]);
        for (let k = 0; k < 6; k++) fx.push({ fire: 1, x: x + rnd(-60, 60), y: GY - rnd(10, BOSSES[e[4]].y + 30), r: rnd(30, 50), l: 0.5 + k * 0.12, ml: 0.5 + k * 0.12 });
        fx.push({ ring: 1, x, y: GY - 40, l: 0.8, ml: 0.8, r: 220, col: '#fbbf24' });
        fx.push({ txt: (e[3] === mySide ? '💀 ' : '🏆 ') + BOSSES[e[4]].n.toUpperCase() + ' PADL!', x, y: GY - 170, vy: -20, l: 3, ml: 3 });
        sfx('boom', x);
      }
      fx.push(cp);
      part(5, '#b91c1c', 80, 2.2, 0.5); smoke(2, 8, 0.6);
      if (BRUT()) gore(cp);
      break;
    }
    case 'boom':
      if (EXTREME() && Math.random() < 0.25) screenSplat(MX(x), y, true);
      fx.push({ fire: 1, x, y, r: 30, l: 0.38, ml: 0.38 });
      smoke(6, 14, 1.1); part(10, '#fbbf24', 170, 2.4, 0.5); part(6, '#57534e', 120, 2.8, 0.7);
      fx.push({ ring: 1, x, y, l: 0.3, ml: 0.3, r: 40 }); break;
    case 'zap': fx.push({ fire: 1, x, y, r: 26, l: 0.3, ml: 0.3, col: '#38e1ff' }); part(10, '#a5f3fc', 140, 2, 0.4); break;
    case 'muz': fx.push({ flash: 1, x, y, l: 0.09, ml: 0.09, r: 9 }); fx.push({ smoke: 1, x, y, vx: rnd(-10, 10), vy: -20, r: 5, l: 0.5, ml: 0.5 }); break;
    case 'up': fx.push({ ring: 1, x, y, l: 0.6, ml: 0.6, r: 70, col: '#4ade80' }); part(12, '#86efac', 120, 2, 0.6, -60); break;
    case 'slam':
      fx.push({ ring: 1, x, y, l: 0.45, ml: 0.45, r: 130, col: '#fbbf24' }); fx.push({ fire: 1, x, y, r: 40, l: 0.35, ml: 0.35 });
      smoke(8, 16, 1); part(16, '#a16207', 200, 3, 0.7); vib(e[3] === mySide ? 50 : 0); break;
    case 'roar': shake = 1.5; vib([200, 80, 200]); break;
    case 'evt': evtBanner = { t: (e[3] === 'wave' ? '♾ VLNA ' + e[4] + (e[4] % 10 === 0 || (e[4] >= 25 && e[4] % 5 === 0) ? ' – BOSS!' : '') : e[3] === 'meteors' ? SKYFIRE[e[4] | 0] : e[3] === 'boss' ? '👹 BOSS: ' + BOSSES[e[4] | 0].n.toUpperCase() + '!' : EVENTS[e[3]]) || '', l: e[3] === 'boss' ? 4 : 3 }; if (e[3] === 'quake') { shake = 1.2; vib([80, 40, 120]); } sfx('evt'); break;
    case 'chest': if (SEASON && e[3] === mySide) achId(SEASON === 'xmas' ? 'gift' : 'candy');
      fx.push({ txt: '+' + e[4].toLocaleString('cs') + ' zlata', x, y: y - 20, vy: -30, l: 1.6, ml: 1.6 }); part(18, '#facc15', 140, 2.2, 0.8); sfx('buy'); break;
    case 'rhit': bloodBurst(x, y, 16, 220, true); if (Math.random() < 0.2) addPool(x, rnd(4, 8)); shake = Math.max(shake, 0.25); break;
    case 'cry': {
      const ag = e[4] >> 2;                               // e[4] = věk × 4 + národ
      if (e[5] === 2 && ag <= 1) { sfx(ag === 0 ? MOUNT_OF[e[4] & 3] : 'horse', x); break; }   // jízdní zvíře se ozve samo
      if (e[5] === 5) { if (ag <= 1) sfx(ag === 0 ? 'tiger' : 'dragon', x); break; }
      if (e[5] >= 3 || Math.random() < 0.45) cry(e[4], x, e[3], e[5] >= 3);
      break;
    }
    case 'bast': if (e[3] === mySide) achId('bast');
      fx.push({ ring: 1, x, y, l: 0.9, ml: 0.9, r: 160, col: '#4ade80' }); fx.push({ txt: '🛡 POSLEDNÍ BAŠTA!', x, y: y - 40, vy: -25, l: 2.2, ml: 2.2 }); sfx('evo'); break;
    case 'gcry': if (e[3] === mySide) { achId('gcry'); fx.push({ txt: '📯 VÁLEČNÝ POKŘIK!', x, y: y - 20, vy: -25, l: 2, ml: 2 }); const p = V.pl[e[3]]; cry(p.age * 4 + ((p.af && p.af[p.age]) | 0), x, e[3], true); } break;
    case 'lava': achId('lava'); fx.push({ fire: 1, x, y, r: 55, l: 0.7, ml: 0.7 }); part(24, '#ff6a14', 260, 3, 0.9, -200); smoke(6, 14, 1.2); shake = Math.max(shake, 0.6); sfx('boom', x); break;
    case 'bsk': {
      const K = BOSS_SK[e[4]]; if (!K) break;
      fx.push({ txt: K.ic + ' ' + K.n.toUpperCase() + '!', x, y, vy: -22, l: 1.8, ml: 1.8 });
      if (e[4] === 0) { fx.push({ ring: 1, x, y: GY - 40, l: 0.7, ml: 0.7, r: 230, col: '#fbbf24' }); sfx('tiger', x); shake = Math.max(shake, 0.5); }
      else if (e[4] === 1) { sfx('dragon', x); for (let i = 0; i < 6; i++) fx.push({ fire: 1, x: x + (e[3] ? -1 : 1) * (40 + i * 40), y: GY - 40 - i * 4, r: 40, l: 0.8, ml: 0.8 }); }
      else if (e[4] === 4) { sfx('zap', x); fx.push({ ring: 1, x, y: GY - 60, l: 0.6, ml: 0.6, r: 90, col: '#38bdf8' }); }
      else sfx('evt', x);
      break;
    }
    case 'burn': for (let i = 0; i < 5; i++) fx.push({ fire: 1, x: x + rnd(-30, 30), y: y + i * 30, r: 30, l: 2.5, ml: 2.5 }); break;
    case 'sbon': { const B = SBON[e[4]]; if (B) { fx.push({ txt: B.ic + ' ' + B.n.toUpperCase(), x, y, vy: -25, l: 2, ml: 2 }); sfx('up', x); } break; }
    case 'abil': {
      const A = ABIL[e[4]]; if (!A) break;
      fx.push({ ring: 1, x, y: GY - 40, l: 0.8, ml: 0.8, r: 200, col: `rgb(${A.col})` });
      fx.push({ txt: A.ic + ' ' + A.n.toUpperCase(), x, y: y - 20, vy: -25, l: 1.8, ml: 1.8 });
      sfx(e[4] === 3 ? 'up' : 'evt', x);
      if (e[3] === mySide) { vib(40); if (V) { const p = V.pl[e[3]]; cry(p.age * 4 + ((p.af && p.af[p.age]) | 0), x, e[3], true); } }
      break;
    }
    case 'rage':
      if (V) { const p = V.pl[e[3]]; cry(p.age * 4 + ((p.af && p.af[p.age]) | 0), x, e[3], true); }
      fx.push({ ring: 1, x, y, l: 0.6, ml: 0.6, r: 80, col: '#ef4444' }); fx.push({ txt: '😡 VZTEK!', x, y: y - 30, vy: -30, l: 1.4, ml: 1.4 }); shake = 0.6; vib([60, 40, 120]); break;
    case 'sp': vib(e[3] === mySide ? 40 : [70, 40, 70]); break;
    case 'evo':
      if (x === BX[mySide]) vib([30, 40, 90]);
      fx.push({ rays: 1, x, y, l: 1.4, ml: 1.4 });
      fx.push({ ring: 1, x, y, l: 0.9, ml: 0.9, r: 150, col: '#fde047' });
      fx.push({ txt: 'EVOLUCE!', x, y: y - 60, vy: -28, l: 1.8, ml: 1.8 }); break;
  }
}
function drawFx(dt) {
  for (const f of fx) {
    f.l -= dt;
    const a = Math.max(0, f.l / f.ml), x = MX(f.x);
    c.globalAlpha = a;
    if (f.corpse) {
      const p = Math.min(1, (f.ml - f.l) / 0.35);
      c.globalAlpha = Math.min(1, f.l / 0.6);
      c.save(); c.translate(x, GY + (f.ty === 2 ? p * 8 : f.ty === 5 ? p * 14 : 0)); c.scale(facing(f.side) * US, US);
      if (f.ty !== 2 && f.ty !== 5) c.rotate(-p * 1.45);
      GORE = f.gore || null;
      drawUnitLocal(teamColM(f.side, f.m), f.a, f.ty, 0, 0, 1);
      GORE = null;
      c.restore();
    } else if (f.gib) {
      drawGib(f, dt);
    } else if (f.spurt) {
      // gejzír krve z krku padající mrtvoly
      const q = Math.min(1, (f.ml - f.l) / 0.35) * 1.45, m = mirror ? -1 : 1;
      const ux = -facing(f.side) * Math.sin(q), uy = -Math.cos(q);          // směr krku na obrazovce
      const sx = f.x + m * ux * US * 37.5, sy = GY + uy * US * 37.5;
      if (dt > 0) for (let k = 0; k < (EXTREME() ? 7 : 3); k++) {
        const v = rnd(140, 280) * a;
        fx.push({ blood: 1, np: 1, x: sx, y: sy, vx: m * ux * v + rnd(-40, 40), vy: uy * v - rnd(40, 120), l: 0.9, ml: 0.9, col: k ? '#b91c1c' : '#7f1010', r: rnd(1.4, 2.6), g: 700 });
      }
    } else if (f.fire) {
      const r = f.r * (1.2 - a * 0.6), op = c.globalCompositeOperation; c.globalCompositeOperation = 'lighter';
      const g = c.createRadialGradient(x, f.y, 0, x, f.y, r);
      g.addColorStop(0, '#ffffff'); g.addColorStop(0.3, f.col || '#fde047'); g.addColorStop(0.7, f.col ? 'rgba(56,225,255,.5)' : 'rgba(249,115,22,.6)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = g; circ(x, f.y, r); c.globalCompositeOperation = op;
    } else if (f.smoke) {
      f.x += f.vx * dt; f.y += f.vy * dt; f.r += dt * 14;
      c.globalAlpha = a * 0.55; c.fillStyle = f.col || '#8a8a8a'; circ(MX(f.x), f.y, f.r);
      c.globalAlpha = a * 0.35; c.fillStyle = f.col2 || '#d4d4d4'; circ(MX(f.x) - f.r * 0.3, f.y - f.r * 0.3, f.r * 0.6);
    } else if (f.flash) {
      glowDot(x, f.y, f.r * (0.6 + a), '#fde047');
    } else if (f.ring) {
      c.strokeStyle = f.col || '#fde68a'; c.lineWidth = 3 * a + 1; c.beginPath(); c.arc(x, f.y, f.r * (1 - a) + 4, 0, Math.PI * 2); c.stroke();
    } else if (f.rays) {
      const op = c.globalCompositeOperation; c.globalCompositeOperation = 'lighter';
      c.save(); c.translate(x, f.y); c.rotate(T * 0.8);
      c.fillStyle = 'rgba(253,224,71,.35)';
      for (let k = 0; k < 10; k++) { c.rotate(Math.PI / 5); poly([0, 0, -8, -150, 8, -150]); c.fill(); }
      c.restore(); c.globalCompositeOperation = op;
    } else if (f.txt) {
      f.y += f.vy * dt;
      const tx = Math.min(W - 120, Math.max(120, x));
      c.font = '900 34px system-ui'; c.textAlign = 'center';
      c.lineWidth = 6; c.strokeStyle = '#7c2d12'; c.strokeText(f.txt, tx, f.y);
      c.fillStyle = '#fde047'; c.fillText(f.txt, tx, f.y);
    } else {
      f.x += f.vx * dt; f.y += f.vy * dt; f.vy += f.g * dt;
      if (f.y > GY + 6) {
        if (f.blood && !f.landed && Math.random() < (f.np ? 0.03 : EXTREME() ? 0.2 : 0.12)) addPool(f.x, rnd(4, 9));
        f.landed = 1; f.y = GY + 6; f.vy *= -0.3; f.vx *= 0.6;
      }
      c.fillStyle = f.col; circ(MX(f.x), f.y, f.r);
    }
  }
  c.globalAlpha = 1;
  fx = fx.filter(f => f.l > 0);
  if (fx.length > GFX_FX[GFXL]) {
    // nad limit se zahazují nejdřív kapky krve, mrtvoly a kusy těl zůstanou
    let n = fx.length - GFX_FX[GFXL];
    fx = fx.filter(f => !(f.blood && n-- > 0));
    if (fx.length > 700) fx.splice(0, fx.length - 700);
  }
}

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
