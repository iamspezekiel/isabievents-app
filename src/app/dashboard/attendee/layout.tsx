
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Ticket, History, Heart, Bell, Settings, LogOut, Menu } from 'lucide-react';
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
      className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all text-sm font-bold no-underline ${
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

export default function AttendeeLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { signOut } = useAuth();

  const Navigation = () => (
    <nav className="flex-1 space-y-1">
      <SidebarLink icon={Ticket} label="My Tickets" href="/dashboard/attendee" active={pathname === '/dashboard/attendee'} onClick={() => setIsSidebarOpen(false)} />
      <SidebarLink icon={History} label="Order History" href="/dashboard/attendee/history" active={pathname === '/dashboard/attendee/history'} onClick={() => setIsSidebarOpen(false)} />
      <SidebarLink icon={Heart} label="Favorites" href="/dashboard/attendee/favorites" active={pathname === '/dashboard/attendee/favorites'} onClick={() => setIsSidebarOpen(false)} />
      <SidebarLink icon={Bell} label="Notifications" href="/dashboard/attendee/notifications" active={pathname === '/dashboard/attendee/notifications'} onClick={() => setIsSidebarOpen(false)} />
      <SidebarLink icon={Settings} label="Account Settings" href="/dashboard/attendee/settings" active={pathname === '/dashboard/attendee/settings'} onClick={() => setIsSidebarOpen(false)} />
    </nav>
  );

  return (
    <AuthGuard role="attendee">
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex w-72 bg-card/30 border-r border-border p-8 flex-col sticky top-0 h-screen overflow-y-auto no-print">
        <Link href="/dashboard/attendee" className="mb-12 block no-underline">
          <Logo size="sm" />
        </Link>
        <Navigation />
        <div className="pt-8 border-t border-border mt-auto">
          <SidebarLink icon={LogOut} label="Log Out" href="/login" onClick={() => signOut()} />
        </div>
      </aside>

      {/* Mobile Top Header - FIXED & PERSISTENT */}
      <header className="lg:hidden flex items-center justify-between p-4 bg-card border-b border-border fixed top-0 left-0 w-full z-50 h-16 no-print">
        <Link href="/dashboard/attendee" className="no-underline">
          <Logo size="sm" />
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-full relative" asChild title="Notifications">
            <Link href="/dashboard/attendee/notifications">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-background" />
            </Link>
          </Button>
          <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 bg-card border-border p-8 flex flex-col overflow-y-auto">
              <SheetHeader className="text-left mb-10">
                <SheetTitle>
                  <Logo size="sm" />
                </SheetTitle>
              </SheetHeader>
              <Navigation />
              <div className="pt-8 border-t border-border mt-auto">
                <SidebarLink icon={LogOut} label="Log Out" href="/login" onClick={() => signOut()} />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 pt-16 lg:pt-0 no-print overflow-x-hidden">
        {children}
      </main>
    </div>
    </AuthGuard>
  );
}
