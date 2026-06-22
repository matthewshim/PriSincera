/**
 * TrackSignalFeed — 수준별 테크 트랙 시그널 피드 (Data Contract v2 §1.2)
 *
 * C3: 트랙 탭(주니어/시니어) + 관심 도메인 필터 칩
 * C4: 카드별 action_challenge → [오빗 추가] (Click-to-Orbit, POST /api/pacenote/add-orbit)
 *
 * 자립형 컴포넌트: GCS 트랙 피드를 서버 프록시(/api/daily/:date/track/:track)로 받아 렌더.
 * 기존 DailyDigest의 signal/study 패널과 독립적으로 동작(가산).
 */
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';

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

      {/* 트랙 토글 (C3) */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {TRACKS.map(tk => (
          <button
            key={tk.key}
            className="haptic-trigger"
            onClick={() => setTrack(tk.key)}
            style={{
              flex: 1, padding: '10px 12px', borderRadius: 12, cursor: 'pointer',
              border: track === tk.key ? '1px solid #60A5FA' : '1px solid rgba(148,163,184,0.25)',
              background: track === tk.key ? 'rgba(96,165,250,0.12)' : 'transparent',
              color: track === tk.key ? '#60A5FA' : 'var(--text-muted, #9CA3AF)',
              fontWeight: 600, fontSize: '0.9rem',
            }}
          >
            <span style={{ marginRight: 6 }}>{tk.icon}</span>{tk.label}
          </button>
        ))}
      </div>

      {/* 관심 도메인 필터 칩 (C3) */}
      {!loading && !error && feed && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {DOMAINS.filter(d => d.key === 'all' || (feed.domains || []).includes(d.key)).map(d => (
            <button
              key={d.key}
              className="haptic-trigger"
              onClick={() => setActiveDomain(d.key)}
              style={{
                padding: '6px 12px', borderRadius: 999, cursor: 'pointer', fontSize: '0.8rem',
                border: activeDomain === d.key ? '1px solid #A78BFA' : '1px solid rgba(148,163,184,0.25)',
                background: activeDomain === d.key ? 'rgba(167,139,250,0.14)' : 'transparent',
                color: activeDomain === d.key ? '#A78BFA' : 'var(--text-muted, #9CA3AF)',
                fontWeight: 500,
              }}
            >
              {d.label}
            </button>
          ))}
        </div>
      )}

      {/* 상태 */}
      {loading && <div style={{ textAlign: 'center', color: '#9CA3AF', padding: '32px 0' }}>트랙 피드 불러오는 중…</div>}
      {!loading && error && <div style={{ textAlign: 'center', color: '#9CA3AF', padding: '32px 0' }}>{error}</div>}

      {/* 카드 목록 (C3) */}
      {!loading && !error && cards.map(card => {
        const st = orbitState[card.id];
        return (
          <div
            key={card.id}
            className="premium-3d-card"
            style={{
              border: '1px solid rgba(148,163,184,0.18)', borderRadius: 16,
              padding: 18, marginBottom: 14, background: 'rgba(255,255,255,0.02)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
              <span style={{
                fontSize: '0.72rem', fontWeight: 700, padding: '3px 9px', borderRadius: 999,
                background: 'rgba(96,165,250,0.14)', color: '#60A5FA',
              }}>{DOMAIN_LABEL[card.domain] || card.domain}</span>
              {(card.tags || []).slice(0, 5).map(tag => (
                <span key={tag} style={{ fontSize: '0.72rem', color: 'var(--text-muted, #9CA3AF)', fontFamily: 'var(--font-mono, monospace)' }}>#{tag}</span>
              ))}
            </div>

            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 6px', lineHeight: 1.4 }}>{card.title}</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted, #9CA3AF)', margin: '0 0 14px', lineHeight: 1.6 }}>{card.summary}</p>

            {/* action_challenge 미리보기 + 오빗 추가 (C4) */}
            {card.action_challenge && (
              <div style={{ borderTop: '1px dashed rgba(148,163,184,0.2)', paddingTop: 12 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: 8, color: 'var(--text, #E5E7EB)' }}>
                  🎯 {card.action_challenge.title}
                </div>
                <ol style={{ margin: '0 0 12px', paddingLeft: 18, color: 'var(--text-muted, #9CA3AF)', fontSize: '0.84rem', lineHeight: 1.7 }}>
                  {(card.action_challenge.tasks || []).map(tk => (
                    <li key={tk.seq}>{tk.text}</li>
                  ))}
                </ol>
                <button
                  className="haptic-trigger"
                  onClick={() => addOrbit(card)}
                  disabled={st === 'adding' || st === 'added'}
                  style={{
                    padding: '8px 16px', borderRadius: 10, cursor: st === 'added' ? 'default' : 'pointer',
                    border: 'none', fontWeight: 600, fontSize: '0.85rem',
                    background: st === 'added' ? 'rgba(16,185,129,0.15)' : st === 'error' ? 'rgba(239,68,68,0.15)' : 'linear-gradient(135deg,#60A5FA,#A78BFA)',
                    color: st === 'added' ? '#10B981' : st === 'error' ? '#EF4444' : '#fff',
                    opacity: st === 'adding' ? 0.7 : 1,
                  }}
                >
                  {st === 'added' ? '✓ 오빗에 추가됨' : st === 'adding' ? '추가 중…' : st === 'error' ? '실패 — 다시 시도' : '＋ 오빗에 추가'}
                </button>
              </div>
            )}
          </div>
        );
      })}

      {!loading && !error && cards.length === 0 && (
        <div style={{ textAlign: 'center', color: '#9CA3AF', padding: '24px 0' }}>해당 도메인의 카드가 없습니다.</div>
      )}
    </div>
  );
}
