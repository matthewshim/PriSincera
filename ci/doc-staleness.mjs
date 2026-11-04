#!/usr/bin/env node
/**
 * doc-staleness — 문서 최신성 경고 (prebuild, 비차단)
 *
 * active 문서의 target_files가 문서의 last_updated보다 나중에 커밋되었으면 경고한다.
 * 코드 변경이 곧 문서 오류는 아니므로 빌드를 막지 않는다. 항상 exit 0.
 *
 * 비교 단위는 날짜다. 같은 날의 변경은 낡은 것으로 보지 않는다.
 * Docker 빌드에는 .git이 없으므로(.dockerignore) 그 경우 검사를 건너뛴다.
 *
 * 사용:
 *   node ci/doc-staleness.mjs             # 요약 + 차이가 큰 5건
 *   node ci/doc-staleness.mjs --verbose   # 전체 목록
 */
import { execFileSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { normalize } from 'path';

const SUMMARY_LIMIT = 5;

/** frontmatter에서 status, last_updated, target_files 경로를 읽는다. 없으면 null. */
export function parseFrontmatter(text) {
  const block = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!block) return null;
  const field = (name) => block[1].match(new RegExp(`^${name}:\\s*(\\S+)`, 'm'))?.[1] ?? null;
  const targets = [];
  let inTargets = false;
  for (const line of block[1].split(/\r?\n/)) {
    if (/^target_files:/.test(line)) { inTargets = true; continue; }
    if (!inTargets) continue;
    const item = line.match(/^\s*-\s+(.*)$/);
    if (!item) { if (line.trim()) inTargets = false; continue; }
    const path = toPath(item[1]);
    if (path) targets.push(path);
  }
  return { status: field('status'), lastUpdated: field('last_updated'), targets };
}

/** 목록 항목을 저장소 경로로 바꾼다. "(제거 완료) ..."나 설명문처럼 경로가 아니면 null. */
export function toPath(raw) {
  let value = raw.replace(/\s+#.*$/, '').trim();
  const link = value.match(/^\[[^\]]*\]\(([^)]+)\)$/);
  if (link) value = link[1];
  value = value.replace(/^['"`]|['"`]$/g, '');
  if (!value || value.startsWith('(') || /[\s{}]/.test(value)) return null;
  return normalize(value).replace(/^(\.\.\/)+/, '');
}

/** 대상 중 문서보다 나중에 바뀐 것을 최근순으로 돌려준다. */
export function findStale(lastUpdated, targets, lastCommitDate) {
  return targets
    .map((path) => ({ path, date: lastCommitDate(path) }))
    .filter(({ date }) => date && date > lastUpdated)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function daysBetween(from, to) {
  return Math.round((Date.parse(to) - Date.parse(from)) / 86400000);
}

function git(...args) {
  return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
}

function main() {
  let files;
  try {
    files = git('ls-files', '-z', '--', 'docs').split('\0').filter((f) => f.endsWith('.md'));
  } catch {
    console.log('[doc-staleness] SKIP — git 저장소가 아니다');
    return;
  }

  const cache = new Map();
  const lastCommitDate = (path) => {
    if (!cache.has(path)) cache.set(path, git('log', '-1', '--format=%cs', '--', path));
    return cache.get(path);
  };

  const stale = [];
  const missing = [];
  let checked = 0;
  for (const file of files) {
    const meta = parseFrontmatter(readFileSync(file, 'utf8'));
    if (meta?.status !== 'active' || !meta.lastUpdated || meta.targets.length === 0) continue;
    checked += 1;
    for (const path of meta.targets) {
      if (!path.includes('*') && !existsSync(path)) missing.push({ file, path });
    }
    const changed = findStale(meta.lastUpdated, meta.targets, lastCommitDate);
    if (changed.length > 0) {
      stale.push({ file, lastUpdated: meta.lastUpdated, changed, days: daysBetween(meta.lastUpdated, changed[0].date) });
    }
  }

  stale.sort((a, b) => b.days - a.days);
  const verbose = process.argv.includes('--verbose');
  console.log(`[doc-staleness] active 문서 ${checked}건 검사 — 낡음 의심 ${stale.length}건, 없는 대상 경로 ${missing.length}건 (비차단)`);
  for (const s of verbose ? stale : stale.slice(0, SUMMARY_LIMIT)) {
    console.log(`  - ${s.file} (${s.lastUpdated}, ${s.days}일 뒤처짐): ${s.changed.slice(0, verbose ? undefined : 3).map((c) => c.path).join(', ')}`);
  }
  if (verbose) for (const m of missing) console.log(`  - 없는 경로: ${m.file} -> ${m.path}`);
  else if (stale.length > SUMMARY_LIMIT || missing.length > 0) console.log('  전체 목록: npm run docs:staleness');
}

if (process.argv[1]?.endsWith('doc-staleness.mjs')) main();
