
"use client";

import React from 'react';
import { ArrowLeft, User, Lock, ShieldCheck, Mail, Settings, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Link from 'next/link';
import Script from 'next/script';

export default function AccountSupportPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Script id="getbutton-account" strategy="lazyOnload">
        {`
          (function () {
            var options = {
              call: "+2349024244140", 
              whatsapp: "+2349024244140", 
              call_to_action: "Contact Us", 
              button_color: "#7E7CFF", 
              position: "left", 
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
              <h1 className="font-headline text-2xl md:text-3xl text-balance">Account & Profile</h1>
              <p className="text-muted-foreground">Manage your identity, security, and verification status.</p>
            </div>
            <User className="w-16 h-16 text-primary/20 hidden md:block" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
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
              <CheckCircle2 className="w-6 h-6 text-primary" />
              <h2 className="font-headline text-lg">Verified Status</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Verified accounts build trust with attendees. To get verified, organizers must provide a valid government-issued ID and proof of business registration (for corporate entities). 
            </p>
            <div className="flex flex-col gap-4">
              <Link href="/dashboard/organizer" className="no-underline w-full">
                <Button className="rounded-xl px-8 h-12 font-bold w-full">Start Verification</Button>
              </Link>
              <Button variant="outline" className="rounded-xl px-8 h-12 font-bold w-full">Learn Requirements</Button>
            </div>
          </section>

          {/* FAQ/Troubleshooting Section */}
          <section className="space-y-6 text-left">
            <h2 className="font-headline text-lg">Troubleshooting</h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1" className="border-border">
                <AccordionTrigger className="text-left text-sm font-bold hover:text-primary">I can't access my registered email address</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  If you've lost access to your registered email, please contact our support team at <a href="tel:+2349024244140" className="text-primary font-bold">+234 902 424 4140</a>. You will be required to provide alternative proof of identity to initiate a secure account recovery process.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="border-border">
                <AccordionTrigger className="text-left text-sm font-bold hover:text-primary">My verification request was rejected. What next?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  Common reasons for rejection include blurry document photos, expired IDs, or mismatched names. Please check the automated email we sent for specific details. Ensure your documents are clear and valid, then resubmit via your Organizer Dashboard.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="border-border">
                <AccordionTrigger className="text-left text-sm font-bold hover:text-primary">How to delete my IsabiEvents account permanently</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  You can request a permanent account deletion under 'Account Settings' in your dashboard. Please note that this action is irreversible; you will lose access to all active tickets and purchase history.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="border-border">
                <AccordionTrigger className="text-left text-sm font-bold hover:text-primary">Switching from Attendee to Organizer role</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  Every attendee account can be upgraded to an organizer profile. Simply visit your 'Profile Settings', select 'Become an Organizer', and follow the prompts to complete the KYC verification.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
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
