# 서비스가 커질 때 백엔드가 맞이하는 위협: PriSincera 웹 서비스 보안 정밀 진단 및 5가지 취약점 격퇴기

PriSincera는 과거 정적 SPA와 간단한 GCS(Google Cloud Storage) JSON 읽기 전용 구조에서 탈피하여, 2026년 5월 **Express 백엔드 다중 라우터 아키텍처 및 Firestore 기반 상태 저장 시스템**으로 완전히 고도화되었습니다. 

서비스의 기능이 풍부해지고 비즈니스 모델이 확장되는 과정은 빌더로서 매우 짜릿한 경험입니다. 하지만 아키텍처가 정교해지고 연동되는 API 엔드포인트가 늘어날수록 **보안 표면(Attack Surface)** 또한 정비례하여 넓어집니다. 

최근 PriSincera의 코드베이스 전체에 대한 정밀 보안 감사를 진행했고, 그 과정에서 발견된 **크리티컬 취약점부터 사소하지만 치명적이었던 런타임 결함까지 총 5가지의 핵심 보안 리스크를 격퇴한 엔지니어링 여정**을 생생하게 공유합니다.

---

## 🏗️ 아키텍처의 진화와 새로운 보안 책임

보안 취약점 조치 내역을 들여다보기 전에, 현재 PriSincera의 다중 라우팅 데이터 아키텍처를 이해할 필요가 있습니다.

```text
                        [ React SPA Frontend ]
                                   |
                                   | (Firebase ID Token)
                                   v
                          [ Express Server ]
           +-----------------------v-----------------------+
           |                       |                       |
           v                       v                       v
     [ Admin API Router ]    [ Study API Router ]    [ PaceNote  Router ]
     (Firebase Admin Auth)   (Authentication)        (Authentication)
           |                       |                       |
           +-----------------------v-----------------------+
           |                                               |
           v                                               v
     [ Firestore Database ] <--------------------- [ GCS Storage Fallback ]
     (subscribers, pacenotes,                      (daily_signals, index.json)
     study_progress, email_logs)
```

구독 데이터, 사용자별 학습 진행률(잔디), Pace Note 액션 플랜이 Firestore 데이터베이스에 통합 저장되며, 백엔드는 `/admin/api`, `/api/study`, `/api/pacenote` 라우터로 책임을 물리적으로 격리했습니다.

각 API 노선마다 서로 다른 인증 수준과 속도 제한(Rate Limit)이 필요해짐에 따라, 기존의 평평한 보안 구조를 입체적인 다층 방어 체계로 업그레이드해야 하는 새로운 기술적 과제를 마주하게 되었습니다.

---

## 🛠️ 우리가 격퇴한 5가지 핵심 취약점 및 엔지니어링 패치

정적 감사 및 침투 시뮬레이션을 통해 발견한 5가지 결함과, 이를 서비스 무중단 상태에서 완벽하게 치료한 구체적인 트러블슈팅 내역입니다.

### 1. 임시 디버깅 API가 남긴 흔적: 개인정보(PII) 노출 차단 (🔴 Critical)
* **발견된 문제**: 과거 로컬 개발 환경에서 이메일 발송 상태나 구독자 상태를 편리하게 점검하기 위해 작성해두었던 임시 디버그 API들(`/api/env-check`, `/api/temp-check-subs`, `/api/temp-logs`)이 프로덕션 환경에 그대로 노출되어 있었습니다.
* **보안적 위협**: 누구나 이 API를 호출하여 전체 구독자의 이메일 주소 목록(PII, 개인정보)을 긁어가거나, 메일 발송용 SMTP 서버 계정 정보 등 민감한 인프라 설정값을 탈취할 수 있는 GDPR 및 개인정보보호법상 대단히 위험한 상태였습니다.
* **엔지니어링 조치**: 
  - 해당 디버그 엔드포인트들을 **프로덕션 코드(`server.mjs`)에서 영구히 완전히 삭제**했습니다.
  - 구독자 정보 조회 및 로그 확인이 필요한 정식 관리 기능은 오직 Firebase JWT Admin ID 토큰 검증 및 `super_admin` 역할 대조 미들웨어를 완벽히 거쳐야만 진입 가능한 **어드민 전용 안전 라우터(`/admin/api/subscribers`)로 완전히 이관**했습니다.

### 2. 블로그 슬러그(Slug) 매개변수 유효성 검증과 NoSQL Injection 차단 (🟡 Medium)
* **발견된 문제**: 기술 블로그인 Builder's Log의 아티클별 조회수를 증가시키는 `/api/builderslog/:slug/view` API에서 `:slug` 파라미터에 대한 어떠한 형식 제한도 존재하지 않았습니다.
* **보안적 위협**: 공격자가 Slug 값에 특수기호나 상위 경로를 가리키는 문자(`../`) 등을 임의로 주입하여 데이터베이스 내 다른 영역의 문서를 훼손하거나 예기치 않은 시스템 오작동을 유발할 수 있는 잠재적 Injection 리스크가 존재했습니다.
* **엔지니어링 조치**: 
  - 슬러그 파라미터가 유입되는 초입에 영문 대소문자, 숫자, 하이픈(`-`), 언더스코어(`_`)만 허용하는 강력한 **정규식 검증 미들웨어**를 배치했습니다.
  - 이를 통해 비정상적인 문자가 1글자라도 섞여 들어올 경우 API가 즉시 요청을 거부하도록 방어벽을 세웠습니다.

