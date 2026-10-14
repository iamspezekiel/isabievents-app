/**
 * POST /api/webhooks/bachs — Bachs webhook receiver (server of record for
 * payment fulfilment).
 *
 * Verifies X-Bachs-Signature (HMAC-SHA256 of "{timestamp}.{rawBody}", hex)
 * against BACHS_WEBHOOK_SECRET, then fulfils the paid order: it marks the
 * order paid and issues the attendee's QR tickets.
 *
 * Retry-safety:
 *  - A delivery is only recorded as processed (`status: "done"`) AFTER it has
 *    been handled successfully, so a retry of a failed delivery is processed
 *    again instead of being discarded as a duplicate.
 *  - On failure the handler responds 5xx (instead of 200) so the gateway
 *    retries; the failure is recorded on the ledger for visibility.
 *  - Duplicate tickets are impossible: fulfilment is transactional and ticket
 *    ids are deterministic per order (see `fulfilPaidOrder`).
 *
 * Register this URL in the Bachs Developer Portal → Webhooks:
 *   https://<your-domain>/api/webhooks/bachs
 * Events: checkout.completed, collection.succeeded, collection.failed,
 *         checkout.expired
 */
import {NextResponse} from 'next/server';
import {createHash} from 'crypto';
import {verifyBachsSignature} from '@/lib/bachs';
import {fulfilPaidOrder} from '@/lib/fulfilment';

export const runtime = 'nodejs';

const PAID_EVENTS = ['checkout.completed', 'collection.succeeded'];
const FAILED_EVENTS = ['collection.failed', 'checkout.expired'];

/** Extract a chk_... checkout id from the event payload (lenient parsing). */
function extractCheckoutId(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null;
  const d = data as Record<string, unknown>;
  for (const key of ['checkout_id', 'session_id', 'id', 'checkoutId']) {
    const v = d[key];
    if (typeof v === 'string' && v.startsWith('chk_')) return v;
  }
  const nested = d.checkout ?? d.payment;
  if (nested && typeof nested === 'object') {
    const n = nested as Record<string, unknown>;
    if (typeof n.checkout_id === 'string') return n.checkout_id;
    if (typeof n.id === 'string' && n.id.startsWith('chk_')) return n.id;
  }
  // Last resort: find a chk_ id anywhere in the payload.
  const match = JSON.stringify(data).match(/chk_[A-Za-z0-9]+/);
  return match ? match[0] : null;
}

/** Extract our own ord_... order id (from metadata or the payload). */
function extractOrderId(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null;
  const d = data as Record<string, unknown>;
  const meta = d.metadata && typeof d.metadata === 'object' ? (d.metadata as Record<string, unknown>) : {};
  const candidates = [meta.orderId, meta.order_id, d.order_id, d.orderId, d.reference];
  for (const c of candidates) {
    if (typeof c === 'string' && c.startsWith('ord_')) return c;
  }
  const m = JSON.stringify(data).match(/ord_[A-Za-z0-9]+/);
  return m ? m[0] : null;
}

/**
 * Stable idempotency key for a delivery. Uses the gateway's event id when
 * present; otherwise hashes the raw body so retries of the exact same payload
 * still de-duplicate (a timestamp-based fallback would defeat dedup).
 */
function eventKey(event: {id?: string}, rawBody: string): string {
  if (event.id) return event.id;
  return `sha256_${createHash('sha256').update(rawBody).digest('hex')}`;
}

