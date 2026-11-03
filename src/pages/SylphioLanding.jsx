import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../contexts/LanguageContext';
import SylphioNav from '../components/layout/SylphioNav';
import './SylphioLanding.css';
import useSEO from '../hooks/useSEO';
import { PAGE_META } from '../data/seoMeta.mjs';
import Icon from '../components/common/Icon';

// 3D Tilt Hover Feature Card Component
function FeatureCard({ icon, title, description }) {
  const [transform, setTransform] = useState('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
  
  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left - box.width / 2;
    const y = e.clientY - box.top - box.height / 2;
    
    const rotateX = -(y / (box.height / 2)) * 10;
    const rotateY = (x / (box.width / 2)) * 10;
    
    setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`);
  };
  
  const handleMouseLeave = () => {
    setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
  };
  
  return (
    <div 
      className="sylphio-feature-card premium-card"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transform }}
    >
      <div className="sylphio-feature-icon"><Icon name={icon} size={28} /></div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

/* 통역 데모 시나리오 — `translated` 필드가 한국어인 것은 **설계**다(원문 언어 → 한국어 번역을
   시연한다). UI 문자열이 아니라 제품 데모 콘텐츠이므로 i18n-ok.
   ⚠️ 다만 영문·일문 사용자에게도 '→ 한국어'만 보여주는 것은 제품 판단 사항이다
   (로케일별 타깃 언어 전환은 별도 과제). */
// Typing Simulator Data (Multilingual Input Scenarios)
const SCENARIOS = {
  en: {
    speaker: "Steve (Product Manager)",
    source: "Good morning everyone. Today we are gathered to discuss our product roadmap for the next quarter, including the integration of our new AI engine.",
    translated: "여러분 안녕하십니까. 오늘은 새로운 AI 엔진 통합을 포함한 다음 분기 제품 로드맵을 논의하기 위해 모였습니다."  // i18n-ok: 통역 데모의 번역 결과(제품 콘텐츠)
  },
  ko: {
    speaker: "민수 (프로젝트 리더)",
    source: "안녕하세요 여러분. 오늘 회의에서는 다음 분기 릴리즈 일정과 새롭게 추가될 실시간 번역 기능의 안정성에 대해 논의하겠습니다.",
    translated: "Hello everyone. In today's meeting, we will discuss the next quarter's release schedule and the stability of the newly added real-time translation feature."
  },
  jp: {
    speaker: "Kenji (AI Engineer)",
    source: "皆さん、こんにちは。本日のセミナーでは, オンデバイスAI技術が私たちの日常生活にどのような変化をもたらすかについてお話しします。",
    translated: "여러분, 안녕하십니까. 오늘 세미나에서는 온디바이스 AI 기술이 우리의 일상 생활에 어떤 변화를 가져올지에 대해 말씀드리겠습니다."  // i18n-ok: 통역 데모의 번역 결과(제품 콘텐츠)
  }
};

export default function SylphioLanding() {
  const { t } = useTranslation();

  useSEO({
    title: PAGE_META['/sylphio'].pageTitle,
    description: PAGE_META['/sylphio'].description,
    keywords: PAGE_META['/sylphio'].keywords,
    ogUrl: 'https://www.prisincera.com/sylphio'
  });
  const d = t('sylphio.landing');
  
  // GNB activation hook (adds hero-ready class to document.body)
  useEffect(() => {
    document.body.classList.add('hero-ready');
    return () => {
      document.body.classList.remove('hero-ready');
    };
  }, []);

  // Alert handler for preparing app Store / downloads
  const handleAlert = (e) => {
    e.preventDefault();
    alert(t('header.sylphioAlert'));
  };

  // Simulator states
  const [activeScenario, setActiveScenario] = useState(null);
  const [displayedSource, setDisplayedSource] = useState("");
  const [displayedTranslated, setDisplayedTranslated] = useState("");
  const [showTranslated, setShowTranslated] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Pro 라이선스 구매 여부 모의 제어
  const [isProUnlocked, setIsProUnlocked] = useState(false);
  const [showMockPaywall, setShowMockPaywall] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseStatus, setPurchaseStatus] = useState("");
  const [showSuccessCheck, setShowSuccessCheck] = useState(false);
  
  // Refs for simulator timers
  const typingTimerRef = useRef(null);
  const translateDelayTimerRef = useRef(null);
  const translateTypingTimerRef = useRef(null);
  
  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (typingTimerRef.current) clearInterval(typingTimerRef.current);
      if (translateDelayTimerRef.current) clearTimeout(translateDelayTimerRef.current);
      if (translateTypingTimerRef.current) clearInterval(translateTypingTimerRef.current);
    };
  }, []);
  
  // Run Interactive Demo Scenario
  const handlePlayScenario = (key) => {
    // 일본어 시나리오 클릭 시 Pro 라이선스가 잠겨있다면 결제 모달 팝업 가동
    if (key === 'jp' && !isProUnlocked) {
      setShowMockPaywall(true);
      return;
    }

    if (typingTimerRef.current) clearInterval(typingTimerRef.current);
    if (translateDelayTimerRef.current) clearTimeout(translateDelayTimerRef.current);
    if (translateTypingTimerRef.current) clearInterval(translateTypingTimerRef.current);
    
    setActiveScenario(key);
    setDisplayedSource("");
    setDisplayedTranslated("");
    setShowTranslated(false);
    setIsPlaying(true);
    
    const scenario = SCENARIOS[key];
    let sourceIdx = 0;
    
    typingTimerRef.current = setInterval(() => {
      if (sourceIdx < scenario.source.length) {
        setDisplayedSource((prev) => prev + scenario.source[sourceIdx]);
        sourceIdx++;
      } else {
        clearInterval(typingTimerRef.current);
      }
    }, 30);
    
    translateDelayTimerRef.current = setTimeout(() => {
      setShowTranslated(true);
      let transIdx = 0;
      
      translateTypingTimerRef.current = setInterval(() => {
        if (transIdx < scenario.translated.length) {
          setDisplayedTranslated((prev) => prev + scenario.translated[transIdx]);
          transIdx++;
        } else {
          clearInterval(translateTypingTimerRef.current);
          setIsPlaying(false);
        }
      }, 40);
    }, 1200);
  };

  // 결제 모사 핸들러 (StoreKit 2 구매 트랜잭션 흉내내기)
  const handlePurchasePro = () => {
    setIsPurchasing(true);
    setPurchaseStatus(d.purchaseComm);
    
    setTimeout(() => {
      setPurchaseStatus(d.purchaseOk);
      setIsPurchasing(false);
      setShowSuccessCheck(true);
      
      setTimeout(() => {
        setIsProUnlocked(true);
        setShowMockPaywall(false);
        setShowSuccessCheck(false);
        // 구매 즉시 잠겨있던 일본어 시나리오 자동 재생 가동
        handlePlayScenario('jp');
      }, 1500);
    }, 1500);
  };
  
  return (
    <div className="sylphio-landing">
      {/* --- HERO SECTION --- */}
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
      
      {/* --- CORE FEATURES SECTION --- */}
      <section className="sylphio-section">
        <div className="sylphio-section-header">
          <p className="sylphio-eyebrow">Capabilities</p>
          <h2>{d.featuresTitle}</h2>
          <p>{d.featuresSub}</p>
        </div>
        
        {/* 7개는 대등한 7개가 아니었다(P3-3) — 부제가 말하는 세 주장만 카드로 세운다:
            수집(f3) · 인식(f2) · 산출물(f5). 나머지 넷은 그 하위 사항이므로 아래 리스트로. */}
        <div className="sylphio-features-grid">
          <FeatureCard icon="laptop" title={d.f3Title} description={d.f3Desc} />
          <FeatureCard icon="shield" title={d.f2Title} description={d.f2Desc} />
          <FeatureCard icon="chart" title={d.f5Title} description={d.f5Desc} />
        </div>

        {/* 설명 길이가 1줄~5줄로 들쭉날쭉한 항목들 — 등높이 카드에 밀어넣지 않고 리스트가 받는다 */}
        <p className="sylphio-features-more-label u-eyebrow">{d.featuresMore}</p>
        <dl className="sylphio-features-more">
          {[['core', d.f4Title, d.f4Desc], ['headphones', d.f7Title, d.f7Desc],
            ['mic', d.f1Title, d.f1Desc], ['monitor', d.f6Title, d.f6Desc]].map(([ico, title, desc]) => (
            <div key={title}>
              <dt><Icon name={ico} size={16} /> {title}</dt>
              <dd>{desc}</dd>
            </div>
          ))}
        </dl>
      </section>
      
      {/* --- INTERACTIVE SIMULATOR SECTION --- */}
      <section className="sylphio-section">
        <div className="sylphio-section-header">
          <p className="sylphio-eyebrow">Live demo</p>
          <h2>{d.simTitle}</h2>
          <p>{d.simSub}</p>
        </div>
        
        <div className="sylphio-simulator-box">
          {/* 상단 시나리오 버튼 제어부 (PRO 뱃지 보강) */}
          <div className="sylphio-simulator-controls">
            <button 
              className={`btn-simulator ${activeScenario === 'en' ? 'active' : ''}`}
              onClick={() => handlePlayScenario('en')}
              disabled={isPlaying && activeScenario === 'en'}
              id="btn-sim-english"
            >
              🇺🇸 English Meeting ( Steve )
            </button>
            <button 
              className={`btn-simulator ${activeScenario === 'ko' ? 'active' : ''}`}
              onClick={() => handlePlayScenario('ko')}
              disabled={isPlaying && activeScenario === 'ko'}
              id="btn-sim-korean"
            >
              🇰🇷 Korean Meeting ( Minsoo )
            </button>
            <button 
              className={`btn-simulator ${activeScenario === 'jp' ? 'active' : ''}`}
              onClick={() => handlePlayScenario('jp')}
              disabled={isPlaying && activeScenario === 'jp'}
              id="btn-sim-japanese"
            >
              🇯🇵 Japanese Seminar ( Kenji )
              {!isProUnlocked && <span className="btn-sim-pro-badge">PRO</span>}
            </button>
          </div>
          
          {/* 실제 데스크톱 앱과 100% 싱크 맞춘 HUD 윈도우 프레임 */}
          <div className="sylphio-virtual-window">
            <div className="sylphio-window-header">
              <div className="sylphio-window-traffic">
                <span className="dot red"></span>
                <span className="dot yellow"></span>
                <span className="dot green"></span>
              </div>
              <div className="sylphio-window-title">Sylphio Live Translator</div>
              <div className="sylphio-window-badges">
                <span className={`badge-tier ${isProUnlocked ? 'pro' : 'free'}`}>
                  {isProUnlocked ? 'PRO' : 'FREE'}
                </span>
                <span className="badge-source"><Icon name="mic" /> {d.micSource}</span>
              </div>
            </div>
            
            <div className="sylphio-virtual-bar">
              {activeScenario ? (
                <div className="sylphio-sim-message-block">
                  <div className="sylphio-sim-lang-code">
                    {activeScenario.toUpperCase()}
                  </div>
                  
                  <div className="sylphio-sim-text-stack">
                    {/* 원문 출력 (반투명 백색) */}
                    <p className="sylphio-sim-source">
                      {displayedSource}
                      {isPlaying && displayedSource.length < SCENARIOS[activeScenario].source.length && (
                        <span className="sylphio-cursor-pulse">|</span>
                      )}
                    </p>
                    
                    {/* 번역문 출력 (링고민트 볼드) */}
                    {showTranslated && (
                      <p className="sylphio-sim-translated">
                        {displayedTranslated}
                        {isPlaying && displayedTranslated.length < SCENARIOS[activeScenario].translated.length && (
                          <span className="sylphio-cursor-pulse">|</span>
                        )}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="sylphio-virtual-bar-placeholder">
                  {d.simPlaceholder}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 모의 결제 모달 Paywall */}
        {showMockPaywall && (
          <div className="sylphio-mock-paywall-overlay">
            {/* 목업 헤딩이 지면 개요에 끼어 h2 뒤에 h3가 역순으로 섞였다(WCAG 1.3.1).
                레벨을 올리는 대신 개요에서 빼고, 창의 이름을 role+aria-label로 준다. */}
            <div
              className="sylphio-mock-paywall-modal"
              role="dialog"
              aria-modal="true"
              aria-label="Sylphio Pro Lifetime"
            >
              {/* 시맨틱 교정 — div+onClick은 키보드로 도달·실행할 수 없다 (ai_pattern_audit §2-5 G10) */}
              <button
                type="button"
                className="paywall-close"
                onClick={() => setShowMockPaywall(false)}
                aria-label={d.closeLabel}
              ><Icon name="close" size={18} /></button>
              
              {showSuccessCheck ? (
                <div className="paywall-success-screen">
                  <div className="success-checkmark"><Icon name="check" size={40} /></div>
                  <p className="paywall-success-text">{purchaseStatus}</p>
                </div>
              ) : (
                <>
                  <div className="paywall-header">
                    <p className="paywall-title">Sylphio Pro Lifetime</p>
                    <p>{d.paywallDesc}</p>
                  </div>
                  
                  <div className="paywall-grid">
                    <div className="paywall-item"><Icon name="unlock" /> {d.paywallLang}</div>
                    <div className="paywall-item"><Icon name="palette" /> {d.paywallCaption}</div>
                    <div className="paywall-item"><Icon name="chart" /> {d.paywallSummary}</div>
                    <div className="paywall-item"><Icon name="core" /> {d.paywallEngine}</div>
                  </div>
                  
                  <button 
                    className="btn-paywall-purchase" 
                    onClick={handlePurchasePro} 
                    disabled={isPurchasing}
                  >
                    {isPurchasing ? (
                      <span className="spinner"></span>
                    ) : (
                      <span>{d.paywallBuy}</span>
                    )}
                  </button>
                  {isPurchasing && <p className="paywall-status">{purchaseStatus}</p>}
                </>
              )}
            </div>
          </div>
        )}
      </section>
      
      {/* --- PRICING SECTION --- */}
      <section className="sylphio-section">
        <div className="sylphio-section-header">
          <p className="sylphio-eyebrow">Pricing</p>
          <h2>{d.pricingTitle}</h2>
          <p>{d.pricingSub}</p>
        </div>
        
        <div className="sylphio-pricing-cards">
          {/* Free Tier */}
          <div className="sylphio-pricing-card premium-card">
            <h3>{d.freeTitle}</h3>
            <div className="sylphio-price">{d.freePrice} <span>{d.freePricePeriod}</span></div>
            <p className="sylphio-price-desc">
              {d.priceFreeDesc}
            </p>
            <ul className="sylphio-pricing-features">
              <li>{d.freeFeature1}</li>
              <li>{d.freeFeature2}</li>
              <li>{d.freeFeature3}</li>
              <li>{d.freeFeature4}</li>
              <li>{d.freeFeature5}</li>
            </ul>
            <a 
              href="#" 
              onClick={handleAlert} 
              className="btn-secondary"
             
              id="btn-pricing-free"
            >
              {d.btnFreeCta}
            </a>
          </div>
          
          {/* Pro Lifetime Tier */}
          <div className="sylphio-pricing-card premium-card premium">
            <div className="sylphio-pricing-badge">POPULAR</div>
            <h3>{d.proTitle}</h3>
            <div className="sylphio-price">{d.proPrice} <span>{d.proPricePeriod}</span></div>
            <p className="sylphio-price-desc">
              {d.priceProDesc}
            </p>
            <ul className="sylphio-pricing-features">
              <li>{d.proFeature1}</li>
              <li>{d.proFeature2}</li>
              <li>{d.proFeature3}</li>
              <li>{d.proFeature4}</li>
              <li>{d.proFeature5}</li>
              <li>{d.proFeature6}</li>
              <li>{d.proFeature7}</li>
            </ul>
            <a 
              href="#" 
              onClick={handleAlert} 
              className="btn-primary"
             
              id="btn-pricing-pro"
            >
              {d.btnProCta}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
