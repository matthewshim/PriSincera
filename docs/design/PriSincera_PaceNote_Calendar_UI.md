# PriSincera PaceNote Bento Weekly Calendar & Voyage Horizon UI Specification

본 문서는 사용자가 주차별 목표를 수립하고 달성해나가는 **'전략적 마일스톤 관리(나만의 궤도) 플랫폼'**인 PaceNote 서비스(`/pacenote`)의 **주차별 캘린더 & 항해 지평선 UI/UX (Bento Weekly Route & Voyage Horizon)**의 최종 구현 사양서 및 상단 대시보드 내비게이션 영역의 **전면 2차 개편(Two-Track UI/UX) 기획서**입니다.

기존의 평면적인 단순 그리드 모달 내비게이션을 전면 개편하고, 2026년 5월 20일 **Concept A. Chrono-Quarterly Bento Matrix**를 기반으로 성공적으로 구현 완료 및 프로덕션 환경에 완전 릴리즈되었습니다.

여기에 더해, 대시보드 상단의 고질적으로 답답했던 1주 단위 이전/다음 텍스트 이동 영역 자체를 인라인 주간 캘린더 타임라인으로 직접 승격하는 **인라인 주간 크로노 리본(Inline Weekly Chrono-Ribbon) 캘린더 UI 전면 개편안**을 2차 사양으로 정립 및 수록합니다.

---

## 1. 배경 및 구현 개요

PaceNote는 일(Day) 단위가 아닌 **주(Week - ISO 8601 기준 `YYYY-Wxx`)** 단위로 운용되는 서비스 특성을 지닙니다. 이에 따라 기존 Gregorian 월 달력과는 완전히 다른 주간 단위의 시간 시각화 레이아웃과 감각적인 성장 궤적 추적이 요구되었습니다.

