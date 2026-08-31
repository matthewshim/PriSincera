/**
 * PlannersView — 기획자의 시선(Planner's View) 섹션
 *
 * 뷰 중심 IA: `/planners-view` = 최신 글 본문, `/planners-view/:slug` = 퍼머링크.
 * 목록 페이지는 두지 않는다(초기 편수가 적어 목록이 관문 역할만 하기 때문).
 * - 루트는 섹션 히어로(§9-1) + 최신 글, 퍼머링크는 브레드크럼(§9-9) + 글.
 * - canonical 은 항상 퍼머링크 — 루트와 퍼머링크가 같은 본문을 렌더하므로 중복 색인을 차단한다.
 * - 사이드바(목차 主 + 다른 글 副)는 1100px 이하에서 사라지므로, 본문 하단 크로스 내비를
 *   상시 배치해 모바일에서 탐색 수단이 0이 되지 않게 한다(§9-11 하단 CTA 분리 규범).
 */
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/atom-one-dark.css';
import useSEO from '../hooks/useSEO';
import { PAGE_META, BASE_URL } from '../data/seoMeta.mjs';
import notesMeta from '../data/plannersViewMeta.json';
import { useTranslation } from '../contexts/LanguageContext';
import { slugify, nodeText, buildToc } from '../lib/toc';
import '../styles/markdown-body.css';
import './PlannersView.css';

const CONTENT_DIR = '/content/planners-view';
const SECTION_ICON = '🧭';

// 제목이 이모지로 시작하면 히어로 아이콘으로 승격하고 제목에서 뺀다(아이콘 중복 방지, §9-1)
const splitTitle = (title) => {
  if (!title) return { icon: SECTION_ICON, text: '' };
  const m = title.match(/^([\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F000}-\u{1F9FF}]+(?:️)?)\s*(.*)$/u);
  return m ? { icon: m[1], text: m[2] } : { icon: SECTION_ICON, text: title };
};

