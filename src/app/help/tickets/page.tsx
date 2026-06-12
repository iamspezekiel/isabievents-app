"use client";

import React from 'react';
import { ArrowLeft, Ticket, QrCode, Mail, MessageSquare, Search, Smartphone, ShieldCheck } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from 'next/link';

export default function TicketSupportPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card pt-40 pb-10">
        <div className="container mx-auto px-4 max-w-4xl text-left">
          <Link href="/help" className="flex items-center gap-2 text-muted-foreground hover:text-white mb-6 transition-colors no-underline">
            <ArrowLeft className="w-4 h-4" /> Back to Help Center
          </Link>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <h1 className="font-headline text-2xl md:text-3xl text-balance">Ticket Support</h1>
              <p className="text-muted-foreground">Everything you need to know about your digital tickets.</p>
            </div>
            <Ticket className="w-16 h-16 text-primary/20 hidden md:block" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="grid gap-12">
          <section className="space-y-6">
            <h2 className="font-headline text-xl text-left">Common Ticket Issues</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <SupportTopic 
                icon={Mail} 
                title="Didn't receive email" 
                desc="Check your spam folder or resend from your dashboard."
              />
              <SupportTopic 
                icon={QrCode} 
                title="QR Code won't scan" 
                desc="Ensure brightness is up or try the manual ID lookup."
              />
              <SupportTopic 
                icon={Smartphone} 
                title="Mobile access" 
                desc="Add your ticket to Apple Wallet or Google Pay."
              />
              <SupportTopic 
                icon={ShieldCheck} 
                title="Invalid Ticket error" 
                desc="Contact the organizer or our security team immediately."
              />
            </div>
          </section>

          <section className="bg-card border border-border rounded-3xl p-8 space-y-6 text-left">
            <h2 className="font-headline text-xl">Need to resend your ticket?</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you can't find your ticket, enter the email address used during purchase and we'll send it back to you instantly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Input placeholder="yourname@example.com" className="h-12 bg-secondary border-none" />
              <Button className="h-12 rounded-xl px-8">Resend Ticket</Button>
            </div>
          </section>

          <section className="space-y-6 text-left">
            <h2 className="font-headline text-xl">Helpful Guides</h2>
            <div className="space-y-4">
              <GuideItem title="How to transfer a ticket to a friend" time="2 min read" />
              <GuideItem title="What to do if an event is cancelled" time="3 min read" />
              <GuideItem title="Understanding 'Waitlist' status" time="1 min read" />
            </div>
          </section>

          <section className="text-center pt-12">
            <p className="text-muted-foreground mb-6">Can't find what you're looking for?</p>
            <Button variant="outline" className="rounded-full gap-2 px-8">
              <MessageSquare className="w-4 h-4" /> Chat with an Agent
            </Button>
          </section>
        </div>
      </main>
    </div>
  );
}

function SupportTopic({ icon: Icon, title, desc }: any) {
  return (
    <div className="p-6 bg-card border border-border rounded-2xl space-y-3 text-left">
      <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <h3 className="font-bold">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}

function GuideItem({ title, time }: any) {
  return (
    <Link href="#" className="flex items-center justify-between p-5 bg-card/50 border border-border rounded-xl hover:border-primary/50 transition-all group no-underline">
      <span className="font-medium group-hover:text-primary transition-colors text-foreground">{title}</span>
      <span className="text-xs text-muted-foreground">{time}</span>
    </Link>
  );
}
