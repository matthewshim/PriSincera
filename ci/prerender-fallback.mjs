/**
 * 홈 정적 폴백 생성기 (P7-2)
 *
 * 문제: `dist/index.html`의 `<div id="root">`가 비어 있어, 처음 받는 HTML에 **본문이 없다.**
 * 일부 검색엔진·AI 크롤러·링크 미리보기 봇에는 빈 페이지로 보인다.
 *
 * 방식: `index.html`에 본문을 손으로 박지 않는다 — 로케일과 내용이 갈린다.
 * 대신 **빌드 후** `src/locales/ko.json`과 `src/data/seoMeta.mjs`에서 뽑아
 * `dist/home-fallback.html` 조각으로 쓰고, `server.mjs`가 **홈 요청에만** `#root`에 끼운다.
 * `dist/index.html`에 직접 박으면 SPA 특성상 **모든 경로의 원본 HTML에 홈 본문이 실려**
 * 중복 콘텐츠 신호가 된다(2026-11-04 curl 검증에서 발견).
 * 출처가 하나라 내용이 갈리지 않고, 서비스가 늘어도 자동으로 따라온다.
 * React가 마운트하며 덮어쓰므로 사용자에게는 보이지 않는다
 * (`createRoot().render()`는 최초 렌더에서 컨테이너의 기존 내용을 교체한다).
 *
 * 장기적으로 사전 렌더링(A안)으로 옮기면 이 스크립트는 걷어낸다.
 * 정본: docs/core/main_page_revision_plan.md §13-5 · §17
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const DIST = 'dist';
const OUT = join(DIST, 'home-fallback.html');

if (!existsSync(DIST)) {
  console.log('[prerender] dist 없음 — 건너뜀');
  process.exit(0);
}

const ko = JSON.parse(readFileSync('src/locales/ko.json', 'utf-8')).home;
const { PAGE_META } = await import('../src/data/seoMeta.mjs');

/* 서비스 5종 — 경로는 PAGE_META, 이름은 로케일에서 온다. 둘 다 정본이라 따로 적지 않는다. */
const SERVICES = [
  ['/planners-view', "Planner's View"],
  ['/builders-log', "Builder's Log"],
  ['/relearn', 'ReLearn'],
  ['/waymark', 'Waymark'],
  ['/sylphio', 'Sylphio'],
].filter(([p]) => PAGE_META[p]);

const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const links = SERVICES.map(([href, name]) => `<a href="${href}">${esc(name)}</a>`).join('\n        ');

const fallback = `<main>
        <h1>Sincerity, Prioritized.</h1>
        <p>${esc(ko.heroLabel)}</p>
        <p>${esc(ko.heroRole)}</p>
        <nav aria-label="서비스">
        ${links}
        </nav>
      </main>`;

writeFileSync(OUT, fallback, 'utf-8');
console.log(`[prerender] 홈 폴백 조각 생성 — h1 + 소개 2행 + 서비스 ${SERVICES.length}개 링크`);
