/**
 * POST /api/email/subscribe — newsletter subscribe from the footer:
 * notifies ADMIN_EMAIL and sends the subscriber a confirmation.
 */
import {NextResponse} from 'next/server';
import {isEmailConfigured, sendSubscribeEmail} from '@/lib/email';
import {getAdminDb} from '@/lib/firebase-admin';

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

  // Persist for the admin newsletter audience (best-effort, server-side).
  let stored = false;
  try {
    const db = getAdminDb();
    if (db) {
      const docId = email.toLowerCase().replace(/[.#$[\]/]/g, '_');
      await db
        .collection('subscribers')
        .doc(docId)
        .set({email: email.toLowerCase(), subscribedAt: new Date().toISOString()}, {merge: true});
      stored = true;
    }
  } catch (err) {
    console.warn('[subscribe] persist failed:', err);
  }

  const sent = await sendSubscribeEmail(email);
  return NextResponse.json({ok: true, sent, stored, configured: isEmailConfigured()});
}
