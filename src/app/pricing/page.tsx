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
      <header className="relative pt-48 pb-12 overflow-hidden text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 blur-[120px] -z-10 rounded-full" />
        <div className="container mx-auto px-4 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <h1 className="font-headline text-4xl md:text-6xl font-black leading-[1.1] tracking-tighter text-balance">
            Transparent Pricing <br /> 
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Built for Scale
            </span>
          </h1>
          <p className="max-w-3xl mx-auto leading-relaxed text-muted-foreground">
            We only win when you do. No setup fees, no monthly subscriptions, and no hidden<br /> costs for Nigerian organizers.
          </p>
        </div>
      </header>

      {/* Main Pricing Card */}
      <section className="pb-12">
        <div className="container mx-auto px-4">
          <Card className="max-w-6xl mx-auto bg-card border-border shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] rounded-[3rem] overflow-hidden hover:border-primary/20 transition-all duration-500">
            <div className="grid lg:grid-cols-2">
              <div className="p-10 text-left md:p-20 space-y-12">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                      <Zap className="w-4 h-4 text-primary fill-primary" />
                    </div>
                    <h2 className="text-2xl font-bold font-headline">Simple Flat Rate</h2>
                  </div>
                  <p className="leading-relaxed text-muted-foreground">
                    Perfect for concerts, festivals, and conferences of all sizes in Nigeria.
                  </p>
                </div>
                
                <div className="flex items-center py-6 gap-6 border-y border-border">
                   <div className="text-6xl font-black md:text-8xl text-primary tracking-tighter">2.5%</div>
                   <div className="text-left">
                     <div className="text-sm font-black uppercase tracking-widest text-muted-foreground">Service Fee</div>
                     <div className="text-xs font-medium text-muted-foreground">per ticket sold</div>
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
                    <Button className="w-full transition-all rounded-full shadow-xl shadow-primary/20 hover:-translate-y-0.5">
                      Create Your First Event
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="bg-secondary/30 p-10 md:p-20 flex flex-col justify-center space-y-10 border-l border-border/50 text-left">
                <div className="space-y-4">
                  <Badge variant="outline" className="text-accent border-accent">ENTERPRISE</Badge>
                  <h3 className="text-3xl font-black font-headline">High Volume?</h3>
                  <p className="leading-relaxed text-muted-foreground">
                    Planning a stadium-level event or a national tour? Get custom rates and dedicated local support.
                  </p>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4 p-4 border rounded-2xl bg-background/50 border-border">
                    <ShieldCheck className="flex-shrink-0 w-6 h-6 mt-1 text-accent" />
                    <div className="space-y-1">
                      <h4 className="font-bold">On-site Support</h4>
                      <p className="text-muted-foreground">Dedicated account managers for large-scale gate management.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 border rounded-2xl bg-background/50 border-border">
                    <Globe className="flex-shrink-0 w-6 h-6 mt-1 text-accent" />
                    <div className="space-y-1">
                      <h4 className="font-bold">Whitelabel Checkout</h4>
                      <p className="text-muted-foreground">Integrate our ticketing engine directly into your own domain.</p>
                    </div>
                  </div>
                </div>

                <Link href="/help" className="no-underline">
                  <Button variant="outline" className="w-full transition-all border-2 rounded-full hover:bg-secondary hover:-translate-y-0.5">
                    Contact Our Sales Team
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-8 bg-card/30 border-y border-border">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-12 text-center space-y-4">
            <h2 className="text-3xl font-black md:text-4xl font-headline">Frequently Asked Questions</h2>
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
              a="We support all major Nigerian payment methods through Paystack, Flutterwave, and SolanaPay, including Card (Visa, Mastercard, Verve), Bank Transfer, USSD, and Solana (USDC/USDT)." 
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-12">
        <div className="bg-primary/10 border border-primary/20 rounded-[3rem] p-12 md:p-20 text-center space-y-10">
          <h2 className="text-3xl font-black md:text-5xl font-headline">Ready to sell out?</h2>
          <p className="max-w-2xl mx-auto text-muted-foreground">
            Join 1,200+ Nigerian organizers who are already scaling their businesses with IsabiEvents.
          </p>
          <div className="flex flex-row items-center justify-center gap-4">
            <Link href="/signup?role=organizer" className="flex-1 no-underline sm:flex-none">
              <Button className="w-full transition-all rounded-full px-12 shadow-xl shadow-primary/20 hover:-translate-y-0.5">
                Get Started Now
              </Button>
            </Link>
            <Link href="/help" className="flex-1 no-underline sm:flex-none">
              <Button variant="outline" className="w-full transition-all border-2 rounded-full px-12 hover:bg-secondary hover:-translate-y-0.5">
                Book a Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureItem({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4 group">
      <div className="flex items-center justify-center flex-shrink-0 w-6 h-6 transition-colors rounded-full bg-primary/10 group-hover:bg-primary">
        <CheckCircle2 className="w-4 h-4 text-primary group-hover:text-white" />
      </div>
      <span className="text-lg font-semibold">{label}</span>
    </div>
  );
}

function PricingFaq({ q, a }: any) {
  return (
    <div className="p-8 transition-all border text-left rounded-3xl bg-card border-border hover:border-primary/30 group">
      <div className="flex items-center gap-3">
        <HelpCircle className="w-5 h-5 text-primary" />
        <h4 className="text-xl font-bold transition-colors group-hover:text-primary">{q}</h4>
      </div>
      <p className="pl-8 leading-relaxed text-muted-foreground">{a}</p>
    </div>
  );
}