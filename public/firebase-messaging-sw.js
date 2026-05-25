// This file is intentionally empty.
// Firebase Cloud Messaging is handled by /sw.js (the unified PWA + FCM service worker).
// Browsers that cached an old version of this worker will unregister it on next activate.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => {
  event.waitUntil(self.registration.unregister());
});
