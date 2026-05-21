import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

async function run() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const prompt = `
너는 PriSincera의 수석 테크니컬 라이터야. 전달된 초안 마크다운 문서를 분석해서 다음 작업을 수행해:
1. 초안의 내용과 의도를 파악하여 "전문적이고 프리미엄한 SaaS 기술 블로그 톤"으로 마크다운 본문을 재작성(윤문)해. (H1은 쓰지 말고 H2, H3, Blockquote 사용)
2. 코드나 본문에 포함된 IP, 주민등록번호, 실제 유저 이메일 등 민감한 개인정보/보안 데이터는 [REDACTED] 처리해.
3. 이 아티클에 가장 어울리는 Title, Subtitle, 영문 Slug(소문자와 하이픈만), Tags(최대 4개)를 추출해.
4. 아래 제공된 [최근 커밋 리스트]를 분석하여, 이 아티클의 내용과 실제로 관련된 커밋들만 선별(최대 5개)하여 JSON 배열로 반환해. 연관된 것이 없다면 빈 배열 []을 반환해.

반드시 아래 JSON 형식으로만 응답해 (Markdown code block 표시 없이 순수 JSON 문자열만 출력):
{
  "title": "추출한 제목",
  "subtitle": "추출한 부제목",
  "slug": "extracted-english-slug",
  "tags": ["Tag1", "Tag2"],
  "refinedMarkdown": "윤문 및 검열이 완료된 마크다운 본문...",
  "commits": [
    { "type": "feat", "hash": "abc1234", "msg": "커밋 메시지" }
  ]
}

[원본 초안]
# 테스트 마크다운입니다.
이 기능은 새로운 어드민 메뉴를 재배치하는 기능입니다.

[최근 커밋 리스트]
[
  { "type": "style", "hash": "10e2cd2", "msg": "admin: reorder sidebar navigation menu" },
  { "type": "feat", "hash": "cf3bcb0", "msg": "admin: increase commit fetch limit" }
]
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    console.log("Raw Response:");
    console.log(response.text);
    const parsed = JSON.parse(response.text);
    console.log("Parsed Object:", Object.keys(parsed));
  } catch (err) {
    console.error("Error:", err.message);
  }
}
run();
