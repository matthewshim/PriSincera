---
status: active
domain: Core
last_updated: 2026-11-03
version: v6.9
target_files:
  - src/styles/index.css
  - ci/design-check.mjs
  - src/components/hero/TelescopeCursor.jsx
  - src/components/hero/TelescopeCursor.css
  - src/pages/BuildersLog.jsx
  - src/pages/ReLearn.jsx
  - src/pages/ReLearnDaily.jsx
---

# 📐 디자인 시스템 (Design System)

## 📝 Revision History

| Version | Date | Author | Description | Impact Area |
| :--- | :--- | :--- | :--- | :--- |
| v2.0 | 2026-04-30 | Designer | 프리미엄 다크 모드(Premium Dark Mode) 기준으로 디자인 시스템 대대적 재설계 | CSS System |
| v2.5 | 2026-05-19 | Designer | Bento Chrono-Calendar & 3-Tab Workstation Theme 규격 정의 | DailyDigest |
| v2.6 | 2026-05-20 | Designer | PaceNote Bento Weekly Calendar & Voyage Horizon 디자인 토큰 표준 수립 | PaceNote |
| v3.0 | 2026-05-27 | AI Agent | 여백 최적화(Density) 및 퍼플 배경 색상 누수 완전히 제거(Desaturated Chrono-Neutral) 규격 명문화 | CSS Layout & Color System |
| v4.0 | 2026-05-27 | AI Agent | 차세대 의미론적 CTA 버튼 설계 규격(Semantic CTA) 및 글로벌 최고 수준 디자인 시스템 분석(Linear, Vercel, HIG) 반영 | Global Brand System & UI Refactoring |
| v4.5 | 2026-06-02 | AI Agent | 글로벌 인터랙션 대통합 (3D Tilt, 마그네틱 TelescopeCursor, Unified Haptic active scale) 규격 제정 | Global Interaction System & UI Refactoring |
| v4.6 | 2026-06-02 | AI Agent | **최신 해상도 점유율 및 안구 가독 가시 범위 기반 3단계 콘텐츠 가로 영역 규격화 수립** | Global Spacing & Layout System |
| v5.0 | 2026-06-09 | AI Agent | **AI 특유의 템플릿 느낌을 완전히 걷어내고 스타라이트 실버, 네뷸라 인디고, 스타라이트 골드 조합으로 대대적인 천체(Celestial) 테마 개편 및 본문 고대비 명도 개선** | Brand Accents & Colors Overhaul |
| v5.1 | 2026-07-20 | AI Agent | **규범화 개편** — 13단 폰트 스케일 완성·`--fs-*` 토큰 신설·px 금지 규칙, §9 표준 컴포넌트 규격(히어로·섹션·카드·CTA·틴트·체크리스트) 신설, Body Large 1.15rem 정정 (ReLearn 타이포 위반 사후 환류) | index.css, 전 페이지 제작 규범 |
| v5.2 | 2026-07-20 | AI Agent | **전면 토큰 전환·자동 집행** — 전 페이지 CSS font-size 298건 `--fs-*` 전환(마이크로 밴드 스냅 60건 포함), `ci/design-check.mjs` prebuild 게이트 신설(§9-7), 어드민 제외·헤딩 스케일 백로그 명시 | 전 페이지 CSS, ci/, package.json |
| v5.3 | 2026-07-20 | AI Agent | **카드 §9-3 정밀화** — '실효 패딩(중첩 래퍼 합산)' 기준 정의, 카드 2계층 규격(리스트형 18px·radius-md·공통 표면 / 컨테이너형 24px·radius-lg·고유 스킨), 그리드 gap 14px, 호버 시 기본 그림자 유지 규칙 (ReLearn 시그널 이중 패딩 42px 사후 환류) | 카드 규범, ReLearn 배움 존 |
| v5.4 | 2026-07-20 | AI Agent | **전수 검사 환류** — §3-3 폭 체계를 현실 기반 4계(900/1000/1100/1200)로 재편(미사용 1440 폐기, ReLearn 1200 편입·상세 900 스냅), §9-1 제품 브랜드 예외, §9-2 카드 헤더 경계, §9-3 미디어형 3계층·호버 스코프 한정, §9-7 호버 정렬 백로그 | 폭 체계, 히어로·카드 규범 |
| v5.5 | 2026-07-20 | AI Agent | **폭 일원화** — 4계 폐지, '단일 컨테이너(`--container` 1200px) + 가독 단(`--measure` 860px)' 2요소 모델 채택. 대역[880~2000px] px max-width 금지·design-check 자동 집행. 컨테이너/measure 혼동(페이지 셸을 좁히던 구조) 종식 | 폭 체계 전면, index.css, ci/ |
| v5.6 | 2026-07-21 | AI Agent | **타이포 그리드 전면화** — 0.05rem 그리드 실사용 값 전부 토큰 등재(총 30단), 오프그리드·px 7건 스냅, 전 CSS 리터럴 64건 토큰화(비토큰 잔존 0). design-check를 전 범위 ERROR로 격상(§9-7 헤딩·마이크로 백로그 해소). 챕터 카드(액센트형) 호버 예외 등재 | index.css, 전 CSS, ci/ |
| v5.7 | 2026-07-22 | AI Agent | **모션 접근성·키보드 패리티 규범** — §6-3 JS 틸트에 `prefers-reduced-motion` 가드 의무화(전역 CSS 킬 스위치가 JS 인라인 transform을 차단하지 못하는 맹점 환류), §9-3 전체 링크 카드의 `:focus-visible` 호버 미러링 규정 신설, 액센트형 radius 실구현 정합 정정(`--radius-md`→`--radius-lg`) | 인터랙션 접근성 규범, BuildersLog |
| v5.8 | 2026-07-22 | AI Agent | **§9-8 인접 인터랙티브 컨트롤 간격 규범 신설** — 독립 컨트롤 수직 적층 최소 `--space-md`(16px)·수평 나열 최소 `--space-sm`(8px), 음수 마진 근접 배치 금지 (아카이브 상세 존 도구줄 ↔ 어학 '전체 발음 듣기' 근접 적층 QA 환류) | 컨트롤 간격 규범, ReLearnDaily |
| v5.9 | 2026-07-22 | AI Agent | **§9-1 적용 범위 명시** — 페이지 최상위 히어로는 콘텐츠 상세 페이지에도 동일 구성 적용(아카이브 상세 자체 축소 헤더가 유발한 일관성 이탈 QA 환류 — `.rl-hero` 재사용으로 정합) | 히어로 규범 적용 경계, ReLearnDaily |
| v5.10 | 2026-07-22 | AI Agent | **§9-9 상세 페이지 상단 내비 브레드크럼 규범 신설** — `← {섹션명}` 뒤로가기(GNB 활성 섹션 내 동어반복) → 위치 경로 `{섹션} › {구역}`으로 통일. ReLearnDaily·BuildersLogDetail 일괄 적용 | 상세 내비 규범, ReLearnDaily·BuildersLogDetail |
| v5.12 | 2026-08-04 | AI Agent | **i18n 언어팩 게이트 신설** — 리런 클러스터 전면 언어팩 이관(relearn 네임스페이스 126키×3언어)·빌더스로그 상세 삼항→t() 통일·ErrorBoundary 컨텍스트 비의존 로케일화·고아 dailyDigest/paceNote 네임스페이스 정리(107키 삭제, 실사용 12키 relearn 이관)와 함께, design-check에 한국어 하드코딩 ERROR 규칙 추가(§9-6-0 ③) | 언어팩 3종, 리런 클러스터 11파일, ci/ |
| v5.13 | 2026-08-05 | AI Agent | **§9-1 가변 콘텐츠 타이틀 토큰 endpoint clamp 예외 + design-check clamp 사각 가시화** — 고정 라벨(목록 히어로)은 고정 토큰, 가변 길이 콘텐츠 타이틀(상세 아티클 제목 등)은 `clamp(var(--fs-*), Nvw, var(--fs-*))` 토큰 endpoint clamp 허용. design-check에 clamp 내부 비토큰 rem/px 리터럴 검출 규칙 신설(기존 정규식이 `clamp(` 뒤를 못 읽던 사각) — 선재 18곳은 WARN(§9-7 백로그), 전수 정비 후 ERROR 승격. Builder's Log 목록·상세 정합: §9-1(타이틀 clamp 토큰화·히어로 모바일 --fs-220 추가), §9-2(카드 헤더 상한 초과 시정 — featured --fs-240→--fs-150·그리드 --fs-180→--fs-135, 리런 카드 스케일 정합), §9-10(radius 999px·오폴백·미정의 토큰·인라인 3건·배지색 전량 토큰화) | §9-1·§9-2 규범, ci/, BuildersLog |
| v5.14 | 2026-08-05 | AI Agent | **§6-3 절제 예외 — Builder's Log 카드 3D 틸트 미적용** — 홈 플래그십(Chapter 11)과 동일 절제 철학으로 마우스 추적 3D 틸트·scale 제거, 호버를 CSS `translateY(-2px)` 부유+은은한 글로우로 정제(오너 "호버 과함" QA). featured 배포 패널을 검정 틴트→`--glass-bg` 정규 유리 재질로 정합하고 뒤 glow-sphere 제거(불균일 얼룩 해소). 틸트 제거로 해당 카드는 reduced-motion JS 가드 대상에서 이탈(CSS 호버는 전역 킬 스위치가 처리) | §6-3 인터랙션 규범, BuildersLog |
| v5.17 | 2026-08-12 | AI Agent | **디스플레이 대역 토큰 등재 + clamp endpoint ERROR 승격** — 전 랜딩 히어로/대형 섹션 타이틀의 선재 raw clamp 8곳(Hero·Connect·Journey·Philosophy·Work·DailyDigest·Sylphio 가이드/개인정보)을 `var(--fs-*)` endpoint로 전수 토큰화(시각 무변경). 디스플레이 대역 5토큰(`--fs-250`/260/280/350/450) 등재로 스케일 30→35단. design-check clamp 규칙 WARN→ERROR 승격(v5.13 예고 이행)·§4-2 유동표 var() 정합 | index.css, ci/, 8개 CSS, §4-2·§9-1 |
| v5.18 | 2026-08-26 | AI Agent | **§9-1 히어로 규격 보강** — 타이틀 `display: inline-block` 필수(그라디언트가 글자 폭에 클립; 풀폭 블록이면 텍스트가 중간색 lavender만 샘플해 gold 소실)·서브카피 `word-break: keep-all`/`overflow-wrap: break-word`·아이콘/타이틀 강제 line-height 금지(본문 1.6 상속) 명문화 (Candela 히어로 색·여백 이탈 환류) | §9-1, CandelaLanding |
| v5.19 | 2026-08-29 | AI Agent | **§9-1 서브카피 규약 명문화** — `white-space: pre-line`(언어팩 `\n` 보존) + 콘텐츠 규약(1행 로케일 문장 + 2행 고정 영문 태그라인, 장문 금지) 추가 (Candela 서브카피가 장문·영문 태그라인 부재로 이탈했던 환류) | §9-1, CandelaLanding, locales |
| v5.20 | 2026-08-31 | AI Agent | **§9-11 보강 — 목록 없는 섹션의 하단 크로스 내비 필수화** — 사이드바가 1100px 이하에서 사라지는데 섹션에 목록 페이지가 없으면 모바일 탐색 수단이 0이 된다. 이 경우 본문 하단 카드 스트립을 상시 배치하도록 명문화. Planner's View 신설 적용 | §9-11, PlannersView |
| v5.21 | 2026-08-31 | AI Agent | **§9-1 v5.9 적용 범위 구체화 + 상세 히어로 정합** — 콘텐츠 상세 히어로의 h1=글 제목, 선두 이모지의 아이콘 승격, 메타는 서브카피 아래 배치를 명문화. 목록 카드식 헤더를 쓰던 `BuildersLogDetail`을 표준 히어로로 교체하고 `PlannersView`를 동일 규격으로 신설 (오너 "뷰에 히어로가 없다" QA 환류) | §9-1, BuildersLogDetail, PlannersView |
| v5.22 | 2026-09-22 | AI Agent | **§9-11 하단 크로스 내비 규범 일반화** — '목록 없는 섹션' 한정이던 규칙을 '사이드바가 유일한 교차 탐색 수단인 화면 + 순서가 있는 연재물'로 확장. Planner's View가 루트=목록으로 전환되며 목록이 생겼지만, 시리즈 이전/다음 내비는 모바일 순서 이동 수단이므로 상시 배치가 필요하다 | §9-11, PlannersView |
| **v6.9** | 2026-11-03 | AI Agent | **§9-14 모션 절 재작성 — 스크롤 연동 모션 제거** (오너 판정: 2층 문법 복제가 "억지") — 측정하니 **복제할 정본이 없었다**: 다른 섹션은 생값 전이 16·4·8·1건으로 제각각이고 **Work만 0건**이라 이 섹션이 오히려 기준이었다. Journey의 '선이 그려짐'은 연대기가 요구하는 장치, Belief의 스포트라이트는 '하나를 읽게' 하는 장치인데, 이 지면은 **동등한 5개를 훑는 색인**이라 둘 다 뜻이 없다 — 복제하면 의미를 입은 장식이 되고 중앙 행 강조는 훑기와 경쟁한다. **등장 스태거도 제거**(없는 순서를 모션이 만든다). 통일감은 **같은 어휘**(토큰)로 확보하고 같은 **장치**를 복제하지 않는다. 투자는 상호작용에 — 사용자가 구동하고 매 방문 쓰인다 | §9-14, WorkSection |
| **v6.8** | 2026-11-03 | AI Agent | **§9-14 모션 — 사이트 공통 2층 문법 명문화** (오너 지적: "벨리프·저니는 스크롤에 따라 강약이 생기는데 이번 건은 등장만") — 실측하니 Journey 1·2층 / Belief 2층 / Connect 1층인데 재편 직후 Work는 **둘 다 없었다**. 1층은 `--scroll-progress`로 **액센트 선이 스스로 그려지게** 하고(Journey 타임라인과 같은 기법, 새 요소 0), 2층은 **행 단위** 스포트라이트를 넣되 **비활성을 흐리지 않는다** — 제품 색인은 견주어야 하므로 빼지 않고 더한다. 리프트는 `--lift-hover` 하나로 통일(§4-4). **상태별 `transition-duration` 덮기 금지** 조항 신설 — `transform`을 공유하므로 한 상태에서 길이를 덮으면 등장이 함께 짧아진다(자가 교정) | §9-14, WorkSection |
| **v6.7** | 2026-11-03 | AI Agent | **§9-14 등장 모션 문법 명문화 — 카드별 도착 발화** (오너 "모션이 누락된 것 같다" 제보) — 섹션을 1/3로 줄이자 섹션 단위 1회 발화가 **시선보다 먼저 끝나** 모션이 없는 것처럼 보였다. 카드별 관찰로 전환하고 진폭을 18→28px, 열 지연을 `:nth-child`로 옮겼다(인덱스로 행을 계산하면 `auto-fit` 모바일에서 틀린다). **별똥별은 복원하지 않는다** — 캔버스가 `z-index: 0`이고 카드가 24px 블러 유리 뒤라 효과가 거의 없는데 전역 이벤트 결합만 남는다(계층 실측). **Canvas 모션 감쇠 가드** 신설: 전역 `prefers-reduced-motion`은 CSS만 덮으므로 `StarField` 핸들러에 `matchMedia` 가드 추가 — Journey·Belief·Connect에 함께 효력 | §9-14, WorkSection, StarField |
| **v6.6** | 2026-11-02 | AI Agent | **§9-14 — 카드 자체를 링크로, 정보 3단위** (오너 결정: 카드 안 별도 CTA 버튼 제거) — 버튼을 두면 클릭 대상이 둘이 되어 "카드와 버튼 중 어디를 누르나"라는 질문이 생긴다. 어포던스는 **우측 하단 화살표**가 맡고 배경·보더를 주지 않는다(버튼처럼 보이면 같은 질문이 돌아온다). 접근명은 `aria-label`로 줄이되 **보이는 제품명을 포함**한다 — WCAG 2.5.3(Label in Name). CTA 문구는 화면에서 사라졌지만 접근명으로 계속 쓰인다 | §9-14, WorkSection |
| **v6.5** | 2026-11-02 | AI Agent | **§9-14 제품 카드 규격 신설 — 홈 `Proof of Work` 균일 압축 2열 재편** (오너 결정: 서비스 간 우선순위 부여 불가 → 모든 제품 동등) — 정보 **7단위 → 4단위** 고정(제품명·요약 1행·태그 2개·CTA), 제품당 전용 CSS 아트 폐지(**918줄**, 유일한 소비처였던 GNB 벤토 내비로 이전), 섹션 높이 **2,216px → 약 756px**, 제품 추가 비용 **+404px → 2개당 +184px**. **모바일 가로 캐러셀 폐지** — 스냅 캐러셀이면서 스크롤바를 양쪽 다 숨겨 스와이프 표식이 0개였고 `column-reverse`로 카드가 뷰포트보다 높아 세로·가로가 동시에 스크롤됐다(오너 제보). 스크롤 스포트라이트도 제거(비활성 카드 흐림이 비교를 방해) | §9-14, WorkSection, BentoMockups 신설, locales×3 |
| **v6.4** | 2026-11-01 | AI Agent | **§4-4 버튼 라운드 — 이름 기반 집행의 사각지대 보완** (오너 발견: 저니 하단 오픈소스 링크 버튼이 알약으로 남아 있었다) — 차단 규칙이 셀렉터의 `btn`/`cta`/`button`만 보기 때문에 `.maker-note-link`를 놓쳤다. `--radius-sm`으로 교정하고, **형태 기반 WARN**을 신설했다(radius + padding/min-height + 클릭성). 차단하지 않는 이유는 그 18건에 클릭 버튼과 배지·칩이 섞여 **역할 판단이 필요**하기 때문이다 | §4-4, JourneySection, ci/design-check |
| **v6.3** | 2026-11-01 | AI Agent | **§9-1 '제목 선두 이모지는 그대로 둔다' 문구 정정** — v5.24가 아이콘 승격을 폐지하며 남긴 "제목에 그대로 두는 것이 작성자 의도에 맞다"는 결론이 같은 날 정립된 **발행물 이모지 금지 규범**([publishing_guide §6](../builders-log/publishing_guide.md) 신설 · [content_guide §2-6](../planners-view/content_guide.md) 전 섹션 격상)으로 전제를 잃었다. 아티클 제목·본문에서 이모지 378건을 전수 제거했으므로 '둘 대상'이 없다. 조항이 폐지된 규범을 가리키는 상태를 바로잡은 문서 정합 개정(렌더 변경 없음) | §9-1, 발행 가이드 2종 |
| **v6.2** | 2026-11-01 | AI Agent | **§4-4 버튼 라운드 규범 신설 — 사각 단일(`--radius-sm`)·알약 금지** (오너 결정: "라운드 버튼조차 AI 잔재로 보는 사람들의 시선이 있다") — 버튼 라운드가 **6종**(pill 11·md 10·sm 9·lg 2·50% 2)으로 갈려 있던 것을 **역할 4분류**로 명문화: CTA·클릭 버튼 `--radius-sm` 단일 / 아이콘 전용 정사각 `50%` / CTA 컨테이너 `--radius-lg` / 배지 `--radius-xs`. 전역 버튼 스캐폴드가 **한 곳에서** 선언하고 페이지 CSS의 중복 선언을 제거. `design-check`에 버튼 라운드 하드 규칙 추가 | §2, §4-4, index.css, 지면 CSS |
| **v6.1** | 2026-11-01 | AI Agent | **규범 공백 4절 신설 + 집행 차원 1→12** — §4-3(자간 5단·행간 6단·굵기 400/500/600) · §4-4(라운드 5단·버튼 기하 4단·호버 2단) · §4-5(`--space-12`·`--doc-gutter` 신설 사유) · **§9-13 장식 예산**(래칫 집행·하드 규칙 8종·지표 설계 원칙 3). `design-check`에 5차원 하드 규칙(radius·tracking·leading·weight·transition)과 **접근성 게이트 3종**(키보드 경로 없는 onClick·img alt·아이콘 버튼 이름) 추가 — 전부 어드민 포함 전역 집행. **EXCLUDE 정책 명문화**(적용 범위를 `font-size`로 한정·해제 조건·신규 추가 금지) — 이 목록이 `max-width 1400px`와 생값 font-size 72건을 숨겼다 | §4-3~4-5·§9-13, ci/ |
| **v6.0** | 2026-11-01 | AI Agent | **§4-2 타입 스케일 전면 개편 — 35단 0.05rem 균일 격자 → 11단 역할 기반 모듈러 스케일** — 이름을 숫자(`--fs-075`)에서 역할(`--fs-xs`)로 바꿨다: 숫자 이름이 값 추가를 유도해 13→30→35단이 된 경로를 끊는다. 347개 사용처 마이그레이션(대부분 ±0.05rem 이동), `design-check` 허용값 11개로 교체. 부수: 허용 목록을 좁히자 **구 토큰 값과 우연히 일치해 통과하던 clamp 내부 생리터럴 10건**이 드러나 토큰화. 실측 근거: 0.65~1.05 대역 9토큰이 사용의 69%를 흡수 / 1.1~1.8 대역은 14토큰이 70회 | §4-2, 27개 CSS, ci/ |
| v5.25 | 2026-11-01 | AI Agent | **§9-1 제품 브랜드 예외 폐지 — 히어로 타이틀 그라디언트 `--gradient-brand` 단일화** — 예외를 하나 열어두자 실제로는 **3종**이 생겼다(브랜드 4곳 / Sylphio 사파이어 3곳 / **조항에 없는 흰색→반투명 변종 2곳**). 9지면 전량 통일. 부수: Sylphio 3지면의 `display: inline-block` 누락 교정(짧은 타이틀이 풀폭 그라디언트 중간만 샘플해 단색 렌더 — 오너 발견) + 블록 위반 3곳 + `gradient-text-no-inline` 게이트 신설 | §9-1, 9개 지면 히어로 |
| v5.24 | 2026-11-01 | AI Agent | **§9-1 히어로 마크 전면 폐지 (예외 없음)** — 구 3요소('아이콘 → h1 → 서브카피')에서 아이콘을 삭제하고 **2요소**로 개정. 이모지 `3rem` + `float … infinite` 요구 조항 폐지. 상세 히어로의 '제목 선두 이모지 아이콘 승격'(v5.21)도 함께 폐지. 사유: ① 타이틀이 이미 말하는 것의 정보 중복 ② **규범이 AI 템플릿(감사 B5·B1)과 상시 애니메이션(D1)을 요구사항으로 성문화**하고 있었음 ③ 브랜드 마크 언어 ≠ UI 아이콘 언어. 제품의 실제 앱 아이콘 이미지는 장식이 아니므로 대상 제외 (오너 결정 — "디자인의 예외는 없다, 일관성이 가장 좋은 유저의 답") | §9-1, 7개 지면 히어로 |
| v5.23 | 2026-09-22 | AI Agent | **§9-9 연재물 브레드크럼 예외 신설** — 시리즈에 속한 글은 현재 노드에 제네릭 라벨 대신 시리즈명을 쓴다(2뎁스 유지). 연재 위치는 히어로 배지가 담당하되 **비링크**로 — 시리즈 전용 URL이 없는데 링크를 걸면 어포던스가 전체 목록으로 착지해 약속이 깨진다. 3뎁스 확장은 시리즈 전용 지면이 생길 때 재검토 | §9-9, PlannersViewDetail |
| v5.16 | 2026-08-05 | AI Agent | **§9-12 커스텀 스크롤바 규범 신설** — 전역 얇은 다크 테마 스크롤바(`index.css` `*`)로 전 스크롤 컨테이너 일괄 통일(리런 일기장 도크·빌더스로그 상세 목차·실피오 가이드/개인정보). 트랙 궤도 추가 즉시 반영(`onOrbitAdded`→`reload`) 동반 | §9-12, index.css, DailyView |
| v5.15 | 2026-08-05 | AI Agent | **§9-11 문서형 페이지 레이아웃 규범 신설** — 장문 프로스 페이지(아티클 상세·정책·가이드)의 단일 패턴 명문화: 전폭 셸(1200) + 프로스 단(860 좌) + sticky TOC 사이드바(300 우) + 반응형 붕괴 + 플랫 프로스(중첩 라운드 박스 지양, 콜아웃만 단일 박스). BuildersLogDetail·Sylphio 가이드/개인정보 3개 페이지 정합 (오너 "상세 뷰 좁음·중첩 박스 답답함" QA 환류) | §9-11 레이아웃 규범, BuildersLogDetail·Sylphio |
| v5.11 | 2026-08-04 | AI Agent | **리런 4채널·페이지 색·틴트·radius 정합** — §1-4 시맨틱 색 토큰(success/danger/star) 신설, §9-10 신설(컨테이너 radius `--radius-lg` 통일·§9-4 적용 범위·카테고리 브랜드 4색 그룹·DM Pick gold·JSX 인라인 금지). 시그널 미디어형→리스트형 통일, 16px 비토큰 종식, 쨍한 tailwind 다색·에메랄드 DM 제거 (오너 4채널 일관성 QA 환류) | ReLearn 4채널·셸, index.css, §1·§9 |

