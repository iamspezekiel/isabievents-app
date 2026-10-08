/**
 * Firestore data layer with graceful fallback to mock data.
 *
 * When NEXT_PUBLIC_FIREBASE_* env vars are missing the app runs in demo mode
 * and every read/write resolves against `mock-data.ts` so the prototype keeps
 * working without a Firebase project.
 *
 * Collections:
 *   users/{uid}      — profile + role (written on signup)
 *   events/{id}      — event listings (seeded via `npm run seed`)
 *   orders/{id}      — checkout orders (created by /api/bachs/checkout)
 *   tickets/{id}     — issued QR tickets (created when an order is paid)
 *   webhook_events/{eventId} — Bachs webhook dedup ledger
 */
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  type DocumentData,
} from 'firebase/firestore';
import {db, isFirebaseConfigured} from '@/lib/firebase';
import {MOCK_EVENTS} from '@/lib/mock-data';

export type OrderStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface OrderDoc {
  id: string;
  eventId: string;
  eventSlug: string;
  eventTitle: string;
  quantity: number;
  unitPrice: number;
  amount: number; // in the smallest display unit of `currency` (2-decimal string parsed)
  currency: 'NGN' | 'USD';
  status: OrderStatus;
  checkoutId?: string;
  checkoutUrl?: string;
  buyer: {name: string; email: string; phone?: string};
  buyerUid?: string;
  paymentMethod?: string;
  paidAt?: string;
  createdAt?: unknown;
}

export interface TicketDoc {
  id: string;
  orderId: string;
  eventId: string;
  eventTitle: string;
  holderName: string;
  buyerEmail: string;
  code: string; // QR payload, e.g. TKT-<orderId short>
  status: 'active' | 'used' | 'transferred';
  createdAt?: unknown;
}

export const isDbConfigured = () => isFirebaseConfigured && db !== null;

/**
 * Returns all events. Firestore when configured (falling back to seed-less
 * mock list if the collection is empty), otherwise the mock list.
 */
export async function getEvents(): Promise<typeof MOCK_EVENTS> {
  if (!isDbConfigured()) return MOCK_EVENTS;
  try {
    const snap = await getDocs(collection(db!, 'events'));
    if (snap.empty) return MOCK_EVENTS;
    return snap.docs.map((d) => ({id: d.id, ...d.data()})) as typeof MOCK_EVENTS;
  } catch (err) {
    console.warn('[db] getEvents failed, using mock data:', err);
    return MOCK_EVENTS;
  }
}

/** Find a single event by document id or slug. */
export async function getEvent(idOrSlug: string): Promise<(typeof MOCK_EVENTS)[number] | null> {
  if (!isDbConfigured()) {
    return MOCK_EVENTS.find((e) => e.id === idOrSlug || e.slug === idOrSlug) ?? null;
  }
  try {
    const byId = await getDoc(doc(db!, 'events', idOrSlug));
    if (byId.exists()) return {id: byId.id, ...byId.data()} as (typeof MOCK_EVENTS)[number];
    const all = await getEvents();
    return all.find((e) => (e as {slug?: string}).slug === idOrSlug) ?? null;
  } catch (err) {
    console.warn('[db] getEvent failed, using mock data:', err);
    return MOCK_EVENTS.find((e) => e.id === idOrSlug || e.slug === idOrSlug) ?? null;
  }
}

/** Create (or replace) an order document. Used by the Bachs checkout API. */
export async function createOrder(order: Omit<OrderDoc, 'createdAt'>): Promise<void> {
  if (!isDbConfigured()) return; // demo mode: order lives only in the API response flow
  try {
    await setDoc(doc(db!, 'orders', order.id), {...order, createdAt: serverTimestamp()});
  } catch (err) {
    console.warn('[db] createOrder failed:', err);
  }
}

/** Update partial fields on an order. */
export async function updateOrder(orderId: string, patch: Partial<OrderDoc>): Promise<void> {
  if (!isDbConfigured()) return;
  try {
    await updateDoc(doc(db!, 'orders', orderId), patch as DocumentData);
  } catch (err) {
    console.warn('[db] updateOrder failed:', err);
  }
}

/** Look up an order by its Bachs checkout id (webhook fulfilment). */
export async function findOrderByCheckoutId(checkoutId: string): Promise<OrderDoc | null> {
  if (!isDbConfigured()) return null;
  try {
    const q = query(collection(db!, 'orders'), where('checkoutId', '==', checkoutId));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const d = snap.docs[0];
    return {id: d.id, ...(d.data() as Omit<OrderDoc, 'id'>)};
  } catch (err) {
    console.warn('[db] findOrderByCheckoutId failed:', err);
    return null;
  }
}

/** Issue tickets for a paid order (idempotent per order). */
export async function issueTicketsForOrder(order: OrderDoc): Promise<void> {
  if (!isDbConfigured()) return;
  try {
    for (let i = 0; i < order.quantity; i++) {
      const ticketId = `${order.id}-t${i + 1}`;
      await setDoc(
        doc(db!, 'tickets', ticketId),
        {
          id: ticketId,
          orderId: order.id,
          eventId: order.eventId,
          eventTitle: order.eventTitle,
          holderName: order.buyer.name,
          buyerEmail: order.buyer.email,
          code: `TKT-${order.id.toUpperCase().slice(0, 8)}-${i + 1}`,
          status: 'active',
          createdAt: serverTimestamp(),
        } satisfies TicketDoc
      );
    }
  } catch (err) {
    console.warn('[db] issueTicketsForOrder failed:', err);
  }
}

/** All tickets purchased by a given buyer email (attendee wallet). */
export async function getTicketsForEmail(email: string): Promise<TicketDoc[]> {
  if (!isDbConfigured()) return [];
  try {
    const q = query(collection(db!, 'tickets'), where('buyerEmail', '==', email));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({id: d.id, ...(d.data() as Omit<TicketDoc, 'id'>)}));
  } catch (err) {
    console.warn('[db] getTicketsForEmail failed:', err);
    return [];
  }
}

/** All orders placed by a given email. */
export async function getOrdersForEmail(email: string): Promise<OrderDoc[]> {
  if (!isDbConfigured()) return [];
  try {
    const q = query(collection(db!, 'orders'), where('buyer.email', '==', email), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({id: d.id, ...(d.data() as Omit<OrderDoc, 'id'>)}));
  } catch (err) {
    console.warn('[db] getOrdersForEmail failed:', err);
    return [];
  }
}
