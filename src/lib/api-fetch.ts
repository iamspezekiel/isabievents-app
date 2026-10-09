'use client';

/**
 * fetch() that attaches the current Firebase ID token so API routes can
 * verify the caller (admin/operator endpoints). Server-only routes without
 * auth checks are unaffected.
 */
import {auth} from '@/lib/firebase';

export async function apiFetch(input: string, init: RequestInit = {}): Promise<Response> {
  let token: string | null = null;
  try {
    token = auth?.currentUser ? await auth.currentUser.getIdToken() : null;
  } catch {
    token = null;
  }
  return fetch(input, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? {Authorization: `Bearer ${token}`} : {}),
      ...(init.headers || {}),
    },
  });
}
