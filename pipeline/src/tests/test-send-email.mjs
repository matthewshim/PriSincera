#!/usr/bin/env node
/**
 * PriSignal 테스트 발송 스크립트
 *
 * 사용법:
 *   set SMTP_USER=matthew.shim@prisincera.com
 *   set SMTP_PASS=<Gmail 앱 비밀번호>
 *   set UNSUBSCRIBE_SECRET=test-secret-key
 *   node pipeline/src/tests/test-send-email.mjs
 *
 * 또는 인자로:
 *   node pipeline/src/tests/test-send-email.mjs <앱비밀번호>
 */
import { renderDailyEmail } from '../lib/email-template.mjs';
import { sendEmail, closeTransporter } from '../lib/mailer.mjs';
import { buildUnsubscribeUrl } from '../lib/subscribers.mjs';

// ── 설정 ──
const TO_EMAIL = 'shimks@gravity.co.kr';
const SMTP_PASS_ARG = process.argv[2] || '';

// 환경변수 설정 (인자로 받은 경우)
if (!process.env.SMTP_USER) process.env.SMTP_USER = 'matthew.shim@prisincera.com';
if (!process.env.SMTP_FROM_NAME) process.env.SMTP_FROM_NAME = 'PriSignal';
if (!process.env.SMTP_FROM_EMAIL) process.env.SMTP_FROM_EMAIL = 'matthew.shim@prisincera.com';
if (!process.env.UNSUBSCRIBE_SECRET) process.env.UNSUBSCRIBE_SECRET = 'test-send-secret-key-32bytes!!!!!';
if (SMTP_PASS_ARG) process.env.SMTP_PASS = SMTP_PASS_ARG;

async function main() {
  console.log('═══════════════════════════════════════');
  console.log('📧 PriSignal 테스트 발송');
  console.log(`   수신: ${TO_EMAIL}`);
  console.log(`   발신: ${process.env.SMTP_USER}`);
  console.log('═══════════════════════════════════════\n');

  if (!process.env.SMTP_PASS) {
    console.error('❌ SMTP_PASS가 설정되지 않았습니다.');
    console.error('   사용법: node pipeline/src/tests/test-send-email.mjs <Gmail앱비밀번호>');
    console.error('   또는:  set SMTP_PASS=<비밀번호> 후 실행');
    process.exit(1);
  }

  // 오늘자 데일리 데이터 가져오기 (라이브 API)
  console.log('📡 오늘자 데일리 데이터 로드...');
  const date = '2026-04-29';
  const resp = await fetch(`https://www.prisincera.com/api/daily/${date}`);
  if (!resp.ok) {
    console.error(`❌ 데일리 데이터 로드 실패: ${resp.status}`);
    process.exit(1);
  }
  const dailyData = await resp.json();
  console.log(`   ✅ ${dailyData.total}개 아티클, DM Pick ${dailyData.dmPickCount}개\n`);

  // HTML 이메일 렌더링
  console.log('🎨 HTML 이메일 렌더링...');
  const html = renderDailyEmail({
    date,
    articles: dailyData.articles,
    totalCount: dailyData.total,
    dailyPageUrl: `https://www.prisincera.com/prisignal/${date}`,
    unsubscribeUrl: buildUnsubscribeUrl(TO_EMAIL),
  });
  console.log(`   ✅ HTML 생성 완료 (${(html.length / 1024).toFixed(1)}KB)\n`);

  // 발송
  const subject = `📡 [TEST] PriSignal Daily — 4/29(수)`;
  console.log(`📤 발송 중: "${subject}" → ${TO_EMAIL}`);

  const result = await sendEmail(TO_EMAIL, subject, html);

  if (result.success) {
    console.log(`\n✅ 발송 성공!`);
    console.log(`   messageId: ${result.messageId}`);
  } else {
    console.log(`\n❌ 발송 실패: ${result.error}`);
  }

  closeTransporter();
}

main().catch(err => {
  console.error('❌ 오류:', err.message);
  process.exit(1);
});
