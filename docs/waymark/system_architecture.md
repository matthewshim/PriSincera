---
status: draft
domain: Waymark
nav_title: 🏗️ 시스템 아키텍처
last_updated: 2026-10-24
version: v0.3
target_files:
  - (통합) 기존 PriSincera Cloud Run 웹앱 `prisincera-web`(server.mjs + SPA)에 Waymark 라우트·엔드포인트 편입
  - (재사용) Firestore · Firebase Auth · Firebase Hosting · Cloud Scheduler → Cloud Run Job · nodemailer(Gmail SMTP) 이메일 엔진
---

# 🏗️ Waymark 시스템 아키텍처 & 데이터 모델 (System Architecture)

## 📝 Revision History

| Version | Date | Author | Description | Impact Area |
| :--- | :--- | :--- | :--- | :--- |
| v0.1 | 2026-10-24 | AI Agent | 최초 — Supabase·Edge·pgvector·서버 AI | (구) |
| v0.2 | 2026-10-24 | AI Agent | 비용 0 재설계 — Firebase·서버 LLM 제거(규칙·템플릿)·RLS→Firestore Rules | (구) |
| v0.3 | 2026-10-24 | AI Agent | **최종 계획 반영(실측 확인)** — ① **통합**: 별도 앱이 아니라 기존 **Cloud Run 웹앱에 편입**(D-4 통합 확정) ② 인프라 정본 실측 반영: **Firebase Functions 아님 → 기존 Cloud Run + Cloud Scheduler→Cloud Run Job + nodemailer 이메일 엔진 재사용**(GCP 빌링 이미 활성) ③ **먼저 찾아옴 = 이메일 + 웹푸시 이중 채널** ④ **AI 2-경로**: 체험=Groq 무료(ZDR·서버·캡), 지속=BYOK(클라이언트·공급자 직접) ⑤ BYOK 키 관리 규범 ⑥ 비용 "기존 인프라 위 **추가 ≈ ₩0**" | 전반 |

---

## 0. 설계 원칙 (v0.3 — 최종)

> **별도 서비스가 아니라, 이미 돌아가는 PriSincera 인프라에 '얹는다'.** 새 패러다임·새 비용 없이 기존 Cloud Run·Scheduler·Jobs·이메일 엔진·Firestore를 재사용해 **추가 운영비 ≈ ₩0**로 구현한다.

- **통합(D-4)**: Waymark 서비스는 기존 웹앱 `prisincera-web`(Cloud Run, Express `server.mjs` + SPA)에 **라우트·엔드포인트로 편입**. 별도 레포/네이티브 앱 아님. 설치형 **PWA**(웹).
- **AI-라이트·비용 0**: 먼저 찾아옴·회고 기본은 **규칙·템플릿**(LLM 0). 동반 4톤은 **체험 AI**(학습 안 하는 무료 티어 **Groq+ZDR**, 서버·캡)로 제공, 소진·미BYOK 시 **템플릿 폴백**. 지속·심화는 **BYOK**.
- **먼저 찾아옴 = 이중 채널**: **이메일(기존 엔진·확실·설치 불필요) + 웹푸시(즉시·설치형 PWA)**. iOS는 홈화면 설치 시에만 푸시 → 이메일이 도달 보증.
- **키 비보유 원칙**: 우리 Groq 키는 **서버 전용**(클라 노출 X), 사용자 BYOK 키는 **기기 전용**(서버 미경유). 서로의 키를 보지 않는다([security_spec §6](security_spec.md)).

## 1. 아키텍처 개요

```
┌──────────────── Client (통합 SPA · PWA) ─────────────────┐
│ 기존 PriSincera SPA에 Waymark 라우트 · Service Worker     │
│ · Firestore SDK(Rules 적용 직접 R/W)                      │
│ · BYOK: 브라우저 → AI 공급자 직접(키 기기 보관)            │
└───────┬───────────────────────────────┬──────────────────┘
        │ 직접(Rules)                    │ /api (체험 AI 프록시)
        ▼                               ▼
┌────────────────┐     ┌──────────────────────────────────┐
│ Firestore(+Rules)│    │ Cloud Run `prisincera-web`        │
│ Firebase Auth   │    │  (server.mjs 엔드포인트 추가)       │
│ Firebase Hosting│    │  · 체험 AI 프록시(우리 Groq 키·캡)  │
└───────┬────────┘     └──────────────────────────────────┘
        │
        │ (먼저 찾아옴)
┌───────▼─────────────────────────────────────────────────┐
│ Cloud Scheduler(기존 패턴) → Cloud Run Job (신규 1개)      │
│  도래 이벤트 조회 → 템플릿 렌더 → ①이메일(nodemailer)      │
│                                   ②웹푸시(FCM)             │
└──────────────────────────────────────────────────────────┘
        외부: Groq(무료·ZDR, 서버) · 사용자 BYOK 공급자(클라)
```

