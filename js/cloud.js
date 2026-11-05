// =====================================================================
//  CLOUD – záloha postupu přes tajný kód (přenos do jiného telefonu / počítače) a KLANY
//  Obojí běží přes stejnou Firebase databázi jako online žebříček.
// =====================================================================
const CLOUD = load('aow-cloud', { code: '', t: 0 });
const BAK_SKIP = ['aow-fb', 'aow-cloud', 'aow-upd', 'aow-save'];          // přihlášení a technické věci se nepřenáší
const fbPut = async (path, data) => { const a = await fbAuth(); if (!a) throw new Error('Nepodařilo se přihlásit'); const r = await fbFetch(`${FB.db}/${path}.json?auth=${a.t}`, { method: data === null ? 'DELETE' : 'PUT', body: data === null ? undefined : JSON.stringify(data) }); if (!r.ok) throw new Error('Zápis odmítnut (' + r.status + ')'); return a; };
const fbGet = async path => { const r = await fbFetch(`${FB.db}/${path}.json`); if (!r.ok) throw new Error('Čtení selhalo (' + r.status + ')'); return r.json(); };
const fmtCode = c => c.slice(0, 4) + '-' + c.slice(4);

// ---------- záloha ----------
async function cloudBackup(quiet) {
  if (!CLOUD.code) { CLOUD.code = Array.from({ length: 8 }, () => 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'[(Math.random() * 31) | 0]).join(''); }
  const v = {};
  for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k.startsWith('aow-') && !BAK_SKIP.includes(k)) v[k] = localStorage.getItem(k); }
  await fbPut('bak/' + CLOUD.code, { t: Date.now(), n: SET.name || 'Hráč', v });
  CLOUD.t = Date.now(); store('aow-cloud', CLOUD); achId('cloud');
  if (!quiet) toasts.push({ a: { n: 'Kód pro obnovení: ' + fmtCode(CLOUD.code) }, h: '☁️ POSTUP ZÁLOHOVÁN', l: 5 });
}
async function cloudRestore(code) {
  code = code.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (code.length !== 8) throw new Error('Kód má 8 znaků (např. ABCD-EFGH)');
  const d = await fbGet('bak/' + code);
  if (!d || !d.v) throw new Error('Záloha s tímto kódem neexistuje');
  if (!confirm(`Obnovit postup hráče „${d.n}“ ze dne ${new Date(d.t).toLocaleString('cs')}? Současný postup v tomto zařízení se přepíše.`)) return;
  for (const [k, val] of Object.entries(d.v)) if (k.startsWith('aow-') && !BAK_SKIP.includes(k)) localStorage.setItem(k, val);
  localStorage.setItem('aow-cloud', JSON.stringify({ code, t: d.t }));
  location.reload();
}
function renderCloud() {
  const b = $('cloudBox'); if (!b) return;
  b.innerHTML = `<h3>☁️ Záloha postupu</h3>
    <p class="muted">Uloží celý postup (kampaň, generál, úkoly, úspěchy, nastavení…) na server. Kódem ho pak obnovíš v jiném telefonu nebo na počítači. Záloha se pak dělá sama po každé hře.</p>
    ${CLOUD.code ? `<p>Tvůj kód: <b class="bigcode">${fmtCode(CLOUD.code)}</b><br><small class="muted">Zapiš si ho – kdo ho zná, může si tvůj postup nahrát. Poslední záloha: ${CLOUD.t ? new Date(CLOUD.t).toLocaleString('cs') : '—'}</small></p>` : ''}
    <div class="row"><button id="bBak">${CLOUD.code ? '☁️ Zálohovat teď' : '☁️ Vytvořit zálohu'}</button></div>
    <div class="row"><input id="bakCode" maxlength="9" placeholder="KÓD ZÁLOHY" autocomplete="off" autocapitalize="characters"><button id="bRestore" class="ghost">Obnovit</button></div>
    <p id="cloudMsg" class="muted"></p>`;
  const msg = t => { $('cloudMsg').textContent = t; };
  $('bBak').onclick = async () => { sfx('click'); msg('Zálohuji…'); try { await cloudBackup(); renderCloud(); } catch (e) { msg('❌ ' + e.message); } };
  $('bRestore').onclick = async () => { sfx('click'); msg('Načítám…'); try { await cloudRestore($('bakCode').value); msg(''); } catch (e) { msg('❌ ' + e.message); } };
}
$('bGS').addEventListener('click', renderCloud);

