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
let GORE = null, NO_RIDER = false, NO_LEGS = false, NO_BHEAD = false, BOSS_STILL = false;   // BOSS_STILL: mrtvý boss (drak nemává)
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
