#!/bin/bash
# ═══════════════════════════════════════════════════════════
# PriSignal Pipeline — GCP 인프라 설정 스크립트
# ═══════════════════════════════════════════════════════════
# 사전 조건: gcloud CLI 인증 완료, 프로젝트 설정 완료
#
# 실행: bash pipeline/setup-infra.sh
# ═══════════════════════════════════════════════════════════

set -euo pipefail

PROJECT_ID=$(gcloud config get-value project)
REGION="asia-northeast3"
BUCKET_NAME="${PROJECT_ID}-prisignal-data"
SA_NAME="prisignal-pipeline"
SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
ALERT_EMAIL="matthew.shim@prisincera.com"
IMAGE="asia-northeast3-docker.pkg.dev/${PROJECT_ID}/prisincera-images/pipeline:latest"

echo "═══════════════════════════════════════"
echo "📡 PriSignal Pipeline 인프라 설정"
echo "   프로젝트: ${PROJECT_ID}"
echo "   리전: ${REGION}"
echo "═══════════════════════════════════════"

# ─── 1. API 활성화 ───
echo -e "\n[1/8] API 활성화..."
gcloud services enable \
  run.googleapis.com \
  cloudscheduler.googleapis.com \
  storage.googleapis.com \
  secretmanager.googleapis.com \
  cloudbuild.googleapis.com \
  monitoring.googleapis.com

# ─── 2. GCS 버킷 생성 ───
echo -e "\n[2/8] GCS 버킷 생성: ${BUCKET_NAME}"
gsutil mb -l ${REGION} -p ${PROJECT_ID} gs://${BUCKET_NAME}/ 2>/dev/null || echo "  (이미 존재)"
# 초기 상태 파일 생성
echo '{"lastIssueNumber": 0}' | gsutil cp - gs://${BUCKET_NAME}/state/last-issue.json

# ─── 3. 서비스 계정 생성 ───
echo -e "\n[3/8] 서비스 계정 생성: ${SA_NAME}"
gcloud iam service-accounts create ${SA_NAME} \
  --display-name="PriSignal Pipeline" 2>/dev/null || echo "  (이미 존재)"

# IAM 권한 부여
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/storage.objectAdmin" --quiet

gcloud projects add-iam-policy-binding ${PROJECT_ID} \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/secretmanager.secretAccessor" --quiet

gcloud projects add-iam-policy-binding ${PROJECT_ID} \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/logging.logWriter" --quiet

# ─── 4. Secret Manager에 API 키 등록 ───
echo -e "\n[4/8] Secret Manager 설정..."
echo "  GEMINI_API_KEY를 등록합니다."
echo "  (이미 등록되어 있으면 건너뜁니다)"
gcloud secrets create GEMINI_API_KEY --replication-policy="automatic" 2>/dev/null || echo "  (이미 존재)"
# 값 설정은 수동으로: gcloud secrets versions add GEMINI_API_KEY --data-file=key.txt
echo "  ⚠ GEMINI_API_KEY 값을 설정하세요:"
echo "    echo -n 'YOUR_KEY' | gcloud secrets versions add GEMINI_API_KEY --data-file=-"

echo ""
echo "  BUTTONDOWN_API_KEY (이미 Cloud Run 환경변수로 존재)"
gcloud secrets create BUTTONDOWN_API_KEY --replication-policy="automatic" 2>/dev/null || echo "  (이미 존재)"

# ─── 5. 파이프라인 컨테이너 빌드 ───
echo -e "\n[5/8] 파이프라인 컨테이너 빌드..."
cd pipeline
gcloud builds submit --tag ${IMAGE} .
cd ..

# ─── 6. Cloud Run Jobs 생성 ───
echo -e "\n[6/8] Cloud Run Jobs 생성..."

# Collector Job (매일 RSS 수집)
gcloud run jobs create prisignal-collector \
  --image ${IMAGE} \
  --region ${REGION} \
  --service-account ${SA_EMAIL} \
  --command "node" \
  --args "src/collector.mjs" \
  --set-env-vars "GCS_BUCKET=${BUCKET_NAME}" \
  --set-secrets "BUTTONDOWN_API_KEY=BUTTONDOWN_API_KEY:latest" \
  --task-timeout 300s \
  --max-retries 2 \
  --memory 512Mi \
  --cpu 1 2>/dev/null || \
gcloud run jobs update prisignal-collector \
  --image ${IMAGE} \
  --region ${REGION}