> **"Sincerity, Prioritized."**
> 본 문서는 PriSincera 웹사이트가 세계 최고 수준(World-class)의 디자인 품질을 달성하기 위한 디자인 시스템 표준 가이드라인입니다. 현행 버전은 frontmatter `version`(Revision History 최신 행)을 따릅니다.

---

## 0. 🌐 글로벌 최고 수준 디자인 시스템 분석 및 사전 조사 (Preliminary Analysis)

전 세계에서 가장 정교하고 프리미엄한 디자인 시스템을 구축한 글로벌 기술 기업들의 설계 철학을 조사·분석하여, PriSincera v4.0의 핵심 설계 뼈대로 내재화하였습니다.

### 0-1. Linear's "Dark-First" & "Intentional Glow" 철학
* **Near-Black & Desaturated Base**: Linear는 완전한 순수 블랙(`#000000`)의 가혹한 대비가 사용자 눈에 유발하는 '광학적 잔상(Vibration)'과 피로를 방지하기 위해, 극도로 채도가 낮고 정제된 다크 그레이 배경(`#0F0F10`)을 기조로 삼습니다.
* **Border Highlights & Glows**: 모든 물리적 영역은 1px 두께의 극히 얇고 반투명한 보더(`rgba(255,255,255,0.05)`)로 구조를 형성합니다. 인터랙션 시에만 오브젝트 가장자리를 감싸는 미세한 '빛 반사(Glow)' 효과를 적용하여 정적인 화면에 생명력과 공간의 깊이를 부여합니다.
* **PriSincera v4.0 내재화**: 보라색 배경 누수를 전면 차단하고, 무채색 다크 그레이 투명 재질(`rgba(10, 10, 10, 0.75)`, `rgba(17, 17, 17, 0.6)`) 및 반투명 미세 보더를 시스템 표준 스킨으로 확립합니다.

### 0-2. Vercel's "Geist" & APCA Contrast & Semantic CTA 철학
* **APCA (Advanced Perceptual Contrast Algorithm) 지향**: 인간의 눈이 어두운 테마에서 밝은 글자를 인지하는 실제 시각적 두께와 톤 대비를 정밀 계산하여 타이포그래피 계층을 분리합니다.
* **Semantic Button & Structural Ink**: 색상(Chromatic Color)의 무분별한 남용 대신, 구조적인 강렬함(Structural Ink)으로 버튼의 위계를 정렬합니다. Primary 버튼은 강력한 톤 대비로 목적을 유도하고, 보조 버튼은 배경과 명확한 위계로 구분됩니다.
* **PriSincera v4.0 내재화**: 흩어져 있던 ad-hoc 버튼 컬러(녹색, 인디고, 보라 등)를 전면 무효화하고, 전역적 의미론적 CTA 버튼 명세(`.btn-primary`, `.btn-secondary`, `.btn-glow`)를 선언하여 사용자 인지 부하를 제로화합니다.

### 0-3. Apple HIG (Human Interface Guidelines) "Material & Vibrancy"
* **Materials Hierarchy**: 배경 위에 얹어지는 카드(Surfaces)들은 자체 색조가 아닌, 화이트의 불투명도와 극미한 투명 블러 효과(`backdrop-filter: blur(24px)`)의 단계로만 깊이감(Depth)을 형성합니다. 이를 통해 하위 레이어와 상위 레이어 간의 색상 중첩 왜곡을 원천 방지합니다.
* **PriSincera v4.0 내재화**: 기존 카드들에 존재하던 불규칙한 퍼플 혼합 스킨을 완전히 걷어내고, 무채색 화이트 투명 계열(`rgba(255, 255, 255, 0.02)`) 및 `blur(16px~24px)` 조합으로 통일합니다.

---

## 1. 🎨 Color System: Refined & Sophisticated (Celestial Overhaul)

**[디벨롭 사유]** 텍스트를 장시간 집중해서 읽어야 하는 `DailyDigest` 아티클이나 `PaceNote` 주차별 타임라인에서 배경이나 카드에 보라색 색조가 섞여 있으면, 색상 간섭 현상으로 인해 가독성이 급격히 저하됩니다. 또한 호버 시 포인트 컬러가 강조되는 시각적 효과가 배경색과 희석되어 고급스러움이 저하됩니다.
**[v5.0 설계 표준]** AI 특유의 쨍한 보라색/핑크색 템플릿 느낌을 완전히 걷어내고, 깊은 우주의 느낌을 주는 **우주색 배경(OLED Space Black)**과 **스타라이트 골드**, **네뷸라 인디고**, **스타라이트 실버** 조합의 세련된 천체(Celestial) 테마를 수립하며 본문 텍스트 대비 명도를 대폭 개선하였습니다.

### 1-1. Base & Surfaces (OLED Space Black & Navy Depth)
| Token | Hex / RGBA | 용도 및 설계 의도 |
|-------|-----------|------------------|
| `--bg-void` | `#020205` | 깊고 순수한 우주의 암흑 배경 (OLED 친화적) |
| `--bg-deep` | `#070710` | 네이비 톤이 살짝 감도는 깊은 밤하늘 배경 레이어 |
| `--bg-surface` | `#0E0E1A` | 카드 및 패널 기본 서페이스 |
| `--bg-elevated` | `#161629` | 툴팁 및 플로팅 강조 요소 |
| `--glass-bg` | `rgba(14, 14, 26, 0.75)` | 깊은 우주 유리광 스킨 |
| `--glass-border` | `rgba(255, 255, 255, 0.05)` | 정밀한 1px 초미세 구조선 |
| `--glass-border-hover`| `rgba(129, 140, 248, 0.20)` | 호버 시 활성화되는 인디고 빛 반사 테두리 |

