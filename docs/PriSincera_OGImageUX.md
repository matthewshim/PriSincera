# PriSignal OG Image — UI/UX 개선 계획

> **문서:** `PriSincera_OGImageUX.md`  
> **작성일:** 2026-04-28  
> **상태:** ✅ 구현 완료 (배포됨)  
> **대상 파일:**  
> - `src/pages/PriSignalDaily.jsx` / `PriSignalDaily.css`  
> - `src/components/prisignal/PriSignalArchive.jsx`  
> - `src/pages/PriSignal.css`

---

## 1. 현황 분석

### 1.1 데일리 상세 페이지 (`/prisignal/:date`)

**현재 구조** — 아티클 카드 내부에 OG 이미지를 풀 와이드(100%)로 표시:

```
┌─────────────────────────────────────────┐
│ 📬 DM Pick                              │
│ Source   T1   ★ 18.0                    │
│ ┌─────────────────────────────────────┐  │  ← OG 이미지 (max-height: 220px)
│ │         OG 이미지 (풀 와이드)          │  │    → 있으면 카드가 크게 팽창
│ └─────────────────────────────────────┘  │    → 없으면 이 영역 자체가 사라짐
│ Article Title                            │
│ Summary text...                          │
│ ✍️ 에디터 추천                            │
│ 원문 읽기 ↗                              │
└─────────────────────────────────────────┘
```

**문제점:**

| # | 문제 | 영향 |
|---|------|------|
| D1 | OG 이미지가 **풀 와이드 × 220px** 영역을 차지하여 카드 높이가 **2~3배** 차이남 | 카드 간 시각적 일관성 파괴 |
| D2 | OG 이미지가 메타 행(Source/Tier/Score)과 제목 **사이**에 위치하여 **정보 흐름을 단절** | 메타→OG→제목 순서가 부자연스러움 |
| D3 | OG 없는 카드와 있는 카드의 **높이·비율 격차**가 극심 | 스크롤 시 리듬이 깨지고, 주요 텍스트 정보의 가독성 저하 |
| D4 | 일부 OG 이미지가 사이트 로고 수준 (예: Stratechery 기본 배너)이라 정보가치가 낮음 | 무의미한 이미지가 과도한 공간 차지 |

### 1.2 데일리 목록(아카이브) 페이지 (`/prisignal`)

**현재 구조** — 좌측 썸네일(130×90) + 우측 날짜/카테고리 정보:

```
┌──────────────────────────────────────────────────────┐
│ ┌────────┐  28 월    19 시그널  🟢TODAY  📬 DM 5    │
│ │ 130×90 │  ● Global 3  ● AI 6  ● Attitude 2 ...   │
│ │ Thumb  │                               보기 >     │
│ └────────┘                                           │
└──────────────────────────────────────────────────────┘
```

**문제점:**

| # | 문제 | 영향 |
|---|------|------|
| A1 | 썸네일 **130×90px**이 너무 작아서 OG 이미지의 내용을 식별 불가 | 시각적 도움이 되지 않음 |
| A2 | OG 이미지가 있는 카드(4/27)와 폴백 아이콘 카드의 **비주얼 격차** | 목록 내 시각적 일관성 부재 |
| A3 | 폴백(아이콘+라벨)이 너무 단순하고 어두워서 **비어보이는 느낌** | 콘텐츠가 없는 것처럼 인식 |
| A4 | 실제 OG 이미지 크롤링 성공률이 **51%**라서 폴백이 자주 노출됨 | 전체 목록의 절반이 빈약해 보임 |

---

## 2. 디자인 개선 방향

### 2.1 핵심 원칙

1. **정보 우선 (Information First)** — OG 이미지는 보조 요소이며, 핵심 정보(제목/소스/스코어)의 전달력을 방해하지 않아야 함
2. **일관된 카드 크기** — OG 유무에 관계없이 카드의 기본 형태가 동일해야 함
3. **점진적 향상 (Progressive Enhancement)** — OG 이미지가 있을 때 "약간 더 풍성하게", 없을 때도 "충분히 완성된 느낌"

### 2.2 레이아웃 개선안

#### A. 데일리 상세 페이지 — "Inline Thumbnail" 방식

**Before (현재):** OG 이미지가 풀 와이드로 카드를 지배  
**After (개선):** 카드 우측 상단에 작은 썸네일로 배치

