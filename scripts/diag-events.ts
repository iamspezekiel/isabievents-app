/** Validates every event doc for the fields the UI requires. */
import {config} from 'dotenv';
config({path: '.env.local'});
config();

import {initializeApp, cert, getApps} from 'firebase-admin/app';
import {getFirestore} from 'firebase-admin/firestore';

async function main() {
  const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (getApps().length === 0) {
    if (key) initializeApp({credential: cert(JSON.parse(key))});
    else initializeApp();
  }
  const db = getFirestore();
  const snap = await db.collection('events').get();
  console.log(`events total: ${snap.size}`);
  for (const d of snap.docs) {
    const x = d.data() as Record<string, unknown>;
    const problems: string[] = [];
    const price = x.price as {min?: unknown; max?: unknown} | undefined;
    if (!price || typeof price.min !== 'number' || typeof price.max !== 'number') problems.push('price');
    if (!x.image || typeof x.image !== 'string') problems.push('image');
    if (!x.title) problems.push('title');
    if (!x.date || Number.isNaN(new Date(String(x.date)).getTime())) problems.push('date');
    if (!x.organizer || typeof (x.organizer as {name?: string}).name !== 'string') problems.push('organizer');
    if (!x.category) problems.push('category');
    if (!x.city) problems.push('city');
    if (!x.venue) problems.push('venue');
    const verified = (x.organizer as {verified?: boolean} | undefined)?.verified;
    console.log(
      ` ${d.id} | "${String(x.title).slice(0, 40)}" | date=${String(x.date)} | verified=${verified} | tiers=${Array.isArray(x.tiers) ? (x.tiers as unknown[]).length : 0}` +
        (problems.length ? ` | MISSING: ${problems.join(',')}` : '')
    );
  }
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
