import {NextResponse} from 'next/server';
import {requireAuth, isResponse} from '@/lib/admin-auth';
import {admin} from '@/lib/server-admin';

export const runtime = 'nodejs';

const LEGACY_LIMIT = 200;

/** Sanitizes an id list: strings only, deduped, capped. */
function sanitizeIds(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  return [...new Set(input.filter((x) => typeof x === 'string' && x.trim()).map((x) => String(x).trim().slice(0, 120)))].slice(0, LEGACY_LIMIT);
}

async function readIds(db: FirebaseFirestore.Firestore, uid: string): Promise<string[]> {
  const snap = await db.collection('favorites').doc(uid).get();
  if (!snap.exists) return [];
  const data = snap.data() as {ids?: unknown};
  return sanitizeIds(data.ids);
}

/**
 * GET  /api/favorites — the signed-in user's saved event ids (fresh from the
 *                       database on every call; no caching anywhere).
 * POST /api/favorites — save favorites to the database:
 *   {eventId, action: 'toggle'|'add'|'remove'} → {favorites, added}
 *   {ids: [...]}                               → merges a legacy list, returns
 *                                                the merged result
 * Replaces the old device-local localStorage list so a save on one device is
 * visible on every device.
 */
export async function GET(req: Request) {
  const uid = await requireAuth(req);
  if (isResponse(uid)) return uid;
  const {getAdminDb} = await admin();
  const db = getAdminDb();
  if (!db) return NextResponse.json({error: 'Server credentials missing.'}, {status: 503});

  try {
    return NextResponse.json({favorites: await readIds(db, uid)});
  } catch (err) {
    return NextResponse.json(
      {error: err instanceof Error ? err.message : 'Failed to load favorites.'},
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
    const body = (await req.json()) as {eventId?: string; action?: string; ids?: unknown};
    const ref = db.collection('favorites').doc(uid);
    const current = await readIds(db, uid);
    let next = current;
    let added: boolean | undefined;

    if (Array.isArray(body.ids)) {
      // Merge path — used once to migrate the old browser-local list.
      next = sanitizeIds([...current, ...sanitizeIds(body.ids)]);
    } else {
      const eventId = String(body.eventId || '').trim().slice(0, 120);
      if (!eventId) return NextResponse.json({error: 'eventId is required.'}, {status: 400});
      const action = body.action === 'add' || body.action === 'remove' ? body.action : 'toggle';
      if (action === 'add') {
        next = sanitizeIds([...current, eventId]);
        added = true;
      } else if (action === 'remove') {
        next = current.filter((x) => x !== eventId);
        added = false;
      } else {
        added = !current.includes(eventId);
        next = added ? sanitizeIds([...current, eventId]) : current.filter((x) => x !== eventId);
      }
    }

    await ref.set({ids: next, updatedAt: new Date().toISOString()}, {merge: true});
    return NextResponse.json({favorites: next, ...(added === undefined ? {} : {added})});
  } catch (err) {
    return NextResponse.json(
      {error: err instanceof Error ? err.message : 'Failed to save favorites.'},
      {status: 500}
    );
  }
}
