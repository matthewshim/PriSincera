# PriSincera 이메일 파이프라인 리뉴얼 계획안

## 1. 개요 및 목적
최근 "Study" 서비스가 추가되면서, 기존 "PriSignal" 단일 서비스 명칭으로 발송되던 데일리 뉴스레터를 통합 브랜드인 "PriSincera"로 리뉴얼하고자 합니다. 
이와 더불어, 최근 Study 내용 추가 후 발생한 **"메일이 2번씩 발송되는 현상(Double Dispatch)"**의 원인을 분석하고 이를 원천 차단하는 파이프라인 보완 작업을 진행합니다.

---

## 2. 메일 리뉴얼 및 컨텐츠 균형감 조정안

### 2.1 메일 타이틀 및 브랜드 변경
*   **기존 발송자명/제목:** `PriSignal` / `📡 PriSignal Daily — 5/7(목)`
*   **변경 발송자명/제목:** `PriSincera` / `📬 PriSincera Daily — 5/7(목)`
*   **이메일 헤더 로고:** PriSignal 로고에서 통합 서비스 명칭인 **PriSincera**로 변경. 

### 2.2 이메일 컨텐츠 레이아웃 (Signal & Study 균형감 배치)
이메일 내에 **Signal(IT/비즈니스 시그널)**과 **Study(비즈니스 일본어 1-Pick)**를 명확히 구분하여 제공합니다.

1.  **헤더 (Header):**
    *   PriSincera 로고 및 "Daily Insights & Study" 슬로건.
    *   인사말 (예: "오늘 하루 성장을 위한 시그널과 배움을 전해드립니다.")
2.  **섹션 1: Signal (고밀도 인사이트 큐레이션)**
    *   타이틀: `📡 Signal — Today's DM Pick`
    *   내용: AI 스코어링 및 20년차 PO의 시선이 담긴 상위 5개 기사 및 코멘트.
    *   디자인: 기존 DM Pick 카드 포맷 유지 (가독성 높은 어두운 배경 + 그라데이션)
3.  **섹션 2: Study (하루 5분, 실무 비즈니스 일본어)**
    *   타이틀: `📖 Study — Daily 1-Pick`
    *   내용: 매일 생성되는 비즈니스 일본어 문장 1개 (원문 + 해석 + 발음/뉘앙스).
    *   디자인: Signal 카드와 차별화되는 밝은 톤 혹은 따뜻한 톤의 박스 디자인으로 환기 효과 부여.
4.  **섹션 3: More Signals**
    *   나머지 큐레이션 기사 리스트.
5.  **푸터 (Footer):**
    *   웹사이트 바로가기 (Signal 홈 / Study 홈) 및 구독 취소 링크.

---

## 3. 메일 중복(2번) 발송 이슈 원인 분석 및 해결 방안

### 3.1 이슈 현상 및 원인 분석
*   **현상:** Study 데이터를 추가하면서부터 정규 발송 시 이메일이 두 번씩 중복 발송되는 이슈 발생.
*   **원인 추정:** 
    1.  **실행 시간 증가로 인한 타임아웃/재시도 (Timeout/Retry):** 
        *   `composer.mjs`가 메일을 발송할 때, Study 데이터(`getStudyContent`)를 조회하고 이메일 HTML 크기가 커지면서 Gmail SMTP로 이메일을 전송(Nodemailer)하는 데 소요되는 전체 시간이 증가했습니다.
        *   Cloud Scheduler나 외부 트리거가 HTTP 타임아웃(기본 3분 등)을 초과했다고 판단하면 실패로 간주하고 **Job을 재시도(Retry)**할 수 있습니다.
    2.  **느슨한 락(Lock) 메커니즘:**
        *   현재 `MailService.mjs`의 로직을 보면, `isEmailAlreadySent`는 **이메일 발송이 100% 완료된 후**에야 Firestore의 `EMAIL_LOGS` 컬렉션에 발송 이력을 저장합니다.
        *   발송 도중(전체 구독자에게 보내는 동안)에 Job이 재실행되거나, 타임아웃으로 인해 다시 트리거될 경우 발송 이력이 아직 없으므로 `isEmailAlreadySent`가 `false`를 반환해 **처음부터 다시 메일을 보내게 되는 구조**입니다.

### 3.2 해결 방안 (원천 차단 로직 도입)
이메일 중복 발송을 원천적으로 차단하기 위해 **선행 락(Lock) 저장 방식**을 도입해야 합니다.

*   **개선 전:** 메일 발송 전부 완료 ➡️ Firestore에 `EMAIL_LOGS` 저장
*   **개선 후:** 발송 시작 전 Firestore에 `status: 'pending'` 으로 문서 생성 ➡️ 메일 발송 ➡️ `status: 'completed'`로 업데이트
*   **코드 변경 계획 (`MailService.mjs`):**
    ```javascript
    export async function dispatchDailyEmail(...) {
      // 1. 발송 시작 전 Pending(락) 상태 기록
      await db.collection(COLLECTIONS.EMAIL_LOGS).doc(`daily-${todayStr}`).set({
        date: todayStr,
        status: 'pending', // 진행 중임을 표시
        startedAt: new Date().toISOString()
      });
      
      // 2. 발송 실행
      const emailResult = await sendToSubscribers(...);
      
      // 3. 발송 완료 후 상태 업데이트
      await db.collection(COLLECTIONS.EMAIL_LOGS).doc(`daily-${todayStr}`).update({
        status: 'completed',
        totalRecipients: emailResult.total,
        successCount: emailResult.sent,
        ...
      });
    }
    ```
    이와 더불어 `isEmailAlreadySent()` 함수는 상태가 `pending`이거나 `completed`인 문서가 존재하기만 하면 발송 중이거나 발송 완료된 것으로 판단하여 `true`를 반환하도록 수정합니다.

---

## 4. 향후 진행 단계 (Action Item)
1.  [ ] `pipeline/src/lib/email-template.mjs` 수정하여 PriSincera 브랜드 적용 및 Signal/Study 섹션 분리.
2.  [ ] `pipeline/src/services/MailService.mjs`의 발송 로직에 선행 락(Lock) 메커니즘 추가.
3.  [ ] 수동 테스트 스크립트를 통해 중복 실행 시 락 메커니즘이 방어하는지, 템플릿이 잘 깨지지 않는지 검증.
4.  [ ] 스테이징 후 메인 브랜치 병합 및 Cloud Run 배포 반영.
