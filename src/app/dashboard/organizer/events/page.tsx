
"use client";

import React, { useState, useEffect } from 'react';
import { 
  Ticket, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  ExternalLink, 
  BarChart3, 
  Users, 
  Trash2, 
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Link from 'next/link';
import { useToast } from "@/hooks/use-toast";
import { useEvents } from '@/hooks/use-events';
import { apiFetch } from '@/lib/api-fetch';
import { useAuth } from '@/components/auth-provider';
import type { EventDoc } from '@/lib/db';

export default function MyEventsPage() {
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [eventToCancel, setEventToCancel] = useState<EventDoc | null>(null);
  const { toast } = useToast();
  const { profile } = useAuth();
  const { events: allEvents, refetch } = useEvents();
  const [eventStats, setEventStats] = useState<Record<string, {sold: number; revenueNgn: number}>>({});
  const [removedIds, setRemovedIds] = useState<string[]>([]);

  // My events: admins see everything; organizers see what they created.
  const isMine = (e: EventDoc) => {
    if (!profile) return false;
    if (profile.role === 'admin') return true;
    const meta = e as {organizerEmail?: string; organizerUid?: string};
    return meta.organizerEmail === profile.email || meta.organizerUid === profile.uid;
  };
  const myEvents = allEvents.filter((e) => isMine(e) && !removedIds.includes(e.id));

  useEffect(() => {
    apiFetch('/api/events/stats')
      .then((r) => r.json())
      .then((d) => {
        if (d && d.stats) setEventStats(d.stats);
      })
      .catch(() => undefined);
  }, []);

  const handleCancelIntent = (event: EventDoc) => {
    setEventToCancel(event);
    setIsCancelDialogOpen(true);
  };

  const confirmCancelEvent = async () => {
    if (!eventToCancel) return;
    try {
      const res = await apiFetch('/api/events', {
        method: 'DELETE',
        body: JSON.stringify({id: eventToCancel.id}),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not cancel the event.');
      setRemovedIds((prev) => [...prev, eventToCancel.id]);
      refetch();
      toast({
        title: "Event Cancelled",
        description: `"${eventToCancel.title}" has been unlisted from the marketplace.`,
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Cancellation Failed",
        description: err instanceof Error ? err.message : 'Please try again.',
      });
    } finally {
      setIsCancelDialogOpen(false);
      setEventToCancel(null);
    }
  };

  return (
    <div className="p-4 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="text-left">
            <h1 className="font-headline mb-2 text-3xl md:text-5xl">My Events</h1>
            <p className="text-muted-foreground">Manage your upcoming and past experiences.</p>
          </div>
          <Link href="/dashboard/organizer/create" className="no-underline">
            <Button className="rounded-full gap-2 px-6 shadow-lg shadow-primary/20 font-bold">
              <Plus className="w-4 h-4" /> Create New
            </Button>
          </Link>
        </header>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input placeholder="Search your events..." className="pl-10 h-11 bg-card" />
          </div>
          <Button variant="outline" className="rounded-xl gap-2 h-11">
            <Filter className="w-4 h-4" /> Filters
          </Button>
        </div>

        <div className="grid gap-6">
          {myEvents.length === 0 && (
            <div className="text-center py-24 bg-card/20 rounded-[3rem] border border-dashed border-border/50">
              <Ticket className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground font-medium">You have no events yet. Create your first event to go live.</p>
            </div>
          )}
          {myEvents.map((event) => (
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
                      <p className="text-muted-foreground flex items-center gap-1">{event.venue} · {new Date(event.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex flex-wrap items-center gap-y-6 gap-x-8 border-t border-border pt-6">
                    <div className="flex flex-wrap items-center gap-8 flex-1">
                      <div className="space-y-0.5">
                        <span className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Tickets Sold</span>
                        <div className="font-bold">{eventStats[event.id]?.sold ?? 0}/{event.inventory ?? '—'}</div>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Revenue</span>
                        <div className="font-bold text-primary">₦{(eventStats[event.id]?.revenueNgn ?? 0).toLocaleString()}</div>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Status</span>
                        <div className={`flex items-center gap-1 font-bold text-sm ${new Date(event.date).getTime() >= Date.now() ? 'text-green-500' : 'text-muted-foreground'}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${new Date(event.date).getTime() >= Date.now() ? 'bg-green-500' : 'bg-muted-foreground'}`} />{' '}
                          {new Date(event.date).getTime() >= Date.now() ? 'Live' : 'Ended'}
                        </div>
                      </div>
                    </div>

                    <div className="w-full lg:w-auto flex items-center gap-2 lg:ml-auto">
                      <Link href={`/dashboard/organizer/create?id=${event.id}`} className="flex-1 lg:flex-none">
                        <Button variant="outline" size="sm" className="w-full rounded-full h-10 font-bold px-6">Edit</Button>
                      </Link>
                      <Link href={`/events/${event.slug || event.id}`} className="flex-1 lg:flex-none">
                         <Button size="sm" variant="ghost" className="w-full rounded-full gap-2 h-10 font-bold px-6">View <ExternalLink className="w-3.5 h-3.5" /></Button>
                      </Link>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="secondary" size="icon" className="rounded-full h-10 w-10 shrink-0" title="More Options">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52 bg-card border-border">
                          <DropdownMenuItem className="gap-2 font-bold cursor-pointer" asChild>
                            <Link href={`/dashboard/organizer/analytics?id=${event.id}`}>
                              <BarChart3 className="w-4 h-4" /> Detailed Analytics
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 font-bold cursor-pointer" asChild>
                            <Link href={`/dashboard/organizer/vendors?id=${event.id}`}>
                              <Users className="w-4 h-4" /> Manage Vendors
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="gap-2 font-bold text-red-500 hover:text-red-600 cursor-pointer"
                            onClick={() => handleCancelIntent(event)}
                          >
                            <Trash2 className="w-4 h-4" /> Cancel Event
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <AlertDialogContent className="bg-card border-border sm:rounded-[2.5rem] p-8">
          <AlertDialogHeader className="text-left">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <AlertDialogTitle className="font-headline text-2xl">Cancel this event?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground leading-relaxed">
              This will immediately unlist <strong>{eventToCancel?.title}</strong> and initiate the refund process for all paid ticket holders. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-3 pt-6">
            <AlertDialogCancel className="flex-1 rounded-full font-bold h-11 border-2">Keep Event</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmCancelEvent}
              className="flex-1 rounded-full font-bold h-11 bg-red-500 hover:bg-red-600 text-white border-none"
            >
              Cancel Event
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
