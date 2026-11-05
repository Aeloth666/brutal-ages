// =====================================================================
//  ÚSPĚCHY (achievementy)
// =====================================================================
const ACH = [
  { id: 'blood',   n: 'První krev',        d: 'Zabij první nepřátelskou jednotku.',          t: m => m.kills >= 1 },
  { id: 'k100',    n: 'Řezník',            d: 'Zabij 100 jednotek v jedné hře.',             t: m => m.kills >= 100 },
  { id: 'army',    n: 'Armáda',            d: 'Měj na bojišti 15 jednotek najednou.',        t: (m, V) => V.units.filter(u => u.side === mySide).length >= 15 },
  { id: 'age1',    n: 'Pokrok',            d: 'Dosáhni středověku.',                         t: (m, V) => m.age >= 1 && (modsOf(V).age || 0) < 1 },
  { id: 'age3',    n: 'Průmyslník',        d: 'Dosáhni moderní doby.',                       t: (m, V) => m.age >= 3 && (modsOf(V).age || 0) < 3 },
  { id: 'age4',    n: 'Návrat z budoucnosti', d: 'Dosáhni budoucnosti.',                     t: (m, V) => m.age >= 4 && (modsOf(V).age || 0) < 4 },
  { id: 'super',   n: 'Supervoják',        d: 'Vyrob supervojáka.',                          t: m => m.supers >= 1 },
  { id: 'towers',  n: 'Pevnost',           d: 'Měj postavené 4 věže najednou.',              t: m => m.tur.length >= 4 },
  { id: 'rich',    n: 'Boháč',             d: 'Nashromáždi 100 000 zlata.',                  t: m => m.gold >= 100000 },
  { id: 'sky',     n: 'Z nebe',            d: 'Zabij jedním speciálním útokem 5 jednotek.',  t: m => m.spBest >= 5 },
  { id: 'win',     n: 'Vítěz',             d: 'Vyhraj libovolnou hru.',                      w: () => true },
  { id: 'easy',    n: 'Rozcvička',         d: 'Poraž počítač na obtížnost Lehká.',           w: (m, V) => role === 'solo' && V.chal == null && V.camp == null && !V.daily && V.diff >= 0 },
  { id: 'normal',  n: 'Voják',             d: 'Poraž počítač na obtížnost Normální.',        w: (m, V) => role === 'solo' && V.chal == null && V.camp == null && !V.daily && V.diff >= 1 },
  { id: 'hard',    n: 'Generál',           d: 'Poraž počítač na obtížnost Těžká.',           w: (m, V) => role === 'solo' && V.chal == null && V.camp == null && !V.daily && V.diff >= 2 },
  { id: 'imposs',  n: 'Legenda',           d: 'Poraž počítač na obtížnost Nemožná.',         w: (m, V) => role === 'solo' && V.chal == null && V.camp == null && !V.daily && V.diff >= 3 },
  { id: 'online',  n: 'Král party',        d: 'Vyhraj online hru proti kámošovi.',           w: () => role !== 'solo' && !coop },
  { id: 'daily',   n: 'Každý den',         d: 'Splň denní výzvu.',                           w: (m, V) => !!V.daily },
  { id: 'daily7',  n: 'Vytrvalec',         d: 'Splň denní výzvu 7 dní v řadě.',              w: (m, V) => { let n = 0, d = new Date(); while (DRES[dayKey(d)]) { n++; d.setDate(d.getDate() - 1); } return n >= 7; } },
  { id: 'chicken', n: 'Slepice, nebo vejce?', d: 'Objev slepičí režim.', secret: 1 },
  { id: 'trex',    n: 'Jurský park',       d: 'Zažij v bitvě návrat T-Rexe.', secret: 1, t: (m, V) => !!V.trex },
  { id: 'egg',     n: 'Zlaté vejce',       d: 'Najdi zlaté vejce.', secret: 1 },
  { id: 'extreme', n: 'Extrémista',        d: 'Odemkni EXTREME BRUTAL.', secret: 1 },
  { id: 'rage',    n: 'Vzteklina',         d: 'Rozzuř vojáka v kampani.', secret: 1, t: (m, V) => V.units.some(u => u.side === mySide && u.rg) },
  { id: 'coop',    n: 'Parťáci',           d: 'Vyhrajte spolu online hru proti počítači.',   w: () => coop },
  { id: 'fast',    n: 'Blesková válka',    d: 'Vyhraj do 12 minut.',                         w: (m, V) => V.time < 720 },
  { id: 'notower', n: 'Bez hradeb',        d: 'Vyhraj bez postavení jediné věže.',           w: m => m.built === 0 },
  { id: 'tough',   n: 'Nedobytný',         d: 'Vyhraj se základnou nad 75 % zdraví.',        w: m => m.hp / m.mhp > 0.75 },
  { id: 'chal1',   n: 'Vyzyvatel',         d: 'Splň první výzvu.',                           w: () => Object.keys(CHS).length >= 1 },
  { id: 'chalAll', n: 'Mistr výzev',       d: 'Splň všechny výzvy.',                         w: () => Object.keys(CHS).length >= CHAL.length },
  { id: 'camp1',   n: 'Dobyvatel',         d: 'Dobyj první území v kampani.',                w: () => Object.keys(CAMPS).length >= 1 },
  { id: 'campAll', n: 'Pán světa',         d: 'Dokonči první kapitolu kampaně.',             w: () => chapDone(0) },
  { id: 'camp45',  n: 'Perfekcionista',    d: 'Získej všech 45 hvězd v první kapitole.', w: () => chapStars(0) >= 45 },
  { id: 'camp2',   n: 'Pán času',          d: 'Dokonči druhou kapitolu kampaně.',            w: () => chapDone(1) },
  { id: 'camp75',  n: 'Mistr času',        d: 'Získej v kampani všech 75 hvězd.',            w: () => chapStars(0) + chapStars(1) >= 75 },
  { id: 'rematch', n: 'Ještě jednou!',     d: 'Vyhraj odvetu proti kámošovi.',               w: () => role !== 'solo' && !coop && rematchN > 0 },
  // ---- bossové ----
  { id: 'surv10',  n: 'Ještě dýchám',      d: 'Přežij 10 vln v Nekonečném přežití.', t: (m, V) => V.surv > 10 },
  { id: 'surv25',  n: 'Šváb',              d: 'Přežij 25 vln. Tebe nic nezabije.',    t: (m, V) => V.surv > 25 },
  { id: 'surv50',  n: 'Věčný',             d: 'Přežij 50 vln. Jdi spát.',             t: (m, V) => V.surv > 50 },
  { id: 'candy',   n: 'Koledník',          d: 'O Halloweenu seber dýni s bonbony. Koleda, koleda!', secret: 1 },
  { id: 'gift',    n: 'Dárek pod stromeček', d: 'O Vánocích seber dárek na bojišti.', secret: 1 },
  { id: 'cloud',   n: 'Pojištěný',         d: 'Zálohuj svůj postup do cloudu.' },
  { id: 'friend',  n: 'Nejsi sám',         d: 'Přidej si prvního přítele. Teď už víš, komu to dát sežrat.' },
  { id: 'clanNew', n: 'Náčelník party',    d: 'Založ vlastní klan.' },
  { id: 'clanJoin', n: 'Nováček v partě',  d: 'Přidej se ke klanu.' },
  { id: 'clanGoal', n: 'Jeden za všechny', d: 'Splňte s klanem týdenní klanovou výzvu.' },
  { id: 'bMam',    n: 'Tygří předložka',   d: 'Poraž Šavlozubého tygra. Z kůže bude předložka.' },
  { id: 'bDrag',   n: 'Drakobijce amatér', d: 'Poraž Draka. Princezna nebyla k dispozici.' },
  { id: 'bZep',    n: 'Rozbitý vynález',   d: 'Rozbij Leonardův obrněný vůz. Leonardo by si to nakreslil líp.' },
  { id: 'bTank',   n: 'Šrotiště',          d: 'Rozbij Obří tank. Výkup železa platí.' },
  { id: 'bTitan',  n: 'Titanic',           d: 'Potop Titána. I ten největší jednou padne.' },
  { id: 'bAll',    n: 'Sběratel trofejí',  d: 'Poraž všech 5 bossů. Kam to všechno pověsíš?' },
  { id: 'bChick',  n: 'Kuřecí křidélka',   d: 'Poraž bosse ve slepičím režimu.', secret: 1 },
  // ---- generál, úkoly, skiny ----
  { id: 'gen5',    n: 'Kariérista',        d: 'Vylepši jednu větev Generála na maximum.' },
  { id: 'genAll',  n: 'Generalissimus',    d: 'Vylepši všechny tři větve Generála na maximum.' },
  { id: 'q1',      n: 'Poslušný voják',    d: 'Splň první úkol. Rozkaz je rozkaz.' },
  { id: 'q25',     n: 'Workoholik',        d: 'Splň 25 úkolů. Nechceš si dát pauzu?' },
  { id: 'skin',    n: 'Módní policie',     d: 'Obleč armádě nový skin.' },
  { id: 'skel',    n: 'Kostlivec ve skříni', d: 'Nasaď armádě skin Kostlivci.', secret: 1 },
  { id: 'gear',    n: 'Nablýskaný',        d: 'Získej hrdinovi první kus výbavy.' },
  // ---- bitva ----
  { id: 'spec10',  n: 'Elitní jednotka',   d: 'Vyrob v jedné bitvě 10 speciálních jednotek.', t: () => !!(S && S.st && S.st.spec[mySide] >= 10) },
  { id: 'night',   n: 'Noční směna',       d: 'Bojuj, když na bojiště padne noc.',  t: (m, V) => nightK(V.time) >= 1 && V.over < 0 },
  { id: 'storm',   n: 'Písek v botách',    d: 'Zažij písečnou bouři.',              t: (m, V) => !!V.storm },
  { id: 'lava',    n: 'Horké nožičky',     d: 'Zažij výbuch lávy na sopce.' },
  { id: 'bast',    n: 'Zachráněn zvonem',  d: 'Zachraň základnu Poslední baštou.' },
  { id: 'gcry',    n: 'Křikem k vítězství', d: 'Zazni válečným pokřikem generála.' },
  { id: 'turbo',   n: 'Spěchám na oběd',   d: 'Hraj na dvojnásobnou rychlost.',     t: (m, V) => V.speed > 1 && V.over < 0 },
  { id: 'broke',   n: 'Chudý jako kostelní myš', d: 'Měj v bitvě po minutě úplně 0 zlata.', t: (m, V) => m.gold === 0 && V.time > 60 && V.over < 0 },
  { id: 'close',   n: 'O chlup',           d: 'Vyhraj se základnou pod 5 % zdraví.', w: m => m.hp / m.mhp < 0.05 },
  { id: 'caveman', n: 'Dědeček s kyjem',   d: 'Vyhraj v době kamenné nad soupeřem z budoucnosti.', w: (m, V) => m.age === 0 && V.pl[1 - mySide].age === 4 },
  { id: 'swamp',   n: 'Král bažin',        d: 'Vyhraj v bažině. Smrdíš, ale vyhrál jsi.', w: () => FIELD === 'swamp' },
  { id: 'insane',  n: 'Šílenec',           d: 'Poraž počítač na obtížnost Šílená.',  w: (m, V) => role === 'solo' && V.chal == null && V.camp == null && !V.daily && V.diff >= 4 },
  { id: 'def',     n: 'Nedám!',            d: 'Ubraň dobyté území před Rudou hordou.' },
  { id: 'loss',    n: 'Prohra je taky výsledek', d: 'Prohraj bitvu. Hlavně že ses zúčastnil.', l: () => true },
  { id: 'loss10',  n: 'Pokorný',           d: 'Prohraj 10 bitev a pořád hraj dál.', l: () => (ST.lost = (ST.lost || 0) + 1) >= 10 },
  // ---- online ----
  { id: 'elo1200', n: 'Šachista',          d: 'Dosáhni online hodnocení 1200.' },
  { id: 'podium',  n: 'Na bedně',          d: 'Buď v online žebříčku mezi prvními třemi.' },
  { id: 'spect',   n: 'Gaučový generál',   d: 'Sleduj cizí bitvu jako divák. Popcorn s sebou.' },
  { id: 'emote',   n: 'Provokatér',        d: 'Pošli soupeři emote.' },
  { id: 'finger',  n: 'Gesto míru',        d: 'Pošli soupeři ten nejsprostší emote.', secret: 1 },
  { id: 'stats',   n: 'Analytik',          d: 'Prohlédni si statistiky po bitvě.' },
  { id: 'update',  n: 'Čerstvý jak rohlík', d: 'Hraj aktualizovanou verzi hry.', secret: 1 },
];
const achId = id => { const a = ACH.find(a => a.id === id); if (a) unlock(a); };
// bossové: id úspěchu podle věku bosse
function achBoss(a) {
  achId(['bMam', 'bDrag', 'bZep', 'bTank', 'bTitan'][a]);
  if (SET.chicken) achId('bChick');
  if (['bMam', 'bDrag', 'bZep', 'bTank', 'bTitan'].every(id => ACHS[id])) achId('bAll');
}
let rematchN = 0;
let ACHS = {};
try { ACHS = JSON.parse(localStorage.getItem('aow-ach') || '{}'); } catch (e) {}
let toasts = [], endDone = false;

