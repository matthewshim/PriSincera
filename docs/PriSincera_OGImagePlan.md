# PriSignal 데일리 시그널 — OG 이미지 적용 구현 계획서

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
