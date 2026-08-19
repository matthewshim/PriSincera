#!/usr/bin/env node
/**
 * git 훅 활성화 — `.git/hooks`는 clone 대상이 아니므로, 훅을 저장소로 이동시키려면
 * `.githooks/`에 두고 core.hooksPath를 가리키게 하는 방법뿐이다.
 * 그런데 core.hooksPath는 git config라서 **클론마다 로컬**이다.
 * Windows 데스크톱 ↔ macOS 노트북을 오가는 구조에서는 새 머신의 기본값이
 * 항상 '훅 부재'이고, 부재한 훅은 아무 소리 없이 통과한다(fail-open).
 *
 * 이 스크립트를 부르는 곳 (여러 진입점으로 망을 겹친다):
 *   1. package.json "prepare"        — npm install 시
 *   2. .claude/settings.json SessionStart — Claude Code 세션 시작 시 (settings.json은 git으로 이동)
 *   3. .claude/settings.json PreToolUse   — git commit/push 직전 (--assert)
 *   4. .githooks/post-merge          — git pull 이후 (이미 활성인 경우의 자가 치유)
 *
 * Node로 작성한 이유: npm은 Windows에서 cmd, macOS에서 sh로 스크립트를 실행한다.
 * 셸 문법(`|| true`)에 의존하면 한쪽에서 깨진다.
 */
import { execFileSync } from 'node:child_process';
import { chmodSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ASSERT = process.argv.includes('--assert');
const WANT = '.githooks';

function git(args) {
  return execFileSync('git', args, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
}

/** PreToolUse 계약에 맞춰 차단 결정을 내보낸다. */
function deny(reason) {
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'deny',
      permissionDecisionReason: reason,
    },
  }));
  process.exit(0);
}

// git 체크아웃이 아니면(컨테이너 빌드 등) 아무것도 하지 않는다.
try {
  if (git(['rev-parse', '--is-inside-work-tree']) !== 'true') process.exit(0);
} catch {
  process.exit(0);
}

let current = '';
try { current = git(['config', '--get', 'core.hooksPath']); } catch { /* 미설정 */ }

if (current === WANT) process.exit(0); // 이미 활성 — 조용히 통과(세션마다 로그를 남기지 않는다)

if (!existsSync(WANT)) {
  const msg = `${WANT}/ 디렉터리가 없습니다. git pull로 훅 파일을 먼저 받으십시오.`;
  if (ASSERT) deny(`시크릿 스캐너를 활성화할 수 없습니다 — ${msg}`);
  console.warn('[hooks] ' + msg);
  process.exit(0);
}

try {
  git(['config', 'core.hooksPath', WANT]);
  // macOS/Linux는 실행 권한이 필요하다. Windows에서 만들어진 파일엔 실행 비트가 없다.
  if (process.platform !== 'win32') {
    for (const f of readdirSync(WANT)) chmodSync(join(WANT, f), 0o755);
  }
  if (git(['config', '--get', 'core.hooksPath']) !== WANT) throw new Error('설정 후 검증 실패');
  console.error('[hooks] 시크릿 스캐너를 활성화했습니다 (core.hooksPath → .githooks)');
} catch (err) {
  const msg = `git config core.hooksPath ${WANT} 실행 실패 — ${err.message}`;
  if (ASSERT) {
    deny(
      '시크릿 스캐너 훅이 활성화되지 않아 커밋을 차단했습니다.\n' +
      '이 저장소는 public이며, push된 시크릿은 회수할 수 없습니다.\n' +
      `수동 활성화: git config core.hooksPath ${WANT}\n(원인: ${msg})`
    );
  }
  console.warn('[hooks] ' + msg);
}
