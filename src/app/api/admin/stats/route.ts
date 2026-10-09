import {NextResponse} from 'next/server';
import {requireAdmin, isResponse} from '@/lib/admin-auth';
import {admin} from '@/lib/server-admin';

export const runtime = 'nodejs';

const NGN_PER_USD = 1550;

/** GET /api/admin/stats — real platform aggregates for the admin console. */
export async function GET(req: Request) {
  const uid = await requireAdmin(req);
  if (isResponse(uid)) return uid;
  const {getAdminDb} = await admin();
  const db = getAdminDb();
  if (!db) return NextResponse.json({error: 'Server credentials missing.'}, {status: 503});

  try {
    const [usersSnap, eventsSnap, ordersSnap] = await Promise.all([
      db.collection('users').count().get(),
      db.collection('events').get(),
      db.collection('orders').where('status', '==', 'paid').get(),
    ]);

    let revenueNgn = 0;
    let pendingHosts = 0;
    const days: {name: string; revenue: number; ts: number}[] = [];
    const recentSales: {id: string; eventTitle: string; amount: number; currency: string; paidAt: string}[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      days.push({name: d.toLocaleDateString('en-NG', {weekday: 'short'}), revenue: 0, ts: d.setHours(0, 0, 0, 0)});
    }

    for (const doc of eventsSnap.docs) {
      const organizer = (doc.data() as {organizer?: {verified?: boolean}}).organizer;
      if (!organizer?.verified) pendingHosts++;
    }

    for (const doc of ordersSnap.docs) {
      const o = doc.data() as {eventId?: string; eventTitle?: string; amount?: number; currency?: string; paidAt?: string; createdAt?: string};
      const ngn = (o.amount || 0) * (o.currency === 'USD' ? NGN_PER_USD : 1);
      revenueNgn += ngn;
      const paidAt = o.paidAt || o.createdAt || '';
      recentSales.push({
        id: doc.id,
        eventTitle: o.eventTitle || 'Event',
        amount: o.amount || 0,
        currency: o.currency === 'USD' ? 'USD' : 'NGN',
        paidAt,
      });
      if (paidAt) {
        const ts = new Date(paidAt).setHours(0, 0, 0, 0);
        const bucket = days.find((d) => d.ts === ts);
        if (bucket) bucket.revenue += ngn;
      }
    }
    recentSales.sort((a, b) => String(b.paidAt).localeCompare(String(a.paidAt)));

    return NextResponse.json({
      revenueNgn,
      users: usersSnap.data().count ?? 0,
      events: eventsSnap.size,
      paidOrders: ordersSnap.size,
      pendingHosts,
      series: days.map((d) => ({name: d.name, revenue: d.revenue})),
      recentSales: recentSales.slice(0, 5),
    });
  } catch (err) {
    return NextResponse.json(
      {error: err instanceof Error ? err.message : 'Stats failed.'},
      {status: 500}
    );
  }
}
