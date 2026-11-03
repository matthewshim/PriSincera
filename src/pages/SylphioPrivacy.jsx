import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../contexts/LanguageContext';
import SylphioNav from '../components/layout/SylphioNav';
import './SylphioPrivacy.css';
import useSEO from '../hooks/useSEO';
import { PAGE_META } from '../data/seoMeta.mjs';
import Icon from '../components/common/Icon';

export default function SylphioPrivacy() {
  const { t } = useTranslation();

  useSEO({
    title: PAGE_META['/sylphio/privacy'].pageTitle,
    description: PAGE_META['/sylphio/privacy'].description,
    keywords: PAGE_META['/sylphio/privacy'].keywords,
    ogUrl: 'https://www.prisincera.com/sylphio/privacy'
  });
  const d = t('sylphio.privacy');
  const [activeId, setActiveId] = useState('');
  const tocLabel = t('sylphio.privacy.tocLabel');

  // Alert handler for preparing app Store / downloads
  const handleAlert = (e) => {
    e.preventDefault();
    alert(t('header.sylphioAlert'));
  };

  // GNB activation hook (adds hero-ready class to document.body)
  useEffect(() => {
    document.body.classList.add('hero-ready');
    return () => {
      document.body.classList.remove('hero-ready');
    };
  }, []);

  // 목차 스크롤스파이 — 현재 뷰포트 상단 섹션 활성 표시
  useEffect(() => {
    const els = d.sections.map((_, idx) => document.getElementById(`section-${idx}`)).filter(Boolean);
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
  }, [d]);

  return (
    <div className="sylphio-privacy">
      {/* 2Depth LNB 상단 공통 히어로 영역 */}
      <section className="sylphio-hero">
        
        <h1>{d.heroTitle}</h1>
        
        <p className="tagline u-prewrap">
          {d.heroTagline}
        </p>
        
        <div className="sylphio-hero-ctas">
          <a 
            href="#" 
            onClick={handleAlert} 
            className="btn-primary"
            id="btn-download-mac"
          >
            <Icon name="download" /><span>{d.heroCtaDownload}</span>
          </a>
        </div>
        <p className="u-fineprint">{d.heroSysReq}</p>
      </section>

      <SylphioNav />

      <div className="sylphio-doc-layout">
        <div className="sylphio-privacy-main">
          <div className="sylphio-privacy-intro">
            {d.intro}
          </div>

          {d.sections.map((section, idx) => (
            <section className="sylphio-privacy-section" id={`section-${idx}`} key={idx}>
              <h2>{section.title}</h2>
              {section.content && (
                <p className="u-prewrap">{section.content}</p>
              )}
              {section.bullets && (
                <ul>
                  {section.bullets.map((bullet, bIdx) => (
                    <li key={bIdx} className="u-prewrap">{bullet}</li>
                  ))}
                </ul>
              )}
              {idx < d.sections.length - 1 && <hr className="sylphio-privacy-divider" />}
            </section>
          ))}
        </div>

        {/* 목차 사이드바 — 1200 셸의 남는 폭 활용(sticky), 섹션 점프 */}
        <aside className="sylphio-doc-aside">
          <nav className="sylphio-doc-toc" aria-label={tocLabel}>
            <div className="sylphio-doc-toc-label">{tocLabel}</div>
            <ul>
              {d.sections.map((section, idx) => (
                <li key={idx} className={`sylphio-toc-item${activeId === `section-${idx}` ? ' active' : ''}`}>
                  <a href={`#section-${idx}`}>{section.title}</a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
      </div>
    </div>
  );
}
