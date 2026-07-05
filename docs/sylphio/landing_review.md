---
status: active
domain: Sylphio
last_updated: 2026-06-29
version: v1.0
---

# 🔍 Sylphio 랜딩 검토 보고서

Sylphio 웹 프로젝트(`www/src/pages/`) 내의 주요 구성 파일들을 검토한 결과, 최신 macOS 데스크톱 앱의 개선 사항(마이크 명칭 통일, UI 스케일업 및 하이브리드 STT 폴백 등)과 비교했을 때 수정이 권장되는 일부 설명 오류 및 보완 사항을 발견했습니다.

---

## 🔍 파일별 검토 결과 및 수정 제안

### 1. [SylphioApiKeyGuide.jsx](file:///Users/shimks/Documents/문서 - kwang-sik의 MacBook Pro/PriSincera/www/src/pages/SylphioApiKeyGuide.jsx)

#### ① 한글 번역 오역 및 비직관적 문구 교정
* **문제점 (Line 49)**: 
  `appStep7: "API Key 연동 성공 및 활성화 표시를 확인한 뒤 설정창을 닫으면 다국어 자동 감지 및 실시간 번역 통역이 해제되어 완벽 가동됩니다!"`
  * 영문 `unlock`을 직역하는 과정에서 "실시간 번역 통역이 **해제되어(disabled)**"라는 부정적인 단어로 표기되어 기능이 꺼진다는 오해를 부를 수 있습니다.
* **수정안**: 
  `"API Key 연동 성공 및 활성화 표시를 확인한 뒤 설정창을 닫으면 다국어 자동 감지 및 실시간 번역 통역 기능의 잠금이 해제되어 완벽 가동됩니다!"` 또는 `"...번역 통역 기능이 활성화되어 완벽 가동됩니다!"`로 수정을 권장합니다.

#### ② 실제 데스크톱 앱 환경설정 탭 명칭 통일
* **문제점 (Line 45)**:
  `appStep3: "좌측 탭 메뉴에서 AI Engine (인공지능 번역 엔진)을 선택합니다."`
  * 실제 macOS 앱의 `ContentView.swift` 1488라인에 등록된 해당 탭의 텍스트 메뉴명은 **`"AI 엔진 (BYOK)"`** 입니다. 사용자의 혼선을 줄이기 위해 가이드 내 메뉴명도 동일하게 맞춰줄 필요가 있습니다.
* **수정안**:
  `"좌측 탭 메뉴에서 AI 엔진 (BYOK)을 선택합니다."`로 수정할 것을 권장합니다.

---

### 2. [SylphioPrivacy.jsx](file:///Users/shimks/Documents/문서 - kwang-sik의 MacBook Pro/PriSincera/www/src/pages/SylphioPrivacy.jsx)

#### ① 하이브리드 STT 폴백 탑재에 따른 오프라인 강제 문구 완화
* **문제점 (Line 27 - ko / Line 63 - en / Line 99 - ja)**:
  `"기본 번역 모드를 사용할 경우, 화면의 오디오 캡처 및 음성 인식(STT)은 Apple의 내장 프레임워크(SFSpeechRecognizer)를 통해 100% 기기 내부(On-Device)에서 오프라인으로 처리됩니다. 어떠한 오디오 데이터도 사용자의 Mac 외부로 유출되지 않습니다."`
  * 데스크톱 앱의 한국어 인식 누락을 방지하기 위해 `requiresOnDeviceRecognition = false` 설정을 탑재하여, 기기 내에 오프라인 음성 팩이 없는 경우 Apple 서버의 하이브리드 받아쓰기 망을 타게 됩니다. 
  * "100% 기기 내부 오프라인 처리"라고 과장 설명하는 경우 Apple의 보안 서버 전송에 따른 개인정보 처리방침 법적 불일치가 발생할 수 있습니다.
* **수정안**:
  `"기본 번역 모드를 사용할 경우, 화면의 오디오 캡처 및 음성 인식(STT)은 Apple의 내장 프레임워크(SFSpeechRecognizer)를 통해 처리됩니다. 음성 데이터는 Apple의 보안 음성 인식 정책에 따라 기기 내부(On-Device) 또는 Apple 보안 서버를 거쳐 안전하고 익명으로 처리되며, 개발사(PriSincera)는 어떠한 데이터도 수집하지 않습니다."` 형식으로 안전하게 순화 표기할 것을 적극 권장합니다.

---

### 3. [SylphioLanding.jsx](file:///Users/shimks/Documents/문서 - kwang-sik의 MacBook Pro/PriSincera/www/src/pages/SylphioLanding.jsx)

#### ① "내장 마이크" 기능 스펙 적극 홍보 제안
* **검토 결과**:
  * 마이크 관련 설명(`f3Desc`, `freeFeature2` 등)에서는 무난한 대분류 단어인 "마이크", "시스템 & 마이크 듀얼 캡처" 등이 잘 사용되어 있어 데스크톱 앱의 "내장 마이크" 통일 스펙과 조화를 이룹니다.
* **추가 제안**:
  * 최근 적용된 **"720x700 일원화된 시원한 레이아웃"**, **"Flat하고 모던해진 회의록 종료 화면"**, **"대화록 동적 폰트 스케일업 및 슬라이더 연동 기능"** 등 실비오 데스크톱 앱의 최신 프리미엄 UI 기능들을 랜딩 페이지의 FeatureCard나 세부 설명에 반영해 주면 마케팅 상으로 소구점이 더욱 돋보일 것입니다.
