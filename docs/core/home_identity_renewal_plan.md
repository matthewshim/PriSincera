---
status: approved
domain: Core
last_updated: 2026-08-12
version: v1.0
target_files:
  - src/pages/Home.jsx
  - src/components/hero/HeroContent.jsx
  - src/components/journey/JourneySection.jsx
  - src/components/work/WorkSection.jsx
  - src/components/philosophy/PhilosophySection.jsx
  - src/components/connect/ConnectSection.jsx
  - src/locales/ko.json
  - src/locales/en.json
  - src/locales/ja.json
nav_title: 메인 정체성 리뉴얼
---

# 🎯 메인 페이지 정체성 리뉴얼 설계안 (Home Identity Renewal)

> **상태: approved (구현 착수)** — 방향·카피 전건 오너 확정(2026-08-12). 경력 20년 유지, 역할 문구 D안 채택.

## 0. 배경

메인 페이지가 개인 퍼스널 브랜딩 사이트로 출발한 뒤, 빌더스 로그·리런·실피오가 순차 합류하면서 **정체성이 모호**해졌다(오너 진단, 2026-08-12). 진단 결과 균열의 실체는 세 가지였다.

1. **주어의 단절** — Hero·Belief·Journey는 "나(개인)"가 주어인데 Work 섹션에서 "PriSincera(제품군)"로 주어가 바뀌고, 개인과 브랜드의 관계가 어디에도 명시되지 않는다.
2. **전환의 미완결 자백** — 서비스 섹션 타이틀이 "단순한 포트폴리오를 넘어"로, 포트폴리오→제품의 중간 지점에 멈춰 있음을 스스로 드러낸다.
3. **서비스 위상·청중 불일치** — Base(아키텍처)·Builders Log·ReLearn·Sylphio 4카드가 서로 다른 청중에게 평면 나열되어 "왜 이걸 다 만들었나"의 서사가 없다.

가장 근본적인 역설: **퍼스널 브랜딩을 표방하면서 정작 개인(이름·정체)이 익명**이었다. 철학은 풍부한데 그 주인이 비어 있었다.

## 1. 확정된 방향 (오너 결정 2026-08-12)

| 결정 항목 | 확정 |
|---|---|
| 이름 표기 | **영문명 Matthew Shim** (LinkedIn `in/shimks`·이메일로 이미 공개된 범위) |
| 프로필 비주얼 | **없음** — 얼굴/아바타 없이 이름+역할 타이포만 |
| 서비스 위계 | **3제품(빌더스로그·리런·실피오) 전면 승격 + Base(아키텍처) 강등** |
| 리뉴얼 범위 | 서사·카피·개인 정체성 블록 중심 (비주얼 재개발 아님, Star Prism·별자리 유지) |
| 산출 방식 | **설계안 문서 먼저 → 승인 후 구현** (본 문서) |

**개인정보 노출 원칙**: 이름(Matthew Shim)·LinkedIn·업무 이메일은 이미 공개된 연락 채널이므로 사용한다. **얼굴 사진·실주소·전화번호·생년 등 민감정보는 배제**한다. "감추는데 다 보이는" 준익명의 어색함을 없애되, 노출 하한은 지킨다.

## 2. 핵심 전략 — 주어를 하나로

리뉴얼의 축은 단 하나다: **"PriSincera = Matthew Shim이라는 20년차 기획자의 퍼스널 브랜드"임을 명확히 하고, 서비스들을 그 사람의 태도가 낳은 산출물(proof of work)로 종속시킨다.**

- 서비스는 "제품 카탈로그"가 아니라 **"이 사람이 왜·어떻게 만들었는가"의 증거 3종**으로 재프레이밍한다.
  - **Builders Log** = 만드는 **과정**의 기록
  - **ReLearn** = 20년 경력 노하우의 **제품화**
  - **Sylphio** = 실무에서 겪은 니즈의 **해결**
- **Base(이 사이트 아키텍처·GitHub)** = "기획자가 혼자 이만큼 만든다"는 **메이커십 증거**로 위상을 낮춰, Services 카드군에서 빼고 Journey 말미 또는 푸터 인접으로 이동한다.

이 종속 구조가 Journey→Work의 주어 단절을 봉합한다.

## 3. 섹션별 설계 (Before → After)

카피 초안은 국문(ko) 기준이며, en/ja는 구현 단계에서 동일 톤으로 로컬라이즈한다(3종 동시 갱신).

### 3-1. Hero — "누구"를 즉시 답한다

| 요소 | Before | After (제안) |
|---|---|---|
| label | `✦ Star Prism Identity` | `✦ Matthew Shim · PriSincera` (개인=브랜드 결속) |
| title | `Sincerity, Prioritized.` | **유지** (강력한 브랜드 슬로건) |
| **role line (신설)** | — | **`20년의 기획 감각에 AI를 더해, 매일 새로 만듭니다.`** (D안 확정) |
| subStrong | `"발 아래 꽃, 먼 곳의 별"` | 유지 |
| subText | (3줄 태도 서술) | 유지 (필요 시 2줄 축약) |

