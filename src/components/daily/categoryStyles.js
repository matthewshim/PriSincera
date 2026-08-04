/**
 * getCategoryStyles — 시그널 아티클 카테고리 칩 색상 규칙 (브랜드 4색 그룹 정합)
 *
 * ReLearn Phase B-0 추출: DailyDigest 내부 헬퍼를 공유 모듈로 분리.
 * DailyDigest(Quick Peek)·SignalArticleCard 공용.
 *
 * 디자인 시스템 정합(v5.11): 기존 쨍한 tailwind 다색(emerald/amber/blue/red)을 제거하고
 * 브랜드 4색(cyan/indigo/gold/lavender)으로 카테고리를 그룹핑한다(v5.0 천체 테마·절제 원칙).
 * 칩 알파는 §9-4 4단 사용: 배경 0.06(호버 배경 단) · inset 보더 0.16(비활성 보더 단).
 */
const chip = (color, r, g, b) => ({
  color,
  background: `rgba(${r}, ${g}, ${b}, 0.06)`,
  boxShadow: `inset 0 0 0 1px rgba(${r}, ${g}, ${b}, 0.16)`,
});

export const getCategoryStyles = (category) => {
  if (!category) return {};
  const cat = category.toLowerCase();

  // 기술·정보 (AI · Tech · Dev · SW) → Aether Cyan
  if (cat.includes('ai') || cat.includes('인공지능') || cat.includes('intelligence')
    || cat.includes('tech') || cat.includes('개발') || cat.includes('software'))
    return chip('var(--color-cyan)', 34, 211, 238);

  // 거시·동향 (Global · Trend) → Nebula Indigo
  if (cat.includes('global') || cat.includes('글로벌') || cat.includes('trend') || cat.includes('트렌드'))
    return chip('var(--color-indigo)', 165, 180, 252);

  // 전략·비즈니스 (Priority · Strategy · Startup · Business) → Starlight Gold
  if (cat.includes('priority') || cat.includes('strategy') || cat.includes('전략')
    || cat.includes('startup') || cat.includes('스타트업') || cat.includes('business') || cat.includes('비즈니스'))
    return chip('var(--color-gold)', 229, 178, 93);

  // 기타 (Attitude · Security · 기본) → Lavender
  return chip('var(--prism-lavender)', 199, 210, 254);
};

export default getCategoryStyles;
