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
/* ── EXCLUDE 정책 (P4-5 명문화, 2026-11-01) ────────────────────────────────
 * [원칙] **제외 목록은 허가가 아니라 사각지대다.** 이 목록은 두 번 결함을 숨겼다:
 *   ① `max-width: 1400px` ×2 — §3-3 금지대역[880,2000] 위반인데 통과(P0-4에서 발견)
 *   ② 생값 `font-size` 72건 — 10~48px·0.72~1.6rem이 그대로(P3-8에서 발견)
 * [적용 범위] 아래 목록은 **`font-size` 규칙에만** 적용된다. 어드민은 밀도 높은 데이터
 *   도구라 공개 지면의 타입 스케일(11단)을 그대로 쓰면 테이블이 깨질 수 있다 —
 *   이것이 제외의 **유일한** 사유다.
 * [제외하지 않는 것] radius·letter-spacing·line-height·font-weight·transition·
 *   max-width 금지대역·접근성 게이트는 **어드민도 전역 집행**한다(이미 100% 준수).
 * [해제 조건] 어드민 전용 타입 스케일을 별도 토큰군으로 선언하거나, 공개 스케일로
 *   마이그레이션하면 이 목록을 비운다. → 계획서 P3-10에서 결정한다.
 * [금지] 새 파일을 이 목록에 추가하지 마십시오. 위반이 나오면 코드를 고치는 것이
 *   원칙이고, 제외는 **사유를 여기에 적어야만** 가능합니다. */
