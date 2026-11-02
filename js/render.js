// =====================================================================
//  VYKRESLOVÁNÍ
// =====================================================================
const cv = document.getElementById('c');
let c = cv.getContext('2d');
let scl = 1, ox = 0, oy = 0, T = 0, bgC = null;
const US = 1.2;                                // měřítko jednotek
const HPBAR = [64, 64, 96, 100, 84, 150, 74];
const hpBarH = u => u.ty === 5 ? BOSSES[u.a].y + 70 : HPBAR[u.ty];               // výška ukazatele zdraví nad zemí

let GFXL = 2;                                          // nastaví se z SET.gfx (sekce Nastavení)
const GFX_DPR = [1, 1.5, 2, 2.5], GFX_FX = [150, 350, 600, 900], GFX_PART = [0.4, 0.7, 1, 1.3];
// bezpečná zóna (výřez kamery, zaoblené rohy) – hra se vejde mezi okraje env(safe-area-inset-*)
const safeProbe = document.createElement('div');
safeProbe.style.cssText = 'position:fixed;visibility:hidden;pointer-events:none;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)';
document.body.appendChild(safeProbe);
function safeInsets() { const s = getComputedStyle(safeProbe); return [s.paddingTop, s.paddingRight, s.paddingBottom, s.paddingLeft].map(v => parseFloat(v) || 0); }
function resize() {
  const dpr = Math.min(GFX_DPR[GFXL], window.devicePixelRatio || 1), [it, ir, ib, il] = safeInsets();
  cv.width = innerWidth * dpr; cv.height = innerHeight * dpr;
  cv.style.width = innerWidth + 'px'; cv.style.height = innerHeight + 'px';
  const aw = (innerWidth - il - ir) * dpr, ah = (innerHeight - it - ib) * dpr;
  scl = Math.min(aw / W, ah / H);
  ox = il * dpr + (aw - W * scl) / 2; oy = it * dpr + (ah - H * scl) / 2;
  buildBg();
}

const MX = x => mirror ? W - x : x;
const facing = s => (s === 0 ? 1 : -1) * (mirror ? -1 : 1);
const TEAMC = new Map();
function teamCol(s) {
  const me = SET.col || 0;
  let o = me;
  if (s !== mySide) {
    o = role === 'solo' || coop || TEAM || OPP.col == null ? 1 : OPP.col;
    if (o === me) o = me === 1 ? 0 : 1;    // stejné barvy by nešly rozlišit
  }
  const af = V && V.pl ? V.pl[s].af : s === mySide ? cleanAf(SET.af) : [0, 0, 0, 0, 0];
  const sk = s === mySide ? SET.skin || 0 : role !== 'solo' && !coop ? OPP.skin || 0 : 0, key = o + ':' + af.join('') + ':' + sk;
  let t = TEAMC.get(key);
  if (!t) { const S2 = SKINS[sk] || {}; t = [...(S2.col || COLS[o].c)]; t.af = af; t.sk = S2.sk; TEAMC.set(key, t); }
  return t;
}
const lerp = (a, b, t) => a + (b - a) * t;

