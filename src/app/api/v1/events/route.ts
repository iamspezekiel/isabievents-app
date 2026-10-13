import {NextResponse} from 'next/server';
import {admin} from '@/lib/server-admin';
import {resolveApiKey} from '@/lib/api-key';
import {lagosTs} from '@/lib/timezone';

export const runtime = 'nodejs';

/**
 * GET /api/v1/events — the public developer API referenced in /docs.
 *
 * Auth: `Authorization: Bearer sk_live_…` (the key shown in the organizer
 * dashboard → Developer API). Returns the caller's own events. Optional query:
 *   ?status=upcoming|past  ?city=lagos  ?limit=50
 * This is the real, key-authenticated endpoint the docs describe.
 */
export async function GET(req: Request) {
  const uid = await resolveApiKey(req.headers.get('authorization'));
  if (!uid) {
    return NextResponse.json(
      {error: 'Unauthorized — provide a valid API key via Authorization: Bearer sk_live_…'},
      {status: 401}
    );
  }

  const {getAdminDb} = await admin();
  const db = getAdminDb();
  if (!db) return NextResponse.json({error: 'Server credentials missing.'}, {status: 503});

  try {
    const {searchParams} = new URL(req.url);
    const city = (searchParams.get('city') || '').trim().toLowerCase();
    const status = (searchParams.get('status') || '').trim().toLowerCase();
    const limit = Math.min(Math.max(Number(searchParams.get('limit')) || 100, 1), 250);

    // Scoped to the API-key owner's events.
    let query = db.collection('events').where('organizerUid', '==', uid).limit(limit);
    const snap = await query.get();

    const now = Date.now();
    const events = snap.docs
      .map((d) => ({id: d.id, ...(d.data() as Record<string, unknown>)}))
      .filter((ev) => {
        if (city) {
          const evCity = String((ev as {city?: string}).city || '').toLowerCase();
          if (evCity !== city) return false;
        }
        if (status) {
          // Ended-ness is evaluated at the event END in Africa/Lagos.
          const evEnd = ev as {date?: string; endDate?: string};
          const ts = lagosTs(evEnd.endDate || evEnd.date);
          const isPast = ts > 0 && ts < now;
          if (status === 'past' && !isPast) return false;
          if ((status === 'upcoming' || status === 'live') && isPast) return false;
        }
        return true;
      });

    return NextResponse.json({object: 'list', data: events, count: events.length});
  } catch (err) {
    return NextResponse.json(
      {error: err instanceof Error ? err.message : 'Request failed.'},
      {status: 500}
    );
  }
}