export async function POST(req: Request) {
  const rawBody = await req.text();

  const signature = req.headers.get('x-bachs-signature');
  const timestamp = req.headers.get('x-bachs-timestamp');
  const secret = process.env.BACHS_WEBHOOK_SECRET;

  if (!secret) {
    console.warn('[webhook] BACHS_WEBHOOK_SECRET not set — rejecting delivery.');
    return NextResponse.json({error: 'Webhook secret not configured.'}, {status: 500});
  }

  if (!verifyBachsSignature(rawBody, signature, timestamp, secret)) {
    console.warn('[webhook] signature verification failed.');
    return NextResponse.json({error: 'Invalid signature.'}, {status: 401});
  }

  let event: {id?: string; type?: string; data?: unknown};
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({error: 'Invalid JSON.'}, {status: 400});
  }

  const key = eventKey(event, rawBody);
  const type = event.type || '';

  // Lazily load the Firestore-backed modules (firebase-admin is heavy and
  // historically breaks when bundled for serverless).
  let getAdminDb: (typeof import('@/lib/firebase-admin'))['getAdminDb'];
  let db: typeof import('@/lib/db');
  try {
    getAdminDb = (await import('@/lib/firebase-admin')).getAdminDb;
    db = await import('@/lib/db');
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[webhook] failed to load server modules:', err);
    return NextResponse.json({error: `Server modules failed to load: ${message}`}, {status: 503});
  }

  const adminDb = getAdminDb();
  const ledger = adminDb ? adminDb.collection('webhook_events').doc(key) : null;

  // Only a *successfully handled* delivery is a duplicate.
  if (ledger) {
    try {
      const snap = await ledger.get();
      if (snap.exists && (snap.data() as {status?: string})?.status === 'done') {
        return NextResponse.json({received: true, duplicate: true});
      }
    } catch (err) {
      console.warn('[webhook] dedup read failed (continuing):', err);
    }
  }

  try {
    if (PAID_EVENTS.includes(type)) {
      // A paid event MUST resolve to an order and fulfil it — otherwise we ask
      // the gateway to retry (the order may simply not be visible yet).
      const checkoutId = extractCheckoutId(event.data);
      const orderId = extractOrderId(event.data);
      if (!db.isDbConfigured()) throw new Error('Database is not configured.');

      let order = checkoutId ? await db.findOrderByCheckoutId(checkoutId) : null;
      if (!order && orderId) order = await db.getOrderById(orderId);
      if (!order) {
        throw new Error(`No order found for ${checkoutId ? `checkout ${checkoutId}` : `order ${orderId || '(unknown)'}`}`);
      }

      const rawPaymentId = (event.data as {payment_id?: unknown})?.payment_id;
      const paymentId = typeof rawPaymentId === 'string' ? rawPaymentId : undefined;

      // Atomic + idempotent: issues tickets / sends email exactly once.
      const result = await fulfilPaidOrder(order, paymentId);
      console.log(
        `[webhook] order ${order.id} ${result.fulfilled ? 'fulfilled' : 'already paid'} (${type})`
      );
    } else if (FAILED_EVENTS.includes(type)) {
      const checkoutId = extractCheckoutId(event.data);
      const orderId = extractOrderId(event.data);
      if (db.isDbConfigured()) {
        let order = checkoutId ? await db.findOrderByCheckoutId(checkoutId) : null;
        if (!order && orderId) order = await db.getOrderById(orderId);
        if (order && order.status === 'pending') {
          await db.updateOrder(order.id, {status: 'failed'});
          console.log(`[webhook] order ${order.id} marked failed (${type})`);
        }
      }
    }
    // Other event types are acknowledged and ignored (forward compatible).

    if (ledger) {
      await ledger
        .set({status: 'done', type, processedAt: new Date().toISOString()}, {merge: true})
        .catch((err) => console.warn('[webhook] ledger mark-done failed:', err));
    }
    return NextResponse.json({received: true});
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[webhook] fulfilment failed:', message);
    // Record the failure (do NOT mark done) and ask the gateway to retry.
    if (ledger) {
      await ledger
        .set({status: 'failed', type, lastError: message, attemptedAt: new Date().toISOString()}, {merge: true})
        .catch(() => undefined);
    }
    return NextResponse.json({error: 'Fulfilment failed; retry requested.'}, {status: 500});
  }
}
