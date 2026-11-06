// =====================================================================
//  VYKRESLENÍ SNÍMKU – celé bojiště v pořadí vrstev a ukazatel bosse
// =====================================================================
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
      const ab = V.pl[u.side].ab; if (ab) ab.forEach((v, k) => { if (v > 0) au.push(ABIL[k].col); });
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
    if (r.hp != null && u.hp < r.hp - 0.5) r.hit = T;                 // zásah: jednotka cukne dozadu
    r.hp = u.hp;
    const hk = r.hit ? Math.max(0, 1 - (T - r.hit) / 0.16) : 0;
    const x = MX(u.x);
    if (u.rg) rageAura(x, u);
    const rs = u.rg ? 1.12 : 1;
    c.save(); c.translate(x, GY); c.scale(facing(u.side) * (u.back ? -1 : 1) * US * rs, US * rs);
    if (hk) c.translate(-hk * (u.ty === 5 ? 1.2 : 2.4), 0);
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
