// =====================================================================
//  VSTUP
// =====================================================================
cv.addEventListener('pointerdown', e => {
  if (!V || !role) return;
  const dpr = cv.width / innerWidth;
  const x = (e.clientX * dpr - ox) / scl, y = (e.clientY * dpr - oy) / scl;
  const hit = b => b && x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h;
  if (replay) { replayClick(hit); return; }
  if (tut && hit(tutBtn)) { tutNext(); return; }
  for (const b of facBtns) if (hit(b) && V.over < 0) { act({ a: 'fac', i: b.i }); facBtns = []; return; }
  if (paused) {
    for (const b of pauseBtns) if (hit(b)) {
      sfx('click');
      if (b.k === 'resume') paused = false;
      else if (b.k === 'music') { SET.music = !SET.music; saveSet(); }
      else if (b.k === 'sfx') { SET.sfx = !SET.sfx; saveSet(); }
      else if (b.k === 'vib') { SET.vib = !SET.vib; saveSet(); vib(60); }
      else if (b.k === 'quit') toMenu();
    }
    return;
  }
  if (V.over >= 0) {
    for (const b of overBtns) if (hit(b)) {
      sfx('click');
      if (b.k === 'replay') startReplay();
      else if (b.k === 'menu') toMenu();
      else if (b.k === 'bst') { renderBst(); openPanel('bstPanel'); }
      else if (b.k === 'camp') { const k = curCamp + (V.over === mySide ? 1 : 0); toMenu(); openCamp(Math.min(k, CAMP.length - 1)); }
      else if (b.k === 'next') startGame('solo', null, curCamp + 1);
      else if (role === 'solo') { defNext = curDef; startGame('solo', curChal, curCamp, curDaily); }
      else if (!rmMe) {
        rmMe = true; send({ t: 'rm' });
        if (role === 'host') hostRmCheck();
      }
    }
    return;
  }
  if (netWait) { if (hit(waitBtn)) { sfx('click'); toMenu(); } return; }
  if (chatOpen) {
    for (const b of chatBtns) if (hit(b)) { b.e != null ? sayEmote(b.e) : sayChat(b.i); return; }
    chatOpen = false; return;
  }
  if (hit(menuBtn)) { sfx('click'); paused = true; return; }
  if (hit(extraBtn)) {
    sfx('click');
    if (extraBtn.k === 'speed') { if (S) S.speed = S.speed > 1 ? 1 : 2; }
    else chatOpen = true;
    return;
  }
  for (const b of orderBtns) if (hit(b)) { if (b.k === 'rage') act({ a: 'rage' }); else if (V.pl[mySide].ord !== b.k) act({ a: 'ord', o: b.k }); return; }
  for (const b of btns) if (hit(b)) {
    if (b.cmd === 'tmode') { if (b.ok) { uiMode = 'turrets'; sfx('click'); } }
    else if (b.cmd === 'gmode') { uiMode = 'upgrades'; sfx('click'); }
    else if (b.cmd === 'umode') { uiMode = 'units'; sfx('click'); }
    else if (b.ok) act(b.cmd);
    return;
  }
});

$('bSolo').onclick = () => { cleanupNet(); startGame('solo'); };
$('bHost').onclick = () => hostGame({ coop: SET.net === 'coop', team: SET.net === '2v2' });
// tajný kód místo kódu hry
function joinOrSecret(v) {
  if (v.trim().toUpperCase() === 'BRUTL' && SET.brutal) {
    if (!SET.egg) { SET.egg = 1; saveSet(); }
    unlock(ACH.find(a => a.id === 'egg')); sfx('ach'); $('code').value = '';
    status('🥚 Našel jsi zlaté vejce! V profilu máš nový tajný znak.'); return;
  }
  joinGame(v);
}
$('bJoin').onclick = () => joinOrSecret($('code').value);
$('bWatch').onclick = () => joinGame($('code').value, true);       // divák
$('code').addEventListener('keydown', e => { if (e.key === 'Enter') joinOrSecret(e.target.value); });
// slepičí režim: 7× rychle klepnout na nápis
let logoTaps = [];
document.querySelector('#menu h1').addEventListener('click', () => {
  const now = performance.now(); logoTaps = logoTaps.filter(t => now - t < 2500); logoTaps.push(now);
  if (logoTaps.length < 7) return;
  logoTaps = []; SET.chicken = !SET.chicken; saveSet(); sfx('cluck');
  toasts.push({ a: { n: SET.chicken ? 'Slepičí režim zapnut' : 'Slepičí režim vypnut' }, h: '🐔 TAJEMSTVÍ', l: 3 });
  if (SET.chicken) unlock(ACH.find(a => a.id === 'chicken'));
});

