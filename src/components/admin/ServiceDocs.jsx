/**
 * ServiceDocs — Admin 「서비스 문서」 허브
 *
 * docs/ 의 모든 마크다운을 빌드 타임에 번들(Vite glob ?raw)하여 admin 내에서 열람.
 * - 역할별 필독 경로(기획/디자인/개발) + 도메인 폴더 트리 + 검색
 * - react-markdown(remark-gfm, rehype-highlight) 재사용 — BuildersLog와 동일 렌더
 * - 문서 간 .md 링크는 뷰어 내에서 전환(내부 네비게이션)
 */
import { useMemo, useState, useEffect, useCallback } from 'react';
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

// 제목에 이모지가 없는 문서에 부여할 폴더별 fallback 이모지 (이곳은 중복 무방)
const FOLDER_EMOJI = {
  core: '📘', 'daily-digest': '🗞️', pacenote: '⛵',
  'builders-log': '📝', sylphio: '🌬️', archive: '🗄️', _root: '📄',
};
const LEADING_EMOJI_RE = /^\p{Extended_Pictographic}/u;

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
      const t = title || rel;
      // 제목에 이모지가 없으면 폴더 fallback 이모지를 붙여 목록 일관성 확보
      const folder = rel.includes('/') ? rel.split('/')[0] : '_root';
      const navTitle = LEADING_EMOJI_RE.test(t.trim()) ? t : `${FOLDER_EMOJI[folder] || '📄'} ${t}`;
      map[rel] = { raw, fm, body, title: t, navTitle };
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

  // 저장 후 낙관적 반영(배포 전까지 번들 raw 대신 편집본 표시): rel -> raw
  const [overrides, setOverrides] = useState({});
  const baseDoc = docs[selected];
  const liveRaw = overrides[selected] ?? baseDoc?.raw;
  const doc = useMemo(() => {
    if (!liveRaw) return null;
    const { fm, body, title } = parseDoc(liveRaw);
    return { ...baseDoc, raw: liveRaw, fm, body, title: title || baseDoc?.title };
  }, [liveRaw, baseDoc]);

  // ── 수정 모드 ──
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [summary, setSummary] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState(null); // { type:'ok'|'err', text }

  // ── 수정 이력 ──
  const [history, setHistory] = useState([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  const token = () => sessionStorage.getItem('admin_token');
  const docPath = selected ? `docs/${selected}` : null;

  const open = (rel) => {
    if (docs[rel]) {
      setSelected(rel);
      setEditing(false);
      setSaveMsg(null);
      window.scrollTo?.(0, 0);
    }
  };

  const loadHistory = useCallback(async () => {
    if (!docPath) return;
    setHistoryLoading(true);
    try {
      const res = await fetch(`/admin/api/docs/history?path=${encodeURIComponent(docPath)}`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      const data = await res.json();
      setHistory(res.ok ? (data.history || []) : []);
    } catch {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }, [docPath]);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  const startEdit = () => {
    setDraft(liveRaw || '');
    setSummary('');
    setSaveMsg(null);
    setEditing(true);
  };

  const saveEdit = async () => {
    if (!draft.trim()) { setSaveMsg({ type: 'err', text: '본문이 비어 있습니다.' }); return; }
    setSaving(true);
    setSaveMsg(null);
    try {
      const res = await fetch('/admin/api/docs/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ path: docPath, content: draft, summary }),
      });
      const data = await res.json();
      if (!res.ok) { setSaveMsg({ type: 'err', text: data.error || '저장 실패' }); return; }
      setOverrides(prev => ({ ...prev, [selected]: draft })); // 낙관적 반영
      setEditing(false);
      setSaveMsg({ type: 'ok', text: data.message || '저장되었습니다.' });
      loadHistory();
    } catch (e) {
      setSaveMsg({ type: 'err', text: `네트워크 오류: ${e.message}` });
    } finally {
      setSaving(false);
    }
  };

  const fmtDate = (iso) => {
    if (!iso) return '';
    try { return new Date(iso).toLocaleString('ko-KR', { dateStyle: 'medium', timeStyle: 'short' }); }
    catch { return iso.slice(0, 10); }
  };

  // 현재 문서(편집본 반영)를 .md 파일로 다운로드
  const downloadMd = () => {
    const raw = liveRaw || '';
    if (!raw) return;
    const base = (selected || 'document').split('/').pop();
    const filename = base.endsWith('.md') ? base : `${base}.md`;
    const blob = new Blob([raw], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const NavItem = ({ rel }) => (
    <button className={`svc-doc-item ${selected === rel ? 'active' : ''}`} onClick={() => open(rel)} title={rel}>
      {docs[rel]?.navTitle || docs[rel]?.title || rel}
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
              {overrides[selected] && <span className="svc-badge status-active" title="저장됨 — 배포 반영 대기">● 편집본(반영 대기)</span>}
              {!editing && <button className="svc-edit-btn" onClick={startEdit}>✏️ 수정</button>}
            </div>

            {saveMsg && <div className={`svc-savemsg ${saveMsg.type}`}>{saveMsg.text}</div>}

            {editing ? (
              <div className="svc-editor">
                <textarea
                  className="svc-editor-area"
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                  spellCheck={false}
                />
                <div className="svc-editor-bar">
                  <input
                    className="svc-editor-summary"
                    placeholder="수정 요약 (예: 셋업 절차 보완) — 이력에 표시됩니다"
                    value={summary}
                    onChange={e => setSummary(e.target.value)}
                    maxLength={80}
                  />
                  <button className="svc-btn ghost" onClick={() => setEditing(false)} disabled={saving}>취소</button>
                  <button className="svc-btn primary" onClick={saveEdit} disabled={saving}>
                    {saving ? '저장 중…' : '💾 저장(커밋)'}
                  </button>
                </div>
                <p className="svc-editor-hint">저장 시 GitHub main에 커밋되며 약 3~4분 후 배포에 반영됩니다. 편집자는 로그인 계정으로 자동 기록됩니다.</p>
              </div>
            ) : (
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
            )}

            {!editing && (
              <section className="svc-history">
                <button className="svc-history-head" onClick={() => setHistoryOpen(o => !o)}>
                  📜 수정 이력 {history.length > 0 && `(${history.length})`} <span className="svc-history-caret">{historyOpen ? '▾' : '▸'}</span>
                </button>
                {historyOpen && (
                  <div className="svc-history-body">
                    {historyLoading ? (
                      <div className="svc-history-empty">불러오는 중…</div>
                    ) : history.length === 0 ? (
                      <div className="svc-history-empty">기록된 수정 이력이 없습니다.</div>
                    ) : (
                      history.map(h => (
                        <div className="svc-history-row" key={h.sha}>
                          <span className="svc-history-date">{fmtDate(h.date)}</span>
                          <span className="svc-history-editor">{h.editor}</span>
                          <span className="svc-history-summary">{h.summary}</span>
                          {h.url && <a className="svc-history-diff" href={h.url} target="_blank" rel="noopener noreferrer">diff ↗</a>}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </section>
            )}

            {!editing && (
              <div className="svc-docs-footer">
                <button
                  className="svc-download-btn"
                  onClick={downloadMd}
                  title={`${(selected || '').split('/').pop()} 내려받기`}
                >
                  📥 .md 다운로드
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="svc-docs-empty">문서를 선택하세요.</div>
        )}
      </main>
    </div>
  );
}
