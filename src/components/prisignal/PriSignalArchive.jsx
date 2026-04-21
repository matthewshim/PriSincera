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

const CATEGORY_ICONS = {
  attitude: '🎯',
  priority: '⚡',
  ai: '🤖',
  global: '🌍',
  product: '📦',
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

function formatShortDate(dateStr) {
  const [, m, d] = dateStr.split('-').map(Number);
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const dt = new Date(dateStr + 'T00:00:00');
  return `${m}/${d}(${days[dt.getDay()]})`;
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
        <h2 className="prisignal-archive-title">최근 시그널</h2>

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
            {dailyEntries.map((entry) => (
              <Link
                to={`/prisignal/${entry.date}`}
                className={`prisignal-archive-card${entry.isToday ? ' today' : ''}`}
                key={entry.date}
                id={`dailyCard-${entry.date}`}
              >
                <div className="prisignal-archive-card-header">
                  <span className="prisignal-archive-card-number">
                    📡 {formatShortDate(entry.date)}
                    {entry.isToday && <span className="prisignal-archive-today-badge">TODAY</span>}
                  </span>
                  <span className="prisignal-archive-card-date">
                    {entry.total}개 시그널
                  </span>
                </div>

                {entry.categories.length > 0 && (
                  <div className="prisignal-archive-card-cats">
                    {entry.categories.map((c, i) => (
                      <span className="prisignal-archive-card-cat" key={i}>
                        {c.icon} {c.name} ×{c.count}
                      </span>
                    ))}
                  </div>
                )}

                <div className="prisignal-archive-card-footer">
                  {entry.dmPickCount > 0 && (
                    <span className="prisignal-archive-dm-count">📬 DM {entry.dmPickCount}</span>
                  )}
                  <span className="prisignal-archive-card-read">보기 →</span>
                </div>
              </Link>
            ))}
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
      icon: CATEGORY_ICONS[cat] || '📌',
      name: cat.charAt(0).toUpperCase() + cat.slice(1),
      count,
    }))
    .sort((a, b) => b.count - a.count);
}
