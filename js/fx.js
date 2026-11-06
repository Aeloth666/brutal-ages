// =====================================================================
//  PROJEKTILY
// =====================================================================
function drawProj(pr) {
  const x = MX(pr.x), y = pr.y;
  let dx = mirror ? -pr.dx : pr.dx, dy = pr.dy;
  const L = Math.hypot(dx, dy) || 1; dx /= L; dy /= L;
  c.lineCap = 'round';
  switch (pr.p) {
    case 'stone': stoneBall(x, y, 3.2); break;               // stejné kameny jako v lžíci věže
    case 'rock': stoneBall(x, y, 6); break;
    case 'egg':                                       // vosí hnízdo s rojem vos
      c.beginPath(); c.ellipse(x, y, 5, 6.2, 0, 0, Math.PI * 2); fo('#b98f4e', 1.1);
      c.strokeStyle = 'rgba(90,60,20,.7)'; c.lineWidth = 0.8; for (const k of [-3, 0, 3]) { c.beginPath(); c.ellipse(x, y + k, 4.4, 1.1, 0, 0, Math.PI); c.stroke(); }
      c.fillStyle = '#facc15'; for (let k = 0; k < 4; k++) { const a = T * 9 + k * 1.6; circ(x + Math.cos(a) * 8, y + Math.sin(a) * 6, 0.9); }
      break;
    case 'oil': {                                       // žhnoucí kapka rozžhaveného oleje s ocasem a kouřem
      glowDot(x, y, 16, '#ff7a1a');
      for (let k = 1; k <= 4; k++) { c.fillStyle = k % 2 ? '#f97316' : '#fbbf24'; circ(x - dx * k * 5, y - dy * k * 5 + Math.sin(T * 20 + k) * 0.8, 4.2 - k * 0.8); }
      c.beginPath(); c.ellipse(x, y, 6.5, 5.5, Math.atan2(dy, dx), 0, Math.PI * 2); c.fillStyle = c.createRadialGradient(x - 1, y - 1, 0, x, y, 6.5); c.fillStyle.addColorStop(0, '#fff7c2'); c.fillStyle.addColorStop(0.45, '#fbbf24'); c.fillStyle.addColorStop(0.8, '#ea580c'); c.fillStyle.addColorStop(1, '#7c2d12'); c.fill();
      if (Math.random() < 0.4) fx.push({ smoke: 1, x: pr.x - pr.dx * 0.02, y, vx: rnd(-8, 8), vy: -25, r: 3, l: 0.5, ml: 0.5, col: 'rgba(60,50,45,.8)', col2: 'rgba(110,100,95,.5)' });
      break;
    }
    case 'arrow': case 'fire':
      c.strokeStyle = OL; c.lineWidth = 3; ln(x - dx * 16, y - dy * 16, x, y);
      c.strokeStyle = '#a0703c'; c.lineWidth = 1.6; ln(x - dx * 16, y - dy * 16, x, y);
      c.fillStyle = '#e5e7eb'; c.beginPath(); c.moveTo(x - dx * 16, y - dy * 16); c.lineTo(x - dx * 20 - dy * 3, y - dy * 20 + dx * 3); c.lineTo(x - dx * 12, y - dy * 12); c.lineTo(x - dx * 20 + dy * 3, y - dy * 20 - dx * 3); c.fill();
      c.fillStyle = '#9aa1ab'; c.beginPath(); c.moveTo(x + dx * 4, y + dy * 4); c.lineTo(x - dy * 2.5, y + dx * 2.5); c.lineTo(x + dy * 2.5, y - dx * 2.5); c.fill();
      if (pr.p === 'fire') glowDot(x, y, 9, '#f97316');
      break;
    case 'bullet': glowLine(x - dx * 12, y - dy * 12, x, y, '#facc15', 1.6); break;
    case 'shell': c.beginPath(); c.arc(x, y, 4.8, 0, Math.PI * 2); fo('#1f1f1f', 1); c.fillStyle = '#6b7280'; circ(x - 1.5, y - 1.5, 1.5); break;
    case 'rocket':
      c.save(); c.translate(x, y); c.rotate(Math.atan2(dy, dx));
      rr(-14, -2.6, 16, 5.2, 2.6); fo('#d1d5db', 1); c.fillStyle = '#ef4444'; poly([2, -2.6, 6, 0, 2, 2.6]); c.fill();
      c.fillStyle = '#6b7280'; poly([-14, -2.6, -18, -6, -12, -2.6]); c.fill(); poly([-14, 2.6, -18, 6, -12, 2.6]); c.fill();
      c.restore(); glowDot(x - dx * 18, y - dy * 18, 8, '#f97316'); break;
    case 'laser': glowLine(x - dx * 24, y - dy * 24, x, y, '#38e1ff', 2.2); break;
    case 'rlaser': glowLine(x - dx * 24, y - dy * 24, x, y, '#f43f5e', 2.2); break;
    case 'plasma': glowDot(x, y, 10, '#4ade80'); glowDot(x, y, 4, '#ffffff'); break;
    case 'axe': {                                       // rotující vrhací sekera
      c.save(); c.translate(x, y); c.rotate(T * 18);
      rr(-6, -1, 12, 2, 1); fo('#6b4423', 0.8);
      c.beginPath(); c.moveTo(2, -1); c.lineTo(4, -6.5); c.quadraticCurveTo(8, -4, 7.5, 1.5); c.closePath(); fo('#c4cad3', 0.9);
      c.restore(); break;
    }
    case 'ion': glowDot(x, y, 14, '#b388ff'); glowDot(x, y, 6, '#ffffff'); break;
    case 'meteor':
      for (let k = 5; k >= 1; k--) { c.globalAlpha = 0.16 * (6 - k); glowDot(x - dx * k * 10, y - dy * k * 10, 13 - k, '#f97316'); }
      c.globalAlpha = 1;
      c.beginPath(); c.arc(x, y, 9, 0, Math.PI * 2); fo(rg('met', 0, 0, 0, 9, [[0, '#b45309'], [1, '#451a03']]), 1.3);
      c.fillStyle = '#7c2d12'; circ(x - 3, y + 2, 2.2); circ(x + 3, y - 2, 1.6);
      glowDot(x + dx * 3, y + dy * 3, 10, '#fb923c'); break;
    case 'bomb':
      c.save(); c.translate(x, y); c.rotate(Math.atan2(dy, dx));
      c.beginPath(); c.ellipse(0, 0, 9, 4.5, 0, 0, Math.PI * 2); fo('#3f4a2a', 1.2);
      c.fillStyle = '#2a2a2a'; poly([-8, 0, -13, -5, -12, 0, -13, 5]); c.fill(); c.restore(); break;
    case 'beam': {
      const top = Math.max(0, y - 360);
      glowLine(x, top, x, y, '#38e1ff', 5);
      glowDot(x, y, 18, '#38e1ff'); break;
    }
  }
}