## 2. 기술 스택 (전부 기존 재사용 · 추가 ≈ ₩0)

| 레이어 | 선택 | 비고(실측) |
| :--- | :--- | :--- |
| 프런트 | 기존 **SPA에 Waymark 라우트 편입** + PWA(설치·오프라인·푸시) | 통합(D-4) |
| 호스팅 | **Firebase Hosting(무료)** → rewrite → Cloud Run | 기존 그대로 |
| 서버 | **Cloud Run `prisincera-web`(Express server.mjs)** 에 엔드포인트 추가 | 기존 그대로 |
| DB | **Cloud Firestore**(+Security Rules) | 기존 사용 |
| 인증 | **Firebase Auth**(Google) | 기존 사용 |
| 스케줄 | **Cloud Scheduler → Cloud Run Job**(먼저찾아옴 잡 1개 추가) | 기존 크론 6개와 동일 패턴 |
| 이메일 | **nodemailer(Gmail SMTP)** | 기존 Daily Digest 엔진 재사용 |
| 푸시 | **FCM 웹푸시** | 신규(무료) |
| AI(체험) | **Groq 무료**(무학습·ZDR, 서버 프록시·per-user 캡) | 신규(무료 쿼터) |
| AI(지속) | **BYOK**(브라우저→공급자 직접) | 신규 |
| 비용 통제 | 기존 **`billing-killswitch`** + 캡·모니터링 | 기존 보유 |

> **비용**: 기존 인프라 월 ~₩5천(Cloud Run·Scheduler·Secret 등) 위에, Waymark는 **무료 쿼터 내로 얹어 추가 ≈ ₩0**. 초과 시 killswitch·캡으로 통제 후 소액 종량 판단.

## 3. 데이터 모델 (Firestore)

> 문서 소유자 `uid`. 모든 접근은 Security Rules(§8). 타임스탬프 `serverTimestamp()`.

### 3-1. `users/{uid}`
`displayName, locale, timezone, quietStart, quietEnd, cadence, pushEnabled, emailOptIn, role('user'|'moderator'|'admin'), onboardedAt, fcmTokens[]`

### 3-2. `decisions/{decisionId}`
`uid, title(≤80), context(≤4000), options[], chosen, emotionTags[], domain, importance(1~3), reversible, status('open'|'revisited'|'closed'), outcome, outcomeNote, emotionNow[], tagsKeywords[], decidedAt, createdAt, updatedAt`
- 서브컬렉션 `.../messages/{id}`: `type('nudge'|'checkin'|'midterm'|'retro'|'user_note'|'ai'), tone, templateId?, source('template'|'trial_ai'|'byok'), text, createdAt`

### 3-3. `decisionEvents/{eventId}` (먼저 찾아옴 스케줄)
`uid, decisionId, type, tone, scheduledAt, sentAt, respondedAt, status('scheduled'|'sent'|'responded'|'skipped'|'canceled'), channels('email'|'push')[]`
- 인덱스: `(status, scheduledAt)`.

### 3-4. `stories/{storyId}` / `storiesPublic/{storyId}`
`stories`: `authorUid, isAnonymous, title, body, domain, emotionTags[], tagsKeywords[], sourceDecisionId, status('pending'|'approved'|'rejected'), rejectReason, approvedAt, moderatorUid, helpfulCount, unhelpfulCount, createdAt`.
`storiesPublic`(서버만 생성): 공개 필드만 복제, **`authorUid` 제외**(익명 역추적 차단).

### 3-5. `storyFeedback/{uid_storyId}` · `notifications/{id}` · `moderationLogs/{id}`
(v0.2와 동일)

### 3-6. `aiUsage/{uid}` (체험 AI 캡 미터) ★신규
`uid, periodStart, trialCallsUsed, trialTokensUsed, lastCallAt` — per-user 캡·전역 레이트리밋 집행용. **BYOK 호출은 여기 카운트 안 함**(클라이언트·공급자 직접).

## 4. 먼저 찾아옴 (이중 채널 · 규칙·템플릿)

### 4-1. 생성
결정 저장 시 중요도·cadence로 `decisionEvents` 생성([functional_spec §6](functional_spec.md)).

