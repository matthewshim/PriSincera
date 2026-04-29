# PriSignal 이메일 발송 — Buttondown → Cloud Run 자체 발송 전환 계획

> **작성일:** 2026-04-29  
> **최종 업데이트:** 2026-04-29  
> **상태:** ✅ 테스트 발송 성공 (배포 대기 — Cloud Run 환경변수 설정 후 배포 필요)  
> **범위:** 이메일 발송 · 구독자 관리 · 아카이브 — Buttondown 완전 제거

---

## 1. 확정 사항

| 항목 | 결정 | 근거 |
|------|------|------|
| **SMTP Provider** | **Gmail SMTP (Google Workspace)** | 이미 Google Workspace 사용 중, 추가 비용 없음, 일 2,000건 |
| **구독자 DB** | **GCS JSON 파일** | Cloud Run은 무상태(stateless) → 로컬 저장 불가. 기존 GCS 버킷 재사용이 가장 간단 |
| **발송 주소** | `matthew.shim@prisincera.com` | Google Workspace 계정 |
| **아카이브** | 자체 페이지 전환 | 기존 GCS daily/ 데이터 + `/api/daily/` API 활용 |

---

## 2. 전환 배경

### Buttondown 디자인 제약

| 제약 | 영향 |
|------|------|
| Markdown → HTML 자동 변환 | 커스텀 HTML 구조 제어 불가 |
| `{{ body }}` 단일 블록 삽입 | 섹션별 다른 배경/카드 스타일 불가 |
| CSS 인라인 한계 | 일부 속성 strip / 재작성 |
| 미디어 쿼리 지원 한계 | 모바일 반응형 세밀 제어 어려움 |
| 템플릿 변수 한정 | `subject`, `body`, `unsubscribe_url`, `email_url`만 사용 가능 |

### Gmail SMTP 발송 한도

| 유형 | 일일 한도 | 비고 |
|------|----------|------|
| 무료 Gmail | 500건/일 | 대량 발송 부적합 |
| **Google Workspace (유료)** | **2,000건/일** | ✅ 현재 사용 중 |
| SMTP Relay (Workspace 전용) | 10,000건/일 | 향후 확장 시 전환 가능 |

> 현재 구독자 규모에서 Google Workspace 표준(2,000건/일)으로 충분합니다.
> 구독자 2,000명 초과 시 SMTP Relay 전환 또는 Resend 등 전용 서비스 검토가 필요합니다.

### Cloud Run 저장소 한계

Cloud Run은 무상태(stateless) 컨테이너로, 로컬 파일 시스템에 영구 데이터 저장이 불가합니다:

- 인스턴스 종료/재시작 시 모든 로컬 데이터 삭제
- 인스턴스 간 로컬 파일 시스템 공유 불가
- 로컬 쓰기는 메모리를 소비하며 과도하면 크래시

→ 외부 저장소 필수. 기존 GCS 버킷(`prisincera-prisignal-data`)을 재사용합니다.

---

## 3. 현재 아키텍처 (AS-IS)

```
                Pipeline (Cloud Run Jobs)
                ┌──────────┐    ┌──────────┐
                │Collector │───▶│ Composer │
                └──────────┘    └────┬─────┘
                                     │ sendEmail() / scheduleEmail()
                                     ▼
                          ┌─────────────────┐
                          │  Buttondown API  │
                          │  (외부 SaaS)     │
                          ├─────────────────┤
                          │ • 이메일 SMTP    │
                          │ • 구독자 DB      │
                          │ • HTML 템플릿    │
                          │ • 아카이브 웹뷰  │
                          └───────┬─────────┘
                                  │
                Web Server        │
  ┌──────────────────────┐        │
  │  server.mjs (Express)│        │
  │  /api/subscribe ─────┼────────┘ (프록시)
  │  /api/archive   ─────┼────────┘ (프록시)
  └──────────────────────┘
```

### Buttondown 의존 포인트 (4곳)

