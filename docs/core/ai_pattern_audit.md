---
status: active
domain: Core
last_updated: 2026-11-01
version: v1.3
target_files:
  - src/styles/index.css
  - src/pages/WaymarkLanding.jsx
  - src/pages/SylphioLanding.jsx
  - src/pages/Home.jsx
  - src/components/work/WorkSection.css
  - src/components/layout/Header.css
  - ci/design-check.mjs
  - index.html
---

# AI 생성 디자인 패턴 감사 (AI Pattern Audit)

## Revision History

| Version | Date | Description | Impact Area |
| :--- | :--- | :--- | :--- |
| v1.3 | 2026-11-01 | **그라디언트 텍스트 수치 정정(완화)** — 측정기가 `-webkit-background-clip`과 `background-clip`을 각각 세어 **규칙 수의 2배**로 보고하고 있었다. 실제는 **31개 규칙 / 21개 파일**이고 **대부분 파일이 히어로 h1 1곳으로 이미 절제**되어 있다(초과분 약 10곳). A4 판정을 '심각'에서 '부분 이탈'로 하향 | §1 A4·§2-1 |
| v1.2 | 2026-11-01 | **결정 반영** — D-1(세리프 폐지)·D-3(커서 홈 한정)·D-5(다크 전용 유지) 확정에 따라 A1·C2·D4 항목에 처리 결과·의도 여부를 주기. A1 다크 퍼스트는 **결함이 아니라 의도된 선택**으로 재분류 | §1 A1·§2-1·§2-3·§2-4 |
| v1.1 | 2026-11-01 | **실측값 정정 + 측정 권위 이관** — 손 grep 기반 초기 수치 13건을 `ci/pattern-metrics.mjs`(주석 제외·값 분해·절단 없음) 재측정값으로 교체. 주요 정정: backdrop-filter 69→**89**(파일 목록 `head -15` 절단 합산 오류), border-radius 19→**33종**·gap 19→**37종**(다중값 분해 기준), breakpoint 20종+→**11종**(§완화 정정), font-weight 600+ 74%→**80%**, `'Outfit'` 3곳→**9곳**. 정성 결론은 불변(대부분 더 악화) | 본 문서 §2 |
| v1.0 | 2026-11-01 | **최초 정본화** — 바이브코딩 수렴 패턴 8계층(A~H) 분류 체계 수립 + 전 CSS 30개·JSX 45개 전수 실측 진단. 버튼·라운드·텍스트 배치 계층(G·H) 신설 조사 포함 | 전 프런트엔드 |

> **문서 성격**: 본 문서는 **진단 정본(SSOT)** 입니다. "무엇이 AI 티인가"의 분류 체계와 "현재 어디에 얼마나 있는가"의 실측값만 담습니다.
> **개선 실행**은 [AI 패턴 개선 계획서](ai_pattern_remediation_plan.md)가 정본이며, 진척 관리도 그쪽에서 합니다.
> **규범 제정**은 [디자인 시스템](design_system.md)이 정본입니다. 본 문서는 규범을 만들지 않고, 규범의 공백을 가리킵니다.

---

## 0. 핵심 명제

> **v5.0 개정은 AI 티를 "색"에서 제거했으나, AI 티의 본체는 색이 아니다.**
> 본체는 **① 재질 조합 · ② 구성 공식 · ③ 장식 밀도 · ④ 컨트롤 기하(geometry)** 네 가지이며, 이 넷은 v5.0 이후에도 전량 보존되어 있다.

AI가 UI를 생성할 때 특정 패턴으로 수렴하는 구조적 이유는 세 가지입니다.

1. **학습 분포의 편향** — 2021~2024년 SaaS 랜딩페이지가 데이터를 지배합니다. 그 시기의 지배적 미학(다크 + 글래스 + 글로우 + 그라디언트 텍스트)이 기본값으로 각인됩니다.
2. **평가 지평의 단축** — 생성물은 "스크린샷 한 장에서 그럴듯한가"로 암묵 평가됩니다. "10분 읽을 때 피곤하지 않은가"는 평가 신호에 들어오지 않습니다. 장식은 1초에 보이고, 위계는 1분 뒤에 느껴집니다.
3. **국소 생성의 경제학** — 생성 단위가 파일·섹션이므로 **재사용보다 재발명이 쌉니다.** 형제 파일을 복사하는 것이 공통 모듈을 설계하는 것보다 토큰이 적게 듭니다. 이것이 패턴 중복·값 난립의 기계적 원인입니다.

이 세 힘은 **장식을 과잉 생산하고, 체계를 과소 생산합니다.** 아래 8계층은 그 결과물의 분류입니다.

---

## 1. 패턴 분류 체계 (8계층 A~H)

### A. 재질(Material) 계층 — 가장 강한 식별자

