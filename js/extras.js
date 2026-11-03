// =====================================================================
//  NASTAVENÍ (grafika, události) + NÁROD
// =====================================================================
const GFX_N = ['Nízká', 'Střední', 'Vysoká', 'Ultra'];
const GFX_D = ['Pro slabší telefony: méně částic, bez záře, nižší rozlišení.', 'Úspornější vykreslení, většina efektů zůstává.',
  'Plná grafika s měkkými stíny.', 'Navíc sluneční paprsky, ptáci, prach od nohou, tráva v popředí a barevné ladění. Nejnáročnější.'];
GFXL = SET.gfx ?? 2; resize();
function refreshSet() {
  document.querySelectorAll('#gfxOpts button').forEach(b => b.classList.toggle('on', +b.dataset.g === GFXL));
  $('gfxNote').textContent = GFX_D[GFXL];
  $('bEvt').textContent = '⚡ Události: ' + (SET.evt !== false ? 'ZAP' : 'VYP');
  $('bAutoGfx').textContent = '📉 Auto grafika: ' + (SET.gfxAuto !== false ? 'ZAP' : 'VYP');
  $('bEco').textContent = '🔋 Úspora baterie: ' + (SET.eco ? 'ZAP' : 'VYP');
  $('bFps').textContent = '📈 Ukazatel FPS: ' + (SET.fps ? 'ZAP' : 'VYP'); $('fps').classList.toggle('hidden', !SET.fps);
  $('bLang').textContent = LANG === 'en' ? '🌐 English' : '🌐 Čeština';
}
document.querySelectorAll('#gfxOpts button').forEach(b => b.onclick = () => { SET.gfx = GFXL = +b.dataset.g; saveSet(); resize(); refreshSet(); sfx('click'); });
$('bLang').onclick = () => { SET.lang = LANG === 'en' ? 'cs' : 'en'; saveSet(); location.reload(); };   // jazyk se přepne po znovunačtení
$('bAutoGfx').onclick = () => { SET.gfxAuto = SET.gfxAuto === false; saveSet(); refreshSet(); sfx('click'); };
// úspora baterie: v bitvě 30 snímků/s a nižší rozlišení plátna
$('bFps').onclick = () => { SET.fps = !SET.fps; saveSet(); refreshSet(); sfx('click'); };
$('fps').classList.toggle('hidden', !SET.fps);                 // ukazatel zůstane zapnutý i po restartu
$('bEco').onclick = () => { SET.eco = !SET.eco; saveSet(); resize(); refreshSet(); sfx('click'); };
// automatická grafika: když telefon několik sekund nestíhá (< ~25 snímků/s), sníží kvalitu o stupeň
const perf = { sum: 0, n: 0 };
function perfTick(ms) {
  if (!role || document.hidden || ms > 250 || ms <= 0 || SET.gfxAuto === false || GFXL === 0 || paused) { perf.sum = perf.n = 0; return; }
  perf.sum += ms; perf.n++;
  if (perf.n < 150) return;
  const avg = perf.sum / perf.n; perf.sum = perf.n = 0;
  if (avg > 40) {
    SET.gfx = GFXL = GFXL - 1; saveSet(); resize();
    toasts.push({ a: { n: 'Grafika snížena na „' + GFX_N[GFXL] + '“' }, h: '📉 PLYNULOST', l: 3 });
  }
}
$('bEvt').onclick = () => { SET.evt = SET.evt === false; saveSet(); refreshSet(); sfx('click'); };
// hlavní menu: tři vstupy, zbytek v podnabídkách
$('bSP').onclick = () => { refreshMenu(); openPanel('spPanel'); };
$('bMP').onclick = () => { refreshMenu(); openPanel('mpPanel'); };
$('bGS').onclick = () => { refreshMenu(); refreshSet(); openPanel('gsPanel'); };
$('bTourOpen').onclick = () => { renderTour(); openPanel('tourPanel'); };

