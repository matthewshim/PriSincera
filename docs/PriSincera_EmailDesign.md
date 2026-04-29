# 📧 PriSignal 이메일 뉴스레터 디자인 개편안

> **문서 버전:** v1.0  
> **작성일:** 2026-04-29  
> **상태:** 📋 Proposed → 구현 승인 대기

---

## 1. 현재 문제점 진단

### 1-1. 수신 메일 스크린샷 분석

현재 Buttondown 기본 템플릿으로 발송되는 메일은 다음과 같은 문제가 있습니다:

| 문제 | 심각도 | 설명 |
|------|--------|------|
| **흰 배경 + 기본 서체** | 🔴 | PriSincera 다크 테마와 완전히 단절 — 브랜드 아이덴티티 제로 |
| **구조 없는 본문** | 🔴 | DM Pick과 일반 기사의 시각적 구분 없음, 평문 나열 |
| **카테고리 미표시** | 🟡 | Attitude/AI/Global 등 카테고리 칩이 없어 스캔 불가 |
| **CTA 부재** | 🔴 | "원문 읽기" 링크가 일반 텍스트 — 클릭 유도력 제로 |
| **데일리 포털 연결 미흡** | 🟡 | 웹 포털로 유도하는 강력한 CTA 없음 |
| **모바일 가독성** | 🔴 | 좁은 화면에서 마크다운 원문이 그대로 노출 |
| **브랜드 헤더 부재** | 🔴 | PriSignal 로고/심볼 없이 텍스트만 표시 |

### 1-2. 기존 커스텀 템플릿 (`prisignal-email-template.html`)

기존에 제작해둔 HTML 템플릿이 존재하지만, **Buttondown Design에 아직 적용되지 않은 상태**입니다. 이 템플릿은 기본 래퍼(Header/Body/Footer)만 담당하며, **본문 콘텐츠 자체의 디자인은 마크다운에 의존**하여 구조화되지 않았습니다.

---

## 2. 레퍼런스 분석

### 2-1. 프리미엄 뉴스레터 벤치마크

| 뉴스레터 | 핵심 전략 | PriSignal 적용점 |
|----------|----------|-----------------|
| **Morning Brew** | 눈을 사로잡는 이모지 + 깔끔한 섹션 분리 + "Around the Web" 포맷 | 카테고리별 섹션 구조 |
| **TLDR** | 초단문 "3줄 요약" + 카테고리 Eyebrow(대문자 라벨) | DM Pick vs More Signals 2단 구조 |
| **Stratechery** | 긴 분석 본문 + 깔끔한 타이포그래피 + 최소 이미지 | Editor's Signal 깊이 있는 코멘트 |
| **Dense Discovery** | 다크 모드 네이티브 + 넘버링 + 소스 표기 | 다크 테마 + 출처 배지 |
| **The Hustle** | 강렬한 헤드라인 + 1문장 요약 + 굵은 CTA 버튼 | DM Pick 카드형 레이아웃 |

### 2-2. 2026 이메일 디자인 트렌드

1. **다크 모드 네이티브**: 밝은 배경 대신 다크 테마를 기본으로 설계
2. **모바일 퍼스트 싱글 컬럼**: 600px 컨테이너, 14-16px 본문 폰트
3. **전략적 여백**: 프리미엄 느낌을 주는 관대한 패딩
4. **모듈형 카드 레이아웃**: 스캔 가능한 구조화된 정보 블록
5. **미니멀 인터랙션**: 볼드 CTA 버튼 + 컬러 배지로 시선 유도
6. **브랜드 시그니처**: 반복적 컬러/레이아웃으로 즉각 인지

---

## 3. 디자인 시스템 연동 — 웹 ↔ 이메일 토큰 매핑

PriSincera 웹서비스의 디자인 토큰을 이메일 환경(인라인 CSS)으로 변환합니다.

### 3-1. 컬러 토큰

| 역할 | 웹 CSS 변수 | 이메일 인라인 값 | 용도 |
|------|-------------|----------------|------|
| 배경 (최외곽) | `--bg-void` | `#0A0714` | Body 배경 |
| 카드 배경 | `--bg-surface` | `#1A1035` | DM Pick 카드 |
| 카드 호버 | `--bg-elevated` | `#231A46` | More Signals 카드 |
| 브랜드 보라 | `--prism-violet` | `#7C3AED` | CTA 버튼, 강조 |
| 브랜드 라벤더 | `--prism-lavender` | `#C084FC` | 카테고리 배지 |
| 포인트 시안 | `--orbit-cyan` | `#22D3EE` | DM Pick 배지 |
| 본문 텍스트 | `--text-primary` | `#F5F3FF` | 제목 |
| 서브 텍스트 | `--crystal-white` | `#E9D5FF` | 본문/요약 |
| 뮤트 텍스트 | `--text-muted` | `#6D5BA3` | 출처, 부가 정보 |
| 글래스 보더 | `--glass-border` | `rgba(196,181,253,0.1)` | 카드 보더 |

