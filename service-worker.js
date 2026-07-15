const CACHE_NAME = 'mc-adventure-v1';
const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  'https://meee.com.tw/x9oTG9x.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.all(
        PRECACHE_URLS.map((url) => {
          const request = new Request(url, { mode: url.startsWith('http') ? 'no-cors' : 'same-origin' });
          return fetch(request).then((response) => {
            if (response) {
              return cache.put(request, response.clone());
            }
            return Promise.resolve();
          }).catch(() => Promise.resolve());
        })
      )
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
          return Promise.resolve();
        })
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        return response;
      })
      .catch(() => caches.match(event.request).then((cachedResponse) => cachedResponse || caches.match('./index.html')))
  );
});