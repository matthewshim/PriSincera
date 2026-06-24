---
status: active
domain: Core
last_updated: 2026-06-24
version: v1.0
target_files:
  - server.mjs
  - pacenote-api.mjs
  - admin-api.mjs
  - builderslog-api.mjs
  - pipeline/src/composer.mjs
  - cloudbuild.yaml
---

# 🏗️ PriSincera 전체 아키텍처 (Architecture Overview)

> 흩어진 인프라·모듈을 **한 장으로 조망**하기 위한 문서. 신규 개발자는 [service_overview](service_overview.md) 다음으로 이 문서를 읽으세요.

## 📝 Revision History

| Version | Date | Author | Description | Impact Area |
| :--- | :--- | :--- | :--- | :--- |
| v1.0 | 2026-06-24 | AI Agent | 전체 스택·데이터 흐름·파이프라인 맵 최초 정의 | Architecture |

---

## 1. 스택 한눈에

```
┌─────────────────────────── 사용자(브라우저) ───────────────────────────┐
│  React + Vite SPA   /daily  /pacenote  /builderslog  /sylphio  /admin   │
└───────────────────────────────┬─────────────────────────────────────────┘
                                 │ HTTPS (Cloudflare CDN)
┌────────────────────────────────▼─────────────────────────────────────────┐
│  Cloud Run: prisincera-web  ──  server.mjs (Express)                       │
│   · 정적 dist/ 서빙(SPA)                                                    │
│   · API 라우터 마운트:                                                      │
│       /api/daily/*            (GCS/Firestore 프록시, 트랙 피드)            │
│       /api/pacenote/*         → pacenote-api.mjs (Firebase Auth 필요)      │
│       /admin/api/*            → admin-api.mjs (관리자 인증)                 │
│       /api/builderslog/*      → builderslog-api.mjs                         │
│       /api/subscribe, /api/daily/index …                                   │
└──────┬───────────────────────────────┬───────────────────────────┬────────┘
       │                               │                           │
┌──────▼──────┐               ┌────────▼────────┐          ┌────────▼────────┐
│  Firestore  │               │  GCS (버킷)      │          │  Gemini API     │
│ pacenotes / │               │ daily/*.json     │          │ (무료 티어 키,   │
│ daily_signals│              │ junior_·senior_  │          │  Secret Manager) │
│ study_content│              │ index.json,      │          │ lib/gemini.mjs   │
│ subscribers /│              │ recommendations… │          └─────────────────┘
│ config / …   │              └──────────────────┘
└──────────────┘
       ▲
       │ (새벽 배치 생성·배포)
┌──────┴───────────────────────── 파이프라인 (Cloud Run Jobs, pipeline/src) ──┐
│  collector(RSS 수집) → composer(스코어링·이메일·GCS 배포)                    │
│  study-composer(어학) · tech-composer(트랙 하이브리드) · pacenote-composer   │
│  monitor(주간)                — Cloud Scheduler 크론으로 트리거             │
└────────────────────────────────────────────────────────────────────────────┘
```

## 2. 핵심 구성요소

| 레이어 | 구현 | 비고 |
| :--- | :--- | :--- |
| **프론트엔드** | `src/` React + Vite SPA | 라우트별 lazy chunk. 마크다운은 `react-markdown`+`remark-gfm`+`rehype-highlight` |
| **웹 서버** | `server.mjs` (Express, Cloud Run `prisincera-web`) | dist 서빙 + API 라우터 마운트 + GCS 프록시 |
| **API 모듈** | `pacenote-api.mjs` · `admin-api.mjs` · `builderslog-api.mjs` · `study-api.mjs` | 라우터 단위 분리 |
| **DB** | **Firestore** | `pacenotes/{uid}/weeks/{weekId}`, `daily_signals`, `study_content`, `subscribers`, `config`, `admin_config`, `email_logs` 등 |
| **정적 콘텐츠** | **GCS** + Cloudflare CDN | `daily/${date}.json`(signal+study), `daily/junior_·senior_${date}.json`(트랙), `daily/index.json` |
| **파이프라인** | `pipeline/src/*` → Cloud Run Jobs | `lib/rss.mjs`(수집), `lib/gemini.mjs`(AI), `lib/storage.mjs`(GCS) |
| **AI** | Gemini (`callGemini`) | 무료 티어, Secret Manager `GEMINI_API_KEY`. 일일 할당량 대응(재시도 중단) — [api_usage_analysis](api_usage_analysis.md) |
| **인증** | Firebase Auth (idToken) | PaceNote/Admin 보호. [authentication_architecture](authentication_architecture.md) |
| **배포** | Cloud Build(`cloudbuild.yaml`) → Cloud Run(web) + Cloud Run Jobs | 잡 이미지 갱신은 빌드 후반 단계 |

## 3. 두 갈래 데이터 흐름

1. **콘텐츠(읽기) 흐름**: 새벽 파이프라인이 RSS 수집·AI 가공 → **GCS/Firestore**에 배포 → 클라이언트가 `server.mjs` API(`/api/daily/*`)로 받아 렌더. (트래픽 비용 ≈ 0)
2. **사용자 데이터(쓰기) 흐름**: PaceNote 궤도/회고는 클라이언트 → `pacenote-api`(인증) → **Firestore** CRUD.

## 4. 파이프라인 잡 (Cloud Run Jobs)

| 잡 | 스크립트 | 스케줄(KST) | 역할 |
| :--- | :--- | :--- | :--- |
| collector | `collector.mjs` | 06:00 | RSS 수집 |
| composer | `composer.mjs` | 07:00 | 스코어링·DM픽·이메일·GCS 배포 |
| study-composer | `study-composer.mjs` | 07:30 | 어학 콘텐츠 생성 |
| **tech-composer** | `tech-composer.mjs` | 06:45 | 수준별 트랙 하이브리드 피드 |
| pacenote-composer | `pacenote-composer.mjs` | 00:00 | 추천 궤도 풀 갱신 |
| monitor | `monitor.mjs` | 주간 | 파이프라인 모니터링 |

## 5. 디렉토리 맵 (요지)
- `src/pages/`, `src/components/` — 화면·컴포넌트
- `server.mjs`, `*-api.mjs` — 웹 서버 & API
- `pipeline/src/` — 배치 파이프라인 (`lib/`, `repositories/`, `services/`, `templates/`, `config/`)
- `docs/` — 본 문서 허브
- `cloudbuild.yaml`, `pipeline/setup-infra.sh` — CI/CD·인프라

## 6. 더 읽을 것
- 개발 환경·브랜치·배포: [development_guide](development_guide.md)
- 인증: [authentication_architecture](authentication_architecture.md)
- AI 비용/할당량: [api_usage_analysis](api_usage_analysis.md)
- 스케일업: [scaling_plan](scaling_plan.md)
- 데이터 계약(웹↔데스크톱): [data_contract_v2](../data_contract_v2.md)
