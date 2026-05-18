import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, googleProvider } from '../firebase';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import useSEO from '../hooks/useSEO';
import './PaceNoteDashboard.css';

const getCurrentWeekId = () => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${weekNo}`;
};

const getDummyData = () => {
  const currentWeekId = getCurrentWeekId();
  const [year, week] = currentWeekId.split('-W').map(Number);
  const prevWeekId = week > 1 ? `${year}-W${week - 1}` : `${year - 1}-W52`;
  
  return {
    current: {
      weekId: currentWeekId,
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
      { weekId: prevWeekId, startDate: '지난 주', tasks: [{ id: 'old1', title: '일찍 일어나기', completed: true }] }
    ]
  };
};

export default function PaceNoteDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useSEO({
    title: 'Pace Note',
    description: '목표 달성을 위한 전략적 마일스톤과 페이스를 조절하는 PriSincera의 Pace Note 대시보드입니다.',
    keywords: 'PriSincera, Pace Note, 목표 관리, 마일스톤, 성과, 대시보드, 생산성',
    ogUrl: 'https://www.prisincera.com/pacenote'
  });
  
  // ISO 주차 계산 (간단한 미래 주차 생성용)
  const generateFutureWeeks = (currentWeekId, count = 3) => {
    if (!currentWeekId) return [];
    const parts = currentWeekId.split('-W');
    if (parts.length !== 2) return [];
    let year = parseInt(parts[0], 10);
    let week = parseInt(parts[1], 10);
    
    const futureWeeks = [];
    for (let i = 1; i <= count; i++) {
      let nextWeek = week + i;
      let nextYear = year;
      if (nextWeek > 52) {
        nextWeek = nextWeek % 52;
        if (nextWeek === 0) nextWeek = 52;
        nextYear = year + 1;
      }
      futureWeeks.push(`${nextYear}-W${nextWeek.toString().padStart(2, '0')}`);
    }
    return futureWeeks;
  };
  const [data, setData] = useState(null);
  const [userToken, setUserToken] = useState(null);
  const [selectedWeekId, setSelectedWeekId] = useState(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [addingTask, setAddingTask] = useState(false);
  const [showWeekCalendar, setShowWeekCalendar] = useState(false);
  const [omnibarFocused, setOmnibarFocused] = useState(false);
  const [isRefreshingRecs, setIsRefreshingRecs] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.pacenote-omnibar-container')) {
        setOmnibarFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 주차 탐색용 데이터 연산
  const { pastWeeks, currentWeek, futureWeeks, allWeeks } = useMemo(() => {
    if (!data) return { pastWeeks: [], currentWeek: null, futureWeeks: [], allWeeks: [] };
    const past = [...(data.timeline || [])].reverse();
    const curr = data.current?.weekId;
    const future = generateFutureWeeks(curr, 3);
    const pastIds = past.map(w => w.weekId);
    const all = [...pastIds, ...(curr ? [curr] : []), ...future];
    return { pastWeeks: past, currentWeek: curr, futureWeeks: future, allWeeks: all };
  }, [data]);

  const currentIndex = allWeeks.indexOf(selectedWeekId);
  const prevWeekId = currentIndex > 0 ? allWeeks[currentIndex - 1] : null;
  const nextWeekId = currentIndex !== -1 && currentIndex < allWeeks.length - 1 ? allWeeks[currentIndex + 1] : null;

  const parseWeekInfo = (wId) => {
    if (!wId) return { year: '', num: '', isFuture: false, isCurrent: false };
    const isFuture = futureWeeks.includes(wId);
    const isCurrent = wId === currentWeek;
    const parts = wId.split('-W');
    if (parts.length === 2) return { year: `${parts[0]}년`, num: parts[1], isFuture, isCurrent };
    return { year: '이번 연도', num: wId.replace('W', ''), isFuture, isCurrent };
  };

  useEffect(() => {
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
        const dummy = getDummyData();
        setData(dummy);
        setSelectedWeekId(dummy.current.weekId);
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
        setOmnibarFocused(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAddingTask(false);
    }
  };

  const refreshRecommendations = async (e) => {
    e?.stopPropagation();
    setIsRefreshingRecs(true);
    // TODO: Connect to backend API: GET /api/pacenote/recommend
    // For now, mock the refresh with a new dummy set
    setTimeout(() => {
      const DUMMY_POOL = [
        { id: 'r1', title: '이번 주 감사했던 일 3가지 적어보기', category: 'Mindset', color: '#34D399' },
        { id: 'r2', title: '동료에게 따뜻한 피드백 전달하기', category: 'Networking', color: '#A78BFA' },
        { id: 'r3', title: '관심 분야 아티클 1편 정독하기', category: 'Learning', color: '#60A5FA' },
        { id: 'r4', title: '하루 15분 명상으로 뇌 휴식하기', category: 'Health', color: '#F472B6' },
        { id: 'r5', title: '업무 자동화 아이디어 1개 구상하기', category: 'Productivity', color: '#FBBF24' },
        { id: 'r6', title: '오랜만에 지인에게 안부 연락하기', category: 'Networking', color: '#A78BFA' },
        { id: 'r7', title: '잠들기 전 10분 스트레칭 하기', category: 'Health', color: '#10B981' },
        { id: 'r8', title: '나만의 우선순위 선언문 작성하기', category: 'Focus', color: '#C084FC' },
        { id: 'r9', title: '사용하지 않는 앱과 알림 끄기', category: 'Digital Detox', color: '#9CA3AF' }
      ];
      // Shuffle and pick 5
      const shuffled = DUMMY_POOL.sort(() => 0.5 - Math.random()).slice(0, 5);
      setData(prev => ({
        ...prev,
        current: { ...prev.current, recommendedPace: shuffled }
      }));
      setIsRefreshingRecs(false);
    }, 800);
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
            단순히 읽고 넘기지 마세요.<br/>매일 얻은 인사이트를 실천 과제로 만들고, 나만의 궤도(Pace)에 올려 성장 로그를 기록하세요.<br/>
            남들의 속도에 휩쓸리지 않고, 나만의 호흡과 방향을 잃지 않기 위해.
          </p>
          
          <div className="pacenote-auth-action" style={{ marginTop: '32px', textAlign: 'center' }}>
            {!userToken ? (
              <button className="pacenote-auth-btn" onClick={handleLoginClick}>
                ✨ 3초 만에 로그인하고 나만의 궤도 만들기
              </button>
            ) : (
              <div className="pacenote-logged-in-wrap">
                <div style={{ 
                  display: 'inline-block', 
                  background: 'rgba(52, 211, 153, 0.1)', 
                  border: '1px solid rgba(52, 211, 153, 0.5)', 
                  padding: '12px 28px', 
                  borderRadius: '100px', 
                  color: '#34D399', 
                  fontSize: '1rem', 
                  fontWeight: '500',
                  boxShadow: 'none',
                  cursor: 'default'
                }}>
                  ⛵ 흔들림 없는 항해를 응원합니다!
                </div>
                <div style={{ marginTop: '16px' }}>
                  <button 
                    onClick={handleLogout}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'underline', opacity: 0.7 }}
                  >
                    기록 중단하기
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
            {/* ── Top: Week Selector (Nav Header) ── */}
            <div className="pacenote-detail-nav-container">
              <div className="pacenote-detail-nav">
                <div className="nav-side">
                  {prevWeekId && (
                    <button className="nav-arrow prev" onClick={() => setSelectedWeekId(prevWeekId)}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="nav-arrow-label">{parseWeekInfo(prevWeekId).num}주차</span>
                    </button>
                  )}
                </div>
                
                <div className="nav-center" onClick={() => setShowWeekCalendar(true)}>
                  <span className={`nav-huge-num ${parseWeekInfo(selectedWeekId).isFuture ? 'future' : ''}`}>
                    {parseWeekInfo(selectedWeekId).num}
                  </span>
                  <div className="nav-small-info">
                    <span className="nav-year">{parseWeekInfo(selectedWeekId).year}</span>
                    <span className="nav-label">주차</span>
                  </div>
                  <div className={`nav-status-badge ${parseWeekInfo(selectedWeekId).isFuture ? 'locked' : parseWeekInfo(selectedWeekId).isCurrent ? '' : 'past'}`}>
                    {parseWeekInfo(selectedWeekId).isCurrent 
                      ? (userToken ? '항해 중 ⛵' : '항해 대기 ⛵') 
                      : parseWeekInfo(selectedWeekId).isFuture ? '🔒 대기 중' : '✓ 완료'}
                  </div>
                </div>
                
                <div className="nav-side" style={{ justifyContent: 'flex-end' }}>
                  {nextWeekId && (
                    <button className="nav-arrow next" onClick={() => setSelectedWeekId(nextWeekId)}>
                      <span className="nav-arrow-label">{parseWeekInfo(nextWeekId).num}주차</span>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              
              <div className="nav-back-wrap">
                <button className="nav-back-btn" onClick={() => setShowWeekCalendar(true)}>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>전체 항해 일지 보기</span>
                </button>
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
                      
                      {/* ── Omni-Orbit Input (Consolidated Search & AI) ── */}
                      {isCurrent && (
                        <div className="pacenote-omnibar-container" onClick={() => setOmnibarFocused(true)}>
                          <div className={`pacenote-omnibar ${omnibarFocused ? 'focused' : ''}`}>
                            <span className="omnibar-icon">✨</span>
                            <input 
                              type="text" 
                              className="omnibar-input"
                              placeholder="새로운 목표를 입력하거나, AI 추천 궤도를 탐색해 보세요..." 
                              value={newTaskTitle}
                              onChange={(e) => setNewTaskTitle(e.target.value)}
                              onFocus={() => setOmnibarFocused(true)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleAddTask(e);
                              }}
                              disabled={addingTask}
                            />
                            {newTaskTitle.trim() && (
                              <button className="omnibar-submit-btn" onClick={handleAddTask} disabled={addingTask}>
                                ↵ 궤도로 추가
                              </button>
                            )}
                          </div>
                          
                          {omnibarFocused && (
                            <div className="omnibar-dropdown">
                              <div className="omnibar-dropdown-header">
                                <span className="omnibar-dropdown-title">
                                  {newTaskTitle.trim() ? '검색 및 연관 추천' : 'AI 추천 가이드'}
                                </span>
                                {!newTaskTitle.trim() && (
                                  <button className="omnibar-refresh-btn" onClick={refreshRecommendations} disabled={isRefreshingRecs}>
                                    {isRefreshingRecs ? '🔄 갱신 중...' : '🔄 다른 추천 보기'}
                                  </button>
                                )}
                              </div>
                              <div className="omnibar-dropdown-list">
                                {newTaskTitle.trim() && (
                                  <div className="omnibar-rec-item add-custom" onClick={handleAddTask}>
                                    <div className="rec-icon">+</div>
                                    <div className="rec-content">
                                      <div className="rec-title">"{newTaskTitle}" 직접 추가하기</div>
                                      <div className="rec-desc">입력한 내용으로 새로운 궤도를 생성합니다.</div>
                                    </div>
                                  </div>
                                )}
                                
                                {(() => {
                                  const currentRecs = data.current.recommendedPace || [];
                                  const filteredRecs = newTaskTitle.trim() 
                                    ? currentRecs.filter(r => r.title.includes(newTaskTitle) || r.category.includes(newTaskTitle))
                                    : currentRecs;
                                  
                                  if (filteredRecs.length === 0) {
                                    return <div className="omnibar-empty">관련된 AI 추천이 없습니다.</div>;
                                  }

                                  return filteredRecs.map((rec) => (
                                    <div key={rec.id} className="omnibar-rec-item" onClick={() => acceptRecommend(rec.id)}>
                                      <div className="rec-icon" style={{ color: rec.color || '#A78BFA' }}>✦</div>
                                      <div className="rec-content">
                                        <div className="rec-cat" style={{ color: rec.color || '#A78BFA' }}>{rec.category}</div>
                                        <div className="rec-title">{rec.title}</div>
                                      </div>
                                      <div className="rec-action">추가</div>
                                    </div>
                                  ));
                                })()}
                              </div>
                            </div>
                          )}
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

      {/* ── Calendar Modal ── */}
      {showWeekCalendar && (
        <div className="pacenote-calendar-modal-backdrop" onClick={() => setShowWeekCalendar(false)}>
          <div className="pacenote-calendar-modal" onClick={e => e.stopPropagation()}>
            <div className="calendar-modal-header">
              <h3>항해 일지 모아보기</h3>
              <button onClick={() => setShowWeekCalendar(false)}>✕</button>
            </div>
            <div className="calendar-grid">
              {allWeeks.map(wId => {
                const info = parseWeekInfo(wId);
                const isActive = wId === selectedWeekId;
                const timelineWeek = pastWeeks.find(t => t.weekId === wId);
                const taskCount = timelineWeek ? timelineWeek.tasks.length : (info.isCurrent && data?.current ? data.current.currentPace.filter(t => t.completed).length : 0);
                
                return (
                  <div 
                    key={wId} 
                    className={`calendar-cell ${isActive ? 'active' : ''} ${info.isFuture ? 'future' : ''} ${info.isCurrent ? 'current' : ''}`}
                    onClick={() => {
                      if (!info.isFuture) {
                        setSelectedWeekId(wId);
                        setShowWeekCalendar(false);
                      }
                    }}
                  >
                    <div className="cell-num">{info.num}주차</div>
                    {!info.isFuture && <div className="cell-count">✓ {taskCount}</div>}
                    {info.isFuture && <div className="cell-count">🔒</div>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
