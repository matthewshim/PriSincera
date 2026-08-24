---
status: draft
domain: Candela
last_updated: 2026-08-20
version: v1.3
target_files:
  - (미구현) src/pages/CandelaLanding.jsx
  - (미구현) src/pages/CandelaPerformance.jsx
  - (미구현) src/components/admin/CandelaPanel.jsx
  - (미구현) src/data/candela/fixtures/
  - src/App.jsx
  - ci/design-check.mjs
  - src/locales/ko.json
---

# 📐 캔델라 UI 구현 명세서 (UI Specification)

## 📝 Revision History

| Version | Date | Author | Description | Impact Area |
| :--- | :--- | :--- | :--- | :--- |
| v1.0 | 2026-08-19 | AI Agent | 최초 정의 — UI 선행(픽스처 기반) 개발 전제. 샘플 데이터 노출 차단 3중 게이트, 우선 설계 화면 2종, 실측 제약(i18n·토큰 규범) 반영 | App.jsx, design-check, locales |
| v1.1 | 2026-08-19 | AI Agent | 다중 시장(D-4) 반영 — 실적 대시보드에 시장 배분·환율 기여분·시장별 벤치마크 행 추가, 시장별 기준일 표기 규범 | Candela 퍼블릭 UI |
| v1.2 | 2026-08-19 | AI Agent | G-4(live 전환 검증) 게이트 추가 — G-2의 'fixture 오공개'와 대칭으로 '빈 live 공개' 차단. 결정 변경 없음 | design-check, App.jsx |
| v1.3 | 2026-08-20 | AI Agent | §2 🔒 퍼블릭 노출 최소 원칙(운영 세부 비공개) 신설 — Admin 경로·컬렉션·명령 enum·인프라·임계값 비노출. security_spec N-7의 UI 판. 결정 변경 없음 | Candela 퍼블릭 UI |

---

## 1. 개발 순서 — 화면이 먼저다

데이터가 아니라 화면을 먼저 확정한다. 근거는 셋이다.

1.  퍼블릭 페이지는 **표현 자체가 제품**이다 — "실적을 어떻게 보여주는가"가 홍보 효과를 결정한다.
2.  되돌리기 비용이 낮다 — UI는 고쳐도 잃는 게 없지만, 브로커 연동 후 스키마를 바꾸면 실계좌 이력이 꼬인다.
3.  차트 스택이 이미 정해져 있다 — [AdminDashboard.jsx](../../src/pages/AdminDashboard.jsx)가 recharts를 쓰므로 신규 의존성이 없고 따라야 할 선례가 있다.

단, **[data_contract.md](data_contract.md)가 이 문서보다 먼저다.** 픽스처는 계약을 준수해야 하고, 화면은 픽스처만 소비한다.

## 2. 🔴 샘플 데이터 노출 차단 (최우선 규범)

가짜 수익률이 실제 실적처럼 보이는 페이지가 공개되면 **날조된 기록을 게시하는 것**이다. 브랜드 신뢰가 곧 자산인 프로젝트에서 회복 불가하며, 라우터 한 줄 실수로 일어날 수 있다.

### 게이트 3중 + 전환 검증(G-4)

| # | 게이트 | 동작 |
| :--- | :--- | :--- |
| G-1 | **데이터 소스 선언** | `src/data/candela/dataSource.js`가 `CANDELA_DATA_SOURCE`를 `'fixture' \| 'live'`로 export. 단일 진실 원천 |
| G-2 | **빌드 차단** | `ci/design-check.mjs` 확장 — `CANDELA_DATA_SOURCE === 'fixture'`인데 `App.jsx`에 퍼블릭 `/candela` 라우트가 등록돼 있으면 **ERROR로 빌드 실패** |
| G-3 | **워터마크** | 렌더 데이터의 `dataSource`가 `fixture`면 **해제 불가능한 배너**를 상시 노출. 닫기 버튼 없음, `dismiss` 상태 없음 |
| G-4 | **live 전환 검증** | `dataSource`를 `live`로 바꾸고 `/candela` 라우트를 등록하는 시점에, GCS 실적 스냅샷의 **존재와 최신성**(`asOf`가 기대 범위 내인지)을 배포 게이트가 확인한다. G-2가 'fixture의 오공개'를 막는다면 G-4는 '빈 live의 공개'를 막는다 — 두 방향이 대칭을 이룬다 |

> **G-3이 환경변수가 아니라 데이터의 `dataSource` 필드를 보는 이유**: 데이터와 표시가 서로 다른 출처를 참조하면 언젠가 어긋난다. 화면에 그려지는 수치와 "샘플입니다"라는 표시는 **같은 객체에서 나와야** 한다.

### 개발 단계별 노출 범위

