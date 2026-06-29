# 🩺 Front-end Stability Diagnostics Checklist (프런트엔드 장애 예방 자가진단 체크리스트)

이 문서는 웹 애플리케이션의 자바스크립트 런타임 오류, 리소스 로딩 실패, 스타일 누수 등 비즈니스에 치명적인 영향을 줄 수 있는 **프런트엔드 서비스 장애를 사전에 감지하고 차단하기 위한 기술 진단 표준 체크리스트**입니다.

---

## 📌 1. 자바스크립트 런타임 및 예외 처리 (Runtime Fault Tolerance)

자바스크립트 코드는 단 하나의 예외(uncaught error)로도 리액트 렌더링 트리를 붕괴시키고 전체 페이지를 빈 화면(White Screen)으로 만들 수 있습니다.

*   [x] **React Error Boundary 구축 여부**
    *   앱 전체 혹은 비즈니스 핵심 컴포넌트(GNB, 결제, 대시보드 차트) 단위로 `ErrorBoundary`를 배치하여, 특정 영역의 에러가 앱 전체 셧다운으로 이어지지 않도록 격리했는가?
*   [x] **인터랙션/커스텀 비주얼의 JS-CSS 동적 동기화 여부**
    *   커스텀 마우스 포인터, 스크롤 애니메이션 등 비주얼 요소가 자바스크립트 로드 여부에 완전히 종속되는 경우, JS 실행이 보장될 때만 활성화 클래스(예: `html.has-custom-cursor`)를 동적으로 주입하고, 실패 시 브라우저 기본값(Fallback)이 100% 작동하도록 분기 처리했는가?
*   [ ] **API 데이터 null/undefined 방어 코드 작성 여부**
    *   서버에서 전달받는 모든 응답 객체에 대해 Optional Chaining (`data?.user?.profile`) 및 기본값 지정(Nullish Coalescing `?? []`)을 철저히 적용하여 `TypeError: Cannot read properties of undefined` 에러를 원천 예방했는가?
*   [ ] **이벤트 리스너 안전 해제(Cleanup) 여부**
    *   `window`나 `document`에 바인딩하는 모든 이벤트 리스너(`mousemove`, `scroll`, `resize`)는 리액트 컴포넌트 언마운트 시점에 반드시 해제(`removeEventListener`)되어 메모리 누수와 브라우저 지연을 일으키지 않는가?

---

## 📌 2. 자산 로딩 및 외부 의존성 탄력성 (Asset & CDN Resilience)

웹폰트, 외부 라이브러리, API 등 외부 네트워크(CDN) 자원은 언제든 지연되거나 차단(CORS 오류 등)될 수 있습니다.

*   [ ] **웹폰트 로드 실패 시 글꼴 폴백(Fallback Font Stack) 지정 여부**
    *   `index.css` 등에 외부 폰트를 불러오기 전, 로드 실패를 가정하여 시스템 기본 폰트 스택(`-apple-system`, `BlinkMacSystemFont`, `system-ui`, `sans-serif`)을 적합하게 정의해 두었는가?
*   [ ] **안정적 CDN Endpoint 선정 여부**
    *   CDN을 통해 자산을 불러올 때, 네트워크 슬라이싱이나 조각난 요청으로 인해 차단되기 쉬운 `dynamic-subset` 방식이 아닌, 안정성이 검증된 단일 완전 가변 폰트(Variable CSS)나 파일 형태를 이용하는가?
*   [ ] **타사 API 실패 및 타임아웃 격리 여부**
    *   외부 결제, 번역, AI 챗봇 등의 API 연동 시 별도의 Try-Catch 구문 및 5초 이내 타임아웃을 설정하여, 외부 서버 먹통 시 우리 서비스의 메인 로딩이 함께 걸리는 병목 현상을 방어했는가?

---

## 📌 3. 스타일 격리 및 레이아웃 무결성 (CSS Scoping & Isolation)

잘못된 전역 선택자(`.btn-primary`, `*` 등) 오버라이드는 페이지 간 예기치 못한 레이아웃 깨짐이나 색상 오염을 유발합니다.

*   [ ] **스타일 오염 차단을 위한 컴포넌트 스코핑 적용 여부**
    *   특정 페이지나 서비스 영역(예: 실피오 브랜드 컬러)의 CSS 정의가 전역 규칙을 강제로 덮어쓰지 않도록, 고유의 부모 클래스 래퍼(예: `.sylphio-landing .btn-primary`)로 범위를 철저히 격리했거나 모듈러 CSS를 사용했는가?
*   [ ] **크로스 브라우징 및 뷰포트 무결성 여부**
    *   모바일 브라우저의 100vh 계산 스크롤 버그(주소창 노출 시 레이아웃 찌그러짐)를 방지하기 위해 `dvh`(Dynamic Viewport Height)나 CSS 변수 기반 뷰포트 높이 보정을 적용했는가?
*   [ ] **다국어 개행(CJK Wrap) 처리 확인 여부**
    *   한국어/영어/일본어 등 언어별 특성에 맞춰 `:lang(ja)` 등에서 `word-break`가 비정상적으로 강제 개행되거나 레이아웃 텍스트가 겹치지 않도록 방어 설계했는가?

---

## 📌 4. 배포 전 빌드 파이프라인 및 정적 진단 (Build & Pre-flight Diagnostics)

배포 직전 빌드 단계에서 장애 유발 코드가 자동으로 필터링되는 안전망이 갖춰져야 합니다.

*   [ ] **정적 컴파일 빌드 무결성 검사 자동화 여부**
    *   로컬 개발 환경 혹은 CI/CD 환경에서 배포 전 반드시 `npm run build`를 완벽하게 통과하고 컴파일 단계의 Syntax Error나 모듈 해석 에러가 0건임을 확인하는 프로세스가 있는가?
*   [ ] **크롬 개발자 도구 콘솔 모니터링 여부**
    *   배포 직전 스테이징 브라우저에서 콘솔을 열어, 붉은색 경고(`Uncaught Error`, `Blocked by CORS policy`, `Failed to load resource`)가 한 건도 존재하지 않는지 점검했는가?
*   [ ] **성능 및 레이아웃 Shift 진단 여부**
    *   Lighthouse 점수를 진단하여 누적 레이아웃 이동(CLS - Cumulative Layout Shift)이 0.1 이하로 제어되어 렌더링 중 레이아웃이 출렁거리는 현상을 막았는가?
