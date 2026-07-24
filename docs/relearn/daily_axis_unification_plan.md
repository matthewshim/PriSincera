---
status: draft
domain: ReLearn
last_updated: 2026-07-23
version: v1.0
target_files:
  - src/pages/ReLearn.jsx
  - src/pages/ReLearnDaily.jsx
  - src/components/relearn/LearnStage.jsx
  - src/components/relearn/RunStage.jsx
  - src/components/relearn/ReflectStage.jsx
  - src/components/relearn/RecordsView.jsx
  - src/components/relearn/OrbitSection.jsx
  - src/components/relearn/ReflectionSection.jsx
  - src/components/pacenote/LoopReport.jsx
  - src/components/daily/DailyWeekStrip.jsx
  - src/hooks/usePaceNoteData.js
  - pipeline/src/pacenote-api.mjs
  - pipeline/src/pacenote-composer.mjs
  - docs/data_contract_v2.md
---

# 🗓️ 리런 일자축 통일 (Daily-Axis Unification) 추진 계획

> **한 줄 요지**: 리런의 모든 것을 **하루(日)라는 단일 시간 축**으로 통일한다. 배움(콘텐츠)은 이미 일 단위이므로, 주(週) 단위로 남아 있던 **활동(실행·복기·기록)만 일 단위로 조정**하고, `/relearn`(오늘)과 `/relearn/daily/:date`(과거)를 **하나의 "날짜 뷰"로 통합**한다. 태그라인 *"매일 제로에서, 다시 배우고 다시 달린다"* 를 데이터·구조 차원에서 실현한다.

## 📝 Revision History

| Version | Date | Author | Description | Impact Area |
| :--- | :--- | :--- | :--- | :--- |
| v1.0 | 2026-07-23 | AI Agent | 초안 — 일자축 통일 방향 확정(오너 논의), 원인 진단·IA·데이터 전환·무손실 로드맵 수립 | ReLearn 전반, PaceNote 데이터 모델 |

---

## 1. 배경 — 왜 지금, 무엇이 문제인가

리런은 Daily Digest(배움)와 PaceNote(실행·복기)를 "하나의 여정"으로 통합했으나, 오너 리뷰에서 **"이게 진짜 통합인가"** 라는 근본 의문이 제기됐다. 원인을 코드로 추적한 결과, 통합이 흐려 보이는 실체는 **시간 축의 이중 리듬**이었다:

- **배움(콘텐츠)** = 매일 발행 → **일(日) 단위**. `/relearn/daily/:date`, `/api/daily/:date`.
- **활동(실행·복기·기록)** = 주간 궤도 → **주(週) 단위**. Firestore `pacenotes/{uid}/weeks/{weekId}`.

이 리듬 불일치 때문에 ① 오늘 뷰(`/relearn`, 기능축 3-stage)와 아카이브(`/relearn/daily/:date`, 시간축)의 **구조가 어긋나고**, ② 아카이브가 "따로 노는 페이지"처럼 보이며, ③ 오늘 콘텐츠가 두 곳에서 중복된다.

> **핵심 통찰**: 리런의 대부분은 **이미 일 단위로 돌고 있다.** 궤도 생성 파이프라인은 매일 실행(`pacenote-composer` `0 0 * * *`)되고, 추천 통계(velocity·퇴출 TTL·affinity·완료율)는 절대시간(일) 기반이다. 유독 **"활동을 담는 그릇(주간 문서)의 수명"만 7일**이라 리듬이 어긋났다. 그 하나를 1일로 맞추면 전체가 일자 축으로 통일된다.

## 2. 목표·원칙

- **단일 시간 축**: 하루를 최상위 단위로. 오늘도 과거도 "그 날"의 배움+실행+복기.
- **구조 통일**: `/relearn`과 `/relearn/daily/:date`를 하나의 날짜 뷰 컴포넌트로 수렴 → 이질감·중복 소멸.
- **무손실·무파괴**: 기존 URL·SEO 자산 보존, 과거 데이터 보존(주 아카이브), 단계별 독립 배포.
- **꾸준함의 심리**: streak을 "끊기면 0" 압박이 아니라 "쌓여가는 실천"으로. 부족해도 꾸준함을 격려.

## 3. IA / 라우팅 설계 — 하나의 날짜 뷰

```
        [ 시간 네비 (주간 스트립/캘린더) — 상시 최상위 ]
                          │
   /relearn (date 없음)          /relearn/daily/:date
   = 오늘 날짜 뷰                = 특정 날짜 뷰
        └──────── 동일 DailyView 컴포넌트 ────────┘
                          │
   그 날짜의:  ① 배움 4채널  ② 실행(궤도)  ③ 복기  + 루프 리포트(상시)
   · 오늘  → 실행/복기 인터랙션 활성 (궤도 추가·완료·회고)
   · 과거  → 그날 완료한 궤도·회고 열람 (completedAt 도입 후)
   · 비로그인 → 배움 + 루프 유도 CTA
```