// =====================================================================
//  EFEKTY
// =====================================================================
function addFx(e) {
  const [x, y, k] = e;
  if (!(k === 'muz' && e[3] != null)) sfx(k, x);                 // výstřel věže má vlastní zvuk podle druhu věže (níž)
  const part =(n, col, sp, r, l, g = 320) => { n = Math.round(n * GFX_PART[GFXL]); for (let i = 0; i < n; i++) fx.push({ x, y, vx: rnd(-sp, sp), vy: rnd(-sp * 1.4, sp * 0.2), l, ml: l, col, r, g }); };
  const smoke = (n, r, l) => { n = Math.max(1, Math.round(n * GFX_PART[GFXL])); for (let i = 0; i < n; i++) fx.push({ smoke: 1, x: x + rnd(-10, 10), y: y + rnd(-8, 4), vx: rnd(-15, 15), vy: rnd(-40, -15), r: r * rnd(0.6, 1.2), l, ml: l }); };
  switch (k) {
    case 'hit':
      part(5, '#ffeaa0', 90, 1.6, 0.25, 200); part(3, '#e11d48', 60, 2, 0.4);
      if (BRUT() && !BF.includes(x)) bloodBurst(x, y, 9, 150, true);   // zásah bez zabití – skoro bez kaluží
      break;
    case 'die': {
      if (BRUT() && !SET.egg && !bloodCode && !bloodCodeUsed && V && V.time > 90 && Math.random() < 0.05) bloodCode = { x: Math.max(160, Math.min(W - 160, MX(x))), l: 14, ml: 14 };
      if (SET.chicken) { part(10, '#f8fafc', 110, 2.2, 1, 120); sfx('cluck', x); }
      seasonDie(x);
      const cp = { corpse: 1, x, side: e[3], a: e[4], ty: e[5], m: e[6] | 0, l: e[5] === 5 ? 3 : 1.3, ml: e[5] === 5 ? 3 : 1.3 };
      if (e[5] === 5) {                                   // padlý boss: série výbuchů a velký nápis
        if (e[3] !== mySide) achBoss(e[4]);
        shake = 2; vib([150, 60, 250]);
        for (let k = 0; k < 6; k++) fx.push({ fire: 1, x: x + rnd(-60, 60), y: GY - rnd(10, BOSSES[e[4]].y + 30), r: rnd(30, 50), l: 0.5 + k * 0.12, ml: 0.5 + k * 0.12 });
        fx.push({ ring: 1, x, y: GY - 40, l: 0.8, ml: 0.8, r: 220, col: '#fbbf24' });
        fx.push({ txt: (e[3] === mySide ? '💀 ' : '🏆 ') + BOSSES[e[4]].n.toUpperCase() + ' PADL!', x, y: GY - 170, vy: -20, l: 3, ml: 3 });
        sfx('boom', x);
      }
      fx.push(cp);
      part(5, '#b91c1c', 80, 2.2, 0.5); smoke(2, 8, 0.6);
      if (BRUT()) gore(cp);
      break;
    }
    case 'boom':
      if (EXTREME() && Math.random() < 0.25) screenSplat(MX(x), y, true);
      fx.push({ fire: 1, x, y, r: 30, l: 0.38, ml: 0.38 });
      smoke(6, 14, 1.1); part(10, '#fbbf24', 170, 2.4, 0.5); part(6, '#57534e', 120, 2.8, 0.7);
      fx.push({ ring: 1, x, y, l: 0.3, ml: 0.3, r: 40 }); break;
    case 'zap': fx.push({ fire: 1, x, y, r: 26, l: 0.3, ml: 0.3, col: '#38e1ff' }); part(10, '#a5f3fc', 140, 2, 0.4); break;
    case 'oilsp':                                     // dopad oleje: cákance a hořící louže
      fx.push({ burn: 1, x, y: GY - 2, r: 30, l: 1.6, ml: 1.6 }); fx.push({ fire: 1, x, y: y, r: 26, l: 0.3, ml: 0.3 });
      part(18, '#f97316', 170, 2.4, 0.7, -160); part(8, '#fde047', 120, 1.6, 0.5, -120); smoke(4, 10, 1.2); sfx('sizzle', x); break;
    case 'muz':
      if (e[3] != null) {
        TSHOT.set(e[3] + '|' + e[4], T);
        const tu = V && V.pl[e[3]] && V.pl[e[3]].tur[e[4]];
        sfx(tu ? 'tu' + tu.a + tu.i : 'muz', x);
        if (tu && tu.a < 2) break;                                    // vrhací stroje bez záblesku
      }
      fx.push({ flash: 1, x, y, l: 0.09, ml: 0.09, r: 9 }); fx.push({ smoke: 1, x, y, vx: rnd(-10, 10), vy: -20, r: 5, l: 0.5, ml: 0.5 }); break;
    case 'up': fx.push({ ring: 1, x, y, l: 0.6, ml: 0.6, r: 70, col: '#4ade80' }); part(12, '#86efac', 120, 2, 0.6, -60); break;
    case 'slam':
      fx.push({ ring: 1, x, y, l: 0.45, ml: 0.45, r: 130, col: '#fbbf24' }); fx.push({ fire: 1, x, y, r: 40, l: 0.35, ml: 0.35 });
      smoke(8, 16, 1); part(16, '#a16207', 200, 3, 0.7); vib(e[3] === mySide ? 50 : 0); break;
    case 'roar': shake = 1.5; vib([200, 80, 200]); break;
    case 'evt': evtBanner = { t: (e[3] === 'wave' ? '♾ VLNA ' + e[4] + (e[4] % 10 === 0 || (e[4] >= 25 && e[4] % 5 === 0) ? ' – BOSS!' : '') : e[3] === 'meteors' ? SKYFIRE[e[4] | 0] : e[3] === 'boss' ? '👹 BOSS: ' + BOSSES[e[4] | 0].n.toUpperCase() + '!' : EVENTS[e[3]]) || '', l: e[3] === 'boss' ? 4 : 3 }; if (e[3] === 'quake') { shake = 1.2; vib([80, 40, 120]); } sfx('evt'); break;
    case 'chest': if (SEASON && e[3] === mySide) achId(SEASON === 'xmas' ? 'gift' : 'candy');
      fx.push({ txt: '+' + e[4].toLocaleString('cs') + ' zlata', x, y: y - 20, vy: -30, l: 1.6, ml: 1.6 }); part(18, '#facc15', 140, 2.2, 0.8); sfx('buy'); break;
    case 'rhit': bloodBurst(x, y, 16, 220, true); if (Math.random() < 0.2) addPool(x, rnd(4, 8)); shake = Math.max(shake, 0.25); break;
    case 'cry': {
      const ag = e[4] >> 2;                               // e[4] = věk × 4 + národ
      if (e[5] === 2 && ag <= 1) { sfx(ag === 0 ? MOUNT_OF[e[4] & 3] : 'horse', x); break; }   // jízdní zvíře se ozve samo
      if (e[5] === 5) { if (ag <= 1) sfx(ag === 0 ? 'tiger' : 'dragon', x); break; }
      if (e[5] >= 3 || Math.random() < 0.45) cry(e[4], x, e[3], e[5] >= 3);
      break;
    }
    case 'bast': if (e[3] === mySide) achId('bast');
      fx.push({ ring: 1, x, y, l: 0.9, ml: 0.9, r: 160, col: '#4ade80' }); fx.push({ txt: '🛡 POSLEDNÍ BAŠTA!', x, y: y - 40, vy: -25, l: 2.2, ml: 2.2 }); sfx('evo'); break;
    case 'gcry': if (e[3] === mySide) { achId('gcry'); fx.push({ txt: '📯 VÁLEČNÝ POKŘIK!', x, y: y - 20, vy: -25, l: 2, ml: 2 }); const p = V.pl[e[3]]; cry(p.age * 4 + ((p.af && p.af[p.age]) | 0), x, e[3], true); } break;
    case 'lava': achId('lava'); fx.push({ fire: 1, x, y, r: 55, l: 0.7, ml: 0.7 }); part(24, '#ff6a14', 260, 3, 0.9, -200); smoke(6, 14, 1.2); shake = Math.max(shake, 0.6); sfx('boom', x); break;
    case 'bsk': {
      const K = BOSS_SK[e[4]]; if (!K) break;
      fx.push({ txt: K.ic + ' ' + K.n.toUpperCase() + '!', x, y, vy: -22, l: 1.8, ml: 1.8 });
      if (e[4] === 0) { fx.push({ ring: 1, x, y: GY - 40, l: 0.7, ml: 0.7, r: 230, col: '#fbbf24' }); sfx('tiger', x); shake = Math.max(shake, 0.5); }
      else if (e[4] === 1) { sfx('dragon', x); for (let i = 0; i < 6; i++) fx.push({ fire: 1, x: x + (e[3] ? -1 : 1) * (40 + i * 40), y: GY - 40 - i * 4, r: 40, l: 0.8, ml: 0.8 }); }
      else if (e[4] === 4) { sfx('zap', x); fx.push({ ring: 1, x, y: GY - 60, l: 0.6, ml: 0.6, r: 90, col: '#38bdf8' }); }
      else sfx('evt', x);
      break;
    }
    case 'burn': for (let i = 0; i < 5; i++) fx.push({ fire: 1, x: x + rnd(-30, 30), y: y + i * 30, r: 30, l: 2.5, ml: 2.5 }); break;
    case 'sbon': { const B = SBON[e[4]]; if (B) { fx.push({ txt: B.ic + ' ' + B.n.toUpperCase(), x, y, vy: -25, l: 2, ml: 2 }); sfx('up', x); } break; }
    case 'abil': {
      const A = ABIL[e[4]]; if (!A) break;
      fx.push({ ring: 1, x, y: GY - 40, l: 0.8, ml: 0.8, r: 200, col: `rgb(${A.col})` });
      fx.push({ txt: A.ic + ' ' + A.n.toUpperCase(), x, y: y - 20, vy: -25, l: 1.8, ml: 1.8 });
      sfx(e[4] === 3 ? 'up' : 'evt', x);
      if (e[3] === mySide) { vib(40); if (V) { const p = V.pl[e[3]]; cry(p.age * 4 + ((p.af && p.af[p.age]) | 0), x, e[3], true); } }
      break;
    }
    case 'rage':
      if (V) { const p = V.pl[e[3]]; cry(p.age * 4 + ((p.af && p.af[p.age]) | 0), x, e[3], true); }
      fx.push({ ring: 1, x, y, l: 0.6, ml: 0.6, r: 80, col: '#ef4444' }); fx.push({ txt: '😡 VZTEK!', x, y: y - 30, vy: -30, l: 1.4, ml: 1.4 }); shake = 0.6; vib([60, 40, 120]); break;
    case 'sp': vib(e[3] === mySide ? 40 : [70, 40, 70]); break;
    case 'evo':
      if (x === BX[mySide]) vib([30, 40, 90]);
      fx.push({ rays: 1, x, y, l: 1.4, ml: 1.4 });
      fx.push({ ring: 1, x, y, l: 0.9, ml: 0.9, r: 150, col: '#fde047' });
      fx.push({ txt: 'EVOLUCE!', x, y: y - 60, vy: -28, l: 1.8, ml: 1.8 }); break;
  }
}
function drawFx(dt) {
  for (const f of fx) {
    f.l -= dt;
    const a = Math.max(0, f.l / f.ml), x = MX(f.x);
    c.globalAlpha = a;
    if (f.corpse) {
      const p = Math.min(1, (f.ml - f.l) / 0.35);
      c.globalAlpha = Math.min(1, f.l / 0.6);
      c.save(); c.translate(x, GY + (f.ty === 2 ? p * 8 : f.ty === 5 ? p * 14 : 0)); c.scale(facing(f.side) * US, US);
      if (f.ty !== 2 && f.ty !== 5) c.rotate(-p * 1.45);
      GORE = f.gore || null;
      drawUnitLocal(teamColM(f.side, f.m), f.a, f.ty, 0, 0, 1);
      GORE = null;
      c.restore();
    } else if (f.gib) {
      drawGib(f, dt);
    } else if (f.spurt) {
      // gejzír krve z krku padající mrtvoly
      const q = Math.min(1, (f.ml - f.l) / 0.35) * 1.45, m = mirror ? -1 : 1;
      const ux = -facing(f.side) * Math.sin(q), uy = -Math.cos(q);          // směr krku na obrazovce
      const sx = f.x + m * ux * US * 37.5, sy = GY + uy * US * 37.5;
      if (dt > 0) for (let k = 0; k < (EXTREME() ? 7 : 3); k++) {
        const v = rnd(140, 280) * a;
        fx.push({ blood: 1, np: 1, x: sx, y: sy, vx: m * ux * v + rnd(-40, 40), vy: uy * v - rnd(40, 120), l: 0.9, ml: 0.9, col: k ? '#b91c1c' : '#7f1010', r: rnd(1.4, 2.6), g: 700 });
      }
    } else if (f.burn) {                              // hořící louže oleje
      const r = f.r * Math.min(1, (f.ml - f.l) * 6 + 0.3);
      c.fillStyle = `rgba(30,15,5,${0.7 * a})`; ell(x, f.y, r, r * 0.22);
      c.fillStyle = `rgba(255,120,30,${0.8 * a})`; ell(x, f.y - 1, r * 0.8, r * 0.14);
      const op = c.globalCompositeOperation; c.globalCompositeOperation = 'lighter'; c.fillStyle = `rgba(255,150,40,${0.3 * a})`; ell(x, f.y - 4, r * 1.1, r * 0.5); c.globalCompositeOperation = op;
      for (let k = -2; k <= 2; k++) { const h = (8 + Math.sin(T * 13 + k * 2 + x) * 4) * a, xx = x + k * r * 0.35; c.fillStyle = k % 2 ? '#fbbf24' : '#f97316'; c.beginPath(); c.moveTo(xx - 3, f.y); c.quadraticCurveTo(xx - 2, f.y - h * 0.6, xx + Math.sin(T * 9 + k) * 2, f.y - h); c.quadraticCurveTo(xx + 3, f.y - h * 0.5, xx + 3, f.y); c.fill(); }
    } else if (f.fire) {
      const r = f.r * (1.2 - a * 0.6), op = c.globalCompositeOperation; c.globalCompositeOperation = 'lighter';
      const g = c.createRadialGradient(x, f.y, 0, x, f.y, r);
      g.addColorStop(0, '#ffffff'); g.addColorStop(0.3, f.col || '#fde047'); g.addColorStop(0.7, f.col ? 'rgba(56,225,255,.5)' : 'rgba(249,115,22,.6)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = g; circ(x, f.y, r); c.globalCompositeOperation = op;
    } else if (f.smoke) {
      f.x += f.vx * dt; f.y += f.vy * dt; f.r += dt * 14;
      c.globalAlpha = a * 0.55; c.fillStyle = f.col || '#8a8a8a'; circ(MX(f.x), f.y, f.r);
      c.globalAlpha = a * 0.35; c.fillStyle = f.col2 || '#d4d4d4'; circ(MX(f.x) - f.r * 0.3, f.y - f.r * 0.3, f.r * 0.6);
    } else if (f.flash) {
      glowDot(x, f.y, f.r * (0.6 + a), '#fde047');
    } else if (f.ring) {
      c.strokeStyle = f.col || '#fde68a'; c.lineWidth = 3 * a + 1; c.beginPath(); c.arc(x, f.y, f.r * (1 - a) + 4, 0, Math.PI * 2); c.stroke();
    } else if (f.rays) {
      const op = c.globalCompositeOperation; c.globalCompositeOperation = 'lighter';
      c.save(); c.translate(x, f.y); c.rotate(T * 0.8);
      c.fillStyle = 'rgba(253,224,71,.35)';
      for (let k = 0; k < 10; k++) { c.rotate(Math.PI / 5); poly([0, 0, -8, -150, 8, -150]); c.fill(); }
      c.restore(); c.globalCompositeOperation = op;
    } else if (f.txt) {
      f.y += f.vy * dt;
      const tx = Math.min(W - 120, Math.max(120, x));
      c.font = '900 34px system-ui'; c.textAlign = 'center';
      c.lineWidth = 6; c.strokeStyle = '#7c2d12'; c.strokeText(f.txt, tx, f.y);
      c.fillStyle = '#fde047'; c.fillText(f.txt, tx, f.y);
    } else {
      f.x += f.vx * dt; f.y += f.vy * dt; f.vy += f.g * dt;
      if (f.y > GY + 6) {
        if (f.blood && !f.landed && Math.random() < (f.np ? 0.03 : EXTREME() ? 0.2 : 0.12)) addPool(f.x, rnd(4, 9));
        f.landed = 1; f.y = GY + 6; f.vy *= -0.3; f.vx *= 0.6;
      }
      c.fillStyle = f.col; circ(MX(f.x), f.y, f.r);
    }
  }
  c.globalAlpha = 1;
  fx = fx.filter(f => f.l > 0);
  if (fx.length > GFX_FX[GFXL]) {
    // nad limit se zahazují nejdřív kapky krve, mrtvoly a kusy těl zůstanou
    let n = fx.length - GFX_FX[GFXL];
    fx = fx.filter(f => !(f.blood && n-- > 0));
    if (fx.length > 700) fx.splice(0, fx.length - 700);
  }
}
