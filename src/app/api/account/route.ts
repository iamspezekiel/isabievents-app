import {NextResponse} from 'next/server';
import {requireAuth, isResponse} from '@/lib/admin-auth';
import {admin} from '@/lib/server-admin';

export const runtime = 'nodejs';

/**
 * DELETE /api/account — the signed-in user deletes their own account
 * (Auth user + profile doc). Tickets/orders remain for financial records.
 */
export async function DELETE(req: Request) {
  const uid = await requireAuth(req);
  if (isResponse(uid)) return uid;
  const {getAdminAuth, getAdminDb} = await admin();
  const auth = getAdminAuth();
  if (!auth) return NextResponse.json({error: 'Server credentials missing.'}, {status: 503});

  try {
    await auth.deleteUser(uid);
    try {
      const db = getAdminDb();
      if (db) await db.collection('users').doc(uid).delete();
    } catch (err) {
      console.warn('[account] profile delete failed:', err);
    }
    return NextResponse.json({ok: true});
  } catch (err) {
    return NextResponse.json(
      {error: err instanceof Error ? err.message : 'Account deletion failed.'},
      {status: 500}
    );
  }
}