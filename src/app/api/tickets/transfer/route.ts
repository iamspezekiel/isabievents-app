import {NextResponse} from 'next/server';
import {getAdminAuth, getAdminDb} from '@/lib/firebase-admin';

export const runtime = 'nodejs';

/**
 * POST /api/tickets/transfer — transfer one of your tickets to another email.
 * body: { ticketId: string, toEmail: string }
 * Only the ticket's current owner (from the verified ID token) may transfer.
 */
export async function POST(req: Request) {
  try {
    const header = req.headers.get('authorization') || '';
    const token = header.startsWith('Bearer ') ? header.slice(7).trim() : null;
    const auth = getAdminAuth();
    const db = getAdminDb();
    if (!token || !auth || !db) {
      return NextResponse.json({error: 'Unauthorized.'}, {status: 401});
    }

    let callerEmail = '';
    let callerIsAdmin = false;
    try {
      const decoded = await auth.verifyIdToken(token);
      callerEmail = (decoded.email || '').toLowerCase();
      const userSnap = await db.collection('users').doc(decoded.uid).get();
      callerIsAdmin = userSnap.exists && (userSnap.data() as {role?: string}).role === 'admin';
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

    const ticket = snap.data() as {buyerEmail?: string; status?: string};
    if (!callerIsAdmin && (ticket.buyerEmail || '').toLowerCase() !== callerEmail) {
      return NextResponse.json({error: 'This ticket does not belong to your account.'}, {status: 403});
    }
    if (ticket.status === 'used') {
      return NextResponse.json({error: 'This ticket has already been used.'}, {status: 400});
    }

    await ref.update({
      buyerEmail: toEmail,
      transferredAt: new Date().toISOString(),
      transferredBy: callerEmail,
    });
    return NextResponse.json({ok: true, to: toEmail});
  } catch (err) {
    return NextResponse.json(
      {error: err instanceof Error ? err.message : 'Transfer failed.'},
      {status: 500}
    );
  }
}