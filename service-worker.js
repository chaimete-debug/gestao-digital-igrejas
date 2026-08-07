// Gestão Digital da Igreja v54.8.1
// Service worker mínimo: permite instalação PWA e evita servir versões antigas.
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

// Não intercepta pedidos. A aplicação continua a usar sempre a rede/Vercel.
