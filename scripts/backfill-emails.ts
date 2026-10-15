/**
 * One-time backfill: normalizes the buyer email stored on existing tickets,
 * refunds and orders to lowercase.
 *
 * Why: Firestore equality is case-sensitive. Tickets and orders look up their
 * owner with an equality match on the email, and the matching security rules
 * compare it against `request.auth.token.email` — which Firebase Auth always
 * lowercases. Documents written before `src/lib/emails.ts` existed may carry a
 * mixed-case address ("Ada@Example.com"), so they can never be found by their
 * own owner.
 *
 * New writes are normalized at the source, so this only needs to run once. It is
 * idempotent and safe to re-run: documents that are already normalized are skipped.
 *
 * Usage:
 *   npm run backfill:emails -- --dry-run   # report only, never writes
 *   npm run backfill:emails                # apply
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

interface Target {
  /** Collection holding the email. */
  collection: string;
  /** Reads the stored email off a document. */
  read: (data: Record<string, unknown>) => unknown;
  /** Field path for the merge update (a dot addresses a nested field). */
  write: string;
}

const TARGETS: Target[] = [
  {collection: 'tickets', read: (d) => d.buyerEmail, write: 'buyerEmail'},
  // Refund documents copy the ticket email, and are queried the same way.
  {collection: 'refunds', read: (d) => d.buyerEmail, write: 'buyerEmail'},
  // Orders keep the email nested under `buyer`.
  {
    collection: 'orders',
    read: (d) => (d.buyer as {email?: unknown} | undefined)?.email,
    write: 'buyer.email',
  },
];

async function normalizeCollection(
  db: FirebaseFirestore.Firestore,
  target: Target
): Promise<{scanned: number; updated: number}> {
  const snap = await db.collection(target.collection).get();
  const stale = snap.docs.filter((d) =>
    isStale(target.read(d.data() as Record<string, unknown>))
  );

  console.log(`  ${target.collection}: ${snap.size} document(s), ${stale.length} to normalize`);

  for (let i = 0; i < stale.length && !DRY_RUN; i += BATCH_SIZE) {
    const batch = db.batch();
    for (const d of stale.slice(i, i + BATCH_SIZE)) {
      const email = String(target.read(d.data() as Record<string, unknown>) ?? '');
      batch.update(d.ref, {[target.write]: email.trim().toLowerCase()});
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

  const results: {collection: string; updated: number}[] = [];
  for (const target of TARGETS) {
    const {updated} = await normalizeCollection(db, target);
    results.push({collection: target.collection, updated});
  }

  const total = results.reduce((sum, r) => sum + r.updated, 0);
  const summary = results
    .filter((r) => r.updated > 0)
    .map((r) => `${r.updated} ${r.collection}`)
    .join(', ');

  if (total === 0) {
    console.log('✓ Everything was already normalized — nothing to do.');
  } else if (DRY_RUN) {
    console.log(`→ Would normalize ${summary}.`);
    console.log('  Re-run without --dry-run to apply.');
  } else {
    console.log(`✓ Normalized ${summary}.`);
    console.log('  firestore.rules is unchanged — it just compares the lowercased');
    console.log('  account email against the now-normalized field.');
  }
  process.exit(0);
}

main().catch((err) => {
  console.error('✗', err);
  process.exit(1);
});
