import {NextResponse} from 'next/server';
import {requireOperator, isResponse} from '@/lib/admin-auth';
import {admin} from '@/lib/server-admin';
import {getPlatformFeePercent} from '@/lib/fees';
import {orderFinancials} from '@/lib/finance';
import type {OrderDoc} from '@/lib/db-types';

export const runtime = 'nodejs';

/**
 * GET /api/events/stats — per-event sold count and money split (gross /
 * platform fee / organizer net) for the organizer dashboards. Uses the same
 * finance helper as the admin console and the withdrawal balance, so every
 * surface reports identical figures.
 */
export async function GET(req: Request) {
  const uid = await requireOperator(req);
  if (isResponse(uid)) return uid;
  const {getAdminDb} = await admin();
  const db = getAdminDb();
  if (!db) return NextResponse.json({error: 'Server credentials missing.'}, {status: 503});

  try {
    const feePercent = await getPlatformFeePercent();
    const snap = await db.collection('orders').where('status', '==', 'paid').get();
    const stats: Record<
      string,
      {sold: number; grossNgn: number; feeNgn: number; netNgn: number; revenueNgn: number}
    > = {};
    for (const doc of snap.docs) {
      const o = doc.data() as OrderDoc;
      if (!o.eventId) continue;
      const fin = orderFinancials(o, feePercent);
      const entry = stats[o.eventId] || {sold: 0, grossNgn: 0, feeNgn: 0, netNgn: 0, revenueNgn: 0};
      entry.sold += Number(o.quantity) || 0;
      entry.grossNgn += fin.grossNgn;
      entry.feeNgn += fin.feeNgn;
      entry.netNgn += fin.netNgn;
      entry.revenueNgn = entry.grossNgn; // legacy alias
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