```javascript
// 실제 적용된 정규식 기반의 Slug 안전 필터링
const slug = req.params.slug;
if (!/^[a-zA-Z0-9-_]+$/.test(slug)) {
  return res.status(400).json({ error: "Invalid slug format" });
}
```

### 3. 사용자 입력 페이로드 길이 제한으로 데이터베이스 과부하 방어 (🟡 Medium)
* **발견된 문제**: Pace Note 기능 중 유저가 자신만의 맞춤형 태스크를 추가하는 `POST /api/pacenote/add` 엔드포인트에서, 입력받는 `title` 값의 글자 수에 제한이 없었습니다.
* **보안적 위협**: 악의적인 유저가 메가바이트 단위의 거대한 텍스트나 비정상적인 더미 페이로드를 실어 요청을 난사할 경우, Firestore의 저장 용량이 급격히 고갈되거나 서버 메모리 점유율이 치솟아 전체 서비스가 마비(DoS)될 위험이 있었습니다.
* **엔지니어링 조치**: 
  - 커스텀 태스크 추가 API 단에서 **최대 글자 수를 100자로 강제 제한**하는 방어 로직을 추가했습니다.
  - 비즈니스 요구사항(할 일 타이틀 설정)을 온전히 충족하면서도 비정상적인 페이로드 주입 공격을 원천적으로 걸러내는 경계선을 구축했습니다.

### 4. Firestore Security Rules의 매칭 오류 정상화 (🟡 Medium)
* **발견된 문제**: Firestore 실시간 데이터 조회를 안전하게 통제하는 `firestore.rules` 설정 중, 학습 진행률 컬렉션(`study_progress`)에 대한 권한 매칭 경로가 잘못 설계되어 있었습니다.
  - *기존 규칙*: `match /study_progress/{userId}/{document=**}`
* **보안적 위협**: 기존의 규칙은 `{userId}`의 하위 서브컬렉션 트리만 보호할 뿐, 사용자의 진행상태 정보가 담긴 루트 문서 그 자체(`/study_progress/{userId}`)에 대한 클라이언트 직접 읽기/쓰기 권한을 제대로 보호하지 못해 연동 오류가 나거나 규칙 우회 여지가 존재했습니다.
* **엔지니어링 조치**:
  - 다음과 같이 보안 규칙을 유저 본인의 진행 정보 문서 그 자체와 하위 트리 전체에 일대일 매칭되도록 정교하게 재작성하여 보안 무결성과 클라이언트 API 호출 안정성을 동시에 확보했습니다.

```javascript
// 변경 완료된 안전한 Firestore 규칙
match /study_progress/{userId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
  match /{document=**} {
    allow read, write: if request.auth != null && request.auth.uid == userId;
  }
}
```

### 5. PriStudy Progress API의 500 내부 에러 추적: 런타임 ReferenceError 해결 (🟡 Medium)
* **발견된 문제**: 학습 진행률을 불러오는 `GET /api/study/progress` API 내부에서 이메일 데이터가 유실된 구버전 가입자를 위해 이메일 필드를 자동 보정해주는 예외 처리 로직이 동작할 때, 선언되지 않은 변수인 `docRef`를 참조하여 서버 크래시 및 500 에러를 송출하던 숨어 있던 버그를 발견했습니다.
* **엔지니어링 조치**: 
  - 함수 스코프 내에 `const docRef = db.collection(COLLECTIONS.STUDY_PROGRESS).doc(uid);` 변수를 명확하게 선언 및 인스턴스화하여 바인딩을 완료했습니다.
  - 비동기 수정 트랜잭션이 어떤 상황에서도 예외 처리 없이 스무스하게 동작하도록 결함을 완벽히 제거했습니다.

---

## 🛡️ 백엔드 전체의 보안 요새화: Rate Limiting & CSP & CORS

특정 버그 해결을 넘어 백엔드 Express 웹서버 인프라 레벨의 방어 체계도 한층 더 견고하게 요새화했습니다.

### 1. 세분화된 API 요청 제한 (Rate Limiting)
무차별 대입(Brute-Force) 및 분산 서비스 거부(DDoS) 공격으로부터 API 서버를 보호하기 위해, `express-rate-limit` 모듈을 도입하여 라우터 성격에 맞추어 속도 제한 레이아웃을 정밀 배치했습니다.
* **전역 공용 API (`/api/`)**: 분당 최대 60회 (`apiLimiter`)
* **구독 및 해지 API (`/api/subscribe`, `/api/unsubscribe`)**: 15분당 최대 5회 (`subscribeLimiter` - 어뷰징 방지)
* **어드민 API (`/admin/api/`)**: 15분당 최대 100회 (`adminLimiter` - 불필요한 스캔 차단)