| 파일 | 역할 | Buttondown 의존 |
|------|------|---------------|
| `pipeline/src/lib/buttondown.mjs` | 이메일 생성/발송 | `POST /v1/emails` |
| `pipeline/src/composer.mjs` | DM 조립 + 발송 호출 | `sendEmail()` / `scheduleEmail()` |
| `server.mjs` (L104-147) | 구독 프록시 | `POST /v1/subscribers` |
| `server.mjs` (L149-179) | 아카이브 프록시 | `GET /v1/emails` |

---

## 4. 전환 후 아키텍처 (TO-BE)

```
                Pipeline (Cloud Run Jobs)
                ┌──────────┐    ┌──────────┐
                │Collector │───▶│ Composer │
                └──────────┘    └────┬─────┘
                                     │
                    ┌────────────────┼─────────────────┐
                    │                │                  │
                    ▼                ▼                  ▼
          ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
          │email-template│  │ subscribers  │  │   mailer     │
          │    .mjs      │  │    .mjs      │  │    .mjs      │
          │(HTML 렌더링) │  │(GCS 구독자)  │  │(Nodemailer)  │
          └──────┬───────┘  └──────┬───────┘  └──────┬───────┘
                 │                 │                  │
                 │                 ▼                  ▼
                 │        ┌──────────────┐   ┌──────────────┐
                 │        │  GCS Bucket  │   │  Gmail SMTP  │
                 │        │subscribers/  │   │smtp.gmail.com│
                 │        │active.json   │   └──────┬───────┘
                 │        └──────────────┘          │
                 └──────────────────────────────────┤
                                                    ▼
                                           구독자 메일함

                Web Server (server.mjs)
  ┌─────────────────────────────────┐
  │  POST /api/subscribe  → GCS    │
  │  GET  /api/unsubscribe → GCS   │
  │  GET  /api/daily/index → GCS   │  ← 이미 구현됨
  │  GET  /api/daily/:date → GCS   │  ← 이미 구현됨
  └─────────────────────────────────┘
```

### 전환 효과

| 항목 | Before (Buttondown) | After (자체) |
|------|---------------------|-------------|
| **HTML 제어** | `{{ body }}` 단일 블록 | 아티클별 개별 카드 HTML |
| **CSS 인라인** | Buttondown이 일부 strip | 완전 제어 (juice 변환) |
| **반응형** | 미디어 쿼리 제한 | 완전 제어 |
| **발송 비용** | Buttondown Pro ($29/월~) | 무료 (Google Workspace 포함) |
| **구독자 데이터** | Buttondown 소유 | 자체 GCS 보유 |
| **아카이브** | Buttondown 웹뷰 의존 | 자체 웹 페이지 |

---

## 5. Gmail SMTP 설정

### 사전 준비

| 단계 | 내용 |
|------|------|
| 1 | Google Workspace Admin에서 `matthew.shim@prisincera.com` 계정의 **앱 비밀번호** 생성 |
| 2 | 또는 Google Workspace Admin > Apps > Gmail > **SMTP Relay 서비스** 활성화 (선택) |
| 3 | Cloud Run 환경변수에 SMTP 인증 정보 추가 |
| 4 | `prisincera.com` DNS에 SPF/DKIM 레코드 확인 (Google Workspace 기본 설정 확인) |

