---
status: active
domain: Core
last_updated: 2026-05-27
version: v3.0
target_files:
  - src/styles/design_system.css
  - src/pages/PaceNoteDashboard.css
---

# 📐 PriSincera Design System (v3.0: Chrono-Neutral & Density Optimization)

## 📝 Revision History

| Version | Date | Author | Description | Impact Area |
| :--- | :--- | :--- | :--- | :--- |
| v2.0 | 2026-04-30 | Designer | 프리미엄 다크 모드(Premium Dark Mode) 기준으로 디자인 시스템 대대적 재설계 | CSS System |
| v2.5 | 2026-05-19 | Designer | Bento Chrono-Calendar & 3-Tab Workstation Theme 규격 정의 | DailyDigest |
| v2.6 | 2026-05-20 | Designer | PaceNote Bento Weekly Calendar & Voyage Horizon 디자인 토큰 표준 수립 | PaceNote |
| v2.7 | 2026-05-21 | AI Agent | 도메인 중심(DDD) 폴더 개편에 따른 표준 프론트매터 및 개정 내역 주입 | Documentation |
| v3.0 | 2026-05-27 | AI Agent | 여백 최적화(Density) 및 퍼플 배경 색상 누수 완전히 제거(Desaturated Chrono-Neutral) 규격 명문화 | CSS Layout & Color System |

> **"Sincerity, Prioritized."**
> 본 문서는 PriSincera 웹사이트가 '세계 최고 수준(World-class)'의 디자인 품질을 달성하기 위한 차세대 디자인 시스템 가이드라인입니다. 
> 기존의 다소 채도가 높았던 네온(Neon)/퍼플(Purple) 톤을 탈피하고, **Apple, Linear, Vercel** 등 최상위 글로벌 SaaS 브랜드에서 사용하는 **'극도로 정제된 프리미엄 다크 모드(Premium Dark Mode)'**를 기준으로 재설계되었습니다.

---

## 1. 🎨 Color System: Refined & Sophisticated

**[문제점 분석]** 기존 시스템은 배경 및 보조 카드 요소들에 보라색/퍼플 계열(`rgba(10, 7, 20)`, `rgba(26, 16, 53)`)이 과도하게 섞여 있어, 텍스트가 많은 본문에서 가독성을 떨어뜨리고 시각적 피로를 유발했습니다.
**[개선 방향]** 배경과 텍스트, 카드 면(Surface)은 보라색 혼합을 완전히 배제한 **순수 무채색(Desaturated Chrono-Neutral, OLED Black & Slate)** 계열로 정제하여 완벽한 가독성(WCAG 2.1 AA 명도대비 4.5:1 이상)을 확보하고, 브랜드 컬러(Violet)는 오직 결정적인 순간(CTA, 핵심 강조 오버레이)에만 하이라이트로 적용합니다.

### 1-1. Base & Surfaces (OLED Black & Slate)
완벽한 대비를 위해 순수 블랙에 가까운 배경을 사용하고, 카드(Surface)는 투명도와 밝기(Lightness)로만 계층을 나눕니다.

| Token | Hex (New) | 기존 대비 개선점 |
|-------|-----------|------------------|
| `--bg-void` | `#000000` / `#050505` | 깊고 순수한 블랙 (OLED 친화적, 몰입감 극대화) |
| `--bg-surface` | `#0A0A0A` | 채도를 완전히 뺀 다크 그레이로 텍스트 가독성 최우선 |
| `--bg-elevated` | `#111111` / `#171717` | 플로팅 요소, 모달, 강조 카드 전용 |
| `--glass-bg-neutral` | `rgba(17, 17, 17, 0.6)` / `rgba(10, 10, 10, 0.75)` | 퍼플 색조를 완전히 걷어내고 순수 다크 그레이 유리광 스킨 제공 |

### 1-2. Typography Colors (Maximum Legibility)
보라색 계열 텍스트를 철저히 배제하고, 뉴트럴 텍스트 토큰을 도입합니다.

| Token | Hex / RGBA | 용도 및 기대 효과 |
|-------|------------|-------------------|
| `--text-primary` | `#FAFAFA` | 제목, 주요 본문 (눈부심 방지를 위해 오프화이트 사용) |
| `--text-secondary`| `#A1A1AA` | 보조 텍스트, 서브타이틀 (시각적 안정감이 높은 Neutral Gray) |
| `--text-muted` | `#71717A` | 비활성 텍스트, 부가 설명 (명도 대비 최소 기준 충족) |

### 1-3. Brand Accents & Gradients (The "Aura")
형광 느낌을 줄이고, 깊이 있고 우아한(Elegant) 브랜드 아우라를 형성합니다.

