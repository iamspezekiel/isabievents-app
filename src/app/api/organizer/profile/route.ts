import {NextResponse} from 'next/server';
import {requireAuth, isResponse} from '@/lib/admin-auth';
import {admin} from '@/lib/server-admin';

export const runtime = 'nodejs';

/**
 * POST /api/organizer/profile — persist the Brand Profile card (Save Changes).
 * Written through the Admin SDK so the save always works regardless of client
 * Firestore rules, and the brand name is propagated to the organizer's events
 * (same pattern as the avatar upload) so event pages reflect it immediately.
 */
export async function POST(req: Request) {
  const uid = await requireAuth(req);
  if (isResponse(uid)) return uid;
  const {getAdminDb} = await admin();
  const db = getAdminDb();
  if (!db) return NextResponse.json({error: 'Server credentials missing.'}, {status: 503});

  try {
    const body = (await req.json()) as {
      name?: unknown;
      whatsapp?: unknown;
      location?: unknown;
    };

    const name = String(body.name ?? '').trim().slice(0, 120);
    const whatsapp = String(body.whatsapp ?? '').trim().slice(0, 40);
    const location = String(body.location ?? '').trim().slice(0, 200);

    const ref = db.collection('users').doc(uid);
    const snap = await ref.get();
    if (!snap.exists) return NextResponse.json({error: 'Account not found.'}, {status: 404});

    const patch: Record<string, unknown> = {
      whatsapp,
      location,
      updatedAt: new Date().toISOString(),
    };
    if (name) patch.name = name;

    await ref.set(patch, {merge: true});

    // Propagate the brand name to this organizer's events (skip when unchanged).
    if (name) {
      const eventsSnap = await db.collection('events').where('organizerUid', '==', uid).limit(500).get();
      if (!eventsSnap.empty) {
        const batch = db.batch();
        eventsSnap.docs.forEach((d) => {
          batch.update(d.ref, {organizer: {...((d.data() as {organizer?: object}).organizer || {}), name}});
        });
        await batch.commit();
      }
    }

    const updated = (await ref.get()).data() || {};
    return NextResponse.json({
      ok: true,
      profile: {
        name: updated.name ?? '',
        whatsapp: updated.whatsapp ?? '',
        location: updated.location ?? '',
      },
    });
  } catch (err) {
    return NextResponse.json(
      {error: err instanceof Error ? err.message : 'Could not save your changes.'},
      {status: 500}
    );
  }
}
