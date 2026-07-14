---
status: active
domain: Core
last_updated: 2026-07-14
version: v1.1
target_files:
  - src/data/seoMeta.mjs
  - server.mjs
  - src/hooks/useSEO.js
  - index.html
---

# 📘 SEO 메타·페이지 타이틀 표준 (SEO Meta Standard)

## 📝 Revision History

| Version | Date | Author | Description | Impact Area |
| :--- | :--- | :--- | :--- | :--- |
| v1.0 | 2026-07-14 | AI Agent | 페이지 타이틀·메타 현황 감사 + 카테고리 일관 표준(SEO 최적화 병행) 및 적용 계획 최초 정의 | server.mjs, src/hooks/useSEO.js |
| v1.1 | 2026-07-14 | AI Agent | 결정(A유지·B아포스트로피·C단일폴백·D공유모듈) 반영 및 구현 완료 — SSOT `src/data/seoMeta.mjs` 신설, server.mjs·useSEO·전 페이지 정합, Sylphio useSEO 편입, canonical/keywords 방출·중복 태그 제거 | src/data/seoMeta.mjs |
| v1.2 | 2026-07-14 | AI Agent | 후속 완료 — 다국어 hreflang·og:locale SSR 방출 추가. 카테고리 전용 OG 이미지는 디자인 에셋 의존 백로그로 유지(단일 폴백). | src/data/seoMeta.mjs, server.mjs |
| v1.3 | 2026-07-14 | AI Agent | 별도 에셋 부재로 디자인 시스템 팔레트 기반 공통 대표 OG(1200×630) 생성·적용(레거시 PriSignal 교체) | public/og-image.png, public/daily-og.png |

---

## 0. 요약 (TL;DR)

- 현재 페이지 타이틀/메타는 **서버 SSR(`server.mjs`)** 과 **클라이언트 CSR(`useSEO.js`)** 의 **두 시스템이 서로 독립적**으로 생성하며, 동일 페이지에서도 두 값이 다를 수 있다.
- **Sylphio 페이지만 `useSEO`를 사용하지 않고**, 서버 타이틀도 브랜드 접미어(`| PriSincera`)를 생략한 **키워드 중심(SEO) 포맷**이라 타 카테고리와 어긋난다.
- 목표: **하나의 타이틀 템플릿**으로 전 카테고리를 일관화하되, **각 카테고리의 키워드 최적화(SEO)를 유지**한다.
- 핵심 처방: (1) **route→meta 단일 소스(SSOT)** 를 만들어 SSR·CSR이 같은 값을 쓰게 하고, (2) `{키워드형 페이지명} | PriSincera` 표준 포맷을 전 카테고리에 적용하며, (3) Sylphio에도 `useSEO`를 도입하고 canonical·og:image 기본값을 통일한다.

---

## 1. 현황 감사 — 두 개의 메타 시스템

### 1.1 서버 SSR — `server.mjs` (크롤러/소셜 카드용)
- `req.originalUrl` 분기로 route별 `title`/`description`/`image`를 만들어 `<title>`·`description`·`og:*`·`twitter:*`를 HTML에 주입([server.mjs](../../server.mjs) L508–597).
- **`keywords`·`canonical` 미방출**, og:image는 `daily-og.png` 폴백.

### 1.2 클라이언트 CSR — `useSEO.js` (SPA 런타임/브라우저 탭)
- `document.title = \`${title} | ${siteTitle}\`` 고정 포맷([useSEO.js](../../src/hooks/useSEO.js) L7). `description`/`og`/`twitter`/`keywords`/`canonical` 갱신.
- og:image 기본값은 **`og-image.png`** (SSR과 다른 파일).
- 사용처: Home · DailyDigest · PaceNoteDashboard · BuildersLog · BuildersLogDetail.
- **미사용: SylphioLanding / SylphioApiKeyGuide / SylphioPrivacy** → SPA 이동 시 탭 타이틀·canonical이 갱신되지 않음.

### 1.3 카테고리별 현재 타이틀 (SSR vs CSR)

