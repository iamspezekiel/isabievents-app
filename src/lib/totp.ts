/**
 * TOTP (Time-based One-Time Password) — RFC 6238, the algorithm behind
 * Google Authenticator / Authy / 1Password. Implemented with Node's crypto so
 * no extra dependency is needed. Digits: 6, period: 30s, algorithm: SHA-1
 * (the defaults every authenticator app expects).
 */
import {createHmac, randomBytes, timingSafeEqual} from 'crypto';

const B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

/** Base32-encode raw bytes (RFC 4648, no padding — what authenticators want). */
export function base32Encode(buf: Buffer): string {
  let bits = 0;
  let value = 0;
  let out = '';
  for (const byte of buf) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += B32[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += B32[(value << (5 - bits)) & 31];
  return out;
}

/** Base32-decode a secret string back to bytes. */
export function base32Decode(s: string): Buffer {
  const clean = s.toUpperCase().replace(/=+$/, '').replace(/\s+/g, '');
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (const ch of clean) {
    const idx = B32.indexOf(ch);
    if (idx === -1) continue; // ignore spaces/invalid
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(out);
}

/** Generate a fresh 20-byte (160-bit) base32 secret — the standard length. */
export function generateTotpSecret(): string {
  return base32Encode(randomBytes(20));
}

/** otpauth:// URI that authenticator apps scan or parse. */
export function otpauthUri(secret: string, account: string, issuer = 'IsabiEvents'): string {
  const label = encodeURIComponent(`${issuer}:${account}`);
  const params = new URLSearchParams({
    secret,
    issuer,
    algorithm: 'SHA1',
    digits: '6',
    period: '30',
  });
  return `otpauth://totp/${label}?${params.toString()}`;
}

/** Compute the 6-digit TOTP for a secret at a given time (default: now). */
export function totpCode(secret: string, atMs = Date.now()): string {
  const counter = Math.floor(atMs / 30000);
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64BE(BigInt(counter));
  const hmac = createHmac('sha1', base32Decode(secret)).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0xf;
  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);
  return String(binary % 1_000_000).padStart(6, '0');
}

/**
 * Verify a user-supplied code. Accepts the current step plus/minus one (clock
 * drift), which is what every mainstream authenticator expects.
 */
export function verifyTotp(secret: string, code: string): boolean {
  const clean = String(code || '').replace(/\D/g, '');
  if (clean.length !== 6) return false;
  const now = Date.now();
  for (const step of [-30000, 0, 30000]) {
    const expected = totpCode(secret, now + step);
    const a = Buffer.from(expected);
    const b = Buffer.from(clean);
    if (a.length === b.length && timingSafeEqual(a, b)) return true;
  }
  return false;
}
