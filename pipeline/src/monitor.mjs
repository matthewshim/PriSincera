#!/usr/bin/env node
/**
 * PriSignal Monitor — 매일 08:30 KST 실행
 *
 * [Daily Model v2]
 * 1. Buttondown API로 최근 이메일 상태 확인
 * 2. 오늘 예정된 DM이 정상 발송되었는지 검증
 * 3. 실패 시 ERROR 레벨 로그 출력 (Cloud Monitoring 알림 트리거)
 */
import { getRecentEmails } from './lib/buttondown.mjs';

async function main() {
  console.log('═══════════════════════════════════════');
  console.log('🔍 PriSignal Monitor 시작');
  console.log(`   시각: ${new Date().toISOString()}`);
  console.log('═══════════════════════════════════════');

  // 최근 이메일 조회
  const emails = await getRecentEmails(3);

  if (emails.length === 0) {
    console.error('❌ [ALERT] 발송된 이메일을 찾을 수 없습니다.');
    logAlert('NO_EMAILS', '발송된 이메일이 없습니다. Composer가 정상 실행되었는지 확인하세요.');
    process.exit(1);
  }

  // 오늘 날짜의 이메일 확인
  const today = new Date().toISOString().split('T')[0];
  const todayEmail = emails.find(e => {
    const pubDate = e.publish_date?.split('T')[0];
    return pubDate === today;
  });

  if (!todayEmail) {
    // 어제 예약이었을 수 있음 (KST/UTC 차이)
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const yesterdayEmail = emails.find(e => {
      const pubDate = e.publish_date?.split('T')[0];
      return pubDate === yesterday;
    });

    if (yesterdayEmail) {
      checkEmailStatus(yesterdayEmail);
    } else {
      console.error(`❌ [ALERT] 오늘(${today}) 또는 어제(${yesterday}) 예정된 이메일을 찾을 수 없습니다.`);
      logAlert('MISSING_EMAIL', `${today} 예정된 이메일이 없습니다.`);
      process.exit(1);
    }
  } else {
    checkEmailStatus(todayEmail);
  }

  console.log('\n═══════════════════════════════════════');
  console.log('✅ Monitor 확인 완료');
  console.log('═══════════════════════════════════════');
}

function checkEmailStatus(email) {
  console.log(`[Monitor] 이메일 확인:`);
  console.log(`   제목: ${email.subject}`);
  console.log(`   상태: ${email.status}`);
  console.log(`   발송일: ${email.publish_date}`);
  console.log(`   ID: ${email.id}`);

  const status = email.status?.toLowerCase();

  if (status === 'sent' || status === 'delivered') {
    console.log('✅ 정상 발송 확인');
  } else if (status === 'scheduled' || status === 'about_to_send' || status === 'sending') {
    console.log('⏳ 발송 진행 중 (정상 — 아직 처리 중일 수 있음)');
  } else if (status === 'draft') {
    console.error(`❌ [ALERT] 이메일이 드래프트 상태입니다. 예약 발송이 설정되지 않았습니다.`);
    logAlert('DRAFT_STATUS', `이메일 ${email.id}이 draft 상태입니다.`);
    process.exit(1);
  } else {
    console.error(`❌ [ALERT] 예상치 못한 이메일 상태: ${status}`);
    logAlert('UNEXPECTED_STATUS', `이메일 ${email.id} 상태: ${status}`);
    process.exit(1);
  }
}

/**
 * 구조화된 알림 로그를 출력합니다.
 * Cloud Logging에서 이 패턴을 감지하여 이메일 알림을 전송합니다.
 */
function logAlert(code, message) {
  // Cloud Logging JSON 구조화 로그
  const alertPayload = {
    severity: 'ERROR',
    component: 'prisignal-monitor',
    alertCode: code,
    message: `[PriSignal Alert] ${message}`,
    alertEmail: 'matthew.shim@prisincera.com',
    timestamp: new Date().toISOString(),
  };
  console.error(JSON.stringify(alertPayload));
}

main().catch(err => {
  console.error('❌ Monitor 실패:', err.message);
  logAlert('MONITOR_CRASH', err.message);
  process.exit(1);
});
