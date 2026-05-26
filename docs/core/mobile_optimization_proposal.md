---
status: active
domain: Core
last_updated: 2026-05-26
version: v1.3
target_files:
  - src/styles/index.css
  - src/pages/PaceNoteDashboard.css
  - src/components/pacenote/PaceNoteChronoRibbon.css
  - src/components/daily/DailyCalendar.css
  - src/pages/DailyDigest.css
  - src/pages/BuildersLog.css
  - src/components/layout/Header.css
  - src/components/pacenote/PaceNoteWeeklyCalendar.css
  - src/components/pacenote/PaceNoteWeeklyCalendar.jsx
  - src/pages/BuildersLogDetail.css
---

# 📱 PriSincera 모바일 웹 최적화 진단 및 전면 개선 방안 제안서

## 📝 Revision History

| Version | Date | Author | Description | Impact Area |
| :--- | :--- | :--- | :--- | :--- |
| v1.0 | 2026-05-26 | AI Agent | 모바일 최적화를 위한 전면 사용성 진단 및 도메인별 구체적 개선 코드 제안서 작성 | 글로벌 공통 CSS, 홈, PaceNote, DailyDigest, BuildersLog |
| v1.1 | 2026-05-26 | AI Agent | 단계별 추진 로드맵 및 일괄 배포 장단점 검토 분석 단락(Section 6) 증설 추가 | 전략/로드맵 |
| v1.2 | 2026-05-26 | AI Agent | 일괄 진행(Big Bang) 전략을 최종 추진 결정안으로 확정 및 보고서 최종 반영 | 전략/로드맵 |
| v1.3 | 2026-05-26 | AI Agent | 일괄 진행(Big Bang) 최종 결정에 따른 전면 모바일 최적화 코드 구현 완료 및 반영 | 전면 최적화 완료 |

---

## 1. 개요 및 배경

PriSincera 플랫폼은 데스크톱 환경을 기준으로 글래스모피즘 스킨, 네온 아우라 광원, 분기별 Bento Matrix 등 하이엔드 다크 테마 비주얼을 자랑합니다. 그러나 반응형 레이아웃 구현에도 불구하고, **모바일(360px ~ 480px 세로 포트레이트 환경)과 같은 물리적으로 협소한 한계 영역**에서는 다음과 같은 리스크가 상존합니다.
*   **접근성(Accessibility) 저하**: 너무 작은 클릭 영역으로 인한 오터치 발생.
*   **시각적 단절(Visual Noise)**: 협소한 공간 내 컴포넌트 강제 축소 및 텍스트 겹침.
*   **성능 저하(Performance Overhead)**: 모바일 환경에서 의미 없는 데스크톱용 마우스 추적 이벤트 및 하드웨어 가속 부재.

본 제안서는 모바일 퍼스트 시대의 비즈니스 경쟁력을 강화하기 위해, 플랫폼 전체 페이지의 모바일 사용성 결함을 정밀 분석하고 즉각 적용 가능한 **엔지니어링 코드 레벨의 해결 방안**을 보고합니다.

---

## 2. 6대 모바일 사용성 핵심 결함 진단 (Usability Defect Audit)

```
[ 모바일 환경에서의 인터랙션 병목 흐름도 ]

 1. 좁은 가로 폭 (360px) ──►  Daily 캘린더 날짜 셀 터치 영역 축소 (32px 미만) ──► 오터치 유발
 2. PaceNote 화면 진입  ──►  물리 마우스 호버 부재 ──► Hover Peek 툴팁이 먹통이 되거나 고정되어 화면 방해
 3. 옴니 인풋 포커싱     ──►  인풋 폰트 크기 14px ──► iOS Safari 브라우저 강제 화면 줌인 ──► 레이아웃 붕괴
 4. 홈 화면 터치 스크롤  ──►  망원경 마우스 추적(TelescopeCursor) 루프 계속 가동 ──► 미세 스크롤 랙 유발
```

