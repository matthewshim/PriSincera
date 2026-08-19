/**
 * design-check — 디자인 시스템 §4-2/§9 타이포 규범 자동 검증 (prebuild 게이트)
 *
 * ERROR(빌드 차단): src CSS의 font-size가
 *   - [0.66rem, 1.0rem) 밴드의 비토큰 리터럴 (ReLearn 사태와 동일 클래스의 마이크로 위반)
 *   - 동일 밴드의 px 값 (10.56px~15.99px)
 * WARN(통과·로그만): 그 외 비토큰 리터럴(헤딩 계열·장식 마이크로 라벨) — §9-7 백로그.
 * 제외: 내부 어드민(AdminDashboard.css, ServiceDocs.css)·index.css의 16px 루트 정의.
 *
 * 근거: docs/core/design_system.md v5.1+ — "font-size는 --fs-* 토큰만, 임의 값 금지"
 *
 * i18n 게이트(2026-08-04): src JSX/JS 소스의 한국어 하드코딩 ERROR.
 *   UI 문자열은 언어팩(src/locales/{ko,en,ja}.json) + t()만 허용 — 조용한 ko 폴백 탓에
 *   누락이 화면에서 안 보이는 문제의 재발 방지책. 예외는 I18N_EXCLUDE(파일 단위) 또는
 *   라인 마커 'i18n-ok'(사유 필수). console.* 개발 로그·주석은 검사하지 않음.
 */
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { execFileSync } from 'child_process';

// ── 시크릿 훅 설치 검증 (fail-closed) ─────────────────────────────────────
// `.git/hooks`는 clone되지 않는다. 즉 새 환경에서 훅의 기본값은 '부재'이고,
// 부재한 훅은 아무 소리 없이 통과한다(fail-open) — 환경을 오가며 작업할 때
// 가장 위험한 성질이다. 저장소를 통해 이동하는 이 게이트가 그 구멍을 막는다:
// 훅이 활성화되지 않은 환경에서는 빌드가 실패하므로 배포도 불가능하다.
// Docker 빌드 컨텍스트는 .dockerignore로 .git이 빠지므로 자동으로 건너뛴다.
(function assertHooksInstalled() {
  let inWorkTree = false;
  try {
    inWorkTree = execFileSync('git', ['rev-parse', '--is-inside-work-tree'], {
      stdio: ['ignore', 'pipe', 'ignore'],
    }).toString().trim() === 'true';
  } catch { /* git 없음 = 컨테이너/CI */ }
  if (!inWorkTree || process.env.CI) return;

  let hooksPath = '';
  try {
    hooksPath = execFileSync('git', ['config', '--get', 'core.hooksPath'], {
      stdio: ['ignore', 'pipe', 'ignore'],
    }).toString().trim();
  } catch { /* 미설정 */ }

  if (hooksPath !== '.githooks') {
    console.error('[design-check] ERROR — 시크릿 스캐너 훅이 활성화되지 않았습니다.');
    console.error('  이 저장소는 public이며, push된 시크릿은 회수할 수 없습니다.');
    console.error('  활성화: npm install   (또는 git config core.hooksPath .githooks)');
    process.exit(1);
  }
})();

const ROOT = 'src';
const EXCLUDE = new Set([
  'src/pages/AdminDashboard.css',        // 내부 어드민 — 별도 관례(§9-7)
  'src/components/admin/ServiceDocs.css',
]);
// v5.6 그리드 전면화: 0.05rem 그리드 위 '등재 토큰 값'만 허용 (전 범위 ERROR)
const TOKENS = new Set([
  '0.5', '0.55', '0.6', '0.65', '0.7', '0.75', '0.8', '0.85', '0.9', '0.95',
  '1', '1.05', '1.1', '1.15', '1.2', '1.25', '1.3', '1.35', '1.4', '1.45',
  '1.5', '1.55', '1.6', '1.7', '1.75', '1.8', '2', '2.2', '2.4', '3',
]);

function* cssFiles(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* cssFiles(p);
    else if (p.endsWith('.css')) yield p;
  }
}

