'use client';

/**
 * Shared Firestore events feed for client pages — REAL DATA ONLY.
 *
 * There is no module-level cache, TTL or in-memory reuse: every mount reads
 * straight from Firestore, and the feed is silently re-read from the database
 * whenever the tab regains focus so a save made elsewhere shows up without a
 * manual reload. `refetch()` forces a fresh read on demand. No mock events
 * are ever substituted — an unavailable database yields an empty list plus
 * the `error` flag for the UI to render.
 */
import {useCallback, useEffect, useMemo, useState} from 'react';
import {getEvents, type EventDoc} from '@/lib/client-db';

type UseEventsOpts = {
  /** Include events hidden by moderation (admin/organizer/staff/attendee-ticket surfaces). */
  includeHidden?: boolean;
};

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

function fetchFromDatabase(attempts = 3): Promise<EventDoc[]> {
  // Surface read errors (don't swallow → empty) so a transient Firestore blip
  // retries instead of silently rendering a blank page. Backoff between tries.
  const run = (n: number): Promise<EventDoc[]> =>
    getEvents({throwOnError: true}).catch((err) => {
      if (n <= 1) throw err;
      return new Promise((res) => setTimeout(res, 400 * (4 - n))).then(() => run(n - 1));
    });
  return run(attempts);
}

/**
 * Kept for API compatibility with callers that used to bust the old cache.
 * The feed no longer caches anything — every read goes to Firestore.
 */
export function invalidateEventsCache() {
  /* no cache to invalidate */
}

export function useEvents(opts?: UseEventsOpts) {
  const [all, setAll] = useState<EventDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  /** Reads the events collection. `silent` skips the loading spinner (tab focus). */
  const reload = useCallback((silent = false): Promise<EventDoc[]> => {
    if (!silent) setLoading(true);
    return fetchFromDatabase()
      .then((rows) => {
        const sorted = [...rows].sort(bySoonestFirst);
        setAll(sorted);
        setError(false);
        if (!silent) setLoading(false);
        return sorted;
      })
      .catch((err) => {
        setError(true);
        if (!silent) setLoading(false);
        throw err;
      });
  }, []);

  // Fresh read from the database on every mount.
  useEffect(() => {
    reload().catch(() => undefined);
  }, [reload]);

  // Re-read from the database whenever the tab regains focus, so edits saved
  // elsewhere (another tab, the admin console) appear without a reload.
  useEffect(() => {
    const onFocus = () => {
      reload(true).catch(() => undefined);
    };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
    };
  }, [reload]);

  const refetch = useCallback(
    () => reload().finally(() => setLoading(false)),
    [reload]
  );

  // Moderation: events rejected by the admin are hidden from public surfaces.
  const includeHidden = !!opts?.includeHidden;
  const events = useMemo(
    () => (includeHidden ? all : all.filter((e) => e?.organizer?.verified !== false)),
    [all, includeHidden]
  );

  return {events, loading, error, refetch};
}
