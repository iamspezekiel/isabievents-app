import {NextResponse} from 'next/server';
import {requireOrganizer, isResponse} from '@/lib/admin-auth';
import {sendTeamInviteEmail} from '@/lib/email';

export const runtime = 'nodejs';

/**
 * POST /api/team/invite — send an email invite to a prospective vendor/staff
 * member so they can create their account and join the organizer's team.
 * body: { email, name?, role, organizerName }
 */
export async function POST(req: Request) {
  const uid = await requireOrganizer(req);
  if (isResponse(uid)) return uid;

  try {
    const body = (await req.json()) as {email?: string; name?: string; role?: string; organizerName?: string};
    const email = (body.email || '').trim().toLowerCase();
    const role = body.role === 'staff' ? 'staff' : 'vendor';
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return NextResponse.json({error: 'A valid email is required.'}, {status: 400});
    }
    const organizerName = (body.organizerName || 'An organizer').trim();
    const base = process.env.APP_BASE_URL || 'https://events.isabi.cloud';
    const inviteUrl = `${base}/signup?inviteEmail=${encodeURIComponent(email)}&role=${role}&org=${encodeURIComponent(organizerName)}`;

    const ok = await sendTeamInviteEmail({
      to: email,
      inviteeName: (body.name || '').trim(),
      organizerName,
      role,
      inviteUrl,
    });

    return NextResponse.json({ok, inviteUrl, delivered: ok});
  } catch (err) {
    return NextResponse.json(
      {error: err instanceof Error ? err.message : 'Could not send invite.'},
      {status: 500}
    );
  }
}
