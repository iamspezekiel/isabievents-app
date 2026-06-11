
"use client";

import React from 'react';
import { Ticket, Search, QrCode, Download, Share2, Calendar, MapPin, ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MOCK_EVENTS } from '@/lib/mock-data';
import Link from 'next/link';

export default function TicketGalleryPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card py-10 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <Link href="/dashboard/attendee" className="flex items-center gap-2 text-muted-foreground hover:text-white mb-2 transition-colors text-sm">
                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
              </Link>
              <h1 className="font-headline text-3xl">My Digital Wallet</h1>
            </div>
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input placeholder="Search tickets..." className="pl-10 h-12 bg-secondary border-none" />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {MOCK_EVENTS.map((event) => (
            <div key={event.id} className="group bg-card border border-border rounded-3xl overflow-hidden hover:border-primary/50 transition-all flex flex-col shadow-2xl">
              <div className="relative aspect-[4/2] bg-secondary/50 p-6 flex items-center justify-between border-b border-dashed border-border/50">
                <div className="space-y-1">
                  <div className="text-[10px] uppercase font-black tracking-widest text-primary">Confirmed Access</div>
                  <h3 className="font-headline text-lg line-clamp-1">{event.title}</h3>
                </div>
                <div className="w-12 h-12 bg-background rounded-xl border border-border flex items-center justify-center">
                   <QrCode className="w-6 h-6 text-muted-foreground" />
                </div>
                {/* Ticket Notches */}
                <div className="absolute -bottom-3 -left-3 w-6 h-6 bg-background rounded-full" />
                <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-background rounded-full" />
              </div>

              <div className="p-6 flex-1 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">Date</span>
                    <div className="text-sm font-medium flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-primary" /> {new Date(event.date).toLocaleDateString()}
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
                  <Badge variant="outline" className="rounded-full border-primary/20 text-primary font-mono">#TKT-{event.id.toUpperCase()}-029</Badge>
                  <span className="text-xs text-muted-foreground">Standard Pass</span>
                </div>
              </div>

              <div className="p-6 bg-secondary/20 flex gap-2">
                <Button className="flex-1 rounded-full gap-2">
                  <QrCode className="w-4 h-4" /> View QR
                </Button>
                <Button variant="outline" size="icon" className="rounded-full shrink-0">
                  <Download className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" className="rounded-full shrink-0">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {MOCK_EVENTS.length === 0 && (
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
    </div>
  );
}
