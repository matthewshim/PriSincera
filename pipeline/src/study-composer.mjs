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
    // 1. 일본어 프롬프트 로드
    const jpPromptPath = path.join(__dirname, 'templates', 'study-prompt.txt');
    const jpSystemPrompt = fs.readFileSync(jpPromptPath, 'utf-8');

    // 2. 일본어 콘텐츠 생성
    const jpThemes = [
      '사과 및 문제 해결', 'IT/테크 트렌드 논의', '팀 워크 및 협업', 
      '보고 및 프레젠테이션', '협상 및 설득', '이메일 및 서면 커뮤니케이션', '경영 및 전략'
    ];
    const jpUserPrompt = `오늘의 주제는 "${jpThemes[seed]}"과 관련된 비즈니스 상황입니다. 이 상황에서 원어민들이 자주 쓰는 세련된 일본어 1문장을 생성해주세요.`;
    
    console.log(`🇯🇵 Gemini Flash AI에게 일본어 문장 생성 요청 중... (주제: ${jpThemes[seed]})`);
    const jpCombinedPrompt = `${jpSystemPrompt}\n\nUser Task: ${jpUserPrompt}`;
    const studyData = await callGemini(jpCombinedPrompt);
    
    studyData.date = dateStr;
    studyData.theme = jpThemes[seed];
    
    console.log('✅ 생성된 일본어 콘텐츠:');
    console.log(`- 원문: ${studyData.sentence_jp}`);
    console.log(`- 해석: ${studyData.sentence_kr}`);

    // 3. AI 프롬프트 콘텐츠 생성
    const promptSystemPrompt = `당신은 20년차 IT 기획자이자 AI 프롬프트 엔지니어링 전문가입니다.
사용자가 내일 당장 실무에 복사해서 쓸 수 있는 '고밀도 AI 프롬프트 1-Pick'을 생성해주세요.
반드시 아래 JSON 형식으로만 응답하세요.

{
  "prompt_snippet": "프롬프트 템플릿 코드 (영문/국문 혼용, 변수는 [대괄호]로 표시)",
  "explanation": "이 프롬프트가 어떤 문제를 해결하는지 간단한 한국어 설명",
  "business_context": "실무에서 이 프롬프트를 언제, 어떻게 활용하면 좋은지 PO의 관점에서 작성한 팁",
  "parameters": [
    { "name": "변수명1", "description": "변수에 들어갈 내용 설명" },
    { "name": "변수명2", "description": "변수에 들어갈 내용 설명" }
  ]
}`;

    const promptThemes = [
      '회의록 요약 및 액션 아이템 도출', '경쟁사 분석 및 리서치', '카피라이팅 및 마케팅 문구 작성',
      '이메일 및 커뮤니케이션 초안 작성', '데이터 분석 및 인사이트 도출', '기획서 및 제안서 목차 작성', '코드 리뷰 및 개선'
    ];
    const promptUserTask = `오늘의 주제: '${promptThemes[seed]}'을 위한 완벽한 프롬프트를 하나 생성해주세요.`;
    
    console.log(`🤖 Gemini Flash AI에게 AI 프롬프트 생성 요청 중... (주제: ${promptThemes[seed]})`);
    const promptCombinedPrompt = `${promptSystemPrompt}\n\nUser Task: ${promptUserTask}`;
    const promptData = await callGemini(promptCombinedPrompt);

    console.log('✅ 생성된 AI 프롬프트 콘텐츠:');
    console.log(`- 프롬프트: ${promptData.prompt_snippet.substring(0, 50)}...`);

    // 4. 통합 데이터 저장 (Firestore)
    const combinedData = {
      ...studyData,
      prompt_snippet: promptData.prompt_snippet,
      explanation: promptData.explanation,
      business_context_prompt: promptData.business_context, // 필드명 충돌 방지
      parameters: promptData.parameters
    };

    await saveStudyContent(dateStr, combinedData);
    console.log(`🎉 [PriStudy Composer] ${dateStr} 콘텐츠(일본어+AI프롬프트) 생성 및 저장 완료!`);

  } catch (error) {
    console.error('❌ [PriStudy Composer] 실패:', error.message);
    process.exit(1);
  }
}

main();
