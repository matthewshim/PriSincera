# Waymark 배포 런북 — M1 프로덕션 실가동

> 대상: 오너. 목적: 얇은 루프를 **프로덕션에서 실제 동작**시키기 위한 1회성 GCP 설정.
> 프로젝트 `prisincera` · 리전 `asia-northeast3`.
> 이 설정 전까지 Waymark는 **사용자 비노출**(GNB·랜딩 CTA 미연결)이라 프로덕션에 올라가 있어도 무해. 체험 AI(Groq)만 아래 **1단계** 전까지 잠들어 있음.

## 한눈에 (순서 중요)
1. **(오너)** GROQ 시크릿 생성 — 프로덕션 체험 AI 깨우기
2. **(오너)** 먼저찾아옴 넛지 Job 1회 생성 + 수동 실행 검증 — 이메일 발송
3. **(오너)** Cloud Scheduler 트리거 — 넛지 매시 자동 실행
4. **(클로드)** 1·2 완료 후 cloudbuild 자동화 2줄 추가·푸시 — 이후 배포 자동 반영

---

## 1. GROQ 시크릿 생성 (체험 AI)

프로덕션엔 현재 `GROQ_API_KEY`가 없어 체험 AI가 잠들어 있음(`cloudbuild.yaml` `--set-secrets`에 GEMINI·GITHUB만).

**콘솔(권장 — 키를 안전하게 붙여넣기):**
- Secret Manager: https://console.cloud.google.com/security/secret-manager?project=prisincera
- `+ 비밀 만들기` → 이름 `GROQ_API_KEY` → 값에 Groq 키(`gsk_...`, 로컬 `.env.local`과 동일) 붙여넣기 → 만들기

**또는 CLI(키가 셸 기록에 남을 수 있음 — 콘솔 권장):**
```
printf '%s' 'gsk_당신의_키' | gcloud secrets create GROQ_API_KEY \
  --project prisincera --replication-policy automatic --data-file=-
```

→ 완료되면 클로드에게 알림. 클로드가 **4-1**(cloudbuild에 GROQ 바인딩)을 푸시 → 다음 배포부터 프로덕션 체험 AI 동작.

---

## 2. 먼저찾아옴 넛지 Job 생성 (이메일)

넛지는 **web 이미지**에서 `waymark-nudge.mjs` 실행: 도래한 결정 이벤트 조회 → 동반 메시지+알림 기록 → 이메일 발송 → `status=sent`. **AI 미사용**(템플릿). 메일은 기존 뉴스레터와 **동일한 SMTP 시크릿** 재사용.

**2-1. 기존 이메일 Job의 SMTP 설정 확인(복제용):**
```
gcloud run jobs describe prisignal-composer --region asia-northeast3 --project prisincera \
  --format="yaml(spec.template.template.spec.containers[0].env)"
```
→ 여기 나오는 `SMTP_*`를 그대로 넛지에 사용(특히 `SMTP_PASS`=Secret, `SMTP_USER`=발신 계정).

**2-2. 넛지 Job 생성(1회):**
```
gcloud run jobs create waymark-nudge \
  --project prisincera --region asia-northeast3 \
  --image asia-northeast3-docker.pkg.dev/prisincera/prisincera-images/web:latest \
  --command node --args waymark-nudge.mjs \
  --set-secrets SMTP_PASS=SMTP_PASS:latest \
  --set-env-vars SMTP_USER=발신계정@gmail.com,SMTP_HOST=smtp.gmail.com,SMTP_PORT=587,SMTP_FROM_NAME=Waymark \
  --task-timeout 300s --max-retries 1
```
> `SMTP_*` 값은 2-1의 기존 Job과 동일하게. `SMTP_PASS`만 Secret, 나머지는 env로 충분.
> 서비스 계정: 기존 Job과 같은 기본 SA면 Firestore 접근 OK(별도 설정 불필요).

**2-3. 수동 1회 실행 검증:**
```
gcloud run jobs execute waymark-nudge --region asia-northeast3 --project prisincera
```
→ 도래 이벤트가 있으면 이메일 발송. 실행 로그에 SMTP 오류 없는지 확인.

---

## 3. Cloud Scheduler 트리거 (매시 자동)

넛지를 매시 정각 실행(사용자별 조용시간은 넛지 내부 처리). 기존 크론 6개와 동일 방식.
콘솔: https://console.cloud.google.com/cloudscheduler?project=prisincera

```
gcloud scheduler jobs create http waymark-nudge-hourly \
  --project prisincera --location asia-northeast3 \
  --schedule "0 * * * *" --time-zone "Asia/Seoul" \
  --uri "https://asia-northeast3-run.googleapis.com/apis/run.googleapis.com/v1/namespaces/prisincera/jobs/waymark-nudge:run" \
  --http-method POST \
  --oauth-service-account-email <기존_크론과_동일_SA>
```
> `<기존_크론과_동일_SA>`: 콘솔에서 기존 트리거의 서비스 계정 확인 후 동일하게(보통 `<PROJECT_NUMBER>-compute@developer.gserviceaccount.com`, run.invoker 권한 필요).
> `gcloud projects describe prisincera --format='value(projectNumber)'`로 번호 확인.

---

## 4. (클로드) cloudbuild 자동화 — 1·2 완료 후 푸시

> **순서 주의**: GROQ 시크릿이 없을 때 4-1을 넣으면 **프로덕션 웹 배포가 깨짐**. 그래서 1단계(시크릿) 확인 후 적용.

**4-1. 웹 서비스에 GROQ 바인딩** — `cloudbuild.yaml` Step 3의 `--set-secrets` 값 **끝에** 아래 한 항목을 콤마로 이어 붙임(기존 GEMINI·GITHUB 항목은 그대로 두고 추가):

    GROQ_API_KEY=GROQ_API_KEY:latest

→ 이후 배포부터 프로덕션 체험 AI 동작.

**4-2. 넛지 Job 자동 갱신 단계**(web 이미지 최신화 때마다) — Step 3 뒤에 추가:
```
  # Step 3b: Update Waymark Nudge Job (먼저찾아옴)
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: 'bash'
    args:
      - '-c'
      - 'gcloud run jobs update waymark-nudge --image asia-northeast3-docker.pkg.dev/$PROJECT_ID/prisincera-images/web:$SHORT_SHA --region asia-northeast3 --command node --args waymark-nudge.mjs --task-timeout 300s --max-retries 1 || echo "[cloudbuild] waymark-nudge 미생성 — 런북 2단계로 생성 필요(건너뜀)"'
```
> `|| echo`로 **Job 생성 전에도 빌드가 깨지지 않음**. 생성 후부터 자동 갱신.

---

## 완료 기준
- [ ] GROQ 시크릿 존재 → 4-1 푸시 → 프로덕션 "AI로 더 깊이 묻기" 동작
- [ ] waymark-nudge Job 수동 실행 성공(이메일 수신 확인)
- [ ] Scheduler 매시 트리거 생성
- [ ] 4-2 머지 → 이후 배포 시 넛지 자동 갱신

> **웹푸시(FCM, M1-B.2)는 별도** — VAPID 키 발급 후 착수. 이메일이 도달을 보증하므로 그 전까지 운영 가능.