* **최종 채택 사양**: **Concept A. "Chrono-Quarterly Bento Matrix" (분기별 13주차 벤트 매트릭스)**
* **릴리즈 일자**: 2026-05-20 (1차 완료)
* **구현 컴포넌트**:
  * [PaceNoteWeeklyCalendar.jsx](file:///d:/prisincera/www/src/components/pacenote/PaceNoteWeeklyCalendar.jsx) - 분기 벤트 구조화 및 150ms 디바운스 호버 피크 로직 구현.
  * [PaceNoteWeeklyCalendar.css](file:///d:/prisincera/www/src/components/pacenote/PaceNoteWeeklyCalendar.css) - 글래스모피즘 스킨, 네온 오로라 아우라(pulseAura), GPU 렌더링 가속 및 CLS 방지 스타일링.
* **통합 대상**: `PaceNoteDashboard.jsx` 대시보드 내 모달 영역 확장 통합 (1000px 규격으로 개방감 확장 및 레이아웃 시프트 방지 패딩 설계).

---

## 2. UI/UX 디자인 핵심 콘셉트 (1차 완료)

### 🚀 Concept A. "Chrono-Quarterly Bento Matrix"
> **"1년 52주를 분기(Q1~Q4) 단위의 Bento 박스로 구조화하여 성장의 매크로 로드맵을 시각화합니다."**

* **구조 및 레이아웃**:
  * 화면을 4개의 큰 **Bento Box(Q1, Q2, Q3, Q4)** 영역으로 양분하여 데스크톱 2x2 그리드로 대칭 배치합니다.
  * 한 분기는 정확히 **13주**로 이루어지므로, 각 Bento Box 내부에 13개의 글래스모피즘 주차 카드를 정교한 격자 그리드(`4 x 3` 및 마지막 `1` 행)로 안정감 있게 배치합니다.
* **디자인 & 상태 비주얼 (Weekly Cell States)**:
  1. **과거 완료 주차 (Past Completed)**: 투명도 높은 글래스모피즘 스킨(`background: rgba(0, 0, 0, 0.25)`, `border: 1px solid rgba(255, 255, 255, 0.06)`). 해당 주차의 실시간 Task 달성도(완료 테스크 / 총 테스크)에 비례한 하단 마이크로 게이지바(`.cell-progress-fill`) 탑재.
  2. **현재 개척 주차 (Current Active)**: 사이버 사이언 네온 아우라 테두리(`#22D3EE`). 2초 주기로 테두리가 부드럽게 펄싱되는 외곽 글로우 애니메이션(`pulseAura`)과 우측 상단 중앙의 맥동 도트 인디케이터(`.pulse-indicator`) 연동.
  3. **미래 대기 주차 (Future Locked)**: 딤드 처리(`opacity: 0.25`), 포인터 및 클릭 차단(`disabled`), 점선 테두리(`border-style: dashed`), 자물쇠 아이콘(`🔒`) 노출.

---

## 3. 인터랙션 및 상태 관리 흐름

PaceNote 캘린더는 불필요한 API 호출을 최소화하고 CPU 및 렌더링 부하를 제어하는 **0-Lag Performance** 사양을 완벽히 충족합니다.

```mermaid
graph TD
    A[사용자 PaceNote 대시보드 진입] --> B[API /api/pacenote 호출]
    B --> C[유저 전체 주차 ID 목록 & 현재 주차 궤도 정보 수집]
    C --> D[대시보드 상단 궤도 내비게이션 바 렌더링]
    
    D --> E{전체 항해 일지 보기 버튼 클릭}
    E -->|Bento Matrix 모달 진입| F[분기별 13주 Bento Grid 팝업 노출]
    
    F --> G{사용자 주차 카드 호버}
    G -->|Debounce 150ms 대기| H[해당 주차 데이터 실시간 요약 연산]
    H --> I[하단 오버레이 패널에 체크리스트 달성률 및 Statement 렌더링]
    
    F --> J{사용자 주차 카드 클릭}
    J -->|과거/현재 주차 선택| K[selectedWeekId 상태 업데이트 후 대시보드 뷰 즉시 전환]
    J -->|미래 주차 선택| L[Disabled 상태로 클릭 액션 완전 차단]
    
    K --> M[대시보드 주차 데이터 전환 완료 및 모달 닫힘]
```

### 💡 150ms Debounced Hover & Dynamic Summary
* **렌더링 부하 보호**: 사용자가 마우스를 캘린더 그리드 상에서 빠르게 스쳐 지나갈 때 생기는 무의식적 호버 이벤트를 무시하기 위해 `150ms` 디바운싱 타이머를 완벽히 장착했습니다. `onMouseEnter` 시 타이머를 작동시켜 150ms 이상 커서가 머물렀을 때에만 하단 정보 패널을 활성화합니다.
* **실시간 통계 연산**: `pastWeeksData`와 `currentWeekTasks` 데이터를 기반으로 전체 항해의 진척도(총 테스크 수 대비 완료 테스크 수)를 동적으로 실시간 연산하여, 하드코딩 없는 라이브 진척도 바(Progress Bar)를 구현합니다.

---

## 4. 컴포넌트 마크업 설계 실질 구현

신설되어 프로덕션에 완벽히 정합된 `PaceNoteWeeklyCalendar.jsx` 소스 코드 스니펫입니다.

### 📂 [PaceNoteWeeklyCalendar.jsx](file:///d:/prisincera/www/src/components/pacenote/PaceNoteWeeklyCalendar.jsx)

```jsx
import { useState, useMemo, useEffect } from 'react';
import './PaceNoteWeeklyCalendar.css';

export default function PaceNoteWeeklyCalendar({ 
  allWeekIds = [], 
  currentWeekId, 
  selectedWeekId, 
  pastWeeksData = [], // 과거 Task 완성률 정보 매핑용
  currentWeekTasks = [], // 이번 주 실시간 Task
  onSelectWeek 
}) {
  const [hoveredWeekInfo, setHoveredWeekInfo] = useState(null);
  const [hoverTimeoutId, setHoverTimeoutId] = useState(null);
  
  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutId) clearTimeout(hoverTimeoutId);
    };
  }, [hoverTimeoutId]);

  // 1년의 주차들을 4개 분기(Q1: 1~13, Q2: 14~26, Q3: 27~39, Q4: 40~53)로 그룹핑
  const quarterlyGroups = useMemo(() => {
    const quarters = {
      Q1: { title: "Q1 Voyage (1~13주차)", weeks: [] },
      Q2: { title: "Q2 Voyage (14~26주차)", weeks: [] },
      Q3: { title: "Q3 Voyage (27~39주차)", weeks: [] },
      Q4: { title: "Q4 Voyage (40~53주차)", weeks: [] },
    };

    allWeekIds.forEach(wId => {
      const parts = wId.split('-W');
      if (parts.length !== 2) return;
      const weekNum = parseInt(parts[1], 10);

      if (weekNum >= 1 && weekNum <= 13) quarters.Q1.weeks.push(wId);
      else if (weekNum >= 14 && weekNum <= 26) quarters.Q2.weeks.push(wId);
      else if (weekNum >= 27 && weekNum <= 39) quarters.Q3.weeks.push(wId);
      else if (weekNum >= 40 && weekNum <= 53) quarters.Q4.weeks.push(wId);
    });

    return quarters;
  }, [allWeekIds]);

  // 전체 항해 진척도 동적 연산
  const totalStats = useMemo(() => {
    let totalTasksCount = 0;
    let completedTasksCount = 0;

    pastWeeksData.forEach(pw => {
      if (pw.tasks) {
        totalTasksCount += pw.tasks.length;
        completedTasksCount += pw.tasks.filter(t => t.completed).length;
      }
    });

    if (currentWeekTasks) {
      totalTasksCount += currentWeekTasks.length;
      completedTasksCount += currentWeekTasks.filter(t => t.completed).length;
    }

    const percent = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;
    return {
      total: totalTasksCount,
      completed: completedTasksCount,
      percent
    };
  }, [pastWeeksData, currentWeekTasks]);

  const handleWeekHover = (wId) => {
    if (hoverTimeoutId) clearTimeout(hoverTimeoutId);

    const timer = setTimeout(() => {
      const timelineWeek = pastWeeksData.find(p => p.weekId === wId);
      const isCurrent = wId === currentWeekId;
      const isFuture = !isCurrent && !timelineWeek;

      if (isFuture) {
        setHoveredWeekInfo({ wId, isFuture: true });
        return;
      }

      let total = 0;
      let completed = 0;
      let statement = "진행된 기록이 있는 항해 경로입니다.";

      if (isCurrent) {
        total = currentWeekTasks.length;
        completed = currentWeekTasks.filter(t => t.completed).length;
        statement = "현재 치열하게 개척 중인 이번 주 궤도입니다.";
      } else if (timelineWeek) {
        total = timelineWeek.tasks ? timelineWeek.tasks.length : 0;
        completed = timelineWeek.tasks ? timelineWeek.tasks.filter(t => t.completed).length : 0;
        statement = timelineWeek.statement || "완료된 기록이 안전하게 저장된 항해 경로입니다.";
      }

      setHoveredWeekInfo({
        wId,
        isFuture: false,
        isCurrent,
        total,
        completed,
        statement
      });
    }, 150); // 150ms debounce

    setHoverTimeoutId(timer);
  };

  const handleWeekLeave = () => {
    if (hoverTimeoutId) clearTimeout(hoverTimeoutId);
    setHoveredWeekInfo(null);
  };

  return (
    <div className="pacenote-weekly-chrono-container">
      {/* ── 상단 통계 헤더 ── */}
      <div className="chrono-weekly-summary">
        <span className="summary-title">⛵ 전체 항해 진척도</span>
        <div className="summary-bar-wrapper">
          <div className="summary-progress-fill" style={{ width: `${totalStats.percent}%` }}></div>
          <span className="summary-percent">{totalStats.percent}% Completed ({totalStats.completed}/{totalStats.total})</span>
        </div>
      </div>

      {/* ── 분기별 Bento Matrix 그리드 ── */}
      <div className="bento-quarterly-grid">
        {Object.entries(quarterlyGroups).map(([qKey, qData]) => {
          if (qData.weeks.length === 0) return null;
          
          return (
            <div key={qKey} className="quarter-bento-box">
              <h4 className="quarter-title">{qData.title}</h4>
              <div className="quarter-weeks-grid">
                {qData.weeks.map(wId => {
                  const parts = wId.split('-W');
                  const wNum = parts[1];
                  
                  const isCurrent = wId === currentWeekId;
                  const isSelected = wId === selectedWeekId;
                  const timelineWeek = pastWeeksData.find(p => p.weekId === wId);
                  const isFuture = !isCurrent && !timelineWeek;

                  let cardClass = "week-matrix-cell";
                  if (isCurrent) cardClass += " current";
                  if (isSelected) cardClass += " selected";
                  if (isFuture) cardClass += " locked";

                  // 완료 비율 계산
                  let pct = 0;
                  if (isCurrent) {
                    pct = currentWeekTasks.length > 0
                      ? Math.round((currentWeekTasks.filter(t => t.completed).length / currentWeekTasks.length) * 100)
                      : 0;
                  } else if (timelineWeek) {
                    pct = timelineWeek.tasks && timelineWeek.tasks.length > 0
                      ? Math.round((timelineWeek.tasks.filter(t => t.completed).length / timelineWeek.tasks.length) * 100)
                      : 0;
                  }

                  return (
                    <button
                      key={wId}
                      className={cardClass}
                      onClick={() => !isFuture && onSelectWeek(wId)}
                      onMouseEnter={() => handleWeekHover(wId)}
                      onMouseLeave={handleWeekLeave}
                      disabled={isFuture}
                    >
                      <div className="cell-top">
                        <span className="week-label">{wNum}주차</span>
                        {isFuture && <span className="lock-icon">🔒</span>}
                        {isCurrent && <span className="pulse-indicator"></span>}
                      </div>

                      {!isFuture && (
                        <div className="cell-progress-track">
                          <div className="cell-progress-fill" style={{ width: `${pct}%` }}></div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── 하단 실시간 호버 퀵피크 오버레이 패널 ── */}
      {hoveredWeekInfo && (
        <div className="weekly-hover-peek-panel">
          <div className="peek-panel-arrow"></div>
          <div className="peek-panel-content">
            <span className="peek-week-title">{hoveredWeekInfo.wId} 궤도 정보</span>
            {hoveredWeekInfo.isFuture ? (
              <p className="peek-desc">🔒 미개척 항해 주차입니다. 해당 주간에 궤도가 오픈됩니다.</p>
            ) : (
              <div className="peek-metrics">
                <span className="metric-item">체크리스트 달성률: {hoveredWeekInfo.completed} / {hoveredWeekInfo.total} 완료</span>
                <p className="peek-statement">"{hoveredWeekInfo.statement}"</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## 5. CSS 정밀 스타일링 및 CLS/성능 방어 가이드

PaceNote 주차별 캘린더는 다수의 글래스 카드가 존재하므로, 스크롤 및 호버 시 초당 60프레임(60fps)을 보존하기 위해 하드웨어 GPU 가속을 적극 유도하며 레이아웃 시프트를 사전에 완벽히 방어합니다.

### 1) 레이아웃 시프트 방지 (`padding-bottom`)
* **현상**: 하단의 실시간 호버 퀵피크 오버레이 패널(`.weekly-hover-peek-panel`)은 절대 위치(`position: absolute; bottom: -90px;`)로 배치됩니다. 이때 호버 시 동적으로 카드가 나타날 때, 모달 창 바닥이 잘리거나 레이아웃이 튕겨 시프트(CLS)가 발생할 수 있습니다.
* **해결책**: 부모 컨테이너 `.pacenote-weekly-chrono-container`에 명시적인 `padding-bottom: 110px`과 `min-height: 400px`을 지정하여 팝업 패널이 위치할 넉넉한 공간을 미리 할당해 레이아웃 변형을 완전 차단합니다.

### 2) 맥동 오라 이펙트 (Aura Pulse Animation)
현재 주차 활성 시 사이버 사이언 컬러로 테두리가 고동치는 맥동 광원을 표현하기 위해 `::after` 가상 요소를 띄워 브라우저 성능 부하 없이 3D 부유 레이어를 연출합니다.

```css
.week-matrix-cell.current::after {
  content: '';
  position: absolute;
  top: -1px; left: -1px; right: -1px; bottom: -1px;
  border-radius: 12px;
  border: 1px solid #22D3EE;
  pointer-events: none;
  animation: pulseAura 2s infinite ease-in-out;
}

@keyframes pulseAura {
  0% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.02); }
  100% { opacity: 0.3; transform: scale(1); }
}
```

---

## 6. 레이아웃 안정성 및 모바일 리플로우 가이드

### 1) 모바일 레이아웃 최적화 (`@media (max-width: 768px)`)
* **데스크톱**: 분기별 2x2 Bento Box 레이아웃으로 넓고 시원하게 정보를 격자 배열합니다.
* **모바일**:
  * 분기별 Bento Box가 수직 1열 종대로 스택 정렬되어 화면 폭에 구애받지 않고 가독성을 수호합니다.
  * 한 줄에 4개씩 격자 배치(`grid-template-columns: repeat(4, 1fr)`)되는 주차 카드의 넓이를 유동적으로 조정하며, 초소형 화면(480px 이하)에서는 한 줄에 3개씩 배치(`grid-template-columns: repeat(3, 1fr)`)되도록 자동 리플로우되어 터치 미스를 원천 예방합니다.

---

## 7. 비채택 및 대안 검토 아카이브 (Alternative Concepts Checked)

디자인 설계 과정에서 검토되었으나 최종 탈락 혹은 추후 확장 시나리오로 이관된 대안 콘셉트들입니다.

### 🌌 Concept B. "Orbit Horizon Scroll" (수평 인피니트 궤도 타임라인)
* **내용**: 1단 슬라이드 형식의 무한 수평 스크롤 타임라인. 휠과 스와이프를 지원하며 중앙 주차가 스케일 업(Scale up)되는 원근법 뷰.
* **비채택 사유**: 탐색 속도는 빠르나, 전체 1년 단위의 52주차 매크로 성장 로드맵을 한 번에 조망하기 어렵고 데일리 다이제스트 캘린더 뷰와의 일관성이 Bento 방식에 비해 다소 떨어진다는 판정을 받음.

---

## 8. [NEW] 2차 개편안: 대시보드 상단 인라인 주간 크로노 리본(Weekly Chrono-Ribbon) 타임라인 캘린더 UI

### 8-1. 개편 배경 및 사용성 혁신 방향 (Two-Track System)
* **기존 문제점**: 대시보드 상단의 기존 주차 선택 영역(이전 이미지 영역)은 오직 단순 화살표 버튼에 의존해 1주 단위로만 수평 이동이 가능하여 탐색 피로도가 극도로 높았습니다. 또한 '전체 항해 일지 보기' 텍스트 버튼이 하단에 분리되어 있어 두 행동 간의 동선이 단절되어 있었습니다.
* **혁신 설계 (Two-Track Navigation)**: 
  * 화면 상단의 거대한 텍스트 영역을 **가로로 유려하게 흐르는 '인라인 주간 오비탈 리본(Weekly Chrono-Ribbon) 캘린더 타임라인'**으로 완전히 승격 개편합니다.
  * **미시적/연속적 탐색**: 상단 리본 타임라인에서 현재 주차를 중심으로 전후 4~5주차가 영롱한 수평 글래스 카드로 직접 노출되어 굳이 모달을 열지 않고도 원클릭으로 즉각 이송합니다.
  * **거시적/구조적 탐색**: 리본의 맨 우측 지점에 정교하게 디자인된 **`[🗓️전체 항해 일지]` 캘린더 아이콘 버튼**을 일체형으로 통합하여, 이를 터치했을 때만 거대한 '분기별 Bento Matrix 모달 캘린더'가 투사되도록 결합합니다.

### 8-2. 와이어프레임 및 레이아웃 아키텍처

```
+--------------------------------------------------------------------------------------------------+
  [ ⛵ VOYAGE HORIZON ]                                                                    
                                                                                           
  +----------------------------------------------------------------------------------------------+
  |  <  [ W19 ]       [ W20 ]       +-------------+       [ W22 ]       [ W23 🔒 ]    >  [🗓️ LOG] |
  |     05/04~05/10   05/11~05/17   |   W21 [★]   |       05/25~05/31   06/01~06/07      [모달열기] |
  |     [■■■■░] 80%   [■■■░░] 60%   |  [ACTIVE]   |       [░░░░░] 0%    [🔒 Locked]                 |
  |                                 |   ( 83% )   |                                              |
  |                                 +-------------+                                              |
  +----------------------------------------------------------------------------------------------+
