/**
 * ServiceDocs — Admin 「서비스 문서」 허브
 *
 * docs/ 의 모든 마크다운을 빌드 타임에 번들(Vite glob ?raw)하여 admin 내에서 열람.
 * - 역할별 필독 경로(기획/디자인/개발) + 도메인 폴더 트리 + 검색
 * - react-markdown(remark-gfm, rehype-highlight) 재사용 — BuildersLog와 동일 렌더
 * - 문서 간 .md 링크는 뷰어 내에서 전환(내부 네비게이션)
 */
import { useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/atom-one-dark.css';
import './ServiceDocs.css';

// 빌드 타임에 docs 마크다운 전체를 raw 문자열로 번들
const RAW = import.meta.glob('/docs/**/*.md', { query: '?raw', import: 'default', eager: true });

const FOLDER_LABEL = {
  core: '📁 core (공통 규격)',
  'daily-digest': '📁 daily-digest',
  pacenote: '📁 pacenote',
  'builders-log': '📁 builders-log',
  sylphio: '📁 sylphio',
  archive: '📁 archive',
  _root: '📁 (루트)',
};
const FOLDER_ORDER = ['core', 'daily-digest', 'pacenote', 'builders-log', 'sylphio', 'archive', '_root'];

// 역할별 필독 경로 (docs 상대 경로)
const COMMON = ['core/service_overview.md', 'core/architecture_overview.md', 'core/onboarding_guide.md'];
const ROLE_PATHS = {
  '🧭 기획': ['core/business_model.md', 'pacenote/product_strategy.md', 'daily-digest/content_sourcing_policy.md', 'mac_app_business_plan.md'],
  '🎨 디자인': ['core/design_system.md', 'core/branding.md', 'core/bi_centered_ux_guide.md'],
  '💻 개발': ['core/development_guide.md', 'core/authentication_architecture.md', 'core/api_usage_analysis.md', 'data_contract_v2.md'],
};

function parseDoc(raw) {
  const fm = {};
  let body = raw;
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?/);
  if (m) {
    body = raw.slice(m[0].length);
    m[1].split('\n').forEach(line => {
      const mm = line.match(/^([A-Za-z_]+):\s*(.+)$/);
      if (mm) fm[mm[1]] = mm[2].trim();
    });
  }
  const tM = body.match(/^#\s+(.+)$/m);
  const title = tM ? tM[1].replace(/[#*`]/g, '').trim() : null;
  return { fm, body, title };
}

// 'core/service_overview.md' 기준으로 상대 href를 docs 상대경로로 해석
function resolveRel(currentRel, href) {
  if (!href || !href.endsWith('.md')) return null;
  const clean = href.split('#')[0];
  const baseDir = currentRel.includes('/') ? currentRel.slice(0, currentRel.lastIndexOf('/')) : '';
  const parts = baseDir ? baseDir.split('/') : [];
  for (const seg of clean.split('/')) {
    if (seg === '..') parts.pop();
    else if (seg !== '.' && seg !== '') parts.push(seg);
  }
  return parts.join('/');
}

export default function ServiceDocs() {
  // docs 맵: relPath -> { raw, title, fm, body }
  const docs = useMemo(() => {
    const map = {};
    for (const [absPath, raw] of Object.entries(RAW)) {
      const rel = absPath.replace(/^\/docs\//, '');
      const { fm, body, title } = parseDoc(raw);
      map[rel] = { raw, fm, body, title: title || rel };
    }
    return map;
  }, []);

  const folders = useMemo(() => {
    const g = {};
    for (const rel of Object.keys(docs)) {
      const folder = rel.includes('/') ? rel.split('/')[0] : '_root';
      (g[folder] = g[folder] || []).push(rel);
    }
    Object.values(g).forEach(arr => arr.sort());
    return g;
  }, [docs]);

  const [selected, setSelected] = useState(COMMON[0]);
  const [role, setRole] = useState('🧭 기획');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return Object.entries(docs)
      .filter(([rel, d]) => rel.toLowerCase().includes(q) || (d.title || '').toLowerCase().includes(q) || d.body.toLowerCase().includes(q))
      .map(([rel]) => rel);
  }, [query, docs]);

  const doc = docs[selected];
  const open = (rel) => { if (docs[rel]) { setSelected(rel); window.scrollTo?.(0, 0); } };

  const NavItem = ({ rel }) => (
    <button className={`svc-doc-item ${selected === rel ? 'active' : ''}`} onClick={() => open(rel)} title={rel}>
      {docs[rel]?.title || rel}
    </button>
  );

  return (
    <div className="svc-docs">
      <aside className="svc-docs-nav">
        <input className="svc-docs-search" placeholder="🔍 문서 검색…" value={query} onChange={e => setQuery(e.target.value)} />

        {filtered ? (
          <div className="svc-docs-group">
            <div className="svc-docs-group-title">검색 결과 ({filtered.length})</div>
            {filtered.map(rel => <NavItem key={rel} rel={rel} />)}
            {filtered.length === 0 && <div className="svc-docs-empty">결과 없음</div>}
          </div>
        ) : (
          <>
            {/* 역할별 필독 */}
            <div className="svc-docs-group">
              <div className="svc-docs-group-title">⭐ 필독 (공통)</div>
              {COMMON.map(rel => <NavItem key={rel} rel={rel} />)}
            </div>
            <div className="svc-docs-group">
              <div className="svc-docs-roletabs">
                {Object.keys(ROLE_PATHS).map(r => (
                  <button key={r} className={`svc-role-tab ${role === r ? 'active' : ''}`} onClick={() => setRole(r)}>{r}</button>
                ))}
              </div>
              {(ROLE_PATHS[role] || []).filter(rel => docs[rel]).map(rel => <NavItem key={rel} rel={rel} />)}
            </div>

            {/* 도메인 트리 */}
            {FOLDER_ORDER.filter(f => folders[f]).map(f => (
              <div className="svc-docs-group" key={f}>
                <div className="svc-docs-group-title">{FOLDER_LABEL[f] || f}</div>
                {folders[f].map(rel => <NavItem key={rel} rel={rel} />)}
              </div>
            ))}
          </>
        )}
      </aside>

      <main className="svc-docs-view">
        {doc ? (
          <>
            <div className="svc-docs-meta">
              <span className="svc-docs-path">{selected}</span>
              {doc.fm.status && <span className={`svc-badge status-${doc.fm.status}`}>{doc.fm.status}</span>}
              {doc.fm.version && <span className="svc-badge">{doc.fm.version}</span>}
              {doc.fm.last_updated && <span className="svc-badge muted">{doc.fm.last_updated}</span>}
            </div>
            <article className="markdown-body svc-markdown">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={{
                  a: ({ href, children }) => {
                    const target = resolveRel(selected, href);
                    if (target && docs[target]) {
                      return <a href="#" onClick={(e) => { e.preventDefault(); open(target); }}>{children}</a>;
                    }
                    return <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>;
                  },
                }}
              >
                {doc.body}
              </ReactMarkdown>
            </article>
          </>
        ) : (
          <div className="svc-docs-empty">문서를 선택하세요.</div>
        )}
      </main>
    </div>
  );
}
