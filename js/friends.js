// =====================================================================
//  PŘÁTELÉ – ID hráče, hledání podle jména nebo ID, žádosti o přátelství a porovnání statistik
//  Firebase: /pub/{uid} veřejný profil se souhrnem statistik, /ids/{kód} → uid, /freq/{komu}/{od koho} žádosti
// =====================================================================
const ME = load('aow-me', { id: '' });                   // moje ID hráče (6 znaků, zobrazuje se jako BA-XXXXXX)
let MYFR = load('aow-fr', []);                           // přátelé: [{ uid, id, n, pid }]
let FRQ = {}, FRQN = 0, pubLast = 0;                     // příchozí žádosti (z /freq), jejich počet a čas posledního zápisu profilu
const ID_ABC = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const fmtId = id => id ? 'BA-' + id : '…';
const normId = s => String(s || '').toUpperCase().replace(/^BA-?/, '').replace(/[^A-Z0-9]/g, '');
const saveFr = () => store('aow-fr', MYFR);
// čtení s přihlášením (žádosti smí číst jen adresát)
const fbGetA = async path => { const a = await fbAuth(); if (!a) throw new Error('Nepodařilo se přihlásit'); const r = await fbFetch(`${FB.db}/${path}.json?auth=${a.t}`); if (!r.ok) throw new Error('Čtení selhalo (' + r.status + ')'); return r.json(); };

// souhrn statistik pro porovnání s přáteli
function myStats() {
  const sw = ST.solo.reduce((a, r) => a + r[0], 0), sl = ST.solo.reduce((a, r) => a + r[1], 0);
  return { lv: profLevel(), g: ST.games, k: ST.kills, b: ST.best || 0, sw, sl, ow: LB.w, ol: LB.l, r: Math.round(LB.r),
    cs: Object.values(CAMPS).reduce((a, b) => a + b, 0), ac: ACH.filter(a => ACHS[a.id]).length, sv: SURVB.best || 0, q: QST.done || 0 };
}
// moje ID: vymyslí se jednou a zarezervuje v /ids (kdyby bylo obsazené, zkusí jiné)
async function ensureId() {
  if (ME.id) return ME.id;
  const a = await fbAuth(); if (!a) throw new Error('Nepodařilo se přihlásit');
  for (let k = 0; k < 6; k++) {
    const id = Array.from({ length: 6 }, () => ID_ABC[(Math.random() * ID_ABC.length) | 0]).join('');
    try { await fbPut('ids/' + id, a.uid); ME.id = id; store('aow-me', ME); return id; } catch (e) {}
  }
  throw new Error('Nepodařilo se vytvořit ID');
}
// veřejný profil – zapisuje se po hře a při otevření přátel (nejvýš jednou za minutu)
async function pubSync(force) {
  if (!FB.key || (!force && Date.now() - pubLast < 60000)) return;
  pubLast = Date.now();
  try {
    const id = await ensureId(), n = (SET.name || 'Hráč').slice(0, 14);
    await fbPut('pub/' + (await fbAuth()).uid, { id, n, nl: n.toLowerCase(), pid: SET.pid, e: SET.emb || 0, s: myStats(), t: Date.now() });
  } catch (e) {}
}
// hledání: ID (BA-XXXXXX) nebo začátek jména
async function frSearch(q) {
  const id = normId(q), out = [];
  if (id.length === 6) { const uid = await fbGet('ids/' + id); if (uid) { const p = await fbGet('pub/' + uid); if (p) out.push({ uid, ...p }); } }
  const nl = q.trim().toLowerCase();
  if (nl.length >= 2) {
    const res = await fbFetch(`${FB.db}/pub.json?orderBy=${encodeURIComponent('"nl"')}&startAt=${encodeURIComponent(JSON.stringify(nl))}&endAt=${encodeURIComponent(JSON.stringify(nl + ''))}&limitToFirst=20`);
    const r = res.ok ? await res.json() : {};
    for (const [uid, p] of Object.entries(r || {})) if (!out.some(x => x.uid === uid)) out.push({ uid, ...p });
  }
  const me = (await fbAuth() || {}).uid;
  return out.filter(x => x.uid !== me);
}
// žádost o přátelství: zapíše se do schránky adresáta; když adresát žádost přijme, pošle potvrzení (acc) zpátky
async function frRequest(p, acc) {
  const a = await fbAuth(); if (!a) throw new Error('Nepodařilo se přihlásit');
  await fbPut(`freq/${p.uid}/${a.uid}`, { n: (SET.name || 'Hráč').slice(0, 14), id: await ensureId(), pid: SET.pid, t: Date.now(), ...(acc ? { acc: 1 } : {}) });
}
function frAdd(p) {
  if (!p || !p.uid || MYFR.some(f => f.uid === p.uid)) return;
  MYFR.push({ uid: p.uid, id: p.id || '', n: p.n || 'Hráč', pid: p.pid || '' }); saveFr();
  achId && achId('friend');
}
// načte příchozí žádosti; potvrzení od přítele rovnou zařadí do seznamu
async function frPoll() {
  if (!FB.key) return;
  try {
    const a = await fbAuth(); if (!a) return;
    const r = await fbGetA('freq/' + a.uid) || {};
    FRQ = {};
    for (const [uid, q] of Object.entries(r)) {
      if (q.acc || MYFR.some(f => f.uid === uid)) { frAdd({ uid, ...q }); await fbPut(`freq/${a.uid}/${uid}`, null).catch(() => {}); continue; }
      FRQ[uid] = q;
    }
    FRQN = Object.keys(FRQ).length;
    if (typeof refreshHQ === 'function') refreshHQ();
  } catch (e) {}
}
async function frAnswer(uid, yes) {
  const a = await fbAuth(); if (!a) return;
  const q = FRQ[uid]; delete FRQ[uid]; FRQN = Object.keys(FRQ).length;
  await fbPut(`freq/${a.uid}/${uid}`, null).catch(() => {});
  if (yes && q) { frAdd({ uid, ...q }); await frRequest({ uid }, true).catch(() => {}); }
  if (typeof refreshHQ === 'function') refreshHQ();
}
function frRemove(uid) { MYFR = MYFR.filter(f => f.uid !== uid); saveFr(); }

