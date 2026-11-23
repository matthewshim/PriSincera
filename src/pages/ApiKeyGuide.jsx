import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from '../contexts/LanguageContext';
import SylphioDocShell from '../components/layout/SylphioDocShell';
import ByokGuideBody, { Steps } from '../components/byok/ByokGuideBody';
import './ApiKeyGuide.css';
import useSEO from '../hooks/useSEO';
import { PAGE_META } from '../data/seoMeta.mjs';
import Icon from '../components/common/Icon';

/* 공용 API Key 발급 가이드 — Sylphio·Waymark 공용(제품 토글).
   provider 발급 콘텐츠는 byokGuide(공용), 제품별 보안·연결·usage·FAQ는 각 네임스페이스. */
const GUIDE_VERIFIED = '2026-11-23';

export default function ApiKeyGuide() {
  const { locale, t } = useTranslation();
  const [params] = useSearchParams();
  const [svc, setSvc] = useState(params.get('for') === 'waymark' ? 'waymark' : 'sylphio');

  useSEO({
    title: PAGE_META['/guide/api-key'].pageTitle,
    description: PAGE_META['/guide/api-key'].description,
    keywords: PAGE_META['/guide/api-key'].keywords,
    ogUrl: 'https://www.prisincera.com/guide/api-key',
  });
  useEffect(() => {
    document.body.classList.add('hero-ready');
    return () => { document.body.classList.remove('hero-ready'); };
  }, []);

  const g = t('byokGuide');
  const a = t('apiKeyGuide');
  const isW = svc === 'waymark';
  const sg = isW ? t('waymark.guide') : t('sylphio.guide');

  const handleAlert = (e) => { e.preventDefault(); alert(t('header.sylphioAlert')); };

  const providers = isW
    ? [{ id: 'gemini', recommended: true, data: g.providers.gemini, usageNote: sg.geminiUsage },
       { id: 'anthropic', data: g.providers.anthropic, usageNote: sg.anthropicUsage }]
    : [{ id: 'gemini', recommended: true, data: g.providers.gemini, usageNote: sg.geminiUsage },
       { id: 'openai', data: g.providers.openai, usageNote: sg.openaiUsage }];

  const connectId = isW ? 'section-connect' : 'section-app';
  const connectTitle = isW ? sg.connectTitle : sg.appSetupTitle;
  const connectSteps = isW
    ? sg.connectSteps
    : [sg.appStep1, sg.appStep2, sg.appStep3, sg.appStep4, sg.appStep5, sg.appStep6, sg.appStep7];

  const toc = [
    { id: 'section-gemini', label: g.providers.gemini.title },
    { id: isW ? 'section-anthropic' : 'section-openai', label: isW ? g.providers.anthropic.title : g.providers.openai.title },
    { id: connectId, label: connectTitle },
    { id: 'section-faq', label: sg.faqHeader },
  ];

  return (
    <div className={'api-guide byokg ' + (isW ? 'is-waymark' : 'is-sylphio')}>
      <section className="apig-hero">
        <h1>{a.heroTitle}</h1>
        <p className="tagline u-prewrap">{a.subtitle}</p>
        <div className="apig-toggle" role="tablist" aria-label={a.pageTitle}>
          <button type="button" role="tab" aria-selected={!isW} className={!isW ? 'on' : ''} onClick={() => setSvc('sylphio')}>Sylphio</button>
          <button type="button" role="tab" aria-selected={isW} className={isW ? 'on' : ''} onClick={() => setSvc('waymark')}>Waymark</button>
        </div>
        <div className="apig-hero-ctas">
          {isW
            ? <Link to="/waymark/app" className="btn-primary"><Icon name="arrowRight" /><span>{a.backWaymark}</span></Link>
            : <a href="#" onClick={handleAlert} className="btn-primary"><Icon name="download" /><span>{sg.heroCtaDownload}</span></a>}
        </div>
      </section>

      <SylphioDocShell items={toc} tocLabel={g.tocLabel}>
        <ByokGuideBody
          verified={t('byokGuide.verified', { date: GUIDE_VERIFIED })}
          uiLangNotice={isW ? undefined : sg.uiLangNotice}
          security={{ title: sg.byokTitle, desc: sg.byokDesc }}
          chooseOne={sg.chooseOne}
          providers={providers}
          locale={locale}
          faq={{ header: sg.faqHeader, items: [{ q: sg.faq1Q, a: sg.faq1A }, { q: sg.faq2Q, a: sg.faq2A }] }}
        >
          <section className="byokg-section" id={connectId}>
            <p className="byokg-eyebrow">Final Step</p>
            <h2>{connectTitle}</h2>
            <Steps items={connectSteps} />
          </section>
        </ByokGuideBody>
        <p className="apig-back">
          <Link to={isW ? '/waymark/app' : '/sylphio'}>{isW ? a.backWaymark : a.backSylphio}</Link>
        </p>
      </SylphioDocShell>
    </div>
  );
}
