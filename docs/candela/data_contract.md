---
status: draft
domain: Candela
last_updated: 2026-08-19
version: v1.2
target_files:
  - (미구현) src/data/candela/schema.mjs
  - (미구현) src/data/candela/fixtures/
  - (미구현) candela-worker/ (별도 private 저장소)
---

# 🏗️ 캔델라 데이터 계약 (Data Contract)

## 📝 Revision History

| Version | Date | Author | Description | Impact Area |
| :--- | :--- | :--- | :--- | :--- |
| v1.0 | 2026-08-19 | AI Agent | 최초 정의 — UI 선행 개발 전제. 퍼블릭 계약에서 금액·수량 필드를 스키마 레벨로 배제, `dataSource` 판별 필드·해시 체인 규정 | Candela UI, Worker |
| v1.1 | 2026-08-19 | AI Agent | 다중 시장 반영 — asOfByMarket·baseCurrency·allocationPct·benchmarks[] 배열화·fxContributionPct(환차손익 분리)·journal.market 추가. aggregation을 주간 **고정값**으로 확정 | Candela UI, Worker |
| v1.2 | 2026-08-19 | AI Agent | 명세 공백 보완 — §2-2 벤치마크 지수 출처·fxContributionPct 산출식 명문화. 결정 변경 없음 | Candela UI, Worker |

---

## 0. 이 문서가 먼저 있어야 하는 이유

UI를 먼저 만드는 방식의 최대 위험은 **더미 데이터가 스키마를 결정해버리는 것**이다. "보기 좋은 지표"로 목업을 만들면, 실제 체결 데이터에서 계산할 수 없거나 계산이 비싼 값이 화면에 박히고, 나중에 UI와 Worker를 둘 다 다시 만들게 된다.

따라서 순서는 **계약 → 픽스처 → 화면**이다. 픽스처는 이 계약을 준수해야만 하고, 화면은 픽스처만 소비한다.

> **검수 기준**: 이 문서의 모든 필드는 "실제 체결·시세 데이터에서 계산 가능한가"를 통과해야 한다. 통과하지 못하는 지표는 UI에 올리지 않는다.

## 1. 구조적 방어 — 퍼블릭 계약에 금액·수량이 없다

[product_strategy §5](product_strategy.md)의 공개 원칙은 "금액·수량 비공개, 비율만"이다. 이를 **런타임 필터링이 아니라 스키마 레벨에서** 강제한다.

> **퍼블릭 계약에는 금액·수량 필드가 아예 정의되지 않는다.**
> 존재하지 않는 필드는 실수로 렌더링할 수 없다. 필터링은 잊을 수 있지만 부재는 잊을 수 없다.

| 계층 | 저장소 | 금액·수량 | 종목 식별 |
| :--- | :--- | :--- | :--- |
| **퍼블릭** (GCS) | 누구나 조회 | ❌ 스키마에 없음 | 선택(정책 결정 전까지 섹터만) |
| **Admin** (Firestore) | `super_admin` 전용 | ✅ 실값 | ✅ |

## 2. 퍼블릭 계약

경로: `gs://prisincera-prisignal-data/candela/`
프런트는 기존 daily 피드와 동일한 프록시 패턴으로 읽는다.

### 2-1. 공통 봉투 (Envelope)

모든 퍼블릭 문서가 공유하는 최상위 필드.

```jsonc
{
  "schemaVersion": 1,
  "dataSource": "live",        // "live" | "fixture"  ← UI 워터마크 판별의 유일한 근거
  "generatedAt": "2026-11-21T07:00:00+09:00",
  "asOf": "2026-11-20",        // 통합 공개 기준일 (T+1 이상 지연)
  "baseCurrency": "KRW",       // 모든 비율의 기준 통화
  "markets": ["KRX", "US"],
  "asOfByMarket": {            // 휴장일이 서로 다르므로 시장별 기준일을 함께 싣는다
    "KRX": "2026-11-20",
    "US":  "2026-11-19"
  },
  "integrity": {
    "prevHash": "sha256:…",    // 전일 레코드 해시 — 소급 조작 시 체인이 깨진다
    "hash": "sha256:…"
  }
}
```

**`dataSource`가 계약에 있는 것이 핵심이다.** UI는 환경변수나 빌드 플래그가 아니라 **데이터 자체**를 보고 샘플 여부를 판단한다. 데이터와 표시가 분리되면 언젠가 어긋난다.

