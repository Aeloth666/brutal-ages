// =====================================================================
//  KAMPAŇ – příběh přes věky, dobývání území na mapě
// =====================================================================
const AGE_GOLD = [START_GOLD, 600, 2500, 9000, 30000];     // startovní zlato mise v daném věku
// ic = ikona území, wx = počasí mise, par = čas na 3. hvězdu (s), mods = pravidla (viz výzvy)
const CAMP = [
  { n: 'Údolí řeky', ic: '🏞️', diff: 0, wx: 'clear', par: 540, mods: {},
    t: 'Tvůj kmen přežil dlouhou zimu v jeskyních. Na jaře sestupuje do Údolí řeky, kde je ryb a zvěře dost pro všechny. Jenže na druhém břehu táboří Rudá horda – a dělit se nehodlá. Vyžeň je!' },
  { n: 'Mamutí pláně', ic: '🦣', diff: 1, wx: 'snow', par: 660, mods: { eGold: 250 },
    t: 'Za řekou se táhnou zamrzlé pláně plné mamutů. Kdo ovládne stáda, nebude mít hlad. Rudá horda tu má zimní tábor a víc zásob než ty.' },
  { n: 'Ohnivá hora', ic: '🌋', diff: 2, wx: 'storm', mods: { survive: 300, boss: 0 },
    t: 'Horda se stáhla k sopce a svolala všechny klany. Jejich šaman tvrdí, že hora stojí na jejich straně. Vydrž jejich zuřivý útok 5 minut, než jim dojdou síly.' },
  { n: 'Brod u mlýna', ic: '🌾', diff: 1, wx: 'fog', par: 720, mods: { age: 1 },
    t: 'Uběhla staletí. Z tvého kmene vyrostlo království, z Rudé hordy Rudé vévodství. U brodu u mlýna se v ranní mlze poprvé srazí rytíři.' },
  { n: 'Hrad na skále', ic: '🏰', diff: 1, wx: 'cloudy', par: 900, mods: { age: 1, eHp: 1.8 },
    t: 'Vévoda se zabarikádoval na skalním hradě. Jeho hradby jsou skoro dvakrát silnější než tvoje. Bez pořádného obléhání to nepůjde.' },
  { n: 'Krvavá pláň', ic: '⚔️', diff: 2, wx: 'rain', par: 540, mods: { age: 1, limit: 720, boss: 1 },
    t: 'Vévoda poslal posly pro posily z východu. Musíš ho porazit dřív, než dorazí – máš 12 minut.' },
  { n: 'Přístav', ic: '⚓', diff: 1, wx: 'clear', par: 720, mods: { age: 2 },
    t: 'Doba objevů. Z vévodství se stala Rudá říše s loďstvem a mušketami. Obsaď přístav, odkud vyplouvají jejich lodě.' },
  { n: 'Dělostřelecké návrší', ic: '💣', diff: 2, wx: 'cloudy', par: 840, mods: { age: 2, eGold: 4000 },
    t: 'Na návrší říše nashromáždila děla a sudy prachu. Začínají s plnou pokladnicí – ty jen s tím, co uneseš.' },
  { n: 'Noční přepadení', ic: '🌙', diff: 2, wx: 'night', par: 840, mods: { age: 2, noTower: 1, boss: 2 },
    t: 'Pod rouškou noci se proplížíš k jejich táboru. Opevnění se potmě stavět nedá – rozhodne jen tvá armáda.' },
  { n: 'Továrny', ic: '🏭', diff: 1, wx: 'rain', par: 780, mods: { age: 3 },
    t: 'Komíny, železnice, tanky. Z říše je Rudá republika a její továrny chrlí zbraně dnem i nocí. Zastav výrobu.' },
  { n: 'Zákopy', ic: '🪖', diff: 2, wx: 'fog', mods: { age: 3, survive: 420 },
    t: 'Válka uvízla v zákopech. Nepřítel chystá velkou ofenzívu. Udrž linii 7 minut za každou cenu.' },
  { n: 'Hlavní město', ic: '🏛️', diff: 2, wx: 'snow', par: 900, mods: { age: 3, eHp: 1.5, boss: 3 },
    t: 'Poslední bašta republiky. V zimě a sněhu dobudeš jejich hlavní město.' },
  { n: 'Kosmodrom', ic: '🛰️', diff: 2, wx: 'night', par: 840, mods: { age: 4 },
    t: 'Budoucnost. Zbytky Rudé republiky utekly na oběžnou dráhu a odtud řídí armády robotů. Obsaď jejich pozemní kosmodrom.' },
  { n: 'Robotí továrna', ic: '🤖', diff: 2, wx: 'storm', par: 720, mods: { age: 4, eHp: 2, limit: 900 },
    t: 'Umělá inteligence republiky staví stroje rychleji, než je stíháš ničit. Znič továrnu do 15 minut, jinak bude pozdě.' },
  { n: 'Poslední bitva', ic: '👑', diff: 3, wx: 'storm', par: 1080, mods: { age: 4, boss: 4 },
    t: 'Vše se rozhodne teď. Horda, vévodství, říše, republika i stroje – celá jejich historie proti té tvé. Vyhraj a svět bude tvůj.',
    end: 'Rudá horda je minulostí. Tvůj kmen prošel celou historií – od jeskyně až ke hvězdám. Svět patří tobě! 🏆' },
  // ---- 2. kapitola: Návrat hordy – každá mise těžší než ta předchozí ----
  { n: 'Trhlina v čase', ic: '⏳', diff: 3, wx: 'fog', par: 780, mods: { eHp: 1.4, eGold: 150 },
    t: 'Myslel sis, že je konec? Šaman Rudé hordy otevřel trhlinu v čase a jeho válečníci se vrací na úsvit dějin – silnější a zuřivější než kdy dřív. Zavři trhlinu, dokud je malá!' },
  { n: 'Zamrzlé jezero', ic: '🧊', diff: 3, wx: 'snow', mods: { survive: 480, boss: 0, gm: 0.8 },
    t: 'Horda tě zatlačila na zamrzlé jezero. Led praská, kořisti je málo a z vánice se vynořuje šavlozubý tygr. Vydrž 8 minut, než přijdou posily.' },
  { n: 'Templářská pevnost', ic: '🛡️', diff: 3, wx: 'rain', par: 1020, mods: { age: 1, eHp: 2.6, eGold: 2500, gm: 0.9 },
    t: 'Rudí rytíři obsadili pevnost s hradbami dvaapůlkrát silnějšími než tvoje a plnými sklepy. Obléhání bude dlouhé a krvavé.' },
  { n: 'Morová vesnice', ic: '☠️', diff: 3, wx: 'fog', par: 960, mods: { age: 1, gm: 0.75, limit: 1260, boss: 1 },
    t: 'V kraji řádí mor. Padlým nepřátelům není co vzít, takže za zabití dostaneš méně zlata – a nad údolím už krouží drak. Musíš to skončit do 21 minut.' },
  { n: 'Pirátská zátoka', ic: '🏴‍☠️', diff: 3, wx: 'storm', par: 960, mods: { age: 2, noTower: 1, eGold: 12000, gm: 0.85, boss: 2 },
    t: 'Rudí piráti ukrývají v zátoce poklad celé říše. V bouři na útesech věže nepostavíš – zvládne to jen tvá armáda.' },
  { n: 'Obležené město', ic: '🏚️', diff: 4, wx: 'snow', mods: { age: 3, survive: 660, eGold: 25000, gm: 0.8, boss: 3 },
    t: 'Město je obklíčené, zima krutá a nepřítel má zásob na rok. Udrž ho 11 minut, než dorazí pomoc.' },
  { n: 'Železná opona', ic: '🚂', diff: 3, wx: 'night', par: 1020, mods: { age: 3, eHp: 2.2, noEvo: 1, limit: 1380 },
    t: 'Horda spustila železnou oponu – technologie se tu dál nevyvíjí, ani u tebe, ani u nich. Jejich opevnění musíš prorazit do 23 minut jen se současnou technikou.' },
  { n: 'Měsíční základna', ic: '🌑', diff: 3, wx: 'night', par: 1080, mods: { age: 4, eHp: 2.6, gm: 0.75, boss: 4 },
    t: 'Na Měsíci horda staví nový stroj času. Kořisti je málo, hradby silné a stráží je Titán.' },
  { n: 'Vzpoura strojů', ic: '⚙️', diff: 4, wx: 'storm', mods: { age: 4, survive: 900, eGold: 100000, gm: 0.7, boss: 4 },
    t: 'Všechny stroje světa se obrátily proti tobě. Šílená umělá inteligence hordy útočí ze všech sil a kořisti je málo. Vydrž 15 minut.' },
  { n: 'Konec času', ic: '♾️', diff: 4, wx: 'storm', par: 1320, mods: { age: 4, eHp: 2.6, eGold: 90000, gm: 0.85, boss: 4 },
    t: 'Šaman hordy sedí ve stroji času na samém konci dějin. Má nekonečné armády, plnou pokladnici a hradby jako hora. Tohle je opravdu poslední bitva.',
    end: 'Stroj času je rozbitý a trhlina zavřená. Rudá horda už se nikdy nevrátí – ani do minulosti, ani do budoucnosti. Jsi skutečný pán času! ⏳🏆' },
  // ---- 3. kapitola: Říše stínů – každá mise má vlastní omezení, obtížnost dál roste ----
  { n: 'Ztracené údolí', ic: '🌫️', diff: 4, wx: 'fog', par: 600, mods: { only: 0, noEvo: 1, eHp: 2, eGold: 600 },
    t: 'Ze střepů stroje času se zrodila Stínová horda. Jejich první zvědové se plíží mlhou údolím, kde všechno začalo. Kopí a praky ti vzala mlha – máš jen jeskyňáky s kyji a z doby kamenné se nedostaneš.' },
  { n: 'Sopečná pustina', ic: '🌋', diff: 4, wx: 'storm', mods: { survive: 480, gm: 0.8, boss: 0 },
    t: 'Stínová horda vyvolala šavlozubého tygra z ohně a lávy a žene na tebe šílené vlny. Vydrž 8 minut na úpatí sopky.' },
  { n: 'Mrazivý průsmyk', ic: '🏔️', diff: 3, wx: 'snow', par: 960, mods: { age: 1, noTower: 1, eGold: 2500, boss: 1 },
    t: 'Úzký průsmyk mezi ledovci. Na skalách nepostavíš jedinou věž a nad sněhovými poli krouží drak.' },
  { n: 'Citadela stínů', ic: '🏯', diff: 4, wx: 'rain', par: 1260, mods: { age: 1, eHp: 2.2, limit: 1500 },
    t: 'Stínová citadela má hradby jako hora a šílené velitele. Pokud ji nedobudeš do 25 minut, zavřou se brány navždy.' },
  { n: 'Bitva o průliv', ic: '⛵', diff: 4, wx: 'storm', par: 1080, mods: { age: 2, gm: 0.7, boss: 2 },
    t: 'Stínová flotila blokuje průliv. Kořisti je málo, děla jim nikdy nemlčí a na pobřeží čeká obrněný vůz.' },
  { n: 'Pouštní bouře', ic: '🏜️', diff: 4, wx: 'clear', mods: { age: 3, survive: 720, noEvo: 1, eGold: 30000, gm: 0.8 },
    t: 'Písečná bouře zasypala továrny – technika se dál nevyvine. Stínové divize útočí z duny za dunou a kořisti je málo. Vydrž 12 minut.' },
  { n: 'Spálená země', ic: '🔥', diff: 3, wx: 'cloudy', par: 900, mods: { age: 3, only: 2, noEvo: 1 },
    t: 'Ze spálené země neprojde pěšák živý. Jedinou šancí jsou tanky – nic jiného vyrábět nemůžeš a technika se dál nevyvine.' },
  { n: 'Orbitální stanice', ic: '🛰️', diff: 4, wx: 'night', par: 1260, mods: { age: 4, noTower: 1, eHp: 2.2 },
    t: 'Stanice na oběžné dráze nemá místo na věže. Stínoví mariňáci ji brání do posledního robota.' },
  { n: 'Brána světů', ic: '🌀', diff: 4, wx: 'storm', mods: { age: 4, survive: 900, gm: 0.65, eGold: 150000, boss: 4 },
    t: 'Stínová horda otevřela bránu do svého světa a valí se z ní nekonečné armády i Titán. Vydrž 15 minut, než se brána zhroutí.' },
  { n: 'Trůn stínů', ic: '👹', diff: 4, wx: 'storm', par: 1500, mods: { age: 4, eHp: 3, eGold: 120000, gm: 0.8, boss: 4, limit: 1800 },
    t: 'Vládce Stínové hordy sedí na trůnu z obsidiánu na druhé straně brány. Má hradby třikrát silnější než ty, plnou pokladnici a Titána. Máš 30 minut.',
    end: 'Trůn stínů se rozpadl na prach a brána světů se navždy zavřela. Od jeskyně až po hvězdy – a ještě dál. Jsi legenda všech dějin! 👑🏆' },
];
['meadow', 'winter', 'volcano', 'meadow', 'meadow', 'meadow', 'desert', 'desert', 'meadow', 'meadow', 'meadow', 'winter', 'desert', 'volcano', 'volcano',
 'volcano', 'winter', 'meadow', 'meadow', 'desert', 'winter', 'meadow', 'desert', 'volcano', 'volcano',
 'meadow', 'volcano', 'winter', 'meadow', 'desert', 'desert', 'volcano', 'winter', 'volcano', 'volcano']
  .forEach((f, i) => { CAMP[i].field = f; });
