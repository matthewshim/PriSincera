import { useState, useMemo, useRef, useEffect } from 'react';
import './PaceNoteChronoRibbon.css';

export default function PaceNoteChronoRibbon({
  allWeekIds = [],
  currentWeekId,
  selectedWeekId,
  pastWeeksData = [],
  currentWeekTasks = [],
  onSelectWeek
}) {
  const ribbonRef = useRef(null);
  
  // 1. 현재 선택된 주차가 속한 분기 계산 (초기 앵커링)
  const getQuarterFromWeekId = (wId) => {
    if (!wId) return 'Q2';
    const parts = wId.split('-W');
    if (parts.length !== 2) return 'Q2';
    const wNum = parseInt(parts[1], 10);
    if (wNum >= 1 && wNum <= 13) return 'Q1';
    if (wNum >= 14 && wNum <= 26) return 'Q2';
    if (wNum >= 27 && wNum <= 39) return 'Q3';
    return 'Q4';
  };

  const [activeQuarter, setActiveQuarter] = useState(() => getQuarterFromWeekId(selectedWeekId));

  // selectedWeekId가 부모로부터 변경되면 해당 분기로 자동 탭 포커스 갱신
  useEffect(() => {
    setActiveQuarter(getQuarterFromWeekId(selectedWeekId));
  }, [selectedWeekId]);

  // 2. 분기별 13주차 목록 동적 매핑
  const quarterWeeks = useMemo(() => {
    const quarters = { Q1: [], Q2: [], Q3: [], Q4: [] };
    
    allWeekIds.forEach(wId => {
      const parts = wId.split('-W');
      if (parts.length !== 2) return;
      const weekNum = parseInt(parts[1], 10);
      
      if (weekNum >= 1 && weekNum <= 13) quarters.Q1.push(wId);
      else if (weekNum >= 14 && weekNum <= 26) quarters.Q2.push(wId);
      else if (weekNum >= 27 && weekNum <= 39) quarters.Q3.push(wId);
      else if (weekNum >= 40 && weekNum <= 53) quarters.Q4.push(wId);
    });
    
    return quarters;
  }, [allWeekIds]);

  const weeksInView = quarterWeeks[activeQuarter] || [];

  return (
    <div className="pacenote-chrono-ribbon-container">
      {/* ── 1단: 인라인 분기 세그먼트 벨트 ── */}
      <div className="quarter-segment-belt">
        {['Q1', 'Q2', 'Q3', 'Q4'].map(q => {
          const isCurrentQ = getQuarterFromWeekId(currentWeekId) === q;
          const isActiveQ = activeQuarter === q;
          let btnClass = "quarter-segment-btn";
          if (isActiveQ) btnClass += " active";
          if (isCurrentQ) btnClass += " current-voyage";
          
          return (
            <button
              key={q}
              className={btnClass}
              onClick={() => setActiveQuarter(q)}
            >
              <span className="segment-label">{q} Voyage</span>
              {isCurrentQ && <span className="current-dot"></span>}
            </button>
          );
        })}
      </div>

      {/* ── 2단: 선택 분기 13주 가로 스크롤 타임라인 ── */}
      <div className="chrono-ribbon-timeline">
        <button className="ribbon-arrow prev" onClick={() => {
          if (ribbonRef.current) ribbonRef.current.scrollBy({ left: -150, behavior: 'smooth' });
        }}>
          ◀
        </button>

        <div className="ribbon-viewport" ref={ribbonRef}>
          {weeksInView.map(wId => {
            const parts = wId.split('-W');
            const wNum = parts[1];
            
            const isCurrent = wId === currentWeekId;
            const isSelected = wId === selectedWeekId;
            const timelineWeek = pastWeeksData.find(p => p.weekId === wId);
            const isFuture = !isCurrent && !timelineWeek;

            let cardClass = "ribbon-week-card";
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
                disabled={isFuture}
              >
                <div className="ribbon-card-top">
                  <span className="ribbon-card-week-label">{wNum}주차</span>
                  {isFuture && <span className="ribbon-lock-icon">🔒</span>}
                  {isCurrent && <span className="ribbon-pulse-indicator"></span>}
                </div>

                {!isFuture && (
                  <div className="ribbon-progress-track">
                    <div className="ribbon-progress-fill" style={{ width: `${pct}%` }}></div>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <button className="ribbon-arrow next" onClick={() => {
          if (ribbonRef.current) ribbonRef.current.scrollBy({ left: 150, behavior: 'smooth' });
        }}>
          ▶
        </button>
      </div>
    </div>
  );
}
