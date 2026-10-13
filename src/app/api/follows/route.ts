import {NextResponse} from 'next/server';
import {requireAuth, isResponse} from '@/lib/admin-auth';
import {admin} from '@/lib/server-admin';

export const runtime = 'nodejs';

/**
 * Host-following system: attendees follow an organizer (the "host") and get a
 * dashboard notification + email whenever that organizer publishes a new event.
 *
 * GET  /api/follows?organizer=<uid> → {following: boolean, count}
 * GET  /api/follows                 → {following: string[]}   (uids I follow)
 * POST /api/follows {organizerUid}  → {following, count}      (toggle)
 *
 * Collection `follows`: {userId, userName, userEmail, organizerUid, createdAt}
 * with doc id `<userId>_<organizerUid>` so a double-follow can never duplicate.
 * Reads/writes go through the Admin SDK — no client security rules needed.
 */
export async function GET(req: Request) {
  const uid = await requireAuth(req);
  if (isResponse(uid)) return uid;
  const {getAdminDb} = await admin();
  const db = getAdminDb();
  if (!db) return NextResponse.json({error: 'Server credentials missing.'}, {status: 503});

  try {
    const organizerUid = new URL(req.url).searchParams.get('organizer') || '';
    if (organizerUid) {
      const [statusSnap, countSnap] = await Promise.all([
        db.collection('follows').doc(`${uid}_${organizerUid}`).get(),
        db.collection('follows').where('organizerUid', '==', organizerUid).count().get(),
      ]);
      return NextResponse.json({following: statusSnap.exists, count: countSnap.data().count});
    }
    const snap = await db.collection('follows').where('userId', '==', uid).limit(500).get();
    return NextResponse.json({following: snap.docs.map((d) => (d.data() as {organizerUid?: string}).organizerUid || '').filter(Boolean)});
  } catch (err) {
    return NextResponse.json(
      {error: err instanceof Error ? err.message : 'Could not load follows.'},
      {status: 500}
    );
  }
}

export async function POST(req: Request) {
  const uid = await requireAuth(req);
  if (isResponse(uid)) return uid;
  const {getAdminDb} = await admin();
  const db = getAdminDb();
  if (!db) return NextResponse.json({error: 'Server credentials missing.'}, {status: 503});

  try {
    const body = (await req.json()) as {organizerUid?: string};
    const organizerUid = String(body.organizerUid || '').trim();
    if (!organizerUid) return NextResponse.json({error: 'organizerUid is required.'}, {status: 400});
    if (organizerUid === uid) {
      return NextResponse.json({error: 'You cannot follow your own account.'}, {status: 400});
    }

    const organizerSnap = await db.collection('users').doc(organizerUid).get();
    if (!organizerSnap.exists) return NextResponse.json({error: 'Organizer not found.'}, {status: 404});
    const organizer = organizerSnap.data() as {role?: string};
    if (organizer.role !== 'organizer' && organizer.role !== 'admin') {
      return NextResponse.json({error: 'You can only follow organizers.'}, {status: 400});
    }

    const docId = `${uid}_${organizerUid}`;
    const ref = db.collection('follows').doc(docId);
    const existing = await ref.get();

    if (existing.exists) {
      await ref.delete();
    } else {
      let user = {name: '', email: ''};
      try {
        const userSnap = await db.collection('users').doc(uid).get();
        if (userSnap.exists) {
          const d = userSnap.data() as {name?: string; email?: string};
          user = {name: d.name || '', email: d.email || ''};
        }
      } catch {
        /* best-effort attribution */
      }
      await ref.set({
        userId: uid,
        userName: user.name,
        userEmail: user.email,
        organizerUid,
        createdAt: new Date().toISOString(),
      });
    }

    const countSnap = await db.collection('follows').where('organizerUid', '==', organizerUid).count().get();
    return NextResponse.json({following: !existing.exists, count: countSnap.data().count});
  } catch (err) {
    return NextResponse.json(
      {error: err instanceof Error ? err.message : 'Could not update follow.'},
      {status: 500}
    );
  }
}
