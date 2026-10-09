import {NextResponse} from 'next/server';
import {requireOperator, isResponse} from '@/lib/admin-auth';
import {getAdminDb} from '@/lib/firebase-admin';

export const runtime = 'nodejs';

/**
 * POST /api/tickets/validate — gate-scan lookup for a QR/ticket code.
 * body: { code: string }  e.g. "TKT-8CHARSXX-1"
 * Returns {found, ticket} — used by the staff/vendor scanner dashboards.
 */
export async function POST(req: Request) {
  const uid = await requireOperator(req);
  if (isResponse(uid)) return uid;
  const db = getAdminDb();
  if (!db) return NextResponse.json({error: 'Server credentials missing.'}, {status: 503});

  try {
    const body = (await req.json()) as {code?: string; checkIn?: boolean};
    const code = (body.code || '').trim().toUpperCase();
    if (!code) return NextResponse.json({error: 'Ticket code is required.'}, {status: 400});

    const snap = await db.collection('tickets').where('code', '==', code).limit(1).get();
    if (snap.empty) return NextResponse.json({found: false, code});

    const doc = snap.docs[0];
    const d = doc.data() as {
      code: string;
      eventTitle: string;
      holderName: string;
      buyerEmail: string;
      status: string;
      createdAt?: string;
      orderId?: string;
    };

    const wasUsed = d.status === 'used';
    let checkedIn = false;
    if (body.checkIn && !wasUsed && d.status === 'active') {
      await doc.ref.update({status: 'used', usedAt: new Date().toISOString()});
      checkedIn = true;
    }

    return NextResponse.json({
      found: true,
      code,
      checkedIn,
      ticket: {
        code: d.code,
        eventTitle: d.eventTitle,
        holderName: d.holderName,
        status: wasUsed ? 'used' : d.status,
        createdAt: d.createdAt || '',
        orderId: d.orderId || '',
      },
    });
  } catch (err) {
    return NextResponse.json(
      {error: err instanceof Error ? err.message : 'Lookup failed.'},
      {status: 500}
    );
  }
}
