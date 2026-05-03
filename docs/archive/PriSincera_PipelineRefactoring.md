# PriSincera 파이프라인 리팩토링 및 개선 계획서

본 문서는 지난 기간 동안 누적된 기술 부채(Technical Debt)를 청산하고, 시스템의 안정성 및 유지보수성을 극대화하기 위한 백엔드 파이프라인(`prisignal-composer`) 리팩토링 진단 및 개선 계획을 담고 있습니다.

## 1. 현재 코드 베이스 진단 (Pain Points)

### 1.1. 갓 클래스(God Class) 및 비대해진 스크립트
- **진단**: `composer.mjs` 파일 하나가 데이터 로딩, AI 호출, 휴리스틱 스코어링 로직, 이메일 HTML 렌더링, SMTP 메일 전송 로직까지 모든 역할을 독점하고 있습니다. (SRP 위반)
- **위험**: 코드가 길어지고 복잡해져, 메일 템플릿만 조금 수정하려 해도 전체 로직에 영향을 줄 수 있는 위험(Regression Risk)이 존재합니다.

### 1.2. 잔재 코드(Legacy Code) 방치
- **진단**: `subscribers.mjs`의 경우 최근 Firestore 기반 관리로 대대적인 업데이트를 완료했음에도 불구하고, GCS를 통한 JSON 파일 읽기/쓰기(Fallback) 로직이 여전히 남아있습니다.
- **위험**: 이번 UBLA 권한 에러 사태처럼 낡은 로직은 예상치 못한 라이브러리 충돌을 야기하고 시스템 복잡성을 불필요하게 가중시킵니다.

### 1.3. 상태 관리의 파편화 (GCS 남용)
- **진단**: 현재 데일리 시그널 데이터나 구독자 목록 등을 데이터베이스가 아닌 클라우드 스토리지(GCS)의 JSON 파일로 저장 및 덮어씌우기 방식으로 관리하고 있습니다.
- **위험**: 파일 기반 동기화는 트랜잭션을 지원하지 않아 동시성 문제가 발생하기 쉽고, 권한 관리(IAM) 및 접근 속도 면에서 데이터베이스(Firestore)보다 매우 불리합니다.

### 1.4. 에러 처리 및 안정성(Robustness) 부족
- **진단**: Gemini AI API 호출이나 SMTP 메일 서버 전송 시 네트워크 지연이나 일시적 오류에 대한 재시도(Retry) 로직이 전무합니다.
- **위험**: 메일을 10명에게 보내다가 5번째에서 실패하면, 앞선 5명과 뒤의 5명을 구분해 재발송하는 복구 큐(Queue) 시스템이 없어 치명적인 발송 사고로 이어질 수 있습니다.

---

## 2. 단계별 개선 계획 (Refactoring Phases)

빠른 업무 정상화를 위해 가장 시급한 부채부터 3단계로 나누어 청산합니다.

### Phase 1: 아키텍처 모듈화 (Architecture Modularization)
**목표: 코드의 가독성을 높이고 유지보수를 쉽게 만들기**
- `composer.mjs`를 파이프라인을 통제하는 '컨트롤러(Controller)' 역할로만 남깁니다.
- **비즈니스 로직 분리**:
  - `src/services/ScoringService.mjs` : Gemini 프롬프트 작성 및 휴리스틱 가중치 계산 전담
  - `src/services/MailService.mjs` : 이메일 HTML 템플릿 렌더링 및 SMTP 발송 로직 전담
  - `src/repositories/DailyRepository.mjs` : 데일리 데이터 읽기/쓰기 전담

### Phase 2: 기술 부채 청산 및 Firestore 전면 도입
**목표: 낡은 로직을 버리고 최신 DB 기반으로 전환**
- **GCS 로직 완전 삭제**: `subscribers.mjs` 내에 남아있는 GCS Fallback(v1 호환) 로직을 전부 삭제하고, 깔끔한 Firestore 전용 코드로 개편합니다.
- **데일리 시그널 Firestore 이전**: `daily_signals` 파일 및 `index.json` 관리를 GCS 저장 방식에서 Firestore 컬렉션(`daily_signals`) 문서 저장 방식으로 완전 마이그레이션합니다. (이미지 등 정적 파일만 GCS 사용)

### Phase 3: 견고함(Robustness) 및 예외 처리 강화
**목표: 서버리스 환경에서의 무중단 서비스 보장**
- **자동 재시도(Retry) 도입**: 외부 API(Gemini, Gmail) 통신 구간에 `p-retry` 또는 지수 백오프(Exponential Backoff) 로직을 추가하여 네트워크 튀김 현상을 방어합니다.
- **발송 큐(Queue) 처리 개선**: `Promise.allSettled`를 활용해 일부 메일 발송이 실패하더라도 다른 메일 발송에 영향을 주지 않도록 결합도를 낮추고, 실패한 이메일 목록만 별도로 Firestore `failed_emails` 컬렉션에 남겨 후속 재발송이 가능하도록 설계합니다.

---

## 3. 기대 효과
이 리팩토링이 완료되면 **에러 발생 빈도가 획기적으로 줄어들고**, 향후 새로운 기능(예: 알림톡 연동, 개인화 맞춤형 메일 등)을 추가할 때 기존 코드를 건드리지 않고 플러그인처럼 쉽게 붙일 수 있는 **확장 가능한 시스템(Scalable System)**으로 탈바꿈하게 됩니다.
