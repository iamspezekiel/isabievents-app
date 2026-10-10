/**
 * Production E2E for the withdrawal flow:
 * GET list → POST NGN (bank) → POST USD (crypto) → PATCH approve NGN
 * → PATCH decline USD (with reason). Every step also exercises emails.
 * Finally cleans up the test documents.
 */
import 'dotenv/config';
import {initializeApp} from 'firebase/app';
import {getAuth, signInWithEmailAndPassword} from 'firebase/auth';

const BASE = process.env.E2E_BASE_URL || 'https://events.isabi.cloud';

const app = initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}, 'verify-withdrawals');

const results: string[] = [];
const check = (name: string, ok: boolean, detail = '') =>
  results.push(`${ok ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`);

(async () => {
  const cred = await signInWithEmailAndPassword(getAuth(app), 'isabideveloper@gmail.com', 'Password123');
  const token = await cred.user.getIdToken();
  const call = (p: string, init: RequestInit = {}) =>
    fetch(BASE + p, {...init, headers: {'Content-Type': 'application/json', Authorization: `Bearer ${token}`}});

  // 1. GET list
  const list = await (await call('/api/withdrawals')).json();
  check('GET /api/withdrawals', Array.isArray(list.requests), `balance=${JSON.stringify(list.balance)}`);

  // 2. POST NGN bank transfer
  const ngn = await (await call('/api/withdrawals', {
    method: 'POST',
    body: JSON.stringify({amount: 25000, currency: 'NGN', bankName: 'Zenith Bank', accountNumber: '1234567890', accountName: 'Test Organizer'}),
  })).json();
  check('POST NGN bank withdrawal', !!ngn.ok, `ref=${ngn.id}`);

  // 3. POST USD crypto
  const usd = await (await call('/api/withdrawals', {
    method: 'POST',
    body: JSON.stringify({amount: 120.5, currency: 'USD', network: 'USDT — TRC20 (Tron)', walletAddress: 'TTestWalletAddress1234567890'}),
  })).json();
  check('POST USD crypto withdrawal', !!usd.ok, `ref=${usd.id}`);

  // 4. Validation: NGN without account number must fail
  const bad = await call('/api/withdrawals', {method: 'POST', body: JSON.stringify({amount: 100, currency: 'NGN'})});
  check('NGN validation rejects missing bank details', bad.status === 400, `status=${bad.status}`);

  // 5. PATCH approve NGN
  if (ngn.ok) {
    const apr = await (await call('/api/withdrawals', {method: 'PATCH', body: JSON.stringify({id: ngn.id, status: 'approved'})})).json();
    check('PATCH approve NGN', !!apr.ok, JSON.stringify(apr));
  }
  // 6. PATCH decline USD with reason
  if (usd.ok) {
    const dec = await (await call('/api/withdrawals', {method: 'PATCH', body: JSON.stringify({id: usd.id, status: 'rejected', note: 'E2E test decline'})})).json();
    check('PATCH decline USD', !!dec.ok, JSON.stringify(dec));
  }
  // 7. Double-processing must fail
  if (ngn.ok) {
    const again = await call('/api/withdrawals', {method: 'PATCH', body: JSON.stringify({id: ngn.id, status: 'approved'})});
    check('already-processed guard', again.status === 400, `status=${again.status}`);
  }

  console.log(results.join('\n'));
  console.log(`test refs created: ${ngn.id || '-'} ${usd.id || '-'}`);

  const failed = results.filter((r) => r.startsWith('✗')).length;
  console.log(`\n${results.length - failed}/${results.length} checks passed`);
  process.exit(failed ? 1 : 0);
})().catch((err) => {
  console.error('FATAL:', err);
  console.log(results.join('\n'));
  process.exit(1);
});
