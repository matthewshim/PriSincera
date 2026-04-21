/**
 * Buttondown API 클라이언트 — 뉴스레터 생성, 예약 발송, 상태 확인
 */

const BUTTONDOWN_API_KEY = process.env.BUTTONDOWN_API_KEY;
const BASE_URL = 'https://api.buttondown.com/v1';

if (!BUTTONDOWN_API_KEY) throw new Error('BUTTONDOWN_API_KEY 환경변수가 설정되지 않았습니다.');

const headers = {
  'Authorization': `Token ${BUTTONDOWN_API_KEY}`,
  'Content-Type': 'application/json',
};

/**
 * 뉴스레터를 예약 발송으로 생성합니다.
 * @param {string} subject - 이메일 제목
 * @param {string} body - Markdown 본문
 * @param {string} publishDate - ISO 8601 발송 시간 (e.g. "2026-04-28T23:00:00Z")
 * @returns {Promise<Object>} Buttondown 이메일 객체
 */
export async function scheduleEmail(subject, body, publishDate) {
  console.log(`[Buttondown] 예약 발송 생성: "${subject}" → ${publishDate}`);

  const res = await fetch(`${BASE_URL}/emails`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      subject,
      body,
      status: 'scheduled',
      publish_date: publishDate,
    }),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Buttondown API 오류 (${res.status}): ${errorBody}`);
  }

  const data = await res.json();
  console.log(`[Buttondown] ✅ 예약 완료: ID ${data.id}`);
  return data;
}

/**
 * 뉴스레터를 즉시 발송합니다. (예약 시간이 이미 지난 경우)
 * @param {string} subject - 이메일 제목
 * @param {string} body - Markdown 본문
 * @returns {Promise<Object>} Buttondown 이메일 객체
 */
export async function sendEmail(subject, body) {
  console.log(`[Buttondown] 즉시 발송: "${subject}"`);

  const res = await fetch(`${BASE_URL}/emails`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      subject,
      body,
      status: 'about_to_send',
    }),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Buttondown API 오류 (${res.status}): ${errorBody}`);
  }

  const data = await res.json();
  console.log(`[Buttondown] ✅ 즉시 발송 완료: ID ${data.id}`);
  return data;
}

/**
 * 최근 발송된 이메일 목록을 조회합니다.
 * @param {number} count - 조회할 이메일 수
 * @returns {Promise<Array>} 이메일 목록
 */
export async function getRecentEmails(count = 5) {
  const res = await fetch(`${BASE_URL}/emails?limit=${count}&ordering=-publish_date`, {
    method: 'GET',
    headers,
  });

  if (!res.ok) {
    throw new Error(`Buttondown API 오류 (${res.status})`);
  }

  const data = await res.json();
  return data.results || [];
}

/**
 * 특정 이메일의 상태를 확인합니다.
 * @param {string} emailId - Buttondown 이메일 ID
 * @returns {Promise<Object>} 이메일 상태 객체
 */
export async function getEmailStatus(emailId) {
  const res = await fetch(`${BASE_URL}/emails/${emailId}`, {
    method: 'GET',
    headers,
  });

  if (!res.ok) {
    throw new Error(`Buttondown API 오류 (${res.status})`);
  }

  return await res.json();
}
