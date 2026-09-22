/**
 * PlannersView — 기획자의 시선 목록 (`/planners-view`)
 *
 * IA v2.0: 루트 = 목록, `/planners-view/:slug` = 글(PlannersViewDetail).
 * - 시리즈별로 묶고 **연재 정순**으로 나열한다. 연재는 1편부터 읽어야 하므로
 *   블로그 관습(역순)을 따르지 않는다(publishing_guide v2.0 / content_guide §3).
 * - 시리즈 제목·설명의 단일 소스는 plannersViewSeries.json — 글 메타에 복사하지 않는다.
 * - 카드는 design_system §9-3 리스트형 규격(실효 패딩 18px·gap 14px·호버 단일 규격·
 *   focus-visible 미러링)을 그대로 쓴다. 섹션마다 카드 형식을 새로 발명하지 않는다.
 */
import React, { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import useSEO from '../hooks/useSEO';
import { PAGE_META } from '../data/seoMeta.mjs';
import notesMeta from '../data/plannersViewMeta.json';
import seriesMeta from '../data/plannersViewSeries.json';
import { useTranslation } from '../contexts/LanguageContext';
import './PlannersView.css';

export default function PlannersView() {
  const { t, localize } = useTranslation();

  useSEO({
    title: PAGE_META['/planners-view'].pageTitle,
    description: PAGE_META['/planners-view'].description,
    keywords: PAGE_META['/planners-view'].keywords,
    ogImage: PAGE_META['/planners-view'].ogImage,
    ogUrl: 'https://www.prisincera.com/planners-view',
  });

  useEffect(() => {
    document.body.classList.add('hero-ready');
    return () => { document.body.classList.remove('hero-ready'); };
  }, []);

  // 배열 맨 앞이 최신 — NEW 배지 기준
  const latestSlug = notesMeta.length > 0 ? notesMeta[0].slug : '';

  // 시리즈 정본 순서대로 묶고, 시리즈에 속하지 않는 글은 마지막 '단독 글' 묶음으로
  const groups = useMemo(() => {
    const out = seriesMeta
      .map((def) => ({
        key: def.id,
        def,
        items: notesMeta
          .filter((n) => n.series && n.series.id === def.id)
          .sort((a, b) => a.series.order - b.series.order),
      }))
      .filter((g) => g.items.length > 0);

    const standalone = notesMeta.filter((n) => !n.series);
    if (standalone.length > 0) {
      out.push({ key: '__standalone', def: null, items: standalone });
    }
    return out;
  }, []);

  return (
    <div className="pvl-wrapper">
      <div className="pvl-container">
        <header className="pvl-hero">
          <div className="pvl-hero-icon">🧭</div>
          <h1 className="pvl-hero-title">Planner&apos;s View</h1>
          <p className="pvl-hero-copy">{t('plannersView.heroParagraph')}</p>
        </header>

        {groups.length === 0 ? (
          <div className="pvl-empty">
            <p className="pvl-empty-msg">{t('plannersView.empty')}</p>
            <Link to="/builders-log" className="pvl-cross-cta">{t('plannersView.crossCta')}</Link>
          </div>
        ) : (
          groups.map((g) => (
            <section key={g.key} className="pvl-series">
              <div className="pvl-series-head">
                <h2 className="pvl-series-title">
                  {g.def ? localize(g.def.title) : t('plannersView.standalone')}
                </h2>
                {g.def && <p className="pvl-series-desc">{localize(g.def.description)}</p>}
              </div>

              <div className="pvl-grid">
                {g.items.map((n) => (
                  <Link key={n.slug} to={`/planners-view/${n.slug}`} className="pvl-card">
                    <div className="pvl-card-meta">
                      {n.series && (
                        <span className="pvl-part">{t('plannersView.part', { n: n.series.order })}</span>
                      )}
                      <span className="pvl-date">{new Date(n.date).toLocaleDateString()}</span>
                      <span className="pvl-sep">•</span>
                      <span className="pvl-read">{t('plannersView.readTime', { min: n.readMinutes || 1 })}</span>
                      {n.slug === latestSlug && <span className="pvl-new">{t('plannersView.newBadge')}</span>}
                    </div>
                    <h3 className="pvl-card-title">{localize(n.title)}</h3>
                    <p className="pvl-card-sub">{localize(n.subtitle)}</p>
                  </Link>
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
