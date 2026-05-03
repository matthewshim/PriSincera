/**
 * DailyRepository — Firestore 기반 데일리 시그널 데이터 접근 레이어
 */
import { db, COLLECTIONS } from '../lib/firestore.mjs';

/**
 * 데일리 시그널 문서를 저장하거나 업데이트합니다.
 * @param {string} dateStr "YYYY-MM-DD"
 * @param {Object} data 
 */
export async function saveDailySignal(dateStr, data) {
  const docRef = db.collection(COLLECTIONS.DAILY_SIGNALS || 'daily_signals').doc(dateStr);
  await docRef.set({
    ...data,
    updatedAt: new Date().toISOString()
  }, { merge: true });
  console.log(`[Firestore] 데일리 시그널 저장 완료: daily_signals/${dateStr}`);
}

/**
 * 데일리 시그널 문서를 조회합니다.
 * @param {string} dateStr "YYYY-MM-DD"
 */
export async function getDailySignal(dateStr) {
  const docRef = db.collection(COLLECTIONS.DAILY_SIGNALS || 'daily_signals').doc(dateStr);
  const snap = await docRef.get();
  if (!snap.exists) return null;
  return snap.data();
}

/**
 * 저장된 데일리 시그널 날짜 목록을 최신순으로 가져옵니다. (index.json 대체)
 */
export async function getDailyIndex() {
  const snap = await db.collection(COLLECTIONS.DAILY_SIGNALS || 'daily_signals')
    .select('date')
    .orderBy('date', 'desc')
    .get();
  
  return {
    dates: snap.docs.map(d => d.data().date)
  };
}
