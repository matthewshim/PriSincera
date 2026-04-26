import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import DOMPurify from 'dompurify';
import '../../pages/PriSignal.css';

/**
 * PriSignal Issue — Individual newsletter issue detail page.
 * Route: /prisignal/:issueId
 * Fetches issue content from Buttondown API via /api/archive/:id proxy.
 */

/** DOMPurify sanitization config — whitelist safe HTML tags & attributes */
const SANITIZE_CONFIG = {
  ALLOWED_TAGS: [
    'p', 'br', 'strong', 'em', 'a', 'ul', 'ol', 'li',
    'h1', 'h2', 'h3', 'h4', 'blockquote', 'img', 'span', 'div',
    'pre', 'code', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
  ],
  ALLOWED_ATTR: ['href', 'src', 'alt', 'target', 'rel', 'class'],
};

/** Format ISO date → readable Korean date */
function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

export default function PriSignalIssue() {
  const { issueId } = useParams();
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    let cancelled = false;

    async function fetchIssue() {
      try {
        const res = await fetch(`/api/archive/${issueId}`);
        if (!res.ok) throw new Error('Not found');
        const data = await res.json();
        if (!cancelled) setIssue(data);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchIssue();
    return () => { cancelled = true; };
  }, [issueId]);

  // Set document title
  useEffect(() => {
    if (issue?.subject) {
      document.title = `${issue.subject} | PriSignal — PriSincera`;
    } else {
      document.title = 'PriSignal — PriSincera';
    }
    return () => {
      document.title = 'PriSincera — Sincerity, Prioritized.';
    };
  }, [issue]);

  if (loading) {
    return (
      <div className="prisignal-issue-page">
        <div className="prisignal-issue-loading">
          <div className="prisignal-archive-pulse" />
          <p>시그널을 수신 중입니다...</p>
        </div>
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div className="prisignal-issue-page">
        <div className="prisignal-issue-error">
          <div className="prisignal-issue-error-icon">📡</div>
          <h2 className="prisignal-issue-error-title">시그널을 찾을 수 없습니다</h2>
          <p className="prisignal-issue-error-desc">
            요청하신 이슈가 존재하지 않거나 삭제되었습니다.
          </p>
          <Link to="/prisignal" className="prisignal-issue-back-btn" id="issueBackBtn">
            ← PriSignal로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="prisignal-issue-page">
      <article className="prisignal-issue-article">
        {/* Navigation */}
        <nav className="prisignal-issue-nav">
          <Link to="/prisignal" className="prisignal-issue-back" id="issueBackLink">
            ← PriSignal
          </Link>
        </nav>

        {/* Header */}
        <header className="prisignal-issue-header">
          <h1 className="prisignal-issue-title">{issue.subject}</h1>
          <div className="prisignal-issue-meta">
            <time className="prisignal-issue-date">
              {formatDate(issue.publish_date)}
            </time>
          </div>
        </header>

        {/* Content */}
        <div
          className="prisignal-issue-content"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(issue.body || issue.html_body || '', SANITIZE_CONFIG) }}
        />

        {/* Footer */}
        <footer className="prisignal-issue-footer">
          <Link to="/prisignal" className="prisignal-issue-back-btn" id="issueFooterBackBtn">
            ← 전체 시그널 목록
          </Link>
        </footer>
      </article>
    </div>
  );
}
