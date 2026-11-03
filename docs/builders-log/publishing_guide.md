---
status: active
domain: BuildersLog
last_updated: 2026-11-03
version: v1.4
target_files:
  - public/content/logs/
  - src/data/buildersLogMeta.json
  - src/pages/BuildersLog.jsx
  - src/pages/BuildersLogDetail.jsx
  - ci/design-check.mjs
---

# Builder's Log 퍼블리싱 가이드

## Revision History

| Version | Date | Description | Impact Area |
| :--- | :--- | :--- | :--- |
| v1.4 | 2026-11-03 | **§6 적용 범위 — 내부 문서(`docs/`) 예외 철회** — "docs는 허용"을 폐기하고 발행물과 동일 규범으로 통일. 어드민 「서비스 문서」가 docs를 그대로 렌더하므로 독자가 보는 텍스트가 두 규범으로 갈려 있었다. docs 70편의 이모지를 전수 제거(제목 69건·`Revision History` 헤딩·표 상태 셀·ASCII/터미널 모사 포함)하고 §6 승계 규칙을 그대로 적용. 승계표의 '원래' 열은 글리프를 **이름으로** 적도록 고쳤다(예시 자체가 이모지를 품고 있었다). **집행 2겹 신설** — `/admin/api/docs/save` 저장 거부 + `design-check`의 `docsEmojiGate`(파일:행 지목, `Author` 열 재유입 동시 차단). 발행물 정규식은 그대로 두고 docs용은 **좁게** 잡았다(명세표의 단색 조판 기호는 판정 기호다) | docs/ 전역, publishing_guide §6, ci/design-check, admin-api |
| v1.0 | 2026-06-29 | 최초 정의 — 로컬 정적 에셋 발행 워크플로우·마크다운 규칙·SEO 처리 | BuildersLog |
| v1.3 | 2026-11-01 | **§6 이모지 금지 규범 신설 + §3-5 반영** — 발행 본문·메타(제목·부제·요약·태그·커밋 메시지)에 이모지를 쓰지 않는다. 소제목마다 반복되던 선두 글리프가 정보를 주지 않는 장식이었고, 같은 사이트의 다른 발행 섹션(Planner's View)은 이미 금지 규범을 두어 **독자에게 일관성 없음으로 읽혔다**. 기존 38편(국/영/일) 378건을 전수 제거하고 의미를 지녔던 글리프는 텍스트로 승계(등급 글리프는 `(Critical)` 단어로, 터미널 모사 블록은 `[PASS]` 라벨로). `design-check`의 `plannersViewEmojiGate`를 `articleEmojiGate`로 일반화해 두 섹션을 함께 집행하고, 어드민 AI 프롬프트(분석·완역)와 발행 사전 검사에 규범을 심었다 | BuildersLog, PlannersView, ci/, admin-api |
| v1.2 | 2026-08-31 | §0 섹션 경계 신설 — 커밋으로 증명되지 않는 관점 글은 Planner's View로 보낸다(챕터 연대기 희석·Featured 빈 패널 방지). Revision History 게이트가 두 발행 디렉터리를 함께 검사하도록 확장된 것 반영 | BuildersLog, PlannersView, ci/ |
| v1.1 | 2026-08-29 | §5 Revision History 정책 신설 — 내부 문서 의무·발행 아티클 제외, design-check 자동 집행 게이트 | BuildersLog, ci/ |

본 문서는 PriSincera 웹사이트의 **Builder's Log (테크 블로그)**에 새로운 아티클을 작성하고 퍼블리싱하는 구체적인 워크플로우를 안내합니다. 프론트엔드 라우팅 및 렌더링 엔진(`react-markdown`) 아키텍처가 구축되어 있으므로, 데이터베이스(Firestore)를 거치지 않고 로컬 파일 시스템 제어만으로 즉시 포스팅이 가능합니다.

---

## 0. 어느 섹션에 쓸 글인가 (Section Boundary)

발행 전에 먼저 판단한다. **형식이 아니라 성격**으로 갈린다.

| | **Builder's Log** (본 문서) | **Planner's View** ([가이드](../planners-view/publishing_guide.md)) |
| :--- | :--- | :--- |
| 무엇을 | PriSincera 프로덕트를 **만든 기록** | 만드는 일에 대한 **관점·판단** |
| 증거 | 커밋(Key Shipments)·챕터 연대기 | 경험과 논지 (커밋 없음) |
| 메타 | `chapterNo` + `commits[]` | `author` + `pullQuote` + `readMinutes` |

**커밋으로 증명되지 않는 글을 여기에 넣지 않는다.** 챕터 연대기가 희석되고, `commits: []` 상태로 최신 글이 되면 목록 최상단 Featured 카드의 Key Shipments 패널이 **빈 상자로 렌더된다**(그리드 카드에는 가드가 있으나 Featured에는 없음).

---

## 1. 아키텍처 개요 (Architecture Overview)
- **렌더링 방식:** 로컬 정적 에셋(Static Asset) 방식
- **본문 저장소:** `public/content/logs/*.md`
- **목록 메타데이터:** `src/data/buildersLogMeta.json`
- **동작 원리:** 사용자가 `/builders-log/:slug`에 접속하면, 프론트엔드(`BuildersLogDetail.jsx`)가 `public/content/logs/{slug}.md` 파일을 Fetch하여 `react-markdown`으로 렌더링하고 코드 신택스 하이라이팅을 적용합니다.

---

## 2. 신규 아티클 퍼블리싱 방법 (Step-by-Step)

다른 개발자나 AI 어시스턴트가 새로운 기술 문서, 트러블슈팅 로그, 디자인 가이드 등을 Builder's Log에 배포할 때는 아래의 3단계를 순서대로 수행하십시오.

### Step 1. 마크다운(.md) 파일 작성 및 저장
1. 배포할 아티클의 내용을 Markdown 형식으로 작성합니다.
   - 팁: 기존 `docs/` 폴더에 있던 아키텍처 문서를 활용할 경우, 일반 독자가 읽기 쉽도록 '스토리텔링' 형식으로 윤문(각색)하는 것을 권장합니다.
2. 작성된 파일을 `public/content/logs/` 디렉토리에 `{slug}.md` 이름으로 저장합니다.
   - 예시: `public/content/logs/sylphio-audio-optimization.md`
   - **주의사항:** 마크다운 내부에 Firebase Admin Key, API Secret 등 보안에 민감한 정보가 포함되지 않도록 반드시 검열하십시오.

### Step 2. 메타데이터(JSON) 등록
`src/data/buildersLogMeta.json` 파일을 열고, 배열의 **가장 앞쪽(최신순)** 또는 순서에 맞게 새로운 객체를 추가합니다.

```json
{
  "id": "ep3",
  "slug": "sylphio-audio-optimization",
  "chapterNo": "03",
  "title": "Sylphio 오디오 최적화: WebRTC와 마이크 입력 제어기",
  "subtitle": "Audio Pipeline & Performance",
  "description": "Sylphio의 음성 인식 엔진을 구축하면서 직면했던 오디오 레이턴시 문제와 노이즈 캔슬링 하드웨어 가속 적용 과정.",
  "date": "2026-06-01",
  "tags": ["WebRTC", "Audio", "Sylphio"],
  "accent": "var(--prism-rose)",
  "commits": [
    { "type": "feat", "hash": "a1b2c3d", "msg": "AudioContext 기반 오디오 파이프라인 통합" }
  ]
}
```
* **필드 설명:**
  * `slug`: Step 1에서 만든 마크다운 파일명 (확장자 제외). 라우팅 URL이 됩니다.
  * `accent`: 카드의 고유 포인트 컬러 (예: `var(--prism-indigo)`, `var(--orbit-cyan)`, `var(--prism-rose)` 등).
  * `commits`: 해당 챕터와 관련된 핵심 Git 커밋 기록 (type은 `feat`, `fix`, `refactor`, `style` 중 택 1).

### Step 3. 커밋 및 자동 배포
수정된 JSON 파일과 새로 생성된 MD 파일을 Git에 커밋하고 `main` 브랜치에 푸시(`git push`)합니다.
CI/CD 파이프라인(Vercel)을 통해 빌드가 완료되면 웹사이트에 즉시 자동 배포됩니다.

---

## 3. 마크다운 작성 규칙 (Markdown Guidelines)

PriSincera 디자인 시스템에 맞춘 프리미엄 다크 모드 뷰어(`BuildersLogDetail.jsx`)를 사용하므로 다음 문법들이 자동으로 최적화되어 렌더링됩니다.

1. **Heading (H1, H2, H3):**
   - H1(`#`)은 제목급 크기로 렌더링되므로, 본문 내 소주제는 H2(`##`)부터 사용하는 것을 권장합니다.
2. **Code Snippet:**
   - 백틱 3개(```)와 함께 언어(예: `javascript`, `python`, `json`)를 명시하면 Atom One Dark 테마의 신택스 하이라이팅이 자동 적용됩니다.
3. **Blockquote (인용문):**
   - `> 인용구` 문법을 사용하면 PriSincera 테마 포인트 컬러 라인이 들어간 아름다운 박스 형태로 표시됩니다.
4. **이미지 (Images):**
   - 이미지 에셋은 `public/images/` 하위에 배치하고 마크다운에서는 `![설명](/images/파일명.png)` 절대 경로 형식으로 호출하십시오.
5. **이모지 (Emoji):**
   - **쓰지 않습니다.** 본문·소제목·메타 어디에도 넣지 않습니다. 사유와 적용 범위, 의미를 지닌 글리프의 승계 방법은 **§6**이 정본입니다. `prebuild` 게이트가 차단합니다.

---

## 4. 메타데이터 태그 및 SEO 처리
`buildersLogMeta.json`에 입력된 데이터는 다음과 같이 작동합니다.
- `title`과 `description`, `tags`는 아티클 진입 시 브라우저 탭 타이틀과 `<meta>` 태그에 동적으로 주입되어 검색 엔진 노출(SEO) 성능을 극대화합니다.
- URL은 항상 `https://www.prisincera.com/builders-log/{slug}` 형태로 유지되므로 외부 플랫폼(LinkedIn 등) 공유 시 링크가 깨지지 않습니다.

---

## 5. Revision History 정책 — 내부는 의무, 발행은 제외 (규범)

Builder's Log 발행 아티클과 내부 설계 문서(`docs/`)는 Revision History를 **정반대로** 다룬다.

| 대상 | Revision History |
| :--- | :--- |
| **내부 문서** (`docs/**.md`) | **의무** — 버전·날짜·작성자·변경 요지·영향 범위를 표로 기록. 프로젝트의 변경 이력 자산이다. |
| **발행 아티클** (`public/content/logs/*.md`) | **금지** — 섹션을 넣지 않는다. |

**왜 발행 아티클에서 제외하는가**
- 공개 블로그에 버전 이력·작성자(예: `AI Agent`·`Designer`)가 노출되면 "AI로 찍어낸 콘텐츠"로 읽히고, 잦은 버전 업 노이즈가 독자 경험을 해친다.
- 아티클 메타(챕터 배지·발행일)가 이미 필요한 최소 정보를 제공한다.

**작성 흐름**
1. 설계·변경은 내부 문서(`docs/`)에 Revision History와 함께 기록한다.
2. 발행용 아티클은 그 내용을 스토리텔링으로 각색하되 **Revision History 섹션을 넣지 않는다** (docs를 그대로 복붙하지 말 것).

**자동 집행 (Enforcement)**: `ci/design-check.mjs`의 prebuild 게이트가 **발행 디렉터리 전체**(`public/content/logs/`·`public/content/planners-view/`)에서 `Revision History` 헤딩을 발견하면 **빌드를 실패**시킨다. 발행 섹션이 늘면 게이트의 `DIRS` 배열에 추가한다. 규범을 의지가 아니라 게이트로 강제한다.

---

## 6. 이모지 금지 — 발행물에는 쓰지 않는다 (규범)

**발행 아티클에 이모지를 쓰지 않는다.** 본문·소제목·메타 전부 해당한다.

**왜 금지인가**

- **정보를 주지 않는 장식이었다.** 전수 조사 결과 이모지는 거의 전부 **소제목 선두**에 붙어 있었고(`## 조우한 문제`·`## 결론` 앞의 경고·전구 글리프), 제목이 이미 말하는 것을 한 번 더 말했다. 38편에서 378건 — 편당 10건이면 독자는 그것을 의미가 아니라 **패턴**으로 읽는다.
- **AI 초안의 지문이다.** 모든 편이 '문제 → 설계 → 결론' 소제목마다 같은 글리프 3종을 같은 순서로 썼다. 틀이 글마다 똑같으면 "AI로 찍어냈다"는 신호가 되고, 이는 §5(Revision History 제외)가 막으려는 것과 같은 종류의 누출이다.
- **같은 사이트에서 규범이 갈려 있었다.** Planner's View는 이미 이모지를 금지했는데([content_guide §2-6](../planners-view/content_guide.md)) 로그는 쓰고 있었다. 섹션의 성격 차이는 **작성자 사정**이고, 독자에게는 같은 사이트의 두 글이 서로 다른 활자 규범을 쓰는 것으로만 읽힌다. 2026-11-01에 **발행물에는 예외를 두지 않는다**로 통일했다.
- **UI에서 이미 걷어냈다.** 히어로 마크는 [design_system §9-1 v5.24](../core/design_system.md)에서 폐지되고 UI 컨트롤은 자작 SVG(`src/components/common/Icon.jsx`)로 전환됐다. 지면은 이모지를 쓰지 않는데 본문만 쓰면 **아티클이 사이트에서 유일하게 튀는 면**이 된다.

**적용 범위**

| 대상 | 이모지 |
| :--- | :--- |
| 본문 (`public/content/logs/*.md`) — 코드 블록·인용·표 안쪽 포함 | **금지** |
| 메타 `title`·`subtitle`·`description`·`tags` (`buildersLogMeta.json`) | **금지** |
| 메타 `commits[].msg` — Key Shipments 패널에 그대로 렌더된다 | **금지** |
| 3개 로케일(`ko`·`en`·`ja`) | **동일 적용** — 원문에서 빼면 완역에도 들어가지 않는다 |
| 내부 문서 (`docs/`) | **금지** — 2026-11-03 예외 철회. docs 전 문서의 이모지를 전수 제거했다(제목·Revision History·표·ASCII 모사 포함). 어드민 「서비스 문서」가 docs를 그대로 렌더하므로 발행 텍스트와 규범이 갈릴 이유가 없다 |
| 본문의 `→` (U+2192) | **대상 아님** — 이모지가 아니라 타이포그래피다(`배움 → 실행 → 복기`, `그룹 4→3`). 지우면 문장이 깨진다. 단 **딩뱃 화살표**(그림문자 계열 화살표)는 `→`로 바꾼다 |

**의미를 지닌 글리프는 텍스트로 승계한다** — 지우기만 하면 정보가 사라지는 자리가 있다. 2026-11-01 정리에서 쓴 승계 규칙을 그대로 따른다.

| 원래 | 승계 | 왜 |
| :--- | :--- | :--- |
| 소제목의 `(등급 글리프 + Critical)` | `### … 차단 (Critical)` | 등급 단어가 이미 옆에 있어 글리프가 중복이었다 |
| 표의 `\| 상태 글리프 + 안전 (MIME 스니핑 방지) \|` | `\| 안전 (MIME 스니핑 방지) \|` | 표의 상태는 셀의 **단어**가 말한다 |
| 표의 `\| 부정 글리프 + 미설정 \| 긍정 글리프 + 정의 완료 \|` | `\| 미설정 \| 정의 완료 \|` | 전후 대비도 단어로 선다 |
| 터미널 모사 블록의 `  통과 글리프 + HTML 이스케이프` | `  [PASS] HTML 이스케이프` | 통과·실패 구분이 **유일하게 글리프에만** 걸려 있던 자리다. 터미널 출력은 대괄호 라벨이 관례다 |
| `자물쇠 아이콘(글리프) 노출` | `자물쇠 아이콘 노출` | 백틱 안 단독 이모지는 지우면 **빈 코드스팬**이 남는다. 괄호째 걷어낸다 |

강조가 필요하면 이모지가 아니라 마크다운의 수단을 쓴다 — `##` 소제목, `> 인용 콜아웃`, `**볼드**`, 표, 코드 블록. §3이 열거한 네 가지로 충분하다.

**자동 집행 (Enforcement)** — 규범을 의지가 아니라 게이트로 강제한다. 세 겹이다.

1. **작성 시점** — 어드민 에디터 본문 입력란의 플레이스홀더가 규범을 고지하고, AI 분석(`/builderslog/analyze`)·완역(`/builderslog/translate`) 프롬프트가 "이모지를 쓰지 않는다"를 지시받는다(제목 선두 글리프 금지·딩뱃 화살표 대신 `→` 사용까지 포함). 초안에 이모지가 들어오지 않게 하는 것이 가장 싸다.
2. **발행 시점** — `/builderslog/publish`가 시크릿 스캐너와 같은 자리에서 본문을 검사하고, 이모지를 발견하면 **발견한 글리프를 알려주며 발행을 거부**한다. 커밋된 뒤 빌드가 깨지는 것보다 여기서 막는 것이 낫다.
3. **빌드 시점** — `ci/design-check.mjs`의 `articleEmojiGate`가 두 발행 디렉터리와 메타 정본을 검사해 **파일:행과 글리프를 지목하며 빌드를 실패**시킨다. 총량은 `ci/pattern-budget.json`의 `emoji-article`이 0 고정으로 함께 지켜본다(래칫 대시보드 노출용 — 두 게이트는 같은 범위를 보므로 결과가 갈릴 수 없다).

**내부 문서(`docs/`)는 두 겹이다** — 2026-11-03 예외 철회와 함께 넣었다. 발행물의 세 겹 중 '작성 시점'(AI 초안 프롬프트)이 없는 대신, 쓰는 경로가 어드민 에디터와 수작업 두 가지뿐이라 저장과 빌드에서 잡는다.

1. **저장 시점** — `/admin/api/docs/save`가 시크릿 스캐너와 같은 자리에서 본문을 검사하고, 이모지를 발견하면 **행 번호와 글리프를 알려주며 저장을 거부**한다. 어드민 저장은 곧 main 커밋이므로 여기서 막는 것이 가장 싸다.
2. **빌드 시점** — `ci/design-check.mjs`의 `docsEmojiGate`가 `docs/**/*.md`를 재귀 검사해 **파일:행과 글리프를 지목하며 빌드를 실패**시킨다. 같은 게이트가 Revision History의 `Author` 열 재유입도 함께 막는다.

**두 게이트의 정규식은 발행물보다 좁다** — 내부 명세표는 단색 조판 기호(`★ ❖ ✦ ✓ ✗ ☐ ☑`)를 판정 기호로 쓴다. `Emoji_Presentation` 기본값이 이모지인 글자·변이선택자(U+FE0F)로 이모지 표현을 요구한 글자·그림문자 블록·국기만 본다. 화살표(`→ ← ↔ ▶`)와 원문자(`①②③`)는 위 표대로 타이포그래피라 대상이 아니다.

**사람이 직접 .md를 쓸 때**도 같다 — 어드민을 거치지 않는 경로는 1·2를 건너뛰므로 3이 마지막 그물이다. `npm run build` 전에 `node ci/design-check.mjs`로 미리 확인하면 된다.
