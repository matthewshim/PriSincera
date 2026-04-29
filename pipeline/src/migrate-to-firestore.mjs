#!/usr/bin/env node
/**
 * GCS JSON → Firestore 구독자 마이그레이션 (1회성)
 *
 * 사용법:
 *   node pipeline/src/migrate-to-firestore.mjs           # 실행
 *   node pipeline/src/migrate-to-firestore.mjs --dry-run  # 미리보기
 */
import { Storage } from '@google-cloud/storage';
import { db, COLLECTIONS } from './lib/firestore.mjs';
import { createHash } from 'crypto';

const storage = new Storage();
const BUCKET = process.env.GCS_BUCKET || 'prisincera-prisignal-data';
const DRY_RUN = process.argv.includes('--dry-run');

function emailHash(email) {
  return createHash('sha256').update(email.toLowerCase().trim()).digest('hex').slice(0, 16);
}

async function main() {
  console.log('═══════════════════════════════════════');
  console.log('📦 GCS JSON → Firestore 구독자 마이그레이션');
  console.log(`   모드: ${DRY_RUN ? '🔍 DRY RUN' : '💾 실행'}`);
  console.log('═══════════════════════════════════════\n');

  // 1. GCS에서 기존 구독자 로드
  let gcsData;
  try {
    const [content] = await storage.bucket(BUCKET).file('subscribers/active.json').download();
    gcsData = JSON.parse(content.toString('utf-8'));
  } catch (err) {
    if (err.code === 404) {
      console.log('📋 GCS 구독자 파일 없음 — 빈 상태에서 시작');
      gcsData = { subscribers: [] };
    } else {
      throw err;
    }
  }

  const subscribers = gcsData.subscribers || [];
  console.log(`📊 GCS 구독자: ${subscribers.length}명\n`);

  if (subscribers.length === 0) {
    console.log('마이그레이션할 데이터가 없습니다.');
    return;
  }

  // 2. Firestore 기존 데이터 확인
  const col = db.collection(COLLECTIONS.SUBSCRIBERS);
  const existingSnap = await col.get();
  const existingEmails = new Set(existingSnap.docs.map(d => d.data().email));
  console.log(`📋 Firestore 기존 구독자: ${existingEmails.size}명`);

  // 3. 배치 쓰기
  let added = 0;
  let skipped = 0;
  const batch = db.batch();

  for (const sub of subscribers) {
    if (existingEmails.has(sub.email)) {
      skipped++;
      continue;
    }
    const docRef = col.doc(emailHash(sub.email));
    batch.set(docRef, {
      email: sub.email,
      status: sub.status || 'active',
      subscribedAt: sub.subscribedAt ? new Date(sub.subscribedAt) : new Date(),
      source: sub.source || 'import',
    });
    added++;
  }

  console.log(`\n📊 결과: 추가 ${added}명 / 건너뜀 ${skipped}명`);

  if (DRY_RUN) {
    console.log('\n🔍 DRY RUN — 실제 저장하지 않습니다.');
    console.log('   --dry-run 플래그를 제거하고 다시 실행하세요.');
  } else if (added > 0) {
    await batch.commit();
    console.log(`\n✅ Firestore에 ${added}명 저장 완료`);
  } else {
    console.log('\n추가할 데이터가 없습니다.');
  }

  console.log('\n═══════════════════════════════════════');
}

main().catch(err => {
  console.error('❌ 마이그레이션 실패:', err.message);
  process.exit(1);
});
