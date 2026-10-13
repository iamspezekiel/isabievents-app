/**
 * Cookie consent state — shared by the banner, the footer "Cookie Settings"
 * button and any future analytics/marketing scripts.
 *
 * The choice is stored ONLY in a first-party cookie (`isabi_cookie_consent`) —
 * nothing is ever written to localStorage/sessionStorage. The cookie survives
 * cleared browser storage and can be read server-side.
 *
 * Values: 'all' | 'essential' | null (no decision yet).
 */

export const CONSENT_COOKIE = 'isabi_cookie_consent';
/** Reopen event dispatched by the footer "Cookie Settings" control. */
export const OPEN_CONSENT_EVENT = 'isabi:open-cookie-consent';

export type ConsentValue = 'all' | 'essential';

export function getConsent(): ConsentValue | null {
  if (typeof window === 'undefined') return null;
  try {
    const match = document.cookie
      .split('; ')
      .find((row) => row.startsWith(`${CONSENT_COOKIE}=`));
    const v = match ? decodeURIComponent(match.split('=')[1] || '') : null;
    return v === 'all' || v === 'essential' ? v : null;
  } catch {
    return null;
  }
}

export function setConsent(value: ConsentValue): void {
  if (typeof window === 'undefined') return;
  // 180-day first-party cookie; SameSite=Lax + Secure on https.
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${CONSENT_COOKIE}=${value}; path=/; max-age=15552000; SameSite=Lax${secure}`;
}

/** Ask the banner to reopen (used by the footer settings link). */
export function openCookieConsent(): void {
  window.dispatchEvent(new CustomEvent(OPEN_CONSENT_EVENT));
}
