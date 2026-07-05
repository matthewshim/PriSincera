---
status: active
domain: Core
last_updated: 2026-06-29
version: v1.0
target_files:
  - cloudbuild.yaml
  - pipeline/src/collector.mjs
  - pipeline/src/composer.mjs
  - pipeline/src/tech-composer.mjs
  - pipeline/src/monitor.mjs
  - admin-api.mjs
---

# 📘 운영 런북 (Operations Runbook)

> **데이터 플레인(배치 파이프라인·GCS·Firestore·Gemini) 장애 시 무엇을 보고 어떻게 복구하는가.** 웹 서비스(사이트 다운·DNS·SSL·롤백) 대응은 [development_guide](development_guide.md) §13을, 환경변수·시크릿은 [environment_reference](environment_reference.md)를 참조하세요.

## 📝 Revision History

| Version | Date | Author | Description | Impact Area |
| :--- | :--- | :--- | :--- | :--- |
| v1.0 | 2026-06-29 | AI Agent | 파이프라인 잡 운영·시나리오별 복구 절차 최초 정의 | Operations |

---

## 0. 시스템 경계 한눈에

```
[새벽 배치] Cloud Run Jobs ──생성──► GCS(daily/*.json) + Firestore ──읽기──► [웹] server.mjs API ──► 사용자
                                          ▲
                                    Gemini(무료 티어)
```
- **읽기 장애**(사용자에게 콘텐츠가 안 보임)의 90%는 **전날 밤 배치 잡 실패**가 원인 → 잡 로그부터 확인.
- 웹 컨테이너는 멀쩡한데 콘텐츠만 비면 → 데이터 플레인 문제(이 문서). 사이트 자체가 안 뜨면 → 웹 문제([development_guide](development_guide.md) §13).

## 1. 파이프라인 잡 목록

| Job (Cloud Run) | 스크립트 | 타임아웃 | 재시도 | 역할 |
| :--- | :--- | :--- | :--- | :--- |
| `prisignal-collector` | `src/collector.mjs` | 300s | 2 | RSS 수집 |
| `prisignal-composer` | `src/composer.mjs` | 1800s | 0 | 스코어링·DM픽·이메일·GCS 배포 |
| `pristudy-composer` | `src/study-composer.mjs` | 1800s | 0 | 어학(Language Dojo) 생성 |
| `tech-composer` | `src/tech-composer.mjs` | 1800s | 0 | 수준별 테크 트랙 하이브리드 피드 |
| `pacenote-composer` | `src/pacenote-composer.mjs` | 1800s | 0 | PaceNote 추천 궤도 풀 갱신 |
| `prisignal-monitor` | `src/monitor.mjs` | 120s | 1 | 주간 발송/파이프라인 모니터링 |

