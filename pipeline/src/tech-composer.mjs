#!/usr/bin/env node
/**
 * Tech Composer — 수준별(주니어/시니어) 테크 트랙 시그널 피드 생성기 (하이브리드)
 *
 * Data Contract v2 (docs/data_contract_v2.md §1.2) 준수.
 * 콘텐츠 출처 정책: docs/daily-digest/content_sourcing_policy.md (경로 C — 하이브리드)
 *
 * [하이브리드 흐름]
 *   1) config/tech-sources.json 의 도메인별 RSS에서 최신 근거 기사 1개씩 수집(seed)
 *   2) Gemini가 그 근거 위에서 카드 생성 — [학습(개념·핵심포인트) → 실전(액션)]
 *   3) 실제 원문 URL/출처명은 코드에서 주입(환각 URL 방지)
 *
 * 산출물:
 *   - daily/junior_${date}.json, daily/senior_${date}.json (schemaVersion: 2)
 *   - daily/index.json (dates 보존 + tracks 가산 + version/updatedAt)
 *
 * 실행: node pipeline/src/tech-composer.mjs [YYYY-MM-DD]
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { callGemini } from './lib/gemini.mjs';
import { fetchFeed } from './lib/rss.mjs';
import { readJSON, writeJSON, getTodayKST } from './lib/storage.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Data Contract v2 §1.3 — 관심 도메인 고정 enum
const DOMAINS = ['ai_llm', 'system_design', 'devops', 'tech_lead'];
const TRACKS = ['junior', 'senior'];

const DOMAIN_DESC = {
  ai_llm: 'AI/LLM 엔지니어링',
  system_design: '시스템 설계/아키텍처',
  devops: '인프라/배포/운영',
  tech_lead: '테크 리드/PM/리더십',
};

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

// learning.key_points 정규화 (2~4개, 문자열 배열)
export function normalizeKeyPoints(raw) {
  const arr = Array.isArray(raw) ? raw : [];
  return arr
    .map(p => (typeof p === 'object' ? (p.text || '') : p))
    .map(s => String(s).trim())
    .filter(Boolean)
    .slice(0, 4);
}

export function buildCard(rawCard, track, dateStr, idx, seedsByDomain = {}) {
  const domain = DOMAINS.includes(rawCard.domain) ? rawCard.domain : DOMAINS[idx % DOMAINS.length];
  const trackTag = track === 'junior' ? 'j' : 's';
  const seq = String(idx + 1).padStart(2, '0');
  const cardId = `card-${dateStr}-${trackTag}-${seq}`;
  const tags = Array.isArray(rawCard.tags) ? rawCard.tags.map(normalizeTag).filter(Boolean) : [];
  const seed = seedsByDomain[domain] || null;

  return {
    id: cardId,
    track,
    domain,
    title: String(rawCard.title || '').trim(),
    summary: String(rawCard.summary || '').trim(),
    // 학습 레이어 (개념 + 핵심 포인트) — 학습 후 실전 흐름
    learning: {
      concept: String(rawCard.learning?.concept || '').trim(),
      key_points: normalizeKeyPoints(rawCard.learning?.key_points),
    },
    tags,
    // 실제 원문 URL/출처명은 seed에서 코드 주입(환각 URL 방지). 근거 없으면 생략.
    sourceUrl: seed?.url || undefined,
    sourceName: seed?.source || undefined,
    action_challenge: {
      id: `ac-${dateStr}-${trackTag}-${seq}`,
      title: String(rawCard.action_challenge?.title || rawCard.title || '').trim(),
      tasks: normalizeTasks(rawCard.action_challenge?.tasks),
    },
  };
}

// ── 도메인별 근거 기사 수집 (하이브리드 seed) ──
async function collectSeeds() {
  let cfg;
  try {
    cfg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'config', 'tech-sources.json'), 'utf-8'));
  } catch (e) {
    console.warn('[Tech Composer] tech-sources.json 로드 실패 — 근거 없이 보편 지식으로 생성:', e.message);
    return {};
  }
  const maxAgeDays = cfg.settings?.maxAgeDays || 21;
  const maxPerSource = cfg.settings?.maxPerSource || 3;
  const seeds = {};

  for (const domain of DOMAINS) {
    const sources = (cfg.domains?.[domain] || []).filter(s => s.active);
    let best = null;
    for (const src of sources) {
      try {
        // OG 이미지 크롤 생략(withOgImage=false) — 근거 텍스트만 필요, 실행 속도↑
        const articles = await fetchFeed(src, maxPerSource, maxAgeDays, false);
        for (const a of articles) {
          if (!best || new Date(a.publishedAt) > new Date(best.publishedAt)) best = a;
        }
      } catch (e) {
        console.warn(`[Tech Composer] ${domain}/${src.name} 수집 실패(무시): ${e.message}`);
      }
    }
    seeds[domain] = best ? { title: best.title, summary: best.summary, url: best.url, source: best.source } : null;
    console.log(`[Tech Composer] seed ${domain}: ${best ? `${best.source} — ${best.title.slice(0, 40)}` : '없음(보편 지식 생성)'}`);
  }
  return seeds;
}

function buildUserTask(track, dateStr, seeds) {
  const lines = [
    `오늘 날짜: ${dateStr}`,
    `트랙(track): ${track} — ${TRACK_PERSONA[track]}`,
    `생성할 도메인 키 목록(각 1개씩, 총 ${DOMAINS.length}개 카드): ${DOMAINS.join(', ')}`,
    ...DOMAINS.map(d => `- ${d}: ${DOMAIN_DESC[d]}`),
    '',
    '도메인별 근거 기사(주어진 경우 그 내용에 충실하게 학습 카드를 작성):',
  ];
  for (const domain of DOMAINS) {
    const s = seeds[domain];
    if (s) {
      lines.push(`- [${domain}] 출처: ${s.source}`);
      lines.push(`  제목: ${s.title}`);
      lines.push(`  요약: ${(s.summary || '').slice(0, 600)}`);
    } else {
      lines.push(`- [${domain}] (근거 기사 없음 → 해당 분야 보편 지식으로 작성)`);
    }
  }
  return lines.join('\n');
}

async function generateTrackFeed(track, dateStr, systemPrompt, seeds) {
  const prompt = `${systemPrompt}\n\nUser Task:\n${buildUserTask(track, dateStr, seeds)}`;
  console.log(`🤖 [Tech Composer] '${track}' 트랙 카드 생성 요청 중...`);
  // 학습 레이어 추가로 출력량 증가 → maxOutputTokens 상향
  const result = await callGemini(prompt, 5, { maxOutputTokens: 8192 });

  const rawCards = Array.isArray(result?.cards) ? result.cards : [];
  if (rawCards.length === 0) {
    throw new Error(`'${track}' 트랙 카드 생성 결과가 비어 있습니다.`);
  }
  const cards = rawCards.map((c, i) => buildCard(c, track, dateStr, i, seeds));

  return {
    schemaVersion: 2,
    date: dateStr,
    track,
    generatedAt: new Date().toISOString(),
    domains: [...new Set(cards.map(c => c.domain))],
    cards,
  };
}

// daily/index.json: 기존 dates 보존 + tracks 가산 + version/updatedAt (계약 §1.4)
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
  index.version = Number(index.version || 0) + 1;
  index.updatedAt = new Date().toISOString();
  await writeJSON('daily/index.json', index);
  console.log(`[GCS] daily/index.json 갱신 완료 (dates: ${index.dates.length}개, tracks: ${TRACKS.join('/')}, v${index.version})`);
}

async function main() {
  const dateStr = process.argv[2] || process.env.TARGET_DATE || getTodayKST();
  console.log(`🚀 [Tech Composer] 수준별 트랙 피드 생성 시작 (하이브리드) — ${dateStr}`);

  const systemPrompt = fs.readFileSync(path.join(__dirname, 'templates', 'tech-prompt.txt'), 'utf-8');

  console.log('📡 도메인별 근거 기사 수집 중...');
  const seeds = await collectSeeds();

  for (const track of TRACKS) {
    try {
      const feed = await generateTrackFeed(track, dateStr, systemPrompt, seeds);
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
