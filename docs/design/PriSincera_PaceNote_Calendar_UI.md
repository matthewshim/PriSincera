# PriSincera PaceNote Weekly Calendar & Voyage UX Renewal Proposal

## 1. 배경 및 개선 필요성

현재 PaceNote 서비스(`/pacenote`)는 사용자가 주차별 목표를 수립하고 이를 달성해나가는 **'전략적 마일스톤 관리(나만의 궤도) 플랫폼'**입니다. 
* **현재 상태**: '이번 주 나의 궤도' 카드 상단에 단순 화살표(이전/다음 주차) 내비게이션과 모달 팝업 형태의 평면적인 '전체 항해 일지 보기' 그리드를 제공하고 있습니다.
* **문제점**: 
  1. **탐색 피로도**: 주차가 쌓일수록 단순 평면 그리드 모달은 복잡도가 올라가며 직관적인 정보 탐색이 어렵습니다.
  2. **데일리 다이제스트와의 통일성 결여**: 최근 리뉴얼되어 찬사를 받은 **Daily Digest의 프리미엄 Bento Chrono-Calendar** 디자인에 비해, PaceNote의 주차 이동 및 일지 탐색 UI는 상대적으로 단조롭고 정적인 모달 형태로 머물러 있어 일관된 브랜드 경험(Premium UX)을 저해합니다.
  3. **주차별 메트릭 인지 부족**: 각 주차별 달성도(완료한 Task 비율)가 모달 내 단순 텍스트(`✓ 3`)로만 표시되어, 사용자가 지난 주차들의 성장 궤적을 거시적으로 느끼기 어렵습니다.

### 💡 개선 방향
PaceNote의 핵심 아이덴티티인 **"항해(Voyage)"**와 **"궤도(Orbit)"** 콘셉트를 물리적 인터랙션으로 구현합니다. 주차별(Weekly) 서비스 특성에 최적화된 **'주차별 캘린더 UI/UX(Bento Weekly Route & Infinite Voyage Horizon)'** 제안을 통해 사용자가 자신의 성장 궤적을 우주를 유영하듯 유려하게 탐색할 수 있도록 리뉴얼합니다.

---

## 2. 핵심 UI/UX 리뉴얼 콘셉트 (3가지 방안)

PaceNote는 일(Day) 단위가 아닌 **주(Week - ISO 8601 기준 `YYYY-Wxx`)** 단위로 운용되므로, 기존 Gregorian 월 달력과는 다른 새로운 차원의 시간 시각화 레이아웃이 필요합니다.

### 🚀 Concept A. "Chrono-Quarterly Bento Matrix" (분기별 13주차 벤트 매트릭스) - (추천)
> **"1년 52주를 분기(Q1~Q4) 단위의 Bento 박스로 구조화하여 성장의 매크로 로드맵을 시각화합니다."**

```
+---------------------------------------------------------------------------------+
|                                 [항해 일지 모아보기]                            |
|  2026년 항해 로드맵 (달성률 84%)                                                 |
|                                                                                 |
|  +-------------------------------------+ +-------------------------------------+  |
|  | Q1 VOYAGE (1~13주차)                | | Q2 VOYAGE (14~26주차)  [ACTIVE ROUTE] |  |
|  | [■■■■■■■■■■■■■] 100%               | | [■■■■■■■■■░░░░] 62%                   |  |
|  |                                     | |                                     |  |
|  | [W01:✓] [W02:✓] [W03:✓] [W04:✓]     | | [W14:✓] [W15:✓] [W16:✓] [W17:✓]     |  |
|  | [W05:✓] [W06:✓] [W07:✓] [W08:✓]     | | [W18:✓] [W19:✓] [W20:✓] [W21:●]     |  |
|  | [W09:✓] [W10:✓] [W11:✓] [W12:✓]     | | [W22:🔒] [W23:🔒] [W24:🔒] [W25:🔒] |  |
|  | [W13:✓]                             | | [W26:🔒]                            |  |
|  +-------------------------------------+ +-------------------------------------+  |
+---------------------------------------------------------------------------------+
```

* **구조 및 레이아웃**:
  * 화면을 4개의 큰 **Bento Box(Q1, Q2, Q3, Q4)** 영역으로 나눕니다.
  * 한 분기는 정확히 **13주**로 이루어지므로, 각 Bento Box 내부에 13개의 글래스모피즘 주차 카드를 조밀하고 정교한 그리드(`4 x 3` 및 마지막 `1` 행)로 조화롭게 배치합니다.
