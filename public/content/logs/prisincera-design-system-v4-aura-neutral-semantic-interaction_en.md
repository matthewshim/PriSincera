# 📐 PriSincera Design System (v4.0: Aura-Neutral & Semantic Interaction)

## 📝 Revision History

| Version | Date | Author | Description | Impact Area |
| :--- | :--- | :--- | :--- | :--- |
| v2.0 | 2026-04-30 | Designer | Extensive redesign of the design system based on Premium Dark Mode | CSS System |
| v2.5 | 2026-05-19 | Designer | Definition of Bento Chrono-Calendar & 3-Tab Workstation Theme specifications | DailyDigest |
| v2.6 | 2026-05-20 | Designer | Establishment of PaceNote Bento Weekly Calendar & Voyage Horizon design token standards | PaceNote |
| v3.0 | 2026-05-27 | AI Agent | Optimization of spacing (Density) and complete elimination of purple background color leakage (Desaturated Chrono-Neutral) specification formalization | CSS Layout & Color System |
| v4.0 | 2026-05-27 | AI Agent | **Incorporation of next-generation Semantic CTA button design specifications and analysis of world-class design systems (Linear, Vercel, HIG)** | Global Brand System & UI Refactoring |

> **"Sincerity, Prioritized."**
> This document serves as the next-generation design system v4.0 standard guideline for the PriSincera website to achieve world-class design quality. 

---

## 0. 🌐 World-Class Design System Analysis & Preliminary Research (Preliminary Analysis)

We have researched and analyzed the design philosophies of global technology companies that have built the most sophisticated and premium design systems worldwide, internalizing them as the core design framework for PriSincera v4.0.

### 0-1. Linear's "Dark-First" & "Intentional Glow" Philosophy
* **Near-Black & Desaturated Base**: Linear adopts an extremely desaturated and refined dark gray background (`#0F0F10`) as its base to prevent 'optical vibration' and fatigue caused by the harsh contrast of pure black (`#000000`) on the user's eyes.
* **Border Highlights & Glows**: All physical areas are structured with an extremely thin, 1px translucent border (`rgba(255,255,255,0.05)`). A subtle 'glow' effect is applied around the object's edges only during interaction, imbuing static screens with vitality and spatial depth.
* **PriSincera v4.0 Integration**: We completely block purple background leakage and establish achromatic dark gray transparent materials (`rgba(10, 10, 10, 0.75)`, `rgba(17, 17, 17, 0.6)`) and translucent fine borders as the standard system skin.

### 0-2. Vercel's "Geist" & APCA Contrast & Semantic CTA Philosophy
* **APCA (Advanced Perceptual Contrast Algorithm) Orientation**: Typography layers are separated by precisely calculating the actual visual thickness and tonal contrast perceived by the human eye for light text on dark themes.
* **Semantic Button & Structural Ink**: Instead of indiscriminate overuse of chromatic colors, button hierarchies are aligned with structural intensity (Structural Ink). Primary buttons guide purpose with strong tonal contrast, while auxiliary buttons are clearly distinguished from the background by a defined hierarchy.
* **PriSincera v4.0 Integration**: We completely invalidate scattered ad-hoc button colors (green, indigo, purple, etc.) and declare global semantic CTA button specifications (`.btn-primary`, `.btn-secondary`, `.btn-glow`) to minimize user cognitive load.

### 0-3. Apple HIG (Human Interface Guidelines) "Material & Vibrancy"
* **Materials Hierarchy**: Cards (Surfaces) placed on the background form depth only through stages of white opacity and subtle transparent blur effects (`backdrop-filter: blur(24px)`), rather than their own color tones. This fundamentally prevents color overlay distortion between lower and upper layers.
* **PriSincera v4.0 Integration**: We completely remove the irregular purple mixed skins that existed on previous cards and unify them with achromatic white transparent blends (`rgba(255, 255, 255, 0.02)`) and a `blur(16px~24px)` combination.

---

## 1. 🎨 Color System: Refined & Sophisticated