const CAMPS = load('aow-camp', {});               // index mise → počet hvězd
let lastStars = 0, campSel = 0, campChap = 0;
// mise je otevřená po dobytí předchozí; první mise kapitoly až po dohrání VŠECH předchozích kapitol
const campOpen = i => { if (i === 0) return true; const k = chapOf(i); if (k > 0 && CAMP_CH[k].a === i) { for (let j = 0; j < k; j++) if (!chapDone(j)) return false; return true; } return !!CAMPS[i - 1]; };
// kapitoly kampaně (a = první mise, b = za poslední); 2. kapitola se odemkne dobytím posledního území 1. kapitoly
// col = barvy mapy kapitoly: moře nahoře, moře dole, pláž, pevnina
const CAMP_CH = [{ n: 'I. Dějiny světa', a: 0, b: 15, col: ['#1e3a5f', '#0f2140', '#c9b27a', '#5f8f3e'] },
  { n: 'II. Návrat hordy', a: 15, b: 25, col: ['#3b1d5c', '#170a2b', '#a8865a', '#5b4a3a'] },
  { n: 'III. Říše stínů', a: 25, b: 35, col: ['#3a0d14', '#12040a', '#6b5a52', '#2f3036'] }];
const chapOf = i => (CAMP_CH.findIndex(c => i >= c.a && i < c.b) + 1 || 1) - 1;
const chapDone = c => { const C = CAMP_CH[c]; for (let i = C.a; i < C.b; i++) if (!CAMPS[i]) return false; return true; };
const chapStars = c => { const C = CAMP_CH[c]; let n = 0; for (let i = C.a; i < C.b; i++) n += CAMPS[i] || 0; return n; };
// hrdinská obtížnost: mise po dobytí jde zahrát ještě jednou, těžší – za výhru 👑 koruna
const CAMPH = load('aow-camph', {});
let curHero = null, heroNext = null, heroM = null;
const heroMission = i => { const m = CAMP[i], md = { ...m.mods }, a = md.age || 0;
  md.eHp = Math.round((md.eHp || 1) * 1.35 * 100) / 100; md.eGold = (md.eGold || 0) + Math.round(AGE_GOLD[a] * 0.5);
  if (md.survive) md.survive = Math.round(md.survive * 1.2 / 30) * 30;
  if (md.limit) md.limit = Math.round(md.limit * 0.9 / 30) * 30;
  return { ...m, diff: Math.min(4, m.diff + 1), mods: md, par: m.par && Math.round(m.par * 1.1) }; };
