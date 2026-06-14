
"use client";

import React, { useState } from 'react';
import { Bell, Ticket, Star, Zap, Menu, LogOut, History, Heart, Settings, Clock } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { Logo } from '@/components/logo';
import { SidebarLink } from '../page';
import { usePathname } from 'next/navigation';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export default function NotificationsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  const Navigation = () => (
    <nav className="flex-1 space-y-1">
      <div className="pb-4">
        <SidebarLink icon={Ticket} label="My Tickets" href="/dashboard/attendee" active={pathname === '/dashboard/attendee'} />
        <SidebarLink icon={History} label="Order History" href="/dashboard/attendee/history" active={pathname === '/dashboard/attendee/history'} />
        <SidebarLink icon={Heart} label="Favorites" href="/dashboard/attendee/favorites" active={pathname === '/dashboard/attendee/favorites'} />
        <SidebarLink icon={Bell} label="Notifications" href="/dashboard/attendee/notifications" active={pathname === '/dashboard/attendee/notifications'} />
        <SidebarLink icon={Settings} label="Account Settings" href="/dashboard/attendee/settings" active={pathname === '/dashboard/attendee/settings'} />
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row pt-32">
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex w-72 bg-card/30 border-r border-border p-8 flex-col sticky top-0 h-screen overflow-y-auto">
        <Link href="/dashboard/attendee" className="mb-12 block no-underline">
          <Logo size="sm" />
        </Link>
        <Navigation />
        <div className="pt-8 border-t border-border mt-auto">
          <SidebarLink icon={LogOut} label="Log Out" href="/login" />
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="lg:hidden flex items-center justify-between p-4 bg-card border-b border-border sticky top-0 z-40">
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
            <SheetContent side="left" className="w-72 bg-card border-border p-8 flex flex-col overflow-y-auto">
              <SheetHeader className="text-left mb-10">
                <SheetTitle>
                  <Link href="/dashboard/attendee" className="no-underline" onClick={() => setIsSidebarOpen(false)}>
                    <Logo size="sm" />
                  </Link>
                </SheetTitle>
              </SheetHeader>
              <Navigation />
              <div className="pt-8 border-t border-border mt-auto">
                <SidebarLink icon={LogOut} label="Log Out" href="/login" />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <header className="flex items-center justify-between text-left">
            <div className="space-y-1">
              <h1 className="font-headline text-3xl md:text-5xl">Notifications</h1>
              <p className="text-muted-foreground font-medium">Stay updated on your upcoming experiences.</p>
            </div>
            <Button variant="ghost" className="text-xs font-bold text-primary">Mark all as read</Button>
          </header>

          <div className="space-y-4">
             <NotificationItem 
               icon={Ticket} 
               title="Ticket Confirmed!" 
               desc="Your ticket for Lagos Jazz Night is now in your digital wallet." 
               time="2 hours ago"
               type="success"
             />
             <NotificationItem 
               icon={Zap} 
               title="Event Reminder" 
               desc="Naija Tech Summit starts tomorrow at 9:00 AM. Don't forget your QR code!" 
               time="1 day ago"
               type="info"
             />
             <NotificationItem 
               icon={Star} 
               title="Exclusive Offer" 
               desc="Early bird tickets for Gidi Fest are now live. Grab yours before they sell out." 
               time="3 days ago"
               type="primary"
             />
          </div>
        </div>
      </main>
    </div>
  );
}

function NotificationItem({ icon: Icon, title, desc, time, type }: any) {
  const typeClasses = type === 'success' ? 'bg-green-500/10 text-green-500' : type === 'primary' ? 'bg-primary/10 text-primary' : 'bg-blue-500/10 text-blue-500';
  
  return (
    <div className="bg-card border border-border p-6 rounded-2xl flex items-start gap-6 text-left hover:border-primary/20 transition-colors">
       <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${typeClasses}`}>
          <Icon className="w-6 h-6" />
       </div>
       <div className="flex-1 space-y-1">
          <div className="flex justify-between items-start gap-4">
             <h4 className="font-bold text-lg leading-tight">{title}</h4>
             <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-bold uppercase tracking-widest shrink-0 mt-1">
                <Clock className="w-3 h-3" />
                {time}
             </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
          <div className="pt-2">
            <Button variant="ghost" size="sm" className="h-8 px-0 text-primary font-bold hover:bg-transparent">View Details</Button>
          </div>
       </div>
    </div>
  );
}
