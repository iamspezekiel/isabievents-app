/**
 * Production cleanup: deletes EVERY Firebase Auth user and Firestore profile
 * document EXCEPT the admin account (isabideveloper@gmail.com).
 * Events, orders and tickets are not touched.
 *
 * Usage:
 *   npx tsx scripts/purge-users.ts           # dry run (lists targets)
 *   npx tsx scripts/purge-users.ts --apply   # perform the deletion
 */
import 'dotenv/config';
import {initializeApp, cert, getApps} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';

const ADMIN_EMAIL = 'isabideveloper@gmail.com';
const APPLY = process.argv.includes('--apply');

async function main() {
  if (getApps().length === 0) {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (serviceAccount) {
      initializeApp({credential: cert(JSON.parse(serviceAccount))});
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      initializeApp();
    } else {
      console.error('✗ No server credentials (FIREBASE_SERVICE_ACCOUNT_KEY).');
      process.exit(1);
    }
  }
  const auth = getAuth();
  const db = getFirestore();

  const adminUser = await auth.getUserByEmail(ADMIN_EMAIL);
  console.log(`Admin kept: ${ADMIN_EMAIL} (uid=${adminUser.uid})`);

  // ---- 1. Auth users ------------------------------------------------------
  const toDelete: {uid: string; email?: string}[] = [];
  let page: string | undefined;
  do {
    const res = await auth.listUsers(1000, page);
    page = res.pageToken;
    for (const u of res.users) {
      if (u.uid !== adminUser.uid) toDelete.push({uid: u.uid, email: u.email});
    }
  } while (page);

  console.log(`\nAuth users to delete: ${toDelete.length}`);
  for (const u of toDelete) console.log(`  - ${u.email || u.uid}`);

  if (APPLY && toDelete.length > 0) {
    for (let i = 0; i < toDelete.length; i += 900) {
      const chunk = toDelete.slice(i, i + 900).map((u) => u.uid);
      await auth.deleteUsers(chunk);
    }
    console.log(`  ✓ deleted ${toDelete.length} auth user(s)`);
  }

  // ---- 2. Firestore profile docs -----------------------------------------
  const usersSnap = await db.collection('users').get();
  const orphanDocs = usersSnap.docs.filter((d) => d.id !== adminUser.uid);
  console.log(`\nFirestore users/* docs to delete: ${orphanDocs.length}`);
  for (const d of orphanDocs) {
    const email = (d.data() as {email?: string}).email;
    console.log(`  - ${email || d.id}`);
  }

  if (APPLY && orphanDocs.length > 0) {
    for (let i = 0; i < orphanDocs.length; i += 400) {
      const batch = db.batch();
      for (const d of orphanDocs.slice(i, i + 400)) batch.delete(d.ref);
      await batch.commit();
    }
    console.log('  ✓ deleted profile doc(s)');
  }

  console.log(
    APPLY ? '\n✓ Purge complete.' : '\n✓ Dry run complete. Rerun with --apply to delete.'
  );
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('✗ Purge failed:', err?.message || err);
    process.exit(1);
  });
