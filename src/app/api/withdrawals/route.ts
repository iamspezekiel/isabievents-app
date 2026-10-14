import {NextResponse} from 'next/server';
import {randomBytes} from 'crypto';
import {requireAuth, requireOrganizer, requireAdmin, isResponse} from '@/lib/admin-auth';
import {admin} from '@/lib/server-admin';
import {sendWithdrawalRequestEmails, sendWithdrawalStatusEmail} from '@/lib/email';
import {createNotification} from '@/lib/notifications';
import {getPlatformFeePercent} from '@/lib/fees';
import {orderFinancials} from '@/lib/finance';
import type {OrderDoc} from '@/lib/db-types';

export const runtime = 'nodejs';

const NGN_PER_USD = 1550;

interface WithdrawalBody {
  amount?: number | string;
  currency?: string;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  network?: string;
  walletAddress?: string;
}

interface WithdrawalDoc {
  id: string;
  uid: string;
  organizerName: string;
  organizerEmail: string;
  amount: number;
  currency: 'NGN' | 'USD';
  method: 'bank' | 'crypto';
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  network?: string;
  walletAddress?: string;
  status: 'pending' | 'approved' | 'rejected';
  note?: string;
  createdAt: string;
  updatedAt: string;
  processedAt?: string;
  processedBy?: string;
}

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

/** Organizer NET earnings (fee- and refund-adjusted) for their own events. */
function netEarnings(orders: OrderDoc[], myEventIds: Set<string>, feePercent: number): {ngn: number; usd: number} {
  let ngn = 0;
  let usd = 0;
  for (const o of orders) {
    if (!o.eventId || !myEventIds.has(o.eventId)) continue;
    const fin = orderFinancials(o, feePercent);
    if (o.currency === 'USD') usd += fin.net;
    else ngn += fin.net;
  }
  return {ngn, usd};
}

/** Amount already committed to (pending or approved) withdrawals. */
function reserved(requests: WithdrawalDoc[]): {ngn: number; usd: number} {
  let ngn = 0;
  let usd = 0;
  for (const w of requests) {
    if (w.status !== 'pending' && w.status !== 'approved') continue;
    if (w.currency === 'USD') usd += Number(w.amount) || 0;
    else ngn += Number(w.amount) || 0;
  }
  return {ngn, usd};
}

/** Net earnings minus committed withdrawals, floored at zero per currency. */
function available(earnings: {ngn: number; usd: number}, used: {ngn: number; usd: number}) {
  return {ngn: Math.max(0, round2(earnings.ngn - used.ngn)), usd: Math.max(0, round2(earnings.usd - used.usd))};
}

/** Read the organizer's events, paid orders and withdrawals within a tx. */
async function readBalanceInputs(tx: FirebaseFirestore.Transaction, db: FirebaseFirestore.Firestore, uid: string) {
  const [eventsSnap, ordersSnap, withdrawalsSnap] = await Promise.all([
    tx.get(db.collection('events').where('organizerUid', '==', uid)),
    tx.get(db.collection('orders').where('status', '==', 'paid')),
    tx.get(db.collection('withdrawals').where('uid', '==', uid)),
  ]);
  const myEventIds = new Set(eventsSnap.docs.map((d) => d.id));
  const orders = ordersSnap.docs.map((d) => d.data() as OrderDoc);
  const requests = withdrawalsSnap.docs.map((d) => d.data() as WithdrawalDoc);
  return {myEventIds, orders, requests};
}

/**
 * GET /api/withdrawals — organizer: own requests + available NET balance.
 *                        admin: every request (balance not applicable).
 */