function unlock(a) {
  if (ACHS[a.id]) return;
  ACHS[a.id] = Date.now();
  try { localStorage.setItem('aow-ach', JSON.stringify(ACHS)); } catch (e) {}
  toasts.push({ a, l: 4 });
  sfx('ach');
}
function checkAch(V) {
  const me = V.pl[mySide];
  for (const a of ACH) if (a.t && !ACHS[a.id] && a.t(me, V)) unlock(a);
  if (V.over >= 0 && !endDone) {
    endDone = true;
    const won = V.over === mySide;
    sfx(won ? 'win' : 'lose');
    vib(won ? [60, 60, 60, 60, 220] : 450);
    if (S && S.st) { lastBst = S.st; if (role === 'host') send({ t: 'bst', d: S.st }); }
    record(won, V);
    if (won) for (const a of ACH) if (a.w && !ACHS[a.id] && a.w(me, V)) unlock(a);
    if (!won && role) { for (const a of ACH) if (a.l && (a.l(me, V) && !ACHS[a.id])) unlock(a); store('aow-stats', ST); }
  }
}

// v menu je plátno schované pod HTML panely – oznámení se tam ukáže jako prvek nad nimi
const toastEl = document.createElement('div');
toastEl.id = 'toast'; toastEl.className = 'hidden';
document.body.appendChild(toastEl);
function domToast(dt) {
  const tt = toasts[0];
  if (!tt) { toastEl.className = 'hidden'; toastEl.dataset.k = ''; return; }
  tt.l -= dt;
  const key = (tt.h || '') + tt.a.n;
  if (toastEl.dataset.k !== key) {
    toastEl.dataset.k = key;
    toastEl.innerHTML = `<span class="t-ico">${tt.tip ? '💡' : '🏆'}</span><span><small>${esc(tt.h || 'ÚSPĚCH ODEMČEN')}</small><b>${esc(tt.a.n)}</b></span>`;
  }
  toastEl.className = tt.l > 0.35 ? 'show' : '';
  if (tt.l <= 0) { toasts.shift(); toastEl.dataset.k = ''; }
}
function drawToasts(dt) {
  if (!role) return domToast(dt);
  if (toastEl.className !== 'hidden') { toastEl.className = 'hidden'; toastEl.dataset.k = ''; }
  if (!toasts.length) return;
  const tt = toasts[0];
  tt.L = tt.L || tt.l; tt.l -= dt;
  const k = Math.min(1, (tt.L - tt.l) * 4, tt.l * 3), y = HUD + 10 - (1 - k) * 80;
  c.globalAlpha = Math.max(0, k);
  const w = tt.tip ? 660 : 380, h = tt.tip ? 74 : 62, x = W / 2 - w / 2;
  rr(x, y + 3, w, h, 14); c.fillStyle = 'rgba(0,0,0,.45)'; c.fill();
  rr(x, y, w, h, 14); c.fillStyle = tt.tip ? 'rgba(15,30,45,.96)' : lg('toast', 0, y, 0, y + 62, [[0, '#3a2a0a'], [1, '#1c1405']]); c.fill();
  c.strokeStyle = tt.tip ? '#38bdf8' : '#e5c04a'; c.lineWidth = 2; c.stroke();
  if (tt.tip) { c.font = '30px system-ui'; c.textAlign = 'center'; c.fillText('💡', x + 34, y + 47); } else trophy(x + 34, y + 31, 1);
  c.textAlign = 'left'; c.fillStyle = tt.tip ? '#7dd3fc' : '#fde68a'; c.font = '800 12px system-ui'; c.fillText(tt.h || 'ÚSPĚCH ODEMČEN', x + 64, y + 22);
  if (tt.tip) {                                       // tip: text na dva řádky
    c.fillStyle = '#fff'; c.font = '700 15px system-ui';
    const words = tt.a.n.split(' '); let line = '', ly = y + 42;
    for (const wd of words) { if (c.measureText(line + wd).width > w - 80 && line) { c.fillText(line, x + 64, ly); line = ''; ly += 19; } line += wd + ' '; }
    c.fillText(line, x + 64, ly);
  } else { c.fillStyle = '#fff'; c.font = '900 19px system-ui'; c.fillText(tt.a.n, x + 64, y + 44, w - 76); }
  c.globalAlpha = 1;
  if (tt.l <= 0) toasts.shift();
}
function trophy(x, y, s) {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.beginPath(); c.moveTo(-12, -14); c.lineTo(12, -14); c.quadraticCurveTo(12, 4, 0, 6); c.quadraticCurveTo(-12, 4, -12, -14); c.closePath();
  fo(lg('troph', 0, -14, 0, 6, [[0, '#fff3b0'], [1, '#ca8a04']]), 1.5);
  c.strokeStyle = OL; c.lineWidth = 3.4; c.beginPath(); c.arc(-12, -7, 5, Math.PI * 0.5, Math.PI * 1.5); c.stroke(); c.beginPath(); c.arc(12, -7, 5, -Math.PI * 0.5, Math.PI * 0.5); c.stroke();
  c.strokeStyle = '#e5c04a'; c.lineWidth = 1.8; c.beginPath(); c.arc(-12, -7, 5, Math.PI * 0.5, Math.PI * 1.5); c.stroke(); c.beginPath(); c.arc(12, -7, 5, -Math.PI * 0.5, Math.PI * 0.5); c.stroke();
  rr(-3, 5, 6, 6, 1); fo('#ca8a04', 1.2); rr(-9, 11, 18, 5, 2); fo('#7c4a03', 1.2);
  c.restore();
}

