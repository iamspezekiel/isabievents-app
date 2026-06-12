"use client";

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, MapPin, Filter, Loader2, CircleDollarSign, X, Check } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose, SheetFooter } from "@/components/ui/sheet";
import { MOCK_EVENTS, CATEGORIES, CITIES } from '@/lib/mock-data';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from "@/lib/utils";

function DiscoverContent() {
  const searchParams = useSearchParams();
  
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [selectedCity, setSelectedCity] = useState(searchParams.get('city') || 'all');
  const [priceFilter, setPriceFilter] = useState(searchParams.get('price') || 'all');

  // Sync state if URL params change externally
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
      const matchesSearch = event.title.toLowerCase().includes(search.toLowerCase()) || 
                           event.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
      const matchesCity = selectedCity === 'all' || event.city === selectedCity;
      const matchesPrice = priceFilter === 'all' || 
                          (priceFilter === 'free' && event.price.min === 0) ||
                          (priceFilter === 'paid' && event.price.min > 0);
      return matchesSearch && matchesCategory && matchesCity && matchesPrice;
    });
  }, [search, selectedCategory, selectedCity, priceFilter]);

  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setSelectedCity('all');
    setPriceFilter('all');
  };

  const FilterContent = ({ showTitle = false }: { showTitle?: boolean }) => (
    <div className="space-y-8 py-4">
      {showTitle && (
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-headline text-xl">Filters</h3>
          <Button variant="ghost" size="sm" onClick={resetFilters} className="text-primary hover:text-primary/80 font-bold">Reset</Button>
        </div>
      )}
      
      <div className="space-y-4">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Location</label>
        <Select value={selectedCity} onValueChange={setSelectedCity}>
          <SelectTrigger className="w-full bg-secondary/30 border-border rounded-xl h-12 px-4 focus:ring-primary">
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

      <div className="space-y-4">
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
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Desktop Sidebar Filters */}
      <aside className="hidden lg:block w-72 shrink-0">
        <div className="sticky top-32 bg-card/30 border border-border rounded-[2.5rem] p-8">
          <FilterContent showTitle />
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
            {search && (
              <button 
                onClick={() => setSearch('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-secondary rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 shrink-0 w-full sm:w-auto">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="h-14 rounded-2xl px-6 gap-2 border-border bg-card font-bold w-full sm:w-auto">
                  <Filter className="w-5 h-5" /> Filters
                  {(selectedCategory !== 'all' || selectedCity !== 'all' || priceFilter !== 'all') && (
                    <Badge className="ml-1 w-5 h-5 p-0 flex items-center justify-center bg-primary text-white text-[10px]">
                      {[selectedCategory, selectedCity, priceFilter].filter(v => v !== 'all').length}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full bg-card border-border p-0 flex flex-col h-full">
                <SheetHeader className="p-6 border-b border-border text-left">
                  <div className="flex items-center justify-between">
                    <SheetTitle className="font-headline text-2xl">Refine Search</SheetTitle>
                    <Button variant="ghost" size="sm" onClick={resetFilters} className="text-primary font-bold">Reset</Button>
                  </div>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto px-6">
                  <FilterContent />
                </div>
                <SheetFooter className="p-6 border-t border-border mt-auto">
                  <SheetClose asChild>
                    <Button className="w-full h-14 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20">
                      Show {filteredEvents.length} results
                    </Button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>
            
            <div className="hidden lg:block">
              <Select value={priceFilter} onValueChange={setPriceFilter}>
                <SelectTrigger className="h-14 rounded-2xl px-6 gap-2 border-border bg-card min-w-[140px] focus:ring-primary font-bold">
                  <div className="flex items-center gap-2">
                    <CircleDollarSign className="w-5 h-5" />
                    <SelectValue placeholder="Price" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="free">Free Only</SelectItem>
                  <SelectItem value="paid">Paid Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between px-2">
          <div className="space-y-1 text-left">
            <h1 className="font-headline text-2xl">Discover Events</h1>
            <p className="text-muted-foreground text-sm font-medium">
              {filteredEvents.length === 0 ? 'No experiences found' : `Showing ${filteredEvents.length} results in Nigeria`}
            </p>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
          {filteredEvents.map((event) => (
            <Link key={event.id} href={`/events/${event.id}`}>
              <div className="group bg-card border border-border rounded-[2.5rem] overflow-hidden hover:border-primary/50 transition-all flex flex-col h-full hover:shadow-2xl hover:shadow-primary/5">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image 
                    src={event.image} 
                    alt={event.title} 
                    fill 
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-black/60 backdrop-blur-md border-none py-1.5 px-3 uppercase text-[10px] font-black tracking-widest text-white">
                      {event.category}
                    </Badge>
                  </div>
                </div>
                <div className="p-6 md:p-8 flex flex-col flex-1 text-left">
                  <div className="text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-3">
                    {new Date(event.date).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  <h3 className="font-headline text-xl md:text-2xl mb-2 group-hover:text-primary transition-colors line-clamp-1">{event.title}</h3>
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
                    <Button className="rounded-full px-6 shadow-lg shadow-primary/20 h-10 font-bold">View</Button>
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
            <p className="text-muted-foreground max-w-sm mx-auto mb-8 font-medium">Try adjusting your filters or search query to find more experiences.</p>
            <Button variant="secondary" className="rounded-full px-8 h-12 font-bold" onClick={resetFilters}>
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