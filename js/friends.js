// =====================================================================
//  PŘÁTELÉ – ID hráče, hledání podle jména nebo ID, žádosti o přátelství a porovnání statistik
//  Firebase: /pub/{uid} veřejný profil se souhrnem statistik, /ids/{kód} → uid, /freq/{komu}/{od koho} žádosti
// =====================================================================
const ME = load('aow-me', { id: '' });                   // moje ID hráče (6 znaků, zobrazuje se jako BA-XXXXXX)
let MYFR = load('aow-fr', []);                           // přátelé: [{ uid, id, n, pid }]
let FRQ = {}, FRQN = 0, pubLast = 0;                     // příchozí žádosti (z /freq), jejich počet a čas posledního zápisu profilu
let CINV = {}, CINVN = 0;                                // pozvánky do klanu (z /cinv) a jejich počet
// zprávy mezi přáteli: server je jen schránka (/msg/{komu}/{id}), doručené se smažou a konverzace zůstává v telefonu
const MSG = load('aow-msg', {}), UNR = load('aow-unr', {}); // uid přítele → [{ o: 1 moje / 0 jeho, x, t }], nepřečtené
const msgN = () => Object.values(UNR).reduce((a, b) => a + b, 0);
async function msgSend(uid, x) {
  x = String(x || '').trim().slice(0, 200); if (!x) return;
  const a = await fbAuth(); if (!a) throw new Error('Nepodařilo se přihlásit');
  const r = await fbFetch(`${FB.db}/msg/${uid}.json?auth=${a.t}`, { method: 'POST', body: JSON.stringify({ f: a.uid, n: (SET.name || 'Hráč').slice(0, 14), x, t: Date.now() }) });
  if (!r.ok) throw new Error('Zprávu se nepodařilo odeslat (' + r.status + ')');
  (MSG[uid] = MSG[uid] || []).push({ o: 1, x, t: Date.now() }); MSG[uid] = MSG[uid].slice(-50); store('aow-msg', MSG);
}
// vyzvedne doručené zprávy (jen od přátel), uloží je k sobě a ze serveru smaže
async function msgPoll() {
  const a = await fbAuth(); if (!a) return 0;
  const r = await fbGetA('msg/' + a.uid).catch(() => null) || {};
  let n = 0;
  for (const [id, q] of Object.entries(r)) {
    await fbPut(`msg/${a.uid}/${id}`, null).catch(() => {});
    if (!q || !MYFR.some(f => f.uid === q.f)) continue;
    (MSG[q.f] = MSG[q.f] || []).push({ o: 0, x: String(q.x).slice(0, 200), t: q.t || Date.now() }); MSG[q.f] = MSG[q.f].slice(-50);
    if (frView !== 'chat:' + q.f) { UNR[q.f] = (UNR[q.f] || 0) + 1; toasts.push({ a: { n: q.n + ': ' + String(q.x).slice(0, 60) }, h: '💬 ZPRÁVA', l: 4 }); }
    n++;
  }
  if (n) { store('aow-msg', MSG); store('aow-unr', UNR); }
  return n;
}
const ID_ABC = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const fmtId = id => id ? 'BA-' + id : '…';
const normId = s => String(s || '').toUpperCase().replace(/^BA-?/, '').replace(/[^A-Z0-9]/g, '');
const saveFr = () => store('aow-fr', MYFR);
// čtení s přihlášením (žádosti smí číst jen adresát)
const fbGetA = async path => { const a = await fbAuth(); if (!a) throw new Error('Nepodařilo se přihlásit'); const r = await fbFetch(`${FB.db}/${path}.json?auth=${a.t}`); if (!r.ok) throw new Error('Čtení selhalo (' + r.status + ')'); return r.json(); };