```
P2 Admin UI    →  /admin 인증 뒤. 퍼블릭 노출 0
P3 Public UI   →  퍼블릭 라우트 미등록 상태로 개발 (G-2가 강제)
P5 공개        →  실데이터 확보 후 라우트 등록 + G-2·G-4 통과
```

### 킬스위치는 목업하지 않는다

작동하는 것처럼 보이지만 아무것도 하지 않는 정지 버튼은 **없는 것보다 나쁘다.** 급할 때 눌렀는데 아무 일도 일어나지 않는 상황이 최악이다. 킬스위치 UI는 P4에서 실제 배선과 **동시에** 만든다. 그 전까지는 화면에 존재하지 않는다.

### 🔒 퍼블릭 노출 최소 원칙 (운영 세부 비공개)

§2가 "가짜 실적을 내보내지 않는다"라면 이 원칙은 "**운영 세부를 내보내지 않는다**"이다 — 둘 다 "화면에 무엇을 싣지 않는가"를 정한다. [security_spec N-7](security_spec.md)("원격 악용 가능 항목을 public에 기술 금지")의 UI 판이다.

퍼블릭 페이지(랜딩·실적·회고)는 시스템이 **작동함을 보이되**, 공격 표면이 되는 운영 세부는 노출하지 않는다.

**비노출 (MUST NOT)**
| 노출 금지 | 이유 |
| :--- | :--- |
| Admin 경로(`/admin` 등)·인증 방식(step-up·MFA) | 관리자 표면·인증 메커니즘 특정 |
| 컬렉션·큐 이름(`candela_commands` 등)·데이터 모델 | 내부 구조 정찰 |
| 명령 enum명(`STRATEGY_ON`…`HALT`)·재인증 매트릭스·엔드포인트 | 정확한 제어 API 노출 |
| 인프라·저장소명(GCS 버킷·Secret Manager·`candela-worker` repo)·브로커명 | 인프라 특정 |
| 탐지 임계값(예: "N분 내 주문 M건")·한도 실수치 | 탐지 회피 창 제공 |

**노출 허용 (서사 = 속성, 세부 아님)**: 3계층 분리·신뢰 경계·"인바운드 없음"·"임의 주문 불가"·킬스위치 존재·안전장치 개념·공개 원칙. 다이어그램·본문 라벨은 **역할 일반명**(운영 콘솔·실행 워커·실적 저장소·증권사 API)만 쓴다.

> 절제 자체가 신뢰 신호다 — "구체적 명령·인증·경로는 공개하지 않습니다"를 페이지에 명시하는 편이, 나열하는 것보다 강하다.

## 3. 실측 제약 (2026-08-19)

| 제약 | 결과 |
| :--- | :--- |
| [design-check](../../ci/design-check.mjs)의 `I18N_EXCLUDE`에 `src/components/admin/`·`AdminDashboard.jsx` 등재 | **Admin UI는 한국어 하드코딩 허용** — UI 반복을 여기서 하는 게 빠르다 |
| 퍼블릭 페이지는 제외 대상 아님 | `/candela` 화면은 **ko·en·ja 3종 전량 필수**. `candela` 네임스페이스 신설 (현 최상위 키: header·footer·buildersLog·home·relearn·errorBoundary) |
| CSS 토큰 규범 `EXCLUDE`는 파일 단위 등재 | **신규 Candela CSS는 규범 준수**(결정 2026-08-19). 6-4 선례는 기존 자산 대상이며, 신규 코드까지 예외로 두면 규범이 침식된다 |
| recharts 사용 중 | 차트 신규 의존성 0. 다크 테마 토큰 정합은 별도 확인 |

## 4. 우선 설계 화면 2종

전체 화면을 한 번에 만들면 반복 속도가 떨어진다. **디자인 반복이 실제로 필요한 것**만 먼저 한다.

### 4-1. Admin 대시보드 (`/admin` → Candela 탭)

매일 보는 화면. ko 하드코딩 허용 구역이라 반복이 빠르다.

| 영역 | 내용 | 소스 |
| :--- | :--- | :--- |
| 시스템 헬스 | Worker 마지막 실행 시각·다음 예정·오류 유무 | `candela_state` |
| 오늘 요약 | 당일 손익률·포지션 수·투자 비중 | `candela_state/positions` |
| 포지션 테이블 | 종목·수량·평단·현재가·비중·평가손익 | `candela_state/positions` |
| 최근 매매 | 최근 10건 (실수량 포함 — Admin이므로) | `candela_audit` |
| 전략 상태 | 활성 전략·파라미터 요약 | `candela_state` |

킬스위치 상태는 **표시**하되(현재 정지/가동), **조작 버튼은 P4까지 렌더링하지 않는다.**

### 4-2. Public 실적 대시보드 (`/candela/performance`)

홍보의 본체. 첫 화면 헤드라인은 **수익률이 아니라 시스템**이다([product_strategy §4](product_strategy.md)).