### 2. CORS 와일드카드 정책 폐기
기존 개발 편의를 위해 느슨하게 풀려 있던 CORS 와일드카드(`*`) 설정을 전면 폐기하고, 오직 우리가 지정한 프로덕션 공식 도메인(`https://www.prisincera.com`)에서 출발한 신뢰할 수 있는 HTTP 요청만 백엔드 응답을 수락하도록 안전하게 제한했습니다.

### 3. Helmet 기반의 Strict CSP(콘텐츠 보안 정책) 적용
보안 헤더를 제어하는 `helmet` 미들웨어를 정밀 튜닝하여, 크로스 사이트 스크립팅(XSS) 및 클릭재킹을 원천 차단하는 엄격한 모던 CSP 규칙을 수립했습니다.

```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://apis.google.com", "https://www.gstatic.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://identitytoolkit.googleapis.com", "https://securetoken.googleapis.com"],
      frameSrc: ["'self'", "https://*.firebaseapp.com", "https://prisincera.firebaseapp.com"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
    },
  },
  strictTransportSecurity: { maxAge: 31536000, includeSubDomains: true, preload: true },
}));
```

---

## 🐳 인프라 및 컨테이너 배포 레벨 보안

컨테이너가 해킹당하더라도 전체 호스트 서버 권한이 넘어가지 않도록 하는 **운영 단계의 보안 고도화**도 빼놓지 않았습니다.

### 1. Docker 비-루트(Non-Root) 계정 실행 구조 전환
기존 가벼운 Node 컨테이너들은 기본 루트(Root) 권한으로 프로세스를 실행하여, 만에 하나 컨테이너 탈출 취약점이 터질 경우 호스트 리눅스 서버 전체가 장악될 수 있는 위험이 있었습니다.
이를 막기 위해 `Dockerfile` 내부에 `prisincera` 전용 시스템 계정(UID 1001)과 그룹을 생성하고, 서버 기동 프로세스가 해당 비-루트 권한 하에서만 제한적으로 실행되도록 빌드 파이프라인 설정을 수정했습니다.

### 2. GCP Secret Manager를 통한 완전 비물리적 자격 증명
소스코드에 절대 API 키가 하드코딩되지 않도록 조치하는 것은 기본입니다. 우리는 이에 더해, 민감한 외부 API 자격 증명 토큰(`GEMINI_API_KEY`, `GITHUB_TOKEN`)을 서버 구동 환경 변수 텍스트 파일에도 직접 기재하지 않고, 배포 파이프라인에서 **Google Cloud Secret Manager**를 통해 런타임에 동적으로 주입받도록 설계하여 자격 증명 유출 경로를 완벽히 차단했습니다.

---

## 📈 보안 개선 전후 성과 최종 비교

이번 집중 보안 개선 주간을 통해 적용된 주요 헤더 및 대응 성과를 객관적인 테이블로 비교한 결과입니다.

| 보안 항목 / 헤더 | 조치 이전 (04-23) | 조치 이후 및 현재 (05-21) | 보안 평가 |
| :--- | :---: | :---: | :---: |
| **X-Content-Type-Options** | `nosniff` | `nosniff` | ✅ 안전 (MIME 스니핑 방지) |
| **X-Frame-Options** | `DENY` | `DENY` | ✅ 안전 (클릭재킹 방지) |
| **Content-Security-Policy** | ❌ 미설정 | 🌟 strict CSP 정의 완료 | ✅ 안전 (외부 악성 스크립트 실행 불가) |
| **Strict-Transport-Security** | ❌ 미설정 | 🌟 `max-age=31536000; ...` | ✅ 안전 (강제 HTTPS 암호화 연결) |
| **Referrer-Policy** | ❌ 미설정 | `strict-origin-when-cross-origin` | ✅ 안전 (리퍼러 헤더 정보 누수 차단) |
| **개인정보 노출 취약점** | 🔴 3개 디버그 API 노출 | 🌟 **완벽 제거 및 Admin 통제 완료** | ✅ 안전 (구독자 PII 완전 보호) |
| **API 런타임 신뢰성** | 🟡 500 ReferenceError 존재 | 🌟 **예외 로직 정상화 완료** | ✅ 안전 (API 응답 신뢰성 확보) |

---

## 💡 글을 마치며: "빌드하는 것만큼 지키는 것도 엔지니어링이다"

정적 페이지 중심의 사이트에서 대규모 학습 관리 및 액션 플랜 플랫폼으로 서비스를 전환하는 것은 엔지니어로서 매우 가슴 벅찬 즐거움입니다. 하지만 동시에 사용자가 믿고 쓸 수 있는 안전한 울타리를 치는 것 또한 온전한 빌더의 몫이라는 것을 이번 정밀 보안 진단과 취약점 패치 작업을 통해 다시금 뼈저리게 느꼈습니다.

성공적인 빌드(Vite SPA 컴파일 완료)와 무장 완료된 백엔드 수정을 기반으로, PriSincera는 그 어느 때보다 단단하고 안전하게 유저 여러분의 성장 여정을 지원할 준비가 되었습니다.

앞으로도 더 안전하게, 그리고 더 멋지게 빌드해 나가겠습니다. 

Keep Building! 🚀
