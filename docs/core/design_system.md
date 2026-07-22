---
status: active
domain: Core
last_updated: 2026-07-22
version: v5.8
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

---

## 2. 🔘 의미론적 CTA 버튼 설계 규격 (Semantic CTA Button System)

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

### 4-2. Dynamic Typography Scale (Fluid & Harmonious) — 🔒 규범(Normative)

**[강제 규칙 — MUST]**
1. `font-size`는 **0.05rem 그리드 위의 등재 토큰(`--fs-*`, `index.css` 정의 — 현재 30단)** 값만 사용합니다. **px 단위·임의 값 절대 금지.** 토큰 목록의 정본은 `index.css` 정의부입니다.
2. 스케일에 없는 단계가 필요하면 **본 문서 개정(Revision 기록)을 통해서만** 추가합니다. 페이지 CSS에서 새 값을 발명하지 마십시오.
3. 위반을 발견하면 코드 수정과 함께 본 문서에 환류(규칙 보강)합니다. (실사례: 2026-07 ReLearn 12건 오프스케일 → v5.1 규범화)

| 토큰 | 값 | 대표 용도 |
|------|-----|----------|
| `--fs-070` | 0.7rem | 미세 캡션·뱃지 |
| `--fs-075` | 0.75rem | **Caption/Tag** (모노 라벨, ls 0.05em) |
| `--fs-080` | 0.8rem | 보조 텍스트·링크 |
| `--fs-085` | 0.85rem | 콤팩트 본문·버튼·접기 요약 |
| `--fs-090` | 0.9rem | 스몰 본문·상태 문구 |
| `--fs-095` | 0.95rem | 서브 본문 |
| `--fs-100` | 1rem | **Body Base** (lh 1.6) |
| `--fs-110` | 1.1rem | 강조 본문 |
| `--fs-115` | 1.15rem | **Body Large** — 서비스 히어로 서브카피 (lh 1.6) ※ 구 1.125rem 표기를 실코드 관행으로 정정 |
| `--fs-130` | 1.3rem | 소형 헤딩·마커 아이콘 |
| `--fs-140` | 1.4rem | **섹션 타이틀** (`--font-display` 600) |
| `--fs-220` | 2.2rem | 서비스 히어로 타이틀(모바일) |
| `--fs-300` | 3rem | 서비스 히어로 타이틀(데스크톱, `--font-display` 700) |

| 유동(Fluid) 역할 | 폰트 | 사이즈 | line-height | letter-spacing |
|------|------|--------|-------------|----------------|
| **Display (Hero)** | `--font-display` | `clamp(2.5rem, 6vw, 4.5rem)` | `1.1` | `-0.03em` |
| **Heading 1** | `--font-display` | `clamp(2rem, 4vw, 3rem)` | `1.2` | `-0.02em` |
| **Heading 2** | `--font-display` | `1.5rem ~ 2rem` | `1.3` | `-0.01em` |

---

## 5. 🪞 Elevation & Glassmorphism 3.0

투명도 높은 보라색 배경에 의존하던 1세대를 넘어, **정밀한 1px 보더(Border)와 다중 그림자(Multi-layer Shadow)**를 활용한 하이엔드 글래스모피즘을 제안합니다.

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
  - **정보 밀도가 높은 묵직한 본문 카드** (예: 빌더스 로그 챕터 카드, 데일리 큐레이션 피드 카드, 페이스노트 목표/캘린더 카드): 묵직하고 진중한 신뢰감을 주기 위해 최대 **`5 ~ 7도`** 범위 내로 억제하여 적용.
* **물리 메커니즘**:
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
- 구성 순서: **아이콘 → h1 타이틀 → 서브카피** (eyebrow·별도 영문 서브라인 등 추가 형식 금지)
- 아이콘: 이모지 `3rem`, `float 6s ease-in-out infinite` 부유 애니메이션
- 타이틀: `--font-display` / `--fs-300`(모바일 `--fs-220`) / 700 / `--gradient-brand` 텍스트 클립
- 서브카피: `--fs-115` / `--crystal-light` / lh 1.6 / opacity 0.9
- 상단 보정: 데스크톱 **140px** / 모바일 **120px** (GNB 높이 포함)
- 페이지 마운트 시 `body.hero-ready` 클래스 부여(GNB 노출 조건) 필수
- **[제품 브랜드 예외]** 독립 제품 페이지(예: Sylphio)는 **타이틀 그라데이션에 한해** 제품 고유 팔레트를 허용합니다. 구조(아이콘→타이틀→서브)·크기·웨이트·보정 수치는 본 규격을 그대로 따릅니다.

### 9-2. 섹션 타이틀
- 타이틀: `--font-display` / `--fs-140` / 600 / `--text-primary`
- 설명(desc): `--fs-085` / `--text-muted`
- **[경계]** 본 규격은 **페이지 본문의 섹션 타이틀** 기준입니다. 카드·패널 내부 헤더(예: PaceNote 카드 헤더)는 `--fs-150`(1.5rem)까지 허용하되 그 이상은 금지.

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
스테이지 레일 등 세로 라인이 존재하는 화면에서 **세로 강조선은 1개만** 둡니다. (존 좌측 컬러바 + 레일 동시 사용 금지 — 시각 충돌)

### 9-6-0. 자동 집행 (Enforcement) — `ci/design-check.mjs`
- `npm run build` 시 **prebuild 게이트**로 자동 실행됩니다(Cloud Run 배포 파이프라인 포함 — 위반 시 빌드 차단).
- **ERROR(차단)**: ① 마이크로 밴드 `[0.66rem, 1.0rem)`의 비토큰 font-size 리터럴·동일 밴드 px ② **대역 `[880,2000]px`의 px `max-width` 리터럴**(§3-3 — `--container`/`--measure` 토큰만 허용).
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

---

*최종 업데이트: 2026-07-20 (v5.1 규범화 개편 — 13단 폰트 스케일·`--fs-*` 토큰·표준 컴포넌트 규격 §9 신설)*
