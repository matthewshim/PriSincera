---
status: active
domain: PlannersView
last_updated: 2026-08-31
version: v1.0
target_files:
  - src/data/plannersViewMeta.json
  - src/pages/PlannersView.jsx
  - src/pages/PlannersView.css
  - public/content/planners-view/
  - server.mjs
---

# 🧭 Planner's View 퍼블리싱 가이드

## 📝 Revision History

| Version | Date | Author | Description | Impact Area |
| :--- | :--- | :--- | :--- | :--- |
| v1.0 | 2026-08-31 | AI Agent | 섹션 신설 — 뷰 중심 IA(루트=최신 글)·canonical 정책·발행 절차·스키마·알려진 공백 정의 | PlannersView, server.mjs, Header/Footer/WorkSection |

---

## 1. 섹션 정체성 — Builder's Log와의 경계 (🔒 규범)

두 섹션은 **형식이 아니라 성격**으로 갈린다. 판단이 애매하면 아래 표로 되돌아온다.

| | **Builder's Log** | **Planner's View** |
| :--- | :--- | :--- |
| 무엇을 | PriSincera 프로덕트를 **만든 기록** | 만드는 일에 대한 **관점·판단** |
| 증거 | 커밋(Key Shipments)·챕터 연대기 | 경험과 논지 (커밋 없음) |
| 화자 | 빌더(구현) | 기획자(방향) |
| 메타 | `chapterNo` + `commits[]` | `author` + `pullQuote` + `readMinutes` |

**커밋으로 증명되지 않는 글을 Builder's Log에 넣지 않는다.** 챕터 연대기가 희석되고,
`commits: []` 상태로 최신 글이 되면 Featured 카드의 Key Shipments 패널이 빈 상자로 렌더된다.

---

## 2. 아키텍처

- **뷰 중심 IA(목록 페이지 없음)**
  - `/planners-view` → **최신 글 본문**
  - `/planners-view/{slug}` → 퍼머링크
  - **두 경로의 화면 규격은 동일하다** — 상단 내비 슬롯(루트=현재 위치 라벨 / 퍼머링크=브레드크럼) → 표준 히어로(§9-1 아이콘 → h1 글 제목 → 부제) → 메타·바이라인·태그 → 본문. 섹션 브랜드 히어로를 루트에만 따로 두지 않는다(히어로 2중 노출·규격 혼용 방지).
  - 한 컴포넌트(`PlannersView.jsx`)가 두 경로를 담당한다. ReLearn(`/relearn` = 오늘)과 같은 문법.
  - 초기 편수가 적을 때 목록은 관문 역할만 하므로 두지 않는다.
- **본문 저장소**: `public/content/planners-view/{slug}[_en|_ja].md`
- **메타데이터**: `src/data/plannersViewMeta.json` (배열 맨 앞이 최신 = 루트에 노출되는 글)
- **탐색**: 사이드바(목차 主 + 다른 글 副, sticky) + **본문 하단 카드 스트립(상시)**
  - 사이드바는 1100px 이하에서 사라진다(§9-11). 하단 스트립이 없으면 **모바일에서 다른 글로 갈 방법이 0이 된다.** 하단 스트립은 선택이 아니라 필수다.

### 2-1. canonical·사이트맵 정책 (🔒 규범)

루트와 퍼머링크가 **같은 본문**을 렌더하므로 중복 색인을 구조로 차단한다.

- `canonical` 은 **어느 경로로 들어와도 퍼머링크**를 가리킨다 (`server.mjs` SEO 프록시 + 클라이언트 `useSEO`).
- **사이트맵에는 퍼머링크만 넣는다.** 섹션 루트(`/planners-view`)는 넣지 않는다 — 넣으면 "색인하라"(사이트맵)와 "다른 URL이 정본"(canonical)이 서로 어긋난 신호가 된다.
- 대가: 섹션 루트 자체는 검색 진입점이 되지 않는다. 이 섹션은 GNB·공유 링크로 들어오는 것이 주 경로이므로 의도된 선택이다.
- 퍼머링크는 **절대 리다이렉트하지 않는다.** ReLearn은 오늘 날짜 URL을 `/relearn`으로 수렴시키지만(`DailyView`), 아티클에 같은 규칙을 쓰면 외부(링크드인 등)에 공유한 링크가 "최신인 동안에만 튕기는" 시한부 링크가 된다.

