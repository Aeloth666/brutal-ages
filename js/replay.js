// =====================================================================
//  ZÁZNAM BITVY
//  rec     = posledních 90 s plynule (15 snímků/s) – „sestřih“
//  recFull = celá bitva po 3 snímcích/s (události se slučují) – „celá bitva“
//  Po konci hry se záznam uloží do telefonu (Hrát sám → 🎬 Poslední bitva)
//  a sestřih jde poslat příteli ve zprávách (Firebase /rep/<uid>, jeden na hráče).
// =====================================================================
const REC_HZ = 15, REC_MAX = 90 * REC_HZ, FULL_EVERY = 5, FULL_MAX = 40 * 60 * (REC_HZ / FULL_EVERY);
let rec = [], recEv = [], recAcc = 0, recTail = 0, recFull = [], recFullEv = [], recN = 0;
let replay = null;                       // { src, hz, pos (snímek, desetinně), speed, cache, last }
let recView = null;                      // přehrává se uložený / poslaný záznam z menu (ne po bitvě)
function recReset() { rec = []; recEv = []; recAcc = 0; recTail = 0; recFull = []; recFullEv = []; recN = 0; }
function recPush(sn) {
  rec.push(sn); if (rec.length > REC_MAX) rec.shift();
  if (sn.E && sn.E.length) recFullEv.push(...sn.E);
  if (++recN % FULL_EVERY === 0 || sn.O >= 0) {
    recFull.push({ ...sn, E: recFullEv }); recFullEv = [];
    if (recFull.length > FULL_MAX) recFull.shift();
  }
}
// host a hra proti počítači nahrávají vlastní simulaci, připojený hráč přijaté snímky
function recTick(dt) {
  if (!S || replay || netWait || (paused && role === 'solo')) return;
  if (S.over >= 0) { if (recTail > 2.5) return; recTail += dt; } else recTail = 0;
  recAcc += dt;
  if (recAcc >= 1 / REC_HZ) { recAcc = 0; recPush(snap(recEv)); recEv = []; }
}
// from: undefined = posledních 20 s zpomaleně, 0 = sestřih od začátku, 'all' = celá bitva
function startReplay(from) {
  const full = from === 'all' && recFull.length > 10, src = full ? recFull : rec;
  if (src.length < 10) return;
  const hz = full ? REC_HZ / FULL_EVERY : (recView && recView.hz) || REC_HZ;
  const start = from === undefined ? Math.max(0, src.length - 20 * hz) : 0;
  replay = { src, hz, full, pos: start, speed: from === undefined ? 0.5 : full ? 2 : 1, cache: new Map(), last: Math.floor(start) - 1 };
  fx = []; pools = []; phMap.clear(); sfx('click');
}
const recFrame = i => { const R = replay; let v = R.cache.get(i); if (!v) { v = decode(R.src[i]); R.cache.set(i, v); if (R.cache.size > 60) R.cache.delete(R.cache.keys().next().value); } return v; };
function replayTick(dt) {
  const R = replay, end = R.src.length - 1;
  R.pos = Math.min(end, R.pos + dt * R.hz * R.speed);
  const i = Math.floor(R.pos);
  for (let k = R.last + 1; k <= i; k++) (R.src[k].E || []).forEach(addFx);   // efekty snímků, přes které se přešlo
  R.last = i;
  const a = R.pos - i, cur = recFrame(Math.min(end, i + 1)), prev = recFrame(i);
  return { ...lerpSnap(prev, cur, a), over: -1 };                          // během záznamu bez obrazovky konce
}
let replayBtns = [];
function drawReplay() {
  const R = replay, end = R.src.length - 1, y = 26;
  c.fillStyle = '#0e121c'; c.fillRect(0, 0, W, HUD);
  c.fillStyle = '#e5c04a'; c.fillRect(0, HUD - 3, W, 2);
  c.textAlign = 'left'; c.fillStyle = '#fde68a'; c.font = '900 20px system-ui'; c.fillText(R.full ? '🎬 CELÁ BITVA' : '🎬 ZÁZNAM', 20, y + 22);
  if (recView && recView.lbl) { c.font = '700 12px system-ui'; c.fillStyle = '#cbd5e1'; c.fillText(recView.lbl, 20, y + 42, 150); }
  // časová osa (klepnutím se dá přeskočit)
  const tx = 190, tw = 380;
  replayBar = { x: tx, y: y + 8, w: tw, h: 32 };
  rr(tx, y + 20, tw, 8, 4); c.fillStyle = '#334155'; c.fill();
  rr(tx, y + 20, tw * (R.pos / end), 8, 4); c.fillStyle = '#f59e0b'; c.fill();
  c.fillStyle = '#cbd5e1'; c.font = '700 13px system-ui';
  c.fillText(`-${fmtTime((end - R.pos) / R.hz)}`, tx + tw + 10, y + 29);
  const items = [['0,5×', 0.5], ['1×', 1], ['2×', 2], ['4×', 4], [R.full ? '⟲ Sestřih' : '⟲ Celá', R.full ? 'hi' : 'all'], ['✕ Konec', 'quit']];
  replayBtns = items.map(([t, k], i) => {
    const b = { x: 640 + i * 108, y: y + 4, w: 100, h: 42, k };
    const on = k === R.speed;
    rr(b.x, b.y, b.w, b.h, 9); c.fillStyle = k === 'quit' ? '#b91c1c' : on ? '#a16207' : '#334155'; c.fill();
    c.fillStyle = '#fff'; c.font = '800 16px system-ui'; c.textAlign = 'center'; c.fillText(t, b.x + b.w / 2, b.y + 27);
    return b;
  });
  if (R.pos >= end) { c.textAlign = 'center'; c.fillStyle = '#fde68a'; c.font = '900 26px system-ui'; c.fillText('KONEC ZÁZNAMU', W / 2, HUD + 60); }
}
let replayBar = null;
function replayClick(hit, px) {
  if (replayBar && hit(replayBar) && px != null) {            // skok na místo na časové ose
    const R = replay, f = Math.min(1, Math.max(0, (px - replayBar.x) / replayBar.w));
    R.pos = f * (R.src.length - 1); R.last = Math.floor(R.pos); fx = []; return;
  }
  for (const b of replayBtns) if (hit(b)) {
    sfx('click');
    if (b.k === 'quit') { replay = null; fx = []; if (recView) { recView = null; toMenu(); } }
    else if (b.k === 'all') startReplay('all');
    else if (b.k === 'hi') startReplay(0);
    else { replay.speed = b.k; if (replay.pos >= replay.src.length - 1) startReplay(replay.full ? 'all' : 0); }
  }
}

