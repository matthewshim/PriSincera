import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/atom-one-dark.css'; // Premium dark theme for code
import useSEO from '../hooks/useSEO';
import { PAGE_META } from '../data/seoMeta.mjs';
import logMeta from '../data/buildersLogMeta.json';
import { useTranslation } from '../contexts/LanguageContext';
import './BuildersLogDetail.css';

// Utility to separate leading emoji from text to prevent Chrome background-clip bugs on emojis
const renderTitle = (title) => {
  if (!title) return null;
  // Matches standard emojis, including supplementary and pictograph blocks
  const emojiRegex = /^([\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F000}-\u{1F9FF}]+(?:️)?)\s*(.*)$/u;
  const match = title.match(emojiRegex);
  if (match) {
    const [, emoji, restOfTitle] = match;
    return (
      <>
        <span className="title-emoji">{emoji}</span>
        <span className="title-text">{restOfTitle}</span>
      </>
    );
  }
  return <span className="title-text">{title}</span>;
};

// 헤딩 텍스트 → 앵커 id. 한글·가나·한자 보존, 그 외 연속 문자는 '-'로. (rehype-slug 동일 전략, 무의존)
const slugify = (str) =>
  String(str).trim().toLowerCase()
    .replace(/[#*`]/g, '')
    .replace(/[^\w가-힣぀-ヿ一-鿿]+/g, '-')
    .replace(/^-+|-+$/g, '');

// react-markdown children(문자열·배열·엘리먼트)에서 순수 텍스트 추출 (헤딩 id 계산용)
const nodeText = (children) => {
  if (children == null) return '';
  if (typeof children === 'string' || typeof children === 'number') return String(children);
  if (Array.isArray(children)) return children.map(nodeText).join('');
  if (children.props && children.props.children) return nodeText(children.props.children);
  return '';
};

// 본문 마크다운에서 H2/H3만 뽑아 TOC 구성. 코드펜스(```) 내부는 제외.
const buildToc = (md) => {
  const out = [];
  let inFence = false;
  for (const line of String(md).split('\n')) {
    if (/^\s*```/.test(line)) { inFence = !inFence; continue; }
    if (inFence) continue;
    const m = /^(#{2,3})\s+(.+?)\s*$/.exec(line);
    if (!m) continue;
    const text = m[2].replace(/[#*`]/g, '').trim();
    out.push({ level: m[1].length, text, id: slugify(text) });
  }
  return out;
};

export default function BuildersLogDetail() {
  const { slug } = useParams();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState('');
  const { t, locale, localize } = useTranslation();

  const articleMeta = logMeta.find(m => m.slug === slug);
  const localizedTitle = articleMeta ? localize(articleMeta.title) : "Builder's Log";
  const localizedSubtitle = articleMeta ? localize(articleMeta.subtitle) : '';
  const localizedDescription = articleMeta ? localize(articleMeta.description) : t('buildersLog.detail.fallbackDesc');

  const toc = useMemo(() => buildToc(content), [content]);
  const otherChapters = useMemo(
    () => logMeta.filter(m => m.slug !== slug).slice(0, 6),
    [slug]
  );

  const markdownComponents = useMemo(() => ({
    h2: ({ children }) => <h2 id={slugify(nodeText(children))}>{children}</h2>,
    h3: ({ children }) => <h3 id={slugify(nodeText(children))}>{children}</h3>,
  }), []);

  useSEO({
    title: `${localizedTitle} — Builder's Log`,
    description: localizedDescription,
    keywords: articleMeta && articleMeta.tags ? articleMeta.tags.join(', ') : PAGE_META['/builders-log'].keywords,
    ogUrl: `https://www.prisincera.com/builders-log/${slug}`
  });

  useEffect(() => {
    document.body.classList.add('hero-ready');
    return () => {
      document.body.classList.remove('hero-ready');
    };
  }, []);

  useEffect(() => {
    if (!articleMeta) {
      setLoading(false);
      return;
    }

    setLoading(true);
    // Waterfall loading: Try slug_locale.md first, fall back to slug.md
    const targetFile = locale && locale !== 'ko' ? `/content/logs/${slug}_${locale}.md` : `/content/logs/${slug}.md`;

    fetch(`${targetFile}?t=${Date.now()}`)
      .then(async res => {
        const text = await res.text();
        // SPA Fallback check (if 404 is rerouted to index.html)
        if (!res.ok || text.trim().toLowerCase().startsWith('<!doctype html>')) {
          if (locale && locale !== 'ko') {
            // Try default Korean file as fallback
            const fallbackRes = await fetch(`/content/logs/${slug}.md?t=${Date.now()}`);
            const fallbackText = await fallbackRes.text();
            if (!fallbackRes.ok || fallbackText.trim().toLowerCase().startsWith('<!doctype html>')) {
              throw new Error('Failed to fetch article');
            }
            return fallbackText;
          }
          throw new Error('Failed to fetch article');
        }
        return text;
      })
      .then(text => {
        setContent(text);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setContent(t('buildersLog.detail.loadFail'));
        setLoading(false);
      });

    // Record view count
    fetch(`/api/builderslog/${slug}/view`, { method: 'POST' }).catch(e => console.error(e));
  }, [slug, articleMeta, locale, localize]);

  // TOC 스크롤스파이 — 현재 뷰포트 상단에 걸린 섹션을 활성 표시
  useEffect(() => {
    if (loading || toc.length === 0) return;
    const els = toc.map(h => document.getElementById(h.id)).filter(Boolean);
    if (els.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) setActiveId(visible[0].target.id);
      },
      { rootMargin: '-15% 0px -75% 0px', threshold: 0 }
    );
    els.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [loading, toc]);

  if (!articleMeta) {
    return (
      <div className="builders-log-detail-wrapper error-state">
        <h2>Article Not Found</h2>
        <Link to="/builders-log" className="back-btn">← Back to Log</Link>
      </div>
    );
  }

  return (
    <div className="builders-log-detail-wrapper">
      <div className="detail-container" style={{ '--accent-color': articleMeta.accent }}>
        {/* 위치 경로 브레드크럼 — 전폭(1200) 배치 (design_system §9-9) */}
        <nav className="detail-crumb" aria-label={t('buildersLog.detail.ariaPath')}>
          <Link to="/builders-log" className="detail-crumb-link">Builder's Log</Link>
          <span className="detail-crumb-sep" aria-hidden="true">›</span>
          <span className="detail-crumb-cur" aria-current="page">{t('buildersLog.detail.crumbCurrent')}</span>
        </nav>

        {/* 본문(860 프로스 단) + 사이드바(목차·다른 챕터) 2단 레이아웃 */}
        <div className="detail-layout">
          <div className="detail-main">
            <div className="detail-header">
              <div className="detail-meta">
                <span className="chapter-badge">Chapter {articleMeta.chapterNo}</span>
                <span className="date-badge">{new Date(articleMeta.date).toLocaleDateString()}</span>
              </div>
              <h1 className="detail-title">{renderTitle(localizedTitle)}</h1>
              <h2 className="detail-subtitle">{localizedSubtitle}</h2>

              <div className="detail-tags">
                {articleMeta.tags.map(tag => (
                  <span key={tag} className="tag-pill">#{tag}</span>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="markdown-loading">
                <div className="admin-spinner"></div> {t('buildersLog.detail.loading')}
              </div>
            ) : (
              <article className="markdown-body">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                  components={markdownComponents}
                >
                  {content}
                </ReactMarkdown>
              </article>
            )}

            <div className="detail-footer">
              <Link to="/builders-log" className="back-btn-large">
                {t('buildersLog.detail.explore')}
              </Link>
            </div>
          </div>

          {/* 사이드바 — 1200 셸의 남는 폭 활용(sticky). 목차가 주(主), 다른 챕터가 부(副) */}
          <aside className="detail-aside">
            {toc.length > 0 && (
              <nav className="detail-toc" aria-label={t('buildersLog.detail.tocAria')}>
                <div className="detail-aside-label">{t('buildersLog.detail.onThisPage')}</div>
                <ul>
                  {toc.map(h => (
                    <li key={h.id} className={`toc-item toc-l${h.level}${activeId === h.id ? ' active' : ''}`}>
                      <a href={`#${h.id}`}>{h.text}</a>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
            {otherChapters.length > 0 && (
              <nav className="detail-other" aria-label={t('buildersLog.detail.otherChaptersAria')}>
                <div className="detail-aside-label">{t('buildersLog.detail.otherChapters')}</div>
                <ul>
                  {otherChapters.map(m => (
                    <li key={m.slug}>
                      <Link to={`/builders-log/${m.slug}`}>
                        <span className="other-ch-no">Ch.{m.chapterNo}</span>
                        <span className="other-ch-title">{localize(m.title)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
