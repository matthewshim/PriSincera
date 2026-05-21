---
status: archived
domain: Core
last_updated: 2026-05-21
version: v1.0
---

# 📬 이메일 SMTP 자체 발송 엔진 전환 및 파이프라인 리뉴얼 아카이브

이 문서는 외부 뉴스레터 SaaS(Buttondown) 의존성을 제거하고, Google Workspace Gmail SMTP 기반의 자체 이메일 발송 엔진 구축 및 IT Signal & Study 콘텐츠 파이프라인 리뉴얼의 모든 설계 결정과 해결 이력을 통합한 역사적 기록 문서입니다.

---

## 1. Buttondown ➡️ Gmail SMTP 자체 엔진 전환 (2026-04-29)

### 1-1. 전환 배경 및 의존성 제약
기존에는 외부 SaaS인 Buttondown API에 이메일 발송과 구독자 데이터베이스를 의존하고 있었습니다. 그러나 다음과 같은 제약으로 인해 자체 발송 시스템으로의 전환을 결정했습니다.
* **디자인 제약**: Markdown ➡️ HTML 자동 변환으로 인해 아티클별 개별 카드 스타일링과 세밀한 반응형 그리드 제어가 불가했습니다.
* **비용 절감**: 유료 Workspace 계정의 일 2,000건 무료 한도(Gmail SMTP)를 활용하여 외부 구독 서비스를 무료화했습니다.
* **데이터 주권**: 구독자 데이터를 외부 플랫폼에 위탁하지 않고 자체 GCS/Firestore에 보관하여 보안성과 커스터마이징 자유도를 확보했습니다.

### 1-2. 자체 이메일 발송 아키텍처 (TO-BE)
```
                Pipeline (Cloud Run Jobs)
                ┌──────────┐    ┌──────────┐
                │Collector │───▶│ Composer │
                └──────────┘    └────┬─────┘
                                     │
                    ┌────────────────┼─────────────────┐
                    │                │                  │
                    ▼                ▼                  ▼
          ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
          │email-template│  │ subscribers  │  │   mailer     │
          │    .mjs      │  │    .mjs      │  │    .mjs      │
          │(HTML 렌더링) │  │(GCS 구독자)  │  │(Nodemailer)  │
          └──────┬───────┘  └──────┬───────┘  └──────┬───────┘
                 │                 │                  │
                 │                 ▼                  ▼
                 │        ┌──────────────┐   ┌──────────────┐
                 │        │  GCS Bucket  │   │  Gmail SMTP  │
                 │        │subscribers/  │   │smtp.gmail.com│
                 │        │active.json   │   └──────┬───────┘
                 │        └──────────────┘          │
                 └──────────────────────────────────┤
                                                    ▼
                                           구독자 메일함
```

### 1-3. 주요 구현 모듈 및 보안
* **`mailer.mjs`**: `nodemailer` 기반 Gmail SMTP 발송 엔진 모듈. 루프 내 개별 전송 시 초당 1건 쓰로틀링(Throttling) 및 발송 실패 시 전체 중단을 막기 위한 개별 예외 처리 적용.
* **`subscribers.mjs`**: GCS JSON 및 Firestore 기반 구독자 관리 로직. 
* **구독 해지 보안 (HMAC Token)**: 악의적인 제3자의 구독 해지를 차단하기 위해 이메일 주소와 환경변수 시크릿(`UNSUBSCRIBE_SECRET`)을 조합한 HMAC-SHA256 해지 토큰 검증 시스템을 도입했습니다.
  `https://www.prisincera.com/api/unsubscribe?token=<HMAC(email)>&email=<email>`

---

## 2. 콘텐츠 파이프라인 리뉴얼 및 Signal & Study 통합

### 2-1. 브랜드 리뉴얼
기존의 IT 큐레이션 단일 명칭인 `PriSignal`에서 어학 학습 모델 `Study`가 통합됨에 따라, 전체 통합 서비스명인 **`PriSincera`**로 메일링 브랜드를 전환했습니다.
* **AS-IS**: `📡 PriSignal Daily — MM/DD`
* **TO-BE**: `📬 PriSincera Daily — MM/DD`

### 2-2. 템플릿 레이아웃 분리 및 가독성 개선
`juice` 라이브러리를 사용해 컴파일 단계에서 CSS 속성을 HTML 내에 완전 인라인화하여 아웃룩, 지메일 등 파편화된 이메일 뷰어 환경에서 스타일이 깨지는 문제를 해결했습니다.
1. **Signal 섹션**: 가독성 높은 다크 배경 테마와 네온 글로우 카드 레이아웃 유지.
2. **Study 섹션**: 하루 5분 실무 비즈니스 일본어 콘텐츠를 제공하며, Signal과 대비되는 밝고 따뜻한 톤의 카드 디자인을 적용해 시각적 환기 효과 부여.

---

## 3. 중복 메일 발송(Double Dispatch) 해결 이력 (2026-05)

### 3-1. 발생 원인 분석
어학 콘텐츠(`Study`)가 메일에 포함되면서 이메일의 HTML 바이트 용량과 API 조회 소요 시간이 대폭 늘어났습니다. 이로 인해 다음과 같은 레이스 컨디션 및 타임아웃 오작동이 나타났습니다.
1. **Cloud Scheduler 타임아웃 및 재시도**: 메일 발송(Nodemailer)이 3분 기본 타임아웃을 초과하자 스케줄러가 실패로 오인하여 Job을 다시 트리거했습니다.
2. **느슨한 사후 락(Lock)의 한계**: 이메일 발송이 100% 완료된 시점에만 Firestore의 `EMAIL_LOGS`를 저장하는 사후 기록 방식 구조로 인해, 발송 진행 중에 두 번째 Job이 실행되면 중복 발송을 전혀 감지하지 못했습니다.

### 3-2. 선행 락(Pending Lock) 시스템 구현
발송이 개시되기 전 Firestore에 `status: 'pending'` 문서를 즉시 선제 삽입하는 **선행 락 알고리즘**을 도입하여 중복 트리거를 완벽하게 물리쳤습니다.

```javascript
export async function dispatchDailyEmail(...) {
  // 1. 발송 개시 전 선행 락(Lock) 기입
  await db.collection(COLLECTIONS.EMAIL_LOGS).doc(`daily-${todayStr}`).set({
    date: todayStr,
    status: 'pending',
    startedAt: new Date().toISOString()
  });
  
  // 2. 루프 발송 실행
  const emailResult = await sendToSubscribers(...);
  
  // 3. 발송 최종 완료 후 완료 상태 업데이트
  await db.collection(COLLECTIONS.EMAIL_LOGS).doc(`daily-${todayStr}`).update({
    status: 'completed',
    successCount: emailResult.sent,
    completedAt: new Date().toISOString()
  });
}
```

본 선행 락 구조 적용 이후, 중복 배치 구동 시 `isEmailAlreadySent()`가 `pending` 또는 `completed` 상태를 조회해 발송을 즉각 차단하여 중복 발송 문제를 성공적으로 해결하였습니다.
