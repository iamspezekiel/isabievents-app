"use client";

import React from 'react';
import { CheckCircle2, Zap, ShieldCheck, BarChart3, Users, Globe, ArrowRight, HelpCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="pt-32 pb-12 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 blur-[120px] -z-10 rounded-full" />
        <div className="container mx-auto px-4 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <h1 className="font-headline text-4xl md:text-6xl font-black leading-[1.1] tracking-tighter text-balance">
            Transparent Pricing <br /> 
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Built for Scale
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            We only win when you do. No setup fees, no monthly subscriptions, and no hidden costs for Nigerian organizers.
          </p>
        </div>
      </header>

      {/* Main Pricing Card */}
      <section className="pb-12">
        <div className="container mx-auto px-4">
          <Card className="max-w-6xl mx-auto bg-card border-border shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] rounded-[3rem] overflow-hidden hover:border-primary/20 transition-all duration-500">
            <div className="grid lg:grid-cols-2">
              <div className="p-10 md:p-20 space-y-12 text-left">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Zap className="w-4 h-4 text-primary fill-primary" />
                    </div>
                    <h2 className="font-headline text-2xl font-bold">Standard Marketplace</h2>
                  </div>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    Perfect for concerts, festivals, and conferences of all sizes in Nigeria.
                  </p>
                </div>
                
                <div className="flex items-center gap-6 py-6 border-y border-border">
                   <div className="text-6xl md:text-8xl font-black text-primary tracking-tighter">2.5%</div>
                   <div className="text-left">
                     <div className="text-sm font-black uppercase tracking-widest text-muted-foreground">Service Fee</div>
                     <div className="text-xs text-muted-foreground font-medium">per ticket sold</div>
                   </div>
                </div>

                <div className="grid gap-5">
                  <FeatureItem label="Unlimited Ticket Tiers" />
                  <FeatureItem label="AI Event Description Generator" />
                  <FeatureItem label="Real-time Sales Analytics" />
                  <FeatureItem label="Mobile Gate Staff App" />
                  <FeatureItem label="Instant Automated Payouts" />
                </div>

                <div className="pt-6">
                  <Link href="/signup?role=organizer">
                    <Button size="lg" className="w-full h-16 rounded-full text-lg shadow-xl shadow-primary/20 hover:-translate-y-0.5 transition-all">
                      Create Your First Event
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="bg-secondary/30 p-10 md:p-20 flex flex-col justify-center space-y-10 border-l border-border/50 text-left">
                <div className="space-y-4">
                  <Badge variant="outline" className="border-accent text-accent">ENTERPRISE</Badge>
                  <h3 className="font-headline text-3xl font-black">High Volume?</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    Planning a stadium-level event or a national tour? Get custom rates and dedicated local support.
                  </p>
                </div>
                
                <div className="space-y-6">
                  <div className="flex gap-4 items-start p-4 rounded-2xl bg-background/50 border border-border">
                    <ShieldCheck className="w-6 h-6 text-accent shrink-0 mt-1" />
                    <div className="space-y-1">
                      <h4 className="font-bold">On-site Support</h4>
                      <p className="text-sm text-muted-foreground">Dedicated account managers for large-scale gate management.</p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start p-4 rounded-2xl bg-background/50 border border-border">
                    <Globe className="w-6 h-6 text-accent shrink-0 mt-1" />
                    <div className="space-y-1">
                      <h4 className="font-bold">Whitelabel Checkout</h4>
                      <p className="text-sm text-muted-foreground">Integrate our ticketing engine directly into your own domain.</p>
                    </div>
                  </div>
                </div>

                <Button variant="outline" size="lg" className="rounded-full h-16 text-lg border-2 hover:bg-secondary hover:-translate-y-0.5 transition-all">
                  Contact Our Sales Team
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 bg-card/30 border-y border-border">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center space-y-4 mb-12">
            <h2 className="font-headline text-3xl md:text-4xl font-black">Frequently Asked Questions</h2>
            <p className="text-muted-foreground">Everything you need to know about our fees and payouts.</p>
          </div>
          
          <div className="grid gap-8">
            <PricingFaq 
              q="Is there a fee for free events?" 
              a="No. Free events are completely free on IsabiEvents. We believe in supporting community and religious gatherings across Nigeria, so we don't charge anything for free tickets." 
            />
            <PricingFaq 
              q="When do I get my money?" 
              a="Standard payouts occur 48 hours after your event concludes to ensure attendee protection. High-volume, verified organizers may qualify for early weekly settlements." 
            />
            <PricingFaq 
              q="Who pays the 2.5% fee?" 
              a="As an organizer, you have the flexibility to either absorb the fee into your ticket price or pass it on to the attendee as a transparent service charge during checkout." 
            />
            <PricingFaq 
              q="What payment methods are supported?" 
              a="We support all major Nigerian payment methods through Paystack and Flutterwave, including Card (Visa, Mastercard, Verve), Bank Transfer, USSD, and Mobile Money." 
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 container mx-auto px-4">
        <div className="bg-primary/10 border border-primary/20 rounded-[3rem] p-12 md:p-20 text-center space-y-10">
          <h2 className="font-headline text-3xl md:text-5xl font-black">Ready to sell out?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join 1,200+ Nigerian organizers who are already scaling their businesses with IsabiEvents.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/signup?role=organizer">
              <Button size="lg" className="rounded-full h-16 px-12 text-lg shadow-xl shadow-primary/20 hover:-translate-y-0.5 transition-all">
                Get Started Now
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="rounded-full h-16 px-12 text-lg hover:-translate-y-0.5 transition-all">Book a Demo</Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureItem({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4 group">
      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary transition-colors">
        <CheckCircle2 className="w-4 h-4 text-primary group-hover:text-white transition-colors" />
      </div>
      <span className="font-semibold text-lg">{label}</span>
    </div>
  );
}

function PricingFaq({ q, a }: any) {
  return (
    <div className="space-y-4 p-8 rounded-3xl bg-card border border-border hover:border-primary/30 transition-all group text-left">
      <div className="flex items-center gap-3">
        <HelpCircle className="w-5 h-5 text-primary" />
        <h4 className="text-xl font-bold group-hover:text-primary transition-colors">{q}</h4>
      </div>
      <p className="text-muted-foreground leading-relaxed pl-8">{a}</p>
    </div>
  );
}
