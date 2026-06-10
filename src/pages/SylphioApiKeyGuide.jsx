import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../contexts/LanguageContext';
import SylphioNav from '../components/layout/SylphioNav';
import './SylphioApiKeyGuide.css';

// Local Translation Dict for Premium UX
const TRANSLATIONS = {
  ko: {
    heroTitle: "Sylphio",
    heroTagline: "소리 없이 흐르는 지적인 통역 정령, Sylphio.\n화면의 모든 소리와 마이크를 실시간 캡처하여, 온디바이스에서 지체 없이 자막으로 구현합니다.\nGemini와 GPT의 강력한 다국어 지능을 Mac 네이티브 환경에서 완벽하게 경험해보세요.",
    heroCtaDownload: "📥 Mac App Store에서 무료 다운로드",
    heroCtaGuide: "💡 API Key 발급 가이드 보기",
    title: "Sylphio API Key 연동 가이드",
    subtitle: "개인용 AI API Key를 실피오에 연동하여 월 고정 구독료 없이 최고의 AI 실시간 번역 및 회의록 요약 기능을 한계 없이 누려보세요.",
    byokTitle: "BYOK (Bring Your Own Key) 아키텍처의 장점",
    byokDesc: "Sylphio는 사용자 개인이 소유한 API Key를 직접 입력하는 안전한 방식(BYOK)을 사용합니다. 수집된 모든 오디오와 번역 텍스트는 개발사의 중개 서버를 전혀 거치지 않고 오직 사용자의 로컬 환경과 AI 제공사의 보안 API 엔드포인트 간에만 다이렉트로 전송되며, 저장된 키는 macOS의 최고 보안 금고인 Secure Keychain(키체인)에 암호화 보존됩니다.",
    geminiTitle: "1. Google Gemini API Key 발급 프로세스 (무료 추천)",
    geminiIntro: "Google Gemini는 대단히 뛰어난 번역 텍스트 이해도와 더불어 압도적인 무료 혜택(Free Tier)을 제공하여 실피오 사용 장벽을 극적으로 낮춰 줍니다.",
    geminiStep1: "웹 브라우저를 열고 aistudio.google.com에 접속하여 개인 구글 계정으로 로그인합니다.",
    geminiStep2: "좌측 상단 사이드바 메뉴의 Get API key 버튼을 클릭합니다.",
    geminiStep3: "화면 중앙의 Create API key 버튼을 클릭한 뒤, 나타나는 팝업에서 Create API key in new project를 클릭하여 키를 생성합니다.",
    geminiStep4: "생성 완료 즉시 제공되는 복사 버튼을 눌러 AIzaSy...로 시작하는 고유 API Key 문자열을 메모장 등에 안전하게 복사하여 보관합니다.",
    geminiPriceHeader: "Gemini 요금제 및 무료 등급 가이드",
    geminiFreeTitle: "무료 버전 (Free Tier)",
    geminiFreeDesc: "비용: 100% 무료\n지원 한도: 1분당 15회 요청(15 RPM), 1일 1,500회 요청.\n실피오 번역은 1.5초 묵음 감지 시 단락마다 1회 요청하므로, 평범하게 대화 시 요금 결제 연동 없이도 실질적으로 무제한 무료 가동할 수 있습니다.",
    geminiPayTitle: "유료 버전 (Pay-as-you-go)",
    geminiPayDesc: "제한 없는 초고속 통역을 원할 경우 종량제를 선택 등록할 수 있습니다. 요금은 100만 토큰당 약 0.075달러(한화 약 100원) 수준으로 상상을 초월할 만큼 저렴합니다.",
    
    openaiTitle: "2. OpenAI API Key 발급 프로세스 (고성능 전문가용)",
    openaiIntro: "OpenAI의 GPT-4o-mini 엔진은 뛰어난 언어 스위칭 정확성과 대화 요약 능력을 보장하며, 고속 응답성에 특화되어 있습니다.",
    openaiWarningTitle: "OpenAI 필수 유의사항: 결제 크레딧 사전 충전 (Prerequisite)",
    openaiWarningDesc: "OpenAI는 구글과 달리 무료 체험용 Credit이 비어있을 경우, Key를 생성하여 연동하더라도 인식을 개시하자마자 번역 에러(Quota Exceeded)를 반환하며 작동하지 않습니다. 반드시 발급 전 최저 5달러($5)를 선충전해주셔야 작동합니다.",
    openaiStep1: "platform.openai.com에 접속하여 가입 후 로그인합니다.",
    openaiStep2: "좌측 내비게이션 바에서 열쇠 모양 아이콘인 API keys 메뉴를 선택합니다.",
    openaiStep3: "화면 우측 상단의 + Create new secret key 버튼을 클릭하고, 키의 이름을 입력한 뒤 생성합니다.",
    openaiStep4: "생성된 sk-proj-... 비밀 키를 즉시 복사하여 보관합니다. (창을 닫은 후에는 키를 다시 확인할 수 없습니다.)",
    openaiStep5: "좌측 메뉴의 Settings > Billing으로 이동해 Add to balance를 클릭하여 최소 5달러의 해외결제 크레딧을 사전 결제 충전합니다.",
    openaiPriceHeader: "OpenAI (GPT-4o-mini) 요금제 정보",
    openaiPriceDesc: "- 입력 토큰당 비용: $0.150 / 1M tokens (100만 토큰당 약 200원)\n- 출력 토큰당 비용: $0.600 / 1M tokens (100만 토큰당 약 800원)\n- 실시간 자막 통역 세션을 한 시간 내내 쉬지 않고 가동하더라도 실제 소비되는 충전액은 약 5원 ~ 10원 미만 수준으로 대단히 저렴합니다.",
    
    appSetupTitle: "3. Sylphio 앱 내 API Key 최종 연동 가이드",
    appStep1: "macOS에 단독 설치된 Sylphio.app을 기동합니다.",
    appStep2: "대기 화면 우측 상단의 설정 기어 버튼(⚙️)을 클릭하여 환경설정 창을 엽니다.",
    appStep3: "좌측 탭 메뉴에서 AI 엔진 (BYOK)을 선택합니다.",
    appStep4: "AI PRO 실시간 통역 엔진 활성화 스위치를 ON(켬) 상태로 전환합니다.",
    appStep5: "유저가 선호하는 AI 엔진 플랫폼(Google Gemini 또는 OpenAI)을 선택합니다.",
    appStep6: "복사해 두었던 API Key 문자열을 붙여넣기(CMD + V) 합니다.",
    appStep7: "API Key 연동 성공 및 활성화 표시를 확인한 뒤 설정창을 닫으면 다국어 자동 감지 및 실시간 번역 통역 기능의 잠금이 해제되어 완벽 가동됩니다!",
    
    faqHeader: "🚨 긴급 장애 극복 및 트러블슈팅 (Troubleshooting)",
    faq1Q: "Q1. \"설정 ⚙️에서 AI 번역을 활성화하세요\" 또는 \"번역 에러\" 가 계속 발생합니다.",
    faq1A: "- 원인: 입력하신 API Key 내부에 불필요한 공백 문자나 줄바꿈(\\n)이 섞여 들어갔거나, 키 자체가 유효하지 않을 때 발생합니다.\n- 해결법: 키 입력란을 완전히 비운 후, 메모장에 키를 붙여넣어 공백이 없는지 확인하고 다시 복사하여 깨끗하게 입력해 주십시오.",
    faq2Q: "Q2. OpenAI Key를 넣었는데 계속 \"Quota Exceeded\" 에러가 뜹니다.",
    faq2A: "- 원인: 사용 중인 OpenAI 플랫폼 계정에 사전 충전된 Balance(달러 크레딧)가 0인 상태이거나, 등록했던 카드 결제 정보가 만료되어 계정이 일시 잠금 상태일 때 발생합니다.\n- 해결법: platform.openai.com으로 이동하셔서 충전 잔액이 남아 있는지 재차 확인하시고 최소 5달러를 결제/충전해 두셔야 정상 가동됩니다."
  },
  en: {
    heroTitle: "Sylphio",
    heroTagline: "Sylphio, the intelligent translation spirit in silence.\nCaptures screen audio and microphone input in real-time, instantly rendering subtitles on-device.\nExperience the powerful multilingual intelligence of Gemini and GPT flawlessly in a Mac native environment.",
    heroCtaDownload: "📥 Free Download on Mac App Store",
    heroCtaGuide: "💡 View API Key Integration Guide",
    title: "Sylphio API Key Integration Guide",
    subtitle: "Integrate your personal AI API Key with Sylphio to enjoy the ultimate AI real-time translation and minutes summary features without limits and without monthly subscription fees.",
    byokTitle: "Advantages of BYOK (Bring Your Own Key) Architecture",
    byokDesc: "Sylphio uses a secure BYOK approach where users input their own API Keys. All audio and translated text bypass developer servers entirely and flow directly between your local device and the AI provider's secure endpoint. Saved keys are kept fully encrypted inside macOS's highest vault, Secure Keychain.",
    geminiTitle: "1. Google Gemini API Key Issuance Process (Recommended / Free)",
    geminiIntro: "Google Gemini delivers exceptional comprehension and translation accuracy, combined with an incredibly generous Free Tier that lowers the barrier to using Sylphio to zero.",
    geminiStep1: "Open a browser, go to aistudio.google.com, and log in with your Google account.",
    geminiStep2: "Click the Get API key button in the top left sidebar menu.",
    geminiStep3: "Click Create API key in the center, and choose Create API key in new project in the popup to generate your key.",
    geminiStep4: "Instantly copy the unique key string (starting with AIzaSy...) using the provided button and save it securely.",
    geminiPriceHeader: "Gemini Pricing & Free Tier Guide",
    geminiFreeTitle: "Free Tier",
    geminiFreeDesc: "Cost: 100% Free\nLimits: 15 Requests per Minute (RPM), 1,500 requests per day.\nSince Sylphio requests a translation only after sensing 1.5s of silence, you can practically use it for free limitlessly in standard daily conversations.",
    geminiPayTitle: "Pay-as-you-go Tier",
    geminiPayDesc: "If you desire limitless high-speed translation, you can opt to register billing. The cost is incredibly low at approximately $0.075 per 1 million input tokens (around 100 KRW).",
    
    openaiTitle: "2. OpenAI API Key Issuance Process (Pro & High-Performance)",
    openaiIntro: "OpenAI's GPT-4o-mini engine ensures brilliant language switching accuracy, swift response times, and exceptional conversation summary capabilities.",
    openaiWarningTitle: "Prerequisite: Pre-charge Billing Balance",
    openaiWarningDesc: "Unlike Google, OpenAI keys will return a quota error immediately if your account balance is $0, even if the key itself is successfully generated. You must pre-charge at least $5 to activate API operations.",
    openaiStep1: "Visit platform.openai.com, register, and log in.",
    openaiStep2: "Select the key-shaped API keys menu in the left navigation bar.",
    openaiStep3: "Click + Create new secret key in the top right, name the key, and generate it.",
    openaiStep4: "Copy the sk-proj-... secret key immediately. (It cannot be viewed again once you close the popup.)",
    openaiStep5: "Navigate to Settings > Billing on the left menu, click Add to balance, and pre-charge at least $5.",
    openaiPriceHeader: "OpenAI (GPT-4o-mini) Pricing Info",
    openaiPriceDesc: "- Input cost: $0.150 / 1M tokens\n- Output cost: $0.600 / 1M tokens\n- Even if you run a live translation session for a full hour, the actual consumption is extremely cheap at around $0.005 to $0.01.",
    
    appSetupTitle: "3. How to Integrate API Key Inside Sylphio App",
    appStep1: "Launch Sylphio.app on your Mac.",
    appStep2: "Click the Settings gear icon (⚙️) in the top-right of the standby screen.",
    appStep3: "Select the AI Engine tab in the left-side settings menu.",
    appStep4: "Turn the Activate AI PRO Real-Time Translation Switch to ON.",
    appStep5: "Choose your preferred AI platform (Google Gemini or OpenAI).",
    appStep6: "Paste (CMD + V) your copied API Key string into the field.",
    appStep7: "Verify the key activation display. Once done, close settings to unlock real-time translation and multi-language auto-detection immediately!",
    
    faqHeader: "🚨 Troubleshooting & Emergency FAQ",
    faq1Q: "Q1. It keeps showing \"Activate AI Translation in Settings ⚙️\" or \"Translation Error.\"",
    faq1A: "- Cause: Unwanted whitespace, trailing newlines (\\n), or an invalid character is mixed into your API Key input.\n- Solution: Completely clear the input box, paste your key into a plain text editor to make sure there are no spaces, and copy-paste it cleanly again.",
    faq2Q: "Q2. I connected my OpenAI key, but it keeps returning a \"Quota Exceeded\" error.",
    faq2A: "- Cause: Your OpenAI API account balance is $0, or your registered card billing information has expired, causing a temporary account hold.\n- Solution: Go to platform.openai.com, check your balance, and pre-charge a minimum of $5 to restore service."
  },
  ja: {
    heroTitle: "Sylphio",
    heroTagline: "静かに囁く知的な翻訳の精霊、Sylphio。\n画面のすべての音声とマイク入力をリアルタイムにキャプチャし、オンデバイスで遅延なく字幕としてレンダリングします。\nGeminiとGPTの強力な多言語知能を、Macのネイティブ環境で完璧に体験してください。",
    heroCtaDownload: "📥 Mac App Storeで無料ダウンロード",
    heroCtaGuide: "💡 APIキー連携ガイドを見る",
    title: "Sylphio APIキー連携ガイド",
    subtitle: "個人用のAI APIキーをSylphioに連携し、月々の定額サブスク料金なしで、最高精度のリアルタイム翻訳と議事録要約を制限なく体験してください。",
    byokTitle: "BYOK (Bring Your Own Key) アーキテクチャのメリット",
    byokDesc: "Sylphioは、ユーザーが所有するAPIキーを直接入力する安全な方式（BYOK）を採用しています。録音音声や翻訳テキストは開発元のサーバーを一切仲介せず、ローカル端末とAIプロバイダのセキュアなエンドポイント間で直接通信されます。保存されたキーは、macOSの最高セキュリティストレージであるSecure Keychain（キーチェーン）に暗号化されて安全に保護されます。",
    geminiTitle: "1. Google Gemini APIキー発行プロセス (推奨・無料)",
    geminiIntro: "Google Geminiは、驚異的な翻訳理解力に加え、非常に強力な無料枠（Free Tier）を提供しており、Sylphioの 導入障壁をゼロに抑えることができます。",
    geminiStep1: "ブラウザを開き、aistudio.google.comにアクセスしてGoogleアカウントでログインします。",
    geminiStep2: "左側のサイドバーメニューにある Get API key ボタンをクリックします。",
    geminiStep3: "画面中央の Create API key ボタンをクリックし、ポップアップで Create API key in new project を選択してキーを生成します。",
    geminiStep4: "生成された固有のキー文字列（AIzaSy...で始まる）をコピーし、安全に保管してください。",
    geminiPriceHeader: "Gemini 料金プラン＆無料枠ガイド",
    geminiFreeTitle: "無料枠 (Free Tier)",
    geminiFreeDesc: "料金：100% 無料\n制限：1分あたり15回のリクエスト (15 RPM), 1日あたり1,500回のリクエスト。\nSylphioは1.5秒の無音検知後にリクエストを送信するため、通常の会話であれば実質的に完全無料で無制限に利用可能です。",
    geminiPayTitle: "従量課金プラン (Pay-as-you-go)",
    geminiPayDesc: "制限のない超高速通訳が必要な場合、課金登録が可能です。料金は100万トークンあたり約0.075ドル（約10円）と、圧倒的にリーズナブルです。",
    
    openaiTitle: "2. OpenAI APIキー発行プロセス (プロ・高精度向け)",
    openaiIntro: "OpenAIの GPT-4o-mini エンジンは、高度な言語切り替え精度、高速応答、優れた会話要約力を備えています。",
    openaiWarningTitle: "必須事項：クレジットの事前チャージ（残高チャージ）",
    openaiWarningDesc: "OpenAIはGoogleとは異なり、アカウント残高が$0の場合、キー自体が生成されていても通信時にエラー（Quota Exceeded）を返します。利用前に必ず最低5ドル（$5）を事前チャージしてください。",
    openaiStep1: "platform.openai.com にアクセスし、登録およびログインします。",
    openaiStep2: "左メニューにある鍵アイコンの API keys を選択します。",
    openaiStep3: "右上の + Create new secret key ボタンをクリックし、キーに名前をつけて生成します。",
    openaiStep4: "生成された sk-proj-... キーを即座にコピーします。（ポップアップを閉じると二度と確認できません。）",
    openaiStep5: "左メニューの Settings > Billing に移動し、Add to balance をクリックして最低5ドルをチャージします。",
    openaiPriceHeader: "OpenAI (GPT-4o-mini) 料金情報",
    openaiPriceDesc: "- 入力料金: $0.150 / 1M tokens\n- 出力料金: $0.600 / 1M tokens\n- リアルタイム通訳セッションを丸1時間フルで稼働させても、実際の消費額はわずか数円〜十数円程度と非常に安価です。",
    
    appSetupTitle: "3. SylphioアプリへのAPIキー設定手順",
    appStep1: "Mac上の Sylphio.app を起動します。",
    appStep2: "待機画面の右上にある設定歯車アイコン（⚙️）をクリックして環境設定を開きます。",
    appStep3: "左メニューの AI Engine タブを選択します。",
    appStep4: "AI PRO リアルタイム翻訳エンジンの有効化スイッチを ON に切り替えます。",
    appStep5: "使用するAIプラットフォーム（Google Gemini または OpenAI）を選択します。",
    appStep6: "コピーしたAPIキー文字列を入力欄に貼り付け（CMD + V）します。",
    appStep7: "連携成功のマークを確認し、設定画面を閉じれば、リアルタイム通訳と自動多言語検知が即座に起動します！",
    
    faqHeader: "🚨 トラブルシューティング＆緊急FAQ",
    faq1Q: "Q1. 「設定 ⚙️でAI翻訳を有効にしてください」または「翻訳エラー」が続きます。",
    faq1A: "- 原因：入力されたAPIキーに不要な空白スペースや改行（\\n）が含まれているか、キー自体が無効な場合に発生します。\n- 解決策：入力欄を一度完全に空にし、メモ帳等でスペースがないことを確認してから、きれいに再度コピー＆ペーストしてください。",
    faq2Q: "Q2. OpenAIキーを連携したのに「Quota Exceeded」エラーが解消されません。",
    faq2A: "- 原因：OpenAIのAPIアカウント残高が$0であるか、登録クレジットカードが失効してアカウントが一時停止している可能性があります。\n- 解決策：platform.openai.com にてチャージ残高を確認し、最低5ドルを事前チャージしてください。"
  }
};

