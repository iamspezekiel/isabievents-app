import {NextResponse} from 'next/server';
import {admin} from '@/lib/server-admin';
import {verifyTotp} from '@/lib/totp';

export const runtime = 'nodejs';

/**
 * POST /api/auth/tfa — login-time two-factor step, now backed by the user's
 * authenticator app (Google Authenticator / Authy) via TOTP.
 *   {action: 'status', email}        → {enabled}
 *   {action: 'verify', email, code}  → checks the 6-digit TOTP code
 * The secret lives on the user's profile (set up in Security settings), so
 * only the server can validate it. No codes are emailed.
 */
export async function POST(req: Request) {
  const {getAdminDb} = await admin();
  const db = getAdminDb();
  if (!db) return NextResponse.json({error: 'Server credentials missing.'}, {status: 503});

  try {
    const body = (await req.json()) as {action?: string; email?: string; code?: string};
    const email = String(body.email || '').trim().toLowerCase();
    if (!email) return NextResponse.json({error: 'Email is required.'}, {status: 400});

    const usersSnap = await db.collection('users').where('email', '==', email).limit(1).get();
    const userDoc = usersSnap.empty ? null : usersSnap.docs[0];

    if (body.action === 'status') {
      const data = userDoc ? (userDoc.data() as {twoFactor?: boolean}) : {};
      return NextResponse.json({enabled: data.twoFactor === true});
    }

    if (!userDoc) {
      // Don't reveal whether the account exists.
      return NextResponse.json({ok: true});
    }

    const profile = userDoc.data() as {twoFactor?: boolean; totpSecret?: string; name?: string};

    if (body.action === 'verify') {
      if (profile.twoFactor !== true || !profile.totpSecret) {
        return NextResponse.json({ok: false, error: 'Two-factor is not enabled for this account.'}, {status: 400});
      }
      if (!verifyTotp(profile.totpSecret, body.code || '')) {
        return NextResponse.json({ok: false, error: 'Incorrect code. Check your authenticator app and try again.'}, {status: 400});
      }
      return NextResponse.json({ok: true});
    }

    // 'send' is kept for backward compatibility but is a no-op — TOTP needs no send.
    if (body.action === 'send') {
      return NextResponse.json({ok: true, enabled: profile.twoFactor === true});
    }

    return NextResponse.json({error: 'Unknown action.'}, {status: 400});
  } catch (err) {
    return NextResponse.json(
      {error: err instanceof Error ? err.message : 'Two-factor step failed.'},
      {status: 500}
    );
  }
}
