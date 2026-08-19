#!/usr/bin/env node
/**
 * git 훅 활성화 — package.json "prepare"에서 `npm install` 시 자동 실행된다.
 *
 * `.git/hooks`는 clone 대상이 아니므로, 훅을 저장소로 이동시키려면
 * `.githooks/`에 두고 core.hooksPath를 가리키게 하는 방법뿐이다.
 *
 * Node로 작성한 이유: npm은 Windows에서 cmd, macOS에서 sh로 스크립트를 실행한다.
 * 셸 문법(`|| true`)에 의존하면 한쪽에서 깨진다.
 *
 * 실패해도 설치 자체는 막지 않는다(컨테이너 빌드엔 .git이 없다).
 * 훅 부재의 실질적 차단은 prebuild 게이트(ci/design-check.mjs)가 담당한다.
 */
import { execFileSync } from 'node:child_process';
import { chmodSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

try {
  execFileSync('git', ['rev-parse', '--is-inside-work-tree'], { stdio: 'ignore' });
} catch {
  process.exit(0); // git 체크아웃이 아님 (Docker 빌드 등) — 조용히 통과
}

try {
  execFileSync('git', ['config', 'core.hooksPath', '.githooks'], { stdio: 'ignore' });

  // macOS/Linux에서 실행 권한이 필요하다. Windows에서 생성된 파일은 실행 비트가 없다.
  if (process.platform !== 'win32') {
    for (const f of readdirSync('.githooks')) chmodSync(join('.githooks', f), 0o755);
  }
  console.log('[hooks] core.hooksPath → .githooks (시크릿 스캐너 활성)');
} catch (err) {
  console.warn('[hooks] 활성화 실패 — 수동 실행 필요: git config core.hooksPath .githooks');
  console.warn('        ' + err.message);
}
