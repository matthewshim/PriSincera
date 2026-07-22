---
status: active
domain: Core
last_updated: 2026-07-22
version: v2.4
target_files: []  # 작업 백로그 — 특정 코드 미지배
---

# 🗺️ 잔여 작업 백로그 (Task Backlog)

## 📝 Revision History

| Version | Date | Author | Description | Impact Area |
| :--- | :--- | :--- | :--- | :--- |
| v1.0 | 2026-07-20 | AI Agent | 리런 통폐합(Phase 1~3) 완료 시점의 잔여 작업 정본 목록 최초 작성 | 전 도메인 |
| v1.1 | 2026-07-21 | AI Agent | 1-1·1-2 검증 완료(아카이브 SSR 메타 결함 발견·수정 포함), 2-1 완료 | server.mjs, ReLearnDaily |
| v1.2 | 2026-07-21 | AI Agent | 1-3 리팩터 완료 — 셸 607→431줄 + 스테이지 컴포넌트 4종 분리 | ReLearn 컴포넌트 구조 |
| v2.0 | 2026-07-21 | AI Agent | **실행 가능 항목 전량 소진** — 3구간(타이포 그리드 v5.6)·4-1(카테고리 OG)·6구간 결정 확정. 잔여는 외부 의존·대공사만 | 전 도메인 |
| v2.1 | 2026-07-22 | AI Agent | 7구간(Admin 콘솔 리런 정합화) 신설 — 메뉴 재편·중복 탭 통합·죽은 API 제거·이메일 브랜딩 전환 | AdminDashboard, admin-api, server |
| v2.2 | 2026-07-22 | AI Agent | 8구간(아카이브 상세 UI 재편) 신설·P1/P2 완료 — 훑어보기 기본 + 브리핑 히어로 + 스티키 채널 내비, 기본 상태 페이지 높이 9,753→6,099px(-37%, 첫 스크린 오버뷰 완결) | ReLearnDaily, SignalSection, DailyBriefing |
| v2.3 | 2026-07-22 | AI Agent | 9구간(docs 최신화 전수 감사·정합화) 신설·완료 — 사실 오류 3건(개요·인증·INDEX)·target_files 삭제파일 잔존·archived 2종 이동 등 일괄 해소 | docs 전반 |
| v2.4 | 2026-07-22 | AI Agent | 8-7 완료 — 아카이브 상세 헤더 §9-1 히어로 정합 + 주간 달력 스트립(DailyWeekStrip) 교체 (design_system v5.9 동반) | ReLearnDaily, DailyWeekStrip |

> **운영 규칙**: 본 문서가 잔여 작업의 단일 정본(SSOT)입니다. 작업 착수·완료 시 상태를 갱신하고, 완료 항목은 ~~취소선~~ + 완료일을 남깁니다. 새 작업은 우선순위 표에 추가하십시오.

---

## 1. 🔴 최우선 — 통폐합 직후 검증·후속

| # | 작업 | 성격 | 비고 |
| :--- | :--- | :--- | :--- |
| ~~1-1~~ | ~~배포 검증~~ | ✅ 2026-07-21 | 301 3종·리런 SSR·사이트맵(80건/구 URL 0) 라이브 검증. **아카이브 상세 SSR 메타 결함 발견**(Phase 3의 PAGE_META 삭제가 server.mjs 참조를 깨뜨림 — src/만 검증한 누락) → 폴백 보장 구조로 수정 |
| ~~1-2~~ | ~~빌드 로그 `[design-check] PASS` 확인~~ | ✅ 2026-07-21 | 게이트 도입 이후 커밋들이 라이브 반영됨(사이트맵 이관 확인) = 게이트 통과 간접 검증 |
| ~~1-3~~ | ~~ReLearn.jsx 스테이지별 컴포넌트 분리 리팩터~~ | ✅ 2026-07-21 | 셸(상태·핸들러) 431줄 + LearnStage(112)·RunStage(30)·ReflectStage(25)·RecordsView(76) 분리. 로컬 node 부재로 정적 검증만 수행 — **빌드 게이트(vite build)가 최종 검증**(실패 시 배포 차단·라이브 무영향) |
| 1-4 | 서치콘솔 색인 전환 모니터링 (`/daily/:date` → `/relearn/daily/:date`) | 운영(수 주) | 301 효과 추적 |
| 1-5 | 소셜 OG 캐시 재스크랩 (카카오·페이스북 디버거) | 사용자 액션 | 새 Star Prism OG 카드 반영 |

