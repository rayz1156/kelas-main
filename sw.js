// Offline support. Pages: network first, falling back to cache. Assets: cache first, refreshed in the background.
const VERSION = 'km-v10';
const CORE = [
  './', './index.html', './game.html', './laporan.html', './bina.html', './ahli.html', './404.html',
  './css/app.css', './js/core.js', './js/data.js', './js/shell.js', './js/ahli.js',
  './js/games/kedai-runcit.js', './js/games/ikatan-nombor.js', './js/games/suku-kata.js', './js/games/selamat.js', './js/games/set.js',
  './js/games/banjir.js', './js/games/neraca.js', './js/games/irama.js', './js/games/tatabahasa.js', './js/games/detektif-berita.js', './js/games/bot-banjir.js', './js/games/kampung-sejahtera.js',
  './icon.svg', './manifest.webmanifest',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const isFont = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';
  if (url.origin !== location.origin && !isFont) return;

  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then((res) => {
      const copy = res.clone();
      if (res.ok) caches.open(VERSION).then((c) => c.put(req, copy));
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: true }).then((hit) => hit || caches.match('./index.html'))));
    return;
  }

  e.respondWith(caches.match(req).then((hit) => {
    const fresh = fetch(req).then((res) => {
      if (res && (res.ok || res.type === 'opaque')) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); }
      return res;
    }).catch(() => hit);
    return hit || fresh;
  }));
});