```
┌─────────────────────────────────────────────────────┐
│ 📬 DM Pick                                          │
│ ┌────────────────────────────────────┐  ┌─────────┐ │
│ │ Source   T1   ★ 18.0              │  │         │ │
│ │ Article Title (2줄까지)             │  │  OG Img │ │
│ │ Summary text preview...            │  │ 120×80  │ │
│ │                                    │  └─────────┘ │
│ └────────────────────────────────────┘               │
│ ✍️ 에디터 추천                                        │
│ 원문 읽기 ↗                                          │
└─────────────────────────────────────────────────────┘
```

**핵심 변경:**
- OG 이미지를 **카드 우측 상단**에 `120 × 80px` 크기로 배치
- 카드 메인 콘텐츠(소스/제목/요약)는 **좌측**에서 텍스트 중심으로 유지
- OG 이미지가 없어도 **카드 크기 동일** (이미지 영역이 사라질 뿐)
- `object-fit: cover` + `border-radius: 8px`로 깔끔한 썸네일 처리

> 이 방식은 Hacker News, TechMeme, Feedly 등 콘텐츠 큐레이션 서비스의 표준 패턴입니다.
> 이미지가 텍스트 정보를 압도하지 않으면서도 시각적 다양성을 제공합니다.

#### B. 데일리 목록(아카이브) — "Accent Stripe" 방식

**Before (현재):** 좌측에 130×90px 썸네일 영역 (OG or 폴백 아이콘)  
**After (개선):** 썸네일을 제거하고, 카테고리 컬러 스트라이프로 대체

```
┌──────────────────────────────────────────────────────┐
│ ▌ 28 월    19 시그널  🟢TODAY  📬 DM 5              │
│ ▌ ● Global 3  ● AI 6  ● Attitude 2  ● Product 2   │
│ ▌ "AI Hardware, Meta Display..."  ← 대표 기사 제목   │
│ ▌                                        보기 >     │
└──────────────────────────────────────────────────────┘
```

**핵심 변경:**
- 좌측 썸네일 영역을 **4px 컬러 스트라이프** (대표 카테고리 색상)로 대체
- 기존 썸네일 공간에 **대표 아티클 제목** 1줄을 추가 표시
- OG 이미지 의존도 제거 → **모든 카드가 동일 레이아웃**
- 카드가 더 컴팩트하고 정보 밀도 높아짐

> OG 이미지 크롤링 성공률이 51%인 현 상태에서 썸네일 기반 디자인은 절반이 빈약해 보이는 문제를 피할 수 없습니다.
> 아카이브 목록에서는 **텍스트 정보 중심**으로 전환하는 것이 전달력을 극대화합니다.

---

## 3. 구현 세부 사항

### 3.1 데일리 상세 — `PriSignalDaily.jsx` + `PriSignalDaily.css`

#### JSX 변경

현재 카드 내부 구조:
```
card-top (DM Badge + Meta Row)
  → card-og (OG Image — 풀 와이드)  ← 제거
    → card-title
    → card-summary
```

변경 후:
```
card-top (DM Badge)
  → card-main-row (flex: row)
    → card-text-col (flex: 1)
      → card-meta (Source / Tier / Score)
      → card-title
      → card-summary
    → card-og-thumb (width: 120px, optional)  ← 우측 썸네일
  → card-sticker
  → card-link
```

#### CSS 변경 핵심

```css
/* 기존: 풀 와이드 OG → 삭제 */
.prisignal-daily-card-og { /* 삭제 */ }

/* 신규: Inline Thumbnail */
.prisignal-daily-card-main-row {
  display: flex;
  gap: var(--space-md);
  align-items: flex-start;
}
.prisignal-daily-card-text-col {
  flex: 1;
  min-width: 0;
}
.prisignal-daily-card-og-thumb {
  width: 120px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
}
.prisignal-daily-card-og-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
```

### 3.2 아카이브 목록 — `PriSignalArchive.jsx` + `PriSignal.css`

#### JSX 변경

현재 구조:
```
archive-card (flex: row)
  → card-thumb (130×90, OG or 폴백)  ← 제거
  → card-body
```

변경 후:
```
archive-card (flex: row)
  → card-accent-stripe (4px, 카테고리 컬러)  ← 신규
  → card-body
    → card-header (날짜 + 시그널 수 + TODAY + DM)
    → card-cats (카테고리 칩)
    → card-headline (대표 기사 제목 1줄)  ← 신규
    → card-footer (보기 >)
```

#### CSS 변경 핵심

