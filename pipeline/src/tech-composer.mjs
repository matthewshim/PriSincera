#!/usr/bin/env node
/**
 * Tech Composer — 수준별(주니어/시니어) 테크 시그널 트랙 피드 생성기
 *
 * Data Contract v2 (docs/data_contract_v2.md §1.2) 준수.
 * - study-composer.mjs(어학, 웹 전용)는 존치. 본 파이프라인은 별도 신규 추가.
 * - 데스크톱 앱이 소비하는 트랙 피드(daily/junior_${date}.json, daily/senior_${date}.json)를
 *   GCS에 가산(Additive) 배포한다. 기존 daily/${date}.json(signal+study)은 건드리지 않는다.
 *
 * 산출물:
 *   - daily/junior_${date}.json   (schemaVersion: 2)
 *   - daily/senior_${date}.json   (schemaVersion: 2)
 *   - daily/index.json            (dates 보존 + tracks 가산)
 *
 * 실행: node pipeline/src/tech-composer.mjs [YYYY-MM-DD]
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { callGemini } from './lib/gemini.mjs';
import { readJSON, writeJSON, getTodayKST } from './lib/storage.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Data Contract v2 §1.3 — 관심 도메인 고정 enum
const DOMAINS = ['ai_llm', 'system_design', 'devops', 'tech_lead'];
const TRACKS = ['junior', 'senior'];

const TRACK_PERSONA = {
  junior: '주니어-미드 트랙(역량 축적기): 실무 구현, 디버깅, 생산성 향상에 초점. 손으로 직접 코드를 작성하고 검증하는 액션 위주.',
  senior: '시니어-리더 트랙(역량 재정의기): 아키텍처 의사결정, 기술 부채 관리, 리더십/팀 운영에 초점. 판단·리스크 관리·커뮤니케이션 위주.',
};

// 소문자 영문 키워드 정규화 (계약 §5: tags 자유 태그 + 소문자 정규화)
export function normalizeTag(tag) {
  return String(tag).toLowerCase().trim().replace(/\s+/g, '-');
}

// action_challenge.tasks를 정확히 3개로 보정 + seq 부여 (ko 단일 — 계약 §5)
export function normalizeTasks(rawTasks) {
  const arr = Array.isArray(rawTasks) ? rawTasks.slice(0, 3) : [];
  while (arr.length < 3) arr.push('세부 할 일을 입력하세요');
  return arr.map((text, i) => ({ seq: i + 1, text: String(text).trim() }));
}

export function buildCard(rawCard, track, dateStr, idx) {
  const domain = DOMAINS.includes(rawCard.domain) ? rawCard.domain : DOMAINS[idx % DOMAINS.length];
  const trackTag = track === 'junior' ? 'j' : 's';
  const seq = String(idx + 1).padStart(2, '0');
  const cardId = `card-${dateStr}-${trackTag}-${seq}`;
  const tags = Array.isArray(rawCard.tags) ? rawCard.tags.map(normalizeTag).filter(Boolean) : [];

  return {
    id: cardId,
    track,
    domain,
    title: String(rawCard.title || '').trim(),
    summary: String(rawCard.summary || '').trim(),
    sourceUrl: rawCard.sourceUrl || undefined,
    tags,
    action_challenge: {
      id: `ac-${dateStr}-${trackTag}-${seq}`,
      title: String(rawCard.action_challenge?.title || rawCard.title || '').trim(),
      tasks: normalizeTasks(rawCard.action_challenge?.tasks),
    },
  };
}

async function generateTrackFeed(track, dateStr, systemPrompt) {
  const userTask = [
    `오늘 날짜: ${dateStr}`,
    `트랙(track): ${track} — ${TRACK_PERSONA[track]}`,
    `생성할 도메인 키 목록(각 1개씩, 총 ${DOMAINS.length}개 카드): ${DOMAINS.join(', ')}`,
    `- ai_llm: AI/LLM 엔지니어링`,
    `- system_design: 시스템 설계/아키텍처`,
    `- devops: 인프라/배포/운영`,
    `- tech_lead: 테크 리드/PM/리더십`,
  ].join('\n');

  const prompt = `${systemPrompt}\n\nUser Task:\n${userTask}`;
  console.log(`🤖 [Tech Composer] '${track}' 트랙 카드 생성 요청 중...`);
  const result = await callGemini(prompt);

  const rawCards = Array.isArray(result?.cards) ? result.cards : [];
  if (rawCards.length === 0) {
    throw new Error(`'${track}' 트랙 카드 생성 결과가 비어 있습니다.`);
  }
  const cards = rawCards.map((c, i) => buildCard(c, track, dateStr, i));

  const feed = {
    schemaVersion: 2,
    date: dateStr,
    track,
    generatedAt: new Date().toISOString(),
    domains: [...new Set(cards.map(c => c.domain))],
    cards,
  };
  return feed;
}

// daily/index.json: 기존 dates 보존 + tracks 가산 (계약 §1.4)
async function updateIndex(dateStr) {
  let index = await readJSON('daily/index.json');
  if (!index || typeof index !== 'object') index = {};
  if (!Array.isArray(index.dates)) index.dates = [];
  if (!index.dates.includes(dateStr)) {
    index.dates.push(dateStr);
    index.dates.sort((a, b) => b.localeCompare(a));
  }
  index.schemaVersion = 2;
  index.tracks = TRACKS;
  await writeJSON('daily/index.json', index);
  console.log(`[GCS] daily/index.json 갱신 완료 (dates: ${index.dates.length}개, tracks: ${TRACKS.join('/')})`);
}

async function main() {
  const dateStr = process.argv[2] || process.env.TARGET_DATE || getTodayKST();
  console.log(`🚀 [Tech Composer] 수준별 트랙 피드 생성 시작 — ${dateStr}`);

  const systemPrompt = fs.readFileSync(path.join(__dirname, 'templates', 'tech-prompt.txt'), 'utf-8');

  for (const track of TRACKS) {
    try {
      const feed = await generateTrackFeed(track, dateStr, systemPrompt);
      await writeJSON(`daily/${track}_${dateStr}.json`, feed);
      console.log(`✅ '${track}' 트랙 배포 완료 — 카드 ${feed.cards.length}개`);
    } catch (err) {
      console.error(`❌ '${track}' 트랙 생성 실패:`, err.message);
      throw err;
    }
  }

  await updateIndex(dateStr);
  console.log('═══════════════════════════════════════');
  console.log(`✅ Tech Composer 완료 — ${dateStr}`);
}

// 직접 실행 시에만 파이프라인 구동 (import 테스트 시 자동 실행 방지)
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(err => {
    console.error('❌ [Tech Composer] 치명적 오류:', err);
    process.exit(1);
  });
}
