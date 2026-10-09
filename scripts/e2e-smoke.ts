/**
 * End-to-end smoke test against a running dev server (default :9002).
 *
 * Signs in as the admin with the client SDK, then exercises the admin APIs
 * including a REAL SMTP test send through /api/admin/smtp/test.
 *
 * Usage:
 *   npx next dev --turbopack -p 9002     # (terminal 1)
 *   npx tsx scripts/e2e-smoke.ts         # (terminal 2)
 */
import 'dotenv/config';
import {initializeApp} from 'firebase/app';
import {getAuth, signInWithEmailAndPassword} from 'firebase/auth';

const BASE = process.env.E2E_BASE_URL || 'http://localhost:9002';
const ADMIN_EMAIL = 'isabideveloper@gmail.com';
const ADMIN_PASSWORD = 'Password123';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let failures = 0;
const check = (label: string, ok: boolean, detail = '') => {
  console.log(`${ok ? '✓' : '✗'} ${label}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failures++;
};

async function waitForServer(timeoutMs = 180_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`${BASE}/api/admin/stats`, {method: 'GET'});
      if (res.status !== 500) return; // server is up (401 = auth required, fine)
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error(`Dev server did not come up at ${BASE}`);
}

async function main() {
  console.log(`Waiting for dev server at ${BASE} …`);
  await waitForServer();

  // ---- sign in ------------------------------------------------------------
  const app = initializeApp(firebaseConfig, 'e2e-smoke');
  const auth = getAuth(app);
  const cred = await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
  const token = await cred.user.getIdToken();
  const authed = (path: string, init: RequestInit = {}) =>
    fetch(`${BASE}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(init.headers || {}),
      },
    });

  check('admin sign-in', cred.user.email === ADMIN_EMAIL, cred.user.email || '');

  // ---- admin stats --------------------------------------------------------
  const statsRes = await authed('/api/admin/stats');
  const stats = await statsRes.json();
  check('GET /api/admin/stats', statsRes.ok && typeof stats.revenueNgn === 'number',
    `users=${stats.users} events=${stats.events} paidOrders=${stats.paidOrders} revenue=₦${stats.revenueNgn}`);

  // ---- admin users --------------------------------------------------------
  const usersRes = await authed('/api/admin/users');
  const users = await usersRes.json();
  check('GET /api/admin/users', usersRes.ok && Array.isArray(users.users),
    `${users.users?.length} user(s): ${(users.users || []).map((u: {email: string}) => u.email).join(', ')}`);

  // ---- unauthenticated must be rejected -----------------------------------
  const noAuth = await fetch(`${BASE}/api/admin/stats`);
  check('unauthenticated request rejected', noAuth.status === 401, `status=${noAuth.status}`);

  // ---- smtp config (read) -------------------------------------------------
  const smtpRes = await authed('/api/admin/smtp');
  const smtp = await smtpRes.json();
  check('GET /api/admin/smtp', smtpRes.ok && Boolean(smtp.host),
    `host=${smtp.host} port=${smtp.port} user=${smtp.userMasked} from=${smtp.from} → ${smtp.adminEmail} (password saved: ${smtp.hasPassword})`);

  // ---- REAL email test ----------------------------------------------------
  const testRes = await authed('/api/admin/smtp/test', {
    method: 'POST',
    body: JSON.stringify({to: ADMIN_EMAIL}),
  });
  const test = await testRes.json();
  check('POST /api/admin/smtp/test (real email)', testRes.ok && test.ok === true,
    test.ok ? `sent to ${test.to} messageId=${test.messageId}` : test.error);

  // ---- newsletter history -------------------------------------------------
  const nlRes = await authed('/api/newsletter');
  const nl = await nlRes.json();
  check('GET /api/newsletter', nlRes.ok && Array.isArray(nl.campaigns),
    `${nl.campaigns?.length} campaign(s), reach users=${nl.reach?.users} subs=${nl.reach?.subscribers}`);

  // ---- kyc ----------------------------------------------------------------
  const kycRes = await authed('/api/kyc');
  const kyc = await kycRes.json();
  check('GET /api/kyc', kycRes.ok && Array.isArray(kyc.submissions),
    `${kyc.submissions?.length} pending submission(s)`);

  // ---- ticket validation (admin is an operator) ---------------------------
  const valRes = await authed('/api/tickets/validate', {
    method: 'POST',
    body: JSON.stringify({code: 'TKT-DOESNOTEXIST-9'}),
  });
  const val = await valRes.json();
  check('POST /api/tickets/validate', valRes.ok && val.found === false,
    'unknown code correctly reports found=false');

  // ---- subscriber persistence --------------------------------------------
  const subRes = await fetch(`${BASE}/api/email/subscribe`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({email: `e2e-smoke-${Date.now()}@example.com`}),
  });
  const sub = await subRes.json();
  check('POST /api/email/subscribe (persist + email)', subRes.ok && sub.ok === true,
    `sent=${sub.sent} stored=${sub.stored}`);

  console.log(failures === 0 ? '\n✓ ALL E2E CHECKS PASSED' : `\n✗ ${failures} check(s) failed`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error('✗ E2E smoke failed:', err?.message || err);
  process.exit(1);
});
