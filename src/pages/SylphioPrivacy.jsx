import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../contexts/LanguageContext';
import SylphioNav from '../components/layout/SylphioNav';
import './SylphioPrivacy.css';

// Local Multilingual Translation Dict for Privacy Policy
const TRANSLATIONS = {
  ko: {
    heroTitle: "Sylphio",
    heroTagline: "소리 없이 흐르는 지적인 통역 정령, Sylphio.\n화면의 모든 소리와 마이크를 실시간 캡처하여, 온디바이스에서 지체 없이 자막으로 구현합니다.\nGemini와 GPT의 강력한 다국어 지능을 Mac 네이티브 환경에서 완벽하게 경험해보세요.",
    heroCtaDownload: "📥 Mac App Store에서 무료 다운로드",
    heroCtaGuide: "💡 API Key 발급 가이드 보기",
    badge: "데이터 무수집 원칙",
    title: "실피오 개인정보 처리방침",
    meta: "시행 일자: 2026-06-01 (예정)",
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
          "Pro 모드 (BYOK - 개인 API Key 연동): 사용자가 직접 발급받은 외부 AI의 API Key(OpenAI, Gemini 등)를 사용할 경우, 오디오 데이터는 사용자의 기기에서 해당 AI 제공업체의 서버로 직접(Directly) 전송됩니다. 개발사(PriSincera)는 이 과정에 일절 개입하지 않으며, 사용자의 오디오나 번역 결과물을 열람하거나 저장할 수 있는 권한 및 물리적 서버 자체가 존재하지 않습니다."
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
    heroTagline: "Sylphio, the intelligent translation spirit in silence.\nCaptures screen audio and microphone input in real-time, instantly rendering subtitles on-device.\nExperience the powerful multilingual intelligence of Gemini and GPT flawlessly in a Mac native environment.",
    heroCtaDownload: "📥 Free Download on Mac App Store",
    heroCtaGuide: "💡 View API Key Integration Guide",
    badge: "Zero Data Collection",
    title: "Sylphio Privacy Policy",
    meta: "Effective Date: 2026-06-01 (Planned)",
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
          "Pro Mode (BYOK - Bring Your Own Key): If you provide your own API Key (e.g., OpenAI, Google Gemini), your audio is processed locally, and the necessary requests are sent directly from your device to the chosen third-party AI provider. PriSincera does not intercept, log, or have any access to your audio or the resulting translations."
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
    heroTagline: "静かに囁く知的な翻訳の精霊、Sylphio。\n画面のすべての音声とマイク入力をリアルタイムにキャプチャし、オンデバイスで遅延なく字幕としてレンダリングします。\nGeminiとGPTの強力な多言語知能を、Macのネイティブ環境で完璧に体験してください。",
    heroCtaDownload: "📥 Mac App Storeで無料ダウンロード",
    heroCtaGuide: "💡 APIキー連携ガイドを見る",
    badge: "データ無収集",
    title: "Sylphio 個人情報保護方針",
    meta: "施行日：2026-06-01 (予定)",
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
          "Proモード (BYOK - 個人APIキー連携): ユーザーが直接取得した外部AIのAPIキー（OpenAI、Geminiなど）を使用する場合、オーディオデータはユーザーのデバイスから該当AIプロバイダのサーバーに直接（Directly）送信されます。開発元（PriSincera）はこのプロセスに一切関与せず、ユーザーのオーディオや翻訳結果を閲覧・保存する権限および物理的サーバー自体が存在しません。"
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