| # | 패턴 | 전형 증상 |
| :--- | :--- | :--- |
| A1 | 다크 퍼스트 / OLED 블랙 | `#0A0A0A`·`#020205` 기조, 라이트 모드 부재 — **프리신세라는 D-5(2026-11-01)로 다크 전용을 의도적으로 선택**했다. 천체 아이덴티티와 결합돼 있어 이 항목은 결함이 아니라 **기록된 선택**이다 |
| A2 | 글래스모피즘 전면화 | `backdrop-filter: blur()` + `rgba(255,255,255,0.05)` 1px 보더가 **모든** 표면에 |
| A3 | 글로우·오라·블롭 | `radial-gradient(circle, …, transparent)` + `filter: blur()` 장식구를 섹션마다 배치 |
| A4 | 그라디언트 텍스트 헤딩 | `background-clip: text` + `-webkit-text-fill-color: transparent` — **프리신세라는 부분 이탈**(31규칙/21파일, 다수가 h1 1곳). 초과 약 10곳 |
| A5 | 호버 부유 3종 세트 | `translateY(-Npx)` + `box-shadow` 확대 + 보더 색 전환 |
| A6 | 알파 적층 과다 | 반투명 위에 반투명을 얹어 **실효 대비를 계산 불가 상태**로 만듦 |

> **판별 기준은 존재가 아니라 분포입니다.** Linear도 다크·글래스·글로우를 씁니다. 다만 글로우를 **한 화면에 하나** 둡니다(이것이 "Intentional Glow"의 실제 내용입니다). AI는 모든 요소에 균등 분배합니다. **강조가 보편화되면 강조가 아닙니다.**

### B. 구성(Composition) 계층

| # | 패턴 | 설명 |
| :--- | :--- | :--- |
| B1 | 섹션 공식의 기계적 반복 | `eyebrow → 큰 타이틀 → 1~2줄 리드 → 그리드`를 전 섹션에 동일 적용 |
| B2 | 3·4·6개 피처 카드 그리드 | 아이콘 + 제목 + 2줄 설명. 개수가 거의 항상 3·4·6 |
| B3 | N단 스테퍼 | `01 02 03 04` + 노드 아이콘 + 짧은 설명 |
| B4 | 닫는 CTA 카드 | 페이지 끝 중앙 박스 + 버튼 1개 + 작은 안심 문구 |
| B5 | 히어로 칩·배지 | 타이틀 주변 pill("Now in beta"), 점 애니메이션 동반 |
| B6 | 벤토 그리드 | 비대칭 타일. **콘텐츠 양과 무관하게 레이아웃이 먼저 결정됨** |
| B7 | 모든 것이 카드 | 산문까지 라운드 박스에 담아 중첩 박스 발생 |
| B8 | 근거 없는 스탯 타일 | `10x / 99.9% / 24/7` 3열 |
| B9 | 중앙 정렬 과다 | 좌측 리딩이어야 할 본문까지 중앙 정렬 |

> **B1이 가장 교정하기 어렵습니다.** 공식이 나쁜 게 아니라 공식이 **유일**한 것이 문제입니다. 섹션 5개가 같은 리듬이면 독자는 세 번째부터 스캔을 멈춥니다. 좋은 랜딩은 섹션마다 **형식 자체를 바꿉니다**(산문 → 비교표 → 스크린샷 → 인용 → 리스트).

### C. 타이포그래피 계층

| # | 패턴 | 설명 |
| :--- | :--- | :--- |
| C1 | 스케일 인플레이션 | 토큰이 늘어날수록 "스케일"이 아니라 **생성된 값들의 사후 조회표**가 됨 |
| C2 | 디스플레이 폰트 장식 소비 | 브랜드용 세리프를 로드했으나 실제 렌더 경로가 없음 |
| C3 | 폰트 패밀리 과적재 | 4~6개 패밀리를 2개 이상 CDN에서 |
| C4 | 위계 붕괴 | H2·H3가 사실상 동일 크기. 대신 색·그라디언트·굵기로 구분 시도 |
| C5 | `opacity`로 본문 약화 | 색 토큰 대신 `opacity: 0.6`으로 보조 텍스트를 만들어 **대비 추적 불능** |

### D. 모션 계층

| # | 패턴 | 설명 |
| :--- | :--- | :--- |
| D1 | 무한 애니메이션 상재 | `animation: … infinite`가 유휴 상태에서 상시 구동 — 배터리·주의력 소모 |
| D2 | 전역 스크롤 리빌 | 모든 섹션에 동일 fade-up + 동일 stagger |
| D3 | 스크롤 하이재킹 | 인트로 중 `body.overflow = hidden`으로 사용자 통제권 회수 |
| D4 | 커스텀 커서 | 마그네틱·스포트라이트 커서 — 모바일·키보드 사용자에게 전면 무효 |
| D5 | `transition: all` | 의도 외 속성까지 전이, 레이아웃 스래싱 유발 |
| D6 | 3D 틸트 | 마우스 추적 `rotateX/Y` — JS 인라인 transform은 CSS 킬스위치가 못 막음 |

### E. 카피 계층

