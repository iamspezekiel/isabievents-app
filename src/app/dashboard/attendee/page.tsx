
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
  Mail
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MOCK_USER, MOCK_EVENTS, CATEGORIES } from '@/lib/mock-data';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { attendeePersonalizedEventRecommendations } from '@/ai/flows/attendee-personalized-event-recommendations';
import { useToast } from "@/hooks/use-toast";

export default function AttendeeDashboard() {
  const [mounted, setMounted] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOfflineReady, setIsOfflineReady] = useState(false);
  const [showOfflineBanner, setShowOfflineBanner] = useState(true);
  
  // Transfer state
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [transferTicket, setTransferTicket] = useState<any>(null);
  const [transferEmail, setTransferEmail] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);

  // View state
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewTicket, setViewTicket] = useState<any>(null);

  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
    fetchRecommendations();
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('isabi_offline_tickets');
      if (saved) setIsOfflineReady(true);
    }
  }, []);

  const handleSyncOffline = async () => {
    setIsSyncing(true);
    await new Promise(r => setTimeout(r, 2000));
    localStorage.setItem('isabi_offline_tickets', JSON.stringify(MOCK_EVENTS.slice(0, 3)));
    setIsSyncing(false);
    setIsOfflineReady(true);
    toast({
      title: "Offline Access Enabled",
      description: "Your tickets have been encrypted and stored on this device.",
    });
  };

  const fetchRecommendations = async () => {
    setLoadingRecs(true);
    try {
      const result = await attendeePersonalizedEventRecommendations({
        pastPurchases: ['Lagos Jazz Night', 'Naija Tech Summit'],
        savedEvents: ['Gidi Festival'],
        browsingHistory: ['Calabar Carnival', 'Abuja Praise Festival'],
        eventCategories: CATEGORIES.map(c => c.name),
        availableEvents: MOCK_EVENTS.map(e => ({
          id: e.id,
          title: e.title,
          category: e.category,
          description: e.description
        }))
      });
      
      const recommendedEvents = MOCK_EVENTS.filter(e => result.recommendedEventIds.includes(e.id));
      setRecommendations(recommendedEvents.length > 0 ? recommendedEvents : MOCK_EVENTS.slice(3, 6));
    } catch (error) {
      setRecommendations(MOCK_EVENTS.slice(3, 6));
    } finally {
      setLoadingRecs(false);
    }
  };

  const handleTransfer = async () => {
    if (!transferEmail) {
      toast({ variant: "destructive", title: "Email Required", description: "Please enter the recipient's email address." });
      return;
    }
    setIsTransferring(true);
    await new Promise(r => setTimeout(r, 2000));
    setIsTransferring(false);
    setIsTransferOpen(false);
    setTransferEmail('');
    toast({
      title: "Ticket Transferred!",
      description: `Your ticket for ${transferTicket.title} has been sent to ${transferEmail}.`,
    });
  };

  return (
    <div className="p-4 md:p-8 lg:p-12 space-y-8 md:space-y-12 max-w-5xl mx-auto">
      {showOfflineBanner && (
        <div className={cn(
          "relative p-4 px-6 rounded-3xl border flex flex-col md:flex-row items-center justify-between gap-4 transition-all duration-500",
          isOfflineReady ? "bg-green-500/5 border-green-500/20" : "bg-primary/5 border-primary/20"
        )}>
          <div className="flex items-center gap-4 text-left">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
              isOfflineReady ? "bg-green-500/10 text-green-500" : "bg-primary/10 text-primary"
            )}>
              {isOfflineReady ? <Cloud className="w-5 h-5" /> : <CloudOff className="w-5 h-5" />}
            </div>
            <div className="space-y-0.5 pr-8 md:pr-0">
              <p className="text-sm font-bold">{isOfflineReady ? "Offline Access Enabled" : "Data-Saving Offline Access"}</p>
              <p className="text-[10px] md:text-xs text-muted-foreground leading-tight">
                Sync your tickets now to ensure they work even if your network connection is poor at the venue.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Button 
              size="sm" 
              onClick={handleSyncOffline} 
              disabled={isSyncing}
              variant={isOfflineReady ? "outline" : "default"}
              className={cn("rounded-full h-10 px-6 font-bold gap-2 flex-1 md:flex-none", isOfflineReady && "border-green-500/20 text-green-600")}
            >
              {isSyncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : isOfflineReady ? "Update Sync" : "Sync for Offline"}
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" onClick={() => setShowOfflineBanner(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1 text-left">
          <h1 className="font-headline text-3xl md:text-5xl tracking-tighter">Hi, {MOCK_USER.name} 👋</h1>
          <p className="text-muted-foreground font-medium">You have {MOCK_USER.wallet.active} upcoming experiences.</p>
        </div>
        <Link href="/discover" className="w-full sm:w-auto no-underline">
          <Button className="w-full rounded-full px-8 shadow-xl shadow-primary/20 h-11 font-bold">Discover Events</Button>
        </Link>
      </header>

      <div className="grid grid-cols-3 gap-2 md:gap-6">
        <StatBox label="Active" value={MOCK_USER.wallet.active} color="primary" icon={Ticket} />
        <StatBox label="Used" value={MOCK_USER.wallet.used} color="accent" icon={History} />
        <StatBox label="Saved" value={5} color="white" icon={Heart} />
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="bg-secondary/50 p-1 rounded-2xl w-full sm:w-auto mb-8">
          <TabsTrigger value="upcoming" className="rounded-xl px-8 flex-1 sm:flex-none font-bold">Upcoming</TabsTrigger>
          <TabsTrigger value="past" className="rounded-xl px-8 flex-1 sm:flex-none font-bold">Past</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-6">
          {MOCK_EVENTS.slice(0, 3).map((event) => (
            <TicketCard 
              key={event.id} 
              event={event} 
              mounted={mounted} 
              offline={isOfflineReady} 
              onTransfer={() => { setTransferTicket(event); setIsTransferOpen(true); }} 
              onView={() => { setViewTicket(event); setIsViewOpen(true); }}
              onDownload={() => { setViewTicket(event); setIsViewOpen(true); setTimeout(() => window.print(), 400); }}
            />
          ))}
        </TabsContent>

        <TabsContent value="past" className="pt-12">
          <div className="text-center py-24 bg-card/20 rounded-[3rem] border border-dashed border-border/50">
            <History className="w-16 h-16 text-muted-foreground mx-auto mb-6 opacity-10" />
            <p className="text-muted-foreground font-medium">No past events recorded yet.</p>
          </div>
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
              <Link key={event.id} href={`/events/${event.slug}`} className="group">
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
            <h2 className="font-headline text-xl">IsabiEvents</h2>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Entry Ticket</p>
          </div>
          <div className="p-6 text-center space-y-6">
            <div className="p-3 bg-white rounded-2xl shadow-xl inline-block">
               <QrCode className="w-40 h-40 text-black" />
            </div>
            <div className="space-y-1">
              <h3 className="font-headline text-lg">{viewTicket?.title}</h3>
              <p className="text-muted-foreground text-xs">{viewTicket?.venue}</p>
            </div>
            <Button onClick={() => window.print()} className="w-full rounded-full no-print">Download PDF</Button>
          </div>
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
          <span className="text-[10px] text-muted-foreground font-mono opacity-60">#TKT-{event.id.toUpperCase()}</span>
        </div>
        <div className="space-y-4 flex-1">
          <h3 className="font-headline text-2xl md:text-3xl line-clamp-1">{event.title}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-black opacity-60">Schedule</span>
              <div className="flex items-center gap-2 text-sm font-bold">
                <Calendar className="w-4 h-4 text-primary" /> {mounted ? new Date(event.date).toLocaleDateString() : '...'}
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
