# PriSignal UX 전면 리디자인 계획

> **작성일:** 2026-04-28  
> **상태:** 검토 대기  
> **범위:** 랜딩 · 데일리 상세 · 아카이브 목록 — 전 영역

---

## 1. 현재 상태 진단

### 1.1 핵심 문제 요약

| 영역 | 문제 | 심각도 |
|------|------|--------|
| **랜딩 히어로** | 구독 폼이 시각적으로 묻혀 있고, 가치 제안(VP)이 약함. CTA 버튼이 폼과 분리되어 전환률 저하 | 🔴 |
| **랜딩 서비스 소개** | 3개 카드가 단순 나열. 인터랙션 없이 정적. 읽히지 않는 텍스트 덩어리 | 🟡 |
| **데일리 상세 카드** | 카드 hover가 미약한 `translateY(-2px)` 뿐. 카드 내부 정보 위계가 평면적. 읽기 리듬 부재 | 🔴 |
| **데일리 필터 칩** | 선택 시 피드백이 배경색 변화뿐. 필터 전환 애니메이션 없음 | 🟡 |
| **데일리 에디터 코멘트** | 접힌 상태에서 존재감 없음. 펼침 시에도 `max-height` 애니메이션이 거칠음 | 🟡 |
| **데일리 CTA** | 페이지 최하단에 1회 노출. 스크롤 중 접근 불가. 구독 유도력 부족 | 🔴 |
| **아카이브 카드** | 4px 스트라이프만으로는 시각적 앵커 부족. 호버 시 스트라이프 글로우 외 인터랙션 없음 | 🟡 |
| **공통** | 카드 진입 애니메이션이 단일 패턴(`translateY(8px)`). 스태거 없어 기계적 | 🟡 |

### 1.2 레퍼런스 벤치마크

| 서비스 | 강점 | PriSignal 적용점 |
|--------|------|-----------------|
| **TLDR** | 극도의 스캔성, 텍스트-퍼스트, 명확한 섹션 분리 | 카드 내부 정보 위계 강화, 볼드 제목 + 가벼운 요약 구조 |
| **Morning Brew** | 강렬한 브랜드 아이덴티티, 대화형 톤, 광고/콘텐츠 구분 명확 | 에디터 코멘트를 "에디터 노트" 형태로 격상, 브랜드 톤 강화 |
| **Substack** | 단순 명쾌한 구독 폼, 소셜 프루프(구독자 수), 원클릭 CTA | 구독 폼 단순화 + 소셜 프루프 추가 |
| **Exec Sum** | 프로 미학, 테마별 블록, 폴링/밈 같은 인터랙티브 요소 | 카테고리 섹션을 "테마 블록"으로 시각 분리 |
| **Feedly** | 카드 호버 시 콘텐츠 프리뷰 확장, 부드러운 전환 | 카드 호버 인터랙션 고도화 |

---

## 2. 개선 계획 — 6개 모듈

### Module A: 카드 인터랙션 디자인 (데일리 상세)

**현재:** `translateY(-2px)` + `border-color 변화` 뿐  
**목표:** 카드가 "살아 있다"고 느끼는 리치 인터랙션

#### A-1. 호버 상태 고도화

```css
/* Before */
.prisignal-daily-card:hover {
  border-color: rgba(255,255,255,0.12);
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0,0,0,0.2);
}

/* After — Layered Depth + Glow + Inner Light */
.prisignal-daily-card {
  transition:
    transform 0.35s cubic-bezier(0.4, 0, 0.2, 1),
    border-color 0.35s ease,
    box-shadow 0.35s ease,
    background 0.35s ease;
}
.prisignal-daily-card::before {
  content: '';
  position: absolute; inset: 0;
  border-radius: inherit;
  background: radial-gradient(
    800px circle at var(--mouse-x) var(--mouse-y),
    rgba(196,181,253,0.06), transparent 40%
  );
  opacity: 0;
  transition: opacity 0.5s;
  pointer-events: none;
}
.prisignal-daily-card:hover {
  transform: translateY(-4px);
  border-color: rgba(196,181,253,0.2);
  box-shadow:
    0 4px 12px rgba(0,0,0,0.15),
    0 16px 48px rgba(124,58,237,0.08);
  background: rgba(255,255,255,0.055);
}
.prisignal-daily-card:hover::before { opacity: 1; }
```

