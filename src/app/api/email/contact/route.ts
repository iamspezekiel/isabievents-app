/**
 * POST /api/email/contact — forwards the contact-us form to ADMIN_EMAIL.
 */
import {NextResponse} from 'next/server';
import {isEmailConfigured, sendContactEmail} from '@/lib/email';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  let body: {name?: string; email?: string; subject?: string; message?: string};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({error: 'Invalid JSON body.'}, {status: 400});
  }

  const name = (body.name || '').trim();
  const email = (body.email || '').trim();
  const message = (body.message || '').trim();

  if (!name || !email || !message) {
    return NextResponse.json({error: 'Name, email and message are required.'}, {status: 400});
  }

  const sent = await sendContactEmail({name, email, subject: body.subject, message});
  return NextResponse.json({ok: true, sent, configured: isEmailConfigured()});
}
