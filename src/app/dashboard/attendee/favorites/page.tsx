
"use client";

import React from 'react';
import { Heart, MapPin, Calendar } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { MOCK_EVENTS } from '@/lib/mock-data';
import Link from 'next/link';

export default function FavoritesPage() {
  return (
    <div className="p-4 md:p-12">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="text-left">
          <h1 className="font-headline mb-2 text-3xl md:text-5xl">Your Favorites</h1>
          <p className="text-muted-foreground">Events you've saved to check out later.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {MOCK_EVENTS.slice(4, 8).map((event) => (
            <Link key={event.id} href={`/events/${event.slug}`} className="no-underline">
              <div className="group bg-card border border-border rounded-[2rem] overflow-hidden hover:border-primary/50 transition-all shadow-sm flex flex-col h-full">
                <div className="relative aspect-video overflow-hidden">
                  <img src={event.image} alt="" className="object-cover w-full h-full group-hover:scale-105 transition-transform" />
                  <Button variant="secondary" size="icon" className="absolute top-4 right-4 rounded-full bg-white/80 backdrop-blur-sm text-red-500">
                    <Heart className="w-5 h-5 fill-current" />
                  </Button>
                </div>
                <div className="p-8 text-left space-y-4 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 text-primary font-black uppercase text-[10px] tracking-widest">
                     <Calendar className="w-3.5 h-3.5" /> {new Date(event.date).toLocaleDateString()}
                  </div>
                  <h3 className="font-headline text-xl font-bold line-clamp-1">{event.title}</h3>
                  <p className="text-muted-foreground flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {event.venue}</p>
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
    </div>
  );
}
