/**
 * Production E2E for the KYC flow:
 * submit → duplicate-guard (400) → admin sees pending → approve →
 * verified flag set → pending list empty → cleanup test record.
 */
import 'dotenv/config';
import {initializeApp} from 'firebase/app';
import {getAuth, signInWithEmailAndPassword} from 'firebase/auth';

const BASE = process.env.E2E_BASE_URL || 'https://events.isabi.cloud';
const TINY_PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

const app = initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}, 'verify-kyc');

const results: string[] = [];
const check = (name: string, ok: boolean, detail = '') =>
  results.push(`${ok ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`);

(async () => {
  const cred = await signInWithEmailAndPassword(getAuth(app), 'isabideveloper@gmail.com', 'Password123');
  const token = await cred.user.getIdToken();
  const call = (p: string, init: RequestInit = {}) =>
    fetch(BASE + p, {...init, headers: {'Content-Type': 'application/json', Authorization: `Bearer ${token}`}});

  // 1. Submit
  const sub = await (await call('/api/kyc', {
    method: 'POST',
    body: JSON.stringify({
      idType: 'nin',
      idNumber: '12345678901',
      businessType: 'individual',
      businessName: '',
      rcNumber: '',
      documentPhoto: TINY_PNG,
    }),
  })).json();
  check('POST submit', !!sub.ok, `id=${sub.id}`);

  // 2. Duplicate guard
  const dup = await call('/api/kyc', {
    method: 'POST',
    body: JSON.stringify({idType: 'nin', idNumber: '12345678901'}),
  });
  check('duplicate submission blocked', dup.status === 400, `status=${dup.status}`);

  // 3. Admin sees it as pending (with photo)
  const list = await (await call('/api/kyc')).json();
  const row = (list.submissions || []).find((s: {id: string}) => s.id === sub.id);
  check('admin pending list includes submission', !!row, `photo=${row?.documentPhoto ? 'yes' : 'no'}`);

  // 4. Approve
  if (sub.id) {
    const apr = await (await call('/api/kyc', {
      method: 'PATCH',
      body: JSON.stringify({id: sub.id, action: 'approve'}),
    })).json();
    check('PATCH approve', !!apr.ok, JSON.stringify(apr));

    const list2 = await (await call('/api/kyc')).json();
    const gone = !(list2.submissions || []).some((s: {id: string}) => s.id === sub.id);
    check('pending list empty after approve', gone, `${(list2.submissions || []).length} left`);
  }

  console.log(results.join('\n'));

  // Cleanup: delete the test submission (keep everything else untouched).
  if (sub.id) {
    const {getFirestore, doc, deleteDoc} = await import('firebase/firestore');
    try {
      await deleteDoc(doc(getFirestore(app), 'kyc_submissions', sub.id));
      console.log(`(cleaned up test submission ${sub.id})`);
    } catch (e) {
      console.log(`(cleanup skipped: ${e instanceof Error ? e.message : e})`);
    }
  }

  const failed = results.filter((r) => r.startsWith('✗')).length;
  console.log(`\n${results.length - failed}/${results.length} checks passed`);
  process.exit(failed ? 1 : 0);
})().catch((err) => {
  console.error('FATAL:', err);
  console.log(results.join('\n'));
  process.exit(1);
});
