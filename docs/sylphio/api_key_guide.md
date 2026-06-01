---
status: active
domain: Core
last_updated: 2026-06-02
version: v1.0
target_files:
  - src/pages/SylphioApiKeyGuide.jsx
---

# 🔑 Sylphio - AI 서비스별 API Key 발급 및 Pro 모드 연동 상세 가이드

## 📝 Revision History

| Version | Date | Author | Description | Impact Area |
| :--- | :--- | :--- | :--- | :--- |
| v1.0 | 2026-06-02 | Maker | 실피오 Pro 버전 API 키 가이드 매뉴얼 최초 정의 | docs/sylphio/ |

---

본 문서는 Sylphio(실피오) Pro 라이선스 사용자들이 개인용 API Key를 연동하여 최고 품질의 AI 실시간 통역(Gemini, OpenAI) 및 AI Executive Summary 기능을 한계 없이 누릴 수 있도록 돕는 **AI 서비스별 API 키 발급 및 요금제 연동 기술 안내 매뉴얼**입니다.

> [!NOTE]
> **BYOK (Bring Your Own Key) 아키텍처의 장점**
> Sylphio는 사용자 개인이 소유한 API Key를 직접 입력하는 안전한 방식(BYOK)을 사용합니다. 수집된 모든 오디오와 번역 텍스트는 중간 중개 서버를 전혀 거치지 않고 오직 사용자의 로컬 환경과 AI 제공사의 보안 API 엔드포인트 간에만 전송되며, 저장된 키는 macOS의 최고 보안 금고인 **Secure Keychain**에 강력하게 암호화 보존됩니다.

---

## 🟢 Part 1: Google Gemini API Key 발급 프로세스 (초강력 추천 / 무료 제공 가능)

Google Gemini는 뛰어난 번역 컨텍스트 이해도와 더불어 **압도적인 무료 혜택(Free Tier)**을 제공하여 Sylphio 사용 장벽을 극적으로 낮춰 줍니다.

