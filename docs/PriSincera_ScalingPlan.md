# PriSincera — 서비스 확장 인프라 분석 보고서

> **작성일:** 2026-04-29  
> **요청 배경:** Admin 기능 + PriStudy 론칭 + Cloud Run 한계 검토  
> **상태:** ✅ Phase 0-1 구현 완료 (Phase 2 미착수)

---

## 1. 현재 아키텍처 진단

### 1-1. 현행 구성

```
┌─ Cloud Run: prisincera-web ─────────────────────┐
│  Express.js (server.mjs)                         │
│  ├── 정적 파일 서빙 (React SPA /dist)            │
│  ├── /api/subscribe   → GCS JSON R/W             │
│  ├── /api/unsubscribe → GCS JSON R/W             │
│  ├── /api/daily/*     → GCS JSON Read             │
│  └── SPA fallback                                │
│                                                   │
│  Memory: 256Mi | CPU: 1 | Max: 3 인스턴스         │
│  Min: 0 (cold start 있음) | Concurrency: 80      │
├───────────────────────────────────────────────────┤
│  데이터: GCS JSON (구독자, 데일리 시그널)          │
│  인증: 없음 (공개 웹사이트)                       │
│  DB: 없음                                         │
└───────────────────────────────────────────────────┘

┌─ Cloud Run Jobs (3개) ──────────────────────────┐
│  collector  → RSS 수집 (06:00 KST)               │
│  composer   → AI 스코어링 + 이메일 발송 (07:00)   │
│  monitor    → 발송 모니터 (08:30)                 │
└──────────────────────────────────────────────────┘
```

### 1-2. 핵심 한계 식별

| # | 한계 | 심각도 | 영향 범위 |
|:-:|------|:------:|----------|
| 1 | **DB 없음 (GCS JSON 단일 파일)** | 🔴 | 구독자 동시 쓰기 병목, Admin 쿼리 불가, PriStudy 학습 기록 저장 불가 |
| 2 | **인증/인가 체계 없음** | 🔴 | Admin 페이지 보호 불가, 사용자별 학습 진도 관리 불가 |
| 3 | **단일 모놀리식 서버** | 🟠 | 공개 사이트 + Admin + PriStudy가 한 컨테이너에 동거 → 장애 전파 |
| 4 | **Cold Start (min-instances=0)** | 🟡 | 첫 요청 2-5초 지연, Admin 접속 시 체감 지연 |
| 5 | **메모리 256Mi** | 🟡 | PriStudy 콘텐츠 증가 시 OOM 위험 |
| 6 | **세션/상태 없음** | 🟠 | 로그인 세션 유지 불가 (Cloud Run은 무상태) |

---

## 2. 신규 기능 요구사항 분석

### 2-1. Admin 기능 (PriSignal 관리)

| 기능 | 데이터 요구 | 인증 요구 |
|------|-----------|----------|
| 구독자 목록/검색/내보내기 | DB 쿼리 (필터, 정렬, 페이지네이션) | 🔴 필수 |
| 구독자 통계 (일별 가입/해지 추이) | 시계열 집계 | 🔴 필수 |
| 이메일 발송 이력/오픈율 | 발송 로그 저장 | 🔴 필수 |
| 수동 발송/재발송 | API 트리거 | 🔴 필수 |
| 데일리 시그널 미리보기/편집 | JSON CRUD | 🔴 필수 |
| 파이프라인 상태 대시보드 | Job 로그 조회 | 🔴 필수 |

### 2-2. PriStudy 서비스

| 기능 | 데이터 요구 | 인증 요구 |
|------|-----------|----------|
| 학습 콘텐츠 관리 (CRUD) | DB 또는 CMS | 관리자: 🔴 |
| 사용자별 학습 진도 추적 | 사용자 DB + 진도 레코드 | 사용자: 🟡~🔴 |
| 데일리 학습 추천 | AI 기반 추천 로직 | 사용자: 🟡 |
| 학습 완료/퀴즈 결과 기록 | 사용자 활동 로그 | 사용자: 🟡~🔴 |
| 커뮤니티/토론 (향후) | 실시간 데이터 | 사용자: 🔴 |

