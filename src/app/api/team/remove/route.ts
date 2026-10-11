import {NextResponse} from 'next/server';
import {requireOrganizer, isResponse} from '@/lib/admin-auth';
import {admin} from '@/lib/server-admin';
import {createNotification} from '@/lib/notifications';

export const runtime = 'nodejs';

/**
 * POST /api/team/remove — remove a staff/vendor from the organizer's roster
 * AND demote their account role to `attendee`, so they lose dashboard access.
 * Their account and any tickets/orders are preserved.
 * body: { email }
 */
export async function POST(req: Request) {
  const uid = await requireOrganizer(req);
  if (isResponse(uid)) return uid;
  const {getAdminDb} = await admin();
  const db = getAdminDb();
  if (!db) return NextResponse.json({error: 'Server credentials missing.'}, {status: 503});

  try {
    const body = (await req.json()) as {email?: string};
    const email = (body.email || '').trim().toLowerCase();
    if (!email) return NextResponse.json({error: 'Email is required.'}, {status: 400});

    // Find the member's profile doc by email (single-field query).
    const snap = await db.collection('users').where('email', '==', email).limit(1).get();
    if (snap.empty) {
      // They may never have created an account (invite sent but not accepted).
      return NextResponse.json({ok: true, demoted: false});
    }

    const memberDoc = snap.docs[0];
    const profile = memberDoc.data() as {role?: string; name?: string};
    const role = profile.role || '';

    // Never touch admins or organizers — only demote staff/vendor accounts.
    if (role === 'staff' || role === 'vendor') {
      await memberDoc.ref.update({role: 'attendee', demotedAt: new Date().toISOString()});
      await createNotification({
        userId: memberDoc.id,
        title: 'Team access removed',
        body: 'You are no longer part of this organizer team. Your account is now a regular attendee account.',
        type: 'warning',
      });
      return NextResponse.json({ok: true, demoted: true, previousRole: role});
    }

    return NextResponse.json({ok: true, demoted: false, previousRole: role});
  } catch (err) {
    return NextResponse.json(
      {error: err instanceof Error ? err.message : 'Could not remove team member.'},
      {status: 500}
    );
  }
}
