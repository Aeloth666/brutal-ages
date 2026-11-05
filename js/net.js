// =====================================================================
//  SÍŤ (PeerJS / WebRTC)
// =====================================================================
// STUN zjistí veřejnou adresu; TURN (relay) přenáší data, když se telefony přímo nespojí –
// typicky mobilní data za CGNAT operátora. Veřejný relay PeerJS zanikl (doména už neexistuje),
// proto sem patří přístup k vlastnímu TURN serveru (např. Metered nebo ExpressTURN, oba mají bezplatný tarif).
const TURN = [
  // ExpressTURN – bezplatný tarif (jen port 3478, UDP i TCP)
  { urls: ['turn:free.expressturn.com:3478', 'turn:free.expressturn.com:3478?transport=tcp'], username: '000000002108986961', credential: 'c82oF4+w73EReiEVo4CbNvwMJlo=' },
];
const ICE = { iceServers: [
  { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] },
  { urls: 'stun:global.stun.twilio.com:3478' },
  ...TURN] };
let peer = null, conn = null;
// hostitel drží spojení se všemi hráči (souboj a co-op 1, 2 na 2 až 3): { c, slot, side, info, lastRx, away, lost, rm }
let conns = [], TEAM = false, GSIDE = 1, rmInfo = null, MYMEM = 0;   // MYMEM: kolikátý jsem hráč svého týmu (0/1)
// diváci: dostávají jen obraz hry, nic neovládají (hostitel jich může mít víc)
let specs = [], specMode = false;
// relace pro návrat po výpadku, info o soupeři, stav odvety
let SESS = null, HOST_ID = null, OPP = { n: null, col: null };
let lastRx = 0, oppAway = false, netLostAt = 0, waitSince = 0, reconTry = 0, netWait = false;
let rmMe = false, rmOpp = false;
const WAIT_MAX = 120;                       // s – jak dlouho čekat na návrat soupeře

function status(html) { document.getElementById('status').innerHTML = html; }
function mkCode() {
  const a = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 5 }, () => a[(Math.random() * a.length) | 0]).join('');
}
function cleanupNet() {
  for (const k of conns) try { k.c && k.c.close(); } catch (e) {}
  for (const s of specs) try { s.close(); } catch (e) {}
  specs = [];
  try { conn && conn.close(); } catch (e) {}
  try { peer && peer.destroy(); } catch (e) {}
  peer = conn = null; conns = []; TEAM = false; rmInfo = null;
  netLostAt = waitSince = 0; oppAway = false; netWait = false;
}
function sendTo(k, m) { if (k.c && k.c.open) try { k.c.send(m); } catch (e) {} }
function send(m) {
  if (conns.length) for (const k of conns) sendTo(k, m);
  else if (conn && conn.open) try { conn.send(m); } catch (e) {}
  for (const s of specs) if (s.open) try { s.send(m); } catch (e) {}
}
const specStart = () => ({ t: 'start', sess: SESS, ...hello(), coop, camp: HOSTOPT.camp, field: FIELD, side: 0, team: TEAM, spec: 1 });
const hello = () => ({ n: SET.name || 'Hráč', col: SET.col || 0, pid: SET.pid, af: cleanAf(SET.af), emb: SET.emb || 0, lvl: profLevel(), skin: SET.skin || 0, rating: Math.round(LB.r) });
// oblíbené národy hráče: použijí se na začátku hry a po každé evoluci (dá se změnit během výběru)
function setPrefs(p, af) { p.pref = cleanAf(af); p.prefSet = 1; setAgeFac(p, p.pref[p.age]); p.pick = FAC_PICK; }

// připojený hráč: jediné spojení k hostiteli
function bindConn(c) {
  conn = c;
  c.on('data', m => { if (c === conn) { lastRx = performance.now(); onData(m); } });
  c.on('close', () => { if (c === conn) lost(); });
  c.on('error', () => { if (c === conn) lost(); });
}
// hostitel: spojení s jedním z hráčů
function bindHost(k) {
  const c = k.c;
  c.on('data', m => { if (c === k.c) { k.lastRx = lastRx = performance.now(); onData(m, k); } });
  c.on('close', () => { if (c === k.c) lostK(k); });
  c.on('error', () => { if (c === k.c) lostK(k); });
}
function lostK(k) {
  if (!role) { conns = conns.filter(x => x !== k); lobbyUpdate(); return; }     // odešel z čekárny
  if (V && V.over >= 0) { toMenu((k.info.n || 'Hráč') + ' odešel ze hry.'); return; }
  k.c = null; if (!k.lost) k.lost = performance.now();
}