**[Development Rationale]** When purple hues are mixed into the background or cards in `DailyDigest` articles or `PaceNote` weekly timelines where text needs to be read with focused attention for extended periods, readability sharply decreases due to color interference. Additionally, the visual effect of accented point colors on hover is diluted by the background color, diminishing the sense of sophistication.
**[v4.0 Design Standard]** The base surfaces of backgrounds and cards are refined to **pure achromatic (Desaturated Neutral OLED Slate)**, completely excluding purple blends. Noble brand colors, Violet and Cyan, are restricted to appear 'as vivid as jewels' only at moments of user interaction.

### 1-1. Base & Surfaces (OLED Black & Slate)
| Token | Hex / RGBA | Purpose and Design Intent |
|-------|-----------|-------------------------|
| `--bg-void` | `#000000` | Deep, pure black (OLED friendly, maximizes immersion) |
| `--bg-deep` | `#050505` | Deep background layer |
| `--bg-surface` | `#0A0A0A` | Dark gray primary surface |
| `--bg-elevated` | `#111111` / `#171717` | For floating elements, modals, emphasized cards |
| `--glass-bg` | `rgba(17, 17, 17, 0.6)` | Standard achromatic dark gray glass skin |
| `--glass-border` | `rgba(255, 255, 255, 0.04)` | Precise 1px ultra-fine structural line |
| `--glass-border-hover`| `rgba(255, 255, 255, 0.12)` | Precise structural line activated on hover |

### 1-2. Typography Colors (APCA & Legibility)
| Token | Hex / RGBA | Purpose and Expected Effect |
|-------|------------|----------------------------|
| `--text-primary` | `#FAFAFA` | Titles, main body text (using off-white to prevent glare) |
| `--text-secondary`| `#A1A1AA` | Secondary text, subtitles (Neutral Gray with high visual stability) |
| `--text-muted` | `#71717A` | Inactive text, supplementary information (meets minimum contrast ratio) |

### 1-3. Brand Accents & Gradients (The "Aura")
| Token | Hex / Value | Purpose |
|-------|-------------|---------|
| `--prism-violet` | `#6D28D9` | Main brand accent (for decisive moments) |
| `--prism-lavender`| `#A78BFA` | Sub-lighting effects, interaction feedback |
| `--orbit-cyan` | `#06B6D4` | Informational emphasis, Tech signals, link colors |
| `--gradient-brand` | `linear-gradient(135deg, #6D28D9, #A78BFA, #FBCFE8)` | **Elegant Aurora Gradient**. Exclusive to core Hero elements |
| `--gradient-cta` | `linear-gradient(135deg, rgba(109, 40, 217, 0.15), rgba(167, 139, 250, 0.1))` | Elegant translucent brand gradient exclusive to primary buttons |

---

## 2. 🔘 Semantic CTA Button Design Specification (Semantic CTA Button System)

**[Development Rationale]** In the existing code, buttons had different inline background hues (green, indigo, purple, etc.) and varying border thicknesses applied. This distorts user cognitive behavior patterns (Action Mapping) and diminishes brand credibility.
**[v4.0 Design Standard]** We establish global semantic CTA button specifications (`.btn-primary`, `.btn-secondary`, `.btn-glow`) to inherit consistent physical laws and visual tokens across all instances.

### 2-1. Token and Class Specifications by CTA Button Type

```css
/* 1. Primary CTA (.btn-primary) - Main Action Button */
.btn-primary {
  background: var(--gradient-cta);
  color: #FFFFFF;
  border: 1px solid rgba(196, 181, 253, 0.2);
  box-shadow: 0 4px 20px rgba(124, 58, 237, 0.15);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: var(--radius-pill);
  transition: all var(--duration-fast) var(--ease-spring);
}

.btn-primary:hover {
  background: linear-gradient(135deg, rgba(109, 40, 217, 0.25), rgba(167, 139, 250, 0.18));
  border-color: rgba(196, 181, 253, 0.35);
  box-shadow: 0 8px 30px rgba(124, 58, 237, 0.3);
  transform: translateY(-2px);
}

/* 2. Secondary CTA (.btn-secondary) - Auxiliary/Alternative Button */
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

/* 3. Interactive Glow CTA (.btn-glow) - Real-time Pulsing Feedback Button */
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

/* 4. Common Satisfying Click Effect (Active Pressed State) */
.btn-primary:active,
.btn-secondary:active,
.btn-glow:active {
  transform: scale(0.97) translateY(0) !important;
  transition-duration: 70ms !important;
}
```

