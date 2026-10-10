import {NextResponse} from 'next/server';
import {randomBytes} from 'crypto';
import {requireAuth, requireOrganizer, requireAdmin, isResponse} from '@/lib/admin-auth';
import {admin} from '@/lib/server-admin';
import {sendWithdrawalRequestEmails, sendWithdrawalStatusEmail} from '@/lib/email';

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

/**
 * GET /api/withdrawals — organizer: own requests + available balances.
 *                      — admin: every request (balance not applicable).
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

    let snap;
    if (role === 'admin') {
      snap = await db.collection('withdrawals').orderBy('createdAt', 'desc').limit(200).get();
    } else {
      // No orderBy here (would need a composite index); sorted in JS below.
      snap = await db
        .collection('withdrawals')
        .where('organizerUid', '==', uid)
        .limit(100)
        .get();
    }
    const requests = snap.docs
      .map((d) => d.data() as WithdrawalDoc)
      .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

    // Available balance = paid-order revenue for THIS organizer's events,
    // minus their pending + approved withdrawal requests (per currency).
    let balanceNgn = 0;
    let balanceUsd = 0;
    if (role === 'organizer') {
      const eventsSnap = await db
        .collection('events')
        .where('organizerUid', '==', uid)
        .get();
      const myEventIds = new Set(eventsSnap.docs.map((d) => d.id));
      if (myEventIds.size > 0) {
        const ordersSnap = await db.collection('orders').where('status', '==', 'paid').get();
        for (const o of ordersSnap.docs) {
          const ord = o.data() as {eventId?: string; amount?: number; currency?: string};
          if (!ord.eventId || !myEventIds.has(ord.eventId)) continue;
          if (ord.currency === 'USD') balanceUsd += ord.amount || 0;
          else balanceNgn += ord.amount || 0;
        }
      }
      for (const r of requests) {
        if (r.status === 'pending' || r.status === 'approved') {
          if (r.currency === 'USD') balanceUsd -= r.amount;
          else balanceNgn -= r.amount;
        }
      }
      balanceNgn = Math.max(0, Math.round(balanceNgn * 100) / 100);
      balanceUsd = Math.max(0, Math.round(balanceUsd * 100) / 100);
    }

    return NextResponse.json({
      requests,
      balance: {ngn: balanceNgn, usd: balanceUsd},
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
 * Emails the admin (action needed) and the organizer (confirmation).
 */
export async function POST(req: Request) {
  const uid = await requireOrganizer(req);
  if (isResponse(uid)) return uid;
  const {getAdminDb} = await admin();
  const db = getAdminDb();
  if (!db) return NextResponse.json({error: 'Server credentials missing.'}, {status: 503});

  try {
    const body = (await req.json()) as WithdrawalBody;
    const amount = Math.round(Number(body.amount) * 100) / 100;
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

    let doc: WithdrawalDoc;
    if (currency === 'NGN') {
      // Bank transfer — every Nigerian bank is supported.
      if (!bankName || !/^\d{10}$/.test(accountNumber) || !accountName) {
        return NextResponse.json(
          {error: 'Bank name, a 10-digit account number and account name are required.'},
          {status: 400}
        );
      }
      doc = {
        id: randomBytes(5).toString('hex').toUpperCase(),
        uid,
        organizerName: '',
        organizerEmail: '',
        amount,
        currency,
        method: 'bank',
        bankName,
        accountNumber,
        accountName,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    } else {
      // Crypto (USD) — network + wallet address.
      if (!network || walletAddress.length < 12) {
        return NextResponse.json(
          {error: 'Select a crypto network and paste a valid wallet address.'},
          {status: 400}
        );
      }
      doc = {
        id: randomBytes(5).toString('hex').toUpperCase(),
        uid,
        organizerName: '',
        organizerEmail: '',
        amount,
        currency,
        method: 'crypto',
        network,
        walletAddress,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    const profileSnap = await db.collection('users').doc(uid).get();
    const profile = (profileSnap.exists ? profileSnap.data() : {}) as {
      name?: string;
      email?: string;
      role?: string;
    };
    doc.organizerName = profile.name || 'Organizer';
    doc.organizerEmail = profile.email || '';

    await db.collection('withdrawals').doc(doc.id).set(doc);

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
 * PATCH /api/withdrawals — admin manually approves/declines a request.
 * Body: {id: string, status: 'approved' | 'rejected', note?: string}
 * Emails the organizer the outcome.
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
    const snap = await ref.get();
    if (!snap.exists) return NextResponse.json({error: 'Request not found.'}, {status: 404});

    const existing = snap.data() as WithdrawalDoc;
    if (existing.status !== 'pending') {
      return NextResponse.json({error: 'This request has already been processed.'}, {status: 400});
    }

    const note = (body.note || '').trim() || undefined;
    const patch: Record<string, unknown> = {
      status,
      updatedAt: new Date().toISOString(),
      processedAt: new Date().toISOString(),
      processedBy: uid,
    };
    if (note) patch.note = note;
    await ref.update(patch);

    // Notify the organizer of the outcome (send() never throws).
    await sendWithdrawalStatusEmail({...existing, status, note});

    return NextResponse.json({ok: true, id, status});
  } catch (err) {
    return NextResponse.json(
      {error: err instanceof Error ? err.message : 'Failed to update request.'},
      {status: 500}
    );
  }
}
