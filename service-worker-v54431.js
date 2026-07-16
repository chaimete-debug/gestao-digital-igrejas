// Gestão Digital da Igreja v54.4.3.1
// Service worker mínimo: permite a instalação sem servir ficheiros desactualizados.
self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

// Não intercepta pedidos. O frontend e o Apps Script continuam sempre ligados à rede.
