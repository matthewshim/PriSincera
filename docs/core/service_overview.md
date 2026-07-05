---
status: active
domain: Core
last_updated: 2026-06-24
version: v1.0
target_files:
  - src/pages/DailyDigest.jsx
  - src/pages/PaceNoteDashboard.jsx
  - src/pages/BuildersLog.jsx
  - src/pages/SylphioLanding.jsx
---

# 🧭 서비스 개요 (Service Overview)

> **5분 안에 "PriSincera가 무엇인가"를 파악하기 위한 최상위 진입 문서.** 신규 합류자(기획·디자인·개발)는 이 문서를 가장 먼저 읽고, 이후 역할별 [온보딩 가이드](onboarding_guide.md)로 이동하세요.

## 📝 Revision History

| Version | Date | Author | Description | Impact Area |
| :--- | :--- | :--- | :--- | :--- |
| v1.0 | 2026-06-24 | AI Agent | 서비스 전체 개요·제품 포트폴리오·성장 플라이휠 최초 정의 | Service |

---

## 1. 한 줄 정의

**"제로부터 다시 배우는 러너(Learner & Runner)"를 위한, 배움–실행–복기의 성장 플라이휠 플랫폼.** 매일의 지식 소비(Daily Digest)가 주간 행동(PaceNote)이 되고, 그 실행이 복기를 거쳐 다음 배움을 개인화한다.

운영 철학: **중앙 서버/DB 의존 최소화 + 무료 티어 최대 활용**으로 유저가 늘어도 가변 비용이 0에 수렴하는 1인 운영 구조.

## 2. 제품 포트폴리오

| 제품 | 경로 | 핵심 가치 | 성격 |
| :--- | :--- | :--- | :--- |
| **Daily Digest** | `/daily` | 매일 아침 큐레이션된 IT 시그널·AI 프롬프트·어학·테크 트랙 | 배움(Input) |
| **PaceNote** | `/pacenote` | 주간 실행 궤도(Orbit) + 회고(항해 일지) | 실행·복기(Action·Feedback) |
| **Builder's Log** | `/builderslog` | 제작 과정을 투명 공개하는 정적 CMS 블로그 | 브랜딩 |
| **Sylphio** | `/sylphio` | 온디바이스 AI 동시통역 비서(별도 데스크톱 제품) | 확장 제품 |
| **Admin** | `/admin` | 콘텐츠/파이프라인/구독/문서 관리 대시보드 | 내부 운영 |

### 2.1. Daily Digest 콘텐츠 구성
- **IT Tech Signal**: 실제 RSS 매체를 수집→AI 스코어링/큐레이션 (실제 출처·원문 링크 O).
- **AI Prompt / Language Dojo(어학)**: AI 생성 학습 콘텐츠(일/영).
- **테크 트랙(Tech Track)**: 수준별(주니어/시니어) **하이브리드** — 실제 RSS 근거 위에 `학습(개념) → 실전(액션) → 원문`. 출처 정책은 [content_sourcing_policy](../daily-digest/content_sourcing_policy.md) 참조.
- 캘린더 아카이브 + 퀵 피크(Quick Peek) UX.

### 2.2. PaceNote
- 주차별 **궤도(Orbit)** 체크리스트 + 마크다운 **회고**.
- **Click-to-Orbit**: 데일리 테크 트랙 카드의 실전 항목을 클릭 한 번으로 주간 궤도로 등록(항목별 독립 궤도, 도메인 카테고리).
- AI 추천 궤도 풀(동적 퇴출 알고리즘).

## 3. 성장 플라이휠 (Growth Flywheel)

```
   [배움 Input]            [실행 Action]            [복기 Feedback]
  Daily Digest  ──Click-to-Orbit──▶  PaceNote 궤도  ──주말 회고──▶  성찰·AI 코칭
       ▲                                                              │
       └───────────────  다음 주 개인화 피드(키워드 가중치)  ◀──────────┘
```

## 4. 비즈니스 모델 (요약)
- 무료(Free) + 일부 PRO/구독, 데스크톱 앱은 **BYOK(사용자 API Key)** 로 AI 원가화.
- 인프라: Firestore·GCS·Cloudflare 무료 티어 + Gemini 무료 키 → **개발사 가변비 ≈ 0**.
- 상세: [business_model](business_model.md), 데스크톱 앱 사업계획 [mac_app_business_plan](../mac_app_business_plan.md).

## 5. 다음에 읽을 것
- **전체 기술 구조** → [architecture_overview](architecture_overview.md)
- **역할별 필독 경로 & 셋업** → [onboarding_guide](onboarding_guide.md)
- **디자인 언어** → [design_system](design_system.md) · [branding](branding.md)
- **도메인 상세** → `daily-digest/` · `pacenote/` · `builders-log/` · `sylphio/` 폴더
