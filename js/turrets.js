// =====================================================================
//  VĚŽE – společné pomůcky: přechody, kola, provazy, hlavně, kouř, křivky animací,
//  podstavce a konzole pod věžemi. Kresba jednotlivých věží je v turret-art.js.
//  Souřadnice: počátek je střed věže, +x míří na nepřítele, ústí hlavně ≈ (16, −4)
//  (tam vylétají střely – slotPos v core.js), konzole má horní hranu v y = +6.
// =====================================================================
const TG = (k, x0, y0, x1, y1, st) => lg('tu' + k, x0, y0, x1, y1, st);
const woodG = k => TG('w' + k, 0, -12, 0, 8, [[0, '#a8743e'], [1, '#5c3a1e']]);
const ironG = k => TG('i' + k, 0, -10, 0, 6, [[0, '#7c828c'], [0.5, '#4b5160'], [1, '#22252c']]);
const bronzeG = k => TG('b' + k, 0, -9, 0, 3, [[0, '#f0c674'], [0.45, '#b8862f'], [1, '#5c3a0a']]);
const oliveG = k => TG('o' + k, 0, -14, 0, 8, [[0, '#7d8a52'], [1, '#3a4224']]);
const scifiG = k => TG('s' + k, 0, -14, 0, 8, [[0, '#c6ceda'], [0.5, '#7c8698'], [1, '#2f3544']]);
function wheel(x, y, r, col = '#6b4423') {
  c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); fo(col, 1.3);
  c.strokeStyle = tone(col, -0.35); c.lineWidth = 1.2; for (let k = 0; k < 4; k++) { const a = k * Math.PI / 4; ln(x + Math.cos(a) * r, y + Math.sin(a) * r, x - Math.cos(a) * r, y - Math.sin(a) * r); }
  c.fillStyle = '#2b2f36'; circ(x, y, r * 0.3); c.strokeStyle = '#3c3f46'; c.lineWidth = 1.4; c.beginPath(); c.arc(x, y, r - 0.6, 0, Math.PI * 2); c.stroke();
}
function rope(x0, y0, x1, y1) { c.strokeStyle = '#c9a66b'; c.lineWidth = 1.3; ln(x0, y0, x1, y1); c.strokeStyle = 'rgba(90,60,20,.6)'; c.lineWidth = 0.6; c.setLineDash([1.2, 1.2]); ln(x0, y0, x1, y1); c.setLineDash([]); }
function stoneBall(x, y, r) { c.save(); c.translate(x, y); c.beginPath(); c.arc(0, 0, r, 0, Math.PI * 2); fo(TG('ball' + r, -r, -r, r, r, [[0, '#b4aca0'], [1, '#5a544c']]), 1.2); c.fillStyle = 'rgba(255,255,255,.35)'; circ(-r * 0.35, -r * 0.35, r * 0.3); c.restore(); }
const BARP = { bronze: ['#f0c674', '#b8862f', '#5c3a0a'], iron: ['#7c828c', '#4b5160', '#22252c'], olive: ['#7d8a52', '#56603a', '#2f361e'] };
function barrel(x0, y, len, r, pal, lw = 1.3) {      // hlaveň: přechod spočítaný vůči vlastní ose
  const P = BARP[pal] || BARP.iron, g = TG('bar' + pal + r, 0, -r - 1, 0, r + 1, [[0, P[0]], [0.45, P[1]], [1, P[2]]]);
  c.save(); c.translate(0, y);
  rr(x0, -r, len, r * 2, r * 0.6); fo(g, lw);
  c.fillStyle = 'rgba(255,255,255,.3)'; c.fillRect(x0 + 2, -r + 1, len - 4, Math.max(1, r * 0.35));
  rr(x0 + len - 3, -r - 1, 4, r * 2 + 2, 1); fo(g, 1); c.fillStyle = '#0d0d0d'; circ(x0 + len + 0.5, 0, r * 0.55);
  c.restore();
}
function glowOrb(x, y, r, col) { c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); fo('#11151f', 1.2); glowDot(x, y, r * 2.2 * (0.85 + Math.sin(T * 6 + x) * 0.15), col); }

