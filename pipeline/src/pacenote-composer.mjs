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

    // 새 궤도를 풀 앞에 추가 (최신 항목 우선 노출을 위함, 풀은 150개로 제한)
    const MAX_POOL_SIZE = 150;
    const updatedPool = [...formattedRecs, ...currentPool].slice(0, MAX_POOL_SIZE);

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