// co-op = oba hráči na jedné straně (společná pokladna) proti počítači; team = 2 na 2
let coop = false, HOSTOPT = { coop: false, camp: null, team: false };
function hostGame(opt = {}) {
  cleanupNet();
  document.getElementById('mpPanel').classList.remove('hidden');
  HOSTOPT = { coop: !!opt.coop, camp: opt.camp ?? null, team: !!opt.team, hside: 0, bot: true };   // hside: tým hostitele v 2 na 2, bot: počítač doplní menší tým
  const code = mkCode();
  SESS = mkCode() + mkCode();
  status('Vytvářím hru…');
  peer = new Peer(PREFIX + code, { config: ICE, debug: 0 });
  hostGame.code = code;
  const what = HOSTOPT.camp != null ? `Co-op mise „${CAMP[HOSTOPT.camp].n}“` : HOSTOPT.coop ? 'Co-op proti počítači' : HOSTOPT.team ? '2 na 2' : 'Souboj';
  peer.on('open', () => { if (!role) { if (HOSTOPT.team) lobbyUpdate(); else status(`${what} · kód hry: <b>${code}</b><br>Pošli ho kámošovi a čekej na připojení…`); } });
  peer.on('connection', c => {
    const md = c.metadata || {};
    if (md.spec) {                                      // divák
      c.on('open', () => { specs.push(c); if (role === 'host') try { c.send(specStart()); } catch (e) {} else try { c.send({ t: 'specwait' }); } catch (e) {} });
      c.on('close', () => { specs = specs.filter(x => x !== c); });
      return;
    }
    // návrat hráče po výpadku – musí znát kód relace (a své id)
    const back = role === 'host' && md.sess === SESS ? (conns.find(k => k.info.pid && k.info.pid === md.pid) || (!HOSTOPT.team && conns[0])) : null;
    if (back) {
      try { back.c && back.c.close(); } catch (e) {}
      back.c = c; bindHost(back);
      c.on('open', () => { if (c !== back.c) return; back.lost = 0; back.away = false; back.lastRx = performance.now(); sendTo(back, { t: 'hi', ...hello() }); });
      return;
    }
    const max = HOSTOPT.team ? 3 : 1;
    if (role || conns.length >= max) { c.on('open', () => c.close()); return; }
    const slot = conns.length + 1;
    const side = HOSTOPT.coop || HOSTOPT.camp != null ? 0 : HOSTOPT.team ? lobbyFree() : 1;   // 2 na 2: do menšího týmu
    const k = { c, slot, side, info: {}, lastRx: performance.now(), away: false, lost: 0, rm: false };
    conns.push(k); bindHost(k);
    c.on('open', () => {
      if (c !== k.c) return;
      k.lastRx = performance.now();
      if (HOSTOPT.team) { sendTo(k, { t: 'hi', ...hello() }); lobbyUpdate(); }
      else startGame('host', null, HOSTOPT.camp);
    });
  });
  peer.on('disconnected', () => { try { peer.reconnect(); } catch (e) {} });
  peer.on('error', e => {
    if (e.type === 'unavailable-id' && !role) hostGame(opt);
    else if (!role) status('Chyba spojení: ' + e.type);
  });
}
// čekárna 2 na 2: hostitel vidí týmy, může hráče (i sebe) přesouvat a spouští hru; hosté si o přesun řeknou tlačítkem
const lobbyCnt = s => (HOSTOPT.hside === s ? 1 : 0) + conns.filter(k => k.side === s).length;
const lobbyFree = () => lobbyCnt(0) <= lobbyCnt(1) ? 0 : 1;
function lobbyMove(id) {                                // id 0 = hostitel, jinak slot hosta
  const k = id ? conns.find(x => x.slot === id) : null, cur = id ? k && k.side : HOSTOPT.hside;
  if (cur == null || lobbyCnt(1 - cur) >= 2) return;
  if (id) k.side = 1 - cur; else HOSTOPT.hside = 1 - cur;
  sfx('click'); lobbyUpdate();
}
function lobbyUpdate() {
  if (!HOSTOPT.team || role) return;
  const pl = [{ n: SET.name || 'Hráč', side: HOSTOPT.hside, id: 0 }, ...conns.map(k => ({ n: k.info.n || '…', side: k.side, id: k.slot }))];
  const cnt = s => pl.filter(p => p.side === s).length, bot = HOSTOPT.bot && pl.length === 3;
  const team = s => (pl.filter(p => p.side === s).map(p => `<span class="lp">${esc(p.n)}${cnt(1 - s) < 2 ? ` <button class="mini" data-mv="${p.id}" title="Přesunout do druhého týmu">⇄</button>` : ''}</span>`).join(' ') || '<i>nikdo</i>')
    + (bot && cnt(s) === 1 ? ' <span class="lp">🤖 počítač</span>' : '');
  const ok = cnt(0) >= 1 && cnt(1) >= 1;
  status(`2 na 2 · kód hry: <b>${hostGame.code}</b><br>
    <span class="lobby"><span>🔵 Tým A: ${team(0)}</span><span>🔴 Tým B: ${team(1)}</span></span>
    ${pl.length === 3 ? `<button id="bLobbyBot" class="ghost">🤖 Počítač doplní menší tým: ${HOSTOPT.bot ? 'ZAP' : 'VYP'}</button><br>` : ''}
    ${!conns.length ? 'Pošli kód kámošům (až 3) a čekej…' : ok ? `<button id="bLobbyGo">Spustit hru (${pl.length} hráči)</button>` : '<small>Každý tým potřebuje aspoň jednoho hráče.</small>'}`);
  const b = document.getElementById('bLobbyGo'); if (b) b.onclick = () => startGame('host');
  const bb = document.getElementById('bLobbyBot'); if (bb) bb.onclick = () => { HOSTOPT.bot = !HOSTOPT.bot; sfx('click'); lobbyUpdate(); };
  document.querySelectorAll('#status [data-mv]').forEach(x => x.onclick = () => lobbyMove(+x.dataset.mv));
  send({ t: 'lobby', pl: pl.map(({ n, side }) => ({ n, side })), bot });
}

