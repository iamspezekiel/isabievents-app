import {NextResponse} from 'next/server';
import {sendPaymentConfirmationEmail} from '@/lib/email';
import {notifyByEmail} from '@/lib/notifications';
import {refundDeadlineFor} from '@/lib/timezone';

export const runtime = 'nodejs';

interface FreeCheckoutBody {
  eventId: string;
  eventTitle?: string;
  quantity?: number;
  buyer: {name: string; email: string; phone?: string};
  buyerUid?: string;
  /** Ticket type purchased — drives the per-tier refund policy snapshot. */
  tierName?: string;
}

/**
 * POST /api/checkout/free — fulfil a FREE event order without any payment
 * gateway. Verifies server-side that the event is genuinely free, then creates
 * a paid (₦0) order, issues QR tickets and emails the buyer — the same result
 * the Bachs webhook produces, minus the payment step.
 */
export async function POST(req: Request) {
  let body: FreeCheckoutBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({error: 'Invalid JSON body.'}, {status: 400});
  }

  const {eventId, buyer} = body;
  if (!eventId || !buyer?.name || !buyer?.email) {
    return NextResponse.json({error: 'Missing required checkout fields.'}, {status: 400});
  }
  const qty = Math.max(1, Math.min(20, Math.floor(Number(body.quantity) || 1)));

  try {
    const db = await import('@/lib/db');
    if (!db.isDbConfigured()) {
      return NextResponse.json({error: 'Database not configured.'}, {status: 503});
    }

    // Server-side trust: only truly-free events skip payment.
    const event = await db.getEvent(eventId);
    if (!event) return NextResponse.json({error: 'Event not found.'}, {status: 404});
    if ((event as {ticketMode?: string}).ticketMode === 'external') {
      return NextResponse.json({error: 'This event is sold on the organizer’s external ticketing page.'}, {status: 400});
    }
    if (Number(event.price?.min ?? 0) > 0) {
      return NextResponse.json({error: 'This event is not free — payment is required.'}, {status: 400});
    }

    const orderId = `ord_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
    const nowIso = new Date().toISOString();

    // Refund-policy snapshot: tier override wins, then the event policy.
    // Legacy events without a policy are treated as non-refundable.
    const tiers = (event as {tiers?: {name: string; price: number; refundable?: boolean}[]}).tiers || [];
    const tier = tiers.find((t) => t.name === (body.tierName || ''));
    const refundable =
      tier && typeof tier.refundable === 'boolean'
        ? tier.refundable
        : (event as {refundPolicy?: string}).refundPolicy === 'refundable';
    const refundCutoffHours = refundable
      ? Math.max(0, Number((event as {refundCutoffHours?: number}).refundCutoffHours) || 0)
      : 0;
    const refundDeadline = refundable ? refundDeadlineFor(event.date, refundCutoffHours) : '';

    const order = {
      id: orderId,
      eventId,
      eventSlug: event.slug || eventId,
      eventTitle: event.title || body.eventTitle || 'Event',
      quantity: qty,
      unitPrice: 0,
      amount: 0,
      currency: 'NGN' as const,
      status: 'paid' as const,
      paidAt: nowIso,
      paymentMethod: 'free',
      buyer: {name: buyer.name, email: buyer.email, phone: buyer.phone},
      buyerUid: body.buyerUid,
      tierName: body.tierName || '',
      refundable,
      refundCutoffHours,
      refundDeadline,
    };

    await db.createOrder(order);
    await db.issueTicketsForOrder(order);

    // Email the free tickets (no-op without SMTP configured).
    const tickets = Array.from({length: qty}, (_, i) => `TKT-${orderId.toUpperCase().slice(0, 8)}-${i + 1}`);
    try {
      await sendPaymentConfirmationEmail({
        name: buyer.name,
        email: buyer.email,
        eventTitle: order.eventTitle,
        quantity: qty,
        amount: 0,
        currency: 'NGN',
        orderId,
        tickets,
      });
    } catch (err) {
      console.warn('[free-checkout] confirmation email failed:', err);
    }

    // Dashboard notification for the buyer (fire-and-forget).
    notifyByEmail(buyer.email, {
      title: 'Tickets confirmed',
      body: `Your ${qty} ticket${qty === 1 ? '' : 's'} for "${order.eventTitle}" are ready — check your email for the QR codes.`,
      type: 'success',
      href: '/dashboard/attendee/history',
    }).catch(() => undefined);

    return NextResponse.json({ok: true, orderId, tickets});
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Free checkout failed.';
    console.error('[api/checkout/free]', message);
    return NextResponse.json({error: message}, {status: 500});
  }
}