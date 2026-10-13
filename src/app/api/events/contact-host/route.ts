import {NextResponse} from 'next/server';
import {requireAuth, isResponse} from '@/lib/admin-auth';
import {admin} from '@/lib/server-admin';
import {sendHostMessageEmail} from '@/lib/email';
import {createNotification} from '@/lib/notifications';

export const runtime = 'nodejs';

/**
 * POST /api/events/contact-host — "Contact the Host" on an event page.
 * Forwards the attendee's message to the organizer's inbox and drops a
 * dashboard notification on the organizer's account.
 * Body: {eventId, message}
 */
export async function POST(req: Request) {
  const uid = await requireAuth(req);
  if (isResponse(uid)) return uid;
  const {getAdminDb} = await admin();
  const db = getAdminDb();
  if (!db) return NextResponse.json({error: 'Server credentials missing.'}, {status: 503});

  try {
    const body = (await req.json()) as {eventId?: string; message?: string};
    const eventId = String(body.eventId || '').trim();
    const message = String(body.message || '').trim().slice(0, 2000);
    if (!eventId || !message) {
      return NextResponse.json({error: 'Message is required.'}, {status: 400});
    }

    const eventSnap = await db.collection('events').doc(eventId).get();
    if (!eventSnap.exists) return NextResponse.json({error: 'Event not found.'}, {status: 404});
    const event = eventSnap.data() as {
      title?: string;
      organizerUid?: string;
      organizerEmail?: string;
      organizer?: {name?: string};
    };

    const senderSnap = await db.collection('users').doc(uid).get();
    const sender = (senderSnap.exists ? senderSnap.data() : {}) as {name?: string; email?: string};
    const senderName = sender.name || 'An attendee';
    const senderEmail = sender.email || '';

    // Prefer the organizer's own address; fall back to the admin inbox so the
    // message is never lost (seeded events may lack organizerEmail).
    const resolvedTo = event.organizerEmail || process.env.ADMIN_EMAIL || 'isabideveloper@gmail.com';

    const organizerName = event.organizer?.name || 'the organizer';
    await sendHostMessageEmail({
      to: resolvedTo,
      organizerName,
      senderName,
      senderEmail,
      eventTitle: event.title || 'your event',
      message,
    });

    if (event.organizerUid) {
      await createNotification({
        userId: event.organizerUid,
        title: 'New message about your event',
        body: `${senderName} sent you a message about "${event.title || 'your event'}": ${message.slice(0, 140)}`,
        type: 'info',
        href: '/dashboard/organizer',
      });
    }

    return NextResponse.json({ok: true});
  } catch (err) {
    return NextResponse.json(
      {error: err instanceof Error ? err.message : 'Could not send your message.'},
      {status: 500}
    );
  }
}