function joinGame(code, spec) {
  code = code.trim().toUpperCase();
  if (code.length !== 5) { status('Zadej 5místný kód.'); return; }
  cleanupNet();
  document.getElementById('mpPanel').classList.remove('hidden');
  HOST_ID = PREFIX + code;
  status('Připojuji…');
  peer = new Peer({ config: ICE, debug: 0 });
  peer.on('open', () => {
    if (role) return;                       // opětovná registrace během hry – řeší guestRecon
    const c = peer.connect(HOST_ID, { reliable: true, serialization: 'json', metadata: spec ? { spec: 1 } : undefined });
    bindConn(c);
    c.on('open', () => { status(spec ? '👁 Připojeno jako divák, čekám na začátek hry…' : 'Připojeno, startuje se…'); if (!spec) send({ t: 'hi', ...hello() }); });
    setTimeout(() => { if (conn === c && !c.open && !role) status('Nepodařilo se spojit. Zkus to znovu nebo jinou síť.'); }, 20000);
  });
  peer.on('disconnected', () => { try { peer.reconnect(); } catch (e) {} });
  peer.on('error', e => {
    if (role) return;
    status(e.type === 'peer-unavailable' ? 'Hra s tímto kódem neexistuje.' : 'Chyba spojení: ' + e.type);
  });
}

// připojený hráč se po výpadku zkouší vrátit do stejné hry
function guestRecon() {
  if (role !== 'guest' || !netLostAt) return;
  try {
    if (!peer || peer.destroyed) {
      peer = new Peer({ config: ICE, debug: 0 });
      peer.on('error', () => {});
      peer.on('disconnected', () => { try { peer.reconnect(); } catch (e) {} });
      return;
    }
    if (peer.disconnected) { peer.reconnect(); return; }
    if (!peer.open) return;
    const c = peer.connect(HOST_ID, { reliable: true, serialization: 'json', metadata: { sess: SESS, pid: SET.pid } });
    bindConn(c);
    c.on('open', () => {
      if (c !== conn) { c.close(); return; }
      netLostAt = 0; lastRx = performance.now();
      send({ t: 'hi', ...hello() });
    });
  } catch (e) {}
}

