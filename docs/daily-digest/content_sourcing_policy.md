---
status: active
domain: DailyDigest
last_updated: 2026-06-24
version: v1.1
target_files:
  - pipeline/src/collector.mjs
  - pipeline/src/composer.mjs
  - pipeline/src/study-composer.mjs
  - pipeline/src/tech-composer.mjs
  - pipeline/src/templates/tech-prompt.txt
  - pipeline/src/lib/rss.mjs
  - pipeline/config/sources.json
  - pipeline/config/tech-sources.json
  - src/components/daily/TrackSignalFeed.jsx
  - admin-api.mjs
---

# PriSincera Daily Digest Content Sourcing & Provenance Policy

Daily Digest가 노출하는 모든 콘텐츠의 **출처(Provenance), 원문 URL 부여 기준, 사실성 책임 및 고지(Disclaimer) 정책**을 규정한다. 콘텐츠 유형마다 "실제 수집(Collected)"인지 "AI 생성(Generated)"인지가 다르며, 이 차이는 신뢰성·법적 책임·UX 표기에 직접적인 영향을 미치므로 본 정책으로 명문화한다.

## 📝 Revision History

| Version | Date | Author | Description | Impact Area |
| :--- | :--- | :--- | :--- | :--- |
| v1.0 | 2026-06-23 | AI Agent | 콘텐츠 유형별 출처/URL 정책 최초 정의 — IT Tech Signal(RSS 수집) vs Tech Track·Language Dojo(AI 생성) 구분, 사실성 고지 의무화, 향후 거버넌스 결정 항목 등록 | tech-composer, collector, TrackSignalFeed |
| v1.1 | 2026-06-24 | AI Agent | **거버넌스 §6 결정 = 경로 C(하이브리드) 채택.** Tech Track이 도메인별 RSS(`tech-sources.json`) 근거 위에 **학습 레이어(`learning`) + 실제 원문 `sourceUrl`**을 갖도록 전환 → "출처 없는 AI 생성"에서 "근거 기반 학습+실전+원문"으로 격상 | tech-composer, tech-sources.json, rss.mjs, TrackSignalFeed |

---

## 1. 목적 및 범위

- **목적**: 사용자에게 보여지는 콘텐츠가 "실제 발행된 외부 자료"인지 "AI가 생성한 합성물"인지 명확히 구분하고, 출처 표기·원문 링크·사실성 고지의 기준을 통일한다.
- **범위**: Daily Digest의 모든 콘텐츠 유형 — IT Tech Signal, AI Prompt, Language Dojo(어학), 그리고 수준별 **Tech Track**(주니어/시니어).
- **핵심 원칙**: **출처가 없는 콘텐츠를 출처가 있는 것처럼 오인하게 해서는 안 된다(No False Provenance).**

## 2. 콘텐츠 유형별 출처 정책 (요약)

| 콘텐츠 유형 | 생성 방식 | 실제 출처 | 원문(랜딩) URL | 사실성 책임 |
| :--- | :--- | :--- | :--- | :--- |
| **IT Tech Signal** | **실제 RSS 수집** 후 AI 스코어링/큐레이션 | ✅ 실제 매체 (HBR, First Round Review 등) | ✅ **있음** (`article.url`, "원문 읽기 →") | 원 매체 |
| **Tech Track** (주니어/시니어) | **하이브리드** — 도메인별 RSS 근거 위에 AI가 학습+실전 생성 (v1.1~) | ✅ 실제 매체 (`tech-sources.json`) | ✅ **있음** (`sourceUrl`, "🔗 원문 읽기") *근거 없는 도메인은 생략* | 원 매체 + 개발사 |
| **AI Prompt / Language Dojo(어학)** | **AI 생성(Gemini)** | ❌ 없음 | ❌ 없음 | 개발사(AI 생성물) |
| **PaceNote 추천 궤도** | AI 생성 + 익명 UGC(승인 후) | UGC는 익명 사용자 | ❌ 없음 | 개발사/검수 |

> 한 줄 요약: **IT Tech Signal·Tech Track은 실제 출처·원문 링크를 가진 콘텐츠이고(Tech Track은 하이브리드: 근거+학습+실전), 어학·AI 프롬프트는 순수 생성형이다.**

## 3. 파이프라인별 메커니즘 상세

### 3.1. 수집형(Collected) — IT Tech Signal
- **`collector.mjs`**: `pipeline/config/sources.json`에 정의된 실제 매체의 RSS 피드를 `lib/rss.mjs`의 `fetchAllFeeds`로 수집하고 중복 제거한다. 각 아티클은 **실제 원문 URL(`url`)** 을 보유한다.
- **`composer.mjs`**: 수집된 실제 아티클을 Gemini로 **스코어링·큐레이션**(생성이 아님)하고, 상위 픽에 에디터 코멘트를 부착해 `daily/${date}.json`(signal)으로 배포한다.
- **출처/URL**: 실제 매체 + 클릭 가능한 원문 링크 보유. 프론트엔드는 "원문 읽기 →" 링크를 렌더한다.

