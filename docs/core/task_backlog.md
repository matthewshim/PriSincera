---
status: active
domain: Core
last_updated: 2026-11-01
version: v3.3
target_files: []  # 작업 백로그 — 특정 코드 미지배
---

# 잔여 작업 백로그 (Task Backlog)

## Revision History

| Version | Date | Description | Impact Area |
| :--- | :--- | :--- | :--- |
| v3.3 | 2026-11-04 | **§16 메인 개선 완결(6/6)** — 계획서 §11 전 항목 종료. 별자리 수치·바이어 데이터화 + 게이트, 즉시 교정 8건, 경험 5단·통계 교체, Starfield 품질·재배치, 홈 사전 렌더링. 남은 메인 관련은 §3-7(GNB 보정 통일)·§12-5(Proof of Work 카피)와 육안 QA뿐 | task_backlog §16 |
| v1.0 | 2026-07-20 | 리런 통폐합(Phase 1~3) 완료 시점의 잔여 작업 정본 목록 최초 작성 | 전 도메인 |
| v1.1 | 2026-07-21 | 1-1·1-2 검증 완료(아카이브 SSR 메타 결함 발견·수정 포함), 2-1 완료 | server.mjs, ReLearnDaily |
| v1.2 | 2026-07-21 | 1-3 리팩터 완료 — 셸 607→431줄 + 스테이지 컴포넌트 4종 분리 | ReLearn 컴포넌트 구조 |
| v2.0 | 2026-07-21 | **실행 가능 항목 전량 소진** — 3구간(타이포 그리드 v5.6)·4-1(카테고리 OG)·6구간 결정 확정. 잔여는 외부 의존·대공사만 | 전 도메인 |
| v2.1 | 2026-07-22 | 7구간(Admin 콘솔 리런 정합화) 신설 — 메뉴 재편·중복 탭 통합·죽은 API 제거·이메일 브랜딩 전환 | AdminDashboard, admin-api, server |
| v2.2 | 2026-07-22 | 8구간(아카이브 상세 UI 재편) 신설·P1/P2 완료 — 훑어보기 기본 + 브리핑 히어로 + 스티키 채널 내비, 기본 상태 페이지 높이 9,753→6,099px(-37%, 첫 스크린 오버뷰 완결) | ReLearnDaily, SignalSection, DailyBriefing |
| v2.3 | 2026-07-22 | 9구간(docs 최신화 전수 감사·정합화) 신설·완료 — 사실 오류 3건(개요·인증·INDEX)·target_files 삭제파일 잔존·archived 2종 이동 등 일괄 해소 | docs 전반 |
| v2.4 | 2026-07-22 | 8-7 완료 — 아카이브 상세 헤더 §9-1 히어로 정합 + 주간 달력 스트립(DailyWeekStrip) 교체 (design_system v5.9 동반) | ReLearnDaily, DailyWeekStrip |
| v2.9 | 2026-11-01 | 14구간(AI 생성 디자인 패턴 개선) **포인터** 등재 — 진단/실행 정본은 `ai_pattern_audit.md`·`ai_pattern_remediation_plan.md`에 위임(중복 관리 금지) | docs, 전 프런트엔드 |
| v3.0 | 2026-11-03 | **§15 Sylphio 지면 정합화 신설(포인터) — 결함 10건 중 8건 완결** · `design_system.md` v7.0(§9-15 섹션 헤더 공식 · §9-16 섹션 리듬) 신설 후 적용. **§3-5·§3-6 전역 백로그 2건 신설** — `rgba()`→`color-mix()`(Sylphio 49 + ReLearn 41 등)와 토큰 없는 간격값 **전역 165건**은 지면 단위로 쪼개면 같은 표면에 두 문법이 섞이므로 전역 과제로 분리했다 | design_system v7.0, Sylphio 4파일, task_backlog §3·§15 |
| v3.1 | 2026-11-03 | **§3-5·§3-6 완료 · §3-7·§3-8 신설 · §15-5(A) 완료** — 오너 결정(사전은 `locales` 통합 · 간격은 기존 단계 스냅)에 따라 잔여 전건 처리. `color-mix` **351건** · 간격 토큰 **373건** · i18n **342키** 이전. `design_system.md` **v7.1**(§1-3 rgba 복제 금지 · §3-4 간격 토큰 규범 · §3-5 GNB 보정 불일치 기록). 게이트 지표 **28→29**, 하드 규칙 2종 추가. 남은 전역 과제는 §3-7(보정값 통일)·§3-8(표면 토큰) | design_system v7.1, locales×3, src 전역 25파일 |
| v3.2 | 2026-11-04 | **§16 메인 페이지 개선 신설(포인터)** — 외부 메인 분석 문서를 코드에 전수 대조해 채택분만 추린 추진계획([main_page_revision_plan.md](main_page_revision_plan.md)) 작성. 외부 문서의 사실관계 오류 7건·규범 충돌 4건을 배제하고 외부가 놓친 결함 5건을 추가했다. 최우선은 별자리 천문 수치의 순번 산술 생성 | main_page_revision_plan, INDEX |
| v2.8 | 2026-09-22 | 12-2 해소(목록 IA 전환·시리즈 도입) 반영. 글 규격 정본으로 [content_guide](../planners-view/content_guide.md) 신설 | PlannersView, docs |
| v2.7 | 2026-08-31 | 12구간(Planner's View 후속) · 13구간(시크릿 위생) 신설 — 섹션 신설 시 의도적으로 남긴 공백(어드민 발행 UI·조회수·목록 승격·메일 연동)과, 로컬 PAT 평문 노출·Secret Manager 값 개행 혼입에서 파생된 후속 점검을 등재 | PlannersView, admin-api, 운영 |
| v2.5 | 2026-08-19 | 10구간(자동 커밋 전제 조건) 신설 — public 저장소 전제 재점검에서 파생. 11구간(Candela) 포인터 등재 | .gitignore, server.mjs, admin-api.mjs, git hooks |

> **운영 규칙**: 본 문서가 잔여 작업의 단일 정본(SSOT)입니다. 작업 착수·완료 시 상태를 갱신하고, 완료 항목은 ~~취소선~~ + 완료일을 남깁니다. 새 작업은 우선순위 표에 추가하십시오.

---

## 1. 최우선 — 통폐합 직후 검증·후속

| # | 작업 | 성격 | 비고 |
| :--- | :--- | :--- | :--- |
| ~~1-1~~ | ~~배포 검증~~ | 2026-07-21 | 301 3종·리런 SSR·사이트맵(80건/구 URL 0) 라이브 검증. **아카이브 상세 SSR 메타 결함 발견**(Phase 3의 PAGE_META 삭제가 server.mjs 참조를 깨뜨림 — src/만 검증한 누락) → 폴백 보장 구조로 수정 |
| ~~1-2~~ | ~~빌드 로그 `[design-check] PASS` 확인~~ | 2026-07-21 | 게이트 도입 이후 커밋들이 라이브 반영됨(사이트맵 이관 확인) = 게이트 통과 간접 검증 |
| ~~1-3~~ | ~~ReLearn.jsx 스테이지별 컴포넌트 분리 리팩터~~ | 2026-07-21 | 셸(상태·핸들러) 431줄 + LearnStage(112)·RunStage(30)·ReflectStage(25)·RecordsView(76) 분리. 로컬 node 부재로 정적 검증만 수행 — **빌드 게이트(vite build)가 최종 검증**(실패 시 배포 차단·라이브 무영향) |
| 1-4 | 서치콘솔 색인 전환 모니터링 (`/daily/:date` → `/relearn/daily/:date`) | 운영(수 주) | 301 효과 추적 |
| 1-5 | 소셜 OG 캐시 재스크랩 (카카오·페이스북 디버거) | 사용자 액션 | 새 Star Prism OG 카드 반영 |

## 2. 리런 품질 (데이터 기반 판단)

| # | 작업 | 비고 |
| :--- | :--- | :--- |
| ~~2-1~~ | ~~ReLearnDaily 이전/다음 날짜 네비게이션~~ | 2026-07-21 — /api/daily/index 기반 |
| 2-2 | GA 퍼널 검증: `learn_expand`·`learn_more`·`orbit_add/exclude/restore` 데이터로 콤팩트 축약 강도 조정 | **외부 의존(GA 데이터 축적·조회 권한)** — 데이터 확인 가능 시 진행 |

## 3. 디자인 시스템 백로그 (design_system.md §9-7 연동)

| # | 작업 | 상태 |
| :--- | :--- | :--- |
| ~~3-1~~ | ~~헤딩 스케일 확장~~ | 2026-07-21 v5.6 — 0.05 그리드 전면 등재(30단)·전량 토큰화(비토큰 0) |
| ~~3-2~~ | ~~장식 마이크로·px 잔존~~ | 2026-07-21 v5.6 — --fs-050~065 등재, px 4건 스냅 |
| ~~3-3~~ | ~~호버 12종 정렬~~ | 2026-07-21 — 재감사 결과 주 표면 소멸, 챕터 카드는 §9-3 '액센트형' 공인(정렬 불채택) |
| ~~3-4~~ | ~~PaceNote 히어로 3.5rem 상충~~ | 2026-07-20 Phase 3 파일 삭제로 자연 해소 |
| ~~3-5~~ | ~~`rgba()` 생값 → `color-mix()` 전역 이전~~ | 2026-11-03 — **351건 전환**(토큰과 값이 같은 유채색만). `raw-rgba-token-dup` 지표 + 하드 규칙(0) 신설, 주입 테스트로 발화 검증. **흰/검 오버레이 325건은 대상 아님**(대응 토큰이 없어 문법만 바꿔도 얻는 게 없다 → §3-8) · `alpha: 0`은 색상 보존 투명이라 제외(자가 발각) |
| ~~3-6~~ | ~~토큰 없는 간격값 전역~~ | 2026-11-03 — 오너 결정 **기존 단계로 스냅**. 간격 생px **373건** 전환(동일값 리터럴 198 + 비단계 175). `spacing-px-literal`(하드 0) · `spacing-offgrid`(max 4) 신설. `design_system.md` §3-4 규범 신설, §3-1 개정(구 규범이 없는 단계 `20px`를 명시하고 있었다) |
| 3-7 | **§9-1 GNB 상단 보정값 통일** | 전 지면 히어로가 움직인다 — 육안 QA 선행. 같은 GNB 아래에서 보정이 **6가지**다: `160px`(BuildersLog·Sylphio 3지면) · `140px`(= 110+30, Planner's View 계열) · `120px`(모바일 표준 = 92+28) · `110px`(ReLearn·Waymark) · `92px`·`80px`(모바일 베이스). 히어로 콘텐츠가 지면마다 다른 높이에 앉는다. 통일되면 `spacing-offgrid` 잔존 4건(보정 산술 성분)도 함께 0이 된다. 출처: `design_system.md` §3-5 |
| 3-8 | **흰/검 오버레이 표면 토큰 체계** | 전역 325건(`rgba(255,255,255,α)` 258 · `rgba(0,0,0,α)` 67). `--glass-bg`·`--glass-border`가 이미 있지만 α 단계가 제각각이다. '유리 표면을 N% 밝힌다'는 **단계 집합**을 정의해야 하고, 단계를 정하면 현재 α가 움직인다(시각 변화) |

## 4. SEO·브랜드 백로그 (seo_meta_standard.md §9 연동)

| # | 작업 | 비고 |
| :--- | :--- | :--- |
| ~~4-1~~ | ~~카테고리별 OG 이미지~~ | 2026-07-21 — 3종 생성·PAGE_META 매핑, 제너레이터 ci/ 등재 |
| 4-2 | 언어별 SSR 본문 | **계획 수립 완료(2026-07-21)** — [i18n_ssr_plan.md](i18n_ssr_plan.md) 참조. URL 전략(B안)·착수 범위 등 결정 4건 대기 |

## 5. Sylphio (외부 의존)

| # | 작업 | 의존 |
| :--- | :--- | :--- |
| 5-1 | 앱 스크린샷 3종 반영 (설정창·회의 제목+인디케이터·모드 토글) | **사람 캡처** — `sylphio_mac/docs/Sylphio_UpdateReview_20260705.md` §5 가이드 |
| 5-2 | 앱 문서 14종 갱신 (PrivacyPolicy·APIKeyGuide·Handover 등) | **별도 저장소** `sylphio_mac` — 동 문서 §2 감사표 기준 |

## 6. 잔재 정리 (선택 — 결정 대기)

| # | 작업 | 결정 필요 |
| :--- | :--- | :--- |
| ~~6-1~~ | ~~고아 컴포넌트 처분~~ | 2026-07-21 결정: **보존 확정** — 미번들·무해, 재활용 대비. 재검토는 6개월 후 |
| ~~6-2~~ | ~~paceNote 로케일 네임스페이스~~ | 2026-07-21 결정: 6-1 보존에 따라 **유지 확정** |
| ~~6-3~~ | ~~OG 스크립트 재현성~~ | 2026-07-21 — `ci/gen_og_images.py`로 커밋 등재(변형 파라미터 포함) |
| ~~6-4~~ | ~~어드민 규범 적용~~ | 2026-07-21 결정: **공식 제외 유지**(§9-6-0) — 내부 도구는 px 관례 허용 |

## 7. Admin 콘솔 리런 정합화 (2026-07-22 신설)

정본: [admin_console_specification.md](admin_console_specification.md)

| # | 작업 | 상태 |
| :--- | :--- | :--- |
| ~~7-1~~ | ~~사이드바 재편 — 그룹 4→3(Common·Builder's Log·ReLearn), 탭 10→8, 파이프라인 탭 → 콘텐츠 서브탭 흡수, Pacer 현황+인사이트 통합, track 기본 서브탭화~~ | 2026-07-22 |
| ~~7-2~~ | ~~죽은 API `PUT /admin/api/profile` 제거 + 외부용 `POST /daily/tracks/:date` 용도 주석 명시~~ | 2026-07-22 |
| ~~7-3~~ | ~~이메일 CTA `/daily/:date` → `/relearn/daily/:date` 전환 + 메일·언서브 페이지 Daily Digest 브랜딩 → ReLearn (product_strategy Phase E의 유일한 파이프라인 접점)~~ | 2026-07-22 — 발송 제목 `ReLearn Daily`, DM 마크다운·언서브 폴백 포함 `/daily` 외부 링크 잔존 0 |

## 8. 아카이브 상세 UI 재편 (2026-07-22 신설 — 스크롤·가독 피로 해소)

정본: [ui_specification.md §8](../relearn/ui_specification.md) · 원인 실측: 21아티클 전량 카드 + 4채널 비-compact 수직 스택(전량 렌더 9,753px)

| # | 작업 | 상태 |
| :--- | :--- | :--- |
| ~~8-1~~ | ~~훑어보기(skim) 기본 모드 — 4채널 compact 재사용 + 존 단위 '전체 펼치기' + 정독 전역 토글(localStorage 유지)~~ | 2026-07-22 — 기본 높이 6,099px(-37%), 정보 손실 0 |
| ~~8-2~~ | ~~시그널 이원화 — DM Pick 5 카드형 유지 + 나머지 16 헤드라인 1줄 리스트 강등~~ | 2026-07-22 |
| ~~8-3~~ | ~~'오늘의 브리핑' 히어로 — 채널 스탯·정독 예상 시간·DM Pick 헤드라인(카드 앵커 점프)~~ | 2026-07-22 — 파이프라인 변경 0 |
| ~~8-4~~ | ~~스티키 채널 내비 — 4채널 앵커 + 스크롤 스파이 + 존 컬러 동기화~~ | 2026-07-22 |
| 8-5 | 배포 후 하단 채널 도달률 검증 (`relearn_daily_jump`·`relearn_daily_mode` GA 이벤트) | 외부 의존(GA 데이터 축적) — 2-2와 함께 판정 |
| 8-6 | 아티클 21건 상시화 시 파이프라인 카테고리 캡 재조정 검토 (`pipeline/src/composer.mjs`) | 선택 — 데이터 소스 다이어트 |
| ~~8-7~~ | ~~헤더 히어로 정합 — §9-1 표준 히어로(·`.rl-hero` 재사용) 적용 + 이전/다음 pill → 주간 달력 스트립(`DailyWeekStrip`) + 서브카피 갱신 (일관성 QA 환류, design_system v5.9 적용범위 명시 동반)~~ | 2026-07-22 |

## 9. docs 최신화 전수 감사·정합화 (2026-07-22 신설·완료)

리런 통폐합(07-20)·admin 재편(07-22)·macOS 계획 폐기(07-22) 이후 docs 약 40종을 코드 실상과 전수 대조해 일괄 정합화.

| # | 작업 | 상태 |
| :--- | :--- | :--- |
| ~~9-1~~ | ~~사실 오류 해소 — service_overview 승계 완료 재서술(3제품 체제), authentication_architecture 실측 정정(Firebase Bearer+화이트리스트·adminApp·Google 로그인), INDEX 설명 오류 2건(인증 JWT/쿠키 표기·design_system 구버전 소개)~~ | 2026-07-22 |
| ~~9-2~~ | ~~기계 정리 — active 문서 frontmatter의 삭제파일(target_files) 잔존 제거 7종, sylphio 3종 domain 오기, last_updated 드리프트, admin-api 헤더 주석 잔재~~ | 2026-07-22 |
| ~~9-3~~ | ~~archived 처리 — scaling_plan(제안 전부 구현 완료)·og_image_strategy(삭제된 PriSignal 화면 기준)를 docs/archive/ 이동+경위 배너. **구현 완료 제안서(scroll·mobile·learn_stage·sylphio landing 2종)는 보존 결정**~~ | 2026-07-22 |
| ~~9-4~~ | ~~내용 개정 — business_model §6 제품 수익모델 신설, onboarding 기획자 경로 리런 편입, seo_meta_standard 현행 라우트 표, development_guide·architecture_overview 유령 builderslog-api/Nginx/helmet 정정, relearn/product_strategy §3·§4-3 자기모순 해소, pacenote 전략 2종 승계 배너, daily_digest_overhaul 리브랜딩 추기, i18n 2종 상호링크~~ | 2026-07-22 |

## 10. 자동 커밋 전제 조건 (2026-08-19 신설)

정본: [core/security_spec.md](security_spec.md) · 배경: [security_audit.md §11](security_audit.md)

**이 저장소는 public이고, push된 시크릿은 force push로도 회수되지 않는다.** 자동 커밋이 필요한 이유는 편의가 아니라 **git이 Windows 데스크톱 ↔ macOS 노트북의 동기화 수단**이기 때문이다. 동기화 빈도에서 사람 승인은 고무도장이 되고, 그건 검증된 스캐너보다 나쁘다.

> **순서 주의**: 10-1(패턴 테스트)이 10-2(훅 설치)보다 먼저다. 검증 안 된 스캐너를 훅에 걸면 "검사하고 있다"는 잘못된 안심만 생기며, 이는 검사가 아예 없는 것보다 나쁘다.

### P0 — 전량 완료 (2026-08-19)

| # | 작업 | 결과 |
| :--- | :--- | :--- |
| ~~10-12~~ | ~~`.gitattributes` 도입~~ | `.githooks/** text eol=lf`. 없으면 Windows 워킹트리에서 CRLF가 되어 shebang이 `node\r`로 깨지고 **훅이 조용히 죽는다**. 기존 파일 정규화 churn 0건 확인 |
| ~~10-1~~ | ~~시크릿 패턴 유닛 테스트~~ | [src/data/secretPatterns.mjs](../../src/data/secretPatterns.mjs) 단일 소스화(admin-api·훅 공유, Docker 복사 경로). positive 15·negative 9, **7/7 통과** |
| ~~10-2~~ | ~~pre-commit 훅~~ | 가짜 키 커밋 **exit 1 차단 실증**, 정상 변경분 exit 0 통과 확인 |
| ~~10-3~~ | ~~인코딩 처리~~ | `.env` 실측 — 187바이트 중 **NUL 25바이트**(혼합 인코딩). `scanBuffer()`가 UTF-8·UTF-16 양쪽 해석. UTF-16 시크릿 차단 실증 |
| ~~10-4~~ | ~~`commit-msg` 훅~~ | 메시지 내 PAT 차단 실증(exit 1), 정상 메시지 통과(exit 0) |
| ~~10-5~~ | ~~GitHub Secret Scanning + Push Protection~~ | **부분 완료** — public 저장소는 secret scanning 자동, "push protection for users"도 계정 단위 기본 활성이라 서버 백스톱은 이미 존재. **저장소 단위 push protection만 미설정**(관리자 UI 필요, 아래 10-D5) |
| ~~10-6~~ | ~~경로 제한~~ | `git add -A`·`.`·`-u`·`commit -a` **deny**, 경로 지정 add만 허용. 루트 직하 신규 파일은 훅이 경고 |

### P1 — 전량 완료 (2026-08-19)

| # | 작업 | 결과 |
| :--- | :--- | :--- |
| ~~10-7~~ | ~~자동 커밋 식별 trailer~~ | **별도 조치 불필요** — Claude 커밋에는 `Co-Authored-By` trailer가 자동으로 붙고 사람 커밋에는 없다. 기존 커밋 5건에서 확인 |
| ~~10-8~~ | ~~회수 리허설~~ | plumbing(`commit-tree`)으로 훅 우회 커밋을 임시 브랜치에 생성 → `pre-push`가 포착하는 것 확인 → `reset --soft` 회수 절차 실연 → 브랜치 삭제. main 무영향 |
| ~~10-9~~ | ~~미조치 항목 기술 원칙~~ | [security_spec §2 N-5](security_spec.md) 등재 |
| ~~10-10~~ | ~~훅 이동성 (fail-closed)~~ | `.githooks/` + `prepare` + **prebuild 게이트가 hooksPath 미설정 시 빌드 실패**. Docker는 `.git` 부재로 자동 skip |
| ~~10-11~~ | ~~`.claude/` 분할~~ | `settings.json`(OS 중립 정책) 커밋 / `settings.local.json`(머신별 162건) 제외 |
| ~~10-13~~ | ~~`pre-push` 훅 (신설)~~ | 검증 중 발견한 구멍 대응 — `git commit -m "x" --no-verify`는 접두어 매칭 deny를 빠져나간다. push 직전 범위 재검사로 포착 |

### 정책 결정

| # | 항목 | 상태 |
| :--- | :--- | :--- |
| ~~10-D1~~ | ~~자동 커밋 범위~~ | **경로 지정 add만** (`docs/` `src/` `ci/` `.githooks/` `pipeline/` `public/`). 전체 스테이징은 deny |
| ~~10-D2~~ | ~~자동 푸시~~ | **허용으로 전환.** 초기 권고(영구 금지)는 git이 동기화 수단이라는 전제에서 틀렸다 — 고빈도 승인은 고무도장이 된다. 대신 최후 방어선을 사람이 아니라 `pre-push` + GitHub 서버 측에 둔다. `--force`·`--no-verify`는 계속 deny |
| 10-D3 | `Bash(node -e ' *)`·`Bash(npm i *)` 권한 존치 여부 | Candela M4에 재검토. 단 로컬 `.env`에는 `VITE_FIREBASE_API_KEY`(공개 식별자)뿐이고 실 시크릿은 Secret Manager에만 있어 현 위험은 낮음 |
| ~~10-D4~~ | ~~`nginx.conf` 처분~~ | 2026-08-19 **삭제** — 코드·빌드 참조 0건 전수 확인 후 제거(git 히스토리가 아카이브 역할). 문서 참조 5곳 정리, `ROOT_ALLOW`에서도 제외. 패턴 금지는 [security_spec N-2](security_spec.md)로 존치 |
| 10-D5 | 저장소 단위 push protection 활성화 | **사용자 액션 (30초)** — 아래 §10-D5 참조 |

#### 10-D5 상세 — 저장소 단위 push protection

**왜 자동화 불가**: 활성화에는 저장소 `Administration: write` 권한이 필요하다. 로컬에 그런 토큰이 없고(`.env`에는 `VITE_FIREBASE_API_KEY` 1건뿐), Secret Manager의 `GITHUB_TOKEN`은 콘텐츠 커밋용이라 권한이 부족할뿐더러 **프로덕션 시크릿을 개발 머신으로 내리는 것 자체가 [보안 규범](security_spec.md) 위반**이다. `gh` CLI도 미설치이며 설치해도 인증이 대화형이다.

**절차**

1. https://github.com/matthewshim/PriSincera/settings/security_analysis
2. **Secret Protection** → *Push protection* → **Enable**

**현재 상태 (2026-08-19 실측)**

| 항목 | 상태 |
| :--- | :--- |
| Secret scanning | public 저장소 자동 (무료) |
| Push protection **for users** | 계정 단위 기본 활성 — **실전 동작 확인**: `xox`-형식 테스트 픽스처로 실제 push가 거부됨 |
| Push protection **for repositories** | 미설정 (이 항목) |
| Repository rulesets | 없음 (`GET /rulesets` → `[]`) |

**우선순위가 낮은 이유와, 그럼에도 켜는 이유**: 1인 소유 public 저장소에서는 계정 단위 protection이 이미 같은 detector로 동작하므로 당장의 델타는 작다. 다만 계정 단위 protection은 **public 저장소에만** 적용되므로, ① 협업자를 추가하거나 ② 저장소를 private로 전환하면 보호가 사라진다. 저장소 단위로 켜 두면 그 두 경우에도 유지된다.

## 11. Candela → Waymark 피벗 (2026-10-17 폐기)

Candela(자동매매·공개 사례 연구)는 **의사결정 동반 서비스 Waymark로 피벗**되어 폐기되었다(2026-10-17). 라이브 Candela(랜딩·라우트·GNB·메인 카드·i18n·fixture/스키마·design-check G-2 게이트)와 Builder's Log ch.14는 제거 완료. 아래 과제(11-2~11-7·P0~P5 로드맵)는 **모두 취소**된다.

- 폐기 배경·전환 범위: [waymark/repositioning_proposal](../waymark/repositioning_proposal.md)
- 트레이딩 계획 아카이브: [archive/candela_trading_archive](../archive/candela_trading_archive.md)
- 레포 전체 보안 규범(§10 적용 완료분)은 [core/security_spec](security_spec.md)로 존치·이관
- Waymark 정식 과제는 `docs/waymark/` 문서 세트(product_strategy·roadmap·ui_specification) 작성 후 재등재

## 12. Planner's View 후속 (2026-08-31 신설)

섹션 신설(`a758726`) 시 **의도적으로 남긴 공백**이다. 필요해지는 시점이 오면 처리한다. 상세는 [planners-view/publishing_guide §5](../planners-view/publishing_guide.md).

| # | 작업 | 착수 시점 |
| :--- | :--- | :--- |
| 12-1 | **어드민 발행 UI 미지원** — 현재 파일 기반 발행만 가능. `admin-api.mjs`의 `/builderslog/publish`가 `buildersLogMeta.json`·`public/content/logs` 경로를 리터럴로 박고 있어 **섹션 파라미터화가 선행**돼야 한다(엔드포인트 분기 or `section` 인자) | 웹에서 발행할 필요가 생길 때 |
| ~~12-2~~ | ~~목록 페이지 신설~~ → **IA 전환으로 해소**. 6편 임계를 기다리지 않고 루트를 목록으로 승격(오너 결정 2026-09-22 — 꾸준한 연재 전제). 시리즈 묶음·연재 내비 동반 | 2026-09-22 — [publishing_guide v2.0](../planners-view/publishing_guide.md) |
| 12-3 | 조회수 집계 — Builder's Log의 `/api/builderslog/:slug/view` 대응 엔드포인트 없음 | 유입 측정이 필요해질 때 |
| 12-4 | 데일리 다이제스트 메일 연동 — 현재 메일은 Builder's Log 최신 1건만 싣는다(`composer.mjs`) | 구독자 노출을 결정할 때 |
| 12-5 | **홈 "Proof of Work" 카피 재검토** — 카드가 5장이 되며 `네 가지 증거`→`다섯 가지 결과물`로 최소 수정했다. 글 섹션까지 "만든 것"으로 묶는 표현이 적절한지 오너 판단 필요 | 오너 결정 |

## 13. 시크릿 위생 (2026-08-31 신설)

로컬 PAT가 `.git/config` 원격 URL에 평문으로 박혀 있던 것을 발견한 데서 파생. 토큰 자체는 폐기 완료(GitHub Credential Revocation API)이며, 아래는 재발 방지 후속이다.

| # | 작업 | 상태 |
| :--- | :--- | :--- |
| ~~13-1~~ | ~~`.git/config` 원격 URL의 평문 PAT 제거 + Keychain 인증으로 전환 + 해당 토큰 폐기~~ | 2026-08-31 — 폐기 후 401 확인 |
| ~~13-2~~ | ~~`GITHUB_TOKEN` 값에 혼입된 `공백+CRLF` 3바이트 제거(버전 2) + 소비 측 `?.trim()` 방어~~ | 2026-08-31 — [environment_reference v1.1](environment_reference.md) |
| 13-3 | **시크릿 스캐너 사각 보완 검토** — 스캐너는 *커밋되는 파일*만 본다. `.git/config`처럼 추적 대상 밖 경로는 설계상 검사되지 않는다. 로컬 개발 환경 점검 체크리스트(원격 URL·`.env*`·에디터 설정)를 온보딩에 추가할지 결정 | 결정 대기 |
| 13-4 | 다른 저장소의 `.git/config`에도 동일 PAT가 박혀 있을 수 있음 — 폐기 후 푸시 실패가 나면 같은 방식으로 URL만 정리 | 발생 시 |

## 14. AI 생성 디자인 패턴 개선 (2026-11-01 신설 — 포인터)

바이브코딩 수렴 패턴 전수 감사에서 파생. **진단 정본은 [ai_pattern_audit.md](ai_pattern_audit.md), 실행·진척 정본은 [ai_pattern_remediation_plan.md](ai_pattern_remediation_plan.md)** 이며, 투두 51건의 체크·진척 갱신은 그쪽에서 수행한다. 본 백로그는 **포인터만** 유지한다(중복 관리 금지).

> **2026-11-01 완결.** 투두 **57/57**, 예산 지표 **28건 전부 기준선 이하 + 목표 미달 0건**.
> 측정 정본은 `ci/pattern-metrics.mjs`, 집행은 `ci/pattern-budget.mjs`(prebuild) + `ci/design-check.mjs`.
> 주요 결과: 이모지 251→20(잔여는 황도 12궁 데이터·앱 UI 설명문·조판 기호) · JSX 인라인 176→117(비어드민 40 중 34는 정당)
> · `!important` 67→7 · `transition:all` 62→0 · 생hex 337→37 · 중복 셀렉터 0 · 고아 키프레임 0 · 미선언 토큰 0 · CSS −1,667줄.
> **진행 중 자가 발각한 측정기·게이트 결함 7건**(모두 교정): 비율 지표 래칫 오적용 · `uniqueValues` 경계 누락 ·
> `duplicate-selector` 첫 `@media` 절단 및 3중 중첩 마스킹 실패 · `raw-hex-css`가 토큰 선언을 계수 ·
> P4-3이 `<Icon label>`을 미인식 · 글로우 게이트가 `.hovering-`/`.near-` 상태 클래스 미인식.

| # | 작업 | 상태 |
| :--- | :--- | :--- |
| ~~14-1~~ | ~~P0 결함 교정 8건~~ | 2026-11-01 — 폰트 5→3패밀리·`Outfit` 9곳·토큰 동일 생hex 72건·금지대역 max-width 2건·Sylphio 3중 복제(−218줄)·키프레임 중복 6종·스크롤 락·모달 시맨틱 전부 해소 |
| ~~14-2~~ | ~~P1 A·G·H 계층 정합 19건~~ | 2026-11-01 — 전건 완료 |
| ~~14-3~~ | ~~P2 장식 밀도 예산화 9건~~ | 2026-11-01 — `transition:all` **62→0** · 유휴 `infinite` **69→8** · 유휴 글로우 **15→12** · 고아 키프레임 **0** · 텍스트 opacity 중첩(AA 미달 4건) 해소 |
| ~~14-4~~ | ~~P3 구성 공식 깨기~~ | 2026-11-01 — 타입 스케일 **35→11단**(347개 사용처) · 브레이크포인트 **10→5**(역할 3티어) · Waymark 섹션 형식 4종 · Sylphio 7카드→3+리스트 · 데드 CSS **−1,667줄** |
| ~~14-5~~ | ~~P4 집행 체계 전환 6건~~ | 2026-11-01 — 래칫 게이트 **28지표**(prebuild 연결) · `design-check` 집행 차원 **1→12** · P4-3 접근성 게이트 · `design_system` **v5.23→v6.1** · EXCLUDE 정책 명문화 |
| ~~14-6~~ | ~~결정 대기 6건(D-1~D-6)~~ | 2026-11-01 — 전건 확정: 세리프 폐지·`\n` 유지·커서 홈 한정(위임)·제품 테마 구분 강화·다크 전용 유지·브랜드 4색 수렴. **차단 요소 0** |

## 15. Sylphio 지면 디자인 시스템 정합화 (2026-11-03 신설 — 포인터)

`/sylphio` 3지면 + 서브탭 내비 전수 실측에서 파생. **정본은 [sylphio/design_system_audit.md](../sylphio/design_system_audit.md)**
(v2.0)이며 결함 상세·실행 기록·자가 교정은 그쪽에서 관리한다. 본 백로그는 **포인터만** 유지한다.

> **2026-11-03 — 결함 10건 중 8건 완결.** `design_system.md` **v7.0**(§9-15 섹션 헤더 공식 · §9-16 섹션 리듬)을
> 신설한 뒤 적용했다. 전역 `raw-hex-css` **37 → 24**.
> 잔여는 **A**(i18n 사전 342키 지면 내장 — 규모 별건)와 전역 과제로 옮긴 **H·G**(§3-5·§3-6)뿐이다.

| # | 작업 | 상태 |
| :--- | :--- | :--- |
| ~~15-1~~ | ~~J 섹션 공식 eyebrow 공백 · I 섹션 리듬 · F 생값 폭~~ | 2026-11-03 — 규범 신설(§9-15·§9-16) 후 적용. eyebrow 3개 추가·`.u-eyebrow` 그룹 등재·리드 `margin auto` 제거·`820px`→`--measure` 4건·`padding`→`margin-top` |
| ~~15-2~~ | ~~B 헤딩 레벨 건너뜀 · D 목업이 실제 헤딩 사용~~ | 2026-11-03 — JSX 7건 + CSS 셀렉터 7건 동반 이동(시각 무변경), 목업은 `role="dialog"`+`aria-label`로 개요에서 제외 |
| ~~15-3~~ | ~~C 모바일 서브내비 가로 스크롤~~ | 2026-11-03 — 스크롤바 은폐 3경로 제거 → `flex-wrap: wrap`(§9-14 "가로 캐러셀 금지"와 같은 판정) |
| ~~15-4~~ | ~~E 생hex 토큰화~~ | 2026-11-03 — 13건(보고 8 + 추가 발견 5) + 종속 rgba 3건. 잔존 6건은 전부 플랫폼 모방 |
| ~~15-5~~ | ~~A — i18n 사전이 지면 안에 있다 (342키)~~ | 2026-11-03 — 오너 결정 **`locales/*.json` 완전 통합**. 342키(114×3)를 `sylphio.{landing,guide,privacy}` 네임스페이스로 이전, 지면 JSX **−452줄**. `t('sylphio.landing')`이 `TRANSLATIONS[locale] || TRANSLATIONS.ko`와 **의미가 같아** `d.xxx` 호출부 103개는 무변경. `tocLabel` 3항 분기도 흡수, 죽은 키 11개(×3로케일) 정리. SSR 의존은 없었다(`server.mjs`는 sitemap 3줄뿐). **비용**: 로케일이 즉시 로드되므로 index 번들 gzip **+17.7KB**(예상 12KB보다 큼), Sylphio 청크 **−46.5KB** |

## 16. 메인 페이지 개선 (2026-11-04 신설 — 포인터)

외부 메인 분석 문서를 코드에 전수 대조해 채택분만 추린 추진계획에서 파생. **정본은 [main_page_revision_plan.md](main_page_revision_plan.md)** 이며 항목 상세·배제 근거는 그쪽에서 관리한다. 본 백로그는 **포인터만** 유지한다.

> **2026-11-04 완결.** 계획서 §11의 전 항목 종료. 검증에서 외부 문서의 **사실관계 오류 9건·규범 충돌 4건**이 나왔고(구현 중 2건 추가 발견), 외부가 놓친 결함 **5건**을 추가했다.
> 남은 것은 육안 QA와 §3-7(GNB 보정 통일)·§12-5(Proof of Work 카피)뿐이다.
> 최우선은 별자리 RA/DEC/거리/등급이 **순번 산술로 생성**되는 문제다 — 브랜드 주장과 직접 부딪힌다.

| # | 작업 | 상태 |
| :--- | :--- | :--- |
| ~~16-1~~ | ~~별자리 천문 수치·바이어 문자~~ | 2026-11-04 — 공식 생성 수치 표시 제거, 바이어 12종 **데이터화**(Aries 역순 교정). `astronomyDataGate` 3중 검사 신설, 주입 발화 검증. 실제 값 채우기는 단일 출처 검수 후(거리값이 출처마다 크게 엇갈린다) |
| ~~16-2~~ | ~~즉시 교정 묶음~~ | 2026-11-04 — 8건 전부. 메타는 **두 곳 동시**, 그 과정에서 **홈만 SSR을 타지 않던 것**을 발견해 `index: false`로 통일 |
| ~~16-3~~ | ~~결정 대기 묶음~~ | 2026-11-04 — 결정 8건 전부 해소. 직함은 지면에 쓰지 않고 `무대를 만든다`로 옮김, `Sincerity` 통일, Canvas 감쇠는 정지 프레임 1장 |
| ~~16-4~~ | ~~경력 하이라이트~~ | 2026-11-04 — LinkedIn 캡처로 6개사 확보 후 **경험 5단**으로 구현(회사명·직책 비표기). 통계 `20 YEARS · 4 CONTINENTS · 31 PAYMENT METHODS` |
| ~~16-5~~ | ~~Starfield 품질·배치~~ | 2026-11-04 — 별 색 깊이 분리·재배분, 별 밝기 88백분위, 터치 지원, 감쇠 정지 프레임, **외곽 시계방향 연속 경로 + 폭별 tier**(모바일 화면밖 8→0·겹침 5→0) |
| ~~16-6~~ | ~~메인 사전 렌더링~~ | 2026-11-04 — 빌드 후 조각 생성 + **홈 전용 주입**. §4-2와 분리해 착수했다(URL 전략 결정과 무관) |