const infoOf = m => ({ n: m.n, col: m.col, pid: m.pid, af: cleanAf(m.af), emb: m.emb | 0, lvl: m.lvl | 0, skin: Math.min(SKINS.length - 1, m.skin | 0), rating: Math.max(100, Math.min(4000, +m.rating || 1000)) });
function onData(m, k) {
  if (!m) return;
  switch (m.t) {
    case 'c': if (role === 'host' && k) applyCmd(k.side, m.c, k.mem); break;
    case 's': if (role === 'guest') onSnap(m.d); break;
    case 'start':
      if (role === 'host' || k) break;
      specMode = !!m.spec; if (specMode) achId('spect');
      SESS = m.sess; OPP = infoOf(m); if (!specMode) rememberFriend(OPP); coop = !!m.coop; TEAM = !!m.team; GSIDE = m.side ?? (coop ? 0 : 1); MYMEM = m.mem | 0; setField(m.field);
      startGame('guest', null, m.camp ?? null);
      send({ t: 'hi', ...hello() }); partySend();
      break;
    case 'hi':
      if (k) {                                           // hostitel: údaje o hráči na tomto spojení
        k.info = infoOf(m); rememberFriend(k.info);
        if (!TEAM && !HOSTOPT.team) OPP = k.info;
        else if (k.side === 1 && !conns.some(x => x.side === 1 && x.slot < k.slot)) OPP = k.info;
        if (role === 'host' && S && !coop && k.side === 1 && !S.pl[1].prefSet) { setPrefs(S.pl[1], k.info.af); S.pl[1].emb = k.info.emb; }
        lobbyUpdate();
      } else { OPP = infoOf(m); rememberFriend(OPP); }
      break;
    case 'lobby': {
      if (role) break;
      const cnt = s => m.pl.filter(p => p.side === s).length, team = s => m.pl.filter(p => p.side === s).map(p => esc(p.n)).join(', ') + (m.bot && cnt(s) === 1 && m.pl.length === 3 ? ', 🤖 počítač' : '');
      status(`Připojeno k 2 na 2. Čekáme, až hostitel spustí hru…<br><span class="lobby"><span>🔵 Tým A: ${team(0)}</span><span>🔴 Tým B: ${team(1)}</span></span>
        <button id="bLobbySwap" class="ghost">⇄ Přejít do druhého týmu</button>`);
      const b = document.getElementById('bLobbySwap'); if (b) b.onclick = () => { sfx('click'); send({ t: 'team' }); };
      break;
    }
    case 'team': if (k && !role && HOSTOPT.team) lobbyMove(k.slot); break;
    case 'party': partyMerge(m.r); if (role && !coop && !TEAM && OPP.pid) curTour = tourPending(SET.pid, OPP.pid); break;
    case 'away': if (k) k.away = !!m.v; else oppAway = !!m.v; break;
    case 'chat':
      if (k) {                                           // hostitel zprávu ukáže a přepošle ostatním
        showChat(k.side, m.i, 'p' + k.slot);
        for (const x of conns) if (x !== k) sendTo(x, { t: 'chat', i: m.i, side: k.side, who: k.slot });
      } else if (m.side != null) showChat(m.side, m.i, 'p' + m.who);
      else showChat(coop ? mySide : 1 - mySide, m.i, 'opp');
      break;
    case 'rm':
      sfx('click');
      if (k) { k.rm = true; hostRmCheck(); } else rmOpp = true;
      break;
    case 'rmc': rmInfo = { n: m.n | 0, of: m.of | 0 }; break;
    case 'specwait': if (!role) status('👁 Připojeno jako divák – hra ještě nezačala, čekám…'); break;
    case 'bst': if (!k) lastBst = m.d; break;
    case 'emo':
      if (k) { showEmote(k.side, m.i | 0); for (const x of conns) if (x !== k) sendTo(x, { t: 'emo', i: m.i, side: k.side }); }
      else showEmote(m.side ?? 1 - mySide, m.i | 0);
      break;
  }
}
// odveta: hostitel začne, až jsou připraveni všichni
function hostRmCheck() {
  const ready = (rmMe ? 1 : 0) + conns.filter(k => k.rm).length, of = conns.length + 1;
  rmOpp = conns.every(k => k.rm); rmInfo = { n: ready, of };
  send({ t: 'rmc', n: ready, of });
  if (rmMe && rmOpp) hostRestart();
}

