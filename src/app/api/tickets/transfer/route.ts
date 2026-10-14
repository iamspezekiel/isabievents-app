import {NextResponse} from 'next/server';
import {admin} from '@/lib/server-admin';
import {notifyByEmail} from '@/lib/notifications';
import {sendTicketTransferEmail} from '@/lib/email';

export const runtime = 'nodejs';

/**
 * POST /api/tickets/transfer — hand one of your tickets over to another email.
 * body: { ticketId: string, toEmail: string }
 *
 * Only the ticket's current owner (from the verified ID token) may transfer.
 *
 * A completed transfer is a CLEAN HANDOVER: `buyerEmail` and `holderName` both
 * move to the recipient — so the ticket immediately shows up in their wallet
 * (Firestore rules let you read a ticket whose `buyerEmail` is your login email)
 * and scans green under their name — while the status stays `active` so it can
 * be viewed and checked in straight away. The recipient is notified in-app and
 * emailed the ticket code. Admins may transfer on a user's behalf.
 */
export async function POST(req: Request) {
  try {
    const header = req.headers.get('authorization') || '';
    const token = header.startsWith('Bearer ') ? header.slice(7).trim() : null;
    const {getAdminAuth, getAdminDb} = await admin();
    const auth = getAdminAuth();
    const db = getAdminDb();
    if (!token || !auth || !db) {
      return NextResponse.json({error: 'Unauthorized.'}, {status: 401});
    }

    let callerEmail = '';
    let callerName = '';
    let callerIsAdmin = false;
    try {
      const decoded = await auth.verifyIdToken(token);
      callerEmail = (decoded.email || '').toLowerCase();
      const userSnap = await db.collection('users').doc(decoded.uid).get();
      if (userSnap.exists) {
        const data = userSnap.data() as {role?: string; name?: string};
        callerIsAdmin = data.role === 'admin';
        callerName = String(data.name || '').trim();
      }
    } catch {
      return NextResponse.json({error: 'Invalid session.'}, {status: 401});
    }
    if (!callerEmail) return NextResponse.json({error: 'Account has no email.'}, {status: 400});

    const body = (await req.json()) as {ticketId?: string; toEmail?: string};
    const ticketId = (body.ticketId || '').trim();
    const toEmail = (body.toEmail || '').trim().toLowerCase();
    if (!ticketId || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(toEmail)) {
      return NextResponse.json({error: 'A valid ticket id and recipient email are required.'}, {status: 400});
    }
    if (toEmail === callerEmail) {
      return NextResponse.json({error: 'Enter a different recipient email.'}, {status: 400});
    }

    const ref = db.collection('tickets').doc(ticketId);
    const snap = await ref.get();
    if (!snap.exists) return NextResponse.json({error: 'Ticket not found.'}, {status: 404});

    const ticket = snap.data() as {
      buyerEmail?: string;
      status?: string;
      code?: string;
      eventTitle?: string;
      holderName?: string;
    };
    if (!callerIsAdmin && (ticket.buyerEmail || '').toLowerCase() !== callerEmail) {
      return NextResponse.json({error: 'This ticket does not belong to your account.'}, {status: 403});
    }
    if (ticket.status === 'used') {
      return NextResponse.json({error: 'This ticket has already been used.'}, {status: 400});
    }
    // A cancelled/refunded ticket is not valid for entry, so it must not be
    // handed on either — otherwise the recipient would receive a dead ticket.
    if (ticket.status === 'cancelled' || ticket.status === 'refunded') {
      return NextResponse.json(
        {error: 'This ticket was cancelled or refunded and can no longer be transferred.'},
        {status: 400}
      );
    }

    // Prefer the recipient's real display name when they already have an
    // account; otherwise use the local part of the email so the gate scanner
    // never shows the previous owner's name.
    let recipientName = '';
    try {
      const recipientSnap = await db.collection('users').where('email', '==', toEmail).limit(1).get();
      if (!recipientSnap.empty) {
        recipientName = String((recipientSnap.docs[0].data() as {name?: string}).name || '').trim();
      }
    } catch {
      /* name lookup is best-effort — never block the transfer */
    }
    const holderName = recipientName || toEmail.split('@')[0];

    await ref.update({
      buyerEmail: toEmail,
      holderName,
      transferredAt: new Date().toISOString(),
      transferredBy: callerEmail,
    });

    const eventTitle = ticket.eventTitle || 'your event';
    const ticketCode = ticket.code || ticketId;

    // Recipient notifications: an in-app entry (resolved by email, so it only
    // lands when they have an account) and the ticket email. Both helpers log
    // and swallow their own failures, so awaiting them can never fail the
    // transfer that already succeeded.
    await Promise.allSettled([
      notifyByEmail(toEmail, {
        title: 'Ticket transferred to you',
        body: `${callerName || callerEmail} transferred a ticket for "${eventTitle}" to you. It is already in your wallet — open it to show the QR at the gate.`,
        type: 'success',
        href: '/dashboard/attendee',
      }),
      sendTicketTransferEmail({
        to: toEmail,
        recipientName,
        senderEmail: callerEmail,
        eventTitle,
        ticketCode,
      }),
    ]);

    return NextResponse.json({ok: true, to: toEmail, holderName});
  } catch (err) {
    return NextResponse.json(
      {error: err instanceof Error ? err.message : 'Transfer failed.'},
      {status: 500}
    );
  }
}
