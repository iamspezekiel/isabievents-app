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
  MessageSquare
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from 'next/link';
import Image from 'next/image';

export default function OrganizerLandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative pt-40 pb-32 overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/10 blur-[120px] -z-10 rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-in fade-in slide-in-from-left-8 duration-1000">
            <h1 className="font-headline text-5xl md:text-7xl leading-[1.1] font-black tracking-tighter text-balance">
              The Easiest Way to Host <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Legendary</span> Events
            </h1>
            <p className="text-muted-foreground text-xl leading-relaxed max-w-xl">
              From secret beach parties to national tech conferences. IsabiEvents provides the tools you need to sell out fast and manage with ease.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/signup?role=organizer">
                <Button size="lg" className="h-16 px-10 rounded-full text-lg gap-2 shadow-xl shadow-primary/20">
                  Start Hosting Now <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="h-16 px-10 rounded-full text-lg">
                  View Pricing
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-6 pt-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-background overflow-hidden relative bg-secondary">
                    <Image src={`https://picsum.photos/seed/org${i}/40/40`} alt="" fill />
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                Joined by <span className="text-white font-bold">1,200+</span> Nigerian organizers
              </p>
            </div>
          </div>
          <div className="relative animate-in fade-in zoom-in-95 duration-1000">
            <div className="relative aspect-square rounded-3xl overflow-hidden border border-border shadow-2xl">
              <Image 
                src="https://picsum.photos/seed/organizer-hero/800/800" 
                alt="Organizer dashboard" 
                fill 
                className="object-cover"
                data-ai-hint="organizer success"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-8 left-8 right-8">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="text-xs text-white/70 uppercase font-black">Gross Revenue</div>
                    <div className="text-3xl font-bold text-white">₦4,250,000</div>
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

      {/* Features */}
      <section className="py-24 bg-card/30 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <h2 className="font-headline text-4xl">Everything you need to succeed</h2>
            <p className="text-muted-foreground text-lg">We've built a suite of features specifically for the Nigerian market.</p>
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
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="bg-primary/10 border border-primary/20 rounded-3xl p-12 md:p-20 text-center space-y-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-32 h-32 bg-primary/20 blur-3xl -translate-x-1/2 -translate-y-1/2 rounded-full" />
            <div className="max-w-2xl mx-auto space-y-6">
              <h2 className="font-headline text-4xl">Simple, transparent pricing</h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                No setup fees. No monthly subscriptions. <br />
                We only win when you do.
              </p>
              <div className="inline-flex items-center gap-4 bg-background px-8 py-6 rounded-2xl border border-border shadow-2xl">
                <span className="text-5xl font-black text-primary">2.5%</span>
                <div className="text-left text-sm leading-tight text-muted-foreground uppercase font-black">
                  Service Fee <br /> per ticket
                </div>
              </div>
              <div className="pt-8">
                <Link href="/pricing">
                  <Button size="lg" className="rounded-full px-12 h-14 text-lg">Learn More About Fees</Button>
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
        <div className="space-y-2">
          <h3 className="font-headline text-xl">{title}</h3>
          <p className="text-muted-foreground leading-relaxed">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}