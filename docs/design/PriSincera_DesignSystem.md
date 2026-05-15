# 📐 PriSincera Design System (v2.0: The Premium Evolution)

> **"Sincerity, Prioritized."**
> 본 문서는 PriSincera 웹사이트가 '세계 최고 수준(World-class)'의 디자인 품질을 달성하기 위한 차세대 디자인 시스템 가이드라인입니다. 
> 기존의 다소 채도가 높았던 네온(Neon)/퍼플(Purple) 톤을 탈피하고, **Apple, Linear, Vercel** 등 최상위 글로벌 SaaS 브랜드에서 사용하는 **'극도로 정제된 프리미엄 다크 모드(Premium Dark Mode)'**를 기준으로 재설계되었습니다.

---

## 1. 🎨 Color System: Refined & Sophisticated

**[문제점 분석]** 기존 시스템은 배경(`--bg-void`, `--bg-surface`)과 보조 텍스트(`--text-muted`)에 과도한 보라색이 섞여 있어, 텍스트가 많은 DailyDigest나 PaceNote에서 시각적 피로를 유발하고 명도 대비(Contrast)가 다소 부족했습니다.
**[개선 방향]** 배경과 텍스트는 채도가 배제된 무채색(Subtle Tint) 흑백 계열로 정제하여 완벽한 가독성을 확보하고, 브랜드 컬러(Violet)는 오직 '결정적인 순간(CTA, 하이라이트)'에만 빛나도록 제한합니다.

### 1-1. Base & Surfaces (OLED Black & Slate)
완벽한 대비를 위해 순수 블랙에 가까운 배경을 사용하고, 카드(Surface)는 투명도와 밝기(Lightness)로만 계층을 나눕니다.

| Token | Hex (New) | 기존 대비 개선점 |
|-------|-----------|------------------|
| `--bg-void` | `#050505` | 기존(`#0A0714`)보다 더 깊고 순수한 블랙 (OLED 친화적, 몰입감 극대화) |
| `--bg-surface` | `#111111` | 채도를 뺀 다크 그레이로 텍스트와의 명도 대비 향상 |
| `--bg-elevated` | `#1A1A1A` | 플로팅 요소, 모달, 강조 카드 전용 |

### 1-2. Typography Colors (Maximum Legibility)
보라색 텍스트(`#6D5BA3`)를 배제하고, 철저한 명도 대비 기반의 뉴트럴 텍스트 토큰을 도입합니다.

| Token | Hex / RGBA | 용도 및 기대 효과 |
|-------|------------|-------------------|
| `--text-primary` | `#FAFAFA` | 제목, 주요 본문 (순백색 `#FFF`의 눈부심 방지를 위해 오프화이트 사용) |
| `--text-secondary`| `#A1A1AA` | 보조 텍스트, 서브타이틀 (시각적 안정감이 높은 Neutral Gray) |
| `--text-muted` | `#71717A` | 비활성 텍스트, 부가 설명 (명도 대비 최소 기준 충족) |

### 1-3. Brand Accents & Gradients (The "Aura")
형광 느낌을 줄이고, 깊이 있고 우아한(Elegant) 브랜드 아우라를 형성합니다.

| Token | Hex / Value | 용도 |
|-------|-------------|------|
| `--prism-violet` | `#6D28D9` | 메인 브랜드 액센트 (기존보다 채도를 살짝 낮춰 고급스러움 확보) |
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

---

## 3. 📐 Geometry & Spatial System (The 8-Point Grid)

불규칙한 스페이싱(`6px, 12px, 80px`)을 버리고, **엄격한 4pt / 8pt Grid System**을 도입합니다. 인간의 눈은 수학적 비례에서 무의식적인 편안함과 고급스러움을 느낍니다.

| Token | 값 | 용도 |
|-------|---|------|
| `--space-xs` | `4px` | 요소 간 최소 간격 (아이콘과 텍스트) |
| `--space-sm` | `8px` | 인라인 요소 간격, 작은 버튼 패딩 |
| `--space-md` | `16px` | 컴포넌트 내부 패딩 (Input, Button) |
| `--space-lg` | `24px` | 기본 카드 내부 패딩 |
| `--space-xl` | `32px` | 대형 카드 내부 패딩, 섹션 내 그룹 간격 |
| `--space-2xl` | `64px` | 주요 섹션 간 간격 |
| `--space-3xl` | `128px` | 대형 Hero 여백, 페이지 상하단 여백 |

### 3-1. Border Radius (부드러운 곡선)
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

*최종 업데이트: 2026-05-15 (v2.0 Premium Upgrade)*
