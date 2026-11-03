#!/usr/bin/env node
/**
 * pattern-metrics — AI 패턴 지표 수집기 (계측 전용, 빌드를 막지 않음)
 *
 * 집행은 `ci/pattern-budget.mjs`가 한다. 이 파일은 **수치의 단일 정의**만 책임진다.
 * docs/core/ai_pattern_remediation_plan.md §7 대시보드가 이 값을 쓴다.
 *
 * 사용: node ci/pattern-metrics.mjs [--json] [--no-admin]
 *
 * ── 고정된 측정 정의 (이게 흔들려서 계획서 v1.0에 오차 13건이 생겼다) ──
 *  1. CSS 주석(/* *​/) 구간은 집계에서 제외한다. 문서화 주석이 수치를 오염시키면 안 된다.
 *  2. '고유값'은 선언문자열이 아니라 **정규화된 값 집합**이다. `0 6px 6px 0` 같은
 *     다중값은 구성 값 각각으로 분해한다.
 *  3. 대상을 절단하지 않는다(`head -N` 후 합산 금지).
 *  4. breakpoint는 `@media` 안의 `(max|min)-width`만 센다.
 */
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const ADMIN_PREFIXES = ['src/pages/AdminDashboard.', 'src/components/admin/'];

function* walk(dir, exts) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) yield* walk(p, exts);
    else if (exts.some((x) => p.endsWith(x))) yield p.split('\\').join('/');
  }
}
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '');
/* `@media` 블록만 길이 보존 마스킹. **정규식으로 하지 않는다** — `@media` 안에 `@keyframes`가
   들어가는 3중 중첩이 실제로 존재해서(`Header.css` 3곳) 중첩 1단만 다루는 정규식이 깨졌고,
   그 탓에 `.nav` 같은 최상위 중복 15건을 놓쳤다(2026-11-01 자가 발각). 중괄호 깊이로 센다. */
function maskMediaBlocks(css) {
  const out = css.split('');
  let depth = 0, start = -1, startDepth = 0;
  for (let i = 0; i < css.length; i++) {
    if (start === -1 && css.startsWith('@media', i) && depth === 0) { start = i; startDepth = depth; }
    const c = css[i];
    if (c === '{') depth++;
    else if (c === '}') {
      depth--;
      if (start !== -1 && depth <= startDepth) {
        for (let j = start; j <= i; j++) if (out[j] !== '\n') out[j] = ' ';
        start = -1;
      }
    }
  }
  return out.join('');
}


/** 선언 값을 정규화해 고유 집합을 만든다 */
/* 속성 고유값 집합. `prop`에는 정규식 조각을 넘길 수 있다(예: `(?:row-|column-)?gap`).
   **선언 시작 경계(`^`·`;`·`{`·공백)를 반드시 요구한다** — 경계가 없던 탓에
   `.wm-demo-gap::before { content: "" }` 같은 **셀렉터 이름**이 `gap:` 으로 잡혀
   `:before`·`{`·`content:`·`""` 4개가 값으로 집계됐다(2026-11-01 자가 발각).
   클래스명이 속성명으로 끝나면 언제든 재발하는 구조적 결함이었다. */
function uniqueValues(css, prop, { split = false } = {}) {
  const re = new RegExp(`(?:^|[;{\\s])(?:${prop}):\\s*([^;}]+)`, 'gm');
  const set = new Set();
  for (const m of css.matchAll(re)) {
    const raw = m[1].trim().replace(/\s+/g, ' ');
    const parts = split ? raw.split(/\s+(?![^(]*\))/) : [raw];
    parts.forEach((v) => v && set.add(v));
  }
  return set;
}