* **디자인 & 상태 비주얼**:
  * **과거 완료 주차 (Past Completed)**: 투명도 높은 화이트 글래스 카드에 은은한 실버/바이올렛 테두리. 달성률(Task 완료비)에 따라 하단에 마이크로 그라데이션 게이지 바 노출.
  * **현재 항해 주차 (Current Active)**: 사이버 사이언(Cyber Cyan, `#22D3EE`) 및 네온 아우라 글로우가 맥동(Pulse)하는 테두리. 카드 내부에 `ACTIVE` 마이크로 배지 및 라이브 이펙트.
  * **미래 대기 주차 (Future Locked)**: 딤드(Dimmed, 투명도 0.15) 처리된 블랙 쉴드 카드 위에 정교한 자물쇠(`🔒`) 아이콘 및 점선 테두리 배치.
* **기대 효과**: 사용자가 1년 전체를 바라보며 분기별 슬라이스 계획과 달성률을 유기적으로 파악할 수 있으며, 데일리 다이제스트의 캘린더와 정합성이 뛰어납니다.

---

### 🌌 Concept B. "Orbit Horizon Scroll" (수평 인피니트 궤도 타임라인)
> **"나만의 궤도를 수평 방향의 흐름으로 배치하여, 마우스 휠이나 스와이프를 통해 무한한 시간의 수평선을 탐색하듯 내비게이션합니다."**

```
   <- PAST WEEK                                                      FUTURE WEEK ->
 +-------------+   +-------------+   +---------------+   +-------------+   +-------------+
 |  20주차      |   |  21주차      |   |  22주차        |   |  23주차      |   |  24주차      |
 |  05/11~05/17|   |  05/18~05/24|   |  05/25~05/31  |   |  06/01~06/07|   |  06/08~06/14|
 |             |   |             |   |  [ACTIVE]     |   |             |   |             |
 |  [✓ 5/5]    |   |  [✓ 4/5]    |   |   ( 80% )     |   |  [ 🔒 ]     |   |  [ 🔒 ]     |
 |  ●●●●●      |   |  ●●●●○      |   |   ●●●●○       |   |             |   |             |
 |  [완료]      |   |  [완료]      |   |   [항해 중]    |   |  [대기]      |   |  [대기]      |
 +-------------+   +-------------+   +---------------+   +-------------+   +-------------+
```

* **구조 및 레이아웃**:
  * 화면 상단 혹은 상세 카드의 바로 위에 배치되는 1단 슬라이드 형식의 **인피니트 가로 스크롤 타임라인**입니다.
  * 마우스 휠을 굴리거나 드래그하면 탄성(Inertia Friction) 있는 부드러운 스크롤 물리 효과가 적용됩니다.
* **디자인 & 상태 비주얼**:
  * 현재 선택된 주차가 **정중앙(Center Anchor)**에 오고 좌우 주차들은 뒤로 갈수록 원근감(Scale & Opacity) 있게 작아지며 입체적 뎁스(3D Space depth)를 부여합니다.
  * 각 카드 내부에는 **'주차명(W22)', '해당 주차 날짜 범위(05.18~05.24)', '마이크로 오비탈 도트(완료한 Task 수만큼 불이 들어오는 구체 도트)'**를 내장하여 글래스모피즘 테마의 정수를 보여줍니다.
* **기대 효과**: 페이지 전환이나 모달 팝업을 열지 않고도 대시보드 내에서 즉각적으로 이전 주차와 다음 주차의 상태를 스캔하고 이동할 수 있는 극단적인 탐색 편의성을 자랑합니다.

---

### ⚓ Concept C. "Constellation Orbit Trail" (마일스톤 성운 트랙커)
> **"목표 달성과 성장을 은하계의 성운과 별자리(Constellation) 트레일 형태로 맵핑하여 탐색 자체를 게이미피케이션(Gamification)합니다."**

```
                  W24 [🔒]
                  /
                 /
          W23 [🔒]
            /
           /
   W22 [● Active] 🌟 (현재 나의 위치)
         \
          \
         W21 [✓] 
           \
            \
            W20 [✓] ----- W19 [✓]
```

* **구조 및 레이아웃**:
  * 캘린더 모달 진입 시 별빛이 부드럽게 흐르는 우주성운(Cosmic Nebula) 이펙트를 바탕화면에 투사합니다.
  * 주차별 달성 성과가 수직/대각선 방향의 **구불구불 연결된 밤하늘의 궤도선(Milestone Trail)**으로 표현되며, 각 주차는 궤도 위의 빛나는 별(Star Nodes)로 매핑됩니다.
* **디자인 & 상태 비주얼**:
  * **완성된 별 (Past Completed)**: 찬란하게 빛나는 프리즘 퍼플/엠버 광원을 발산하며 주차 내 미니 별자리를 이룹니다.
  * **진행중인 별 (Active Star)**: 사이버 사이언 컬러로 격렬히 펄싱(Pulse)하며, 호버 시 그 주에 수립된 핵심 문장(Pace Statement)이 성운의 꼬리 이펙트처럼 말풍선 툴팁으로 로드됩니다.
  * **미래의 어두운 별 (Locked Node)**: 아직 은하선이 연결되지 않아 어둡게 잠겨있는 회색 성체.
