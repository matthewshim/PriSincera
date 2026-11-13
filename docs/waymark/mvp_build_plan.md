---
status: draft
domain: Waymark
nav_title: MVP 상세 구축 계획
last_updated: 2026-11-13
version: v0.2
target_files:
  - server.mjs (Waymark 라우터 마운트)
  - (신규) src/server/waymark/ (라우터·검증·AI 프록시·먼저찾아옴 Job)
  - src/pages/waymark/ (앱 화면 S-1~S-9)
  - src/data/waymarkModel.mjs (M0 — 재사용)
  - firestore.rules (deny-all 유지)
  - cloudbuild.yaml (먼저찾아옴 Job·Scheduler 1개 추가)
---

# Waymark MVP 상세 구축 계획 (Build Plan)

## Revision History

| Version | Date | Description | Impact Area |
| :--- | :--- | :--- | :--- |
| v0.1 | 2026-11-13 | 최초 — [mvp_rescope_plan](mvp_rescope_plan.md)(얇은 루프 + F-5 전체) 범위의 구축 상세. 아키텍처 결정(서버 REST+admin)·API 목록·F-5 3경로·먼저찾아옴 Job·보안·선행검증·작업 분해(M1-A~E)·일정 정의. 기존 server.mjs 패턴(`/api/study`·Bearer verifyIdToken·Cloud Run Job) 정합 확인 | Waymark M1 구축 전반 |
| v0.2 | 2026-11-13 | **§1-3 신설** — 공통 인증 재사용(단일 Firebase Auth·`useAuth` ReLearn/Waymark 공유) + 로그인 UX 컴포넌트·얇은 공통 프로필 `users/{uid}` 분리(uid 조인), 제품 설정은 `waymark_users` 유지. 온보딩 최초 가입자 한정. §2 정체성/제품설정 분리 | 인증·회원 |

---

## 0. 이 문서의 위치

[mvp_rescope_plan](mvp_rescope_plan.md)이 정한 **MVP 범위(얇은 루프 + F-5 전체)**를 실제로 어떻게 짓는지의 **구축 정본**이다. 주 독자 = 개발. 기능 수용 기준은 [functional_spec](functional_spec.md), 보안 규범은 [security_spec](security_spec.md)에 둔다 — 본 문서는 그것을 **기존 PriSincera 코드 패턴에 접지**한다.

## 1. 아키텍처 결정 (MVP 확정) ★

### 1-1. 데이터 접근 = 서버 REST + admin Firestore (클라 직접 아님)

기존 레포 실측: `server.mjs`는 `/api/*`를 **자기 오리진 CORS로 잠그고**(`cors({origin:'https://www.prisincera.com'})`), **Bearer 토큰 → `auth.verifyIdToken` → admin SDK**로 처리한다(`/api/study`·`/api/pacenote` 라우터, `requireTokenEmail` 패턴). M0에서 넣은 `firestore.rules`도 `waymark_*` **deny-all**이다.

> **결정**: Waymark도 **동일 패턴** — 클라이언트는 Firestore를 직접 R/W하지 않는다. 모든 접근은 **`/api/waymark/*` 서버 라우터(requireAuth) → admin Firestore**. Rules는 deny-all 유지(2차 방어).
>
> **문서 정정 필요**: [system_architecture §1](system_architecture.md) 다이어그램의 *"Firestore SDK(Rules 적용 직접 R/W)"* 는 실제 패턴과 불일치 → 환류 시 "서버 REST + admin"으로 수정(rescope §8).

### 1-2. 통합 지점

| 레이어 | 구현 |
| :--- | :--- |
| 클라 라우트 | 기존 `/waymark/app/*`(M0 셸 존재) 확장 + **PWA**(manifest·Service Worker·웹푸시) |
| 서버 | `server.mjs`에 `app.use('/api/waymark', apiLimiter, express.json({limit}), waymarkRouter)` 추가 |
| 인증 | 기존 Bearer→`verifyIdToken` 미들웨어 재사용(`requireAuth`로 일반화) |
| DB | admin Firestore(`getFirestore`) — 기존 init 재사용 |
| 먼저찾아옴 | **Cloud Scheduler → Cloud Run Job**(기존 6 크론과 동일, `cloudbuild.yaml`에 1개 추가) |
| 이메일 | 기존 nodemailer/Gmail SMTP(Daily Digest 엔진) 재사용 |
| 푸시 | FCM 웹푸시(신규·무료) |
| 체험 AI | `/api/waymark/ai/*` 서버 프록시(우리 Groq 키·캡) |

