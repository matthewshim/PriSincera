# PriSignal OG 이미지 — 실적용 구현 계획서

> **목표**: 데일리 시그널 목록(`/prisignal`)과 상세 페이지(`/prisignal/:date`)에 OG 이미지를 실제 적용
>
> 작성일: 2026-04-28 | 선행 문서: `PriSincera_OGImagePlan.md`

---

## 1. 현재 프로덕션 상태 점검 결과

### 1-1. 코드 vs 데이터 간극 분석

| 영역 | 코드 상태 | 데이터 상태 | 결론 |
|------|----------|-----------|------|
| **파이프라인** (`rss.mjs`) | ✅ `fetchOgImage()` 함수 구현 완료, `fetchFeed()` 내 병렬 크롤링 로직 포함 | — | 신규 수집분부터 `ogImage` 필드 자동 포함 |
| **백필 스크립트** (`backfill-og.mjs`) | ✅ 구현 완료 | — | 기존 데이터 마이그레이션 가능 |
| **서버** (`server.mjs`) | ✅ GCS JSON 그대로 프록시, CSP `img-src: https:` 허용 | — | 변경 불필요 |
| **데일리 상세** (`PriSignalDaily.jsx`) | ✅ `article.ogImage && (...)` 조건부 렌더링 코드 존재 (L334-343) | ❌ API 응답에 `ogImage` 필드 **부재** | 데이터만 채워지면 자동 동작 |
| **아카이브 목록** (`PriSignalArchive.jsx`) | ✅ `topArticle?.ogImage` 추출 + 썸네일/폴백 로직 구현 (L64-78, L151-178) | ❌ `ogImage` 필드 없어 항상 폴백 표시 | 데이터만 채워지면 자동 동작 |
| **CSS** (`PriSignalDaily.css`, `PriSignal.css`) | ✅ `.prisignal-daily-card-og`, `.prisignal-archive-card-thumb` 스타일 완료 | — | 변경 불필요 |

> **핵심 발견**: 프론트엔드 코드와 CSS는 이미 OG 이미지를 완벽히 지원하도록 구현되어 있습니다.
> **문제의 근본 원인**은 GCS 데일리 JSON(`daily/{date}.json`)에 `ogImage` 필드가 아직 없다는 것입니다.

### 1-2. API 응답 확인 (`/api/daily/2026-04-28`)

```json
{
  "articles": [
    {
      "id": "art_8741bi",
      "title": "Rigor: What it takes to turn ambition into impact",
      "url": "https://www.mckinsey.com/...",
      "summary": "...",
      "source": "McKinsey Insights",
      "category": "attitude",
      "tier": 1,
      "weightedScore": 18.0,
      "isDmPick": true
      // ← ogImage 필드 없음!
    }
  ]
}
```

---

## 2. 구현 범위 재정의

기존 계획서(OGImagePlan)에서 제시한 3개 레이어 중, **Layer 2 (Server)와 Layer 3 (Frontend)는 이미 구현 완료** 상태입니다.

```
┌────────────────────────────────────────────────────────────────┐
│  ✅ Layer 3: Frontend — 이미 구현됨 (PriSignalDaily.jsx,       │
│     PriSignalArchive.jsx, CSS)                                 │
├────────────────────────────────────────────────────────────────┤
│  ✅ Layer 2: Server — 변경 불필요 (GCS 프록시)                  │
├────────────────────────────────────────────────────────────────┤
│  ⚠️ Layer 1: Pipeline — 코드는 구현됨, 데이터 미반영           │
│  → backfill-og.mjs 실행으로 기존 데이터에 ogImage 채우기        │
│  → 이후 신규 수집은 rss.mjs가 자동 처리                        │
└────────────────────────────────────────────────────────────────┘
```

> **실질적으로 필요한 작업은 `backfill-og.mjs` 스크립트 실행 1회입니다.**

---

## 3. 실행 계획

### Step 1 — 기존 데이터 백필 실행 (필수)

`backfill-og.mjs`를 실행하여 GCS의 기존 데일리 JSON(4/21~4/28)에 `ogImage` 필드를 추가합니다.

```bash
# 로컬에서 실행 (GCS 인증 필요)
node pipeline/src/backfill-og.mjs 2026-04-21 2026-04-28
```

**실행 조건**:
- GCS 서비스 계정 키 또는 `gcloud auth application-default login` 인증 필요
- Cloud Run 환경에서 실행할 경우 서비스 계정이 자동 인증됨

