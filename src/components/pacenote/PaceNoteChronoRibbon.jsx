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

  // 1. 기준 연도 및 론칭 주차 정의
  const baseYear = useMemo(() => {
    if (currentWeekId) {
      const parts = currentWeekId.split('-W');
      if (parts.length === 2) return parseInt(parts[0], 10);
    }
    return new Date().getFullYear();
  }, [currentWeekId]);

  // PaceNote 공식 론칭 주차 설정 (2026-W18)
  const LAUNCH_WEEK_NUM = 18;

  // 2. 데이터 유무와 상관없이 1년 1주차부터 53주차까지의 ID 배열을 항상 강제 생성
  const fullYearWeeks = useMemo(() => {
    const weeks = [];
    for (let i = 1; i <= 53; i++) {
      const wStr = String(i).padStart(2, '0');
      weeks.push(`${baseYear}-W${wStr}`);
    }
    return weeks;
  }, [baseYear]);

  // 3. 현재 선택된 주차가 속한 분기 계산 (초기 앵커링)
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

  // 4. 강제 생성한 53개 주차를 분기별(Q1~Q4)로 그룹핑
  const quarterWeeks = useMemo(() => {
    const quarters = { Q1: [], Q2: [], Q3: [], Q4: [] };
    
    fullYearWeeks.forEach(wId => {
      const parts = wId.split('-W');
      if (parts.length !== 2) return;
      const weekNum = parseInt(parts[1], 10);
      
      if (weekNum >= 1 && weekNum <= 13) quarters.Q1.push(wId);
      else if (weekNum >= 14 && weekNum <= 26) quarters.Q2.push(wId);
      else if (weekNum >= 27 && weekNum <= 39) quarters.Q3.push(wId);
      else quarters.Q4.push(wId);
    });
    
    return quarters;
  }, [fullYearWeeks]);

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
        }} aria-label="이전 주차들">
          ◀
        </button>

        <div className="ribbon-viewport" ref={ribbonRef}>
          {weeksInView.map(wId => {
            const parts = wId.split('-W');
            const wNum = parseInt(parts[1], 10);
            
            const isCurrent = wId === currentWeekId;
            const isSelected = wId === selectedWeekId;
            const timelineWeek = pastWeeksData.find(p => p.weekId === wId);
            
            // 5대 주차 상태 정교한 판별 로직
            let state = 'unrecorded'; // 기본값: 미기록 과거 주차
            
            const currParts = currentWeekId ? currentWeekId.split('-W') : [];
            const currNum = currParts.length === 2 ? parseInt(currParts[1], 10) : 0;
            
            if (wNum < LAUNCH_WEEK_NUM) {
              state = 'unoperated'; // ① 서비스 미적용 (론칭 전)
            } else if (wNum > currNum) {
              state = 'locked';     // ② 오픈 대기 (미래)
            } else if (isCurrent) {
              state = 'current';    // ③ 항해 중 (현재)
            } else if (timelineWeek) {
              state = 'completed';  // ④ 기록 완료 (과거 데이터 있음)
            } else {
              state = 'unrecorded'; // ⑤ 미기록 공백 (과거 데이터 없음)
            }

            const isUnoperated = state === 'unoperated';
            const isLocked = state === 'locked';
            
            // 달성 백분율 계산
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

            const isAllCompleted = pct === 100 && (state === 'completed' || state === 'current');

            // 카드 스타일 매핑
            let cardClass = "ribbon-week-card";
            cardClass += ` ${state}`;
            if (isSelected) cardClass += " selected";
            if (isAllCompleted) cardClass += " all-completed";

            return (
              <button
                key={wId}
                className={cardClass}
                onClick={() => !isUnoperated && !isLocked && onSelectWeek(wId)}
                disabled={isUnoperated || isLocked}
                title={isUnoperated ? '서비스 론칭 전 주차' : isLocked ? '오픈 대기 주차' : `${wNum}주차 궤도`}
              >
                <div className="ribbon-card-top">
                  <div className="ribbon-card-header-left">
                    <span className="ribbon-card-week-label">{wNum}주차</span>
                    {isCurrent && <span className="ribbon-pulse-indicator"></span>}
                  </div>
                  
                  {/* 동적 상태 아이콘 및 트로피 뱃지 노출 */}
                  <div className="ribbon-card-badge-area">
                    {isUnoperated && <span className="ribbon-badge-text">비대상</span>}
                    {isLocked && <span className="ribbon-lock-icon">🔒</span>}
                    {isAllCompleted && <span className="ribbon-trophy-icon">🏆</span>}
                    {!isUnoperated && !isLocked && !isAllCompleted && (
                      <span className="ribbon-pct-text">{pct}%</span>
                    )}
                  </div>
                </div>

                {/* 프로그레스 달성 촉진 바 */}
                {!isUnoperated && !isLocked && (
                  <div className="ribbon-progress-track">
                    <div className="ribbon-progress-fill" style={{ width: `${pct}%` }}></div>
                  </div>
                )}
                
                {/* 론칭 전 / 자물쇠 주차의 하단 딤드 레이블 */}
                {isUnoperated && <div className="ribbon-status-label">미운영</div>}
                {isLocked && <div className="ribbon-status-label">오픈 대기</div>}
                {state === 'unrecorded' && <div className="ribbon-status-label unrec">미기록</div>}
              </button>
            );
          })}
        </div>

        <button className="ribbon-arrow next" onClick={() => {
          if (ribbonRef.current) ribbonRef.current.scrollBy({ left: 150, behavior: 'smooth' });
        }} aria-label="다음 주차들">
          ▶
        </button>
      </div>
    </div>
  );
}
