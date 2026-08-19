---
status: active
domain: Core
last_updated: 2026-08-19
version: v2.6
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
| v2.5 | 2026-08-19 | AI Agent | 10구간(자동 커밋 전제 조건) 신설 — public 저장소 전제 재점검에서 파생. 11구간(Candela) 포인터 등재 | .gitignore, server.mjs, admin-api.mjs, git hooks |

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

## 10. 🔐 자동 커밋 전제 조건 (2026-08-19 신설)

정본: [candela/security_spec.md](../candela/security_spec.md) · 배경: [security_audit.md §11](security_audit.md)

**이 저장소는 public이고, push된 시크릿은 force push로도 회수되지 않는다.** 자동 커밋이 필요한 이유는 편의가 아니라 **git이 Windows 데스크톱 ↔ macOS 노트북의 동기화 수단**이기 때문이다. 동기화 빈도에서 사람 승인은 고무도장이 되고, 그건 검증된 스캐너보다 나쁘다.

> **순서 주의**: 10-1(패턴 테스트)이 10-2(훅 설치)보다 먼저다. 검증 안 된 스캐너를 훅에 걸면 "검사하고 있다"는 잘못된 안심만 생기며, 이는 검사가 아예 없는 것보다 나쁘다.

### P0 — 전량 완료 (2026-08-19)

| # | 작업 | 결과 |
| :--- | :--- | :--- |
| ~~10-12~~ | ~~`.gitattributes` 도입~~ | ✅ `.githooks/** text eol=lf`. 없으면 Windows 워킹트리에서 CRLF가 되어 shebang이 `node\r`로 깨지고 **훅이 조용히 죽는다**. 기존 파일 정규화 churn 0건 확인 |
| ~~10-1~~ | ~~시크릿 패턴 유닛 테스트~~ | ✅ [src/data/secretPatterns.mjs](../../src/data/secretPatterns.mjs) 단일 소스화(admin-api·훅 공유, Docker 복사 경로). positive 15·negative 9, **7/7 통과** |
| ~~10-2~~ | ~~pre-commit 훅~~ | ✅ 가짜 키 커밋 **exit 1 차단 실증**, 정상 변경분 exit 0 통과 확인 |
| ~~10-3~~ | ~~인코딩 처리~~ | ✅ `.env` 실측 — 187바이트 중 **NUL 25바이트**(혼합 인코딩). `scanBuffer()`가 UTF-8·UTF-16 양쪽 해석. UTF-16 시크릿 차단 실증 |
| ~~10-4~~ | ~~`commit-msg` 훅~~ | ✅ 메시지 내 PAT 차단 실증(exit 1), 정상 메시지 통과(exit 0) |
| ~~10-5~~ | ~~GitHub Secret Scanning + Push Protection~~ | ⚠️ **부분 완료** — public 저장소는 secret scanning 자동, "push protection for users"도 계정 단위 기본 활성이라 서버 백스톱은 이미 존재. **저장소 단위 push protection만 미설정**(관리자 UI 필요, 아래 10-D5) |
| ~~10-6~~ | ~~경로 제한~~ | ✅ `git add -A`·`.`·`-u`·`commit -a` **deny**, 경로 지정 add만 허용. 루트 직하 신규 파일은 훅이 경고 |

### P1 — 전량 완료 (2026-08-19)

| # | 작업 | 결과 |
| :--- | :--- | :--- |
| ~~10-7~~ | ~~자동 커밋 식별 trailer~~ | ✅ **별도 조치 불필요** — Claude 커밋에는 `Co-Authored-By` trailer가 자동으로 붙고 사람 커밋에는 없다. 기존 커밋 5건에서 확인 |
| ~~10-8~~ | ~~회수 리허설~~ | ✅ plumbing(`commit-tree`)으로 훅 우회 커밋을 임시 브랜치에 생성 → `pre-push`가 포착하는 것 확인 → `reset --soft` 회수 절차 실연 → 브랜치 삭제. main 무영향 |
| ~~10-9~~ | ~~미조치 항목 기술 원칙~~ | ✅ [security_spec §2 N-7](../candela/security_spec.md) 등재 |
| ~~10-10~~ | ~~훅 이동성 (fail-closed)~~ | ✅ `.githooks/` + `prepare` + **prebuild 게이트가 hooksPath 미설정 시 빌드 실패**. Docker는 `.git` 부재로 자동 skip |
| ~~10-11~~ | ~~`.claude/` 분할~~ | ✅ `settings.json`(OS 중립 정책) 커밋 / `settings.local.json`(머신별 162건) 제외 |
| ~~10-13~~ | ~~`pre-push` 훅 (신설)~~ | ✅ 검증 중 발견한 구멍 대응 — `git commit -m "x" --no-verify`는 접두어 매칭 deny를 빠져나간다. push 직전 범위 재검사로 포착 |

### 정책 결정

