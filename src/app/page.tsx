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
import { CATEGORIES, MOCK_EVENTS } from '@/lib/mock-data';
import Image from 'next/image';
import Link from 'next/link';

const iconMap: any = {
  Music, Trophy, Mic2, GlassWater, Dribbble, Church, Palette, Images, Cpu, Users: UsersIcon,
  Laptop, Network, Activity, GraduationCap, HandHeart
};

export default function HomePage() {
  const [search, setSearch] = useState('');

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero & Categories Combined Section for Blended Background */}
      <div className="relative pt-60 pb-16 overflow-hidden">
        {/* Blended Background Gradient */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[1000px] bg-primary/10 blur-[150px] -z-10 rounded-full" />
        
        <div className="container mx-auto px-4">
          {/* Hero Content */}
          <div className="text-center mb-24">
            <Badge className="mb-4 py-1.5 px-4 bg-primary/20 text-primary border-primary/20 hover:bg-primary/20 animate-in fade-in slide-in-from-bottom-4 duration-700">
              Trusted by 50,000+ Nigerians
            </Badge>
            <h1 className="text-3xl md:text-7xl mb-6 leading-[1.05] max-w-4xl mx-auto font-black tracking-tighter text-balance animate-in fade-in slide-in-from-bottom-8 duration-1000">
              Experience the Best of <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Nigerian</span> Events
            </h1>
            <p className="text-muted-foreground text-sm md:text-xl max-w-2xl mx-auto mb-8 animate-in fade-in slide-in-from-bottom-12 duration-1000">
              Discover and secure your spot with zero friction.
            </p>

            <div className="max-w-3xl mx-auto bg-card border border-border p-2 md:p-3 rounded-[1.5rem] md:rounded-full flex flex-col md:flex-row items-center gap-2 md:gap-3 shadow-2xl animate-in fade-in slide-in-from-bottom-16 duration-1000">
              <div className="flex-1 w-full relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input 
                  placeholder="Search events, artists, venues..." 
                  className="pl-14 h-14 bg-secondary/30 md:bg-transparent border-none focus-visible:ring-0 text-base md:text-lg rounded-xl md:rounded-full"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Link href={`/discover?q=${encodeURIComponent(search)}`} className="w-full md:w-auto">
                <Button size="lg" className="w-full md:w-auto h-14 px-10 rounded-full text-lg shadow-lg shadow-primary/20 font-bold transition-transform hover:scale-[1.02] active:scale-95">
                  Discover Events
                </Button>
              </Link>
            </div>
          </div>

          {/* Top Categories Section (Blended) */}
          <section className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl md:text-3xl font-black tracking-tighter text-left">Top Categories</h2>
              <Link href="/discover">
                <Button variant="ghost" className="rounded-full px-6 font-semibold gap-2">
                  View All <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
              {CATEGORIES.slice(0, 10).map((cat, index) => {
                const IconComp = iconMap[cat.icon] || Music;
                return (
                  <Link 
                    key={cat.id} 
                    href={`/discover?category=${cat.id}`}
                    className={index >= 8 ? "hidden lg:block" : "block"}
                  >
                    <Card className="hover:border-primary transition-all group overflow-hidden cursor-pointer bg-card/50 backdrop-blur-sm rounded-2xl border-white/10">
                      <CardContent className="p-4 md:p-6 flex flex-col items-center text-center gap-3 md:gap-4">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300">
                          <IconComp className="w-5 h-5 md:w-6 md:h-6 text-muted-foreground group-hover:text-white transition-colors" />
                        </div>
                        <span className="font-bold tracking-tight text-xs md:text-sm">{cat.name}</span>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </section>
        </div>
      </div>

      {/* Trending Events */}
      <section className="pt-20 pb-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div className="text-left">
              <h2 className="text-2xl md:text-4xl font-black tracking-tighter">Trending</h2>
            </div>
            <Button className="rounded-full px-4 md:px-6 shadow-lg shadow-primary/20 font-semibold gap-2" asChild>
              <Link href="/discover">Explore More <ArrowRight className="w-4 h-4" /></Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8 mb-8">
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
                    <div className="absolute top-2 left-2 md:top-4 md:left-4">
                      <Badge className="bg-black/60 backdrop-blur-md text-white border-none py-0.5 px-1.5 md:py-1.5 md:px-3 text-[6px] md:text-xs">
                        {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-3 md:p-6 text-left">
                    <div className="flex items-center gap-1 md:gap-2 text-primary text-[8px] md:text-sm font-semibold mb-1 md:mb-3">
                      <Calendar className="w-2 h-2 md:w-4 md:h-4" />
                      {new Date(event.date).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' })}
                    </div>
                    <h3 className="text-sm md:text-xl mb-1 md:mb-2 group-hover:text-primary transition-colors line-clamp-1 font-bold">{event.title}</h3>
                    <p className="text-muted-foreground text-[8px] md:text-sm flex items-center gap-1 mb-2 md:mb-6">
                      <MapPin className="w-2 h-2 md:w-4 md:h-4 text-accent" /> <span className="truncate">{event.venue}</span>
                    </p>
                    
                    <div className="flex items-center justify-between pt-2 md:pt-4 border-t border-border">
                      <div className="hidden md:flex items-center gap-2">
                        <div className="relative w-8 h-8 rounded-full overflow-hidden">
                          <Image src={event.organizer.avatar} alt={event.organizer.name} fill className="object-cover" />
                        </div>
                        <span className="text-xs font-bold text-muted-foreground">{event.organizer.name}</span>
                        {event.organizer.verified && <CheckCircle2 className="w-3 h-3 text-primary" />}
                      </div>
                      <div className="w-full md:w-auto text-right">
                        <span className="text-xs md:text-xl font-black text-primary">
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
      <section className="py-20 bg-card/30 border-y border-border">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-5xl font-black tracking-tighter mb-12">Why thousands choose IsabiEvents</h2>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="space-y-4">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6">
                <Star className="w-6 h-6 md:w-8 md:h-8 text-primary" />
              </div>
              <h3 className="text-lg md:text-xl font-bold tracking-tight">Verified Organizers</h3>
              <p className="text-sm md:text-base text-muted-foreground">Every event organizer undergoes strict KYC verification before listing on our platform.</p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6">
                <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8 text-primary" />
              </div>
              <h3 className="text-lg md:text-xl font-bold tracking-tight">Instant Ticket Delivery</h3>
              <p className="text-sm md:text-base text-muted-foreground">Receive your unique secure QR code ticket immediately via email and in your wallet after payment.</p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6">
                <GlassWater className="w-6 h-6 md:w-8 md:h-8 text-primary" />
              </div>
              <h3 className="text-lg md:text-xl font-bold tracking-tight">Seamless Payouts</h3>
              <p className="text-sm md:text-base text-muted-foreground">Organizers and vendors receive automated settlements via our robust fintech integrations.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
