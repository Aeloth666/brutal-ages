// =====================================================================
//  POSTAVY
// =====================================================================
const SKIN = '#f2c38f', SKIN_D = '#d39b66';
const PANTS = [['#7a4d2a', '#5c381d'], ['#5d6470', '#454b55'], ['#e9e2cf', '#c9c0a8'], ['#55663a', '#424f2c'], ['#3a4152', '#2a2f3c']];
const BOOTS = ['#5c3a1e', '#3c3f46', '#222222', '#2d2a24', '#1e222c'];

// oblečení národů přes celé tělo; barva týmu zůstává vidět (pás, šerpa, páska, nárameníky)
// trup: x ±7.8, y -36.5 (ramena) … -18 (pas); kreslí se po posunu o „bob“
const SKIN3 = [SKIN, SKIN_D, '#ffd9ad'];
let SK = SKIN3;
const torsoPath = () => { c.beginPath(); c.moveTo(-6.5, -18); c.lineTo(-7.8, -31); c.quadraticCurveTo(-6.5, -36.5, 0, -36.5); c.quadraticCurveTo(6.5, -36.5, 7.8, -31); c.lineTo(6.5, -18); c.closePath(); };
const belt = (team, y = -21) => { c.fillStyle = team[1]; c.fillRect(-6.8, y, 13.6, 2.8); c.fillStyle = '#e5c04a'; c.fillRect(-1.3, y - 0.2, 2.6, 3.2); };
const OUTFIT = {
  wolf: { pants: ['#6b6f78', '#55585f'], boots: '#3f3f46', torso(team) {
    torsoPath(); fo(lg('wolfT', 0, -37, 0, -18, [[0, '#a1a5ad'], [1, '#6b6f78']]), 1.1);
    c.fillStyle = '#d4d4d8'; for (let x = -6; x <= 6; x += 3) poly([x - 1.5, -22, x, -18.5, x + 1.5, -22]);
    c.fillStyle = '#5b5f68'; for (const [x, y] of [[-4, -32], [2, -29], [-1, -25], [4, -34]]) poly([x, y, x + 2, y + 3, x - 1, y + 2]);
    belt(team);
  } },
  bear: { pants: ['#5c3a1e', '#47301a'], boots: '#2e1d0e', torso(team) {
    torsoPath(); fo('#8a5a2e', 1.1);
    c.beginPath(); c.moveTo(-9.5, -27); c.quadraticCurveTo(-9, -38, 0, -38.5); c.quadraticCurveTo(9, -38, 9.5, -27); c.quadraticCurveTo(0, -31, -9.5, -27); c.closePath();
    fo(lg('bearF', 0, -39, 0, -27, [[0, '#7a4a22'], [1, '#4a2c12']]), 1.1);
    c.fillStyle = '#f5f0e0'; for (let i = -3; i <= 3; i++) poly([i * 2, -30.5, i * 2 + 0.8, -27.5, i * 2 + 1.6, -30.5]);
    belt(team);
  } },
  eagle: { pants: ['#a0703c', '#86592e'], boots: '#6b4423', torso(team) {
    torsoPath(); fo(lg('eagleT', 0, -37, 0, -18, [[0, '#d2a46a'], [1, '#a07040']]), 1.1);
    c.strokeStyle = '#7a5230'; c.lineWidth = 0.8; for (let x = -5.5; x <= 5.5; x += 1.6) ln(x, -19, x, -16.5);
    c.save(); c.beginPath(); torsoPath(); c.clip(); c.strokeStyle = team[0]; c.lineWidth = 2.6; ln(-7, -35, 7, -21); c.restore();
    for (const [x, col] of [[-3, '#f5f0e0'], [0, '#b91c1c'], [3, '#f5f0e0']]) { c.fillStyle = col; c.beginPath(); c.ellipse(x, -31.5, 1, 2.6, 0, 0, Math.PI * 2); c.fill(); }
  } },
  viking: { pants: ['#5a6578', '#48515f'], boots: '#5c3a1e', torso(team) {
    torsoPath(); fo(lg('vikT', 0, -37, 0, -18, [[0, '#8a6a46'], [1, '#5e4528']]), 1.1);
    c.strokeStyle = 'rgba(40,25,10,.5)'; c.lineWidth = 0.8; ln(-4, -33, -4, -21); ln(4, -33, 4, -21);
    c.beginPath(); c.ellipse(0, -35.5, 8.4, 3, 0, 0, Math.PI * 2); fo('#9ca3af', 1);
    c.fillStyle = '#d1d5db'; for (let x = -6; x <= 6; x += 2.4) circ(x, -36.4, 1.1);
    belt(team);
  } },
  samurai: { pants: ['#2a2a33', '#1e1e25'], boots: '#141418', sleeve: '#2a2a33', torso(team) {
    torsoPath(); fo(lg('samT', 0, -37, 0, -18, [[0, '#7f1d1d'], [1, '#450a0a']]), 1.1);
    c.strokeStyle = '#111'; c.lineWidth = 0.9; for (let y = -33; y < -19; y += 2.6) ln(-7.2, y, 7.2, y);
    c.strokeStyle = '#e5c04a'; c.lineWidth = 0.6; for (let x = -5; x <= 5; x += 2.5) ln(x, -34, x, -20);
    rr(-9.5, -36, 5, 8, 1.2); fo(team[0], 1); rr(4.5, -36, 5, 8, 1.2); fo(team[0], 1);
  } },
  mongol: { pants: ['#3a2a20', '#2e2219'], boots: '#6b3f1d', sleeve: t => t[1], torso(team) {
    c.beginPath(); c.moveTo(-6.5, -18); c.lineTo(-8, -10); c.lineTo(8, -10); c.lineTo(6.5, -18); c.closePath(); fo(team[1], 1.1);   // šos dlouhého pláště
    torsoPath(); fo(lg('monT' + team[0], 0, -37, 0, -18, [[0, team[2]], [0.4, team[0]], [1, team[1]]]), 1.1);
    c.strokeStyle = '#e5c04a'; c.lineWidth = 1.3; c.beginPath(); c.moveTo(-1, -36); c.quadraticCurveTo(3, -30, 6.5, -21); c.stroke();
    c.fillStyle = '#7a5230'; ell(0, -36, 7, 1.8); c.fillRect(-8, -11.5, 16, 2);
    c.fillStyle = '#facc15'; c.fillRect(-6.8, -21.5, 13.6, 2.6);
  } },
  conq: { pants: ['#d4a017', '#b8860b'], boots: '#3a2a1a', sleeve: '#8a8f98', torso(team) {
    torsoPath(); fo(lg('conqT', -8, -37, 8, -18, [[0, '#f1f5f9'], [0.45, '#a3aab4'], [1, '#5f646d']]), 1.2);
    c.strokeStyle = 'rgba(40,44,52,.6)'; c.lineWidth = 1; ln(0, -36, 0, -20);
    c.fillStyle = '#e5e7eb'; for (const [x, y] of [[-5, -33], [5, -33], [-5, -22], [5, -22]]) circ(x, y, 0.8);
    c.save(); torsoPath(); c.clip(); c.strokeStyle = team[0]; c.lineWidth = 2.4; ln(-7, -22, 7, -32); c.restore();
  } },
  pirate: { pants: ['#3b4a6b', '#2f3b56'], boots: '#3a2410', sleeve: '#f1ece0', torso(team) {
    torsoPath(); fo('#f1ece0', 1.1);
    c.fillStyle = team[0]; c.beginPath(); c.moveTo(-7.8, -31); c.quadraticCurveTo(-6.5, -36.5, -2.5, -36.3); c.lineTo(-2, -19); c.lineTo(-6.5, -18); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(7.8, -31); c.quadraticCurveTo(6.5, -36.5, 2.5, -36.3); c.lineTo(2, -19); c.lineTo(6.5, -18); c.closePath(); c.fill();
    c.strokeStyle = '#4a2c14'; c.lineWidth = 1.6; ln(-6, -35, 6, -20);
    c.fillStyle = '#b91c1c'; c.fillRect(-6.8, -21.5, 13.6, 3); c.fillStyle = '#e5c04a'; circ(4.5, -27.5, 1);
  } },
  janissary: { pants: ['#f1ece0', '#d9d2c0'], boots: '#ca8a04', sleeve: t => t[1], torso(team) {
    c.beginPath(); c.moveTo(-6.5, -18); c.lineTo(-8.5, -8); c.lineTo(8.5, -8); c.lineTo(6.5, -18); c.closePath(); fo(team[1], 1.1);    // dlouhý kaftan
    torsoPath(); fo(lg('janT' + team[0], 0, -37, 0, -18, [[0, team[2]], [0.4, team[0]], [1, team[1]]]), 1.1);
    c.strokeStyle = '#e5c04a'; c.lineWidth = 1.2; ln(0, -36, 0, -9);
    c.fillStyle = '#facc15'; rr(-7, -23, 14, 4, 1.4); c.fill(); c.fillStyle = '#b45309'; c.fillRect(-7, -21.5, 14, 1);
  } },
  tank: { pants: ['#1f2937', '#111827'], boots: '#0b0f17', sleeve: '#1f2937', torso(team) {
    torsoPath(); fo(lg('tankT', 0, -37, 0, -18, [[0, '#374151'], [1, '#111827']]), 1.1);
    c.strokeStyle = '#4b5563'; c.lineWidth = 1; ln(0, -35, 0, -19);
    rr(-5.5, -31, 4, 3, 0.8); fo('#111827', 0.8); rr(1.5, -31, 4, 3, 0.8); fo('#111827', 0.8);
    c.fillStyle = team[0]; c.fillRect(-7.5, -34, 15, 2); c.fillStyle = '#262626'; c.fillRect(-6.6, -20.5, 13.2, 2.6);
  } },
  partisan: { pants: ['#5b5b5b', '#4a4a4a'], boots: '#3a2a1a', sleeve: '#6b4a2b', torso(team) {
    torsoPath(); fo(lg('partT', 0, -37, 0, -18, [[0, '#86613b'], [1, '#5a3f22']]), 1.1);
    c.strokeStyle = '#3a2a1a'; c.lineWidth = 2.2; ln(-6, -35, 6, -20);
    c.fillStyle = '#d4a017'; for (let k = 0; k < 5; k++) circ(-4.6 + k * 2.4, -33 + k * 3, 0.9);
    c.fillStyle = team[0]; c.fillRect(-7.6, -31, 2.4, 5);
  } },
  para: { pants: ['#5f6b3a', '#4f5a30'], boots: '#1f1f1f', sleeve: '#5f6b3a', torso(team) {
    torsoPath(); fo('#6b7a40', 1.1);
    c.save(); torsoPath(); c.clip();
    for (const [x, y, r, col] of [[-4, -32, 3, '#4a3a22'], [3, -26, 3.4, '#3f4b29'], [-2, -22, 2.6, '#7a6a40'], [5, -34, 2.2, '#4a3a22']]) { c.fillStyle = col; ell(x, y, r, r * 0.7); }
    c.restore();
    c.strokeStyle = '#1f1f1f'; c.lineWidth = 1.4; ln(-5, -36, -5, -19); ln(5, -36, 5, -19); ln(-5, -27, 5, -27);
    rr(-2, -33, 4, 3.4, 0.8); fo(team[0], 0.8);
  } },
  alien: { skin: ['#7dd87a', '#4f9f4c', '#b5f0a8'], pants: ['#5b2a86', '#4a2270'], boots: '#2e1450', torso(team) {
    torsoPath(); fo(lg('alT', 0, -37, 0, -18, [[0, '#7c3aed'], [1, '#3b0f6b']]), 1.1);
    glowLine(-5, -34, 0, -27, team[0], 1); glowLine(5, -34, 0, -27, team[0], 1); glowLine(0, -27, 0, -20, team[0], 1);
  } },
  robot: { skin: ['#b8c0cc', '#7d8694', '#e5e9ef'], pants: ['#7d8694', '#5f6875'], boots: '#3a4150', sleeve: '#9aa3b0', torso(team) {
    torsoPath(); fo(lg('robT', -8, -37, 8, -18, [[0, '#e5e9ef'], [0.5, '#9aa3b0'], [1, '#5f6875']]), 1.2);
    c.strokeStyle = 'rgba(40,46,58,.6)'; c.lineWidth = 0.9; ln(-7, -28, 7, -28); ln(-6.8, -23, 6.8, -23);
    c.fillStyle = '#4b5563'; for (const [x, y] of [[-5.5, -34], [5.5, -34], [-5.5, -25.5], [5.5, -25.5]]) circ(x, y, 0.8);
    glowDot(0, -31.5, 4, team[0]);
  } },
  marine: { pants: ['#3f4a5c', '#323b4a'], boots: '#1e222c', sleeve: t => t[1], torso(team) {
    torsoPath(); fo(lg('marT' + team[0], 0, -37, 0, -18, [[0, team[2]], [0.45, team[0]], [1, team[1]]]), 1.2);
    rr(-4.5, -33, 9, 8, 2); fo('#3f4a5c', 1);
    c.beginPath(); c.ellipse(-8, -34, 5, 3.6, -0.3, 0, Math.PI * 2); fo(team[0], 1.2);
    c.beginPath(); c.ellipse(8, -34, 5, 3.6, 0.3, 0, Math.PI * 2); fo(team[0], 1.2);
    c.fillStyle = '#e5c04a'; c.fillRect(-1, -32, 2, 6);
  } },
};
const outfitOf = (team, age) => (team.af && OUTFIT[(AGEFAC[age][team.af[age]] || {}).g]) || null;

// konec končetiny zkrácený o poloměr zaobleného konce – noha pak končí v botě/kopytu, ne pod zemí
const tipIn = (x1, y1, x2, y2, r) => { const d = Math.hypot(x2 - x1, y2 - y1) || 1, k = Math.max(0, d - r) / d; return [x1 + (x2 - x1) * k, y1 + (y2 - y1) * k]; };
function leg(phase, walk, col, boot, sit) {
  let kx, ky, fx, fy, rot = 0;
  if (sit) { kx = 9; ky = -17; fx = 9; fy = -6; }
  else {
    const s = walk ? Math.sin(phase) : 0, v = walk ? Math.cos(phase) : 0;
    const a = s * 0.55, bend = v > 0 ? 0.9 * v : 0.05;
    kx = Math.sin(a) * 9.5; ky = -19 + Math.cos(a) * 9.5;
    fx = kx + Math.sin(a - bend) * 9.5; fy = ky + Math.cos(a - bend) * 9.5;
    // náklon chodidla: na konci kroku se zvedá pata (odraz od špičky), ve vzduchu se špička
    // postupně zvedne a noha došlápne na patu, pak se chodidlo položí naplocho
    if (walk) rot = v > 0 ? 0.1 - 0.4 * s : s < -0.4 ? (-s - 0.4) / 0.6 * 0.5 : s > 0.6 ? -0.3 * (s - 0.6) / 0.4 : 0;
  }
  // bota se otáčí kolem kotníku a zvedne se jen tolik, aby podrážka nešla pod zem; noha končí v kotníku
  const ax = fx, ay = fy - 2.5, sn = Math.sin(rot), cs = Math.cos(rot);
  const soleY = Math.max(ay + (-2.8) * sn + 2.8 * cs, ay + 5.5 * sn + 2.8 * cs);
  const lift = sit ? 0 : Math.max(0, soleY - 0.3);
  limb([0, -19, kx, ky, ax, ay - lift], col, 4.6);
  // bota: kotník nahoře, podrážka na zemi, špička dopředu
  c.save();
  c.translate(ax, ay - lift); c.rotate(rot); c.translate(-ax, -ay);
  c.beginPath(); c.moveTo(fx - 2.8, fy + 0.3); c.lineTo(fx - 2.6, fy - 4.4); c.quadraticCurveTo(fx, fy - 5.2, fx + 2.2, fy - 3.4);
  c.quadraticCurveTo(fx + 5.6, fy - 2.6, fx + 5.6, fy - 0.6); c.lineTo(fx + 5.4, fy + 0.3); c.closePath(); fo(boot, 1.2);
  c.restore();
}

