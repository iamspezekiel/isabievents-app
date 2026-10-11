import {NextResponse} from 'next/server';
import {requireAuth, isResponse} from '@/lib/admin-auth';
import {admin} from '@/lib/server-admin';

export const runtime = 'nodejs';

/**
 * GET /api/notifications — the signed-in user's notifications (newest first).
 * PATCH /api/notifications — mark one ({id}) or all ({all:true}) as read.
 */
export async function GET(req: Request) {
  const uid = await requireAuth(req);
  if (isResponse(uid)) return uid;
  const {getAdminDb} = await admin();
  const db = getAdminDb();
  if (!db) return NextResponse.json({error: 'Server credentials missing.'}, {status: 503});

  try {
    // Single-field query (userId) — no composite index required.
    const snap = await db.collection('notifications').where('userId', '==', uid).limit(100).get();
    const notifications = snap.docs
      .map((d) => ({id: d.id, ...(d.data() as Record<string, unknown>)}))
      .sort(
        (a, b) =>
          String((b as {createdAt?: string}).createdAt || '').localeCompare(
            String((a as {createdAt?: string}).createdAt || '')
          )
      );
    return NextResponse.json({notifications});
  } catch (err) {
    return NextResponse.json(
      {error: err instanceof Error ? err.message : 'Failed to load notifications.'},
      {status: 500}
    );
  }
}

export async function PATCH(req: Request) {
  const uid = await requireAuth(req);
  if (isResponse(uid)) return uid;
  const {getAdminDb} = await admin();
  const db = getAdminDb();
  if (!db) return NextResponse.json({error: 'Server credentials missing.'}, {status: 503});

  try {
    const body = (await req.json()) as {id?: string; all?: boolean};

    if (body.all) {
      const snap = await db.collection('notifications').where('userId', '==', uid).where('read', '==', false).get();
      const batch = db.batch();
      snap.docs.forEach((d) => batch.update(d.ref, {read: true}));
      await batch.commit();
      return NextResponse.json({ok: true, updated: snap.size});
    }

    const id = (body.id || '').trim();
    if (!id) return NextResponse.json({error: 'id or all is required.'}, {status: 400});
    const ref = db.collection('notifications').doc(id);
    const snap = await ref.get();
    if (!snap.exists) return NextResponse.json({error: 'Notification not found.'}, {status: 404});
    if ((snap.data() as {userId?: string}).userId !== uid) {
      return NextResponse.json({error: 'Not your notification.'}, {status: 403});
    }
    await ref.update({read: true});
    return NextResponse.json({ok: true});
  } catch (err) {
    return NextResponse.json(
      {error: err instanceof Error ? err.message : 'Failed to update notification.'},
      {status: 500}
    );
  }
}
