---
status: active
domain: Core
last_updated: 2026-07-22
version: v1.1
target_files:
  - server.mjs
  - admin-api.mjs
  - pacenote-api.mjs
  - src/contexts/AuthContext.jsx
  - src/pages/AdminDashboard.jsx
---

# 🏗️ 인증·권한 아키텍처 (Authentication)

## 📝 Revision History

| Version | Date | Author | Description | Impact Area |
| :--- | :--- | :--- | :--- | :--- |
| v1.0 | 2026-06-29 | AI Agent | 구글 로그인 단일화·AuthContext 중앙화·admin 세션 격리 아키텍처 최초 정리 | AuthContext, AdminDashboard |
| v1.1 | 2026-07-22 | AI Agent | 코드 실측 정합화 — admin 인스턴스명 `adminApp` 정정, admin Google 로그인 병존 반영, §4를 Firebase ID 토큰 Bearer + `admin_config` 화이트리스트/역할 체계로 재서술, 리런 승계 표기 | §3, §4 |

## 1. 개요 (Overview)
기존 `PriStudy` 서비스 시절의 이메일/비밀번호 가입 방식을 폐기하고, 전체 `PriSincera` 도메인(ReLearn 등)에 **구글 로그인(Google OAuth) 단일 인증 체계**를 도입하여 적용 중인 아키텍처 명세서입니다.

가입 허들(Friction)을 0에 가깝게 줄여 사용자가 단 한 번의 클릭으로 서비스에 진입하고 개인화된 데이터를 생성할 수 있도록 구현되어 있습니다.

---

## 2. 프론트엔드 인증 구조 (AuthContext 기반 중앙화)

### 2.1. `AuthContext.jsx`를 통한 전역 상태 관리
기존에 각 페이지에 흩어져 있던 인증 로직을 React Context API(`AuthContext.jsx`)로 중앙화했습니다.
- **기능:** 앱 로드 시 Firebase Auth의 `onAuthStateChanged`를 구독하여 전역에서 로그인 상태(`user`)와 로딩 상태(`loading`)를 구독할 수 있습니다.
- **장점:** `ReLearn`을 비롯한 어느 컴포넌트에서든 `useAuth()` 훅을 통해 사용자의 로그인 여부를 즉시 파악하고, 로그인 모달을 띄우거나 개인화된 뷰를 렌더링할 수 있습니다.

### 2.2. 실행 궤도·Navigation 연동
네비게이션 및 궤도 입력 컴포넌트(리런 실행 스테이지)는 전역 Auth 상태에 따라 동적으로 반응합니다.
- 비로그인 유저가 궤도 관련 액션을 시도할 경우 즉시 Google 로그인 팝업을 호출하여 유려한 UX를 제공합니다.

---

## 3. 관리자(Admin) 세션 격리 아키텍처 (Session Isolation)

**"일반 사용자 세션과 관리자 세션의 충돌"** 문제를 해결하기 위해 다중 Firebase App 인스턴스 기법을 도입했습니다.

### 3.1. 문제 배경
Firebase Auth는 기본적으로 브라우저에 단일 세션을 유지하므로, 일반 사용자로 구글 로그인된 상태에서 어드민 페이지에 접근 시 권한 충돌 및 튕김 현상이 발생했습니다.

### 3.2. 해결책 (`adminApp` 분리)
- `AdminDashboard.jsx` 내부에 관리자 전용 Firebase App 인스턴스를 별도의 이름표를 붙여 초기화(`initializeApp(firebaseConfig, 'adminApp')`)했습니다. 세션 지속성은 `browserSessionPersistence`(탭 종료 시 만료)로 제한합니다.
- 일반 서비스는 `[DEFAULT]` Firebase 인스턴스를 사용하고, 백오피스는 `adminApp` 인스턴스를 사용하여 **세션을 브라우저 레벨에서 물리적으로 격리**했습니다.
- **로그인 수단:** 관리자 이메일/비밀번호와 **Google 계정 팝업** 두 경로를 모두 지원합니다(`AdminDashboard.jsx` LoginForm). 어떤 수단이든 최종 인가는 §4의 서버 화이트리스트가 결정합니다.
- **결과:** 일반 사용자로 구글 로그인이 되어 있더라도, 어드민 페이지에서는 별도의 인증 절차를 다시 거치게 되어 보안과 UX를 모두 확보했습니다.

---

## 4. 백엔드 인증·인가 (Backend Security)

Express 기반 백엔드 API 서버는 **"인증(Firebase ID 토큰) + 인가(Firestore 화이트리스트)"** 이중 구조를 갖습니다. 자체 서명 JWT나 HTTP-Only 쿠키는 사용하지 않습니다 — 모든 보호 API는 `Authorization: Bearer <Firebase ID Token>` 헤더 방식입니다.

1. **사용자 API (`pacenote-api.mjs`, `study-api.mjs`):** 프론트엔드가 Google OAuth로 발급받은 Firebase ID Token을 Authorization 헤더에 실어 보내면, 백엔드는 `firebase-admin`으로 검증(`verifyIdToken`)한 뒤 `req.user.uid` 기준으로 본인 데이터만 조회/수정합니다.
2. **관리자 API (`admin-api.mjs`):** `requireAdmin` 미들웨어가 ① Firebase ID 토큰을 검증하고 ② 토큰의 이메일을 Firestore `admin_config/settings.admins` **화이트리스트**와 대조합니다. 화이트리스트에 없으면 유효한 토큰이라도 403입니다.
3. **역할(Role) 체계:** 화이트리스트 항목은 `super_admin` / `admin` 역할을 가지며, 관리자 계정 CRUD 등 민감 작업은 `requireSuperAdmin`으로 `super_admin`에게만 허용됩니다. 프로필(displayName·비밀번호) 변경은 서버 경유 없이 프론트가 Firebase Identity Toolkit REST를 직접 호출합니다.

---

## 5. 결론 및 향후 계획
구글 로그인 전환 및 AuthContext 중앙화는 성공적으로 안착하였으며, 기존 문서(PriStudy 시절의 파편화된 UI 적용기)는 본 아키텍처 문서로 완전히 대체 및 최신화되었습니다.
향후 필요시 Apple 로그인 등을 추가할 때도 `AuthContext` 내부 로직만 확장하면 되는 매우 유연한 아키텍처가 확보되었습니다.