### 3.2. 하이브리드(Hybrid) — Tech Track (v1.1~, 경로 C)
- **`tech-composer.mjs`**: ① `config/tech-sources.json`의 도메인별 RSS에서 `rss.mjs`(`fetchFeed`, `maxAgeDays`)로 최신 **근거 기사(seed)**를 도메인당 1개 수집 → ② Gemini가 그 근거 위에서 카드를 생성(**`learning`** 개념·핵심포인트 + `action_challenge`).
- **`templates/tech-prompt.txt`**: [학습(개념 이해) → 실전(적용 액션)] 흐름을 강제. 근거 기사가 주어진 도메인은 그 내용에 충실하게, 없는 도메인은 보편 지식으로 작성.
- **URL은 코드에서 주입**: `buildCard`가 seed 기사의 실제 `sourceUrl`/`sourceName`을 채운다(LLM이 생성한 URL은 환각 위험이라 사용 금지). 근거가 없는 도메인은 `sourceUrl`을 생략한다.
- 유저 UI/관리자 모달은 `📚 학습 → 🎯 실전 → 🔗 원문 읽기` 순으로 렌더.
- **잔여 리스크**: 학습 텍스트(concept/key_points)는 여전히 AI 생성이므로 근거 기사를 벗어난 추론·환각 가능성이 0은 아니다 → §5 고지·검수 정책 유지.

### 3.3. 생성형(Generated) — Language Dojo / AI Prompt
- **`study-composer.mjs`**: Gemini로 일본어 학습 문장·실무 프롬프트를 생성한다. 외부 출처·URL 없음. (어학은 웹 전용으로 존치 — [data_contract_v2.md](../data_contract_v2.md) 참조)

## 4. 출처 표기 및 랜딩 URL 정책

1. **수집형 콘텐츠**: 반드시 **원 매체명 + 클릭 가능한 원문 URL**을 함께 노출한다. 출처를 숨기거나 변형하지 않는다.
2. **생성형 콘텐츠**: 존재하지 않는 출처·URL을 **임의로 만들어 붙이지 않는다.** LLM이 생성한 URL(환각 가능)을 그대로 노출하는 것을 금지한다.
3. **혼동 방지**: 생성형 카드에는 "원문 읽기" 류의 링크 UI를 두지 않는다(클릭 가능한 출처가 있다는 오해 차단).

## 5. 사실성·신뢰성 리스크 및 필수 고지(Disclaimer)

생성형 콘텐츠는 다음 리스크를 내포하므로 **고지 의무**를 둔다.

- **리스크**: 사실 부정확/환각 가능, 모델 학습 컷오프 이후 정보 미반영, 출처 검증 불가, "시그널(오늘의 뉴스)"이라는 표현이 실제 발행 뉴스로 오인될 소지.
- **필수 고지 정책**:
  - 생성형 콘텐츠 영역에는 **"AI가 생성한 학습용 콘텐츠이며 실제 발행 기사가 아닙니다"** 취지의 라벨/툴팁을 노출한다. *(현재 미구현 — §6 결정에 따라 반영)*
  - 사실성 보장이 필요한 표현(특정 버전·수치·고유명 주장)은 생성형 콘텐츠에 의존하지 않는다.
- **포지셔닝 권고**: Tech Track은 "실전 액션 챌린지(학습/실습)" 중심으로 포지셔닝한다. action_challenge(실습 과제)는 출처가 불필요한 영역이므로 생성형과 잘 맞는다.

## 6. 거버넌스 결정 (Resolved) — 경로 C(하이브리드) 채택

> **결정(2026-06-24)**: 옵션 **C(하이브리드)** 를 채택·구현 완료. Tech Track은 도메인별 RSS 근거 위에 **학습 레이어(`learning`) + 실전 액션 + 실제 원문 링크(`sourceUrl`)** 를 갖는다.

| 옵션 | 내용 | 결정 |
| :--- | :--- | :--- |
| A. 현행 유지 + 명시 | 생성형 라벨링만 | 미채택 |
| B. 실제 수집 연동 | RSS 근거 + sourceUrl | (C에 포함) |
| **C. 하이브리드** | **근거 기사 + 학습+실전 + 원문 링크** | ✅ **채택·구현** |

**구현 요지**: `tech-sources.json`(도메인별 큐레이션 RSS) + `tech-composer` seed 수집 + `learning` 스키마 + `sourceUrl` 코드 주입 + UI(학습→실전→원문). 상세 §3.2.

**남은 보완(선택)**: 근거 없는 도메인(피드 전부 실패 시) 카드에 대한 "AI 보편 지식 기반" 미세 라벨, 피드 소스 풀 확장·튜닝.

## 7. 관련 문서 / 코드

- 데이터 계약: [data_contract_v2.md](../data_contract_v2.md) (트랙 피드 스키마 §1.2, `sourceUrl` 필드 정의)
- 트랙 파이프라인: [tech-composer.mjs](../../pipeline/src/tech-composer.mjs), [tech-prompt.txt](../../pipeline/src/templates/tech-prompt.txt)
- 수집 파이프라인: [collector.mjs](../../pipeline/src/collector.mjs), [composer.mjs](../../pipeline/src/composer.mjs), [sources.json](../../pipeline/config/sources.json)
- 유저 노출: [TrackSignalFeed.jsx](../../src/components/daily/TrackSignalFeed.jsx)
- 관리자 모니터링: [admin-api.mjs](../../admin-api.mjs) (`/daily/tracks/*`)
