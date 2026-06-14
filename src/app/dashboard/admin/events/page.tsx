
"use client";

import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Ticket, 
  BarChart3, 
  Settings, 
  LogOut, 
  ShieldCheck, 
  Search, 
  Menu, 
  CheckCircle2, 
  ChevronRight,
  UserCheck,
  Ban,
  Filter,
  MoreVertical,
  Calendar,
  MapPin,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Logo } from '@/components/logo';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MOCK_EVENTS } from '@/lib/mock-data';
import { SidebarLink } from '../page';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminEventsManagement() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const pathname = usePathname();

  const NavigationLinks = () => (
    <nav className="flex-1 space-y-1">
      <div className="pb-2">
        <SidebarLink icon={LayoutDashboard} label="Global Overview" href="/dashboard/admin" active={pathname === '/dashboard/admin'} />
        <SidebarLink icon={Users} label="User Management" href="/dashboard/admin/users" active={pathname === '/dashboard/admin/users'} />
        <SidebarLink icon={ShieldCheck} label="Organizer KYC" href="/dashboard/admin/kyc" active={pathname === '/dashboard/admin/kyc'} />
        <SidebarLink icon={Ticket} label="Event Moderation" href="/dashboard/admin/events" active={pathname === '/dashboard/admin/events'} />
        <SidebarLink icon={BarChart3} label="Financial Reports" href="/dashboard/admin/reports" active={pathname === '/dashboard/admin/reports'} />
        <SidebarLink icon={Settings} label="System Settings" href="/dashboard/admin/settings" active={pathname === '/dashboard/admin/settings'} />
      </div>
    </nav>
  );

  const filteredEvents = MOCK_EVENTS.filter(event => 
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    event.organizer.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingModeration = filteredEvents.filter(event => !event.organizer.verified);
  const autoApproved = filteredEvents.filter(event => event.organizer.verified);

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row pt-32">
      {/* Desktop Side Navigation */}
      <aside className="w-64 bg-sidebar border-r border-sidebar-border p-6 flex flex-col hidden md:flex sticky top-0 h-screen overflow-y-auto">
        <div className="mb-10">
          <Link href="/dashboard/admin" className="no-underline">
            <Logo size="sm" />
          </Link>
          <div className="mt-2 text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-1 rounded inline-block">
            Master Console
          </div>
        </div>
        <NavigationLinks />
        <div className="pt-6 border-t border-sidebar-border mt-auto">
          <SidebarLink icon={LogOut} label="Log Out" href="/login" />
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 bg-card border-b border-border sticky top-0 z-40">
        <Link href="/dashboard/admin" className="no-underline">
          <Logo size="sm" />
        </Link>
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 bg-card border-border p-6 flex flex-col overflow-y-auto">
            <SheetHeader className="text-left mb-10">
              <SheetTitle>
                <Link href="/dashboard/admin" className="no-underline" onClick={() => setIsMobileMenuOpen(false)}>
                  <Logo size="sm" />
                </Link>
              </SheetTitle>
            </SheetHeader>
            <NavigationLinks />
            <div className="pt-6 border-t border-border mt-auto">
              <SidebarLink icon={LogOut} label="Log Out" href="/login" />
            </div>
          </SheetContent>
        </Sheet>
      </header>

      <main className="flex-1 p-4 md:p-12 overflow-x-hidden">
        <div className="max-w-6xl mx-auto space-y-8">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="text-left space-y-1">
              <h1 className="font-headline text-3xl md:text-5xl">Event Moderation</h1>
              <p className="text-muted-foreground font-medium">Review and manage all event listings across the platform.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search events or hosts..." 
                  className="pl-9 h-11 bg-card rounded-full" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </header>

          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="bg-secondary/50 p-1 rounded-2xl mb-8">
              <TabsTrigger value="pending" className="rounded-xl px-8 font-bold">Pending Review ({pendingModeration.length})</TabsTrigger>
              <TabsTrigger value="approved" className="rounded-xl px-8 font-bold">Auto-Approved ({autoApproved.length})</TabsTrigger>
              <TabsTrigger value="all" className="rounded-xl px-8 font-bold">All Events</TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4">
              {pendingModeration.length > 0 ? pendingModeration.map((event) => (
                <ModerationRow key={event.id} event={event} type="pending" />
              )) : (
                <div className="bg-card border border-dashed border-border py-24 rounded-[3rem] text-center">
                  <CheckCircle2 className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
                  <p className="text-muted-foreground font-medium">No events currently pending manual review.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="approved" className="space-y-4">
              {autoApproved.map((event) => (
                <ModerationRow key={event.id} event={event} type="approved" />
              ))}
            </TabsContent>

            <TabsContent value="all" className="space-y-4">
              {filteredEvents.map((event) => (
                <ModerationRow key={event.id} event={event} type="all" />
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

function ModerationRow({ event, type }: { event: any, type: string }) {
  const isVerified = event.organizer.verified;

  return (
    <div className="bg-card border border-border p-6 rounded-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 group hover:border-primary/30 transition-all shadow-sm">
      <div className="flex items-center gap-6 text-left">
        <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 shadow-md">
          <img src={event.image} alt="" className="object-cover w-full h-full" />
        </div>
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-bold text-lg leading-tight">{event.title}</h3>
            <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest">{event.category}</Badge>
            {isVerified ? (
              <Badge className="bg-green-500/10 text-green-500 border-none text-[9px] font-black uppercase tracking-tighter flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Verified Host
              </Badge>
            ) : (
              <Badge className="bg-yellow-500/10 text-yellow-600 border-none text-[9px] font-black uppercase tracking-tighter">
                Unverified Host
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-muted-foreground font-medium">
            <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-primary" /> {new Date(event.date).toLocaleDateString('en-NG', { dateStyle: 'medium' })}</span>
            <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-accent" /> {event.venue}, {event.city}</span>
            <span className="flex items-center gap-1.5 font-bold text-foreground">Host: {event.organizer.name}</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-3 w-full lg:w-auto pt-4 lg:pt-0 border-t lg:border-none border-border">
        {type === 'pending' || !isVerified ? (
          <>
            <Button variant="outline" size="sm" className="flex-1 lg:flex-none rounded-full gap-2 border-green-500/20 text-green-500 hover:bg-green-500/5 h-10 px-6 font-bold">
              <UserCheck className="w-4 h-4" /> Approve
            </Button>
            <Button variant="outline" size="sm" className="flex-1 lg:flex-none rounded-full gap-2 border-red-500/20 text-red-500 hover:bg-red-500/5 h-10 px-6 font-bold">
              <Ban className="w-4 h-4" /> Reject
            </Button>
          </>
        ) : (
          <Badge className="bg-green-500/10 text-green-500 border-none py-2 px-4 rounded-full font-bold">Live & Verified</Badge>
        )}
        <Link href={`/events/${event.slug}`} className="no-underline">
          <Button variant="ghost" size="icon" className="rounded-full h-10 w-10"><ExternalLink className="w-4 h-4" /></Button>
        </Link>
      </div>
    </div>
  );
}