### 환경변수 (Cloud Run에 추가)

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=matthew.shim@prisincera.com
SMTP_PASS=<앱 비밀번호>
SMTP_FROM_NAME=PriSignal
SMTP_FROM_EMAIL=matthew.shim@prisincera.com
UNSUBSCRIBE_SECRET=<랜덤 32바이트 hex>
```

---

## 6. 구독자 관리 (GCS JSON)

### 저장 위치

```
gs://prisincera-prisignal-data/
├── daily/              ← 기존 데일리 시그널
├── subscribers/        ← 신규: 구독자 관리
│   └── active.json
├── state/              ← 기존 상태 관리
└── candidates/         ← 기존 후보 풀
```

### 데이터 구조

```json
{
  "version": 1,
  "updatedAt": "2026-04-29T05:00:00Z",
  "subscribers": [
    {
      "email": "user@example.com",
      "status": "active",
      "subscribedAt": "2026-04-20T10:00:00Z",
      "source": "website"
    },
    {
      "email": "former@example.com",
      "status": "unsubscribed",
      "subscribedAt": "2026-04-15T09:00:00Z",
      "unsubscribedAt": "2026-04-28T12:00:00Z",
      "source": "import"
    }
  ]
}
```

### 동시성 제어

GCS JSON은 동시 쓰기 시 충돌 가능성이 있으므로 `generationMatchPrecondition`(ETag) 기반 **낙관적 잠금** 적용. 현재 트래픽 수준에서 충돌 가능성은 매우 낮으나, 빈번해지면 Firestore 전환을 고려합니다.

### 구독 해지 보안

HMAC-SHA256 토큰 기반 구독 해지 링크:

```
https://www.prisincera.com/api/unsubscribe?token=<HMAC(email, secret)>&email=<email>
```

- 시크릿: Cloud Run 환경변수 `UNSUBSCRIBE_SECRET`
- 토큰 없이 이메일만으로 해지 불가 (악의적 해지 방지)

---

## 7. 구현 상세

### Phase 1: 구독자 관리 모듈

**신규:** `pipeline/src/lib/subscribers.mjs`

```javascript
// 핵심 함수
export async function getActiveSubscribers()        // 활성 구독자 이메일 목록
export async function addSubscriber(email)          // 구독 추가 (중복 확인)
export async function removeSubscriber(email)       // 구독 해지
export async function generateUnsubToken(email)     // HMAC 해지 토큰 생성
export async function verifyUnsubToken(email, token) // 토큰 검증
```

### Phase 2: HTML 이메일 템플릿 엔진

**신규:** `pipeline/src/lib/email-template.mjs`

기존 `docs/prisignal-email-template.html`을 기반으로 프로그래매틱 HTML 생성:

```javascript
export function renderDailyEmail({ date, articles, dmPicks, totalCount, unsubscribeUrl }) {
  // 반환: 완전한 HTML 이메일 문자열 (CSS 인라인 완료)
}
```

디자인 자유도 확보:

| Buttondown 제약 | 자체 구현 |
|----------------|----------|
| `{{ body }}` 단일 블록 | 아티클별 개별 `<table>` 카드 |
| Markdown → HTML 자동 변환 | 직접 HTML 구조 설계 |
| CSS strip | `juice`로 완전 인라인 |
| 고정 변수 4개 | 무제한 동적 변수 |

### Phase 3: SMTP 발송 모듈

**교체:** `pipeline/src/lib/buttondown.mjs` → `pipeline/src/lib/mailer.mjs`

```javascript
import nodemailer from 'nodemailer';

// 기존 인터페이스 유지 (composer.mjs 변경 최소화)
export async function sendEmail(to, subject, htmlBody)
export async function sendToSubscribers(subject, htmlBody, subscribers)
```

발송 플로우:

```
Composer
  ├── getActiveSubscribers() → ["user1@...", "user2@...", ...]
  ├── renderDailyEmail(data) → HTML 문자열
  └── sendToSubscribers(subject, html, subscribers)
        └── loop: sendEmail(to, subject, html)
              └── Gmail SMTP 전송 (초당 1건 쓰로틀링)
