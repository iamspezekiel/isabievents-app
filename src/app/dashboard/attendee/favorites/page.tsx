"use client";

import React from 'react';
import { Heart, ArrowRight, MapPin, Calendar } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MOCK_EVENTS } from '@/lib/mock-data';
import Link from 'next/link';
import { Logo } from '@/components/logo';
import { SidebarLink } from '../page';

export default function FavoritesPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row pt-32">
      <aside className="hidden lg:flex w-72 bg-card/30 border-r border-border p-8 flex-col sticky top-0 h-screen">
        <Link href="/" className="mb-12 block"><Logo size="sm" /></Link>
        <nav className="flex-1 space-y-1">
          <SidebarLink icon={Heart} label="Favorites" href="/dashboard/attendee/favorites" active />
          <Link href="/dashboard/attendee" className="block mt-4 text-xs font-bold text-muted-foreground hover:text-primary transition-colors">← Back to Wallet</Link>
        </nav>
      </aside>

      <main className="flex-1 p-4 md:p-12">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-left">
            <h1 className="font-headline text-3xl mb-2">Your Favorites</h1>
            <p className="text-muted-foreground">Events you've saved to check out later.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {MOCK_EVENTS.slice(4, 8).map((event) => (
              <Link key={event.id} href={`/events/${event.id}`}>
                <div className="group bg-card border border-border rounded-[2rem] overflow-hidden hover:border-primary/50 transition-all shadow-sm flex flex-col h-full">
                  <div className="relative aspect-video overflow-hidden">
                    <img src={event.image} alt="" className="object-cover w-full h-full group-hover:scale-105 transition-transform" />
                    <Button variant="secondary" size="icon" className="absolute top-4 right-4 rounded-full bg-white/80 backdrop-blur-sm text-red-500"><Heart className="w-5 h-5 fill-current" /></Button>
                  </div>
                  <div className="p-8 text-left space-y-4 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 text-primary font-black uppercase text-[10px] tracking-widest">
                       <Calendar className="w-3.5 h-3.5" /> {new Date(event.date).toLocaleDateString()}
                    </div>
                    <h3 className="font-headline text-xl font-bold line-clamp-1">{event.title}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {event.venue}</p>
                    <div className="mt-auto pt-6 border-t border-border flex items-center justify-between">
                       <div className="font-black text-primary">₦{event.price.min.toLocaleString()}</div>
                       <Button size="sm" className="rounded-full">Details</Button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
