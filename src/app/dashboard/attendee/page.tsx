"use client";

import React, { useState } from 'react';
import { Ticket, History, Heart, Bell, Settings, LogOut, QrCode, Download, Share2, Calendar, MapPin, Menu, X } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MOCK_USER, MOCK_EVENTS } from '@/lib/mock-data';
import { Logo } from '@/components/logo';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Link from 'next/link';

export default function AttendeeDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const Navigation = () => (
    <nav className="flex-1 space-y-2">
      <SidebarLink icon={Ticket} label="My Tickets" active />
      <SidebarLink icon={History} label="Order History" />
      <SidebarLink icon={Heart} label="Favorites" />
      <SidebarLink icon={Bell} label="Notifications" />
      <SidebarLink icon={Settings} label="Account Settings" />
    </nav>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row pt-48">
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex w-72 bg-card/30 border-r border-border p-8 flex-col sticky top-0 h-screen">
        <Link href="/" className="mb-12 block">
          <Logo size="sm" />
        </Link>
        <Navigation />
        <div className="pt-8 border-t border-border mt-auto">
          <SidebarLink icon={LogOut} label="Log Out" />
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="lg:hidden flex items-center justify-between p-4 bg-card border-b border-border sticky top-0 z-40">
        <Logo size="sm" />
        <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 bg-card border-border p-8 flex flex-col">
            <div className="mb-10">
              <Logo size="sm" />
            </div>
            <Navigation />
            <div className="pt-8 border-t border-border mt-auto">
              <SidebarLink icon={LogOut} label="Log Out" />
            </div>
          </SheetContent>
        </Sheet>
      </header>

      {/* Main Dashboard Content */}
      <main className="flex-1 p-4 md:p-8 lg:p-12">
        <div className="max-w-5xl mx-auto space-y-8 md:space-y-12">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1 text-left">
              <h1 className="font-headline text-3xl md:text-4xl">Hi, {MOCK_USER.name} 👋</h1>
              <p className="text-muted-foreground font-medium">You have {MOCK_USER.wallet.active} upcoming experiences.</p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/discover" className="w-full sm:w-auto">
                <Button className="w-full rounded-full px-8 shadow-xl shadow-primary/20">Explore More</Button>
              </Link>
            </div>
          </header>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
            <StatBox label="Active Tickets" value={MOCK_USER.wallet.active} color="primary" />
            <StatBox label="Used" value={MOCK_USER.wallet.used} color="accent" />
            <StatBox label="Favorites" value={5} color="white" />
          </div>

          {/* Events Tabs */}
          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="bg-secondary/50 p-1 rounded-2xl w-full sm:w-auto mb-8">
              <TabsTrigger value="upcoming" className="rounded-xl px-8 flex-1 sm:flex-none">Upcoming</TabsTrigger>
              <TabsTrigger value="past" className="rounded-xl px-8 flex-1 sm:flex-none">Past</TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-6">
              {MOCK_EVENTS.slice(0, 2).map((event) => (
                <TicketCard key={event.id} event={event} />
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

function SidebarLink({ icon: Icon, label, active }: any) {
  return (
    <button className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all text-sm font-semibold ${active ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted-foreground hover:bg-secondary hover:text-white'}`}>
      <Icon className="w-5 h-5" />
      {label}
    </button>
  );
}

function StatBox({ label, value, color }: any) {
  const colorClass = color === 'primary' ? 'text-primary' : color === 'accent' ? 'text-accent' : 'text-white';
  return (
    <Card className="bg-card border-border overflow-hidden rounded-[2rem]">
      <CardContent className="p-8">
        <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">{label}</span>
        <div className={`text-4xl md:text-5xl font-headline mt-3 ${colorClass}`}>{value}</div>
      </CardContent>
    </Card>
  );
}

function TicketCard({ event }: any) {
  return (
    <div className="group relative bg-card border border-border rounded-[2.5rem] overflow-hidden hover:border-primary/50 transition-all flex flex-col md:flex-row hover:shadow-2xl hover:shadow-primary/5">
      <div className="relative w-full md:w-64 aspect-video md:aspect-square shrink-0">
        <img src={event.image} alt="" className="object-cover w-full h-full" />
        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm">
          <QrCode className="w-14 h-14 text-white mb-2" />
          <span className="text-white text-xs font-bold uppercase tracking-widest">Show QR</span>
        </div>
      </div>
      
      <div className="flex-1 p-8 flex flex-col text-left">
        <div className="flex items-center justify-between mb-6">
          <Badge className="bg-primary/10 text-primary border-none py-1 px-4 font-bold text-[10px] tracking-widest uppercase">CONFIRMED</Badge>
          <span className="text-[10px] text-muted-foreground font-black font-mono tracking-widest">#TKT-{event.id.toUpperCase()}</span>
        </div>
        <h3 className="font-headline text-2xl mb-4 line-clamp-1">{event.title}</h3>
        <div className="grid sm:grid-cols-2 gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
              <Calendar className="w-4 h-4 text-primary" />
            </div>
            {new Date(event.date).toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' })}
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
              <MapPin className="w-4 h-4 text-accent" />
            </div>
            <span className="line-clamp-1">{event.venue}</span>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-border flex flex-col sm:flex-row gap-4">
          <Button className="flex-1 rounded-full h-12 gap-3 shadow-lg shadow-primary/20">
            <QrCode className="w-5 h-5" /> View Ticket
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" className="w-12 h-12 rounded-full border-border bg-card hover:bg-secondary"><Download className="w-5 h-5" /></Button>
            <Button variant="outline" size="icon" className="w-12 h-12 rounded-full border-border bg-card hover:bg-secondary"><Share2 className="w-5 h-5" /></Button>
          </div>
        </div>
      </div>
    </div>
  );
}