// brutální režim: které části těla mrtvole chybí (nastavuje se jen při kreslení mrtvol)
let GORE = null, NO_RIDER = false, NO_LEGS = false, NO_BHEAD = false;
function stump(x, y, r) {
  c.beginPath(); c.ellipse(x, y, r, r * 0.7, 0, 0, Math.PI * 2); fo('#8b0a0a', 1);
  c.fillStyle = '#d61f1f'; ell(x - r * 0.2, y - r * 0.15, r * 0.55, r * 0.35);
  c.fillStyle = '#f1e6d0'; circ(x + r * 0.25, y, r * 0.28);
}

const THROWN = ['stone', 'axe'];                       // střely, které se házejí rukou (luky a pušky míří)
function human(team, age, ty, ph, at, st, o = {}) {
  const walk = st === 0 && !o.sit;
  const bob = walk ? -Math.abs(Math.cos(ph)) * 1.6 : 0;
  const OF = outfitOf(team, age), G = GORE;
  const P = (OF && OF.pants) || PANTS[age], BT = (OF && OF.boots) || BOOTS[age];
  const sleeve = OF && OF.sleeve ? (typeof OF.sleeve === 'function' ? OF.sleeve(team) : OF.sleeve) : null;
  SK = team.sk || (OF && OF.skin) || SKIN3;
  // zadní noha a ruka
  if (G && G.legB) stump(-1, -19, 2.8); else leg(ph + Math.PI, walk, P[1], BT, o.sit);
  const backAng = ty === 1 ? 1.25 : 0.25 - (walk ? Math.sin(ph) * 0.5 : 0);
  if (G && G.armB) stump(-1, -33 + bob, 2.4);
  else { c.save(); c.translate(-1, -33 + bob); c.rotate(-backAng); limb([0, 0, 0.6, 6.5, 0, 12], sleeve || SK[1], 3.6); c.restore(); }
  if (age === 1 && ty === 0) shield(team, bob, true);
  if (o.hero) {                                       // plášť hrdiny
    const fl = walk ? Math.sin(ph * 2) * 2 : 0;
    c.beginPath(); c.moveTo(-5, -35 + bob); c.quadraticCurveTo(-14, -26, -17 + fl, -12); c.lineTo(-9 + fl, -13); c.quadraticCurveTo(-6, -22, 3, -34 + bob); c.closePath();
    fo(lg('cape' + team[0], 0, -36, 0, -12, [[0, team[0]], [1, team[1]]]), 1.2);
  }
  // trup
  c.save(); c.translate(0, bob);
  c.beginPath(); c.moveTo(-6.5, -18); c.lineTo(-7.8, -31); c.quadraticCurveTo(-6.5, -36.5, 0, -36.5);
  c.quadraticCurveTo(6.5, -36.5, 7.8, -31); c.lineTo(6.5, -18); c.closePath();
  fo(lg('torso' + team[0], -8, -37, 8, -18, [[0, team[2]], [0.35, team[0]], [1, team[1]]]));
  if (OF && OF.torso) OF.torso(team, ty); else torsoGear(team, age, ty);
  if (o.elite) { c.strokeStyle = OL; c.lineWidth = 4; ln(-6.5, -35, 6, -20); c.strokeStyle = '#e5c04a'; c.lineWidth = 2.4; ln(-6.5, -35, 6, -20); }
  c.restore();
  if (G && G.leg) stump(1, -19, 3); else leg(ph, walk, P[0], BT, o.sit);
  // hlava
  if (G && G.head) stump(1, -37.5, 3.6);
  else { c.save(); c.translate(1, bob); head(team, age, o); if (SEASON) seasonHat(); c.restore(); }
  // přední ruka se zbraní
  if (G && G.arm) { stump(2, -33 + bob, 2.6); return; }
  let ang;
  if (ty !== 1) {
    const t = 1 - at;
    ang = at <= 0 ? 0.7 + (walk ? Math.sin(ph) * 0.12 : 0)
      : t < 0.35 ? lerp(0.7, 2.7, t / 0.35) : t < 0.6 ? lerp(2.7, 0.15, (t - 0.35) / 0.25) : lerp(0.15, 0.7, (t - 0.6) / 0.4);
  } else if (THROWN.includes((weapOf(team, age) || {}).proj || AGES[age].units[1].p)) {
    // vrhači (kameny, sekery): v klidu ruka napřažená za hlavou, při útoku máchnutí dopředu a návrat pro další
    const t = 1 - at;
    ang = at <= 0 ? 3.5 + (walk ? Math.sin(ph) * 0.08 : 0)
      : t < 0.2 ? lerp(1.1, 0.45, t / 0.2) : t < 0.45 ? 0.45 : lerp(0.45, 3.5, (t - 0.45) / 0.55);
  } else ang = Math.PI / 2 + at * 0.3;
  c.save(); c.translate(2, -33 + bob); c.rotate(-ang);
  const len = ty === 1 ? 11 - at * 2 : 12;
  limb([0, 0, 0.9, len / 2, 0, len], sleeve || SK[0], 3.8);
  c.translate(0, len);
  if (ty >= 0) weapon(team, age, ty, at);
  c.beginPath(); c.arc(0, 0, 2.5, 0, Math.PI * 2); fo(SK[0], 1.2);
  c.restore();
}

function shield(team, bob) {
  c.save(); c.translate(-6, -26 + bob);
  c.beginPath(); c.moveTo(-6, -8); c.lineTo(6, -8); c.lineTo(6, 2); c.quadraticCurveTo(0, 11, -6, 2); c.closePath();
  fo(team[1], 1.4);
  c.fillStyle = '#e5c04a'; c.fillRect(-1, -7, 2, 13); c.fillRect(-5, -4, 10, 2);
  c.restore();
}

// tajemství: 7× klepnout na nápis v menu
function chickenHead() {
  c.fillStyle = '#f1f5f9'; c.fillRect(-2, -38.5, 4, 4);
  c.beginPath(); c.arc(0, -42.5, 6.8, 0, Math.PI * 2); fo(rg('chick', -1.5, -44.5, 1, 8, [[0, '#ffffff'], [1, '#d6d3d1']]));
  c.beginPath(); c.moveTo(-3, -48.5); c.arc(-1.5, -50, 2, Math.PI, 0); c.arc(1.5, -51, 2, Math.PI, 0); c.arc(4, -49.5, 1.8, Math.PI, 0); c.lineTo(5, -47.5); c.closePath(); fo('#dc2626', 1);
  c.beginPath(); c.moveTo(6, -44); c.lineTo(11, -42.2); c.lineTo(6, -40.5); c.closePath(); fo('#f59e0b', 1);
  c.beginPath(); c.ellipse(6, -38.8, 1.6, 2.4, 0, 0, Math.PI * 2); fo('#dc2626', 0.8);
  c.fillStyle = '#111'; circ(3.2, -44, 1.2); c.fillStyle = '#fff'; circ(3.5, -44.4, 0.4);
}
function head(team, age, o) {
  if (SET.chicken) return chickenHead();
  c.fillStyle = SK[1]; c.fillRect(-2, -38.5, 4, 4);
  c.beginPath(); c.arc(0, -42.5, 6.8, 0, Math.PI * 2);
  fo(rg('skin' + SK[0], -1.5, -44.5, 1, 8, [[0, SK[2]], [1, SK[1]]]));
  c.beginPath(); c.arc(-2.6, -41.8, 1.7, 0, Math.PI * 2); fo(SK[0], 1);
  c.fillStyle = '#fff'; ell(3.7, -43.2, 1.9, 2.1);
  c.fillStyle = '#1a1a1a'; circ(4.3, -43, 1);
  c.strokeStyle = '#3a2a1a'; c.lineWidth = 1.3; c.lineCap = 'round'; ln(2.2, -46, 5.6, -45.4);
  c.strokeStyle = '#8a4a3a'; c.lineWidth = 1; ln(3.6, -39.2, 5.6, -39.6);
  if (o.super) return superHelmet(team);
  if (o.hero) {                                       // koruna nad pokrývkou hlavy
    c.beginPath(); c.moveTo(-6, -50); c.lineTo(-6, -56); c.lineTo(-3, -53); c.lineTo(0, -58); c.lineTo(3, -53); c.lineTo(6, -56); c.lineTo(6, -50); c.closePath();
    fo(lg('crown', 0, -58, 0, -50, [[0, '#fff3b0'], [1, '#ca8a04']]), 1.1);
    c.fillStyle = '#dc2626'; circ(0, -52, 1.2);
  }
  switch (age) {
    case 0: // divoké vlasy a vousy
      c.beginPath(); c.moveTo(-7, -42); c.lineTo(-8.5, -47); c.lineTo(-5, -46.5); c.lineTo(-5, -51); c.lineTo(-1, -48.5);
      c.lineTo(1, -52.5); c.lineTo(3.5, -48.5); c.lineTo(7.5, -50); c.lineTo(6.5, -46); c.quadraticCurveTo(2, -48, -3, -44); c.lineTo(-4.5, -40); c.closePath();
      fo('#4a2f18', 1.2);
      c.beginPath(); c.moveTo(1, -38.5); c.quadraticCurveTo(4, -34.5, 7, -38); c.lineTo(6.6, -40.5); c.quadraticCurveTo(4, -38.5, 1.5, -40); c.closePath(); fo('#4a2f18', 1);
      c.fillStyle = '#f5f0e0'; c.save(); c.translate(-4, -49); c.rotate(-0.5); rr(-3, -1, 6, 2, 1); c.fill(); circ(-3, 0, 1.3); circ(3, 0, 1.3); c.restore();
      break;
    case 1: // železná přilba
      c.beginPath(); c.arc(0, -43, 7.6, Math.PI, 0); c.lineTo(7.8, -41); c.lineTo(-7.8, -41); c.closePath();
      fo(lg('helm1', -6, -50, 6, -41, [[0, '#e5e8ec'], [0.5, '#a3aab4'], [1, '#6b7280']]));
      rr(2.6, -42, 1.8, 6, 0.8); fo('#9aa1ab', 1);
      if (o.plume) { c.beginPath(); c.moveTo(-1, -50); c.quadraticCurveTo(-10, -58, -16, -50); c.quadraticCurveTo(-9, -53, -2, -47); c.closePath(); fo(team[0], 1.2); }
      break;
    case 2: // trojrohý klobouk s perem
      c.beginPath(); c.moveTo(-10, -46); c.quadraticCurveTo(0, -43, 10, -46.5); c.lineTo(6, -51); c.quadraticCurveTo(0, -57, -6, -51); c.closePath();
      fo('#1f1f24', 1.3);
      c.strokeStyle = '#d4af37'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(-9.5, -46.3); c.quadraticCurveTo(0, -43.4, 9.5, -46.7); c.stroke();
      c.beginPath(); c.moveTo(-4, -51); c.quadraticCurveTo(-12, -60, -15, -53); c.quadraticCurveTo(-9, -55, -3, -49); c.closePath(); fo(team[0], 1);
      c.fillStyle = '#7a5230'; c.beginPath(); c.moveTo(-6.5, -45); c.lineTo(-7.5, -39); c.lineTo(-4.5, -40); c.closePath(); c.fill();
      break;
    case 3: // vojenská přilba
      c.beginPath(); c.arc(0.5, -43.5, 8, Math.PI * 0.98, Math.PI * 0.02); c.lineTo(9.5, -42.6); c.lineTo(-8.6, -42.6); c.closePath();
      fo(lg('helm3', -6, -52, 6, -42, [[0, '#7c8f55'], [1, '#46542e']]));
      c.strokeStyle = 'rgba(30,40,20,.6)'; c.lineWidth = 0.8;
      for (let i = -6; i <= 6; i += 3) ln(i, -50, i + 2, -43);
      c.strokeStyle = '#2b2b2b'; c.lineWidth = 1; ln(-5, -42, -3, -37);
      break;
    case 4: // sci-fi helma (mimozemšťané a roboti ukazují vlastní hlavu)
      if (team.af && /^(alien|robot)$/.test(AGEFAC[4][team.af[4]].g || '')) break;
      c.beginPath(); c.arc(0, -43, 8, 0, Math.PI * 2);
      fo(lg('helm4', -7, -51, 7, -35, [[0, '#6b7590'], [1, '#262b38']]));
      rr(1, -46, 8.5, 4.5, 2); c.fillStyle = '#0b1220'; c.fill();
      glowLine(2.5, -43.7, 7.5, -43.7, '#38e1ff', 1.6);
      c.fillStyle = team[0]; rr(-7.5, -48, 3, 8, 1.2); c.fill();
      break;
  }
  const g = team.af && (AGEFAC[age][team.af[age]] || {}).g;
  if (g) facGear(g);
}
// doplněk národa na hlavě (hlava má střed v 0,-42.5 a poloměr asi 7)
function facGear(g) {
  switch (g) {
    case 'wolf':                                     // vlčí kožešina s ušima
      c.beginPath(); c.ellipse(0, -46, 8.6, 5, 0, Math.PI, 0); c.lineTo(8.6, -44); c.lineTo(-8.6, -44); c.closePath(); fo('#8b8f98', 1.1);
      for (const m of [-1, 1]) { poly([m * 3, -50, m * 7, -57, m * 8, -49]); fo('#6b7078', 1); }
      c.fillStyle = '#d4d4d8'; ell(7, -45, 3, 1.6); break;
    case 'bear':                                     // medvědí hlava jako kápě
      c.beginPath(); c.ellipse(-0.5, -46.5, 9.4, 6, 0, Math.PI, 0); c.lineTo(9, -43); c.lineTo(-9.8, -43); c.closePath(); fo('#6b4423', 1.1);
      for (const m of [-1, 1]) { c.beginPath(); c.arc(m * 6, -52, 2.6, 0, Math.PI * 2); fo('#6b4423', 1); }
      c.fillStyle = '#3a2410'; ell(8.6, -45.5, 2.4, 1.6); break;
    case 'eagle':                                    // čelenka s orlími pery
      c.fillStyle = '#b91c1c'; c.fillRect(-8, -47.5, 16, 2.4);
      for (const [x, a] of [[-5, -0.5], [-1, -0.15], [3, 0.2]]) { c.save(); c.translate(x, -48); c.rotate(a); c.beginPath(); c.ellipse(0, -6, 1.8, 6, 0, 0, Math.PI * 2); fo('#f5f0e0', 0.9); c.fillStyle = '#3a2a1a'; c.fillRect(-1.6, -12, 3.2, 3); c.restore(); }
      break;
    case 'viking':                                   // rohy
      for (const m of [-1, 1]) {
        c.beginPath(); c.moveTo(m * 5, -47); c.quadraticCurveTo(m * 12, -49, m * 11, -57); c.quadraticCurveTo(m * 9, -51, m * 3, -49.5); c.closePath();
        fo('#f2ead6', 1.1);
      }
      break;
    case 'samurai':                                  // zlatý půlměsíc (maedate)
      c.beginPath(); c.moveTo(-8, -55); c.quadraticCurveTo(1, -48, 9, -56); c.quadraticCurveTo(1, -51, -8, -55); c.closePath();
      fo('#facc15', 1); c.fillStyle = '#b91c1c'; circ(0.5, -51, 1.5); break;
    case 'mongol':                                   // kožešinový lem a červený knoflík
      c.fillStyle = '#7a5230'; ell(0, -47.5, 8.6, 2.8); c.fillStyle = '#a07a4a';
      for (let i = -7; i <= 7; i += 2.3) circ(i, -48.3, 1.1);
      c.fillStyle = '#b91c1c'; circ(0, -55, 1.6); break;
    case 'conq':                                     // morion se hřebenem
      c.beginPath(); c.moveTo(-11, -46); c.quadraticCurveTo(0, -42, 11, -46.5); c.quadraticCurveTo(7, -51, 0, -51); c.quadraticCurveTo(-7, -51, -11, -46); c.closePath();
      fo(lg('morion', 0, -52, 0, -44, [[0, '#e5e8ec'], [1, '#7d828a']]), 1.1);
      c.beginPath(); c.moveTo(-5, -50.5); c.quadraticCurveTo(0, -58, 5, -50.5); c.closePath(); fo('#a3aab4', 1); break;
    case 'pirate':                                   // červený šátek a páska přes oko
      c.beginPath(); c.ellipse(0, -46.5, 8, 4.6, 0, Math.PI, 0); c.lineTo(8, -45); c.lineTo(-8, -45); c.closePath(); fo('#b91c1c', 1);
      c.fillStyle = '#fef3c7'; for (const [x, y] of [[-4, -48], [1, -49], [5, -47]]) circ(x, y, 0.9);
      c.beginPath(); c.moveTo(-8, -46); c.lineTo(-12, -42); c.lineTo(-10, -47); c.closePath(); fo('#b91c1c', 0.8);
      c.strokeStyle = '#111'; c.lineWidth = 1; ln(-6, -46, 7, -41.5); c.fillStyle = '#111'; ell(4.2, -43, 2.2, 1.9); break;
    case 'janissary':                                // vysoká bílá čepice (börk)
      c.beginPath(); c.moveTo(-6, -47); c.lineTo(-4, -60); c.quadraticCurveTo(-12, -58, -13, -48); c.lineTo(-8, -48); c.closePath(); fo('#f8fafc', 1);
      rr(-8, -50, 16, 4, 1.5); fo('#ca8a04', 1); c.fillStyle = '#b91c1c'; circ(0, -48, 1.4); break;
    case 'tank':                                     // černý baret a sluchátka
      c.beginPath(); c.ellipse(-1, -48.5, 9, 3.6, -0.15, 0, Math.PI * 2); fo('#1f2937', 1);
      c.fillStyle = '#374151'; rr(-9, -45, 3, 6, 1); c.fill(); break;
    case 'partisan':                                 // čepice s rudou hvězdou
      c.beginPath(); c.ellipse(0, -48, 8.4, 4.2, 0, Math.PI, 0); c.lineTo(8.4, -47); c.lineTo(-8.4, -47); c.closePath(); fo('#4b5d2e', 1);
      rr(2, -48, 9, 2.2, 1); fo('#3a4724', 0.8);
      c.fillStyle = '#dc2626'; poly([0, -54, 1, -51.6, 3.4, -51.4, 1.6, -49.8, 2.2, -47.4, 0, -48.8, -2.2, -47.4, -1.6, -49.8, -3.4, -51.4, -1, -51.6]); c.fill(); break;
    case 'para':                                     // rudý baret s odznakem
      c.beginPath(); c.ellipse(-2, -48.6, 9.5, 3.6, -0.25, 0, Math.PI * 2); fo('#b91c1c', 1);
      c.fillStyle = '#facc15'; circ(3, -48.4, 1.4); break;
    case 'alien':                                    // tykadla
      c.strokeStyle = '#22c55e'; c.lineWidth = 1.4;
      for (const m of [-1, 1]) { ln(m * 3, -49, m * 6, -57); c.fillStyle = '#86efac'; circ(m * 6, -57.5, 1.8); }
      c.fillStyle = '#0b0b10'; c.save(); c.translate(3.6, -43.4); c.rotate(-0.35); ell(0, 0, 2.2, 3.2); c.restore();
      c.fillStyle = 'rgba(255,255,255,.6)'; circ(3, -44.6, 0.7); break;
    case 'robot':                                    // anténa se světlem a hledí
      c.strokeStyle = '#94a3b8'; c.lineWidth = 1.4; ln(-2, -50, -2, -58); glowDot(-2, -59, 3.5, '#f43f5e');
      rr(-8.5, -45, 17, 4, 1.5); fo('#475569', 1); glowLine(-6.5, -43, 7.5, -43, '#f43f5e', 1.2); break;
    case 'marine':                                   // hřeben na helmě a ramenní pancíř
      rr(-1.6, -56, 3.2, 8, 1.2); fo('#e5c04a', 1);
      c.fillStyle = 'rgba(255,255,255,.25)'; ell(-3, -48, 3, 1.4); break;
  }
}
function superHelmet(team) {
  c.beginPath(); c.arc(0, -43, 8.4, 0, Math.PI * 2);
  fo(lg('helmS', -7, -51, 7, -35, [[0, '#fff2a8'], [0.5, '#e6b422'], [1, '#8a6410']]));
  rr(1, -46, 9, 4.5, 2); c.fillStyle = '#1a0f00'; c.fill();
  glowLine(2.5, -43.7, 8, -43.7, '#ff5a2a', 1.8);
  c.beginPath(); c.moveTo(-3, -51); c.lineTo(0, -60); c.lineTo(3, -51); c.closePath(); fo(team[0], 1);
}

