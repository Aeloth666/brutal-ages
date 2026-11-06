// =====================================================================
//  VSTUP
// =====================================================================
cv.addEventListener('pointerdown', e => {
  if (!V || !role) return;
  const dpr = cv.width / innerWidth;
  const x = (e.clientX * dpr - ox) / scl, y = (e.clientY * dpr - oy) / scl;
  const hit = b => b && x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h;
  if (eggScene) { eggClick(x, y); return; }                              // tajemství: scéna se zlatým vejcem
  if (!replay && !paused && bloodCodeHit(x, y)) { eggStart(); return; }
  if (replay) { replayClick(hit, x); return; }
  if (tut && hit(tutBtn)) { tutNext(); return; }
  for (const b of sbonBtns) if (hit(b) && V.over < 0) { act({ a: 'sbon', i: b.i }); sbonBtns = []; return; }
  for (const b of facBtns) if (hit(b) && V.over < 0) { act({ a: 'fac', i: b.i }); facBtns = []; return; }
  if (paused) {
    for (const b of pauseBtns) if (hit(b)) {
      sfx('click');
      if (b.k === 'resume') paused = false;
      else if (b.k === 'music') { SET.music = !SET.music; saveSet(); }
      else if (b.k === 'sfx') { SET.sfx = !SET.sfx; saveSet(); }
      else if (b.k === 'vib') { SET.vib = !SET.vib; saveSet(); vib(60); }
      else if (b.k === 'quit') toMenu();
      else if (b.k === 'restart' && confirm('Začít tohle kolo znovu? Rozehraná bitva se ztratí.')) { defNext = curDef; heroNext = curHero; survNext = curSurv; wkNext = curWk; startGame('solo', curChal, curCamp, curDaily); }
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
      else if (role === 'solo') { defNext = curDef; heroNext = curHero; survNext = curSurv; wkNext = curWk; startGame('solo', curChal, curCamp, curDaily); }
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
  if (hit(infoBtn)) { sfx('click'); openUnitInfo(); return; }
  if (hit(extraBtn)) {
    sfx('click');
    if (extraBtn.k === 'speed') { if (S) S.speed = S.speed >= 3 ? 1 : (S.speed || 1) + 1; }
    else chatOpen = true;
    return;
  }
  for (const b of abilBtns) if (hit(b)) { const p = V.pl[mySide]; if (p.abc && p.abc[b.k] <= 0 && !(p.abl > 0)) { act({ a: 'abil', k: b.k }); BTN_FLASH.set('ab' + b.k, T); } return; }
  for (const b of orderBtns) if (hit(b)) { if (b.k === 'rage') act({ a: 'rage' }); else if (V.pl[mySide].ord !== b.k) act({ a: 'ord', o: b.k }); return; }
  for (const b of btns) if (hit(b)) {
    if (b.cmd === 'tmode') { if (b.ok) { uiMode = 'turrets'; sfx('click'); } }
    else if (b.cmd === 'gmode') { uiMode = 'upgrades'; sfx('click'); }
    else if (b.cmd === 'smode') { if (b.ok) { uiMode = 'sell'; sfx('click'); } }
    else if (b.cmd === 'umode') { uiMode = 'units'; sfx('click'); }
    else if (b.ok) { act(b.cmd); BTN_FLASH.set(btnKey(b), T); }
    return;
  }
});

$('bSolo').onclick = () => { cleanupNet(); startGame('solo'); };
$('bHost').onclick = () => hostGame({ coop: SET.net === 'coop', team: SET.net === '2v2' });
// tajný kód místo kódu hry
function joinOrSecret(v) { joinGame(v); }
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
let last = performance.now(), lastDraw = 0;
// ukazatel FPS v rohu (Nastavení → Grafika): počítá skutečně vykreslené snímky, obnovuje se dvakrát za sekundu
const FPSM = { n: 0, t: 0 };
function fpsTick(now) {
  FPSM.n++;
  if (now - FPSM.t < 500) return;
  const f = Math.round(FPSM.n * 1000 / (now - FPSM.t)), el = $('fps'); FPSM.n = 0; FPSM.t = now;
  el.textContent = f + ' FPS'; el.className = f >= fpsCap() * 0.85 ? 'ok' : f >= fpsCap() * 0.55 ? 'mid' : 'low';
}
// strop snímků: displeje 90–144 Hz by jinak kreslily zbytečně často a vybíjely baterii
// bitva 60 (úspora baterie 30), menu 30, otevřená podnabídka 15
const fpsCap = () => role ? (SET.eco ? 30 : 60) : document.querySelector('.overlay.panelOpen, .overlay:not(.hidden):not(#menu):not(#rotate)') ? 15 : 30;
function loop(now) {
  requestAnimationFrame(loop);
  if (now - lastDraw < 1000 / fpsCap() - 3) return;
  lastDraw = now;
  if (SET.fps) fpsTick(now);
  perfTick(now - last);
  const dt = Math.min(0.1, (now - last) / 1000); last = now;
  netTick(now);
  tutTick();
  if ((role === 'solo' || role === 'host') && S) {
    if (S.over < 0 && !((paused || eggScene) && role === 'solo') && !netWait) {
      acc += dt * (role === 'solo' ? S.speed : 1);
      while (acc >= DT) {
        acc -= DT;
        step(DT);
        if (role === 'solo' || coop) ai(DT);
        if (S.bot) aiBot(DT);
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
  render(((paused || eggScene) && role === 'solo') || netWait ? 0 : dt);
  overlays(dt);
}
requestAnimationFrame(loop);

// PWA: v prohlížeči jde hra hrát offline a přidat na plochu (v aplikaci a při vývoji na localhostu se nespouští)
const nativeApp = !!(window.Capacitor && Capacitor.isNativePlatform && Capacitor.isNativePlatform());
if ('serviceWorker' in navigator && !nativeApp && (location.hostname !== 'localhost' || /[?&]pwa\b/.test(location.search)))
  navigator.serviceWorker.register('sw.js').catch(() => {});
// nová webová verze: v menu se načte hned, v bitvě až po návratu do menu (nevyhodí hráče z rozehrané hry)
let swNew = false;
if ('serviceWorker' in navigator) navigator.serviceWorker.addEventListener('message', e => { if (e.data && e.data.t === 'sw-new') { if (!role) location.reload(); else swNew = true; } });

// =====================================================================
//  WEB: ovládání klávesnicí a celá obrazovka na mobilu (v aplikaci se nepoužije)
// =====================================================================
// 1–9 = tlačítka ve spodní liště zleva, H hrdina, mezerník speciál, V evoluce, T věže, U vylepšení,
// Q/W/E rozkazy (útok/drž/ústup), R vztek, Tab rychlost, Esc/P pauza
addEventListener('keydown', e => {
  if (!V || !role || replay || e.target.tagName === 'INPUT') return;
  const k = e.key.toLowerCase();
  if (eggScene && k === 'escape') { eggScene = null; e.preventDefault(); return; }
  if (k === 'escape' || k === 'p') { if (role === 'solo' && V.over < 0) { paused = !paused; sfx('click'); } e.preventDefault(); return; }
  if (paused || V.over >= 0 || netWait) return;
  const cmdBtns = btns.filter(b => b.cmd && typeof b.cmd === 'object');
  const press = pred => { const b = btns.find(b => b.cmd && typeof b.cmd === 'object' && pred(b.cmd)); if (b && b.ok) act(b.cmd); };
  if (/^[1-9]$/.test(k)) { const b = cmdBtns[+k - 1]; if (b && b.ok) { act(b.cmd); BTN_FLASH.set(btnKey(b), T); } }
  else if (k === 'h') press(c => c.a === 'hero');
  else if (k === ' ') press(c => c.a === 'special');
  else if (k === 'v') press(c => c.a === 'evolve');
  else if (k === 't') uiMode = uiMode === 'turrets' ? 'units' : 'turrets';
  else if (k === 'u') uiMode = uiMode === 'upgrades' ? 'units' : 'upgrades';
  else if (k === 'q' || k === 'w' || k === 'e') { const o = 'qwe'.indexOf(k); if (V.pl[mySide].ord !== o) act({ a: 'ord', o }); }
  else if (k === 'r') act({ a: 'rage' });
  else if ('asdf'.includes(k) && k.length === 1) { const i = 'asdf'.indexOf(k), p = V.pl[mySide]; if (p.abc && p.abc[i] <= 0 && !(p.abl > 0)) { act({ a: 'abil', k: i }); BTN_FLASH.set('ab' + i, T); } }
  else if (k === 'tab') { if (role === 'solo' && S) S.speed = S.speed >= 3 ? 1 : (S.speed || 1) + 1; }
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

// telefon na výšku: kromě CSS i přes JS (některé WebView media dotaz na orientaci nehlásí) – ukázat výzvu a pozastavit hru
function orientCheck() {
  const port = matchMedia('(pointer: coarse)').matches && innerHeight > innerWidth;
  $('rotate').classList.toggle('show', port);
  if (port && role === 'solo' && S && S.over < 0) paused = true;
}
addEventListener('resize', orientCheck); addEventListener('orientationchange', orientCheck); orientCheck();
