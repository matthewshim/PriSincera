---
status: active
domain: PlannersView
last_updated: 2026-09-22
version: v2.0
target_files:
  - src/data/plannersViewMeta.json
  - src/data/plannersViewSeries.json
  - src/pages/PlannersView.jsx
  - src/pages/PlannersViewDetail.jsx
  - public/content/planners-view/
  - server.mjs
---

# 🧭 Planner's View 퍼블리싱 가이드

## 📝 Revision History

| Version | Date | Author | Description | Impact Area |
| :--- | :--- | :--- | :--- | :--- |
| v1.0 | 2026-08-31 | AI Agent | 섹션 신설 — 뷰 중심 IA(루트=최신 글)·canonical 정책·발행 절차·스키마·알려진 공백 정의 | PlannersView, server.mjs, Header/Footer/WorkSection |
| v2.0 | 2026-09-22 | AI Agent | **IA 전환(루트=목록) + 시리즈 도입** — 목록 없는 뷰 중심 구조를 폐기하고 `/planners-view`를 목록으로 승격. canonical 오버라이드·사이트맵 예외 철회(자기참조로 단순화), 시리즈 정본(`plannersViewSeries.json`) 신설, 상세에 연재 내비게이션 추가. 글 규격은 [content_guide](content_guide.md)로 분리 | 전면 |

---

> **문서 분담**: 본 문서는 **어디에 두고 어떻게 배포하는가**(메커니즘)를 다룹니다. **무엇을 어떻게 쓰는가**(글 규격·시리즈 운영·메타 문안)는 [content_guide](content_guide.md)가 정본입니다.

---

## 1. 섹션 정체성 — Builder's Log와의 경계 (🔒 규범)

두 섹션은 **형식이 아니라 성격**으로 갈린다.

| | **Builder's Log** | **Planner's View** |
| :--- | :--- | :--- |
| 무엇을 | PriSincera 프로덕트를 **만든 기록** | 만드는 일에 대한 **관점·판단** |
| 증거 | 커밋(Key Shipments)·챕터 연대기 | 경험과 논지 (커밋 없음) |
| 메타 | `chapterNo` + `commits[]` | `series` + `author` + `pullQuote` + `readMinutes` |

**커밋으로 증명되지 않는 글을 Builder's Log에 넣지 않는다.** 챕터 연대기가 희석되고, `commits: []` 상태로 최신 글이 되면 Featured 카드의 Key Shipments 패널이 빈 상자로 렌더된다.

---

## 2. 아키텍처

### 2-1. 라우트 (v2.0 — IA 전환)

| 경로 | 화면 |
| :--- | :--- |
| `/planners-view` | **목록** — 섹션 히어로 + 시리즈별 글 묶음 |
| `/planners-view/{slug}` | **글**(퍼머링크) — 브레드크럼 + 히어로 + 본문 + 연재 내비 |

- 컴포넌트는 `PlannersView.jsx`(목록) / `PlannersViewDetail.jsx`(상세)로 분리한다. Builder's Log와 같은 네이밍 문법.
- **예약 슬러그**: `archive` · `all` · `index` 는 글 슬러그로 쓰지 않는다(향후 하위 라우트용).

> **v1.0에서 무엇이 바뀌었나**: v1.0은 목록을 두지 않고 `/planners-view`가 최신 글 본문을 그대로 렌더했다(ReLearn의 `오늘=루트` 문법 차용). 초기 편수가 적을 때 목록이 관문 역할만 한다는 판단이었다. **편수를 꾸준히 늘리기로 하면서(오너 결정 2026-09-22) 전제가 바뀌었다** — 연재를 순서대로 읽히게 하려면 묶어 보여주는 지면이 필요하고, GNB로 재방문한 독자가 이미 읽은 글을 다시 마주하는 문제도 있었다. 목록을 루트로 올리면서 GNB·브레드크럼 상위·canonical이 한 방향으로 정리된다.

### 2-2. 저장소

- **본문**: `public/content/planners-view/{slug}[_en|_ja].md`
- **글 메타**: `src/data/plannersViewMeta.json` (배열 맨 앞이 최신)
- **시리즈 정본**: `src/data/plannersViewSeries.json` — 시리즈 제목·설명의 단일 소스

### 2-3. canonical·사이트맵 (v2.0에서 단순화)

- **모든 경로가 자기참조 canonical**을 쓴다. 루트(목록)와 글(퍼머링크)이 서로 다른 콘텐츠를 렌더하므로 중복 색인 문제가 없다.
- **사이트맵에 루트와 모든 퍼머링크를 등재**한다.
- 글 경로는 `og:type=article` + `article:published_time` + `Article` JSON-LD를 방출한다. 루트(목록)는 `website`.
- 퍼머링크는 **절대 리다이렉트하지 않는다.** 외부에 공유된 링크가 시한부가 되어서는 안 된다.

> v1.0의 canonical 오버라이드(루트 → 퍼머링크)와 사이트맵 루트 제외 규칙은 **철회됐다**. 루트가 목록이 되면서 그 예외가 필요 없어졌다. [seo_meta_standard §10](../core/seo_meta_standard.md) 참조.

