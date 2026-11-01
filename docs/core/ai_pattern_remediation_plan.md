---
status: active
domain: Core
last_updated: 2026-11-01
version: v2.7
target_files:
  - src/styles/index.css
  - ci/design-check.mjs
  - docs/core/design_system.md
  - index.html
---

# 🛠️ AI 패턴 개선 계획서 (AI Pattern Remediation Plan)

## 📝 Revision History

| Version | Date | Author | Description | Impact Area |
| :--- | :--- | :--- | :--- | :--- |
| v3.5 | 2026-11-01 | AI Agent | **P4-9 — 버튼 라운드 사각 단일화**(오너 결정: 알약은 AI 잔재로 읽힌다) — `design_system` **§4-4 v6.2 규범 신설**(CTA·클릭 버튼 `--radius-sm` 단일 / 아이콘 정사각 `50%` / CTA 컨테이너 `--radius-lg` / 배지 `--radius-xs`). 버튼 라운드 **34선언 6종 → 10선언 5종**. 전역 스캐폴드가 한 곳에서 선언하고 지면 중복 20건 제거 — 골격을 33셀렉터에 다시 적는 구조가 갈라짐의 원인이었다. 부수: 클릭 리플 오버레이가 본체와 라운드 불일치(테두리 겹침) · 배지가 알약이라 버튼으로 오인. `design-check` 하드 규칙 추가 후 **일부러 위반을 넣어 역검증** | design_system §2·§4-4, index.css, 11개 지면 CSS, ci/design-check |\n| v3.4 | 2026-11-01 | AI Agent | **P4-8 — 메인 지면 오너 QA 환류** — **내가 낸 회귀 2종 교정**: P2-4가 `animation`만 호버 게이트하려다 **규칙 전체를 `:hover`로 옮겨** 5개 서비스 카드 비주얼이 평상시 기하를 잃었고(17규칙 분리), P1-H1이 헤더를 좌측 리딩으로 바꾸며 **서브카피의 `margin: 0 auto`를 남겨** 블록만 가운데로 떴다. **측정 사각지대 발각**: 이모지가 `src/locales/*.json`에 있어 `.jsx`만 보던 지표가 **117건을 놓쳤다**(참값 20→137). 메인 CTA 6종을 `<Icon name="arrowRight">`로 통일. **AA 회귀**: `.revealed`가 `opacity: 0.6`으로 복원해 메인 4개 라벨이 ≈4.1:1이었다. **마지막 `<br />`** 12곳 제거 | WorkSection, JourneySection, PhilosophySection·Intro, ConnectSection, HeroContent, locales×3, ci/ |
| v3.3 | 2026-11-01 | AI Agent | **P4-7 신설·완료 — 목표 미달 10건 → 0** (오너 "커밋 전 모두 처리") — 체크박스 100%와 "잔여 없음"을 분리해 전수 해소. **측정기 결함 3건 교정**: `raw-hex-css`가 토큰 선언을 계수(목표 구조적 도달 불가) · `duplicate-selector`가 첫 `@media` 이후를 버리고 **3중 중첩 마스킹에도 실패**(→ 중괄호 깊이 마스커, 8→참값 13) · 글로우 게이트가 JS 상태 클래스 미인식. **목표 오추정 6건 정정**(`weight-bold-pct`는 **700+가 0**인데 분모 축소로 올라간 수치였다). **진짜 잔여 처리**: 중복 셀렉터 13→0(뒤 선언이 앞을 덮어 **사문**이던 실제 결함 포함) · 키프레임 51→43(**8개 이름, 1개 애니메이션**을 canonical로) · 생hex 124→37(`#87A9EC`는 "토큰화했다"는 **거짓 주석**이 2개월간 남아 있었다) | 전 CSS, ci/pattern-metrics, ci/pattern-budget, task_backlog |
| v3.2 | 2026-11-01 | AI Agent | **P0-3b + 어드민 이모지 전환 완료 → 계획서 100%** — 아티클 액센트 10종을 **브랜드 4색**으로 수렴(§9-10 집행)하고 **드리프트 발생원**인 어드민 자유 hex 입력을 4색 `<select>`로 교체. 어드민 이모지 **147개 → 0**(`emoji-jsx` 141→20, 잔여는 황도 12궁 데이터·앱 UI 설명문·조판 기호). 아이콘 9종 신설(40→49). `ServiceDocs`는 이모지가 **문자열·객체 키·상태에 구워져** 있어 렌더 구조를 수술했다 — 어드민에만 이모지가 남아 있던 구조적 이유다. **게이트 결함 4건째 자가 발각**: P4-3이 `<Icon label>`을 몰라 정상 코드를 오탐 | AdminDashboard, ServiceDocs, ErrorBoundary, Icon, buildersLogMeta, ci/design-check |
| v3.1 | 2026-11-01 | AI Agent | **P3-10 완료 + P3-13 신설·완료 + 장부 정정 3건** — 인라인 style **176 → 117**. 어드민 105→77(2회 이상 반복분만 유틸 7종으로, 1회성은 인라인 유지), 비어드민 60→40(정당 34 = 동적 13 + **CSS 커스텀 프로퍼티 16** + ErrorBoundary 5). Tailwind 퍼플 잔존분 전량 해소. **치환 전 특이도 전수 검증**으로 유틸리티가 후손 셀렉터에 지는 회귀를 사전 차단. **발견: JSX 인라인은 `design-check`의 사각지대** — 비토큰 font-size와 텍스트 opacity가 게이트를 통과하고 있었다. **자가 회귀 1건 발생·복구**: 스크립트 중단으로 JSX에서만 제거된 상태를 빌드·게이트가 PASS로 통과시켰다("게이트 PASS는 이전 완료의 증거가 아니다"). 장부 정정: **P0-1·P1-A2·P2-8은 이미 완료 상태**였다(코드 확인) | AdminDashboard(jsx·css), Sylphio 3지면, index.css, DailyDigest.css |
| v3.0 | 2026-11-01 | AI Agent | **P3-9 완료 → 브레이크포인트 고유값 10 → 5** — 12곳 머지(1100→1024 · 900→1024 · 760/767/700→768). `1100px`이 **하드 오버플로가 아니라 판단값**임을 flex 계산으로 확인한 뒤 머지했고(1025px에서 본문 637px), **머지가 같은 파일 내 동일 질의 중복을 만들지 않았음**을 확인해 캐스케이드 순서 사고를 차단했다. 목표 3~4는 오추정 — 실측 역할은 640/768·769/1024 **3티어**이고 `max-width: N`/`min-width: N+1` 쌍은 어떤 규약에서도 인접 두 수를 요구한다. **부수 수확: 빈 `@media` 블록 4개 삭제**(3개는 P2-4 모션 정리의 잔재, 전역 reduced-motion 규칙이 이미 덮고 있었다) | 12개 CSS, ci/pattern-budget |
| v2.9 | 2026-11-01 | AI Agent | **P3-1 · P3-2 · P3-3 완료(승인 후 적용) → P3 80%, 전체 54/55(98%)** — Waymark 4모드 그리드를 **대화 예시 + 정의 목록**으로 교체하고, **본문 없는 "경험담 티저" 섹션을 삭제**(고유 문장은 `loop.steps[2]`와, 마무리는 `cta.soon`과 3로케일 전부 완전 중복이었다), "문제 공감"을 **선언 블록**으로 전환 → 섹션 형식 4종. Sylphio 7카드는 **대등하지 않은 7개**임을 특정해 주장 3카드 + 하위 4리스트로 재편하고 최상급 제목(`7대 무기`/`7 Ultimate Weapons`)을 3로케일 교체. **측정기 결함 자가 발각 3건째**: `uniqueValues`에 **선언 시작 경계가 없어** 새 클래스 `.wm-demo-gap::before`의 **셀렉터 이름**이 `gap:` 으로 잡혀 `gap-unique`가 13→17로 거짓 초과(클래스명이 속성명으로 끝나면 재발하는 구조적 결함) → 경계 요구 + `row-gap`/`column-gap` 명시 포함으로 교정, 4개 지표 모두 기록된 기준선과 재일치 | WaymarkLanding(jsx·css), SylphioLanding(jsx·css), locales×3, ci/pattern-metrics |
| v2.8 | 2026-11-01 | AI Agent | **P3-4 · P3-5 · P3-7 완료 → P3 50%, 전체 51/55(93%)** — 절대화·반복 카피를 3로케일 동시 교체. **반복 어구의 원인이 리스트 레지스터 불일치**임을 특정해 7항목 명사구 패러렐로 통일(반복·절대화 동시 해소). i18n 이전 과정에서 **라이브 결함 5건 발각**: 결제 모달 한국어가 en·ja 사용자에게 노출되고 있었다. **게이트 설계 결함 자가 수정 2건째**: `I18N_EXCLUDE` 파일 단위 제외가 그 누출을 숨기고 있어 **`ko:` 블록 단위 마스킹**으로 교체하고 Sylphio 3파일 제외 해제 | SylphioLanding, SylphioApiKeyGuide, ci/design-check |
| v2.7 | 2026-11-01 | AI Agent | **P1 완료 (22/22)** — H6 CJK 줄바꿈 단일화(개별 선언 **52건** 제거 → `body` 1회 선언, `:lang(ja) * !important` **전역 해머 제거**). G7·G9·G10은 **측정으로 닫았다**: G7의 '화살표 156개'는 StarField의 **별자리 선 연결 주석**(`γ→β→α`)을 센 오류로 실제 렌더는 6개 · G10은 P4-3·G2로 이미 해소(잔여 34건은 `<button>`에 필요한 선언) · G9는 장식 원·컨트롤 원 모두 정당 | index.css, 12개 CSS |
| v2.6 | 2026-11-01 | AI Agent | **P1-H2a · P1-G2 · P2-2 묶음 처리 — 중복 선언 130건 제거** — 같은 기법을 셋에 적용: **JSX를 건드리지 않고 기존 셀렉터를 index.css 그룹으로 묶어 메트릭을 한 곳에 모으고 페이지 CSS에서 중복을 제거**. 대문자 라벨 3역할(83건, `uppercase` 36→17) · 버튼 공통 골격 32셀렉터(47건, `cursor-pointer` 53→34) · Connect 섹션 글로우 2→1. 측정기 `glow-idle-visible` 신설(총량→병리 교정, `infinite-ungated`와 동일 논리). 목표 3건 정정 | index.css, 20개 CSS, ci/ |
| v2.5 | 2026-11-01 | AI Agent | **P4 집행 체계 마감 (P4-1·3·4·5) — 집행 차원 1 → 12** — `design-check`에 하드 규칙 5차원(radius·tracking·leading·weight·transition)과 **접근성 게이트 3종** 추가, 전부 **어드민 포함 전역 집행**. **EXCLUDE 정책 명문화**(적용 범위를 `font-size`로 한정). `design_system.md` **v6.1**: 규범 공백 4절 신설(§4-3 자간·행간·굵기 / §4-4 라운드·버튼기하·호버 / §4-5 간격 / **§9-13 장식 예산**). 자가 버그 2건 교정(주석 스캔·화살표 `=>` 오인) | ci/, design_system, 4개 CSS/JSX |
| v2.4 | 2026-11-01 | AI Agent | **P3-8 타입 스케일 35단 → 11단 (샘플 승인 후 전면 적용)** — 0.05rem 균일 격자를 **역할 이름 + 비율 간격**으로 교체. 347개 사용처 마이그레이션, 구 35단 선언 제거, `design-check` 허용값 11개로 교체, `design_system.md` **§4-2 전면 재작성(v6.0)** + 현행 규범 본문 11곳 토큰명 갱신. 부수 수확: 허용 목록을 좁히자 **구 토큰 값과 우연히 일치해 통과하던 clamp 내부 생리터럴 10건** 발각·토큰화 | index.css, 27개 CSS, ci/, design_system |
| v2.3 | 2026-11-01 | AI Agent | **P2-9 `!important` 67 → 8 (목표 20 초과 달성)** — 특정도 전쟁 4건을 **원인 제거**로 종결. 최대 건은 D-3의 파생 효과: 어드민 커서 `!important` **7건의 존재 이유가 사라져** 통째로 폐기됐다. Header 16건은 특정도가 이미 이기고 있었고(0,2,0 > 0,1,0), DM Pick 카드는 두 지면이 `!important`로 맞다투던 것을 특정도 서열로 정리. 햅틱 `:active` 중복 4건은 전역 목록에 편입. 잔존 8건은 전부 정당(접근성 킬스위치·외부 CSS 대응·의도된 최상위 우선) | 8개 CSS |
| v2.2 | 2026-11-01 | AI Agent | **히어로 타이틀 그라디언트 단일화 (D-10)** — 오너 지적 "히어로 타이틀만 컬러가 다르다"를 **1차에 오독**(렌더 버그로 읽어 `inline-block` 누락을 고쳤다 — 그 버그도 실재했으나 지적은 **일관성**이었다). 전수 조사하니 그라디언트가 **3종**이었다: 브랜드 4곳 / Sylphio 사파이어 3곳 / **조항에 없는 흰색→반투명 변종 2곳**. 9지면 전량 `--gradient-brand`로 통일 + **§9-1 '제품 브랜드 예외' 조항 폐지**(design_system v5.25) | 5개 CSS, design_system |
| v2.1 | 2026-11-01 | AI Agent | **🔴 Sylphio 히어로 타이틀 렌더 결함 교정(오너 발견) + 결함 유형 3종 게이트화** — §9-1 v5.18 필수 `display: inline-block`이 Sylphio 3지면에만 누락돼 흰→사파이어 그라디언트가 **거의 흰색 단색으로** 렌더되고 있었다. 블록 엘리먼트 위반 3건 추가 교정. 중복 셀렉터 2건 병합(결함을 숨기는 구조). 측정기 지표 3종 신설: `gradient-text-no-inline`·`duplicate-selector`(+자가 버그 1건 교정) | Sylphio 3지면, BuildersLogDetail, WorkSection, DailyCalendar, Admin, ci/ |
| v2.0 | 2026-11-01 | AI Agent | **Sylphio 히어로 마크 제거 + P3-12 데드 CSS 전량 정리** — §9-1 '예외 없음'을 제품 앱 아이콘에도 적용(오너 결정) → P0-5에서 통합한 `sylphio-shell.css`가 전 규칙 고아가 되어 **파일 삭제**. 데드 CSS **194규칙/약 1,520줄** + 고아 컴포넌트 `DailyIntro`(jsx 136 + css 381) 삭제 → **CSS 13,372 → 11,705줄**. 역방향 검증(JSX↔CSS)으로 **회귀 0** 확인. `gradient-text` 21·`backdrop-filter` 29로 목표 달성. **게이트 설계 결함 1건 자가 수정**: 비율 지표를 래칫에서 분리(분모가 줄면 올라 '나빠진 게 없는데' 빌드가 막혔다) | 13개 CSS, ci/, design_system |
| v1.9 | 2026-11-01 | AI Agent | **아이콘 전환 완결(154→12) + 히어로 마크 전면 폐지(D-9)** — 아이콘 세트 12→**40종**, 제품·섹션 아이덴티티까지 전환. `IconOrGlyph` 하이브리드 신설. 이후 **오너 QA: "히어로에 아이콘이 더 이상하다"** → 7개 지면 히어로 마크 전량 제거 + 고아 CSS 14규칙·미사용 import 2건 정리 + **`design_system.md` §9-1 개정(v5.24)**. 부수: 죽은 i18n 키 `heroCtaGuide` 9건, `✨` 플랭킹·PRO 배지 | Icon.jsx, 20개 JSX/CSS, design_system |
| v1.8 | 2026-11-01 | AI Agent | **P2-7 자작 SVG 아이콘 세트 신설(D-7 ①)** — [`src/components/common/Icon.jsx`](../../src/components/common/Icon.jsx) 12종(close·check·warning·arrowRight·loop·document·mail·download·lock·unlock·key·shield). UI 컨트롤 이모지 **32건** 전환(모달 닫기·완료 체크 3·경고·스텝 화살표 2·루프·Sylphio LNB 12·다운로드 CTA 라벨 9·paywall 잠금). 이모지 270→238 | Icon.jsx, 7개 JSX |
| v1.7 | 2026-11-01 | AI Agent | **P2 장식 예산 전면 적용(샘플 승인 후)** — `transition: all` **60→0** · `backdrop-filter` **90→33** · **유휴 구동 infinite 51→8** · 고아 키프레임 **20→0**(총 71→51) · 그라디언트 텍스트 **31→26**(파일당 3→2) · 텍스트 opacity 중첩 5건(AA 미달 4.1:1) 해소. `.btn-glow` 폐지(JSX 0회 사문). 측정기 결함 2건 자가 정정(gradient-text 접두사 중복 → 규칙 단위 / infinite 총량 → 게이트 기준). **데드 CSS 대발견**: `DailyDigest.css` 1,665줄 중 **850줄(46%)이 ReLearn 통폐합 잔재** → P3-12 신설 | 전 CSS 30파일, ci/ |
| v1.6 | 2026-11-01 | AI Agent | **D-7·D-8 확정 → G1b·G3·G6·G8 완료 + 라이브 결함 5건 해소** — 라운드 72건 스냅(고유값 33→10), 버튼 기하 4단 토큰화(패딩 29종→4, min-height 0→전 버튼, 터치 44px 보장), gap 196건 토큰화(32→14). **죽은 `var()` 폴백 142건 제거**(그중 117건이 토큰 실제값과 모순) · **미선언 토큰 참조 7건 교정**(Footer 브랜드 폰트 유실·BuildersLog 전이 미동작·아티클 액센트 깨짐 등 라이브 결함). 하드 규칙 2종(`undeclared-token-ref`·`dead-var-fallback`) + `btn-raw-padding` 지표 신설. 목표 2건 추가 정정(gap 6→11·radius 5→8) | 전 CSS, ci/, buildersLogMeta.json |
| v1.5 | 2026-11-01 | AI Agent | **P1-H5·H1 완료 + 목표 2건 정정** — 굵기 149건 역할별 재배치(**8종→3종**, **700+ 126→0**), 중앙정렬 7곳 해제. **미로드 굵기 결함 20건 발견·해소**(Inter는 400/500/600/700만 로드하는데 CSS가 100/300/800/900 사용 → 영문 로케일에서 합성 굵기). 측정기에 `weight-700plus` 신설. **목표 2건이 근거 없는 추정이었음을 인정·정정**: `weight-bold-pct` 40→65%, `align-center-pct` 35→62% (잔존이 전부 정당한 사용이었음을 전수 분류로 확인) | 전 CSS 30파일, ci/ |
| v1.4 | 2026-11-01 | AI Agent | **P1-H3·H4 완료 + P2-7 재정의** — 자간 토큰 5종·행간 토큰 6종 신설 후 238건 토큰화(자간 20→**5종** 목표 달성, 행간 16→**6종**). P1-H2는 실측 결과 **단일 패턴이 아니라 3개 역할**(아이브로우/배지/사이드바라벨)이어서 H2a(역할 명문화)·H2b(리트로핏)로 분할. P2-7 이모지 항목을 **5계층 분류로 재정의** — '전체 삭제'가 아니며 270 중 공개 지면은 127건, 어드민 119·황도12궁 24는 대상 아님(목표 ≤120 → 공개 기준 ≤70으로 정정). D-7(아이콘 세트)·D-8(라운드 스냅) 결정 요청 신설 | index.css, 전 CSS 30파일 |
| v1.3 | 2026-11-01 | AI Agent | **P4-2 집행 장치 가동 + P1-A1·A2·G4·G1a 완료** — 래칫 게이트 [`ci/pattern-budget.mjs`](../../ci/pattern-budget.mjs) 신설(23지표 단조감소 + 하드규칙 3종, prebuild 연결·회귀 차단 실측 검증). 제품 액센트 6종 토큰 선언 후 `--card-accent`/`--point-color` 단일 소스로 재배선(파생 42곳). 호버 부유 3→2종, 라운드 생값 42건 토큰화. **측정기 결함 1건 자가 정정**(hover-lift가 @keyframes 진폭을 섞어 세 '7종'으로 과대 보고 → 실제 3종) | ci/, index.css, WorkSection, Header |
| v1.2 | 2026-11-01 | AI Agent | **결정 6건 확정(D-1~D-6) + P0 완료 + P1-G5 처리** — 오너 결정: D-1①(세리프 폐지)·D-2①(`\n` 규약 유지)·D-4①(제품 테마 구분 강화)·D-5①(다크 전용 유지)·D-6①(브랜드 4색 수렴), D-3은 위임받아 **'제거'가 아닌 '홈 스코프 한정'** 으로 판단. P0-1 집행(폰트 5→3패밀리), **P1-G5 전역 포커스 체계 신설**(포커스 0건 상태 종료) | index.html, index.css, Layout·Home·TelescopeCursor |
| v1.1 | 2026-11-01 | AI Agent | **P0 실행 완료(7/8)** — P0-2·3·4·5·6·7·8 처리, P0-1만 D-1 결정 대기로 보류. 측정기 [`ci/pattern-metrics.mjs`](../../ci/pattern-metrics.mjs) 신설로 §7 대시보드를 재기준선화(손 grep 오차 13건 정정, audit v1.1 연동). P0-3 수행 중 **비시스템 색 체계가 P0 범위를 초과함을 확인** → P1-A1 신설 + D-6 결정 추가 | src 24파일, ci/, docs |
| v1.0 | 2026-11-01 | AI Agent | **최초 수립** — [AI 패턴 감사](ai_pattern_audit.md) v1.0 진단에 대응하는 5단계(P0~P4) 실행 계획 + 투두 체크리스트 + 진척 대시보드 수립 | 전 프런트엔드 |

