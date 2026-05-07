import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function getRecentDates(days = 7) {
  const dates = [];
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  for (let i = 0; i < days; i++) {
    const d = new Date(kst);
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
}

function parseDateParts(dateStr) {
  const [, m, d] = dateStr.split('-').map(Number);
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const dt = new Date(dateStr + 'T00:00:00');
  return { month: m, day: d, dayName: days[dt.getDay()] };
}

export default function PriStudyArchive() {
  const [dailyEntries, setDailyEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchRecentDailies() {
      const dates = getRecentDates(7);
      const today = dates[0];
      const results = await Promise.allSettled(
        dates.map(async (date) => {
          try {
            const res = await fetch(`/api/study/daily/${date}`);
            if (!res.ok) return null;
            const data = await res.json();
            return {
              date,
              sentence_jp: data.sentence_jp,
              business_context: data.business_context,
              isToday: date === today,
            };
          } catch {
            return null;
          }
        })
      );
      if (!cancelled) {
        const entries = results
          .map(r => r.status === 'fulfilled' ? r.value : null)
          .filter(Boolean);
        setDailyEntries(entries);
        setLoading(false);
      }
    }
    fetchRecentDailies();
    return () => { cancelled = true; };
  }, []);

  return (
    <section className="pristudy-archive">
      <div className="pristudy-archive-inner">
        {loading ? (
          <div className="pristudy-archive-loading">기록을 불러오는 중...</div>
        ) : dailyEntries.length === 0 ? (
          <div className="pristudy-archive-empty">아직 학습 기록이 없습니다.</div>
        ) : (
          <div className="pristudy-archive-grid">
            {dailyEntries.map((entry, idx) => {
              const dp = parseDateParts(entry.date);
              return (
                <Link
                  to={`/study/${entry.date}`}
                  className={`pristudy-archive-card${entry.isToday ? ' today' : ''}`}
                  key={entry.date}
                  style={{ '--card-index': idx }}
                >
                  <div className="pristudy-archive-card-accent" />
                  <div className="pristudy-archive-card-body">
                    <div className="pristudy-archive-card-header">
                      <div className="pristudy-archive-card-date-info">
                        <span className="pristudy-archive-card-bigday">{dp.day}</span>
                        <span className="pristudy-archive-card-dayname">{dp.dayName}</span>
                      </div>
                      {entry.isToday && (
                        <span className="pristudy-archive-today-badge">
                          <span className="pristudy-archive-today-dot" />
                          TODAY
                        </span>
                      )}
                    </div>
                    <p className="pristudy-archive-card-headline">{entry.sentence_jp}</p>
                    <p className="pristudy-archive-card-context">{entry.business_context}</p>
                    <div className="pristudy-archive-card-footer">
                      <span className="pristudy-archive-card-read">
                        학습하기
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                          <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