### 2-2. 예약 슬러그

목록 페이지를 나중에 붙일 자리를 남겨둔다. **`archive` · `all` · `index` 는 글 슬러그로 쓰지 않는다.**

---

## 3. 발행 절차 (파일 기반)

### Step 1. 본문 마크다운 작성
`public/content/planners-view/{slug}.md` (+ `_en` · `_ja`).
- **H1(`#`)을 쓰지 않는다.** 제목은 메타의 `title`이 페이지 헤더로 렌더한다.
- 소주제는 H2(`##`)부터. H2/H3가 그대로 우측 목차가 된다 — 목차가 읽히도록 소제목을 문장형으로 쓴다.
- 시크릿·미공개 사업 정보 검열은 Builder's Log와 동일 기준.

### Step 2. 메타 등록
`src/data/plannersViewMeta.json` 배열 **맨 앞**에 추가한다(맨 앞 = 루트에 노출).

| 필드 | 설명 |
| :--- | :--- |
| `id` | `pv1`, `pv2` … 순번 |
| `slug` | 본문 파일명(확장자 제외) = URL |
| `title` · `subtitle` · `description` | `{ko,en,ja}` 3종 필수 |
| `pullQuote` | 글의 핵심 한 문장(3종). 본문 위 리드 인용으로 렌더 |
| `author` | `{ name, role: {ko,en,ja} }` — 바이라인 |
| `tags` | **영문 표기 통일** (예: `Product Planning`) |
| `accent` | 섹션 포인트 컬러. 브랜드 4색 계열만(기본 `#C7D2FE` lavender) |
| `date` | `YYYY-MM-DD` |
| `readMinutes` | 정수. 본문 기준 수동 산정(한국어 ≈ 450자/분, 영문 ≈ 220단어/분) |

### Step 3. 커밋·배포
`main` 푸시 → CI 빌드. `npm run build` 의 prebuild 게이트(`ci/design-check.mjs`)가 아래를 자동 검사한다.

---

## 4. 규범 (🔒)

- **Revision History 금지** — 발행 아티클에 넣지 않는다(내부 문서는 의무). `ci/design-check.mjs`가 `public/content/planners-view/*.md`에서 발견 시 **빌드를 실패**시킨다.
- **3개국어 동시 발행** — ko 원문 + en·ja. 로케일 파일이 없으면 한국어로 폴백되지만, 그 상태를 정상으로 두지 않는다.
- **개인 견해 고지 상시 노출** — 본문 하단 고지(`plannersView.disclaimer`)는 제거하지 않는다. 현직 소속이 드러나는 글이 회사 공식 입장으로 오독되는 것을 막는 장치다.
- **UI 문자열은 언어팩 경유** — `src/locales/{ko,en,ja}.json`의 `plannersView.*`. JSX 한국어 하드코딩은 i18n 게이트가 차단한다.

---

## 5. 알려진 공백 (Known Gaps)

착수 시점(v1.0)에 의도적으로 남긴 것들. 필요해지는 시점이 오면 처리한다.

| 공백 | 현재 | 처리 시점 |
| :--- | :--- | :--- |
| **어드민 발행 UI 미지원** | 파일 기반 발행만 가능. `admin-api.mjs`의 `/builderslog/publish`가 `buildersLogMeta.json`·`public/content/logs` 경로를 리터럴로 박고 있어 섹션 파라미터화가 선행돼야 한다 | 웹에서 발행할 필요가 생길 때 |
| **조회수 집계 없음** | Builder's Log의 `/api/builderslog/:slug/view` 대응 엔드포인트 없음 | 유입 측정이 필요해질 때 |
| **목록 페이지 없음** | 사이드바·하단 스트립이 최대 5건까지 노출 | **6편을 넘기는 시점**(그 이상은 접근 불가 글이 생긴다) → `/planners-view/archive` 신설 |
| **데일리 다이제스트 메일 미연동** | 메일은 Builder's Log 최신 1건만 싣는다(`composer.mjs`) | 구독자에게도 노출하기로 결정할 때 |