---

## 3. 기술 선택지 비교

### 3-1. 데이터베이스 선택

| 옵션 | 장점 | 단점 | 비용 | 추천 |
|------|------|------|------|:----:|
| **Firestore** | GCP 네이티브, 서버리스, 자동 스케일, Cloud Run 자연 연동 | NoSQL 제약 (복잡한 JOIN 불가) | 무료 티어: 50K 읽기/20K 쓰기/일 | ⭐ |
| Cloud SQL (PostgreSQL) | 완전한 RDBMS, 복잡한 쿼리 | 상시 과금 ($7+/월), VPC 커넥터 필요 | ~$7-15/월 | 🔵 |
| MongoDB Atlas | 유연한 스키마, 풍부한 쿼리 | 외부 서비스 의존, 레이턴시 | 무료 512MB | 🟢 |
| **GCS JSON 유지** (현행) | 추가 비용 없음 | 쿼리 불가, 동시성 한계, 확장성 0 | $0 | ❌ |

> [!IMPORTANT]
> **추천: Firestore**
> - GCP 네이티브 → Cloud Run에서 SDK로 직접 연결 (VPC 커넥터 불필요)
> - 무료 티어가 현재 규모에 충분 (일 50,000 읽기)
> - 실시간 리스너 → Admin 대시보드 실시간 반영 가능
> - 사용자별 학습 기록, 구독자 관리, 발송 이력 모두 커버
> - 기존 GCS JSON을 1회 마이그레이션하면 됨

### 3-2. 인증/인가

| 옵션 | 장점 | 단점 | 비용 |
|------|------|------|------|
| **Firebase Auth** | GCP 통합, 소셜 로그인, 이메일/패스워드, Admin SDK | Firestore와 묶임 | 무료 (50K MAU) |
| Auth0 | 풍부한 기능, 커스텀 | 외부 의존, 유료 전환 빠름 | 무료 7.5K MAU |
| 자체 JWT | 완전 제어 | 보안 리스크, 구현 부담 | $0 |

> **추천: Firebase Auth** — Firestore + Admin SDK와 자연 통합

### 3-3. 아키텍처 패턴

| 패턴 | 설명 | 장점 | 단점 |
|------|------|------|------|
| **A. 모놀리스 유지 + 미들웨어 분기** | 단일 Express에 `/admin/*`, `/api/study/*` 추가 | 구현 간단, 배포 1회 | 비대화, 장애 전파 |
| **B. 서비스 분리 (Cloud Run ×2~3)** | 공개: `web`, 관리: `admin`, 학습: `study` | 독립 배포, 장애 격리 | 운영 복잡도 증가 |
| **C. API 분리 (BFF 패턴)** | 프론트: 1개, API: 기능별 분리 | 확장성 우수 | 초기 과도한 설계 |

> **추천: A → B 점진 전환**
> 1단계: 모놀리스에 Admin/PriStudy 라우트 추가 (빠른 구현)
> 2단계: 트래픽/복잡도 증가 시 서비스 분리

---

## 4. 추천 목표 아키텍처

```
┌─ Cloud Run: prisincera-web ──────────────────────────────────┐
│  Express.js                                                   │
│  ├── 공개 API (/api/daily, /api/subscribe, SPA)              │
│  ├── Admin API (/admin/api/*) ← Firebase Auth 검증           │
│  ├── PriStudy API (/api/study/*) ← 선택적 Auth              │
│  └── SPA fallback (React Router)                             │
│                                                               │
│  Firestore ← 구독자, 발송이력, 학습콘텐츠, 진도, Admin 설정  │
│  Firebase Auth ← Admin 로그인, (향후) 사용자 로그인          │
│                                                               │
│  Memory: 512Mi | Min: 1 | Max: 5                              │
├───────────────────────────────────────────────────────────────┤
│  React SPA                                                    │
│  ├── / (Home)                                                 │
│  ├── /prisignal/* (데일리 포털)                               │
│  ├── /pristudy/* (학습 서비스) ← NEW                         │
│  └── /admin/* (관리자 대시보드) ← NEW (Auth Guard)           │
└───────────────────────────────────────────────────────────────┘

┌─ Cloud Run Jobs ──────┐   ┌─ Firestore ────────────┐
│  collector (06:00)    │   │  subscribers (컬렉션)   │
│  composer  (07:00)    │   │  emails (발송이력)      │
│  monitor   (08:30)    │   │  study_content (콘텐츠) │
│                       │   │  study_progress (진도)  │
└───────────────────────┘   │  daily_signals (시그널) │
                            │  admin_config (설정)    │
                            └────────────────────────┘
```

