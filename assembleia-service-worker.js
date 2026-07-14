const CACHE_NAME = "assembleia-guia-v1";
const ASSEMBLY_ASSETS = [
  "./assembleia.html",
  "./assembleia-offline.html",
  "./assembleia-manifest.json"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSEMBLY_ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request).then(cached => cached || caches.match("./assembleia-offline.html")))
  );
});
