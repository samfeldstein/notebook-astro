const CACHE_NAME = "site-cache-1784487692954";

const ASSETS = [
  "index.html",
  "/notes/tags/index.html",
  "/search/index.html",
  "/fonts/noto-serif.woff2",
  "/fonts/noto-serif-italic.woff2",
  "site.webmanifest",
  "favicon.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      for (const asset of ASSETS) {
        try {
          await cache.add(asset);
        } catch (error) {
          console.warn(`Failed to cache ${asset}`, error);
        }
      }
    })
  );

  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );

  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  const shouldCache =
    url.pathname.startsWith("/notes") ||
    ASSETS.includes(url.pathname);

  if (!shouldCache) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, copy);
        });

        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});