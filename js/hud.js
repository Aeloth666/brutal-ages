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
  if (V.over < 0 && !replay) { drawOrders(p); drawAbils(p); } else { orderBtns = []; abilBtns = []; }

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
  if (V.surv || curSurv) label = curWk ? `🗓 TÝDENNÍ · VLNA ${V.surv} · DALŠÍ ZA ${V.survT} S · REKORD ${survwBest()}` : `♾ PŘEŽITÍ · VLNA ${V.surv} · DALŠÍ ZA ${V.survT} S · REKORD ${SURVB.best}`;
  else if (specMode) label = '👁 DIVÁK · ' + (OPP.n || 'hostitel').toUpperCase() + ' vs SOUPEŘ';
  else if (cm) label = (curDef != null ? 'OBRANA ÚZEMÍ: ' : curHero != null ? `🔥 HRDINSKÁ ${V.camp + 1}: ` : `KAMPAŇ ${V.camp + 1}/${CAMP.length}: `) + cm.n.toUpperCase() + tl;
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
let facBtns = [], sbonBtns = [];
const TOUCH = matchMedia('(pointer: coarse)').matches;              // dotykový displej: bez nápověd kláves
// nekonečné přežití: výběr bonusu po bossovi (3 karty)
function drawSbonPick() {
  sbonBtns = [];
  const P = V.survPick; if (!P || V.over >= 0 || replay) return;
  const w = 250, gap = 12, n = P.length - 1, tw = n * w + (n - 1) * gap, x0 = W / 2 - tw / 2, y = HUD + 150;
  rr(x0 - 14, y - 40, tw + 28, 136, 14); c.fillStyle = 'rgba(15,21,34,.95)'; c.fill(); c.strokeStyle = '#e5c04a'; c.lineWidth = 2; c.stroke();
  c.textAlign = 'center'; c.fillStyle = '#fde68a'; c.font = '800 16px system-ui';
  c.fillText(`Vyber si bonus (${P[n]} s)`, W / 2, y - 14);
  for (let i = 0; i < n; i++) {
    const B = SBON[P[i]], b = { x: x0 + i * (w + gap), y, w, h: 80, i };
    sbonBtns.push(b);
    rr(b.x, b.y, w, b.h, 10); c.fillStyle = '#1e293b'; c.fill(); c.strokeStyle = '#fbbf24'; c.lineWidth = 1.5; c.stroke();
    c.textAlign = 'left'; c.font = '30px system-ui'; c.fillStyle = '#fff'; c.fillText(B.ic, b.x + 12, b.y + 50);
    c.font = '800 16px system-ui'; c.fillStyle = '#fde68a'; c.fillText(B.n, b.x + 56, b.y + 30, w - 64);
    c.font = '600 12px system-ui'; c.fillStyle = '#cbd5e1';
    const words = B.d.split(' '); let line = '', ly = b.y + 50;
    for (const wd of words) { if (c.measureText(line + wd).width > w - 66) { c.fillText(line, b.x + 56, ly); line = ''; ly += 14; } line += wd + ' '; }
    c.fillText(line, b.x + 56, ly);
  }
}
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
let extraBtn = null, infoBtn = null, orderBtns = [], abilBtns = [], evtBanner = null, shake = 0;
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
// schopnosti armády: kamenné desky zapuštěné do hlíny pod bojištěm (klávesy A S D F)
function drawAbils(p) {
  abilBtns = [];
  if (!p.abc || (tut && !TUT.slice(0, tut.i + 1).some(s => s.abil != null)) || modsOf(V).noAbil) return;
  const w = 128, h = 60, gap = 12, x0 = W / 2 - (ABIL.length * w + (ABIL.length - 1) * gap) / 2, y = GY + 22;
  ABIL.forEach((A, k) => {
    const b = { x: x0 + k * (w + gap), y, w, h, k }, act = p.ab[k] > 0, cd = Math.max(p.abc[k], act ? 0 : p.abl || 0), ok = cd <= 0;   // abl = krátká pauza po jiné schopnosti
    // zapuštění do země: tmavý okraj a vnitřní stín
    rr(b.x - 3, b.y - 3, w + 6, h + 6, 12); c.fillStyle = 'rgba(20,12,6,.75)'; c.fill();
    rr(b.x, b.y, w, h, 10); c.fillStyle = act ? `rgba(${A.col},.55)` : ok ? '#3a3027' : '#241d17'; c.fill();
    c.strokeStyle = act ? `rgb(${A.col})` : ok ? '#a8865a' : '#4a3b2c'; c.lineWidth = act || ok ? 2 : 1.5; c.stroke();
    if (!ok && !act) {                                 // nabíjení: tmavá výplň, která ubývá
      const f = Math.min(1, cd / A.cd); rr(b.x + 2, b.y + 2, w - 4, (h - 4) * f, 8); c.fillStyle = 'rgba(0,0,0,.45)'; c.fill();
    }
    if (act) { rr(b.x + 4, b.y + h - 9, (w - 8) * (p.ab[k] / A.t), 5, 2.5); c.fillStyle = '#fff'; c.fill(); }
    if (ok) { c.save(); c.globalAlpha = 0.25 + Math.sin(T * 4 + k) * 0.15; rr(b.x, b.y, w, h, 10); c.strokeStyle = `rgb(${A.col})`; c.lineWidth = 3; c.stroke(); c.restore(); }
    const fl = BTN_FLASH.get('ab' + k); if (fl && T - fl < 0.25) { rr(b.x, b.y, w, h, 10); c.fillStyle = `rgba(255,255,255,${0.5 * (1 - (T - fl) / 0.25)})`; c.fill(); }
    c.globalAlpha = ok || act ? 1 : 0.6;
    c.textAlign = 'left'; c.font = '24px system-ui'; c.fillStyle = '#fff'; c.fillText(A.ic, b.x + 8, b.y + 38);
    c.font = '800 14px system-ui'; c.fillStyle = '#f5e6c4'; c.fillText(A.n, b.x + 42, b.y + 25);
    c.font = '700 12px system-ui'; c.fillStyle = act ? '#fff' : ok ? '#fde68a' : '#cbd5e1';
    c.fillText(act ? Math.ceil(p.ab[k]) + ' s' : ok ? 'PŘIPRAVENO' : Math.ceil(cd) + ' s', b.x + 42, b.y + 44);
    if (!TOUCH) { c.font = '700 10px system-ui'; c.fillStyle = 'rgba(245,230,196,.5)'; c.textAlign = 'right'; c.fillText('ASDF'[k], b.x + w - 7, b.y + 15); }
    c.globalAlpha = 1;
    abilBtns.push(b);
  });
}
