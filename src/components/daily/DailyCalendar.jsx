import { useState } from 'react';
import './DailyCalendar.css';

export default function DailyCalendar({ publishedDates = [], onSelectDate, onHoverDate }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  // KST Standard Today String (YYYY-MM-DD)
  const todayKST = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const todayStr = todayKST.toISOString().slice(0, 10);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-11

  // Navigate to previous month
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  // Navigate to next month (block navigating to the future)
  const handleNextMonth = () => {
    const nextMonthDate = new Date(year, month + 1, 1);
    const limitDate = new Date(todayKST.getFullYear(), todayKST.getMonth(), 1);
    if (nextMonthDate <= limitDate) {
      setCurrentDate(nextMonthDate);
    }
  };

  // Check if next month is in the future to disable the navigation button
  const isNextDisabled = () => {
    const nextMonthDate = new Date(year, month + 1, 1);
    const limitDate = new Date(todayKST.getFullYear(), todayKST.getMonth(), 1);
    return nextMonthDate > limitDate;
  };

  // Generate calendar grid cells (Always 42 cells to prevent layout shift)
  const getGridCells = () => {
    const cells = [];
    const firstDayIndex = new Date(year, month, 1).getDay(); // Day of week for 1st day (0-6)
    const totalDays = new Date(year, month + 1, 0).getDate(); // Total days in current month

    // 1. Previous month's padding days
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const prevDay = prevMonthDays - i;
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      const dateString = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(prevDay).padStart(2, '0')}`;
      cells.push({
        day: prevDay,
        isCurrentMonth: false,
        dateString,
      });
    }

    // 2. Current month's days
    for (let day = 1; day <= totalDays; day++) {
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      cells.push({
        day,
        isCurrentMonth: true,
        dateString,
      });
    }

    // 3. Next month's padding days (fill up to 42 cells to prevent layout shifting)
    const remainingCells = 42 - cells.length;
    for (let day = 1; day <= remainingCells; day++) {
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      const dateString = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      cells.push({
        day,
        isCurrentMonth: false,
        dateString,
      });
    }

    return cells;
  };

  const gridCells = getGridCells();

  return (
    <div className="chrono-calendar-wrapper">
      <div className="calendar-header">
        <button onClick={handlePrevMonth} className="calendar-nav-btn" aria-label="이전 달">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h3 className="calendar-month-title">
          <span className="calendar-year">{year}년</span>
          <span className="calendar-month">{String(month + 1).padStart(2, '0')}월</span>
        </h3>
        <button 
          onClick={handleNextMonth} 
          disabled={isNextDisabled()} 
          className={`calendar-nav-btn ${isNextDisabled() ? 'disabled' : ''}`}
          aria-label="다음 달"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      <div className="calendar-grid">
        {/* Day of Week Headers */}
        {['일', '월', '화', '수', '목', '금', '토'].map((weekday, idx) => (
          <div key={weekday} className={`grid-weekday ${idx === 0 ? 'sun' : idx === 6 ? 'sat' : ''}`}>
            {weekday}
          </div>
        ))}

        {/* Date Grid Cells */}
        {gridCells.map((cell, idx) => {
          const dateStr = cell.dateString;
          const isActive = publishedDates.includes(dateStr);
          const isToday = dateStr === todayStr;
          
          return (
            <button
              key={idx}
              disabled={!isActive}
              onMouseEnter={() => isActive && onHoverDate(dateStr)}
              onClick={() => isActive && onSelectDate(dateStr)}
              className={`calendar-day-cell ${cell.isCurrentMonth ? 'current-month' : 'other-month'} ${isActive ? 'active' : ''} ${isToday ? 'today' : ''}`}
              title={isActive ? `${dateStr} 다이제스트 요약 보기` : dateStr}
            >
              <div className="day-number-container">
                <span className="day-number">{cell.day}</span>
                {isToday && <span className="today-badge">TODAY</span>}
              </div>
              
              {isActive && (
                <div className="hotspot-wrapper">
                  <span className="hotspot-dot" />
                  <span className="hotspot-glow" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
