import {NextResponse} from 'next/server';

export const runtime = 'nodejs';

/**
 * GET /api/health/firebase — server-side Firebase Admin diagnostics.
 * Exposes NO secrets (only presence flags + lengths) — used to distinguish
 * "env var missing" from "module failed to load" from production issues.
 */
export async function GET() {
  const envHasKey = Boolean(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  const report: Record<string, unknown> = {
    node: process.version,
    envHasKey,
    envKeyLength: (process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '').length,
    envHasGoogleAppCredentials: Boolean(process.env.GOOGLE_APPLICATION_CREDENTIALS),
  };
  try {
    const mod = await import('@/lib/firebase-admin');
    report.moduleLoaded = true;
    report.configured = mod.isAdminConfigured();
    report.authReady = Boolean(mod.getAdminAuth());
    report.dbReady = Boolean(mod.getAdminDb());
  } catch (err) {
    report.moduleLoaded = false;
    report.moduleError = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
  }
  return NextResponse.json(report);
}