// ---------- uložení do telefonu (IndexedDB – localStorage by na záznam nestačil) ----------
const idb = (() => {
  let p = null;
  const db = () => p || (p = new Promise((res, rej) => { const r = indexedDB.open('aow', 1); r.onupgradeneeded = () => r.result.createObjectStore('kv'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); }));
  const tx = (mode, f) => db().then(d => new Promise((res, rej) => { const t = d.transaction('kv', mode), q = f(t.objectStore('kv')); t.oncomplete = () => res(q && q.result); t.onerror = () => rej(t.error); }));
  return { get: k => tx('readonly', s => s.get(k)), set: (k, v) => tx('readwrite', s => s.put(v, k)) };
})();
// komprese (gzip v prohlížeči); bez podpory se uloží obyčejný text
const gzOk = typeof CompressionStream !== 'undefined';
const gz = async s => new Uint8Array(await new Response(new Blob([s]).stream().pipeThrough(new CompressionStream('gzip'))).arrayBuffer());
const gunz = async u8 => new Response(new Blob([u8]).stream().pipeThrough(new DecompressionStream('gzip'))).text();
const u8b64 = u8 => { let s = ''; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return btoa(s); };
const b64u8 = b => Uint8Array.from(atob(b), ch => ch.charCodeAt(0));
async function packRep(o) { const s = JSON.stringify(o); return gzOk ? { z: u8b64(await gz(s)) } : { s }; }
async function unpackRep(p) { return JSON.parse(p.z ? await gunz(b64u8(p.z)) : p.s); }

