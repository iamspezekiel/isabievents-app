/**
 * Bachs payments server client.
 *
 * Docs: https://docs.bachs.io
 *  - Sandbox base URL: https://sandbox-api.bachs.io (sk_sandbox_ keys)
 *  - Live base URL:    https://api.bachs.io        (sk_live_ keys)
 *  - Auth:             Authorization: Bearer <key>
 *  - Money format:     decimal string at currency precision ("5000.00") + ISO 4217
 *
 * Set BACHS_API_KEY in the environment to enable real checkouts; without it
 * the checkout route falls back to the built-in demo flow.
 */

export type BachsCurrency = 'NGN' | 'USD';

export const isBachsConfigured = () => Boolean(process.env.BACHS_API_KEY);

function baseUrl(): string {
  const key = process.env.BACHS_API_KEY || '';
  return key.startsWith('sk_live_') ? 'https://api.bachs.io' : 'https://sandbox-api.bachs.io';
}

async function bachsFetch(path: string, init?: RequestInit): Promise<Response> {
  return fetch(`${baseUrl()}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${process.env.BACHS_API_KEY}`,
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });
}

export interface CreateCheckoutSessionParams {
  /** Raw amount as a decimal string, e.g. "5000.00". */
  amount: string;
  currency: BachsCurrency;
  customer: {email: string; name: string};
  successUrl: string;
  cancelUrl: string;
  /** Restrict payment corridors; defaults to NGN/USD card + NGN bank transfer. */
  paymentMethodTypes?: string[];
}

export interface CreateCheckoutSessionResult {
  checkout_id: string;
  checkout_url: string;
  status: string;
  expires_at?: string;
}

/**
 * Creates a hosted checkout session for a raw amount.
 * POST /v1/checkout-sessions with `pricing` (no product catalog needed).
 */
export async function createCheckoutSession(
  params: CreateCheckoutSessionParams
): Promise<CreateCheckoutSessionResult> {
  const body = {
    pricing: {amount: params.amount, currency: params.currency},
    customer: params.customer,
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    payment_method_types:
      params.paymentMethodTypes ??
      (params.currency === 'USD'
        ? ['USD_CARD']
        : ['NGN_CARD', 'NGN_BANK_TRANSFER']),
  };

  const res = await bachsFetch('/v1/checkout-sessions', {
    method: 'POST',
    body: JSON.stringify(body),
  });

  const raw = await res.text();
  let json: Record<string, unknown> = {};
  try {
    json = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    /* non-JSON error body — keep raw */
  }
  if (!res.ok) {
    const err = json.error as {message?: string; code?: string} | undefined;
    const message =
      (json.message as string) ||
      err?.message ||
      err?.code ||
      (raw ? raw.slice(0, 300) : '') ||
      `Bachs error (${res.status})`;
    throw new Error(message);
  }
  return json as unknown as CreateCheckoutSessionResult;
}

export interface CheckoutSessionStatus {
  checkout_id: string;
  status: string; // e.g. "open" | "completed" | "expired"
  payment_id?: string;
  [key: string]: unknown;
}

/** GET /v1/checkout-sessions/{id} — used after the success redirect to confirm. */
export async function getCheckoutSession(checkoutId: string): Promise<CheckoutSessionStatus> {
  const res = await bachsFetch(`/v1/checkout-sessions/${encodeURIComponent(checkoutId)}`);
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = json?.message || json?.error?.message || `Bachs error (${res.status})`;
    throw new Error(message);
  }
  return json as CheckoutSessionStatus;
}

/**
 * Verifies an X-Bachs-Signature webhook header.
 *
 * Bachs signs `"{X-Bachs-Timestamp}.{rawBody}"` with HMAC-SHA256 (hex) using
 * the endpoint's signing secret (BACHS_WEBHOOK_SECRET).
 */
export function verifyBachsSignature(
  rawBody: string,
  signatureHeader: string | null,
  timestampHeader: string | null,
  secret: string,
  toleranceSeconds = 60 * 5
): boolean {
  if (!signatureHeader || !timestampHeader || !secret) return false;

  const ts = Number(timestampHeader);
  if (!Number.isFinite(ts)) return false;
  const age = Math.abs(Math.floor(Date.now() / 1000) - ts);
  if (age > toleranceSeconds) return false; // replay protection

  return timingSafeEqualHex(computeHmacHex(`${ts}.${rawBody}`, secret), signatureHeader);
}

function computeHmacHex(payload: string, secret: string): string {
  // Use Node's crypto (available in Next.js route handlers / node runtime).
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const {createHmac} = require('crypto') as typeof import('crypto');
  return createHmac('sha256', secret).update(payload, 'utf8').digest('hex');
}

/** Constant-time comparison for hex signatures. */
function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}