### 1-2. Typography Colors (APCA & Legibility)
| Token | Hex / RGBA | 용도 및 기대 효과 |
|-------|------------|-------------------|
| `--text-primary` | `#FAFAFA` | 제목, 주요 본문 (가장 선명한 Off-White, 15:1 대비) |
| `--text-secondary`| `#E2E8F0` | 보조 텍스트, 설명 및 본문 (가독성이 극대화된 Slate Light, 7:1 대비 충족) |
| `--text-muted` | `#94A3B8` | 비활성 텍스트, 태그, 부가 정보 (시각적 안정감을 유지하는 Slate Muted) |

### 1-3. Brand Accents & Gradients (Celestial Accents)
| Token | Hex / Value | 용도 |
|-------|-------------|------|
| `--color-gold` | `#E5B25D` | 메인 핵심 포인트 컬러 (기준음 Note A 상징 Starlight Gold) |
| `--color-indigo` | `#A5B4FC` | 서브 브랜드 포인트 컬러 (맑고 깊은 Nebula Indigo - 가독성 개선) |
| `--color-cyan` | `#22D3EE` | 정보성 강조, 테크(Tech) 시그널, 링크 색상 (Aether Cyan) |
| `--prism-rose` | `#F1F5F9` | **스타라이트 실버/화이트**. 기존의 저렴한 AI 핑크를 완벽히 치환 |
| `--prism-lavender`| `#C7D2FE` | 다크모드 가독성을 위해 명도가 보장된 연인디고 |
| `--gradient-brand` | `linear-gradient(135deg, var(--color-indigo) 0%, var(--prism-lavender) 50%, var(--color-gold) 100%)` | Celestial Indigo to Gold 그라디언트 |
| `--gradient-cta` | `linear-gradient(135deg, rgba(229, 178, 93, 0.08), rgba(255, 255, 255, 0.03))` | starlight gold 기반 반투명 브랜드 그라디언트 |

### 1-4. Semantic Status Colors (기능색) — v5.11

브랜드 4색(§1-3) 절제의 **명시적 예외**입니다. 성공/위험/별점은 보편 관례색을 시맨틱 토큰으로 단일화합니다(컴포넌트마다 애드혹 hex를 흩뿌리던 문제 종식).

| Token | Hex | 용도 |
|-------|-----|------|
| `--color-success` | `#34D399` | 완료·저장 성공 상태 |
| `--color-danger` | `#F87171` | 오류·삭제·경고 상태 |
| `--color-star` | `#FCD34D` | 별점·스코어 강조 |

- 이 셋 외 신규 기능색은 **본 문서 개정으로만** 추가합니다. 상태색을 브랜드 액센트(gold/indigo/cyan)로 대체하지 않습니다(성공=초록·오류=빨강은 보편 인지 관례).

---

## 2. 🔘 의미론적 CTA 버튼 설계 규격 (Semantic CTA Button System)

> **형태 규범은 §4-4 '버튼 라운드 — 사각 단일'을 따릅니다** — CTA는 `--radius-sm`(6px) 사각이며 알약 금지(v6.2).

**[디벨롭 사유]** 기존 코드에서는 버튼들마다 인라인으로 상이한 백그라운드 색조(그린, 퍼플, 인디고)와 서로 다른 테두리 두께가 적용되어 있었습니다. 이는 사용자의 인지 행동 패턴(Action Mapping)을 왜곡하고 브랜드의 신뢰도를 저하시킵니다. 
**[v4.0 설계 표준]** 전역적인 의미론적 CTA 버튼 명세(`.btn-primary`, `.btn-secondary`, `.btn-glow`)를 수립하여 전면에 동일한 물리법칙과 비주얼 토큰을 상속시킵니다.

### 2-1. CTA 버튼 종류별 토큰 및 클래스 명세

```css
/* 1. Primary CTA (.btn-primary) - 메인 실행 버튼 */
.btn-primary {
  background: var(--btn-primary-bg);
  color: #FFFFFF;
  border: 1px solid var(--btn-primary-border);
  box-shadow: 0 4px 20px var(--btn-primary-glow);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: var(--radius-pill);
  transition: all var(--duration-fast) var(--ease-spring);
}

.btn-primary:hover {
  background: var(--btn-primary-hover-bg);
  border-color: var(--btn-primary-border-hover);
  box-shadow: 0 8px 30px var(--btn-primary-glow-hover);
  transform: translateY(-2px);
}

/* 2. Secondary CTA (.btn-secondary) - 보조/대안 버튼 */
.btn-secondary {
  background: rgba(25, 25, 25, 0.65);
  color: var(--crystal-light);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: var(--radius-pill);
  transition: all var(--duration-fast) var(--ease-spring);
}

.btn-secondary:hover {
  background: rgba(35, 35, 35, 0.85);
  border-color: var(--glass-border-hover);
  color: var(--text-primary);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  transform: translateY(-2px);
}

/* 3. Interactive Glow CTA (.btn-glow) - 실시간 맥동 피드백 버튼 */
.btn-glow {
  position: relative;
  overflow: hidden;
  box-shadow: 0 0 0 0 rgba(34, 211, 238, 0);
  animation: activePulse 4s infinite ease-in-out;
}

@keyframes activePulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(34, 211, 238, 0); }
  50% { box-shadow: 0 0 15px 0 rgba(34, 211, 238, 0.15); }
}

/* 4. 공통 쫀득한 타격감 효과 (Active Pressed State) */
.btn-primary:active,
.btn-secondary:active,
.btn-glow:active {
  transform: scale(0.97) translateY(0) !important;
  transition-duration: 70ms !important;
}
```

---

## 3. 📐 Geometry & Spatial System (The 8-Point Grid & Spacing Optimization)

불규칙한 스페이싱(`6px, 12px, 80px`)을 버리고, **엄격한 4pt / 8pt Grid System**을 도입합니다. 인간의 눈은 수학적 비례에서 무의식적인 편안함과 고급스러움을 느낍니다.

| Token | 값 | 용도 |
|-------|---|------|
| `--space-xs` | `4px` | 요소 간 최소 간격 (아이콘과 텍스트) |
| `--space-sm` | `8px` | 인라인 요소 간격, 작은 버튼 패딩 |
| `--space-md` | `16px` | 컴포넌트 내부 패딩 (Input, Button) |
| `--space-lg` | `24px` | 기본 대형 영역 내부 패딩 |
| `--space-xl` | `32px` | 섹션 내 그룹 간격 |
| `--space-2xl` | `64px` | 주요 섹션 간 간격 |
| `--space-3xl` | `128px` | 대형 Hero 여백, 페이지 상하단 여백 |

### 3-1. 🚀 v4.0 Card & Content Spacing Optimization (Density)
기존의 카드들은 텍스트의 볼륨에 비해 과도한 내부 여백과 넓은 카드 사이의 간격을 가지고 있어 화면이 비어 보이거나 산만한 단점이 있었습니다. v4.0에서는 최적의 정보 밀도를 확보하기 위해 아래와 같이 규격화합니다.

* **카드 내부 여백 (Card Padding)**:
  - 데스크톱/태블릿: 기존 `24px 32px` (`var(--space-lg) var(--space-xl)`)에서 **`20px 24px`** 또는 **`16px 24px`**로 세로 여백을 컴팩트하게 조정합니다 (상하 17~33% 축소).
  - 모바일: `16px 20px`로 스택 및 정보 전달력을 강화합니다.
* **카드 간 사이 여백 (Flex/Grid Gap)**:
  - 데스크톱: 기존 `var(--space-lg)` (`24px`)에서 **`16px` (`var(--space-md)`)** 또는 **`18px`**로 최적화하여 연관된 카드들이 기하학적으로 하나의 그룹으로 명확히 인식되도록 묶어줍니다.
  - 태블릿/모바일: `14px` 또는 `16px`로 리플로우되어 견고한 정보 흐름을 보장합니다.

### 3-2. Border Radius (부드러운 곡선)
| Token | 값 | 용도 |
|-------|---|------|
| `--radius-sm` | `6px` | 체크박스, 작은 태그 |
| `--radius-md` | `12px` | 일반 카드, 액션 버튼 |
| `--radius-lg` | `24px` | Bento Grid의 대형 패널, 모달 창 |
| `--radius-full`| `9999px` | Pill 모양 CTA 버튼 |

### 3-3. 🖥️ 최신 해상도 점유율 기반 콘텐츠 영역 가로 규격 (3-Tier Width System)
데스크톱의 주류 해상도인 1920x1080(FHD) 점유율 60% 통계와 모바일 및 QHD/4K 모니터 환경에 동시에 대처하며, 글을 읽는 인간 안구의 피로도 임계점(Line-Length / Measure)을 넘지 않도록 아래와 같이 콘텐츠 영역 가로 상한선(`max-width`)을 3개 카테고리 기하학으로 규격화합니다.

> **[v5.5 일원화]** 폭 계층은 "컨테이너(페이지 셸)"와 "가독 폭(measure, 본문 단의 타이포그래피 속성)"을 혼동한 산물이었습니다(4계 운영 → 페이지 간 엣지 널뜀·신규 페이지 분류 비용·ReLearn 1160 사고). 이를 **2요소 모델**로 종식합니다. — 🔒 규범

**폭 2요소 (유일 허용)**
| 토큰 | 값 | 역할 |
|------|-----|------|
| `--container` | **1200px** | **모든 페이지 셸·GNB·푸터·섹션 그리드의 유일한 컨테이너 폭.** 페이지 간 콘텐츠 엣지를 완전 일관시킨다 |
| `--measure` | **860px** (≈74자) | **장문 프로스 단·좁은 중앙 콘텐츠 스택**(아티클 본문·정독 문서·히어로 카피·모달)의 내부 제약. 컨테이너가 아니라 콘텐츠 단의 속성 |

**[강제 규칙 — MUST]**
1. 페이지·섹션 컨테이너의 `max-width`는 `var(--container)`만 사용합니다.
2. 장문 단은 컨테이너를 좁히지 말고 **내부에서 `var(--measure)`로 제한**합니다. (셸을 900/1000/1100으로 좁히던 방식 금지)
3. **대역 `[880px, 2000px]`의 px `max-width` 리터럴 금지** — `ci/design-check.mjs`가 prebuild에서 ERROR로 차단합니다. (880px 미만 컴포넌트 폭 — 모달 이하 소형 요소·입력창 등 — 은 자유)
4. 풀블리드 비주얼(캔버스·히어로 배경·라인)은 컨테이너 밖에서 자유.
5. 폐지된 900/1000/1100/1440 계층 값을 신규 사용하지 마십시오.


---

## 4. 🔠 Typography & Multilingual Optimization

글로벌 수준의 타이포그래피는 '어떤 디바이스에서도 완벽하게, 그리고 아름답게 읽히는 것'을 목표로 합니다.

### 4-1. Language-Specific Font Stacks (언어별 맞춤 폰트 스택)
다국어 환경(English, Korean, Japanese)에서의 완벽한 심미성과 가독성 보장을 위해 각 언어별 맞춤 폰트 스택을 바인딩하여 렌더링 퀄리티를 최적화합니다.
* **영어 (English)**: `Inter`, `Geist`, `SF Pro Display` 등을 스택 선두에 배치하여 숫자와 알파벳의 모던한 비율 및 기하학적 조형미를 극대화합니다.
* **한국어 (Korean)**: `Pretendard Variable`, `Pretendard`를 전면 도입하여 자간/행간의 불균형을 극복하고 다크모드 상에서도 명확히 스캔되도록 최적화합니다.
* **일본어 (Japanese)**: `Hiragino Sans`, `Hiragino Kaku Gothic ProN` (macOS/iOS 최적화) 및 `Yu Gothic`, `Meiryo` (Windows 최적화)를 차례대로 배치하여 렌더링 시 왜곡이나 기본 서체의 투박함을 방지하고 가독성을 확보합니다.

### 4-2. Typography Scale — 🔒 규범(Normative) · **v6.0 (11단 역할 기반)**

**[강제 규칙 — MUST]**
1. `font-size`는 **아래 11개 역할 토큰**만 사용합니다. **px·임의 rem 절대 금지.** 정본은 `index.css` 정의부이고 `ci/design-check.mjs`가 집행합니다.
2. 스케일에 없는 단계가 필요하면 **본 문서 개정을 통해서만** 추가합니다. 페이지 CSS에서 새 값을 발명하지 마십시오.
3. `clamp()`의 상·하한도 **반드시 토큰**입니다(§9-1 v5.13). 유동 중간값(`vw`)만 리터럴이 허용됩니다.

| 토큰 | 값 | 역할 |
|------|-----|------|
| `--fs-micro` | 0.70rem | 마이크로 라벨·배지·아이브로우 |
| `--fs-xs` | 0.80rem | 캡션·태그·메타 |
| `--fs-sm` | 0.90rem | 보조 본문·버튼·상태 |
| `--fs-base` | 1.00rem | **본문 기본** (lh `--leading-relaxed`) |
| `--fs-md` | 1.15rem | 강조 본문·**히어로 서브카피**(Body Large) |
| `--fs-lg` | 1.30rem | 카드 제목·소제목 |
| `--fs-xl` | 1.50rem | 소형 헤딩 |
| `--fs-2xl` | 1.75rem | 섹션 타이틀 |
| `--fs-3xl` | 2.10rem | 대형 섹션 타이틀 |
| `--fs-4xl` | 2.40rem | 목록·상세 히어로 타이틀 |
| `--fs-display` | 3.00rem | 서비스 히어로 타이틀 |

**[v6.0 개편 사유 — 35단 → 11단]**
- **구 체계는 스케일이 아니었습니다.** 0.05rem **균일 격자** 위에 35단이 등재돼 있었는데, 이것은 설계된 스케일이 아니라 **생성된 값들의 사후 조회표**입니다. 리비전이 그 경로를 그대로 기록합니다: v5.1(13단) → v5.6(30단) → v5.17(35단), 사유는 매번 *"선재 리터럴을 토큰화"*.
- **실사용이 극단적으로 치우쳐 있었습니다**(2026-11-01 실측): `0.65~1.05rem` 대역의 9개 토큰이 전체 사용의 **69%(264/383)** 를 흡수하고, `1.1~1.8rem` 대역은 **14개 토큰이 70회**(토큰당 5회)만 쓰였습니다. 미사용 토큰 2단(`--fs-260`·`--fs-450`).
- **0.80과 0.85는 눈이 구분하지 못합니다.** 구분되지 않는 두 값이 모두 토큰이면, 새 값이 필요할 때마다 "하나 더 등재"가 정당해집니다.
- **이름을 숫자에서 역할로 바꿘 것이 핵심입니다.** `--fs-082`라는 이름은 *"0.82가 필요해"* 를 부르지만, `--fs-sm`은 *"이건 어느 역할인가"* 를 묻게 합니다. **35단이 된 경로를 막는 것은 값이 아니라 이름입니다.**
- **간격은 비율 기반**입니다: 읽기 대역 ≈1.12, 디스플레이로 갈수록 넓힙니다(균일 격자 폐기).
- **이동 폭**: 347개 사용처 중 대부분 ±0.05rem. 최대는 `--fs-180 → --fs-3xl`(+0.30, 섹션 타이틀 clamp 하한 4곳)·`--fs-350 → --fs-display`(−0.50, 홈 히어로 1곳)·`--fs-050 → --fs-micro`(+0.20, 1곳).
- **부수 수확**: `design-check`의 허용값을 11개로 좁히자, **구 토큰 값과 우연히 일치해서 통과하던 `clamp()` 내부 생리터럴 10건**이 드러나 전수 토큰화했습니다(0.85/0.9/0.95/1/1.1/1.6/1.8/2.2rem). 허용 목록이 넓으면 게이트는 통과 도장만 찍습니다.
- **⚠️ 남은 사각지대**: `AdminDashboard.css`(45건)·`ServiceDocs.css`(27건)는 `design-check`의 `EXCLUDE` 대상이라 **px·임의 rem 72건이 그대로입니다**(10~48px, 0.72~1.6rem). 공개 지면은 생값 2건(html 루트 `16px`, `em` 상대 단위)뿐입니다. EXCLUDE 정책은 [개선 계획서](ai_pattern_remediation_plan.md) P4-5에서 명문화합니다.

