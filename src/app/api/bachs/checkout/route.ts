/**
 * POST /api/bachs/checkout
 * Creates a pending order in Firestore and a hosted Bachs checkout session,
 * then returns the hosted checkout URL for redirect.
 *
 * Real payments only: when BACHS_API_KEY is missing the route returns a 503
 * error — it never fabricates an order, a session or a "paid" status.
 */
import {NextResponse} from 'next/server';
import {createCheckoutSession, isBachsConfigured, type BachsCurrency} from '@/lib/bachs';
import {refundDeadlineFor} from '@/lib/timezone';
import {NGN_PER_USD} from '@/lib/finance';
import type {OrderDoc} from '@/lib/db';

export const runtime = 'nodejs';

interface CheckoutRequestBody {
  eventId: string;
  eventSlug?: string;
  eventTitle: string;
  quantity: number;
  unitPrice: number; // in event currency's major unit (e.g. NGN naira)
  currency?: BachsCurrency;
  /** Bachs payment corridor: card, bank transfer (NGN), or crypto (USD). */
  paymentMethod?: 'card' | 'bank' | 'crypto';
  /** Ticket type purchased — drives the per-tier refund policy snapshot. */
  tierName?: string;
  buyer: {name: string; email: string; phone?: string};
  buyerUid?: string;
}

/**
 * Maps the UI payment method to Bachs payment corridors and forces the
 * currency each corridor can charge (bank = NGN, crypto = USD).
 */
function resolveCorridor(method: string | undefined, currency: BachsCurrency): {corridors: string[]; currency: BachsCurrency} {
  switch (method) {
    case 'bank':
      return {corridors: ['NGN_BANK_TRANSFER'], currency: 'NGN'};
    case 'crypto':
      return {corridors: ['CRYPTO'], currency: 'USD'};
    case 'card':
    default:
      return {
        corridors: currency === 'USD' ? ['USD_CARD'] : ['NGN_CARD'],
        currency,
      };
  }
}