# Composer Job (주간 뉴스레터 작성)
gcloud run jobs create prisignal-composer \
  --image ${IMAGE} \
  --region ${REGION} \
  --service-account ${SA_EMAIL} \
  --command "node" \
  --args "src/composer.mjs" \
  --set-env-vars "GCS_BUCKET=${BUCKET_NAME}" \
  --set-secrets "GEMINI_API_KEY=GEMINI_API_KEY:latest,BUTTONDOWN_API_KEY=BUTTONDOWN_API_KEY:latest" \
  --task-timeout 600s \
  --max-retries 2 \
  --memory 512Mi \
  --cpu 1 2>/dev/null || \
gcloud run jobs update prisignal-composer \
  --image ${IMAGE} \
  --region ${REGION}

# Monitor Job (발송 확인)
gcloud run jobs create prisignal-monitor \
  --image ${IMAGE} \
  --region ${REGION} \
  --service-account ${SA_EMAIL} \
  --command "node" \
  --args "src/monitor.mjs" \
  --set-env-vars "GCS_BUCKET=${BUCKET_NAME}" \
  --set-secrets "BUTTONDOWN_API_KEY=BUTTONDOWN_API_KEY:latest" \
  --task-timeout 120s \
  --max-retries 1 \
  --memory 256Mi \
  --cpu 1 2>/dev/null || \
gcloud run jobs update prisignal-monitor \
  --image ${IMAGE} \
  --region ${REGION}

# ─── 7. Cloud Scheduler 크론 생성 ───
echo -e "\n[7/8] Cloud Scheduler 크론 생성..."

# 매일 06:00 KST — RSS 수집
gcloud scheduler jobs create http prisignal-collect-daily \
  --location ${REGION} \
  --schedule "0 6 * * *" \
  --time-zone "Asia/Seoul" \
  --uri "https://${REGION}-run.googleapis.com/apis/run.googleapis.com/v1/namespaces/${PROJECT_ID}/jobs/prisignal-collector:run" \
  --http-method POST \
  --oauth-service-account-email ${SA_EMAIL} \
  --description "PriSignal: 매일 RSS 자동 수집" 2>/dev/null || echo "  (이미 존재)"

# 매주 일요일 08:00 KST — 뉴스레터 작성 + 예약
gcloud scheduler jobs create http prisignal-compose-weekly \
  --location ${REGION} \
  --schedule "0 8 * * 0" \
  --time-zone "Asia/Seoul" \
  --uri "https://${REGION}-run.googleapis.com/apis/run.googleapis.com/v1/namespaces/${PROJECT_ID}/jobs/prisignal-composer:run" \
  --http-method POST \
  --oauth-service-account-email ${SA_EMAIL} \
  --description "PriSignal: 주간 뉴스레터 자동 작성 및 예약 발송" 2>/dev/null || echo "  (이미 존재)"

# 매주 월요일 08:30 KST — 발송 확인
gcloud scheduler jobs create http prisignal-monitor-weekly \
  --location ${REGION} \
  --schedule "30 8 * * 1" \
  --time-zone "Asia/Seoul" \
  --uri "https://${REGION}-run.googleapis.com/apis/run.googleapis.com/v1/namespaces/${PROJECT_ID}/jobs/prisignal-monitor:run" \
  --http-method POST \
  --oauth-service-account-email ${SA_EMAIL} \
  --description "PriSignal: 발송 상태 확인 및 알림" 2>/dev/null || echo "  (이미 존재)"

# ─── 8. Cloud Monitoring 알림 채널 설정 ───
echo -e "\n[8/8] Cloud Monitoring 알림 설정..."

# 이메일 알림 채널 생성
gcloud beta monitoring channels create \
  --display-name="PriSignal Admin" \
  --type=email \
  --channel-labels=email_address=${ALERT_EMAIL} \
  --description="PriSignal 파이프라인 알림" 2>/dev/null || echo "  (이미 존재)"

echo ""
echo "═══════════════════════════════════════"
echo "✅ PriSignal Pipeline 인프라 설정 완료!"
echo "═══════════════════════════════════════"
echo ""
echo "📋 다음 단계:"
echo "  1. GEMINI_API_KEY 설정:"
echo "     echo -n 'YOUR_KEY' | gcloud secrets versions add GEMINI_API_KEY --data-file=-"
echo ""
echo "  2. Cloud Monitoring에서 알림 정책 생성:"
echo "     - 조건: Cloud Run Job 로그에 severity=ERROR + component=prisignal"
echo "     - 알림 채널: ${ALERT_EMAIL}"
echo ""
echo "  3. 수동 테스트 실행:"
echo "     gcloud run jobs execute prisignal-collector --region ${REGION}"
echo "     gcloud run jobs execute prisignal-composer --region ${REGION}"
echo ""
echo "  4. 정상 작동 확인 후 자동 운영 시작!"
