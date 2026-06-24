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

// 스마트 카테고리 매퍼 함수 (제목 기반 자동 매핑)
function getSmartCategory(title) {
  const t = (typeof title === 'object' ? (title.ko || title.en || title.ja || '') : (title || '')).toLowerCase();
  
  if (
    t.includes('달리기') || t.includes('운동') || t.includes('스트레칭') || t.includes('일어나기') || t.includes('명상') || t.includes('건강') || t.includes('식단') || t.includes('수면') || t.includes('헬스') || t.includes('산책') || t.includes('조깅') ||
    t.includes('run') || t.includes('exercise') || t.includes('stretch') || t.includes('wake up') || t.includes('meditat') || t.includes('health') || t.includes('diet') || t.includes('sleep') || t.includes('fitness') || t.includes('walk') || t.includes('jog') ||
    t.includes('走る') || t.includes('運動') || t.includes('ストレッチ') || t.includes('起きる') || t.includes('瞑想') || t.includes('健康') || t.includes('食事') || t.includes('睡眠') || t.includes('ジム') || t.includes('散歩') || t.includes('ジョギング')
  ) {
    return { category: 'Health', color: '#10B981' }; // Emerald Green
  }
  if (
    t.includes('회고') || t.includes('업무') || t.includes('코딩') || t.includes('개발') || t.includes('자동화') || t.includes('작업') || t.includes('프로젝트') || t.includes('계획') || t.includes('우선순위') || t.includes('시간 관리') || t.includes('정리') || t.includes('복습') || t.includes('수정') || t.includes('테스트') ||
    t.includes('retrospective') || t.includes('review') || t.includes('work') || t.includes('code') || t.includes('develop') || t.includes('automat') || t.includes('task') || t.includes('project') || t.includes('plan') || t.includes('priorit') || t.includes('time manage') || t.includes('organiz') || t.includes('tid') || t.includes('fix') || t.includes('test') ||
    t.includes('振り返り') || t.includes('業務') || t.includes('コーディング') || t.includes('開発') || t.includes('自動化') || t.includes('作業') || t.includes('プロジェクト') || t.includes('計画') || t.includes('優先順位') || t.includes('時間管理') || t.includes('整理') || t.includes('復習') || t.includes('修正') || t.includes('テスト')
  ) {
    return { category: 'Productivity', color: '#F472B6' }; // Rose Pink
  }
  if (
    t.includes('감사') || t.includes('마인드') || t.includes('일기') || t.includes('생각') || t.includes('회상') || t.includes('긍정') || t.includes('행복') || t.includes('사색') || t.includes('인사이트') ||
    t.includes('gratitud') || t.includes('thank') || t.includes('mindset') || t.includes('diary') || t.includes('journal') || t.includes('thought') || t.includes('positive') || t.includes('happi') || t.includes('contemplat') || t.includes('insight') ||
    t.includes('感謝') || t.includes('マインド') || t.includes('日記') || t.includes('考え') || t.includes('回想') || t.includes('肯定的') || t.includes('幸せ') || t.includes('思索') || t.includes('インサイト')
  ) {
    return { category: 'Mindset', color: '#34D399' }; // Mint Green
  }
  if (
    t.includes('아티클') || t.includes('공부') || t.includes('학습') || t.includes('독서') || t.includes('책') || t.includes('강의') || t.includes('리서치') || t.includes('공유') || t.includes('배움') || t.includes('일본어') || t.includes('영어') || t.includes('암기') || t.includes('읽기') || t.includes('스터디') || t.includes('북마크') || t.includes('메모') ||
    t.includes('article') || t.includes('stud') || t.includes('learn') || t.includes('read') || t.includes('book') || t.includes('lectur') || t.includes('research') || t.includes('share') || t.includes('memoriz') || t.includes('bookmark') || t.includes('memo') ||
    t.includes('記事') || t.includes('勉強') || t.includes('学習') || t.includes('読書') || t.includes('本') || t.includes('講義') || t.includes('リサーチ') || t.includes('共有') || t.includes('学び') || t.includes('日本語') || t.includes('英語') || t.includes('暗記') || t.includes('読む') || t.includes('スタディ') || t.includes('ブックマーク') || t.includes('メモ')
  ) {
    return { category: 'Learning', color: '#60A5FA' }; // Sky Blue
  }
  if (
    t.includes('동료') || t.includes('피드백') || t.includes('연락') || t.includes('지인') || t.includes('커피챗') || t.includes('소통') || t.includes('회의') || t.includes('네트워킹') || t.includes('인사') ||
    t.includes('colleague') || t.includes('feedback') || t.includes('contact') || t.includes('coffee chat') || t.includes('communicat') || t.includes('meet') || t.includes('network') ||
    t.includes('同僚') || t.includes('フィードバック') || t.includes('連絡') || t.includes('知人') || t.includes('コーヒーチャット') || t.includes('コミュニケーション') || t.includes('会議') || t.includes('ネットワーキング') || t.includes('挨拶')
  ) {
    return { category: 'Networking', color: '#A78BFA' }; // Lavender Purple
  }
  
  // Default fallback
  return { category: 'Life', color: '#C084FC' }; // Purple Accent
}

