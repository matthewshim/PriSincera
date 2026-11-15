/* Waymark 웹푸시 서비스워커 — raw Web Push 처리(전경·배경 공통, data-only 메시지) */
self.addEventListener('push', (event) => {
  let p = {};
  try { p = event.data ? event.data.json() : {}; } catch (e) { p = {}; }
  const d = p.data || p.notification || {};
  const title = d.title || 'Waymark';
  event.waitUntil(self.registration.showNotification(title, {
    body: d.body || '',
    icon: '/waymark-icon.svg',
    badge: '/waymark-icon.svg',
    tag: 'waymark-nudge',
    data: { link: d.link || (p.fcmOptions && p.fcmOptions.link) || '/waymark/app' },
  }));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const link = (event.notification.data && event.notification.data.link) || '/waymark/app';
  event.waitUntil(clients.matchAll({ type: 'window' }).then((wins) => {
    for (const w of wins) { if (w.url.includes('/waymark') && 'focus' in w) return w.focus(); }
    return clients.openWindow(link);
  }));
});

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