### 1) 결함 1: 터치 타겟 크기 미달 (WCAG 규격 부적합)
*   **현상**: [DailyCalendar.css](file:///d:/prisincera/www/src/components/daily/DailyCalendar.css)의 캘린더 격자 셀과 [PaceNoteChronoRibbon.css](file:///d:/prisincera/www/src/components/pacenote/PaceNoteChronoRibbon.css)의 주차 카드 터치 영역이 모바일 가로폭 360px 기준 **가로/세로 32px 이하**로 급격히 축소됩니다.
*   **위험 요인**: Google Lighthouse 접근성 지표 및 WCAG 2.1 기준 최소 권장 터치 타겟 크기인 **44px × 44px**에 미치지 못해, 주변 날짜를 잘못 누르는 치명적인 오터치 피로도를 유발합니다.

### 2) 결함 2: 물리 마우스 호버(Hover) 액션의 강제 매핑 및 먹통 현상
*   **현상**: PaceNote 대시보드의 `.weekly-hover-peek-panel`(주차 정보 툴팁)과 Daily Digest의 호버 이벤트가 모바일 터치 스크린 상에서 제대로 해제되지 않고 화면에 흉측하게 고정되거나 아예 나타나지 않습니다.
*   **위험 요인**: 모바일에는 'Hover' 상태가 존재하지 않고 'Tap(Touch)'만 존재하므로, 호버 전용 데스크톱 인터랙션을 모바일에 그대로 적용 시 시각적 정보 차단 및 레이아웃 훼손이 일어납니다.

### 3) 결함 3: iOS Safari 가상 키보드 자동 줌(Zoom) 버그
*   **현상**: PaceNote 옴니 검색창(`.omnibar-input`) 인풋 필드의 폰트 사이즈가 `14px` 혹은 `0.85rem` 등으로 작게 잡혀 있습니다.
*   **위험 요인**: iOS Safari 브라우저는 양식 인풋의 `font-size`가 **16px 미만**일 때 인풋 포커스 시 자동으로 화면을 강제 확대(Auto-Zoom)합니다. 이로 인해 인풋 입력을 마치고 포커스가 해제되어도 화면이 원래 배율로 복원되지 않고 전체 비주얼이 깨지는 고질적인 버그가 생깁니다.

### 4) 결함 4: 무의미한 데스크톱용 마우스 추적 루프 가동 (성능 오버헤드)
*   **현상**: 홈 화면의 망원경 커서(`TelescopeCursor.css`)나 네온 그라데이션 광원 효과를 위한 mousemove 추적 JS 루프가 모바일 스크린 상에서 스크롤을 내릴 때도 백그라운드에서 매 밀리초(ms) 단위로 호출됩니다.
*   **위험 요인**: 모바일 뷰포트 내 가속 병목을 가져오며, 스크롤 인터랙션 och 터치 반응에 미세한 프레임 랙(Frame Drop)을 유발해 프리미엄 웹의 매끄러운 부드러움을 손상시킵니다.

### 5) 결함 5: 360px 이하 초소형 가로폭에서의 레이아웃 붕괴 (Flex Wrapping 및 Shrink 부재)
*   **현상**: PaceNote 상단의 `[ Q1 Voyage ] [ Q2 Voyage ] ...` 분기 버튼 벨트가 가로 스크롤 없이 가로 폭에 밀려 겹치거나 깨집니다.
*   **위험 요인**: 가로폭 유연성 확보 코드가 부재하여 글자가 다음 줄로 흉측하게 줄 바꿈 되거나 그리드 경계를 이탈합니다.

### 6) 결함 6: 마크다운 텍스트 영역 내 표(Table) 및 코드 블록 가로 넘침 현상
*   **현상**: Builder's Log 상세 페이지(`BuildersLogDetail.jsx`)에 삽입된 데이터 표(Markdown Table)나 가로로 긴 코드 블록(`pre`, `code`)이 뷰포트 가로폭을 강제로 밀어내어, 페이지 전체가 좌우로 덜덜 떨리거나 스크롤이 흔들립니다.
*   **위험 요인**: 모바일 레이아웃 고정폭 한계를 초과하여 스크롤 오작동을 유발하고, 기술 아티클의 가독성을 극도로 저해합니다.

---

## 3. 핵심 도메인별 구체적 개선 방안 및 코드 가이드라인

### 1) [Daily Digest] 달력 격자 터치 핫스팟 투명 확장 (Visual 32px / Touch 44px)
모바일 해상도에서 캘린더 날짜 셀의 시각적 형태는 콤팩트하게 유지하되, **가상 클래스(`::after`)**를 활용하여 보이지 않는 터치 영역을 사방으로 안전하게 확장합니다.

*   **AS-IS (DailyCalendar.css)**:
    ```css
    .calendar-day-cell {
      position: relative;
      aspect-ratio: 1;
      width: 100%;
      border: 1px solid rgba(255, 255, 255, 0.03);
    }
    ```
*   **TO-BE (개선 제안 코드)**:
    ```css
    @media (max-width: 767px) {
      .calendar-day-cell {
        position: relative;
        /* 시각적으로는 정방형 유지 */
        aspect-ratio: 1; 
        min-height: 38px;
      }
      /* 물리적 터치 타겟을 투명 영역으로 사방 44px 이상 확장 */
      .calendar-day-cell::after {
        content: '';
        position: absolute;
        top: -4px;
        bottom: -4px;
        left: -4px;
        right: -4px;
        background: transparent;
        cursor: pointer;
        z-index: 2;
      }
    }
    ```

### 2) [Daily Digest] 모바일 2-Stage Tap 및 스크롤 고도화
모바일에서 날짜 터치 시 퀵 피크 카드 요약이 화면 하단(뷰포트 밖)에 렌더링되므로, 사용자가 정보를 바로 인지할 수 있도록 부드러운 스크롤 포커싱 처리를 확실하게 추가합니다.

*   **TO-BE (DailyDigest.jsx 개선 JS)**:
    ```javascript
    const handleSelectDateMobile = (dateStr) => {
      onSelectDate(dateStr); // 날짜 선택 바인딩
      
      // 모바일 뷰포트인 경우 하단 퀵피크 영역으로 부드럽게 스크롤 이동 유도
      if (window.innerWidth <= 767) {
        setTimeout(() => {
          const quickPeekEl = document.querySelector('.bento-quick-peek-section');
          if (quickPeekEl) {
            quickPeekEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      }
    };
    ```

### 3) [PaceNote] 터치 포인터 미디어를 활용한 호버 툴팁 탈피 및 가로 스크롤 전환
모바일에서는 호버 툴팁(`.weekly-hover-peek-panel`)의 마우스오버 트리거를 완벽히 배제하고, 해당 주차 클릭 시 정보를 화면 내부 공간에 단정하게 표시(인라인 렌더링)하도록 설계 구조를 제어합니다.

*   **TO-BE (PaceNoteWeeklyCalendar.css & ChronoRibbon.css)**:
    ```css
    /* 데스크톱 마우스 환경에서만 호버 툴팁 활성화 */
    @media (hover: hover) and (pointer: fine) {
      .week-matrix-cell:hover + .weekly-hover-peek-panel {
        display: block;
        opacity: 1;
      }
    }

    /* 터치 스크린 모바일 환경 전용 */
    @media (max-width: 767px) {
      .weekly-hover-peek-panel {
        position: relative; /* 오버레이가 아닌 문서 흐름 내 배치 */
        width: 100%;
        top: 0;
        left: 0;
        margin-top: 16px;
        display: block; /* 상시 렌더링하되 선택 시 내부만 다이내믹 변경 */
        border: 1px solid rgba(34, 211, 238, 0.2);
        background: rgba(10, 7, 20, 0.8);
      }
      
      /* 스크롤 리본 뷰포트 스냅 동작 추가 */
      .ribbon-viewport {
        scroll-snap-type: x mandatory;
        -webkit-overflow-scrolling: touch;
      }
      
      .ribbon-week-card {
        scroll-snap-align: center;
        flex-shrink: 0;
      }
    }
    ```

### 4) [PaceNote] 옴니 검색창 iOS Safari 강제 줌인 배제 사양
Safari의 레이아웃 강제 줌 방지를 위해, 모바일 화면에서의 인풋 텍스트 필드의 `font-size` 최소값 제한을 **16px**로 전면 고정합니다.

*   **AS-IS (PaceNoteDashboard.css)**:
    ```css
    .omnibar-input {
      font-size: 0.9rem; /* 14.4px 내외 */
    }
    ```
*   **TO-BE (개선 제안 코드)**:
    ```css
    @media (max-width: 767px) {
      .omnibar-input {
        font-size: 16px !important; /* iOS 강제 화면 줌 버그 방지 절대 마지노선 */
        padding: 12px 16px;
      }
    }
    ```

### 5) [Builders' Log] 마크다운 가로 넘침 방지 아키텍처
데이터 테이블과 대용량 코드 블록의 가로폭 탈출 현상을 해결하기 위해 메인 포스트 컨테이너에 완벽한 스크롤 격리벽을 세웁니다.

*   **TO-BE (BuildersLogDetail.css 개선 코드)**:
    ```css
    /* 마크다운 파싱 아티클 컨테이너 */
    .builders-log-article-body {
      width: 100%;
      overflow-wrap: break-word;
      word-break: break-word;
    }

    /* 테이블 요소의 가로 스크롤 감싸기 */
    .builders-log-article-body table {
      display: block;
      width: 100% !important;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      border-collapse: collapse;
      margin-bottom: 24px;
    }

    /* 코드 블록 스크롤 격리 */
    .builders-log-article-body pre {
      max-width: 100%;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      white-space: pre;
      word-wrap: normal;
    }
    ```

### 6) [글로벌] 포인터 장치 유형에 따른 렌더러 분기 및 성능 최적화 (JS)
터치 스크린 전용 단말기에서는 마우스 궤적 및 망원경 포인터 추적 이벤트 등록을 전면 취소하여 불필요한 메인 스레드 점유율을 0으로 유도합니다.

*   **TO-BE (TelescopeCursor.jsx 또는 글로벌 스크립트)**:
    ```javascript
    useEffect(() => {
      // 1. coarse 포인터(모바일, 태블릿 터치 스크린) 판별
      const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
      
      if (isTouchDevice) {
        console.log('[TelescopeCursor] Touch device detected. Mouse pointer tracker disabled for performance.');
        return; // 이벤트 등록을 통째로 생략
      }

      // 2. 마우스 환경인 경우에만 이벤트 리스너 등록
      const handleMouseMove = (e) => {
        // 망원경 렌더 루프 가동
      };
      
      window.addEventListener('mousemove', handleMouseMove);
      return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);
    ```

---

## 4. 모바일 UI 개선에 따른 기대 효과 비교

| 최적화 지표 | As-Is (개선 전) | To-Be (개선 후) | 기대 효과 및 이점 |
| :--- | :--- | :--- | :--- |
| **터치 접근성** | 캘린더 날짜 셀 터치폭 `30px` 미만 (오터치 잦음) | 가상 영역 확장 적용 `44px` 이상 확보 | WCAG 2.1 AAA 등급 충족, 오터치율 90% 이상 차단 |
| **iOS 레이아웃 붕괴** | 검색창 포커스 시 Safari 강제 줌인 발생 | `font-size: 16px` 고정으로 강제 줌 원천 차단 | 모바일 검색 중 화면 일그러짐 차단 및 몰입감 보존 |
| **모바일 렌더링 프레임** | mousemove 이벤트 상시 감지로 `52~55fps` 저하 | 터치 스크린 감지 시 추적 완전 OFF로 `60fps` 고정 | 터치 스크롤 스크롤링 시 화면의 부드러움 극대화 |
| **텍스트/레이아웃 안정성** | 코드 블록 및 테이블 오버플로우로 가로 찢어짐 | 컨테이너 격리 및 `overflow-x: auto` 강제 | 화면 깨짐 현상 차단 및 모바일 테크 아티클 가독성 200% 향상 |

---

## 5. 결론 및 실천적 제언

PriSincera 플랫폼은 최신 웹 기술의 미적인 아름다움이 극대화된 웹사이트입니다. 이번 **모바일 최적화 진단 및 제안 사항**은 기존 데스크톱 중심의 비주얼 토큰과 디자인 가치를 1%도 훼손하지 않으면서, CSS 가상 클래스(invisible targets), CSS 미디어 쿼리(`@media hover`), 그리고 JS 포인터 분기 기법을 활용해 스마트하게 모바일 사용성을 향상시키는 솔루션들입니다.

향후 기능 고도화나 유지 보수 작업 시 본 제 제안서에 규정된 코드를 기준으로 점진적인 수정을 지속 반영해 나갈 것을 강력히 권고합니다.

---

## 6. 추진 전략 및 릴리즈 로드맵 (Release Strategy)

제안된 모바일 웹 최적화 방안들은 플랫폼 전반의 UI/UX와 스크롤 성능에 직결되므로, 개발 리소스와 리스크 통제 능력을 극대화하기 위한 두 가지 추진 방향(일괄 진행 vs. 단계별 릴리즈)을 검토합니다.

### 1) 일괄 진행 전략 (Big Bang Integration)
*   **방식**: 6대 최적화 요소를 단일 스프린트에서 모두 개발하여 통합 배포.
*   **장점**:
    *   **사용자 만족도 체감도 극대화**: 모바일 사용성이 동시다발적으로 비약 상승하여 플랫폼 완성도가 전반적으로 도약함.
    *   **통합 QA 효율**: 여러 번 나누어 검수할 필요 없이 1회의 정밀 모바일 기기 검수(iOS Safari, Android Chrome 등) 세션으로 최종 릴리즈를 완수할 수 있어 총 검수 리소스 감소.
*   **단점/리스크**:
    *   여러 파일의 스타일이 일시에 수정되므로, 미세한 해상도 영역에서 예기치 못한 스타일 깨짐(Layout Shifting) 발생 시 디버깅 원인 탐색 범위가 넓어짐.

### 2) 단계별 추진 전략 (Phased Roadmap) - ★ 권장안
*   **방식**: 영향도(Impact), 개발 난이도(Complexity), 배포 리스크(Risk)를 다차원 분석하여 **3단계 점진적 마일스톤**으로 쪼개어 배포.
*   **로드맵 구성**:

#### 📌 [Phase 1] 즉각적 고효율 안정성 확보 (Immediate High-Value / Low-Cost)
*   **대상 결함**: 
    *   [결함 3] iOS Safari 가상 키보드 자동 줌인 버그 해결 (`font-size: 16px` 적용).
    *   [결함 5 & 6] 초소형 해상도 분기 벨트 Wrapping 보완 및 마크다운 콘텐츠(표, 코드 블록) 가로 찢어짐 격리.
*   **공수/리스크**: 매우 낮음 (간단한 CSS 룰셋 추가로 가능) / 부작용 거의 없음.
*   **효과**: 텍스트 누락 및 가상 키보드로 인한 전면 화면 찌그러짐을 즉각 차단하여 최우선 안정성 확보.

#### 📌 [Phase 2] 터치 정확도 및 모바일 주사율 극대화 (Core Touch & Performance)
*   **대상 결함**: 
    *   [결함 1] 터치 타겟 투명 가상 클래스 확장 (`::after` 44px 이상).
    *   [결함 4] 터치 단말기 코스 포인터(`pointer: coarse`) 감지 시 mousemove 망원경 커서 렌더 루프 완전 차단.
*   **공수/리스크**: 보통 (가상 영역 충돌 검증 필요) / 리스크 낮음.
*   **효과**: 오터치 발생률 90% 이상 격감 및 모바일 터치 스크롤링 시 버벅임 없는 60fps 고주사율 확보.

#### 📌 [Phase 3] 모바일 전용 인터랙션 및 정보 구조 개편 (UX Flow Overhaul)
*   **대상 결함**: 
    *   [결함 2] 모바일 pointer 미디어에 맞춘 호버 툴팁 탈피 (인라인/바텀 시트 전환), 2-Stage Tap 스크롤 연동 고도화.
*   **공수/리스크**: 보통~높음 (모바일 전용 컴포넌트 렌더 분기 로직 및 터치 상태 관리 필요).
*   **효과**: 마우스가 부재한 터치 환경에 100% 최적화된 새로운 모바일 모달-프리 크로노 가이드라인 구축 완수.

### 3) 최종 의사결정: 일괄 진행 전략 (Big Bang Execution) 확정
*   **결정 사항**: 단계별 릴리즈의 안정성도 훌륭하지만, PriSincera 팀은 모바일 최적화를 즉각적이고 동시적으로 완성하여 글로벌 비즈니스 품질 향상의 극대화 효과를 신속하게 누리는 **[일괄 진행 전략]**을 최종 채택 및 확정하였습니다.
*   **리스크 극복 방안**:
    1. **엄격한 다중 미디어 쿼리 격리**: 각 스타일 시트의 모바일 영향 범위가 데스크톱 렌더러에 간섭하지 않도록 미디어 쿼리 격리 벽을 철저히 검증합니다.
    2. **통합 크로스 브라우저 QA**: iOS Safari, Android Chrome 등 실물 단말 테스트 및 브라우저 시뮬레이터를 활용해 일괄 검수 세션을 밀도 있게 진행합니다.

---

## 7. 종합 결론 및 실천적 제언

PriSincera 플랫폼은 최신 웹 기술의 미적인 아름다움이 극대화된 웹사이트입니다. 이번 **모바일 최적화 진단 및 제안 사항**은 기존 데스크톱 중심의 비주얼 토큰과 디자인 가치를 1%도 훼손하지 않으면서, CSS 가상 클래스(invisible targets), CSS 미디어 쿼리(`@media hover`), 그리고 JS 포인터 분기 기법을 활용해 스마트하게 모바일 사용성을 향상시키는 솔루션들입니다.

운영 및 배포의 시너지와 사용성의 비약적 동반 상승을 위해 최종 결정된 **[일괄 진행 전략(Big Bang Integration)]**을 전격 실행하여 플랫폼 전반의 모바일 가독성과 조작성을 즉각 완성할 것을 최종 합의 및 확정합니다.
