// =====================================================================
//  ZÁKLADNY – podrobně kreslené budovy všech národů
//  Materiály mají textury (kameny, prkna, klády, tašky, došky, omítka, plech, beton),
//  světlo dopadá zleva shora, u země je stín a terén (kameny, tráva).
//  Statická část každé základny se nakreslí jednou do mezipaměti (BSPR) v rozlišení displeje,
//  každý snímek se kreslí jen živé věci (vlajky, ohně, kouř, záře oken, světla, pohyb).
//  Pravý okraj (x ≈ 30–45, výška −60 až −180) musí mít zeď/věž – tam se přichytí věže.
// =====================================================================
const BRng = s => () => (s = (s * 16807 + 11) % 2147483647) / 2147483647;
function tone(hex, k) {
  if (typeof hex !== 'string' || hex[0] !== '#') return hex;
  const n = parseInt(hex.length === 4 ? hex.slice(1).replace(/./g, m => m + m) : hex.slice(1, 7), 16);
  let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  if (k > 0) { r += (255 - r) * k; g += (255 - g) * k; b += (255 - b) * k; } else { r *= 1 + k; g *= 1 + k; b *= 1 + k; }
  return `rgb(${r | 0},${g | 0},${b | 0})`;
}
const rgba = (hex, a) => { const n = parseInt(hex.slice(1, 7), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };
const linG = (x0, y0, x1, y1, st) => { const g = c.createLinearGradient(x0, y0, x1, y1); st.forEach(([o, col]) => g.addColorStop(o, col)); return g; };
const radG = (x, y, r0, r1, st) => { const g = c.createRadialGradient(x, y, r0, x, y, r1); st.forEach(([o, col]) => g.addColorStop(o, col)); return g; };
// světlo zleva shora: lesk vlevo, stín vpravo, tma u země (uvnitř tvaru P)
function lit(P, x0, y0, x1, y1, k = 1) {
  c.save(); P(); c.clip();
  c.fillStyle = linG(x0, 0, x1, 0, [[0, `rgba(255,244,214,${0.26 * k})`], [0.28, 'rgba(255,244,214,0)'], [0.62, 'rgba(12,14,34,0)'], [1, `rgba(12,14,34,${0.45 * k})`]]);
  c.fillRect(x0 - 4, y0 - 4, x1 - x0 + 8, y1 - y0 + 8);
  c.fillStyle = linG(0, y1 - 28, 0, y1, [[0, 'rgba(0,0,0,0)'], [1, `rgba(0,0,0,${0.38 * k})`]]);
  c.fillRect(x0 - 4, y1 - 28, x1 - x0 + 8, 32);
  c.fillStyle = linG(0, y0, 0, y0 + 14, [[0, `rgba(255,255,255,${0.16 * k})`], [1, 'rgba(255,255,255,0)']]);
  c.fillRect(x0 - 4, y0, x1 - x0 + 8, 14);
  c.restore();
}
function outl(P, lw = 2.2) { P(); c.strokeStyle = OL; c.lineWidth = lw; c.lineJoin = 'round'; c.lineCap = 'round'; c.stroke(); }
// plný tvar: výplň, textura (oříznutá do tvaru), světlo, obrys
function solid(P, fill, box, tex, k = 1, lw = 2.2) {
  P(); c.fillStyle = fill; c.fill();
  if (tex) { c.save(); P(); c.clip(); tex(); c.restore(); }
  if (box) lit(P, box[0], box[1], box[2], box[3], k);
  outl(P, lw);
}
const rectP = (x, y, w, h) => () => { c.beginPath(); c.rect(x, y, w, h); };
const polyP = pts => () => poly(pts);

// ---------- textury (kreslí se do oříznuté oblasti) ----------
function texStones(x0, y0, x1, y1, col, o = {}) {
  const r = BRng(o.seed || 3), sh = o.sh || 13, sw = o.sw || 22;
  c.fillStyle = tone(col, -0.48); c.fillRect(x0, y0, x1 - x0, y1 - y0);
  for (let y = y1, row = 0; y > y0 - sh; y -= sh, row++) {
    let x = x0 - (row % 2 ? sw / 2 : 0) - r() * 5;
    while (x < x1) {
      const w = sw * (0.72 + r() * 0.56);
      rr(x + 1, y - sh + 1, w - 2, sh - 2, o.round ?? 2.5); c.fillStyle = tone(col, (r() - 0.5) * 0.28); c.fill();
      c.lineWidth = 1.2; c.strokeStyle = 'rgba(255,255,255,.24)'; ln(x + 3, y - sh + 2.2, x + w - 4, y - sh + 2.2);
      c.strokeStyle = 'rgba(0,0,0,.28)'; ln(x + 3, y - 1.6, x + w - 3, y - 1.6); ln(x + w - 1.6, y - sh + 3, x + w - 1.6, y - 2);
      if (r() < 0.14) { c.strokeStyle = 'rgba(0,0,0,.32)'; c.lineWidth = 0.8; ln(x + w * 0.3, y - sh + 3, x + w * 0.42, y - sh * 0.5); ln(x + w * 0.42, y - sh * 0.5, x + w * 0.36, y - 3); }
      if (r() < 0.2) { c.fillStyle = 'rgba(0,0,0,.18)'; circ(x + w * r(), y - sh * r(), 0.9); }
      x += w;
    }
  }
  if (o.moss) moss(x0, y0, x1, y1, o.moss, o.seed);
}
function moss(x0, y0, x1, y1, n, seed = 5) {
  const r = BRng(seed + 99);
  for (let i = 0; i < n; i++) {
    const x = x0 + r() * (x1 - x0), y = y1 - Math.pow(r(), 2.2) * (y1 - y0), s = 3 + r() * 6;
    c.fillStyle = 'rgba(70,120,45,.55)'; ell(x, y, s * 1.6, s * 0.7);
    c.fillStyle = 'rgba(130,180,80,.45)'; ell(x - s * 0.4, y - s * 0.25, s * 0.8, s * 0.35);
  }
}
function texPlanks(x0, y0, x1, y1, col, o = {}) {
  const r = BRng(o.seed || 7), w = o.w || 10, hor = o.hor;
  const L = hor ? y1 - y0 : x1 - x0, M = hor ? x1 - x0 : y1 - y0;
  for (let p = 0, i = 0; p < L; p += w, i++) {
    const t = (r() - 0.5) * 0.24;
    c.fillStyle = tone(col, t);
    if (hor) c.fillRect(x0, y0 + p, M, w); else c.fillRect(x0 + p, y0, w, M);
    c.lineWidth = 1.3; c.strokeStyle = 'rgba(0,0,0,.5)';
    hor ? ln(x0, y0 + p, x1, y0 + p) : ln(x0 + p, y0, x0 + p, y1);
    c.lineWidth = 1; c.strokeStyle = 'rgba(255,240,210,.14)';
    hor ? ln(x0, y0 + p + 1.6, x1, y0 + p + 1.6) : ln(x0 + p + 1.6, y0, x0 + p + 1.6, y1);
    c.strokeStyle = 'rgba(50,25,8,.28)'; c.lineWidth = 0.8;
    for (let g = 0; g < 2; g++) {
      const f = 0.3 + g * 0.35 + r() * 0.1; c.beginPath();
      for (let q = 0; q <= M; q += 6) { const a = p + w * f + Math.sin(q * 0.09 + i * 2 + g) * 1.1; hor ? c.lineTo(x0 + q, y0 + a) : c.lineTo(x0 + a, y0 + q); }
      c.stroke();
    }
    if (r() < 0.4) { const q = 6 + r() * (M - 12), a = p + w * 0.5; c.fillStyle = 'rgba(60,30,10,.4)'; hor ? ell(x0 + q, y0 + a, 3, 1.6) : ell(x0 + a, y0 + q, 1.6, 3); }
    if (o.nails) { c.fillStyle = 'rgba(30,30,30,.7)'; hor ? (circ(x0 + 4, y0 + p + w / 2, 0.9), circ(x1 - 4, y0 + p + w / 2, 0.9)) : (circ(x0 + p + w / 2, y0 + 4, 0.9), circ(x0 + p + w / 2, y1 - 4, 0.9)); }
  }
}
function texLogs(x0, y0, x1, y1, col, d = 12, o = {}) {
  const r = BRng(o.seed || 9);
  for (let y = y1, i = 0; y > y0 - d; y -= d, i++) {
    c.fillStyle = linG(0, y - d, 0, y, [[0, tone(col, 0.18 + (r() - 0.5) * 0.1)], [0.45, tone(col, (r() - 0.5) * 0.12)], [1, tone(col, -0.42)]]);
    rr(x0 - 4, y - d + 0.5, x1 - x0 + 8, d - 1, d / 2); c.fill();
    c.strokeStyle = 'rgba(40,20,6,.35)'; c.lineWidth = 0.8;
    for (let k = 0; k < 3; k++) { const yy = y - d * (0.3 + k * 0.22), a = r() * (x1 - x0); ln(x0 + a, yy, x0 + a + 10 + r() * 22, yy + (r() - 0.5)); }
    c.strokeStyle = 'rgba(0,0,0,.45)'; c.lineWidth = 1.2; ln(x0, y - 0.6, x1, y - 0.6);
  }
}
function logEnds(x, y0, y1, d, col) {      // čela klád na rohu srubu
  for (let y = y1 - d / 2; y > y0; y -= d) {
    c.beginPath(); c.arc(x, y, d / 2 - 0.3, 0, Math.PI * 2); fo(tone(col, 0.25), 1.2);
    c.strokeStyle = rgba('#5a3a1c', 0.5); c.lineWidth = 0.7; for (const k of [0.62, 0.32]) { c.beginPath(); c.arc(x, y, d / 2 * k, 0, Math.PI * 2); c.stroke(); }
  }
}
function texTiles(x0, y0, x1, y1, col, o = {}) {
  const r = BRng(o.seed || 11), tw = o.tw || 11, th = o.th || 8;
  c.fillStyle = tone(col, -0.45); c.fillRect(x0, y0, x1 - x0, y1 - y0);
  for (let y = y0 - th, row = 0; y < y1; y += th, row++)
    for (let x = x0 - (row % 2 ? tw / 2 : 0); x < x1; x += tw) {
      c.beginPath(); c.moveTo(x + 0.5, y); c.lineTo(x + 0.5, y + th); c.arc(x + tw / 2, y + th, tw / 2 - 0.5, Math.PI, 0, true); c.lineTo(x + tw - 0.5, y); c.closePath();
      c.fillStyle = linG(x, 0, x + tw, 0, [[0, tone(col, 0.12 + (r() - 0.5) * 0.14)], [1, tone(col, -0.22 + (r() - 0.5) * 0.14)]]); c.fill();
      c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 0.9; c.stroke();
    }
}
function texThatch(x0, y0, x1, y1, col, o = {}) {
  const r = BRng(o.seed || 13), rh = o.rh || 11;
  c.fillStyle = tone(col, -0.3); c.fillRect(x0, y0, x1 - x0, y1 - y0);
  for (let y = y0 - 4; y < y1; y += rh) {
    for (let x = x0; x < x1; x += 2.2) {
      c.strokeStyle = tone(col, (r() - 0.45) * 0.45); c.lineWidth = 1.4;
      const len = rh + 4 + r() * 5; ln(x, y, x + (r() - 0.5) * 3, y + len);
    }
    c.strokeStyle = 'rgba(40,25,5,.35)'; c.lineWidth = 2; ln(x0, y + rh + 3, x1, y + rh + 3);
  }
}
function texPlaster(x0, y0, x1, y1, col, o = {}) {
  const r = BRng(o.seed || 17);
  for (let i = 0; i < (o.n || 26); i++) { c.fillStyle = r() < 0.5 ? 'rgba(90,70,40,.08)' : 'rgba(255,255,255,.1)'; ell(x0 + r() * (x1 - x0), y0 + r() * (y1 - y0), 6 + r() * 14, 4 + r() * 8); }
  if (o.bricks) for (let i = 0; i < o.bricks; i++) {               // opadaná omítka, vykukují cihly
    const bx = x0 + 8 + r() * (x1 - x0 - 30), by = y0 + 10 + r() * (y1 - y0 - 30);
    c.fillStyle = 'rgba(120,90,60,.25)'; ell(bx + 8, by + 6, 13, 9);
    for (let k = 0; k < 3; k++) { rr(bx + (k % 2) * 5, by + k * 5, 12, 4, 1); c.fillStyle = tone('#b0603a', (r() - 0.5) * 0.2); c.fill(); c.strokeStyle = 'rgba(60,30,10,.4)'; c.lineWidth = 0.6; c.stroke(); }
  }
  c.strokeStyle = 'rgba(80,60,40,.35)'; c.lineWidth = 0.8;
  for (let i = 0; i < (o.cracks ?? 3); i++) { let x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0) * 0.6; c.beginPath(); c.moveTo(x, y); for (let k = 0; k < 4; k++) { x += (r() - 0.5) * 8; y += 4 + r() * 5; c.lineTo(x, y); } c.stroke(); }
  c.fillStyle = linG(0, y1 - 18, 0, y1, [[0, 'rgba(90,70,40,0)'], [1, 'rgba(90,70,40,.3)']]); c.fillRect(x0, y1 - 18, x1 - x0, 18);   // ušpiněná pata zdi
}
function texMetal(x0, y0, x1, y1, col, o = {}) {
  const r = BRng(o.seed || 19), pw = o.pw || 26, ph = o.ph || 30;
  for (let y = y0, row = 0; y < y1; y += ph, row++)
    for (let x = x0 - (row % 2 && o.stag ? pw / 2 : 0); x < x1; x += pw) {
      c.fillStyle = linG(x, y, x + pw, y + ph, [[0, tone(col, 0.1 + (r() - 0.5) * 0.12)], [1, tone(col, -0.12 + (r() - 0.5) * 0.12)]]); c.fillRect(x, y, pw, ph);
      c.strokeStyle = 'rgba(0,0,0,.45)'; c.lineWidth = 1.2; c.strokeRect(x + 0.6, y + 0.6, pw - 1.2, ph - 1.2);
      c.strokeStyle = 'rgba(255,255,255,.18)'; c.lineWidth = 1; ln(x + 2, y + 2, x + pw - 2, y + 2);
      if (o.rivets !== false) { c.fillStyle = 'rgba(255,255,255,.35)'; for (const [a, b] of [[3, 3], [pw - 3, 3], [3, ph - 3], [pw - 3, ph - 3]]) circ(x + a, y + b, 0.9); }
      if (r() < (o.grime ?? 0.35)) { c.fillStyle = linG(0, y + 4, 0, y + ph, [[0, 'rgba(70,50,30,.28)'], [1, 'rgba(70,50,30,0)']]); c.fillRect(x + 4 + r() * (pw - 10), y + 4, 2 + r() * 3, ph - 6); }
    }
}
function texConcrete(x0, y0, x1, y1, col, o = {}) {
  const r = BRng(o.seed || 23);
  for (let y = y1; y > y0; y -= (o.lift || 22)) { c.strokeStyle = 'rgba(0,0,0,.18)'; c.lineWidth = 1; ln(x0, y, x1, y); c.strokeStyle = 'rgba(255,255,255,.1)'; ln(x0, y + 1.2, x1, y + 1.2); }
  for (let i = 0; i < 90; i++) { c.fillStyle = r() < 0.6 ? 'rgba(0,0,0,.22)' : 'rgba(255,255,255,.18)'; circ(x0 + r() * (x1 - x0), y0 + r() * (y1 - y0), 0.5 + r() * 0.9); }
  for (let i = 0; i < 7; i++) { const x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0) * 0.7; c.fillStyle = linG(0, y, 0, y + 40, [[0, 'rgba(50,45,35,.22)'], [1, 'rgba(50,45,35,0)']]); c.fillRect(x, y, 2 + r() * 4, 40); }
}
function texHide(x0, y0, x1, y1, col, o = {}) {     // kůže/plsť: švy a záhyby
  const r = BRng(o.seed || 29);
  for (let x = x0 + 8; x < x1; x += 14 + r() * 8) { c.fillStyle = linG(x - 5, 0, x + 5, 0, [[0, 'rgba(0,0,0,0)'], [0.5, 'rgba(60,35,10,.16)'], [1, 'rgba(0,0,0,0)']]); c.fillRect(x - 5, y0, 10, y1 - y0); }
  c.setLineDash([2.5, 3]); c.strokeStyle = 'rgba(70,40,15,.55)'; c.lineWidth = 0.9;
  for (let k = 0; k < (o.seams || 3); k++) { const y = y0 + (y1 - y0) * (0.25 + k * 0.25) + (r() - 0.5) * 8; c.beginPath(); c.moveTo(x0, y); c.quadraticCurveTo((x0 + x1) / 2, y + 4, x1, y - 2); c.stroke(); }
  c.setLineDash([]);
  for (let i = 0; i < 20; i++) { c.fillStyle = 'rgba(80,50,20,.1)'; ell(x0 + r() * (x1 - x0), y0 + r() * (y1 - y0), 3 + r() * 7, 2 + r() * 4); }
}

