/**
 * Shared Firestore document types — pure types with NO runtime imports, so
 * both the server data layer (`@/lib/db`) and the browser data layer
 * (`@/lib/client-db`) can import them safely.
 */

export type OrderStatus = 'pending' | 'paid' | 'failed' | 'refunded';

/** Event document shape stored in the `events` collection (Firestore). */
export interface EventDoc {
  id: string;
  slug?: string;
  title: string;
  category: string;
  city: string;
  venue: string;
  date: string;
  organizer: {name: string; verified?: boolean; avatar?: string};
  image: string;
  description: string;
  price: {min: number; max: number};
  inventory?: number;
  tags: string[];
  [key: string]: unknown;
}

export interface OrderDoc {
  id: string;
  eventId: string;
  eventSlug: string;
  eventTitle: string;
  quantity: number;
  unitPrice: number;
  amount: number;
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
