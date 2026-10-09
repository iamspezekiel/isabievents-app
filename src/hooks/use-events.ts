'use client';

/**
 * Shared Firestore events feed for client pages (production data — no mock
 * fallback). Results are cached for the session; call `refetch()` to reload.
 */
import {useCallback, useEffect, useState} from 'react';
import {getEvents, type EventDoc} from '@/lib/client-db';

let cache: EventDoc[] | null = null;
let inflight: Promise<EventDoc[]> | null = null;

function load(): Promise<EventDoc[]> {
  if (cache) return Promise.resolve(cache);
  if (!inflight) {
    inflight = getEvents()
      .then((rows) => {
        cache = rows;
        return rows;
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
    return () => {
      alive = false;
    };
  }, []);

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