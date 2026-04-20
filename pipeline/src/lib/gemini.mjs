/**
 * Gemini Flash API 클라이언트 — 아티클 스코어링 및 콘텐츠 생성
 */
import { GoogleGenerativeAI } from '@google/generative-ai';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = join(__dirname, '..', 'templates');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY 환경변수가 설정되지 않았습니다.');

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
  generationConfig: {
    temperature: 0.7,
    topP: 0.9,
    maxOutputTokens: 4096,
    responseMimeType: 'application/json',
  },
});

/**
 * 프롬프트 템플릿을 로드합니다.
 */
function loadTemplate(name) {
  return readFileSync(join(TEMPLATES_DIR, name), 'utf-8');
}

/**
 * Gemini 호출 + JSON 파싱 (재시도 포함)
 */
async function callGemini(prompt, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      // JSON 블록 추출 (```json ... ``` 감싸기 대응)
      const jsonMatch = text.match(/```json\s*([\s\S]*?)```/) || [null, text];
      return JSON.parse(jsonMatch[1].trim());
    } catch (err) {
      console.warn(`[Gemini] 시도 ${attempt}/${maxRetries} 실패: ${err.message}`);
      if (attempt === maxRetries) throw err;
      // 재시도 전 대기 (레이트 리밋 대응)
      await new Promise(r => setTimeout(r, 2000 * attempt));
    }
  }
}

/**
 * 아티클 배치를 SIGNAL 기준으로 스코어링합니다.
 * @param {Array} articles - 스코어링할 아티클 배열 (최대 5개씩 배치)
 * @returns {Promise<Array>} 스코어가 추가된 아티클 배열
 */
export async function scoreArticles(articles) {
  const template = loadTemplate('scoring-prompt.txt');
  const batchSize = 5;
  const results = [];

  for (let i = 0; i < articles.length; i += batchSize) {
    const batch = articles.slice(i, i + batchSize);
    const articlesText = batch.map(a =>
      `- id: ${a.id}\n  제목: ${a.title}\n  출처: ${a.source} (Tier ${a.tier})\n  카테고리: ${a.category}\n  요약: ${a.summary.slice(0, 200)}`
    ).join('\n\n');

    const prompt = template.replace('{{articles}}', articlesText);
    console.log(`[Gemini] 스코어링 배치 ${Math.floor(i / batchSize) + 1}/${Math.ceil(articles.length / batchSize)} (${batch.length}개)`);

    try {
      const scores = await callGemini(prompt);
      for (const score of scores) {
        const article = batch.find(a => a.id === score.id);
        if (article) {
          results.push({
            ...article,
            scores: score.scores,
            totalScore: score.total,
            summaryKr: score.summaryKr || '',
          });
        }
      }
    } catch (err) {
      console.error(`[Gemini] 스코어링 배치 실패, 기본 점수 적용: ${err.message}`);
      // 실패 시 기본 점수로 포함 (발송 보장)
      for (const a of batch) {
        results.push({ ...a, scores: { S: 2, I: 2, G: 2, N: 2, A: 2, L: 2 }, totalScore: 12, summaryKr: a.title });
      }
    }

    // 배치 간 레이트 리밋 대기
    if (i + batchSize < articles.length) {
      await new Promise(r => setTimeout(r, 1500));
    }
  }

  return results;
}

/**
 * 선정된 아티클에 대한 에디터 코멘트를 생성합니다.
 */
export async function generateComments(articles) {
  const template = loadTemplate('comment-prompt.txt');
  const articlesText = articles.map(a =>
    `- id: ${a.id}\n  제목: ${a.title}\n  출처: ${a.source}\n  카테고리: ${a.category}\n  요약: ${a.summaryKr || a.summary.slice(0, 200)}`
  ).join('\n\n');

  const prompt = template.replace('{{articles}}', articlesText);
  console.log(`[Gemini] 에디터 코멘트 생성 (${articles.length}개 아티클)`);

  try {
    const comments = await callGemini(prompt);
    const commentMap = new Map(comments.map(c => [c.id, c.comment]));
    return articles.map(a => ({
      ...a,
      editorComment: commentMap.get(a.id) || `${a.source}에서 발견한 주목할 만한 시그널입니다.`,
    }));
  } catch (err) {
    console.error(`[Gemini] 코멘트 생성 실패, 기본 코멘트 적용: ${err.message}`);
    return articles.map(a => ({
      ...a,
      editorComment: `${a.source}에서 발견한 이번 주의 시그널입니다. 원문에서 더 깊은 인사이트를 확인해보세요.`,
    }));
  }
}

/**
 * 에디터 노트, 마무리 한 마디, 이메일 제목을 생성합니다.
 */
export async function generateEditorNote(articles) {
  const template = loadTemplate('editor-note-prompt.txt');
  const articlesText = articles.map(a =>
    `- [${a.category}] ${a.title} (${a.source})\n  요약: ${a.summaryKr || a.summary.slice(0, 150)}`
  ).join('\n\n');

  const prompt = template.replace('{{articles}}', articlesText);
  console.log('[Gemini] 에디터 노트 생성');

  try {
    return await callGemini(prompt);
  } catch (err) {
    console.error(`[Gemini] 에디터 노트 생성 실패, 기본값 적용: ${err.message}`);
    return {
      editorNote: '이번 주도 노이즈 속에서 의미 있는 시그널들을 포착했습니다. 각 아티클에서 실무에 바로 적용할 수 있는 인사이트를 발견하시길 바랍니다.',
      closingRemark: '다음 주에도 신선한 시그널로 찾아뵙겠습니다.',
      subject: '이번 주의 시그널',
    };
  }
}
