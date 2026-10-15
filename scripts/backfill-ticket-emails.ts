/**
 * One-time backfill: normalizes the `buyerEmail` stored on existing tickets
 * (and refunds) to lowercase.
 *
 * Why: Firestore equality is case-sensitive. Tickets look up their owner with
 * an equality match on `buyerEmail`, and the `tickets` security rule compares it
 * against `request.auth.token.email` — which Firebase Auth always lowercases.
 * Tickets issued before `src/lib/emails.ts` existed may carry a mixed-case
 * address ("Ada@Example.com"), so they can never be found by their own owner.
 *
 * New writes are normalized at the source, so this only needs to run once. It is
 * idempotent and safe to re-run: documents that are already normalized are skipped.
 *
 * Usage:
 *   npm run backfill:tickets -- --dry-run   # report only, never writes
 *   npm run backfill:tickets                # apply
 */
import {config} from 'dotenv';
config({path: '.env.local'});
config();

import {initializeApp, cert, getApps} from 'firebase-admin/app';
import {getFirestore} from 'firebase-admin/firestore';

const BATCH_SIZE = 400;
const DRY_RUN = process.argv.includes('--dry-run');

/** True when this email would not survive a case-sensitive equality match. */
const isStale = (value: unknown) => {
  const email = String(value ?? '');
  return email !== email.trim().toLowerCase();
};

async function normalizeCollection(
  db: FirebaseFirestore.Firestore,
  collection: string,
  field: string
): Promise<{scanned: number; updated: number}> {
  const snap = await db.collection(collection).get();
  const stale = snap.docs.filter((d) => isStale((d.data() as Record<string, unknown>)[field]));

  console.log(`  ${collection}: ${snap.size} document(s), ${stale.length} to normalize`);

  for (let i = 0; i < stale.length && !DRY_RUN; i += BATCH_SIZE) {
    const batch = db.batch();
    for (const d of stale.slice(i, i + BATCH_SIZE)) {
      const email = String((d.data() as Record<string, unknown>)[field] ?? '');
      batch.update(d.ref, {[field]: email.trim().toLowerCase()});
    }
    await batch.commit();
  }

  return {scanned: snap.size, updated: stale.length};
}

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

  if (DRY_RUN) console.log('DRY RUN — no documents will be changed.\n');
  console.log('Normalizing buyer emails…');
  const tickets = await normalizeCollection(db, 'tickets', 'buyerEmail');
  // Refund documents copy the ticket email; they are queried the same way.
  const refunds = await normalizeCollection(db, 'refunds', 'buyerEmail');

  const total = tickets.updated + refunds.updated;
  if (total === 0) {
    console.log('✓ Everything was already normalized — nothing to do.');
  } else if (DRY_RUN) {
    console.log(`→ Would normalize ${tickets.updated} ticket(s) and ${refunds.updated} refund(s).`);
    console.log('  Re-run without --dry-run to apply.');
  } else {
    console.log(`✓ Normalized ${tickets.updated} ticket(s) and ${refunds.updated} refund(s).`);
    console.log('  Deployed firestore.rules is unchanged — it just compares the');
    console.log('  lowercased account email against the now-normalized field.');
  }
  process.exit(0);
}

main().catch((err) => {
  console.error('✗', err);
  process.exit(1);
});
