---
status: draft
domain: PaceNote
last_updated: 2026-06-29
version: v1.0
target_files:
  - pacenote-api.mjs
  - pipeline/src/pacenote-composer.mjs
  - pipeline/src/tech-composer.mjs
  - server.mjs
  - src/pages/PaceNoteDashboard.jsx
  - src/pages/DailyDigest.jsx
  - src/components/daily/TrackSignalFeed.jsx
---

# 🔄 성장 루프 닫기 — 실행 계획안 (Growth Loop Closure)

> **한 줄 요지**: 새 제품·신규 AI 비용 없이, 이미 저장 중인 `completed`·회고 신호를 *읽기 시작*하는 것만으로 **배움 → 실행 → 복기 → (개인화) 배움** 플라이휠을 닫는다. 모방 불가능한 데이터 해자를 만든다.
>
> 본 문서는 제품 전략 [product_strategy](product_strategy.md) 및 [ai_recommendation_engine](ai_recommendation_engine.md)의 후속 실행 계획으로, **단계별(Phase) 체크리스트와 완료기준(DoD)** 을 따라 점진 구현한다.

## 📝 Revision History

| Version | Date | Author | Description | Impact Area |
| :--- | :--- | :--- | :--- | :--- |
| v1.0 | 2026-06-29 | AI Agent | 성장 루프 닫기 5-Phase 실행 계획 최초 수립 (현황 진단·데이터 모델·되먹임·마일스톤) | PaceNote, DailyDigest |
| v1.1 | 2026-06-29 | AI Agent | **Phase 0·1 구현 완료** — pacenote-api 신호 적재(recordSignal)·`GET /profile`, pacenote-composer 야간 권위 reconcile | pacenote-api.mjs, pacenote-composer.mjs |

---

## 1. 배경과 목적

