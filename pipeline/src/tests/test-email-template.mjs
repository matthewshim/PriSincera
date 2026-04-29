#!/usr/bin/env node
/**
 * Phase 2 단위 테스트: email-template.mjs
 *
 * 실행: node pipeline/src/tests/test-email-template.mjs
 */
import { renderDailyEmail, escapeHtml, formatDateKR, CATEGORY_ICONS } from '../lib/email-template.mjs';
import { writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

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

console.log('\n═══ Phase 2: email-template.mjs 단위 테스트 ═══\n');

// ── Helper 함수 테스트 ──

console.log('🔧 Helper 함수:');
assert(escapeHtml('<script>') === '&lt;script&gt;', 'HTML 이스케이프: <script>');
assert(escapeHtml('"quotes"') === '&quot;quotes&quot;', 'HTML 이스케이프: quotes');
assert(escapeHtml('a&b') === 'a&amp;b', 'HTML 이스케이프: &');
assert(escapeHtml(null) === '', 'null → 빈 문자열');
assert(escapeHtml('') === '', '빈 문자열 → 빈 문자열');

assert(formatDateKR('2026-04-29') === '4월 29일 (수)', '날짜 포맷: 2026-04-29 → 4월 29일 (수)');
assert(formatDateKR('2026-05-01') === '5월 1일 (금)', '날짜 포맷: 2026-05-01 → 5월 1일 (금)');

assert(CATEGORY_ICONS.attitude === '🎯', '카테고리 아이콘: attitude');
assert(CATEGORY_ICONS.ai === '🤖', '카테고리 아이콘: ai');

// ── 렌더링 테스트 (실제 데이터 시뮬레이션) ──

console.log('\n📧 이메일 렌더링:');

const mockArticles = [
  {
    id: '1', title: 'AI 혁신의 미래', url: 'https://example.com/1',
    source: 'MIT Tech Review', category: 'ai', tier: 1,
    weightedScore: 18.5, isDmPick: true,
    editorComment: '주목할 만한 AI 트렌드를 분석한 기사입니다.',
    summary: 'AI technology is advancing rapidly with new breakthroughs.',
  },
  {
    id: '2', title: '리더십과 조직 문화', url: 'https://example.com/2',
    source: 'HBR', category: 'attitude', tier: 1,
    weightedScore: 17.0, isDmPick: true,
    editorComment: '조직 문화에 대한 깊은 통찰을 제공합니다.',
    summary: 'Leadership matters more than ever.',
  },
  {
    id: '3', title: '글로벌 경제 전망', url: 'https://example.com/3',
    source: 'The Economist', category: 'global', tier: 1,
    weightedScore: 16.0, isDmPick: true,
    editorComment: null,
    summary: 'Global economic outlook remains uncertain.',
  },
  {
    id: '4', title: '프로덕트 로드맵 설계', url: 'https://example.com/4',
    source: 'Lenny', category: 'product', tier: 2,
    weightedScore: 15.0, isDmPick: false,
    summary: 'How to build better product roadmaps.',
  },
  {
    id: '5', title: '전략적 우선순위', url: 'https://example.com/5',
    source: 'Stratechery', category: 'priority', tier: 1,
    weightedScore: 14.0, isDmPick: false,
    summary: 'Setting priorities in a fast-changing world.',
  },
  {
    id: '6', title: '디지털 트랜스포메이션', url: 'https://example.com/6',
    source: 'WIRED', category: 'global', tier: 2,
    weightedScore: 14.0, isDmPick: false,
    summary: 'Digital transformation across industries.',
  },
];

const html = renderDailyEmail({
  date: '2026-04-29',
  articles: mockArticles,
  totalCount: 16,
  dailyPageUrl: 'https://www.prisincera.com/prisignal/2026-04-29',
  unsubscribeUrl: 'https://www.prisincera.com/api/unsubscribe?email=test%40example.com&token=abc123',
});

// 구조 검증
assert(html.startsWith('<!DOCTYPE html>'), 'DOCTYPE 선언 포함');
assert(html.includes('</html>'), 'HTML 닫는 태그 포함');
assert(html.includes('<meta charset="UTF-8">'), 'charset 메타 포함');
assert(html.includes('color-scheme'), 'color-scheme 메타 포함');

// 헤더 검증
assert(html.includes('PriSignal'), 'PriSignal 헤더 포함');
assert(html.includes('Pri<span style="color:#C084FC;">Signal</span>'), '브랜드 컬러 스판');
assert(html.includes('노이즈 속에서 시그널을 포착하다'), '서브타이틀 포함');

// 날짜 + 통계 검증
assert(html.includes('4월 29일 (수)'), '한국어 날짜 포함');
assert(html.includes('전체 16건'), '전체 건수 통계');
assert(html.includes('DM Pick 3'), 'DM Pick 수');
assert(html.includes('카테고리'), '카테고리 수 통계');

// DM Pick 카드 검증
assert(html.includes('DM Pick — 오늘의 핵심 시그널'), 'DM Pick 섹션 제목');
assert(html.includes('AI 혁신의 미래'), 'DM Pick 아티클 제목 포함');
assert(html.includes('DM Pick · AI &amp; Future'), 'DM Pick 배지 (AI)');
assert(html.includes('DM Pick · Attitude'), 'DM Pick 배지 (Attitude)');
assert(html.includes('주목할 만한 AI 트렌드'), '에디터 코멘트 포함');
assert(html.includes('href="https://example.com/1"'), 'CTA 링크 포함');
assert(html.includes('→ 원문 읽기'), 'CTA 텍스트 포함');

// More Signals 검증
assert(html.includes('More Signals'), 'More Signals 섹션');
assert(html.includes('프로덕트 로드맵 설계'), '비DM 아티클 포함');
assert(html.includes('Product Craft'), '프로덕트 카테고리명');
assert(html.includes('전략적 우선순위'), '우선순위 아티클 포함');

// Portal CTA 검증
assert(html.includes('오늘의 전체 시그널을 확인하세요'), '포털 CTA 텍스트');
assert(html.includes('prisignal/2026-04-29'), '포털 URL');
assert(html.includes('데일리 포털에서 확인하기'), 'CTA 버튼 텍스트');

// Footer 검증
assert(html.includes('prisincera.com'), '사이트 링크');
assert(html.includes('구독을 해지'), '구독 해지 텍스트');
assert(html.includes('token=abc123'), '해지 토큰 포함');
assert(html.includes('Sincerity, Prioritized'), '브랜드 태그라인');

// XSS 방지 검증
console.log('\n🛡️ XSS 방지:');
const xssArticles = [{
  id: 'xss', title: '<script>alert("XSS")</script>', url: 'javascript:void(0)',
  source: '<img onerror="hack">', category: 'ai', tier: 1,
  weightedScore: 20, isDmPick: true,
  editorComment: '<a href="evil">click</a>',
  summary: 'Normal summary',
}];
const xssHtml = renderDailyEmail({
  date: '2026-04-29', articles: xssArticles, totalCount: 1,
  dailyPageUrl: 'https://www.prisincera.com/prisignal/2026-04-29',
  unsubscribeUrl: 'https://www.prisincera.com/api/unsubscribe?email=x&token=y',
});
assert(!xssHtml.includes('<script>'), 'script 태그 이스케이프됨');
assert(xssHtml.includes('&lt;script&gt;'), 'script → 이스케이프된 형태');
assert(!xssHtml.includes('<img '), 'img 태그가 직접 삽입되지 않음');

// 파일 출력 (시각 검증용)
const outPath = join(__dirname, '..', '..', '..', 'docs', 'prisignal-email-test-output.html');
writeFileSync(outPath, html, 'utf-8');
console.log(`\n📄 시각 검증용 HTML 출력: docs/prisignal-email-test-output.html`);

// ── 결과 ──
console.log(`\n───────────────────────────`);
console.log(`결과: ${passed} 통과 / ${failed} 실패`);
console.log(`───────────────────────────\n`);

if (failed > 0) process.exit(1);