function torsoGear(team, age, ty) {
  switch (age) {
    case 0:
      c.beginPath(); c.moveTo(-7.5, -33); c.lineTo(-3, -36); c.lineTo(7, -21); c.lineTo(3, -19); c.closePath(); fo('#b07a43', 1.1);
      c.fillStyle = '#5a3a1e'; circ(-3, -31, 1.1); circ(1, -27, 1.2); circ(4, -23, 1);
      c.fillStyle = '#7a5230'; c.fillRect(-6.5, -21.5, 13, 2.5);
      break;
    case 1:
      c.beginPath(); c.moveTo(-7.6, -31); c.quadraticCurveTo(-6.5, -36.5, 0, -36.5); c.quadraticCurveTo(6.5, -36.5, 7.6, -31); c.lineTo(7.2, -27); c.lineTo(-7.2, -27); c.closePath();
      fo(lg('mail', 0, -37, 0, -27, [[0, '#d5d9de'], [1, '#8f969f']]), 1.1);
      c.fillStyle = 'rgba(60,64,70,.5)';
      for (let y = -34; y < -28; y += 2) for (let x = -6; x < 7; x += 2) c.fillRect(x + (y % 4 ? 1 : 0), y, 1, 1);
      c.fillStyle = '#e5c04a'; c.fillRect(-1, -26, 2, 7);
      c.fillStyle = '#4a3020'; c.fillRect(-6.6, -21, 13.2, 2.4); c.fillStyle = '#e5c04a'; c.fillRect(-1.2, -21.2, 2.4, 2.8);
      break;
    case 2:
      c.fillStyle = '#f3ead6';
      c.beginPath(); c.moveTo(-1, -36); c.lineTo(-4, -28); c.lineTo(-1, -26); c.closePath(); c.fill();
      c.beginPath(); c.moveTo(1, -36); c.lineTo(4, -28); c.lineTo(1, -26); c.closePath(); c.fill();
      c.fillStyle = '#e5c04a'; circ(0, -29, 0.9); circ(0, -25, 0.9); circ(0, -21, 0.9);
      c.strokeStyle = '#ffffff'; c.lineWidth = 1.6; ln(-6.5, -34, 6, -19);
      c.fillStyle = '#1f1f24'; c.fillRect(-6.6, -20.5, 13.2, 2);
      break;
    case 3:
      rr(-7, -33, 14, 13, 2); fo(lg('vest', 0, -33, 0, -20, [[0, '#6d7f4a'], [1, '#4a5832']]), 1.1);
      rr(-5.5, -28, 4, 4, 0.8); fo('#3f4b29', 0.8); rr(1.5, -28, 4, 4, 0.8); fo('#3f4b29', 0.8);
      c.fillStyle = '#262626'; c.fillRect(-6.6, -20.5, 13.2, 2.6); c.fillStyle = '#a3a3a3'; c.fillRect(-1, -20.3, 2, 2.2);
      break;
    case 4:
      rr(-7.4, -36, 14.8, 17, 3); fo(lg('arm4', -7, -36, 7, -19, [[0, '#4b5368'], [1, '#232733']]), 1.1);
      c.beginPath(); c.arc(0, -29, 2.6, 0, Math.PI * 2); fo('#11151f', 0.8);
      glowDot(0, -29, 5, team[0]);
      c.strokeStyle = team[2]; c.lineWidth = 1; ln(-5.5, -23, 5.5, -23);
      break;
  }
}

