#!/usr/bin/env node
/**
 * Phase 1 단위 테스트: subscribers.mjs
 *
 * 로컬에서 GCS 없이 순수 로직만 테스트합니다.
 * - 이메일 검증
 * - HMAC 토큰 생성/검증
 * - 구독 해지 URL 빌드
 *
 * 실행: node pipeline/src/tests/test-subscribers.mjs
 */

// UNSUBSCRIBE_SECRET 설정 (테스트용)
process.env.UNSUBSCRIBE_SECRET = 'test-secret-key-32bytes-abcdef01';

import { validateEmail, generateUnsubToken, verifyUnsubToken, buildUnsubscribeUrl } from '../lib/subscribers.mjs';

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

console.log('\n═══ Phase 1: subscribers.mjs 단위 테스트 ═══\n');

// ── 이메일 검증 테스트 ──

console.log('📧 이메일 검증:');
assert(validateEmail('user@example.com') === true, 'user@example.com → 유효');
assert(validateEmail('matthew.shim@prisincera.com') === true, 'matthew.shim@prisincera.com → 유효');
assert(validateEmail('a+tag@sub.domain.com') === true, 'a+tag@sub.domain.com → 유효');
assert(validateEmail('') === false, '빈 문자열 → 무효');
assert(validateEmail(null) === false, 'null → 무효');
assert(validateEmail(undefined) === false, 'undefined → 무효');
assert(validateEmail('no-at-sign') === false, 'no-at-sign → 무효');
assert(validateEmail('@no-local.com') === false, '@no-local.com → 무효');
assert(validateEmail('no-domain@') === false, 'no-domain@ → 무효');
assert(validateEmail('has space@x.com') === false, 'has space@x.com → 무효');

// ── HMAC 토큰 테스트 ──

console.log('\n🔑 HMAC 토큰 생성/검증:');
const email1 = 'test@example.com';
const token1 = generateUnsubToken(email1);
assert(typeof token1 === 'string', '토큰이 문자열');
assert(token1.length === 64, '토큰 길이 64 (SHA-256 hex)');
assert(verifyUnsubToken(email1, token1) === true, '올바른 토큰 검증 성공');
assert(verifyUnsubToken(email1, 'wrong-token') === false, '잘못된 토큰 검증 실패');
assert(verifyUnsubToken('other@example.com', token1) === false, '다른 이메일로 검증 실패');

// 대소문자 무관성 테스트
const tokenUpper = generateUnsubToken('TEST@EXAMPLE.COM');
assert(token1 === tokenUpper, '대소문자 무관 동일 토큰 생성');

// 빈 값 테스트
assert(verifyUnsubToken('', token1) === false, '빈 이메일 검증 실패');
assert(verifyUnsubToken(email1, '') === false, '빈 토큰 검증 실패');
assert(verifyUnsubToken(null, null) === false, 'null 검증 실패');

// ── 구독 해지 URL 테스트 ──

console.log('\n🔗 구독 해지 URL:');
const url = buildUnsubscribeUrl('user@example.com');
assert(url.startsWith('https://www.prisincera.com/api/unsubscribe?'), 'URL 프리픽스 확인');
assert(url.includes('email=user%40example.com'), 'URL에 인코딩된 이메일 포함');
assert(url.includes('token='), 'URL에 토큰 포함');

// URL에서 토큰 추출 후 검증
const urlParams = new URLSearchParams(url.split('?')[1]);
const urlEmail = urlParams.get('email');
const urlToken = urlParams.get('token');
assert(verifyUnsubToken(urlEmail, urlToken) === true, 'URL에서 추출한 토큰 검증 성공');

// ── 결과 ──

console.log(`\n───────────────────────────`);
console.log(`결과: ${passed} 통과 / ${failed} 실패`);
console.log(`───────────────────────────\n`);

if (failed > 0) process.exit(1);
