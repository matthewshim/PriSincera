/**
 * 캔델라 퍼블릭 데이터 계약 — 코드화 (P0 산출물)
 *
 * 정본: docs/candela/data_contract.md (v1.3)
 *
 * 설계 원칙
 *   1) 구조적 방어 — 퍼블릭 계약에는 금액·수량 필드가 "존재하지 않는다".
 *      스키마는 알로우리스트다: 정의되지 않은 키는 검증에서 거부된다(unknown-key = error).
 *      존재하지 않는 필드는 실수로 렌더링할 수 없다.
 *   2) 화면은 이 스키마를 통과한 데이터만 소비한다(계약 → 픽스처 → 화면).
 *   3) FORBIDDEN_PUBLIC_KEYS는 2차 방어선 — 혹시라도 섞여 들어온 금액·수량 키를 심층 스캔으로 잡는다.
 *
 * 주의(i18n 게이트): 이 파일의 코드 문자열은 전부 영문이다. 한국어는 주석에만 둔다.
 *   (ci/design-check.mjs가 src/**.mjs 코드 라인의 한글을 ERROR로 차단한다.)
 */

// ── 상수 (계약 고정값) ──
export const SCHEMA_VERSION = 1;
export const MARKETS = ['KRX', 'US'];
export const AGGREGATION = 'weekly';               // D-5 고정값 — daily 불허(포지션 역산 방지)
export const DATA_SOURCES = ['live', 'fixture'];   // dataSource — UI 워터마크 판별의 유일 근거
export const JOURNAL_ACTIONS = ['BUY', 'SELL', 'HOLD'];
export const BENCHMARK_SCOPES = ['KRX', 'US', 'BLENDED'];
export const DOCUMENT_KINDS = ['summary', 'equity_curve', 'journal'];

// 퍼블릭에 절대 실려선 안 되는 키(금액·수량). 소문자 정확 일치로 심층 스캔한다.
export const FORBIDDEN_PUBLIC_KEYS = new Set([
  'quantity', 'qty', 'shares', 'amount', 'avgprice', 'lastprice', 'price',
  'cash', 'balance', 'notional', 'marketvalue', 'pnl', 'unrealizedpnl',
  'equityvalue', 'krwamount', 'won', 'principal', 'nav',
]);

// ── 프리미티브 검증기 ──
const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const isString = (v) => typeof v === 'string' && v.length > 0;
const isNumber = (v) => typeof v === 'number' && Number.isFinite(v);
const isInt = (v) => Number.isInteger(v);
const isNonNegInt = (v) => Number.isInteger(v) && v >= 0;
const isPct = (v) => isNumber(v);                            // 비율 — 음수 허용
const isNonPositive = (v) => isNumber(v) && v <= 0;          // MDD·drawdown 은 항상 0 이하
const isRatio0to100 = (v) => isNumber(v) && v >= 0 && v <= 100;
const isPositive = (v) => isNumber(v) && v > 0;
const isEnum = (set) => (v) => (Array.isArray(set) ? set.includes(v) : set.has(v));
const isIsoDate = (v) => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v);
const isIsoDateTime = (v) => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(v);
const isPeriod = (v) => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}\/\d{4}-\d{2}-\d{2}$/.test(v);
const isNullOr = (fn) => (v) => v === null || fn(v);

/**
 * spec 기반 shape 검증.
 * @param {object} obj   검사 대상
 * @param {object} spec  { key: {check, label} }
 * @param {string} path  에러 경로 프리픽스
 * @param {string[]} errors  누적 배열
 * @param {object} opts  { allowUnknown } — 기본 false(unknown-key = error, 알로우리스트 강제)
 */
function checkShape(obj, spec, path, errors, opts = {}) {
  const allowUnknown = opts.allowUnknown === true;
  if (!isObject(obj)) {
    errors.push(`${path}: expected object`);
    return;
  }
  for (const [key, rule] of Object.entries(spec)) {
    const val = obj[key];
    if (val === undefined) {
      if (!rule.optional) errors.push(`${path}.${key}: missing (${rule.label})`);
      continue;
    }
    if (!rule.check(val)) errors.push(`${path}.${key}: invalid (${rule.label})`);
  }
  if (!allowUnknown) {
    for (const key of Object.keys(obj)) {
      if (!(key in spec)) errors.push(`${path}.${key}: unknown key (not in public contract)`);
    }
  }
}

