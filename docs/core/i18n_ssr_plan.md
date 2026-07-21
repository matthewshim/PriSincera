---
status: draft
domain: Core
last_updated: 2026-07-21
version: v1.0
target_files:
  - server.mjs
  - src/data/seoMeta.mjs
  - src/App.jsx
  - src/contexts/LanguageContext.jsx
---

# 🗺️ 언어별 SSR 확장 계획서 (i18n SSR Plan)

## 📝 Revision History

| Version | Date | Author | Description | Impact Area |
| :--- | :--- | :--- | :--- | :--- |
| v1.0 | 2026-07-21 | AI Agent | 백로그 4-2 상세 계획 최초 수립 — URL 전략·5단계 로드맵·리스크·결정 요청 | SSR·라우팅·SEO |

> 연관: [다국어 지원(i18n) 확장 계획서](internationalization_plan.md)(FE 사전·BE 평탄화·번역 파이프라인 — 상당 부분 기구현) · [SEO 메타·페이지 타이틀 표준](seo_meta_standard.md)(SSOT·hreflang 기반) · [잔여 작업 백로그](task_backlog.md) 4-2

---

## 0. 요약 (TL;DR)

현 SSR은 **ko 단일 메타 + hreflang 신호**만 방출한다(`?lang=` 쿼리 변형). en/ja 사용자의 브라우저 경험은 클라이언트 i18n이 완결하지만, **검색엔진은 en/ja 버전을 독립 문서로 색인할 실질 표면이 없다.** 본 계획은 ① 메타 로케일화 → ② 로케일 경로(URL) 도입 → ③ 셸 정합 → ④ 선택적 프리렌더 → ⑤ 콘텐츠 번역 파이프라인의 5단계로, **저비용 고효과 순서**로 언어별 SSR을 완성한다.

## 1. 현황 진단 (사실 기반 — 2026-07-21 코드 확인)

| 층 | 상태 | 판정 |
| :--- | :--- | :--- |
| 로케일 감지 | `req.locale` = `?lang` > `Accept-Language` > ko (`server.mjs`) | ✅ 재사용 |
| SSR 메타 | `PAGE_META` **ko 단일 문자열** → 전 로케일 동일 방출 | ✗ Phase A 대상 |
| `<html lang>` | `"ko"` 하드코딩 | ✗ Phase A 대상 |
| hreflang | `?lang=` 쿼리 변형으로 방출 — 쿼리 URL은 색인 신뢰도 낮음 | ⚠ Phase B에서 경로 기반 재작성 |
| 동적 콘텐츠 API | `localizeObject(req.locale)` 서버측 평탄화 **기구현** | ✅ 재사용 |
| Builder's Log 메타 | title/subtitle/description **ko·en·ja 완비** | ✅ 재사용 |
| Daily 콘텐츠 | 원문 ko 단일(시그널·트랙 카드) — 번역 파이프라인 없음 | ✗ Phase E 전제 |
| 클라이언트 i18n | LanguageContext + 사전 3종 완비 | ✅ 재사용 |

## 2. 선행 결정 — URL 전략 (Phase B의 전제)

| 안 | 방식 | 판정 |
| :--- | :--- | :--- |
| A. 쿼리 유지 | `?lang=en` (현행) | ✗ 캐노니컬 충돌·색인 취약 — 언어별 SSR의 목적 달성 불가 |
| **B. 경로 프리픽스 (권장)** | `/en/relearn`, `/ja/sylphio` — **ko는 무프리픽스 루트(x-default)** | ✅ 구글 권장 구조·hreflang 클러스터 명확 |
| C. 서브도메인 | `en.prisincera.com` | ✗ 인증·인프라·쿠키 분리 과잉 |

> **자동 언어 리다이렉트 금지 원칙**: Accept-Language 기반 강제 리다이렉트는 봇(대부분 en 헤더)에게 ko 루트를 감춰 **기존 ko 색인을 훼손**한다. 언어 전환은 링크(GNB 스위처)와 hreflang에 위임한다.

## 3. 단계별 로드맵