const EXCLUDE = new Set([
  'src/pages/AdminDashboard.css',        // font-size만 제외 — 어드민 밀도 규격(위 정책 참조)
  'src/components/admin/ServiceDocs.css', // 상동
]);
// v6.0 (P3-8): 35단 0.05rem 균일 격자 → **11단 역할 기반 모듈러 스케일**로 교체.
// 허용 font-size는 아래 11개 값뿐이다. 토큰 이름도 숫자(--fs-082를 부르는 이름)에서
// 역할(--fs-sm 등)로 바꿨다 — 이름이 값 추가를 유도하지 않게 하는 것이 핵심이다.
const TOKENS = new Set([
  '0.7', '0.8', '0.9', '1', '1.15', '1.3', '1.5', '1.75', '2.1', '2.4', '3',
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
  /* 주석을 **길이 보존 공백**으로 마스킹한 사본 — 규칙 검사는 이쪽에서 한다.
     규범 설명 주석에 `transition: all`·`border-radius: inherit` 같은 예시 문구가 들어 있어
     원문을 그대로 스캔하면 자기 문서를 위반으로 신고한다(2026-11-01 실제 발생).
     오프셋이 보존되므로 행번호 계산은 종전과 동일하다. */
  const code = css.replace(/\/\*[\s\S]*?\*\//g, (c) => ' '.repeat(c.length));
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
  /* ── P4-1 차원 확대 (2026-11-01) ──
     감사 §2-8의 메타 진단: "디자인 12차원 중 집행되는 것은 font-size 1개이고,
     그 1개의 허용값이 35종이다." P1~P3에서 아래 차원들을 전수 토큰화했으므로
     **이제 하드 규칙으로 고정한다** — 고친 것을 지키는 장치가 없으면 다음 생성
     사이클에 되돌아간다(리비전 25회가 밟은 경로).
     ⚠️ 이 블록은 **어드민을 제외하지 않는다**: font-size EXCLUDE가 사각지대로
     기능해 `max-width: 1400px`(P0-4)와 생값 font-size 72건(P3-8)을 숨겼다.
     아래 차원들은 어드민도 이미 100% 토큰화 상태라 전역 집행이 가능하다. */
  {
    // ① border-radius — 토큰 / 0 / 50% / inherit 만
    const okRadius = /^(?:var\(--(?:radius-(?:xs|sm|md|lg|pill)|admin-radius)\)|0|50%|inherit)$/;
    for (const m of code.matchAll(/border-radius:\s*([^;}!]+)/g)) {
      const parts = m[1].trim().split(/\s+/);
      if (parts.every((v) => okRadius.test(v))) continue;
      const line = code.slice(0, m.index).split('\n').length;
      errors.push(`${rel}:${line} border-radius: ${m[1].trim()} (§9-10 P4-1 — var(--radius-*)/0/50%/inherit만 허용)`);
    }
    // ② letter-spacing — --tracking-* 만
    for (const m of code.matchAll(/letter-spacing:\s*([^;}!]+)/g)) {
      if (/^var\(--tracking-(?:tight|wide|wider|widest|ultra)\)$/.test(m[1].trim())) continue;
      const line = code.slice(0, m.index).split('\n').length;
      errors.push(`${rel}:${line} letter-spacing: ${m[1].trim()} (P1-H3 — var(--tracking-*)만 허용)`);
    }
    // ③ line-height — --leading-* 만
    for (const m of code.matchAll(/line-height:\s*([^;}!]+)/g)) {
      if (/^var\(--leading-(?:none|tight|snug|normal|relaxed|loose)\)$/.test(m[1].trim())) continue;
      const line = code.slice(0, m.index).split('\n').length;
      errors.push(`${rel}:${line} line-height: ${m[1].trim()} (P1-H4 — var(--leading-*)만 허용)`);
    }
    // ④ font-weight — 400/500/600만. 700+는 '화면 전체가 굵어지는' 원인이고,
    //    100/300/800/900은 Inter가 로드하지 않아 영문 로케일에서 합성된다(P1-H5).
    for (const m of code.matchAll(/font-weight:\s*([^;}!]+)/g)) {
      const v = m[1].trim();
      if (/^(?:400|500|600|normal|inherit)$/.test(v)) continue;
      const line = code.slice(0, m.index).split('\n').length;
      errors.push(`${rel}:${line} font-weight: ${v} (P1-H5 — 400/500/600만. 700+ 금지, 100/300/800/900은 미로드 굵기)`);
    }
    // ⑤ transition: all 금지 — 의도 외 속성 전이·레이아웃 스래싱(P2-5)
    for (const m of code.matchAll(/transition:\s*all\b/g)) {
      const line = code.slice(0, m.index).split('\n').length;
      errors.push(`${rel}:${line} transition: all (P2-5 — 전이 속성을 명시하십시오)`);
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

// ── P4-3 접근성 게이트 (2026-11-01) ──
// 빌드·타입체커가 절대 못 잡는 종류만 본다.
//   ① 키보드 경로 없는 onClick: div/span 등 비시맨틱 요소에 onClick이 있고
//      role·onKeyDown·tabIndex가 전무하면 **키보드로는 실행할 수 없다**.
//      제외: `e.stopPropagation()`만 하는 전파 차단(동작이 아니다)과
//            모달 배경/오버레이(닫기 버튼·Escape가 별도 경로를 제공한다).
//   ② alt 없는 img
//   ③ 접근 가능 이름 없는 아이콘 전용 button (텍스트 없이 Icon/svg만, aria-label 없음)
(function a11yGate() {
  const NONSEMANTIC = /<(div|span|li|td|tr|p|h[1-6])\s([^>]*onClick[^>]*)>/g;
  for (const file of srcFiles(ROOT)) {
    if (!file.endsWith('.jsx')) continue;
    const rel = file.split('\\').join('/');
    const src = readFileSync(file, 'utf-8');
    for (const m of src.matchAll(NONSEMANTIC)) {
      /* 속성 구간을 **중괄호 균형**으로 다시 잡는다 — `onClick={e => e.stopPropagation()}`의
         화살표 `=>`에 들어 있는 `>`를 정규식이 태그 끝으로 오인해 속성이 잘렸다
         (게이트 신설 직후 전파 차단 6건을 오탐으로 신고해서 발견, 2026-11-01). */
      let i = m.index + 1 + m[1].length, depth = 0;
      for (; i < src.length; i++) {
        const ch = src[i];
        if (ch === '{') depth++;
        else if (ch === '}') depth--;
        else if (ch === '>' && depth === 0) break;
      }
      const attrs = src.slice(m.index + 1 + m[1].length, i);
      if (/role=|onKeyDown|onKeyUp|onKeyPress|tabIndex/.test(attrs)) continue;
      if (/stopPropagation/.test(attrs)) continue;
      if (/overlay|backdrop/.test(attrs)) continue;
      const line = src.slice(0, m.index).split('\n').length;
      errors.push(`${rel}:${line} <${m[1]}> + onClick (P4-3 — 키보드 경로 없음: <button>을 쓰거나 role+onKeyDown을 주십시오)`);
    }
    for (const m of src.matchAll(/<img\s([^>]*)>/g)) {
      if (/\balt=/.test(m[1])) continue;
      const line = src.slice(0, m.index).split('\n').length;
      errors.push(`${rel}:${line} <img> alt 누락 (P4-3)`);
    }
    for (const m of src.matchAll(/<button\s([^>]*)>([\s\S]{0,160}?)<\/button>/g)) {
      if (/aria-label|aria-labelledby|title=/.test(m[1])) continue;
      /* `<Icon label="…">`는 role="img" + aria-label을 내보내므로 버튼의 접근명이 된다.
         이 분기가 없어 어드민 이모지 전환(P1-E 어드민분) 때 정상 코드를 오탐했다. */
      if (/<Icon[^>]*\slabel=/.test(m[2])) continue;
      const text = m[2].replace(/<[^>]*>/g, '').replace(/\{[^}]*\}/g, '').trim();
      if (text.length > 0) continue;
      if (!/<Icon|<svg|className="[^"]*icon/i.test(m[2])) continue;
      const line = src.slice(0, m.index).split('\n').length;
      errors.push(`${rel}:${line} 아이콘 전용 <button>에 접근 가능 이름 없음 (P4-3 — aria-label을 주십시오)`);
    }
  }
})();

