import React from 'react';
import './SylphioPrivacy.css';

export default function SylphioPrivacy() {
  return (
    <div className="sylphio-privacy">
      <div className="sylphio-privacy-container">
        
        <div className="sylphio-privacy-header">
          <div className="sylphio-privacy-badge-zero">Zero Data Collection</div>
          <h1>Sylphio Privacy Policy</h1>
          <div className="sylphio-privacy-meta">Effective Date: 2026-06-01 (Planned)</div>
        </div>

        <div className="sylphio-privacy-intro">
          PriSincera ("we", "us", or "our") operates the <strong>Sylphio</strong> Mac application (the "Service"). We are committed to protecting your privacy. This policy explains our "Zero Data Collection" principle.
        </div>

        {/* --- English Version --- */}
        <section className="sylphio-privacy-section">
          <h2 className="sylphio-privacy-section-title-en">English Version</h2>
          
          <h3>1. Zero Data Collection</h3>
          <p>
            Sylphio is a utility application designed with privacy at its core. <strong>We do not collect, store, or transmit any personal data, audio recordings, or transcribed texts to our own servers.</strong>
          </p>

          <h3>2. Audio & Speech Processing</h3>
          <ul>
            <li>
              <strong>Local Mode (Apple Frameworks):</strong> If you use the built-in translation, all audio capture and speech-to-text processing occurs <strong>100% on-device</strong> using Apple's native frameworks (<code>SFSpeechRecognizer</code>). No audio leaves your Mac.
            </li>
            <li>
              <strong>Pro Mode (BYOK - Bring Your Own Key):</strong> If you provide your own API Key (e.g., OpenAI, Google Gemini), your audio is processed locally, and the necessary requests are sent <strong>directly from your device to the chosen third-party AI provider</strong>. PriSincera does not intercept, log, or have any access to your audio or the resulting translations. Please refer to the privacy policies of your chosen API providers regarding how they handle API requests.
            </li>
          </ul>

          <h3>3. API Key Security</h3>
          <p>
            Your personal API Keys are strictly stored locally on your device using Apple's encrypted <strong>Keychain</strong>. We do not sync, upload, or have access to your API Keys.
          </p>

          <h3>4. Third-Party Analytics</h3>
          <p>
            We do not embed any third-party tracking or analytics SDKs (like Google Analytics or Mixpanel) in the app. We solely rely on the anonymous crash reports and opt-in app usage data provided by Apple's standard App Store Analytics.
          </p>

          <h3>5. Contact Us</h3>
          <p>
            If you have any questions about this Privacy Policy, please contact us at: <strong>support@prisincera.com</strong>
          </p>
        </section>

        <hr className="sylphio-privacy-divider" />

        {/* --- Korean Version --- */}
        <section className="sylphio-privacy-section">
          <h2>한국어 버전 (Korean Version)</h2>
          
          <h3>1. 데이터 무수집 원칙 (Zero Data Collection)</h3>
          <p>
            Sylphio는 사용자의 프라이버시를 최우선으로 설계된 유틸리티 앱입니다. <strong>당사는 어떠한 개인 정보, 오디오 녹음 파일, 또는 번역된 텍스트 데이터도 당사의 서버로 수집, 저장, 전송하지 않습니다.</strong>
          </p>

          <h3>2. 오디오 및 음성 인식 처리</h3>
          <ul>
            <li>
              <strong>로컬 모드 (기본 제공):</strong> 기본 번역 모드를 사용할 경우, 화면의 오디오 캡처 및 음성 인식(STT)은 Apple의 내장 프레임워크(<code>SFSpeechRecognizer</code>)를 통해 <strong>100% 기기 내부(On-Device)에서 오프라인으로 처리</strong>됩니다. 어떠한 오디오 데이터도 사용자의 Mac 외부로 유출되지 않습니다.
            </li>
            <li>
              <strong>Pro 모드 (BYOK - 개인 API Key 연동):</strong> 사용자가 직접 발급받은 외부 AI의 API Key(OpenAI, Gemini 등)를 사용할 경우, 오디오 데이터는 <strong>사용자의 기기에서 해당 AI 제공업체의 서버로 직접(Directly) 전송</strong>됩니다. 개발사(PriSincera)는 이 과정에 일절 개입하지 않으며, 사용자의 오디오나 번역 결과물을 열람하거나 저장할 수 있는 권한 및 물리적 서버 자체가 존재하지 않습니다.
            </li>
          </ul>

          <h3>3. API Key 보안</h3>
          <p>
            사용자가 입력한 API Key는 Apple의 강력한 암호화 기술인 <strong>키체인(Keychain)을 통해 기기 내부에만 안전하게 저장</strong>됩니다. 당사는 사용자의 API Key를 서버로 수집하거나 외부로 유출하지 않습니다.
          </p>

          <h3>4. 분석 데이터</h3>
          <p>
            본 앱에는 어떠한 외부 추적 도구(Google Analytics 등)도 포함되어 있지 않습니다. 당사는 앱 품질 개선을 위해 사용자가 Apple 기기 설정에서 자발적으로 동의한 익명의 'App Store 크래시 리포트(충돌 로그)' 데이터만을 제한적으로 확인합니다.
          </p>

          <h3>5. 문의처</h3>
          <p>
            본 개인정보 처리방침과 관련하여 궁금한 점이 있으시면 언제든지 아래 이메일로 문의해 주시기 바랍니다.
            <br />
            <strong>support@prisincera.com</strong>
          </p>
        </section>

      </div>
    </div>
  );
}
