import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { callGemini } from './lib/gemini.mjs';
import { saveStudyContent } from './repositories/StudyRepository.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log('🚀 [PriStudy Composer] 매일 1문장 자동 생성 시작...');
  const targetDateArg = process.argv[2];
  let dateStr;
  let seed;
  
  if (targetDateArg) {
    dateStr = targetDateArg;
    seed = new Date(dateStr).getDay();
  } else {
    const kstNow = new Date(new Date().getTime() + 9 * 60 * 60 * 1000);
    dateStr = kstNow.toISOString().slice(0, 10);
    seed = kstNow.getDay();
  }
  console.log(`📅 Target Date: ${dateStr}`);

  try {
    // 1. 프롬프트 로드
    const promptPath = path.join(__dirname, 'templates', 'study-prompt.txt');
    const systemPrompt = fs.readFileSync(promptPath, 'utf-8');

    // 2. 테마/소스 주입 (Phase 1: 현재는 랜덤 비즈니스 주제 유도를 위해 날짜 시드 활용)
    const themes = [
      '사과 및 문제 해결', 'IT/테크 트렌드 논의', '팀 워크 및 협업', 
      '보고 및 프레젠테이션', '협상 및 설득', '이메일 및 서면 커뮤니케이션', '경영 및 전략'
    ];
    const userPrompt = `오늘의 주제는 "${themes[seed]}"과 관련된 비즈니스 상황입니다. 이 상황에서 원어민들이 자주 쓰는 세련된 일본어 1문장을 생성해주세요.`;

    // 3. Gemini API 호출
    console.log(`🤖 Gemini Flash AI에게 문장 생성 요청 중... (주제: ${themes[seed]})`);
    const combinedPrompt = `${systemPrompt}\n\nUser Task: ${userPrompt}`;
    const studyData = await callGemini(combinedPrompt);
    
    // 4. JSON 파싱
    studyData.date = dateStr;
    studyData.theme = themes[seed];
    
    console.log('✅ 생성된 학습 콘텐츠:');
    console.log(`- 원문: ${studyData.sentence_jp}`);
    console.log(`- 해석: ${studyData.sentence_kr}`);

    // 5. Firestore에 저장
    await saveStudyContent(dateStr, studyData);
    console.log(`🎉 [PriStudy Composer] ${dateStr} 콘텐츠 생성 및 저장 완료!`);

  } catch (error) {
    console.error('❌ [PriStudy Composer] 실패:', error.message);
    process.exit(1);
  }
}

main();