export async function POST(req: Request) {
  let body: CheckoutRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({error: 'Invalid JSON body.'}, {status: 400});
  }

  const {eventId, eventSlug, eventTitle, quantity, unitPrice, buyer} = body;
  const requestedCurrency: BachsCurrency = body.currency === 'USD' ? 'USD' : 'NGN';
  const {corridors, currency} = resolveCorridor(body.paymentMethod, requestedCurrency);

  if (!eventId || !eventTitle || !buyer?.email || !buyer?.name) {
    return NextResponse.json({error: 'Missing required checkout fields.'}, {status: 400});
  }

  // Load the event once: it gates the external-ticketing mode AND provides the
  // refund policy snapshot captured on the order/tickets for this purchase.
  type EventShape = {
    ticketMode?: string;
    date?: string;
    endDate?: string;
    refundPolicy?: string;
    refundCutoffHours?: number;
    organizerUid?: string;
    organizerEmail?: string;
    price?: {min: number; max: number};
    tiers?: {name: string; price: number; refundable?: boolean}[];
  };
  let eventDoc: EventShape | null = null;
  try {
    const db = await import('@/lib/db');
    eventDoc = (await db.getEvent(eventId)) as EventShape | null;
    if (eventDoc && eventDoc.ticketMode === 'external') {
      return NextResponse.json({error: 'This event is sold on the organizer’s external ticketing page.'}, {status: 400});
    }
  } catch {
    /* a lookup failure must never block a legitimate checkout */
  }

  // Refund eligibility snapshot: tier override wins, then the event policy.
  // Legacy events without a policy are treated as non-refundable.
  const tier = eventDoc?.tiers?.find((t) => t.name === (body.tierName || ''));
  const refundable =
    tier && typeof tier.refundable === 'boolean'
      ? tier.refundable
      : eventDoc?.refundPolicy === 'refundable';
  const refundCutoffHours = refundable ? Math.max(0, Number(eventDoc?.refundCutoffHours) || 0) : 0;
  const refundDeadline = refundable ? refundDeadlineFor(eventDoc?.date, refundCutoffHours) : '';
  const qty = Math.max(1, Math.min(20, Math.floor(Number(quantity) || 1)));

  // Server-authoritative unit price: the selected tier's price when it exists,
  // otherwise the event's minimum price. Event prices are stored in NGN, so a
  // USD charge is converted. The client value is only a fallback for legacy
  // events that store no price at all — a buyer can never underpay.
  const tierPrice = eventDoc?.tiers?.find((t) => t.name === (body.tierName || ''))?.price;
  const hasEventPrice = typeof tierPrice === 'number' || typeof eventDoc?.price?.min === 'number';
  const eventPriceNgn = typeof tierPrice === 'number' ? tierPrice : Number(eventDoc?.price?.min) || 0;
  const price = hasEventPrice
    ? currency === 'USD'
      ? Math.round((eventPriceNgn / NGN_PER_USD) * 100) / 100
      : Math.max(0, eventPriceNgn)
    : Math.max(0, Number(unitPrice) || 0);
  const amount = Math.round(price * qty * 100) / 100;

  if (!isBachsConfigured()) {
    // Real payments only — never fabricate an order or a checkout session.
    return NextResponse.json(
      {error: 'Payment gateway is not configured. Contact support@isabi.cloud.'},
      {status: 503}
    );
  }

  try {
    const orderId = `ord_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
    // Bachs only accepts HTTPS redirect URLs. On localhost, use APP_BASE_URL
    // (your deployed origin) or a tunnel URL so checkout can complete.
    const origin = (process.env.APP_BASE_URL || new URL(req.url).origin).replace(/\/$/, '');
    if (!origin.startsWith('https://')) {
      return NextResponse.json(
        {
          error:
            'Bachs requires HTTPS success/cancel URLs. Set APP_BASE_URL in .env to your public HTTPS origin (e.g. https://events.isabi.cloud) or run a tunnel (cloudflared/ngrok) and use that URL.',
        },
        {status: 400}
      );
    }
    const successPath = `/checkout/${encodeURIComponent(eventSlug || eventId)}`;
    const successUrl = `${origin}${successPath}?session_id={CHECKOUT_ID}&status=success`;
    const cancelUrl = `${origin}${successPath}?status=cancelled`;

    const session = await createCheckoutSession({
      amount: amount.toFixed(2),
      currency,
      customer: {email: buyer.email, name: buyer.name},
      successUrl,
      cancelUrl,
      paymentMethodTypes: corridors,
    });

    // Platform-fee snapshot for this sale (immutable, like the refund snapshot).
    const {getPlatformFeePercent, feeOf} = await import('@/lib/fees');
    const split = feeOf(amount, await getPlatformFeePercent());

    const order: Omit<OrderDoc, 'createdAt'> = {
      id: orderId,
      eventId,
      eventSlug: eventSlug || eventId,
      eventTitle,
      quantity: qty,
      unitPrice: price,
      amount,
      currency,
      status: 'pending',
      checkoutId: session.checkout_id,
      checkoutUrl: session.checkout_url,
      buyer: {name: buyer.name, email: buyer.email, phone: buyer.phone},
      buyerUid: body.buyerUid,
      // Refund-policy snapshot (immutable on the order and every ticket).
      tierName: body.tierName || '',
      refundable,
      refundCutoffHours,
      refundDeadline,
      // Fee / organizer snapshot — drives net earnings + withdrawal balances.
      ...(eventDoc?.organizerUid ? {organizerUid: eventDoc.organizerUid} : {}),
      ...(eventDoc?.organizerEmail ? {organizerEmail: eventDoc.organizerEmail} : {}),
      feePercent: split.feePercent,
      feeAmount: split.feeAmount,
      netAmount: split.netAmount,
    };

    // Lazy-load the Firestore layer so a module-load problem can never take
    // down checkout creation itself (and surfaces a clear error if it exists).
    try {
      const db = await import('@/lib/db');
      if (db.isDbConfigured()) {
        await db.createOrder(order);
      }
    } catch (err) {
      console.error('[api/bachs/checkout] order persistence unavailable:', err);
    }

    return NextResponse.json({
      orderId,
      checkoutId: session.checkout_id,
      checkoutUrl: session.checkout_url,
      amount,
      currency,
      expiresAt: session.expires_at,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create checkout session.';
    console.error('[api/bachs/checkout]', message);
    return NextResponse.json({error: message}, {status: 502});
  }
}