---

## 5. 선행 작업 우선순위

### Phase 0 — 인프라 기반 (Admin/PriStudy 이전에 반드시 선행)

| # | 작업 | 이유 | 예상 시간 |
|:-:|------|------|:---------:|
| 0-1 | **Firestore 프로젝트 활성화** | Admin/PriStudy 모든 기능의 데이터 레이어 | 30분 |
| 0-2 | **Firebase Auth 설정** (Admin 계정) | Admin 페이지 접근 제어 필수 | 1시간 |
| 0-3 | **GCS 구독자 → Firestore 마이그레이션** 스크립트 | 기존 `subscribers/active.json` → `subscribers` 컬렉션 | 2시간 |
| 0-4 | **Cloud Run 스펙 업그레이드** | `256Mi→512Mi`, `min-instances: 0→1` | 30분 |
| 0-5 | **Firestore Security Rules** 설정 | Admin만 쓰기, 공개 읽기 제한 | 1시간 |
| | | **소계** | **~5시간** |

### Phase 1 — Admin 기능

| # | 작업 | 예상 시간 |
|:-:|------|:---------:|
| 1-1 | Admin 로그인 페이지 (`/admin/login`) | 2시간 |
| 1-2 | Admin 대시보드 (구독자 통계, 파이프라인 상태) | 4시간 |
| 1-3 | 구독자 관리 (목록/검색/내보내기/수동 해지) | 3시간 |
| 1-4 | 이메일 발송 이력 + 수동 발송 트리거 | 3시간 |
| 1-5 | 데일리 시그널 미리보기/편집 | 2시간 |
| | **소계** | **~14시간** |

### Phase 2 — PriStudy 서비스

| # | 작업 | 예상 시간 |
|:-:|------|:---------:|
| 2-1 | PriStudy 콘텐츠 모델 설계 (Firestore 스키마) | 2시간 |
| 2-2 | PriStudy 랜딩 페이지 (`/pristudy`) | 4시간 |
| 2-3 | 학습 콘텐츠 CRUD API + Admin 관리 UI | 4시간 |
| 2-4 | 데일리 학습 뷰 (`/pristudy/:date`) | 4시간 |
| 2-5 | (선택) 사용자 로그인 + 학습 진도 추적 | 6시간 |
| | **소계** | **~14-20시간** |

---

## 6. Cloud Run 설정 변경 사항

### 현재 vs 권장

| 설정 | 현재 | 권장 | 이유 |
|------|:----:|:----:|------|
| `memory` | 256Mi | **512Mi** | Firestore SDK + Admin 로직 추가 |
| `min-instances` | 0 | **1** | Cold start 제거 (Admin 즉시 응답) |
| `max-instances` | 3 | **5** | PriStudy 트래픽 대비 |
| `cpu` | 1 | 1 | 유지 |
| `concurrency` | 80 | 80 | 유지 |

### 추가 비용 영향

| 항목 | 현재 | 변경 후 | 월 추가 비용 |
|------|------|---------|:----------:|
| Cloud Run (min=1, 512Mi) | $0 (min=0) | 상시 1인스턴스 유지 | **~$3-5** |
| Firestore | 없음 | 무료 티어 내 | **$0** |
| Firebase Auth | 없음 | 무료 티어 내 | **$0** |
| **합계** | | | **~$3-5/월** |

> [!TIP]
> `min-instances=1`은 월 ~$3-5 추가 비용이지만, Admin/PriStudy의 cold start를 완전히 제거합니다. 비용 대비 UX 개선이 매우 큽니다.

