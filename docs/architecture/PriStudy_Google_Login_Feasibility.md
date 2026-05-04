# PriStudy 구글 로그인(Google Login) 전환 기술 검토 보고서

## 1. 개요 및 목적
현재 PriStudy의 이메일/비밀번호 기반 회원가입 로직을 **구글 로그인(Google OAuth)** 기반으로 전환하고자 합니다.
이메일 가입의 허들(Friction)을 제거하여 사용자가 단 원클릭으로 가입/로그인을 완료하고 즉각적으로 데일리 스터디(마이크로러닝)에 진입하도록 유도하는 것이 주 목적입니다.

---

## 2. 제안하는 UX Flow
1. **Hero 영역 버튼 상시 노출:** 
   - [서비스 소개] 탭이든 [데일리 스터디] 탭이든 상관없이 Hero 영역 하단에 "Google로 시작하기" 버튼을 노출합니다.
   - 단, 이미 로그인된 상태라면 "오늘의 스터디 이어하기" 혹은 "학습 기록 보기" 등으로 버튼 텍스트를 변경합니다.
2. **비로그인 상태의 데일리 스터디 탭:**
   - 기존의 이메일 가입 폼(`AuthModal`)을 제거합니다.
   - 대신 "매일의 학습 기록(잔디 심기)을 저장하기 위해 1초 만에 로그인하세요"라는 안내 문구와 함께 예쁜 구글 로그인 연동 컴포넌트를 배치합니다.

---

## 3. 기술적 타당성 (Feasibility) 및 이슈 검토

현재 PriSincera 웹사이트는 **Firebase Identity Toolkit (REST API)**를 활용하여 로그인/가입을 처리하고 있습니다. 구글 로그인 도입에 대한 환경적/기술적 이슈는 다음과 같습니다.

### ✅ 긍정적 측면 (도입 매우 용이함)
- **Firebase Auth 통합:** 구글 로그인은 Firebase Authentication의 네이티브 기능입니다. 서버 인프라를 복잡하게 수정할 필요 없이 프론트엔드 레벨에서 Firebase JS SDK를 연동하거나, 기존 Identity Toolkit REST API의 OAuth 흐름을 활용하면 구현이 가능합니다. (가장 좋은 것은 가벼운 `firebase/auth` SDK 추가입니다.)
- **보안 및 인증:** 구글에서 발급받은 ID Token을 기존과 동일하게 백엔드(Firestore 통신 등)에 전달하면 되므로, 기존 API 구조(`/api/study/progress` 등)를 그대로 재사용할 수 있습니다.

### ⚠️ 사전 준비 및 체크 리스트 (필수)
구글 로그인을 코드 레벨에서 구현하기 전에 **반드시 Firebase/GCP 콘솔에서 아래의 설정이 선행**되어야 합니다.

1. **Firebase Console - Sign-in Method 활성화**
   - Firebase 콘솔 > Authentication > Sign-in method 탭에서 **Google 제공업체(Provider)**를 '사용 설정(Enable)'해야 합니다.
2. **승인된 도메인(Authorized Domains) 등록**
   - 구글 로그인 팝업이 작동하려면 Firebase Authentication의 설정(승인된 도메인 목록)에 `www.prisincera.com`과 `prisincera.com`이 반드시 추가되어 있어야 합니다. (기본적으로 `localhost`는 허용되어 있습니다.)
3. **OAuth 동의 화면 (GCP Console)**
   - GCP 콘솔에서 OAuth 동의 화면(Consent Screen) 정보(앱 이름, 사용자 지원 이메일 등)가 올바르게 기입되어 있는지 확인해야 합니다.

---

## 4. 아키텍처 및 구현 방향 (Implementation Plan)

### Step 1: 로그인 로직 개편
- 현재 REST API 기반(`fetch`)으로 되어 있는 코드를 **Firebase Web SDK (`firebase/app`, `firebase/auth`)** 기반의 팝업 인증(`signInWithPopup`)으로 교체하여 안정적인 구글 로그인 팝업을 띄웁니다.

### Step 2: 프론트엔드 UI/UX 개편
- `PriStudyHero.jsx`에 로그인 상태(token 유무)를 Props로 전달받아, 비로그인 시 [Google로 1초 만에 시작하기] 버튼을 노출합니다. 탭 상태와 무관하게 고정 노출됩니다.
- `PriStudyDaily.jsx`에서 `AuthModal`을 걷어내고, 비로그인 유저를 위한 **구글 연동 유도 Empty State** UI를 추가합니다.

### Step 3: 토큰 핸들링 유지
- 구글 로그인 성공 시 반환되는 `idToken`과 `email`을 기존 방식과 동일하게 `localStorage`에 저장하여 세션을 유지합니다. 사용자 입장에서는 로그인 수단만 바뀔 뿐 경험은 매끄럽게 연결됩니다.

---

## 5. 결론
**구글 로그인 전환은 기술적 무리 없이 100% 가능하며, UX 관점에서도 현재의 이메일 직접 가입 방식보다 이탈률을 현저히 낮출 수 있는 탁월한 선택입니다.**

위 사전 체크 리스트(Firebase 콘솔 설정)만 확인 및 세팅해 주시면, 즉시 프론트엔드 코드 수정 및 UI 디자인 개선 작업을 진행할 수 있습니다.
