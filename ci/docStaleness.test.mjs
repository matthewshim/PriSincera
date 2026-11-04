import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseFrontmatter, toPath, findStale, daysBetween } from './doc-staleness.mjs';

test('frontmatter에서 상태·날짜·대상을 읽고 대상 목록 뒤 필드에서 멈춘다', () => {
  const meta = parseFrontmatter('---\nstatus: active\nlast_updated: 2026-11-04\ntarget_files:\n  - server.mjs\n  - (제거 완료) src/x/\nnote: y\n  - not-a-target\n---\n# t');
  assert.deepEqual(meta, { status: 'active', lastUpdated: '2026-11-04', targets: ['server.mjs'] });
});

test('frontmatter가 없으면 null, target_files: []는 빈 목록', () => {
  assert.equal(parseFrontmatter('# 제목'), null);
  assert.deepEqual(parseFrontmatter('---\nstatus: active\ntarget_files: []  # 없음\n---').targets, []);
});

test('경로가 아닌 항목은 버리고 링크·따옴표·상대 경로는 정리한다', () => {
  assert.equal(toPath('(인프라 — 코드 아님)'), null);
  assert.equal(toPath('src/locales/{ko,en,ja}.json candela'), null);
  assert.equal(toPath('[Header](../../src/Header.jsx)'), 'src/Header.jsx');
  assert.equal(toPath('`server.mjs`'), 'server.mjs');
  assert.equal(toPath('.githooks/'), '.githooks/');
  assert.equal(toPath('src/a.js  # 설명'), 'src/a.js');
});

test('문서보다 나중인 대상만 낡음으로 본다 — 같은 날과 이력 없는 파일은 제외', () => {
  const dates = { same: '2026-11-04', old: '2026-11-01', newer: '2026-11-05', newest: '2026-11-09', none: '' };
  const stale = findStale('2026-11-04', Object.keys(dates), (p) => dates[p]);
  assert.deepEqual(stale.map((s) => s.path), ['newest', 'newer']);
  assert.equal(daysBetween('2026-11-04', '2026-11-09'), 5);
});