> **운영 규칙**
> 1. 본 문서가 AI 패턴 개선 작업의 **단일 정본(SSOT)** 입니다. 진단 근거는 [AI 패턴 감사](ai_pattern_audit.md), 규범 제정은 [디자인 시스템](design_system.md)이 각각 정본입니다.
> 2. 투두는 `- [ ]` → `- [x]` 로 전환하고, **완료일과 실측 후값을 같은 줄에 남깁니다.**
> 3. 각 단계 완료 시 §7 진척 대시보드의 수치를 갱신합니다. 수치는 §8 측정 스크립트로 재현합니다.
> 4. 규범 변경이 수반되는 항목은 `design_system.md` 개정을 **함께** 수행합니다(조항 추가가 아니라 **기존 조항 교체·예산화**를 원칙으로).

---

## 1. 🎯 설계 원칙 — 왜 "조항 추가"가 아니라 "예산 집행"인가

감사 §2-8의 메타 진단이 이 계획의 전제입니다.

> 디자인 12차원 중 CI가 집행하는 것은 `font-size` 1개이고, 그 1개의 허용값이 35종이다.
> 규범이 두꺼워지는 속도가 실제 품질 개선 속도를 추월했다.

따라서 본 계획은 **세 가지를 금지**합니다.

| 금지 | 이유 |
| :--- | :--- |
| ❌ `§9-13`, `§9-14`… 조항을 새로 추가하는 방식 | 지금까지 25회 했고, 그 결과가 현재 상태입니다 |
| ❌ "선재 리터럴을 토큰으로 등재"하는 방식 | 토큰이 35종이 된 경로입니다. **값을 승인하지 말고 값을 줄여야** 합니다 |
| ❌ 페이지를 한 장씩 손보는 방식 | 전역 메트릭이 흔들린 상태에서는 개별 수정이 상쇄됩니다 |

대신 **세 가지를 채택**합니다.

| 채택 | 내용 |
| :--- | :--- |
| ✅ **예산(budget) 집행** | "페이지당 그라디언트 텍스트 ≤1개, 글로우 ≤1개, infinite 애니메이션 0개" 처럼 **CI가 개수를 센다** |
| ✅ **압축 우선** | 토큰을 늘리지 않고 줄입니다. 35→10단, 라운드 19→4종, 자간 20→5종 |
| ✅ **G·H 선행** | 버튼·텍스트 메트릭은 전 페이지에 반복되므로, 여기를 고치면 **개별 페이지를 안 건드려도 전역 품질이 오릅니다** |

---

## 2. 🔴 P0 — 결함 교정 (반나절, 시각 리스크 없음)

> 성격: 버그에 가까운 항목. 디자인 판단이 필요 없고, 되돌릴 이유도 없는 작업.

