---
status: deferred
domain: Infra / Migration
last_updated: 2026-08-02
version: v1.1
target_files:
  - server.mjs
  - pacenote-api.mjs
  - study-api.mjs
  - admin-api.mjs
  - src/firebase.js
  - src/contexts/AuthContext.jsx
  - src/hooks/usePaceNoteData.js
  - pipeline/src/lib/firestore.mjs
  - pipeline/src/*.mjs
---

# 🚚 인프라 이관 추진계획서 — GCP → Cloudflare Pages + Supabase + GitHub Actions

> **한 줄 요지**: 종량제 GCP(Cloud Run·Firestore·GCS·Firebase Auth·Cloud Scheduler)에서 **billing 폭탄이 원리적으로 불가능한**(초과 시 과금이 아닌 정지/스로틀) **상업용 허용 무료 티어** 스택 — **Cloudflare Pages + Supabase + GitHub Actions** — 로 전면 이관한다. 기존 데이터는 **포기(클린 슬레이트)** 하므로 ETL·듀얼라이트·데이터 동기화가 **전혀 없다**(최대 단순화).

## ⛳ 결정 (2026-08-02) — 이관 보류, GCP 유지

**이 이관은 실행하지 않기로 결정했다.** 검토 결과 목표(≈₩0 + 폭탄 방지)는 이전 없이 **GCP 수술**로 달성했다:
- `prisincera-web` **min-instances 0** → 저트래픽 상시비용 ≈₩0 (터무니없던 비용의 주범 제거)
- **예산 가드레일 + 무인 킬스위치**(예산 100% 시 billing 자동 해제)로 폭탄 방지 — [operations_runbook §4-b](../core/operations_runbook.md)

이전(수 주 재작성)은 같은 결과에 노력이 과도했고, "GCP 탈출"의 유일한 실익은 하드캡뿐인데 킬스위치로 사실상 대체됐다. **파이프라인 잡의 GitHub Actions 이관**도 초안까지 검토했으나 함께 보류(작업 파일 미보존 — 필요 시 본 계획 기준 재작성) — 조직 보안 정책(`iam.disableServiceAccountKeyCreation`·`iam.allowedPolicyMemberDomains`)이 외부 인증을 막고, 절감액(월 ₩500~1,500)이 정책 완화 리스크를 정당화하지 못함.

> 이 문서는 **폐기가 아니라 보존**한다 — 향후 완전한 하드캡이 필요하거나 GCP를 떠날 다른 이유가 생기면 이 설계를 꺼내 쓴다.

## 📝 Revision History

| Version | Date | Author | Description |
| :-- | :-- | :-- | :-- |
| v1.0 | 2026-08-02 | AI Agent | 초안 — 조정안(Cloudflare+Supabase) 상세 이관 계획, 7-Phase 체크리스트 로드맵 |
| v1.1 | 2026-08-02 | AI Agent | **status → deferred(보류)** — GCP 수술+킬스위치로 목표 달성, 이전·GH Actions 이관 모두 보류. 참조용 보존 |

---

## 1. 배경 · 목표 · 원칙

- **왜 이관하나**: (1) GCP billing 비활성으로 서비스 중단, 저트래픽 대비 과도한 비용. (2) 종량제라 예산 상한을 걸어도 "폭탄" 가능성이 남아 **심리적 리스크**가 큼. (3) 사이트가 상용 제품(**Sylphio**, Mac App Store) 페이지를 호스팅 → **commercial use** → Vercel Hobby(비상업 전용) 불가.
- **목표**: 저트래픽 기준 **월 ≈ $0**, **폭탄 원천 차단**, **상업용 허용**.
- **원칙**:
  1. **하드캡 무료 티어만** 채택 — 초과 시 과금이 아니라 정지/스로틀되는 플랫폼(Cloudflare·Supabase·GitHub Actions).
  2. **데이터 클린 슬레이트** — 기존 Firestore 데이터(구독자·유저 이력) 포기. → ETL 0, 이관 난이도 급감.
  3. **SEO/URL 무손실** — 기존 경로·canonical·301·sitemap 보존.
  4. **점진·롤백 가능** — 스테이징 검증 후 DNS 전환, GCP는 유예기간 롤백 여지 남기고 최종 폐기.

## 2. 현재 → 목표 아키텍처 매핑

| 계층 | 현재 (GCP) | 목표 | 상업용 무료 |
| :-- | :-- | :-- | :--: |
| 프론트(SPA) | React/Vite @ Cloud Run(Express 정적 서빙) | **Cloudflare Pages** | ✅ |
| API/서버로직 | Express (`server.mjs`·`pacenote-api.mjs` 등) | **Supabase Edge Functions**(Deno) + 클라이언트 직결(RLS) | ✅ |
| 인증 | Firebase Auth (Google) | **Supabase Auth** (Google OAuth) | ✅ |
| DB | Firestore (NoSQL) | **Supabase Postgres** | ✅ |
| 스토리지 | GCS `prisincera-prisignal-data` | **Supabase Storage** | ✅ |
| 배치 Job | Cloud Scheduler + Cloud Run Jobs | **GitHub Actions cron** (초안 작성 완료) | ✅ |
| 이메일 | nodemailer SMTP + Buttondown | **SMTP 유지** (또는 Resend 무료) | ✅ |
| AI | Gemini(`generativelanguage`) | **Gemini 유지** — 단, AI Studio **무료 티어 신규 키** | ✅ |
| 시크릿 | Secret Manager | GitHub Secrets · Supabase env · CF Pages env | — |

## 3. 핵심 결정 · 전제

- **데이터 포기 확정** → 마이그레이션 ETL 없음. 신규 가입·신규 콘텐츠부터 시작.
- **Gemini 키 분리**: 기존 키가 `prisincera` 프로젝트에 청구되면 폐기 대상. **Google AI Studio 무료 티어 키**를 새로 발급(레이트리밋만 있고 과금 없음).
- **Supabase 리전**: `ap-northeast-2`(서울) 우선, 없으면 `ap-northeast-1`(도쿄).
- **Supabase 무료 티어 7일 비활성 정지** → **일일 GitHub Actions Job이 매일 DB를 건드려 keep-alive** 겸용(별도 조치 불필요).
- **API 표면 축소**: DB·Auth가 Supabase로 가면 다수 읽기 경로는 **RLS 보호 하의 클라이언트 직결**로 대체 → Edge Function은 쓰기·AI·보호 로직만.
- **도메인/DNS**: 현 네임서버 위치 확인 후 Cloudflare로 이전 검토(무료, 관리 일원화).

## 4. 단계별 로드맵 (체크리스트)

> 각 Phase는 독립 진행·검증 가능. Phase 1(데이터 모델)과 Phase 3(API 이식)이 가장 큰 덩어리.

### Phase 0 — 준비 (계정 · 환경)
- [ ] Cloudflare 계정 + Pages 프로젝트 생성(GitHub repo 연결)
- [ ] Supabase 계정 + 프로젝트 생성 (리전: 서울/도쿄)
- [ ] Google AI Studio에서 **새 Gemini API 키**(무료 티어) 발급 — 기존 GCP 키와 분리
- [ ] 이메일 경로 확정 (기존 SMTP 유지 vs Resend 무료 티어)
- [ ] 현 DNS/도메인 등록기관 확인, Cloudflare 이전 여부 결정
- [ ] 로컬 개발환경: `supabase` CLI 설치, 로컬 Postgres 기동
- **DoD**: 3개 플랫폼 빈 프로젝트 준비 + 새 Gemini 키 확보

### Phase 1 — 데이터 모델 (Supabase Postgres 스키마) ★최대 덩어리
- [ ] 컬렉션 → 테이블 설계 (아래 §매핑)
  - `subscribers` (email PK, status, subscribed_at, unsubscribe_token, meta jsonb)
  - `profiles` (user_id PK → auth.users, domain_affinity jsonb, completion jsonb, practice jsonb, streak jsonb, reflections jsonb, level, updated_at)
  - `activity_days` ( (user_id, date) PK, current_pace jsonb, recommended_pace jsonb, statement text, created_at ) — Firestore `pacenotes/{uid}/days/{date}` 대체
  - `daily_content` (date PK, signal jsonb, study jsonb) — `daily_signals`·`study_content` 통합(또는 Storage)
  - `recommendation_pool` (id PK 단일행, pool jsonb) — `config/pacenote_daily_pool`
  - `study_progress`, `builderslog_stats`, `email_logs` — 필요 시 테이블화(저우선)
  - ~~`weeks` 레거시 아카이브~~ — 데이터 포기로 **생략**
- [ ] **RLS 정책**: 유저 데이터는 `auth.uid() = user_id` 인 행만 접근
- [ ] 공개 콘텐츠(`daily_content`) 읽기 공개 / 쓰기는 `service_role`(Job)만
- [ ] 인덱스: `activity_days(user_id, date desc)` 등
- [ ] SQL 마이그레이션 파일 (`supabase/migrations/*.sql`) 작성·적용
- **DoD**: 빈 DB에서 스키마·RLS 적용, 기본 CRUD·권한 격리 검증

### Phase 2 — 인증 (Firebase Auth → Supabase Auth)
- [ ] Supabase Auth **Google OAuth** provider 활성화 (client id/secret)
- [ ] 리다이렉트 URI 등록 (CF Pages 스테이징·프로덕션 도메인)
- [ ] 프론트: `src/firebase.js` → `src/lib/supabase.js` (`createClient`)
- [ ] `AuthContext.jsx`: `onIdTokenChanged/signInWithPopup` → `supabase.auth.onAuthStateChange/signInWithOAuth`
- [ ] 토큰 검증: `firebase-admin verifyIdToken` 제거 → Edge Function은 Supabase JWT 자동검증, RLS는 `auth.uid()`
- [ ] 기존 유저 없음(포기) → 신규 가입만, 마이그레이션 불필요
- **DoD**: Google 로그인 → Supabase 세션 → RLS 격리 동작

### Phase 3 — API / 서버 로직 (Express → Edge Functions + 클라이언트 직결) ★큰 덩어리
- [ ] **읽기 직결**(Supabase JS + RLS): 프로필·오늘 활동·타임라인·데일리 콘텐츠 조회
- [ ] **Edge Function(Deno)** 로 이식(쓰기·AI·보호):
  - pacenote: `toggle`·`add`·`add-orbit`·`accept`·`exclude`·`restore`·`diary`·`day`·`profile`
  - `subscribe`·`unsubscribe`
- [ ] `pacenote-api.mjs` 로직 포팅 (`db.collection` → `supabase.from(...)`), 순수 로직(`replenishRecommendations`·`recordSignal`·`fixCategories`·practice-stats) 재사용
- [ ] `usePaceNoteData` 훅: `fetch('/api/pacenote/*')` → `supabase.functions.invoke` 또는 직결 쿼리
- [ ] `server.mjs`의 SSR 메타·301 → CF Pages `_redirects` + 정적 메타(또는 Pages Functions)
- **DoD**: 전 엔드포인트 동등 기능 + RLS 권한 격리 검증

### Phase 4 — 스토리지 (GCS → Supabase Storage)
- [ ] daily content 버킷 생성 (public read)
- [ ] 읽기(`/api/daily/*`) → Supabase Storage 또는 `daily_content` 테이블
- [ ] Job 쓰기 경로 전환
- **DoD**: 데일리 콘텐츠 조회·생성 동작

### Phase 5 — 파이프라인 Job (GitHub Actions + Supabase)
- [ ] 데이터층 `pipeline/src/lib/firestore.mjs` → `lib/supabase.mjs` (`@supabase/supabase-js`, `service_role` 키)
- [ ] GCS 접근 → Supabase Storage
- [ ] collector·composer·study·tech·pacenote·monitor 각 스크립트 데이터 호출 치환
- [ ] GH Actions 워크플로 작성(파일 미보존 — 본 계획 기준 재작성) — env를 `SUPABASE_URL`·`SUPABASE_SERVICE_ROLE_KEY`·새 `GEMINI_API_KEY`·SMTP로 (GCP 인증 불필요)
- [ ] cron 시각 확정(기존 스케줄 참고), 일일 Job의 Supabase 접근이 keep-alive 겸용
- [ ] Gemini·SMTP 로직 불변
- **DoD**: 수동 실행으로 데일리 콘텐츠·추천·이메일 산출이 기존과 동등

### Phase 6 — 프론트 배포 (Cloudflare Pages)
- [ ] 빌드 설정 (`vite build`, output `dist`)
- [ ] 환경변수 (`VITE_SUPABASE_URL`·`VITE_SUPABASE_ANON_KEY`)
- [ ] SPA 라우팅: `public/_redirects` → `/* /index.html 200`
- [ ] 기존 301(`/daily/:date`→`/relearn/...`·`/pacenote`→`/relearn` 등) → `_redirects` 규칙 이식
- [ ] 커스텀 도메인 연결 + DNS, `sitemap`·`robots`·canonical 확인
- **DoD**: 스테이징 도메인에서 전 페이지·인증·API 정상

### Phase 7 — 컷오버 & GCP 폐기
- [ ] 스테이징 전수 검증(인증·CRUD·Job·이메일·SEO·무료 한도)
- [ ] 프로덕션 DNS를 Cloudflare Pages로 전환
- [ ] 초기 모니터링(에러율·무료 티어 소진)
- [ ] GCP 폐기 순서: Cloud Scheduler·Run·Jobs 삭제 → GCS·Firestore 삭제 → 프로젝트 삭제(또는 billing 해제 유지)
- [ ] 유예기간 롤백 여지 유지 후 최종 삭제
- **DoD**: 프로덕션 신규 스택 가동, GCP 비용 0, 폭탄 리스크 제거

## 5. 리스크 & 대응

| 리스크 | 대응 |
| :-- | :-- |
| Firestore(NoSQL)→Postgres 스키마 재설계 오류 | jsonb로 문서형 필드 흡수(점진), Phase 1 CRUD 테스트 우선 |
| RLS 오설정(보안) | 유저 테이블 전부 `auth.uid()` 정책 + 부정 접근 테스트 케이스 |
| Deno Edge Function 런타임 차이(firebase-admin 등 미동작) | supabase-js는 Deno 호환, Node 전용 의존 제거·대체 |
| Supabase 무료 7일 비활성 정지 | 일일 Job이 매일 DB 접근 → 자동 keep-alive |
| SEO/URL 손실 | `_redirects`로 301 전수 이식, canonical·sitemap 검증 |
| Gemini 키 청구 이원화 | AI Studio 무료 티어 키로 분리, 기존 GCP 키 폐기 |
| 이메일 도달률 | SMTP 유지 or Resend, SPF/DKIM 확인 |
| 컷오버 중 다운타임 | 스테이징 완비 후 DNS 전환(짧은 TTL), 롤백은 DNS 원복 |

## 6. 무료 티어 한도 점검 (저트래픽 가정)

| 플랫폼 | 무료 한도(대략) | 예상 사용 | 초과 시 |
| :-- | :-- | :-- | :-- |
| Cloudflare Pages | 정적 요청/대역 무제한, 빌드 500/월 | 여유 | 빌드만 제한 |
| Supabase | DB 500MB, 저장 1GB, 대역 5GB, 50k MAU, 7일 비활성 정지 | 여유(keep-alive로 정지 회피) | **정지/제한(과금 아님)** |
| GitHub Actions | 프라이빗 2,000분/월 | 하루 수 분 | 실행만 제한 |
| Gemini(AI Studio) | RPM/일일 레이트리밋(무료) | 배치 호출 | **스로틀(과금 아님)** |

> 결제수단 미등록 상태면 세 플랫폼 모두 **원리적으로 청구 불가** — 트라우마 해소 요건 충족.

## 7. 롤백 전략

- 각 Phase는 GCP 프로덕션에 무영향(신규 스택에서 구축).
- 컷오버는 **DNS 전환 1건** — 문제 시 DNS 원복으로 즉시 롤백(단, GCP billing 재링크 필요).
- GCP 리소스는 **컷오버 검증 후에만** 삭제, Firestore는 유예기간 내 재활성 가능.

## 8. 성공 지표

- 월 인프라 비용 **≈ $0**, 결제수단 미등록으로 **폭탄 불가**.
- 전 기능(배움·실행·복기·구독·데일리 생성·이메일) 신규 스택에서 동등 동작.
- SEO 무손실(핵심 URL·canonical·sitemap 유지).
- Supabase 무료 티어 내 안정 운영(keep-alive로 정지 없음).

## 9. 참조

- Job 이관: GitHub Actions 워크플로(daily·weekly + README) 초안까지 검토 후 보류 — 파일 미보존, 필요 시 재작성
- 기존 데이터 계약(스키마 매핑 출처): `docs/data_contract_v2.md`
- 현행 파이프라인/추천: `docs/pacenote/ai_recommendation_engine.md`
