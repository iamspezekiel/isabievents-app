/**
 * One-off migration: make `isabideveloper@gmail.com` the admin account.
 *
 *  - Firebase Auth : renames the legacy admin login (or creates the account)
 *  - Firestore     : syncs users/{uid} → {email, role: 'admin'}
 *
 * The target password is taken from MOCK_USERS (admin entry) so the login
 * stays `isabideveloper@gmail.com` / `Password123`.
 *
 * Usage:
 *   npx tsx scripts/set-admin-email.ts           # dry run (prints the plan)
 *   npx tsx scripts/set-admin-email.ts --apply   # perform the changes
 */
import 'dotenv/config';
import {initializeApp, cert, getApps} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';
import {MOCK_USERS} from '../src/lib/mock-data';

/** The new admin login (Firebase Auth normalises to lowercase). */
const TARGET_EMAIL = 'isabideveloper@gmail.com';
/** Old admin logins to migrate away from. */
const LEGACY_EMAILS = ['admin@isabievents.ng'];

const APPLY = process.argv.includes('--apply');
const adminUser = MOCK_USERS.find((u) => u.role === 'admin')!;

async function main() {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (getApps().length === 0) {
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

  console.log(APPLY ? '▶ APPLY mode' : '◦ DRY RUN — no changes yet (rerun with --apply)');

  // ---- 1. Resolve the Auth account ---------------------------------------
  let uid: string | null = null;
  let action = '';

  try {
    const target = await auth.getUserByEmail(TARGET_EMAIL);
    uid = target.uid;
    action = APPLY
      ? `target account exists (uid=${uid}) — keep it, reset password → ${adminUser.password}`
      : `target account exists (uid=${uid}) — keep it, password would be reset → ${adminUser.password}`;
    if (APPLY) {
      await auth.updateUser(uid, {password: adminUser.password, displayName: adminUser.name});
    }
  } catch {
    // Target does not exist — try to rename a legacy admin.
    let renamed = false;
    for (const legacy of LEGACY_EMAILS) {
      if (legacy === TARGET_EMAIL) continue;
      try {
        const old = await auth.getUserByEmail(legacy);
        uid = old.uid;
        action = `rename ${legacy} → ${TARGET_EMAIL} (uid=${uid})`;
        if (APPLY) {
          await auth.updateUser(uid, {
            email: TARGET_EMAIL,
            password: adminUser.password,
            displayName: adminUser.name,
          });
        } else {
          action += ` + set password → ${adminUser.password}`;
        }
        renamed = true;
        break;
      } catch {
        /* legacy not found — next */
      }
    }
    if (!renamed) {
      action = APPLY ? `create ${TARGET_EMAIL} (password=${adminUser.password})` : `would create ${TARGET_EMAIL} (password=${adminUser.password})`;
      if (APPLY) {
        const created = await auth.createUser({
          email: TARGET_EMAIL,
          password: adminUser.password,
          displayName: adminUser.name,
        });
        uid = created.uid;
      }
    }
  }

  console.log(`Auth: ${action}`);
  if (!uid && !APPLY) {
    uid = 'PENDING_CREATE';
  }

  // ---- 2. Sync the Firestore profile doc ---------------------------------
  const docRef = db.collection('users').doc(uid!);
  const existing = await docRef.get();
  const payload = {
    name: adminUser.name,
    email: TARGET_EMAIL,
    role: 'admin',
    whatsapp: adminUser.whatsapp,
    updatedAt: new Date().toISOString(),
  };
  const docAction = existing.exists
    ? `update users/${uid} → email=${TARGET_EMAIL}, role=admin`
    : `create users/${uid} → email=${TARGET_EMAIL}, role=admin`;
  console.log(`Firestore: ${docAction}`);
  if (APPLY) {
    await docRef.set(payload, {merge: true});
  }

  // ---- 3. Report leftover legacy accounts --------------------------------
  for (const legacy of LEGACY_EMAILS) {
    if (legacy === TARGET_EMAIL) continue;
    try {
      const old = await auth.getUserByEmail(legacy);
      console.log(
        `⚠ legacy admin still exists: ${legacy} (uid=${old.uid}) — ` +
          (APPLY ? 'delete it manually in Firebase Console → Authentication → Users.' : 'will still exist after apply.')
      );
    } catch {
      /* gone — good */
    }
  }

  console.log(APPLY ? '✓ Migration applied.' : '✓ Dry run complete. Rerun with --apply to execute.');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('✗ Migration failed:', err?.message || err);
    process.exit(1);
  });
