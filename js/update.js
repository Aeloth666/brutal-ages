// =====================================================================
//  AKTUALIZACE (jen v aplikaci) – nová verze hry se stáhne z webu do telefonu a hra pak běží z ní,
//  i offline. Na nové APK (změny v nativní části) hra jen upozorní – instalaci musí potvrdit hráč.
//  Po instalaci nového APK se aplikace sama vrátí k verzi zabalené v APK (Capacitor to hlídá).
// =====================================================================
const UPD_URL = 'https://aeloth666.github.io/brutal-ages/';
let updReady = null, apkVer = '';
// diagnostika: poslední kontrola aktualizace (ukazuje se v Nastavení hry)
const UPD = load('aow-upd', {});
function updLog(step, err) { UPD.t = Date.now(); UPD.step = step; UPD.err = err ? String(err).slice(0, 160) : ''; store('aow-upd', UPD); verInfo(); }
function verInfo() {
  const el = $('verInfo'); if (!el) return;
  const when = UPD.t ? new Date(UPD.t).toLocaleString('cs') : 'zatím ne';
  el.innerHTML = `Verze hry <b>${typeof GAME_VER !== 'undefined' ? GAME_VER : '?'}</b> (sestavení ${BUILD})${apkVer ? ' · aplikace ' + esc(apkVer) : ''}` +
    (nativeApp ? `<br>Aktualizace – poslední kontrola: ${when}${UPD.step ? ' · ' + esc(UPD.step) : ''}${UPD.err ? ' · <span style="color:#fca5a5">' + esc(UPD.err) + '</span>' : ''}` : '');
}

async function updInit(manual) {
  if (!nativeApp || !window.Capacitor || !Capacitor.Plugins) return;
  const P = Capacitor.Plugins, FS = P.Filesystem, WV = P.WebView;
  if (!FS || !WV) { updLog('chybí doplněk', !FS ? 'Filesystem' : 'WebView'); return; }
  try { apkVer = (await P.App.getInfo()).version; } catch (e) {}
  // právě běžíme ze stažené verze → zapamatovat ji pro další spuštění a smazat starší
  try {
    const { path } = await WV.getServerBasePath();
    if (path && path.includes('/live/')) {
      await WV.persistServerBasePath();
      achId('update');
      const cur = path.replace(/\/+$/, '').split('/live/')[1];          // Capacitor vrací cestu s lomítkem na konci
      const { files } = await FS.readdir({ path: 'live', directory: 'DATA' }).catch(() => ({ files: [] }));
      for (const f of files) { const n = f.name || f; if (n !== cur) FS.rmdir({ path: 'live/' + n, directory: 'DATA', recursive: true }).catch(() => {}); }
    }
  } catch (e) {}
  if (UPD_URL.includes('GITHUB_USER')) return;
  let v;
  try { v = await (await fetch(UPD_URL + 'version.json?t=' + Date.now(), { cache: 'no-store' })).json(); } catch (e) { updLog('web nedostupný', e && e.message); return; }
  // nové APK?
  let apk = 0;
  try { apk = +(await P.App.getInfo()).build || 0; } catch (e) {}
  if (v.apk && apk && v.apk > apk) apkBanner(v);
  // nová verze hry (jen pokud ji tohle APK zvládne)
  if (!(+v.build > BUILD)) { updLog('máš nejnovější verzi'); return; }
  if ((v.minApk && apk && apk < v.minApk) || !Array.isArray(v.files)) { updLog('verze ' + v.name + ' potřebuje nové APK'); return; }
  updLog('stahuji verzi ' + v.name);
  const dir = 'live/' + v.build;
  const done = await FS.stat({ path: dir + '/ok', directory: 'DATA' }).then(() => true, () => false);
  if (!done) {
    try {
      for (const f of v.files) {
        const r = await fetch(UPD_URL + f + '?v=' + v.build, { cache: 'no-store' });
        if (!r.ok) throw new Error(f);
        const bin = /\.(png|jpe?g|webp|ico|woff2?)$/i.test(f);
        const data = bin ? await b64(await r.blob()) : await r.text();
        await FS.writeFile({ path: dir + '/' + f, data, directory: 'DATA', recursive: true, ...(bin ? {} : { encoding: 'utf8' }) });
      }
      await FS.writeFile({ path: dir + '/ok', data: String(v.build), directory: 'DATA', encoding: 'utf8' });
    } catch (e) { updLog('stahování selhalo', e && e.message); FS.rmdir({ path: dir, directory: 'DATA', recursive: true }).catch(() => {}); return; }
  }
  const { uri } = await FS.getUri({ path: dir, directory: 'DATA' });
  updReady = { path: decodeURIComponent(uri.replace(/^file:\/\//, '')), name: v.name || '' };
  // hned po spuštění v menu rovnou přepnout, jinak nabídnout restart (rozehranou hru nepřerušujeme)
  updLog('verze ' + v.name + ' připravena');
  if (manual || (!role && performance.now() < 20000)) updApply(); else updBanner();
}
function updApply() {
  if (!updReady) return;
  try { saveGame(); } catch (e) {}
  toasts.push({ a: { n: 'Verze ' + updReady.name }, h: '⬇ AKTUALIZACE', l: 3 });
  Capacitor.Plugins.WebView.setServerBasePath({ path: updReady.path });   // načte stránku znovu z nové verze
}
const b64 = blob => new Promise((ok, err) => { const r = new FileReader(); r.onload = () => ok(String(r.result).split(',')[1]); r.onerror = err; r.readAsDataURL(blob); });

function updBanner() {
  const b = $('updBar');
  b.innerHTML = `⬇ Nová verze hry ${esc(updReady.name)} je připravená <button id="bUpdGo">Restartovat</button>`;
  b.classList.remove('hidden');
  $('bUpdGo').onclick = () => { if (role) toMenu(); updApply(); };
}
function apkBanner(v) {
  const b = $('apkBar');
  b.innerHTML = `📲 Nová verze aplikace ${esc(v.apkName || '')} <button id="bApkGo">Stáhnout</button>`;
  b.classList.remove('hidden');
  $('bApkGo').onclick = () => { location.href = v.apkUrl || UPD_URL + 'BrutalAges.apk'; };   // otevře se v prohlížeči
}
setTimeout(updInit, 1500);
verInfo();
if (nativeApp) { $('bUpdCheck').classList.remove('hidden'); $('bUpdCheck').onclick = () => { sfx('click'); updLog('kontroluji…'); updInit(true); }; }