// ---------- jedinečná přezdívka ----------
// klíč jména: malá písmena bez diakritiky, jen písmena a číslice („Pépa“ = „pepa“); /names/{klíč} → uid toho, kdo ho má
const nameKey = n => String(n || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
const NAME_FREE = ['hrac', ''];                          // výchozí „Hráč“ je volné pro všechny
// zabere jméno (a uvolní předchozí); vrací true, nebo vyhodí chybu s důvodem
async function claimName(n) {
  const k = nameKey(n);
  if (NAME_FREE.includes(k)) { if (ME.nk && ME.nk !== k) { const a = await fbAuth(); if (a) await fbPut('names/' + ME.nk, null).catch(() => {}); } ME.nk = k; store('aow-me', ME); return true; }
  if (k.length < 2) throw new Error('Jméno musí mít aspoň 2 písmena nebo číslice');
  const a = await fbAuth(); if (!a) throw new Error('Jméno jde změnit jen online');
  const owner = await fbGet('names/' + k);
  if (owner && owner !== a.uid) throw new Error('Tohle jméno už má jiný hráč');
  if (!owner) await fbPut('names/' + k, a.uid);
  if (ME.nk && ME.nk !== k && !NAME_FREE.includes(ME.nk)) await fbPut('names/' + ME.nk, null).catch(() => {});
  ME.nk = k; ME.nbad = 0; store('aow-me', ME);
  return true;
}
// stávající hráči: jméno, které už používají, si zaberou; když ho mezitím má někdo jiný, hra je upozorní
async function nameCheck() {
  const k = nameKey(SET.name);
  if (!FB.key || NAME_FREE.includes(k) || ME.nk === k) return;
  try { await claimName(SET.name); }
  catch (e) { if (/jiný hráč/.test(e.message) && !ME.nbad) { ME.nbad = 1; store('aow-me', ME); toasts.push({ a: { n: 'Jméno ' + SET.name + ' už používá jiný hráč – změň si ho v Profilu' }, h: '👤 PŘEZDÍVKA', l: 6 }); } }
}

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
// uid hráče podle herního identifikátoru (pid) – nedávní soupeři znají jen pid
async function uidOfPid(pid) {
  const res = await fbFetch(`${FB.db}/pub.json?orderBy=${encodeURIComponent('"pid"')}&equalTo=${encodeURIComponent(JSON.stringify(pid))}&limitToFirst=1`);
  const r = res.ok ? await res.json() : null, e = r && Object.entries(r)[0];
  return e ? { uid: e[0], ...e[1] } : null;
}
// pozvat do mého klanu (hráč je dán uid, nebo pid u nedávného soupeře)
async function clanInvite(p) {
  if (!CLAN.tag) throw new Error('Nejsi v žádném klanu');
  const t = p.uid ? p : await uidOfPid(p.pid);
  if (!t) { pendAdd({ k: 'cl', pid: p.pid, n: p.n, tag: CLAN.tag }); return 'later'; }
  const a = await fbAuth(); if (!a) throw new Error('Nepodařilo se přihlásit');
  const cn = await fbGet('clans/' + CLAN.tag + '/n');
  await fbPut(`cinv/${t.uid}/${a.uid}`, { tag: CLAN.tag, cn: String(cn || CLAN.tag).slice(0, 20), n: (SET.name || 'Hráč').slice(0, 14), t: Date.now() });
}
// přijmout / odmítnout pozvánku do klanu (z jiného klanu se nejdřív odejde)
async function clanInvAnswer(uid, yes) {
  const a = await fbAuth(); if (!a) return;
  const q = CINV[uid]; delete CINV[uid]; CINVN = Object.keys(CINV).length;
  await fbPut(`cinv/${a.uid}/${uid}`, null).catch(() => {});
  if (yes && q) { if (CLAN.tag && CLAN.tag !== q.tag) await clanLeave(); await clanJoin(q.tag); }
  if (typeof refreshHQ === 'function') refreshHQ();
}
// žádost nedávnému soupeři: najde jeho profil podle herního identifikátoru (pid)
// vrací 'friend' (už je přítel), 'sent' (odesláno) nebo 'later' (pošle se, až si soupeř spustí novou verzi)
async function frRequestPid(pid, n) {
  const p = await uidOfPid(pid);
  if (!p) { pendAdd({ k: 'fr', pid, n }); return 'later'; }
  if (MYFR.some(f => f.uid === p.uid)) return 'friend';
  await frRequest(p); return 'sent';
}
function pendAdd(x) {
  ME.pend = (ME.pend || []).filter(q => !(q.k === x.k && q.pid === x.pid));
  ME.pend.push({ ...x, t: Date.now() }); store('aow-me', ME);
}
// zkusí poslat odložené žádosti a pozvánky (volá se s načítáním žádostí)
async function pendFlush() {
  if (!ME.pend || !ME.pend.length) return;
  const keep = [];
  for (const q of ME.pend) {
    if (Date.now() - q.t > 30 * 864e5) continue;
    try {
      const p = await uidOfPid(q.pid);
      if (!p) { keep.push(q); continue; }
      if (q.k === 'fr' && !MYFR.some(f => f.uid === p.uid)) await frRequest(p);
      if (q.k === 'cl' && CLAN.tag === q.tag) await clanInvite(p);
      toasts.push({ a: { n: (q.k === 'fr' ? 'Žádost o přátelství odeslána: ' : 'Pozvánka do klanu odeslána: ') + p.n }, h: '📨 ODESLÁNO', l: 4 });
    } catch (e) { keep.push(q); }
  }
  ME.pend = keep; store('aow-me', ME);
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
    await pendFlush(); await msgPoll();
    const r = await fbGetA('freq/' + a.uid) || {};
    FRQ = {};
    for (const [uid, q] of Object.entries(r)) {
      if (q.acc || MYFR.some(f => f.uid === uid)) { frAdd({ uid, ...q }); await fbPut(`freq/${a.uid}/${uid}`, null).catch(() => {}); continue; }
      FRQ[uid] = q;
    }
    FRQN = Object.keys(FRQ).length;
    // pozvánky do klanu – nová pozvánka se ohlásí jednou
    const ci = await fbGetA('cinv/' + a.uid).catch(() => null) || {}, seen = ME.ci || 0;
    CINV = Object.fromEntries(Object.entries(ci).filter(([, q]) => q && q.tag && q.tag !== CLAN.tag)); CINVN = Object.keys(CINV).length;
    for (const q of Object.values(CINV)) if (q.t > seen) toasts.push({ a: { n: q.n + ' tě zve do klanu [' + q.tag + ']' }, h: '🛡 POZVÁNKA DO KLANU', l: 5 });
    if (CINVN) { ME.ci = Math.max(seen, ...Object.values(CINV).map(q => q.t)); store('aow-me', ME); }
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
  if (frView && frView.startsWith('chat:')) return renderChat(frView.slice(5));
  if (frView) return renderCompare(frView);
  const reqs = Object.entries(FRQ);
  b.innerHTML = `
    <div class="fr-me">Tvoje ID: <b class="bigcode" id="frMyId">${fmtId(ME.id)}</b> <button id="bFrCopy" class="ghost mini">📋 Kopírovat</button><br><small class="muted">Pošli ho kámošovi – podle něj tě najde. Jméno si změníš v Profilu.</small></div>
    <div class="row"><input id="frQ" maxlength="20" placeholder="Jméno nebo ID (BA-…)" autocomplete="off"><button id="bFrFind">🔍 Hledat</button></div>
    <p id="frMsg" class="muted">${msg || ''}</p>
    <div id="frRes"></div>
    ${CINVN ? `<div class="msec">🛡 Pozvánky do klanu</div>` + Object.entries(CINV).map(([uid, q]) => `<div class="friend"><span><b>${esc(q.n)}</b> zve do <span class="ctag">[${esc(q.tag)}]</span> ${esc(q.cn)}</span><span><button data-cyes="${uid}">🛡 Přidat se</button> <button class="ghost" data-cno="${uid}">✕</button></span></div>`).join('') : ''}
    ${reqs.length ? `<div class="msec">📨 Žádosti o přátelství</div>` + reqs.map(([uid, q]) => `<div class="friend"><span><b>${esc(q.n)}</b> <small>${fmtId(q.id)}</small></span><span><button data-yes="${uid}">✔ Přijmout</button> <button class="ghost" data-no="${uid}">✕</button></span></div>`).join('') : ''}
    <div class="msec">👥 Přátelé</div>
    ${MYFR.length ? MYFR.map(f => `<div class="friend"><span><b>${esc(f.n)}</b> <small>${fmtId(f.id)}</small></span><span><button data-chat="${f.uid}">💬${UNR[f.uid] ? ' <i class="badge-in">' + UNR[f.uid] + '</i>' : ''}</button> <button data-cmp="${f.uid}">📊 Porovnat</button> <button class="ghost" data-inv="${f.uid}">📨 Pozvat</button> <button class="ghost mini" data-del="${f.uid}" title="Odebrat z přátel">✕</button></span></div>`).join('')
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
  b.querySelectorAll('[data-cyes]').forEach(x => x.onclick = async () => { sfx('click'); try { await clanInvAnswer(x.dataset.cyes, true); renderFr('Jsi v klanu [' + CLAN.tag + '].'); } catch (e) { renderFr('❌ ' + e.message); } });
  b.querySelectorAll('[data-cno]').forEach(x => x.onclick = async () => { sfx('click'); await clanInvAnswer(x.dataset.cno, false); renderFr(); });
  b.querySelectorAll('[data-chat]').forEach(x => x.onclick = () => { sfx('click'); frView = 'chat:' + x.dataset.chat; renderFr(); });
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
// konverzace s přítelem; při otevřeném okně se nové zprávy vyzvedávají každých 5 s
let chatTimer = 0;
function renderChat(uid) {
  const b = $('frBody'), f = MYFR.find(x => x.uid === uid) || { n: 'Přítel' };
  delete UNR[uid]; store('aow-unr', UNR); if (typeof refreshHQ === 'function') refreshHQ();
  const L = MSG[uid] || [], tm = t => new Date(t).toLocaleString('cs', { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' });
  b.innerHTML = `<button id="bFrBack" class="ghost mini">← Zpět na přátele</button> <b>💬 ${esc(f.n)}</b>
    <div class="chat" id="chatLog">${L.length ? L.map(m => `<div class="cm ${m.o ? 'me' : ''}"><span>${esc(m.x)}</span><small>${tm(m.t)}</small></div>`).join('') : '<p class="muted">Zatím žádné zprávy. Napiš první!</p>'}</div>
    <div class="row"><input id="chatIn" maxlength="200" placeholder="Zpráva…" autocomplete="off"><button id="bChatSend">Poslat</button></div><p id="chatMsg" class="muted"></p>`;
  const log = $('chatLog'); log.scrollTop = log.scrollHeight;
  const send = async () => {
    const x = $('chatIn').value; if (!x.trim()) return;
    if (Date.now() - (send.t || 0) < 1500) return; send.t = Date.now();                    // ochrana proti zahlcení
    sfx('click'); $('bChatSend').disabled = true;
    try { await msgSend(uid, x); renderChat(uid); setTimeout(() => $('chatIn') && $('chatIn').focus(), 50); }
    catch (e) { $('chatMsg').textContent = '❌ ' + e.message; $('bChatSend').disabled = false; }
  };
  $('bChatSend').onclick = send; $('chatIn').onkeydown = e => { if (e.key === 'Enter') send(); };
  $('bFrBack').onclick = () => { sfx('click'); frView = null; renderFr(); };
  clearInterval(chatTimer);
  chatTimer = setInterval(async () => {
    if (frView !== 'chat:' + uid || $('friendsPanel').classList.contains('hidden')) { clearInterval(chatTimer); return; }
    if (await msgPoll().catch(() => 0)) { const v = $('chatIn') && $('chatIn').value; renderChat(uid); if (v) $('chatIn').value = v; }
  }, 5000);
}
function openFriends() { frView = null; openPanel('friendsPanel'); renderFr(); pubSync(true).then(() => { if (!frView) renderFr(); }); frPoll().then(() => { if (!frView) renderFr(); }); }
$('bFriends').onclick = () => { sfx('click'); openFriends(); };
setTimeout(() => { nameCheck().finally(() => pubSync()); frPoll(); }, 4000);
setInterval(() => { if (!role) frPoll(); }, 90000);
