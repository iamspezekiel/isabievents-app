
"use client";

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  CheckCircle2, 
  Calendar, 
  MapPin, 
  ExternalLink, 
  Loader2,
  UserCheck,
  Ban,
  Pencil,
  Trash2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Link from 'next/link';
import { useEvents } from '@/hooks/use-events';
import { apiFetch } from '@/lib/api-fetch';
import type { EventDoc } from '@/lib/db';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
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

export default function AdminEventsManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const {events: allEvents, refetch} = useEvents();
  const [events, setEvents] = useState<EventDoc[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [eventToDelete, setEventToDelete] = useState<EventDoc | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setEvents(allEvents);
  }, [allEvents]);

  // Admin is the organizer/owner — can delete any event listing.
  const confirmDeleteEvent = async () => {
    if (!eventToDelete) return;
    try {
      const res = await apiFetch('/api/events', {
        method: 'DELETE',
        body: JSON.stringify({id: eventToDelete.id}),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not delete the event.');
      setEvents(prev => prev.filter(e => e.id !== eventToDelete.id));
      refetch();
      toast({
        title: "Event Deleted",
        description: `"${eventToDelete.title}" has been removed from the platform.`,
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: err instanceof Error ? err.message : 'Please try again.',
      });
    } finally {
      setEventToDelete(null);
    }
  };

  const handleAction = async (id: string, title: string, action: 'approve' | 'reject') => {
    setProcessingId(id);
    // Persist the moderation action server-side.
    let failed = '';
    try {
      const res = await apiFetch('/api/admin/events', {method: 'PATCH', body: JSON.stringify({id, action})});
      const data = await res.json().catch(() => ({}));
      if (!res.ok) failed = data.error || 'Moderation action failed.';
    } catch (err) {
      failed = err instanceof Error ? err.message : 'Network error.';
    }
    if (failed) {
      setProcessingId(null);
      toast({variant: 'destructive', title: 'Action Failed', description: failed});
      return;
    }
    
    setEvents(prev => action === 'approve'
      ? prev.map(e => e.id === id ? {...e, organizer: {...(e.organizer || {}), verified: true}} : e)
      : prev.filter(e => e.id !== id));
    setProcessingId(null);

    if (action === 'approve') {
      toast({
        title: "Event Approved",
        description: `"${title}" is now live on the marketplace.`,
      });
    } else {
      toast({
        variant: "destructive",
        title: "Event Rejected",
        description: `"${title}" has been removed from the platform.`,
      });
    }
  };

  const filteredEvents = events.filter(event => 
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (event.organizer?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingModeration = filteredEvents.filter(event => !event.organizer?.verified);
  const autoApproved = filteredEvents.filter(event => event.organizer?.verified);

  return (
    <div className="p-4 pb-16 md:p-12 md:pb-16 space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="text-left space-y-1">
          <h1 className="font-headline text-2xl md:text-4xl">Event Moderation</h1>
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
        <TabsList className="bg-secondary/50 p-1 rounded-2xl mb-8 w-full sm:w-auto h-auto sm:h-11 flex overflow-x-auto">
          <TabsTrigger 
            value="pending" 
            className="rounded-xl px-2 sm:px-8 font-bold flex-1 sm:flex-none py-2.5 sm:py-1.5 text-[10px] sm:text-sm whitespace-nowrap"
          >
            Pending Review ({pendingModeration.length})
          </TabsTrigger>
          <TabsTrigger 
            value="approved" 
            className="rounded-xl px-2 sm:px-8 font-bold flex-1 sm:flex-none py-2.5 sm:py-1.5 text-[10px] sm:text-sm whitespace-nowrap"
          >
            Auto-Approved ({autoApproved.length})
          </TabsTrigger>
          <TabsTrigger 
            value="all" 
            className="rounded-xl px-2 sm:px-8 font-bold flex-1 sm:flex-none py-2.5 sm:py-1.5 text-[10px] sm:text-sm whitespace-nowrap"
          >
            All Events
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingModeration.length > 0 ? pendingModeration.map((event) => (
            <ModerationRow 
              key={event.id} 
              event={event} 
              type="pending" 
              onAction={handleAction}
              onDelete={setEventToDelete}
              processingId={processingId}
            />
          )) : (
            <div className="bg-card border border-dashed border-border py-24 rounded-[3rem] text-center">
              <CheckCircle2 className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
              <p className="text-muted-foreground font-medium">No events currently pending manual review.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          {autoApproved.map((event) => (
            <ModerationRow 
              key={event.id} 
              event={event} 
              type="approved" 
              onAction={handleAction}
              onDelete={setEventToDelete}
              processingId={processingId}
            />
          ))}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {filteredEvents.map((event) => (
            <ModerationRow 
              key={event.id} 
              event={event} 
              type="all" 
              onAction={handleAction}
              onDelete={setEventToDelete}
              processingId={processingId}
            />
          ))}
        </TabsContent>
      </Tabs>

      <AlertDialog open={!!eventToDelete} onOpenChange={(open) => !open && setEventToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this event?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove &quot;{eventToDelete?.title}&quot; from the platform. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmDeleteEvent();
              }}
              className="bg-red-500 hover:bg-red-600 text-white border-none font-bold"
            >
              Delete Event
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ModerationRow({ event, type, onAction, onDelete, processingId }: { 
  event: any, 
  type: string, 
  onAction: (id: string, title: string, action: 'approve' | 'reject') => void,
  onDelete: (event: any) => void,
  processingId: string | null
}) {
  const isVerified = event.organizer?.verified;
  const isProcessing = processingId === event.id;

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
        {(type === 'pending' || !isVerified) ? (
          <>
            <Button 
              variant="outline" 
              size="sm" 
              disabled={isProcessing}
              onClick={() => onAction(event.id, event.title, 'approve')}
              className="flex-1 lg:flex-none rounded-full gap-2 border-green-500/20 text-green-500 hover:bg-green-500/5 h-10 px-6 font-bold"
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />} 
              Approve
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              disabled={isProcessing}
              onClick={() => onAction(event.id, event.title, 'reject')}
              className="flex-1 lg:flex-none rounded-full gap-2 border-red-500/20 text-red-500 hover:bg-red-500/5 h-10 px-6 font-bold"
            >
              <Ban className="w-4 h-4" /> Reject
            </Button>
          </>
        ) : (
          <Badge className="bg-green-500/10 text-green-500 border-none py-2 px-4 rounded-full font-bold">Live & Verified</Badge>
        )}
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/organizer/create?id=${event.id}`} className="no-underline">
            <Button variant="outline" size="sm" className="rounded-full h-10 w-10 p-0 border-border hover:border-primary/40" title="Edit event">
              <Pencil className="w-4 h-4" />
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full h-10 w-10 p-0 border-border hover:border-red-500/40 text-red-500 hover:text-red-600"
            title="Delete event"
            onClick={() => onDelete(event)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
          <Link href={`/events/${event.slug}`} className="no-underline">
            <Button variant="ghost" size="icon" className="rounded-full h-10 w-10"><ExternalLink className="w-4 h-4" /></Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
