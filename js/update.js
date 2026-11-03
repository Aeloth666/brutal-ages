// =====================================================================
//  AKTUALIZACE (jen v aplikaci) – nová verze hry se stáhne z webu do telefonu a hra pak běží z ní,
//  i offline. Na nové APK (změny v nativní části) hra jen upozorní – instalaci musí potvrdit hráč.
//  Po instalaci nového APK se aplikace sama vrátí k verzi zabalené v APK (Capacitor to hlídá).
// =====================================================================
const UPD_URL = 'https://aeloth666.github.io/brutal-ages/';
let updReady = null, apkVer = '', updBusy = false;
// diagnostika: poslední kontrola aktualizace (ukazuje se v Nastavení hry)
const UPD = load('aow-upd', {});
function updLog(step, err) { UPD.t = Date.now(); UPD.step = step; UPD.err = err ? String(err).slice(0, 160) : ''; store('aow-upd', UPD); verInfo(); }
function verInfo() {
  const el = $('verInfo'); if (!el) return;
  const when = UPD.t ? new Date(UPD.t).toLocaleString('cs') : 'zatím ne';
  el.innerHTML = `Verze hry <b>${typeof GAME_VER !== 'undefined' ? GAME_VER : '?'}</b> (sestavení ${BUILD})${apkVer ? ' · aplikace ' + esc(apkVer) : ''}` +
    (nativeApp ? `<br>Aktualizace – poslední kontrola: ${when}${UPD.step ? ' · ' + esc(UPD.step) : ''}${UPD.err ? ' · <span style="color:#fca5a5">' + esc(UPD.err) + '</span>' : ''}` : '');
}

