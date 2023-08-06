const cacheName = "forsle-v2";
const staticAssets = [
  "/index.html",
  "/js/forsenle.min.js",
  "/js/bootstrap.bundle.min.js",
  "/css/forsenle.min.css",
  "/css/bootstrap.min.css",
  "/css/icons.css",
  "/css/icons.woff2",
  "/pics/forsenle/icon-192.png",
  "/pics/forsenle/icon-256.png",
  "/pics/forsenle/icon-384.png",
  "/pics/forsenle/icon-512.png",
  "/pics/forsenle/nime.png",
  "/pics/forsenle/forsenpossessed.gif",
  "/pics/forsenle/forsenspin.png",
  "/pics/forsenle/youtube-128.png",
  "/pics/forsenle/icon.png",
];

self.addEventListener("install", async () => {
  const cache = await caches.open(cacheName);
  await cache.addAll(staticAssets);
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});
self.addEventListener("fetch", (event) => {
  const req = event.request;
  event.respondWith(networkFirst(req));
  /*
    if (/.*(json)$/.test(req.url)) {
        event.respondWith(networkFirst(req));
    } else {
        event.respondWith(cacheFirst(req));
    }
    */
});

async function cacheFirst(req) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(req);
  return cachedResponse || networkFirst(req);
}

async function networkFirst(req) {
  const cache = await caches.open(cacheName);
  try {
    const fresh = await fetch(req);
    cache.put(req, fresh.clone());
    return fresh;
  } catch (e) {
    const cachedResponse = await cache.match(req);
    return cachedResponse;
  }
}
