"use client";

import React from 'react';
import { ArrowLeft, ShieldCheck, Lock, Eye, Database, Globe, Smartphone, Mail } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card pt-40 pb-10">
        <div className="container mx-auto px-4 max-w-4xl text-left">
          <Link href="/help" className="flex items-center gap-2 text-muted-foreground hover:text-white mb-6 transition-colors no-underline">
            <ArrowLeft className="w-4 h-4" /> Back to Help Center
          </Link>
          <h1 className="font-headline text-4xl md:text-5xl text-balance">Privacy Policy</h1>
          <p className="text-muted-foreground mt-2">Last updated: October 25, 2024</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="grid gap-16">
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <Eye className="w-5 h-5 text-accent" />
              </div>
              <h2 className="font-headline text-2xl">Our Commitment</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              At IsabiEvents, we take your privacy seriously. This policy explains how we collect, use, and protect your personal information when you use our platform to discover or host experiences in Nigeria.
            </p>
          </section>

          <section className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-primary" />
                  <h3 className="font-bold">What we collect</h3>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Name and Email address</li>
                  <li>• Phone number (for verification)</li>
                  <li>• Transaction history</li>
                  <li>• Device and IP information</li>
                </ul>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" />
                  <h3 className="font-bold">How we use it</h3>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• To issue and verify your tickets</li>
                  <li>• To process secure payments</li>
                  <li>• To prevent fraudulent activity</li>
                  <li>• To improve your experience</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <Lock className="w-5 h-5 text-accent" />
              </div>
              <h2 className="font-headline text-2xl">Data Security</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              We implement industry-standard security measures to protect your data. All sensitive financial information is handled by PCI-DSS compliant partners like Paystack and Flutterwave. We never store your full card details on our servers.
            </p>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-accent" />
              </div>
              <h2 className="font-headline text-2xl">Third-Party Sharing</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              We only share your information with event organizers specifically for the purpose of event entry and communication. We do not sell your data to third-party marketing companies.
            </p>
          </section>

          <section className="bg-card border border-border p-8 rounded-[2.5rem] space-y-6">
            <h2 className="font-headline text-2xl">Your Rights</h2>
            <div className="grid gap-4 text-sm text-muted-foreground">
              <p>• Right to access your personal data</p>
              <p>• Right to correct inaccurate information</p>
              <p>• Right to request deletion of your account</p>
              <p>• Right to opt-out of marketing emails</p>
            </div>
          </section>

          <div className="text-center space-y-6 pt-10 border-t border-border">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Mail className="w-4 h-4" />
              <span>privacy@isabievents.ng</span>
            </div>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              If you have any concerns regarding your privacy or data usage on IsabiEvents, please contact our Data Protection Officer.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
