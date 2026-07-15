/**
 * SignalSection — IT Tech Signal 섹션 (DM Pick 우선 + 스코어 정렬 그리드)
 *
 * ReLearn Phase B-0 추출: DailyDigest의 detailTab==='signal' 렌더 블록을
 * 동작·마크업 동일하게 컴포넌트화. /daily 와 /relearn(배움 채널)이 공용.
 */
import SignalArticleCard from './SignalArticleCard';
import '../../pages/DailyDigest.css';

export default function SignalSection({ signal }) {
  if (!signal) return null;

  return (
    <div className="daily-section fade-in">
      <div className="daily-section-header">
        <span className="daily-section-icon">📰</span>
        <h2 className="daily-section-title">IT Tech Signal</h2>
      </div>
      <div className="signal-articles-grid">
        {[...(signal.articles || [])]
          .sort((a, b) => {
            if (a.isDmPick && !b.isDmPick) return -1;
            if (!a.isDmPick && b.isDmPick) return 1;
            return b.weightedScore - a.weightedScore;
          })
          .map((article, idx) => (
          <SignalArticleCard
            key={idx}
            article={article}
          />
        ))}
      </div>
    </div>
  );
}
