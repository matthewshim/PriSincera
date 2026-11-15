import React, { useEffect } from 'react';
import { useTranslation } from '../contexts/LanguageContext';
import SylphioNav from '../components/layout/SylphioNav';
import SylphioDocShell from '../components/layout/SylphioDocShell';
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
  const toc = d.sections.map((section, idx) => ({ id: `section-${idx}`, label: section.title }));

  // Alert handler for preparing app Store / downloads
  const handleAlert = (e) => {
    e.preventDefault();
    alert(t('header.sylphioAlert'));
  };

  // GNB 노출 조건(§9-1)
  useEffect(() => {
    document.body.classList.add('hero-ready');
    return () => { document.body.classList.remove('hero-ready'); };
  }, []);

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

      <SylphioDocShell items={toc} tocLabel={d.tocLabel}>
        <div className="sylphio-privacy-intro u-prewrap">
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
      </SylphioDocShell>
    </div>
  );
}
