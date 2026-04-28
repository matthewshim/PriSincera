/**
 * Cloud Storage 유틸리티 — 데일리 시그널, 후보 풀, 발행 이력, 상태 관리
 */
import { Storage } from '@google-cloud/storage';

const storage = new Storage();
const BUCKET = process.env.GCS_BUCKET || 'prisincera-prisignal-data';

/**
 * GCS에서 JSON 파일을 읽습니다.
 * @param {string} path - GCS 객체 경로
 * @returns {Promise<Object|null>} 파싱된 JSON 또는 null
 */
export async function readJSON(path) {
  try {
    const [content] = await storage.bucket(BUCKET).file(path).download();
    return JSON.parse(content.toString('utf-8'));
  } catch (err) {
    if (err.code === 404) {
      console.log(`[GCS] 파일 없음 (신규 생성 예정): ${path}`);
      return null;
    }
    throw err;
  }
}

/**
 * GCS에 JSON 파일을 저장합니다.
 * @param {string} path - GCS 객체 경로
 * @param {Object} data - 저장할 데이터
 */
export async function writeJSON(path, data) {
  const content = JSON.stringify(data, null, 2);
  await storage.bucket(BUCKET).file(path).save(content, {
    contentType: 'application/json',
    metadata: { cacheControl: 'no-cache' },
  });
  console.log(`[GCS] 저장 완료: gs://${BUCKET}/${path}`);
}

/**
 * 현재 주간의 후보 풀 파일 경로를 반환합니다.
 * 대상: 다음 월요일 날짜 기준
 */
export function getCandidatesPath() {
  const monday = getTargetMonday();
  const dateStr = formatDate(monday);
  return `candidates/${dateStr}.json`;
}

/**
 * 발행 이력 파일 경로를 반환합니다.
 */
export function getIssuePath(dateStr) {
  return `issues/${dateStr}.json`;
}

// ─── Daily Signal 전용 ───────────────────────────────

/**
 * 데일리 시그널 JSON 경로를 반환합니다.
 * @param {string} dateStr - "2026-04-21" 형식
 */
export function getDailyPath(dateStr) {
  return `daily/${dateStr}.json`;
}

/**
 * 오늘 날짜 문자열을 KST 기준으로 반환합니다.
 * @returns {string} "2026-04-21" 형식
 */
export function getTodayKST() {
  const now = new Date();
  // KST = UTC + 9
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().split('T')[0];
}

/**
 * 데일리 JSON의 공개 URL을 반환합니다.
 * Nginx에서 /api/daily/:date 로 프록시됩니다.
 */
export function getDailyPublicUrl(dateStr) {
  return `https://storage.googleapis.com/${BUCKET}/daily/${dateStr}.json`;
}

/**
 * 오늘 08:00 KST의 ISO 문자열을 반환합니다. (데일리 DM 발송 시간)
 */
export function getDailySendTime() {
  const todayStr = getTodayKST();
  // 08:00 KST = 전날 23:00 UTC
  const [y, m, d] = todayStr.split('-').map(Number);
  const sendTime = new Date(Date.UTC(y, m - 1, d - 1, 23, 0, 0));
  // 이미 지난 시간이면 즉시 발송 (status: 'draft' → 'about_to_send')
  if (sendTime < new Date()) return null;
  return sendTime.toISOString();
}

/**
 * 최근 N일간의 데일리 날짜 문자열 배열을 반환합니다.
 * @param {number} days - 일수 (기본 7)
 */
export function getRecentDailyDates(days = 7) {
  const dates = [];
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  for (let i = 0; i < days; i++) {
    const d = new Date(kst);
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
}

/**
 * 데일리 JSON을 공개 읽기 가능하게 저장합니다.
 */
export async function writeDailyJSON(dateStr, data) {
  const path = getDailyPath(dateStr);
  const content = JSON.stringify(data, null, 2);
  const file = storage.bucket(BUCKET).file(path);
  await file.save(content, {
    contentType: 'application/json',
    metadata: { cacheControl: 'public, max-age=300' },
  });
  // Uniform Bucket-Level Access 사용 — 버킷 레벨 IAM으로 공개 접근 관리
  console.log(`[GCS] 데일리 시그널 저장: gs://${BUCKET}/${path}`);
}

/**
 * 마지막 발행 이슈 번호를 가져옵니다.
 */
export async function getLastIssueNumber() {
  const state = await readJSON('state/last-issue.json');
  return state?.lastIssueNumber || 0;
}

/**
 * 발행 이슈 번호를 업데이트합니다.
 */
export async function setLastIssueNumber(num) {
  await writeJSON('state/last-issue.json', {
    lastIssueNumber: num,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * 다음 월요일의 Date 객체를 반환합니다.
 * 월요일에 실행되면 7일 후 월요일, 그 외에는 이번 주 또는 다음 주 월요일.
 */
export function getTargetMonday() {
  const now = new Date();
  const day = now.getUTCDay(); // 0=Sun, 1=Mon, ...
  let daysAhead;
  if (day === 0) daysAhead = 1;       // 일요일 → 내일 월요일
  else if (day === 1) daysAhead = 7;   // 월요일 → 다음 주 월요일
  else daysAhead = 8 - day;            // 화~토 → 이번 주 월요일

  const target = new Date(now);
  target.setUTCDate(now.getUTCDate() + daysAhead);
  return target;
}

/**
 * 다음 월요일 08:00 KST의 ISO 문자열을 반환합니다.
 * (KST = UTC+9, 즉 UTC 기준 전날 23:00)
 */
export function getNextMondaySendTime() {
  const monday = getTargetMonday();
  // 월요일 08:00 KST = 일요일 23:00 UTC (전날)
  const sendTime = new Date(Date.UTC(
    monday.getUTCFullYear(),
    monday.getUTCMonth(),
    monday.getUTCDate() - 1, // 전날 (일요일)
    23, 0, 0 // 23:00 UTC = 08:00 KST
  ));
  return sendTime.toISOString();
}

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

export { BUCKET };