// jen jedna kontrola naráz – dvě souběžná stahování do stejné složky si ji navzájem mazala a hra pak nenašla index.html
async function updInit(manual) {
  if (updBusy) return; updBusy = true;
  try { await updRun(manual); } finally { updBusy = false; }
}
async function updRun(manual) {
  if (!nativeApp || !window.Capacitor || !Capacitor.Plugins) return;
  const P = Capacitor.Plugins, FS = P.Filesystem, WV = P.WebView;
  if (!FS || !WV) { updLog('chybí doplněk', !FS ? 'Filesystem' : 'WebView'); return; }
  try { apkVer = (await P.App.getInfo()).version; } catch (e) {}
  // právě běžíme ze stažené verze → zapamatovat ji pro další spuštění a smazat starší
  try {
    const { path } = await WV.getServerBasePath();
    if (path && path.includes('/live/')) {
      await WV.persistServerBasePath();
      achId('update');
      const cur = path.replace(/\/+$/, '').split('/live/')[1];          // Capacitor vrací cestu s lomítkem na konci
      const { files } = await FS.readdir({ path: 'live', directory: 'DATA' }).catch(() => ({ files: [] }));
      for (const f of files) { const n = f.name || f; if (n !== cur) FS.rmdir({ path: 'live/' + n, directory: 'DATA', recursive: true }).catch(() => {}); }
    }
  } catch (e) {}
  if (UPD_URL.includes('GITHUB_USER')) return;
  let v;
  try { v = await (await fetch(UPD_URL + 'version.json?t=' + Date.now(), { cache: 'no-store' })).json(); } catch (e) { updLog('web nedostupný', e && e.message); return; }
  // nové APK?
  let apk = 0;
  try { apk = +(await P.App.getInfo()).build || 0; } catch (e) {}
  if (v.apk && apk && v.apk > apk) apkBanner(v);
  // nová verze hry (jen pokud ji tohle APK zvládne)
  if (!(+v.build > BUILD)) { updLog('máš nejnovější verzi'); return; }
  if ((v.minApk && apk && apk < v.minApk) || !Array.isArray(v.files)) { updLog('verze ' + v.name + ' potřebuje nové APK'); return; }
  updLog('stahuji verzi ' + v.name);
  const dir = 'live/' + v.build;
  const done = await FS.stat({ path: dir + '/ok', directory: 'DATA' }).then(() => true, () => false);
  if (!done) {
    try {
      for (const f of v.files) {
        const r = await fetch(UPD_URL + f + '?v=' + v.build, { cache: 'no-store' });
        if (!r.ok) throw new Error(f);
        const bin = /\.(png|jpe?g|webp|ico|woff2?)$/i.test(f);
        const data = bin ? await b64(await r.blob()) : await r.text();
        await FS.writeFile({ path: dir + '/' + f, data, directory: 'DATA', recursive: true, ...(bin ? {} : { encoding: 'utf8' }) });
      }
      await FS.writeFile({ path: dir + '/ok', data: String(v.build), directory: 'DATA', encoding: 'utf8' });
    } catch (e) { updLog('stahování selhalo', e && e.message); FS.rmdir({ path: dir, directory: 'DATA', recursive: true }).catch(() => {}); return; }
  }
  // přepnout jen na úplnou verzi: chybí-li index.html, složku smazat a stáhnout příště znovu
  if (!(await FS.stat({ path: dir + '/index.html', directory: 'DATA' }).then(() => true, () => false))) {
    updLog('stažená verze je neúplná'); FS.rmdir({ path: dir, directory: 'DATA', recursive: true }).catch(() => {}); return;
  }
  const { uri } = await FS.getUri({ path: dir, directory: 'DATA' });
  updReady = { path: decodeURIComponent(uri.replace(/^file:\/\//, '')), name: v.name || '' };
  // hned po spuštění v menu rovnou přepnout, jinak nabídnout restart (rozehranou hru nepřerušujeme)
  updLog('verze ' + v.name + ' připravena');
  if (manual || (!role && performance.now() < 20000)) updApply(); else updBanner();
}
function updApply() {
  if (!updReady) return;
  try { saveGame(); } catch (e) {}
  toasts.push({ a: { n: 'Verze ' + updReady.name }, h: '⬇ AKTUALIZACE', l: 3 });
  Capacitor.Plugins.WebView.setServerBasePath({ path: updReady.path });   // načte stránku znovu z nové verze
}
const b64 = blob => new Promise((ok, err) => { const r = new FileReader(); r.onload = () => ok(String(r.result).split(',')[1]); r.onerror = err; r.readAsDataURL(blob); });

function updBanner() {
  const b = $('updBar');
  b.innerHTML = `⬇ Nová verze hry ${esc(updReady.name)} je připravená <button id="bUpdGo">Restartovat</button>`;
  b.classList.remove('hidden');
  $('bUpdGo').onclick = () => { if (role) toMenu(); updApply(); };
}
function apkBanner(v) {
  const b = $('apkBar');
  b.innerHTML = `📲 Nová verze aplikace ${esc(v.apkName || '')} <button id="bApkGo">Stáhnout</button>`;
  b.classList.remove('hidden');
  $('bApkGo').onclick = () => { location.href = v.apkUrl || UPD_URL + 'BrutalAges.apk'; };   // otevře se v prohlížeči
}
setTimeout(updInit, 1500);
verInfo();
if (nativeApp) { $('bUpdCheck').classList.remove('hidden'); $('bUpdCheck').onclick = () => { sfx('click'); updLog('kontroluji…'); updInit(true); }; }

// ---------- co je nového (Nastavení → O hře) – v obou jazycích, ať to překladač nemusí skládat ----------
const CHANGELOG = [
  { v: '2.10.1', d: '2026-11-03', cs: ['Opraveno: ve Statistikách bitvy graf vyskočil přes celou obrazovku, zakryl tlačítko Zpět a z obrazovky nešlo odejít.'], en: ['Fixed: in Battle statistics the chart jumped over the whole screen, covered the Back button and the screen could not be closed.'] },
  { v: '2.10', d: '2026-11-03', cs: [
    'Hra v týmu: kdo zabije, dostane celou odměnu a spoluhráč k tomu podíl podle obtížnosti (Lehká 35 %, Normální 25 %, Těžká 20 %, Nemožná 15 %, Šílená 10 %; 2 na 2 25 %).',
    'Hra v týmu: fronta stavby má 9 míst (jinde zůstává 5).',
    'Čekárna 2 na 2: každý si může vybrat tým (tlačítko ⇄) a hra jde spustit i ve třech – menší tým pak může doplnit počítač jako spoluhráč.',
    'Opraveno: tlačítko „Spustit hru“ v čekárně se překrývalo se seznamem nedávných soupeřů.',
    'Mamutí lovec (Lovci mamutů) oslaben: stojí 60 zlata, má 140 zdraví, nájezd je dvojnásobný místo trojnásobného a výcvik trvá déle.'], en: [
    'Team play: whoever kills gets the full reward and the teammate also gets a share based on difficulty (Easy 35 %, Normal 25 %, Hard 20 %, Impossible 15 %, Insane 10 %; 2 vs 2 25 %).',
    'Team play: the build queue has 9 slots (5 elsewhere).',
    '2 vs 2 lobby: everyone can pick a team (⇄ button) and the game can start with three players – the smaller team can then get the computer as a teammate.',
    'Fixed: the “Start game” button in the lobby overlapped the list of recent opponents.',
    'Mammoth Hunter (Mammoth Hunters) nerfed: costs 60 gold, has 140 health, the charge deals double instead of triple damage and training takes longer.'] },
  { v: '2.9', d: '2026-11-02', cs: [
    'Co-op a 2 na 2: každý hráč v týmu má vlastní zlato – nákup platí ten, kdo kupuje, a odměnu za zabití dostane majitel jednotky (za věže a speciální útoky napůl).',
    'Každý hráč v týmu má svůj národ: jeho jednotky se kreslí podle jeho národa i u spoluhráče a soupeřů a na začátku věku si národ volí každý sám.',
    'Základna, věže, vylepšení a evoluce zůstávají společné pro celý tým; bonusy národa strany se řídí prvním hráčem týmu.'], en: [
    'Co-op and 2 vs 2: every player in a team has their own gold – the buyer pays and the kill reward goes to the unit’s owner (split in half for towers and special attacks).',
    'Every team player has their own nation: their units are drawn in their nation’s look for the teammate and the opponents too, and everyone picks their nation at the start of each age.',
    'The base, towers, upgrades and evolution stay shared by the whole team; the side’s nation bonuses follow the team’s first player.'] },
  { v: '2.8', d: '2026-11-02', cs: [
    'Nový kůň: nohy se třemi klouby, tvarované tělo, dlouhá hlava s hřívou a uzdečkou, vlající ocas, rytíř na čabrace.',
    'Nový T-Rex v události: vodorovné tělo vyvážené ocasem, mohutná stehna, velká hlava se zuby a malé ručky – a je větší.',
    'Brutal mód: kůň se rozpadá ve správné velikosti, šavlozubý tygr se rozseká a mrtvý drak se zřítí k zemi.',
    'Zvířata mají hlasy: mamut troubí, vlk vyje, medvěd řve, pratur bučí, kůň řehtá; boss tygr a drak zařvou při příchodu.',
    'Jízdní zvířata zabírají v boji místo podle své velikosti (mamut nejvíc, vlk nejméně).'], en: [
    'New horse: three-jointed legs, shaped body, long head with mane and bridle, flowing tail, knight on a caparison.',
    'New T-Rex in the event: horizontal body balanced by the tail, massive thighs, big toothy head and tiny arms – and it is bigger.',
    'Brutal mode: the horse falls apart at the right size, the sabre-toothed tiger gets torn apart and a dead dragon crashes to the ground.',
    'Animals have voices: the mammoth trumpets, the wolf howls, the bear roars, the aurochs bellows, the horse neighs; the tiger and dragon bosses roar on arrival.',
    'Mounts take up space in battle according to their size (mammoth the most, wolf the least).'] },
  { v: '2.7.3', d: '2026-11-02', cs: ['Šavlozubý tygr: krk plynule vyrůstá z hřbetu, vnitřek otevřené tlamy už nepřesahuje ven.'], en: ['Sabre-toothed tiger: the neck grows smoothly out of the back, the inside of the open mouth no longer sticks out.'] },
  { v: '2.7.2', d: '2026-11-02', cs: ['Šavlozubý tygr: nová hlava s krátkým čenichem a bradou, ze strany je vidět jen bližší šavle, silný krk a tlapky stojí na zemi.'], en: ['Sabre-toothed tiger: new head with a short muzzle and chin, only the near sabre shows from the side, a strong neck and paws on the ground.'] },
  { v: '2.7.1', d: '2026-11-02', cs: ['Šavlozubý tygr zmenšený na zhruba 1,6 m v kohoutku – pořád větší než skutečný, ale už ne obří.'], en: ['Sabre-toothed tiger shrunk to about 1.6 m at the shoulder – still bigger than the real one, but no longer giant.'] },
  { v: '2.7', d: '2026-11-02', cs: [
    'Zvířata nakreslená znovu podle skutečných proporcí: mamut, vlk, medvěd a pratur mají nohy se třemi klouby (koleno vpředu, hlezno vzadu) a chodidla na zemi.',
    'Mamut je výrazně větší (jako skutečný), kůň je větší, medvěd má ploské tlapy a kulatou hlavu s krátkým čenichem.',
    'Nový šavlozubý tygr: mohutné tělo, krátký ocas, šavle a skok s otevřenou tlamou.',
    'Nový drak: esovitý krk, přirozená hlava s tlamou, která se otevírá na kloubu, rohy dozadu, křídla s prsty a vykrojenou blánou, nohy pod tělem.',
    'Velitelství: odznak ukazuje, kde je novinka (volné body generála, nové úkoly, nové úspěchy) a po otevření zmizí.',
    'Nastavení → O hře: tlačítko „Co je nového“.'], en: [
    'Animals redrawn with real proportions: mammoth, wolf, bear and aurochs have three-jointed legs (knee forward, hock back) and feet on the ground.',
    'The mammoth is much bigger (like the real one), the horse is bigger, the bear has flat paws and a round head with a short snout.',
    'New sabre-toothed tiger: massive body, short tail, sabres and a pounce with open jaws.',
    'New dragon: S-shaped neck, a natural head with a hinged opening jaw, swept-back horns, fingered wings with scalloped membranes, legs under the body.',
    'Headquarters: the badge shows where something is new (free general points, new quests, new achievements) and clears once opened.',
    'Settings → About: “What’s new” button.'] },
  { v: '2.6.2', d: '2026-11-02', cs: ['Prodej věží: když máš víc věží, vybereš si, kterou prodat.'], en: ['Selling towers: with several towers you choose which one to sell.'] },
  { v: '2.6.1', d: '2026-11-02', cs: ['Oprava aktualizace: dvě kontroly naráz (automatická a tlačítko) si mazaly stahovanou verzi a hra pak nenaběhla.'], en: ['Update fix: two checks at once (automatic and the button) deleted the downloaded version and the game failed to start.'] },
  { v: '2.6', d: '2026-11-02', cs: [
    'Přehlednější menu: Hrát sám, Hrát s kámoši, Velitelství a Nastavení s rozdělenými sekcemi.',
    'Doba kamenná: jezdci na mamutovi, vlkovi, medvědovi a praturovi podle národa; věž Úlomet hází vosí hnízda.',
    'Noví bossové: Šavlozubý tygr a Leonardův obrněný vůz.',
    'Poškozená základna kouří a hoří, pod jednotkami jsou vidět aury (pokřik, bubeník, léčitel).',
    'V moderní době svítí v noci baterky, text v horní liště se už nepřekrývá s tlačítky.',
    'Online funkce zkouší spojení znovu a offline napíšou srozumitelnou hlášku.'], en: [
    'Clearer menu: Play solo, Play with friends, Headquarters and Settings with separate sections.',
    'Stone age: riders on mammoth, wolf, bear and aurochs depending on the nation; the Hive Thrower tower throws wasp nests.',
    'New bosses: Sabre-toothed tiger and Leonardo’s armoured car.',
    'A damaged base smokes and burns, auras show under units (war cry, drummer, healer).',
    'Flashlights at night in the modern age, the top bar text no longer overlaps the buttons.',
    'Online features retry the connection and show a clear message when offline.'] },
];
function renderChangelog() {
  const en = typeof LANG !== 'undefined' && LANG === 'en';
  $('clBody').innerHTML = CHANGELOG.map(e => `<div class="cl-v">${en ? 'Version' : 'Verze'} ${esc(e.v)}<small>${esc(e.d)}</small></div><ul>${(en ? e.en : e.cs).map(t => `<li>${esc(t)}</li>`).join('')}</ul>`).join('');
}
$('bChangelog').onclick = () => { sfx('click'); renderChangelog(); openPanel('clPanel'); };