// hostitel spouští další hru: v co-op kampani po výhře rovnou další misi
function hostRestart() {
  let camp = HOSTOPT.camp;
  if (coop && camp != null && V && V.over === 0 && camp + 1 < CAMP.length) camp = HOSTOPT.camp = camp + 1;
  startGame('host', null, camp);
}

function lost() {
  if (role !== 'host' && role !== 'guest') return;
  if (V && V.over >= 0) { toMenu('Soupeř odešel ze hry.'); return; }
  conn = null;
  if (!netLostAt) netLostAt = performance.now();
}

// stav sítě se vyhodnocuje každý snímek: host při výpadku kohokoli zastaví simulaci
function netTick(now) {
  if (role !== 'host' && role !== 'guest') {
    netWait = false;
    if (conn && conn.open && now - (netTick.ping || 0) > 1000) { netTick.ping = now; send({ t: 'p' }); }   // připojený v čekárně
    if (HOSTOPT.team && conns.some(k => now - k.lastRx > 8000)) {                                          // hostitel: zamrzlé odstraní
      for (const k of conns) if (now - k.lastRx > 8000) try { k.c && k.c.close(); } catch (e) {}
      conns = conns.filter(k => now - k.lastRx <= 8000);
      conns.forEach((k, i) => { k.slot = i + 1; });                          // týmy zůstávají, jak si je hráči zvolili
      lobbyUpdate();
    }
    return;
  }
  if (role === 'host') {
    const L = conns.find(k => k.lost);
    netLostAt = L ? L.lost : 0; oppAway = conns.some(k => k.away);
  }
  // krátké zakolísání mobilní sítě (do ~6 s) hru nezastaví, teprve delší ticho znamená výpadek
  const stale = role === 'host' ? conns.some(k => now - k.lastRx > 6500) : now - lastRx > 5500;
  const w = !!netLostAt || oppAway || stale || (role === 'guest' && V && V.wait);
  if (w && !netWait) waitSince = now;
  netWait = w;
  if (w && V && V.over < 0 && now - waitSince > WAIT_MAX * 1000) { toMenu('Soupeř se nevrátil, hra skončila.'); return; }
  if (role === 'guest') {
    if (netLostAt && now - reconTry > 5000) { reconTry = now; guestRecon(); }
    if (!netLostAt && now - (netTick.ping || 0) > 1000) { netTick.ping = now; send({ t: 'p' }); }
  }
}
document.addEventListener('visibilitychange', () => {
  if (role === 'host' || role === 'guest') send({ t: 'away', v: document.hidden ? 1 : 0 });
});

// =====================================================================
//  STAV KLIENTA
// =====================================================================
let role = null, mySide = 0, mirror = false, V = null, uiMode = 'units';
let acc = 0, sendAcc = 0, netEv = [], fx = [];
let snapPrev = null, snapCur = null, snapT = 0;
const phMap = new Map();
let curChal = null, curCamp = null, curDaily = false;

