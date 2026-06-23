---
status: active
domain: DailyDigest
last_updated: 2026-06-23
version: v1.0
target_files:
  - pipeline/src/collector.mjs
  - pipeline/src/composer.mjs
  - pipeline/src/study-composer.mjs
  - pipeline/src/tech-composer.mjs
  - pipeline/src/templates/tech-prompt.txt
  - pipeline/config/sources.json
  - src/components/daily/TrackSignalFeed.jsx
  - admin-api.mjs
---

# PriSincera Daily Digest Content Sourcing & Provenance Policy

Daily Digest가 노출하는 모든 콘텐츠의 **출처(Provenance), 원문 URL 부여 기준, 사실성 책임 및 고지(Disclaimer) 정책**을 규정한다. 콘텐츠 유형마다 "실제 수집(Collected)"인지 "AI 생성(Generated)"인지가 다르며, 이 차이는 신뢰성·법적 책임·UX 표기에 직접적인 영향을 미치므로 본 정책으로 명문화한다.

## 📝 Revision History

| Version | Date | Author | Description | Impact Area |
| :--- | :--- | :--- | :--- | :--- |
| v1.0 | 2026-06-23 | AI Agent | 콘텐츠 유형별 출처/URL 정책 최초 정의 — IT Tech Signal(RSS 수집) vs Tech Track·Language Dojo(AI 생성) 구분, 사실성 고지 의무화, 향후 거버넌스 결정 항목 등록 | tech-composer, collector, TrackSignalFeed |

---

## 1. 목적 및 범위

- **목적**: 사용자에게 보여지는 콘텐츠가 "실제 발행된 외부 자료"인지 "AI가 생성한 합성물"인지 명확히 구분하고, 출처 표기·원문 링크·사실성 고지의 기준을 통일한다.
- **범위**: Daily Digest의 모든 콘텐츠 유형 — IT Tech Signal, AI Prompt, Language Dojo(어학), 그리고 수준별 **Tech Track**(주니어/시니어).
- **핵심 원칙**: **출처가 없는 콘텐츠를 출처가 있는 것처럼 오인하게 해서는 안 된다(No False Provenance).**

## 2. 콘텐츠 유형별 출처 정책 (요약)

| 콘텐츠 유형 | 생성 방식 | 실제 출처 | 원문(랜딩) URL | 사실성 책임 |
| :--- | :--- | :--- | :--- | :--- |
| **IT Tech Signal** | **실제 RSS 수집** 후 AI 스코어링/큐레이션 | ✅ 실제 매체 (HBR, First Round Review 등) | ✅ **있음** (`article.url`, "원문 읽기 →") | 원 매체 |
| **Tech Track** (주니어/시니어) | **AI 생성(Gemini)** | ❌ 없음 (모델 학습 지식) | ❌ **없음** (`sourceUrl` 미채움) | 개발사(AI 생성물) |
| **AI Prompt / Language Dojo(어학)** | **AI 생성(Gemini)** | ❌ 없음 | ❌ 없음 | 개발사(AI 생성물) |
| **PaceNote 추천 궤도** | AI 생성 + 익명 UGC(승인 후) | UGC는 익명 사용자 | ❌ 없음 | 개발사/검수 |

> 한 줄 요약: **IT Tech Signal만 실제 출처·원문 링크를 가진 "수집형" 콘텐츠이고, Tech Track을 포함한 나머지는 출처·URL이 없는 "생성형" 콘텐츠다.**

## 3. 파이프라인별 메커니즘 상세

### 3.1. 수집형(Collected) — IT Tech Signal
- **`collector.mjs`**: `pipeline/config/sources.json`에 정의된 실제 매체의 RSS 피드를 `lib/rss.mjs`의 `fetchAllFeeds`로 수집하고 중복 제거한다. 각 아티클은 **실제 원문 URL(`url`)** 을 보유한다.
- **`composer.mjs`**: 수집된 실제 아티클을 Gemini로 **스코어링·큐레이션**(생성이 아님)하고, 상위 픽에 에디터 코멘트를 부착해 `daily/${date}.json`(signal)으로 배포한다.
- **출처/URL**: 실제 매체 + 클릭 가능한 원문 링크 보유. 프론트엔드는 "원문 읽기 →" 링크를 렌더한다.

### 3.2. 생성형(Generated) — Tech Track
- **`tech-composer.mjs`**: 외부 수집을 **전혀 하지 않는다.** import는 `callGemini`, `readJSON/writeJSON`뿐이다.
- **`templates/tech-prompt.txt`**: Gemini에게 도메인별 카드(title/summary/tags/action_challenge)를 **창작**하도록 지시한다. **URL·출처를 요청하지 않는다.**
- 따라서 `buildCard`의 `sourceUrl`은 항상 `undefined`이며, 배포 JSON·관리자 상세 모달·유저 UI(`TrackSignalFeed.jsx`) 어디에도 **원문 링크가 없다.**
- 콘텐츠 = **모델의 학습 지식에 기반한 합성물.** 날짜 라벨은 "그날 발행된 뉴스"가 아니라 "그날 생성된 학습 카드"를 의미한다.

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

## 6. 향후 개선 옵션 및 거버넌스 결정 (Open)

Tech Track의 출처 부재를 어떻게 다룰지는 **미결 결정 사항**이다. 아래 중 택일하여 본 문서를 개정한다.

| 옵션 | 내용 | 사실성 | 노력 |
| :--- | :--- | :--- | :--- |
| **A. 현행 유지 + 명시** | 생성형임을 UI에 명확히 라벨링(출처 없음 고지). action 학습 카드로 포지셔닝 | 동일 | 소 |
| **B. 실제 수집 연동** | `tech-composer`도 `collector`처럼 RSS/뉴스를 수집 → 그 기사 위에서 트랙별 카드+action_challenge 생성 → **진짜 sourceUrl 부여**. 기존 `sources.json`/`rss.mjs` 재사용 | 높음 | 중 |
| **C. 하이브리드(권고)** | 실제 기사 1~2건을 근거로 카드 생성 + **원문 링크 첨부** + 실전 액션 유지 | 높음 | 중 |

> **현재 상태(v1.0)**: 옵션 미결정. Tech Track은 **A의 "명시" 부분도 아직 미구현**(라벨 없음) 상태이므로, 최소한 §5의 고지 라벨은 단기 적용을 권고한다.

## 7. 관련 문서 / 코드

- 데이터 계약: [data_contract_v2.md](../data_contract_v2.md) (트랙 피드 스키마 §1.2, `sourceUrl` 필드 정의)
- 트랙 파이프라인: [tech-composer.mjs](../../pipeline/src/tech-composer.mjs), [tech-prompt.txt](../../pipeline/src/templates/tech-prompt.txt)
- 수집 파이프라인: [collector.mjs](../../pipeline/src/collector.mjs), [composer.mjs](../../pipeline/src/composer.mjs), [sources.json](../../pipeline/config/sources.json)
- 유저 노출: [TrackSignalFeed.jsx](../../src/components/daily/TrackSignalFeed.jsx)
- 관리자 모니터링: [admin-api.mjs](../../admin-api.mjs) (`/daily/tracks/*`)
