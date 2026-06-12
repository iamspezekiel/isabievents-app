"use client";

import React from 'react';
import { ArrowLeft, User, Lock, ShieldCheck, Mail, Settings, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from 'next/link';

export default function AccountSupportPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card pt-40 pb-10">
        <div className="container mx-auto px-4 max-w-4xl text-left">
          <Link href="/help" className="flex items-center gap-2 text-muted-foreground hover:text-white mb-6 transition-colors no-underline">
            <ArrowLeft className="w-4 h-4" /> Back to Help Center
          </Link>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <h1 className="font-headline text-3xl md:text-4xl text-balance">Account & Profile</h1>
              <p className="text-muted-foreground">Manage your identity, security, and verification status.</p>
            </div>
            <User className="w-16 h-16 text-primary/20 hidden md:block" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="grid gap-12">
          {/* Quick Support Cards */}
          <section className="grid md:grid-cols-2 gap-6">
            <SupportCard 
              icon={Lock} 
              title="Password & Security" 
              desc="How to reset your password or enable Two-Factor Authentication (2FA)."
            />
            <SupportCard 
              icon={ShieldCheck} 
              title="Organizer Verification" 
              desc="The step-by-step guide to getting the verified badge for your brand."
            />
            <SupportCard 
              icon={Settings} 
              title="Profile Settings" 
              desc="Change your display name, email address, or phone number."
            />
            <SupportCard 
              icon={Mail} 
              title="Email Preferences" 
              desc="Manage which notifications and marketing updates you receive."
            />
          </section>

          {/* Account Verification Section */}
          <section className="bg-card border border-border rounded-3xl p-8 space-y-6 text-left">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-primary" />
              <h2 className="font-headline text-2xl">Verified Status</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Verified accounts build trust with attendees. To get verified, organizers must provide a valid government-issued ID and proof of business registration (for corporate entities). 
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/dashboard/organizer" className="no-underline w-full flex-1">
                <Button className="rounded-xl px-8 h-12 font-bold w-full">Start Verification</Button>
              </Link>
              <Button variant="outline" className="rounded-xl px-8 h-12 font-bold w-full flex-1">Learn Requirements</Button>
            </div>
          </section>

          {/* FAQ/Helpful Articles */}
          <section className="space-y-6 text-left">
            <h2 className="font-headline text-2xl">Troubleshooting</h2>
            <div className="space-y-4">
              <HelpfulArticle title="I can't access my registered email address" />
              <HelpfulArticle title="My verification request was rejected. What next?" />
              <HelpfulArticle title="How to delete my IsabiEvents account permanently" />
              <HelpfulArticle title="Switching from Attendee to Organizer role" />
            </div>
          </section>

          <section className="text-center pt-12 border-t border-border">
            <div className="inline-flex items-center gap-2 text-accent bg-accent/10 px-4 py-2 rounded-full mb-6">
              <AlertCircle className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest">Privacy First</span>
            </div>
            <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed">
              We never share your private identification documents with third parties. All KYC data is encrypted and handled by our secure verification partners.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}

function SupportCard({ icon: Icon, title, desc }: any) {
  return (
    <Card className="bg-card border-border hover:border-primary/50 transition-all p-8 text-left group cursor-pointer">
      <CardContent className="p-0 space-y-4">
        <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center group-hover:bg-primary/10 transition-colors">
          <Icon className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
        <h3 className="font-bold text-lg">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
      </CardContent>
    </Card>
  );
}

function HelpfulArticle({ title }: { title: string }) {
  return (
    <Link href="#" className="flex items-center justify-between p-5 bg-card/50 border border-border rounded-xl hover:border-primary/50 transition-all group no-underline">
      <span className="font-medium group-hover:text-primary transition-colors text-foreground">{title}</span>
      <ArrowLeft className="w-4 h-4 rotate-180 text-muted-foreground group-hover:text-primary transition-all group-hover:translate-x-1" />
    </Link>
  );
}