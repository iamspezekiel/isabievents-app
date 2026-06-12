"use client";

import React from 'react';
import { 
  Smartphone, 
  Download, 
  QrCode, 
  Bell, 
  Zap, 
  ShieldCheck, 
  ArrowRight, 
  Star, 
  Apple, 
  Play, 
  Share2, 
  Lock
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
import Image from 'next/image';

export default function MobileAppPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-48 pb-32">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full -z-10 translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-accent/5 blur-[100px] rounded-full -z-10 -translate-x-1/2" />
        
        <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-10 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-xs font-bold uppercase tracking-widest text-primary animate-in fade-in slide-in-from-left-4 duration-700">
              <Zap className="w-4 h-4 fill-primary" /> Version 2.0 Now Live
            </div>
            
            <div className="space-y-6">
              <h1 className="animate-in fade-in slide-in-from-left-4 duration-700 font-black text-5xl md:text-8xl leading-[1.05] tracking-tighter text-balance">
                Your Tickets. <br />
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Everywhere
                </span> You Go.
              </h1>
              <p className="text-muted-foreground text-xl max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                Experience Nigeria&apos;s best events with zero friction. Buy, store, and transfer tickets even when you&apos;re offline.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Button size="lg" className="h-16 px-8 rounded-full text-lg gap-4 shadow-xl shadow-primary/20 hover:scale-105 hover:-translate-y-0.5 transition-all">
                <Apple className="w-7 h-7 fill-current" />
                <div className="flex flex-col items-start leading-none text-left">
                  <span className="text-[10px] font-bold uppercase tracking-tighter opacity-70">Download on the</span>
                  <span className="text-lg font-bold">App Store</span>
                </div>
              </Button>
              <Button size="lg" variant="outline" className="h-16 px-8 rounded-full text-lg gap-4 border-2 border-border bg-card hover:bg-secondary transition-all hover:scale-105 hover:-translate-y-0.5 shadow-xl shadow-black/5">
                <Play className="w-7 h-7 fill-current" />
                <div className="flex flex-col items-start leading-none text-left">
                  <span className="text-[10px] font-bold uppercase tracking-tighter opacity-70">Get it on</span>
                  <span className="text-lg font-bold">Google Play</span>
                </div>
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-8 pt-4">
               <div className="flex flex-col items-center lg:items-start">
                 <div className="flex items-center gap-1 mb-1">
                   {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />)}
                 </div>
                 <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">4.9/5 Average Rating</span>
               </div>
               <div className="h-10 w-px bg-border hidden sm:block" />
               <div className="flex flex-col items-center lg:items-start">
                 <span className="text-xl font-black">150k+</span>
                 <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Active Installs</span>
               </div>
            </div>
          </div>

          <div className="relative animate-in zoom-in-95 duration-1000">
            <div className="relative z-10 mx-auto w-64 md:w-80 aspect-[1/2] bg-card border-[12px] border-border rounded-[3.5rem] shadow-2xl overflow-hidden ring-4 ring-primary/10">
               <Image 
                  src="https://picsum.photos/seed/mobile-v2/400/800" 
                  alt="App interface" 
                  fill 
                  className="object-cover"
                  data-ai-hint="mobile app"
               />
               <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-border rounded-b-2xl" />
            </div>
            
            {/* Floating UI Elements */}
            <div className="absolute top-1/4 -right-8 md:-right-16 bg-card border border-border p-4 rounded-3xl shadow-2xl animate-bounce duration-[3000ms] z-20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                  <QrCode className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase text-muted-foreground">Gate Entry</div>
                  <div className="text-xs font-bold">Fast Scanned</div>
                </div>
              </div>
            </div>

            <div className="absolute top-1/2 -right-12 md:-right-20 bg-card border border-border p-4 rounded-3xl shadow-2xl animate-pulse delay-700 z-20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center">
                  <Lock className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase text-muted-foreground">Transfer</div>
                  <div className="text-xs font-bold">Securely Sent</div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-1/4 -left-8 md:-left-16 bg-card border border-border p-4 rounded-3xl shadow-2xl animate-pulse z-20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center">
                  <Bell className="w-6 h-6 text-muted-foreground" />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase text-muted-foreground">New Event</div>
                  <div className="text-xs font-bold">Jazz Night!</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Prop Section */}
      <section className="py-24 relative overflow-hidden">
        {/* Background Atmospheric Glows */}
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-primary/5 blur-[120px] rounded-full -translate-x-1/2" />
        <div className="absolute top-1/2 right-0 w-64 h-64 bg-accent/5 blur-[120px] rounded-full translate-x-1/2" />
        
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto mb-20 space-y-4">
            <Badge className="bg-primary/10 text-primary border-none py-1.5 px-6 font-bold tracking-widest uppercase mb-4">OPTIMIZED FOR NIGERIA</Badge>
            <h2 className="font-headline text-4xl md:text-7xl font-black tracking-tighter leading-tight">
              Built for the <br />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Nigerian Experience</span>
            </h2>
            <p className="text-muted-foreground text-xl md:text-2xl font-medium max-w-2xl mx-auto leading-relaxed">
              We&apos;ve solved the real-world problems of physical ticketing, expensive data, and unreliable connectivity.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <AppFeature 
              icon={ShieldCheck} 
              title="True Offline Access" 
              desc="Your tickets are saved locally with bank-level encryption. Walk into any venue even without an active data connection."
              color="primary"
            />
            <AppFeature 
              icon={Bell} 
              title="Priority Alerts" 
              desc="Get exclusive first-look access to flash sales, lineup drops, and sold-out alerts before they hit the web."
              color="accent"
            />
            <AppFeature 
              icon={Lock} 
              title="Secure Transfers" 
              desc="Bought for a friend? Transfer tickets securely via phone number with instant ownership verification and zero fraud."
              color="white"
            />
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto relative group overflow-hidden p-12 md:p-24 bg-primary/10 border border-primary/20 rounded-[4rem] shadow-2xl shadow-primary/5">
            {/* Background Glows */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-accent/10 blur-[100px] rounded-full translate-x-1/2 translate-y-1/2" />
            
            <div className="relative z-10 space-y-10">
              <h2 className="font-headline text-5xl md:text-7xl font-black leading-tight tracking-tighter">
                Ready to <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">ditch paper?</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed">
                Join over 150,000+ Nigerians who have upgraded their social lives. No more queues, no more printed tickets.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-6 pt-8">
                <Button size="lg" className="rounded-full h-16 px-12 text-lg shadow-xl shadow-primary/20 hover:scale-105 hover:-translate-y-1 transition-all gap-4">
                  <Apple className="w-8 h-8 fill-current" />
                  <div className="flex flex-col items-start leading-none text-left">
                    <span className="text-[10px] font-black uppercase tracking-tighter opacity-70">App Store</span>
                    <span className="text-lg font-bold">Download Now</span>
                  </div>
                </Button>
                <Button variant="outline" size="lg" className="rounded-full h-16 px-12 text-lg border-2 border-border bg-card hover:bg-secondary hover:scale-105 hover:-translate-y-1 transition-all shadow-xl shadow-black/5 gap-4">
                  <Play className="w-7 h-7 fill-current" />
                  <div className="flex flex-col items-start leading-none text-left">
                    <span className="text-[10px] font-black uppercase tracking-tighter opacity-70">Google Play</span>
                    <span className="text-lg font-bold">Get it Free</span>
                  </div>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function AppFeature({ icon: Icon, title, desc, color }: any) {
  const colorMap: any = {
    primary: "text-primary bg-primary/20 shadow-primary/20",
    accent: "text-accent bg-accent/20 shadow-accent/20",
    white: "text-foreground bg-secondary shadow-secondary/20"
  };

  return (
    <div className="group p-10 rounded-[3rem] bg-card border border-border hover:border-primary/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/5">
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-lg ${colorMap[color] || colorMap.primary}`}>
        <Icon className="w-8 h-8" />
      </div>
      <div className="space-y-4">
        <h3 className="font-headline text-2xl font-black tracking-tight leading-tight">{title}</h3>
        <p className="text-muted-foreground leading-relaxed text-sm font-medium">{desc}</p>
      </div>
    </div>
  );
}