* **기대 효과**: 자신의 노력이 시각적인 '별자리 성운'으로 누적되는 모습을 보며 성취감을 만끽하고 감성적인 몰입도를 극대화할 수 있습니다.

---

## 3. 인터랙션 및 상태 관리 흐름 (Mermaid Flow)

PaceNote 캘린더 리뉴얼 시 적용되는 데이터 로딩 및 사용자 액션 흐름도입니다. 
Daily Digest와 마찬가지로 **0-Lag Performance (초기 경량 로드 후 호버 시 디바운스 Lazy fetch)** 사양을 그대로 채택하여 쾌적한 런타임을 구현합니다.

```mermaid
graph TD
    A[사용자 PaceNote 대시보드 진입] --> B[API /api/pacenote 호출]
    B --> C[유저 전체 주차 ID 목록 & 현재 주차 궤도 정보 수집]
    C --> D[대시보드 상단 궤도 내비게이션 바 렌더링]
    
    D --> E{전체 항해 일지 보기 버튼 클릭}
    E -->|Bento Matrix 모달 진입| F[분기별 13주 Bento Grid 팝업 노출]
    
    F --> G{사용자 주차 카드 호버}
    G -->|Debounce 150ms 대기| H[해당 주차 퀵피크 API /api/pacenote/peek?weekId= 호출]
    H --> I[모달 내 미니 정보창에 핵심 성과 및 Task 리스트 렌더링]
    
    F --> J{사용자 주차 카드 클릭}
    J -->|과거/현재 주차 선택| K[대시보드의 selectedWeekId 상태 업데이트 후 즉시 렌더링 전환]
    J -->|미래 주차 선택| L[Locked 안내 토스트 메시지 투사 및 액션 차단]
    
    K --> M[대시보드 주차 데이터 전환 완료 및 모달 닫힘]
```

---

## 4. 컴포넌트 구조 및 마크업 설계 사안

