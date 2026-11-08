// =====================================================================
//  SEZÓNNÍ UDÁLOSTI – zapínají se samy podle data (jen vzhled a pár vtípků)
//  Halloween 20. 10. – 5. 11.: netopýři, dýně, duchové padlých, čarodějnické klobouky
//  Vánoce 15. 12. – 6. 1.: sníh, santovské čepice, dárky místo truhel, stromeček u základny
// =====================================================================
const SEASON = (() => {
  if (SET.season === false) return null;
  const d = new Date(), m = d.getMonth() + 1, day = d.getDate();
  if ((m === 10 && day >= 20) || (m === 11 && day <= 5)) return 'halloween';
  if ((m === 12 && day >= 15) || (m === 1 && day <= 6)) return 'xmas';
  return null;
})();
const SEASON_N = { halloween: '🎃 Halloween', xmas: '🎄 Vánoce' };
let ghosts = [];

// čepice na hlavách vojáků (volá human() v souřadnicích hlavy)
function seasonHat() {
  if (SEASON === 'xmas') {
    c.beginPath(); c.moveTo(-7.5, -48); c.quadraticCurveTo(-2, -62, 9, -60); c.quadraticCurveTo(4, -56, 7.5, -48); c.closePath(); fo('#dc2626', 1);
    rr(-8.5, -50, 17, 4, 2); fo('#f8fafc', 0.9); c.fillStyle = '#f8fafc'; circ(9.5, -60, 2.4);
  } else if (SEASON === 'halloween') {
    c.beginPath(); c.ellipse(0, -49, 11, 2.6, 0, 0, Math.PI * 2); fo('#1f1530', 1);
    c.beginPath(); c.moveTo(-6, -49); c.quadraticCurveTo(-3, -60, 4, -66); c.quadraticCurveTo(2, -58, 6, -49); c.closePath(); fo('#2e1f47', 1);
    c.fillStyle = '#f97316'; c.fillRect(-5.5, -51.5, 11, 2);
  }
}
// truhla se zlatem jako dýně s bonbony / dárek
function seasonChest(x) {
  const y = GY - 2, b = Math.abs(Math.sin(T * 3)) * 3;
  c.fillStyle = SEASON === 'xmas' ? 'rgba(255,255,255,.25)' : 'rgba(255,140,40,.3)'; circ(x, y - 12, 22 + b);
  if (SEASON === 'halloween') {
    c.beginPath(); c.ellipse(x, y - 11, 15, 12, 0, 0, Math.PI * 2); fo(lg('pump', 0, y - 23, 0, y, [[0, '#fb923c'], [1, '#c2410c']]), 1.5);
    c.strokeStyle = 'rgba(120,40,0,.5)'; c.lineWidth = 1.2; for (const k of [-6, 0, 6]) { c.beginPath(); c.ellipse(x + k, y - 11, 4, 12, 0, 0, Math.PI * 2); c.stroke(); }
    c.fillStyle = '#3f2a0a'; poly([x - 7, y - 14, x - 3, y - 14, x - 5, y - 18]); c.fill(); poly([x + 3, y - 14, x + 7, y - 14, x + 5, y - 18]); c.fill();
    c.beginPath(); c.moveTo(x - 7, y - 8); c.lineTo(x - 4, y - 5); c.lineTo(x - 1, y - 8); c.lineTo(x + 2, y - 5); c.lineTo(x + 5, y - 8); c.lineTo(x + 7, y - 7); c.stroke();
    c.fillStyle = 'rgba(255,200,60,.8)'; c.fill();
    rr(x - 1.5, y - 27, 3, 6, 1); fo('#3f6212', 1);
  } else {
    rr(x - 13, y - 22, 26, 22, 3); fo(lg('gift', 0, y - 22, 0, y, [[0, '#ef4444'], [1, '#991b1b']]), 1.5);
    c.fillStyle = '#facc15'; c.fillRect(x - 2, y - 22, 4, 22); c.fillRect(x - 13, y - 13, 26, 4);
    c.strokeStyle = '#facc15'; c.lineWidth = 2.4; c.beginPath(); c.ellipse(x - 5, y - 26 - b * 0.3, 5, 3, -0.4, 0, Math.PI * 2); c.stroke(); c.beginPath(); c.ellipse(x + 5, y - 26 - b * 0.3, 5, 3, 0.4, 0, Math.PI * 2); c.stroke();
  }
}
// duch stoupající z padlého vojáka (Halloween)
function seasonDie(x) { if (SEASON === 'halloween' && Math.random() < 0.35 && ghosts.length < 12) ghosts.push({ x, y: GY - 30, l: 2.4, s: Math.random() < 0.5 ? -1 : 1 }); }
// efekty na bojišti: netopýři, lucerny u základen, duchové; vánoční stromeček a sníh
function seasonFx(dt) {
  if (!SEASON || !V) return;
  if (SEASON === 'halloween') {
    c.fillStyle = 'rgba(80,30,120,.12)'; c.fillRect(-EXW, HUD, W + 2 * EXW, H - HUD);
    c.fillStyle = '#140a1f';
    for (let i = 0; i < 6; i++) {
      const x = ((T * (40 + i * 9) + i * 230) % (W + 160)) - 80, y = HUD + 60 + (i % 3) * 45 + Math.sin(T * 3 + i) * 14, f = Math.sin(T * 14 + i) * 5;
      c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x - 6, y - 4 - f, x - 13, y - f); c.quadraticCurveTo(x - 7, y + 1, x, y + 3);
      c.quadraticCurveTo(x + 7, y + 1, x + 13, y - f); c.quadraticCurveTo(x + 6, y - 4 - f, x, y); c.fill();
    }
    for (const s of [0, 1]) for (const o of [-95, 95]) {
      const x = MX(BX[s]) + o, y = GY - 2;
      c.beginPath(); c.ellipse(x, y - 9, 11, 9, 0, 0, Math.PI * 2); fo('#ea580c', 1.3);
      c.fillStyle = `rgba(255,${200 + Math.sin(T * 9 + o) * 40},60,.95)`; poly([x - 6, y - 12, x - 2, y - 12, x - 4, y - 15]); c.fill(); poly([x + 2, y - 12, x + 6, y - 12, x + 4, y - 15]); c.fill();
      c.fillRect(x - 5, y - 7, 10, 2);
    }
    for (const g of ghosts) {
      g.l -= dt; g.y -= 40 * dt; const a = Math.min(1, g.l), x = MX(g.x) + Math.sin(T * 4 + g.x) * 8 * g.s;
      c.globalAlpha = a * 0.75; c.fillStyle = '#f1f5f9';
      c.beginPath(); c.arc(x, g.y, 9, Math.PI, 0); c.lineTo(x + 9, g.y + 12); for (let k = 0; k < 4; k++) c.lineTo(x + 9 - (k + 0.5) * 4.5, g.y + (k % 2 ? 12 : 8)); c.lineTo(x - 9, g.y + 12); c.closePath(); c.fill();
      c.fillStyle = '#1e1b2e'; circ(x - 3, g.y - 1, 1.6); circ(x + 3, g.y - 1, 1.6); c.globalAlpha = 1;
    }
    ghosts = ghosts.filter(g => g.l > 0);
  } else if (SEASON === 'xmas') {
    for (const s of [0, 1]) {
      const x = MX(BX[s]) + (s === mySide ? 105 : -105) * (mirror ? -1 : 1), y = GY;
      rr(x - 3, y - 10, 6, 10, 1); fo('#6b4423', 1);
      for (let k = 0; k < 3; k++) { poly([x - 22 + k * 5, y - 8 - k * 14, x, y - 32 - k * 14, x + 22 - k * 5, y - 8 - k * 14]); fo('#166534', 1.2); }
      c.fillStyle = '#facc15'; circ(x, y - 62, 4);
      ['#ef4444', '#3b82f6', '#facc15', '#f8fafc'].forEach((col, k) => { c.fillStyle = Math.sin(T * 3 + k * 1.7 + s) > 0 ? col : 'rgba(255,255,255,.3)'; circ(x - 10 + k * 7, y - 14 - (k % 2) * 16, 2.2); });
    }
    c.fillStyle = 'rgba(255,255,255,.85)';
    for (let i = 0; i < 50; i++) { const x = (i * 97 + T * 20 * (1 + (i % 3))) % W, y = HUD + ((i * 53 + T * (30 + (i % 5) * 8)) % (H - HUD)); circ(x, y, 1.2 + (i % 3) * 0.5); }
  }
}
// oznámení v menu (jednou za sezónu)
if (SEASON && !load('aow-season', {})[SEASON + new Date().getFullYear()]) {
  const st = load('aow-season', {}); st[SEASON + new Date().getFullYear()] = 1; store('aow-season', st);
  toasts.push({ a: { n: SEASON === 'halloween' ? 'Duchové, dýně, netopýři a čarodějnické klobouky – do 5. listopadu!' : 'Sníh, santovské čepice a dárky místo truhel – do 6. ledna!' }, h: SEASON_N[SEASON] + ' V BRUTAL AGES', l: 7, tip: 1 });
}
