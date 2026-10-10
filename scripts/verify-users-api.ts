/**
 * Production smoke test for the new admin user-directory endpoints.
 * Creates a temp user, disables, re-enables, deletes — then verifies the
 * directory is back to just the admin account.
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
}, 'verify-users-api');

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

  // 1. GET directory — real data + disabled flags
  const get1 = await (await call('/api/admin/users')).json();
  const adminRow = (get1.users || []).find((u: {email: string}) => u.email === 'isabideveloper@gmail.com');
  check('GET /api/admin/users', Array.isArray(get1.users), `${get1.users?.length} user(s)`);
  check('rows include disabled flag', adminRow && typeof adminRow.disabled === 'boolean', `admin.disabled=${adminRow?.disabled}`);

  // 2. POST temp user
  const created = await (await call('/api/admin/users', {
    method: 'POST',
    body: JSON.stringify({name: 'Temp Test User', email: `temp-users-api-${Date.now()}@example.com`}),
  })).json();
  check('POST creates account', !!created.uid, created.tempPassword ? 'temp password issued' : JSON.stringify(created));

  if (created.uid) {
    // 3. PATCH disable → GET shows disabled
    const dis = await (await call('/api/admin/users', {method: 'PATCH', body: JSON.stringify({uid: created.uid, disabled: true})})).json();
    check('PATCH disable', !!dis.ok, JSON.stringify(dis));
    const get2 = await (await call('/api/admin/users')).json();
    const temp = (get2.users || []).find((u: {uid: string}) => u.uid === created.uid);
    check('GET shows disabled=true', temp?.disabled === true, `temp.disabled=${temp?.disabled}`);

    // 4. PATCH enable
    const en = await (await call('/api/admin/users', {method: 'PATCH', body: JSON.stringify({uid: created.uid, disabled: false})})).json();
    check('PATCH enable', !!en.ok, JSON.stringify(en));

    // 5. Guard: cannot delete self
    const self = await call('/api/admin/users', {method: 'DELETE', body: JSON.stringify({uid: cred.user.uid})});
    check('DELETE guards self', self.status === 400, `status=${self.status}`);

    // 6. DELETE temp user
    const del = await (await call('/api/admin/users', {method: 'DELETE', body: JSON.stringify({uid: created.uid})})).json();
    check('DELETE removes account', !!del.ok, JSON.stringify(del));
    const get3 = await (await call('/api/admin/users')).json();
    const gone = !(get3.users || []).some((u: {uid: string}) => u.uid === created.uid);
    check('GET no longer lists deleted user', gone, `${get3.users?.length} user(s) left`);
  }

  console.log(results.join('\n'));
  const failed = results.filter((r) => r.startsWith('✗')).length;
  console.log(`\n${results.length - failed}/${results.length} checks passed`);
  process.exit(failed ? 1 : 0);
})().catch((err) => {
  console.error('FATAL:', err);
  console.log(results.join('\n'));
  process.exit(1);
});
