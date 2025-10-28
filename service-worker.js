// Service Worker for SAFEY PWA
// Provides offline functionality

// Dynamic cache version for development cache-busting
const CACHE_VERSION = 'safey-v1';
const isDevelopment = (self.location.hostname === 'localhost' ||
                     self.location.hostname === '127.0.0.1') &&
                     self.location.port === '5500';
const CACHE_NAME = CACHE_VERSION + (isDevelopment ? '-dev-' + Date.now() : '');

const urlsToCache = [
  '/',
  '/index.html',
  '/app.js',
  '/manifest.json',
  'https://cdn.tailwindcss.com'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  // Skip caching in development
  if (isDevelopment) {
    console.log('SAFEY: Skipping cache in development mode');
    self.skipWaiting();
    return;
  }

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('SAFEY: Cache opened');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.log('SAFEY: Cache installation failed', error);
      })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('SAFEY: Removing old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip service worker caching in development
  if (isDevelopment) {
    return; // Let browser handle normally
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then((response) => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        }).catch(() => {
          // Network failed, return offline page or cached version
          return caches.match('/index.html');
        });
      })
  );
});
