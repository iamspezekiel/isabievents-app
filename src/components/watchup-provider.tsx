'use client';

/**
 * WatchUp error tracking (https://watchup.site) integration.
 *
 * Wraps the app with the official `watchup-react` SDK, which:
 *  - authenticates against WatchUp on mount (POST /system/sdk/auth)
 *  - captures global runtime errors, unhandled promise rejections,
 *    and React render errors (POST /v1/capture)
 *  - fails silently if the backend is unreachable
 *
 * Activates only when NEXT_PUBLIC_WATCHUP_PROJECT + NEXT_PUBLIC_WATCHUP_KEY
 * are set in .env — otherwise the app renders untouched (no network calls).
 */
import React from 'react';
import { WatchupProvider as SdkWatchupProvider } from 'watchup-react';

const projectId = process.env.NEXT_PUBLIC_WATCHUP_PROJECT;
const apiKey = process.env.NEXT_PUBLIC_WATCHUP_KEY;
const baseUrl = process.env.NEXT_PUBLIC_WATCHUP_BASE_URL || 'https://watchup.space';

/** True when WatchUp credentials are configured. */
export const isWatchupConfigured = Boolean(projectId && apiKey);

export function WatchupProvider({ children }: { children: React.ReactNode }) {
  if (!isWatchupConfigured) {
    return <>{children}</>;
  }

  return (
    <SdkWatchupProvider projectId={projectId!} apiKey={apiKey!} baseUrl={baseUrl}>
      {children}
    </SdkWatchupProvider>
  );
}
