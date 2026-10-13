import {NextResponse} from 'next/server';
import {randomBytes} from 'crypto';
import {requireOrganizer, isResponse} from '@/lib/admin-auth';
import {admin} from '@/lib/server-admin';
import {notifyUsers} from '@/lib/notifications';
import {sendFollowedOrganizerEventEmail} from '@/lib/email';
import {formatEventDate} from '@/lib/timezone';

export const runtime = 'nodejs';

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);

interface EventBody {
  title?: string;
  category?: string;
  city?: string;
  state?: string;
  mode?: string;
  virtualLink?: string;
  venue?: string;
  date?: string;
  image?: string;
  description?: string;
  summary?: string;
  policies?: string;
  price?: number | string;
  inventory?: number | string;
  tags?: string[];
  tiers?: {name?: string; price?: number; refundable?: boolean}[];
  /** Last day of a multi-day event (Lagos wall-clock). Empty = single day. */
  endDate?: string;
  /** 'refundable' | 'non_refundable' — chosen before sales open. */
  refundPolicy?: string;
  /** Hours before the start when cancellation closes (refundable only). */
  refundCutoffHours?: number | string;
  /** 'internal' = sell on IsabiEvents, 'external' = link out to ticketUrl. */
  ticketMode?: string;
  /** Original registration URL for external-ticketed events. */
  ticketUrl?: string;
}

/**
 * Validates the ticketing destination chosen by the organizer. Internal
 * events need nothing; external events must provide a real http(s) link to
 * the original listing (Luma / Eventbrite / Meetup / their own website).
 */
function sanitizeTicketing(body: EventBody): {error?: string; ticketMode: 'internal' | 'external'; ticketUrl: string} {
  const mode = body.ticketMode === 'external' ? 'external' : 'internal';
  if (mode === 'internal') return {ticketMode: 'internal', ticketUrl: ''};
  const url = String(body.ticketUrl || '').trim().slice(0, 500);
  if (!/^https?:\/\/[^\s/]+\.[^\s]+/i.test(url)) {
    return {
      error: 'Add the full link (https://…) to your event page on Luma, Eventbrite, Meetup or your own website.',
      ticketMode: 'external',
      ticketUrl: '',
    };
  }
  return {ticketMode: 'external', ticketUrl: url};
}

/** Sanitizes organizer-defined ticket types (name + price + refund override). */
function sanitizeTiers(input: unknown): {name: string; price: number; refundable?: boolean}[] {
  if (!Array.isArray(input)) return [];
  return input
    .slice(0, 12)
    .map((raw) => {
      const row = (raw || {}) as {name?: unknown; price?: unknown; refundable?: unknown};
      const name = String(row.name ?? '').trim().slice(0, 60);
      const price = Number(row.price);
      if (!name || !Number.isFinite(price) || price < 0) return null;
      return {
        name,
        price: Math.round(price),
        // Tri-state: undefined = follow the event-level policy.
        ...(typeof row.refundable === 'boolean' ? {refundable: row.refundable} : {}),
      };
    })
    .filter((r): r is {name: string; price: number; refundable?: boolean} => r !== null);
}

/**
 * Validates the optional multi-day end date (Lagos wall-clock). The last day
 * is stored as ending at 23:59; an empty value keeps the historical
 * single-day behaviour where the event "ends" at its start time.
 */
function sanitizeEndDate(raw: unknown, startDate: string): {error?: string; endDate: string} {
  const value = String(raw || '').trim();
  if (!value) return {endDate: ''};
  const day = value.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return {error: 'End date must be a valid date.', endDate: ''};
  const startDay = (startDate || '').slice(0, 10);
  if (startDay && day < startDay) {
    return {error: 'The end date cannot be before the start date.', endDate: ''};
  }
  if (day === startDay) return {endDate: startDate}; // same day → identical to before
  return {endDate: `${day}T23:59:00`};
}

/** Validates the organizer's refund policy (cutoff only applies when refundable). */
function sanitizeRefundPolicy(
  raw: unknown,
  cutoffRaw: unknown
): {refundPolicy: 'refundable' | 'non_refundable'; refundCutoffHours: number} {
  const refundPolicy = raw === 'refundable' ? 'refundable' : 'non_refundable';
  const hours = Math.max(0, Math.min(8760, Math.round(Number(cutoffRaw) || 0)));
  return {refundPolicy, refundCutoffHours: refundPolicy === 'refundable' ? hours : 0};
}

