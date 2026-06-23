/**
 * TrackSignalFeed — 수준별 테크 트랙 시그널 피드 (Data Contract v2 §1.2)
 *
 * C3: 트랙 탭(주니어/시니어) + 관심 도메인 필터 칩
 * C4: 카드별 action_challenge → [오빗 추가] (Click-to-Orbit, POST /api/pacenote/add-orbit)
 *
 * 스타일: PriSincera Design System v5.0 정합 (TrackSignalFeed.css, Celestial/Cyan 토큰).
 */
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './TrackSignalFeed.css';

const TRACKS = [
  { key: 'junior', label: '주니어-미드', icon: '🚀' },
  { key: 'senior', label: '시니어-리더', icon: '🧭' },
];

const DOMAINS = [
  { key: 'all', label: '전체' },
  { key: 'ai_llm', label: 'AI/LLM' },
  { key: 'system_design', label: 'System Design' },
  { key: 'devops', label: 'DevOps' },
  { key: 'tech_lead', label: 'Tech Lead' },
];
const DOMAIN_LABEL = Object.fromEntries(DOMAINS.map(d => [d.key, d.label]));

export default function TrackSignalFeed({ date }) {
  const { user, token } = useAuth();
  const [track, setTrack] = useState('junior');
  const [feed, setFeed] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeDomain, setActiveDomain] = useState('all');
  const [orbitState, setOrbitState] = useState({}); // cardId -> 'adding'|'added'|'error'

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setActiveDomain('all');
    fetch(`/api/daily/${date}/track/${track}`)
      .then(r => {
        if (r.ok) return r.json();
        return Promise.reject(new Error(r.status === 404 ? '아직 생성된 트랙 피드가 없습니다.' : `불러오기 실패 (${r.status})`));
      })
      .then(d => { if (!cancelled) setFeed(d); })
      .catch(e => { if (!cancelled) { setError(e.message); setFeed(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [date, track]);

  const addOrbit = useCallback(async (card) => {
    if (!user) {
      alert('오빗에 추가하려면 로그인이 필요합니다.');
      return;
    }
    setOrbitState(s => ({ ...s, [card.id]: 'adding' }));
    const doFetch = (tok) => fetch('/api/pacenote/add-orbit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tok}` },
      body: JSON.stringify({ action_challenge: card.action_challenge }),
    });
    try {
      let res = await doFetch(token);
      if (res.status === 401 && user) {
        const fresh = await user.getIdToken(true);
        res = await doFetch(fresh);
      }
      // 409(이미 추가됨)도 멱등 성공으로 처리
      setOrbitState(s => ({ ...s, [card.id]: (res.ok || res.status === 409) ? 'added' : 'error' }));
    } catch (e) {
      console.error('[TrackSignalFeed] add-orbit 실패:', e);
      setOrbitState(s => ({ ...s, [card.id]: 'error' }));
    }
  }, [user, token]);

  const cards = (feed?.cards || []).filter(c => activeDomain === 'all' || c.domain === activeDomain);

  return (
    <div className="daily-section fade-in">
      <div className="daily-section-header">
        <span className="daily-section-icon">🛰️</span>
        <h2 className="daily-section-title">Tech Track Signal</h2>
      </div>

      <div className="track-controls">
        {/* 트랙 토글 (C3) */}
        <div className="track-toggle">
          {TRACKS.map(tk => (
            <button
              key={tk.key}
              className={`track-toggle-btn haptic-trigger ${track === tk.key ? 'active' : ''}`}
              onClick={() => setTrack(tk.key)}
            >
              <span className="track-toggle-icon">{tk.icon}</span>{tk.label}
            </button>
          ))}
        </div>

        {/* 관심 도메인 필터 칩 (C3) */}
        {!loading && !error && feed && (
          <div className="track-chips">
            {DOMAINS.filter(d => d.key === 'all' || (feed.domains || []).includes(d.key)).map(d => (
              <button
                key={d.key}
                className={`track-chip haptic-trigger ${activeDomain === d.key ? 'active' : ''}`}
                onClick={() => setActiveDomain(d.key)}
              >
                {d.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 상태 */}
      {loading && <div className="track-status">트랙 피드 불러오는 중…</div>}
      {!loading && error && <div className="track-status">{error}</div>}

      {/* 카드 목록 (C3) */}
      {!loading && !error && cards.map(card => {
        const st = orbitState[card.id];
        return (
          <div key={card.id} className="track-card">
            <div className="track-card-meta">
              <span className="track-card-domain">{DOMAIN_LABEL[card.domain] || card.domain}</span>
              {(card.tags || []).slice(0, 5).map(tag => (
                <span key={tag} className="track-card-tag">#{tag}</span>
              ))}
            </div>

            <h3 className="track-card-title">{card.title}</h3>
            <p className="track-card-summary">{card.summary}</p>

            {/* action_challenge 미리보기 + 오빗 추가 (C4) */}
            {card.action_challenge && (
              <div className="track-challenge">
                <div className="track-challenge-title">🎯 {card.action_challenge.title}</div>
                <ol className="track-challenge-tasks">
                  {(card.action_challenge.tasks || []).map(tk => (
                    <li key={tk.seq}>{tk.text}</li>
                  ))}
                </ol>
                <button
                  className={`track-orbit-btn haptic-trigger ${st || ''}`}
                  onClick={() => addOrbit(card)}
                  disabled={st === 'adding' || st === 'added'}
                >
                  {st === 'added' ? '✓ 오빗에 추가됨' : st === 'adding' ? '추가 중…' : st === 'error' ? '실패 — 다시 시도' : '＋ 오빗에 추가'}
                </button>
              </div>
            )}
          </div>
        );
      })}

      {!loading && !error && cards.length === 0 && (
        <div className="track-status">해당 도메인의 카드가 없습니다.</div>
      )}
    </div>
  );
}