function startGame(r, chal = null, camp = null, daily = false) {
  rematchN = r !== 'solo' && role === r ? rematchN + 1 : 0;
  curTour = r !== 'solo' && OPP.pid ? tourPending(SET.pid, OPP.pid) : null;
  baseHp = null;
  if (r === 'solo') coop = TEAM = false; else if (r === 'host') { coop = HOSTOPT.coop || HOSTOPT.camp != null; TEAM = HOSTOPT.team; }
  role = r; mySide = r === 'guest' ? GSIDE : r === 'host' && TEAM ? HOSTOPT.hside : 0; mirror = mySide === 1;
  document.querySelectorAll('.overlay:not(#rotate)').forEach(o => o.classList.add('hidden'));
  uiMode = 'units'; fx = []; netEv = []; phMap.clear();
  snapPrev = snapCur = null; V = null;
  paused = false; endDone = false; chatOpen = false; bubbles = []; pools = [];
  recReset(); recView = null; replay = null; evtBanner = null; shake = 0; bloodCode = null; bloodCodeUsed = false; splats = [];
  rmMe = rmOpp = false; rmInfo = null; lastRx = performance.now(); netLostAt = 0; oppAway = false;
  for (const k of conns) { k.rm = false; k.lastRx = lastRx; }
  if (r !== 'guest') { S = newState(); acc = 0; aiWant = null; aiT = 1; aiEvoT = 0; aiBroke = 0; }
  if (r === 'guest' && camp != null) { curCamp = camp; if (SET.weather !== 'real') wxForce(CAMP[camp].wx); }
  curDef = r === 'solo' && camp != null && defNext === camp ? camp : null; defNext = null;   // obrana dobytého území
  curHero = r === 'solo' && camp != null && curDef == null && heroNext === camp ? camp : null; heroNext = null;   // hrdinská obtížnost
  heroM = curHero != null ? heroMission(camp) : null;
  curSurv = r === 'solo' && survNext && chal == null && camp == null; survNext = false;
  lastBst = null;
  if (r === 'solo' || (r === 'host' && coop)) {
    curChal = chal; curCamp = camp; curDaily = daily;
    const ch = chal != null ? CHAL[chal] : camp != null ? (curDef != null ? defMission(camp) : heroM || CAMP[camp]) : daily ? DAILY : curSurv ? SURV : null, di = ch ? ch.diff : SET.diff, D = DIFF[di];
    S.diff = di; Object.assign(S.pl[1], { gm: D.gm, xm: D.xm, gold: D.gold });
    if (ch) {
      const M = S.mods = ch.mods, me = S.pl[0], e = S.pl[1];
      S.chal = chal; S.camp = camp; S.daily = daily ? 1 : 0;
      // mise v pozdějším věku: oba začínají v něm, se zlatem a zkušenostmi toho věku
      const toAge = (p, a) => { p.age = a; p.hp = p.mhp = AGES[a].baseHp; p.xp = AGES[a - 1].xp; p.gold = AGE_GOLD[a]; };
      if (M.age) { toAge(me, M.age); toAge(e, M.age); e.gold = Math.round(AGE_GOLD[M.age] * D.gold / START_GOLD); }
      if (M.gold != null) me.gold = M.gold;
      if (M.eGold) e.gold += M.eGold;
      if (M.gm) me.gm = M.gm;
      if (M.eAge) { e.age = M.eAge; e.hp = e.mhp = AGES[M.eAge].baseHp; }
      if (M.eHp) { e.hp *= M.eHp; e.mhp *= M.eHp; }
    }
    if ((camp != null || daily) && SET.weather !== 'real') wxForce(ch.wx);
  }
  if (r === 'host' && coop) { const e = S.pl[1]; e.gm *= 1.3; e.xm *= 1.2; e.gold = Math.round(e.gold * 1.5); }   // dva hráči = silnější počítač
  if (r !== 'guest') {
    setPrefs(S.pl[0], SET.af); S.pl[0].emb = SET.emb || 0;
    if (r === 'host' && !coop) { const e1 = conns.find(k => k.side === 1); if (e1 && e1.info.pid) { setPrefs(S.pl[1], e1.info.af); S.pl[1].emb = e1.info.emb || 0; } }
    else setPrefs(S.pl[1], Array.from({ length: 5 }, () => (Math.random() * 4) | 0));   // počítač má náhodné národy
    S.bot = null;
    if (r === 'host') {                                 // dva hráči na jedné straně: každý má své zlato a svůj národ
      MYMEM = 0;
      const hs = TEAM ? HOSTOPT.hside : 0;
      const memOf = s => (hs === s ? [{ af: SET.af, emb: SET.emb || 0 }] : []).concat(conns.filter(k => k.side === s).sort((a, b) => a.slot - b.slot).map(k => ({ af: k.info.af, emb: k.info.emb | 0, k })));
      const L = [memOf(0), memOf(1)];
      for (const s of [0, 1]) {
        L[s].forEach((x, i) => { if (x.k) x.k.mem = i; else MYMEM = i; });
        if (TEAM && L[s].length) { setPrefs(S.pl[s], L[s][0].af); S.pl[s].emb = L[s][0].emb; }
        // hra ve 3: menší tým doplní počítač jako druhý hráč (vlastní peněženka a náhodný národ)
        const bot = TEAM && HOSTOPT.bot && L[s].length === 1 && L[1 - s].length === 2;
        if (L[s].length !== 2 && !bot) continue;
        const p = S.pl[s]; p.prefm = (bot ? [L[s][0].af, Array.from({ length: 5 }, () => (Math.random() * 4) | 0)] : L[s].map(x => x.af)).map(cleanAf);
        p.afm = p.prefm.map(pr => pr.slice()); p.w = [p.gold, p.gold]; p.gold *= 2; p.pd = [0, 0];
        if (bot) { S.bot = { s, m: 1 }; p.pd[1] = 1; }
      }
    }
  }
  if (curSurv) survStart();
  if (r === 'solo' && !tut) genApply(S.pl[0]);                     // bonusy generála jen proti počítači
  if (r !== 'guest') { S.st = newBst(); S.rage = r === 'solo' && S.camp != null && EXTREME(); }   // vztek jen v kampani pro jednoho hráče
  if (r !== 'guest') S.events = SET.evt !== false && S.camp == null && S.chal == null && !S.daily;
  if (r !== 'guest') { setField((S.camp != null && CAMP[S.camp].field) || (S.daily && DAILY.field) || pickField()); S.field = FIELD; }
  if (r === 'host') { for (const k of conns) sendTo(k, { t: 'start', sess: SESS, ...hello(), coop, camp, field: FIELD, side: k.side, team: TEAM, mem: k.mem | 0 }); for (const s of specs) if (s.open) try { s.send(specStart()); } catch (e) {} partySend(); }
  if (r !== 'solo') setTimeout(() => { try { pubSync(true); } catch (e) {} }, 1500);   // přátelé uvidí 👁 Sledovat
}

