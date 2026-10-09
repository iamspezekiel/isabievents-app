/**
 * Production bootstrap: ensures the admin account exists in Firebase Auth +
 * Firestore. No demo events or demo users are seeded — the database holds
 * only real data.
 *
 * Usage:
 *   1. Fill FIREBASE_SERVICE_ACCOUNT_KEY (or GOOGLE_APPLICATION_CREDENTIALS)
 *      in .env.local
 *   2. npm run seed
 *
 * Requires the Firebase web config (NEXT_PUBLIC_FIREBASE_*) to match the same
 * project as the service account.
 */
import {config} from 'dotenv';
config({path: '.env.local'});
config(); // also allow plain .env

import {initializeApp, cert, getApps} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';

const ADMIN = {
  name: 'Admin Master',
  email: 'isabideveloper@gmail.com',
  password: 'Password123',
  whatsapp: '+2349024244140',
};

async function main() {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (getApps().length === 0) {
    if (serviceAccount) {
      initializeApp({credential: cert(JSON.parse(serviceAccount))});
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      initializeApp();
    } else {
      console.error(
        '✗ No server credentials.\n' +
          '  Set FIREBASE_SERVICE_ACCOUNT_KEY (service-account JSON, single line)\n' +
          '  or GOOGLE_APPLICATION_CREDENTIALS in .env.local'
      );
      process.exit(1);
    }
  }

  const db = getFirestore();
  const auth = getAuth();

  let uid: string;
  try {
    const existing = await auth.getUserByEmail(ADMIN.email);
    uid = existing.uid;
    await auth.updateUser(uid, {password: ADMIN.password, displayName: ADMIN.name});
    console.log(`  • ${ADMIN.email} already exists — password/profile updated`);
  } catch {
    const created = await auth.createUser({
      email: ADMIN.email,
      password: ADMIN.password,
      displayName: ADMIN.name,
    });
    uid = created.uid;
    console.log(`  ✓ created ${ADMIN.email}`);
  }

  await db
    .collection('users')
    .doc(uid)
    .set(
      {
        name: ADMIN.name,
        email: ADMIN.email,
        role: 'admin',
        whatsapp: ADMIN.whatsapp,
        updatedAt: new Date().toISOString(),
      },
      {merge: true}
    );

  console.log('\n✓ Admin ready: isabideveloper@gmail.com / Password123');
}

main().catch((err) => {
  console.error('✗ Bootstrap failed:', err);
  process.exit(1);
});