### 2-4. 탐색 구조

| 지면 | 역할 |
| :--- | :--- |
| 목록(루트) | 시리즈별 묶음 · 연재 순서 · 단독 글 |
| 상세 상단 | 브레드크럼 `Planner's View › {시리즈명}` — 연재물은 현재 노드에 시리즈명을 쓴다([design_system §9-9](../core/design_system.md)) |
| 상세 사이드바 | 목차(主) + **이 시리즈**(현재 글 하이라이트) |
| 상세 하단 | **← 이전 편 / 다음 편 →** + 목록으로 돌아가기 |

> 히어로 메타의 `N편` 배지는 **비링크**다. 시리즈 전용 URL이 없으므로 링크를 걸면 '시리즈를 보여준다'는 어포던스가 전체 목록으로 착지한다. 시리즈 전용 앵커·라우트를 만들 때 함께 링크를 복원한다.

사이드바는 1100px 이하에서 숨겨지므로([design_system §9-11](../core/design_system.md)), 하단 연재 내비는 **상시 배치**한다. 모바일에서 탐색 수단이 0이 되지 않게 하는 장치다.

---

## 3. 발행 절차 (파일 기반)

### Step 1. 본문 작성
`public/content/planners-view/{slug}.md` (+ `_en` · `_ja`).
구조·분량·문체 규격은 **[content_guide §2](content_guide.md)** 를 따른다. 시크릿·미공개 사업 정보 검열은 Builder's Log와 동일 기준.

### Step 2. 시리즈 확인
새 시리즈면 `plannersViewSeries.json`에 먼저 등록한다. 기존 시리즈에 이어 붙이면 `order`만 다음 번호로 잡는다. ([content_guide §3](content_guide.md))

### Step 3. 메타 등록
`plannersViewMeta.json` 배열 **맨 앞**에 추가한다.

```json
{
  "id": "pv3",
  "slug": "my-new-note",
  "title":       { "ko": "", "en": "", "ja": "" },
  "subtitle":    { "ko": "", "en": "", "ja": "" },
  "description": { "ko": "", "en": "", "ja": "" },
  "pullQuote":   { "ko": "", "en": "", "ja": "" },
  "author": { "name": "Matthew Shim",
              "role": { "ko": "웹서비스 총괄 · 프로덕트 리더", "en": "", "ja": "" } },
  "series": { "id": "cheap-execution", "order": 3 },
  "tags": ["Organization", "..."],
  "accent": "#C7D2FE",
  "date": "YYYY-MM-DD",
  "readMinutes": 6
}
```

필드별 작성 기준은 **[content_guide §4](content_guide.md)**.

### Step 4. 검증·배포
```bash
npm run build     # prebuild 게이트(design-check)가 아래 규범을 자동 검사
git add <경로 지정>   # -A/-u/. 금지
git commit && git push origin main
```
Cloud Build가 자동 배포한다.

---

## 4. 규범 (🔒)

- **Revision History 금지** — 발행 아티클에 넣지 않는다(내부 문서는 의무). `ci/design-check.mjs`가 `public/content/planners-view/*.md`에서 발견 시 **빌드를 실패**시킨다.
- **3개국어 동시 발행** — ko 원문 + en·ja. ([content_guide §6](content_guide.md))
- **개인 견해 고지 상시 노출** — `plannersView.disclaimer`를 제거하지 않는다.
- **UI 문자열은 언어팩 경유** — `src/locales/{ko,en,ja}.json`의 `plannersView.*`. JSX 한국어 하드코딩은 i18n 게이트가 차단한다.
- **기존 글 무손상** — 신규 등록 시 기존 객체를 건드리지 않는다. 커밋 diff에 **삭제 줄이 있으면 실수**다.

---

## 5. 알려진 공백 (Known Gaps)

| 공백 | 현재 | 처리 시점 |
| :--- | :--- | :--- |
| **어드민 발행 UI 미지원** | 파일 기반 발행만 가능. `admin-api.mjs`의 `/builderslog/publish`가 `buildersLogMeta.json`·`public/content/logs` 경로를 리터럴로 박고 GitHub API로 직접 커밋하므로, **섹션 파라미터화가 선행**돼야 한다 | 웹에서 발행할 필요가 생길 때 — [task_backlog 12-1](../core/task_backlog.md) |
| **조회수 집계 없음** | Builder's Log의 `/api/builderslog/:slug/view` 대응 엔드포인트 없음 | 유입 측정이 필요해질 때 |
| **`readMinutes` 수동 산정** | 본문 길이 자동 계산을 두지 않았다. Builder's Log가 `description` 길이로 산정해 실제와 어긋나는 선례가 있어, 정확한 수동값을 택했다 | 편수가 늘어 수동 관리가 부담될 때 |
| **데일리 다이제스트 메일 미연동** | 메일은 Builder's Log 최신 1건만 싣는다(`composer.mjs`) | 구독자 노출을 결정할 때 |
| **태그 필터 없음** | 목록에 태그 필터·검색이 없다. 시리즈 묶음으로 충분하다고 판단 | 시리즈가 4개를 넘을 때 재검토 |
