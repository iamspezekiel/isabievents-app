import {NextResponse} from 'next/server';
import {admin} from '@/lib/server-admin';
import {sendPaymentConfirmationEmail} from '@/lib/email';

export const runtime = 'nodejs';

/**
 * POST /api/tickets/resend — re-send a buyer's ticket email by purchase email.
 * body: { email }
 * Public (no auth) so a locked-out buyer can recover tickets; rate-limited by
 * only matching existing tickets and reusing the stored order data.
 */
export async function POST(req: Request) {
  const {getAdminDb} = await admin();
  const db = getAdminDb();
  if (!db) return NextResponse.json({error: 'Server credentials missing.'}, {status: 503});

  try {
    const body = (await req.json()) as {email?: string};
    const email = (body.email || '').trim().toLowerCase();
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return NextResponse.json({error: 'Enter a valid email address.'}, {status: 400});
    }

    // Find every ticket for this buyer (single-field query — no index needed).
    const snap = await db.collection('tickets').where('buyerEmail', '==', email).limit(100).get();
    if (snap.empty) {
      return NextResponse.json(
        {error: 'No tickets found for that email. Check the address or contact support.'},
        {status: 404}
      );
    }

    // Group tickets by order so each order gets one consolidated email.
    const byOrder = new Map<string, {codes: string[]; title: string; holder: string}>();
    snap.docs.forEach((d) => {
      const t = d.data() as {
        orderId?: string; code?: string; eventTitle?: string; holderName?: string;
      };
      const orderId = t.orderId || 'unknown';
      const entry = byOrder.get(orderId) || {codes: [], title: t.eventTitle || 'your event', holder: t.holderName || ''};
      if (t.code) entry.codes.push(t.code);
      byOrder.set(orderId, entry);
    });

    let sent = 0;
    for (const [orderId, entry] of byOrder) {
      // Pull the original order for amount/currency + buyer name.
      let amount = 0;
      let currency: 'NGN' | 'USD' = 'NGN';
      let name = entry.holder || email.split('@')[0];
      try {
        const orderSnap = await db.collection('orders').doc(orderId).get();
        if (orderSnap.exists) {
          const o = orderSnap.data() as {
            amount?: number; currency?: 'NGN' | 'USD'; buyer?: {name?: string}; eventTitle?: string;
          };
          amount = Number(o.amount) || 0;
          currency = o.currency === 'USD' ? 'USD' : 'NGN';
          name = o.buyer?.name || name;
        }
      } catch {
        /* order may be missing — resend with defaults */
      }
      const ok = await sendPaymentConfirmationEmail({
        name,
        email,
        eventTitle: entry.title,
        quantity: entry.codes.length,
        amount,
        currency,
        orderId,
        tickets: entry.codes,
      });
      if (ok) sent++;
    }

    if (sent === 0) {
      return NextResponse.json(
        {error: 'Tickets found but the email could not be sent right now. Please try again shortly.'},
        {status: 502}
      );
    }
    return NextResponse.json({ok: true, orders: byOrder.size});
  } catch (err) {
    return NextResponse.json(
      {error: err instanceof Error ? err.message : 'Could not resend tickets.'},
      {status: 500}
    );
  }
}
