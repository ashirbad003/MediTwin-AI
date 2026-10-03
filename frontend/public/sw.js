/**
 * MediTwin-AI Progressive Web App Service Worker
 * Implements safe offline shell caching without caching sensitive patient clinical records.
 */

const CACHE_NAME = 'meditwin-shell-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/icons.svg'
];

// Install Event - Pre-cache core application shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[MediTwin PWA] Pre-cache partial failure:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate Event - Clean up stale caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. Never cache non-GET requests or authentication/API routes with clinical PHI
  const isApiRoute = url.pathname.startsWith('/auth') ||
                     url.pathname.startsWith('/patient') ||
                     url.pathname.startsWith('/doctor') ||
                     url.pathname.startsWith('/admin') ||
                     url.pathname.startsWith('/ai') ||
                     url.pathname.startsWith('/rag') ||
                     url.pathname.startsWith('/prescriptions') ||
                     url.pathname.startsWith('/reports') ||
                     url.pathname.startsWith('/docs') ||
                     url.pathname.startsWith('/openapi.json');

  if (event.request.method !== 'GET' || isApiRoute) {
    // Network only for dynamic medical operations
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(
          JSON.stringify({
            error: 'Offline',
            message: 'Internet connection required for live medical records and AI processing.'
          }),
          {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      })
    );
    return;
  }

  // 2. Navigation Requests: Network first, fall back to cached shell
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/index.html') || caches.match('/');
      })
    );
    return;
  }

  // 3. Static Assets (JS, CSS, Fonts, Images): Stale-While-Revalidate
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
