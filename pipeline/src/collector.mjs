#!/usr/bin/env node
/**
 * PriSignal Collector — 매일 06:00 KST 실행
 *
 * 1. sources.json에서 활성 소스 목록 로드
 * 2. 전 소스 RSS 피드 병렬 수집 (지난 24시간)
 * 3. 기존 주간 후보 풀과 중복 제거
 * 4. 후보 풀에 추가 저장 (GCS)
 */
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { fetchAllFeeds, deduplicateArticles } from './lib/rss.mjs';
import { readJSON, writeJSON, getCandidatesPath } from './lib/storage.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  const startTime = Date.now();
  console.log('═══════════════════════════════════════');
  console.log('📥 PriSignal Collector 시작');
  console.log(`   시각: ${new Date().toISOString()}`);
  console.log('═══════════════════════════════════════');

  // 1. 소스 설정 로드
  const configPath = join(__dirname, '..', 'config', 'sources.json');
  const config = JSON.parse(readFileSync(configPath, 'utf-8'));
  console.log(`[Config] ${config.sources.length}개 소스 로드 완료`);

  // 2. RSS 수집
  const newArticles = await fetchAllFeeds(config.sources);

  if (newArticles.length === 0) {
    console.log('[Collector] 수집된 신규 아티클 없음. 종료.');
    return;
  }

  // 3. 기존 후보 풀 로드 + 중복 제거
  const candidatesPath = getCandidatesPath();
  const existing = await readJSON(candidatesPath);
  const existingArticles = existing?.articles || [];

  const deduplicated = deduplicateArticles(newArticles, existingArticles);

  if (deduplicated.length === 0) {
    console.log('[Collector] 모든 아티클이 이미 수집됨. 종료.');
    return;
  }

  // 4. 후보 풀 저장
  const updatedArticles = [...existingArticles, ...deduplicated];
  await writeJSON(candidatesPath, {
    targetMonday: candidatesPath.replace('candidates/', '').replace('.json', ''),
    updatedAt: new Date().toISOString(),
    totalCount: updatedArticles.length,
    articles: updatedArticles,
  });

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log('═══════════════════════════════════════');
  console.log(`✅ Collector 완료 (${elapsed}초)`);
  console.log(`   신규 추가: ${deduplicated.length}개`);
  console.log(`   누적 후보: ${updatedArticles.length}개`);
  console.log(`   저장 위치: ${candidatesPath}`);
  console.log('═══════════════════════════════════════');
}

main().catch(err => {
  console.error('❌ Collector 실패:', err.message);
  console.error(err.stack);
  process.exit(1);
});