### 1-3. 공통 인증·회원 (재사용 + 분리) ★

인증·세션은 **이미 사이트 공통**이다 — 단일 Firebase Auth + 전역 `AuthContext`(`useAuth`)를 ReLearn(daily·pacenote)과 Waymark가 공유한다. 한 번 로그인하면 전 제품 로그인 상태다. **Waymark는 자체 인증을 만들지 않고 재사용**한다(M0 `WaymarkApp`이 이미 `useAuth()` 사용).

- **공통화 범위(여기까지만)**: ① 인증·세션 = 재사용 ② **로그인 UX(게이트·버튼)를 공통 컴포넌트로 추출**(지금은 Waymark만 자체 게이트 `.wma-gate` — 전 제품 동일 형태로) ③ **얇은 공통 프로필 `users/{uid}`**(정체성: displayName·email·locale·기본 동의)를 두고 uid를 조인키로.
- **분리 유지(얽지 않음)**: 제품 설정은 각자 문서로 — ReLearn 학습 선호 / **Waymark 전용 `waymark_users`**(quietStart·quietEnd·cadence·pushEnabled·emailOptIn·fcmTokens·role). 정체성까지 제품별로 중복하지 않고, 설정까지 공통화하지도 않는다(ReLearn 통합 전철 방지).
- **금지(오버엔지니어링)**: 거창한 통합 계정·멤버십 서비스 신설. 유료 플랜 없음(비용0) → uid 조인으로 충분.
- **온보딩**: 로그인 단계는 **최초 사이트 가입자에게만**. 이미 로그인된 사용자는 Waymark 진입 시 바로 홈(S-2).
- ⚠️ ②③은 **ReLearn까지 건드리는 공통 리팩터** — 병렬 세션과 순서를 조율해 진행.

## 2. 데이터 모델 (MVP 사용분 · M0 재사용)

`waymarkModel.mjs`의 컬렉션 중 MVP 사용: `waymark_users(제품 설정) · decisions(+messages 서브) · decisionEvents · notifications · aiUsage`. **정체성(이름·이메일·로케일)은 공통 `users/{uid}`(§1-3), `waymark_users`는 Waymark 전용 설정만** 보유.
- 쓰기는 **서버에서만**, `waymarkModel`의 enum·LIMITS로 검증 후 `serverTimestamp()`.
- 인덱스: `decisionEvents (status, scheduledAt)` · `decisions (uid, createdAt desc)`.
- `stories*·moderationLogs` = 정의만, MVP 미사용(M2).

## 3. API 엔드포인트 (서버 `/api/waymark`, 전부 requireAuth)

| 메서드·경로 | 기능 | 핵심 동작 |
| :--- | :--- | :--- |
| `POST /decisions` | F-2 결정 생성 | 검증 → 저장 → **T+0 지지 메시지 생성** + **decisionEvents 스케줄**(§5) |
| `GET /decisions` | F-3 타임라인 | uid·상태·도메인 필터, 최신순 페이지네이션 |
| `GET /decisions/:id` | S-4 상세 | 결정 + 동반 메시지 타임라인 |
| `PATCH /decisions/:id` | F-9 회고/상태 | outcome·emotionNow·status(`revisited`/`closed`) 전이 → 잔여 이벤트 조정 |
| `POST /decisions/:id/messages` | 사용자 메모 | `type:'user_note'` 누적 |
| `GET /events/upcoming` | 홈 상단 | 오늘 응답할 체크인/회고 |
| `POST /events/:id/respond` | 알림 응답 | `respondedAt` 기록 → 감쇠 로직 리셋 |
| `POST /ai/companion` | **F-5 체험 AI** | 캡 확인(aiUsage) → 최소맥락 Groq 호출 → 가드레일 → 메시지 저장. 소진 시 402+템플릿 폴백 |
| `PATCH /me` | F-10 설정 | quietHours·cadence·push/email opt·locale |
| `POST /push/register` | 웹푸시 | FCM 토큰 `users.fcmTokens[]` |
| `DELETE /me` | 계정 삭제 | 개인데이터 완전 삭제 |

> 전역: `apiLimiter`(기존) + per-route 바디 제한. BYOK는 **서버 엔드포인트 없음**(§4-c).

## 4. F-5 동반 메시지 — 3경로 상세 (★ 전체 구현)