function renderAchList() {
  const el = document.getElementById('achList');
  const got = ACH.filter(a => ACHS[a.id]).length;
  document.getElementById('achCount').textContent = `${got} / ${ACH.length}`;
  el.innerHTML = ACH.map(a => {
    const got = ACHS[a.id], hide = a.secret && !got;
    return `<div class="ach ${got ? 'got' : ''}"><span class="ico">${got ? '🏆' : hide ? '❔' : '🔒'}</span><div><b>${hide ? '???' : a.n}</b><small>${hide ? 'Tajný úspěch – zkus ho najít.' : a.d}</small></div></div>`;
  }).join('');
}

// =====================================================================
//  PAUZA
// =====================================================================
let paused = false, pauseBtns = [];
function drawPause() {
  c.fillStyle = 'rgba(8,10,16,.75)'; c.fillRect(0, 0, W, H);
  const w = 360, h = role === 'solo' && !tut ? 442 : 384, x = W / 2 - w / 2, y = 116;
  rr(x, y, w, h, 18); c.fillStyle = '#151c2b'; c.fill(); c.strokeStyle = '#e5c04a'; c.lineWidth = 2; c.stroke();
  c.textAlign = 'center'; c.fillStyle = '#fde68a'; c.font = '900 30px system-ui'; c.fillText(role === 'solo' ? 'PAUZA' : 'MENU', W / 2, y + 46);
  if (role !== 'solo') { c.fillStyle = '#94a3b8'; c.font = '600 13px system-ui'; c.fillText('Online hra mezitím běží dál', W / 2, y + 68); }
  const items = [
    ['Pokračovat', 'resume', '#15803d'],
    ['Hudba: ' + (SET.music ? 'ZAP' : 'VYP'), 'music', '#334155'],
    ['Zvuky: ' + (SET.sfx ? 'ZAP' : 'VYP'), 'sfx', '#334155'],
    ['Vibrace: ' + (SET.vib ? 'ZAP' : 'VYP'), 'vib', '#334155'],
    ...(role === 'solo' && !tut ? [['↻ Začít znovu', 'restart', '#b45309']] : []),
    ['Ukončit hru', 'quit', '#b91c1c'],
  ];
  pauseBtns = items.map(([t, k, col], i) => {
    const b = { x: x + 40, y: y + 82 + i * 58, w: w - 80, h: 46, k };
    rr(b.x, b.y + 3, b.w, b.h, 10); c.fillStyle = 'rgba(0,0,0,.4)'; c.fill();
    rr(b.x, b.y, b.w, b.h, 10); c.fillStyle = col; c.fill();
    c.fillStyle = '#fff'; c.font = '800 19px system-ui'; c.fillText(t, W / 2, b.y + 30);
    return b;
  });
}

