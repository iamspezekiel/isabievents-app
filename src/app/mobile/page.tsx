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
      {/* Immersive Hero Header - Optimized spacing */}
      <section className="relative min-h-[80vh] w-full flex items-end pb-12 md:pb-20 pt-48 overflow-hidden">
        <Image 
          src="https://picsum.photos/seed/mobile-v3/1920/1080" 
          alt="IsabiEvents Mobile" 
          fill 
          className="object-cover brightness-[0.35]"
          priority
          data-ai-hint="mobile technology"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl space-y-8">
            <div className="flex flex-col gap-2">
              <Badge className="w-fit bg-primary text-white border-none py-1 px-4 font-black tracking-widest uppercase mb-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
                NIGERIAN EXPERIENCE
              </Badge>
              <h1 className="text-4xl md:text-7xl leading-none animate-in fade-in slide-in-from-bottom-6 duration-1000">
                Your Tickets. <br />
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Everywhere
                </span> You Go.
              </h1>
            </div>
            
            <p className="text-muted-foreground text-lg md:text-xl font-medium max-w-2xl leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000">
              Experience Nigeria's best events with zero friction. Buy, store, and transfer tickets even when you're offline.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2 animate-in fade-in slide-in-from-bottom-10 duration-1000">
              <Button size="lg" className="h-14 px-8 rounded-full text-base gap-3 shadow-2xl shadow-primary/40 hover:scale-105 transition-all">
                <Apple className="w-6 h-6 fill-current" />
                <div className="flex flex-col items-start leading-none text-left">
                  <span className="text-[9px] font-black uppercase tracking-tighter opacity-70">Download on the</span>
                  <span className="text-base font-bold">App Store</span>
                </div>
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-8 rounded-full text-base gap-3 border-2 border-white/20 bg-white/5 backdrop-blur-md text-white hover:bg-white/10 transition-all hover:scale-105">
                <Play className="w-6 h-6 fill-current" />
                <div className="flex flex-col items-start leading-none text-left">
                  <span className="text-[9px] font-black uppercase tracking-tighter opacity-70">Get it on</span>
                  <span className="text-base font-bold">Google Play</span>
                </div>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Value Prop Section - Tightened top spacing */}
      <section className="pt-12 pb-12 relative overflow-hidden">
        <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-primary/10 blur-[150px] rounded-full -translate-x-1/2 -z-10" />
        <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-accent/10 blur-[150px] rounded-full translate-x-1/2 -z-10" />
        
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto mb-10 space-y-4">
            <h2 className="text-xl md:text-3xl text-balance font-black tracking-tight">
              Built for the <br />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent italic">Nigerian Experience</span>
            </h2>
            <p className="text-muted-foreground text-base md:text-lg font-medium max-w-2xl mx-auto leading-relaxed">
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
      <section className="py-16 bg-card/30 border-y border-border">
         <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
                <div className="relative z-10 mx-auto w-64 md:w-80 aspect-[1/2] bg-card border-[10px] border-border rounded-[3rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.4)] overflow-hidden ring-4 ring-primary/5">
                  <Image 
                      src="https://picsum.photos/seed/interface1/500/1000" 
                      alt="App interface" 
                      fill 
                      className="object-cover"
                  />
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-border rounded-b-2xl" />
                </div>
                {/* Floating Elements */}
                <div className="absolute -top-6 -right-6 bg-card p-4 rounded-2xl shadow-2xl border border-border animate-bounce duration-[4000ms]">
                   <QrCode className="w-8 h-8 text-primary" />
                </div>
                <div className="absolute bottom-16 -left-8 bg-card p-4 rounded-2xl shadow-2xl border border-border animate-pulse">
                   <Star className="w-8 h-8 text-yellow-500 fill-yellow-500" />
                </div>
            </div>

            <div className="space-y-10">
               <h2 className="text-left leading-tight text-xl md:text-2xl font-black">Fast. Secure. <br /> Always with you.</h2>
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
                  <Button size="lg" className="rounded-full h-14 px-8 text-base gap-3 group">
                    Explore App Features <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                  </Button>
               </div>
            </div>
         </div>
      </section>

      {/* Call to Action */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-5xl mx-auto relative group overflow-hidden p-12 md:p-20 bg-primary/5 border border-primary/10 rounded-[4rem] shadow-2xl">
            <div className="absolute top-0 left-0 w-80 h-80 bg-primary/10 blur-[100px] rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-accent/10 blur-[100px] rounded-full translate-x-1/2 translate-y-1/2" />
            
            <div className="relative z-10 space-y-8">
              <h2 className="text-2xl md:text-4xl font-black leading-tight tracking-tight">
                Ready to <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">ditch paper?</span>
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed">
                Join over 150,000+ Nigerians who have upgraded their social lives. No more queues, no more printed tickets.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4 pt-6">
                <Button size="lg" className="rounded-full h-14 px-8 text-base shadow-2xl shadow-primary/40 hover:-translate-y-1 transition-all gap-3">
                  <Apple className="w-6 h-6 fill-current" />
                  <div className="flex flex-col items-start leading-none text-left">
                    <span className="text-[9px] font-black uppercase tracking-tighter opacity-70">App Store</span>
                    <span className="text-base font-bold">Download Now</span>
                  </div>
                </Button>
                <Button variant="outline" size="lg" className="rounded-full h-14 px-8 text-base border-2 border-border bg-card hover:bg-secondary hover:-translate-y-1 transition-all shadow-2xl gap-3">
                  <Play className="w-6 h-6 fill-current" />
                  <div className="flex flex-col items-start leading-none text-left">
                    <span className="text-[9px] font-black uppercase tracking-tighter opacity-70">Google Play</span>
                    <span className="text-base font-bold">Get it Free</span>
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
    <div className="group p-8 rounded-[3rem] bg-card border border-border hover:border-primary/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.08)]">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-lg ${colorMap[color] || colorMap.primary}`}>
        <Icon className="w-7 h-7" />
      </div>
      <div className="space-y-4">
        <h3 className="text-xl font-black tracking-tight leading-tight">{title}</h3>
        <p className="text-muted-foreground leading-relaxed text-sm md:text-base font-medium">{desc}</p>
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
       <div className="space-y-1">
          <h4 className="text-lg font-black tracking-tight">{title}</h4>
          <p className="text-muted-foreground leading-relaxed text-sm font-medium">{desc}</p>
       </div>
    </div>
  );
}
