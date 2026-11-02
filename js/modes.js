// =====================================================================
//  POČASÍ – podle skutečného počasí v místě hráče (jen vzhled)
// =====================================================================
// druhy: clear, cloudy, rain, storm, snow, fog; k tomu noc a síla větru
const WX_KINDS = { clear: 'Jasno', cloudy: 'Zataženo', rain: 'Déšť', storm: 'Bouřka', snow: 'Sníh', fog: 'Mlha' };
let WX = { kind: 'clear', night: false, wind: 0, amt: 0.7 };
let wxReal = load('aow-wx', { at: 0 });           // poslední zjištěné skutečné počasí
let wxMsg = '';

// kódy WMO z Open-Meteo → náš druh počasí a síla srážek
function wmo(code) {
  if (code >= 95) return ['storm', 1];
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return ['snow', code === 75 || code === 86 ? 1 : 0.6];
  if (code >= 80) return ['rain', code === 82 ? 1 : 0.7];
  if (code >= 61) return ['rain', code === 65 || code === 67 ? 1 : 0.65];
  if (code >= 51) return ['rain', 0.35];
  if (code === 45 || code === 48) return ['fog', 0.8];
  if (code === 3) return ['cloudy', 1];
  if (code === 2) return ['cloudy', 0.5];
  return ['clear', 0];
}

function wxApply() {
  const m = SET.weather || 'off';
  if (m === 'off') wxForce('off');
  else if (m === 'real') { if (wxReal.kind) wxSet({ kind: wxReal.kind, night: wxReal.night, wind: wxReal.wind, amt: wxReal.amt }); }
  else wxForce(m);
}
// pevně dané počasí (ruční volba nebo mise kampaně)
function wxForce(m) {
  wxSet(m === 'off' ? { kind: 'clear', night: false, wind: 0, amt: 0 }
    : m === 'night' ? { kind: 'clear', night: true, wind: 5, amt: 0 }
    : { kind: m, night: false, wind: m === 'storm' ? 45 : 12, amt: m === 'cloudy' ? 1 : 0.8 });
}
function wxSet(w) {
  WX = w;
  if (AU.rain) AU.rain.gain.setTargetAtTime(WX.kind === 'rain' ? 0.12 * WX.amt : WX.kind === 'storm' ? 0.2 : 0, AU.ctx.currentTime, 0.5);
}

