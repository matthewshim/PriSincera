/**
 * ScoringService — AI 스코어링 이후의 품질 필터링, 정렬, 캡 적용 로직 전담
 */

/**
 * AI가 스코어링한 아티클 목록을 품질 기준에 맞춰 필터링합니다.
 * 
 * @param {Array} weightedArticles 가중치가 적용된 아티클 목록
 * @param {Array} dmPickIds DM 픽으로 선정된 아티클 ID 목록
 * @returns {Object} { finalArticles, catSummary }
 */
export function filterAndCapArticles(weightedArticles, dmPickIds) {
  const MIN_PER_CATEGORY = 2;     // 카테고리당 최소 2개 보장 (있는 만큼)
  const MAX_PER_CATEGORY = 8;     // 카테고리당 최대 8개
  const MIN_WEIGHTED_SCORE = 14;  // 가중 점수 14점 미만 제외 (최소 보장분 제외)

  const sorted = [...weightedArticles].sort((a, b) => b.weightedScore - a.weightedScore);

  // Pass 1: 카테고리별 최소 보장 — 점수와 무관하게 상위 N개 확보
  const guaranteed = new Set();
  const catMinCounts = {};
  for (const a of sorted) {
    catMinCounts[a.category] = (catMinCounts[a.category] || 0) + 1;
    if (catMinCounts[a.category] <= MIN_PER_CATEGORY) {
      guaranteed.add(a.id);
    }
  }

  // Pass 2: 점수 임계값 통과 기사 + DM 픽 추가
  const qualifiedIds = new Set(guaranteed);
  for (const a of sorted) {
    if (a.weightedScore >= MIN_WEIGHTED_SCORE || dmPickIds.includes(a.id)) {
      qualifiedIds.add(a.id);
    }
  }

  // Pass 3: 카테고리별 최대 캡 적용
  const catCapCounts = {};
  const cappedArticles = sorted.filter(a => {
    if (!qualifiedIds.has(a.id)) return false;
    catCapCounts[a.category] = (catCapCounts[a.category] || 0) + 1;
    // 최소 보장분과 DM 픽은 캡에서 제외
    if (guaranteed.has(a.id) || dmPickIds.includes(a.id)) return true;
    return catCapCounts[a.category] <= MAX_PER_CATEGORY;
  });

  // 필터 결과 카테고리별 요약 생성
  const catFinal = {};
  cappedArticles.forEach(a => { catFinal[a.category] = (catFinal[a.category] || 0) + 1; });
  const catSummary = Object.entries(catFinal).map(([k, v]) => `${k}:${v}`).join(', ');

  return {
    filteredArticles: cappedArticles,
    catSummary
  };
}

/**
 * 필터링된 아티클 배열에 DM 픽 코멘트를 매핑하여 최종 형태를 만듭니다.
 */
export function mapEditorComments(filteredArticles, dmWithComments, dmPickIds) {
  const commentMap = new Map(dmWithComments.map(a => [a.id, a.editorComment]));
  return filteredArticles.map(a => ({
    ...a,
    isDmPick: dmPickIds.includes(a.id),
    editorComment: commentMap.get(a.id) || null,
  }));
}
