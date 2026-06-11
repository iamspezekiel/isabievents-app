
"use client";

import React, { useState, useMemo } from 'react';
import { Search, MapPin, Calendar, SlidersHorizontal, ArrowUpDown, ChevronDown } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MOCK_EVENTS, CATEGORIES, CITIES } from '@/lib/mock-data';
import { Navbar } from '@/components/navbar';
import Link from 'next/link';
import Image from 'next/image';

export default function DiscoverPage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');

  const filteredEvents = useMemo(() => {
    return MOCK_EVENTS.filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(search.toLowerCase()) || 
                           event.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
      const matchesCity = selectedCity === 'all' || event.city === selectedCity;
      return matchesSearch && matchesCategory && matchesCity;
    });
  }, [search, selectedCategory, selectedCity]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 pt-32 pb-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="w-full md:w-64 space-y-8">
            <div className="sticky top-32">
              <h3 className="font-headline text-lg mb-4">Filters</h3>
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Location</label>
                  <select 
                    className="w-full bg-card border border-border rounded-xl h-10 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                  >
                    <option value="all">All Cities</option>
                    {CITIES.map(city => <option key={city} value={city}>{city}</option>)}
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Category</label>
                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={() => setSelectedCategory('all')}
                      className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedCategory === 'all' ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-secondary'}`}
                    >
                      All Events
                    </button>
                    {CATEGORIES.map(cat => (
                      <button 
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedCategory === cat.id ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-secondary'}`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Price Range</label>
                  <div className="space-y-4 pt-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>₦0</span>
                      <span>₦100k+</span>
                    </div>
                    <div className="h-1.5 bg-secondary rounded-full relative">
                      <div className="absolute left-0 right-0 h-full bg-primary rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input 
                  placeholder="Search by name, artist, or venue..." 
                  className="pl-10 h-12 bg-card border-border rounded-xl"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button variant="outline" className="h-12 rounded-xl gap-2">
                <ArrowUpDown className="w-4 h-4" /> Sort: Popular
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <h2 className="text-muted-foreground text-sm font-medium">
                Showing <span className="text-white">{filteredEvents.length}</span> events
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <Link key={event.id} href={`/events/${event.id}`}>
                  <div className="group bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/50 transition-all flex flex-col h-full">
                    <div className="relative aspect-video overflow-hidden">
                      <Image 
                        src={event.image} 
                        alt={event.title} 
                        fill 
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <Badge className="absolute top-3 left-3 bg-black/60 backdrop-blur-md border-none">
                        {event.category}
                      </Badge>
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <div className="text-primary text-xs font-bold uppercase tracking-wider mb-2">
                        {new Date(event.date).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' })}
                      </div>
                      <h3 className="font-headline text-lg mb-2 group-hover:text-primary transition-colors">{event.title}</h3>
                      <div className="flex items-center gap-1 text-muted-foreground text-sm mb-4">
                        <MapPin className="w-3.5 h-3.5" /> {event.venue}
                      </div>
                      <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
                        <span className="text-lg font-bold">
                          {event.price.min === 0 ? 'Free' : `₦${event.price.min.toLocaleString()}`}
                        </span>
                        <Button size="sm" variant="secondary" className="rounded-full">Details</Button>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {filteredEvents.length === 0 && (
              <div className="text-center py-20 bg-card/30 rounded-3xl border border-dashed border-border">
                <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                <h3 className="text-xl font-headline mb-2">No events found</h3>
                <p className="text-muted-foreground">Try adjusting your filters or search terms.</p>
                <Button variant="link" onClick={() => { setSearch(''); setSelectedCategory('all'); setSelectedCity('all'); }}>
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
