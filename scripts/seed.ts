/**
 * Seeds Firestore with the demo data from src/lib/mock-data.ts:
 *  - events collection (10 events)
 *  - demo Auth users (one per role, password `password123`) + profile docs
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
import {MOCK_EVENTS, MOCK_USERS} from '../src/lib/mock-data';

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

  // ---- 1. Events ----------------------------------------------------------
  console.log(`Seeding ${MOCK_EVENTS.length} events…`);
  const eventBatch = db.batch();
  for (const event of MOCK_EVENTS) {
    const ref = db.collection('events').doc(event.id);
    eventBatch.set(ref, {...event, updatedAt: new Date().toISOString()}, {merge: true});
  }
  await eventBatch.commit();
  console.log(`  ✓ events written (${MOCK_EVENTS.map((e) => e.id).join(', ')})`);

  // ---- 2. Demo users (Auth + profile docs) --------------------------------
  console.log(`Seeding ${MOCK_USERS.length} demo users…`);
  for (const user of MOCK_USERS) {
    let uid: string;
    try {
      const existing = await auth.getUserByEmail(user.email);
      uid = existing.uid;
      console.log(`  • ${user.email} already exists — updating password/profile`);
      await auth.updateUser(uid, {password: user.password, displayName: user.name});
    } catch {
      const created = await auth.createUser({
        email: user.email,
        password: user.password,
        displayName: user.name,
      });
      uid = created.uid;
      console.log(`  ✓ created ${user.email}`);
    }

    await db
      .collection('users')
      .doc(uid)
      .set(
        {
          name: user.name,
          email: user.email,
          role: user.role,
          whatsapp: user.whatsapp,
          updatedAt: new Date().toISOString(),
        },
        {merge: true}
      );
  }

  console.log('\n✓ Seed complete.');
  console.log('  Logins: admin|organizer|staff|vendor|attendee@isabievents.ng / password123');
}

main().catch((err) => {
  console.error('✗ Seed failed:', err);
  process.exit(1);
});