// oblíbený národ pro každý věk (ve hře se dá po startu a po evoluci změnit)
function renderFac() {
  const af = cleanAf(SET.af);
  $('facList').innerHTML = '<p class="muted">Vyber si oblíbený národ pro každou dobu. Ve hře se ti po startu a po každé evoluci na pár sekund nabídne výběr – když nic nezvolíš, platí tenhle.</p>' +
    AGES.map((A, a) => `<div class="fac-age"><h3>${A.name}</h3><div class="fac-grid">` + AGEFAC[a].map((f, i) => `
      <button class="fac ${af[a] === i ? 'on' : ''}" data-a="${a}" data-f="${i}">
        <span class="fac-ic">${f.ic}</span>
        <span class="fac-t"><b>${f.n}</b><small>${f.d} Jednotky: ${f.u.join(', ')}. Hrdina: ${f.hero}.</small></span>
      </button>`).join('') + '</div></div>').join('');
  document.querySelectorAll('#facList .fac').forEach(b => b.onclick = () => {
    const a = cleanAf(SET.af); a[+b.dataset.a] = +b.dataset.f; SET.af = a; saveSet(); renderFac(); sfx('click');
  });
}
$('bFac').onclick = () => { renderFac(); openPanel('facPanel'); };

// =====================================================================
//  PROFIL – zkušenosti, úrovně, hodnosti a znaky na prapor
// =====================================================================
const RANKS = ['Rekrut', 'Vojín', 'Svobodník', 'Desátník', 'Četař', 'Rotný', 'Rotmistr', 'Praporčík', 'Poručík', 'Nadporučík', 'Kapitán', 'Major', 'Podplukovník', 'Plukovník', 'Generál', 'Maršál', 'Vojevůdce'];
const EMBS = [{ n: 'Žádný', ic: '', lv: 1 }, { n: 'Vlk', ic: '🐺', lv: 2 }, { n: 'Lebka', ic: '💀', lv: 3 }, { n: 'Meče', ic: '⚔️', lv: 5 }, { n: 'Orel', ic: '🦅', lv: 7 },
  { n: 'Koruna', ic: '👑', lv: 9 }, { n: 'Drak', ic: '🐉', lv: 12 }, { n: 'Blesk', ic: '⚡', lv: 15 }, { n: 'Plamen', ic: '🔥', lv: 18 }, { n: 'Hvězda', ic: '⭐', lv: 22 },
  { n: 'Zlaté vejce', ic: '🥚', lv: 1, egg: 1 }];
const embLocked = (e, L) => L < e.lv || (e.egg && !SET.egg);
let curEmb = '', lastXp = 0, eggTaps = [];
const PROF = load('aow-prof', { xp: 0 });
const lvlNeed = L => 75 * L * (L - 1);                   // celkové XP potřebné na úroveň L
function profLevel(xp = PROF.xp) { let L = 1; while (xp >= lvlNeed(L + 1)) L++; return L; }
const rankOf = L => RANKS[Math.min(RANKS.length - 1, L - 1)];
function profGain(won, V) {
  const me = V.pl[mySide], stars = V.camp != null || V.daily ? lastStars : 0;
  lastXp = 25 + Math.min(200, me.kills * 2) + (won ? 80 : 0) + (role !== 'solo' ? 30 : 0) + stars * 20;
  const before = profLevel();
  PROF.xp += lastXp; store('aow-prof', PROF);
  const now = profLevel();
  if (now > before) {
    const emb = EMBS.find(e => e.lv === now);
    toasts.push({ a: { n: `Úroveň ${now}: ${rankOf(now)}${emb ? ' · nový znak ' + emb.ic : ''}` }, h: 'POVÝŠENÍ!', l: 4.5 });
    sfx('ach');
  }
}
function renderProf() {
  const L = profLevel(), a = lvlNeed(L), b = lvlNeed(L + 1), pct = Math.round((PROF.xp - a) / (b - a) * 100);
  $('profBody').innerHTML = `
    <div class="prof-head">
      <div class="prof-lvl">${L}</div>
      <div class="prof-info"><b>${rankOf(L)}</b><small>${PROF.xp.toLocaleString('cs')} XP · do další úrovně ${(b - PROF.xp).toLocaleString('cs')} XP</small>
        <div class="prof-bar"><i style="width:${pct}%"></i></div></div>
    </div>
    <label class="nick">Tvoje přezdívka (uvidí ji kámoši, každé jméno může mít jen jeden hráč):</label>
    <div class="row"><input id="nick" maxlength="14" placeholder="Hráč" autocomplete="off" value="${esc(SET.name || '')}"><button id="bNick">💾 Uložit</button></div>
    <p id="nickMsg" class="muted">${ME.nbad ? '⚠️ Tohle jméno už používá jiný hráč – vyber si jiné.' : ''}</p>
    <div class="colors-head">Znak na praporu základny</div>
    <div id="embList">${EMBS.map((e, i) => `<button class="emb ${(SET.emb || 0) === i ? 'on' : ''} ${embLocked(e, L) ? 'locked' : ''}" data-e="${i}" title="${e.n}">${embLocked(e, L) ? (e.egg ? '🔒<small>???</small>' : '🔒<small>úr. ' + e.lv + '</small>') : e.ic || '—'}</button>`).join('')}</div>
    ${EXTREME() ? '<p class="extreme">💀 EXTREME BRUTAL je zapnutý – víc krve a v kampani tlačítko 😡 Vztek.</p>' : ''}
    <p class="muted">XP získáváš za každou hru: za zabité nepřátele, výhry, online zápasy a hvězdy z kampaně a denní výzvy.</p>`;
  // přezdívka se uloží až po kontrole, že ji nemá jiný hráč
  const saveNick = async () => {
    const n = $('nick').value.trim().slice(0, 14), msg = t => { $('nickMsg').textContent = t; };
    if (n === (SET.name || '')) { msg(''); return; }
    sfx('click'); msg('Kontroluji jméno…');
    try { await claimName(n); SET.name = n; saveSet(); msg('✔ Uloženo.'); pubSync(true); }
    catch (e) { msg('❌ ' + e.message); }
  };
  $('bNick').onclick = saveNick; $('nick').onkeydown = e => { if (e.key === 'Enter') saveNick(); };
  document.querySelectorAll('#embList .emb').forEach(b => b.onclick = () => {
    const i = +b.dataset.e; if (embLocked(EMBS[i], profLevel())) return;
    SET.emb = i; saveSet();
    if (EMBS[i].egg) {
      const now = performance.now(); eggTaps = eggTaps.filter(t => now - t < 2500); eggTaps.push(now);
      if (eggTaps.length >= 7 && !SET.brutal) { eggTaps = []; toasts.push({ a: { n: 'Nejdřív zapni 🩸 Brutal' }, h: '💀 TAJEMSTVÍ', l: 3 }); }
      else if (eggTaps.length >= 7) {
        eggTaps = []; SET.extreme = !SET.extreme; saveSet(); sfx(SET.extreme ? 'rage' : 'click');
        toasts.push({ a: { n: SET.extreme ? 'EXTREME BRUTAL zapnut' : 'EXTREME BRUTAL vypnut' }, h: '💀 TAJEMSTVÍ', l: 3.5 });
        if (SET.extreme) unlock(ACH.find(a => a.id === 'extreme'));
      }
    }
    renderProf(); if (!EMBS[i].egg) sfx('click');
  });
}
$('bProf').onclick = () => { renderProf(); openPanel('profPanel'); };

