import {NextResponse} from 'next/server';
import {requireAuth, requireAdmin, isResponse} from '@/lib/admin-auth';
import {admin} from '@/lib/server-admin';
import {createNotification, notifyByEmail, notifyUsers, userIdsByRole} from '@/lib/notifications';
import {sendRefundStatusEmail} from '@/lib/email';
import {isBeforeDeadline, refundDeadlineFor} from '@/lib/timezone';
import {normalizeEmail} from '@/lib/emails';

export const runtime = 'nodejs';

/** Statuses that block a (second) cancellation request for a ticket. */
const ACTIVE_REFUND_STATUSES = ['requested', 'approved', 'completed'];

/** A refund document as returned by the API. */
type RefundRow = Record<string, unknown> & {id: string; requestedAt?: string; status?: string};

interface TicketRow {
  id: string;
  orderId?: string;
  eventId?: string;
  eventTitle?: string;
  holderName?: string;
  buyerEmail?: string;
  buyerUid?: string;
  status?: string;
  tierName?: string;
  refundable?: boolean;
  refundCutoffHours?: number;
  refundDeadline?: string;
  cancelledAt?: string;
  refundedAt?: string;
}

interface Eligibility {
  eligible: boolean;
  code?: string;
  error?: string;
  ticket?: TicketRow;
  deadline?: string;
  amount?: number;
  currency?: 'NGN' | 'USD';
  policy?: 'refundable' | 'non_refundable';
  reason?: string;
}

/**
 * Shared eligibility check — used for BOTH the preview (attendee sees why
 * they can/can't cancel) and the actual request, so they can never disagree.
 *
 * Rules (in order):
 *   1. the ticket must belong to the caller
 *   2. status must be 'active' (used / transferred / cancelled / refunded out)
 *   3. the ticket's OWN purchase-time snapshot must say refundable
 *   4. the Lagos-time refund deadline must not have passed
 *   5. no open/completed refund may already exist (duplicate prevention)
 */
async function checkEligibility(
  db: FirebaseFirestore.Firestore,
  ticketId: string,
  caller: {uid: string; email: string}
): Promise<Eligibility> {
  const ticketSnap = await db.collection('tickets').doc(ticketId).get();
  if (!ticketSnap.exists) return {eligible: false, code: 'not_found', error: 'Ticket not found.'};
  const ticket = {id: ticketSnap.id, ...(ticketSnap.data() as Omit<TicketRow, 'id'>)};

  const ownerEmail = String(ticket.buyerEmail || '').toLowerCase();
  const isOwner =
    (!!ticket.buyerUid && ticket.buyerUid === caller.uid) ||
    (!!caller.email && ownerEmail === caller.email.toLowerCase());
  if (!isOwner) {
    return {eligible: false, code: 'forbidden', error: 'This ticket does not belong to your account.'};
  }

  // Duplicate prevention: one refund record per ticket (doc id === ticketId).
  const refundSnap = await db.collection('refunds').doc(ticketId).get();
  if (refundSnap.exists) {
    const existing = refundSnap.data() as {status?: string; deadline?: string; note?: string};
    if (existing.status && ACTIVE_REFUND_STATUSES.includes(existing.status)) {
      return {
        eligible: false,
        code: 'duplicate',
        reason:
          existing.status === 'requested'
            ? 'A cancellation request for this ticket is already awaiting review.'
            : `This ticket already has a refund in progress (${existing.status}).`,
        deadline: existing.deadline || '',
      };
    }
    // 'declined' → the attendee may request again.
  }

  if (ticket.status === 'refunded') {
    return {eligible: false, code: 'already_refunded', reason: 'This ticket has already been refunded.'};
  }
  if (ticket.status === 'cancelled') {
    return {eligible: false, code: 'cancelled', reason: 'This ticket has already been cancelled.'};
  }
  if (ticket.status === 'used') {
    return {eligible: false, code: 'used', reason: 'This ticket has already been used for entry.'};
  }
  if (ticket.status === 'transferred') {
    return {eligible: false, code: 'transferred', reason: 'Transferred tickets cannot be cancelled by the sender.'};
  }

  // The policy snapshot taken at purchase is authoritative — later organizer
  // edits can never change an already-sold ticket's eligibility.
  if (ticket.refundable !== true) {
    return {
      eligible: false,
      code: 'non_refundable',
      policy: 'non_refundable',
      reason:
        'This ticket is non-refundable under the refund policy that was shown when you bought it. Cancellations and refunds are not available.',
    };
  }

  const orderSnap = ticket.orderId ? await db.collection('orders').doc(ticket.orderId).get() : null;
  const order = orderSnap?.exists
    ? (orderSnap.data() as {unitPrice?: number; currency?: string; status?: string; quantity?: number})
    : null;
  if (!order) {
    return {eligible: false, code: 'no_order', reason: 'The payment record for this ticket could not be found.'};
  }

  // Deadline: snapshot first, then recompute from the event (Africa/Lagos).
  let deadline = ticket.refundDeadline || '';
  if (!deadline && ticket.eventId) {
    const eventSnap = await db.collection('events').doc(ticket.eventId).get();
    if (eventSnap.exists) {
      const ev = eventSnap.data() as {date?: string; refundCutoffHours?: number};
      deadline = refundDeadlineFor(ev.date, ticket.refundCutoffHours ?? ev.refundCutoffHours ?? 0);
    }
  }
  if (!deadline || !isBeforeDeadline(deadline)) {
    return {
      eligible: false,
      code: 'deadline_passed',
      policy: 'refundable',
      deadline,
      reason: 'The cancellation window for this ticket has passed (Africa/Lagos time).',
    };
  }

  return {
    eligible: true,
    policy: 'refundable',
    deadline,
    amount: Number(order.unitPrice) || 0,
    currency: order.currency === 'USD' ? 'USD' : 'NGN',
  };
}

