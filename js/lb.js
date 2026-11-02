// =====================================================================
//  ONLINE ŽEBŘÍČEK – Firebase Realtime Database přes REST (bez knihovny)
//  Každý hráč se anonymně přihlásí a smí zapisovat jen svůj řádek. Hodnocení = Elo z online soubojů.
// =====================================================================
const FB = { key: 'AIzaSyDegixp674Y5q55eQi0G1R1qA7IDc5GyRo', db: 'https://brutalages-default-rtdb.europe-west1.firebasedatabase.app' };   // projekt Firebase „brutalages“
const LB = load('aow-lb', { r: 1000, w: 0, l: 0 });    // vlastní hodnocení a bilance online soubojů
let fbTok = null;

async function fbAuth() {
  if (!FB.key) return null;
  if (fbTok && fbTok.exp > Date.now()) return fbTok;
  const A = load('aow-fb', {});
  const keep = (t, uid, sec, refresh) => { fbTok = { t, uid, exp: Date.now() + (sec - 60) * 1000 }; A.refresh = refresh; A.uid = uid; store('aow-fb', A); return fbTok; };
  try {
    if (A.refresh) {
      const r = await fetch('https://securetoken.googleapis.com/v1/token?key=' + FB.key, { method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'grant_type=refresh_token&refresh_token=' + encodeURIComponent(A.refresh) }).then(r => r.json());
      if (r.id_token) return keep(r.id_token, r.user_id, +r.expires_in, r.refresh_token);
    }
    const r = await fetch('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' + FB.key, { method: 'POST',
      headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ returnSecureToken: true }) }).then(r => r.json());
    return r.idToken ? keep(r.idToken, r.localId, +r.expiresIn, r.refreshToken) : null;
  } catch (e) { return null; }
}
const lbRow = () => ({ n: (SET.name || 'Hráč').slice(0, 14), r: Math.round(LB.r), w: LB.w, l: LB.l, lv: profLevel(),
  st: Object.values(CAMPS).reduce((a, b) => a + b, 0), k: ST.kills, e: SET.emb || 0, t: Date.now() });
async function lbPush() {
  const a = await fbAuth(); if (!a) return false;
  try { return (await fetch(`${FB.db}/lb/${a.uid}.json?auth=${a.t}`, { method: 'PUT', body: JSON.stringify(lbRow()) })).ok; } catch (e) { return false; }
}
async function lbFetch() {
  const r = await fetch(`${FB.db}/lb.json?orderBy=${encodeURIComponent('"r"')}&limitToLast=100`).then(r => r.json());
  return Object.entries(r || {}).map(([uid, v]) => ({ uid, ...v })).sort((a, b) => b.r - a.r || b.w - a.w);
}
// po online souboji 1 na 1: Elo podle hodnocení soupeře (posílá se v pozdravu)
function lbResult(won) {
  const opp = OPP.rating || 1000, exp = 1 / (1 + Math.pow(10, (opp - LB.r) / 400));
  LB.r = Math.max(100, LB.r + 32 * ((won ? 1 : 0) - exp));
  won ? LB.w++ : LB.l++;
  store('aow-lb', LB); lbPush();
}

async function renderLb() {
  const box = $('lbBody');
  if (!FB.key) { box.innerHTML = '<p class="muted">Online žebříček zatím není zapnutý.</p>'; return; }
  box.innerHTML = '<p class="muted">Načítám žebříček…</p>';
  await lbPush();
  let list;
  try { list = await lbFetch(); } catch (e) { box.innerHTML = '<p class="muted">Žebříček se nepodařilo načíst – jsi online?</p>'; return; }
  const me = load('aow-fb', {}).uid;
  box.innerHTML = `<p class="muted">Hodnocení se počítá z online soubojů 1 na 1 (začíná se na 1000). Tvoje: <b>${Math.round(LB.r)}</b> · ${LB.w} výher, ${LB.l} proher</p>
    <table class="bst lb"><tr><th>#</th><th>Hráč</th><th>Hodnocení</th><th>V : P</th><th>Úroveň</th><th>★ kampaň</th></tr>
    ${list.map((p, i) => `<tr class="${p.uid === me ? 'me' : ''}"><td>${i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1}</td><td>${(EMBS[p.e] || {}).ic || ''} ${esc(p.n)}</td><td><b>${p.r}</b></td><td>${p.w} : ${p.l}</td><td>${p.lv}</td><td>${p.st}</td></tr>`).join('')}</table>`;
}
$('bLb').onclick = () => { openPanel('lbPanel'); renderLb(); };
