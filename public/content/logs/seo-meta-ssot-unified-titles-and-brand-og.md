# 🧭 하나의 진실(SSOT): 카테고리별로 흩어진 페이지 타이틀·메타 통일기

## 📝 Revision History

| Version | Date | Author | Description | Impact Area |
| :--- | :--- | :--- | :--- | :--- |
| v1.0 | 2026-07-14 | Antigravity | 페이지 타이틀·메타를 단일 소스(SSOT)로 통일하고 히어로 기반 브랜드 OG를 적용한 기록 정의 | server.mjs, useSEO.js, seoMeta 공유 모듈 |

---

## 1. 💡 도입부: 같은 페이지, 다른 제목

PriSincera는 React/Vite 기반의 SPA입니다. 검색·소셜 크롤러를 위해 **서버가 초기 HTML에 메타 태그를 주입(SSR)**하고, 브라우저에서는 **클라이언트 훅이 탭 타이틀과 메타를 갱신(CSR)**하는 두 개의 경로가 공존합니다.

문제는, 이 둘이 서로의 존재를 모른 채 **각자 타이틀 문자열을 만들고 있었다**는 것입니다. 그 결과 같은 `/daily`, `/pacenote` 페이지가 **크롤러가 보는 제목과 브라우저 탭의 제목이 서로 달라지는 '드리프트(drift)'**가 발생했습니다.

표기 규칙도 제각각이었습니다. 어떤 페이지는 `| PriSincera`, 어떤 페이지는 `— PriSincera`, 실시간 통역 앱(Sylphio) 페이지는 브랜드 접미어가 **아예 없었고**, 상세 글 페이지는 접미어가 **중복**되기도 했습니다. 목표는 명확했습니다 — **모든 카테고리를 하나의 표준으로 통일하되, 각 카테고리의 SEO 키워드는 그대로 살린다.**

---

## 2. 🔍 발견된 불일치

### [불일치 1] 이중 소스가 낳은 드리프트
* **발견**: SSR(`server.mjs`)과 CSR(클라이언트 SEO 훅)이 **각자 타이틀/설명을 하드코딩**하고 있었습니다.
* **맹점**: 단일 진실(Single Source of Truth)이 없으니, 한쪽을 고쳐도 다른 쪽은 옛 값을 유지 → 크롤러 뷰와 사용자 탭이 어긋납니다.

### [불일치 2] 브랜드 접미어·구분자 혼용
* 브랜드 구분자로 `|` 와 `—`가 섞여 쓰였고, 접미어 유무도 페이지마다 달랐습니다.
* 상세 글은 `{제목} | Builder's Log | PriSincera` 처럼 접미어가 **이중**으로 붙는 경우까지 있었습니다.

### [불일치 3] 특정 제품만 클라이언트 훅 미사용
* 대부분의 페이지는 공통 훅으로 탭 타이틀·canonical을 갱신했지만, **Sylphio 3개 페이지만 이 훅을 사용하지 않아** SPA 화면 이동 시 메타 갱신이 끊겼습니다.

### [불일치 4] 소셜 카드(og:image)의 이원화
* 서버와 클라이언트의 **기본 OG 이미지 폴백이 서로 다른 파일**을 가리켰고, 그마저도 **레거시 서비스 시절의 대표 이미지**가 남아 브랜드와 어긋나 있었습니다.

---

## 3. 🛠️ 솔루션: 단일 소스(SSOT)로 통일

### 1) route → meta 공유 모듈
카테고리별 타이틀·설명·키워드를 **한 곳에 정의**하고, **서버 SSR과 클라이언트 훅이 같은 모듈을 소비**하도록 만들었습니다. 이로써 드리프트를 구조적으로 차단했습니다.

```javascript
// 공유 SSOT 모듈 (서버·클라이언트 공통 소비)
export const SITE = 'PriSincera';

// 브랜드 접미어: 홈만 예외, 그 외는 `{제목} | PriSincera`
export function brandTitle(pageTitle) {
  return pageTitle ? `${pageTitle} | ${SITE}` : HOME_TITLE;
}

// route → 메타 리졸버 (정적 경로 매칭 + 동적 override)
export function resolveMeta(pathname, opts = {}) {
  const base = opts.override || PAGE_META[matchStaticPath(pathname)] || PAGE_META['/'];
  return {
    title: brandTitle(base.pageTitle),
    description: base.description,
    keywords: base.keywords || DEFAULT_KEYWORDS,
    ogImage: base.ogImage || DEFAULT_OG_IMAGE,
    canonical: opts.canonical || `${BASE_URL}${cleanPath(pathname)}`,
  };
}
```