### 5-1. Premium Card Surface (The "Jewel" Effect)
기존 `--glass-bg`의 색상 혼입을 줄이고 순수한 화이트 투명도를 사용합니다.

```css
.premium-card {
  /* 배경은 무채색 화이트의 극미한 투명도 */
  background: rgba(255, 255, 255, 0.02);
  
  /* 고급스러운 블러 처리 */
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  
  /* 테두리: 상단에만 미세하게 더 밝은 빛을 받는 느낌의 하이라이트 보더 */
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-lg);
  
  /* 다중 그림자로 부유감(Depth) 생성 */
  box-shadow: 
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 24px 40px -8px rgba(0, 0, 0, 0.3);
    
  transition: transform var(--duration-fast) var(--ease-spring), border-color var(--duration-fast);
}

.premium-card:hover {
  background: rgba(255, 255, 255, 0.035);
  /* 호버시에만 브랜드 컬러가 은은하게 등장 */
  border-color: rgba(165, 180, 252, 0.3); 
  transform: translateY(-2px);
}
```

---

### 4-3. Letter Spacing · Line Height · Font Weight — 🔒 규범(Normative) · 신설 v6.0

**[신설 사유]** 폰트 크기는 35종을 CI로 집행하면서 **자간·행간·굵기는 규범도 토큰도 없었습니다.** 그 결과 같은 역할의 아이브로우가 파일마다 `0.08`/`0.1`/`0.12`/`0.16em`으로 갈렸고(자간 20종), 행간 16종, 굵기 8종이 흩어져 있었습니다. 세 차원 모두 `ci/design-check.mjs`가 **ERROR로 전역 집행**합니다(어드민 포함).

**자간 — `--tracking-*` 5단**

| 토큰 | 값 | 역할 |
|---|---|---|
| `--tracking-tight` | -0.02em | 대형 디스플레이·히어로 타이틀 |
| `--tracking-wide` | 0.02em | 버튼·칩 라벨 |
| `--tracking-wider` | 0.05em | 배지 역할(display 계열 대문자 배지) |
| `--tracking-widest` | 0.1em | 아이브로우 역할(mono 계열 섹션 머리 라벨) |
| `--tracking-ultra` | 0.16em | 장식 마이크로 라벨 |

**행간 — `--leading-*` 6단**

| 토큰 | 값 | 역할 |
|---|---|---|
| `--leading-none` | 1 | 아이콘·단일 행 |
| `--leading-tight` | 1.2 | 대형 타이틀 |
| `--leading-snug` | 1.4 | 소형 헤딩·카드 제목 |
| `--leading-normal` | 1.55 | 콤팩트 UI 텍스트 |
| `--leading-relaxed` | 1.6 | **본문 기본**(`body`와 동일) |
| `--leading-loose` | 1.8 | 장문 프로스 |

> 목표는 5단이었으나 **6단이 하한**입니다 — `1.5`(콤팩트 UI)와 `1.65`(본문)를 한 토큰으로 합치면 좁은 박스에서 넘칩니다. 역할이 실제로 6개입니다.

**굵기 — 400 / 500 / 600 만**

| 역할 | 굵기 |
|---|---|
| 본문·설명 | 400 |
| 대형(≥2.5rem) 타이틀 · 버튼 라벨 · 섹션 타이틀 | **500** |
| 소형 헤딩·카드 제목·대문자 배지·강조 | **600** |

- **🔴 700 이상 금지.** '화면 전체가 굵어지는' 직접 원인입니다(개편 전 `700+`가 **126건**). 강조는 **크기·여백·색**으로 만들고 굵기는 최후 수단입니다 — 광학적 무게 = 크기 × 굵기이므로 큰 글자는 더 얇아도 무겁게 읽힙니다.
- **🔴 100 / 300 / 800 / 900 금지.** `index.html`이 Inter를 `wght@400;500;600;700`만 로드하므로 영문 로케일에서 브라우저가 **합성(synthetic) 굵기**를 만들어 자형이 뭉개집니다. Pretendard Variable은 전 범위를 지원해 **한국어에서는 무증상**이라 몇 달간 보이지 않았습니다(2026-11-01 발견, 20곳).

### 4-4. Border Radius · Button Geometry · Hover Lift — 🔒 규범(Normative) · 신설 v6.0

**라운드 — `--radius-*` 5단 + `50%`**

`--radius-xs`(4px 태그·배지·칩) · `--radius-sm`(6px 작은 컨트롤) · `--radius-md`(12px 리스트형 카드·입력) · `--radius-lg`(24px 컨테이너형 카드·패널) · `--radius-pill`(9999px) · `50%`(원형). 그 외 생값 금지(개편 전 고유값 **33종**).

**버튼 기하 — 4단**

| 단 | 패딩 / 최소 높이 | 용도 |
|---|---|---|
| `--btn-pad-xs` / `--btn-h-xs` | 6px 12px / 30px | 인라인 마이크로 컨트롤 |
| `--btn-pad-sm` / `--btn-h-sm` | 9px 16px / 38px | 보조 액션 |
| `--btn-pad-md` / `--btn-h-md` | 12px 28px / **44px** | **전역 표준** |
| `--btn-pad-lg` / `--btn-h-lg` | 14px 30px / 48px | 섹션 주 CTA |

- 버튼류 셀렉터의 **생값 `padding` 금지**(개편 전 고유 조합 29종, 전역 표준을 쓰는 버튼이 2개뿐이었음).
- **터치 타깃**: `@media (pointer: coarse)`에서 `--btn-h-xs`·`--btn-h-sm`을 44px로 올립니다 — **개별 버튼을 키우지 않고 토큰을 바꿰면 전 소비처가 따라옵니다.**

**버튼 라운드 — 🔒 사각 단일 (v6.2 신설)**

> **CTA·주요 클릭 유도 버튼은 `--radius-sm`(6px) 단일입니다. 알약(`--radius-pill`) 금지.**

[결정 사유 — 오너 2026-11-01] **알약 버튼은 그 자체로 AI 생성물의 잔재로 읽힌다.** 생성 도구가
기본값으로 뱉는 형태이고, 실제로 이 저장소의 버튼 라운드는 **6종**(pill 11 · md 10 · sm 9 · lg 2 · 50% 2)으로
갈려 있었다. 둥글기는 "친근함"을 주는 대신 **버튼의 경계를 흐리고 밀도를 떨어뜨린다**. 사각(6px)은
눌리는 면을 분명히 하고, 같은 폭에서 더 많은 라벨을 담으며, 무엇보다 **도구의 기본값이 아니다.**

| 역할 | 라운드 | 비고 |
|---|---|---|
| **CTA·주요 클릭 버튼** | **`--radius-sm`(6px)** | 전역 버튼 스캐폴드가 **한 곳에서** 선언. 페이지 CSS에 다시 적지 않는다 |
| 아이콘 전용 정사각 컨트롤 | `50%` | GNB·캘린더 내비·오디오 등 **글리프 하나만 담는** 버튼에 한정(§9-1 G9 감사 결과) |
| CTA **컨테이너**(버튼 아님) | `--radius-lg` | `.rl-login-cta`·`.wm-cta`처럼 문구+버튼을 감싸는 패널 |
| 태그·배지·칩 | `--radius-xs` | 클릭 대상이 아니다 |

- **집행**: 버튼류 셀렉터에 `--radius-pill`·`--radius-md`·생값을 쓰면 `design-check`가 막습니다.
  - **이름 기반 집행의 사각지대**(2026-11-01 오너 발견): 차단 규칙은 셀렉터에 `btn`/`cta`/`button`이
    있는 규칙만 봅니다. 그래서 `.maker-note-link`(오픈소스 링크 버튼)가 알약으로 남아 있었습니다.
    보완으로 **형태 기반 WARN**을 둡니다 — `border-radius` + (`padding`|`min-height`) + 클릭성을
    만족하면서 `--radius-sm`/`--radius-xs`가 아닌 규칙을 비차단 경고로 보고합니다.
    차단하지 않는 이유: 그 목록에는 **클릭 버튼(→ `sm`)과 배지·칩(→ `xs`)이 섞여** 있어
    역할 판단이 필요하고, 그 판단은 사람이 합니다. 새 버튼을 만들 때 WARN을 비우십시오.
- **예외 없음**: 제품별·지면별 변종을 만들지 않습니다. 둥근 버튼 하나가 섞이면 그 지면만 다른 세대처럼 보입니다.

**호버 부유 — 2단**

`--lift-hover`(-2px 기본) · `--lift-hover-card`(-4px 면적 큰 컨테이너형 카드). 동일 제스처는 동일 거리입니다.

### 4-5. Spacing — 🔒 규범 보강 v6.0

4pt 그리드 `--space-xs/sm/md/lg/xl/2xl/3xl`(4·8·16·24·32·64·128px)에 **2종을 신설**했습니다.

- **`--space-12`(12px)** — 8↔16 사이의 구멍. `gap` 실사용 1위 값(29회)이면서 4pt 그리드 위에 있는데 t셔츠 스케일에 **이 단계의 이름이 없어서** 생값으로 29번 반복됐습니다.
- **`--doc-gutter`(40px)** — 🔴 **하중을 받는 값.** 문서형 레이아웃(§9-11)이 `860(--measure 프로스) + 300(목차 사이드바) + 40(거터) = 1200(--container)`로 정확히 맞물립니다. 스케일 단계로 스냅하면(40→32) **열 합이 컨테이너와 맞지 않아 레이아웃이 어긋납니다.** 스케일 토큰이 아니라 레이아웃 상수이므로 별도 이름을 줬습니다.

## 6. ⚡ Interaction & Animation

프리미엄 UI의 핵심은 '물리법칙을 따르는 자연스러운 인터랙션'입니다.

### 6-1. Spring Physics 기반 Transition
기존의 밋밋한 `ease-out`을 대체하는 텐션 있는 스프링 효과를 기본값으로 사용합니다.

```css
:root {
  /* 애플리케이션 전반에 쓰이는 쫀득한 스프링 곡선 */
  --ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.15);
  --ease-smooth: cubic-bezier(0.16, 1, 0.3, 1);
  
  --duration-fast: 200ms;
  --duration-normal: 400ms;
}
```

### 6-2. Micro-Interactions (마이크로 인터랙션)
- **Button Active State**: 클릭 시 `transform: scale(0.97)`을 주어 물리적 버튼을 누르는 실제적인 타격감을 부여합니다.
- **Spotlight Glow**: 카드 호버 시 단순히 테두리 색상만 바뀌는 것이 아니라, 카드 내부 마우스 커서 위치를 따라다니는 빛 반사(Glow) 효과를 전역 카드 시스템에 통합합니다.

### 6-3. 🌌 3D Tilt Physics (입체 호버 스펙)
카드형 UI 컴포넌트들에 마우스 호버 시, 마우스 좌표 추종형 입체 3D 기울기 효과를 일괄 상속하여 프리미엄 햅틱 깊이를 형성합니다.
* **디바이스 대응 예외 처리**: 모바일/터치 디바이스에서는 3D Tilt 연산을 전면 비활성화하고, 깔끔한 2D `scale(1.01)` 호버 및 햅틱 active scale로 예외 처리하여 오작동 및 성능 저하를 방지합니다.
* **모션 민감 예외 처리 (Reduced Motion) — 🔒 의무**: `prefers-reduced-motion: reduce` 환경에서는 JS 틸트 연산을 전면 비활성화합니다. 전역 CSS 킬 스위치(`index.css`의 reduced-motion 미디어 쿼리)는 transition·animation 시간만 무력화할 뿐 **JS가 mousemove마다 주입하는 인라인 transform은 차단하지 못하며**, 오히려 감쇠 없는 즉발 움직임으로 악화됩니다. 따라서 틸트를 구현하는 모든 컴포넌트는 터치 가드와 함께 `window.matchMedia('(prefers-reduced-motion: reduce)')` 가드를 JS 레이어에 반드시 포함합니다 (TelescopeCursor의 reduced-motion `display: none` 처리와 동일 철학). 이때 액센트 보더·글로우 등 **정적 호버 피드백은 유지**하여 클릭 어포던스 손실을 방지합니다.
* **기울기 감도 차별화 공식 (Differentiated Sensitivity)**:
  - **소개 및 체험 위주 카드** (예: 실피오 Feature 카드): 역동적이고 즐거운 경험을 위해 최대 **`10도`** 수준의 깊은 기울기 허용.
  - **정보 밀도가 높은 묵직한 본문 카드** (예: 데일리 큐레이션 피드 카드, 페이스노트 목표/캘린더 카드): 묵직하고 진중한 신뢰감을 주기 위해 최대 **`5 ~ 7도`** 범위 내로 억제하여 적용.
* **[절제 예외 — v5.14] 3D 틸트 미적용 카드**: 홈 플래그십 카드(Chapter 11 정제, `07f4d0e`)와 **Builder's Log 챕터 카드**는 마우스 추적 3D 틸트를 **적용하지 않습니다.** "화려한 시각적 장치를 덜어내고 스케일 대비·가독성으로만 승부한다"는 절제 철학에 따라, 호버는 CSS `translateY(-2px)` 부유(§9-3 표준) + 액센트 보더 + 은은한 글로우로만 구성합니다. 틸트가 없으므로 JS 인라인 transform도 없어 위 reduced-motion JS 가드 의무의 대상이 아니며(CSS 호버는 전역 킬 스위치가 자동 처리), 편집형 콘텐츠 목록에 과한 모션이 얹히는 것을 방지합니다.
* **물리 메커니즘** (틸트 적용 카드에 한함):
  - 카드 중심을 기준으로 마우스 포인터의 상대적인 X, Y 위치 비율을 계산하여 CSS Custom Property(`--rx`, `--ry`)로 실시간 주입.
  - 적용 스타일: `transform: perspective(1000px) rotateX(var(--rx)) rotateY(var(--ry)) scale3d(1.02, 1.02, 1.02);`

### 6-4. 🔭 TelescopeCursor Magnetic Context Interaction
커스텀 커서(`TelescopeCursor`)가 인터랙티브 타겟과 반응하여 단순 크기 확장을 넘어, 상황별 마그네틱 텍스트를 노출하도록 진화합니다.
* **추적 대상 확장**: 기존 링크(`a`, `button`)에 국한되었던 호버 대상을 빌더스 로그 카드(`.builder-card`), 데일리 피드 카드(`.daily-card`), 페이스노트 대시보드 셀(`.pacenote-cell`), 실피오 피처 카드(`.sylphio-feature-card`) 전역으로 전면 확대.
* **자성 텍스트 라벨 (Magnetic Label)**:
  - 타겟에 `data-hover-text` 속성(예: `data-hover-text="READ"`, `data-hover-text="VIEW"`, `data-hover-text="TRY"`)이 지정되어 있는 경우, `TelescopeCursor`가 해당 요소를 감지하여 포인터를 확장함과 동시에 정중앙에 은은하게 엠보싱 처리된 텍스트 가이드를 투사합니다.
  - 스타일: `--cursor-size`가 80px 이상으로 확장되고 폰트 크기 `10px`, 자간 `0.1em`, 무채색 세미 트랜스페어런트 텍스트 모핑을 동반함.