// animace: f = sekundy od posledního výstřelu (99 = dlouho nestřílela)
const TSHOT = new Map();                                         // "strana|slot" → čas výstřelu (T)
const throwA = f => f < 0.12 ? f / 0.12 : f < 0.8 ? 1 - (f - 0.12) / 0.68 : 0;    // rameno vpřed a zpátky
const kickA = f => f < 0.04 ? f / 0.04 : f < 0.45 ? Math.pow(1 - (f - 0.04) / 0.41, 2) : 0;   // zpětný ráz
const reload = (f, t0, t1) => f < t0 ? 0 : f > t1 ? 1 : (f - t0) / (t1 - t0);    // 0 → 1 během nabíjení
function shotSmoke(x, y, f, n = 3, col = '215,215,215', sp = 1) {
  if (f > 1.2) return;
  for (let k = 0; k < n; k++) { const t = f + k * 0.07; c.fillStyle = `rgba(${col},${Math.max(0, 0.55 * (1 - f / 1.2))})`; circ(x + t * 12 * sp + k * 2, y - t * 7 - k * 1.5, 2 + t * 8); }
}
function flashAt(x, y, f, s = 1, col = '#ffd27a') { if (f > 0.07) return; const op = c.globalCompositeOperation; c.globalCompositeOperation = 'lighter'; c.fillStyle = col; c.beginPath(); c.moveTo(x, y - 3 * s); c.lineTo(x + 9 * s, y); c.lineTo(x, y + 3 * s); c.closePath(); c.fill(); glowDot(x + 2, y, 8 * s, col); c.globalCompositeOperation = op; }

// ---------- společné podstavce věží ----------
function baseLashed() {          // doba kamenná: dřevěný podstavec svázaný provazy
  rr(-14, -1, 28, 7, 2); fo(woodG(0), 1.3); c.strokeStyle = 'rgba(40,20,5,.45)'; c.lineWidth = 0.8; ln(-12, 2, 12, 2);
  rope(-10, -1, -10, 6); rope(10, -1, 10, 6);
}
function baseCarriage() {        // renesance: dřevěná lafeta
  c.beginPath(); c.moveTo(-14, 6); c.lineTo(-12, -4); c.lineTo(8, -6); c.lineTo(10, 6); c.closePath(); fo(woodG(6), 1.3);
}
function baseSandbags() {        // moderní doba: hnízdo z pytlů s pískem
  for (let k = 0; k < 3; k++) { rr(-15 + k * 9, -1, 10, 7, 3.5); fo(TG('sb' + k, 0, -1, 0, 6, [[0, '#cbbd8e'], [1, '#9a8b5e']]), 1); }
}
function baseHover(draw) {       // budoucnost: levitující podstavec, zbraň se s ním vznáší
  c.save(); c.translate(0, Math.sin(T * 2.2) * 0.8);
  c.beginPath(); c.moveTo(-14, 6); c.lineTo(-10, -8); c.lineTo(10, -8); c.lineTo(14, 6); c.closePath(); fo(scifiG(1), 1.4);
  c.fillStyle = 'rgba(0,0,0,.3)'; c.fillRect(-11, -2, 22, 1.4);
  draw(); c.restore();
}
// samotné věže (kresba + animace každé zvlášť) jsou v turret-art.js
// konzole pod věží podle materiálu věku (y = horní hrana slotu)
function ledge(a, y) {
  c.save(); c.translate(0, y); y = 0;          // přechody jsou spočítané vůči slotu
  if (a === 0) {             // trám s podpěrou a provazem
    rr(36, y + 8, 34, 6, 2); fo(woodG(9), 1.3); c.strokeStyle = 'rgba(40,20,5,.4)'; c.lineWidth = 0.8; ln(38, y + 11, 68, y + 11);
    limb([37, y + 27, 52, y + 14], '#6b4423', 3); rope(40, y + 9, 40, y + 15);
  } else if (a <= 2) {       // kamenná krakorcová římsa
    rr(34, y + 8, 36, 7, 1.5); fo(TG('st' + a, 0, y + 8, 0, y + 15, [[0, '#b8b2a6'], [1, '#6d675d']]), 1.3);
    c.strokeStyle = 'rgba(0,0,0,.3)'; c.lineWidth = 0.8; for (const x of [46, 58]) ln(x, y + 8, x, y + 15);
    c.beginPath(); c.moveTo(36, y + 15); c.lineTo(48, y + 15); c.quadraticCurveTo(40, y + 18, 38, y + 26); c.lineTo(36, y + 26); c.closePath(); fo('#8a847a', 1.1);
  } else if (a === 3) {      // ocelová plošina na nosníku
    rr(34, y + 8, 36, 5, 1); fo(ironG(7), 1.3); c.fillStyle = 'rgba(255,255,255,.4)'; for (let x = 37; x < 70; x += 6) circ(x, y + 10.5, 0.7);
    c.strokeStyle = OL; c.lineWidth = 3; ln(38, y + 13, 50, y + 13); ln(38, y + 24, 50, y + 13); c.strokeStyle = '#4b5160'; c.lineWidth = 1.6; ln(38, y + 13, 50, y + 13); ln(38, y + 24, 50, y + 13);
  } else {                   // levitující plošina se zářícím okrajem
    rr(34, y + 8, 36, 5, 2.5); fo(scifiG(9), 1.3); glowLine(37, y + 13.5, 67, y + 13.5, '#38e1ff', 0.8);
    c.globalAlpha = 0.5 + Math.sin(T * 4 + y) * 0.2; glowDot(52, y + 18, 9, '#38e1ff'); c.globalAlpha = 1;
  }
  c.restore();
}
