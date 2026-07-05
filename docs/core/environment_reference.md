---
status: active
domain: Core
last_updated: 2026-06-29
version: v1.0
target_files:
  - server.mjs
  - admin-api.mjs
  - pacenote-api.mjs
  - cloudbuild.yaml
  - pipeline/src/lib/gemini.mjs
  - pipeline/src/lib/mailer.mjs
  - pipeline/src/lib/storage.mjs
---

# 📘 환경변수·시크릿 레퍼런스 (Environment Reference)

> 운영자·신규 개발자가 **"이 시스템이 쓰는 모든 환경변수와 그 저장 위치"** 를 한 곳에서 파악하기 위한 단일 레퍼런스. 키 로테이션·새 환경 구성 시 본 문서를 기준으로 점검하세요.

## 📝 Revision History

| Version | Date | Author | Description | Impact Area |
| :--- | :--- | :--- | :--- | :--- |
| v1.0 | 2026-06-29 | AI Agent | 웹/파이프라인/로컬 env 전수 정리 최초 정의 (코드 `process.env` 실측 기반) | Operations |

---

## 0. 두 개의 실행 환경

| 플레인 | 런타임 | 코드 | env 주입 경로 |
| :--- | :--- | :--- | :--- |
| **웹 서비스** | Cloud Run Service `prisincera-web` | `server.mjs` + `*-api.mjs` | `cloudbuild.yaml`의 `--set-secrets` + Cloud Run 서비스 env |
| **배치 파이프라인** | Cloud Run Jobs (6종) | `pipeline/src/*` | 각 Job의 env / Secret (콘솔·`gcloud run jobs update`) |

> **로컬 개발**은 `.env`(gitignore) 또는 셸 env로 주입. Cloud Run에서는 ADC(Application Default Credentials)가 자동이라 `GOOGLE_APPLICATION_CREDENTIALS`가 불필요하지만, 로컬에서는 서비스 계정 키 경로를 지정해야 GCS/Firestore에 접근됩니다.

---

## 1. 웹 서비스 (`prisincera-web`)

