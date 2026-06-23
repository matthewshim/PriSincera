/**
 * Gemini Flash API 클라이언트 — 아티클 스코어링 및 콘텐츠 생성
 */
import { GoogleGenerativeAI } from '@google/generative-ai';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = join(__dirname, '..', 'templates');

let genAI = null;
function getGenAI() {
  const apiKey = (process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey) throw new Error('GEMINI_API_KEY 환경변수가 설정되지 않았습니다.');
  if (!genAI) {
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

/**
 * 프롬프트 템플릿을 로드합니다.
 */
function loadTemplate(name) {
  return readFileSync(join(TEMPLATES_DIR, name), 'utf-8');
}

/**
 * Gemini 호출 + JSON 파싱 (재시도 포함)
 */
export async function callGemini(prompt, maxRetries = 5) {
  // 최신 고효율/저비용 Flash 모델군만 배치하여 요금 폭탄 차단
  const modelsToTry = ['gemini-flash-latest', 'gemini-2.5-flash'];
  const generationConfig = {
    temperature: 0.7,
    topP: 0.9,
    maxOutputTokens: 4096,
    responseMimeType: 'application/json',
  };

  let lastError;

  // 매 재시도마다 모델 후보군 전체를 난사하지 않고, 순차적으로 1개 모델만 시도
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const modelName = modelsToTry[(attempt - 1) % modelsToTry.length];
    try {
      const model = getGenAI().getGenerativeModel({ model: modelName, generationConfig });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const jsonMatch = text.match(/```json\s*([\s\S]*?)```/) || [null, text];
      return JSON.parse(jsonMatch[1].trim());
    } catch (err) {
      lastError = err;
      const msg = String(err?.message || '');
      const is429 = err?.status === 429 || /\b429\b|Too Many Requests|RESOURCE_EXHAUSTED/i.test(msg);
      // 무료 티어 '일일(per-day)' 할당량 소진은 대기/재시도해도 오늘 안엔 회복 불가 +
      // 같은 모델 재호출은 남은 할당량만 더 태움. 따라서 안 써본 다른 모델(별도 할당량)만
      // 1회 더 시도하고, 모든 모델이 일일 한도면 즉시 중단(백오프 대기 없이).
      const isDailyQuota = is429 && /per ?day|FreeTier|free_tier_requests/i.test(msg);
      if (isDailyQuota) {
        const triedAllModels = attempt >= modelsToTry.length;
        if (triedAllModels) {
          console.warn(`[Gemini] 무료 일일 할당량 소진(${modelName}) — 전 모델 한도 도달, 재시도 중단.`);
          throw err;
        }
        console.warn(`[Gemini] 무료 일일 할당량 소진(${modelName}) — 대기 없이 다른 모델로 1회 시도.`);
        continue; // 백오프 없이 다음 모델로
      }
      if (attempt < maxRetries) {
        // 일시적 오류/분당 rate-limit: 지수 백오프(Exponential Backoff) + 지터(Jitter) 후 다음 모델 재시도
        const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
        console.warn(`[Gemini] 시도 ${attempt}/${maxRetries} (${modelName}) 실패. ${Math.round(delay / 10) / 100}초 후 재시도... 에러: ${err.message}`);
        await new Promise(r => setTimeout(r, delay));
      } else {
        console.warn(`[Gemini] 시도 ${attempt}/${maxRetries} (${modelName}) 최종 실패: ${err.message}`);
      }
    }
  }
  
  throw lastError || new Error("모든 제미나이 모델 호출에 실패했습니다.");
}

/**
 * 아티클 배치를 SIGNAL 기준으로 스코어링합니다.
 * @param {Array} articles - 스코어링할 아티클 배열 (최대 5개씩 배치)
 * @returns {Promise<Array>} 스코어가 추가된 아티클 배열
 */
export async function scoreArticles(articles) {
  const template = loadTemplate('scoring-prompt.txt');
  // 배치 크기를 12개로 확대하여 일일 총 호출 수 60% 이상 절감 (컨텍스트가 긴 Flash에 최적화)
  const batchSize = 12;
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

    // 무료 등급(Free Tier)의 RPM(분당 15회) 필터를 안전하게 피하기 위해 대기 시간을 4초로 조정
    if (i + batchSize < articles.length) {
      await new Promise(r => setTimeout(r, 4000));
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
