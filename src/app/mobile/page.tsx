
"use client";

import React from 'react';
import { Smartphone, Download, QrCode, Bell, Zap, ShieldCheck, ArrowRight, Star } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import Image from 'next/image';

export default function MobileAppPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-24 pb-32">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 blur-[100px] rounded-full -z-10 translate-x-1/2 -translate-y-1/2" />
        <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary rounded-full text-xs font-bold uppercase tracking-widest text-primary">
              <Zap className="w-4 h-4 fill-primary" /> Now available on iOS & Android
            </div>
            <h1 className="font-headline text-5xl md:text-7xl leading-tight">
              IsabiEvents <br /> in your <span className="text-primary">Pocket</span>
            </h1>
            <p className="text-muted-foreground text-xl max-w-xl mx-auto lg:mx-0">
              The fastest way to discover events, buy tickets, and enter venues. No internet? No problem. Your tickets work offline.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Button size="lg" className="h-16 px-10 rounded-full text-lg gap-3">
                <Download className="w-6 h-6" /> Get it on App Store
              </Button>
              <Button size="lg" variant="outline" className="h-16 px-10 rounded-full text-lg gap-3">
                <Download className="w-6 h-6" /> Get it on Play Store
              </Button>
            </div>
            <div className="flex items-center justify-center lg:justify-start gap-6">
               <div className="flex items-center gap-1">
                 {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />)}
               </div>
               <span className="text-sm font-medium">4.9/5 from 12k+ reviews</span>
            </div>
          </div>
          <div className="relative">
            <div className="relative z-10 mx-auto w-64 md:w-80 aspect-[1/2] bg-card border-8 border-border rounded-[3rem] shadow-2xl overflow-hidden">
               <Image 
                  src="https://picsum.photos/seed/mobile-ui/400/800" 
                  alt="App interface" 
                  fill 
                  className="object-cover"
                  data-ai-hint="mobile app interface"
               />
            </div>
            {/* Floating elements */}
            <div className="absolute top-1/4 -right-10 md:-right-20 bg-accent p-4 rounded-2xl shadow-2xl animate-bounce">
              <QrCode className="w-8 h-8 text-white" />
            </div>
            <div className="absolute bottom-1/4 -left-10 md:-left-20 bg-primary p-4 rounded-2xl shadow-2xl delay-700 animate-pulse">
              <Bell className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-card/30 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-12">
            <AppFeature 
              icon={QrCode} 
              title="Offline Tickets" 
              desc="Access your QR codes even without data or network at the gate."
            />
            <AppFeature 
              icon={Bell} 
              title="Smart Alerts" 
              desc="Get notified about lineup changes, gate times, and secret surprises."
            />
            <AppFeature 
              icon={ShieldCheck} 
              title="Secure Transfers" 
              desc="Safely transfer tickets to friends in seconds using just their phone number."
            />
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto space-y-8 p-12 md:p-20 bg-primary/10 border border-primary/20 rounded-[3rem]">
            <h2 className="font-headline text-4xl md:text-5xl">Stop printed tickets. <br /> Start experiences.</h2>
            <p className="text-xl text-muted-foreground">Join over 100k+ Nigerians using IsabiEvents Mobile every week.</p>
            <div className="pt-6">
              <Button size="lg" className="rounded-full h-16 px-12 text-lg">Download Now</Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function AppFeature({ icon: Icon, title, desc }: any) {
  return (
    <div className="space-y-4 text-center">
      <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-6">
        <Icon className="w-8 h-8 text-primary" />
      </div>
      <h3 className="font-headline text-xl">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}