**`asOfByMarket`이 필요한 이유**: 대상 시장이 국내+미국(2026-08-19 결정)이라 휴장일이 어긋난다. 한쪽만 열린 날 통합 `asOf`만 싣으면 "어제 데이터가 왜 안 바뀌었지"를 UI가 설명할 수 없다.

### 2-2. `performance/summary.json`

```jsonc
{
  // …envelope…
  "inception": "2026-11-01",
  "metrics": {
    "cumulativeReturnPct": 12.4,   // baseCurrency(KRW) 기준 — 환차손익 포함
    "cagrPct": 18.1,
    "maxDrawdownPct": -8.7,        // 항상 음수 또는 0
    "sharpe": 1.02,
    "winRatePct": 54.5,
    "tradeCount": 88,
    "avgHoldingDays": 6.2,
    "exposurePct": 62.0,           // 평균 투자 비중
    "fxContributionPct": 1.8       // 위 수익률 중 환율이 기여한 몫 (전략 성과와 분리)
  },
  "allocationPct": { "KRX": 55.0, "US": 45.0 },
  "benchmarks": [
    { "market": "KRX", "name": "KOSPI",   "cumulativeReturnPct":  4.1, "maxDrawdownPct": -11.2 },
    { "market": "US",  "name": "S&P 500", "cumulativeReturnPct":  9.6, "maxDrawdownPct":  -7.4 },
    { "market": "BLENDED", "name": "배분 가중", "cumulativeReturnPct": 6.6, "maxDrawdownPct": -9.5 }
  ]
}
```

**벤치마크는 선택이 아니라 필수다.** 절대 수익률만 보여주는 실적 페이지는 아무것도 증명하지 못한다. 시장이 둘이므로 **배열**로 싣고, 배분 가중 벤치마크(`BLENDED`)를 대표값으로 쓴다 — KOSPI 하나와 비교하면 미장 비중만큼 왜곡된다.

> **벤치마크 지수 데이터 출처**: `benchmarks[]`의 KOSPI·S&P 500 수치는 Worker가 증권사 API의 지수 시세로 산출한다(별도 벤더 없음). `BLENDED`는 벤더값이 아니라 그 시점 `allocationPct`로 가중한 파생값이므로, 배분이 바뀌어도 소급 재계산하지 않고 전진 계산한다. 지수 원시값은 재배포 금지 대상이므로([product_strategy §5](product_strategy.md)) 퍼블릭에는 누적수익률·MDD 같은 파생치만 싣는다.

**`fxContributionPct`를 분리하는 이유**: 기준 통화가 KRW라 미국 포지션의 성과에 환차손익이 섞인다. 이를 합산해 제시하면 **전략이 잘한 것인지 환율이 도운 것인지 구분할 수 없다.** 정직성 원칙([product_strategy §5](product_strategy.md))상 분리 표기한다.

> **`fxContributionPct` 산출**: 미국 포지션의 원화환산 수익률 `r_krw`에서 현지통화 수익률 `r_local`을 분리한다. `(1+r_krw) = (1+r_local)(1+r_fx)`에서 `fxContributionPct ≈ r_krw − r_local`(교차항은 무시 가능 수준)이고, 포트폴리오 전체 기여분은 미장 비중(`allocationPct.US`)으로 가중한다. 환율은 각 평가 시점의 매매기준율을 쓰며, 시점 정의는 [system_architecture §8-1](system_architecture.md)의 통합 정산(07:00 KST) 기준에 맞춘다.

### 2-3. `performance/equity_curve.json`

```jsonc
{
  // …envelope…
  "baseIndex": 100,                    // 시작 시점을 100으로 정규화 — 금액이 아니다
  "benchmarkRef": "BLENDED",           // 아래 benchmarkIndex가 어느 벤치마크인지 명시
  "points": [
    { "date": "2026-11-01", "navIndex": 100.0, "benchmarkIndex": 100.0, "drawdownPct": 0 },
    { "date": "2026-11-04", "navIndex": 101.2, "benchmarkIndex":  99.4, "drawdownPct": -0.3 }
  ]
}
```

`navIndex`는 지수이므로 **자산 규모를 역산할 수 없다.**

곡선의 `benchmarkIndex`는 **하나만** 싣고 `benchmarkRef`로 무엇인지 밝힌다. 기본값은 배분 가중(`BLENDED`)이다 — 시장이 둘인데 라인을 셋 겹치면 읽히지 않고, KOSPI 하나만 그리면 미장 비중만큼 왜곡된다. 시장별 상세 비교는 요약의 `benchmarks[]` 수치로 충분하다.