### ❖ Step-by-Step 발급 절차
1. **Google AI Studio 접속**: 
   - 웹 브라우저를 열고 [Google AI Studio (aistudio.google.com)](https://aistudio.google.com/)에 접속하여 개인 구글 계정으로 로그인합니다.
2. **API Key 관리자 이동**:
   - 좌측 상단 사이드바 메뉴의 **`Get API key`** 버튼을 클릭합니다.
3. **API Key 생성**:
   - 화면 중앙의 **`Create API key`** 버튼을 클릭합니다.
   - 나타나는 팝업에서 **`Create API key in new project`** (또는 기존에 프로젝트가 있다면 기존 프로젝트 선택)를 클릭합니다.
4. **키 보관 및 복사**:
   - 생성 완료 즉시 제공되는 복사 버튼을 눌러 **`AIzaSy...`**로 시작하는 고유 API Key 문자열을 메모장 등에 안전하게 임시 보관합니다. (이 창을 닫으면 다시는 키를 확인하거나 복사할 수 없으므로 주의하십시오.)

### ❖ Gemini 요금제 정보 및 Free Tier 한도
* **무료 버전 (Free Tier)**: 
  - **비용**: 100% 무료
  - **지원 한도**: **1분당 15회 요청(15 RPM)**, 1일 1,500회 요청 지원.
  - **동작 특징**: 일반적인 대화 번역 시 1.5초 묵음 감지 단락마다 1회 요청이 발송되므로, 1분에 15단락 미만으로 발화할 경우 유료 결제 연동 없이도 **Pro 수준의 실시간 번역을 무제한 무료로 상시 가동**할 수 있습니다.
* **유료 버전 (Pay-as-you-go)**:
  - 분당 15회 이상의 초고속 다량 발화나 제한 없는 인식을 원할 경우 유료 종량제를 등록할 수 있습니다. 요금은 사용한 텍스트의 글자 수(Token) 단위로 매겨지며, 100만 토큰당 약 0.075달러(약 100원) 수준으로 상상을 초월할 만큼 저렴합니다.

---

## 🔵 Part 2: OpenAI API Key 발급 프로세스 (고성능 통역 전문가용)

OpenAI의 GPT-4o-mini 엔진은 뛰어난 언어 스위칭 정확성과 대화 요약 능력을 보장하며, 고속 응답성에 특화되어 있습니다.

### ❖ Step-by-Step 발급 절차
1. **OpenAI API 플랫폼 접속**:
   - [OpenAI API Platform (platform.openai.com)](https://platform.openai.com/)에 접속하여 가입 후 로그인합니다.
2. **API Keys 메뉴 진입**:
   - 좌측 내비게이션 바에서 열쇠 모양 아이콘인 **`API keys`** 메뉴를 선택합니다.
3. **API Key 생성**:
   - 화면 우측 상단의 **`+ Create new secret key`** 버튼을 클릭합니다.
   - 키의 식별용 이름(예: `Sylphio`)을 작성한 뒤 **`Create secret key`**를 클릭합니다.
4. **키 즉시 저장**:
   - 화면에 표시되는 **`sk-proj-...`**로 시작하는 고유 비밀 키를 즉시 복사하여 안전한 곳에 백업합니다. (구글과 마찬가지로 팝업창을 닫은 이후에는 전체 비밀 키를 다시 볼 수 없습니다.)

### ❖ ⚠️ OpenAI 핵심 유의사항: 결제 크레딧 사전 충전 (Prerequisite)
* **신규 계정 발급 후 미동작 오류 해결**:
   - OpenAI는 구글과 달리 **무료 체험용 Credit이 만료되었거나 비어있을 경우, API Key를 생성하여 앱에 연동하더라도 인식을 개시하자마자 즉각 번역 에러(`429 You exceeded your current quota`)를 반환**하며 번역이 영구 묵살됩니다.
   - 이를 해결하기 위해 반드시 **크레딧 사전 충전(Pre-paid Billing)**을 완료해야 합니다:
     1. 좌측 메뉴의 **`Settings > Billing`**으로 이동합니다.
     2. **`Add to balance`** 또는 **`Payment methods`**를 클릭하고 해외 결제가 가능한 카드를 등록합니다.
     3. **최소 5달러($5)** 크레딧을 사전 충전해 둡니다.
* **요금제 정보 (GPT-4o-mini 기준)**:
   - **입력 토큰당 비용**: $0.150 / 1M tokens
   - **출력 토큰당 비용**: $0.600 / 1M tokens
   - 실시간 자막 통역 세션을 한 시간 내내 쉬지 않고 가동하더라도 실제 소비되는 크레딧은 약 **5원 ~ 10원 미만** 수준으로 거의 체감되지 않을 만큼 저렴합니다.

---

## ⚙️ Part 3: Sylphio 앱 내 API Key 최종 연동 가이드

1. macOS에 단독 설치된 **`Sylphio.app`**을 기동합니다.
2. 대기 화면 우측 상단의 **설정 기어 버튼(⚙️)**을 클릭하여 환경설정 창을 엽니다.
3. 좌측 탭 메뉴에서 **`AI Engine (인공지능 번역 엔진)`**을 선택합니다.
4. **`AI PRO 실시간 통역 엔진 활성화`** 스위치를 **ON(켬)** 상태로 전환합니다.
5. 유저가 선호하는 AI 엔진 플랫폼(Google Gemini 또는 OpenAI)을 선택합니다.
6. 복사해 두었던 API Key 문자열을 마우스 우클릭하여 붙여넣기(`CMD + V`) 합니다.
7. **`API Key 연동 성공 및 활성화`** 표시를 확인한 뒤 설정창을 닫습니다.
8. 이제 대기 화면 상단 출발어 오버레이를 클릭하면 **`🌐 자동 감지 (Auto-Detect)`** 옵션의 제한이 정상 해제되어 선택할 수 있으며, 실시간 다국어 번역과 AI 퀄리티의 고품격 회의록 요약 보고서가 완벽 가동됩니다!

---

## 🚨 Part 4: 긴급 장애 극복 및 트러블슈팅 (Troubleshooting)

### Q1. "설정 ⚙️에서 AI 번역을 활성화하세요" 또는 "번역 에러" 가 계속 발생합니다.
* **원인**: 입력하신 API Key 내부에 불필요한 공백 문자나 줄바꿈(`\n`)이 섞여 들어갔거나, 키 자체가 유효하지 않을 때 발생합니다.
* **해결법**: 키 입력란을 완전히 비운 후, 메모장에 키를 한 번 붙여넣어 공백이 없는지 확인하고 다시 한 번 복사하여 깨끗하게 입력해 주십시오.

### Q2. OpenAI Key를 넣었는데 계속 "Quota Exceeded" 에러가 뜸니다.
* **원인**: 사용 중인 OpenAI 플랫폼 계정에 사전 충전된 Balance(달러 크레딧)가 `0`인 상태이거나, 예전에 등록했던 카드 결제 정보가 만료되어 계정이 일시 잠금 상태일 때 발생합니다.
* **해결법**: [OpenAI Billing](https://platform.openai.com/settings/organization/billing/overview) 페이지로 이동하여 충전 잔액이 남아 있는지 재차 확인하시고 최소 5달러를 결제/충전해 두셔야 정상 가동됩니다.
