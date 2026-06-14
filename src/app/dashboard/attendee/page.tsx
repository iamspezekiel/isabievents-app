
"use client";

import React, { useState, useEffect } from 'react';
import { 
  Ticket, 
  History, 
  Heart, 
  Bell, 
  Settings, 
  LogOut, 
  QrCode, 
  Download, 
  Share2, 
  Calendar, 
  MapPin, 
  Menu, 
  X,
  ShieldCheck,
  Smartphone,
  User,
  LayoutDashboard,
  CheckCircle2
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MOCK_USER, MOCK_EVENTS } from '@/lib/mock-data';
import { Logo } from '@/components/logo';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function AttendeeDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

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

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-x-hidden">
        <div className="max-w-5xl mx-auto space-y-8 md:space-y-12">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1 text-left">
              <h1 className="font-headline text-3xl md:text-5xl tracking-tighter">Hi, {MOCK_USER.name} 👋</h1>
              <p className="text-muted-foreground font-medium">You have {MOCK_USER.wallet.active} upcoming experiences.</p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/discover" className="w-full sm:w-auto no-underline">
                <Button className="w-full rounded-full px-8 shadow-xl shadow-primary/20 h-11 font-bold">Discover Events</Button>
              </Link>
            </div>
          </header>

          {/* Stats Grid - One line on mobile, 3 on desktop */}
          <div className="grid grid-cols-3 gap-2 md:gap-6">
            <StatBox label="Active" value={MOCK_USER.wallet.active} color="primary" icon={Ticket} />
            <StatBox label="Used" value={MOCK_USER.wallet.used} color="accent" icon={History} />
            <StatBox label="Saved" value={5} color="white" icon={Heart} />
          </div>

          {/* Events Tabs */}
          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="bg-secondary/50 p-1 rounded-2xl w-full sm:w-auto mb-8">
              <TabsTrigger value="upcoming" className="rounded-xl px-8 flex-1 sm:flex-none font-bold">Upcoming</TabsTrigger>
              <TabsTrigger value="past" className="rounded-xl px-8 flex-1 sm:flex-none font-bold">Past</TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-6">
              {MOCK_EVENTS.slice(0, 3).map((event) => (
                <TicketCard key={event.id} event={event} mounted={mounted} />
              ))}
            </TabsContent>

            <TabsContent value="past" className="pt-12">
              <div className="text-center py-24 bg-card/20 rounded-[3rem] border border-dashed border-border/50">
                <History className="w-16 h-16 text-muted-foreground mx-auto mb-6 opacity-10" />
                <p className="text-muted-foreground font-medium">No past events recorded yet.</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

export function SidebarLink({ icon: Icon, label, active, href = "#" }: any) {
  return (
    <Link 
      href={href} 
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

function StatBox({ label, value, color, icon: Icon, className }: any) {
  const colorClass = color === 'primary' ? 'text-primary' : color === 'accent' ? 'text-accent' : 'text-foreground';
  const bgClass = color === 'primary' ? 'bg-primary/10' : color === 'accent' ? 'bg-accent/10' : 'bg-secondary/50';
  
  return (
    <Card className={cn("bg-card border-border overflow-hidden rounded-[1.25rem] md:rounded-[2.5rem] shadow-sm hover:border-primary/40 hover:shadow-md transition-all duration-300 group cursor-default", className)}>
      <CardContent className="p-3 md:p-8 flex flex-row items-center justify-start gap-2 md:gap-6">
        <div className={cn("w-8 h-8 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110", bgClass)}>
          <Icon className={cn("w-4 h-4 md:w-8 md:h-8", colorClass)} />
        </div>
        <div className="text-left space-y-0.5 md:space-y-1">
          <div className={cn("text-xl md:text-5xl font-headline font-black leading-none tracking-tighter", colorClass)}>{value}</div>
          <span className="text-[8px] md:text-[11px] text-muted-foreground uppercase font-bold tracking-[0.1em] block">{label}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function TicketCard({ event, mounted }: any) {
  return (
    <div className="group relative bg-card border border-border rounded-[2.5rem] overflow-hidden hover:border-primary/50 transition-all duration-500 flex flex-col md:flex-row hover:shadow-[0_32px_64px_-16px_rgba(126,124,255,0.1)] shadow-sm">
      {/* Decorative Notches */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 w-6 h-6 md:w-10 md:h-10 bg-background border border-border rounded-full z-10 hidden md:block" />
      <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 w-6 h-6 md:w-10 md:h-10 bg-background border border-border rounded-full z-10 hidden md:block" />

      <div className="relative w-full md:w-64 aspect-[16/10] md:aspect-square shrink-0 overflow-hidden">
        <img 
          src={event.image} 
          alt="" 
          className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110" 
        />
        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 backdrop-blur-[2px]">
          <QrCode className="w-10 h-10 md:w-14 md:h-14 text-white mb-2 animate-in zoom-in-50" />
          <span className="text-white text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em]">Show Entry QR</span>
        </div>
      </div>
      
      <div className="flex-1 p-6 md:p-10 flex flex-col text-left relative">
        {/* Ticket Perforation Mock */}
        <div className="absolute left-0 top-0 bottom-0 w-px border-l-2 border-dashed border-border/50 ml-[-1px] hidden md:block" />
        
        <div className="flex items-center justify-between mb-6">
          <Badge className="bg-primary text-white border-none py-1 px-4 font-black text-[10px] tracking-widest uppercase rounded-full">CONFIRMED</Badge>
          <span className="text-[10px] text-muted-foreground font-black font-mono tracking-widest opacity-60">#TKT-{event.id.toUpperCase()}</span>
        </div>
        
        <div className="space-y-4 flex-1">
          <h3 className="font-headline text-2xl md:text-3xl mb-2 line-clamp-1 group-hover:text-primary transition-colors">{event.title}</h3>
          
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60">Schedule</span>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4 text-primary" />
                </div>
                <span className="font-bold text-sm text-foreground">
                  {mounted ? new Date(event.date).toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' }) : '...'}
                </span>
              </div>
            </div>
            
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60">Location</span>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-accent" />
                </div>
                <span className="line-clamp-1 font-bold text-sm text-foreground">{event.venue}</span>
              </div>
            </div>

            <div className="space-y-1.5 hidden lg:block">
              <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60">Entry Type</span>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                  <Smartphone className="w-4 h-4 text-primary" />
                </div>
                <span className="line-clamp-1 font-bold text-sm text-foreground">Standard Pass</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-border flex flex-row items-center gap-2">
          <Button className="flex-1 rounded-full h-11 gap-2 shadow-lg shadow-primary/20 font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] transition-transform">
            <QrCode className="w-4 h-4" /> View Ticket
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" className="w-11 h-11 rounded-full border-border bg-card hover:bg-secondary hover:text-primary transition-colors">
              <Download className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" className="w-11 h-11 rounded-full border-border bg-card hover:bg-secondary hover:text-primary transition-colors">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
