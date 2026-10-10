/**
 * Deletes EVERY document in the `events` collection (Firebase request).
 * Orders, tickets, users and settings are untouched.
 *
 * Usage: npx tsx scripts/clear-events.ts
 */
import {config} from 'dotenv';
config({path: '.env.local'});
config();

import {initializeApp, cert, getApps} from 'firebase-admin/app';
import {getFirestore} from 'firebase-admin/firestore';

async function main() {
  const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (getApps().length === 0) {
    if (key) initializeApp({credential: cert(JSON.parse(key))});
    else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) initializeApp();
    else {
      console.error('✗ No server credentials (FIREBASE_SERVICE_ACCOUNT_KEY).');
      process.exit(1);
    }
  }
  const db = getFirestore();
  const snap = await db.collection('events').get();
  console.log(`Events found: ${snap.size}`);

  let deleted = 0;
  for (let i = 0; i < snap.docs.length; i += 400) {
    const batch = db.batch();
    for (const d of snap.docs.slice(i, i + 400)) {
      batch.delete(d.ref);
      deleted++;
    }
    await batch.commit();
  }
  console.log(`✓ Deleted ${deleted} event document(s) from Firestore.`);
  process.exit(0);
}

main().catch((err) => {
  console.error('✗', err);
  process.exit(1);
});
