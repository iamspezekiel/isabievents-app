
"use client";

import React from 'react';
import { Ticket, History, Heart, Bell, Settings, LogOut, QrCode, Download, Share2, Calendar, MapPin } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MOCK_USER, MOCK_EVENTS } from '@/lib/mock-data';
import { Logo } from '@/components/logo';
import Link from 'next/link';

export default function AttendeeDashboard() {
  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Side Navigation */}
      <aside className="w-full md:w-64 bg-card border-r border-border p-6 flex flex-col">
        <Link href="/" className="mb-10 block">
          <Logo size="sm" />
        </Link>

        <nav className="flex-1 space-y-2">
          <SidebarLink icon={Ticket} label="My Tickets" active />
          <SidebarLink icon={History} label="Order History" />
          <SidebarLink icon={Heart} label="Favorites" />
          <SidebarLink icon={Bell} label="Notifications" />
          <SidebarLink icon={Settings} label="Account Settings" />
        </nav>

        <div className="pt-6 border-t border-border mt-auto">
          <SidebarLink icon={LogOut} label="Log Out" />
        </div>
      </aside>

      {/* Main Dashboard */}
      <main className="flex-1 p-6 md:p-12">
        <div className="max-w-5xl mx-auto space-y-10">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="font-headline text-3xl mb-1">Welcome back, {MOCK_USER.name}</h1>
              <p className="text-muted-foreground">You have {MOCK_USER.wallet.active} upcoming events.</p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/discover">
                <Button className="rounded-full px-6">Explore Events</Button>
              </Link>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard label="Active Tickets" value={MOCK_USER.wallet.active} color="primary" />
            <StatCard label="Used Tickets" value={MOCK_USER.wallet.used} color="accent" />
            <StatCard label="Saved Events" value={5} color="white" />
          </div>

          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="bg-secondary p-1 rounded-lg">
              <TabsTrigger value="upcoming" className="rounded-md">Upcoming Events</TabsTrigger>
              <TabsTrigger value="past" className="rounded-md">Past Experiences</TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="pt-6 space-y-6">
              {MOCK_EVENTS.slice(0, 2).map((event) => (
                <TicketCard key={event.id} event={event} />
              ))}
            </TabsContent>

            <TabsContent value="past" className="pt-6">
              <div className="text-center py-20 bg-card/30 rounded-2xl border border-dashed border-border">
                <History className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                <p className="text-muted-foreground">No past events recorded yet.</p>
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
    <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${active ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-secondary hover:text-white'}`}>
      <Icon className="w-5 h-5" />
      {label}
    </button>
  );
}

function StatCard({ label, value, color }: any) {
  const colorClass = color === 'primary' ? 'text-primary' : color === 'accent' ? 'text-accent' : 'text-white';
  return (
    <Card className="bg-card border-border overflow-hidden">
      <CardContent className="p-6">
        <span className="text-sm text-muted-foreground uppercase tracking-wider font-bold">{label}</span>
        <div className={`text-4xl font-headline mt-2 ${colorClass}`}>{value}</div>
      </CardContent>
    </Card>
  );
}

function TicketCard({ event }: any) {
  return (
    <div className="group relative bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/50 transition-all flex flex-col md:flex-row">
      <div className="relative w-full md:w-48 aspect-square md:aspect-auto">
        <img src={event.image} alt="" className="object-cover w-full h-full" />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <QrCode className="w-12 h-12 text-white" />
        </div>
      </div>
      
      <div className="flex-1 p-6 flex flex-col justify-center">
        <div className="flex items-center justify-between mb-4">
          <Badge className="bg-primary/20 text-primary border-none">CONFIRMED</Badge>
          <span className="text-xs text-muted-foreground font-mono">TKT-8273-192</span>
        </div>
        <h3 className="font-headline text-xl mb-2">{event.title}</h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" /> {new Date(event.date).toLocaleDateString()}
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" /> {event.venue}
          </div>
        </div>
      </div>

      <div className="p-6 bg-secondary/30 flex flex-col justify-center gap-3 border-l border-border md:w-48">
        <Button size="sm" className="w-full rounded-full gap-2">
          <QrCode className="w-4 h-4" /> View Ticket
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1 rounded-full"><Download className="w-4 h-4" /></Button>
          <Button variant="outline" size="sm" className="flex-1 rounded-full"><Share2 className="w-4 h-4" /></Button>
        </div>
      </div>
    </div>
  );
}