```css
/* 기존: 130×90 썸네일 → 삭제 */
.prisignal-archive-card-thumb { /* 삭제 */ }

/* 신규: Accent Stripe */
.prisignal-archive-card-accent {
  width: 4px;
  min-height: 100%;
  border-radius: 4px 0 0 4px;
  background: var(--accent-color, rgba(196, 181, 253, 0.4));
  flex-shrink: 0;
}

/* 신규: 대표 기사 제목 */
.prisignal-archive-card-headline {
  font-size: 0.82rem;
  color: var(--text-secondary);
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 2px;
  opacity: 0.7;
}
```

---

## 4. 수정 대상 파일 요약

| 파일 | 변경 유형 | 주요 내용 |
|------|----------|----------|
| `PriSignalDaily.jsx` | JSX 구조 변경 | 카드 레이아웃을 `flex row` + 우측 OG 썸네일로 재구성 |
| `PriSignalDaily.css` | CSS 리팩토링 | 풀 와이드 OG 스타일 삭제, 인라인 썸네일 스타일 추가 |
| `PriSignalArchive.jsx` | JSX 구조 변경 | 썸네일 제거, 스트라이프 + 대표 제목 추가 |
| `PriSignal.css` | CSS 리팩토링 | 썸네일 관련 스타일 삭제, 스트라이프/헤드라인 스타일 추가 |

---

## 5. Before → After 예상 비교

### 데일리 상세 페이지

| 항목 | Before | After |
|------|--------|-------|
| OG 있는 카드 높이 | ~350px (이미지 220px + 텍스트) | ~130px (텍스트 + 80px 썸네일) |
| OG 없는 카드 높이 | ~130px | ~130px |
| **높이 격차** | **220px (2.7x)** | **0px (1:1)** |
| 정보 흐름 | 메타→이미지→제목 (단절) | 메타→제목→요약 (자연스러움) |
| 이미지 역할 | 카드 지배 | 보조 시각 요소 |

### 아카이브 목록

| 항목 | Before | After |
|------|--------|-------|
| 카드 레이아웃 | 썸네일(130×90) + 정보 | 스트라이프(4px) + 정보 + 대표 제목 |
| OG 없는 카드 | 빈약한 폴백 아이콘 | 동일 레이아웃 (스트라이프 색상만 다름) |
| **일관성** | **OG 유무에 따라 극심한 차이** | **100% 일관된 카드 형태** |
| 정보 밀도 | 낮음 (이미지가 공간 차지) | 높음 (대표 제목 추가) |

---

## 6. 실행 순서

1. **데일리 상세 CSS** → 풀 와이드 OG 스타일 교체, 인라인 썸네일 스타일 추가
2. **데일리 상세 JSX** → 카드 구조 변경 (`card-main-row` 도입)
3. **아카이브 CSS** → 썸네일 스타일 삭제, 스트라이프 스타일 추가
4. **아카이브 JSX** → 썸네일 제거, 스트라이프 + 대표 제목 추가
5. **로컬 검증** → 개발 서버에서 OG 있는/없는 카드 비교 확인
6. **커밋 & 배포**

> 모바일 반응형 대응도 함께 진행합니다.
> 데일리 상세의 인라인 썸네일은 640px 이하에서 `100 × 68px`로 축소합니다.

---

## 7. 리스크 및 대안

| 리스크 | 대응 |
|--------|------|
| OG 썸네일 120×80이 너무 작게 느껴질 수 있음 | 사용자 피드백 후 `140 × 90`으로 조정 가능 |
| 아카이브에서 이미지 완전 제거가 아쉬울 수 있음 | 대안: 스트라이프 대신 `60×60` 미니 썸네일 유지, 폴백을 카테고리 그라데이션으로 |
| 대표 기사 제목이 모든 날짜에 동일할 수 있음 | `topTitle` 필드는 해당 일자의 최고 스코어 아티클이므로 날짜별 차별화됨 |

---

## 8. 구현 완료 요약 (2026-04-28)

| 항목 | 상태 |
|------|------|
| 데일리 상세 OG → 인라인 썸네일 (120x80px) | ✅ |
| 아카이브 OG → 카테고리 스트라이프 대체 | ✅ |
| `ogImage` 필드 파이프라인 수집 | ✅ |
| OG 없는 카드 레이아웃 일관성 | ✅ |
| 모바일 반응형 (640px 이하) | ✅ |

---

*최종 업데이트: 2026-04-28*