// =====================================================================
//  ULTRA GRAFIKA – sluneční paprsky, ptáci, tráva v popředí, ladění barev
// =====================================================================
const BIRDS = Array.from({ length: 5 }, (_, i) => ({ o: i * 280, y: 130 + (i % 3) * 30, v: 24 + i * 5, s: 0.7 + (i % 2) * 0.4 }));
function ultraBack() {
  const F = FIELDS[FIELD];
  if (F.sun && !WX.night && (WX.kind === 'clear' || WX.kind === 'cloudy')) {
    const op = c.globalCompositeOperation; c.globalCompositeOperation = 'lighter';
    c.save(); c.translate(980, 200); c.rotate(T * 0.03);
    for (let k = 0; k < 9; k++) {
      c.rotate(Math.PI * 2 / 9);
      c.fillStyle = `rgba(255,240,200,${0.035 + Math.sin(T * 0.7 + k) * 0.015})`;
      c.beginPath(); c.moveTo(0, 0); c.lineTo(-40, 700); c.lineTo(40, 700); c.closePath(); c.fill();
    }
    c.restore(); c.globalCompositeOperation = op;
  }
  if (!WX.night && FIELD !== 'volcano') {
    c.strokeStyle = 'rgba(30,30,40,.7)'; c.lineWidth = 1.6; c.lineCap = 'round';
    for (const b of BIRDS) {
      const x = ((T * b.v + b.o) % (W + 200)) - 100, y = b.y + Math.sin(T * 0.8 + b.o) * 10, f = Math.sin(T * 8 + b.o) * 3 * b.s;
      c.beginPath(); c.moveTo(x - 7 * b.s, y - f); c.quadraticCurveTo(x - 3 * b.s, y - 3 * b.s, x, y); c.quadraticCurveTo(x + 3 * b.s, y - 3 * b.s, x + 7 * b.s, y - f); c.stroke();
    }
  }
}
function ultraFront() {
  // tráva v popředí přes chodidla jednotek, vlní se ve větru
  const F = FIELDS[FIELD]; if (FIELD === 'winter' || FIELD === 'volcano') return;
  c.strokeStyle = F.grass[2]; c.lineWidth = 2; c.lineCap = 'round';
  const step = FIELD === 'desert' ? 44 : 13, sway = Math.sin(T * 1.6) * 2 + (WX.wind || 0) * 0.08;
  c.beginPath();
  for (let x = 4; x < W; x += step) {
    const h = 6 + ((x * 37) % 7), lean = sway + Math.sin(T * 2.3 + x * 0.05) * 1.5;
    c.moveTo(x, GY + 6); c.quadraticCurveTo(x + lean * 0.4, GY + 6 - h * 0.6, x + lean, GY + 6 - h);
    c.moveTo(x + 4, GY + 6); c.quadraticCurveTo(x + 4 + lean * 0.3, GY + 6 - h * 0.4, x + 5 + lean * 0.8, GY + 6 - h * 0.75);
  }
  c.stroke();
}
function ultraGrade() {
  // jemné teplé ladění a vinětace
  const op = c.globalCompositeOperation;
  c.globalCompositeOperation = 'soft-light'; c.fillStyle = WX.night ? 'rgba(80,110,200,.18)' : 'rgba(255,190,120,.16)'; c.fillRect(0, 0, W, H);
  c.globalCompositeOperation = op;
  c.fillStyle = rg('vign', W / 2, H / 2, 260, 820, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,.38)']]); c.fillRect(0, 0, W, H);
}

