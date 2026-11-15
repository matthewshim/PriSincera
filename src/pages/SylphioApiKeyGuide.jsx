import React, { useEffect } from 'react';
import { useTranslation } from '../contexts/LanguageContext';
import SylphioNav from '../components/layout/SylphioNav';
import SylphioDocShell from '../components/layout/SylphioDocShell';
import './SylphioApiKeyGuide.css';
import useSEO from '../hooks/useSEO';
import { PAGE_META } from '../data/seoMeta.mjs';
import Icon from '../components/common/Icon';

/* 외부 서비스(Google AI Studio·OpenAI Platform) 화면·요금을 마지막으로 대조한 날.
   정본: docs/sylphio/api_key_guide.md 변경 이력(v1.2 라이브 정합). 내용을 재확인하면 함께 갱신한다. */
const GUIDE_VERIFIED = '2026-07-13';

/* "라벨: 내용" 줄 — 사전 문자열의 `- 원인: …` / `비용: …` 줄을 실제 목록 항목으로 만든다.
   이전에는 `white-space: pre-line` 줄글로 목록을 흉내 냈다(스크린리더에 목록으로 읽히지 않음). */
const LABEL_RE = /^([^:：]{1,24})([:：])\s*(.+)$/;

function Facts({ text }) {
  const lines = String(text || '')
    .split('\n')
    .map((line) => line.replace(/^-\s*/, '').trim())
    .filter(Boolean);
  return (
    <ul className="sylphio-guide-facts">
      {lines.map((line, i) => {
        const m = line.match(LABEL_RE);
        return (
          <li key={i}>
            {m ? (<><span className="sylphio-guide-fact-label">{m[1]}{m[2]}</span><span>{m[3]}</span></>) : line}
          </li>
        );
      })}
    </ul>
  );
}

function Steps({ items }) {
  return (
    <ol className="sylphio-guide-steps">
      {items.map((content, i) => (
        <li className="sylphio-guide-step-item" key={i}>
          <span className="sylphio-guide-step-number" aria-hidden="true">{i + 1}</span>
          <span className="sylphio-guide-step-text">{content}</span>
        </li>
      ))}
    </ol>
  );
}

const ExtLink = ({ href, children }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="sylphio-guide-step-link">{children}</a>
);

