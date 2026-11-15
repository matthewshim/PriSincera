/* Waymark FCM 백그라운드 알림 서비스워커 */
importScripts('https://www.gstatic.com/firebasejs/12.12.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.12.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyCu21j7PvDB1j-FBFj9rl3dMrDPvk_Z_pQ', // secret-scan:ignore (Firebase 웹 공개 키)
  authDomain: 'prisincera.firebaseapp.com',
  projectId: 'prisincera',
  messagingSenderId: '1094711522476',
  appId: '1:1094711522476:web:4f97c95daf528444611b09',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const n = payload.notification || {};
  const link = (payload.fcmOptions && payload.fcmOptions.link) || (payload.data && payload.data.link) || '/waymark/app';
  self.registration.showNotification(n.title || 'Waymark', {
    body: n.body || '',
    icon: '/waymark-icon.svg',
    badge: '/waymark-icon.svg',
    data: { link },
  });
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const link = (e.notification.data && e.notification.data.link) || '/waymark/app';
  e.waitUntil(clients.matchAll({ type: 'window' }).then((wins) => {
    for (const w of wins) { if (w.url.includes('/waymark') && 'focus' in w) return w.focus(); }
    return clients.openWindow(link);
  }));
});