| 라우트 | SSR (`server.mjs`) | CSR (`useSEO`) |
| :--- | :--- | :--- |
| `/` (Home) | `PriSincera — Sincerity, Prioritized.` | `PriSincera — Sincerity, Prioritized.` (title 빈값→기본) |
| `/daily` | `Daily Digest — 노이즈 속의 시그널과 실무 지식 \| PriSincera` | `Daily Digest \| PriSincera` |
| `/daily/:date` | `{date} Daily Digest \| PriSincera` | `Daily Digest ({date}) \| PriSincera` |
| `/daily/:date` 대표글 | `{article} \| Daily Digest — PriSincera` | (동일 훅) |
| `/pacenote` | `Pace Note — 목표와 회고 \| PriSincera` | `Pace Note \| PriSincera` |
| `/builders-log` | `Builders Log — 서비스 구축의 기록 \| PriSincera` | `Builders Log \| PriSincera` |
| `/builders-log/:slug` | `{title} \| Builder's Log` ← **접미어 없음** | `{title} \| Builder's Log \| PriSincera` ← **접미어 중복** |
| `/sylphio` | `Sylphio (실피오) — macOS용 실시간 AI 동시통역·회의록 에이전트` ← **접미어 없음** | **훅 미사용** |
| `/sylphio/guide` | `Sylphio API Key 연동 가이드 — Google Gemini & OpenAI` ← **접미어 없음** | **훅 미사용** |
| `/sylphio/privacy` | `Sylphio Privacy Policy (Zero Data Collection) — PriSincera` ← `—` 접미어 | **훅 미사용** |

---

## 2. 발견된 불일치 (근본 원인)

1. **이중 소스(SSOT 부재)**: SSR·CSR이 각각 타이틀을 정의 → 같은 페이지가 크롤러 뷰와 브라우저 탭에서 다른 타이틀(예: `/daily`, `/pacenote`).
2. **Sylphio `useSEO` 미사용**: 클라이언트 메타 갱신(canonical/og/탭 타이틀)이 타 카테고리와 불일치.
3. **브랜드 접미어 불일치**: 대다수 `| PriSincera` / Sylphio 메인·가이드 **없음** / Sylphio 개인정보·Daily 대표글 **`— PriSincera`**.
4. **구분자 혼용**: 브랜드 구분에 `|` 와 `—` 혼용.
5. **접미어 결손/중복**: BuildersLog 상세 SSR은 접미어 결손, CSR은 `| Builder's Log | PriSincera` 중복.
6. **og:image 기본값 이원화**: SSR `daily-og.png` vs CSR `og-image.png` → 카테고리 공유 카드 이미지 불일치.
7. **canonical·keywords 방출 불균형**: canonical은 CSR에서만(ogUrl 있을 때), SSR은 미방출. Sylphio는 둘 다 없음.
8. **description 규격 부재**: 길이/키워드 배치 기준 없음(일부 150자 컷, 일부 임의).

> **참고(SEO 의도)**: Sylphio가 접미어 없이 키워드 중심 타이틀을 쓴 것은 **키워드 전면 배치·잘림 방지**를 노린 정당한 SEO 전술이다. 본 표준은 이 **키워드-우선** 이점을 유지하면서 브랜드 접미어를 복원한다(브랜드 접미어도 CTR·브랜드 SEO에 유효).

---

## 3. SEO 원칙 (표준의 근거)

- **키워드 전면 배치**: 페이지 고유·핵심 키워드를 타이틀 앞쪽에, 브랜드는 뒤로.
- **길이 ≤ 60자(≈600px)**: 검색 결과 잘림 방지. 한글은 폭이 넓으므로 **키워드부 ≤ 약 30~34자 + `| PriSincera`(13)** 를 상한으로.
- **페이지별 고유성**: 모든 route의 title·description은 서로 달라야 함(중복 타이틀 SEO 감점).
- **description 120~155자**: 핵심 가치·행동 유도, 앞부분에 주요 키워드.
- **canonical 자기참조 필수**: 쿼리(`?lang=`) 중복 색인 방지.
- **1 페이지 = 1 메타(SSOT)**: 크롤러(SSR)와 사용자(CSR)가 동일 값을 봐야 신뢰·일관성 확보.