/** The caller's verified email (used to prove ticket ownership). */
async function callerEmail(db: FirebaseFirestore.Firestore, uid: string): Promise<string> {
  try {
    const snap = await db.collection('users').doc(uid).get();
    // Normalized so it matches the normalized `buyerEmail` stored on tickets
    // and refunds (see @/lib/emails) — a mixed-case profile email would
    // otherwise hide the caller's own refund requests.
    return snap.exists ? normalizeEmail((snap.data() as {email?: string}).email) : '';
  } catch {
    return '';
  }
}

/**
 * GET  /api/refunds               → the caller's own refund requests
 * GET  /api/refunds?scope=admin   → every refund (admin review queue)
 * POST /api/refunds {action:'eligibility', ticketId} → can I cancel this?
 * POST /api/refunds {action:'request', ticketId, note?} → start the workflow
 * PATCH /api/refunds {id, action:'approve'|'decline'|'complete', note?} → admin
 *
 * Refunds only ever ANNOTATE the ticket/order — order and payment history are
 * never deleted. Ticket flow: requested → 'cancelled' (blocked at the gate);
 * approved → 'refunded' (blocked at the gate); declined → restored to 'active'.
 */
export async function GET(req: Request) {
  const uid = await requireAuth(req);
  if (isResponse(uid)) return uid;
  const {getAdminDb} = await admin();
  const db = getAdminDb();
  if (!db) return NextResponse.json({error: 'Server credentials missing.'}, {status: 503});

  try {
    const scope = new URL(req.url).searchParams.get('scope');

    if (scope === 'admin') {
      const adminUid = await requireAdmin(req);
      if (isResponse(adminUid)) return adminUid;
      const snap = await db.collection('refunds').limit(500).get();
      const refunds = snap.docs
        .map((d) => ({id: d.id, ...(d.data() as Record<string, unknown>)}) as RefundRow)
        .sort((a, b) => String(b.requestedAt || '').localeCompare(String(a.requestedAt || '')));
      return NextResponse.json({refunds});
    }

    // Own list — match on uid OR email (older tickets may lack a buyerUid).
    const email = await callerEmail(db, uid);
    const [byUid, byEmail] = await Promise.all([
      db.collection('refunds').where('buyerUid', '==', uid).limit(200).get(),
      email
        ? db.collection('refunds').where('buyerEmail', '==', email).limit(200).get()
        : Promise.resolve(null),
    ]);
    const merged = new Map<string, RefundRow>();
    const row = (d: {id: string; data: () => FirebaseFirestore.DocumentData}) =>
      ({id: d.id, ...(d.data() as Record<string, unknown>)}) as RefundRow;
    byUid.docs.forEach((d) => merged.set(d.id, row(d)));
    byEmail?.docs.forEach((d) => merged.set(d.id, row(d)));
    const refunds = [...merged.values()].sort((a, b) =>
      String(b.requestedAt || '').localeCompare(String(a.requestedAt || ''))
    );
    return NextResponse.json({refunds});
  } catch (err) {
    return NextResponse.json(
      {error: err instanceof Error ? err.message : 'Failed to load refunds.'},
      {status: 500}
    );
  }
}

