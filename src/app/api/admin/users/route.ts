import {NextResponse} from 'next/server';
import {randomBytes} from 'crypto';
import {requireAdmin, isResponse} from '@/lib/admin-auth';
import {admin} from '@/lib/server-admin';

export const runtime = 'nodejs';

interface UserRow {
  uid: string;
  name: string;
  email: string;
  role: string;
  whatsapp?: string;
  createdAt?: string;
  disabled?: boolean;
}

/** GET /api/admin/users — every profile doc (admin console user directory). */
export async function GET(req: Request) {
  const uid = await requireAdmin(req);
  if (isResponse(uid)) return uid;
  const {getAdminDb, getAdminAuth} = await admin();
  const db = getAdminDb();
  const auth = getAdminAuth();
  if (!db) return NextResponse.json({error: 'Server credentials missing.'}, {status: 503});

  try {
    const snap = await db.collection('users').get();

    // Merge live Firebase Auth state (disabled flag) for real status columns.
    const authState = new Map<string, boolean>();
    if (auth) {
      try {
        let pageToken: string | undefined;
        do {
          const res = await auth.listUsers(1000, pageToken);
          for (const u of res.users) authState.set(u.uid, !!u.disabled);
          pageToken = res.pageToken;
        } while (pageToken);
      } catch (err) {
        console.warn('[admin/users] listUsers failed:', err);
      }
    }

    const users: UserRow[] = snap.docs.map((d) => {
      const data = d.data() as Omit<UserRow, 'uid'>;
      return {
        uid: d.id,
        name: data.name || '',
        email: data.email || '',
        role: data.role || 'attendee',
        whatsapp: data.whatsapp,
        createdAt: data.createdAt,
        disabled: authState.get(d.id) ?? false,
      };
    });
    users.sort((a, b) => a.name.localeCompare(b.name));
    return NextResponse.json({users});
  } catch (err) {
    return NextResponse.json(
      {error: err instanceof Error ? err.message : 'Failed to load users.'},
      {status: 500}
    );
  }
}

/** POST /api/admin/users — create a new admin account (returns a temp password). */
export async function POST(req: Request) {
  const uid = await requireAdmin(req);
  if (isResponse(uid)) return uid;
  const {getAdminAuth, getAdminDb} = await admin();
  const auth = getAdminAuth();
  const db = getAdminDb();
  if (!auth || !db) return NextResponse.json({error: 'Server credentials missing.'}, {status: 503});

  try {
    const body = (await req.json()) as {name?: string; email?: string};
    const name = (body.name || '').trim();
    const email = (body.email || '').trim().toLowerCase();
    if (!name || !email) {
      return NextResponse.json({error: 'Name and email are required.'}, {status: 400});
    }

    const tempPassword = randomBytes(9).toString('base64url') + 'A1';
    const created = await auth.createUser({email, password: tempPassword, displayName: name});
    await db
      .collection('users')
      .doc(created.uid)
      .set({name, email, role: 'admin', whatsapp: '', createdAt: new Date().toISOString()}, {merge: true});

    return NextResponse.json({uid: created.uid, email, tempPassword});
  } catch (err) {
    const code = (err as {code?: string}).code || '';
    const message =
      code === 'auth/email-already-exists'
        ? 'An account with this email already exists.'
        : err instanceof Error
          ? err.message
          : 'Failed to create admin.';
    return NextResponse.json({error: message}, {status: 400});
  }
}

/**
 * PATCH /api/admin/users — activate/deactivate (disable) a user in Firebase Auth.
 * Body: {uid: string, disabled: boolean}
 */
export async function PATCH(req: Request) {
  const callerUid = await requireAdmin(req);
  if (isResponse(callerUid)) return callerUid;
  const {getAdminAuth} = await admin();
  const auth = getAdminAuth();
  if (!auth) return NextResponse.json({error: 'Server credentials missing.'}, {status: 503});

  try {
    const body = (await req.json()) as {uid?: string; disabled?: boolean};
    const targetUid = (body.uid || '').trim();
    if (!targetUid || typeof body.disabled !== 'boolean') {
      return NextResponse.json({error: 'uid and disabled are required.'}, {status: 400});
    }
    if (targetUid === callerUid) {
      return NextResponse.json({error: 'You cannot deactivate your own account.'}, {status: 400});
    }
    await auth.updateUser(targetUid, {disabled: body.disabled});
    return NextResponse.json({ok: true, uid: targetUid, disabled: body.disabled});
  } catch (err) {
    const code = (err as {code?: string}).code || '';
    const message =
      code === 'auth/user-not-found'
        ? 'That account no longer exists in Firebase Auth.'
        : err instanceof Error
          ? err.message
          : 'Failed to update account.';
    return NextResponse.json({error: message}, {status: 400});
  }
}

/**
 * DELETE /api/admin/users — delete a user's account (Firebase Auth + profile).
 * Body: {uid: string}. Admins cannot delete themselves from the directory.
 */
export async function DELETE(req: Request) {
  const callerUid = await requireAdmin(req);
  if (isResponse(callerUid)) return callerUid;
  const {getAdminAuth, getAdminDb} = await admin();
  const auth = getAdminAuth();
  const db = getAdminDb();
  if (!auth || !db) return NextResponse.json({error: 'Server credentials missing.'}, {status: 503});

  try {
    const body = (await req.json()) as {uid?: string};
    const targetUid = (body.uid || '').trim();
    if (!targetUid) return NextResponse.json({error: 'uid is required.'}, {status: 400});
    if (targetUid === callerUid) {
      return NextResponse.json({error: 'You cannot delete your own account here.'}, {status: 400});
    }

    // Delete the Firebase Auth user (ignore if already gone).
    try {
      await auth.deleteUser(targetUid);
    } catch (err) {
      if ((err as {code?: string}).code !== 'auth/user-not-found') throw err;
    }
    // Delete the Firestore profile doc (tickets/orders are kept for records).
    await db.collection('users').doc(targetUid).delete();

    return NextResponse.json({ok: true, uid: targetUid});
  } catch (err) {
    return NextResponse.json(
      {error: err instanceof Error ? err.message : 'Failed to delete account.'},
      {status: 500}
    );
  }
}
