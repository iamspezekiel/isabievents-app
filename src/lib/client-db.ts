/**
 * Client-side data layer — browser-safe (NO firebase-admin import, so it can
 * be bundled into 'use client' pages). Server code should use `@/lib/db`.
 *
 * Reads resolve through the Firebase client SDK and fall back to empty
 * results when Firebase is not configured.
 */
import {db, isFirebaseConfigured} from '@/lib/firebase';
import type {EventDoc, OrderDoc, TicketDoc} from './db-types';
export type {EventDoc, OrderDoc, TicketDoc} from './db-types';

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
  get(): Promise<ClientDocSnap>;
}

interface ClientCollection {
  doc(id: string): ClientDocRef;
  where(field: string, op: string, value: unknown): ClientCollection;
  orderBy(field: string, dir?: 'asc' | 'desc'): ClientCollection;
  limit(n: number): ClientCollection;
  get(): Promise<Snap>;
}

/** Structural view of the client SDK's instance-method API (see @/lib/db). */
interface ClientFirestore {
  collection(path: string): ClientCollection;
}

function client(): ClientFirestore | null {
  return isFirebaseConfigured && db ? (db as unknown as ClientFirestore) : null;
}

/** Reads all events (browser). */
export async function getEvents(): Promise<EventDoc[]> {
  try {
    const cdb = client();
    if (!cdb) return [];
    const snap = (await cdb.collection('events').get()) as unknown as Snap;
    if (snap.empty) return [];
    return snap.docs.map((d) => ({id: d.id, ...d.data()})) as EventDoc[];
  } catch (err) {
    console.warn('[client-db] getEvents failed:', err);
    return [];
  }
}

/** Find a single event by document id or slug (browser). */
export async function getEvent(idOrSlug: string): Promise<EventDoc | null> {
  try {
    const cdb = client();
    if (!cdb) return null;
    const snap = await cdb.collection('events').doc(idOrSlug).get();
    if (snap.exists) return {id: snap.id, ...snap.data()} as EventDoc;
    const all = await getEvents();
    return all.find((e) => e.slug === idOrSlug) ?? null;
  } catch (err) {
    console.warn('[client-db] getEvent failed:', err);
  }
  return null;
}

/** All tickets purchased by a given buyer email (browser). */
export async function getTicketsForEmail(email: string): Promise<TicketDoc[]> {
  try {
    const cdb = client();
    if (!cdb) return [];
    const snap = await cdb.collection('tickets').where('buyerEmail', '==', email).get();
    if (snap.empty) return [];
    return snap.docs.map((d) => ({id: d.id, ...(d.data() as Omit<TicketDoc, 'id'>)}));
  } catch (err) {
    console.warn('[client-db] getTicketsForEmail failed:', err);
    return [];
  }
}

/** All orders placed by a given email (browser). */
export async function getOrdersForEmail(email: string): Promise<OrderDoc[]> {
  try {
    const cdb = client();
    if (!cdb) return [];
    const snap = await cdb
      .collection('orders')
      .where('buyer.email', '==', email)
      .orderBy('createdAt', 'desc')
      .get();
    if (snap.empty) return [];
    return snap.docs.map((d) => ({id: d.id, ...(d.data() as Omit<OrderDoc, 'id'>)}));
  } catch (err) {
    console.warn('[client-db] getOrdersForEmail failed:', err);
    return [];
  }
}