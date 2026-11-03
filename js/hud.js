// =====================================================================
//  HUD
// =====================================================================
let btns = [], menuBtn = null, overBtns = [];
function hud(V) {
  const p = V.pl[mySide], e = V.pl[1 - mySide], A = AGES[p.age];
  c.fillStyle = lg('hud', 0, 0, 0, HUD, [[0, 'rgba(30,36,50,.95)'], [1, 'rgba(14,18,28,.95)']]);
  c.fillRect(0, 0, W, HUD);
  c.fillStyle = '#e5c04a'; c.fillRect(0, HUD - 3, W, 2); c.fillStyle = '#0a0d14'; c.fillRect(0, HUD - 1, W, 2);
  // zlato
  c.beginPath(); c.arc(24, 24, 11, 0, Math.PI * 2); fo(rg('coin', 21, 21, 1, 12, [[0, '#fff3b0'], [0.5, '#facc15'], [1, '#a16207']]), 1.5);
  c.fillStyle = '#854d0e'; c.font = '900 13px system-ui'; c.textAlign = 'center'; c.fillText('$', 24, 29);
  c.textAlign = 'left'; c.fillStyle = '#fde68a'; c.font = '900 22px system-ui'; c.fillText(p.gold.toLocaleString('cs'), 42, 32);
  // XP
  c.fillStyle = '#cbd5e1'; c.font = '700 12px system-ui';
  c.fillText(`XP ${p.xp.toLocaleString('cs')}${p.age < 4 ? ' / ' + A.xp.toLocaleString('cs') : ''}`, 14, 52);
  rr(14, 57, 214, 9, 4.5); c.fillStyle = '#0b1020'; c.fill(); c.strokeStyle = '#334155'; c.lineWidth = 1; c.stroke();
  const xf = p.age < 4 ? Math.min(1, p.xp / A.xp) : 1;
  if (xf > 0) { rr(15, 58, 212 * xf, 7, 3.5); c.fillStyle = lg('xpb', 0, 0, 228, 0, [[0, '#7c3aed'], [1, '#c084fc']]); c.fill(); }
  c.fillStyle = '#e2e8f0'; c.font = '800 12px system-ui'; c.fillText(A.name.toUpperCase(), 14, 84);
  // fronta
  const QN = qMax(p), QW = 105 / QN, QB = QW - 2;     // v týmu 9 menších políček, jinak 5
  for (let i = 0; i < QN; i++) {
    const x = 124 + i * QW, y = 70 + (19 - QB);
    rr(x, y, QB, QB, 4); c.fillStyle = '#0b1020'; c.fill(); c.strokeStyle = '#334155'; c.stroke();
    const q = p.q[i];
    if (q) drawIcon(unitIcon(teamCol(mySide), q.a, q.ty), x + QB / 2, y + QB - 1, QB - 3, QB - 2);
  }
  rr(124, 93, 103, 6, 3); c.fillStyle = '#0b1020'; c.fill();
  if (p.qf > 0) { rr(124, 93, 103 * p.qf, 6, 3); c.fillStyle = '#22c55e'; c.fill(); }

  btns = [];
  let bx = 246;
  const add = (label, sub, cmd, ok, icon) => { btns.push({ x: bx, y: 7, w: 88, h: 96, label, sub, cmd, ok, icon }); bx += 93; };
  const M = modsOf(V);
  const okU = i => M.only == null || M.only === i;
  if (uiMode === 'units') {
    const FN = facAt(p, p.age);
    A.units.forEach((u, i) => { const k = unitCost(p, i); add(FN.u[i] || u.n, okU(i) ? k.toLocaleString('cs') : 'ZAKÁZÁNO', { a: 'buy', ty: i }, okU(i) && p.gold >= k && p.q.length < qMax(p), ['u', p.age, i]); });
    { const sp = SPECS[p.age][(p.af && p.af[p.age]) | 0], k = unitCost(p, 6);   // speciální jednotka národa
      add(sp.n, okU(6) ? k.toLocaleString('cs') : 'ZAKÁZÁNO', { a: 'buy', ty: 6 }, okU(6) && p.gold >= k && p.q.length < qMax(p), ['u', p.age, 6]); }
    if (p.age === 4) add(SUPER.n, SUPER.c.toLocaleString('cs'), { a: 'buy', ty: 3 }, okU(3) && p.gold >= SUPER.c && p.q.length < qMax(p), ['u', 4, 3]);
    // hrdina: vyvolání, nebo když už bojuje, jeho ničivý úder
    const H = { ...HEROES[p.age], n: heroName(p) }, hero = V.units.some(u => u.side === mySide && u.ty === 4);
    if (hero) add('Ničivý úder', p.acd > 0 ? p.acd + ' s' : 'PŘIPRAVENO', { a: 'hero' }, p.acd <= 0, ['slam']);
    else add(H.n, !okU(4) ? 'ZAKÁZÁNO' : p.hcd > 0 ? 'za ' + p.hcd + ' s' : H.c.toLocaleString('cs'), { a: 'hero' }, okU(4) && p.hcd <= 0 && p.gold >= H.c, ['u', p.age, 4]);
    add('Věže', M.noTower ? 'ZAKÁZÁNO' : `${p.tur.length}/${p.slots}`, 'tmode', !M.noTower, ['t', p.age, 0]);
    add('Vylepšení', p.up.every(l => l >= upMax(p)) ? 'MAX' : (LANG === 'en' ? 'A' + p.up[0] + ' H' + p.up[1] + ' W' : 'Ú' + p.up[0] + ' Z' + p.up[1] + ' H') + p.up[2], 'gmode', true, ['g', 0]);
    add(A.sp.n, p.spcd > 0 ? p.spcd + ' s' : 'PŘIPRAVENO', { a: 'special' }, p.spcd <= 0, ['s', p.age]);
    if (p.age < 4) add('Evoluce', M.noEvo ? 'ZAKÁZÁNO' : p.xp >= A.xp ? 'MŮŽEŠ!' : Math.floor(p.xp / A.xp * 100) + ' %', { a: 'evolve' }, !M.noEvo && p.xp >= A.xp, ['e']);
  } else if (uiMode === 'sell') {
    if (!p.tur.length) uiMode = 'turrets';
    p.tur.forEach((t, k) => { const d = AGES[t.a].turrets[t.i]; add((k + 1) + '. ' + d.n, '+' + Math.floor(d.c / 2).toLocaleString('cs'), { a: 'sell', k }, true, ['t', t.a, t.i]); });
    add('Zpět', '', 'tmode', true, ['back']);
  } else if (uiMode === 'upgrades') {
    UPS.forEach((u, k) => {
      const max = p.up[k] >= upMax(p), cost = upCost(p, k);
      add(`${u.n} ${p.up[k]}/${upMax(p)}`, max ? (p.up[k] < UP_MAX ? 'DALŠÍ VĚK' : 'MAX') : cost.toLocaleString('cs'), { a: 'up', k }, !max && p.gold >= cost, ['g', k]);
    });
    add('Zpět', '', 'umode', true, ['back']);
  } else {
    A.turrets.forEach((t, i) => { const k = turCost(p, t); add(t.n, k.toLocaleString('cs'), { a: 'turret', i }, p.gold >= k && p.tur.length < p.slots, ['t', p.age, i]); });
    const sc = SLOT_COST[p.slots - 1];
    add('+ Místo', p.slots < 4 ? sc.toLocaleString('cs') : 'MAX', { a: 'slot' }, p.slots < 4 && p.gold >= sc, ['plus']);
    // jedna věž → prodat rovnou, víc věží → vybrat, kterou
    const one = p.tur.length === 1 ? p.tur[0] : null;
    add('Prodat', one ? '+' + Math.floor(AGES[one.a].turrets[one.i].c / 2).toLocaleString('cs') : p.tur.length ? 'vyber věž' : '—', one ? { a: 'sell', k: 0 } : 'smode', p.tur.length > 0, ['sell']);
    add('Zpět', '', 'umode', true, ['back']);
  }
  // když je tlačítek hodně, zúží se – vpravo musí zůstat místo pro popisek hry (nic se nepřekrývá)
  const RIGHT = W - 236, last = btns[btns.length - 1];
  if (last && last.x + last.w > RIGHT) { const step = (RIGHT - 246) / btns.length; btns.forEach((b, i) => { b.x = 246 + i * step; b.w = step - 5; }); }
  for (const b of btns) drawBtn(b);
  if (V.over < 0 && !replay) drawOrders(p); else orderBtns = [];

  c.textAlign = 'right';
  c.fillStyle = '#64748b'; c.font = '700 12px system-ui';
  const ch = V.chal != null ? CHAL[V.chal] : null;
  let label = role === 'solo' ? 'PROTI POČÍTAČI · ' + DIFF[V.diff || 0].n.toUpperCase()
    : TEAM ? '2 NA 2 · TÝM ' + (mySide ? 'B' : 'A')
    : coop ? 'CO-OP S ' + (OPP.n || 'kámošem').toUpperCase() + ' · ' + DIFF[V.diff || 0].n.toUpperCase()
    : curTour ? `TURNAJ · ${curTour.round.toUpperCase()} · ${(OPP.n || 'kámoš').toUpperCase()}` : 'ONLINE · ' + (OPP.n || 'kámoš').toUpperCase();
  const cm = V.camp != null ? CAMP[V.camp] : null, mm = modsOf(V);
  const lim = mm.survive || mm.limit, tl = lim ? ' · ' + fmtTime(Math.max(0, lim - V.time)) : '';
  if (ch) label = 'VÝZVA: ' + ch.n.toUpperCase() + tl;
  if (V.daily) label = DAILY.n.toUpperCase() + tl;
  if (V.surv || curSurv) label = `♾ PŘEŽITÍ · VLNA ${V.surv} · DALŠÍ ZA ${V.survT} S · REKORD ${SURVB.best}`;
  else if (specMode) label = '👁 DIVÁK · ' + (OPP.n || 'hostitel').toUpperCase() + ' vs SOUPEŘ';
  else if (cm) label = (curDef != null ? 'OBRANA ÚZEMÍ: ' : `KAMPAŇ ${V.camp + 1}/${CAMP.length}: `) + cm.n.toUpperCase() + tl;
  c.fillText(label, W - 14, 72, 222);
  c.fillStyle = '#fca5a5'; c.font = '800 14px system-ui';
  c.fillText(V.surv ? 'Nepřítel: ' + AGES[e.age].name + ' · základna ∞' : 'Soupeř: ' + AGES[e.age].name, W - 14, 92, 222);
  menuBtn = { x: W - 56, y: 10, w: 46, h: 40 };
  rr(menuBtn.x, menuBtn.y, menuBtn.w, menuBtn.h, 9); c.fillStyle = '#1e293b'; c.fill(); c.strokeStyle = '#334155'; c.lineWidth = 1.5; c.stroke();
  c.strokeStyle = '#cbd5e1'; c.lineWidth = 3; c.lineCap = 'round';
  for (let i = 0; i < 3; i++) ln(W - 43, 21 + i * 9, W - 23, 21 + i * 9);
  // informace o jednotkách aktuálního národa
  infoBtn = { x: W - 160, y: 10, w: 46, h: 40 };
  rr(infoBtn.x, infoBtn.y, infoBtn.w, infoBtn.h, 9); c.fillStyle = '#1e293b'; c.fill(); c.strokeStyle = '#334155'; c.lineWidth = 1.5; c.stroke();
  c.fillStyle = '#e2e8f0'; circ(infoBtn.x + 23, infoBtn.y + 20, 11); c.fillStyle = '#1e293b'; c.font = '900 16px Georgia, serif'; c.textAlign = 'center'; c.fillText('i', infoBtn.x + 23, infoBtn.y + 26);
  // vedle menu: zrychlení (proti počítači) nebo rychlé zprávy (online)
  const b = extraBtn = { x: W - 108, y: 10, w: 46, h: 40, k: role === 'solo' ? 'speed' : 'chat' };
  const on = b.k === 'speed' ? V.speed > 1 : chatOpen;
  rr(b.x, b.y, b.w, b.h, 9); c.fillStyle = on ? '#a16207' : '#1e293b'; c.fill(); c.strokeStyle = on ? '#fbbf24' : '#334155'; c.lineWidth = 1.5; c.stroke();
  c.fillStyle = '#e2e8f0';
  if (b.k === 'speed') {
    poly([b.x + 9, b.y + 11, b.x + 22, b.y + 20, b.x + 9, b.y + 29]); c.fill();
    poly([b.x + 22, b.y + 11, b.x + 35, b.y + 20, b.x + 22, b.y + 29]); c.fill();
    c.font = '900 10px system-ui'; c.textAlign = 'center'; c.fillText((V.speed || 1) + '×', b.x + 23, b.y + 39);
  } else {
    rr(b.x + 9, b.y + 9, 28, 18, 6); c.fill();
    poly([b.x + 15, b.y + 26, b.x + 14, b.y + 33, b.x + 22, b.y + 26]); c.fill();
    c.fillStyle = '#1e293b'; for (let i = 0; i < 3; i++) circ(b.x + 16 + i * 7, b.y + 18, 2);
  }
}
let facBtns = [];
function drawFacPick(p) {
  facBtns = [];
  if (!(p.pick > 0) || V.over >= 0 || replay || tut) return;
  const list = AGEFAC[p.age], w = 230, gap = 8, tw = list.length * w + (list.length - 1) * gap, x0 = W / 2 - tw / 2, y = HUD + 52;
  rr(x0 - 12, y - 34, tw + 24, 112, 14); c.fillStyle = 'rgba(15,21,34,.93)'; c.fill(); c.strokeStyle = '#e5c04a'; c.lineWidth = 2; c.stroke();
  c.textAlign = 'center'; c.fillStyle = '#fde68a'; c.font = '800 15px system-ui';
  c.fillText(`Vyber národ – ${AGES[p.age].name} (${Math.ceil(p.pick)} s)`, W / 2, y - 12);
  list.forEach((f, i) => {
    const b = { x: x0 + i * (w + gap), y, w, h: 66, i }, on = (p.af[p.age] || 0) === i;
    facBtns.push(b);
    rr(b.x, b.y, b.w, b.h, 10); c.fillStyle = on ? '#3a2a0a' : '#1e293b'; c.fill();
    c.strokeStyle = on ? '#fbbf24' : '#334155'; c.lineWidth = on ? 2.5 : 1; c.stroke();
    c.textAlign = 'left'; c.font = '24px system-ui'; c.fillStyle = '#fff'; c.fillText(f.ic, b.x + 10, b.y + 32);
    c.font = '800 15px system-ui'; c.fillStyle = on ? '#fde68a' : '#f1f5f9'; c.fillText(f.n, b.x + 44, b.y + 24, w - 52);
    c.font = '600 11px system-ui'; c.fillStyle = '#cbd5e1';
    const words = f.d.split(' '); let line = '', ly = b.y + 42;
    for (const wd of words) { if (c.measureText(line + wd).width > w - 54) { c.fillText(line, b.x + 44, ly); line = ''; ly += 13; } line += wd + ' '; }
    c.fillText(line, b.x + 44, ly);
  });
}
let extraBtn = null, infoBtn = null, orderBtns = [], evtBanner = null, shake = 0;
const TREX_TEAM = ['#6b4423', '#4a2c14', '#a07040'];
function drawTrex(x, dir) {
  c.save(); c.translate(x, GY); c.scale(dir * 4, 4);                  // kyčel ~4,8 m – T-Rex má budit respekt
  trex(T * 9, true, Math.sin(T * 5) > 0.6 ? 1 : 0);
  c.restore();
  if (GFXL >= 1 && Math.random() < 0.5) fx.push({ smoke: 1, x: MX(x) - dir * 40, y: GY - 4, vx: -dir * 20, vy: -15, r: 8, l: 0.7, ml: 0.7, col: 'rgba(150,120,90,.8)', col2: 'rgba(200,175,140,.6)' });
}
function drawChest(x) {
  if (SEASON) return seasonChest(x);
  const y = GY - 2, b = Math.abs(Math.sin(T * 3)) * 3;
  c.fillStyle = 'rgba(255,220,90,.25)'; circ(x, y - 12, 22 + b);
  rr(x - 13, y - 16, 26, 16, 3); fo(lg('chestB', 0, y - 16, 0, y, [[0, '#a16207'], [1, '#713f12']]), 1.5);
  c.beginPath(); c.moveTo(x - 13, y - 16); c.quadraticCurveTo(x, y - 27, x + 13, y - 16); c.closePath(); fo('#ca8a04', 1.5);
  c.fillStyle = '#fde68a'; c.fillRect(x - 2, y - 18, 4, 7); c.fillStyle = '#facc15'; circ(x - 6, y - 19 - b, 2); circ(x + 5, y - 20 - b, 2.4);
}
function drawEvtBanner(dt) {
  const B = evtBanner; B.l -= dt;
  const a = Math.max(0, Math.min(1, B.l * 2, (3 - B.l) * 4));
  c.globalAlpha = a; c.textAlign = 'center'; c.font = '900 34px system-ui';
  c.lineWidth = 7; c.strokeStyle = '#3b0f05'; c.strokeText('⚡ ' + B.t, W / 2, HUD + 110);
  c.fillStyle = '#fde047'; c.fillText('⚡ ' + B.t, W / 2, HUD + 110);
  c.globalAlpha = 1;
  if (B.l <= 0) evtBanner = null;
}
// rozkazy armádě: tři tlačítka pod horním panelem, u vlastní základny
function rageAura(x, u) {
  const op = c.globalCompositeOperation; c.globalCompositeOperation = 'lighter';
  const h = u.ty === 2 ? 70 : 52, pul = 0.75 + Math.sin(T * 10) * 0.25;
  c.fillStyle = rg('rage', 0, 0, 0, 1, [[0, 'rgba(255,40,20,.8)'], [0.6, 'rgba(255,30,10,.35)'], [1, 'rgba(255,0,0,0)']]);
  c.save(); c.translate(x, GY - h / 2); c.scale(u.ty === 2 ? 46 : 26, h * 0.62 * pul); circ(0, 0, 1); c.restore();
  c.globalCompositeOperation = op;
  if (Math.random() < 0.35) fx.push({ smoke: 1, x: u.x + rnd(-8, 8), y: GY - h + rnd(-4, 6), vx: rnd(-10, 10), vy: rnd(-40, -25), r: 2.5, l: 0.5, ml: 0.5, col: 'rgba(255,255,255,.7)', col2: 'rgba(255,200,200,.5)' });
}
function drawOrders(p) {
  orderBtns = ORDERS.map((o, k) => {
    const b = { x: 10 + k * 98, y: HUD + 8, w: 92, h: 34, k }, on = (p.ord || 0) === k;
    rr(b.x, b.y + 2, b.w, b.h, 9); c.fillStyle = 'rgba(0,0,0,.35)'; c.fill();
    rr(b.x, b.y, b.w, b.h, 9); c.fillStyle = on ? ['#b91c1c', '#1d4ed8', '#a16207'][k] : 'rgba(20,26,40,.82)'; c.fill();
    c.strokeStyle = on ? '#fde68a' : '#334155'; c.lineWidth = on ? 2 : 1; c.stroke();
    c.fillStyle = on ? '#fff' : '#cbd5e1'; c.font = '800 14px system-ui'; c.textAlign = 'center';
    c.fillText(o.ic + ' ' + o.n, b.x + b.w / 2, b.y + 22);
    return b;
  });
  if (V.rage) {                                       // tlačítko vzteku (jen kampaň + EXTREME)
    const raging = V.units.some(u => u.side === mySide && u.rg), ok = !raging && !(p.rgcd > 0);
    const b = { x: 10 + 3 * 98, y: HUD + 8, w: 112, h: 34, k: 'rage' };
    rr(b.x, b.y + 2, b.w, b.h, 9); c.fillStyle = 'rgba(0,0,0,.35)'; c.fill();
    rr(b.x, b.y, b.w, b.h, 9); c.fillStyle = raging ? '#7f1d1d' : ok ? '#dc2626' : 'rgba(20,26,40,.82)'; c.fill();
    c.strokeStyle = ok ? '#fca5a5' : '#334155'; c.lineWidth = ok ? 2 : 1; c.stroke();
    c.fillStyle = '#fff'; c.font = '800 14px system-ui'; c.textAlign = 'center';
    c.fillText(raging ? '😡 Zuří!' : p.rgcd > 0 ? '😡 ' + p.rgcd + ' s' : '😡 Vztek', b.x + b.w / 2, b.y + 22);
    orderBtns.push(b);
  }
}
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
  else if (k === 't') { c.translate(cx0 - 6, b.y + 42); c.scale(1.7, 1.7); TUR[a](i, a); }
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
  c.fillStyle = 'rgba(8,10,16,.72)'; c.fillRect(0, 0, W, H);
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

