import express from 'express';
import { db, auth } from './pipeline/src/lib/firestore.mjs';

const pacenoteRouter = express.Router();

// 미들웨어: Firebase Auth 토큰 검증
async function verifyUser(req, res, next) {
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await auth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// ISO 8601 Week Number 계산 함수
function getWeekNumber(d) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(),0,1));
  const weekNo = Math.ceil((((date - yearStart) / 86400000) + 1)/7);
  return `${date.getUTCFullYear()}-W${weekNo.toString().padStart(2, '0')}`;
}

function getWeekDateRange(weekStr) {
  const [yearStr, weekNumStr] = weekStr.split('-W');
  const year = parseInt(yearStr, 10);
  const week = parseInt(weekNumStr, 10);
  const simple = new Date(year, 0, 1 + (week - 1) * 7);
  const dow = simple.getDay();
  const ISOweekStart = simple;
  if (dow <= 4) ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
  else ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
  
  const end = new Date(ISOweekStart);
  end.setDate(ISOweekStart.getDate() + 6);
  
  return {
    start: ISOweekStart.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
}

// 다량의 추천 케이스 (지속 추천을 위한 풀)
const AI_RECOMMENDATION_POOL = [
  { id: 'rec-1', title: '아침 출근 전 30분 동안 온전히 나를 위한 명상하기', category: 'Mindset', color: '#34D399' },
  { id: 'rec-2', title: '이번 주 배운 내용을 바탕으로 링크드인에 인사이트 짧게 공유하기', category: 'Branding', color: '#60A5FA' },
  { id: 'rec-3', title: '스마트폰을 끄고 1시간 동안 종이책이나 긴 호흡의 아티클 읽기', category: 'Deep Work', color: '#FBBF24' },
  { id: 'rec-4', title: '관심 있는 분야의 오프라인 네트워킹 모임 찾아보기', category: 'Networking', color: '#A78BFA' },
  { id: 'rec-5', title: '평소 쓰지 않던 새로운 AI 툴 1가지 테스트해보고 후기 남기기', category: 'AI & Future', color: '#22D3EE' },
  { id: 'rec-6', title: '이번 주 나의 업무 프로세스 중 비효율적인 부분 1개 개선하기', category: 'Productivity', color: '#F472B6' },
  { id: 'rec-7', title: '10년 뒤 나의 커리어 모습을 상상하며 한 페이지 에세이 작성하기', category: 'Vision', color: '#818CF8' },
  { id: 'rec-8', title: '업무와 무관한 완전히 새로운 주제의 다큐멘터리 시청하기', category: 'Inspiration', color: '#FCD34D' },
  { id: 'rec-9', title: '이번 주 감사했던 일 3가지를 적고 주변 사람에게 표현하기', category: 'Mindset', color: '#34D399' },
  { id: 'rec-10', title: '책상과 작업 환경을 완전히 새롭게 정리정돈하기', category: 'Environment', color: '#9CA3AF' },
  { id: 'rec-11', title: "이번 주 가장 어려웠던 문제에 대해 '왜?'를 3번 반복하며 회고하기", category: 'Problem Solving', color: '#FB923C' },
  { id: 'rec-12', title: '평소 연락하지 않던 동료나 멘토에게 먼저 커피챗 제안하기', category: 'Networking', color: '#A78BFA' },
  { id: 'rec-13', title: '이번 주 알게 된 새로운 영단어나 비즈니스 용어 5개 완벽히 암기하기', category: 'Learning', color: '#60A5FA' },
  { id: 'rec-14', title: '잠들기 전 내일 가장 먼저 처리할 핵심 목표 1가지 적어두기', category: 'Productivity', color: '#F472B6' },
  { id: 'rec-15', title: '가벼운 산책을 하며 팟캐스트나 오디오북 청취하기', category: 'Health', color: '#4ADE80' }
];

// 추천 풀에서 필요한 개수만큼 부족한 추천을 채워주는 함수
function replenishRecommendations(currentPace = [], recommendedPace = [], pool = [], count = 3) {
  const currentIds = new Set(currentPace.map(p => p.id));
  const recIds = new Set(recommendedPace.map(p => p.id));
  let newRecs = [...recommendedPace];
  
  // 이미 목표나 추천에 없는 항목들 필터링
  const availablePool = pool.filter(item => !currentIds.has(item.id) && !recIds.has(item.id));
  
  // 랜덤 셔플
  availablePool.sort(() => 0.5 - Math.random());
  
  while (newRecs.length < count && availablePool.length > 0) {
    newRecs.push(availablePool.pop());
  }
  return newRecs;
}

// Daily Pool 조회 유틸 (Firestore에서 가져오되, 실패 시 하드코딩 배열 사용)
async function getDailyPool() {
  try {
    const doc = await db.collection('config').doc('pacenote_daily_pool').get();
    if (doc.exists && doc.data().pool) {
      return doc.data().pool;
    }
  } catch (err) {
    console.error('[PaceNote API] Failed to fetch daily pool from config, using fallback.', err.message);
  }
  return AI_RECOMMENDATION_POOL;
}

// 1. 유저의 Pace Note 데이터 조회 (현재 주간 + 과거 타임라인)
pacenoteRouter.get('/', verifyUser, async (req, res) => {
  try {
    const uid = req.user.uid;
    const email = req.user.email || '이메일 없음';
    const today = new Date();
    const currentWeekId = getWeekNumber(today);
    
    const userRef = db.collection('pacenotes').doc(uid);
    // 프론트엔드 로그인 세션(토큰)에서 확보한 이메일을 DB에 즉시 저장
    await userRef.set({ email, lastActive: new Date().toISOString() }, { merge: true });
    
    const weeksRef = userRef.collection('weeks');
    
    // 현재 주간 데이터 조회
    const currentDoc = await weeksRef.doc(currentWeekId).get();
    let currentWeekData = null;
    
    // DB 혹은 하드코딩 풀 가져오기
    const dailyPool = await getDailyPool();
    
    if (!currentDoc.exists) {
      // 데이터가 없으면 기본값 생성
      const { start, end } = getWeekDateRange(currentWeekId);
      const defaultCurrentPace = [
        { id: 'default-1', title: 'Daily Digest 오늘의 인사이트 1개 이상 읽기', completed: false },
        { id: 'default-2', title: '이번 주 AI 스터디 프롬프트 직접 실행해보기', completed: false },
        { id: 'default-3', title: '비즈니스 일본어 추천 문장 소리 내어 3번 읽기', completed: false },
        { id: 'default-4', title: 'Daily Digest의 S.I.G.N.A.L. 분석 코멘트 복습하기', completed: false },
        { id: 'default-5', title: '이번 주 관심 있었던 아티클 북마크 또는 메모 남기기', completed: false },
      ];
      
      currentWeekData = {
        weekId: currentWeekId,
        startDate: start,
        endDate: end,
        currentPace: defaultCurrentPace,
        recommendedPace: replenishRecommendations(defaultCurrentPace, [], dailyPool, 3),
        createdAt: new Date().toISOString()
      };
      await weeksRef.doc(currentWeekId).set(currentWeekData);
    } else {
      currentWeekData = currentDoc.data();
      // 지속적인 추천 UX 제공을 위해 항상 추천 항목이 3개 미만이면 채워줌
      const oldRecCount = (currentWeekData.recommendedPace || []).length;
      if (oldRecCount < 3) {
        currentWeekData.recommendedPace = replenishRecommendations(currentWeekData.currentPace, currentWeekData.recommendedPace || [], dailyPool, 3);
        await weeksRef.doc(currentWeekId).update({ recommendedPace: currentWeekData.recommendedPace });
      }
    }

    // 과거 데이터 (Timeline 용) - 최신순 10개
    const pastDocs = await weeksRef.where('weekId', '<', currentWeekId)
      .orderBy('weekId', 'desc')
      .limit(10)
      .get();
      
    const pastLogs = [];
    pastDocs.forEach(doc => {
      const data = doc.data();
      // 완료된 미션들만 타임라인에 표시
      const completedTasks = (data.currentPace || []).filter(t => t.completed);
      if (completedTasks.length > 0) {
        pastLogs.push({
          weekId: data.weekId,
          startDate: data.startDate,
          endDate: data.endDate,
          tasks: completedTasks
        });
      }
    });

    res.json({
      current: currentWeekData,
      timeline: pastLogs
    });
  } catch (err) {
    console.error('[PaceNote API] Get Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 1-1. 사용자 정의 미션 추가
pacenoteRouter.post('/add', verifyUser, async (req, res) => {
  try {
    const uid = req.user.uid;
    const { title } = req.body;
    if (!title || !title.trim()) return res.status(400).json({ error: 'title is required' });
    if (title.trim().length > 100) return res.status(400).json({ error: 'Title must be 100 characters or less' });

    const today = new Date();
    const currentWeekId = getWeekNumber(today);
    const docRef = db.collection('pacenotes').doc(uid).collection('weeks').doc(currentWeekId);
    
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ error: 'Week not found' });
    
    const data = doc.data();
    const currentPace = data.currentPace || [];
    
    const newTask = {
      id: `custom-${Date.now()}`,
      title: title.trim(),
      category: 'My Action',
      color: '#C4B5FD',
      completed: false
    };
    
    currentPace.push(newTask);
    await docRef.update({ currentPace });
    
    res.json({ success: true, currentPace });
  } catch (err) {
    console.error('[PaceNote API] Add Task Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 2. 현재 주간 미션 완료 상태 토글
pacenoteRouter.post('/toggle', verifyUser, async (req, res) => {
  try {
    const uid = req.user.uid;
    const { taskId } = req.body;
    
    if (!taskId) return res.status(400).json({ error: 'taskId is required' });

    const today = new Date();
    const currentWeekId = getWeekNumber(today);
    const docRef = db.collection('pacenotes').doc(uid).collection('weeks').doc(currentWeekId);
    
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ error: 'Week not found' });
    
    const data = doc.data();
    const currentPace = data.currentPace || [];
    
    const taskIndex = currentPace.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return res.status(404).json({ error: 'Task not found' });
    
    // Toggle
    currentPace[taskIndex].completed = !currentPace[taskIndex].completed;
    
    await docRef.update({ currentPace });
    res.json({ success: true, currentPace });
  } catch (err) {
    console.error('[PaceNote API] Toggle Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 3. 추천 미션을 내 궤도로 추가 (Accept)
pacenoteRouter.post('/accept', verifyUser, async (req, res) => {
  try {
    const uid = req.user.uid;
    const { taskId } = req.body;
    
    if (!taskId) return res.status(400).json({ error: 'taskId is required' });

    const today = new Date();
    const currentWeekId = getWeekNumber(today);
    const docRef = db.collection('pacenotes').doc(uid).collection('weeks').doc(currentWeekId);
    
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ error: 'Week not found' });
    
    const data = doc.data();
    let currentPace = data.currentPace || [];
    let recommendedPace = data.recommendedPace || [];
    
    const recIndex = recommendedPace.findIndex(t => t.id === taskId);
    if (recIndex === -1) return res.status(404).json({ error: 'Recommended task not found' });
    
    const taskToMove = recommendedPace[recIndex];
    
    // Remove from recommended, add to current
    recommendedPace.splice(recIndex, 1);
    currentPace.push({
      id: taskToMove.id,
      title: taskToMove.title,
      category: taskToMove.category,
      color: taskToMove.color,
      completed: false
    });
    
    // 부족해진 추천 항목을 다시 3개로 채움
    if (recommendedPace.length < 3) {
      const dailyPool = await getDailyPool();
      recommendedPace = replenishRecommendations(currentPace, recommendedPace, dailyPool, 3);
    }
    
    await docRef.update({ currentPace, recommendedPace });
    res.json({ success: true, currentPace, recommendedPace });
  } catch (err) {
    console.error('[PaceNote API] Accept Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default pacenoteRouter;
