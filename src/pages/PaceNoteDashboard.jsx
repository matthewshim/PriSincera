import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import useSEO from '../hooks/useSEO';
import PaceNoteChronoRibbon from '../components/pacenote/PaceNoteChronoRibbon';
import { useTranslation } from '../contexts/LanguageContext';
import './PaceNoteDashboard.css';

const getCurrentWeekId = () => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${weekNo}`;
};

const getSmartCategory = (title) => {
  const t = title.toLowerCase();
  
  if (t.includes('달리기') || t.includes('운동') || t.includes('스트레칭') || t.includes('일어나기') || t.includes('명상') || t.includes('건강') || t.includes('식단') || t.includes('수면') || t.includes('헬스') || t.includes('산책') || t.includes('조깅') || t.includes('run') || t.includes('exercise') || t.includes('stretch') || t.includes('meditation') || t.includes('health') || t.includes('sleep')) {
    return { category: 'Health', color: '#10B981' }; // Emerald Green
  }
  if (t.includes('회고') || t.includes('업무') || t.includes('코딩') || t.includes('개발') || t.includes('자동화') || t.includes('작업') || t.includes('프로젝트') || t.includes('계획') || t.includes('우선순위') || t.includes('시간 관리') || t.includes('정리') || t.includes('retrospective') || t.includes('coding') || t.includes('automation') || t.includes('plan') || t.includes('priority')) {
    return { category: 'Productivity', color: '#F472B6' }; // Rose Pink
  }
  if (t.includes('감사') || t.includes('마인드') || t.includes('일기') || t.includes('생각') || t.includes('회상') || t.includes('긍정') || t.includes('행복') || t.includes('사색') || t.includes('gratitude') || t.includes('mind') || t.includes('diary') || t.includes('contemplation') || t.includes('happy')) {
    return { category: 'Mindset', color: '#34D399' }; // Mint Green
  }
  if (t.includes('아티클') || t.includes('공부') || t.includes('학습') || t.includes('독서') || t.includes('책') || t.includes('강의') || t.includes('리서치') || t.includes('공유') || t.includes('배움') || t.includes('article') || t.includes('read') || t.includes('learn') || t.includes('research') || t.includes('book')) {
    return { category: 'Learning', color: '#60A5FA' }; // Sky Blue
  }
  if (t.includes('동료') || t.includes('피드백') || t.includes('연락') || t.includes('지인') || t.includes('커피챗') || t.includes('소통') || t.includes('회의') || t.includes('네트워킹') || t.includes('인사') || t.includes('colleague') || t.includes('feedback') || t.includes('networking') || t.includes('connect')) {
    return { category: 'Networking', color: '#A78BFA' }; // Lavender Purple
  }
  
  // Default fallback
  return { category: 'Life', color: '#C084FC' }; // Purple Accent
};

const getDummyPool = (locale) => {
  if (locale === 'en') {
    return [
      { id: 'r1', title: 'Write down 3 things you were grateful for this week', category: 'Mindset', color: '#34D399' },
      { id: 'r2', title: 'Send warm, positive feedback to a colleague', category: 'Networking', color: '#A78BFA' },
      { id: 'r3', title: 'Read 1 article in your field of interest', category: 'Learning', color: '#60A5FA' },
      { id: 'r4', title: 'Rest your brain with a 15-minute daily meditation', category: 'Health', color: '#F472B6' },
      { id: 'r5', title: 'Draft 1 work automation idea', category: 'Productivity', color: '#FBBF24' },
      { id: 'r6', title: 'Say hello to an old acquaintance', category: 'Networking', color: '#A78BFA' },
      { id: 'r7', title: 'Do a 10-minute stretch before sleeping', category: 'Health', color: '#10B981' },
      { id: 'r8', title: 'Write your own priority statement', category: 'Focus', color: '#C084FC' },
      { id: 'r9', title: 'Turn off unused apps and notifications', category: 'Digital Detox', color: '#9CA3AF' }
    ];
  }
  if (locale === 'ja') {
    return [
      { id: 'r1', title: '今週感謝したことを3つ書き出してみる', category: 'Mindset', color: '#34D399' },
      { id: 'r2', title: '同僚に温かいフィードバックを伝える', category: 'Networking', color: '#A78BFA' },
      { id: 'r3', title: '関心分野の記事を1本精読する', category: 'Learning', color: '#60A5FA' },
      { id: 'r4', title: '1日15分の瞑想で脳を休ませる', category: 'Health', color: '#F472B6' },
      { id: 'r5', title: '業務効率化・自動化のアイデアを1つ構想する', category: 'Productivity', color: '#FBBF24' },
      { id: 'r6', title: '久しぶりに知人に挨拶の連絡をする', category: 'Networking', color: '#A78BFA' },
      { id: 'r7', title: '寝る前に10分間のストレッチをする', category: 'Health', color: '#10B981' },
      { id: 'r8', title: '自分だけの優先順位宣言書を作成する', category: 'Focus', color: '#C084FC' },
      { id: 'r9', title: '使っていないアプリと通知をオフにする', category: 'Digital Detox', color: '#9CA3AF' }
    ];
  }
  return [
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
};

const getDummyData = (locale) => {
  const currentWeekId = getCurrentWeekId();
  const [year, week] = currentWeekId.split('-W').map(Number);
  const prevWeekId = week > 1 ? `${year}-W${week - 1}` : `${year - 1}-W52`;
  
  if (locale === 'en') {
    return {
      current: {
        weekId: currentWeekId,
        currentPace: [
          { id: 'd1', title: '30-minute Morning Run (Sample)', category: 'Health', color: '#10B981', completed: true },
          { id: 'd2', title: 'Write a 5-minute Daily Work Retrospective (Sample)', category: 'Productivity', color: '#F472B6', completed: false }
        ],
        recommendedPace: [
          { id: 'r1', title: 'Write down 3 things you were grateful for this week', category: 'Mindset', color: '#34D399' },
          { id: 'r2', title: 'Send warm, positive feedback to a colleague', category: 'Networking', color: '#A78BFA' },
          { id: 'r3', title: 'Read 1 article in your field of interest', category: 'Learning', color: '#60A5FA' }
        ]
      },
      timeline: [
        { weekId: prevWeekId, startDate: 'Last Week', tasks: [{ id: 'old1', title: 'Wake up early', completed: true }] }
      ]
    };
  }
  
  if (locale === 'ja') {
    return {
      current: {
        weekId: currentWeekId,
        currentPace: [
          { id: 'd1', title: '朝の30分ランニング（サンプル）', category: 'Health', color: '#10B981', completed: true },
          { id: 'd2', title: '1日5分間、業務振り返りを書く（サンプル）', category: 'Productivity', color: '#F472B6', completed: false }
        ],
        recommendedPace: [
          { id: 'r1', title: '今週感謝したことを3つ書き出してみる', category: 'Mindset', color: '#34D399' },
          { id: 'r2', title: '同僚に温かいフィードバックを伝える', category: 'Networking', color: '#A78BFA' },
          { id: 'r3', title: '関心分野の記事を1本精読する', category: 'Learning', color: '#60A5FA' }
        ]
      },
      timeline: [
        { weekId: prevWeekId, startDate: '先週', tasks: [{ id: 'old1', title: '早起きする', completed: true }] }
      ]
    };
  }

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
  const { locale, t } = useTranslation();

  useSEO({
    title: 'Pace Note',
    description: t('paceNote.heroSubtitle') ? t('paceNote.heroSubtitle').replace(/\n/g, ' ') : 'Pace Note',
    keywords: t('home.seoKeywords'),
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
        const res = await fetch(`/api/pacenote/diary?lang=${locale}`, {
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
    
    let yearLabel = '';
    let defaultYearLabel = '';
    if (locale === 'en') {
      yearLabel = parts[0];
      defaultYearLabel = 'This Year';
    } else if (locale === 'ja') {
      yearLabel = `${parts[0]}年`;
      defaultYearLabel = '今年';
    } else {
      yearLabel = `${parts[0]}년`;
      defaultYearLabel = '이번 연도';
    }
    
    if (parts.length === 2) return { year: yearLabel, num: parts[1], isFuture, isCurrent };
    return { year: defaultYearLabel, num: wId.replace('W', ''), isFuture, isCurrent };
  };

  useEffect(() => {
    document.body.classList.add('hero-ready');
    return () => document.body.classList.remove('hero-ready');
  }, []);

  useEffect(() => {
    if (userToken) {
      fetchPaceData(userToken);
    } else {
      const dummy = getDummyData(locale);
      setData(dummy);
      setSelectedWeekId(dummy.current.weekId);
      setLoading(false);
    }
  }, [userToken, locale]);

  const fetchPaceData = async (token) => {
    try {
      const res = await fetch(`/api/pacenote?lang=${locale}`, {
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
      alert(t('paceNote.loginToRecord'));
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
      await fetch(`/api/pacenote/toggle?lang=${locale}`, {
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
      alert(t('paceNote.loginToRecord'));
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
      const res = await fetch(`/api/pacenote/accept?lang=${locale}`, {
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
      alert(t('paceNote.loginToRecord'));
      return handleLoginClick();
    }
    if (!newTaskTitle.trim() || addingTask) return;

    setAddingTask(true);
    try {
      const res = await fetch(`/api/pacenote/add?lang=${locale}`, {
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
    // For now, mock the refresh with a new dummy pool
    setTimeout(() => {
      const pool = getDummyPool(locale);
      // Shuffle and pick 5
      const shuffled = pool.sort(() => 0.5 - Math.random()).slice(0, 5);
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
    
    if (locale === 'en') {
      let md = `# PriSincera AI Growth Portfolio\n\n`;
      md += `- **Sailor**: ${user?.displayName || 'My Voyager'} (${user?.email || 'No email'})\n`;
      md += `- **Generated At**: ${new Date().toLocaleString()}\n`;
      md += `- **Description**: A collection of value-oriented orbits and weekly contemplation logs built through PriSincera Pace Note. Beyond a simple to-do list, this is a unique personal branding asset aligning execution and reflection.\n\n`;
      md += `---\n\n`;

      const curr = data.current;
      if (curr) {
        md += `## ⛵ [${curr.weekId}] Current Orbit of Voyage (${curr.startDate || ''} ~ ${curr.endDate || ''})\n\n`;
        
        const completedTasks = (curr.currentPace || []).filter(t => t.completed);
        const totalTasks = (curr.currentPace || []).length;
        const pct = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;
        
        md += `### 📈 Weekly Execution Orbits (Completion Rate: ${pct}%)\n`;
        if (curr.currentPace && curr.currentPace.length > 0) {
          curr.currentPace.forEach(t => {
            const status = t.completed ? '✅ [Completed]' : '⬜ [In Progress]';
            const cat = t.category || getSmartCategory(t.title).category;
            md += `- ${status} **${t.title}** \`${cat}\`\n`;
          });
        } else {
          md += `- No orbits configured yet.\n`;
        }
        md += `\n`;

        const currentStatement = diaryText || curr.statement;
        if (currentStatement) {
          md += `### ⚓ Weekly Contemplation (Captain's Log)\n`;
          md += `> ${currentStatement.replace(/\n/g, '\n> ')}\n\n`;
        }
        md += `---\n\n`;
      }

      if (data.timeline && data.timeline.length > 0) {
        md += `## 📜 Past Voyages\n\n`;
        data.timeline.forEach(week => {
          md += `### ⚓ [${week.weekId}] Weekly Record (${week.startDate} ~ ${week.endDate})\n\n`;
          
          md += `#### 🏃 Completed Orbits\n`;
          if (week.tasks && week.tasks.length > 0) {
            week.tasks.forEach(t => {
              const cat = t.category || getSmartCategory(t.title).category;
              md += `- ✅ **${t.title}** \`${cat}\`\n`;
            });
          } else {
            md += `- No orbits completed.\n`;
          }
          md += `\n`;

          if (week.statement) {
            md += `#### 💡 Weekly Contemplation (Captain's Log)\n`;
            md += `> ${week.statement.replace(/\n/g, '\n> ')}\n\n`;
          }
          md += `---\n\n`;
        });
      }
      
      md += `*This portfolio was automatically compiled and generated by [PriSincera Pace Note](https://www.prisincera.com/pacenote), helping you manage a sustainable and proactive journey of growth.*`;
      return md;
    }

    if (locale === 'ja') {
      let md = `# PriSincera AI 成長ポートフォリオ (Growth Portfolio)\n\n`;
      md += `- **成長の主体**: ${user?.displayName || '私の航海士'} (${user?.email || 'メールアドレスなし'})\n`;
      md += `- **生成日時**: ${new Date().toLocaleString()}\n`;
      md += `- **説明**: PriSincera Pace Noteを通じて構築した価値中心の軌跡と週次振り返りのコレクションです。単なるToDoリストを超え、実行と思索を整列させたあなただけのユニークなブランディングアセットです。\n\n`;
      md += `---\n\n`;

      const curr = data.current;
      if (curr) {
        md += `## ⛵ [${curr.weekId}] 현재 항해의 궤도 (${curr.startDate || ''} ~ ${curr.endDate || ''})\n\n`;
        
        const completedTasks = (curr.currentPace || []).filter(t => t.completed);
        const totalTasks = (curr.currentPace || []).length;
        const pct = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;
        
        md += `### 📈 今週の実行軌跡 (達成率: ${pct}%)\n`;
        if (curr.currentPace && curr.currentPace.length > 0) {
          curr.currentPace.forEach(t => {
            const status = t.completed ? '✅ [完了]' : '⬜ [進行中]';
            const cat = t.category || getSmartCategory(t.title).category;
            md += `- ${status} **${t.title}** \`${cat}\`\n`;
          });
        } else {
          md += `- 設定된 궤도가 아직 없습니다.\n`;
        }
        md += `\n`;

        const currentStatement = diaryText || curr.statement;
        if (currentStatement) {
          md += `### ⚓ 週次思索 (Captain's Log)\n`;
          md += `> ${currentStatement.replace(/\n/g, '\n> ')}\n\n`;
        }
        md += `---\n\n`;
      }

      if (data.timeline && data.timeline.length > 0) {
        md += `## 📜 過去の航海の栄光 (Past Voyages)\n\n`;
        data.timeline.forEach(week => {
          md += `### ⚓ [${week.weekId}] 週次記録 (${week.startDate} ~ ${week.endDate})\n\n`;
          
          md += `#### 🏃 達成した軌道\n`;
          if (week.tasks && week.tasks.length > 0) {
            week.tasks.forEach(t => {
              const cat = t.category || getSmartCategory(t.title).category;
              md += `- ✅ **${t.title}** \`${cat}\`\n`;
            });
          } else {
            md += `- 達成한 궤도가 없습니다.\n`;
          }
          md += `\n`;

          if (week.statement) {
            md += `#### 💡 週次思索 (Captain's Log)\n`;
            md += `> ${week.statement.replace(/\n/g, '\n> ')}\n\n`;
          }
          md += `---\n\n`;
        });
      }
      
      md += `*このポートフォリオは、[PriSincera Pace Note](https://www.prisincera.com/pacenote)を通じて持続可能で主体的な成長のプロセスを管理し、自動生成されました。*`;
      return md;
    }

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
          const cat = t.category || getSmartCategory(t.title).category;
          md += `- ${status} **${t.title}** \`${cat}\`\n`;
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
            const cat = t.category || getSmartCategory(t.title).category;
            md += `- ✅ **${t.title}** \`${cat}\`\n`;
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
          <p className="pacenote-subtitle" style={{ lineHeight: '1.6', whiteSpace: 'pre-line' }}>
            {t('paceNote.heroSubtitle')}
          </p>
          
          <div className="pacenote-auth-action" style={{ marginTop: '32px', textAlign: 'center' }}>
            {!userToken ? (
              <button className="btn-primary pacenote-auth-btn" onClick={handleLoginClick}>
                {t('paceNote.createMyPace')}
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
                  {t('paceNote.loggedCheer')}
                </div>
                <div style={{ marginTop: '16px' }}>
                  <button 
                    onClick={handleLogout}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'underline', opacity: 0.7 }}
                  >
                    {t('paceNote.stopLogging')}
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
            <p>{t('paceNote.loadingLog')}</p>
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
                
                // Apply smart categories when missing, then sort tasks: uncompleted first, completed last
                const sortedPaceList = paceList ? [...paceList].map(task => {
                  if (!task.category) {
                    const smart = getSmartCategory(task.title);
                    return { ...task, category: smart.category, color: smart.color };
                  }
                  return task;
                }).sort((a, b) => {
                  if (a.completed === b.completed) return 0;
                  return a.completed ? 1 : -1;
                }) : [];

                const weekInfo = parseWeekInfo(selectedWeekId);
                let titleText = t('paceNote.myPaceTitle');
                if (weekInfo.num) {
                  if (locale === 'en') {
                    titleText = `W${weekInfo.num} ${titleText}`;
                  } else if (locale === 'ja') {
                    titleText = `${weekInfo.num}週目 ${titleText}`;
                  } else {
                    titleText = `${weekInfo.num}주차 ${titleText}`;
                  }
                }

                return (
                  <>
                    <div className="pacenote-bento-card consolidated-pace-card">
                      {/* ── Unified Premium Header ── */}
                      <div className="pacenote-card-header consolidated-header">
                        <h2 className="consolidated-header-title">
                          {titleText}
                          {isCurrent && userToken && saveStatus === 'error' && (
                            <span className="auto-save-status error" style={{ marginLeft: '12px', verticalAlign: 'middle' }}>
                              {t('paceNote.saveError')}
                            </span>
                          )}
                        </h2>
                        <p className="pacenote-card-desc">
                          {isCurrent ? t('paceNote.currPaceDesc') : t('paceNote.pastPaceDesc')}
                        </p>
                      </div>
                      
                      {totalCount > 0 && (
                        <div className="pacenote-progress-container-new">
                          <div className="pacenote-progress-info-row">
                            <span className="pacenote-progress-label">{t('paceNote.actionProgress')}</span>
                            <span className="pacenote-progress-status-text">
                              🎯 {completedCount}/{totalCount} {t('paceNote.completed')} ({progressPercent}%)
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
                          <h3 className="panel-sub-title">{t('paceNote.actionOrbit')}</h3>
                          
                          {/* ── Omni-Orbit Trigger ── */}
                          {isCurrent && (
                            <button className="pacenote-omnibar-trigger" onClick={() => setShowOmniModal(true)}>
                              <span className="omnibar-icon">✨</span>
                              <span className="omnibar-placeholder">{t('paceNote.omnibarPlaceholder')}</span>
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
                              <div style={{ color: '#9CA3AF', fontStyle: 'italic', padding: '20px' }}>{t('paceNote.noOrbitsRecorded')}</div>
                            )}
                          </div>
                        </div>

                        {/* ── Vertical Divider ── */}
                        <div className="consolidated-vertical-divider"></div>

                        {/* ── Right Panel: Logbook ── */}
                        <div className="consolidated-right-panel">
                          <h3 className="panel-sub-title">{t('paceNote.retrospectionRecord')}</h3>
                          {isCurrent ? (
                            <div className="logbook-textarea-wrapper">
                              <textarea
                                className="logbook-textarea"
                                value={diaryText}
                                onChange={(e) => {
                                  if (!userToken) {
                                    alert(t('paceNote.loginToRecord'));
                                    return handleLoginClick();
                                  }
                                  if (e.target.value.length <= 1000) {
                                    setDiaryText(e.target.value);
                                  }
                                }}
                                placeholder={userToken ? t('paceNote.retrospectWritePlaceholder') : t('paceNote.retrospectReadPlaceholder')}
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
                                <span>{diaryText.length} / 1000{t('paceNote.charLimit')}</span>
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
                                  {t('paceNote.noRetrospectRecorded')}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* ── Card Footer with Export Button ── */}
                      {userToken && (
                        <div className="consolidated-card-footer">
                          <button className="btn-secondary pacenote-btn-export footer-export-btn" onClick={() => setShowExportModal(true)}>
                            {t('paceNote.exportBtn')}
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
          <div className="pacenote-loading">{t('paceNote.loadError')}</div>
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
                placeholder={t('paceNote.omnibarPlaceholder')}
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
                <button className="btn-primary omnibar-submit-btn" onClick={handleAddTask} disabled={addingTask}>
                  ↵ {t('paceNote.enterOrbit')}
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
                    {cat === 'All' ? t('paceNote.allCat') : labelMap[cat]}
                  </button>
                );
              })}
            </div>
            
            <div className="omnibar-dropdown-header">
              <span className="omnibar-dropdown-title">
                {newTaskTitle.trim() ? t('paceNote.searchOrRec') : t('paceNote.aiRecGuide')}
              </span>
              {!newTaskTitle.trim() && (
                <button className="btn-secondary omnibar-refresh-btn" onClick={refreshRecommendations} disabled={isRefreshingRecs}>
                  {isRefreshingRecs ? t('paceNote.refreshing') : t('paceNote.otherRecs')}
                </button>
              )}
            </div>
            <div className="omnibar-dropdown-list">
              {navigableItems.length === 0 ? (
                <div className="omnibar-empty">{t('paceNote.noMatchedRecs')}</div>
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
                          <div className="rec-title">"{item.title}" {t('paceNote.addDirectly')}</div>
                          <div className="rec-desc">{t('paceNote.addDirectlyDesc')}</div>
                        </div>
                        <div className="rec-action">{t('paceNote.addBtn')}</div>
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
                      <div className="rec-action">{t('paceNote.addBtn')}</div>
                    </div>
                  );
                })
              )}
            </div>

            {/* ── Shortcuts Guide Footer ── */}
            <div className="omni-modal-footer">
              <span className="footer-shortcut-item"><kbd>↑↓</kbd> {t('paceNote.shortcutMove')}</span>
              <span className="footer-shortcut-item"><kbd>Enter</kbd> {t('paceNote.shortcutAdd')}</span>
              <span className="footer-shortcut-item"><kbd>ESC</kbd> {t('paceNote.shortcutClose')}</span>
            </div>
          </div>
        </div>
      )}

      {/* ── AI Growth Portfolio Export Modal ── */}
      {showExportModal && (
        <div className="pacenote-modal-backdrop" onClick={() => setShowExportModal(false)}>
          <div className="pacenote-export-modal" onClick={e => e.stopPropagation()}>
            <div className="export-modal-header">
              <h3>{t('paceNote.exportModalTitle')}</h3>
              <button className="close-btn" onClick={() => setShowExportModal(false)}>×</button>
            </div>
            
            <div className="export-modal-body">
              <p className="export-desc">
                {t('paceNote.exportModalDesc')}
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
                {t('paceNote.downloadMd')}
              </button>
              <button className="export-btn btn-primary" onClick={handleCopyPortfolio}>
                {copyFeedback ? t('paceNote.copiedClipboard') : t('paceNote.copyClipboard')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
