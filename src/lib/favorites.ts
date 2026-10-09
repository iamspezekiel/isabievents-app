'use client';

/** localStorage-backed event favorites (device-local, no backend needed). */
const KEY = 'isabi_favorites';

export function getFavorites(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

/** Returns true when the id is now a favorite. */
export function toggleFavorite(id: string): boolean {
  const cur = getFavorites();
  const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage full/blocked — ignore */
  }
  return next.includes(id);
}

export function removeFavorite(id: string): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(getFavorites().filter((x) => x !== id)));
  } catch {
    /* ignore */
  }
}
