/**
 * MailService — 이메일 HTML 렌더링, 전송, 전송 결과 이력 기록 전담
 */
import { sendToSubscribers } from '../lib/mailer.mjs';
import { renderDailyEmail } from '../lib/email-template.mjs';
import { buildUnsubscribeUrl } from '../lib/subscribers.mjs';
import { db, COLLECTIONS } from '../lib/firestore.mjs';

/**
 * 당일 이메일이 이미 발송되었는지 확인합니다.
 * @param {string} todayStr 
 * @returns {Promise<boolean>}
 */
export async function isEmailAlreadySent(todayStr) {
  if (!db) return false;
  try {
    const doc = await db.collection(COLLECTIONS.EMAIL_LOGS).doc(`daily-${todayStr}`).get();
    return doc.exists;
  } catch (err) {
    console.error(`[MailService] 발송 여부 확인 실패: ${err.message}`);
    return false;
  }
}

/**
 * 데일리 이메일을 발송하고 그 결과를 Firestore에 기록합니다.
 * 
 * @param {string} todayStr 
 * @param {Array} finalArticles 
 * @param {Array} subscribers 
 * @param {Object} [studyData]
 */
export async function dispatchDailyEmail(todayStr, finalArticles, subscribers, studyData) {
  const dailyPageUrl = `https://www.prisincera.com/prisignal/${todayStr}`;
  
  // 날짜 한국어 포맷 (예: 5/3(일))
  const [y, m, d] = todayStr.split('-');
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const dateObj = new Date(Number(y), Number(m) - 1, Number(d));
  const dateKr = `${Number(m)}/${Number(d)}(${days[dateObj.getDay()]})`;

  const subject = `📡 PriSignal Daily — ${dateKr}`;

  // 구독자별 개인화된 HTML 렌더링 (unsubscribe URL 개별 생성)
  const htmlRenderer = (subscriberEmail) => renderDailyEmail({
    date: todayStr,
    articles: finalArticles,
    totalCount: finalArticles.length,
    dailyPageUrl,
    unsubscribeUrl: buildUnsubscribeUrl(subscriberEmail),
    studyData,
  });

  // 발송 실행
  const emailResult = await sendToSubscribers(subject, htmlRenderer, subscribers);

  // Firestore 이력 저장
  try {
    if (db) {
      await db.collection(COLLECTIONS.EMAIL_LOGS).doc(`daily-${todayStr}`).set({
        date: todayStr,
        subject: subject,
        totalRecipients: emailResult.total,
        successCount: emailResult.sent,
        failedCount: emailResult.failed,
        sentAt: new Date().toISOString(),
        results: emailResult.results.map(r => ({ to: r.to, success: r.success, error: r.error || null }))
      });
      console.log(`[MailService] 발송 이력 Firestore 저장 완료: daily-${todayStr}`);

      // 발송 실패 내역 별도 보관 (재시도 큐)
      if (emailResult.failed > 0) {
        const batch = db.batch();
        let failedCount = 0;
        for (const res of emailResult.results) {
          if (!res.success) {
            const docRef = db.collection(COLLECTIONS.FAILED_EMAILS).doc();
            batch.set(docRef, {
              date: todayStr,
              to: res.to,
              error: res.error,
              status: 'pending_retry',
              createdAt: new Date().toISOString()
            });
            failedCount++;
          }
        }
        await batch.commit();
        console.log(`[MailService] ⚠️ 발송 실패 ${failedCount}건을 failed_emails 컬렉션에 등록했습니다.`);
      }
    }
  } catch (err) {
    console.error(`[MailService] 발송 이력 저장 실패: ${err.message}`);
  }

  return emailResult;
}