const modsOf = V => (V.chal != null ? CHAL[V.chal].mods : V.camp != null ? (curHero === V.camp && heroM ? heroM.mods : CAMP[V.camp].mods) : V.daily ? DAILY.mods : null) || {};

// hvězdy: 1 za vítězství, 2 za základnu nad polovinou, 3 za rychlost (u obrany za téměř nedotčenou základnu)
function starRules(m) {
  return ['Dobýt území', 'Základna nad 50 % zdraví', m.mods.survive ? 'Základna nad 85 % zdraví' : 'Vyhrát do ' + fmtTime(m.par)];
}
function campResult(won, V) {
  if (!won) { lastStars = 0; return; }
  const m = CAMP[V.camp], me = V.pl[mySide], hp = me.hp / me.mhp;
  lastStars = 1 + (hp >= 0.5 ? 1 : 0) + ((m.mods.survive ? hp >= 0.85 : V.time <= m.par) ? 1 : 0);
  if (curHero === V.camp) {
    const nw = !CAMPH[V.camp]; CAMPH[V.camp] = 1; store('aow-camph', CAMPH);
    if (nw) toasts.push({ a: { n: m.n }, h: '👑 HRDINSKÁ VÝHRA', l: 4 });
  }
  const first = !CAMPS[V.camp];
  if (lastStars > (CAMPS[V.camp] || 0)) { CAMPS[V.camp] = lastStars; store('aow-camp', CAMPS); }
  if (first) toasts.push({ a: { n: m.n + ' ' + '★'.repeat(lastStars) }, h: 'ÚZEMÍ DOBYTO', l: 4 });
}