// ---------- primitiva ----------
const OL = '#1b1d26';
function ln(x1, y1, x2, y2) { c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke(); }
function circ(x, y, r) { c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill(); }
function ell(x, y, rx, ry) { c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); c.fill(); }
function rr(x, y, w, h, r) { c.beginPath(); c.roundRect(x, y, w, h, r); }
function fo(fill, lw = 1.5) { c.fillStyle = fill; c.fill(); c.strokeStyle = OL; c.lineWidth = lw; c.lineJoin = 'round'; c.stroke(); }
function poly(pts) { c.beginPath(); c.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]); c.closePath(); }
function limb(pts, col, w) {
  c.lineCap = 'round'; c.lineJoin = 'round';
  c.beginPath(); c.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]);
  c.strokeStyle = OL; c.lineWidth = w + 2.4; c.stroke();
  c.strokeStyle = col; c.lineWidth = w; c.stroke();
}
const GC = new Map();
function lg(key, x0, y0, x1, y1, stops) {
  let g = GC.get(key);
  if (!g) { g = c.createLinearGradient(x0, y0, x1, y1); for (const [o, col] of stops) g.addColorStop(o, col); GC.set(key, g); }
  return g;
}
function rg(key, x, y, r0, r1, stops) {
  let g = GC.get(key);
  if (!g) { g = c.createRadialGradient(x, y, r0, x, y, r1); for (const [o, col] of stops) g.addColorStop(o, col); GC.set(key, g); }
  return g;
}
function glowLine(x1, y1, x2, y2, col, w) {
  if (GFXL === 0) { c.strokeStyle = col; c.lineWidth = w * 1.4; c.lineCap = 'round'; ln(x1, y1, x2, y2); return; }
  const op = c.globalCompositeOperation;
  c.globalCompositeOperation = 'lighter'; c.lineCap = 'round';
  c.strokeStyle = col; c.globalAlpha *= 0.3; c.lineWidth = w * 3.2; ln(x1, y1, x2, y2);
  c.globalAlpha /= 0.3; c.lineWidth = w * 1.4; ln(x1, y1, x2, y2);
  c.strokeStyle = '#ffffff'; c.lineWidth = w * 0.5; ln(x1, y1, x2, y2);
  c.globalCompositeOperation = op;
}
function glowDot(x, y, r, col) {
  if (GFXL === 0) { c.fillStyle = col; circ(x, y, r * 0.4); return; }
  const op = c.globalCompositeOperation; c.globalCompositeOperation = 'lighter';
  const g = c.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, '#ffffff'); g.addColorStop(0.25, col); g.addColorStop(1, 'rgba(0,0,0,0)');
  c.fillStyle = g; circ(x, y, r);
  c.globalCompositeOperation = op;
}
let seed = 7;
const srnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

// =====================================================================
//  POZADÍ (předkreslené)
// =====================================================================
// bojiště: louka, poušť, zima, sopka – barvy a výzdoba předkresleného pozadí
const FIELDS = {
  meadow:  { n: 'Louka', sky: ['#2f7fd1', '#8cc8f0', '#f5e6c4'], sun: 1, m1: ['#9bb6d3', '#e8f0f8'], m2: ['#7f9fbe', '#d8e4f0'],
             h1: ['#8fc27a', '#7aad66'], h2: ['#73b057', '#5f9a46'], gnd: ['#8a6440', '#6e4e31', '#4a3320'], grass: ['#7cc44e', '#4e8f2e', '#8fd45e', '#3f7a25'], deco: 'trees' },
  desert:  { n: 'Poušť', sky: ['#3d8fd6', '#9fd3f0', '#fbe3b0'], sun: 1.3, m1: ['#d9a066', '#d9a066'], m2: ['#c98b4f', '#c98b4f'],
             h1: ['#e8c27a', '#d9ad62'], h2: ['#dcb06a', '#c99a50'], gnd: ['#d6a960', '#c4924c', '#9c6f38'], grass: ['#e4c07a', '#c99a50', '#b8a060', '#a8803e'], deco: 'cacti' },
  winter:  { n: 'Zima', sky: ['#7d9cc4', '#c3d4e8', '#eef3f9'], sun: 0.5, m1: ['#b8c6d8', '#ffffff'], m2: ['#9fb0c6', '#f4f8fc'],
             h1: ['#e9eff7', '#d5dfec'], h2: ['#dde6f1', '#c7d3e3'], gnd: ['#e4ebf4', '#a9b6c6', '#6f6252'], grass: ['#f4f8fc', '#d6e0ec', '#ffffff', '#b9c6d6'], deco: 'snowpines' },
  swamp:   { n: 'Bažina', sky: ['#5b6f6a', '#9fb3a6', '#d9dcc4'], sun: 0.4, m1: ['#6f7f78', '#a9b8ad'], m2: ['#5d6b63', '#93a397'],
             h1: ['#6b7d4a', '#5a6b3c'], h2: ['#566a38', '#47592c'], gnd: ['#4e4a2e', '#3a3622', '#26231a'], grass: ['#5f7a36', '#3f5524', '#7a9444', '#2e4a2a'], deco: 'swamp' },
  forest:  { n: 'Les', sky: ['#3a7bbf', '#86bde0', '#e8edd0'], sun: 0.8, m1: ['#6f8fae', '#cfdde8'], m2: ['#5f7f9a', '#bfd0dc'],
             h1: ['#3f7a3a', '#346a30'], h2: ['#2f6a2c', '#245a22'], gnd: ['#5a4430', '#463422', '#2e2216'], grass: ['#4e8f2e', '#2f6a1e', '#6aa83e', '#2a5a1a'], deco: 'forest' },
  volcano: { n: 'Sopka', sky: ['#2b0f12', '#7a2a17', '#d9663a'], sun: 0, m1: ['#3b2a2a', '#ff7a1a'], m2: ['#2e2020', '#e05a12'],
             h1: ['#4a3a33', '#3a2d28'], h2: ['#3d302a', '#2c221e'], gnd: ['#3a2a22', '#2a1d17', '#1a120e'], grass: ['#4a3a2a', '#2e231a', '#5a4630', '#ff6a14'], deco: 'dead' },
};
let FIELD = 'meadow';
function setField(f) { f = FIELDS[f] ? f : 'meadow'; if (f !== FIELD) { FIELD = f; buildBg(); } }
const pickField = () => SET.field === 'random' ? Object.keys(FIELDS)[(Math.random() * Object.keys(FIELDS).length) | 0] : FIELDS[SET.field] ? SET.field : 'meadow';

