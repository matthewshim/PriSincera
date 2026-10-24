---
status: draft
domain: Waymark
nav_title: 📜 보안·프라이버시 규범
last_updated: 2026-10-24
version: v0.2
target_files:
  - (신규·미구현) waymark-app/
  - (재사용) 기존 PriSincera Firebase 프로젝트 (Firestore Rules·App Check)
---

# 📜 Waymark 보안·프라이버시 규범 (Security & Privacy Spec)

## 📝 Revision History

| Version | Date | Author | Description | Impact Area |
| :--- | :--- | :--- | :--- | :--- |
| v0.1 | 2026-10-24 | AI Agent | 최초 작성 — Supabase RLS·서버 LLM 전제 | (구) |
| v0.2 | 2026-10-24 | AI Agent | **비용 0 재설계 반영** — 스택 Firebase(Firestore Security Rules·App Check), **MVP에 서버 LLM 없음 → LLM 경유 유출·프롬프트 인젝션 위협이 MVP에 부재**(추후 BYOK 도입 시 §6 적용). 테넌트 격리·프라이버시·컴플라이언스·사고 대응·출시 게이트는 유지·현행화 | 보안 전반 |

---

## 0. 전제 · 원칙

Waymark은 사용자의 **가장 사적인 데이터**(결정·감정·사적 메모)를 다룬다. MVP는 **서버 LLM을 사용하지 않으므로**(규칙·템플릿 기반, [system_architecture §0](system_architecture.md)) 외부 AI로의 데이터 전송이 없다 — 이는 보안·프라이버시상 **큰 이점**이다.

> **원칙 1 — 기밀성 최우선**: 결정·메시지는 본인 외 누구도(다른 사용자·운영자·제3자) 보지 못함이 기본값.
> **원칙 2 — 최소 수집**: 필요한 것만 수집. MVP는 외부 AI 전송 없음.
> **원칙 3 — 공개는 명시 동의로만**: 경험담만 외부 노출(동의+익명화+검수).
> **원칙 4 — 설계로 강제**: 정책이 아니라 **Firestore Security Rules·App Check·게이트**로 구조적으로 강제.

## 1. 데이터 분류

| 등급 | 데이터 | 보호 |
| :--- | :--- | :--- |
| **C1 극민감** | `decisions`(+`messages`), `decisionEvents` | 본인 전용. Security Rules 강제. 로그 마스킹. |
| **C2 민감** | `users`(이메일·설정·FCM 토큰) | 본인 전용. |
| **C3 공개(가공)** | `storiesPublic`(승인 익명 경험담) | 공개 허용 — 동의·익명·검수 통과분만. `authorUid` 비포함. |
| **C4 운영** | `moderationLogs`, 집계 | 운영자 한정. |

## 2. 위협 모델

| 위협 주체 | 시나리오 | 방어 |
| :--- | :--- | :--- |
| **다른 테넌트** | 타 사용자 결정 열람(IDOR) | **Firestore Security Rules**(uid 일치) |
| 외부 공격자 | 인증 우회·비정상 클라이언트 | Firebase Auth + **App Check** + Rules |
| 악의적 제출자 | 경험담 PII·혐오 유포 | 수동 검수 + 신고 + 레이트리밋 |
| 내부자/운영자 | 운영자가 C1 열람 | 운영자도 `decisions` 접근 불가(Rules) · 감사 로그 |
| 공급망 | 의존성 변조 | lockfile·`npm ci --ignore-scripts`·Dependabot |
| LLM 경유 유출·프롬프트 인젝션 | 체험 AI · BYOK | **학습 안 하는 무료 티어(Groq ZDR)만** · 최소 전송 · 인젝션 방어 · BYOK 키 티어 경고(§6) |

## 3. 인증 · 권한 · 테넌트 격리

- 인증: Firebase Auth(Google OAuth). 비밀번호 저장 안 함.
- **App Check**: 앱 무결성 검증으로 비정상 클라이언트의 Firestore 접근 차단.
- **Security Rules**: 모든 C1/C2 문서 `request.auth.uid == resource.data.uid`. **기본 deny**. 규칙 예시는 [system_architecture §8](system_architecture.md).
- 운영자(`role in ['moderator','admin']`)는 `stories`·`moderationLogs`만. **C1(결정·메시지) 접근 불가.**
- 운영자 계정 **MFA 필수**.

## 4. 암호화

- 전송 중 TLS(Firebase 기본). 저장 시 Google 관리형 암호화(기본). 백업 암호화.
- C1 본문 애플리케이션 레벨 추가 암호화 여부는 검색·운영 트레이드오프로 §12 미결(MVP는 Rules 격리로 1차 보호).

## 5. 시크릿 관리

PriSincera 레포 규범([core/security_spec](../core/security_spec.md)) 계승:
- **클라이언트 번들 비밀 금지.** Firebase 웹 config(apiKey 등)는 **설계상 공개 식별자** — 실제 보호는 **Security Rules + App Check**. (Firestore 기본 deny 전제)
- 서버 비밀(FCM 서버 키·Functions 환경변수)은 **서버에만**. 커밋 전 시크릿 스캐너·`.env*` gitignore·로테이션.

## 6. AI 보안 (체험 AI · BYOK) ★

MVP는 AI를 **라이트**하게 쓴다(동반 4톤 체험 + 규칙·템플릿 기본). 민감 데이터(C1)를 다루므로 **공급자·전송·키**를 엄격히 통제한다. (2026-10 각 공급자 ToS 확인 기준)

