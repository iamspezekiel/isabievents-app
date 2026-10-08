
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Plus, 
  Ticket, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut, 
  Menu, 
  Bell 
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Logo } from '@/components/logo';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { AuthGuard } from '@/components/auth-guard';
import { useAuth } from '@/components/auth-provider';

export function SidebarLink({ icon: Icon, label, active, href = "#", onClick }: any) {
  return (
    <Link 
      href={href} 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-bold no-underline ${
        active 
          ? 'bg-primary text-white shadow-lg shadow-primary/20' 
          : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
      }`}
    >
      <Icon className="w-5 h-5 shrink-0" />
      <span>{label}</span>
    </Link>
  );
}

export default function OrganizerLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { signOut } = useAuth();

  const NavigationLinks = () => (
    <nav className="flex-1 space-y-1">
      <SidebarLink icon={LayoutDashboard} label="Dashboard" href="/dashboard/organizer" active={pathname === '/dashboard/organizer'} onClick={() => setIsMobileMenuOpen(false)} />
      <SidebarLink icon={Plus} label="Create Event" href="/dashboard/organizer/create" active={pathname === '/dashboard/organizer/create'} onClick={() => setIsMobileMenuOpen(false)} />
      <SidebarLink icon={Ticket} label="My Events" href="/dashboard/organizer/events" active={pathname === '/dashboard/organizer/events'} onClick={() => setIsMobileMenuOpen(false)} />
      <SidebarLink icon={Users} label="Vendors" href="/dashboard/organizer/vendors" active={pathname === '/dashboard/organizer/vendors'} onClick={() => setIsMobileMenuOpen(false)} />
      <SidebarLink icon={BarChart3} label="Analytics" href="/dashboard/organizer/analytics" active={pathname === '/dashboard/organizer/analytics'} onClick={() => setIsMobileMenuOpen(false)} />
      <SidebarLink icon={Settings} label="Settings" href="/dashboard/organizer/settings" active={pathname === '/dashboard/organizer/settings'} onClick={() => setIsMobileMenuOpen(false)} />
    </nav>
  );

  return (
    <AuthGuard role="organizer">
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Desktop Side Navigation */}
      <aside className="w-64 bg-sidebar border-r border-sidebar-border p-6 flex flex-col hidden md:flex sticky top-0 h-screen overflow-y-auto">
        <div className="mb-10">
          <Link href="/dashboard/organizer" className="no-underline">
            <Logo size="sm" />
          </Link>
        </div>
        <NavigationLinks />
        <div className="pt-6 border-t border-sidebar-border mt-auto">
          <SidebarLink icon={LogOut} label="Log Out" href="/login" onClick={() => signOut()} />
        </div>
      </aside>

      {/* Mobile Header - FIXED & PERSISTENT */}
      <header className="md:hidden flex items-center justify-between p-4 bg-card border-b border-border fixed top-0 left-0 w-full z-50 h-16">
        <Link href="/dashboard/organizer" className="no-underline">
          <Logo size="sm" />
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-full relative" asChild title="Notifications">
            <Link href="/dashboard/attendee/notifications">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-background" />
            </Link>
          </Button>
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" title="Open Menu">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 bg-card border-border p-6 flex flex-col overflow-y-auto">
              <SheetHeader className="text-left mb-10">
                <SheetTitle>
                  <Link href="/dashboard/organizer" className="no-underline" onClick={() => setIsMobileMenuOpen(false)}>
                    <Logo size="sm" />
                  </Link>
                </SheetTitle>
              </SheetHeader>
              <NavigationLinks />
              <div className="pt-6 border-t border-border mt-auto">
                <SidebarLink icon={LogOut} label="Log Out" href="/login" onClick={() => signOut()} />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 pt-16 md:pt-0 overflow-x-hidden">
        {children}
      </main>
    </div>
    </AuthGuard>
  );
}
