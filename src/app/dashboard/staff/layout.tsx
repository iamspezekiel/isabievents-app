'use client';

/**
 * Staff area guard — wraps the standalone QR check-in console page.
 */
import { AuthGuard } from '@/components/auth-guard';

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard role="staff">{children}</AuthGuard>;
}
