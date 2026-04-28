# 📐 PriSincera Design System

> 이 문서는 PriSincera 웹사이트의 디자인 시스템을 정리하고,  
> 메인 페이지와 서브 페이지(PriSignal) 간의 일관성을 보장하기 위한 가이드입니다.

---

## 1. Design Tokens (CSS Custom Properties)

### 1-1. Color Palette

| Token | Hex | 용도 |
|-------|-----|------|
| `--bg-void` | `#0A0714` | 전역 배경 (가장 어두운 층) |
| `--bg-deep` | `#0F0A1E` | 딥 배경 |
| `--bg-surface` | `#1A1035` | 카드·섹션 배경 기본색 |
| `--bg-elevated` | `#231A46` | 강조 영역 배경 |
| `--prism-violet` | `#7C3AED` | 브랜드 메인 바이올렛 |
| `--prism-lavender` | `#C084FC` | 라벤더 보조색 |
| `--prism-rose` | `#F0ABFC` | 로즈 보조색 |
| `--prism-amber` | `#FDE68A` | 앰버 액센트 |
| `--crystal-white` | `#E9D5FF` | 밝은 크리스탈 |
| `--crystal-light` | `#C4B5FD` | 중간 크리스탈 |
| `--orbit-cyan` | `#22D3EE` | 시안 액센트 (링크, CTA) |
| `--orbit-cyan-light` | `#67E8F9` | 밝은 시안 |
| `--text-primary` | `#F5F3FF` | 주요 텍스트 |
| `--text-secondary` | `#A78BFA` | 보조 텍스트 (강조) |
| `--text-muted` | `#6D5BA3` | 보조 설명 텍스트 |

### 1-2. Gradients

| Token | 값 | 용도 |
|-------|---|------|
| `--gradient-brand` | `linear-gradient(135deg, #7C3AED, #C084FC, #F0ABFC, #FDE68A)` | **브랜드 하이라이트 그라디언트** — 제목 accent, 인디케이터 등 |
| `--gradient-subtle` | `linear-gradient(135deg, #7C3AED, #C084FC)` | 장식 요소, 밑줄, 라인 등 |
| `--gradient-cta` | `linear-gradient(135deg, #7C3AED, #A855F7, #C084FC)` | CTA 버튼 배경 |

### 1-3. Typography

| Token | 값 | 용도 |
|-------|---|------|
| `--font-display` | `'Outfit', 'Noto Sans KR', sans-serif` | **제목, 레이블, 강조** |
| `--font-body` | `'Noto Sans KR', 'Inter', sans-serif` | 본문 텍스트 |
| `--font-mono` | `'JetBrains Mono', monospace` | 코드, 카운터, 섹션 라벨 |

### 1-4. Spacing Scale

| Token | 값 | 용도 |
|-------|---|------|
| `--space-xs` | `6px` | 미세 간격 |
| `--space-sm` | `12px` | 작은 간격 |
| `--space-md` | `24px` | 기본 간격 |
| `--space-lg` | `32px` | 큰 간격 |
| `--space-xl` | `48px` | 섹션 패딩 |
| `--space-2xl` | `80px` | 대형 섹션 간격 |
| `--space-3xl` | `120px` | 최대 여백 |

### 1-5. Border Radius

| Token | 값 | 용도 |
|-------|---|------|
| `--radius-sm` | `8px` | 작은 요소 |
| `--radius-md` | `16px` | 카드, 패널 |
| `--radius-lg` | `24px` | 대형 컨테이너 |
| `--radius-pill` | `100px` | 태그, 배지 |

### 1-6. Animation

