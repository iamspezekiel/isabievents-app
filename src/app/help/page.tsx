"use client";

import React from 'react';
import { 
  Search, 
  Ticket, 
  CreditCard, 
  User, 
  ArrowRight, 
  MessageCircle, 
  Mail, 
  Phone, 
  ExternalLink,
  Send
} from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Link from 'next/link';
import Script from 'next/script';

export default function HelpCenterPage() {
  return (
    <div className="min-h-screen bg-background text-left">
      <Script id="getbutton-help" strategy="lazyOnload">
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

      {/* Header */}
      <header className="bg-card border-b border-border pt-56 pb-20 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/5 blur-[120px] -z-10 rounded-full" />
        <div className="container mx-auto px-4 max-w-4xl space-y-8">
          <div className="space-y-2">
            <h1 className="font-headline text-4xl md:text-6xl text-balance">
              How can we <span className="text-primary italic">help?</span>
            </h1>
            <p className="text-muted-foreground">Search our help center or browse common topics below.</p>
          </div>
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input 
              placeholder="Search for articles, guides..." 
              className="h-16 pl-12 rounded-2xl bg-background border-border text-lg shadow-2xl"
            />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <HelpCategoryCard icon={Ticket} title="Tickets & Entry" count={12} href="/help/tickets" />
          <HelpCategoryCard icon={CreditCard} title="Payments & Refunds" count={8} href="/help/refunds" />
          <HelpCategoryCard icon={User} title="Account & Profile" count={15} href="/help/account" />
        </div>

        <div className="grid lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2 space-y-12">
            <section className="space-y-6">
              <h4 className="font-bold text-xl">Popular Questions</h4>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="q1" className="border-border/50">
                  <AccordionTrigger className="no-underline hover:no-underline text-sm text-left">How do I receive my ticket after purchase?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed text-left">
                    Once your payment is confirmed, you will receive an email with your unique QR code ticket. You can also access all your active tickets directly in your <Link href="/dashboard/attendee" className="text-primary no-underline font-bold">Attendee Dashboard</Link> under "My Tickets".
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="q2" className="border-border/50">
                  <AccordionTrigger className="no-underline hover:no-underline text-sm text-left">What is the refund policy for events?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed text-left">
                    Refund policies are set by individual event organizers. You can find the specific policy for an event on its details page under the "Event Info" tab. Generally, requests made 7 days before an event are processed, subject to organizer approval.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="q3" className="border-border/50">
                  <AccordionTrigger className="no-underline hover:no-underline text-sm text-left">Can I transfer my ticket to a friend?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed text-left">
                    Yes! Most events allow ticket transfers. Go to your dashboard, select the ticket you want to transfer, and click "Share/Transfer". You'll just need your friend's email address.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="q4" className="border-border/50">
                  <AccordionTrigger className="no-underline hover:no-underline text-sm text-left">How do I become a verified organizer?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed text-left">
                    Verification requires a valid government-issued ID and proof of business registration for corporate entities. Head to your <Link href="/dashboard/organizer" className="text-primary no-underline font-bold">Organizer Dashboard</Link> and complete the "KYC Verification" section to get started.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </section>

            <section className="space-y-6">
              <h4 className="font-bold text-xl">Latest Articles</h4>
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <Link key={i} href="#" className="flex items-center justify-between p-6 bg-card border border-border rounded-2xl transition-all group no-underline hover:border-primary/30">
                    <div className="space-y-1">
                      <h4 className="font-bold">Protecting your account from ticket scams</h4>
                      <p className="text-sm text-muted-foreground">Safety tips for buying and selling tickets safely.</p>
                    </div>
                    <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </Link>
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-8">
            <Card className="bg-primary/5 border-primary/20 sticky top-32">
              <CardHeader>
                <CardTitle className="font-headline text-xl text-left">Still need help?</CardTitle>
                <CardDescription className="text-left">Our support team is available 24/7 to assist you.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Button className="w-full gap-2 rounded-full h-12 no-underline font-bold shadow-lg shadow-primary/20" asChild>
                    <a href="https://wa.me/2349024244140" target="_blank">
                      <MessageCircle className="w-4 h-4" /> Live Chat
                    </a>
                  </Button>
                  <Button variant="outline" className="w-full gap-2 rounded-full h-12 no-underline font-bold border-2" asChild>
                    <Link href="mailto:support@isabievents.ng">
                      <Mail className="w-4 h-4" /> Email Support
                    </Link>
                  </Button>
                  <Button variant="ghost" className="w-full gap-2 rounded-full h-12 no-underline font-bold hover:bg-primary/10 hover:text-primary transition-colors border-2 border-transparent" asChild>
                    <Link href="/contact">
                      <Send className="w-4 h-4" /> Get in Touch
                    </Link>
                  </Button>
                </div>
                <div className="pt-4 border-t border-primary/10 flex items-center justify-center gap-3 text-sm font-bold">
                  <Phone className="w-4 h-4 text-primary" /> 
                  <a href="tel:+2349024244140" className="hover:text-primary transition-colors">+234 902 424 4140</a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

function HelpCategoryCard({ icon: Icon, title, count, href }: any) {
  return (
    <Link href={href} className="no-underline">
      <Card className="bg-card border-border hover:border-primary/50 transition-all group rounded-2xl">
        <CardContent className="p-8 flex items-center gap-6">
          <div className="w-14 h-14 bg-secondary rounded-2xl flex items-center justify-center group-hover:bg-primary/10 transition-colors shadow-sm">
            <Icon className="w-7 h-7 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-lg">{title}</h3>
            <p className="text-sm text-muted-foreground">{count} Articles</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
