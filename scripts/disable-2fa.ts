/**
 * Disables two-factor authentication (Google Authenticator / TOTP) on EVERY
 * user account — clears `twoFactor` and `totpSecret` on the profile docs so
 * nobody is asked for a code at login anymore.
 *
 * The 2FA feature itself stays in the app: users can turn it back on from
 * their settings page (attendee/staff/vendor/organizer) whenever they want.
 *
 * Usage:
 *   npx tsx scripts/disable-2fa.ts           # dry run (lists affected accounts)
 *   npx tsx scripts/disable-2fa.ts --apply   # perform the change
 */
import {config} from 'dotenv';
config({path: '.env.local'});
config(); // also allow plain .env

import {initializeApp, cert, getApps} from 'firebase-admin/app';
import {getFirestore} from 'firebase-admin/firestore';

const APPLY = process.argv.includes('--apply');

async function main() {
  if (getApps().length === 0) {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
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

  // Full scan of the users collection so accounts with a leftover pending
  // TOTP secret (setup started but never confirmed) are cleared too.
  const snap = await db.collection('users').get();
  const targets = snap.docs.filter((d) => {
    const u = d.data() as {twoFactor?: unknown; totpSecret?: unknown};
    return u.twoFactor === true || (u.totpSecret !== undefined && u.totpSecret !== null);
  });

  console.log(`Accounts with 2FA enabled or a stored authenticator secret: ${targets.length}`);
  for (const d of targets) {
    const u = d.data() as {email?: string; name?: string; twoFactor?: boolean; totpSecret?: unknown};
    console.log(`  - ${u.email || d.id} (enabled=${u.twoFactor === true}, secret=${u.totpSecret ? 'yes' : 'no'})`);
  }

  if (APPLY && targets.length > 0) {
    const now = new Date().toISOString();
    for (let i = 0; i < targets.length; i += 400) {
      const batch = db.batch();
      for (const d of targets.slice(i, i + 400)) {
        batch.update(d.ref, {
          twoFactor: false,
          totpSecret: null,
          twoFactorDisabledAt: now,
        });
      }
      await batch.commit();
    }
    console.log(`  ✓ two-factor disabled on ${targets.length} account(s)`);
  } else if (!APPLY && targets.length > 0) {
    console.log('\n✓ Dry run complete. Rerun with --apply to disable 2FA on these accounts.');
    return;
  }

  // Verify: nothing should remain enabled after --apply.
  const after = await db
    .collection('users')
    .where('twoFactor', '==', true)
    .get();
  console.log(APPLY ? `✓ Accounts still flagged twoFactor=true: ${after.size}` : `Accounts currently flagged twoFactor=true: ${after.size}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('✗ disable-2fa failed:', err?.message || err);
    process.exit(1);
  });
