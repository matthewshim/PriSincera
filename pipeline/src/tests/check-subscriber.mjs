#!/usr/bin/env node
/**
 * shimks@gravity.co.kr 구독자 Firestore 데이터 조회 및 수정
 */
process.env.GCP_PROJECT_ID = 'prisincera';

import { db } from '../lib/firestore.mjs';

const snap = await db.collection('subscribers').get();

console.log(`총 구독자: ${snap.size}명\n`);

for (const doc of snap.docs) {
  const data = doc.data();
  if (data.email && data.email.includes('shimks')) {
    console.log('=== shimks@gravity.co.kr 데이터 ===');
    console.log('Document ID:', doc.id);
    console.log('Raw data:', JSON.stringify(data, null, 2));
    
    // Firestore Timestamp 객체 처리
    if (data.subscribedAt && typeof data.subscribedAt === 'object' && data.subscribedAt._seconds) {
      const ts = new Date(data.subscribedAt._seconds * 1000);
      console.log('\nsubscribedAt (Timestamp→Date):', ts.toISOString());
    } else if (data.subscribedAt) {
      console.log('\nsubscribedAt (raw):', data.subscribedAt);
      console.log('subscribedAt (Date):', new Date(data.subscribedAt).toISOString());
    } else {
      console.log('\n⚠️ subscribedAt 필드 없음!');
    }
  }
}
