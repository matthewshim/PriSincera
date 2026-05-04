# PriStudy 구글 로그인(Google Login) 전환 및 구현 보고서

## 1. 개요 및 목적
현재 PriStudy의 이메일/비밀번호 기반 회원가입 로직을 **구글 로그인(Google OAuth)** 기반으로 성공적으로 전환했습니다.
이메일 가입의 허들(Friction)을 제거하여 사용자가 단 원클릭으로 가입/로그인을 완료하고 즉각적으로 데일리 스터디(마이크로러닝)에 진입하도록 구현되었습니다.

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

## 4. 아키텍처 및 구현 결과 (Implementation Results)

### Step 1: 로그인 로직 개편 (완료)
- `src/lib/firebase.js`를 신설하여 Firebase Web SDK (`firebase/app`, `firebase/auth`) 기반의 팝업 인증(`signInWithPopup`)을 구현했습니다.
- 이를 통해 사용자는 번거로운 회원가입 없이 Google 계정 하나로 1초 만에 로그인할 수 있습니다.

### Step 2: 세션 격리 (Session Isolation) 아키텍처 (중요)
- **이슈:** 일반 사용자 구글 로그인 연동 후, 어드민 페이지(`AdminDashboard.jsx`)에서 기존 이메일/비밀번호 계정이 접속되지 않고 일반 사용자 세션과 충돌하는 문제가 발생했습니다.
- **해결책:** `AdminDashboard.jsx` 내부에 관리자 전용 Firebase App 인스턴스(`adminApp`)를 별도로 초기화(`initializeApp`)하여, 일반 유저용 `firebase/app`과 세션을 완전히 격리했습니다.
- **결과:** 어드민 관리자는 기존 방식대로 이메일 인증을 통해 백오피스에 접근 가능하며, 일반 사용자는 구글 로그인으로만 프론트엔드 서비스를 이용하도록 완벽하게 분리되었습니다.

### Step 3: 프론트엔드 UI/UX 개편 (완료)
- `PriStudyHero.jsx`에서 로그인 여부에 따라 "Google로 1초 만에 시작하기" 버튼 또는 "사용자 메일 주소 + 로그아웃 링크"를 동적으로 노출합니다.
- `PriStudyDaily.jsx`에서 기존 이메일 폼(`AuthModal`)을 걷어내고, Google 인증 버튼을 통일성 있게 배치했습니다.

---

## 5. 결론
**구글 로그인 전환은 성공적으로 완료되었습니다.**
초기 우려되었던 관리자 권한 충돌 문제는 다중 Firebase App 인스턴스 기법으로 해결되었으며, PriStudy의 사용자 경험이 압도적으로 향상되었습니다.
