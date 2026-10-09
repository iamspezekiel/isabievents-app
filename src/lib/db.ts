/**
 * Firestore data layer � server-first.
 *
 * All consumers are API routes (checkout + webhook), so every operation
 * prefers the Firebase Admin SDK (FIREBASE_SERVICE_ACCOUNT_KEY / ADC):
 * it bypasses security rules and avoids the client SDK's cross-bundle
 * `instanceof` hazards that broke `doc()` inside bundled server code.
 *
 * Fallbacks:
 *   1. Admin SDK when server credentials exist (production path)
 *   2. Client SDK via instance-method chaining (browser path)
 *   Without Firebase configured every read resolves to an empty result —
 *   there is no in-memory mock data in production.
 *
 * Collections:
 *   users/{uid}      � profile + role (written on signup)
 *   events/{id}      � event listings (created by organizers)
 *   orders/{id}      � checkout orders (created by /api/bachs/checkout)
 *   tickets/{id}     � issued QR tickets (created when an order is paid)
 *   webhook_events/{eventId} � Bachs webhook dedup ledger
 */
import {db, isFirebaseConfigured} from '@/lib/firebase';
import {getAdminDb} from '@/lib/firebase-admin';

// Shared document types (pure types — see ./db-types, also re-exported here).
import type {OrderStatus, EventDoc, OrderDoc, TicketDoc} from './db-types';
export type {OrderStatus, EventDoc, OrderDoc, TicketDoc} from './db-types';

interface Snap {
  empty: boolean;
  docs: {id: string; data: () => Record<string, unknown>}[];
}

interface ClientDocSnap {
  exists: boolean;
  id: string;
  data(): Record<string, unknown>;
}

interface ClientDocRef {
  set(data: Record<string, unknown>): Promise<unknown>;
  update(patch: Record<string, unknown>): Promise<unknown>;
  get(): Promise<ClientDocSnap>;
}

interface ClientCollection {
  doc(id: string): ClientDocRef;
  where(field: string, op: string, value: unknown): ClientCollection;
  orderBy(field: string, dir?: 'asc' | 'desc'): ClientCollection;
  limit(n: number): ClientCollection;
  get(): Promise<Snap>;
}

/**
 * The client SDK's TS type omits the instance-method API (`collection()`,
 * `doc()`, …) even though it exists at runtime — and using the free helper
 * functions (`doc(db, …)`) breaks across duplicate module instances in the
 * server bundle. This structural view lets the fallback path chain methods.
 */
interface ClientFirestore {
  collection(path: string): ClientCollection;
}

/** True when orders/tickets can be persisted (admin SDK OR client SDK). */
export const isDbConfigured = () =>
  Boolean(getAdminDb()) || (isFirebaseConfigured && db !== null);

const now = () => new Date().toISOString();

/**
 * Firestore rejects explicit `undefined` values (e.g. optional fields the
 * API caller omitted). Strip them recursively before writing.
 */
const stripUndefined = <T>(value: T): T => {
  if (Array.isArray(value)) {
    return value.map((v) => stripUndefined(v)) as unknown as T;
  }
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (v !== undefined) out[k] = stripUndefined(v);
    }
    return out as T;
  }
  return value;
};

/** Reads all events (Admin SDK on the server, client SDK in the browser). */
export async function getEvents(): Promise<EventDoc[]> {
  try {
    const adminDb = getAdminDb();
    if (adminDb) {
      const snap = (await adminDb.collection('events').get()) as unknown as Snap;
      if (!snap.empty) return snap.docs.map((d) => ({id: d.id, ...d.data()})) as EventDoc[];
    } else if (isFirebaseConfigured && db) {
      const cdb = db as unknown as ClientFirestore;
      const snap = (await cdb.collection('events').get()) as unknown as Snap;
      if (!snap.empty) return snap.docs.map((d) => ({id: d.id, ...d.data()})) as EventDoc[];
    }
  } catch (err) {
    console.warn('[db] getEvents failed:', err);
  }
  return [];
}

/** Find a single event by document id or slug. */
export async function getEvent(idOrSlug: string): Promise<EventDoc | null> {
  try {
    const adminDb = getAdminDb();
    if (adminDb) {
      const snap = await adminDb.collection('events').doc(idOrSlug).get();
      if (snap.exists) return {id: snap.id, ...snap.data()} as EventDoc;
      const all = await getEvents();
      return all.find((e) => e.slug === idOrSlug) ?? null;
    }
    if (isFirebaseConfigured && db) {
      const cdb = db as unknown as ClientFirestore;
      const snap = await cdb.collection('events').doc(idOrSlug).get();
      if (snap.exists) return {id: snap.id, ...snap.data()} as EventDoc;
      const all = await getEvents();
      return all.find((e) => e.slug === idOrSlug) ?? null;
    }
  } catch (err) {
    console.warn('[db] getEvent failed:', err);
  }
  return null;
}