### 3-2. 타이포그래피

| 역할 | 웹 폰트 | 이메일 폰트 스택 | 사이즈 |
|------|---------|-----------------|--------|
| 헤드라인 | Outfit | `'Outfit', 'Noto Sans KR', -apple-system, sans-serif` | 26px |
| 섹션 제목 | Outfit | 상동 | 18px |
| 아티클 제목 | Noto Sans KR | `'Noto Sans KR', -apple-system, sans-serif` | 16px / bold |
| 본문/요약 | Noto Sans KR | 상동 | 14px |
| 배지/메타 | Inter | `'Inter', -apple-system, sans-serif` | 11-12px |

> [!NOTE]
> 웹폰트는 이메일 클라이언트에서 지원 불일정. 시스템 폰트 폴백 필수.

---

## 4. 이메일 레이아웃 설계

### 4-1. 전체 구조 (위→아래)

```
┌──────────────────────────────────────┐
│  ① HEADER                            │
│  📡 PriSignal 로고 + 날짜/건수        │
│  "노이즈 속에서 시그널을 포착하다"       │
├──────────────────────────────────────┤
│  ② QUICK STATS BAR                   │
│  [전체 16] [DM Pick 5] [카테고리 6]   │
├──────────────────────────────────────┤
│  ③ DM PICK SECTION (핵심 시그널)      │
│  ┌────────────────────────────────┐  │
│  │ 🏷 DM Pick · Attitude         │  │
│  │ ★ 18.0 · McKinsey Insights    │  │
│  │                                │  │
│  │ An agile approach to hiring:   │  │
│  │ Mastercard's tech talent...    │  │
│  │                                │  │
│  │ 요약 텍스트 2-3줄              │  │
│  │                                │  │
│  │ 💬 Editor's Signal (있는 경우)  │  │
│  │                                │  │
│  │      [→ 원문 읽기]             │  │
│  └────────────────────────────────┘  │
│  (DM Pick 카드 ×5 반복)              │
├──────────────────────────────────────┤
│  ④ MORE SIGNALS SECTION              │
│  카테고리별 그룹핑 (Eyebrow 라벨)     │
│                                      │
│  ── AI & FUTURE ──                   │
│  • 제목 — 출처                        │
│  • 제목 — 출처                        │
│                                      │
│  ── GLOBAL LENS ──                   │
│  • 제목 — 출처                        │
│  • 제목 — 출처                        │
├──────────────────────────────────────┤
│  ⑤ CTA BANNER                        │
│  ┌────────────────────────────────┐  │
│  │  📡 오늘의 전체 시그널 보기     │  │
│  │  [데일리 포털에서 확인하기 →]   │  │
│  └────────────────────────────────┘  │
├──────────────────────────────────────┤
│  ⑥ FOOTER                            │
│  prisincera.com · 구독해지 · ©2026   │
└──────────────────────────────────────┘
```

### 4-2. 섹션별 상세 스펙

#### ① Header

```
배경: #0A0714 (bg-void)
높이: auto
패딩: 40px 24px 24px

요소:
- 📡 이모지 (24px)
- "PriSignal" 텍스트 (Outfit 26px bold, #F5F3FF)
  - "Signal" 부분: gradient-brand 색상 (#C084FC → #F0ABFC)
- 날짜 라벨: "4월 29일 화요일의 시그널" (14px, #A78BFA)
- 슬로건: "노이즈 속에서 시그널을 포착하다" (12px, #6D5BA3)

구분선: 1px gradient (transparent → rgba(196,181,253,0.15) → transparent)
```

#### ② Quick Stats Bar

```
배경: #1A1035 (bg-surface)
보더: 1px solid rgba(196,181,253,0.08)
보더 라디우스: 12px
패딩: 16px 24px
마진: 0 24px

3-column 인라인 배치:
- [전체 16건] — #E9D5FF
- [DM Pick 5] — #22D3EE (orbit-cyan)
- [카테고리 6] — #C084FC (prism-lavender)

폰트: Inter 13px, weight 600
```

#### ③ DM Pick 카드

