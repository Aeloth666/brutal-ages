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

// =====================================================================
//  DOBA KAMENNÁ
// =====================================================================
function rockMass(P, x0, y0, x1, y1, col, seed) {
  // skála z balvanů: vrstvy, světlé hrany, praskliny
  P(); c.fillStyle = linG(x0, y0, x1, y1, [[0, tone(col, 0.25)], [0.5, col], [1, tone(col, -0.35)]]); c.fill();
  c.save(); P(); c.clip();
  const r = BRng(seed);
  for (let i = 0; i < 26; i++) {
    const x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0), rx = 10 + r() * 22, ry = 7 + r() * 14;
    c.beginPath(); for (let k = 0; k < 7; k++) { const a = k / 7 * Math.PI * 2, q = 0.75 + r() * 0.35; c.lineTo(x + Math.cos(a) * rx * q, y + Math.sin(a) * ry * q); } c.closePath();
    c.fillStyle = tone(col, (r() - 0.5) * 0.3); c.fill();
    c.strokeStyle = 'rgba(40,30,20,.35)'; c.lineWidth = 1.2; c.stroke();
    c.strokeStyle = 'rgba(255,245,225,.28)'; c.lineWidth = 1.6; c.beginPath(); c.arc(x - rx * 0.1, y - ry * 0.1, Math.min(rx, ry) * 0.75, Math.PI * 1.05, Math.PI * 1.6); c.stroke();
  }
  c.strokeStyle = 'rgba(50,38,26,.3)'; c.lineWidth = 2;
  for (let i = 0; i < 6; i++) { const y = y1 - 25 - i * ((y1 - y0) / 6); c.beginPath(); c.moveTo(x0 - 5, y + 5); c.quadraticCurveTo((x0 + x1) / 2, y - 8 + (i % 2) * 10, x1 + 5, y + 3); c.stroke(); }
  c.restore();
  lit(P, x0, y0, x1, y1, 1.1);
  outl(P, 2.4);
}
function tusk(bx, m, top, tipX) {
  c.beginPath(); c.moveTo(bx, 0); c.bezierCurveTo(bx - m * 6, -top * 0.4, bx + m * 4, -top * 0.82, tipX, -top);
  c.bezierCurveTo(bx + m * 13, -top * 0.8, bx + m * 5, -top * 0.38, bx + m * 10, 0); c.closePath();
  fo(linG(0, -top, 0, 0, [[0, '#fffaf0'], [0.6, '#eadfc4'], [1, '#b8a888']]), 1.7);
  c.strokeStyle = 'rgba(150,130,100,.5)'; c.lineWidth = 1; for (let k = 1; k < 6; k++) ln(bx + m * 2, -k * top / 6.5, bx + m * 8, -k * top / 6.5 + 3);
}
const caveP = () => { c.beginPath(); c.moveTo(-92, 0); c.bezierCurveTo(-102, -60, -96, -120, -74, -156); c.bezierCurveTo(-60, -186, -36, -212, -10, -222); c.bezierCurveTo(10, -230, 32, -224, 46, -206); c.bezierCurveTo(62, -184, 66, -150, 66, -112); c.bezierCurveTo(70, -70, 72, -36, 70, 0); c.closePath(); };
const caveIn = () => { c.beginPath(); c.moveTo(-30, 0); c.bezierCurveTo(-34, -56, -12, -98, 12, -100); c.bezierCurveTo(38, -98, 56, -60, 52, 0); c.closePath(); };

