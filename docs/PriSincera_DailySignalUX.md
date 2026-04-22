# 📋 데일리 시그널 UX/UI 개선 과제

> PriSignal 데일리 시그널의 목록 카드 및 상세 페이지 디자인 품질을 개선하기 위한 과제 목록입니다.

---

## 1. 데일리 시그널 목록 (Archive Card)

> 파일: `src/components/prisignal/PriSignalArchive.jsx`, `src/pages/PriSignal.css`

### 1-1. OG 이미지 활용 — 디자인 품질 개선

- [ ] 데일리 카드에 가장 스코어가 높은 아티클의 OG 이미지를 썸네일로 노출
- [ ] OG 이미지가 없는 경우를 대비한 카테고리 기반 기본 비주얼(placeholder gradient) 제공
- [ ] 카드 레이아웃을 좌측 텍스트 + 우측 이미지(or 상단 이미지 배너) 형태로 리디자인

> [!IMPORTANT]
> 현재 API 응답(`/api/daily/:date`)에 OG 이미지 필드(`ogImage`)가 포함되어 있지 않음.
> 수집 파이프라인(Cloud Functions)에서 OG 이미지를 크롤링하여 JSON에 포함하는 작업이 선행되어야 함.
> 또는 프론트에서 URL 기반으로 OG 이미지를 런타임 추출하는 방안 검토 필요.

### 1-2. 카테고리별 아티클 수 — 가독성 개선

- [ ] 현재: `🎯 Attitude ×3 ⚡ Priority ×1` 형태로 나열 → 정보 인지 어려움
- [ ] 개선: 카테고리별 컬러 도트 + 개수를 시각적 바(bar) 또는 미니 칩(chip)으로 표현
- [ ] 총 개수는 카드 상단 또는 눈에 띄는 위치에 강조 표시 (예: 큰 숫자 + "시그널")

### 1-3. 날짜/요일 표기 — 가독성 및 디자인 개선

- [ ] 현재: `📡 4/22(화)` 형태 → 날짜가 작고 부수적 정보처럼 보임
- [ ] 개선: 날짜를 카드의 좌측 또는 상단에 대형 타이포로 배치 (예: 일자 큰 숫자 + 요일)
- [ ] TODAY 뱃지 디자인 강화 (그라디언트 배경 또는 글로우 효과)

---

## 2. 데일리 시그널 상세 (Daily Detail Page)

> 파일: `src/pages/PriSignalDaily.jsx`, `src/pages/PriSignalDaily.css`

### 2-1. 카테고리 필터링 기능 추가

- [ ] 상단에 카테고리 필터 칩(chip) UI 구현 (전체 | Attitude | Priority | AI | Global | Product)
- [ ] 활성화된 필터에 따라 아티클 목록 필터링
- [ ] 필터 상태에 따른 아티클 카운트 실시간 업데이트
- [ ] 필터 전환 시 부드러운 애니메이션 (fade/slide)

### 2-2. 아티클 카드 OG 이미지 활용

- [ ] 아티클 카드에 OG 이미지 썸네일 추가 (좌측 또는 상단)
- [ ] 이미지 로딩 실패 시 카테고리 컬러 기반 기본 비주얼 제공
- [ ] 카드 레이아웃을 가로형(이미지 좌 + 콘텐츠 우)으로 리디자인

> [!NOTE]
> 1-1과 동일하게 API에 OG 이미지 필드 추가가 선행 조건.

### 2-3. 에디터 코멘트(스티커) 디자인 개선

- [ ] 현재: `✍️ {editorComment}` — 안내 문구가 중복 노출되어 가독성 저하
- [ ] 개선: 스티커 형태의 컴팩트한 인라인 배지로 변경
  - 코멘트 텍스트를 1~2줄로 말줄임 처리 (expand 가능)
  - "에디터 추천" 라벨과 코멘트를 분리 표시
  - 스티커 배경을 글래스모피즘 스타일로 차별화
- [ ] 중복 노출 방지: editorComment가 기본 템플릿 문구와 동일한 경우 숨김 처리

---

## 3. 선행 작업 (Backend / Pipeline)

- [ ] 수집 파이프라인에서 아티클 URL의 OG 이미지(`og:image`)를 크롤링하여 JSON 필드에 추가
  - 필드명: `ogImage` (string, URL)
  - fallback: 이미지 없을 경우 빈 문자열 또는 null
- [ ] GCS 데일리 JSON 스키마에 `ogImage` 필드 반영
- [ ] editorComment 내 기본 템플릿 문구 식별 및 flag 처리 검토

---

## 4. 참고 — 현재 API 데이터 구조

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
  ]
}
```

> [!WARNING]
> `ogImage` 필드는 현재 미존재. 프론트 작업 전 파이프라인 업데이트가 필요합니다.

---

*최종 업데이트: 2026-04-22*
