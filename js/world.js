// =====================================================================
//  ZÁKLADNY A VĚŽE
// =====================================================================
function drawBase(s, p) {
  const team = teamCol(s), f = facing(s);
  c.save(); c.translate(MX(BX[s]), GY); c.scale(f, 1);
  curEmb = (EMBS[p.emb] || EMBS[0]).ic;
  drawBaseArt(facAt(p, p.age).g || 'age' + p.age, team);
  curEmb = '';
  for (let k = 0; k < p.slots; k++) {
    const y = -170 + k * 36;
    rr(38, y + 8, 30, 6, 2); fo(lg('ledge', 0, y, 0, y + 14, [[0, '#6b7280'], [1, '#374151']]), 1.2);
    c.fillStyle = '#374151'; poly([40, y + 14, 48, y + 14, 40, y + 22]); c.fill();
    if (p.tur[k]) drawTurret(p.tur[k].a, p.tur[k].i, 54, y + 2);
  }
  c.restore();
  if (p.hp > 0 && p.hp < p.mhp * 0.5) baseDamage(MX(BX[s]), p.hp < p.mhp * 0.2, s);
  const x = MX(BX[s]) - 55, y = GY - 300;
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

// =====================================================================
//  POMOCNÉ KRESBY (ozubená kola, kouř, pytle) – samotné základny jsou v bases.js
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
