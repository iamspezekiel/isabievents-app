/**
 * GET /api/bachs/checkout/verify?session_id=chk_...
 * Confirms a checkout session's status after the success redirect.
 * The webhook remains the source of truth for fulfilment; this endpoint only
 * reports what Bachs currently says about the session.
 */
import {NextResponse} from 'next/server';
import {getCheckoutSession, isBachsConfigured} from '@/lib/bachs';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const {searchParams} = new URL(req.url);
  const sessionId = searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.json({error: 'session_id is required.'}, {status: 400});
  }

  if (!isBachsConfigured()) {
    return NextResponse.json({demo: true, status: 'paid'});
  }

  try {
    const session = await getCheckoutSession(sessionId);
    const paid =
      session.status === 'completed' ||
      session.status === 'paid' ||
      session.status === 'succeeded';
    return NextResponse.json({
      status: session.status,
      paid,
      paymentId: session.payment_id,
      checkoutId: session.checkout_id,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to verify session.';
    console.error('[api/bachs/verify]', message);
    return NextResponse.json({error: message}, {status: 502});
  }
}