```
카드 컨테이너:
  배경: #1A1035
  보더: 1px solid rgba(196,181,253,0.08)
  보더 라디우스: 16px
  패딩: 24px
  마진: 0 24px 16px

메타 행 (상단):
  좌: 카테고리 배지
    배경: rgba(124,58,237,0.15)
    보더: 1px solid rgba(124,58,237,0.3)
    보더 라디우스: 100px
    패딩: 4px 12px
    폰트: Inter 11px, #C084FC
    텍스트: "DM Pick · Attitude"
  우: 점수/출처
    "★ 18.0 · McKinsey Insights"
    폰트: Inter 12px, #6D5BA3

제목:
  폰트: Noto Sans KR 16px, bold, #F5F3FF
  행간: 1.5
  마진: 12px 0 8px

요약:
  폰트: Noto Sans KR 14px, #E9D5FF
  행간: 1.7
  마진: 0 0 12px
  최대: 3줄

Editor's Signal (조건부):
  좌측 보더: 3px solid #7C3AED
  배경: rgba(124,58,237,0.06)
  패딩: 12px 16px
  폰트: 14px italic, #A78BFA
  아이콘: 💬

CTA 버튼:
  배경: linear-gradient(135deg, #7C3AED, #A855F7)
  Fallback: bgcolor="#7C3AED"
  보더 라디우스: 100px
  패딩: 10px 24px
  텍스트: "→ 원문 읽기" (13px, bold, #FFFFFF)
  정렬: 우측
```

#### ④ More Signals 섹션

```
섹션 Eyebrow:
  텍스트: "AI & FUTURE" (대문자)
  폰트: Inter 11px, weight 700, letter-spacing 0.08em
  컬러: #22D3EE (카테고리별 변경)
  하단선: 1px solid rgba(34,211,238,0.2)
  마진: 24px 24px 12px

카테고리별 컬러:
  - AI & Future: #22D3EE (orbit-cyan)
  - Global Lens: #FDE68A (prism-amber)
  - Product Craft: #F0ABFC (prism-rose)
  - Attitude: #C084FC (prism-lavender)
  - Priority: #7C3AED (prism-violet)

아티클 행:
  패딩: 8px 24px
  구조: [•] [제목 링크] — [출처]
  제목: 14px, #E9D5FF, 링크 → #C084FC 언더라인
  출처: 12px, #6D5BA3
  구분선: 1px solid rgba(196,181,253,0.05) (항목 간)
```

#### ⑤ CTA Banner

```
컨테이너:
  배경: linear-gradient(135deg, rgba(124,58,237,0.15), rgba(34,211,238,0.08))
  Fallback: bgcolor="#1A1035"
  보더: 1px solid rgba(124,58,237,0.2)
  보더 라디우스: 16px
  패딩: 24px
  마진: 8px 24px 0
  정렬: center

텍스트: "오늘의 전체 시그널을 확인하세요" (14px, #E9D5FF)

CTA 버튼:
  배경: linear-gradient(135deg, #7C3AED, #C084FC)
  Fallback: bgcolor="#7C3AED"
  보더 라디우스: 100px
  패딩: 14px 32px
  텍스트: "📡 데일리 포털에서 확인하기 →" (14px, bold, #FFFFFF)
  링크: https://www.prisincera.com/prisignal/YYYY-MM-DD
```

#### ⑥ Footer

```
패딩: 32px 24px
정렬: center

행 1: prisincera.com 링크 (13px, #A78BFA)
행 2: 슬로건 (12px, #6D5BA3)
행 3: 구독해지 링크 (11px, #4A3D6E, 밑줄)
행 4: © 2026 PriSincera · Sincerity, Prioritized. (11px, #4A3D6E)
```

---

## 5. 다크 모드 호환 전략

### 5-1. 메타 태그

```html
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
```

### 5-2. 컬러 안전 가이드

