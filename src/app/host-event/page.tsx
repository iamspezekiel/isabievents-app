
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
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
import Image from 'next/image';

export default function OrganizerLandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative pt-32 pb-12 md:pt-48 md:pb-20 overflow-hidden min-h-[90vh] md:min-h-[85vh] flex items-center">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/10 blur-[120px] -z-10 rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="space-y-8 animate-in fade-in slide-in-from-left-8 duration-1000 flex flex-col items-center lg:items-start text-center lg:text-left">
            <div className="space-y-4">
              <Badge className="bg-primary/10 text-primary border-none py-1 px-4 font-black tracking-widest uppercase mb-2">For Organizers</Badge>
              <h1 className="leading-[1.1] tracking-tighter text-balance text-4xl md:text-6xl lg:text-7xl">
                The Easiest Way to Host <br />
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent italic">Legendary</span> Events
              </h1>
            </div>
            
            <p className="text-muted-foreground text-sm md:text-base px-4 sm:px-0 max-w-lg mx-auto lg:mx-0 leading-relaxed">
              From secret beach parties to national tech conferences. IsabiEvents provides the tools you need to sell out fast and manage with ease.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 w-full px-8 sm:px-0">
              <Link href="/signup?role=organizer" className="flex-1 lg:flex-none">
                <Button size="lg" className="rounded-full gap-2 shadow-xl shadow-primary/20 w-full h-11 px-8">
                  Host Now <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/pricing" className="flex-1 lg:flex-none">
                <Button size="lg" variant="outline" className="rounded-full w-full h-11 px-8">
                  View Pricing
                </Button>
              </Link>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 pt-2">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-background overflow-hidden relative bg-secondary">
                    <Image src={`https://picsum.photos/seed/org${i}/40/40`} alt="" fill className="object-cover" />
                  </div>
                ))}
              </div>
              <p className="text-muted-foreground text-sm font-medium">
                Joined by <span className="text-primary font-bold">1,200+</span> Nigerian organizers
              </p>
            </div>
          </div>
          
          <div className="relative animate-in fade-in zoom-in-95 duration-1000 w-full aspect-square max-w-md mx-auto lg:max-w-none lg:h-full lg:min-h-[550px] lg:aspect-auto">
            <div className="relative h-full w-full rounded-[2.5rem] overflow-hidden border border-border shadow-2xl">
              <Image 
                src="https://picsum.photos/seed/organizer-hero/800/1000" 
                alt="Organizer success" 
                fill 
                className="object-cover"
                data-ai-hint="organizer success"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl flex items-center justify-between">
                  <div className="space-y-1 text-left">
                    <div className="text-[10px] text-white/70 uppercase font-black tracking-widest">Gross Revenue</div>
                    <div className="text-2xl md:text-3xl font-black text-white tracking-tight">₦4,250,000</div>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                    <Zap className="text-accent w-6 h-6 fill-accent" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32 bg-card/30 border-y border-border">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="tracking-tighter">Everything you need to succeed</h2>
            <p className="text-muted-foreground text-base">We've built a suite of features specifically for the Nigerian market.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
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
              description="Instant settlements via Bachs — cards (NGN & USD) and bank transfer."
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
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="bg-primary/5 border border-primary/10 rounded-[3rem] md:rounded-[4rem] p-8 md:p-20 text-center space-y-12 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-64 h-64 bg-primary/10 blur-[100px] -translate-x-1/2 -translate-y-1/2 rounded-full" />
            
            <div className="max-w-3xl mx-auto space-y-8 relative z-10">
              <h2 className="tracking-tighter leading-tight">Simple, transparent pricing</h2>
              <p className="text-muted-foreground text-base">
                No setup fees. No monthly subscriptions. We only win when you do.
              </p>
              
              <div className="flex justify-center">
                <div className="flex flex-col sm:inline-flex sm:flex-row items-center gap-6 md:gap-8 bg-background p-8 md:px-12 md:py-10 rounded-[2rem] md:rounded-[2.5rem] border border-primary/20 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] relative group hover:scale-[1.02] transition-all duration-500">
                  <div className="relative">
                    <span className="text-6xl md:text-8xl font-black text-primary tracking-tighter leading-none">2.5%</span>
                  </div>
                  <div className="text-center sm:text-left space-y-1">
                    <div className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-muted-foreground/60 mb-2">Service Fee</div>
                    <div className="text-xl md:text-3xl font-black leading-tight">Per ticket sold</div>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Link href="/pricing">
                  <Button size="lg" className="rounded-full px-12 shadow-2xl shadow-primary/30 font-bold h-11">
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
    <Card className="bg-card border-border hover:border-primary/50 transition-all p-8 rounded-[2rem] text-left">
      <CardContent className="p-0 space-y-6">
        <div className="w-14 h-14 bg-secondary rounded-2xl flex items-center justify-center">
          <Icon className="w-7 h-7 text-primary" />
        </div>
        <div className="space-y-2">
          <h3 className="font-bold tracking-tight text-lg">{title}</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