| # | 패턴 |
| :--- | :--- |
| E1 | 이모지를 아이콘 시스템 대용으로 사용 — OS별 렌더가 달라 **브랜드 통제 불가** |
| E2 | 제목 양쪽을 반짝임 글리프로 감싼 조판 |
| E3 | "Unlock / Supercharge / Seamlessly / 완전히 / 전면" 류 절대화 부사 |
| E4 | em dash(—)·중점(·) 과다로 리듬 단조화 |
| E5 | 3항 병치("A, B, 그리고 C") 상습화 |

### F. 구조적 디자인 부채 계층 — 생성 경제학의 직접 산물

| # | 패턴 | 왜 생기는가 |
| :--- | :--- | :--- |
| F1 | 블록 축자 복제 | 새 페이지 생성 시 형제 페이지 CSS를 **주석까지** 복사. 공통화 없음 |
| F2 | 키프레임 이름 중복 정의 | 같은 이름을 파일마다 재선언 — CSS 키프레임은 **전역 스코프**라 마지막 선언이 덮어씀 |
| F3 | 브레이크포인트 난립 | 생성 시점마다 새 숫자를 발명 |
| F4 | 인라인 스타일 + 생hex 잔류 | 토큰 체계와 병행 존재 |
| F5 | `!important` 누적 | 특정도 전쟁을 선언으로 해결 |
| F6 | **규칙 인플레이션** | QA 지적마다 규범 조항을 추가 → 문서는 비대해지고 집행은 형식만 남음 |

### G. 버튼·컨트롤 기하 계층

가장 과소평가되는 계층입니다. 버튼은 사이트에서 **가장 많이 반복되는 물체**이므로, 버튼의 기하가 흔들리면 다른 모든 정합 노력이 상쇄됩니다.

> 본 계층의 수치는 전부 [`ci/pattern-metrics.mjs`](../../ci/pattern-metrics.mjs) 재측정값입니다.

| # | 패턴 | 설명 |
| :--- | :--- | :--- |
| G1 | **전역 pill 강제** | 모든 버튼을 `border-radius: 9999px`로. 위계·용도 구분 없이 완전 라운드. AI의 기본값이며 "친근함"을 **무료로 사는 대신 위계를 지불**함 |
| G2 | **공용 CTA 선언 vs 로컬 난립** | 전역 `.btn-primary` 체계를 선언해두고도, 페이지마다 `.xx-btn`을 새로 만듦 |
| G3 | **패딩·치수 비표준** | 같은 역할의 버튼이 `12px 28px` / `13px 26px` / `14px 28px` / `10px 18px`로 산재. **수직 리듬 붕괴** |
| G4 | **호버 부유 거리 난립** | 동일 제스처에 `-1px` / `-2px` / `-4px` / `-8px` / `-10px`가 혼재 — "같은 동작"이 아니게 됨 |
| G5 | **포커스 상태 누락** | 호버는 정교하게 설계하고 `:focus-visible`은 잊음. 다크 글래스 pill 위 브라우저 기본 아웃라인은 **거의 보이지 않음** |
| G6 | **터치 타깃 미달** | 32×32·36px 높이 컨트롤. 44×44 CSS px 최소 기준 미달 |
| G7 | **화살표 접미사 상습화** | 모든 CTA 라벨 뒤에 `→`. 많아지면 방향 지시가 아니라 **장식 노이즈** |
| G8 | 아이콘+라벨 gap 난립 | `4/6/7/8/10/12/14px`가 같은 역할에 혼재 |
| G9 | `border-radius: 50%` 남용 | 원형 아이콘 버튼이 과다해지면 **원이 "중요함"의 신호 가치를 잃음** |
| G10 | `cursor: pointer`를 `div`에 | 클릭 가능 요소를 시맨틱 버튼 대신 div로 만들고 커서만 바꿈 — 키보드 접근 불가 |

> **핵심:** 버튼의 AI 티는 "둥글다"가 아니라 **"모든 것이 똑같이 둥글고, 치수는 전부 다르다"** 는 역설적 조합입니다. 형태는 과도하게 통일되고, 수치는 전혀 통일되지 않습니다.

### H. 텍스트 배치 계층

| # | 패턴 | 설명 |
| :--- | :--- | :--- |
| H1 | **중앙 정렬 과다** | 짧은 라벨뿐 아니라 다행 설명문까지 중앙 정렬. 왼쪽 눈 복귀점이 사라져 가독 하락 |
| H2 | **uppercase + wide tracking 아이브로우** | `text-transform: uppercase` + 모노 + `letter-spacing: 0.08~0.16em` + 극소 크기. 2022년 SaaS의 서명 |
| H3 | **letter-spacing 무토큰** | 10~20종 값이 같은 역할에 산재. 폰트 크기는 토큰화했는데 자간은 방치 |
| H4 | **line-height 무토큰** | `1 / 1.2 / 1.3 / 1.4 / 1.5 / 1.6 / 1.65 / 1.7 / 1.8`… 수직 리듬이 파일마다 다름 |
| H5 | **굵기로 위계 만들기** | `font-weight: 700`·`600`이 전체의 다수. 크기·여백이 아니라 굵기로 강조해 **화면 전체가 굵어짐** |
| H6 | 측정 폭(measure) 이원화 미완 | 컨테이너 토큰은 도입했으나 raw px 폭이 병존 |
| H7 | **CJK 줄바꿈 제어 산발** | `word-break: keep-all`·`overflow-wrap`·`text-wrap`을 그때그때 추가. 규범 부재 |
| H8 | 2줄 리드 강제 규약 | `white-space: pre-line` + 언어팩 `\n`으로 줄바꿈을 **콘텐츠에 하드코딩** — 뷰포트 무관하게 고정 |

