// Minimal service worker: network-first, falling back to cache when offline.
//
// Deliberately NOT cache-first. Cache-first meant a deployed update was never
// picked up — the browser kept serving the version cached on first visit, so
// new app.js never loaded. Network-first keeps the app working offline (the
// cache is still there as a fallback) while always preferring fresh files.

const CACHE_NAME = "cycle-app-v2";
const FILES_TO_CACHE = [
  "./index.html",
  "./app.js",
  "./styles.css",
  "./content.js",
  "./manifest.json",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Keep the cache warm with the newest copy for offline use.
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)).catch(() => {});
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
