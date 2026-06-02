import { useState } from 'react';
import { useTranslation } from '../../contexts/LanguageContext';
import './DailyCalendar.css';

export default function DailyCalendar({ publishedDates = [], onSelectDate, onHoverDate }) {
  const { locale } = useTranslation();
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

  const getEnglishMonthName = (monthIndex) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthIndex];
  };

  const getWeekdays = () => {
    if (locale === 'en') {
      return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    } else if (locale === 'ja') {
      return ['日', '月', '火', '水', '木', '金', '土'];
    } else {
      return ['일', '월', '화', '수', '목', '금', '토'];
    }
  };

  const gridCells = getGridCells();

  return (
    <div className="chrono-calendar-wrapper">
      <div className="chrono-calendar-header">
        <button 
          onClick={handlePrevMonth} 
          className="chrono-calendar-nav-btn haptic-trigger" 
          aria-label={locale === 'ja' ? '前月' : locale === 'en' ? 'Previous month' : '이전 달'}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h3 className="chrono-calendar-month-title">
          {locale === 'en' ? (
            <>
              <span className="chrono-calendar-month">{getEnglishMonthName(month)}</span>
              <span className="chrono-calendar-year">{year}</span>
            </>
          ) : locale === 'ja' ? (
            <>
              <span className="chrono-calendar-year">{year}년</span>
              <span className="chrono-calendar-month">{String(month + 1).padStart(2, '0')}月</span>
            </>
          ) : (
            <>
              <span className="chrono-calendar-year">{year}년</span>
              <span className="chrono-calendar-month">{String(month + 1).padStart(2, '0')}월</span>
            </>
          )}
        </h3>
        <button 
          onClick={handleNextMonth} 
          disabled={isNextDisabled()} 
          className={`chrono-calendar-nav-btn haptic-trigger ${isNextDisabled() ? 'disabled' : ''}`}
          aria-label={locale === 'ja' ? '翌月' : locale === 'en' ? 'Next month' : '다음 달'}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      <div className="chrono-calendar-grid">
        {/* Day of Week Headers */}
        {getWeekdays().map((weekday, idx) => (
          <div key={idx} className={`grid-weekday ${idx === 0 ? 'sun' : idx === 6 ? 'sat' : ''}`}>
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
              className={`chrono-calendar-day-cell ${cell.isCurrentMonth ? 'current-month' : 'other-month'} ${isActive ? 'active haptic-trigger' : ''} ${isToday ? 'today' : ''}`}
              title={isActive ? (locale === 'ja' ? `${dateStr} ダイジェスト要約を表示` : locale === 'en' ? `View digest summary for ${dateStr}` : `${dateStr} 다이제스트 요약 보기`) : dateStr}
              data-hover-text={isActive ? "VIEW" : undefined}
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