---

## 3. 📐 Geometry & Spatial System (The 8-Point Grid & Spacing Optimization)

We abandon irregular spacing (`6px, 12px, 80px`) and introduce a **strict 4pt / 8pt Grid System**. The human eye unconsciously perceives comfort and sophistication in mathematical proportions.

| Token | Value | Purpose |
|-------|-------|-------------------------------|
| `--space-xs` | `4px` | Minimum spacing between elements (icons and text) |
| `--space-sm` | `8px` | Inline element spacing, small button padding |
| `--space-md` | `16px` | Component internal padding (Input, Button) |
| `--space-lg` | `24px` | Default large area internal padding |
| `--space-xl` | `32px` | Spacing between groups within a section |
| `--space-2xl` | `64px` | Spacing between major sections |
| `--space-3xl` | `128px` | Large Hero margins, page top/bottom margins |

### 3-1. 🚀 v4.0 Card & Content Spacing Optimization (Density)
Existing cards had excessive internal padding and wide gaps between cards relative to the text volume, leading to a sparse or cluttered screen appearance. In v4.0, we standardize as follows to ensure optimal information density.

* **Card Internal Padding (Card Padding)**:
  - Desktop/Tablet: Vertical padding is compactly adjusted from the existing `24px 32px` (`var(--space-lg) var(--space-xl)`) to **`20px 24px`** or **`16px 24px`** (17~33% reduction in top/bottom padding).
  - Mobile: `16px 20px` to enhance stack and information delivery.
* **Gap Between Cards (Flex/Grid Gap)**:
  - Desktop: Optimized from the existing `var(--space-lg)` (`24px`) to **`16px` (`var(--space-md)`)** or **`18px`** to ensure related cards are geometrically perceived as a clear group.
  - Tablet/Mobile: Reflows to `14px` or `16px` to ensure robust information flow.

### 3-2. Border Radius (Smooth Curves)
| Token | Value | Purpose |
|-------|-------|--------------------------|
| `--radius-sm` | `6px` | Checkboxes, small tags |
| `--radius-md` | `12px` | Standard cards, action buttons |
| `--radius-lg` | `24px` | Large panels in Bento Grid, modal windows |
| `--radius-full`| `9999px` | Pill-shaped CTA buttons |

---

## 4. 🔠 Typography & Multilingual Optimization

World-class typography aims to be 'perfectly and beautifully legible on any device'.

### 4-1. Language-Specific Font Stacks
To ensure perfect aesthetics and legibility in multilingual environments (English, Korean, Japanese), we optimize rendering quality by binding custom font stacks for each language.
* **English**: Font stacks like `Inter`, `Geist`, `SF Pro Display` are prioritized to maximize the modern proportions and geometric aesthetics of numbers and alphabets.
* **Korean**: `Pretendard Variable`, `Pretendard` are fully adopted to overcome imbalances in letter-spacing/line-height and optimize for clear scanning even in dark mode.
* **Japanese**: `Hiragino Sans`, `Hiragino Kaku Gothic ProN` (optimized for macOS/iOS), `Yu Gothic`, and `Meiryo` (optimized for Windows) are sequentially arranged to prevent distortion or clumsiness of default fonts during rendering and ensure legibility.

### 4-2. Dynamic Typography Scale (Fluid & Harmonious)
We apply a font system based on a geometric scale, rather than simple pixel units.

