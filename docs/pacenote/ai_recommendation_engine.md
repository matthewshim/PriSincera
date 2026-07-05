---
status: active
domain: PaceNote
last_updated: 2026-06-29
version: v1.1
target_files:
  - pipeline/src/pacenote-composer.mjs
  - pacenote-api.mjs
  - admin-api.mjs
---

# 🏗️ PaceNote AI 추천 엔진 명세서

## 📝 Revision History

| Version | Date | Author | Description | Impact Area |
| :--- | :--- | :--- | :--- | :--- |
| v1.0 | 2026-05-21 | AI Agent | Firestore Decoupling, Dynamic Ejection 및 AI Feedback Loop를 포함한 추천 엔진 설계서 작성 | AI Recommendation Engine |
| v1.1 | 2026-06-29 | AI Agent | 성장 루프 Phase 2 반영 — Velocity를 **완료 가중**으로, HOF를 **완료 우선**으로, 추천을 **affinity 인지형(강점+스트레치)**으로 갱신. 로드맵 ①(초개인화) 구현 완료 처리. [[growth-loop-plan]] 크로스링크 | pacenote-composer.mjs, pacenote-api.mjs |

## 1. 개요 및 목표 (Overview & Objectives)
초기 `PaceNoteDashboard`의 'AI 추천 가이드'는 `pacenote-api.mjs` 내부에 하드코딩된 15개의 `AI_RECOMMENDATION_POOL` 배열에 의존하고 있었습니다. 
본 문서는 **이 하드코딩된 데이터를 Firestore DB(`config/pacenote_daily_pool`)로 분리(Decoupling)**하고, LLM 파이프라인(`pacenote-composer.mjs`)을 통해 **방대하고 트렌디한 추천 궤도를 무한 공급하는 자동화 아키텍처**에 대한 명세입니다. 특히, 단순 생성을 넘어 유저의 성과 데이터를 분석해 차트 고착화를 방지하고, AI의 프롬프트를 자동 개선하는 **데이터 기반 피드백 루프(Data-Driven Feedback Loop)** 구축 과정을 상세히 기록합니다.

---

## 2. 아키텍처 현황 및 구현 완료 내역 (Implementation Status)

### 2.1. 데이터베이스 분리 및 자동 시딩 (Phase 1)
- **중앙 관리형 Pool (`config/pacenote_daily_pool`) 구축:** 더 이상 코드를 배포하지 않아도 실시간으로 목표가 갱신됩니다.
- **Admin Dashboard 연동:** 관리자가 직접 AI 추천 궤도를 추가/수정/삭제할 수 있는 CMS를 `/admin` 내에 구현하였습니다.
- **자동 시딩(Auto-Seeding) 방어 로직:** DB가 비어있는 최초 실행 시, `admin-api.mjs`에서 기존의 검증된 우수 목표 15개를 자동으로 Insert 하도록 방어 로직을 마련했습니다.
- **유저 행동 통계 애그리게이션:** 모든 유저의 `pacenotes/{uid}/weeks` 문서를 스캔하여, 각 AI 목표별 **'선택된 횟수(Picks)'** 및 **'달성된 횟수(Clears)'**, 그리고 **'달성률(Win Rate %)'**을 관리자 대시보드에 실시간으로 시각화합니다.

### 2.2. 고인물 방지형 동적 퇴출 알고리즘 (Dynamic Ejection / Phase 2)
DB 용량 및 성능 최적화를 위해 추천 풀은 **최대 150개**로 제한(Cap)됩니다. 매일 새로운 목표 3개가 추가될 때 발생하는 초과분 처리에 정교한 퇴출(Eviction) 알고리즘을 적용했습니다.
1. **수명 제한(TTL) 강제 퇴출:** 아무리 인기 있는 궤도라도 생성일로부터 **45일**이 지나면 즉시 풀에서 강제 은퇴시킵니다. (생태계 강제 순환 및 최신성 유지)
2. **완료 가중 Velocity 기반 하위권 퇴출 (v1.1 갱신):** `(완료 횟수 × 3 + 선택 횟수) ÷ (풀 생존 일수)` 공식으로 성과를 정규화합니다. **'선택만 받고 완료되지 않는'(고인물) 궤도는 점수가 낮아 우선 퇴출**되고, 실제 완료되는 궤도가 생존합니다. 150개 초과 시 이 점수가 가장 낮은 궤도부터 잘라냅니다.
3. **신생 궤도 보호(Grace Period):** 생성된 지 7일 미만인 궤도는 아직 선택받을 기회가 적었으므로 평가 유예(보호) 상태를 부여받습니다.