### 4-2. 발송 — **Cloud Scheduler → Cloud Run Job**(기존 패턴)
스케줄러가 주기적으로 잡 트리거 → 잡이: 도래·`scheduled`·조용시간 밖·결정 `!=closed` 이벤트 조회 → **템플릿 렌더**(톤×이벤트×도메인) → `messages`·`notifications` 기록 → **①이메일(nodemailer, emailOptIn) + ②FCM 웹푸시(pushEnabled)** 발송 → `status='sent'`. **멱등**: `(decisionId,type)` 유일 + status 가드.
- 조용시간 내 도래 → 종료 후 첫 틱 발송. 미응답 감쇠·closed 취소(v0.2와 동일).
- **도달 보증**: 푸시 미허용/iOS 미설치여도 **이메일로 도달**.

## 5. 경험담 매칭 (태그·키워드 · 임베딩 없음)
결정 `domain`+`emotionTags`+`tagsKeywords`로 `storiesPublic` 승인분 쿼리 → 가중 정렬 Top-3. 0건이면 기여 유도. (랭킹 [functional_spec §7-2](functional_spec.md))

## 6. 알림 — 이메일 + 웹푸시
- **이메일**: 기존 nodemailer/Gmail SMTP 엔진. 확실·설치 불필요(먼저 찾아옴 도달 보증).
- **웹푸시(FCM)**: 즉시성. iOS는 **홈 화면 설치 PWA**에서만 수신(16.4+) → 온보딩에서 설치 유도. 토큰 `users.fcmTokens[]`, 만료 정리.

## 7. 경험담 파이프라인 (수동 검수)
제출(`pending`) → **오너/모더레이터 수동 검수**(간이 어드민) → 승인 시 `storiesPublic` 생성·노출. 신고→재검수·즉시 비공개. (급증 시 선필터 추후, §11)

## 8. 인증 · 권한 · 테넌트 격리 (Firestore Security Rules)
Firebase Auth + **App Check**. 모든 C1/C2 문서 `request.auth.uid == resource.data.uid`(기본 deny). `storiesPublic` read 공개·write 서버만. 운영자(role)는 `stories`·`moderationLogs`만 — **결정·메시지 접근 불가**. 규칙 예시는 v0.2 §8 유지.

## 9. AI 통합 — 2경로 ★

| 경로 | 키 | 호출 위치 | 통제 |
| :--- | :--- | :--- | :--- |
| **체험 AI** | 우리 **Groq 무료**(무학습·**ZDR ON**) | **서버**(Cloud Run `/api` 프록시) | per-user 캡(`aiUsage`)·전역 레이트리밋·소진 시 템플릿 폴백 |
| **BYOK** | **사용자 키** | **브라우저→공급자 직접** | 우리 서버·Firestore 미경유·무로그 |

- 공급자 하드룰·BYOK 키 관리(IndexedDB+WebCrypto·무로그·무동기화·CORS/패스스루)·"BYOK≠프라이버시" 고지는 **[security_spec §6](security_spec.md)**.
- 출력 가드레일("대신 결정" 금지·위기 안내), 인젝션 방어, 최소 전송.

## 10. 프라이버시 · 보안
> 전담 규범 [security_spec.md](security_spec.md). 결정·메시지=본인 전용. 체험 AI는 학습 안 하는 무료 티어(Groq ZDR)만·최소 전송. Firebase 웹 config는 공개 식별자(Rules가 보호). 서버 비밀(Groq 키·FCM 서버 키·SMTP)은 Secret Manager/서버에만.

## 11. 배포 · 미결
- 배포: 기존 `cloudbuild.yaml`(이미지 빌드→Cloud Run 배포, Jobs 갱신) 재사용 + 먼저찾아옴 Job·Scheduler 1개 추가.
- 미결: [ ] Groq 무료 계정 ZDR 토글 가능 여부(콘솔 확인) · [ ] 체험 캡 수치 · [ ] BYOK 공급자 CORS 매트릭스 · [ ] 무료 쿼터 초과 기준·killswitch 연동 · [ ] 경험담 급증 시 반자동 검수.

---

## 관련 문서
*   [🗺️ 제품 전략서](product_strategy.md) · [📋 기능 명세서](functional_spec.md) · [📜 보안·프라이버시 규범](security_spec.md)
*   [🚀 추진계획서](execution_plan.md) · [🏗️ 인프라 현황(정본)](../core/infrastructure_2026-09.md) · [📚 인덱스](../INDEX.md)
