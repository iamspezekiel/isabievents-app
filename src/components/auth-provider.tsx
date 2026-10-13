'use client';

/**
 * Global auth state backed exclusively by Firebase Auth + the Firestore
 * `users/{uid}` profile document. There is no demo/mock or localStorage
 * session fallback: when Firebase is not configured, auth is simply disabled
 * (profile stays null) instead of replaying stale or fake data.
 */
import React, {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import type {User} from 'firebase/auth';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  updateProfile,
} from 'firebase/auth';
import {doc, getDoc, setDoc, serverTimestamp} from 'firebase/firestore';
import {auth, db, isFirebaseConfigured} from '@/lib/firebase';

export type Role = 'admin' | 'organizer' | 'staff' | 'vendor' | 'attendee';

export const DASHBOARD_PATHS: Record<Role, string> = {
  admin: '/dashboard/admin',
  organizer: '/dashboard/organizer',
  staff: '/dashboard/staff',
  vendor: '/dashboard/vendor',
  attendee: '/dashboard/attendee',
};

export interface AuthProfile {
  uid: string;
  name: string;
  email: string;
  role: Role;
  whatsapp?: string;
  /** Home city chosen in Account Settings (used for recommendations). */
  city?: string;
  /** Privacy & Security toggles persisted on the profile doc. */
  notifications?: {email?: boolean; marketing?: boolean};
  /** Organizer public location (never shown to attendees). */
  location?: string;
  avatar?: string;
  /** True once the organizer's KYC has been approved (verified badge). */
  verified?: boolean;
  /** True when authenticator-app (TOTP) two-factor login is enabled. */
  twoFactor?: boolean;
}