// ---------- klany ----------
const CLAN = load('aow-clan', { tag: '' });
const weekKey2 = () => typeof weekKey === 'function' ? weekKey() : '';
const CLAN_GOAL = 20;                                    // týdenní klanová výzva: společně vyhrát 20 online soubojů
function clanMe() { clanRoll(); return { n: (SET.name || 'Hráč').slice(0, 14), r: Math.round(LB.r), w: LB.w, l: LB.l, sv: SURVB.best, wk: weekKey2(), ww: CLAN.ww && CLAN.wk === weekKey2() ? CLAN.ww : 0,
  pk: CLAN.pk || '', pp: CLAN.pp || 0, ppk: CLAN.ppk || '', ppp: CLAN.ppp || 0, t: Date.now() }; }
// KLANOVÁ VÁLKA: každý člen sbírá za týden body (online souboje, kampaň, přežití…), klany se řadí podle součtu
const prevWeek = () => typeof weekKey === 'function' ? weekKey(new Date(Date.now() - 7 * 864e5)) : '';
function clanRoll() { const wk = weekKey2(); if (CLAN.pk !== wk) { if (CLAN.pk === prevWeek()) { CLAN.ppk = CLAN.pk; CLAN.ppp = CLAN.pp || 0; } CLAN.pk = wk; CLAN.pp = 0; } }
function clanPts(n) {
  if (!CLAN.tag || !(n > 0)) return;
  clanRoll(); CLAN.pp = (CLAN.pp || 0) + n; store('aow-clan', CLAN);
  toasts.push({ a: { n: '+' + n + ' bodů pro [' + CLAN.tag + ']' }, h: '⚔ KLANOVÁ VÁLKA', l: 2.5 });
  clanSync();
}
// body za odehranou bitvu (volá record v meta.js)
function clanBattlePts(won, V) {
  if (specMode || tut) return 0;
  if (role !== 'solo' && !coop) return TEAM ? (won ? 6 : 2) : (won ? 10 : 2);
  if (curSurv) return Math.floor(Math.max(0, (V.surv || 1) - 1) / 10) * 2;
  if (!won) return 0;
  if (coop) return 4;
  if (V.camp != null) return curDef != null ? 2 : curHero != null ? 6 : 3;
  if (V.daily || V.chal != null) return 2;
  return [0, 1, 2, 3, 4][V.diff || 0];
}
// výsledky týdne pro všechny klany: tento a minulý týden
function clanWarScores(all) {
  const wk = weekKey2(), pw = prevWeek();
  return Object.entries(all || {}).filter(([, c]) => c && c.n && c.o).map(([tag, c]) => {
    const m = Object.values(c.m || {});
    const pts = k => m.reduce((s, x) => s + (x.pk === k ? x.pp || 0 : x.ppk === k ? x.ppp || 0 : 0), 0);
    return { tag, n: c.n, k: m.length, now: pts(wk), last: pts(pw) };
  });
}
async function clanSync() {
  if (!CLAN.tag || !FB.key) return;
  const a = await fbAuth(); if (!a) return;
  try { await fbFetch(`${FB.db}/clans/${CLAN.tag}/m/${a.uid}.json?auth=${a.t}`, { method: 'PUT', body: JSON.stringify(clanMe()) }); } catch (e) {}
}
// výhra v online souboji se počítá do týdenní klanové výzvy
function clanWin() { if (!CLAN.tag) return; if (CLAN.wk !== weekKey2()) { CLAN.wk = weekKey2(); CLAN.ww = 0; } CLAN.ww++; store('aow-clan', CLAN); clanSync(); }
async function clanCreate(name, tag) {
  tag = tag.toUpperCase().replace(/[^A-Z0-9]/g, ''); name = name.trim().slice(0, 20);
  if (tag.length < 2 || tag.length > 4) throw new Error('Zkratka klanu má 2–4 písmena nebo číslice');
  if (name.length < 3) throw new Error('Název klanu je moc krátký');
  if (await fbGet('clans/' + tag + '/o')) throw new Error('Klan [' + tag + '] už existuje');
  const a = await fbAuth(); if (!a) throw new Error('Nepodařilo se přihlásit');
  await fbPut('clans/' + tag, { n: name, o: a.uid, t: Date.now(), m: { [a.uid]: clanMe() } });
  CLAN.tag = tag; store('aow-clan', CLAN); achId('clanNew');
}
async function clanJoin(tag) {
  tag = tag.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const c = await fbGet('clans/' + tag + '/n'); if (!c) throw new Error('Klan [' + tag + '] neexistuje');
  CLAN.tag = tag; store('aow-clan', CLAN); await clanSync(); achId('clanJoin');
}
async function clanLeave() {
  const a = await fbAuth(); if (!a || !CLAN.tag) return;
  const own = await fbGet('clans/' + CLAN.tag + '/o');
  if (own === a.uid) { const m = await fbGet('clans/' + CLAN.tag + '/m'); if (m && Object.keys(m).length > 1) throw new Error('Jsi zakladatel – klan můžeš zrušit, až v něm zůstaneš sám'); await fbPut('clans/' + CLAN.tag, null); }
  else await fbPut('clans/' + CLAN.tag + '/m/' + a.uid, null);
  CLAN.tag = ''; store('aow-clan', CLAN);
}
async function renderClan() {
  const b = $('clanBody');
  b.innerHTML = '<p class="muted">Načítám…</p>';
  const msg = t => { const m = $('clanMsg'); if (m) m.textContent = t; };
  try {
    if (!CLAN.tag) {
      b.innerHTML = `<p class="muted">Klan = parta kámošů se společnou zkratkou v žebříčku, společným přehledem a týdenní klanovou výzvou.</p>
        ${typeof CINVN !== 'undefined' && CINVN ? '<h3>🛡 Pozvánky do klanu</h3>' + Object.entries(CINV).map(([uid, q]) => `<div class="friend"><span><b>${esc(q.n)}</b> zve do <span class="ctag">[${esc(q.tag)}]</span> ${esc(q.cn)}</span><span><button data-cyes="${uid}">🛡 Přidat se</button> <button class="ghost" data-cno="${uid}">✕</button></span></div>`).join('') : ''}
        <h3>Založit klan</h3><div class="row"><input id="clanName" maxlength="20" placeholder="Název klanu"><input id="clanTag" maxlength="4" placeholder="ZKR" style="max-width:90px" autocapitalize="characters"><button id="bClanNew">Založit</button></div>
        <h3>Přidat se ke klanu</h3><div class="row"><input id="clanJoinTag" maxlength="4" placeholder="ZKRATKA" autocapitalize="characters"><button id="bClanJoin">Přidat se</button></div>
        <p id="clanMsg" class="muted"></p>`;
      $('bClanNew').onclick = async () => { sfx('click'); msg('Zakládám…'); try { await clanCreate($('clanName').value, $('clanTag').value); renderClan(); } catch (e) { msg('❌ ' + e.message); } };
      $('bClanJoin').onclick = async () => { sfx('click'); msg('Hledám klan…'); try { await clanJoin($('clanJoinTag').value); renderClan(); } catch (e) { msg('❌ ' + e.message); } };
      b.querySelectorAll('[data-cyes]').forEach(x => x.onclick = async () => { sfx('click'); try { await clanInvAnswer(x.dataset.cyes, true); renderClan(); } catch (e) { msg('❌ ' + e.message); } });
      b.querySelectorAll('[data-cno]').forEach(x => x.onclick = async () => { sfx('click'); await clanInvAnswer(x.dataset.cno, false); renderClan(); });
      return;
    }
    await clanSync();
    const c = await fbGet('clans/' + CLAN.tag);
    if (!c) { CLAN.tag = ''; store('aow-clan', CLAN); return renderClan(); }
    const me = (await fbAuth() || {}).uid, wk = weekKey2();
    const mem = Object.entries(c.m || {}).map(([uid, v]) => ({ uid, ...v })).sort((x, y) => y.r - x.r);
    const ww = mem.reduce((n, m) => n + (m.wk === wk ? m.ww || 0 : 0), 0), pct = Math.min(100, Math.round(ww / CLAN_GOAL * 100));
    if (ww >= CLAN_GOAL) achId('clanGoal');
    b.innerHTML = `<div class="clan-head"><span class="ctag big">[${esc(CLAN.tag)}]</span> <b>${esc(c.n)}</b> <small class="muted">${mem.length} ${mem.length === 1 ? 'člen' : mem.length < 5 ? 'členové' : 'členů'}</small></div>
      <p class="muted">Kámoše pozveš tlačítkem níž, nebo ať v Hrát s kámoši → 🛡 Klan zadá zkratku <b>${esc(CLAN.tag)}</b>.</p>
      <button id="bClanInv">📨 Pozvat do klanu</button><div id="clanInvList"></div>
      <h3>🎯 Týdenní klanová výzva</h3><div class="q-row ${ww >= CLAN_GOAL ? 'ok' : ''}"><span>Vyhrajte společně ${CLAN_GOAL} online soubojů</span><small>${Math.min(ww, CLAN_GOAL)} / ${CLAN_GOAL}</small><i style="width:${pct}%"></i></div>
      ${(() => { const all = clanWarScores({ [CLAN.tag]: c })[0]; return `<h3>⚔ Klanová válka</h3><p class="muted">Tento týden má klan <b>${all.now}</b> bodů${all.last ? `, minulý týden ${all.last}` : ''}. Pořadí klanů je v Žebříčku → 🛡 Klany.</p>`; })()}
      <table class="bst lb"><tr><th>Člen</th><th>Hodnocení</th><th>V : P</th><th>Výher tento týden</th><th>⚔ Body týdne</th><th>♾ vln</th></tr>
      ${mem.map(m => `<tr class="${m.uid === me ? 'me' : ''}"><td>${m.uid === c.o ? '👑 ' : ''}${esc(m.n)}</td><td>${typeof leagueTag === 'function' ? leagueTag(m.r) : ''} <b>${m.r}</b></td><td>${m.w} : ${m.l}</td><td>${m.wk === wk ? m.ww || 0 : 0}</td><td>${m.pk === wk ? m.pp || 0 : 0}</td><td>${m.sv || 0}</td></tr>`).join('')}</table>
      <button id="bClanLeave" class="ghost">${c.o === me && mem.length <= 1 ? 'Zrušit klan' : 'Opustit klan'}</button><p id="clanMsg" class="muted"></p>`;
    // výběr, koho pozvat: přátelé a nedávní soupeři, kteří ještě nejsou v klanu
    $('bClanInv').onclick = () => {
      sfx('click');
      const box = $('clanInvList'), inClan = new Set(mem.map(m => m.uid));
      const L = [...MYFR.filter(f => !inClan.has(f.uid)).map(f => ({ uid: f.uid, n: f.n, k: '👥 přítel' })),
        ...FRIENDS.filter(f => !MYFR.some(x => x.pid === f.pid)).map(f => ({ pid: f.pid, n: f.n, k: 'nedávný soupeř' }))];
      box.innerHTML = L.length ? L.map((p, i) => `<div class="friend"><span><b>${esc(p.n)}</b> <small>${p.k}</small></span><button data-ci="${i}">📨 Pozvat</button></div>`).join('')
        : '<p class="muted">Nemáš koho pozvat – přidej si přátele (Velitelství → 👥 Přátelé) nebo si zahraj s někým online.</p>';
      box.querySelectorAll('[data-ci]').forEach(x => x.onclick = async () => {
        sfx('click'); x.disabled = true; x.textContent = '…';
        try { x.textContent = (await clanInvite(L[+x.dataset.ci])) === 'later' ? '⏳ Odešle se později' : '✔ Pozváno'; } catch (e) { x.textContent = '❌'; msg('❌ ' + e.message); }
      });
    };
    $('bClanLeave').onclick = async () => { if (!confirm('Opravdu opustit klan [' + CLAN.tag + ']?')) return; sfx('click'); try { await clanLeave(); renderClan(); } catch (e) { msg('❌ ' + e.message); } };
  } catch (e) { b.innerHTML = '<p class="muted">Klany se nepodařilo načíst – jsi online? (' + esc(e.message) + ')</p>'; }
}
// žebříček klanů (záložka v online žebříčku)
async function renderClanLb(box) {
  const tabs = box.innerHTML;
  try {
    const all = await fbGet('clans') || {}, wk = weekKey2();
    const list = Object.entries(all).filter(([, c]) => c && c.n && c.o).map(([tag, c]) => { const m = Object.values(c.m || {}); return { tag, n: c.n, k: m.length, w: m.reduce((s, x) => s + (x.w || 0), 0),
      r: m.length ? Math.round(m.reduce((s, x) => s + (x.r || 1000), 0) / m.length) : 0, ww: m.reduce((s, x) => s + (x.wk === wk ? x.ww || 0 : 0), 0) }; }).sort((a, b) => b.w - a.w || b.r - a.r);
    const war = clanWarScores(all).sort((a, b) => b.now - a.now), lastW = clanWarScores(all).filter(c => c.last > 0).sort((a, b) => b.last - a.last)[0];
    if (lastW && lastW.tag === CLAN.tag) achId('clanWar');
    const warHtml = `<h3>⚔ Klanová válka – tento týden</h3>
      <p class="muted">Body za týden sbírají všichni členové: online souboj výhra 10 / prohra 2, 2 na 2 výhra 6, kampaň 3 (hrdinská 6), proti počítači 1–4 podle obtížnosti, přežití 2 za každých 10 vln, výzvy 2.${lastW ? ` Vítěz minulého týdne: 🏆 <span class="ctag">[${esc(lastW.tag)}]</span> ${esc(lastW.n)} (${lastW.last} b.)` : ''}</p>
      <table class="bst lb"><tr><th>#</th><th>Klan</th><th>Členů</th><th>Body týdne</th></tr>
      ${war.filter(c => c.now > 0 || c.tag === CLAN.tag).map((c, i) => `<tr class="${c.tag === CLAN.tag ? 'me' : ''}"><td>${i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1}</td><td><span class="ctag">[${esc(c.tag)}]</span> ${esc(c.n)}</td><td>${c.k}</td><td><b>${c.now}</b></td></tr>`).join('') || '<tr><td colspan="4">Tento týden zatím nikdo nebojoval.</td></tr>'}</table>
      <h3>🏆 Celkově</h3>`;
    box.innerHTML = tabs + warHtml + `<p class="muted">Klany podle celkového počtu online výher svých členů.</p>
      <table class="bst lb"><tr><th>#</th><th>Klan</th><th>Členů</th><th>Výher</th><th>Ø hodnocení</th><th>Tento týden</th></tr>
      ${list.map((c, i) => `<tr class="${c.tag === CLAN.tag ? 'me' : ''}"><td>${i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1}</td><td><span class="ctag">[${esc(c.tag)}]</span> ${esc(c.n)}</td><td>${c.k}</td><td><b>${c.w}</b></td><td>${c.r}</td><td>${c.ww}</td></tr>`).join('') || '<tr><td colspan="6">Zatím žádný klan – založ první!</td></tr>'}</table>`;
  } catch (e) { box.innerHTML = tabs + '<p class="muted">Klany se nepodařilo načíst.</p>'; }
  box.querySelectorAll('.lb-tabs button').forEach(b => b.onclick = () => { lbTab = b.dataset.t; sfx('click'); renderLb(); });
}
$('bClan').onclick = () => { openPanel('clanPanel'); renderClan(); };