// ── 심층 금지키 스캔 (2차 방어선) ──
export function scanForbiddenKeys(node, path = 'doc', errors = []) {
  if (Array.isArray(node)) {
    node.forEach((item, i) => scanForbiddenKeys(item, `${path}[${i}]`, errors));
  } else if (isObject(node)) {
    for (const [key, val] of Object.entries(node)) {
      if (FORBIDDEN_PUBLIC_KEYS.has(key.toLowerCase())) {
        errors.push(`${path}.${key}: forbidden public key (amount/quantity must never appear)`);
      }
      scanForbiddenKeys(val, `${path}.${key}`, errors);
    }
  }
  return errors;
}

// ── 공통 봉투(Envelope) ──
const ENVELOPE_SPEC = {
  schemaVersion: { check: (v) => v === SCHEMA_VERSION, label: `=== ${SCHEMA_VERSION}` },
  dataSource: { check: isEnum(DATA_SOURCES), label: DATA_SOURCES.join('|') },
  generatedAt: { check: isIsoDateTime, label: 'ISO datetime' },
  asOf: { check: isIsoDate, label: 'YYYY-MM-DD' },
  baseCurrency: { check: isString, label: 'currency code' },
  markets: { check: (v) => Array.isArray(v) && v.length > 0 && v.every(isEnum(MARKETS)), label: `subset of ${MARKETS}` },
  asOfByMarket: { check: (v) => isObject(v) && Object.values(v).every(isIsoDate), label: 'market -> date' },
  integrity: {
    check: (v) => isObject(v) && isString(v.prevHash) && isString(v.hash),
    label: '{ prevHash, hash }',
  },
};

function checkEnvelope(doc, errors) {
  // 봉투는 문서별 본문 키와 공존하므로 allowUnknown=true (본문은 각 kind 검증기가 담당)
  checkShape(doc, ENVELOPE_SPEC, 'envelope', errors, { allowUnknown: true });
  // asOfByMarket 의 키가 markets 안에 있는지 상호 정합
  if (isObject(doc.asOfByMarket) && Array.isArray(doc.markets)) {
    for (const m of Object.keys(doc.asOfByMarket)) {
      if (!doc.markets.includes(m)) errors.push(`envelope.asOfByMarket.${m}: market not declared in markets[]`);
    }
  }
}

// ── kind: summary ──
const METRICS_SPEC = {
  cumulativeReturnPct: { check: isPct, label: 'pct' },
  cagrPct: { check: isPct, label: 'pct' },
  maxDrawdownPct: { check: isNonPositive, label: 'pct <= 0' },
  sharpe: { check: isNumber, label: 'number' },
  winRatePct: { check: isRatio0to100, label: '0..100' },
  tradeCount: { check: isNonNegInt, label: 'int >= 0' },
  avgHoldingDays: { check: (v) => isNumber(v) && v >= 0, label: '>= 0' },
  exposurePct: { check: isRatio0to100, label: '0..100' },
  fxContributionPct: { check: isPct, label: 'pct' },
};
const BENCHMARK_SPEC = {
  market: { check: isEnum(BENCHMARK_SCOPES), label: BENCHMARK_SCOPES.join('|') },
  name: { check: isString, label: 'string' },
  cumulativeReturnPct: { check: isPct, label: 'pct' },
  maxDrawdownPct: { check: isNonPositive, label: 'pct <= 0' },
};

