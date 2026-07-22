---
status: active
domain: Core
last_updated: 2026-07-22
version: v1.0
target_files:
  - src/pages/AdminDashboard.jsx
  - src/components/admin/ServiceDocs.jsx
  - admin-api.mjs
  - server.mjs
---

# 📐 Admin 콘솔 메뉴·기능 명세서 (Admin Console Spec)

## 📝 Revision History

| Version | Date | Author | Description | Impact Area |
| :--- | :--- | :--- | :--- | :--- |
| v1.0 | 2026-07-22 | AI Agent | 리런 통합 반영 메뉴 재편 명세 최초 작성 — 그룹 4→3(Common·Builder's Log·ReLearn)·탭 10→8, 파이프라인 탭 흡수·학습자 현황 통합, 죽은 API 제거·이메일 브랜딩 리런 전환 | AdminDashboard, admin-api, server |

---

## 1. 배경 — 왜 재편하는가

사용자향 웹은 2026-07-20 리런(ReLearn) 통폐합 Phase 1~3으로 승계가 완료되었으나(구 `/daily`·`/pacenote`는 서버 301), Admin 사이드바는 통합 전 구조(Common / Builder's Log / **Daily Digest** / **Pace Note** 4그룹 10탭)를 유지하고 있었다.

전수 조사 결과 **기능이 죽은 탭은 없다** — 리런은 별도 저장소 없이 기존 Daily·PaceNote API를 셸로 소비하므로, Admin이 관리하는 데이터(구독자·시그널/어학 콘텐츠·테크 트랙·pacenotes·AI 추천 풀)는 전부 리런 화면의 실소스다. 따라서 재편 원칙은 다음 세 가지다.

1. **기능 보존**: 탭·API 기능은 제거하지 않는다. 그룹핑과 명칭만 리런 기준으로 재구성한다.
2. **루프 기준 재그룹**: Daily Digest·Pace Note 그룹을 **ReLearn 단일 그룹**으로 병합한다.
3. **중복 통합**: 읽기 전용·동일 데이터 기반 탭(파이프라인, 유저 목표 인사이트)은 인접 탭에 흡수한다.

## 2. 메뉴 구조 (v1.0 확정)

1Depth 그룹 순서는 프론트 GNB와 동일하게 **Common → Builder's Log → ReLearn**.

| 그룹 | 탭 id | 라벨 | 기능 요약 | 주요 API (`/admin/api`) |
| :--- | :--- | :--- | :--- | :--- |
| Common | `overview` | 📊 대시보드 | 통계 카드·발송 추이·Builder's Log Top10 | `/stats` `/pipeline/status` `/pristudy/stats` `/builderslog/stats` `/email/logs` |
| Common | `docs` | 📖 서비스 문서 | docs 허브 — md 인라인 편집·GitHub 커밋 | `/docs/history` `/docs/save` |
| Common | `admins` | 🔐 관리자 (super_admin 전용) | 관리자 계정 CRUD | `/admins` CRUD |
| Builder's Log | `builderslog` | 📝 아티클 퍼블리싱 | AI 윤문·번역·GitHub 발행 | `/builderslog/*` |
| ReLearn | `content` | 📚 배움 콘텐츠 | 서브탭 3종 — 아래 §3-1 | `/daily/*` |
| ReLearn | `subscribers` | 📧 구독·발송 | 구독자·발송 이력·테스트 발송·CSV | `/subscribers*` `/email/*` |
| ReLearn | `pacenotes` | ⛵ 학습자 현황 | Pacer 테이블 + 목표 인사이트(통합) — §3-2 | `/pacenotes/users` `/pacenotes/insights` |
| ReLearn | `pacenote_pool` | 🎯 AI 추천 풀 | 추천 궤도 풀 CRUD·파이프라인 실행 로그 | `/pacenotes/pool` |

## 3. 통폐합 상세

### 3-1. `content` — 배움 콘텐츠 (서브탭 3종)

리런 "배움 스테이지"의 콘텐츠 소스를 한 탭에서 관리한다. **기본 서브탭은 `track`** — 매일 자동 생성되는 운영 대상이 우선이다(구 기본값 `legacy`에서 교체).

| 서브탭 id | 라벨 | 내용 | 저장소 |
| :--- | :--- | :--- | :--- |
| `track` | 🛰️ 테크 트랙 | tech-composer 산출물 모니터링·수동 생성 트리거·검수 | GCS `daily/junior_·senior_*.json` |
| `legacy` | ✍️ 수동 콘텐츠 | IT 시그널·AI 프롬프트·어학 문장 CRUD (이메일 발송 소스 겸용) | Firestore `daily_signals` `study_content` |
| `pipeline` | ⚙️ 수집 파이프라인 | Collector 상태·최근 7일 수집 현황 (읽기 전용) | GCS `daily/index.json` |

> 구 독립 탭 `pipeline`은 추가 API 없이 overview의 `/pipeline/status` 응답을 재표시하던 화면이므로 서브탭으로 흡수했다. 장기적으로 이 서브탭을 컴포저 4종(collector·composer·study·tech·pacenote) 통합 모니터로 확장할 수 있다.

### 3-2. `pacenotes` — 학습자 현황 (2탭 → 1탭)

구 `pacenotes`(Pacer 현황)와 `pacenote_insights`(유저 목표 인사이트)는 모두 읽기 전용이며 동일한 `pacenotes/{uid}/weeks` 컬렉션의 상이한 집계였다. 한 탭에서 **상단 = 유저별 주차·미션 테이블, 하단 = 커스텀 목표 인사이트 섹션**으로 통합한다. 인사이트의 poolStats는 AI 추천 풀 탭에도 표시되므로 정보 손실이 없다.

### 3-3. 구 → 신 매핑

| 구 (그룹 / 탭) | 신 (그룹 / 탭) |
| :--- | :--- |
| Daily Digest / 구독 및 이메일 발송 | ReLearn / 📧 구독·발송 |
| Daily Digest / 콘텐츠 관리 (legacy 기본) | ReLearn / 📚 배움 콘텐츠 (track 기본) |
| Daily Digest / 파이프라인 (독립 탭) | ReLearn / 배움 콘텐츠 › ⚙️ 수집 파이프라인 서브탭 |
| Pace Note / Pacer 현황 | ReLearn / ⛵ 학습자 현황 (상단) |
| Pace Note / 유저 목표 인사이트 | ReLearn / ⛵ 학습자 현황 (하단 통합) |
| Pace Note / AI 추천 풀 관리 | ReLearn / 🎯 AI 추천 풀 |

## 4. 함께 정리한 부채

| 항목 | 조치 | 근거 |
| :--- | :--- | :--- |
| `PUT /admin/api/profile` | **제거** | 프론트가 Firebase Identity Toolkit REST를 직접 호출하도록 변경된 뒤 완전 미사용(죽은 API) |
| `POST /admin/api/daily/tracks/:date` | **유지 + 용도 주석 명시** | Admin UI 미호출이나 외부 클라이언트(macOS 앱)·파이프라인의 GCS write 경로로 설계된 엔드포인트 |
| 발송 메일 CTA `…/daily/${date}` | `…/relearn/daily/${date}`로 전환 | 301 의존 제거 + 리런 브랜딩 — [product_strategy \\#Phase E](../relearn/product_strategy.md)의 "유일한 파이프라인 접점" 해소 |
| 메일·언서브 페이지 "Daily Digest" 문구 | ReLearn 브랜딩으로 교체 | 승계 후 명칭 일원화 |

## 5. 운영 참고 (불변 사항)

- 마운트: `/admin/api`(admin-api.mjs), rate limit 15분/100, JSON 1mb — `server.mjs`.
- 인증: Firebase 토큰 + `admin_config/settings.admins` 화이트리스트(`requireAdmin`), `admins` 탭은 `super_admin` 롤 전용.
- 사용자향 API(`/api/study`, `/api/pacenote`, `/api/daily/*`, `/api/subscribe*`)는 본 재편과 무관하게 현행 유지.
- 고아 컴포넌트 4종(DailyIntro·DailyCalendar·PaceNoteWeeklyCalendar·PaceNoteChronoRibbon)은 [task_backlog 6-1](task_backlog.md) 결정(보존, 6개월 후 재검토)에 따라 본 재편 범위에서 제외.
