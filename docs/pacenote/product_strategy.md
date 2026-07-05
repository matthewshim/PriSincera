---
status: active
domain: PaceNote
last_updated: 2026-06-29
version: v1.0
target_files:
  - src/pages/PaceNoteDashboard.jsx
  - src/pages/DailyDigest.jsx
  - pipeline/src/pacenote-composer.mjs
---

# 🗺️ PaceNote 제품 전략서 (Product Strategy)

> 💡 **기획 및 비전 선언 (Pace Note Vision)**
> 남들의 속도에 휩쓸리지 않고, 오직 자신만의 템포와 방향을 추구하며 나아가는 이들을 위해 PriSincera가 AI 기반의 퍼스널 브랜딩 액션 플랫폼, **Pace Note**를 선보입니다.
> 본 문서는 PriSincera의 3S 파이프라인(Signal ➔ Study ➔ Step)을 완성하는 최종 단계인 Pace Note의 기획 및 기술 명세서입니다.

---

## 1. 서비스 개요 및 포지셔닝

기존 Daily Digest(Signal + Study)가 '고품질 인풋(Input)'에 집중하여 지식 습득의 기반을 다졌다면, **Pace Note**는 속도보다는 올바른 방향을 지향하는 '아웃풋(Output)과 실행(Step)'에 초점을 맞춥니다.

과거의 단순 출석체크형 Growth Streak(잔디 심기) 시스템은 전면 폐지하고, 의미 있는 행동 기록 중심의 Pace Note로 모든 성장 트래킹 기능을 통합하여, 사용자가 진정한 '나만의 성장 궤적 대시보드'를 구축할 수 있도록 진화합니다.

### [3S 파이프라인의 완성 구조]
```text
[ Daily Digest: Input Focused ]            [ Pace Note: Output Focused ]
+-----------------------------+            +----------------------------+
|  SIGNAL  -->    STUDY       |  =======>  |  STEP                      |
| (Curated      (AI Prompt    |            | (Hyper-Personalized Action |
|  Tech News)    Worksheets)  |            |  & Portfolio Archiving)    |
+-----------------------------+            +----------------------------+
```

---

## 2. 핵심 가치 비교: 단순 Streak을 넘어 가치 중심 실행으로

Pace Note는 단순한 일일 접속이나 맹목적인 '잔디 심기'의 피로감에서 벗어나, 유저의 내실 있는 성장에 집중합니다.

| 비교 항목 | 기존 잔디 심기 (Growth Streak) | PriSincera Pace Note |
| :--- | :--- | :--- |
| **핵심 지표** | 일일 출석 및 단순 행위 빈도 (강박적 유지) | 유저 맞춤 실무 적용 및 성취의 깊이 |
| **핵심 동기** | 스트릭이 끊기는 것에 대한 불안 유발 (조급함) | 나만의 템포를 지키며 누적하는 고유한 기록 |
| **AI 기술 적용** | 없음 (단순 정적 기록) | 한 주간의 인풋 관심사 기반 초개인화 궤도 추천 |
| **기록의 가치** | 단순한 숫자의 축적 (포트폴리오 가치 전무) | AI가 생성하는 월간 마크다운 포트폴리오 (외부 공유 가능) |
| **사용성 및 멘탈** | 번아웃 위험 증가 및 단순 과시형 활동 초래 | 조급함을 덜고 방향의 올바름을 확인하는 멘탈 페이싱 |

---

## 3. 핵심 기능 및 AI 기술 전략

### 3.1. AI 기반 초개인화 주간 미션: 나만의 페이스를 찾아주는 지능형 가이드
Pace Note는 획일적인 미션 목록에서 벗어나, 사용자가 한 주간 소비한 Daily Digest 데이터를 기반으로 현재의 성장 페이스에 가장 적합한 맞춤형 방향성을 제안합니다.

> 🛡️ **Pace Note AI Flywheel**
> 사용자가 클릭한 IT Tech Signal 카테고리와 학습한 AI 프롬프트 데이터를 심층적으로 분석하고, 매주 일요일 밤 PriSincera의 Gemini AI가 다음 주 실무에 즉시 적용해볼 만한 3가지 구체적인 행동 지침(Pace Guide)을 제안합니다.