// =====================================================================
//  VÝUKA – provede nováčka první hrou krok za krokem
// =====================================================================
const isBtn = (a, extra = {}) => b => b.cmd && typeof b.cmd === 'object' && b.cmd.a === a && Object.keys(extra).every(k => b.cmd[k] === extra[k]);
const TUT = [
  { t: 'Vítej v Brutal Ages! Tvoje základna je vlevo, soupeřova vpravo. Kdo první zničí základnu toho druhého, vyhrává.', next: 1 },
  { t: 'Kup jeskyňáka – klikni na jeho tlačítko nahoře. Jednotky se vyrábějí postupně a pak samy pochodují vpřed.', btn: isBtn('buy', { ty: 0 }), done: c => c.a === 'buy' && c.ty === 0 },
  { t: 'Prakovník útočí z dálky. Kup i jeho.', btn: isBtn('buy', { ty: 1 }), done: c => c.a === 'buy' && c.ty === 1 },
  { t: 'Postav věž na obranu: klikni na „Věže“.', btn: b => b.cmd === 'tmode', mode: 'turrets' },
  { t: 'Vyber Kamenomet. Věže střílí na nepřátele, kteří se přiblíží k tvé základně.', btn: isBtn('turret', { i: 0 }), done: c => c.a === 'turret', gold: 120 },
  { t: 'Pod horním panelem jsou rozkazy armádě. Zkus „Drž“ – vojáci zastaví u věží a budou bránit.', order: 1, done: c => c.a === 'ord' && c.o === 1, pre: () => { uiMode = 'units'; } },
  { t: 'Výborně! Teď dej rozkaz „Útok“, ať armáda zase táhne vpřed.', order: 0, done: c => c.a === 'ord' && c.o === 0 },
  { t: 'Blíží se nepřátelé! Použij speciální útok – Meteority zasáhnou celé bojiště.', btn: isBtn('special'), done: c => c.a === 'special', enemies: true },
  { t: 'Za zabité nepřátele dostáváš zlato a zkušenosti. S plnými zkušenostmi můžeš evolvovat do dalšího věku – zkus to!', btn: isBtn('evolve'), done: c => c.a === 'evolve', xp: true },
  { t: 'Ve středověku máš nové jednotky i věže. Vyvolej hrdinu – je silný a jeho tlačítko pak spustí Ničivý úder.', btn: isBtn('hero'), done: c => c.a === 'hero', gold: () => HEROES[S.pl[0].age].c },
  { t: 'Vylepšení zvyšují útok, zdraví jednotek a hradby. To je pro začátek vše – teď znič soupeřovu základnu!', next: 'end' },
];
let tut = null, tutBtn = null;
function startTutorial() {
  cleanupNet(); SET.diff = 0; startGame('solo'); SET.diff = load('aow-set', {}).diff ?? 1;
  S.events = false; S.pl[0].gold = 200; S.pl[0].pick = 0; aiT = 1e9; tut = { i: 0 }; tutEnter();
}
function tutEnter() {
  const st = TUT[tut.i];
  if (st.pre) st.pre();
  // zlato na krok počítá s aktuální cenou (hrdina se mezi verzemi zdražil a výuka se na něm zasekla)
  const g = typeof st.gold === 'function' ? st.gold() : st.gold;
  if (g) { S.pl[0].gold = Math.max(S.pl[0].gold, g + 50); S.pl[0].hcd = 0; }
  if (st.xp) S.pl[0].xp = Math.max(S.pl[0].xp, AGES[S.pl[0].age].xp);
  if (st.enemies) for (let i = 0; i < 5; i++) S.units.push({ id: S.nid++, side: 1, a: 0, ty: i % 2, x: 760 + i * 40, hp: 40, mx: 40, w: 26, st: 0, at: 0, cd: 1 });
}
function tutNext() {
  if (!tut) return;
  sfx('ach');
  if (TUT[tut.i].next === 'end') { tut = null; aiT = 2; store('aow-tut', { done: 1 }); return; }
  tut.i++; tutEnter();
}
function tutCmd(cmd) { if (tut && TUT[tut.i].done && TUT[tut.i].done(cmd)) setTimeout(tutNext, 400); }
function tutTick() { if (tut && TUT[tut.i].mode && uiMode === TUT[tut.i].mode) tutNext(); }
function drawTut() {
  tutBtn = null;
  if (!tut || !V) return;
  const st = TUT[tut.i];
  // zvýraznění cílového tlačítka
  const tgt = st.btn ? btns.find(st.btn) : st.order != null ? orderBtns[st.order] : null;
  if (tgt) {
    const p = 4 + Math.sin(T * 6) * 3;
    c.strokeStyle = '#fde047'; c.lineWidth = 4; rr(tgt.x - p, tgt.y - p, tgt.w + p * 2, tgt.h + p * 2, 12); c.stroke();
    c.fillStyle = '#fde047'; const ax = tgt.x + tgt.w / 2, ay = tgt.y + tgt.h + 10 + p;
    poly([ax, ay - 8, ax - 9, ay + 6, ax + 9, ay + 6]); c.fill();
  }
  const w = 640, x = W / 2 - w / 2, y = HUD + 64;
  rr(x, y, w, st.next ? 112 : 84, 14); c.fillStyle = 'rgba(15,21,34,.94)'; c.fill(); c.strokeStyle = '#e5c04a'; c.lineWidth = 2; c.stroke();
  c.fillStyle = '#fde68a'; c.font = '800 13px system-ui'; c.textAlign = 'left'; c.fillText(`🎓 VÝUKA ${tut.i + 1}/${TUT.length}`, x + 18, y + 24);
  c.fillStyle = '#f1f5f9'; c.font = '600 16px system-ui';
  const words = st.t.split(' '); let line = '', ly = y + 48;
  for (const wd of words) { if (c.measureText(line + wd).width > w - 36) { c.fillText(line, x + 18, ly); line = ''; ly += 21; } line += wd + ' '; }
  c.fillText(line, x + 18, ly);
  if (st.next) {
    const b = tutBtn = { x: x + w - 150, y: y + 68, w: 132, h: 34 };
    rr(b.x, b.y, b.w, b.h, 9); c.fillStyle = '#c2410c'; c.fill();
    c.fillStyle = '#fff'; c.font = '800 16px system-ui'; c.textAlign = 'center'; c.fillText(st.next === 'end' ? 'Do boje!' : 'Další ▶', b.x + b.w / 2, b.y + 23);
  }
}
$('bTut').onclick = () => { sfx('click'); startTutorial(); };
if (!load('aow-tut', {}).done) setTimeout(() => { if (!role) $('mstatus').innerHTML = ('Poprvé tady? Zkus <b style="font-size:15px;letter-spacing:0">🎓 Výuku</b> – za dvě minuty umíš všechno.'); }, 300);

