
// Minimal Service Worker to satisfy PWA installation criteria
self.addEventListener('install', (event) => {
  console.log('SW: Installed');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('SW: Activated');
  event.waitUntil(clients.claim());
});

// Browsers require a fetch event handler to be considered "Installable"
self.addEventListener('fetch', (event) => {
  // Simple pass-through for now
  // This satisfies the PWA install criteria
  return;
});
