// =====================================================================
//  TÝDENNÍ PŘEŽITÍ – nekonečné přežití se dvěma pravidly, která se losují podle týdne
//  (pro všechny hráče stejná). Vlastní žebříček týdne ve Firebase: /survw/<týden>/<uid>.
// =====================================================================
const WRULES = [
  { ic: '🚫', n: 'Bez věží', d: 'Nesmíš stavět věže.', m: { noTower: 1 } },
  { ic: '🗡️', n: 'Jen pěchota', d: 'Smíš vyrábět jen první jednotku věku.', m: { only: 0 } },
  { ic: '🏹', n: 'Jen střelci', d: 'Smíš vyrábět jen druhou jednotku věku (střelce).', m: { only: 1 } },
  { ic: '👹', n: 'Dvojnásobní bossové', d: 'Na každé bossí vlně přijde o bosse víc.', m: { boss2: 1 } },
  { ic: '💨', n: 'Rychlá horda', d: 'Nepřátelé běží o 30 % rychleji.', m: { fast: 1.3 } },
  { ic: '💰', n: 'Bohatý začátek', d: 'Začínáš s 1 500 zlata, ale za zabití dostaneš o 40 % méně.', m: { sgold: 1500, gm: 0.6 } },
  { ic: '🚷', n: 'Bez schopností', d: 'Schopnosti armády nejdou použít.', m: { noAbil: 1 } },
  { ic: '🔪', n: 'Skleněná armáda', d: 'Nepřátelé mají poloviční zdraví, ale útočí dvakrát silněji.', m: { glass: 1 } },
  { ic: '👥', n: 'Početné vlny', d: 'Vlny jsou o 50 % početnější.', m: { horde: 1.5 } },
];
// dvě pravidla týdne (nikdy dvě omezení jednotek najednou)
function weeklyRules(wk = weekKey()) {
  const r = seeded('wsurv' + wk), ids = WRULES.map((_, i) => i), pick = [];
  while (pick.length < 2 && ids.length) {
    const i = ids.splice((r() * ids.length) | 0, 1)[0];
    if (WRULES[i].m.only != null && pick.some(p => WRULES[p].m.only != null)) continue;
    pick.push(i);
  }
  return pick.map(i => WRULES[i]);
}
const WSURV = () => { const rules = weeklyRules(); return { n: 'Týdenní přežití', diff: 1, rules, mods: Object.assign({ endless: 1, weekly: 1 }, ...rules.map(r => r.m)) }; };
let wkNext = false, curWk = false;
const SURVW = load('aow-survw', { wk: '', best: 0, t: 0 });
const survwBest = () => SURVW.wk === weekKey() ? SURVW.best : 0;
// konec týdenní hry: rekord týdne do telefonu a do žebříčku
function survwEnd(V) {
  const w = Math.max(0, V.surv - 1), wk = weekKey();
  if (SURVW.wk !== wk) { SURVW.wk = wk; SURVW.best = 0; SURVW.t = 0; }
  if (w > SURVW.best) { SURVW.best = w; SURVW.t = Math.round(V.time); store('aow-survw', SURVW); toasts.push({ a: { n: `${w} ${w === 1 ? 'vlna' : w < 5 ? 'vlny' : 'vln'}` }, h: '🗓 REKORD TÝDNE', l: 4 }); }
  survwPush();
}
async function survwPush() {
  const a = await fbAuth().catch(() => null); if (!a || !survwBest()) return false;
  try { return (await fbFetch(`${FB.db}/survw/${weekKey()}/${a.uid}.json?auth=${a.t}`, { method: 'PUT', body: JSON.stringify({ n: (SET.name || 'Hráč').slice(0, 14), w: SURVW.best, t: SURVW.t, e: SET.emb || 0, ...lbClan() }) })).ok; } catch (e) { return false; }
}
async function survwFetch(wk = weekKey()) {
  const r = await fbFetch(`${FB.db}/survw/${wk}.json?orderBy=${encodeURIComponent('"w"')}&limitToLast=50`).then(r => r.json());
  return Object.entries(r || {}).filter(([, v]) => v && v.w != null).map(([uid, v]) => ({ uid, ...v })).sort((a, b) => b.w - a.w || a.t - b.t);
}
// panel: pravidla týdne, můj rekord, žebříček, hrát
async function renderWeek() {
  const b = $('weekBody'), rules = weeklyRules(), me = load('aow-fb', {}).uid;
  const next = new Date(); next.setDate(next.getDate() + ((8 - next.getDay()) % 7 || 7)); next.setHours(0, 0, 0, 0);
  const left = Math.max(0, Math.ceil((next - Date.now()) / 864e5));
  b.innerHTML = `<p class="muted">Nekonečné přežití se zvláštními pravidly. Každý týden jiná, pro všechny stejná – a vlastní žebříček od nuly. Nová pravidla za ${left} ${left === 1 ? 'den' : left < 5 ? 'dny' : 'dní'}.</p>
    <div class="wk-rules">${rules.map(r => `<div class="wk-rule"><span>${r.ic}</span><div><b>${r.n}</b><small>${r.d}</small></div></div>`).join('')}</div>
    <p>Tvůj rekord tohoto týdne: <b>${survwBest()}</b> ${survwBest() === 1 ? 'vlna' : survwBest() > 1 && survwBest() < 5 ? 'vlny' : 'vln'}</p>
    <div class="cb-btns"><button id="bWeekGo">🗓 Hrát</button></div>
    <h3>🏆 Žebříček týdne</h3><div id="weekLb"><p class="muted">Načítám…</p></div>`;
  $('bWeekGo').onclick = () => { $('weekPanel').classList.add('hidden'); cleanupNet(); survNext = true; wkNext = true; startGame('solo'); };
  try {
    await survwPush(); const L = await survwFetch();
    $('weekLb').innerHTML = L.length ? `<table class="bst lb"><tr><th>#</th><th>Hráč</th><th>Vln</th><th>Čas</th></tr>${L.map((p, i) => `<tr class="${p.uid === me ? 'me' : ''}"><td>${i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1}</td><td>${(EMBS[p.e] || {}).ic || ''} ${p.c ? `<small class="ctag">[${esc(p.c)}]</small> ` : ''}${esc(p.n)}</td><td><b>${p.w}</b></td><td>${fmtTime(p.t || 0)}</td></tr>`).join('')}</table>`
      : '<p class="muted">Tento týden zatím nikdo nehrál – buď první!</p>';
  } catch (e) { $('weekLb').innerHTML = '<p class="muted">Žebříček se nepodařilo načíst – jsi online?</p>'; }
}
$('bWeek').onclick = () => { sfx('click'); openPanel('weekPanel'); renderWeek(); };
function refreshWeekBtn() { const s = $('bWeek') && $('bWeek').querySelector('small'); if (s) s.textContent = weeklyRules().map(r => r.ic + ' ' + r.n).join(' · '); }
refreshWeekBtn();