const errors = [];
const warns = [];
for (const file of cssFiles(ROOT)) {
  const rel = file.split('\\').join('/');
  if (EXCLUDE.has(rel)) continue;
  const css = readFileSync(file, 'utf-8').replace(/\r\n/g, '\n'); // CRLF 정규화(Windows 로컬 오탐 방지)
  // §3-3 v5.5: 대역[880,2000]px의 px max-width 리터럴 금지 (--container/--measure 토큰만)
  const wre = /(?<!\()max-width:\s*([0-9]+)px/g;
  let wm;
  while ((wm = wre.exec(css)) !== null) {
    const w = parseInt(wm[1], 10);
    if (w >= 880 && w <= 2000) {
      const line = css.slice(0, wm.index).split('\n').length;
      errors.push(`${rel}:${line} max-width: ${w}px (§3-3 — var(--container)/var(--measure)만 허용)`);
    }
  }
  const re = /font-size:\s*([0-9.]+)(rem|px)/g;
  let m;
  while ((m = re.exec(css)) !== null) {
    const num = parseFloat(m[1]);
    const unit = m[2];
    const remVal = unit === 'px' ? num / 16 : num;
    if (unit === 'rem' && TOKENS.has(String(num))) continue; // 토큰 값 리터럴 허용(토큰 정의부 포함)
    if (unit === 'px' && num === 16) continue;               // html 루트 기준값 허용
    const line = css.slice(0, m.index).split('\n').length;
    errors.push(`${rel}:${line} font-size: ${m[1]}${unit} (§4-2 v5.6 — --fs-* 등재 토큰만 허용)`);
  }
  // v5.13 §9-1 가변 콘텐츠 타이틀 예외: font-size clamp()의 상·하한은 --fs-* 토큰만 허용.
  // 기존 정규식이 'font-size: clamp(' 뒤를 읽지 못하던 사각을 가시화. 유동 중간값(vw/vh/%)은 허용.
  // v5.17: 선재 raw clamp 8곳 전수 토큰화 완료 → ERROR 승격(v5.6 폰트 리터럴 WARN→ERROR 선례와 동일 단계 승격).
  const clampRe = /font-size:\s*clamp\(([^)]*)\)/g;
  let cm;
  while ((cm = clampRe.exec(css)) !== null) {
    const litRe = /([0-9.]+)(rem|px)/g;
    let lm;
    while ((lm = litRe.exec(cm[1])) !== null) {
      const num = parseFloat(lm[1]);
      const unit = lm[2];
      if (unit === 'rem' && TOKENS.has(String(num))) continue; // 토큰 값 리터럴 허용(정의부 등)
      const line = css.slice(0, cm.index).split('\n').length;
      errors.push(`${rel}:${line} font-size: clamp(...${lm[1]}${unit}...) (§9-1 v5.13 — clamp endpoint는 var(--fs-*) 토큰만 허용)`);
    }
  }
}

// ── i18n 게이트: JSX/JS 한국어 하드코딩 검출 ──
const I18N_EXCLUDE = [
  'src/pages/AdminDashboard.jsx',          // 내부 어드민 — ko 단일 운영 결정(2026-08-04)
  'src/components/admin/',                 // 상동
  'src/pages/SylphioLanding.jsx',          // 페이지 내 자체 ko/en/ja 사전 패턴
  'src/pages/SylphioApiKeyGuide.jsx',
  'src/pages/SylphioPrivacy.jsx',
  'src/components/layout/SylphioNav.jsx',
  'src/components/daily/DailyIntro.jsx',   // 고아 컴포넌트 — 2027-01 재검토
  'src/components/daily/DailyCalendar.jsx',// 로케일 삼항 내장(3개 언어 완비) 레거시 패턴
  'src/components/daily/categoryStyles.js',// 데이터 카테고리 매칭 키워드(비 UI)
  'src/contexts/LanguageContext.jsx',      // 언어 셀렉터 네이티브 라벨
  'src/data/seoMeta.mjs',                  // SSR 메타 SSOT — i18n SSR 계획 Phase A 소관
];

function* srcFiles(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* srcFiles(p);
    else if (/\.(jsx|js|mjs)$/.test(p)) yield p;
  }
}

for (const file of srcFiles(ROOT)) {
  const rel = file.split('\\').join('/');
  if (I18N_EXCLUDE.some(x => rel === x || rel.startsWith(x))) continue;
  const src = readFileSync(file, 'utf-8').replace(/\r\n/g, '\n'); // CRLF 정규화 — `.`가 \r를 못 매칭해 주석 스트립이 실패하던 Windows 로컬 오탐 방지
  // 블록 주석은 줄 수를 보존하며 공백화 → 라인 인덱스 정렬 유지
  const noBlock = src.replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '));
  const rawLines = src.split('\n');
  noBlock.split('\n').forEach((l, i) => {
    const code = l.replace(/(^|[^:])\/\/.*$/, '$1'); // 라인 주석 제거(https:// 보호)
    if (!/[가-힣]/.test(code)) return;
    if (rawLines[i].includes('i18n-ok') || code.includes('console.')) return;
    errors.push(`${rel}:${i + 1} 한국어 하드코딩 — 언어팩(t()) 사용 또는 'i18n-ok' 마커(사유 필수)`);
  });
}

if (warns.length) {
  console.warn(`[design-check] WARN ${warns.length}건 (비차단 — §9-7 스케일 확장 백로그):`);
  for (const w of warns) console.warn('  -', w);
}
if (errors.length) {
  console.error(`[design-check] ERROR ${errors.length}건 — 규범 위반(§4-2 타이포 / §3-3 폭 / i18n 언어팩).`);
  for (const e of errors) console.error('  -', e);
  process.exit(1);
}
console.log(`[design-check] PASS — 토큰 규범 준수 (warn ${warns.length}건)`);
