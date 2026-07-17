const CACHE_NAME = 'mc-adventure-v2';

const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',

  // 公開版 icon
  './allay_icon_512.png',

  // 自用版
  './my/',
  './my/index.html',
  './my/manifest.json',
  './my/allay_white.png'
];


self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.all(
        PRECACHE_URLS.map((url) =>
          fetch(url)
            .then((response) => {
              if (response.ok) {
                return cache.put(url, response.clone());
              }
            })
            .catch(() => {})
        )
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

        caches.open(CACHE_NAME)
          .then((cache) => {
            cache.put(event.request, responseClone);
          });

        return response;
      })

      .catch(() =>
        caches.match(event.request)
          .then((cachedResponse) =>
            cachedResponse || caches.match('./index.html')
          )
      )
  );

});