// --- mapa ---
const campPos = i => { const C = CAMP_CH[chapOf(i)], j = i - C.a; return [70 + j * 860 / (C.b - C.a - 1), j % 2 ? 150 : 290]; };
function hexPts(x, y, r) {
  return Array.from({ length: 6 }, (_, k) => { const a = Math.PI / 3 * k - Math.PI / 2; return `${(x + r * Math.cos(a)).toFixed(1)},${(y + r * Math.sin(a)).toFixed(1)}`; }).join(' ');
}
function renderCampMap() {
  const me = COLS[SET.col || 0].c;
  const C = CAMP_CH[campChap], inCh = (_, i) => i >= C.a && i < C.b, lockCh = !campOpen(C.a);
  let land = '', beach = '', cells = '', path = '';
  CAMP.forEach((m, i) => {
    if (!inCh(m, i)) return;
    const [x, y] = campPos(i);
    beach += `<circle cx="${x}" cy="${y}" r="92"/>`;
    land += `<circle cx="${x}" cy="${y}" r="80"/>`;
    path += (i > C.a ? ' L' : 'M') + x + ' ' + y;
  });
  // podklad věků: popisek nad středem misí daného věku
  const ages = AGES.map((a, k) => {
    const xs = CAMP.map((m, i) => inCh(m, i) && (m.mods.age || 0) === k ? campPos(i)[0] : null).filter(v => v != null);
    return xs.length ? `<text x="${(xs[0] + xs[xs.length - 1]) / 2}" y="34" class="age">${a.name.toUpperCase()}</text>` : '';
  }).join('');
  CAMP.forEach((m, i) => {
    if (!inCh(m, i)) return;
    const [x, y] = campPos(i), st = CAMPS[i] || 0, open = campOpen(i);
    const fill = st ? me[0] : open ? '#a16207' : '#3b4556', stroke = i === campSel ? '#fde68a' : st ? me[1] : open ? '#fbbf24' : '#1e293b';
    cells += `<g class="cell ${open ? 'open' : 'locked'} ${i === campSel ? 'sel' : ''} ${open && !st ? 'next' : ''}" data-i="${i}">
      <polygon points="${hexPts(x, y, 50)}" fill="${fill}" stroke="${stroke}" stroke-width="${i === campSel ? 5 : 3}"/>
      <text x="${x}" y="${y + 4}" class="ic">${open ? m.ic : '🔒'}</text>
      ${WORLD.att === i ? `<text x="${x + 30}" y="${y - 26}" class="att">⚔</text>` : ''}
      <text x="${x}" y="${y + 36}" class="st">${st ? '★'.repeat(st) + '☆'.repeat(3 - st) : open ? (i + 1) : ''}</text>
      ${st ? `<path d="M${x + 16} ${y - 42} v-18 l14 5 l-14 5" fill="${me[2]}" stroke="#111" stroke-width="1.5"/>` : ''}
      ${CAMPH[i] ? `<text x="${x - 26}" y="${y - 30}" class="crown">👑</text>` : ''}
    </g>`;
  });
  const tabs = CAMP_CH.map((c, k) => `<button data-c="${k}" class="${k === campChap ? 'on' : ''}">${campOpen(c.a) ? '' : '🔒 '}${c.n} <small>${chapStars(k)}/${(c.b - c.a) * 3} ★</small></button>`).join('');
  $('campMap').innerHTML = `<div class="camp-tabs">${tabs}</div><svg viewBox="0 0 1000 420" preserveAspectRatio="xMidYMid meet">
    <defs><linearGradient id="sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.col[0]}"/><stop offset="1" stop-color="${C.col[1]}"/></linearGradient></defs>
    <rect width="1000" height="420" fill="url(#sea)"/>
    <g fill="${C.col[2]}">${beach}</g><g fill="${C.col[3]}">${land}</g>
    <path d="${path}" fill="none" stroke="#f5e6c4" stroke-width="4" stroke-dasharray="2 10" stroke-linecap="round" opacity=".7"/>
    ${ages}${cells}
    ${lockCh ? `<rect x="200" y="188" width="600" height="52" rx="14" fill="#0b0614" opacity=".85"/><text x="500" y="223" class="age lockmsg">🔒 Odemkne se po dohrání ${CAMP_CH.slice(0, campChap).map(c => c.n.split(' ')[0]).join(' a ')} kapitoly</text>` : ''}</svg>`;
  $('campMap').querySelectorAll('.cell.open').forEach(g => g.onclick = () => { campSel = +g.dataset.i; sfx('click'); renderCamp(); });
  $('campMap').querySelectorAll('.camp-tabs button').forEach(b => b.onclick = () => {
    campChap = +b.dataset.c; sfx('click');
    const c = CAMP_CH[campChap]; let i = c.a; while (i < c.b - 1 && CAMPS[i]) i++;
    if (campOpen(i)) campSel = i;
    renderCamp();
  });
}
function renderCamp() {
  if (!campOpen(campSel)) campSel = 0;
  renderCampMap();
  const m = CAMP[campSel], st = CAMPS[campSel] || 0, rules = starRules(m);
  const total = Object.values(CAMPS).reduce((a, b) => a + b, 0);
  const crowns = Object.keys(CAMPH).length;
  $('campCount').textContent = `${Object.keys(CAMPS).length} / ${CAMP.length} území · ${total} ★${crowns ? ` · ${crowns} 👑` : ''}`;
  const goal = m.mods.survive ? `Vydrž ${fmtTime(m.mods.survive)}` : m.mods.limit ? `Znič základnu do ${fmtTime(m.mods.limit)}` : 'Znič nepřátelskou základnu';
  const extra = [m.mods.eHp && 'nepřítel má silnější základnu', WORLD.att === campSel && '⚔ ÚZEMÍ JE POD ÚTOKEM', m.mods.eGold && 'nepřítel má víc zlata', m.mods.noTower && 'nesmíš stavět věže', m.mods.boss != null && '👹 boss: ' + BOSSES[m.mods.boss].n,
    m.mods.only != null && 'smíš vyrábět jen ' + AGES[m.mods.age || 0].units[m.mods.only].n.toLowerCase() + 'y', m.mods.noEvo && 'evoluce je zamčená', m.mods.gm && 'za zabití je méně zlata'].filter(Boolean);
  const done = m.end && st;
  $('campBrief').innerHTML = `
    <div class="cb-head"><span class="cb-ic">${m.ic}</span><div><small>Mise ${campSel + 1} · ${AGES[m.mods.age || 0].name}</small><h3>${m.n}</h3></div></div>
    <p class="cb-story">${done ? m.end : m.t}</p>
    <div class="cb-meta"><b>Cíl:</b> ${goal}${extra.length ? ' · ' + extra.join(', ') : ''}<br><b>Soupeř:</b> ${DIFF[m.diff].n} · <b>Počasí:</b> ${m.wx === 'night' ? 'Noc' : WX_KINDS[m.wx]}</div>
    <div class="cb-meta"><b>Bonus území:</b> ${TERR[campSel].t}${!st ? ' (po dobytí)' : WORLD.att === campSel ? ' – neplatí, dokud území neubráníš' : ' ✔'}</div>
    ${st ? `<div class="cb-meta"><b>🔥 Hrdinská:</b> soupeř o stupeň těžší, hradby o 35 % silnější a víc zlata${CAMPH[campSel] ? ' – 👑 splněno' : ' – za výhru 👑'}</div>` : ''}
    <ul class="cb-stars">${rules.map((r, k) => `<li class="${st > k ? 'got' : ''}">${st > k ? '★' : '☆'} ${r}</li>`).join('')}</ul>
    <div class="cb-btns">${WORLD.att === campSel ? '<button id="bCampDef" class="def">🛡 Bránit území</button>' : ''}<button id="bCampGo">${st ? 'Hrát znovu' : 'Do boje!'}</button>${st ? `<button id="bCampHero" class="hero">${CAMPH[campSel] ? '👑' : '🔥'} Hrdinská</button>` : ''}<button id="bCampCoop">🤝 S kámošem</button></div>`;
  if ($('bCampHero')) $('bCampHero').onclick = () => { $('campPanel').classList.add('hidden'); cleanupNet(); heroNext = campSel; startGame('solo', null, campSel); };
  $('bCampGo').onclick = () => { $('campPanel').classList.add('hidden'); cleanupNet(); startGame('solo', null, campSel); };
  if ($('bCampDef')) $('bCampDef').onclick = () => { $('campPanel').classList.add('hidden'); cleanupNet(); defNext = campSel; startGame('solo', null, campSel); };
  $('bCampCoop').onclick = () => { $('campPanel').classList.add('hidden'); hostGame({ coop: true, camp: campSel }); };
}
function openCamp(i) {
  if (i == null) { i = 0; while (i < CAMP.length - 1 && CAMPS[i]) i++; }
  campSel = campOpen(i) ? i : 0; campChap = chapOf(campSel);
  renderCamp(); $('campPanel').classList.remove('hidden');
}
$('bCamp').onclick = () => { sfx('click'); openCamp(); };
