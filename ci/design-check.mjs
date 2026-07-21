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
 */
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

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
  const css = readFileSync(file, 'utf-8');
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
}

if (warns.length) {
  console.warn(`[design-check] WARN ${warns.length}건 (비차단 — §9-7 스케일 확장 백로그):`);
  for (const w of warns) console.warn('  -', w);
}
if (errors.length) {
  console.error(`[design-check] ERROR ${errors.length}건 — 마이크로 밴드[0.66,1.0)의 비토큰 font-size는 금지입니다.`);
  console.error('  design_system.md §4-2: --fs-* 토큰만 사용하십시오.');
  for (const e of errors) console.error('  -', e);
  process.exit(1);
}
console.log(`[design-check] PASS — 토큰 규범 준수 (warn ${warns.length}건)`);