---

## 2. 프리신세라 실측 진단

측정 범위: `src/` 전체 — CSS 31개, JSX 48개. 측정일 2026-11-01, 커밋 `e1524bf` 기준.

> **측정 권위는 [`ci/pattern-metrics.mjs`](../../ci/pattern-metrics.mjs)에 있습니다.** v1.0의 수치는 손 `grep`으로 집계해 세 가지 오차를 포함했습니다 —
> ① **파일 목록 절단**(`head -15` 후 합산 → `backdrop-filter` 69로 과소 집계, 실제 89) · ② **주석 포함**(`opacity`·`!important` 과대) · ③ **'고유값' 정의 불일치**(단일값만 세어 `border-radius`·`gap` 과소).
> v1.1은 전부 스크립트 재측정값입니다. 정의: CSS 주석 제외, 다중값 선언은 구성 값으로 분해, 대상 절단 없음.
> **직접 세지 말고 `node ci/pattern-metrics.mjs`를 돌리십시오.**

### 2-1. A. 재질 — **해당 (심각)**

| 지표 | 실측 | 평가 |
| :--- | :--- | :--- |
| `backdrop-filter` | **89개소** (최다 `DailyDigest.css` 19) | v1.0 69는 절단 합산 오류. 떠 있는 레이어만이어야 함 |
| `blur(` | **106개소** | |
| `box-shadow` | **192개소** | |
| `linear-gradient` | **98개소** | |
| `radial-gradient` | **30개소** | 글로우 장식구 |
| `background-clip: text` | **31개 규칙** / 21개 파일 | v1.0~1.2의 '55개소'는 **접두사 중복 집계**였다(측정기 교정). 21개 파일 중 **13개는 히어로 h1 1곳뿐으로 이미 절제**. 초과는 `DailyDigest`·`SylphioLanding` 각 3곳 등 **약 10곳** |
| `-webkit-text-fill-color` | 29개소 | |
| `translateY(-N)` 호버 부유 | **67개소** | |
| `opacity: 0.1~0.6` | **49개소** | A6·C5 — 실효 대비 추적 불능 |
| `prefers-color-scheme` | **0회** | 라이트 모드 전무 — **D-5 ①로 의도 확정**(결함 아님) |

