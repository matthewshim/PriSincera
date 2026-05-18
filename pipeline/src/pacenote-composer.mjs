import { callGemini } from './lib/gemini.mjs';
import { db } from './lib/firestore.mjs';

async function main() {
  console.log('🚀 [PaceNote Composer] 매일 새로운 AI 추천 궤도 생성 시작...');

  try {
    const promptSystemPrompt = `당신은 성공적인 커리어 성장과 웰니스를 돕는 코치입니다.
현대 직장인들을 위한 실질적이고 통찰력 있는 '데일리 미션(궤도)'을 3개 생성해주세요.
반드시 아래 JSON 형식으로만 응답하세요. (마크다운 백틱 없이 순수 JSON 배열만 반환)

[
  {
    "title": "목표 내용 (20자~40자 내외의 한국어)",
    "category": "Mindset / Branding / Deep Work / Networking / Productivity / AI & Future 등 적합한 카테고리 영문명",
    "color": "카테고리에 어울리는 세련된 HEX 색상코드 (예: #34D399, #60A5FA)"
  }
]`;

    const promptUserTask = `최근 IT 업계 트렌드나 개인의 멘탈 웰니스에 어울리는 새로운 미션을 3개 만들어주세요.`;
    
    console.log(`🤖 Gemini Flash AI에게 추천 궤도 생성 요청 중...`);
    const combinedPrompt = `${promptSystemPrompt}\n\nUser Task: ${promptUserTask}`;
    
    // callGemini는 기본적으로 객체를 파싱해서 반환함 (프롬프트에서 JSON 형식을 요청했으므로)
    const generatedData = await callGemini(combinedPrompt);
    
    let newRecs = [];
    if (Array.isArray(generatedData)) {
      newRecs = generatedData;
    } else {
      console.log('⚠️ 응답이 배열이 아닙니다. 강제로 배열로 변환합니다.');
      newRecs = [generatedData];
    }

    console.log('✅ 생성된 궤도 데이터:', JSON.stringify(newRecs, null, 2));

    // 2. Firestore에서 기존 풀 조회
    console.log('📡 기존 추천 풀 가져오는 중...');
    const poolRef = db.collection('config').doc('pacenote_daily_pool');
    const doc = await poolRef.get();
    let currentPool = [];
    if (doc.exists && doc.data().pool) {
      currentPool = doc.data().pool;
    }

    // 3. 새로운 궤도 가공 및 추가
    const timestamp = Date.now();
    const formattedRecs = newRecs.map((rec, index) => ({
      id: `ai-rec-${timestamp}-${index}`,
      title: rec.title,
      category: rec.category || 'Inspiration',
      color: rec.color || '#A78BFA',
      isActive: true,
      createdAt: new Date().toISOString(),
    }));

    // 3.5 통계 데이터 수집 (Velocity 계산)
    console.log('📊 [PaceNote Composer] 기존 궤도 성과 통계(Picks) 수집 중...');
    const userDocs = await db.collection('pacenotes').listDocuments();
    const poolStats = {}; // { id: pickCount }
    const CHUNK_SIZE = 50;
    for (let i = 0; i < userDocs.length; i += CHUNK_SIZE) {
      const chunk = userDocs.slice(i, i + CHUNK_SIZE);
      await Promise.all(chunk.map(async (docRef) => {
        try {
          const weeksSnap = await docRef.collection('weeks').orderBy('weekId', 'desc').limit(10).get();
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
        } catch (e) {
          // ignore error for individual user
        }
      }));
    }

    // 3.6 복합 퇴출 알고리즘 적용 (TTL 45일 및 Velocity 기준)
    console.log('🧹 [PaceNote Composer] 고인물 방지 동적 퇴출(Dynamic Ejection) 진행...');
    const MAX_POOL_SIZE = 150;
    const TTL_DAYS = 45;
    const now = new Date();

    // 현재 풀에 Velocity Score 부여
    const scoredPool = currentPool.map(item => {
      const createdAt = item.createdAt ? new Date(item.createdAt) : now;
      const daysAlive = Math.max(1, (now - createdAt) / (1000 * 60 * 60 * 24)); // 최소 1일로 설정
      const picks = poolStats[item.id] || 0;
      const velocity = picks / daysAlive;
      return { ...item, daysAlive, velocity };
    });

    // 1순위 퇴출: 수명(TTL) 초과 항목 삭제
    let survivingPool = scoredPool.filter(item => item.daysAlive <= TTL_DAYS);
    const ttlEvicted = currentPool.length - survivingPool.length;

    // 2순위 퇴출: 여전히 최대 용량을 초과한다면, Velocity가 낮은 순서대로 삭제
    // 신규 추가될 궤도(formattedRecs) 길이를 고려
    const excessCount = (survivingPool.length + formattedRecs.length) - MAX_POOL_SIZE;
    let velocityEvicted = 0;
    
    if (excessCount > 0) {
      // Velocity 오름차순 정렬 (낮은 게 먼저 옴)
      // 단, 생성된 지 7일 미만인 신규 궤도는 평가 기간이 짧으므로 보호(퇴출 1순위에서 제외)
      survivingPool.sort((a, b) => {
        const aProtected = a.daysAlive < 7 ? 1 : 0;
        const bProtected = b.daysAlive < 7 ? 1 : 0;
        if (aProtected !== bProtected) return aProtected - bProtected; // 보호되지 않은 것(0)이 앞에 옴
        
        // 둘 다 보호 상태가 같으면 Velocity 낮은 순으로
        return a.velocity - b.velocity; 
      });
      
      // 하위 excessCount 개수만큼 삭제 (앞에서부터 자름)
      survivingPool = survivingPool.slice(excessCount);
      velocityEvicted = excessCount;
    }

    // 최종 풀 조합: 최신 궤도 + 살아남은 기존 궤도 (임시 필드 제거)
    const cleanedSurvivingPool = survivingPool.map(({ daysAlive, velocity, ...rest }) => rest);
    
    // 최종 최신순(앞으로) 결합
    const updatedPool = [...formattedRecs, ...cleanedSurvivingPool];
    
    console.log(\`📊 퇴출 결과: TTL 만료 \${ttlEvicted}개 삭제, 실적 저조 \${velocityEvicted}개 삭제\`);

    // 4. Firestore 업데이트
    await poolRef.set({
      pool: updatedPool,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    console.log(`🎉 [PaceNote Composer] 성공적으로 ${formattedRecs.length}개의 추천 궤도를 풀에 추가했습니다. (현재 풀 크기: ${updatedPool.length})`);

  } catch (error) {
    console.error('❌ [PaceNote Composer] 실패:', error.message);
    process.exit(1);
  }
}

main();