## 2. 🟠 리런 품질 (데이터 기반 판단)

| # | 작업 | 비고 |
| :--- | :--- | :--- |
| ~~2-1~~ | ~~ReLearnDaily 이전/다음 날짜 네비게이션~~ | ✅ 2026-07-21 — /api/daily/index 기반 |
| 2-2 | GA 퍼널 검증: `learn_expand`·`learn_more`·`orbit_add/exclude/restore` 데이터로 콤팩트 축약 강도 조정 | ⏳ **외부 의존(GA 데이터 축적·조회 권한)** — 데이터 확인 가능 시 진행 |

## 3. 🟡 디자인 시스템 백로그 (design_system.md §9-7 연동)

| # | 작업 | 상태 |
| :--- | :--- | :--- |
| ~~3-1~~ | ~~헤딩 스케일 확장~~ | ✅ 2026-07-21 v5.6 — 0.05 그리드 전면 등재(30단)·전량 토큰화(비토큰 0) |
| ~~3-2~~ | ~~장식 마이크로·px 잔존~~ | ✅ 2026-07-21 v5.6 — --fs-050~065 등재, px 4건 스냅 |
| ~~3-3~~ | ~~호버 12종 정렬~~ | ✅ 2026-07-21 — 재감사 결과 주 표면 소멸, 챕터 카드는 §9-3 '액센트형' 공인(정렬 불채택) |
| ~~3-4~~ | ~~PaceNote 히어로 3.5rem 상충~~ | ✅ 2026-07-20 Phase 3 파일 삭제로 자연 해소 |

## 4. 🟢 SEO·브랜드 백로그 (seo_meta_standard.md §9 연동)

| # | 작업 | 비고 |
| :--- | :--- | :--- |
| ~~4-1~~ | ~~카테고리별 OG 이미지~~ | ✅ 2026-07-21 — 3종 생성·PAGE_META 매핑, 제너레이터 ci/ 등재 |
| 4-2 | 언어별 SSR 본문 | ⏳ **계획 수립 완료(2026-07-21)** — [i18n_ssr_plan.md](i18n_ssr_plan.md) 참조. URL 전략(B안)·착수 범위 등 결정 4건 대기 |

## 5. 🔵 Sylphio (외부 의존)

| # | 작업 | 의존 |
| :--- | :--- | :--- |
| 5-1 | 앱 스크린샷 3종 반영 (설정창·회의 제목+인디케이터·모드 토글) | **사람 캡처** — `sylphio_mac/docs/Sylphio_UpdateReview_20260705.md` §5 가이드 |
| 5-2 | 앱 문서 14종 갱신 (PrivacyPolicy·APIKeyGuide·Handover 등) | **별도 저장소** `sylphio_mac` — 동 문서 §2 감사표 기준 |

## 6. ⚪ 잔재 정리 (선택 — 결정 대기)

| # | 작업 | 결정 필요 |
| :--- | :--- | :--- |
| ~~6-1~~ | ~~고아 컴포넌트 처분~~ | ✅ 2026-07-21 결정: **보존 확정** — 미번들·무해, 재활용 대비. 재검토는 6개월 후 |
| ~~6-2~~ | ~~paceNote 로케일 네임스페이스~~ | ✅ 2026-07-21 결정: 6-1 보존에 따라 **유지 확정** |
| ~~6-3~~ | ~~OG 스크립트 재현성~~ | ✅ 2026-07-21 — `ci/gen_og_images.py`로 커밋 등재(변형 파라미터 포함) |
| ~~6-4~~ | ~~어드민 규범 적용~~ | ✅ 2026-07-21 결정: **공식 제외 유지**(§9-6-0) — 내부 도구는 px 관례 허용 |

## 7. 🟣 Admin 콘솔 리런 정합화 (2026-07-22 신설)

정본: [admin_console_specification.md](admin_console_specification.md)

