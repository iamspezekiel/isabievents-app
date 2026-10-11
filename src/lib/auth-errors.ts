/**
 * Shared, human-friendly Firebase auth error messages.
 *
 * Firebase throws codes like `auth/invalid-credential`. We map the common ones
 * to actionable copy and fall back to a cleaned-up version of the raw message
 * (stripping the "Firebase:" prefix and the "(auth/…)" suffix) so users never
 * see a cryptic internal error.
 */
const MESSAGES: Record<string, string> = {
  'auth/invalid-credential': 'Wrong email or password. Please try again.',
  'auth/wrong-password': 'Wrong email or password. Please try again.',
  'auth/user-not-found': 'No account found with this email. Try signing up instead.',
  'auth/user-disabled': 'This account has been disabled. Please contact support.',
  'auth/email-already-in-use': 'An account with this email already exists. Try signing in instead.',
  'auth/weak-password': 'Password is too weak. Use at least 6 characters.',
  'auth/invalid-email': 'That email address looks invalid. Please check and try again.',
  'auth/missing-password': 'Please enter your password.',
  'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
  'auth/network-request-failed': 'Network error. Check your connection and try again.',
  'auth/requires-recent-login': 'For security, please sign in again before retrying.',
  'auth/popup-closed-by-user': 'The Google popup was closed before sign-in finished.',
  'auth/popup-blocked': 'Popup blocked — allow popups for this site and try again.',
  'auth/cancelled-popup-request': 'Sign-in was cancelled.',
  'auth/unauthorized-domain': 'This domain is not authorized for sign-in yet.',
  'auth/operation-not-allowed': 'This sign-in method is not enabled yet.',
  'auth/account-exists-with-different-credential':
    'An account with this email already exists — try email/password sign-in.',
  'auth/ratelimit-exceeded': 'Too many attempts. Please wait a moment and try again.',
};

/** Convert any auth error into a clear, user-facing message. */
export function friendlyAuthError(err: unknown): string {
  const code = (err as {code?: string})?.code || '';
  if (MESSAGES[code]) return MESSAGES[code];

  let msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
  // Strip the "Firebase:" prefix and trailing "(auth/…)" diagnostic.
  msg = msg.replace(/^Firebase:\s*/i, '').replace(/\s*\(auth\/[^)]*\)/g, '').trim();
  return msg || 'Something went wrong. Please try again.';
}
