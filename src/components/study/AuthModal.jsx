import React, { useState } from 'react';

const FIREBASE_API_KEY = import.meta.env.VITE_FIREBASE_API_KEY || '';

export default function AuthModal({ onSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const endpoint = isLogin ? 'signInWithPassword' : 'signUp';
    try {
      const res = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:${endpoint}?key=${FIREBASE_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, returnSecureToken: true }),
        }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || 'Authentication failed');
      }
      const data = await res.json();
      onSuccess(data.idToken, data.email);
    } catch (err) {
      let msg = err.message;
      if (msg === 'INVALID_LOGIN_CREDENTIALS') msg = '이메일 또는 비밀번호가 올바르지 않습니다.';
      if (msg === 'EMAIL_EXISTS') msg = '이미 가입된 이메일입니다.';
      if (msg === 'WEAK_PASSWORD : Password should be at least 6 characters') msg = '비밀번호는 6자리 이상이어야 합니다.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pristudy-auth-modal">
      <div className="pristudy-auth-card">
        <h2>{isLogin ? '로그인' : '회원가입'}</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: 14 }}>
          학습 진행률(잔디)을 기록하기 위해 로그인이 필요합니다.
        </p>
        <form onSubmit={handleSubmit}>
          <input type="email" placeholder="이메일" required value={email} onChange={e => setEmail(e.target.value)} />
          <input type="password" placeholder="비밀번호" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} />
          {error && <div style={{ color: '#EF4444', fontSize: 13, marginBottom: 12 }}>{error}</div>}
          <button type="submit" className="pristudy-auth-btn" disabled={loading}>
            {loading ? '처리 중...' : (isLogin ? '학습 시작하기' : '가입하고 시작하기')}
          </button>
        </form>
        <button type="button" className="pristudy-auth-toggle" onClick={() => { setIsLogin(!isLogin); setError(''); }}>
          {isLogin ? '계정이 없으신가요? 회원가입' : '이미 계정이 있으신가요? 로그인'}
        </button>
      </div>
    </div>
  );
}