let curTour = null;
function toMenu(msg) {
  if (typeof swNew !== 'undefined' && swNew) { location.reload(); return; }   // mezitím vyšla nová webová verze
  try { recSave(); } catch (e) {}                        // odehraná bitva → „Poslední bitva“ v menu
  tut = null; specMode = false; recView = null;
  role = null; S = null; V = null; snapCur = snapPrev = null; paused = false; replay = null;
  cleanupNet(); wxApply(); setField(FIELDS[SET.field] ? SET.field : 'meadow');
  refreshMenu(); try { refreshHQ(); refreshLastRep(); } catch (e) {}
  try { pubSync(pubLive); } catch (e) {}                 // po hře zveřejní aktuální statistiky (a zruší „hraje online“)
  document.getElementById('menu').classList.remove('hidden');
  status(msg || ''); document.getElementById('mstatus').innerHTML = msg ? esc(msg) : '';
}

function act(cmd) {
  if (specMode) return;                               // divák nic neovládá
  sfx('buy');
  tutCmd(cmd);
  if (role === 'guest') send({ t: 'c', c: cmd });
  else applyCmd(mySide, cmd);
}

function onSnap(d) {
  if (replay) return;                                  // během přehrávání záznamu stav nepřepisovat
  if (d.O < 0 || recTail < 2.5) { recPush(d); if (d.O >= 0) recTail += 1 / SNAP_HZ; }
  const v = decode(d);
  snapPrev = snapCur || v; snapCur = v; snapT = performance.now();
  d.E.forEach(addFx);
}
function interp(now) {
  return lerpSnap(snapPrev, snapCur, Math.min(1, (now - snapT) / (1000 / SNAP_HZ)));
}
function lerpSnap(snapPrev, snapCur, a) {
  const pu = new Map(snapPrev.units.map(u => [u.id, u]));
  const pp = new Map(snapPrev.proj.map(p => [p.id, p]));
  return { ...snapCur,
    units: snapCur.units.map(u => { const o = pu.get(u.id); return o ? { ...u, x: o.x + (u.x - o.x) * a } : u; }),
    proj: snapCur.proj.map(p => { const o = pp.get(p.id); return o ? { ...p, x: o.x + (p.x - o.x) * a, y: o.y + (p.y - o.y) * a } : p; }) };
}
