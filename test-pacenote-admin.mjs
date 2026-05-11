import { db, auth } from './pipeline/src/lib/firestore.mjs';

async function testListUsers() {
  try {
    const listUsersResult = await auth.listUsers(100);
    console.log(`Found ${listUsersResult.users.length} users in Auth`);
    let pacersCount = 0;
    
    for (const user of listUsersResult.users) {
      const weeksSnap = await db.collection('pacenotes').doc(user.uid).collection('weeks').limit(1).get();
      if (!weeksSnap.empty) {
        pacersCount++;
      }
    }
    console.log(`Found ${pacersCount} pacers`);
  } catch (err) {
    console.error('Error:', err.message);
  }
}

testListUsers();