// ---------- prvky ----------
let curWins = null;                                       // okna, která v noci/šeru září (sbírá se při kreslení spritu)
function win(x, y, w, h, o = {}) {
  const fr = o.fr || '#4a3420', litW = o.lit !== false;
  const P = () => { if (o.arch) { c.beginPath(); c.moveTo(x, y + h); c.lineTo(x, y + w / 2); c.arc(x + w / 2, y + w / 2, w / 2, Math.PI, 0); c.lineTo(x + w, y + h); c.closePath(); } else { c.beginPath(); c.rect(x, y, w, h); } };
  c.save(); c.translate(1.5, 1.5); P(); c.fillStyle = 'rgba(0,0,0,.35)'; c.fill(); c.restore();      // hloubka ostění
  P(); c.fillStyle = litW ? linG(0, y, 0, y + h, [[0, '#fff1b8'], [0.5, '#ffc861'], [1, '#e8892a']]) : linG(0, y, 0, y + h, [[0, '#3b4a66'], [1, '#151b28']]); c.fill();
  c.save(); P(); c.clip(); c.fillStyle = 'rgba(80,30,0,.28)'; c.fillRect(x, y, w, h * 0.22);
  if (!litW) { c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 1.4; ln(x + w * 0.2, y + h * 0.7, x + w * 0.6, y + h * 0.2); }
  if (o.bars) { c.strokeStyle = '#2a2a2a'; c.lineWidth = 1.2; for (let k = 1; k < 3; k++) ln(x + w * k / 3, y, x + w * k / 3, y + h); }
  c.restore();
  if (o.cross !== false && !o.bars) { c.strokeStyle = fr; c.lineWidth = 1.6; ln(x + w / 2, y + (o.arch ? 2 : 0), x + w / 2, y + h); ln(x, y + h * 0.56, x + w, y + h * 0.56); }
  P(); c.strokeStyle = fr; c.lineWidth = 2.6; c.stroke(); P(); c.strokeStyle = OL; c.lineWidth = 1; c.stroke();
  if (o.sill !== false) { rr(x - 2.5, y + h, w + 5, 3.2, 1); fo(o.sillCol || '#a59a8a', 1); }
  if (o.shut) for (const sx of [x - w * 0.55 - 1, x + w + 1]) { rr(sx, y, w * 0.55, h, 1); fo(o.shut, 1.1); c.strokeStyle = 'rgba(0,0,0,.3)'; c.lineWidth = 0.8; ln(sx + 2, y + h / 2, sx + w * 0.55 - 2, y + h / 2); }
  if (litW && curWins) curWins.push([x + w / 2, y + h / 2, Math.max(w, h)]);
}
function door(x, y, w, h, o = {}) {
  const P = () => { c.beginPath(); c.moveTo(x, y + h); if (o.arch !== false) { c.lineTo(x, y + w / 2); c.arc(x + w / 2, y + w / 2, w / 2, Math.PI, 0); } else { c.lineTo(x, y); c.lineTo(x + w, y); } c.lineTo(x + w, y + h); c.closePath(); };
  if (o.frame) { c.save(); c.translate(0, 0); c.beginPath(); c.moveTo(x - 4, y + h); c.lineTo(x - 4, y + w / 2); c.arc(x + w / 2, y + w / 2, w / 2 + 4, Math.PI, 0); c.lineTo(x + w + 4, y + h); c.closePath(); fo(o.frame, 1.6); c.restore(); }
  solid(P, o.col || '#6b4423', [x, y, x + w, y + h], () => texPlanks(x, y, x + w, y + h, o.col || '#6b4423', { w: w / 4, seed: 31 }), 0.8, 1.8);
  if (o.iron !== false) { c.fillStyle = '#2f3136'; for (const yy of [y + h * 0.3, y + h * 0.72]) { rr(x + 1, yy, w - 2, 2.6, 1); c.fill(); for (let k = 0; k < 3; k++) circ(x + 4 + k * (w - 8) / 2, yy + 1.3, 0.9); } }
  c.strokeStyle = '#c9a43c'; c.lineWidth = 1.2; c.beginPath(); c.arc(x + w * 0.75, y + h * 0.55, 2.2, 0, Math.PI * 2); c.stroke();
}
// pata stavby: stín na zemi, kameny a trsy trávy
function foot(x0, x1, o = {}) {
  const r = BRng(o.seed || 37);
  c.fillStyle = radG((x0 + x1) / 2, 0, 4, (x1 - x0) * 0.62, [[0, 'rgba(0,0,0,.32)'], [1, 'rgba(0,0,0,0)']]);
  c.save(); c.translate((x0 + x1) / 2, 0); c.scale(1, 0.12); circ(0, 0, (x1 - x0) * 0.62); c.restore();
  if (o.rocks !== false) for (let i = 0; i < (o.n || 7); i++) {
    const x = x0 + r() * (x1 - x0), s = 3 + r() * 5;
    c.beginPath(); c.ellipse(x, -s * 0.35, s, s * 0.7, 0, Math.PI, 0); c.closePath(); fo(tone('#8f877c', (r() - 0.5) * 0.3), 1);
    c.fillStyle = 'rgba(255,255,255,.3)'; ell(x - s * 0.3, -s * 0.6, s * 0.4, s * 0.18);
  }
  if (o.grass !== false) for (let i = 0; i < (o.g || 9); i++) {
    const x = x0 + r() * (x1 - x0), h = 5 + r() * 7;
    c.strokeStyle = tone(o.gcol || '#4f8a36', (r() - 0.5) * 0.3); c.lineWidth = 1.4;
    for (let k = -1; k <= 1; k++) { c.beginPath(); c.moveTo(x + k * 1.5, 0); c.quadraticCurveTo(x + k * 2, -h * 0.6, x + k * 4, -h - (k ? 0 : 3)); c.stroke(); }
  }
}
function crenels(x0, x1, y, n, h, col, seed) {
  const w = (x1 - x0) / (n * 2 - 1);
  for (let i = 0; i < n; i++) { const x = x0 + i * w * 2; solid(rectP(x, y - h, w, h), col, [x, y - h, x + w, y], () => texStones(x, y - h, x + w, y, col, { sh: h / 2, sw: w, seed: seed + i }), 0.8, 1.8); }
}
function slit(x, y, h) { rr(x - 2, y, 4, h, 2); c.fillStyle = '#15130f'; c.fill(); c.strokeStyle = 'rgba(255,255,255,.2)'; c.lineWidth = 1; ln(x - 3, y + h + 1, x + 3, y + h + 1); }
function banner(x, y, w, h, team, sym) {
  c.beginPath(); c.moveTo(x, y); c.lineTo(x + w, y); c.lineTo(x + w, y + h); c.lineTo(x + w / 2, y + h - 8); c.lineTo(x, y + h); c.closePath();
  c.fillStyle = linG(x, 0, x + w, 0, [[0, tone(team[0], 0.15)], [0.5, team[0]], [1, team[1]]]); c.fill();
  c.save(); c.clip(); c.fillStyle = 'rgba(0,0,0,.15)'; for (let k = 1; k < 4; k++) c.fillRect(x + w * k / 4 - 1, y, 2, h); c.restore();
  outl(() => { c.beginPath(); c.moveTo(x, y); c.lineTo(x + w, y); c.lineTo(x + w, y + h); c.lineTo(x + w / 2, y + h - 8); c.lineTo(x, y + h); c.closePath(); }, 1.6);
  c.fillStyle = '#e5c04a';
  if (sym === 'lion') { c.beginPath(); c.moveTo(x + w / 2, y + 8); c.lineTo(x + w * 0.78, y + h * 0.42); c.lineTo(x + w / 2, y + h * 0.72); c.lineTo(x + w * 0.22, y + h * 0.42); c.closePath(); c.fill(); }
  else circ(x + w / 2, y + h * 0.4, w * 0.22);
  c.fillStyle = '#4b5563'; rr(x - 3, y - 3, w + 6, 4, 2); c.fill();
}
function hangLamp(x, y) { c.strokeStyle = '#2a2a2a'; c.lineWidth = 1.2; ln(x, y, x, y + 6); rr(x - 4, y + 6, 8, 10, 2); fo('#3a3530', 1.2); c.fillStyle = '#ffd27a'; c.fillRect(x - 2.4, y + 8, 4.8, 6); if (curWins) curWins.push([x, y + 11, 10]); }
function skull(x, y, s = 1) {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.beginPath(); c.arc(0, -3, 6, Math.PI, 0); c.lineTo(5, 2); c.lineTo(3, 5); c.lineTo(-3, 5); c.lineTo(-5, 2); c.closePath(); fo('#efe8d4', 1.1);
  c.fillStyle = '#1a1a1a'; ell(-2.4, -1.5, 1.7, 2); ell(2.4, -1.5, 1.7, 2); poly([0, 1, -1, 3, 1, 3]); c.fill();
  c.restore();
}

