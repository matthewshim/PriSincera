---
status: active
domain: ReLearn
last_updated: 2026-08-02
version: v1.6
target_files:
  - src/pages/DailyView.jsx
  - src/pages/ReLearn.css
  - src/pages/ReLearnDaily.css
  - src/components/relearn/DiaryDock.jsx
  - src/components/daily/DailyBriefing.jsx
  - src/components/daily/SignalSection.jsx
  - src/components/daily/PromptSection.jsx
  - src/components/daily/JapaneseSection.jsx
  - src/components/relearn/OrbitSection.jsx
  - src/components/relearn/ReflectionSection.jsx
  - src/components/relearn/ReLearnSections.css
  - src/components/relearn/funnel.js
---

# 🖥️ ReLearn UI 구현 명세서 (UI Specification)

> `/relearn` 통합 성장 루프 화면의 **출하 기준(as-shipped)** 명세. 기획·로드맵은 [product_strategy](product_strategy.md), 백엔드 루프는 [growth_loop_plan](../pacenote/growth_loop_plan.md) 참조. 디자인은 [design_system](../core/design_system.md) 토큰만 사용(신규 컬러 0).

## 📝 Revision History

| Version | Date | Author | Description | Impact Area |
| :--- | :--- | :--- | :--- | :--- |
| v1.0 | 2026-07-15 | AI Agent | Phase B~D 출하분 화면 명세 최초 작성 (3-stage·뷰 전환·레일 2뎁스·4채널·퍼널) | ReLearn UI |
| v1.1 | 2026-07-22 | AI Agent | §8 아카이브 상세 UI 재편 명세 신설 — 훑어보기 기본·브리핑 히어로·스티키 채널 내비·시그널 이원화 | ReLearnDaily |
| v1.2 | 2026-07-22 | AI Agent | §8 헤더 히어로 정합 — §9-1 표준 히어로(📅·`.rl-hero` 재사용) 적용, 이전/다음 pill → 주간 달력 스트립(`DailyWeekStrip`) 교체, 서브카피 갱신 | ReLearnDaily, DailyWeekStrip |
| v1.3 | 2026-07-22 | AI Agent | §8 헤더 뒤로가기 `← ReLearn` → 위치 경로 브레드크럼 `ReLearn › 아카이브` — 리런 내 상주 화면에서의 동어반복 해소(오너 QA 환류) | ReLearnDaily |
| v1.4 | 2026-07-27 | AI Agent | **일자축 통일 Phase 2** — ReLearn.jsx+ReLearnDaily.jsx → 단일 `DailyView.jsx` 수렴(오늘/과거 동일 골격), 시간 네비(DailyWeekStrip) 오늘 뷰 상시화, `기록` 탭 → `TimeOverview`(날짜 칩 인덱스+주 단위 기록), 오늘 날짜 아카이브 URL → `/relearn` 수렴 | DailyView, TimeOverview |
| v1.6 | 2026-08-02 | AI Agent | **본문 실물 정합** — §1 화면구조·§2·§5·§6·§8을 교재/일기장 구조로 전면 정정(구 3-stage·오늘\|기록 탭·스테이지 레일·훑어보기/정독 서술 제거). Revision만 갱신돼 있던 본문 스테일 해소 | ReLearn UI |
| v1.5 | 2026-07-27 | AI Agent | **교재/일기장 분리 재편(오너 환류)** — 본문=배움 콘텐츠 통일 렌더, 실행·복기=DiaryDock(본문 2분할 우측 컬럼 span 8/4·모바일 하단 도크), `오늘\|기록` 탭·TimeOverview·3-stage 스택 폐지, Learn/Run/ReflectStage·RecordsView 소거 | DailyView, DiaryDock |

---

## 1. 화면 구조 (위 → 아래)

