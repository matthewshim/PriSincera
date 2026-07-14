/**
 * seoMeta — 페이지 타이틀·메타 단일 소스(SSOT)
 *
 * 서버 SSR(`server.mjs`)과 클라이언트 CSR(`useSEO.js`)이 동일한 값을 사용해
 * 크롤러 뷰와 브라우저 탭의 타이틀/메타가 어긋나지 않도록 한다.
 *
 * 표준 포맷: `{키워드형 페이지명 — 짧은 태그라인} | PriSincera` (홈만 예외)
 * ※ 컨테이너 런타임에는 src/data/ 만 COPY 되므로(Dockerfile) 본 모듈은 src/data 에 둔다.
 */
export const SITE = 'PriSincera';
export const BASE_URL = 'https://www.prisincera.com';
export const HOME_TITLE = 'PriSincera — Sincerity, Prioritized.';
export const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.png`;
export const DEFAULT_KEYWORDS = "PriSincera, 프리싱케라, Daily Digest, Pace Note, Builder's Log, Sylphio";

// pageTitle = 브랜드 접미어를 제외한 키워드형 페이지명 (홈은 null → 루트 브랜드 타이틀)
export const PAGE_META = {
  '/': {
    pageTitle: null,
    description: 'PriSincera 공식 홈페이지. 복잡한 비즈니스에 진심을 담아 우선순위를 설계합니다.',
    keywords: "PriSincera, 프리싱케라, Bento Grid, Pace Note, Daily Digest, Builder's Log, Sylphio, AI Curation",
  },
  '/daily': {
    pageTitle: 'Daily Digest — 매일의 IT·비즈니스 시그널',
    description: '매일 아침, 전 세계 IT·비즈니스·AI 동향 중 가장 중요한 시그널과 핵심 실무 지식을 큐레이션해 전해드리는 데일리 리포트입니다.',
    keywords: 'PriSincera, 데일리 다이제스트, IT 뉴스, AI 트렌드, 비즈니스 인사이트, 시그널',
  },
  '/pacenote': {
    pageTitle: 'Pace Note — 주간 목표·회고 트래커',
    description: '스스로의 우선순위를 지키기 위한 주간 목표 달성률과 투명한 성찰을 기록하는 페이스 노트. 배움을 실행으로, 실행을 복기로 잇습니다.',
    keywords: 'PriSincera, 페이스 노트, 주간 목표, 회고, 성장 트래커, 생산성',
  },
  '/builders-log': {
    pageTitle: "Builder's Log — 서비스 구축의 기록",
    description: 'PriSincera 프로덕트가 만들어지는 과정과 디자인, 기술적 의사결정을 날것 그대로 기록하는 빌더스 로그입니다.',
    keywords: 'PriSincera, 빌더스 로그, 개발 일지, 프로덕트, 기술 블로그, 아키텍처',
  },
  '/sylphio': {
    pageTitle: 'Sylphio — macOS 실시간 AI 통역·회의록',
    description: 'macOS 실시간 AI 동시통역·회의록 에이전트. 온디바이스 STT(오프라인, 언어팩 없으면 Apple 서버 폴백)·에어팟 실명 락온·마이크/에어팟/시스템 사운드 3소스 캡처. 종료 후 녹음을 Gemini 2.5로 재분석하는 정밀 회의록과 마크다운(.md) 자동 요약까지.',
    keywords: '실피오, Sylphio, macOS 동시통역, 실시간 자막, 에어팟 번역, 온디바이스 STT, AI 회의록, 정밀 회의록, Gemini',
  },
  '/sylphio/guide': {
    pageTitle: 'Sylphio API Key 연동 가이드',
    description: '개인용 AI API Key(Google Gemini·OpenAI)를 Sylphio에 연동해 월 구독료 없이 AI 회의록 요약과 정밀 회의록 기능을 누리는 방법을 안내합니다.',
    keywords: 'Sylphio API Key, Gemini API, OpenAI API, BYOK, 실피오 연동 가이드',
  },
  '/sylphio/privacy': {
    pageTitle: 'Sylphio 개인정보 처리방침',
    description: '로컬 녹음 저장·BYOK 오디오 전송·화면 녹화 권한·하이브리드 STT를 투명하게 고지하는 Sylphio 개인정보 처리방침(데이터 무수집 원칙).',
    keywords: 'Sylphio 개인정보, 데이터 무수집, 프라이버시, BYOK, 온디바이스',
  },
};

/** 브랜드 접미어 적용: 홈(null)은 루트 타이틀, 그 외 `{pageTitle} | PriSincera` */
export function brandTitle(pageTitle) {
  return pageTitle ? `${pageTitle} | ${SITE}` : HOME_TITLE;
}

/** 정적 경로 매칭: 정확 일치 우선, 없으면 최장 접두 일치(홈 폴백) */
export function matchStaticPath(pathname) {
  const path = (pathname || '/').split('?')[0].replace(/\/+$/, '') || '/';
  if (PAGE_META[path]) return path;
  const prefixes = Object.keys(PAGE_META)
    .filter((p) => p !== '/' && path.startsWith(p))
    .sort((a, b) => b.length - a.length);
  return prefixes[0] || '/';
}

/**
 * SSOT 메타 리졸버.
 * @param {string} pathname URL 경로(쿼리 포함 가능)
 * @param {object} [opts]
 * @param {object} [opts.override] 동적 페이지(글 상세/날짜)용 { pageTitle, description, keywords?, ogImage? }
 * @param {string} [opts.canonical] 명시 canonical(없으면 경로 기반 자기참조, 쿼리 제거)
 * @returns {{title,description,keywords,ogImage,canonical}}
 */
export function resolveMeta(pathname, opts = {}) {
  const cleanPath = (pathname || '/').split('?')[0].replace(/\/+$/, '') || '/';
  const base = opts.override || PAGE_META[matchStaticPath(pathname)] || PAGE_META['/'];
  return {
    title: brandTitle(base.pageTitle),
    description: base.description,
    keywords: base.keywords || DEFAULT_KEYWORDS,
    ogImage: base.ogImage || DEFAULT_OG_IMAGE,
    canonical: opts.canonical || `${BASE_URL}${cleanPath === '/' ? '/' : cleanPath}`,
  };
}


// ── 다국어(i18n) SEO 신호 ──
export const LOCALES = ['ko', 'en', 'ja'];
export const DEFAULT_LOCALE = 'ko';
export const OG_LOCALE = { ko: 'ko_KR', en: 'en_US', ja: 'ja_JP' };

/** hreflang 대체 링크 태그(SSR용). canonical은 쿼리 없는 자기참조 URL. */
export function hreflangLinks(canonical) {
  const lines = LOCALES.map(
    (loc) => `<link rel="alternate" hreflang="${loc}" href="${canonical}?lang=${loc}">`
  );
  lines.push(`<link rel="alternate" hreflang="x-default" href="${canonical}">`);
  return lines.join('\n    ');
}

/** og:locale + 대체 로케일 태그(SSR용). */
export function ogLocaleTags(current = DEFAULT_LOCALE) {
  const main = OG_LOCALE[current] || OG_LOCALE[DEFAULT_LOCALE];
  const alts = Object.entries(OG_LOCALE)
    .filter(([k]) => OG_LOCALE[k] !== main)
    .map(([, v]) => `<meta property="og:locale:alternate" content="${v}">`);
  return [`<meta property="og:locale" content="${main}">`, ...alts].join('\n    ');
}
