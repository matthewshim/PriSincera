/**
 * LoopReport — 성장 루프 리포트 (Growth Loop Phase 4 · 일자축 Phase 1로 일 기반 전환)
 *
 * 유저가 자신의 배움→실행→복기 루프를 한 장으로 인지하도록 요약.
 * GET /api/pacenote/profile (Phase 0·1에서 적재/정합된 성장 프로파일)을 사용.
 * 비로그인/신호 없음(콜드 스타트) 시 렌더하지 않음.
 */
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../contexts/LanguageContext';
import './LoopReport.css';

const DOMAIN_LABEL = {
  ai_llm: 'AI/LLM', system_design: 'System Design', devops: 'DevOps', tech_lead: 'Tech Lead',
};
const prettyDomain = (key) =>
  DOMAIN_LABEL[key] || key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

// externalProfile: 셸(ReLearn)이 1회 페치한 프로파일 주입용 — 제공 시 자체 페치 생략(중복 방지)
export default function LoopReport({ profile: externalProfile }) {
  const { user, token } = useAuth();
  const { t } = useTranslation();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (externalProfile !== undefined) { setProfile(externalProfile); return; }
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
  }, [user, token, externalProfile]);

  if (!user || !profile) return null;

  const completion = profile.completion || {};
  const practice = profile.practice || {};
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
        <span className="loop-report-title">{t('relearn.loop.title')}</span>
        <span className="loop-report-sub">{t('relearn.loop.sub')}</span>
      </div>
      <div className="loop-report-stats">
        <div className="loop-stat">
          <span className="loop-stat-label">{t('relearn.loop.rateLabel')}</span>
          <span className="loop-stat-value">{rate}<span className="loop-stat-unit">%</span></span>
          <span className="loop-stat-sub">{t('relearn.loop.rateSub', { done: completed, picked })}</span>
        </div>
        <div className="loop-stat">
          <span className="loop-stat-label">{t('relearn.loop.monthLabel')}</span>
          <span className="loop-stat-value">🔥 {practice.monthDays || 0}<span className="loop-stat-unit">{t('relearn.loop.monthUnit')}</span></span>
          <span className="loop-stat-sub">{t('relearn.loop.monthSub', { n: practice.last7Days || 0 })}</span>
        </div>
        <div className="loop-stat">
          <span className="loop-stat-label">{t('relearn.loop.reflectLabel')}</span>
          <span className="loop-stat-value">{reflections.length}</span>
          <span className="loop-stat-sub">{t('relearn.loop.reflectSub')}</span>
        </div>
        {topDomain && (
          <div className="loop-stat loop-stat-domain">
            <span className="loop-stat-label">{t('relearn.loop.domainLabel')}</span>
            <span className="loop-stat-value loop-stat-domain-name">🧭 {prettyDomain(topDomain)}</span>
            <span className="loop-stat-sub">{t('relearn.loop.domainSub')}</span>
          </div>
        )}
      </div>
    </div>
  );
}
