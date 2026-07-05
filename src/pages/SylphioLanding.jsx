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
  ko: {
    speaker: "민수 (프로젝트 리더)",
    source: "안녕하세요 여러분. 오늘 회의에서는 다음 분기 릴리즈 일정과 새롭게 추가될 실시간 번역 기능의 안정성에 대해 논의하겠습니다.",
    translated: "Hello everyone. In today's meeting, we will discuss the next quarter's release schedule and the stability of the newly added real-time translation feature."
  },
  jp: {
    speaker: "Kenji (AI Engineer)",
    source: "皆さん、こんにちは。本日のセミナーでは, オンデバイスAI技術が私たちの日常生活にどのような変化をもたらすかについてお話しします。",
    translated: "여러분, 안녕하십니까. 오늘 세미나에서는 온디바이스 AI 기술이 우리의 일상 생활에 어떤 변화를 가져올지에 대해 말씀드리겠습니다."
  }
};

// Multilingual Content Map for Premium UX
const TRANSLATIONS = {
  ko: {
    heroTitle: "Sylphio",
    heroTagline: "소리 없이 흐르는 지적인 통역 정령, Sylphio.\n화면의 모든 소리와 마이크를 실시간 캡처하여, 온디바이스에서 지체 없이 자막으로 구현합니다.\nGemini와 GPT의 강력한 다국어 지능을 Mac 네이티브 환경에서 완벽하게 경험해보세요.",
    heroCtaDownload: "📥 Mac App Store에서 무료 다운로드",
    heroCtaGuide: "💡 API Key 발급 가이드 보기",
    featuresTitle: "가장 완벽한 실시간 AI 통역·회의록의 7대 무기",
    featuresSub: "기존 번역 솔루션의 침묵 장애와 캡처 실패 한계를 뛰어넘은 Mac 전용 아키텍처",
    f1Title: "AirPods Max & Bluetooth 동적 락온",
    f1Desc: "회의 시작 시 블루투스 이어폰 탈착으로 인한 오디오 장치 유실을 방지합니다. 사용 중인 에어팟 실명을 동적으로 감지하여 실시간 100% 오디오 수집 스트림에 자동 매핑합니다.",
    f2Title: "하이브리드 로컬 STT 엔진",
    f2Desc: "기기 내부 오프라인 로컬 신경망을 기반으로 하되, 로컬 언어 팩이 없는 경우 Apple 보안 서버 STT로 자동 폴백하여 끊김 없고 정확한 음성 음절 추출을 지원합니다.",
    f3Title: "3종 오디오 소스 분리 캡처",
    f3Desc: "ScreenCaptureKit 차세대 고속 API로 내장 마이크 · 에어팟(블루투스) · 시스템 사운드 3가지 오디오 소스를 혼선 없이 분리 수집합니다. Zoom·Teams·유튜브 오디오를 음질 손상 없이 담아내며, 시스템 사운드 캡처에는 macOS 화면 녹화 권한이 사용됩니다.",
    f4Title: "AI PRO 엔진 & Secure Keychain",
    f4Desc: "입력한 개인 API Key는 macOS 전용 보안 금고 Secure Keychain에 암호화 보존됩니다. AI 처리는 개발사 중개 서버를 전혀 거치지 않고 사용자의 기기에서 Google Gemini(2.5 Flash/Pro) 등 선택한 제공사로 직접 전송됩니다. (실시간 자막은 텍스트만, 정밀 회의록은 녹음 오디오가 본인 키로 업로드됩니다.)",
    f5Title: "AI 회의록 자동 생성 & 2가지 모드",
    f5Desc: "회의 종료와 동시에 모던한 회의록 화면과 함께 핵심 Action Items 체크리스트·요약을 담은 마크다운(.md) 보고서를 로컬에 생성합니다. 실시간 통역 모드와, 번역 없이 전사·요약만 수행하는 회의록 전용 모드를 함께 지원합니다.",
    f6Title: "데스크톱 네이티브 프리미엄 UI",
    f6Desc: "720x700 규격의 일원화된 시원한 레이아웃과 자막 뷰어 내 대화록 동적 폰트 스케일업(슬라이더 조절) 기능을 지원하여 최상의 가독성과 네이티브 사용성을 선사합니다.",
    f7Title: "정밀 회의록 (녹음 재분석)",
    f7Desc: "세션 종료 후 녹음된 오디오(.m4a)를 Google Gemini 멀티모달로 재분석하여, 실시간 자막보다 훨씬 정밀한 전사·요약(통역 모드는 번역까지)을 생성합니다. 여러 오디오 소스를 오간 세션도 전체를 하나로 병합해 분석·다운로드하고, 쿼터 회복 후 '정밀 재생성'으로 다시 만들 수 있습니다. (BYOK Pro · 오디오가 본인 API로 Google에 업로드)",
    simTitle: "실시간 가상 자막바 미리 체험하기",
    simSub: "웹 시뮬레이터를 통해 실제 실피오 앱이 자막을 생성하고 실시간 통역하는 방식을 간접 경험해보세요.",
    simPlaceholder: "위의 시나리오 버튼을 클릭하여 AI 실시간 자막 시뮬레이션을 가동해 보세요.",
    pricingTitle: "합리적인 라이선스 모델",
    pricingSub: "매달 청구되는 무거운 구독 요금을 종결하세요.\n개인 API Key 연동으로 쓰고 마신 만큼만 1원 단위로 지불합니다.",
    priceFreeDesc: "기본적인 온디바이스 통역과 오디오 캡처 기능을 무제한 경험해 보세요.",
    priceProDesc: "단 한 번의 커피 두 잔 값 결제로 평생 라이선스를 획득하고 AI Pro 번역 기능을 완전 봉인 해제하세요.",
    freeTitle: "Sylphio Free",
    freePrice: "₩0",
    freePricePeriod: "/ 평생 무료",
    proTitle: "Sylphio Pro Lifetime",
    proPrice: "$9.99",
    proPricePeriod: "/ 단 1회 결제 (소장)",
    freeFeature1: "영어 및 한국어 음성 인식 및 기본 번역 무제한 지원",
    freeFeature2: "내장 마이크 · 에어팟 · 시스템 사운드 3종 실시간 캡처",
    freeFeature3: "영어 및 한국어 실시간 오프라인/하이브리드 번역 자막 제공",
    freeFeature4: "실시간 글래스모피즘 자막 뷰어 기본 제공",
    freeFeature5: "전체 세션 녹음 저장 및 .m4a 다운로드 (무료)",
    proFeature1: "10개 이상 다국어(일본어, 중국어, 프랑스어 등) 잠금 전면 해제",
    proFeature2: "AI PRO 요약 및 Action Items 엔진 잠금해제 (BYOK)",
    proFeature3: "Google Gemini / OpenAI API 연동 지원",
    proFeature4: "macOS Secure Keychain API Key 암호화 저장",
    proFeature5: "AI Executive 회의록 및 요약 보고서 자동 생성 (.md)",
    proFeature6: "평생 소프트웨어 마이너/메이저 무상 업데이트",
    proFeature7: "정밀 회의록: 녹음 오디오 재분석 (Google Gemini 2.5 멀티모달)",
    btnFreeCta: "무료 다운로드",
    btnProCta: "평생 라이선스 소장하기",
    footerDesc: "© 2026 PriSincera. All Rights Reserved. Sylphio is a registered product of PriSincera.",
    footerPrivacy: "Zero Data 개인정보 처리방침",
    footerGuide: "API Key 연동 가이드",
    footerSupport: "고객 지원"
  },
  en: {
    heroTitle: "Sylphio",
    heroTagline: "Sylphio, the intelligent translation spirit in silence.\nCaptures screen audio and microphone input in real-time, instantly rendering subtitles on-device.\nExperience the powerful multilingual intelligence of Gemini and GPT flawlessly in a Mac native environment.",
    heroCtaDownload: "📥 Free Download on Mac App Store",
    heroCtaGuide: "💡 View API Key Integration Guide",
    featuresTitle: "7 Ultimate Weapons for Flawless Real-Time AI Translation & Minutes",
    featuresSub: "A Mac-dedicated architecture designed to eliminate silent freezes and capture failures.",
    f1Title: "AirPods Max & Bluetooth Dynamic Lock-on",
    f1Desc: "Prevents audio device loss caused by detaching bluetooth earphones during meetings. It dynamically detects your AirPods' real name and maps it automatically to the audio stream.",
    f2Title: "Hybrid Local STT Engine",
    f2Desc: "Powered primarily by local on-device neural networks, with an automatic fallback to Apple's secure server speech recognition when local language packs are unavailable, ensuring continuous and precise transcription.",
    f3Title: "Three-Source Separated Audio Capture",
    f3Desc: "Uses the next-gen ScreenCaptureKit API to cleanly separate three audio sources — built-in mic, AirPods (Bluetooth), and system sound — without mixing. Captures Zoom, Teams, and YouTube audio losslessly; system-sound capture uses the macOS screen-recording permission.",
    f4Title: "AI PRO Engine & Secure Keychain",
    f4Desc: "Your personal API Key is stored encrypted in the macOS Secure Keychain. AI processing never passes through our servers — data goes straight from your device to your chosen provider such as Google Gemini (2.5 Flash/Pro). Real-time subtitles send text only; Enhanced Minutes upload the recorded audio via your own key.",
    f5Title: "AI Meeting Minutes & Two Modes",
    f5Desc: "The moment a session ends, Sylphio shows a modern minutes view and generates a local Markdown (.md) report with Action Items and an executive summary. Choose between real-time interpretation mode and a minutes-only mode that transcribes and summarizes without translation.",
    f6Title: "Desktop Native Premium UI",
    f6Desc: "Features a unified 720x700 spacious layout and dynamic subtitle font scaling controlled via an intuitive slider, offering optimal readability and native macOS experience.",
    f7Title: "Enhanced Minutes (Recording Re-analysis)",
    f7Desc: "After a session ends, your recorded audio (.m4a) is re-analyzed by Google Gemini's multimodal model for far more accurate transcription and summary (plus translation in interpretation mode). Sessions that switched audio sources are merged into one for full analysis and download, and you can 'Regenerate' later once quota recovers. (BYOK Pro · audio is uploaded to Google via your own key.)",
    simTitle: "Experience the Virtual Subtitle Bar in Real-Time",
    simSub: "Get a sneak peek at how the real Sylphio app captures and translates dialogue in real-time through this web simulator.",
    simPlaceholder: "Click the scenario buttons above to run the AI real-time subtitle simulation.",
    pricingTitle: "A Fair and Reasonable License Model",
    pricingSub: "End heavy monthly subscriptions.\nPay only for what you use down to the penny by connecting your own API key.",
    priceFreeDesc: "Experience basic on-device speech-to-text and screen audio capture for free, forever.",
    priceProDesc: "Unlock professional AI translation features permanently for the price of just two cups of coffee.",
    freeTitle: "Sylphio Free",
    freePrice: "$0",
    freePricePeriod: "/ Free Forever",
    proTitle: "Sylphio Pro Lifetime",
    proPrice: "$9.99",
    proPricePeriod: "/ One-time purchase",
    freeFeature1: "Unlimited English & Korean speech-to-text & basic translation",
    freeFeature2: "Real-time capture from 3 sources: built-in mic, AirPods & system sound",
    freeFeature3: "English & Korean real-time offline/hybrid translation subtitles",
    freeFeature4: "Real-time glassmorphism subtitle viewer",
    freeFeature5: "Save & download full-session recordings (.m4a) — free",
    proFeature1: "Unlock all 10+ global languages (Japanese, Chinese, etc.)",
    proFeature2: "Unlock AI PRO summary and Action Items engine (BYOK)",
    proFeature3: "Google Gemini / OpenAI API integration support",
    proFeature4: "macOS Secure Keychain encrypted key storage",
    proFeature5: "AI Executive minutes & summary auto-generation (.md)",
    proFeature6: "Lifetime free minor/major software updates",
    proFeature7: "Enhanced Minutes: recording re-analysis (Google Gemini 2.5 multimodal)",
    btnFreeCta: "Free Download",
    btnProCta: "Get Lifetime License",
    footerDesc: "© 2026 PriSincera. All Rights Reserved. Sylphio is a registered product of PriSincera.",
    footerPrivacy: "Zero Data Privacy Policy",
    footerGuide: "API Key Integration Guide",
    footerSupport: "Support"
  },
  ja: {
    heroTitle: "Sylphio",
    heroTagline: "静かに囁く知的な翻訳の精霊、Sylphio。\n画面のすべての音声とマイク入力をリアルタイムにキャプチャし、オンデバイスで遅延なく字幕としてレンダリングします。\nGeminiとGPTの強力な多言語知能を、Macのネイティブ環境で完璧に体験してください。",
    heroCtaDownload: "📥 Mac App Storeで無料ダウンロード",
    heroCtaGuide: "💡 APIキー連携ガイドを見る",
    featuresTitle: "完璧なリアルタイムAI通訳・議事録を実現する7つの武器",
    featuresSub: "従来の翻訳ツールの沈黙フリーズやキャプチャ失敗の限界を克服した、Mac専用アーキテクチャ。",
    f1Title: "AirPods Max & Bluetooth 動的ロックオン",
    f1Desc: "会議開始時のBluetoothイヤホン着脱によるオーディオデバイスの切断を防ぎます。お使いのAirPodsのデバイス名を動的に検知し、リアルタイムの集音ストリームへ自動マッピングします。",
    f2Title: "ハイブリッド・ローカル STTエンジン",
    f2Desc: "端末内のオフライン・ローカルニューラルエンジンを基本としつつ、ローカル言語パックがない場合はAppleのセキュア音声認識サーバーへ自動フォールバックし、途切れのない正確な文字起こしを実現します。",
    f3Title: "3種オーディオソースの分離キャプチャ",
    f3Desc: "次世代の高速API ScreenCaptureKitで、内蔵マイク・AirPods（Bluetooth）・システムサウンドの3ソースを混ざることなく分離収集。Zoom・Teams・YouTubeの音声を高音質で取り込みます（システムサウンド収集にはmacOSの画面収録権限を使用）。",
    f4Title: "AI PRO エンジン & Secure Keychain",
    f4Desc: "入力した個人APIキーはmacOS専用のセキュア金庫Secure Keychainに暗号化保存されます。AI処理は開発元の中継サーバーを一切経由せず、端末からGoogle Gemini（2.5 Flash/Pro）など選択したプロバイダへ直接送信されます。リアルタイム字幕はテキストのみ、精密議事録は録音音声をご自身のキーでアップロードします。",
    f5Title: "AI議事録の自動作成 & 2つのモード",
    f5Desc: "セッション終了と同時に、モダンな議事録画面とともにアクションアイテムのチェックリスト・要約をまとめたMarkdown（.md）レポートをローカルに生成します。リアルタイム通訳モードと、翻訳せず文字起こし・要約のみを行う議事録専用モードを選べます。",
    f6Title: "デスクトップネイティブ・プレミアムUI",
    f6Desc: "720x700規格の統一された広々としたレイアウトと、字幕ビューア内の対話ログの動的フォントスケール（スライダー調整）に対応し、最高の可読性とネイティブな使い心地を提供します。",
    f7Title: "精密議事録（録音の再分析）",
    f7Desc: "セッション終了後、録音した音声（.m4a）をGoogle Geminiのマルチモーダルで再分析し、リアルタイム字幕よりはるかに精密な文字起こしと要約（通訳モードでは翻訳も）を生成します。音声ソースを切り替えたセッションも全体を1つに結合して分析・ダウンロードでき、クォータ回復後は「精密再生成」で作り直せます。（BYOK Pro・音声はご自身のAPIでGoogleにアップロード）",
    simTitle: "リアルタイム仮想字幕バーを体験する",
    simSub: "Webシミュレータを通じて、実際のSylphioアプリが字幕を生成しリアルタイムに通訳するフローを体験してみてください。",
    simPlaceholder: "上のシナリオボタンをクリックして、AIリアルタイム字幕シミュレーションを起動します。",
    pricingTitle: "合理的なライセンスモデル",
    pricingSub: "重い月額サブスクリプションはもう不要。\n個人APIキーとの連携により、消費した分だけ1円単位で支払う合理的なモデルです。",
    priceFreeDesc: "基本的なオンデバイス通訳およびオーディオキャプチャ機能を無制限に体験してください。",
    priceProDesc: "コーヒー2杯分の支払いで、プロ仕様のAI翻訳エンジンと高度な要約機能を永続的にアンロックできます。",
    freeTitle: "Sylphio Free",
    freePrice: "¥0",
    freePricePeriod: "/ 永久無料",
    proTitle: "Sylphio Pro Lifetime",
    proPrice: "$9.99",
    proPricePeriod: "/ 1回のみの支払い",
    freeFeature1: "英語(English)と韓国語(Korean)の音声認識および基本翻訳の無制限サポート",
    freeFeature2: "内蔵マイク・AirPods・システムサウンドの3ソースをリアルタイム収集",
    freeFeature3: "英語と韓国語専用のリアルタイム・オフライン/ハイブリッド翻訳字幕の提供",
    freeFeature4: "リアルタイム・グラスモフィズム字幕ビューアを標準搭載",
    freeFeature5: "セッション録音の保存と.m4aダウンロード（無料）",
    proFeature1: "10以上の多言語（日本語、中国語、フランス語など）ロックを全面解除",
    proFeature2: "AI PRO 要約およびアクションアイテムエンジンのアンロック (BYOK)",
    proFeature3: "Google Gemini / OpenAI API 連携のサポート",
    proFeature4: "macOS Secure Keychain APIキー暗号化保管",
    proFeature5: "AI Executive 議事録および要約自動作成 (.mdエクスポート)",
    proFeature6: "生涯ソフトウェア・マイナー/メイジャーアップデート無償提供",
    proFeature7: "精密議事録：録音音声の再分析（Google Gemini 2.5 マルチモーダル）",
    btnFreeCta: "無料ダウンロード",
    btnProCta: "永久ライセンスを購入",
    footerDesc: "© 2026 PriSincera. All Rights Reserved. Sylphio is a registered product of PriSincera.",
    footerPrivacy: "Zero Data 個人情報保護方針",
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
    setPurchaseStatus(locale === 'ko' ? "App Store와 통신 중..." : locale === 'ja' ? "App Storeと通信中..." : "Communicating with App Store...");
    
    setTimeout(() => {
      setPurchaseStatus(locale === 'ko' ? "구매 성공! 감사합니다." : locale === 'ja' ? "購入成功！ありがとうございます。" : "Purchase successful! Thank you.");
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
        <div className="sylphio-core-container">
          <div className="sylphio-aurora-core"></div>
          <img src="/sylphio-icon.png?v=3" alt="Sylphio App Icon" className="sylphio-hero-icon-img" />
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
        </div>
      </section>
      
      <SylphioNav />
      
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
          <FeatureCard 
            icon="🖥️"
            title={d.f6Title}
            description={d.f6Desc}
          />
          <FeatureCard
            icon="🎧"
            title={d.f7Title}
            description={d.f7Desc}
          />
        </div>
      </section>
      
      {/* --- INTERACTIVE SIMULATOR SECTION --- */}
      <section className="sylphio-section">
        <div className="sylphio-section-header">
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
              {!isProUnlocked && <span className="btn-sim-pro-badge">✨ PRO</span>}
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
                  {isProUnlocked ? '✨ PRO' : 'FREE'}
                </span>
                <span className="badge-source">🎙️ {locale === 'ko' ? '내장 마이크' : locale === 'ja' ? '内蔵マイク' : 'Built-in Mic'}</span>
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
                          <span className="sylphio-cursor-pulse" style={{ color: '#10B981' }}>|</span>
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
            <div className="sylphio-mock-paywall-modal">
              <div className="paywall-close" onClick={() => setShowMockPaywall(false)}>✕</div>
              
              {showSuccessCheck ? (
                <div className="paywall-success-screen">
                  <div className="success-checkmark">✓</div>
                  <h3>{purchaseStatus}</h3>
                </div>
              ) : (
                <>
                  <div className="paywall-header">
                    <h2>✨ Sylphio Pro Lifetime ✨</h2>
                    <p>{locale === 'ko' ? "평생 소장 라이선스로 모든 기능을 무제한 해제하세요." : "Unlock everything permanently with a lifetime license."}</p>
                  </div>
                  
                  <div className="paywall-grid">
                    <div className="paywall-item">🔒 ➔ 🔓 12개 다국어 전면 해제</div>
                    <div className="paywall-item">🎨 자막 커스텀 그라데이션</div>
                    <div className="paywall-item">📊 AI 요약 정밀 회의록 기능</div>
                    <div className="paywall-item">⚙️ 고성능 AI 엔진 연동 (BYOK)</div>
                  </div>
                  
                  <button 
                    className="btn-paywall-purchase" 
                    onClick={handlePurchasePro} 
                    disabled={isPurchasing}
                  >
                    {isPurchasing ? (
                      <span className="spinner"></span>
                    ) : (
                      <span>Sylphio Pro Lifetime 평생 소장하기 ($9.99)</span>
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
              style={{ textAlign: 'center', justifyContent: 'center' }}
              id="btn-pricing-free"
            >
              {d.btnFreeCta}
            </a>
          </div>
          
          {/* Pro Lifetime Tier */}
          <div className="sylphio-pricing-card premium-card premium" style={{ position: 'relative', overflow: 'hidden' }}>
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
