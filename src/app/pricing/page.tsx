
"use client";

import React from 'react';
import { CheckCircle2, Zap, ShieldCheck, BarChart3, Users, Globe, ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from 'next/link';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="pt-40 pb-24 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-primary/5 blur-3xl -z-10 rounded-full" />
        <div className="container mx-auto px-4 space-y-6">
          <h1 className="font-headline text-5xl md:text-7xl">Transparent Pricing</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            We only win when you do. No setup fees, no monthly subscriptions, and no hidden costs.
          </p>
        </div>
      </header>

      {/* Main Pricing Card */}
      <section className="pb-24">
        <div className="container mx-auto px-4">
          <Card className="max-w-5xl mx-auto bg-card border-border shadow-2xl rounded-[3rem] overflow-hidden">
            <div className="grid lg:grid-cols-2">
              <div className="p-12 md:p-20 space-y-10">
                <div className="space-y-4">
                  <h2 className="font-headline text-3xl">Standard Plan</h2>
                  <p className="text-muted-foreground">Perfect for concerts, festivals, and conferences of all sizes.</p>
                </div>
                
                <div className="flex items-center gap-4">
                   <div className="text-7xl font-black text-primary">2.5%</div>
                   <div className="text-left">
                     <div className="text-sm font-black uppercase tracking-widest text-muted-foreground">Service Fee</div>
                     <div className="text-xs text-muted-foreground">per ticket sold</div>
                   </div>
                </div>

                <div className="space-y-4">
                  <FeatureItem label="Unlimited Ticket Tiers" />
                  <FeatureItem label="AI Event Description Generator" />
                  <FeatureItem label="Real-time Sales Analytics" />
                  <FeatureItem label="Mobile Gate Staff App" />
                  <FeatureItem label="Automated Payouts" />
                </div>

                <Button size="lg" className="w-full h-16 rounded-full text-lg shadow-xl shadow-primary/20">
                  Start Creating Events
                </Button>
              </div>

              <div className="bg-secondary/30 p-12 md:p-20 flex flex-col justify-center space-y-8">
                <h3 className="font-headline text-2xl">Enterprise & High Volume</h3>
                <p className="text-muted-foreground">
                  Planning a stadium-level event or a national tour? Get custom rates and dedicated support.
                </p>
                <div className="space-y-4">
                  <div className="flex gap-4 items-start">
                    <ShieldCheck className="w-6 h-6 text-accent shrink-0" />
                    <p className="text-sm text-muted-foreground">Dedicated account manager for on-site support.</p>
                  </div>
                  <div className="flex gap-4 items-start">
                    <Zap className="w-6 h-6 text-accent shrink-0" />
                    <p className="text-sm text-muted-foreground">Whitelabel ticketing experience.</p>
                  </div>
                </div>
                <Button variant="outline" size="lg" className="rounded-full h-16 text-lg">Contact Sales</Button>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-card/30 border-y border-border">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="font-headline text-4xl text-center mb-16">Frequently Asked Questions</h2>
          <div className="grid gap-10">
            <PricingFaq 
              q="Is there a fee for free events?" 
              a="No. Free events are completely free on IsabiEvents. We only charge for paid tickets." 
            />
            <PricingFaq 
              q="When do I get my money?" 
              a="Standard payouts occur 48 hours after your event concludes. High-volume organizers may qualify for early weekly payouts." 
            />
            <PricingFaq 
              q="Who pays the 2.5% fee?" 
              a="Organizers can choose to absorb the fee or pass it on to the attendee during checkout." 
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureItem({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <CheckCircle2 className="w-5 h-5 text-primary" />
      <span className="font-medium">{label}</span>
    </div>
  );
}

function PricingFaq({ q, a }: any) {
  return (
    <div className="space-y-3">
      <h4 className="text-xl font-bold">{q}</h4>
      <p className="text-muted-foreground leading-relaxed">{a}</p>
    </div>
  );
}