// =====================================================================
//  TURNAJ PARTY – pavouk pro 4–8 hráčů, šíří se mezi telefony jako žebříček
// =====================================================================
const ROUND_N = pairs => pairs === 1 ? 'Finále' : pairs === 2 ? 'Semifinále' : 'Čtvrtfinále';
const BYE = { bye: 1 }, TBD = { tbd: 1 };            // volný los / zatím neodehráno
function tours() { return Object.values(PARTY.r).filter(x => x.k === 't').sort((a, b) => b.t - a.t); }
// pavouk: dvojice podle pořadí, volný los se posune dál; vítěz = první zápas té dvojice v rámci turnaje
function bracket(t) {
  const ms = Object.values(PARTY.r).filter(x => x.k === 'm' && x.tid === t.id).sort((a, b) => a.t - b.t);
  const n = t.pl.length, size = 1 << Math.ceil(Math.log2(n)), byes = size - n;
  // první kolo: volné losy dostanou první hráči v pořadí, ostatní hrají spolu
  let cur = [];
  for (let i = 0; i < byes; i++) cur.push(t.pl[i], BYE);
  for (let i = byes; i < n; i++) cur.push(t.pl[i]);
  const rounds = [];
  while (cur.length > 1) {
    const pairs = [], next = [];
    for (let i = 0; i < cur.length; i += 2) {
      const a = cur[i], b = cur[i + 1];
      let w = TBD;
      if (a === BYE && b === BYE) w = BYE;
      else if (b === BYE) w = a; else if (a === BYE) w = b;
      else if (a !== TBD && b !== TBD) { const m = ms.find(m => (m.a.p === a.p && m.b.p === b.p) || (m.a.p === b.p && m.b.p === a.p)); if (m) w = m.w === a.p ? a : b; }
      pairs.push({ a, b, w }); next.push(w);
    }
    rounds.push(pairs); cur = next;
  }
  const real = p => p && p !== BYE && p !== TBD ? p : null;
  return { rounds: rounds.map(rd => rd.map(m => ({ a: real(m.a), b: real(m.b), w: real(m.w), bye: m.a === BYE || m.b === BYE }))), champ: real(cur[0]) };
}
// čeká mezi mnou a soupeřem turnajový zápas?
function tourPending(p1, p2) {
  for (const t of tours()) {
    const { rounds } = bracket(t);
    for (let r = 0; r < rounds.length; r++) for (const m of rounds[r])
      if (m.a && m.b && !m.w && ((m.a.p === p1 && m.b.p === p2) || (m.a.p === p2 && m.b.p === p1))) return { tid: t.id, name: t.name, round: ROUND_N(rounds[r].length) };
  }
  return null;
}
let tourSel = [];
function renderTour() {
  const all = tours(), t = all[0];
  const known = partyTable().map(x => ({ p: x.id, n: x.n || '?' }));
  if (!known.some(x => x.p === SET.pid)) known.unshift({ p: SET.pid, n: SET.name || 'Hráč' });
  let html = '';
  if (t) {
    const { rounds, champ } = bracket(t);
    html += `<h3 class="tour-name">🏆 ${esc(t.name)}${champ ? ` – vítěz: <b>${esc(champ.n)}</b> 👑` : ''}</h3><div class="tour-br">` +
      rounds.map((rd, r) => `<div class="tour-col"><small>${ROUND_N(rd.length)}</small>` + rd.map(m => `
        <div class="tour-m">${[m.a, m.b].map(p => `<div class="${p && m.w && m.w.p === p.p ? 'w' : ''} ${p && p.p === SET.pid ? 'me' : ''}">${p ? esc(p.n) : m.bye ? '<i>volný los</i>' : '<i>čeká se…</i>'}</div>`).join('')}</div>`).join('') + '</div>').join('') + '</div>' +
      '<p class="muted">Turnajový zápas se odehraje sám, když se spolu dva soupeři z pavouka utkají v online souboji.</p>';
  }
  html += `<details ${t ? '' : 'open'}><summary>➕ Nový turnaj</summary>
    <input id="tourName" maxlength="24" placeholder="Název turnaje" value="Turnaj ${new Date().getDate()}. ${new Date().getMonth() + 1}.">
    <div id="tourPick">${known.map(p => `<label><input type="checkbox" value="${esc(p.p)}" ${tourSel.includes(p.p) ? 'checked' : ''}> ${esc(p.n)}</label>`).join('')}</div>
    <p class="muted">Vyber 3–8 hráčů (znáš ty, se kterými jsi hrál online). Pořadí výběru určí pavouka.</p>
    <button id="bTourNew">Vytvořit turnaj</button></details>`;
  $('tourBody').innerHTML = html;
  document.querySelectorAll('#tourPick input').forEach(i => i.onchange = () => { tourSel = i.checked ? [...tourSel, i.value] : tourSel.filter(x => x !== i.value); });
  $('bTourNew').onclick = () => {
    const pl = tourSel.map(p => known.find(k => k.p === p)).filter(Boolean).slice(0, 8);
    if (pl.length < 3) { $('bTourNew').textContent = 'Vyber aspoň 3 hráče'; return; }
    partyAdd({ id: 't-' + SET.pid + '-' + Date.now().toString(36), k: 't', t: Date.now(), name: $('tourName').value.trim().slice(0, 24) || 'Turnaj', pl });
    tourSel = []; renderTour(); sfx('ach');
  };
}