| Token | Hex / Value | 용도 |
|-------|-------------|------|
| `--prism-violet` | `#6D28D9` | 메인 브랜드 액센트 (결정적인 순간용) |
| `--prism-lavender`| `#A78BFA` | 서브 라이팅 효과, 상호작용 피드백 |
| `--orbit-cyan` | `#06B6D4` | 정보성 강조, 테크(Tech) 시그널, 링크 색상 |
| `--gradient-brand` | `linear-gradient(135deg, #6D28D9, #A78BFA, #FBCFE8)` | **우아한 오로라 그라디언트**. 대형 텍스트 Accent 및 핵심 Hero 요소 전용 |

---

## 2. 🔠 Typography: World-Class Readability

글로벌 수준의 타이포그래피는 '어떤 디바이스에서도 완벽하게, 그리고 아름답게 읽히는 것'을 목표로 합니다.

### 2-1. Font Family Stack (New Proposal)
* **English / Display**: `Inter`, `Geist`, 혹은 `SF Pro Display` 도입 권장. (현재의 `Outfit`은 트렌디하지만, 가독성과 모던함 측면에서 `Inter` 계열이 압도적입니다.)
* **Korean**: `Pretendard` 도입 권장. (`Noto Sans KR`의 고질적인 자간/행간 불균형 이슈를 완벽히 해결하는 최신 웹 표준)
* **Monospace**: `JetBrains Mono` 유지. (디자인적 완성도가 매우 높습니다.)

### 2-2. Dynamic Typography Scale (Fluid & Harmonious)
단순한 픽셀 단위가 아닌, 기하학적 스케일에 기반한 폰트 시스템을 적용합니다.

| 역할 | 폰트 | 사이즈 | line-height | letter-spacing |
|------|------|--------|-------------|----------------|
| **Display (Hero)** | `--font-display` | `clamp(2.5rem, 6vw, 4.5rem)` | `1.1` | `-0.03em` |
| **Heading 1** | `--font-display` | `clamp(2rem, 4vw, 3rem)` | `1.2` | `-0.02em` |
| **Heading 2** | `--font-display` | `1.5rem ~ 2rem` | `1.3` | `-0.01em` |
| **Body Large** | `--font-body` | `1.125rem` (18px) | `1.6` | `0` |
| **Body Base** | `--font-body` | `1rem` (16px) | `1.6` | `0` |
| **Caption/Tag** | `--font-mono` | `0.75rem` (12px) | `1.4` | `0.05em` |

### 2-3. Language-Specific Font Stacks (언어별 최적화 폰트 스택)
다국어 환경(English, Korean, Japanese)에서의 완벽한 심미성과 가독성 보장을 위해 각 언어별 맞춤 폰트 스택을 바인딩하여 렌더링 퀄리티를 최적화합니다.
* **영어 (English)**: `Inter`, `Geist`, `SF Pro Display` 등을 스택 선두에 배치하여 숫자와 알파벳의 모던한 비율 및 기하학적 조형미를 극대화합니다.
* **한국어 (Korean)**: `Pretendard Variable`, `Pretendard`를 전면 도입하여 자간/행간의 불균형을 극복하고 다크모드 상에서도 명확히 스캔되도록 최적화합니다.
* **일본어 (Japanese)**: `Hiragino Sans`, `Hiragino Kaku Gothic ProN` (macOS/iOS 최적화) 및 `Yu Gothic`, `Meiryo` (Windows 최적화)를 차례대로 배치하여 렌더링 시 왜곡이나 기본 서체의 투박함을 방지하고 가독성을 확보합니다.

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

### 3-1. 🚀 v3.0 Card & Content Spacing Optimization (Density)
기존의 카드들은 텍스트의 볼륨에 비해 과도한 내부 여백과 넓은 카드 사이의 간격을 가지고 있어 화면이 비어 보이거나 산만한 단점이 있었습니다. v3.0에서는 최적의 정보 밀도를 확보하기 위해 아래와 같이 규격화합니다.

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

---

## 4. 🪞 Elevation & Glassmorphism 2.0

투명도 높은 보라색 배경에 의존하던 1세대를 넘어, **정밀한 1px 보더(Border)와 다중 그림자(Multi-layer Shadow)**를 활용한 하이엔드 글래스모피즘을 제안합니다.

