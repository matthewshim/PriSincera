---
status: draft
domain: ReLearn
last_updated: 2026-07-09
version: v1.0
target_files:
  - src/pages/DailyDigest.jsx
  - src/pages/PaceNoteDashboard.jsx
  - src/components/daily/TrackSignalFeed.jsx
  - src/components/pacenote/LoopReport.jsx
---

# 🏃 리런 (ReLearn) — 통합 서비스 리뉴얼 추진 계획

> **한 줄 요지**: 분리된 **Daily Digest(배움)** 와 **Pace Note(실행·복기)** 를 *하나의 여정*으로 묶는 신규 통합 서비스. 명칭 **리런(ReLearn)** 은 "**다시 배우다(Re-Learn) + 다시 달리다(Re-run·러너)**"의 이중 의미로, **"제로부터 다시 배우는 러너"** 뉘앙스를 이름 한 단어로 전달한다.
>
> 태그라인: **"매일 제로에서, 다시 배우고 다시 달린다 — Learn from zero, run again."**

## 📝 Revision History

| Version | Date | Author | Description | Impact Area |
| :--- | :--- | :--- | :--- | :--- |
| v1.0 | 2026-07-09 | AI Agent | 통합 서비스(리런) 명칭 확정 + 추가형 리뉴얼 추진 계획 최초 수립 | ReLearn, DailyDigest, PaceNote |

---

## 1. 배경 — 왜 지금, 왜 통합인가
- 철학상 **배움(Daily Digest) → 실행(Pace Note 궤도) → 복기(Voyage Log)** 는 원래 한 몸(성장 플라이휠)이나, **메뉴가 둘로 분리**돼 사용자가 루프를 체감하지 못한다.
- 백엔드는 이미 연결됨 — [[growth-loop-plan]](Phase 0~4): 완료/회고 신호 → 추천 개인화, 궤도 도메인 → 다이제스트 렌즈, 루프 리포트. **통합 UX = 이 연결을 화면에서 보이게 하는 마지막 표면 작업.**

## 2. 명칭 결정 (Resolved)
> **결정(2026-07-09)**: **리런 (ReLearn)** 채택.

| 후보 | 뉘앙스 | 결과 |
| :--- | :--- | :--- |
| **리런 (ReLearn)** | Re-Learn(다시 배우다) + Re-run(다시 달리다·러너). 통합을 이름이 상징 | ✅ **채택** |
| 제로런 (ZeroRun) | "제로부터 다시"의 직역 — 명확하나 직설 | 후보 |
| 데이원 (Day One) | 초심/비기너 마인드 — 러너 직접성 약함 | 후보 |
| 베이스캠프 (Base Camp) | 여정·재정비 — 배움/러너 직접성 약함 | 후보 |

## 3. 통합 서비스 컨셉 (하나의 여정)
분리된 2탭 → **단일 "리런" 진입점**에서 하루의 루프를 3-stage 흐름으로:
```
┌─ 리런 (오늘) ──────────────────────────────────────┐
│  ─ 성장 루프 리포트 (완료율·연속·집중 도메인) ─          │
│  ① 배움   오늘의 다이제스트·테크 트랙(내 궤도 도메인 상단)  │
│  ② 실행   원클릭 '실행의 궤도에 추가' → 오늘 할 일         │
│  ③ 복기   완료 체크 + 한 줄 회고                        │
└────────────────────────────────────────────────────┘
```
- **비로그인**: 배움 중심(진입장벽↓) → 로그인 유도
- **로그인**: 루프 전체 노출(개인화 추천·렌즈·리포트)

## 4. 추진 전략 — 추가형(Additive), 무파괴
> **핵심 제약**: 기존 카테고리(Daily Digest·Pace Note)는 **그대로 두고**, 신규 버전을 **병렬 추가**한다.
- 신규 라우트 **`/relearn`** + 네비 진입점 **1개 추가** — 기존 `/daily`·`/pacenote` **URL·SEO 완전 보존**
- **기존 컴포넌트 재사용**([DailyDigest](../../src/pages/DailyDigest.jsx)·[TrackSignalFeed](../../src/components/daily/TrackSignalFeed.jsx)·[PaceNote 조각](../../src/pages/PaceNoteDashboard.jsx)·[LoopReport](../../src/components/pacenote/LoopReport.jsx))을 조합하는 **셸(composition) 레이어**만 신규 → 로직 리라이트 0, 저위험
- 검증 후에만 기존 메뉴 → 신규 점진 유도(전환은 마지막·선택)

## 5. 추진 로드맵 (Phase Gate)

### ☐ Phase A — 확정·설계
- [ ] 명칭·태그라인 확정 (✅ 리런 결정) / 로고·컬러 토큰 정합(디자인 시스템)
- [ ] IA·와이어프레임(3-stage: 배움·실행·복기) + 비로그인/로그인 분기 정의
- **DoD**: 화면 구조·컴포넌트 매핑표 확정.

### ☐ Phase B — 통합 셸 구축
- [ ] `/relearn` 신규 라우트 + `ReLearn.jsx` 셸 (기존 컴포넌트 조합)
- [ ] 상단 LoopReport + ① 배움(DailyDigest/TrackSignalFeed) + ② 실행 + ③ 복기 배치
- **DoD**: 기존 3개 화면 기능이 한 화면에서 동작, 기존 라우트 무손상.

### ☐ Phase C — 진입점·온보딩
- [ ] 헤더/홈 네비에 "리런" 추가(기존 메뉴 유지)
- [ ] 통합 온보딩(첫 방문 시 루프 개념 1-스텝 안내)
- **DoD**: 신규 진입점 노출, 기존 진입점 병존.

### ☐ Phase D — 개인화 표면화·지표
- [ ] Phase 2/3 추천·렌즈·리포트를 통합 화면에 노출(추천 사유 라벨·내 궤도 배지)
- [ ] 핵심 지표 계측(완료율·루프 회기당 체류·재방문)
- **DoD**: 로그인 유저가 개인화된 하루 루프를 한 화면에서 완주.

### ☐ Phase E — (선택) 점진 전환
- [ ] 지표 양호 시 기존 `/daily`·`/pacenote` → `/relearn` 유도(리다이렉트/배너)
- **DoD**: 전환율·이탈 모니터링 후 결정.

## 6. 리스크 & 대응
| 리스크 | 대응 |
| :--- | :--- |
| 정보 과부하(두 서비스 합침) | 3-stage 단계 노출 · 비로그인은 배움만 |
| 기존 URL/SEO 손실 | 기존 라우트 **완전 보존**(추가형) |
| 중복 유지보수 | 신규는 **조합 셸**만 — 로직 중복 없음 |
| 로그인 상태별 혼선 | 상태별 UX 분기(비로그인=배움, 로그인=루프 전체) |

## 7. 성공 지표
- 루프 **완주율**(배움→실행→복기 한 세션 내) ↑
- **재방문(D7/D30)** ↑ — 통합이 습관 형성에 기여하는가
- 궤도 추가·완료율 ↑, 다이제스트 궤도 연결 카드 CTR ↑

## 8. 참조
- 성장 루프(백엔드 연결): [[growth-loop-plan]]
- Daily Digest UI/정책: [content_sourcing_policy](../daily-digest/content_sourcing_policy.md) · [ui_specification](../daily-digest/ui_specification.md)
- PaceNote 전략·추천: [product_strategy](../pacenote/product_strategy.md) · [ai_recommendation_engine](../pacenote/ai_recommendation_engine.md)
- 디자인 시스템: [design_system](../core/design_system.md)
