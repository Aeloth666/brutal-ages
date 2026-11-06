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
// průběžně každých 20 s (a hned při schování aplikace), po konci hry se uložená hra smaže
function saveTick(dt) {
  if (role !== 'solo' || !S || tut || replay) return;
  if (S.over >= 0) { dropSave(); return; }
  if ((saveAcc += dt) >= 20) { saveAcc = 0; saveGame(); }
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
