#!/usr/bin/env node
/**
 * PriSignal OG Image Backfill — 기존 데일리 JSON에 ogImage 필드를 추가합니다.
 *
 * 사용법: node pipeline/src/backfill-og.mjs [시작일] [종료일]
 * 예시:   node pipeline/src/backfill-og.mjs 2026-04-21 2026-04-26
 *
 * 기본값: 최근 7일
 */
import { readJSON, writeDailyJSON, getDailyPath, getRecentDailyDates } from './lib/storage.mjs';
import { fetchOgImage } from './lib/rss.mjs';

const CONCURRENCY = 10; // 동시 크롤링 수 제한

/**
 * 배열을 N개씩 나누어 순차 실행합니다.
 */
async function processInBatches(items, batchSize, fn) {
  const results = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.allSettled(batch.map(fn));
    results.push(...batchResults);
  }
  return results;
}

async function main() {
  const args = process.argv.slice(2);
  let dates;

  if (args.length >= 2) {
    // 시작일~종료일 범위 생성
    const start = new Date(args[0] + 'T00:00:00');
    const end = new Date(args[1] + 'T00:00:00');
    dates = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(d.toISOString().split('T')[0]);
    }
  } else {
    dates = getRecentDailyDates(7);
  }

  console.log('═══════════════════════════════════════');
  console.log('🖼️  PriSignal OG Image Backfill');
  console.log(`   대상 날짜: ${dates[dates.length - 1]} ~ ${dates[0]}`);
  console.log(`   총 ${dates.length}일`);
  console.log('═══════════════════════════════════════');

  let totalArticles = 0;
  let totalOgAdded = 0;
  let totalAlreadyHad = 0;

  for (const dateStr of dates) {
    const path = getDailyPath(dateStr);
    const data = await readJSON(path);

    if (!data || !data.articles || data.articles.length === 0) {
      console.log(`[${dateStr}] 데이터 없음, 건너뜀`);
      continue;
    }

    // ogImage가 없는 아티클만 필터링
    const needsOg = data.articles.filter(a => !a.ogImage);
    const alreadyHasOg = data.articles.length - needsOg.length;
    totalAlreadyHad += alreadyHasOg;

    if (needsOg.length === 0) {
      console.log(`[${dateStr}] 모든 아티클에 OG 이미지 존재 (${data.articles.length}개), 건너뜀`);
      continue;
    }

    console.log(`[${dateStr}] ${data.articles.length}개 아티클 중 ${needsOg.length}개 OG 크롤링 시작...`);

    // 배치 크롤링
    const results = await processInBatches(needsOg, CONCURRENCY, async (article) => {
      const ogImage = await fetchOgImage(article.url);
      return { id: article.id, ogImage };
    });

    // 결과 병합
    const ogMap = new Map();
    for (const r of results) {
      if (r.status === 'fulfilled' && r.value.ogImage) {
        ogMap.set(r.value.id, r.value.ogImage);
      }
    }

    let addedCount = 0;
    for (const article of data.articles) {
      if (!article.ogImage && ogMap.has(article.id)) {
        article.ogImage = ogMap.get(article.id);
        addedCount++;
      }
      // ogImage 필드가 없으면 null로 초기화
      if (article.ogImage === undefined) {
        article.ogImage = null;
      }
    }

    totalArticles += data.articles.length;
    totalOgAdded += addedCount;

    // GCS에 업데이트된 JSON 저장
    await writeDailyJSON(dateStr, data);
    console.log(`[${dateStr}] ✅ OG 이미지 ${addedCount}/${needsOg.length}개 추가 (기존 ${alreadyHasOg}개)`);
  }

  console.log('═══════════════════════════════════════');
  console.log(`✅ Backfill 완료`);
  console.log(`   처리 아티클: ${totalArticles}개`);
  console.log(`   OG 신규 추가: ${totalOgAdded}개`);
  console.log(`   기존 보유: ${totalAlreadyHad}개`);
  console.log('═══════════════════════════════════════');
}

main().catch(err => {
  console.error('❌ Backfill 실패:', err.message);
  console.error(err.stack);
  process.exit(1);
});