---

## 4. 표준 템플릿 (Title & Meta Guide)

### 4.1 타이틀 포맷
```
{페이지명 또는 키워드형 디스크립터} [— {짧은 태그라인}] | PriSincera
```
- **브랜드 접미어**: 항상 ` | PriSincera` (파이프 `|` 단일 표준). **홈(`/`)만 예외** — 루트 브랜드 타이틀 `PriSincera — Sincerity, Prioritized.` 유지.
- **내부 구분자**: 페이지명과 태그라인 사이는 `—`(엠대시). 즉 2계층: `—`(내부) / `|`(브랜드).
- **상세/글 페이지**: `{글 제목} — {카테고리} | PriSincera` (접미어 1회만, 중복 금지).

### 4.2 메타 규격
| 항목 | 규칙 |
| :--- | :--- |
| `description` | 120–155자, 페이지 고유, 키워드 전면 |
| `og:title`/`twitter:title` | = `title` |
| `og:description`/`twitter:description` | = `description` |
| `og:image`/`twitter:image` | 카테고리 기본 이미지, 폴백 **단일화**(예: `og-image.png`). Daily 대표글은 글 OG 유지 |
| `twitter:card` | `summary_large_image` |
| `canonical` | 자기참조 URL 항상 방출(SSR·CSR 공통) |
| `keywords` | 카테고리별 유지(우선순위 낮음), SSR·CSR 동일 방출 |

### 4.3 단일 소스(SSOT) 구조 (권장)
**`src/data/seoMeta.mjs`** 에 route→메타 리졸버를 두고 `server.mjs`·`useSEO.js`·각 페이지가 공유한다. (런타임 컨테이너에 `src/data/`만 COPY되므로 `src/config/`가 아닌 `src/data/`에 배치.)
```
resolveMeta(pathname, { locale, dynamic }) → { title, description, keywords, ogImage, canonical }
```
- 정적 라우트: 맵에서 조회. 동적(글 상세/날짜): 인자로 주입.
- 결과 → SSR은 HTML 주입, CSR은 `useSEO`가 소비. **드리프트 원천 차단.**

---

## 5. 카테고리별 적용안 (Before → After)

> 키워드는 유지·강화, 구조만 통일. (한글 폭 고려해 태그라인 축약)

| 라우트 | After — 표준 타이틀 |
| :--- | :--- |
| `/` | `PriSincera — Sincerity, Prioritized.` (홈 예외, 유지) |
| `/daily` | `Daily Digest — 매일의 IT·비즈니스 시그널 \| PriSincera` |
| `/daily/:date` | `{date} Daily Digest \| PriSincera` |
| `/daily` 대표글 | `{글 제목} — Daily Digest \| PriSincera` |
| `/pacenote` | `Pace Note — 주간 목표·회고 트래커 \| PriSincera` |
| `/builders-log` | `Builder's Log — 서비스 구축의 기록 \| PriSincera` |
| `/builders-log/:slug` | `{글 제목} — Builder's Log \| PriSincera` |
| `/sylphio` | `Sylphio — macOS 실시간 AI 통역·회의록 \| PriSincera` |
| `/sylphio/guide` | `Sylphio API Key 연동 가이드 \| PriSincera` |
| `/sylphio/privacy` | `Sylphio 개인정보 처리방침 \| PriSincera` |

- Sylphio 3종은 **키워드부를 앞에 유지**(macOS·실시간·AI·통역·회의록 / API Key 연동 / 개인정보)하면서 접미어만 표준화 → SEO 손실 없이 일관화.
- description은 §4.2 규격으로 카테고리별 재정리(기존 문구 축약·키워드 정렬). 상세 문안은 구현 단계에서 확정.

---

## 6. 적용 계획 (단계별) — ✅ 1~6 구현 완료(2026-07-14), 7~8 배포 후 검증 예정