export async function POST(req: Request) {
  const uid = await requireAuth(req);
  if (isResponse(uid)) return uid;
  const {getAdminDb} = await admin();
  const db = getAdminDb();
  if (!db) return NextResponse.json({error: 'Server credentials missing.'}, {status: 503});

  try {
    const body = (await req.json()) as {action?: string; ticketId?: string; note?: string};
    const ticketId = String(body.ticketId || '').trim();
    if (!ticketId) return NextResponse.json({error: 'ticketId is required.'}, {status: 400});

    const email = await callerEmail(db, uid);
    const eligibility = await checkEligibility(db, ticketId, {uid, email});

    // Preview: always 200 — `eligible:false` carries the reason to display.
    if (body.action === 'eligibility') return NextResponse.json(eligibility);

    if (body.action !== 'request') return NextResponse.json({error: 'Unknown action.'}, {status: 400});

    if (!eligibility.eligible) {
      const status = eligibility.code === 'duplicate' ? 409 : eligibility.code === 'forbidden' ? 403 : 400;
      return NextResponse.json(eligibility, {status});
    }

    const ticket = eligibility.ticket as TicketRow;
    const nowIso = new Date().toISOString();
    const refund = {
      ticketId,
      orderId: ticket.orderId || '',
      eventId: ticket.eventId || '',
      eventTitle: ticket.eventTitle || 'Event',
      tierName: ticket.tierName || '',
      holderName: ticket.holderName || '',
      // Normalized on write so the owner's own-list query always finds it.
      buyerEmail: normalizeEmail(ticket.buyerEmail || email),
      buyerUid: uid,
      amount: eligibility.amount || 0,
      currency: eligibility.currency || 'NGN',
      status: 'requested',
      refundable: true,
      deadline: eligibility.deadline || '',
      requestedAt: nowIso,
      requestedNote: String(body.note || '').slice(0, 500),
    };

    // Doc id === ticketId → a duplicate request can never be created.
    await db.collection('refunds').doc(ticketId).set(refund);
    // A requested cancellation is immediately invalid for admission.
    await db.collection('tickets').doc(ticketId).update({
      status: 'cancelled',
      cancelledAt: nowIso,
      refundRequestId: ticketId,
    });

    // Tell the attendee their request landed and alert the admin review queue.
    notifyByEmail(refund.buyerEmail, {
      title: 'Cancellation request received',
      body: `Your cancellation request for "${refund.eventTitle}" is under review — we'll notify you once it's decided.`,
      type: 'info',
      href: '/dashboard/attendee',
    }).catch(() => undefined);
    userIdsByRole(db, ['admin'])
      .then((adminIds) =>
        notifyUsers(adminIds, {
          title: 'Refund request to review',
          body: `${refund.buyerEmail} requested a ${refund.currency === 'USD' ? '$' : '₦'}${refund.amount.toLocaleString()} refund for "${refund.eventTitle}".`,
          type: 'warning',
          href: '/dashboard/admin/refunds',
        })
      )
      .catch(() => undefined);

    return NextResponse.json({ok: true, refund, eligibility});
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not request cancellation.';
    return NextResponse.json({error: message}, {status: /already exists/i.test(message) ? 409 : 500});
  }
}

/**
 * Admin decision on a refund. Approving invalidates the ticket permanently
 * (status 'refunded') and ANNOTATES the order (refundedTickets/refundedAmount,
 * order status flips to 'refunded' only when every ticket is refunded) — the
 * payment record is never deleted. Declining restores the ticket to 'active'.
 */