function checkSummary(doc, errors) {
  if (!isIsoDate(doc.inception)) errors.push('summary.inception: invalid (YYYY-MM-DD)');
  checkShape(doc.metrics, METRICS_SPEC, 'summary.metrics', errors);
  if (!isObject(doc.allocationPct)) {
    errors.push('summary.allocationPct: missing/invalid');
  } else {
    for (const [m, v] of Object.entries(doc.allocationPct)) {
      if (!MARKETS.includes(m)) errors.push(`summary.allocationPct.${m}: unknown market`);
      if (!isRatio0to100(v)) errors.push(`summary.allocationPct.${m}: invalid (0..100)`);
    }
  }
  if (!Array.isArray(doc.benchmarks) || doc.benchmarks.length === 0) {
    errors.push('summary.benchmarks: required non-empty array');
  } else {
    doc.benchmarks.forEach((b, i) => checkShape(b, BENCHMARK_SPEC, `summary.benchmarks[${i}]`, errors));
  }
}

// ── kind: equity_curve ──
const POINT_SPEC = {
  date: { check: isIsoDate, label: 'YYYY-MM-DD' },
  navIndex: { check: isPositive, label: 'number > 0' },
  benchmarkIndex: { check: isPositive, label: 'number > 0' },
  drawdownPct: { check: isNonPositive, label: 'pct <= 0' },
};

function checkEquityCurve(doc, errors) {
  if (!isPositive(doc.baseIndex)) errors.push('equity_curve.baseIndex: invalid (number > 0)');
  if (!isEnum(BENCHMARK_SCOPES)(doc.benchmarkRef)) {
    errors.push(`equity_curve.benchmarkRef: invalid (${BENCHMARK_SCOPES.join('|')})`);
  }
  if (!Array.isArray(doc.points) || doc.points.length === 0) {
    errors.push('equity_curve.points: required non-empty array');
  } else {
    doc.points.forEach((p, i) => checkShape(p, POINT_SPEC, `equity_curve.points[${i}]`, errors));
  }
}

// ── kind: journal ──
const ENTRY_SPEC = {
  period: { check: isPeriod, label: 'YYYY-MM-DD/YYYY-MM-DD' },
  market: { check: isEnum(MARKETS), label: MARKETS.join('|') },
  action: { check: isEnum(JOURNAL_ACTIONS), label: JOURNAL_ACTIONS.join('|') },
  sector: { check: isString, label: 'string' },
  symbol: { check: isNullOr(isString), label: 'string | null' },  // Q-4 미확정: 기본 null
  weightPct: { check: isRatio0to100, label: '0..100' },
  holdingDays: { check: isNonNegInt, label: 'int >= 0' },
  returnPct: { check: isNullOr(isPct), label: 'pct | null (SELL only)' },
  reason: { check: isString, label: 'string' },
};

function checkJournal(doc, errors) {
  if (doc.aggregation !== AGGREGATION) {
    errors.push(`journal.aggregation: must be "${AGGREGATION}" (fixed; daily not allowed)`);
  }
  if (!Array.isArray(doc.entries)) {
    errors.push('journal.entries: required array');
  } else {
    doc.entries.forEach((e, i) => checkShape(e, ENTRY_SPEC, `journal.entries[${i}]`, errors));
  }
}

const KIND_CHECKERS = {
  summary: checkSummary,
  equity_curve: checkEquityCurve,
  journal: checkJournal,
};

/**
 * 퍼블릭 문서 검증 진입점.
 * @param {'summary'|'equity_curve'|'journal'} kind
 * @param {object} doc
 * @returns {{ ok: boolean, errors: string[] }}
 */
export function validateDocument(kind, doc) {
  const errors = [];
  if (!DOCUMENT_KINDS.includes(kind)) {
    return { ok: false, errors: [`unknown document kind: ${kind}`] };
  }
  if (!isObject(doc)) {
    return { ok: false, errors: ['document: expected object'] };
  }
  checkEnvelope(doc, errors);
  KIND_CHECKERS[kind](doc, errors);
  scanForbiddenKeys(doc, kind, errors);   // 2차 방어선
  return { ok: errors.length === 0, errors };
}

/** dataSource 판별 — UI 워터마크(G-3)와 live 전환 게이트(G-4)가 쓴다. */
export function isFixture(doc) {
  return isObject(doc) && doc.dataSource === 'fixture';
}
