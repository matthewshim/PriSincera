import { useState, useEffect } from 'react';
import { useLocation, useParams, useNavigate, Link } from 'react-router-dom';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import './DailyDigest.css';

export default function DailyDigest() {
  const { date } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null); // Detail data or Archive list
  const [token, setToken] = useState(() => localStorage.getItem('pristudy_token'));
  const [progress, setProgress] = useState(null);
  const [isMarking, setIsMarking] = useState(false);
  const synth = window.speechSynthesis;

  const todayStr = new Date(new Date().getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);

  useEffect(() => {
    document.title = 'PriSincera Daily Digest';
    fetchData();
  }, [date, token]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (date) {
        // Fetch specific daily digest
        const res = await fetch(`/api/daily/${date}`);
        if (res.ok) {
          setData(await res.json());
        } else {
          setData(null);
        }
        
        // Fetch progress if authenticated
        if (token) {
          const progRes = await fetch('/api/study/progress', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (progRes.ok) {
            setProgress(await progRes.json());
          }
        }
      } else {
        // Fetch archive list
        const res = await fetch('/api/daily/index');
        if (res.ok) {
          const indexData = await res.json();
          // Fetch summary for top 10 items for the list
          const recentDates = indexData.dates.slice(0, 10);
          const summaries = await Promise.all(
            recentDates.map(async (d) => {
              const dRes = await fetch(`/api/daily/${d}`);
              if (dRes.ok) {
                const digest = await dRes.json();
                return {
                  date: d,
                  signalTitle: digest?.signal?.articles?.[0]?.title || '',
                  studyPrompt: digest?.study?.prompt_snippet ? '🤖 AI 프롬프트' : '',
                  studyJp: digest?.study?.sentence_jp ? '🇯🇵 비즈니스 일본어' : ''
                };
              }
              return { date: d };
            })
          );
          setData(summaries);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const idToken = await user.getIdToken();
      setToken(idToken);
      localStorage.setItem('pristudy_token', idToken);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const markCompleted = async () => {
    if (!token || !data || isMarking) return;
    setIsMarking(true);
    try {
      const res = await fetch(`/api/study/progress/${todayStr}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const prog = await res.json();
        setProgress(prog.progress);
        alert('오늘의 학습이 완료되었습니다! 👏 잔디가 심어졌습니다.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsMarking(false);
    }
  };

  const playAudio = (text) => {
    if (!text) return;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.85;
    synth.speak(utterance);
  };

  const isTodayCompleted = progress?.completed_dates?.includes(date || todayStr);

  if (!date) {
    // Archive View
    return (
      <div className="daily-digest-page">
        <section className="daily-hero">
          <div className="daily-hero-content">
            <h1 className="daily-title">Daily Digest</h1>
            <p className="daily-subtitle">하루 5분, IT 트렌드부터 실무 프롬프트와 어학까지 한 번에.</p>
          </div>
        </section>
        
        <div className="archive-container">
          {loading ? (
            <div style={{ textAlign: 'center', color: '#9CA3AF' }}>목록을 불러오는 중입니다...</div>
          ) : Array.isArray(data) && data.length > 0 ? (
            data.map((item) => (
              <Link to={`/daily/${item.date}`} className="archive-card" key={item.date}>
                <span className="archive-date">{item.date}</span>
                <span className="archive-summary">
                  {item.signalTitle ? `📰 ${item.signalTitle}` : '새로운 업데이트가 없습니다.'}
                  {(item.studyPrompt || item.studyJp) && ` | ${item.studyPrompt} ${item.studyJp}`}
                </span>
                <span className="archive-arrow">→</span>
              </Link>
            ))
          ) : (
            <div style={{ textAlign: 'center', color: '#9CA3AF' }}>아직 발행된 피드가 없습니다.</div>
          )}
        </div>
      </div>
    );
  }

  // Detail View
  return (
    <div className="daily-digest-page">
      <section className="daily-hero" style={{ padding: '40px 20px 20px' }}>
        <Link to="/daily" style={{ color: '#C4B5FD', textDecoration: 'none', fontSize: '0.9rem', marginBottom: '16px', display: 'inline-block' }}>← 목록으로 돌아가기</Link>
        <div className="daily-hero-content">
          <h1 className="daily-title">{date} Digest</h1>
        </div>
      </section>

      <div className="daily-feed-container">
        {loading ? (
          <div style={{ textAlign: 'center', color: '#9CA3AF' }}>데이터를 불러오는 중입니다...</div>
        ) : !data ? (
          <div style={{ textAlign: 'center', color: '#9CA3AF' }}>해당 날짜의 데이터가 없습니다.</div>
        ) : (
          <>
            {/* 1. IT Tech Signal */}
            {data.signal && (
              <div className="daily-section">
                <div className="daily-section-header">
                  <span className="daily-section-icon">📰</span>
                  <h2 className="daily-section-title">IT Tech Signal</h2>
                </div>
                <div className="daily-card">
                  <div className="signal-articles">
                    {data.signal.articles?.map((article, idx) => (
                      <div className="signal-article" key={idx}>
                        <h3>{article.title}</h3>
                        {article.insight && <div className="signal-insight">💡 {article.insight}</div>}
                        <p>{article.summary}</p>
                        {article.url && <a href={article.url} target="_blank" rel="noopener noreferrer" className="signal-link">원문 보기 →</a>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 2. AI Prompt */}
            {data.study?.prompt_snippet && (
              <div className="daily-section">
                <div className="daily-section-header">
                  <span className="daily-section-icon">🤖</span>
                  <h2 className="daily-section-title">AI 프롬프트 1-Pick</h2>
                </div>
                <div className="daily-card">
                  <div className="study-snippet">{data.study.prompt_snippet}</div>
                  {data.study.explanation && <div className="study-kr">{data.study.explanation}</div>}
                  {data.study.business_context && (
                    <div className="signal-insight" style={{ borderColor: '#F59E0B' }}>
                      💡 실무 활용 팁: {data.study.business_context}
                    </div>
                  )}
                  {data.study.parameters && data.study.parameters.length > 0 && (
                    <div style={{ marginTop: '16px' }}>
                      <strong style={{ color: '#F3F4F6', fontSize: '0.9rem' }}>⚙️ 파라미터:</strong>
                      <ul style={{ color: '#9CA3AF', fontSize: '0.9rem', paddingLeft: '20px', margin: '8px 0 0' }}>
                        {data.study.parameters.map((p, i) => (
                          <li key={i}><strong style={{ color: '#FCD34D' }}>[{p.name}]</strong> {p.description}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 3. Business Japanese */}
            {data.study?.sentence_jp && (
              <div className="daily-section">
                <div className="daily-section-header">
                  <span className="daily-section-icon">🇯🇵</span>
                  <h2 className="daily-section-title">비즈니스 일본어 1-Pick</h2>
                  <button onClick={() => playAudio(data.study.sentence_jp)} style={{ marginLeft: 'auto', background: 'none', border: '1px solid rgba(255,255,255,0.2)', color: '#FFF', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer' }}>
                    🔊 발음 듣기
                  </button>
                </div>
                <div className="daily-card">
                  <div className="study-jp">{data.study.sentence_jp}</div>
                  <div className="study-furigana">{data.study.sentence_furigana}</div>
                  {data.study.sentence_pronunciation_kr && <div className="study-kr" style={{ color: '#9CA3AF', fontSize: '0.9rem' }}>[{data.study.sentence_pronunciation_kr}]</div>}
                  <div className="study-kr" style={{ marginTop: '12px' }}>{data.study.sentence_kr}</div>
                  
                  {(!data.study.prompt_snippet && data.study.business_context) && (
                     <div className="signal-insight" style={{ borderColor: '#3B82F6', marginTop: '16px' }}>
                       💡 {data.study.business_context}
                     </div>
                  )}
                </div>
              </div>
            )}

            <div className="streak-btn-container">
              {!token ? (
                <button className="streak-btn" onClick={handleGoogleLogin}>
                  🔒 로그인하고 잔디 심기
                </button>
              ) : (
                <button 
                  className="streak-btn" 
                  onClick={markCompleted} 
                  disabled={isTodayCompleted || isMarking}
                >
                  {isTodayCompleted ? '🎉 오늘의 학습 완료 (잔디 심기 완료)' : '✅ 데일리 다이제스트 완료하기'}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
