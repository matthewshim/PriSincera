import { useState, useEffect, useRef } from 'react';
import './PriStudy.css';

const FIREBASE_API_KEY = import.meta.env.VITE_FIREBASE_API_KEY || '';

// --- Auth Modal Component ---
function AuthModal({ onSuccess }) {
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

// --- Main Page Component ---
export default function PriStudy() {
  const [token, setToken] = useState(() => localStorage.getItem('pristudy_token'));
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem('pristudy_email'));
  const [showAuth, setShowAuth] = useState(false);
  
  const [dailyContent, setDailyContent] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isMarking, setIsMarking] = useState(false);

  const todayStr = new Date(new Date().getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const synth = window.speechSynthesis;

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Daily Content (Public)
      const contentRes = await fetch(`/api/study/daily/${todayStr}`);
      if (contentRes.ok) {
        setDailyContent(await contentRes.json());
      }
      
      // 2. Fetch Progress (Protected)
      if (token) {
        const progRes = await fetch('/api/study/progress', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (progRes.ok) {
          setProgress(await progRes.json());
        } else if (progRes.status === 401) {
          handleLogout();
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'PriStudy — 1일 1문장 비즈니스 일본어';
    if (!token) setShowAuth(true);
    fetchData();
  }, [token]);

  const handleLoginSuccess = (idToken, email) => {
    setToken(idToken);
    setUserEmail(email);
    localStorage.setItem('pristudy_token', idToken);
    localStorage.setItem('pristudy_email', email);
    setShowAuth(false);
  };

  const handleLogout = () => {
    setToken(null);
    setUserEmail(null);
    localStorage.removeItem('pristudy_token');
    localStorage.removeItem('pristudy_email');
    setShowAuth(true);
  };

  const playAudio = (e) => {
    e.stopPropagation(); // 카드 뒤집힘 방지
    if (!dailyContent?.sentence_jp) return;
    
    // 이전 음성 취소
    synth.cancel();
    
    const utterance = new SpeechSynthesisUtterance(dailyContent.sentence_jp);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.85; // 조금 천천히 명확하게
    
    // 일본어 보이스 찾기 (가능한 경우)
    const voices = synth.getVoices();
    const jpVoice = voices.find(v => v.lang.includes('ja') || v.lang.includes('JP'));
    if (jpVoice) utterance.voice = jpVoice;

    synth.speak(utterance);
  };

  const markCompleted = async () => {
    if (!token || !dailyContent || isMarking) return;
    setIsMarking(true);
    try {
      const res = await fetch(`/api/study/progress/${todayStr}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProgress(data.progress);
        alert('오늘의 학습이 완료되었습니다! 👏 잔디가 심어졌습니다.');
      }
    } catch (err) {
      alert('완료 처리 중 오류가 발생했습니다.');
    } finally {
      setIsMarking(false);
    }
  };

  const isTodayCompleted = progress?.completed_dates?.includes(todayStr);

  // 최근 7일 캘린더용
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dt = new Date(d.getTime() + 9 * 60 * 60 * 1000);
    return dt.toISOString().slice(0, 10);
  });

  return (
    <div className="pristudy-page">
      
      <header className="pristudy-header">
        <h1>PriStudy 🇯🇵</h1>
        <p>하루 5분, 실무에서 바로 쓰는 비즈니스 일본어 1문장</p>
        {userEmail && (
          <div style={{ marginTop: 16, fontSize: 13, color: 'var(--text-muted)' }}>
            접속 중: {userEmail} <button onClick={handleLogout} style={{ background:'none', border:'none', color:'#EF4444', cursor:'pointer', marginLeft: 8 }}>로그아웃</button>
          </div>
        )}
      </header>

      {showAuth ? (
        <AuthModal onSuccess={handleLoginSuccess} />
      ) : loading ? (
        <div className="pristudy-empty">데이터를 불러오는 중입니다...</div>
      ) : dailyContent ? (
        <>
          <div className="pristudy-card-container">
            <div className={`pristudy-card ${isFlipped ? 'flipped' : ''}`} onClick={() => setIsFlipped(!isFlipped)}>
              {/* 앞면: 일본어 */}
              <div className="pristudy-card-face">
                <span className="pristudy-tag">오늘의 1-Pick</span>
                <div className="pristudy-jp">{dailyContent.sentence_jp}</div>
                <div className="pristudy-furigana">{dailyContent.sentence_furigana}</div>
                
                <button className="pristudy-audio-btn" onClick={playAudio} title="발음 듣기">
                  🔊
                </button>
                <div className="pristudy-flip-hint">화면을 탭하여 뜻과 해설 보기</div>
              </div>

              {/* 뒷면: 해석 및 해설 */}
              <div className="pristudy-card-face pristudy-card-back">
                <span className="pristudy-tag">해석 및 코멘트</span>
                <div className="pristudy-kr">{dailyContent.sentence_kr}</div>
                
                {dailyContent.vocabulary && dailyContent.vocabulary.length > 0 && (
                  <div className="pristudy-vocab">
                    {dailyContent.vocabulary.map((v, i) => (
                      <div key={i} className="pristudy-vocab-item">
                        <span className="pristudy-vocab-word">{v.word}</span>
                        <span>({v.reading})</span>
                        <span style={{ color: 'var(--text-secondary)' }}>- {v.meaning}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                {dailyContent.business_context && (
                  <div className="pristudy-comment">
                    {dailyContent.business_context}
                  </div>
                )}
                <div className="pristudy-flip-hint" style={{ marginTop: 'auto' }}>다시 탭하여 원문 보기</div>
              </div>
            </div>
          </div>

          <button 
            className="pristudy-done-btn" 
            onClick={markCompleted} 
            disabled={isTodayCompleted || isMarking}
          >
            {isTodayCompleted ? '🎉 오늘의 학습 완료' : '✅ 다 외웠어요 (잔디 심기)'}
          </button>

          {/* 잔디 심기 컴포넌트 */}
          <section className="pristudy-streak-section">
            <div className="pristudy-streak-header">
              <h2>나의 학습 기록</h2>
              <div className="pristudy-streak-stats">
                <span>현재 연속: <strong>{progress?.current_streak || 0}일</strong></span>
                <span>최장 연속: <strong>{progress?.longest_streak || 0}일</strong></span>
              </div>
            </div>
            
            <div className="pristudy-graph">
              {last7Days.map(date => {
                const isDone = progress?.completed_dates?.includes(date);
                const isToday = date === todayStr;
                const dateLabel = date.split('-')[2]; // 일만 표시
                return (
                  <div 
                    key={date} 
                    className={`pristudy-graph-day ${isDone ? 'completed' : ''} ${isToday ? 'today' : ''}`}
                    title={`${date} ${isDone ? '(완료)' : '(미완료)'}`}
                  >
                    {dateLabel}
                  </div>
                );
              })}
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 16, textAlign: 'right' }}>
              * 최근 7일간의 기록입니다.
            </p>
          </section>
        </>
      ) : (
        <div className="pristudy-empty">
          <div style={{ fontSize: 40, marginBottom: 16 }}>📚</div>
          <h2>아직 오늘의 학습 데이터가 준비되지 않았습니다.</h2>
          <p>AI가 매일 새벽 새로운 문장을 생성합니다.</p>
        </div>
      )}
    </div>
  );
}