### 6-5. 🎯 Unified Haptic Active Scale (대통합 햅틱 클릭 피드백)
모든 터치 가능 요소 및 클릭 주체에 대해 균일하고 쫀득한 타격감을 피드백하는 물리 규격을 대통합합니다.
* **적용 범위**: LNB/GNB 메뉴 탭, 아코디언 헤더, 캘린더 날짜 셀, 옴니 검색 모달 트리거, 모든 형태의 버튼(`.btn-primary`, `.btn-secondary` 등) 및 앵커.
* **물리적 규격 (Active Haptic Standard)**:
  - **눌림 압축비**: `transform: scale(0.97) !important;`
  - **복원 반응 시간**: `transition-duration: 70ms !important;`
  - 클래스 선언 `.haptic-trigger` 또는 해당 컴포넌트의 `:active` 의사 클래스(Pseudo-class)에 즉각 매핑.

---

## 7. 🧩 핵심 레이아웃 패턴 (The Unified Bento Grid)

구 `PaceNoteDashboard`(현 ReLearn으로 승계)와 `BuildersLog`에 파편화되어 있던 **Bento Grid**를 메인 공식 UI 패턴으로 승격합니다.

1. **Gaps**: 그리드 간격은 항상 `var(--space-lg)` (24px) 또는 `var(--space-md)` (16px) 유지.
2. **Spans**: 12-column 그리드 체제를 표준으로 하여, 정보 위계에 따라 `span 8`, `span 4` (비대칭 2:1) 혹은 `span 7`, `span 5` 등 다이내믹한 조합 사용.
3. **Internal Padding**: Bento 카드 내부는 상단 좌측 정렬을 기본으로 하되, 여백은 항상 `var(--space-lg)` (24px) 또는 `var(--space-xl)` (32px)로 고정하여 시각적 답답함을 원천 해소합니다.

---

## 8. 🌌 3D WebGL & Physics System (Phase 2.0)

PriSincera의 공간 디자인은 2D 평면을 넘어 Three.js 기반의 3D WebGL 영역으로 확장되었습니다. HTML DOM 요소와의 시각적 통일성을 위해 다음의 3D 전용 파라미터(Token)를 엄격히 준수합니다.

### 8-1. Glassmorphism 3.0 (MeshTransmissionMaterial)
3D 상의 유리(크리스탈) 객체는 단순한 투명도를 넘어 '굴절'과 '산란'을 시뮬레이션해야 합니다.
* **Transmission (투과율):** `1.0` (완전 투명)
* **Thickness (두께):** `0.5 ~ 0.8` (얇고 예리한 유리)
* **Chromatic Aberration (색수차):** `0.15` (과하지 않은 영롱한 산란)
* **Iridescence (무지갯빛 반사):** `1.0` (빛의 각도에 따른 고급스러운 무지개 반사)
* **Attenuation Color (내부 굴절색):** `#6D28D9` (브랜드 메인 컬러)

### 8-2. Volumetric Lighting & Space
* **Point Light (내부 발광):** Intensity `0.5 ~ 0.8`, Color `#A78BFA` (은은한 라벤더)
* **Ambient Light:** Intensity `0.4` (OLED 블랙 배경과 대비를 유지하기 위한 낮은 조도)
* **Star Field (우주 배경):** `#C4B5FD` (보랏빛 별)와 `#7C3AED` (브랜드 컬러 먼지) 조합으로 깊이감 연출.

### 8-3. Spring Physics Engine (Lerp & Damping)
3D와 2D 상호작용의 타격감을 통일하기 위해, 선형적인 이동이 아닌 **감속(Damping)** 기반의 보간을 사용합니다.
* **마우스 자성(Magnetic Hover):** `lerp(current, target, 0.05)` (매 프레임 5%씩 목표치로 이동, 부드러운 텐션)
* **스크롤 전진(Zoom-in):** 스크롤 `progress` 값에 비례하여 Z축을 이동시키되, 즉각 반응하지 않고 `lerp`를 거쳐 멀미(Motion Sickness)를 방지합니다.

---

## 9. 🗓️ Bento Chrono-Calendar & Themed Workstation System (v2.5)

Daily Digest 아카이브 개편과 3-Tab 워크스페이스 리뉴얼 과정에서 정립된 **Bento Chrono-Calendar**와 **3-Tab 워크스테이션 테마 시스템**의 표준 가이드라인입니다. 다른 개발자나 AI가 즉시 이해하고 코드로 이식할 수 있도록 구현 패턴과 세부 설계 토큰을 완벽히 규격화합니다.

### 9-1. Chrono-Calendar Grid Specification (레이아웃 시프트 방지)
* **CLS(Cumulative Layout Shift) 제어**: 달 변경(Prev/Next Navigation) 시 화면 높이가 출렁이는 것을 방지하기 위해, 모든 연/월에 관계없이 항상 6주 분량인 **42개의 격자 셀(Grid Cells)**을 유지합니다. 이전 달의 잔여일과 다음 달의 시작일을 더미 셀로 패딩하되, 불투명도(`opacity: 0.2` 또는 `0.05`)로 시각 계층을 구별합니다.
* **그리드 레이아웃**: `display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px;`
* **셀 상태 정의 (Cell States)**:
  * **미발행일(Inactive)**: 마우스 및 포인터 이벤트 원천 차단 (`pointer-events: none`), 연하게 투명화(`rgba(255, 255, 255, 0.15)`).
  * **발행일(Active)**: 포인터 활성화, 글래스모피즘 스킨(`background: rgba(255,255,255,0.025)`, `border: 1px solid rgba(255,255,255,0.06)`).
  * **당일 표시(Today)**: 골드 보더 액센트(`border: 1px solid rgba(251, 191, 36, 0.4)`), 당일 텍스트 가시화(`.today-badge { color: #FBBF24 }`).
* **Active Hotspot & Pulse Glow**:
  * 발행일 중앙 하단에 4px 원형 도트(`.hotspot-dot`)와 12px 반경의 흐릿한 아우라(`.hotspot-glow`)를 오버레이합니다.
  * `.hotspot-glow`는 `scale(1.0)` -> `scale(1.4)`로 2초 주기의 부드러운 키프레임 맥박 애니메이션(`hotspotPulse`)을 지속 수행합니다.
  * **마우스 호버**: 셀 자체는 `scale(1.08)` 물리 바운스 효과(`--ease-spring`), 테두리는 보라색(`rgba(167, 139, 250, 0.4)`)으로 빛나며, 내부의 `.hotspot-dot`은 `scale(1.5)`로 확장되고 흰색(`#ffffff`)으로 모핑 전환됩니다.

### 9-2. 150ms Hover Debounce & Lazy-Load Architecture
* **API 호출 과부하 방지**: 아카이브 메인 진입 시 고용량의 전체 아티클 리스트를 한번에 가져오는 대신, 발행일 인덱스(`/api/daily/index`)만 가볍게 1회 페치합니다.
* **디바운싱 지연 로드 (Debounce Lazy Load)**:
  * 마우스가 활성 날짜를 스쳐 지나갈 때마다 API를 유발하지 않도록, `150ms` 디바운싱 타이머를 적용합니다.
  * 마우스 진입(`onMouseEnter`) 시 이전 타이머를 즉각 `clearTimeout`하고, `150ms` 동안 커서가 머물 때에만 백그라운드로 `/api/daily/{date}`를 호출하여 우측 퀵 피크 상세 정보를 동적 바인딩합니다.

### 9-3. 3-Tab Workstation Segmented & Ambient Morphing
상세 페이지(`/daily/{date}`)에서 IT Tech, AI Workstation, Language Dojo의 3개 워크스페이스를 즉각 스캔하기 위한 벨트 레이아웃입니다.
* **Segmented Belt**: `display: flex; gap: 16px; justify-content: center; width: 100%;`
* **벨트 버튼 인터랙션**: 호버 시 아이콘은 미세 회전(`rotate(3deg) scale(1.12)`), 액티브 상태 돌입 시 `translateY(-2px)`와 함께 개별 테마 컬러가 은은한 글로우로 번집니다.
* **백라이트 아우라 모핑 (Ambient Morphing Backdrop)**:
  * 컨테이너(`.daily-feed-container`) 뒷면에 `filter: blur(140px)`가 적용된 큰 가상 요소(`::before`)를 배치합니다.
  * 탭이 바뀔 때마다 테마의 대표광(대표 색상)을 배경 그라디언트로 부드럽게 페이드 전환시킵니다.
    * **IT Tech (Signal)**: 네뷸라 인디고 아우라 (`rgba(129, 140, 248, 0.08)`)
    * **AI Workstation (Prompt)**: 에테르 사이언 아우라 (`rgba(6, 182, 212, 0.08)`)
    * **Language Dojo (Japanese)**: 스타라이트 실버 아우라 (`rgba(241, 245, 249, 0.06)`)
  * 트랜지션 필터: `transition: background 0.8s cubic-bezier(0.25, 0.8, 0.25, 1), opacity 0.8s ease-in-out;`

### 9-4. 2-Stage Mobile Tap UX Flow (모바일 오터치 차단)
* **모바일 그리드 리플로우**: 768px 미만 미디어 쿼리 적용 시 데스크톱의 6:4 분할 그리드를 `grid-template-columns: 1fr` 세로 1열 종대로 전환합니다.
* **Accidental Navigation 방지**: 모바일 터치 실수로 상세 분석 페이지로 다이렉트 이탈하는 피로도를 해소하기 위해 2단계 검증 플로우를 적용합니다.
  1. **1단계 (1st Tap)**: 모바일에서 캘린더의 활성 날짜를 터치하면 이동하는 대신 하단의 **Quick Peek 요약 패널**에 데이터를 바인딩한 후, 해당 퀵 피크 위치로 `scrollIntoView({ behavior: 'smooth' })` 부드러운 스크롤을 시동합니다.
  2. **2단계 (2nd Tap)**: 퀵 피크 카드 내부에 강조 배치된 **"전체 콘텐츠 상세히 보기 →"** 액션 버튼을 2차 터치할 때 최종 상세 화면(`/daily/{date}`)으로 이송합니다.

---

### 9-5. ⛵ PaceNote Bento Weekly Calendar & Voyage Horizon (v2.6)

PaceNote 서비스(`/pacenote`)의 주차별(Weekly) 타임라인 운용 방식을 극대화하기 위해 설계된 **분기별 13주차 벤트 매트릭스(Chrono-Quarterly Bento Matrix)** 디자인 시스템 가이드라인입니다.

* **Chrono-Quarterly Bento Layout**: 1년 52주를 Gregorian 달 모양 대신, 분기별(Q1~Q4) **4개의 Bento 박스**로 시각화합니다. 한 분기는 정확히 **13주**로 매칭되므로 `4 x 3 + 1` 형태의 균일하고 미려한 Bento 격자 그리드를 유지합니다.
  * **데스크톱**: `display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px;` (Q1~Q4가 2x2 대칭 배치)
  * **모바일/태블릿**: `grid-template-columns: 1fr;`로 리플로우되어 세로 스택형 Bento 레이아웃 정렬.
* **주차별 셀 비주얼 상태 스펙 (Weekly Cell States)**:
  1. **과거 완료 주차 (Past Completed)**: 투명도 높은 글래스모피즘 스킨(`background: rgba(0, 0, 0, 0.25)`, `border: 1px solid rgba(255, 255, 255, 0.06)`). 해당 주차의 실시간 Task 달성도(완료한 테스크 / 총 테스크)에 비례한 하단 마이크로 게이지바(`cell-progress-fill`) 탑재.
  2. **현재 개척 주차 (Current Active)**: 사이버 사이언 네온 아우라 테두리(`#22D3EE`). 2초 주기로 테두리가 부드럽게 펄싱되는 외곽 글로우 애니메이션(`pulseAura`)과 중앙의 맥동 도트 인디케이터(`pulse-indicator`) 연동.
  3. **미래 대기 주차 (Future Locked)**: 딤드 처리(`opacity: 0.25`), 포인터 및 클릭 차단(`disabled`), 점선 테두리(`border-style: dashed`), 자물쇠 아이콘(`🔒`) 노출.
* **0-Lag Debounced Hover Peek (150ms)**:
  * 마우스 호버 시 `150ms` 동안 커서가 멈춘 경우에만 궤도 상세 요약 오버레이 패널(`weekly-hover-peek-panel`)을 부드럽게 슬라이드업(`peekSlideUp`) 시켜 렌더링 부하를 예방합니다.
* **CLS 방지 및 공간 정규화**:
  * 각 13주 격자 카드는 고정 높이(`height: 62px`)와 일정한 최소 높이를 확보하여, 주차가 갱신되거나 탐색할 때 레이아웃 시프트가 전혀 발생하지 않도록 공간을 보호합니다.

---

## 9. 📏 표준 컴포넌트 규격 & 제작 체크리스트 (Normative Specs & QA) — 🔒 규범

> 신규 페이지·섹션 제작 시 아래 규격을 그대로 사용합니다. 각 페이지 CSS에 흩어져 있던 암묵지를 명문화한 것으로, **이 규격과 다른 형식을 새로 발명하지 않습니다.** (실사례 환류: 2026-07 ReLearn 히어로·호버·여백 이탈)