+--------------------------------------------------------------------------------------------------+
```

* **구조 설계**:
  * 컨테이너: `.pacenote-chrono-ribbon-container` (기존 `pacenote-detail-nav-container`를 전면 대체)
  * 좌우 탄성 내비게이션 화살표(`nav-arrow prev/next`)가 리본 양끝에 부드럽게 감싸고, 마우스 휠 및 스와이프를 통한 수평 인피니트 스크롤을 전면 내장합니다.
  * **🗓️ LOG 단일 통합 버튼**: 리본의 우측 끝에 글래스모피즘 아이콘 형태로 `LOG` 모달 트리거를 배치하여 전체 항해 일지 Bento 캘린더를 필요시에만 자연스럽게 호출합니다.

### 8-3. 세부 상태 및 인터랙션 토큰 (Ribbon Card States)
1. **현재 앵커 주차 (Selected/Active Center Card)**: 
   * 다른 주차 대비 1.1배 크기(`scale(1.1)`)로 강조되며, 테두리에 사이언 네온 아우라가 맥동하여 현재 사용자의 항해 궤도 중심점임을 명확히 합니다.
   * `TODAY` 또는 `ACTIVE` 마이크로 스티커 배지가 카드 내부에 투사됩니다.
2. **인접 과거 주차 (Past Chrono Cards)**:
   * 은은한 보라빛 테두리를 가진 반투명 글래스 카드로 나열됩니다.
   * 카드 하단에 완료율 게이지 바(`.ribbon-cell-progress`) 또는 완료 도트 인디케이터가 적용되어 지난 성장의 궤적을 휠 탐색만으로 즉각 파악 가능합니다.
3. **인접 미래 주차 (Future Locked Cards)**:
   * `opacity: 0.3`으로 딤드 처리되며, 미세한 자물쇠 아이콘과 함께 클릭 액션이 제한됩니다.

### 8-4. 컴포넌트 설계 사양

신규 컴포넌트 `PaceNoteChronoRibbon.jsx` 및 `PaceNoteChronoRibbon.css`를 구축하여 기존 대시보드 상단을 완전히 전면 개편하기 위한 마크업 및 배치 사양입니다.

#### 📂 [NEW] [PaceNoteChronoRibbon.jsx](file:///d:/prisincera/www/src/components/pacenote/PaceNoteChronoRibbon.jsx) (개발 계획)

```jsx
import { useMemo, useRef } from 'react';
import './PaceNoteChronoRibbon.css';