export async function GET(req: Request) {
  const uid = await requireAuth(req);
  if (isResponse(uid)) return uid;
  const {getAdminDb} = await admin();
  const db = getAdminDb();
  if (!db) return NextResponse.json({error: 'Server credentials missing.'}, {status: 503});

  try {
    const callerDoc = await db.collection('users').doc(uid).get();
    const role = callerDoc.exists ? (callerDoc.data() as {role?: string}).role : '';
    if (role !== 'admin' && role !== 'organizer') {
      return NextResponse.json({error: 'Organizer access required.'}, {status: 403});
    }

    const snap =
      role === 'admin'
        ? await db.collection('withdrawals').orderBy('createdAt', 'desc').limit(200).get()
        : // No orderBy here (would need a composite index); sorted in JS below.
          await db.collection('withdrawals').where('uid', '==', uid).limit(100).get();

    const requests = snap.docs
      .map((d) => d.data() as WithdrawalDoc)
      .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

    let balance = {ngn: 0, usd: 0};
    if (role === 'organizer') {
      const feePercent = await getPlatformFeePercent();
      const [eventsSnap, ordersSnap] = await Promise.all([
        db.collection('events').where('organizerUid', '==', uid).get(),
        db.collection('orders').where('status', '==', 'paid').get(),
      ]);
      const myEventIds = new Set(eventsSnap.docs.map((d) => d.id));
      const earnings = netEarnings(
        ordersSnap.docs.map((d) => d.data() as OrderDoc),
        myEventIds,
        feePercent
      );
      balance = available(earnings, reserved(requests));
    }

    return NextResponse.json({
      requests,
      balance,
      role,
      ngPerUsd: NGN_PER_USD,
    });
  } catch (err) {
    return NextResponse.json(
      {error: err instanceof Error ? err.message : 'Failed to load withdrawals.'},
      {status: 500}
    );
  }
}

/**
 * POST /api/withdrawals — organizer submits a manual payout request.
 *   NGN → bank transfer details (any Nigerian bank)
 *   USD → crypto wallet details
 * The balance is re-checked and the request reserved inside one transaction so
 * concurrent requests can never exceed the organizer's net earnings.
 */
