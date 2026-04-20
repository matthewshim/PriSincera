import { useState, useCallback } from 'react';

/**
 * SubscribeForm — Reusable PriSignal subscription form.
 * Posts email to /api/subscribe (Nginx proxy → Buttondown API).
 * Used in Work section banner and PriSignal landing page.
 *
 * Props:
 *   variant: 'inline' | 'stacked' (default: 'inline')
 *   className: additional CSS class
 */
export default function SubscribeForm({ variant = 'inline', className = '' }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!email || status === 'loading') return;

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setStatus('error');
      setErrorMsg('올바른 이메일 주소를 입력해주세요.');
      return;
    }

    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email_address: email, type: 'regular' }),
      });

      if (res.ok || res.status === 201) {
        setStatus('success');
        setEmail('');
      } else {
        const data = await res.json().catch(() => null);
        // Buttondown returns 400 if already subscribed
        if (res.status === 400 || data?.detail?.includes?.('already')) {
          setStatus('success'); // Treat already-subscribed as success
        } else {
          setStatus('error');
          setErrorMsg('구독 등록에 실패했습니다. 잠시 후 다시 시도해주세요.');
        }
      }
    } catch {
      setStatus('error');
      setErrorMsg('네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }
  }, [email, status]);

  if (status === 'success') {
    return (
      <div className={`subscribe-form subscribe-success ${className}`}>
        <div className="subscribe-success-icon">✓</div>
        <p className="subscribe-success-text">구독이 완료되었습니다!</p>
        <p className="subscribe-success-sub">매주 월요일, 시그널을 전합니다.</p>
      </div>
    );
  }

  return (
    <form
      className={`subscribe-form ${variant} ${className}`}
      onSubmit={handleSubmit}
      noValidate
    >
      <div className="subscribe-input-wrap">
        <input
          type="email"
          className="subscribe-input"
          placeholder="이메일을 입력하세요"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status === 'error') setStatus('idle');
          }}
          disabled={status === 'loading'}
          aria-label="이메일 주소"
          id="subscribeEmail"
        />
        <button
          type="submit"
          className="subscribe-btn"
          disabled={status === 'loading' || !email}
          id="subscribeSubmit"
        >
          {status === 'loading' ? (
            <span className="subscribe-spinner" />
          ) : (
            '구독하기'
          )}
        </button>
      </div>
      {status === 'error' && (
        <p className="subscribe-error">{errorMsg}</p>
      )}
      <p className="subscribe-meta">
        ✓ 매주 월요일 발송 &nbsp; ✓ 무료 &nbsp; ✓ 언제든 해지
      </p>
    </form>
  );
}