하나의 **동반 타임라인**(`decisions/{id}/messages`)에 세 소스가 누적된다. 공통 하드룰: **대신 결정하지 않는다** · 위기신호→전문도움 안내 · ReLearn 코치 톤 금지([functional_spec §5](functional_spec.md)).

### 4-a. 템플릿 4톤 (기본·폴백 · LLM 0)
- T-1 위로 / T-2 조언 / T-3 응원 / T-4 정리. 감정·이벤트 규칙으로 **자동 톤 선택** + 사용자 전환.
- i18n 리소스(`ko/en/ja × 톤 × 이벤트`) **변수 치환만**. 네트워크 지연 0.
- 모든 먼저찾아옴 메시지의 기본 경로이자, 체험 AI 소진·BYOK 미연결 시 **폴백**.

### 4-b. 체험 AI (Groq · 서버 프록시 · 캡)
- 경로: 클라 → `POST /api/waymark/ai/companion` → 서버가 **우리 Groq 키**로 호출(키 클라 노출 금지).
- **per-user 캡**(`aiUsage` 원자적 증가) + 전역 레이트리밋. 소진 시 **템플릿 폴백**.
- **무학습·ZDR ON**(Groq Services Agreement §4.2) — **M1-0에서 검증**(블로킹).
- **최소 전송**: 해당 결정의 필요한 최소 맥락만, 식별자·타 결정 금지, **PII 레드액션**.
- **출력 가드레일**: "대신 결정" 금지 후처리 + 위기신호 감지 → 전문도움 템플릿으로 치환.

### 4-c. BYOK (사용자 키 · 지속·심화)
- 사용자가 자기 키 연결 → **브라우저에서 공급자 직접 호출**(CORS 허용 공급자 = OpenAI/Anthropic 1순위). **우리 서버·Firestore 미경유·무로그.**
- 키 보관: **IndexedDB + WebCrypto 암호화**, 원클릭 삭제. 동기화·전송 없음.
- 입력 시 **공급자/티어 경고**(Gemini 무료=학습) + *"프라이버시는 당신 키의 공급자·티어에 달려 있다"* 고지([security_spec §6-2](security_spec.md)).
- CORS 막는 공급자는 **무상태 패스스루**(서버가 키를 메모리에서만 받아 즉시 전달·저장/로그 금지) — 2순위.

### 4-d. 전환 UX
기본 **템플릿** → "AI로 더 깊이"(체험 캡) → 캡 소진·지속 원하면 **BYOK 유도**. 세 경로 모두 같은 하드룰·가드레일 통과.

## 5. 먼저 찾아옴 (F-4) — 생성 + Job

### 5-1. 생성(결정 저장 시)
중요도·cadence로 `decisionEvents` 생성([functional_spec §6](functional_spec.md)): `nudge_support(T+0)·checkin·midterm·retro`. `BASE_SCHEDULE_DAYS × CADENCE_FACTORS`(waymarkModel).

### 5-2. 발송 Job (Cloud Scheduler → Cloud Run Job)
주기 트리거 → 잡이: `status='scheduled'` · 도래 · **조용시간 밖** · 결정 `!=closed` 이벤트 조회 → **템플릿 렌더**(톤×이벤트×도메인) → `messages`·`notifications` 기록 → **①이메일(nodemailer) + ②FCM 웹푸시** → `status='sent'`.
- **멱등**: `(decisionId, type)` 유일 + status 가드.
- **조용시간**: 도래가 조용시간 내면 종료 후 첫 틱 발송(스킵 아님).
- **감쇠/취소**: 2회 연속 미응답→1회 건너뜀, 3회→능동 알림 중단. `closed`→잔여 취소.
- **도달 보증**: 푸시 미허용/iOS 미설치여도 **이메일로 도달**.

## 6. PWA · 웹푸시
- `manifest.webmanifest`(설치), Service Worker(오프라인 기록 큐·푸시 수신).
- iOS는 **홈 화면 설치 시에만** 푸시(16.4+) → 온보딩(S-1)에서 설치 유도.
- FCM 토큰 등록/만료 정리(`users.fcmTokens[]`).

## 7. 보안 게이트 (F-5 전체 → AI 게이트 적용)

