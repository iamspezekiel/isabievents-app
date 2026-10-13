"use client";

import React, { useState, useEffect } from 'react';
import { 
  Ticket, 
  History, 
  Heart, 
  QrCode, 
  Download, 
  Share2, 
  Calendar, 
  MapPin, 
  Smartphone,
  Sparkles,
  ChevronRight,
  Loader2,
  CloudOff,
  Cloud,
  RefreshCw,
  ShieldCheck,
  X,
  Send,
  Mail,
  Ban,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CATEGORIES } from '@/lib/constants';
import { useEvents } from '@/hooks/use-events';
import { useAuth } from '@/components/auth-provider';
import { getTicketsForEmail } from '@/lib/client-db';
import type { EventDoc, OrderDoc, TicketDoc } from '@/lib/db-types';
import { getFavorites } from '@/lib/favorites';
import { apiFetch } from '@/lib/api-fetch';
import { lagosTs, formatEventDate, formatEventDateTime, describeDeadline } from '@/lib/timezone';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { attendeePersonalizedEventRecommendations } from '@/ai/flows/attendee-personalized-event-recommendations';
import { useToast } from "@/hooks/use-toast";

/**
 * Local, dependency-free ranking for "Recommended for You": scores upcoming
 * events against what the attendee already bought/saved, their home city and
 * the event's timing — so the section always has relevant picks even when the
 * AI flow is unavailable (the AI result refines it when it succeeds).
 */
function rankEvents(
  eventsList: EventDoc[],
  opts: {pastTitles?: string[]; savedIds?: string[]; city?: string} = {}
): EventDoc[] {
  const now = Date.now();
  const saved = new Set(opts.savedIds || []);
  const past = new Set((opts.pastTitles || []).map((t) => t.toLowerCase()));
  // Categories the attendee has already bought tickets for.
  const pastCats = new Set(
    eventsList
      .filter((e) => past.has(String(e.title).toLowerCase()))
      .map((e) => String(e.category || '').toLowerCase())
  );
  // Ends (Africa/Lagos): endDate when set, else the start.
  const endOf = (e: EventDoc) => lagosTs(e.endDate || e.date);
  return [...eventsList]
    .filter((e) => e?.title && endOf(e) >= now)
    .map((e) => {
      let score = 0;
      if (saved.has(e.id) || (e.slug && saved.has(String(e.slug)))) score += 6;
      if (past.has(String(e.title).toLowerCase())) score -= 5; // already bought
      if (pastCats.has(String(e.category || '').toLowerCase())) score += 4;
      if (opts.city && String(e.city || '').toLowerCase() === opts.city.toLowerCase()) score += 3;
      if (e.organizer?.verified) score += 1;
      const days = (endOf(e) - now) / 86_400_000;
      if (days <= 14) score += 2;
      else if (days <= 60) score += 1;
      return {e, score};
    })
    .sort(
      (a, b) =>
        b.score - a.score ||
        (new Date(a.e.date).getTime() || 0) - (new Date(b.e.date).getTime() || 0)
    )
    .map((x) => x.e);
}