// =====================================================================
//  HLAVNÍ SMYČKA
// =====================================================================
let last = performance.now();
function loop(now) {
  requestAnimationFrame(loop);
  perfTick(now - last);
  const dt = Math.min(0.1, (now - last) / 1000); last = now;
  netTick(now);
  tutTick();
  if ((role === 'solo' || role === 'host') && S) {
    if (S.over < 0 && !(paused && role === 'solo') && !netWait) {
      acc += dt * (role === 'solo' ? S.speed : 1);
      while (acc >= DT) {
        acc -= DT;
        step(DT);
        if (role === 'solo' || coop) ai(DT);
        for (const e of S.ev) { addFx(e); netEv.push(e); recEv.push(e); }
        S.ev = [];
      }
    }
    if (role === 'host') {
      sendAcc += dt;
      if (sendAcc >= 1 / SNAP_HZ) { sendAcc = 0; send({ t: 's', d: snap(netEv) }); netEv = []; }
    }
    if (role) V = decode(snap([]));
  } else if (role === 'guest' && snapCur) {
    V = interp(now);
  }
  if (role !== 'guest') recTick(dt);
  saveTick(dt);
  if (replay && V) V = replayTick(dt);
  MUS.mode = V && role && V.over < 0 ? 'battle' : 'menu';
  if (V) MUS.age = V.pl[mySide].age;
  render((paused && role === 'solo') || netWait ? 0 : dt);
  overlays(dt);
}
requestAnimationFrame(loop);

// PWA: v prohlížeči jde hra hrát offline a přidat na plochu (v aplikaci a při vývoji na localhostu se nespouští)
const nativeApp = !!(window.Capacitor && Capacitor.isNativePlatform && Capacitor.isNativePlatform());
if ('serviceWorker' in navigator && !nativeApp && (location.hostname !== 'localhost' || /[?&]pwa\b/.test(location.search)))
  navigator.serviceWorker.register('sw.js').catch(() => {});

// =====================================================================
//  WEB: ovládání klávesnicí a celá obrazovka na mobilu (v aplikaci se nepoužije)
// =====================================================================
// 1–9 = tlačítka ve spodní liště zleva, H hrdina, mezerník speciál, V evoluce, T věže, U vylepšení,
// Q/W/E rozkazy (útok/drž/ústup), R vztek, Tab rychlost, Esc/P pauza
addEventListener('keydown', e => {
  if (!V || !role || replay || e.target.tagName === 'INPUT') return;
  const k = e.key.toLowerCase();
  if (k === 'escape' || k === 'p') { if (role === 'solo' && V.over < 0) { paused = !paused; sfx('click'); } e.preventDefault(); return; }
  if (paused || V.over >= 0 || netWait) return;
  const cmdBtns = btns.filter(b => b.cmd && typeof b.cmd === 'object');
  const press = pred => { const b = btns.find(b => b.cmd && typeof b.cmd === 'object' && pred(b.cmd)); if (b && b.ok) act(b.cmd); };
  if (/^[1-9]$/.test(k)) { const b = cmdBtns[+k - 1]; if (b && b.ok) act(b.cmd); }
  else if (k === 'h') press(c => c.a === 'hero');
  else if (k === ' ') press(c => c.a === 'special');
  else if (k === 'v') press(c => c.a === 'evolve');
  else if (k === 't') uiMode = uiMode === 'turrets' ? 'units' : 'turrets';
  else if (k === 'u') uiMode = uiMode === 'upgrades' ? 'units' : 'upgrades';
  else if (k === 'q' || k === 'w' || k === 'e') { const o = 'qwe'.indexOf(k); if (V.pl[mySide].ord !== o) act({ a: 'ord', o }); }
  else if (k === 'r') act({ a: 'rage' });
  else if (k === 'tab') { if (role === 'solo' && S) S.speed = S.speed > 1 ? 1 : 2; }
  else return;
  e.preventDefault();
});
// mobilní prohlížeč: první klepnutí přepne na celou obrazovku a zamkne na šířku
if (!nativeApp && matchMedia('(pointer: coarse)').matches) addEventListener('pointerdown', () => {
  const d = document.documentElement;
  if (document.fullscreenElement || !d.requestFullscreen) return;
  d.requestFullscreen({ navigationUI: 'hide' }).then(() => screen.orientation && screen.orientation.lock && screen.orientation.lock('landscape')).catch(() => {});
}, true);
// klávesové zkratky ukázat jen na počítači
if (!matchMedia('(pointer: coarse)').matches) { const h = $('keysHelp'); if (h) h.classList.remove('hidden'); }
