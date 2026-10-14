/**
 * Platform fee configuration + pure fee math.
 *
 * The admin-configured rate lives in Firestore `settings/app.platformFee`
 * (a percentage of every paid ticket). Each order snapshots the rate in effect
 * at sale time, so changing the setting never rewrites past earnings.
 */
import {admin} from '@/lib/server-admin';

export const DEFAULT_PLATFORM_FEE_PERCENT = 2.5;

export interface FeeSplit {
  feePercent: number;
  feeAmount: number;
  netAmount: number;
}

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

/** Clamp a fee percentage to 0–100 (invalid input falls back to the default). */
export function clampFeePercent(value: unknown): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return DEFAULT_PLATFORM_FEE_PERCENT;
  return Math.min(100, Math.max(0, n));
}

/** Pure: split a gross amount into the platform fee and the organizer's net. */
export function feeOf(amount: number, feePercent: number): FeeSplit {
  const gross = Number.isFinite(amount) ? Math.max(0, amount) : 0;
  const pct = clampFeePercent(feePercent);
  const feeAmount = round2((gross * pct) / 100);
  const netAmount = round2(gross - feeAmount);
  return {feePercent: pct, feeAmount, netAmount};
}

/**
 * Live platform fee percent: the admin `settings/app` value when present,
 * then the PLATFORM_FEE_PERCENT env fallback, then the built-in default.
 */
export async function getPlatformFeePercent(): Promise<number> {
  let pct = clampFeePercent(process.env.PLATFORM_FEE_PERCENT);
  try {
    const {getAdminDb} = await admin();
    const db = getAdminDb();
    if (db) {
      const snap = await db.collection('settings').doc('app').get();
      if (snap.exists) {
        const raw = (snap.data() as {platformFee?: unknown}).platformFee;
        if (raw !== undefined && raw !== null && raw !== '') pct = clampFeePercent(raw);
      }
    }
  } catch (err) {
    console.warn('[fees] could not read platform fee, using fallback:', err);
  }
  return pct;
}