function overlays(dt) {
  c.setTransform(scl, 0, 0, scl, ox, oy);
  c.save(); c.beginPath(); c.rect(0, 0, W, H); c.clip();
  if (V && role && replay) drawReplay();
  else if (V && role) {
    checkAch(V);
    baseVib(V, dt);
    drawChat(dt);
    drawWait();
    if (!paused && V.pl) drawFacPick(V.pl[mySide]);
    drawTut();
    if (paused) drawPause();
  }
  if (splats.length && role) drawSplats(dt);
  if (eggScene && role) drawEggScene();
  drawToasts(dt);
  c.restore();
}

// =====================================================================
//  MENU
// =====================================================================
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
function refreshMenu() {
  document.querySelectorAll('.seg button[data-d]').forEach(b => b.classList.toggle('on', +b.dataset.d === SET.diff));
  const ins = $('bInsane'); if (ins && typeof CAMPS !== 'undefined') { ins.classList.toggle('locked', !CAMPS[CAMP_CH[0].b - 1]); ins.textContent = CAMPS[CAMP_CH[0].b - 1] ? '🔥 Šílená' : '🔒 Šílená'; }
  document.querySelectorAll('#netMode button').forEach(b => b.classList.toggle('on', b.dataset.m === (SET.net || 'duel')));
  $('bMusic').textContent = 'Hudba: ' + (SET.music ? 'ZAP' : 'VYP');
  $('bSfx').textContent = 'Zvuky: ' + (SET.sfx ? 'ZAP' : 'VYP');
  $('bVib').textContent = 'Vibrace: ' + (SET.vib ? 'ZAP' : 'VYP');
  $('bBrutal').textContent = '🩸 Brutal: ' + (SET.brutal ? 'ZAP' : 'VYP');
  if (typeof refreshResume === 'function') refreshResume();
}
const openPanel = id => { $(id).classList.remove('hidden'); sfx('click'); };
document.querySelectorAll('.panel-close').forEach(b => b.onclick = () => b.closest('.overlay').classList.add('hidden'));

