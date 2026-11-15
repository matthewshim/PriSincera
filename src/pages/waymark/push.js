// Waymark 웹푸시(FCM) — 권한 요청·토큰 발급·서버 등록. 정본: system_architecture 먼저찾아옴 이중 채널.
import { getMessaging, getToken, deleteToken, isSupported } from 'firebase/messaging';
import { app } from '../../firebase';

// VAPID 공개 키(웹푸시 인증서) — 공개값, 클라 임베드 정상.
const VAPID_KEY = 'BCQovzJIYlaoWaQywAXWvfF4zsf32sHBuxO5sAHKELDbzCCH4xZrDs2dVJn82Oh_LTXXQgYMe58NENfx-gP_6Bg';

export async function pushSupported() {
  try {
    return typeof Notification !== 'undefined' && 'serviceWorker' in navigator && (await isSupported());
  } catch {
    return false;
  }
}

export async function enablePush(api) {
  if (!(await pushSupported())) throw Object.assign(new Error('unsupported'), { code: 'unsupported' });
  const perm = await Notification.requestPermission();
  if (perm !== 'granted') throw Object.assign(new Error('denied'), { code: 'denied' });
  const reg = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
  const token = await getToken(getMessaging(app), { vapidKey: VAPID_KEY, serviceWorkerRegistration: reg });
  if (!token) throw Object.assign(new Error('no-token'), { code: 'no-token' });
  await api.registerPushToken(token);
  return token;
}

export async function disablePush(api) {
  try { await deleteToken(getMessaging(app)); } catch { /* noop */ }
  await api.unregisterPushToken();
}