let recLast = null;                      // popis posledního uloženého záznamu (pro menu)
function recLabel() {
  if (tut) return null;
  return curCamp != null ? '🗺 ' + (curDef != null ? 'Obrana: ' : curHero != null ? 'Hrdinská: ' : '') + CAMP[curCamp].n
    : curSurv ? (curWk ? '🗓 Týdenní přežití' : '♾ Přežití') : curChal != null ? '🎯 ' + CHAL[curChal].n : curDaily ? '📅 Denní výzva'
    : role === 'solo' ? '⚔ Proti počítači' : '🌐 ' + (OPP.n ? 'vs ' + OPP.n : 'Online');
}
// volá toMenu – po odehrané bitvě (alespoň 30 s) uloží záznam jako „poslední bitvu“
function recSave() {
  if (recView || rec.length < 30 * REC_HZ / 2) return;
  const lbl = recLabel(); if (!lbl) return;
  const last = rec[rec.length - 1], win = last && last.O >= 0 ? (last.O === mySide ? 1 : 0) : -1;
  const meta = { lbl, t: Date.now(), win, dur: last ? last.Tm : 0 };
  const data = { v: 1, gv: GAME_VER, side: mySide, field: FIELD, lbl, hz: REC_HZ, hi: rec, full: recFull };
  recLast = meta;
  packRep(data).then(p => idb.set('lastRep', { meta, ...p })).catch(() => {});
  try { localStorage.setItem('aow-replast', JSON.stringify(meta)); } catch (e) {}
}
// přehrání záznamu z menu (vlastního nebo od přítele)
function recPlay(d) {
  if (!d || !d.hi || d.hi.length < 10) { toasts.push({ a: { n: 'Záznam je prázdný nebo poškozený' }, h: '🎬 ZÁZNAM', l: 3 }); return; }
  cleanupNet();
  document.querySelectorAll('.overlay:not(#rotate)').forEach(o => o.classList.add('hidden'));
  role = 'solo'; S = null; tut = null; paused = false; mySide = d.side | 0; mirror = mySide === 1; uiMode = 'units';
  setField(d.field); fx = []; phMap.clear();
  rec = d.hi; recFull = d.full || [];
  recView = { lbl: d.lbl + (d.from ? ' · ' + d.from : ''), hz: d.hz || REC_HZ };
  V = decode(rec[0]);
  startReplay(0);
}
async function recOpenLast() {
  try { const p = await idb.get('lastRep'); if (!p) throw 0; recPlay(await unpackRep(p)); }
  catch (e) { toasts.push({ a: { n: 'Zatím není uložená žádná bitva' }, h: '🎬 ZÁZNAM', l: 3 }); }
}
// sestřih (posledních 90 s, 7,5 snímku/s) nahraje na server – přítel si ho přehraje ze zprávy
async function recShare() {
  const p = await idb.get('lastRep'); if (!p) throw new Error('Nejdřív odehraj bitvu');
  const d = await unpackRep(p), hi = [];
  let ev = [];
  d.hi.forEach((f, i) => { if (f.E) ev.push(...f.E); if (i % 2 === 1 || i === d.hi.length - 1) { hi.push({ ...f, E: ev }); ev = []; } });
  const pk = await packRep({ v: 1, gv: GAME_VER, side: d.side, field: d.field, lbl: d.lbl, hz: (d.hz || REC_HZ) / 2, hi, full: [] });
  if (!pk.z || pk.z.length > 590000) throw new Error('Záznam je moc velký na odeslání');
  const a = await fbAuth(); if (!a) throw new Error('Nepodařilo se přihlásit');
  const r = await fbFetch(`${FB.db}/rep/${a.uid}.json?auth=${a.t}`, { method: 'PUT', body: JSON.stringify({ z: pk.z, n: (SET.name || 'Hráč').slice(0, 14), l: String(d.lbl).slice(0, 60), t: { '.sv': 'timestamp' } }) });
  if (!r.ok) throw new Error(r.status === 401 ? 'Server zatím záznamy nepřijímá (pravidla)' : 'Nahrání selhalo (' + r.status + ')');
  return d.lbl;
}
async function recFetch(uid) {
  const r = await fbGetA('rep/' + uid); if (!r || !r.z) throw new Error('Záznam už není k dispozici');
  const d = await unpackRep(r); d.from = r.n; return d;
}
$('bLastRep').onclick = () => { sfx('click'); recOpenLast(); };
function refreshLastRep() {
  const m = recLast || load('aow-replast', null), b = $('bLastRep'); if (!b) return;
  b.classList.toggle('hidden', !m);
  if (m) b.querySelector('small').textContent = m.lbl + (m.win === 1 ? ' · výhra' : m.win === 0 ? ' · prohra' : '') + ' · ' + fmtTime(m.dur || 0);
}
refreshLastRep();