export function collect({ noAdmin = false, root = 'src' } = {}) {
  const inScope = (p) => !(noAdmin && ADMIN_PREFIXES.some((a) => p.startsWith(a)));
  const cssFiles = [...walk(root, ['.css'])].filter(inScope);
  const jsxFiles = [...walk(root, ['.jsx'])].filter(inScope);

  const perFile = new Map();           // 파일 → 주석 제거된 CSS
  for (const p of cssFiles) perFile.set(p, stripComments(readFileSync(p, 'utf-8')));
  const css = [...perFile.values()].join('\n');
  /* JSX도 주석을 제거한 사본으로 센다 — 규범 설명 주석에 쓴 `⚠️`·`🔴` 같은 기호가
     이모지 지표에 잡혀 '나빠진 것이 없는데' 예산이 초과되는 일이 있었다(2026-11-01).
     CSS 쪽 stripComments와 동일한 교정. */
  /* 2차 교정(2026-11-01): 구 구현은 **줄 선두 주석만** 지워서 줄 끝 주석이 남았고
     (예: 상태 선언 뒤에 붙은 설명 주석) 그 안의 화살표를 UI 글리프로 오산했다.
     이제 줄 끝 주석도 자른다 — 단, 문자열 리터럴 안의 슬래시 두 개(URL 등)는 건드리지
     않도록 따옴표 밖만 본다. (이 주석에 정규식 리터럴을 적지 않는 이유: 그 안의
     별표·슬래시 조합이 블록 주석을 조기 종료시킨다 — 방금 겪었다.) */
  const stripLineComments = (t) => t.split('\n').map((ln) => {
    let q = null;
    for (let i = 0; i < ln.length; i++) {
      const c = ln[i];
      if (q) { if (c === q && ln[i - 1] !== '\\') q = null; }
      else if (c === '\'' || c === '"' || c === '`') q = c;
      else if (c === '/' && ln[i + 1] === '/') return ln.slice(0, i);
    }
    return ln;
  }).join('\n');
  const jsx = jsxFiles.map((p) => stripLineComments(stripComments(readFileSync(p, 'utf-8')))).join('\n');

  /* 아티클 본문·메타 — 빌더스 로그/플래너스 뷰의 마크다운과 카드 메타(제목·요약).
     UI가 아니라 **콘텐츠**이고, 작성 경로가 어드민 에디터(AI 초안)라 이모지가 가장 쉽게
     재유입되는 자리다. 2026-11-01에 3개 로케일 38편을 전수 정리했으므로 0을 유지한다. */
  const articleText = [
    ...['public/content/logs', 'public/content/planners-view'].flatMap((d) => {
      try { return [...walk(d, ['.md'])]; } catch { return []; }
    }),
    'src/data/buildersLogMeta.json',
    'src/data/plannersViewMeta.json',
  ].map((f) => { try { return readFileSync(f, 'utf-8'); } catch { return ''; } }).join('\n');

  /* 로케일 사전 — UI 문자열의 실제 거주지. 주석이 없는 JSON이라 그대로 읽는다. */
  const localeText = ['ko', 'en', 'ja']
    .map((l) => { try { return readFileSync(`src/locales/${l}.json`, 'utf-8'); } catch { return ''; } })
    .join('\n');

  const n = (re) => (css.match(re) || []).length;
  const kf = [...css.matchAll(/@keyframes\s+([A-Za-z0-9_-]+)/g)].map((m) => m[1]);
  const kfDup = Object.entries(kf.reduce((a, x) => ((a[x] = (a[x] || 0) + 1), a), {}))
    .filter(([, c]) => c > 1);
  const align = [...css.matchAll(/text-align:\s*([a-z]+)/g)].map((m) => m[1]);
  const weights = [...css.matchAll(/font-weight:\s*(\d+)/g)].map((m) => +m[1]);

  /* 호버 부유 거리 — **:hover/:focus 스코프 안의 translateY만** 센다.
     이전 정의는 `@keyframes`의 부유 애니메이션 진폭(`50% { transform: translateY(-10px) }`)과
     중앙 정렬용 `translateY(-50%)` 계열까지 섞어 세어 '7종 난립'으로 과대 보고했다.
     실제 호버 부유는 3종이었다(계획서 v1.3에서 정정). */
  const kfRanges = [];
  {
    const re = /@keyframes[^{]*\{/g; let m;
    while ((m = re.exec(css))) {
      let i = css.indexOf('{', m.index), d = 0, q = i;
      while (q < css.length) { if (css[q] === '{') d++; else if (css[q] === '}') { d--; if (!d) break; } q++; }
      kfRanges.push([m.index, q]);
    }
  }
  const hoverLifts = new Set();
  {
    const rr = /([^{}]+)\{([^{}]*)\}/g; let m;
    while ((m = rr.exec(css))) {
      const pos = m.index + m[1].length;
      if (kfRanges.some(([a, b]) => pos >= a && pos <= b)) continue;
      if (!/:hover|:focus/.test(m[1])) continue;
      for (const x of m[2].matchAll(/translateY\(\s*(-[\d.]+px)\s*\)/g)) hoverLifts.add(x[1]);
    }
  }

  /* 그라디언트 텍스트의 파일별 최다값 — '페이지당 1곳' 목표의 집행 지표 */
  let gradMaxFile = '', gradMax = 0;
  for (const [p, s] of perFile) {
    let c = 0; const rr = /([^{}]+)\{([^{}]*)\}/g; let m;
    while ((m = rr.exec(s)) !== null) if (/background-clip:\s*text/.test(m[2])) c++;
    if (c > gradMax) { gradMax = c; gradMaxFile = p; }
  }

  /* 유휴 시 **보이는** 글로우 — 장식 밀도의 실제 지표.
     `radial-gradient` 총량은 지표가 아니다: 상태 게이트(:hover·.active) 안에 있거나
     base에서 `opacity: 0`인 호버 공개형은 유휴 중 보이지 않으므로 비용이 0이다
     (`infinite` → `infinite-ungated`와 동일한 교정, 2026-11-01). */
  let glowIdle = 0;
  {
    /* `.hovering-`·`.near-`는 `TelescopeCursor`가 JS로 붙이는 **상태 클래스**인데
       게이트 목록에 없어 유휴 글로우로 3건 오탐했다(2026-11-01 교정). */
    const GATE = /:hover|:focus|\.active|\.on\b|\.revealed|\.open|\.visible|active-focus|theme-|\.hovering-|\.near-/;
    const rr = /([^{}]+)\{([^{}]*)\}/g; let m;
    while ((m = rr.exec(css)) !== null) {
      if (!/radial-gradient/.test(m[2])) continue;
      if (GATE.test(m[1])) continue;
      const op = /opacity:\s*([0-9.]+)/.exec(m[2]);
      if (op && parseFloat(op[1]) === 0) continue;
      glowIdle++;
    }
  }

  /* 같은 파일에서 같은 셀렉터를 두 번 선언한 건수 — **결함을 숨기는 패턴**.
     `.detail-title`은 `display:inline-block`이 앞 규칙에, 그라디언트가 뒤 규칙에 있어서
     '그라디언트인데 inline-block 없음' 검사를 통과했다. `.flagship-cta-btn.indigo`는
     뒤 선언이 앞을 덮어 violet 블록이 **사문**이 됐는데 아무도 몰랐다(P1-A1 발견).
     규칙 전체를 한눈에 못 보게 만드는 구조다. @media 내부는 의도적 오버라이드이므로 제외. */
  let dupSelector = 0;
  for (const [, fileCss] of perFile) {
    /* 파일 단위로 센다 — 전 파일을 이어붙인 뒤 첫 @media에서 자르면 대부분이 누락된다
       (지표 신설 직후 0으로 나와서 발견한 자가 버그, 2026-11-01).
       2차 교정(2026-11-01): 첫 @media **이후를 버리던** 탓에 그 뒤의 최상위 중복도 함께
       놓쳤다(`Header.css`의 `.nav` L1+L366 등). 이제 @media 블록만 마스킹해 본문은 전부 본다. */
    const scope = maskMediaBlocks(fileCss);
    const seen = new Map();
    const rr = /([^{}]+)\{([^{}]*)\}/g; let m;
    while ((m = rr.exec(scope)) !== null) {
      const sel = m[1].trim().replace(/\s+/g, ' ');
      if (!sel || sel.startsWith('@') || /^(from|to|\d+%)/.test(sel)) continue;
      seen.set(sel, (seen.get(sel) || 0) + 1);
    }
    for (const c of seen.values()) if (c > 1) dupSelector++;
  }

  /* 그라디언트 텍스트인데 `display: inline-block`이 없는 규칙 — **조용한 렌더 버그**.
     design_system §9-1 v5.18이 필수로 규정했지만 Sylphio 3지면에서 누락돼 있었고,
     짧은 타이틀이 풀폭 그라디언트의 **중간 구간만 샘플**해 의도한 색 스윕이 거의 단색으로
     렌더됐다(2026-11-01 오너 발견). 빌드·타입체커가 절대 못 잡는 종류여서 게이트가 필요하다.
     예외: inline/inline-flex/flex/table은 이미 글자 폭에 맞으므로 허용. */
  let gradNoInline = 0;
  {
    const rr = /([^{}]+)\{([^{}]*)\}/g; let m;
    while ((m = rr.exec(css)) !== null) {
      if (!/background-clip:\s*text/.test(m[2])) continue;
      if (/display:\s*(inline-block|inline-flex|inline|flex|table)/.test(m[2])) continue;
      gradNoInline++;
    }
  }

  /* 미선언 토큰 참조 + 죽은 var() 폴백 — P1 수행 중 발견한 결함 유형(2026-11-01).
     ① 미선언 토큰: `var(--font-sans)`처럼 선언되지 않은 토큰을 폴백 없이 참조하면
        **그 선언 전체가 무효화**된다. Footer의 브랜드 폰트가 브라우저 기본으로 떨어지고,
        BuildersLog 카드의 border-color/box-shadow 전이가 아예 동작하지 않던 원인.
     ② 죽은 폴백: 토큰이 항상 선언돼 있으면 `var(--x, 폴백)`의 폴백은 영원히 쓰이지 않는다.
        무해하지만 **오해를 유발하는 문서**다 — `var(--space-xl, 40px)`을 읽은 사람은
        --space-xl이 40px(실제 32px)이라고 믿는다. 실측 117건이 토큰값과 모순이었다.
     런타임 주입 변수(--card-accent·--accent-color·--reveal-delay 등 JSX 인라인/스코프 선언)는
     폴백이 정당한 기본값이므로 집계에서 제외한다. */
  const declared = new Set();
  for (const p of cssFiles) for (const m of readFileSync(p, 'utf-8').matchAll(/(--[a-z0-9-]+)\s*:/gi)) declared.add(m[1]);
  for (const p of jsxFiles) for (const m of readFileSync(p, 'utf-8').matchAll(/'(--[a-z0-9-]+)'\s*:/gi)) declared.add(m[1]);
  const rootDeclared = new Set([...readFileSync('src/styles/index.css', 'utf-8').matchAll(/(--[a-z0-9-]+)\s*:/gi)].map((m) => m[1]));
  let undeclaredRef = 0, deadFallback = 0;
  for (const p of [...cssFiles, ...jsxFiles]) {
    const src = stripComments(readFileSync(p, 'utf-8'));
    for (const m of src.matchAll(/var\(\s*(--[a-z0-9-]+)\s*(,?)/gi)) {
      if (!declared.has(m[1])) undeclaredRef++;
      else if (m[2] === ',' && rootDeclared.has(m[1])) deadFallback++;
    }
  }

  /* 로드되지 않는 웹폰트 참조(유령 폰트) — index.html의 요청 목록과 교차 검증 */
  const html = readFileSync('index.html', 'utf-8');
  const PHANTOM = ['Outfit', 'Cormorant Garamond', 'Playfair Display', 'Geist'];
  const phantom = PHANTOM.filter((f) => css.includes(f) && !html.includes(f.replace(/ /g, '+')));

  const metrics = {
    // ── A 재질 / D 모션: 장식 밀도 (모두 단조 감소 대상) ──
    /* 그라디언트 텍스트 — **규칙 단위**로 센다.
       이전 정의는 `-webkit-background-clip: text`와 `background-clip: text`를 각각 세어
       한 규칙을 2건으로 계상했다(실제 규칙 수의 2배로 과대 보고). */
    'gradient-text': (() => {
      let c = 0; const rr = /([^{}]+)\{([^{}]*)\}/g; let m;
      while ((m = rr.exec(css)) !== null) if (/background-clip:\s*text/.test(m[2])) c++;
      return c;
    })(),
    'gradient-text-max-per-file': gradMax,
    'radial-gradient': n(/radial-gradient/g),
    'glow-idle-visible': glowIdle,
    'backdrop-filter': n(/backdrop-filter/g),
    'infinite-animation': n(/\binfinite\b/g),
    /* 유휴 중 상시 구동하는 infinite 애니메이션 — **모션 병리의 실제 지표**(P2-4).
       `infinite-animation`(총량)은 지표로 부적절하다: 호버·열림·로딩 같은 **상태 게이트**가
       붙은 애니메이션은 유휴 중 돌지 않으므로 비용이 0이다. 목업이 호버 때 살아나는 것은
       기능이지 소음이 아니다. 실제 문제는 '아무도 안 보는데 영구히 도는' 것이었다. */
    'infinite-ungated': (() => {
      const GATE = /:hover|:focus|:active|\.active|\.on\b|\.loading|\.revealed|\.now\b|\.playing|\.open|\.visible|\.selected|\.pulse\b|\.active-focus/;
      let c = 0; const rr = /([^{}]+)\{([^{}]*)\}/g; let m;
      while ((m = rr.exec(css)) !== null) {
        const a = /animation:\s*([^;]+)/.exec(m[2]);
        if (!a || !/\binfinite\b/.test(a[1])) continue;
        if (!GATE.test(m[1])) c++;
      }
      return c;
    })(),
    /* 고아 키프레임 — 선언됐지만 어떤 animation도 참조하지 않는다(죽은 코드) */
    'orphan-keyframes': (() => {
      const KW = /^(infinite|alternate|alternate-reverse|linear|ease|ease-in|ease-out|ease-in-out|both|forwards|backwards|normal|reverse|none|running|paused|step-start|step-end|cubic-bezier|steps)$/;
      const used = new Set();
      for (const m of css.matchAll(/animation(?:-name)?:\s*([^;]+)/g))
        for (const t of m[1].split(',')) {
          const w = t.trim().split(/\s+/).find((x) => /^[A-Za-z][\w-]*$/.test(x) && !KW.test(x));
          if (w) used.add(w);
        }
      return kf.filter((x) => !used.has(x)).length;
    })(),
    'transition-all': n(/transition:\s*all/g),
    'important': n(/!important/g),
    'opacity-text': n(/opacity:\s*0\.[1-6]\b/g),
    'keyframes-total': kf.length,

    // ── G 버튼·컨트롤 기하 ──
    'radius-unique': uniqueValues(css, 'border-radius', { split: true }).size,
    'gap-unique': uniqueValues(css, '(?:row-|column-)?gap', { split: true }).size,
    'hover-lift-unique': hoverLifts.size,
    /* 버튼류 생값 padding — 역할이 '버튼'인 셀렉터만. CTA 컨테이너(.wm-cta·.intro-cta·
       .rl-login-cta·.pvl-cross-cta·.back-btn-large)·탭·배지·프로필칩은 버튼이 아니므로 제외.
       4단 토큰(--btn-pad-xs/sm/md/lg) 외의 px 패딩을 센다(P1-G3). */
    'btn-raw-padding': (() => {
      const EXCL = /wm-cta|intro-cta|rl-login-cta|cross-cta|back-btn-large|sim-pro-badge|workspace-tab-btn|daily-nav-btn|admin-profile-btn|rl-af-btn|quick-peek-action-btn/;
      let c = 0;
      const rr = /([^{}]+)\{([^{}]*)\}/g; let m;
      while ((m = rr.exec(css)) !== null) {
        const sel = m[1];
        if (!/(^|[\s,>])\.[a-z0-9_-]*(btn|cta|button)[a-z0-9_-]*(:|\s|,|$)/i.test(sel)) continue;
        if (/:hover|:focus|:active|::/.test(sel) || EXCL.test(sel)) continue;
        if (/(?:^|[;{\s])padding:\s*[^;]*\d+px/.test(m[2])) c++;
      }
      return c;
    })(),
    'cursor-pointer': n(/cursor:\s*pointer/g),

    // ── H 텍스트 배치 ──
    'tracking-unique': uniqueValues(css, 'letter-spacing').size,
    'leading-unique': uniqueValues(css, 'line-height').size,
    'weight-unique': new Set(weights).size,
    /* 700+ 사용량 — **굵기 병리의 실제 지표**.
       `weight-bold-pct`(600 이상 비율)는 지표로 부적절했다: 소형 대문자 배지·카드 제목은
       600이 **올바른** 굵기이므로 600 비율을 낮추려면 텍스트를 약하게 만들어야 한다.
       실제 문제는 '화면 전체가 굵다'를 만드는 **700 이상의 남용**이었다(P1-H5). */
    'weight-700plus': weights.filter((w) => w >= 700).length,
    'weight-bold-pct': weights.length ? Math.round((weights.filter((w) => w >= 600).length / weights.length) * 100) : 0,
    'align-center-pct': align.length ? Math.round((align.filter((a) => a === 'center').length / align.length) * 100) : 0,
    'uppercase': n(/text-transform:\s*uppercase/g),

    // ── F 구조 부채 ──
    /* 생hex. **토큰 선언(`--x: #hex`)은 제외한다** — 색의 정의는 어딘가에서 생값이어야 하고,
       그 자리가 바로 `:root`다. 제외 없이 세면 토큰을 선언할수록 지표가 나빠져
       목표가 구조적으로 도달 불가가 된다(2026-11-01 자가 발각 — `index.css` 20건이 전부 선언이었다).
       센 것은 **선언을 쓰지 않고 값을 복제한 자리**뿐이다. */
    'raw-hex-css': (() => {
      /* 커스텀 프로퍼티 **선언 전체**를 제외한다 — `--gradient-subtle: linear-gradient(..., #161B2E, #475569)`
         처럼 값 안쪽에 있는 생hex도 '색의 정의'이므로 같은 자격이다. 콜론 직후만 보던 1차 교정은
         그라디언트 토큰을 놓쳤다(2026-11-01 2차 교정). */
      const stripped = css.replace(/--[\w-]+\s*:[^;}]*/g, '');
      return (stripped.match(/#[0-9A-Fa-f]{3,8}\b/g) || []).length;
    })(),
    /* 생rgba — **토큰과 값이 같은 유채색만** 센다. 세 부류로 갈리고 책임이 다르다(2026-11-03 신설):
         ① 토큰 값 복제(유채색) — `rgba(165,180,252,.2)`는 `--color-indigo`를 숫자로 베낀 것이다.
            토큰을 바꿔도 전파되지 않으므로 **결함이고, 이 지표가 세는 대상이다**.
            무손실 치환형은 `color-mix(in srgb, var(--token) 20%, transparent)`다.
         ② 흰/검 오버레이 — `rgba(255,255,255,.08)`는 '유리 표면을 N% 밝힌다'는 뜻이고
            대응 토큰이 없다. `color-mix(... white 8%, transparent)`로 바꿔도 얻는 게 없어 **세지 않는다**
            (표면 토큰 체계는 별건 결정이다 — task_backlog §3-5).
         ③ 토큰 없는 유채색 — 오프시스템 색이다. `raw-hex-css`와 같은 성격이라 그쪽 판단을 따른다.
       `alpha: 0`은 예외로 둔다 — `rgba(165,180,252,0)`은 **색상 채널을 보존한 투명**이라
       애니메이션이 그 색 쪽으로 보간되는데, `color-mix(... 0%, transparent)`는 투명 **검정**이 되어
       보간 중 회색이 낀다(2026-11-03 자가 발각). 치환이 틀린 자리이므로 결함으로 세지 않는다. */
    'raw-rgba-token-dup': (() => {
      const decl = /--[\w-]+\s*:\s*(#[0-9A-Fa-f]{6})\b/g;
      const seen = new Map();
      for (const m of css.matchAll(decl)) {
        const hx = m[1].toUpperCase();
        seen.set(hx, (seen.get(hx) || 0) + 1);
      }
      const triplets = new Set();
      for (const [hx, n] of seen) {
        if (n > 1) continue;            // 값이 겹치는 토큰은 어느 쪽을 뜻했는지 알 수 없다
        triplets.add([1, 3, 5].map((i) => parseInt(hx.slice(i, i + 2), 16)).join(','));
      }
      const stripped = css.replace(/--[\w-]+\s*:[^;}]*/g, '');
      let n = 0;
      for (const m of stripped.matchAll(/\brgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([0-9.]+)\s*)?\)/g)) {
        if (m[4] !== undefined && Number(m[4]) === 0) continue;   // 색상 보존 투명은 정당
        if (triplets.has(`${+m[1]},${+m[2]},${+m[3]}`)) n++;
      }
      return n;
    })(),
    /* 비토큰 간격값 — `margin`·`padding`·`gap` 선언 안의 px 중 `--space-*` 단계에 없는 값.
       두 부류를 **세지 않는다**(2026-11-03 신설, 175건 스냅 후 0):
         ① **4px 미만과 소수** — 광학 보정과 일러스트 기하다. `margin-top: 2px`는
            '줄바꿈 텍스트 상단에 정확히 맞춘' 값이고 목업 내부 `2.5px`는 그림의 치수다.
            4pt 격자가 지배하는 레이아웃 간격이 아니므로 스냅하면 의도가 깨진다.
         ② **80px 이상** — GNB 높이 보정 계열이다. 지면마다 80·92·110·120·140·160px으로
            갈려 있는데(§9-1 공백, task_backlog §3-7) 토큰 스케일 문제가 아니라
            **보정값 자체가 통일돼야 하는** 별건이다. 여기서 스냅하면 그 결함을 덮는다.
       스냅 규칙: 최근접 단계. 동점은 24px 이상 내림(압축 방향)·미만 올림(조임 방지). */
    /* 격자 **위에** 있는데 px로 적힌 간격값 — `padding: 16px`은 `var(--space-md)`와 값이 같다.
       같은 값을 두 문법으로 쓰면 토큰을 바꿔도 전파되지 않고, 스냅 작업 뒤에는
       `padding: var(--space-lg) 24px`처럼 한 선언에 둘이 섞인다(2026-11-03, 198건 전환 후 0).
       제외는 `spacing-offgrid`와 같다(음수·소수). */
    'spacing-px-literal': (() => {
      const steps = new Set([4, 8, 12, 16, 24, 32, 64, 128]);
      let n = 0;
      for (const m of css.matchAll(/(?:^|[;{\s])(?:margin|padding|gap|row-gap|column-gap)(?:-top|-right|-bottom|-left)?\s*:\s*([^;}]+)/g)) {
        for (const px of m[1].matchAll(/(-?)(\d+(?:\.\d+)?)px\b/g)) {
          if (px[1] === '-' || px[2].includes('.')) continue;
          if (steps.has(Number(px[2]))) n++;
        }
      }
      return n;
    })(),
    'spacing-offgrid': (() => {
      const steps = new Set([4, 8, 12, 16, 24, 32, 64, 128]);
      let n = 0;
      for (const m of css.matchAll(/(?:^|[;{\s])(?:margin|padding|gap|row-gap|column-gap)(?:-top|-right|-bottom|-left)?\s*:\s*([^;}]+)/g)) {
        /* 음수는 세지 않는다 — `margin: -34px 0 0 -1.5px`는 간격이 아니라 **위치 보정**이다
           (Header 시계 바늘의 회전 원점 오프셋). 4pt 단계로 스냅할 대상이 아니다. */
        for (const px of m[1].matchAll(/(-?)(\d+(?:\.\d+)?)px\b/g)) {
          if (px[1] === '-' || px[2].includes('.')) continue;
          const v = Number(px[2]);
          if (v < 4 || v >= 80 || steps.has(v)) continue;
          n++;
        }
      }
      return n;
    })(),
    'breakpoint-unique': new Set([...css.matchAll(/@media[^{]*?\b(?:max|min)-width:\s*(\d+)px/g)].map((m) => m[1])).size,
    'inline-style-jsx': (jsx.match(/style=\{\{/g) || []).length,
    /* 이모지. **로케일 JSON까지 센다** — UI 라벨의 선두 이모지가 `src/locales/*.json`에
       들어 있어 `.jsx`만 보던 구 지표가 **93건을 전부 놓쳤다**(2026-11-01 오너 발견:
       "카드 내 버튼은 여전히 이모지가 있다"). 화살표 블록(U+2190–21FF)도 누락이었다. */
    'emoji-jsx': ((jsx + localeText).match(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{2190}-\u{21FF}]/gu) || []).length,
    /* 아티클 이모지 **총량**. 위치를 지목하는 차단은 `ci/design-check.mjs`의
       `articleEmojiGate`가 담당한다(파일:행 + 규범 조항). 여기 값은 래칫 대시보드
       (`npm run budget -- --report`)에 총량을 노출하기 위한 것이고, 두 게이트는 같은
       범위를 보므로 결과가 갈릴 수 없다.
       **화살표 블록(U+2190–21FF)은 세지 않는다** — 본문의 `→`는 이모지가
       아니라 타이포그래피(`배움 → 실행 → 복기`, `4→3`)이고, 지우면 문장이 깨진다.
       JSX 지표가 화살표를 세는 것은 거기서는 `<Icon name="arrowRight">`가 정답이기 때문이다. */
    'emoji-article': (articleText.match(/[\u{1F300}-\u{1FAFF}\u{1F1E6}-\u{1F1FF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}]/gu) || []).length,

    // ── 하드 규칙: 0이어야 하고 0을 유지해야 한다 ──
    'keyframes-duplicate': kfDup.length,
    'maxwidth-band-violation': [...css.matchAll(/(?<!\()max-width:\s*(\d+)px/g)]
      .filter((m) => +m[1] >= 880 && +m[1] <= 2000).length,
    'phantom-font': phantom.length,
    'gradient-text-no-inline': gradNoInline,
    'duplicate-selector': dupSelector,
    'undeclared-token-ref': undeclaredRef,
    'dead-var-fallback': deadFallback,
  };

  return {
    metrics,
    detail: {
      files: { css: cssFiles.length, jsx: jsxFiles.length, admin: noAdmin ? 'excluded' : 'included' },
      keyframesDuplicate: kfDup.map(([x, c]) => `${x}×${c}`),
      gradientTextWorstFile: gradMax ? `${gradMaxFile} (${gradMax})` : '-',
      phantomFonts: phantom,
      focusVisibleFiles: cssFiles.filter((p) => readFileSync(p, 'utf-8').includes('focus-visible')).length,
      weightTotal: weights.length,
      alignTotal: align.length,
    },
  };
}

/* ── CLI ── */
const isMain = process.argv[1] && process.argv[1].endsWith('pattern-metrics.mjs');
if (isMain) {
  const noAdmin = process.argv.includes('--no-admin');
  const { metrics, detail } = collect({ noAdmin });
  if (process.argv.includes('--json')) {
    console.log(JSON.stringify({ metrics, detail }, null, 2));
  } else {
    console.log(`\n[pattern-metrics] src/ — CSS ${detail.files.css} · JSX ${detail.files.jsx} · admin ${detail.files.admin}\n`);
    const pad = Math.max(...Object.keys(metrics).map((k) => k.length));
    for (const [k, v] of Object.entries(metrics)) console.log(`  ${k.padEnd(pad)}  ${v}`);
    console.log(`\n  (참고) focus-visible 보유 파일: ${detail.focusVisibleFiles}`);
    console.log(`  (참고) weight 표본 ${detail.weightTotal} · align 표본 ${detail.alignTotal}`);
    console.log(`  (참고) gradient-text 최다 파일: ${detail.gradientTextWorstFile}`);
    if (detail.keyframesDuplicate.length) console.log(`  (경고) 중복 키프레임: ${detail.keyframesDuplicate.join(', ')}`);
    if (detail.phantomFonts.length) console.log(`  (경고) 유령 폰트: ${detail.phantomFonts.join(', ')}`);
    console.log('');
  }
}
