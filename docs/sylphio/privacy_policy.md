---
status: active
domain: Sylphio
last_updated: 2026-07-13
version: v1.1
target_files:
  - src/pages/SylphioPrivacy.jsx
---

# 📜 Sylphio 개인정보 처리방침 (Privacy)

## 📝 Revision History

| Version | Date | Author | Description | Impact Area |
| :--- | :--- | :--- | :--- | :--- |
| v1.0 | 2026-06-02 | Maker | 실피오 App Store 심사 및 신뢰 보장을 위한 Zero-Data 개인정보 처리방침 정의 | docs/sylphio/ |
| v1.1 | 2026-07-13 | AI Agent | 하이브리드 STT·정밀 회의록 오디오 업로드·로컬 녹음(.m4a) 저장/동의/삭제·화면 녹화 권한 고지 반영(라이브 정합) | src/pages/SylphioPrivacy.jsx |

---

**Effective Date:** 2026-07-05 (개정)

PriSincera ("we", "us", or "our") operates the **Sylphio** Mac application (the "Service"). We are committed to protecting your privacy. This policy explains our "Zero Data Collection" principle.

---

## 🇺🇸 English Version

### 1. Zero Data Collection
Sylphio is a utility application designed with privacy at its core. **We do not collect, store, or transmit any personal data, audio recordings, or transcribed texts to our own servers.**

### 2. Audio & Speech Processing
* **Local Mode (Apple Frameworks):** If you use the built-in translation, audio capture and speech-to-text run through Apple's native framework (`SFSpeechRecognizer`). Speech is processed on-device or, when a local language pack is unavailable, via Apple's secure servers per Apple's speech-recognition policy. PriSincera collects none of this data.
* **Pro Mode (BYOK - Bring Your Own Key):** If you provide your own API Key (e.g., Google Gemini, OpenAI), (1) real-time subtitle translation sends only the recognized text to the AI provider, and (2) when you run the **Enhanced Minutes** feature, the recorded audio file (.m4a) itself is uploaded directly from your device to the chosen provider (e.g., Google Gemini) after the session for transcription and summary. All transmissions are direct device-to-provider communication that never passes through PriSincera servers. Please refer to your chosen provider's privacy policy.
* **Meeting audio recording & local storage:** To power subtitles, minutes, and Enhanced Minutes, audio is recorded and saved on your device as an .m4a (AAC) file during a session. Recording starts only after your explicit consent and shows a "● Recording" indicator; files are stored inside the app's sandbox container and can be deleted anytime from History. System-sound capture uses the macOS screen-recording permission (ScreenCaptureKit). Recordings never leave your device unless you run Enhanced Minutes.

### 3. API Key Security
Your personal API Keys are strictly stored locally on your device using Apple's encrypted **Keychain**. We do not sync, upload, or have access to your API Keys.

### 4. Third-Party Analytics
We do not embed any third-party tracking or analytics SDKs (like Google Analytics or Mixpanel) in the app. We solely rely on the anonymous crash reports and opt-in app usage data provided by Apple's standard App Store Analytics.

### 5. Contact Us
If you have any questions about this Privacy Policy, please contact us at: **support@prisincera.com**

---

## 🇰🇷 한국어 버전 (Korean Version)

### 1. 데이터 무수집 원칙 (Zero Data Collection)
Sylphio는 사용자의 프라이버시를 최우선으로 설계된 유틸리티 앱입니다. **당사는 어떠한 개인 정보, 오디오 녹음 파일, 또는 번역된 텍스트 데이터도 당사의 서버로 수집, 저장, 전송하지 않습니다.**

### 2. 오디오 및 음성 인식 처리
* **로컬 모드 (기본 제공):** 기본 번역 모드를 사용할 경우, 화면의 오디오 캡처 및 음성 인식(STT)은 Apple의 내장 프레임워크(`SFSpeechRecognizer`)를 통해 처리됩니다. 음성 데이터는 Apple의 보안 음성 인식 정책에 따라 기기 내부(On-Device) 또는 로컬 언어팩이 없는 경우 Apple 보안 서버를 거쳐 처리되며, 개발사(PriSincera)는 어떠한 데이터도 수집하지 않습니다.
* **Pro 모드 (BYOK - 개인 API Key 연동):** 사용자가 직접 발급받은 외부 AI(Google Gemini, OpenAI 등)의 API Key를 사용할 경우, ① 실시간 자막 번역은 음성 인식된 텍스트만 해당 제공업체 서버로 전송되며, ② **정밀 회의록** 기능을 실행하면 세션 종료 후 녹음된 오디오 파일(.m4a) 자체가 사용자의 기기에서 해당 제공업체(예: Google Gemini) 서버로 직접 업로드되어 전사·요약에 사용됩니다. 모든 전송은 개발사(PriSincera) 중개 서버를 거치지 않는 직접 통신이며, 데이터 처리에는 사용자가 선택한 제공업체의 개인정보 처리방침이 적용됩니다.
* **회의 음성 녹음 및 로컬 저장:** 자막·회의록·정밀 회의록 기능을 위해 세션 중 오디오가 기기 내부에 .m4a(AAC) 파일로 녹음·저장됩니다. 녹음은 사전 동의 후에만 시작되고 진행 중 "● 녹음 중" 인디케이터가 표시되며, 앱 샌드박스 컨테이너에 저장되어 '대화 기록'에서 언제든 삭제할 수 있습니다. 시스템 사운드 캡처에는 macOS 화면 녹화 권한(ScreenCaptureKit)이 사용됩니다. 이 녹음은 정밀 회의록을 실행하지 않는 한 외부로 전송되지 않습니다.

### 3. API Key 보안
사용자가 입력한 API Key는 Apple의 강력한 암호화 기술인 **키체인(Keychain)을 통해 기기 내부에만 안전하게 저장**됩니다. 당사는 사용자의 API Key를 서버로 수집하거나 외부로 유출하지 않습니다.

### 4. 분석 데이터
본 앱에는 어떠한 외부 추적 도구(Google Analytics 등)도 포함되어 있지 않습니다. 당사는 앱 품질 개선을 위해 사용자가 Apple 기기 설정에서 자발적으로 동의한 익명의 'App Store 크래시 리포트(충돌 로그)' 데이터만을 제한적으로 확인합니다.

### 5. 문의처
본 개인정보 처리방침과 관련하여 궁금한 점이 있으시면 언제든지 아래 이메일로 문의해 주시기 바랍니다.
**support@prisincera.com**
