'use client';

/**
 * Client-side route guard for dashboard pages.
 *
 * Note: this is UX-level protection only — Firestore security rules must
 * enforce the real authorization (see firestore.rules in the repo root).
 */
import React, {useEffect} from 'react';
import {useRouter} from 'next/navigation';
import {Loader2} from 'lucide-react';
import {DASHBOARD_PATHS, useAuth, type Role} from '@/components/auth-provider';

export function AuthGuard({
  role,
  children,
}: {
  /** Required role(s) for this area; omitted = any signed-in user. */
  role?: Role | Role[];
  children: React.ReactNode;
}) {
  const {loading, profile} = useAuth();
  const router = useRouter();

  const allowed = !role || (Array.isArray(role) ? role.includes(profile?.role as Role) : profile?.role === role);

  useEffect(() => {
    if (loading) return;
    if (!profile) {
      router.replace('/login');
      return;
    }
    if (!allowed) {
      router.replace(DASHBOARD_PATHS[profile.role] || '/login');
    }
  }, [loading, profile, allowed, router]);

  if (loading || !profile || !allowed) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground font-bold">Securing your dashboard…</p>
      </div>
    );
  }

  return <>{children}</>;
}
