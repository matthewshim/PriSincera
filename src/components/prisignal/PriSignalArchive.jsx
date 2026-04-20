import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

/**
 * PriSignal Archive — ④ Latest Issues section.
 * Fetches recent newsletter issues from Buttondown API via /api/archive proxy.
 * Renders issue cards with glassmorphism design.
 * Shows elegant empty state when no issues are published yet.
 */

/** Map category keyword → icon */
const categoryIcons = {
  attitude: '🎯',
  priority: '⚡',
  'ai': '🤖',
  'future': '🤖',
  global: '🌍',
  product: '📦',
};

/** Extract category hints from issue subject line */
function extractCategories(subject = '') {
  const lower = subject.toLowerCase();
  const found = [];
  Object.entries(categoryIcons).forEach(([key, icon]) => {
    if (lower.includes(key) && !found.some(f => f.icon === icon)) {
      found.push({ icon, name: key.charAt(0).toUpperCase() + key.slice(1) });
    }
  });
  return found;
}

/** Format ISO date → readable Korean date */
function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

export default function PriSignalArchive() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchArchive() {
      try {
        const res = await fetch('/api/archive');
        if (!res.ok) throw new Error('API error');
        const data = await res.json();
        // Buttondown returns { results: [...] } or an array
        const results = Array.isArray(data) ? data : (data.results || []);
        // Filter only published emails, sort by publish_date desc
        const published = results
          .filter(e => e.status === 'sent' || e.publish_date)
          .sort((a, b) => new Date(b.publish_date) - new Date(a.publish_date))
          .slice(0, 5);
        if (!cancelled) setIssues(published);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchArchive();
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

        {!loading && (issues.length === 0 || error) && (
          <div className="prisignal-archive-empty">
            <div className="prisignal-archive-empty-icon">
              <svg viewBox="0 0 80 80" fill="none" className="prisignal-radar-icon">
                {/* Radar dish */}
                <circle cx="40" cy="40" r="36" stroke="url(#radarGrad)" strokeWidth="1" opacity="0.15" />
                <circle cx="40" cy="40" r="26" stroke="url(#radarGrad)" strokeWidth="1" opacity="0.25" />
                <circle cx="40" cy="40" r="16" stroke="url(#radarGrad)" strokeWidth="1" opacity="0.35" />
                <circle cx="40" cy="40" r="4" fill="url(#radarGrad)" opacity="0.8" />
                {/* Pulse rings */}
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
              곧 첫 이슈가 발행됩니다.<br />
              구독하시면 가장 먼저 받아보실 수 있습니다.
            </p>
          </div>
        )}

        {!loading && issues.length > 0 && (
          <>
            <div className="prisignal-archive-grid">
              {issues.map((issue) => {
                const cats = extractCategories(issue.subject);
                return (
                  <Link
                    to={`/prisignal/${issue.id}`}
                    className="prisignal-archive-card"
                    key={issue.id}
                    id={`archiveCard-${issue.id}`}
                  >
                    <div className="prisignal-archive-card-header">
                      <span className="prisignal-archive-card-number">
                        {issue.subject || 'PriSignal'}
                      </span>
                      <span className="prisignal-archive-card-date">
                        {formatDate(issue.publish_date)}
                      </span>
                    </div>
                    {cats.length > 0 && (
                      <div className="prisignal-archive-card-cats">
                        {cats.map((c, i) => (
                          <span className="prisignal-archive-card-cat" key={i}>
                            {c.icon} {c.name}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="prisignal-archive-card-footer">
                      <span className="prisignal-archive-card-read">읽기 →</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
