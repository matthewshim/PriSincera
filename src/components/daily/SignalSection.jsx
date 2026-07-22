/**
 * SignalSection — IT Tech Signal 섹션 (DM Pick 우선 + 스코어 정렬 그리드)
 *
 * ReLearn Phase B-0 추출: DailyDigest의 detailTab==='signal' 렌더 블록을
 * 동작·마크업 동일하게 컴포넌트화. /daily 와 /relearn(배움 채널)이 공용.
 */
import SignalArticleCard from './SignalArticleCard';
import { getCategoryStyles } from './categoryStyles';
import '../../pages/DailyDigest.css';

// limit(옵션): 표시할 아티클 상한 — ReLearn 배움 채널의 스크롤 피로 축소용. 미지정 시 전체(/daily 기존 동작).
// splitHeadlines(옵션): 아카이브 훑어보기 모드 — DM Pick만 카드형 유지, 나머지는 1줄 헤드라인 리스트로 강등.
export default function SignalSection({ signal, limit, compact, splitHeadlines }) {
  if (!signal) return null;

  const sorted = [...(signal.articles || [])].sort((a, b) => {
    if (a.isDmPick && !b.isDmPick) return -1;
    if (!a.isDmPick && b.isDmPick) return 1;
    return b.weightedScore - a.weightedScore;
  });
  const shown = typeof limit === 'number' ? sorted.slice(0, limit) : sorted;
  // sorted는 DM Pick 선두 정렬이므로 앞쪽 인덱스 = DM Pick 순번 — 브리핑의 sig-pick-N 앵커와 일치
  const picks = sorted.filter(a => a.isDmPick);
  const rest = sorted.filter(a => !a.isDmPick);

  return (
    <div className="daily-section fade-in">
      <div className="daily-section-header">
        <span className="daily-section-icon">📰</span>
        <h2 className="daily-section-title">IT Tech Signal</h2>
      </div>
      {!splitHeadlines && (
        <div className="signal-articles-grid">
          {shown.map((article, idx) => (
            <SignalArticleCard
              key={idx}
              article={article}
              compact={compact}
              domId={article.isDmPick ? `sig-pick-${idx}` : undefined}
            />
          ))}
        </div>
      )}
      {splitHeadlines && (
        <>
          <div className="signal-articles-grid">
            {picks.map((article, idx) => (
              <SignalArticleCard key={idx} article={article} domId={`sig-pick-${idx}`} />
            ))}
          </div>
          {rest.length > 0 && (
            <div className="signal-headline-block">
              <div className="signal-headline-label">전체 헤드라인 <span>{rest.length}</span></div>
              <div className="signal-headline-list">
                {rest.map((a, i) => (
                  <a
                    key={i}
                    className="signal-headline-row haptic-trigger"
                    href={a.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {a.category && <span className="signal-headline-cat" style={getCategoryStyles(a.category)}>{a.category}</span>}
                    <span className="signal-headline-title">{a.title}</span>
                    <span className="signal-headline-meta">
                      {a.source && <span className="signal-headline-src">{a.source}</span>}
                      {a.weightedScore != null && <span className="signal-headline-score">★ {Number(a.weightedScore).toFixed(1)}</span>}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
