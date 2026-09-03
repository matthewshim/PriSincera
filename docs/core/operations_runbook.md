---
status: active
domain: Core
last_updated: 2026-08-19
version: v1.2
target_files:
  - cloudbuild.yaml
  - pipeline/src/collector.mjs
  - pipeline/src/composer.mjs
  - pipeline/src/tech-composer.mjs
  - pipeline/src/monitor.mjs
  - pipeline/src/lib/gemini.mjs
  - admin-api.mjs
---

# 📘 운영 런북 (Operations Runbook)

> **데이터 플레인(배치 파이프라인·GCS·Firestore·Gemini) 장애 시 무엇을 보고 어떻게 복구하는가.** 웹 서비스(사이트 다운·DNS·SSL·롤백) 대응은 [development_guide](development_guide.md) §13을, 환경변수·시크릿은 [environment_reference](environment_reference.md)를 참조하세요.

## 📝 Revision History

| Version | Date | Author | Description | Impact Area |
| :--- | :--- | :--- | :--- | :--- |
| v1.0 | 2026-06-29 | AI Agent | 파이프라인 잡 운영·시나리오별 복구 절차 최초 정의 | Operations |
| v1.1 | 2026-08-02 | AI Agent | **§4-b 비용 통제·결제 안전장치 신설**(min-instances 0·예산 가드레일·킬스위치·조직 정책 주의) + 중복 스케줄러 `prisignal-compose-weekly` 제거 반영 | Operations, Billing |
| v1.2 | 2026-08-19 | AI Agent | **§3 Gemini 503(모델 과부하) 시나리오 신설** — 429(할당량)와 분리. 2026-08-19 트랙 피드 전량 누락 사고 반영: `callGemini` 503 전용 장기 재시도 예산(`overloadMaxMs`) + `tech-composer` 트랙 독립 실패 처리 도입 | Operations, Pipeline |

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
>
> **스케줄러 현황(2026-08-02 실측)**: collect 06:00 · tech 06:45 · study 07:30 · compose 08:00 · monitor 08:30(매일) · pacenote 00:00 — 총 6개. 과거 `prisignal-composer`를 08:00에 중복 트리거하던 `prisignal-compose-weekly`(오해 소지 명칭·실제 매일)는 **제거됨**(compose-daily가 정본).

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
- **한쪽 트랙만 있는 경우**(junior 200 / senior 404 등)는 정상 동작입니다. `tech-composer`는 트랙별로 독립 실패 처리하여 **성공한 트랙은 먼저 배포**하고, 부분 성공 시 실행을 `Failed`로 표면화합니다(가시성 목적). 재실행하면 두 트랙 모두 새로 생성됩니다.
- ⚠️ `gcloud run jobs execute`에 `--args`를 넘길 때 **스크립트 경로까지 함께** 지정해야 합니다(`--args`는 기본 인자를 통째로 대체). PowerShell에서는 따옴표 없는 쉼표 인자가 배열로 파싱되어 공백으로 합쳐지므로(`MODULE_NOT_FOUND`), 날짜 지정은 `--args` 대신 **§2-1 `TARGET_DATE` env 방식**을 쓰세요.

### 🟠 Gemini 503 — 모델 과부하 (`high demand` / `Service Unavailable`)
- **429(할당량)와 다릅니다.** 429는 우리 쪽 사용량 문제, 503은 **구글 측 모델 용량 부족**이라 키를 바꿔도 소용없고 시간이 지나야 회복됩니다.
- 증상: 잡 로그에 `[503 Service Unavailable] This model is currently experiencing high demand.` 반복 후 `Container called exit(1)`.
- **재시도 정책**: `callGemini`는 짧은 지수 백오프(2^n초, 총 ~32초)로 모델 후보군을 순환합니다. 이 창은 수 분짜리 과부하 스파이크를 못 넘기므로, 호출부가 `opts.overloadMaxMs`(총 소요 시간 상한)를 주면 **전 모델 503일 때 30초→60초→120초→180초→300초 장기 대기 후 사이클을 재시도**합니다.
  - `tech-composer`는 트랙당 `overloadMaxMs = 700초`. 2트랙 최악 1400초 < 잡 타임아웃 1800초.
  - 기본값은 0(장기 재시도 없음)이라 다른 잡의 기존 동작은 변하지 않습니다. 필요 시 호출부에서 개별 opt-in.
