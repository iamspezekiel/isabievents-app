import {NextResponse} from 'next/server';
import {requireAuth, requireAdmin, isResponse} from '@/lib/admin-auth';
import {admin} from '@/lib/server-admin';
import {sendReportNotificationEmail} from '@/lib/email';
import {notifyUsers, userIdsByRole} from '@/lib/notifications';

export const runtime = 'nodejs';

/**
 * POST /api/reports — file a report against an event (any signed-in user).
 * body: { eventId, eventTitle, reason, details? }
 * Writes to the `reports` collection (server-only) and pings the admin inbox.
 */
export async function POST(req: Request) {
  const uid = await requireAuth(req);
  if (isResponse(uid)) return uid;
  const {getAdminDb} = await admin();
  const db = getAdminDb();
  if (!db) return NextResponse.json({error: 'Server credentials missing.'}, {status: 503});

  try {
    const body = (await req.json()) as {
      eventId?: string; eventTitle?: string; reason?: string; details?: string;
    };
    const eventId = (body.eventId || '').trim();
    const reason = (body.reason || '').trim();
    if (!eventId || !reason) {
      return NextResponse.json({error: 'Event and reason are required.'}, {status: 400});
    }

    const userSnap = await db.collection('users').doc(uid).get();
    const profile = (userSnap.exists ? userSnap.data() : {}) as {name?: string; email?: string};

    const report = {
      eventId,
      eventTitle: (body.eventTitle || '').trim(),
      reason: reason.slice(0, 120),
      details: (body.details || '').trim().slice(0, 1000),
      reporterUid: uid,
      reporterName: profile.name || '',
      reporterEmail: profile.email || '',
      status: 'open',
      createdAt: new Date().toISOString(),
    };
    const ref = await db.collection('reports').add(report);

    // Fire-and-forget admin notification (no-op without SMTP).
    sendReportNotificationEmail({...report}).catch(() => undefined);

    // In-app notification for every admin's dashboard.
    userIdsByRole(db, ['admin'])
      .then((adminIds) =>
        notifyUsers(adminIds, {
          title: 'Event reported',
          body: `"${report.eventTitle || report.eventId}" was reported: ${report.reason}`,
          type: 'warning',
          href: '/dashboard/admin/events',
        })
      )
      .catch(() => undefined);

    return NextResponse.json({ok: true, id: ref.id});
  } catch (err) {
    return NextResponse.json(
      {error: err instanceof Error ? err.message : 'Could not submit report.'},
      {status: 500}
    );
  }
}

/** GET /api/reports — admin: list all reports (optionally by eventId). */
export async function GET(req: Request) {
  const uid = await requireAdmin(req);
  if (isResponse(uid)) return uid;
  const {getAdminDb} = await admin();
  const db = getAdminDb();
  if (!db) return NextResponse.json({error: 'Server credentials missing.'}, {status: 503});

  try {
    const snap = await db.collection('reports').orderBy('createdAt', 'desc').limit(200).get();
    const reports = snap.docs.map((d) => ({id: d.id, ...(d.data() as Record<string, unknown>)}));
    const eventId = new URL(req.url).searchParams.get('eventId');
    const filtered = eventId ? reports.filter((r) => (r as {eventId?: string}).eventId === eventId) : reports;
    return NextResponse.json({reports: filtered});
  } catch (err) {
    return NextResponse.json(
      {error: err instanceof Error ? err.message : 'Failed to load reports.'},
      {status: 500}
    );
  }
}