export default function SylphioApiKeyGuide() {
  const { locale, t } = useTranslation();
  const d = TRANSLATIONS[locale] || TRANSLATIONS['ko'];
  


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
  
  return (
    <div className="sylphio-guide">
      {/* 2Depth LNB 상단 공통 히어로 영역 */}
      <section className="sylphio-hero">
        <div className="sylphio-core-container">
          <div className="sylphio-aurora-core"></div>
          <div className="sylphio-aurora-ring"></div>
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

      <div className="sylphio-guide-container">

        <div className="sylphio-guide-byok-note">
          <div className="sylphio-guide-byok-icon">🛡️</div>
          <div className="sylphio-guide-byok-content">
            <h4>{d.byokTitle}</h4>
            <p>{d.byokDesc}</p>
          </div>
        </div>

        {/* --- PART 1: Google Gemini --- */}
        <section className="sylphio-guide-section">
          <div className="sylphio-guide-section-title">
            <span className="sylphio-guide-section-badge gemini-badge">Highly Recommended</span>
            <h2>{d.geminiTitle}</h2>
          </div>
          <p style={{ color: '#94a3b8', lineHeight: '1.6', marginBottom: '24px' }}>
            {d.geminiIntro}
          </p>

          <ol className="sylphio-guide-steps">
            <li className="sylphio-guide-step-item">
              <span className="sylphio-guide-step-number">1</span>
              <span className="sylphio-guide-step-text">
                {locale === 'ko' ? (
                  <>
                    웹 브라우저를 열고 <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" className="sylphio-guide-step-link">Google AI Studio (aistudio.google.com)</a>에 접속하여 개인 구글 계정으로 로그인합니다.
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
                <h5>{d.geminiFreeTitle}</h5>
                <p style={{ whiteSpace: 'pre-line' }}>{d.geminiFreeDesc}</p>
              </div>
              <div className="sylphio-guide-pricing-item pay">
                <h5>{d.geminiPayTitle}</h5>
                <p>{d.geminiPayDesc}</p>
              </div>
            </div>
          </div>
        </section>

        {/* --- PART 2: OpenAI --- */}
        <section className="sylphio-guide-section">
          <div className="sylphio-guide-section-title">
            <span className="sylphio-guide-section-badge openai-badge">Pro Specialist</span>
            <h2>{d.openaiTitle}</h2>
          </div>
          <p style={{ color: '#94a3b8', lineHeight: '1.6', marginBottom: '24px' }}>
            {d.openaiIntro}
          </p>

          <div className="sylphio-guide-warning-box">
            <span className="sylphio-guide-warning-icon">⚠️</span>
            <div className="sylphio-guide-warning-content">
              <h5>{d.openaiWarningTitle}</h5>
              <p>{d.openaiWarningDesc}</p>
            </div>
          </div>

          <ol className="sylphio-guide-steps">
            <li className="sylphio-guide-step-item">
              <span className="sylphio-guide-step-number">1</span>
              <span className="sylphio-guide-step-text">
                {locale === 'ko' ? (
                  <>
                    <a href="https://platform.openai.com/" target="_blank" rel="noreferrer" className="sylphio-guide-step-link">OpenAI API Platform (platform.openai.com)</a>에 접속하여 가입 후 로그인합니다.
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
            <div className="sylphio-guide-pricing-item" style={{ background: 'none', border: 'none', padding: 0 }}>
              <p style={{ whiteSpace: 'pre-line' }}>{d.openaiPriceDesc}</p>
            </div>
          </div>
        </section>

        {/* --- PART 3: App Integration --- */}
        <section className="sylphio-guide-section">
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
        <section className="sylphio-guide-faq">
          <h3>{d.faqHeader}</h3>
          
          <div className="sylphio-guide-faq-item">
            <h5>{d.faq1Q}</h5>
            <p style={{ whiteSpace: 'pre-line' }}>{d.faq1A}</p>
          </div>

          <div className="sylphio-guide-faq-item">
            <h5>{d.faq2Q}</h5>
            <p style={{ whiteSpace: 'pre-line' }}>{d.faq2A}</p>
          </div>
        </section>

      </div>
    </div>
  );
}