/** Create (or replace) an order document. Used by the Bachs checkout API. */
export async function createOrder(order: Omit<OrderDoc, 'createdAt'>): Promise<void> {
  try {
    const adminDb = getAdminDb();
    const data = stripUndefined({...order, createdAt: now()});
    if (adminDb) {
      await adminDb.collection('orders').doc(order.id).set(data);
      return;
    }
    if (isFirebaseConfigured && db) {
      const cdb = db as unknown as ClientFirestore;
      await cdb.collection('orders').doc(order.id).set(data);
    }
  } catch (err) {
    console.warn('[db] createOrder failed:', err);
  }
}

/** Update partial fields on an order. */
export async function updateOrder(orderId: string, patch: Partial<OrderDoc>): Promise<void> {
  try {
    const adminDb = getAdminDb();
    if (adminDb) {
      await adminDb.collection('orders').doc(orderId).update(patch);
      return;
    }
    if (isFirebaseConfigured && db) {
      const cdb = db as unknown as ClientFirestore;
      await cdb.collection('orders').doc(orderId).update(patch as unknown as Record<string, unknown>);
    }
  } catch (err) {
    console.warn('[db] updateOrder failed:', err);
  }
}

/** Look up an order by its Bachs checkout id (webhook fulfilment). */
export async function findOrderByCheckoutId(checkoutId: string): Promise<OrderDoc | null> {
  try {
    const adminDb = getAdminDb();
    const snap = adminDb
      ? ((await adminDb
          .collection('orders')
          .where('checkoutId', '==', checkoutId)
          .limit(1)
          .get()) as unknown as Snap)
      : isFirebaseConfigured && db
        ? ((await (db as unknown as ClientFirestore)
            .collection('orders')
            .where('checkoutId', '==', checkoutId)
            .limit(1)
            .get()) as unknown as Snap)
        : null;
    if (!snap || snap.empty) return null;
    const d = snap.docs[0];
    return {id: d.id, ...(d.data() as Omit<OrderDoc, 'id'>)};
  } catch (err) {
    console.warn('[db] findOrderByCheckoutId failed:', err);
  }
  return null;
}

/** Issue tickets for a paid order (deterministic ids, idempotent per order). */
export async function issueTicketsForOrder(order: OrderDoc): Promise<void> {
  try {
    const adminDb = getAdminDb();
    for (let i = 0; i < order.quantity; i++) {
      const ticketId = `${order.id}-t${i + 1}`;
      const ticket = {
        id: ticketId,
        orderId: order.id,
        eventId: order.eventId,
        eventTitle: order.eventTitle,
        holderName: order.buyer.name,
        buyerEmail: order.buyer.email,
        code: `TKT-${order.id.toUpperCase().slice(0, 8)}-${i + 1}`,
        status: 'active' as const,
        createdAt: now(),
      };
      if (adminDb) {
        await adminDb.collection('tickets').doc(ticketId).set(ticket);
      } else if (isFirebaseConfigured && db) {
        await (db as unknown as ClientFirestore).collection('tickets').doc(ticketId).set(ticket);
      }
    }
  } catch (err) {
    console.warn('[db] issueTicketsForOrder failed:', err);
  }
}

/** All tickets purchased by a given buyer email (attendee wallet). */
export async function getTicketsForEmail(email: string): Promise<TicketDoc[]> {
  try {
    const adminDb = getAdminDb();
    const snap = adminDb
      ? ((await adminDb.collection('tickets').where('buyerEmail', '==', email).get()) as unknown as Snap)
      : isFirebaseConfigured && db
        ? ((await (db as unknown as ClientFirestore)
            .collection('tickets')
            .where('buyerEmail', '==', email)
            .get()) as unknown as Snap)
        : null;
    if (!snap) return [];
    return snap.docs.map((d) => ({id: d.id, ...(d.data() as Omit<TicketDoc, 'id'>)}));
  } catch (err) {
    console.warn('[db] getTicketsForEmail failed:', err);
    return [];
  }
}

/** All orders placed by a given email. */
export async function getOrdersForEmail(email: string): Promise<OrderDoc[]> {
  try {
    const adminDb = getAdminDb();
    const snap = adminDb
      ? ((await adminDb
          .collection('orders')
          .where('buyer.email', '==', email)
          .orderBy('createdAt', 'desc')
          .get()) as unknown as Snap)
      : isFirebaseConfigured && db
        ? ((await (db as unknown as ClientFirestore)
            .collection('orders')
            .where('buyer.email', '==', email)
            .orderBy('createdAt', 'desc')
            .get()) as unknown as Snap)
        : null;
    if (!snap) return [];
    return snap.docs.map((d) => ({id: d.id, ...(d.data() as Omit<OrderDoc, 'id'>)}));
  } catch (err) {
    console.warn('[db] getOrdersForEmail failed:', err);
    return [];
  }
}