interface AuthContextValue {
  /** True while the initial auth state is being resolved. */
  loading: boolean;
  /** Firebase user (null when signed out). */
  user: User | null;
  /** Normalized profile from Firestore (null when signed out / auth disabled). */
  profile: AuthProfile | null;
  isFirebaseMode: boolean;
  signIn: (email: string, password: string) => Promise<AuthProfile>;
  signUp: (params: {name: string; email: string; password: string; role: Role}) => Promise<AuthProfile>;
  /** Google Sign-In popup (requires the Google provider in Firebase Console). */
  signInWithGoogle: () => Promise<AuthProfile>;
  signOut: () => Promise<void>;
  /** Re-reads the profile from Firestore — call after a settings save so the
   *  UI shows the new values immediately (no reload needed). */
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Primary super-admin account. Always resolves to the `admin` role so a login
 * with this address lands on /dashboard/admin even when the Firestore profile
 * doc is missing or stale (e.g. first Google sign-in). The seeded profile doc
 * already carries role `admin` (written server-side by `npm run seed`).
 */
export const PRIMARY_ADMIN_EMAIL = 'isabideveloper@gmail.com';

function isAdminEmail(email: string | null | undefined): boolean {
  return Boolean(email) && email!.trim().toLowerCase() === PRIMARY_ADMIN_EMAIL;
}

async function loadProfileFromFirestore(firebaseUser: User): Promise<AuthProfile> {
  let role: Role = isAdminEmail(firebaseUser.email) ? 'admin' : 'attendee';
  let name = firebaseUser.displayName || '';
  // Saved settings are carried onto the in-memory profile so every dashboard
  // (settings forms, 2FA checks, recommendation hints) sees the stored values
  // instead of falling back to defaults on each reload.
  let extra: Partial<AuthProfile> = {};
  try {
    const snap = await getDoc(doc(db!, 'users', firebaseUser.uid));
    if (snap.exists()) {
      const data = snap.data();
      role = (data.role as Role) || 'attendee';
      // The Firestore profile document is the source of truth — a brand name
      // saved in Account Settings must win over the Auth displayName captured
      // at signup, otherwise the saved value appears to "not stick".
      const firestoreName = typeof data.name === 'string' ? data.name.trim() : '';
      name = firestoreName || name;
      extra = {
        whatsapp: typeof data.whatsapp === 'string' ? data.whatsapp : '',
        city: typeof data.city === 'string' ? data.city : '',
        notifications: (data.notifications as AuthProfile['notifications']) || undefined,
        location: typeof data.location === 'string' ? data.location : '',
        avatar: typeof data.avatar === 'string' ? data.avatar : '',
        verified: data.verified === true,
        twoFactor: data.twoFactor === true,
      };
    }
  } catch (err) {
    console.warn('[auth] failed to load user profile:', err);
  }
  // The primary admin address always wins over a stale/missing profile doc.
  if (isAdminEmail(firebaseUser.email)) role = 'admin';
  return {uid: firebaseUser.uid, name, email: firebaseUser.email || '', role, ...extra};
}

export function AuthProvider({children}: {children: React.ReactNode}) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      // No Firebase config → auth is disabled. No fake profile is invented.
      // Auth state never comes from browser storage (localStorage is unused).
      setProfile(null);
      setUser(null);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Profile always comes fresh from the Firestore users doc.
        const next = await loadProfileFromFirestore(firebaseUser);
        setProfile(next);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<AuthProfile> => {
    if (isFirebaseConfigured && auth) {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const next = await loadProfileFromFirestore(cred.user);
      setProfile(next);
      setUser(cred.user);
      return next;
    }

    // Production requires Firebase — there is no demo/mock login anymore.
    throw new Error('Firebase authentication is not configured.');
  }, []);

  const signUp = useCallback(
    async (params: {name: string; email: string; password: string; role: Role}): Promise<AuthProfile> => {
      const {name, email, password, role} = params;
      if (isFirebaseConfigured && auth) {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        if (name) {
          try {
            await updateProfile(cred.user, {displayName: name});
          } catch (err) {
            console.warn('[auth] displayName update failed:', err);
          }
        }
        try {
          await setDoc(doc(db!, 'users', cred.user.uid), {
            name,
            email,
            role,
            createdAt: serverTimestamp(),
          });
        } catch (err) {
          // Client security rules reject staff/vendor profile creation — seed
          // the doc server-side instead so the account keeps its role after a
          // reload (never accepts `admin`).
          console.warn('[auth] user profile write failed:', err);
          try {
            const token = await cred.user.getIdToken();
            await fetch('/api/account/profile', {
              method: 'POST',
              headers: {'Content-Type': 'application/json', Authorization: `Bearer ${token}`},
              body: JSON.stringify({name, role}),
            });
          } catch (fallbackErr) {
            console.warn('[auth] server profile seed failed:', fallbackErr);
          }
        }
        const next: AuthProfile = {uid: cred.user.uid, name, email, role};
        setProfile(next);
        setUser(cred.user);
        return next;
      }

      // Production requires Firebase — there is no demo/mock signup anymore.
      throw new Error('Firebase authentication is not configured.');
    },
    []
  );

  const signInWithGoogle = useCallback(async (): Promise<AuthProfile> => {
    if (!isFirebaseConfigured || !auth) {
      throw new Error('Google sign-in requires Firebase configuration.');
    }

    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);

    // First Google sign-in: create the profile doc with a default role.
    let role: Role = isAdminEmail(cred.user.email) ? 'admin' : 'attendee';
    let name = cred.user.displayName || '';
    try {
      const snap = await getDoc(doc(db!, 'users', cred.user.uid));
      if (snap.exists()) {
        const data = snap.data();
        role = (data.role as Role) || 'attendee';
        // Saved profile name beats the Google display name (see loadProfileFromFirestore).
        const firestoreName = typeof data.name === 'string' ? data.name.trim() : '';
        name = firestoreName || name;
      } else {
        await setDoc(doc(db!, 'users', cred.user.uid), {
          name,
          email: cred.user.email || '',
          role,
          createdAt: serverTimestamp(),
        });
        // First Google sign-in == new account: send the welcome email
        // (fire-and-forget; a no-op without SMTP configured).
        fetch('/api/email/welcome', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({name, email: cred.user.email || '', role}),
        }).catch(() => {});
      }
    } catch (err) {
      console.warn('[auth] google profile write failed:', err);
    }

    // The primary admin address always wins over a stale/missing profile doc.
    if (isAdminEmail(cred.user.email)) role = 'admin';

    const next: AuthProfile = {
      uid: cred.user.uid,
      name,
      email: cred.user.email || '',
      role,
    };
    setProfile(next);
    setUser(cred.user);
    return next;
  }, []);

  const signOut = useCallback(async () => {
    if (isFirebaseConfigured && auth) {
      try {
        await firebaseSignOut(auth);
      } catch (err) {
        console.warn('[auth] signOut failed:', err);
      }
    }
    setUser(null);
    setProfile(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    const current = auth?.currentUser;
    if (!current) return;
    try {
      const next = await loadProfileFromFirestore(current);
      setProfile(next);
    } catch (err) {
      console.warn('[auth] profile refresh failed:', err);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      loading,
      user,
      profile,
      isFirebaseMode: isFirebaseConfigured,
      signIn,
      signUp,
      signInWithGoogle,
      signOut,
      refreshProfile,
    }),
    [loading, user, profile, signIn, signUp, signInWithGoogle, signOut, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
