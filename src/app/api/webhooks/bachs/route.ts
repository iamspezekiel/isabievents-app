/**
 * POST /api/webhooks/bachs — Bachs webhook receiver.
 *
 * Verifies X-Bachs-Signature (HMAC-SHA256 of "{timestamp}.{rawBody}", hex)
 * against BACHS_WEBHOOK_SECRET, deduplicates by event id, and fulfils paid
 * orders: marks the order paid in Firestore and issues QR tickets.
 *
 * Register this URL in the Bachs Developer Portal → Webhooks:
 *   https://<your-domain>/api/webhooks/bachs
 * Events: checkout.completed, collection.succeeded, collection.failed
 */
import {NextResponse} from 'next/server';
import {verifyBachsSignature} from '@/lib/bachs';
import {sendPaymentConfirmationEmail} from '@/lib/email';

export const runtime = 'nodejs';

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

type AdminDb = NonNullable<ReturnType<(typeof import('@/lib/firebase-admin'))['getAdminDb']>>;

async function markEventProcessed(eventId: string, adminDb: AdminDb | null): Promise<boolean> {
  // Returns true if this is a NEW event (false = duplicate delivery).
  if (adminDb) {
    try {
      const ref = adminDb.collection('webhook_events').doc(eventId);
      const snap = await ref.get();
      if (snap.exists) return false;
      await ref.set({processedAt: new Date().toISOString()});
      return true;
    } catch (err) {
      console.warn('[webhook] dedup check failed (continuing):', err);
      return true;
    }
  }
  return true; // no persistence configured — process anyway
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

  const eventId = event.id || `no_id_${Date.now()}`;

  // Lazily load the Firestore-backed modules (firebase-admin is heavy and
  // historically breaks when bundled for serverless). A load failure now
  // returns a readable JSON error instead of an opaque 500 page.
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

  const isNew = await markEventProcessed(eventId, getAdminDb());
  if (!isNew) {
    return NextResponse.json({received: true, duplicate: true});
  }

  const type = event.type || '';

  try {
    if (type === 'checkout.completed' || type === 'collection.succeeded') {
      const checkoutId = extractCheckoutId(event.data);
      if (checkoutId && db.isDbConfigured()) {
        const order = await db.findOrderByCheckoutId(checkoutId);
        if (order && order.status !== 'paid') {
          await db.updateOrder(order.id, {
            status: 'paid',
            paidAt: new Date().toISOString(),
          });
          await db.issueTicketsForOrder({...order, status: 'paid'});
          console.log(`[webhook] order ${order.id} fulfilled for ${checkoutId}`);

          // Email the buyer their tickets + alert the admin (no-op without SMTP).
          const tickets = Array.from(
            {length: order.quantity},
            (_, i) => `TKT-${order.id.toUpperCase().slice(0, 8)}-${i + 1}`
          );
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
            console.warn('[webhook] payment email failed:', err);
          }
        }
      }
    } else if (type === 'collection.failed' || type === 'checkout.expired') {
      const checkoutId = extractCheckoutId(event.data);
      if (checkoutId && db.isDbConfigured()) {
        const order = await db.findOrderByCheckoutId(checkoutId);
        if (order && order.status === 'pending') {
          await db.updateOrder(order.id, {status: 'failed'});
        }
      }
    }
    // Other event types are acknowledged and ignored (forward compatible).
  } catch (err) {
    console.error('[webhook] fulfilment error:', err);
    // Still 200: the event was recorded; replay is available from the portal.
  }

  return NextResponse.json({received: true});
}