// zbraně národů: m = zbraň bojovníka (míří podél +x od dlaně), r = zbraň střelce (míří podél +y)
const steel = k => lg('st' + k, 0, -2, 0, 2, [[0, '#ffffff'], [0.5, '#c4cad3'], [1, '#7d8591']]);
const shaft = (x0, x1, col = '#6b4423', w = 2.4) => { rr(x0, -w / 2, x1 - x0, w, w / 2); fo(col, 0.9); };
const WEAP = {
  wolf: { m() {                                               // kostěné kopí
    shaft(-6, 24, '#8b6b4a', 2.2);
    c.beginPath(); c.moveTo(23, -2.6); c.lineTo(32, 0); c.lineTo(23, 2.6); c.closePath(); fo('#efe6d2', 1);
    c.strokeStyle = '#5c3a1e'; c.lineWidth = 1.2; ln(21, -2, 22, 2);
  } },
  bear: { m() {                                               // kamenná sekera
    shaft(-3, 19, '#6b4423', 2.6);
    c.beginPath(); c.moveTo(13, -2); c.quadraticCurveTo(17, -11, 22, -8); c.lineTo(22, 6); c.quadraticCurveTo(17, 9, 13, 2); c.closePath(); fo('#8a8580', 1.2);
    c.strokeStyle = '#5c3a1e'; c.lineWidth = 1.4; ln(14, -2.5, 16, 2.5);
  } },
  eagle: { m() {                                              // pazourkový nůž
    shaft(-3, 5, '#6b4423', 2.6);
    c.beginPath(); c.moveTo(5, -2.2); c.lineTo(17, -0.5); c.lineTo(18, 0.6); c.lineTo(5, 2.2); c.closePath(); fo('#57534e', 1);
  }, r(at) {                                                  // krátký luk, střílí šípy
    c.beginPath(); c.moveTo(-9, 1); c.quadraticCurveTo(0, 9, 9, 1);
    c.strokeStyle = OL; c.lineWidth = 3.8; c.stroke(); c.strokeStyle = '#a0703c'; c.lineWidth = 2; c.stroke();
    const pull = at > 0 ? 1 : -4;
    c.strokeStyle = '#f0e6d0'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(-9, 1); c.lineTo(0, pull); c.lineTo(9, 1); c.stroke();
    if (at <= 0) { c.strokeStyle = '#6b4423'; c.lineWidth = 1.2; ln(0, pull, 0, 12); c.fillStyle = '#57534e'; poly([-1.6, 11, 0, 14.5, 1.6, 11]); c.fill(); }
  }, proj: 'arrow' },
  viking: { m() {                                             // bradatice
    shaft(-3, 21, '#6b4423', 2.6);
    c.beginPath(); c.moveTo(15, -1.5); c.lineTo(18, -10); c.quadraticCurveTo(24, -6, 23, 3); c.quadraticCurveTo(20, 2, 18, 1.5); c.closePath(); fo(steel('ax'), 1.1);
  }, r(at) {                                                  // vrhací sekera v ruce (nová se objeví, až je ruka zpátky nahoře)
    if (at > 0.15) return;
    c.save(); c.rotate(Math.PI / 2);
    shaft(-2, 13, '#6b4423', 2.2);
    c.beginPath(); c.moveTo(9, -1.2); c.lineTo(11, -7.5); c.quadraticCurveTo(15.5, -4.5, 15, 2); c.lineTo(11.5, 1.2); c.closePath(); fo(steel('tax'), 1);
    c.restore();
  }, proj: 'axe' },
  samurai: { m() {                                            // katana
    rr(-4, -1.3, 7, 2.6, 1); fo('#1f1f24', 1);
    c.beginPath(); c.ellipse(3.5, 0, 1.4, 3.6, 0, 0, Math.PI * 2); fo('#e5c04a', 0.9);
    c.beginPath(); c.moveTo(5, -1.3); c.quadraticCurveTo(18, -2.8, 30, -4.8); c.lineTo(31, -3.8); c.quadraticCurveTo(18, -0.6, 5, 1.3); c.closePath(); fo(steel('kat'), 1);
  }, r(at) {                                                  // jumi – vysoký nesouměrný luk
    c.beginPath(); c.moveTo(-17, 2); c.quadraticCurveTo(-4, 11, 9, 1);
    c.strokeStyle = OL; c.lineWidth = 4; c.stroke(); c.strokeStyle = '#1f1f24'; c.lineWidth = 2.2; c.stroke();
    const pull = at > 0 ? 1 : -6;
    c.strokeStyle = '#f0e6d0'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(-17, 2); c.lineTo(-2, pull); c.lineTo(9, 1); c.stroke();
    if (at <= 0) { c.strokeStyle = '#6b4423'; c.lineWidth = 1.2; ln(-2, pull, -2, 15); c.fillStyle = '#9aa1ab'; poly([-3.6, 14, -2, 18, -0.4, 14]); c.fill(); }
  } },
  mongol: { m() {                                             // šavle
    rr(-3, -1.2, 6, 2.4, 1); fo('#5a3a22', 1); rr(2.5, -3.5, 1.8, 7, 0.8); fo('#e5c04a', 0.9);
    c.beginPath(); c.moveTo(4.3, -1.5); c.quadraticCurveTo(16, -1, 26, -6); c.lineTo(26.5, -4.4); c.quadraticCurveTo(16, 1.8, 4.3, 1.5); c.closePath(); fo(steel('sab'), 1);
  }, r(at) {                                                  // reflexní luk
    c.beginPath(); c.moveTo(-10, -1); c.quadraticCurveTo(-8, 3, -5, 4); c.quadraticCurveTo(0, 7, 5, 4); c.quadraticCurveTo(8, 3, 10, -1);
    c.strokeStyle = OL; c.lineWidth = 4; c.stroke(); c.strokeStyle = '#7a4a24'; c.lineWidth = 2.2; c.stroke();
    const pull = at > 0 ? 1 : -5;
    c.strokeStyle = '#f0e6d0'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(-10, -1); c.lineTo(0, pull); c.lineTo(10, -1); c.stroke();
    if (at <= 0) { c.strokeStyle = '#6b4423'; c.lineWidth = 1.2; ln(0, pull, 0, 13); c.fillStyle = '#9aa1ab'; poly([-1.6, 12, 0, 15.5, 1.6, 12]); c.fill(); }
  } },
  conq: { m() {                                               // široký meč s košem
    c.strokeStyle = '#c4cad3'; c.lineWidth = 1.2; c.beginPath(); c.arc(1.5, 0, 4.4, -1.5, 1.5); c.stroke();
    rr(-3, -1.2, 5, 2.4, 1); fo('#2b1a0e', 0.8);
    c.beginPath(); c.moveTo(4, -2.2); c.lineTo(25, -1.8); c.lineTo(28, 0); c.lineTo(25, 1.8); c.lineTo(4, 2.2); c.closePath(); fo(steel('bsw'), 1);
  }, r() {                                                    // arkebuza s doutnákem
    c.beginPath(); c.moveTo(-2.5, -8); c.lineTo(2.5, -8); c.lineTo(2, 1); c.lineTo(-1, 3); c.closePath(); fo('#5a3a22', 1.1);
    rr(-1.6, 0, 3.2, 23, 1); fo('#4b5058', 1); rr(-2, 3, 4, 9, 1); fo('#7a4a24', 1);
    c.strokeStyle = '#d4a017'; c.lineWidth = 1; ln(2, 2, 5, -2); glowDot(5, -2.5, 2.5, '#f97316');
  } },
  pirate: { m() {                                             // šavle s plným košem (kordelas)
    c.beginPath(); c.arc(2, 0, 4.6, -1.7, 1.7); fo('#e5c04a', 1);
    rr(-3, -1.2, 5, 2.4, 1); fo('#2b1a0e', 0.8);
    c.beginPath(); c.moveTo(4, -2.4); c.quadraticCurveTo(15, -3, 23, -5.5); c.lineTo(24.5, -3); c.quadraticCurveTo(15, 2.6, 4, 2.4); c.closePath(); fo(steel('cut'), 1);
  }, r() {                                                    // křesadlová pistole
    c.beginPath(); c.moveTo(-2, -4); c.quadraticCurveTo(-4, -1, -2.5, 2); c.lineTo(2, 2); c.lineTo(2, -2); c.closePath(); fo('#6b4423', 1);
    rr(-1.4, 1, 2.8, 12, 1); fo('#4b5058', 1); c.fillStyle = '#e5c04a'; c.fillRect(-1.6, 10.5, 3.2, 1.6);
  } },
  janissary: { m() {                                          // jatagan – dopředu prohnutý
    rr(-3, -1.2, 6, 2.4, 1); fo('#f5f0e0', 0.9);
    c.beginPath(); c.moveTo(3, -1.6); c.quadraticCurveTo(14, 1.8, 26, -1.5); c.lineTo(26.5, 0.6); c.quadraticCurveTo(14, 4.6, 3, 1.6); c.closePath(); fo(steel('yat'), 1);
  }, r() {                                                    // dlouhá mušketa se zlatými obručemi
    c.beginPath(); c.moveTo(-2.5, -9); c.lineTo(2.5, -9); c.lineTo(2, 1); c.lineTo(-1, 4); c.closePath(); fo('#8b5a2b', 1.1);
    rr(-1.3, 0, 2.6, 31, 1); fo('#4b5058', 1);
    c.fillStyle = '#e5c04a'; for (const y of [6, 14, 22]) c.fillRect(-1.8, y, 3.6, 1.5);
  } },
  tank: { m() {                                               // granát s rukojetí
    shaft(-3, 9, '#6b4423', 2.4);
    rr(8, -3.4, 9, 6.8, 2.4); fo('#4b5d2e', 1.1);
    c.strokeStyle = '#2b2b2b'; c.lineWidth = 0.8; ln(10.5, -3, 10.5, 3); ln(13.5, -3, 13.5, 3);
  } },
  partisan: { m() {                                           // puška s bajonetem
    c.beginPath(); c.moveTo(-6, -2.4); c.lineTo(4, -1.6); c.lineTo(4, 1.6); c.lineTo(-6, 2.4); c.closePath(); fo('#6b4423', 1);
    rr(4, -1.1, 14, 2.2, 0.8); fo('#3a3a3a', 0.9);
    c.beginPath(); c.moveTo(17, -0.9); c.lineTo(28, 0); c.lineTo(17, 0.9); c.closePath(); fo(steel('bay'), 0.8);
  }, r() {                                                    // odstřelovačka s dalekohledem
    c.beginPath(); c.moveTo(-2.5, -9); c.lineTo(2.5, -9); c.lineTo(2, 2); c.lineTo(-1.5, 4); c.closePath(); fo('#6b4423', 1.1);
    rr(-1.1, 0, 2.2, 32, 0.8); fo('#2b2b2b', 0.9);
    rr(-5.5, 3, 3, 10, 1.4); fo('#1f1f1f', 0.9); c.fillStyle = '#38bdf8'; circ(-4, 13, 1);
  } },
  para: { m() {                                               // mačeta
    rr(-3, -1.3, 6, 2.6, 1); fo('#1f1f1f', 1);
    c.beginPath(); c.moveTo(3, -2.2); c.lineTo(20, -2.8); c.quadraticCurveTo(25, -1, 22, 2.4); c.lineTo(3, 2.2); c.closePath(); fo(steel('mac'), 1);
  }, r() {                                                    // samopal se zásobníkem
    rr(-3, -5, 6, 14, 1.4); fo('#2b2b2b', 1.1);
    rr(-1, 9, 2, 6, 0.6); fo('#1f1f1f', 0.8);
    rr(-8, 2, 5, 3, 0.8); fo('#3d3d3d', 0.9); rr(3, 0, 2.6, 8, 0.8); fo('#3d3d3d', 0.9);
  } },
  alien: { m() {                                              // plazmový pařát
    c.strokeStyle = '#4ade80'; c.lineWidth = 2;
    for (const a of [-0.35, 0, 0.35]) { c.beginPath(); c.moveTo(2, 0); c.quadraticCurveTo(12, a * 14, 20, a * 22 - 2); c.stroke(); }
    glowDot(20, -2, 6, '#4ade80');
  }, r() {                                                    // organická plazmová zbraň
    c.beginPath(); c.ellipse(0, 6, 4.4, 9, 0, 0, Math.PI * 2); fo(lg('alG', -4, 0, 4, 0, [[0, '#a855f7'], [1, '#581c87']]), 1.1);
    glowDot(0, 16, 6, '#4ade80'); c.fillStyle = '#4ade80'; circ(-1.5, 3, 1.2); circ(1.5, 7, 1);
  }, proj: 'plasma' },
  robot: { m() {                                              // kotoučová pila
    rr(-3, -2, 10, 4, 1.2); fo('#7d8694', 1);
    c.save(); c.translate(14, 0); c.rotate(T * 20);
    c.beginPath(); for (let k = 0; k < 16; k++) { const r = k % 2 ? 6.5 : 8, a = k / 16 * Math.PI * 2; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.closePath(); fo(steel('saw'), 1);
    c.fillStyle = '#4b5563'; circ(0, 0, 2); c.restore();
  }, r(at) {                                                  // červená laserová puška
    rr(-3.4, -6, 6.8, 18, 2.4); fo(lg('rlas', -3, 0, 3, 0, [[0, '#e5e9ef'], [1, '#7d8694']]), 1.1);
    rr(-1.6, 11, 3.2, 9, 1); fo('#4b5563', 1);
    glowLine(2.4, -3, 2.4, 9, '#f43f5e', 1); if (at > 0.5) glowDot(0, 21, 7, '#f43f5e');
  }, proj: 'rlaser' },
  marine: { m() {                                             // řetězový meč
    rr(-3, -1.8, 7, 3.6, 1.2); fo('#3f4a5c', 1);
    rr(4, -3, 22, 6, 1.5); fo(lg('chs', 0, -3, 0, 3, [[0, '#9aa3b0'], [1, '#4b5563']]), 1);
    c.fillStyle = '#1f2937'; const o = (T * 60) % 3; for (let x = 5 + o; x < 25; x += 3) poly([x, -3, x + 1.5, -5, x + 3, -3]);
  }, r(at) {                                                  // mohutná pulzní puška
    rr(-4.5, -7, 9, 22, 2); fo(lg('pul', -4, 0, 4, 0, [[0, '#64748b'], [1, '#1e293b']]), 1.2);
    rr(-2.4, 14, 4.8, 8, 1.2); fo('#0f172a', 1);
    glowLine(-3, 0, -3, 12, '#38e1ff', 1); if (at > 0.5) glowDot(0, 23, 7, '#38e1ff');
  } },
};
const weapOf = (team, age) => (team.af && WEAP[(AGEFAC[age][team.af[age]] || {}).g]) || null;

function weapon(team, age, ty, at) {
  c.lineCap = 'round';
  const WP = weapOf(team, age);                       // vlastní zbraň národa
  if (WP && ty === 0 && WP.m) return WP.m(at);
  if (WP && ty === 1 && WP.r) return WP.r(at);
  if (ty === 0) {
    switch (age) {
      case 0:
        c.beginPath(); c.moveTo(-2, -1.6); c.lineTo(13, -3); c.quadraticCurveTo(21, -5, 21, 0); c.quadraticCurveTo(21, 5, 13, 3); c.lineTo(-2, 1.6); c.closePath();
        fo(lg('club', 0, -5, 0, 5, [[0, '#9b6a3c'], [1, '#5c3a1e']]), 1.2);
        c.fillStyle = '#4a2e15'; circ(15, -1, 1); circ(18, 1.5, 0.9);
        break;
      case 1:
        rr(-3, -1.3, 6, 2.6, 1); fo('#5a3a22', 1);
        rr(3, -5, 2.2, 10, 1); fo('#e5c04a', 1);
        c.beginPath(); c.moveTo(5.2, -1.8); c.lineTo(23, -1.2); c.lineTo(26, 0); c.lineTo(23, 1.2); c.lineTo(5.2, 1.8); c.closePath();
        fo(lg('sword', 0, -2, 0, 2, [[0, '#ffffff'], [0.5, '#c4cad3'], [1, '#7d8591']]), 1.1);
        c.fillStyle = '#e5c04a'; circ(-3.5, 0, 1.6);
        break;
      case 2:
        c.strokeStyle = '#e5c04a'; c.lineWidth = 1.4; c.beginPath(); c.arc(2.5, 0, 3.8, -1.3, 1.3); c.stroke();
        c.beginPath(); c.moveTo(4, -1); c.lineTo(30, -0.3); c.lineTo(31, 0); c.lineTo(30, 0.3); c.lineTo(4, 1); c.closePath();
        fo('#dfe3e8', 0.8);
        rr(-3, -1.1, 6, 2.2, 1); fo('#2b1a0e', 0.8);
        break;
      case 3:
        rr(-3, -1.5, 6.5, 3, 1); fo('#2b2b2b', 1);
        rr(3.5, -2.5, 1.6, 5, 0.5); fo('#555', 0.8);
        c.beginPath(); c.moveTo(5, -1.6); c.lineTo(14, -1.6); c.lineTo(17, 0.4); c.lineTo(5, 1.6); c.closePath();
        fo(lg('knife', 0, -2, 0, 2, [[0, '#f5f5f5'], [1, '#8b9098']]), 1);
        break;
      case 4:
        rr(-3, -1.8, 7, 3.6, 1.2); fo('#4b5368', 1);
        rr(4, -3, 2, 6, 0.6); fo('#7d8696', 0.8);
        glowLine(6, 0, 30, 0, '#38e1ff', 2.4);
        break;
    }
    return;
  }
  // střelci – zbraň míří ve směru +y
  switch (age) {
    case 0: {
      const sx = at > 0 ? 2 : -5, sy = at > 0 ? 12 : 6;
      c.strokeStyle = '#8b6b4a'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(sx * 0.5 - 2, sy * 0.6, sx, sy); c.stroke();
      if (at <= 0) { c.beginPath(); c.arc(sx, sy, 2.5, 0, Math.PI * 2); fo('#8a8a8a', 1); }
      break;
    }
    case 1: {
      c.beginPath(); c.moveTo(-13, 1); c.quadraticCurveTo(0, 12, 13, 1);
      c.strokeStyle = OL; c.lineWidth = 4.4; c.stroke(); c.strokeStyle = '#8b5a2b'; c.lineWidth = 2.4; c.stroke();
      const pull = at > 0 ? 1 : -6;
      c.strokeStyle = '#f0e6d0'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(-13, 1); c.lineTo(0, pull); c.lineTo(13, 1); c.stroke();
      if (at <= 0) {
        c.strokeStyle = '#6b4423'; c.lineWidth = 1.3; ln(0, pull, 0, 15);
        c.fillStyle = '#9aa1ab'; poly([-1.8, 14, 0, 18, 1.8, 14]); c.fill();
        c.fillStyle = '#e5e7eb'; poly([0, pull, -2.2, pull - 2, 0, pull + 3]); c.fill();
      }
      break;
    }
    case 2:
      c.beginPath(); c.moveTo(-2.5, -9); c.lineTo(2.5, -9); c.lineTo(2, 1); c.lineTo(-1, 4); c.closePath(); fo('#7a4a24', 1.1);
      rr(-1.3, 0, 2.6, 27, 1); fo(lg('musket', -1.3, 0, 1.3, 0, [[0, '#9aa1ab'], [1, '#4b5058']]), 1);
      rr(-1.8, 4, 3.6, 12, 1); fo('#8b5a2b', 1);
      c.strokeStyle = '#dfe3e8'; c.lineWidth = 0.9; ln(0.9, 27, 0.9, 33);
      break;
    case 3:
      rr(-3.2, -7, 6.4, 19, 1.5); fo(lg('mg', -3, 0, 3, 0, [[0, '#4a4a4a'], [1, '#1c1c1c']]), 1.1);
      rr(-2, 11, 4, 9, 1); fo('#333', 1);
      c.fillStyle = '#777'; for (let k = 0; k < 3; k++) circ(0, 13 + k * 2.5, 0.6);
      rr(-1, 19, 2, 8, 0.6); fo('#222', 0.8);
      rr(-8.5, 0, 5.5, 4, 0.8); fo('#3d3d3d', 1);
      rr(-6.5, -6, 3, 4, 0.6); fo('#2a2a2a', 0.8);
      break;
    case 4:
      rr(-3.8, -6, 7.6, 18, 3); fo(lg('blaster', -4, 0, 4, 0, [[0, '#f8fafc'], [1, '#9aa3b2']]), 1.1);
      rr(-2.2, 11, 4.4, 7, 1.2); fo('#5b6478', 1);
      glowLine(-2.4, -2, -2.4, 8, '#38e1ff', 1);
      if (at > 0.5) glowDot(0, 20, 7, '#38e1ff');
      break;
  }
}

// ---------- těžké jednotky ----------
function heavy(team, age, ph, at, st) {
  const walk = st === 0;
  switch (age) {
    case 0: return dino(team, ph, walk, at);
    case 1: return horse(team, ph, walk, at);
    case 2: return cannon(team, ph, at, st);
    case 3: return tank(team, ph, at);
    case 4: return mech(team, ph, walk, at);
  }
}

// noha se dvěma klouby: chodidlo stojí na zemi a posouvá se dozadu,
// při přenášení dopředu se zvedne (inverzní kinematika pro koleno)
function ikLeg(hx, hy, phase, walk, A, lift, L1, L2, kneeFwd, col, w, fy0 = -2) {
  const s = walk ? Math.sin(phase) : 0, v = walk ? Math.cos(phase) : 0;
  const fx = hx + A * s, fy = (v > 0 ? -lift * v : 0) + fy0;
  const dx = fx - hx, dy = fy - hy;
  const d = Math.min(Math.hypot(dx, dy), L1 + L2 - 0.01);
  const base = Math.atan2(dy, dx);
  const a = Math.acos(Math.max(-1, Math.min(1, (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d))));
  const ka = base + (kneeFwd ? -a : a);
  const kx = hx + Math.cos(ka) * L1, ky = hy + Math.sin(ka) * L1;
  limb([hx, hy, kx, ky, ...tipIn(kx, ky, fx, fy, w / 2)], col, w);
  return [fx, fy];
}
const legBob = (ph, walk, k) => walk ? -Math.abs(Math.cos(ph)) * k : 0;

// chodidlo pod kotníkem (y = kotník): pata, prsty na zemi a drápy – zakryje konec nohy
function dinoFoot(x, y, col) {
  c.beginPath(); c.moveTo(x - 5, y + 1); c.quadraticCurveTo(x - 5, y - 3, x, y - 3.5); c.lineTo(x + 6, y + 1); c.lineTo(x + 10, y + 3.5);
  c.quadraticCurveTo(x + 11, y + 6.5, x + 8, y + 6.5); c.lineTo(x - 4, y + 6.5); c.quadraticCurveTo(x - 6, y + 4, x - 5, y + 1); c.closePath(); fo(col, 1.2);
  c.fillStyle = '#f5f0e0'; poly([x + 9, y + 3, x + 13, y + 6.2, x + 8.5, y + 6.2]); c.fill(); poly([x + 4, y + 4, x + 7, y + 6.2, x + 3.5, y + 6.2]); c.fill();
}

function dinoHead(at) {
  const G = '#5aa64a';
  c.beginPath(); c.moveTo(10, -38); c.quadraticCurveTo(20, -48, 24, -56); c.lineTo(42, -55); c.quadraticCurveTo(46, -53, 44, -49);
  c.lineTo(31, -47); c.quadraticCurveTo(24, -38, 18, -24); c.closePath();
  fo(lg('dinoH', 0, -58, 0, -24, [[0, '#86d06e'], [1, G]]));
  c.save(); c.translate(30, -47); c.rotate(at * 0.45);
  c.beginPath(); c.moveTo(0, 0); c.lineTo(14, -1); c.quadraticCurveTo(15, 3, 11, 4); c.lineTo(1, 4); c.closePath(); fo('#4f9440', 1.3);
  c.fillStyle = '#fff'; for (let k = 0; k < 4; k++) { poly([3 + k * 3, -0.5, 4.5 + k * 3, -3, 6 + k * 3, -0.5]); c.fill(); }
  c.restore();
  c.fillStyle = '#fff'; for (let k = 0; k < 4; k++) { poly([32 + k * 3, -49, 33.5 + k * 3, -46, 35 + k * 3, -49]); c.fill(); }
  c.fillStyle = '#fff6c0'; ell(31, -52.5, 2.6, 2.2); c.fillStyle = '#111'; circ(32, -52.3, 1.2);
  c.strokeStyle = OL; c.lineWidth = 1.3; ln(28.5, -55.5, 33, -54.5);
  c.fillStyle = '#2f5f27'; circ(42, -53, 0.9);
}

function dino(team, ph, walk, at) {
  const G = '#5aa64a', GD = '#3f7d33', bob = legBob(ph, walk, 1.8), sw = walk ? Math.sin(ph) : 0;
  c.save(); c.translate(0, bob);
  c.beginPath(); c.moveTo(-10, -34); c.quadraticCurveTo(-36, -34 + sw * 2, -58, -26 + sw * 3); c.quadraticCurveTo(-34, -22, -10, -20); c.closePath();
  fo(lg('dinoT', 0, -36, 0, -20, [[0, '#7cc466'], [1, GD]]));
  c.restore();
  if (!NO_LEGS) { const [bx, by] = ikLeg(-3, -24 + bob, ph + Math.PI, walk, 12, 6, 12, 12, true, GD, 7.5, -6.5); dinoFoot(bx, by, '#2f5f27'); }
  c.save(); c.translate(0, bob);
  c.beginPath(); c.ellipse(0, -30, 22, 13, -0.08, 0, Math.PI * 2);
  fo(lg('dinoB', 0, -43, 0, -17, [[0, '#86d06e'], [0.6, G], [1, GD]]));
  c.fillStyle = '#d8e8a0'; ell(4, -23, 14, 5);
  c.strokeStyle = 'rgba(40,80,30,.7)'; c.lineWidth = 2.2; c.lineCap = 'round';
  for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(-14 + i * 7, -42); c.quadraticCurveTo(-12 + i * 7, -36, -15 + i * 7, -31); c.stroke(); }
  for (let i = 0; i < 5; i++) { poly([-20 + i * 7, -40.5 + Math.abs(i - 2) * 0.6, -17 + i * 7, -47.5, -14 + i * 7, -41.5]); fo('#e8a33c', 1); }
  // krk a hlava (lehce kývá do kroku); v brutálním režimu může být useknutá
  if (NO_BHEAD) stump(14, -33, 5.5);
  else { c.save(); c.translate(0, walk ? Math.sin(ph * 2) * 0.8 : 0); dinoHead(at); c.restore(); }
  limb([15, -31, 19, -26 + sw, 22, -28 + sw], G, 3);
  // sedlo a jezdec
  rr(-12, -45, 20, 6, 2); fo(team[0], 1.2);
  c.fillStyle = '#e5c04a'; c.fillRect(-12, -41, 20, 1.5);
  if (!NO_RIDER) { c.save(); c.translate(-3, -26 + (walk ? Math.abs(Math.cos(ph)) * 0.8 : 0)); c.scale(0.85, 0.85); human(team, 0, 0, ph, at, 1, { sit: 1 }); c.restore(); }
  c.restore();
  if (!NO_LEGS) { const [fx, fy] = ikLeg(4, -24 + bob, ph, walk, 12, 6, 12, 12, true, G, 8, -6.5); dinoFoot(fx, fy, '#2f5f27'); }
}

