
// Minimal service worker for PWA installation support
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Required to be a valid PWA, can be expanded for caching strategies
});
