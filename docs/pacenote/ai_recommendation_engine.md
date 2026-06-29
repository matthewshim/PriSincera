---
status: active
domain: PaceNote
last_updated: 2026-05-21
version: v1.0
target_files:
  - pipeline/src/pacenote-composer.mjs
  - pacenote-api.mjs
  - admin-api.mjs
---

# 🤖 PriSincera PaceNote AI 추천 확장 및 데이터 기반 고도화 계획서 (AI Recommendation Expansion & Data-Driven Optimization)

## 📝 Revision History

| Version | Date | Author | Description | Impact Area |
| :--- | :--- | :--- | :--- | :--- |
| v1.0 | 2026-05-21 | AI Agent | Firestore Decoupling, Dynamic Ejection 및 AI Feedback Loop를 포함한 추천 엔진 설계서 작성 | AI Recommendation Engine |

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
2. **Velocity(1일 평균 선택률) 기반 하위권 퇴출:** `(누적 선택 횟수) ÷ (풀 생존 일수)` 공식을 통해 목표의 성과를 정규화(Normalize)합니다. 150개를 초과할 시 이 Velocity 점수가 가장 낮은 궤도부터 우선적으로 잘라냅니다.
3. **신생 궤도 보호(Grace Period):** 생성된 지 7일 미만인 궤도는 아직 선택받을 기회가 적었으므로 평가 유예(보호) 상태를 부여받습니다.

### 2.3. 스스로 진화하는 AI 피드백 루프 (AI Feedback Loop / Phase 3)
단순한 파이프라인 자동화가 아닌, 유저 반응을 학습하는 Flywheel 구조를 탑재했습니다.
- **명예의 전당(Hall of Fame) 추출:** `pacenote-composer.mjs` 가동 시, 최소 2번 이상 선택받은 궤도 중 **Velocity 기준 최상위 3개**를 자동으로 색출합니다.
- **동적 프롬프트 주입(Dynamic Few-Shot Prompting):** 색출된 상위 3개의 궤도를 Gemini Flash 호출 직전 시스템 프롬프트에 *"유저들에게 폭발적인 반응을 얻은 우수 사례"*로 동적 주입합니다.
- **효과:** AI가 유저들의 최신 선호도를 바탕으로 톤앤매너, 구조, 난이도를 자가 학습하여 궤도 퀄리티를 폭발적으로 향상시킵니다.

---

## 3. 백엔드 및 파이프라인 모듈 (Modules Reference)

1. **`pacenote-api.mjs` (Front-facing API)**
   - `/api/pacenote/` 엔드포인트에서 `config/pacenote_daily_pool`을 읽어와 무작위 3개를 셔플하여 유저에게 추천합니다.
2. **`admin-api.mjs` (Admin CMS & Insights API)**
   - `/admin/api/pacenotes/pool` : 전체 풀 관리(CRUD) 및 자동 시딩. 유저 데이터를 집계하여 Pool Stats(`picks`, `clears`)를 병합 반환합니다.
3. **`pipeline/src/pacenote-composer.mjs` (Automated Data-Driven Cron Job)**
   - 매일 자정에 구동되어 Gemini API 호출 -> 150개 Cap 유지 및 복합 퇴출 -> 명예의 전당 프롬프트 피드백을 단독으로 처리하는 메인 파이프라인입니다.

---

## 4. 향후 로드맵 (Next Steps & Future Roadmap)
- [ ] **초개인화 하이브리드 추천:** 특정 유저가 `Mindset` 관련 궤도만 반복적으로 완료할 경우, 해당 카테고리에 가중치(Weight)를 부여해 **맞춤형 항목 2개 + 탐색형(Random) 항목 1개**를 배합하여 추천하는 큐레이션 알고리즘 고도화.
- [ ] **계절성(Seasonality) 메타데이터:** 주말/연말/연초 등 특정 시기에만 등장하는 궤도(예: "연말 회고록 작성하기")를 위한 Time-based Active 룰 추가.
