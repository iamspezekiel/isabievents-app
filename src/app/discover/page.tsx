"use client";

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, MapPin, ArrowUpDown, Filter, Loader2 } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { MOCK_EVENTS, CATEGORIES, CITIES } from '@/lib/mock-data';
import Image from 'next/image';
import Link from 'next/link';

function DiscoverContent() {
  const searchParams = useSearchParams();
  
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [selectedCity, setSelectedCity] = useState(searchParams.get('city') || 'all');

  // Sync state if URL params change externally
  useEffect(() => {
    const q = searchParams.get('q');
    const cat = searchParams.get('category');
    const city = searchParams.get('city');
    
    if (q !== null) setSearch(q);
    if (cat !== null) setSelectedCategory(cat);
    if (city !== null) setSelectedCity(city);
  }, [searchParams]);

  const filteredEvents = useMemo(() => {
    return MOCK_EVENTS.filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(search.toLowerCase()) || 
                           event.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
      const matchesCity = selectedCity === 'all' || event.city === selectedCity;
      return matchesSearch && matchesCategory && matchesCity;
    });
  }, [search, selectedCategory, selectedCity]);

  const FilterContent = () => (
    <div className="space-y-8">
      <div className="space-y-4">
        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">Location</label>
        <Select value={selectedCity} onValueChange={setSelectedCity}>
          <SelectTrigger className="w-full bg-secondary/50 border border-border rounded-xl h-12 px-4 text-sm focus:ring-2 focus:ring-primary transition-all">
            <SelectValue placeholder="All Cities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cities</SelectItem>
            {CITIES.map(city => (
              <SelectItem key={city} value={city}>{city}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">Category</label>
        <div className="flex flex-col gap-2">
          <button 
            onClick={() => setSelectedCategory('all')}
            className={`text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${selectedCategory === 'all' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted-foreground hover:bg-secondary'}`}
          >
            All Experiences
          </button>
          {CATEGORIES.map(cat => (
            <button 
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${selectedCategory === cat.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted-foreground hover:bg-secondary'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Desktop Sidebar Filters */}
      <aside className="hidden lg:block w-72 shrink-0">
        <div className="sticky top-32 bg-card/30 border border-border rounded-[2rem] p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-headline text-xl">Filters</h3>
            <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setSelectedCategory('all'); setSelectedCity('all'); }}>Reset</Button>
          </div>
          <FilterContent />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 space-y-8">
        {/* Search and Mobile Filters Trigger */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input 
              placeholder="Search events, artists, or vibes..." 
              className="pl-12 h-14 bg-card border-border rounded-2xl text-lg focus-visible:ring-primary transition-all shadow-xl shadow-black/5"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 shrink-0">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden h-14 rounded-2xl px-6 gap-2 border-border bg-card">
                  <Filter className="w-5 h-5" /> Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-card border-border p-6">
                <SheetHeader className="text-left mb-8">
                  <SheetTitle className="font-headline text-2xl">Refine Search</SheetTitle>
                </SheetHeader>
                <FilterContent />
              </SheetContent>
            </Sheet>
            <Button variant="outline" className="h-14 rounded-2xl px-6 gap-2 border-border bg-card">
              <ArrowUpDown className="w-5 h-5" /> <span className="hidden sm:inline">Sort</span>
            </Button>
          </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="font-headline text-2xl">Discover Events</h1>
            <p className="text-muted-foreground text-sm">
              {filteredEvents.length === 0 ? 'No results found' : `Showing ${filteredEvents.length} events in Nigeria`}
            </p>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
          {filteredEvents.map((event) => (
            <Link key={event.id} href={`/events/${event.id}`}>
              <div className="group bg-card border border-border rounded-[2rem] overflow-hidden hover:border-primary/50 transition-all flex flex-col h-full hover:shadow-2xl hover:shadow-primary/5">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image 
                    src={event.image} 
                    alt={event.title} 
                    fill 
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <Badge className="absolute top-4 left-4 bg-black/60 backdrop-blur-md border-none py-1.5 px-3">
                    {event.category}
                  </Badge>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="text-primary text-xs font-black uppercase tracking-[0.2em] mb-3">
                    {new Date(event.date).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  <h3 className="font-headline text-xl mb-2 group-hover:text-primary transition-colors line-clamp-1">{event.title}</h3>
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mb-6">
                    <MapPin className="w-4 h-4 text-accent" /> {event.venue}
                  </div>
                  <div className="mt-auto pt-6 border-t border-border flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Entry</span>
                      <span className="block text-xl font-black text-primary leading-none">
                        {event.price.min === 0 ? 'FREE' : `₦${event.price.min.toLocaleString()}`}
                      </span>
                    </div>
                    <Button className="rounded-full px-6 shadow-lg shadow-primary/20">Book Now</Button>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {filteredEvents.length === 0 && (
          <div className="text-center py-32 bg-card/20 rounded-[3rem] border border-dashed border-border/50">
            <Search className="w-16 h-16 text-muted-foreground mx-auto mb-6 opacity-20" />
            <h3 className="text-2xl font-headline mb-3">Nothing matched your search</h3>
            <p className="text-muted-foreground max-sm mx-auto mb-8">Try a different city, category, or broader search term to find experiences.</p>
            <Button variant="secondary" className="rounded-full px-8" onClick={() => { setSearch(''); setSelectedCategory('all'); setSelectedCity('all'); }}>
              Clear all filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DiscoverPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 pt-36 md:pt-48 pb-12">
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-[50vh]">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        }>
          <DiscoverContent />
        </Suspense>
      </main>
    </div>
  );
}
