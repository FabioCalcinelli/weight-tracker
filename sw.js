const cacheName = 'weight-tracker-v10';
const staticAssets = [
  './',
  './index.html',
  './css/style.css',
  './js/app.js',
  './js/utils.js',
  './js/storage.js',
  './js/ui.js',
  './js/tabs.js',
  './js/graph.js',
  './js/csv.js',
  './manifest.json'
];

self.addEventListener('install', async e => {
  const cache = await caches.open(cacheName);
  await cache.addAll(staticAssets);
  return self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== cacheName) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request))
  );
});