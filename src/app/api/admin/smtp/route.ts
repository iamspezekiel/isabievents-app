import {NextResponse} from 'next/server';
import {requireAdmin, isResponse} from '@/lib/admin-auth';
import {resolveSmtpConfig, invalidateSmtpCache} from '@/lib/email';
import {admin} from '@/lib/server-admin';

export const runtime = 'nodejs';

/** GET /api/admin/smtp — effective SMTP config (password never returned). */
export async function GET(req: Request) {
  const uid = await requireAdmin(req);
  if (isResponse(uid)) return uid;
  try {
    const cfg = await resolveSmtpConfig();
    return NextResponse.json({
      host: cfg.host,
      port: cfg.port,
      user: cfg.user,
      userMasked: cfg.user ? `${cfg.user.slice(0, 4)}••••` : '',
      from: cfg.from,
      adminEmail: cfg.adminEmail,
      hasPassword: Boolean(cfg.pass),
    });
  } catch (err) {
    return NextResponse.json(
      {error: err instanceof Error ? err.message : 'Failed to load SMTP settings.'},
      {status: 500}
    );
  }
}

/**
 * POST /api/admin/smtp — save SMTP settings to Firestore `settings/smtp`.
 * A blank/omitted password keeps the currently stored one.
 */
export async function POST(req: Request) {
  const uid = await requireAdmin(req);
  if (isResponse(uid)) return uid;
  const {getAdminDb} = await admin();
  const db = getAdminDb();
  if (!db) return NextResponse.json({error: 'Server credentials missing.'}, {status: 503});

  try {
    const body = (await req.json()) as Record<string, unknown>;
    const patch: Record<string, unknown> = {updatedAt: new Date().toISOString()};
    if (typeof body.host === 'string') patch.host = body.host.trim();
    if (body.port !== undefined && body.port !== null && body.port !== '' && !Number.isNaN(Number(body.port))) {
      patch.port = Number(body.port);
    }
    if (typeof body.user === 'string') patch.user = body.user.trim();
    if (typeof body.pass === 'string' && body.pass !== '') patch.pass = body.pass;
    if (typeof body.from === 'string') patch.from = body.from.trim();
    if (typeof body.adminEmail === 'string') patch.adminEmail = body.adminEmail.trim();

    await db.collection('settings').doc('smtp').set(patch, {merge: true});
    invalidateSmtpCache();
    return NextResponse.json({ok: true});
  } catch (err) {
    return NextResponse.json(
      {error: err instanceof Error ? err.message : 'Failed to save SMTP settings.'},
      {status: 500}
    );
  }
}
