# 📋 PriSignal 데일리 시그널 — UX/UI 사양서

> PriSignal 데일리 시그널의 프론트엔드 UX/UI 구현 현황 및 잔여 개선 과제를 정리합니다.

---

## 1. 데일리 시그널 목록 (Archive)

> 파일: `src/components/prisignal/PriSignalArchive.jsx`, `src/pages/PriSignal.css`

### 1-1. 현재 구현 (v3 — 2026-04-23)

- **카드 레이아웃**: 좌측 대형 날짜(숫자 + 요일) + 우측 상세(시그널 수, DM 픽 수, 카테고리 컬러 도트 칩, 보기 링크)
- **카테고리 칩**: 컬러 도트 + 카테고리명 + 카운트 형태
- **타이틀 텍스트**: 제거됨 (탭 자체가 "데일리 시그널"이므로 중복 제거)

### 1-2. 잔여 과제 — OG 이미지 활용

- [ ] 데일리 카드에 가장 스코어가 높은 아티클의 OG 이미지를 썸네일로 노출
- [ ] OG 이미지가 없는 경우를 대비한 카테고리 기반 기본 비주얼 제공

> [!IMPORTANT]
> 현재 API 응답(`/api/daily/:date`)에 OG 이미지 필드(`ogImage`)가 포함되어 있지 않음.
> 수집 파이프라인(Cloud Functions)에서 OG 이미지를 크롤링하여 JSON에 포함하는 작업이 선행되어야 함.

---

## 2. 데일리 시그널 상세 (Daily Detail Page)

> 파일: `src/pages/PriSignalDaily.jsx`, `src/pages/PriSignalDaily.css`

### 2-1. 현재 구현 (v3 — 2026-04-23)

#### 헤더 영역
- **타이틀**: 제거됨 (날짜 정보가 핵심이므로 중복 제거)
- **날짜 네비게이션**: `‹ 04-20(월)` — **21** 4월 화요일 — `04-22(수) ›` 형태
  - 이전/다음 화살표: **테두리 없는 ghost 스타일**, 영역 좌/우 끝 배치 (`justify-content: space-between`)
  - 날짜 센터: 대형 그래디언트 숫자 + 월/요일 정보
  - 미래 날짜일 경우 다음 화살표 비활성(투명 처리)
- **Daily List 버튼**: 날짜 아래에 pill 형태, 클릭 시 `/prisignal#daily` → 데일리 시그널 탭 자동 전환
- **서브타이틀**: 제거됨 ("N개의 시그널을 포착했습니다" 삭제)

#### 필터 영역
- **필터 칩**: 전체 | DM 픽 | Attitude | Priority | AI & Future | Global Lens | Product Craft
- **DM 픽 필터**: `isDmPick === true` 기준 필터링 (2026-04-23 추가)
- 각 칩에 카운트 배지, 컬러 도트 표시
- 활성 필터에 따라 아티클 목록 실시간 필터링

#### 아티클 카드
- DM Pick 하이라이트 (보라색 테두리/배경)
- Tier 배지 (T1/T2/T3 색상 구분)
- 에디터 코멘트 — 글래스모피즘 접이식 스티커 (기본 템플릿 문구 자동 필터링)
- 원문 링크

#### 하단 영역
- **CTA 섹션**: 구독 유도 (이메일 구독)
- 하단 네비게이션 바: 제거됨 (헤더의 날짜 네비게이션으로 통합)

### 2-2. 잔여 과제

- [ ] 아티클 카드 OG 이미지 썸네일 추가 (파이프라인 `ogImage` 필드 선행)
- [ ] 에디터 코멘트 품질 개선 (파이프라인 Gemini 프롬프트 고도화)
- [ ] `summaryKr` 한국어 요약 품질 개선

---

## 3. PriSignal 랜딩 페이지 탭 구조

> 파일: `src/pages/PriSignal.jsx`

### 3-1. 현재 구현

- **탭 시스템**: `서비스 소개` (기본) | `데일리 시그널` 2탭
- **해시 기반 탭 전환**: `/prisignal#daily` → `데일리 시그널` 탭 자동 활성화
  - `useLocation().hash` 감지, `#daily` → `setActiveTab('articles')`
  - Daily Detail의 "Daily List" 버튼에서 활용

---

## 4. 날짜 로직 주의사항

### 4-1. UTC 오프셋 버그 (해결됨)

- **원인**: `new Date().toISOString()` 사용 시 UTC 변환으로 KST 기준 하루 오차 발생
- **해결**: `getAdjacentDate()` 함수에서 로컬 시간 기반 포맷팅 (`getFullYear/getMonth/getDate`) 사용

```javascript
function getAdjacentDate(dateStr, offset) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d + offset);
  return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`;
}
```

### 4-2. 오늘 날짜 기준

```javascript
function getTodayKST() {
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().split('T')[0];
}
```

---

## 5. 선행 작업 (Backend / Pipeline)

- [ ] 수집 파이프라인에서 아티클 URL의 OG 이미지(`og:image`)를 크롤링하여 JSON 필드에 추가
  - 필드명: `ogImage` (string, URL)
  - fallback: 이미지 없을 경우 빈 문자열 또는 null
- [ ] GCS 데일리 JSON 스키마에 `ogImage` 필드 반영
- [ ] editorComment 품질 개선 (Gemini 프롬프트 고도화)

---

## 6. API 데이터 구조

```json
{
  "date": "2026-04-22",
  "status": "scored",
  "total": 21,
  "dmPickCount": 5,
  "articles": [
    {
      "id": "art_xnhviv",
      "title": "Article Title",
      "url": "https://...",
      "summary": "Summary text...",
      "source": "McKinsey Insights",
      "category": "attitude",
      "tier": 1,
      "lang": "en",
      "publishedAt": "Tue, 21 Apr 2026",
      "collectedAt": "2026-04-21T23:09:10.619Z",
      "scores": { "S": 2, "I": 2, "G": 2, "N": 2, "A": 2, "L": 2 },
      "totalScore": 12,
      "summaryKr": "한국어 요약",
      "weightedScore": 18,
      "isDmPick": true,
      "editorComment": "편집자 코멘트..."
    }
  ],
  "dm_picks": ["art_xnhviv", ...],
  "scoredAt": "2026-04-22T00:25:18.054Z"
}
```

> [!WARNING]
> `ogImage` 필드는 현재 미존재. 프론트 작업 전 파이프라인 업데이트가 필요합니다.

---

*최종 업데이트: 2026-04-23*