| Token | 값 | 용도 |
|-------|---|------|
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | 표준 ease-out |
| `--ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | 바운스 효과 |
| `--ease-smooth` | `cubic-bezier(0.4, 0, 0.2, 1)` | 부드러운 전환 |
| `--duration-fast` | `0.3s` | 빠른 인터랙션 |
| `--duration-normal` | `0.6s` | 일반 전환 |
| `--duration-slow` | `1s` | 느린 등장 |

---

## 2. Typography Scale (타이포그래피 규격)

### 2-1. 메인 페이지 기준 (정규화된 스케일)

| 역할 | 폰트 | 사이즈 | weight | 적용 예시 |
|------|------|--------|--------|----------|
| **Hero Title** | `--font-display` | `clamp(2rem, 5vw, 3.5rem)` | 700 | "Sincerity, Prioritized." |
| **Section Title** | `--font-display` | `clamp(1.8rem, 3.5vw, 2.5rem)` | 700 | "우리가 지나온 여정", "프로젝트" |
| **Philosophy Title** | `--font-display` | `clamp(2rem, 4vw, 2.8rem)` | 700 | "복잡함 속에서, 별은 만들어집니다." |
| **Body Lead** | `--font-body` | `clamp(1rem, 1.5vw, 1.1rem)` | 400 | 첫 리드 문장 (color: `--text-secondary`) |
| **Body Text** | `--font-body` | `clamp(0.9rem, 1.3vw, 1rem)` | 400 | 설명 문단 (color: `--text-muted`) |
| **Card Title** | `--font-display` | `1rem ~ 1.2rem` | 600 | 카드 헤딩 |
| **Card Desc** | `--font-body` | `0.88rem ~ 0.9rem` | 400 | 카드 설명 |
| **Section Label** | `--font-mono` | `0.7rem` | 400 | "// PHILOSOPHY" 등 모노 라벨 |
| **Mono Tag** | `--font-mono` | `0.6rem ~ 0.65rem` | 400 | 태그, 카테고리 |
| **Subtitle** | `--font-body` | `clamp(0.85rem, 1.3vw, 1rem)` | 400 | 섹션 부제 |

### 2-2. PriSignal 페이지 현재 적용

| 역할 | 현재 사이즈 | 메인 기준 사이즈 | 상태 |
|------|------------|----------------|------|
| Hero Title | `clamp(2.2rem, 5vw, 3.5rem)` | `clamp(2rem, 5vw, 3.5rem)` | ✅ 일관 |
| **Section Title** | `clamp(1.3rem, 2.5vw, 1.8rem)` | `clamp(1.8rem, 3.5vw, 2.5rem)` | ⚠️ **축소됨** |
| **Value Card Title** | `1.05rem` | `1rem ~ 1.2rem` | ✅ 허용 범위 |
| **Value Card Desc** | `0.85rem` | `0.88rem ~ 0.9rem` | ⚠️ 미세하게 작음 |
| **Category Name** | `0.95rem` | `1rem` | ⚠️ 미세하게 작음 |
| **Category Desc** | `0.8rem` | `0.88rem` | ⚠️ **작음** |
| **Signal Desc** | `0.8rem` | `0.88rem` | ⚠️ **작음** |
| **FAQ Question** | `0.95rem` | `1rem` | ⚠️ 미세하게 작음 |
| **FAQ Answer** | `0.88rem` | `0.88rem` | ✅ 일치 |
| **CTA Title** | `clamp(1.3rem, 2.5vw, 1.8rem)` | `clamp(1.8rem, 3.5vw, 2.5rem)` | ⚠️ **축소됨** |

---

## 3. 텍스트 하이라이트 효과 (Accent Highlight)

### 3-1. 표준 패턴 — 그라디언트 텍스트 하이라이트

메인 페이지에서는 모든 섹션 타이틀에 **핵심 단어를 `gradient-brand`로 하이라이팅** 하는 패턴을 일관되게 사용합니다.

#### CSS 규칙 (공통):
```css
.accent {
    background: var(--gradient-brand);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}
