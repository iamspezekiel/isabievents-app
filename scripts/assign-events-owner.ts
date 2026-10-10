/**
 * Transfers ownership of the 7 real (public-record) events to
 * isabiwp.ng@gmail.com — organizerUid/organizerEmail/name on each doc.
 * Creates the account (organizer role) if it does not exist yet and
 * prints the generated temporary password.
 *
 * The 10 seeded demo events (e1..e10) stay with the admin account.
 *
 * Usage: npx tsx scripts/assign-events-owner.ts
 */
import {config} from 'dotenv';
config({path: '.env.local'});
config();

import {randomBytes} from 'crypto';
import {initializeApp, cert, getApps} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';

const OWNER_EMAIL = 'isabiwp.ng@gmail.com';

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
  const auth = getAuth();
  const db = getFirestore();

  // 1. Ensure the owner account exists.
  let uid: string;
  let tempPassword: string | null = null;
  let displayName = 'isabiwp.ng';
  try {
    const user = await auth.getUserByEmail(OWNER_EMAIL);
    uid = user.uid;
    console.log(`• Account already exists: ${OWNER_EMAIL} (uid ${uid})`);
    const profileSnap = await db.collection('users').doc(uid).get();
    const profile = (profileSnap.exists ? profileSnap.data() : {}) as {name?: string};
    displayName = profile.name || user.displayName || displayName;
  } catch {
    tempPassword = randomBytes(9).toString('base64url') + 'A1';
    const created = await auth.createUser({
      email: OWNER_EMAIL,
      password: tempPassword,
      displayName,
    });
    uid = created.uid;
    await db.collection('users').doc(uid).set({
      name: displayName,
      email: OWNER_EMAIL,
      role: 'organizer',
      whatsapp: '',
      createdAt: new Date().toISOString(),
    });
    console.log(`✓ Created organizer account: ${OWNER_EMAIL}`);
    console.log(`  TEMP PASSWORD: ${tempPassword}  (change it via Forgot Password after first login)`);
  }

  // 2. Reassign every non-seeded (real) event to the owner.
  const snap = await db.collection('events').get();
  let moved = 0;
  for (const doc of snap.docs) {
    if (/^e\d+$/.test(doc.id)) continue; // seeded demo events stay with admin
    await doc.ref.update({
      organizerUid: uid,
      organizerEmail: OWNER_EMAIL,
      organizer: {
        name: displayName,
        verified: true,
        avatar: (doc.data().organizer as {avatar?: string} | undefined)?.avatar || '',
      },
      updatedAt: new Date().toISOString(),
    });
    moved++;
    console.log(`  ↻ → ${OWNER_EMAIL}: ${doc.id}`);
  }

  console.log(`\n✓ ${moved} real event(s) now belong to ${OWNER_EMAIL}.`);
  if (tempPassword) console.log(`  Temporary password (save it now): ${tempPassword}`);
  process.exit(0);
}

main().catch((err) => {
  console.error('✗', err);
  process.exit(1);
});