// ---------- živé prvky ----------
function fire(x, y, s = 1) {
  const op = c.globalCompositeOperation; c.globalCompositeOperation = 'lighter';
  c.fillStyle = `rgba(255,140,40,${0.25 + Math.sin(T * 11 + x) * 0.05})`; circ(x, y - 8 * s, 18 * s);
  c.globalCompositeOperation = op;
  for (let i = 0; i < 4; i++) {
    const h = (12 + Math.sin(T * 13 + i * 1.7 + x) * 5) * s, xx = x + (i - 1.5) * 4.5 * s;
    c.beginPath(); c.moveTo(xx - 3 * s, y); c.quadraticCurveTo(xx - 2 * s, y - h * 0.6, xx + Math.sin(T * 9 + i) * 2 * s, y - h); c.quadraticCurveTo(xx + 3 * s, y - h * 0.5, xx + 3 * s, y); c.closePath();
    c.fillStyle = i % 2 ? '#fbbf24' : '#f97316'; c.fill();
  }
}
function puffs(x, y, n, col, sp = 0.45, sz = 1) {
  if (GFXL === 0) n = Math.ceil(n / 2);
  for (let i = 0; i < n; i++) {
    const t = (T * sp + i / n) % 1;
    c.fillStyle = `rgba(${col},${0.42 * (1 - t)})`; circ(x + Math.sin(T * 0.8 + i * 2) * 5 + t * 16, y - t * 80 * sz, (4 + t * 11) * sz);
  }
}
// záře oken (tím víc, čím je tma)
function winGlow(list) {
  if (!list || !list.length) return;
  const nk = typeof nightK === 'function' && V ? nightK(V.time) : 0, a = 0.1 + nk * 0.35;
  const op = c.globalCompositeOperation; c.globalCompositeOperation = 'lighter';
  for (const [x, y, s] of list) { const f = a * (0.9 + Math.sin(T * 7 + x * 0.3) * 0.1); c.fillStyle = radG(x, y, 0, s * 1.6, [[0, `rgba(255,190,90,${f})`], [1, 'rgba(255,160,60,0)']]); circ(x, y, s * 1.6); }
  c.globalCompositeOperation = op;
}
function beacon(x, y, col = '#ef4444', sp = 2) { const on = Math.sin(T * sp * Math.PI) > 0.2; c.fillStyle = on ? col : tone(col, -0.6); circ(x, y, 2.4); if (on) glowDot(x, y, 10, col); }

