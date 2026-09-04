// Minimal service worker: network-first, falling back to cache when offline.
//
// Deliberately NOT cache-first. Cache-first meant a deployed update was never
// picked up — the browser kept serving the version cached on first visit, so
// new app.js never loaded. Network-first keeps the app working offline (the
// cache is still there as a fallback) while always preferring fresh files.

const CACHE_NAME = "cycle-app-v4";
const FILES_TO_CACHE = [
  "./index.html",
  "./app.js",
  "./styles.css",
  "./content.js",
  "./manifest.json",
];

self.addEventListener("install", (event) => {
  // `cache.addAll` would fetch through the browser's HTTP cache and could
  // precache the very stale files this worker exists to replace, so fetch
  // each one with cache: "reload" to force a trip to the server.
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.all(
        FILES_TO_CACHE.map((file) =>
          fetch(file, { cache: "reload" })
            .then((response) => cache.put(file, response))
            .catch(() => {})
        )
      )
    )
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

  // `cache: "no-cache"` forces a revalidation with the server instead of
  // silently accepting the browser's HTTP-cached copy. Without it, GitHub
  // Pages' 10-minute cache header meant a "network-first" fetch still handed
  // back a stale file — and we then cached that stale copy for offline use.
  // It's a conditional request, so an unchanged file still costs only a 304.
  event.respondWith(
    fetch(event.request, { cache: "no-cache" })
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)).catch(() => {});
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