### 4-1. Premium Card Surface (The "Jewel" Effect)
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
  border-color: rgba(167, 139, 250, 0.3); 
  transform: translateY(-2px);
}
```

---

## 5. ⚡ Interaction & Animation

프리미엄 UI의 핵심은 '물리법칙을 따르는 자연스러운 인터랙션'입니다.

### 5-1. Spring Physics 기반 Transition
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

### 5-2. Micro-Interactions (마이크로 인터랙션)
- **Button Active State**: 클릭 시 `transform: scale(0.97)`을 주어 물리적 버튼을 누르는 실제적인 타격감을 부여합니다.
- **Spotlight Glow**: 카드 호버 시 단순히 테두리 색상만 바뀌는 것이 아니라, 카드 내부 마우스 커서 위치를 따라다니는 빛 반사(Glow) 효과를 전역 카드 시스템에 통합합니다.

---

## 6. 🧩 핵심 레이아웃 패턴 (The Unified Bento Grid)

현재 `PaceNoteDashboard`와 `BuildersLog`에 파편화된 **Bento Grid**를 메인 공식 UI 패턴으로 승격합니다.

1. **Gaps**: 그리드 간격은 항상 `var(--space-lg)` (24px) 또는 `var(--space-md)` (16px) 유지.
2. **Spans**: 12-column 그리드 체제를 표준으로 하여, 정보 위계에 따라 `span 8`, `span 4` (비대칭 2:1) 혹은 `span 7`, `span 5` 등 다이내믹한 조합 사용.
3. **Internal Padding**: Bento 카드 내부는 상단 좌측 정렬을 기본으로 하되, 여백은 항상 `var(--space-lg)` (24px) 또는 `var(--space-xl)` (32px)로 고정하여 시각적 답답함을 원천 해소합니다.

---

## 💡 요약: 세계 최고 수준의 코드로 거듭나기 위한 Action Plan

본 가이드라인에 따라 프론트엔드 코드(`index.css`, `App.jsx` 등)에 다음 사항을 순차 적용할 것을 권장합니다.

1. **탈(脫) 퍼플 배경 선언**: `index.css`의 `:root` 토큰에서 배경색의 명도를 극도로 낮추고(`OLED Black`), 텍스트의 채도를 뺍니다(`Neutral Gray`). 가독성이 즉각적으로 향상됩니다.
2. **폰트 스택 업그레이드**: `Pretendard`와 `Inter`를 메인 폰트로 교체하여 엔터프라이즈급 텍스트 렌더링 품질을 확보하세요.
3. **8pt 그리드 정렬**: CSS 파일 전역에 흩어져 있는 `14px`, `10px`, `6px` 등의 마진/패딩 수치를 찾아내 `8, 16, 24, 32`의 배수로 일괄 조정(Refactoring) 하세요.
4. **빛과 그림자의 재설계**: 단색 `border` 대신 반투명 화이트(`rgba(255,255,255,0.05)`)와 다중 섀도우를 통해 화면 공간감(Depth)을 혁신적으로 개선하세요.

---

## 7. 🌌 3D WebGL & Physics System (Phase 2.0)

PriSincera의 공간 디자인은 2D 평면을 넘어 Three.js 기반의 3D WebGL 영역으로 확장되었습니다. HTML DOM 요소와의 시각적 통일성을 위해 다음의 3D 전용 파라미터(Token)를 엄격히 준수합니다.

### 7-1. Glassmorphism 3.0 (MeshTransmissionMaterial)
3D 상의 유리(크리스탈) 객체는 단순한 투명도를 넘어 '굴절'과 '산란'을 시뮬레이션해야 합니다.
* **Transmission (투과율):** `1.0` (완전 투명)
* **Thickness (두께):** `0.5 ~ 0.8` (얇고 예리한 유리)
* **Chromatic Aberration (색수차):** `0.15` (과하지 않은 영롱한 산란)
* **Iridescence (무지갯빛 반사):** `1.0` (빛의 각도에 따른 고급스러운 무지개 반사)
* **Attenuation Color (내부 굴절색):** `#6D28D9` (브랜드 메인 컬러)

### 7-2. Volumetric Lighting & Space
* **Point Light (내부 발광):** Intensity `0.5 ~ 0.8`, Color `#A78BFA` (은은한 라벤더)
* **Ambient Light:** Intensity `0.4` (OLED 블랙 배경과 대비를 유지하기 위한 낮은 조도)
* **Star Field (우주 배경):** `#C4B5FD` (보랏빛 별)와 `#7C3AED` (브랜드 컬러 먼지) 조합으로 깊이감 연출.

### 7-3. Spring Physics Engine (Lerp & Damping)
3D와 2D 상호작용의 타격감을 통일하기 위해, 선형적인 이동이 아닌 **감속(Damping)** 기반의 보간을 사용합니다.
* **마우스 자성(Magnetic Hover):** `lerp(current, target, 0.05)` (매 프레임 5%씩 목표치로 이동, 부드러운 텐션)
* **스크롤 전진(Zoom-in):** 스크롤 `progress` 값에 비례하여 Z축을 이동시키되, 즉각 반응하지 않고 `lerp`를 거쳐 멀미(Motion Sickness)를 방지합니다.

