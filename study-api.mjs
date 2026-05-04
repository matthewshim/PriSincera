import express from 'express';
import { db, auth, COLLECTIONS } from './pipeline/src/lib/firestore.mjs';
import { getStudyContent } from './pipeline/src/repositories/StudyRepository.mjs';

const studyRouter = express.Router();

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

// 1. 특정 날짜의 학습 콘텐츠 조회 (로그인 필수 아님, 누구나 볼 수 있음)
studyRouter.get('/daily/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const content = await getStudyContent(date);
    if (!content) {
      return res.status(404).json({ error: 'Content not found for this date' });
    }
    res.json(content);
  } catch (err) {
    console.error('[PriStudy API] Get Content Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 2. 유저의 학습 진행 상황(잔디) 조회
studyRouter.get('/progress', verifyUser, async (req, res) => {
  try {
    const uid = req.user.uid;
    const doc = await db.collection(COLLECTIONS.STUDY_PROGRESS).doc(uid).get();
    if (!doc.exists) {
      return res.json({ completed_dates: [], current_streak: 0, longest_streak: 0 });
    }
    res.json(doc.data());
  } catch (err) {
    console.error('[PriStudy API] Get Progress Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 3. 특정 날짜 학습 완료 처리
studyRouter.post('/progress/:date', verifyUser, async (req, res) => {
  try {
    const uid = req.user.uid;
    const { date } = req.params; // "YYYY-MM-DD"
    
    const docRef = db.collection(COLLECTIONS.STUDY_PROGRESS).doc(uid);
    const doc = await docRef.get();
    
    let progress = doc.exists ? doc.data() : {
      completed_dates: [],
      current_streak: 0,
      longest_streak: 0,
      last_study_date: null,
      email: req.user.email || 'unknown',
    };

    if (!progress.completed_dates.includes(date)) {
      progress.completed_dates.push(date);
      // 간단한 스트릭 계산 로직 (MVP: 날짜만 단순히 추가)
      progress.last_study_date = date;
      progress.email = req.user.email || progress.email || 'unknown';
      progress.current_streak += 1;
      if (progress.current_streak > progress.longest_streak) {
        progress.longest_streak = progress.current_streak;
      }
      
      await docRef.set(progress, { merge: true });
    }
    
    res.json({ success: true, progress });
  } catch (err) {
    console.error('[PriStudy API] Update Progress Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default studyRouter;
