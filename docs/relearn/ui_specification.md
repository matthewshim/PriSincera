---
status: active
domain: ReLearn
last_updated: 2026-07-15
version: v1.0
target_files:
  - src/pages/ReLearn.jsx
  - src/pages/ReLearn.css
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

---

## 1. 화면 구조 (위 → 아래)

```
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
│   │    · 미완료 궤도 hover × 제외(실수 정정, POST /remove — 완료 항목 불가)
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
