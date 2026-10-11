import {NextResponse} from 'next/server';
import {requireOrganizer, isResponse} from '@/lib/admin-auth';
import {admin} from '@/lib/server-admin';

export const runtime = 'nodejs';

/**
 * POST /api/organizer/avatar — set the signed-in organizer's profile photo and
 * propagate it to all of their events so it shows publicly on event pages.
 * body: { avatar: string }  (an R2/https URL, or "" to clear)
 */
export async function POST(req: Request) {
  const uid = await requireOrganizer(req);
  if (isResponse(uid)) return uid;
  const {getAdminDb} = await admin();
  const db = getAdminDb();
  if (!db) return NextResponse.json({error: 'Server credentials missing.'}, {status: 503});

  try {
    const body = (await req.json()) as {avatar?: string};
    const avatar = (body.avatar || '').trim();
    if (avatar && !/^https:\/\//.test(avatar)) {
      return NextResponse.json({error: 'Avatar must be an https URL.'}, {status: 400});
    }

    // 1) Save on the organizer's profile.
    await db.collection('users').doc(uid).set({avatar, updatedAt: new Date().toISOString()}, {merge: true});

    // 2) Propagate to their events so the public event pages show the photo.
    const snap = await db.collection('events').where('organizerUid', '==', uid).limit(500).get();
    const batch = db.batch();
    snap.docs.forEach((d) => {
      const data = d.data() as {organizer?: Record<string, unknown>};
      batch.update(d.ref, {organizer: {...(data.organizer || {}), avatar}});
    });
    await batch.commit();

    return NextResponse.json({ok: true, avatar, eventsUpdated: snap.size});
  } catch (err) {
    return NextResponse.json(
      {error: err instanceof Error ? err.message : 'Could not update photo.'},
      {status: 500}
    );
  }
}