```

#### 메인 페이지 적용 현황:

| 섹션 | 텍스트 | accent 적용 |
|------|--------|------------|
| Hero | "Sincerity, **Prioritized.**" | ✅ "Prioritized." |
| Philosophy | "복잡함 속에서, **별은 만들어집니다.**" | ✅ 두 번째 줄 |
| Journey | "우리가 지나온 **여정**" | ✅ "여정" |
| Work | "함께 만든 **결과물**" | ✅ "결과물" |
| Declaration | "이것이 **PriSincera**입니다." | ✅ `<strong>` 그라디언트 |

#### PriSignal 페이지 적용 현황:

| 섹션 | 텍스트 | accent 적용 |
|------|--------|------------|
| Hero Title | "Pri**Signal**" | ✅ 적용됨 |
| **Value Title** | "왜 PriSignal인가?" | ❌ **누락** |
| **Categories Title** | "다루는 시그널" | ❌ **누락** |
| **Signal Title** | "시그널을 고르는 기준" | ❌ **누락** |
| **CTA Title** | "시그널을 놓치지 마세요" | ❌ **누락** |
| **FAQ Title** | "자주 묻는 질문" | ❌ **누락** |
| ~~Archive Title~~ | ~~"최근 시그널"~~ | — **제거됨** (v3, 탭 자체가 레이블) |
| ~~Daily Title~~ | ~~"데일리 시그널"~~ | — **제거됨** (v3, 날짜가 핵심 정보) |

### 3-2. `<strong>` 하이라이트 패턴

메인에서는 본문 내 강조 텍스트를 `--text-secondary` 색상 또는 `gradient-brand` `<strong>`으로 처리합니다.

```css
/* 본문 내 강조 — Philosophy */
.philosophy-lead strong {
    color: var(--text-secondary);  /* #A78BFA */
    font-weight: 500;
}

/* 선언문 내 브랜드명 — gradient */
.declaration-text strong {
    font-family: var(--font-display);
    font-weight: 600;
    background: var(--gradient-brand);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}
```

PriSignal의 본문 텍스트에는 이러한 `<strong>` 하이라이트가 전혀 적용되어 있지 않습니다.

---

## 4. Glassmorphism & Card 패턴

### 4-1. 섹션 컨테이너 (표준)

메인 페이지의 모든 콘텐츠 섹션은 **Glassmorphic 컨테이너**를 사용합니다:

```css
/* 표준 Glassmorphic Container */
background: rgba(10, 7, 20, 0.72);
backdrop-filter: blur(24px);
-webkit-backdrop-filter: blur(24px);
border: 1px solid rgba(196, 181, 253, 0.06);
border-radius: 24px;
padding: var(--space-2xl) var(--space-xl);
box-shadow:
    0 4px 60px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(196, 181, 253, 0.04);
```

PriSignal의 경우 이 래핑 컨테이너가 없이 직접 바탕에 콘텐츠를 배치합니다. (의도된 디자인)

### 4-2. 카드 스타일 (표준)

```css
/* 표준 Inner Card */
background: rgba(26, 16, 53, 0.55);
backdrop-filter: blur(16px);
-webkit-backdrop-filter: blur(16px);
border: 1px solid rgba(196, 181, 253, 0.08);
border-radius: 16px;
cursor: pointer;  /* v4: 카드 전체 클릭 */
```

**Hover 효과 (표준):**
```css
border-color: rgba(196, 181, 253, 0.15);
transform: translateY(-4px);
box-shadow: 0 12px 40px rgba(124, 58, 237, 0.12),
            0 0 1px rgba(196, 181, 253, 0.2);
