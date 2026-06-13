"use client";

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, MapPin, Filter, Loader2, X, Check, Calendar, Heart, Share2 } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose, SheetFooter } from "@/components/ui/sheet";
import { MOCK_EVENTS, CATEGORIES, CITIES } from '@/lib/mock-data';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

function DiscoverContent() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  
  const [displayLimit, setDisplayLimit] = useState(27);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setDisplayLimit(16);
      } else {
        setDisplayLimit(27);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sync state with URL params on load and change
  useEffect(() => {
    const q = searchParams.get('q');
    const cat = searchParams.get('category');
    const city = searchParams.get('city');
    const price = searchParams.get('price');
    
    if (q !== null) setSearch(q);
    if (cat !== null) setSelectedCategory(cat);
    if (city !== null) setSelectedCity(city);
    if (price !== null) setPriceFilter(price);
  }, [searchParams]);

  const filteredEvents = useMemo(() => {
    return MOCK_EVENTS.filter(event => {
      const searchLower = search.toLowerCase().trim();
      const matchesSearch = !searchLower || 
                           event.title.toLowerCase().includes(searchLower) || 
                           event.description.toLowerCase().includes(searchLower);
      
      const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
      const matchesCity = selectedCity === 'all' || event.city === selectedCity;
      const matchesPrice = priceFilter === 'all' || 
                          (priceFilter === 'free' && event.price.min === 0) ||
                          (priceFilter === 'paid' && event.price.min > 0);

      return matchesSearch && matchesCategory && matchesCity && matchesPrice;
    }).slice(0, displayLimit);
  }, [search, selectedCategory, selectedCity, priceFilter, displayLimit]);

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toast({
      title: "Saved to Favorites",
      description: "This event has been added to your digital wallet."
    });
  };

  const handleShare = (e: React.MouseEvent, slug: string) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/events/${slug}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link Copied!",
      description: "Event link has been copied to your clipboard."
    });
  };

  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setSelectedCity('all');
    setPriceFilter('all');
  };

  const FilterForm = () => (
    <div className="space-y-8 py-4">
      <div className="space-y-4 text-left">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Location</label>
        <Select value={selectedCity} onValueChange={setSelectedCity}>
          <SelectTrigger className="w-full bg-secondary/30 border-border rounded-xl h-11 px-4 focus:ring-primary">
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

      <div className="space-y-4 text-left">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Price Range</label>
        <div className="grid grid-cols-3 gap-2">
          {['all', 'free', 'paid'].map((p) => (
            <button
              key={p}
              onClick={() => setPriceFilter(p)}
              className={cn(
                "h-10 rounded-xl text-xs font-bold capitalize border transition-all",
                priceFilter === p 
                  ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                  : "bg-secondary/30 border-transparent text-muted-foreground hover:bg-secondary/50"
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4 text-left">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Category</label>
        <div className="grid grid-cols-1 gap-1">
          <button 
            onClick={() => setSelectedCategory('all')}
            className={cn(
              "flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all",
              selectedCategory === 'all' 
                ? "bg-primary/10 text-primary" 
                : "text-muted-foreground hover:bg-secondary/30"
            )}
          >
            All Experiences
            {selectedCategory === 'all' && <Check className="w-4 h-4" />}
          </button>
          {CATEGORIES.map(cat => (
            <button 
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all",
                selectedCategory === cat.id 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-secondary/30"
            )}
            >
              {cat.name}
              {selectedCategory === cat.id && <Check className="w-4 h-4" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      <div className="px-2 text-center space-y-6">
        <h1 className="font-headline tracking-tighter">
          Discover <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent italic">Experiences</span>
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Discover and secure your spot with zero friction. Find your next favorite memory across Nigeria.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input 
              placeholder="Search events, artists, or vibes..." 
              className="pl-12 h-11 bg-card border-border rounded-2xl text-base focus-visible:ring-primary transition-all shadow-xl shadow-black/5"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button 
                onClick={() => setSearch('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-secondary rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="h-11 rounded-2xl px-4 md:px-8 gap-2 md:gap-3 border-border bg-card font-bold shadow-xl shadow-black/5">
                <Filter className="w-5 h-5 shrink-0" /> 
                <span className="hidden sm:inline">Filters</span>
                {(selectedCategory !== 'all' || selectedCity !== 'all' || priceFilter !== 'all') && (
                  <Badge className="ml-1 w-5 h-5 p-0 flex items-center justify-center bg-primary text-white text-[10px]">
                    {[selectedCategory, selectedCity, priceFilter].filter(v => v !== 'all').length}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-md bg-card border-border p-0 flex flex-col h-full">
              <SheetHeader className="p-6 border-b border-border text-left">
                <div className="flex items-center justify-between">
                  <SheetTitle className="font-headline text-2xl">Refine Search</SheetTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={resetFilters} className="text-primary font-bold hover:bg-primary/10 rounded-full h-9 px-4">
                      Reset All
                    </Button>
                    <SheetClose asChild>
                      <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
                        <X className="w-5 h-5" />
                      </Button>
                    </SheetClose>
                  </div>
                </div>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto px-6">
                <FilterForm />
              </div>
              <SheetFooter className="p-6 border-t border-border mt-auto">
                <SheetClose asChild>
                  <Button className="w-full h-11 rounded-2xl font-bold shadow-xl shadow-primary/20">
                    Show {filteredEvents.length} results
                  </Button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
        {filteredEvents.map((event) => (
          <Link key={event.id} href={`/events/${event.slug}`}>
            <div className="group bg-card border border-border rounded-[1.25rem] md:rounded-[2.5rem] overflow-hidden hover:border-primary/50 transition-all flex flex-col h-full hover:shadow-2xl hover:shadow-primary/5">
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image 
                  src={event.image} 
                  alt={event.title} 
                  fill 
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute top-2 left-2 md:top-4 md:left-4">
                  <Badge className="bg-black/60 backdrop-blur-md border-none py-0.5 px-1.5 md:py-1.5 md:px-3 uppercase text-[6px] md:text-[10px] font-black tracking-widest text-white">
                    {event.category}
                  </Badge>
                </div>
                {/* Actions Overlay */}
                <div className="absolute top-2 right-2 md:top-4 md:right-4 flex gap-2">
                  <Button 
                    size="icon" 
                    variant="secondary" 
                    className="w-7 h-7 md:w-10 md:h-10 rounded-full bg-black/40 backdrop-blur-md border-none text-white hover:bg-black/60 transition-colors"
                    onClick={handleBookmark}
                  >
                    <Heart className="w-3 h-3 md:w-5 md:h-5" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="secondary" 
                    className="w-7 h-7 md:w-10 md:h-10 rounded-full bg-black/40 backdrop-blur-md border-none text-white hover:bg-black/60 transition-colors"
                    onClick={(e) => handleShare(e, event.slug)}
                  >
                    <Share2 className="w-3 h-3 md:w-5 md:h-5" />
                  </Button>
                </div>
              </div>
              <div className="p-3 md:p-8 flex flex-col flex-1 text-left">
                <div className="text-primary text-[8px] md:text-sm font-black uppercase tracking-[0.1em] md:tracking-[0.2em] mb-1 md:mb-3 flex items-center gap-1">
                  <Calendar className="w-2 h-2 md:w-4 md:h-4" />
                  {mounted ? new Date(event.date).toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Loading date...'}
                </div>
                <h3 className="font-headline text-sm md:text-2xl mb-1 md:mb-2 group-hover:text-primary transition-colors line-clamp-1">{event.title}</h3>
                <div className="flex items-center gap-1 text-muted-foreground text-[8px] md:text-sm mb-2 md:mb-6">
                  <MapPin className="w-2 h-2 md:w-4 md:h-4 text-accent" /> <span className="truncate">{event.venue}</span>
                </div>
                <div className="mt-auto pt-2 md:pt-6 border-t border-border flex items-center justify-between">
                  <div className="space-y-0">
                    <span className="hidden md:block text-[8px] md:text-[10px] uppercase font-black text-muted-foreground tracking-widest">Entry</span>
                    <span className="block text-xs md:text-xl font-black text-primary leading-none">
                      {event.price.min === 0 ? 'FREE' : `₦${event.price.min.toLocaleString()}`}
                    </span>
                  </div>
                  <Button size="sm" className="rounded-full px-3 md:px-6 shadow-lg shadow-primary/20 font-bold">View</Button>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-32 bg-card/20 rounded-[3rem] border border-dashed border-border/50">
          <Search className="w-16 h-16 text-muted-foreground mx-auto mb-6 opacity-20" />
          <h3 className="text-2xl font-headline mb-3">No results found</h3>
          <p className="text-muted-foreground max-w-sm mx-auto mb-8">Try adjusting your filters or search query to find more experiences.</p>
          <Button variant="secondary" className="rounded-full px-8 h-11 font-bold" onClick={resetFilters}>
            Clear all filters
          </Button>
        </div>
      )}
    </div>
  );
}

export default function DiscoverPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 pt-48 md:pt-56 pb-8">
        <Suspense fallback={
          <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-muted-foreground font-medium animate-pulse">Loading experiences...</p>
          </div>
        }>
          <DiscoverContent />
        </Suspense>
      </main>
    </div>
  );
}