### Phase A — 메타 로케일화 (0.5~1일 · URL 전략과 독립, 즉시 가능)
- `seoMeta.mjs` PAGE_META를 `{ ko, en, ja }` 사전 구조로 확장, `resolveMeta(pathname, { locale })` — SSOT 원칙 유지(서버·클라이언트 공용)
- `server.mjs`: `<html lang>` 동적화, title/description/keywords를 `req.locale`로 방출 (Builder's Log 상세는 `getLocaleVal` 기구현)
- 효과/한계: Accept-Language 협상 크롤러에 부분 효과. **URL 미분리 상태라 en/ja 독립 색인은 미보장** — B와 결합해야 완성

### Phase B — 로케일 경로 도입 (1~2일 · 핵심)
- 라우팅: `/:locale(en|ja)?/` 프리픽스 래핑(App.jsx), LanguageContext 초기 로케일 = 경로 (쿼리·헤더보다 우선)
- 서버: 경로 로케일 파싱 → SSR 메타·`og:locale`, **hreflang을 경로 기반으로 재작성**(`/en/relearn` 등 + x-default=ko 루트), **canonical = 자기 로케일 경로**(자기참조)
- 사이트맵: 정적 페이지 ×3 로케일 확장(hreflang 어노테이션 포함). **콘텐츠가 ko뿐인 경로(daily 아카이브 상세)는 en/ja 경로 미생성** — soft 404 예방
- 마이그레이션: `?lang=en` → `/en/...` 301, 기존 `?lang` 파라미터는 당분간 수용

### Phase C — 셸 SSR-lite (0.5일)
- 서버가 초기 로케일 사전을 `window.__INITIAL_LOCALE__`로 프리로드 — 하이드레이션 언어 깜빡임 제거, `<html lang>`·클라이언트 상태 정합

### Phase D — 정적 페이지 프리렌더 (선택 · 2~4일)
- **D1(권장 범위)**: 정적 성격 페이지(Sylphio 3종·Home·ReLearn 셸)를 빌드 타임에 로케일별 프리렌더(`index-en.html` 등) — 서버가 로케일 경로에 매칭 서빙. 크롤러가 **본문까지** 언어별로 봄
- D2(현 시점 비권장): 풀 React SSR(renderToString+hydration) — 아키텍처 대개편, D1 효과 측정 후 재평가

### Phase E — 콘텐츠 번역 파이프라인 (별도 트랙 · en/ja "본문"의 전제)
- [internationalization_plan §4.2](internationalization_plan.md)의 Gemini 자동 번역과 연계: `tech-composer`/시그널 요약에 en/ja 필드 가산(Data Contract 가산 원칙)
- **E 없이는** en/ja 페이지는 UI 크롬만 번역된 상태 — 이 한계를 수용할지가 결정 3

## 4. 리스크 & 안전장치

| 리스크 | 안전장치 |
| :--- | :--- |
| 중복 색인·ko 순위 카니벌 | 로케일별 자기참조 canonical + 상호 hreflang 클러스터 엄수, 단계별 서치콘솔 모니터링 |
| 자동 리다이렉트로 ko 색인 소실 | §2 금지 원칙 — 전환은 링크·hreflang만 |
| 빈 로케일 페이지(soft 404) | 콘텐츠 없는 로케일 경로 미생성 원칙(§3-B) |
| 라우팅 개편 회귀 | Phase B는 기능 플래그 없이도 ko 무프리픽스 경로가 현행과 동일 — ko 경험 무변경 보장 |
| 빌드 시간 증가(D1) | 프리렌더 대상을 정적 5페이지×3으로 한정 |

## 5. 공수·순서 요약

| 순서 | Phase | 공수 | 산출 효과 |
| :--- | :--- | :--- | :--- |
| 1 | A 메타 로케일화 | 0.5~1일 | 언어 협상 메타 — 즉효·무위험 |
| 2 | B 로케일 경로 | 1~2일 | **en/ja 독립 색인 표면 확보(핵심)** |
| 3 | C 셸 정합 | 0.5일 | UX 깜빡임 제거 |
| 4 | D1 프리렌더 | 2~4일 | 본문 색인(정적 페이지) — 효과 측정 후 |
| — | E 번역 파이프라인 | 별도 트랙 | 동적 콘텐츠 en/ja 본문 |

## 6. 결정 요청

1. **URL 전략 B안(경로 프리픽스) 채택** 여부 — 본 계획 전체의 전제
2. **착수 범위**: A만 선행 vs A+B+C 일괄(권장, 약 2~3일)
3. **동적 콘텐츠 정책**: daily/track en/ja 본문 — E 착수 vs "ko 전용 + UI 번역" 수용
4. D1 프리렌더 — B 효과(서치콘솔) 측정 후 재결정 권장