export default function PaceNoteChronoRibbon({
  allWeekIds = [],
  currentWeekId,
  selectedWeekId,
  pastWeeksData = [],
  currentWeekTasks = [],
  onSelectWeek,
  onOpenFullLog // 🗓️전체 항해 일지 Bento 모달 트리거
}) {
  const ribbonRef = useRef(null);

  // 현재 선택된 주차를 중심으로 주변 5~7개 주차를 동적으로 슬라이싱하여 슬라이드 뷰포트 구성
  const visibleWeeks = useMemo(() => {
    const selectedIdx = allWeekIds.indexOf(selectedWeekId);
    if (selectedIdx === -1) return allWeekIds.slice(0, 5);

    // selectedWeekId 전후 2~3개 주차를 추출
    const start = Math.max(0, selectedIdx - 2);
    const end = Math.min(allWeekIds.length, selectedIdx + 3);
    return allWeekIds.slice(start, end);
  }, [allWeekIds, selectedWeekId]);

  return (
    <div className="pacenote-chrono-ribbon-container">
      {/* ── 좌측 이동 화살표 ── */}
      <button className="ribbon-nav-btn prev" aria-label="이전 주차">
        ◀
      </button>

      {/* ── 가로 주차 리본 타임라인 그리드 ── */}
      <div className="chrono-ribbon-viewport" ref={ribbonRef}>
        {visibleWeeks.map(wId => {
          const isCurrent = wId === currentWeekId;
          const isSelected = wId === selectedWeekId;
          const timelineWeek = pastWeeksData.find(p => p.weekId === wId);
          const isFuture = !isCurrent && !timelineWeek;

          // 달성률 계산
          let pct = 0;
          if (isCurrent) {
            pct = currentWeekTasks.length > 0
              ? Math.round((currentWeekTasks.filter(t => t.completed).length / currentWeekTasks.length) * 100)
              : 0;
          } else if (timelineWeek) {
            pct = timelineWeek.tasks && timelineWeek.tasks.length > 0
              ? Math.round((timelineWeek.tasks.filter(t => t.completed).length / timelineWeek.tasks.length) * 100)
              : 0;
          }

          let cardClass = "ribbon-week-card";
          if (isCurrent) cardClass += " current";
          if (isSelected) cardClass += " selected";
          if (isFuture) cardClass += " locked";

          return (
            <button
              key={wId}
              className={cardClass}
              onClick={() => !isFuture && onSelectWeek(wId)}
              disabled={isFuture}
            >
              <div className="card-top">
                <span className="card-week-num">{wId.split('-W')[1]}주차</span>
                {isCurrent && <span className="active-sticker">ACTIVE</span>}
                {isFuture && <span className="lock-sticker">🔒</span>}
              </div>
              
              {!isFuture && (
                <div className="card-progress-bar">
                  <div className="card-progress-fill" style={{ width: `${pct}%` }}></div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* ── 우측 이동 화살표 ── */}
      <button className="ribbon-nav-btn next" aria-label="다음 주차">
        ▶
      </button>

      {/* ── 🗓️ LOG 단일 통합 버튼 ── */}
      <button className="full-log-trigger-btn" onClick={onOpenFullLog} title="전체 항해 일지 캘린더 보기">
        🗓️ LOG
      </button>
    </div>
  );
}
```

### 8-5. 레이아웃 안정성 및 반응형 리스크 방지
* **터치 가로 스크롤**: 모바일 환경에서는 억지로 화살표 버튼을 터치하지 않아도, 손가락 스와이프를 통해 탄성 넘치는 부드러운 가로 스크롤링이 자연스럽게 유도되도록 `-webkit-overflow-scrolling: touch;` 및 `overflow-x: auto;`로 물리 효과를 적용합니다.
* **레이아웃 시프트 방지**: 리본 타임라인 카드가 변경되거나 로딩되는 시점에 대시보드 본문 카드가 위아래로 출렁이지 않도록, 리본 컨테이너는 항상 일정한 고정 높이(`height: 90px`)를 엄격히 사수하도록 CSS 차원에서 절대적인 제약 조건을 지정합니다.
