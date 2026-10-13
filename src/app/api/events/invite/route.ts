import {NextResponse} from 'next/server';
import {requireAuth, isResponse} from '@/lib/admin-auth';
import {admin} from '@/lib/server-admin';
import {sendEventInviteEmail} from '@/lib/email';
import {createNotification} from '@/lib/notifications';

export const runtime = 'nodejs';

/**
 * POST /api/events/invite — "Invite a Friend" on an event page.
 * Emails the friend a personal link to the event and confirms on the
 * inviter's notification feed.
 * Body: {eventId, friendEmail, friendName?, message?}
 */
export async function POST(req: Request) {
  const uid = await requireAuth(req);
  if (isResponse(uid)) return uid;
  const {getAdminDb} = await admin();
  const db = getAdminDb();
  if (!db) return NextResponse.json({error: 'Server credentials missing.'}, {status: 503});

  try {
    const body = (await req.json()) as {
      eventId?: string;
      friendEmail?: string;
      friendName?: string;
      message?: string;
    };
    const eventId = String(body.eventId || '').trim();
    const friendEmail = String(body.friendEmail || '').trim().toLowerCase();
    const friendName = String(body.friendName || '').trim().slice(0, 80);
    const message = String(body.message || '').trim().slice(0, 400);

    if (!eventId || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(friendEmail)) {
      return NextResponse.json({error: 'A valid friend email is required.'}, {status: 400});
    }

    const eventSnap = await db.collection('events').doc(eventId).get();
    if (!eventSnap.exists) return NextResponse.json({error: 'Event not found.'}, {status: 404});
    const event = eventSnap.data() as {title?: string; slug?: string};

    const inviterSnap = await db.collection('users').doc(uid).get();
    const inviter = (inviterSnap.exists ? inviterSnap.data() : {}) as {name?: string; email?: string};

    const base = (process.env.APP_BASE_URL || 'https://events.isabi.cloud').replace(/\/+$/, '');
    const eventUrl = `${base}/events/${event.slug || eventId}`;

    await sendEventInviteEmail({
      to: friendEmail,
      friendName,
      inviterName: inviter.name || '',
      eventTitle: event.title || 'an event',
      eventUrl,
      message,
    });

    await createNotification({
      userId: uid,
      title: 'Invite sent',
      body: `Your invitation to ${friendName || friendEmail} for "${event.title || 'the event'}" is on its way.`,
      type: 'success',
      href: `/events/${event.slug || eventId}`,
    });

    return NextResponse.json({ok: true});
  } catch (err) {
    return NextResponse.json(
      {error: err instanceof Error ? err.message : 'Could not send the invite.'},
      {status: 500}
    );
  }
}
