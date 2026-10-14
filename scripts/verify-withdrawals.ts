/**
 * E2E for the withdrawal flow against a running server.
 *
 * Balances are now NET of platform fees and refunds, and requests are reserved
 * transactionally, so this script:
 *   GET list  →  validation guards  →  over-balance refusal  →  (when the
 *   account actually has net earnings) a real request + approve + a
 *   double-process guard.
 *
 * Usage:
 *   npx next dev --turbopack -p 9002       # (terminal 1)
 *   npx tsx scripts/verify-withdrawals.ts  # (terminal 2)
 */
import 'dotenv/config';
import {initializeApp} from 'firebase/app';
import {getAuth, signInWithEmailAndPassword} from 'firebase/auth';

const BASE = process.env.E2E_BASE_URL || 'http://localhost:9002';

const app = initializeApp(
  {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  },
  'verify-withdrawals'
);

interface WithdrawalsResponse {
  requests?: unknown[];
  balance?: {ngn: number; usd: number};
  fees?: {ngn: number; usd: number};
  error?: string;
}
interface WithdrawalAction {
  ok?: boolean;
  id?: string;
  error?: string;
}

const results: string[] = [];
const check = (name: string, ok: boolean, detail = '') =>
  results.push(`${ok ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`);

(async () => {
  const cred = await signInWithEmailAndPassword(getAuth(app), 'isabideveloper@gmail.com', 'Password123');
  const token = await cred.user.getIdToken();
  const call = (p: string, init: RequestInit = {}) =>
    fetch(BASE + p, {
      ...init,
      headers: {'Content-Type': 'application/json', Authorization: `Bearer ${token}`},
    });

  // 1. GET list + balance
  const list = (await (await call('/api/withdrawals')).json()) as WithdrawalsResponse;
  check('GET /api/withdrawals', Array.isArray(list.requests), `balance=${JSON.stringify(list.balance)}`);
  check('GET /api/withdrawals reports processing fee', typeof list.fees?.ngn === 'number', `fees=${JSON.stringify(list.fees)}`);

  // 2. NGN validation — missing bank details must be refused (amount above the fee)
  const bad = await call('/api/withdrawals', {
    method: 'POST',
    body: JSON.stringify({amount: 500, currency: 'NGN'}),
  });
  check('NGN validation rejects missing bank details', bad.status === 400, `status=${bad.status}`);

  // 2b. Below-fee request must be refused (net payout would be <= 0)
  const tiny = await call('/api/withdrawals', {
    method: 'POST',
    body: JSON.stringify({
      amount: 50,
      currency: 'NGN',
      bankName: 'Zenith Bank',
      accountNumber: '1234567890',
      accountName: 'Test Organizer',
    }),
  });
  check('below-fee NGN request rejected', tiny.status === 400, `status=${tiny.status}`);

  // 3. Over-balance request must be refused (balance is net earnings)
  const ngnBal = Number(list?.balance?.ngn) || 0;
  const over = await call('/api/withdrawals', {
    method: 'POST',
    body: JSON.stringify({
      amount: ngnBal + 1_000_000,
      currency: 'NGN',
      bankName: 'Zenith Bank',
      accountNumber: '1234567890',
      accountName: 'Test Organizer',
    }),
  });
  check('over-balance NGN request rejected', over.status === 400, `status=${over.status} balance=${ngnBal}`);

  // 4. If the account has net earnings above the processing fee, exercise a real request end-to-end
  let created: WithdrawalAction | null = null;
  if (ngnBal > 100) {
    created = (await (
      await call('/api/withdrawals', {
        method: 'POST',
        body: JSON.stringify({
          amount: Math.min(1000, ngnBal),
          currency: 'NGN',
          bankName: 'Zenith Bank',
          accountNumber: '1234567890',
          accountName: 'Test Organizer',
        }),
      })
    ).json()) as WithdrawalAction;
    check('POST NGN within net balance', !!created.ok, `ref=${created.id ?? created.error}`);

    if (created.ok && created.id) {
      const apr = (await (
        await call('/api/withdrawals', {method: 'PATCH', body: JSON.stringify({id: created.id, status: 'approved'})})
      ).json()) as WithdrawalAction;
      check('PATCH approve NGN', !!apr.ok, JSON.stringify(apr));

      const again = await call('/api/withdrawals', {
        method: 'PATCH',
        body: JSON.stringify({id: created.id, status: 'approved'}),
      });
      check('already-processed guard', again.status === 400, `status=${again.status}`);
    }
  } else {
    console.log('• No net NGN balance on this account — live request steps skipped (guards verified above).');
  }

  console.log(results.join('\n'));
  if (created?.id) console.log(`test ref created: ${created.id}`);
  const failed = results.filter((r) => r.startsWith('✗')).length;
  console.log(`\n${results.length - failed}/${results.length} checks passed`);
  process.exit(failed ? 1 : 0);
})().catch((err) => {
  console.error('FATAL:', err);
  console.log(results.join('\n'));
  process.exit(1);
});