핵심 변경: 히어로 진입 3초 안에 "20년 기획자 Matthew Shim이 AI로 만드는 사람"이라는 정체성이 박히게 한다.

### 3-2. Belief(철학) — 개인과 브랜드를 잇는다

- 3개념 카드(태도·우선순위·진심)와 "발 아래 꽃/먼 별" 유지.
- 마지막 선언만 개인과 결속:
  - Before: `진심을 가장 우선순위에 둔다 — 이것이 PriSincera입니다.`
  - After: `진심을 가장 우선순위에 둔다 — 제가 PriSincera라는 이름으로 일하는 방식입니다.`

### 3-3. Journey(여정) — "나의" 여정으로 주어 강화

- 마일스톤 3개(경험의 축적→AI와의 조우→성장을 돕는 도구로) 골격 유지.
- 도입부에 1인칭 정체성을 명시("웹 기획부터 글로벌 서비스 리딩까지 20년" → 그 주체가 나임을 분명히).
- **Base 강등 착지점**: Journey 말미에 "이 사이트의 전체 소스와 아키텍처는 오픈소스로 공개되어 있습니다"(D안 확정) 형태로 Base(GitHub) 링크를 작은 메이커십 각주로 배치. 초점을 '직접 만든다'(상단 3회 중복)에서 '코드 공개(투명성)'로 전환해 반복을 해소. 또는 푸터 인접(옵션 B). → **구현 시 A 우선 검토.**

### 3-4. Work → "제가 만든 것들" (핵심 재편)

| 요소 | Before | After (제안) |
|---|---|---|
| section-label | `Services` | `Proof of Work` 또는 `What I've Built` |
| title | `단순한 포트폴리오를 넘어 / 성장을 돕는 도구로` | **폐기** → `태도가 낳은 것들` / `기획자가 AI로 만든 세 가지` |
| subtitle | `기획에서 개발까지...서비스들입니다` | 3제품이 개인 서사와 어떻게 연결되는지 한 줄 |
| 카드 구성 | Base·Builders·ReLearn·Sylphio (4, 평면) | **Builders(과정)·ReLearn(제품화)·Sylphio(해결) 3장 승격**, 각 카드에 "왜 만들었나" 연결 문구 1줄 |
| Base 카드 | 서비스 카드 #0 | Services에서 제거 → Journey 말미 메이커십 각주로 이동(§3-3) |

각 제품 카드 상단에 서사 태그(예: `과정의 기록` / `경력의 제품화` / `실무의 해결`)를 얹어 위계를 시각화한다.

### 3-5. Connect — 유지

- LinkedIn·Email 유지. 톤만 개인 화자로 소폭 다듬기(현행 "함께 이야기합시다"는 이미 적합).

## 4. 확인 필요 항목 (오너 입력 대기 — 2건)

구현 착수 전 아래 2가지를 확정해야 카피가 고정된다.

~~1. 경력 연차~~ → **20년 유지 확정** (2026-08-12)
~~2. 역할 한 줄 최종안~~ → **D안 `"20년의 기획 감각에 AI를 더해, 매일 새로 만듭니다."` 확정** (2026-08-12)

전건 확정 — 추가 입력 불필요, 구현 착수.

## 5. 구현 범위 · 순서 · 검증

**범위**: 카피(언어팩 3종) + 히어로 role line 신설(HeroContent) + Work 섹션 3카드 재편(WorkSection) + Base 강등(Journey/Work) + 철학 선언 1줄 + section-label/타이틀. **비주얼·레이아웃 골격은 유지.**

**순서**:
1. 언어팩 ko/en/ja `home` 네임스페이스 카피 재정렬 (role line·서사 태그·연결 문구 키 신설)
2. HeroContent role line 마크업 추가
3. WorkSection 4→3 카드 재편 + 서사 태그
4. Base 강등(Journey 말미 각주 or 이동) + JourneySection 1인칭 강화
5. Belief 선언 1줄 교체

**검증**: `design-check` PASS(신규 카피의 폰트/폭/i18n 게이트) · `vite build` · 3종 언어팩 키 구조 동일성 · 로컬 육안(데스크톱/모바일 GNB·히어로·서비스 섹션).

## 6. 참조 문서

- [서비스 개요 (Service Overview)](service_overview.md) — "PriSincera가 무엇인가" 최상위 진입 문서와 정합 필요
- [브랜드 아이덴티티 (Branding)](branding.md) — Star Prism Identity·슬로건 규격
- [비즈니스 모델 (Business Model)](business_model.md) — 퍼스널 브랜드·컨설팅 확장 4모델 (본 리뉴얼의 상위 포지셔닝 근거)
- [디자인 시스템 (Design System)](design_system.md) — §9-1 히어로·§4-2 타이포 규범 준수

---

*작성: 2026-08-12 · 오너 방향 승인 반영 · 카피 확인 2건 후 구현 착수*
