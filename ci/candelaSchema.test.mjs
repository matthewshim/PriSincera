/**
 * 캔델라 퍼블릭 데이터 계약 유닛 테스트 (P0).
 *
 * 실행: npm run test:candela
 *
 * 목적: 계약(src/data/candela/schema.mjs)이 "금액·수량 부재"와 "알로우리스트"를
 *   실제로 강제하는지 증명한다. 픽스처(P1)·화면(P3)이 이 계약을 신뢰하려면
 *   계약 자체가 먼저 검증되어 있어야 한다(secretPatterns.test.mjs 와 동일 철학).
 *
 * 주의: 코드 문자열은 영문. 한국어는 주석에만.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateDocument, isFixture, scanForbiddenKeys,
  SCHEMA_VERSION, AGGREGATION, FORBIDDEN_PUBLIC_KEYS,
} from '../src/data/candela/schema.mjs';

// ── 공용 유효 픽스처 빌더 ──
const envelope = () => ({
  schemaVersion: SCHEMA_VERSION,
  dataSource: 'fixture',
  generatedAt: '2026-11-21T07:00:00+09:00',
  asOf: '2026-11-20',
  baseCurrency: 'KRW',
  markets: ['KRX', 'US'],
  asOfByMarket: { KRX: '2026-11-20', US: '2026-11-19' },
  integrity: { prevHash: 'sha256:04e8', hash: 'sha256:9f3c' },
});
const validSummary = () => ({
  ...envelope(),
  inception: '2026-06-29',
  metrics: {
    cumulativeReturnPct: 6.1, cagrPct: 12.0, maxDrawdownPct: -14.2, sharpe: 0.63,
    winRatePct: 48.5, tradeCount: 72, avgHoldingDays: 6.8, exposurePct: 58, fxContributionPct: 2.3,
  },
  allocationPct: { KRX: 55, US: 45 },
  benchmarks: [
    { market: 'KRX', name: 'KOSPI', cumulativeReturnPct: -3.2, maxDrawdownPct: -15.1 },
    { market: 'BLENDED', name: 'Blended', cumulativeReturnPct: 1.6, maxDrawdownPct: -12.7 },
  ],
});
const validEquity = () => ({
  ...envelope(),
  baseIndex: 100, benchmarkRef: 'BLENDED',
  points: [
    { date: '2026-06-29', navIndex: 100, benchmarkIndex: 100, drawdownPct: 0 },
    { date: '2026-07-13', navIndex: 101.5, benchmarkIndex: 100.8, drawdownPct: -0.3 },
  ],
});
const validJournal = () => ({
  ...envelope(),
  aggregation: 'weekly',
  entries: [
    { period: '2026-11-16/2026-11-20', market: 'KRX', action: 'BUY', sector: 'Semiconductor',
      symbol: null, weightPct: 8.0, holdingDays: 5, returnPct: null, reason: 'Momentum breakout' },
  ],
});

test('valid documents pass', () => {
  assert.equal(validateDocument('summary', validSummary()).ok, true);
  assert.equal(validateDocument('equity_curve', validEquity()).ok, true);
  assert.equal(validateDocument('journal', validJournal()).ok, true);
});

test('isFixture reflects dataSource', () => {
  assert.equal(isFixture(validSummary()), true);
  assert.equal(isFixture({ ...validSummary(), dataSource: 'live' }), false);
});

test('forbidden money/quantity key is rejected (structural defense)', () => {
  const dirty = validSummary();
  dirty.metrics.avgPrice = 71200;             // 금액 침투 시도
  const r = validateDocument('summary', dirty);
  assert.equal(r.ok, false);
  assert.ok(r.errors.some((e) => /forbidden public key/.test(e)));
});

test('scanForbiddenKeys catches nested amount fields', () => {
  const errs = scanForbiddenKeys({ a: { b: [{ quantity: 12 }] } });
  assert.equal(errs.length, 1);
  assert.ok(FORBIDDEN_PUBLIC_KEYS.has('quantity'));
});

test('unknown key (allowlist) is rejected', () => {
  const doc = validJournal();
  doc.entries[0].secretField = 'x';
  assert.equal(validateDocument('journal', doc).ok, false);
});

test('journal aggregation is fixed to weekly', () => {
  assert.equal(validateDocument('journal', { ...validJournal(), aggregation: 'daily' }).ok, false);
});

test('maxDrawdownPct must be <= 0', () => {
  const doc = validSummary();
  doc.metrics.maxDrawdownPct = 3;
  assert.equal(validateDocument('summary', doc).ok, false);
});

test('asOfByMarket must reference declared markets', () => {
  assert.equal(validateDocument('summary', { ...validSummary(), asOfByMarket: { JP: '2026-11-20' } }).ok, false);
});

test('schemaVersion mismatch is rejected', () => {
  assert.equal(validateDocument('summary', { ...validSummary(), schemaVersion: 2 }).ok, false);
});

test('unknown document kind is rejected', () => {
  assert.equal(validateDocument('positions', validSummary()).ok, false);
});
