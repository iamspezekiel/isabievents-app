'use client';

/**
 * Event favorites — SAVED TO THE DATABASE (`favorites/{uid}` via
 * /api/favorites), never to localStorage. Every read goes straight to
 * Firestore, so a favorite saved on one device shows up on every device. The
 * old browser-local list is migrated into the database on first read and the
 * local copy is then deleted.
 */
import {apiFetch} from '@/lib/api-fetch';

const LEGACY_KEY = 'isabi_favorites';

function readLegacyIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LEGACY_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function dropLegacyIds() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(LEGACY_KEY);
  } catch {
    /* ignore */
  }
}

/** POSTs an update and returns the caller's full, fresh favorites list. */
async function save(body: Record<string, unknown>): Promise<string[]> {
  const res = await apiFetch('/api/favorites', {method: 'POST', body: JSON.stringify(body)});
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data?.error) {
    throw new Error(
      res.status === 401 || /unauthorized/i.test(String(data?.error || ''))
        ? 'Please sign in to save favorites to your account.'
        : String(data?.error || 'Could not save your favorites.')
    );
  }
  return Array.isArray(data.favorites) ? (data.favorites as string[]) : [];
}

/** The signed-in user's favorites, read fresh from the database. */
export async function getFavorites(): Promise<string[]> {
  try {
    const res = await apiFetch('/api/favorites');
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data?.error) throw new Error(String(data?.error || 'Failed to load favorites.'));
    let ids = Array.isArray(data.favorites) ? (data.favorites as string[]) : [];

    // One-time migration: push the legacy device-local list into the database
    // (only when we actually reached the database), then delete the local copy.
    const legacy = readLegacyIds();
    if (legacy.length) {
      ids = await save({ids: legacy});
      dropLegacyIds();
    }
    return ids;
  } catch {
    return [];
  }
}

/** Saves (or unsaves) an event on the account. Resolves to the new state. */
export async function toggleFavorite(id: string): Promise<boolean> {
  const ids = await save({eventId: id, action: 'toggle'});
  return ids.includes(id);
}

/** Removes an event from the account's favorites. */
export async function removeFavorite(id: string): Promise<void> {
  await save({eventId: id, action: 'remove'});
}

