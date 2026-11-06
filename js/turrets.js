// =====================================================================
//  VĚŽE NA ZÁKLADNĚ – 5 věků × 3 druhy, a konzole, na kterých stojí
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

const TUR = [
  // ---------- doba kamenná ----------
  (i, f) => {
    rr(-14, -1, 28, 7, 2); fo(woodG(0), 1.3); c.strokeStyle = 'rgba(40,20,5,.45)'; c.lineWidth = 0.8; ln(-12, 2, 12, 2);
    rope(-10, -1, -10, 6); rope(10, -1, 10, 6);
    if (i === 0) {           // Kamenomet: rameno vymrští kámen, pak se pomalu natáhne zpátky
      // nabito: lžíce vzadu dole, výstřel: švih dopředu nahoru
      const th = throwA(f), sw = Math.sin(T * 1.6) * 0.04 * (1 - th);
      limb([-6, 0, -2, -10], '#7a4f2a', 3.4); limb([4, 0, -2, -10], '#7a4f2a', 3.4);
      c.save(); c.translate(-2, -10); c.rotate(2.45 + sw + th * 3.03);    rr(-12, -2, 26, 4, 2); fo(woodG(1), 1.2);
      c.beginPath(); c.ellipse(14, -2, 5, 3, 0, 0, Math.PI); fo('#7a5230', 1.1);
      if (f > 0.8) stoneBall(14, -3.8, 2.9);
      rr(-16, -2.5, 8, 7, 2.5); fo('#8a5a32', 1.1); rope(-12, -2.5, -12, 4.5); c.restore();
      rope(-2, -10, -12, 0);
    } else if (i === 1) {    // Prakostroj: prak se roztočí a pustí kámen
      limb([-2, 0, -2, -14], '#8b5a2b', 3.4); limb([-2, -14, -8, -22], '#8b5a2b', 2.8); limb([-2, -14, 4, -22], '#8b5a2b', 2.8);
      const a = T * 3.6 + (f < 0.2 ? (1 - f / 0.2) * 0.8 : 0), sx = -2 + Math.cos(a) * 7, sy = -24 + Math.sin(a) * 3;   // klidné kroužení, při výstřelu krátké švihnutí
      c.strokeStyle = '#c9a66b'; c.lineWidth = 1.1; ln(-8, -22, sx, sy); ln(4, -22, sx, sy);
      c.beginPath(); c.ellipse(sx, sy, 3.4, 2.2, a, 0, Math.PI * 2); fo('#8a5a32', 1);
      if (f > 0.3) stoneBall(sx, sy - 1, 2.9);
    } else {                 // Úlomet: rameno mrští úl, nový úl naroste
      const th = throwA(f);
      c.save(); c.translate(-8, 0); c.rotate(-th * 0.9); c.translate(8, 0);
      limb([-8, 0, 10, -12], '#8b5a2b', 3.2);
      const g = f > 0.7 ? reload(f, 0.7, 1.1) : 0;
      if (g > 0) {
        c.save(); c.translate(8, -12); c.scale(g, g); c.translate(-8, 12);
        c.beginPath(); c.ellipse(8, -16, 7, 8.5, 0, 0, Math.PI * 2); fo(TG('hive', 0, -25, 0, -7, [[0, '#e3b85c'], [1, '#9a6a24']]), 1.3);
        c.strokeStyle = 'rgba(90,60,20,.7)'; c.lineWidth = 1; for (const y of [-21, -17, -13, -9]) { c.beginPath(); c.ellipse(8, y, 6.2, 1.4, 0, 0, Math.PI); c.stroke(); }
        c.fillStyle = '#2a1a0a'; circ(8, -13, 1.6); c.restore();
      }
      c.restore();
      const n = g > 0.8 ? 4 : 1;
      for (let k = 0; k < n; k++) { const a = T * 6 + k * 1.6, x = 8 + Math.cos(a) * 11, y = -18 + Math.sin(a * 1.3) * 7; c.fillStyle = '#facc15'; ell(x, y, 1.8, 1.3); c.fillStyle = '#111'; c.fillRect(x - 0.3, y - 1.2, 0.8, 2.4); c.fillStyle = 'rgba(255,255,255,.7)'; ell(x - 0.5, y - 1.5, 1, 0.6); }
    }
  },
  // ---------- středověk ----------
  (i, f) => {
    if (i === 0) {           // Katapult: rameno udeří do příčky, kolečka poskočí
      const th = throwA(f), hop = f < 0.15 ? Math.sin(f / 0.15 * Math.PI) * 1.5 : 0;
      c.save(); c.translate(0, -hop);
      rr(-14, -6, 28, 6, 2); fo(woodG(2), 1.3); wheel(-9, 1, 5); wheel(9, 1, 5);
      limb([-4, -6, 0, -16], '#7a4f2a', 3); limb([4, -6, 0, -16], '#7a4f2a', 3);
      rr(2, -22, 3, 8, 1); fo(woodG(7), 1);                              // příčka, o kterou rameno udeří
      c.save(); c.translate(0, -15); c.rotate(2.5 + Math.sin(T * 1.3) * 0.03 * (1 - th) + th * 2.95); rr(-14, -1.8, 30, 3.6, 1.8); fo(woodG(3), 1.2);
      c.beginPath(); c.ellipse(16, -2, 6.5, 3.8, 0, 0, Math.PI); fo('#6b4423', 1.1);
      if (f > 0.85) stoneBall(16, -5.6, 5.4); c.restore();
      rope(0, -15, -12, -6); rope(-2, -6, -12, -6);
      c.restore();
    } else if (i === 1) {    // Balista: tětiva vystřelí šíp, pak se znovu natáhne a vloží hořící šíp
      rr(-12, -4, 24, 8, 2); fo(woodG(4), 1.3); limb([0, -4, 0, -10], '#5c3a1e', 3.4);
      const ld = reload(f, 0.35, 0.9), sx = f < 0.35 ? 6 : 6 - ld * 14;     // tětiva: napnutá vzadu (−8), po výstřelu vpředu (6)
      c.save(); c.translate(0, -10); c.rotate(-0.12 + (f < 0.12 ? -0.06 * (1 - f / 0.12) : 0));
      rr(-12, -2.5, 26, 5, 1.5); fo(woodG(5), 1.2);
      const bend = f < 0.35 ? 2 : -2 + (1 - ld) * 4;
      c.strokeStyle = OL; c.lineWidth = 3.2; c.beginPath(); c.moveTo(8, -12); c.quadraticCurveTo(bend, 0, 8, 12); c.stroke();
      c.strokeStyle = '#8b5a2b'; c.lineWidth = 2; c.beginPath(); c.moveTo(8, -12); c.quadraticCurveTo(bend, 0, 8, 12); c.stroke();
      c.strokeStyle = '#e5e5e5'; c.lineWidth = 0.8; ln(8, -12, sx, 0); ln(sx, 0, 8, 12);
      if (f > 0.5) { const ax = sx; c.strokeStyle = '#6b4423'; c.lineWidth = 1.6; ln(ax, 0, ax + 24, 0); c.fillStyle = '#9ca3af'; poly([ax + 24, -2, ax + 28, 0, ax + 24, 2]); c.fill(); c.restore(); fire(sx + 20, -9 + 1, 0.32 * reload(f, 0.5, 0.9)); }
      else c.restore();
    } else {                 // Kotel rozžhaveného oleje: bublá a žhne, při výstřelu se nakloní a vyleje žhnoucí proud
      // trojnožka a pořádný oheň s uhlíky
      c.strokeStyle = OL; c.lineWidth = 3.4; ln(-12, 6, -7, -6); ln(12, 6, 7, -6); ln(0, 6, 0, -4);
      c.strokeStyle = '#3c3f46'; c.lineWidth = 2; ln(-12, 6, -7, -6); ln(12, 6, 7, -6); ln(0, 6, 0, -4);
      c.fillStyle = '#2a1a10'; ell(0, 5, 9, 2.2); c.fillStyle = `rgba(255,${120 + Math.sin(T * 9) * 30 | 0},40,.9)`; for (const x of [-5, -1, 3, 6]) ell(x, 4.6, 1.8, 1);
      fire(-3, 5, 0.42); fire(4, 5, 0.34);
      const tilt = throwA(f) * 0.75, hot = 0.85 + Math.sin(T * 5) * 0.15;
      c.save(); c.translate(0, -8); c.rotate(tilt); c.translate(0, 8);
      // kotel: kované železo, nýty, rozžhavené dno
      const pot = () => { c.beginPath(); c.moveTo(-14, -13); c.lineTo(14, -13); c.bezierCurveTo(14, -2, 9, 3, 0, 3.5); c.bezierCurveTo(-9, 3, -14, -2, -14, -13); c.closePath(); };
      pot(); c.fillStyle = TG('pot', -14, 0, 14, 0, [[0, '#6b7280'], [0.35, '#3c4048'], [1, '#15171c']]); c.fill();
      c.save(); pot(); c.clip(); c.fillStyle = TG('potHot', 0, -6, 0, 4, [[0, 'rgba(255,90,20,0)'], [1, 'rgba(255,90,20,.55)']]); c.fillRect(-15, -6, 30, 10); c.restore();
      outl(pot, 1.5);
      c.fillStyle = 'rgba(255,255,255,.35)'; for (const x of [-10, -4, 2, 8]) circ(x, -9, 0.8);
      c.strokeStyle = 'rgba(255,255,255,.25)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(-12, -10); c.bezierCurveTo(-12, -3, -8, 1, -3, 2); c.stroke();
      // ucha
      c.strokeStyle = OL; c.lineWidth = 2.8; for (const m of [-1, 1]) { c.beginPath(); c.arc(m * 15, -9, 3, m < 0 ? Math.PI * 0.5 : -Math.PI * 0.5, m < 0 ? Math.PI * 1.5 : Math.PI * 0.5); c.stroke(); }
      // okraj a výlevka
      c.beginPath(); c.ellipse(0, -13, 14, 3.4, 0, 0, Math.PI * 2); fo('#4b5160', 1.4);
      c.beginPath(); c.moveTo(12, -14.5); c.lineTo(20, -12); c.lineTo(13, -10.5); c.closePath(); fo('#4b5160', 1.2);
      // hladina rozžhaveného oleje
      c.beginPath(); c.ellipse(0, -13, 11.6, 2.4, 0, 0, Math.PI * 2); c.fillStyle = TG('molten', -11, 0, 11, 0, [[0, '#b91c1c'], [0.3, '#f97316'], [0.55, '#fde047'], [0.8, '#f97316'], [1, '#b91c1c']]); c.fill();
      const op = c.globalCompositeOperation; c.globalCompositeOperation = 'lighter';
      c.fillStyle = `rgba(255,200,80,${0.35 * hot})`; ell(0, -14, 12, 4);
      // bubliny, které praskají
      for (let k = 0; k < 4; k++) { const t = (T * 1.3 + k * 0.27) % 1, x = -7 + k * 4.6 + Math.sin(k * 3) * 1.5; c.strokeStyle = `rgba(255,240,170,${0.9 * (1 - t)})`; c.lineWidth = 0.9; c.beginPath(); c.arc(x, -13.2, 0.6 + t * 1.8, Math.PI, 0); c.stroke(); }
      c.globalCompositeOperation = op;
      c.restore();
      { const op3 = c.globalCompositeOperation; c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(0, -15, 0, 0, -15, 18); g.addColorStop(0, `rgba(255,150,50,${0.32 * hot})`); g.addColorStop(1, 'rgba(255,120,30,0)'); c.fillStyle = g; c.beginPath(); c.ellipse(0, -15, 18, 11, 0, 0, Math.PI * 2); c.fill(); c.globalCompositeOperation = op3; }
      // jiskry a tetelící se horký vzduch nad kotlem
      for (let k = 0; k < 5; k++) { const t = (T * 0.9 + k / 5) % 1, x = -8 + k * 4 + Math.sin(T * 3 + k * 2) * 3; c.fillStyle = `rgba(255,${180 + k * 10},60,${1 - t})`; circ(x, -16 - t * 22, 0.8 + (1 - t) * 0.5); }
      c.strokeStyle = 'rgba(255,230,200,.18)'; c.lineWidth = 1.4;
      for (let k = 0; k < 3; k++) { c.beginPath(); for (let y = 0; y < 20; y += 2) { const xx = -6 + k * 6 + Math.sin(y * 0.5 + T * 6 + k) * 1.6; y ? c.lineTo(xx, -18 - y) : c.moveTo(xx, -18); } c.stroke(); }
      // výlev: žhnoucí proud z výlevky dopředu a dolů, na konci odkapávají kapky
      const sx = Math.cos(tilt) * 20 - Math.sin(tilt) * (-4), sy = -8 + Math.sin(tilt) * 20 + Math.cos(tilt) * (-4);
      if (f > 0.04 && f < 0.75) {
        const t = Math.min(1, (f - 0.04) / 0.25), end = f > 0.5 ? (f - 0.5) / 0.25 : 0, L = 34 * t;
        const pt = u => [sx + u * 10, sy + u * u * L];
        const op2 = c.globalCompositeOperation;
        c.lineCap = 'round';
        for (const [w, col, add] of [[7, 'rgba(255,90,20,.35)', 1], [4.4, '#ea580c', 0], [2.6, '#fbbf24', 0], [1.1, '#fff7c2', 0]]) {
          c.globalCompositeOperation = add ? 'lighter' : op2; c.strokeStyle = col; c.lineWidth = w * (1 - end * 0.7);
          c.beginPath(); for (let u = end; u <= 1.001; u += 0.1) { const [x, y] = pt(u); u === end ? c.moveTo(x, y) : c.lineTo(x, y); } c.stroke();
        }
        c.globalCompositeOperation = op2;
        const [ex, ey] = pt(1); glowDot(ex, ey, 10, '#ff7a1a');
        for (let k = 0; k < 3; k++) { const q = (T * 3 + k / 3) % 1; c.fillStyle = q < 0.5 ? '#fde047' : '#f97316'; circ(ex + (k - 1) * 2, ey + q * 10, 1.4 * (1 - q * 0.5)); }
      } else if (f > 1.2 && Math.sin(T * 1.7) > 0.93) { glowDot(sx + 1, sy + 3, 4, '#ff7a1a'); c.fillStyle = '#fbbf24'; circ(sx + 1, sy + 3, 1); }   // občas ukápne
    }
  },
  // ---------- renesance ----------
  (i, f) => {
    c.beginPath(); c.moveTo(-14, 6); c.lineTo(-12, -4); c.lineTo(8, -6); c.lineTo(10, 6); c.closePath(); fo(woodG(6), 1.3);
    const kb = kickA(f) * 5;
    if (i === 2) {           // Výbušné dělo: hmoždíř se zhoupne dolů, z ústí vyrazí kouř; doutnák bomby
      c.save(); c.translate(-1, -6 + kb * 0.5); c.rotate(-0.7 + kb * 0.03); rr(-7, -6, 16, 12, 4); fo(ironG(3), 1.4); rr(6, -7, 4, 14, 1.5); fo(ironG(4), 1.2); c.fillStyle = '#0d0d0d'; ell(10.5, 0, 1.6, 5); c.restore();
      if (f < 1.2) for (let k = 0; k < 3; k++) { const t = f + k * 0.07; c.fillStyle = `rgba(215,215,215,${0.55 * (1 - f / 1.2)})`; circ(8 + t * 6, -14 - t * 18 - k * 3, 2 + t * 8); }
      flashAt(8, -12, f);
      c.beginPath(); c.arc(13, 3, 3.6, 0, Math.PI * 2); fo('#22252c', 1.1); c.fillStyle = '#facc15'; circ(15, 0, 1.2 + Math.sin(T * 20) * 0.4);
      wheel(-6, 4, 4.5);
    } else {                 // Dělo / dvojdělo: hlaveň poskočí dozadu, kouř z ústí, kouř z zápalu
      const bars = i === 1 ? [-9, -2] : [-5];
      bars.forEach((y, n) => {
        const fb = i === 1 && n === 1 ? f - 0.15 : f, kk = kickA(Math.max(0, fb)) * 5 * (fb >= 0 ? 1 : 0);
        c.save(); c.translate(-kk, 0);
        c.save(); c.translate(0, y); rr(-14, -3.5, 6, 7, 3); fo(bronzeG(0), 1.2); c.restore();
        barrel(-10, y, 26, i === 1 ? 2.8 : 3.6, 'bronze'); c.strokeStyle = '#5c3a0a'; c.lineWidth = 1; ln(-2, y - 3.5, -2, y + 3.5); ln(8, y - 3.2, 8, y + 3.2);
        c.restore();
        shotSmoke(17, y, Math.max(0, fb) + (fb < 0 ? 9 : 0));
      });
      if (f < 0.8) { c.fillStyle = `rgba(200,200,200,${0.5 * (1 - f / 0.8)})`; circ(-9, -10 - f * 12, 1.5 + f * 4); }
      wheel(-4 - kb * 0.4, 4, 5);
    }
  },
  // ---------- moderní doba ----------
  (i, f) => {
    for (let k = 0; k < 3; k++) { rr(-15 + k * 9, -1, 10, 7, 3.5); fo(TG('sb' + k, 0, -1, 0, 6, [[0, '#cbbd8e'], [1, '#9a8b5e']]), 1); }
    if (i === 0) {           // Kulomet: dávka – hlaveň se třese, záblesky, vylétají nábojnice
      const burst = f < 0.7, j = burst ? (Math.random() - 0.5) * 1.2 : 0, aim = Math.sin(T * 0.7) * 0.05;
      c.strokeStyle = OL; c.lineWidth = 2.6; ln(-2, -6, -8, 0); ln(-2, -6, 4, 0); c.strokeStyle = '#3a4224'; c.lineWidth = 1.4; ln(-2, -6, -8, 0); ln(-2, -6, 4, 0);
      c.save(); c.translate(-2, -7); c.rotate(aim); c.translate(2 + j * 0.6, 7 + j);
      rr(-10, -11, 16, 7, 1.5); fo(oliveG(1), 1.3); rr(-14, -10, 5, 5, 1); fo('#2b2b2b', 1);
      barrel(5, -7.5, 14, 1.6, 'iron', 1.1); rr(5, -9.5, 7, 4, 1); fo('#2b2f36', 1);
      if (burst && (T * 30 | 0) % 2) flashAt(20, -7.5, 0, 0.8);
      c.strokeStyle = '#3a4224'; c.lineWidth = 1.2; ln(-6, -11, -4, -14); ln(-4, -14, 2, -14);
      c.restore();
      c.fillStyle = '#c9a43c'; const off = burst ? (T * 40) % 2.6 : 0; for (let k = 0; k < 5; k++) { rr(-6 + k * 2.6 - off, -4 + k * 0.6, 1.6, 3.4, 0.5); c.fill(); }
      if (burst) for (let k = 0; k < 3; k++) { const t = ((T * 4 + k / 3) % 1); c.fillStyle = '#e5c04a'; c.save(); c.translate(-2 - t * 8, -10 + t * t * 22 - t * 10); c.rotate(t * 9); c.fillRect(-1.5, -0.6, 3, 1.2); c.restore(); }
      shotSmoke(20, -8, f, 2);
    } else if (i === 1) {    // Raketomet: raketa vylétne, vzadu vyfoukne plamen a kouř, nová se zasune
      const el = -0.22 + Math.sin(T * 0.5) * 0.04 + kickA(f) * 0.08;
      rr(-6, -8, 6, 8, 1); fo(oliveG(2), 1.2);
      c.save(); c.translate(-2, -10); c.rotate(el);
      rr(-12, -8, 26, 14, 2); fo(oliveG(3), 1.4);
      for (let r = 0; r < 2; r++) {
        const gone = r === 0 && f < 1.2, slide = r === 0 ? reload(f, 1.2, 1.6) : 1;
        c.fillStyle = '#1f2418'; rr(12, -7 + r * 7, 3, 5, 1); c.fill();
        if (!gone) { c.fillStyle = '#ef4444'; poly([11 + slide * 4, -7 + r * 7, 15 + slide * 4, -4.5 + r * 7, 11 + slide * 4, -2 + r * 7]); c.fill(); }
      }
      c.strokeStyle = 'rgba(0,0,0,.4)'; c.lineWidth = 1; ln(-12, -1, 14, -1); c.fillStyle = '#e5c04a'; c.font = 'bold 6px system-ui'; c.fillText('★', -6, -2);
      if (f < 0.25) { const op = c.globalCompositeOperation; c.globalCompositeOperation = 'lighter'; c.fillStyle = 'rgba(255,170,60,.8)'; poly([-12, -6, -24 - Math.random() * 6, -1, -12, 4]); c.fill(); c.globalCompositeOperation = op; }
      c.restore();
      shotSmoke(-14, -8, f, 4, '200,200,200', -1);
    } else {                 // Protitankové dělo: velký zpětný ráz a kouř z úsťové brzdy na obě strany
      const kk = kickA(f) * 6;
      wheel(-6, 2, 5, '#2b2f36');
      c.save(); c.translate(-kk, 0); barrel(-4, -6, 24, 2.2, 'olive', 1.2); rr(18, -8, 5, 4, 1); fo(oliveG(6), 1); c.restore();
      c.beginPath(); c.moveTo(-8, -16); c.lineTo(2, -16); c.lineTo(4, 0); c.lineTo(-10, 0); c.closePath(); fo(oliveG(5), 1.4);
      c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 0.8; ln(-8, -10, 3, -10); c.fillStyle = 'rgba(255,255,255,.4)'; for (const [x, y] of [[-6, -14], [0, -14], [-7, -3], [1, -3]]) circ(x, y, 0.7);
      if (f < 1) for (const m of [-1, 1]) { c.fillStyle = `rgba(210,210,200,${0.5 * (1 - f)})`; circ(22 + f * 4, -6 + m * (3 + f * 10), 2 + f * 6); }
    }
  },
  // ---------- budoucnost ----------
  (i, f) => {
    const hov = Math.sin(T * 2.2) * 0.8;
    c.save(); c.translate(0, hov);
    c.beginPath(); c.moveTo(-14, 6); c.lineTo(-10, -8); c.lineTo(10, -8); c.lineTo(14, 6); c.closePath(); fo(scifiG(1), 1.4);
    c.fillStyle = 'rgba(0,0,0,.3)'; c.fillRect(-11, -2, 22, 1.4);
    if (i === 0) {           // Laser: nabíjí se (sílí záře), výstřel = jasný záblesk paprsku
      const ch = reload(f, 0.2, 1.4), kk = kickA(f) * 2;
      c.save(); c.translate(-kk, 0);
      rr(-6, -14, 14, 8, 3); fo(scifiG(2), 1.3);
      rr(6, -12, 14, 4, 1.5); fo('#d1d5db', 1.1); rr(14, -13, 3, 6, 1); fo('#4b5368', 1);
      glowLine(-4, -7.5, 6, -7.5, '#38e1ff', 0.8 + ch * 0.6);
      glowDot(21, -10, 3 + ch * 3 + Math.sin(T * 8) * 0.8, '#38e1ff');
      if (f < 0.12) { glowLine(20, -10, 60, -10, '#9ff3ff', 2.4 * (1 - f / 0.12)); glowDot(21, -10, 14, '#ffffff'); }
      c.restore();
    } else if (i === 1) {    // Iontové dělo: cívky se postupně rozsvítí, výstřel = rázová vlna
      const ch = reload(f, 0.2, 1.5);
      rr(-8, -16, 16, 11, 3); fo(scifiG(3), 1.3);
      rr(4, -14, 16, 7, 2); fo('#4b5368', 1.2);
      for (let k = 0; k < 3; k++) { const on = f < 0.15 || ch > (k + 1) / 3.2; c.strokeStyle = OL; c.lineWidth = 3; ln(7 + k * 4.5, -15.5, 7 + k * 4.5, -5.5); c.strokeStyle = on ? '#f5e9ff' : '#6b4aa0'; c.lineWidth = 1.8; ln(7 + k * 4.5, -15.5, 7 + k * 4.5, -5.5); if (on) glowDot(7 + k * 4.5, -10.5, 5, '#b388ff'); }
      glowDot(21, -10.5, 4 + ch * 4, '#b388ff');
      if (f < 0.4) { c.strokeStyle = `rgba(200,160,255,${1 - f / 0.4})`; c.lineWidth = 2; c.beginPath(); c.arc(22, -10.5, 4 + f * 40, -1, 1); c.stroke(); }
    } else {                 // Plazmakanón: koule se smrští a vystřelí, pak znovu naroste
      const g = f < 0.1 ? 1 - f / 0.1 * 0.8 : 0.2 + reload(f, 0.1, 1.4) * 0.8;
      c.strokeStyle = OL; c.lineWidth = 3.2; c.beginPath(); c.arc(2, -13, 9, Math.PI * 0.6, Math.PI * 2.4); c.stroke();
      c.strokeStyle = '#9aa3b5'; c.lineWidth = 1.8; c.beginPath(); c.arc(2, -13, 9, Math.PI * 0.6, Math.PI * 2.4); c.stroke();
      c.beginPath(); c.arc(2, -13, 6, 0, Math.PI * 2); fo('#11151f', 1.2); glowDot(2, -13, 13 * g * (0.85 + Math.sin(T * 6) * 0.15), '#ff4fd8');
      c.strokeStyle = 'rgba(255,180,240,.8)'; c.lineWidth = 0.8; for (let k = 0; k < 3; k++) { const a = T * 5 * (0.5 + g) + k * 2.1; ln(2, -13, 2 + Math.cos(a) * 8 * g, -13 + Math.sin(a) * 8 * g); }
      rr(8, -9, 14, 4, 1.5); fo(scifiG(4), 1.1); glowDot(22, -7, 3 + (f < 0.15 ? 8 : 0), '#ff4fd8');
    }
    c.restore();
  },
];
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
