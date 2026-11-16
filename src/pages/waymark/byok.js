// Waymark BYOK — 사용자 자기 키로 AI 지속. 키는 기기에만(IndexedDB + WebCrypto 암호화),
// 서버·Firestore 미경유. Anthropic은 브라우저 직접(CORS 허용 헤더). 정본: security_spec §6-2.
const DB = 'waymark_byok';
const STORE = 'keys';

function idb() {
  return new Promise((resolve, reject) => {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(STORE);
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}
function idbOp(mode, fn) {
  return idb().then((db) => new Promise((resolve, reject) => {
    const store = db.transaction(STORE, mode).objectStore(STORE);
    const req = fn(store);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  }));
}
const idbGet = (k) => idbOp('readonly', (s) => s.get(k));
const idbSet = (k, v) => idbOp('readwrite', (s) => s.put(v, k));
const idbDel = (k) => idbOp('readwrite', (s) => s.delete(k));

// fetch 타임아웃(과부하 시 무한 대기 방지)
async function fetchT(url, opts, ms) {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), ms || 25000);
  try { return await fetch(url, { ...opts, signal: ac.signal }); } finally { clearTimeout(t); }
}

// 비추출(non-extractable) 래핑 키 — IndexedDB에 CryptoKey로 보관(원문 추출 불가)
async function wrapKey() {
  let wk = await idbGet('wrapKey');
  if (!wk) { wk = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']); await idbSet('wrapKey', wk); }
  return wk;
}

export async function saveByok(provider, apiKey) {
  const wk = await wrapKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const enc = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, wk, new TextEncoder().encode(apiKey));
  await idbSet('cred', { provider, iv: Array.from(iv), data: Array.from(new Uint8Array(enc)) });
}
export async function getByok() {
  const c = await idbGet('cred');
  if (!c) return null;
  try {
    const wk = await wrapKey();
    const dec = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: new Uint8Array(c.iv) }, wk, new Uint8Array(c.data));
    return { provider: c.provider, key: new TextDecoder().decode(dec) };
  } catch { return null; }
}
export async function byokProvider() { const c = await idbGet('cred'); return c ? c.provider : null; }
export async function clearByok() { await idbDel('cred'); }

// 가드레일 시스템 프롬프트 (서버와 동일 취지)
const TONE_GUIDE = { comfort: '마음을 다독인다. 공감하고 안심시킨다.', counsel: '갈래를 짚는 질문을 던진다. 놓친 관점을 함께 본다.', cheer: '밀고 갈 힘을 준다. 응원한다.', clarify: '생각을 선택지/기준/마음으로 구조화하도록 돕는다.' }; // i18n-ok: AI 시스템 프롬프트(UI 텍스트 아님)
export function byokSystem(tone) {
  return [
    '너는 Waymark, 결정의 갈림길에서 곁을 지키는 동반자다.', // i18n-ok: AI 시스템 프롬프트(UI 텍스트 아님)
    '규칙: (1) 절대 대신 결정하지 않는다 — 선택은 사용자 몫으로 돌려준다. (2) 3~4문장으로 짧고 담백하게. (3) 한국어로 따뜻하게. (4) 강요하지 않는다.', // i18n-ok: AI 시스템 프롬프트(UI 텍스트 아님)
    '이번 결: ' + (TONE_GUIDE[tone] || TONE_GUIDE.comfort), // i18n-ok: AI 시스템 프롬프트(UI 텍스트 아님)
    '마지막 문장은 결정을 사용자에게 돌려주는 말로 닫는다.', // i18n-ok: AI 시스템 프롬프트(UI 텍스트 아님)
  ].join('\n');
}

// Anthropic 브라우저 직접 호출 (키는 이 함수 밖으로 나가지 않음)
export async function callAnthropic(key, system, userMsg) {
  const r = await fetchT('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
    body: JSON.stringify({ model: 'claude-3-5-haiku-20241022', max_tokens: 400, system, messages: [{ role: 'user', content: userMsg }] }),
  }, 25000);
  if (!r.ok) { let b = ''; try { b = await r.text(); } catch (e) { b = ''; } throw Object.assign(new Error('anthropic ' + r.status), { status: r.status, body: b.slice(0, 200) }); }
  const d = await r.json();
  return ((d.content && d.content[0] && d.content[0].text) || '').trim();
}

// Gemini 브라우저 직접 호출 (CORS 허용). 주의: 무료 티어는 입력을 학습에 쓸 수 있음(security_spec §6-2).
export async function callGemini(key, system, userMsg) {
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=' + encodeURIComponent(key);
  const opts = {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ systemInstruction: { parts: [{ text: system }] }, contents: [{ role: 'user', parts: [{ text: userMsg }] }], generationConfig: { maxOutputTokens: 400, temperature: 0.7 }, safetySettings: [{ category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' }, { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' }, { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' }, { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' }] }),
  };
  let r;
  for (let i = 0; i < 2; i++) { r = await fetchT(url, opts, 25000); if (r.status !== 503 && r.status !== 429) break; if (i === 0) await new Promise((res) => setTimeout(res, 1500)); }
  if (!r.ok) { let b = ''; try { b = await r.text(); } catch (e) { b = ''; } console.error('[byok] gemini ' + r.status, b.slice(0, 300)); throw Object.assign(new Error('gemini ' + r.status), { status: r.status, body: b.slice(0, 200) }); }
  const d = await r.json();
  const cand = d.candidates && d.candidates[0];
  const text = ((cand && cand.content && cand.content.parts && cand.content.parts[0] && cand.content.parts[0].text) || '').trim();
  if (!text) console.error('[byok] gemini empty — finishReason:', cand && cand.finishReason, 'promptFeedback:', JSON.stringify(d.promptFeedback || {}));
  return text;
}

// 공급자 디스패치
export async function callByok(provider, key, system, userMsg) {
  return provider === 'gemini' ? callGemini(key, system, userMsg) : callAnthropic(key, system, userMsg);
}