| 원칙 | 적용 |
|------|------|
| 순수 검정(#000) 회피 | `#0A0714` 사용 (이미 적용) |
| 순수 흰색(#FFF) 회피 | `#F5F3FF` 사용 (이미 적용) |
| 이미지 투명 배경 | PNG → 투명 배경 + 글로우 아웃라인 |
| 보더 컬러 반전 대비 | `rgba()` 보더 → 반전 시에도 자연스러움 |
| Solid-fill CTA | 그래디언트 CTA → Outlook 폴백 `bgcolor` |

### 5-3. 이메일 클라이언트별 대응

| 클라이언트 | 다크 모드 | 대응 |
|-----------|----------|------|
| Apple Mail | 자동 반전 | `prefers-color-scheme` 미디어쿼리 |
| Gmail (Web) | 부분 반전 | `bgcolor` 폴백 필수 |
| Gmail (App) | 강제 반전 | 순수 흑백 회피로 대응 |
| Outlook (Desktop) | VML 기반 | `bgcolor` 속성 + 인라인 CSS 이중 적용 |
| Outlook (365) | CSS 반전 | 안전 컬러 팔레트 사용 |

---

## 6. 콘텐츠 자동 생성 전략

### 6-1. 현재 방식 (수동)

마크다운 텍스트를 Buttondown 에디터에 수동 입력 → 기본 렌더링

### 6-2. 제안 방식 (자동화)

```
Daily Pipeline (Cloud Scheduler)
        │
        ▼
  ① GCS에서 당일 scored JSON 로드
        │
        ▼
  ② HTML 이메일 본문 자동 생성
     - DM Pick 카드 렌더링 (isDmPick === true)
     - More Signals 카테고리 그룹핑
     - Quick Stats 카운트
        │
        ▼
  ③ Buttondown API로 Draft 생성
     POST /v1/emails
     { subject, body(HTML), status: "draft" }
        │
        ▼
  ④ 관리자 리뷰 후 Publish
     (또는 자동 Publish 설정 가능)
```

### 6-3. 이메일 본문 생성 함수 (의사코드)

```javascript
function generateEmailBody(dailyData) {
  const { date, total, dmPickCount, articles } = dailyData;
  const dmPicks = articles.filter(a => a.isDmPick);
  const others = articles.filter(a => !a.isDmPick);
  const grouped = groupByCategory(others);
  
  return `
    ${renderQuickStats(total, dmPickCount, Object.keys(grouped).length)}
    ${dmPicks.map(renderDmPickCard).join('')}
    ${renderMoreSignals(grouped)}
    ${renderCtaBanner(date)}
  `;
}
```

---

## 7. 구현 로드맵

### Phase 1 — 즉시 (Buttondown 템플릿 적용)

| # | 작업 | 담당 |
|---|------|------|
| 1-1 | 기존 `prisignal-email-template.html` 개편 | 개발 |
| 1-2 | Buttondown Settings > Design에 적용 | 수동 |
| 1-3 | 테스트 메일 발송 후 클라이언트별 검증 | QA |

### Phase 2 — 단기 (콘텐츠 구조화)

| # | 작업 | 담당 |
|---|------|------|
| 2-1 | 마크다운 → 구조화된 HTML 본문 생성 스크립트 | 개발 |
| 2-2 | DM Pick 카드 / More Signals 템플릿 컴포넌트 | 개발 |
| 2-3 | 데일리 포털 링크 자동 삽입 | 개발 |

### Phase 3 — 중기 (파이프라인 자동화)

| # | 작업 | 담당 |
|---|------|------|
| 3-1 | Cloud Function으로 이메일 HTML 자동 생성 | 개발 |
| 3-2 | Buttondown API 연동 (Draft 자동 생성) | 개발 |
| 3-3 | 관리자 승인 후 자동 발송 워크플로우 | 운영 |

---

## 8. 성공 지표

| 지표 | 현재 (추정) | 목표 |
|------|-----------|------|
| 오픈율 | 낮음 (브랜드 인지 부족) | 40%+ |
| 클릭률 | 매우 낮음 (CTA 부재) | 15%+ |
| 포털 전환 | 없음 | 매일 발송 기준 10%+ |
| 구독 해지율 | - | 2% 미만 유지 |
| 브랜드 인지도 | 불일치 (흰 배경 기본) | 웹과 완전 일치 |

---

## 9. 비교 요약: Before vs After

| 항목 | Before (현재) | After (개편안) |
|------|-------------|--------------|
| 배경 | 흰 배경 (Buttondown 기본) | `#0A0714` 다크 테마 |
| 브랜드 | 텍스트만 | 📡 로고 + 그래디언트 헤더 |
| DM Pick | 평문 나열 | 카드형 글래스모피즘 레이아웃 |
| 카테고리 | 없음 | 컬러 배지 + Eyebrow 라벨 |
| CTA | 인라인 링크 | 그래디언트 pill 버튼 |
| 포털 연결 | 없음 | 전용 CTA 배너 |
| 스코어 | 텍스트 | ★ 배지 + 컬러 인디케이터 |
| Editor's Signal | 없음 | 인용 블록 스타일 |
| 모바일 | 마크다운 원문 노출 | 600px 싱글 컬럼 최적화 |
| 다크 모드 | 클라이언트 강제 반전 | 네이티브 다크 + 폴백 |

---

*© 2026 PriSincera · Sincerity, Prioritized.*
