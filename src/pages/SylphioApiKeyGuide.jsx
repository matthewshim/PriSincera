import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../contexts/LanguageContext';
import SylphioNav from '../components/layout/SylphioNav';
import './SylphioApiKeyGuide.css';
import useSEO from '../hooks/useSEO';
import { PAGE_META } from '../data/seoMeta.mjs';
import Icon from '../components/common/Icon';

export default function SylphioApiKeyGuide() {
  const { locale, t } = useTranslation();

  useSEO({
    title: PAGE_META['/sylphio/guide'].pageTitle,
    description: PAGE_META['/sylphio/guide'].description,
    keywords: PAGE_META['/sylphio/guide'].keywords,
    ogUrl: 'https://www.prisincera.com/sylphio/guide'
  });
  const d = t('sylphio.guide');
  const [activeId, setActiveId] = useState('');
  const tocLabel = t('sylphio.guide.tocLabel');
  const toc = [
    { id: 'section-gemini', label: d.geminiTitle },
    { id: 'section-openai', label: d.openaiTitle },
    { id: 'section-app', label: d.appSetupTitle },
    { id: 'section-faq', label: d.faqHeader },
  ];

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
    const els = toc.map(item => document.getElementById(item.id)).filter(Boolean);
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
  }, [locale]);
  
  return (
    <div className="sylphio-guide">
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
        <div className="sylphio-guide-main">

        <div className="sylphio-guide-byok-note">
          <div className="sylphio-guide-byok-icon"><Icon name="shield" size={28} /></div>
          <div className="sylphio-guide-byok-content">
            <h2>{d.byokTitle}</h2>
            <p>{d.byokDesc}</p>
          </div>
        </div>

        {/* --- PART 1: Google Gemini --- */}
        <section className="sylphio-guide-section" id="section-gemini">
          <div className="sylphio-guide-section-title">
            <span className="sylphio-guide-section-badge gemini-badge">Highly Recommended</span>
            <h2>{d.geminiTitle}</h2>
          </div>
          <p className="sylphio-guide-lead">
            {d.geminiIntro}
          </p>

          <ol className="sylphio-guide-steps">
            <li className="sylphio-guide-step-item">
              <span className="sylphio-guide-step-number">1</span>
              <span className="sylphio-guide-step-text">
                {locale === 'ko' ? (
                  <>
                    웹 브라우저를 열고 <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" className="sylphio-guide-step-link">Google AI Studio (aistudio.google.com)</a>에 접속하여 개인 구글 계정으로 로그인합니다.  {/* i18n-ok: 문장 중간에 링크가 박힌 로케일별 리치 텍스트 — 문자열 사전으로는 HTML을 담아야 한다 */}
                  </>
                ) : locale === 'ja' ? (
                  <>
                    ブラウザを開き、<a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" className="sylphio-guide-step-link">Google AI Studio (aistudio.google.com)</a>にアクセスしてGoogleアカウントでログインします。
                  </>
                ) : (
                  <>
                    Open your web browser, go to <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" className="sylphio-guide-step-link">Google AI Studio (aistudio.google.com)</a>, and log in with your personal Google account.
                  </>
                )}
              </span>
            </li>
            <li className="sylphio-guide-step-item">
              <span className="sylphio-guide-step-number">2</span>
              <span className="sylphio-guide-step-text">{d.geminiStep2}</span>
            </li>
            <li className="sylphio-guide-step-item">
              <span className="sylphio-guide-step-number">3</span>
              <span className="sylphio-guide-step-text">{d.geminiStep3}</span>
            </li>
            <li className="sylphio-guide-step-item">
              <span className="sylphio-guide-step-number">4</span>
              <span className="sylphio-guide-step-text">{d.geminiStep4}</span>
            </li>
          </ol>

          <div className="sylphio-guide-pricing-card">
            <div className="sylphio-guide-pricing-header">{d.geminiPriceHeader}</div>
            <div className="sylphio-guide-pricing-list">
              <div className="sylphio-guide-pricing-item free">
                <h3>{d.geminiFreeTitle}</h3>
                <p className="u-prewrap">{d.geminiFreeDesc}</p>
              </div>
              <div className="sylphio-guide-pricing-item pay">
                <h3>{d.geminiPayTitle}</h3>
                <p>{d.geminiPayDesc}</p>
              </div>
            </div>
          </div>
        </section>

        {/* --- PART 2: OpenAI --- */}
        <section className="sylphio-guide-section" id="section-openai">
          <div className="sylphio-guide-section-title">
            <span className="sylphio-guide-section-badge openai-badge">Pro Specialist</span>
            <h2>{d.openaiTitle}</h2>
          </div>
          <p className="sylphio-guide-lead">
            {d.openaiIntro}
          </p>

          <div className="sylphio-guide-warning-box">
            <span className="sylphio-guide-warning-icon"><Icon name="warning" /></span>
            <div className="sylphio-guide-warning-content">
              <h3>{d.openaiWarningTitle}</h3>
              <p>{d.openaiWarningDesc}</p>
            </div>
          </div>

          <ol className="sylphio-guide-steps">
            <li className="sylphio-guide-step-item">
              <span className="sylphio-guide-step-number">1</span>
              <span className="sylphio-guide-step-text">
                {locale === 'ko' ? (
                  <>
                    <a href="https://platform.openai.com/" target="_blank" rel="noreferrer" className="sylphio-guide-step-link">OpenAI API Platform (platform.openai.com)</a>에 접속하여 가입 후 로그인합니다.  {/* i18n-ok: 문장 중간에 링크가 박힌 로케일별 리치 텍스트 — 문자열 사전으로는 HTML을 담아야 한다 */}
                  </>
                ) : locale === 'ja' ? (
                  <>
                    <a href="https://platform.openai.com/" target="_blank" rel="noreferrer" className="sylphio-guide-step-link">OpenAI API Platform (platform.openai.com)</a> にアクセスし、登録およびログインします。
                  </>
                ) : (
                  <>
                    Visit the <a href="https://platform.openai.com/" target="_blank" rel="noreferrer" className="sylphio-guide-step-link">OpenAI API Platform (platform.openai.com)</a>, register, and log in.
                  </>
                )}
              </span>
            </li>
            <li className="sylphio-guide-step-item">
              <span className="sylphio-guide-step-number">2</span>
              <span className="sylphio-guide-step-text">{d.openaiStep2}</span>
            </li>
            <li className="sylphio-guide-step-item">
              <span className="sylphio-guide-step-number">3</span>
              <span className="sylphio-guide-step-text">{d.openaiStep3}</span>
            </li>
            <li className="sylphio-guide-step-item">
              <span className="sylphio-guide-step-number">4</span>
              <span className="sylphio-guide-step-text">{d.openaiStep4}</span>
            </li>
            <li className="sylphio-guide-step-item">
              <span className="sylphio-guide-step-number">5</span>
              <span className="sylphio-guide-step-text">{d.openaiStep5}</span>
            </li>
          </ol>

          <div className="sylphio-guide-pricing-card">
            <div className="sylphio-guide-pricing-header">{d.openaiPriceHeader}</div>
            <div className="sylphio-guide-pricing-item">
              <p className="u-prewrap">{d.openaiPriceDesc}</p>
            </div>
          </div>
        </section>

        {/* --- PART 3: App Integration --- */}
        <section className="sylphio-guide-section" id="section-app">
          <div className="sylphio-guide-section-title">
            <span className="sylphio-guide-section-badge app-badge">App Setup</span>
            <h2>{d.appSetupTitle}</h2>
          </div>

          <ol className="sylphio-guide-steps" style={{ marginBottom: 0 }}>
            <li className="sylphio-guide-step-item">
              <span className="sylphio-guide-step-number">1</span>
              <span className="sylphio-guide-step-text">{d.appStep1}</span>
            </li>
            <li className="sylphio-guide-step-item">
              <span className="sylphio-guide-step-number">2</span>
              <span className="sylphio-guide-step-text">{d.appStep2}</span>
            </li>
            <li className="sylphio-guide-step-item">
              <span className="sylphio-guide-step-number">3</span>
              <span className="sylphio-guide-step-text">{d.appStep3}</span>
            </li>
            <li className="sylphio-guide-step-item">
              <span className="sylphio-guide-step-number">4</span>
              <span className="sylphio-guide-step-text">{d.appStep4}</span>
            </li>
            <li className="sylphio-guide-step-item">
              <span className="sylphio-guide-step-number">5</span>
              <span className="sylphio-guide-step-text">{d.appStep5}</span>
            </li>
            <li className="sylphio-guide-step-item">
              <span className="sylphio-guide-step-number">6</span>
              <span className="sylphio-guide-step-text">{d.appStep6}</span>
            </li>
            <li className="sylphio-guide-step-item">
              <span className="sylphio-guide-step-number">7</span>
              <span className="sylphio-guide-step-text">{d.appStep7}</span>
            </li>
          </ol>
        </section>

        {/* --- FAQ & Troubleshooting --- */}
        <section className="sylphio-guide-faq" id="section-faq">
          <h2>{d.faqHeader}</h2>
          
          <div className="sylphio-guide-faq-item">
            <h3>{d.faq1Q}</h3>
            <p className="u-prewrap">{d.faq1A}</p>
          </div>

          <div className="sylphio-guide-faq-item">
            <h3>{d.faq2Q}</h3>
            <p className="u-prewrap">{d.faq2A}</p>
          </div>
        </section>

        </div>{/* .sylphio-guide-main */}

        {/* 목차 사이드바 — 1200 셸의 남는 폭 활용(sticky), 섹션 점프 */}
        <aside className="sylphio-doc-aside">
          <nav className="sylphio-doc-toc" aria-label={tocLabel}>
            <div className="sylphio-doc-toc-label">{tocLabel}</div>
            <ul>
              {toc.map(item => (
                <li key={item.id} className={`sylphio-toc-item${activeId === item.id ? ' active' : ''}`}>
                  <a href={`#${item.id}`}>{item.label}</a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
      </div>{/* .sylphio-doc-layout */}
    </div>
  );
}