// zadní noha koně (3 články): stehno dopředu ke kolenu, holeň dozadu k hleznu, spěnka svisle ke kopytu
function hindLeg(hx, hy, phase, walk, A, lift, col, w) {
  const s = walk ? Math.sin(phase) : 0, v = walk ? Math.cos(phase) : 0, up = v > 0 ? v : 0;
  hy -= 4;                                            // kyčel je schovaná v těle, stehno z něj vyrůstá
  const fx = hx + A * s, fy = -lift * up - 2;
  const kx = fx - 2 - lift * up * 0.6, ky = fy - 11 + lift * up * 0.3;   // hlezno; při zvednutí se noha víc složí
  const L1 = 13, L2 = 11, dx = kx - hx, dy = ky - hy, d = Math.min(Math.hypot(dx, dy), L1 + L2 - 0.01);
  const a = Math.acos(Math.max(-1, Math.min(1, (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d))));
  const ka = Math.atan2(dy, dx) - a;                  // koleno (stifle) směřuje dopředu
  const sx = hx + Math.cos(ka) * L1, sy = hy + Math.sin(ka) * L1;
  limb([hx, hy, sx, sy], col, w * 1.9);               // svalnaté stehno
  limb([sx, sy, kx, ky], col, w * 1.25);              // holeň
  limb([kx, ky, ...tipIn(kx, ky, fx, fy, w * 0.42)], col, w * 0.85);   // spěnka (končí v kopytu)
  return [fx, fy];
}
function hoof(x, y) { rr(x - 2.5, y - 1.5, 6, 3.5, 1); fo('#1a1a1a', 1); }   // spodek kopyta = zem (y je o 2 výš)

function horseHead() {
  const B = '#8b5a33';
  c.beginPath(); c.moveTo(13, -38); c.lineTo(23, -56); c.quadraticCurveTo(28, -60, 32, -57); c.lineTo(40, -47); c.quadraticCurveTo(39, -43, 35, -44);
  c.lineTo(28, -48); c.lineTo(20, -30); c.closePath();
  fo(lg('horseH', 0, -60, 0, -30, [[0, '#b07a4a'], [1, B]]));
  c.fillStyle = '#2b1a0e'; c.beginPath(); c.moveTo(14, -40); c.lineTo(23, -57); c.lineTo(26, -57); c.lineTo(18, -38); c.closePath(); c.fill();
  poly([27, -58, 28, -64, 31, -58]); fo(B, 1);
  c.fillStyle = '#111'; circ(32, -53, 1.3);
}

function horse(team, ph, walk, at) {
  const B = '#8b5a33', BD = '#5e3a1f', bob = legBob(ph, walk, 1.2), sw = walk ? Math.sin(ph) : 0;
  // vzdálenější nohy
  if (!NO_LEGS) {
    hoof(...hindLeg(-14, -28 + bob, ph, walk, 10, 6, BD, 4.5));
    hoof(...ikLeg(12, -28 + bob, ph + Math.PI / 2, walk, 10, 6, 13, 15, true, BD, 4.5));
  }
  c.save(); c.translate(0, bob);
  c.beginPath(); c.moveTo(-20, -36); c.quadraticCurveTo(-34, -32, -32 + sw * 2, -14); c.quadraticCurveTo(-28, -26, -20, -30); c.closePath(); fo('#2b1a0e', 1.2);
  c.beginPath(); c.ellipse(0, -33, 23, 10.5, 0, 0, Math.PI * 2);
  fo(lg('horseB', 0, -44, 0, -22, [[0, '#b07a4a'], [1, BD]]));
  if (NO_BHEAD) stump(17, -35, 4.5);
  else { c.save(); c.translate(0, walk ? Math.sin(ph * 2) * 1 : 0); horseHead(); c.restore(); }
  // bližší zadní noha pod čabrakou, ať stehno vyrůstá z těla
  if (!NO_LEGS) { c.save(); c.translate(0, -bob); hoof(...hindLeg(-9, -28 + bob, ph + Math.PI, walk, 10, 6, B, 4.8)); c.restore(); }
  // čabraka
  c.beginPath(); c.moveTo(-20, -40); c.lineTo(14, -40); c.lineTo(16, -26);
  for (let i = 0; i < 6; i++) c.quadraticCurveTo(13 - i * 6, -21, 10 - i * 6, -26);
  c.lineTo(-21, -27); c.closePath();
  fo(lg('capar' + team[0], 0, -40, 0, -22, [[0, team[0]], [1, team[1]]]), 1.2);
  c.strokeStyle = '#e5c04a'; c.lineWidth = 1.4; ln(-20, -38, 14, -38);
  c.fillStyle = '#e5c04a'; circ(-3, -32, 3); c.fillStyle = team[1]; circ(-3, -32, 1.5);
  if (!NO_RIDER) { c.save(); c.translate(-3, -29); c.scale(0.86, 0.86); human(team, 1, 0, ph, at, 1, { sit: 1, plume: 1 }); c.restore(); }
  c.restore();
  // bližší nohy
  if (!NO_LEGS) {
    hoof(...ikLeg(17, -28 + bob, ph + Math.PI * 1.5, walk, 10, 6, 13, 15, true, B, 4.8));
  }
}

function cannon(team, ph, at, st) {
  c.save(); c.translate(-30, 0); human(team, 2, -1, ph, 0, st); c.restore();
  c.beginPath(); c.moveTo(-22, -3); c.lineTo(4, -20); c.lineTo(10, -16); c.lineTo(-18, 1); c.closePath();
  fo(lg('carr', 0, -20, 0, 0, [[0, '#9b6a3c'], [1, '#5c3a1e']]), 1.3);
  c.save(); c.translate(4 - at * 7, -22); c.rotate(-0.14);
  rr(-16, -6.5, 42, 13, 6); fo(lg('bronze', 0, -7, 0, 7, [[0, '#f3d27a'], [0.45, '#c08a2e'], [1, '#6e4a14']]), 1.4);
  for (const x of [-8, 6, 18]) { rr(x, -7.5, 3, 15, 1); fo('#a8741f', 1); }
  rr(24, -8.5, 6, 17, 2); fo('#c08a2e', 1.3);
  c.fillStyle = '#1a1a1a'; ell(30, 0, 1.6, 5);
  c.beginPath(); c.arc(-17, 0, 4, 0, Math.PI * 2); fo('#a8741f', 1.2);
  c.restore();
  const wr = ph * 0.35;
  c.beginPath(); c.arc(0, -12, 12, 0, Math.PI * 2); fo('#7a4a24', 1.6);
  c.beginPath(); c.arc(0, -12, 9, 0, Math.PI * 2); c.fillStyle = '#9b6a3c'; c.fill();
  c.strokeStyle = '#5c3a1e'; c.lineWidth = 2;
  for (let i = 0; i < 4; i++) { const a = wr + i * Math.PI / 4; ln(-Math.cos(a) * 9, -12 - Math.sin(a) * 9, Math.cos(a) * 9, -12 + Math.sin(a) * 9); }
  c.beginPath(); c.arc(0, -12, 3, 0, Math.PI * 2); fo('#3c3f46', 1);
}

function tank(team, ph, at) {
  c.save(); c.translate(0, -2);
  rr(-35, -16, 70, 17, 8.5); fo('#262626', 1.6);
  c.fillStyle = '#4a4a4a';
  const off = (ph * 2) % 6;
  for (let x = -32 + off; x < 32; x += 6) { c.fillRect(x, -16, 3, 2); c.fillRect(x, -1, 3, 2); }
  for (let i = 0; i < 6; i++) { c.beginPath(); c.arc(-26 + i * 10.4, -7.5, 5, 0, Math.PI * 2); fo('#555b61', 1.1); c.fillStyle = '#2d3136'; circ(-26 + i * 10.4, -7.5, 1.8); }
  rr(-37, -20, 74, 5, 2); fo('#4b5530', 1.2);
  c.beginPath(); c.moveTo(-34, -20); c.lineTo(-28, -32); c.lineTo(24, -32); c.lineTo(35, -20); c.closePath();
  fo(lg('hull', 0, -32, 0, -20, [[0, '#8a9a5b'], [1, '#4f5c33']]), 1.4);
  c.fillStyle = 'rgba(55,65,35,.8)'; ell(-14, -26, 6, 3); ell(10, -27, 7, 2.5);
  c.fillStyle = team[0]; c.fillRect(-28, -24, 56, 2.5);
  c.beginPath(); c.arc(-20, -27, 3, 0, Math.PI * 2); fo('#fff', 0.8); c.fillStyle = team[0]; circ(-20, -27, 1.6);
  c.strokeStyle = '#2b2b2b'; c.lineWidth = 1; ln(-12, -46, -17, -68);
  rr(12 - at * 7, -42, 34, 5.5, 2); fo(lg('barrel', 0, -42, 0, -36, [[0, '#6f7f45'], [1, '#384126']]), 1.2);
  rr(42 - at * 7, -43, 7, 7.5, 1.5); fo('#384126', 1.2);
  c.beginPath(); c.moveTo(-16, -32); c.lineTo(-13, -45); c.quadraticCurveTo(0, -48, 14, -44); c.lineTo(18, -32); c.closePath();
  fo(lg('turret', 0, -48, 0, -32, [[0, '#93a463'], [1, '#55623a']]), 1.4);
  c.beginPath(); c.ellipse(-4, -46, 6, 2.2, 0, 0, Math.PI * 2); fo('#5f6d40', 1);
  c.restore();
}

function mech(team, ph, walk, at) {
  const L = '#5b6478', LD = '#3a4152', bob = legBob(ph, walk, 2);
  const [bx, by] = ikLeg(-4, -40 + bob, ph + Math.PI, walk, 12, 8, 20, 20, false, LD, 7);
  rr(bx - 6, by - 2, 13, 4, 1.5); fo('#262b38', 1.2);
  c.save(); c.translate(0, bob);
  c.beginPath(); c.moveTo(-20, -70); c.lineTo(16, -73); c.lineTo(24, -58); c.lineTo(17, -40); c.lineTo(-17, -40); c.lineTo(-23, -56); c.closePath();
  fo(lg('mechB', 0, -73, 0, -40, [[0, '#7c869c'], [0.5, L], [1, '#262b38']]), 1.6);
  rr(-17, -88, 16, 13, 2); fo('#3a4152', 1.3);
  c.fillStyle = '#11151f'; for (let k = 0; k < 3; k++) circ(-13 + k * 4.5, -81.5, 1.4);
  limb([-9, -75, -9, -70], '#3a4152', 3);
  c.fillStyle = team[0]; c.fillRect(-19, -54, 40, 3.5);
  glowLine(-17, -52.3, 19, -52.3, team[2], 0.7);
  rr(4, -68, 14, 7, 2.5); c.fillStyle = '#0b1220'; c.fill();
  glowLine(6.5, -64.5, 15.5, -64.5, '#38e1ff', 2);
  c.restore();
  const [fx, fy] = ikLeg(4, -40 + bob, ph, walk, 12, 8, 20, 20, false, L, 7.5);
  rr(fx - 6, fy - 2, 14, 4, 1.5); fo('#2f3544', 1.2);
  c.save(); c.translate(0, bob);
  c.beginPath(); c.arc(0, -40, 5, 0, Math.PI * 2); fo('#2f3544', 1.2);
  rr(10 - at * 6, -56, 36, 10, 3); fo(lg('mechG', 0, -56, 0, -46, [[0, '#6b7590'], [1, '#1f2430']]), 1.4);
  c.fillStyle = team[0]; for (let k = 0; k < 3; k++) c.fillRect(16 - at * 6 + k * 6, -55.5, 2.2, 9);
  glowDot(48 - at * 6, -51, 6 + Math.sin(T * 9) * 1.5, '#b388ff');
  c.restore();
}

function drawUnitLocal(team, a, ty, ph, at, st) {
  if (ty === 5) drawBoss(team, a, ph, at, st);
  else if (ty === 6) {                                 // speciální jednotka národa: větší, zlatý lem a znak schopnosti
    const d = SPECS[a][(team.af && team.af[a]) | 0];
    c.fillStyle = 'rgba(229,192,74,.35)'; ell(0, 1, 15, 3.5);
    c.save(); c.scale(1.15, 1.15); human(team, a, d.p ? 1 : 0, ph, at, st, { elite: 1 }); c.restore();
    c.save(); c.translate(0, -74); if (c.getTransform().a < 0) c.scale(-1, 1);
    c.font = '12px system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillStyle = 'rgba(15,20,30,.75)'; circ(0, 0, 8); c.fillStyle = '#fff'; c.fillText(SPEC_IC[d.ab], 0, 0.5); c.textBaseline = 'alphabetic';
    c.restore();
  }
  else if (ty === 2) heavy(team, a, ph, at, st);
  else if (ty === 3) {
    const op = c.globalCompositeOperation; c.globalCompositeOperation = 'lighter';
    c.globalAlpha *= 0.35 + Math.sin(T * 5) * 0.1;
    c.fillStyle = rg('aura', 0, -30, 2, 40, [[0, 'rgba(255,220,80,.9)'], [1, 'rgba(255,160,0,0)']]); ell(0, -30, 26, 44);
    c.globalAlpha /= 0.35 + Math.sin(T * 5) * 0.1; c.globalCompositeOperation = op;
    c.save(); c.scale(1.45, 1.45); human(team, 4, 1, ph, at, st, { super: 1 }); c.restore();
  } else if (ty === 4) {
    const op = c.globalCompositeOperation; c.globalCompositeOperation = 'lighter';
    c.fillStyle = rg('haura', 0, -34, 2, 34, [[0, 'rgba(255,230,120,.35)'], [1, 'rgba(255,200,60,0)']]); ell(0, -34, 22, 38);
    c.globalCompositeOperation = op;
    c.save(); c.scale(1.3, 1.3); human(team, a, 0, ph, at, st, { hero: 1 }); c.restore();
  } else human(team, a, ty, ph, at, st);
}

