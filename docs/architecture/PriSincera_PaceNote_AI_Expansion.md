# PriSincera PaceNote AI 추천 확장 계획서 (AI Recommendation Expansion Plan)

## 1. 개요 및 목표 (Overview & Objectives)
현재 `PaceNoteDashboard`의 'AI 추천 가이드'는 `pacenote-api.mjs` 내부에 하드코딩된 15개의 `AI_RECOMMENDATION_POOL` 배열에 의존하고 있습니다. 이는 초기 MVP(최소 기능 제품)로서는 훌륭하게 작동하지만, 사용자가 매일 접속하여 궤도를 추가할 경우 금방 추천 콘텐츠가 고갈되고 반복되는 한계가 있습니다.

본 계획서는 **이 하드코딩된 데이터를 Firestore DB로 분리(Decoupling)하고, 기존 PriSignal 자동화 파이프라인(LLM)을 활용하여 방대하고 개인화된 추천 궤도를 무한히 공급하는 시스템으로 확장**하기 위한 기술적 로드맵입니다.

---

## 2. 데이터 아키텍처 설계 (Data Architecture)

### 2.1. 신규 Firestore 컬렉션 (`pace_recommendations`)
추천 데이터를 중앙 관리하기 위한 독립적인 컬렉션을 신설합니다.

```json
// Collection: pace_recommendations
// Document ID: Auto-generated
{
  "title": "이번 주 배운 내용을 링크드인에 3줄 요약으로 공유하기",
  "category": "Branding", 
  "color": "#60A5FA",
  "tags": ["social", "career", "writing"],
  "difficulty": 2,           // 1~5 난이도 (향후 사용자 수준별 필터링용)
  "weight": 1.0,            // 노출 가중치 (트렌디한 주제일수록 높게 설정)
  "isActive": true,         // 노출 활성화 여부
  "createdAt": "2026-05-18T10:00:00.000Z",
  "source": "llm_pipeline"  // manual(수동) 또는 llm_pipeline(자동화)
}
```

### 2.2. 사용자 선호도 추적 (Personalization)
사용자가 `acceptRecommend`를 통해 추천을 수락하거나 완료(Complete)했을 때, 해당 Task의 `category`와 `tags`를 사용자 문서(`pacenotes/{uid}`)에 누적하여 **개인화 프로필(User Profile)**을 구축합니다.

---

## 3. 백엔드 API 최적화 전략 (API Optimization)

단순히 전체 DB를 매번 읽어오는 방식은 Firestore Read 비용(Quota)을 급증시킬 수 있습니다. 이를 방지하기 위한 캐싱 전략이 필요합니다.

### 3.1. Daily Pool 캐싱 구조 (비용 최적화)
1. **Daily Pool 갱신:** 매일 자정(00:00), Cloud Scheduler가 트리거되어 전체 `pace_recommendations` 중 활성화된 항목 100~200개를 무작위 또는 가중치 기반으로 추출하여 단일 문서(예: `config/pacenote_daily_pool`)에 저장합니다.
2. **API 호출 방식 변경:** 사용자 접속 시 `replenishRecommendations` 함수는 개별 문서를 수십 번 읽는 대신, `config/pacenote_daily_pool` 단일 문서를 1회(1 Read)만 읽고 서버 메모리에서 셔플하여 3개를 제공합니다.

---

## 4. LLM 파이프라인 연동 (Automated Content Pipeline)

기존 `PriSignal` 파이프라인(GCS + Cloud Run)의 유휴 시간을 활용하여 매일 새로운 '오늘의 목표'를 자동 생성합니다.

1. **파이프라인 단계 추가:** `pipeline/src/lib/` 하위에 `generatePaceRecs.mjs` 추가.
2. **프롬프트 엔지니어링:**
   - *Prompt:* "오늘 글로벌 비즈니스 트렌드(AI, Productivity, Management)를 반영하여, 바쁜 직장인이 30분 이내에 달성할 수 있는 마이크로 미션 10개를 생성해 줘. 각 카테고리별로 다양하게 구성할 것."
3. **자동 적재:** 생성된 10개의 데이터는 유효성 검사 후 Firestore `pace_recommendations`에 Insert 됩니다. (시의성이 지나는 이슈 기반 목표는 `isActive: false` 처리를 위한 TTL(Time-to-Live) 속성을 부여할 수 있습니다.)

---

## 5. 단계별 실행 로드맵 (Phased Execution)

### Phase 1: DB 마이그레이션 및 API 연동 (1~2일)
- [ ] 기존 15개 하드코딩 데이터를 Firestore `pace_recommendations` 컬렉션으로 마이그레이션.
- [ ] `pacenote-api.mjs`의 추천 로직을 Firestore 조회 방식으로 수정. (초기엔 단순 쿼리로 구현)

### Phase 2: Daily Pool 캐싱 아키텍처 도입 (2일)
- [ ] 매번 Query를 날리지 않고, 단일 문서나 Redis 기반으로 Pool을 가져와서 서버 내에서 셔플 후 제공하도록 성능 및 비용 최적화 적용.

### Phase 3: AI 파이프라인 자동화 (2~3일)
- [ ] `generatePaceRecs.mjs` 모듈 개발 및 프롬프트 최적화.
- [ ] 매일 아침 데일리 다이제스트 파이프라인 구동 시, 새로운 마이크로 목표도 5~10개씩 함께 생성하여 DB에 주입하도록 스케줄러 연동.

### Phase 4: 추천 알고리즘 고도화 (추후 과제)
- [ ] 유저의 완료(Complete) 패턴을 분석하여 특정 카테고리(예: Productivity) 편향 시, 가중치(Weight)를 부여해 맞춤형 항목 2개 + 탐색형(Random) 항목 1개를 섞어서 제공하는 하이브리드 추천 알고리즘 적용.
