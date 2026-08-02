// Mock Stream Service Worker
// Strategy: Network-first for HTML/JS, Cache-first for icons/images.
// Plus (2026-07-23):
//   - CONTENT_CACHE: offline mock content — Supabase mock_tests GETs
//     (network-first, cache fallback) and GCS audio (cache-first) survive
//     shell cache bumps, so a mock opened once keeps working offline.
//   - Web Push: 'push' shows the notification, 'notificationclick'
//     focuses/opens the target page. Subscriptions are managed by
//     site/push-client.js; sends fan out from the web-push Edge Function.

const CACHE_NAME = 'mockstream-v861';
const CONTENT_CACHE = 'mockstream-content-v1'; // NOT versioned with the shell

const SUPABASE_HOST = 'zknyukkbtbcqgvkgjktb.supabase.co';
const GCS_HOST = 'storage.googleapis.com';

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

// Activate — clean up old SHELL caches (keep the content cache: it holds
// downloaded mock JSON + audio and must survive shell version bumps)
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME && k !== CONTENT_CACHE).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch — network-first strategy
self.addEventListener('fetch', event => {
  const request = event.request;

  // Only handle GET requests
  if (request.method !== 'GET') return;

  let url;
  try { url = new URL(request.url); } catch (e) { return; }

  // ── Offline mock content ─────────────────────────────────────────────
  // GCS audio (listening/speaking mp3s, immutable files): cache-first.
  // <audio src> requests are no-cors → opaque responses, which still play
  // back fine from the cache.
  if (url.hostname === GCS_HOST) {
    event.respondWith(
      caches.open(CONTENT_CACHE).then(cache =>
        cache.match(request).then(cached => {
          // An opaque entry (cached from a no-cors <img>/<audio> load) can
          // NEVER satisfy a cors-mode fetch() — the browser rejects it as a
          // network error. That silently broke the vision fact-check, which
          // fetch()es the same image the student is already viewing. Bypass
          // the cache for that combination; the fresh cors response then
          // replaces the opaque entry (cors responses satisfy both modes).
          if (cached && !(request.mode === 'cors' && cached.type === 'opaque')) return cached;
          return fetch(request).then(response => {
            if (response && (response.status === 200 || response.type === 'opaque')) {
              cache.put(request, response.clone());
            }
            return response;
          });
        })
      ).catch(() => fetch(request))
    );
    return;
  }

  // Supabase REST mock content: network-first (content can be edited), fall
  // back to the cached copy when offline. Only mock_tests reads — auth,
  // functions and writes are never touched.
  if (url.hostname === SUPABASE_HOST) {
    if (url.pathname.startsWith('/rest/v1/mock_tests') || url.pathname.startsWith('/rest/v1/rpc/mock_card_meta')) {
      event.respondWith(
        fetch(request).then(response => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CONTENT_CACHE).then(cache => cache.put(request, clone));
          }
          return response;
        }).catch(() =>
          caches.open(CONTENT_CACHE).then(cache => cache.match(request)).then(cached =>
            cached || new Response('[]', { status: 503, headers: { 'Content-Type': 'application/json' } })
          )
        )
      );
    }
    return; // all other Supabase traffic goes straight to the network
  }

  // Skip remaining cross-origin requests (CDNs, external APIs, etc.)
  if (url.origin !== self.location.origin) return;

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

        // For navigation requests, return the cached v3 landing (Phase A)
        if (request.mode === 'navigate') {
          return caches.match('landing-v3.html');
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

// ── Web Push ───────────────────────────────────────────────────────────
self.addEventListener('push', event => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (e) { }
  const title = data.title || 'Mock Stream';
  const options = {
    body: data.body || '',
    icon: '/site-config/icons/icon-192.png',
    badge: '/site-config/icons/icon-96.png',
    tag: data.tag || 'mockstream',
    data: { url: data.url || '/landing-v3.html' },
    renotify: true
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || '/landing-v3.html';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const client of list) {
        if ('focus' in client) {
          client.focus();
          if ('navigate' in client && !client.url.includes(target)) client.navigate(target);
          return;
        }
      }
      return clients.openWindow(target);
    })
  );
});
