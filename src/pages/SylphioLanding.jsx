import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './SylphioLanding.css';

// 3D Tilt Hover Feature Card Component
function FeatureCard({ icon, title, description }) {
  const [transform, setTransform] = useState('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
  
  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    // 카드 정중앙으로부터 마우스 위치의 상대 좌표
    const x = e.clientX - box.left - box.width / 2;
    const y = e.clientY - box.top - box.height / 2;
    
    // 최대 각도 약 10도 제한
    const rotateX = -(y / (box.height / 2)) * 10;
    const rotateY = (x / (box.width / 2)) * 10;
    
    setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`);
  };
  
  const handleMouseLeave = () => {
    setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
  };
  
  return (
    <div 
      className="sylphio-feature-card"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ 
        transform, 
        transition: 'transform 0.15s cubic-bezier(0.25, 1, 0.5, 1), border-color 0.3s ease, background 0.3s ease' 
      }}
    >
      <div className="sylphio-feature-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

// Typing Simulator Data
const SCENARIOS = {
  en: {
    speaker: "Steve (Product Manager)",
    source: "Good morning everyone. Today we are gathered to discuss our product roadmap for the next quarter, including the integration of our new AI engine.",
    translated: "여러분 안녕하십니까. 오늘은 새로운 AI 엔진 통합을 포함한 다음 분기 제품 로드맵을 논의하기 위해 모였습니다."
  },
  jp: {
    speaker: "Kenji (AI Engineer)",
    source: "皆さん、こんにちは。本日のセミナーでは、オンデバイスAI技術が私たちの日常生活にどのような変化をもたらすかについてお話しします。",
    translated: "여러분, 안녕하십니까. 오늘 세미나에서는 온디바이스 AI 기술이 우리의 일상 생활에 어떤 변화를 가져올지에 대해 말씀드리겠습니다."
  }
};

export default function SylphioLanding() {
  // CSS Gradient Fog state
  const [mousePos, setMousePos] = useState({ x: '50%', y: '20%' });
  
  // Simulator states
  const [activeScenario, setActiveScenario] = useState(null);
  const [displayedSource, setDisplayedSource] = useState("");
  const [displayedTranslated, setDisplayedTranslated] = useState("");
  const [showTranslated, setShowTranslated] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Refs for simulator timers
  const typingTimerRef = useRef(null);
  const translateDelayTimerRef = useRef(null);
  const translateTypingTimerRef = useRef(null);
  
  // Mouse move handler for background gradient fog
  const handleBgMouseMove = (e) => {
    const { clientX, clientY } = e;
    const xPct = `${(clientX / window.innerWidth) * 100}%`;
    const yPct = `${(clientY / window.innerHeight) * 100}%`;
    setMousePos({ x: xPct, y: yPct });
  };
  
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
    // Reset any running animations
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
    
    // 1. Start typing source text
    typingTimerRef.current = setInterval(() => {
      if (sourceIdx < scenario.source.length) {
        setDisplayedSource((prev) => prev + scenario.source[sourceIdx]);
        sourceIdx++;
      } else {
        clearInterval(typingTimerRef.current);
      }
    }, 30); // Fast realistic speech transcription pace
    
    // 2. Delay translator activation (offset for natural processing feel)
    translateDelayTimerRef.current = setTimeout(() => {
      setShowTranslated(true);
      let transIdx = 0;
      
      translateTypingTimerRef.current = setInterval(() => {
        if (transIdx < scenario.translated.length) {
          setDisplayedTranslated((prev) => prev + scenario.translated[transIdx]);
          transIdx++;
        } else {
          clearInterval(translateTypingTimerRef.current);
          setIsPlaying(false); // Finished entire loop
        }
      }, 40); // Translation rendering pace
    }, 1200); // 1.2s delay for "AI thinking & parsing" effect
  };
  
  return (
    <div 
      className="sylphio-landing" 
      onMouseMove={handleBgMouseMove}
      style={{
        '--mouse-x': mousePos.x,
        '--mouse-y': mousePos.y
      }}
    >
      {/* SEO Title & Meta tags simulated on client side for SPA consistency */}
      
      {/* --- HERO SECTION --- */}
      <section className="sylphio-hero">
        <div className="sylphio-core-container">
          <div className="sylphio-aurora-core"></div>
          <div className="sylphio-aurora-ring"></div>
        </div>
        
        <h1>소리 없이 흐르는 지적인 통역 정령, Sylphio</h1>
        
        <p className="tagline">
          화면의 모든 소리와 마이크를 실시간 캡처하여, 온디바이스에서 지체 없이 자막으로 구현합니다.<br />
          Gemini와 GPT의 강력한 다국어 지능을 Mac 네이티브 환경에서 완벽하게 경험해보세요.
        </p>
        
        <div className="sylphio-hero-ctas">
          <a 
            href="https://apps.apple.com" 
            target="_blank" 
            rel="noreferrer" 
            className="btn-sylphio-primary"
            id="btn-download-mac"
          >
            <span>📥 Mac App Store에서 무료 다운로드</span>
          </a>
          <Link 
            to="/sylphio/guide" 
            className="btn-sylphio-secondary"
            id="btn-guide-main"
          >
            <span>💡 API Key 발급 가이드 보기</span>
          </Link>
        </div>
      </section>
      
      {/* --- CORE FEATURES SECTION --- */}
      <section className="sylphio-section">
        <div className="sylphio-section-header">
          <h2>가장 완벽한 실시간 AI 통역의 5대 무기</h2>
          <p>
            기존 번역 솔루션의 침묵 장애와 캡처 실패 한계를 뛰어넘은 Mac 전용 아키텍처
          </p>
        </div>
        
        <div className="sylphio-features-grid">
          <FeatureCard 
            icon="🎙️"
            title="AirPods Max & Bluetooth 동적 락온"
            description="회의 시작 시 블루투스 이어폰 탈착으로 인한 오디오 장치 유실을 방지합니다. 사용 중인 에어팟 실명을 동적으로 감지하여 실시간 100% 오디오 수집 스트림에 자동 매핑합니다."
          />
          <FeatureCard 
            icon="🛡️"
            title="100% 로컬 온디바이스 STT 엔진"
            description="네트워크 지연이나 60초 통신 차단 제한으로 번역이 끊기는 현상을 완벽 박멸했습니다. 기기 내부 오프라인 로컬 신경망으로 0ms 레이턴시 무중단 음성 음절 추출을 지원합니다."
          />
          <FeatureCard 
            icon="💻"
            title="시스템 & 마이크 듀얼 캡처"
            description="ScreenCaptureKit 차세대 고속 API를 통해 화상회의(Zoom, Teams), 유튜브 음질 손상 없이 시스템 오디오와 유저 자신의 마이크 입력을 혼선 없이 깔끔하게 분리 수집합니다."
          />
          <FeatureCard 
            icon="🧠"
            title="AI PRO 번역 & Secure Keychain"
            description="입력한 개인 API Key는 macOS 보안 전용 안전지대인 Secure Keychain에 완벽히 암호화 보존됩니다. 중개 서버 유출 걱정 없이 다이렉트로 Gemini와 GPT-4o-mini 엔진에 전달됩니다."
          />
          <FeatureCard 
            icon="📊"
            title="AI Executive 회의록 자동 생성"
            description="통역된 전체 타임라인 대화 내용과 대조하며, 핵심 Action Items 체크리스트 및 하이라이트 요약을 마크다운 보고서(.md) 포맷으로 회의 종료와 동시에 로컬에 추출합니다."
          />
        </div>
      </section>
      
      {/* --- INTERACTIVE SIMULATOR SECTION --- */}
      <section className="sylphio-section">
        <div className="sylphio-section-header">
          <h2>실시간 가상 자막바 미리 체험하기</h2>
          <p>
            웹 시뮬레이터를 통해 실제 실피오 앱이 자막을 생성하고 실시간 통역하는 방식을 간접 경험해보세요.
          </p>
        </div>
        
        <div className="sylphio-simulator-box">
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
              className={`btn-simulator ${activeScenario === 'jp' ? 'active' : ''}`}
              onClick={() => handlePlayScenario('jp')}
              disabled={isPlaying && activeScenario === 'jp'}
              id="btn-sim-japanese"
            >
              🇯🇵 Japanese Seminar ( Kenji )
            </button>
          </div>
          
          <div className="sylphio-virtual-bar">
            {activeScenario ? (
              <div style={{ transition: 'all 0.5s ease' }}>
                <div className="sylphio-sim-speaker">
                  🔊 {SCENARIOS[activeScenario].speaker}
                </div>
                
                <p className="sylphio-sim-source">
                  {displayedSource}
                  {isPlaying && displayedSource.length < SCENARIOS[activeScenario].source.length && (
                    <span className="sylphio-cursor-pulse">|</span>
                  )}
                </p>
                
                {showTranslated && (
                  <div className="sylphio-sim-translated" style={{ animation: 'slideUpFadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
                    <div style={{ fontSize: '0.8rem', color: '#60a5fa', marginBottom: '4px', fontWeight: 'bold' }}>
                      ⚡ AI REAL-TIME TRANSLATION
                    </div>
                    {displayedTranslated}
                    {isPlaying && displayedTranslated.length < SCENARIOS[activeScenario].translated.length && (
                      <span className="sylphio-cursor-pulse">|</span>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="sylphio-virtual-bar-placeholder">
                위의 시나리오 버튼을 클릭하여 AI 실시간 자막 시뮬레이션을 가동해 보세요.
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* --- PRICING SECTION --- */}
      <section className="sylphio-section">
        <div className="sylphio-section-header">
          <h2>합리적인 라이선스 모델</h2>
          <p>
            매달 청구되는 무거운 구독 요금을 종결하세요. 개인 API Key 연동으로 쓰고 마신 만큼만 1원 단위로 지불합니다.
          </p>
        </div>
        
        <div className="sylphio-pricing-cards">
          {/* Free Tier */}
          <div className="sylphio-pricing-card">
            <h3>Sylphio Free</h3>
            <div className="sylphio-price">₩0 <span>/ 평생 무료</span></div>
            <p className="sylphio-price-desc">
              기본적인 온디바이스 통역과 오디오 캡처 기능을 무제한 경험해 보세요.
            </p>
            <ul className="sylphio-pricing-features">
              <li>100% 로컬 온디바이스 STT 무제한 작동</li>
              <li>시스템 오디오 & 마이크 실시간 캡처 지원</li>
              <li>Apple 내장 프레임워크 기반 기본 오프라인 번역</li>
              <li>실시간 글래스모피즘 자막 뷰어 기본 제공</li>
            </ul>
            <a 
              href="https://apps.apple.com" 
              target="_blank" 
              rel="noreferrer" 
              className="btn-sylphio-secondary"
              style={{ textAlign: 'center', justifyContent: 'center' }}
              id="btn-pricing-free"
            >
              무료 다운로드
            </a>
          </div>
          
          {/* Pro Lifetime Tier */}
          <div className="sylphio-pricing-card premium">
            <h3>Sylphio Pro Lifetime</h3>
            <div className="sylphio-price">$9.99 <span>/ 단 1회 결제 (소장)</span></div>
            <p className="sylphio-price-desc">
              단 한 번의 커피 두 잔 값 결제로 평생 라이선스를 획득하고 AI Pro 번역 기능을 완전 봉인 해제하세요.
            </p>
            <ul className="sylphio-pricing-features">
              <li><strong>Free 티어의 모든 핵심 가치 포함</strong></li>
              <li><strong>AI PRO 실시간 통역 엔진 잠금해제</strong> (BYOK 무제한)</li>
              <li><strong>Google Gemini / OpenAI API 연동 지원</strong></li>
              <li>macOS Secure Keychain API Key 강력 암호화 저장</li>
              <li><strong>AI Executive 회의록 자동 생성 (.md 다운로드)</strong></li>
              <li>평생 소프트웨어 마이너/메이저 무상 업데이트 제공</li>
            </ul>
            <a 
              href="https://apps.apple.com" 
              target="_blank" 
              rel="noreferrer" 
              className="btn-sylphio-primary"
              style={{ textAlign: 'center', justifyContent: 'center' }}
              id="btn-pricing-pro"
            >
              평생 라이선스 소장하기
            </a>
          </div>
        </div>
      </section>
      
      {/* --- FOOTER / PRIVACY AGREEMENT --- */}
      <footer className="sylphio-section" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', textAlign: 'center', padding: '40px 24px' }}>
        <p style={{ color: '#475569', fontSize: '0.9rem', marginBottom: '16px' }}>
          © 2026 PriSincera. All Rights Reserved. Sylphio is a registered product of PriSincera.
        </p>
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', fontSize: '0.9rem' }}>
          <Link to="/sylphio/privacy" style={{ color: '#64748b', textDecoration: 'none' }} id="link-footer-privacy">
            Zero Data 개인정보 처리방침
          </Link>
          <Link to="/sylphio/guide" style={{ color: '#64748b', textDecoration: 'none' }} id="link-footer-guide">
            API Key 연동 가이드
          </Link>
          <a href="mailto:support@prisincera.com" style={{ color: '#64748b', textDecoration: 'none' }}>
            고객 지원 (support@prisincera.com)
          </a>
        </div>
      </footer>
    </div>
  );
}
