/**
 * SIGNAL 스코어링 — Tier 가중치 적용 + 다양성 보장 선정 로직
 * Daily Model v2: selectTopN + assembleDailyDM 추가
 */

const TIER_WEIGHTS = { 1: 1.5, 2: 1.0, 3: 0.7 };

const CATEGORY_ICONS = {
  attitude: '🎯',
  priority: '⚡',
  ai: '🤖',
  global: '🌍',
  product: '📦',
};

const CATEGORY_NAMES = {
  attitude: 'Attitude',
  priority: 'Priority',
  ai: 'AI & Future',
  global: 'Global Lens',
  product: 'Product Craft',
};

/**
 * Tier 가중치를 적용하여 최종 점수를 계산합니다.
 */
export function applyTierWeights(articles) {
  return articles.map(a => ({
    ...a,
    weightedScore: (a.totalScore || 0) * (TIER_WEIGHTS[a.tier] || 1.0),
  }));
}

/**
 * 다양성 제약 조건을 적용하여 최종 아티클을 선정합니다.
 *
 * 규칙:
 * - 최소 minArticles개, 최대 maxArticles개
 * - 최소 minCategories개 카테고리 포함
 * - T1 소스 최소 tier1Min개 포함
 * - weightedScore 기준 내림차순 선정
 */
export function selectArticles(scoredArticles, settings) {
  const { minArticles = 3, maxArticles = 5, minCategories = 2, tier1Minimum = 1 } = settings;

  // 점수 내림차순 정렬
  const sorted = [...scoredArticles].sort((a, b) => b.weightedScore - a.weightedScore);

  const selected = [];
  const categories = new Set();
  let tier1Count = 0;

  // 1단계: T1 소스 최소 보장
  for (const article of sorted) {
    if (tier1Count >= tier1Minimum) break;
    if (article.tier === 1 && !selected.find(s => s.id === article.id)) {
      selected.push(article);
      categories.add(article.category);
      tier1Count++;
    }
  }

  // 2단계: 카테고리 다양성 보장
  if (categories.size < minCategories) {
    for (const article of sorted) {
      if (categories.size >= minCategories) break;
      if (!categories.has(article.category) && !selected.find(s => s.id === article.id)) {
        selected.push(article);
        categories.add(article.category);
      }
    }
  }

  // 3단계: 나머지 슬롯을 점수순으로 채움
  for (const article of sorted) {
    if (selected.length >= maxArticles) break;
    if (!selected.find(s => s.id === article.id)) {
      selected.push(article);
      categories.add(article.category);
    }
  }

  // 최소 아티클 수 미달 시 경고
  if (selected.length < minArticles) {
    console.warn(`[Scoring] ⚠ 선정 아티클 ${selected.length}개 < 최소 ${minArticles}개`);
  }

  // 최종 점수순 재정렬
  selected.sort((a, b) => b.weightedScore - a.weightedScore);

  console.log(`[Scoring] 최종 선정: ${selected.length}개 아티클, ${categories.size}개 카테고리, T1 ${tier1Count}개`);
  return selected;
}

/**
 * 선정된 아티클을 뉴스레터 Markdown으로 조립합니다.
 */
export function assembleNewsletter({ issueNumber, editorNote, articles, closingRemark }) {
  const lines = [];

  // 에디터 노트
  lines.push(`✍️ **에디터 노트**\n`);
  lines.push(editorNote);
  lines.push(`\n---\n`);

  // 아티클 섹션
  for (const article of articles) {
    const icon = CATEGORY_ICONS[article.category] || '📌';
    const catName = CATEGORY_NAMES[article.category] || article.category;
    lines.push(`${icon} **[${catName}] "${article.title}"**`);
    lines.push(`${article.source} · [원문 읽기](${article.url})`);
    lines.push(`\n→ ${article.editorComment}\n`);
  }

  // 마무리
  lines.push(`---\n`);
  lines.push(`💬 **이번 주의 한 마디**\n`);
  lines.push(closingRemark);
  lines.push(`\n---\n`);
  lines.push(`🔗 [prisincera.com에서 더 보기](https://www.prisincera.com/prisignal)`);

  return lines.join('\n');
}

// ─── Daily Model v2 ──────────────────────────────────

/**
 * 점수 내림차순으로 상위 N개를 선정합니다. (Daily DM 픽용)
 * 다양성 제약: 최소 2개 카테고리 포함
 */
export function selectTopN(scoredArticles, n = 5) {
  const sorted = [...scoredArticles].sort((a, b) => b.weightedScore - a.weightedScore);
  const selected = [];
  const categories = new Set();

  // 1단계: 카테고리 다양성 보장 (최소 2개)
  for (const article of sorted) {
    if (categories.size >= 2) break;
    if (!categories.has(article.category)) {
      selected.push(article);
      categories.add(article.category);
    }
  }

  // 2단계: 나머지 점수순 채움
  for (const article of sorted) {
    if (selected.length >= n) break;
    if (!selected.find(s => s.id === article.id)) {
      selected.push(article);
    }
  }

  selected.sort((a, b) => b.weightedScore - a.weightedScore);
  console.log(`[Scoring] DM 픽 선정: ${selected.length}개, ${new Set(selected.map(a => a.category)).size}개 카테고리`);
  return selected;
}

/**
 * 데일리 DM Markdown을 조립합니다.
 * "더보기" 링크로 웹 유입을 유도합니다.
 */
export function assembleDailyDM({ date, articles, dailyPageUrl, totalCount }) {
  const lines = [];

  lines.push(`📡 **오늘의 시그널** — ${formatDateKR(date)}\n`);
  lines.push(`오늘 ${totalCount}개의 시그널 중 **${articles.length}개**를 선별했습니다.\n`);
  lines.push(`---\n`);

  for (let i = 0; i < articles.length; i++) {
    const a = articles[i];
    const icon = CATEGORY_ICONS[a.category] || '📌';
    const catName = CATEGORY_NAMES[a.category] || a.category;
    const tierBadge = a.tier === 1 ? ' 🌟' : '';

    lines.push(`**${i + 1}. ${icon} [${catName}] ${a.title}**${tierBadge}`);
    lines.push(`${a.source} · [원문 읽기](${a.url})`);
    if (a.editorComment) {
      lines.push(`\n> ${a.editorComment}\n`);
    }
  }

  lines.push(`---\n`);
  lines.push(`📂 **오늘의 시그널 전체 보기 (${totalCount}개)**`);
  lines.push(`[👉 ${dailyPageUrl}](${dailyPageUrl})\n`);
  lines.push(`---\n`);
  lines.push(`🔗 [PriSignal 구독 관리](https://www.prisincera.com/prisignal)`);

  return lines.join('\n');
}

/** 날짜 한국어 포맷 */
function formatDateKR(dateStr) {
  const [y, m, d] = dateStr.split('-');
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const dt = new Date(Number(y), Number(m) - 1, Number(d));
  return `${Number(m)}월 ${Number(d)}일 (${days[dt.getDay()]})`;
}

export { CATEGORY_ICONS, CATEGORY_NAMES };