function renderStats() {
  const row = (k, v) => `<div class="st-row"><span>${k}</span><b>${v}</b></div>`;
  const solo = DIFF.map((d, i) => row(d.n, `${ST.solo[i][0]} : ${ST.solo[i][1]}`)).join('');
  const vs = Object.entries(ST.vs).sort((a, b) => b[1][0] + b[1][1] - a[1][0] - a[1][1])
    .map(([n, r]) => row(esc(n), `${r[0]} : ${r[1]}`)).join('') || '<p class="muted">Zatím žádná online hra.</p>';
  $('statBody').innerHTML =
    `<div class="st-col"><h3>Proti počítači <small>výhry : prohry</small></h3>${solo}
      <h3>Celkem</h3>${row('Odehraných her', ST.games)}${row('Zabitých jednotek', ST.kills.toLocaleString('cs'))}${row('Nejrychlejší výhra', ST.best ? fmtTime(ST.best) : '—')}</div>
     <div class="st-col"><h3>Proti kámošům <small>výhry : prohry</small></h3>${vs}</div>
     ${renderParty()}`;
}

function renderChal() {
  $('colors').innerHTML = COLS.map((col, i) => {
    const ok = colUnlocked(i);
    return `<button class="sw ${SET.col === i ? 'on' : ''} ${ok ? '' : 'locked'}" data-c="${i}" title="${col.n}" style="background:${col.c[0]}">${ok ? '' : '🔒'}</button>`;
  }).join('');
  $('colName').textContent = COLS[SET.col || 0].n;
  document.querySelectorAll('#colors .sw').forEach(b => b.onclick = () => {
    const i = +b.dataset.c;
    if (!colUnlocked(i)) { $('colName').textContent = COLS[i].n + ' – odemkneš splněním výzvy'; return; }
    SET.col = i; saveSet(); renderChal(); sfx('click');
  });
  $('chalCount').textContent = `${Object.keys(CHS).length} / ${CHAL.length}`;
  $('chalList').innerHTML = CHAL.map((ch, k) => `
    <div class="ch ${CHS[k] ? 'got' : ''}">
      <span class="sw small" style="background:${COLS[ch.col].c[0]}"></span>
      <div class="ch-txt"><b>${CHS[k] ? '✔ ' : ''}${ch.n}</b><small>${ch.d}</small></div>
      <button data-k="${k}">${CHS[k] ? 'Znovu' : 'Hrát'}</button>
    </div>`).join('');
  document.querySelectorAll('#chalList button').forEach(b => b.onclick = () => {
    $('chalPanel').classList.add('hidden'); cleanupNet(); startGame('solo', +b.dataset.k);
  });
}

