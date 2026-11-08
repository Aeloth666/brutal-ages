// =====================================================================
//  TLAČÍTKA – ikony jednotek, tlačítka v liště a obrazovka konce hry
// =====================================================================
const fmtTime = t => Math.floor(t / 60) + ':' + String(Math.floor(t % 60)).padStart(2, '0');

// ikonky jednotek (tlačítka, fronta): jednotka se jednou nakreslí do velkého plátna, ořízne podle skutečného obrysu
// a uloží – v tlačítku se pak vždy vejde celá, ať je to voják, nebo mamut s jezdcem
const ICONS = new Map();
function unitIcon(team, a, ty) {
  const key = team.slice(0, 3).join('') + '|' + (team.af || []).join('') + '|' + (team.sk || '') + '|' + a + '|' + ty;
  let ic = ICONS.get(key); if (ic) return ic;
  const big = document.createElement('canvas'); big.width = 720; big.height = 520;
  const save = c; c = big.getContext('2d'); GC.clear(); c.translate(360, 430); c.scale(2, 2);
  try { drawUnitLocal(team, a, ty, 0, 0, 1); } catch (e) {}
  c = save; GC.clear();
  const d = big.getContext('2d').getImageData(0, 0, big.width, big.height).data;
  let x0 = big.width, y0 = big.height, x1 = 0, y1 = 0;
  for (let y = 0; y < big.height; y += 2) for (let x = 0; x < big.width; x += 2) if (d[(y * big.width + x) * 4 + 3] > 20) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  if (x1 <= x0) { x0 = 0; y0 = 0; x1 = 2; y1 = 2; }
  const cv2 = document.createElement('canvas'); cv2.width = x1 - x0 + 2; cv2.height = y1 - y0 + 2;
  cv2.getContext('2d').drawImage(big, x0, y0, cv2.width, cv2.height, 0, 0, cv2.width, cv2.height);
  ic = { cv: cv2, w: cv2.width, h: cv2.height }; ICONS.set(key, ic);
  if (ICONS.size > 120) ICONS.delete(ICONS.keys().next().value);
  return ic;
}
// vykreslí ikonku: střed dole v (cx, bottom), vejde se do maxW × maxH; vojáci se nezvětšují víc než na 1×
function drawIcon(ic, cx, bottom, maxW, maxH) {
  const k = Math.min(maxW / ic.w, maxH / ic.h, 0.55);
  c.drawImage(ic.cv, cx - ic.w * k / 2, bottom - ic.h * k, ic.w * k, ic.h * k);
}
// bliknutí tlačítka po stisku (nákup jednotky apod.) – klíč podle příkazu, protože tlačítka se staví každý snímek znovu
const BTN_FLASH = new Map(), btnKey = b => JSON.stringify(b.cmd) + '|' + b.label;
function drawBtn(b) {
  c.save();
  c.globalAlpha = b.ok ? 1 : 0.42;
  rr(b.x, b.y + 3, b.w, b.h, 11); c.fillStyle = '#05070c'; c.fill();
  rr(b.x, b.y, b.w, b.h, 11);
  c.fillStyle = b.ok ? lg('btnOn', 0, 7, 0, 103, [[0, '#33507a'], [1, '#1c2b44']]) : '#1a2130'; c.fill();
  c.strokeStyle = b.ok ? '#5b7fb3' : '#2a3344'; c.lineWidth = 1.5; c.stroke();
  c.fillStyle = 'rgba(255,255,255,.08)'; rr(b.x + 3, b.y + 3, b.w - 6, 26, 8); c.fill();
  // evoluce je dostupná → tlačítko pulzuje zlatou září
  if (b.ok && b.icon && b.icon[0] === 'e') {
    const p = 0.5 + 0.5 * Math.sin(T * 5);
    c.save(); c.shadowColor = '#fde047'; c.shadowBlur = 10 + p * 16; rr(b.x, b.y, b.w, b.h, 11);
    c.strokeStyle = `rgba(253,224,71,${0.55 + 0.45 * p})`; c.lineWidth = 3; c.stroke();
    c.fillStyle = `rgba(253,224,71,${0.06 + 0.1 * p})`; c.fill(); c.restore();
  }
  // právě stisknuté tlačítko krátce blikne
  const fl = BTN_FLASH.get(btnKey(b));
  if (fl != null && T - fl < 0.35 && T >= fl) { c.save(); rr(b.x, b.y, b.w, b.h, 11); c.fillStyle = `rgba(255,255,255,${0.55 * (1 - (T - fl) / 0.35)})`; c.fill(); c.restore(); }
  c.save(); rr(b.x + 2, b.y + 2, b.w - 4, b.h - 32, 9); c.clip();
  const [k, a, i] = b.icon, cx0 = b.x + b.w / 2;
  if (k === 'u') drawIcon(unitIcon(teamCol(mySide), a, i), cx0, b.y + 63, b.w - 12, 58);
  else if (k === 't') { c.translate(cx0 - 6, b.y + 42); c.scale(1.7, 1.7); TUR[a][i](99); }
  else if (k === 's') { const pr = AGES[a].sp.p; drawProj({ x: mirror ? W - cx0 : cx0, y: b.y + 36, p: pr === 'beam' ? 'laser' : pr, dx: mirror ? -1 : 1, dy: 1.2 }); }
  else if (k === 'e') { poly([cx0, b.y + 12, cx0 + 19, b.y + 34, cx0 + 8, b.y + 34, cx0 + 8, b.y + 58, cx0 - 8, b.y + 58, cx0 - 8, b.y + 34, cx0 - 19, b.y + 34]); fo(lg('evo', 0, b.y + 12, 0, b.y + 58, [[0, '#fef08a'], [1, '#ca8a04']]), 1.6); }
  else if (k === 'plus') { rr(cx0 - 5, b.y + 16, 10, 36, 3); fo('#4ade80', 1.4); rr(cx0 - 18, b.y + 29, 36, 10, 3); fo('#4ade80', 1.4); }
  else if (k === 'sell') { c.beginPath(); c.arc(cx0, b.y + 34, 16, 0, Math.PI * 2); fo('#facc15', 1.6); c.fillStyle = '#854d0e'; c.font = '900 20px system-ui'; c.textAlign = 'center'; c.fillText('$', cx0, b.y + 41); }
  else if (k === 'g') {                                // vylepšení: meč / srdce / hradba
    c.translate(cx0, b.y + 36);
    if (a === 0) { c.rotate(-0.6); rr(-3, -22, 6, 32, 2); fo('#e2e8f0', 1.4); rr(-10, 8, 20, 5, 2); fo('#e5c04a', 1.3); rr(-2.5, 12, 5, 10, 2); fo('#7c2d12', 1.2); }
    else if (a === 1) { c.beginPath(); c.moveTo(0, 16); c.bezierCurveTo(-26, -2, -14, -24, 0, -10); c.bezierCurveTo(14, -24, 26, -2, 0, 16); fo('#ef4444', 1.6); }
    else { rr(-20, -10, 40, 26, 2); fo('#9ca3af', 1.5); for (let i = 0; i < 4; i++) { rr(-20 + i * 11, -18, 7, 9, 1); fo('#9ca3af', 1.3); } c.strokeStyle = '#4b5563'; c.lineWidth = 1; ln(-20, 0, 20, 0); ln(-6, -10, -6, 0); ln(8, 0, 8, 16); }
  }
  else if (k === 'slam') {                             // ničivý úder: pěst s rázovou vlnou
    c.translate(cx0, b.y + 36);
    c.strokeStyle = '#fbbf24'; c.lineWidth = 3; for (const r of [16, 24]) { c.beginPath(); c.arc(0, 12, r, Math.PI * 1.1, Math.PI * 1.9); c.stroke(); }
    rr(-11, -14, 22, 20, 6); fo(SKIN, 1.5); c.strokeStyle = OL; c.lineWidth = 1.2; for (let i = 1; i < 4; i++) ln(-11 + i * 5.5, -14, -11 + i * 5.5, -6);
  }
  else if (k === 'back') { c.strokeStyle = '#cbd5e1'; c.lineWidth = 5; c.lineCap = 'round'; ln(cx0 + 14, b.y + 34, cx0 - 12, b.y + 34); ln(cx0 - 12, b.y + 34, cx0, b.y + 22); ln(cx0 - 12, b.y + 34, cx0, b.y + 46); }
  c.restore();
  c.textAlign = 'center'; c.fillStyle = '#f1f5f9'; c.font = '700 12px system-ui';
  c.fillText(b.label, cx0, b.y + b.h - 18, b.w - 6);
  c.fillStyle = b.ok ? '#fde68a' : '#94a3b8'; c.font = '900 12px system-ui';
  c.fillText(b.sub, cx0, b.y + b.h - 5, b.w - 6);
  c.restore();
}

