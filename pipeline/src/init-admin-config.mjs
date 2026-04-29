// 초기 admin config 설정 스크립트
import { db, COLLECTIONS } from './lib/firestore.mjs';

async function init() {
  await db.collection(COLLECTIONS.ADMIN_CONFIG).doc('settings').set(
    { 
      adminEmails: ['matthew.shim@prisincera.com'], 
      updatedAt: new Date() 
    },
    { merge: true }
  );
  console.log('✅ Admin config initialized in Firestore');
  process.exit(0);
}

init().catch(e => { console.error(e); process.exit(1); });