1. **[표준 승인]** 본 문서(§4 템플릿·§5 매핑) 확정. `status: draft → active`.
2. **[SSOT 신설]** `src/config/seoMeta.mjs` 작성: route→메타 리졸버 + 카테고리 상수(title/description/keywords/ogImage). (신규 파일)
3. **[SSR 정합]** `server.mjs` L508–597 분기를 리졸버 호출로 교체, `keywords`·`canonical` 방출 추가, og:image 폴백 단일화.
4. **[CSR 정합]** `useSEO.js`가 동일 리졸버를 사용하도록 조정(또는 페이지에서 리졸버 결과를 전달). BuildersLog 상세 **접미어 중복 제거**.
5. **[Sylphio 편입]** SylphioLanding/ApiKeyGuide/Privacy 3종에 `useSEO` 도입(canonical·og 포함).
6. **[정적 기본값]** `index.html` 기본 태그를 표준과 정합(폴백 og:image 통일).
7. **[검증]** 각 route에 대해 (a) SSR HTML의 `<title>`/메타, (b) 브라우저 탭 타이틀이 **동일**한지 확인. `curl -A "facebookexternalhit"` 로 SSR 스냅샷 점검, 배포 후 **OG 캐시 재스크랩**(FB Sharing Debugger 등).
8. **[다국어 hreflang]** ✅ 완료 — 전 페이지 SSR에 `ko/en/ja` + `x-default` hreflang 대체 링크와 `og:locale`/`og:locale:alternate` 방출(`hreflangLinks()`·`ogLocaleTags()` in seoMeta), canonical은 쿼리 없는 자기참조. ※ SSR 본문 메타는 현재 ko 단일 → 완전한 언어별 색인은 '언어별 SSR'(§9) 후속.

---

## 7. 결정사항 (2026-07-14 확정·반영 완료)

- **A. 홈 타이틀**: ✅ 현행 `PriSincera — Sincerity, Prioritized.` **유지**.
- **B. 브랜드 표기**: ✅ **아포스트로피 `Builder's Log`** 표준 채택(전 표기 통일, BuildersLog 상세 접미어 중복도 해소).
- **C. og:image**: ✅ **단일 폴백 `og-image.png`** 통일 + **디자인 시스템 기반 공통 대표 OG(1200×630 PNG) 생성·적용**(레거시 PriSignal 이미지 교체). 카테고리 전용 이미지는 추후.
- **D. SSOT 범위**: ✅ **공유 모듈 `src/data/seoMeta.mjs` 신설**(드리프트 근절). server.mjs·useSEO·전 페이지가 이를 소비.

---

## 8. 리스크 & 검증

- **위험**: 타이틀 변경은 검색 스니펫·CTR·순위에 영향 → 카테고리 대량 동시 변경 시 일시적 순위 변동 가능. 완화: 키워드부 보존으로 급격한 변화 최소화.
- **위험**: SSR/CSR 리팩터 중 특정 route 메타 누락 → 홈 기본값으로 폴백. 완화: route별 스냅샷 회귀 점검(§6-7).
- **검증 지표**: (1) 전 route SSR·CSR 타이틀 일치, (2) 타이틀 길이 ≤ 60자, (3) canonical 자기참조 존재, (4) description 중복 0, (5) 소셜 카드 재스크랩 정상.

## 9. 잔여 백로그 (에셋/대공사 의존)

- **공통 대표 OG 이미지**: ✅ 디자인 시스템 팔레트로 **PriSincera 대표 OG(1200×630 PNG)를 생성해 `og-image.png`·`daily-og.png`에 공통 적용**(레거시 PriSignal 카드 교체, Pillow 스크립트로 생성 — 2x 슈퍼샘플→LANCZOS 다운스케일). 카테고리별 전용 이미지는 추후 동적 OG 파이프라인 확장 과제로 유지.
- **언어별 SSR 본문**: 현 SSR은 ko 단일 메타/HTML을 서빙(클라이언트 i18n). 완전한 언어별 검색 색인을 원하면 `?lang`별 서버 렌더가 필요 → 대공사 후속.

> 관련 문서: [SEO 아키텍처 및 크롤러 대응 명세서](../builders-log/seo_optimization.md), [동적 OG 이미지 전략](og_image_strategy.md).