| # | 작업 | 상태 |
| :--- | :--- | :--- |
| ~~7-1~~ | ~~사이드바 재편 — 그룹 4→3(Common·Builder's Log·ReLearn), 탭 10→8, 파이프라인 탭 → 콘텐츠 서브탭 흡수, Pacer 현황+인사이트 통합, track 기본 서브탭화~~ | ✅ 2026-07-22 |
| ~~7-2~~ | ~~죽은 API `PUT /admin/api/profile` 제거 + 외부용 `POST /daily/tracks/:date` 용도 주석 명시~~ | ✅ 2026-07-22 |
| ~~7-3~~ | ~~이메일 CTA `/daily/:date` → `/relearn/daily/:date` 전환 + 메일·언서브 페이지 Daily Digest 브랜딩 → ReLearn (product_strategy Phase E의 유일한 파이프라인 접점)~~ | ✅ 2026-07-22 — 발송 제목 `📬 ReLearn Daily`, DM 마크다운·언서브 폴백 포함 `/daily` 외부 링크 잔존 0 |

## 8. 🩵 아카이브 상세 UI 재편 (2026-07-22 신설 — 스크롤·가독 피로 해소)

정본: [ui_specification.md §8](../relearn/ui_specification.md) · 원인 실측: 21아티클 전량 카드 + 4채널 비-compact 수직 스택(전량 렌더 9,753px)

| # | 작업 | 상태 |
| :--- | :--- | :--- |
| ~~8-1~~ | ~~훑어보기(skim) 기본 모드 — 4채널 compact 재사용 + 존 단위 '전체 펼치기' + 정독 전역 토글(localStorage 유지)~~ | ✅ 2026-07-22 — 기본 높이 6,099px(-37%), 정보 손실 0 |
| ~~8-2~~ | ~~시그널 이원화 — DM Pick 5 카드형 유지 + 나머지 16 헤드라인 1줄 리스트 강등~~ | ✅ 2026-07-22 |
| ~~8-3~~ | ~~'오늘의 브리핑' 히어로 — 채널 스탯·정독 예상 시간·DM Pick 헤드라인(카드 앵커 점프)~~ | ✅ 2026-07-22 — 파이프라인 변경 0 |
| ~~8-4~~ | ~~스티키 채널 내비 — 4채널 앵커 + 스크롤 스파이 + 존 컬러 동기화~~ | ✅ 2026-07-22 |
| 8-5 | 배포 후 하단 채널 도달률 검증 (`relearn_daily_jump`·`relearn_daily_mode` GA 이벤트) | ⏳ 외부 의존(GA 데이터 축적) — 2-2와 함께 판정 |
| 8-6 | 아티클 21건 상시화 시 파이프라인 카테고리 캡 재조정 검토 (`pipeline/src/composer.mjs`) | 선택 — 데이터 소스 다이어트 |
| ~~8-7~~ | ~~헤더 히어로 정합 — §9-1 표준 히어로(📅·`.rl-hero` 재사용) 적용 + 이전/다음 pill → 주간 달력 스트립(`DailyWeekStrip`) + 서브카피 갱신 (일관성 QA 환류, design_system v5.9 적용범위 명시 동반)~~ | ✅ 2026-07-22 |

## 9. 📄 docs 최신화 전수 감사·정합화 (2026-07-22 신설·완료)

리런 통폐합(07-20)·admin 재편(07-22)·macOS 계획 폐기(07-22) 이후 docs 약 40종을 코드 실상과 전수 대조해 일괄 정합화.

| # | 작업 | 상태 |
| :--- | :--- | :--- |
| ~~9-1~~ | ~~사실 오류 해소 — service_overview 승계 완료 재서술(3제품 체제), authentication_architecture 실측 정정(Firebase Bearer+화이트리스트·adminApp·Google 로그인), INDEX 설명 오류 2건(인증 JWT/쿠키 표기·design_system 구버전 소개)~~ | ✅ 2026-07-22 |
| ~~9-2~~ | ~~기계 정리 — active 문서 frontmatter의 삭제파일(target_files) 잔존 제거 7종, sylphio 3종 domain 오기, last_updated 드리프트, admin-api 헤더 주석 잔재~~ | ✅ 2026-07-22 |
| ~~9-3~~ | ~~archived 처리 — scaling_plan(제안 전부 구현 완료)·og_image_strategy(삭제된 PriSignal 화면 기준)를 docs/archive/ 이동+경위 배너. **구현 완료 제안서(scroll·mobile·learn_stage·sylphio landing 2종)는 보존 결정**~~ | ✅ 2026-07-22 |
| ~~9-4~~ | ~~내용 개정 — business_model §6 제품 수익모델 신설, onboarding 기획자 경로 리런 편입, seo_meta_standard 현행 라우트 표, development_guide·architecture_overview 유령 builderslog-api/Nginx/helmet 정정, relearn/product_strategy §3·§4-3 자기모순 해소, pacenote 전략 2종 승계 배너, daily_digest_overhaul 리브랜딩 추기, i18n 2종 상호링크~~ | ✅ 2026-07-22 |
