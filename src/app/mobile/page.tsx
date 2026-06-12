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
  Lock,
  ChevronRight
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
import Image from 'next/image';

export default function MobileAppPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Immersive Hero Header - Fixed contrast for both modes */}
      <section className="relative min-h-[60vh] w-full flex items-end pb-12 pt-40 overflow-hidden">
        <Image 
          src="https://picsum.photos/seed/mobile-v3/1920/1080" 
          alt="IsabiEvents Mobile" 
          fill 
          className="object-cover brightness-[0.35]"
          priority
          data-ai-hint="mobile technology"
        />
        {/* Dark overlay to ensure contrast regardless of theme */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl space-y-6">
            <div className="flex flex-col gap-2">
              <Badge className="w-fit bg-primary text-white border-none py-1 px-4 font-black tracking-widest uppercase mb-1 animate-in fade-in slide-in-from-bottom-4 duration-700">
                NIGERIAN EXPERIENCE
              </Badge>
              <h1 className="text-3xl md:text-5xl leading-none animate-in fade-in slide-in-from-bottom-6 duration-1000 font-black tracking-tighter text-white">
                Your Tickets. <br />
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Everywhere
                </span> You Go.
              </h1>
            </div>
            
            <p className="text-white/80 text-sm md:text-base font-normal max-w-xl leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000">
              Experience Nigeria's best events with zero friction. Buy, store, and transfer tickets even when you're offline.
            </p>

            <div className="flex flex-row items-center gap-3 pt-2 animate-in fade-in slide-in-from-bottom-10 duration-1000">
              <Button size="lg" className="h-12 md:h-14 px-4 md:px-6 rounded-full text-xs md:text-sm gap-2 shadow-2xl shadow-primary/40 hover:scale-105 transition-all flex-1 sm:flex-none">
                <Apple className="w-4 h-4 md:w-5 md:h-5 fill-current" />
                <div className="flex flex-col items-start leading-none text-left">
                  <span className="text-[6px] md:text-[8px] font-black uppercase tracking-tighter opacity-70">Download on the</span>
                  <span className="text-[10px] md:text-sm font-bold">App Store</span>
                </div>
              </Button>
              <Button size="lg" variant="outline" className="h-12 md:h-14 px-4 md:px-6 rounded-full text-xs md:text-sm gap-2 border-2 border-white/20 bg-white/5 backdrop-blur-md text-white hover:bg-white/10 transition-all hover:scale-105 flex-1 sm:flex-none">
                <Play className="w-4 h-4 md:w-5 md:h-5 fill-current" />
                <div className="flex flex-col items-start leading-none text-left">
                  <span className="text-[6px] md:text-[8px] font-black uppercase tracking-tighter opacity-70">Get it on</span>
                  <span className="text-[10px] md:text-sm font-bold">Google Play</span>
                </div>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Value Prop Section */}
      <section className="py-24 relative overflow-hidden bg-background">
        <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-primary/5 blur-[150px] rounded-full -translate-x-1/2 -z-10" />
        <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-accent/5 blur-[150px] rounded-full translate-x-1/2 -z-10" />
        
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-2">
            <h2 className="text-xl md:text-3xl text-balance font-black tracking-tight">
              Built for the <br />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent italic">Nigerian Experience</span>
            </h2>
            <p className="text-muted-foreground text-sm font-normal max-w-xl mx-auto leading-relaxed">
              We've solved the real-world problems of physical ticketing, expensive data, and unreliable connectivity.
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

      {/* Featured Preview */}
      <section className="py-24 bg-secondary/30 border-y border-border">
         <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
                <div className="relative z-10 mx-auto w-48 md:w-64 aspect-[1/2] bg-card border-[8px] border-border rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] overflow-hidden ring-1 ring-white/10">
                  <Image 
                      src="https://picsum.photos/seed/interface1/500/1000" 
                      alt="App interface" 
                      fill 
                      className="object-cover"
                  />
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-border rounded-b-2xl" />
                </div>
                {/* Floating Elements */}
                <div className="absolute -top-6 -right-6 bg-card p-4 rounded-2xl shadow-xl border border-border animate-bounce duration-[4000ms]">
                   <QrCode className="w-6 h-6 text-primary" />
                </div>
                <div className="absolute bottom-12 -left-6 bg-card p-4 rounded-2xl shadow-xl border border-border animate-pulse">
                   <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                </div>
            </div>

            <div className="space-y-8 text-left">
               <h2 className="leading-tight text-xl md:text-3xl font-black">Fast. Secure. <br /> Always with you.</h2>
               <div className="space-y-6">
                  <FeatureListItem 
                    title="QR-Ready Entry" 
                    desc="Show your unique dynamic QR code at the gate for instant, error-free check-in." 
                  />
                  <FeatureListItem 
                    title="Real-time Notifications" 
                    desc="Never miss a set time or a schedule change with instant push alerts." 
                  />
                  <FeatureListItem 
                    title="Seamless Payouts" 
                    desc="For vendors and organizers, track your earnings and withdrawals in real-time." 
                  />
               </div>
               <div className="pt-4">
                  <Button size="lg" className="rounded-full h-12 px-8 text-sm gap-3 group shadow-xl shadow-primary/20">
                    Explore App Features <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                  </Button>
               </div>
            </div>
         </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto relative group overflow-hidden p-10 md:p-16 bg-primary/5 border border-primary/10 rounded-[3rem] shadow-2xl">
            <div className="absolute top-0 left-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-accent/10 blur-[80px] rounded-full translate-x-1/2 translate-y-1/2" />
            
            <div className="relative z-10 space-y-8">
              <h2 className="text-xl md:text-4xl font-black leading-tight tracking-tight">
                Ready to <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">ditch paper?</span>
              </h2>
              <p className="text-muted-foreground text-sm md:text-base font-normal max-w-xl mx-auto leading-relaxed">
                Join over 150,000+ Nigerians who have upgraded their social lives. No more queues, no more printed tickets.
              </p>
              
              <div className="flex flex-row items-center justify-center gap-3 pt-4">
                <Button size="lg" className="h-12 md:h-16 px-5 md:px-8 rounded-full text-xs md:text-sm shadow-2xl shadow-primary/40 hover:-translate-y-1 transition-all gap-2 md:gap-3 flex-1 sm:flex-none">
                  <Apple className="w-5 h-5 md:w-6 md:h-6 fill-current" />
                  <div className="flex flex-col items-start leading-none text-left">
                    <span className="text-[8px] font-black uppercase tracking-tighter opacity-70">App Store</span>
                    <span className="text-[10px] md:text-base font-bold">Download Now</span>
                  </div>
                </Button>
                <Button variant="outline" size="lg" className="h-12 md:h-16 px-5 md:px-8 rounded-full text-xs md:text-sm border-2 border-border bg-card hover:bg-secondary hover:-translate-y-1 transition-all shadow-2xl gap-2 md:gap-3 flex-1 sm:flex-none">
                  <Play className="w-5 h-5 md:w-6 md:h-6 fill-current" />
                  <div className="flex flex-col items-start leading-none text-left">
                    <span className="text-[8px] font-black uppercase tracking-tighter opacity-70">Google Play</span>
                    <span className="text-[10px] md:text-base font-bold">Get it Free</span>
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
    primary: "text-primary bg-primary/10",
    accent: "text-accent bg-accent/10",
    white: "text-foreground bg-secondary"
  };

  return (
    <div className="group p-8 rounded-[2.5rem] bg-card border border-border hover:border-primary/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)]">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-md ${colorMap[color] || colorMap.primary}`}>
        <Icon className="w-7 h-7" />
      </div>
      <div className="space-y-3 text-left">
        <h3 className="text-lg md:text-xl font-black tracking-tight leading-tight">{title}</h3>
        <p className="text-muted-foreground leading-relaxed text-sm font-normal">{desc}</p>
      </div>
    </div>
  );
}

function FeatureListItem({ title, desc }: any) {
  return (
    <div className="flex items-start gap-4 group">
       <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary transition-colors">
          <ChevronRight className="w-5 h-5 text-primary group-hover:text-white transition-transform group-hover:translate-x-1" />
       </div>
       <div className="space-y-1 text-left">
          <h4 className="text-base md:text-lg font-black tracking-tight">{title}</h4>
          <p className="text-muted-foreground leading-relaxed text-sm font-normal">{desc}</p>
       </div>
    </div>
  );
}
