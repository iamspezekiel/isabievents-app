/**
 * Client-side data layer — browser-safe (NO firebase-admin import, so it can
 * be bundled into 'use client' pages). Server code should use `@/lib/db`.
 *
 * IMPORTANT: `src/lib/firebase.ts` initializes the MODULAR client SDK
 * (`getFirestore`), whose Firestore object has no instance methods — reads use
 * the standalone modular functions (`collection`, `doc`, `getDocs`, `getDoc`,
 * `query`, …). The instance-method API (`.collection().get()`) only exists on
 * the compat/admin SDKs and throws "cdb.collection is not a function" here.
 *
 * Reads resolve through the Firebase client SDK and fall back to empty
 * results when Firebase is not configured.
 */
import {db, isFirebaseConfigured} from '@/lib/firebase';
import {normalizeEmail} from '@/lib/emails';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import type {EventDoc, OrderDoc, TicketDoc} from './db-types';
export type {EventDoc, OrderDoc, TicketDoc} from './db-types';

/** Guard: only run against the live client Firestore when configured. */
function client() {
  return isFirebaseConfigured && db ? db : null;
}

/** Reads all events (browser). */
export async function getEvents(opts: {throwOnError?: boolean} = {}): Promise<EventDoc[]> {
  try {
    const cdb = client();
    if (!cdb) return [];
    const snap = await getDocs(collection(cdb, 'events'));
    if (snap.empty) return [];
    return snap.docs.map((d) => ({id: d.id, ...(d.data() as Omit<EventDoc, 'id'>)})) as EventDoc[];
  } catch (err) {
    console.warn('[client-db] getEvents failed:', err);
    // By default a read failure is treated as "no events" so a single blip never
    // crashes a page. Callers that need to distinguish failure from empty (the
    // shared useEvents feed) pass throwOnError to trigger a retry instead of
    // silently rendering an empty state.
    if (opts.throwOnError) throw err;
    return [];
  }
}

/** Find a single event by document id or slug (browser). */
export async function getEvent(idOrSlug: string): Promise<EventDoc | null> {
  try {
    const cdb = client();
    if (!cdb) return null;
    // 1) Try it as a document id.
    const snap = await getDoc(doc(cdb, 'events', idOrSlug));
    if (snap.exists()) return {id: snap.id, ...(snap.data() as Omit<EventDoc, 'id'>)} as EventDoc;
    // 2) Fall back to a slug lookup.
    const all = await getEvents();
    return all.find((e) => e.slug === idOrSlug) ?? null;
  } catch (err) {
    console.warn('[client-db] getEvent failed:', err);
  }
  return null;
}

/** All tickets purchased by a given buyer email (browser). */
export async function getTicketsForEmail(email: string): Promise<TicketDoc[]> {
  // Normalized to match how `buyerEmail` is stored — otherwise a buyer who
  // typed their address in mixed case would load an empty wallet.
  const owner = normalizeEmail(email);
  if (!owner) return [];
  try {
    const cdb = client();
    if (!cdb) return [];
    const snap = await getDocs(query(collection(cdb, 'tickets'), where('buyerEmail', '==', owner)));
    if (snap.empty) return [];
    return snap.docs.map((d) => ({id: d.id, ...(d.data() as Omit<TicketDoc, 'id'>)}));
  } catch (err) {
    console.warn('[client-db] getTicketsForEmail failed:', err);
    return [];
  }
}

/** All orders placed by a given email (browser). */
export async function getOrdersForEmail(email: string): Promise<OrderDoc[]> {
  // `buyer.email` is stored normalized — match it the same way.
  const owner = normalizeEmail(email);
  if (!owner) return [];
  try {
    const cdb = client();
    if (!cdb) return [];
    const snap = await getDocs(
      query(
        collection(cdb, 'orders'),
        where('buyer.email', '==', owner),
        orderBy('createdAt', 'desc'),
        limit(100)
      )
    );
    if (snap.empty) return [];
    return snap.docs.map((d) => ({id: d.id, ...(d.data() as Omit<OrderDoc, 'id'>)}));
  } catch (err) {
    console.warn('[client-db] getOrdersForEmail failed:', err);
    return [];
  }
}