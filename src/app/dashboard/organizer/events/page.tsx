"use client";

import React from 'react';
import { Ticket, Plus, Search, Filter, MoreVertical, ExternalLink } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MOCK_EVENTS } from '@/lib/mock-data';
import Link from 'next/link';
import { Logo } from '@/components/logo';
import { SidebarLink } from '../page';
import { usePathname } from 'next/navigation';

export default function MyEventsPage() {
  const pathname = usePathname();
  
  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row pt-32">
      <aside className="w-64 bg-sidebar border-r border-sidebar-border p-6 flex flex-col hidden md:flex sticky top-0 h-screen">
        <Link href="/" className="mb-10 block"><Logo size="sm" /></Link>
        <nav className="flex-1 space-y-1">
          <SidebarLink icon={Ticket} label="My Events" href="/dashboard/organizer/events" active={pathname === '/dashboard/organizer/events'} />
          <Button variant="ghost" size="sm" className="w-full justify-start text-xs font-bold text-muted-foreground hover:text-primary mt-4 px-4" asChild>
            <Link href="/dashboard/organizer">← Back to Overview</Link>
          </Button>
        </nav>
      </aside>

      <main className="flex-1 p-4 md:p-12">
        <div className="max-w-6xl mx-auto space-y-8">
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="text-left">
              <h1 className="font-headline text-3xl mb-2">My Events</h1>
              <p className="text-muted-foreground">Manage your upcoming and past experiences.</p>
            </div>
            <Link href="/dashboard/organizer/create">
              <Button className="rounded-full gap-2 px-6 h-12 shadow-lg shadow-primary/20 font-bold">
                <Plus className="w-4 h-4" /> Create New
              </Button>
            </Link>
          </header>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input placeholder="Search your events..." className="pl-10 h-12 bg-card" />
            </div>
            <Button variant="outline" className="h-12 rounded-xl gap-2">
              <Filter className="w-4 h-4" /> Filters
            </Button>
          </div>

          <div className="grid gap-6">
            {MOCK_EVENTS.slice(0, 4).map((event) => (
              <Card key={event.id} className="overflow-hidden border-border hover:border-primary/30 transition-all shadow-sm">
                <CardContent className="p-0 flex flex-col sm:flex-row">
                  <div className="relative w-full sm:w-48 aspect-video sm:aspect-square">
                    <img src={event.image} alt="" className="object-cover w-full h-full" />
                  </div>
                  <div className="flex-1 p-6 flex flex-col justify-between text-left">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <Badge className="bg-primary/10 text-primary border-none uppercase text-[10px] font-black">{event.category}</Badge>
                        <h3 className="font-headline text-xl font-bold">{event.title}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">{event.venue} · {new Date(event.date).toLocaleDateString()}</p>
                      </div>
                      <Button variant="ghost" size="icon"><MoreVertical className="w-5 h-5" /></Button>
                    </div>
                    <div className="mt-6 flex flex-wrap items-center gap-8 border-t border-border pt-6">
                      <div className="space-y-0.5">
                        <span className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Tickets Sold</span>
                        <div className="font-bold">42/100</div>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Revenue</span>
                        <div className="font-bold text-primary">₦210,000</div>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Status</span>
                        <div className="flex items-center gap-1 text-green-500 font-bold text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500" /> Live
                        </div>
                      </div>
                      <div className="ml-auto flex gap-2">
                        <Button variant="outline" size="sm" className="rounded-full">Edit</Button>
                        <Link href={`/events/${event.id}`}>
                           <Button size="sm" variant="ghost" className="rounded-full gap-1">View <ExternalLink className="w-3.5 h-3.5" /></Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}