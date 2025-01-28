const CACHE_NAME = "domino-cache-v1";
const urlsToCache = [
  "/placardomino/",
  "/placardomino/index.html",
  "/placardomino/icon512_rounded.png",
  "/placardomino/icon512_maskable.png",
  "https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap",
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) {
        atualizarCacheSilenciosamente(event.request);
        return response;
      }

      return fetch(event.request).then(networkResponse => {
        if (networkResponse && networkResponse.ok) {
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, networkResponse.clone());
          });
        }
        return networkResponse;
      }).catch(() => {
        return caches.match("/placardomino/index.html");
      });
    })
  );
});

const atualizarCacheSilenciosamente = async (request) => {
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, response.clone());
    }
  } catch (err) {
    console.log("Erro ao tentar atualizar o cache:", err);
  }
};

self.addEventListener("activate", event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      )
    )
  );
});
