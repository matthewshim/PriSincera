---
status: active
domain: ReLearn
last_updated: 2026-07-22
version: v1.1
target_files:
  - src/pages/ReLearn.jsx
  - src/pages/ReLearn.css
  - src/pages/ReLearnDaily.jsx
  - src/pages/ReLearnDaily.css
  - src/components/daily/DailyBriefing.jsx
  - src/components/daily/SignalSection.jsx
  - src/components/daily/PromptSection.jsx
  - src/components/daily/JapaneseSection.jsx
  - src/components/relearn/LearnStage.jsx
  - src/components/relearn/RunStage.jsx
  - src/components/relearn/ReflectStage.jsx
  - src/components/relearn/RecordsView.jsx
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

---

## 1. 화면 구조 (위 → 아래)

```
[컴포넌트 구조 — 1-3 리팩터] ReLearn.jsx(셸: 상태·핸들러·SEO·스크롤스파이)
  ├─ LearnStage(①배움 존·책갈피·아카이브) · RunStage(②궤도) · ReflectStage(③일지)
  ├─ RecordsView(기록 뷰·.md 내보내기) · OrbitSection · ReflectionSection · LoopReport
  └─ daily 공용: TrackSignalFeed·Signal/Prompt/JapaneseSection (compact prop)

GNB (ReLearn 활성 시 relearn-theme·cyan)
├─ 히어로(표준 서비스 히어로 규격 — Daily/PaceNote/Builder's Log 동일 패턴):
│         🪐 아이콘(3rem float) · "ReLearn"(--font-display 3rem 700, --gradient-brand) ·
│         태그라인(1.15rem --crystal-light) · ①배움→②실행→③복기 칩 ·
│         [비로그인] 로그인 CTA 1개(gold)
├─ 온보딩 배너(첫 방문 1회, localStorage `relearn_onboarded_v1`)
├─ 뷰 탭: [오늘 | 기록]
├─ 루프 리포트(LoopReport 재사용 — 두 뷰 공통, 클릭=기록 드릴다운)
│
├─ [오늘 뷰] 스테이지 레일 (56px 좌측 열 + 그라데이션 궤도선)
│   ├─ ① 배움 📚  ← 마커 아래 레일 2뎁스 채널 앵커(🛰️📡🤖🇯🇵, 그룹 스티키)
│   │    · ②③ 스테이지 스크롤 구간에서는 2뎁스 비노출(faded)
│   │    · 채널 스크롤스파이(양방향 책갈피): 기준선(뷰포트 260px)을 지난
│   │      마지막 채널 섹션이 자동 하이라이트 — 내리면 다음, 올리면 이전
│   │    4채널 연속 스택(트랙→시그널→프롬프트→어학) + '궤도로' + 구독 문맥 CTA + 아카이브 링크
│   │    · 전체 보기·아카이브 날짜 → /relearn/daily/:date (자체 아카이브 상세 — 독립 운영 Phase 1)
│   │    · 기록 뷰: 항해 기록 .md 내보내기 툴바 (PaceNote 포트폴리오 내보내기 자체화)
│   ├─ ② 실행: 궤도 검색 모달(누적 추천 풀 검색·↑↓/Enter — PaceNote 옴니 검색 승계)
│   │    · 미완료 궤도 hover × 제외 — soft(excluded 플래그, POST /exclude)·목록/진행률에서만 숨김
│   │    · '제외된 궤도 N개 보기' 접기에서 ↩ 복원(POST /restore) — 데이터 영구 보존
│   ├─ ② 실행 ⛵  OrbitSection(진행바·토글·자유 입력·AI 추천+사유 라벨)
│   └─ ③ 복기 📝  ReflectionSection(디바운스 1.2s 자동저장, 1000자)
│   └─ 루프 닫힘 푸터
│
└─ [기록 뷰] 주차 카드 목록: 현재 주(진행 중 배지·n/total) + timeline
     완료 궤도(카테고리 칩) + 회고 인용(gold) / 회고 없음 표기
```

## 2. 배움 4채널 (§계획 v1.3) — '전체' 채널 제거, 4채널 연속 스택 + 스크롤스파이 책갈피로 대체

| 채널 | 컴포넌트 | '궤도로' 연결 |
| :--- | :--- | :--- |
| 🛰️ 테크 트랙 (**기본**) | `TrackSignalFeed`(affinity 주입 — 렌즈·내 궤도 배지) | `add-orbit` (컴포넌트 내장, `onOrbitAdded` 콜백) |
| 📡 시그널 | `SignalSection`(`limit=4` + "전체 보기 →") | `/add` 고정 제목 |
| 🤖 프롬프트 | `PromptSection` | `/add` 고정 제목 |
| 🇯🇵 어학 | `JapaneseSection` | `/add` 고정 제목 |

- **채널 이동 = 좌측 레일 2뎁스 앵커 클릭**(데스크톱) / 인라인 칩(모바일), 활성 표시는 스크롤스파이 자동 — 상단 스티키 바 금지(콘텐츠 가림 QA 반영)
- '궤도로'는 이번 주 동일 제목 존재 시 `✓ 추가됨`으로 멱등 처리

