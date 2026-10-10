import {NextResponse} from 'next/server';
import {randomBytes} from 'crypto';
import {requireOrganizer, isResponse} from '@/lib/admin-auth';
import {admin} from '@/lib/server-admin';

export const runtime = 'nodejs';

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);

interface EventBody {
  title?: string;
  category?: string;
  city?: string;
  venue?: string;
  date?: string;
  image?: string;
  description?: string;
  summary?: string;
  policies?: string;
  price?: number | string;
  inventory?: number | string;
  tags?: string[];
  tiers?: {name?: string; price?: number}[];
}

/** Sanitizes organizer-defined ticket types (name + price) from the client. */
function sanitizeTiers(input: unknown): {name: string; price: number}[] {
  if (!Array.isArray(input)) return [];
  return input
    .slice(0, 12)
    .map((raw) => {
      const row = (raw || {}) as {name?: unknown; price?: unknown};
      const name = String(row.name ?? '').trim().slice(0, 60);
      const price = Number(row.price);
      if (!name || !Number.isFinite(price) || price < 0) return null;
      return {name, price: Math.round(price)};
    })
    .filter((r): r is {name: string; price: number} => r !== null);
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
    if (!title || !venue || !date) {
      return NextResponse.json({error: 'Title, venue and date are required.'}, {status: 400});
    }

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
      venue,
      date,
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
      inventory: Number(body.inventory) || 0,
      tags: Array.isArray(body.tags) ? body.tags : [],
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    await ref.set(doc);
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

    const existing = snap.data() as {organizerUid?: string; organizerEmail?: string};
    const caller = await db.collection('users').doc(uid).get();
    const callerRole = caller.exists ? (caller.data() as {role?: string}).role : '';
    if (callerRole !== 'admin' && existing.organizerUid !== uid) {
      return NextResponse.json({error: 'You can only edit your own events.'}, {status: 403});
    }

    const patch: Record<string, unknown> = {updatedAt: new Date().toISOString()};
    if (body.title) patch.title = String(body.title).trim();
    if (body.category) patch.category = body.category;
    if (body.city !== undefined) patch.city = String(body.city).trim() || 'Nigeria';
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
