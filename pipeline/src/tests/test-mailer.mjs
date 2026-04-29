#!/usr/bin/env node
/**
 * Phase 3 단위 테스트: mailer.mjs
 *
 * SMTP 실제 연결 없이 모듈 구조와 함수 인터페이스만 검증합니다.
 * (실제 발송 테스트는 SMTP 환경변수 설정 후 별도 수행)
 *
 * 실행: node pipeline/src/tests/test-mailer.mjs
 */

let passed = 0;
let failed = 0;

function assert(condition, msg) {
  if (condition) {
    console.log(`  ✅ ${msg}`);
    passed++;
  } else {
    console.error(`  ❌ ${msg}`);
    failed++;
  }
}

console.log('\n═══ Phase 3: mailer.mjs 단위 테스트 ═══\n');

// ── 모듈 로드 테스트 ──
console.log('📦 모듈 로드:');
let mailer;
try {
  mailer = await import('../lib/mailer.mjs');
  assert(true, '모듈 import 성공');
} catch (err) {
  assert(false, `모듈 import 실패: ${err.message}`);
  process.exit(1);
}

// ── 함수 존재 검증 ──
console.log('\n🔍 함수 인터페이스:');
assert(typeof mailer.sendEmail === 'function', 'sendEmail 함수 존재');
assert(typeof mailer.sendToSubscribers === 'function', 'sendToSubscribers 함수 존재');
assert(typeof mailer.verifyConnection === 'function', 'verifyConnection 함수 존재');
assert(typeof mailer.closeTransporter === 'function', 'closeTransporter 함수 존재');

// ── 환경변수 미설정 시 에러 핸들링 ──
console.log('\n⚠️ 환경변수 미설정 에러 핸들링:');
// SMTP_USER/PASS 없이 getTransporter 호출 시 에러
try {
  // sendEmail은 내부에서 getTransporter를 호출하므로 에러 발생
  await mailer.sendEmail('test@test.com', 'Test', '<p>Test</p>');
  assert(false, '환경변수 없이 sendEmail → 에러 발생해야 함');
} catch (err) {
  assert(err.message.includes('SMTP_USER') || err.message.includes('SMTP_PASS'),
         `환경변수 없이 sendEmail → 적절한 에러: "${err.message.substring(0, 50)}"`);
}

// ── closeTransporter 안전성 ──
console.log('\n🧹 closeTransporter:');
mailer.closeTransporter(); // 이미 null이어도 에러 없이 동작
assert(true, 'closeTransporter 안전하게 호출');
mailer.closeTransporter(); // 중복 호출도 안전
assert(true, 'closeTransporter 중복 호출 안전');

// ── 결과 ──
console.log(`\n───────────────────────────`);
console.log(`결과: ${passed} 통과 / ${failed} 실패`);
console.log(`───────────────────────────\n`);

if (failed > 0) process.exit(1);
