"use client";

import React from 'react';
import { ShieldCheck, QrCode, BadgeCheck, Banknote, Lock, Headphones } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from 'next/link';

/**
 * Trust & Safety — factual information about how IsabiEvents protects
 * attendees and organizers. Replaced the old testimonials page, which used
 * placeholder quotes and statistics.
 */
const PILLARS = [
  {
    icon: QrCode,
    title: 'Verified QR Tickets',
    body: 'Every ticket carries a unique QR code that staff scan at the gate. Duplicates and forgeries are rejected on the spot.',
  },
  {
    icon: BadgeCheck,
    title: 'Verified Organizers',
    body: 'Organizers who complete KYC identity checks display a verified badge on their profile and every event they host.',
  },
  {
    icon: Banknote,
    title: 'Reviewed Payouts',
    body: 'Organizer withdrawals are checked against real ticket-sale balances and manually reviewed by our team before every transfer.',
  },
  {
    icon: Lock,
    title: 'Secure Payments',
    body: 'Card, bank transfer and crypto payments run through the Bachs gateway. We never store your card details on IsabiEvents.',
  },
  {
    icon: ShieldCheck,
    title: 'Live Moderation',
    body: 'Our admin team can approve or reject any listing. Rejected events disappear from the marketplace until they are approved again.',
  },
  {
    icon: Headphones,
    title: 'Human Support',
    body: 'Real people handle disputes, refunds within policy, and payout questions — reach us through the contact page any time.',
  },
];

export default function TrustPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <header className="relative pt-40 pb-8 overflow-hidden border-b border-border bg-card/30">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2 -z-10" />
        <div className="container mx-auto px-4 text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <Badge className="bg-accent/20 text-accent border-none py-1.5 px-6 mb-4 font-bold tracking-widest uppercase">TRUST &amp; SAFETY</Badge>
          <h1 className="tracking-tighter text-balance">
            Built so you can <br />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              buy with confidence
            </span>
          </h1>
          <p className="max-w-3xl mx-auto text-muted-foreground">
            Here is exactly how IsabiEvents protects attendees, organizers and their money — no guesses, just how the platform works.
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {/* Pillars */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-16">
          {PILLARS.map((pillar) => (
            <Card key={pillar.title} className="bg-card border-border text-left">
              <CardContent className="p-6 space-y-3">
                <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <pillar.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-bold">{pillar.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{pillar.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <section className="relative px-8 py-16 overflow-hidden text-center border bg-card border-border rounded-[4rem] space-y-10 group">
          <div className="absolute top-0 left-0 transition-transform duration-1000 rounded-full w-96 h-96 bg-primary/10 blur-[120px] -translate-x-1/2 -translate-y-1/2 group-hover:scale-110" />
          <div className="absolute bottom-0 right-0 transition-transform duration-1000 rounded-full w-96 h-96 bg-accent/10 blur-[120px] translate-x-1/2 translate-y-1/2 group-hover:scale-110" />

          <div className="relative z-10 max-w-4xl mx-auto space-y-8">
            <h2 className="leading-none tracking-tighter">
              Ready when you are. <br />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent italic">Discover events.</span>
            </h2>
            <p className="max-w-2xl mx-auto font-medium text-muted-foreground">
              Explore live events across Nigeria — every listing is backed by the protections above.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/discover" className="no-underline">
                <Button size="lg" className="rounded-full px-10 font-bold shadow-lg shadow-primary/20">
                  Browse Events
                </Button>
              </Link>
              <Link href="/organizer/signup" className="no-underline">
                <Button size="lg" variant="outline" className="rounded-full px-10 font-bold">
                  Host an Event
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
