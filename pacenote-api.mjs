import express from 'express';
import { db, auth } from './pipeline/src/lib/firestore.mjs';
import { FieldValue } from 'firebase-admin/firestore';

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

// KST 일자 ID (YYYY-MM-DD) — 활동 문서 특정 (일자축 Phase 3: weeks/{weekId} → days/{date})
function getDayId(d = new Date()) {
  return new Date(d.getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

// 오늘(KST)의 활동 문서 참조 — 모든 핸들러 공통
function todayActivityRef(uid) {
  const dayId = getDayId();
  return { dayId, docRef: db.collection('pacenotes').doc(uid).collection('days').doc(dayId) };
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
// Phase 2: affinity 인지형 추천 — 유저 강점 도메인 위주 + 마지막 1개는 스트레치(약점/미접촉).
// affinity 미제공(콜드 스타트) 시 기존 랜덤 동작과 동일.
function replenishRecommendations(currentPace = [], recommendedPace = [], pool = [], count = 3, affinity = null) {
  const currentIds = new Set(currentPace.map(p => p.id));
  const recIds = new Set(recommendedPace.map(p => p.id));
  const newRecs = [...recommendedPace];
  const need = count - newRecs.length;
  if (need <= 0) return newRecs;

  const available = pool.filter(item => !currentIds.has(item.id) && !recIds.has(item.id));
  available.sort(() => 0.5 - Math.random()); // 동점 무작위화

  // 콜드 스타트(프로파일 없음) → 기존 랜덤 동작 유지
  const hasAffinity = affinity && Object.keys(affinity).length > 0;
  if (!hasAffinity) {
    while (newRecs.length < count && available.length > 0) newRecs.push(available.pop());
    return newRecs;
  }

  const score = (item) => affinity[affinityKey(item.category)] || 0;
  const byStrong = [...available].sort((a, b) => score(b) - score(a));   // 강점 우선
  const byStretch = [...available].sort((a, b) => score(a) - score(b));  // 약점(스트레치) 우선

  const stretchSlots = need >= 2 ? 1 : 0;  // 2개 이상 채울 때만 스트레치 1개 확보
  const strongSlots = need - stretchSlots;
  const chosen = [];
  const taken = new Set();
  const take = (item) => { if (item && !taken.has(item.id)) { taken.add(item.id); chosen.push(item); } };

  for (const item of byStrong)  { if (chosen.length >= strongSlots) break; take(item); }
  for (const item of byStretch) { if (chosen.length >= need) break; take(item); }
  for (const item of available) { if (chosen.length >= need) break; take(item); } // 폴백

  return [...newRecs, ...chosen.slice(0, need)];
}

// 유저 affinity(도메인 선호) 조회 — 추천 개인화 입력. 실패/부재 시 null(랜덤 폴백).
async function getAffinity(uid) {
  try {
    const snap = await db.collection('pacenotes').doc(uid).get();
    return (snap.exists && snap.data().profile?.domainAffinity) || null;
  } catch {
    return null;
  }
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

// 레거시 주차 키 'YYYY-Www' → 그 주 월요일 'YYYY-MM-DD' (회고 정렬 정규화용). 일자 키·비주차 문자열은 null.
function isoWeekMonday(key) {
  const m = /^(\d{4})-W(\d{2})$/.exec(String(key));
  if (!m) return null;
  const [y, w] = [Number(m[1]), Number(m[2])];
  const jan4 = new Date(Date.UTC(y, 0, 4));                 // ISO 1주는 항상 1/4 포함
  const week1Mon = new Date(jan4); week1Mon.setUTCDate(jan4.getUTCDate() - ((jan4.getUTCDay() + 6) % 7));
  const mon = new Date(week1Mon); mon.setUTCDate(week1Mon.getUTCDate() + (w - 1) * 7);
  return mon.toISOString().slice(0, 10);
}

// 카테고리 누락 궤도 보정 — GET /·GET /day/:date 공통 (과거 데이터 자가치유)
const fixCategories = (tasks = []) => tasks.map(task => {
  if (task.category) return task;
  const smart = getSmartCategory(task.title);
  return { ...task, category: smart.category, color: smart.color };
});

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
    // 끝 마침표/말줄임표 제거 — 기존 궤도 톤('~하기')과 일관되게
    .map(t => (typeof t === 'object' ? (t.text || '') : t).toString().trim().replace(/[.。…]+$/u, '').trim())
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

// 기본 일자 문서 생성 (GET / 와 쓰기 핸들러 공통 — 미존재 일자 자동 초기화)
// "매일 제로에서": 기본 궤도 주입 없이 빈 궤도 + 추천 3개로 시작한다.
// (주 컨테이너 시절의 default-* 5궤도는 일 단위에선 매일 재주입되어 picked 통계 왜곡·완료 부담 — 폐지)
export function buildDefaultDay(date, dailyPool, affinity = null) {
  return {
    date,
    currentPace: [],
    recommendedPace: replenishRecommendations([], [], dailyPool, 3, affinity),
    statement: '',
    createdAt: new Date().toISOString()
  };
}

// ─── 성장 신호 적재 (Growth Loop Phase 0) ──────────────────────────────
// 유저 행동(선택/완료/회고)을 pacenotes/{uid}.profile 에 증분 병합한다.
// best-effort: 신호 적재 실패가 핵심 기능을 막지 않는다.
// 정확한 권위 값은 야간 reconcile(pacenote-composer Phase 1)이 보정한다.
function affinityKey(category) {
  return String(category || 'general').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'general';
}

async function recordSignal(uid, { affinity = [], pickedDelta = 0, completedDelta = 0, reflection = null } = {}) {
  try {
    const profile = { updatedAt: new Date().toISOString() };
    if (affinity.length) {
      profile.domainAffinity = {};
      for (const { category, weight } of affinity) {
        if (!weight) continue;
        profile.domainAffinity[affinityKey(category)] = FieldValue.increment(weight);
      }
    }
    if (pickedDelta) (profile.completion ||= {}).picked = FieldValue.increment(pickedDelta);
    if (completedDelta) (profile.completion ||= {}).completed = FieldValue.increment(completedDelta);
    if (reflection && reflection.id && reflection.text) {
      profile.reflections = { [reflection.id]: { text: reflection.text, ts: new Date().toISOString() } };
    }
    await db.collection('pacenotes').doc(uid).set({ profile }, { merge: true });
  } catch (e) {
    console.warn('[PaceNote API] recordSignal failed:', e.message);
  }
}

// 1. 유저의 Pace Note 데이터 조회 (현재 주간 + 과거 타임라인)
pacenoteRouter.get('/', verifyUser, async (req, res) => {
  try {
    const uid = req.user.uid;
    const email = req.user.email || '이메일 없음';
    const dayId = getDayId();

    const userRef = db.collection('pacenotes').doc(uid);
    // 프론트엔드 로그인 세션(토큰)에서 확보한 이메일을 DB에 즉시 저장
    await userRef.set({ email, lastActive: new Date().toISOString() }, { merge: true });

    const daysRef = userRef.collection('days');

    // 오늘 활동 문서 조회
    const currentDoc = await daysRef.doc(dayId).get();
    let currentDayData = null;

    // DB 혹은 하드코딩 풀 가져오기
    const dailyPool = await getDailyPool();

    if (!currentDoc.exists) {
      // 문서가 없으면 기본값 생성 — 빈 궤도 + affinity 추천 3개
      const affinity = await getAffinity(uid);
      currentDayData = buildDefaultDay(dayId, dailyPool, affinity);
      await daysRef.doc(dayId).set(currentDayData);
    } else {
      currentDayData = currentDoc.data();
      if (!currentDayData.hasOwnProperty('statement')) {
        currentDayData.statement = '';
      }

      // 기존 저장된 데이터 중 카테고리가 누락된 항목이 있다면 보정
      if (currentDayData.currentPace) {
        currentDayData.currentPace = fixCategories(currentDayData.currentPace);
      }

      // 지속적인 추천 UX 제공을 위해 항상 추천 항목이 3개 미만이면 채워줌
      const oldRecCount = (currentDayData.recommendedPace || []).length;
      if (oldRecCount < 3) {
        const affinity = await getAffinity(uid);
        currentDayData.recommendedPace = replenishRecommendations(currentDayData.currentPace, currentDayData.recommendedPace || [], dailyPool, 3, affinity);
        await daysRef.doc(dayId).update({ recommendedPace: currentDayData.recommendedPace });
      }
    }

    // 타임라인 — 이원 스키마 읽기 어댑터(계획 §6): 과거 일 문서(신규) + 주 문서(레거시 아카이브) 합류
    const [pastDayDocs, legacyWeekDocs] = await Promise.all([
      daysRef.orderBy('date', 'desc').limit(20).get(),
      userRef.collection('weeks').orderBy('weekId', 'desc').limit(10).get(),
    ]);

    const pastLogs = [];
    // (1) 일 해상도 — 전환 시점 이후 (완료 궤도 또는 회고가 있는 날만)
    pastDayDocs.forEach(doc => {
      const data = doc.data();
      if (!data.date || data.date >= dayId) return;   // 오늘·미래 제외
      if (pastLogs.length >= 14) return;              // 최대 14일 노출
      const completedTasks = fixCategories((data.currentPace || []).filter(t => t.completed));
      if (completedTasks.length > 0 || (data.statement || '').trim()) {
        pastLogs.push({
          kind: 'day',
          date: data.date,
          tasks: completedTasks,
          statement: data.statement || ''
        });
      }
    });
    // (2) 주 해상도 — 전환 시점 이전 레거시 (읽기 전용 보존)
    legacyWeekDocs.forEach(doc => {
      const data = doc.data();
      const completedTasks = fixCategories((data.currentPace || []).filter(t => t.completed));
      if (completedTasks.length > 0) {
        pastLogs.push({
          kind: 'week',
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
      ...currentDayData,
      currentPace: (currentDayData.currentPace || []).map(t => localizeTask(t, req.locale)),
      recommendedPace: (currentDayData.recommendedPace || []).map(t => localizeTask(t, req.locale))
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

// 1-0-b. 특정 날짜의 실행·복기 조회 (읽기 전용 — 문서 생성 없음, 과거 열람용)
// 일자축 Phase 3 어댑터: days/{date}(신규) 우선, 없으면 그 날이 속한 주 문서(레거시)로 폴백.
// GET / 타임라인 윈도우(최근 N일)에 의존하지 않으므로 임의 과거 날짜도 유실 없이 열람된다.
pacenoteRouter.get('/day/:date', verifyUser, async (req, res) => {
  try {
    const uid = req.user.uid;
    const date = req.params.date;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return res.status(400).json({ error: 'Invalid date format' });

    const userRef = db.collection('pacenotes').doc(uid);
    const dayDoc = await userRef.collection('days').doc(date).get();
    if (dayDoc.exists) {
      const data = dayDoc.data();
      const tasks = fixCategories((data.currentPace || []).filter(t => t.completed));
      const statement = data.statement || '';
      if (tasks.length > 0 || statement.trim()) {
        return res.json({ kind: 'day', date, tasks: tasks.map(t => localizeTask(t, req.locale)), statement });
      }
    }

    // 레거시 주 문서 폴백 — 그 날짜를 포함하는 주(startDate ≤ date ≤ endDate) 검색.
    // 복합 인덱스 회피: 최근 주 문서를 메모리에서 스캔 (레거시 주는 전환 이전으로 유한).
    const weeksSnap = await userRef.collection('weeks').orderBy('weekId', 'desc').limit(60).get();
    for (const doc of weeksSnap.docs) {
      const w = doc.data();
      if (w.startDate && w.endDate && w.startDate <= date && date <= w.endDate) {
        const tasks = fixCategories((w.currentPace || []).filter(t => t.completed));
        return res.json({
          kind: 'week', weekId: w.weekId, startDate: w.startDate, endDate: w.endDate,
          tasks: tasks.map(t => localizeTask(t, req.locale)), statement: w.statement || ''
        });
      }
    }

    res.json({ kind: 'none', date });
  } catch (err) {
    console.error('[PaceNote API] Get Day Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 1-0. 오늘 이미 추가된 오빗 base id 목록 (read-only — 일자 문서를 생성하지 않음)
// 트랙 카드의 '이미 추가됨' 상태 표시용. base id = orbit-<ac.id> (항목 suffix 제거)
pacenoteRouter.get('/orbit-ids', verifyUser, async (req, res) => {
  try {
    const uid = req.user.uid;
    const { docRef } = todayActivityRef(uid);
    const doc = await docRef.get();
    if (!doc.exists) return res.json({ orbitBaseIds: [] });
    const ids = (doc.data().currentPace || [])
      .map(t => t.id)
      .filter(id => typeof id === 'string' && id.startsWith('orbit-'));
    const baseIds = [...new Set(ids.map(id => id.replace(/-\d+$/, '')))];
    res.json({ orbitBaseIds: baseIds });
  } catch (err) {
    console.error('[PaceNote API] orbit-ids Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 1-3. 유저 성장 프로파일 조회 (Growth Loop) — 루프 리포트·추천 개인화·Growth Profile 공용
pacenoteRouter.get('/profile', verifyUser, async (req, res) => {
  try {
    const uid = req.user.uid;
    const snap = await db.collection('pacenotes').doc(uid).get();
    const profile = (snap.exists && snap.data().profile) || {};
    const completion = profile.completion || { picked: 0, completed: 0 };
    const rate = completion.picked > 0 ? +(completion.completed / completion.picked).toFixed(3) : 0;
    const reflMap = profile.reflections || {};
    const reflSortKey = ([id, v]) => v?.ts || isoWeekMonday(id) || id;  // ts 우선 → 주차키는 월요일 환산 → 일자키 그대로
    const recentReflections = Object.entries(reflMap)
      .sort((a, b) => String(reflSortKey(b)).localeCompare(String(reflSortKey(a))))  // 최신순 (동종 ISO 일자 비교)
      .slice(0, 5)
      .map(([id, v]) => ({ id, text: v.text, ts: v.ts || null }));
    res.json({
      domainAffinity: profile.domainAffinity || {},
      completion: { picked: completion.picked || 0, completed: completion.completed || 0, rate },
      streak: profile.streak || { current: 0, best: 0 }, // DEPRECATED(주 단위) — practice가 대체, Phase 4 제거 예정
      practice: profile.practice || { monthDays: 0, last7Days: 0, current: 0, best: 0, lastActive: null },
      level: profile.level || null,
      recentReflections,
      updatedAt: profile.updatedAt || null,
    });
  } catch (err) {
    console.error('[PaceNote API] Profile Error:', err);
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

    const { dayId, docRef } = todayActivityRef(uid);
    
    const doc = await docRef.get();
    // 오늘 문서가 아직 없으면 자동 생성 후 추가
    const data = doc.exists ? doc.data() : buildDefaultDay(dayId, await getDailyPool(), await getAffinity(uid));
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
    await docRef.set({ ...data, currentPace });
    await recordSignal(uid, { affinity: [{ category: newTask.category, weight: 1 }], pickedDelta: 1 });

    res.json({ success: true, currentPace: currentPace.map(t => localizeTask(t, req.locale)) });
  } catch (err) {
    console.error('[PaceNote API] Add Task Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 1-2. Click-to-Orbit: 데일리 카드의 action_challenge를 오늘의 오빗으로 주입 (계약 §2.2)
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

    const { dayId, docRef } = todayActivityRef(uid);

    const doc = await docRef.get();

    // 오늘 문서가 아직 없으면 기본 일자 문서를 자동 생성 후 주입
    if (!doc.exists) {
      const dailyPool = await getDailyPool();
      const day = buildDefaultDay(dayId, dailyPool, await getAffinity(uid));
      day.currentPace.push(...orbits);
      await docRef.set(day);
      await recordSignal(uid, { affinity: [{ category: orbits[0].category, weight: orbits.length }], pickedDelta: orbits.length });
      return res.json({ success: true, added: orbits.length, currentPace: day.currentPace.map(t => localizeTask(t, req.locale)) });
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
    await recordSignal(uid, { affinity: [{ category: fresh[0].category, weight: fresh.length }], pickedDelta: fresh.length });

    res.json({ success: true, added: fresh.length, currentPace: currentPace.map(t => localizeTask(t, req.locale)) });
  } catch (err) {
    console.error('[PaceNote API] Add Orbit Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 2. 오늘 궤도 완료 상태 토글
pacenoteRouter.post('/toggle', verifyUser, async (req, res) => {
  try {
    const uid = req.user.uid;
    const { taskId } = req.body;
    
    if (!taskId) return res.status(400).json({ error: 'taskId is required' });

    const { docRef } = todayActivityRef(uid);
    
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ error: 'Day not found' });
    
    const data = doc.data();
    const currentPace = data.currentPace || [];
    
    const taskIndex = currentPace.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return res.status(404).json({ error: 'Task not found' });
    
    // Toggle — 완료 시 completedAt(일 해상도) 기록, 해제 시 제거(스테일 시각 방지)
    currentPace[taskIndex].completed = !currentPace[taskIndex].completed;
    if (currentPace[taskIndex].completed) {
      currentPace[taskIndex].completedAt = new Date().toISOString();
    } else {
      delete currentPace[taskIndex].completedAt;
    }

    await docRef.update({ currentPace });
    const nowDone = currentPace[taskIndex].completed;
    await recordSignal(uid, {
      affinity: [{ category: currentPace[taskIndex].category, weight: nowDone ? 2 : -2 }],
      completedDelta: nowDone ? 1 : -1,
    });
    res.json({ success: true, currentPace: currentPace.map(t => localizeTask(t, req.locale)) });
  } catch (err) {
    console.error('[PaceNote API] Toggle Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// 2-b. 궤도 제외(soft) — 실수 추가 정정용. 데이터는 보존하고 excluded 플래그만 기록한다.
//      (하드 삭제 금지: 복구 가능성·이력 보존. 미완료 항목만 허용 — 완료 통계·시그널 왜곡 방지)
pacenoteRouter.post('/exclude', verifyUser, async (req, res) => {
  try {
    const uid = req.user.uid;
    const { taskId } = req.body;

    if (!taskId) return res.status(400).json({ error: 'taskId is required' });

    const { docRef } = todayActivityRef(uid);

    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ error: 'Day not found' });

    const data = doc.data();
    const currentPace = data.currentPace || [];

    const taskIndex = currentPace.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return res.status(404).json({ error: 'Task not found' });
    if (currentPace[taskIndex].completed) {
      return res.status(400).json({ error: 'Completed tasks cannot be excluded' });
    }

    currentPace[taskIndex].excluded = true;
    await docRef.update({ currentPace });
    res.json({ success: true, currentPace: currentPace.map(t => localizeTask(t, req.locale)) });
  } catch (err) {
    console.error('[PaceNote API] Exclude Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 2-c. 궤도 제외 복원 — excluded 플래그 해제
pacenoteRouter.post('/restore', verifyUser, async (req, res) => {
  try {
    const uid = req.user.uid;
    const { taskId } = req.body;

    if (!taskId) return res.status(400).json({ error: 'taskId is required' });

    const { docRef } = todayActivityRef(uid);

    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ error: 'Day not found' });

    const data = doc.data();
    const currentPace = data.currentPace || [];

    const taskIndex = currentPace.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return res.status(404).json({ error: 'Task not found' });

    currentPace[taskIndex].excluded = false;
    await docRef.update({ currentPace });
    res.json({ success: true, currentPace: currentPace.map(t => localizeTask(t, req.locale)) });
  } catch (err) {
    console.error('[PaceNote API] Restore Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 3. 추천 미션을 내 궤도로 추가 (Accept)
pacenoteRouter.post('/accept', verifyUser, async (req, res) => {
  try {
    const uid = req.user.uid;
    const { taskId } = req.body;
    
    if (!taskId) return res.status(400).json({ error: 'taskId is required' });

    const { docRef } = todayActivityRef(uid);
    
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ error: 'Day not found' });
    
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
      const affinity = await getAffinity(uid);
      recommendedPace = replenishRecommendations(currentPace, recommendedPace, dailyPool, 3, affinity);
    }
    
    await docRef.update({ currentPace, recommendedPace });
    await recordSignal(uid, { affinity: [{ category: taskToMove.category, weight: 1 }], pickedDelta: 1 });
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

// 4. 오늘의 회고/일기 작성 및 저장
pacenoteRouter.post('/diary', verifyUser, async (req, res) => {
  try {
    const uid = req.user.uid;
    const { statement } = req.body;
    
    if (statement && statement.length > 1000) {
      return res.status(400).json({ error: 'Diary entry must be 1000 characters or less' });
    }

    const { dayId, docRef } = todayActivityRef(uid);
    
    const doc = await docRef.get();
    const cleanStatement = statement ? statement.trim() : '';
    if (!doc.exists) {
      // 오늘 문서가 없어도 복기를 먼저 남길 수 있게 자동 생성
      const day = buildDefaultDay(dayId, await getDailyPool(), await getAffinity(uid));
      day.statement = cleanStatement;
      await docRef.set(day);
    } else {
      await docRef.update({ statement: cleanStatement });
    }
    if (cleanStatement) {
      await recordSignal(uid, { reflection: { id: dayId, text: cleanStatement } });
    }

    res.json({ success: true, statement: cleanStatement });
  } catch (err) {
    console.error('[PaceNote API] Save Diary Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default pacenoteRouter;

