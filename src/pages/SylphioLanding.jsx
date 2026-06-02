import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../contexts/LanguageContext';
import SylphioNav from '../components/layout/SylphioNav';
import './SylphioLanding.css';

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

// Typing Simulator Data (Multilingual Input Scenarios)
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

// Multilingual Content Map for Premium UX
const TRANSLATIONS = {
  ko: {
    heroTitle: "소리 없이 흐르는 지적인 통역 정령, Sylphio",
    heroTagline: "화면의 모든 소리와 마이크를 실시간 캡처하여, 온디바이스에서 지체 없이 자막으로 구현합니다.\nGemini와 GPT의 강력한 다국어 지능을 Mac 네이티브 환경에서 완벽하게 경험해보세요.",
    heroCtaDownload: "📥 Mac App Store에서 무료 다운로드",
    heroCtaGuide: "💡 API Key 발급 가이드 보기",
    featuresTitle: "가장 완벽한 실시간 AI 통역의 5대 무기",
    featuresSub: "기존 번역 솔루션의 침묵 장애와 캡처 실패 한계를 뛰어넘은 Mac 전용 아키텍처",
    f1Title: "AirPods Max & Bluetooth 동적 락온",
    f1Desc: "회의 시작 시 블루투스 이어폰 탈착으로 인한 오디오 장치 유실을 방지합니다. 사용 중인 에어팟 실명을 동적으로 감지하여 실시간 100% 오디오 수집 스트림에 자동 매핑합니다.",
    f2Title: "100% 로컬 온디바이스 STT 엔진",
    f2Desc: "네트워크 지연이나 60초 통신 차단 제한으로 번역이 끊기는 현상을 완벽 박멸했습니다. 기기 내부 오프라인 로컬 신경망으로 0ms 레이턴시 무중단 음성 음절 추출을 지원합니다.",
    f3Title: "시스템 & 마이크 듀얼 캡처",
    f3Desc: "ScreenCaptureKit 차세대 고속 API를 통해 화상회의(Zoom, Teams), 유튜브 음질 손상 없이 시스템 오디오와 유저 자신의 마이크 입력을 혼선 없이 깔끔하게 분리 수집합니다.",
    f4Title: "AI PRO 번역 & Secure Keychain",
    f4Desc: "입력한 개인 API Key는 macOS 보안 전용 안전지대인 Secure Keychain에 완벽히 암호화 보존됩니다. 중개 서버 유출 걱정 없이 다이렉트로 Gemini와 GPT-4o-mini 엔진에 전달됩니다.",
    f5Title: "AI Executive 회의록 자동 생성",
    f5Desc: "통역된 전체 타임라인 대화 내용과 대조하며, 핵심 Action Items 체크리스트 및 하이라이트 요약을 마크다운 보고서(.md) 포맷으로 회의 종료와 동시에 로컬에 추출합니다.",
    simTitle: "실시간 가상 자막바 미리 체험하기",
    simSub: "웹 시뮬레이터를 통해 실제 실피오 앱이 자막을 생성하고 실시간 통역하는 방식을 간접 경험해보세요.",
    simPlaceholder: "위의 시나리오 버튼을 클릭하여 AI 실시간 자막 시뮬레이션을 가동해 보세요.",
    pricingTitle: "합리적인 라이선스 모델",
    pricingSub: "매달 청구되는 무거운 구독 요금을 종결하세요. 개인 API Key 연동으로 쓰고 마신 만큼만 1원 단위로 지불합니다.",
    priceFreeDesc: "기본적인 온디바이스 통역과 오디오 캡처 기능을 무제한 경험해 보세요.",
    priceProDesc: "단 한 번의 커피 두 잔 값 결제로 평생 라이선스를 획득하고 AI Pro 번역 기능을 완전 봉인 해제하세요.",
    freeTitle: "Sylphio Free",
    freePrice: "₩0",
    freePricePeriod: "/ 평생 무료",
    proTitle: "Sylphio Pro Lifetime",
    proPrice: "$9.99",
    proPricePeriod: "/ 단 1회 결제 (소장)",
    freeFeature1: "100% 로컬 온디바이스 STT 무제한 작동",
    freeFeature2: "시스템 오디오 & 마이크 실시간 캡처 지원",
    freeFeature3: "Apple 내장 프레임워크 기반 기본 오프라인 번역",
    freeFeature4: "실시간 글래스모피즘 자막 뷰어 기본 제공",
    proFeature1: "Free 티어의 모든 핵심 가치 포함",
    proFeature2: "AI PRO 실시간 통역 엔진 잠금해제 (BYOK)",
    proFeature3: "Google Gemini / OpenAI API 연동 지원",
    proFeature4: "macOS Secure Keychain API Key 암호화 저장",
    proFeature5: "AI Executive 회의록 자동 생성 (.md)",
    proFeature6: "평생 소프트웨어 마이너/메이저 무상 업데이트",
    btnFreeCta: "무료 다운로드",
    btnProCta: "평생 라이선스 소장하기",
    footerDesc: "© 2026 PriSincera. All Rights Reserved. Sylphio is a registered product of PriSincera.",
    footerPrivacy: "Zero Data 개인정보 처리방침",
    footerGuide: "API Key 연동 가이드",
    footerSupport: "고객 지원"
  },
  en: {
    heroTitle: "The Intelligent Translation Spirit in Silence, Sylphio",
    heroTagline: "Captures screen audio and microphone input in real-time, instantly rendering subtitles on-device.\nExperience the powerful multilingual intelligence of Gemini and GPT flawlessly in a Mac native environment.",
    heroCtaDownload: "📥 Free Download on Mac App Store",
    heroCtaGuide: "💡 View API Key Integration Guide",
    featuresTitle: "5 Ultimate Weapons for Flawless Real-Time AI Translation",
    featuresSub: "A Mac-dedicated architecture designed to eliminate silent freezes and capture failures.",
    f1Title: "AirPods Max & Bluetooth Dynamic Lock-on",
    f1Desc: "Prevents audio device loss caused by detaching bluetooth earphones during meetings. It dynamically detects your AirPods' real name and maps it automatically to the audio stream.",
    f2Title: "100% Local On-Device STT Engine",
    f2Desc: "Completely eliminates translation lag and pauses due to network issues or 60-second connection timeouts. Supports offline local neural speech-to-text with 0ms latency.",
    f3Title: "System & Microphone Dual Capture",
    f3Desc: "Uses ScreenCaptureKit high-speed API to capture system audio and microphone inputs cleanly without mixing, perfect for Zoom, Teams, and YouTube without losing audio quality.",
    f4Title: "AI PRO Translation & Secure Keychain",
    f4Desc: "Your personal API Keys are securely stored in the macOS Secure Keychain. Keys are sent directly to Gemini and GPT-4o-mini without passing through intermediate servers.",
    f5Title: "AI Executive Meeting Minutes Generation",
    f5Desc: "Instantly exports a structured Markdown report (.md) containing full conversation timelines, Action Items checklists, and executive summaries at the end of your meeting.",
    simTitle: "Experience the Virtual Subtitle Bar in Real-Time",
    simSub: "Get a sneak peek at how the real Sylphio app captures and translates dialogue in real-time through this web simulator.",
    simPlaceholder: "Click the scenario buttons above to run the AI real-time subtitle simulation.",
    pricingTitle: "A Fair and Reasonable License Model",
    pricingSub: "End heavy monthly subscriptions. Pay only for what you use down to the penny by connecting your own API key.",
    priceFreeDesc: "Experience basic on-device speech-to-text and screen audio capture for free, forever.",
    priceProDesc: "Unlock professional AI translation features permanently for the price of just two cups of coffee.",
    freeTitle: "Sylphio Free",
    freePrice: "$0",
    freePricePeriod: "/ Free Forever",
    proTitle: "Sylphio Pro Lifetime",
    proPrice: "$9.99",
    proPricePeriod: "/ One-time purchase",
    freeFeature1: "Unlimited 100% local on-device STT",
    freeFeature2: "Real-time system audio & mic capture",
    freeFeature3: "Basic offline translation via Apple frameworks",
    freeFeature4: "Real-time glassmorphism subtitle viewer",
    proFeature1: "Includes all Free tier core benefits",
    proFeature2: "Unlock AI PRO real-time translation engine (BYOK)",
    proFeature3: "Google Gemini / OpenAI API integration support",
    proFeature4: "macOS Secure Keychain encrypted key storage",
    proFeature5: "AI Executive minutes auto-generation (.md)",
    proFeature6: "Lifetime free minor/major software updates",
    btnFreeCta: "Free Download",
    btnProCta: "Get Lifetime License",
    footerDesc: "© 2026 PriSincera. All Rights Reserved. Sylphio is a registered product of PriSincera.",
    footerPrivacy: "Zero Data Privacy Policy",
    footerGuide: "API Key Integration Guide",
    footerSupport: "Support"
  },
  ja: {
    heroTitle: "静かに囁く知的な翻訳の精霊、Sylphio",
    heroTagline: "画面のすべての音声とマイク入力をリアルタイムにキャプチャし、オンデバイスで遅延なく字幕としてレンダリングします。\nGeminiとGPT의 강력한 다국어 지능을、Mac네이티브 환경에서 완벽하게 체험해 보세요.",
    heroCtaDownload: "📥 Mac App Storeで無料ダウンロード",
    heroCtaGuide: "💡 APIキー連携ガイドを見る",
    featuresTitle: "完璧なリアルタイムAI通訳を実現する5つの武器",
    featuresSub: "従来の翻訳ツールの沈黙フリーズやキャプチャ失敗の限界を克服した、Mac専用アーキテクチャ。",
    f1Title: "AirPods Max & Bluetooth 動的ロックオン",
    f1Desc: "会議中のイヤホン脱着によるオーディオ損失を防ぎます。お使い의 AirPodsのデバイス名を自動検出し、リアルタイムに集音ストリームへ自動マッピングします。",
    f2Title: "100% ローカルオンデバイス STTエンジン",
    f2Desc: "ネットワーク遅延や60秒制限による字幕の中断を完全に防止。端末内のオフラインローカルニューラルエンジンにより、レイテンシー0msで無制限の音声抽出をサポートします。",
    f3Title: "システム & 마이크 デュアルキャプチャ",
    f3Desc: "ScreenCaptureKit高速APIを駆使し、ZoomやTeams、YouTubeなどのシステム音声と自分自身のマイク音声を混ざることなく綺麗に分離して収集します。",
    f4Title: "AI PRO 翻訳 & Secure Keychain",
    f4Desc: "入力されたAPIキーは、macOS安全地帯であるSecure Keychainに暗号化保存されます。中継サーバーへの流出の心配なく、GeminiやGPT-4o-miniへダイレクトに転送されます。",
    f5Title: "AI Executive 議事録自動作成",
    f5Desc: "翻訳されたタイムライン対話内容と照合し、会議終了と同時にアクションアイテムのチェックリストと要約をまとめたMarkdownレポート（.md）をローカルに自動出力します。",
    simTitle: "リアルタイム仮想字幕バーを体験する",
    simSub: "Webシミュレータを通じて、実際のSylphioアプリが字幕を生成しリアルタイムに通訳するフローを体験してみてください。",
    simPlaceholder: "上のシナリオボタンをクリックして、AIリアルタイム字幕シミュレーションを起動します。",
    pricingTitle: "合理的なライセンスモデル",
    pricingSub: "重い月額サブスクリプションはもう不要。個人APIキーとの連携により、消費した分だけ1円単位で支払う合理的なモデルです。",
    priceFreeDesc: "基本的なオンデバイス通訳およびオーディオキャプチャ機能を無制限に体験してください。",
    priceProDesc: "コーヒー2杯分の支払いで、プロ仕様のAI翻訳エンジンと高度な要約機能を永続的にアンロックできます。",
    freeTitle: "Sylphio Free",
    freePrice: "¥0",
    freePricePeriod: "/ 永久無料",
    proTitle: "Sylphio Pro Lifetime",
    proPrice: "$9.99",
    proPricePeriod: "/ 1回のみの支払い（永久ライセンス）",
    freeFeature1: "100% ローカルオンデバイス STTの無制限稼働",
    freeFeature2: "システムオーディオ & 마이크のリアルタイム収集",
    freeFeature3: "Appleフレームワークベースの基本オフライン翻訳",
    freeFeature4: "リアルタイム・グラスモフィズム字幕ビューア搭載",
    proFeature1: "Freeティアのすべての価値を含む",
    proFeature2: "AI PRO リアルタイム通訳エンジンのアンロック (BYOK)",
    proFeature3: "Google Gemini / OpenAI API 連携のサポート",
    proFeature4: "macOS Secure Keychain APIキー暗号化保管",
    proFeature5: "AI Executive 議事録自動作成 (.mdエクスポート)",
    proFeature6: "生涯ソフトウェア・マイナー/メイジャーアップデート無償提供",
    btnFreeCta: "無料ダウンロード",
    btnProCta: "永久ライセンスを所有する",
    footerDesc: "© 2026 PriSincera. All Rights Reserved. Sylphio is a registered product of PriSincera.",
    footerPrivacy: "Zero Data 個人情報処理方針",
    footerGuide: "APIキー連携ガイド",
    footerSupport: "カスタマーサポート"
  }
};