// ---------- okno Přátelé ----------
let frView = null;                                        // null = seznam, jinak uid přítele v porovnání
async function renderFr(msg) {
  const b = $('frBody'); if (!b) return;
  if (frView) return renderCompare(frView);
  const reqs = Object.entries(FRQ);
  b.innerHTML = `
    <div class="fr-me">Tvoje ID: <b class="bigcode" id="frMyId">${fmtId(ME.id)}</b> <button id="bFrCopy" class="ghost mini">📋 Kopírovat</button><br><small class="muted">Pošli ho kámošovi – podle něj tě najde. Jméno si změníš v Profilu.</small></div>
    <div class="row"><input id="frQ" maxlength="20" placeholder="Jméno nebo ID (BA-…)" autocomplete="off"><button id="bFrFind">🔍 Hledat</button></div>
    <p id="frMsg" class="muted">${msg || ''}</p>
    <div id="frRes"></div>
    ${reqs.length ? `<div class="msec">📨 Žádosti o přátelství</div>` + reqs.map(([uid, q]) => `<div class="friend"><span><b>${esc(q.n)}</b> <small>${fmtId(q.id)}</small></span><span><button data-yes="${uid}">✔ Přijmout</button> <button class="ghost" data-no="${uid}">✕</button></span></div>`).join('') : ''}
    <div class="msec">👥 Přátelé</div>
    ${MYFR.length ? MYFR.map(f => `<div class="friend"><span><b>${esc(f.n)}</b> <small>${fmtId(f.id)}</small></span><span><button data-cmp="${f.uid}">📊 Porovnat</button> <button class="ghost" data-inv="${f.uid}">📨 Pozvat</button> <button class="ghost mini" data-del="${f.uid}" title="Odebrat z přátel">✕</button></span></div>`).join('')
      : '<p class="muted">Zatím nikoho nemáš. Najdi kámoše podle jména nebo ID a pošli mu žádost.</p>'}`;
  const m = t => { $('frMsg').textContent = t; };
  $('bFrCopy').onclick = () => { sfx('click'); try { navigator.clipboard.writeText(fmtId(ME.id)); m('ID zkopírováno.'); } catch (e) { m(fmtId(ME.id)); } };
  const find = async () => {
    const q = $('frQ').value; if (q.trim().length < 2) { m('Napiš aspoň 2 znaky jména nebo celé ID.'); return; }
    sfx('click'); m('Hledám…');
    try {
      const L = await frSearch(q);
      m(L.length ? '' : 'Nikoho takového jsem nenašel. Kámoš si musí aspoň jednou otevřít Přátele (vytvoří se mu ID).');
      $('frRes').innerHTML = L.map(p => { const isF = MYFR.some(f => f.uid === p.uid);
        return `<div class="friend"><span><b>${esc(p.n)}</b> <small>${fmtId(p.id)} · úroveň ${(p.s && p.s.lv) || 1}</small></span>${isF ? '<small>✔ přítel</small>' : `<button data-add="${p.uid}">➕ Přidat</button>`}</div>`; }).join('');
      $('frRes').querySelectorAll('[data-add]').forEach(x => x.onclick = async () => {
        sfx('click'); x.disabled = true;
        try { await frRequest(L.find(p => p.uid === x.dataset.add)); x.textContent = '📨 Žádost odeslána'; } catch (e) { x.textContent = '❌ ' + e.message; }
      });
    } catch (e) { m('❌ ' + e.message); }
  };
  $('bFrFind').onclick = find; $('frQ').onkeydown = e => { if (e.key === 'Enter') find(); };
  b.querySelectorAll('[data-yes]').forEach(x => x.onclick = async () => { sfx('click'); await frAnswer(x.dataset.yes, true); renderFr('Přítel přidán.'); });
  b.querySelectorAll('[data-no]').forEach(x => x.onclick = async () => { sfx('click'); await frAnswer(x.dataset.no, false); renderFr(); });
  b.querySelectorAll('[data-cmp]').forEach(x => x.onclick = () => { sfx('click'); frView = x.dataset.cmp; renderFr(); });
  b.querySelectorAll('[data-inv]').forEach(x => x.onclick = () => { const f = MYFR.find(f => f.uid === x.dataset.inv); if (!f || !f.pid) return; sfx('click');
    $('friendsPanel').classList.add('hidden'); $('hqPanel').classList.add('hidden'); openPanel('mpPanel'); inviteFriend({ pid: f.pid, n: f.n }); });
  b.querySelectorAll('[data-del]').forEach(x => x.onclick = () => { const f = MYFR.find(f => f.uid === x.dataset.del); if (f && confirm(`Odebrat ${f.n} z přátel?`)) { frRemove(f.uid); renderFr(); } });
}
// porovnání: já proti příteli, lepší hodnota je zvýrazněná; vzájemné zápasy z mých statistik
async function renderCompare(uid) {
  const b = $('frBody'), f = MYFR.find(x => x.uid === uid) || { n: 'Přítel' };
  b.innerHTML = '<p class="muted">Načítám statistiky…</p>';
  let p = null; try { p = await fbGet('pub/' + uid); } catch (e) {}
  if (frView !== uid) return;
  const me = myStats(), o = (p && p.s) || null;
  if (p) { f.n = p.n; f.id = p.id; f.pid = p.pid || f.pid; saveFr(); }
  const h2h = ST.vs[f.n] || [0, 0];
  const pct = (w, l) => w + l ? Math.round(w / (w + l) * 100) + ' %' : '—';
  const rows = [
    ['Úroveň', 'lv'], ['Odehrané hry', 'g'], ['Zabité jednotky', 'k'], ['Výhry proti počítači', 'sw'],
    ['Úspěšnost proti počítači', s => pct(s.sw, s.sl), s => s.sw / Math.max(1, s.sw + s.sl)],
    ['Online výhry : prohry', s => s.ow + ' : ' + s.ol, s => s.ow - s.ol], ['Online hodnocení', 'r'],
    ['Nejrychlejší výhra', s => s.b ? fmtTime(s.b) : '—', s => s.b ? -s.b : -1e9], ['Hvězdy v kampani', 'cs'],
    ['Úspěchy', 'ac'], ['Nejvíc vln v přežití', 'sv'], ['Splněné úkoly', 'q']];
  const cell = (s, show) => s ? (typeof show === 'function' ? show(s) : (s[show] ?? 0).toLocaleString('cs')) : '—';
  b.innerHTML = `
    <button id="bFrBack" class="ghost mini">← Zpět na přátele</button>
    <table class="bst cmp"><tr><th></th><th>${esc(SET.name || 'Ty')}</th><th>${esc(f.n)}</th></tr>
    ${rows.map(([n, show, val]) => { const v = val || (s => s[show] ?? 0), a = me && v(me), c = o && v(o);
      return `<tr><td>${n}</td><td class="${o && a > c ? 'win' : ''}">${cell(me, show)}</td><td class="${o && c > a ? 'win' : ''}">${cell(o, show)}</td></tr>`; }).join('')}
    </table>
    <p class="muted">${o ? 'Statistiky přítele z ' + new Date(p.t).toLocaleString('cs') + '.' : 'Přítel zatím nemá zveřejněné statistiky – stačí, když si otevře Přátele.'}
    Vzájemné online souboje: <b>${h2h[0]} : ${h2h[1]}</b> (tvoje výhry : prohry).</p>`;
  $('bFrBack').onclick = () => { sfx('click'); frView = null; renderFr(); };
}
function openFriends() { frView = null; openPanel('friendsPanel'); renderFr(); pubSync(true).then(() => { if (!frView) renderFr(); }); frPoll().then(() => { if (!frView) renderFr(); }); }
$('bFriends').onclick = () => { sfx('click'); openFriends(); };
setTimeout(() => { pubSync(); frPoll(); }, 4000);
setInterval(() => { if (!role) frPoll(); }, 90000);
