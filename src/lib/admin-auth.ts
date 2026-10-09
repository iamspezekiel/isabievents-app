/**
 * Firebase ID-token verification for admin/operator API routes (server-only).
 *
 * The client sends `Authorization: Bearer <Firebase ID token>` (obtained from
 * `auth.currentUser.getIdToken()`); the Admin SDK verifies it and the caller's
 * role is read from the users/{uid} profile doc.
 *
 * firebase-admin is loaded lazily — a static SDK import crashes Vercel
 * serverless functions at cold start (empty 500 from the platform).
 */
import {NextResponse} from 'next/server';

async function decodedUid(req: Request): Promise<string | null> {
  const header = req.headers.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : null;
  if (!token) return null;
  try {
    const {getAdminAuth} = await import('@/lib/firebase-admin');
    const auth = getAdminAuth();
    if (!auth) return null;
    const decoded = await auth.verifyIdToken(token);
    return decoded.uid;
  } catch {
    return null;
  }
}

/** Caller role from Firestore, or null when the profile is missing. */
async function callerRole(uid: string): Promise<string | null> {
  try {
    const {getAdminDb} = await import('@/lib/firebase-admin');
    const db = getAdminDb();
    if (!db) return null;
    const snap = await db.collection('users').doc(uid).get();
    return snap.exists ? ((snap.data() as {role?: string}).role ?? null) : null;
  } catch {
    return null;
  }
}

export const isResponse = (v: string | NextResponse): v is NextResponse => v instanceof NextResponse;

/** Any signed-in user. Returns the uid or a 401 response. */
export async function requireAuth(req: Request): Promise<string | NextResponse> {
  const uid = await decodedUid(req);
  if (!uid) return NextResponse.json({error: 'Unauthorized.'}, {status: 401});
  return uid;
}

/** Signed-in admin only. Returns the uid or an error response. */
export async function requireAdmin(req: Request): Promise<string | NextResponse> {
  const uid = await decodedUid(req);
  if (!uid) return NextResponse.json({error: 'Unauthorized.'}, {status: 401});
  const role = await callerRole(uid);
  if (role !== 'admin') return NextResponse.json({error: 'Admin access required.'}, {status: 403});
  return uid;
}

/** Signed-in gate/operator roles (staff, vendor, organizer, admin). */
export async function requireOperator(req: Request): Promise<string | NextResponse> {
  const uid = await decodedUid(req);
  if (!uid) return NextResponse.json({error: 'Unauthorized.'}, {status: 401});
  const role = await callerRole(uid);
  if (!role || !['staff', 'vendor', 'organizer', 'admin'].includes(role)) {
    return NextResponse.json({error: 'Operator access required.'}, {status: 403});
  }
  return uid;
}

/** Signed-in organizers or admins only (event creation/moderation). */
export async function requireOrganizer(req: Request): Promise<string | NextResponse> {
  const uid = await decodedUid(req);
  if (!uid) return NextResponse.json({error: 'Unauthorized.'}, {status: 401});
  const role = await callerRole(uid);
  if (role !== 'organizer' && role !== 'admin') {
    return NextResponse.json({error: 'Organizer access required.'}, {status: 403});
  }
  return uid;
}
