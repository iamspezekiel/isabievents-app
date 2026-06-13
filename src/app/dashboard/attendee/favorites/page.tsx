
"use client";

import React, { useState } from 'react';
import { Heart, MapPin, Calendar, Ticket, History, Bell, Settings, LogOut, Menu } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { MOCK_EVENTS } from '@/lib/mock-data';
import Link from 'next/link';
import { Logo } from '@/components/logo';
import { SidebarLink } from '../page';
import { usePathname } from 'next/navigation';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export default function FavoritesPage() {
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
      </header>

      <main className="flex-1 p-4 md:p-12">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-left">
            <h1 className="font-headline mb-2 text-3xl md:text-5xl">Your Favorites</h1>
            <p className="text-muted-foreground">Events you've saved to check out later.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {MOCK_EVENTS.slice(4, 8).map((event) => (
              <Link key={event.id} href={`/events/${event.slug}`} className="no-underline">
                <div className="group bg-card border border-border rounded-[2rem] overflow-hidden hover:border-primary/50 transition-all shadow-sm flex flex-col h-full">
                  <div className="relative aspect-video overflow-hidden">
                    <img src={event.image} alt="" className="object-cover w-full h-full group-hover:scale-105 transition-transform" />
                    <Button variant="secondary" size="icon" className="absolute top-4 right-4 rounded-full bg-white/80 backdrop-blur-sm text-red-500">
                      <Heart className="w-5 h-5 fill-current" />
                    </Button>
                  </div>
                  <div className="p-8 text-left space-y-4 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 text-primary font-black uppercase text-[10px] tracking-widest">
                       <Calendar className="w-3.5 h-3.5" /> {new Date(event.date).toLocaleDateString()}
                    </div>
                    <h3 className="font-headline text-xl font-bold line-clamp-1">{event.title}</h3>
                    <p className="text-muted-foreground flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {event.venue}</p>
                    <div className="mt-auto pt-6 border-t border-border flex items-center justify-between">
                       <div className="font-black text-primary">₦{event.price.min.toLocaleString()}</div>
                       <Button size="sm" className="rounded-full">Details</Button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