export default function SylphioLanding() {
  const { locale, t } = useTranslation();
  const d = TRANSLATIONS[locale] || TRANSLATIONS['ko'];
  
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
  
  return (
    <div 
      className="sylphio-landing" 
      onMouseMove={handleBgMouseMove}
      style={{
        '--mouse-x': mousePos.x,
        '--mouse-y': mousePos.y
      }}
    >
      <SylphioNav />
      {/* --- HERO SECTION --- */}
      <section className="sylphio-hero">
        <div className="sylphio-core-container">
          <div className="sylphio-aurora-core"></div>
          <div className="sylphio-aurora-ring"></div>
        </div>
        
        <h1>{d.heroTitle}</h1>
        
        <p className="tagline" style={{ whiteSpace: 'pre-line' }}>
          {d.heroTagline}
        </p>
        
        <div className="sylphio-hero-ctas">
          <a 
            href="#" 
            onClick={handleAlert} 
            className="btn-primary"
            id="btn-download-mac"
          >
            <span>{d.heroCtaDownload}</span>
          </a>
          <Link 
            to="/sylphio/guide" 
            className="btn-secondary"
            id="btn-guide-main"
          >
            <span>{d.heroCtaGuide}</span>
          </Link>
        </div>
      </section>
      
      {/* --- CORE FEATURES SECTION --- */}
      <section className="sylphio-section">
        <div className="sylphio-section-header">
          <h2>{d.featuresTitle}</h2>
          <p>{d.featuresSub}</p>
        </div>
        
        <div className="sylphio-features-grid">
          <FeatureCard 
            icon="🎙️"
            title={d.f1Title}
            description={d.f1Desc}
          />
          <FeatureCard 
            icon="🛡️"
            title={d.f2Title}
            description={d.f2Desc}
          />
          <FeatureCard 
            icon="💻"
            title={d.f3Title}
            description={d.f3Desc}
          />
          <FeatureCard 
            icon="🧠"
            title={d.f4Title}
            description={d.f4Desc}
          />
          <FeatureCard 
            icon="📊"
            title={d.f5Title}
            description={d.f5Desc}
          />
        </div>
      </section>
      
      {/* --- INTERACTIVE SIMULATOR SECTION --- */}
      <section className="sylphio-section">
        <div className="sylphio-section-header">
          <h2>{d.simTitle}</h2>
          <p>{d.simSub}</p>
        </div>
        
        <div className="sylphio-simulator-box premium-card">
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
                {d.simPlaceholder}
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* --- PRICING SECTION --- */}
      <section className="sylphio-section">
        <div className="sylphio-section-header">
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
            </ul>
            <a 
              href="#" 
              onClick={handleAlert} 
              className="btn-secondary"
              style={{ textAlign: 'center', justifyContent: 'center' }}
              id="btn-pricing-free"
            >
              {d.btnFreeCta}
            </a>
          </div>
          
          {/* Pro Lifetime Tier */}
          <div className="sylphio-pricing-card premium-card premium">
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
            </ul>
            <a 
              href="#" 
              onClick={handleAlert} 
              className="btn-primary"
              style={{ textAlign: 'center', justifyContent: 'center' }}
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
