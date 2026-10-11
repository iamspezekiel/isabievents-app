"use client";

import React, { useState } from 'react';
import { ArrowLeft, Ticket, QrCode, Mail, MessageSquare, Search, Smartphone, ShieldCheck, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from 'next/link';
import Script from 'next/script';
import { useToast } from '@/hooks/use-toast';

export default function TicketSupportPage() {
  const { toast } = useToast();
  const [resendEmail, setResendEmail] = useState('');
  const [resendState, setResendState] = useState<'idle' | 'loading' | 'done'>('idle');

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(resendEmail.trim())) {
      toast({ variant: 'destructive', title: 'Invalid email', description: 'Enter the email you used at checkout.' });
      return;
    }
    setResendState('loading');
    try {
      const res = await fetch('/api/tickets/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resendEmail.trim().toLowerCase() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not resend tickets.');
      setResendState('done');
      toast({ title: 'Tickets resent', description: 'Check your inbox — your ticket email is on the way.' });
    } catch (err) {
      setResendState('idle');
      toast({
        variant: 'destructive',
        title: 'Could not resend',
        description: err instanceof Error ? err.message : 'Please try again.',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Script id="getbutton-tickets" strategy="lazyOnload">
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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 text-left">
              <h1 className="font-headline text-2xl md:text-3xl text-balance">Ticket Support</h1>
              <p className="text-muted-foreground">Everything you need to know about your digital tickets.</p>
            </div>
            <Ticket className="w-16 h-16 text-primary/20 hidden md:block" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
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
              If you can&apos;t find your ticket, enter the email address used during purchase and we&apos;ll send it back to you instantly.
            </p>
            {resendState === 'done' ? (
              <div className="flex items-center gap-3 rounded-xl border border-green-500/30 bg-green-500/10 p-4">
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                <p className="text-sm font-medium text-green-600">
                  Ticket email resent to <span className="font-bold">{resendEmail}</span>. Check your inbox (and spam folder).
                </p>
              </div>
            ) : (
              <form onSubmit={handleResend} className="flex flex-col sm:flex-row gap-4">
                <Input
                  type="email"
                  placeholder="yourname@example.com"
                  className="h-12 bg-secondary border-none"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  required
                />
                <Button type="submit" className="h-12 rounded-xl px-8 gap-2" disabled={resendState === 'loading'}>
                  {resendState === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Resend Ticket'}
                </Button>
              </form>
            )}
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
            <Button variant="outline" className="rounded-full gap-2 px-8" asChild>
              <a href="https://wa.me/2349024244140" target="_blank"><MessageSquare className="w-4 h-4" /> Chat with an Agent</a>
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
