/**
 * Firestore 클라이언트 — PriSincera 전체 서비스 공통
 *
 * Cloud Run에서는 서비스 계정으로 자동 인증됩니다.
 * 로컬 개발 시 GOOGLE_APPLICATION_CREDENTIALS 환경변수 필요.
 */
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// 싱글턴 — 여러 모듈에서 import해도 1회만 초기화
if (getApps().length === 0) {
  initializeApp({
    projectId: process.env.GCP_PROJECT_ID || 'prisincera',
  });
}

export const db = getFirestore();
export const auth = getAuth();

// ─── 컬렉션 참조 (중앙 관리) ────────────────────

export const COLLECTIONS = {
  SUBSCRIBERS: 'subscribers',
  EMAIL_LOGS: 'email_logs',
  DAILY_SIGNALS: 'daily_signals',
  STUDY_CONTENT: 'study_content',
  STUDY_PROGRESS: 'study_progress',
  ADMIN_CONFIG: 'admin_config',
};

export default db;