### 2.3. 스스로 진화하는 AI 피드백 루프 (AI Feedback Loop / Phase 3)
단순한 파이프라인 자동화가 아닌, 유저 반응을 학습하는 Flywheel 구조를 탑재했습니다.
- **명예의 전당(Hall of Fame) 추출 (v1.1 갱신):** `pacenote-composer.mjs` 가동 시, **실제 '완료된' 궤도를 우선**으로(콜드 스타트 시 2회 이상 선택으로 폴백) 완료 가중 Velocity 최상위 3개를 색출합니다. → "선택받은" 사례가 아니라 "**실제로 끝까지 해낸**" 사례를 학습.
- **동적 프롬프트 주입(Dynamic Few-Shot Prompting):** 색출된 상위 3개의 궤도를 Gemini Flash 호출 직전 시스템 프롬프트에 *"유저들에게 폭발적인 반응을 얻은 우수 사례"*로 동적 주입합니다.
- **효과:** AI가 유저들의 최신 선호도를 바탕으로 톤앤매너, 구조, 난이도를 자가 학습하여 궤도 퀄리티를 폭발적으로 향상시킵니다.

---

## 3. 백엔드 및 파이프라인 모듈 (Modules Reference)

1. **`pacenote-api.mjs` (Front-facing API)**
   - `/api/pacenote/` 엔드포인트에서 `config/pacenote_daily_pool`을 읽어, **유저 성장 프로파일(`getAffinity`)을 반영해 affinity 인지형으로 선별**합니다(v1.1): **강점 도메인 위주 + 마지막 1개는 스트레치(약점/미접촉)**. 프로파일이 없는 콜드 스타트 유저는 기존 무작위 셔플로 폴백.
   - `GET /api/pacenote/profile` — 유저 성장 프로파일(`domainAffinity`·`completion.rate`·`streak`·`recentReflections`) 반환. 추천 개인화·루프 리포트 공용. 상세: [[growth-loop-plan]].
2. **`admin-api.mjs` (Admin CMS & Insights API)**
   - `/admin/api/pacenotes/pool` : 전체 풀 관리(CRUD) 및 자동 시딩. 유저 데이터를 집계하여 Pool Stats(`picks`, `clears`)를 병합 반환합니다.
3. **`pipeline/src/pacenote-composer.mjs` (Automated Data-Driven Cron Job)**
   - 매일 자정에 구동되어 Gemini API 호출 -> 150개 Cap 유지 및 복합 퇴출 -> 명예의 전당 프롬프트 피드백을 단독으로 처리하는 메인 파이프라인입니다.

---

## 4. 향후 로드맵 (Next Steps & Future Roadmap)
- [x] **초개인화 하이브리드 추천 — ✅ 구현 완료(2026-06-29, 성장 루프 Phase 0~2):** 유저의 완료/회고 신호를 `pacenotes/{uid}.profile.domainAffinity`로 집계(완료=3·선택=1 가중)하고, 추천을 **강점 도메인 2 + 스트레치 1**로 배합. 상세 설계·구현은 [[growth-loop-plan]].
- [ ] **계절성(Seasonality) 메타데이터:** 주말/연말/연초 등 특정 시기에만 등장하는 궤도(예: "연말 회고록 작성하기")를 위한 Time-based Active 룰 추가.
- [ ] **소비 신호 반영(`profile.consumption`):** Daily Digest 트랙 열람을 affinity에 합산(야간 reconcile 보존 필요). [[growth-loop-plan]] Phase 3 이연 항목.
- [ ] **AI 성장 코치:** `recentReflections`(회고)를 종합해 주간 맞춤 가이드 생성(후속 베팅 ③).

> 📌 본 추천 엔진의 데이터 기반 고도화는 [[growth-loop-plan]](배움→실행→복기→개인화 루프)의 핵심 환류로(5-A)로 통합되었습니다.
