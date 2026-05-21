import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import useSEO from '../hooks/useSEO';
import PaceNoteChronoRibbon from '../components/pacenote/PaceNoteChronoRibbon';
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
  const { user, token: userToken, loginWithGoogle, logout } = useAuth();
  const [selectedWeekId, setSelectedWeekId] = useState(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [addingTask, setAddingTask] = useState(false);
  const [showOmniModal, setShowOmniModal] = useState(false);
  const [isRefreshingRecs, setIsRefreshingRecs] = useState(false);
  const [diaryText, setDiaryText] = useState('');
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved', 'saving', 'error'
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [showExportModal, setShowExportModal] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (userToken && selectedWeekId === data?.current?.weekId) {
          setShowOmniModal(true);
        }
      }
      if (e.key === 'Escape') {
        setShowOmniModal(false);
        setShowExportModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [userToken, selectedWeekId, data]);

  // Sync diary text with selected week or timeline loaded data
  useEffect(() => {
    if (!data) return;
    const isCurrent = selectedWeekId === data.current?.weekId;
    if (isCurrent) {
      setDiaryText(data.current?.statement || '');
    } else {
      const pastItem = data.timeline?.find(t => t.weekId === selectedWeekId);
      setDiaryText(pastItem?.statement || '');
    }
    setSaveStatus('saved');
  }, [selectedWeekId, data]);

  // Debounced auto-save for current week's diary
  useEffect(() => {
    if (!data || !userToken) return;
    const isCurrent = selectedWeekId === data.current?.weekId;
    if (!isCurrent) return; // Only current week's diary can be edited & saved

    // Prevent saving on initial load or week sync
    if (diaryText === (data.current?.statement || '')) {
      return;
    }

    setSaveStatus('saving');
    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await fetch('/api/pacenote/diary', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userToken}`
          },
          body: JSON.stringify({ statement: diaryText })
        });
        if (res.ok) {
          const result = await res.json();
          // Update parent state so changes persist in navigation
          setData(prev => ({
            ...prev,
            current: { ...prev.current, statement: result.statement }
          }));
          setSaveStatus('saved');
        } else {
          setSaveStatus('error');
        }
      } catch (err) {
        console.error(err);
        setSaveStatus('error');
      }
    }, 1000);

    return () => clearTimeout(delayDebounceFn);
  }, [diaryText, selectedWeekId, userToken]);

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

  // AI 추천 궤도 카테고리 필터링
  const currentRecs = useMemo(() => {
    return data?.current?.recommendedPace || [];
  }, [data]);

  const filteredRecs = useMemo(() => {
    let recs = currentRecs;
    if (selectedCategory !== 'All') {
      recs = recs.filter(r => r.category === selectedCategory);
    }
    if (newTaskTitle.trim()) {
      const query = newTaskTitle.toLowerCase();
      recs = recs.filter(r => 
        r.title.toLowerCase().includes(query) || 
        r.category.toLowerCase().includes(query)
      );
    }
    return recs;
  }, [currentRecs, selectedCategory, newTaskTitle]);

  // 키보드 네비게이션용 결합 리스트
  const navigableItems = useMemo(() => {
    const items = [];
    if (newTaskTitle.trim()) {
      items.push({ id: 'custom-input', title: newTaskTitle, isCustom: true });
    }
    filteredRecs.forEach(rec => {
      items.push(rec);
    });
    return items;
  }, [newTaskTitle, filteredRecs]);

  // 아이템 리스트 변경 시 포커스 인덱스 초기화
  useEffect(() => {
    setFocusedIndex(0);
  }, [navigableItems.length]);

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
    if (userToken) {
      fetchPaceData(userToken);
    } else {
      const dummy = getDummyData();
      setData(dummy);
      setSelectedWeekId(dummy.current.weekId);
      setLoading(false);
    }
  }, [userToken]);

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
    } finally {
      setShowOmniModal(false);
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
        setShowOmniModal(false);
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
      await loginWithGoogle();
    } catch (err) {
      console.error('Login failed', err);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const generateMarkdownPortfolio = () => {
    if (!data) return '';
    
    let md = `# PriSincera AI 성장 포트폴리오 (Growth Portfolio)\n\n`;
    md += `- **성장의 주체**: ${user?.displayName || '나의 항해자'} (${user?.email || '이메일 없음'})\n`;
    md += `- **생성 일시**: ${new Date().toLocaleString()}\n`;
    md += `- **설명**: PriSincera Pace Note를 통해 구축한 가치 중심의 궤적 및 주간 회고 모음집입니다. 단순한 투두리스트를 넘어 실행과 사색을 정렬한 나만의 고유한 브랜딩 에셋입니다.\n\n`;
    md += `---\n\n`;

    // Current week details
    const curr = data.current;
    if (curr) {
      md += `## ⛵ [${curr.weekId}] 현재 항해의 궤도 (${curr.startDate || ''} ~ ${curr.endDate || ''})\n\n`;
      
      const completedTasks = (curr.currentPace || []).filter(t => t.completed);
      const totalTasks = (curr.currentPace || []).length;
      const pct = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;
      
      md += `### 📈 이번 주 실행 궤적 (달성률: ${pct}%)\n`;
      if (curr.currentPace && curr.currentPace.length > 0) {
        curr.currentPace.forEach(t => {
          const status = t.completed ? '✅ [완료]' : '⬜ [진행]';
          md += `- ${status} **${t.title}** \`${t.category || 'My Action'}\`\n`;
        });
      } else {
        md += `- 설정된 궤도가 아직 없습니다.\n`;
      }
      md += `\n`;

      const currentStatement = diaryText || curr.statement;
      if (currentStatement) {
        md += `### ⚓ 주간 사색 (Captain's Log)\n`;
        md += `> ${currentStatement.replace(/\n/g, '\n> ')}\n\n`;
      }
      md += `---\n\n`;
    }

    // Timeline (Past weeks)
    if (data.timeline && data.timeline.length > 0) {
      md += `## 📜 지난 항해의 영광 (Past Voyages)\n\n`;
      data.timeline.forEach(week => {
        md += `### ⚓ [${week.weekId}] 주간 기록 (${week.startDate} ~ ${week.endDate})\n\n`;
        
        md += `#### 🏃 달성한 궤도\n`;
        if (week.tasks && week.tasks.length > 0) {
          week.tasks.forEach(t => {
            md += `- ✅ **${t.title}** \`${t.category || 'Action'}\`\n`;
          });
        } else {
          md += `- 달성한 궤도가 없습니다.\n`;
        }
        md += `\n`;

        if (week.statement) {
          md += `#### 💡 주간 사색 (Captain's Log)\n`;
          md += `> ${week.statement.replace(/\n/g, '\n> ')}\n\n`;
        }
        md += `---\n\n`;
      });
    }
    
    md += `*이 포트폴리오는 [PriSincera Pace Note](https://www.prisincera.com/pacenote)를 통해 지속 가능하고 주체적인 성장의 여정을 관리하며 자동 생성되었습니다.*`;
    return md;
  };

  const handleCopyPortfolio = () => {
    const md = generateMarkdownPortfolio();
    navigator.clipboard.writeText(md).then(() => {
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    });
  };

  const handleDownloadPortfolio = () => {
    const md = generateMarkdownPortfolio();
    const element = document.createElement("a");
    const file = new Blob([md], {type: 'text/markdown'});
    element.href = URL.createObjectURL(file);
    element.download = `PriSincera_Growth_Portfolio_${selectedWeekId || 'Timeline'}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
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
            <PaceNoteChronoRibbon
              allWeekIds={allWeeks}
              currentWeekId={currentWeek}
              selectedWeekId={selectedWeekId}
              pastWeeksData={pastWeeks}
              currentWeekTasks={data?.current?.currentPace || []}
              onSelectWeek={(wId) => setSelectedWeekId(wId)}
            />

            {/* ── Pace Tracker & AI Recommendations ── */}
            <div className={`pacenote-tracker-section ${selectedWeekId !== data.current.weekId ? 'past-view' : ''}`}>
              {(() => {
                const isCurrent = selectedWeekId === data.current.weekId;
                const viewData = isCurrent ? data.current : data.timeline.find(t => t.weekId === selectedWeekId) || { tasks: [] };
                const paceList = isCurrent ? viewData.currentPace : viewData.tasks;
                
                const completedCount = paceList ? paceList.filter(t => t.completed).length : 0;
                const totalCount = paceList ? paceList.length : 0;
                const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
                
                // Sort tasks: uncompleted first, completed last
                const sortedPaceList = paceList ? [...paceList].sort((a, b) => {
                  if (a.completed === b.completed) return 0;
                  return a.completed ? 1 : -1;
                }) : [];

                const weekInfo = parseWeekInfo(selectedWeekId);
                const titleText = weekInfo.num ? `${weekInfo.num}주차 나의 궤도 & 항해 일지` : '나의 궤도 & 항해 일지';

                return (
                  <>
                    <div className="pacenote-bento-card consolidated-pace-card">
                      {/* ── Unified Premium Header ── */}
                      <div className="pacenote-card-header consolidated-header">
                        <h2 className="consolidated-header-title">
                          {titleText}
                          {isCurrent && userToken && saveStatus === 'error' && (
                            <span className="auto-save-status error" style={{ marginLeft: '12px', verticalAlign: 'middle' }}>
                              ⚠ 저장 중 오류 발생
                            </span>
                          )}
                        </h2>
                        <p className="pacenote-card-desc">
                          {isCurrent 
                            ? '설정한 작은 행동들의 궤도(실행)와 주간의 깊은 사색(회고)이 결합되어 당신만의 소중한 AI 성장 포트폴리오를 형성합니다.' 
                            : '과거에 단단하게 다져놓은 나의 실행 궤적과 성찰이 담긴 성장 기록입니다.'}
                        </p>
                      </div>
                      
                      {totalCount > 0 && (
                        <div className="pacenote-progress-container-new">
                          <div className="pacenote-progress-info-row">
                            <span className="pacenote-progress-label">Action Progress</span>
                            <span className="pacenote-progress-status-text">
                              🎯 {completedCount}/{totalCount} 완료 ({progressPercent}%)
                            </span>
                          </div>
                          <div className="pacenote-progress-track-header">
                            <div className="pacenote-progress-fill-header" style={{ width: `${progressPercent}%` }}></div>
                          </div>
                        </div>
                      )}

                      {/* ── Split Interior Layout ── */}
                      <div className="consolidated-card-layout">
                        {/* ── Left Panel: Tracker ── */}
                        <div className="consolidated-left-panel">
                          <h3 className="panel-sub-title">🏃 실행의 궤도</h3>
                          
                          {/* ── Omni-Orbit Trigger ── */}
                          {isCurrent && (
                            <button className="pacenote-omnibar-trigger" onClick={() => setShowOmniModal(true)}>
                              <span className="omnibar-icon">✨</span>
                              <span className="omnibar-placeholder">새로운 목표를 입력하거나, AI 추천 궤도를 탐색해 보세요...</span>
                              <kbd className="omnibar-shortcut">⌘K</kbd>
                            </button>
                          )}

                          <div className="pacenote-tasks">
                            {sortedPaceList && sortedPaceList.length > 0 ? (
                              sortedPaceList.map((task) => {
                                const isCompleted = task.completed; 
                                return (
                                  <label 
                                    key={task.id} 
                                    className={`pacenote-task-item ${isCompleted ? 'completed' : ''} ${!isCurrent ? 'readonly' : ''}`}
                                    style={{ '--category-theme': task.color || '#A78BFA' }}
                                  >
                                    <input 
                                      type="checkbox" 
                                      checked={isCompleted} 
                                      onChange={() => isCurrent && toggleComplete(task.id)} 
                                      disabled={!isCurrent}
                                    />
                                    <span className="task-custom-checkbox"></span>
                                    <div className="task-body-content">
                                      {task.category && (
                                        <span className="task-category-text" style={{ color: task.color || '#A78BFA' }}>
                                          {task.category}
                                        </span>
                                      )}
                                      <span className="task-text">{task.title}</span>
                                    </div>
                                  </label>
                                );
                              })
                            ) : (
                              <div style={{ color: '#9CA3AF', fontStyle: 'italic', padding: '20px' }}>기록된 궤도가 없습니다.</div>
                            )}
                          </div>
                        </div>

                        {/* ── Vertical Divider ── */}
                        <div className="consolidated-vertical-divider"></div>

                        {/* ── Right Panel: Logbook ── */}
                        <div className="consolidated-right-panel">
                          <h3 className="panel-sub-title">⚓ 사색의 기록</h3>
                          {isCurrent ? (
                            <div className="logbook-textarea-wrapper">
                              <textarea
                                className="logbook-textarea"
                                value={diaryText}
                                onChange={(e) => {
                                  if (!userToken) {
                                    alert("나만의 궤도를 기록하려면 먼저 로그인해 주세요.");
                                    return handleLoginClick();
                                  }
                                  if (e.target.value.length <= 1000) {
                                    setDiaryText(e.target.value);
                                  }
                                }}
                                placeholder={userToken ? "이번 주 나의 궤도에서 발생한 사색, 어려웠던 일, 깨달은 배움을 자유롭게 적어보세요. (최대 1000자)" : "3초 로그인 후, 실시간으로 저장되는 나만의 주간 회고록을 완성해 보세요."}
                                disabled={!userToken}
                              />
                              <div className="logbook-char-count">
                                <svg width="24" height="24" className="char-count-svg">
                                  <circle cx="12" cy="12" r="9" className="char-count-bg-circle" />
                                  <circle 
                                    cx="12" 
                                    cy="12" 
                                    r="9" 
                                    className={`char-count-progress-circle ${diaryText.length > 900 ? 'danger' : diaryText.length > 700 ? 'warning' : 'safe'}`}
                                    style={{
                                      strokeDasharray: 2 * Math.PI * 9,
                                      strokeDashoffset: (2 * Math.PI * 9) * (1 - Math.min(diaryText.length / 1000, 1))
                                    }}
                                  />
                                </svg>
                                <span>{diaryText.length} / 1000자</span>
                              </div>
                            </div>
                          ) : (
                            <div className="logbook-viewer">
                              {diaryText ? (
                                <blockquote className="captains-log">
                                  <span className="quote-mark">“</span>
                                  <p className="log-text">{diaryText}</p>
                                  <span className="quote-mark text-right">”</span>
                                </blockquote>
                              ) : (
                                <div className="logbook-empty-view">
                                  ⛵ 이 주간에는 기록된 사색의 항해 일지가 없습니다.
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* ── Card Footer with Export Button ── */}
                      {userToken && (
                        <div className="consolidated-card-footer">
                          <button className="pacenote-btn-export footer-export-btn" onClick={() => setShowExportModal(true)}>
                            📤 AI 성장 포트폴리오 내보내기
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        ) : (
          <div className="pacenote-loading">데이터를 불러오는 중 오류가 발생했습니다.</div>
        )}
      </div>



      {/* ── Omni Modal (Command Palette) ── */}
      {showOmniModal && (
        <div className="pacenote-modal-backdrop" onClick={() => setShowOmniModal(false)}>
          <div className="pacenote-omni-modal" onClick={e => e.stopPropagation()}>
            <div className="omni-modal-input-area">
              <span className="omnibar-icon">✨</span>
              <input 
                type="text" 
                className="omnibar-input"
                placeholder="새로운 목표를 입력하거나, AI 추천 궤도를 탐색해 보세요..." 
                value={newTaskTitle}
                onChange={(e) => {
                  setNewTaskTitle(e.target.value);
                  setFocusedIndex(0);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setFocusedIndex(prev => (navigableItems.length > 0 ? (prev + 1) % navigableItems.length : 0));
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setFocusedIndex(prev => (navigableItems.length > 0 ? (prev - 1 + navigableItems.length) % navigableItems.length : 0));
                  } else if (e.key === 'Enter') {
                    e.preventDefault();
                    if (navigableItems.length > 0) {
                      const activeItem = navigableItems[focusedIndex];
                      if (activeItem.isCustom) {
                        handleAddTask(e);
                      } else {
                        acceptRecommend(activeItem.id);
                      }
                    }
                  } else if (e.key === 'Escape') {
                    setShowOmniModal(false);
                  }
                }}
                disabled={addingTask}
                autoFocus
              />
              {newTaskTitle.trim() && (
                <button className="omnibar-submit-btn" onClick={handleAddTask} disabled={addingTask}>
                  ↵ 궤도로 추가
                </button>
              )}
            </div>

            {/* ── Category Filters ── */}
            <div className="omni-category-tabs">
              {['All', 'Health', 'Productivity', 'Mindset', 'Learning'].map(cat => {
                const labelMap = {
                  All: '⚡ All',
                  Health: '🏃 Health',
                  Productivity: '⚡ Productivity',
                  Mindset: '🧘 Mindset',
                  Learning: '📚 Learning'
                };
                return (
                  <button
                    key={cat}
                    className={`omni-cat-tab ${selectedCategory === cat ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setFocusedIndex(0);
                    }}
                  >
                    {labelMap[cat]}
                  </button>
                );
              })}
            </div>
            
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
              {navigableItems.length === 0 ? (
                <div className="omnibar-empty">해당되는 AI 추천 궤도가 없습니다.</div>
              ) : (
                navigableItems.map((item, index) => {
                  const isFocused = index === focusedIndex;
                  if (item.isCustom) {
                    return (
                      <div 
                        key={item.id} 
                        className={`omnibar-rec-item add-custom ${isFocused ? 'focused' : ''}`} 
                        onClick={handleAddTask}
                        onMouseEnter={() => setFocusedIndex(index)}
                      >
                        <div className="rec-icon">+</div>
                        <div className="rec-content">
                          <div className="rec-title">"{item.title}" 직접 추가하기</div>
                          <div className="rec-desc">입력한 내용으로 새로운 궤도를 생성합니다.</div>
                        </div>
                        <div className="rec-action">↵ 추가</div>
                      </div>
                    );
                  }

                  return (
                    <div 
                      key={item.id} 
                      className={`omnibar-rec-item ${isFocused ? 'focused' : ''}`} 
                      onClick={() => acceptRecommend(item.id)}
                      onMouseEnter={() => setFocusedIndex(index)}
                    >
                      <div className="rec-icon" style={{ color: item.color || '#A78BFA' }}>✦</div>
                      <div className="rec-content">
                        <div className="rec-cat" style={{ color: item.color || '#A78BFA' }}>{item.category}</div>
                        <div className="rec-title">{item.title}</div>
                      </div>
                      <div className="rec-action">↵ 추가</div>
                    </div>
                  );
                })
              )}
            </div>

            {/* ── Shortcuts Guide Footer ── */}
            <div className="omni-modal-footer">
              <span className="footer-shortcut-item"><kbd>↑↓</kbd> 이동</span>
              <span className="footer-shortcut-item"><kbd>Enter</kbd> 추가</span>
              <span className="footer-shortcut-item"><kbd>ESC</kbd> 닫기</span>
            </div>
          </div>
        </div>
      )}

      {/* ── AI Growth Portfolio Export Modal ── */}
      {showExportModal && (
        <div className="pacenote-modal-backdrop" onClick={() => setShowExportModal(false)}>
          <div className="pacenote-export-modal" onClick={e => e.stopPropagation()}>
            <div className="export-modal-header">
              <h3>📤 AI 성장 포트폴리오 내보내기</h3>
              <button className="close-btn" onClick={() => setShowExportModal(false)}>×</button>
            </div>
            
            <div className="export-modal-body">
              <p className="export-desc">
                지금까지 묵묵히 쌓아올린 실행의 궤도와 깊이 있는 성찰 일지가 아름다운 마크다운 웹 문서로 컴파일되었습니다. 
                링크드인, 깃허브 README, 노션 또는 개인 블로그에 붙여넣어 당신만의 독보적인 브랜딩 에셋으로 활용하세요.
              </p>
              
              <div className="portfolio-preview-wrapper">
                <textarea 
                  className="portfolio-preview-textarea" 
                  value={generateMarkdownPortfolio()} 
                  readOnly 
                />
              </div>
            </div>

            <div className="export-modal-footer">
              <button className="export-btn btn-secondary" onClick={handleDownloadPortfolio}>
                💾 .md 파일 다운로드
              </button>
              <button className="export-btn btn-primary" onClick={handleCopyPortfolio}>
                {copyFeedback ? '✔ 클립보드 복사 완료!' : '📋 클립보드 복사'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
