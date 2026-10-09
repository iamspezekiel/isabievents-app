/**
 * POST /api/bachs/checkout
 * Creates a pending order in Firestore and a hosted Bachs checkout session,
 * then returns the hosted checkout URL for redirect.
 *
 * Falls back to `{demo: true}` when BACHS_API_KEY is not configured so the
 * built-in demo payment flow keeps working.
 */
import {NextResponse} from 'next/server';
import {createCheckoutSession, isBachsConfigured, type BachsCurrency} from '@/lib/bachs';
import {createOrder, isDbConfigured, type OrderDoc} from '@/lib/db';

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

  // Crypto payments are temporarily paused — Bachs card (NGN/USD) and
  // NGN bank transfer remain available. Remove this guard to re-enable.
  if (body.paymentMethod === 'crypto') {
    return NextResponse.json(
      {error: 'Crypto payments are temporarily paused. Please pay with Card or Bank Transfer.'},
      {status: 400}
    );
  }
  const qty = Math.max(1, Math.min(20, Math.floor(Number(quantity) || 1)));
  const price = Math.max(0, Number(unitPrice) || 0);
  const amount = price * qty;

  if (!isBachsConfigured()) {
    return NextResponse.json({
      demo: true,
      message: 'BACHS_API_KEY not configured — use the demo payment flow.',
      orderId: `demo_${Date.now()}`,
      amount,
      currency,
    });
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
    };

    if (isDbConfigured()) {
      await createOrder(order);
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
