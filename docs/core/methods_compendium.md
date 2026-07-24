---
status: active
domain: Core
last_updated: 2026-07-23
version: v1.0
target_files:
  - server.mjs
  - admin-api.mjs
  - pacenote-api.mjs
  - study-api.mjs
---

# 📘 메서드 전서 (Methods Compendium)

> **PriSincera가 "무엇을 어떻게 하는가"를 세 층위로 일목요연하게 집약한 단일 레퍼런스.** ① 제품·운영 방법론(왜/어떻게 굴리는가) · ② 엔지니어링 기법(기술적으로 어떻게 뚫었나) · ③ API 메서드(HTTP 엔드포인트). 각 항목은 정본 문서로 연결되며, 본 문서는 **집약 뷰**일 뿐 규범의 원본은 링크된 문서·소스다.

## 📝 Revision History

| Version | Date | Author | Description | Impact Area |
| :--- | :--- | :--- | :--- | :--- |
| v1.0 | 2026-07-23 | AI Agent | 3층위(제품·운영 방법론 / 엔지니어링 기법 / API 엔드포인트) 최초 집약 정리 | Core |

---

## 층위 ① 제품·운영 방법론 — "무엇을, 왜, 어떻게 굴리는가"

### 1-A. 핵심 메서드: 배움–실행–복기 성장 플라이휠
> 출처: [service_overview.md](service_overview.md) §3

```
[배움 Input]          [실행 Action]          [복기 Feedback]
배움 4채널 ──Click-to-Orbit──▶ 실행 궤도 ──주말 회고──▶ 성찰·AI 코칭
    ▲                                                      │
    └──────────  다음 주 개인화 피드(키워드 가중치)  ◀────────┘
```

| 단계 | 메서드 | 실체 |
| :--- | :--- | :--- |
| **배움(Learn)** | 4채널 지식 소비 | IT Tech Signal(실제 RSS+AI 스코어링) · AI Prompt/어학(AI 생성) · 테크 트랙(RSS 근거 하이브리드: 학습→실전→원문) |
| **실행(Run)** | Click-to-Orbit | 테크 트랙 실전 항목을 클릭 1회로 주간 궤도(Orbit) 체크리스트에 등록 |
| **복기(Reflect)** | 궤도 + 회고 | 주차별 궤도 완료 + 한 줄 회고(항해 일지) → 완료/회고 신호 환류 |
| **개인화** | 동적 퇴출 알고리즘 | 완료·회고 신호가 추천 엔진·다이제스트 렌즈로 되돌아가 다음 주 피드 재가중 (신규 AI 비용 0) |

### 1-B. 운영 철학 메서드 — "가변비 ≈ 0인 1인 운영"
> 출처: [service_overview.md](service_overview.md) §1·§4 · [business_model.md](business_model.md)

- **중앙 서버/DB 의존 최소화 + 무료 티어 최대 활용**: Firestore·GCS·Cloudflare 무료 티어 + Gemini 무료 키 → 유저가 늘어도 개발사 가변비가 0에 수렴.
- **정적 우선(Static-first)**: Builder's Log는 서버리스 정적 CMS로 운영.

### 1-C. 제품 포트폴리오 (3제품 체제, 2026-07 승계 완료)
| 제품 | 경로 | 핵심 가치 | 성격 |
| :--- | :--- | :--- | :--- |
| **ReLearn** | `/relearn` | 배움→실행→복기 통합 성장 루프 | 플래그십(Loop) |
| **Builder's Log** | `/builderslog` | 제작 과정 투명 공개 정적 CMS | 브랜딩 |
| **Sylphio** | `/sylphio` | 온디바이스 AI 동시통역 비서 | 확장 제품 |

> 구 Daily Digest(`/daily`)·PaceNote(`/pacenote`) 독립 웹 UI는 2026-07-20 ReLearn으로 승계·비공개(구 경로 301)되었고, 백엔드 API·콘텐츠 파이프라인·데이터는 존치·가동 중이다.

---

## 층위 ② 엔지니어링 기법 — "기술적으로 어떻게 뚫었나"
> 출처: `builders-log/` · `core/` · `archive/`

