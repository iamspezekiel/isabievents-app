import {NextResponse} from 'next/server';
import {requireAuth, isResponse} from '@/lib/admin-auth';
import {admin} from '@/lib/server-admin';

export const runtime = 'nodejs';

/**
 * POST /api/account/profile — save "Profile Information" + the Privacy &
 * Security notification toggles for ANY role (attendee, staff, vendor,
 * organizer, admin).
 *
 * Written through the Admin SDK (same pattern as /api/organizer/profile) so
 * the save always works regardless of client Firestore rules — notably for
 * staff/vendor accounts whose profile doc may not exist yet.
 *
 * Body (all fields optional, only provided keys are patched):
 *   {name?, whatsapp?, city?, role?, notifications?: {email?: boolean; marketing?: boolean}}
 *
 * `role` is ONLY honoured when the profile doc does not exist yet (signup
 * fallback for staff/vendor accounts the client rules block) and never
 * accepts `admin`, so this endpoint cannot be used to escalate privileges.
 */
export async function POST(req: Request) {
  const uid = await requireAuth(req);
  if (isResponse(uid)) return uid;
  const {getAdminDb, getAdminAuth} = await admin();
  const db = getAdminDb();
  if (!db) return NextResponse.json({error: 'Server credentials missing.'}, {status: 503});

  try {
    const body = (await req.json()) as {
      name?: unknown;
      whatsapp?: unknown;
      city?: unknown;
      role?: unknown;
      notifications?: unknown;
    };

    const ref = db.collection('users').doc(uid);
    const snap = await ref.get();
    const patch: Record<string, unknown> = {updatedAt: new Date().toISOString()};

    if (typeof body.name === 'string') {
      const name = body.name.trim().slice(0, 120);
      if (name) patch.name = name;
    }
    if (typeof body.whatsapp === 'string') patch.whatsapp = body.whatsapp.trim().slice(0, 40);
    if (typeof body.city === 'string') patch.city = body.city.trim().slice(0, 60);

    if (body.notifications && typeof body.notifications === 'object') {
      const n = body.notifications as {email?: unknown; marketing?: unknown};
      // Merge onto any existing toggles so flipping one switch never wipes
      // the other preference.
      const stored = snap.exists
        ? ((snap.data() as {notifications?: {email?: boolean; marketing?: boolean}}).notifications ?? {})
        : {};
      const current = {
        email: typeof n.email === 'boolean' ? n.email : (stored.email ?? true),
        marketing: typeof n.marketing === 'boolean' ? n.marketing : (stored.marketing ?? false),
      };
      patch.notifications = current;
    }

    if (!snap.exists) {
      // Staff/vendor accounts can be invited before their profile doc exists —
      // seed it from the verified ID token so the save still lands.
      const decoded = getAdminAuth() ? await getAdminAuth()!.verifyIdToken(uid).catch(() => null) : null;
      // Role is only applied at creation and never to an existing doc (and
      // never `admin`) — matching the intent of the Firestore rules.
      const requestedRole =
        typeof body.role === 'string' && ['attendee', 'organizer', 'staff', 'vendor'].includes(body.role)
          ? body.role
          : '';
      await ref.set(
        {
          email: decoded?.email || '',
          name: decoded?.name || '',
          ...(requestedRole ? {role: requestedRole} : {}),
          createdAt: new Date().toISOString(),
          ...patch,
        },
        {merge: true}
      );
    } else {
      await ref.set(patch, {merge: true});
    }

    const updated = (await ref.get()).data() || {};
    const notifs = (updated.notifications as {email?: boolean; marketing?: boolean} | undefined) ?? {};
    return NextResponse.json({
      ok: true,
      profile: {
        name: updated.name ?? '',
        whatsapp: updated.whatsapp ?? '',
        city: updated.city ?? '',
        notifications: {email: notifs.email ?? true, marketing: notifs.marketing ?? false},
      },
    });
  } catch (err) {
    return NextResponse.json(
      {error: err instanceof Error ? err.message : 'Could not save your changes.'},
      {status: 500}
    );
  }
}
