import { Storage } from '@google-cloud/storage';
import { saveDailySignal } from './repositories/DailyRepository.mjs';

const storage = new Storage();
const BUCKET = process.env.GCS_BUCKET || 'prisincera-prisignal-data';

async function migrate() {
  console.log('Starting daily_signals migration from GCS to Firestore...');
  
  try {
    const [indexContent] = await storage.bucket(BUCKET).file('daily/index.json').download();
    const index = JSON.parse(indexContent.toString('utf-8'));
    const dates = index.dates || [];
    
    console.log(`Found ${dates.length} daily signals in GCS index.`);
    
    for (const dateStr of dates) {
      try {
        console.log(`Migrating ${dateStr}...`);
        const [content] = await storage.bucket(BUCKET).file(`daily/${dateStr}.json`).download();
        const data = JSON.parse(content.toString('utf-8'));
        
        await saveDailySignal(dateStr, data);
        console.log(`✅ Migrated ${dateStr} successfully.`);
      } catch (err) {
        console.error(`❌ Failed to migrate ${dateStr}:`, err.message);
      }
    }
    console.log('Migration completed!');
  } catch (err) {
    console.error('Failed to read index.json from GCS:', err.message);
  }
}

migrate();