export async function POST(req: Request) {
  const uid = await requireOrganizer(req);
  if (isResponse(uid)) return uid;
  const {getAdminDb} = await admin();
  const db = getAdminDb();
  if (!db) return NextResponse.json({error: 'Server credentials missing.'}, {status: 503});

  try {
    const body = (await req.json()) as WithdrawalBody;
    const amount = round2(Number(body.amount));
    const currency = body.currency === 'USD' ? 'USD' : body.currency === 'NGN' ? 'NGN' : '';

    if (!currency) return NextResponse.json({error: 'Currency must be NGN or USD.'}, {status: 400});
    if (!Number.isFinite(amount) || amount <= 0 || amount > 1_000_000_000) {
      return NextResponse.json({error: 'Enter a valid amount greater than zero.'}, {status: 400});
    }

    const bankName = (body.bankName || '').trim();
    const accountNumber = (body.accountNumber || '').trim();
    const accountName = (body.accountName || '').trim();
    const network = (body.network || '').trim();
    const walletAddress = (body.walletAddress || '').trim();

    const baseDoc: Omit<WithdrawalDoc, 'id' | 'organizerName' | 'organizerEmail'> = {
      uid,
      amount,
      currency,
      method: currency === 'NGN' ? 'bank' : 'crypto',
      ...(currency === 'NGN' ? {bankName, accountNumber, accountName} : {network, walletAddress}),
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (currency === 'NGN') {
      if (!bankName || !/^\d{10}$/.test(accountNumber) || !accountName) {
        return NextResponse.json(
          {error: 'Bank name, a 10-digit account number and account name are required.'},
          {status: 400}
        );
      }
    } else if (!network || walletAddress.length < 12) {
      return NextResponse.json(
        {error: 'Select a crypto network and paste a valid wallet address.'},
        {status: 400}
      );
    }

    const profileSnap = await db.collection('users').doc(uid).get();
    const profile = (profileSnap.exists ? profileSnap.data() : {}) as {name?: string; email?: string};
    const feePercent = await getPlatformFeePercent();

    const withdrawalId = randomBytes(5).toString('hex').toUpperCase();
    const docRef = db.collection('withdrawals').doc(withdrawalId);

    let availableFunds = 0;
    const committed = await db.runTransaction(async (tx) => {
      const {myEventIds, orders, requests} = await readBalanceInputs(tx, db, uid);
      const avail = available(netEarnings(orders, myEventIds, feePercent), reserved(requests));
      availableFunds = currency === 'USD' ? avail.usd : avail.ngn;
      if (amount > availableFunds + 0.001) return false;
      tx.set(docRef, {
        ...baseDoc,
        id: withdrawalId,
        organizerName: profile.name || 'Organizer',
        organizerEmail: profile.email || '',
      });
      return true;
    });

    if (!committed) {
      return NextResponse.json(
        {
          error:
            availableFunds <= 0
              ? `No available ${currency} balance to withdraw yet — payouts come from settled ticket sales (net of platform fees and refunds).`
              : `Amount exceeds your available ${currency} balance of ${availableFunds.toFixed(2)}.`,
        },
        {status: 400}
      );
    }

    const doc: WithdrawalDoc = {
      ...baseDoc,
      id: withdrawalId,
      organizerName: profile.name || 'Organizer',
      organizerEmail: profile.email || '',
    };
    // send() swallows SMTP errors internally, so this can't fail the request.
    await sendWithdrawalRequestEmails(doc);

    return NextResponse.json({ok: true, id: doc.id, request: doc});
  } catch (err) {
    return NextResponse.json(
      {error: err instanceof Error ? err.message : 'Failed to submit request.'},
      {status: 500}
    );
  }
}

/**
 * PATCH /api/withdrawals — admin approves/declines a pending request.
 * The pending→approved|rejected transition is transactional, so a request can
 * only ever be processed once (no double payout / double email).
 */
export async function PATCH(req: Request) {
  const uid = await requireAdmin(req);
  if (isResponse(uid)) return uid;
  const {getAdminDb} = await admin();
  const db = getAdminDb();
  if (!db) return NextResponse.json({error: 'Server credentials missing.'}, {status: 503});

  try {
    const body = (await req.json()) as {id?: string; status?: string; note?: string};
    const id = (body.id || '').trim();
    const status = body.status === 'approved' || body.status === 'rejected' ? body.status : '';
    if (!id || !status) {
      return NextResponse.json({error: 'id and status (approved|rejected) are required.'}, {status: 400});
    }

    const ref = db.collection('withdrawals').doc(id);
    const note = (body.note || '').trim() || undefined;
    const nowIso = new Date().toISOString();

    const result = await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists) return {outcome: 'missing' as const};
      const current = snap.data() as WithdrawalDoc;
      if (current.status !== 'pending') return {outcome: 'processed' as const, doc: current};
      tx.update(ref, {
        status,
        updatedAt: nowIso,
        processedAt: nowIso,
        processedBy: uid,
        ...(note ? {note} : {}),
      });
      return {outcome: 'ok' as const, doc: current};
    });

    if (result.outcome === 'missing') {
      return NextResponse.json({error: 'Request not found.'}, {status: 404});
    }
    if (result.outcome === 'processed') {
      return NextResponse.json({error: 'This request has already been processed.'}, {status: 400});
    }
    const existing = result.doc;

    // Notify the organizer of the outcome (send() never throws).
    await sendWithdrawalStatusEmail({...existing, status, note});

    // In-app notification for the organizer's dashboard.
    if (existing.uid) {
      const amountStr = `${existing.currency === 'USD' ? '$' : '₦'}${Number(existing.amount || 0).toLocaleString()}`;
      createNotification({
        userId: existing.uid,
        title: status === 'approved' ? 'Payout approved' : 'Payout declined',
        body:
          status === 'approved'
            ? `Your ${amountStr} withdrawal request has been approved and is being processed.`
            : `Your ${amountStr} withdrawal request was declined.${note ? ` Reason: ${note}` : ''}`,
        type: status === 'approved' ? 'success' : 'warning',
        href: '/dashboard/organizer/payouts',
      }).catch(() => undefined);
    }

    return NextResponse.json({ok: true, id, status});
  } catch (err) {
    return NextResponse.json(
      {error: err instanceof Error ? err.message : 'Failed to update request.'},
      {status: 500}
    );
  }
}
