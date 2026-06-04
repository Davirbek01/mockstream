// Mock Stream Service Worker
// Strategy: Network-first for HTML/JS, Cache-first for icons/images

const CACHE_NAME = 'mockstream-v661';

// Core shell files to pre-cache on install
// Icons & manifest are per-clone (inside site-config/<clone>/), so they are
// cached on first access via the network-first fetch handler below.
const PRECACHE_URLS = [
  'index.html',
  'landing.html',
  'landing-v3.html',
  'admin.html',
  'version-banner.js',
  'site-config/site-config.js',
  'site-config/responsive-scaling.css'
];

// Install — pre-cache the app shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(PRECACHE_URLS);
    }).then(() => self.skipWaiting())
  );
});

// Activate — clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch — network-first strategy
// Try network, fall back to cache. Cache successful responses for next time.
self.addEventListener('fetch', event => {
  const request = event.request;

  // Only handle GET requests
  if (request.method !== 'GET') return;

  // Skip cross-origin requests (CDN audio, external APIs, etc.)
  if (!request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    fetch(request).then(response => {
      // Don't cache error responses
      if (!response || response.status !== 200) {
        return response;
      }

      // Clone and cache the response
      const responseClone = response.clone();
      caches.open(CACHE_NAME).then(cache => {
        cache.put(request, responseClone);
      });

      return response;
    }).catch(() => {
      // Network failed — try cache
      return caches.match(request).then(cached => {
        if (cached) return cached;

        // For navigation requests, return the cached landing page
        if (request.mode === 'navigate') {
          return caches.match('landing.html');
        }

        // Nothing in cache either
        return new Response('Offline', {
          status: 503,
          statusText: 'Service Unavailable'
        });
      });
    })
  );
});
