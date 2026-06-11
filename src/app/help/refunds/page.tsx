"use client";

import React from 'react';
import { ArrowLeft, RefreshCcw, ShieldAlert, CheckCircle2, FileText, HelpCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Link from 'next/link';

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card pt-32 pb-10">
        <div className="container mx-auto px-4 max-w-4xl">
          <Link href="/help" className="flex items-center gap-2 text-muted-foreground hover:text-white mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Help Center
          </Link>
          <h1 className="font-headline text-3xl md:text-4xl">Refund Policy</h1>
          <p className="text-muted-foreground mt-2">Last updated: October 20, 2024</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="grid gap-12">
          <section className="prose prose-invert max-w-none space-y-8">
            <div className="space-y-4">
              <h2 className="font-headline text-2xl flex items-center gap-2">
                <ShieldAlert className="w-6 h-6 text-accent" /> 1. Overview
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                IsabiEvents is a platform that facilitates ticket sales between event organizers and attendees. Refund policies are primarily determined and managed by the individual event organizers. By purchasing a ticket on IsabiEvents, you agree to the refund policy specific to that event.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="font-headline text-2xl flex items-center gap-2">
                <FileText className="w-6 h-6 text-accent" /> 2. Standard Refund Conditions
              </h2>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-primary shrink-0" /> Refund requests must be submitted at least 7 days before the event start date.</li>
                <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-primary shrink-0" /> Service fees (2.5%) are non-refundable unless the event is cancelled by the organizer.</li>
                <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-primary shrink-0" /> Refunds are typically processed within 5-10 business days to the original payment method.</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="font-headline text-2xl flex items-center gap-2">
                <RefreshCcw className="w-6 h-6 text-accent" /> 3. Cancelled or Postponed Events
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                If an event is cancelled by the organizer, IsabiEvents will work with the organizer to ensure all attendees receive a full refund, including service fees. If an event is postponed, your ticket will remain valid for the new date, and refund options will be provided if you cannot attend the new date.
              </p>
            </div>
          </section>

          <div className="bg-primary/5 border border-primary/20 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <h3 className="font-headline text-xl">Ready to request a refund?</h3>
              <p className="text-sm text-muted-foreground">Log in to your dashboard to manage your orders.</p>
            </div>
            <Link href="/dashboard/attendee">
              <Button size="lg" className="rounded-full px-8">Go to Orders</Button>
            </Link>
          </div>

          <div className="text-center pt-10 border-t border-border">
            <p className="text-muted-foreground flex items-center justify-center gap-2">
              <HelpCircle className="w-4 h-4" /> Have questions about a specific event? Contact the organizer directly.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
