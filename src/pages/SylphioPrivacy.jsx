import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../contexts/LanguageContext';
import SylphioNav from '../components/layout/SylphioNav';
import './SylphioPrivacy.css';

// Local Multilingual Translation Dict for Privacy Policy
const TRANSLATIONS = {
  ko: {
    heroTitle: "Sylphio",
    heroTagline: "소리 없이 흐르는 지적인 통역 정령, Sylphio.\n화면의 모든 소리와 마이크를 실시간 캡처하여, 온디바이스에서 지체 없이 자막으로 구현합니다.\n회의 요약과 정밀 회의록을 Gemini·GPT 등 최상위 AI 엔진으로 강화하세요 (BYOK). 실시간 자막은 무료·온디바이스로 동작합니다.",
    heroCtaDownload: "📥 Mac App Store에서 무료 다운로드",
    heroCtaGuide: "💡 API Key 발급 가이드 보기",
    badge: "데이터 무수집 원칙",
    title: "실피오 개인정보 처리방침",
    meta: "시행 일자: 2026-07-05 (개정)",
    intro: "PriSincera(이하 '당사')는 Sylphio Mac 애플리케이션(이하 '서비스')을 운영합니다. 당사는 사용자의 개인정보를 소중히 보호하며, 본 방침은 당사의 핵심 철학인 '데이터 무수집(Zero Data Collection)' 원칙을 설명합니다.",
    
    sections: [
      {
        title: "1. 데이터 무수집 원칙 (Zero Data Collection)",
        content: "Sylphio는 사용자의 프라이버시를 최우선으로 설계된 유틸리티 앱입니다. 당사는 어떠한 개인 정보, 오디오 녹음 파일, 또는 번역된 텍스트 데이터도 당사의 서버로 수집, 저장, 전송하지 않습니다."
      },
      {
        title: "2. 오디오 및 음성 인식 처리",
        bullets: [
          "로컬 모드 (기본 제공): 기본 번역 모드를 사용할 경우, 화면의 오디오 캡처 및 음성 인식(STT)은 Apple의 내장 프레임워크(SFSpeechRecognizer)를 통해 처리됩니다. 음성 데이터는 Apple의 보안 음성 인식 정책에 따라 기기 내부(On-Device) 또는 Apple 보안 서버를 거쳐 안전하고 익명으로 처리되며, 개발사(PriSincera)는 어떠한 데이터도 수집하지 않습니다.",
          "Pro 모드 (BYOK - 개인 API Key 연동): 사용자가 직접 발급받은 외부 AI(Google Gemini, OpenAI 등)의 API Key를 사용할 경우, ① 실시간 자막 번역은 음성 인식된 텍스트만 해당 AI 제공업체 서버로 전송되며, ② '정밀 회의록' 기능을 실행하면 세션 종료 후 녹음된 오디오 파일(.m4a) 자체가 사용자의 기기에서 해당 AI 제공업체(예: Google Gemini) 서버로 직접(Directly) 업로드되어 전사·요약에 사용됩니다. 모든 전송은 개발사(PriSincera) 중개 서버를 거치지 않는 사용자↔제공업체 직접 통신이며, 전송 여부와 시점은 전적으로 사용자의 기능 사용 선택에 따릅니다. 개발사는 이 과정에 일절 개입하지 않으며 사용자의 데이터를 열람·저장할 수 있는 물리적 서버 자체가 존재하지 않습니다.",
          "회의 음성 녹음 및 로컬 저장: 자막·회의록·정밀 회의록 기능을 위해 세션 중 오디오가 기기 내부에 .m4a(AAC) 파일로 녹음·저장됩니다. 녹음은 사전 동의(녹음 전 동의 모달) 후에만 시작되고 진행 중 '● 녹음 중' 인디케이터가 표시되며, 저장 위치는 앱 샌드박스 컨테이너 내부입니다. 사용자는 '대화 기록'에서 언제든 개별 녹음을 삭제할 수 있고, 시스템 사운드 캡처에는 macOS 화면 녹화 권한(ScreenCaptureKit)이 사용됩니다. 이 녹음 파일은 사용자가 정밀 회의록을 실행하지 않는 한 외부로 전송되지 않고 기기에만 보관됩니다."
        ]
      },
      {
        title: "3. API Key 보안",
        content: "사용자가 입력한 API Key는 Apple의 강력한 암호화 기술인 키체인(Keychain)을 통해 기기 내부에만 안전하게 저장됩니다. 당사는 사용자의 API Key를 서버로 수집하거나 외부로 유출하지 않습니다."
      },
      {
        title: "4. 분석 데이터",
        content: "본 앱에는 어떠한 외부 추적 도구(Google Analytics 등)도 포함되어 있지 않습니다. 당사는 앱 품질 개선을 위해 사용자가 Apple 기기 설정에서 자발적으로 동의한 익명의 'App Store 크래시 리포트(충돌 로그)' 데이터만을 제한적으로 확인합니다."
      },
      {
        title: "5. 문의처",
        content: "본 개인정보 처리방침과 관련하여 궁금한 점이 있으시면 언제든지 아래 이메일로 문의해 주시기 바랍니다.\n이메일: support@prisincera.com"
      }
    ]
  },
  en: {
    heroTitle: "Sylphio",
    heroTagline: "Sylphio, the intelligent translation spirit in silence.\nCaptures screen audio and microphone input in real-time, instantly rendering subtitles on-device.\nSupercharge your summaries and precise minutes with top-tier AI engines like Gemini and GPT (BYOK). Real-time subtitles run free, on-device.",
    heroCtaDownload: "📥 Free Download on Mac App Store",
    heroCtaGuide: "💡 View API Key Integration Guide",
    badge: "Zero Data Collection",
    title: "Sylphio Privacy Policy",
    meta: "Effective Date: 2026-07-05 (Revised)",
    intro: "PriSincera ('we', 'us', or 'our') operates the Sylphio Mac application (the 'Service'). We are committed to protecting your privacy. This policy explains our 'Zero Data Collection' principle.",
    
    sections: [
      {
        title: "1. Zero Data Collection",
        content: "Sylphio is a utility application designed with privacy at its core. We do not collect, store, or transmit any personal data, audio recordings, or transcribed texts to our own servers."
      },
      {
        title: "2. Audio & Speech Processing",
        bullets: [
          "Local Mode (Apple Frameworks): If you use the built-in translation, all audio capture and speech-to-text processing occurs via Apple's native framework (SFSpeechRecognizer). Audio data is processed safely and anonymously on-device or via Apple's secure servers in accordance with Apple's secure speech recognition policy, and the developer (PriSincera) does not collect any data.",
          "Pro Mode (BYOK - Bring Your Own Key): If you provide your own API Key (e.g., Google Gemini, OpenAI), (1) real-time subtitle translation sends only the recognized text to the AI provider, and (2) when you run the 'Enhanced Minutes' feature, the recorded audio file (.m4a) itself is uploaded directly from your device to the chosen provider (e.g., Google Gemini) after the session for transcription and summary. All transmissions are direct device-to-provider communication that never passes through PriSincera servers, and whether/when data is sent depends entirely on which features you choose to use. PriSincera does not intercept or store your data and operates no server capable of accessing it.",
          "Meeting audio recording & local storage: To power subtitles, minutes, and Enhanced Minutes, audio is recorded and saved on your device as an .m4a (AAC) file during a session. Recording starts only after your explicit consent (a pre-recording consent modal) and shows a '● Recording' indicator while active; files are stored inside the app's sandbox container. You can delete any recording anytime from 'History', and system-sound capture uses the macOS screen-recording permission (ScreenCaptureKit). These recordings remain solely on your device and are never transmitted unless you run Enhanced Minutes."
        ]
      },
      {
        title: "3. API Key Security",
        content: "Your personal API Keys are strictly stored locally on your device using Apple's encrypted Keychain. We do not sync, upload, or have access to your API Keys."
      },
      {
        title: "4. Third-Party Analytics",
        content: "We do not embed any third-party tracking or analytics SDKs (like Google Analytics or Mixpanel) in the app. We solely rely on the anonymous crash reports and opt-in app usage data provided by Apple's standard App Store Analytics."
      },
      {
        title: "5. Contact Us",
        content: "If you have any questions about this Privacy Policy, please contact us at:\nEmail: support@prisincera.com"
      }
    ]
  },
  ja: {
    heroTitle: "Sylphio",
    heroTagline: "静かに囁く知的な翻訳の精霊、Sylphio。\n画面のすべての音声とマイク入力をリアルタイムにキャプチャし、オンデバイスで遅延なく字幕としてレンダリングします。\n会議要約と精密議事録を、Gemini・GPTなど最上位のAIエンジンで強化（BYOK）。リアルタイム字幕は無料・オンデバイスで動作します。",
    heroCtaDownload: "📥 Mac App Storeで無料ダウンロード",
    heroCtaGuide: "💡 APIキー連携ガイドを見る",
    badge: "データ無収集",
    title: "Sylphio 個人情報保護方針",
    meta: "施行日：2026-07-05 (改定)",
    intro: "PriSincera（以下「当社」）は、Sylphio Macアプリケーション（以下「サービス」）を運営しています。当社はユーザーのプライバシーを最優先に保護し、本方針では当社の核心である「データ無収集（Zero Data Collection）」原則について説明します。",
    
    sections: [
      {
        title: "1. データ無収集原則 (Zero Data Collection)",
        content: "Sylphioは、ユーザーのプライバシーを最優先に設計されたユーティリティアプリです。当社は、いかなる個人情報、オーディオ録音ファイル、または翻訳されたテキストデータも、当社のサーバーに収集、保存、または送信しません。"
      },
      {
        title: "2. オーディオおよび音声認識処理",
        bullets: [
          "ローカルモード (基本提供): 基本翻訳モードを使用する場合、画面のオーディオキャプチャおよび音声認識（STT）は、Appleの内蔵フレームワーク（SFSpeechRecognizer）を通じて処理されます。音声データは、Appleの安全な音声認識ポリシーに従ってデバイス内部（On-Device）またはAppleの安全なサーバーを経由して安全かつ匿名で処理され、開発元（PriSincera）はいかなるデータも収集しません。",
          "Proモード (BYOK - 個人APIキー連携): ユーザーが取得した外部AI（Google Gemini、OpenAIなど）のAPIキーを使用する場合、①リアルタイム字幕翻訳は音声認識されたテキストのみをAIプロバイダへ送信し、②「精密議事録」機能を実行すると、セッション終了後に録音した音声ファイル（.m4a）自体がユーザーのデバイスから該当プロバイダ（例：Google Gemini）へ直接（Directly）アップロードされ、文字起こし・要約に使用されます。すべての送信は開発元（PriSincera）の中継サーバーを経由しないデバイス↔プロバイダ直接通信であり、送信の有無とタイミングは完全にユーザーの機能利用の選択に依存します。開発元はこのプロセスに一切関与せず、ユーザーのデータを閲覧・保存できる物理的サーバー自体を保有しません。",
          "会議音声の録音とローカル保存: 字幕・議事録・精密議事録機能のため、セッション中の音声は端末内に.m4a（AAC）ファイルとして録音・保存されます。録音は事前同意（録音前の同意モーダル）の後にのみ開始され、実行中は「● 録音中」インジケーターが表示されます。保存先はアプリのサンドボックスコンテナ内で、ユーザーは「履歴」からいつでも個別の録音を削除できます。システムサウンド収集にはmacOSの画面収録権限（ScreenCaptureKit）を使用します。これらの録音は精密議事録を実行しない限り外部へ送信されず、端末内にのみ保管されます。"
        ]
      },
      {
        title: "3. APIキーのセキュリティ",
        content: "ユーザーが入力したAPIキーは、Appleの強力な暗号化技術であるキーチェーン（Keychain）を通じてデバイス内部にのみ安全に保存されます。当社はユーザーのAPIキーをサーバーに収集したり、外部に漏洩したりすることはありません。"
      },
      {
        title: "4. 分析データについて",
        content: "本アプリには、外部の追跡ツール（Google Analyticsなど）は一切含まれていません。当社は、アプリの品質改善のために、ユーザーがAppleデバイスの設定で自発的に同意した匿名のアドホック「App Storeクラッシュレポート（クラッシュログ）」データのみを限定的に確認します。"
      },
      {
        title: "5. お問い合わせ",
        content: "本個人情報保護方針に関してご不明な点がございましたら、いつでも下記メールアドレスまでお問い合わせください。\nメールアドレス: support@prisincera.com"
      }
    ]
  }
};

export default function SylphioPrivacy() {
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
    <div className="sylphio-privacy">
      {/* 2Depth LNB 상단 공통 히어로 영역 */}
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

      <div className="sylphio-privacy-container">

        <div className="sylphio-privacy-intro">
          {d.intro}
        </div>

        {d.sections.map((section, idx) => (
          <section className="sylphio-privacy-section" key={idx}>
            <h2>{section.title}</h2>
            {section.content && (
              <p style={{ whiteSpace: 'pre-line' }}>{section.content}</p>
            )}
            {section.bullets && (
              <ul>
                {section.bullets.map((bullet, bIdx) => (
                  <li key={bIdx} style={{ whiteSpace: 'pre-line' }}>{bullet}</li>
                ))}
              </ul>
            )}
            {idx < d.sections.length - 1 && <hr className="sylphio-privacy-divider" />}
          </section>
        ))}

      </div>
    </div>
  );
}