**예상 결과**:
- 각 날짜별 아티클 URL에 HTTP 요청 → `<head>` 내 `og:image` 메타 태그 파싱
- 성공한 URL의 `ogImage` 필드가 GCS JSON에 추가 저장
- 실패한 URL은 `ogImage: null`로 처리 → 프론트에서 폴백 표시

### Step 2 — 결과 검증

백필 실행 후 프로덕션 페이지에서 확인:

| 페이지 | 예상 동작 |
|--------|----------|
| `/prisignal/2026-04-28` | 모든 아티클 카드에 OG 이미지 표시 (없는 경우 이미지 영역 자동 숨김) |
| `/prisignal` 아카이브 목록 | 각 날짜 카드 좌측에 최고 스코어 아티클의 OG 이미지 썸네일 표시 |

### Step 3 — 향후 자동 적용 확인

`rss.mjs`의 `fetchFeed()` 함수에 이미 OG 크롤링 로직이 포함되어 있으므로, **내일(4/29)부터 파이프라인이 자동 수집하는 데이터에는 `ogImage`가 자동 포함**됩니다.

---

## 4. 기존 구현 코드 확인 (참고)

### 4-1. 데일리 상세 페이지 — OG 이미지 렌더링 (이미 구현됨)

`PriSignalDaily.jsx` (L334-343):

```jsx
{article.ogImage && (
  <div className="prisignal-daily-card-og">
    <img
      src={article.ogImage}
      alt=""
      loading="lazy"
      onError={(e) => { e.target.parentElement.style.display = 'none'; }}
    />
  </div>
)}
```

### 4-2. 아카이브 목록 — 최고 스코어 OG 썸네일 (이미 구현됨)

`PriSignalArchive.jsx` (L64-78):

```jsx
// 최고 스코어 아티클 추출
const sorted = [...(data.articles || [])].sort(
  (a, b) => (b.weightedScore || 0) - (a.weightedScore || 0)
);
const topArticle = sorted[0] || null;

return {
  // ...
  ogImage: topArticle?.ogImage || null,
  topTitle: topArticle?.title || null,
  topCategory: topArticle?.category || null,
};
```

### 4-3. CSS 스타일 (이미 구현됨)

| 파일 | 클래스 | 용도 |
|------|--------|------|
| `PriSignalDaily.css` (L411-435) | `.prisignal-daily-card-og` | 상세 카드 OG 이미지 (full-width, max-height 220px, hover scale) |
| `PriSignal.css` (L631-685) | `.prisignal-archive-card-thumb` | 아카이브 카드 썸네일 (130×90px, 폴백 그라디언트) |

---

## 5. 위험 요소 및 대응

| 위험 | 확률 | 영향 | 대응 |
|------|------|------|------|
| 일부 사이트 OG 크롤링 실패 (타임아웃/차단) | 높음 | 낮음 | `ogImage: null` → 프론트 폴백 처리 이미 구현됨 |
| 외부 이미지 핫링크 차단 (403 응답) | 중간 | 중간 | `onError` 핸들러로 이미지 영역 자동 숨김 (이미 구현) |
| 백필 스크립트 GCS 인증 실패 | 중간 | 높음 | Cloud Shell 또는 인증된 환경에서 실행 |
| 대량 HTTP 요청으로 인한 IP 차단 | 낮음 | 중간 | `CONCURRENCY=10` 제한 + 8초 타임아웃 설정 완료 |

---

## 6. 변경 파일 요약

> **코드 변경 없음** — 모든 프론트엔드/서버 코드는 이미 구현되어 있습니다.

| 작업 | 대상 | 유형 | 설명 |
|------|------|------|------|
| 백필 실행 | `pipeline/src/backfill-og.mjs` | **실행** | GCS 기존 JSON에 ogImage 필드 추가 |
| 검증 | 프로덕션 페이지 | **확인** | OG 이미지 정상 표시 여부 확인 |

---

## 7. 의사결정 필요 사항

다음 사항에 대해 확인이 필요합니다:

1. **백필 실행 환경**: 로컬에서 `gcloud auth`로 실행할지, Cloud Shell에서 실행할지?

2. **백필 범위**: 4/21~4/28 전체 대상으로 할지, 특정 날짜만 할지?

3. **이미지 프록시 필요 여부**: 현재는 외부 OG 이미지를 직접 로드(`<img src="외부URL">`)합니다. 일부 사이트에서 핫링크 차단이 발생할 수 있는데, 초기에는 직접 로드로 시작하고 문제 발생 시 서버 프록시를 추가하는 점진적 접근이 괜찮을까요?

---

*최종 업데이트: 2026-04-28*
