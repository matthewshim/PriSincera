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
export default function SubscribeForm({ variant = 'inline', className = '', showProof = false }) {
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
        // Success (new subscriber or already subscribed)
        setStatus('success');
        setEmail('');
      } else {
        const data = await res.json().catch(() => null);
        setStatus('error');
        if (res.status === 403 || data?.code === 'blocked') {
          setErrorMsg('구독 등록이 차단되었습니다. 관리자에게 문의해주세요.');
        } else if (data?.code === 'invalid_email') {
          setErrorMsg('올바른 이메일 주소를 입력해주세요.');
        } else {
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
        <p className="subscribe-success-sub">매일 아침, 시그널을 전합니다.</p>
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
        ✓ 매일 발송 &nbsp; ✓ 무료 &nbsp; ✓ 언제든 해지
      </p>
      {showProof && (
        <div className="subscribe-social-proof">
          <div className="subscribe-avatars">
            <span className="subscribe-avatar" style={{ background: 'linear-gradient(135deg, #7C3AED, #C084FC)' }}>P</span>
            <span className="subscribe-avatar" style={{ background: 'linear-gradient(135deg, #22D3EE, #818CF8)' }}>S</span>
            <span className="subscribe-avatar" style={{ background: 'linear-gradient(135deg, #F0ABFC, #FDE68A)' }}>M</span>
          </div>
          <span className="subscribe-proof-text">시그널을 구독하는 프로덕트 메이커들과 함께하세요</span>
        </div>
      )}
    </form>
  );
}
