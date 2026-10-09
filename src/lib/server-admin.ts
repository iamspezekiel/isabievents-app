/**
 * Lazy accessor for the Firebase Admin SDK module (server-only).
 *
 * IMPORTANT — do NOT statically `import … from '@/lib/firebase-admin'` in API
 * routes: a static import evaluates the firebase-admin SDK at module load,
 * which crashes Vercel serverless functions at cold start (empty 500 served
 * from the platform's static error page). Loading it inside the handler — as
 * the Bachs webhook already does — keeps cold starts safe and turns any
 * failure into a readable JSON error.
 */
let cached: typeof import('@/lib/firebase-admin') | null = null;

export async function admin(): Promise<typeof import('@/lib/firebase-admin')> {
  if (!cached) {
    cached = await import('@/lib/firebase-admin');
  }
  return cached;
}
