import {NextResponse} from 'next/server';
import {admin} from '@/lib/server-admin';
import {sendTfaCodeEmail} from '@/lib/email';

export const runtime = 'nodejs';

const TFA_TTL_MS = 10 * 60 * 1000; // code lifetime
const RESEND_COOLDOWN_MS = 60 * 1000; // between sends to the same account
const MAX_ATTEMPTS = 5; // wrong guesses before the code is invalidated

/**
 * POST /api/auth/tfa — email-based two-factor authentication.
 *   {action: 'send',   email}           → email a fresh code
 *   {action: 'verify', email, code}     → checks + clears the code
 *   {action: 'status', email}           → {enabled} for the sign-in flow
 *
 * The code lives on the user's profile doc (tfaCode/tfaExpires/tfaAttempts),
 * so only the server (Admin SDK) can read or validate it.
 */
export async function POST(req: Request) {
  const {getAdminDb} = await admin();
  const db = getAdminDb();
  if (!db) return NextResponse.json({error: 'Server credentials missing.'}, {status: 503});

  try {
    const body = (await req.json()) as {action?: string; email?: string; code?: string};
    const email = String(body.email || '').trim().toLowerCase();
    if (!email) return NextResponse.json({error: 'Email is required.'}, {status: 400});

    // Single-field query — no index required.
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

    type TfaFields = {
      name?: string;
      twoFactor?: boolean;
      tfaCode?: string;
      tfaExpires?: number;
      tfaAttempts?: number;
      tfaSentAt?: number;
    };
    const profile = userDoc.data() as TfaFields;

    if (body.action === 'send') {
      if (profile.twoFactor !== true) {
        return NextResponse.json({ok: true, enabled: false});
      }
      // Cooldown so the endpoint can't be used to spam an inbox.
      const sentAt = profile.tfaSentAt || 0;
      if (Date.now() - sentAt < RESEND_COOLDOWN_MS) {
        return NextResponse.json({ok: true, cooldown: true});
      }
      const code = String(Math.floor(100000 + Math.random() * 900000));
      await userDoc.ref.update({
        tfaCode: code,
        tfaExpires: Date.now() + TFA_TTL_MS,
        tfaAttempts: 0,
        tfaSentAt: Date.now(),
      });
      await sendTfaCodeEmail({to: email, name: profile.name, code, expiresInMinutes: TFA_TTL_MS / 60000});
      return NextResponse.json({ok: true, enabled: true});
    }

    if (body.action === 'verify') {
      const code = String(body.code || '').trim();
      if (!/^\d{6}$/.test(code)) {
        return NextResponse.json({ok: false, error: 'Enter the 6-digit code from your email.'}, {status: 400});
      }
      if (!profile.tfaCode || !profile.tfaExpires || Date.now() > profile.tfaExpires) {
        return NextResponse.json({ok: false, error: 'That code has expired — sign in again to get a new one.'}, {status: 400});
      }
      if ((profile.tfaAttempts || 0) >= MAX_ATTEMPTS) {
        await userDoc.ref.update({tfaCode: null, tfaExpires: null, tfaAttempts: null});
        return NextResponse.json({ok: false, error: 'Too many wrong attempts — sign in again to get a new code.'}, {status: 400});
      }
      if (code !== profile.tfaCode) {
        await userDoc.ref.update({tfaAttempts: (profile.tfaAttempts || 0) + 1});
        const left = MAX_ATTEMPTS - ((profile.tfaAttempts || 0) + 1);
        return NextResponse.json({ok: false, error: `Incorrect code. ${left} attempt${left === 1 ? '' : 's'} left.`}, {status: 400});
      }
      // Single use — clear immediately.
      await userDoc.ref.update({tfaCode: null, tfaExpires: null, tfaAttempts: null, tfaSentAt: null});
      return NextResponse.json({ok: true});
    }

    return NextResponse.json({error: 'Unknown action.'}, {status: 400});
  } catch (err) {
    return NextResponse.json(
      {error: err instanceof Error ? err.message : 'Two-factor step failed.'},
      {status: 500}
    );
  }
}