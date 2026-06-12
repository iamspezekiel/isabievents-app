
"use client";

import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  Calendar, 
  ArrowRight, 
  Star, 
  CheckCircle2, 
  Music, 
  Trophy, 
  Mic2, 
  GlassWater, 
  Dribbble, 
  Church, 
  Palette, 
  Images, 
  Cpu, 
  Users as UsersIcon,
  Laptop,
  Network,
  Activity,
  GraduationCap,
  HandHeart
} from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORIES, MOCK_EVENTS, CITIES } from '@/lib/mock-data';
import Image from 'next/image';
import Link from 'next/link';

const iconMap: any = {
  Music, Trophy, Mic2, GlassWater, Dribbble, Church, Palette, Images, Cpu, Users: UsersIcon,
  Laptop, Network, Activity, GraduationCap, HandHeart
};

export default function HomePage() {
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('Lagos');

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative pt-44 pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/10 blur-[120px] -z-10 rounded-full" />
        <div className="container mx-auto px-4 text-center">
          <Badge className="mb-6 py-1.5 px-4 bg-primary/20 text-primary border-primary/20 hover:bg-primary/20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            Trusted by 50,000+ Nigerians
          </Badge>
          <h1 className="text-5xl md:text-7xl mb-8 leading-[1.05] max-w-4xl mx-auto font-black tracking-tighter text-balance animate-in fade-in slide-in-from-bottom-8 duration-1000">
            Experience the Best of <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Nigerian</span> Events
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-12 animate-in fade-in slide-in-from-bottom-12 duration-1000">
            Secure tickets to concerts, festivals, conferences and more. Built for speed, security, and the Naija spirit.
          </p>

          <div className="max-w-4xl mx-auto bg-card border border-border p-3 rounded-2xl md:rounded-full flex flex-col md:flex-row items-center gap-3 shadow-2xl animate-in fade-in slide-in-from-bottom-16 duration-1000">
            <div className="flex-1 w-full relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input 
                placeholder="Search events, artists, venues..." 
                className="pl-12 h-14 bg-transparent border-none focus-visible:ring-0 text-lg"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="w-full md:w-auto h-full px-4 border-l border-border hidden md:flex items-center gap-2">
              <MapPin className="text-primary w-5 h-5 shrink-0" />
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger className="border-none bg-transparent focus:ring-0 focus:ring-offset-0 h-auto p-0 pr-6 font-medium text-foreground w-[120px]">
                  <SelectValue placeholder="City" />
                </SelectTrigger>
                <SelectContent>
                  {CITIES.map(city => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Link href={`/discover?q=${encodeURIComponent(search)}&city=${encodeURIComponent(selectedCity)}`}>
              <Button size="lg" className="w-full md:w-auto h-14 px-10 rounded-full text-lg shadow-lg shadow-primary/20">
                Discover Events
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-black tracking-tighter">Browse by Category</h2>
            <Link href="/categories">
              <Button className="rounded-full px-6 shadow-lg shadow-primary/20 font-semibold gap-2">
                View All <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {CATEGORIES.slice(0, 10).map((cat) => {
              const IconComp = iconMap[cat.icon] || Music;
              return (
                <Link key={cat.id} href={`/discover?category=${cat.id}`}>
                  <Card className="hover:border-primary transition-all group overflow-hidden cursor-pointer bg-card/50">
                    <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <IconComp className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <span className="font-bold tracking-tight">{cat.name}</span>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="pb-24">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-2">Trending Events</h2>
              <p className="text-muted-foreground">What's hot right now in {selectedCity}</p>
            </div>
            <Button className="rounded-full px-6 shadow-lg shadow-primary/20 font-semibold gap-2" asChild>
              <Link href="/discover">Explore More <ArrowRight className="w-4 h-4" /></Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {MOCK_EVENTS.slice(0, 6).map((event) => (
              <Link key={event.id} href={`/events/${event.id}`}>
                <div className="group relative rounded-2xl overflow-hidden bg-card border border-border hover:border-primary/50 transition-all hover:shadow-2xl hover:shadow-primary/5">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image 
                      src={event.image} 
                      alt={event.title} 
                      fill 
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      data-ai-hint="event poster"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-black/60 backdrop-blur-md text-white border-none py-1.5 px-3">
                        {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-primary text-sm font-semibold mb-3">
                      <Calendar className="w-4 h-4" />
                      {new Date(event.date).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    <h3 className="text-xl mb-2 group-hover:text-primary transition-colors line-clamp-1">{event.title}</h3>
                    <p className="text-muted-foreground text-sm flex items-center gap-1 mb-6">
                      <MapPin className="w-4 h-4 text-accent" /> {event.venue}
                    </p>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div className="flex items-center gap-2">
                        <div className="relative w-8 h-8 rounded-full overflow-hidden">
                          <Image src={event.organizer.avatar} alt={event.organizer.name} fill className="object-cover" />
                        </div>
                        <span className="text-xs font-bold text-muted-foreground">{event.organizer.name}</span>
                        {event.organizer.verified && <CheckCircle2 className="w-3 h-3 text-primary" />}
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-black text-primary">
                          {event.price.min === 0 ? 'FREE' : `₦${event.price.min.toLocaleString()}`}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center">
            <Link href="/discover">
              <Button size="lg" className="rounded-full px-12 h-14 text-lg shadow-xl shadow-primary/20 group">
                Discover More Events <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24 bg-card/30 border-y border-border">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-16">Why thousands choose IsabiEvents</h2>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Star className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold tracking-tight">Verified Organizers</h3>
              <p className="text-muted-foreground">Every event organizer undergoes strict KYC verification before listing on our platform.</p>
            </div>
            <div className="space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold tracking-tight">Instant Ticket Delivery</h3>
              <p className="text-muted-foreground">Receive your unique secure QR code ticket immediately via email and in your wallet after payment.</p>
            </div>
            <div className="space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <GlassWater className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold tracking-tight">Seamless Payouts</h3>
              <p className="text-muted-foreground">Organizers and vendors receive automated settlements via our robust fintech integrations.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
