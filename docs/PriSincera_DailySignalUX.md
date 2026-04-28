# 📋 PriSignal 데일리 시그널 — UX/UI 사양서

> PriSignal 데일리 시그널의 프론트엔드 UX/UI 구현 현황 및 잔여 개선 과제를 정리합니다.  
> **최종 업데이트:** 2026-04-28

---

## 1. 데일리 시그널 목록 (Archive)

> 파일: `src/components/prisignal/PriSignalArchive.jsx`, `src/pages/PriSignal.css`

### 1-1. 현재 구현 (v4 — 2026-04-28)

- **카드 레이아웃**: 좌측 대형 날짜(숫자 + 요일) + 우측 상세(시그널 수, DM 픽 수, 카테고리 컬러 도트 칩, 보기 링크)
- **카테고리 칩**: 컬러 도트 + 카테고리명 + 카운트 형태
- **그리드 폭**: `max-width` 제한 제거 → 부모(`.prisignal-section-inner`, 900px)의 전체 폭 사용
- **호버 인터랙션**: `translateY(-6px) scale(1.01)` + 스트라이프 글로우 + 화살표 슬라이드
- **진입 애니메이션**: `archiveReveal` 스태거 (카드 인덱스 × 80ms)
- **하단 CTA**: 인라인 구독 폼 (`SubscribeForm variant="inline"`)
  - 문구: "시그널을 놓치고 계신가요?" + "매일 선별된 5개의 시그널을 이메일로 받아보세요."

### 1-2. OG 이미지 활용 (구현 완료)

- [x] 아카이브 카드에서 OG 이미지 의존도 제거 → 카테고리 컬러 스트라이프로 대체
- [x] 모든 카드가 동일 레이아웃 (OG 유무 무관)
- [x] 대표 아티클 제목 1줄 추가 표시

---

## 2. 데일리 시그널 상세 (Daily Detail Page)

> 파일: `src/pages/PriSignalDaily.jsx`, `src/pages/PriSignalDaily.css`

### 2-1. 현재 구현 (v4 — 2026-04-28)

#### 탭 네비게이션 (신규)
- 상단에 서비스 소개 / 데일리 시그널 탭 바 추가
- CSS `::after` 기반 그라데이션 인디케이터 (PriSignal 메인과 동일)
- `position: sticky; top: 56px;` — GNB 아래 고정

#### 헤더 영역
- **날짜 네비게이션**: `‹ 04-27(월)` — **28** 4월 화요일 — `04-29(수) ›`
  - 이전/다음 화살표: ghost 스타일, 좌/우 끝 배치
  - 날짜 센터: 대형 그래디언트 숫자 + 월/요일 정보
  - 미래 날짜일 경우 다음 화살표 비활성(투명 처리)
- **Daily List 버튼**: pill 형태, `/prisignal#daily` 이동

#### 필터 영역
- **필터 칩**: 전체 | DM 픽 | Attitude | Priority | AI & Future | Global Lens | Product Craft
- 선택 시 `scale(1.04)` + 글로우 피드백
- `:active` 시 `scale(0.96)` 버튼 프레스 피드백
- 필터 전환 시 `filterTransition` 페이드 애니메이션 (`key={activeFilter}`)

#### 아티클 카드 (v4 개선)
- **카드 전체 클릭**: `onClick` → 프로그래매틱 `<a>` 생성으로 원문 새 탭 열기
  - `e.target.closest('button')` 체크로 Editor's Signal 토글 독립 동작
  - `cursor: pointer`, `role="link"`, `tabIndex={0}` 접근성 대응
- **호버 효과**: 카드 전체 `translateY(-4px)` + 3단계 그림자 + 마우스 추적 글로우
  - 제목 색상 → 브랜드 퍼플로 변경
  - "원문 읽기" 텍스트 `opacity: 0.5 → 1` 페이드인 + 화살표 갭 확장
