/* Service Worker for Web Push and basic caching */
self.addEventListener('install', (event: any) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event: any) => {
  self.clients.claim();
});

precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener('push', (event: any) => {
  if (!event?.data) return;
  let payload: any = {};
  try { payload = event.data.json(); } catch { payload = { title: 'Nova notificação', body: event.data.text() }; }
  const title = payload.title || 'Nova notificação';
  const body = payload.body || '';
  const icon = payload.icon || '/logo.png';
  const tag = payload.tag || 'vigil-notification';
  event.waitUntil(self.registration.showNotification(title, { body, icon, tag, data: payload }));
});

self.addEventListener('notificationclick', (event: any) => {
  event.notification.close();
  const url = event.notification?.data?.url || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList: any[]) => {
      for (const client of clientList) {
        if ('focus' in client) { client.focus(); return; }
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});
import { precacheAndRoute } from 'workbox-precaching';
