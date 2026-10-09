/**
 * POST /api/email/welcome — sends the welcome email after any signup
 * (main signup page, checkout signup tab, or Google sign-in first login).
 */
import {NextResponse} from 'next/server';
import {isEmailConfigured, sendAdminNewUserEmail, sendWelcomeEmail} from '@/lib/email';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  let body: {name?: string; email?: string; role?: string; method?: string};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({error: 'Invalid JSON body.'}, {status: 400});
  }

  const email = (body.email || '').trim();
  const name = (body.name || '').trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({error: 'A valid email is required.'}, {status: 400});
  }

  const welcome = await sendWelcomeEmail(name, email);
  await sendAdminNewUserEmail({
    name,
    email,
    role: body.role || 'attendee',
    method: body.method || 'signup',
  });

  return NextResponse.json({ok: true, sent: welcome, configured: isEmailConfigured()});
}
