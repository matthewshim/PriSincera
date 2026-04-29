import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * FloatingCTA — Sticky bottom subscription bar.
 * Appears when the hero subscribe form scrolls out of view.
 * Dismissed state persists for the session via sessionStorage.
 */
export default function FloatingCTA() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem('prisignal-cta-dismissed') === '1'
  );
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const dismissTimerRef = useRef(null);

  // Watch hero subscribe form visibility
  useEffect(() => {
    if (dismissed) return;

    const heroForm = document.getElementById('subscribeEmail');
    if (!heroForm) { setVisible(true); return; }

    const heroSection = heroForm.closest('.prisignal-hero') || heroForm.parentElement;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(heroSection);
    return () => observer.disconnect();
  }, [dismissed]);

  // Cleanup dismiss timer on unmount
  useEffect(() => {
    return () => { if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current); };
  }, []);

  const handleDismiss = useCallback(() => {
    setDismissed(true);
    sessionStorage.setItem('prisignal-cta-dismissed', '1');
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!email || status === 'loading') return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return;

    setStatus('loading');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email_address: email, type: 'regular' }),
      });
      if (res.ok || res.status === 201 || res.status === 400) {
        setStatus('success');
        setEmail('');
        dismissTimerRef.current = setTimeout(handleDismiss, 2500);
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  }, [email, status, handleDismiss]);

  if (dismissed) return null;

  return (
    <div
      className={`floating-cta${visible ? ' floating-cta--visible' : ''}`}
      role="complementary"
      aria-label="구독 안내"
    >
      <div className="floating-cta-inner">
        {status === 'success' ? (
          <div className="floating-cta-success">
            <span className="floating-cta-success-icon">✓</span>
            <span>구독이 완료되었습니다!</span>
          </div>
        ) : (
          <>
            <div className="floating-cta-label">
              <span className="floating-cta-icon">📡</span>
              <span className="floating-cta-text">매일 시그널을 받아보세요</span>
            </div>

            <form className="floating-cta-form" onSubmit={handleSubmit}>
              <input
                type="email"
                className="floating-cta-input"
                placeholder="이메일 입력"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === 'loading'}
                aria-label="이메일 주소"
                id="floatingCTAEmail"
              />
              <button
                type="submit"
                className="floating-cta-btn"
                disabled={status === 'loading' || !email}
                id="floatingCTASubmit"
              >
                {status === 'loading' ? (
                  <span className="subscribe-spinner" />
                ) : (
                  <>
                    구독하기
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <path d="M4 8H12M12 8L8 4M12 8L8 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </>
                )}
              </button>
            </form>

            {/* Mobile: button only */}
            <button
              className="floating-cta-mobile-btn"
              onClick={() => {
                const hero = document.getElementById('subscribeEmail');
                if (hero) hero.scrollIntoView({ behavior: 'smooth', block: 'center' });
                else window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              id="floatingCTAMobile"
            >
              구독하기
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M4 8H12M12 8L8 4M12 8L8 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </>
        )}

        <button
          className="floating-cta-close"
          onClick={handleDismiss}
          aria-label="닫기"
          id="floatingCTAClose"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
