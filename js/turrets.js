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

const TUR = [
  // ---------- doba kamenná ----------
  (i) => {
    // dřevěný podstavec svázaný provazy
    rr(-14, -1, 28, 7, 2); fo(woodG(0), 1.3); c.strokeStyle = 'rgba(40,20,5,.45)'; c.lineWidth = 0.8; ln(-12, 2, 12, 2);
    rope(-10, -1, -10, 6); rope(10, -1, 10, 6);
    if (i === 0) {           // Kamenomet: kyvadlové rameno s kamenem
      const sw = Math.sin(T * 1.6) * 0.06;
      limb([-6, 0, -2, -10], '#7a4f2a', 3.4); limb([4, 0, -2, -10], '#7a4f2a', 3.4);
      c.save(); c.translate(-2, -10); c.rotate(-0.55 + sw); rr(-12, -2, 26, 4, 2); fo(woodG(1), 1.2);
      c.beginPath(); c.ellipse(14, -2, 5, 3, 0, 0, Math.PI); fo('#7a5230', 1.1); stoneBall(14, -4, 4); stoneBall(-11, 2, 3.4); c.restore();
      rope(-2, -10, -12, 0);
    } else if (i === 1) {    // Prakostroj: vidlice s točícím se prakem
      limb([-2, 0, -2, -14], '#8b5a2b', 3.4); limb([-2, -14, -8, -22], '#8b5a2b', 2.8); limb([-2, -14, 4, -22], '#8b5a2b', 2.8);
      const a = T * 9, sx = -2 + Math.cos(a) * 9, sy = -24 + Math.sin(a) * 4;
      c.strokeStyle = '#c9a66b'; c.lineWidth = 1.1; ln(-8, -22, sx, sy); ln(4, -22, sx, sy);
      c.beginPath(); c.ellipse(sx, sy, 3.4, 2.2, a, 0, Math.PI * 2); fo('#8a5a32', 1); stoneBall(sx, sy - 1, 2);
    } else {                 // Úlomet: koš s úlem a roj včel
      limb([-8, 0, 10, -12], '#8b5a2b', 3.2);
      c.beginPath(); c.ellipse(8, -16, 7, 8.5, 0, 0, Math.PI * 2); fo(TG('hive', 0, -25, 0, -7, [[0, '#e3b85c'], [1, '#9a6a24']]), 1.3);
      c.strokeStyle = 'rgba(90,60,20,.7)'; c.lineWidth = 1; for (const y of [-21, -17, -13, -9]) { c.beginPath(); c.ellipse(8, y, 6.2, 1.4, 0, 0, Math.PI); c.stroke(); }
      c.fillStyle = '#2a1a0a'; circ(8, -13, 1.6);
      for (let k = 0; k < 4; k++) { const a = T * 6 + k * 1.6, x = 8 + Math.cos(a) * 11, y = -18 + Math.sin(a * 1.3) * 7; c.fillStyle = '#facc15'; ell(x, y, 1.8, 1.3); c.fillStyle = '#111'; c.fillRect(x - 0.3, y - 1.2, 0.8, 2.4); c.fillStyle = 'rgba(255,255,255,.7)'; ell(x - 0.5, y - 1.5, 1, 0.6); }
    }
  },
  // ---------- středověk ----------
  (i) => {
    if (i === 0) {           // Katapult na kolech
      rr(-14, -6, 28, 6, 2); fo(woodG(2), 1.3); wheel(-9, 1, 5); wheel(9, 1, 5);
      limb([-4, -6, 0, -16], '#7a4f2a', 3); limb([4, -6, 0, -16], '#7a4f2a', 3);
      c.save(); c.translate(0, -15); c.rotate(-0.75 + Math.sin(T * 1.3) * 0.04); rr(-14, -1.8, 30, 3.6, 1.8); fo(woodG(3), 1.2);
      c.beginPath(); c.ellipse(16, -2, 5.5, 3.4, 0, 0, Math.PI); fo('#6b4423', 1.1); stoneBall(16, -4.5, 4.3); c.restore();
      rope(0, -15, -12, -6); rope(-2, -6, -12, -6);
    } else if (i === 1) {    // Ohnivé šípy: balista s hořícím šípem
      rr(-12, -4, 24, 8, 2); fo(woodG(4), 1.3); limb([0, -4, 0, -10], '#5c3a1e', 3.4);
      c.save(); c.translate(0, -10); c.rotate(-0.12);
      rr(-12, -2.5, 26, 5, 1.5); fo(woodG(5), 1.2);
      c.strokeStyle = OL; c.lineWidth = 3.2; c.beginPath(); c.moveTo(8, -12); c.quadraticCurveTo(-2, 0, 8, 12); c.stroke();
      c.strokeStyle = '#8b5a2b'; c.lineWidth = 2; c.beginPath(); c.moveTo(8, -12); c.quadraticCurveTo(-2, 0, 8, 12); c.stroke();
      c.strokeStyle = '#e5e5e5'; c.lineWidth = 0.8; ln(8, -12, -8, 0); ln(-8, 0, 8, 12);
      c.strokeStyle = '#6b4423'; c.lineWidth = 1.6; ln(-8, 0, 16, 0); c.fillStyle = '#9ca3af'; poly([16, -2, 20, 0, 16, 2]); c.fill();
      c.restore();
      fire(19, -9, 0.32);
    } else {                 // Kotel vroucího oleje na trojnožce
      c.strokeStyle = OL; c.lineWidth = 3; ln(-10, 6, -6, -6); ln(10, 6, 6, -6); c.strokeStyle = '#3c3f46'; c.lineWidth = 1.8; ln(-10, 6, -6, -6); ln(10, 6, 6, -6);
      fire(0, 6, 0.38);
      c.beginPath(); c.moveTo(-13, -12); c.lineTo(13, -12); c.quadraticCurveTo(12, 2, 0, 3); c.quadraticCurveTo(-12, 2, -13, -12); c.closePath(); fo(ironG(1), 1.4);
      c.fillStyle = '#1a1208'; ell(0, -12, 12, 3); c.fillStyle = TG('oil', 0, -14, 0, -10, [[0, '#4a3410'], [1, '#2a1a05']]); ell(0, -12, 10, 2.2);
      for (let k = 0; k < 3; k++) { const t = (T * 0.8 + k / 3) % 1; c.fillStyle = `rgba(220,220,220,${0.35 * (1 - t)})`; circ(-5 + k * 5 + Math.sin(T * 2 + k) * 2, -14 - t * 14, 2 + t * 3); }
      c.strokeStyle = '#2b2f36'; c.lineWidth = 1.6; c.beginPath(); c.arc(0, -12, 10, Math.PI * 1.1, Math.PI * 1.9); c.stroke();
      c.beginPath(); c.moveTo(12, -12); c.lineTo(17, -10); c.lineTo(13, -8); c.closePath(); fo(ironG(2), 1);       // výlevka
    }
  },
  // ---------- renesance ----------
  (i) => {
    // lafeta s kolem
    c.beginPath(); c.moveTo(-14, 6); c.lineTo(-12, -4); c.lineTo(8, -6); c.lineTo(10, 6); c.closePath(); fo(woodG(6), 1.3);
    if (i === 2) {           // Výbušné dělo: hmoždíř
      c.save(); c.translate(-1, -6); c.rotate(-0.7); rr(-7, -6, 16, 12, 4); fo(ironG(3), 1.4); rr(6, -7, 4, 14, 1.5); fo(ironG(4), 1.2); c.fillStyle = '#0d0d0d'; ell(10.5, 0, 1.6, 5); c.restore();
      c.beginPath(); c.arc(13, 3, 3.6, 0, Math.PI * 2); fo('#22252c', 1.1); c.fillStyle = '#facc15'; circ(15, 0, 1.2 + Math.sin(T * 20) * 0.4);
      wheel(-6, 4, 4.5);
    } else {
      const bars = i === 1 ? [-9, -2] : [-5];
      for (const y of bars) { c.save(); c.translate(0, y); rr(-14, -3.5, 6, 7, 3); fo(bronzeG(0), 1.2); c.restore(); barrel(-10, y, 26, i === 1 ? 2.8 : 3.6, 'bronze'); c.strokeStyle = '#5c3a0a'; c.lineWidth = 1; ln(-2, y - 3.5, -2, y + 3.5); ln(8, y - 3.2, 8, y + 3.2); }
      wheel(-4, 4, 5);
    }
  },
  // ---------- moderní doba ----------
  (i) => {
    // pytle s pískem jako hnízdo
    for (let k = 0; k < 3; k++) { rr(-15 + k * 9, -1, 10, 7, 3.5); fo(TG('sb' + k, 0, -1, 0, 6, [[0, '#cbbd8e'], [1, '#9a8b5e']]), 1); }
    if (i === 0) {           // Kulomet na trojnožce s pásem nábojů
      c.strokeStyle = OL; c.lineWidth = 2.6; ln(-2, -6, -8, 0); ln(-2, -6, 4, 0); c.strokeStyle = '#3a4224'; c.lineWidth = 1.4; ln(-2, -6, -8, 0); ln(-2, -6, 4, 0);
      rr(-10, -11, 16, 7, 1.5); fo(oliveG(1), 1.3); rr(-14, -10, 5, 5, 1); fo('#2b2b2b', 1);
      barrel(5, -7.5, 14, 1.6, 'iron', 1.1); rr(5, -9.5, 7, 4, 1); fo('#2b2f36', 1);
      c.fillStyle = '#c9a43c'; for (let k = 0; k < 5; k++) { rr(-6 + k * 2.6, -4 + k * 0.6, 1.6, 3.4, 0.5); c.fill(); }
      c.strokeStyle = '#3a4224'; c.lineWidth = 1.2; ln(-6, -11, -4, -14); ln(-4, -14, 2, -14);
    } else if (i === 1) {    // Raketomet: lafeta 2×3 trubic
      rr(-6, -8, 6, 8, 1); fo(oliveG(2), 1.2);
      c.save(); c.translate(-2, -10); c.rotate(-0.22);
      rr(-12, -8, 26, 14, 2); fo(oliveG(3), 1.4);
      for (let r = 0; r < 2; r++) { c.fillStyle = '#1f2418'; rr(12, -7 + r * 7, 3, 5, 1); c.fill(); c.fillStyle = '#ef4444'; poly([15, -7 + r * 7, 19, -4.5 + r * 7, 15, -2 + r * 7]); c.fill(); }
      c.strokeStyle = 'rgba(0,0,0,.4)'; c.lineWidth = 1; ln(-12, -1, 14, -1); c.fillStyle = '#e5c04a'; c.font = 'bold 6px system-ui'; c.fillText('★', -6, -2);
      c.restore();
    } else {                 // Protitankové dělo se štítem
      wheel(-6, 2, 5, '#2b2f36');
      barrel(-4, -6, 24, 2.2, 'olive', 1.2);
      c.beginPath(); c.moveTo(-8, -16); c.lineTo(2, -16); c.lineTo(4, 0); c.lineTo(-10, 0); c.closePath(); fo(oliveG(5), 1.4);
      c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 0.8; ln(-8, -10, 3, -10); c.fillStyle = 'rgba(255,255,255,.4)'; for (const [x, y] of [[-6, -14], [0, -14], [-7, -3], [1, -3]]) circ(x, y, 0.7);
      rr(18, -8, 5, 4, 1); fo(oliveG(6), 1);                    // úsťová brzda
    }
  },
  // ---------- budoucnost ----------
  (i) => {
    // levitující podstava
    c.beginPath(); c.moveTo(-14, 6); c.lineTo(-10, -8); c.lineTo(10, -8); c.lineTo(14, 6); c.closePath(); fo(scifiG(1), 1.4);
    c.fillStyle = 'rgba(0,0,0,.3)'; c.fillRect(-11, -2, 22, 1.4);
    if (i === 0) {           // Laser
      rr(-6, -14, 14, 8, 3); fo(scifiG(2), 1.3);
      rr(6, -12, 14, 4, 1.5); fo('#d1d5db', 1.1); rr(14, -13, 3, 6, 1); fo('#4b5368', 1);
      glowDot(21, -10, 5 + Math.sin(T * 8) * 1.2, '#38e1ff'); glowLine(-4, -7.5, 6, -7.5, '#38e1ff', 0.8);
    } else if (i === 1) {    // Iontové dělo s cívkami
      rr(-8, -16, 16, 11, 3); fo(scifiG(3), 1.3);
      rr(4, -14, 16, 7, 2); fo('#4b5368', 1.2);
      for (let k = 0; k < 3; k++) { c.strokeStyle = OL; c.lineWidth = 3; ln(7 + k * 4.5, -15.5, 7 + k * 4.5, -5.5); c.strokeStyle = (T * 3 + k) % 3 < 1 ? '#e9d5ff' : '#b388ff'; c.lineWidth = 1.8; ln(7 + k * 4.5, -15.5, 7 + k * 4.5, -5.5); }
      glowDot(21, -10.5, 7, '#b388ff');
    } else {                 // Plazmakanón: koule plazmatu v kleci
      c.strokeStyle = OL; c.lineWidth = 3.2; c.beginPath(); c.arc(2, -13, 9, Math.PI * 0.6, Math.PI * 2.4); c.stroke();
      c.strokeStyle = '#9aa3b5'; c.lineWidth = 1.8; c.beginPath(); c.arc(2, -13, 9, Math.PI * 0.6, Math.PI * 2.4); c.stroke();
      glowOrb(2, -13, 6, '#ff4fd8');
      c.strokeStyle = 'rgba(255,180,240,.8)'; c.lineWidth = 0.8; for (let k = 0; k < 3; k++) { const a = T * 5 + k * 2.1; ln(2, -13, 2 + Math.cos(a) * 8, -13 + Math.sin(a) * 8); }
      rr(8, -9, 14, 4, 1.5); fo(scifiG(4), 1.1); glowDot(22, -7, 4, '#ff4fd8');
    }
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