// ---------- mezipaměť statických částí ----------
const BSPR = new Map(); let bsprR = 0;
const B_X0 = -140, B_Y0 = -300, B_W = 280, B_H = 316;
function baseSprite(key, def, team) {
  const R = Math.min(3, Math.max(1, Math.round(scl * 2) / 2 * (GFXL >= 2 ? 1 : 0.75)));
  if (R !== bsprR) { BSPR.clear(); bsprR = R; }
  const k = key + '|' + team.slice(0, 3).join(','); let s = BSPR.get(k);
  if (!s) {
    const cvs = document.createElement('canvas'); cvs.width = Math.ceil(B_W * R); cvs.height = Math.ceil(B_H * R);
    const x = cvs.getContext('2d'); x.setTransform(R, 0, 0, R, -B_X0 * R, -B_Y0 * R); x.lineJoin = 'round'; x.lineCap = 'round';
    const c0 = c; c = x; curWins = [];
    try { def.st(team); } catch (e) { console.error('základna ' + key, e); } finally { c = c0; }
    s = { cvs, wins: curWins }; curWins = null; BSPR.set(k, s);
    if (BSPR.size > 24) BSPR.delete(BSPR.keys().next().value);
  }
  c.drawImage(s.cvs, B_X0, B_Y0, B_W, B_H);
  return s;
}
function drawBaseArt(key, team) {
  const def = BDEF[key] || BDEF.age0;
  const s = baseSprite(key, def, team);
  if (def.an) def.an(team);
  winGlow(s.wins);
}
