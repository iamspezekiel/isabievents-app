/**
 * POST /api/checkout/confirm
 *
 * The single authoritative "is this purchase really complete?" check used by
 * the confirmation page. Verifies the Bachs session and, when paid, reconciles
 * fulfilment idempotently — so a missed or late webhook still issues tickets.
 *
 * Never reports `paid:true` unless the payment is confirmed by the gateway
 * (or the order is already recorded as paid, e.g. a free ticket).
 */
import {NextResponse} from 'next/server';
import {getCheckoutSession, isBachsConfigured} from '@/lib/bachs';
import {fulfilPaidOrder, ticketCodesFor} from '@/lib/fulfilment';
import type {OrderDoc} from '@/lib/db-types';

export const runtime = 'nodejs';

interface ConfirmBody {
  session_id?: string;
  order_id?: string;
}

/** Minimal, non-sensitive purchase summary for the confirmation page. */
function confirmPayload(order: OrderDoc, paid: boolean) {
  return {
    paid,
    status: order.status,
    orderId: order.id,
    eventId: order.eventId,
    eventTitle: order.eventTitle,
    quantity: order.quantity,
    tierName: order.tierName || '',
    amount: order.amount,
    currency: order.currency,
    buyerName: order.buyer?.name || '',
    tickets: ticketCodesFor(order),
    paidAt: order.paidAt || '',
  };
}

export async function POST(req: Request) {
  let body: ConfirmBody;
  try {
    body = (await req.json()) as ConfirmBody;
  } catch {
    return NextResponse.json({error: 'Invalid JSON body.'}, {status: 400});
  }

  const sessionId = (body.session_id || '').trim();
  const orderId = (body.order_id || '').trim();
  if (!sessionId && !orderId) {
    return NextResponse.json({error: 'session_id or order_id is required.'}, {status: 400});
  }

  const db = await import('@/lib/db');
  if (!db.isDbConfigured()) {
    return NextResponse.json({error: 'Database not configured.'}, {status: 503});
  }

  try {
    let order = orderId ? await db.getOrderById(orderId) : null;

    if (sessionId) {
      if (!isBachsConfigured()) {
        // Never fabricate a paid status without the gateway.
        return NextResponse.json(
          {error: 'Payment gateway is not configured.', status: 'unavailable'},
          {status: 503}
        );
      }
      const session = await getCheckoutSession(sessionId);
      const paid =
        session.status === 'completed' || session.status === 'paid' || session.status === 'succeeded';
      if (!paid) {
        return NextResponse.json({paid: false, status: session.status || 'pending'});
      }
      if (!order) order = await db.findOrderByCheckoutId(session.checkout_id || sessionId);
      if (!order) {
        // Payment went through but we have no order record to fulfil (a
        // persistence gap at checkout time). Do not claim success.
        console.error('[checkout/confirm] paid session with no matching order:', session.checkout_id || sessionId);
        return NextResponse.json({paid: false, status: 'unmatched'});
      }
      const paymentId = typeof session.payment_id === 'string' ? session.payment_id : undefined;
      const result = await fulfilPaidOrder(order, paymentId);
      return NextResponse.json(confirmPayload(result.order, true));
    }

    // order_id path — free orders (already fulfilled) and page refreshes.
    if (!order) return NextResponse.json({paid: false, status: 'not_found'}, {status: 404});
    return NextResponse.json(confirmPayload(order, order.status === 'paid'));
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to confirm payment.';
    console.error('[checkout/confirm]', message);
    return NextResponse.json({error: message}, {status: 502});
  }
}
