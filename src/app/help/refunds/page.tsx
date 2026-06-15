"use client";

import React from 'react';
import { ArrowLeft, RefreshCcw, ShieldAlert, CheckCircle2, FileText, HelpCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import Script from 'next/script';

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Script id="getbutton-refunds" strategy="lazyOnload">
        {`
          (function () {
            var options = {
              call: "+2349024244140", 
              whatsapp: "+2349024244140", 
              call_to_action: "Contact Us", 
              button_color: "#7E7CFF", 
              position: "right", 
              order: "call,whatsapp", 
              pre_filled_message: "Hello IsabiEvents, I want to", 
            };
            var proto = 'https:', host = "getbutton.io", url = proto + '//static.' + host;
            var s = document.createElement('script'); s.type = 'text/javascript'; s.async = true; s.src = url + '/widget-send-button/js/init.js';
            s.onload = function () { if (typeof WhWidgetSendButton !== 'undefined') WhWidgetSendButton.init(host, proto, options); };
            var x = document.getElementsByTagName('script')[0]; x.parentNode.insertBefore(s, x);
          })();
          void 0;
        `}
      </Script>

      <header className="border-b border-border bg-card pt-48 pb-10">
        <div className="container mx-auto px-4 max-w-4xl text-left">
          <Link href="/help" className="flex items-center gap-2 text-muted-foreground hover:text-white mb-6 transition-colors no-underline">
            <ArrowLeft className="w-4 h-4" /> Back to Help Center
          </Link>
          <h1 className="font-headline text-2xl md:text-3xl text-balance">Refund Policy</h1>
          <p className="text-muted-foreground mt-2">Last updated: October 20, 2024</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid gap-12">
          <section className="prose prose-invert max-w-none space-y-8">
            <div className="space-y-4">
              <h2 className="font-headline text-xl flex items-center gap-2 text-left">
                <ShieldAlert className="w-6 h-6 text-accent" /> 1. Overview
              </h2>
              <p className="text-muted-foreground leading-relaxed text-left">
                IsabiEvents is a platform that facilitates ticket sales between event organizers and attendees. Refund policies are primarily determined and managed by the individual event organizers. By purchasing a ticket on IsabiEvents, you agree to the refund policy specific to that event.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="font-headline text-xl flex items-center gap-2 text-left">
                <FileText className="w-6 h-6 text-accent" /> 2. Standard Refund Conditions
              </h2>
              <ul className="space-y-3 text-muted-foreground text-left">
                <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-primary shrink-0" /> Refund requests must be submitted at least 7 days before the event start date.</li>
                <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-primary shrink-0" /> Service fees (2.5%) are non-refundable unless the event is cancelled by the organizer.</li>
                <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-primary shrink-0" /> Refunds are typically processed within 5-10 business days to the original payment method.</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="font-headline text-xl flex items-center gap-2 text-left">
                <RefreshCcw className="w-6 h-6 text-accent" /> 3. Cancelled or Postponed Events
              </h2>
              <p className="text-muted-foreground leading-relaxed text-left">
                If an event is cancelled by the organizer, IsabiEvents will work with the organizer to ensure all attendees receive a full refund, including service fees. If an event is postponed, your ticket will remain valid for the new date, and refund options will be provided if you cannot attend the new date.
              </p>
            </div>
          </section>

          <div className="bg-primary/5 border border-primary/20 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-left">
              <h3 className="font-headline text-xl">Ready to request a refund?</h3>
              <p className="text-sm text-muted-foreground">Log in to your dashboard to manage your orders.</p>
            </div>
            <Link href="/dashboard/attendee">
              <Button size="lg" className="rounded-full px-8">Go to Orders</Button>
            </Link>
          </div>

          <div className="text-center pt-10 border-t border-border">
            <p className="text-muted-foreground flex items-center justify-center gap-2">
              <HelpCircle className="w-4 h-4" /> Have questions about a specific event? <a href="https://wa.me/2349024244140" target="_blank" className="text-primary hover:underline font-bold">Contact support</a> or the organizer.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
