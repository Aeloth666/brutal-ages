// Service worker: hra jde hrát offline v prohlížeči (online hra a počasí potřebují síť).
// VERSION přepisuje build-web.ps1 při každém sestavení webové verze.
const VERSION = 'brutal-ages-web-202611090000';
const FILES = [
  './', 'index.html', 'style.css', 'manifest.webmanifest', 'lib/peerjs.min.js',
  'js/i18n.js', 'js/build.js', 'js/errlog.js', 'js/data.js', 'js/core.js', 'js/ai.js', 'js/snapshot.js', 'js/net.js', 'js/render.js', 'js/units.js', 'js/weapons.js', 'js/animals.js', 'js/heavy.js', 'js/bossart.js', 'js/world.js', 'js/base-kit.js', 'js/bases-early.js', 'js/bases-late.js', 'js/turrets.js', 'js/turret-art.js', 'js/fx.js', 'js/gore.js', 'js/hud.js',
  'js/meta.js', 'js/audio.js', 'js/ui.js', 'js/weather.js', 'js/campaign.js', 'js/modes.js', 'js/extras.js', 'js/gen.js', 'js/lb.js', 'js/surv.js', 'js/weekly.js', 'js/season.js', 'js/cloud.js', 'js/friends.js', 'js/replay.js', 'js/cheats.js', 'js/main.js', 'js/update.js',
  'icons/icon-192.png', 'icons/icon-512.png',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES.map(f => new Request(f, { cache: 'reload' })))).then(() => self.skipWaiting()));
});
// nová verze smaže staré mezipaměti a dá vědět otevřené hře – ta se obnoví hned v menu, nebo až po dohrání bitvy
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(async ks => {
    const old = ks.filter(k => k !== VERSION);
    await Promise.all(old.map(k => caches.delete(k)));
    await self.clients.claim();
    if (old.length) for (const c of await self.clients.matchAll({ type: 'window' })) c.postMessage({ t: 'sw-new' });
  }));
});
// vlastní soubory: nejdřív ze sítě (vždy nejnovější), z mezipaměti jen bez připojení;
// cizí požadavky (počasí, PeerJS) jdou rovnou do sítě
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  e.respondWith(caches.open(VERSION).then(async c => {
    try {
      const r = await fetch(e.request, { cache: 'no-cache' });
      if (r.ok) c.put(e.request, r.clone());
      return r;
    } catch (err) {
      return (await c.match(e.request, { ignoreSearch: true })) || Response.error();
    }
  }));
});
