import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import './PriSignalDaily.css';

/**
 * PriSignal Daily — 데일리 시그널 페이지
 * Route: /prisignal/:date (e.g. /prisignal/2026-04-21)
 * GCS daily JSON을 /api/daily/:date 프록시로 조회
 */

const CATEGORY_META = {
  attitude: { icon: '🎯', name: 'Attitude', color: '#F472B6' },
  priority: { icon: '⚡', name: 'Priority', color: '#FBBF24' },
  ai:      { icon: '🤖', name: 'AI & Future', color: '#34D399' },
  global:  { icon: '🌍', name: 'Global Lens', color: '#60A5FA' },
  product: { icon: '📦', name: 'Product Craft', color: '#C084FC' },
};

const TIER_LABELS = { 1: 'T1', 2: 'T2', 3: 'T3' };

/** 에디터 코멘트 기본 템플릿 문구 패턴 */
const DEFAULT_COMMENT_PATTERNS = [
  '이 기사는',
  '본 기사는',
  '해당 아티클은',
];

function isDefaultComment(comment) {
  if (!comment) return true;
  const trimmed = comment.trim();
  if (trimmed.length < 10) return true;
  return DEFAULT_COMMENT_PATTERNS.some(p => trimmed.startsWith(p) && trimmed.length < 30);
}

function formatKoreanDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const dt = new Date(y, m - 1, d);
  return `${y}년 ${m}월 ${d}일 (${days[dt.getDay()]})`;
}

function formatShortDate(dateStr) {
  const [, m, d] = dateStr.split('-').map(Number);
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const dt = new Date(dateStr + 'T00:00:00');
  return { month: m, day: d, dayName: days[dt.getDay()] };
}