```
[컴포넌트 구조 — 일자축 Phase 2 재편: 교재/일기장 분리] DailyView.jsx(단일 날짜 뷰 셸)
  ├─ 📖 교재(본문): DailyBriefing + 책갈피 탭(전 화면 상단 가로·sticky — 세로 레일은 2분할 컬럼 폭 잠식으로 기각) — 카테고리별
  │    구분, 각 탭 전부 펼침(훑어보기/정독 모드·스티키 칩 바 폐지). 오늘은 탭 패널에 '＋일기장 궤도에
  │    추가' 브리지(signal/prompt/jp, 트랙은 카드 자체 오빗화)
  ├─ ✍️ 일기장: DiaryDock(플로팅 — 데스크톱 우측 고정 패널 · 모바일 하단 도크→시트)
  │    레이아웃: 본문 2분할(--container 내 span 8/4) — 좌 교재 · 우 일기장(sticky), 모바일 1열+하단 도크
  │    내부 책갈피 탭: 실행 | 복기 | (오늘) 리포트 — 오늘: OrbitSection·ReflectionSection·LoopReport(.md 내보내기)
  │    · 과거: 일 해상도 열람 — 전환 이전 날짜는 그 날이 속한 주 기록(주 해상도)으로 폴백
  ├─ 공통: DailyWeekStrip(유일한 날짜 탐색 축) — 오늘 날짜의 /relearn/daily/:date는 /relearn으로 수렴
  └─ daily 공용: TrackSignalFeed·Signal/Prompt/JapaneseSection (compact prop)

GNB (ReLearn 활성 시 relearn-theme·cyan)
├─ 헤더:
│   · 오늘(/relearn): 🪐 아이콘(3rem float) · "ReLearn"(--gradient-brand) · 태그라인 · [비로그인] 로그인 CTA(gold)
│   · 과거(/relearn/daily/:date): 브레드크럼 `ReLearn › 아카이브` · 📅 "{date} Daily Digest" · 서브카피
├─ 시간 네비: DailyWeekStrip — 유일한 날짜 탐색 축(오늘/과거 공통). 오늘 날짜의 /relearn/daily/:date는 /relearn로 수렴
├─ [오늘·로그인] 계정·구독 유틸 바
│
├─ 본문 2분할 (--container 내 span 8/4 · 모바일 1열)
│   ├─ 📖 좌: 교재 = DailyBriefing + 상단 가로 책갈피 탭(sticky, 카테고리별 — 데이터 있는 채널만 노출)
│   │    · 각 탭 전부 펼침(훑어보기/정독·스티키 칩 바·좌측 스테이지 레일·3-stage·오늘|기록 탭 모두 폐지)
│   │    · 오늘: 탭 패널 상단에 '＋일기장 궤도에 추가' 브리지(signal/prompt/jp · 트랙은 카드 자체 오빗화)
│   │    · 브리핑 DM Pick 클릭 → 시그널 탭 전환 후 sig-pick-N 카드로 스크롤
│   └─ ✍️ 우: 일기장 = DiaryDock(데스크톱 sticky 컬럼 / 모바일 하단 도크→시트)
│        내부 책갈피 탭: 실행 | 복기 | (오늘)리포트
│        · 오늘: OrbitSection(토글·자유입력·AI 추천+사유·궤도 검색 모달·soft 제외/복원) ·
│          ReflectionSection(디바운스 1.2s 자동저장, 1000자) · LoopReport · .md 내보내기
│        · 과거: 일 해상도 열람(GET /api/pacenote/day/:date) — 전환 이전 날짜는 그 주 기록(주 해상도) 폴백
│
└─ [오늘] 루프 닫힘 푸터(+ 계정·구독 통합 줄)
```

## 2. 배움 4채널 — 상단 가로 책갈피 탭 (카테고리별 전환, 각 탭 전부 펼침)

| 채널 | 컴포넌트 | '궤도로' 연결 |
| :--- | :--- | :--- |
| 🛰️ 테크 트랙 (**기본**) | `TrackSignalFeed`(affinity 주입 — 렌즈·내 궤도 배지) | `add-orbit` (컴포넌트 내장, `onOrbitAdded` 콜백) |
| 📡 시그널 | `SignalSection`(`limit=4` + "전체 보기 →") | `/add` 고정 제목 |
| 🤖 프롬프트 | `PromptSection` | `/add` 고정 제목 |
| 🇯🇵 어학 | `JapaneseSection` | `/add` 고정 제목 |

- **채널 이동 = 상단 가로 책갈피 탭 클릭**(전 화면 공통·sticky). 각 탭은 전부 펼침(compact 해제). 세로 레일은 2분할 컬럼 폭 잠식으로 기각
- '궤도로'는 오늘 궤도에 동일 제목 존재 시 `✓ 추가됨`으로 멱등 처리

