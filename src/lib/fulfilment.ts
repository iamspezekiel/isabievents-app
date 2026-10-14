/**
 * Paid-order fulfilment — the single place that turns a paid checkout into
 * issued tickets + buyer email. Idempotent by construction: the pending→paid
 * transition happens inside a Firestore transaction, so concurrent callers
 * (the Bachs webhook and the post-payment confirm endpoint) can never issue
 * tickets or send the confirmation twice.
 *
 * All Firebase access is lazy-loaded (firebase-admin is heavy and breaks
 * serverless cold starts when imported at module scope).
 */
import {admin} from '@/lib/server-admin';
import {sendPaymentConfirmationEmail} from '@/lib/email';
import {notifyByEmail} from '@/lib/notifications';
import type {OrderDoc} from './db-types';

/** Deterministic QR payloads for an order (matches `issueTicketsForOrder`). */
export function ticketCodesFor(order: {id: string; quantity: number}): string[] {
  const qty = Math.max(0, Math.floor(Number(order.quantity) || 0));
  return Array.from({length: qty}, (_, i) => `TKT-${order.id.toUpperCase().slice(0, 8)}-${i + 1}`);
}

export interface FulfilResult {
  /** true only for the caller that performed the pending→paid transition. */
  fulfilled: boolean;
  order: OrderDoc;
  tickets: string[];
}

async function sendFulfilmentEmails(order: OrderDoc, tickets: string[]): Promise<void> {
  try {
    await sendPaymentConfirmationEmail({
      name: order.buyer.name,
      email: order.buyer.email,
      eventTitle: order.eventTitle,
      quantity: order.quantity,
      amount: order.amount,
      currency: order.currency,
      orderId: order.id,
      tickets,
    });
  } catch (err) {
    console.warn('[fulfilment] payment confirmation email failed:', err);
  }
  notifyByEmail(order.buyer.email, {
    title: 'Payment confirmed',
    body: `Your payment for "${order.eventTitle}" is confirmed — ${order.quantity} ticket${order.quantity === 1 ? '' : 's'} are now in your wallet.`,
    type: 'success',
    href: '/dashboard/attendee',
  }).catch(() => undefined);
}

/**
 * Fulfil a paid order exactly once. Returns `fulfilled:false` (without
 * re-issuing tickets or re-emailing) when the order was already paid.
 */
export async function fulfilPaidOrder(order: OrderDoc, paymentId?: string): Promise<FulfilResult> {
  const tickets = ticketCodesFor(order);
  const paidAt = new Date().toISOString();
  const db = await import('@/lib/db');
  const {getAdminDb} = await admin();
  const adminDb = getAdminDb();

  if (adminDb) {
    const ref = adminDb.collection('orders').doc(order.id);
    let won = false;
    await adminDb.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      const currentStatus = snap.exists ? (snap.data() as {status?: string}).status : order.status;
      if (currentStatus === 'paid') {
        won = false;
        return;
      }
      tx.set(ref, {status: 'paid', paidAt, ...(paymentId ? {paymentId} : {})}, {merge: true});
      won = true;
    });

    const fulfilledOrder: OrderDoc = {...order, status: 'paid', paidAt, ...(paymentId ? {paymentId} : {})};
    if (!won) return {fulfilled: false, order: fulfilledOrder, tickets};

    await db.issueTicketsForOrder(fulfilledOrder);
    await sendFulfilmentEmails(fulfilledOrder, tickets);
    return {fulfilled: true, order: fulfilledOrder, tickets};
  }

  // No Admin SDK (dev only): best-effort check-then-write idempotency.
  if (order.status === 'paid') return {fulfilled: false, order, tickets};
  const fulfilledOrder: OrderDoc = {...order, status: 'paid', paidAt, ...(paymentId ? {paymentId} : {})};
  await db.updateOrder(order.id, {status: 'paid', paidAt, ...(paymentId ? {paymentId} : {})});
  await db.issueTicketsForOrder(fulfilledOrder);
  await sendFulfilmentEmails(fulfilledOrder, tickets);
  return {fulfilled: true, order: fulfilledOrder, tickets};
}