- **마우스 추적 글로우**: JS로 `--mouse-x`, `--mouse-y` CSS 변수를 카드에 전달 → 마우스 위치에 따라 내부 빛이 따라다님
- **3단계 그림자**: 가까운 그림자 + 먼 그림자 + 브랜드 컬러 글로우
- **DM Pick 카드**: 별도의 보라색 글로우 강도 2배

#### A-2. 카드 진입 애니메이션 — 스태거 적용

```css
.prisignal-daily-card {
  animation: cardReveal 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
  animation-delay: calc(var(--card-index, 0) * 60ms);
}
@keyframes cardReveal {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.97);
    filter: blur(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0);
  }
}
```

- JSX에서 `style={{ '--card-index': index }}`로 인덱스 전달
- 각 카드가 60ms 간격으로 순차 등장 → "폭포(waterfall)" 효과
- `filter: blur(4px) → blur(0)` 추가로 초점 맞춰지는 느낌

#### A-3. 제목 호버 — 밑줄 애니메이션

```css
.prisignal-daily-card-title a {
  background-image: linear-gradient(
    to right, var(--prisignal-accent, #C4B5FD), var(--orbit-cyan, #22D3EE)
  );
  background-size: 0% 2px;
  background-repeat: no-repeat;
  background-position: left bottom;
  transition: background-size 0.35s cubic-bezier(0.4, 0, 0.2, 1), color 0.2s;
}
.prisignal-daily-card-title a:hover {
  background-size: 100% 2px;
  color: var(--prisignal-accent, #C4B5FD);
}
```

- 좌→우 그라데이션 밑줄이 호버 시 슬라이드인
- 브랜드 퍼플 → 시안 그라데이션 활용

### Module B: 에디터 코멘트 리디자인

**현재:** 접힌 상태에서 "✍️ 에디터 추천"이라는 작은 버튼 → 존재감 없음  
**목표:** 에디터의 관점을 프리미엄 콘텐츠로 격상

#### B-1. "에디터 노트" 디자인

```
┌─ card ──────────────────────────────────────────┐
│ ...article content...                            │
│                                                  │
│ ┌─ editor-note ──────────────────────────────┐   │
│ │ ┌──┐                                       │   │
│ │ │""│ Editor's Signal                        │   │
│ │ └──┘                                       │   │
│ │ "이 기사가 중요한 이유는 현재 AI 하드웨어   │   │
│ │  시장의 구조적 전환을 보여주기 때문입니다."  │   │
│ └────────────────────────────────────────────┘   │
│ 원문 읽기 ↗                                      │
└──────────────────────────────────────────────────┘
```