// =====================================================================
//  NEDÁVNÍ SOUPEŘI – pozvánka jedním klepnutím, bez opisování kódu
// =====================================================================
// každý hráč poslouchá na své „schránce“ (PREFIX + 'u-' + pid); pozvánka nese kód právě založené hry
let FRIENDS = (() => { try { return JSON.parse(localStorage.getItem('aow-friends')) || []; } catch (e) { return []; } })();
let inbox = null, friendOn = {}, invIn = null, invTimer = 0;
const inboxId = pid => PREFIX + 'u-' + pid;
const NET_WHAT = { duel: 'souboj 1 na 1', coop: 'hru spolu proti PC', '2v2': 'hru 2 na 2' };

function rememberFriend(i) {
  if (!i || !i.pid || i.pid === SET.pid) return;
  FRIENDS = [{ pid: i.pid, n: i.n || 'Hráč', at: Date.now() }, ...FRIENDS.filter(f => f.pid !== i.pid)].slice(0, 8);
  try { localStorage.setItem('aow-friends', JSON.stringify(FRIENDS)); } catch (e) {}
}

function inboxStart() {
  if (typeof Peer === 'undefined' || !SET.pid) return;
  if (inbox && !inbox.destroyed) { if (inbox.disconnected) try { inbox.reconnect(); } catch (e) {} return; }
  inbox = new Peer(inboxId(SET.pid), { config: ICE, debug: 0 });
  inbox.on('connection', c => c.on('data', m => onInbox(c, m)));
  inbox.on('disconnected', () => { try { inbox.reconnect(); } catch (e) {} });
  inbox.on('error', e => {
    if (e.type === 'unavailable-id') { try { inbox.destroy(); } catch (x) {} inbox = null; return; }   // schránku drží jiná karta
    if (e.type === 'peer-unavailable') {                       // kamarád není online
      const f = invList().find(f => String(e.message).includes(inboxId(f.pid)));
      if (f) { friendOn[f.pid] = 'off'; if (f.pid === inviteFriend.to) status(`${esc(f.n)} teď není ve hře. Pošli mu kód: <b>${hostGame.code}</b>`); renderFriends(); }
    }
  });
}
setInterval(inboxStart, 20000);
inboxStart();

