import { getStorage } from 'firebase-admin/storage';
import { db, COLLECTIONS } from './pipeline/src/lib/firestore.mjs';

async function test() {
  const bucketName = process.env.GCS_BUCKET || 'prisincera-prisignal-data';
  let dates = [];
  try {
    const bucket = getStorage().bucket(bucketName);
    const [content] = await bucket.file('daily/index.json').download();
    const index = JSON.parse(content.toString('utf-8'));
    dates = index.dates || [];
    console.log('GCS dates:', dates);
  } catch (err) {
    console.error('GCS fallback triggered:', err.message);
    const snap = await db.collection(COLLECTIONS.EMAIL_LOGS)
      .where('date', '>=', '2000-01-01')
      .orderBy('date', 'desc')
      .limit(30)
      .get();
    dates = snap.docs.map(d => d.data().date);
    dates = [...new Set(dates)];
    console.log('Firestore dates:', dates);
  }
}
test().catch(console.error);
