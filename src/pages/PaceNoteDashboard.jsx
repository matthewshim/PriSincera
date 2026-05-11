import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import './PaceNoteDashboard.css';

export default function PaceNoteDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [userToken, setUserToken] = useState(null);

  useEffect(() => {
    document.title = 'PriSincera Pace Note';
    document.body.classList.add('hero-ready');
    return () => document.body.classList.remove('hero-ready');
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const token = await user.getIdToken();
        setUserToken(token);
        fetchPaceData(token);
      } else {
        // Not logged in -> can't see personalized pace note
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchPaceData = async (token) => {
    try {
      const res = await fetch('/api/pacenote', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const result = await res.json();
        setData(result);
      } else {
        console.error('Failed to fetch pace note');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleComplete = async (taskId) => {
    // Optimistic UI update
    setData(prev => {
      const currentPace = prev.current.currentPace.map(p => 
        p.id === taskId ? { ...p, completed: !p.completed } : p
      );
      return { ...prev, current: { ...prev.current, currentPace } };
    });

    try {
      await fetch('/api/pacenote/toggle', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}` 
        },
        body: JSON.stringify({ taskId })
      });
    } catch (err) {
      console.error(err);
      // Revert on error
      fetchPaceData(userToken);
    }
  };

  const acceptRecommend = async (taskId) => {
    // Optimistic UI update
    setData(prev => {
      const recIndex = prev.current.recommendedPace.findIndex(t => t.id === taskId);
      if (recIndex === -1) return prev;
      
      const taskToMove = prev.current.recommendedPace[recIndex];
      const newRec = [...prev.current.recommendedPace];
      newRec.splice(recIndex, 1);
      
      const newCur = [...prev.current.currentPace, { ...taskToMove, completed: false }];
      
      return { ...prev, current: { ...prev.current, currentPace: newCur, recommendedPace: newRec } };
    });

    try {
      await fetch('/api/pacenote/accept', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}` 
        },
        body: JSON.stringify({ taskId })
      });
    } catch (err) {
      console.error(err);
      fetchPaceData(userToken);
    }
  };

  const handleLoginClick = () => {
    navigate('/daily'); // User can login from daily digest page for now
  };

  return (
    <div className="pacenote-page">
      {/* ── Hero Section ── */}
      <section className="pacenote-hero">
        <div className="pacenote-hero-content">
          <div className="pacenote-hero-icon">⛵</div>
          <h1 className="pacenote-title">Pace Note</h1>
          <p className="pacenote-subtitle">남들의 속도에 휩쓸리지 않고, 나만의 호흡과 방향을 잃지 않기 위해 기록합니다.</p>
        </div>
      </section>

      {/* ── Main Content (Bento Layout) ── */}
      <div className="pacenote-container">
        {loading ? (
          <div className="pacenote-loading">
            <div className="pacenote-spinner" />
            <p>나의 항해 일지를 불러오는 중입니다...</p>
          </div>
        ) : !userToken ? (
          <div className="pacenote-loading" style={{ padding: '120px 0' }}>
            <h2 style={{ color: '#E9D5FF', marginBottom: '16px' }}>구글 로그인이 필요합니다</h2>
            <p style={{ color: '#9CA3AF', marginBottom: '24px' }}>초개인화된 나만의 Pace Note를 작성하기 위해 로그인해주세요.</p>
            <button className="pacenote-btn-accept" style={{ width: 'auto', padding: '12px 24px' }} onClick={handleLoginClick}>
              로그인 하러 가기
            </button>
          </div>
        ) : data?.current ? (
          <div className="pacenote-bento-grid">
            
            {/* 1. Pace Tracker (진행 중인 미션) */}
            <div className="pacenote-bento-card tracker-card">
              <div className="pacenote-card-header">
                <h2>이번 주 나의 궤도</h2>
                <span className="pacenote-date-badge">{data.current.weekId}</span>
              </div>
              <p className="pacenote-card-desc">조급해하지 않고 이번 주에 집중할 작은 행동들입니다.</p>
              
              <div className="pacenote-tasks">
                {data.current.currentPace && data.current.currentPace.length > 0 ? (
                  data.current.currentPace.map((task) => (
                    <label key={task.id} className={`pacenote-task-item ${task.completed ? 'completed' : ''}`}>
                      <input 
                        type="checkbox" 
                        checked={task.completed} 
                        onChange={() => toggleComplete(task.id)} 
                      />
                      <span className="task-custom-checkbox"></span>
                      <span className="task-text">{task.title}</span>
                    </label>
                  ))
                ) : (
                  <div style={{ color: '#9CA3AF', fontStyle: 'italic', padding: '20px' }}>이번 주 궤도가 비어있습니다. 우측에서 추천 가이드를 추가해보세요.</div>
                )}
                
                {/* 100% 완료 시 애니메이션 파티클이나 축하 메시지 공간 */}
                {data.current.currentPace && data.current.currentPace.length > 0 && data.current.currentPace.every(t => t.completed) && (
                  <div className="pacenote-celebration">
                    🎉 이번 주 궤도 안착 완료! 단단한 한 걸음이 되었습니다.
                  </div>
                )}
              </div>
            </div>

            {/* 2. AI-Tailored Pace (AI 추천 미션) */}
            <div className="pacenote-bento-card ai-recommend-card">
              <div className="pacenote-card-header">
                <h2>AI 추천 가이드</h2>
                <span className="pacenote-ai-badge">✨ Gemini</span>
              </div>
              <p className="pacenote-card-desc">이번 주 소비한 시그널을 바탕으로 제안하는 다음 스텝입니다.</p>
              
              <div className="pacenote-recommend-list">
                {data.current.recommendedPace && data.current.recommendedPace.length > 0 ? (
                  data.current.recommendedPace.map((rec) => (
                    <div key={rec.id} className="pacenote-recommend-item">
                      <div className="pacenote-rec-cat" style={{ color: rec.color || '#22D3EE' }}>{rec.category}</div>
                      <div className="pacenote-rec-title">{rec.title}</div>
                      <button className="pacenote-btn-accept" onClick={() => acceptRecommend(rec.id)}>
                        내 궤도에 추가하기
                      </button>
                    </div>
                  ))
                ) : (
                  <div style={{ color: '#9CA3AF', fontStyle: 'italic', padding: '20px' }}>모든 추천 가이드를 내 궤도에 추가하셨습니다!</div>
                )}
              </div>
            </div>

            {/* 3. Timeline Logbook */}
            <div className="pacenote-bento-card logbook-card">
              <div className="pacenote-card-header">
                <h2>My Logbook (Timeline)</h2>
                <button className="pacenote-btn-export">📥 이번 달 항해일지 다운로드</button>
              </div>
              <p className="pacenote-card-desc">지금까지 흔들림 없이 나아온 성장의 발자취입니다.</p>
              
              <div className="pacenote-timeline">
                {data.timeline && data.timeline.length > 0 ? (
                  data.timeline.map((weekLog, idx) => (
                    <div key={weekLog.weekId} className="timeline-item">
                      <div className="timeline-node"></div>
                      {idx !== data.timeline.length - 1 && <div className="timeline-line"></div>}
                      
                      <div className="timeline-content">
                        <div className="timeline-header">
                          <h3>{weekLog.weekId}</h3>
                          <span className="timeline-date">{weekLog.startDate} ~ {weekLog.endDate}</span>
                        </div>
                        <div className="timeline-tasks">
                          {weekLog.tasks.map(t => (
                            <div key={t.id} className="timeline-task">
                              <span className="timeline-check">✓</span>
                              <span className="timeline-task-title">{t.title}</span>
                              {t.category && (
                                <span className="timeline-task-cat" style={{ color: t.color || '#A78BFA' }}>
                                  {t.category}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ color: '#9CA3AF', fontStyle: 'italic', padding: '40px 20px', textAlign: 'center' }}>
                    아직 완료된 과거 기록이 없습니다. 이번 주 궤도를 완수해보세요!
                  </div>
                )}
              </div>
            </div>

          </div>
        ) : (
          <div className="pacenote-loading">데이터를 불러오는 중 오류가 발생했습니다.</div>
        )}
      </div>
    </div>
  );
}