/**
 * POST /api/events — create an event (organizer/admin).
 * PATCH /api/events — edit an event (owner or admin).
 * Events are server-written because Firestore rules keep `events` read-only
 * for clients.
 */
export async function POST(req: Request) {
  const uid = await requireOrganizer(req);
  if (isResponse(uid)) return uid;
  const {getAdminDb} = await admin();
  const db = getAdminDb();
  if (!db) return NextResponse.json({error: 'Server credentials missing.'}, {status: 503});

  try {
    const body = (await req.json()) as EventBody;
    const title = (body.title || '').trim();
    const venue = (body.venue || '').trim();
    const date = (body.date || '').trim();
    const isVirtual = (body.mode || 'physical') === 'virtual';
    if (!title || !date || (!isVirtual && !venue)) {
      return NextResponse.json({error: isVirtual ? 'Title and date are required.' : 'Title, venue and date are required.'}, {status: 400});
    }
    // Ticketing destination: sell on IsabiEvents vs. link out to the
    // organizer's existing listing (Luma / Eventbrite / Meetup / own site).
    const ticketing = sanitizeTicketing(body);
    if (ticketing.error) return NextResponse.json({error: ticketing.error}, {status: 400});
    // Multi-day end date + refund policy are both chosen BEFORE sales open.
    const endDateResult = sanitizeEndDate(body.endDate, date);
    if (endDateResult.error) return NextResponse.json({error: endDateResult.error}, {status: 400});
    const refund = sanitizeRefundPolicy(body.refundPolicy, body.refundCutoffHours);

    const profileSnap = await db.collection('users').doc(uid).get();
    const profile = (profileSnap.exists ? profileSnap.data() : {}) as {
      name?: string;
      email?: string;
      role?: string;
      verified?: boolean;
    };

    const slug = `${slugify(title)}-${randomBytes(2).toString('hex')}`;
    const tiers = sanitizeTiers(body.tiers);
    const tierPrices = tiers.map((t) => t.price);
    const price = tierPrices.length
      ? Math.min(...tierPrices)
      : Number(body.price) || 0;
    const priceMax = tierPrices.length ? Math.max(...tierPrices) : price;
    const ref = db.collection('events').doc();
    const nowIso = new Date().toISOString();
    const doc = {
      slug,
      title,
      category: body.category || 'community',
      city: (body.city || '').trim() || 'Nigeria',
      state: (body.state || '').trim(),
      mode: (body.mode || 'physical').trim(),
      virtualLink: (body.virtualLink || '').trim(),
      venue,
      date,
      endDate: endDateResult.endDate,
      refundPolicy: refund.refundPolicy,
      refundCutoffHours: refund.refundCutoffHours,
      organizer: {
        name: profile.name || 'Organizer',
        // New events go LIVE immediately. Moderation remains available on the
        // admin side (Approve/Reject) — reject hides, approve restores.
        verified: true,
        avatar: '',
      },
      organizerUid: uid,
      organizerEmail: profile.email || '',
      image:
        (body.image || '').trim() ||
        `https://placehold.co/800x600?text=${encodeURIComponent(title)}`,
      description: (body.description || '').trim() || (body.summary || '').trim(),
      summary: (body.summary || '').trim(),
      policies: (body.policies || '').trim(),
      price: {min: price, max: priceMax},
      ...(tiers.length ? {tiers} : {}),
      ticketMode: ticketing.ticketMode,
      ticketUrl: ticketing.ticketUrl,
      inventory: Number(body.inventory) || 0,
      tags: Array.isArray(body.tags) ? body.tags : [],
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    await ref.set(doc);

    // Host-following fan-out: everyone following this organizer gets a
    // dashboard notification and (unless they turned Email Notifications off)
    // an email about the new event. Fire-and-forget — a failure here never
    // breaks event creation.
    try {
      const followsSnap = await db
        .collection('follows')
        .where('organizerUid', '==', uid)
        .limit(500)
        .get();
      if (!followsSnap.empty) {
        const followerIds = followsSnap.docs
          .map((d) => (d.data() as {userId?: string}).userId || '')
          .filter(Boolean);
        const base = (process.env.APP_BASE_URL || 'https://events.isabi.cloud').replace(/\/+$/, '');
        const eventUrl = `${base}/events/${slug}`;
        const when = formatEventDate(date);
        const where = [venue, (body.city || '').trim()].filter(Boolean).join(', ');
        const organizerName = profile.name || 'The organizer';

        await notifyUsers(followerIds, {
          title: 'New event from an organizer you follow',
          body: `${organizerName} just published "${title}".`,
          type: 'primary',
          href: `/events/${slug}`,
        });

        const followerRefs = followerIds.map((id) => db.collection('users').doc(id));
        const followerDocs = followerRefs.length ? await db.getAll(...followerRefs) : [];
        for (const snap of followerDocs) {
          if (!snap.exists) continue;
          const u = snap.data() as {email?: string; name?: string; notifications?: {email?: boolean}};
          if (!u.email || u.notifications?.email === false) continue;
          sendFollowedOrganizerEventEmail({
            to: u.email,
            name: u.name || '',
            organizerName,
            eventTitle: title,
            eventUrl,
            when,
            where,
          }).catch(() => undefined);
        }
      }
    } catch (err) {
      console.warn('[events] follower fan-out failed:', err);
    }

    return NextResponse.json({ok: true, id: ref.id, slug});
  } catch (err) {
    return NextResponse.json(
      {error: err instanceof Error ? err.message : 'Failed to create event.'},
      {status: 500}
    );
  }
}

export async function PATCH(req: Request) {
  const uid = await requireOrganizer(req);
  if (isResponse(uid)) return uid;
  const {getAdminDb} = await admin();
  const db = getAdminDb();
  if (!db) return NextResponse.json({error: 'Server credentials missing.'}, {status: 503});

  try {
    const body = (await req.json()) as EventBody & {id?: string};
    const id = (body.id || '').trim();
    if (!id) return NextResponse.json({error: 'Event id is required.'}, {status: 400});

    const ref = db.collection('events').doc(id);
    const snap = await ref.get();
    if (!snap.exists) return NextResponse.json({error: 'Event not found.'}, {status: 404});

    const existing = snap.data() as {
      organizerUid?: string;
      organizerEmail?: string;
      date?: string;
      refundPolicy?: 'refundable' | 'non_refundable';
      refundCutoffHours?: number;
    };
    const caller = await db.collection('users').doc(uid).get();
    const callerRole = caller.exists ? (caller.data() as {role?: string}).role : '';
    if (callerRole !== 'admin' && existing.organizerUid !== uid) {
      return NextResponse.json({error: 'You can only edit your own events.'}, {status: 403});
    }

    const patch: Record<string, unknown> = {updatedAt: new Date().toISOString()};
    if (body.title) patch.title = String(body.title).trim();
    if (body.category) patch.category = body.category;
    if (body.city !== undefined) patch.city = String(body.city).trim() || 'Nigeria';
    if (body.state !== undefined) patch.state = String(body.state).trim();
    if (body.mode !== undefined) patch.mode = String(body.mode).trim();
    if (body.virtualLink !== undefined) patch.virtualLink = String(body.virtualLink).trim();
    if (body.venue) patch.venue = String(body.venue).trim();
    if (body.date) patch.date = body.date;
    if (body.image !== undefined) patch.image = body.image;
    if (body.description !== undefined) patch.description = body.description;
    if (body.summary !== undefined) patch.summary = body.summary;
    if (body.policies !== undefined) patch.policies = body.policies;
    if (body.price !== undefined) {
      const price = Number(body.price) || 0;
      patch.price = {min: price, max: price};
    }
    if (body.tiers !== undefined) {
      const tiers = sanitizeTiers(body.tiers);
      patch.tiers = tiers;
      if (tiers.length) {
        const prices = tiers.map((t) => t.price);
        patch.price = {min: Math.min(...prices), max: Math.max(...prices)};
      }
    }
    if (body.inventory !== undefined) patch.inventory = Number(body.inventory) || 0;
    if (Array.isArray(body.tags)) patch.tags = body.tags;
    if (body.ticketMode !== undefined) {
      const ticketing = sanitizeTicketing(body);
      if (ticketing.error) return NextResponse.json({error: ticketing.error}, {status: 400});
      patch.ticketMode = ticketing.ticketMode;
      patch.ticketUrl = ticketing.ticketUrl;
    }
    if (body.endDate !== undefined) {
      const endDateResult = sanitizeEndDate(body.endDate, String(body.date || existing.date || ''));
      if (endDateResult.error) return NextResponse.json({error: endDateResult.error}, {status: 400});
      patch.endDate = endDateResult.endDate;
    }

    // Refund policy edits: NEVER allowed to remove eligibility that was
    // already sold. Every ticket carries an immutable snapshot taken at
    // purchase; this guard enforces the same rule on the event settings so an
    // organizer cannot retroactively make sold refundable tickets worthless.
    if (body.refundPolicy !== undefined || body.refundCutoffHours !== undefined || body.tiers !== undefined) {
      const refund = sanitizeRefundPolicy(
        body.refundPolicy !== undefined ? body.refundPolicy : existing.refundPolicy,
        body.refundCutoffHours !== undefined ? body.refundCutoffHours : existing.refundCutoffHours
      );

      const soldSnap = await db.collection('tickets').where('eventId', '==', id).limit(500).get();
      if (!soldSnap.empty) {
        const sold = soldSnap.docs.map((d) => d.data() as {refundable?: boolean; tierName?: string});
        const soldRefundableTiers = new Set(
          sold.filter((t) => t.refundable && t.tierName).map((t) => String(t.tierName))
        );
        const anySoldRefundable = sold.some((t) => t.refundable === true);

        if (anySoldRefundable && refund.refundPolicy !== 'refundable') {
          return NextResponse.json(
            {
              error:
                'Refundable tickets have already been sold for this event — their refund eligibility cannot be removed. You can keep the event refundable, or stop offering refunds only for ticket types that have not sold yet.',
            },
            {status: 400}
          );
        }
        if (body.tiers !== undefined) {
          for (const t of sanitizeTiers(body.tiers)) {
            if (soldRefundableTiers.has(t.name) && t.refundable === false) {
              return NextResponse.json(
                {error: `"${t.name}" tickets have already been sold as refundable — that eligibility cannot be removed.`},
                {status: 400}
              );
            }
          }
        }
      }
      patch.refundPolicy = refund.refundPolicy;
      patch.refundCutoffHours = refund.refundCutoffHours;
    }

    await ref.update(patch);
    return NextResponse.json({ok: true, id});
  } catch (err) {
    return NextResponse.json(
      {error: err instanceof Error ? err.message : 'Failed to update event.'},
      {status: 500}
    );
  }
}

/** DELETE /api/events — cancel/unlist an event (owner or admin). */
export async function DELETE(req: Request) {
  const uid = await requireOrganizer(req);
  if (isResponse(uid)) return uid;
  const {getAdminDb} = await admin();
  const db = getAdminDb();
  if (!db) return NextResponse.json({error: 'Server credentials missing.'}, {status: 503});

  try {
    const body = (await req.json()) as {id?: string};
    const id = (body.id || '').trim();
    if (!id) return NextResponse.json({error: 'Event id is required.'}, {status: 400});

    const ref = db.collection('events').doc(id);
    const snap = await ref.get();
    if (!snap.exists) return NextResponse.json({error: 'Event not found.'}, {status: 404});

    const existing = snap.data() as {organizerUid?: string};
    const caller = await db.collection('users').doc(uid).get();
    const callerRole = caller.exists ? (caller.data() as {role?: string}).role : '';
    if (callerRole !== 'admin' && existing.organizerUid !== uid) {
      return NextResponse.json({error: 'You can only cancel your own events.'}, {status: 403});
    }

    await ref.delete();
    return NextResponse.json({ok: true, id});
  } catch (err) {
    return NextResponse.json(
      {error: err instanceof Error ? err.message : 'Failed to cancel event.'},
      {status: 500}
    );
  }
}
