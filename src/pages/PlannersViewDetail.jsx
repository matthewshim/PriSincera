/**
 * PlannersViewDetail — 기획자의 시선 글 상세 (`/planners-view/:slug`)
 *
 * 목록은 PlannersView.jsx 가 담당한다(루트 = 목록, publishing_guide v2.0).
 * - 브레드크럼(§9-9) → 표준 히어로(§9-1 아이콘 → h1 → 서브카피) → 본문 2단(§9-11)
 * - canonical 은 자기참조. 퍼머링크는 절대 리다이렉트하지 않는다(공유 링크 보전).
 * - 사이드바(목차 主 + 이 시리즈 副)는 1100px 이하에서 사라지므로, 하단 연재 내비를
 *   상시 배치해 모바일에서 순서 이동 수단이 0이 되지 않게 한다(§9-11 v5.22).
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
import seriesMeta from '../data/plannersViewSeries.json';
import { useTranslation } from '../contexts/LanguageContext';
import { slugify, nodeText, buildToc } from '../lib/toc';
import '../styles/markdown-body.css';
import './PlannersViewDetail.css';

const CONTENT_DIR = '/content/planners-view';
const SECTION_ICON = '🧭';

// 제목이 이모지로 시작하면 히어로 아이콘으로 승격하고 제목에서 뺀다(아이콘 중복 방지, §9-1)
const splitTitle = (title) => {
  if (!title) return { icon: SECTION_ICON, text: '' };
  const m = title.match(/^([\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F000}-\u{1F9FF}]+(?:️)?)\s*(.*)$/u);
  return m ? { icon: m[1], text: m[2] } : { icon: SECTION_ICON, text: title };
};

export default function PlannersViewDetail() {
  const { slug } = useParams();
  const { t, locale, localize } = useTranslation();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState('');

  const article = notesMeta.find((n) => n.slug === slug);
  const currentSlug = article ? article.slug : '';

  // 연재 순서(order)로 정렬한 같은 시리즈의 글 — 목차·이전/다음 내비의 단일 소스
  const seriesInfo = useMemo(() => {
    if (!article || !article.series) return null;
    const def = seriesMeta.find((x) => x.id === article.series.id);
    const items = notesMeta
      .filter((n) => n.series && n.series.id === article.series.id)
      .sort((a, b) => a.series.order - b.series.order);
    const idx = items.findIndex((n) => n.slug === article.slug);
    return {
      def,
      items,
      index: idx,
      prev: idx > 0 ? items[idx - 1] : null,
      next: idx >= 0 && idx < items.length - 1 ? items[idx + 1] : null,
    };
  }, [article]);

  const title = article ? localize(article.title) : "Planner's View";
  const subtitle = article ? localize(article.subtitle) : '';
  const description = article ? localize(article.description) : PAGE_META['/planners-view'].description;
  const canonical = article ? `${BASE_URL}/planners-view/${article.slug}` : `${BASE_URL}/planners-view`;

  const toc = useMemo(() => buildToc(content), [content]);
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

  // 없는 슬러그는 목록으로 수렴 (목록이 루트이므로 리다이렉트 루프가 없다)
  if (!article) return <Navigate to="/planners-view" replace />;

  const readTime = t('plannersView.readTime', { min: article.readMinutes || 1 });
  const pullQuote = article.pullQuote ? localize(article.pullQuote) : '';
  const authorRole = article.author && article.author.role ? localize(article.author.role) : '';
  const { icon: heroIcon, text: heroTitleText } = splitTitle(title);

  // 하단 연재 내비 — 사이드바가 숨겨지는 폭(≤1100px)에서 유일한 순서 이동 수단이므로 상시 배치(§9-11 v5.22)
  const seriesNav = (
    <section className="pv-seriesnav" aria-label={t('plannersView.seriesNavAria')}>
      <div className="pv-seriesnav-grid">
        {seriesInfo && seriesInfo.prev ? (
          <Link to={`/planners-view/${seriesInfo.prev.slug}`} className="pv-seriesnav-card pv-seriesnav-prev">
            <span className="pv-seriesnav-dir">← {t('plannersView.prevPart')}</span>
            <span className="pv-seriesnav-title">{localize(seriesInfo.prev.title)}</span>
          </Link>
        ) : (
          <span className="pv-seriesnav-card pv-seriesnav-empty">
            <span className="pv-seriesnav-dir">{t('plannersView.seriesStart')}</span>
          </span>
        )}
        {seriesInfo && seriesInfo.next ? (
          <Link to={`/planners-view/${seriesInfo.next.slug}`} className="pv-seriesnav-card pv-seriesnav-next">
            <span className="pv-seriesnav-dir">{t('plannersView.nextPart')} →</span>
            <span className="pv-seriesnav-title">{localize(seriesInfo.next.title)}</span>
          </Link>
        ) : (
          <span className="pv-seriesnav-card pv-seriesnav-empty">
            <span className="pv-seriesnav-dir">{t('plannersView.seriesEnd')}</span>
          </span>
        )}
      </div>
      <Link to="/planners-view" className="pv-backtolist">{t('plannersView.backToList')}</Link>
    </section>
  );

  return (
    <div className="pv-wrapper">
      <div className="pv-container" style={{ '--accent-color': article.accent }}>
        {/* 상단 내비 — 상위는 목록, 현재 노드는 연재물이면 시리즈명(§9-9).
            시리즈 전용 URL이 없으므로 3뎁스로 늘리지 않고 2뎁스를 유지한다. */}
        <nav className="pv-crumb" aria-label={t('plannersView.ariaPath')}>
          <Link to="/planners-view" className="pv-crumb-link">Planner&apos;s View</Link>
          <span className="pv-crumb-sep" aria-hidden="true">›</span>
          <span className="pv-crumb-cur" aria-current="page">
            {seriesInfo && seriesInfo.def
              ? localize(seriesInfo.def.title)
              : t('plannersView.crumbCurrent')}
          </span>
        </nav>

        {/* 뷰 히어로 — §9-1 표준(아이콘 → h1 → 서브카피) */}
        <header className="pv-hero">
          <div className="pv-hero-inner">
            <div className="pv-hero-icon">{heroIcon}</div>
            <h1 className="pv-title">{heroTitleText}</h1>
            <p className="pv-subtitle">{subtitle}</p>

            <div className="pv-meta">
              <span className="pv-badge">
                {seriesInfo && seriesInfo.def
                  ? t('plannersView.part', { n: article.series.order })
                  : t('plannersView.badge')}
              </span>
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

            {seriesNav}
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
            {seriesInfo && seriesInfo.items.length > 1 && (
              <nav className="pv-other" aria-label={t('plannersView.seriesTocAria')}>
                <div className="pv-aside-label">
                  {seriesInfo.def ? localize(seriesInfo.def.title) : t('plannersView.otherNotes')}
                </div>
                <ul>
                  {seriesInfo.items.map((n) => {
                    const isCurrent = n.slug === article.slug;
                    return (
                      <li key={n.slug} className={isCurrent ? 'pv-other-current' : undefined}>
                        {isCurrent ? (
                          <span aria-current="true">
                            <span className="pv-other-no">{t('plannersView.part', { n: n.series.order })}</span>
                            <span className="pv-other-title">{localize(n.title)}</span>
                          </span>
                        ) : (
                          <Link to={`/planners-view/${n.slug}`}>
                            <span className="pv-other-no">{t('plannersView.part', { n: n.series.order })}</span>
                            <span className="pv-other-title">{localize(n.title)}</span>
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </nav>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
