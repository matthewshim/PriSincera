/**
 * DailyBriefing — 아카이브 상세 상단 '오늘의 브리핑' (UI 재편 2026-07)
 *
 * 첫 스크린에서 그날의 전모를 파악하게 하는 오버뷰:
 * 채널별 분량 스탯 + 정독 예상 시간 + DM Pick 헤드라인(클릭 시 해당 카드로 스크롤).
 * 데이터는 /api/daily/:date 응답만 사용 — 파이프라인 변경 없음.
 */
export default function DailyBriefing({ daily, onJumpPick }) {
  const study = daily?.study;
  const articles = daily?.signal?.articles || [];
  // SignalSection과 동일 순서(DM Pick 내 스코어 내림차순) — sig-pick-N 앵커 인덱스와 일치해야 한다
  const picks = articles.filter(a => a.isDmPick).sort((a, b) => b.weightedScore - a.weightedScore);

  // 정독 예상 시간 — 한국어 정독 속도 약 500자/분. 트랙 4카드는 계약 고정 분량(요약+개념+포인트+할 일) 보정치.
  const TRACK_EST_CHARS = 1800;
  const chars = TRACK_EST_CHARS
    + articles.reduce((n, a) => n + (a.title?.length || 0) + (a.insight?.length || 0) + (a.summary?.length || 0), 0)
    + (study?.prompt_snippet?.length || 0) + (study?.explanation?.length || 0) + (study?.business_context?.length || 0)
    + (study?.vocabulary || []).reduce((n, v) => n + (v.word?.length || 0) + (v.meaning?.length || 0), 0);
  const readMin = Math.max(1, Math.round(chars / 500));

  const stats = [
    { key: 'track', text: '🛰️ 트랙 카드', n: 4 }, // Data Contract v2 — 도메인당 1개 × 4 고정
    articles.length > 0 && { key: 'signal', text: '📰 시그널', n: articles.length },
    study?.prompt_snippet && { key: 'prompt', text: '🤖 프롬프트', n: 1 },
    study?.sentence_jp && { key: 'jp', text: '🇯🇵 일본어', n: 1 },
  ].filter(Boolean);

  return (
    <section className="rl-brief" aria-label="오늘의 브리핑">
      <div className="rl-brief-head">
        <span className="rl-brief-badge">Today's Briefing</span>
        <span className="rl-brief-time">정독 약 {readMin}분</span>
      </div>
      <div className="rl-brief-stats">
        {stats.map(s => (
          <span key={s.key} className="rl-brief-stat">{s.text} <b>{s.n}</b></span>
        ))}
      </div>
      {picks.length > 0 && (
        <ol className="rl-brief-picks">
          {picks.map((a, i) => (
            <li key={i}>
              <button className="rl-brief-pick haptic-trigger" onClick={() => onJumpPick?.(i)}>
                <span className="rl-brief-pick-no">{String(i + 1).padStart(2, '0')}</span>
                <span className="rl-brief-pick-title">{a.title}</span>
                {a.source && <span className="rl-brief-pick-src">{a.source}</span>}
              </button>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
