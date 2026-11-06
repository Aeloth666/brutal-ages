// =====================================================================
//  ONLINE ŽEBŘÍČEK – Firebase Realtime Database přes REST (bez knihovny)
//  Každý hráč se anonymně přihlásí a smí zapisovat jen svůj řádek. Hodnocení = Elo z online soubojů.
// =====================================================================
const FB = { key: 'AIzaSyDegixp674Y5q55eQi0G1R1qA7IDc5GyRo', db: 'https://brutalages-default-rtdb.europe-west1.firebasedatabase.app' };   // projekt Firebase „brutalages“
const LB = load('aow-lb', { r: 1000, w: 0, l: 0 });    // vlastní hodnocení a bilance online soubojů
// ligy podle hodnocení (Elo) – od = spodní hranice
const LEAGUES = [
  { ic: '🪵', n: 'Dřevěná liga', od: 0, col: '#a16207' }, { ic: '🥉', n: 'Bronzová liga', od: 900, col: '#b45309' },
  { ic: '🥈', n: 'Stříbrná liga', od: 1100, col: '#94a3b8' }, { ic: '🥇', n: 'Zlatá liga', od: 1300, col: '#eab308' },
  { ic: '💎', n: 'Diamantová liga', od: 1500, col: '#38bdf8' }, { ic: '👑', n: 'Mistrovská liga', od: 1700, col: '#c084fc' },
];
const leagueIx = r => { let k = 0; LEAGUES.forEach((L, i) => { if ((r ?? 1000) >= L.od) k = i; }); return k; };
const leagueOf = r => LEAGUES[leagueIx(r)];
const leagueTag = r => { const L = leagueOf(r); return `<span class="lg" title="${L.n}">${L.ic}</span>`; };
function leagueBar() {
  const k = leagueIx(LB.r), L = LEAGUES[k], N = LEAGUES[k + 1], pct = N ? Math.round((LB.r - L.od) / (N.od - L.od) * 100) : 100;
  return `<div class="q-row league"><span>${L.ic} <b>${L.n}</b>${N ? ` · do ligy ${N.ic} ${N.n} chybí ${Math.ceil(N.od - LB.r)} bodů` : ' · nejvyšší liga!'}</span><i style="width:${pct}%;background:${L.col}"></i></div>
    <p class="small muted">Ligy: ${LEAGUES.map(L => L.ic + ' ' + L.od + '+').join(' · ')}</p>`;
}
let fbTok = null;
// fetch s opakováním: výpadek sítě nebo chyba serveru (5xx/429) → zkusí to znovu za 0,5 s a 1,5 s
async function fbFetch(url, opt) {
  if (navigator.onLine === false) throw new Error('Jsi offline – připoj se k internetu');
  for (let i = 0; ; i++) {
    try {
      const r = await fetch(url, opt);
      if ((r.status >= 500 || r.status === 429) && i < 2) throw new Error('server ' + r.status);
      return r;
    } catch (e) {
      if (i >= 2) throw new Error(navigator.onLine === false ? 'Jsi offline – připoj se k internetu' : 'Server neodpovídá, zkus to za chvíli');
      await new Promise(res => setTimeout(res, 500 * 3 ** i));
    }
  }
}

async function fbAuth() {
  if (!FB.key) return null;
  if (fbTok && fbTok.exp > Date.now()) return fbTok;
  const A = load('aow-fb', {});
  const keep = (t, uid, sec, refresh) => { fbTok = { t, uid, exp: Date.now() + (sec - 60) * 1000 }; A.refresh = refresh; A.uid = uid; store('aow-fb', A); return fbTok; };
  try {
    if (A.refresh) {
      const r = await fbFetch('https://securetoken.googleapis.com/v1/token?key=' + FB.key, { method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'grant_type=refresh_token&refresh_token=' + encodeURIComponent(A.refresh) }).then(r => r.json());
      if (r.id_token) return keep(r.id_token, r.user_id, +r.expires_in, r.refresh_token);
    }
    const r = await fbFetch('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' + FB.key, { method: 'POST',
      headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ returnSecureToken: true }) }).then(r => r.json());
    return r.idToken ? keep(r.idToken, r.localId, +r.expiresIn, r.refreshToken) : null;
  } catch (e) { return null; }
}
const lbRow = () => ({ n: (SET.name || 'Hráč').slice(0, 14), r: Math.round(LB.r), w: LB.w, l: LB.l, lv: profLevel(),
  st: Object.values(CAMPS).reduce((a, b) => a + b, 0), k: ST.kills, e: SET.emb || 0, t: Date.now(), ...lbClan() });
