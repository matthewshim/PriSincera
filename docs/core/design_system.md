---
status: active
domain: Core
last_updated: 2026-06-09
version: v5.0
target_files:
  - src/styles/index.css
  - src/components/hero/TelescopeCursor.jsx
  - src/components/hero/TelescopeCursor.css
  - src/pages/BuildersLog.jsx
  - src/pages/DailyDigest.jsx
  - src/pages/PaceNoteDashboard.jsx
---

# 📐 PriSincera Design System (v5.0: Celestial Overhaul & Contrast Optimization)

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

> **"Sincerity, Prioritized."**
> 본 문서는 PriSincera 웹사이트가 세계 최고 수준(World-class)의 디자인 품질을 달성하기 위한 차세대 디자인 시스템 v4.6 표준 가이드라인입니다. 

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

1. **Bento Grid & 대시보드 핏 (Dashboard Layout - `1200px`)**
   * **적용 범위**: `/pacenote` (페이스노트 대시보드), `/builders-log` (챕터 카드 그리드)
   * **목적 및 명세**: 3열 혹은 4열의 다이내믹한 그리드를 미려하게 분할할 수 있는 최적의 폭입니다. 주류 FHD 모니터에서 적정 좌우 여백(`360px`씩)을 주어 기하학적 깊이감과 정보 밀도를 동시에 양립시킵니다.
   * **코드 표준**: `max-width: 1200px; margin: 0 auto; width: 100%;`

2. **정독 아티클 & 가이드 핏 (Reading & Information Sheet - `900px` / `1000px` for Sylphio family)**
   * **적용 범위**: `/daily/{date}` (다이제스트 본문 - `900px`), `/sylphio/guide` (가이드), `/sylphio/privacy` (개인정보처리방침) (Sylphio 브랜드 통일성을 위해 `1000px` 적용)
   * **목적 및 명세**: 가독성에 극도로 중점을 두어야 하는 글읽기 콘텐츠는 `900px`을 초과하는 즉시 가독 지표가 흔들리나, Sylphio 브랜드 제품군의 통일된 그리드 경험 및 표(Table)/코드 블록의 넉넉한 공간 확보를 위해 가이드와 개인정보처리방침은 `1000px`로 상향 조정하여 기하학적 균형을 이식합니다.
   * **코드 표준**: `max-width: 900px` (또는 Sylphio 제품군 `1000px`); margin: 0 auto; width: calc(100% - 48px);

3. **비주얼 브랜드 랜딩 핏 (Visual Branding & Canvas - `1440px`)**
   * **적용 범위**: 메인 Landing, `/sylphio` (실피오 브랜드 소개 페이지)
   * **목적 및 명세**: 3D Three.js 및 웅장한 히어로 타이포그래피로 초반 시각적 신뢰감을 확보해야 하는 소개 페이지는 광활한 확장이 요구됩니다. 다만 초고해상도 유저들을 위해 최대 상한선을 `1440px`로 제한하여 균형 잡힌 비주얼 기조를 지켜냅니다.
   * **코드 표준**: `max-width: 1440px; margin: 0 auto; width: 100%;`


---

## 4. 🔠 Typography & Multilingual Optimization

글로벌 수준의 타이포그래피는 '어떤 디바이스에서도 완벽하게, 그리고 아름답게 읽히는 것'을 목표로 합니다.

### 4-1. Language-Specific Font Stacks (언어별 맞춤 폰트 스택)
다국어 환경(English, Korean, Japanese)에서의 완벽한 심미성과 가독성 보장을 위해 각 언어별 맞춤 폰트 스택을 바인딩하여 렌더링 퀄리티를 최적화합니다.
* **영어 (English)**: `Inter`, `Geist`, `SF Pro Display` 등을 스택 선두에 배치하여 숫자와 알파벳의 모던한 비율 및 기하학적 조형미를 극대화합니다.
* **한국어 (Korean)**: `Pretendard Variable`, `Pretendard`를 전면 도입하여 자간/행간의 불균형을 극복하고 다크모드 상에서도 명확히 스캔되도록 최적화합니다.
* **일본어 (Japanese)**: `Hiragino Sans`, `Hiragino Kaku Gothic ProN` (macOS/iOS 최적화) 및 `Yu Gothic`, `Meiryo` (Windows 최적화)를 차례대로 배치하여 렌더링 시 왜곡이나 기본 서체의 투박함을 방지하고 가독성을 확보합니다.

### 4-2. Dynamic Typography Scale (Fluid & Harmonious)
단순한 픽셀 단위가 아닌, 기하학적 스케일에 기반한 폰트 시스템을 적용합니다.

| 역할 | 폰트 | 사이즈 | line-height | letter-spacing |
|------|------|--------|-------------|----------------|
| **Display (Hero)** | `--font-display` | `clamp(2.5rem, 6vw, 4.5rem)` | `1.1` | `-0.03em` |
| **Heading 1** | `--font-display` | `clamp(2rem, 4vw, 3rem)` | `1.2` | `-0.02em` |
| **Heading 2** | `--font-display` | `1.5rem ~ 2rem` | `1.3` | `-0.01em` |
| **Body Large** | `--font-body` | `1.125rem` (18px) | `1.6` | `0` |
| **Body Base** | `--font-body` | `1rem` (16px) | `1.6` | `0` |
| **Caption/Tag** | `--font-mono` | `0.75rem` (12px) | `1.4` | `0.05em` |

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

현재 `PaceNoteDashboard`와 `BuildersLog`에 파편화된 **Bento Grid**를 메인 공식 UI 패턴으로 승격합니다.

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

*최종 업데이트: 2026-05-27 (v4.0 글로벌 최고 수준 디자인 시스템 분석 및 의미론적 CTA 버튼 체계 설계 추가)*