제시된 **Concept A (Bento Matrix)**를 실질적으로 구현하기 위한 React 컴포넌트 마크업 설계입니다.
새로운 파일 [PaceNoteWeeklyCalendar.jsx](file:///d:/prisincera/www/src/components/pacenote/PaceNoteWeeklyCalendar.jsx) 및 [PaceNoteWeeklyCalendar.css](file:///d:/prisincera/www/src/components/pacenote/PaceNoteWeeklyCalendar.css)를 신설하는 사양입니다.

### 📂 [NEW] [PaceNoteWeeklyCalendar.jsx](file:///d:/prisincera/www/src/components/pacenote/PaceNoteWeeklyCalendar.jsx) 마크업 사양

```jsx
import { useState, useMemo } from 'react';
import './PaceNoteWeeklyCalendar.css';

export default function PaceNoteWeeklyCalendar({ 
  allWeekIds = [], 
  currentWeekId, 
  selectedWeekId, 
  pastWeeksData = [], // 과거 Task 완성률 정보 매핑용
  onSelectWeek 
}) {
  const [hoveredWeekInfo, setHoveredWeekInfo] = useState(null);
  
  // 1년의 주차들을 4개 분기(Q1: 1~13, Q2: 14~26, Q3: 27~39, Q4: 40~52)로 그룹핑
  const quarterlyGroups = useMemo(() => {
    const quarters = {
      Q1: { title: "Q1 Voyage (1~13주차)", weeks: [] },
      Q2: { title: "Q2 Voyage (14~26주차)", weeks: [] },
      Q3: { title: "Q3 Voyage (27~39주차)", weeks: [] },
      Q4: { title: "Q4 Voyage (40~52주차)", weeks: [] },
    };

    allWeekIds.forEach(wId => {
      const parts = wId.split('-W');
      if (parts.length !== 2) return;
      const weekNum = parseInt(parts[1], 10);

      if (weekNum >= 1 && weekNum <= 13) quarters.Q1.weeks.push(wId);
      else if (weekNum >= 14 && weekNum <= 26) quarters.Q2.weeks.push(wId);
      else if (weekNum >= 27 && weekNum <= 39) quarters.Q3.weeks.push(wId);
      else if (weekNum >= 40 && weekNum <= 53) quarters.Q4.weeks.push(wId); // 53주차 대응
    });

    return quarters;
  }, [allWeekIds]);

  const handleWeekHover = (wId, e) => {
    const timelineWeek = pastWeeksData.find(p => p.weekId === wId);
    const isCurrent = wId === currentWeekId;
    const isFuture = !isCurrent && !timelineWeek;

    if (isFuture) {
      setHoveredWeekInfo({ wId, isFuture: true });
      return;
    }

    setHoveredWeekInfo({
      wId,
      isCurrent,
      total: timelineWeek ? timelineWeek.tasks.length : 0,
      completed: timelineWeek ? timelineWeek.tasks.filter(t => t.completed).length : 0,
      statement: timelineWeek?.statement || "진행된 기록이 있는 항해 경로입니다."
    });
  };

  return (
    <div className="pacenote-weekly-chrono-container">
      {/* ── 상단 통계 헤더 ── */}
      <div className="chrono-weekly-summary">
        <span className="summary-title">⛵ 전체 항해 진척도</span>
        <div className="summary-bar-wrapper">
          <div className="summary-progress-fill" style={{ width: '74%' }}></div>
          <span className="summary-percent">74% Completed</span>
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

                  // 완료 비 계산
                  const pct = timelineWeek && timelineWeek.tasks.length > 0
                    ? Math.round((timelineWeek.tasks.filter(t => t.completed).length / timelineWeek.tasks.length) * 100)
                    : (isCurrent ? 50 : 0);

                  return (
                    <button
                      key={wId}
                      className={cardClass}
                      onClick={() => !isFuture && onSelectWeek(wId)}
                      onMouseEnter={(e) => handleWeekHover(wId, e)}
                      onMouseLeave={() => setHoveredWeekInfo(null)}
                      disabled={isFuture}
                    >
                      <div className="cell-top">
                        <span className="week-label">{wNum}주</span>
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
                <span className="metric-item">체크리스트: {hoveredWeekInfo.completed} / {hoveredWeekInfo.total} 달성</span>
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

## 5. 미디어 쿼리 및 성능 최적화 전략 (Responsive & Performance)

### 1) 모바일 레이아웃 최적화 (`@media (max-width: 768px)`)
* **데스크톱**: 분기별 2x2 Bento Box 레이아웃으로 넓고 시원하게 정보를 격자 배열합니다.
* **모바일**: 
  * 분기별 Bento Box가 수직 1열 종대로 쾌적하게 스택 정렬됩니다.
  * 내부 13주차 카드의 크기가 터치 타겟 규격(최소 가로세로 44px 이상)에 맞춰 유동적으로 조절되며, 세로 쏠림을 막기 위해 가로 스크롤 캐러셀 뷰포트로의 하이브리드 전환도 검토합니다.

### 2) CLS (Layout Shift) 및 렌더링 성능 보호
* **달력 크기 정규화**: 주간 개수가 윤년 등에 의해 미세하게 변하더라도(예: 52주 vs 53주), Bento Box 내부의 격자 그리드는 항상 일정한 최소 높이(`min-height`)를 가져 레이아웃 시프트를 완전히 방지합니다.
* **CPU/Glow 가속화**: 오비탈 맥동(Pulse) 애니메이션과 성운 글로우 효과가 다량의 주차 노드에 동시 적용되더라도 GPU 가속(`transform: translate3d`, `will-change: transform, opacity`)을 활성화하여 저사양 기기에서도 60fps에 달하는 매끄러운 렌더링 프레임을 지켜냅니다.

---

## 6. 단계별 구축 및 통합 마일스톤

| 단계 | 주요 태스크 | 세부 내용 |
| :--- | :--- | :--- |
| **1단계: API 데이터 설계** | `api/pacenote` 데이터 구조화 | 과거 주차별 총 태스크 개수 및 완료율 메타데이터 필드 추가 패치 |
| **2단계: 신규 컴포넌트 생성** | `PaceNoteWeeklyCalendar` 빌드 | 4개 분기 Bento Matrix 뼈대 마크업 구축 및 Props 바인딩 |
| **3단계: CSS 정밀 스타일링** | 프리미엄 다크모드 무드 주입 | 유리 질감 글래스모피즘, 맥동 네온 글로우 및 완료 게이지 스타일 완성 |
| **4단계: 모달 대체 및 결합** | 대시보드 내비게이션 교체 | 기존 '전체 항해 일지 보기' 텍스트 모달을 신규 주차 캘린더 모달로 대체 연결 |
| **5단계: 모바일 검증 & 배포** | 크로스 브라우저 린트 & 빌드 | 빌드 타임 컴파일 무결성 체크(`npm run build`) 후 Git 통합 배포 |

---
> [!IMPORTANT]
> **디자인 원칙**: 화려하되 절제되어야 하며, 로딩 지연 없는 극단의 퍼포먼스를 고수합니다. 
> 궤도 내비게이션의 물리적 반응 속도는 150ms 디바운스로 통제되어 사용자가 피로감 없이 부드럽게 과거 궤적을 횡단할 수 있어야 합니다.
