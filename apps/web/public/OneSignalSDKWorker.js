// OneSignalSDKWorker.js
// Single service worker: handles push notifications (OneSignal) + PWA caching.
// Must stay at the root so it controls scope "/".

importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");

// ─── PWA caching ─────────────────────────────────────────────────────────────
const CACHE_NAME = "barterhub-v4";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(["/"])),
  );
  // Don't call skipWaiting here — OneSignal's imported script already does it.
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)),
        ),
      ),
  );
  // Don't call clients.claim() here — OneSignal handles it.
});

self.addEventListener("fetch", (event) => {
  // Only cache GET requests; let everything else pass through.
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches
      .match(event.request)
      .then((cached) => cached || fetch(event.request)),
  );
});

// ─── Notification click (fallback for non-OneSignal notifications) ────────────
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/home";
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        for (const client of windowClients) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            client.navigate(url);
            return client.focus();
          }
        }
        return clients.openWindow(url);
      }),
  );
});
