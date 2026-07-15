/**
 * getCategoryStyles — 시그널 아티클 카테고리 칩 색상 규칙 (디자인 시스템 토큰 정합)
 *
 * ReLearn Phase B-0 추출: DailyDigest 내부 헬퍼를 공유 모듈로 분리.
 * DailyDigest(Quick Peek)·SignalArticleCard 공용.
 */
export const getCategoryStyles = (category) => {
  if (!category) return {};
  const cat = category.toLowerCase();

  // AI / 인공지능 (Cyan)
  if (cat.includes('ai') || cat.includes('인공지능') || cat.includes('intelligence'))
    return { color: 'var(--color-cyan)', background: 'rgba(34, 211, 238, 0.12)', boxShadow: 'inset 0 0 0 1px rgba(34, 211, 238, 0.25)' };

  // Attitude / Mindset (Emerald/Green)
  if (cat.includes('attitude') || cat.includes('mindset') || cat.includes('태도'))
    return { color: '#34D399', background: 'rgba(52, 211, 153, 0.12)', boxShadow: 'inset 0 0 0 1px rgba(52, 211, 153, 0.25)' };

  // Priority / Strategy (Amber/Yellow)
  if (cat.includes('priority') || cat.includes('strategy') || cat.includes('전략'))
    return { color: '#FBBF24', background: 'rgba(251, 191, 36, 0.12)', boxShadow: 'inset 0 0 0 1px rgba(251, 191, 36, 0.25)' };

  // Global / Trend (Blue)
  if (cat.includes('global') || cat.includes('글로벌') || cat.includes('trend') || cat.includes('트렌드'))
    return { color: '#60A5FA', background: 'rgba(96, 165, 250, 0.12)', boxShadow: 'inset 0 0 0 1px rgba(96, 165, 250, 0.25)' };

  // Startup / Business (Gold)
  if (cat.includes('startup') || cat.includes('스타트업') || cat.includes('business') || cat.includes('비즈니스'))
    return { color: 'var(--prism-gold)', background: 'rgba(229, 178, 93, 0.12)', boxShadow: 'inset 0 0 0 1px rgba(229, 178, 93, 0.25)' };

  // Tech / Dev / SW (Indigo)
  if (cat.includes('tech') || cat.includes('개발') || cat.includes('software'))
    return { color: 'var(--color-indigo)', background: 'rgba(129, 140, 248, 0.12)', boxShadow: 'inset 0 0 0 1px rgba(129, 140, 248, 0.25)' };

  // Security / Defense (Red)
  if (cat.includes('security') || cat.includes('보안'))
    return { color: '#F87171', background: 'rgba(248, 113, 113, 0.12)', boxShadow: 'inset 0 0 0 1px rgba(248, 113, 113, 0.25)' };

  // Default (Lavender)
  return { color: 'var(--prism-lavender)', background: 'rgba(199, 210, 254, 0.12)', boxShadow: 'inset 0 0 0 1px rgba(199, 210, 254, 0.25)' };
};

export default getCategoryStyles;