- **라우트 2개, 컴포넌트 1개**: `ReLearn.jsx`(오늘 3-stage)와 `ReLearnDaily.jsx`(아카이브)를 **하나의 `DailyView`로 수렴**. date param 없으면 오늘(KST).
- **URL·SEO 보존**: `/relearn` canonical = `/relearn`(오늘은 매일 바뀜), `/relearn/daily/:date` canonical = 자기참조(영속 자산). 기존 `/daily/:date` 301도 유지.
- **"기록 뷰" 재편**: 현재 주차 카드 기반 `오늘 | 기록` 토글(RecordsView)은 **날짜 뷰들의 시간 오버뷰**(캘린더/타임라인)로 재편 — 특정 날짜 클릭 시 그 날짜 뷰로. 별도 주차 전용 뷰는 소멸.
- **시간 네비**: 이미 만든 [DailyWeekStrip](../../src/components/daily/DailyWeekStrip.jsx)이 이 축의 씨앗. 오늘/과거 공통 상단 네비로 승격·확장.

## 4. 데이터 스키마 전환 (주 → 일)

| 항목 | 현재 (주) | 전환 후 (일) |
| :--- | :--- | :--- |
| 활동 문서 | `pacenotes/{uid}/weeks/{weekId}` (ISO 주) | `pacenotes/{uid}/days/{date}` (YYYY-MM-DD) |
| 문서 특정 | `getWeekNumber(now)` | `getDayId(now)` (일자, 로직 단순화) |
| 완료 시각 | **없음** (`completed: boolean`만) | **`completedAt` 신설** — 일 해상도 확보 |
| 회고 | 주간 `statement` 1개 | 일자별 회고 |
| streak | 연속 완료 "주" | 누적/빈도 "일" + grace day (§5) |
| 추천 통계 | 이미 절대시간(일) 기반 | **변경 없음** (윈도우 "10주"→"N일" 재정의만) |

- **이미 일 기반이라 안 건드리는 것**: 궤도 생성 파이프라인, velocity·퇴출(TTL 45일)·HOF, 완료율, domainAffinity.
- **재설계 필요한 유일한 로직**: streak(§5). 나머지는 그릇 교체 + `weekId→date` 형상 + 카피("이번 주"→"오늘").
- **API 파급**: `pacenote-api.mjs`의 9개 엔드포인트(`/`, `/add`, `/add-orbit`, `/toggle`, `/exclude`, `/restore`, `/accept`, `/diary`, `/orbit-ids`)가 "현재 주 문서"를 "오늘 문서"로 치환. 기계적이나 지점이 많아 회귀 테스트 필수.

## 5. streak 재설계 — "꾸준함" 격려 (오너 결정)

압박이 아니라 격려로. 세부 옵션(구현 시 택1·병용):

- **누적·빈도 프레이밍**: "🔥 N주 연속" → "이번 달 N일 실천" / "최근 7일 중 N일". 끊김을 0으로 만들지 않고 쌓임을 보여줌.
- **grace day**: 하루이틀 걸러도 연속 유지(유예). "부족해도 꾸준히"의 직접 구현.
- 노출부: [LoopReport.jsx](../../src/components/pacenote/LoopReport.jsx)의 "N주" 카피·계산을 일 기반으로. 성장 루프 문서([growth_loop_plan](../pacenote/growth_loop_plan.md))의 streak 정의 동반 개정.

> 리런의 "매일 다시"는 "매일 완벽히"가 아니라 "매일 돌아오기"다. streak 설계가 이 철학을 배신하지 않아야 한다.

## 6. 마이그레이션 — 이원 스키마 (과거 보존)

**결정적 제약**: 과거 완료·회고에 시각(`completedAt`)이 없어 **특정 "일"로 소급 불가**. 따라서:

- **과거(주 문서)**: 읽기 전용 아카이브로 **보존**. 기존 RecordsView 렌더 경로 유지 → 시간 오버뷰에서 "주 단위 과거"로 표시.
- **신규(일 문서)**: 전환 시점부터 `days/{date}` 클린 생성.
- **경계 시점**: 전환일 이전 = 주 해상도, 이후 = 일 해상도. 오버뷰가 두 해상도를 자연스럽게 잇는다.
- pacenotes weeks 전용 마이그레이션 도구는 **현재 없음** → 신규 작성 불필요(소급 안 하므로), 대신 **읽기 어댑터**가 주/일 문서를 합류.

## 7. 단계별 로드맵 (무손실 순서)

각 Phase는 독립 배포 가능하며, 앞 단계가 뒤 단계의 데이터·구조를 미리 확보한다.

