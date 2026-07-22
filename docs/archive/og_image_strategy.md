---
status: archived
domain: Core
last_updated: 2026-07-22
version: v1.1
target_files:
  - pipeline/src/backfill-og.mjs
  - pipeline/src/lib/rss.mjs
---

# 🗄️ 동적 OG 이미지 전략 아카이브 (OG Image)

> 🗄️ **아카이브 안내 (2026-07-22)**: 본 문서의 UI/와이어프레임 부분은 삭제된 구 PriSignal 화면(`PriSignalArchive.jsx`·`PriSignalDaily.jsx`, 라우트 `/prisignal`) 기준의 레거시 기록입니다(해당 화면은 이후 Daily Digest → ReLearn으로 승계).
> **여전히 유효한 것**: 아티클 OG 수집 파이프라인 — `pipeline/src/lib/rss.mjs`의 `fetchOgImage`(RSS 수집 시 `ogImage` 필드 주입)와 소급 스크립트 `pipeline/src/backfill-og.mjs`는 현행 가동 중입니다.
> **현행 규범**: 사이트 자체 OG 이미지 전략은 [core/seo_meta_standard.md](../core/seo_meta_standard.md)(카테고리별 OG 매핑)와 제너레이터 `ci/gen_og_images.py`가 대체합니다.

> **목표**: 현재 텍스트 중심의 밋밋한 데일리 시그널 UI를 OG 이미지 기반의 비주얼 카드 디자인으로 개선
>
> 작성일: 2026-04-26

---

## 1. 현재 상태 분석

### 1-1. 데이터 현황

현재 API 응답(`/api/daily/:date`)의 아티클 구조:

```json
{
  "id": "art_8741bi",
  "title": "Three reasons why DeepSeek's new model matters",
  "url": "https://www.technologyreview.com/...",
  "summary": "...",
  "source": "MIT Tech Review AI",
  "category": "ai",
  "tier": 1,
  "scores": { "S": 2, "I": 2, ... },
  "weightedScore": 18,
  "isDmPick": true,
  "editorComment": "..."
}
```

> [!WARNING]
> **`ogImage` 필드가 존재하지 않음** — 수집 파이프라인(`collector.mjs` → `rss.mjs`)에서 OG 이미지를 크롤링하는 로직이 전혀 없는 상태입니다.

### 1-2. UI 현황

| 페이지 | 파일 | 현재 상태 |
|--------|------|----------|
| **데일리 목록** (Archive) | `PriSignalArchive.jsx` | 날짜 + 시그널 수 + 카테고리 칩만 표시. 이미지 없음 |
| **데일리 상세** (Daily Detail) | `PriSignalDaily.jsx` | 텍스트 카드 (제목 + 출처 + 요약 + 에디터 코멘트). 이미지 없음 |

### 1-3. 파이프라인 현황

```
collector.mjs → rss.mjs(fetchFeed) → GCS daily/{date}.json
```

- `rss.mjs`의 `fetchFeed()` 함수는 RSS 피드에서 `title`, `link`, `contentSnippet`, `pubDate`만 추출
- OG 이미지를 가져오려면 **각 아티클의 URL에 HTTP 요청 → HTML 파싱 → `og:image` meta 태그 추출** 필요

---

## 2. 구현 범위 (3개 레이어)

```
┌─────────────────────────────────────────────────┐
│  Layer 1: Pipeline (수집)                        │
│  rss.mjs에 OG 이미지 크롤링 기능 추가             │
│  → 아티클 JSON에 ogImage 필드 포함               │
├─────────────────────────────────────────────────┤
│  Layer 2: Server (API)                           │
│  기존 /api/daily/:date 프록시 — 변경 불필요       │
│  (GCS JSON에 ogImage 필드가 포함되면 자동 전달)   │
├─────────────────────────────────────────────────┤
│  Layer 3: Frontend (UI)                          │
│  ① PriSignalArchive.jsx — 목록 카드 이미지 추가   │
│  ② PriSignalDaily.jsx — 상세 카드 이미지 추가      │
│  ③ CSS — 카드 디자인 리뉴얼                       │
└─────────────────────────────────────────────────┘
```

---

## 3. Layer 1 — Pipeline: OG 이미지 크롤링

### 3-1. 변경 대상

#### [MODIFY] `pipeline/src/lib/rss.mjs`