*   **정교한 데이터 연동**: 사용자가 클릭한 카테고리와 학습 프롬프트를 실시간 통계로 결합합니다.
*   **Gemini AI 기반 미션 생성**: 사용자 데이터 분석 페이로드를 바탕으로 고품질의 실무 가이드를 설계합니다.
*   **Self-Pace 컨트롤**: AI가 제안하는 가이드 외에도, 사용자가 직접 커스텀 미션을 생성하여 이번 주의 속도와 방향을 유연하게 조절할 수 있습니다.

### [AI 기반 추천 루프 및 명예의 전당 피드백 파이프라인]
```text
+-----------------------------+
|   User Activity Data Pool   | <-----------------------------------------+
| (Digest Clicks & Prompts)   |                                           |
+-----------------------------+                                           |
               |                                                          |
               v [Weekly Analysis]                                        |
+-----------------------------+                                           |
|    Pace Note AI Composer    |                                           |
|   (Gemini Pro API Engine)   |                                           |
+-----------------------------+                                           |
               |                                                          |
               v [Generates 3 Recommendations]                            |
+-----------------------------+                                           |
|     Firestore Pool          |                                           |
| (config/pacenote_daily_pool)|                                           |
+-----------------------------+                                           |
               |                                                          |
               v [User Accepts & Executes]                                |
+-----------------------------+                                           | [Stats Feedback]
|     Pace Note Action        |                                           |
|   (Logbook Completion)      |                                           |
+-----------------------------+                                           |
               |                                                          |
               v [Aggregates Picks & Clears]                              |
+-----------------------------+                                           |
|      Firestore Analytics    | ------------------------------------------+
|  (Picks / Clears stats)     |
+-----------------------------+
               |
               v [Velocity Extraction]
+-----------------------------+
|     명예의 전당 (HoF)       |
| (Dynamic Few-Shot Prompts)  |
+-----------------------------+
               |
               +----------------------------------------------------------+
               | [Auto-injected into Gemini's prompt for next generation] |
               v
```

### 3.2. 실행 인증 및 포트폴리오 아카이빙: 성장 DNA를 각인하는 증명서
단순한 기록을 넘어, 실행의 흔적을 남기고 이를 통해 자신만의 올바른 궤도를 증명하며 강력한 퍼스널 브랜딩 자산으로 구축합니다.

*   **마이크로 인증 시스템**: 거창한 결과물이 아니더라도, 적용 과정을 담은 짧은 메모, Notion 링크, 혹은 코드 스니펫만으로 미션 완료를 간편하게 인증할 수 있습니다.
*   **Monthly Branding Log**: 한 달간 완료한 Pace Note 데이터를 집계하여, AI가 '이번 달의 성장 항해일지'를 마크다운 형태의 포트폴리오로 자동 생성합니다. 이 로그는 링크 형태로 LinkedIn, 개인 블로그 등 외부에 손쉽게 공유할 수 있습니다.

### 3.3. 의미 있는 게이미피케이션: 성취를 고취하는 동기 부여
단순한 일일 출석체크(잔디 심기)를 지양하고, 본인만의 호흡으로 달성한 의미 있는 결과물에 진정한 보상을 부여합니다.

*   **Weekly Milestone 뱃지**: 주간 궤도 미션을 성공적으로 완료하면 타임라인 로그에 '빛나는 마일스톤 뱃지'가 부여되어, 사용자가 올바른 방향으로 나아가고 있음을 시각적으로 확인시켜주며 직관적인 성취감을 선사합니다.
*   **로그인 기반 초개인화 대시보드**: Google 로그인을 통해서만 접근 가능한 Private 대시보드로 전환되어, 사용자 데이터의 보안 및 정합성을 한층 강화합니다.

---

## 4. UI/UX 디자인 가이드라인: 몰입과 직관을 위한 프리미엄 경험

PriSincera 특유의 프리미엄 Dark Theme 및 Bento Box 스타일을 계승하여, 사용자가 본질적인 성장에 온전히 몰입할 수 있는 차분하고 직관적인 환경을 제공합니다.

*   **Pace Dashboard (Bento Layout)**:
    *   **좌측 상단**: 이번 주 진행 중인 미션 카드로, 'Progress Bar' 대신 'Pace Tracker' 개념을 도입하여 사용자의 속도감을 시각화합니다.
    *   **우측 상단**: AI가 분석한 나의 주간 관심사 및 추천 미션이 제시됩니다.
    *   **하단**: 지금까지 완료한 미션들이 아름다운 'Logbook (Masonry Grid)' 형태로 아카이빙됩니다.