| 변수 | 용도 | 저장 위치 | 비고 |
| :--- | :--- | :--- | :--- |
| `PORT` | 리슨 포트 | Cloud Run 자동 주입 | 기본 `8080` ([server.mjs:24](../../server.mjs#L24)) |
| `GCS_BUCKET` | 정적 피드 버킷명 | Cloud Run env | 기본 `prisincera-prisignal-data` |
| `GEMINI_API_KEY` | Admin AI 커밋 매칭·요약, Builder's Log | **Secret Manager** | cloudbuild `--set-secrets GEMINI_API_KEY=`**`GEMINI_ADMIN_API_KEY`**`:latest` ✅확정 |
| `GITHUB_TOKEN` | Builder's Log Git-less 원격 커밋(GitHub API) | **Secret Manager** `GITHUB_TOKEN:latest` | cloudbuild `--set-secrets` ✅확정 |
| `UNSUBSCRIBE_SECRET` | 구독 해지 HMAC 토큰 검증 | Cloud Run env/Secret | [server.mjs:614](../../server.mjs#L614) |
| `GCP_PROJECT_ID` | Firestore·Job 제어 프로젝트 | Cloud Run env | 기본 `prisincera` ([admin-api.mjs:545](../../admin-api.mjs#L545)) |
| `RUN_REGION` | Admin "지금 생성"이 Job 실행 시 리전 | Cloud Run env | 기본 `asia-northeast3` |
| `CF_ZONE_ID` | Cloudflare 캐시 퍼지 존 ID | Cloud Run env/Secret | 선택 ([admin-api.mjs:42](../../admin-api.mjs#L42)) |
| `CF_API_TOKEN` | Cloudflare API 토큰 | Cloud Run env/Secret | 선택 |
| `CDN_BASE_URL` | 캐시 퍼지 대상 베이스 URL | Cloud Run env | 선택 |
| `BUTTONDOWN_API_KEY` | (레거시) Buttondown 구독 | — | 자체 SMTP 엔진 전환으로 **사실상 미사용** |

## 2. 배치 파이프라인 (Cloud Run Jobs)

| 변수 | 용도 | 저장 위치 | 비고 |
| :--- | :--- | :--- | :--- |
| `GCS_BUCKET` | GCS 읽기/쓰기 버킷 | Job env | [storage.mjs:9](../../pipeline/src/lib/storage.mjs#L9) |
| `GCP_PROJECT_ID` | Firestore 프로젝트 | Job env | [firestore.mjs](../../pipeline/src/lib/firestore.mjs) |
| `GEMINI_API_KEY` | Gemini 생성 호출 | **Secret Manager** | 무료 티어 키 — [gemini.mjs:14](../../pipeline/src/lib/gemini.mjs#L14), 할당량은 [api_usage_analysis](api_usage_analysis.md) |
| `SMTP_HOST` | 메일 발송 서버 | Job env | Gmail SMTP ([mailer.mjs](../../pipeline/src/lib/mailer.mjs)) |
| `SMTP_PORT` | 메일 포트 | Job env | |
| `SMTP_USER` | 발신 계정 | Job env/Secret | |
| `SMTP_PASS` | 앱 비밀번호 | **Secret** | Gmail App Password |
| `SMTP_FROM_NAME` | 표시 발신자명 | Job env | |
| `SMTP_FROM_EMAIL` | 발신 주소 | Job env | 미설정 시 `SMTP_USER` 사용 |
| `UNSUBSCRIBE_SECRET` | 구독 HMAC 서명 | **Secret** | 웹과 **동일 값**이어야 토큰 검증 일치 |
| `BUTTONDOWN_API_KEY` | (레거시) | — | 미사용 |

### 2-1. 실행 단위 오버라이드 플래그 (수동 재실행용)

| 변수 | 잡 | 효과 |
| :--- | :--- | :--- |
| `TARGET_DATE` | composer · tech-composer | 특정 날짜(YYYY-MM-DD) 기준으로 재생성 ([composer.mjs:30](../../pipeline/src/composer.mjs#L30)) |
| `FORCE_SCORE` | composer | 이미 스코어링된 날도 강제 재스코어 |
| `FORCE_DISPATCH` | composer | 발송 락 무시하고 강제 재발송 ⚠️ 중복 발송 주의 |

> 사용법은 [operations_runbook](operations_runbook.md) §2 참조.

## 3. 로컬 개발

| 변수 | 용도 |
| :--- | :--- |
| `GOOGLE_APPLICATION_CREDENTIALS` | 서비스 계정 키(JSON) 경로 — 로컬에서 GCS/Firestore ADC 인증. **Cloud Run에서는 불필요**(자동 ADC) |
| `GCS_BUCKET` / `GEMINI_API_KEY` 등 | 위 표와 동일하게 로컬 `.env`로 주입 |

---

## 4. 시크릿 이름 매핑 (Secret Manager → env)

| Secret Manager 시크릿 | 주입 env | 사용처 |
| :--- | :--- | :--- |
| `GEMINI_ADMIN_API_KEY` | `GEMINI_API_KEY` | 웹(admin AI), 파이프라인(생성) |
| `GITHUB_TOKEN` | `GITHUB_TOKEN` | 웹(Builder's Log 커밋) |

> ⚠️ **로테이션 시**: 새 Secret 버전을 추가(`gcloud secrets versions add`)한 뒤, `--set-secrets`가 `:latest`를 참조하므로 **웹은 다음 배포(또는 새 리비전)부터** 반영됩니다. 즉시 반영하려면 Cloud Run 서비스/잡을 재배포하세요.

## 5. 더 읽을 것
- 운영 대응 절차: [operations_runbook](operations_runbook.md)
- 배포·인프라: [development_guide](development_guide.md)
- AI 비용·할당량: [api_usage_analysis](api_usage_analysis.md)
- 인증 흐름: [authentication_architecture](authentication_architecture.md)