```

**마우스 추적 글로우 (v4):**
```css
.card::before {
  background: radial-gradient(
    600px circle at var(--mouse-x) var(--mouse-y),
    rgba(196,181,253,0.06), transparent 40%
  );
}
```
- JS에서 `--mouse-x`, `--mouse-y` CSS 변수를 카드에 전달

### 4-3. Left Accent Line (카드 좌측 장식선)

메인 페이지의 카드들은 좌측에 컬러 액센트 라인을 가집니다:

```css
&::before {
    content: '';
    position: absolute;
    left: 0;
    top: 20%; bottom: 20%;
    width: 2px;
    background: var(--card-accent, #C4B5FD);
    opacity: 0.3;
    transition: all var(--duration-normal) var(--ease-out);
    border-radius: 1px;
}
```

PriSignal 카테고리 카드에도 유사하게 적용되어 있어 **일관성 유지됨** ✅

### 4-4. Work 섹션 카드 패턴 (v4 통일)

두 카드 모두 동일한 `work-card` 구조:
- **레이블**: `var(--font-mono)`, `var(--orbit-cyan)` — 두 카드 동일
- **구조**: 좌측 아이콘 + 우측 (label > name+tag > desc > tags)
- **PriSignal 카드**: `work-card.prisignal` 클래스, `--card-accent: var(--orbit-cyan)`
- **PriSincera 카드**: `work-card.featured` 클래스, `--card-accent: #7C3AED`

---

## 5. 섹션 라벨 패턴

### 메인 페이지 — Mono Section Label

```css
.section-label {
    font-family: var(--font-mono);
    font-size: 0.7rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--text-muted);
    opacity: 0.6;
}

/* Left gradient line */
.section-label::before {
    content: '';
    position: absolute;
    left: 0; top: 50%;
    width: 18px; height: 1px;
    background: var(--gradient-subtle);
}
```

**PriSignal**: Section Label 패턴이 사용되지 않음 (각 섹션이 h2 타이틀로 직접 시작). 이는 PriSignal이 랜딩 페이지 스타일이므로 의도된 것일 수 있으나, 일관성을 위해 검토 필요.

---

## 6. 불일치 요약 및 개선 가이드

### 🔴 Critical — 즉시 수정 필요

| 항목 | 현황 | 개선 방향 |
|------|------|----------|
| **섹션 타이틀 accent 누락** | 6개 섹션 타이틀에 gradient-brand 하이라이트 없음 | 핵심 키워드에 `.accent` 클래스 적용 |
| **섹션 타이틀 사이즈** | `clamp(1.3rem, 2.5vw, 1.8rem)` — 메인 대비 축소 | `clamp(1.6rem, 3vw, 2.2rem)` 이상으로 조정 |

### 🟡 Minor — 개선 권장

| 항목 | 현황 | 개선 방향 |
|------|------|----------|
| 카드 설명 텍스트 사이즈 | `0.8rem ~ 0.85rem` | `0.88rem`로 통일 |
| 카테고리 이름 사이즈 | `0.95rem` | `1rem`으로 조정 |
| FAQ 질문 사이즈 | `0.95rem` | `1rem`으로 조정 |
| 본문 `<strong>` 효과 | 미적용 | `color: var(--text-secondary)` 적용 검토 |

### ✅ 일관성 유지됨

| 항목 | 상태 |
|------|------|
| Hero Title 스케일 | ✅ |
| 카드 배경 & 테두리 | ✅ |
| 호버 효과 패턴 | ✅ |
| 좌측 액센트 라인 | ✅ |
| 폰트 패밀리 사용 | ✅ |
| 색상 토큰 사용 | ✅ |
| 스페이싱 토큰 사용 | ✅ |

---

## 7. 섹션 타이틀 Accent 적용 가이드

각 섹션 타이틀에 핵심 키워드를 그라디언트 하이라이팅 하는 표준 패턴:

### JSX 패턴:
```jsx
<h2 className="prisignal-value-title">
  왜 <span className="accent">PriSignal</span>인가?
</h2>
```

### CSS 패턴 (이미 PriSignal Hero에 존재):
```css
.prisignal-value-title .accent,
.prisignal-categories-title .accent,
.prisignal-signal-title .accent,
.prisignal-cta-title .accent,
.prisignal-faq-title .accent,
.prisignal-archive-title .accent {
    background: var(--gradient-brand);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}
```

### 권장 accent 적용:

| 섹션 | 전체 텍스트 | accent 대상 | 상태 |
|------|-----------|------------|------|
| Value | "왜 PriSignal인가?" | "PriSignal" | ❌ 미적용 |
| Categories | "다루는 시그널" | "시그널" | ❌ 미적용 |
| Signal | "시그널을 고르는 기준" | "기준" | ❌ 미적용 |
| CTA | "시그널을 놓치지 마세요" | "시그널" | ❌ 미적용 |
| FAQ | "자주 묻는 질문" | "질문" | ❌ 미적용 |
| ~~Archive~~ | ~~"최근 시그널"~~ | — | **제거됨** |
| ~~Daily~~ | ~~"데일리 시그널"~~ | — | **제거됨** |

---

## 8. PriSignal Daily Detail — 컴포넌트 패턴

> 파일: `src/pages/PriSignalDaily.jsx`, `src/pages/PriSignalDaily.css`

### 8-1. 헤더 날짜 네비게이션

```
┌──────────────────────────────────────────────────┐
│  ‹ 04-20(월)      21  4월 화요일      04-22(수) ›  │
│                   [Daily List >]                  │
└──────────────────────────────────────────────────┘
```

- `justify-content: space-between` — 화살표를 양 끝으로 밀어냄
- 화살표: ghost 스타일 (테두리/배경 없음), hover 시 `color: --text-primary`
- 날짜 숫자: `clamp(3rem, 8vw, 4.5rem)` + `--gradient-brand` 텍스트
- Daily List 버튼: pill 형태, `/prisignal#daily`로 이동

### 8-2. 필터 칩

```
[ 전체 21 ] [ ● DM 픽 5 ] [ ● AI & Future 7 ] [ ● Global 6 ] ...
```

- `--chip-color` CSS variable로 컬러 도트 색상 제어
- DM 픽 필터: `isDmPick === true` 기준 필터링
- 활성 필터: `rgba(196, 181, 253, 0.15)` 배경 + bold

### 8-3. 아티클 카드

```css
/* 기본 카드 */
background: rgba(255, 255, 255, 0.03);
border: 1px solid rgba(255, 255, 255, 0.06);
border-radius: 14px;

/* DM Pick 카드 */
border-color: rgba(196, 181, 253, 0.2);
background: rgba(196, 181, 253, 0.04);
```

### 8-4. 에디터 코멘트 (v4 — Editor's Signal)

```css
border-left: 3px solid rgba(196, 181, 253, 0.3);
padding-left: 14px;
/* CSS grid 기반 부드러운 접힘/펼침 */
display: grid;
grid-template-rows: 0fr; /* 접힘 */
grid-template-rows: 1fr; /* 펼침 */
```

- 큰따옴표(") 아이콘 + "Editor's Signal" 라벨
- 접힌 상태에서 첫 1줄 프리뷰 노출
- `stopPropagation()`으로 카드 전체 클릭과 독립 동작
- 기본 템플릿 문구 자동 필터링 (`isDefaultComment()` 함수)

### 8-5. 구독 메타 텍스트 규칙 (v4)

"매일 발송 · 무료 · 언제든 해지" 텍스트는 UI 안내 텍스트이므로:
- **폰트**: `var(--font-body)` (Noto Sans KR) — `font-mono` 사용 금지
- **사이즈**: `0.72rem`, `letter-spacing: 0.02em`

> `--font-mono`는 숫자 카운트, 날짜, 기술 데이터 전용입니다.

### 8-6. 망원경 커서 (v4 최적화)

- 크기: 120px → **80px** (클릭 대상 가시성 향상)
- React state 0개: `classList` 직접 조작 (리렌더 제거)
- GPU 가속: `transform: translate()` + `will-change: transform`
- DOM 쿼리: `getBoundingClientRect()` 30프레임마다 1회
- `prefers-reduced-motion: reduce` 대응

---

## 9. 반응형 브레이크포인트

| 브레이크포인트 | 변경 내용 |
|--------------|----------|
| `≤ 1024px` | 2열 그리드 → 1열, 텍스트 패딩 리셋 |
| `≤ 768px` | 모바일 레이아웃, 패딩 축소, GNB 높이 변경, 망원경 커서 숨김 |
| `≤ 640px` | Daily Detail: 날짜 폰트 축소(2.5rem), 화살표 라벨 숨김, 카드 패딩 축소, 탭 바 마진 축소 |

---

*최종 업데이트: 2026-04-28*
