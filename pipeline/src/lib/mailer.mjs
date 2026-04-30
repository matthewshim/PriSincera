/**
 * PriSignal SMTP 발송 모듈 — Gmail SMTP (Nodemailer)
 *
 * buttondown.mjs를 대체합니다.
 * 기존 composer.mjs와의 인터페이스 호환성을 유지합니다.
 *
 * 환경변수:
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
 *   SMTP_FROM_NAME, SMTP_FROM_EMAIL
 */
import nodemailer from 'nodemailer';

// ─── 설정 ─────────────────────────────────────

function getConfig() {
  return {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    fromName: process.env.SMTP_FROM_NAME || 'PriSignal',
    fromEmail: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || '',
  };
}

let _transporter = null;

/**
 * Nodemailer transporter를 생성합니다. (싱글톤)
 */
function getTransporter() {
  if (_transporter) return _transporter;

  const config = getConfig();
  if (!config.user || !config.pass) {
    throw new Error('SMTP_USER, SMTP_PASS 환경변수가 설정되지 않았습니다.');
  }

  _transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    auth: {
      user: config.user,
      pass: config.pass,
    },
    // Gmail 쓰로틀링 대응
    pool: true,
    maxConnections: 1,
    rateDelta: 1000,  // 1초 간격
    rateLimit: 1,      // 초당 1건
  });

  return _transporter;
}

// ─── 발송 함수 ──────────────────────────────────

/**
 * 단일 이메일을 발송합니다.
 *
 * @param {string} to - 수신자 이메일
 * @param {string} subject - 제목
 * @param {string} html - HTML 본문
 * @returns {Promise<Object>} 발송 결과
 */
export async function sendEmail(to, subject, html) {
  const config = getConfig();
  const transporter = getTransporter();

  const mailOptions = {
    from: `"${config.fromName}" <${config.fromEmail}>`,
    to,
    subject,
    html,
    // List-Unsubscribe 헤더 (이메일 클라이언트 구독해지 버튼 지원)
    headers: {
      'X-Mailer': 'PriSignal/2.0',
    },
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Mailer] ✅ 발송 완료: ${to} (messageId: ${info.messageId})`);
    return { success: true, messageId: info.messageId, to };
  } catch (err) {
    console.error(`[Mailer] ❌ 발송 실패: ${to} — ${err.message}`);
    return { success: false, error: err.message, to };
  }
}

/**
 * 전체 구독자에게 이메일을 발송합니다.
 * 각 구독자별로 개인화된 unsubscribe URL이 필요하므로
 * htmlRenderer 함수를 받아 구독자별 HTML을 생성합니다.
 *
 * @param {string} subject - 이메일 제목
 * @param {Function} htmlRenderer - (email) => HTML 문자열
 * @param {string[]} subscribers - 구독자 이메일 배열
 * @returns {Promise<{ sent: number, failed: number, results: Array }>}
 */
export async function sendToSubscribers(subject, htmlRenderer, subscribers) {
  console.log(`[Mailer] 전체 발송 시작: "${subject}" → ${subscribers.length}명`);

  const results = [];
  let sent = 0;
  let failedCount = 0;

  for (const email of subscribers) {
    try {
      const html = typeof htmlRenderer === 'function'
        ? htmlRenderer(email)
        : htmlRenderer; // 문자열이면 그대로 사용

      const result = await sendEmail(email, subject, html);
      results.push(result);

      if (result.success) {
        sent++;
      } else {
        failedCount++;
      }
    } catch (err) {
      console.error(`[Mailer] ❌ 렌더링/발송 실패: ${email} — ${err.message}`);
      results.push({ success: false, error: err.message, to: email });
      failedCount++;
    }
  }

  console.log(`[Mailer] 전체 발송 완료: 성공 ${sent}건 / 실패 ${failedCount}건`);

  return {
    sent,
    failed: failedCount,
    total: subscribers.length,
    results,
    id: `prisignal-${new Date().toISOString()}`, // composer.mjs 호환용 ID
  };
}

/**
 * SMTP 연결을 확인합니다.
 * @returns {Promise<boolean>}
 */
export async function verifyConnection() {
  try {
    const transporter = getTransporter();
    await transporter.verify();
    console.log('[Mailer] ✅ SMTP 연결 확인 완료');
    return true;
  } catch (err) {
    console.error(`[Mailer] ❌ SMTP 연결 실패: ${err.message}`);
    return false;
  }
}

/**
 * Transporter를 닫습니다. (테스트/정리용)
 */
export function closeTransporter() {
  if (_transporter) {
    _transporter.close();
    _transporter = null;
  }
}
