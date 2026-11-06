// =====================================================================
//  ZBRANĚ JEDNOTEK – tvary zbraní národů a kreslení zbraně v ruce
// =====================================================================
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
