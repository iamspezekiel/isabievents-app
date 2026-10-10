
"use client";

import React, { useState, useEffect } from 'react';
import { Ticket, Search, QrCode, Download, Share2, Calendar, MapPin, ArrowLeft, ShieldCheck, CloudOff, Cloud, Loader2, Copy } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from "@/components/ui/dialog";
import { useAuth } from '@/components/auth-provider';
import { useEvents } from '@/hooks/use-events';
import { getTicketsForEmail } from '@/lib/client-db';
import { useToast } from "@/hooks/use-toast";
import type { EventDoc, TicketDoc } from '@/lib/db-types';
import Link from 'next/link';

export default function TicketGalleryPage() {
  const [mounted, setMounted] = useState(false);
  const [isOfflineReady, setIsOfflineReady] = useState(false);
  const { profile } = useAuth();
  const { events } = useEvents();
  const [tickets, setTickets] = useState<TicketDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [qrTicket, setQrTicket] = useState<{code: string; title: string} | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('isabi_offline_tickets');
      if (saved) setIsOfflineReady(true);
    }
  }, []);

  useEffect(() => {
    if (!profile?.email) {
      setLoading(false);
      return;
    }
    getTicketsForEmail(profile.email)
      .then(setTickets)
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [profile?.email]);

  const cards = tickets
    .filter((t) => t.status !== 'transferred')
    .map((t) => {
      const ev = events.find((e) => e.id === t.eventId) as EventDoc | undefined;
      return {
        key: t.id,
        code: t.code,
        status: t.status,
        title: t.eventTitle || ev?.title || 'Event',
        date: ev?.date || String(t.createdAt || new Date().toISOString()),
        venue: ev?.venue || '—',
      };
    })
    .filter((c) => {
      const q = query.toLowerCase().trim();
      return !q || c.title.toLowerCase().includes(q) || c.code.toLowerCase().includes(q);
    });

  // View QR — full-screen code the gate scanner can read.
  const handleViewQr = (c: {code: string; title: string}) => setQrTicket(c);

  // Download — saves a plain-text ticket stub with the QR payload.
  const handleDownload = (c: {code: string; title: string; date: string; venue: string; status: string}) => {
    const text = [
      'ISABIEVENTS TICKET',
      '===================',
      `Event : ${c.title}`,
      `Date  : ${new Date(c.date).toLocaleString('en-NG', {dateStyle: 'full', timeStyle: 'short'})}`,
      `Venue : ${c.venue}`,
      `Code  : ${c.code}`,
      `Status: ${c.status}`,
      '',
      'Present this code (or its QR) at the gate for entry.',
    ].join('\n');
    const blob = new Blob([text], {type: 'text/plain'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `isabievents-ticket-${c.code}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast({title: 'Ticket Downloaded', description: `Ticket ${c.code} saved to your device.`});
  };

  // Share — native share sheet, falls back to clipboard.
  const handleShare = async (c: {code: string; title: string}) => {
    const text = `My ticket for ${c.title} — code ${c.code}`;
    try {
      if (navigator.share) {
        await navigator.share({title: c.title, text});
      } else {
        await navigator.clipboard.writeText(text);
        toast({title: 'Copied to Clipboard', description: 'Ticket details copied — paste anywhere to share.'});
      }
    } catch {
      toast({variant: 'destructive', title: 'Share Failed', description: 'Could not share this ticket.'});
    }
  };

  return (
    <div className="min-h-screen bg-background pt-20">
      <header className="border-b border-border bg-card py-10 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <Link href="/dashboard/attendee" className="flex items-center gap-2 text-muted-foreground hover:text-white mb-2 transition-colors text-sm">
                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
              </Link>
              <div className="flex items-center gap-3">
                <h1 className="font-headline text-3xl">My Digital Wallet</h1>
                {isOfflineReady ? (
                  <Badge className="bg-green-500/10 text-green-500 border-green-500/20 gap-1 hidden sm:flex">
                    <Cloud className="w-3 h-3" />
                    <span className="text-[10px] font-black">OFFLINE READY</span>
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground border-dashed gap-1 hidden sm:flex">
                    <CloudOff className="w-3 h-3" />
                    <span className="text-[10px] font-black">SYNC PENDING</span>
                  </Badge>
                )}
              </div>
            </div>
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input placeholder="Search tickets..." className="pl-10 h-12 bg-secondary border-none" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {loading && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading your tickets…</p>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cards.map((event) => (
            <div key={event.key} className="group bg-card border border-border rounded-3xl overflow-hidden hover:border-primary/50 transition-all flex flex-col shadow-2xl">
              <div className="relative aspect-[4/2] bg-secondary/50 p-6 flex items-center justify-between border-b border-dashed border-border/50">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="text-[10px] uppercase font-black tracking-widest text-primary">{event.status === 'used' ? 'Used Entry' : 'Confirmed Access'}</div>
                    {isOfflineReady && <ShieldCheck className="w-3 h-3 text-green-500" title="Available offline" />}
                  </div>
                  <h3 className="font-headline text-lg line-clamp-1">{event.title}</h3>
                </div>
                <div className="w-12 h-12 bg-background rounded-xl border-border flex items-center justify-center">
                   <QrCode className="w-6 h-6 text-muted-foreground" />
                </div>
                {/* Ticket Notches */}
                <div className="absolute -bottom-3 -left-3 w-6 h-6 bg-background rounded-full" />
                <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-background rounded-full" />
              </div>

              <div className="p-6 pb-16 flex-1 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">Date</span>
                    <div className="text-sm font-medium flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-primary" /> {mounted ? new Date(event.date).toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Loading...'}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">Venue</span>
                    <div className="text-sm font-medium flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-primary" /> {event.venue}
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between">
                  <Badge variant="outline" className="rounded-full border-primary/20 text-primary font-mono">#{event.code}</Badge>
                  <span className="text-xs text-muted-foreground">{event.status === 'used' ? 'Used' : 'Standard Pass'}</span>
                </div>
              </div>

              <div className="p-6 bg-secondary/20 flex gap-2">
                <Button className="flex-1 rounded-full gap-2" onClick={() => handleViewQr(event)}>
                  <QrCode className="w-4 h-4" /> View QR
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full shrink-0"
                  title="Download ticket"
                  onClick={() => handleDownload(event)}
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full shrink-0"
                  title="Share ticket"
                  onClick={() => handleShare(event)}
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {!loading && cards.length === 0 && (
          <div className="text-center py-32 space-y-6">
            <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto">
              <Ticket className="w-10 h-10 text-muted-foreground opacity-20" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-headline">No tickets found</h2>
              <p className="text-muted-foreground max-w-sm mx-auto">You haven't purchased any tickets yet. Explore trending events to get started.</p>
            </div>
            <Link href="/discover">
              <Button className="rounded-full px-8 h-12">Browse Events</Button>
            </Link>
          </div>
        )}
      </main>

      {/* QR dialog — full-size code for gate scanning */}
      <Dialog open={!!qrTicket} onOpenChange={(open) => !open && setQrTicket(null)}>
        <DialogContent className="bg-card border-border sm:rounded-[2rem] p-8 max-w-sm w-[94vw] sm:w-full">
          <DialogHeader className="text-left">
            <DialogTitle className="font-headline text-2xl flex items-center gap-2">
              <QrCode className="w-5 h-5 text-primary" /> Entry QR Code
            </DialogTitle>
            <DialogDescription>{qrTicket?.title}</DialogDescription>
          </DialogHeader>
          {qrTicket && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-2xl flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=8&data=${encodeURIComponent(qrTicket.code)}`}
                  alt={`QR code for ticket ${qrTicket.code}`}
                  width={260}
                  height={260}
                  className="rounded-lg"
                />
              </div>
              <div className="flex items-center justify-between gap-3 bg-secondary/40 rounded-xl px-4 py-3">
                <span className="font-mono font-bold text-sm break-all">{qrTicket.code}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full shrink-0"
                  title="Copy code"
                  onClick={() => {
                    navigator.clipboard.writeText(qrTicket.code);
                    toast({title: 'Copied', description: 'Ticket code copied to clipboard.'});
                  }}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Show this code at the gate. Works even without a signal — screenshot it to be safe.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
