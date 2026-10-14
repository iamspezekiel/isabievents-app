/**
 * Money math shared by every revenue / analytics / withdrawal surface so the
 * figures always agree: gross (buyer-paid), platform fee, and organizer net —
 * all refund-adjusted and convertible to NGN.
 *
 * Pure module (no server-only imports) so it can be reused anywhere.
 */
import type {OrderDoc} from './db-types';
import {feeOf} from './fees';

/** Display/aggregation rate used throughout the app. */
export const NGN_PER_USD = 1550;

export interface OrderFinancials {
  /** Refund-adjusted amounts in the order's own currency. */
  gross: number;
  fee: number;
  net: number;
  /** Same figures converted to NGN (USD × NGN_PER_USD). */
  grossNgn: number;
  feeNgn: number;
  netNgn: number;
}

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

/**
 * Fee/net split for a single order, excluding any refunded portion. A fully
 * refunded order yields zeros (its `refundedAmount` equals its `amount`), so
 * refunds — and their platform fees — drop out of every aggregate.
 */
export function orderFinancials(order: OrderDoc, fallbackFeePercent: number): OrderFinancials {
  const amount = Number(order.amount) || 0;
  const refunded = Math.max(0, Number(order.refundedAmount) || 0);
  const ratio = amount > 0 ? Math.min(1, Math.max(0, (amount - refunded) / amount)) : 1;

  const feeAmount =
    typeof order.feeAmount === 'number'
      ? order.feeAmount
      : feeOf(amount, order.feePercent ?? fallbackFeePercent).feeAmount;
  const netAmount = typeof order.netAmount === 'number' ? order.netAmount : amount - feeAmount;

  const rate = order.currency === 'USD' ? NGN_PER_USD : 1;
  const gross = round2(amount * ratio);
  const fee = round2(feeAmount * ratio);
  const net = round2(netAmount * ratio);
  return {
    gross,
    fee,
    net,
    grossNgn: round2(gross * rate),
    feeNgn: round2(fee * rate),
    netNgn: round2(net * rate),
  };
}
