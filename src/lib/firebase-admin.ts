/**
 * Firebase Admin SDK initialization (server-only: used by API routes such as
 * the Bachs webhook so fulfilment does not depend on client state).
 *
 * Prefers `FIREBASE_SERVICE_ACCOUNT_KEY` (raw JSON, single line or pretty
 * printed) and falls back to Application Default Credentials (useful on
 * Firebase App Hosting where the runtime already has credentials).
 */
import {getApps, initializeApp, cert, type App} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';

let app: App | null = null;

function getAdminApp(): App | null {
  if (app) return app;
  if (getApps().length) {
    app = getApps()[0];
    return app;
  }

  try {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (serviceAccount) {
      const json = JSON.parse(serviceAccount);
      app = initializeApp({credential: cert(json)});
      return app;
    }

    // Application Default Credentials (GOOGLE_APPLICATION_CREDENTIALS / ADC).
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.FIREBASE_CONFIG) {
      app = initializeApp();
      return app;
    }
  } catch (err) {
    console.error('[firebase-admin] initialization failed:', err);
  }

  return null;
}

/** Returns the Admin Auth instance, or null when no server credentials exist. */
export function getAdminAuth() {
  const adminApp = getAdminApp();
  return adminApp ? getAuth(adminApp) : null;
}

/** Returns the Admin Firestore instance, or null when no server credentials exist. */
export function getAdminDb() {
  const adminApp = getAdminApp();
  return adminApp ? getFirestore(adminApp) : null;
}

/** True when server-side Firebase credentials are configured. */
export const isAdminConfigured = () => getAdminApp() !== null;