**추가 기능**: `fetchOgImage(url)` 함수 신규 작성

```javascript
/**
 * 아티클 URL에서 og:image 메타 태그를 추출합니다.
 * @param {string} url - 아티클 URL
 * @returns {Promise<string|null>} OG 이미지 URL 또는 null
 */
async function fetchOgImage(url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'PriSignal/1.0 (https://www.prisincera.com)',
        'Accept': 'text/html',
      },
      redirect: 'follow',
    });
    clearTimeout(timeout);

    if (!res.ok) return null;

    // <head> 영역만 파싱하여 메모리 절약
    const html = await res.text();
    const headEnd = html.indexOf('</head>');
    const headHtml = headEnd > -1 ? html.slice(0, headEnd) : html.slice(0, 10000);

    // og:image 추출 (property/content 순서 양방향 대응)
    const ogMatch = headHtml.match(
      /<meta\s+(?:property|name)=["']og:image["']\s+content=["']([^"']+)["']/i
    ) || headHtml.match(
      /<meta\s+content=["']([^"']+)["']\s+(?:property|name)=["']og:image["']/i
    );

    return ogMatch?.[1] || null;
  } catch {
    return null;
  }
}
```

**`fetchFeed()` 수정**: 아티클 수집 후 OG 이미지를 병렬로 크롤링

```javascript
// 기존 map 결과에 ogImage 필드 추가
const articles = (feed.items || [])
  .filter(/* ... */)
  .slice(0, maxPerSource)
  .map(item => ({ /* 기존 필드 */ }));

// OG 이미지 병렬 크롤링 (소스당 최대 5개이므로 부하 적음)
const ogResults = await Promise.allSettled(
  articles.map(a => fetchOgImage(a.url))
);

articles.forEach((a, i) => {
  a.ogImage = ogResults[i].status === 'fulfilled'
    ? ogResults[i].value
    : null;
});

return articles;
```

### 3-2. 성능 / 비용 고려

| 항목 | 분석 |
|------|------|
| **요청 수** | 소스당 최대 5개 × 35개 소스 = 최대 175개 HTTP 요청 |
| **타임아웃** | 개별 8초, 전체 병렬 처리로 실질 소요 ~15초 |
| **대역폭** | `</head>` 이후 파싱 중단 → HTML 전체 다운로드 방지 불가 (fetch API 한계) |
| **비용** | Cloud Run Job 실행 시간 소폭 증가 (무료 티어 내) |
| **실패 처리** | OG 이미지 크롤링 실패 시 `null` → 프론트에서 폴백 처리 |

> [!IMPORTANT]
> **HTML 전체 다운로드 이슈**: Node.js `fetch`는 `res.text()`로 전체 HTML을 메모리에 로드합니다.
> 대안으로 `undici`의 스트리밍 또는 `node-html-parser`의 부분 파싱을 고려할 수 있으나,
> 소스당 5개 × 일반적 아티클 페이지 크기(~100KB) 기준 약 17MB로 Cloud Run 메모리(256MB) 내 충분합니다.

### 3-3. GCS 데일리 JSON 스키마 변경

```diff
 {
   "id": "art_8741bi",
   "title": "Three reasons why DeepSeek's new model matters",
   "url": "https://...",
+  "ogImage": "https://wp.technologyreview.com/wp-content/uploads/2026/04/...",
   "summary": "...",
   ...
 }
```

| 필드 | 타입 | 설명 |
|------|------|------|
| `ogImage` | `string \| null` | 아티클의 OG 이미지 URL. 없으면 `null` |

---

## 4. Layer 2 — Server: 변경 불필요

현재 `server.mjs`의 `/api/daily/:date` 엔드포인트는 GCS JSON을 **그대로 프록시**합니다.

```javascript
app.get('/api/daily/:date', async (req, res) => {
  const [content] = await storage.bucket(GCS_BUCKET)
    .file(`daily/${dateStr}.json`).download();
  res.send(content); // JSON 전체를 그대로 전달
});
```

GCS JSON에 `ogImage` 필드가 추가되면 프론트엔드에 자동으로 전달됩니다. **서버 코드 변경 불필요.**

> [!NOTE]
> CSP `img-src` 정책은 이미 `"'self'", "data:", "https:"` 로 설정되어 있어 외부 이미지 로드가 허용됩니다.

---

## 5. Layer 3 — Frontend: UI 카드 디자인 개선