---

## 8. 🗓️ Bento Chrono-Calendar & Themed Workstation System (v2.5)

Daily Digest 아카이브 개편과 3-Tab 워크스페이스 리뉴얼 과정에서 정립된 **Bento Chrono-Calendar**와 **3-Tab 워크스테이션 테마 시스템**의 표준 가이드라인입니다. 다른 개발자나 AI가 즉시 이해하고 코드로 이식할 수 있도록 구현 패턴과 세부 설계 토큰을 완벽히 규격화합니다.

### 8-1. Chrono-Calendar Grid Specification (레이아웃 시프트 방지)
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

### 8-2. 150ms Hover Debounce & Lazy-Load Architecture
* **API 호출 과부하 방지**: 아카이브 메인 진입 시 고용량의 전체 아티클 리스트를 한번에 가져오는 대신, 발행일 인덱스(`/api/daily/index`)만 가볍게 1회 페치합니다.
* **디바운싱 지연 로드 (Debounce Lazy Load)**:
  * 마우스가 활성 날짜를 스쳐 지나갈 때마다 API를 유발하지 않도록, `150ms` 디바운싱 타이머를 적용합니다.
  * 마우스 진입(`onMouseEnter`) 시 이전 타이머를 즉각 `clearTimeout`하고, `150ms` 동안 커서가 머물 때에만 백그라운드로 `/api/daily/{date}`를 호출하여 우측 퀵 피크 상세 정보를 동적 바인딩합니다.

### 8-3. 3-Tab Workstation Segmented & Ambient Morphing
상세 페이지(`/daily/{date}`)에서 IT Tech, AI Workstation, Language Dojo의 3개 워크스페이스를 즉각 스캔하기 위한 벨트 레이아웃입니다.
* **Segmented Belt**: `display: flex; gap: 16px; justify-content: center; width: 100%;`
* **벨트 버튼 인터랙션**: 호버 시 아이콘은 미세 회전(`rotate(3deg) scale(1.12)`), 액티브 상태 돌입 시 `translateY(-2px)`와 함께 개별 테마 컬러가 은은한 글로우로 번집니다.
* **백라이트 아우라 모핑 (Ambient Morphing Backdrop)**:
  * 컨테이너(`.daily-feed-container`) 뒷면에 `filter: blur(140px)`가 적용된 큰 가상 요소(`::before`)를 배치합니다.
  * 탭이 바뀔 때마다 테마의 대표광(대표 색상)을 배경 그라디언트로 부드럽게 페이드 전환시킵니다.
    * **IT Tech (Signal)**: 라벤더 아우라 (`rgba(167, 139, 250, 0.08)`)
    * **AI Workstation (Prompt)**: 사이언 아우라 (`rgba(6, 182, 212, 0.08)`)
    * **Language Dojo (Japanese)**: 로즈 아우라 (`rgba(251, 207, 232, 0.08)`)
  * 트랜지션 필터: `transition: background 0.8s cubic-bezier(0.25, 0.8, 0.25, 1), opacity 0.8s ease-in-out;`

### 8-4. 2-Stage Mobile Tap UX Flow (모바일 오터치 차단)
* **모바일 그리드 리플로우**: 768px 미만 미디어 쿼리 적용 시 데스크톱의 6:4 분할 그리드를 `grid-template-columns: 1fr` 세로 1열 종대로 전환합니다.
* **Accidental Navigation 방지**: 모바일 터치 실수로 상세 분석 페이지로 다이렉트 이탈하는 피로도를 해소하기 위해 2단계 검증 플로우를 적용합니다.
  1. **1단계 (1st Tap)**: 모바일에서 캘린더의 활성 날짜를 터치하면 이동하는 대신 하단의 **Quick Peek 요약 패널**에 데이터를 바인딩한 후, 해당 퀵 피크 위치로 `scrollIntoView({ behavior: 'smooth' })` 부드러운 스크롤을 시동합니다.
  2. **2단계 (2nd Tap)**: 퀵 피크 카드 내부에 강조 배치된 **"전체 콘텐츠 상세히 보기 →"** 액션 버튼을 2차 터치할 때 최종 상세 화면(`/daily/{date}`)으로 이송합니다.

---

### 8-5. ⛵ PaceNote Bento Weekly Calendar & Voyage Horizon (v2.6)

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

*최종 업데이트: 2026-05-20 (v2.6 PaceNote Chrono-Quarterly Bento Weekly Calendar 가이드라인 추가)*
