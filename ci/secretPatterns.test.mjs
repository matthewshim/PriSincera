/**
 * 시크릿 패턴 유닛 테스트 (백로그 10-1).
 *
 * 실행: npm run test:secrets
 *
 * 이 테스트가 통과하기 전에는 pre-commit 훅을 설치하지 않는다.
 * 검증되지 않은 스캐너를 훅에 걸면 "검사하고 있다"는 잘못된 안심만 생기고,
 * 그건 검사가 아예 없는 것보다 나쁘다.
 *
 * ⚠️ 픽스처 작성 규칙 — 반드시 **문자열 연결**로 만들 것.
 * 값은 전부 가짜지만 형식이 진짜라서, 소스에 리터럴로 두면 GitHub Push Protection이
 * 실제로 푸시를 거부한다(2026-08-19 실제 발생: Slack 토큰 픽스처로 push 차단).
 * 접두어를 쪼개 두면 런타임 문자열은 동일해 테스트는 그대로 유효하고,
 * 파일 텍스트에는 탐지 가능한 리터럴이 남지 않는다.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scanText, scanBuffer } from '../src/data/secretPatterns.mjs';

const hit = (s) => scanText(s).length > 0;

// ── positive: 반드시 잡아야 하는 것 ──────────────────────────────
test('접두어 있는 제공자 키', () => {
  assert.ok(hit('const k = "' + 'AIza' + 'SyD-0123456789abcdefghijklmnopqrstuv"'), 'Google API Key');
  assert.ok(hit('token: ' + 'ghp' + '_0123456789abcdefghijklmnopqrstuvwxyz'), 'GitHub classic PAT');
  assert.ok(hit('github' + '_pat_' + 'A'.repeat(60)), 'GitHub fine-grained PAT');
  assert.ok(hit('xox' + 'b-1234567890-abcdefghijklmnop'), 'Slack token');
  assert.ok(hit('AKIA' + 'IOSFODNN7EXAMPLE'), 'AWS Access Key ID');
  assert.ok(hit('-----BEGIN ' + 'RSA PRIVATE KEY-----'), 'Private key block');
  assert.ok(hit('{ "type": "' + 'service_account", "project_id": "x" }'), 'GCP 서비스 계정 JSON');
});

test('접두어 없는 시크릿 — 대입 형태', () => {
  // 한국투자증권 APP_KEY/APP_SECRET는 고유 접두어가 없다. 이 케이스가 핵심.
  assert.ok(hit('APP_KEY' + '=PSxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'), '한투 APP_KEY');
  assert.ok(hit('APP_SECRET' + ' = "abcdefghijklmnopqrstuvwxyz0123456789"'), '한투 APP_SECRET');
  assert.ok(hit('KIS_ACCOUNT_TOKEN' + ': aaaaaaaaaaaaaaaaaaaaaaaa'), 'KIS_* 계열');
  assert.ok(hit('SMTP_PASS' + '=abcdefghijklmnopqrstuvwx'), 'SMTP 비밀번호');
  assert.ok(hit('UNSUBSCRIBE_SECRET' + '="0123456789abcdefghijklmn"'), '언서브 시크릿');
  assert.ok(hit('client_secret' + ": 'GOCSPX" + "-abcdefghijklmnopqrstuv'"), 'OAuth client secret');
});

test('증권 종합계좌번호', () => {
  assert.ok(hit('계좌: 1234' + '5678-01'), '8-2 형식');
});

// ── negative: 막으면 안 되는 것 (오탐 방지) ──────────────────────
test('정상 코드·문서는 통과', () => {
  assert.ok(!hit('const key = process.env.GEMINI_API_KEY;'), 'env 참조');
  assert.ok(!hit('APP_KEY=<your-key-here>'), '플레이스홀더');
  assert.ok(!hit('APP_KEY=""'), '빈 값');
  assert.ok(!hit('| 10-5 | GitHub Push Protection 활성화 |'), '백로그 표');
  assert.ok(!hit('git commit -m "fix(relearn): 스크롤바 적용"'), '커밋 메시지');
  assert.ok(!hit('build 96a5725d-74d2-4fbd-a704-be32b4452593'), 'GCP 빌드 UUID');
  assert.ok(!hit('sha256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4'), '해시');
  assert.ok(!hit('2026-08-19 릴리스'), 'ISO 날짜');
  assert.ok(!hit('버전 v5.9 · 12345678자'), '숫자 나열');
});

test('IGNORE_MARKER로 예외 처리 가능', () => {
  assert.ok(!hit('APP_KEY' + '=PSxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx // secret-scan' + ':ignore'));
});

// ── 인코딩: UTF-8만 읽으면 놓치는 케이스 ─────────────────────────
test('UTF-16LE 파일 내 시크릿도 탐지', () => {
  const buf = Buffer.from('APP_SECRET' + '=abcdefghijklmnopqrstuvwxyz0123', 'utf16le');
  assert.equal(scanText(buf.toString('utf8')).length, 0, 'UTF-8 해석으로는 못 잡는 것이 전제');
  assert.ok(scanBuffer(buf).length > 0, 'scanBuffer는 UTF-16으로도 해석해 탐지해야 함');
});

test('탐지 결과에 원값이 노출되지 않음', () => {
  const [h] = scanText('APP_KEY' + '=PSsupersecretvalue0123456789');
  assert.ok(h, '탐지되어야 함');
  assert.ok(!h.excerpt.includes('supersecretvalue'), '발췌에 원값이 남으면 안 됨');
});
