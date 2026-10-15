/**
 * Email normalization — the single rule for every email we persist or compare.
 *
 * Why this is load-bearing: ticket ownership is enforced twice over. Firestore
 * rules compare the signed-in account's email against the ticket document, and
 * the wallet/API lookups do an equality match on `buyerEmail`. Firestore
 * equality is case-SENSITIVE, while checkout lets people type their address in
 * any case and Firebase Auth always reports it lowercased. So without
 * normalizing at write time, a buyer who typed `Ada@Example.com` could never
 * load the tickets they paid for.
 *
 * Invariant: `tickets.buyerEmail`, `refunds.buyerEmail` and `orders.buyer.email`
 * are all stored via `normalizeEmail()`, and every lookup normalizes its input
 * the same way. Legacy mixed-case documents are fixed once by
 * `npm run backfill:emails`.
 */
export function normalizeEmail(email?: string | null): string {
  return String(email ?? '').trim().toLowerCase();
}