// 다량의 추천 케이스 (지속 추천을 위한 풀)
const AI_RECOMMENDATION_POOL = [
  {
    id: 'rec-1',
    title: {
      ko: '아침 출근 전 30분 동안 온전히 나를 위한 명상하기',
      en: 'Meditate for 30 minutes entirely for myself before work',
      ja: '朝の出勤前の30分間、完全に自分のための瞑想をする'
    },
    category: 'Mindset',
    color: '#34D399'
  },
  {
    id: 'rec-2',
    title: {
      ko: '이번 주 배운 내용을 바탕으로 링크드인에 인사이트 짧게 공유하기',
      en: 'Share a brief insight on LinkedIn based on what you learned this week',
      ja: '今週学んだ内容を基に、LinkedInに短いインサイトを共有する'
    },
    category: 'Branding',
    color: '#60A5FA'
  },
  {
    id: 'rec-3',
    title: {
      ko: '스마트폰을 끄고 1시간 동안 종이책이나 긴 호흡의 아티클 읽기',
      en: 'Turn off your smartphone and read a paper book or a long-form article for 1 hour',
      ja: 'スマートフォンをオフにして、1時間紙の本や長文の記事を読む'
    },
    category: 'Deep Work',
    color: '#FBBF24'
  },
  {
    id: 'rec-4',
    title: {
      ko: '관심 있는 분야의 오프라인 네트워킹 모임 찾아보기',
      en: 'Look up offline networking meetups in your area of interest',
      ja: '興味のある分野のオフラインネットワーキングの集まりを探す'
    },
    category: 'Networking',
    color: '#A78BFA'
  },
  {
    id: 'rec-5',
    title: {
      ko: '평소 쓰지 않던 새로운 AI 툴 1가지 테스트해보고 후기 남기기',
      en: "Test 1 new AI tool you haven't used before and write a brief review",
      ja: '普段使っていない新しいAIツールを1つ测试してレビューを残す'
    },
    category: 'AI & Future',
    color: '#22D3EE'
  },
  {
    id: 'rec-6',
    title: {
      ko: '이번 주 나의 업무 프로세스 중 비효율적인 부분 1개 개선하기',
      en: 'Improve 1 inefficient part of your work process this week',
      ja: '今週の自分の業務プロセスの中から非効率な部分を1つ改善する'
    },
    category: 'Productivity',
    color: '#F472B6'
  },
  {
    id: 'rec-7',
    title: {
      ko: '10년 뒤 나의 커리어 모습을 상상하며 한 페이지 에세이 작성하기',
      en: 'Write a one-page essay imagining your career 10 years from now',
      ja: '10年後の自分のキャリアの姿を想像しながら、1ページのエッセイを書く'
    },
    category: 'Vision',
    color: '#A5B4FC'
  },
  {
    id: 'rec-8',
    title: {
      ko: '업무와 무관한 완전히 새로운 주제의 다큐멘터리 시청하기',
      en: 'Watch a documentary on a completely new topic unrelated to work',
      ja: '業務とは関係のない完全に新しいテーマのドキュメンタリーを視聴する'
    },
    category: 'Inspiration',
    color: '#FCD34D'
  },
  {
    id: 'rec-9',
    title: {
      ko: '이번 주 감사했던 일 3가지를 적고 주변 사람에게 표현하기',
      en: 'Write down 3 things you were grateful for this week and express them',
      ja: '今週感謝したことを3つ書き出し、周囲の人に伝える'
    },
    category: 'Mindset',
    color: '#34D399'
  },
  {
    id: 'rec-10',
    title: {
      ko: '책상과 작업 환경을 완전히 새롭게 정리정돈하기',
      en: 'Completely organize and tidy up your desk and work environment',
      ja: 'デスクと作業環境を完全に新しく整理整頓する'
    },
    category: 'Environment',
    color: '#9CA3AF'
  },
  {
    id: 'rec-11',
    title: {
      ko: "이번 주 가장 어려웠던 문제에 대해 '왜?'를 3번 반복하며 회고하기",
      en: "Review the most difficult problem this week by asking 'Why?' three times",
      ja: "今週最も難しかった問題について、「なぜ？」を3回繰り返して振り返る"
    },
    category: 'Problem Solving',
    color: '#FB923C'
  },
  {
    id: 'rec-12',
    title: {
      ko: '평소 연락하지 않던 동료나 멘토에게 먼저 커피챗 제안하기',
      en: "Suggest a coffee chat to a colleague or mentor you haven't contacted in a while",
      ja: '普段連絡を取っていない同僚やメンターにまずコーヒーチャットを提案する'
    },
    category: 'Networking',
    color: '#A78BFA'
  },
  {
    id: 'rec-13',
    title: {
      ko: '이번 주 알게 된 새로운 영단어나 비즈니스 용어 5개 완벽히 암기하기',
      en: 'Perfectize your memory of 5 new English words or business terms learned this week',
      ja: '今週新しく知った英単語やビジネス用語を5つ完全に暗記する'
    },
    category: 'Learning',
    color: '#60A5FA'
  },
  {
    id: 'rec-14',
    title: {
      ko: '잠들기 전 내일 가장 먼저 처리할 핵심 목표 1가지 적어두기',
      en: 'Write down 1 key goal to tackle first thing tomorrow before going to bed',
      ja: '眠る前に、明日最優先で処理する核心目標を1つ書き留めておく'
    },
    category: 'Productivity',
    color: '#F472B6'
  },
  {
    id: 'rec-15',
    title: {
      ko: '가벼운 산책을 하며 팟캐스트나 오디오북 청취하기',
      en: 'Listen to a podcast or audiobook while taking a light walk',
      ja: '軽い散歩をしながらポッドキャストやオーディオブックを聴く'
    },
    category: 'Health',
    color: '#4ADE80'
  }
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

// 다국어 제목 파싱 및 로컬라이제이션 헬퍼
const localizeTitle = (title, locale) => {
  if (!title) return '';
  if (typeof title === 'object') {
    return title[locale] || title['ko'] || '';
  }
  return title;
};

const localizeTask = (task, locale) => {
  return {
    ...task,
    title: localizeTitle(task.title, locale)
  };
};

// 테크 트랙 도메인 → PaceNote 카테고리/색상 (디자인 시스템 토큰 정합)
const TRACK_DOMAIN_META = {
  ai_llm:        { category: 'AI/LLM',        color: '#22D3EE' },  // Aether Cyan
  system_design: { category: 'System Design', color: '#A5B4FC' },  // Nebula Indigo
  devops:        { category: 'DevOps',        color: '#34D399' },  // Mint
  tech_lead:     { category: 'Tech Lead',     color: '#E5B25D' },  // Starlight Gold
};

// Click-to-Orbit: action_challenge의 각 항목(N개)을 각각 1개의 궤도(flat task)로 변환.
// 카테고리/색상은 테크 트랙 도메인에 맞춘다. (subtask 체크리스트 정책 폐지)
export function buildOrbitTasks(actionChallenge, domain) {
  const ac = actionChallenge || {};
  const rawTasks = Array.isArray(ac.tasks) ? ac.tasks : [];
  const items = rawTasks
    .map(t => (typeof t === 'object' ? (t.text || '') : t).toString().trim())
    .filter(Boolean);
  if (items.length === 0) throw new Error('action_challenge.tasks is required');

  const meta = TRACK_DOMAIN_META[domain] || { category: 'Tech Track', color: '#A5B4FC' };
  const base = ac.id ? `orbit-${ac.id}` : `orbit-${Date.now()}`;

  return items.map((text, i) => ({
    id: `${base}-${i + 1}`,
    title: text,
    category: meta.category,
    color: meta.color,
    completed: false,
  }));
}

// 기본 주차 문서 생성 (GET / 와 add-orbit 공통 — 미존재 주차 자동 초기화)
export function buildDefaultWeek(weekId, dailyPool) {
  const { start, end } = getWeekDateRange(weekId);
  const defaultCurrentPace = [
    {
      id: 'default-1',
      title: {
        ko: 'Daily Digest 오늘의 인사이트 1개 이상 읽기',
        en: 'Read 1 or more daily insights in Daily Digest',
        ja: 'Daily Digest 今日のインサイトを1つ以上読む'
      },
      category: 'Learning', color: '#60A5FA', completed: false
    },
    {
      id: 'default-2',
      title: {
        ko: '이번 주 AI 스터디 프롬프트 직접 실행해보기',
        en: "Try running this week's AI study prompt yourself",
        ja: '今週のAIスタディプロンプトを直接実行してみる'
      },
      category: 'Learning', color: '#60A5FA', completed: false
    },
    {
      id: 'default-3',
      title: {
        ko: '비즈니스 일본어 추천 문장 소리 내어 3번 읽기',
        en: 'Read the recommended business Japanese sentence aloud 3 times',
        ja: 'ビジネス日本語の推奨文章を声に出して3回読む'
      },
      category: 'Learning', color: '#60A5FA', completed: false
    },
    {
      id: 'default-4',
      title: {
        ko: 'Daily Digest의 S.I.G.N.A.L. 분석 코멘트 복습하기',
        en: 'Review S.I.G.N.A.L. analysis comments in Daily Digest',
        ja: 'Daily DigestのS.I.G.N.A.L.分析コメントを復習する'
      },
      category: 'Productivity', color: '#F472B6', completed: false
    },
    {
      id: 'default-5',
      title: {
        ko: '이번 주 관심 있었던 아티클 북마크 또는 메모 남기기',
        en: 'Bookmark or take a note on an article of interest this week',
        ja: '今週興味を持った記事にブックマークまたはメモを残す'
      },
      category: 'Learning', color: '#60A5FA', completed: false
    }
  ];
  return {
    weekId,
    startDate: start,
    endDate: end,
    currentPace: defaultCurrentPace,
    recommendedPace: replenishRecommendations(defaultCurrentPace, [], dailyPool, 3),
    statement: '',
    createdAt: new Date().toISOString()
  };
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
      // 데이터가 없으면 기본값 생성 (add-orbit과 공통 헬퍼 사용)
      currentWeekData = buildDefaultWeek(currentWeekId, dailyPool);
      await weeksRef.doc(currentWeekId).set(currentWeekData);
    } else {
      currentWeekData = currentDoc.data();
      if (!currentWeekData.hasOwnProperty('statement')) {
        currentWeekData.statement = '';
      }
      
      // 기존 저장된 데이터 중 카테고리가 누락된 항목이 있다면 보정
      if (currentWeekData.currentPace) {
        currentWeekData.currentPace = currentWeekData.currentPace.map(task => {
          if (!task.category) {
            const smart = getSmartCategory(task.title);
            return { ...task, category: smart.category, color: smart.color };
          }
          return task;
        });
      }
      
      // 지속적인 추천 UX 제공을 위해 항상 추천 항목이 3개 미만이면 채워줌
      const oldRecCount = (currentWeekData.recommendedPace || []).length;
      if (oldRecCount < 3) {
        currentWeekData.recommendedPace = replenishRecommendations(currentWeekData.currentPace, currentWeekData.recommendedPace || [], dailyPool, 3);
        await weeksRef.doc(currentWeekId).update({ recommendedPace: currentWeekData.recommendedPace });
      }
    }

    // 과거 데이터 (Timeline 용) - 최신순 10개 내외를 가져오되,
    // 복합 인덱스(Composite Index) 배포 번거로움을 피하기 위해 range filter(<) 없이
    // 기본 단일 필드 인덱스를 사용하는 orderBy만 적용한 뒤 메모리 상에서 필터링합니다.
    const pastDocs = await weeksRef
      .orderBy('weekId', 'desc')
      .limit(20)
      .get();
      
    const pastLogs = [];
    pastDocs.forEach(doc => {
      const data = doc.data();
      // 현재 주차 및 혹시 모를 미래 주차는 과거 타임라인에서 제외
      if (data.weekId >= currentWeekId) {
        return;
      }
      // 최대 10개만 타임라인에 노출
      if (pastLogs.length >= 10) {
        return;
      }
      // 완료된 미션들만 타임라인에 표시
      let completedTasks = (data.currentPace || []).filter(t => t.completed);
      if (completedTasks.length > 0) {
        // 과거 데이터의 카테고리 누락 보정
        completedTasks = completedTasks.map(task => {
          if (!task.category) {
            const smart = getSmartCategory(task.title);
            return { ...task, category: smart.category, color: smart.color };
          }
          return task;
        });
        pastLogs.push({
          weekId: data.weekId,
          startDate: data.startDate,
          endDate: data.endDate,
          tasks: completedTasks,
          statement: data.statement || ''
        });
      }
    });

    // 클라이언트 언어 환경에 맞게 제목 평탄화(Flatten)하여 전달
    const localizedCurrent = {
      ...currentWeekData,
      currentPace: (currentWeekData.currentPace || []).map(t => localizeTask(t, req.locale)),
      recommendedPace: (currentWeekData.recommendedPace || []).map(t => localizeTask(t, req.locale))
    };
    
    const localizedTimeline = pastLogs.map(log => ({
      ...log,
      tasks: (log.tasks || []).map(t => localizeTask(t, req.locale))
    }));

    res.json({
      current: localizedCurrent,
      timeline: localizedTimeline
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
    
    const smart = getSmartCategory(title.trim());
    const newTask = {
      id: `custom-${Date.now()}`,
      title: title.trim(),
      category: smart.category,
      color: smart.color,
      completed: false
    };
    
    currentPace.push(newTask);
    await docRef.update({ currentPace });
    
    res.json({ success: true, currentPace: currentPace.map(t => localizeTask(t, req.locale)) });
  } catch (err) {
    console.error('[PaceNote API] Add Task Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 1-2. Click-to-Orbit: 데일리 카드의 action_challenge를 주간 오빗으로 주입 (계약 §2.2)
pacenoteRouter.post('/add-orbit', verifyUser, async (req, res) => {
  try {
    const uid = req.user.uid;
    const { action_challenge, domain } = req.body;
    if (!action_challenge || !Array.isArray(action_challenge.tasks) || action_challenge.tasks.length === 0) {
      return res.status(400).json({ error: 'action_challenge with tasks is required' });
    }

    let orbits;
    try {
      orbits = buildOrbitTasks(action_challenge, domain);  // N개 flat task (도메인 카테고리)
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }

    const today = new Date();
    const currentWeekId = getWeekNumber(today);
    const docRef = db.collection('pacenotes').doc(uid).collection('weeks').doc(currentWeekId);

    const doc = await docRef.get();

    // 이번 주 PaceNote를 아직 열지 않아 week 문서가 없으면 기본 주차를 자동 생성 후 주입
    if (!doc.exists) {
      const dailyPool = await getDailyPool();
      const week = buildDefaultWeek(currentWeekId, dailyPool);
      week.currentPace.push(...orbits);
      await docRef.set(week);
      return res.json({ success: true, added: orbits.length, currentPace: week.currentPace.map(t => localizeTask(t, req.locale)) });
    }

    const data = doc.data();
    const currentPace = data.currentPace || [];

    // 이미 추가된 항목은 제외하고 신규만 주입 (멱등)
    const existingIds = new Set(currentPace.map(t => t.id));
    const fresh = orbits.filter(o => !existingIds.has(o.id));
    if (fresh.length === 0) {
      return res.status(409).json({ error: 'Orbits already added', currentPace: currentPace.map(t => localizeTask(t, req.locale)) });
    }

    currentPace.push(...fresh);
    await docRef.update({ currentPace });

    res.json({ success: true, added: fresh.length, currentPace: currentPace.map(t => localizeTask(t, req.locale)) });
  } catch (err) {
    console.error('[PaceNote API] Add Orbit Error:', err);
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
    res.json({ success: true, currentPace: currentPace.map(t => localizeTask(t, req.locale)) });
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
    res.json({
      success: true,
      currentPace: currentPace.map(t => localizeTask(t, req.locale)),
      recommendedPace: recommendedPace.map(t => localizeTask(t, req.locale))
    });
  } catch (err) {
    console.error('[PaceNote API] Accept Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 4. 주간 회고/일기 작성 및 저장
pacenoteRouter.post('/diary', verifyUser, async (req, res) => {
  try {
    const uid = req.user.uid;
    const { statement } = req.body;
    
    if (statement && statement.length > 1000) {
      return res.status(400).json({ error: 'Diary entry must be 1000 characters or less' });
    }

    const today = new Date();
    const currentWeekId = getWeekNumber(today);
    const docRef = db.collection('pacenotes').doc(uid).collection('weeks').doc(currentWeekId);
    
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ error: 'Week not found' });
    
    const cleanStatement = statement ? statement.trim() : '';
    await docRef.update({ statement: cleanStatement });
    
    res.json({ success: true, statement: cleanStatement });
  } catch (err) {
    console.error('[PaceNote API] Save Diary Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default pacenoteRouter;

