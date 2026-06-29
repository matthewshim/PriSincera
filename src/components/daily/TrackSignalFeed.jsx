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
  const [orbitState, setOrbitState] = useState({}); // cardId -> 'adding'|'error' (전송 중 상태)
  const [addedBaseIds, setAddedBaseIds] = useState(new Set()); // 이미 추가된 orbit base id (orbit-<ac.id>)
  const [affinity, setAffinity] = useState(null); // 성장 루프 Phase 3: 유저 도메인 선호(개인화 렌즈)

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

  // 로그인 시 이번 주에 이미 추가된 궤도 base id 조회 (read-only — '이미 추가됨' 표시용)
  useEffect(() => {
    if (!user) { setAddedBaseIds(new Set()); return; }
    let cancelled = false;
    const doFetch = (tok) => fetch('/api/pacenote/orbit-ids', { headers: { Authorization: `Bearer ${tok}` } });
    (async () => {
      try {
        let res = await doFetch(token);
        if (res.status === 401) { const fresh = await user.getIdToken(true); res = await doFetch(fresh); }
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setAddedBaseIds(new Set(data.orbitBaseIds || []));
      } catch { /* 무시 */ }
    })();
    return () => { cancelled = true; };
  }, [user, token]);

  // 성장 루프 Phase 3: 유저 도메인 선호(affinity) 조회 → 개인화 렌즈(재정렬·하이라이트)
  useEffect(() => {
    if (!user) { setAffinity(null); return; }
    let cancelled = false;
    const doFetch = (tok) => fetch('/api/pacenote/profile', { headers: { Authorization: `Bearer ${tok}` } });
    (async () => {
      try {
        let res = await doFetch(token);
        if (res.status === 401) { const fresh = await user.getIdToken(true); res = await doFetch(fresh); }
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setAffinity(data.domainAffinity || {});
      } catch { /* 무시 — 비로그인/오류 시 글로벌 정렬 */ }
    })();
    return () => { cancelled = true; };
  }, [user, token]);

  const addOrbit = useCallback(async (card) => {
    if (!user) {
      alert('실행의 궤도에 추가하려면 로그인이 필요합니다.');
      return;
    }
    const baseId = card.action_challenge?.id ? `orbit-${card.action_challenge.id}` : null;
    setOrbitState(s => ({ ...s, [card.id]: 'adding' }));
    const doFetch = (tok) => fetch('/api/pacenote/add-orbit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tok}` },
      // 각 action 항목을 도메인 카테고리의 개별 궤도로 등록
      body: JSON.stringify({ action_challenge: card.action_challenge, domain: card.domain }),
    });
    try {
      let res = await doFetch(token);
      if (res.status === 401 && user) {
        const fresh = await user.getIdToken(true);
        res = await doFetch(fresh);
      }
      if (res.ok || res.status === 409) {
        // 성공/이미추가(409) → 영구 '추가됨' 표시
        if (baseId) setAddedBaseIds(prev => new Set(prev).add(baseId));
        setOrbitState(s => { const n = { ...s }; delete n[card.id]; return n; });
      } else {
        setOrbitState(s => ({ ...s, [card.id]: 'error' }));
      }
    } catch (e) {
      console.error('[TrackSignalFeed] add-orbit 실패:', e);
      setOrbitState(s => ({ ...s, [card.id]: 'error' }));
    }
  }, [user, token]);

  // ── Phase 3 개인화 렌즈 ── (affinity 키는 card.domain과 동일: ai_llm/system_design/devops/tech_lead)
  const domainScore = (d) => (affinity && affinity[d]) || 0;
  const myDomains = new Set(
    affinity ? DOMAINS.map(d => d.key).filter(k => k !== 'all' && domainScore(k) > 0) : []
  );
  // '전체' 보기에서만 내 궤도 도메인을 상단으로 재정렬 (특정 도메인 필터 시엔 그대로)
  let cards = (feed?.cards || []).filter(c => activeDomain === 'all' || c.domain === activeDomain);
  if (activeDomain === 'all' && myDomains.size > 0) {
    cards = [...cards].sort((a, b) => domainScore(b.domain) - domainScore(a.domain));
  }
  // 오늘 피드에 존재하면서 내 선호가 가장 높은 도메인 (배너용)
  const topDomain = (() => {
    if (!myDomains.size || !feed) return null;
    const cand = (feed.domains || []).filter(d => myDomains.has(d));
    if (!cand.length) return null;
    return cand.sort((a, b) => domainScore(b) - domainScore(a))[0];
  })();

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

      {/* 🧭 실행→배움 연결 배너 (Phase 3): 내 궤도와 연결된 오늘의 도메인 */}
      {!loading && !error && topDomain && activeDomain === 'all' && (
        <button className="track-loop-banner haptic-trigger" onClick={() => setActiveDomain(topDomain)}>
          <span className="track-loop-banner-icon">🧭</span>
          <span className="track-loop-banner-text">
            당신의 궤도와 연결된 오늘의 배움 · <strong>{DOMAIN_LABEL[topDomain] || topDomain}</strong>
          </span>
          <span className="track-loop-banner-cta">바로 보기 →</span>
        </button>
      )}

      {/* 카드 목록 (C3) */}
      {!loading && !error && cards.map(card => {
        const baseId = card.action_challenge?.id ? `orbit-${card.action_challenge.id}` : null;
        const isAdded = !!(baseId && addedBaseIds.has(baseId));
        const st = isAdded ? 'added' : orbitState[card.id];
        return (
          <div key={card.id} className="track-card">
            <div className="track-card-meta">
              <span className="track-card-domain">{DOMAIN_LABEL[card.domain] || card.domain}</span>
              {myDomains.has(card.domain) && <span className="track-card-mine">🧭 내 궤도</span>}
              {(card.tags || []).slice(0, 5).map(tag => (
                <span key={tag} className="track-card-tag">#{tag}</span>
              ))}
            </div>

            <h3 className="track-card-title">{card.title}</h3>
            <p className="track-card-summary">{card.summary}</p>

            {/* 📚 학습 레이어 (개념 + 핵심 포인트) — 실전 전에 먼저 배운다 */}
            {card.learning && (card.learning.concept || (card.learning.key_points || []).length > 0) && (
              <div className="track-learning">
                <div className="track-learning-label">📚 학습</div>
                {card.learning.concept && <p className="track-learning-concept">{card.learning.concept}</p>}
                {(card.learning.key_points || []).length > 0 && (
                  <ul className="track-learning-points">
                    {card.learning.key_points.map((p, i) => <li key={i}>{p}</li>)}
                  </ul>
                )}
              </div>
            )}

            {/* 🎯 action_challenge 미리보기 + 오빗 추가 (C4) */}
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
                  {st === 'added' ? '✓ 실행의 궤도에 추가됨' : st === 'adding' ? '추가 중…' : st === 'error' ? '실패 — 다시 시도' : '＋ 실행의 궤도에 추가'}
                </button>
              </div>
            )}

            {/* 🔗 실제 출처 원문 링크 (하이브리드 — 근거 있는 경우만) */}
            {card.sourceUrl && (
              <a className="track-source-link" href={card.sourceUrl} target="_blank" rel="noopener noreferrer">
                🔗 {card.sourceName || '원문'} 읽기 →
              </a>
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
