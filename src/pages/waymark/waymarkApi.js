// Waymark 클라이언트 API — /api/waymark/* 호출(Bearer idToken). 401 시 토큰 리프레시 1회 재시도.
// 서버: waymark-api.mjs. 모든 Firestore 접근은 서버 경유(firestore.rules deny-all).
import { useCallback, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const BASE = '/api/waymark';

export function useWaymarkApi() {
  const { user, token } = useAuth();

  const call = useCallback(async (path, { method = 'GET', body } = {}) => {
    const run = (tok) => fetch(`${BASE}${path}`, {
      method,
      headers: {
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(tok ? { Authorization: `Bearer ${tok}` } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    let res = await run(token);
    if (res.status === 401 && user) {
      try { res = await run(await user.getIdToken(true)); } catch { /* keep 401 */ }
    }
    if (!res.ok) {
      let payload = {};
      try { payload = await res.json(); } catch { /* non-json */ }
      throw Object.assign(new Error(payload.error || `HTTP ${res.status}`), { status: res.status, ...payload });
    }
    return res.status === 204 ? null : res.json();
  }, [token, user]);

  return useMemo(() => ({
    listDecisions: (query = '') => call(`/decisions${query}`),
    createDecision: (body) => call('/decisions', { method: 'POST', body }),
    getDecision: (id) => call(`/decisions/${id}`),
    patchDecision: (id, body) => call(`/decisions/${id}`, { method: 'PATCH', body }),
    addMessage: (id, text) => call(`/decisions/${id}/messages`, { method: 'POST', body: { text } }),
    upcomingEvents: () => call('/events/upcoming'),
    respondEvent: (id) => call(`/events/${id}/respond`, { method: 'POST' }),
    getMe: () => call('/me'),
    patchMe: (body) => call('/me', { method: 'PATCH', body }),
  }), [call]);
}
