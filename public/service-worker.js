const STATIC_CACHE_NAME = 'golekaab-static-cache-v1';
const DYNAMIC_CACHE_NAME = 'golekaab-dynamic-cache-v1';

// Add all the files that should be cached for the app shell
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/login.html',
  '/register.html',
  '/research.html',
  '/uploads.html',
  '/dashboard.html',
  '/css/style.css',
  '/js/auth.js',
  '/js/research.js',
  '/js/uploads.js',
  '/js/dashboard.js',
  '/lib/chart.js/dist/chart.umd.js',
  '/manifest.json'
];

// On install, cache the app shell
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Install');
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching offline page');
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// On activate, clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activate');
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== STATIC_CACHE_NAME && key !== DYNAMIC_CACHE_NAME) {
          console.log('[Service Worker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim();
});


// On fetch, implement caching strategies
self.addEventListener('fetch', (event) => {
  // Strategy for the Research API: Cache then network
  if (event.request.url.includes('/api/research')) {
    event.respondWith(
      caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
        return fetch(event.request).then((response) => {
          // If we get a valid response, cache it and return it
          cache.put(event.request.url, response.clone());
          return response;
        }).catch(() => {
          // If the network fails, try to get it from the cache
          return cache.match(event.request);
        });
      })
    );
  }
  // Strategy for all other requests: Cache-first
  else {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  }
});