### 9-1. 표준 서비스 히어로 (Service Hero)
- 구성 순서: **h1 타이틀 → 서브카피** (eyebrow·별도 영문 서브라인 등 추가 형식 금지)
- **🔴 [v5.24 개정 — 히어로 마크 전면 폐지]** 구 규격은 '**아이콘 → h1 → 서브카피**'의 3요소였고, 아이콘을 **이모지 `3rem` + `float 6s infinite` 부유 애니메이션**으로 못박았습니다. 이 조항을 **폐지**합니다.
  - **폐지 사유 ①(정보 중복)** — `📖` 위에 "Planner's View", `🛠` 위에 "Builder's Log", `🪐` 위에 날짜. **타이틀이 이미 말하는 것을 마크가 반복**했고, 더하는 정보가 없었습니다.
  - **폐지 사유 ②(규범이 AI 템플릿을 성문화함)** — '히어로 = 아이콘 + 큰 그라디언트 타이틀 + 2줄 리드 + 칩'은 [AI 패턴 감사](ai_pattern_audit.md) B5·B1이 지목한 템플릿 서명 그 자체입니다. 게다가 `float … infinite`는 D1(유휴 중 상시 구동)을 **요구사항으로** 박아둔 것이었습니다.
  - **폐지 사유 ③(마크 언어 ≠ UI 아이콘 언어)** — 이모지를 자작 SVG(§P2-7)로 바꿔보니, UI 컨트롤용 균일 스트로크를 44px로 키우면 '큰 UI 아이콘'으로 읽히고 브랜드 마크의 무게가 없었습니다. 지면마다 별도 마크를 제작하는 길은 **장식을 다시 들여오는 길**입니다.
  - **예외 없음** — 제품 은유가 강한 지면(Waymark 나침반)도 포함해 전부 제거했습니다. **예외가 드리프트의 시작점**이고, 일관성이 사용자에게 가장 좋은 답입니다(오너 결정 2026-11-01).
  - **[제품 자산도 예외 아님 — 2026-11-01 오너 결정]** 처음에는 제품의 **실제 앱 아이콘 이미지**(Sylphio `sylphio-icon.png`)를 '장식이 아닌 제품 식별 자산'으로 보아 예외로 두었습니다. **철회합니다.** 히어로 영역에는 **어떤 마크도 두지 않습니다** — 자작 SVG·이모지·제품 이미지 전부. 예외를 하나 허용하면 §9-1에 '단, …인 경우' 조항이 생기고 그것이 리비전 25회가 밟은 경로입니다. (부수 결과: P0-5에서 3중 복제를 통합해 만든 `styles/sylphio-shell.css`가 전 규칙 고아가 되어 파일을 삭제했습니다.)
  - **상세 히어로의 '제목 선두 이모지 아이콘 승격'(구 v5.21)도 함께 폐지** — 승격은 제목에서 이모지를 떼어내는 조작이었습니다. **[v6.3 후속 — 2026-11-01]** 당시 이 조항은 "마크가 없어진 지금은 제목에 그대로 두는 것이 작성자 의도에 맞다"로 끝났으나, 같은 날 **발행물 이모지 금지**가 정립되어 전제가 사라졌습니다. 이제 **제목에 이모지가 없습니다** — 승격할 대상도, 둘 대상도 없습니다. 정본: [builders-log/publishing_guide §6](../builders-log/publishing_guide.md) · [planners-view/content_guide §2-6](../planners-view/content_guide.md).