| Role | Font | Size | line-height | letter-spacing |
|------|------|--------|-------------|----------------|
| **Display (Hero)** | `--font-display` | `clamp(2.5rem, 6vw, 4.5rem)` | `1.1` | `-0.03em` |
| **Heading 1** | `--font-display` | `clamp(2rem, 4vw, 3rem)` | `1.2` | `-0.02em` |
| **Heading 2** | `--font-display` | `1.5rem ~ 2rem` | `1.3` | `-0.01em` |
| **Body Large** | `--font-body` | `1.125rem` (18px) | `1.6` | `0` |
| **Body Base** | `--font-body` | `1rem` (16px) | `1.6` | `0` |
| **Caption/Tag** | `--font-mono` | `0.75rem` (12px) | `1.4` | `0.05em` |

---

## 5. 🪞 Elevation & Glassmorphism 3.0

Beyond the first generation that relied on highly transparent purple backgrounds, we propose high-end glassmorphism utilizing **precise 1px borders and multi-layer shadows**.

### 5-1. Premium Card Surface (The "Jewel" Effect)
We reduce the color mixing of the existing `--glass-bg` and use pure white transparency.

```css
.premium-card {
  /* Background: subtle transparency of achromatic white */
  background: rgba(255, 255, 255, 0.02);
  
  /* Sophisticated blur processing */
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  
  /* Border: highlight border with a subtly brighter light reception effect only on the top */
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-lg);
  
  /* Multi-layer shadow for creating depth */
  box-shadow: 
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 24px 40px -8px rgba(0, 0, 0, 0.3);
    
  transition: transform var(--duration-fast) var(--ease-spring), border-color var(--duration-fast);
}

.premium-card:hover {
  background: rgba(255, 255, 255, 0.035);
  /* Brand color subtly appears only on hover */
  border-color: rgba(167, 139, 250, 0.3); 
  transform: translateY(-2px);
}
```

---

## 6. ⚡ Interaction & Animation

The core of premium UI is 'natural interactions that obey the laws of physics'.

### 6-1. Spring Physics-Based Transition
We use a tension-filled spring effect as the default, replacing the bland `ease-out`.

```css
:root {
  /* A satisfying spring curve used throughout the application */
  --ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.15);
  --ease-smooth: cubic-bezier(0.16, 1, 0.3, 1);
  
  --duration-fast: 200ms;
  --duration-normal: 400ms;
}
```

### 6-2. Micro-Interactions
* **Button Active State**: On click, `transform: scale(0.97)` is applied to provide a realistic tactile feedback of pressing a physical button.
* **Spotlight Glow**: On card hover, instead of just changing the border color, a light reflection (Glow) effect that follows the mouse cursor position inside the card is integrated into the global card system.

---

## 7. 🧩 Core Layout Pattern (The Unified Bento Grid)

We elevate the **Bento Grid**, currently fragmented across `PaceNoteDashboard` and `BuildersLog`, to the main official UI pattern.

1. **Gaps**: Grid gaps always maintain `var(--space-lg)` (24px) or `var(--space-md)` (16px).
2. **Spans**: Using a 12-column grid system as standard, dynamic combinations such as `span 8`, `span 4` (asymmetrical 2:1), or `span 7`, `span 5` are used depending on information hierarchy.
3. **Internal Padding**: Bento card interiors are by default top-left aligned, but padding is always fixed at `var(--space-lg)` (24px) or `var(--space-xl)` (32px) to fundamentally eliminate visual clutter.

---

## 8. 🌌 3D WebGL & Physics System (Phase 2.0)

PriSincera's spatial design has expanded beyond 2D planes into the Three.js-based 3D WebGL domain. To maintain visual consistency with HTML DOM elements, the following 3D-specific parameters (Tokens) are strictly adhered to.

### 8-1. Glassmorphism 3.0 (MeshTransmissionMaterial)
3D glass (crystal) objects must simulate 'refraction' and 'scattering' beyond simple transparency.
* **Transmission**: `1.0` (fully transparent)
* **Thickness**: `0.5 ~ 0.8` (thin and sharp glass)
* **Chromatic Aberration**: `0.15` (subtle ethereal scattering)
* **Iridescence**: `1.0` (luxurious rainbow reflection depending on light angle)
* **Attenuation Color**: `#6D28D9` (main brand color)

