#!/usr/bin/env node
/**
 * PriSignal Composer — 매일 07:00 KST 실행
 *
 * [Daily Model v2]
 * 1. 오늘의 데일리 JSON 로드 (Collector 결과)
 * 2. Gemini Flash로 전체 아티클 SIGNAL 스코어링
 * 3. Tier 가중치 적용
 * 4. 상위 5개 DM 픽 선정
 * 5. DM 픽에 에디터 코멘트 생성
 * 6. 스코어링된 데일리 JSON 갱신 (dm_picks 포함)
 * 7. DM 발송 (Buttondown — 즉시 or 08:00 예약)
 */
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { scoreArticles, generateComments } from './lib/gemini.mjs';
import { applyTierWeights, selectTopN, assembleDailyDM } from './lib/scoring.mjs';
import {
  readJSON, getTodayKST, getDailyPath,
  writeDailyJSON, getDailySendTime,
} from './lib/storage.mjs';
import { sendEmail, scheduleEmail } from './lib/buttondown.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  const startTime = Date.now();
  const todayStr = getTodayKST();

  console.log('═══════════════════════════════════════');
  console.log('🤖 PriSignal Composer v2 (Daily) 시작');
  console.log(`   날짜: ${todayStr}`);
  console.log(`   시각: ${new Date().toISOString()}`);
  console.log('═══════════════════════════════════════');

  // 설정 로드
  const configPath = join(__dirname, '..', 'config', 'sources.json');
  const config = JSON.parse(readFileSync(configPath, 'utf-8'));
  const settings = config.settings;

  // 1. 오늘 데일리 JSON 로드
  const dailyPath = getDailyPath(todayStr);
  const dailyData = await readJSON(dailyPath);

  if (!dailyData || !dailyData.articles || dailyData.articles.length === 0) {
    console.log('[Composer] 오늘 수집된 아티클이 없습니다.');
    // 빈 데일리를 scored 상태로 업데이트 (페이지에서 빈 상태 표시)
    await writeDailyJSON(todayStr, {
      date: todayStr,
      status: 'scored',
      total: 0,
      articles: [],
      dm_picks: [],
      scoredAt: new Date().toISOString(),
    });
    console.log('[Composer] 빈 데일리 상태 갱신. DM 발송 스킵. 종료.');
    return;
  }

  const candidates = dailyData.articles;
  console.log(`[Composer] 오늘 아티클: ${candidates.length}개`);

  // 2. AI 스코어링 (전체 아티클)
  console.log('\n--- Phase 1: SIGNAL 스코어링 ---');
  const scored = await scoreArticles(candidates);

  // 3. Tier 가중치 적용
  console.log('\n--- Phase 2: 가중치 + 선정 ---');
  const weighted = applyTierWeights(scored);

  // 4. 상위 5개 DM 픽 선정
  const dmPicks = selectTopN(weighted, settings.dmPickCount || 5);

  if (dmPicks.length === 0) {
    console.error('❌ DM 픽 선정 실패.');
    await saveAndExit(todayStr, weighted, []);
    return;
  }

  // 5. DM 픽에 에디터 코멘트 생성
  console.log('\n--- Phase 3: 에디터 코멘트 ---');
  const dmWithComments = await generateComments(dmPicks);
  const dmPickIds = dmWithComments.map(a => a.id);

  // 6. 품질 필터링 — 카테고리별 최소 보장 + 점수 필터 + 카테고리별 캡
  //    Pass 1: 카테고리별 최소 개수 보장 (점수 무관, 상위 N개)
  //    Pass 2: 점수 임계값 이상 기사 추가 (최소 보장 제외)
  //    Pass 3: 카테고리별 최대 캡 적용
  const MIN_PER_CATEGORY = 2;     // 카테고리당 최소 2개 보장 (있는 만큼)
  const MAX_PER_CATEGORY = 8;     // 카테고리당 최대 8개
  const MIN_WEIGHTED_SCORE = 14;  // 가중 점수 14점 미만 제외 (최소 보장분 제외)

  const sorted = [...weighted].sort((a, b) => b.weightedScore - a.weightedScore);

  // Pass 1: 카테고리별 최소 보장 — 점수와 무관하게 상위 N개 확보
  const guaranteed = new Set();
  const catMinCounts = {};
  for (const a of sorted) {
    catMinCounts[a.category] = (catMinCounts[a.category] || 0) + 1;
    if (catMinCounts[a.category] <= MIN_PER_CATEGORY) {
      guaranteed.add(a.id);
    }
  }

  // Pass 2: 점수 임계값 통과 기사 + DM 픽 추가
  const qualifiedIds = new Set(guaranteed);
  for (const a of sorted) {
    if (a.weightedScore >= MIN_WEIGHTED_SCORE || dmPickIds.includes(a.id)) {
      qualifiedIds.add(a.id);
    }
  }

  // Pass 3: 카테고리별 최대 캡 적용
  const catCapCounts = {};
  const cappedArticles = sorted.filter(a => {
    if (!qualifiedIds.has(a.id)) return false;
    catCapCounts[a.category] = (catCapCounts[a.category] || 0) + 1;
    // 최소 보장분과 DM 픽은 캡에서 제외
    if (guaranteed.has(a.id) || dmPickIds.includes(a.id)) return true;
    return catCapCounts[a.category] <= MAX_PER_CATEGORY;
  });

  // 필터 결과 카테고리별 로깅
  const catFinal = {};
  cappedArticles.forEach(a => { catFinal[a.category] = (catFinal[a.category] || 0) + 1; });
  const catSummary = Object.entries(catFinal).map(([k, v]) => `${k}:${v}`).join(', ');
  console.log(`[Composer] 품질 필터: ${weighted.length}개 → ${cappedArticles.length}개 (최소 ${MIN_PER_CATEGORY}/카테고리, 점수 ${MIN_WEIGHTED_SCORE}+, 최대 ${MAX_PER_CATEGORY}/카테고리)`);
  console.log(`[Composer] 카테고리별: ${catSummary}`);

  // 7. 스코어링된 데일리 JSON 갱신
  // 전체 아티클에 점수 반영 + DM 픽 코멘트 반영
  const commentMap = new Map(dmWithComments.map(a => [a.id, a.editorComment]));
  const finalArticles = cappedArticles
    .map(a => ({
      ...a,
      isDmPick: dmPickIds.includes(a.id),
      editorComment: commentMap.get(a.id) || null,
    }));

  await writeDailyJSON(todayStr, {
    date: todayStr,
    status: 'scored',
    total: finalArticles.length,
    dmPickCount: dmWithComments.length,
    articles: finalArticles,
    dm_picks: dmPickIds,
    scoredAt: new Date().toISOString(),
  });

  console.log(`[Composer] 데일리 JSON 갱신 완료: ${finalArticles.length}개 (DM 픽 ${dmWithComments.length}개)`);

  // 7. DM 발송
  console.log('\n--- Phase 4: DM 발송 ---');
  const dailyPageUrl = `https://www.prisincera.com/prisignal/${todayStr}`;
  const body = assembleDailyDM({
    date: todayStr,
    articles: dmWithComments,
    dailyPageUrl,
    totalCount: finalArticles.length,
  });

  const subject = `📡 PriSignal Daily — ${formatKoreanDate(todayStr)}`;

  const sendTime = getDailySendTime();
  let emailResult;
  if (sendTime) {
    // 08:00 KST 이전이면 예약 발송
    emailResult = await scheduleEmail(subject, body, sendTime);
  } else {
    // 08:00 이후면 즉시 발송
    emailResult = await sendEmail(subject, body);
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log('\n═══════════════════════════════════════');
  console.log(`✅ Composer v2 완료 (${elapsed}초)`);
  console.log(`   날짜: ${todayStr}`);
  console.log(`   전체 아티클: ${finalArticles.length}개`);
  console.log(`   DM 픽: ${dmWithComments.length}개`);
  console.log(`   Buttondown ID: ${emailResult.id}`);
  console.log('═══════════════════════════════════════');
}

/** 스코어링까지만 저장하고 종료 */
async function saveAndExit(todayStr, articles, dmPicks) {
  await writeDailyJSON(todayStr, {
    date: todayStr,
    status: 'scored',
    total: articles.length,
    dmPickCount: 0,
    articles: articles.sort((a, b) => b.weightedScore - a.weightedScore),
    dm_picks: dmPicks,
    scoredAt: new Date().toISOString(),
  });
  console.log('[Composer] 스코어링만 저장 완료. DM 발송 스킵.');
}

/** 날짜를 한국어 형식으로 포맷 */
function formatKoreanDate(dateStr) {
  const [y, m, d] = dateStr.split('-');
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  return `${Number(m)}/${Number(d)}(${days[date.getDay()]})`;
}

main().catch(err => {
  console.error('❌ Composer 실패:', err.message);
  console.error(err.stack);
  process.exit(1);
});