*   **인터랙션 디자인**: 
    *   미션 완료(Complete) 버튼 클릭 시, 화면 전체에 은은한 파티클 애니메이션(축하 효과)이 발생하여 성취감을 극대화합니다.
    *   마우스 호버 시 카드의 테두리가 네온 색상(예: `#10B981`, `#7C3AED`)으로 빛나는 Glassmorphism 효과를 적용하여 사용자 참여를 유도합니다.

---

## 5. 사용자 여정 (Workflow): 나만의 성장 흐름을 따르다

사용자가 일주일, 한 달 동안 성장을 누적하는 구체적인 행동 흐름입니다.

```text
[Phase]               [Key Actions & Milestones]

ALIGN  (Sun - Mon)    AI Recommendation Email Alert Received
                      +-----------------------------------------------+
                      | - Accept AI-Tailored Pace Guide               |
                      | - Customize and set Self-Pace (Weekly Vector) |
                      +-----------------------------------------------+
                                      |
                                      v
ACTION (Tue - Sat)    Read Daily Digest & Execute in Practice
                      +-----------------------------------------------+
                      | - Micro-prove actions (Notion link/snippets)  |
                      | - Gain Weekly Milestone Badge                 |
                      +-----------------------------------------------+
                                      |
                                      v
REFLECT (Monthly)     Analyze Monthly Branding Log
& BRAND               +-----------------------------------------------+
                      | - AI compiles automated Markdown Portfolio    |
                      | - Share link seamlessly to LinkedIn & Blogs   |
                      +-----------------------------------------------+
```

---

## 6. 시스템 아키텍처 및 구현 계획

Pace Note는 견고하고 확장 가능한 현대 웹 아키텍처를 바탕으로 동작합니다.

*   **Frontend**: React (기존 `DailyDigest.jsx`와 긴밀하게 라우팅 연동되며, `src/pages/PaceNoteDashboard.jsx`가 새롭게 신설됩니다.)
*   **Backend / DB**: Firebase Firestore (`pace_missions`, `user_portfolios` 컬렉션이 신설되어 사용자 미션과 포트폴리오 데이터를 안전하게 관리합니다.)
*   **AI 파이프라인**: `pacenote-composer.mjs`가 신설되어 주말마다 유저별 활동 로그를 분석, Gemini API를 통해 개인화된 미션 페이로드를 생성하고 DB에 저장합니다.
*   **인증**: 기 구현된 Firebase Google Auth 연동을 활용하여 seamless하고 안전한 사용자 인증 환경을 제공합니다.

---

## 7. 동적 퇴출 및 자원 선순환 알고리즘 (Phase 2)

Firestore의 풀(Pool)이 비대해지거나 고착화되는 것을 방지하기 위한 정교한 자원 관리 및 데이터 에이징 규칙입니다.

```text
[ New Goals Generated ] ---> ( Active Pool: Cap 150 )
                                   |
                                   +---> [ Grace Period (First 7 Days) ] --> Protected from Ejection
                                   |
                                   +---> [ TTL Eviction (Age > 45 Days) ] -> Forced Retirement
                                   |
                                   +---> [ Low Velocity Eviction ] ---------> Sorted by Picks/Day (Evicted)
```

---

## 8. 기대 효과 및 비즈니스 임팩트

Pace Note는 단순한 기능 추가를 넘어, PriSincera 서비스의 핵심 가치를 강화하고 미래 성장 가능성을 확장하는 전략적 B2C/B2B 이니셔티브입니다.

1.  **Lock-in 효과 극대화**: 단순 뉴스레터 구독을 넘어, 조급함을 덜어주고 흔들리지 않게 잡아주는 멘탈 케어 및 커리어 스펙 관리 서비스로 진화함으로써 사용자 이탈률을 획기적으로 낮출 수 있습니다.
2.  **자발적 바이럴 (UGC) 활성화**: 사용자가 자신의 Monthly Logbook을 외부에 공유함에 따라, 자연스러운 서비스 홍보 및 유기적인 신규 유입을 창출할 것입니다.
3.  **데이터 기반 B2B 확장 가능성**: 향후 기업용(B2B) 솔루션으로 확장 시, 구성원들의 자기주도적 성장 속도와 실무 적용 현황을 보여주는 HR/교육 솔루션으로 피봇팅할 잠재력을 가집니다.