export default function AttendeeDashboard() {
  const [mounted, setMounted] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);

  // Transfer state
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [transferTicket, setTransferTicket] = useState<any>(null);
  const [transferEmail, setTransferEmail] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);

  // View state
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewTicket, setViewTicket] = useState<any>(null);

  const { toast } = useToast();
  const { profile } = useAuth();
  const { events } = useEvents({includeHidden: true});
  const [tickets, setTickets] = useState<TicketDoc[]>([]);
  const [pastOrders, setPastOrders] = useState<OrderDoc[]>([]);
  const [savedCount, setSavedCount] = useState(0);
  // Favorites are stored in the database (favorites/{uid}) — never locally.
  const [favIds, setFavIds] = useState<string[]>([]);
  // The attendee's refund/cancellation requests (drives status + progress).
  const [refunds, setRefunds] = useState<any[]>([]);
  const recsRunRef = React.useRef(false);

  useEffect(() => {
    setMounted(true);
    // Saved favorites come fresh from the database.
    getFavorites()
      .then((ids) => {
        setFavIds(ids);
        setSavedCount(ids.length);
      })
      .catch(() => undefined);
    if (profile?.email) {
      getTicketsForEmail(profile.email).then(setTickets).catch(() => undefined);
      // Orders come from the API (Admin SDK) — the client query needed a
      // composite index that was never deployed and always returned empty.
      apiFetch('/api/orders')
        .then((r) => r.json())
        .then((d) => {
          if (d && Array.isArray(d.orders)) setPastOrders(d.orders as OrderDoc[]);
        })
        .catch(() => undefined);
    }
    // Refund/cancellation status (reloaded after a request changes tickets).
    apiFetch('/api/refunds')
      .then((r) => r.json())
      .then((d) => {
        if (d && Array.isArray(d.refunds)) setRefunds(d.refunds);
      })
      .catch(() => undefined);
  }, [profile?.email, tickets]);

  // "Recommended for You": rank locally the moment the event list (or the
  // order history) changes — instant and always available — then refine once
  // with the AI flow when the model is reachable.
  useEffect(() => {
    if (events.length === 0) return;
    setRecommendations(
      rankEvents(events, {
        pastTitles: pastOrders.filter((o) => o.status === 'paid').map((o) => o.eventTitle),
        savedIds: favIds,
        city: profile?.city,
      }).slice(0, 6)
    );
    if (!recsRunRef.current) {
      recsRunRef.current = true;
      fetchRecommendations(events);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events, pastOrders, favIds, profile?.city]);

  const fetchRecommendations = async (eventsList: EventDoc[]) => {
    setLoadingRecs(true);
    try {
      if (eventsList.length === 0) {
        setRecommendations([]);
        return;
      }
      // Signals from the real account: paid orders + saved (favorited) events.
      let past: string[] = [];
      if (profile?.email) {
        try {
          const res = await apiFetch('/api/orders');
          const data = await res.json();
          if (Array.isArray(data.orders)) {
            const orders = data.orders as OrderDoc[];
            past = orders.filter((o) => o.status === 'paid').map((o) => o.eventTitle);
            setPastOrders(orders);
          }
        } catch {
          /* no order history */
        }
      }
      const saved = favIds;
      const savedTitles = eventsList.filter((e) => saved.includes(e.id)).map((e) => e.title);
      const pastCategories = eventsList
        .filter((e) => past.includes(e.title))
        .map((e) => e.category);

      const result = await attendeePersonalizedEventRecommendations({
        pastPurchases: past.slice(0, 10),
        savedEvents: savedTitles.slice(0, 10),
        browsingHistory: pastCategories.slice(0, 10),
        eventCategories: CATEGORIES.map(c => c.name),
        availableEvents: eventsList.map(e => ({
          id: e.id,
          title: e.title,
          category: e.category,
          description: e.description || ''
        }))
      });
      
      const recommendedEvents = eventsList.filter(e => result.recommendedEventIds.includes(e.id));
      // Only overwrite when the model actually picked something — the local
      // ranking set by the effect above already fills the section.
      if (recommendedEvents.length > 0) setRecommendations(recommendedEvents);
    } catch (error) {
      /* keep the local ranking already rendered */
    } finally {
      setLoadingRecs(false);
    }
  };

  const handleTransfer = async () => {
    if (!transferEmail) {
      toast({ variant: "destructive", title: "Email Required", description: "Please enter the recipient's email address." });
      return;
    }
    if (!transferTicket?.ticketId) {
      toast({ variant: "destructive", title: "No Ticket Selected", description: "Select a ticket to transfer." });
      return;
    }
    setIsTransferring(true);
    try {
      const res = await apiFetch('/api/tickets/transfer', {
        method: 'POST',
        body: JSON.stringify({ticketId: transferTicket.ticketId, toEmail: transferEmail.trim()}),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Transfer failed.');
      setTickets(prev => prev.filter(t => t.id !== transferTicket.ticketId));
      toast({
        title: "Ticket Transferred!",
        description: `Your ticket for ${transferTicket.title} has been sent to ${transferEmail}.`,
      });
      setIsTransferOpen(false);
      setTransferEmail('');
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Transfer Failed",
        description: err instanceof Error ? err.message : 'Please try again.',
      });
    } finally {
      setIsTransferring(false);
    }
  };

  // ---- Registered events: every ticket joined to its event document --------
  const registeredTickets = tickets
    .filter(t => t.status !== 'transferred')
    .map(t => {
      const ev = events.find(e => e.id === t.eventId) as EventDoc | undefined;
      const refund = refunds.find(r => r.ticketId === t.id) || null;
      return {
        id: t.id,
        ticketId: t.id,
        orderId: t.orderId,
        eventId: t.eventId,
        code: t.code,
        status: String(t.status || 'active'),
        refundable: (t as {refundable?: boolean}).refundable === true,
        refundDeadline: String((t as {refundDeadline?: string}).refundDeadline || ''),
        refundCutoffHours: Number((t as {refundCutoffHours?: number}).refundCutoffHours) || 0,
        refund,
        title: t.eventTitle || ev?.title || 'Event',
        image: ev?.image || 'https://placehold.co/600x600?text=Event',
        date: ev?.date || String(t.createdAt || new Date().toISOString()),
        endDate: ev?.endDate || '',
        venue: ev?.venue || '—',
        city: ev?.city || '',
        // Africa/Lagos end (endDate when set, else the start). Deleted events → 0.
        endMs: ev ? lagosTs(ev.endDate || ev.date) : 0,
      };
    });

  const nowTs = Date.now();
  const isLive = (r: {endMs: number}) => r.endMs > 0 && r.endMs >= nowTs;
  // Upcoming = the event hasn't ended yet, NEAREST DATE FIRST (Africa/Lagos).
  const upcomingTickets = registeredTickets.filter(isLive).sort((a, b) => a.endMs - b.endMs);
  // Past = the event's end date has passed (incl. deleted events), most recent first.
  const pastTickets = registeredTickets.filter(r => !isLive(r)).sort((a, b) => b.endMs - a.endMs);
  const activeCount = tickets.filter(t => t.status === 'active').length;
  const usedCount = tickets.filter(t => t.status === 'used').length;
  const paidOrders = pastOrders.filter(o => o.status === 'paid');

  /** Human-readable refund progress for a cancelled/refunded ticket. */
  const refundProgress = (item: any): {label: string; tone: string} | null => {
    const st = item?.refund?.status;
    if (item.status === 'refunded') return {label: 'Refunded — completed', tone: 'text-green-500'};
    if (st === 'completed') return {label: 'Refund completed', tone: 'text-green-500'};
    if (st === 'approved') return {label: 'Refund approved — processing', tone: 'text-green-500'};
    if (st === 'requested') return {label: 'Cancellation under review', tone: 'text-yellow-500'};
    if (st === 'declined') return {label: 'Cancellation declined — ticket valid', tone: 'text-muted-foreground'};
    if (item.status === 'cancelled') return {label: 'Cancelled — awaiting review', tone: 'text-yellow-500'};
    return null;
  };

  // ---- Attendee ticket cancellation (refund workflow) ---------------------
  const [cancelItem, setCancelItem] = useState<any>(null);
  const [cancelCheck, setCancelCheck] = useState<any>(null);
  const [cancelNote, setCancelNote] = useState('');
  const [cancelBusy, setCancelBusy] = useState<'check' | 'submit' | null>(null);

  const refreshTickets = () => {
    if (profile?.email) getTicketsForEmail(profile.email).then(setTickets).catch(() => undefined);
  };

  /** Step 1: ask the server whether this ticket may be cancelled right now. */
  const openCancel = (item: any) => {
    setCancelItem(item);
    setCancelCheck(null);
    setCancelNote('');
    setCancelBusy('check');
    apiFetch('/api/refunds', {
      method: 'POST',
      body: JSON.stringify({action: 'eligibility', ticketId: item.ticketId}),
    })
      .then((r) => r.json())
      .then((d) => setCancelCheck(d))
      .catch(() => setCancelCheck({eligible: false, reason: 'Could not check eligibility. Please try again.'}))
      .finally(() => setCancelBusy(null));
  };

  /** Step 2: submit the cancellation (server re-checks everything). */
  const submitCancel = async () => {
    if (!cancelItem) return;
    setCancelBusy('submit');
    try {
      const res = await apiFetch('/api/refunds', {
        method: 'POST',
        body: JSON.stringify({action: 'request', ticketId: cancelItem.ticketId, note: cancelNote}),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.error) throw new Error(data?.error || 'Could not submit your cancellation.');
      const title = cancelItem.title;
      setCancelItem(null);
      setCancelCheck(null);
      setCancelNote('');
      refreshTickets();
      toast({
        title: 'Cancellation Requested',
        description: `Your ticket for "${title}" is now under review. We'll notify you once it's decided.`,
      });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Could Not Cancel',
        description: err instanceof Error ? err.message : 'Please try again.',
      });
    }
    setCancelBusy(null);
  };

  return (
    <div className="p-4 pb-16 md:p-8 md:pb-16 lg:p-12 lg:pb-16 space-y-8 md:space-y-12 max-w-5xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1 text-left">
          <h1 className="font-headline text-2xl md:text-4xl tracking-tighter">Hi, {profile?.name || profile?.email?.split('@')[0] || 'there'} 👋</h1>
          <p className="text-muted-foreground font-medium">You have {activeCount} upcoming {activeCount === 1 ? 'ticket' : 'tickets'}.</p>
        </div>
        <Link href="/discover" className="w-full sm:w-auto no-underline">
          <Button className="w-full rounded-full px-8 shadow-xl shadow-primary/20 h-11 font-bold">Discover Events</Button>
        </Link>
      </header>

      <div className="grid grid-cols-3 gap-2 md:gap-6">
        <StatBox label="Active" value={activeCount} color="primary" icon={Ticket} />
        <StatBox label="Used" value={usedCount} color="accent" icon={History} />
        <StatBox label="Saved" value={savedCount} color="white" icon={Heart} />
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="bg-secondary/50 p-1 rounded-2xl w-full sm:w-auto mb-8">
          <TabsTrigger value="upcoming" className="rounded-xl px-8 flex-1 sm:flex-none font-bold">Upcoming</TabsTrigger>
          <TabsTrigger value="past" className="rounded-xl px-8 flex-1 sm:flex-none font-bold">Past</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-6">
          {upcomingTickets.length === 0 ? (
            <div className="text-center py-16 bg-card/20 rounded-[2rem] border border-dashed border-border/50">
              <Ticket className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground font-medium">No upcoming tickets yet.</p>
              <Link href="/discover" className="inline-block mt-4 text-primary font-bold text-sm">Browse events →</Link>
            </div>
          ) : (
            upcomingTickets.map((event) =>
              event.status === 'cancelled' || event.status === 'refunded' ? (
                /* Cancelled events stay visible with their refund progress. */
                <CancelledTicketRow key={event.ticketId} item={event} progress={refundProgress(event)} />
              ) : (
                <TicketCard
                  key={event.ticketId}
                  event={event}
                  mounted={mounted}
                  onTransfer={() => { setTransferTicket(event); setIsTransferOpen(true); }}
                  onView={() => { setViewTicket(event); setIsViewOpen(true); }}
                  onDownload={() => { setViewTicket(event); setIsViewOpen(true); setTimeout(() => window.print(), 400); }}
                />
              )
            )
          )}
        </TabsContent>

        <TabsContent value="past" className="pt-12">
          {pastTickets.length === 0 ? (
            <div className="text-center py-24 bg-card/20 rounded-[3rem] border border-dashed border-border/50">
              <History className="w-16 h-16 text-muted-foreground mx-auto mb-6 opacity-10" />
              <p className="text-muted-foreground font-medium">No past events yet — they'll appear here once their end date passes.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pastTickets.map((item) => {
                const order = pastOrders.find(o => o.id === item.orderId);
                const progress = refundProgress(item);
                const cancelled = item.status === 'cancelled' || item.status === 'refunded';
                const statusLabel = cancelled
                  ? item.status === 'refunded' ? 'Refunded' : 'Cancelled'
                  : item.status === 'used' ? 'Attended' : 'Expired';
                return (
                  <div
                    key={item.ticketId}
                    className={`bg-card border p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-left ${
                      cancelled ? 'border-red-500/30' : 'border-border'
                    }`}
                  >
                    <div className="space-y-1">
                      <p className="font-bold">{item.title}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatEventDate(item.date)}
                        {item.venue !== '—' && <span className="opacity-60">· {item.venue}</span>}
                      </p>
                      <p className="text-[10px] font-mono uppercase text-muted-foreground/60">{item.code}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="font-bold text-primary">
                        {order
                          ? order.currency === 'USD'
                            ? `$${order.unitPrice.toFixed(2)}`
                            : `₦${order.unitPrice.toLocaleString()}`
                          : '—'}
                      </p>
                      <p
                        className={`text-[10px] font-black uppercase tracking-widest ${
                          cancelled ? 'text-red-500' : item.status === 'used' ? 'text-green-500' : 'text-muted-foreground'
                        }`}
                      >
                        {statusLabel}
                      </p>
                      {progress && <p className={`text-[11px] font-bold ${progress.tone}`}>{progress.label}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <h2 className="font-headline text-xl">Recommended for You</h2>
          </div>
          <Link href="/discover" className="text-xs font-bold text-primary hover:underline">See more</Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {loadingRecs ? (
            [1,2,3].map(i => <div key={i} className="h-48 bg-card animate-pulse rounded-3xl" />)
          ) : (
            recommendations.map((event) => (
              <Link key={event.id} href={`/events/${event.slug || event.id}`} className="group">
                <div className="bg-card border border-border rounded-3xl overflow-hidden hover:border-primary/50 transition-all p-4 h-full flex flex-col">
                  <div className="relative aspect-video rounded-2xl overflow-hidden mb-4">
                    <img src={event.image} alt="" className="object-cover w-full h-full group-hover:scale-105 transition-transform" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <Badge className="absolute bottom-2 left-2 bg-white/20 backdrop-blur-md text-[8px] text-white border-none">{event.category.toUpperCase()}</Badge>
                  </div>
                  <div className="text-left space-y-1 flex-1">
                    <h4 className="font-bold text-sm line-clamp-1 group-hover:text-primary transition-colors">{event.title}</h4>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3 text-accent" /> {event.city}</p>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="font-black text-xs text-primary">₦{event.price.min.toLocaleString()}</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Dialogs */}
      <Dialog open={isTransferOpen} onOpenChange={setIsTransferOpen}>
        <DialogContent className="bg-card border-border sm:rounded-[2.5rem] p-8 max-w-md w-[94vw] sm:w-full">
          <DialogHeader className="text-left">
            <DialogTitle className="font-headline text-2xl flex items-center gap-3">
              <Send className="w-5 h-5 text-primary" /> Transfer Ticket
            </DialogTitle>
            <DialogDescription>
              Transfer your ticket for <strong>{transferTicket?.title}</strong> to a friend.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 space-y-4">
            <Label>Recipient's Email</Label>
            <Input 
              placeholder="friend@example.com" 
              className="h-12"
              value={transferEmail}
              onChange={(e) => setTransferEmail(e.target.value)}
            />
          </div>
          <DialogFooter className="flex-row gap-3">
            <Button onClick={handleTransfer} disabled={isTransferring} className="flex-1 rounded-full font-bold">
              {isTransferring ? <Loader2 className="w-4 h-4 animate-spin" /> : "Transfer Now"}
            </Button>
            <Button variant="ghost" onClick={() => setIsTransferOpen(false)} className="rounded-full">Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="bg-card border-border sm:rounded-[2rem] p-0 overflow-hidden max-w-sm w-[94vw] sm:w-full">
          <div className="bg-primary p-6 text-center text-white">
            <DialogTitle className="font-headline text-xl text-white">IsabiEvents</DialogTitle>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Entry Ticket</p>
          </div>
          <div className="p-6 text-center space-y-6">
            <div className="p-4 bg-white rounded-2xl shadow-xl inline-block">
               <QrCode className="w-64 h-64 text-black transition-all" />
            </div>
            
            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Attendee Name</p>
                <p className="text-xl font-bold">{profile?.name || profile?.email || '—'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 border-y border-border/50 py-4">
                <div className="text-left space-y-1">
                  <p className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">Ticket ID</p>
                  <p className="font-mono text-[10px] font-bold uppercase">#{viewTicket?.code || viewTicket?.id?.toUpperCase() || ''}</p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">Status</p>
                  <Badge className="bg-green-500/10 text-green-600 border-none px-2 h-4 text-[7px] font-black uppercase">Confirmed</Badge>
                </div>
              </div>

              <div className="space-y-1 text-left">
                <div className="flex items-center justify-between">
                  <h3 className="font-headline text-lg text-primary">{viewTicket?.title}</h3>
                  <Badge variant="outline" className="text-[8px] font-black uppercase border-primary/20 text-primary">Standard Pass</Badge>
                </div>
                <div className="flex flex-col gap-1 mt-2">
                  <p className="text-muted-foreground text-xs flex items-center gap-1.5 font-medium">
                    <Calendar className="w-3 h-3 text-primary" /> 
                    {mounted
                      ? `${formatEventDateTime(viewTicket?.date, { dateStyle: 'medium', timeStyle: 'short' })}${
                          viewTicket?.endDate &&
                          String(viewTicket.endDate).slice(0, 10) !== String(viewTicket?.date || '').slice(0, 10)
                            ? ` — ${formatEventDateTime(viewTicket?.endDate, { dateStyle: 'medium', timeStyle: 'short' })}`
                            : ''
                        } (Africa/Lagos)`
                      : '...'}
                  </p>
                  <p className="text-muted-foreground text-xs flex items-center gap-1.5 font-medium">
                    <MapPin className="w-3 h-3 text-accent" /> {viewTicket?.venue}, {viewTicket?.city}
                  </p>
                </div>
              </div>
            </div>

            <Button onClick={() => window.print()} className="w-full rounded-full no-print font-bold shadow-lg shadow-primary/20">
              <Download className="w-4 h-4 mr-2" /> Download Ticket (PDF)
            </Button>

            {/* Refund policy + cancellation entry point for this ticket. */}
            <div className="pt-3 space-y-3 text-center">
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Refund policy:{' '}
                <span className={viewTicket?.refundable ? 'text-green-500 font-bold' : 'font-bold'}>
                  {viewTicket?.refundable ? 'Refundable' : 'Non-refundable'}
                </span>
                {viewTicket?.refundable && viewTicket?.refundDeadline
                  ? ` · cancel until ${describeDeadline(viewTicket.refundDeadline, viewTicket.refundCutoffHours)}`
                  : ''}
              </p>
              {viewTicket?.status === 'active' && (
                <Button
                  variant="outline"
                  className="w-full rounded-full font-bold border-red-500/40 text-red-500 hover:bg-red-500/10 gap-2"
                  onClick={() => { setIsViewOpen(false); openCancel(viewTicket); }}
                >
                  <Ban className="w-4 h-4" /> Cancel Ticket
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Attendee ticket-cancellation / refund workflow dialog */}
      <Dialog
        open={!!cancelItem}
        onOpenChange={(open) => {
          if (!open) {
            setCancelItem(null);
            setCancelCheck(null);
            setCancelNote('');
          }
        }}
      >
        <DialogContent className="bg-card border-border sm:rounded-[2rem] p-8 max-w-md w-[94vw] sm:w-full">
          <DialogHeader className="text-left">
            <DialogTitle className="font-headline text-2xl flex items-center gap-3">
              <Ban className="w-5 h-5 text-red-500" /> Cancel Ticket
            </DialogTitle>
            <DialogDescription>
              {cancelItem ? `Request cancellation of your ticket for "${cancelItem.title}".` : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-left">
            {cancelBusy === 'check' || !cancelCheck ? (
              <div className="py-8 text-center">
                <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
                <p className="text-sm text-muted-foreground mt-3">Checking refund eligibility…</p>
              </div>
            ) : cancelCheck.eligible ? (
              <>
                <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-4 space-y-1.5">
                  <p className="text-sm font-bold text-green-500 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Eligible for a refund
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Refundable amount:{' '}
                    <strong>
                      {cancelCheck.currency === 'USD'
                        ? `$${Number(cancelCheck.amount || 0).toFixed(2)}`
                        : `₦${Number(cancelCheck.amount || 0).toLocaleString()}`}
                    </strong>
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Cancellation window:{' '}
                    <strong>{describeDeadline(cancelCheck.deadline, cancelItem.refundCutoffHours)}</strong>
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Once submitted, this ticket is invalid for entry while our team reviews the request.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cancel-reason">Reason (optional)</Label>
                  <Textarea
                    id="cancel-reason"
                    placeholder="Why are you cancelling?"
                    className="min-h-[70px]"
                    value={cancelNote}
                    onChange={(e) => setCancelNote(e.target.value)}
                    maxLength={500}
                  />
                </div>
              </>
            ) : (
              <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 space-y-2">
                <p className="text-sm font-bold text-red-500 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Not eligible for a refund
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {cancelCheck.reason || 'This ticket cannot be cancelled.'}
                </p>
                {cancelCheck.code === 'non_refundable' && (
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    The organizer set this event&apos;s tickets as <strong>non-refundable</strong>. That policy was
                    shown to you before purchase and applies for the life of the ticket.
                  </p>
                )}
              </div>
            )}
          </div>
          <DialogFooter className="flex-row gap-3">
            <Button
              variant="outline"
              className="flex-1 rounded-full font-bold"
              onClick={() => {
                setCancelItem(null);
                setCancelCheck(null);
                setCancelNote('');
              }}
            >
              {cancelCheck?.eligible ? 'Keep My Ticket' : 'Close'}
            </Button>
            {cancelCheck?.eligible && (
              <Button
                className="flex-1 rounded-full font-bold bg-red-500 hover:bg-red-600 text-white"
                onClick={submitCancel}
                disabled={cancelBusy === 'submit'}
              >
                {cancelBusy === 'submit' ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Ban className="w-4 h-4 mr-2" />
                )}
                Request Cancellation
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatBox({ label, value, color, icon: Icon }: any) {
  const colorClass = color === 'primary' ? 'text-primary' : color === 'accent' ? 'text-accent' : 'text-foreground';
  const bgClass = color === 'primary' ? 'bg-primary/10' : color === 'accent' ? 'bg-accent/10' : 'bg-secondary/50';
  return (
    <Card className="bg-card border-border rounded-[1.25rem] md:rounded-[2.5rem] shadow-sm hover:border-primary/40 transition-all">
      <CardContent className="p-3 md:p-8 flex flex-row items-center justify-start gap-2 md:gap-6">
        <div className={cn("w-8 h-8 md:w-16 md:h-16 rounded-xl flex items-center justify-center", bgClass)}>
          <Icon className={cn("w-4 h-4 md:w-8 md:h-8", colorClass)} />
        </div>
        <div className="text-left">
          <div className={cn("text-xl md:text-5xl font-headline font-black leading-none", colorClass)}>{value}</div>
          <span className="text-[8px] md:text-[11px] text-muted-foreground uppercase font-bold block">{label}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function TicketCard({ event, mounted, offline, onTransfer, onView, onDownload }: any) {
  return (
    <div className="group relative bg-card border border-border rounded-[2.5rem] overflow-hidden hover:border-primary/50 transition-all flex flex-col md:flex-row">
      <div className="relative w-full md:w-64 aspect-[16/10] md:aspect-square shrink-0 overflow-hidden cursor-pointer" onClick={onView}>
        <img src={event.image} alt="" className="object-cover w-full h-full transition-transform group-hover:scale-105" />
        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
          <QrCode className="w-12 h-12 text-white mb-2" />
          <span className="text-white text-[10px] font-black uppercase">Show QR</span>
        </div>
        {offline && (
          <Badge className="absolute top-4 left-4 bg-green-500 text-white border-none gap-1">
            <ShieldCheck className="w-3 h-3" /> <span className="text-[8px] font-black">OFFLINE</span>
          </Badge>
        )}
      </div>
      
      <div className="flex-1 p-6 md:p-10 flex flex-col text-left">
        <div className="flex items-center justify-between mb-6">
          <Badge className="bg-primary text-white border-none text-[10px] font-black uppercase">CONFIRMED</Badge>
          <span className="text-[10px] text-muted-foreground font-mono opacity-60">#{event.code || `TKT-${event.id.toUpperCase()}`}</span>
        </div>
        <div className="space-y-4 flex-1">
          <h3 className="font-headline text-2xl md:text-3xl line-clamp-1">{event.title}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-black opacity-60">Schedule</span>
              <div className="flex items-center gap-2 text-sm font-bold">
                <Calendar className="w-4 h-4 text-primary" /> {mounted ? formatEventDate(event.date) : '...'}
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-black opacity-60">Location</span>
              <div className="flex items-center gap-2 text-sm font-bold">
                <MapPin className="w-4 h-4 text-accent" /> {event.venue}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-border flex flex-row items-center gap-2">
          <Button onClick={onView} className="flex-1 rounded-full h-11 gap-2 font-black text-[10px] uppercase">
            <QrCode className="w-4 h-4" /> View Ticket
          </Button>
          <Button variant="outline" size="icon" className="w-11 h-11 rounded-full" onClick={onDownload}><Download className="w-4 h-4" /></Button>
          <Button variant="outline" size="icon" className="w-11 h-11 rounded-full" onClick={onTransfer}><Share2 className="w-4 h-4" /></Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Cancelled / refunded ticket — kept visible in Upcoming & Past with a clear
 * status and live refund progress instead of being hidden.
 */
function CancelledTicketRow({ item, progress }: { item: any; progress: { label: string; tone: string } | null }) {
  const isRefunded = item.status === 'refunded';
  return (
    <div className="bg-card border border-red-500/30 p-5 rounded-[1.75rem] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-left opacity-95">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
          <Ban className="w-6 h-6 text-red-500" />
        </div>
        <div className="space-y-1">
          <p className="font-bold">{item.title}</p>
          <p className="text-xs text-muted-foreground">
            {formatEventDate(item.date)}
            {item.venue && item.venue !== '—' ? ` · ${item.venue}` : ''}
          </p>
          {progress && <p className={`text-[11px] font-bold ${progress.tone}`}>{progress.label}</p>}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-mono uppercase text-muted-foreground/60">{item.code}</span>
        <span
          className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
            isRefunded ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
          }`}
        >
          {isRefunded ? 'Refunded' : 'Cancelled'}
        </span>
      </div>
    </div>
  );
}