- **DM Pick 하이라이트**: 보라색 테두리/배경 + 글로우 강도 2배
- **Tier 배지**: T1/T2/T3 색상 구분
- **OG 이미지**: 카드 우측 상단 인라인 썸네일 (120×80px, `object-fit: cover`)
- **에디터 코멘트**: Editor's Signal 프리미엄 인용 디자인
  - 좌측 3px 보더, 큰따옴표 아이콘, 접힌 상태에서 첫 1줄 프리뷰
  - CSS grid `grid-template-rows: 0fr/1fr` 부드러운 전환
  - `stopPropagation()`으로 카드 클릭과 독립 동작
- **스태거 진입**: `cardReveal` 애니메이션, 카드 인덱스 × 60ms

#### 하단 영역
- **CTA 섹션**: `.prisignal-archive-cta` 공유 — 인라인 구독 폼
  - 문구: "시그널을 놓치고 계신가요?" + "매일 선별된 5개의 시그널을 이메일로 받아보세요."
- **전체 목록 링크**: `/prisignal#daily` 이동
- **스크롤 프로그레스**: 상단 2px 그라데이션 바

### 2-2. 잔여 과제

- [ ] 에디터 코멘트 품질 개선 (파이프라인 Gemini 프롬프트 고도화)
- [ ] `summaryKr` 한국어 요약 품질 개선

---

## 3. PriSignal 랜딩 페이지 탭 구조

> 파일: `src/pages/PriSignal.jsx`

### 3-1. 현재 구현

- **탭 시스템**: `서비스 소개` (기본) | `데일리 시그널` 2탭
- **해시 기반 탭 전환**: `/prisignal#daily` → `데일리 시그널` 탭 자동 활성화
  - `useLocation().hash` 감지, `#daily` → `setActiveTab('articles')`
- **탭 인디케이터**: CSS `::after` 기반 그라데이션 밑줄 + box-shadow glow
- **데일리 상세 페이지에서도 동일 탭 바 표시** (데일리 시그널 활성 상태)

---

## 4. 콘텐츠 폭 규격 (v4 — 2026-04-28)

> 전 영역 통일 완료

| 영역 | max-width | 패딩 | 실제 콘텐츠 폭 |
|------|-----------|------|---------------|
| 메인 섹션 (`.prisignal-section`) | — | `var(--space-xl)` | 부모(900px) - 96px = 804px |
| 아카이브 그리드 | 부모 전폭 | — | 804px |
| 아카이브 CTA | 900px | 0 (inner padding) | 804px |
| 데일리 페이지 | 900px | `var(--space-xl)` | 804px |
| 데일리 CTA | `.prisignal-archive-cta` 공유 | — | 804px |

---

## 5. 날짜 로직 주의사항

### 5-1. UTC 오프셋 버그 (해결됨)

- **원인**: `new Date().toISOString()` 사용 시 UTC 변환으로 KST 기준 하루 오차 발생
- **해결**: `getAdjacentDate()` 함수에서 로컬 시간 기반 포맷팅 사용

### 5-2. 오늘 날짜 기준

```javascript
function getTodayKST() {
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().split('T')[0];
}
```

---

## 6. API 데이터 구조

```json
{
  "date": "2026-04-28",
  "status": "scored",
  "total": 19,
  "dmPickCount": 5,
  "articles": [
    {
      "id": "art_xnhviv",
      "title": "Article Title",
      "url": "https://...",
      "summary": "Summary text...",
      "summaryKr": "한국어 요약",
      "source": "McKinsey Insights",
      "category": "attitude",
      "tier": 1,
      "lang": "en",
      "ogImage": "https://...",
      "weightedScore": 18,
      "isDmPick": true,
      "editorComment": "편집자 코멘트..."
    }
  ]
}
```

> [!NOTE]
> `ogImage` 필드는 2026-04-28 기준 파이프라인에서 수집되어 JSON에 포함됩니다.
> 크롤링 성공률은 약 51%이므로, OG 이미지 없는 카드도 자연스러운 레이아웃을 유지합니다.

---

*최종 업데이트: 2026-04-28*