function drawOver(V) {
  const win = V.over === mySide, cm = V.camp != null ? CAMP[V.camp] : null;
  const title = V.surv ? 'PADL JSI VE VLNĚ ' + V.surv : cm && curDef != null ? (win ? 'ÚZEMÍ UBRÁNĚNO!' : 'ÚZEMÍ PADLO') : cm ? (win ? 'ÚZEMÍ DOBYTO!' : 'ÚTOK SELHAL') : win ? 'VÍTĚZSTVÍ!' : 'PROHRA';
  c.fillStyle = 'rgba(8,10,16,.72)'; c.fillRect(-EXW, 0, W + 2 * EXW, H);
  c.textAlign = 'center'; c.font = '900 72px system-ui';
  c.lineWidth = 10; c.strokeStyle = win ? '#7c2d12' : '#450a0a'; c.strokeText(title, W / 2, 250);
  c.fillStyle = win ? '#fde047' : '#f87171'; c.fillText(title, W / 2, 250);
  // shrnutí hry
  const me = V.pl[mySide], ch = V.chal != null ? CHAL[V.chal] : null;
  c.fillStyle = '#cbd5e1'; c.font = '700 17px system-ui';
  c.fillText(`Zabito: ${me.kills}  ·  Čas: ${fmtTime(V.time)}  ·  Věk: ${AGES[me.age].name}${endDone ? '  ·  +' + lastXp + ' XP' : ''}`, W / 2, 290);
  let note = '', noteCol = '#fde68a';
  if (V.daily) note = win ? `${DAILY.n}:  ${'★'.repeat(lastStars)}${'☆'.repeat(3 - lastStars)}` : 'Dnes to nevyšlo – zkus to znovu.';
  else if (cm && curDef != null) note = win ? 'Rudá horda odražena, bonus území zase platí.' : 'Území zůstává pod útokem – zkus to znovu.';
  else if (cm) note = win ? `${cm.n}:  ${'★'.repeat(lastStars)}${'☆'.repeat(3 - lastStars)}` : 'Rudá horda tě odrazila – zkus to znovu.';
  else if (ch) note = win ? `Výzva splněna! Odměna: barva armády ${COLS[ch.col].n}` : 'Výzva nesplněna – zkus to znovu.';
  else if (coop) note = (win ? 'Spolu jste to dali!' : 'Příště to dáte!') + ' Parťák: ' + (OPP.n || 'kámoš');
  else if (role !== 'solo') {
    const r = ST.vs[OPP.n || 'Kámoš'] || [0, 0];
    note = `Skóre proti ${OPP.n || 'kámošovi'}:  ${r[0]} : ${r[1]}`;
  }
  if (V.surv) note = `Přežil jsi ${Math.max(0, V.surv - 1)} vln · rekord ${SURVB.best}`;
  if (note) { c.fillStyle = noteCol; c.font = '800 18px system-ui'; c.fillText(note, W / 2, 318); }

  overBtns = [];
  const online = role !== 'solo';
  const coNext = coop && cm && win && V.camp + 1 < CAMP.length;
  const opts = specMode ? [['Menu', 'menu']] : cm && !online ? (win && curDef == null && V.camp + 1 < CAMP.length ? [['Další mise ▶', 'next'], ['Mapa', 'camp']] : [[win ? 'Hrát znovu' : 'Zkusit znovu', 'again'], ['Mapa', 'camp']])
    : [[online ? (rmMe ? 'Čekám…' : coNext ? 'Další mise ▶' : coop ? 'Znovu' : 'Odveta') : ch ? 'Zkusit znovu' : 'Hrát znovu', 'again'], ['Menu', 'menu']];
  if (rec.length > 30) opts.push(['🎬 Záznam', 'replay']);
  if (lastBst) opts.push(['📊 Statistiky', 'bst']);
  opts.forEach(([t, k], i) => {
    const b = { x: W / 2 - opts.length * 110 + 10 + i * 220, y: 340, w: 200, h: 60, k };
    overBtns.push(b);
    const main = k === 'again' || k === 'next';
    rr(b.x, b.y + 4, b.w, b.h, 12); c.fillStyle = main ? '#7c2d12' : '#1e293b'; c.fill();
    rr(b.x, b.y, b.w, b.h, 12); c.fillStyle = main ? (rmMe ? '#57534e' : '#c2410c') : '#334155'; c.fill();
    c.fillStyle = '#fff'; c.font = '800 22px system-ui'; c.fillText(t, b.x + b.w / 2, b.y + 38);
  });
  if (online) {
    const t = TEAM && rmInfo ? `Připraveni na odvetu: ${rmInfo.n} / ${rmInfo.of}` : rmMe && rmOpp ? 'Startuje se…' : rmMe ? 'Čekám, až soupeř potvrdí odvetu…' : rmOpp ? (OPP.n || 'Soupeř') + ' chce odvetu!' : '';
    c.fillStyle = rmOpp ? '#4ade80' : '#cbd5e1'; c.font = '700 17px system-ui'; c.fillText(t, W / 2, 440);
  }
}
