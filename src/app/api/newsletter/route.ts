import {NextResponse} from 'next/server';
import {requireAdmin, isResponse} from '@/lib/admin-auth';
import {admin} from '@/lib/server-admin';
import {sendNewsletterEmail} from '@/lib/email';

export const runtime = 'nodejs';

const AUDIENCE_LABELS: Record<string, string> = {
  all: 'All Users',
  attendees: 'Attendees',
  organizers: 'Organizers',
  staff: 'Staff & Vendors',
};

/** GET /api/newsletter — campaign history + audience reach (admin). */
export async function GET(req: Request) {
  const uid = await requireAdmin(req);
  if (isResponse(uid)) return uid;
  const {getAdminDb} = await admin();
  const db = getAdminDb();
  if (!db) return NextResponse.json({error: 'Server credentials missing.'}, {status: 503});

  try {
    const [campaignSnap, usersSnap, subsSnap] = await Promise.all([
      db.collection('newsletters').orderBy('sentAt', 'desc').limit(25).get(),
      db.collection('users').get(),
      db.collection('subscribers').get(),
    ]);
    const campaigns = campaignSnap.docs.map((d) => {
      const x = d.data() as {subject?: string; audience?: string; sentDate?: string; sentAt?: string; recipients?: number};
      return {
        id: d.id,
        subject: x.subject || '',
        audience: AUDIENCE_LABELS[x.audience || ''] || x.audience || 'All Users',
        sentDate: (x.sentDate || x.sentAt || '').slice(0, 10),
        recipients: x.recipients || 0,
      };
    });
    return NextResponse.json({
      campaigns,
      reach: {users: usersSnap.size, subscribers: subsSnap.size},
    });
  } catch (err) {
    return NextResponse.json(
      {error: err instanceof Error ? err.message : 'Failed to load campaigns.'},
      {status: 500}
    );
  }
}

/** POST /api/newsletter — send a real campaign to the selected audience (admin). */
export async function POST(req: Request) {
  const uid = await requireAdmin(req);
  if (isResponse(uid)) return uid;
  const {getAdminDb} = await admin();
  const db = getAdminDb();
  if (!db) return NextResponse.json({error: 'Server credentials missing.'}, {status: 503});

  try {
    const body = (await req.json()) as {subject?: string; content?: string; audience?: string};
    const subject = (body.subject || '').trim();
    const content = (body.content || '').trim();
    const audience = body.audience || 'all';
    if (!subject || !content) {
      return NextResponse.json({error: 'A subject and content are required.'}, {status: 400});
    }

    // Build the recipient list: users (role-filtered) + subscribers for "all".
    const recipients = new Set<string>();
    const usersSnap = await db.collection('users').get();
    for (const doc of usersSnap.docs) {
      const u = doc.data() as {email?: string; role?: string};
      if (!u.email) continue;
      const include =
        audience === 'all' ||
        (audience === 'attendees' && u.role === 'attendee') ||
        (audience === 'organizers' && u.role === 'organizer') ||
        (audience === 'staff' && (u.role === 'staff' || u.role === 'vendor'));
      if (include) recipients.add(u.email.toLowerCase());
    }
    if (audience === 'all') {
      const subsSnap = await db.collection('subscribers').get();
      for (const doc of subsSnap.docs) {
        const s = doc.data() as {email?: string};
        if (s.email) recipients.add(s.email.toLowerCase());
      }
    }

    const targets = Array.from(recipients).slice(0, 500);
    let sent = 0;
    for (let i = 0; i < targets.length; i += 10) {
      const batch = targets.slice(i, i + 10);
      const results = await Promise.all(batch.map((to) => sendNewsletterEmail(to, subject, content)));
      sent += results.filter(Boolean).length;
    }

    const sentAt = new Date().toISOString();
    const ref = db.collection('newsletters').doc();
    const campaign = {
      subject,
      content,
      audience,
      recipients: sent,
      total: targets.length,
      sentDate: sentAt.slice(0, 10),
      sentAt,
      sentBy: uid,
    };
    await ref.set(campaign);

    if (targets.length === 0) {
      return NextResponse.json({
        ok: true,
        campaign: {id: ref.id, subject, audience: AUDIENCE_LABELS[audience] || audience, sentDate: campaign.sentDate, recipients: 0},
        warning: 'No recipients matched that audience.',
      });
    }

    return NextResponse.json({
      ok: true,
      campaign: {id: ref.id, subject, audience: AUDIENCE_LABELS[audience] || audience, sentDate: campaign.sentDate, recipients: sent},
    });
  } catch (err) {
    return NextResponse.json(
      {error: err instanceof Error ? err.message : 'Campaign failed.'},
      {status: 500}
    );
  }
}

/** DELETE /api/newsletter — remove a campaign record (admin). */
export async function DELETE(req: Request) {
  const uid = await requireAdmin(req);
  if (isResponse(uid)) return uid;
  const {getAdminDb} = await admin();
  const db = getAdminDb();
  if (!db) return NextResponse.json({error: 'Server credentials missing.'}, {status: 503});

  try {
    const body = (await req.json()) as {id?: string};
    const id = (body.id || '').trim();
    if (!id) return NextResponse.json({error: 'Campaign id is required.'}, {status: 400});
    await db.collection('newsletters').doc(id).delete();
    return NextResponse.json({ok: true});
  } catch (err) {
    return NextResponse.json(
      {error: err instanceof Error ? err.message : 'Delete failed.'},
      {status: 500}
    );
  }
}