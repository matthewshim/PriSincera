---
status: active
domain: Core
last_updated: 2026-06-29
version: v1.0
---

# 🏗️ 인증·권한 아키텍처 (Authentication)

## 1. 개요 (Overview)
기존 `PriStudy` 서비스 시절의 이메일/비밀번호 가입 방식을 폐기하고, 전체 `PriSincera` 도메인(PaceNote, Daily Digest 등)에 **구글 로그인(Google OAuth) 단일 인증 체계**를 도입하여 적용 중인 아키텍처 명세서입니다.

가입 허들(Friction)을 0에 가깝게 줄여 사용자가 단 한 번의 클릭으로 서비스에 진입하고 개인화된 데이터를 생성할 수 있도록 구현되어 있습니다.

---

## 2. 프론트엔드 인증 구조 (AuthContext 기반 중앙화)

### 2.1. `AuthContext.jsx`를 통한 전역 상태 관리
기존에 각 페이지(Hero, Daily 등)에 흩어져 있던 인증 로직을 React Context API(`AuthContext.jsx`)로 중앙화했습니다.
- **기능:** 앱 로드 시 Firebase Auth의 `onAuthStateChanged`를 구독하여 전역에서 로그인 상태(`user`)와 로딩 상태(`loading`)를 구독할 수 있습니다.
- **장점:** `PaceNoteDashboard`를 비롯한 어느 컴포넌트에서든 `useAuth()` 훅을 통해 사용자의 로그인 여부를 즉시 파악하고, 로그인 모달을 띄우거나 개인화된 뷰를 렌더링할 수 있습니다.

### 2.2. Omni-Orbit & Navigation 연동
PriSincera의 핵심 UI 요소인 네비게이션 및 Omni-Orbit 입력 컴포넌트는 전역 Auth 상태에 따라 동적으로 반응합니다.
- 비로그인 유저가 PaceNote 관련 액션을 시도할 경우 즉시 Google 로그인 팝업을 호출하여 유려한 UX를 제공합니다.

---

## 3. 관리자(Admin) 세션 격리 아키텍처 (Session Isolation)

가장 큰 기술적 챌린지였던 **"일반 사용자(Google) 세션과 관리자(Email/PW) 세션의 충돌"** 문제를 해결하기 위해 다중 Firebase App 인스턴스 기법을 도입했습니다.

### 3.1. 문제 배경
PriSincera 백오피스(`AdminDashboard`)는 보안상 지정된 이메일과 비밀번호로만 접속해야 합니다. 그러나 Firebase Auth는 기본적으로 브라우저(로컬 스토리지)에 단일 세션을 유지하므로, 일반 사용자로 구글 로그인된 상태에서 어드민 페이지에 접근 시 권한 충돌 및 튕김 현상이 발생했습니다.

### 3.2. 해결책 (`adminApp` 분리)
- `AdminDashboard.jsx` 내부에 관리자 전용 Firebase App 인스턴스(`adminApp`)를 별도의 이름표를 붙여 초기화(`initializeApp(firebaseConfig, 'ADMIN_APP')`)했습니다.
- 일반 서비스는 `[DEFAULT]` Firebase 인스턴스를 사용하고, 백오피스는 `ADMIN_APP` 인스턴스를 사용하여 **세션을 브라우저 레벨에서 완벽하게 물리적으로 격리**했습니다.
- **결과:** 일반 사용자로 구글 로그인이 되어 있더라도, 어드민 페이지에서는 별도의 이메일 인증 절차를 다시 거치게 되어 보안과 UX 두 마리 토끼를 모두 잡았습니다.

---

## 4. 백엔드 인증 및 보안 (Backend Security)

Express 기반 백엔드 API 서버는 유저의 데이터를 보호하기 위해 이중 보안 구조를 갖습니다.

1. **사용자 API (`pacenote-api.mjs` 등):** 프론트엔드에서 API 요청 시 Google OAuth로 발급받은 Firebase ID Token을 Authorization 헤더에 실어 보냅니다. 백엔드는 `firebase-admin`을 통해 해당 토큰을 검증(verifyIdToken)한 뒤, `req.user.uid`를 바탕으로 데이터를 조회/수정합니다.
2. **관리자 API (`admin-api.mjs`):** 오직 Admin Dashboard에서 획득한 특수 토큰으로만 접근이 가능하며, 민감한 환경설정(Config) 및 유저 전체 데이터(`users`, `pacenote_daily_pool`) 열람/수정 권한을 갖습니다.

---

## 5. 결론 및 향후 계획
구글 로그인 전환 및 AuthContext 중앙화는 성공적으로 안착하였으며, 기존 문서(PriStudy 시절의 파편화된 UI 적용기)는 본 아키텍처 문서로 완전히 대체 및 최신화되었습니다. 
향후 필요시 Apple 로그인 등을 추가할 때도 `AuthContext` 내부 로직만 확장하면 되는 매우 유연한 아키텍처가 확보되었습니다.