| # | 항목 | 상태 |
| :--- | :--- | :--- |
| ~~10-D1~~ | ~~자동 커밋 범위~~ | ✅ **경로 지정 add만** (`docs/` `src/` `ci/` `.githooks/` `pipeline/` `public/`). 전체 스테이징은 deny |
| ~~10-D2~~ | ~~자동 푸시~~ | ✅ **허용으로 전환.** 초기 권고(영구 금지)는 git이 동기화 수단이라는 전제에서 틀렸다 — 고빈도 승인은 고무도장이 된다. 대신 최후 방어선을 사람이 아니라 `pre-push` + GitHub 서버 측에 둔다. `--force`·`--no-verify`는 계속 deny |
| 10-D3 | `Bash(node -e ' *)`·`Bash(npm i *)` 권한 존치 여부 | ⏳ Candela M4에 재검토. 단 로컬 `.env`에는 `VITE_FIREBASE_API_KEY`(공개 식별자)뿐이고 실 시크릿은 Secret Manager에만 있어 현 위험은 낮음 |
| ~~10-D4~~ | ~~`nginx.conf` 처분~~ | ✅ 2026-08-19 **삭제** — 코드·빌드 참조 0건 전수 확인 후 제거(git 히스토리가 아카이브 역할). 문서 참조 5곳 정리, `ROOT_ALLOW`에서도 제외. 패턴 금지는 [security_spec N-2](../candela/security_spec.md)로 존치 |
| 10-D5 | 저장소 단위 push protection 활성화 | ⏳ **사용자 액션 (30초)** — 아래 §10-D5 참조 |

#### 10-D5 상세 — 저장소 단위 push protection

**왜 자동화 불가**: 활성화에는 저장소 `Administration: write` 권한이 필요하다. 로컬에 그런 토큰이 없고(`.env`에는 `VITE_FIREBASE_API_KEY` 1건뿐), Secret Manager의 `GITHUB_TOKEN`은 콘텐츠 커밋용이라 권한이 부족할뿐더러 **프로덕션 시크릿을 개발 머신으로 내리는 것 자체가 [N-8 원칙](../candela/security_spec.md) 위반**이다. `gh` CLI도 미설치이며 설치해도 인증이 대화형이다.

**절차**

1. https://github.com/matthewshim/PriSincera/settings/security_analysis
2. **Secret Protection** → *Push protection* → **Enable**

**현재 상태 (2026-08-19 실측)**

| 항목 | 상태 |
| :--- | :--- |
| Secret scanning | ✅ public 저장소 자동 (무료) |
| Push protection **for users** | ✅ 계정 단위 기본 활성 — **실전 동작 확인**: `xox`-형식 테스트 픽스처로 실제 push가 거부됨 |
| Push protection **for repositories** | ⏳ 미설정 (이 항목) |
| Repository rulesets | 없음 (`GET /rulesets` → `[]`) |

**우선순위가 낮은 이유와, 그럼에도 켜는 이유**: 1인 소유 public 저장소에서는 계정 단위 protection이 이미 같은 detector로 동작하므로 당장의 델타는 작다. 다만 계정 단위 protection은 **public 저장소에만** 적용되므로, ① 협업자를 추가하거나 ② 저장소를 private로 전환하면 보호가 사라진다. 저장소 단위로 켜 두면 그 두 경우에도 유지된다.

## 11. 🕯️ Candela (2026-08-19 신설)

P0~P5 로드맵·승격 게이트·미결 항목은 **[candela/roadmap.md](../candela/roadmap.md)가 정본**이다. 본 문서에는 중복 등재하지 않으며, 도메인 외 파급이 있는 항목만 여기로 승격한다.

> **2026-08-19 방식 개정**: 실행 계층을 먼저 만드는 M0~M5에서 **UI 선행(P0~P5)**으로 전환했다 — 계약 → 픽스처 → Admin UI → Public UI → Worker → 공개. 근거와 위험 대응은 [ui_specification](../candela/ui_specification.md)·[data_contract](../candela/data_contract.md).

| # | 작업 | 상태 |
| :--- | :--- | :--- |
| ~~11-1~~ | ~~public 저장소 전제 보안 개선 4건 — `.claude/` gitignore·에이전트 push 권한 회수·`trust proxy`·시크릿 스캐너 보강~~ | ✅ 2026-08-19 — [security_audit.md §11](security_audit.md) |
| 11-2 | `firestore.rules`에 `candela_*` 명시적 deny 등재 (기본 deny로 이미 차단되나 향후 규칙 추가 실수 방지) | Candela M2 |
| 11-3 | Candela 관리 화면 `React.lazy` 코드 스플리팅 — 퍼블릭 방문자 번들에 매매 로직·엔드포인트 미포함 | Candela M2 |
| 11-4 | **브로커 키를 로컬 머신에 두지 않는다** — Worker는 클라우드 실행, 실계좌 키는 Secret Manager 전용. 로컬 개발은 모의투자 키로만. (Windows·macOS 2대를 오가는 환경 전제) | 원칙 등재 완료 — [security_spec §2 N-8](../candela/security_spec.md) |
| 11-5 | 시크릿 패턴에 한투 실제 키 형식 추가 — 발급 후 실측 기준으로 `secretPatterns.mjs` 보강 | Candela P4 |
| 11-6 | **`design-check` 확장 — 샘플 데이터 노출 차단(G-2)**: `CANDELA_DATA_SOURCE === 'fixture'`인데 퍼블릭 `/candela` 라우트가 등록돼 있으면 빌드 ERROR | Candela P3 |
| 11-7 | `candela` 로케일 네임스페이스 신설 — ko·en·ja **3종 동시**(D-2 결정). Admin은 i18n 게이트 제외 구역이라 ko 단일 | Candela P3 |
