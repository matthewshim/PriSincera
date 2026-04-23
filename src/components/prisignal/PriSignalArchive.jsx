import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

/**
 * PriSignal Archive — ④ 최근 시그널 섹션
 *
 * [Daily Model v2]
 * 최근 7일의 데일리 시그널 페이지 목록을 표시합니다.
 * 각 날짜별 수집 개수와 카테고리 분포를 미리보기합니다.
 * /api/daily/:date 프록시를 통해 GCS 데일리 JSON을 조회합니다.
 */

const CATEGORY_META = {
  attitude: { icon: '🎯', name: 'Attitude', color: '#F472B6' },
  priority: { icon: '⚡', name: 'Priority', color: '#FBBF24' },
  ai:      { icon: '🤖', name: 'AI',       color: '#34D399' },
  global:  { icon: '🌍', name: 'Global',   color: '#60A5FA' },
  product: { icon: '📦', name: 'Product',  color: '#C084FC' },
};

function getTodayKST() {
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().split('T')[0];
}

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

export default function PriSignalArchive() {
  const [dailyEntries, setDailyEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchRecentDailies() {
      const dates = getRecentDates(7);
      const today = getTodayKST();

      const results = await Promise.allSettled(
        dates.map(async (date) => {
          try {
            const res = await fetch(`/api/daily/${date}`);
            if (!res.ok) return null;
            const data = await res.json();
            return {
              date,
              total: data.total || 0,
              dmPickCount: data.dmPickCount || data.dm_picks?.length || 0,
              status: data.status || 'unknown',
              categories: getCategoryBreakdown(data.articles || []),
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
          .filter(Boolean)
          .filter(e => e.total > 0);
        setDailyEntries(entries);
        setLoading(false);
      }
    }

    fetchRecentDailies();
    return () => { cancelled = true; };
  }, []);

  return (
    <section className="prisignal-section prisignal-archive" id="priSignalArchive">
      <div className="prisignal-section-inner">

        {loading && (
          <div className="prisignal-archive-loading">
            <div className="prisignal-archive-pulse" />
            <p>시그널을 수신 중입니다...</p>
          </div>
        )}

        {!loading && dailyEntries.length === 0 && (
          <div className="prisignal-archive-empty">
            <div className="prisignal-archive-empty-icon">
              <svg viewBox="0 0 80 80" fill="none" className="prisignal-radar-icon">
                <circle cx="40" cy="40" r="36" stroke="url(#radarGrad)" strokeWidth="1" opacity="0.15" />
                <circle cx="40" cy="40" r="26" stroke="url(#radarGrad)" strokeWidth="1" opacity="0.25" />
                <circle cx="40" cy="40" r="16" stroke="url(#radarGrad)" strokeWidth="1" opacity="0.35" />
                <circle cx="40" cy="40" r="4" fill="url(#radarGrad)" opacity="0.8" />
                <circle cx="40" cy="40" r="20" stroke="#22D3EE" strokeWidth="1.5" opacity="0.4" className="radar-pulse-1" />
                <circle cx="40" cy="40" r="30" stroke="#22D3EE" strokeWidth="1" opacity="0.25" className="radar-pulse-2" />
                <defs>
                  <linearGradient id="radarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#C4B5FD" />
                    <stop offset="100%" stopColor="#7C3AED" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <p className="prisignal-archive-empty-title">첫 번째 시그널을 준비하고 있습니다</p>
            <p className="prisignal-archive-empty-desc">
              곧 데일리 시그널이 시작됩니다.<br />
              구독하시면 매일 아침 선별된 시그널을 받아보실 수 있습니다.
            </p>
          </div>
        )}

        {!loading && dailyEntries.length > 0 && (
          <div className="prisignal-archive-grid">
            {dailyEntries.map((entry) => {
              const dp = parseDateParts(entry.date);
              const totalCats = entry.categories.reduce((s, c) => s + c.count, 0);
              return (
                <Link
                  to={`/prisignal/${entry.date}`}
                  className={`prisignal-archive-card${entry.isToday ? ' today' : ''}`}
                  key={entry.date}
                  id={`dailyCard-${entry.date}`}
                >
                  {/* Left: Large date */}
                  <div className="prisignal-archive-card-date-col">
                    <span className="prisignal-archive-card-bigday">{dp.day}</span>
                    <span className="prisignal-archive-card-dayname">{dp.dayName}</span>
                  </div>

                  {/* Right: Content */}
                  <div className="prisignal-archive-card-body">
                    <div className="prisignal-archive-card-header">
                      <div className="prisignal-archive-card-count-row">
                        <span className="prisignal-archive-card-total">
                          {entry.total}<span className="prisignal-archive-card-total-label">시그널</span>
                        </span>
                        {entry.isToday && (
                          <span className="prisignal-archive-today-badge">
                            <span className="prisignal-archive-today-dot" />
                            TODAY
                          </span>
                        )}
                        {entry.dmPickCount > 0 && (
                          <span className="prisignal-archive-dm-count">📬 DM {entry.dmPickCount}</span>
                        )}
                      </div>
                    </div>

                    {/* Category chips with color dots */}
                    {entry.categories.length > 0 && (
                      <div className="prisignal-archive-card-cats">
                        {entry.categories.map((c, i) => {
                          const meta = CATEGORY_META[c.rawKey] || {};
                          return (
                            <span
                              className="prisignal-archive-card-chip"
                              key={i}
                              style={{ '--chip-color': meta.color || '#9CA3AF' }}
                            >
                              <span className="prisignal-archive-chip-dot" />
                              {c.name}
                              <span className="prisignal-archive-chip-num">{c.count}</span>
                            </span>
                          );
                        })}
                      </div>
                    )}

                    <div className="prisignal-archive-card-footer">
                      <span className="prisignal-archive-card-read">
                        보기
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

/** 카테고리별 아티클 수 집계 */
function getCategoryBreakdown(articles) {
  const counts = {};
  for (const a of articles) {
    const cat = a.category || 'etc';
    counts[cat] = (counts[cat] || 0) + 1;
  }
  return Object.entries(counts)
    .map(([cat, count]) => ({
      rawKey: cat,
      icon: CATEGORY_META[cat]?.icon || '📌',
      name: CATEGORY_META[cat]?.name || (cat.charAt(0).toUpperCase() + cat.slice(1)),
      count,
    }))
    .sort((a, b) => b.count - a.count);
}
