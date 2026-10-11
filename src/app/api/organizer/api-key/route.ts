import {NextResponse} from 'next/server';
import {randomBytes, timingSafeEqual} from 'crypto';
import {requireOrganizer, isResponse} from '@/lib/admin-auth';
import {admin} from '@/lib/server-admin';

export const runtime = 'nodejs';

/** Deterministic, org-scoped API key (sk_live_ prefix, like the docs describe). */
function generateKey(): string {
  return `sk_live_${randomBytes(24).toString('hex')}`;
}

/**
 * GET  /api/organizer/api-key — return the caller's key (creating one if absent).
 * POST /api/organizer/api-key — regenerate the key (invalidates the old one).
 */
export async function GET(req: Request) {
  const uid = await requireOrganizer(req);
  if (isResponse(uid)) return uid;
  const {getAdminDb} = await admin();
  const db = getAdminDb();
  if (!db) return NextResponse.json({error: 'Server credentials missing.'}, {status: 503});

  const ref = db.collection('users').doc(uid);
  const snap = await ref.get();
  const profile = (snap.exists ? snap.data() : {}) as {apiKey?: string};
  let apiKey = profile.apiKey || '';
  if (!apiKey) {
    apiKey = generateKey();
    await ref.set({apiKey}, {merge: true});
  }
  return NextResponse.json({apiKey});
}

export async function POST(req: Request) {
  const uid = await requireOrganizer(req);
  if (isResponse(uid)) return uid;
  const {getAdminDb} = await admin();
  const db = getAdminDb();
  if (!db) return NextResponse.json({error: 'Server credentials missing.'}, {status: 503});

  const apiKey = generateKey();
  await db.collection('users').doc(uid).set({apiKey, apiKeyRotatedAt: new Date().toISOString()}, {merge: true});
  return NextResponse.json({apiKey});
}