// příchozí zprávy do schránky: dotaz, jestli jsem online, a pozvánka do hry
function onInbox(c, m) {
  if (!m) return;
  if (m.t === 'ping') { try { c.send({ t: 'pong', busy: role ? 1 : 0 }); } catch (e) {} return; }
  if (m.t !== 'inv') return;
  if (role || invIn) { try { c.send({ t: 'busy' }); } catch (e) {} return; }
  invIn = { c, code: String(m.code || '').slice(0, 5), n: String(m.n || 'Hráč').slice(0, 20) };
  rememberFriend({ pid: m.pid, n: invIn.n });
  $('invText').innerHTML = `<b>${esc(invIn.n)}</b> tě zve na ${esc(NET_WHAT[m.m] || 'hru')}.`;
  $('invPanel').classList.remove('hidden');
  sfx('ach'); vib([80, 60, 80]);
  clearTimeout(invTimer); invTimer = setTimeout(() => invAnswer(false), 30000);
}
function invAnswer(yes) {
  if (!invIn) return;
  clearTimeout(invTimer);
  const { c, code } = invIn; invIn = null;
  try { c.send({ t: yes ? 'ok' : 'no' }); } catch (e) {}
  $('invPanel').classList.add('hidden');
  if (!yes) return;
  sfx('click');
  document.querySelectorAll('.overlay:not(#menu):not(#rotate)').forEach(o => o.classList.add('hidden'));
  setTimeout(() => joinGame(code), 200);
}
$('bInvYes').onclick = () => invAnswer(true);
$('bInvNo').onclick = () => invAnswer(false);

