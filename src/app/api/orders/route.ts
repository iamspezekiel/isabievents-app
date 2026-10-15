import {NextResponse} from 'next/server';
import {requireAuth, isResponse} from '@/lib/admin-auth';
import {admin} from '@/lib/server-admin';
import {normalizeEmail} from '@/lib/emails';

export const runtime = 'nodejs';

/**
 * GET /api/orders — the signed-in user's ticket orders (newest first).
 *
 * Replaces the client-side `orders` query in Order History / the attendee
 * dashboard: the old Firestore query combined `where('buyer.email')` with
 * `orderBy('createdAt')`, which needs a composite index that is not deployed,
 * so it silently returned nothing. This route reads through the Admin SDK
 * (no rules, no composite index — sorting happens here) and keys on the
 * profile email stored on the account.
 */
export async function GET(req: Request) {
  const uid = await requireAuth(req);
  if (isResponse(uid)) return uid;
  const {getAdminDb, getAdminAuth} = await admin();
  const db = getAdminDb();
  if (!db) return NextResponse.json({error: 'Server credentials missing.'}, {status: 503});

  try {
    let email = '';
    try {
      const snap = await db.collection('users').doc(uid).get();
      email = snap.exists ? String((snap.data() as {email?: string}).email || '') : '';
    } catch {
      /* fall back to the token below */
    }
    if (!email) {
      const auth = getAdminAuth();
      const decoded = auth ? await auth.verifyIdToken(uid).catch(() => null) : null;
      email = decoded?.email || '';
    }
    // Normalized to match how `buyer.email` is written (see @/lib/emails) —
    // otherwise a mixed-case checkout email returns an empty order history.
    email = normalizeEmail(email);
    if (!email) return NextResponse.json({orders: []});

    const snap = await db.collection('orders').where('buyer.email', '==', email).limit(200).get();
    const orders = snap.docs
      .map((d) => ({id: d.id, ...(d.data() as Record<string, unknown>)}))
      .sort((a, b) => {
        const at = String((b as {paidAt?: string}).paidAt || (b as {createdAt?: string}).createdAt || '');
        const bt = String((a as {paidAt?: string}).paidAt || (a as {createdAt?: string}).createdAt || '');
        return at.localeCompare(bt);
      });

    return NextResponse.json({orders});
  } catch (err) {
    return NextResponse.json(
      {error: err instanceof Error ? err.message : 'Failed to load orders.'},
      {status: 500}
    );
  }
}
