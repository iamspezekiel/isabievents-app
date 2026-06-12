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
      {/* Immersive Hero Header - Balanced spacing */}
      <section className="relative min-h-[90vh] w-full flex items-end pb-12 md:pb-24 pt-64 overflow-hidden">
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
          <div className="max-w-4xl space-y-10">
            <div className="flex flex-col gap-2">
              <Badge className="w-fit bg-primary text-white border-none py-1.5 px-6 font-black tracking-widest uppercase mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                NIGERIAN EXPERIENCE
              </Badge>
              <h1 className="text-5xl md:text-8xl leading-none animate-in fade-in slide-in-from-bottom-6 duration-1000">
                Your Tickets. <br />
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Everywhere
                </span> You Go.
              </h1>
            </div>
            
            <p className="text-muted-foreground text-xl md:text-2xl font-medium max-w-2xl leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000">
              Experience Nigeria's best events with zero friction. Buy, store, and transfer tickets even when you're offline.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-6 pt-4 animate-in fade-in slide-in-from-bottom-10 duration-1000">
              <Button size="lg" className="h-16 px-10 rounded-full text-lg gap-4 shadow-2xl shadow-primary/40 hover:scale-105 transition-all">
                <Apple className="w-7 h-7 fill-current" />
                <div className="flex flex-col items-start leading-none text-left">
                  <span className="text-[10px] font-black uppercase tracking-tighter opacity-70">Download on the</span>
                  <span className="text-lg font-bold">App Store</span>
                </div>
              </Button>
              <Button size="lg" variant="outline" className="h-16 px-10 rounded-full text-lg gap-4 border-2 border-white/20 bg-white/5 backdrop-blur-md text-white hover:bg-white/10 transition-all hover:scale-105">
                <Play className="w-7 h-7 fill-current" />
                <div className="flex flex-col items-start leading-none text-left">
                  <span className="text-[10px] font-black uppercase tracking-tighter opacity-70">Get it on</span>
                  <span className="text-lg font-bold">Google Play</span>
                </div>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Value Prop Section - Reduced top padding */}
      <section className="pt-20 pb-12 relative overflow-hidden">
        <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-primary/10 blur-[150px] rounded-full -translate-x-1/2 -z-10" />
        <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-accent/10 blur-[150px] rounded-full translate-x-1/2 -z-10" />
        
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto mb-12 space-y-6">
            <h2 className="text-2xl md:text-4xl text-balance">
              Built for the <br />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent italic">Nigerian Experience</span>
            </h2>
            <p className="text-muted-foreground text-xl md:text-2xl font-medium max-w-2xl mx-auto leading-relaxed">
              We've solved the real-world problems of physical ticketing, expensive data, and unreliable connectivity.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-10">
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
      <section className="py-24 bg-card/30 border-y border-border">
         <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-24 items-center">
            <div className="relative">
                <div className="relative z-10 mx-auto w-72 md:w-96 aspect-[1/2] bg-card border-[12px] border-border rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden ring-8 ring-primary/5">
                  <Image 
                      src="https://picsum.photos/seed/interface1/500/1000" 
                      alt="App interface" 
                      fill 
                      className="object-cover"
                  />
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-border rounded-b-3xl" />
                </div>
                {/* Floating Elements */}
                <div className="absolute -top-10 -right-10 bg-card p-6 rounded-[2.5rem] shadow-2xl border border-border animate-bounce duration-[4000ms]">
                   <QrCode className="w-10 h-10 text-primary" />
                </div>
                <div className="absolute bottom-20 -left-12 bg-card p-6 rounded-[2.5rem] shadow-2xl border border-border animate-pulse">
                   <Star className="w-10 h-10 text-yellow-500 fill-yellow-500" />
                </div>
            </div>

            <div className="space-y-12">
               <h2 className="text-left leading-tight text-xl md:text-3xl">Fast. Secure. <br /> Always with you.</h2>
               <div className="space-y-8">
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
               <div className="pt-8">
                  <Button size="lg" className="rounded-full h-16 px-10 text-lg gap-4 group">
                    Explore App Features <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                  </Button>
               </div>
            </div>
         </div>
      </section>

      {/* Call to Action */}
      <section className="py-24">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-6xl mx-auto relative group overflow-hidden p-16 md:p-24 bg-primary/5 border border-primary/10 rounded-[5rem] shadow-2xl">
            <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 blur-[120px] rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/10 blur-[120px] rounded-full translate-x-1/2 translate-y-1/2" />
            
            <div className="relative z-10 space-y-10">
              <h2 className="text-3xl md:text-5xl font-black leading-tight tracking-tighter">
                Ready to <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">ditch paper?</span>
              </h2>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto font-medium leading-relaxed">
                Join over 150,000+ Nigerians who have upgraded their social lives. No more queues, no more printed tickets.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-6 pt-10">
                <Button size="lg" className="rounded-full h-16 px-10 text-lg shadow-2xl shadow-primary/40 hover:-translate-y-2 transition-all gap-4">
                  <Apple className="w-7 h-7 fill-current" />
                  <div className="flex flex-col items-start leading-none text-left">
                    <span className="text-[10px] font-black uppercase tracking-tighter opacity-70">App Store</span>
                    <span className="text-lg font-bold">Download Now</span>
                  </div>
                </Button>
                <Button variant="outline" size="lg" className="rounded-full h-16 px-10 text-lg border-2 border-border bg-card hover:bg-secondary hover:-translate-y-2 transition-all shadow-2xl gap-4">
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
    primary: "text-primary bg-primary/10",
    accent: "text-accent bg-accent/10",
    white: "text-foreground bg-secondary"
  };

  return (
    <div className="group p-12 rounded-[4rem] bg-card border border-border hover:border-primary/50 transition-all duration-500 hover:-translate-y-3 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)]">
      <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-10 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-xl ${colorMap[color] || colorMap.primary}`}>
        <Icon className="w-10 h-10" />
      </div>
      <div className="space-y-6">
        <h3 className="text-3xl font-black tracking-tight leading-tight">{title}</h3>
        <p className="text-muted-foreground leading-relaxed text-lg font-medium">{desc}</p>
      </div>
    </div>
  );
}

function FeatureListItem({ title, desc }: any) {
  return (
    <div className="flex items-start gap-6 group">
       <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary transition-colors">
          <ChevronRight className="w-6 h-6 text-primary group-hover:text-white transition-transform group-hover:translate-x-1" />
       </div>
       <div className="space-y-2">
          <h4 className="text-xl font-black tracking-tight">{title}</h4>
          <p className="text-muted-foreground leading-relaxed font-medium">{desc}</p>
       </div>
    </div>
  );
}