function buildBg() {
  const F = FIELDS[FIELD];
  bgC = document.createElement('canvas');
  bgC.width = Math.ceil(W * scl); bgC.height = Math.ceil(H * scl);
  const main = c; c = bgC.getContext('2d'); c.scale(scl, scl);
  seed = 11;
  // obloha
  const g = c.createLinearGradient(0, 0, 0, GY);
  g.addColorStop(0, F.sky[0]); g.addColorStop(0.55, F.sky[1]); g.addColorStop(1, F.sky[2]);
  c.fillStyle = g; c.fillRect(0, 0, W, GY);
  if (F.sun) {
    const sg = c.createRadialGradient(980, 200, 10, 980, 200, 160 * F.sun);
    sg.addColorStop(0, 'rgba(255,250,220,1)'); sg.addColorStop(0.15, 'rgba(255,240,180,.9)'); sg.addColorStop(1, 'rgba(255,240,180,0)');
    c.fillStyle = sg; circ(980, 200, 160 * F.sun);
    c.fillStyle = '#fff8dc'; circ(980, 200, 30);
  }
  if (FIELD === 'volcano') {
    // sopka s lávou a kouřem v pozadí
    c.fillStyle = 'rgba(255,120,40,.25)'; circ(760, 150, 120);
    c.fillStyle = '#241819'; c.beginPath(); c.moveTo(520, GY); c.lineTo(705, 160); c.lineTo(815, 160); c.lineTo(1010, GY); c.fill();
    c.fillStyle = '#ff6a14'; c.beginPath(); c.moveTo(705, 160); c.lineTo(815, 160); c.lineTo(790, 172); c.lineTo(760, 168); c.lineTo(730, 174); c.closePath(); c.fill();
    c.strokeStyle = '#ff7a1a'; c.lineWidth = 4; c.lineCap = 'round';
    c.beginPath(); c.moveTo(745, 168); c.quadraticCurveTo(730, 250, 700, 330); c.stroke();
    c.beginPath(); c.moveTo(785, 170); c.quadraticCurveTo(800, 240, 830, 300); c.stroke();
    c.fillStyle = 'rgba(60,45,45,.75)';
    for (let i = 0; i < 6; i++) circ(760 + i * 14 - i * i * 3, 130 - i * 22, 22 + i * 6);
  }
  const L = GY - 540;                                  // krajina se posouvá se zemí
  mountains(330 + L, 150, F.m1[0], F.m1[1], 9);
  mountains(380 + L, 110, F.m2[0], F.m2[1], 13);
  hills(430 + L, 34, F.h1[0], F.h1[1], 0.9);
  for (let x = 20; x < W; x += 38 + srnd() * 50) {
    const y = 440 + L + Math.sin(x * 0.011) * 22, s = 0.7 + srnd() * 0.3;
    if (F.deco === 'trees') roundTree(x, y, s, '#5c9a48', '#4a8239');
    else if (F.deco === 'cacti') { if (srnd() < 0.5) cactus(x, y, s * 0.8); }
    else if (F.deco === 'snowpines') pine(x, y, s * 0.8, true);
    else if (F.deco === 'forest') { pine(x, y, s * 1.1); pine(x + 18, y + 4, s * 0.9); }
    else if (F.deco === 'swamp') { if (srnd() < 0.5) deadTree(x, y, s * 0.9); else reeds(x, y, s); }
    else if (srnd() < 0.5) deadTree(x, y, s);
  }
  hills(480 + L, 26, F.h2[0], F.h2[1], 1.6);
  for (let x = 10; x < W; x += 60 + srnd() * 90) {
    const y = 488 + L + Math.sin(x * 0.02) * 12, s = 0.8 + srnd() * 0.5;
    if (F.deco === 'trees') pine(x, y, s);
    else if (F.deco === 'cacti') srnd() < 0.35 ? palm(x, y, s) : cactus(x, y, s);
    else if (F.deco === 'snowpines') pine(x, y, s, true);
    else if (F.deco === 'forest') { pine(x, y, s * 1.3); if (srnd() < 0.6) roundTree(x + 26, y + 2, s, '#2f6a2c', '#245a22'); }
    else if (F.deco === 'swamp') { reeds(x, y, s * 1.2); if (srnd() < 0.4) deadTree(x + 20, y, s); }
    else deadTree(x, y, s);
  }
  if (FIELD === 'swamp') {                             // kaluže bahnité vody na povrchu
    for (let i = 0; i < 9; i++) { const x = 140 + srnd() * (W - 280); c.fillStyle = 'rgba(70,90,70,.75)'; ell(x, GY + 1, 30 + srnd() * 40, 4); c.fillStyle = 'rgba(190,210,190,.35)'; ell(x - 8, GY, 12, 1.2); }
  }
  // zem
  const gg = c.createLinearGradient(0, GY - 10, 0, H);
  gg.addColorStop(0, F.gnd[0]); gg.addColorStop(0.4, F.gnd[1]); gg.addColorStop(1, F.gnd[2]);
  c.fillStyle = gg; c.fillRect(0, GY - 4, W, H - GY + 4);
  c.fillStyle = 'rgba(0,0,0,.12)';
  for (let i = 0; i < 70; i++) { const x = srnd() * W, y = GY + 14 + srnd() * 50; ell(x, y, 3 + srnd() * 6, 1.5 + srnd() * 2); }
  c.fillStyle = 'rgba(255,255,255,.14)';
  for (let i = 0; i < 40; i++) { const x = srnd() * W, y = GY + 10 + srnd() * 50; ell(x, y, 2 + srnd() * 3, 1.5 + srnd() * 1.5); }
  buried(F);
  // povrch (tráva / písek / sníh / sopečný štěrk)
  const tg = c.createLinearGradient(0, GY - 14, 0, GY + 8);
  tg.addColorStop(0, F.grass[0]); tg.addColorStop(1, F.grass[1]);
  c.fillStyle = tg; c.beginPath(); c.moveTo(0, GY + 8);
  for (let x = 0; x <= W; x += 10) c.lineTo(x, GY - 4 + Math.sin(x * 0.07) * 2);
  c.lineTo(W, GY + 8); c.fill();
  c.fillStyle = F.grass[2];
  const blades = FIELD === 'meadow' || FIELD === 'forest' ? 260 : FIELD === 'swamp' ? 120 : FIELD === 'desert' ? 40 : FIELD === 'volcano' ? 30 : 0;
  for (let i = 0; i < blades; i++) {
    const x = srnd() * W, h = 4 + srnd() * 7;
    c.beginPath(); c.moveTo(x - 2, GY); c.lineTo(x + srnd() * 3 - 1, GY - 4 - h); c.lineTo(x + 2, GY); c.fill();
  }
  if (FIELD === 'volcano') {                           // žhnoucí praskliny
    c.strokeStyle = F.grass[3]; c.lineWidth = 2;
    for (let i = 0; i < 14; i++) { const x = srnd() * W, y = GY + 8 + srnd() * 40; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 10 + srnd() * 14, y + srnd() * 6 - 3); c.lineTo(x + 22 + srnd() * 16, y + srnd() * 8 - 4); c.stroke(); }
  } else { c.fillStyle = F.grass[3]; c.fillRect(0, GY + 6, W, 3); }
  c = main;
}
// kosti, kostry a staré zbraně zakopané v hlíně (předkreslené, jen v pozadí)
function buried(F) {
  const dark = FIELD === 'winter' ? 'rgba(80,90,110,.55)' : 'rgba(30,20,12,.45)', bone = FIELD === 'volcano' ? '#8c8178' : '#d9cfb8';
  const top = GY + 16, bot = H - 8;
  c.save(); c.globalAlpha = FIELD === 'winter' ? 0.75 : 0.85;
  const items = 26;
  for (let i = 0; i < items; i++) {
    const x = 20 + srnd() * (W - 40), y = top + srnd() * (bot - top), a = srnd() * Math.PI, k = srnd(), s = 0.8 + srnd() * 0.5;
    c.save(); c.translate(x, y); c.rotate(a - Math.PI / 2); c.scale(s, s);
    c.fillStyle = dark; ell(0, 1.5, 14, 5);                    // tmavý obrys v hlíně
    if (k < 0.3) {                                             // kost
      c.fillStyle = bone; rr(-9, -1.4, 18, 2.8, 1.4); c.fill(); circ(-9, -1.5, 2); circ(-9, 1.5, 2); circ(9, -1.5, 2); circ(9, 1.5, 2);
    } else if (k < 0.45) {                                     // lebka
      c.rotate(Math.PI / 2 - a); c.fillStyle = bone; circ(0, 0, 5.5); rr(-3.5, 3, 7, 3.5, 1); c.fill();
      c.fillStyle = '#2a1c12'; circ(-2, -0.5, 1.5); circ(2, -0.5, 1.5); c.fillRect(-0.5, 2, 1, 1.6);
    } else if (k < 0.55) {                                     // kostra
      c.rotate(Math.PI / 2 - a); c.fillStyle = bone;
      circ(-16, 0, 4.4); rr(-12, -0.8, 18, 1.8, 0.9); c.fill();
      c.strokeStyle = bone; c.lineWidth = 1.2; for (let r = 0; r < 4; r++) { c.beginPath(); c.arc(-7 + r * 3.4, 0, 3.6, 0, Math.PI * 2); c.stroke(); }
      c.lineWidth = 1.4; ln(-9, 0, -12, -7); ln(-9, 0, -6, 7); ln(6, 0, 15, -4); ln(6, 0, 15, 5);
      c.fillStyle = '#2a1c12'; circ(-17, -1, 1.1); circ(-15, -1, 1.1);
    } else if (k < 0.68) {                                     // meč
      c.fillStyle = '#8a8f98'; poly([-12, -1.2, 9, -1.2, 12, 0, 9, 1.2, -12, 1.2]); c.fill();
      c.fillStyle = '#6b4a24'; c.fillRect(-12, -4, 2.4, 8); c.fillRect(-17, -1.2, 5, 2.4);
    } else if (k < 0.78) {                                     // sekera
      c.fillStyle = '#6b4a24'; c.fillRect(-12, -1, 22, 2);
      c.fillStyle = '#7d828a'; c.beginPath(); c.moveTo(6, -1); c.quadraticCurveTo(12, -8, 14, -7); c.lineTo(14, 7); c.quadraticCurveTo(12, 8, 6, 1); c.closePath(); c.fill();
    } else if (k < 0.88) {                                     // přilba
      c.rotate(Math.PI / 2 - a); c.fillStyle = '#7d828a'; c.beginPath(); c.arc(0, 2, 6.5, Math.PI, 0); c.closePath(); c.fill();
      c.fillStyle = '#5f646d'; c.fillRect(-7.5, 1.5, 15, 1.6);
    } else {                                                   // šípy
      c.strokeStyle = '#6b4a24'; c.lineWidth = 1.2; ln(-10, 0, 10, 0); ln(-8, 3, 11, 2);
      c.fillStyle = '#5f646d'; poly([10, -2, 14, 0, 10, 2]); c.fill(); poly([11, 0, 15, 2, 11, 4]); c.fill();
    }
    c.restore();
  }
  c.restore();
}
function reeds(x, y, s) {
  c.strokeStyle = '#4a5e2a'; c.lineWidth = 1.6 * s; c.lineCap = 'round';
  for (let k = -2; k <= 2; k++) { c.beginPath(); c.moveTo(x + k * 3 * s, y); c.quadraticCurveTo(x + k * 4 * s, y - 14 * s, x + k * 6 * s, y - (22 + Math.abs(k) * -2) * s); c.stroke(); }
  c.fillStyle = '#5c3a1e'; for (const k of [-1, 1]) { rr(x + k * 5 * s - 1.5 * s, y - 24 * s, 3 * s, 8 * s, 1.5 * s); c.fill(); }
}
function cactus(x, y, s) {
  c.fillStyle = '#4e8a3c';
  rr(x - 4 * s, y - 34 * s, 8 * s, 36 * s, 4 * s); c.fill();
  rr(x - 13 * s, y - 24 * s, 6 * s, 14 * s, 3 * s); c.fill(); rr(x - 13 * s, y - 12 * s, 11 * s, 5 * s, 2.5 * s); c.fill();
  rr(x + 7 * s, y - 28 * s, 6 * s, 12 * s, 3 * s); c.fill(); rr(x + 2 * s, y - 18 * s, 11 * s, 5 * s, 2.5 * s); c.fill();
}
function palm(x, y, s) {
  c.strokeStyle = '#8a6a3c'; c.lineWidth = 4 * s; c.lineCap = 'round';
  c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + 6 * s, y - 25 * s, x + 2 * s, y - 50 * s); c.stroke();
  c.fillStyle = '#3f8f3a';
  for (let k = 0; k < 5; k++) { c.save(); c.translate(x + 2 * s, y - 50 * s); c.rotate(-2.6 + k * 0.85); ell(14 * s, 0, 16 * s, 4 * s); c.restore(); }
}
function deadTree(x, y, s) {
  c.strokeStyle = '#1e1513'; c.lineCap = 'round';
  c.lineWidth = 4 * s; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 2 * s, y - 34 * s); c.stroke();
  c.lineWidth = 2.2 * s;
  c.beginPath(); c.moveTo(x + 1 * s, y - 20 * s); c.lineTo(x - 10 * s, y - 30 * s); c.moveTo(x + 2 * s, y - 28 * s); c.lineTo(x + 12 * s, y - 38 * s); c.moveTo(x + 2 * s, y - 34 * s); c.lineTo(x - 4 * s, y - 44 * s); c.stroke();
}