### ☐ Phase 0 — `completedAt` 가산 (즉시·무손실)
- `Task`에 `completedAt` 1필드 추가, `/toggle` 시 타임스탬프 기록([pacenote-api.mjs](../../pipeline/src/pacenote-api.mjs) toggle 핸들러). 데이터 계약 additive.
- **무손실 베팅**: 이후 어떤 결정을 하든 오늘부터 미래 데이터를 일 해상도로 확보. 과거는 못 살려도 미래는 확보.
- DoD: 완료 토글이 시각을 남김, 기존 동작 무변화.

### ☐ Phase 1 — streak 재설계 (꾸준함 순화)
- streak 계산·카피를 §5대로 누적/빈도 + grace day로. LoopReport·composer·growth_loop_plan 정합.
- DoD: streak이 압박 아닌 격려로 노출, 완료율 낮은 유저의 붕괴감 완화.

### ☐ Phase 2 — 날짜 뷰 컴포넌트 통합 (구조)
- `ReLearn.jsx` + `ReLearnDaily.jsx` → 단일 `DailyView`. 오늘/과거가 같은 구조. date param 분기.
- 시간 네비(DailyWeekStrip) 상단 상시화, `오늘 | 기록` 토글 → 시간 오버뷰로 재편.
- 이 단계까지는 **데이터는 아직 주 문서**를 읽되, 오늘 활동을 날짜 뷰에 표시(과거는 주 아카이브).
- DoD: 오늘·과거가 동일 화면 구조, 이질감·중복 해소. SEO·URL 무손실.

### ☐ Phase 3 — 활동 그릇 전환 (주→일 문서)
- `weeks/{weekId}` → `days/{date}`. API 9개 엔드포인트 전환, `usePaceNoteData` 형상 `weekId→date`. 이원 스키마(과거 주 아카이브 보존).
- 추천 composer 순회 윈도우 "10주"→"N일" 재정의. velocity/퇴출/HOF 무접촉.
- DoD: 신규 활동이 일 문서로, 회귀 테스트(9개 엔드포인트) 통과.

### ☐ Phase 4 — 과거 날짜에 활동 결합 + 정리
- `completedAt`이 충분히 쌓인 뒤, 과거 날짜 뷰에 "그날 완료한 궤도·회고" 결합.
- 카피("이번 주"→"오늘") 전수 정리, 데이터 계약(data_contract_v2) week→day 개정, 레거시 컴포넌트(`PaceNoteWeeklyCalendar`·`ChronoRibbon` 데드코드) 삭제.
- DoD: 전 화면·문서 일자축 정합, 데드코드 0.

## 8. 리스크 & 대응

| 리스크 | 대응 |
| :--- | :--- |
| 과거 데이터 일 소급 불가 | 이원 스키마 — 과거 주 아카이브 보존, 신규만 일(§6). Phase 0을 최우선으로 미래 확보 |
| 매일 실천 부담 증가 → 이탈 | streak 순화(§5, grace day·누적 프레이밍), "매일 돌아오기" 톤 |
| API 9개 전환 회귀 | Phase 3 별도 브랜치 + 엔드포인트별 회귀 테스트, 이원 읽기 어댑터로 점진 |
| SEO/URL 손실 | 라우트 2개·컴포넌트 1개 구조로 기존 URL 전부 보존, canonical 규칙 유지 |
| macOS/IPC 계약 | 앱 폐기·구현체 없음 → 문서(data_contract_v2) 정합 이슈만, 런타임 리스크 0 |
| 작업 범위 과대 | Phase 0~4 독립 배포·무손실 순서. Phase 0·1만으로도 부분 가치 |

## 9. 성공 지표

- 오늘·과거 화면 **구조 동일성**(이질감 해소), 오늘 콘텐츠 중복 소멸.
- 일 단위 루프 완주(그날 배움→실행→복기) — GA4 퍼널을 일 세션 기준으로 재정의.
- streak 순화 후 재방문(D7/D30) 유지·개선, 완료율 낮은 유저의 이탈 악화 없음.
- 전 화면·문서·데이터의 일자축 정합(잔여 "주" 카피 0).

## 10. 참조

- 통합 원본 전략: [product_strategy](product_strategy.md) (본 계획은 그 §3 "오늘만 + 지난 다이제스트" 구조를 일자축 통합으로 심화)
- 성장 루프·streak 정의: [growth_loop_plan](../pacenote/growth_loop_plan.md)
- 데이터 계약(주→일 개정 대상): [data_contract_v2](../data_contract_v2.md)
- 아카이브 상세 현행 명세: [ui_specification §8](ui_specification.md)
- 추천 엔진(주차 풀 통계): [ai_recommendation_engine](../pacenote/ai_recommendation_engine.md)
