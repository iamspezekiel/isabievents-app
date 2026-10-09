import {NextResponse} from 'next/server';
import {requireAdmin, isResponse} from '@/lib/admin-auth';
import {admin} from '@/lib/server-admin';

export const runtime = 'nodejs';

const DEFAULTS = {
  fullName: 'Admin Master',
  city: 'Abuja',
  platformFee: 2.5,
  requireKyc: true,
  autoSettlements: true,
  gatewayBachs: true,
  gatewayCrypto: true,
  maintenance: false,
};

const BOOL_KEYS = ['requireKyc', 'autoSettlements', 'gatewayBachs', 'gatewayCrypto', 'maintenance'] as const;

/** GET /api/admin/settings — platform configuration (admin). */
export async function GET(req: Request) {
  const uid = await requireAdmin(req);
  if (isResponse(uid)) return uid;
  const {getAdminDb} = await admin();
  const db = getAdminDb();
  if (!db) return NextResponse.json({error: 'Server credentials missing.'}, {status: 503});

  try {
    const snap = await db.collection('settings').doc('app').get();
    const settings = snap.exists ? {...DEFAULTS, ...(snap.data() as Record<string, unknown>)} : DEFAULTS;
    return NextResponse.json({settings});
  } catch (err) {
    return NextResponse.json(
      {error: err instanceof Error ? err.message : 'Failed to load settings.'},
      {status: 500}
    );
  }
}

/** POST /api/admin/settings — persist platform configuration (admin). */
export async function POST(req: Request) {
  const uid = await requireAdmin(req);
  if (isResponse(uid)) return uid;
  const {getAdminDb} = await admin();
  const db = getAdminDb();
  if (!db) return NextResponse.json({error: 'Server credentials missing.'}, {status: 503});

  try {
    const body = (await req.json()) as Record<string, unknown>;
    const patch: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
      updatedBy: uid,
    };
    if (typeof body.fullName === 'string') patch.fullName = body.fullName.trim() || DEFAULTS.fullName;
    if (typeof body.city === 'string' && body.city) patch.city = body.city;
    if (body.platformFee !== undefined && body.platformFee !== null && body.platformFee !== '' && !Number.isNaN(Number(body.platformFee))) {
      patch.platformFee = Number(body.platformFee);
    }
    for (const key of BOOL_KEYS) {
      if (typeof body[key] === 'boolean') patch[key] = body[key];
    }

    await db.collection('settings').doc('app').set(patch, {merge: true});
    return NextResponse.json({ok: true});
  } catch (err) {
    return NextResponse.json(
      {error: err instanceof Error ? err.message : 'Failed to save settings.'},
      {status: 500}
    );
  }
}