function mountains(base, amp, col, snow, n) {
  const pts = [];
  for (let i = 0; i <= n; i++) pts.push([i * W / n + (srnd() - 0.5) * 60, base - amp * (0.4 + srnd() * 0.6)]);
  c.fillStyle = col; c.beginPath(); c.moveTo(0, GY);
  for (let i = 0; i < pts.length; i++) {
    const [x, y] = pts[i]; c.lineTo(x, y);
    if (i < pts.length - 1) c.lineTo((x + pts[i + 1][0]) / 2, Math.max(y, pts[i + 1][1]) + 40 + srnd() * 30);
  }
  c.lineTo(W, GY); c.fill();
  c.fillStyle = snow;
  for (const [x, y] of pts) { if (y > base - amp * 0.6) continue; c.beginPath(); c.moveTo(x, y); c.lineTo(x - 18, y + 22); c.lineTo(x - 6, y + 18); c.lineTo(x + 2, y + 26); c.lineTo(x + 18, y + 22); c.fill(); }
}
function hills(base, amp, col, col2, f) {
  const g = c.createLinearGradient(0, base - amp, 0, GY);
  g.addColorStop(0, col); g.addColorStop(1, col2);
  c.fillStyle = g; c.beginPath(); c.moveTo(0, GY);
  for (let x = 0; x <= W; x += 20) c.lineTo(x, base + Math.sin(x * 0.006 * f + base) * amp + Math.sin(x * 0.017 * f) * amp * 0.35);
  c.lineTo(W, GY); c.fill();
}
function roundTree(x, y, s, col, col2) {
  c.fillStyle = '#6b4a2e'; c.fillRect(x - 2 * s, y - 14 * s, 4 * s, 16 * s);
  c.fillStyle = col2; circ(x, y - 22 * s, 13 * s);
  c.fillStyle = col; circ(x - 4 * s, y - 25 * s, 10 * s); circ(x + 5 * s, y - 21 * s, 9 * s);
}
function pine(x, y, s, snow) {
  c.fillStyle = '#5b3d22'; c.fillRect(x - 2.5 * s, y - 10 * s, 5 * s, 12 * s);
  for (let k = 0; k < 3; k++) {
    const ya = y - (52 - k * 12) * s, yb = y - (16 - k * 2 + (2 - k) * 10) * s, hw = (14 + k * 4) * s;
    c.fillStyle = snow ? (k % 2 ? '#2a5a3a' : '#33684a') : k % 2 ? '#2f6b34' : '#3a7d3e';
    c.beginPath(); c.moveTo(x, ya); c.lineTo(x - hw, yb); c.lineTo(x + hw, yb); c.fill();
    if (snow) { c.fillStyle = '#f4f8fc'; c.beginPath(); c.moveTo(x, ya); c.lineTo(x - hw * 0.45, ya + (yb - ya) * 0.45); c.lineTo(x + hw * 0.45, ya + (yb - ya) * 0.45); c.fill(); }
  }
}
const CLOUDS = Array.from({ length: 6 }, (_, i) => ({ x: i * 240 + 40, y: 150 + (i % 3) * 34, s: 0.7 + (i % 4) * 0.18, v: 5 + (i % 3) * 3 }));
function drawClouds() {
  for (const k of CLOUDS) {
    const x = ((k.x + T * k.v) % (W + 300)) - 150, y = k.y, s = k.s;
    const ash = FIELD === 'volcano';                   // u sopky mraky popela
    c.fillStyle = ash ? 'rgba(40,28,28,.85)' : 'rgba(190,210,230,.9)'; ell(x, y + 8 * s, 58 * s, 13 * s);
    c.fillStyle = ash ? '#4a3838' : '#ffffff';
    circ(x - 30 * s, y, 18 * s); circ(x - 6 * s, y - 12 * s, 24 * s); circ(x + 22 * s, y - 4 * s, 19 * s); circ(x + 42 * s, y + 4 * s, 12 * s);
    ell(x, y + 4 * s, 55 * s, 12 * s);
  }
}