> `date`는 통합 영업일 기준이다. 한쪽 시장만 열린 날은 닫힌 쪽 포지션을 전일 종가로 평가해 이어붙인다(구멍을 만들지 않는다).

### 2-4. `journal/YYYY-MM.json`

```jsonc
{
  // …envelope…
  "aggregation": "weekly",       // **고정값** — 2026-08-19 결정. daily는 허용하지 않는다
  "entries": [
    {
      "period": "2026-11-16/2026-11-20",
      "market": "KRX",           // KRX | US
      "action": "BUY",           // BUY | SELL | HOLD
      "sector": "반도체",
      "symbol": null,            // 종목 공개 정책 확정 전까지 null (Q-4)
      "weightPct": 8.0,          // 포트폴리오 내 비중
      "holdingDays": 5,
      "returnPct": 2.1,          // SELL일 때만. 현지 통화 기준
      "reason": "20일선 상향 돌파 + 거래량 급증"
    }
  ]
}
```

> **일별 공개를 스키마에서 배제한 이유**: 보유 종목 수가 적을 때 일별 수익률 시계열로 종목·비중이 역산된다. "종목 비공개" 정책이 수익률 공개로 무력화되므로 `aggregation`은 **주간 고정**이다. 선택지로 두면 언젠가 바꾸게 된다.

> `returnPct`는 **현지 통화 기준**이다. 개별 매매의 성패에 환율을 섞지 않는다 — 환율 영향은 요약의 `fxContributionPct`가 담당한다.

## 3. Admin 계약 (Firestore — 비공개)

[system_architecture §7](system_architecture.md)의 컬렉션 정의를 스키마로 구체화한다. 클라이언트 직접 접근은 rules에서 전면 차단(서버 전용).

### 3-1. `candela_state/positions`

```jsonc
{
  "asOf": "2026-11-21T09:05:00+09:00",
  "positions": [
    {
      "symbol": "005930",
      "name": "삼성전자",
      "quantity": 12,            // 퍼블릭에는 절대 나가지 않는다
      "avgPrice": 71200,
      "lastPrice": 72900,
      "weightPct": 8.0,
      "unrealizedPct": 2.39,
      "openedAt": "2026-11-16"
    }
  ]
}
```

### 3-2. `candela_commands` (Admin → Worker)

```jsonc
{
  "id": "cmd_…",
  "type": "STRATEGY_ON",         // §4 enum만 허용
  "payload": { "strategyId": "ma-cross-v1" },
  "issuedBy": "matthew.shim@prisincera.com",
  "issuedAt": "…",
  "stepUpVerified": true,        // HALT 제외 전 명령에 필수
  "status": "pending"            // pending | applied | rejected
}
```

### 3-3. `candela_audit` (append-only)

```jsonc
{
  "at": "…",
  "kind": "ORDER_FILLED",        // COMMAND_ISSUED | ORDER_SENT | ORDER_FILLED | HALT | ERROR
  "detail": { /* 계좌번호는 마스킹 후 기록 */ },
  "raw": null                    // 브로커 raw dump 저장 금지 (N-6)
}
```

## 4. 명령 enum (변경 시 Worker와 동시 수정)

| type | step-up 재인증 | 비고 |
| :--- | :--- | :--- |
| `STRATEGY_ON` / `STRATEGY_OFF` | 필요 | |
| `SET_RISK_LIMIT` | 필요 | |
| `LIQUIDATE_ALL` | 필요 | |
| `HALT` | **불필요** | 정지는 안전한 방향 — 급할 때 마찰이 있으면 안 된다 |

Admin은 종목·수량을 지정할 수 없다. 산정은 전적으로 Worker의 전략 로직 소관이다.

## 5. 버전 관리

*   `schemaVersion`은 **하위 호환이 깨질 때만** 올린다. 필드 추가는 가산적(additive)으로 처리한다 — `data_contract_v2.md`가 확립한 원칙과 동일하다.
*   UI는 모르는 필드를 무시하고, 없는 선택 필드는 미표시로 처리한다.
*   `schemaVersion`이 UI 지원 범위를 넘으면 **수치를 렌더링하지 않고** 안내를 표시한다. 잘못된 숫자를 보여주는 것보다 아무것도 안 보여주는 게 낫다.

---

## 관련 문서
*   [📐 UI 구현 명세서](ui_specification.md) — 이 계약을 소비하는 화면
*   [🏗️ 시스템 아키텍처](system_architecture.md)
*   [🗺️ 제품 전략서 §5 공개 원칙](product_strategy.md)
*   [📜 보안 규범](security_spec.md)
