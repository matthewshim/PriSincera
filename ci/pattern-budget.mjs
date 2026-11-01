#!/usr/bin/env node
/**
 * pattern-budget — AI 패턴 '장식 예산' 집행 게이트 (prebuild)
 *
 * [왜 임계값이 아니라 래칫(ratchet)인가]
 * 목표값으로 임계를 걸면 지금 당장 빌드가 깨지고, 현재값으로 걸면 아무것도 개선되지
 * 않는다. 그래서 **단조 감소만 허용**하는 래칫을 쓴다:
 *   - 현재값 > 기준선  → ERROR (빌드 차단). 재유입을 막는다.
 *   - 현재값 < 기준선  → PASS + 기준선 하향 안내. `--update`로 조여 넣는다.
 *   - 현재값 = 기준선  → PASS.
 * 즉 "더 나빠질 수는 없고, 좋아지면 그 자리가 새 바닥이 된다."
 *
 * [왜 이게 P1·P2보다 먼저인가]
 * design_system 리비전 25회가 전부 '지적 → 조항 추가'였고 그래서 규범은 두꺼워졌는데
 * 품질은 그대로였다(ai_pattern_audit.md §2-8). 조항은 사람이 기억해야 집행되지만
 * 래칫은 기억을 요구하지 않는다. 정리를 먼저 하고 장치를 나중에 만들면, 다음 생성
 * 사이클에서 같은 패턴이 조용히 되돌아온다.
 *
 * 사용:
 *   node ci/pattern-budget.mjs            # 검사 (prebuild에서 자동 실행)
 *   node ci/pattern-budget.mjs --update   # 개선분을 기준선에 반영(조이기)
 *   node ci/pattern-budget.mjs --report   # 목표까지 남은 거리 표
 *
 * 기준선·목표 정본: ci/pattern-budget.json
 * 수치 정의 정본:   ci/pattern-metrics.mjs
 */
import { readFileSync, writeFileSync } from 'fs';
import { collect } from './pattern-metrics.mjs';

const BUDGET_PATH = 'ci/pattern-budget.json';
const budget = JSON.parse(readFileSync(BUDGET_PATH, 'utf-8'));
const { metrics, detail } = collect();

const update = process.argv.includes('--update');
const report = process.argv.includes('--report');

const errors = [];
const improved = [];
const held = [];

for (const [key, spec] of Object.entries(budget.metrics)) {
  const cur = metrics[key];
  if (cur === undefined) { errors.push(`${key}: 측정기에 해당 지표가 없습니다 (pattern-metrics.mjs와 불일치)`); continue; }
  const { max, target, note } = spec;
  if (cur > max) {
    errors.push(
      `${key}: ${cur} > 기준선 ${max}  (목표 ${target})` +
      (note ? `\n      ↳ ${note}` : '') +
      `\n      ↳ 이 지표는 단조 감소만 허용됩니다. 늘려야 할 이유가 있다면 ${BUDGET_PATH}의 max를` +
      `\n        **사유 주석과 함께** 올리고, 계획서(docs/core/ai_pattern_remediation_plan.md)에 기록하십시오.`
    );
  } else if (cur < max) {
    improved.push([key, max, cur, target]);
    if (update) spec.max = cur;
  } else {
    held.push([key, cur, target]);
  }
}

/* 하드 규칙: 0 유지 — 래칫이 아니라 절대 금지 */
for (const [key, label] of Object.entries(budget.zeroRules)) {
  const cur = metrics[key];
  if (cur !== 0) {
    let extra = '';
    if (key === 'keyframes-duplicate') extra = `\n      ↳ 중복: ${detail.keyframesDuplicate.join(', ')} — CSS 키프레임은 전역 스코프라 마지막 선언이 전역을 덮습니다(조용한 사고).`;
    if (key === 'phantom-font') extra = `\n      ↳ 유령 폰트: ${detail.phantomFonts.join(', ')} — index.html이 요청하지 않는 웹폰트를 CSS가 참조하고 있습니다.`;
    errors.push(`${key}: ${cur} ≠ 0 — ${label}${extra}`);
  }
}

/* 참고치(비율 지표) — 집행하지 않는다.
   비율은 분모가 줄면 오르므로 단조 감소를 보장할 수 없다: 죽은 CSS를 삭제하면
   '나빠진 것이 없는데' 비율이 올라 빌드가 막힌다(2026-11-01 실제 발생).
   래칫은 절대 개수에만 적용하고, 비율은 보고만 한다. */
const info = Object.entries(budget.informational || {}).filter(([k]) => !k.startsWith('_'));

if (report) {
  console.log('\n[pattern-budget] 목표까지 남은 거리\n');
  const rows = Object.entries(budget.metrics).map(([k, s]) => [k, metrics[k], s.max, s.target]);
  const pad = Math.max(...rows.map(([k]) => k.length));
  console.log(`  ${'지표'.padEnd(pad)}  현재   기준선   목표   남은거리`);
  for (const [k, cur, max, target] of rows) {
    const gap = cur - target;
    console.log(`  ${k.padEnd(pad)}  ${String(cur).padStart(4)}  ${String(max).padStart(6)}  ${String(target).padStart(5)}  ${gap > 0 ? String(gap).padStart(7) : '      ✅'}`);
  }
  if (info.length) {
    console.log('  — 참고치(집행 안 함) —');
    for (const [k, spec] of info) console.log(`  ${k.padEnd(pad)}  ${String(metrics[k]).padStart(4)}  ${' '.repeat(6)}  ${String(spec.target).padStart(5)}`);
  }
  console.log('');
  process.exit(0);
}

if (update) {
  budget.updatedAt = new Date().toISOString().slice(0, 10);
  writeFileSync(BUDGET_PATH, JSON.stringify(budget, null, 2) + '\n');
  console.log(`[pattern-budget] 기준선 조임 — ${improved.length}개 지표 하향`);
  improved.forEach(([k, was, now]) => console.log(`  ${k}: ${was} → ${now}`));
  if (!improved.length) console.log('  (개선분 없음)');
  process.exit(0);
}

if (errors.length) {
  console.error(`\n[pattern-budget] ERROR — 장식 예산 초과 ${errors.length}건\n`);
  errors.forEach((e) => console.error(`  ✗ ${e}\n`));
  console.error(`  근거: docs/core/ai_pattern_audit.md · 계획: docs/core/ai_pattern_remediation_plan.md §6 P4-2\n`);
  process.exit(1);
}

console.log(`[pattern-budget] PASS — 예산 준수 (유지 ${held.length} · 개선 ${improved.length}${info.length ? ` · 참고치 ${info.length}` : ''})`);
if (improved.length) {
  improved.forEach(([k, was, now, target]) => console.log(`  ↓ ${k}: ${was} → ${now} (목표 ${target})`));
  console.log(`  기준선을 조이십시오: node ci/pattern-budget.mjs --update`);
}
