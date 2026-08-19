#!/usr/bin/env node
/**
 * 시크릿 스캐너 CLI — git 훅에서 호출된다 (백로그 10-2·10-3·10-4).
 *
 *   node ci/secret-scan.mjs --staged           pre-commit  : 스테이징된 blob 검사
 *   node ci/secret-scan.mjs --message <path>   commit-msg  : 커밋 메시지 검사
 *
 * 셸이 아니라 Node로 작성한 이유: Windows 데스크톱 ↔ macOS 노트북 병행 작업이라
 * bash/PowerShell 차이를 타지 않아야 한다. Node는 양쪽에 모두 있다.
 *
 * 검사 대상은 워킹트리가 아니라 **인덱스(스테이징된 내용)** 다.
 * 커밋되는 것과 검사되는 것이 달라지면 스캐너의 의미가 없다.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { scanBuffer, scanText } from '../src/data/secretPatterns.mjs';

const BINARY_EXT = /\.(png|jpe?g|gif|webp|ico|mp3|wav|woff2?|ttf|eot|pdf|zip|gz|mp4)$/i;

/** 루트 직하 신규 파일은 시크릿 파일이 유입되는 가장 흔한 경로다. */
const ROOT_ALLOW = /^(package(-lock)?\.json|README\.md|\.gitignore|\.gitattributes|Dockerfile|cloudbuild\.yaml|vite\.config\.js|firestore\.rules|[a-z-]+\.mjs)$/;

function git(args) {
  return execFileSync('git', args, { maxBuffer: 64 * 1024 * 1024 });
}

function stagedFiles() {
  const out = git(['diff', '--cached', '--name-only', '--diff-filter=ACM', '-z']).toString('utf8');
  return out.split('\0').filter(Boolean);
}

function addedFiles() {
  const out = git(['diff', '--cached', '--name-only', '--diff-filter=A', '-z']).toString('utf8');
  return out.split('\0').filter(Boolean);
}

function scanStaged() {
  const findings = [];
  for (const file of stagedFiles()) {
    if (BINARY_EXT.test(file)) continue;
    let buf;
    try {
      buf = git(['show', `:${file}`]);
    } catch {
      continue; // 삭제·심볼릭 링크 등
    }
    for (const h of scanBuffer(buf)) findings.push({ file, ...h });
  }

  const rootAdds = addedFiles().filter((f) => !f.includes('/') && !ROOT_ALLOW.test(f));
  return { findings, rootAdds };
}

function fail(lines) {
  console.error('\n\x1b[31m✖ 차단되었습니다 — 시크릿 패턴 탐지\x1b[0m\n');
  for (const l of lines) console.error('  ' + l);
  console.error(`
  이 저장소는 public입니다. push된 시크릿은 force push로도 회수되지 않습니다.
  (GitHub 캐시·포크·아카이브에 영구히 남습니다)

  조치:
    1) 해당 값을 파일에서 제거하고 환경변수 / Secret Manager로 옮기십시오
    2) 오탐이라면 해당 줄 끝에 secret-scan:ignore 주석을 추가하십시오
    3) 이미 유출된 값이라면 즉시 폐기·재발급 — docs/candela/incident_response.md §2
`);
  process.exit(1);
}

/**
 * push 대상 커밋 범위를 검사한다 (pre-push).
 * stdin 형식: "<local ref> <local sha> <remote ref> <remote sha>" 줄 단위.
 */
function scanPush() {
  let stdin = '';
  try {
    stdin = readFileSync(0, 'utf8');
  } catch { /* stdin 없음 */ }

  const findings = [];
  const ZERO = /^0+$/;

  for (const line of stdin.split('\n').filter(Boolean)) {
    const [, localSha, , remoteSha] = line.trim().split(/\s+/);
    if (!localSha || ZERO.test(localSha)) continue; // 브랜치 삭제

    // 신규 브랜치면 원격 main 기준으로 범위를 좁힌다(없으면 최근 50커밋).
    let base = remoteSha;
    if (!base || ZERO.test(base)) {
      try {
        base = git(['merge-base', localSha, 'origin/main']).toString().trim();
      } catch {
        base = `${localSha}~50`;
      }
    }

    let files = [];
    try {
      files = git(['diff', '--name-only', '--diff-filter=ACM', '-z', `${base}..${localSha}`])
        .toString('utf8').split('\0').filter(Boolean);
    } catch { continue; }

    for (const file of files) {
      if (BINARY_EXT.test(file)) continue;
      let buf;
      try { buf = git(['show', `${localSha}:${file}`]); } catch { continue; }
      for (const h of scanBuffer(buf)) findings.push({ file, ...h });
    }
  }
  return findings;
}

const mode = process.argv[2];

if (mode === '--push') {
  const findings = scanPush();
  if (findings.length) {
    fail(findings.map((f) => `${f.file}:${f.line}  [${f.pattern}]  ${f.excerpt}…`));
  }
  process.exit(0);
}

if (mode === '--staged') {
  const { findings, rootAdds } = scanStaged();

  if (rootAdds.length) {
    console.error('\n\x1b[33m⚠ 루트 직하 신규 파일이 스테이징되었습니다\x1b[0m');
    for (const f of rootAdds) console.error('  · ' + f);
    console.error('  시크릿 파일 유입 경로로 가장 흔합니다. 의도한 것인지 확인하십시오.\n');
  }

  if (findings.length) {
    fail(findings.map((f) => `${f.file}:${f.line}  [${f.pattern}]  ${f.excerpt}…`));
  }
  process.exit(0);
}

if (mode === '--message') {
  const path = process.argv[3];
  if (!path) { console.error('사용법: --message <파일경로>'); process.exit(2); }
  const hits = scanText(readFileSync(path, 'utf8'));
  if (hits.length) {
    fail(hits.map((h) => `커밋 메시지 ${h.line}행  [${h.pattern}]  ${h.excerpt}…`));
  }
  process.exit(0);
}

console.error('사용법: node ci/secret-scan.mjs --staged | --message <파일경로>');
process.exit(2);