- 대처: 위 정책으로도 실패하면 **30분~수 시간 뒤 수동 재실행**(§2a). 할당량 소진이 아니므로 재실행 자체는 안전합니다.
- 판별 팁: 같은 날 다른 잡(`composer` 스코어링 등)이 성공했다면 429가 아니라 503일 가능성이 높습니다.

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
- `Failed`면 해당 실행 로그에서 원인(대개 Gemini 429·503 또는 RSS 타임아웃) 확인. 503 장기 재시도가 걸리면 **트랙당 최대 ~12분**까지 늘어날 수 있으므로, 폴링이 끝나도 실행 중일 수 있습니다.

### 🟢 주간 monitor 경보
- `prisignal-monitor`(월요일)가 발송/파이프라인 이상을 리포트. 경보 시 직전 주 `composer` 실행 이력과 `email_logs`(Firestore)를 확인.

### 🔴 관리자 계정 생성/수정 실패 — "insufficient permission" (Firebase Auth IAM)
- **증상**: Admin > 관리자 추가 시 `Credential implementation provided to initializeApp() ... has insufficient permission to access the requested resource`.
- **원인**: `prisincera-web` Cloud Run 서비스 계정에 **Firebase Auth 관리 권한(`roles/firebaseauth.admin`)** 누락. 로그인(`verifyIdToken`, 공개키 검증)은 되지만 `createUser`/`updateUser`/`deleteUser`(Identity Toolkit Admin API)가 거부됨.
- **해결 (1회, 재배포 불필요·1~2분 반영)**:
  ```bash
  gcloud config set project prisincera
  SA=$(gcloud run services describe prisincera-web --region asia-northeast3 \
       --format='value(spec.template.spec.serviceAccountName)')
  # SA가 빈 값이면 기본 Compute SA: <PROJECT_NUMBER>-compute@developer.gserviceaccount.com
  gcloud projects add-iam-policy-binding prisincera \
    --member="serviceAccount:${SA:-<PROJECT_NUMBER>-compute@developer.gserviceaccount.com}" \
    --role="roles/firebaseauth.admin"
  ```
- 코드는 이 오류를 감지해 명확한 안내로 치환한다(`admin-api.mjs` `authPermissionHint`). 인프라 설정 근거는 [development_guide](development_guide.md) §7-7.

## 4. 데이터 보호 주의사항
- **Firestore 자동 백업이 구성돼 있지 않다면** 중요 컬렉션(`pacenotes`, `subscribers`)은 주기적 수동 export 권장:
  ```bash
  gcloud firestore export gs://prisincera-prisignal-data/backups/$(date +%F)
  ```
- GCS `daily/*.json`은 멱등 재생성 가능(원본 RSS+AI) — 단, 과거 날짜 RSS는 사라질 수 있어 완전 동일 복원은 보장되지 않음.
- 파괴적 작업(컬렉션 삭제, 버킷 prefix 삭제) 전 반드시 export.

## 4-b. 비용 통제 · 결제 안전장치 (2026-08-02)

> 저트래픽 대비 과도한 비용(상시 인스턴스)과 "결제 폭탄" 리스크를 3단으로 방어한다.

### 1차 — 상시 비용 제거
- `prisincera-web` **min-instances = 0** (유휴 시 scale-to-zero). 이전 `min=1`의 24시간 상시 과금이 비용 주범이었다. 저트래픽에선 무료 티어 내 **≈₩0**, 대가는 첫 요청 시 1~3초 콜드스타트.
  - 조정: `gcloud run services update prisincera-web --region asia-northeast3 --min-instances=N`
  - **`cloudbuild.yaml`도 `--min-instances 0`으로 정합**(2026-08-02) — 이게 없으면 다음 CI 배포가 min=1로 되돌린다.

