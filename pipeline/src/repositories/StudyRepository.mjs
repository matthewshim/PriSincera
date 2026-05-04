/**
 * StudyRepository — Firestore 기반 PriStudy 학습 데이터 접근 레이어
 */
import { db, COLLECTIONS } from '../lib/firestore.mjs';

/**
 * 학습 콘텐츠(문장)를 저장합니다.
 * @param {string} dateStr "YYYY-MM-DD"
 * @param {Object} data 
 */
export async function saveStudyContent(dateStr, data) {
  const docRef = db.collection(COLLECTIONS.STUDY_CONTENT).doc(dateStr);
  await docRef.set({
    ...data,
    updatedAt: new Date().toISOString()
  }, { merge: true });
  console.log(`[Firestore] PriStudy 콘텐츠 저장 완료: ${COLLECTIONS.STUDY_CONTENT}/${dateStr}`);
}

/**
 * 특정 날짜의 학습 콘텐츠를 조회합니다.
 * @param {string} dateStr "YYYY-MM-DD"
 */
export async function getStudyContent(dateStr) {
  const docRef = db.collection(COLLECTIONS.STUDY_CONTENT).doc(dateStr);
  const snap = await docRef.get();
  if (!snap.exists) return null;
  return snap.data();
}
