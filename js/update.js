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
  { v: '2.22', d: '2026-11-05', cs: [
    'Záznam bitvy: po hře se uloží celá bitva – Hrát sám → 🎬 Poslední bitva. V záznamu jde přepínat sestřih / celá bitva, rychlost až 4× a klepnutím na časovou osu přeskakovat.',
    'Sestřih poslední bitvy pošleš příteli ve zprávách (🎬 Poslat záznam), on si ho přehraje tlačítkem ▶ Přehrát.',
    'Ligy v online soubojích: Dřevěná, Bronzová, Stříbrná, Zlatá, Diamantová a Mistrovská – podle hodnocení, s postupem a sestupem.',
    'Klanová válka: členové klanu sbírají každý týden body za bitvy, klany se řadí v žebříčku. Nové úspěchy Zlatá liga a Válečník klanu.',
    'U přátel, kteří právě hrají online, je tlačítko 👁 Sledovat – připojíš se jako divák bez kódu.'], en: [
    'Battle recording: after a game the whole battle is saved – Play solo → 🎬 Last battle. You can switch between highlights / full battle, speed up to 4× and tap the timeline to jump.',
    'Send the highlights of your last battle to a friend in messages (🎬 Send recording); they watch it with ▶ Play.',
    'Leagues in online duels: Wooden, Bronze, Silver, Gold, Diamond and Master – based on rating, with promotion and relegation.',
    'Clan war: clan members collect points for battles every week and clans are ranked on the leaderboard. New achievements Gold league and Clan warrior.',
    'Friends who are playing online have a 👁 Watch button – you join as a spectator without a code.'] },
  { v: '2.21', d: '2026-11-05', cs: [
    'Schopnosti armády: dole v zemi jsou 4 tlačítka (A S D F) – ⚔️ Do útoku!, 🛡️ Štíty!, 💨 Vpřed! a ❤️ Lazaret. Na pár sekund posílí celou armádu, pak se minutu nabíjí. Počítač je používá taky.',
    'Hrdinská obtížnost: každou dobytou misi kampaně můžeš zahrát znovu těžší – za výhru dostaneš 👑 korunu. Nové úspěchy Hrdina kampaně a Legenda.',
    'Nekonečné přežití: po každém bossovi si vybereš jeden ze tří bonusů (zlato, útok, zdraví, věže, hradby…).',
    'Bossové mají speciální útoky: tygr řve a omračuje, drak spálí věže, obrněný vůz pálí salvy, tank volá nálet a Titán vypouští drony.',
    'Zrychlení hry proti počítači teď přepíná 1× / 2× / 3×.',
    'Nový nástroj na test balance (tools/balance.js) – boti přehrají kampaň a přežití.'], en: [
    'Army abilities: 4 buttons set into the ground (A S D F) – ⚔️ Charge!, 🛡️ Shields!, 💨 Forward! and ❤️ Field hospital. They boost your whole army for a few seconds, then recharge for about a minute. The computer uses them too.',
    'Heroic difficulty: every conquered campaign mission can be replayed harder – a win gives you a 👑 crown. New achievements Campaign hero and Legend.',
    'Endless survival: after every boss you pick one of three bonuses (gold, attack, health, towers, walls…).',
    'Bosses have special attacks: the tiger roars and stuns, the dragon burns towers, the armoured car fires volleys, the tank calls an airstrike and the Titan launches drones.',
    'Game speed against the computer now cycles 1× / 2× / 3×.',
    'New balance testing tool (tools/balance.js) – bots play through the campaign and survival.'] },
  { v: '2.20', d: '2026-11-05', cs: [
    'Nekonečné přežití je těžší: od 21. vlny nepřátelé sílí každou vlnou rychleji (víc zdraví, silnější útok, supervojáci) a vlny se rychleji vypouštějí.',
    'Boss přijde hned po ohlášení vlny, ne až na jejím konci. Od 25. vlny chodí boss každou pátou vlnu, později i víc bossů najednou.'], en: [
    'Endless survival is harder: from wave 21 enemies get stronger faster each wave (more health, stronger attacks, super soldiers) and waves are released faster.',
    'The boss arrives right after the wave is announced, not at its end. From wave 25 a boss comes every fifth wave, later several at once.'] },
  { v: '2.19', d: '2026-11-05', cs: [
    'Kampaň má 2. kapitolu – Návrat hordy: 10 nových map (mise 16–25) napříč všemi věky. Každá mise je těžší než ta předchozí, poslední je opravdu tvrdý oříšek.',
    'Mapa kampaně má záložky kapitol; 2. kapitola se odemkne dobytím 15. území. Nová území dávají větší bonusy.',
    'Nové úspěchy Pán času (dokonči 2. kapitolu) a Mistr času (všech 75 hvězd).'], en: [
    'The campaign has chapter 2 – Return of the horde: 10 new maps (missions 16–25) across all ages. Each mission is harder than the one before, the last one is a really tough nut.',
    'The campaign map has chapter tabs; chapter 2 unlocks by conquering territory 15. The new territories give bigger bonuses.',
    'New achievements Lord of time (finish chapter 2) and Master of time (all 75 stars).'] },
  { v: '2.18.1', d: '2026-11-05', cs: ['Wiki o hře je i v angličtině (aeloth666.github.io/brutal-ages/wiki/en/), doplněné anglické texty ve hře.'], en: ['The game wiki is now in English too (aeloth666.github.io/brutal-ages/wiki/en/), missing English texts in the game added.'] },
  { v: '2.18', d: '2026-11-03', cs: [
    'Mamutí jezdec je silnější: o 30 % víc zdraví a o 15 % silnější úder (pomalý, ale nezastavitelný).',
    'V menu pauzy je tlačítko ↻ Začít znovu – kolo (třeba misi v kampani) jde rozehrát od začátku.',
    'Když je dostupná evoluce, tlačítko Evoluce pulzuje zlatou září. Stisknuté tlačítko (nákup jednotky apod.) krátce blikne.',
    'Webová verze: nová verze hry už nevyhodí z rozehrané bitvy – načte se až po návratu do menu.',
    'Zprávy mezi přáteli mají ochranu proti zahlcení (nejvýš jedna zpráva za 2 sekundy).'], en: [
    'The Mammoth rider is stronger: 30 % more health and a 15 % stronger hit (slow but unstoppable).',
    'The pause menu has a ↻ Restart button – a round (e.g. a campaign mission) can be played again from the start.',
    'When evolution is available, the Evolve button pulses with a golden glow. A pressed button (buying a unit etc.) briefly flashes.',
    'Web version: a new game version no longer kicks you out of a running battle – it loads after returning to the menu.',
    'Messages between friends are protected against flooding (at most one message every 2 seconds).'] },
  { v: '2.17.2', d: '2026-11-03', cs: ['Obrázky jednotek v tlačítkách a ve frontě se vždy vejdou celé (i mamut nebo kůň s jezdcem).', 'Stromy v pozadí stojí na kopcích, už nevisí ve vzduchu.'], en: ['Unit pictures in the buttons and in the queue always fit completely (even a mammoth or a horse with a rider).', 'Trees in the background stand on the hills instead of floating in the air.'] },
  { v: '2.17', d: '2026-11-03', cs: ['Nastavení → Grafika → 📈 Ukazatel FPS: malé počítadlo snímků za sekundu v levém dolním rohu (v menu i ve hře). Zelená = plynulé, žlutá = občas trhá, červená = nestíhá.'], en: ['Settings → Graphics → 📈 FPS counter: a small frames-per-second counter in the bottom left corner (in the menu and in the game). Green = smooth, yellow = occasional stutter, red = struggling.'] },
  { v: '2.16.1', d: '2026-11-03', cs: ['Opravena chyba při spuštění z verze 2.16 (chyběl ukazatel zdraví bosse).'], en: ['Fixed a startup error from version 2.16 (the boss health bar was missing).'] },
  { v: '2.16', d: '2026-11-03', cs: [
    'Méně vybíjí baterii: hra kreslí nejvýš 60 snímků za sekundu (dřív až 120–144 podle displeje), v menu 30 a s otevřenou nabídkou 15.',
    'Nová volba Nastavení → Grafika → 🔋 Úspora baterie: v bitvě 30 snímků za sekundu a nižší rozlišení.'], en: [
    'Uses less battery: the game draws at most 60 frames per second (up to 120–144 before, depending on the display), 30 in the menu and 15 with a panel open.',
    'New option Settings → Graphics → 🔋 Battery saver: 30 frames per second in battle and a lower resolution.'] },
  { v: '2.15', d: '2026-11-03', cs: [
    'Tajemství se hledá jinak – zkus se pořádně dívat na zem, když teče hodně krve. 🩸',
    'Krev stříkající na displej zmizí rychleji (4 s místo 7 s) a už neproblikává, když tam není.'], en: [
    'The secret is found differently now – look closely at the ground when a lot of blood is spilled. 🩸',
    'Blood splattering on the screen disappears faster (4 s instead of 7 s) and no longer flickers when it is not there.'] },
  { v: '2.14', d: '2026-11-03', cs: [
    'Nové tlačítko ℹ ve hře: karty všech jednotek tvého národa a věku – cena, výcvik, útok, rychlost útoku, zdraví, rychlost, dosah a schopnost (včetně bonusů národa a vylepšení).',
    'Zprávy mezi přáteli: u přítele tlačítko 💬 s konverzací. Nová zpráva přijde jako oznámení a odznak ve Velitelství; konverzace se ukládá v telefonu.'], en: [
    'New ℹ button in the game: cards of all units of your nation and age – cost, training, attack, attack speed, health, speed, range and ability (including nation bonuses and upgrades).',
    'Messages between friends: a 💬 button with the conversation next to each friend. A new message arrives as a notification and a badge in Headquarters; the conversation is stored on the phone.'] },
  { v: '2.13', d: '2026-11-03', cs: [
    'Pozvánky do klanu: v klanu je tlačítko 📨 Pozvat do klanu s výběrem z přátel a nedávných soupeřů. Pozvánka dorazí i hráči, který zrovna nehraje – uvidí ji v Klanu a v Přátelích.',
    'Žádosti o přátelství a pozvánky do klanu pro hráče, kteří ještě nemají novou verzi, se zapamatují a odešlou samy, jakmile si ji spustí (do 30 dní).'], en: [
    'Clan invitations: the clan has a 📨 Invite to clan button with a choice of friends and recent opponents. The invitation reaches players who are not playing right now – they see it in Clan and Friends.',
    'Friend requests and clan invitations for players without the new version are remembered and sent automatically once they start it (within 30 days).'] },
  { v: '2.12', d: '2026-11-03', cs: [
    'Přezdívky jsou jedinečné: v Profilu se jméno ukládá tlačítkem a obsazené jméno (bez ohledu na velká písmena a diakritiku) hra odmítne. Výchozí „Hráč“ je volné pro všechny.',
    'Kdo už jméno používá, zabere si ho po spuštění nové verze; kdo ho mezitím ztratil, dostane upozornění.',
    'Nedávní soupeři v „Hrát s kámoši“ mají tlačítko ➕ Přítel pro žádost o přátelství.'], en: [
    'Nicknames are unique: the name is saved with a button in the Profile and a taken name (regardless of case and accents) is refused. The default “Hráč” is free for everyone.',
    'Players keep the name they already use once they start the new version; whoever lost it gets a notice.',
    'Recent opponents in “Play with friends” have a ➕ Friend button to send a friend request.'] },
  { v: '2.11', d: '2026-11-03', cs: [
    'Přátelé (Velitelství → 👥 Přátelé): každý hráč má své ID (BA-…), kámoše najdeš podle jména nebo ID a pošleš mu žádost o přátelství.',
    'Porovnání statistik s přítelem: úroveň, hry, zabití, výhry proti počítači, online bilance, nejrychlejší výhra, hvězdy v kampani, úspěchy, přežití a vzájemné souboje – lepší hodnota svítí zeleně.',
    'Přátelé jsou i v „Hrát s kámoši“ nad nedávnými soupeři, vidíš, kdo je online, a můžeš ho rovnou pozvat. Nové žádosti ukáže odznak ve Velitelství.',
    'Nový úspěch: Nejsi sám.'], en: [
    'Friends (Headquarters → 👥 Friends): every player has an ID (BA-…), find friends by name or ID and send them a friend request.',
    'Compare stats with a friend: level, games, kills, wins vs computer, online record, fastest win, campaign stars, achievements, survival and head-to-head – the better value glows green.',
    'Friends also appear in “Play with friends” above recent opponents, you see who is online and can invite them right away. New requests show a badge in Headquarters.',
    'New achievement: Not alone.'] },
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