// pozvat kamaráda: založí hru (nebo použije právě založenou) a pošle mu kód
function inviteFriend(f) {
  const m = SET.net || 'duel';
  if (!(peer && !peer.destroyed && hostGame.code && !role && !conn)) hostGame({ coop: m === 'coop', team: m === '2v2' });
  inviteFriend.to = f.pid;
  if (!inbox || !inbox.open) { status(`Pozvánky teď nefungují. Pošli kód: <b>${hostGame.code}</b>`); return; }
  status(`Zvu ${esc(f.n)}…`);
  const t0 = performance.now();
  const go = () => {
    if (!peer || peer.destroyed || role) return;
    if (!peer.open) { if (performance.now() - t0 < 10000) setTimeout(go, 300); return; }
    const c = inbox.connect(inboxId(f.pid), { reliable: true, serialization: 'json' });
    c.on('open', () => { c.send({ t: 'inv', code: hostGame.code, n: SET.name || 'Hráč', pid: SET.pid, m }); if (!role) status(`📨 Pozvánka odeslána: ${esc(f.n)}. Čekám na odpověď…<br><small>kód hry: <b>${hostGame.code}</b></small>`); });
    c.on('data', r => {
      if (role) return;
      if (r.t === 'ok') status(`${esc(f.n)} přijal pozvánku, připojuje se…`);
      else if (r.t === 'no') status(`${esc(f.n)} pozvánku odmítl.`);
      else if (r.t === 'busy') status(`${esc(f.n)} teď hraje jinou hru. Zkus to za chvíli.`);
      if (r.t !== 'ok') try { c.close(); } catch (e) {}
    });
  };
  go();
}

// kdo z nedávných soupeřů je právě ve hře (krátký dotaz na jeho schránku)
const invList = () => [...MYFR.filter(f => f.pid).map(f => ({ pid: f.pid, n: f.n, fr: 1 })), ...FRIENDS.filter(f => !MYFR.some(x => x.pid === f.pid))];
function pingFriends() {
  if (!inbox || !inbox.open) return;
  for (const f of invList()) {
    const c = inbox.connect(inboxId(f.pid), { reliable: true, serialization: 'json' });
    c.on('open', () => c.send({ t: 'ping' }));
    c.on('data', r => { if (r.t === 'pong') { friendOn[f.pid] = r.busy ? 'busy' : 'on'; renderFriends(); } try { c.close(); } catch (e) {} });
    setTimeout(() => { if (!friendOn[f.pid]) { friendOn[f.pid] = 'off'; renderFriends(); } try { c.close(); } catch (e) {} }, 9000);
  }
}
function renderFriends() {
  const box = $('friends'), L = invList();
  if (!L.length) { box.innerHTML = ''; return; }
  const st = { on: ['🟢', 'online'], busy: ['🟠', 'právě hraje'], off: ['⚫', 'offline'] };
  const row = (f, i) => {
    const [dot, txt] = st[friendOn[f.pid]] || ['⚪', 'zjišťuji…'];
    return `<div class="friend"><span>${dot} <b>${esc(f.n)}</b> <small>${txt}</small></span><span>${f.fr ? '' : `<button class="ghost" data-add="${i}" title="Poslat žádost o přátelství">➕ Přítel</button> `}<button data-i="${i}" ${friendOn[f.pid] === 'off' ? 'class="ghost"' : ''}>📨 Pozvat</button></span></div>`;
  };
  const fr = L.filter(f => f.fr), rec = L.filter(f => !f.fr);
  box.innerHTML = (fr.length ? '<h3>👥 Přátelé</h3>' + fr.map(f => row(f, L.indexOf(f))).join('') : '') + (rec.length ? '<h3>Nedávní soupeři</h3>' + rec.map(f => row(f, L.indexOf(f))).join('') : '');
  box.querySelectorAll('[data-i]').forEach(b => b.onclick = () => { sfx('click'); inviteFriend(L[+b.dataset.i]); });
  // nedávný soupeř → žádost o přátelství
  box.querySelectorAll('[data-add]').forEach(b => b.onclick = async () => {
    sfx('click'); b.disabled = true; b.textContent = '…';
    try {
      const f = L[+b.dataset.add], r = await frRequestPid(f.pid, f.n);
      b.textContent = r === 'friend' ? '✔ Přítel' : r === 'sent' ? '📨 Žádost odeslána' : '⏳ Odešle se později';
      if (r === 'later') status(`${esc(f.n)} ještě nemá novou verzi hry. Žádost se pošle sama, jakmile si ji spustí.`);
    }
    catch (e) { b.textContent = '❌'; status(esc(e.message)); }
  });
}
$('bMP').addEventListener('click', () => { friendOn = {}; renderFriends(); pingFriends(); });