export async function PATCH(req: Request) {
  const uid = await requireAdmin(req);
  if (isResponse(uid)) return uid;
  const {getAdminDb} = await admin();
  const db = getAdminDb();
  if (!db) return NextResponse.json({error: 'Server credentials missing.'}, {status: 503});

  try {
    const body = (await req.json()) as {id?: string; action?: string; note?: string};
    const id = String(body.id || '').trim();
    if (!id) return NextResponse.json({error: 'id is required.'}, {status: 400});
    const action = body.action || '';
    if (action !== 'approve' && action !== 'decline' && action !== 'complete') {
      return NextResponse.json({error: 'action must be approve, decline or complete.'}, {status: 400});
    }

    const refundRef = db.collection('refunds').doc(id);
    const refundSnap = await refundRef.get();
    if (!refundSnap.exists) return NextResponse.json({error: 'Refund not found.'}, {status: 404});
    const current = refundSnap.data() as Record<string, unknown> & {status?: string};
    const nowIso = new Date().toISOString();
    const note = String(body.note || '').slice(0, 500);
    const patch: Record<string, unknown> = {};
    const ticketId = String(current.ticketId || id);

    if (action === 'approve') {
      if (current.status !== 'requested') {
        return NextResponse.json(
          {error: `Only pending requests can be approved (this one is "${current.status}").`},
          {status: 409}
        );
      }
      patch.status = 'approved';
      patch.decidedAt = nowIso;
      patch.decidedBy = uid;
      if (note) patch.note = note;

      // Ticket: permanently invalid for admission from now on.
      await db.collection('tickets').doc(ticketId).update({
        status: 'refunded',
        refundedAt: nowIso,
        refundApprovedBy: uid,
      });

      // Order: annotate only — payment history is retained in full.
      const orderId = String(current.orderId || '');
      if (orderId) {
        const orderRef = db.collection('orders').doc(orderId);
        const orderSnap = await orderRef.get();
        if (orderSnap.exists) {
          const order = orderSnap.data() as {
            quantity?: number;
            refundedTickets?: string[];
            refundedAmount?: number;
            status?: string;
          };
          const list = Array.from(new Set([...(order.refundedTickets || []), ticketId]));
          const refundedAmount = (Number(order.refundedAmount) || 0) + (Number(current.amount) || 0);
          const allRefunded = list.length >= (Number(order.quantity) || 1);
          await orderRef.update({
            refundedTickets: list,
            refundedAmount,
            ...(allRefunded && order.status === 'paid' ? {status: 'refunded', refundedAt: nowIso} : {}),
          });
        }
      }
    } else if (action === 'decline') {
      if (current.status !== 'requested') {
        return NextResponse.json(
          {error: `Only pending requests can be declined (this one is "${current.status}").`},
          {status: 409}
        );
      }
      patch.status = 'declined';
      patch.decidedAt = nowIso;
      patch.decidedBy = uid;
      if (note) patch.note = note;
      // Ticket restored — the attendee keeps valid entry.
      const ticketRef = db.collection('tickets').doc(ticketId);
      const ticketSnap = await ticketRef.get();
      if (ticketSnap.exists && (ticketSnap.data() as {status?: string}).status === 'cancelled') {
        await ticketRef.update({status: 'active', cancelledAt: ''});
      }
    } else {
      if (current.status !== 'approved') {
        return NextResponse.json(
          {error: `Only approved refunds can be completed (this one is "${current.status}").`},
          {status: 409}
        );
      }
      patch.status = 'completed';
      patch.completedAt = nowIso;
      if (note) patch.note = note;
    }

    await refundRef.update(patch);
    const refund = {id, ...current, ...patch};

    // Attendee feedback: in-app notification + status email.
    const status = String(refund.status);
    const buyerEmail = String(current.buyerEmail || '');
    const amount = Number(current.amount) || 0;
    const currency = current.currency === 'USD' ? 'USD' : 'NGN';
    const eventTitle = String(current.eventTitle || 'your event');
    const money = `${currency === 'USD' ? '$' : '₦'}${amount.toLocaleString()}`;
    const messages: Record<string, {title: string; body: string; type: 'success' | 'warning'}> = {
      approved: {
        title: 'Refund approved',
        body: `Your cancellation for "${eventTitle}" was approved — the ${money} refund is now being processed.`,
        type: 'success',
      },
      declined: {
        title: 'Cancellation declined',
        body: `Your cancellation for "${eventTitle}" was declined.${note ? ` Reason: ${note}` : ' Your ticket remains valid for entry.'}`,
        type: 'warning',
      },
      completed: {
        title: 'Refund completed',
        body: `Your ${money} refund for "${eventTitle}" has been completed.`,
        type: 'success',
      },
    };
    const msg = messages[status];
    if (buyerEmail && msg) {
      notifyByEmail(buyerEmail, {...msg, href: '/dashboard/attendee'}).catch(() => undefined);
      sendRefundStatusEmail({
        to: buyerEmail,
        eventTitle,
        status: status as 'approved' | 'declined' | 'completed',
        amount,
        currency,
        note,
        orderId: String(current.orderId || ''),
      }).catch(() => undefined);
    }

    return NextResponse.json({ok: true, refund});
  } catch (err) {
    return NextResponse.json(
      {error: err instanceof Error ? err.message : 'Failed to update the refund.'},
      {status: 500}
    );
  }
}