### 8-2. Volumetric Lighting & Space
* **Point Light (Internal Glow)**: Intensity `0.5 ~ 0.8`, Color `#A78BFA` (subtle lavender)
* **Ambient Light**: Intensity `0.4` (low illumination to maintain contrast with OLED black background)
* **Star Field (Space Background)**: Creates depth using a combination of `#C4B5FD` (purple stars) and `#7C3AED` (brand color dust).

### 8-3. Spring Physics Engine (Lerp & Damping)
To unify the tactile feel of 3D and 2D interactions, we use **damping**-based interpolation rather than linear movement.
* **Magnetic Hover**: `lerp(current, target, 0.05)` (moves 5% towards the target each frame, smooth tension)
* **Scroll Zoom-in**: Moves along the Z-axis proportionally to the scroll `progress` value, but prevents motion sickness by interpolating via `lerp` rather than reacting instantly.

---

## 9. 🗓️ Bento Chrono-Calendar & Themed Workstation System (v2.5)

This is the standard guideline for the **Bento Chrono-Calendar** and **3-Tab Workstation Theme System** established during the Daily Digest archive reorganization and 3-Tab workspace renewal. Implementation patterns and detailed design tokens are fully standardized so that other developers or AI can immediately understand and port them into code.

### 9-1. Chrono-Calendar Grid Specification (Preventing Layout Shift)
* **CLS (Cumulative Layout Shift) Control**: To prevent screen height fluctuations during month changes (Prev/Next Navigation), **42 grid cells** (6 weeks' worth) are always maintained, regardless of year/month. Remaining days from the previous month and starting days of the next month are padded with dummy cells, visually distinguished by opacity (`opacity: 0.2` or `0.05`).
* **Grid Layout**: `display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px;`
* **Cell State Definitions**:
  * **Inactive Days**: Mouse and pointer events are completely blocked (`pointer-events: none`), lightly transparent (`rgba(255, 255, 255, 0.15)`).
  * **Active Days**: Pointer activated, glassmorphism skin (`background: rgba(255,255,255,0.025)`, `border: 1px solid rgba(255,255,255,0.06)`).
  * **Today Indication**: Gold border accent (`border: 1px solid rgba(251, 191, 36, 0.4)`), today's text visualized (`.today-badge { color: #FBBF24 }`).
* **Active Hotspot & Pulse Glow**:
  * A 4px circular dot (`.hotspot-dot`) and a 12px radius faint aura (`.hotspot-glow`) are overlaid at the bottom center of active days.
  * `.hotspot-glow` continuously performs a smooth 2-second pulsating keyframe animation (`hotspotPulse`) from `scale(1.0)` to `scale(1.4)`.
  * **Mouse Hover**: The cell itself has a `scale(1.08)` physical bounce effect (`--ease-spring`), its border glows purple (`rgba(167, 139, 250, 0.4)`), and the internal `.hotspot-dot` expands to `scale(1.5)` and morphs to white (`#ffffff`).

### 9-2. 150ms Hover Debounce & Lazy-Load Architecture
* **Preventing API Call Overload**: When entering the archive main page, instead of fetching a high-volume list of all articles at once, only the publication date index (`/api/daily/index`) is fetched lightly once.
* **Debounce Lazy Load**:
  * To prevent triggering an API every time the mouse passes over an active date, a `150ms` debouncing timer is applied.
  * On mouse entry (`onMouseEnter`), the previous timer is immediately `clearTimeout`, and `/api/daily/{date}` is called in the background only when the cursor remains for `150ms`, dynamically binding the detailed quick peek information to the right.

### 9-3. 3-Tab Workstation Segmented & Ambient Morphing
This is a belt layout for instantly scanning three workspaces: IT Tech, AI Workstation, and Language Dojo, on the detail page (`/daily/{date}`).
* **Segmented Belt**: `display: flex; gap: 16px; justify-content: center; width: 100%;`
* **Belt Button Interaction**: On hover, icons subtly rotate (`rotate(3deg) scale(1.12)`), and upon entering an active state, they translate `translateY(-2px)` with an ambient glow of their individual theme color.
* **Ambient Morphing Backdrop**:
  * A large pseudo-element (`::before`) with `filter: blur(140px)` applied is placed behind the container (`.daily-feed-container`).
  * Each time the tab changes, the representative light (dominant color) of the theme smoothly fades into the background gradient.
    * **IT Tech (Signal)**: Lavender Aura (`rgba(167, 139, 250, 0.08)`)
    * **AI Workstation (Prompt)**: Cyan Aura (`rgba(6, 182, 212, 0.08)`)
    * **Language Dojo (Japanese)**: Rose Aura (`rgba(251, 207, 232, 0.08)`)
  * Transition Filter: `transition: background 0.8s cubic-bezier(0.25, 0.8, 0.25, 1), opacity 0.8s ease-in-out;`

### 9-4. 2-Stage Mobile Tap UX Flow (Preventing Accidental Mobile Taps)
* **Mobile Grid Reflow**: When media queries below 768px are applied, the desktop's 6:4 split grid is converted to a single vertical column (`grid-template-columns: 1fr`).
* **Preventing Accidental Navigation**: To alleviate fatigue caused by accidental mobile touches leading directly to a detailed analysis page, a 2-stage verification flow is applied.
  1. **Stage 1 (1st Tap)**: When an active date on the calendar is tapped on mobile, instead of navigating, data is bound to the **Quick Peek summary panel** at the bottom, and a smooth scroll to that quick peek location is initiated using `scrollIntoView({ behavior: 'smooth' })`.
  2. **Stage 2 (2nd Tap)**: The final detail screen (`/daily/{date}`) is navigated to only when the **"View Full Content Details →"** action button, prominently placed within the quick peek card, is touched a second time.

---

### 9-5. ⛵ PaceNote Bento Weekly Calendar & Voyage Horizon (v2.6)

This is a design system guideline for the **Chrono-Quarterly Bento Matrix (13-week per quarter)**, designed to maximize the weekly timeline operation of the PaceNote service (`/pacenote`).

* **Chrono-Quarterly Bento Layout**: The 52 weeks of the year are visualized not as a Gregorian calendar, but as **4 Bento boxes** per quarter (Q1~Q4). Since one quarter precisely matches **13 weeks**, a uniform and elegant Bento grid of `4 x 3 + 1` form is maintained.
  * **Desktop**: `display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px;` (Q1~Q4 arranged in a 2x2 symmetrical layout)
  * **Mobile/Tablet**: Reflows to `grid-template-columns: 1fr;` for a vertical stack-type Bento layout alignment.
* **Weekly Cell Visual State Specifications**:
  1. **Past Completed Weeks**: High-transparency glassmorphism skin (`background: rgba(0, 0, 0, 0.25)`, `border: 1px solid rgba(255, 255, 255, 0.06)`). Includes a micro-gauge bar (`cell-progress-fill`) at the bottom, proportional to the real-time Task completion rate (completed tasks / total tasks) for that week.
  2. **Current Active Week**: Cyber Cyan neon aura border (`#22D3EE`). Integrated with an outer glow animation (`pulseAura`) where the border softly pulses every 2 seconds, and a central pulsating dot indicator (`pulse-indicator`).
  3. **Future Locked Weeks**: Dimmed (`opacity: 0.25`), pointer and click blocked (`disabled`), dashed border (`border-style: dashed`), padlock icon (`🔒`) displayed.
* **0-Lag Debounced Hover Peek (150ms)**:
  * To prevent rendering load, the detailed summary overlay panel (`weekly-hover-peek-panel`) is smoothly slid up (`peekSlideUp`) only when the cursor remains static for `150ms` on mouse hover.
* **CLS Prevention & Spatial Normalization**:
  * Each 13-week grid card secures a fixed height (`height: 62px`) and a consistent minimum height, thereby protecting space to ensure absolutely no layout shift occurs when weeks are updated or navigated.

---
*Last updated: 2026-05-27 (v4.0 Global World-Class Design System Analysis & Semantic CTA Button System Design Added)*