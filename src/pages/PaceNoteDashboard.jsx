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
  const [selectedWeekId, setSelectedWeekId] = useState(null);

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
        if (!selectedWeekId && result.current) {
          setSelectedWeekId(result.current.weekId);
        }
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
          <div className="pacenote-content-wrapper">
            
            {/* ── Top: Week Selector (Timeline) ── */}
            <div className="pacenote-week-selector">
              <h2 className="pacenote-selector-title">나의 항해 일지</h2>
              <div className="pacenote-week-scroll">
                {[...data.timeline].reverse().map(weekLog => (
                  <div 
                    key={weekLog.weekId} 
                    className={`pacenote-week-btn ${selectedWeekId === weekLog.weekId ? 'active' : ''}`}
                    onClick={() => setSelectedWeekId(weekLog.weekId)}
                  >
                    <div className="week-id">{weekLog.weekId}</div>
                    <div className="week-date">{weekLog.startDate}</div>
                    <div className="week-status">✓ {weekLog.tasks.length} 완료</div>
                  </div>
                ))}
                
                <div 
                  className={`pacenote-week-btn current ${selectedWeekId === data.current.weekId ? 'active' : ''}`}
                  onClick={() => setSelectedWeekId(data.current.weekId)}
                >
                  <div className="week-id">{data.current.weekId}</div>
                  <div className="week-date">이번 주</div>
                  <div className="week-status">항해 중 ⛵</div>
                </div>
              </div>
            </div>

            {/* ── Middle: Bento Grid ── */}
            <div className={`pacenote-bento-grid ${selectedWeekId !== data.current.weekId ? 'past-view' : ''}`}>
              
              {/* 1. Pace Tracker (진행 중인 미션 or 과거 미션) */}
              {(() => {
                const isCurrent = selectedWeekId === data.current.weekId;
                const viewData = isCurrent ? data.current : data.timeline.find(t => t.weekId === selectedWeekId) || { tasks: [] };
                const paceList = isCurrent ? viewData.currentPace : viewData.tasks;
                
                return (
                  <div className="pacenote-bento-card tracker-card">
                    <div className="pacenote-card-header">
                      <h2>{isCurrent ? '이번 주 나의 궤도' : `${selectedWeekId} 나의 궤도`}</h2>
                      <span className="pacenote-date-badge">{selectedWeekId}</span>
                    </div>
                    <p className="pacenote-card-desc">
                      {isCurrent ? '조급해하지 않고 이번 주에 집중할 작은 행동들입니다.' : '과거에 단단하게 다져놓은 나의 항해 기록입니다.'}
                    </p>
                    
                    <div className="pacenote-tasks">
                      {paceList && paceList.length > 0 ? (
                        paceList.map((task) => {
                          const isCompleted = isCurrent ? task.completed : true; // past tasks are all completed in this context, or we just rely on task.completed if we stored it
                          return (
                            <label key={task.id} className={`pacenote-task-item ${isCompleted ? 'completed' : ''} ${!isCurrent ? 'readonly' : ''}`}>
                              <input 
                                type="checkbox" 
                                checked={isCompleted} 
                                onChange={() => isCurrent && toggleComplete(task.id)} 
                                disabled={!isCurrent}
                              />
                              <span className="task-custom-checkbox"></span>
                              <span className="task-text">{task.title}</span>
                              {task.category && (
                                <span className="task-category-badge" style={{ color: task.color || '#A78BFA', marginLeft: 'auto', fontSize: '0.75rem', border: `1px solid ${task.color || '#A78BFA'}`, padding: '2px 6px', borderRadius: '4px' }}>
                                  {task.category}
                                </span>
                              )}
                            </label>
                          );
                        })
                      ) : (
                        <div style={{ color: '#9CA3AF', fontStyle: 'italic', padding: '20px' }}>기록된 궤도가 없습니다.</div>
                      )}
                      
                      {isCurrent && paceList && paceList.length > 0 && paceList.every(t => t.completed) && (
                        <div className="pacenote-celebration">
                          🎉 이번 주 궤도 안착 완료! 단단한 한 걸음이 되었습니다.
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* 2. AI-Tailored Pace (AI 추천 미션 - 이번 주일 때만 노출) */}
              {selectedWeekId === data.current.weekId && (
                <div className="pacenote-bento-card ai-recommend-card">
                  <div className="pacenote-card-header">
                    <h2>AI 추천 가이드</h2>
                    <span className="pacenote-ai-badge">✨ Gemini</span>
                  </div>
                  <p className="pacenote-card-desc">나의 주도적 성장을 위해 제안하는 이번 주 추가 액션입니다.</p>
                  
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
              )}
            </div>
          </div>
        ) : (
          <div className="pacenote-loading">데이터를 불러오는 중 오류가 발생했습니다.</div>
        )}
      </div>
    </div>
  );
}
