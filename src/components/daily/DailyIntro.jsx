import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../contexts/LanguageContext';
import './DailyIntro.css';

export default function DailyIntro() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const observerRef = useRef(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
        }
      });
    }, { threshold: 0.15 });

    const elements = document.querySelectorAll('.reveal-on-scroll');
    elements.forEach(el => observerRef.current.observe(el));

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, []);

  return (
    <div className="daily-intro-wrapper">

      {/* ── 2. Bento Box Value Props ── */}
      <section className="intro-bento-section">
        <div className="bento-grid">
          
          {/* Curation (Large) */}
          <div className="bento-card card-curation reveal-on-scroll">
            <div className="bento-content">
              <span className="bento-icon">📡</span>
              <h3 className="bento-title" dangerouslySetInnerHTML={{ __html: t('dailyDigest.introSection1Title') }}></h3>
              <p className="bento-desc" dangerouslySetInnerHTML={{ __html: t('dailyDigest.introSection1Desc') }}></p>
            </div>
            <div className="bento-visual visual-scan">
              <div className="scan-line"></div>
              <div className="scan-content">
                <div className="skeleton-line w-80"></div>
                <div className="skeleton-line w-60"></div>
                <div className="skeleton-line highlight">{t('dailyDigest.introSection1Highlight')}</div>
                <div className="skeleton-line w-90"></div>
              </div>
            </div>
          </div>

          {/* AI Prompt (Medium) */}
          <div className="bento-card card-prompt reveal-on-scroll delay-1">
            <div className="bento-content">
              <span className="bento-icon">🤖</span>
              <h3 className="bento-title" dangerouslySetInnerHTML={{ __html: t('dailyDigest.introSection2Title') }}></h3>
              <p className="bento-desc" dangerouslySetInnerHTML={{ __html: t('dailyDigest.introSection2Desc') }}></p>
            </div>
            <div className="bento-visual visual-code">
              <div className="code-header">
                <span className="dot r"></span><span className="dot y"></span><span className="dot g"></span>
              </div>
              <div className="code-body">
                <code><span className="keyword">Prompt</span> <span className="string">"Act as a Data Analyst..."</span></code>
                <code><span className="keyword">Focus</span> <span className="string">[User Retention]</span></code>
                <div className="typing-cursor"></div>
              </div>
            </div>
          </div>

          {/* Business Language (Medium) */}
          <div className="bento-card card-lang reveal-on-scroll delay-2">
            <div className="bento-content">
              <span className="bento-icon">🇯🇵</span>
              <h3 className="bento-title" dangerouslySetInnerHTML={{ __html: t('dailyDigest.introSection3Title') }}></h3>
              <p className="bento-desc" dangerouslySetInnerHTML={{ __html: t('dailyDigest.introSection3Desc') }}></p>
            </div>
            <div className="bento-visual visual-wave">
              <div className="wave-bars">
                <div className="bar"></div><div className="bar"></div><div className="bar"></div><div className="bar"></div><div className="bar"></div>
              </div>
            </div>
          </div>



        </div>
      </section>

      {/* ── 3. Pipeline Section ── */}
      <section className="intro-pipeline reveal-on-scroll">
        <h2 className="section-heading">{t('dailyDigest.introPipelineTitle')}</h2>
        <div className="pipeline-steps">
          <div className="step-item">
            <div className="step-circle">01</div>
            <h4>{t('dailyDigest.introPipelineStep1Title')}</h4>
            <p>{t('dailyDigest.introPipelineStep1Desc')}</p>
          </div>
          <div className="step-arrow">➔</div>
          <div className="step-item">
            <div className="step-circle">02</div>
            <h4>{t('dailyDigest.introPipelineStep2Title')}</h4>
            <p>{t('dailyDigest.introPipelineStep2Desc')}</p>
          </div>
          <div className="step-arrow">➔</div>
          <div className="step-item">
            <div className="step-circle">03</div>
            <h4>{t('dailyDigest.introPipelineStep3Title')}</h4>
            <p>{t('dailyDigest.introPipelineStep3Desc')}</p>
          </div>
        </div>
      </section>

      {/* ── 4. CTA ── */}
      <section className="intro-cta reveal-on-scroll">
        <button 
          className="cta-button" 
          onClick={() => {
            navigate('/daily#daily');
            window.scrollTo(0, 0);
          }}
        >
          {t('dailyDigest.introCtaBtn')}
        </button>
      </section>

    </div>
  );
}
