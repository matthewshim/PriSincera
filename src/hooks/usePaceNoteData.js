/**
 * usePaceNoteData — PaceNote 데이터 계층 추상화 훅
 *
 * Data Contract v2 (docs/data_contract_v2.md §2) 구현.
 * 구동 환경을 자동 감지하여 동일한 데이터 형상(PaceNoteState)을 반환한다:
 *   - 웹 브라우저:   인증 기반 REST (`/api/pacenote/*`, Bearer idToken)
 *   - Tauri 데스크톱: 무인증 IPC 커맨드 (window.__TAURI__ invoke, 단일 사용자 로컬 SQLite)
 *
 * 두 경로 모두 프론트엔드는 동일한 호출부(addTask/toggleTask/...)를 사용하며,
 * 응답은 { current: WeekData, timeline: TimelineEntry[] } 형상으로 정규화된다.
 *
 * 데스크톱의 IPC 커맨드(get_pacenote 등)는 Rust 측에서 추후 구현되며,
 * 본 훅은 그 계약(엔드포인트 ↔ 커맨드 1:1 매핑, 계약 §2.2)을 미리 고정한다.
 */
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/LanguageContext';

// ─── 환경 감지 ───────────────────────────────────────────────
export function isTauri() {
  return typeof window !== 'undefined' && !!window.__TAURI__;
}

// Tauri v1(window.__TAURI__.invoke) / v2(window.__TAURI__.core.invoke) 양쪽 호환
function tauriInvoke(cmd, args) {
  const t = window.__TAURI__;
  const invoke = (t && t.core && t.core.invoke) || (t && t.invoke);
  if (!invoke) return Promise.reject(new Error('Tauri invoke unavailable'));
  return invoke(cmd, args);
}

// ─── 응답 정규화 (계약 §2.1) ─────────────────────────────────
// 웹/데스크톱 응답을 동일 형상으로 보정. 누락 필드는 안전한 기본값으로(6.4.2 가드).
function normalizeState(raw) {
  const current = raw?.current || {};
  return {
    current: {
      weekId: current.weekId || '',
      startDate: current.startDate || '',
      endDate: current.endDate || '',
      currentPace: Array.isArray(current.currentPace) ? current.currentPace : [],
      recommendedPace: Array.isArray(current.recommendedPace) ? current.recommendedPace : [],
      statement: current.statement || '',
      createdAt: current.createdAt || '',
    },
    timeline: Array.isArray(raw?.timeline) ? raw.timeline : [],
  };
}

export function usePaceNoteData() {
  const { user, token: userToken } = useAuth();
  const { locale } = useTranslation();
  const desktop = isTauri();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ─── 웹 전용: 인증 fetch (401 시 토큰 강제 갱신 후 1회 재시도) ───
  const fetchWithAuth = useCallback(async (url, options = {}) => {
    const doFetch = (tok) => fetch(url, {
      ...options,
      headers: { ...options.headers, Authorization: `Bearer ${tok}` },
    });
    let res = await doFetch(userToken);
    if (res.status === 401 && user) {
      try {
        const fresh = await user.getIdToken(true);
        res = await doFetch(fresh);
      } catch (e) {
        console.error('[usePaceNoteData] token refresh 실패:', e);
      }
    }
    return res;
  }, [user, userToken]);

  // ─── 통합 호출 어댑터: 웹(REST) ↔ 데스크톱(IPC) ───
  // restPath: '/api/pacenote' 기준 상대 경로, ipcCmd: 계약 §2.2 커맨드명
  const call = useCallback(async (restPath, ipcCmd, ipcArgs, restInit) => {
    if (desktop) {
      return tauriInvoke(ipcCmd, ipcArgs);
    }
    const url = `/api/pacenote${restPath}${restPath.includes('?') ? '&' : '?'}lang=${locale}`;
    const res = await fetchWithAuth(url, restInit);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || `요청 실패 (${res.status})`);
    }
    return res.json();
  }, [desktop, locale, fetchWithAuth]);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 웹은 인증 필요 → 미로그인 시 조회 보류
      if (!desktop && !user) { setData(null); return; }
      const raw = await call('', 'get_pacenote', undefined, { method: 'GET' });
      setData(normalizeState(raw));
    } catch (e) {
      console.error('[usePaceNoteData] reload 실패:', e);
      setError(e.message || '불러오기 실패');
    } finally {
      setLoading(false);
    }
  }, [call, desktop, user]);

  useEffect(() => { reload(); }, [reload]);

  // ─── 뮤테이션 (계약 §2.2 매핑) ───
  // 각 뮤테이션은 서버/IPC가 돌려준 currentPace 등을 로컬 상태에 병합한다.
  const applyMutation = useCallback((result) => {
    setData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        current: {
          ...prev.current,
          ...(result.currentPace ? { currentPace: result.currentPace } : {}),
          ...(result.recommendedPace ? { recommendedPace: result.recommendedPace } : {}),
          ...(typeof result.statement === 'string' ? { statement: result.statement } : {}),
        },
      };
    });
    return result;
  }, []);

  const addTask = useCallback((title) =>
    call('/add', 'add_custom_task', { title }, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title }),
    }).then(applyMutation), [call, applyMutation]);

  const toggleTask = useCallback((taskId) =>
    call('/toggle', 'toggle_task', { taskId }, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ taskId }),
    }).then(applyMutation), [call, applyMutation]);

  const acceptTask = useCallback((taskId) =>
    call('/accept', 'accept_recommendation', { taskId }, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ taskId }),
    }).then(applyMutation), [call, applyMutation]);

  const saveDiary = useCallback((statement) =>
    call('/diary', 'save_diary', { statement }, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ statement }),
    }).then(applyMutation), [call, applyMutation]);

  // Click-to-Orbit: 데일리 카드의 action_challenge를 주간 오빗으로 주입 (계약 §2.2)
  const addOrbit = useCallback((actionChallenge) =>
    call('/add-orbit', 'add_orbit_from_signal', { action_challenge: actionChallenge }, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action_challenge: actionChallenge }),
    }).then(applyMutation), [call, applyMutation]);

  return {
    data,
    loading,
    error,
    isDesktop: desktop,
    reload,
    addTask,
    toggleTask,
    acceptTask,
    saveDiary,
    addOrbit,
  };
}

export default usePaceNoteData;