## 3. 상태 매트릭스

| 상태 | 히어로 | 리포트 | 실행/복기(일기장) | 구독 CTA |
| :--- | :--- | :--- | :--- | :--- |
| 비로그인 | 로그인 CTA | 숨김 | 로그인 CTA 카드 | 숨김 |
| 로그인·신호 없음 | — | LoopReport 자체 숨김 | 빈 궤도 안내/입력 | 미구독 시 노출 |
| 로그인·활성 | — | 노출(드릴다운) | 풀 기능 | 구독 상태별 |

## 4. 데이터 페치 원칙 (§계획 §3)
- **셸 1회 페치 후 주입**: `profile`(`GET /api/pacenote/profile`) → LoopReport·TrackSignalFeed·OrbitSection (두 컴포넌트는 옵션 prop, 미제공 시 자체 페치 하위호환)
- 오늘 콘텐츠: `GET /api/daily/{KST today}` (공개, 글로벌 캐시 유지)
- 사용자 상태: `usePaceNoteData`(웹 REST ↔ 데스크톱 IPC 단일 계약). 과거 날짜 열람은 `GET /api/pacenote/day/:date`, 오늘 타임라인은 `GET /`의 timeline 재사용

## 5. GA4 퍼널 (Phase D — [funnel.js](../../src/components/relearn/funnel.js))

| 이벤트 | 시점 | 파라미터 |
| :--- | :--- | :--- |
| `relearn_learn_view` | 페이지 진입 | — |
| `relearn_orbit_add` | 궤도 추가 성공 | `source: track\|signal\|prompt\|jp\|custom\|recommend`, track은 `domain` |
| `relearn_complete_toggle` | 완료 토글 | — |
| `relearn_reflect_save` | 회고 저장 | — |
| 보조 | `relearn_channel_select{channel}`(책갈피 탭) · `relearn_dock_tab{tab}` · `relearn_subscribe` · `relearn_login_cta` | |

> 재편으로 폐지된 이벤트: `relearn_view_records`(기록 탭)·`relearn_daily_mode`(훑어보기/정독).

## 6. 반응형 (≤760px)
- 2분할 → 1열 리플로우: 교재 전폭 + 책갈피 탭 상단 가로(sticky), 일기장은 **하단 고정 도크(탭하면 시트 확장)**
- 스탯 그리드 2열, 카드 단열

## 7. 접근성·모션
- 채널 앵커 `aria-label`/`title`, 리포트 래퍼 키보드 진입(Enter), `prefers-reduced-motion` 전환 제거

## 8. 과거 날짜 뷰 `/relearn/daily/:date` (교재/일기장 재편 반영 2026-07-27)

과거 날짜도 **오늘과 동일한 `DailyView`·동일 골격**으로 렌더된다 — 별도 아카이브 페이지 `ReLearnDaily.jsx`는 일자축 Phase 2에서 `DailyView`로 병합·삭제됐다. 분기만 다르다:

- **헤더**: 브레드크럼 `ReLearn › 아카이브` + 📅 "{date} Daily Digest" + 서브카피. 시간 네비(`DailyWeekStrip`)는 오늘과 공통.
- **교재(좌)**: 오늘과 동일 — `DailyBriefing` + 상단 가로 책갈피 탭(카테고리별, 각 탭 전부 펼침). 단 '＋일기장 궤도에 추가' 브리지는 오늘만.
- **일기장(우)**: `DiaryDock` **열람 모드** — 그날의 실행·복기를 `GET /api/pacenote/day/:date`로 조회(일 해상도 우선, 전환 이전 날짜는 그 날이 속한 주 기록으로 폴백). 오늘 날짜의 아카이브 URL은 `/relearn`로 수렴(중복 소멸).
- **폐지**: 구 아카이브의 훑어보기/정독 모드·별도 스티키 채널 내비·읽기모드 토글(`rl_daily_readmode`)·`relearn_daily_mode` 이벤트는 **책갈피 탭 통일로 제거**.
- **URL·SEO**: `/relearn/daily/:date` canonical 자기참조(영속 자산), 구 `/daily/:date`는 301 유지. 메타는 `server.mjs` 주입.