PriSincera는 **프로덕트 우선** 방향으로 진화한다. 현재 4개 제품(Daily Digest·PaceNote·Builder's Log·Sylphio)은 각각 동작하지만 **서로 복리로 엮이지 않는다.** 가장 높은 레버리지는 새 제품이 아니라 **기존 제품을 하나의 성장 루프로 용접**하는 것이다.

브랜드 철학의 척추 = **배움(Daily Digest) → 실행(PaceNote 궤도) → 복기(Voyage Log) → 다시 배움**. 이 루프를 닫으면:
- 유저마다 루프가 **복리로 누적** → 리텐션·차별화
- 세 단계를 모두 소유해야만 가능 → **경쟁 모방 불가(해자)**

## 2. 현황 진단 — 루프가 끊긴 지점

| 단계 | 현재 상태 | 갭 |
| :--- | :--- | :--- |
| 배움 → 실행 | 테크 트랙 `action_challenge` → "실행의 궤도에 추가" | ✅ 연결됨 |
| 실행 신호 | `currentPace[].completed` **저장은 됨** | ❌ **아무도 안 읽음** |
| 복기 신호 | `statement` / Voyage Log 회고 저장 | ❌ 분석·환류 0 |
| 실행/복기 → 배움 | — | ❌ **귀환 경로 자체가 없음** |
| 다이제스트 개인화 | 전원 동일(글로벌 GCS) | ❌ 개인 궤도와 무관 |

**핵심 증거**: [pacenote-composer.mjs:27-31](../../pipeline/src/pacenote-composer.mjs#L27-L31)의 추천 풀 통계(`poolStats`)는 **"선택(pick)"만** 신호로 사용하고, 같은 `currentPace` 배열의 **`completed` 필드를 무시**한다. → *고르기만 한 목표*와 *실제 완료한 목표*가 동급. 추천 품질의 근본 한계.

## 3. 설계 원칙 (비용·정합성 사수)

> ⚠️ **Daily Digest는 글로벌 정적 파일(트래픽 비용 ≈ 0)이 핵심 자산이다. 콘텐츠를 유저별로 재생성하지 않는다.**

1. **글로벌 콘텐츠는 글로벌 그대로.** 개인화는 그 위에 얹는 **경량 "렌즈"(재정렬·하이라이트)** 로만 구현.
2. **신호는 Firestore, 콘텐츠는 GCS** — 분리 유지.
3. **규칙 기반 우선.** 비싼 AI 종합(주간 코치)은 [ai_recommendation_engine](ai_recommendation_engine.md) 후속(Bet ③). 본 계획은 그 **입력 데이터를 미리 적재**하는 선까지.
4. **Gemini 호출 증가 0** — 본 계획의 모든 되먹임은 신규 생성 없는 집계·재정렬.

## 4. 데이터 모델

### 4-1. 유저 성장 프로파일 (신규) — `pacenotes/{uid}` 루트 문서 `profile` 필드
```js
profile: {
  domainAffinity: {              // 가중 집계 (완료=3, 선택=1, 소비=0.5)
    ai_llm: 12, system_design: 5, devops: 2, tech_lead: 8,
    Mindset: 4, Learning: 9, Productivity: 3, /* … */
  },
  completion: { picked: 40, completed: 27, rate: 0.68 },
  streak:     { current: 6, best: 14, lastActiveDate: '2026-06-29' },
  level:      'senior',          // 트랙 수준(자가설정 또는 추론)
  recentReflections: [           // 최근 회고 N개 (텍스트 — Bet③ 입력 예약)
    { weekId: '2026-W26', text: '리팩토링 자동화에서 막힘', ts: /* … */ }
  ],
  updatedAt: /* … */
}
```
- 갱신: **이벤트 시 증분**(`FieldValue.increment`) + **야간 정합**(composer 재계산 1패스).

### 4-2. 기존 스키마 활용 (변경 최소)
- `currentPace[].completed` — **이미 존재**, 신호원으로 승격.
- (선택) 완료 시각 필요 시 `completedAt` 1필드 추가.
- 회고 텍스트는 `statement`/Voyage 필드 재사용(없으면 `reflection` 1필드 추가).
- 도메인/카테고리 메타 출처: [pacenote-api.mjs TRACK_DOMAIN_META](../../pacenote-api.mjs#L297-L302) (ai_llm/system_design/devops/tech_lead) + 일반 카테고리.

## 5. 되먹임 메커니즘 (루프의 두 귀환로)

### 5-A. 복기/실행 → 추천 엔진 (최고 ROI, 가장 저렴)
[pacenote-composer.mjs](../../pipeline/src/pacenote-composer.mjs)의 통계를 **완료 가중**으로 교체:
```
기존:  velocity           = picks / daysAlive
변경:  completionVelocity = (completes*3 + picks) / daysAlive
```
- **고인물 퇴출 v2**: "많이 선택됐지만 완료율 낮은" 목표 = *매력적이지만 실행 불가* → 우선 퇴출.
- `replenishRecommendations`를 **affinity 인지형**으로: 추천 3개 = `2 강점/관심 도메인 + 1 스트레치(컴포트존 밖)`. 최종 3개 선별을 `pacenote-api` GET 시 **서버측에서**(글로벌 풀 + 유저 profile) 수행.

### 5-B. 실행 → 배움 (다이제스트 개인화 렌즈)
- 콘텐츠는 글로벌 유지. `GET /api/daily/:date`(인증형 변형)에 **재정렬 렌즈** 추가: 유저의 활성 궤도 도메인과 일치하는 **테크 트랙 도메인을 상단/하이라이트**, 약점 도메인 1개를 "보강 제안"으로.
- 다이제스트에 **"당신의 궤도와 연결된 오늘의 배움"** 카드: 지금 *실행 중인* 도메인의 오늘 트랙 카드를 끌어와 노출 → 실행→배움 귀환을 **가시화**.

## 6. API 표면 (신규/확장)

| 메서드 | 경로 | 역할 |
| :--- | :--- | :--- |
| PATCH | `/api/pacenote/orbit/:id` (또는 기존 업데이트 경로) | 완료 토글 시 `profile` 증분 |
| POST | `/api/pacenote/reflection` | 회고 저장 + `recentReflections` |
| GET | `/api/pacenote/profile` | 성장 프로파일 조회(루프 리포트·Growth Profile 공용) |
| GET | `/api/daily/:date?lens=<uid>` (인증) | 개인화 렌즈 재정렬 |

## 7. UI 표면

1. **PaceNote**: 추천 카드에 "왜 추천됐는지" 미세 라벨(예: `AI/LLM 강점 기반` / `스트레치`).
2. **Daily Digest**: 상단 "**당신의 궤도와 연결된 오늘의 배움**" 1카드 + 트랙 도메인 개인화 정렬.
3. **주간 루프 리포트**(경량): `배움 N · 실행 M(완료율 %) · 복기 K → 내일 강조 도메인` 한 장.

## 8. 파이프라인 변경
- `pacenote-composer.mjs`: poolStats **완료 가중** + 야간 `profile` 정합 1패스 추가.
- **신규 콘텐츠 생성 없음 → Gemini 호출 증가 0**(비용 중립).

---

## 9. 단계별 실행 로드맵 (Phase Gate)

> 각 Phase는 **완료기준(DoD)** 을 충족해야 다음으로 진행. Phase 0→2가 핵심 가치의 80%.

### ✅ Phase 0 — 계측 (Instrumentation) — **완료(2026-06-29)**
*개인화는 아직 없음. 신호 적재만 시작.* 구현: `recordSignal()` ([pacenote-api.mjs](../../pacenote-api.mjs))
- [x] `pacenotes/{uid}.profile` 스키마 도입 (set+merge, `FieldValue.increment`)
- [x] 완료 토글(`/toggle`) → `domainAffinity[key] += 2`, `completion.completed ±1` (pick +1과 합산 시 완료=3)
- [x] add-orbit / add / accept(`pick`) → `domainAffinity[key] += 1`, `completion.picked += n`
- [x] 회고 저장(`/diary`) → `profile.reflections[weekId] = {text, ts}` (배열 대신 weekId 맵 — 멱등 갱신)
- **DoD ✅**: 5개 핸들러가 행동을 `profile`에 증분 적재. best-effort(실패가 핵심 기능 미차단).

> 📌 구현 메모: affinity 키는 정규화 슬러그(`'AI/LLM'→'ai_llm'`)로 테크 도메인 키와 통일. 회고는 `reflections` 맵으로 저장하고 `GET /profile`이 `recentReflections` 배열(최신 5)로 변환.

### ✅ Phase 1 — 프로파일 집계·정합 — **완료(2026-06-29)**
- [x] `pacenote-composer` 야간 `profile` 권위 재계산 1패스(weeks→profile, 증분 드리프트 보정·자가치유)
- [x] `streak` = **연속 완료 주차 수**(current) + 최장 연속(best). affinity는 `완료=3·선택=1` 가중
- [x] `GET /api/pacenote/profile` — `domainAffinity·completion.rate·streak·recentReflections` 반환
- **DoD ✅**: 구문 검증 통과, 야간 재계산이 최근 10주 기준 권위 값 산출.

> 📌 reconcile는 기존 유저 스캔 루프(추천 풀 통계)에 1패스를 얹어 **추가 읽기 비용 ≈ 0**. Gemini 호출 증가 0.

### ☐ Phase 2 — 추천 환류 (5-A) ★최고 ROI
- [ ] poolStats를 **완료 가중**(`completes*3 + picks`)으로 교체
- [ ] 고인물 퇴출 v2(저완료·고선택 우선 퇴출) 반영
- [ ] `replenishRecommendations` affinity 인지형(2 강점 + 1 스트레치)
- [ ] 최종 추천 3개 선별을 `pacenote-api` GET 서버측으로 이동
- **DoD**: 동일 유저가 자주 *완료*하는 도메인 추천 비중↑, 추천 채택률 A/B 비교 가능.

### ☐ Phase 3 — 다이제스트 개인화 렌즈 (5-B)
- [ ] `GET /api/daily/:date` 인증형 렌즈(궤도 도메인 상단 정렬 + 보강 1)
- [ ] DailyDigest "당신의 궤도와 연결된 오늘의 배움" 카드
- [ ] (옵트인) 소비 비콘 → `domainAffinity += 0.5`
- **DoD**: 활성 궤도 도메인이 다이제스트 상단에 노출, 카드 CTR 계측.

### ☐ Phase 4 — 루프 가시화 UI
- [ ] 주간 루프 리포트(배움·실행·복기·내일 강조) 1화면
- [ ] 추천 카드 "추천 사유" 라벨
- **DoD**: 유저가 자신의 루프를 한 장으로 인지.

## 10. 리스크 & 대응

| 리스크 | 대응 |
| :--- | :--- |
| 비용(개인화가 정적 모델 깸) | 콘텐츠 글로벌 유지, **렌즈는 재정렬만**. Gemini 호출 0 |
| 콜드 스타트(신규 유저 신호 0) | affinity 비면 **글로벌 인기/HOF로 폴백** |
| 필터 버블(같은 것만 추천) | 추천 3개 중 **1개는 의무적 스트레치** |
| 프라이버시 | 소비 비콘은 **옵트인**, 프로파일은 본인만(공개는 Growth Profile 옵트인) |
| 증분/정합 드리프트 | 이벤트 증분 + **야간 재계산**으로 보정 |

## 11. 성공 지표
- **완료율**(picked → completed) ↑ — 루프가 행동을 바꾸는가
- **D7 / D30 리텐션** ↑ — 복리 효과
- **추천 채택률** ↑ / **고인물(저완료·고선택) 비율** ↓
- 다이제스트 **궤도 연결 카드 CTR**

## 12. 범위 밖 (의도적 분리)
- **풀 AI 성장 코치**(회고 텍스트 종합·주간 맞춤 가이드) = 후속 베팅(Bet ③). 본 계획은 그 **입력 데이터(`profile`·`recentReflections`)를 미리 적재**하는 선까지.
- **Growth Profile 공개 페이지**(전 유저 성장 기록 = 이력 페이지 대체) = 후속 베팅(Bet ②). 본 계획의 `profile`이 그 데이터 원천.

## 13. 참조
- [product_strategy](product_strategy.md) — PaceNote 제품 전략
- [ai_recommendation_engine](ai_recommendation_engine.md) — 추천/퇴출 알고리즘 (본 계획의 환류 대상)
- [content_sourcing_policy](../daily-digest/content_sourcing_policy.md) — 테크 트랙 하이브리드 소싱
- [architecture_overview](../core/architecture_overview.md) — 전체 데이터 흐름