// ── i18n 게이트: JSX/JS 한국어 하드코딩 검출 ──
const I18N_EXCLUDE = [
  'src/pages/AdminDashboard.jsx',          // 내부 어드민 — ko 단일 운영 결정(2026-08-04)
  'src/components/admin/',                 // 상동
  'src/components/layout/SylphioNav.jsx',
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
  let noBlock = src.replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '));
  /* ── `ko:` 사전 블록 마스킹 (P3-5, 2026-11-01) ──
     페이지 내 3로케일 사전 패턴(`const TRANSLATIONS = { ko: {...}, en: {...}, ja: {...} }`)에서
     `ko:` 블록의 한국어는 **정의상 올바르다**. 종전에는 이걸 구분할 수 없어 파일 전체를
     `I18N_EXCLUDE`에 넣었는데, 그 제외가 **진짜 누출 10건을 숨겼다** — 모의 결제 모달의
     한국어가 영문·일문 사용자에게 그대로 렌더되고 있었다.
     이제 `ko:` 블록만 공백화하고 **파일의 나머지는 계속 검사**한다(줄 수 보존). */
  noBlock = noBlock.replace(/(\bko:\s*\{)/g, (m, open, idx, whole) => {
    let d = 0, i = idx + open.length - 1;
    for (; i < whole.length; i++) {
      if (whole[i] === '{') d++;
      else if (whole[i] === '}') { d--; if (!d) break; }
    }
    return m; // 위치만 찾고 실제 치환은 아래에서 일괄 처리
  });
  {
    const ranges = [];
    for (const m of noBlock.matchAll(/\bko:\s*\{/g)) {
      let d = 0, i = noBlock.indexOf('{', m.index);
      const start = i;
      for (; i < noBlock.length; i++) {
        if (noBlock[i] === '{') d++;
        else if (noBlock[i] === '}') { d--; if (!d) break; }
      }
      ranges.push([start, i]);
    }
    for (const [a, b] of ranges.reverse()) {
      noBlock = noBlock.slice(0, a) + noBlock.slice(a, b).replace(/[^\n]/g, ' ') + noBlock.slice(b);
    }
  }
  const rawLines = src.split('\n');
  noBlock.split('\n').forEach((l, i) => {
    const code = l.replace(/(^|[^:])\/\/.*$/, '$1'); // 라인 주석 제거(https:// 보호)
    if (!/[가-힣]/.test(code)) return;
    if (rawLines[i].includes('i18n-ok') || code.includes('console.')) return;
    errors.push(`${rel}:${i + 1} 한국어 하드코딩 — 언어팩(t()) 사용 또는 'i18n-ok' 마커(사유 필수)`);
  });
}

// ── 발행 규정: 공개 아티클에 Revision History 금지 (publishing_guide §5) ──
// 내부 문서(docs/)는 Revision History 의무지만, 공개 발행 아티클에는 넣지 않는다
// (AI 작성 노출·버전 노이즈 방지). docs를 그대로 복붙하면 여기서 걸린다.
// 대상: Builder's Log + Planner's View — 발행 디렉터리가 늘면 여기에 추가한다.
(function publishedArticleRevisionGate() {
  const DIRS = ['public/content/logs', 'public/content/planners-view'];
  const re = /(^|\n)#{1,6}[^\n]*Revision History/i;
  for (const dir of DIRS) {
    let files = [];
    try { files = readdirSync(dir).filter((f) => f.endsWith('.md')); } catch { continue; }
    for (const f of files) {
      if (re.test(readFileSync(join(dir, f), 'utf-8'))) {
        errors.push(`${dir}/${f}: 발행 아티클에 'Revision History' 섹션 금지 (내부 문서에만 유지 — publishing_guide §5)`);
      }
    }
  }
})();

// ── 하이라이트 문법 게이트: `==문장==` 이 실제로 <mark> 로 렌더되는지 보장 ──
// remarkHighlight 는 **하나의 텍스트 노드 안에서만** 매칭한다. 하이라이트 안에 인라인
// 마크업(*강조*·`코드`·[링크] 등)이 들어가면 노드가 쪼개져 조용히 렌더되지 않는다.
// 실제로 3편 영문에서 `*why*` 때문에 하이라이트 하나가 사라진 적이 있다(2026-10-04).
// 눈으로는 알 수 없으므로 빌드에서 막는다.
//
// 코드 블록·인라인 코드는 제외한다 — 플러그인도 건드리지 않는 영역이고, JS 의 `===`
// 같은 코드가 오탐을 낸다(Builder's Log 실측).
(function highlightSyntaxGate() {
  const DIRS = ['public/content/planners-view', 'public/content/logs'];
  const stripCode = (md) =>
    md.replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '');

  for (const dir of DIRS) {
    let files = [];
    try { files = readdirSync(dir).filter((f) => f.endsWith('.md')); } catch { continue; }
    for (const f of files) {
      const md = stripCode(readFileSync(join(dir, f), 'utf-8'));
      const pairs = md.match(/==/g) || [];
      if (pairs.length % 2 !== 0) {
        errors.push(`${dir}/${f}: '==' 개수가 홀수 — 하이라이트가 닫히지 않았다`);
      }
      const re = /==([^=\n]+)==/g;
      let m;
      while ((m = re.exec(md)) !== null) {
        if (/[*`\[\]_]/.test(m[1])) {
          errors.push(`${dir}/${f}: 하이라이트 안에 인라인 마크업 — 렌더되지 않는다: "${m[1].slice(0, 40)}…"`);
        }
      }
    }
  }
})();

// ── 이모지 게이트: Planner's View 발행물에 이모지 금지 (content_guide §2-6) ──
// 이 섹션은 1인칭 에세이다. 이모지는 문장의 어조를 대신해버려서, 문장으로 세워야 하는
// 논지를 약화시킨다. 7편 21개 파일을 전수 조사한 결과 실사용이 0건이었으므로
// 관행을 규범으로 고정한다(소급 위반 없음).
//
// 적용 범위를 좁게 둔다:
//   · 대상 — Planner's View 본문 + 메타/시리즈 정본의 독자 노출 텍스트
//   · 제외 — Builder's Log(실사용 44건, 제작 기록이라 성격이 다르다)
//   · 제외 — 내부 문서(docs/)와 UI 요소. 히어로 아이콘은 이모지가 §9-1 규격이다
(function plannersViewEmojiGate() {
  // 범위를 넓게 잡으면 전각 기호·화살표까지 걸려 오탐이 난다. 실제 이모지 블록만 본다.
  const EMOJI = /[\u{1F300}-\u{1FAFF}\u{1F000}-\u{1F2FF}\u{2600}-\u{27BF}\u{FE0F}\u{1F1E6}-\u{1F1FF}]/u;
  const DIR = 'public/content/planners-view';

  let files = [];
  try { files = readdirSync(DIR).filter((f) => f.endsWith('.md')); } catch { files = []; }
  for (const f of files) {
    const md = readFileSync(join(DIR, f), 'utf-8');
    md.split('\n').forEach((line, i) => {
      const m = line.match(EMOJI);
      if (m) {
        errors.push(`${DIR}/${f}:${i + 1}: 발행 아티클에 이모지 금지 — "${m[0]}" (content_guide §2-6)`);
      }
    });
  }

  // 메타·시리즈 정본의 독자 노출 문안도 같은 규범을 받는다
  const JSONS = [
    ['src/data/plannersViewMeta.json', ['title', 'subtitle', 'description', 'pullQuote']],
    ['src/data/plannersViewSeries.json', ['title', 'description']],
  ];
  for (const [path, fields] of JSONS) {
    let rows;
    try { rows = JSON.parse(readFileSync(path, 'utf-8')); } catch { continue; }
    for (const row of rows) {
      for (const field of fields) {
        const val = row[field];
        if (!val || typeof val !== 'object') continue;
        for (const [loc, text] of Object.entries(val)) {
          if (typeof text === 'string' && EMOJI.test(text)) {
            errors.push(`${path}: ${row.id || row.slug} ${field}.${loc} 에 이모지 금지 (content_guide §2-6)`);
          }
        }
      }
      for (const tag of row.tags || []) {
        if (typeof tag === 'string' && EMOJI.test(tag)) {
          errors.push(`${path}: ${row.id || row.slug} tags 에 이모지 금지 (content_guide §2-6)`);
        }
      }
    }
  }
})();

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
