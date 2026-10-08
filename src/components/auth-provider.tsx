'use client';

/**
 * Global auth state backed by Firebase Auth when configured, with a
 * localStorage-based demo fallback so the prototype keeps working without a
 * Firebase project.
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
}

interface AuthContextValue {
  /** True while the initial auth state is being resolved. */
  loading: boolean;
  /** Firebase user (null in demo mode). */
  user: User | null;
  /** Normalized profile including role — available in both modes. */
  profile: AuthProfile | null;
  isFirebaseMode: boolean;
  signIn: (email: string, password: string) => Promise<AuthProfile>;
  signUp: (params: {name: string; email: string; password: string; role: Role}) => Promise<AuthProfile>;
  /** Google Sign-In popup (requires the Google provider in Firebase Console). */
  signInWithGoogle: () => Promise<AuthProfile>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const ROLE_KEY = 'isabi_user_role';
const LOGGED_IN_KEY = 'isabi_logged_in';
const PROFILE_KEY = 'isabi_profile';

function readStoredProfile(): AuthProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) return JSON.parse(raw) as AuthProfile;
  } catch {
    /* corrupted storage — ignore */
  }
  // Legacy demo session from the pre-Firebase login.
  if (localStorage.getItem(LOGGED_IN_KEY) === 'true') {
    const role = (localStorage.getItem(ROLE_KEY) || 'attendee') as Role;
    return {uid: `demo_${role}`, name: 'Demo User', email: `${role}@isabievents.ng`, role};
  }
  return null;
}

function storeProfile(profile: AuthProfile | null) {
  if (typeof window === 'undefined') return;
  if (profile) {
    localStorage.setItem(LOGGED_IN_KEY, 'true');
    localStorage.setItem(ROLE_KEY, profile.role);
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } else {
    localStorage.removeItem(LOGGED_IN_KEY);
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(PROFILE_KEY);
  }
}

async function loadProfileFromFirestore(firebaseUser: User): Promise<AuthProfile> {
  let role: Role = 'attendee';
  let name = firebaseUser.displayName || '';
  try {
    const snap = await getDoc(doc(db!, 'users', firebaseUser.uid));
    if (snap.exists()) {
      const data = snap.data();
      role = (data.role as Role) || 'attendee';
      name = name || data.name || '';
    }
  } catch (err) {
    console.warn('[auth] failed to load user profile:', err);
  }
  return {uid: firebaseUser.uid, name, email: firebaseUser.email || '', role};
}

export function AuthProvider({children}: {children: React.ReactNode}) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      // Demo mode: hydrate from localStorage.
      setProfile(readStoredProfile());
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const next = await loadProfileFromFirestore(firebaseUser);
        setProfile(next);
        storeProfile(next);
      } else {
        setProfile(null);
        storeProfile(null);
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
      storeProfile(next);
      return next;
    }

    // Demo mode: resolve against MOCK_USERS.
    const {MOCK_USERS} = await import('@/lib/mock-data');
    const match = MOCK_USERS.find((u) => u.email === email && u.password === password);
    if (!match) throw new Error('Invalid email or password.');
    const next: AuthProfile = {
      uid: `demo_${match.role}`,
      name: match.name,
      email: match.email,
      role: match.role as Role,
      whatsapp: match.whatsapp,
    };
    setProfile(next);
    storeProfile(next);
    return next;
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
          console.warn('[auth] user profile write failed:', err);
        }
        const next: AuthProfile = {uid: cred.user.uid, name, email, role};
        setProfile(next);
        setUser(cred.user);
        storeProfile(next);
        return next;
      }

      // Demo mode: accept anything, mimic success.
      const next: AuthProfile = {uid: `demo_${role}`, name, email, role};
      setProfile(next);
      storeProfile(next);
      return next;
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
    let role: Role = 'attendee';
    const name = cred.user.displayName || '';
    try {
      const snap = await getDoc(doc(db!, 'users', cred.user.uid));
      if (snap.exists()) {
        role = (snap.data().role as Role) || 'attendee';
      } else {
        await setDoc(doc(db!, 'users', cred.user.uid), {
          name,
          email: cred.user.email || '',
          role,
          createdAt: serverTimestamp(),
        });
      }
    } catch (err) {
      console.warn('[auth] google profile write failed:', err);
    }

    const next: AuthProfile = {
      uid: cred.user.uid,
      name,
      email: cred.user.email || '',
      role,
    };
    setProfile(next);
    setUser(cred.user);
    storeProfile(next);
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
    storeProfile(null);
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
    }),
    [loading, user, profile, signIn, signUp, signInWithGoogle, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
