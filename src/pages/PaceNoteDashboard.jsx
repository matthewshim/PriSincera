import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, googleProvider } from '../firebase';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import './PaceNoteDashboard.css';

const DUMMY_DATA = {
  current: {
    weekId: 'W1',
    currentPace: [
      { id: 'd1', title: '아침 30분 달리기 (샘플)', category: 'Health', color: '#10B981', completed: true },
      { id: 'd2', title: '하루 5분 업무 회고 작성하기 (샘플)', category: 'Productivity', color: '#F472B6', completed: false }
    ],
    recommendedPace: [
      { id: 'r1', title: '이번 주 감사했던 일 3가지 적어보기', category: 'Mindset', color: '#34D399' },
      { id: 'r2', title: '동료에게 따뜻한 피드백 전달하기', category: 'Networking', color: '#A78BFA' },
      { id: 'r3', title: '관심 분야 아티클 1편 정독하기', category: 'Learning', color: '#60A5FA' }
    ]
  },
  timeline: [
    { weekId: 'W0', startDate: '지난 주', tasks: [{ id: 'old1', title: '일찍 일어나기', completed: true }] }
  ]
};

export default function PaceNoteDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [userToken, setUserToken] = useState(null);
  const [selectedWeekId, setSelectedWeekId] = useState(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [addingTask, setAddingTask] = useState(false);

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
        setUserToken(null);
        setData(DUMMY_DATA);
        setSelectedWeekId(DUMMY_DATA.current.weekId);
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
    if (!userToken) {
      alert("나만의 궤도를 기록하려면 먼저 로그인해 주세요.");
      return handleLoginClick();
    }

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
    if (!userToken) {
      alert("나만의 궤도를 기록하려면 먼저 로그인해 주세요.");
      return handleLoginClick();
    }

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
      const res = await fetch('/api/pacenote/accept', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}` 
        },
        body: JSON.stringify({ taskId })
      });
      if (res.ok) {
        const result = await res.json();
        // Update UI with replenished data from server
        setData(prev => ({
          ...prev,
          current: { ...prev.current, currentPace: result.currentPace, recommendedPace: result.recommendedPace }
        }));
      } else {
        fetchPaceData(userToken);
      }
    } catch (err) {
      console.error(err);
      fetchPaceData(userToken);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!userToken) {
      alert("나만의 궤도를 기록하려면 먼저 로그인해 주세요.");
      return handleLoginClick();
    }
    if (!newTaskTitle.trim() || addingTask) return;

    setAddingTask(true);
    try {
      const res = await fetch('/api/pacenote/add', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}` 
        },
        body: JSON.stringify({ title: newTaskTitle })
      });
      if (res.ok) {
        const result = await res.json();
        setData(prev => ({
          ...prev,
          current: { ...prev.current, currentPace: result.currentPace }
        }));
        setNewTaskTitle('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAddingTask(false);
    }
  };

  const handleLoginClick = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error('Login failed', err);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <div className="pacenote-page">
      {/* ── Hero Section ── */}
      <section className="pacenote-hero">
        <div className="pacenote-hero-content">
          <div className="pacenote-hero-icon">⛵</div>
          <h1 className="pacenote-title">Pace Note</h1>
          <p className="pacenote-subtitle" style={{ lineHeight: '1.6' }}>
            단순히 읽고 넘기지 마세요. 매일 얻은 인사이트를 실천 과제로 만들고, 나만의 궤도(Pace)에 올려 성장 로그를 기록하세요.<br/>
            남들의 속도에 휩쓸리지 않고, 나만의 호흡과 방향을 잃지 않기 위해.
          </p>
          
          <div className="pacenote-auth-action" style={{ marginTop: '32px', textAlign: 'center' }}>
            {!userToken ? (
              <button className="pacenote-btn-accept" style={{ padding: '16px 32px', fontSize: '1.1rem', background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)', borderRadius: '100px', width: 'auto' }} onClick={handleLoginClick}>
                ✨ 3초 만에 로그인하고 나만의 궤도 만들기
              </button>
            ) : (
              <div className="pacenote-logged-in-wrap">
                <div style={{ 
                  display: 'inline-block', 
                  background: 'rgba(167, 139, 250, 0.1)', 
                  border: '1px solid rgba(167, 139, 250, 0.5)', 
                  padding: '16px 32px', 
                  borderRadius: '100px', 
                  color: '#A78BFA', 
                  fontSize: '1.1rem', 
                  fontWeight: '500' 
                }}>
                  ⛵ 오늘도 당신만의 궤도를 만들어가고 계시군요! 흔들림 없는 항해를 응원합니다.
                </div>
                <div style={{ marginTop: '16px' }}>
                  <button 
                    onClick={handleLogout}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'underline', opacity: 0.7 }}
                  >
                    더 이상 항해를 계속하지 않으신가요? (로그아웃)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Main Content (Bento Layout) ── */}
      <div className="pacenote-container">
        {loading ? (
          <div className="pacenote-loading">
            <div className="pacenote-spinner" />
            <p>나의 항해 일지를 불러오는 중입니다...</p>
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

            {/* ── Pace Tracker & AI Recommendations ── */}
            <div className={`pacenote-tracker-section ${selectedWeekId !== data.current.weekId ? 'past-view' : ''}`}>
              {(() => {
                const isCurrent = selectedWeekId === data.current.weekId;
                const viewData = isCurrent ? data.current : data.timeline.find(t => t.weekId === selectedWeekId) || { tasks: [] };
                const paceList = isCurrent ? viewData.currentPace : viewData.tasks;
                
                return (
                  <div className="pacenote-bento-card tracker-card" style={{ width: '100%', maxWidth: '1000px', margin: '0 auto' }}>
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
                          const isCompleted = isCurrent ? task.completed : true; 
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
                                <span className="task-category-badge" style={{ color: task.color || '#A78BFA', marginLeft: 'auto', fontSize: '0.75rem', border: `1px solid ${task.color || '#A78BFA'}`, padding: '2px 6px', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                                  {task.category}
                                </span>
                              )}
                            </label>
                          );
                        })
                      ) : (
                        <div style={{ color: '#9CA3AF', fontStyle: 'italic', padding: '20px' }}>기록된 궤도가 없습니다.</div>
                      )}
                      
                      {/* Add Custom Task Input */}
                      {isCurrent && (
                        <form className="pacenote-add-form" onSubmit={handleAddTask}>
                          <span className="add-icon">+</span>
                          <input 
                            type="text" 
                            className="pacenote-add-input"
                            placeholder="나만의 새로운 목표 궤도를 추가하세요..." 
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            disabled={addingTask}
                          />
                          <button type="submit" className="pacenote-add-btn" disabled={addingTask || !newTaskTitle.trim()}>
                            추가
                          </button>
                        </form>
                      )}
                      
                      {isCurrent && paceList && paceList.length > 0 && paceList.every(t => t.completed) && (
                        <div className="pacenote-celebration">
                          🎉 이번 주 궤도 안착 완료! 단단한 한 걸음이 되었습니다.
                        </div>
                      )}

                      {/* ── AI Recommendations (Right below Add Form) ── */}
                      {isCurrent && data.current.recommendedPace && data.current.recommendedPace.length > 0 && (
                        <div className="pacenote-ai-section" style={{ marginTop: '32px', marginBottom: '0' }}>
                          <div className="pacenote-ai-header">
                            <h2>AI 추천 가이드 <span className="pacenote-ai-badge">✨ Gemini</span></h2>
                            <p>나의 주도적 성장을 위해 지속적으로 제안하는 새로운 액션입니다.</p>
                          </div>
                          <div className="pacenote-ai-scroll">
                            {data.current.recommendedPace.map((rec) => (
                              <div key={rec.id} className="pacenote-recommend-item">
                                <div className="pacenote-rec-cat" style={{ color: rec.color || '#22D3EE' }}>{rec.category}</div>
                                <div className="pacenote-rec-title">{rec.title}</div>
                                <button className="pacenote-btn-accept" onClick={() => acceptRecommend(rec.id)}>
                                  내 궤도에 추가하기
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        ) : (
          <div className="pacenote-loading">데이터를 불러오는 중 오류가 발생했습니다.</div>
        )}
      </div>
    </div>
  );
}
