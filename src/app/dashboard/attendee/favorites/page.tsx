
"use client";

import React, { useState } from 'react';
import { Heart, MapPin, Calendar, Trash2, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MOCK_EVENTS } from '@/lib/mock-data';
import Link from 'next/link';
import { useToast } from "@/hooks/use-toast";

/**
 * FavoritesPage allows attendees to manage their saved event experiences.
 * Features:
 * - Dynamic list of saved events from state.
 * - Functionality to remove items with immediate feedback.
 * - Call-to-action to discover more events when list is empty.
 */
export default function FavoritesPage() {
  const [favorites, setFavorites] = useState(MOCK_EVENTS.slice(4, 8));
  const { toast } = useToast();

  const handleRemove = (e: React.MouseEvent, id: string, title: string) => {
    // Prevent the card link from firing when clicking the remove button
    e.preventDefault();
    e.stopPropagation();
    
    setFavorites(prev => prev.filter(item => item.id !== id));
    
    toast({
      title: "Removed from Favorites",
      description: `"${title}" has been removed from your list.`
    });
  };

  return (
    <div className="p-4 md:p-12">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 text-left">
          <div className="space-y-1">
            <h1 className="font-headline text-3xl md:text-5xl tracking-tighter">Your Favorites</h1>
            <p className="text-muted-foreground font-medium">Events you've saved to check out later.</p>
          </div>
          <Link href="/discover" className="no-underline">
            <Button className="rounded-full gap-2 px-6 shadow-lg shadow-primary/20 font-bold h-11">
              <Plus className="w-4 h-4" /> Discover More
            </Button>
          </Link>
        </header>

        {favorites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {favorites.map((event) => (
              <Link key={event.id} href={`/events/${event.slug}`} className="no-underline group">
                <div className="bg-card border border-border rounded-[2rem] overflow-hidden hover:border-primary/50 transition-all shadow-sm flex flex-col h-full hover:shadow-xl hover:shadow-primary/5">
                  <div className="relative aspect-video overflow-hidden">
                    <img 
                      src={event.image} 
                      alt={event.title} 
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700" 
                    />
                    <Button 
                      variant="destructive" 
                      size="icon" 
                      className="absolute top-4 right-4 rounded-full bg-white/90 backdrop-blur-sm text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-lg border-none"
                      onClick={(e) => handleRemove(e, event.id, event.title)}
                      title="Remove from Favorites"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <div className="absolute top-4 left-4">
                       <Badge className="bg-black/60 backdrop-blur-md border-none text-[8px] uppercase font-black tracking-widest text-white py-1 px-3">
                         {event.category}
                       </Badge>
                    </div>
                  </div>
                  
                  <div className="p-8 text-left space-y-4 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 text-primary font-black uppercase text-[10px] tracking-widest">
                       <Calendar className="w-3.5 h-3.5" /> 
                       {new Date(event.date).toLocaleDateString('en-NG', { dateStyle: 'medium' })}
                    </div>
                    
                    <h3 className="font-headline text-xl font-bold line-clamp-1 group-hover:text-primary transition-colors">
                      {event.title}
                    </h3>
                    
                    <p className="text-sm text-muted-foreground flex items-center gap-1.5 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-accent" /> {event.venue}, {event.city}
                    </p>
                    
                    <div className="mt-auto pt-6 border-t border-border flex items-center justify-between">
                       <div className="space-y-0.5">
                         <span className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Entry From</span>
                         <div className="font-black text-2xl text-primary leading-none">
                           {event.price.min === 0 ? 'FREE' : `₦${event.price.min.toLocaleString()}`}
                         </div>
                       </div>
                       <Button size="sm" className="rounded-full px-6 font-bold shadow-lg shadow-primary/20 h-9">
                         Details
                       </Button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-card/20 rounded-[3rem] border border-dashed border-border/50 animate-in fade-in duration-500">
            <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-10 h-10 text-muted-foreground/20" />
            </div>
            <h3 className="text-2xl font-headline mb-3">Your list is empty</h3>
            <p className="text-muted-foreground max-w-sm mx-auto mb-8 font-medium">
              You haven't saved any events yet. Explore the marketplace to find your next favorite experience.
            </p>
            <Link href="/discover">
              <Button className="rounded-full px-10 h-12 font-bold shadow-xl shadow-primary/20">
                Start Discovering
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