## 3. 상태 매트릭스

| 상태 | 히어로 | 리포트 | ②실행/③복기 | 구독 CTA |
| :--- | :--- | :--- | :--- | :--- |
| 비로그인 | 로그인 CTA | 숨김 | 로그인 CTA 카드 | 숨김 |
| 로그인·신호 없음 | — | LoopReport 자체 숨김 | 빈 궤도 안내/입력 | 미구독 시 노출 |
| 로그인·활성 | — | 노출(드릴다운) | 풀 기능 | 구독 상태별 |

## 4. 데이터 페치 원칙 (§계획 §3)
- **셸 1회 페치 후 주입**: `profile`(`GET /api/pacenote/profile`) → LoopReport·TrackSignalFeed·OrbitSection (두 컴포넌트는 옵션 prop, 미제공 시 자체 페치 하위호환)
- 오늘 콘텐츠: `GET /api/daily/{KST today}` (공개, 글로벌 캐시 유지)
- 사용자 상태: `usePaceNoteData`(웹 REST ↔ 데스크톱 IPC 단일 계약) — 기록 뷰도 동일 `GET /`의 timeline 재사용(**신규 API 0**)

## 5. GA4 퍼널 (Phase D — [funnel.js](../../src/components/relearn/funnel.js))

| 이벤트 | 시점 | 파라미터 |
| :--- | :--- | :--- |
| `relearn_learn_view` | 페이지 진입 | — |
| `relearn_orbit_add` | 궤도 추가 성공 | `source: track\|signal\|prompt\|jp\|custom\|recommend`, track은 `domain` |
| `relearn_complete_toggle` | 완료 토글 | — |
| `relearn_reflect_save` | 회고 저장 | — |
| 보조 | `relearn_channel_select{channel}` · `relearn_view_records` · `relearn_subscribe` · `relearn_login_cta` | |

## 6. 반응형 (≤760px)
- 레일·마커 숨김 → **스테이지 앵커 탭**(스티키) + 채널 칩 **인라인(비스티키)**
- 스탯 그리드 2열, 카드 단열

## 7. 접근성·모션
- 채널 앵커 `aria-label`/`title`, 리포트 래퍼 키보드 진입(Enter), `prefers-reduced-motion` 전환 제거

## 8. 아카이브 상세 `/relearn/daily/:date` (UI 재편 2026-07-22)

> 원칙: **Overview first, details on demand.** 전량 펼침(비-compact) 스택이 유발한 스크롤·가독 피로(21아티클 카드 포함 9,753px)를, 정보 손실 0으로 훑어보기 구조로 전환(기본 6,099px). 컴포넌트: `ReLearnDaily.jsx` + `DailyBriefing.jsx`.

```
헤더(← ReLearn · 날짜 타이틀 · 이전/다음 네비)
├─ 스티키 채널 내비(.rl-daily-sticky, top 76px/모바일 64px):
│    4채널 앵커 칩(존 컬러 동기화·시그널 카운트 배지·스크롤 스파이 top≤220px 기준) +
│    읽기 모드 토글 [훑어보기(기본) | 정독] — localStorage `rl_daily_readmode` 유지
├─ 오늘의 브리핑(.rl-brief): 채널 스탯 4종 · 정독 예상 시간(≈총 자수/500자·분) ·
│    DM Pick 헤드라인 5(클릭 → `sig-pick-N` 카드 앵커 점프)
└─ 4채널 존(rl-ch-sec, 기존 존 스킨 그대로) — 훑어보기 시 각 존 우상단 '전체 펼치기' 부분 토글
     ① 트랙: compact(학습·할 일 <details> 접힘)
     ② 시그널 이원화: DM Pick만 카드형(이미지 유지) + 나머지 1줄 헤드라인 리스트(.signal-headline-row)
     ③ 프롬프트: compact(스니펫 프리뷰 접힘 — 모드 전환 시 key 리마운트로 재초기화)
     ④ 어학: compact(어휘 4개 상한)
```

- **정독 모드 = 기존 아카이브 전량 렌더와 동일** (하위호환·정보 보존). 크롤러는 CSR 본문을 못 보므로 접힘의 SEO 영향 없음(메타는 server.mjs 주입 유지) — i18n SSR(백로그 4-2) 진행 시 접힘 콘텐츠 DOM 포함 여부만 재확인.
- §2의 "상단 스티키 바 금지"는 좌측 레일이 있는 `/relearn` 셸에 한정 — 아카이브 상세는 레일이 없어 스티키 내비가 유일한 지도(모바일 셸의 스티키 스테이지 탭과 동일 관례, 컴팩트 1줄·블러 배경으로 가림 최소화).
- GA 보조 이벤트 추가: `relearn_daily_mode{mode}` · `relearn_daily_jump{zone}` · 존 펼침은 기존 `relearn_learn_expand{block: daily_zone_*}` 재사용.