| 메서드 | 문제 → 해법 | 정본 문서 |
| :--- | :--- | :--- |
| **Git-less 원격 커밋** | 서버리스는 Read-Only FS → GitHub API 직접 연동으로 파일시스템 없이 원격 커밋 + 3중 시크릿 스캐너 | [admin_integration.md](../builders-log/admin_integration.md) |
| **동적 사이트맵 동기화** | 정적 sitemap 충돌 → 100% 실시간 동적 sitemap + 로봇 전용 개별 메타 SSR 인젝션 | [seo_optimization.md](../builders-log/seo_optimization.md) |
| **SSR/CSR 메타 SSOT** | 타이틀/메타 이중 소스 불일치 → `src/data/seoMeta.mjs` 단일 정본을 SSR·CSR 양쪽이 공유 | [seo_meta_standard.md](seo_meta_standard.md) |
| **천체 시뮬레이션 엔진** | 네온 SF 스타필드 → 천체물리 사실주의 WebGL 히어로 엔진 | [celestial_simulation_strategy.md](../builders-log/celestial_simulation_strategy.md) |
| **이메일 자가 엔진 전환** | 외부 SaaS(Buttondown) 탈피 → Gmail SMTP 자체 엔진 + Firestore 선행 락으로 중복 발송 차단 | [email_migration_history.md](../archive/email_migration_history.md) |
| **인증·인가 아키텍처** | Google OAuth 단일 인증 + Firebase ID 토큰 Bearer 검증 + Firestore 화이트리스트/역할(super_admin·admin) + adminApp 세션 격리 | [authentication_architecture.md](authentication_architecture.md) |
| **디자인 집행 게이트** | 8pt 그리드·OLED 흑백 토큰·타이포 전량 토큰화를 prebuild `design-check`로 자동 강제 | [design_system.md](design_system.md) |
| **성장 루프 백엔드** | 5-Phase로 완료/회고 신호를 추천·다이제스트로 환류(신규 AI 비용 0) | [growth_loop_plan.md](../pacenote/growth_loop_plan.md) |

---

## 층위 ③ API 메서드 레퍼런스 — HTTP 엔드포인트 일람
> 실제 라우트에서 추출. 상세 아키텍처는 [architecture_overview.md](architecture_overview.md) 참조.

### 공개 API — [server.mjs](../../server.mjs) (루트 `/`)
| Method | 경로 | 용도 |
| :--- | :--- | :--- |
| GET | `/api/daily/index`, `/api/daily/:date`, `/api/daily/:date/track/:track` | 다이제스트 조회 |
| GET | `/api/archive`, `/api/archive/:id` | 아카이브 |
| GET/POST | `/api/subscribe`, `/api/subscribe/check`, `/api/unsubscribe` | 구독 관리 |
| POST | `/api/builderslog/:slug/view` | 조회수 집계 |
| GET | `/sitemap.xml` | 동적 사이트맵 |

### Admin API — [admin-api.mjs](../../admin-api.mjs) (`/admin/api`, 인증 필수)
| 그룹 | 대표 엔드포인트 |
| :--- | :--- |
| 인증/권한 | `GET /auth/verify` · `GET·POST·PUT·DELETE /admins[/:uid]` · `GET /profile` |
| Builder's Log | `GET /builderslog/meta·/content/:slug·/recent-commits·/stats` · `POST /builderslog/analyze·/publish·/translate` |
| Daily/Tracks | `GET·POST·PUT /daily/content` · `GET·POST /daily/tracks[/:date]·/run·/status·/job-status` |
| PaceNote | `GET /pacenotes/pool·/users·/insights` · `PUT /pacenotes/pool` |
| 운영 | `GET /stats·/subscribers·/pipeline/status·/pristudy/stats·/email/logs·/docs/history` · `POST /docs/save·/email/send-test·/subscribers/export` |

### PaceNote API — [pacenote-api.mjs](../../pacenote-api.mjs) (`/api/pacenote`)
`GET /` · `GET /orbit-ids` · `GET /profile` · `POST /add·/add-orbit·/accept·/toggle·/diary·/exclude·/restore`

### Study API — [study-api.mjs](../../study-api.mjs) (`/api/study`·`/api/pristudy`)
`GET /daily/:date` · `GET /progress` · `POST /progress/:date`

---

## 유지보수 수칙

본 문서는 **집약 뷰**이므로 원본 규범이 바뀌면 후행 갱신한다:
- **①·②층** 변경 시 → 링크된 정본 문서를 먼저 고치고, 요약 표현만 여기에 반영.
- **③층** 변경 시 → `target_files`의 API 소스가 SSOT다. 라우트 추가/삭제 시 해당 표를 현행화.
