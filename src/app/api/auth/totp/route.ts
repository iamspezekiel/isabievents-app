import {NextResponse} from 'next/server';
import {requireAuth, isResponse} from '@/lib/admin-auth';
import {admin} from '@/lib/server-admin';
import {generateTotpSecret, otpauthUri, verifyTotp} from '@/lib/totp';

export const runtime = 'nodejs';

/**
 * POST /api/auth/totp — manage authenticator-app (Google Authenticator) 2FA.
 *   {action:'setup'}            → generate + store a pending secret, return uri
 *   {action:'confirm', code}    → verify a code, then enable twoFactor
 *   {action:'disable'}          → turn twoFactor off and clear the secret
 * The secret is stored on the user's profile; it is never emailed.
 */
export async function POST(req: Request) {
  const uid = await requireAuth(req);
  if (isResponse(uid)) return uid;
  const {getAdminDb} = await admin();
  const db = getAdminDb();
  if (!db) return NextResponse.json({error: 'Server credentials missing.'}, {status: 503});

  try {
    const body = (await req.json()) as {action?: string; code?: string};
    const ref = db.collection('users').doc(uid);
    const snap = await ref.get();
    if (!snap.exists) return NextResponse.json({error: 'Account not found.'}, {status: 404});
    const profile = snap.data() as {email?: string; twoFactor?: boolean; totpSecret?: string};

    if (body.action === 'setup') {
      const secret = generateTotpSecret();
      await ref.set({totpSecret: secret}, {merge: true});
      const uri = otpauthUri(secret, profile.email || uid);
      return NextResponse.json({ok: true, secret, uri, enabled: profile.twoFactor === true});
    }

    if (body.action === 'confirm') {
      const secret = profile.totpSecret;
      if (!secret) return NextResponse.json({error: 'Run setup first.'}, {status: 400});
      if (!verifyTotp(secret, body.code || '')) {
        return NextResponse.json({error: 'Incorrect code. Check your authenticator app and try again.'}, {status: 400});
      }
      await ref.set({twoFactor: true, updatedAt: new Date().toISOString()}, {merge: true});
      return NextResponse.json({ok: true, enabled: true});
    }

    if (body.action === 'disable') {
      await ref.set({twoFactor: false, totpSecret: null, updatedAt: new Date().toISOString()}, {merge: true});
      return NextResponse.json({ok: true, enabled: false});
    }

    return NextResponse.json({error: 'Unknown action.'}, {status: 400});
  } catch (err) {
    return NextResponse.json(
      {error: err instanceof Error ? err.message : 'Two-factor setup failed.'},
      {status: 500}
    );
  }
}