function wxFetch(force) {
  if (SET.weather !== 'real') return;
  if (!force && Date.now() - wxReal.at < 15 * 60e3) { wxApply(); return; }
  if (!navigator.geolocation) { wxMsg = 'Telefon nepodporuje zjištění polohy.'; refreshWx(); return; }
  wxMsg = 'Zjišťuji polohu…'; refreshWx();
  navigator.geolocation.getCurrentPosition(async pos => {
    // poloha se zaokrouhlí (~1 km) a jde jen na open-meteo.com
    const la = pos.coords.latitude.toFixed(2), lo = pos.coords.longitude.toFixed(2);
    wxMsg = 'Stahuji počasí…'; refreshWx();
    try {
      const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${la}&longitude=${lo}&current=weather_code,is_day,wind_speed_10m,temperature_2m`);
      const j = (await r.json()).current;
      const [kind, amt] = wmo(j.weather_code);
      wxReal = { at: Date.now(), kind, amt, night: !j.is_day, wind: j.wind_speed_10m, temp: Math.round(j.temperature_2m) };
      store('aow-wx', wxReal);
      wxMsg = '';
    } catch (e) { wxMsg = 'Počasí se nepodařilo stáhnout (chybí internet?).'; }
    wxApply(); refreshWx();
  }, err => {
    wxMsg = err.code === 1 ? 'Přístup k poloze je zakázaný – povol ho v nastavení telefonu.' : 'Polohu se nepodařilo zjistit.';
    refreshWx();
  }, { enableHighAccuracy: false, timeout: 15000, maximumAge: 30 * 60e3 });
}
setInterval(() => wxFetch(false), 5 * 60e3);

// --- vykreslení ---
const RAIN = Array.from({ length: 260 }, () => ({ x: Math.random() * (W + 300) - 150, y: Math.random() * H, v: rnd(0.8, 1.2) }));
const SNOW = Array.from({ length: 170 }, () => ({ x: Math.random() * W, y: Math.random() * H, r: rnd(1.2, 3.2), p: Math.random() * 6 }));
const STARS = Array.from({ length: 70 }, () => ({ x: Math.random() * W, y: Math.random() * 300, r: rnd(0.6, 1.6), p: Math.random() * 6 }));
let flash = 0, boltT = 4, bolt = null;

// za jednotkami: zabarvení oblohy, mraky, hvězdy, sníh na zemi
function wxBack(dt) {
  const k = WX.kind;
  if (WX.night) {
    c.fillStyle = 'rgba(8,14,42,.58)'; c.fillRect(0, 0, W, H);
    if (k === 'clear') {
      for (const s of STARS) { c.globalAlpha = 0.5 + Math.sin(T * 2 + s.p) * 0.35; c.fillStyle = '#fff'; circ(s.x, s.y, s.r); }
      c.globalAlpha = 1;
      c.fillStyle = 'rgba(255,250,220,.18)'; circ(980, 200, 46);
      c.fillStyle = '#f5f1dc'; circ(980, 200, 26); c.fillStyle = 'rgba(8,14,42,.35)'; circ(990, 194, 22);
    }
  }
  if (k === 'fog') {
    // mlha schová hory i slunce, dál od bojiště hustší
    const g = c.createLinearGradient(0, 0, 0, GY);
    g.addColorStop(0, `rgba(205,212,222,${0.55 * WX.amt})`); g.addColorStop(0.75, `rgba(215,221,230,${0.75 * WX.amt})`); g.addColorStop(1, `rgba(215,221,230,${0.35 * WX.amt})`);
    c.fillStyle = g; c.fillRect(0, 0, W, GY + 10);
  }
  const dark = k === 'storm' ? 0.5 : k === 'rain' ? 0.36 : k === 'cloudy' ? 0.24 * WX.amt : k === 'snow' ? 0.18 : 0;
  if (dark) {
    c.fillStyle = `rgba(52,62,78,${dark})`; c.fillRect(0, 0, W, H);
    // nízká oblačnost
    c.fillStyle = k === 'snow' ? 'rgba(210,218,230,.55)' : `rgba(${k === 'storm' ? '58,64,78' : '110,118,132'},.75)`;
    for (let i = 0; i < 9; i++) {
      const x = ((i * 170 + T * (6 + WX.wind * 0.6)) % (W + 300)) - 150;
      ell(x, 70 + (i % 3) * 22, 120, 34); ell(x + 70, 92 + (i % 2) * 16, 90, 26);
    }
  }
  if (k === 'snow') {
    // zimní krajina: zasněžené kopce a tráva
    const g = c.createLinearGradient(0, 260, 0, GY);
    g.addColorStop(0, 'rgba(236,242,250,.15)'); g.addColorStop(0.45, 'rgba(240,245,252,.55)'); g.addColorStop(1, 'rgba(245,248,255,.7)');
    c.fillStyle = g; c.fillRect(0, 260, W, GY - 260);
    c.fillStyle = 'rgba(245,248,255,.85)';
    c.beginPath(); c.moveTo(0, GY + 6);
    for (let x = 0; x <= W; x += 16) c.lineTo(x, GY - 3 + Math.sin(x * 0.05) * 2.5);
    c.lineTo(W, GY + 6); c.fill();
  }
}

// před jednotkami: srážky, mlha, blesky
function wxFront(dt) {
  const k = WX.kind, slant = Math.min(0.7, WX.wind / 55) * (mirror ? -1 : 1);
  if (k === 'rain' || k === 'storm') {
    const n = Math.round(RAIN.length * (k === 'storm' ? 1 : 0.35 + WX.amt * 0.6) * [0.4, 0.7, 1, 1][GFXL]), sp = 900;
    c.strokeStyle = 'rgba(190,210,235,.55)'; c.lineWidth = 1.4; c.beginPath();
    for (let i = 0; i < n; i++) {
      const d = RAIN[i];
      d.y += sp * d.v * dt; d.x += sp * d.v * slant * dt;
      if (d.y > GY + 4) {
        if (Math.random() < 0.3) fx.push({ x: MX(d.x), y: GY, vx: rnd(-30, 30), vy: rnd(-70, -30), l: 0.2, ml: 0.2, col: 'rgba(200,220,240,.8)', r: 1, g: 500 });
        d.y = -rnd(0, 60); d.x = Math.random() * (W + 300) - 150;
      }
      c.moveTo(d.x, d.y); c.lineTo(d.x - slant * 14, d.y - 14);
    }
    c.stroke();
  }
  if (k === 'snow') {
    const n = Math.round(SNOW.length * (0.4 + WX.amt * 0.6) * [0.4, 0.7, 1, 1][GFXL]);
    c.fillStyle = 'rgba(255,255,255,.9)';
    for (let i = 0; i < n; i++) {
      const s = SNOW[i];
      s.y += (30 + s.r * 14) * dt; s.x += (Math.sin(T * 1.3 + s.p) * 18 + slant * 60) * dt;
      if (s.y > GY + 6) { s.y = -5; s.x = Math.random() * W; }
      if (s.x < -5) s.x += W + 10; else if (s.x > W + 5) s.x -= W + 10;
      circ(s.x, s.y, s.r);
    }
  }
  if (k === 'fog') {
    // přízemní opar přes bojiště, pomalu se vlní
    for (let i = 0; i < 2; i++) {
      const y = GY - 110 + i * 60 + Math.sin(T * 0.4 + i) * 10, h = 120;
      const g = c.createLinearGradient(0, y - h, 0, y + h);
      g.addColorStop(0, 'rgba(222,228,234,0)'); g.addColorStop(0.5, `rgba(222,228,234,${0.28 * WX.amt})`); g.addColorStop(1, 'rgba(222,228,234,0)');
      c.fillStyle = g; c.fillRect(0, y - h, W, h * 2);
    }
  }
  if (k === 'storm') {
    boltT -= dt;
    if (boltT <= 0) {
      boltT = rnd(4, 11); flash = 1;
      const pts = []; let x = rnd(150, W - 150), y = 0;
      while (y < GY - 40) { pts.push(x, y); x += rnd(-40, 40); y += rnd(30, 70); }
      bolt = pts; sfx('thunder');
      if (SET.vib) vib([0, 120, 60, 60]);
    }
    if (flash > 0) {
      c.fillStyle = `rgba(235,240,255,${flash * 0.45})`; c.fillRect(0, 0, W, H);
      if (bolt && flash > 0.5) {
        c.strokeStyle = '#fff'; c.lineWidth = 3; c.shadowColor = '#bcd4ff'; c.shadowBlur = 18;
        c.beginPath(); c.moveTo(bolt[0], bolt[1]); for (let i = 2; i < bolt.length; i += 2) c.lineTo(bolt[i], bolt[i + 1]); c.stroke();
        c.shadowBlur = 0;
      }
      flash -= dt * 2.5;
    }
  }
}

// --- menu ---
function refreshWx() {
  const el = document.getElementById('wxOpts');
  if (!el) return;
  const m = SET.weather || 'off';
  document.querySelectorAll('#wxOpts button').forEach(b => b.classList.toggle('on', b.dataset.w === m));
  document.querySelectorAll('#fieldOpts button').forEach(b => b.classList.toggle('on', b.dataset.f === (SET.field || 'meadow')));
  $('bWx').textContent = '🌦 Počasí: ' + (m === 'off' ? 'VYP' : m === 'real' ? 'REÁLNÉ' : m === 'night' ? 'Noc' : WX_KINDS[m]);
  let s = '';
  if (m === 'real') {
    if (wxMsg) s = wxMsg;
    else if (wxReal.kind) s = `U tebe teď: <b>${WX_KINDS[wxReal.kind]}${wxReal.night ? ', noc' : ''}, ${wxReal.temp} °C</b>, vítr ${Math.round(wxReal.wind)} km/h`;
  }
  $('wxNow').innerHTML = s;
}
document.querySelectorAll('#wxOpts button').forEach(b => b.onclick = () => {
  SET.weather = b.dataset.w; saveSet(); sfx('click');
  wxApply(); refreshWx(); wxFetch(true);
});
$('bWx').onclick = () => { refreshWx(); openPanel('wxPanel'); };
document.querySelectorAll('#fieldOpts button').forEach(b => b.onclick = () => {
  SET.field = b.dataset.f; saveSet(); sfx('click'); setField(pickField()); refreshWx();
});
wxApply(); refreshWx(); wxFetch(false);

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
];
['meadow', 'winter', 'volcano', 'meadow', 'meadow', 'meadow', 'desert', 'desert', 'meadow', 'meadow', 'meadow', 'winter', 'desert', 'volcano', 'volcano']
  .forEach((f, i) => { CAMP[i].field = f; });
const CAMPS = load('aow-camp', {});               // index mise → počet hvězd
let lastStars = 0, campSel = 0;
const campOpen = i => i === 0 || !!CAMPS[i - 1];
const modsOf = V => (V.chal != null ? CHAL[V.chal].mods : V.camp != null ? CAMP[V.camp].mods : V.daily ? DAILY.mods : null) || {};

// hvězdy: 1 za vítězství, 2 za základnu nad polovinou, 3 za rychlost (u obrany za téměř nedotčenou základnu)
function starRules(m) {
  return ['Dobýt území', 'Základna nad 50 % zdraví', m.mods.survive ? 'Základna nad 85 % zdraví' : 'Vyhrát do ' + fmtTime(m.par)];
}
function campResult(won, V) {
  if (!won) { lastStars = 0; return; }
  const m = CAMP[V.camp], me = V.pl[mySide], hp = me.hp / me.mhp;
  lastStars = 1 + (hp >= 0.5 ? 1 : 0) + ((m.mods.survive ? hp >= 0.85 : V.time <= m.par) ? 1 : 0);
  const first = !CAMPS[V.camp];
  if (lastStars > (CAMPS[V.camp] || 0)) { CAMPS[V.camp] = lastStars; store('aow-camp', CAMPS); }
  if (first) toasts.push({ a: { n: m.n + ' ' + '★'.repeat(lastStars) }, h: 'ÚZEMÍ DOBYTO', l: 4 });
}

// --- mapa ---
const campPos = i => [70 + i * 61, i % 2 ? 150 : 290];
function hexPts(x, y, r) {
  return Array.from({ length: 6 }, (_, k) => { const a = Math.PI / 3 * k - Math.PI / 2; return `${(x + r * Math.cos(a)).toFixed(1)},${(y + r * Math.sin(a)).toFixed(1)}`; }).join(' ');
}
function renderCampMap() {
  const me = COLS[SET.col || 0].c;
  let land = '', beach = '', cells = '', path = '';
  CAMP.forEach((m, i) => {
    const [x, y] = campPos(i);
    beach += `<circle cx="${x}" cy="${y}" r="92"/>`;
    land += `<circle cx="${x}" cy="${y}" r="80"/>`;
    path += (i ? ' L' : 'M') + x + ' ' + y;
  });
  // podklad věků
  const ages = AGES.map((a, k) => {
    const [x] = campPos(k * 3 + 1);
    return `<text x="${x}" y="34" class="age">${a.name.toUpperCase()}</text>`;
  }).join('');
  CAMP.forEach((m, i) => {
    const [x, y] = campPos(i), st = CAMPS[i] || 0, open = campOpen(i);
    const fill = st ? me[0] : open ? '#a16207' : '#3b4556', stroke = i === campSel ? '#fde68a' : st ? me[1] : open ? '#fbbf24' : '#1e293b';
    cells += `<g class="cell ${open ? 'open' : 'locked'} ${i === campSel ? 'sel' : ''} ${open && !st ? 'next' : ''}" data-i="${i}">
      <polygon points="${hexPts(x, y, 50)}" fill="${fill}" stroke="${stroke}" stroke-width="${i === campSel ? 5 : 3}"/>
      <text x="${x}" y="${y + 4}" class="ic">${open ? m.ic : '🔒'}</text>
      ${WORLD.att === i ? `<text x="${x + 30}" y="${y - 26}" class="att">⚔</text>` : ''}
      <text x="${x}" y="${y + 36}" class="st">${st ? '★'.repeat(st) + '☆'.repeat(3 - st) : open ? (i + 1) : ''}</text>
      ${st ? `<path d="M${x + 16} ${y - 42} v-18 l14 5 l-14 5" fill="${me[2]}" stroke="#111" stroke-width="1.5"/>` : ''}
    </g>`;
  });
  $('campMap').innerHTML = `<svg viewBox="0 0 1000 420" preserveAspectRatio="xMidYMid meet">
    <defs><linearGradient id="sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1e3a5f"/><stop offset="1" stop-color="#0f2140"/></linearGradient></defs>
    <rect width="1000" height="420" fill="url(#sea)"/>
    <g fill="#c9b27a">${beach}</g><g fill="#5f8f3e">${land}</g>
    <path d="${path}" fill="none" stroke="#f5e6c4" stroke-width="4" stroke-dasharray="2 10" stroke-linecap="round" opacity=".7"/>
    ${ages}${cells}</svg>`;
  $('campMap').querySelectorAll('.cell.open').forEach(g => g.onclick = () => { campSel = +g.dataset.i; sfx('click'); renderCamp(); });
}
function renderCamp() {
  renderCampMap();
  const m = CAMP[campSel], st = CAMPS[campSel] || 0, rules = starRules(m);
  const total = Object.values(CAMPS).reduce((a, b) => a + b, 0);
  $('campCount').textContent = `${Object.keys(CAMPS).length} / ${CAMP.length} území · ${total} ★`;
  const goal = m.mods.survive ? `Vydrž ${fmtTime(m.mods.survive)}` : m.mods.limit ? `Znič základnu do ${fmtTime(m.mods.limit)}` : 'Znič nepřátelskou základnu';
  const extra = [m.mods.eHp && 'nepřítel má silnější základnu', WORLD.att === campSel && '⚔ ÚZEMÍ JE POD ÚTOKEM', m.mods.eGold && 'nepřítel má víc zlata', m.mods.noTower && 'nesmíš stavět věže', m.mods.boss != null && '👹 boss: ' + BOSSES[m.mods.boss].n].filter(Boolean);
  const done = campSel === CAMP.length - 1 && st;
  $('campBrief').innerHTML = `
    <div class="cb-head"><span class="cb-ic">${m.ic}</span><div><small>Mise ${campSel + 1} · ${AGES[m.mods.age || 0].name}</small><h3>${m.n}</h3></div></div>
    <p class="cb-story">${done ? m.end : m.t}</p>
    <div class="cb-meta"><b>Cíl:</b> ${goal}${extra.length ? ' · ' + extra.join(', ') : ''}<br><b>Soupeř:</b> ${DIFF[m.diff].n} · <b>Počasí:</b> ${m.wx === 'night' ? 'Noc' : WX_KINDS[m.wx]}</div>
    <div class="cb-meta"><b>Bonus území:</b> ${TERR[campSel].t}${!st ? ' (po dobytí)' : WORLD.att === campSel ? ' – neplatí, dokud území neubráníš' : ' ✔'}</div>
    <ul class="cb-stars">${rules.map((r, k) => `<li class="${st > k ? 'got' : ''}">${st > k ? '★' : '☆'} ${r}</li>`).join('')}</ul>
    <div class="cb-btns">${WORLD.att === campSel ? '<button id="bCampDef" class="def">🛡 Bránit území</button>' : ''}<button id="bCampGo">${st ? 'Hrát znovu' : 'Do boje!'}</button><button id="bCampCoop">🤝 S kámošem</button></div>`;
  $('bCampGo').onclick = () => { $('campPanel').classList.add('hidden'); cleanupNet(); startGame('solo', null, campSel); };
  if ($('bCampDef')) $('bCampDef').onclick = () => { $('campPanel').classList.add('hidden'); cleanupNet(); defNext = campSel; startGame('solo', null, campSel); };
  $('bCampCoop').onclick = () => { $('campPanel').classList.add('hidden'); hostGame({ coop: true, camp: campSel }); };
}
function openCamp(i) {
  if (i == null) { i = 0; while (i < CAMP.length - 1 && CAMPS[i]) i++; }
  campSel = campOpen(i) ? i : 0;
  renderCamp(); $('campPanel').classList.remove('hidden');
}
$('bCamp').onclick = () => { sfx('click'); openCamp(); };

// =====================================================================
//  DENNÍ VÝZVA – každý den jiná mise, z data vygenerovaná stejně pro všechny
// =====================================================================
const dayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
function seeded(str) {                                 // mulberry32 ze hashe řetězce
  let h = 1779033703;
  for (const ch of str) h = Math.imul(h ^ ch.charCodeAt(0), 3432918353), h = h << 13 | h >>> 19;
  return () => { h = h + 0x6D2B79F5 | 0; let t = Math.imul(h ^ h >>> 15, 1 | h); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
function genDaily(key) {
  const r = seeded('aow-' + key), pick = a => a[(r() * a.length) | 0];
  const age = pick([0, 0, 1, 1, 2, 2, 3, 4]), diff = pick([1, 1, 2, 2, 3]);
  const mods = { age: age || undefined }, rules = [];
  const pool = [
    () => { mods.noTower = 1; rules.push('nesmíš stavět věže'); },
    () => { mods.eHp = 1.6; rules.push('nepřítel má silnější základnu'); },
    () => { mods.eGold = AGE_GOLD[age] * 3; rules.push('nepřítel začíná s plnou pokladnou'); },
    () => { mods.gm = 0.75; rules.push('za zabití dostáváš méně zlata'); },
    () => { mods.only = pick([0, 1]); rules.push('smíš vyrábět jen ' + AGES[age].units[mods.only].n.toLowerCase() + 'y'); },
    () => { if (age < 4) { mods.noEvo = 1; rules.push('nikdo nemůže evolvovat'); } },
    () => { if (!mods.survive) { mods.limit = pick([600, 720, 900]); rules.push('vyhraj do ' + fmtTime(mods.limit)); } },
    () => { if (!mods.limit) { mods.survive = pick([300, 420]); rules.push('vydrž ' + fmtTime(mods.survive)); } },
  ];
  const n = 1 + (r() < 0.45 ? 1 : 0);
  for (let i = 0; i < n; i++) pick(pool)();
  const [d, m] = key.split('-').slice(1).map(Number);
  return { key, n: `Denní výzva ${m}. ${d}.`, diff, mods, field: pick(['meadow', 'desert', 'winter', 'volcano']), wx: pick(['clear', 'clear', 'cloudy', 'rain', 'storm', 'snow', 'fog', 'night']),
    par: 540 + age * 60, rules: rules.length ? rules : ['klasický souboj'] };
}
let DAILY = genDaily(dayKey());
const DRES = load('aow-daily', {});                    // datum → { stars, time }

function dailyResult(won, V) {
  if (!won) { lastStars = 0; return; }
  const me = V.pl[mySide], hp = me.hp / me.mhp;
  lastStars = 1 + (hp >= 0.5 ? 1 : 0) + ((DAILY.mods.survive ? hp >= 0.85 : V.time <= DAILY.par) ? 1 : 0);
  const old = DRES[DAILY.key];
  if (!old || lastStars > old.stars || (lastStars === old.stars && V.time < old.time)) {
    DRES[DAILY.key] = { stars: lastStars, time: V.time }; store('aow-daily', DRES);
    if (typeof partyAdd === 'function') partyAdd({ k: 'd', day: DAILY.key, st: lastStars, tm: V.time });
  }
}
const dailyText = () => {
  const r = DRES[DAILY.key];
  return `${DAILY.n} (Brutal Ages): ${r ? '★'.repeat(r.stars) + '☆'.repeat(3 - r.stars) + ' za ' + fmtTime(r.time) : 'zatím nesplněno'}`;
};
function renderDaily() {
  if (DAILY.key !== dayKey()) DAILY = genDaily(dayKey());
  const D = DAILY, r = DRES[D.key];
  const streak = (() => { let n = 0, d = new Date(); while (DRES[dayKey(d)]) { n++; d.setDate(d.getDate() - 1); } return n; })();
  $('dailyBody').innerHTML = `
    <h3>${D.n}</h3>
    <div class="cb-meta"><b>Věk:</b> ${AGES[D.mods.age || 0].name} · <b>Soupeř:</b> ${DIFF[D.diff].n} · <b>Počasí:</b> ${D.wx === 'night' ? 'Noc' : WX_KINDS[D.wx]}<br>
    <b>Bojiště:</b> ${FIELDS[D.field].n} · <b>Pravidla:</b> ${D.rules.join(', ')}</div>
    <ul class="cb-stars"><li>★ Vyhrát</li><li>★ Základna nad 50 % zdraví</li><li>★ ${D.mods.survive ? 'Základna nad 85 % zdraví' : 'Vyhrát do ' + fmtTime(D.par)}</li></ul>
    <p class="cb-story">${r ? `Tvůj dnešní výsledek: <b>${'★'.repeat(r.stars)}${'☆'.repeat(3 - r.stars)}</b> za ${fmtTime(r.time)}` : 'Dnes ještě nesplněno.'}
    ${streak > 1 ? `<br>🔥 Série: ${streak} dní v řadě` : ''}</p>
    <div class="cb-btns"><button id="bDailyGo">Hrát</button><button id="bDailyShare" class="ghost">📋 Zkopírovat výsledek</button></div>`;
  $('bDailyGo').onclick = () => { $('dailyPanel').classList.add('hidden'); cleanupNet(); startGame('solo', null, null, true); };
  $('bDailyShare').onclick = async () => {
    try { await navigator.clipboard.writeText(dailyText()); $('bDailyShare').textContent = '✔ Zkopírováno'; }
    catch (e) { prompt('Zkopíruj si výsledek:', dailyText()); }
  };
}
$('bDaily').onclick = () => { renderDaily(); openPanel('dailyPanel'); };

// =====================================================================
//  ZÁZNAM ZÁPASU – posledních 90 s, po hře se dá přehrát (i zpomaleně)
// =====================================================================
const REC_HZ = 15, REC_MAX = 90 * REC_HZ;
let rec = [], recEv = [], recAcc = 0, recTail = 0;
let replay = null;                       // { pos (snímek, desetinně), speed, cache }
function recPush(sn) { rec.push(sn); if (rec.length > REC_MAX) rec.shift(); }
// host a hra proti počítači nahrávají vlastní simulaci, připojený hráč přijaté snímky
function recTick(dt) {
  if (!S || replay || netWait || (paused && role === 'solo')) return;
  if (S.over >= 0) { if (recTail > 2.5) return; recTail += dt; } else recTail = 0;
  recAcc += dt;
  if (recAcc >= 1 / REC_HZ) { recAcc = 0; recPush(snap(recEv)); recEv = []; }
}
function startReplay(from) {
  if (rec.length < 10) return;
  // výchozí sestřih: posledních 20 s zpomaleně
  const start = from === 0 ? 0 : Math.max(0, rec.length - 20 * REC_HZ);
  replay = { pos: start, speed: from === 0 ? 1 : 0.5, cache: new Map(), last: Math.floor(start) - 1 };
  fx = []; pools = []; phMap.clear(); sfx('click');
}
const recFrame = i => { let v = replay.cache.get(i); if (!v) { v = decode(rec[i]); replay.cache.set(i, v); if (replay.cache.size > 60) replay.cache.delete(replay.cache.keys().next().value); } return v; };
function replayTick(dt) {
  const R = replay, end = rec.length - 1;
  R.pos = Math.min(end, R.pos + dt * REC_HZ * R.speed);
  const i = Math.floor(R.pos);
  for (let k = R.last + 1; k <= i; k++) (rec[k].E || []).forEach(addFx);   // efekty snímků, přes které se přešlo
  R.last = i;
  const a = R.pos - i, cur = recFrame(Math.min(end, i + 1)), prev = recFrame(i);
  const v = lerpSnap(prev, cur, a);
  return { ...v, over: -1 };                          // během záznamu bez obrazovky konce
}
let replayBtns = [];
function drawReplay() {
  const R = replay, end = rec.length - 1, y = 26;
  c.fillStyle = 'rgba(14,18,28,.97)'; c.fillRect(0, 0, W, HUD);
  c.fillStyle = '#e5c04a'; c.fillRect(0, HUD - 3, W, 2);
  c.textAlign = 'left'; c.fillStyle = '#fde68a'; c.font = '900 20px system-ui'; c.fillText('🎬 ZÁZNAM', 20, y + 30);
  // časová osa
  const tx = 170, tw = 420;
  rr(tx, y + 20, tw, 8, 4); c.fillStyle = '#334155'; c.fill();
  rr(tx, y + 20, tw * (R.pos / end), 8, 4); c.fillStyle = '#f59e0b'; c.fill();
  c.fillStyle = '#cbd5e1'; c.font = '700 13px system-ui';
  c.fillText(`-${fmtTime((end - R.pos) / REC_HZ)}`, tx + tw + 10, y + 29);
  const items = [['0,5×', 0.5], ['1×', 1], ['2×', 2], ['⟲ Celý', 'all'], ['✕ Konec', 'quit']];
  replayBtns = items.map(([t, k], i) => {
    const b = { x: 690 + i * 120, y: y + 4, w: 110, h: 42, k };
    const on = k === R.speed;
    rr(b.x, b.y, b.w, b.h, 9); c.fillStyle = k === 'quit' ? '#b91c1c' : on ? '#a16207' : '#334155'; c.fill();
    c.fillStyle = '#fff'; c.font = '800 16px system-ui'; c.textAlign = 'center'; c.fillText(t, b.x + b.w / 2, b.y + 27);
    return b;
  });
  if (R.pos >= end) { c.textAlign = 'center'; c.fillStyle = '#fde68a'; c.font = '900 26px system-ui'; c.fillText('KONEC ZÁZNAMU', W / 2, HUD + 60); }
}
function replayClick(hit) {
  for (const b of replayBtns) if (hit(b)) {
    sfx('click');
    if (b.k === 'quit') { replay = null; fx = []; }
    else if (b.k === 'all') startReplay(0);
    else { replay.speed = b.k; if (replay.pos >= rec.length - 1) startReplay(); }
  }
}

// =====================================================================
//  ŽEBŘÍČEK PARTY – bez serveru: výsledky zápasů a denních výzev si
//  telefony předávají při každém online spojení, takže se šíří mezi všemi
// =====================================================================
if (!SET.pid) { SET.pid = Math.random().toString(36).slice(2, 10); try { localStorage.setItem('aow-set', JSON.stringify(SET)); } catch (e) {} }
const PARTY = load('aow-party', { r: {} });
const PARTY_MAX = 600;

function partyAdd(x) {
  if (x.k === 'd' && !x.p) { x.p = SET.pid; x.n = SET.name || 'Hráč'; x.id = SET.pid + '-' + x.day; x.t = Date.now(); }
  const old = PARTY.r[x.id];
  if (old && x.k === 'd' && (old.st > x.st || (old.st === x.st && old.tm <= x.tm))) return false;
  if (old && (x.k === 'm' || x.k === 't')) return false;
  PARTY.r[x.id] = x;
  const ids = Object.keys(PARTY.r);
  if (ids.length > PARTY_MAX) ids.sort((a, b) => (PARTY.r[a].t || 0) - (PARTY.r[b].t || 0)).slice(0, ids.length - PARTY_MAX).forEach(id => delete PARTY.r[id]);
  store('aow-party', PARTY);
  return true;
}
function partyMerge(list) {
  if (!Array.isArray(list)) return;
  let n = 0;
  for (const x of list.slice(0, PARTY_MAX)) { const y = partyClean(x); if (y && partyAdd(y)) n++; }
  return n;
}
// data od ostatních telefonů se před uložením ověří a ořežou (kvůli pádům při vykreslení)
const str = (v, n) => typeof v === 'string' && v.length && v.length <= n ? v : null;
function partyClean(x) {
  if (!x || !str(x.id, 60)) return null;
  const t = Number.isFinite(x.t) ? x.t : 0;
  if (x.k === 'd') {
    const st = x.st | 0, tm = +x.tm;
    if (!str(x.p, 20) || !/^\d{4}-\d\d-\d\d$/.test(x.day) || st < 1 || st > 3 || !(tm >= 0 && tm < 1e5)) return null;
    return { id: x.id, k: 'd', t, p: x.p, n: str(x.n, 20) || '?', day: x.day, st, tm };
  }
  if (x.k === 'm') {
    const pl = o => o && str(o.p, 20) ? { p: o.p, n: str(o.n, 20) || '?' } : null, a = pl(x.a), b = pl(x.b);
    if (!a || !b || (x.w !== a.p && x.w !== b.p)) return null;
    return { id: x.id, k: 'm', t, a, b, w: x.w, tid: str(x.tid, 60) || undefined };
  }
  if (x.k === 't') {
    const pl = Array.isArray(x.pl) ? x.pl.slice(0, 8).map(o => o && str(o.p, 20) ? { p: o.p, n: str(o.n, 20) || '?' } : null) : [];
    if (pl.length < 3 || pl.some(p => !p)) return null;
    return { id: x.id, k: 't', t, name: str(x.name, 24) || 'Turnaj', pl };
  }
  return null;
}
const partySend = () => send({ t: 'party', r: Object.values(PARTY.r) });
function partyMatch(won) {
  const me = { p: SET.pid, n: SET.name || 'Hráč' }, op = { p: OPP.pid || 'anon', n: OPP.n || 'Kámoš' };
  const [a, b] = role === 'host' ? [me, op] : [op, me];
  partyAdd({ id: SESS + '-' + rematchN, k: 'm', t: Date.now(), a, b, w: won ? me.p : op.p, tid: curTour ? curTour.tid : undefined });
}
// Elo z chronologicky seřazených zápasů + poslední známé jméno každého hráče
function partyTable() {
  const P = {}, name = {}, get = id => P[id] || (P[id] = { id, elo: 1000, w: 0, l: 0 });
  const ms = Object.values(PARTY.r).filter(x => x.k === 'm').sort((x, y) => x.t - y.t);
  for (const m of ms) {
    name[m.a.p] = m.a.n; name[m.b.p] = m.b.n;
    const A = get(m.a.p), B = get(m.b.p), sa = m.w === m.a.p ? 1 : 0;
    const ea = 1 / (1 + Math.pow(10, (B.elo - A.elo) / 400)), d = 32 * (sa - ea);
    A.elo += d; B.elo -= d;
    if (sa) { A.w++; B.l++; } else { B.w++; A.l++; }
  }
  return Object.values(P).map(x => ({ ...x, n: x.id === SET.pid ? (SET.name || 'Hráč') : name[x.id] })).sort((x, y) => y.elo - x.elo);
}
function renderParty() {
  const T = partyTable();
  const rows = T.map((x, i) => `<div class="st-row ${x.id === SET.pid ? 'me' : ''}"><span>${['🥇', '🥈', '🥉'][i] || (i + 1) + '.'} ${esc(x.n || '?')}</span><b>${Math.round(x.elo)} <small>${x.w}:${x.l}</small></b></div>`).join('')
    || '<p class="muted">Zatím žádné zápasy. Žebříček se plní online souboji a výsledky si telefony předávají při každém spojení.</p>';
  const today = Object.values(PARTY.r).filter(x => x.k === 'd' && x.day === dayKey()).sort((x, y) => y.st - x.st || x.tm - y.tm);
  const drows = today.map(x => `<div class="st-row ${x.p === SET.pid ? 'me' : ''}"><span>${esc(x.n)}</span><b>${'★'.repeat(x.st)}${'☆'.repeat(3 - x.st)} <small>${fmtTime(x.tm)}</small></b></div>`).join('')
    || '<p class="muted">Dnes ji zatím nikdo nesplnil.</p>';
  return `<div class="st-col"><h3>🏅 Žebříček party <small>body · výhry:prohry</small></h3>${rows}</div>
          <div class="st-col"><h3>📅 Denní výzva dnes</h3>${drows}</div>`;
}

// =====================================================================
//  ROZEHRANÁ HRA – uloží se při zavření aplikace a dá se v ní pokračovat
// =====================================================================
const SAVE_KEY = 'aow-save';
let saveAcc = 0;
function canSave() { return role === 'solo' && S && S.over < 0 && !tut && !replay; }
function saveGame() {
  if (!canSave()) return;
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ v: 1, at: Date.now(), S, chal: curChal, camp: curCamp, daily: curDaily, field: FIELD, wx: WX,
      ai: { aiWant, aiT, aiEvoT, aiBroke } }));
  } catch (e) {}
}
function dropSave() { try { localStorage.removeItem(SAVE_KEY); } catch (e) {} }
function getSave() { try { const s = JSON.parse(localStorage.getItem(SAVE_KEY)); return s && s.v === 1 && s.S ? s : null; } catch (e) { return null; } }
// průběžně každých 5 s, po konci hry se uložená hra smaže
function saveTick(dt) {
  if (role !== 'solo' || !S || tut || replay) return;
  if (S.over >= 0) { dropSave(); return; }
  if ((saveAcc += dt) >= 5) { saveAcc = 0; saveGame(); }
}
document.addEventListener('visibilitychange', () => { if (document.hidden) saveGame(); });
addEventListener('pagehide', saveGame);

function resumeGame() {
  const g = getSave(); if (!g) return;
  startGame('solo', g.chal, g.camp, g.daily);
  S = g.S; S.ev = [];
  ({ aiWant, aiT, aiEvoT, aiBroke } = g.ai);
  setField(g.field); if (g.wx) wxSet(g.wx);
  paused = true;                                           // hráč se nejdřív rozkouká, pak klepne na Pokračovat
}
function resumeLabel(g) {
  const what = g.camp != null ? 'Kampaň ' + (g.camp + 1) + ': ' + CAMP[g.camp].n : g.chal != null ? 'Výzva: ' + CHAL[g.chal].n : g.daily ? 'Denní výzva' : DIFF[g.S.diff].n;
  return `▶ Pokračovat<small>${esc(what)} · ${AGES[g.S.pl[0].age].name} · ${fmtTime(g.S.time)}</small>`;
}
function refreshResume() {
  const b = $('bResume'), g = getSave();
  b.classList.toggle('hidden', !g);
  if (g) try { b.innerHTML = resumeLabel(g); } catch (e) { dropSave(); b.classList.add('hidden'); }
}
$('bResume').onclick = () => { sfx('click'); resumeGame(); };
refreshResume();