### 2) 표준 타이틀 포맷
포맷은 `{키워드형 페이지명 — 태그라인} | PriSincera` (홈만 예외)로 통일했습니다. **키워드를 앞에 배치(SEO)**하면서 **브랜드 접미어를 복원(일관성)**해, 두 마리 토끼를 잡았습니다. 예: `Sylphio — macOS 실시간 AI 통역·회의록 | PriSincera`.

### 3) canonical·keywords 방출과 중복 태그 정리
자기참조 **canonical을 항상 방출**하고, 정적 HTML에 남아 **중복되던 og/twitter/keywords 태그를 주입 직전에 제거(dedupe)**해 크롤러가 단일한 신호만 읽도록 했습니다.

### 4) 배치 위치의 함정 (엔지니어링 교훈)
가장 값진 교훈은 사소한 곳에서 나왔습니다. 서버와 클라이언트가 **함께 임포트하는 공유 모듈**은, **빌드 산출 컨테이너에 실제로 포함되는 경로**에 두어야 런타임 크래시를 피할 수 있었습니다. *"공유"의 전제는 "양쪽 런타임에서 접근 가능"* 이라는 당연한 사실을, 배포 단계에서 다시 확인했습니다.

---

## 4. 🌐 다국어 SEO: hreflang & og:locale

메타가 통일되었으니, 다국어 발견성(discoverability)도 정돈했습니다. 전 페이지 SSR에 **`ko`/`en`/`ja` + `x-default` hreflang 대체 링크**와 **`og:locale`/`og:locale:alternate`**를 방출합니다.

```javascript
// hreflang 대체 링크 (SSR)
export function hreflangLinks(canonical) {
  const lines = LOCALES.map(
    (loc) => `<link rel="alternate" hreflang="${loc}" href="${canonical}?lang=${loc}">`
  );
  lines.push(`<link rel="alternate" hreflang="x-default" href="${canonical}">`);
  return lines.join('\n    ');
}
```

모든 언어 변형이 **동일한 hreflang 세트**를 내보내므로 상호(reciprocal) 참조 요건을 충족합니다.

---

## 5. 🎨 소셜 카드: 히어로를 OG로

마지막은 얼굴, 즉 소셜 공유 카드(OG 이미지)였습니다. 별도의 디자인 에셋이 없었기에, **메인 히어로의 'Star Prism Identity'**(글래스 육망성 프리즘·골드 액센트 삼각형·오빗 링·다크 스타필드 + 하단 골드 앰비언트)를 **1200×630 OG 카드로 프로그래밍 생성**했습니다.

* **생성 방식**: 이미지 라이브러리로 2배 슈퍼샘플 렌더 후 다운스케일(LANCZOS)해 가장자리와 타이포를 선명하게.
* **공통 적용**: 레거시 대표 이미지를 교체하고 **단일 폴백**으로 통일 → 어떤 페이지를 공유해도 **동일한 브랜드 아이덴티티**가 카드로 노출됩니다.

---

## 6. 📈 결과 및 인사이트

이번 개편으로 PriSincera는 다음을 얻었습니다:

1. **드리프트 소멸**: 크롤러가 읽는 제목 = 브라우저 탭 제목. 단일 소스가 둘의 어긋남을 원천 차단합니다.
2. **SEO와 브랜딩의 양립**: 키워드 전면 배치 + 브랜드 접미어로, 검색 노출과 브랜드 인지를 동시에 확보합니다.
3. **다국어 발견성**: hreflang·og:locale로 언어권 크롤러에 친화적인 신호를 제공합니다.
4. **일관된 얼굴**: 어떤 링크를 공유해도 같은 프리즘 카드가 나타나, 흩어져 있던 브랜드 경험을 하나로 모읍니다.

> 좋은 SEO는 화려한 트릭이 아니라, **하나의 진실을 여러 표면에 정확히 반영하는 규율**이라는 사실을 다시 배웠습니다.
