'use client';

/**
 * Vendor area guard — wraps the standalone vendor console page.
 */
import { AuthGuard } from '@/components/auth-guard';

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard role="vendor">{children}</AuthGuard>;
}