function render(dt) {
  T += dt;
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.fillStyle = '#10151f'; c.fillRect(0, 0, cv.width, cv.height);
  c.setTransform(scl, 0, 0, scl, ox, oy);
  c.save(); c.beginPath(); c.rect(0, 0, W, H); c.clip();
  c.drawImage(bgC, 0, 0, W, H);
  drawClouds();
  wxBack(dt);
  if (GFXL >= 3) ultraBack();
  if (!V) {
    if (role === 'guest') { c.fillStyle = '#0f172a'; c.font = '700 24px system-ui'; c.textAlign = 'center'; c.fillText('Čekám na data od hostitele…', W / 2, 300); }
    c.restore(); return;
  }
  if (shake > 0) { shake = Math.max(0, shake - dt); c.translate((Math.random() - 0.5) * shake * 10, (Math.random() - 0.5) * shake * 6); }
  drawBase(0, V.pl[0]); drawBase(1, V.pl[1]);
  if (V.chest) drawChest(MX(V.chest));
  if (V.trex) drawTrex(MX(V.trex[0]), V.trex[1] * (mirror ? -1 : 1));
  drawPools(dt);
  if (bloodCode) drawBloodCode(dt);
  // aury pod jednotkami: pokřik generála (zlatá), bubeník poblíž (oranžová), léčitel poblíž (zelená)
  const abOf = u => u.ty === 6 ? (SPECS[u.a][(u.f ?? ((V.pl[u.side].afm ? V.pl[u.side].afm[u.m | 0] : V.pl[u.side].af) || [])[u.a]) | 0] || {}).ab : '';
  const drums = V.units.filter(u => abOf(u) === 'drum'), heals = V.units.filter(u => abOf(u) === 'healer');
  const near = (L, u, r) => L.some(a => a !== u && a.side === u.side && Math.abs(a.x - u.x) < r);
  // stíny (na vysoké a ultra měkké)
  for (const u of V.units) {
    const rx = u.ty === 5 ? 56 : u.ty === 2 ? 34 : u.ty === 3 ? 18 : u.ty === 4 ? 14 : 11, x = MX(u.x);
    if (GFXL >= 2) { c.fillStyle = rg('shadow', 0, 0, 0, 1, [[0, 'rgba(0,0,0,.34)'], [1, 'rgba(0,0,0,0)']]); c.save(); c.translate(x, GY + 1); c.scale(rx * 1.3, 5); circ(0, 0, 1); c.restore(); }
    else { c.fillStyle = 'rgba(0,0,0,.22)'; ell(x, GY + 1, rx, 3.5); }
    if (u.ty !== 5) {
      const au = [];
      if (V.pl[u.side].cry) au.push('255,200,60');
      if (near(drums, u, 160)) au.push('251,146,60');
      if (near(heals, u, 140) && u.hp < u.mx) au.push('74,222,128');
      au.forEach((col, i) => { c.strokeStyle = `rgba(${col},${0.5 + Math.sin(T * 5 + i * 2) * 0.2})`; c.lineWidth = 2;
        c.beginPath(); c.ellipse(x, GY + 1, rx * 1.2 + 5 + i * 5, 4.5 + i * 1.5, 0, 0, Math.PI * 2); c.stroke(); });
    }
    if (GFXL >= 3 && u.st === 0 && dt > 0 && Math.random() < dt * 3)
      fx.push({ smoke: 1, x: u.x - (u.side ? -1 : 1) * 6, y: GY - 2, vx: rnd(-10, 10), vy: rnd(-14, -6), r: rnd(2, 4), l: 0.7, ml: 0.7, col: 'rgba(150,120,90,.8)', col2: 'rgba(200,175,140,.6)' });
  }
  const order = [...V.units].sort((a, b) => (b.ty === 2) - (a.ty === 2));
  if (V.pl[mySide].cry) { c.fillStyle = 'rgba(255,200,60,.12)'; c.fillRect(0, HUD, W, H - HUD); }
  for (const u of order) {
    const r = phMap.get(u.id) || { ph: Math.random() * 6, x: u.x };
    r.ph += Math.abs(u.x - r.x) * 0.11; r.x = u.x; r.seen = T; phMap.set(u.id, r);
    const x = MX(u.x);
    if (u.rg) rageAura(x, u);
    const rs = u.rg ? 1.12 : 1;
    c.save(); c.translate(x, GY); c.scale(facing(u.side) * (u.back ? -1 : 1) * US * rs, US * rs);
    drawUnitLocal(teamColM(u.side, u.m), u.a, u.ty, r.ph, u.at, u.st);
    c.restore();
    if (u.rg) { c.font = '16px system-ui'; c.textAlign = 'center'; c.fillText('💢', x + Math.sin(T * 9) * 2, GY - hpBarH(u) - 10); }
    if (u.hp < u.mx) {
      const by = GY - hpBarH(u), bw = u.ty === 5 ? 90 : u.ty >= 2 ? 40 : 26;
      rr(x - bw / 2 - 1.5, by - 1.5, bw + 3, 6, 3); c.fillStyle = 'rgba(0,0,0,.6)'; c.fill();
      rr(x - bw / 2, by, bw * Math.max(0, u.hp / u.mx), 3, 1.5); c.fillStyle = u.side === mySide ? '#4ade80' : '#f87171'; c.fill();
    }
  }
  bossBar();
  if (phMap.size > 300) for (const [id, r] of phMap) if (T - r.seen > 2) phMap.delete(id);
  for (const pr of V.proj) {
    drawProj(pr);
    if ((pr.p === 'rocket' || pr.p === 'meteor') && Math.random() < dt * 40)
      fx.push({ smoke: 1, x: pr.x, y: pr.y, vx: 0, vy: -10, r: pr.p === 'meteor' ? 6 : 3, l: 0.6, ml: 0.6 });
  }
  drawFx(dt);
  if (GFXL >= 3) ultraFront();
  wxFront(dt);
  if (V.dark > 0) { c.fillStyle = `rgba(6,8,24,${Math.min(0.62, V.dark * 0.12)})`; c.fillRect(0, 0, W, H); }
  drawStorm(); seasonFx(dt); drawNight(); drawEmotes(dt);
  if (evtBanner) drawEvtBanner(dt);
  if (GFXL >= 3) ultraGrade();
  hud(V);
  if (V.over >= 0 && !replay) drawOver(V);
  c.restore();
}
addEventListener('resize', resize); resize();

