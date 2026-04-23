# 🔒 PriSincera — 웹서비스 보안 취약점 분석 보고서

> **작성일**: 2026-04-23  
> **분석 범위**: PriSincera 웹사이트 프론트엔드, 서버(`server.mjs`), Nginx 리버스 프록시, 데일리 파이프라인, CI/CD  
> **분석 기준**: OWASP Top 10, CWE 주요 항목, 웹 보안 모범 사례

---

## 📋 목차

1. [요약 (Executive Summary)](#1-요약)
2. [SQL 인젝션 분석](#2-sql-인젝션-분석)
3. [XSS (Cross-Site Scripting)](#3-xss-cross-site-scripting)
4. [API 보안](#4-api-보안)
5. [서버 보안](#5-서버-보안)
6. [인프라 & 배포 보안](#6-인프라--배포-보안)
7. [데이터 보안 & 개인정보](#7-데이터-보안--개인정보)
8. [파이프라인 보안](#8-파이프라인-보안)
9. [보안 헤더 분석](#9-보안-헤더-분석)
10. [개선 로드맵](#10-개선-로드맵)

---

## 1. 요약

### 아키텍처 특성

PriSincera는 **데이터베이스가 없는 정적 SPA** 아키텍처입니다:

```
[React SPA] → [Express Server] → [GCS JSON] (읽기 전용)
                   ↓
            [Buttondown API] (이메일 구독 프록시)
```

- **데이터베이스 없음**: SQL, NoSQL, 인메모리 DB 등이 일체 사용되지 않음
- **서버 사이드 로직 최소**: Express는 정적 파일 서빙 + API 프록시 역할만 수행
- **사용자 입력 지점**: 이메일 구독 폼 1개소
- **외부 API 연동**: Buttondown(이메일), GCS(데일리 JSON), Gemini(AI 스코어링)

### 위험도 요약

| 등급 | 항목 수 | 설명 |
|:----:|:-------:|------|
| 🔴 **Critical** | 1 | XSS via `dangerouslySetInnerHTML` |
| 🟠 **High** | 3 | Rate limiting 부재, CSP 미설정, CORS 와일드카드 |
| 🟡 **Medium** | 5 | Helmet 미사용, Request body 미검증, Archive ID 미검증, Docker 비-root 미적용, 에러 정보 노출 |
| 🟢 **Low** | 4 | Referrer-Policy 미설정, HSTS 미설정, 캐시 헤더 일관성, 로그 민감정보 |

---

## 2. SQL 인젝션 분석

### 결론: **해당 없음 (N/A)** ✅

| 점검 항목 | 결과 |
|-----------|------|
| SQL 데이터베이스 사용 | ❌ 없음 |
| ORM / Query Builder | ❌ 없음 |
| 사용자 입력의 DB 쿼리 전달 | ❌ 없음 |
| NoSQL 인젝션 (MongoDB 등) | ❌ 해당 없음 |

PriSincera는 **데이터베이스를 사용하지 않습니다**. 모든 데이터는:
- **GCS JSON 파일**: 정적 파일 읽기 (서버에서 `@google-cloud/storage` SDK 사용)
- **Buttondown API**: 외부 SaaS API 호출 (HTTP 프록시)

따라서 SQL 인젝션, NoSQL 인젝션, LDAP 인젝션 등 **모든 인젝션 계열 공격은 현재 아키텍처에서 해당 없습니다**.

> [!NOTE]
> 향후 사용자 데이터를 직접 저장하는 기능(댓글, 프로필 등)이 추가될 경우 이 항목을 재평가해야 합니다.

---

## 3. XSS (Cross-Site Scripting)

### 🔴 CRITICAL — `dangerouslySetInnerHTML` 사용

**파일**: `src/components/prisignal/PriSignalIssue.jsx:108`

```jsx
<div
  className="prisignal-issue-content"
  dangerouslySetInnerHTML={{ __html: issue.body || issue.html_body || '' }}
/>
```

**위험 분석**:
- Buttondown API에서 반환된 HTML을 **산출 검증 없이** 직접 렌더링
- Buttondown이 해킹되거나 API 응답이 변조될 경우 **Stored XSS** 발생 가능
- 공격자가 구독자에게 발송되는 이메일에 악성 스크립트를 삽입할 수 있음

**영향도**: 사용자 세션 탈취, 피싱 UI 표시, 키로깅 가능

**개선 방안**:

```javascript
// 방안 1: DOMPurify 라이브러리 사용 (권장)
import DOMPurify from 'dompurify';

<div dangerouslySetInnerHTML={{
  __html: DOMPurify.sanitize(issue.body || issue.html_body || '', {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'blockquote', 'img'],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'target', 'rel'],
  })
}} />

// 방안 2: 외부 콘텐츠를 iframe sandbox로 격리
<iframe
  sandbox="allow-same-origin"
  srcDoc={issue.body || ''}
  title="Newsletter content"
/>
```

### React의 기본 XSS 방어 ✅

React는 JSX 내 문자열을 **자동 이스케이프**합니다. 아래 컴포넌트들은 안전합니다:

| 컴포넌트 | 데이터 소스 | 상태 |
|----------|-----------|------|
| `PriSignalDaily.jsx` | GCS JSON (title, summary 등) | ✅ 안전 (JSX 자동 이스케이프) |
| `PriSignalArchive.jsx` | GCS index JSON | ✅ 안전 |
| `SubscribeForm.jsx` | 사용자 이메일 입력 | ✅ 안전 (값이 DOM에 텍스트로만 삽입) |

---

## 4. API 보안

### 🟠 HIGH — Rate Limiting 부재

**파일**: `server.mjs` — 전체 서버

현재 `/api/subscribe` 엔드포인트에 **요청 횟수 제한이 없습니다**.

**위험 분석**:
- 공격자가 자동화된 스크립트로 구독 API를 **대량 호출** 가능
- Buttondown API 쿼터 소진 → 서비스 장애
- 스팸 이메일 주소 대량 등록 → Buttondown 계정 제재 위험
- 서버 리소스 과부하 (DoS)

**개선 방안**:

```javascript
import rateLimit from 'express-rate-limit';

// 구독 API에 rate limiting 적용
const subscribeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 5,                    // IP당 5회
  message: { error: '요청이 너무 많습니다. 15분 후 다시 시도해주세요.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.post('/api/subscribe', subscribeLimiter, async (req, res) => { ... });

// 일반 API에도 전역 rate limiting
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1분
  max: 60,                  // IP당 60회
});
app.use('/api/', apiLimiter);
```

### 🟡 MEDIUM — Archive ID 미검증

**파일**: `server.mjs:100-110`

```javascript
app.get('/api/archive/:id', async (req, res) => {
  const resp = await fetch(`https://api.buttondown.email/v1/emails/${req.params.id}`, { ... });
});
```

`req.params.id`가 **검증 없이** 외부 API URL에 삽입됩니다.

**위험 분석**: Buttondown API는 UUID 형식의 ID를 사용하므로 직접적인 SSRF 위험은 낮으나, 경로 조작 시도 가능.

**개선 방안**:

```javascript
app.get('/api/archive/:id', async (req, res) => {
  const id = req.params.id;
  // UUID v4 형식 검증
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return res.status(400).json({ error: 'Invalid archive ID' });
  }
  // ...
});
```

### 🟡 MEDIUM — Request Body 미검증 (Subscribe)

**파일**: `server.mjs:67-86`

```javascript
app.post('/api/subscribe', async (req, res) => {
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', async () => {
    const resp = await fetch('...', { body });
  });
});
```

**위험 분석**:
- Request body 크기 제한 없음 → 대용량 페이로드로 메모리 과부하 가능
- body 내용 검증 없이 Buttondown API에 전달 → 예기치 않은 필드 주입 가능

**개선 방안**:

```javascript
import express from 'express';
app.use('/api/subscribe', express.json({ limit: '1kb' })); // 크기 제한

app.post('/api/subscribe', async (req, res) => {
  const { email_address } = req.body;
  // 이메일 형식 서버 측 검증
  if (!email_address || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email_address)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }
  // 허용된 필드만 전달
  const resp = await fetch('...', {
    body: JSON.stringify({ email_address, type: 'regular' })
  });
});
```

### 🟠 HIGH — CORS 와일드카드

**파일**: `nginx.conf:54, 66`

```nginx
add_header Access-Control-Allow-Origin "*";
```

**위험 분석**: GCS 프록시 응답에 와일드카드 CORS가 설정되어 있어, **어떤 외부 사이트에서든** 데일리 시그널 데이터를 직접 읽을 수 있음.

**개선 방안**: 특정 오리진만 허용하거나 (현재는 Express 서버 사용 중이므로) nginx.conf 내 CORS 헤더를 제거하고, Express에서 `cors` 미들웨어로 세밀하게 제어.

```javascript
import cors from 'cors';
app.use('/api/', cors({ origin: 'https://www.prisincera.com' }));
```

---

## 5. 서버 보안

### 🟡 MEDIUM — Helmet 미사용

**파일**: `server.mjs`

현재 보안 헤더를 수동으로 3개만 설정하고 있습니다:

```javascript
res.setHeader('X-Content-Type-Options', 'nosniff');
res.setHeader('X-Frame-Options', 'DENY');
res.setHeader('X-XSS-Protection', '1; mode=block');
```

**누락된 필수 헤더**:
- `Content-Security-Policy` (CSP)
- `Strict-Transport-Security` (HSTS)
- `Referrer-Policy`
- `Permissions-Policy`
- `Cross-Origin-Opener-Policy`
- `Cross-Origin-Embedder-Policy`

**개선 방안**:

```javascript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  strictTransportSecurity: { maxAge: 31536000, includeSubDomains: true, preload: true },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));
```

### 🟠 HIGH — CSP (Content-Security-Policy) 미설정

현재 CSP가 전혀 설정되어 있지 않습니다.

**위험 분석**:
- XSS 공격 발생 시 **외부 스크립트 로딩 차단이 불가능**
- 인라인 스크립트 실행이 제한 없이 허용됨
- 데이터 유출 경로(외부 서버로 데이터 전송) 차단 불가

CSP는 XSS 방어의 **최후 방어선**으로, `dangerouslySetInnerHTML` 사용과 결합될 경우 위험이 극대화됩니다.

### 🟡 MEDIUM — 에러 응답 정보 노출

**파일**: `server.mjs:138`

```javascript
res.status(404).json({ error: 'Daily signal not found', date: dateStr });
```

사용자 입력값(`dateStr`)을 에러 응답에 포함합니다. 프로덕션에서 에러 메시지는 최소한의 정보만 포함해야 합니다.

---

## 6. 인프라 & 배포 보안

### 🟡 MEDIUM — Docker 비-root 사용자 미적용

**파일**: `Dockerfile`

```dockerfile
FROM node:20-alpine
WORKDIR /app
# ... (root 사용자로 실행)
CMD ["node", "server.mjs"]
```

**위험 분석**: 컨테이너가 `root` 사용자로 실행됩니다. 컨테이너 탈출 공격 시 호스트 시스템에 대한 권한 상승 가능.

**개선 방안**:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY server.mjs package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# 비-root 사용자로 실행
RUN addgroup -g 1001 -S nodejs && \
    adduser -S prisincera -u 1001 -G nodejs
USER prisincera

EXPOSE 8080
CMD ["node", "server.mjs"]
```

### Cloud Run 보안 ✅

| 항목 | 상태 |
|------|------|
| IAM 기반 인증 | ✅ `--allow-unauthenticated` (공개 웹사이트로 적절) |
| 서비스 계정 분리 | ⚠️ 기본 컴퓨트 SA 사용 (전용 SA 권장) |
| VPC 커넥터 | N/A (외부 API만 호출) |
| Secret Manager | ⚠️ 환경변수로 API 키 직접 주입 (Secret Manager 연동 권장) |

---

## 7. 데이터 보안 & 개인정보

### 수집되는 개인정보

| 데이터 | 수집 방식 | 저장 위치 | 위험도 |
|--------|----------|----------|--------|
| 이메일 주소 | 구독 폼 | Buttondown (외부 SaaS) | 🟢 Low |

PriSincera는 **자체 데이터베이스에 개인정보를 저장하지 않습니다**. 이메일 주소는 Buttondown API로 직접 전달되며, PriSincera 서버에는 저장되지 않습니다.

### 🟢 LOW — 구독 폼 개인정보 처리 안내 부재

구독 폼에 개인정보 수집·이용 동의 안내 또는 개인정보처리방침 링크가 없습니다. 법적 요구사항(개인정보보호법)에 따라 추가가 권장됩니다.

### 🟢 LOW — 로그 내 민감 정보

**파일**: `server.mjs:156`

```javascript
console.log(`[PriSincera] Buttondown API: ${BUTTONDOWN_API_KEY ? 'configured' : 'NOT SET'}`);
```

API 키 존재 여부만 로깅하므로 현재는 안전하나, 디버그 목적의 추가 로깅 시 API 키가 실수로 노출될 위험이 있습니다.

---

## 8. 파이프라인 보안

### 파이프라인 구성 (`pipeline/`)

| 항목 | 상태 | 비고 |
|------|------|------|
| API 키 관리 | ✅ 환경변수 사용 | Secret Manager 연동 권장 |
| 외부 RSS 수집 | ⚠️ 아웃바운드만 | RSS 응답 내 악성 HTML은 `cleanSummary()`에서 제거 |
| GCS 쓰기 권한 | ✅ 서비스 계정 기반 | |
| Gemini API 호출 | ✅ API 키 + 응답 JSON 파싱 | |
| 입력 데이터 신뢰 | ⚠️ RSS 피드 데이터를 GCS에 저장 후 프론트에서 소비 | |

### RSS 데이터의 신뢰 체인

```
[외부 RSS 피드] → collector.mjs (cleanSummary로 HTML 제거) → GCS JSON
                                                                 ↓
[React SPA] ← /api/daily/:date ← Express Server ← GCS JSON
```

`cleanSummary()` 함수가 HTML 태그를 정규식으로 제거하지만, 정규식 기반 HTML 파싱은 **100% 안전하지 않습니다** (edge case 존재). 다만, React JSX가 최종적으로 문자열을 이스케이프하므로 **이중 방어**가 적용되어 현재 위험도는 낮습니다.

---

## 9. 보안 헤더 분석

### 현재 상태 vs 권장 상태

| 헤더 | 현재 | 권장 | 상태 |
|------|------|------|:----:|
| `X-Content-Type-Options` | `nosniff` | `nosniff` | ✅ |
| `X-Frame-Options` | `DENY` | `DENY` | ✅ |
| `X-XSS-Protection` | `1; mode=block` | `0` (CSP가 대체) | ⚠️ |
| `Content-Security-Policy` | ❌ 없음 | 필수 | 🔴 |
| `Strict-Transport-Security` | ❌ 없음 | `max-age=31536000; includeSubDomains; preload` | 🟠 |
| `Referrer-Policy` | ❌ 없음 | `strict-origin-when-cross-origin` | 🟡 |
| `Permissions-Policy` | ❌ 없음 | `camera=(), microphone=(), geolocation=()` | 🟡 |
| `Cross-Origin-Opener-Policy` | ❌ 없음 | `same-origin` | 🟢 |

> [!WARNING]
> `X-XSS-Protection: 1; mode=block`는 모던 브라우저에서 **deprecated**이며, 일부 경우 오히려 XSS를 유발할 수 있습니다. CSP로 대체하고 이 헤더는 `0`으로 설정하거나 제거해야 합니다.

---

## 10. 개선 로드맵

### Phase 1 — 즉시 조치 (1~2일)

| # | 항목 | 위험도 | 작업 |
|:-:|------|:------:|------|
| 1 | **XSS 방어** | 🔴 | `PriSignalIssue.jsx`에 DOMPurify 적용 |
| 2 | **Rate Limiting** | 🟠 | `express-rate-limit` 설치 및 `/api/subscribe`에 적용 |
| 3 | **Request Body 검증** | 🟡 | `express.json({ limit: '1kb' })` + 이메일 서버측 검증 |
| 4 | **Archive ID 검증** | 🟡 | UUID 정규식 검증 추가 |

### Phase 2 — 보안 강화 (1주일)

| # | 항목 | 위험도 | 작업 |
|:-:|------|:------:|------|
| 5 | **Helmet 도입** | 🟡 | `npm install helmet` + CSP, HSTS, Referrer-Policy 설정 |
| 6 | **CSP 설정** | 🟠 | 인라인 스타일 허용, 외부 폰트 허용, 나머지 차단 |
| 7 | **CORS 제한** | 🟠 | 와일드카드 → `https://www.prisincera.com`만 허용 |
| 8 | **Docker 비-root** | 🟡 | Dockerfile에 `USER` 지시어 추가 |

### Phase 3 — 장기 개선 (1개월)

| # | 항목 | 위험도 | 작업 |
|:-:|------|:------:|------|
| 9 | **Secret Manager** | 🟡 | Buttondown/Gemini API 키를 GCP Secret Manager로 이전 |
| 10 | **전용 서비스 계정** | 🟢 | Cloud Run용 최소 권한 SA 생성 |
| 11 | **npm audit 자동화** | 🟢 | CI/CD에 `npm audit --audit-level=high` 스텝 추가 |
| 12 | **개인정보처리방침** | 🟢 | 구독 폼에 수집 동의 안내 및 처리방침 링크 추가 |

---

## 부록 A — 분석 대상 파일 목록

| 파일 | 역할 | 주요 검토 항목 |
|------|------|---------------|
| `server.mjs` | Express 웹서버 | API 프록시, 입력 검증, 보안 헤더 |
| `nginx.conf` | 리버스 프록시 (레거시) | CORS, 캐시, 프록시 설정 |
| `Dockerfile` | 컨테이너 빌드 | 실행 사용자, 이미지 보안 |
| `cloudbuild.yaml` | CI/CD 파이프라인 | 빌드 보안, 시크릿 관리 |
| `src/components/prisignal/SubscribeForm.jsx` | 구독 폼 | 입력 검증, XSS |
| `src/components/prisignal/PriSignalIssue.jsx` | 뉴스레터 뷰어 | `dangerouslySetInnerHTML` |
| `src/pages/PriSignalDaily.jsx` | 데일리 시그널 페이지 | API 응답 렌더링 |
| `pipeline/src/lib/rss.mjs` | RSS 수집기 | 외부 데이터 파싱, HTML 정리 |
| `pipeline/src/lib/gemini.mjs` | AI 스코어링 | API 키 관리, 응답 파싱 |
| `pipeline/src/lib/buttondown.mjs` | 이메일 발송 | API 키 관리 |
| `pipeline/src/lib/storage.mjs` | GCS 저장소 | 파일 접근 권한 |

---

*본 보고서는 2026-04-23 기준 코드베이스를 대상으로 작성되었습니다.*  
*보안 환경은 지속적으로 변화하므로, 분기별 재검토를 권장합니다.*
