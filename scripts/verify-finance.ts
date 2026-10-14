/**
 * Financial reconciliation E2E against a running server.
 *
 * Asserts every revenue surface agrees: the admin console splits gross GTV /
 * platform fee / organizer net with gross − fee = net, per-event stats obey the
 * same identity, and net never exceeds gross.
 *
 * Usage:
 *   npx next dev --turbopack -p 9002     # (terminal 1)
 *   npx tsx scripts/verify-finance.ts    # (terminal 2)
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
  'verify-finance'
);

interface AdminStats {
  grossNgn?: number;
  feeNgn?: number;
  netNgn?: number;
  paidOrders?: number;
  error?: string;
}
interface EventEntry {
  sold?: number;
  grossNgn?: number;
  feeNgn?: number;
  netNgn?: number;
}
interface EventsStats {
  stats?: Record<string, EventEntry>;
  error?: string;
}
interface Withdrawals {
  balance?: {ngn: number; usd: number};
  error?: string;
}

const results: string[] = [];
const check = (name: string, ok: boolean, detail = '') =>
  results.push(`${ok ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`);
const near = (a: number, b: number, eps = 0.05) => Math.abs(a - b) <= eps;

(async () => {
  const cred = await signInWithEmailAndPassword(getAuth(app), 'isabideveloper@gmail.com', 'Password123');
  const token = await cred.user.getIdToken();
  const call = (p: string, init: RequestInit = {}) =>
    fetch(BASE + p, {
      ...init,
      headers: {'Content-Type': 'application/json', Authorization: `Bearer ${token}`},
    });

  const admin = (await (await call('/api/admin/stats')).json()) as AdminStats;
  if (admin.error) {
    check('GET /api/admin/stats', false, admin.error);
  } else {
    const gross = admin.grossNgn || 0;
    const fee = admin.feeNgn || 0;
    const net = admin.netNgn || 0;
    check('GET /api/admin/stats', typeof admin.grossNgn === 'number',
      `gross=₦${gross} fee=₦${fee} net=₦${net} orders=${admin.paidOrders}`);
    check('gross − fee = net (platform)', near(gross - fee, net), `${gross} − ${fee} = ${gross - fee}, net=${net}`);
    check('net ≤ gross', net <= gross + 0.01, `${net} ≤ ${gross}`);
    check('fee ≥ 0', fee >= 0, `fee=₦${fee}`);
  }

  const ev = (await (await call('/api/events/stats')).json()) as EventsStats;
  if (ev.error) {
    check('GET /api/events/stats', false, ev.error);
  } else {
    const entries = Object.values(ev.stats || {});
    check('GET /api/events/stats', !!ev.stats, `${entries.length} event(s) with sales`);
    let sumGross = 0;
    let reconcile = true;
    for (const e of entries) {
      sumGross += e.grossNgn || 0;
      if (!near((e.grossNgn || 0) - (e.feeNgn || 0), e.netNgn || 0)) reconcile = false;
    }
    check('per-event gross − fee = net', reconcile, `${entries.length} event(s)`);
    check('event gross sum ≤ admin gross (owned subset)',
      sumGross <= (admin.grossNgn || 0) + 0.5, `Σevents=₦${sumGross} admin=₦${admin.grossNgn || 0}`);
  }

  const wd = (await (await call('/api/withdrawals')).json()) as Withdrawals;
  check('GET /api/withdrawals', !wd.error, `balance=${JSON.stringify(wd.balance)}`);

  console.log(results.join('\n'));
  const failed = results.filter((r) => r.startsWith('✗')).length;
  console.log(`\n${results.length - failed}/${results.length} checks passed`);
  process.exit(failed ? 1 : 0);
})().catch((err) => {
  console.error('FATAL:', err);
  console.log(results.join('\n'));
  process.exit(1);
});