```

### Phase 4: server.mjs 엔드포인트 수정

| 엔드포인트 | Before | After |
|-----------|--------|-------|
| `POST /api/subscribe` | Buttondown API 프록시 | GCS `subscribers/active.json` 직접 수정 |
| `GET /api/unsubscribe` | 없음 (Buttondown 제공) | HMAC 토큰 검증 → GCS 상태 변경 |
| `GET /api/archive` | Buttondown `/v1/emails` 프록시 | **제거** — `/api/daily/index` 사용 (이미 구현) |
| `GET /api/archive/:id` | Buttondown `/v1/emails/:id` 프록시 | **제거** — `/api/daily/:date` 사용 (이미 구현) |

### Phase 5: Composer 연결 변경

`pipeline/src/composer.mjs` 수정:

```diff
- import { sendEmail, scheduleEmail } from './lib/buttondown.mjs';
+ import { sendToSubscribers } from './lib/mailer.mjs';
+ import { renderDailyEmail } from './lib/email-template.mjs';
+ import { getActiveSubscribers, generateUnsubToken } from './lib/subscribers.mjs';

  // DM 발송 부분
- const body = assembleDailyDM({ date, articles, dailyPageUrl, totalCount });
- emailResult = await sendEmail(subject, body);
+ const subscribers = await getActiveSubscribers();
+ const html = renderDailyEmail({ date, articles: dmWithComments, totalCount, dailyPageUrl });
+ emailResult = await sendToSubscribers(subject, html, subscribers);
```

### Phase 6: 구독자 데이터 마이그레이션

```
1. Buttondown 대시보드에서 구독자 CSV 내보내기
2. 마이그레이션 스크립트로 GCS subscribers/active.json 생성
3. 양쪽 병행 테스트 (1-2일)
4. Buttondown 완전 종료
```

**1회성 스크립트:** `pipeline/src/migrate-subscribers.mjs`

---

## 8. 신규/변경 파일 목록

| 파일 | 상태 | 설명 |
|------|------|------|
| `pipeline/src/lib/mailer.mjs` | 🆕 신규 | Gmail SMTP 발송 (Nodemailer) |
| `pipeline/src/lib/email-template.mjs` | 🆕 신규 | HTML 이메일 템플릿 엔진 |
| `pipeline/src/lib/subscribers.mjs` | 🆕 신규 | GCS 기반 구독자 관리 |
| `pipeline/src/migrate-subscribers.mjs` | 🆕 신규 | Buttondown → GCS 마이그레이션 (1회성) |
| `pipeline/src/lib/buttondown.mjs` | 🗑️ 삭제 | Buttondown API 클라이언트 제거 |
| `pipeline/src/composer.mjs` | ✏️ 수정 | import 변경 + 발송 로직 교체 |
| `pipeline/package.json` | ✏️ 수정 | nodemailer, juice 추가 |
| `server.mjs` | ✏️ 수정 | 구독/해지 엔드포인트 변경, Buttondown 프록시 제거 |

---

## 9. 종속성 변경

### pipeline/package.json

```diff
  "dependencies": {
    "@google-cloud/storage": "^7.15.0",
    "@google/generative-ai": "^0.24.0",
-   "rss-parser": "^3.13.0"
+   "rss-parser": "^3.13.0",
+   "nodemailer": "^6.9.0",
+   "juice": "^11.0.0"
  }
```

### package.json (web server) — 변경 없음

`@google-cloud/storage`가 이미 포함되어 있으므로 web server 측 추가 종속성 없음.

---

## 10. Cloud Run 환경변수 추가

### Pipeline Jobs (Composer)

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=matthew.shim@prisincera.com
SMTP_PASS=<Google Workspace 앱 비밀번호>
UNSUBSCRIBE_SECRET=<랜덤 32바이트 hex>
```

### Web Service (server.mjs)

```
UNSUBSCRIBE_SECRET=<동일 시크릿>
# BUTTONDOWN_API_KEY → 전환 완료 후 제거
```

---

## 11. 리스크 및 대응