export default function PlannersView() {
  const { slug } = useParams();
  const { t, locale, localize } = useTranslation();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState('');

  const isRoot = !slug;
  const article = slug ? notesMeta.find((n) => n.slug === slug) : notesMeta[0];
  const currentSlug = article ? article.slug : '';

  const title = article ? localize(article.title) : "Planner's View";
  const subtitle = article ? localize(article.subtitle) : '';
  const description = article ? localize(article.description) : PAGE_META['/planners-view'].description;
  const canonical = article ? `${BASE_URL}/planners-view/${article.slug}` : `${BASE_URL}/planners-view`;

  const toc = useMemo(() => buildToc(content), [content]);
  const otherNotes = useMemo(
    () => notesMeta.filter((n) => n.slug !== currentSlug).slice(0, 5),
    [currentSlug]
  );

  const markdownComponents = useMemo(() => ({
    h2: ({ children }) => <h2 id={slugify(nodeText(children))}>{children}</h2>,
    h3: ({ children }) => <h3 id={slugify(nodeText(children))}>{children}</h3>,
  }), []);

  useSEO({
    title: `${title} — Planner's View`,
    description,
    keywords: article && article.tags ? article.tags.join(', ') : PAGE_META['/planners-view'].keywords,
    ogImage: PAGE_META['/planners-view'].ogImage,
    ogUrl: canonical,
  });

  useEffect(() => {
    document.body.classList.add('hero-ready');
    return () => { document.body.classList.remove('hero-ready'); };
  }, []);

  useEffect(() => {
    if (!currentSlug) { setLoading(false); return; }
    setLoading(true);
    // 로케일 우선 → 없으면 한국어 원문 폴백 (SPA 404가 index.html로 되돌아오는 경우까지 판정)
    const target = locale && locale !== 'ko'
      ? `${CONTENT_DIR}/${currentSlug}_${locale}.md`
      : `${CONTENT_DIR}/${currentSlug}.md`;

    let cancelled = false;
    const isHtml = (text) => text.trim().toLowerCase().startsWith('<!doctype html>');

    fetch(`${target}?t=${Date.now()}`)
      .then(async (res) => {
        const text = await res.text();
        if (!res.ok || isHtml(text)) {
          if (locale && locale !== 'ko') {
            const fb = await fetch(`${CONTENT_DIR}/${currentSlug}.md?t=${Date.now()}`);
            const fbText = await fb.text();
            if (!fb.ok || isHtml(fbText)) throw new Error('Failed to fetch note');
            return fbText;
          }
          throw new Error('Failed to fetch note');
        }
        return text;
      })
      .then((text) => { if (!cancelled) { setContent(text); setLoading(false); } })
      .catch((err) => {
        console.error(err);
        if (!cancelled) { setContent(t('plannersView.loadFail')); setLoading(false); }
      });

    return () => { cancelled = true; };
  }, [currentSlug, locale, t]);

  // 목차 스크롤스파이 — 현재 뷰포트 상단에 걸린 섹션을 활성 표시
  useEffect(() => {
    if (loading || toc.length === 0) return;
    const els = toc.map((h) => document.getElementById(h.id)).filter(Boolean);
    if (els.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) setActiveId(visible[0].target.id);
      },
      { rootMargin: '-15% 0px -75% 0px', threshold: 0 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [loading, toc]);

  // 없는 슬러그는 섹션 루트로 수렴 (루트에 글이 없으면 빈 상태를 렌더 — 리다이렉트 루프 방지)
  if (!article) {
    if (slug) return <Navigate to="/planners-view" replace />;
    return (
      <div className="pv-wrapper">
        <div className="pv-container pv-empty">
          <div className="pv-hero-icon">🧭</div>
          <h1 className="hero-heading">Planner&apos;s View</h1>
          <p className="pv-empty-msg">{t('plannersView.empty')}</p>
          <Link to="/builders-log" className="pv-cross-cta">{t('plannersView.crossCta')}</Link>
        </div>
      </div>
    );
  }

  const readTime = t('plannersView.readTime', { min: article.readMinutes || 1 });
  const pullQuote = article.pullQuote ? localize(article.pullQuote) : '';
  const authorRole = article.author && article.author.role ? localize(article.author.role) : '';
  const { icon: heroIcon, text: heroTitleText } = splitTitle(title);

  const crossNav = (
    <section className="pv-more" aria-label={t('plannersView.otherNotesAria')}>
      <div className="pv-more-label">{t('plannersView.moreLabel')}</div>
      <div className="pv-more-grid">
        {otherNotes.map((n) => (
          <Link key={n.slug} to={`/planners-view/${n.slug}`} className="pv-more-card">
            <span className="pv-more-date">{new Date(n.date).toLocaleDateString()}</span>
            <span className="pv-more-title">{localize(n.title)}</span>
          </Link>
        ))}
        {/* 다른 글이 없을 때도 탐색이 끊기지 않도록 형제 섹션으로 잇는다 */}
        <Link to="/builders-log" className="pv-more-card pv-more-cross">
          <span className="pv-more-date">Builder&apos;s Log</span>
          <span className="pv-more-title">{t('plannersView.crossCta')}</span>
        </Link>
      </div>
    </section>
  );

  return (
    <div className="pv-wrapper">
      <div className="pv-container" style={{ '--accent-color': article.accent }}>
        {/* 상단 내비 — 퍼머링크는 브레드크럼(§9-9), 루트는 동어반복 링크 대신 현재 위치 라벨만 */}
        <nav className="pv-crumb" aria-label={t('plannersView.ariaPath')}>
          {isRoot ? (
            <span className="pv-crumb-cur" aria-current="page">Planner&apos;s View</span>
          ) : (
            <>
              <Link to="/planners-view" className="pv-crumb-link">Planner&apos;s View</Link>
              <span className="pv-crumb-sep" aria-hidden="true">›</span>
              <span className="pv-crumb-cur" aria-current="page">{t('plannersView.crumbCurrent')}</span>
            </>
          )}
        </nav>

        {/* 뷰 히어로 — §9-1 표준(아이콘 → h1 → 서브카피). 루트·퍼머링크 동일 규격 */}
        <header className="pv-hero">
          <div className="pv-hero-inner">
            <div className="pv-hero-icon">{heroIcon}</div>
            <h1 className="pv-title">{heroTitleText}</h1>
            <p className="pv-subtitle">{subtitle}</p>

            <div className="pv-meta">
              <span className="pv-badge">{t('plannersView.badge')}</span>
              <span className="pv-meta-item">{new Date(article.date).toLocaleDateString()}</span>
              <span className="pv-meta-sep">•</span>
              <span className="pv-meta-item">{readTime}</span>
            </div>

            {article.author && (
              <div className="pv-byline">
                <span className="pv-byline-name">{article.author.name}</span>
                {authorRole && <span className="pv-byline-role">{authorRole}</span>}
              </div>
            )}

            {article.tags && article.tags.length > 0 && (
              <div className="pv-tags">
                {article.tags.map((tag) => (
                  <span key={tag} className="pv-tag">#{tag}</span>
                ))}
              </div>
            )}
          </div>
        </header>

        <div className="pv-layout">
          <div className="pv-main">
            {pullQuote && <p className="pv-pullquote">{pullQuote}</p>}

            {loading ? (
              <div className="pv-loading">
                <span className="pv-spinner" aria-hidden="true"></span>
                {t('plannersView.loading')}
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

            <p className="pv-disclaimer">{t('plannersView.disclaimer')}</p>

            {crossNav}
          </div>

          <aside className="pv-aside">
            {toc.length > 0 && (
              <nav className="pv-toc" aria-label={t('plannersView.tocAria')}>
                <div className="pv-aside-label">{t('plannersView.onThisPage')}</div>
                <ul>
                  {toc.map((h) => (
                    <li key={h.id} className={`pv-toc-item pv-toc-l${h.level}${activeId === h.id ? ' active' : ''}`}>
                      <a href={`#${h.id}`}>{h.text}</a>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
            {otherNotes.length > 0 && (
              <nav className="pv-other" aria-label={t('plannersView.otherNotesAria')}>
                <div className="pv-aside-label">{t('plannersView.otherNotes')}</div>
                <ul>
                  {otherNotes.map((n) => (
                    <li key={n.slug}>
                      <Link to={`/planners-view/${n.slug}`}>{localize(n.title)}</Link>
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
