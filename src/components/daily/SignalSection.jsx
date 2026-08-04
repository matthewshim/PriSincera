/**
 * SignalSection — IT Tech Signal 섹션 (DM Pick 우선 + 스코어 정렬 그리드)
 *
 * ReLearn Phase B-0 추출: DailyDigest의 detailTab==='signal' 렌더 블록을
 * 동작·마크업 동일하게 컴포넌트화. /daily 와 /relearn(배움 채널)이 공용.
 */
import SignalArticleCard from './SignalArticleCard';
import '../../pages/DailyDigest.css';

// limit(옵션): 표시할 아티클 상한 — 미지정 시 전체.
// headerAction(옵션): 섹션 헤더 우측 액션(궤도 추가 버튼 등).
export default function SignalSection({ signal, limit, compact, headerAction }) {
  if (!signal) return null;

  const sorted = [...(signal.articles || [])].sort((a, b) => {
    if (a.isDmPick && !b.isDmPick) return -1;
    if (!a.isDmPick && b.isDmPick) return 1;
    return b.weightedScore - a.weightedScore;
  });
  const shown = typeof limit === 'number' ? sorted.slice(0, limit) : sorted;

  return (
    <div className="daily-section fade-in">
      <div className="daily-section-header">
        <span className="daily-section-icon">📰</span>
        <h2 className="daily-section-title">IT Tech Signal</h2>
        {headerAction && <div className="daily-section-action">{headerAction}</div>}
      </div>
      <div className="signal-articles-grid">
        {shown.map((article, idx) => (
          <SignalArticleCard key={idx} article={article} compact={compact} />
        ))}
      </div>
    </div>
  );
}