| 영역 | 내용 | 규범 |
| :--- | :--- | :--- |
| 히어로 | 시스템 한 줄 정의 + 가동 기간 + 데이터 기준일 | 수익률을 큰 폰트로 띄우지 않는다 |
| 자산곡선 | `navIndex` vs `benchmarkIndex` 라인 | **벤치마크 병기 필수.** `benchmarkRef`(기본 `BLENDED`)를 범례에 표기 |
| 드로다운 밴드 | 곡선 하단에 `drawdownPct` 영역 | MDD를 접거나 숨기지 않는다 |
| 지표 카드 | 누적수익률·MDD·샤프·승률·거래수·평균보유일 | **MDD를 수익률 옆 동급으로 배치** |
| **시장 배분** | `allocationPct` — KRX/US 비중 | 어느 시장에서 난 성과인지 밝힌다 |
| **환율 기여분** | `fxContributionPct` | **누적수익률 바로 옆에 배치.** "전략이 번 것"과 "환율이 도운 것"을 분리해 보여준다 |
| 시장별 벤치마크 | `benchmarks[]` — KOSPI·S&P 500 각각 | 배분 가중만으로는 시장별 상대 성과가 안 보인다 |
| 최악 구간 | 최대 낙폭 기간과 그때 무슨 일이 있었는지 | 첫 스크린에서 도달 가능해야 한다 |

> **`fxContributionPct`를 눈에 띄게 두는 이유**: 미장을 포함하면 원화 기준 수익률에 환차손익이 섞인다. 이걸 묻어두면 환율 덕에 좋아 보이는 실적을 전략 성과로 오인하게 만드는 셈이고, 그건 공개 원칙 6(손실 은폐 금지)의 정신에 어긋난다.

> **기준일 표기**: `asOfByMarket`으로 시장별 기준일이 다를 수 있다. 한쪽만 갱신된 날 "업데이트가 멈췄나?"로 읽히지 않도록 시장별 기준일을 명시한다.

> **금액·수량은 계약에 필드가 없다**([data_contract §1](data_contract.md)). UI에서 거를 필요조차 없다 — 애초에 오지 않는다.

## 5. 전체 화면 목록 (2종 이후)

**Public** — 언어팩 3종 필수
```
/candela              랜딩 · 시스템 소개 · 아키텍처
/candela/performance  실적 대시보드          ★ 우선
/candela/journal      매매 로그 (주간 집계)
/candela/notes        전략 해설 · 회고
```

**Admin** — Candela 탭 서브탭
```
대시보드    ★ 우선        시그널        오늘 발생분
포지션                    주문 내역      감사 로그 뷰
전략 목록·파라미터        리스크 한도    발행 검토(publish)
킬스위치    ← P4에서 실제 배선과 동시
```

기능성 화면(주문 내역·감사 로그·리스크 설정)은 표준 테이블 패턴으로 충분하며 디자인 반복 대상이 아니다.

## 6. 픽스처

### 6-1. 3 시나리오 — 상승만 만들지 않는다

우상향 곡선 목업을 몇 주 보면 기대치가 그쪽으로 고정된다. 그리고 **하락장에서 정직해 보이지 않는 UI는 실패한 UI다.**

| 시나리오 | 목적 |
| :--- | :--- |
| `uptrend` | 정상 동작 확인 |
| `drawdown` | **MDD가 정직하게 보이는가** — 통과 게이트 |
| `flat` | 무의미한 등락에서 화면이 과장하지 않는가 |

시드를 고정해 재현 가능하게 생성한다. UI 리뷰는 세 시나리오 전부에서 수행한다.

### 6-2. 번들 분리 (결정 2026-08-19)

픽스처는 **lazy 청크로 분리**한다. 프로덕션 번들에 더미 실적이 실리면 안 된다.

```js
const fixtures = await import('../data/candela/fixtures/index.mjs'); // 동적 import만
```

정적 import를 금지하는 이유는 번들러가 트리셰이킹으로 제거해줄 것을 **가정할 수 없기** 때문이다. 가정 대신 구조로 막는다.

## 7. 디자인 규범 연동

*   폰트 크기는 `--fs-*` 토큰만 사용 — [design_system](../core/design_system.md) §4-2. prebuild 게이트가 강제한다.
*   차트 색상은 다크 테마 토큰에서 파생한다. recharts 기본 팔레트를 그대로 쓰지 않는다.
*   히어로는 §9-1 표준 패턴(`.rl-hero` 계열) 재사용을 우선 검토한다 — ReLearn·아카이브 상세가 이미 정합화된 선례다.

---

## 관련 문서
*   [🏗️ 데이터 계약](data_contract.md) — **이 문서보다 먼저 확정**
*   [🗺️ 로드맵](roadmap.md) — P0~P5 단계
*   [🗺️ 제품 전략서](product_strategy.md) — 포지셔닝·공개 원칙
*   [🎨 디자인 시스템](../core/design_system.md)
