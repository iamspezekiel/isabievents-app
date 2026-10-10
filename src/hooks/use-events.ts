'use client';

/**
 * Shared Firestore events feed for client pages (production data — no mock
 * fallback). Results are cached briefly for the session; call `refetch()` to
 * reload. The cache expires after 30s and refreshes on tab focus so a stale
 * session can never hide newly added events. Events are returned soonest-
 * upcoming first (past events last) so real, live events always surface.
 */
import {useCallback, useEffect, useState} from 'react';
import {getEvents, type EventDoc} from '@/lib/client-db';

const CACHE_TTL_MS = 30_000;

let cache: EventDoc[] | null = null;
let cachedAt = 0;
let inflight: Promise<EventDoc[]> | null = null;

/** Upcoming events ascending, then past events most-recent-first. */
function bySoonestFirst(a: EventDoc, b: EventDoc): number {
  const ta = new Date(a.date).getTime() || 0;
  const tb = new Date(b.date).getTime() || 0;
  const now = Date.now();
  const aPast = ta < now;
  const bPast = tb < now;
  if (aPast !== bPast) return aPast ? 1 : -1;
  return aPast ? tb - ta : ta - tb;
}

function load(): Promise<EventDoc[]> {
  if (cache && Date.now() - cachedAt < CACHE_TTL_MS) return Promise.resolve(cache);
  if (!inflight) {
    inflight = getEvents()
      .then((rows) => {
        const sorted = [...rows].sort(bySoonestFirst);
        cache = sorted;
        cachedAt = Date.now();
        return sorted;
      })
      .catch((err) => {
        inflight = null;
        throw err;
      });
  }
  return inflight;
}

export function useEvents() {
  const [events, setEvents] = useState<EventDoc[]>(() => cache ?? []);
  const [loading, setLoading] = useState(cache === null);

  const refresh = useCallback(() => {
    // Re-fetch (bypassing the TTL) and update every mounted consumer.
    cache = null;
    cachedAt = 0;
    inflight = null;
    return load()
      .then((rows) => setEvents(rows))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    let alive = true;
    load()
      .then((rows) => {
        if (alive) {
          setEvents(rows);
          setLoading(false);
        }
      })
      .catch(() => {
        if (alive) setLoading(false);
      });

    // Re-check when the tab regains focus so a previously failed/empty load
    // (e.g. before Firestore rules were deployed) heals without a reload.
    const onFocus = () => {
      if (!cache || Date.now() - cachedAt >= CACHE_TTL_MS) refresh();
    };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);
    return () => {
      alive = false;
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
    };
  }, [refresh]);

  const refetch = useCallback(() => {
    cache = null;
    inflight = null;
    setLoading(true);
    return load()
      .then((rows) => {
        setEvents(rows);
        setLoading(false);
        return rows;
      })
      .catch((err) => {
        setLoading(false);
        throw err;
      });
  }, []);

  return {events, loading, refetch};
}