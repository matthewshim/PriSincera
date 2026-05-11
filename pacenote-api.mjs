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

// 임시 추천 데이터 (나중에 AI 자동화 파이프라인으로 대체)
// 외부/주도적 액션 위주
const DUMMY_RECOMMENDATIONS = [
  { id: 'rec-1', title: '아침 출근 전 30분 동안 온전히 나를 위한 명상하기', category: 'Mindset', color: '#34D399' },
  { id: 'rec-2', title: '이번 주 배운 내용을 바탕으로 링크드인에 인사이트 짧게 공유하기', category: 'Branding', color: '#60A5FA' },
  { id: 'rec-3', title: '스마트폰을 끄고 1시간 동안 종이책이나 긴 호흡의 아티클 읽기', category: 'Deep Work', color: '#FBBF24' },
];

// 1. 유저의 Pace Note 데이터 조회 (현재 주간 + 과거 타임라인)
pacenoteRouter.get('/', verifyUser, async (req, res) => {
  try {
    const uid = req.user.uid;
    const today = new Date();
    const currentWeekId = getWeekNumber(today);
    
    const userRef = db.collection('pacenotes').doc(uid);
    const weeksRef = userRef.collection('weeks');
    
    // 현재 주간 데이터 조회
    const currentDoc = await weeksRef.doc(currentWeekId).get();
    let currentWeekData = null;
    
    if (!currentDoc.exists) {
      // 데이터가 없으면 기본값 생성
      const { start, end } = getWeekDateRange(currentWeekId);
      currentWeekData = {
        weekId: currentWeekId,
        startDate: start,
        endDate: end,
        currentPace: [
          { id: 'default-1', title: 'Daily Digest 오늘의 인사이트 1개 이상 읽기', completed: false },
          { id: 'default-2', title: '이번 주 AI 스터디 프롬프트 직접 실행해보기', completed: false },
          { id: 'default-3', title: '비즈니스 일본어 추천 문장 소리 내어 3번 읽기', completed: false },
          { id: 'default-4', title: 'Daily Digest의 S.I.G.N.A.L. 분석 코멘트 복습하기', completed: false },
          { id: 'default-5', title: '이번 주 관심 있었던 아티클 북마크 또는 메모 남기기', completed: false },
        ],
        recommendedPace: DUMMY_RECOMMENDATIONS,
        createdAt: new Date().toISOString()
      };
      await weeksRef.doc(currentWeekId).set(currentWeekData);
    } else {
      currentWeekData = currentDoc.data();
      // 만약 과거 로직으로 인해 recommendedPace가 없고, 현재 궤도에도 DUMMY가 없다면 다시 채워줌
      if (!currentWeekData.recommendedPace || currentWeekData.recommendedPace.length === 0) {
        const currentPaceIds = (currentWeekData.currentPace || []).map(p => p.id);
        const missingRecommendations = DUMMY_RECOMMENDATIONS.filter(rec => !currentPaceIds.includes(rec.id));
        if (missingRecommendations.length > 0) {
          currentWeekData.recommendedPace = missingRecommendations;
          await weeksRef.doc(currentWeekId).update({ recommendedPace: missingRecommendations });
        }
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
    
    await docRef.update({ currentPace, recommendedPace });
    res.json({ success: true, currentPace, recommendedPace });
  } catch (err) {
    console.error('[PaceNote API] Accept Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default pacenoteRouter;