### 5-1. 데일리 목록 (Archive) — 최고 스코어 OG 노출

#### [MODIFY] `src/components/prisignal/PriSignalArchive.jsx`

**변경 사항**:
1. API에서 `articles` 배열도 함께 받아와 최고 스코어 아티클의 `ogImage` 추출
2. 카드 레이아웃에 OG 이미지 썸네일 영역 추가

**데이터 fetch 변경**:

```javascript
// 기존: total, dmPickCount, categories만 추출
// 변경: 최고 스코어 아티클의 ogImage도 추출

const topArticle = (data.articles || [])
  .sort((a, b) => (b.weightedScore || 0) - (a.weightedScore || 0))[0];

return {
  date,
  total: data.total || 0,
  dmPickCount: data.dmPickCount || 0,
  categories: getCategoryBreakdown(data.articles || []),
  ogImage: topArticle?.ogImage || null,
  topTitle: topArticle?.title || null,
  topSource: topArticle?.source || null,
  isToday: date === today,
};
```

**카드 와이어프레임 (목록)**:

```
┌──────────────────────────────────────────────────────┐
│ ┌──────────┐                                          │
│ │          │  26  토                                   │
│ │ OG Image │  11 시그널  📬 DM 5      [TODAY]          │
│ │ (top)    │  ● AI 2  ● Global 6  ● Product 1  ...   │
│ │          │                                  보기 >   │
│ └──────────┘                                          │
└──────────────────────────────────────────────────────┘
```

- 좌측: OG 이미지 썸네일 (120×80px, `border-radius: 10px`, `object-fit: cover`)
- OG 이미지가 없을 경우: 카테고리 기반 그라디언트 플레이스홀더 (아이콘 + 배경색)
- 기존 날짜 대형 숫자는 우측 상단으로 이동

**폴백 (이미지 없음) 디자인**:

```
┌──────────┐
│  🤖      │   ← 최고 스코어 아티클의 카테고리 아이콘
│  AI      │   ← 카테고리명
│          │   배경: 카테고리 컬러 그라디언트
└──────────┘
```

### 5-2. 데일리 상세 (Daily Detail) — 개별 아티클 OG 노출

#### [MODIFY] `src/pages/PriSignalDaily.jsx`

**카드 와이어프레임 (상세)**:

```
┌──────────────────────────────────────────────────────┐
│  📬 DM Pick                                          │
│  MIT Tech Review AI  [T1]  ★ 18.0                    │
├──────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────────────┐ │
│ │                                                  │ │
│ │              OG Image (full-width)               │ │
│ │              aspect-ratio: 1.91:1                │ │
│ │              max-height: 200px                   │ │
│ │                                                  │ │
│ └──────────────────────────────────────────────────┘ │
│                                                      │
│  Three reasons why DeepSeek's new model matters      │
│                                                      │
│  한국어 요약 텍스트가 여기에 표시됩니다...               │
│                                                      │
│  ┌─ ✍️ 에디터 추천 ──────────────────────── ▾ ─────┐ │
│  │  에디터 코멘트 내용...                            │ │
│  └──────────────────────────────────────────────────┘ │
│                                                      │
│  원문 읽기 ↗                                          │
└──────────────────────────────────────────────────────┘
```

**구현 코드 (JSX 추가 영역)**:

```jsx
{/* OG 이미지 — 메타 row와 제목 사이에 삽입 */}
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

### 5-3. CSS 신규 스타일

#### [MODIFY] `src/pages/PriSignal.css` (Archive 카드)

```css
/* Archive 카드 — OG 이미지 썸네일 */
.prisignal-archive-card-thumb {
  width: 120px;
  min-height: 80px;
  border-radius: 10px;
  overflow: hidden;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.04);
}
.prisignal-archive-card-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s var(--ease-out);
}
.prisignal-archive-card:hover .prisignal-archive-card-thumb img {
  transform: scale(1.05);
}
/* 폴백: 카테고리 그라디언트 플레이스홀더 */
.prisignal-archive-card-thumb-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background: linear-gradient(135deg,
    var(--thumb-color, rgba(196, 181, 253, 0.15)),
    rgba(0, 0, 0, 0.2));
  font-size: 1.5rem;
}
```

#### [MODIFY] `src/pages/PriSignalDaily.css` (상세 카드)

```css
/* 아티클 카드 — OG 이미지 */
.prisignal-daily-card-og {
  width: 100%;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: var(--space-sm);
  aspect-ratio: 1.91 / 1;
  max-height: 200px;
  background: rgba(255, 255, 255, 0.03);
}
.prisignal-daily-card-og img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s var(--ease-out);
}
.prisignal-daily-card:hover .prisignal-daily-card-og img {
  transform: scale(1.03);
}
```

---

## 6. 폴백 전략 (이미지 없는 경우)

| 위치 | 폴백 방식 |
|------|----------|
| **목록 카드** | 카테고리 아이콘 + 그라디언트 배경의 플레이스홀더 박스 |
| **상세 카드** | OG 이미지 영역 자체를 숨김 (`display: none`) — 기존 텍스트 카드로 자연스럽게 표시 |

**이미지 로드 실패 핸들링**:

```jsx
onError={(e) => {
  e.target.parentElement.style.display = 'none';
}}
```

---

## 7. 기존 데이터 마이그레이션

> [!IMPORTANT]
> **기존 수집 데이터(4/21~4/26)에는 `ogImage` 필드가 없습니다.**

| 방식 | 설명 | 장단점 |
|------|------|--------|
| **A. 일회성 백필 스크립트** | 기존 GCS JSON을 읽어 각 URL의 OG 이미지를 크롤링 후 재저장 | ✅ 과거 데이터도 이미지 포함 / ❌ 일회성 스크립트 필요 |
| **B. 자연 적용** | 파이프라인 수정 이후 신규 수집분부터만 적용 | ✅ 간단 / ❌ 과거 6일분 이미지 없음 |

**권장: 방식 B (자연 적용)** — 서비스 런칭 초기 단계이므로 과거 데이터 보정 우선순위 낮음.

---

## 8. 변경 파일 요약

| 레이어 | 파일 | 변경 유형 | 내용 |
|--------|------|----------|------|
| Pipeline | `pipeline/src/lib/rss.mjs` | MODIFY | `fetchOgImage()` 함수 추가, `fetchFeed()` 수정 |
| Frontend | `src/components/prisignal/PriSignalArchive.jsx` | MODIFY | 최고 스코어 OG 이미지 추출 + 카드 썸네일 추가 |
| Frontend | `src/pages/PriSignalDaily.jsx` | MODIFY | 아티클 카드에 OG 이미지 영역 추가 |
| Frontend | `src/pages/PriSignal.css` | MODIFY | Archive 카드 이미지 스타일 |
| Frontend | `src/pages/PriSignalDaily.css` | MODIFY | Daily 카드 OG 이미지 스타일 |

---

## 9. 추진 일정 (안)

| 단계 | 작업 | 예상 소요 |
|------|------|----------|
| **Step 1** | `rss.mjs` OG 크롤링 기능 추가 + 로컬 테스트 | 1~2시간 |
| **Step 2** | `PriSignalDaily.jsx` + CSS 상세 카드 이미지 적용 | 1시간 |
| **Step 3** | `PriSignalArchive.jsx` + CSS 목록 카드 이미지 적용 | 1시간 |
| **Step 4** | 로컬 빌드 + 이미지 폴백 검증 | 30분 |
| **Step 5** | Cloud Build 배포 + 실제 데이터 확인 | 30분 |

---

## 10. Open Questions

> [!IMPORTANT]
> 다음 사항에 대한 확인이 필요합니다:

1. **마이그레이션 방식**: 기존 4/21~4/26 데이터에 대한 OG 이미지 백필이 필요한가요, 아니면 신규 수집분부터 적용하면 충분한가요?

2. **이미지 프록시 필요 여부**: 외부 OG 이미지를 직접 로드(`<img src="외부URL">`)하면 일부 사이트에서 핫링크 차단이 발생할 수 있습니다. 초기에는 직접 로드로 시작하고 문제 발생 시 서버 프록시(`/api/og-image?url=...`)를 추가하는 점진적 접근이 괜찮을까요?

3. **목록 카드 레이아웃 방향**:
   - **A안**: 좌측 OG 썸네일 + 우측 날짜/상세 (이미지가 날짜를 대체)
   - **B안**: 상단 OG 이미지 + 하단 날짜/상세 (세로 카드)
   - 어느 방향을 선호하시나요?

---

*최종 업데이트: 2026-04-26*
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
