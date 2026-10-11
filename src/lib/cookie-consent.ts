/**
 * Cookie consent state — shared by the banner, the footer "Cookie Settings"
 * button and any future analytics/marketing scripts.
 *
 * The choice is stored in two places:
 *  - localStorage (fast client reads, used by the UI)
 *  - a first-party cookie (`isabi_cookie_consent`) so the preference also
 *    survives cleared storage and can be read server-side.
 *
 * Values: 'all' | 'essential' | null (no decision yet).
 */

export const CONSENT_COOKIE = 'isabi_cookie_consent';
export const CONSENT_STORAGE_KEY = 'isabi_cookie_consent';
/** Reopen event dispatched by the footer "Cookie Settings" control. */
export const OPEN_CONSENT_EVENT = 'isabi:open-cookie-consent';

export type ConsentValue = 'all' | 'essential';

export function getConsent(): ConsentValue | null {
  if (typeof window === 'undefined') return null;
  try {
    const v = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    return v === 'all' || v === 'essential' ? v : null;
  } catch {
    return null;
  }
}

export function setConsent(value: ConsentValue): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, value);
  } catch {
    /* private mode — the cookie below still records the choice */
  }
  // 180-day first-party cookie; SameSite=Lax + Secure on https.
  const secure = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${CONSENT_COOKIE}=${value}; path=/; max-age=15552000; SameSite=Lax${secure}`;
}

/** Ask the banner to reopen (used by the footer settings link). */
export function openCookieConsent(): void {
  window.dispatchEvent(new CustomEvent(OPEN_CONSENT_EVENT));
}
