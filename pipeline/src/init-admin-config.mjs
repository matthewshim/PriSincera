// admin_config 구조를 역할 기반으로 마이그레이션
import { db, COLLECTIONS } from './lib/firestore.mjs';

async function migrate() {
  const ref = db.collection(COLLECTIONS.ADMIN_CONFIG).doc('settings');
  const doc = await ref.get();
  const data = doc.exists ? doc.data() : {};

  // 이미 admins 맵이 있으면 스킵
  if (data.admins && typeof data.admins === 'object') {
    console.log('✅ Already migrated. Current admins:', data.admins);
    return;
  }

  const emails = data.adminEmails || ['matthew.shim@prisincera.com'];
  const admins = {};
  emails.forEach((email, i) => {
    admins[email.replace(/\./g, '_DOT_').replace(/@/g, '_AT_')] = {
      email,
      role: i === 0 ? 'super_admin' : 'admin',
      addedAt: new Date(),
    };
  });

  await ref.set({
    admins,
    adminEmails: emails, // 하위 호환
    updatedAt: new Date(),
  }, { merge: true });

  console.log('✅ Migrated to role-based structure:', admins);
  process.exit(0);
}

migrate().catch(e => { console.error(e); process.exit(1); });
