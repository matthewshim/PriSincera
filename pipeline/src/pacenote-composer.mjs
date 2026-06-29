import { callGemini } from './lib/gemini.mjs';
import { db } from './lib/firestore.mjs';

// 카테고리/도메인 → affinity 키 ('AI/LLM'→'ai_llm') — pacenote-api와 동일 규칙
function affinityKey(category) {
  return String(category || 'general').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'general';
}

async function main() {
  console.log('🚀 [PaceNote Composer] 매일 새로운 AI 추천 궤도 생성 시작 (Phase 3 적용)...');

  try {
    // 1. 기존 추천 풀 조회 및 통계 수집
    console.log('📡 기존 추천 풀 및 통계(Picks) 가져오는 중...');
    const poolRef = db.collection('config').doc('pacenote_daily_pool');
    const doc = await poolRef.get();
    let currentPool = [];
    if (doc.exists && doc.data().pool) {
      currentPool = doc.data().pool;
    }

    const userDocs = await db.collection('pacenotes').listDocuments();
    const poolStats = {}; // { id: pickCount }
    const CHUNK_SIZE = 50;
    for (let i = 0; i < userDocs.length; i += CHUNK_SIZE) {
      const chunk = userDocs.slice(i, i + CHUNK_SIZE);
      await Promise.all(chunk.map(async (docRef) => {
        try {
          const weeksSnap = await docRef.collection('weeks').orderBy('weekId', 'desc').limit(10).get();

          // (a) 추천 풀 통계(velocity 입력) — 기존 동작 유지
          weeksSnap.docs.forEach(doc => {
            const data = doc.data();
            if (data.currentPace) {
              data.currentPace.forEach(task => {
                if (!task.id.startsWith('custom-')) {
                  poolStats[task.id] = (poolStats[task.id] || 0) + 1;
                }
              });
            }
          });

          // (b) Growth Loop Phase 1: 성장 프로파일 권위 재계산 (weeks → profile)
          const affinity = {};
          let picked = 0, completed = 0;
          const reflections = {};
          const weekFlags = []; // 최신순: 주차별 완료 여부
          weeksSnap.docs.forEach(doc => {
            const data = doc.data();
            let wc = 0;
            (data.currentPace || []).forEach(task => {
              picked++;
              affinity[affinityKey(task.category)] = (affinity[affinityKey(task.category)] || 0) + (task.completed ? 3 : 1);
              if (task.completed) { completed++; wc++; }
            });
            if (data.weekId) weekFlags.push(wc > 0);
            if (data.weekId && data.statement && String(data.statement).trim()) {
              reflections[data.weekId] = { text: String(data.statement).trim(), ts: data.createdAt || null };
            }
          });
          // streak: 최신 주차부터 연속 완료 주 수(current) + 최장 연속(best)
          let streakCurrent = 0;
          for (const has of weekFlags) { if (has) streakCurrent++; else break; }
          let best = 0, run = 0;
          for (const has of weekFlags) { if (has) { run++; best = Math.max(best, run); } else run = 0; }
          const rate = picked > 0 ? +(completed / picked).toFixed(3) : 0;

          await docRef.set({ profile: {
            domainAffinity: affinity,
            completion: { picked, completed, rate },
            streak: { current: streakCurrent, best, lastReconciled: new Date().toISOString() },
            reflections,
            updatedAt: new Date().toISOString(),
          } }, { merge: true });
        } catch (e) {
          // 개별 유저 오류는 무시 (전체 파이프라인 보호)
        }
      }));
    }

    // 현재 풀에 Velocity Score 부여
    const now = new Date();
    const scoredPool = currentPool.map(item => {
      const createdAt = item.createdAt ? new Date(item.createdAt) : now;
      const daysAlive = Math.max(1, (now - createdAt) / (1000 * 60 * 60 * 24)); // 최소 1일로 설정
      const picks = poolStats[item.id] || 0;
      const velocity = picks / daysAlive;
      return { ...item, daysAlive, velocity };
    });

    // 2. 명예의 전당(Hall of Fame) 추출 (프롬프트 주입용)
    // Velocity 기준 상위 정렬
    const sortedForHOF = [...scoredPool].sort((a, b) => b.velocity - a.velocity);
    // 선택을 최소 2번 이상 받은 항목들 중 상위 3개 추출
    const hallOfFame = sortedForHOF.filter(item => poolStats[item.id] >= 2).slice(0, 3);
    
    let hofPromptText = '';
    if (hallOfFame.length > 0) {
      hofPromptText = `\n아래는 유저들에게 가장 폭발적인 반응을 얻은 우수 궤도(Best Practices)들입니다. 
이 톤앤매너와 구조, 난이도를 참고하여 이와 유사하게 매력적인 새로운 목표들을 생성해주세요:\n` +
      hallOfFame.map((item, idx) => `[${idx+1}] 카테고리: ${item.category} / 목표: ${item.title}`).join('\n');
    }

    const validCategories = [
      'Mindset', 'Branding', 'Deep Work', 'Networking', 'Productivity', 
      'AI & Future', 'Vision', 'Inspiration', 'Environment', 'Problem Solving', 
      'Learning', 'Health & Wellness'
    ].join(', ');

    // 3. Gemini 호출
    const promptSystemPrompt = `당신은 성공적인 커리어 성장과 웰니스를 돕는 코치입니다.
현대 직장인들을 위한 실질적이고 통찰력 있는 '데일리 미션(궤도)'을 3개 생성해주세요.
반드시 아래 JSON 형식으로만 응답하세요. (마크다운 백틱 없이 순수 JSON 배열만 반환)

[
  {
    "title": {
      "ko": "목표 내용 (20자~40자 내외의 한국어)",
      "en": "English translation of the goal",
      "ja": "Japanese translation of the goal"
    },
    "category": "다음 카테고리 중 반드시 하나만 선택하세요: ${validCategories}",
    "color": "카테고리에 어울리는 세련된 HEX 색상코드 (예: #34D399, #60A5FA)"
  }
]`;

    const promptUserTask = `최근 IT 업계 트렌드나 개인의 멘탈 웰니스에 어울리는 새로운 미션을 3개 만들어주세요.${hofPromptText}`;
    
    console.log(`🤖 Gemini Flash AI에게 추천 궤도 생성 요청 중 (명예의 전당 ${hallOfFame.length}개 주입)...`);
    const combinedPrompt = `${promptSystemPrompt}\n\nUser Task: ${promptUserTask}`;
    
    const generatedData = await callGemini(combinedPrompt);
    
    let newRecs = [];
    if (Array.isArray(generatedData)) {
      newRecs = generatedData;
    } else {
      console.log('⚠️ 응답이 배열이 아닙니다. 강제로 배열로 변환합니다.');
      newRecs = [generatedData];
    }

    console.log('✅ 생성된 궤도 데이터:', JSON.stringify(newRecs, null, 2));

    const timestamp = Date.now();
    const formattedRecs = newRecs.map((rec, index) => ({
      id: `ai-rec-${timestamp}-${index}`,
      title: typeof rec.title === 'string' ? { ko: rec.title, en: '', ja: '' } : rec.title,
      category: rec.category || 'Inspiration',
      color: rec.color || '#A78BFA',
      isActive: true,
      createdAt: new Date().toISOString(),
    }));

    // 4. 복합 퇴출 알고리즘 적용 (TTL 45일 및 Velocity 기준)
    console.log('🧹 [PaceNote Composer] 고인물 방지 동적 퇴출(Dynamic Ejection) 진행...');
    const MAX_POOL_SIZE = 150;
    const TTL_DAYS = 45;

    // 1순위 퇴출: 수명(TTL) 초과 항목 삭제
    let survivingPool = scoredPool.filter(item => item.daysAlive <= TTL_DAYS);
    const ttlEvicted = currentPool.length - survivingPool.length;

    // 2순위 퇴출: 최대 용량을 초과한다면, Velocity가 낮은 순서대로 삭제
    const excessCount = (survivingPool.length + formattedRecs.length) - MAX_POOL_SIZE;
    let velocityEvicted = 0;
    
    if (excessCount > 0) {
      // Velocity 오름차순 정렬 (낮은 게 먼저 옴)
      // 단, 생성된 지 7일 미만인 신규 궤도는 평가 기간이 짧으므로 보호
      survivingPool.sort((a, b) => {
        const aProtected = a.daysAlive < 7 ? 1 : 0;
        const bProtected = b.daysAlive < 7 ? 1 : 0;
        if (aProtected !== bProtected) return aProtected - bProtected; // 보호되지 않은 것(0)이 앞에 옴
        return a.velocity - b.velocity; 
      });
      
      // 하위 excessCount 개수만큼 삭제 (앞에서부터 자름)
      survivingPool = survivingPool.slice(excessCount);
      velocityEvicted = excessCount;
    }

    // 최종 풀 조합: 최신 궤도 + 살아남은 기존 궤도 (임시 필드 제거)
    const cleanedSurvivingPool = survivingPool.map(({ daysAlive, velocity, ...rest }) => rest);
    const updatedPool = [...formattedRecs, ...cleanedSurvivingPool];
    
    console.log(`📊 퇴출 결과: TTL 만료 ${ttlEvicted}개 삭제, 실적 저조 ${velocityEvicted}개 삭제`);

    // 5. Firestore 업데이트
    const runLog = `✅ 3개 신규 생성 (명예의 전당 ${hallOfFame.length}개 참조). TTL 퇴출: ${ttlEvicted}개, 실적 저조 퇴출: ${velocityEvicted}개.`;
    await poolRef.set({
      pool: updatedPool,
      updatedAt: new Date().toISOString(),
      lastRunTime: new Date().toISOString(),
      lastRunLog: runLog
    }, { merge: true });

    console.log(`🎉 [PaceNote Composer] 성공적으로 업데이트 완료. (현재 풀 크기: ${updatedPool.length})`);

  } catch (error) {
    console.error('❌ [PaceNote Composer] 실패:', error.message);
    try {
      const poolRef = db.collection('config').doc('pacenote_daily_pool');
      await poolRef.set({
        lastRunTime: new Date().toISOString(),
        lastRunLog: `❌ 에러 발생: ${error.message}`
      }, { merge: true });
    } catch (e) {}
    process.exit(1);
  }
}

main();