---

## 7. Firestore 스키마 설계 (초안)

```
firestore/
├── subscribers/           ← GCS JSON에서 마이그레이션
│   └── {email_hash}
│       ├── email: string
│       ├── status: "active" | "unsubscribed"
│       ├── subscribedAt: timestamp
│       ├── source: "website" | "import"
│       └── unsubscribedAt?: timestamp
│
├── email_logs/            ← 발송 이력 (Admin 조회용)
│   └── {auto_id}
│       ├── date: string (YYYY-MM-DD)
│       ├── subject: string
│       ├── sentAt: timestamp
│       ├── totalRecipients: number
│       ├── successCount: number
│       └── failedEmails: string[]
│
├── study_content/         ← PriStudy 학습 콘텐츠
│   └── {content_id}
│       ├── title: string
│       ├── category: string
│       ├── body: string (markdown)
│       ├── difficulty: "beginner" | "intermediate" | "advanced"
│       ├── publishedAt: timestamp
│       └── tags: string[]
│
├── study_progress/        ← 사용자 학습 진도 (Phase 2-5)
│   └── {user_id}/completions/{content_id}
│       ├── completedAt: timestamp
│       └── score?: number
│
└── admin_config/          ← 시스템 설정
    └── settings
        ├── smtpConfigured: boolean
        ├── lastPipelineRun: timestamp
        └── maintenanceMode: boolean
```

---

## 8. 리스크 및 대응

| 리스크 | 확률 | 영향 | 대응 |
|--------|:----:|:----:|------|
| Firestore 무료 티어 초과 | 낮음 | 🟡 | 일 50K 읽기면 충분. 초과 시 $0.06/10만건으로 저렴 |
| Admin 페이지 보안 사고 | 중간 | 🔴 | Firebase Auth + IP 제한 + CSP 강화 |
| 모놀리스 비대화 | 중간 | 🟡 | 코드 모듈화(라우터 분리) → 필요시 서비스 분리 |
| PriStudy 트래픽 급증 | 낮음 | 🟡 | Cloud Run auto-scale (max=5) |
| GCS→Firestore 마이그레이션 데이터 유실 | 낮음 | 🟠 | 마이그레이션 전 GCS JSON 백업, dry-run 검증 |

---

## 9. 실행 로드맵 요약

```
Phase 0 (선행)          Phase 1 (Admin)         Phase 2 (PriStudy)
~5시간                   ~14시간                  ~14-20시간
─────────────────       ─────────────────       ─────────────────
⬜ Firestore 활성화     ⬜ Admin 로그인         ⬜ 콘텐츠 모델
⬜ Firebase Auth        ⬜ 대시보드             ⬜ 랜딩 페이지
⬜ 구독자 마이그레이션  ⬜ 구독자 관리          ⬜ CRUD API
⬜ Cloud Run 스펙 업    ⬜ 발송 이력            ⬜ 데일리 학습 뷰
⬜ Security Rules       ⬜ 시그널 편집          ⬜ (사용자 로그인)
```

---

## 10. 결론

1. **GCS JSON → Firestore 전환이 모든 것의 전제조건**입니다. 현재 단일 JSON 파일 기반으로는 Admin 쿼리도, 사용자별 학습 기록도 불가능합니다.

2. **Firebase Auth는 Admin 최소 요건**입니다. 관리자 인증 없이 Admin 페이지를 만드는 것은 보안상 불가합니다.

3. **Cloud Run 자체는 확장에 문제없습니다.** 한계는 Cloud Run이 아니라 "데이터 레이어 부재"와 "인증 체계 부재"에 있습니다. `min-instances=1` + `512Mi`로 업그레이드하면 충분합니다.

4. **월 추가 비용은 $3-5 수준**으로, Firestore/Firebase Auth 모두 무료 티어 내에서 운영 가능합니다.

5. **모놀리스 유지 전략이 현 단계에서 합리적**입니다. 서비스 분리는 트래픽이 증가한 후에 검토해도 늦지 않습니다.

---

*최종 업데이트: 2026-04-29*