- 접힌 상태에서도 **첫 1줄 프리뷰** 노출 (현재는 완전히 숨김)
- 큰따옴표(") 아이콘 + "Editor's Signal" 라벨
- 좌측에 `3px 퍼플 보더` 추가로 인용문 느낌
- 클릭 시 부드러운 height auto 전환 (CSS grid trick)

```css
.prisignal-daily-editor-note {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border-left: 3px solid rgba(196, 181, 253, 0.3);
  padding-left: 16px;
  margin: var(--space-sm) 0;
}
.prisignal-daily-editor-note.expanded {
  grid-template-rows: 1fr;
}
.prisignal-daily-editor-note-inner {
  overflow: hidden;
}
```

### Module C: 구독 전환 UX 최적화

**현재 문제:**
1. 구독 폼이 히어로 섹션에 1회만 노출
2. 데일리 상세 하단 CTA가 `/prisignal`로 리디렉트 (추가 클릭 필요)
3. 소셜 프루프(구독자 수, 추천 문구) 없음

#### C-1. 플로팅 CTA 바

데일리 상세 페이지에서 스크롤 시 하단에 **플로팅 구독 바** 표시:

```
┌──────────────────────────────────────────────────────────┐
│ 📡 매일 5개 핵심 시그널, 이메일로 받기  [이메일 입력] [구독] │
└──────────────────────────────────────────────────────────┘
```

- 첫 카드가 뷰포트에서 벗어날 때 등장 (`IntersectionObserver`)
- 페이지 하단 CTA 섹션이 보이면 자동 숨김 (중복 방지)
- `backdrop-filter: blur(20px)` + 슬라이드업 애니메이션

#### C-2. 히어로 구독 폼 강화

```
현재: [이메일 입력] [구독하기]
개선: 
  "35개 글로벌 소스 × AI 스코어링 — 매일 5분"  ← 구체적 VP
  [이메일을 입력하세요]  [무료 구독 →]           ← 액션 동사 강화
  ✓ 무료  ✓ 매일 아침 발송  ✓ 언제든 해지
  "현재 XX명의 PO/PM이 구독 중" ← 소셜 프루프
```

#### C-3. 데일리 상세 하단 CTA → 인라인 구독 폼

현재 `/prisignal`로 이동시키는 버튼 → **직접 이메일 입력 가능한 인라인 폼**으로 변경

### Module D: 아카이브 목록 카드 고도화

**현재:** 4px 스트라이프 + 텍스트. 인터랙션이 빈약  
**목표:** 각 카드가 "하루치 시그널의 압축본"으로 기능

#### D-1. 호버 인터랙션 강화

```css
.prisignal-archive-card {
  transition:
    transform 0.35s cubic-bezier(0.4, 0, 0.2, 1),
    border-color 0.3s ease,
    box-shadow 0.3s ease;
}
.prisignal-archive-card:hover {
  transform: translateY(-6px) scale(1.01);
  border-color: rgba(196, 181, 253, 0.25);
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.15),
    0 20px 60px rgba(124, 58, 237, 0.06);
}
/* 호버 시 스트라이프 높이감 + 글로우 */
.prisignal-archive-card:hover .prisignal-archive-card-accent {
  width: 5px;
  box-shadow:
    0 0 16px color-mix(in srgb, var(--accent-color) 50%, transparent),
    0 0 4px var(--accent-color);
}
/* 호버 시 '보기 >' 화살표 슬라이드 */
.prisignal-archive-card:hover .prisignal-archive-card-read {
  opacity: 1;
  gap: 8px;
  transform: translateX(4px);
}
```

#### D-2. 호버 시 대표 기사 요약 노출

호버 시 `card-headline` 아래에 **한 줄 요약이 슬라이드다운** 등장:

```css
.prisignal-archive-card-preview {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
.prisignal-archive-card:hover .prisignal-archive-card-preview {
  grid-template-rows: 1fr;
}
```

#### D-3. 카드 진입 스태거

아카이브 카드도 `--card-index` 기반 스태거 등장:

```css
.prisignal-archive-card {
  animation: archiveReveal 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
  animation-delay: calc(var(--card-index, 0) * 80ms);
}
@keyframes archiveReveal {
  from { opacity: 0; transform: translateY(24px) scale(0.98); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
```

### Module E: 필터 칩 인터랙션

**현재:** 배경색 변화만. 전환 시 카드가 즉시 교체 (점프)  
**목표:** 필터 전환이 "부드럽게 흐르는" 경험

#### E-1. 필터 칩 선택 피드백

```css
.prisignal-daily-filter-chip.active {
  background: rgba(196, 181, 253, 0.18);
  border-color: rgba(196, 181, 253, 0.4);
  color: var(--text-primary);
  box-shadow: 0 0 12px rgba(196, 181, 253, 0.15);
  transform: scale(1.04);
}
.prisignal-daily-filter-chip:active {
  transform: scale(0.96);
}
```

- 선택 시 `scale(1.04)` + 글로우로 "눌린 느낌"
- `:active` 시 `scale(0.96)`으로 버튼 피드백

#### E-2. 필터 전환 시 카드 페이드

```css
.prisignal-daily-content {
  animation: filterTransition 0.3s ease-out;
}
@keyframes filterTransition {
  from { opacity: 0.3; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

- React에서 `key={activeFilter}`를 `<main>`에 적용하여 필터 변경마다 애니메이션 트리거

### Module F: 글로벌 마이크로 인터랙션

#### F-1. 카테고리 섹션 헤더 개선

```
현재: 🎯 Attitude ──────────────────── [2]
개선: 🎯 Attitude                       2
      ═══════════ (카테고리 컬러 언더라인, 좌측에서 슬라이드인)
```

```css
.prisignal-daily-cat-title::after {
  content: '';
  position: absolute;
  bottom: 0; left: 0;
  width: 0; height: 2px;
  background: var(--cat-color);
  transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}
.prisignal-daily-cat-title.visible::after {
  width: 100%;
}
```

- `IntersectionObserver`로 뷰포트 진입 시 `.visible` 클래스 토글
- 언더라인이 좌→우로 슬라이드하며 등장

#### F-2. 스크롤 프로그레스 인디케이터

데일리 상세 페이지 상단에 얇은(2px) 프로그레스 바:

```css
.prisignal-scroll-progress {
  position: fixed; top: 0; left: 0;
  height: 2px; z-index: 100;
  background: var(--gradient-brand);
  transform-origin: left;
  transform: scaleX(var(--scroll-progress, 0));
  transition: transform 0.1s linear;
}
```

- 읽기 진행 상황을 시각적으로 표시
- GNB 위에 얇게 겹침 → 브랜드 컬러 그라데이션

#### F-3. 숫자 카운트업 애니메이션

아카이브 카드의 "19 시그널", 데일리 헤더의 날짜 숫자 등에 카운트업 효과:

```javascript
// 뷰포트 진입 시 0 → 실제값으로 카운트업 (300ms)
function useCountUp(target, duration = 300) { ... }
```

---

## 3. 수정 대상 파일

| 파일 | 모듈 | 주요 변경 |
|------|------|----------|
| `PriSignalDaily.css` | A, B, E, F | 카드 호버/진입 애니메이션, 에디터 노트, 필터 칩, 스크롤 프로그레스 |
| `PriSignalDaily.jsx` | A, B, C, E, F | 마우스 추적, 스태거 인덱스, 에디터 노트 구조, 플로팅 CTA, 스크롤 옵저버 |
| `PriSignal.css` | C, D | 구독 폼 강화, 아카이브 카드 호버/스태거 |
| `PriSignalArchive.jsx` | D | 아카이브 카드 스태거 인덱스, 호버 프리뷰 |
| `PriSignal.jsx` | C | 히어로 구독 폼 VP 강화, 소셜 프루프 |

---

## 4. 실행 순서 (우선순위)

| 순서 | 모듈 | 예상 효과 | 난이도 |
|------|------|----------|--------|
| 1 | **A: 카드 인터랙션** | 즉각적인 프리미엄감 향상 | 중 |
| 2 | **E: 필터 칩 전환** | 페이지 내 탐색 UX 개선 | 하 |
| 3 | **B: 에디터 코멘트** | 에디터 가치 격상, 콘텐츠 깊이 | 중 |
| 4 | **D: 아카이브 카드** | 목록 페이지 체류 시간 증가 | 중 |
| 5 | **F: 마이크로 인터랙션** | 전체적 폴리시, 완성도 | 중 |
| 6 | **C: 구독 전환** | 구독률 직접 향상 | 상 |

---

## 5. 디자인 원칙

1. **Purposeful Motion** — 모든 애니메이션은 정보 전달 또는 피드백 목적. 장식 목적 애니메이션 금지
2. **GPU-Friendly** — `transform`, `opacity`, `filter`만 애니메이션. `height`, `width` 직접 애니메이션 금지
3. **Reduced Motion 존중** — `prefers-reduced-motion: reduce` 미디어 쿼리로 접근성 대응
4. **Liquid Easing** — `cubic-bezier(0.4, 0, 0.2, 1)` (Material Design 표준) 또는 `cubic-bezier(0.16, 1, 0.3, 1)` (Spring) 사용
5. **8px 그리드** — 모든 간격은 8의 배수. `--space-xs: 8px`, `--space-sm: 12px`, `--space-md: 16px`