// velký ukazatel zdraví bosse nahoře uprostřed
function bossBar() {
  const b = V.units.find(u => u.ty === 5); if (!b) return;
  const w = 440, x = W / 2 - w / 2, y = HUD + 18, k = Math.max(0, b.hp / b.mx);
  rr(x - 4, y - 4, w + 8, 22, 9); c.fillStyle = 'rgba(12,8,8,.82)'; c.fill(); c.strokeStyle = '#991b1b'; c.lineWidth = 2; c.stroke();
  rr(x, y, w * k, 14, 7); c.fillStyle = lg('bossHp', x, 0, x + w, 0, [[0, '#7f1d1d'], [0.6, '#dc2626'], [1, '#f97316']]); c.fill();
  c.fillStyle = 'rgba(255,255,255,.25)'; c.fillRect(x + 3, y + 2, Math.max(0, w * k - 6), 3);
  c.font = '900 15px system-ui'; c.textAlign = 'center';
  const t = '👹 ' + BOSSES[b.a].n.toUpperCase() + '  ' + Math.ceil(b.hp).toLocaleString('cs') + ' / ' + b.mx.toLocaleString('cs');
  c.lineWidth = 4; c.strokeStyle = 'rgba(0,0,0,.8)'; c.strokeText(t, W / 2, y + 34); c.fillStyle = '#fecaca'; c.fillText(t, W / 2, y + 34);
}