- 타이틀: `--font-display` / `--fs-display`(모바일 `--fs-4xl`) / 600(§P1-H5: 3rem에서 700은 과함) / `--gradient-brand` 텍스트 클립 · **`display: inline-block` 필수** — 그라디언트가 글자 폭에 맞춰 클립되도록 한다. 풀폭 블록(h1 기본)이면 텍스트가 넓은 그라디언트의 **중간색(lavender)만 샘플**해 gold가 사라진다(2026-08-26 Candela 환류). 강제 line-height 없이 본문 1.6 상속(rl-hero는 1.2 허용, 단 inline-block 전제)
- 서브카피: `--fs-md` / `--crystal-light` / lh 1.6 / opacity 0.9 · **`word-break: keep-all`·`overflow-wrap: break-word`**(CJK 단어 중간 줄바꿈 방지) · **`white-space: pre-line`**(언어팩 `\n` 줄바꿈 보존). **콘텐츠 규약: 1행=로케일별 핵심 한 문장 + 2행=로케일 불변 짧은 영문 태그라인**(예: Builder's Log "From first commit to launch.", Sylphio "Hear it once, read it instantly."). 장문 다문장 금지
- 상단 보정: 데스크톱 **140px** / 모바일 **120px** (GNB 높이 포함)
- 페이지 마운트 시 `body.hero-ready` 클래스 부여(GNB 노출 조건) 필수
- **🔴 [v5.25 — 제품 브랜드 예외 폐지]** 구 규격은 독립 제품 페이지(Sylphio)에 **타이틀 그라디언트에 한해** 제품 고유 팔레트를 허용했습니다. **폐지합니다.** 전 지면 히어로 타이틀은 **`--gradient-brand` 단일**입니다.
  - **폐지 사유** — 예외가 하나 열려 있자 실제로는 **3종**이 생겼습니다: ① 서비스 랜딩 4곳 `--gradient-brand` ② Sylphio 3곳 제품 사파이어(예외 조항이 허용) ③ **콘텐츠 상세 2곳 흰색→반투명 흰색**(어떤 조항도 허용하지 않은 제3의 변종). **예외 조항은 자기 범위를 지키지 않습니다** — 허용의 존재 자체가 이탈의 근거가 됩니다.
  - 구조(타이틀→서브, v5.24)·크기·웨이트·보정 수치는 종전과 같습니다.
  - **부수 교정(2026-11-01)**: Sylphio 3지면은 §9-1 v5.18 필수 `display: inline-block`이 **누락**돼 있어 짧은 타이틀이 풀폭 그라디언트의 중간 구간만 샘플해 **거의 단색으로** 렌더되고 있었습니다(오너 발견). 같은 위반을 블록 엘리먼트 3곳에서 더 찾아 교정했고, 이 결함 유형을 `ci/pattern-metrics.mjs`의 `gradient-text-no-inline` 지표로 **게이트화**했습니다 — 빌드가 절대 못 잡는 종류입니다.
- **[적용 범위 — v5.9]** 본 규격은 서비스 랜딩뿐 아니라 **콘텐츠 상세 페이지의 최상위 히어로에도 적용**됩니다(예: 리런 아카이브 상세 — `.rl-hero` 클래스 재사용으로 정합, Builder's Log 상세·Planner's View — v5.21 정합). **상세 히어로의 h1은 글 제목**입니다(v5.24: 선두 이모지의 아이콘 승격 폐지. v6.3: 발행물 이모지 금지로 **제목 자체에 이모지가 없습니다** — 승격도 보존도 성립하지 않습니다). 배지·날짜·태그 등 메타는 서브카피 **아래**에 둡니다(§9-1은 아이콘→h1→서브카피 위에 다른 형식을 얹는 것을 금지). 상세 특성상 히어로 아래 보조 요소(주간 달력·브레드크럼 등) 추가는 허용하되, 2요소 구조(v5.24)와 토큰 수치는 불변입니다. 축소 변형 헤더를 새로 발명하지 않습니다.
- **[가변 콘텐츠 타이틀 예외 — v5.13]** 히어로 타이틀이 **고정 라벨**(서비스명 등 텍스트 불변)이면 고정 토큰(`--fs-display`/모바일 `--fs-4xl`)을 씁니다. 그러나 타이틀이 **가변 길이 사용자 콘텐츠**(아티클 제목처럼 길이·언어·CJK/라틴 폭이 크게 변동)인 경우, 이산 2단 고정은 브레이크포인트 직상단에서 긴 제목이 뭉개지므로 **토큰 endpoint clamp**를 허용합니다: `font-size: clamp(var(--fs-하한), Nvw, var(--fs-상한))`. **조건**: ① 상·하한은 반드시 `--fs-*` 토큰(임의 rem/px 금지), ② 상한은 콘텐츠 특성에 맞춘 `--fs-*` 토큰으로 **대응 고정 히어로 이하** — 짧은 라벨성 제목은 히어로값(`--fs-display`)까지, **긴 편집형 제목(아티클 제목 등)은 여러 줄 래핑 시 과대해지므로 히어로보다 낮춥니다**(예: `--fs-4xl`), ③ clamp가 전 뷰포트 범위를 담당하므로 **별도 모바일 미디어쿼리 오버라이드를 중첩하지 않습니다**(이중 반응형 부채 금지). 예: Builder's Log 상세 타이틀 `clamp(var(--fs-2xl), 3vw, var(--fs-4xl))`(긴 편집형 제목). 이 예외는 **가변 길이 콘텐츠 타이틀에 한정**하며, 고정 라벨·섹션 타이틀·카드 헤더로 확대 적용하지 않습니다(드리프트 방지). `design-check`가 clamp 내부 비토큰 리터럴을 검출합니다 — **v5.17에서 선재 raw clamp 8곳을 전수 토큰화(endpoint를 `var(--fs-*)`로, 시각 무변경)하고 ERROR로 승격 완료**(v5.6 폰트 리터럴 WARN→ERROR 선례와 동일 단계). (v6.0에서 디스플레이 대역은 `--fs-3xl`/`--fs-4xl`/`--fs-display` 3단으로 통합됐습니다.) 이후 clamp에 비토큰 리터럴을 쓰면 빌드가 차단됩니다.

### 9-2. 섹션 타이틀
- 타이틀: `--font-display` / `--fs-2xl` / 500(§P1-H5: 위계는 크기로, 굵기는 양보) / `--text-primary`
- 설명(desc): `--fs-base` / `--text-secondary`(§P1-H5: 리드가 본문보다 작고 흐린 역전 해소)
- **[경계]** 본 규격은 **페이지 본문의 섹션 타이틀** 기준입니다. 카드·패널 내부 헤더(예: PaceNote 카드 헤더)는 `--fs-xl`(1.5rem)까지 허용하되 그 이상은 금지.

### 9-3. 카드 (Card)

**[핵심 정의] 내부 여백은 "실효 패딩(Effective Padding)" 기준** — 카드 루트뿐 아니라 **중첩 래퍼(예: `.signal-article-body`)의 패딩을 합산한 최종 값**으로 판정합니다. 루트 선언만 보고 통일 판정 금지. (실사례: 시그널 카드 루트 18px + 내부 body 24px = 실효 42px 이중 패딩)

**카드 2계층 규격**
| 계층 | 용도 | 실효 패딩 | radius | 표면(Surface) |
|------|------|----------|--------|---------------|
| **리스트형** | 반복 나열 카드 (트랙·시그널·어휘 등) | **18px** (8pt 공인 예외) | `--radius-md` | 배경 `rgba(255,255,255,0.015)` · 보더 `rgba(255,255,255,0.05)` · 그림자 `0 4px 30px rgba(0,0,0,0.25)` **통일** |
| **컨테이너형** | 채널 개성 카드 (터미널·어학 히어로 등 1개성 대형) | **24px** | `--radius-lg` | 고유 스킨 허용 (검정 터미널·그라데이션 등) |
| **미디어형** | 커버 이미지를 갖는 대형 카드 (`/daily` 시그널 등) | **24px** (body) | `--radius-md` | 3D Tilt(§6-3)·리치 호버(배경/그림자 변화) 허용 |
| **액센트형** | 챕터별 액센트 컬러 시스템 카드 (Builder's Log 목록) | 자체 규격 | `--radius-lg` | 액센트 기반 리치 호버 허용 — 일관된 자체 시스템으로 공인(2026-07-21 재감사, radius 실구현 정합 정정 2026-07-22) |

- 나란히 놓이는 **카드 그리드 gap: 14px** 통일
- 호버: **`translateY(-2px)` + `border-color: var(--glass-border-hover)`** 단일 규격.
  배경 변화·스케일 조합 금지, **기본 그림자는 유지**(`box-shadow: none` 강제로 그림자를 소멸시키지 말 것).
  **[스코프]** 이 단일 규격은 **텍스트 중심 콘텐츠 카드(리스트형)** 에 적용됩니다. 미디어형은 3D Tilt·리치 호버 허용, 버튼·탭·셀 등 비카드 인터랙션은 §2·§6 규격을 따릅니다.
- **키보드 패리티 (`:focus-visible` 미러링)**: 카드 전체가 단일 링크(래퍼 `<Link>`/`<a>`)인 카드는 호버 표면 피드백(보더·배경·그림자)을 `:focus-visible`에도 동일하게 미러링하고, 가시 포커스 링(`outline: 2px solid var(--color-indigo)` + `outline-offset: 2px`, ReLearn 선례)을 병행합니다. 리치 호버가 마우스 전용으로만 제공되는 격차 방지. (2026-07-22 규범화)
- 카드 외부 CTA·링크의 상단 여백: **14px** 통일

### 9-4. 알파 틴트 표준 단계 (Tint Scale)
색상 틴트는 아래 4단만 사용합니다: **0.045**(존/섹션 배경) · **0.06**(호버 배경) · **0.16**(비활성 보더) · **0.18**(활성 배경).
`rgba()` 하드코딩 시에도 알파는 이 단계만 허용.

### 9-5. 세로 액센트 단일 원칙
세로 강조선(레일·존 좌측 컬러바 등)이 존재하는 화면에서 **세로 라인은 1개만** 둡니다. (컬러바 + 레일 동시 사용 금지 — 시각 충돌)

### 9-6-0. 자동 집행 (Enforcement) — `ci/design-check.mjs`
- `npm run build` 시 **prebuild 게이트**로 자동 실행됩니다(Cloud Run 배포 파이프라인 포함 — 위반 시 빌드 차단).
- **ERROR(차단)**: ① 마이크로 밴드 `[0.66rem, 1.0rem)`의 비토큰 font-size 리터럴·동일 밴드 px ② **대역 `[880,2000]px`의 px `max-width` 리터럴**(§3-3 — `--container`/`--measure` 토큰만 허용) ③ **src JSX/JS 소스의 한국어 하드코딩**(i18n 게이트 — UI 문자열은 언어팩 `src/locales/{ko,en,ja}.json` + `t()`만 허용. t()의 조용한 ko 폴백 탓에 누락이 화면에서 안 보이던 문제의 재발 방지. 제외: 어드민·Sylphio 자체 사전 페이지·`categoryStyles` 매칭 키워드·`seoMeta`(SSR 계획 A 소관)·고아 컴포넌트, 주석·`console.*`. 의도적 예외는 해당 라인에 `i18n-ok` 마커 + 사유 필수).
- **WARN(비차단)**: 그 외 비토큰 리터럴(1.05·1.2·1.6·1.8rem 등 헤딩 계열, 0.55~0.65rem 장식 마이크로 라벨) — 아래 §9-7 백로그.
- **적용 제외**: 내부 어드민(`AdminDashboard.css`, `ServiceDocs.css`) — px 기반 별도 관례, 공개 서비스 규범 대상 아님.
- **한계**: 자동 체크는 font-size 리터럴만 검출합니다. **실효 패딩(중첩 합산)·표면 속성·그리드 gap은 정적 검출 불가** → §9-6 수동 Self-QA 필수 항목.

### 9-6. 신규 페이지 제작 체크리스트 (Self-QA)
- [ ] font-size가 전부 `--fs-*` 스케일 값인가 (px·임의 rem 없음)
- [ ] 히어로가 §9-1 표준 구성·수치와 일치하는가 (+`hero-ready`)
- [ ] 섹션 타이틀이 §9-2 규격인가
- [ ] 카드 **실효 패딩(중첩 래퍼 합산)** 이 계층 규격(리스트형 18px / 컨테이너형 24px)인가
- [ ] 카드 그리드 gap 14px·호버 단일 규격(**기본 그림자 유지**)·CTA 여백 14px인가
- [ ] JS로 주입하는 모션(3D 틸트 등)에 `prefers-reduced-motion` 가드가 있는가 (§6-3 — CSS 킬 스위치만으로는 불충분)
- [ ] 전체 링크 카드의 호버 피드백이 `:focus-visible`에 미러링되는가 (§9-3 키보드 패리티)
- [ ] 컨테이너는 `var(--container)`·장문 단은 `var(--measure)`인가 (§3-3 — 대역 px 리터럴 금지)
- [ ] 색상·간격·radius가 전부 토큰 참조인가 / 틴트 알파가 §9-4 단계인가
- [ ] 세로 강조선이 1개 이하인가
- [ ] 인접 독립 컨트롤 간격이 §9-8 하한(수직 16px·수평 8px) 이상이고 음수 마진 근접 배치가 없는가
- [ ] 컨테이너 radius가 `--radius-lg`인가(16px 비토큰 없음)·카테고리/강조색이 브랜드 4색·§1-4 시맨틱 토큰인가·JSX 인라인으로 폰트/색을 하드코딩하지 않았는가 (§9-10)
- [ ] 사용자 노출 문자열이 전부 언어팩(`t()`) 경유인가 — ko/en/ja 3종 키 동시 등재, 하드코딩 없음 (§9-6-0 ③)
- [ ] 위 항목에서 새 형식이 필요했다면 → **본 문서를 먼저 개정**했는가

### 9-7. 스케일 확장 백로그 (결정 대기)
~~구 백로그(2026-07-20)~~ → **2026-07-21 v5.6에서 일괄 해소**:
- ~~헤딩·디스플레이/마이크로/px~~ → 0.05 그리드 전면 등재·스냅·토큰화로 종결(비토큰 잔존 0, check 전 범위 ERROR)
- ~~PaceNote 히어로 3.5rem~~ → 페이지 삭제(리런 통합 Phase 3)로 소멸
- ~~호버 변형 정렬~~ → 재감사 결과: /daily·/pacenote 소멸로 주 표면 정리됨. 잔존 주요 카드(Builder's Log 챕터)는 **액센트형으로 §9-3 공인 등재** — 무질서가 아닌 일관 시스템으로 판정, 정렬 불필요

**잔여 백로그**: 없음. 신규 이탈은 design-check(전 범위)가 차단하며, 새 단계가 필요하면 본 문서 개정 + `index.css` 토큰 등재를 경유한다.

### 9-8. 인접 인터랙티브 컨트롤 간격 (Control Adjacency) — v5.8

서로 다른 기능의 **독립 인터랙티브 컨트롤**(필 버튼·토글·오디오 버튼 등)이 이웃할 때의 최소 간격 규범입니다. §3의 스페이싱 토큰 용례를 컨트롤 간 관계로 확정한 것으로, 카드 그리드 gap(§9-3 14px)과는 별개 규범입니다.

- **수직 적층**: 최소 **`--space-md`(16px)**. 크기·형태가 유사한 필 버튼이 세로로 붙으면 하나의 그룹으로 오인되고 답답한 밀집감을 만듭니다 (특히 우측 정렬 컨트롤끼리 — 예: 존 도구줄 '전체 펼치기' ↔ 어학 헤더 '전체 발음 듣기').
- **수평 나열**: 최소 **`--space-sm`(8px)**. 동일 그룹 내 세그먼트(모드 토글 등)는 예외적으로 0 허용(단일 컨트롤로 지각되는 경우).
- **음수 마진 금지**: 레이아웃 여백을 아끼려 음수 마진으로 컨트롤을 타 컨트롤·헤더에 근접 배치하지 않습니다. 여백이 부족하면 배치(행 통합·위치 이동)를 재설계합니다.
- **근거(QA 환류 2026-07-22)**: 아카이브 상세 존 도구줄이 `margin: -6px 0 4px`로 어학 헤더의 발음 버튼과 근접 적층 → 답답함 피드백. `--space-md` 하한으로 교정.

### 9-9. 상세 페이지 상단 내비 = 위치 경로 브레드크럼 (Detail Breadcrumb) — v5.10

콘텐츠 상세 페이지(섹션 목록 → 개별 항목)의 헤더 상단 내비는 **뒤로가기(`← {섹션명}`)가 아니라 위치 경로 브레드크럼**을 씁니다.

- **형식**: `{섹션명}(상위 링크) › {현재 구역}(비링크)`. 상위는 섹션 목록/홈으로 이동하는 `<Link>`, 현재 노드는 `aria-current="page"`인 비링크. 감싸는 `<nav aria-label="위치 경로">`.
- **현재 노드 라벨**: 바로 아래 h1(글 제목 등)과 중복되지 않는 **구역 제네릭 라벨**을 씁니다 (예: 리런 `아카이브`, Builder's Log `아티클`/`Article`). 다국어 페이지는 로케일 대응.
- **날짜/제목**: 브레드크럼에 넣지 않습니다 — 히어로 타이틀·메타가 담당하므로 2뎁스(`섹션 › 구역`)를 넘기지 않습니다.
- **[연재물 예외 — v5.23]** 글이 **시리즈에 속하는 경우**, 현재 노드에 제네릭 라벨(`아티클`) 대신 **시리즈명**을 씁니다(예: `Planner's View › 실행이 값싸진 시대`). h1(글 제목)과 중복되지 않으면서 위치 정보를 담고, 2뎁스 상한도 유지합니다. 시리즈에 속하지 않는 글은 종전대로 제네릭 라벨을 씁니다.
  - **3뎁스로 늘리지 않습니다**(`섹션 › 시리즈 › N편`). 브레드크럼의 중간 노드는 이동 가능한 상위여야 하는데, 시리즈 전용 URL이 없으면 비링크 중간 노드가 되어 브레드크럼 문법이 깨집니다. 시리즈 전용 앵커·라우트가 생기면 그때 재검토합니다.
  - **연재 위치(`N편`)는 히어로 메타의 배지**가 담당하고, 그 배지는 **비링크**로 둡니다. 시리즈 전용 지면이 없는데 배지에 링크를 걸면 '시리즈를 보여준다'는 어포던스가 전체 목록으로 착지해 약속이 깨집니다(2026-09-22 Planner's View 환류).
- **시각**: `--fs-sm` / muted 링크 + `›` 구분자(opacity 0.5) + secondary 현재 노드. 링크 hover는 섹션 포인트 컬러(리런 cyan, Builder's Log 챕터 액센트).
- **근거(QA 환류 2026-07-22)**: GNB에 해당 섹션이 이미 활성인 상세 화면에서 `← {섹션명}` 뒤로가기는 "그 섹션 안에 있는데 그 섹션으로 간다"는 **동어반복**을 유발(오너 피드백). 위치 경로형은 "지금 어디에 있는가"를 구조로 전달해 이를 해소하고, 상위 이동도 함께 제공합니다. 적용: `ReLearnDaily`(리런 아카이브)·`BuildersLogDetail`. 상세 하단의 문맥형 CTA(예: "다른 여정 살펴보기")는 별개로 유지 허용.

### 9-10. 색·틴트·radius 정합 규범 (v5.11)

리런 4채널 일관성 QA에서 드러난 산개를 규범화한 것으로, 반복 나열 콘텐츠·컨테이너 전반에 적용합니다.

- **컨테이너 radius = `--radius-lg`(24) 통일**: 중대형 패널·카드·도크·CTA 박스의 모서리는 `--radius-lg`. **비토큰 16px 재발명 금지**(소형 요소·탭·통계칩은 `--radius-md`). 이전 16px 산개(패널/도크/카드/리포트가 12·16·24로 분열)를 종식. `var(--radius-md, 16px)`처럼 **폴백값을 토큰과 다르게 두는 것도 금지**(md=12이므로 16 폴백은 결함).
- **§9-4 알파 적용 범위 명확화**: 4단(0.045/0.06/0.16/0.18)은 **정적 배경 틴트(0.045)·강조 배지 배경 및 호버 배경(0.06)·비활성 보더(0.16)·활성 배경(0.18)**에 적용합니다. 활성 보더·포커스 링·리치 호버의 강조 알파는 **색만 브랜드 정합**하고 알파는 관용(4단 밖 허용). 무채색 재질(`rgba(255,255,255,x)`)은 §9-4 대상이 아닙니다(HIG material 위계).
- **카테고리·강조색 = 브랜드 4색 그룹**: 정보 카테고리(시그널 칩 등)는 쨍한 tailwind 다색(emerald/amber/blue/red)이 아니라 브랜드 4색(cyan/indigo/gold/lavender)으로 **그룹핑**합니다(v5.0 천체 테마 절제). '추천 강조'(DM Pick 등)는 브랜드 메인 **gold**로 통일하고, 성공/오류/별점은 §1-4 시맨틱 토큰을 씁니다. 오프팔레트 hex 하드코딩 금지.
- **JSX 인라인 스타일 금지**: 컴포넌트 마크업의 `style={{}}`로 **폰트 크기·색·레이아웃을 하드코딩하지 않습니다.** `--fs-*`·색 토큰을 CSS 클래스로 적용합니다. `ci/design-check.mjs`가 CSS만 스캔하는 사각을 인라인이 우회하던 문제의 재발 방지(SignalArticleCard `fontSize:'0.85rem'` 환류). 카테고리처럼 **동적 색**이 불가피하면 헬퍼가 토큰 기반 값을 반환하게 합니다(`categoryStyles.js`).
- **CTA는 §2 의미론적 클래스 지향**: 신규 CTA는 `.btn-primary/.btn-secondary/.btn-glow`를 사용합니다. 기존 문맥 버튼(골드 로그인·그라디언트 궤도)은 즉시 교체하지 않되 **radius-pill·active scale·§9-4 알파 규격은 준수**합니다(문맥 색·배경 알파 정합). 완전 클래스 이관은 시각 회귀 검증을 동반한 별도 배치로.

> **근거(QA 환류 2026-08-04)**: 리런 4채널이 트랙(리스트형)·시그널(미디어형)·프롬프트(터미널)·일본어(히어로)로 표면이 어긋나고, 컨테이너 radius가 16px 비토큰으로 산개하며, DM Pick 에메랄드·카테고리 다색·상태 hex가 브랜드 팔레트를 이탈했다. 시그널을 리스트형으로 통일하고 위 규범으로 정합.

### 9-11. 문서형 페이지 레이아웃 (Document Page Layout) — v5.15

장문 프로스 중심의 **문서형 페이지**(아티클 상세·정책·가이드 등)는 아래 단일 패턴을 따릅니다. "가독 폭(860)은 지키되 1200 셸을 다 쓴다"는 §3-3 폭 체계의 문서형 적용 규범입니다.

- **2단 레이아웃**: 페이지 셸은 `--container`(1200) 전폭. 그 안을 **본문 프로스(좌, `--measure` 860 좌측 정렬) + 목차 사이드바(우, ~300)** 로 분할합니다(860 + gap 40 + 300 = 1200). 프로스만 가독 단으로 제한하는 §3-3 규칙 2의 구현.
- **상단 내비는 전폭**: 브레드크럼(§9-9)·서브내비 등은 셸 전폭(1200)에 두고 프로스 단에 가두지 않습니다.
- **목차 사이드바(TOC)**:
  - 본문 섹션(H2/H3 또는 섹션 배열)에서 생성하고 각 섹션에 `id` 부여. `IntersectionObserver` 스크롤스파이로 현재 섹션을 섹션 포인트 컬러로 활성화.
  - `position: sticky`(그 페이지의 상단 고정 바 아래 오프셋 — GNB, 있으면 서브내비 합산)로 스크롤 내내 따라오게 합니다. **조상에 `overflow: hidden`이 있으면 sticky가 무력화되므로 `overflow-x: clip`으로 대체**(세로 visible 유지).
  - 앵커 점프 시 헤딩이 고정 바에 가리지 않도록 대상에 `scroll-margin-top`(고정 바 높이).
  - 목차는 **이 글의 내용 탐색이 주(主)**입니다. 다른 글 목록은 몰입 독서를 흩뜨리므로 사이드바 주력으로 두지 않고, 교차 탐색은 본문 하단 CTA로 분리(부, 副).
- **반응형 붕괴**: 사이드바가 안 들어가는 폭(≈`1100px` 이하)에서 사이드바를 숨기고 본문을 `--measure` **중앙 복귀**시킵니다.
- **플랫 프로스 — 중첩 라운드 박스 지양**: 본문을 큰 유리 박스로 감싸거나 **박스 안 박스를 반복하지 않습니다**(container→section→card→item 식 다단 중첩 금지). 구조는 **타이포·여백·구분선(디바이더)** 으로 만들고, 박스는 **의미적 콜아웃(경고·안내 등)에 한해 단일 레벨**로만 씁니다. 배지·번호 원형 등 소형 액센트는 허용.
- **[하단 크로스 내비 — v5.20, v5.22 보강]** 사이드바는 ≈1100px 이하에서 숨겨집니다. 따라서 **사이드바가 유일한 교차 탐색 수단인 화면**에서는 본문 하단 카드 스트립을 상시 배치합니다(목록 없는 뷰 중심 IA가 대표 사례). 목록 페이지가 있더라도 **연재물처럼 글 사이 순서가 있는 콘텐츠**는 하단 이전/다음 내비를 상시 배치합니다 — 모바일에서 순서 이동 수단이 사라지기 때문입니다(Planner's View 시리즈 내비). 순서가 없는 독립 글 목록(Builder's Log)에서는 종전대로 하단 CTA가 선택입니다.
- **적용 사례**: `BuildersLogDetail`([builders-log/ui_specification §6](../builders-log/ui_specification.md)), `PlannersView`([planners-view/publishing_guide](../planners-view/publishing_guide.md)), `SylphioApiKeyGuide`·`SylphioPrivacy`.

> **근거(QA 환류 2026-08-05)**: 문서형 페이지들이 셸 1200인데 헤더·본문·푸터를 모두 860으로 묶어 지면이 좁아 보였고(오너 지적), 가이드는 container→section→pricing-card→pricing-item 4단 중첩 박스로 시각적 답답함이 있었다. 본 패턴으로 3개 페이지를 정합.

### 9-12. 커스텀 스크롤바 (Scrollbar) — v5.16

내부 스크롤 컨테이너·페이지 전반의 스크롤바는 브라우저 기본(두꺼운 회색)이 아니라 **얇고 세련된 다크 테마 스크롤바**로 전역 통일합니다(`index.css` 전역 `*` 규칙).

- **규격**: `width/height 8px`, thumb `rgba(255,255,255,0.12)`(hover 0.22) · `--radius-pill` · `border: 2px solid transparent` + `background-clip: padding-box`(실 두께 ≈4px + 좌우 여백으로 슬림) · track 투명. Firefox는 `scrollbar-width: thin` + `scrollbar-color`.
- **전역 적용**: `*` 셀렉터로 전 스크롤 컨테이너 일괄 — 리런 일기장 도크·빌더스로그 상세 목차(§9-11)·실피오 가이드/개인정보 등. 특수 목적 개별 커스텀(가로 탭 스크롤 숨김 `::-webkit-scrollbar { display: none }` 등)은 더 구체적 셀렉터로 override 유지.
- **근거(QA 환류 2026-08-05)**: 스크롤 컨테이너마다 스크롤바가 제각각(일부 커스텀·일부 브라우저 기본)이라 룩이 어긋났다. 전역 규칙으로 일괄 통일.

---

*최종 업데이트: 2026-09-22 (v5.23 §9-9 연재물 브레드크럼 예외 — 시리즈명 현재 노드·비링크 배지)*
### 9-13. 장식 예산 (Decoration Budget) — 🔒 규범(Normative) · 신설 v6.0

**[신설 사유 — 이 문서가 두꺼워진 이유]** 본 문서의 리비전 25건 중 24건이 *"QA 환류"* 로 조항을 **추가**했고, 조항은 `§9-12`까지, 폰트 토큰은 35단까지 자랐습니다. 그런데 [AI 패턴 감사](ai_pattern_audit.md) §2-8이 측정한 결과 **집행되던 디자인 차원은 `font-size` 1개**였고, 그 1개의 허용값이 35종이었습니다.

> **규범이 두꺼워지는 속도가 실제 품질 개선 속도를 추월했습니다.**

조항은 사람이 기억해야 집행되지만 **개수는 기계가 셉니다.** 그래서 본 절은 조항이 아니라 **예산**입니다. 정본은 [`ci/pattern-budget.json`](../../ci/pattern-budget.json)이고 `prebuild`가 집행합니다.

**[집행 방식 — 래칫(ratchet)]** 목표값으로 임계를 걸면 당장 빌드가 깨지고, 현재값으로 걸면 아무것도 개선되지 않습니다. 그래서 **단조 감소만 허용**합니다.

| 상황 | 결과 |
| :--- | :--- |
| 현재값 > 기준선 | **빌드 차단** (재유입 방지) |
| 현재값 < 기준선 | PASS + 조이기 안내 (`npm run budget:tighten`) |
| 현재값 = 기준선 | PASS |

즉 **"더 나빠질 수는 없고, 좋아지면 그 자리가 새 바닥이 된다."**

**[⚠️ 비율 지표는 래칫 대상이 아님]** 분모가 줄면 비율은 오릅니다. 실제로 죽은 CSS 876줄을 지웠을 때 `weight-bold-pct`가 65→66이 되어 **'나빠진 것이 없는데' 빌드가 막혔습니다**(2026-11-01). **래칫이 정리 작업을 처벌하는** 구조였습니다. 비율은 `informational`로 분리해 보고만 하고, 집행이 필요한 병리는 **절대 개수**로 표현합니다(굵기 → `weight-700plus: 0`).

**[하드 규칙 — 0 유지, 래칫 아님]**

| 규칙 | 숨겼던 결함 |
| :--- | :--- |
| `keyframes-duplicate` | 키프레임은 **전역 스코프** — 마지막 선언이 전역을 덮는 조용한 사고 |
| `maxwidth-band-violation` | §3-3 금지대역[880,2000]px |
| `phantom-font` | `index.html`이 요청하지 않는 웹폰트 참조(로드 후 폐기·조용한 폴백) |
| `undeclared-token-ref` | 폴백 없이 미선언 토큰 참조 → **선언 전체가 무효화**(Footer 브랜드 폰트 유실·BuildersLog 전이 미동작) |
| `dead-var-fallback` | 선언 토큰에 폴백 → **모순 문서화**(실측 117건이 토큰 실제값과 불일치) |
| `orphan-keyframes` | 애니메이션 제거 후 남는 죽은 코드 |
| `weight-700plus` | 700 이상 금지(§4-3) |
| `btn-raw-padding` | 버튼 생값 패딩(§4-4) |

**[주요 예산 — 래칫]** gradient-text(파일당 최다 포함) · radial-gradient · backdrop-filter · `infinite-ungated` · keyframes 총량 · `!important` · opacity 텍스트 · radius/gap/tracking/leading/weight 고유값 · uppercase · 생hex · breakpoint · 인라인 style · 이모지 · `cursor: pointer` · `gradient-text-no-inline` · `duplicate-selector`.

**[지표 설계 원칙 — 세 번 틀린 뒤 얻은 것]**
1. **총량이 아니라 병리를 센다.** `infinite` 총량은 지표가 아니다 — 호버·열림·로딩 **상태 게이트**가 붙은 애니메이션은 유휴 중 돌지 않으므로 비용이 0이다. 목업이 호버 때 살아나는 것은 **기능**이다 → `infinite-ungated`로 교체.
2. **목표값을 추정하지 않는다.** `weight-bold-pct ≤40%`·`align-center-pct ≤35%`·`gap-unique 6`·`radius-unique 5`는 전부 근거 없는 추정이었고, 역할 전수 분류 후 실측값으로 정정했다. 숫자를 쫓으면 디자인을 망친다.
3. **허용 목록이 넓으면 게이트는 통과 도장만 찍는다.** `font-size` 허용값을 35→11로 좁히자, 구 토큰 값과 우연히 일치해서 통과하던 `clamp()` 내부 생리터럴 10건이 드러났다 — §9-1 v5.13이 ERROR로 집행하고 있었는데도.

**[본 절 이후의 규범 변경 원칙]** 새 조항을 추가하는 대신 ① **기존 조항을 교체**하거나 ② **예산 지표를 신설**하십시오. 조항 추가는 지금까지 25회 했고, 그 결과가 개편 전 상태였습니다.

---

### 9-14. 제품 카드 규격 (Product Card) — 🔒 규범(Normative) · 신설 v6.5

홈 `Proof of Work`의 제품 카드입니다. **모든 제품을 동등하게 둡니다** — 서비스 간 우선순위를
매길 수 없다는 오너 결정(2026-11-02)이 이 절의 전제입니다.

**정보 3단위 — 고정**

| 단위 | 내용 | 비고 |
|---|---|---|
| 제품명 | `h3` · `--fs-lg` · 600 | 식별의 핵심 |
| 한 줄 요약 | `--fs-base` · 1행 | "무엇인가"만. 상세는 제품 지면이 맡는다 |
| 태그 | **2개 고정** | 분류 신호. 개수를 제품마다 달리 두지 않는다 |

**카드 자체가 링크입니다** — 카드 안에 별도 CTA 버튼을 두지 않습니다(오너 결정 2026-11-02).
버튼을 두면 **클릭 대상이 둘**이 되어 "카드와 버튼 중 어디를 누르나"라는 질문이 생기고,
정보 단위가 하나 늘어납니다. 어포던스는 **우측 하단 화살표**가 맡습니다.

- 화살표는 **버튼이 아닙니다** — 배경·보더를 주지 않습니다. 버튼처럼 보이면 같은 질문이 돌아옵니다.
  호버·포커스에서 액센트 색으로 바뀌며 진행 방향으로 3px 움직여 "누르면 간다"를 모션으로 말합니다.
- **접근명에 제품명을 포함합니다** — `aria-label="Planner's View — 기획자의 시선 읽기"`.
  보이는 텍스트(제품명)가 접근명에 들어가지 않으면 **WCAG 2.5.3(Label in Name) 위반**입니다.
  `aria-label`이 없으면 접근명이 `제품명 + 요약 + 태그` 전체로 길어집니다.
  CTA 문구는 버튼이 사라진 뒤에도 **여기서 계속 쓰입니다**.
- 포커스 링은 `index.css`의 전역 `:focus-visible` 시스템이 담당합니다 — 카드에서 덮지 않습니다.

- **이 3단위에 더하지 않습니다.** 구 구조는 서술태그·영문라벨·설명 2~3행·태그 3~4개·CTA·
  전용 CSS 아트·캡션의 **7단위**였고, 같은 위계로 5번 반복돼 무엇을 먼저 볼지 신호가 없었습니다.
  제품마다 "이것만 하나 더"가 붙어 7단위가 된 경로를 이 조항이 끊습니다.
- **제품 식별은 색으로 한 번만** 말합니다 — 카드 상단 2px 액센트 선. 구 구조는 라벨·태그·
  CTA·아트에서 같은 말을 네 번 했습니다.
- **액센트 마크는 아이콘 1개**(`components/common/Icon` 세트). 제품당 전용 CSS 아트를
  만들지 않습니다 — 구 구조의 아트는 `WorkSection.css` 1,105줄 중 **918줄(83%)** 이었고,
  2026-11-01에 그 중 **12개 규칙이 `:hover` 뒤에 갇혀 평상시 기하를 잃은 상태**로
  전 게이트를 통과했습니다(오너 육안 발견). 제품당 수작업 아트는 **비용과 결함이 함께 선형으로** 늡니다.

**레이아웃**

- `grid-template-columns: repeat(auto-fit, minmax(300px, 1fr))` — 데스크톱 2열, 좁아지면 스스로 1열.
- **홀수 개일 때 마지막 행의 빈 칸은 그대로 둡니다.** 마지막 카드만 넓히는 변종을 만들면
  '모든 제품을 동등하게'라는 전제가 깨집니다.
- **`foot`은 모바일에서도 가로를 유지합니다.** 세로로 꺾으면 화살표가 좌측으로 가
  '우측 하단 어포던스'라는 약속이 깨집니다.
- **모바일은 세로 1축입니다.** 가로 캐러셀(`overflow-x` · `scroll-snap-type` · 숨긴 스크롤바)을
  쓰지 않습니다. 구 구조는 스냅 캐러셀이면서 스크롤바를 양쪽 다 숨겨 **스와이프 표식이 0개**였고,
  `column-reverse`로 카드가 뷰포트보다 높아 **CTA를 보려면 세로로 내려야 하는데 컨테이너는
  가로로 스냅**했습니다(오너 "기이현상" 제보). 압축 카드는 한 화면에 들어오므로 캐러셀이 필요 없습니다.
- **스크롤 스포트라이트를 쓰지 않습니다.** 비활성 카드를 `opacity` + `blur()`로 흐리면
  제품을 비교하려는 동작과 충돌합니다.

**모션 — 내용이 요구하는 것만 둔다**

> **스크롤 연동 모션을 쓰지 않습니다.** 통일감은 **같은 어휘**(이징·길이·리프트 토큰)로
> 확보하고, 같은 **장치**를 복제하지 않습니다.

[결정 경로 — 2026-11-03] 처음에는 Journey·Belief의 스크롤 연동 강약을 복제해
"아이덴티티 통일"을 시도했습니다. 오너 판정은 **"억지"** 였고, 측정이 그 판정을 뒷받침했습니다:

| 섹션 | duration 토큰 | ease 토큰 | 생값 전이 |
|---|---|---|---|
| Hero | — | ✅ | **16건** |
| Belief | — | — | **4건** |
| Journey | ✅ | ✅ | **8건** |
| Connect | — | — | **1건** |
| **Work** | ✅ | ✅ | **0건** |

**복제할 정본이 없었습니다.** 다른 섹션은 각자 생값으로 제각각 만들어진 상태였고,
그중 하나를 골라 입힌 것이 억지의 원인입니다. 그리고 **Work만 생값 0** — 이 섹션이
유일하게 토큰 규범을 지키므로 모방 대상이 아니라 **기준**입니다.

**왜 이 지면에는 뜻이 없는가**

- Journey의 '선이 그려짐'은 **연대기**라는 내용이 요구하는 장치입니다.
- Belief의 스포트라이트는 **하나를 읽게** 하려는 장치입니다(그래서 나머지를 흐립니다).
- 이 지면은 **동등한 5개를 훑어 비교하는 색인**입니다. 선이 차오르는 것은 뜻이 없어
  **의미를 입은 장식**이 되고, 중앙 행을 강조하면 **사용자의 훑기와 경쟁**합니다.
  색인은 눈을 끄는 게 아니라 **비켜줘야** 합니다.
- **"어느 것을 보고 있나"에 답하는 것은 스크롤 위치가 아니라 포인터·포커스**입니다.

**그래서 투자는 상호작용에 둡니다** — 호버·포커스·누름. 사용자가 실제로 물은 질문에
답하고, 자율 재생이 아니라 **사용자가 구동**하며, **매 방문** 쓰입니다. 등장은 한 번 보고 끝입니다.
누름은 `index.css`의 전역 haptic(`a:active`)이 이미 담당합니다.

**등장 스태거를 쓰지 않습니다.** 우선순위를 매길 수 없는 집합에 0.1초씩 간격을 두면
**없는 순서를 모션이 만듭니다** — 동등함을 말해야 하는 자리에서. 같은 행은 함께 올라오고,
행은 도착할 때 올라옵니다(설계된 순서가 아니라 스크롤의 결과입니다).

**별똥별(`data-accent-color`)도 쓰지 않습니다.** 재편 전 카드에는 있었지만, 계층을
실측하니 `StarField` 캔버스가 `z-index: 0`이고 카드는 `z-index: 3` 레이어의 **24px 블러 +
75% 불투명 유리 뒤**라 효과가 거의 없었습니다. 되살리면 `WorkSection → window 이벤트 →
StarField` **전역 결합**과 제품 수만큼 늘어나는 혜성만 남습니다.

**Canvas 모션은 전역 감쇠 규칙이 못 막습니다.** `index.css`의 `prefers-reduced-motion`은
CSS 애니메이션·전이만 덮습니다. 캔버스에 직접 그리는 모션은 **JS에서 `matchMedia`로 가드**해야
합니다(`StarField`의 별똥별 핸들러에 2026-11-03 추가 — 이 이벤트를 쓰는 Journey·Belief·Connect
세 섹션에 함께 효력).

**상태별로 `transition-duration`을 덮지 않습니다.** `transform`이 등장·호버에 모두 쓰이므로
한 상태에서 길이를 덮으면 **등장이 함께 짧아집니다**(2026-11-03 자가 교정). 상태는
`--lift` 커스텀 프로퍼티만 바꾸고, 길이는 속성별로 한 번만 정합니다.

**등장 모션 — 카드별 도착 발화**

- **섹션 단위 1회 발화를 쓰지 않습니다.** 섹션이 756px이면 발화 시점에 카드 전체가 이미
  화면에 있어 **사용자가 시선을 두기 전에 끝납니다**. 모션이 있는데 없는 것처럼 보입니다
  (2026-11-03 오너 제보 → 실측 확인). 각 카드가 **도착할 때** 개별 발화합니다.
- 진폭 `translateY(36px)`. Journey 마일스톤(40px)에 준합니다 — 카드가 168px로 짧아
  28px에서는 체감이 약했습니다.
- **발화 지점이 인지의 가장 큰 변수입니다.** `threshold: 0.25` · `rootMargin: 0 0 -22% 0`로
  뷰포트 하단 22%를 비웁니다. 구 설정(`.2` · `-40px`)은 **화면 아래 8%** 에서 발화해
  168px 카드가 0.6초에 끝나며 시선이 닿기 전에 종료됐습니다. Journey는 같은 threshold라도
  카드가 380px이라 애니메이션 동안 화면을 가로지릅니다 — **짧은 카드는 더 안쪽에서**
  발화시켜야 같은 체감이 납니다.
- **열 지연은 `:nth-child`가 맡습니다** — 인덱스로 행을 계산하면 `auto-fit`으로 열 수가
  바뀌는 모바일에서 틀립니다. 2열에서 오른쪽 칸만 한 박자(0.08s) 늦어 **읽는 순서를 모션이 따릅니다.**
- **별똥별(`data-accent-color`)을 쓰지 않습니다.** 재편 전 카드에는 있었지만, 계층을 실측하니
  `StarField` 캔버스가 `z-index: 0`이고 카드는 `z-index: 3` 레이어의 **24px 블러 + 75% 불투명
  유리 뒤**라 효과가 거의 없었습니다. 되살리면 `WorkSection → window 이벤트 → StarField`
  **전역 결합**과 제품 수만큼 늘어나는 혜성만 남습니다 — "조잡하지 않게"와 충돌합니다.
- **누름 피드백은 새로 만들지 않습니다.** 카드가 `<a>`이므로 `index.css`의 전역 haptic 규칙
  (`a:active` → `scale(0.97)` · 70ms)이 이미 적용되고, 모바일 탭에서도 작동합니다.
- **Canvas 모션은 전역 감쇠 규칙이 못 막습니다.** `index.css`의 `prefers-reduced-motion`은
  CSS 애니메이션·전이만 덮습니다. 캔버스에 직접 그리는 모션은 **JS에서 `matchMedia`로 가드**해야
  합니다(`StarField`의 별똥별 핸들러에 2026-11-03 추가 — 이 이벤트를 쓰는 Journey·Belief·Connect
  세 섹션에 함께 효력).

**제품 추가 절차** — `WorkSection.jsx`의 `PRODUCTS` 배열에 **1항목**입니다.
아이콘 이름 1개 + 액센트 토큰 + 경로, 그리고 로케일 3종에 요약 1행·태그 2개·CTA 1행
(CTA는 화면에 보이지 않고 **카드 링크의 접근명**으로 쓰입니다).
그 외에 카드에 무엇을 더하려면 **본 절을 개정해야** 합니다.
