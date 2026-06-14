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
  Printer
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MOCK_USER, MOCK_EVENTS, CATEGORIES } from '@/lib/mock-data';
import { Logo } from '@/components/logo';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { attendeePersonalizedEventRecommendations } from '@/ai/flows/attendee-personalized-event-recommendations';
import { useToast } from "@/hooks/use-toast";

export default function AttendeeDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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

  const pathname = usePathname();
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
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('isabi_recs_cache');
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < 30 * 60 * 1000 && data.length > 0) {
          setRecommendations(data);
          setLoadingRecs(false);
          return;
        }
      }
    }

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
      const finalRecs = recommendedEvents.length > 0 ? recommendedEvents : MOCK_EVENTS.slice(3, 6);
      setRecommendations(finalRecs);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('isabi_recs_cache', JSON.stringify({
          data: finalRecs,
          timestamp: Date.now()
        }));
      }
    } catch (error) {
      console.warn("Failed to load AI recommendations, using defaults", error);
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

  const openTransfer = (event: any) => {
    setTransferTicket(event);
    setIsTransferOpen(true);
  };

  const openView = (event: any) => {
    setViewTicket(event);
    setIsViewOpen(true);
  };

  const handleDownloadTicket = (event: any) => {
    setViewTicket(event);
    setIsViewOpen(true);
    // Delay print to allow modal to mount and apply targeted print styles
    setTimeout(() => {
      window.print();
    }, 400);
  };

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
    <div className="min-h-screen bg-background flex flex-col lg:flex-row pt-40">
      <aside className="hidden lg:flex w-72 bg-card/30 border-r border-border p-8 flex-col sticky top-0 h-screen overflow-y-auto no-print">
        <Link href="/dashboard/attendee" className="mb-12 block no-underline">
          <Logo size="sm" />
        </Link>
        <Navigation />
        <div className="pt-8 border-t border-border mt-auto">
          <SidebarLink icon={LogOut} label="Log Out" href="/login" />
        </div>
      </aside>

      <header className="lg:hidden flex items-center justify-between p-4 bg-card border-b border-border sticky top-0 z-40 no-print">
        <Link href="/dashboard/attendee" className="no-underline">
          <Logo size="sm" />
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-full relative" asChild title="Notifications">
            <Link href="/dashboard/attendee/notifications">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-background" />
            </Link>
          </Button>
          <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 bg-card border-border p-8 flex flex-col overflow-y-auto">
              <SheetHeader className="text-left mb-10">
                <SheetTitle>
                  <Logo size="sm" />
                </SheetTitle>
              </SheetHeader>
              <Navigation />
              <div className="pt-8 border-t border-border mt-auto">
                <SidebarLink icon={LogOut} label="Log Out" href="/login" />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-x-hidden no-print">
        <div className="max-w-5xl mx-auto space-y-8 md:space-y-12">
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
                    {isOfflineReady 
                      ? "Your tickets are stored locally. You can enter venues even without an internet connection." 
                      : "Sync your tickets now to ensure they work even if your network connection is poor at the venue."}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <Button 
                  size="sm" 
                  onClick={handleSyncOffline} 
                  disabled={isSyncing}
                  variant={isOfflineReady ? "outline" : "default"}
                  className={cn("rounded-full h-10 px-6 font-bold gap-2 flex-1 md:flex-none md:min-w-[140px]", isOfflineReady && "border-green-500/20 text-green-600")}
                >
                  {isSyncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : isOfflineReady ? "Update Sync" : "Sync for Offline"}
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 text-muted-foreground absolute top-2 right-2 md:relative md:top-auto md:right-auto" onClick={() => setShowOfflineBanner(false)}>
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
                  onTransfer={() => openTransfer(event)} 
                  onView={() => openView(event)}
                  onDownload={() => handleDownloadTicket(event)}
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
        </div>
      </main>

      {/* Transfer Ticket Dialog */}
      <Dialog open={isTransferOpen} onOpenChange={setIsTransferOpen}>
        <DialogContent className="bg-card border-border sm:rounded-[2.5rem] p-8 max-w-md w-[94vw] sm:w-full">
          <DialogHeader className="text-left">
            <DialogTitle className="font-headline text-2xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Send className="w-5 h-5 text-primary" />
              </div>
              Transfer Ticket
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Transfer your ticket for <strong>{transferTicket?.title}</strong> to a friend's account. This action is irreversible.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 space-y-4 text-left">
            <div className="space-y-2">
              <Label htmlFor="transfer-email" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 pl-1">Recipient's Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  id="transfer-email" 
                  placeholder="friend@example.com" 
                  className="pl-10 h-12 bg-secondary/30 border-none rounded-xl"
                  value={transferEmail}
                  onChange={(e) => setTransferEmail(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-3">
            <Button variant="ghost" onClick={() => setIsTransferOpen(false)} className="rounded-full font-bold h-11">Cancel</Button>
            <Button 
              onClick={handleTransfer} 
              disabled={isTransferring}
              className="flex-1 rounded-full font-bold h-11 shadow-lg shadow-primary/20 gap-2"
            >
              {isTransferring ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Transfer Ticket
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Ticket Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="bg-card border-border sm:rounded-[2.5rem] p-0 overflow-hidden max-w-md w-[94vw] sm:w-full">
          <DialogHeader className="sr-only">
            <DialogTitle>View Entry Ticket</DialogTitle>
            <DialogDescription>
              Your secure digital QR code for {viewTicket?.title}.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-primary p-8 text-center space-y-2 relative">
            <button 
              onClick={() => setIsViewOpen(false)}
              className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full text-white transition-colors no-print"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center -rotate-6">
                <Ticket className="w-7 h-7 text-white fill-white/20" />
              </div>
            </div>
            <h2 className="font-headline text-white text-2xl tracking-tighter">Digital Ticket</h2>
            <p className="text-white/70 text-xs font-bold uppercase tracking-widest">Scan at the entrance</p>
          </div>
          
          <div className="p-8 space-y-8">
            <div className="flex flex-col items-center gap-6">
              <div className="p-4 bg-white rounded-3xl shadow-xl">
                 <QrCode className="w-48 h-48 text-black" />
              </div>
              <div className="text-center space-y-1">
                 <h3 className="font-headline text-xl">{viewTicket?.title}</h3>
                 <p className="text-muted-foreground text-sm flex items-center justify-center gap-1">
                    <MapPin className="w-3 h-3 text-accent" /> {viewTicket?.venue}
                 </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-y-6 gap-x-4 border-t border-border pt-6">
              <div className="space-y-1 text-left col-span-2">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Attendee</p>
                <p className="font-bold text-lg">{MOCK_USER.name}</p>
              </div>
              <div className="space-y-1 text-left">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Date</p>
                <p className="font-bold text-sm">{viewTicket && new Date(viewTicket.date).toLocaleDateString()}</p>
              </div>
              <div className="space-y-1 text-left">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Ticket ID</p>
                <p className="font-mono text-xs font-bold">#TKT-{viewTicket?.id.toUpperCase()}</p>
              </div>
            </div>
            
            <div className="flex flex-col gap-3 no-print">
              <Button onClick={() => window.print()} className="w-full rounded-full gap-2 h-11 font-bold shadow-xl shadow-primary/20">
                <Download className="w-4 h-4" /> Save Ticket PDF
              </Button>
              <Button variant="ghost" onClick={() => setIsViewOpen(false)} className="w-full rounded-full h-11 font-bold">
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function SidebarLink({ icon: Icon, label, active, href = "#" }: any) {
  return (
    <Link href={href} className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all text-sm font-bold no-underline ${active ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`}>
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

function TicketCard({ event, mounted, offline, onTransfer, onView, onDownload }: any) {
  return (
    <div className="group relative bg-card border border-border rounded-[2.5rem] overflow-hidden hover:border-primary/50 transition-all duration-500 flex flex-col md:flex-row hover:shadow-[0_32px_64px_-16px_rgba(126,124,255,0.1)] shadow-sm">
      <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 w-6 h-6 md:w-10 md:h-10 bg-background border border-border rounded-full z-10 hidden md:block" />
      <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 w-6 h-6 md:w-10 md:h-10 bg-background border border-border rounded-full z-10 hidden md:block" />

      <div className="relative w-full md:w-64 aspect-[16/10] md:aspect-square shrink-0 overflow-hidden">
        <img src={event.image} alt="" className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110" />
        <div 
          onClick={onView}
          className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 backdrop-blur-[2px] cursor-pointer"
        >
          <QrCode className="w-6 h-6 md:w-14 md:h-14 text-white mb-2 animate-in zoom-in-50" />
          <span className="text-white text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em]">Show Entry QR</span>
        </div>
        {offline && (
          <div className="absolute top-4 left-4">
             <Badge className="bg-green-500 text-white border-none gap-1 py-1 px-3 shadow-lg">
                <ShieldCheck className="w-3 h-3" />
                <span className="text-[8px] font-black tracking-widest uppercase">OFFLINE READY</span>
             </Badge>
          </div>
        )}
      </div>
      
      <div className="flex-1 p-6 md:p-10 flex flex-col text-left relative">
        <div className="absolute left-0 top-0 bottom-0 w-px border-l-2 border-dashed border-border/50 ml-[-1px] hidden md:block" />
        <div className="flex items-center justify-between mb-6">
          <Badge className="bg-primary text-white border-none py-1.5 px-4 font-black text-[10px] tracking-widest uppercase rounded-full">CONFIRMED</Badge>
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
                <span className="font-bold text-sm text-foreground">{mounted ? new Date(event.date).toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' }) : '...'}</span>
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
          <Button 
            onClick={onView}
            className="flex-1 rounded-full h-11 gap-2 shadow-lg shadow-primary/20 font-black text-[10px] uppercase tracking-widest"
          >
            <QrCode className="w-4 h-4" /> View Ticket
          </Button>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              className="w-11 h-11 rounded-full" 
              title="Download"
              onClick={onDownload}
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className="w-11 h-11 rounded-full text-primary hover:bg-primary/10" 
              onClick={onTransfer} 
              title="Transfer Ticket"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