`.premium-card`([index.css:189](../../src/styles/index.css#L189))가 교과서적 조합입니다 — blur(16px) + 1px 보더 + 상단 하이라이트 + `translateY(-2px)` + 골드 글로우.

**v5.0이 "완전히 치환"했다고 선언한 Tailwind 기본 스와치가 생존 중입니다.**

| 색 | Tailwind 명 | 위치 |
| :--- | :--- | :--- |
| `#8B5CF6` | violet-500 | [WorkSection.jsx:184](../../src/components/work/WorkSection.jsx#L184)·[Header.jsx:355](../../src/components/layout/Header.jsx#L355) **인라인**, [WorkSection.css:470,501,503,525](../../src/components/work/WorkSection.css#L470), [Header.css:747,770,772](../../src/components/layout/Header.css#L747) |
| `#6D28D9` | violet-700 | [AdminDashboard.jsx:204,600,618](../../src/pages/AdminDashboard.jsx#L204) |
| `#A78BFA` | violet-400 | AdminDashboard 전역 |
| `#E9D5FF` | purple-200 | AdminDashboard 전역 |
| `#60A5FA` | blue-400 | [DailyIntro.css:195](../../src/components/daily/DailyIntro.css#L195), AdminDashboard |
| `#10B981` | emerald-500 | [SylphioLanding.jsx:501](../../src/pages/SylphioLanding.jsx#L501), AdminDashboard |

즉 **홈 플래그십 섹션 레이블 색이 Tailwind 바이올렛 인라인**입니다. 문서가 "전면 무효화"라 명시한 바로 그 색입니다.

### 2-2. B. 구성 — **해당 (공식이 문서로 성문화됨)**

[WaymarkLanding.jsx:13](../../src/pages/WaymarkLanding.jsx#L13) 주석이 스스로 밝힙니다:

> `섹션 공식(eyebrow → 타이틀 → 리드 → 콘텐츠), 좌측 리딩(히어로만 중앙), CTA 닫는 카드`

실제 구성은 B1~B5의 완전집합입니다.

```
히어로(나침반 글리프 → 그라디언트 클립 타이틀 → 서브카피 → CTA 2개 → 점 애니메이션 칩)
→ 공감 산문 → 4단 스테퍼(01·02·03·04 + 글리프 4종)
→ 4카드 그리드(글리프 4종) → 티저 → 닫는 CTA 카드
```

[SylphioLanding.jsx:381](../../src/pages/SylphioLanding.jsx#L381)은 **이모지 7개 FeatureCard 그리드** + Free/Pro 가격 카드 + [530행](../../src/pages/SylphioLanding.jsx#L530) `<h2>Sylphio Pro Lifetime</h2>`(양쪽 반짝임 글리프) + `"Unlock everything permanently with a lifetime license."` — **E1·E2·E3 동시 발현**. 같은 줄에 `locale === 'ko' ? …` 하드코딩 한국어도 있어 i18n 게이트가 새고 있습니다(해당 파일은 `I18N_EXCLUDE` 대상).

**차별화의 환상** — [index.css:339~387](../../src/styles/index.css#L339)은 4제품에 각각 스코프 CTA 테마(골드-슬레이트 / 실버-인디고 / 플래티넘-인디고 / 사파이어)를 부여합니다. 그런데 **4개 전부 `rgba(…,0.12) → rgba(…,0.06)` 135° 그라디언트 + 알파 0.25 보더**입니다. 명목상 4브랜드, 시각적으로는 **구분 불가 1개**. 유지비만 4배입니다.

### 2-3. C. 타이포그래피 — **해당 (C1·C2·C3·C5 동시)**

**C1 스케일 인플레이션** — `--fs-*` 토큰 **35단**(`--fs-050`~`--fs-450`, 0.05rem 간격). 타입 스케일이 아니라 **생성 값의 사후 조회표**입니다. 리비전이 그 과정을 기록합니다: v5.1(13단) → v5.6(30단) → v5.17(35단), 사유는 매번 "선재 리터럴을 토큰화".

**C2 디스플레이 폰트 사장 — 실질 결함**

```css
--font-serif: 'Cormorant Garamond', 'Playfair Display', serif;
--font-display: var(--font-serif);
```

바로 아래 [index.css:224~239](../../src/styles/index.css#L224)에서 `:lang(en)`·`:lang(ko)`·`:lang(ja)` **세 로케일 전부가 `--font-display`를 산세리프로 재정의**합니다. 사이트는 이 3개 로케일만 지원합니다.

→ **Cormorant Garamond·Playfair Display는 어떤 상황에서도 렌더되지 않습니다.** `--font-serif` 참조는 선언 1곳이 전부입니다. 2개 패밀리 × 다중 웨이트 × ital을 모든 방문자가 다운로드하고 버립니다. 덤으로 로드되지 않는 `'Outfit'`이 **9곳**에서 참조됩니다 — `DailyCalendar.css` 3곳·`DailyDigest.css` 4곳·`DailyIntro.css` 1곳·`SylphioNav.css` 1곳. 이 중 3곳은 `var()` 폴백 체인 안(`--font-display`가 항상 정의돼 있어 도달 불가)이고, 3곳은 **1순위 패밀리**로 선언돼 있어 브라우저가 매번 조용히 다음 패밀리로 넘어갑니다. (v1.0은 `DailyCalendar.css` 1파일만 grep해 '3곳'으로 과소 기재 — 정정)

**C3** — [index.html:34~35](../../index.html#L34): 5개 패밀리, 2개 CDN(Google Fonts + jsDelivr). → **D-1 ①로 3패밀리(Inter·JetBrains Mono·Pretendard)로 축소 완료**(2026-11-01).

**C5** — `opacity: 0.1~0.6` 74개소. APCA 지향을 선언했으나 측정 경로가 끊겼습니다.

### 2-4. D. 모션 — **해당 (D1·D3·D4·D5·D6 전부)**

| 지표 | 실측 |
| :--- | :--- |
| `@keyframes` | **81개** |
| `infinite` | **87개소** — 유휴 상태 상시 구동 |
| `transition: all` | **60개소** |
| `will-change` | 6개소 (84개 무한 애니메이션 대비 과소) |
| `prefers-reduced-motion` 가드 | 12개소 |

**D3 스크롤 하이재킹** — [Home.jsx:46~56](../../src/pages/Home.jsx#L46): 첫 방문자는 히어로 인트로가 끝날 때까지 `body.style.overflow = 'hidden'`으로 **스크롤이 차단**됩니다. `sessionStorage`로 1회 한정이지만, 첫인상 구간에서 통제권을 빼앗는 것은 2024년 이후 가장 먼저 제거되는 패턴입니다.

**D4** — [TelescopeCursor](../../src/components/hero/TelescopeCursor.jsx) 마그네틱 커서. 진단 당시 [Layout](../../src/components/layout/Layout.jsx)에 마운트돼 **전 지면**에서 `html.has-custom-cursor *`에 `cursor: none !important`를 걸고 있었다 — 장문 아티클에서 I-beam(선택 가능 신호)과 pointer(링크 신호)가 소실. 게다가 모티브가 참조하는 `#starConstellation`은 홈 히어로 전용이어서 다른 지면에서는 **기능 없는 레티클만** 남았다. RAF 루프가 인라인 transform을 직접 쓰는데 `prefers-reduced-motion` 가드도 없었다(§6-3 v5.7 위반).
→ **D-3(위임 판단)으로 '삭제'가 아니라 '홈 스코프 한정' + reduced-motion 가드 신설**로 처리 완료(2026-11-01). 근거: 감사의 지적은 '장식이 있다'가 아니라 **'장식이 균등 분배됐다'**이므로 교정은 삭제가 아니라 희소화다(A3 Intentional Glow와 동일 원리).

### 2-5. G. 버튼·컨트롤 기하 — **해당 (G1~G10 전부)**

#### G1 전역 pill 강제 + 라운드 값 난립

`border-radius` 실측 분포:

| 값 | 횟수 | 성격 |
| :--- | :--- | :--- |
| `50%` | **54** | 원형(G9) |
| `var(--radius-pill)` | **49** | pill |
| `var(--radius-md)` | 33 | 토큰 |
| `8px` | **22** | 생값 |
| `var(--radius-lg)` | 16 | 토큰 |
| `4px` | **13** | 생값 |
| `12px` / `10px` | 10 / 10 | 생값(12px는 `--radius-md`와 동일 — 토큰 미사용) |
| `20px` / `6px` / `24px` | 8 / 7 / 6 | 생값(6·24는 토큰과 동일값) |
| `16px`·`14px`·`9px`·`18px`·`3px`·`2px`·`5px`·`1.5px`·`1px` | 각 1~6 | 생값 |
| `999px` / `9999px` | 3 / 3 | 토큰 미사용 pill |

**집계: 라운드 토큰 4종을 선언했으나 실사용 고유값 33종**(다중값 선언을 구성 값으로 분해한 기준. 단일값만 세면 19종)**.** 생값 ≈110개소 vs 토큰 ≈103개소 — **절반 이상이 토큰 밖**입니다. `font-size`는 CI로 집행하는데 `border-radius`는 규범도 집행도 없습니다.

#### G2 공용 CTA 선언 vs 로컬 버튼 난립

[index.css §2](../../src/styles/index.css#L239)는 `.btn-primary`·`.btn-secondary`·`.btn-glow` 3종 "의미론적 CTA 시스템"을 선언하고 *"전면에 동일한 물리법칙과 비주얼 토큰을 상속"* 한다고 명시합니다. 실제는:

- **고유 버튼 클래스 계열 60종 이상** — `.celestial-btn`·`.flagship-cta-btn`·`.svc-btn`·`.wm-btn`·`.rl-hero-cta`·`.pv-cross-cta`·`.connect-btn`·`.cta-button`·`.read-more-btn`·`.back-btn`·`.atlas-btn`·`.track-toggle-btn`·`.workspace-tab-btn`·`.gnb-bgm-btn`·`.btn-paywall-purchase`·`.admin-btn-primary` …
- `.btn-glow`는 **JSX 사용 0회** — 선언·키프레임·`--btn-glow-color` 토큰 4종이 전부 사문
- `.premium-card` JSX 3회 / `.premium-3d-card` 1회 — "시스템 표준 스킨"이라 선언됐으나 실사용 미미. 각 페이지가 자체 카드를 재구현

즉 **중앙 체계가 있는데 아무도 쓰지 않는 상태**(F1 재발명의 버튼 버전)입니다.

#### G3 패딩·치수 비표준

버튼류 셀렉터 내 `padding` 고유 조합 **29종**:
`8px 16px`(4) · `10px 14px`(4) · `14px 28px`(3) · `6px 14px` · `4px 10px` · `13px 26px` · `12px 28px` · `10px 18px` · `9px 16px` · `9px 14px` · `7px 15px` · `6px 13px` · `6px 12px` · `5px 12px` · `4px 8px` · `3px 14px 3px 5px` · …

전역 표준은 `12px 28px`인데 **그 값을 쓰는 버튼이 2개뿐**입니다. 같은 위계의 CTA가 `12/13/14px` 수직 패딩으로 갈라져 나란히 놓이면 베이스라인이 맞지 않습니다.

#### G4 호버 부유 거리 난립

동일 제스처(호버 부유)에 **7종 거리**: `-1px` · `-2px`(최다, 23) · `-4px` · `-8px` · `-10px` 외 2종. 표준은 `-2px`이지만 과반에 못 미칩니다.

#### G5 포커스 상태 누락 — **접근성 결함**

- `:focus-visible` 존재 파일: **30개 중 5개뿐** (`PlannersView`·`BuildersLog`·`HeroLatestNote`·`PlannersViewDetail`·`JourneySection`)
- **[index.css](../../src/styles/index.css)의 `focus` 선언: 0건** → **전역 `.btn-primary`·`.btn-secondary`에 포커스 스타일이 전혀 없습니다.**

다크 글래스 pill 위에서 브라우저 기본 아웃라인은 거의 식별 불가입니다. 호버는 `§6-3`까지 규범화하고, **키보드 사용자는 자신의 위치를 알 수 없습니다.** design_system v5.7이 "`:focus-visible` 호버 미러링"을 규정했으나 전역 CTA에는 미적용입니다.

#### G6 터치 타깃 미달

- `.gnb-bgm-btn`: **32 × 32px** ([Header.css:145](../../src/components/layout/Header.css#L145)) — 44px 최소 기준 미달
- 버튼류에 `min-height` 선언 **0건** → 터치 타깃이 패딩·폰트 크기의 우연한 합으로 결정됨
- `padding: 8px 16px` + `--fs-080` 계열 ≈ 36px → 미달

[모바일 최적화 제안서](mobile_optimization_proposal.md)가 터치 타깃을 다루지만 버튼 기하 규범으로 환류되지 않았습니다.

#### G7~G10

| # | 실측 |
| :--- | :--- |
| G7 | JSX 내 `→` **156개**, `→` 3, `›` 3, `↗` 1 — 화살표 4종 혼용 + 과밀 |
| G8 | `gap` 고유값 **37종**: `8px`(36)·`12px`(29)·`6px`(25)·`4px`(19)·`16px`(14)·`10px`(14)·`14px`(12)·`7px`·`3px`·`2px`… 생값이 토큰(`--space-*`) 대비 다수 |
| G9 | `border-radius: 50%` **54개소** — 최다 라운드 값 |
| G10 | `cursor: pointer` **59개소** 대비 시맨틱 `<button>` 사용률 미달. 모달 닫기 `<div className="paywall-close" onClick=…>`([SylphioLanding.jsx:520](../../src/pages/SylphioLanding.jsx#L520))이 대표 사례 — 키보드 접근 불가 |

### 2-6. H. 텍스트 배치 — **해당 (H1~H8 전부)**

| # | 지표 | 실측 | 평가 |
| :--- | :--- | :--- | :--- |
| H1 | `text-align` | **center 49** : left 24 : right 3 | **중앙 정렬이 64%**(49/76)**.** 좌측 리딩 규범이 문서에만 존재 |
| H2 | `text-transform: uppercase` | **40개소** | 전부 `--font-mono` + `--fs-065~075` + wide tracking 아이브로우. **20개 파일에 동일 패턴** |
| H3 | `letter-spacing` | **고유값 20종** — `0.05em`(27)·`-0.02em`(12)·`0.08em`(11)·`0.04em`(11)·`-0.01em`(9)·`0.02em`(8)·`0.1em`(6)·`0.01em`(6)·`0.12em`(5)·`0.06em`(4)·`0.15em`(3)·`0.18em`(2)·`0.2em`·`0.16em`·`0.14em`·`1px`… | **토큰 0개.** 아이브로우 하나가 파일마다 `0.08`/`0.1`/`0.12`/`0.16em` |
| H4 | `line-height` | **고유값 16종** — `1.6`(26)·`1.5`(21)·`1`(13)·`1.4`(12)·`1.7`(10)·`1.65`(10)·`1.3`(9)·`1.2`(7)·`1.45`(4)·`1.35`(4)·`1.8`(3)·`1.55`(3)·`1.9`·`1.75`·`1.25`·`1.1` | **토큰 0개.** 수직 리듬이 파일마다 다름 |
| H5 | `font-weight` | `700`(**111**)·`600`(**79**)·`500`(30)·`400`(18)·`800`(11)·`900`(5)·`300`(3)·`100`(1) | **80%가 600 이상**(202/254)**.** 굵기로 위계를 만들어 화면 전체가 굵음. 8종 웨이트는 로드된 폰트 웨이트보다 많음 |
| H6 | 폭 제어 | `var(--container)` 26 · `var(--measure)` 17 — **토큰화 성공 영역** / 단 `max-width: 1400px` ×2 금지대역 위반 ([AdminDashboard.css:149,289](../../src/pages/AdminDashboard.css#L149)) | 폭은 8계층 중 유일하게 체계가 작동 |
| H7 | CJK 줄바꿈 | `word-break: keep-all` 31 · `overflow-wrap` 21 · `text-wrap` 6 · `hyphens` 0 | 규범 없이 산발 추가. `:lang(ja) * { word-break: normal !important }` 전역 해머가 그 방증 |
| H8 | 2줄 리드 강제 | `white-space: pre-line` 5 + 언어팩 `\n` 규약(design_system v5.19) | 줄바꿈을 **콘텐츠에 하드코딩** → 뷰포트 무관 고정. `text-wrap: balance`가 있는 시대의 역행 |

### 2-7. F. 구조적 부채 — **해당 (F1~F6 전부)**

**F1 축자 복제 — 확정** — `.sylphio-core-container` / `.sylphio-aurora-core` / `.sylphio-aurora-ring` 블록이 [SylphioLanding.css:37](../../src/pages/SylphioLanding.css#L37) · [SylphioPrivacy.css:42](../../src/pages/SylphioPrivacy.css#L42) · [SylphioApiKeyGuide.css:42](../../src/pages/SylphioApiKeyGuide.css#L42)에 **공백·주석까지 동일하게 3중 복제**. *"이모지 아이콘의 Visual Weight와 완벽한 균형 매칭"* 주석도 똑같이 세 번.

**F2 키프레임 중복 정의** — `floatCore`·`spinCore`·`spinRing`·`floatIcon` **각 3회**, `fadeIn`·`bentoPulse` 각 2회. CSS 키프레임은 전역 스코프이므로 **마지막 선언이 전역을 덮습니다.** 현재는 값이 같아 무증상이나, 한 파일만 수정하면 다른 두 페이지가 조용히 따라 바뀝니다.

**F3 브레이크포인트 난립** — `@media` 기준 고유 **11종**: 320/480/520/560/640/**768**/820/900/1024/1100/1400px. `768px`이 27회로 사실상 유일한 합의점, 나머지는 생성 시점의 즉흥. (v1.0의 '20종 이상'은 `@media` 밖의 `max-width`까지 섞어 센 **과대 집계**였습니다 — 이 항목은 완화 정정입니다.)

**F4** — 인라인 `style={{` **176개소**([AdminDashboard.jsx](../../src/pages/AdminDashboard.jsx) 단독 103). **F5** — `!important` **67개소**.

### 2-8. F6 규칙 인플레이션 — **가장 중요한 메타 진단**

[design_system.md](design_system.md) 리비전 25건 중 **24건이 AI 에이전트 작성**(당시 `Author` 열 기준 — 2026-11-03에 열 자체를 폐지했다), Description 다수가 *"오너 QA 환류"*·*"사후 환류"*입니다. 이 디자인 시스템은 **선제 설계가 아니라 지적 사항에 대한 사후 조항 누적**으로 자랐습니다.

그리고 **[ci/design-check.mjs](../../ci/design-check.mjs)(214줄)가 실제로 검사하는 것은 4가지뿐**입니다:

1. 시크릿 훅 설치 여부 (디자인 무관)
2. `max-width` 금지대역 [880,2000]px — **단 `AdminDashboard.css`·`ServiceDocs.css`는 `EXCLUDE`** → 1400px ×2가 통과하는 이유
3. `font-size` 토큰 일치 (+ `clamp()` endpoint)
4. JSX 한국어 하드코딩 (디자인 무관)

**결론: 디자인 12차원 중 집행되는 것은 `font-size` 1개이고, 그 1개의 허용값이 35종입니다.**

| 차원 | 규범 | CI 집행 | 실측 고유값 |
| :--- | :--- | :--- | :--- |
| font-size | O §4-2 | O | 35종(토큰) |
| max-width | O §3-3 | 일부 제외 | 2종 토큰 + 위반 2건 |
| border-radius | △ §9-10 언급 | X | **33종** |
| letter-spacing | X | X | **20종** |
| line-height | X | X | **16종** |
| gap | △ §9-3 일부 | X | **37종** |
| 버튼 padding | △ §2 선언만 | X | **29종** |
| font-weight | X | X | **8종** |
| breakpoint | X | X | **11종** |
| 색(hex 생값) | O §1 | X | Tailwind 잔존 |
| 포커스 상태 | △ §5.7 | X | 5/30 파일 |
| 장식 밀도 | X | X | 무제한 |

> **바이브코딩 디자인 부채의 본질: 규범이 두꺼워지는 속도가 실제 품질 개선 속도를 추월합니다.**
> `[design-check] PASS`는 현재 "폰트 크기만 통과"를 의미하며, 위 표의 나머지 11행은 **녹색 신호 아래에서 자유 증식**합니다.

---

## 3. 진단 요약

| 계층 | 판정 | 근거 요약 |
| :--- | :--- | :--- |
| A 재질 | 심각 | 그라디언트 텍스트가 전 20파일, backdrop-filter 69, Tailwind 퍼플 생존 |
| B 구성 | 심각 | 섹션 공식이 주석으로 성문화, 4제품 테마 시각 구분 불가 |
| C 타이포 | 높음 | 35단 스케일, 세리프 2종 사장(로드 후 폐기) |
| D 모션 | 높음 | infinite 84, 스크롤 하이재킹, transition:all 60 |
| E 카피 | 중간 | 이모지 268 · 반짝임 플랭킹 · "Unlock…" |
| F 구조 | 심각 | 3중 축자 복제, 키프레임 전역 충돌 위험, 집행 1/12차원 |
| **G 버튼** | **심각** | **전역 CTA 사문화(60+ 로컬 클래스), 포커스 0건, 터치타깃 미달, 라운드 19종·패딩 29종** |
| **H 텍스트 배치** | **심각** | **중앙정렬 68%, letter-spacing 20종·line-height 16종 무토큰, weight 74%가 600+** |

**가장 비용 대비 효과가 큰 지점은 G·H입니다.** 버튼과 텍스트 메트릭은 전 페이지에 반복 등장하므로, 여기를 정합시키면 **개별 페이지를 손대지 않고도 전역 품질이 올라갑니다.** 반대로 여기가 흔들리면 다른 모든 정합 노력이 상쇄됩니다.

→ 실행은 **[AI 패턴 개선 계획서](ai_pattern_remediation_plan.md)** 를 따릅니다.
