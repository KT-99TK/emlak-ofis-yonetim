// Global 1881 mobil denemesi: hassas API ve belge verisi cihaz önbelleğine yazılmaz.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
self.addEventListener("fetch", (event) => {
  // Bu işleyici yalnız PWA kurulum koşulunu sağlar; tüm istekler çevrimiçi sunucuya gider.
  event.respondWith(fetch(event.request));
});
