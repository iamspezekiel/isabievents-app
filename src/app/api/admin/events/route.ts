import {NextResponse} from 'next/server';
import {requireAdmin, isResponse} from '@/lib/admin-auth';
import {admin} from '@/lib/server-admin';

export const runtime = 'nodejs';

/**
 * PATCH /api/admin/events — moderation actions.
 * body: { id: string, action: 'approve' | 'reject' }
 *  approve → marks the host verified (auto-approved from then on)
 *  reject  → removes the listing from the platform
 */
export async function PATCH(req: Request) {
  const uid = await requireAdmin(req);
  if (isResponse(uid)) return uid;
  const {getAdminDb} = await admin();
  const db = getAdminDb();
  if (!db) return NextResponse.json({error: 'Server credentials missing.'}, {status: 503});

  try {
    const body = (await req.json()) as {id?: string; action?: string};
    const id = (body.id || '').trim();
    const action = body.action;
    if (!id || (action !== 'approve' && action !== 'reject')) {
      return NextResponse.json({error: 'id and a valid action are required.'}, {status: 400});
    }

    const ref = db.collection('events').doc(id);
    const snap = await ref.get();
    if (!snap.exists) return NextResponse.json({error: 'Event not found.'}, {status: 404});

    if (action === 'approve') {
      const data = snap.data() as {organizer?: Record<string, unknown>};
      await ref.update({
        organizer: {...(data.organizer || {}), verified: true},
        updatedAt: new Date().toISOString(),
      });
      return NextResponse.json({ok: true, action, id});
    }

    // Reject = hide from the marketplace (soft moderation — restorable via Approve).
    const data = snap.data() as {organizer?: Record<string, unknown>};
    await ref.update({
      organizer: {...(data.organizer || {}), verified: false},
      updatedAt: new Date().toISOString(),
    });
    return NextResponse.json({ok: true, action, id});
  } catch (err) {
    return NextResponse.json(
      {error: err instanceof Error ? err.message : 'Moderation action failed.'},
      {status: 500}
    );
  }
}