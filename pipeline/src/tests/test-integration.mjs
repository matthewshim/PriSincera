#!/usr/bin/env node
/**
 * 전체 통합 테스트 — 모든 Phase 모듈 검증
 *
 * 실행: node pipeline/src/tests/test-integration.mjs
 */

process.env.UNSUBSCRIBE_SECRET = 'integration-test-secret-32bytes!';

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

console.log('\n═══════════════════════════════════════');
console.log('🔗 전체 통합 테스트 — Phase 1~5 모듈 연동');
console.log('═══════════════════════════════════════\n');

// ── Phase 1: subscribers ──
console.log('📦 Phase 1: subscribers.mjs');
const { validateEmail, generateUnsubToken, verifyUnsubToken, buildUnsubscribeUrl } =
  await import('../lib/subscribers.mjs');

assert(validateEmail('test@prisincera.com'), '이메일 검증 통과');
const token = generateUnsubToken('test@prisincera.com');
assert(verifyUnsubToken('test@prisincera.com', token), '토큰 검증 통과');
const unsubUrl = buildUnsubscribeUrl('test@prisincera.com');
assert(unsubUrl.includes('token='), '구독 해지 URL 생성');

// ── Phase 2: email-template ──
console.log('\n📦 Phase 2: email-template.mjs');
const { renderDailyEmail, escapeHtml, formatDateKR } = await import('../lib/email-template.mjs');

const testArticles = [
  {
    id: '1', title: '테스트 아티클 1', url: 'https://example.com/1',
    source: 'TestSource', category: 'ai', tier: 1,
    weightedScore: 18.0, isDmPick: true,
    editorComment: '테스트 코멘트입니다.',
    summary: 'Test summary for article 1.',
  },
  {
    id: '2', title: '테스트 아티클 2', url: 'https://example.com/2',
    source: 'AnotherSource', category: 'product', tier: 2,
    weightedScore: 14.0, isDmPick: false,
    summary: 'Test summary for article 2.',
  },
];

const html = renderDailyEmail({
  date: '2026-04-29',
  articles: testArticles,
  totalCount: 10,
  dailyPageUrl: 'https://www.prisincera.com/prisignal/2026-04-29',
  unsubscribeUrl: unsubUrl,
});

assert(html.includes('<!DOCTYPE html>'), '이메일 HTML 생성');
assert(html.includes('테스트 아티클 1'), '아티클 제목 포함');
assert(html.includes('테스트 코멘트'), '에디터 코멘트 포함');
assert(html.includes('More Signals'), 'More Signals 섹션');
assert(html.includes('prisignal/2026-04-29'), '포털 URL');
assert(html.includes('token='), '개인화 해지 URL');

// ── Phase 3: mailer ──
console.log('\n📦 Phase 3: mailer.mjs');
const mailer = await import('../lib/mailer.mjs');
assert(typeof mailer.sendEmail === 'function', 'sendEmail 존재');
assert(typeof mailer.sendToSubscribers === 'function', 'sendToSubscribers 존재');

// ── Phase 2 + Phase 1 연동: 구독자별 개인화 렌더링 ──
console.log('\n🔗 연동 테스트: 구독자별 개인화 HTML');

const sub1 = 'user1@test.com';
const sub2 = 'user2@test.com';

const html1 = renderDailyEmail({
  date: '2026-04-29', articles: testArticles, totalCount: 10,
  dailyPageUrl: 'https://www.prisincera.com/prisignal/2026-04-29',
  unsubscribeUrl: buildUnsubscribeUrl(sub1),
});

const html2 = renderDailyEmail({
  date: '2026-04-29', articles: testArticles, totalCount: 10,
  dailyPageUrl: 'https://www.prisincera.com/prisignal/2026-04-29',
  unsubscribeUrl: buildUnsubscribeUrl(sub2),
});

// 두 HTML의 해지 URL이 다른지 확인
const url1Match = html1.match(/api\/unsubscribe\?[^"]+/);
const url2Match = html2.match(/api\/unsubscribe\?[^"]+/);
assert(url1Match && url2Match, '두 HTML에 해지 URL 존재');
assert(url1Match[0] !== url2Match[0], '두 구독자의 해지 URL이 서로 다름 (개인화 확인)');

// 본문 내용은 동일한지 확인
assert(html1.includes('테스트 아티클 1') && html2.includes('테스트 아티클 1'),
       '두 HTML의 본문 내용은 동일');

// ── Composer 호환성 테스트: htmlRenderer 패턴 ──
console.log('\n🔗 연동 테스트: Composer htmlRenderer 패턴');

const htmlRenderer = (email) => renderDailyEmail({
  date: '2026-04-29', articles: testArticles, totalCount: 10,
  dailyPageUrl: 'https://www.prisincera.com/prisignal/2026-04-29',
  unsubscribeUrl: buildUnsubscribeUrl(email),
});

const rendered = htmlRenderer('subscriber@example.com');
assert(rendered.includes('<!DOCTYPE html>'), 'htmlRenderer 함수 패턴 동작');
assert(rendered.includes('subscriber%40example.com') || rendered.includes('subscriber@example.com'),
       'htmlRenderer에 구독자 이메일 반영');

// ── 결과 ──
console.log(`\n═══════════════════════════════════════`);
console.log(`통합 테스트 결과: ${passed} 통과 / ${failed} 실패`);
console.log(`═══════════════════════════════════════\n`);

if (failed > 0) process.exit(1);