document.querySelectorAll('.seg button[data-d]').forEach(b => b.onclick = () => {
  if (+b.dataset.d === 4 && !CAMPS[CAMP_CH[0].b - 1]) { toasts.push({ a: { n: 'Nejdřív dohraj celou kampaň' }, h: '🔒 ŠÍLENÁ OBTÍŽNOST', l: 3 }); return; }
  SET.diff = +b.dataset.d; saveSet(); sfx('click');
});
document.querySelectorAll('#netMode button').forEach(b => b.onclick = () => { SET.net = b.dataset.m; saveSet(); sfx('click'); });
$('bMusic').onclick = () => { SET.music = !SET.music; saveSet(); };
$('bSfx').onclick = () => { SET.sfx = !SET.sfx; saveSet(); sfx('click'); };
$('bBrutal').onclick = () => {
  if (!SET.brutal && !confirm('⚠ BRUTÁLNÍ REŽIM\n\nZobrazuje hodně krve, useknuté hlavy a končetiny. Není vhodný pro děti ani citlivé povahy.\nHratelnost se nijak nemění, jde jen o vzhled.\n\nOpravdu zapnout?')) return;
  SET.brutal = !SET.brutal; saveSet(); sfx('click');
};
$('bVib').onclick = () => { SET.vib = !SET.vib; saveSet(); vib(60); };
$('bAch').onclick = () => { renderAchList(); openPanel('achPanel'); };
$('bStats').onclick = () => { renderStats(); openPanel('statPanel'); };
$('bChal').onclick = () => { renderChal(); openPanel('chalPanel'); };
refreshMenu();
