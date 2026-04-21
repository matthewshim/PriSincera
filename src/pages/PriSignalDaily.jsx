import { useState, useEffect } from 'react';
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

function formatKoreanDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const dt = new Date(y, m - 1, d);
  return `${y}년 ${m}월 ${d}일 (${days[dt.getDay()]})`;
}

function getAdjacentDate(dateStr, offset) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d + offset);
  return dt.toISOString().split('T')[0];
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

  const today = getTodayKST();
  const prevDate = getAdjacentDate(date, -1);
  const nextDate = getAdjacentDate(date, 1);
  const isToday = date === today;
  const isFuture = date > today;

  useEffect(() => {
    window.scrollTo(0, 0);
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

  // Group articles by category
  const groupedArticles = data?.articles
    ? data.articles.reduce((acc, a) => {
        const cat = a.category || 'etc';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(a);
        return acc;
      }, {})
    : {};

  const dmPicks = data?.dm_picks || [];
  const totalCount = data?.total || 0;
  const isScored = data?.status === 'scored';

  return (
    <div className="prisignal-daily-page">
      {/* Header */}
      <header className="prisignal-daily-header">
        <Link to="/prisignal" className="prisignal-daily-back" id="dailyBackLink">
          ← PriSignal
        </Link>

        <div className="prisignal-daily-hero">
          <span className="prisignal-daily-icon">📡</span>
          <h1 className="prisignal-daily-title">{formatKoreanDate(date)}의 시그널</h1>
          {!loading && !error && (
            <p className="prisignal-daily-subtitle">
              {totalCount > 0
                ? `오늘 ${totalCount}개의 시그널을 포착했습니다${dmPicks.length > 0 ? ` · DM 픽 ${dmPicks.length}개` : ''}`
                : '오늘은 시그널이 조용합니다'}
            </p>
          )}
        </div>

        {/* Date Navigation */}
        <nav className="prisignal-daily-nav">
          <Link to={`/prisignal/${prevDate}`} className="prisignal-daily-nav-btn" id="dailyNavPrev">
            ← {prevDate.slice(5)}
          </Link>
          {!isToday && (
            <Link to={`/prisignal/${today}`} className="prisignal-daily-nav-today" id="dailyNavToday">
              오늘
            </Link>
          )}
          {!isFuture && date < today && (
            <Link to={`/prisignal/${nextDate}`} className="prisignal-daily-nav-btn" id="dailyNavNext">
              {nextDate.slice(5)} →
            </Link>
          )}
        </nav>
      </header>

      {/* Loading */}
      {loading && (
        <div className="prisignal-daily-loading">
          <div className="prisignal-archive-pulse" />
          <p>시그널을 수신 중입니다...</p>
        </div>
      )}

      {/* Error / Empty */}
      {!loading && (error || totalCount === 0) && (
        <div className="prisignal-daily-empty">
          <div className="prisignal-daily-empty-icon">📡</div>
          <h2>{isFuture ? '아직 도착하지 않은 시그널' : '오늘은 시그널이 조용합니다'}</h2>
          <p>{isFuture
            ? '미래의 시그널은 해당 날짜에 확인할 수 있습니다.'
            : '수집된 아티클이 없습니다. 다른 날짜를 확인해보세요.'}</p>
        </div>
      )}

      {/* Articles by Category */}
      {!loading && !error && totalCount > 0 && (
        <main className="prisignal-daily-content">
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
                      {article.isDmPick && (
                        <span className="prisignal-daily-dm-badge">📬 DM Pick</span>
                      )}

                      <h3 className="prisignal-daily-card-title">
                        <a href={article.url} target="_blank" rel="noopener noreferrer">
                          {article.title}
                        </a>
                      </h3>

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

                      {article.summaryKr && (
                        <p className="prisignal-daily-card-summary">{article.summaryKr}</p>
                      )}
                      {!article.summaryKr && article.summary && (
                        <p className="prisignal-daily-card-summary">{article.summary.slice(0, 200)}...</p>
                      )}

                      {article.editorComment && (
                        <blockquote className="prisignal-daily-card-comment">
                          ✍️ {article.editorComment}
                        </blockquote>
                      )}

                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="prisignal-daily-card-link"
                      >
                        원문 읽기 →
                      </a>
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
        </main>
      )}

      {/* Subscribe CTA */}
      <section className="prisignal-daily-cta">
        <div className="prisignal-daily-cta-inner">
          <h2>매일 선별된 시그널을 받아보세요</h2>
          <p>매일 아침, {totalCount > 0 ? `${totalCount}개 중 선별된 5개` : '엄선된 5개'}의 시그널을 이메일로 전달합니다.</p>
          <Link to="/prisignal" className="prisignal-daily-cta-btn" id="dailyCTABtn">
            구독하기 →
          </Link>
        </div>
      </section>
    </div>
  );
}