| 리스크 | 영향 | 대응 |
|--------|------|------|
| Gmail 스팸 필터링 | 구독자에게 미전달 | SPF/DKIM 설정 확인, 소량부터 시작 |
| GCS 동시 쓰기 충돌 | 구독 데이터 유실 | ETag 기반 낙관적 잠금 |
| Gmail 일일 한도 초과 | 발송 실패 | 현재 규모에서 가능성 낮음 (2,000건/일) |
| 이메일 클라이언트 호환성 | HTML 깨짐 | juice CSS 인라인 + 주요 클라이언트 테스트 |

> **SPF/DKIM 설정이 핵심입니다.**
> `matthew.shim@prisincera.com`으로 발송하려면 `prisincera.com` 도메인의 DNS에
> Google Workspace SPF 레코드가 포함되어 있어야 합니다.
> (Google Workspace 사용 중이라면 보통 자동 설정됨 — Admin Console에서 확인 필요)

---

## 12. 예상 작업량

| Phase | 작업 | 예상 시간 |
|-------|------|----------|
| 1 | 구독자 관리 모듈 (GCS JSON) | 1시간 |
| 2 | HTML 이메일 템플릿 엔진 | 2-3시간 |
| 3 | SMTP 발송 모듈 (Nodemailer) | 30분 |
| 4 | server.mjs 엔드포인트 수정 | 1시간 |
| 5 | Composer 연결 변경 | 30분 |
| 6 | 데이터 마이그레이션 스크립트 | 30분 |
| 7 | 테스트 + 검증 | 1시간 |
| **합계** | | **6-7시간** |

---

## 13. 실행 순서

```
Phase 1-3 (기반 모듈)  ──▶  Phase 4-5 (연결)  ──▶  Phase 6 (전환)  ──▶  Phase 7 (배포)
─────────────────────       ────────────────       ────────────────       ────────────────
✅ subscribers.mjs           ✅ server.mjs 수정      ✅ CSV 마이그레이션    ⭐ Cloud Run 환경변수
✅ email-template.mjs        ✅ composer.mjs 수정    ✅ 테스트 발송 성공    ⭐ git push + 대포
✅ mailer.mjs                ✅ buttondown.mjs 삭제  ⏸ Buttondown 종료   ⭐ Buttondown 비활성화
```

---

## 14. 테스트 발송 결과 (2026-04-29)

### 단위 테스트

| 모듈 | 테스트 | 결과 |
|------|--------|------|
| `subscribers.mjs` | 23건 | ✅ 전체 통과 |
| `email-template.mjs` | 41건 | ✅ 전체 통과 |
| `mailer.mjs` | 8건 | ✅ 전체 통과 |
| 통합 테스트 | 16건 | ✅ 전체 통과 |
| **합계** | **88건** | **88/88 통과** |

### 실 발송 테스트

| 항목 | 내용 |
|------|------|
| **수신** | shimks@gravity.co.kr |
| **발신** | matthew.shim@prisincera.com |
| **제목** | 📡 [TEST] PriSignal Daily — 4/29(수) |
| **HTML 크기** | 31.3KB |
| **아티클** | 16건 (DM Pick 5건 + More Signals 11건) |
| **결과** | ✅ 발송 성공 (messageId: `c78a9a7e-e627-bb60-d1ee-2bc6cd0613d3@prisincera.com`) |

---

## 15. 다음 단계 (배포)

1. **Cloud Run 환경변수 추가**:
   - `SMTP_HOST=smtp.gmail.com`
   - `SMTP_PORT=465`
   - `SMTP_USER=matthew.shim@prisincera.com`
   - `SMTP_PASS=<Gmail 앱 비밀번호>`
   - `SMTP_FROM_NAME=PriSignal`
   - `SMTP_FROM_EMAIL=matthew.shim@prisincera.com`
   - `UNSUBSCRIBE_SECRET=<openssl rand -hex 32 결과>`

2. **git push → Cloud Build 자동 배포**

3. **Buttondown 구독자 CSV 내보내기 → `migrate-subscribers.mjs` 실행**

4. **운영 확인 후 Buttondown 계정 비활성화**

---

*최종 업데이트: 2026-04-29*
