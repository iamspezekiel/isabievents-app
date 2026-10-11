import {timingSafeEqual} from 'crypto';

/**
 * Resolve an API key to its owner's uid. Returns null when the key is invalid.
 * Used by the public /api/v1 routes for `Authorization: Bearer sk_live_…`.
 */
export async function resolveApiKey(raw: string | null | undefined): Promise<string | null> {
  const key = String(raw || '').replace(/^Bearer\s+/i, '').trim();
  if (!key || !key.startsWith('sk_live_')) return null;
  const {getAdminDb} = await import('@/lib/firebase-admin');
  const db = getAdminDb();
  if (!db) return null;
  const snap = await db.collection('users').where('apiKey', '==', key).limit(1).get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  const stored = (doc.data() as {apiKey?: string}).apiKey || '';
  const a = Buffer.from(stored);
  const b = Buffer.from(key);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return doc.id;
}