// =====================================================================
//  BOSSOVÉ KAMPANĚ – obří nepřátelé na konci každého věku
// =====================================================================
function drawBoss(team, a, ph, at, st) {
  const walk = st === 0 ? 1 : 0, bob = Math.sin(ph * 0.5) * 2 * walk;
  BOSS_ART[a](team, ph, at, st, walk, bob);
}
// pomocníci pro bosse
function rivets(pts, r = 1.4) { for (const [x, y] of pts) { c.fillStyle = 'rgba(0,0,0,.45)'; circ(x + 0.5, y + 0.6, r); c.fillStyle = 'rgba(255,255,255,.55)'; circ(x - 0.3, y - 0.3, r * 0.6); } }
function furTufts(cx, cy, rx, ry, n, cols, seed) {
  let q = seed; const r = () => (q = (q * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < n; i++) {
    const a = r() * Math.PI * 2, d = Math.sqrt(r()), x = cx + Math.cos(a) * rx * d, y = cy + Math.sin(a) * ry * d, l = 8 + r() * 10;
    c.strokeStyle = cols[i % cols.length]; c.lineWidth = 1.6 + r() * 1.4;
    c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x - 2 + r() * 4, y + l * 0.6, x + Math.sin(T * 1.6 + i) * 1.5 - 1, y + l); c.stroke();
  }
}
const BOSS_ART = [
  // ---------------- válečný mamut v brnění s věží lučištníků ----------------
  (team, ph, at, st, walk, bob) => {
    const sw = o => Math.sin(ph * 0.5 + o) * walk;
    const leg = (x, o, back) => {
      const k = sw(o);
      c.save(); c.translate(x, -46 + bob); c.rotate(k * 0.22);
      c.beginPath(); c.moveTo(-12, 0); c.quadraticCurveTo(-14, 26, -11, 44); c.lineTo(11, 44); c.quadraticCurveTo(14, 26, 12, 0); c.closePath();
      fo(lg('mamL' + back, 0, 0, 0, 44, [[0, back ? '#4a2e18' : '#6b4426'], [1, back ? '#2e1c0e' : '#3c2614']]), 2);
      c.strokeStyle = back ? 'rgba(20,10,4,.5)' : 'rgba(30,16,6,.45)'; c.lineWidth = 1.4;
      for (let k2 = 0; k2 < 5; k2++) { const yy = 8 + k2 * 7; c.beginPath(); c.moveTo(-11, yy); c.quadraticCurveTo(-6, yy + 6, -9 + k2, yy + 10); c.stroke(); }
      // kožešinová sukně nad kolenem
      c.fillStyle = back ? '#3c2614' : '#5a381e'; for (let t = -12; t <= 10; t += 5) { poly([t, 10, t + 3, 24 + (t % 2) * 3, t + 6, 10]); c.fill(); }
      c.fillStyle = '#e8dcc0'; for (const t of [-8, -1, 6]) ell(t, 44, 3.4, 2.4);
      c.restore();
    };
    leg(-40, 0, 1); leg(24, Math.PI, 1);
    c.save(); c.translate(0, bob);
    // stín pod břichem a hlavní tělo s chlupatým okrajem
    const body = () => {
      c.beginPath(); c.moveTo(-70, -60);
      for (let i = 0; i <= 18; i++) { const a = Math.PI + i / 18 * Math.PI, rx = 66, ry = 50, j = i % 2 ? 1 : 1.07; c.lineTo(-6 + Math.cos(a) * rx * j, -76 + Math.sin(a) * ry * j); }
      c.quadraticCurveTo(64, -40, 40, -34); for (let x = 40; x > -66; x -= 9) c.lineTo(x - 4, -28 + ((x / 9) & 1) * 7); c.closePath();
    };
    body(); fo(lg('mamB', 0, -128, 0, -28, [[0, '#9a6a3c'], [0.45, '#6e4524'], [1, '#3a2210']]), 2.6);
    c.save(); body(); c.clip();
    furTufts(-6, -76, 64, 46, 70, ['rgba(40,22,8,.55)', 'rgba(170,120,70,.45)', 'rgba(90,56,26,.6)'], 7);
    c.fillStyle = 'rgba(0,0,0,.22)'; ell(-6, -36, 70, 16);
    c.restore();
    // kožený postroj s kovovými cvočky
    c.strokeStyle = '#3c2412'; c.lineWidth = 7;
    c.beginPath(); c.moveTo(-50, -114); c.quadraticCurveTo(-36, -70, -40, -32); c.stroke();
    c.beginPath(); c.moveTo(18, -120); c.quadraticCurveTo(28, -76, 24, -34); c.stroke();
    c.strokeStyle = '#6b4423'; c.lineWidth = 4.4;
    c.beginPath(); c.moveTo(-50, -114); c.quadraticCurveTo(-36, -70, -40, -32); c.stroke();
    c.beginPath(); c.moveTo(18, -120); c.quadraticCurveTo(28, -76, 24, -34); c.stroke();
    rivets([[-47, -100], [-41, -80], [-39, -60], [-40, -42], [21, -104], [25, -84], [26, -64], [25, -44]], 1.6);
    // čabraka v barvě týmu s lemem
    c.beginPath(); c.moveTo(-60, -112); c.lineTo(30, -118); c.lineTo(34, -84); c.lineTo(24, -76); c.lineTo(14, -84); c.lineTo(4, -76); c.lineTo(-6, -84); c.lineTo(-16, -76); c.lineTo(-26, -84); c.lineTo(-36, -76); c.lineTo(-46, -84); c.lineTo(-58, -78); c.closePath();
    fo(lg('mamC' + team[0], 0, -118, 0, -76, [[0, team[2]], [0.4, team[0]], [1, team[1]]]), 1.8);
    c.strokeStyle = '#e5c04a'; c.lineWidth = 2; c.beginPath(); c.moveTo(-58, -86); c.lineTo(30, -92); c.stroke();
    c.fillStyle = '#e5c04a'; for (let x = -42; x < 26; x += 16) { poly([x, -106, x + 5, -98, x, -90, x - 5, -98]); c.fill(); }
    // hlava
    c.save(); c.translate(54, -86);
    c.beginPath(); c.moveTo(-26, 20); c.bezierCurveTo(-34, -10, -20, -42, 4, -44); c.bezierCurveTo(26, -44, 34, -18, 28, 6); c.bezierCurveTo(24, 22, 6, 30, -26, 20); c.closePath();
    fo(lg('mamHd', 0, -44, 0, 26, [[0, '#8a5a32'], [1, '#4a2e18']]), 2.4);
    c.save(); c.beginPath(); c.arc(4, -10, 34, 0, Math.PI * 2); c.clip(); furTufts(2, -22, 24, 18, 22, ['rgba(40,22,8,.5)', 'rgba(170,120,70,.4)'], 3); c.restore();
    // bronzová čelní deska s hřebenem
    c.beginPath(); c.moveTo(-10, -40); c.quadraticCurveTo(8, -50, 26, -34); c.lineTo(22, -12); c.quadraticCurveTo(8, -20, -6, -14); c.closePath();
    fo(lg('mamPl', 0, -50, 0, -12, [[0, '#f0c674'], [0.5, '#b8862e'], [1, '#6b4a14']]), 1.8);
    rivets([[-2, -34], [10, -38], [20, -30], [16, -18]], 1.4);
    c.fillStyle = team[0]; poly([2, -44, 8, -66, 14, -46]); c.fill(); poly([10, -44, 18, -62, 20, -42]); c.fill();
    // ucho, oko s obočím a vráskami
    c.beginPath(); c.ellipse(-16, 0, 13, 19, 0.25, 0, Math.PI * 2); fo('#5a381e', 1.8);
    c.fillStyle = 'rgba(0,0,0,.25)'; ell(-14, 2, 7, 12);
    c.fillStyle = '#f5f0e1'; ell(16, -6, 5, 3.6); c.fillStyle = '#1a0c06'; circ(17, -6, 2.6); c.fillStyle = '#ef4444'; circ(17.6, -6.4, 1);
    c.strokeStyle = '#2a1608'; c.lineWidth = 2.6; c.beginPath(); c.moveTo(9, -14); c.quadraticCurveTo(16, -16, 24, -10); c.stroke();
    c.lineWidth = 1; for (let k = 0; k < 3; k++) { c.beginPath(); c.arc(16, -2 + k * 3, 6 + k, 0.2, 1.2); c.stroke(); }
    c.restore();
    // chobot – segmentovaný, při útoku se vztyčí
    const tr = Math.sin(T * 2.2) * 6 - at * 34;
    const tx = 92 + tr * 0.35, ty = -20 + tr;
    c.lineCap = 'round';
    c.strokeStyle = OL; c.lineWidth = 17; c.beginPath(); c.moveTo(72, -82); c.bezierCurveTo(92, -66, 96, -46 + tr * 0.4, tx, ty); c.stroke();
    c.strokeStyle = '#6b4426'; c.lineWidth = 13; c.stroke();
    c.strokeStyle = 'rgba(30,16,6,.5)'; c.lineWidth = 1.2;
    for (let k = 1; k < 9; k++) { const t = k / 9, mt = 1 - t; const x = mt * mt * mt * 72 + 3 * mt * mt * t * 92 + 3 * mt * t * t * 96 + t * t * t * tx, y = mt * mt * mt * -82 + 3 * mt * mt * t * -66 + 3 * mt * t * t * (-46 + tr * 0.4) + t * t * t * ty; ln(x - 5, y - 1, x + 5, y + 1); }
    c.fillStyle = '#4a2e18'; ell(tx, ty, 7, 5); c.fillStyle = '#1a0c06'; circ(tx + 2, ty + 1, 1.8);
    // kly s ocelovými hroty a kroužky
    for (const [o, w, col] of [[7, 0.85, 'mamT2'], [0, 1, 'mamT']]) {
      c.beginPath(); c.moveTo(70 - o, -66); c.bezierCurveTo(104 - o, -46, 124 - o, -64, 116 - o, -100 * w); c.lineTo(110 - o, -98 * w); c.bezierCurveTo(114 - o, -70, 96 - o, -56, 66 - o, -58); c.closePath();
      fo(lg(col, 60, -60, 120, -100, [[0, '#d9ccb0'], [0.5, '#fffaf0'], [1, '#e8dcc0']]), 1.8);
      c.strokeStyle = 'rgba(150,130,100,.6)'; c.lineWidth = 1; for (let k = 0; k < 4; k++) ln(82 - o + k * 8, -60 + k * -4, 86 - o + k * 8, -66 + k * -5);
      rr(98 - o, -72 * w - 6, 8, 6, 2); fo('#9ca3af', 1.2);
      c.beginPath(); c.moveTo(110 - o, -98 * w); c.lineTo(118 - o, -118 * w); c.lineTo(117 - o, -99 * w); c.closePath(); fo('#cbd5e1', 1.2);
    }
    // věž lučištníků na hřbetě
    c.save(); c.translate(-14, -128);
    rr(-34, -4, 68, 8, 2); fo('#5c3a1e', 1.6);
    rr(-32, -30, 64, 28, 3); fo(lg('mamHw', 0, -30, 0, -2, [[0, '#a8774a'], [1, '#5c3a1e']]), 1.8);
    c.strokeStyle = 'rgba(40,20,8,.55)'; c.lineWidth = 1.2; for (let x = -26; x < 32; x += 8) ln(x, -30, x, -2);
    // malované štíty na boku věže
    for (const x of [-20, 0, 20]) { c.beginPath(); c.arc(x, -15, 7, 0, Math.PI * 2); fo(x ? team[0] : '#e5c04a', 1.4); c.fillStyle = '#9ca3af'; circ(x, -15, 2); }
    // lučištníci
    for (const [x, d] of [[-18, 0], [14, 1.3]]) {
      const pull = d ? at : 0;
      c.fillStyle = '#3c2412'; rr(x - 4, -44, 8, 14, 3); c.fill();
      c.fillStyle = '#d9a066'; circ(x, -48, 4.4); c.fillStyle = team[1]; c.beginPath(); c.arc(x, -49, 4.8, Math.PI, 0); c.fill();
      c.strokeStyle = '#6b4423'; c.lineWidth = 1.8; c.beginPath(); c.arc(x + 8 - pull * 2, -40, 9, -1.2, 1.2); c.stroke();
      c.strokeStyle = '#e5e7eb'; c.lineWidth = 0.8; ln(x + 11 - pull * 2, -48, x + 4 - pull * 4, -40); ln(x + 4 - pull * 4, -40, x + 11 - pull * 2, -32);
    }
    // stříška z kůže a prapor
    c.beginPath(); c.moveTo(-38, -30); c.quadraticCurveTo(0, -42, 38, -30); c.lineTo(34, -26); c.quadraticCurveTo(0, -36, -34, -26); c.closePath(); fo('#c9a06a', 1.4);
    c.strokeStyle = '#5c3a1e'; c.lineWidth = 2.6; ln(-30, -30, -30, -78);
    const w2 = Math.sin(T * 4) * 3;
    c.beginPath(); c.moveTo(-30, -78); c.quadraticCurveTo(-14, -80 + w2, 0, -74 + w2); c.lineTo(-6, -66 + w2); c.lineTo(0, -58 + w2); c.quadraticCurveTo(-14, -62 + w2, -30, -58); c.closePath();
    fo(lg('mamFl' + team[0], -30, 0, 0, 0, [[0, team[1]], [1, team[0]]]), 1.2);
    c.fillStyle = '#f0e8d4'; circ(-16, -68 + w2 * 0.6, 3.4); c.fillStyle = '#1a0c06'; circ(-17, -69 + w2 * 0.6, 0.9); circ(-15, -69 + w2 * 0.6, 0.9);
    c.restore();
    // trofejní lebky na provazech
    for (const x of [-56, -36]) { c.strokeStyle = '#3c2412'; c.lineWidth = 1; ln(x, -84, x, -62); c.fillStyle = '#f0e8d4'; ell(x, -58, 4.4, 4); c.fillStyle = '#1a0c06'; circ(x - 1.5, -59, 1); circ(x + 1.5, -59, 1); }
    c.restore();
    leg(-26, Math.PI, 0); leg(38, 0, 0);
    // prach od dupání
    if (walk) for (let k = 0; k < 2; k++) { const t = (T * 1.5 + k * 0.5) % 1; c.fillStyle = `rgba(150,120,90,${0.35 * (1 - t)})`; circ(-30 + k * 64 - t * 16, -2 - t * 10, 4 + t * 9); }
  },

  // ---------------- drak s blanitými křídly a ohnivým dechem ----------------
  (team, ph, at) => {
    const y0 = -112 + Math.sin(T * 2.5) * 7, flap = Math.sin(T * 5.5);
    c.save(); c.translate(0, y0);
    const SC = ['#2f5a24', '#3f7a2e', '#5d9a3e'];
    const wing = (k, back) => {
      const tip = [-40 + flap * 6, -96 * k - 10], f1 = [-86, -70 * k - 6], f2 = [-112, -36 * k + 2], f3 = [-104, 2];
      c.beginPath(); c.moveTo(-6, -10);
      c.lineTo(tip[0], tip[1]);
      c.quadraticCurveTo((tip[0] + f1[0]) / 2 + 2, (tip[1] + f1[1]) / 2 + 16, f1[0], f1[1]);
      c.quadraticCurveTo((f1[0] + f2[0]) / 2 + 10, (f1[1] + f2[1]) / 2 + 14, f2[0], f2[1]);
      c.quadraticCurveTo((f2[0] + f3[0]) / 2 + 14, (f2[1] + f3[1]) / 2 + 8, f3[0], f3[1]);
      c.quadraticCurveTo(-60, 4, -26, 6); c.closePath();
      fo(lg('drW' + back + team[0], -100, -90, -10, 10, [[0, back ? team[1] : team[0]], [1, back ? '#1a1a1a' : team[1]]]), 2);
      c.globalAlpha *= 0.35; c.fillStyle = '#000'; c.beginPath(); c.moveTo(-6, -10); c.lineTo(f1[0], f1[1]); c.lineTo(f2[0], f2[1]); c.closePath(); c.fill(); c.globalAlpha /= 0.35;
      // kosti křídla
      c.strokeStyle = back ? '#1f3a18' : '#2f5a24'; c.lineWidth = 4; c.lineCap = 'round';
      ln(-6, -10, tip[0], tip[1]);
      c.lineWidth = 2.4; for (const f of [f1, f2, f3]) ln(tip[0] + 6, tip[1] + 14, f[0], f[1]);
      c.fillStyle = '#e5e7eb'; poly([tip[0], tip[1], tip[0] - 4, tip[1] - 9, tip[0] + 3, tip[1] - 2]); c.fill();
    };
    wing(0.55 + flap * 0.55, 1);
    // ocas se šupinami a ostnem
    const tailY = Math.sin(T * 3) * 12;
    c.lineCap = 'round';
    c.strokeStyle = OL; c.lineWidth = 17; c.beginPath(); c.moveTo(-30, 6); c.bezierCurveTo(-70, 26, -96, tailY, -132, 14 + tailY * 0.5); c.stroke();
    c.strokeStyle = SC[1]; c.lineWidth = 13; c.stroke();
    c.strokeStyle = SC[0]; c.lineWidth = 5; c.beginPath(); c.moveTo(-30, 1); c.bezierCurveTo(-70, 20, -96, tailY - 5, -130, 9 + tailY * 0.5); c.stroke();
    c.fillStyle = '#7f1d1d'; for (let k = 0; k < 6; k++) { const t = k / 6, x = -40 - t * 86, y = 8 + Math.sin(t * 3) * 6 + tailY * t - 8; poly([x - 4, y + 2, x, y - 9, x + 4, y + 2]); c.fill(); }
    c.save(); c.translate(-134, 14 + tailY * 0.5); c.rotate(-0.4); c.beginPath(); c.moveTo(0, 0); c.lineTo(-20, -10); c.lineTo(-14, 0); c.lineTo(-20, 10); c.closePath(); fo('#7f1d1d', 1.6); c.restore();
    // zadní noha
    const legD = (x, back) => {
      c.save(); c.translate(x, 10);
      c.beginPath(); c.ellipse(0, 4, 11, 14, 0.3, 0, Math.PI * 2); fo(back ? SC[0] : SC[1], 1.8);
      c.strokeStyle = OL; c.lineWidth = 9; ln(2, 14, 8, 32); c.strokeStyle = back ? SC[0] : SC[1]; c.lineWidth = 6; ln(2, 14, 8, 32);
      c.fillStyle = '#e5e7eb'; for (let k = 0; k < 3; k++) { c.beginPath(); c.moveTo(4 + k * 4, 32); c.quadraticCurveTo(7 + k * 4, 40, 4 + k * 4, 44); c.lineTo(7 + k * 4, 33); c.fill(); }
      c.restore();
    };
    legD(-20, 1);
    // tělo se šupinami a břišními pláty
    const bodyP = () => { c.beginPath(); c.ellipse(0, 0, 48, 24, -0.1, 0, Math.PI * 2); };
    bodyP(); fo(lg('drB', 0, -24, 0, 24, [[0, SC[2]], [0.5, SC[1]], [1, SC[0]]]), 2.4);
    c.save(); bodyP(); c.clip();
    c.strokeStyle = 'rgba(20,40,14,.45)'; c.lineWidth = 1;
    for (let r = 0; r < 5; r++) for (let x = -50 + (r % 2) * 5; x < 50; x += 10) { c.beginPath(); c.arc(x, -20 + r * 8, 5, 0.2, Math.PI - 0.2); c.stroke(); }
    c.restore();
    c.save(); c.beginPath(); c.ellipse(4, 12, 36, 11, -0.1, 0, Math.PI); c.closePath();
    fo(lg('drBel', 0, 10, 0, 24, [[0, '#f0dc94'], [1, '#b89a4a']]), 1.6);
    c.clip(); c.strokeStyle = 'rgba(110,80,30,.6)'; c.lineWidth = 1.2; for (let x = -30; x < 40; x += 8) ln(x, 8, x - 2, 26);
    c.restore();
    c.fillStyle = '#7f1d1d'; for (let k = 0; k < 6; k++) { const x = -32 + k * 11; poly([x - 4, -20 + k * 0.3, x + 1, -34 + Math.abs(k - 3), x + 5, -20]); c.fill(); }
    // krk se šupinami
    c.strokeStyle = OL; c.lineWidth = 21; c.beginPath(); c.moveTo(30, -6); c.quadraticCurveTo(50, -14, 60, -36); c.stroke();
    c.strokeStyle = SC[1]; c.lineWidth = 17; c.stroke();
    c.strokeStyle = '#f0dc94'; c.lineWidth = 6; c.beginPath(); c.moveTo(34, 2); c.quadraticCurveTo(54, -6, 66, -30); c.stroke();
    c.fillStyle = '#7f1d1d'; for (let k = 0; k < 3; k++) poly([36 + k * 8, -14 - k * 7, 38 + k * 8, -26 - k * 7, 44 + k * 8, -16 - k * 7]), c.fill();
    // hlava s otevíráním tlamy
    c.save(); c.translate(64, -40); c.rotate(0.15 + at * 0.2);
    const jaw = at * 0.5;
    c.save(); c.rotate(jaw);
    c.beginPath(); c.moveTo(-8, 4); c.lineTo(30, 6); c.lineTo(34, 10); c.lineTo(-6, 14); c.closePath(); fo(SC[0], 1.6);
    c.fillStyle = '#fff'; for (let k = 0; k < 5; k++) { poly([4 + k * 6, 6, 6 + k * 6, 1, 8 + k * 6, 6]); c.fill(); }
    c.restore();
    c.beginPath(); c.moveTo(-14, -12); c.quadraticCurveTo(6, -18, 22, -10); c.lineTo(38, -2); c.quadraticCurveTo(40, 4, 34, 6); c.lineTo(-10, 6); c.closePath();
    fo(lg('drHd', 0, -18, 0, 6, [[0, SC[2]], [1, SC[0]]]), 2);
    c.fillStyle = '#fff'; for (let k = 0; k < 5; k++) { poly([6 + k * 6, 6, 8 + k * 6, 11, 10 + k * 6, 6]); c.fill(); }
    // oko, nozdra, rohy
    c.fillStyle = '#1a1a1a'; ell(10, -8, 6, 4.4); glowDot(10, -8, 7, '#fbbf24'); c.fillStyle = '#fde047'; ell(10, -8, 4, 3); c.fillStyle = '#111'; ell(10.6, -8, 1.2, 2.8);
    c.strokeStyle = '#1f3a18'; c.lineWidth = 2; c.beginPath(); c.moveTo(2, -14); c.lineTo(18, -12); c.stroke();
    c.fillStyle = '#1a1a1a'; circ(34, -2, 1.6);
    for (const [x, l, cl] of [[-8, 26, '#e7e2d4'], [0, 20, '#cfc8b4']]) { c.beginPath(); c.moveTo(x, -12); c.quadraticCurveTo(x - l * 0.5, -l * 0.8 - 10, x - l, -l - 6); c.quadraticCurveTo(x - l * 0.4, -l * 0.6 - 10, x + 6, -12); c.closePath(); fo(cl, 1.4); }
    if (!at && Math.sin(T * 2) > 0.6) { c.fillStyle = 'rgba(120,120,120,.4)'; circ(40 + (T * 20) % 10, -6 - (T * 20) % 10, 3 + (T * 4) % 3); }
    c.restore();
    // ohnivý dech
    if (at > 0.05) {
      const g = c.createLinearGradient(80, -30, 190, 80);
      g.addColorStop(0, `rgba(255,250,200,${0.95 * at})`); g.addColorStop(0.3, `rgba(253,186,40,${0.9 * at})`); g.addColorStop(0.7, `rgba(239,68,30,${0.7 * at})`); g.addColorStop(1, 'rgba(120,20,10,0)');
      c.fillStyle = g; c.beginPath(); c.moveTo(94, -30); c.quadraticCurveTo(150, -26 + Math.sin(T * 30) * 6, 196, 70); c.quadraticCurveTo(160, 84, 130, 66); c.quadraticCurveTo(110, 20, 94, -24); c.closePath(); c.fill();
      for (let k = 0; k < 8; k++) { const t = Math.random(); c.fillStyle = `rgba(255,${180 + (t * 60) | 0},60,${at})`; circ(100 + t * 90 + Math.random() * 14, -20 + t * 86 + Math.random() * 14, 1.5 + Math.random() * 2); }
    }
    legD(14, 0);
    // přední pracka
    c.strokeStyle = OL; c.lineWidth = 8; ln(30, 8, 40, 26); c.strokeStyle = SC[1]; c.lineWidth = 5; ln(30, 8, 40, 26);
    c.fillStyle = '#e5e7eb'; for (let k = 0; k < 3; k++) poly([37 + k * 3, 26, 40 + k * 3, 33, 42 + k * 3, 26]), c.fill();
    wing(0.65 - flap * 0.65, 0);
    c.restore();
  },

  // ---------------- obrněná válečná vzducholoď ----------------
  (team, ph, at) => {
    const y0 = -132 + Math.sin(T * 1.4) * 5;
    c.save(); c.translate(0, y0); c.rotate(Math.sin(T * 0.9) * 0.025);
    // ocasní kormidla s barvou týmu
    for (const [m, dk] of [[-1, 0], [1, 1]]) {
      c.beginPath(); c.moveTo(-58, m * 6); c.lineTo(-102, m * 34); c.lineTo(-96, m * 8); c.lineTo(-86, 0); c.closePath(); fo(dk ? team[1] : team[0], 1.8);
      c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 1; ln(-72, m * 8, -96, m * 26);
    }
    // obal se žebrováním a pásy plátna
    const env = () => { c.beginPath(); c.moveTo(-84, 0); c.bezierCurveTo(-84, -28, -40, -32, 10, -32); c.bezierCurveTo(60, -32, 90, -18, 92, 0); c.bezierCurveTo(90, 18, 60, 32, 10, 32); c.bezierCurveTo(-40, 32, -84, 28, -84, 0); c.closePath(); };
    env(); fo(lg('zepE', 0, -32, 0, 32, [[0, '#ece6d6'], [0.35, '#c8c0ac'], [0.75, '#8f8776'], [1, '#5f584a']]), 2.6);
    c.save(); env(); c.clip();
    c.strokeStyle = 'rgba(60,55,45,.4)'; c.lineWidth = 1.2;
    for (let x = -72; x < 92; x += 13) { c.beginPath(); c.moveTo(x, -34); c.quadraticCurveTo(x + 4, 0, x, 34); c.stroke(); }
    c.strokeStyle = 'rgba(60,55,45,.25)'; for (const y of [-18, -8, 8, 18]) { c.beginPath(); c.moveTo(-90, y); c.quadraticCurveTo(0, y * 1.15, 96, y * 0.6); c.stroke(); }
    c.fillStyle = 'rgba(255,255,255,.28)'; c.beginPath(); c.ellipse(4, -18, 70, 7, 0, 0, Math.PI * 2); c.fill();
    // pancéřové pláty na boku
    for (let x = -50; x < 60; x += 22) { rr(x, -4, 20, 18, 2); fo(lg('zepP', 0, -4, 0, 14, [[0, '#7b828c'], [1, '#3f4550']]), 1); rivets([[x + 3, -1], [x + 17, -1], [x + 3, 11], [x + 17, 11]], 0.9); }
    c.fillStyle = team[0]; c.fillRect(-90, -9, 190, 4); c.fillStyle = team[1]; c.fillRect(-90, -5, 190, 1.6);
    c.restore();
    // kovová špička
    c.beginPath(); c.moveTo(78, -14); c.quadraticCurveTo(98, -8, 98, 0); c.quadraticCurveTo(98, 8, 78, 14); c.closePath(); fo(lg('zepN', 78, 0, 98, 0, [[0, '#9ca3af'], [1, '#4b5563']]), 1.6);
    c.strokeStyle = '#374151'; c.lineWidth = 2; ln(98, 0, 108, 0); c.fillStyle = '#ef4444'; circ(108, 0, 2);
    // znak – lebka v kruhu
    c.beginPath(); c.arc(-24, -14, 11, 0, Math.PI * 2); fo(team[2], 1.6);
    c.fillStyle = '#1a1a1a'; ell(-24, -16, 6, 5.4); c.fillRect(-27, -12, 6, 4); c.fillStyle = team[2]; circ(-26, -16.4, 1.6); circ(-22, -16.4, 1.6);
    // motorové gondoly s vrtulemi
    for (const [x, y, s] of [[-40, 30, 1], [36, 30, 0.9]]) {
      c.strokeStyle = '#374151'; c.lineWidth = 2; ln(x, 18, x, y - 4);
      rr(x - 14, y - 6, 26, 12, 6); fo(lg('zepM', 0, y - 6, 0, y + 6, [[0, '#8b95a5'], [1, '#3f4756']]), 1.4);
      c.fillStyle = `rgba(255,140,40,${0.3 + Math.random() * 0.3})`; circ(x - 15, y, 2.4);
      c.save(); c.translate(x + 14, y); c.scale(1, Math.sin(T * 34 + x)); rr(-1.5, -12 * s, 3, 24 * s, 1.5); fo('#4b5563', 0.8); c.restore();
      c.fillStyle = '#9ca3af'; circ(x + 14, y, 2.4);
    }
    // lana a gondola
    c.strokeStyle = 'rgba(40,30,20,.8)'; c.lineWidth = 1.2;
    for (const [a, b] of [[-26, -30], [-6, -10], [14, 10], [30, 28]]) ln(a, 28, b, 42);
    c.beginPath(); c.moveTo(-44, 42); c.lineTo(42, 42); c.lineTo(36, 62); c.quadraticCurveTo(0, 68, -38, 62); c.closePath();
    fo(lg('zepG', 0, 42, 0, 66, [[0, '#8b5e34'], [1, '#4a2e18']]), 2);
    c.strokeStyle = 'rgba(30,16,6,.5)'; c.lineWidth = 1; ln(-42, 52, 38, 52);
    c.fillStyle = '#fcd34d'; for (let x = -34; x < 30; x += 11) { rr(x, 45, 7, 6, 1); c.fill(); }
    rivets([[-40, 44], [38, 44], [-36, 60], [34, 60]], 1.1);
    // dělové věže pod gondolou (zpětný ráz)
    for (const [x, y] of [[26, 60], [-14, 64]]) {
      c.beginPath(); c.arc(x, y, 7, 0, Math.PI); fo('#374151', 1.4);
      c.save(); c.translate(x, y + 3); c.rotate(0.45); rr(-at * 6, -2.4, 24, 5, 2); fo('#1f2937', 1.2); c.restore();
    }
    // reflektor
    const op = c.globalCompositeOperation; c.globalCompositeOperation = 'lighter';
    c.fillStyle = 'rgba(255,240,180,.08)'; c.beginPath(); c.moveTo(40, 54); c.lineTo(140, 150); c.lineTo(80, 150); c.closePath(); c.fill();
    c.globalCompositeOperation = op;
    // vlajka na zádi
    c.strokeStyle = '#374151'; c.lineWidth = 1.6; ln(-86, 0, -110, -4);
    const w = Math.sin(T * 5) * 2; c.beginPath(); c.moveTo(-110, -4); c.lineTo(-130, -8 + w); c.lineTo(-130, 4 + w); c.lineTo(-110, 6); c.closePath(); fo(team[0], 1);
    // kouř z motorů
    for (let k = 0; k < 4; k++) { const t = (T * 0.8 + k / 4) % 1; c.fillStyle = `rgba(90,90,90,${0.3 * (1 - t)})`; circ(-56 - t * 50, 30 - t * 14, 3 + t * 8); }
    c.restore();
  },

  // ---------------- pozemní křižník – obří tank se třemi věžemi ----------------
  (team, ph, at, st, walk) => {
    const tw = ph * 1.6;
    // pásy s články a koly
    const track = () => { rr(-82, -34, 166, 34, 17); };
    track(); fo('#1a1c18', 2.2);
    c.save(); track(); c.clip();
    c.fillStyle = '#2a2d26'; for (let k = 0; k < 24; k++) { const x = -86 + ((k * 7.4 + tw * 4) % 177); c.fillRect(x, -36, 4.2, 5); c.fillRect(x, -4, 4.2, 5); }
    c.restore();
    for (let k = 0; k < 8; k++) { const x = -64 + k * 18.5; c.beginPath(); c.arc(x, -15, 9.5, 0, Math.PI * 2); fo('#3a3f36', 1.4); c.fillStyle = '#5a6054'; circ(x, -15, 5); c.save(); c.translate(x, -15); c.rotate(tw * 0.6); c.fillStyle = '#2a2d26'; for (let s = 0; s < 4; s++) { c.rotate(Math.PI / 2); c.fillRect(1.5, -1, 3, 2); } c.restore(); }
    for (const x of [-78, 78]) { c.beginPath(); c.arc(x, -18, 11, 0, Math.PI * 2); fo('#3a3f36', 1.4); c.fillStyle = '#5a6054'; circ(x, -18, 5); }
    // bláto
    c.fillStyle = 'rgba(90,70,40,.55)'; for (const [x, r] of [[-70, 6], [-30, 5], [10, 7], [50, 5], [76, 6]]) ell(x, -4, r, 3);
    // boční pancéřové zástěrky
    c.beginPath(); c.moveTo(-86, -34); c.lineTo(86, -34); c.lineTo(84, -22); c.lineTo(-84, -22); c.closePath(); fo(lg('btSk', 0, -34, 0, -22, [[0, '#6d7a52'], [1, '#3d4630']]), 1.6);
    rivets(Array.from({ length: 12 }, (_, i) => [-78 + i * 14.4, -28]), 1);
    // korba se šikmým pancířem
    const hull = () => { c.beginPath(); c.moveTo(-88, -34); c.lineTo(-80, -70); c.lineTo(58, -70); c.lineTo(92, -46); c.lineTo(90, -34); c.closePath(); };
    hull(); fo(lg('btH', 0, -70, 0, -34, [[0, '#86946a'], [0.5, '#5d6a44'], [1, '#3a4228']]), 2.4);
    c.save(); hull(); c.clip();
    c.fillStyle = 'rgba(40,46,28,.55)'; for (const [x, y, r] of [[-56, -58, 14], [-10, -46, 12], [30, -60, 10], [70, -48, 9]]) ell(x, y, r, r * 0.5);
    c.fillStyle = 'rgba(120,90,50,.35)'; for (const [x, y, r] of [[-30, -62, 9], [48, -40, 8]]) ell(x, y, r, r * 0.5);
    c.strokeStyle = 'rgba(20,24,14,.5)'; c.lineWidth = 1.2; ln(-86, -50, 92, -50); ln(-20, -70, -24, -34); ln(40, -70, 44, -34);
    c.fillStyle = 'rgba(255,255,255,.15)'; c.fillRect(-90, -70, 190, 4);
    c.restore();
    rivets([[-76, -66], [-40, -66], [0, -66], [40, -66], [-78, -40], [-40, -40], [0, -40], [40, -40], [80, -40]], 1.2);
    c.fillStyle = team[0]; c.fillRect(-80, -56, 30, 4); c.fillStyle = '#f5f0e1'; c.font = '900 10px system-ui'; c.textAlign = 'center'; c.fillText('666', -64, -40);
    // výfuky s kouřem
    for (const x of [-76, -66]) { rr(x, -84, 6, 16, 2); fo('#2a2d26', 1.2); }
    for (let k = 0; k < 4; k++) { const t = (T * 0.7 + k / 4) % 1; c.fillStyle = `rgba(60,60,60,${0.4 * (1 - t)})`; circ(-70 - t * 20, -88 - t * 50, 3 + t * 9); }
    // zadní věž s kulometem
    c.beginPath(); c.moveTo(-60, -70); c.lineTo(-56, -86); c.lineTo(-26, -86); c.lineTo(-20, -70); c.closePath(); fo('#56603f', 1.8);
    rr(-24 - at * 3, -82, 34, 4, 2); fo('#1f2320', 1.2);
    // hlavní věž
    const tur = () => { c.beginPath(); c.moveTo(-18, -70); c.lineTo(-10, -104); c.lineTo(46, -108); c.lineTo(60, -92); c.lineTo(62, -70); c.closePath(); };
    tur(); fo(lg('btT', 0, -108, 0, -70, [[0, '#8fa070'], [0.6, '#5d6a44'], [1, '#3a4228']]), 2.2);
    c.save(); tur(); c.clip(); c.fillStyle = 'rgba(40,46,28,.5)'; ell(14, -90, 14, 6); c.fillStyle = 'rgba(255,255,255,.14)'; c.fillRect(-20, -108, 90, 5); c.restore();
    rivets([[-6, -100], [10, -102], [28, -104], [44, -102], [-10, -76], [56, -76]], 1.2);
    // dvojhlaveň s úsťovými brzdami
    for (const y of [-98, -86]) {
      rr(56 - at * 10, y, 84, 8, 2); fo(lg('btBr', 0, y, 0, y + 8, [[0, '#4a5040'], [1, '#1f2320']]), 1.4);
      rr(136 - at * 10, y - 2.5, 14, 13, 2); fo('#1a1c18', 1.2); c.fillStyle = '#000'; c.fillRect(140 - at * 10, y + 1, 2, 6); c.fillRect(145 - at * 10, y + 1, 2, 6);
      if (at > 0.7) { c.fillStyle = `rgba(255,200,80,${at})`; circ(156 - at * 10, y + 4, 8 * at); }
    }
    rr(52, -100, 8, 26, 2); fo('#3a4228', 1.2);
    // velitel v průlezu
    rr(8, -116, 22, 10, 3); fo('#4a5438', 1.4);
    c.fillStyle = '#2a2d22'; rr(14, -128, 10, 12, 3); c.fill(); c.fillStyle = '#d9a066'; circ(19, -131, 4); c.fillStyle = team[1]; c.beginPath(); c.arc(19, -132, 4.6, Math.PI, 0); c.fill();
    // lebka na věži, anténa
    c.fillStyle = '#e5e7eb'; ell(26, -90, 7, 6); c.fillRect(22.5, -86, 7, 4); c.fillStyle = '#1a1c14'; circ(23.5, -91, 1.8); circ(28.5, -91, 1.8);
    c.strokeStyle = '#2a2d22'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(-4, -104); c.quadraticCurveTo(-8 - Math.sin(T * 3) * 4, -130, -14 - Math.sin(T * 3) * 6, -150); c.stroke();
    c.fillStyle = team[0]; poly([-14 - Math.sin(T * 3) * 6, -150, -2, -146, -12 - Math.sin(T * 3) * 6, -142]); c.fill();
    // přední kulometné hnízdo
    c.beginPath(); c.arc(78, -50, 8, Math.PI, 0); fo('#56603f', 1.4); rr(80 - at * 3, -54, 22, 3.4, 1.5); fo('#1f2320', 1);
  },

  // ---------------- Titán – obří bojový mech budoucnosti ----------------
  (team, ph, at, st, walk, bob) => {
    const sw = Math.sin(ph * 0.45) * walk;
    const ARM = (k) => lg('tiA' + k, -20, 0, 20, 0, [[0, '#3f4756'], [0.5, '#9aa4b5'], [1, '#4a5160']]);
    // noha: stehno, píst, holeň (zpětné koleno), chodidlo s prsty
    const leg = (o, back) => {
      const k = Math.sin(ph * 0.45 + o) * walk;
      c.save(); c.translate(o ? -14 : 14, -96 + bob); c.rotate(k * 0.3);
      if (back) c.globalAlpha *= 0.85;
      c.beginPath(); c.moveTo(-14, -4); c.lineTo(14, -4); c.lineTo(10, 46); c.lineTo(-10, 46); c.closePath(); fo(back ? '#3a414e' : ARM(0), 2);
      c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 1; ln(-8, 6, 6, 6); ln(-6, 30, 6, 30);
      c.strokeStyle = '#c0c7d2'; c.lineWidth = 3; ln(-12, 8, -8, 50);
      c.fillStyle = '#1f2430'; circ(0, 48, 9); c.fillStyle = '#5f6878'; circ(0, 48, 4.4);
      c.translate(0, 48); c.rotate(-k * 0.5 - 0.15 * walk);
      c.beginPath(); c.moveTo(-10, 0); c.lineTo(12, 0); c.lineTo(8, 38); c.lineTo(-6, 38); c.closePath(); fo(back ? '#363c48' : ARM(1), 2);
      c.fillStyle = 'rgba(255,170,40,.6)'; for (let v = 0; v < 3; v++) c.fillRect(-3, 10 + v * 6, 8, 2);
      c.translate(0, 38); c.rotate(k * 0.25);
      c.beginPath(); c.moveTo(-16, 0); c.lineTo(18, 0); c.lineTo(26, 8); c.lineTo(-20, 8); c.closePath(); fo('#2b3040', 1.6);
      c.fillStyle = '#1f2430'; for (const x of [-18, 4, 22]) { poly([x - 4, 8, x, 13, x + 4, 8]); c.fill(); }
      c.restore();
    };
    leg(Math.PI, 1);
    c.save(); c.translate(0, bob);
    // pánev
    rr(-32, -108, 64, 22, 7); fo(lg('tiP', 0, -108, 0, -86, [[0, '#5f6878'], [1, '#2b3040']]), 2);
    c.fillStyle = '#e5c04a'; c.save(); rr(-28, -94, 56, 6, 2); c.clip(); for (let x = -30; x < 30; x += 8) { c.fillStyle = (x / 8) & 1 ? '#111' : '#e5c04a'; poly([x, -94, x + 4, -94, x + 8, -88, x + 4, -88]); c.fill(); } c.restore();
    // kabely
    c.strokeStyle = '#1f2430'; c.lineWidth = 3;
    for (const [x, d] of [[-20, -1], [20, 1]]) { c.beginPath(); c.moveTo(x, -104); c.quadraticCurveTo(x + d * 14, -118, x + d * 8, -132); c.stroke(); }
    // trup – vrstvený pancíř
    const torso = () => { c.beginPath(); c.moveTo(-44, -104); c.lineTo(-52, -150); c.lineTo(-34, -180); c.lineTo(34, -180); c.lineTo(52, -152); c.lineTo(42, -104); c.closePath(); };
    torso(); fo(lg('tiT', -52, 0, 52, 0, [[0, '#3f4756'], [0.45, '#a8b2c2'], [0.6, '#8b95a5'], [1, '#3a414e']]), 2.6);
    c.save(); torso(); c.clip();
    c.strokeStyle = 'rgba(20,24,34,.55)'; c.lineWidth = 1.2;
    ln(-50, -146, 50, -146); ln(-46, -124, 46, -124); ln(-20, -180, -26, -104); ln(20, -180, 24, -104);
    c.fillStyle = 'rgba(255,255,255,.18)'; c.beginPath(); c.moveTo(-34, -180); c.lineTo(34, -180); c.lineTo(28, -170); c.lineTo(-28, -170); c.closePath(); c.fill();
    // průduchy s žárem
    for (const x of [-38, 26]) for (let v = 0; v < 3; v++) { rr(x, -138 + v * 6, 12, 3, 1); c.fillStyle = `rgba(255,${100 + v * 30},30,${0.5 + Math.sin(T * 6 + v) * 0.25})`; c.fill(); }
    c.restore();
    rivets([[-40, -110], [38, -110], [-46, -146], [46, -146], [-30, -176], [30, -176]], 1.4);
    // pás v barvě týmu a znak
    c.beginPath(); c.moveTo(-48, -128); c.lineTo(48, -128); c.lineTo(46, -120); c.lineTo(-46, -120); c.closePath(); fo(team[0], 1.2);
    // reaktor v hrudi
    const pr = 0.75 + Math.sin(T * 4) * 0.25;
    c.globalAlpha *= pr; glowDot(0, -150, 30, team[2]); c.globalAlpha /= pr;
    c.beginPath(); c.arc(0, -150, 13, 0, Math.PI * 2); fo('#11151f', 2);
    c.strokeStyle = team[2]; c.lineWidth = 2; for (let k = 0; k < 6; k++) { const a = T * 2 + k * Math.PI / 3; ln(Math.cos(a) * 5, -150 + Math.sin(a) * 5, Math.cos(a) * 10, -150 + Math.sin(a) * 10); }
    glowDot(0, -150, 9, '#e0f7ff');
    // zadní rameno s raketometem
    c.save(); c.translate(-48, -170);
    rr(-22, -22, 36, 28, 5); fo(lg('tiRk', 0, -22, 0, 6, [[0, '#5f6878'], [1, '#2b3040']]), 1.8);
    c.fillStyle = '#11151f'; for (let r = 0; r < 2; r++) for (let k = 0; k < 3; k++) circ(-14 + k * 10, -14 + r * 11, 3.4);
    c.fillStyle = '#ef4444'; for (let r = 0; r < 2; r++) for (let k = 0; k < 3; k++) circ(-14 + k * 10, -14 + r * 11, 1.4);
    c.fillStyle = team[0]; c.fillRect(-22, 2, 36, 4);
    c.restore();
    // hlava s průzorem a anténami
    c.save(); c.translate(2, -190);
    c.beginPath(); c.moveTo(-18, 12); c.lineTo(-20, -6); c.lineTo(-10, -18); c.lineTo(14, -18); c.lineTo(22, -6); c.lineTo(20, 12); c.closePath(); fo(lg('tiH', 0, -18, 0, 12, [[0, '#a8b2c2'], [1, '#3f4756']]), 2);
    rr(-14, -6, 32, 8, 3); fo('#11151f', 1.4);
    glowLine(-10, -2, 14, -2, '#ef4444', 2.4);
    const sc = Math.sin(T * 1.5) * 10; glowDot(2 + sc, -2, 6, '#ff6b6b');
    c.strokeStyle = '#9aa3b2'; c.lineWidth = 1.6; ln(-12, -18, -16, -34); ln(10, -18, 12, -28);
    c.fillStyle = Math.sin(T * 6) > 0 ? '#ef4444' : '#7f1d1d'; circ(-16, -35, 2.2);
    c.restore();
    // přední rameno – mohutný nárameník a iontové dělo
    c.save(); c.translate(46, -162); c.rotate(-0.12 + sw * 0.05);
    c.beginPath(); c.moveTo(-22, -16); c.quadraticCurveTo(4, -32, 24, -14); c.lineTo(22, 6); c.lineTo(-20, 6); c.closePath();
    fo(lg('tiSh' + team[0], 0, -30, 0, 6, [[0, team[2]], [0.5, team[0]], [1, team[1]]]), 2);
    rivets([[-14, -6], [0, -12], [14, -6]], 1.4);
    c.fillStyle = '#e5c04a'; c.fillRect(-18, 0, 38, 3);
    rr(-10, 4, 22, 40, 6); fo(ARM(2), 1.8);
    c.strokeStyle = '#c0c7d2'; c.lineWidth = 2.4; ln(-6, 8, -6, 40);
    // dělo
    c.translate(2, 46);
    rr(-14, -12, 30, 26, 6); fo('#2b3040', 1.8);
    rr(10 - at * 10, -9, 74, 20, 6); fo(lg('tiG', 0, -9, 0, 11, [[0, '#b2bccb'], [0.5, '#6b7590'], [1, '#2b3040']]), 2);
    for (let k = 0; k < 4; k++) { rr(18 - at * 10 + k * 14, -11, 6, 24, 2); fo('#3a414e', 1.2); glowLine(21 - at * 10 + k * 14, -7, 21 - at * 10 + k * 14, 9, '#b388ff', 1.1); }
    rr(80 - at * 10, -12, 10, 26, 3); fo('#1f2430', 1.4);
    const ch = 0.6 + Math.sin(T * 8) * 0.2 + at;
    c.globalAlpha *= Math.min(1, ch); glowDot(92 - at * 10, 1, 10 + at * 18, '#b388ff'); c.globalAlpha /= Math.min(1, ch);
    c.restore();
    // pára z ventilů
    for (let k = 0; k < 3; k++) { const t = (T * 0.9 + k / 3) % 1; c.fillStyle = `rgba(220,225,235,${0.35 * (1 - t)})`; circ(-46 - t * 18, -110 - t * 40, 3 + t * 8); }
    c.restore();
    leg(0, 0);
  },
];