### 6-1. 체험 AI — 공급자 하드룰
- **학습·보존하지 않는 무료 티어만 허용**: **Groq**(Services Agreement §4.2 계약상 무학습 + ZDR 설정 ON) 1순위 · Cloudflare Workers AI(무학습·무보존, AI Gateway 로깅 OFF) 대안.
- **키 분리**: 체험용 **우리 Groq 키는 서버(Cloud Run 프록시) 전용**(클라이언트 노출 금지). 사용자 BYOK 키는 §6-2.
- **금지**: **Gemini · Mistral · Cohere 무료 티어** — 입력을 **학습에 사용**(일부 사람 검토) · 개인정보 부적합. 구글은 *"Unpaid Services에 민감·개인정보 제출 금지"* 명시.
- **최소 전송**: 해당 결정의 필요한 최소 맥락만. 식별자·타 결정 전송 금지. PII 레드액션.
- **캡·격리**: 무료 쿼터는 **조직 단위 공유** → **per-user 캡 + 전역 레이트리밋**, 소진 시 **템플릿 폴백**.

### 6-2. BYOK — "BYOK ≠ 프라이버시"
- 사용자 키로는 **그 사용자의 공급자 약관·티어가 데이터를 지배**한다. 따라서:
  - **무학습 기본 공급자(OpenAI/Anthropic API) 권장** · **Gemini 무료 키는 경고**(학습·사람 검토).
  - *"프라이버시는 당신 키의 공급자·티어에 달려 있다"*를 **명시 고지**.
- **키 보관**: 클라이언트/로그 노출 금지, 암호화 저장 또는 **비저장(단기 메모리)**. 키 유출은 우리 책임.
- 앱은 공급자 **사용정책 준수·남용 방지** 의무를 BYOK라도 별도로 진다.
- **호출 경로**: 공급자가 브라우저 직접 호출(CORS)을 허용하면 **클라이언트 직접**(서버 미경유). 막으면 **무상태 패스스루**(서버가 키를 메모리에서만 받아 즉시 전달·저장/로그 금지). 1순위 = CORS 허용 공급자(OpenAI/Anthropic).

### 6-3. 공통
- 출력 가드레일("대신 결정" 금지 · 위기 신호→전문 도움 안내) · 프롬프트 인젝션 방어(입력/지시 분리) · 로깅 마스킹.

## 7. 경험담 · 커뮤니티 보안

- **공개 3중 관문**: 명시 동의 → (MVP) **사람 검수** → 승인분만 `storiesPublic`. (급증 시 선필터는 추후)
- **익명성**: 공개는 `authorUid` 비포함 뷰(`storiesPublic`). 역추적 차단.
- PII/도싱 경고(제출 시) + 검수 체크리스트. 신고→재검수·즉시 비공개. 제출 레이트리밋.

## 8. 프라이버시 · 컴플라이언스

- **적용 법규(가정)**: 개인정보보호법(**PIPA**) 1차, 국외 사용자 시 GDPR(§12 확정).
- 동의: 가입 시 처리방침·약관. 경험담 공개는 **별도 명시 동의**.
- 정보주체 권리: 열람·정정·**삭제(계정 삭제 시 개인데이터 완전 삭제)**·**이동(내보내기)**. 익명 승인 경험담은 분리 보존 선택.
- 보존 기간: 비활성 계정·로그 정책 수립. **MVP는 외부 AI 미사용으로 제3자 전송 범위가 좁음**(DPA 범위 축소: Google/Firebase 위탁 중심).
- 처리방침 공개 페이지 제공(Sylphio 선례).

## 9. 로깅 · 감사 · 모니터링

- 감사 로그: 검수·권한 변경·삭제·내보내기 등(`moderationLogs` + audit).
- 민감정보 로그 금지(C1 평문·시크릿). 인증 실패 급증·대량 조회 이상탐지.

## 10. 백업 · 재해복구(DR)

- Firestore 관리형 백업(예약 내보내기)·복구 리허설. RPO ≤ 24h, RTO ≤ 수시간(규모 따라 §12).

## 11. 사고 대응 (요지)

**탐지 → 격리 → 규명 → 복구 → 통지.**
- 데이터 유출(C1/C2): 접근 차단(Rules·키 폐기)·범위 규명·**PIPA 통지 의무 확인**·재발 방지.
- 경험담 사고(PII 노출): 즉시 비공개→재검수→통지.
- 연 1회 사고 대응 훈련.

## 12. 출시 전 보안 게이트 (M3 비공개 베타 전 필수)

- [ ] 전 C1/C2 **Firestore Security Rules + App Check** 적용, 침투 테스트(IDOR: 타 사용자 접근 0건)
- [ ] 클라이언트 번들 시크릿 0건
- [ ] 경험담 공개 `storiesPublic` 뷰 익명성(역추적 불가) 검증
- [ ] 개인정보 처리방침·약관·동의 플로우 완비
- [ ] 삭제·내보내기(정보주체 권리) 동작 검증
- [ ] 감사 로그·백업·사고 대응 런북 완비
- [ ] (BYOK AI 도입 시) §6 AI 보안 게이트 추가 통과

## 13. 미결 결정 (보안·법무)

- [ ] 적용 법규 범위(국내 전용 vs 국외 → GDPR)
- [ ] C1 필드 레벨 암호화 도입 여부
- [ ] 데이터 보존 기간·비활성 정책 수치
- [ ] AI 심화(BYOK) 도입 시 §6 세부 설계·키 보관 방식
- [ ] 외부 침투 점검 시점·범위

---

## 관련 문서
*   [🏗️ 시스템 아키텍처](system_architecture.md) · [📋 기능 명세서](functional_spec.md)
*   [📜 저장소 보안 규범](../core/security_spec.md) — 시크릿 위생(계승)
*   [🚀 추진계획서](execution_plan.md) · [📚 문서 인덱스](../INDEX.md)
