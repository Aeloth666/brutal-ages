// =====================================================================
//  HLÁŠENÍ CHYB – když hře něco spadne, uloží se zpráva, místo v kódu, verze a co hráč dělal
//  a pošle se do Firebase (/err/<uid>/<otisk>). Stejná chyba se jen počítá, za spuštění max. 10 hlášení.
//  Přehled: node tools/chyby.js
// =====================================================================
const ERRQ = [], ERRSEEN = new Map();
let errSent = 0, errTimer = 0;
const ERR_SKIP = /offline|Server neodpovídá|Failed to fetch|NetworkError|Load failed|ResizeObserver|Nepodařilo se přihlásit|Could not connect|PeerJS|peer-unavailable|webrtc|AbortError|play\(\) request|user didn't interact|vibrate/i;
const errHash = s => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return (h >>> 0).toString(36); };
function errCtx() {
  try {
    const mode = typeof role === 'undefined' || !role ? 'menu' : role !== 'solo' ? role : typeof recView !== 'undefined' && recView ? 'záznam'
      : curSurv ? 'přežití' : curCamp != null ? 'kampaň ' + (curCamp + 1) : curChal != null ? 'výzva' : curDaily ? 'denní' : 'počítač';
    return mode + (typeof S !== 'undefined' && S ? ' · ' + Math.round(S.time) + ' s' : '');
  } catch (e) { return '?'; }
}
function errReport(msg, src, stack) {
  msg = String(msg || 'Neznámá chyba').slice(0, 300);
  if (ERR_SKIP.test(msg) || (msg === 'Script error.' && !src)) return;
  const file = String(src || '').replace(/^.*\/(js\/)?/, '').slice(0, 80);
  const key = errHash(msg + '|' + file + '|' + (typeof GAME_VER !== 'undefined' ? GAME_VER : ''));
  const seen = ERRSEEN.get(key);
  if (seen) { seen.n++; return; }                                // stejná chyba znovu: jen se přičte
  const r = { m: msg, f: file, s: String(stack || '').replace(/https?:\/\/[^)\s]*\/(js\/)?/g, '').slice(0, 1500),
    v: (typeof GAME_VER !== 'undefined' ? GAME_VER : '?') + ' (' + (typeof BUILD !== 'undefined' ? BUILD : '?') + ')',
    p: (window.Capacitor && Capacitor.isNativePlatform && Capacitor.isNativePlatform() ? 'aplikace' : 'web') + ' · ' + (navigator.userAgent.match(/Android [\d.]+|iPhone OS [\d_]+|Windows NT [\d.]+|Mac OS X [\d_]+|Linux/) || ['?'])[0],
    w: errCtx(), n: 1, t: Date.now() };
  ERRSEEN.set(key, r);
  if (ERRSEEN.size > 30) return;
  ERRQ.push([key, r]);
  clearTimeout(errTimer); errTimer = setTimeout(errFlush, 5000);
}
async function errFlush() {
  if (!ERRQ.length || typeof fbAuth !== 'function' || errSent >= 10) return;
  if (typeof SET !== 'undefined' && SET.noErr) { ERRQ.length = 0; return; }
  const a = await fbAuth().catch(() => null); if (!a) return;
  // jedna chyba se ze stejného zařízení pošle nejvýš jednou za den
  let sent = {}; try { sent = JSON.parse(localStorage.getItem('aow-errs') || '{}'); } catch (e) {}
  while (ERRQ.length && errSent < 10) {
    const [key, r] = ERRQ.shift();
    if (Date.now() - (sent[key] || 0) < 864e5) continue;
    try {
      const res = await fetch(`${FB.db}/err/${a.uid}/${key}.json?auth=${a.t}`, { method: 'PUT', body: JSON.stringify(r) });
      if (res.ok) { sent[key] = Date.now(); errSent++; }
    } catch (e) { ERRQ.unshift([key, r]); break; }
  }
  for (const k of Object.keys(sent)) if (Date.now() - sent[k] > 7 * 864e5) delete sent[k];
  try { localStorage.setItem('aow-errs', JSON.stringify(sent)); } catch (e) {}
}
addEventListener('error', e => { if (e.message || e.error) errReport(e.message || (e.error && e.error.message), e.filename && e.filename + ':' + e.lineno + ':' + e.colno, e.error && e.error.stack); });
addEventListener('unhandledrejection', e => { const r = e.reason; errReport('Promise: ' + (r && r.message || r), '', r && r.stack); });
setTimeout(errFlush, 8000);
