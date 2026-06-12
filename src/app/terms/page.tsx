"use client";

import React from 'react';
import { ArrowLeft, ShieldCheck, FileText, Gavel, Users, AlertCircle, Scale } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Link from 'next/link';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card pt-40 pb-10">
        <div className="container mx-auto px-4 max-w-4xl text-left">
          <Link href="/help" className="flex items-center gap-2 text-muted-foreground hover:text-white mb-6 transition-colors no-underline">
            <ArrowLeft className="w-4 h-4" /> Back to Help Center
          </Link>
          <h1 className="font-headline text-4xl md:text-5xl text-balance">Terms of Service</h1>
          <p className="text-muted-foreground mt-2">Last updated: October 25, 2024</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="grid gap-16">
          <section className="space-y-6 text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Scale className="w-5 h-5 text-primary" />
              </div>
              <h2 className="font-headline text-2xl">1. Acceptance of Terms</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              By accessing or using the IsabiEvents platform, you agree to be bound by these Terms of Service. If you do not agree to all of the terms and conditions, you may not access or use our services. These terms apply to all visitors, users, and others who access or use the service.
            </p>
          </section>

          <section className="space-y-6 text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <h2 className="font-headline text-2xl">2. User Accounts</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our service.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>You are responsible for safeguarding your password.</li>
              <li>You agree not to disclose your password to any third party.</li>
              <li>You must notify us immediately upon becoming aware of any breach of security.</li>
            </ul>
          </section>

          <section className="space-y-6 text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <h2 className="font-headline text-2xl">3. Ticket Purchases & Fees</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              IsabiEvents facilitates the sale of tickets between organizers and attendees. All ticket prices are set by the organizers. A service fee (standard 2.5%) is applied to every paid ticket transaction.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Refunds are subject to the specific organizer's policy as stated on the event page. IsabiEvents only provides 48-hour post-event settlement protection to ensure organizers fulfill their obligations.
            </p>
          </section>

          <section className="space-y-6 text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Gavel className="w-5 h-5 text-primary" />
              </div>
              <h2 className="font-headline text-2xl">4. Prohibited Activities</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              You may not use IsabiEvents for any illegal or unauthorized purpose. You agree to comply with all local laws regarding online conduct and acceptable content.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 bg-secondary/50 rounded-2xl border border-border">
                <p className="text-sm font-bold">No Ticket Reselling</p>
                <p className="text-xs text-muted-foreground">Unauthorized reselling of tickets at inflated prices is strictly prohibited.</p>
              </div>
              <div className="p-4 bg-secondary/50 rounded-2xl border border-border">
                <p className="text-sm font-bold">No Fraudulent Events</p>
                <p className="text-xs text-muted-foreground">Organizers may not list events they do not have the right to host.</p>
              </div>
            </div>
          </section>

          <section className="space-y-6 text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-primary" />
              </div>
              <h2 className="font-headline text-2xl">5. Limitation of Liability</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              In no event shall IsabiEvents, nor its directors, employees, or partners, be liable for any indirect, incidental, special, or consequential damages resulting from your use of the platform or attendance at any event listed herein.
            </p>
          </section>

          <div className="bg-primary/5 border border-primary/20 rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-2 text-left">
              <h3 className="font-headline text-2xl">Questions about these terms?</h3>
              <p className="text-muted-foreground">Our support team is here to help you understand your rights.</p>
            </div>
            <Link href="/help">
              <Button size="lg" className="rounded-full px-10 h-14 no-underline shadow-lg shadow-primary/20">Contact Support</Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