async function lbPush() {
  const a = await fbAuth(); if (!a) return false;
  clanSync();
  try { return (await fbFetch(`${FB.db}/lb/${a.uid}.json?auth=${a.t}`, { method: 'PUT', body: JSON.stringify(lbRow()) })).ok; } catch (e) { return false; }
}
async function lbFetch() {
  const r = await fbFetch(`${FB.db}/lb.json?orderBy=${encodeURIComponent('"r"')}&limitToLast=100`).then(r => r.json());
  return Object.entries(r || {}).map(([uid, v]) => ({ uid, ...v })).sort((a, b) => b.r - a.r || b.w - a.w);
}
// po online souboji 1 na 1: Elo podle hodnocení soupeře (posílá se v pozdravu)
function lbResult(won) {
  const opp = OPP.rating || 1000, exp = 1 / (1 + Math.pow(10, (opp - LB.r) / 400));
  const lg0 = leagueIx(LB.r);
  LB.r = Math.max(100, LB.r + 32 * ((won ? 1 : 0) - exp));
  const lg1 = leagueIx(LB.r);
  if (lg1 !== lg0) toasts.push({ a: { n: LEAGUES[lg1].ic + ' ' + LEAGUES[lg1].n }, h: lg1 > lg0 ? '⬆ POSTUP DO LIGY' : '⬇ SESTUP DO LIGY', l: 5 });
  won ? LB.w++ : LB.l++;
  if (won) clanWin();
  if (LB.r >= 1200) achId('elo1200');
  store('aow-lb', LB); lbPush();
}

// nekonečné přežití: nejlepší počet vln
async function survPush() {
  if (cheatOn()) return false;
  const a = await fbAuth(); if (!a || !SURVB.best) return false;
  try { return (await fbFetch(`${FB.db}/surv/${a.uid}.json?auth=${a.t}`, { method: 'PUT', body: JSON.stringify({ n: (SET.name || 'Hráč').slice(0, 14), w: SURVB.best, t: SURVB.t, e: SET.emb || 0, ...lbClan() }) })).ok; } catch (e) { return false; }
}
async function survFetch() {
  const r = await fbFetch(`${FB.db}/surv.json?orderBy=${encodeURIComponent('"w"')}&limitToLast=100`).then(r => r.json());
  return Object.entries(r || {}).map(([uid, v]) => ({ uid, ...v })).sort((a, b) => b.w - a.w || a.t - b.t);
}
const lbClan = () => (typeof CLAN !== 'undefined' && CLAN.tag ? { c: CLAN.tag } : {});
let lbTab = 'duel';
async function renderLb() {
  const box = $('lbBody');
  if (!FB.key) { box.innerHTML = '<p class="muted">Online žebříček zatím není zapnutý.</p>'; return; }
  const tabs = `<div class="seg lb-tabs">${[['duel', '⚔ Souboje'], ['surv', '♾ Přežití'], ['clan', '🛡 Klany']].map(([k, n]) => `<button data-t="${k}" class="${lbTab === k ? 'on' : ''}">${n}</button>`).join('')}</div>`;
  box.innerHTML = tabs + '<p class="muted">Načítám žebříček…</p>';
  const wire = () => box.querySelectorAll('.lb-tabs button').forEach(b => b.onclick = () => { lbTab = b.dataset.t; sfx('click'); renderLb(); });
  wire();
  const me = load('aow-fb', {}).uid, tag = p => p.c ? `<small class="ctag">${typeof clanBadge === 'function' ? clanBadge(p.c) : ''}[${esc(p.c)}]</small> ` : '';
  if (lbTab === 'surv') {
    await survPush();
    let list; try { list = await survFetch(); } catch (e) { box.innerHTML = tabs + '<p class="muted">Žebříček se nepodařilo načíst – jsi online?</p>'; wire(); return; }
    box.innerHTML = tabs + `<p class="muted">Nejvíc přežitých vln v Nekonečném přežití. Tvůj rekord: <b>${SURVB.best}</b></p>
      <table class="bst lb"><tr><th>#</th><th>Hráč</th><th>Vln</th><th>Čas</th></tr>
      ${list.map((p, i) => `<tr class="${p.uid === me ? 'me' : ''}"><td>${i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1}</td><td>${(EMBS[p.e] || {}).ic || ''} ${tag(p)}${esc(p.n)}</td><td><b>${p.w}</b></td><td>${fmtTime(p.t || 0)}</td></tr>`).join('')}</table>`;
    wire(); return;
  }
  if (lbTab === 'clan') { box.innerHTML = tabs; wire(); if (typeof renderClanLb === 'function') renderClanLb(box); return; }
  await lbPush();
  let list;
  try { list = await lbFetch(); } catch (e) { box.innerHTML = tabs + '<p class="muted">Žebříček se nepodařilo načíst – jsi online?</p>'; wire(); return; }
  if (list.length >= 3 && list.findIndex(p => p.uid === me) >= 0 && list.findIndex(p => p.uid === me) < 3) achId('podium');
  box.innerHTML = tabs + `<p class="muted">Hodnocení se počítá z online soubojů 1 na 1 (začíná se na 1000). Tvoje: <b>${Math.round(LB.r)}</b> · ${LB.w} výher, ${LB.l} proher</p>${leagueBar()}
    <table class="bst lb"><tr><th>#</th><th>Hráč</th><th>Hodnocení</th><th>V : P</th><th>Úroveň</th><th>★ kampaň</th></tr>
    ${list.map((p, i) => `<tr class="${p.uid === me ? 'me' : ''}"><td>${i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1}</td><td>${(EMBS[p.e] || {}).ic || ''} ${tag(p)}${esc(p.n)}</td><td>${leagueTag(p.r)} <b>${p.r}</b></td><td>${p.w} : ${p.l}</td><td>${p.lv}</td><td>${p.st}</td></tr>`).join('')}</table>`;
}
$('bLb').onclick = () => { openPanel('lbPanel'); renderLb(); };