function getAdjacentDate(dateStr, offset) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d + offset);
  const yy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const dd = String(dt.getDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

/** 네비게이션용 날짜 포맷: "04-22(수)" */
function formatNavDate(dateStr) {
  const [, m, d] = dateStr.split('-').map(Number);
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const dt = new Date(dateStr + 'T00:00:00');
  return `${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}(${days[dt.getDay()]})`;
}

function getTodayKST() {
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().split('T')[0];
}

export default function PriSignalDaily() {
  const { date } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [expandedComments, setExpandedComments] = useState(new Set());

  const today = getTodayKST();
  const prevDate = getAdjacentDate(date, -1);
  const nextDate = getAdjacentDate(date, 1);
  const isToday = date === today;
  const isFuture = date > today;
  const dateInfo = formatShortDate(date);

  useEffect(() => {
    window.scrollTo(0, 0);
    setActiveFilter('all');
    setExpandedComments(new Set());
    let cancelled = false;

    async function fetchDaily() {
      setLoading(true);
      setError(false);
      try {
        const res = await fetch(`/api/daily/${date}`);
        if (!res.ok) throw new Error('Not found');
        const json = await res.json();
        if (!cancelled) setData(json);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (!isFuture) {
      fetchDaily();
    } else {
      setLoading(false);
      setError(true);
    }

    return () => { cancelled = true; };
  }, [date, isFuture]);

  useEffect(() => {
    document.title = `${formatKoreanDate(date)}의 시그널 | PriSignal — PriSincera`;
    document.body.classList.add('hero-ready');
    return () => {
      document.title = 'PriSincera — Sincerity, Prioritized.';
      document.body.classList.remove('hero-ready');
    };
  }, [date]);

  // Category counts for filter chips
  const categoryCounts = useMemo(() => {
    if (!data?.articles) return {};
    return data.articles.reduce((acc, a) => {
      const cat = a.category || 'etc';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});
  }, [data]);

  // Group articles by category, filtered
  const groupedArticles = useMemo(() => {
    if (!data?.articles) return {};
    const filtered = activeFilter === 'all'
      ? data.articles
      : data.articles.filter(a => (a.category || 'etc') === activeFilter);
    return filtered.reduce((acc, a) => {
      const cat = a.category || 'etc';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(a);
      return acc;
    }, {});
  }, [data, activeFilter]);

  const filteredCount = useMemo(() => {
    return Object.values(groupedArticles).reduce((sum, arr) => sum + arr.length, 0);
  }, [groupedArticles]);

  const dmPicks = data?.dm_picks || [];
  const totalCount = data?.total || 0;
  const isScored = data?.status === 'scored';

  const toggleComment = (id) => {
    setExpandedComments(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Available filter categories (only those with articles)
  const filterCategories = useMemo(() => {
    return Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([key, count]) => ({
        key,
        count,
        ...(CATEGORY_META[key] || { icon: '📌', name: key, color: '#9CA3AF' }),
      }));
  }, [categoryCounts]);

  return (
    <div className="prisignal-daily-page">
      {/* ── Back Link ── */}
      <Link to="/prisignal" className="prisignal-daily-back" id="dailyBackLink">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        PriSignal
      </Link>

      {/* ── Hero Header with Integrated Nav ── */}
      <header className="prisignal-daily-header">
        <div className="prisignal-daily-date-nav-row">
          <Link to={`/prisignal/${prevDate}`} className="prisignal-daily-date-arrow" id="dailyNavPrev" title={formatNavDate(prevDate)}>
            <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="prisignal-daily-date-arrow-label">{formatNavDate(prevDate)}</span>
          </Link>

          <div className="prisignal-daily-date-center">
            <span className="prisignal-daily-date-day">{dateInfo.day}</span>
            <div className="prisignal-daily-date-info">
              <span className="prisignal-daily-date-month">{dateInfo.month}월</span>
              <span className="prisignal-daily-date-dayname">{dateInfo.dayName}요일</span>
            </div>
          </div>

          {!isFuture && date < today ? (
            <Link to={`/prisignal/${nextDate}`} className="prisignal-daily-date-arrow next" id="dailyNavNext" title={formatNavDate(nextDate)}>
              <span className="prisignal-daily-date-arrow-label">{formatNavDate(nextDate)}</span>
              <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
                <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          ) : (
            <div className="prisignal-daily-date-arrow next disabled" />
          )}
        </div>

        <h1 className="prisignal-daily-title">
          데일리 <span className="accent">시그널</span>
        </h1>
        {!loading && !error && (
          <p className="prisignal-daily-subtitle">
            {totalCount > 0
              ? `${totalCount}개의 시그널을 포착했습니다${dmPicks.length > 0 ? ` · DM 픽 ${dmPicks.length}개` : ''}`
              : '오늘은 시그널이 조용합니다'}
          </p>
        )}
      </header>

      {/* ── Loading ── */}
      {loading && (
        <div className="prisignal-daily-loading">
          <div className="prisignal-archive-pulse" />
          <p>시그널을 수신 중입니다...</p>
        </div>
      )}

      {/* ── Error / Empty ── */}
      {!loading && (error || totalCount === 0) && (
        <div className="prisignal-daily-empty">
          <div className="prisignal-daily-empty-icon">📡</div>
          <h2>{isFuture ? '아직 도착하지 않은 시그널' : '오늘은 시그널이 조용합니다'}</h2>
          <p>{isFuture
            ? '미래의 시그널은 해당 날짜에 확인할 수 있습니다.'
            : '수집된 아티클이 없습니다. 다른 날짜를 확인해보세요.'}</p>
        </div>
      )}

      {/* ── Category Filter Chips ── */}
      {!loading && !error && totalCount > 0 && (
        <div className="prisignal-daily-filters" id="dailyCategoryFilter">
          <button
            className={`prisignal-daily-filter-chip${activeFilter === 'all' ? ' active' : ''}`}
            onClick={() => setActiveFilter('all')}
            id="filterAll"
          >
            전체
            <span className="prisignal-daily-filter-count">{totalCount}</span>
          </button>
          {filterCategories.map(cat => (
            <button
              key={cat.key}
              className={`prisignal-daily-filter-chip${activeFilter === cat.key ? ' active' : ''}`}
              onClick={() => setActiveFilter(cat.key)}
              style={{ '--chip-color': cat.color }}
              id={`filter-${cat.key}`}
            >
              <span className="prisignal-daily-filter-dot" />
              {cat.name}
              <span className="prisignal-daily-filter-count">{cat.count}</span>
            </button>
          ))}
        </div>
      )}

      {/* ── Articles by Category ── */}
      {!loading && !error && totalCount > 0 && (
        <main className="prisignal-daily-content">
          {activeFilter !== 'all' && (
            <p className="prisignal-daily-filter-result">
              {filteredCount}개의 시그널
            </p>
          )}

          {Object.entries(groupedArticles).map(([cat, articles]) => {
            const meta = CATEGORY_META[cat] || { icon: '📌', name: cat, color: '#9CA3AF' };
            return (
              <section className="prisignal-daily-category" key={cat}>
                <h2 className="prisignal-daily-cat-title" style={{ '--cat-color': meta.color }}>
                  <span className="prisignal-daily-cat-icon">{meta.icon}</span>
                  {meta.name}
                  <span className="prisignal-daily-cat-count">{articles.length}</span>
                </h2>

                <div className="prisignal-daily-articles">
                  {articles.map(article => (
                    <article
                      className={`prisignal-daily-card${article.isDmPick ? ' dm-pick' : ''}`}
                      key={article.id}
                      id={`article-${article.id}`}
                    >
                      <div className="prisignal-daily-card-top">
                        {article.isDmPick && (
                          <span className="prisignal-daily-dm-badge">
                            <span className="prisignal-daily-dm-badge-icon">📬</span>
                            DM Pick
                          </span>
                        )}
                        <div className="prisignal-daily-card-meta">
                          <span className="prisignal-daily-card-source">{article.source}</span>
                          <span className={`prisignal-daily-card-tier tier-${article.tier}`}>
                            {TIER_LABELS[article.tier] || 'T3'}
                          </span>
                          {isScored && article.weightedScore && (
                            <span className="prisignal-daily-card-score">
                              ★ {article.weightedScore.toFixed(1)}
                            </span>
                          )}
                        </div>
                      </div>

                      <h3 className="prisignal-daily-card-title">
                        <a href={article.url} target="_blank" rel="noopener noreferrer">
                          {article.title}
                        </a>
                      </h3>

                      {article.summaryKr && (
                        <p className="prisignal-daily-card-summary">{article.summaryKr}</p>
                      )}
                      {!article.summaryKr && article.summary && (
                        <p className="prisignal-daily-card-summary">{article.summary.slice(0, 200)}...</p>
                      )}

                      {article.editorComment && !isDefaultComment(article.editorComment) && (
                        <div className={`prisignal-daily-card-sticker${expandedComments.has(article.id) ? ' expanded' : ''}`}>
                          <button
                            className="prisignal-daily-sticker-toggle"
                            onClick={() => toggleComment(article.id)}
                            id={`sticker-toggle-${article.id}`}
                          >
                            <span className="prisignal-daily-sticker-label">✍️ 에디터 추천</span>
                            <svg className="prisignal-daily-sticker-chevron" width="12" height="12" viewBox="0 0 16 16" fill="none">
                              <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                          <div className="prisignal-daily-sticker-body">
                            <p>{article.editorComment}</p>
                          </div>
                        </div>
                      )}

                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="prisignal-daily-card-link"
                      >
                        원문 읽기
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                          <path d="M5 11L11 5M11 5H6M11 5V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </a>
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
        </main>
      )}

      {/* ── List Link ── */}
      <div className="prisignal-daily-list-link-wrap">
        <Link to="/prisignal" className="prisignal-daily-list-link" id="dailyListLink">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 4h12M2 8h12M2 12h8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          전체 시그널 목록 보기
        </Link>
      </div>

      {/* ── Subscribe CTA ── */}
      <section className="prisignal-daily-cta">
        <div className="prisignal-daily-cta-inner">
          <h2>매일 선별된 <span className="accent">시그널</span>을 받아보세요</h2>
          <p>매일 아침, {totalCount > 0 ? `${totalCount}개 중 선별된 5개` : '엄선된 5개'}의 시그널을 이메일로 전달합니다.</p>
          <Link to="/prisignal" className="prisignal-daily-cta-btn" id="dailyCTABtn">
            구독하기
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M4 8H12M12 8L8 4M12 8L8 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}
