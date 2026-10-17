const CACHE_NAME = "site-cache-__VERSION__";
const PAGE_CACHE = "pages";
const MAX_PAGES = 100;

const ASSETS = [
  "/",
  "/notes/tags/",
  "/search/",
  "/fonts/noto-serif.v2.woff2",
  "/site.webmanifest",
  "/favicon.svg",
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
          .filter((key) => key !== CACHE_NAME && key !== PAGE_CACHE)
          .map((key) => caches.delete(key))
      )
    )
  );

  self.clients.claim();
});

// Drop the oldest entries once the page cache grows past MAX_PAGES.
async function trimPages() {
  const cache = await caches.open(PAGE_CACHE);
  const keys = await cache.keys();
  await Promise.all(
    keys.slice(0, Math.max(0, keys.length - MAX_PAGES)).map((key) => cache.delete(key))
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== "GET" || url.origin !== self.location.origin) {
    return;
  }

  // Fonts: cache first. Filenames are versioned, so entries never go stale.
  if (url.pathname.startsWith("/fonts/")) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (response.ok) {
              const copy = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
            }
            return response;
          })
      )
    );
    return;
  }

  // Pages: network first, keep a bounded copy for offline reading.
  // Prefetches aren't navigations, so they don't fill the cache.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok && response.type === "basic") {
            const copy = response.clone();
            event.waitUntil(
              caches
                .open(PAGE_CACHE)
                .then((cache) => cache.put(request, copy))
                .then(trimPages)
            );
          }
          return response;
        })
        .catch(async () => {
          return (
            (await caches.match(request)) ||
            (await caches.match("/")) ||
            Response.error()
          );
        })
    );
  }
});
