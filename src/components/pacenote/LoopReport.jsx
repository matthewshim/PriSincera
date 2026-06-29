/**
 * LoopReport — 성장 루프 주간 리포트 (Growth Loop Phase 4)
 *
 * 유저가 자신의 배움→실행→복기 루프를 한 장으로 인지하도록 요약.
 * GET /api/pacenote/profile (Phase 0·1에서 적재/정합된 성장 프로파일)을 사용.
 * 비로그인/신호 없음(콜드 스타트) 시 렌더하지 않음.
 */
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './LoopReport.css';

const DOMAIN_LABEL = {
  ai_llm: 'AI/LLM', system_design: 'System Design', devops: 'DevOps', tech_lead: 'Tech Lead',
};
const prettyDomain = (key) =>
  DOMAIN_LABEL[key] || key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export default function LoopReport() {
  const { user, token } = useAuth();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!user) { setProfile(null); return; }
    let cancelled = false;
    const doFetch = (tok) => fetch('/api/pacenote/profile', { headers: { Authorization: `Bearer ${tok}` } });
    (async () => {
      try {
        let res = await doFetch(token);
        if (res.status === 401) { const fresh = await user.getIdToken(true); res = await doFetch(fresh); }
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setProfile(data);
      } catch { /* 무시 */ }
    })();
    return () => { cancelled = true; };
  }, [user, token]);

  if (!user || !profile) return null;

  const completion = profile.completion || {};
  const streak = profile.streak || {};
  const reflections = profile.recentReflections || [];
  const affinity = profile.domainAffinity || {};

  const picked = completion.picked || 0;
  const completed = completion.completed || 0;
  const rate = Math.round((completion.rate || 0) * 100);

  // 콜드 스타트: 아직 신호가 거의 없으면 숨김
  if (picked === 0 && reflections.length === 0) return null;

  const topDomain = Object.entries(affinity).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

  return (
    <div className="loop-report">
      <div className="loop-report-head">
        <span className="loop-report-icon">🔄</span>
        <span className="loop-report-title">성장 루프</span>
        <span className="loop-report-sub">배움 → 실행 → 복기</span>
      </div>
      <div className="loop-report-stats">
        <div className="loop-stat">
          <span className="loop-stat-label">실행 완료율</span>
          <span className="loop-stat-value">{rate}<span className="loop-stat-unit">%</span></span>
          <span className="loop-stat-sub">{completed}/{picked} 완료</span>
        </div>
        <div className="loop-stat">
          <span className="loop-stat-label">연속</span>
          <span className="loop-stat-value">🔥 {streak.current || 0}<span className="loop-stat-unit">주</span></span>
          <span className="loop-stat-sub">최장 {streak.best || 0}주</span>
        </div>
        <div className="loop-stat">
          <span className="loop-stat-label">복기</span>
          <span className="loop-stat-value">{reflections.length}</span>
          <span className="loop-stat-sub">회고 기록</span>
        </div>
        {topDomain && (
          <div className="loop-stat loop-stat-domain">
            <span className="loop-stat-label">집중 도메인</span>
            <span className="loop-stat-value loop-stat-domain-name">🧭 {prettyDomain(topDomain)}</span>
            <span className="loop-stat-sub">내일의 배움 강조</span>
          </div>
        )}
      </div>
    </div>
  );
}