const BDEF = {
  // ---------- Lovci mamutů: jeskyně ve skále s mamutími kly ----------
  age0: {
    st: team => {
      c.beginPath(); c.moveTo(-70, -130); c.bezierCurveTo(-90, -190, -40, -250, 10, -246); c.bezierCurveTo(48, -240, 60, -200, 48, -160); c.closePath();
      fo(linG(0, -246, 0, -130, [[0, '#8a7764'], [1, '#55473a']]), 2);          // zadní skála
      rockMass(caveP, -100, -230, 72, 0, '#9c8870', 41);
      // mech a tráva na skále
      c.fillStyle = '#4f8a36'; ell(-20, -219, 34, 9); ell(26, -214, 22, 7); ell(-70, -158, 14, 6); ell(58, -170, 10, 5);
      c.fillStyle = '#7cbf5a'; ell(-26, -223, 18, 4); ell(22, -217, 12, 3); ell(-72, -161, 7, 2.5);
      // jeskynní malby (okr)
      c.save(); c.translate(-62, -118); c.strokeStyle = '#b4532a'; c.fillStyle = '#b4532a'; c.lineWidth = 1.7;
      c.beginPath(); c.ellipse(0, 0, 10, 7, 0, 0, Math.PI * 2); c.fill(); for (const lx of [-6, -2, 3, 7]) ln(lx, 4, lx, 12);
      c.beginPath(); c.moveTo(9, -1); c.quadraticCurveTo(16, 3, 13, 11); c.stroke(); c.beginPath(); c.moveTo(9, 3); c.quadraticCurveTo(15, 7, 18, 3); c.stroke();
      for (const hx of [-22, -15]) { circ(hx, -7, 1.7); ln(hx, -5, hx, 3); ln(hx, 3, hx - 2, 9); ln(hx, 3, hx + 2, 9); ln(hx, -3, hx + 9, -8); }
      c.restore();
      c.fillStyle = 'rgba(180,83,42,.85)'; for (const [x, y] of [[-38, -160], [-31, -156], [-44, -153], [-35, -149]]) circ(x, y, 2);
      // vchod s krápníky a vnitřním světlem ohně
      caveIn(); c.fillStyle = radG(12, -10, 4, 96, [[0, '#6a4426'], [0.45, '#2a1a0e'], [1, '#0a0604']]); c.fill();
      c.save(); caveIn(); c.clip();
      c.fillStyle = '#5c4a3a'; for (const [x, h] of [[-14, 16], [-5, 26], [4, 13], [13, 30], [22, 18], [31, 24], [40, 12]]) { c.beginPath(); c.moveTo(x - 4.5, -102); c.lineTo(x, -102 + h); c.lineTo(x + 4.5, -102); c.fill(); c.fillStyle = 'rgba(255,255,255,.12)'; c.beginPath(); c.moveTo(x - 3, -100); c.lineTo(x - 0.5, -102 + h * 0.8); c.lineTo(x - 1, -100); c.fill(); c.fillStyle = '#5c4a3a'; }
      c.fillStyle = '#3a2c20'; for (const [x, h] of [[-20, 14], [46, 16]]) { c.beginPath(); c.moveTo(x - 6, 0); c.lineTo(x, -h); c.lineTo(x + 6, 0); c.fill(); }
      c.restore(); outl(caveIn, 2.2);
      tusk(-38, -1, 120, 4); tusk(62, 1, 120, 22);
      // natažená kožešina na rámu
      c.strokeStyle = '#5c3a1e'; c.lineWidth = 2.6; ln(-80, -92, -46, -96); ln(-78, -94, -76, -36); ln(-48, -98, -46, -40);
      c.beginPath(); c.moveTo(-76, -88); c.lineTo(-48, -92); c.lineTo(-46, -48); c.quadraticCurveTo(-60, -38, -76, -48); c.closePath();
      solid(() => { c.beginPath(); c.moveTo(-76, -88); c.lineTo(-48, -92); c.lineTo(-46, -48); c.quadraticCurveTo(-60, -38, -76, -48); c.closePath(); }, '#b98a55', [-76, -92, -46, -40], () => texHide(-76, -92, -46, -40, '#b98a55', { seams: 1 }), 0.8, 1.4);
      c.fillStyle = '#6e4a24'; for (const [x, y] of [[-66, -78], [-56, -66], [-68, -62], [-55, -55]]) ell(x, y, 3, 2);
      // palisáda z ořezaných kůlů
      for (let i = 0; i < 6; i++) {
        const x = -100 + i * 9, h = 34 + (i % 2) * 9;
        solid(polyP([x - 3.5, 0, x - 3.5, -h, x, -h - 8, x + 3.5, -h, x + 3.5, 0]), '#8b5e34', [x - 4, -h - 8, x + 4, 0], () => texPlanks(x - 4, -h - 8, x + 4, 0, '#8b5e34', { w: 8, seed: i }), 0.7, 1.3);
      }
      c.strokeStyle = '#5c3a1e'; c.lineWidth = 2.6; ln(-104, -14, -50, -16); ln(-104, -26, -50, -29);
      // ohniště: kameny a polena
      for (let i = 0; i < 7; i++) { c.beginPath(); c.ellipse(-2 + i * 5.5, -2.5, 3.8, 2.8, 0, 0, Math.PI * 2); fo(tone('#8a8075', (i % 3 - 1) * 0.12), 1); }
      c.strokeStyle = '#3e2410'; c.lineWidth = 3.4; ln(2, -3, 28, -9); ln(4, -9, 28, -2);
      skull(-44, -6, 1.1);
      c.fillStyle = '#efe8d4'; rr(62, -5, 16, 3, 1.5); c.fill(); circ(62, -3.5, 2.3); circ(78, -3.5, 2.3);
      for (const x of [-34, 62]) { rr(x - 2.2, -50, 4.4, 22, 1); fo('#6b4423', 1); rr(x - 3.6, -52, 7.2, 4, 1); fo('#3c3f46', 1); }
      foot(-104, 80, { seed: 3, n: 8 });
    },
    an: team => {
      fire(15, -6, 1.1); puffs(16, -26, 5, '120,115,110', 0.4);
      for (const x of [-34, 62]) fire(x, -52, 0.55);
      // liány se pohupují
      c.strokeStyle = '#3f7a2c'; c.lineWidth = 2;
      for (const [x, y, len] of [[-36, -216, 50], [-6, -222, 36], [30, -212, 56], [-72, -156, 32]]) {
        const sw = Math.sin(T * 1.4 + x) * 3; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + sw, y + len / 2, x + sw * 1.6, y + len); c.stroke();
        c.fillStyle = '#6aa84f'; for (let k = 8; k < len; k += 9) ell(x + sw * (k / len) * 1.5 + (k % 18 ? 3 : -3), y + k, 3.2, 1.8);
      }
      flag(-10, -230, team, '#8b5a2b', 40);
    },
  },
  // ---------- Kmen Vlka: týpí z malovaných kůží, vlčí totem, sušák s kožešinami ----------
  wolf: {
    st: team => {
      // malé týpí vzadu
      const tp2 = polyP([-100, 0, -72, -124, -44, 0]);
      solid(tp2, '#a98760', [-100, -124, -44, 0], () => texHide(-100, -124, -44, 0, '#a98760', { seams: 2, seed: 4 }), 1);
      c.strokeStyle = '#4a2c14'; c.lineWidth = 2.6; ln(-72, -118, -82, -142); ln(-72, -118, -62, -140); ln(-72, -118, -70, -146);
      // hlavní týpí
      const tp = polyP([-70, 0, -8, -200, 52, 0]);
      solid(tp, '#e2c79a', [-70, -200, 52, 0], () => {
        texHide(-70, -200, 52, 0, '#e2c79a', { seams: 4, seed: 8 });
        c.fillStyle = team[0]; c.fillRect(-80, -70, 140, 11); c.fillStyle = team[1]; c.fillRect(-80, -59, 140, 3);
        c.fillStyle = '#7f1d1d'; for (let x = -64; x < 50; x += 12) { poly([x, -150, x + 6, -139, x + 12, -150]); c.fill(); }
        c.fillStyle = '#1f2937'; for (let x = -60; x < 50; x += 10) { poly([x, -36, x + 5, -28, x + 10, -36]); c.fill(); }
        // vlčí stopy
        c.fillStyle = '#5c3a1e';
        for (const [x, y] of [[-28, -100], [-12, -118], [6, -98], [-16, -84]]) { ell(x, y, 3.2, 2.6); for (const [dx, dy] of [[-3, -4], [0, -5], [3, -4]]) circ(x + dx, y + dy, 1.1); }
      }, 1.1);
      // tyče nahoře
      c.strokeStyle = '#4a2c14'; c.lineWidth = 3; ln(-8, -194, -22, -228); ln(-8, -194, 6, -230); ln(-8, -194, -6, -234); ln(-8, -194, 14, -222);
      // vchod s odhrnutou kůží
      c.beginPath(); c.moveTo(-26, 0); c.quadraticCurveTo(-14, -56, -8, -64); c.quadraticCurveTo(-2, -56, 10, 0); c.closePath(); c.fillStyle = radG(-8, -10, 2, 60, [[0, '#5a3618'], [1, '#160c05']]); c.fill(); outl(() => { c.beginPath(); c.moveTo(-26, 0); c.quadraticCurveTo(-14, -56, -8, -64); c.quadraticCurveTo(-2, -56, 10, 0); }, 1.6);
      c.beginPath(); c.moveTo(10, 0); c.quadraticCurveTo(0, -40, -8, -64); c.quadraticCurveTo(14, -40, 24, -6); c.closePath(); fo('#c7a777', 1.4);
      // vlčí totem (pravý okraj – věže)
      solid(rectP(36, -196, 14, 196), '#7a5230', [36, -196, 50, 0], () => texPlanks(36, -196, 50, 0, '#7a5230', { w: 14, seed: 12 }), 1, 1.8);
      for (const [y, col] of [[-150, team[0]], [-110, '#b4532a'], [-70, '#1f2937']]) { rr(34, y, 18, 8, 2); fo(col, 1.2); }
      // vlčí lebka s čenichem
      c.beginPath(); c.moveTo(30, -214); c.lineTo(56, -214); c.lineTo(52, -196); c.lineTo(66, -188); c.lineTo(60, -180); c.lineTo(40, -184); c.lineTo(32, -196); c.closePath(); fo('#efe8d4', 1.5);
      poly([32, -214, 36, -228, 42, -214]); fo('#e3dbc4', 1.2); poly([46, -214, 52, -228, 56, -214]); fo('#e3dbc4', 1.2);
      c.fillStyle = '#1a1a1a'; ell(41, -203, 3, 2.4); c.fillStyle = '#fff'; for (let k = 0; k < 4; k++) poly([46 + k * 4, -183, 48 + k * 4, -177, 50 + k * 4, -183]), c.fill();
      // peří a korálky
      for (const [x, y, col] of [[33, -186, '#f1f5f9'], [53, -176, team[0]]]) { c.strokeStyle = '#3a2410'; c.lineWidth = 1; ln(x, y, x, y + 14); c.beginPath(); c.ellipse(x, y + 20, 2.4, 7, 0.1, 0, Math.PI * 2); fo(col, 1); }
      // sušák s kožešinou vpravo dole
      c.strokeStyle = '#5c3a1e'; c.lineWidth = 2.4; ln(54, 0, 56, -42); ln(80, 0, 78, -42); ln(52, -40, 82, -40);
      solid(() => { c.beginPath(); c.moveTo(57, -40); c.lineTo(77, -40); c.lineTo(75, -14); c.quadraticCurveTo(67, -8, 59, -14); c.closePath(); }, '#8a8a8a', [57, -40, 77, -8], () => texHide(57, -40, 77, -8, '#8a8a8a', { seams: 0 }), 0.8, 1.2);
      // ohniště
      for (let i = 0; i < 6; i++) { c.beginPath(); c.ellipse(-56 + i * 5, -2.5, 3.6, 2.6, 0, 0, Math.PI * 2); fo(tone('#8a8075', (i % 3 - 1) * 0.12), 1); }
      c.strokeStyle = '#3e2410'; c.lineWidth = 3; ln(-54, -3, -32, -8); ln(-52, -8, -32, -2);
      skull(-82, -6);
      foot(-104, 86, { seed: 6 });
    },
    an: team => { fire(-43, -5); puffs(-42, -24, 4, '120,115,110', 0.4); puffs(-8, -228, 3, '140,135,130', 0.3, 0.6); flag(-8, -232, team, '#8b5a2b', 30); },
  },
  // ---------- Kmen Medvěda: zemní srub z klád pod drnem, medvědí lebka, strážní věž ----------
  bear: {
    st: team => {
      // srub
      const hut = () => { c.beginPath(); c.moveTo(-92, 0); c.lineTo(-92, -86); c.lineTo(30, -86); c.lineTo(30, 0); c.closePath(); };
      solid(hut, '#8a5a32', [-92, -86, 30, 0], () => texLogs(-92, -86, 30, 0, '#8a5a32', 12, { seed: 2 }), 1);
      logEnds(-92, -86, 0, 12, '#9a6a3e'); logEnds(30, -86, 0, 12, '#9a6a3e');
      // drnová střecha
      const roof = () => { c.beginPath(); c.moveTo(-104, -80); c.quadraticCurveTo(-60, -160, -30, -168); c.quadraticCurveTo(10, -160, 42, -80); c.closePath(); };
      solid(roof, '#5f7d3a', [-104, -168, 42, -80], () => {
        texThatch(-104, -168, 42, -80, '#7a6a3a', { rh: 13, seed: 4 });
        c.fillStyle = 'rgba(80,140,50,.85)'; c.beginPath(); c.moveTo(-104, -80); c.quadraticCurveTo(-60, -160, -30, -168); c.quadraticCurveTo(10, -160, 42, -80); c.lineTo(42, -110); c.quadraticCurveTo(-30, -150, -104, -108); c.closePath(); c.fill();
        const r = BRng(5); for (let i = 0; i < 40; i++) { const x = -96 + r() * 132, y = -150 + r() * 50; c.strokeStyle = r() < 0.5 ? '#9ccc65' : '#5a8a32'; c.lineWidth = 1.3; ln(x, y, x + (r() - 0.5) * 3, y - 5 - r() * 5); }
      }, 1.1);
      c.fillStyle = '#e8e2a0'; for (const [x, y] of [[-60, -140], [-20, -158], [8, -132]]) { circ(x, y, 2.2); c.fillStyle = '#f5d33a'; circ(x, y, 1); c.fillStyle = '#e8e2a0'; }   // květy
      // vchod a medvědí lebka
      door(-46, -64, 28, 64, { col: '#5c3a1e', iron: false });
      c.beginPath(); c.ellipse(-32, -80, 14, 11, 0, 0, Math.PI * 2); fo('#efe8d4', 1.6);
      c.fillStyle = '#efe8d4'; circ(-43, -88, 5); circ(-21, -88, 5); outl(() => { c.beginPath(); c.arc(-43, -88, 5, 0, Math.PI * 2); c.moveTo(-16, -88); c.arc(-21, -88, 5, 0, Math.PI * 2); }, 1.2);
      c.fillStyle = '#1a1a1a'; ell(-37, -82, 3, 3.5); ell(-27, -82, 3, 3.5); ell(-32, -74, 2.4, 1.6);
      c.fillStyle = '#fff'; poly([-38, -71, -36, -64, -34, -71]); c.fill(); poly([-30, -71, -28, -64, -26, -71]); c.fill();
      // okénko s okenicí
      win(-80, -58, 16, 14, { fr: '#4a2c14', cross: false, sill: false });
      c.strokeStyle = '#5c3a1e'; c.lineWidth = 2; ln(-82, -60, -62, -60);
      // strážní věž z klád (pravý okraj)
      for (const x of [32, 56]) { rr(x, -200, 7, 200, 2); fo(linG(x, 0, x + 7, 0, [[0, '#9a6a3e'], [1, '#5c3a1e']]), 1.4); }
      c.strokeStyle = '#6b4423'; c.lineWidth = 3; for (let y = -180; y < -10; y += 26) { ln(34, y, 60, y + 22); ln(60, y, 34, y + 22); }
      c.strokeStyle = '#4a2c14'; c.lineWidth = 2.2; for (let y = -20; y > -190; y -= 12) ln(36, y, 58, y);
      solid(rectP(26, -214, 44, 16), '#8a5a32', [26, -214, 70, -198], () => texPlanks(26, -214, 70, -198, '#8a5a32', { w: 6, seed: 9 }), 0.8, 1.6);
      solid(polyP([22, -214, 48, -246, 74, -214]), '#7a6a3a', [22, -246, 74, -214], () => texThatch(22, -246, 74, -214, '#8a7a45', { rh: 9, seed: 7 }), 1, 1.6);
      // dříví a medvědí kožešina
      for (let i = 0; i < 3; i++) { c.beginPath(); c.ellipse(-100 + i * 7, -6 - (i % 2) * 6, 5, 5, 0, 0, Math.PI * 2); fo('#b08050', 1); c.fillStyle = '#6b4423'; circ(-100 + i * 7, -6 - (i % 2) * 6, 2); }
      foot(-108, 78, { seed: 8 });
    },
    an: team => { puffs(-48, -170, 5, '130,125,118', 0.35); flag(48, -246, team, '#5c3a1e', 30); },
  },
  // ---------- Kmen Orla: rákosová chýše a vysoký totem s orlími křídly ----------
  eagle: {
    st: team => {
      // chýše s doškovou kupolí
      const wall = () => { c.beginPath(); c.moveTo(-92, 0); c.lineTo(-90, -70); c.lineTo(20, -70); c.lineTo(22, 0); c.closePath(); };
      solid(wall, '#a8875a', [-92, -70, 22, 0], () => {
        texPlanks(-92, -70, 22, 0, '#a8875a', { w: 5, seed: 6 });
        c.strokeStyle = '#5c3a1e'; c.lineWidth = 2.2; for (const y of [-52, -24]) { c.beginPath(); for (let x = -92; x < 22; x += 6) c.lineTo(x, y + (x / 6 % 2 ? 2 : -2)); c.stroke(); }
      }, 1);
      const dome = () => { c.beginPath(); c.moveTo(-104, -64); c.bezierCurveTo(-102, -150, -60, -178, -34, -180); c.bezierCurveTo(-8, -178, 34, -150, 34, -64); c.closePath(); };
      solid(dome, '#c7a35e', [-104, -180, 34, -64], () => texThatch(-104, -180, 34, -64, '#c7a35e', { rh: 12, seed: 3 }), 1.1);
      c.strokeStyle = '#7a5a2a'; c.lineWidth = 3; ln(-34, -180, -34, -196); c.fillStyle = team[0]; poly([-34, -196, -22, -190, -34, -184]); c.fill();
      door(-50, -52, 26, 52, { col: '#6b4a24', iron: false });
      win(-80, -54, 14, 14, { fr: '#4a2c14', sill: false }); win(-4, -54, 14, 14, { fr: '#4a2c14', sill: false });
      // totem: tři vyřezávané tváře
      const faces = [['#2563eb', -60], ['#eab308', -120], ['#dc2626', -180]];
      solid(rectP(36, -196, 22, 196), '#8a5a32', [36, -196, 58, 0], () => texPlanks(36, -196, 58, 0, '#8a5a32', { w: 22, seed: 2 }), 1);
      for (const [col, y] of faces) {
        rr(33, y - 26, 28, 52, 4); fo(linG(33, 0, 61, 0, [[0, tone(col, 0.2)], [1, tone(col, -0.3)]]), 1.6);
        c.fillStyle = '#f8fafc'; ell(41, y - 10, 4.4, 3.6); ell(53, y - 10, 4.4, 3.6); c.fillStyle = '#111'; circ(41, y - 10, 2); circ(53, y - 10, 2);
        c.fillStyle = '#f59e0b'; poly([47, y - 6, 43, y + 6, 51, y + 6]); c.fill();
        c.fillStyle = '#111'; rr(40, y + 11, 14, 4, 2); c.fill(); c.fillStyle = '#fff'; for (let k = 0; k < 3; k++) c.fillRect(42 + k * 4, y + 11, 2, 2);
        c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 1; ln(35, y - 18, 59, y - 18);
      }
      // orel nahoře (křídla roztažená)
      for (const m of [-1, 1]) {
        c.beginPath(); c.moveTo(47, -214); c.bezierCurveTo(47 + m * 18, -236, 47 + m * 38, -236, 47 + m * 52, -222);
        c.lineTo(47 + m * 44, -216); c.lineTo(47 + m * 48, -210); c.lineTo(47 + m * 38, -206); c.lineTo(47 + m * 40, -200); c.bezierCurveTo(47 + m * 26, -202, 47 + m * 12, -204, 47, -200); c.closePath();
        fo(linG(47, -236, 47, -200, [[0, '#7c4a24'], [1, '#3e2410']]), 1.6);
        c.strokeStyle = 'rgba(255,255,255,.25)'; c.lineWidth = 1; for (let k = 1; k < 4; k++) ln(47 + m * k * 11, -226 + k, 47 + m * (k * 11 + 6), -208);
      }
      c.beginPath(); c.ellipse(47, -212, 9, 14, 0, 0, Math.PI * 2); fo('#5c3a1e', 1.5);
      c.beginPath(); c.arc(47, -228, 8, 0, Math.PI * 2); fo('#f8fafc', 1.5);
      c.fillStyle = '#111'; circ(50, -229, 1.6); c.fillStyle = '#f59e0b'; poly([53, -228, 62, -224, 53, -222]); c.fill();
      // koše a hliněné nádoby
      for (const [x, col] of [[-100, '#b45309'], [-88, '#92400e']]) { c.beginPath(); c.ellipse(x, -9, 6, 9, 0, 0, Math.PI * 2); fo(linG(x - 6, 0, x + 6, 0, [[0, tone(col, 0.3)], [1, tone(col, -0.3)]]), 1.2); c.fillStyle = '#1a1a1a'; ell(x, -17, 3, 1.2); }
      foot(-108, 80, { seed: 4 });
    },
    an: team => { flag(-34, -196, team, '#7a5a2a', 0.1); fire(78, -6, 0.8); },
  },

  // =====================================================================
  //  STŘEDOVĚK
  // =====================================================================
  // ---------- Rytíři: kamenný hrad s kulatou věží, padací mříží a praporci ----------
  age1: {
    st: team => {
      const S = '#9a9ea6';
      // hradba s cimbuřím
      solid(rectP(-96, -150, 130, 150), S, [-96, -150, 34, 0], () => texStones(-96, -150, 34, 0, S, { sh: 14, sw: 24, seed: 3, moss: 9 }), 1.1);
      crenels(-98, 36, -150, 6, 14, S, 10);
      // kulatá věž
      const tower = () => { c.beginPath(); c.rect(24, -214, 44, 214); };
      solid(tower, S, [24, -214, 68, 0], () => {
        texStones(24, -214, 68, 0, S, { sh: 13, sw: 15, seed: 7, moss: 4 });
        c.fillStyle = linG(24, 0, 68, 0, [[0, 'rgba(255,255,255,.18)'], [0.4, 'rgba(255,255,255,0)'], [0.75, 'rgba(0,0,0,.15)'], [1, 'rgba(0,0,0,.45)']]); c.fillRect(24, -214, 44, 214);
      }, 0.6);
      rr(20, -222, 52, 10, 2); fo(tone(S, -0.1), 1.6);
      // kuželová střecha s taškami v barvě týmu
      const roof = polyP([16, -220, 46, -282, 76, -220]);
      solid(roof, team[0], [16, -282, 76, -220], () => texTiles(16, -282, 76, -220, team[0], { tw: 8, th: 6, seed: 2 }), 1.2);
      // okna a střílny
      win(38, -192, 12, 20, { arch: true, fr: '#3a3530', sillCol: '#8a8f98' }); slit(46, -140, 16); slit(46, -90, 16);
      win(-76, -118, 12, 22, { arch: true, fr: '#3a3530', sillCol: '#8a8f98' }); win(-40, -118, 12, 22, { arch: true, fr: '#3a3530', sillCol: '#8a8f98' });
      slit(-58, -66, 14); slit(4, -110, 14);
      // brána: kamenný oblouk, otevřená vrata, padací mříž
      c.beginPath(); c.moveTo(-40, 0); c.lineTo(-40, -50); c.arc(-18, -50, 22, Math.PI, 0); c.lineTo(4, 0); c.closePath();
      fo(radG(-18, -20, 4, 60, [[0, '#3a2a1a'], [1, '#120c06']]), 2);
      c.strokeStyle = '#3c3f46'; c.lineWidth = 2.4; for (let x = -36; x < 4; x += 7) ln(x, -66, x, -26); for (let y = -60; y < -24; y += 8) ln(-40, y, 4, y);
      c.fillStyle = '#3c3f46'; for (let x = -36; x < 4; x += 7) poly([x - 2, -26, x, -20, x + 2, -26]), c.fill();
      c.lineWidth = 3; c.strokeStyle = tone(S, -0.2); c.beginPath(); c.arc(-18, -50, 25, Math.PI, 0); c.stroke();
      // prapor s erbem a kotvy řetězů
      banner(-90, -140, 22, 44, team, 'lion');
      c.strokeStyle = '#4b5563'; c.lineWidth = 1.4; c.setLineDash([2, 1.5]); ln(-42, -76, -30, -60); ln(6, -76, -6, -60); c.setLineDash([]);
      // břečťan
      const r = BRng(14); c.strokeStyle = '#2f6b2a'; c.lineWidth = 1.6;
      c.beginPath(); c.moveTo(-96, 0); for (let y = 0; y > -120; y -= 8) c.lineTo(-92 + Math.sin(y * 0.12) * 4, y); c.stroke();
      for (let y = -6; y > -116; y -= 7) { c.fillStyle = r() < 0.5 ? '#3f8a35' : '#5aa845'; ell(-90 + Math.sin(y * 0.12) * 4 + (r() - 0.5) * 8, y, 3.4, 2.4); }
      foot(-104, 76, { seed: 9 });
    },
    an: team => { flag(46, -282, team, '#4b5563', 30); for (const x of [-46, 10]) fire(x, -64, 0.45); },
  },
  // ---------- Vikingové: dlouhý dům se šindelovou střechou, dračí hlavy, štíty ----------
  viking: {
    st: team => {
      solid(rectP(-98, -18, 140, 18), '#7d7a74', [-98, -18, 42, 0], () => texStones(-98, -18, 42, 0, '#7d7a74', { sh: 9, sw: 14, seed: 5 }), 1);
      const wall = rectP(-92, -96, 128, 78);
      solid(wall, '#7a4f2a', [-92, -96, 36, -18], () => texPlanks(-92, -96, 36, -18, '#7a4f2a', { w: 9, seed: 3, nails: true }), 1.1);
      for (const x of [-92, 32]) { rr(x - 2, -100, 8, 84, 2); fo('#5c3a1e', 1.4); }
      // šindelová střecha (bok dlouhého domu), hřeben lehce prohnutý
      const roof = () => { c.beginPath(); c.moveTo(-108, -88); c.lineTo(48, -88); c.lineTo(22, -154); c.quadraticCurveTo(-30, -146, -82, -154); c.closePath(); };
      solid(roof, '#6b4a2a', [-108, -156, 48, -88], () => { texTiles(-108, -160, 48, -88, '#6b4a2a', { tw: 9, th: 7, seed: 6 }); c.fillStyle = 'rgba(70,110,40,.35)'; ell(-60, -110, 22, 6); ell(10, -100, 16, 5); }, 1.2);
      c.strokeStyle = '#3e2410'; c.lineWidth = 5; c.beginPath(); c.moveTo(-84, -155); c.quadraticCurveTo(-30, -147, 24, -155); c.stroke();
      c.strokeStyle = '#8a5a32'; c.lineWidth = 2; c.beginPath(); c.moveTo(-84, -156); c.quadraticCurveTo(-30, -148, 24, -156); c.stroke();
      const dragon = (x, m) => {
        c.beginPath(); c.moveTo(x, -152); c.bezierCurveTo(x + m * 6, -176, x + m * 2, -192, x + m * 16, -200); c.lineTo(x + m * 25, -196); c.lineTo(x + m * 17, -190); c.bezierCurveTo(x + m * 12, -182, x + m * 14, -168, x + m * 9, -152); c.closePath();
        fo(linG(0, -200, 0, -152, [[0, '#9a6a3e'], [1, '#4a2c14']]), 1.6);
        c.fillStyle = '#fbbf24'; circ(x + m * 15, -194, 1.7); c.fillStyle = '#4a2c14'; poly([x + m * 6, -184, x - m * 3, -192, x + m * 4, -180]); c.fill();
        c.strokeStyle = 'rgba(255,230,190,.35)'; c.lineWidth = 1; for (let k = 0; k < 3; k++) ln(x + m * (4 + k * 2), -160 - k * 9, x + m * (8 + k * 2), -163 - k * 9);
      };
      dragon(-84, -1);
      // štíty na zdi v barvách týmu
      [-80, -56, -32, -8, 16].forEach((x, i) => {
        c.beginPath(); c.arc(x, -60, 10, 0, Math.PI * 2); fo(i % 2 ? team[0] : '#e7d9b8', 1.6);
        c.fillStyle = i % 2 ? '#e7d9b8' : team[0]; c.beginPath(); c.moveTo(x, -60); c.arc(x, -60, 10, -Math.PI / 2, 0); c.closePath(); c.fill(); c.beginPath(); c.moveTo(x, -60); c.arc(x, -60, 10, Math.PI / 2, Math.PI); c.closePath(); c.fill();
        c.beginPath(); c.arc(x, -60, 3.4, 0, Math.PI * 2); fo('#9ca3af', 1); c.strokeStyle = OL; c.lineWidth = 1.6; c.beginPath(); c.arc(x, -60, 10, 0, Math.PI * 2); c.stroke();
      });
      door(-30, -54, 22, 36, { col: '#5c3a1e', arch: false });
      c.strokeStyle = '#c9a43c'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(-28, -50); c.bezierCurveTo(-20, -44, -18, -36, -26, -30); c.stroke();      // vyřezávaný ornament
      // strážní věž (pravý okraj)
      for (const x of [36, 60]) { rr(x, -206, 7, 206, 2); fo(linG(x, 0, x + 7, 0, [[0, '#8a5a32'], [1, '#4a2c14']]), 1.4); }
      c.strokeStyle = '#5c3a1e'; c.lineWidth = 2.6; for (let y = -190; y < -10; y += 30) { ln(38, y, 62, y + 26); ln(62, y, 38, y + 26); }
      solid(rectP(30, -220, 44, 18), '#7a4f2a', [30, -220, 74, -202], () => texPlanks(30, -220, 74, -202, '#7a4f2a', { w: 7, seed: 2 }), 0.8, 1.6);
      for (const x of [34, 48, 62]) { c.beginPath(); c.arc(x + 4, -211, 5.5, 0, Math.PI * 2); fo(x === 48 ? team[0] : '#c9b28a', 1.2); }
      dragon(24, 1);
      // sudy a sekera v pařezu
      for (const x of [-104, -92]) { rr(x - 5, -16, 11, 16, 3); fo(linG(x - 5, 0, x + 6, 0, [[0, '#a0703c'], [1, '#5c3a1e']]), 1.2); c.strokeStyle = '#3c3f46'; c.lineWidth = 1.4; ln(x - 5, -12, x + 6, -12); ln(x - 5, -4, x + 6, -4); }
      c.beginPath(); c.ellipse(60, -6, 9, 6, 0, 0, Math.PI * 2); fo('#a0703c', 1.2); c.strokeStyle = '#5c3a1e'; c.lineWidth = 2.2; ln(60, -10, 70, -26); c.beginPath(); c.moveTo(68, -28); c.quadraticCurveTo(78, -30, 76, -20); c.lineTo(70, -22); c.closePath(); fo('#9ca3af', 1);
      foot(-110, 82, { seed: 12 });
    },
    an: team => { puffs(-30, -160, 4, '120,115,110', 0.35); flag(52, -220, team, '#5c3a1e', 30); },
  },
  // ---------- Samurajové: třípatrová pagoda, brána torii, kvetoucí sakura ----------
  samurai: {
    st: team => {
      // sakura vlevo vzadu
      c.strokeStyle = '#4a2c1a'; c.lineWidth = 6; c.beginPath(); c.moveTo(-100, 0); c.quadraticCurveTo(-96, -60, -84, -96); c.stroke(); c.lineWidth = 3; ln(-90, -70, -110, -100); ln(-86, -90, -70, -120);
      const r = BRng(21); for (let i = 0; i < 40; i++) { const x = -96 + (r() - 0.5) * 56, y = -112 + (r() - 0.5) * 44; c.fillStyle = ['#fbcfe8', '#f9a8d4', '#fce7f3'][i % 3]; circ(x, y, 4 + r() * 4); }
      // kamenný podstavec
      solid(rectP(-74, -22, 120, 22), '#8d8a84', [-74, -22, 46, 0], () => texStones(-74, -22, 46, 0, '#8d8a84', { sh: 11, sw: 20, seed: 3 }), 1);
      // patra
      const floors = [[-62, -78, 96, 56], [-52, -138, 76, 44], [-42, -190, 56, 36]];
      floors.forEach(([x, y, w, h], i) => {
        solid(rectP(x, y, w, h), '#f3ecdc', [x, y, x + w, y + h], () => texPlaster(x, y, x + w, y + h, '#f3ecdc', { n: 8, cracks: 0 }), 0.8);
        c.strokeStyle = '#2b2018'; c.lineWidth = 3; for (let k = 0; k <= 4; k++) ln(x + w * k / 4, y, x + w * k / 4, y + h); ln(x, y + 4, x + w, y + 4);
        for (let k = 0; k < 4; k++) if (k !== 1 || i) { const ww = w / 4 - 8; c.fillStyle = 'rgba(255,214,140,.85)'; c.fillRect(x + w * k / 4 + 4, y + 10, ww, h - 18); c.strokeStyle = 'rgba(60,40,20,.5)'; c.lineWidth = 0.7; for (let q = 1; q < 3; q++) { ln(x + w * k / 4 + 4 + ww * q / 3, y + 10, x + w * k / 4 + 4 + ww * q / 3, y + h - 8); ln(x + w * k / 4 + 4, y + 10 + (h - 18) * q / 3, x + w * k / 4 + 4 + ww, y + 10 + (h - 18) * q / 3); } if (curWins) curWins.push([x + w * k / 4 + 4 + ww / 2, y + h / 2, ww]); }
        // zábradlí
        c.fillStyle = '#b91c1c'; c.fillRect(x - 6, y + h - 8, w + 12, 3); for (let q = x - 4; q < x + w + 6; q += 8) c.fillRect(q, y + h - 8, 2, 8);
        // zahnutá střecha s taškami
        const rw = w + 34, rx = x - 17, ry = y - 2, P = () => { c.beginPath(); c.moveTo(rx - 6, ry + 2); c.quadraticCurveTo(rx + 10, ry - 4, rx + 18, ry - 20); c.lineTo(rx + rw - 18, ry - 20); c.quadraticCurveTo(rx + rw - 10, ry - 4, rx + rw + 6, ry + 2); c.quadraticCurveTo(rx + rw / 2, ry - 6, rx - 6, ry + 2); c.closePath(); };
        solid(P, '#2f3a4a', [rx, ry - 20, rx + rw, ry + 2], () => texTiles(rx - 6, ry - 22, rx + rw + 6, ry + 4, '#3a4658', { tw: 7, th: 5, seed: i }), 1.1, 1.8);
        c.fillStyle = '#e5c04a'; circ(rx - 4, ry, 2); circ(rx + rw + 4, ry, 2);
      });
      // vrcholová špice
      c.strokeStyle = OL; c.lineWidth = 4; ln(-14, -212, -14, -250); c.strokeStyle = '#c9a43c'; c.lineWidth = 2.2; ln(-14, -212, -14, -250);
      for (let k = 0; k < 5; k++) { c.beginPath(); c.ellipse(-14, -218 - k * 6, 5 - k * 0.6, 1.6, 0, 0, Math.PI * 2); fo('#c9a43c', 1); }
      door(-26, -70, 24, 48, { col: '#5c2a1a', arch: false, iron: false });
      // brána torii (pravý okraj)
      for (const x of [34, 62]) { rr(x - 4, -170, 8, 170, 2); fo(linG(x - 4, 0, x + 4, 0, [[0, '#ef4444'], [1, '#991b1b']]), 1.6); rr(x - 6, -14, 12, 14, 1); fo('#1f2937', 1.2); }
      c.beginPath(); c.moveTo(22, -178); c.quadraticCurveTo(48, -170, 74, -178); c.lineTo(76, -188); c.quadraticCurveTo(48, -180, 20, -188); c.closePath(); fo('#1f2937', 1.6);
      rr(26, -170, 44, 7, 1); fo('#dc2626', 1.4); rr(26, -146, 44, 6, 1); fo('#dc2626', 1.4);
      rr(42, -166, 12, 18, 1); fo('#1f2937', 1.2); c.fillStyle = '#e5c04a'; c.font = 'bold 9px serif'; c.textAlign = 'center'; c.fillText('武', 48, -153);
      // kamenná lucerna a prapor nobori
      rr(-90, -6, 14, 6, 1); fo('#8d8a84', 1); rr(-87, -30, 8, 24, 1); fo('#9a968f', 1); rr(-92, -38, 18, 8, 2); fo('#7d7a74', 1.2); c.fillStyle = '#ffd27a'; c.fillRect(-85, -28, 4, 6); if (curWins) curWins.push([-83, -25, 8]);
      c.strokeStyle = '#3a2410'; c.lineWidth = 2; ln(-66, 0, -66, -118);
      rr(-64, -116, 12, 54, 1); fo(team[0], 1.3); c.fillStyle = '#fff'; circ(-58, -100, 3.4);
      foot(-110, 80, { seed: 13 });
    },
    an: team => {
      flag(-14, -250, team, '#c9a43c', 0.1);
      // padající okvětní lístky
      for (let i = 0; i < 6; i++) { const t = (T * 0.2 + i / 6) % 1; c.fillStyle = '#f9a8d4'; ell(-110 + i * 9 + Math.sin(T * 2 + i) * 10 + t * 30, -110 + t * 110, 2, 1.2); }
    },
  },
  // ---------- Mongolové: jurty z plsti, ornamenty, tug z koňských žíní ----------
  mongol: {
    st: team => {
      // malá jurta vzadu
      const y2 = () => { c.beginPath(); c.moveTo(-104, 0); c.lineTo(-104, -40); c.quadraticCurveTo(-82, -72, -60, -40); c.lineTo(-60, 0); c.closePath(); };
      solid(y2, '#e9e0cc', [-104, -72, -60, 0], () => texHide(-104, -72, -60, 0, '#e9e0cc', { seams: 1, seed: 3 }), 1);
      // velká jurta
      const wall = rectP(-74, -74, 112, 74);
      solid(wall, '#efe6d2', [-74, -74, 38, 0], () => {
        texHide(-74, -74, 38, 0, '#efe6d2', { seams: 2, seed: 7 });
        c.strokeStyle = 'rgba(120,90,50,.35)'; c.lineWidth = 1; for (let x = -74; x < 40; x += 10) { ln(x, -74, x + 10, 0); ln(x + 10, -74, x, 0); }  // mříž khana prosvítá
        c.fillStyle = team[0]; c.fillRect(-74, -62, 112, 9); c.fillStyle = '#c9a43c'; c.fillRect(-74, -54, 112, 2.4);
        c.fillStyle = team[1]; for (let x = -70; x < 38; x += 14) { c.beginPath(); c.moveTo(x, -62); c.quadraticCurveTo(x + 7, -70, x + 14, -62); c.quadraticCurveTo(x + 7, -66, x, -62); c.fill(); }
      }, 1);
      const roof = () => { c.beginPath(); c.moveTo(-82, -72); c.quadraticCurveTo(-60, -140, -18, -150); c.quadraticCurveTo(24, -140, 46, -72); c.closePath(); };
      solid(roof, '#f3ecda', [-82, -150, 46, -72], () => {
        texHide(-82, -150, 46, -72, '#f3ecda', { seams: 2, seed: 11 });
        c.strokeStyle = team[0]; c.lineWidth = 3; for (const k of [-1, 0, 1]) { c.beginPath(); c.moveTo(-18 + k * 4, -150); c.quadraticCurveTo(-18 + k * 30, -110, -18 + k * 58, -74); c.stroke(); }
        c.strokeStyle = '#7a5a2a'; c.lineWidth = 2; for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(-82, -96 + i * 8); c.quadraticCurveTo(-18, -126 + i * 8, 46, -96 + i * 8); c.stroke(); }
      }, 1.1);
      c.beginPath(); c.ellipse(-18, -150, 12, 4, 0, 0, Math.PI * 2); fo('#7a5a2a', 1.4);    // tono
      // zdobené dveře
      solid(rectP(-34, -50, 24, 50), '#c2410c', [-34, -50, -10, 0], () => { c.strokeStyle = '#facc15'; c.lineWidth = 1.4; c.strokeRect(-31, -47, 18, 44); c.beginPath(); for (let k = 0; k < 3; k++) { c.moveTo(-22, -40 + k * 13); c.arc(-22, -38 + k * 13, 3, -Math.PI / 2, Math.PI * 1.5); } c.stroke(); }, 0.8, 1.6);
      // tug (pravý okraj): kopí s koňskými žíněmi + kožená vlaječka
      rr(40, -206, 8, 206, 2); fo(linG(40, 0, 48, 0, [[0, '#9a6a3e'], [1, '#5c3a1e']]), 1.5);
      for (let k = 0; k < 5; k++) { c.beginPath(); c.ellipse(44, -170 + k * 30, 7, 3, 0, 0, Math.PI * 2); fo('#c9a43c', 1.1); }
      c.beginPath(); c.moveTo(44, -244); c.lineTo(38, -222); c.lineTo(50, -222); c.closePath(); fo('#cbd5e1', 1.4);
      rr(38, -222, 12, 5, 2); fo('#c9a43c', 1.2);
      // kotel a sedlo
      c.beginPath(); c.ellipse(-88, -10, 10, 8, 0, 0, Math.PI); fo('#3c3f46', 1.3); c.strokeStyle = '#3c3f46'; c.lineWidth = 2; ln(-98, -10, -100, -26); ln(-78, -10, -76, -26); ln(-100, -26, -76, -26);
      c.beginPath(); c.moveTo(56, -6); c.quadraticCurveTo(64, -22, 76, -10); c.lineTo(74, 0); c.lineTo(58, 0); c.closePath(); fo('#8a4a24', 1.3);
      foot(-112, 82, { seed: 15, gcol: '#7a9a3a' });
    },
    an: team => {
      fire(-88, -14, 0.6); puffs(-18, -156, 4, '140,135,128', 0.3, 0.7);
      // koňské žíně vlají
      c.fillStyle = '#2b1a0e';
      for (let k = 0; k < 9; k++) { const a = Math.sin(T * 3 + k) * 4; c.beginPath(); c.moveTo(39 + k * 1.2, -217); c.quadraticCurveTo(36 + k * 1.4 + a, -196, 34 + k * 1.6 + a * 1.4, -176); c.lineTo(36 + k * 1.6 + a * 1.4, -176); c.quadraticCurveTo(38 + k * 1.4 + a, -196, 41 + k * 1.2, -217); c.fill(); }
      flag(-18, -152, team, '#7a5a2a', 0.1);
    },
  },
};
