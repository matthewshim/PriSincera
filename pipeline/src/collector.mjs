#!/usr/bin/env node
/**
 * PriSignal Collector — 매일 06:00 KST 실행
 *
 * [Daily Model v2]
 * 1. sources.json에서 활성 소스 목록 로드
 * 2. 전 소스 RSS 피드 병렬 수집 (지난 24시간)
 * 3. 오늘 기존 수집분과 중복 제거
 * 4. 데일리 JSON 저장 (GCS daily/{date}.json — 공개 읽기)
 */
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { fetchAllFeeds, deduplicateArticles } from './lib/rss.mjs';
import { readJSON, getTodayKST, getDailyPath, writeDailyJSON } from './lib/storage.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  const startTime = Date.now();
  const todayStr = getTodayKST();

  console.log('═══════════════════════════════════════');
  console.log('📥 PriSignal Collector v2 (Daily) 시작');
  console.log(`   날짜: ${todayStr}`);
  console.log(`   시각: ${new Date().toISOString()}`);
  console.log('═══════════════════════════════════════');

  // 1. 소스 설정 로드
  const configPath = join(__dirname, '..', 'config', 'sources.json');
  const config = JSON.parse(readFileSync(configPath, 'utf-8'));
  console.log(`[Config] ${config.sources.length}개 소스 로드 완료`);

  // 2. RSS 수집
  const newArticles = await fetchAllFeeds(config.sources);

  if (newArticles.length === 0) {
    console.log('[Collector] 수집된 신규 아티클 없음.');
    // 빈 데일리 JSON 생성 (페이지에 "오늘은 시그널이 조용합니다" 표시)
    await writeDailyJSON(todayStr, {
      date: todayStr,
      status: 'collected',
      total: 0,
      articles: [],
      collectedAt: new Date().toISOString(),
    });
    console.log('[Collector] 빈 데일리 JSON 저장 완료. 종료.');
    return;
  }

  // 3. 오늘 기존 수집분과 중복 제거 (하루 2회+ 실행 대비)
  const dailyPath = getDailyPath(todayStr);
  const existing = await readJSON(dailyPath);
  const existingArticles = existing?.articles || [];

  const deduplicated = deduplicateArticles(newArticles, existingArticles);

  if (deduplicated.length === 0) {
    console.log('[Collector] 모든 아티클이 이미 수집됨. 종료.');
    return;
  }

  // 4. 데일리 JSON 저장 (공개)
  const allArticles = [...existingArticles, ...deduplicated];
  await writeDailyJSON(todayStr, {
    date: todayStr,
    status: 'collected',
    total: allArticles.length,
    articles: allArticles,
    collectedAt: new Date().toISOString(),
  });

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log('═══════════════════════════════════════');
  console.log(`✅ Collector v2 완료 (${elapsed}초)`);
  console.log(`   날짜: ${todayStr}`);
  console.log(`   신규 추가: ${deduplicated.length}개`);
  console.log(`   오늘 누적: ${allArticles.length}개`);
  console.log(`   저장: daily/${todayStr}.json (공개)`);
  console.log('═══════════════════════════════════════');
}

main().catch(err => {
  console.error('❌ Collector 실패:', err.message);
  console.error(err.stack);
  process.exit(1);
});