### 2차 — 예산 경보
- 예산 **`prisincera-guardrail` ₩10,000**, 임계 **50/90/100%**(₩5,000·₩9,000·₩10,000) → **도메인 결제관리자** 이메일(외부 도메인 수신자는 조직 정책상 제외).
- 상한 조정: `gcloud billing budgets update <BUDGET_ID> --billing-account=012289-11137B-EC71FD --budget-amount=NKRW`

### 3차 — 무인 킬스위치 (예산 100% 도달 시 billing 자동 해제)
- **체인**: 예산 → Pub/Sub `billing-alerts` → Cloud Function **`billing-killswitch`**(SA `killswitch-sa`, 역할 `billing.projectManager`) → 프로젝트 billing 해제.
- `costAmount > budgetAmount`(100% 초과)일 때만 해제. 50/90% 임계는 무동작(경보만).
- **⚠️ 차단 시 서비스 다운**(비용 대신 다운타임을 택하는 상한). 정상 운영이 임계 근처에 가면 **예산액을 올릴 것**.
- 로그: `gcloud functions logs read billing-killswitch --region asia-northeast3` (또는 Cloud Logging `resource.labels.service_name="billing-killswitch"`).
- **안전 테스트(차단 없이 체인 확인)**: `gcloud pubsub topics publish billing-alerts --message='{"budgetDisplayName":"prisincera-guardrail","costAmount":1,"budgetAmount":10000,"currencyCode":"KRW"}'` → 로그에 `예산 이내 — 조치 없음`, billing 유지.

### ⚠️ 조직 정책 주의 (향후 인프라 작업 시 반드시 인지)
프로젝트는 조직 `prisincera.com`(customer `C013pho0g`) 소속이며 아래 **의도적 보안 정책**이 걸려 있다:
- **`iam.allowedPolicyMemberDomains`**(도메인 제한 공유) — Google 관리 SA·외부 아이덴티티에 IAM 부여 차단. 예산→Pub/Sub 연결도 이 벽에 막혀, **프로젝트 레벨 예외**(도메인 제한 일시 해제)를 걸어 연결 후 원복하는 방식으로 통과시켰다(기존 바인딩은 원복 후에도 생존).
- **`iam.disableServiceAccountKeyCreation`** — SA 키 발급 차단. GitHub Actions 등 외부 인증(키/WIF)이 막히는 원인 → **파이프라인 잡의 GH Actions 이관은 이 정책들로 보류**([migration/cloudflare_supabase_migration_plan](../migration/cloudflare_supabase_migration_plan.md) 참조).
- 완화가 필요하면 **조직관리자 권한으로 프로젝트 레벨 override → 작업 완료 즉시 원복**. 임시로 부여한 `orgpolicy.policyAdmin`도 회수할 것.

## 5. 웹 서비스 장애 / 롤백
- 사이트 다운·502·DNS·SSL·잘못된 배포 롤백 → [development_guide](development_guide.md) §13(긴급 상황 대응) · [infrastructure_2026-09](infrastructure_2026-09.md)(호스팅/DNS/SSL 현황) 참조.
- **비용 급증·결제 폭탄 우려** → §4-b(킬스위치·예산). 수동 즉시 차단: `gcloud billing projects unlink prisincera`(서비스 중단됨, 데이터는 유예기간 보존).

## 6. 빠른 링크
- [Cloud Run 잡 콘솔](https://console.cloud.google.com/run/jobs?project=prisincera)
- [Cloud Scheduler 콘솔](https://console.cloud.google.com/cloudscheduler?project=prisincera)
- [Cloud Logging](https://console.cloud.google.com/logs?project=prisincera)
- [Secret Manager](https://console.cloud.google.com/security/secret-manager?project=prisincera)
- [예산·알림 (Billing Budgets)](https://console.cloud.google.com/billing/012289-11137B-EC71FD/budgets)
- [Cloud Functions — billing-killswitch](https://console.cloud.google.com/functions/list?project=prisincera)
