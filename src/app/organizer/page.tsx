"use client";

import React from 'react';
import { 
  Rocket, 
  ShieldCheck, 
  BarChart3, 
  Zap, 
  Users, 
  ArrowRight, 
  Globe,
  MessageSquare,
  CheckCircle2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from 'next/link';
import Image from 'next/image';

export default function OrganizerLandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative pt-40 pb-8 overflow-hidden min-h-[85vh] flex items-center">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/10 blur-[120px] -z-10 rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 animate-in fade-in slide-in-from-left-8 duration-1000 flex flex-col items-center lg:items-start text-center lg:text-left">
            <h1 className="text-4xl md:text-7xl lg:text-8xl xl:text-9xl leading-[0.9] font-black tracking-tighter text-balance">
              <span className="block">The Easiest</span>
              <span className="block">Way to Host</span>
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent italic">Legendary</span> Events
            </h1>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-lg">
              From secret beach parties to national tech conferences. IsabiEvents provides the tools you need to sell out fast and manage with ease.
            </p>
            <div className="flex flex-row justify-center lg:justify-start gap-4 w-full">
              <Link href="/signup?role=organizer" className="flex-1 lg:flex-none">
                <Button size="lg" className="h-12 md:h-16 px-6 md:px-10 rounded-full text-sm md:text-lg gap-2 shadow-xl shadow-primary/20 w-full">
                  Host Now <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                </Button>
              </Link>
              <Link href="/pricing" className="flex-1 lg:flex-none">
                <Button size="lg" variant="outline" className="h-12 md:h-16 px-6 md:px-10 rounded-full text-sm md:text-lg w-full">
                  View Pricing
                </Button>
              </Link>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 pt-2">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-background overflow-hidden relative bg-secondary">
                    <Image src={`https://picsum.photos/seed/org${i}/40/40`} alt="" fill />
                  </div>
                ))}
              </div>
              <p className="text-base text-muted-foreground text-center sm:text-left">
                Joined by <span className="text-primary font-bold">1,200+</span> Nigerian organizers
              </p>
            </div>
          </div>
          
          <div className="relative animate-in fade-in zoom-in-95 duration-1000 block w-full h-full min-h-[350px] lg:min-h-[550px]">
            <div className="relative h-full w-full rounded-3xl overflow-hidden border border-border shadow-2xl">
              <Image 
                src="https://picsum.photos/seed/organizer-hero/800/1000" 
                alt="Organizer success" 
                fill 
                className="object-cover"
                data-ai-hint="organizer success"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 sm:bottom-8 sm:left-8 sm:right-8">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 sm:p-6 rounded-2xl flex items-center justify-between">
                  <div className="space-y-1 text-left">
                    <div className="text-[10px] sm:text-xs text-white/70 uppercase font-black">Gross Revenue</div>
                    <div className="text-xl sm:text-3xl font-black text-white tracking-tight">₦4,250,000</div>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-accent/20 flex items-center justify-center">
                    <Zap className="text-accent w-5 h-5 sm:w-6 sm:h-6 fill-accent" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-8 bg-card/30 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter">Everything you need to succeed</h2>
            <p className="text-base text-muted-foreground">We've built a suite of features specifically for the Nigerian market.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={Rocket} 
              title="Fast Setup" 
              description="Create your event page in under 5 minutes. No technical skills required."
            />
            <FeatureCard 
              icon={BarChart3} 
              title="Real-time Analytics" 
              description="Track sales, attendee demographics, and conversion rates from one dashboard."
            />
            <FeatureCard 
              icon={ShieldCheck} 
              title="Secure Payments" 
              description="Instant settlements via Paystack & Flutterwave. We handle the security."
            />
            <FeatureCard 
              icon={Users} 
              title="Staff Management" 
              description="Add gate staff with their own specialized scanning apps for fast entry."
            />
            <FeatureCard 
              icon={Globe} 
              title="Global Reach" 
              description="Accept payments in NGN, USD, and more from attendees worldwide."
            />
            <FeatureCard 
              icon={MessageSquare} 
              title="AI Assistant" 
              description="Draft high-converting descriptions and FAQs using our built-in AI tools."
            />
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="bg-primary/5 border border-primary/10 rounded-[4rem] p-10 md:p-20 text-center space-y-12 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-64 h-64 bg-primary/10 blur-[100px] -translate-x-1/2 -translate-y-1/2 rounded-full" />
            
            <div className="max-w-3xl mx-auto space-y-8 relative z-10">
              <h2 className="text-3xl md:text-5xl font-black tracking-tighter leading-tight">Simple, transparent pricing</h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                No setup fees. No monthly subscriptions. We only win when you do.
              </p>
              
              <div className="flex justify-center">
                <div className="flex flex-col sm:inline-flex sm:flex-row items-center gap-4 md:gap-8 bg-background p-10 md:px-12 md:py-10 rounded-[2.5rem] border border-primary/20 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] relative group hover:scale-[1.02] transition-all duration-500">
                  <div className="relative">
                    <span className="text-7xl md:text-8xl font-black text-primary tracking-tighter leading-none">2.5%</span>
                  </div>
                  <div className="text-center sm:text-left space-y-1">
                    <div className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-muted-foreground/60 mb-2">Service Fee</div>
                    <div className="text-2xl md:text-3xl font-black leading-tight">Per ticket sold</div>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Link href="/pricing">
                  <Button size="lg" className="rounded-full px-12 h-16 text-lg shadow-2xl shadow-primary/30 font-bold">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }: any) {
  return (
    <Card className="bg-card border-border hover:border-primary/50 transition-all p-8">
      <CardContent className="p-0 space-y-6">
        <div className="w-14 h-14 bg-secondary rounded-2xl flex items-center justify-center">
          <Icon className="w-7 h-7 text-primary" />
        </div>
        <div className="space-y-2 text-left">
          <h3 className="text-xl font-bold tracking-tight">{title}</h3>
          <p className="text-base text-muted-foreground leading-relaxed">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
