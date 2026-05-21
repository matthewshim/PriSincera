import fs from 'fs';
import { GoogleGenAI } from '@google/genai';

const env = fs.readFileSync('.env', 'utf-8');
const key = env.split('\n').find(l => l.startsWith('GEMINI_API_KEY=')).split('=')[1].trim();

const ai = new GoogleGenAI({ apiKey: key });

async function run() {
  try {
    const prompt = `Test prompt`;
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    console.log("Success:", response.text);
  } catch (err) {
    console.error("Error:", err.message);
    if (err.status) console.error("Status:", err.status);
    console.error("Full error:", JSON.stringify(err, null, 2));
  }
}

run();
