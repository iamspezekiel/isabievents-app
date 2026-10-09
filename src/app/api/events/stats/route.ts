import {NextResponse} from 'next/server';
import {requireOperator, isResponse} from '@/lib/admin-auth';
import {getAdminDb} from '@/lib/firebase-admin';

export const runtime = 'nodejs';

const NGN_PER_USD = 1550;

/**
 * GET /api/events/stats — per-event sold/revenue for organizer dashboards.
 * body-free; requires an authenticated staff/vendor/organizer/admin.
 */
export async function GET(req: Request) {
  const uid = await requireOperator(req);
  if (isResponse(uid)) return uid;
  const db = getAdminDb();
  if (!db) return NextResponse.json({error: 'Server credentials missing.'}, {status: 503});

  try {
    const snap = await db.collection('orders').where('status', '==', 'paid').get();
    const stats: Record<string, {sold: number; revenueNgn: number}> = {};
    for (const doc of snap.docs) {
      const o = doc.data() as {eventId?: string; quantity?: number; amount?: number; currency?: string};
      if (!o.eventId) continue;
      const ngn = (o.amount || 0) * (o.currency === 'USD' ? NGN_PER_USD : 1);
      const entry = stats[o.eventId] || {sold: 0, revenueNgn: 0};
      entry.sold += o.quantity || 0;
      entry.revenueNgn += ngn;
      stats[o.eventId] = entry;
    }
    return NextResponse.json({stats});
  } catch (err) {
    return NextResponse.json(
      {error: err instanceof Error ? err.message : 'Stats failed.'},
      {status: 500}
    );
  }
}