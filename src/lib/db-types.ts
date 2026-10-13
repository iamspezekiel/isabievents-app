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
  /** Start — naive Lagos wall-clock, e.g. "2026-03-14T18:00:00". */
  date: string;
  /** Optional end for multi-day events (defaults to `date`). Lagos wall-clock. */
  endDate?: string;
  organizer: {name: string; verified?: boolean; avatar?: string};
  image: string;
  description: string;
  summary?: string;
  policies?: string;
  tiers?: {name: string; price: number; refundable?: boolean}[];
  /**
   * Refund policy the organizer chose BEFORE sales open:
   *  - 'refundable'     → tickets may be cancelled until the deadline below
   *  - 'non_refundable' → tickets can never be cancelled (default / legacy)
   * Each ticket also snapshots its own eligibility at purchase time, so a
   * later policy edit can never take away eligibility that was already sold.
   */
  refundPolicy?: 'refundable' | 'non_refundable';
  /** Hours before the event starts when cancellation closes (0 = until start). */
  refundCutoffHours?: number;
  /**
   * Where "Get Tickets" sends visitors:
   *  - 'internal' (default): sell directly on IsabiEvents via Bachs checkout.
   *  - 'external': listed here, but payment happens on the organizer's platform.
   */
  ticketMode?: 'internal' | 'external';
  /** Original event/registration URL used when ticketMode === 'external'. */
  ticketUrl?: string;
  organizerUid?: string;
  organizerEmail?: string;
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
  /** Ticket type purchased (drives the per-tier refund policy snapshot). */
  tierName?: string;
  /** Refund snapshot captured when the order was placed (immutable). */
  refundable?: boolean;
  refundCutoffHours?: number;
  refundDeadline?: string;
  /** Tickets refunded against this order — the payment record is never deleted. */
  refundedTickets?: string[];
  refundedAmount?: number;
  paidAt?: string;
  createdAt?: unknown;
}

export type TicketStatus = 'active' | 'used' | 'transferred' | 'cancelled' | 'refunded';

export interface TicketDoc {
  id: string;
  orderId: string;
  eventId: string;
  eventTitle: string;
  holderName: string;
  buyerEmail: string;
  buyerUid?: string;
  code: string; // QR payload, e.g. TKT-<orderId short>
  /** 'cancelled' and 'refunded' tickets are refused at the gate. */
  status: TicketStatus;
  tierName?: string;
  /** Refund snapshot captured when the ticket was issued (immutable). */
  refundable?: boolean;
  refundCutoffHours?: number;
  refundDeadline?: string;
  cancelledAt?: string;
  refundedAt?: string;
  createdAt?: unknown;
}

export type RefundStatus = 'requested' | 'approved' | 'declined' | 'completed';

/**
 * Attendee refund/cancellation workflow — created by the attendee, reviewed by
 * an admin. Document id === ticketId, so duplicate requests are impossible.
 * Orders/payment records are only annotated, never deleted.
 */
export interface RefundDoc {
  id: string;
  ticketId: string;
  orderId: string;
  eventId: string;
  eventTitle: string;
  tierName?: string;
  holderName?: string;
  buyerEmail: string;
  buyerUid?: string;
  amount: number;
  currency: 'NGN' | 'USD';
  status: RefundStatus;
  /** Snapshot of the policy the ticket was sold under. */
  refundable: boolean;
  /** Absolute ISO deadline for this refund (event start − cutoff). */
  deadline: string;
  requestedAt: string;
  requestedNote?: string;
  decidedAt?: string;
  decidedBy?: string;
  note?: string;
  completedAt?: string;
}