- **Rules deny-all 유지** + 서버 requireAuth(`uid` 소유 검증) — IDOR 차단.
- **App Check**(비정상 클라 차단) 적용.
- 체험 AI: **Groq ZDR ON**(M1-0 검증)·최소 전송·PII 레드액션·캡·프롬프트 인젝션 방어.
- BYOK: **서버 미경유 보장**(네트워크 검증)·키 암호화·티어 고지.
- 시크릿: Groq 키·FCM 서버 키·SMTP = **Secret Manager/서버만**. 클라 번들 시크릿 0.
- 전문: [security_spec §6·§12](security_spec.md). M3 전 침투 테스트(IDOR 0).

## 8. 선행 검증 — M1-0 (블로킹) ★

**F-5 전체가 MVP에 들어오므로 아래 확인 전엔 M1 코드 미착수.**

- [x] **Groq ZDR 정책 조사 완료(2026-11-13)** — 공식 Your Data 문서 *“All customers may enable ZDR in Data Controls”*(엔터프라이즈 전용 아님) · 기본 무보존(*“By default, Groq does not retain customer data for inference requests”*) · 무학습(Services Agreement). **잔여(오너 콘솔 2분, 블로킹 아님)**: ① 무료 계정에 Data Controls>ZDR 설정이 실제 보이는지(계약서 “Eligible Customer” 미정의라 확인) ② 사용할 chat completions 엔드포인트가 “ZDR Eligible”인지
- [ ] **체험 캡 수치**(per-user 일/월 호출·토큰, 전역 레이트리밋) 확정
- [ ] **BYOK 공급자 CORS 매트릭스**(OpenAI/Anthropic 브라우저 직접 호출 가능 확인)
- [ ] **FCM 웹푸시 설정**(프로젝트 웹푸시 키·VAPID) 준비
- [ ] **무료 쿼터 초과 기준 + killswitch 연동** 임계치

## 9. 구축 작업 분해 (M1 — 단계별 독립 검증)

| 단계 | 산출물 | 완료 기준(dogfooding) |
| :--- | :--- | :--- |
| **M1-0 선행검증** | §8 전 항목 | 전부 확인/결정 |
| **M1-A 결정 코어** | `/api/waymark/decisions` CRUD · S-3 기록 폼 · S-2 홈 타임라인 · S-4 상세(T+0 템플릿) | "기록되고 타임라인에 보인다" |
| **M1-B 먼저찾아옴** | decisionEvents 스케줄 · Cloud Run Job · 이메일+FCM · S-8 알림 · 조용시간 | "서비스가 먼저 찾아온다(이메일/푸시)" |
| **M1-C 동반 F-5** | 템플릿 4톤 · 체험 AI 프록시+캡 · BYOK(IndexedDB·직접호출) · 가드레일 | "3경로 모두 곁에 있다, 캡·폴백 정상" |
| **M1-D 회고** | S-5 다시 보기 · PATCH 상태 전이 · 그때↔지금 대비 | "루프가 닫힌다" |
| **M1-E 온보딩·설정·PWA** | S-1 온보딩 · S-9 설정 · manifest·SW·설치/푸시 권한 · 계정 삭제 | "설치·알림·프라이버시 동작" |

> 각 단계 뒤 내부 dogfooding. M1 완료 → [mvp_rescope_plan §4](mvp_rescope_plan.md) 증명 게이트 계측(M1.5).

## 10. 일정 (상대 · 솔로 기준 · 러프)

```
M1-0 선행검증 ─ M1-A 코어 ─ M1-B 먼저찾아옴 ─ M1-C 동반F-5 ─ M1-D 회고 ─ M1-E 온보딩/PWA
  (확인)        (기록·홈)    (Job·알림)        (AI 3경로)     (회고)      (설치·설정)
```
- 고정 일자 없음 — 각 단계 dogfooding 통과로 승격. 전체 M1 후 소수 베타(M1.5)로 §4 게이트 계측.

## 11. 미결 (구축)

- [ ] 모드 스위처 UI(탭 vs 칩 vs 자동) 최종안([functional_spec §10](functional_spec.md))
- [ ] 온보딩 첫 결정 강제 vs 선택
- [ ] 오프라인 기록 큐 동기화 충돌 정책
- [ ] 체험 AI 모델(Groq 모델명)·프롬프트 템플릿 확정

---

## 관련 문서
*   [MVP 재범위 결정](mvp_rescope_plan.md) — 범위 In/Out·증명 게이트
*   [기능 명세서](functional_spec.md) · [시스템 아키텍처](system_architecture.md) · [보안·프라이버시 규범](security_spec.md)
*   [제품 전략서](product_strategy.md) · [문서 인덱스](../INDEX.md)