- [x] **P0-1 · 죽은 세리프 폰트 2종 처리** — ✅ 2026-11-01 (장부 정정) — D-1 ①로 결정되어 이미 실행 완료. 코드에 `Cormorant Garamond`·`Playfair Display` 사용처 **0**(남은 것은 D-1 결정을 기록한 주석 1줄). 구 내용: ⏸️ — **D-1 결정 대기로 보류(미착수)**. — `Cormorant Garamond`·`Playfair Display`는 `:lang()` 3종 전부가 `--font-display`를 산세리프로 덮어써서 **렌더 경로가 0**. ① 제거하거나 ② 세리프를 되살릴지 **결정 필요**(§5 결정 대기 D-1). 결정 전까지는 보류.
- [x] **P0-2 · `'Outfit'` 유령 폴백 제거** — ✅ 2026-11-01 — **9곳 전수 제거**(계획서의 '3곳'은 1파일만 grep한 과소 집계였음): `DailyCalendar.css` 3 · `DailyDigest.css` 4 · `DailyIntro.css` 1 · `SylphioNav.css` 1. 이 중 3곳은 1순위 패밀리 선언이었다. 라이브 번들 `Outfit` **0건** 확인. 시각 변화 0(미로드 폰트는 이미 스킵됨). 잔존 `Noto Sans KR`·`Noto Serif JP`·`Fira Code`는 **시스템 설치 가능성이 있어 정당한 폴백** — 제거 대상 아님
- [x] **P0-3a · 토큰과 수치가 동일한 생hex → 토큰** — ✅ 2026-11-01 — **CSS 68개소(14파일) + JSX 인라인 4개소 = 72건** 치환. 시각 변화 **0**(값이 토큰과 완전히 동일). 제외 판단: ① `ConstellationAssembly.jsx`(38)·`StarField.jsx`(2)는 **캔버스/SVG용 JS 색 데이터 배열**로 `var()` 사용 불가 · ② `ErrorBoundary.jsx`는 **앱 크래시·청크 로드 실패 시 CSS 미로드 상황**을 전제하므로 하드코딩이 의도적 · ③ `ConceptCards.jsx`·`Header.jsx`의 SVG 프레젠테이션 속성 · ④ 어드민(P3-10) · ⑤ 오너 미커밋 `src/pages/waymark/`. 1건만 미세 시각 변화: `#10B981 → var(--color-success)`(#34D399, 1px 깜빡이 커서) — design_system **§1-4가 성공·활성 지시를 단일 토큰으로 규정**하므로 규범 이행
- [x] **P0-3b · 비시스템 색 수렴** — ✅ 2026-11-01 (오너 결정: 브랜드 4색 수렴) — **제 감사가 과소 집계했다**: "잔여 2건"이 아니라 `buildersLogMeta.json`의 **14개 아티클에 액센트 10종**, 그중 8종이 생hex·브랜드 4색 밖이었다(`#6D28D9`×4·`#8B5CF6`×2·`#1E80FF`·`#EC4899`·`#DC2626`·`#10B981`). design_system **§9-10이 이미 "카테고리/강조색은 브랜드 4색"을 규정**하고 있었으므로 새 결정이 아니라 규범 집행이었다. **첫 태그가 말하는 역할**로 배정: indigo 4(브랜드·디자인·제품 아이덴티티) · cyan 7(테크 시그널 — API·보안·백엔드·제품 루프) · gold 3(플랫폼 기반·운영). **원인 제거**: 어드민 발행 폼이 신규 아티클 액센트를 **`#6D28D9` 기본값 + 자유 hex 입력**으로 받고 있었다 — 이게 드리프트의 발생원이므로 **브랜드 4색 `<select>`로 교체**하고 기본값을 토큰으로 바꿨다(사후 정리보다 입력에서 막는 게 싸다). 구 내용: ⏸️ — **P0 범위 초과 확인(2026-11-01).** 남은 off-system 색은 `#8B5CF6`(violet-500, Builder's Log 라벨 ×2)·`#F59E0B`(amber-500, Platform Foundation)·`#00F2FE`(Sylphio ×2)이고, 이들은 고립된 생hex가 아니라 **카드 전체의 액센트 계열과 묶여 있다**(`--glow-color: rgba(124,58,237,.4)`·`data-accent-color="124,58,237"`·아이콘 배경 `rgba(124,58,237,.08)` 등 바이올렛 계열 **40개소 이상**). 라벨 색만 토큰으로 바꾸면 **라벨은 연인디고, 뒤 글로우는 진바이올렛**이 되어 지금보다 나빠진다. 추가 발견: 선언 토큰 `--prism-lavender`(#C7D2FE)와 **별개의 미선언 바이올렛 `#C4B5FD`(violet-300)가 병행 운용** 중. 색 체계 정합은 디자인 결정이므로 **D-6** 신설 → **P1-A1**에서 일괄 처리
- [x] **P0-4 · 금지대역 `max-width` 위반 2건** — ✅ 2026-11-01 — `--admin-container: 1400px` 스코프 토큰 신설 후 `max-width: var(--admin-container)` ×2로 치환. 측정기 `금지대역 max-width px` **2 → 0**. 주석에 'EXCLUDE는 사각지대이지 허가가 아니다'를 명문화(P4-5 연동). 구 본문: — [AdminDashboard.css:149,289](../../src/pages/AdminDashboard.css#L149) `1400px`. 어드민이 `EXCLUDE`라 CI가 못 잡은 사각. 토큰화하거나 `EXCLUDE` 사유를 문서에 명시.
- [x] **P0-5 · Sylphio 3중 복제 블록 공통화** — ✅ 2026-11-01 — `src/styles/sylphio-shell.css` 신설(86줄). 3개 페이지에서 규칙 4개 + 키프레임 4개씩 제거하고 JSX에 셸 import 배선. CSS 줄수: Landing 761→687 · Privacy 318→246 · ApiKeyGuide 491→419(**총 −218줄**). 라이브 번들 `sylphio-aurora-core` **3 → 1건** 확인
  **⚠️ 사후 경과(같은 날)**: D-9 '히어로 마크 예외 없음'이 Sylphio 앱 아이콘에도 적용되면서 이 블록의 **전 규칙이 고아가 됐고 파일을 삭제**했다. 통합한 것을 결국 전부 지운 셈이다 — **구조 정리(P0)보다 '이게 필요한가'(P3 구성)를 먼저 물었다면 작업이 없었을 일**이다. 계획의 P0→P3 순서가 가진 구조적 한계로 기록한다.
- [x] **P0-6 · 키프레임 중복 정의 해소** — ✅ 2026-11-01 — 중복 이름 **6종 → 0**, 총 선언 **81 → 71**. `floatCore`·`spinCore`·`spinRing`·`floatIcon`은 P0-5 셸로 단일화. `fadeIn`은 `index.css` 전역 정의 사용(Sylphio 중복 제거). **`bentoPulse`는 단순 제거가 아니라 `index.css`로 승격** — Header(전 지면 로드)와 WorkSection(홈 전용)이 공유하므로 한쪽만 지우면 비홈 지면에서 애니메이션이 깨진다
- [x] **P0-7 · 스크롤 하이재킹 제거** — ✅ 2026-11-01 — [Home.jsx](../../src/pages/Home.jsx)에서 `body.style.overflow='hidden'` 락과 `scrollLocked` 상태를 폐기. 대신 [HeroContent.jsx](../../src/components/hero/HeroContent.jsx)가 **양보**한다 — `wheel`/`touchstart`/`keydown`/`scroll` 중 하나라도 들어오면 타이머를 전부 취소하고 전 요소에 `.visible`을 즉시 부여한 뒤 완료 통지(`onIntroComplete` 멱등 가드 추가). 기다릴 사람은 연출을 보고, 넘길 사람은 즉시 넘긴다. 구 본문: — [Home.jsx:47-48](../../src/pages/Home.jsx#L47) `body.style.overflow = 'hidden'` 락 해제. 인트로는 스크롤과 경쟁하지 않고 **양보**하도록(스크롤 입력 시 인트로 즉시 완료).
- [x] **P0-8 · 모달 닫기 시맨틱 교정** — ✅ 2026-11-01 — `<div className="paywall-close" onClick>` → `<button type="button" aria-label>`. `.paywall-close:focus-visible`(2px cyan 링 + offset) 동반 신설. 측정기 `focus-visible 보유 파일` **5 → 6**. 구 본문: — [SylphioLanding.jsx:520](../../src/pages/SylphioLanding.jsx#L520) `<div className="paywall-close" onClick>` → `<button type="button" aria-label=…>`. 키보드 접근 불가 상태.

**완료 기준:** `npm run build` 통과 + 라이브 번들 grep으로 폰트 2종·Tailwind 퍼플 미포함 확인([배포 확인 방법](development_guide.md) 준수 — 엔트리 해시 비교는 오판 유발).

---

## 3. 🟠 P1 — G·H 계층 정합 (2~3일, 효과 최대)

> 성격: **전역 메트릭 통일.** 개별 페이지를 손대지 않고 전역 품질을 올리는 구간. 본 계획의 핵심.

### 3-0. A 색 체계 정합 (P0-3b 승격분) 🆕

- [x] **P1-A1 · 비시스템 색 계열 정합** — ✅ 2026-11-01 (**D-6 ①**) — `index.css`에 **제품 액센트 토큰 6종**(`--accent-base/planner/log/relearn/waymark/sylphio`)을 **유일한 선언 지점**으로 신설하고, 홈 플래그십 5카드는 `--card-accent`, GNB 벤토 6항목은 `--point-color` **하나만** 꽂는다. 라벨·글로우·보더·CTA·블러오브·목업 내부색은 전부 `color-mix()`로 파생(dist 기준 `--card-accent` 34곳 · `--point-color` 8곳).
  **배정 원칙: 제품이 자기 지면에서 이미 쓰는 색을 우선**(사용자가 제품 안에서 보는 색이 가장 강한 신호).

  | 제품 | 액센트 | 변화 |
  | :--- | :--- | :--- |
  | Base | `--prism-rose` 실버 | ← amber `#F59E0B` (브랜드 4색 밖) |
  | Planner's View | `--prism-lavender` | 변화 없음 |
  | Builder's Log | `--color-gold` | ← violet `#8B5CF6` (자체 지면 CTA 테마가 이미 gold) |
  | ReLearn | `--color-cyan` | 홈 유지 · **GNB 벤토의 indigo 이탈을 정합** |
  | Waymark | `--color-indigo` | 변화 없음 |
  | Sylphio | `#87A9EC` 사파이어 | ← `#00F2FE` (히어로 그라디언트와 불일치했음). §9-1 제품 브랜드 예외로 존치 |

  **작업 중 추가 발견 4건**: ⓐ `.flagship-cta-btn.indigo`가 같은 파일에 **두 번 선언**돼 뒤가 앞을 덮었다 → violet 블록은 사문이고 Builder's Log CTA는 실제로 indigo로 렌더됐다(라벨 violet / CTA indigo / 지면 gold = 한 제품 세 색의 직접 원인). ⓑ `.visual-blur-orb.indigo`도 동일하게 중복 선언. ⓒ **`relearn-loop-theme`은 CSS 정의가 아예 없었다** — ReLearn 벤토 항목은 point·glow·aura·border 전부 미정의로, active 상태에서 배경·테두리가 나타나지 않았다. ⓓ `daily-cyan-theme`·`pace-green-theme`은 ReLearn 통폐합 후 JSX에서 사라진 사문. 전부 제거·정합.
  **변종 클래스 폐지**: CTA 5종(amber/indigo/cyan/green/blue) · 블러오브 6종 → 각 1개 규칙.
- [x] **P1-A2 · 미선언 바이올렛 정리** — ✅ 2026-11-01 — `#C4B5FD`(violet-300)·`rgba(124,58,237)`(violet-600)이 선언 토큰 `--prism-lavender`와 병행 운용되던 것을 전부 `--prism-lavender` 파생으로 수렴(WorkSection 범용 틴트·ConnectSection·SylphioApiKeyGuide·HeroSection). **잔존 예외 3종(의도적)**: ① `ErrorBoundary.jsx` — 앱 크래시·청크 실패 시 **CSS 미로드 상황**을 전제하므로 하드코딩이 올바르다 ② `StarField.jsx`·`ConstellationAssembly.jsx` — 캔버스/JS 색 데이터 배열로 `var()` 사용 불가 ③ `HeroSection.jsx` SVG 프레젠테이션 속성 — 값만 선언 토큰과 일치시킴.
- [x] **P1-A2 · 미선언 바이올렛 정리** — ✅ 2026-11-01 (장부 정정) — `#C4B5FD` 사용처 **0**. P0-3/P1-A1 색 수렴 과정에서 함께 해소됐다. 구 내용: — `#C4B5FD`(violet-300)가 선언 토큰 `--prism-lavender`(#C7D2FE)와 **병행 운용** 중. 둘 중 하나로 수렴하거나 `#C4B5FD`를 토큰으로 승격. D-6 연동.

- [x] **P1-A3 · 토큰 무결성 — 🔴 라이브 결함 5건 해소** — ✅ 2026-11-01 — G 계열 작업 중 파생 발견.

  | # | 결함 | 피해 |
  | :--- | :--- | :--- |
  | ① | **죽은 `var()` 폴백 142건** 제거 — 그중 **117건이 토큰 실제값과 모순** | 런타임 무해하나 **오해를 유발하는 문서**다. `var(--space-xl, 40px)`(실제 32px) ×9 · `var(--text-secondary, #a1a1aa)`(실제 #E2E8F0) ×18 · `var(--radius-lg, 16px)`(실제 24px) ×3 · `--space-xs`에 폴백 3종(4/6/8px). **드리프트가 재유입되는 경로** |
  | ② | **`--font-sans` 미선언** ([Footer.css](../../src/components/layout/Footer.css)) | 폴백이 없어 `font-family` **선언 전체가 무효화** → 슬로건이 브라우저 기본 폰트로 렌더되고 있었다 |
  | ③ | **`--duration-medium` 미선언** ×3 ([BuildersLog.css](../../src/pages/BuildersLog.css)) | 무효한 시간값 → 카드의 `border-color`·`box-shadow`·`background-color` 전이가 **아예 동작하지 않았다**(즉시 전환) |
  | ④ | **`--prism-indigo` 미선언** ([buildersLogMeta.json](../../src/data/buildersLogMeta.json)) | Builder's Log 아티클 1편(`ai-pacenote-expansion`)의 액센트가 **색 없이** 렌더 |
  | ⑤ | `--theme-color`·`-semi`·`-glow` 주입처 없음 / `--border-color`·`--surface-bg` 미선언 | 죽은 간접 참조(DailyDigest) + 어드민 select 무효 토큰 |

  | ⑥ 🔴 | **§9-1 `display: inline-block` 누락** (Sylphio 3지면) | **오너 발견(2026-11-01).** h1은 기본 block이라 풀폭이고, 짧은 "Sylphio" 텍스트가 1200px 폭 그라디언트의 **중간 구간만 샘플**해 의도한 `흰색→사파이어→네이비` 스윕이 **거의 흰색 단색으로** 렌더됐다. §9-1 v5.18이 Candela에서 **똑같은 증상을 잡고 명문화**했는데 Sylphio엔 적용되지 않았다(다른 4지면은 전부 준수). 함께 교정: 그라디언트 꼬리 `#1e3c72`(다크 네이비)가 다크 배경에서 **사라졌다** → 밝은 쪽으로 종료 · 생hex 3개 토큰화(`#87A9EC` = `--accent-sylphio`) |
  | ⑦ | 같은 위반 블록 엘리먼트 3건 | `.chrono-calendar-month`(h3) · `.detail-title`(h1) · `.admin-header h1` |
  | ⑧ | **같은 셀렉터 2회 선언** 2건 병합 | `.detail-title`은 `display`가 앞 규칙·그라디언트가 뒤 규칙에 흩어져 **정적 검사를 통과**했다. `.flagship-cta-btn`은 기하와 색이 415행 떨어져 있었다. 규칙 전체를 한눈에 못 보게 만드는 구조이고, P1-A1의 `.flagship-cta-btn.indigo` 사문 사고와 같은 뿌리다 |

  **런타임 주입 변수 30건은 보존**(`--card-accent`·`--accent-color`·`--reveal-delay`·`--scroll-progress`·`--point-color` 등 JSX 인라인/스코프 선언 — 폴백이 정당한 기본값).
  **영구 차단**: 하드 규칙 2종(`undeclared-token-ref: 0` · `dead-var-fallback: 0`) + **지표 2종 신설** — `gradient-text-no-inline`(현재 8 = 전부 `<span>`·`.accent` 등 기본 inline으로 선언 불필요. **블록 위반 0**) · `duplicate-selector`(현재 8, 목표 0). 둘 다 **빌드가 절대 못 잡는 종류**다.
  **측정기 자가 버그 1건**: `duplicate-selector`가 전 파일을 이어붙인 뒤 **첫 `@media`에서 잘라** 0으로 나왔다 → 파일 단위 집계로 교정(0→8).

### 3-1. G 버튼·컨트롤 기하

- [x] **P1-G1a · 라운드 정확 일치분 토큰화** — ✅ 2026-11-01 — `--radius-xs: 4px` **1종만** 추가(실사용 13곳이 정확히 4px인 태그·배지·칩 대역. 그 이상 늘리지 않는다 — 토큰 인플레이션은 `--fs-*`가 35단이 된 경로다). 토큰과 **값이 완전히 같은** 생값 **42건** 치환(4/6/12/24/999/9999px), 시각 변화 **0**. 고유값 **33 → 28**.
- [x] **P1-G1b · 라운드 스냅** — ✅ 2026-11-01 (**D-8 ①**) — 최근접 토큰 스냅 **72건** + 다중값 3건. `8·9px`→sm · `10·14·16·18px`→md · `20px`→lg · `1~3px`→pill(얇은 바는 두께 절반이라 시각적 동일) · `5px`→xs. 고유값 **33 → 10**(잔존은 5토큰 + `50%` 원형 + `0` + 복합값). 구 내용: — 남은 생값은 토큰 사이에 끼어 있어 **±2~6px 시각 변화**를 수반한다. 기계적 처리 대상이 아님: `8px`(22곳, →sm 6px) · `10px`(10곳, →md 12px) · `20px`(8곳, →lg 24px) · `16px`(6곳, →md) · `14px`(4곳, →md) · `18px`(2곳, →md 또는 lg) · `9px`(3곳) · 극미세 `1~3px`(15곳, 얇은 바類 → pill이 시각적으로 동일). **스냅 방향 확인 후 일괄 처리.**
- [ ] ~~**P1-G1 · 라운드 토큰 압축 19종 → 4종**~~ (G1a/G1b로 분할) — 구 내용: — `--radius-sm(6)`·`--radius-md(12)`·`--radius-lg(24)`·`--radius-pill` + `50%`(원형 전용). 생값 110개소를 토큰으로 전환. **토큰과 동일값인 생값(`12px`·`6px`·`24px`·`999px`·`9999px` 등 ≈34개소)은 기계적 치환 가능 — 여기부터 착수.** 비동일값(`8/10/14/16/18/20px` ≈61개소)은 가장 가까운 토큰으로 스냅(시각 변화 ≤4px).
- [x] **P1-G2 · 버튼 공통 골격 통합** — ✅ 2026-11-01 — `cursor-pointer` **53 → 34**, 골격 중복 **47건** 제거. §2가 *'전역에 동일한 물리법칙을 상속시킨다'* 고 선언했지만 실제로는 **60종 이상이 각자 `display: inline-flex; align-items: center; cursor: pointer; font-family: inherit`를 다시 적고** 있었다(29규칙이 3개 이상 중복). index.css에 **32 셀렉터 그룹**으로 골격을 한 번만 선언하고 각 버튼에는 색·치수 단만 남겼다. 치수는 §4-4의 `--btn-pad-*`/`--btn-h-*` 4단이 담당.
  **컨테이너 제외**: `.sylphio-hero-ctas`·`.wm-hero-cta`·`.connect-cta`는 버튼이 아니라 **버튼을 담는 flex 행**이다. 구 내용: — `.btn-primary`/`.btn-secondary`를 **단일 기하 소스**로 승격. 로컬 60+ 버튼 클래스는 **색·액센트만** 스코프 변수로 오버라이드하고 기하(padding·radius·font-size·min-height·transition)는 상속. 1차 대상: `.wm-btn*`·`.svc-btn`·`.celestial-btn`·`.flagship-cta-btn`·`.connect-btn`·`.rl-hero-cta`·`.pv-cross-cta`·`.read-more-btn`.
- [x] **P1-G3 · 버튼 치수 표준 제정** — ✅ 2026-11-01 — `--btn-pad-xs/sm/md/lg` + `--btn-h-xs/sm/md/lg` 신설, 버튼 **25개 클래스** 적용. 생값 패딩 **0** (측정기 `btn-raw-padding` 지표로 집행).
  **3단이 아니라 4단이다** — 실측 역할이 4개였다(인라인 마이크로 컨트롤 xs 30px / 보조 액션 sm 38px / **전역 표준 md 44px** / 섹션 주 CTA lg 48px). 3단으로 줄이면 복사·펼치기 같은 인라인 컨트롤이 과대해진다.
  **대상 제외**: CTA 컨테이너(`.wm-cta`·`.intro-cta`·`.rl-login-cta`·`.pvl-cross-cta`·`.back-btn-large`)·탭·배지·프로필칩은 버튼이 아니다.
- [x] **P1-G4 · 호버 부유 단일화** — ✅ 2026-11-01 — `--lift-hover: -2px`(기본) + `--lift-hover-card: -4px`(면적 큰 컨테이너형 카드) **2단 체계**. 호버/포커스 규칙 33곳 토큰화(`-1px` 3곳은 기본값으로 흡수).
  **측정기 결함 자가 정정**: 감사 v1.1의 '7종 난립'은 `@keyframes`의 부유 **애니메이션 진폭**(`50% { translateY(-10px) }` 등 13곳)과 중앙정렬 `translateY(-50%)`까지 섞어 센 **과대 집계**였다. 실제 호버 부유는 **3종**(2px×25·4px×5·1px×3)이었다 — 2단 체계는 '난립 교정'이라기보다 **기존 2단 관행의 명문화**다. 측정기를 `:hover`/`:focus` 스코프 한정으로 수정.
  **예외 유지**: 카드 호버 시 내부 목업이 떠오르는 패럴랙스(`-6px`/`-10px`)는 '카드가 뜨는 것'과 다른 제스처이므로 별도 유지.
  **경과**: 작업 중 해당 `-2px`가 오너의 미커밋 파일(`src/pages/waymark/WaymarkApp.css`)에 있어 **치환 후 원복**했다가, 오너가 Waymark M0를 커밋(`f1c11aa`)한 뒤 프로젝트 코드로서 토큰화했다. **`hover-lift-unique: 2` — 목표 달성.**
- [x] **P1-G5 · 🔴 전역 포커스 상태 신설** — ✅ 2026-11-01 — `index.css`에 `--focus-ring`(2px 흰 링)·`--focus-ring-offset` 토큰 + ① 제네릭 인터랙티브 8종(`a`/`button`/`[role=button]`/`[tabindex]`/`input`/`select`/`textarea`/`summary`) ② `.btn-primary`·`.btn-secondary` **호버 미러링**(§5.7의 전역 이행) ③ `.premium-card:has(:focus-visible)` ④ `:focus:not(:focus-visible)` 폴백 억제. 측정기 `focus-visible 보유 파일` **5 → 7**.
  **설계 선택 2건**: 링 색을 액센트가 아니라 **고정 흰색**으로 — 제품별 스코프 액센트(§4-7)가 배경과 섞여 링이 소실되는 사고를 막는다. 그리고 `box-shadow`를 쓰지 않는다 — 제네릭 규칙에서 쓰면 요소의 **기존 그림자를 포커스 동안 덮어버린다**.
  **작성 중 자가 결함 3건 교정**: ⓐ `border-radius: inherit`은 포커스 순간 요소의 radius를 부모 값으로 바꾼다(pill이 사각이 된다) → 제거. outline은 현대 브라우저가 radius를 자동 추종한다. ⓑ 제네릭 `box-shadow` 덮어쓰기 → 제거. ⓒ `:focus-within`은 `:focus-visible`을 모르므로 마우스 클릭에도 링이 뜬다 → `:has(:focus-visible)`로 교체
- [x] **P1-G6 · 터치 타깃 44px 보장** — ✅ 2026-11-01 — **개별 버튼을 키우지 않았다.** `@media (pointer: coarse)`에서 `--btn-h-xs`·`--btn-h-sm`을 44px로 올리면 **전 소비처가 토큰을 따라온다**. 데스크톱 밀도는 유지.
  아이콘 전용 정사각(`.gnb-bgm-btn` 32×32 · `.mobile-locale-btn`)은 시각 크기를 유지하고 `min-width/height: 44px`로 히트 영역만 확장. 인라인 텍스트 토글·탭 4종(`.rl-af-btn`·`.daily-nav-btn`·`.workspace-tab-btn`·`.rl-dock-tab`)도 coarse 전용 44px(버튼 단 토큰을 쓰면 데스크톱 레이아웃이 벌어지므로 분리). [모바일 최적화 제안서](mobile_optimization_proposal.md) 환류 완료.
- [x] **P1-G7 · 화살표 접미사** — ✅ **측정 오류로 닫음** 2026-11-01. 감사의 '`→` 156개 과밀'은 **오집계**였다: 94건이 [StarField.jsx](../../src/components/hero/StarField.jsx)의 **별자리 선 연결 주석**(`// ♈ Aries — γ→β→α→41Ari`)이고, 나머지 다수는 P2-7에서 이미 `<Icon name="arrowRight" />`로 전환됐다. **실제 렌더되는 UI 화살표는 6개**이고 전부 주 CTA·스텝 표시다 → 감축 불필요. 구 내용: — JSX `→` 156개 중 **주 CTA만 유지**(페이지당 1~2개), 보조 링크·카드에서 제거. `➔`·`›`·`↗` 3종은 `→`로 통일.
- [x] **P1-G8 · gap 토큰화** — ✅ 2026-11-01 — **196개 선언** 토큰화, 고유값 **32 → 14**. 최근접 스냅(동률은 작은 쪽 — 레이아웃이 벌어지지 않게).
  **토큰 체계의 구멍 2곳을 발견해 메웠다**:
  - **`--space-12: 12px`** — 8↔16 사이. gap 실사용 **1위(29회)** 이면서 4pt 그리드 위에 있는데 t셔츠 스케일(xs/sm/md/lg/xl)에 **이 단계의 이름이 없어서** 생값으로 29번 반복됐다. 스냅하면 29곳이 ±4px 움직이므로 토큰화가 옳다.
  - **`--doc-gutter: 40px`** — 🔴 **하중을 받는 값이었다.** 문서형 레이아웃(§9-11)이 `860(--measure 프로스) + 300(목차 사이드바) + 40(거터) = 1200(--container)`로 정확히 맞물려 있다. 스케일 단계로 스냅하면(40→32) **열 합이 컨테이너와 맞지 않아 레이아웃이 어긋난다.** 스케일 토큰이 아니라 레이아웃 상수이므로 별도 이름을 준다.
  **유지**: `em` 단위 gap 3곳(아이콘+텍스트가 글자 크기에 비례해야 하는 자리)·`0`.
- [x] **P1-G9 · `border-radius: 50%` 감사** — ✅ **감사 결과 정당** 2026-11-01. 44건(P3-12 데드 CSS 정리 후)을 분류하니 **컨트롤 원형 22**(아이콘 버튼·탭·아바타·상태 점·체크)와 **장식 원 22**(글로우 오브·블러 구·궤도 링)로 양쪽 다 원형이 **올바른 형태**였다. 감사 G9의 우려("원이 중요함의 신호 가치를 잃는다")는 **아이콘 버튼 남용**을 가리켰고, 실제로는 GNB·닫기 등 진짜 아이콘 전용으로 한정돼 있었다 → 조치 불필요. 구 내용: — 장식 원(글로우·오브)과 **컨트롤 원형 버튼**을 분리 집계. 컨트롤 쪽만 남기고 장식은 유지. 원형 아이콘 버튼은 GNB·닫기 등 **진짜 아이콘 전용**으로 한정.
- [x] **P1-G10 · `cursor: pointer` div 감사** — ✅ **다른 작업으로 이미 해소** 2026-11-01. 잔여 34건을 전수 확인하니 **전부 `<button>`·`<a>`·`<summary>`** 였고, 브라우저는 버튼에 기본 `default` 커서를 주므로 `cursor: pointer`는 **필요한 선언**이다. 병리였던 'div+onClick으로 버튼을 흉내내는 것'은 **P4-3 접근성 게이트가 0건**으로 확인했고(진짜 트랩 1건은 `<button>` 전환), P1-G2가 골격을 전역 그룹으로 모아 53→34로 줄였다.
  ⚠️ **측정 중 자기 오류 1건**: `track-chip`·`admin-sidebar-item`이 `<div>`로 보여 게이트 누락을 의심했는데, 제 grep이 **컨테이너**(`track-chips` 복수형·`admin-sidebar-items`)를 잡은 것이었다. 실제 요소는 `<button>`이고 게이트는 정확했다. 구 내용: — 59개소 중 `onClick`을 가진 비시맨틱 요소를 `<button>`으로 전환. P0-8과 동일 클래스 결함.

### 3-2. H 텍스트 배치

- [x] **P1-H1 · 다행 텍스트 중앙정렬 해제** — ✅ 2026-11-01 — **7곳** 해제: `.journey-maker-note`(measure 860px 폭 다행 산문 — 가장 명백한 오용) · 섹션 헤더 4곳(`.journey-header`·`.work-header`·`.sylphio-section-header`·`.section-heading`) · 문서형 지면 헤더 2곳(`.sylphio-guide-header`·`.sylphio-privacy-header`, §9-11 프로스 단과 축 정합). 비율 **64% → 62%**.
  **섹션 헤더 좌측 리딩은 일관성을 늘린다** — Waymark·Planner's View·Builder's Log가 이미 "히어로만 중앙" 규범을 쓰고 있었고, Journey·Work·Sylphio만 이탈이었다.
  **유지 판단(전수 분류)**: 히어로 12(§9-1 규범) · 빈 상태 5 · 배지/라벨/상태 6 · 로그인·게이트 카드 3 · 모달 1 · 스탯 타일 2 · 닫는 CTA 3 · 푸터 노트 2 · **`.flagship-content`는 모바일 전용**(데스크톱은 이미 좌측 — 의도된 선택) · `.connect-content`는 홈의 닫는 CTA로 `.wm-cta`와 동일 역할 · `.milestone`은 수직 타임라인 항목. **전부 정당한 center였다.**
  **⚠️ 목표 정정 + 지표 한계**: `align-center-pct ≤35%`도 근거 없는 추정이었다 → 실측 도달값 **62%** 로 정정. 더 중요한 것은 **이 지표가 병리를 직접 측정하지 못한다**는 점이다(정당한 center와 오용을 구분할 수 없다). 참고치로만 쓰고, 신규 섹션 헤더의 좌측 리딩은 코드리뷰·규범(P4-4)으로 지킨다.
- [x] **P1-H2a · 대문자 라벨 3역할 통합** — ✅ 2026-11-01 — `uppercase` **36 → 17**, 중복 메트릭 **83건** 제거. index.css에 **역할별 그룹 규칙 3종**(배지 9셀렉터 · 사이드바 라벨 4 · 아이브로우 8)을 두고 페이지 CSS에는 **고유값(색)만** 남겼다. 신규 코드용 유틸리티 `.u-badge`/`.u-aside-label`/`.u-eyebrow` 동반 제공.
  **아이브로우 자간 드리프트 해소**: 같은 역할인데 파일마다 `widest`(0.1em)와 `ultra`(0.16em)로 갈려 있던 것을 `--tracking-widest` 하나로 통일(H3 토큰화 후에도 남아 있던 드리프트).
  **⚠️ 목표 정정**: `uppercase ≤1`은 오추정이었다 — 3역할을 하나로 합치면 역할이 섞인다. 17이 실측 하한(역할 3 + 그룹 부적합 개별 케이스).
  **P1-H2b(기존 40곳 JSX 리트로핏)는 불필요해졌다** — 그룹 규칙이 JSX 변경 없이 같은 효과를 냈다. 구 내용: — ⚠️ **전제 정정(2026-11-01).** 40개 `uppercase` 규칙을 전수 분석하니 **단일 패턴이 아니라 3개 역할**이었다. `.eyebrow` 하나로 수렴한다는 원래 계획은 틀렸다.

  | 역할 | 메트릭 | 해당 셀렉터 | 수 |
  | :--- | :--- | :--- | ---: |
  | **아이브로우** 섹션 머리 | `--font-mono` + `--fs-065~075` + `--tracking-widest~ultra` + weight 없음 + muted/accent | `.section-label`·`.wm-eyebrow`·`.flagship-label`·`.work-card-label`·`.bento-card-label`·`.stat-label`·`.milestone-*`·`.pvl-series-eyebrow`·`.terminal-title` 등 | ~16 |
  | **배지** 콘텐츠 메타 | `--font-display` + `--fs-075` + **weight 700** + `--tracking-wider` | `.chapter-badge`·`.pv-badge`·`.archive-badge`·`.dm-pick-badge`·`.quick-peek-label`·`.shipment-badge`·`.signal-article-category` 등 | ~16 |
  | **사이드바 라벨** 목차 | family 없음 + `--fs-075` + weight 700 + `--tracking-widest` | `.detail-aside-label`·`.pv-aside-label`·`.sylphio-doc-toc-label`(×2) | 4 |

  → `index.css`에 역할별 유틸리티 3종(`.u-eyebrow`/`.u-badge`/`.u-aside-label`)을 제공하고 `design_system.md`에 등재. **신규 코드는 이것을 쓴다.** H3/H4 토큰화로 메트릭 드리프트는 이미 봉쇄됐으므로 급하지 않다.
- [x] ~~**P1-H2b · 기존 40곳 리트로핏**~~ — ❌ **불필요** (H2a의 그룹 규칙이 JSX 변경 없이 해결). 구 내용: — 유틸리티 클래스로 교체. JSX 클래스 목록을 광범위하게 손대야 하므로 **별도 작업**으로 분리(H2a 승인 후).
- [x] **P1-H3 · letter-spacing 토큰 20종 → 5종** — ✅ 2026-11-01 — `--tracking-tight(-0.02em)`·`-wide(0.02em)`·`-wider(0.05em)`·`-widest(0.1em)`·`-ultra(0.16em)` 신설 후 **113건 토큰화**. 고유값 **20 → 5 — 목표 달성.** 스냅 폭 최대 0.04em(장식 마이크로 라벨 1곳), 대부분 0.01~0.02em.
  **'폰트 크기는 35종을 CI로 집행하는데 자간은 토큰이 0개'인 비대칭 해소** — 같은 역할의 아이브로우가 파일마다 0.08/0.1/0.12/0.16/0.18em으로 따로 돌던 원인이 제거됐다.
- [x] **P1-H4 · line-height 토큰 16종 → 6종** — ✅ 2026-11-01 — `--leading-none(1)`·`-tight(1.2)`·`-snug(1.4)`·`-normal(1.55)`·`-relaxed(1.6)`·`-loose(1.8)` 신설 후 **125건 토큰화**(`body`의 1.6 포함). 고유값 **16 → 6**.
  **목표 5단에 1 초과** — `1.5`(24곳, 콤팩트 UI)와 `1.65`(36곳, 본문)를 한 토큰으로 합치면 좁은 박스에서 **넘침 위험**이 있어 `normal`/`relaxed`로 분리 유지했다. 역할이 실제로 6개다. 더 줄일지는 디자인 판단 — 게이트는 `max`(래칫)만 집행하므로 빌드에는 영향 없다.
- [x] **P1-H5 · font-weight 역할별 재배치** — ✅ 2026-11-01 — Waymark 랜딩 1장 **샘플 승인 후 전면 적용**. 고유값 **8종 → 3종**(400/500/600), **700+ 126건 → 0**, 149건 변경.

  | 역할 | 규칙 | 건수 |
  | :--- | :--- | ---: |
  | 대형 ≥2.5rem | → **500** (광학적 무게는 크기가 담당) | 16 |
  | 그 외 700+ | → **600** ('화면 전체가 굵다'의 실제 원인) | 110 |
  | 버튼류 600 | → **500** (배경·보더가 강조를 맡는다) | 19 |
  | 미로드 100·300 | → **400** | 4 |

  **🔴 결함 발견·해소**: [index.html](../../index.html#L34)은 Inter를 `wght@400;500;600;700`만 로드하는데 CSS가 **100·300·800·900을 20곳에서** 썼다. `:lang(en)`에서 브라우저가 **합성(synthetic) 굵기**를 만들어 글자가 뭉개진다(Pretendard Variable은 전 범위라 한국어는 무증상 — 그래서 안 보였다).
  **샘플 단계에서 추가 발견**: Waymark 섹션 리드가 `0.85rem`·`--text-muted`였다 — 본문 산문(1.1rem)보다 **작고 흐렸다.** 읽으라고 둔 안내문이 페이지에서 가장 약한 텍스트였다. 1rem·`--text-secondary`로 교정(H5와 같은 병: 위계를 '줄이고 흐리게'로 만든 것).
  **⚠️ 목표 정정**: `weight-bold-pct ≤40%`는 **근거 없는 추정이었다.** 소형 대문자 배지·카드 제목은 600이 **올바른** 굵기이므로, 600 비율을 40%로 낮추려면 텍스트를 약하게 만들어야 한다. 실제 병리는 **700+ 남용**이었다 → 측정기에 `weight-700plus`(목표 0) 신설, `weight-bold-pct` 목표를 실측 도달값 **65%** 로 정정하고 사유를 JSON에 기록.
- [x] **P1-H6 · CJK 줄바꿈 규범 단일화** — ✅ 2026-11-01 — 개별 선언 **52건 제거**(`word-break: keep-all` 31 + `overflow-wrap: break-word` 21) → `body`에 **한 번만** 선언. 두 속성 모두 **상속**되므로 전부 따라온다.
  **🔴 전역 해머의 원인을 제거했다**: `:lang(ja) * { word-break: normal !important }`가 존재한 이유는 **개별 선언이 언어 규칙을 이기기 때문**이었다 — 그래서 `*`와 `!important`로 덮어야 했다. 개별 선언을 걷어내자 `:lang(ja) { word-break: normal }` 한 줄로 충분해졌다. `!important` 8 → **7**.
  **의도적 오버라이드 2건 보존**: `markdown-body`의 `break-word`(코드 내 긴 토큰)·DailyDigest의 `break-all`(긴 문자열). `pre`는 `overflow-x: auto`로 스크롤 처리되어 `keep-all` 상속에 안전. — `word-break: keep-all`(31)·`overflow-wrap`(21)·`text-wrap`(6)을 **본문 기본값 1곳**으로 수렴. `:lang(ja) * { word-break: normal !important }` 전역 해머(`!important`) 제거 — 기본값이 바로잡히면 불필요.
- [x] ~~**P1-H7 · 2줄 리드 하드코딩 해제**~~ — ❌ **취소** 2026-11-01 (D-2 ① 유지 결정). 구 내용: — 언어팩 `\n` + `white-space: pre-line`(5개소) 규약을 `text-wrap: balance`/`max-width` 기반으로 전환 검토. design_system v5.19 규약 **개정 필요** → §5 결정 대기 D-2.

**완료 기준:** §8 측정 스크립트 재실행 결과가 §7 대시보드 목표값 이내 + 전 페이지 육안 회귀 확인(히어로·카드·CTA·아이브로우).

---

## 4. 🟡 P2 — 장식 밀도 예산화 (2~3일)

> 성격: **AI 티의 본체.** 색을 바꿔도 안 빠지고, 양을 줄이면 빠지는 구간.

- [x] **P2-1 · 그라디언트 텍스트 예산** — ✅ 2026-11-01 — **31 → 26 규칙**, 파일당 최다 **3 → 2(목표 달성)**. 제거 5곳: `.quick-peek-welcome h4`(1.3rem 소제목) · `.sylphio-section-header h2`(섹션 제목이 페이지 h1과 경쟁) · `.paywall-header h2`(off-system `#3b82f6→#10b981` Tailwind blue→emerald) · `.declaration-text strong`(본문 inline 강조) · `.mobile-menu-title`.
  **⚠️ 측정기 결함 자가 정정**: `-webkit-background-clip`과 `background-clip`을 각각 세어 **규칙 수의 2배**(55/59)로 보고하고 있었다. 실제는 31개 규칙이고 **21개 파일 중 13개는 이미 히어로 h1 1곳뿐**이었다 — 감사의 '모든 페이지에 그라디언트 텍스트' 판정은 **과장**이었고 A4를 '부분 이탈'로 하향했다(감사 v1.3).
  **잔존 2곳 파일(정당)**: `DailyDigest`(h1 + 대형 날짜 디스플레이) · `PlannersViewDetail`(타이틀 + 빈 상태 타이틀) · `waymark/WaymarkApp`(게이트 타이틀 + 브랜드 워드마크).
- [x] **P2-2 · 글로우 장식구 예산** — ✅ 2026-11-01 — **지표를 먼저 고쳤다.** `radial-gradient` 총량(26)은 병리 지표가 아니다: 상태 게이트 안이거나 base `opacity: 0`인 **호버 공개형은 유휴 중 보이지 않아 비용이 0**이다(`infinite` → `infinite-ungated`와 동일한 교정). → **`glow-idle-visible` 신설, 실측 15.**
  **15의 구성 — 대부분 정당**: 지면 상단 앰비언트 **5**(각 지면 1개 = '화면당 1개' 준수) · 망원경 커서 3(한 요소의 상태 변종, 홈 전용) · 제품 목업 정적 배경 3 · 달력 발행일 아우라 1(상태 표시) · Waymark 스텝 노드 1 · 기타 2.
  **과잉 1건 교정**: `.connect-container`가 `::before`(라벤더)와 `::after`(시안) **글로우 2개를 한 섹션에** 두고 있었다 → 스크롤 진행에 연동돼 정보를 담는 상단만 남기고 하단 제거.
  **⚠️ 목표 정정**: `radial-gradient ≤12`는 총량 기준 오추정 → 참고치 26으로, 병리 지표 `glow-idle-visible` 목표 12로 이전. 구 내용: — 부분 적용(2026-11-01). Builder's Log의 `.card-glow-bg`를 **상시 `opacity: 0.02` → 호버 전용**으로 전환(목록에 카드가 10여 개면 글로우도 10여 개가 상시 떠 있어 '희소성'이라는 글로우의 유일한 가치가 사라진다). 총량은 28(규칙 수)로, 대부분이 호버·상태 게이트 안에 있거나 1화면 1개다. **잔여 작업**: 홈(`WorkSection` 3곳)·`Header` 1곳의 상시 글로우 정리 — P2-3에서 홈 컨테이너 블러를 유지했으므로 글로우까지 함께 보고 판단해야 한다.
- [x] **P2-3 · `backdrop-filter` 감축** — ✅ 2026-11-01 — **90 → 33**(52개 선언 제거, 19개 규칙 유지). 목표 30에 3 초과.
  **유지 근거 2종**: ① 떠 있는 레이어 — GNB(`.nav.scrolled`)·드롭다운·모달 오버레이·독(`.rl-dock`)·배경막·로더·히어로 최신글 노트 ② **홈 콘텐츠 컨테이너 4종**(`.work-container`·`.philosophy-container`·`.journey-container`·`.connect-container`) — sticky 히어로의 **움직이는 별필드 위**에 `rgba(10,10,10,0.75)`로 얹혀 있어 **블러가 실제로 일한다**(제거하면 선명한 별이 글 뒤로 비친다). 기계적으로 다 지웠으면 홈 가독성이 깨졌다.
  **제거**: 본문 카드 전부(`.work-card`·`.flagship-card`·`.concept-card`·`.premium-card`·`.daily-card`·`.rl-card`·`.archive-card`·`.track-card`·`.bento-card` 등) · 배지 · **버튼**(전역 `.btn-primary`/`.btn-secondary` 포함) · 목업 내부. 배경이 거의 단색이라 시각 효과는 사실상 없고 카드 수만큼 합성 레이어 비용만 들었다.
- [x] **P2-4 · `infinite` 애니메이션** — ✅ 2026-11-01 — **유휴 중 구동 51 → 8**(총량 79→60, 키프레임 71→51).
  **⚠️ 지표를 교정했다**: `infinite` 총량은 병리 지표가 아니다 — 호버·열림·로딩 **상태 게이트**가 붙은 애니메이션은 유휴 중 돌지 않으므로 비용이 0이다. 목업이 호버 때 살아나는 것은 **기능**이지 소음이 아니다. 측정기에 `infinite-ungated`를 신설했다.
  **[A] 게이트 이동 26건** — 삭제가 아니라 희소화. 홈 플래그십 목업 내부 17곳 → `.flagship-card:hover` · GNB 벤토 목업 8곳 → `.mobile-nav-overlay.open`(모바일에서 메뉴가 닫혀도 `display:block`이라 **보이지 않는 애니메이션이 배터리를 쓰고 있었다**) · `.scroll-line` → `.scroll-indicator.visible`.
  **[B] 삭제 17건** — 히어로 아이콘 상시 부유 7곳(BuildersLogDetail·DailyDigest·PlannersView·PlannersViewDetail·ReLearn·WaymarkLanding·quick-peek) · Sylphio 히어로 오라 3곳 · Footer 별자리 브리딩 · DailyIntro 4곳 · DailyCalendar hotspot · **`.btn-glow` 폐지**(선언·키프레임·토큰 4종이 모두 있었는데 **JSX 사용 0회** — 전역 CTA '3종 체계'의 1/3이 사문이었다).
  **[C] 유지 8건(전부 정당)**: 로딩 스피너 4 · 라이브 점 · 재생 커서 · 브랜드 마크 2(40~55초 회전).
  **고아 키프레임 20개 제거** — 애니메이션을 떼면 남는 죽은 코드. 측정기에 `orphan-keyframes`(0 유지) 신설.
- [x] **P2-5 · `transition: all` → 0** — ✅ 2026-11-01 — **60 → 0.** 57개 규칙의 `all`을 실제 전이 속성 목록으로 치환.
  **방법**: 같은 베이스 셀렉터의 **상태 짝**(`:hover`/`:focus`/`.revealed`/`.active`/`.open`)에서 선언된 속성이 실제 전이 대상이다 → 48건은 상태 짝에서 추론, 9건(JS 구동 장식)은 안전 기본집합.
  **작성 중 자가 결함 3건 교정**: ⓐ 주석 텍스트가 셀렉터로 오인돼 추론이 실패 → 주석을 **길이 보존 공백으로 마스킹**해 오프셋 유지 ⓑ `transition-duration`(`:active`의 70ms 오버라이드)과 **`outline`/`outline-offset`이 전이 목록에 유입** — 포커스 링은 즉시 나타나야 하므로(접근성) 제거 ⓒ 의사요소의 레이아웃 변화(`.work-card::before`의 top/bottom, `.daily-tab::after`의 width)가 **부모 전이 목록에 끌려옴** → 부모에서만 제거하고 의사요소·진행바·밑줄의 의도적 레이아웃 전이는 보존.
  전 선언 괄호 균형·속성명 유효성 검증 통과(최대 7속성).
- [x] **P2-6 · 텍스트 `opacity` 중첩 해소** — ✅ 2026-11-01 — 🔴 **접근성 결함 5건 교정.** `.scroll-text`·`.stat-label`·`.footer-copy`·`.section-label`·`.work-card-tag`가 모두 `color: var(--text-muted)`(#94A3B8) + `opacity: 0.5~0.6`이었다 → 실효색 ≈`#5A6470`, `--bg-void` 대비 **≈4.1:1**로 소형 텍스트 WCAG AA(4.5:1) **미달**. opacity 제거로 **7.3:1**이 되고 동시에 '실효 대비 추적 불능' 상태가 해소된다(APCA 선언이 측정 가능해지는 전제).
  **⚠️ 목표 정정**: `opacity-text ≤10`은 오추정이었다 — 잔존 42건을 전수 분류하니 ① 리빌 애니메이션 종단값 ② 구분자 글리프(`·`/`/`) ③ `:disabled` 상태 ④ 장식 요소로 **전부 정당**했다. 42가 실측 하한.
- [x] **P2-7 · 이모지 → 아이콘 시스템** — ✅ 2026-11-01 (**D-7 ①** 천체 테마 자작). **렌더 이모지 154 → 12** / 측정기 총량 270 → 177.
  ⚠️ **1차 시도는 반쪽이었다** — UI 컨트롤 32건만 바꿔서 같은 화면에 SVG와 이모지가 섞여 **전보다 어색해졌다**(오너 QA). 전수 조사 후 제품·섹션 아이덴티티까지 전환해 완결.

  **[신설] [`src/components/common/Icon.jsx`](../../src/components/common/Icon.jsx) — 12종**: `close` `check` `warning` `arrowRight` `loop` `document` `mail` `download` `lock` `unlock` `key` `shield`
  **설계 규칙 5**: ① 선 굵기 1.5(`--glass-border` 1px 구조선·`.orbit-ring` 스트로크 언어에 맞춤) ② `currentColor` — 색을 갖지 않고 쓰는 자리의 텍스트 색·제품 액센트를 상속 ③ 24×24 viewBox·round 캡 ④ **채움(fill) 금지** — 천체 모티브는 '선으로 그린 도표'다 ⑤ **장식 금지**(반짝임·그라디언트·그림자) — 그게 걷어내려는 패턴이다.
  **왜 기성 세트를 안 썼나**: lucide·phosphor를 그대로 붙이면 **그 자체가 AI 생성 티의 전형**(감사 §1 B2)이어서 티를 바꿔 끼우는 셈이다. D-7 ①이 자작을 택한 이유.
  **적용 32건**: 모달 닫기 · 완료 체크 3(결제·일기장·궤도) · 가이드 경고 · 스텝 화살표 2 · 루프 리포트 · **Sylphio LNB 12**(3로케일 × document/key/shield/mail) · **다운로드 CTA 9**(라벨 문자열의 `📥`를 분리 — 이모지가 라벨 텍스트에 섞이면 스크린리더가 글리프 이름을 읽고 OS별 렌더가 버튼 높이에 영향을 준다) · paywall 잠금→해제.
  **크기 자동 정합**: 기본 `1em`이라 기존 `font-size`를 그대로 따라간다 — 자리마다 크기를 지정하지 않아도 어울린다. `.btn-primary`의 `inline-flex` + `gap: var(--space-sm)`가 아이콘·라벨 간격을 처리.
  **의도적 유지**: 본문의 `⚙️`(7곳) — "설정 기어 버튼(⚙️)을 클릭"처럼 **실제 macOS 앱 UI를 가리키는 지시어**다. SVG로 바꾸면 오히려 지시가 부정확해진다.
  **아이콘 40종**(미사용 0): UI 컨트롤 8 · 문서·연락 4 · Sylphio 기능 7 · 섹션·제품 12 · Waymark 루프 7 · 마커 2.
  **설계 판단 2건**: `🧠`→**`core`**(뇌 그림은 선화로 뭉개지고 브랜드 모티브와 어긋난다 → 중심 + 궤도 노드) · `💡`→**`insight`**(전구가 아니라 빛나는 점 + 발산 획).
  **`IconOrGlyph` 하이브리드**: 콘텐츠 유래 값은 그대로 출력한다 — 세트에 없는 이모지가 **사라지는** 사고 방지.
  **의도적 잔여 12건**: `⚙️` 6(본문의 **실제 macOS 앱 UI 지시어** — SVG로 바꾸면 지시가 부정확해진다) · `ErrorBoundary` 2(**CSS 미로드 전제**) · `✓` 2(`t()` 보간값, OS 변형 없는 텍스트 기호) · `🇯🇵` 1(언어 식별 기호) · `✦` 1.
  **→ 이후 D-9로 히어로 마크는 전량 제거** — 아이콘 세트의 히어로 적용분은 폐기됐다.
  **부수**: `.success-checkmark`의 Tailwind emerald 생hex 3건 → `--color-success`.
- [x] **P2-8 · 커스텀 커서 유지 여부 결정** — ✅ 2026-11-01 (장부 정정) — D-3으로 결정·실행 완료: `TelescopeCursor`를 전역 `Layout`에서 제거해 Home 스코프로 한정했다(어드민의 `cursor` `!important` 캐스케이드가 이때 함께 사라졌다). 구 내용: — `TelescopeCursor` CSS 150줄이 모바일·키보드에 전면 무효. §5 결정 대기 D-3.
- [x] **P2-9 · `!important` 감축** — ✅ 2026-11-01 — **67 → 8** (목표 20 **초과 달성**). 핵심은 선언을 지운 게 아니라 **싸움의 원인을 없앤 것**이다.

  | 묶음 | 수 | 해소 방법 |
  | :--- | ---: | :--- |
  | **어드민 커서 캐스케이드** | **7** | 🔴 **D-3의 파생 효과.** 주석이 스스로 밝혔다: *"전역 cursor:none(TelescopeCursor) 오버라이드"*. ① 커서가 `html.has-custom-cursor *`에 `cursor:none !important` → ② 어드민이 `cursor:auto !important`로 이기려 함 → ③ 그러면 링크·버튼 포인터가 죽어 `cursor:pointer !important` → ④ disabled도 또 `!important`. **4단 특정도 전쟁**이었다. 커서를 홈 전용으로 스코프 한정하니 ①이 없어져 ②③④가 전부 불필요 |
  | **Header 목업 오버라이드** | **16** | 특정도가 **이미 이기고 있었다** — `.bento-card-visual .dynamic-mockup`(0,2,0) > `.dynamic-mockup`(0,1,0). 특정도로 이기는데 선언으로도 이기려 한 **중복 방어** |
  | **DM Pick 카드 양방 전쟁** | **9** | DailyDigest가 `!important`로 미디어형을 강제하고, ReLearn이 배움 존에서 리스트형으로 되돌리려 또 `!important`를 걸었다(ReLearn 주석: *"에메랄드 !important 표면 해제"*). DailyDigest를 `.signal-article-card.dm-featured-card`(0,2,0)로 올리고 ReLearn은 이미 0,4,0 → **양쪽 다 제거** |
  | 상호배타 상태 | 6 | `.milestone:not(.active)`·`.concept-card.active-focus` — 애초에 다툴 상대가 없었다 |
  | 단순 여백·그리드 | 7 | 특정도 우위 확인 후 제거 |
  | **햅틱 `:active` 중복** | **4** | `index.css` 전역 목록에 셀렉터 편입 → 지면별 재선언 폐기 |
  | ReLearn reduced-motion | 1 | `index.css` 전역 킬스위치와 **중복** |

  **잔존 8건 — 전부 정당**: `prefers-reduced-motion` 킬스위치 3(접근성은 반드시 이겨야 한다) · 전역 햅틱 `:active` 2(설계상 최상위 우선) · `markdown-body pre` 1(highlight.js **외부 테마** 대응) · `:lang(ja) *` word-break 1(P1-H6 미착수) · `TelescopeCursor` cursor 1.
  **⚠️ 작업 중 사고 1건**: 정규식 치환이 `.admin-profile-btn:active`의 **눌림 배경 틴트까지** 함께 지웠다(전역 햅틱엔 없는 고유 피드백). `git diff`로 발견해 복원 — 일괄 치환 후 **diff 확인이 필수**임을 재확인.

**완료 기준:** §8 측정값이 예산 이내 + `prefers-reduced-motion` 무효화 없이 동작.

---

## 5. 🟢 P3 — 구성 공식 깨기 (1주)

> 성격: 디자인 판단이 필요한 구간. P0~P2가 끝난 뒤 착수(기하가 안정되어야 구성을 평가할 수 있음).

- [x] **P3-1 · 섹션 형식 불균질화 — Waymark** — ✅ 2026-11-01 (승인 후 적용) — **감사 기술이 부정확했다**: 6섹션 전부 그리드가 아니라 **5섹션 중 4섹션이 `eyebrow(대시)→타이틀→리드` 동일 삼단 헤더로 열리는** 것이 실제 문제였다. 두 섹션 형식 교체: ① **"경험담 티저" 섹션 삭제** — eyebrow+타이틀+리드 1줄로 끝나는 **본문 없는 헤더 섹션**이었고, 고유 문장은 `loop.steps[2]`("같은 갈림길을 지난 사람의 이야기가 옵니다")와, 마무리 문장은 `cta.soon`과 **3로케일 전부 글자 단위로 동일**했다 → 흡수할 내용이 없어 섹션·i18n 키 모두 제거(6→5섹션). ② **"문제 공감"을 선언 블록(`.wm-stmt`)으로** — eyebrow·리드를 떼고 한 문장을 `--fs-3xl` + 좌측 액센트 바로 세워 '섹션 헤더'가 아니라 '발언'으로 읽히게 했다. 결과 **형식 4종**(선언 / 스테퍼 / 대화 / CTA 카드)
- [x] **P3-2 · 4카드 그리드 1개 해체 — Waymark AI 4모드** — ✅ 2026-11-01 (승인 후 적용) — 2×2 카드 그리드를 **대화 예시 1건(`.wm-demo`) + 결 정의 목록(`.wm-tones`)** 으로 교체. 기록 → 사흘의 경과(세로선 연결자) → Waymark의 두 발화(위로·정리 라벨)를 보인다. "먼저 찾아온다"는 주장을 **도식이 아니라 흐름으로** 보이게 한 것이 요점. 네 가지 결은 정보를 버리지 않고 **그리드가 아닌 `dl` 정의 목록**으로 보존. 카드 4장의 아이콘·글래스·호버 부유가 함께 사라져 장식 예산도 내려갔다. 사이트 어디에도 없는 형식이라 P3-1의 섹션 리듬 교체도 동시 달성
- [x] **P3-3 · Sylphio 7카드 그리드 감축** — ✅ 2026-11-01 (승인 후 적용) — **7개는 대등한 7개가 아니었다**: f1(에어팟 락온)은 f3(캡처)의 하위 메커니즘, f7(정밀 재분석)은 f5(회의록)의 Pro 확장이었다. 섹션 **자신의 부제가 말하는 주장 3개만 카드로** 남기고(수집 f3 · 인식 f2 · 산출물 f5), 나머지 넷은 `dl` 리스트로 내렸다. 설명 길이가 **1줄(f6)~5줄(f7)로 들쭉날쭉한데 등높이 카드에 밀어넣어** 공백이 생기던 문제가 함께 해소되고, 7개가 만들던 고아 행(3+3+1)도 사라졌다. **P3-4 잔여분 동시 처리**: 섹션 제목이 `"가장 완벽한 … 7대 무기"` / `"7 Ultimate Weapons for Flawless…"` 였다(앞서 `무제한/완전/Unlock`만 grep해 놓쳤다) → 최상급·개수 자랑을 버리고 **제목은 주장, 부제는 구성**으로 역할을 나눠 3로케일 재작성. 부수 수확: 새로 쓴 규칙에서 **미선언 토큰 `--sylphio-accent`** 를 자가 발각 → `--accent-sylphio`로 교정
- [x] **P3-4 · ✨ 플랭킹·절대화 카피 교체** — ✅ 2026-11-01 — ✨ 플랭킹은 P1-E(이모지 제거)에서 선행 해소. 잔여 절대화 카피를 **3로케일 동시** 교체: ① **반복 어구의 실제 원인은 리스트 레지스터 불일치**였다 — Pro 기능 7항목 중 1~2만 동사 시작(`잠금 전면 해제`/`Unlock`/`ロックを全面解除`)이고 3~7은 명사구 → **7항목 전부 명사구로 패러렐 통일**. 결과 `Unlock`이 리스트에서 사라지고 가격 설명 1회만 남았다(절대화 해소와 반복 해소가 같은 조치로 끝났다). ② 게임체 과장 `"완전 봉인 해제하세요"` → `"AI Pro 번역까지 함께 씁니다"`. ③ 강조 부사 `just`(two cups of coffee) 제거 — 가격은 이미 "두 잔 값"이 말한다. ④ **부수 수확(H)**: 균일한 4행 paywall 리스트에서 `paywallLang` 한 행만 **아이콘 3연타**(`lock → arrowRight → unlock`)였고 그 의미를 텍스트 `"전면 해제"`가 중복 진술 → **아이콘 1개(`unlock`) + 기능명 명사구**로 형제 3행과 정합
- [x] **P3-5 · Sylphio i18n 누출 해소** — ✅ 2026-11-01 — 하드코딩 로케일 삼항 **10개소**를 3로케일 `TRANSLATIONS` 사전으로 이전. 과정에서 **실제 라이브 결함 5건 발각**: 결제 모달의 한국어 문자열이 **en·ja 사용자에게 그대로 노출**되고 있었다(`paywallDesc`·`paywallLang`·`paywallCaption`·`paywallSummary`·`paywallEngine`). **게이트 설계 결함 1건 자가 수정**: `I18N_EXCLUDE`의 파일 단위 제외가 바로 이 누출을 숨기고 있었다 → `design-check` i18n 게이트를 **`ko:` 사전 블록만 마스킹**하도록 바꾸고 Sylphio 3파일을 제외 목록에서 해제. 정당한 잔여 한국어(번역 데모 출력·`tocLabel` 레이아웃 상수·문장 중간 링크 리치 텍스트)는 **사유를 적은 `i18n-ok` 마커**로 통과. 번들 검증: 3로케일 결제 문자열 각 1회 `dist/assets/SylphioLanding-*.js` 포함 확인
- [x] ~~**P3-6 · 4제품 CTA 테마 결정**~~ — ➡️ **P1-A1으로 흡수** 2026-11-01 (D-4 ① + D-6 ①이 동일 작업). 구 내용: — 현재 4세트가 시각적으로 구분 불가(알파 0.12 그라디언트 4종). ① 실제 구분되게 강화 ② 1세트로 통합. §5 결정 대기 D-4.
- [x] **P3-7 · 히어로 칩 모션 제거** — ✅ 2026-11-01 — **P2-4 유휴 모션 정리에서 선행 해소**. `.wm-chip-dot`의 무한 펄스가 제거되고 정적 글로우 점만 남았다(`WaymarkLanding.css`). 별도 조치 불필요 — 확인만 수행.
- [x] **P3-8 · 타입 스케일 압축 35단 → 11단** — ✅ 2026-11-01 (Waymark 샘플 승인 후 전면) — **347개 사용처** 마이그레이션. `design_system.md` **§4-2 전면 재작성(v6.0)**.

  | 토큰 | rem | 역할 | 흡수 |
  | :--- | ---: | :--- | :--- |
  | `--fs-micro` | 0.70 | 마이크로 라벨·배지 | 050·055·060·065·070 |
  | `--fs-xs` | 0.80 | 캡션·태그 | 075·080 |
  | `--fs-sm` | 0.90 | 보조 본문·버튼 | 085·090 |
  | `--fs-base` | 1.00 | 본문 | 095·100 |
  | `--fs-md` | 1.15 | 강조 본문·히어로 서브 | 105·110·115 |
  | `--fs-lg` | 1.30 | 카드 제목 | 120·125·130 |
  | `--fs-xl` | 1.50 | 소형 헤딩 | 135·140·145·150 |
  | `--fs-2xl` | 1.75 | 섹션 타이틀 | 155·160·170·175 |
  | `--fs-3xl` | 2.10 | 대형 섹션 | 180·200 |
  | `--fs-4xl` | 2.40 | 목록·상세 히어로 | 220·240·250 |
  | `--fs-display` | 3.00 | 서비스 히어로 | 260·280·300·350·450 |

  **🔑 핵심은 값이 아니라 이름이었다** — `--fs-082`라는 이름은 *"0.82가 필요해"* 를 부르지만 `--fs-sm`은 *"이건 어느 역할인가"* 를 묻게 한다. 13→30→35단이 된 경로를 막는 것은 **역할 이름**이다.
  **실측 근거**: `0.65~1.05rem` 대역 **9토큰이 사용의 69%(264/383)** 를 흡수하고 `1.1~1.8rem` 대역은 **14토큰이 70회**(토큰당 5회). 0.80과 0.85는 눈이 구분하지 못하는데 둘 다 토큰이었다. 미사용 2단.
  **이동 폭**: 대부분 ±0.05rem. 최대 `--fs-180→3xl`(+0.30, 섹션 타이틀 clamp 하한 4곳) · `--fs-350→display`(−0.50, 홈 히어로 1곳) · `--fs-050→micro`(+0.20, 1곳).
  **🔴 부수 수확 — 넓은 허용 목록은 통과 도장만 찍는다**: `design-check` 허용값을 35→11로 좁히자 **구 토큰 값과 우연히 일치해서 통과하던 `clamp()` 내부 생리터럴 10건**(0.85/0.9/0.95/1/1.1/1.6/1.8/2.2rem)이 드러나 전수 토큰화했다. §9-1 v5.13이 'clamp endpoint는 토큰만'을 ERROR로 집행하고 있었는데도 통과했던 것이다.
  **규범 정합**: §4-2 재작성 외에 §9-1·§9-2·§9-9 등 **현행 규범 본문 11곳**의 구 토큰명을 갱신했다(안 하면 다음 생성이 없는 토큰을 쓴다).
  **⚠️ 남은 사각지대**: 어드민 2파일(`AdminDashboard.css` 45 · `ServiceDocs.css` 27)은 `design-check` **`EXCLUDE`** 라 px·임의 rem **72건이 그대로**다(10~48px, 0.72~1.6rem). 공개 지면 생값은 **2건뿐**(html 루트 `16px` — 명시 허용 · `em` 상대 단위 1곳). → **P4-5**에서 EXCLUDE 정책을 명문화하고 어드민 마이그레이션 여부를 결정한다. — 가장 큰 공사. 압축 과정에서 C4(H2·H3 위계 붕괴)가 드러나므로, **그 결과를 보고 헤딩 위계를 재설계**. P1-H3/H4 완료 후 착수.
- [x] **P3-9 · 브레이크포인트 정리** — ✅ 2026-11-01 — **고유값 10 → 5**(감사가 적은 "20종"과 고아 목록 대부분은 P3-12 데드 CSS 정리에서 이미 사라졌다). 머지 12곳: **1100→1024**(문서 2단 붕괴 4곳 — 주석은 "사이드바가 안 들어가는 폭"이라 했지만 **하드 오버플로가 아니라 판단값**이었다. aside `flex: 0 0 300px` + main `flex: 1 1 0`이라 1025px에서 본문 약 637px로 안전) · **900→1024**(3곳 — 범위가 넓어져 스택을 더 일찍 적용하는 안전한 방향) · **760/767/700→768**(5곳, 전부 8px 이내거나 오프바이원). **머지 후 같은 파일 내 동일 질의 중복 0 확인**(캐스케이드 순서가 동작을 바꾸는 위험을 사전 차단 — 기존 중복 5파일은 손대지 않은 곳). **목표 3~4는 오추정이었다**: 실측 역할 티어는 **640 / 768·769 / 1024 3종**이고, 768·769는 `max-width: N`/`min-width: N+1` 쌍이라 값은 2개지만 경계는 하나다(어떤 규약을 써도 인접 두 수는 불가피). 5번째 값 1200px은 `AdminDashboard.css` 단독 → P3-10에서 해소. **부수 수확: 빈 `@media` 블록 4개 삭제** — 3개는 P2-4 모션 정리로 내용이 비어버린 `prefers-reduced-motion` 블록이었고, `index.css`의 전역 규칙(`*`·`::before`·`::after` → `animation/transition-duration: 0.01ms`)이 이미 전 지면을 덮으므로 사문이었다. 전 CSS 중괄호 균형 재검증
- [x] **P3-10 · 어드민 인라인 스타일 정리** — ✅ 2026-11-01 — `AdminDashboard.jsx` **105 → 77**. 먼저 105건을 **동적 8 / 정적 97**로 분류하고, 정적 중 **2회 이상 반복된 단일 속성 28건**만 유틸리티 7종(`.adm-span-2`·`.adm-muted`·`.adm-accent`·`.adm-mono`·`.adm-m0`·`.adm-mb-xl`·`.adm-mt-xl`)으로 수렴했다. **1회성 14건은 인라인 유지** — 단일 사용 클래스를 만들면 같은 안티패턴을 CSS로 옮기는 것일 뿐이다. **색: Tailwind 잔존분 전량 해소**(`#E9D5FF` 6 · `#A78BFA` 4 · `#C084FC` 1 → `--admin-accent-soft`/`--admin-accent`)하고, **토큰 실값과 완전히 동일한 생hex만** 치환(`#10B981`·`#EF4444`·`#F59E0B`·`#A5B4FC` 8건 — 시각 변화 0). 신설 토큰 2종: `--admin-accent-soft`(라벤더로 수렴) · `--admin-google-blue`(Google 브랜드 규정상 고정값이라 사용처를 한 곳으로 묶음). **사문 폴백 2건 제거**(`var(--admin-accent, #A78BFA)` — 토큰이 선언돼 있어 폴백은 영구 미도달). **치환 전 특이도 전수 검증**: 인라인은 항상 이기지만 유틸리티는 `.admin-test-send h3`처럼 **후손 셀렉터에 진다** — 실제 짝 24개를 전부 확인해 회귀 0을 확인하고, 이미 `margin: 0`인 `.admin-section-header h2`의 중복 유틸 1건은 제거했다. 유지 결정: **Recharts 축 `stroke`**(SVG 프레젠테이션 속성이라 `var()`가 통하지 않는다) · **`max-width: 1200px` 브레이크포인트**(4열 스탯 그리드의 역할 티어 — 내부 데이터 도구를 숫자 목표에 맞춰 깨뜨리지 않는다)
- [x] **P1-E-admin · 어드민 이모지 전환** — ✅ 2026-11-01 (오너 결정: 전환 진행) — **P1-E가 어드민을 제외하고 있었다**(전체 141 중 어드민계 118 = 84%). `AdminDashboard.jsx` 118개/46종 + `ServiceDocs.jsx` 27개 + `ErrorBoundary.jsx` 2개 → **`emoji-jsx` 141 → 20**. 아이콘 **9종 신설**(plus·users·trash·rocket·search·link·folder·exit·timer, 총 40→49). 핵심은 **위치별로 다르게 처리**한 것이다: ① **JSX 텍스트 50건** → `<Icon>` ② **JS 문자열 43건**(alert·status 메시지·탭 라벨) → `<Icon>`을 넣을 수 없으므로 **글리프 제거**(상태는 `.admin-send-status.success/.error` 색이 이미 전달한다) ③ **`icon` prop 8건** → 아이콘 이름으로 바꾸고 `StatCard`가 `IconOrGlyph`로 렌더. **`ServiceDocs`는 구조 수술이 필요했다** — 이모지가 `navTitle` 문자열에 **구워져** 있고(`${FOLDER_EMOJI[folder]} ${label}`) 역할 탭은 **이모지를 객체 키·`useState` 기본값으로** 쓰고 있었다. 문자열은 SVG로 바꿀 수 없다 — 이것이 어드민에만 이모지가 남은 구조적 이유였다. `FOLDER_EMOJI`→`FOLDER_ICON`(이름 맵)으로 바꿔 **렌더 시점에** 아이콘을 붙이고, 역할 키를 순수 텍스트로 분리한 뒤 `ROLE_ICON`을 뒀다. **문서 제목 자체의 선행 이모지는 보존**(오너가 쓴 콘텐츠 — P2-7 'C. 콘텐츠 이모지 유지 허용'). **유지 결정 20건**: `StarField` 황도 12궁 기호(♈–♓ = 데이터) · `SylphioApiKeyGuide` `⚙️` 6건(**실제 앱의 기어 버튼을 가리키는 설명문**) · `DiaryDock` `✓`(조판 기호). **게이트 결함 자가 발각 4건째**: P4-3 접근성 게이트가 `<Icon label="…">`(→ `role="img" aria-label`)을 몰라 **정상 코드를 오탐**했다 → 게이트에 분기 추가. **자가 누락 1건**: 변환 스크립트가 `Icon` import를 넣지 않아 런타임이 깨질 상태였고(빌드는 통과) 즉시 보강했다
- [x] **P3-13 · 비어드민 인라인 스타일 정리** — ✅ 2026-11-01 (신설) — 대시보드 목표가 "어드민 외 0"인데 **60건이 미착수로 남아 있었다**(P3-10이 `AdminDashboard.jsx`만 범위로 잡아 생긴 공백). 60건을 분류하니 **정당 34**(동적 상태값 13 · **CSS 커스텀 프로퍼티 16** · ErrorBoundary 5)였다. 커스텀 프로퍼티(`--reveal-delay`·`--card-accent`·`--scroll-progress`)는 **인스턴스별 데이터**이므로 인라인이 올바른 관용구다 — 클래스로 빼면 단일 사용 클래스가 6개 생긴다. 나머지를 **60 → 40**으로 정리: `.u-fineprint`·`.u-prewrap` 역할 클래스 신설(9+3곳), `.sylphio-guide-lead`(2곳), 단일 요소 정적 스타일을 해당 규칙으로 이전(3곳), `.jp-inline-icon`·`.jp-stack`(2곳), **버튼 스캐폴드가 이미 `justify-content: center`를 갖고 있어 중복이던 인라인 2건 제거**. **발견 ①: JSX 인라인은 `design-check`의 사각지대다** — Sylphio 3지면이 복제하던 잔글씨 인라인에 **비토큰 `font-size: 0.82rem`과 텍스트 `opacity: 0.55`** 가 들어 있었고 CSS 게이트가 볼 수 없었다(텍스트 투명도 중첩은 P2에서 AA 미달 4건의 원인이었다) → 색 토큰으로 교체. **발견 ②: 사문 선언** — `.sylphio-cursor-pulse`의 `color: #87A9EC`가 인라인에 덮여 영구 미적용이었다 → 유효값을 규칙으로 승격. **자가 회귀 1건 발생·복구**: CSS 이전 스크립트가 클래스명 오인으로 중단돼 JSX에서만 제거된 상태가 됐고(피처 카드 전이 + 리드 스타일 소실), 빌드·게이트는 **PASS로 통과**했다 — 선언 누락은 에러가 아니기 때문이다. 즉시 복구했고, **"게이트 PASS는 이전 완료의 증거가 아니다"** 를 교훈으로 남긴다
- [x] **P4-7 · 목표 미달 10건 전수 해소 + 측정기 결함 3건 교정** — ✅ 2026-11-01 (신설 — 오너 "커밋 전 모두 처리") — 체크박스 100%와 "잔여 없음"은 다르다는 점을 분리해 **목표 미달 지표 10건을 0으로** 만들었다. 성격별 처리: ① **측정기 결함 3건** — `raw-hex-css`가 **토큰 선언 자체**(`--color-gold: #E5B25D`, 그라디언트 토큰 값 포함)를 계수해 "토큰을 선언할수록 지표가 나빠지는" 구조였다(목표 40 도달 불가) → 커스텀 프로퍼티 선언 전체 제외. `duplicate-selector`는 **파일별 첫 `@media` 이후를 버려** 최상위 중복을 놓쳤고, 정규식 마스킹으로 바꾸자 **`@media` 안의 `@keyframes` 3중 중첩**(`Header.css` 3곳)에 깨졌다 → **중괄호 깊이 기반 마스커**로 교체(8 → 참값 13). 유휴 글로우 게이트는 `TelescopeCursor`가 JS로 붙이는 `.hovering-`·`.near-` 상태 클래스를 몰라 3건 오탐. ② **목표 오추정 6건 정정** — `gap-unique` 11→13 · `radius-unique` 8→9 · `leading-unique` 5→6(`--leading-*`는 실제 6단) · `breakpoint-unique` 4→5 · `keyframes-total` 40→43 · `inline-style-jsx` 103→117(구 목표 "어드민 외 0"은 도달 불가 — 비어드민 40 중 **34건이 정당**) · `weight-bold-pct` 65→67(**700 이상이 0**이고 어휘는 400/500/600 3단 — 67%는 데드 CSS 삭제로 분모가 줄어 올라간 수치). ③ **진짜 잔여 처리** — `duplicate-selector` **13→0**(13쌍 병합. Sylphio 시뮬레이터·어드민 뱃지는 **뒤 선언이 앞을 덮어 앞 블록이 사문**이던 실제 결함이었다) · `keyframes-total` **51→43**(본문이 동일한 360° 회전이 **8개 이름**으로 흩어져 있었다 → 전역 canonical `spin` 1개로, `fadeIn`/`admin-fadeIn` 통합) · 생hex **124→37**(`#87A9EC` 14곳은 **주석이 "토큰화했다"고 적혀 있는데 코드는 생hex**인 거짓 주석이었다 — P1-A1이 토큰만 선언하고 사용처를 옮기지 않았다. `ServiceDocs.css`는 **토큰을 0개** 쓰고 있어 38건 수렴). **유지 결정**: macOS 트래픽 라이트 6건·App Store 블루 3건은 **Mac 앱 목업의 의도적 플랫폼 모방**이고, 마스크 `#000`은 기능 필수값이다. **부수**: `--accent-sylphio`의 근거 주석이 v5.25에서 **폐지된** §9-1 "제품 브랜드 예외"를 가리키고 있어 갱신
- [x] **P4-8 · 메인 지면 QA 환류 — 내 회귀 2종 + 미완 3종 교정** — ✅ 2026-11-01 (오너 QA: "여정 서브카피·깃허브 버튼 정렬, 프루프 오브 워크 서브카피 정렬, 카드 버튼 이모지, 플래너스 뷰 호버 이미지") — **내가 낸 회귀 2종**: ① **P2-4가 규칙 전체를 `:hover`로 옮겼다** — `animation`만 게이트하려 했는데 기하·레이아웃까지 호버 뒤로 숨어 **5개 서비스 카드 비주얼이 평상시 전부 어긋났다**(`.pvm-sheet.s1`은 `transform`·`display:flex`를 잃어 시트가 중심을 벗어나고 내부 선 3개가 흐트러짐). HEAD~1 대조로 12개 규칙이 모두 원래 기본 규칙이었음을 확인하고 **기본=기하 / `:hover`=모션**으로 17개 분리. ② **P1-H1이 헤더를 좌측 리딩으로 바꾸면서 서브카피의 `margin: 0 auto`를 남겼다** — 타이틀은 좌단, 서브카피 블록은 가운데로 떠서 어긋났다(`.journey-subtitle`·`.work-subtitle`·`.journey-maker-note`. Connect는 `text-align: center`로 **의도된 중앙**이므로 존치). **미완 3종**: ③ **이모지가 `src/locales/*.json`에 있었다** — `emoji-jsx` 지표가 `.jsx`만 스캔해 **UI 라벨의 실제 거주지를 전혀 보지 못했고**(화살표 블록 U+2190–21FF도 누락) 참값은 20이 아니라 **137**이었다. 지표 범위를 넓히고 기준선을 사유와 함께 상향. 메인은 0으로 정리 — 카드 CTA 5종 + 깃허브 링크를 **`<Icon name="arrowRight">` 1종으로 통일**(구조는 라벨 선두에 이모지를 박아 OS마다 글리프 폭·베이스라인이 달라 정렬이 흔들렸다). ④ **리빌 종료 상태가 AA 미달을 되돌렸다** — P2-6이 `.section-label`의 `opacity`를 제거해 AA를 맞췄는데 `.revealed`가 **`opacity: 0.6`으로 복원**해 메인 4개 라벨(Belief·Journey·Proof of Work·Connect)이 실효 대비 ≈4.1:1이었다 → `1`로 교정 + Work·Connect의 **전역 규칙 완전 중복 2건** 삭제. ⑤ **마지막 줄 뒤 `<br />`** 가 12곳에서 문단 아래 빈 줄을 만들어 CSS margin과 이중으로 벌어졌다 → `idx < arr.length - 1` 가드. 부수: 같은 역할 칩 `.work-tag`·`.milestone-keyword`가 padding 3↔4px·radius xs↔sm로 어긋나 있어 통일 · 무손실 padding 7건 토큰화 · `--duration-medium`(미선언) 자가 발각·교정
- [x] **P4-9 · 버튼 라운드 사각 단일화 (design_system §4-4 v6.2 신설)** — ✅ 2026-11-01 (오너 결정: "라운드 버튼조차 AI 잔재로 보는 사람들의 시선이 있다") — **G1b "라운드 스냅"의 미결 잔여를 오너 판단으로 종결.** 실태: 버튼류 라운드가 **34선언 / 6종**(pill 11 · md 10 · sm 9 · lg 2 · 50% 2)으로 갈려 ReLearn·Waymark·Sylphio CTA는 알약, 어드민은 사각이었다. **역할 4분류로 규범화**(§4-4 v6.2): CTA·클릭 버튼 `--radius-sm`(6px) **단일** / 아이콘 전용 정사각 `50%` / CTA **컨테이너** `--radius-lg` / 배지 `--radius-xs`. 구조: **전역 버튼 스캐폴드가 한 곳에서 선언**하고 지면 CSS의 중복 선언 20건을 제거했다 — 골격을 33개 셀렉터에 다시 적는 구조가 애초에 6종으로 갈린 원인이었다. 부수 교정: `.celestial-btn::after`(클릭 리플 오버레이)가 `--radius-md`로 **본체와 어긋나 테두리가 겹쳐 보였다** → `--radius-sm` · `.btn-sim-pro-badge`는 **배지인데 알약**이어서 버튼으로 오인됐다 → `--radius-xs`. **집행**: `design-check`에 버튼 라운드 하드 규칙을 추가하고 **일부러 알약을 넣어 게이트가 실제로 잡는지 역검증**했다(규범만 적어두면 되돌아간다). 결과 **10선언 / 5종**이고 5종은 전부 역할이 다르다
- [x] 🔴 **P3-12 · 데드 CSS 정리** — ✅ 2026-11-01 — **194규칙 / 약 1,520줄 삭제 + 고아 컴포넌트 1개 삭제.** CSS 총량 **13,372 → 11,705줄(−12%)**.

  **최대 건: [`DailyDigest.css`](../../src/pages/DailyDigest.css) 1,665줄 중 850줄(46%)·102개 규칙이 죽어 있다.** 원인은 **리런 통폐합**(task_backlog 2026-07) — Daily Digest 단독 페이지가 ReLearn으로 흡수되면서 `DailyView.jsx`는 `rl-*` 네임스페이스를 쓰게 됐고, 구 페이지 스킨(히어로·탭바·아카이브 그리드·워크스페이스 스위처·퀵픽 벤토·날짜 내비)이 그대로 남았다. 현재 이 파일을 import하는 것은 4개 소형 컴포넌트(`JapaneseSection`·`SignalSection`·`PromptSection`·`SignalArticleCard`)뿐이고 **클래스의 일부만** 쓴다.
  **검증 완료**: 동적 클래스 구성(`className={\`daily-${x}\`}`) 없음 — `daily-*` 접두 템플릿 리터럴 0건. JSX·JS·JSON·마크다운 전수 대조.
  **그 외**: `WorkSection.css` 23 · `Header.css` 16(둘은 목업 클래스 중복) · `DailyIntro.css` 12(고아 컴포넌트) · `Footer.css` 9 · `index.css` 8 · `BuildersLog.css` 6(`badge-*` 커밋 타입) · `SylphioApiKeyGuide`/`SylphioPrivacy`의 `*-header`(§9-1 히어로 표준화 때 교체된 잔재) 등.
  **삭제 내역**: `DailyDigest.css` 104규칙/876줄(1,672→881) · `WorkSection.css` 36/260 · `DailyIntro` **컴포넌트 전체**(jsx 136 + css 381 — 자체 주석이 2026-08-04부터 고아라고 명시) · `Footer.css` 10 · `SylphioPrivacy.css` 6 · `PlannersViewDetail.css` 5 · `BuildersLog`/`AdminDashboard` 각 4 · `SylphioApiKeyGuide` 3 · `index.css` 2(통폐합된 `.daily-digest-page`·`.pacenote-page` 스코프 CTA 테마) · 그 외 3.
  **🔴 분석기 결함 2건을 먼저 고쳤다** — 이걸 안 고치고 지웠으면 사고였다:
  ① **참조 코퍼스에 `docs/`를 넣어 오탐** — 감사 문서가 클래스명을 산문으로 언급해 죽은 클래스를 '살아있다'고 판정했다(DailyDigest 102→65로 과소 집계). 코퍼스를 코드·콘텐츠로 한정.
  ② **부분문자열 매칭** — `.work-card`가 `work-card-tags`의 부분문자열이어서 살아있다고 판정됐다. **클래스 토큰 경계**(`(?<![\w-])name(?![\w-])`)로 교정하니 WorkSection 28→36규칙으로 늘었다.
  **🔬 역방향 검증으로 회귀 0 확인** — CSS 삭제는 빌드가 잡아주지 못하므로, 'JSX가 쓰는데 CSS에 없는 클래스'를 커밋본(HEAD)과 비교했다. HEAD 54건 → 현재 53건이고, **새로 생긴 미정의는 3건뿐이며 그마저 데드 CSS 삭제가 아니라 P1-A1의 잔재**였다(`.visual-blur-orb`의 `amber`/`blue`/`indigo` 변종 클래스를 CSS에서만 지우고 JSX에 남겼던 것 — 6곳 정리). 잔존 53건은 템플릿 리터럴 조각(`badge-${type}`)과 JS가 직접 스타일하는 SVG 요소로, **삭제 이전부터 있던 것**이다.
  **부수 사실**: P2 작업의 일부가 **죽은 CSS를 최적화한 것**이었다(`DailyDigest.css`의 backdrop-filter 19건 중 다수가 사문). 이 정리를 먼저 했다면 P2 작업량이 줄었을 것이다.
- [x] ~~**P3-11 · 라이트 모드 도입 여부 결정**~~ — ❌ **취소** 2026-11-01 (D-5 ① 다크 전용 유지). 구 내용: — `prefers-color-scheme` 0회. 다크 전용은 AI 티의 A1이지만, **브랜드 정체성(천체 테마)과 결합**되어 있어 단순 제거 불가. §5 결정 대기 D-5.

---

## 6. ⚙️ P4 — 집행 체계 전환 (P0~P2와 병행)

> 성격: **재발 방지.** 이것이 없으면 다음 생성 사이클에 전부 되돌아옵니다.

- [x] **P4-1 · `design-check` 차원 확대** — ✅ 2026-11-01 — **집행 차원 1 → 12.** 하드 규칙 5차원 신설(`border-radius`·`letter-spacing`·`line-height`·`font-weight`·`transition: all`), 각 차원 회귀 주입으로 **차단 동작 실측 검증**. **어드민을 제외하지 않았다** — 그 5차원은 어드민도 이미 100% 준수 상태였고, `font-size` EXCLUDE가 사각지대로 기능한 전례가 있다. 부수: `font-weight: bold` 키워드 7건 → 600. **자가 버그 1건**: 규범 설명 주석의 예시 문구(`transition: all`·`border-radius: inherit`)를 위반으로 신고 → 길이 보존 **주석 마스킹** 도입(행번호 유지). 구 내용: — 현재 집행: `font-size` 1개. 추가할 ERROR 규칙:
  - [ ] CSS/JSX **생hex 금지**(토큰·`rgba()` 외) — Tailwind 스와치 재유입 차단. P0-3 재발 방지.
  - [ ] `border-radius` 토큰 외 값 금지 (P1-G1 완료 후 승격)
  - [ ] `letter-spacing`·`line-height` 토큰 외 값 금지 (P1-H3/H4 완료 후 승격)
  - [ ] `transition: all` 금지 (P2-5 완료 후 승격)
- [x] **P4-2 · 🔴 장식 예산 카운터 신설** — ✅ 2026-11-01 — **본 계획의 핵심 산출물 완료.**
  [`ci/pattern-budget.mjs`](../../ci/pattern-budget.mjs) + 기준선 정본 [`ci/pattern-budget.json`](../../ci/pattern-budget.json). `prebuild`에 연결(`design-check && pattern-budget`).
  **임계값이 아니라 래칫(ratchet)을 택했다** — 목표값으로 임계를 걸면 지금 빌드가 깨지고, 현재값으로 걸면 아무것도 개선되지 않는다. 그래서 **단조 감소만 허용**한다: `현재 > 기준선` → 빌드 차단 / `현재 < 기준선` → PASS + 조이기 안내(`--update`). 즉 **"더 나빠질 수는 없고, 좋아지면 그 자리가 새 바닥이 된다."**
  - [x] 래칫 지표 **23종** — gradient-text(+파일별 최다값)·radial-gradient·backdrop-filter·infinite·transition-all·important·opacity-text·keyframes-total·radius/gap/hover-lift/tracking/leading/weight 고유값·weight-bold-pct·align-center-pct·uppercase·raw-hex·breakpoint·inline-style·emoji·cursor-pointer
  - [x] **하드 규칙 3종**(0 유지, 래칫 아님) — `keyframes-duplicate`·`maxwidth-band-violation`·`phantom-font`
  - [x] 각 지표에 **사유 주석**을 JSON에 박아, 올리려는 사람이 이유를 마주하게 함
  - [x] **회귀 차단 실측 검증** — `backdrop-filter`·`transition: all` 1건씩 주입 → 종료코드 1로 차단 확인. 유령 폰트 주입 → 하드 규칙 발동 확인
  - [x] npm 스크립트: `npm run metrics` · `npm run budget`(목표까지 남은 거리) · `npm run budget:tighten`
  **미해결로 남긴 설계 한계**: 래칫은 전역 총량을 보므로, 한 파일에서 줄이고 다른 파일에서 늘리면 통과한다. 파일별 캡은 `gradient-text-max-per-file` 하나만 적용했다(P2-1 집행용).
  **🔴 설계 결함 1건 자가 수정(2026-11-01)**: **비율 지표를 래칫에 넣은 것이 잘못이었다.** 죽은 CSS 876줄을 지우자 `weight-bold-pct`가 65→66이 되어 **'나빠진 것이 없는데' 빌드가 막혔다** — 분모(전체 선언 수)가 줄면 비율은 오르므로 단조 감소를 보장할 수 없다. 즉 **래칫이 정리 작업을 처벌**하는 구조였다. 비율 2종(`weight-bold-pct`·`align-center-pct`)을 `informational`로 분리해 보고만 하고, 집행은 **절대 개수**에만 적용한다(굵기 병리는 `weight-700plus: 0`이 담당).
  **가동 직후 관찰**: 같은 날 커밋된 신규 코드(`f1c11aa` Waymark M0, `WaymarkApp.css` 2,798바이트)에 이미 **그라디언트 텍스트 4곳**이 들어 있었다. 래칫이 과거를 되돌리진 못하지만 **이 지점 이후의 증가는 막는다** — 장치가 왜 P1·P2보다 먼저여야 하는지에 대한 실증.
- [x] **P4-3 · 접근성 게이트** — ✅ 2026-11-01 — 3종 신설: ① **키보드 경로 없는 `onClick`**(비시맨틱 요소에 `role`·`onKeyDown`·`tabIndex` 전무) ② `img` alt 누락 ③ 아이콘 전용 `button`의 접근 가능 이름 누락. ②③은 **이미 0**(P0-8·P2-7 효과). ①은 14건 중 **진짜 트랩 1건**(`admin-sidebar-header`의 `div`+`onClick` 그룹 토글 → `<button>` 전환, button 기본값 보정 CSS 동반)이고 나머지는 전파 차단(`stopPropagation`)과 모달 배경(닫기 버튼 5개 존재)이라 제외 규칙에 넣었다. **자가 버그 1건**: 정규식이 화살표 함수 `=>`의 `>`를 태그 끝으로 오인해 전파 차단 6건을 오탐 신고 → **중괄호 균형 파싱**으로 교정. 구 내용: — `:focus-visible` 없는 인터랙티브 셀렉터 검출. `onClick`을 가진 비시맨틱 요소(div/span) 검출.
- [x] **P4-4 · `design_system.md` 개정** — ✅ 2026-11-01 (**v5.23 → v6.1**, 개정 5건) — 조항 추가가 아니라 **교체**:
  - [x] §4-2 **전면 재작성**(v6.0) — 35단 균일 격자 → 11단 역할 기반. 개편 사유·실측 근거·이동 폭 명시 + 현행 규범 본문 11곳 토큰명 갱신
  - [x] §4-4 신설 — 버튼 기하 4단·터치 타깃(`pointer: coarse`에서 토큰만 바꿔 전 소비처 적용)·호버 부유 2단
  - [x] §4-4 신설 — 라운드 5단 + `50%`, 생값 금지(개편 전 33종)
  - [x] §4-3 신설 — 자간 5단·행간 6단·굵기 400/500/600. **700+ 금지**와 **미로드 굵기(100/300/800/900) 금지** 사유 명문화
  - [x] **§9-13 장식 예산 신설** — 래칫 집행 방식·비율 지표 제외 사유·하드 규칙 8종·**지표 설계 원칙 3**(총량이 아니라 병리를 센다 / 목표값을 추정하지 않는다 / 허용 목록이 넓으면 게이트는 통과 도장만 찍는다)·이후 규범 변경 원칙(조항 추가 대신 교체 또는 예산 신설)
  - [x] ~~v5.19 `pre-line` 2줄 규약 개정~~ — ❌ D-2 ① 유지 결정으로 **불필요**
- [x] **P4-5 · `EXCLUDE` 정책 명문화** — ✅ 2026-11-01 — **"제외 목록은 허가가 아니라 사각지대다"** 를 원칙으로 못박고, 이 목록이 **두 번 결함을 숨긴 기록**을 주석에 남겼다(`max-width: 1400px` ×2 → P0-4 / 생값 `font-size` 72건 → P3-8). **적용 범위를 `font-size` 규칙으로 한정**하고, 제외 사유(어드민은 밀도 높은 데이터 도구 — 공개 타입 스케일 11단을 쓰면 테이블이 깨진다)·**해제 조건**(어드민 전용 스케일 선언 또는 공개 스케일 마이그레이션 → P3-10)·**신규 추가 금지**를 명시. 구 내용: — `AdminDashboard.css`·`ServiceDocs.css` 제외가 **왜** 정당한지, 언제 해제하는지. 현재는 사각지대로만 기능(P0-4의 원인).
- [x] **P4-6 · `docs/INDEX.md` 등재** — ✅ 2026-11-01 — 본 문서 + [AI 패턴 감사](ai_pattern_audit.md)를 core/ 섹션 `design_system.md` 직후에 등재. 링크 유효성 검증 완료(깨진 링크 0).

---

## 7. 📊 진척 대시보드

> 갱신 규칙: 각 단계 완료 시 §8 스크립트를 재실행하고 **실측 후값**을 기록합니다. 추정값 금지.

### 7-1. 계층별 판정

| 계층 | 기준일 판정 | 현재 | 목표 |
| :--- | :--- | :--- | :--- |
| A 재질 | 🔴 심각 | 🟢 (색 수렴 + 장식 밀도 감축 완료) | 🟢 |
| B 구성 | 🔴 심각 | 🔴 | 🟡 |
| C 타이포 | 🟠 높음 | 🟢 (C1 스케일 인플레이션까지 해소 — 35→11단) | 🟢 |
| D 모션 | 🟠 높음 | 🟢 (D1·D3·D4·D5 해소 — 유휴 구동 51→8) | 🟢 |
| E 카피 | 🟡 중간 | 🟢 **해소** (E1 UI 컨트롤 · ✨플랭킹 · 절대화·반복 어구 모두 P3-4까지 정리) | 🟢 |
| F 구조 | 🔴 심각 | 🟢 (F1·F2 해소 · 데드 CSS 1,520줄 정리 · 토큰 무결성) | 🟢 |
| G 버튼 | 🔴 심각 | ✅ **완료** (G1~G10) | 🟢 |
| H 텍스트 배치 | 🔴 심각 | ✅ **완료** (H1·H2a·H3·H4·H5·H6) | 🟢 |

### 7-2. 핵심 지표

> **측정: `node ci/pattern-metrics.mjs`** — 수치를 손으로 세지 마십시오. v1.0 대시보드는 손 grep 기반이라 13건의 오차가 있었고(절단 합산·주석 포함·'고유값' 정의 불일치), v1.1에서 측정기 값으로 전면 교체했습니다.
> **기준(P0 전)** = 커밋 `e1524bf`를 `git archive`로 복원해 동일 스크립트로 측정한 값.
> **현재(P0 후)** = 오너 미커밋 `src/pages/waymark/` 제외(P0 순효과 분리). 전체 포함 수치는 스크립트 기본 출력 참조.

| 지표 | 기준(P0 전) | 현재(P0 후) | 목표 | 단계 |
| :--- | ---: | ---: | ---: | :--- |
| **@keyframes 중복 선언** | **6종** | **0** ✅ | 0 | P0-6 |
| **금지대역 max-width px** | **2** | **0** ✅ | 0 | P0-4 |
| @keyframes 총 선언 | 81 | **51** ↓30 | ≤ 40 | P0-6·P2-4 |
| **고아 키프레임** | **20** | **0** ✅ | 0 | P2-4 |
| **유휴 구동 infinite** | **51** | **8** ✅ | 8 | P2-4 |
| `infinite` 총량 | 87 | **60** | 60(참고치) | P2-4 |
| `radial-gradient` 총량 | 30 | **26** | 참고치 | P2-2 |
| **유휴 시 보이는 글로우** | — | **15** | 12 | P2-2 |
| **`focus-visible` 보유 파일** | **5** | **7** ✅ | 전역 1곳 + 필요 시 | P1-G5 |
| **집행되는 디자인 차원** | **1 / 12** | **12 / 12** ✅ | ≥ 7 | P4-1·2 |
| **접근성 게이트** | **0** | **3종** ✅ | — | P4-3 |
| 키보드 경로 없는 onClick | **1** | **0** ✅ | 0 | P4-3 |
| **래칫 집행 지표** | **0** | **23 + 하드규칙 3** ✅ | — | **P4-2** |
| `'Outfit'` 유령 참조 | 9 | **0** ✅ | 0 | P0-2 |
| 토큰 동일 생hex | 72 | **0** ✅ | 0 | P0-3a |
| **`backdrop-filter`** | **90** | **29** ✅ | 30 | P2-3 |
| **gradient-text (규칙)** | 31 | **21** ✅ | 21 | P2-1 |
| **파일당 최다 gradient-text** | **3** | **2** ✅ | 2 | P2-1 |
| **`transition: all`** | **60** | **0** ✅ | 0 | P2-5 |
| **텍스트 opacity 중첩(AA 미달)** | **5** | **0** ✅ | 0 | P2-6 |
| `opacity: 0.1~0.6` 총량 | 50 | **42** | 42(참고치) | P2-6 |
| **`!important`** | **67** | **7** ✅ | 20 | P2-9·H6 |
| `cursor: pointer` | 57 | 57 | 감사 후 축소 | P1-G10 |
| JSX 이모지 (전체) | 270 | **178** ↓92 | 참고치 | P2-7 |
| **UI 컨트롤 이모지** | **32** | **0** ✅ | 0 | P2-7 |
| **CSS 총 줄수** | **13,372** | **11,705** ↓1,667 | — | P3-12 |
| **데드 CSS 규칙** | **194** | **0** ✅ | 0 | P3-12 |
| JSX 이모지 (공개 지면) | 127 | **104** ↓23 | ≤ 70 | P2-7 |
| JSX 인라인 style | 176 | **117** ↓59 | 어드민 77(유틸 수렴 후) · 어드민 외 40(정당 34) | P3-10 · P3-13 |
| CSS 생hex | 225 | **137** ↓88 | ≤ 40 | P1-A1·A2 |
| **border-radius 고유값** | **33** | **10** ↓23 | 8 (목표 5는 50%·0 제외 수치 — 정정) | P1-G1a·b |
| **gap 고유값** | **32** | **14** ↓18 | 11 (목표 6은 오추정 — 정정) | P1-G8 |
| **hover lift 종수** | **7**(오집계) → 실제 **3** | **2** ✅ | 2 | P1-G4 |
| **letter-spacing 고유값** | **20** | **5** ✅ | 5 | P1-H3 |
| **line-height 고유값** | **16** | **6** ↓10 | 5 (역할이 6개 — 6이 하한일 수 있음) | P1-H4 |
| **font-weight 700+ 건수** | **126** | **0** ✅ | 0 | P1-H5 |
| font-weight 600+ 비율 | 80% | **65%** ↓15 | 65 (목표 40%는 오추정 — 정정) | P1-H5 |
| **font-weight 고유값** | **8** | **3** ✅ | 3 | P1-H5 |
| 미로드 굵기 사용 | **20** | **0** ✅ | 0 | P1-H5 |
| text-align: center 비율 | 64% | **62%** ↓2 | 62 (목표 35%는 오추정 — 잔존이 전부 정당) | P1-H1 |
| 다행 텍스트 중앙정렬 | **7곳** | **0** ✅ | 0 | P1-H1 |
| **`text-transform: uppercase`** | **40** | **17** ↓23 | 17 | P1-H2a |
| **`cursor: pointer`** | **57** | **34** ↓23 | 34 | P1-G2 |
| breakpoint 고유값 (`@media`) | 11 | **5** ✅ | 5 — 역할 티어 3종(640/768·769/1024) + 어드민 1200(4열 스탯 그리드) | P3-9 |
| **버튼 생값 padding** | **29종** | **0** ✅ | 0 | P1-G3 |
| 버튼 min-height 선언 | **0** | **전 버튼** ✅ | — | P1-G3·G6 |
| **죽은 var() 폴백** | **142** | **0** ✅ | 0 | P1-A3 |
| **미선언 토큰 참조** | **7** | **0** ✅ | 0 | P1-A3 |
| **그라디언트 inline-block 누락(블록)** | **4** | **0** ✅ | 0 | P1-A3 |
| **같은 셀렉터 2회 선언** | **10** | **8** | 0 | P1-A3 |
| 고유 버튼 클래스 계열 | 60+ | 60+ | 기하 상속 전환 | P1-G2 |
| **`--fs-*` 토큰 단수** | **35** | **11** ✅ | 8~11 | P3-8 |
| **렌더 안 되는 로드 폰트** | **2종** | **0** ✅ | 0 | P0-1 |
| 로드 폰트 패밀리 수 | 5 | **3** ↓2 | 3 | P0-1 |
| 전역 커스텀 커서 적용 지면 | 전 지면 | **홈 전용** ✅ | 홈 전용 | D-3 |
| **집행되는 디자인 차원** | **1 / 12** | 1 / 12 | **≥ 7** | P4-1·P4-2 |

### 7-3. 단계 진척

| 단계 | 항목 수 | 완료 | 진척 | 상태 |
| :--- | ---: | ---: | ---: | :--- |
| P0 결함 교정 | 8 | 8 | **100%** | ✅ **완료** (P0-3b는 P1-A1로 승격 — 분모에서 제외) |
| P1 A·G·H 정합 | 22 | **22** | **100%** | ✅ **완료** (H2b 불필요 · G7 측정오류 · G9 감사결과 정당 · G10 타작업으로 해소) |
| P2 장식 예산화 | 9 | **9** | **100%** | ✅ **완료** (P2-8은 D-3으로 해소) |
| P3 구성 공식 | 11 | 11 | 100% | ✅ 완료 (P3-13 신설 포함) |
| P4 집행 체계 | 6 | **6** | **100%** | ✅ **완료** (P4-1·2·3·4·5·6) |
| **합계** | **60** | **60** | **100%** ✅ | |

---

## 8. 🔍 측정과 집행

| 도구 | 역할 | 빌드 차단 |
| :--- | :--- | :---: |
| [`ci/pattern-metrics.mjs`](../../ci/pattern-metrics.mjs) | **수치의 단일 정의** (계측) | ✗ |
| [`ci/pattern-budget.mjs`](../../ci/pattern-budget.mjs) + [`.json`](../../ci/pattern-budget.json) | **래칫 집행** (단조 감소) | ✅ prebuild |
| [`ci/design-check.mjs`](../../ci/design-check.mjs) | 토큰 규범(`--fs-*`)·i18n | ✅ prebuild |

```bash
npm run metrics          # 전 지표 현황
npm run budget           # 목표까지 남은 거리
npm run budget:tighten   # 개선분을 기준선에 반영(조이기)
```

> **개선한 뒤에는 반드시 `npm run budget:tighten`을 돌리십시오.** 조이지 않으면 줄인 만큼이 다시 늘어날 여유로 남습니다.

### 8-1. 재현용 세부


```bash
node ci/pattern-metrics.mjs              # src/ 전체
node ci/pattern-metrics.mjs --no-admin   # 어드민(내부 도구) 제외
node ci/pattern-metrics.mjs --json       # 기계 판독용
```

[`ci/pattern-metrics.mjs`](../../ci/pattern-metrics.mjs)가 §7 대시보드의 **유일한 측정 권위**입니다. 계측 전용이며 빌드를 막지 않습니다(집행 게이트는 P4-1·P4-2에서 `design-check`에 추가).

**고정된 측정 정의** — 이 셋이 흔들려서 v1.0 수치에 오차 13건이 생겼습니다.

| 정의 | 내용 | v1.0에서 생긴 오차 |
| :--- | :--- | :--- |
| 주석 제외 | CSS `/* */` 구간은 집계에서 뺀다 | `opacity`·`!important` **과대** (문서화 주석이 수치를 오염) |
| 값 분해 | `0 6px 6px 0` 같은 다중값은 구성 값 각각으로 센다 | `border-radius` 19→33 · `gap` 19→37 **과소** |
| 절단 없음 | 파일별 목록을 잘라 합산하지 않는다 | `backdrop-filter` 69→89 **과소**(`head -15` 후 합산) |
| `@media` 한정 | breakpoint는 `@media` 안의 `(max\|min)-width`만 센다 | breakpoint 20종+→11종 **과대** |

**P0 전 기준선 재현** — 커밋을 작업 트리에 영향 없이 복원해 같은 스크립트로 측정합니다.

```bash
mkdir -p /tmp/base && git archive e1524bf src | tar -x -C /tmp/base
mkdir -p /tmp/base/ci && cp ci/pattern-metrics.mjs /tmp/base/ci/
(cd /tmp/base && node ci/pattern-metrics.mjs)
```

> ⚠️ 오너의 미커밋 작업(`src/pages/waymark/` 등)이 트리에 있을 수 있습니다. 단계 순효과를 분리해 볼 때는 해당 경로를 제외한 사본에서 측정하십시오 — 그러지 않으면 **남의 변경이 내 델타로 잡힙니다**(실제로 v1.1 측정 중 `gradient-text` +4·`backdrop-filter` +1이 그렇게 섞였습니다).

---

## 9. ✅ 결정 완료 (2026-11-01)

| # | 결정 | 선택 | 집행 |
| :--- | :--- | :--- | :--- |
| **D-1** | 세리프 디스플레이 폰트 | **① 2종 제거** | ✅ P0-1 완료 — `index.html` 폰트 요청 **5→3패밀리**, `--font-serif` 폐지, `--font-display` 기본값을 산세리프로 명시 |
| **D-2** | 2줄 리드 `\n` 규약 | **① 유지** — 의도된 줄바꿈 통제 | P1-H7 **취소**. design_system v5.19 규약 존치(개정 불필요) |
| **D-3** | `TelescopeCursor` | **위임 → '홈 스코프 한정'** (아래 판단 근거) | ✅ 완료 — `Layout`에서 해제 → `Home`에서만 마운트 + `prefers-reduced-motion` 가드 신설 |
| **D-4** | 4제품 CTA 테마 | **① 실제 구분되게 강화** | P3-6 — D-6과 **동일 작업으로 통합**(브랜드 4색을 제품 구분의 수단으로 씀) |
| **D-5** | 라이트 모드 | **① 다크 전용 유지** | P3-11 **취소**. 천체 아이덴티티 존치. 단 A1 다크 퍼스트는 '의도된 선택'으로 감사에 기록 |
| **D-6** | 제품 액센트 색 | **① 브랜드 4색으로 수렴** | ✅ P1-A1·A2 완료 — 제품 액센트 토큰 6종 선언 + `--card-accent`/`--point-color` 단일 소스 재배선 |

### 9-3. 신규 결정 요청

| # | 결정 | 선택지 | 영향 | 연동 |
| :--- | :--- | :--- | :--- | :--- |
| **D-7** 🆕 | **아이콘 세트 출처** — 이모지를 SVG로 바꿀 때 무엇을 쓰는가 | ① **천체 테마 자작 인라인 SVG**(브랜드 일관성 ↑, 제작 비용 ↑) ② 기성 세트(lucide·phosphor 등) 선별 사용 — **주의: lucide 기본 세트 그대로는 AI 생성 티의 전형**(감사 §1 B2)이므로 선별·커스텀 필수 ③ 현행 이모지 유지(P2-7 취소) | UI 컨트롤 ~35 + 제품 아이덴티티 ~25 | P2-7 |
| **D-8** 🆕 | **라운드 스냅 방향**(P1-G1b) | ① 가까운 토큰으로 일괄 스냅(±2~6px 시각 변화 수용) ② 중간 토큰 1~2종 추가(토큰 인플레이션 위험) ③ 생값 유지(G1b 취소) | 8px 22곳·10px 10곳·20px 8곳 등 ~55곳 | P1-G1b |

### 9-1. D-3 판단 근거 (위임 처리)

**결론: 제거가 아니라 홈 스코프 한정.**

| 판단 요소 | 내용 |
| :--- | :--- |
| 전역 마운트의 실제 피해 | `Layout`에 마운트돼 `html.has-custom-cursor *`에 `cursor: none !important`를 걸고 있었다. **모든 지면**에서 I-beam(텍스트 선택 가능 신호)과 pointer(링크 신호)가 사라진다. 장문 아티클(Builder's Log 상세·Planner's View·정책 지면)에서 특히 해롭다 |
| 기능이 홈에만 있음 | 망원경 모티브가 참조하는 `#starConstellation`은 홈 히어로 전용이다. 다른 지면에서는 `refreshStageRect()`가 매 프레임 빈손으로 돌고 **기능 없는 금색 레티클만** 남았다 |
| 자산 가치 | D-5가 천체 아이덴티티를 유지하기로 했으므로 망원경 모티브 자체는 브랜드 자산이다 |
| 감사의 지적 재독해 | 감사 D4의 문제는 '장식이 있다'가 아니라 **'장식이 균등 분배됐다'** 다. 따라서 교정은 삭제가 아니라 **희소화**다 — A3의 Intentional Glow와 동일 원리(Linear가 글로우를 한 화면에 하나만 두는 것) |
| 부수 수정 | RAF 루프가 `cursor.style.transform`을 직접 쓰는데 `prefers-reduced-motion` 가드가 **없었다**(design_system §6-3 v5.7 위반). 추가했다 — reduced-motion에서는 커서를 끄고 네이티브로 되돌린다(감쇠 없는 커서는 의미가 없으므로) |

### 9-4. 추가 결정 (2026-11-01)

| # | 결정 | 선택 | 집행 |
| :--- | :--- | :--- | :--- |
| **D-10** 🆕 | **히어로 타이틀 그라디언트** — Sylphio만 색이 달랐다 | **① `--gradient-brand` 단일화 · 예외 폐지** (D-9와 동일 원칙) | ✅ 9지면 통일 · `design_system.md` **§9-1 v5.25** |
| **D-9** 🆕 | **히어로 마크** — 이모지를 SVG로 바꾸니 히어로에서 더 어색해졌다. 제거할 것인가 별도 디자인할 것인가 | **① 전면 제거 · 예외 없음** — 오너: *"디자인의 예외는 없다. 일관성이 가장 좋은 유저의 답이야."* | ✅ 7개 지면 히어로 마크 제거 · `design_system.md` **§9-1 v5.24 개정** |

**D-10이 드러낸 것 — 예외 조항은 자기 범위를 지키지 않는다**
§9-1의 '제품 브랜드 예외'는 **Sylphio의 타이틀 그라디언트에 한해** 제품 팔레트를 허용했다. 그런데 실제로는 **3종**이 생겼다: ① 브랜드 4곳 ② Sylphio 사파이어 3곳(조항이 허용) ③ **콘텐츠 상세 2곳의 흰색→반투명 흰색** — **어떤 조항도 허용하지 않은 제3의 변종**이다. 허용의 **존재 자체**가 이탈의 근거가 된다. D-9에서 오너가 말한 "예외는 없다"의 실증 사례로 기록한다.
**오독 기록**: 오너의 "컬러가 다르다"를 처음에 **렌더 버그**로 읽었다. 그 버그(`inline-block` 누락)도 실재해서 고친 것은 소득이지만, **질문은 일관성이었고 답은 통일**이었다.

**D-9 판단 근거 3가지**
1. **정보 중복** — `📖` 위에 "Planner's View", `🛠` 위에 "Builder's Log", `🪐` 위에 날짜. 타이틀이 이미 말하는 것을 마크가 반복했다.
2. **규범이 AI 템플릿을 성문화하고 있었다** — §9-1 구 규격은 '아이콘 → h1 → 서브카피'를 요구하고 아이콘을 **이모지 3rem + `float … infinite`** 로 못박았다. 감사 B5(히어로 배지)·B1(섹션 공식)·**D1(유휴 상시 구동)을 규범이 요구사항으로** 담고 있던 것이다. 코드만 고치고 규범을 두면 다음 생성 사이클에 되돌아온다.
3. **브랜드 마크 언어 ≠ UI 아이콘 언어** — UI 컨트롤용 균일 스트로크(1.5)를 44px로 키우면 '큰 UI 아이콘'으로 읽히고 마크의 무게가 없다. 지면별 마크 제작은 **장식을 다시 들여오는 길**이다.

**예외를 두지 않은 효과**: 처음엔 Waymark 나침반(제품 핵심 은유·선공개로 제품 비주얼 없음)만 예외로 두려 했으나, 오너 판단대로 **예외 없이** 처리했다. 예외 1건이 §9-1에 '단, …인 경우' 조항을 만들고 그것이 리비전 25회의 경로였다.

**제품 자산은 구분했다**: Sylphio 히어로의 `sylphio-icon.png`는 **실제 앱 아이콘**(App Store 리스팅과 동일한 제품 식별 자산)이므로 장식 마크가 아니다 → §9-1 개정문에 명시적 구분을 넣고 유지.

### 9-2. 결정으로 취소된 항목

- **P1-H7**(2줄 리드 `pre-line` 전환) — D-2 ① 유지 결정으로 취소. `text-wrap: balance` 전환 안 함.
- **P3-11**(라이트 모드 도입) — D-5 ① 다크 전용 유지로 취소.
- **P3-6**(4제품 CTA 테마) — D-4 ①이 D-6 ①과 같은 작업이 되어 **P1-A1에 흡수**.

> 취소분은 §7-3 분모에서 제외합니다(남은 과제를 부풀리지 않기 위해).

---

## 10. 📌 작업 순서 권고

```
P0 (반나절)  ─┐
              ├─ P4-1·P4-2 골격 신설과 병행 (예산 카운터를 먼저 세워야 P1·P2가 되돌아오지 않음)
P1 G·H (2~3일)┘
      ↓
P2 장식 예산화 (2~3일) ── P4-1·P4-2 규칙 ERROR 승격
      ↓
P3 구성 공식 (1주) ── D-1~D-5 결정 선행 필요
      ↓
P4-4 design_system.md 개정 (압축 결과 반영)
```

### 10-1. 다음 착수점 (2026-11-01 기준)

결정 6건이 모두 확정됐으므로 **차단 요소가 없습니다.** 권고 순서:

| 순 | 항목 | 이유 |
| :--- | :--- | :--- |
| 1 | **P4-2 장식 예산 카운터** | P1·P2보다 **먼저**. 집행 장치 없이 정리하면 다음 생성 사이클에 재유입된다. 측정기(`pattern-metrics.mjs`)가 이미 개수를 세므로 임계값만 얹으면 된다 |
| 2 | **P1-A1 제품 액센트 수렴** (D-6) | 색이 정해지면 그 아래 작업(P1-G 호버·보더·글로우)이 두 번 일하지 않는다 |
| 3 | **P1-G1/G3/G4** 라운드·치수·호버 | 전 페이지 반복 물체. 개별 지면 손대지 않고 전역 품질 상승 |
| 4 | **P1-H3/H4/H5** 자간·행간·굵기 토큰 | 동일 논리. H5(굵기 80%→40%)가 체감 변화 가장 큼 |
| 5 | **P2** 장식 예산 집행 | 1번의 임계값을 실제로 맞추는 단계 |

**P4를 마지막에 두지 않는 것이 핵심입니다.** 집행 장치 없이 P1·P2를 하면, 다음 생성 사이클에서 동일 패턴이 재유입됩니다(지금까지 25회 리비전의 경로).