> 타임아웃·재시도는 `cloudbuild.yaml` 실측값. **스케줄(KST)은 Cloud Scheduler에서 관리**(리포지토리에 없음) — 기준값은 [architecture_overview](architecture_overview.md) §4, 정확한 cron은 [Cloud Scheduler 콘솔](https://console.cloud.google.com/cloudscheduler?project=prisincera)에서 확인.

## 2. 잡 수동 운영 (gcloud)

```bash
gcloud config set project prisincera   # 1회

# (a) 즉시 1회 실행
gcloud run jobs execute tech-composer --region asia-northeast3

# (b) 실행 이력·상태 확인
gcloud run jobs executions list --job tech-composer --region asia-northeast3 --limit 5

# (c) 특정 실행 로그 보기
gcloud run jobs executions describe <EXECUTION_NAME> --region asia-northeast3
#   또는 Cloud Logging 콘솔에서 resource.labels.job_name="tech-composer" 필터
```

### 2-1. 과거 날짜로 재생성 (TARGET_DATE)
`composer`·`tech-composer`는 `TARGET_DATE` env로 특정 날짜를 재생성할 수 있습니다. 가장 안전한 절차는 **env 주입 → 실행 → env 원복**:

```bash
gcloud run jobs update tech-composer --region asia-northeast3 \
    --update-env-vars TARGET_DATE=2026-06-28
gcloud run jobs execute tech-composer --region asia-northeast3
# 완료 후 반드시 원복 (다음 정기 실행이 과거 날짜로 돌지 않도록)
gcloud run jobs update tech-composer --region asia-northeast3 \
    --remove-env-vars TARGET_DATE
```

> ⚠️ 잡 이미지가 옛 버전일 수 있으니, 코드 변경 직후라면 **Cloud Build 배포(SUCCESS)가 끝난 뒤** 실행하세요(`jobs update`는 빌드 후반 단계).

## 3. 시나리오별 대응

### 🔴 당일 데일리 피드가 안 보임 (`daily/${date}.json` 부재)
1. 확인: `https://www.prisincera.com/api/daily/<YYYY-MM-DD>` → 404/빈 응답?
2. 원인: 새벽 `collector`→`composer` 체인 실패. 잡 로그 확인(§2c).
3. 복구: **순서대로** 재실행
   ```bash
   gcloud run jobs execute prisignal-collector --region asia-northeast3   # 수집 먼저
   gcloud run jobs execute prisignal-composer  --region asia-northeast3   # 그다음 가공/배포
   ```
4. 이미 그날 이메일이 나갔다면 `FORCE_DISPATCH` 없이 실행(중복 발송 방지).

### 🔴 테크 트랙(주니어/시니어) 피드 누락
- `daily/junior_${date}.json` / `senior_${date}.json` 부재 → `tech-composer` 단독 재실행(§2a).
- Admin **콘텐츠 관리 > 테크 트랙 "지금 생성"**으로도 트리거 가능(아래 §3 Admin 항목).

### 🟠 Gemini 할당량 소진 (429 / 생성 일부 누락)
- 무료 티어 = **모델당 20 requests/day**. 하루에 여러 잡(composer·study·tech·pacenote)이 호출하므로 재실행을 반복하면 소진됩니다.
- 증상: 잡 로그에 `429`/`RESOURCE_EXHAUSTED`, 카드 일부만 생성. 코드는 재시도 후 **중단**(전체 실패 아님) — [api_usage_analysis](api_usage_analysis.md).
- 대처: **익일 자정(PT) 자동 리셋**을 기다리거나, 급하면 `GEMINI_ADMIN_API_KEY` 시크릿에 **새 키 버전 추가** 후 잡 재배포([environment_reference](environment_reference.md) §4).
- 과금 안내가 떠도 무료 키면 실제 청구 없음(분석은 [api_usage_analysis](api_usage_analysis.md)).

### 🟠 이메일이 발송되지 않음
- `composer` 로그에서 SMTP 오류 확인 → `SMTP_*` 시크릿 점검([environment_reference](environment_reference.md) §2).
- 발송 락(Firestore)으로 인해 "이미 발송됨" 처리됐는데 실제 미발송이면, 원인 해결 후 `FORCE_DISPATCH=true`로 1회 재실행(⚠️ 중복 발송 위험 — 락 상태 먼저 확인).

### 🟠 Admin "지금 생성"이 "실행 중…"에서 멈춤
- Admin은 Job을 트리거하고 폴링합니다. **하이브리드 생성은 수십 초~수 분** 걸릴 수 있어 폴링이 먼저 끝난 것처럼 보일 수 있음.
- 실제 상태는 `gcloud run jobs executions list --job tech-composer ...`로 확인. `Succeeded`면 정상 — 화면 새로고침.
- `Failed`면 해당 실행 로그에서 원인(대개 Gemini 429 또는 RSS 타임아웃) 확인.

### 🟢 주간 monitor 경보
- `prisignal-monitor`(월요일)가 발송/파이프라인 이상을 리포트. 경보 시 직전 주 `composer` 실행 이력과 `email_logs`(Firestore)를 확인.

## 4. 데이터 보호 주의사항
- **Firestore 자동 백업이 구성돼 있지 않다면** 중요 컬렉션(`pacenotes`, `subscribers`)은 주기적 수동 export 권장:
  ```bash
  gcloud firestore export gs://prisincera-prisignal-data/backups/$(date +%F)
  ```
- GCS `daily/*.json`은 멱등 재생성 가능(원본 RSS+AI) — 단, 과거 날짜 RSS는 사라질 수 있어 완전 동일 복원은 보장되지 않음.
- 파괴적 작업(컬렉션 삭제, 버킷 prefix 삭제) 전 반드시 export.

## 5. 웹 서비스 장애 / 롤백
- 사이트 다운·502·DNS·SSL·잘못된 배포 롤백 → [development_guide](development_guide.md) §13(긴급 상황 대응) 참조.

## 6. 빠른 링크
- [Cloud Run 잡 콘솔](https://console.cloud.google.com/run/jobs?project=prisincera)
- [Cloud Scheduler 콘솔](https://console.cloud.google.com/cloudscheduler?project=prisincera)
- [Cloud Logging](https://console.cloud.google.com/logs?project=prisincera)
- [Secret Manager](https://console.cloud.google.com/security/secret-manager?project=prisincera)
