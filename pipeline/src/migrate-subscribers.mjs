#!/usr/bin/env node
/**
 * Buttondown → GCS 구독자 마이그레이션 스크립트 (1회성)
 *
 * 사용법:
 *   1. Buttondown 대시보드에서 구독자 CSV 내보내기
 *   2. 이 스크립트의 CSV_PATH를 수정
 *   3. 실행: node pipeline/src/migrate-subscribers.mjs
 *
 * CSV 형식 예상:
 *   email,created_at,type,notes
 *   user@example.com,2026-04-20T10:00:00Z,regular,""
 *
 * 또는 이메일만 한 줄씩:
 *   user@example.com
 *   another@example.com
 */
import { readFileSync } from 'fs';
import { Storage } from '@google-cloud/storage';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const storage = new Storage();
const BUCKET = process.env.GCS_BUCKET || 'prisincera-prisignal-data';
const SUBSCRIBERS_PATH = 'subscribers/active.json';

// ── 설정 ──
const CSV_PATH = process.argv[2] || join(__dirname, '..', 'data', 'buttondown-subscribers.csv');
const DRY_RUN = process.argv.includes('--dry-run');

async function main() {
  console.log('═══════════════════════════════════════');
  console.log('📦 Buttondown → GCS 구독자 마이그레이션');
  console.log(`   CSV: ${CSV_PATH}`);
  console.log(`   GCS: gs://${BUCKET}/${SUBSCRIBERS_PATH}`);
  console.log(`   모드: ${DRY_RUN ? '🔍 DRY RUN (실제 저장 안 함)' : '💾 실행'}`);
  console.log('═══════════════════════════════════════\n');

  // CSV 로드
  let csvContent;
  try {
    csvContent = readFileSync(CSV_PATH, 'utf-8');
  } catch (err) {
    console.error(`❌ CSV 파일을 읽을 수 없습니다: ${CSV_PATH}`);
    console.error(`   Buttondown 대시보드에서 구독자 CSV를 내보내고,`);
    console.error(`   파일 경로를 인자로 전달하세요:`);
    console.error(`   node pipeline/src/migrate-subscribers.mjs <csv-path>`);
    process.exit(1);
  }

  // CSV 파싱 (간단한 파서)
  const lines = csvContent.trim().split('\n').map(l => l.trim()).filter(Boolean);
  const subscribers = [];
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  for (const line of lines) {
    // CSV 헤더 스킵
    if (line.toLowerCase().startsWith('email') || line.startsWith('#')) continue;

    // 첫 번째 컬럼이 이메일
    const parts = line.split(',');
    const email = (parts[0] || '').trim().toLowerCase().replace(/^"/, '').replace(/"$/, '');
    const createdAt = (parts[1] || '').trim().replace(/^"/, '').replace(/"$/, '');

    if (!emailRe.test(email)) {
      console.log(`  ⚠ 건너뜀 (유효하지 않은 이메일): ${email}`);
      continue;
    }

    subscribers.push({
      email,
      status: 'active',
      subscribedAt: createdAt || new Date().toISOString(),
      source: 'import',
    });
  }

  console.log(`📊 파싱 결과: ${subscribers.length}명\n`);

  if (subscribers.length === 0) {
    console.log('구독자가 없습니다. 종료.');
    return;
  }

  // 기존 GCS 데이터 확인
  let existingData;
  try {
    const [content] = await storage.bucket(BUCKET).file(SUBSCRIBERS_PATH).download();
    existingData = JSON.parse(content.toString('utf-8'));
    console.log(`📋 기존 GCS 구독자: ${(existingData.subscribers || []).length}명`);
  } catch (err) {
    if (err.code === 404) {
      console.log('📋 기존 GCS 파일 없음 (신규 생성)');
      existingData = { version: 1, updatedAt: new Date().toISOString(), subscribers: [] };
    } else {
      throw err;
    }
  }

  // 병합 (중복 제거)
  const emailSet = new Set((existingData.subscribers || []).map(s => s.email));
  let added = 0;
  let skipped = 0;

  for (const sub of subscribers) {
    if (emailSet.has(sub.email)) {
      skipped++;
      continue;
    }
    existingData.subscribers.push(sub);
    emailSet.add(sub.email);
    added++;
  }

  existingData.updatedAt = new Date().toISOString();

  console.log(`\n📊 병합 결과:`);
  console.log(`   추가: ${added}명`);
  console.log(`   건너뜀 (중복): ${skipped}명`);
  console.log(`   최종 합계: ${existingData.subscribers.length}명\n`);

  // 저장
  if (DRY_RUN) {
    console.log('🔍 DRY RUN 모드 — 실제 저장을 수행하지 않습니다.');
    console.log('   --dry-run 플래그를 제거하고 다시 실행하세요.\n');
    // 샘플 출력
    console.log('📄 저장될 데이터 미리보기 (처음 3명):');
    console.log(JSON.stringify(existingData.subscribers.slice(0, 3), null, 2));
  } else {
    const content = JSON.stringify(existingData, null, 2);
    await storage.bucket(BUCKET).file(SUBSCRIBERS_PATH).save(content, {
      contentType: 'application/json',
      metadata: { cacheControl: 'no-cache' },
    });
    console.log(`✅ 저장 완료: gs://${BUCKET}/${SUBSCRIBERS_PATH}`);
  }

  console.log('\n═══════════════════════════════════════');
  console.log('마이그레이션 완료!');
  console.log('═══════════════════════════════════════');
}

main().catch(err => {
  console.error('❌ 마이그레이션 실패:', err.message);
  process.exit(1);
});