export default function SylphioApiKeyGuide() {
  const { locale, t } = useTranslation();

  useSEO({
    title: PAGE_META['/sylphio/guide'].pageTitle,
    description: PAGE_META['/sylphio/guide'].description,
    keywords: PAGE_META['/sylphio/guide'].keywords,
    ogUrl: 'https://www.prisincera.com/sylphio/guide'
  });
  const d = t('sylphio.guide');
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

  // GNB 노출 조건(§9-1)
  useEffect(() => {
    document.body.classList.add('hero-ready');
    return () => { document.body.classList.remove('hero-ready'); };
  }, []);

  const aiStudio = <ExtLink href="https://aistudio.google.com/">Google AI Studio (aistudio.google.com)</ExtLink>;
  const openaiPlatform = <ExtLink href="https://platform.openai.com/">OpenAI API Platform (platform.openai.com)</ExtLink>;

  /* 1단계는 문장 중간에 링크가 박힌 로케일별 리치 텍스트 — 문자열 사전으로는 HTML을 담아야 한다 */
  const geminiStep1 = locale === 'ko'
    ? <>웹 브라우저에서 {aiStudio}에 접속해 개인 Google 계정으로 로그인합니다.</>  /* i18n-ok: 링크가 박힌 로케일별 리치 텍스트 */
    : locale === 'ja'
      ? <>ブラウザで{aiStudio}にアクセスし、Googleアカウントでログインします。</>
      : <>Open {aiStudio} in your browser and sign in with your personal Google account.</>;
  const openaiStep1 = locale === 'ko'
    ? <>{openaiPlatform}에 접속해 가입한 뒤 로그인합니다.</>  /* i18n-ok: 링크가 박힌 로케일별 리치 텍스트 */
    : locale === 'ja'
      ? <>{openaiPlatform} にアクセスし、登録してログインします。</>
      : <>Visit the {openaiPlatform}, sign up, and log in.</>;

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

      <SylphioDocShell items={toc} tocLabel={d.tocLabel}>
        <p className="sylphio-guide-verified">{t('sylphio.guide.verified', { date: GUIDE_VERIFIED })}</p>
        {/* 앱 1.0은 한국어 화면 전용 — en·ja에만 키가 있고, 아래 설정 단계의 화면 이름을 한국어 그대로 쓰는 이유를 알린다 */}
        {d.uiLangNotice && <p className="sylphio-guide-verified">{d.uiLangNotice}</p>}

        <div className="sylphio-guide-callout is-info">
          <span className="sylphio-guide-callout-icon"><Icon name="shield" /></span>
          <div>
            <h2 className="sylphio-guide-callout-title">{d.byokTitle}</h2>
            <p>{d.byokDesc}</p>
          </div>
        </div>

        <p className="sylphio-guide-choose">{d.chooseOne}</p>

        {/* --- 선택지 A: Google Gemini --- */}
        <section className="sylphio-guide-section" id="section-gemini">
          <p className="sylphio-guide-eyebrow is-recommended">Option A · Recommended</p>
          <h2>{d.geminiTitle}</h2>
          <p className="sylphio-guide-lead">{d.geminiIntro}</p>

          <Steps items={[geminiStep1, d.geminiStep2, d.geminiStep3, d.geminiStep4]} />

          <div className="sylphio-guide-callout">
            <div>
              <h3 className="sylphio-guide-callout-title">{d.geminiPriceHeader}</h3>
              <div className="sylphio-guide-tiers">
                <div>
                  <h4>{d.geminiFreeTitle}</h4>
                  <Facts text={d.geminiFreeDesc} />
                </div>
                <div>
                  <h4>{d.geminiPayTitle}</h4>
                  <p>{d.geminiPayDesc}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- 선택지 B: OpenAI --- */}
        <section className="sylphio-guide-section" id="section-openai">
          <p className="sylphio-guide-eyebrow">Option B</p>
          <h2>{d.openaiTitle}</h2>
          <p className="sylphio-guide-lead">{d.openaiIntro}</p>

          <div className="sylphio-guide-callout is-warning">
            <span className="sylphio-guide-callout-icon"><Icon name="warning" /></span>
            <div>
              <h3 className="sylphio-guide-callout-title">{d.openaiWarningTitle}</h3>
              <p>{d.openaiWarningDesc}</p>
            </div>
          </div>

          <Steps items={[openaiStep1, d.openaiStep2, d.openaiStep3, d.openaiStep4, d.openaiStep5]} />

          <div className="sylphio-guide-callout">
            <div>
              <h3 className="sylphio-guide-callout-title">{d.openaiPriceHeader}</h3>
              <Facts text={d.openaiPriceDesc} />
            </div>
          </div>
        </section>

        {/* --- 마지막 단계: 앱 연결 --- */}
        <section className="sylphio-guide-section" id="section-app">
          <p className="sylphio-guide-eyebrow">Final Step</p>
          <h2>{d.appSetupTitle}</h2>
          <Steps items={[d.appStep1, d.appStep2, d.appStep3, d.appStep4, d.appStep5, d.appStep6, d.appStep7]} />
        </section>

        {/* --- 문제 해결 --- */}
        <section className="sylphio-guide-section" id="section-faq">
          <p className="sylphio-guide-eyebrow">FAQ</p>
          <h2>{d.faqHeader}</h2>
          <div className="sylphio-guide-faq-item">
            <h3>{d.faq1Q}</h3>
            <Facts text={d.faq1A} />
          </div>
          <div className="sylphio-guide-faq-item">
            <h3>{d.faq2Q}</h3>
            <Facts text={d.faq2A} />
          </div>
        </section>
      </SylphioDocShell>
    </div>
  );
}
