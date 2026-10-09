/**
 * POST /api/email/subscribe — newsletter subscribe from the footer:
 * notifies ADMIN_EMAIL and sends the subscriber a confirmation.
 */
import {NextResponse} from 'next/server';
import {isEmailConfigured, sendSubscribeEmail} from '@/lib/email';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  let body: {email?: string};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({error: 'Invalid JSON body.'}, {status: 400});
  }

  const email = (body.email || '').trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({error: 'A valid email is required.'}, {status: 400});
  }

  const sent = await sendSubscribeEmail(email);
  return NextResponse.json({ok: true, sent, configured: isEmailConfigured()});
}
