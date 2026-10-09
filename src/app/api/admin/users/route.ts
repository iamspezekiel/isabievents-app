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
}

/** GET /api/admin/users — every profile doc (admin console user directory). */
export async function GET(req: Request) {
  const uid = await requireAdmin(req);
  if (isResponse(uid)) return uid;
  const {getAdminDb} = await admin();
  const db = getAdminDb();
  if (!db) return NextResponse.json({error: 'Server credentials missing.'}, {status: 503});

  try {
    const snap = await db.collection('users').get();
    const users: UserRow[] = snap.docs.map((d) => {
      const data = d.data() as Omit<UserRow, 'uid'>;
      return {uid: d.id, name: data.name || '', email: data.email || '', role: data.role || 'attendee', whatsapp: data.whatsapp, createdAt: data.createdAt};
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
