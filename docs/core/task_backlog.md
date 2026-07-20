---
status: active
domain: Core
last_updated: 2026-07-20
version: v1.0
target_files: []  # 작업 백로그 — 특정 코드 미지배
---

# 🗺️ 잔여 작업 백로그 (Task Backlog)

## 📝 Revision History

| Version | Date | Author | Description | Impact Area |
| :--- | :--- | :--- | :--- | :--- |
| v1.0 | 2026-07-20 | AI Agent | 리런 통폐합(Phase 1~3) 완료 시점의 잔여 작업 정본 목록 최초 작성 | 전 도메인 |

> **운영 규칙**: 본 문서가 잔여 작업의 단일 정본(SSOT)입니다. 작업 착수·완료 시 상태를 갱신하고, 완료 항목은 ~~취소선~~ + 완료일을 남깁니다. 새 작업은 우선순위 표에 추가하십시오.

---

## 1. 🔴 최우선 — 통폐합 직후 검증·후속

| # | 작업 | 성격 | 비고 |
| :--- | :--- | :--- | :--- |
| 1-1 | 배포 검증: `/relearn` 오늘·기록 뷰 전 기능, `/daily`·`/pacenote` 301, 메인·GNB·Footer | 운영 확인(1회) | Phase 3(-3,477줄) 직후 필수 |
| 1-2 | 빌드 로그 `[design-check] PASS` 확인 | 운영 확인(1회) | prebuild 게이트 실가동 확인 |
| 1-3 | **ReLearn.jsx(~750줄) 스테이지별 컴포넌트 분리 리팩터** | 개발 | LearnStage/RunStage/ReflectStage + 계정바·아카이브 분리. **빌드 검증 가능 환경(node)에서 진행** — 1-1 안정 확인 후 |
| 1-4 | 서치콘솔 색인 전환 모니터링 (`/daily/:date` → `/relearn/daily/:date`) | 운영(수 주) | 301 효과 추적 |
| 1-5 | 소셜 OG 캐시 재스크랩 (카카오·페이스북 디버거) | 사용자 액션 | 새 Star Prism OG 카드 반영 |

## 2. 🟠 리런 품질 (데이터 기반 판단)

| # | 작업 | 비고 |
| :--- | :--- | :--- |
| 2-1 | ReLearnDaily(아카이브 상세)에 이전/다음 날짜 네비게이션 | 현재는 목록 복귀만 가능 |
| 2-2 | GA 퍼널 검증: `learn_expand`·`learn_more`·`orbit_add/exclude/restore` 데이터로 콤팩트 축약 강도 조정 | 리디자인 §6 검증 지표 |

## 3. 🟡 디자인 시스템 백로그 (design_system.md §9-7 연동)

| # | 작업 | 결정 필요 |
| :--- | :--- | :--- |
| 3-1 | 헤딩 스케일 확장 — 비토큰 WARN 74건(1.05/1.2/1.6/1.8rem 등) 토큰 등재 vs 스냅 | ✔ 방침 |
| 3-2 | 장식 마이크로 라벨(0.55~0.65rem) `--fs-060` 신설 여부 + px 잔존 4건(9/10/18/28) | ✔ 방침 |
| 3-3 | 호버 12종(~90건) → 리스트형 카드류 단계 정렬 | — |
| ~~3-4~~ | ~~PaceNote 히어로 3.5rem 상충~~ | ✅ 2026-07-20 Phase 3 파일 삭제로 자연 해소 |

## 4. 🟢 SEO·브랜드 백로그 (seo_meta_standard.md §9 연동)

| # | 작업 | 비고 |
| :--- | :--- | :--- |
| 4-1 | 카테고리별 동적 OG 이미지 파이프라인 | 현재 단일 폴백(Star Prism) — 디자인/파이프라인 확장 |
| 4-2 | 언어별 SSR 본문 (`?lang`별 서버 렌더) | 대공사 — hreflang 완전화의 전제 |

## 5. 🔵 Sylphio (외부 의존)

| # | 작업 | 의존 |
| :--- | :--- | :--- |
| 5-1 | 앱 스크린샷 3종 반영 (설정창·회의 제목+인디케이터·모드 토글) | **사람 캡처** — `sylphio_mac/docs/Sylphio_UpdateReview_20260705.md` §5 가이드 |
| 5-2 | 앱 문서 14종 갱신 (PrivacyPolicy·APIKeyGuide·Handover 등) | **별도 저장소** `sylphio_mac` — 동 문서 §2 감사표 기준 |

## 6. ⚪ 잔재 정리 (선택 — 결정 대기)

| # | 작업 | 결정 필요 |
| :--- | :--- | :--- |
| 6-1 | 고아 컴포넌트 처분: DailyCalendar·DailyIntro·PaceNote 위젯(WeeklyCalendar·ChronoRibbon) — 삭제 vs 보존 | ✔ (미번들 상태라 무해, 재활용 대비 보존 중) |
| 6-2 | `t('paceNote.*')` 로케일 네임스페이스 정리 | 6-1 처분과 연동 |
| 6-3 | OG 생성 스크립트 재현성 확보 (`scripts/` gitignore 상태 — 커밋 위치 결정) | ✔ |
| 6-4 | 어드민(AdminDashboard·ServiceDocs) 디자인 규범 적용 여부 | ✔ (현재 §9-6-0 공식 제외) |
