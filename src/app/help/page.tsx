
"use client";

import React, { useState } from 'react';
import { 
  Search, 
  Ticket, 
  CreditCard, 
  User, 
  HelpCircle, 
  ArrowRight, 
  MessageCircle, 
  Mail, 
  Phone, 
  ExternalLink,
  Instagram,
  Twitter,
  Facebook,
  Linkedin,
  Youtube,
  Send,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from 'next/link';
import { useToast } from "@/hooks/use-toast";

export default function HelpCenterPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API delay
    await new Promise(r => setTimeout(r, 1500));
    setLoading(false);
    setSubmitted(true);
    toast({
      title: "Message Received",
      description: "Our support team will get back to you shortly.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
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
              <h4 className="font-bold text-xl text-left">Popular Questions</h4>
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

            <section className="space-y-6 text-left">
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
                  <Button className="w-full gap-2 rounded-full h-12 no-underline font-bold shadow-lg shadow-primary/20">
                    <MessageCircle className="w-4 h-4" /> Live Chat
                  </Button>
                  <Button variant="outline" className="w-full gap-2 rounded-full h-12 no-underline font-bold border-2">
                    <Mail className="w-4 h-4" /> Email Support
                  </Button>
                </div>
                <div className="pt-4 border-t border-primary/10 flex items-center justify-center gap-3 text-sm font-bold">
                  <Phone className="w-4 h-4 text-primary" /> +234 (0) 800-ISABI-HELP
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Contact Form & Social Section */}
        <section className="mt-24 border-t border-border pt-24">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div className="space-y-12 text-left">
              <div className="space-y-4">
                <h2 className="font-headline text-4xl md:text-5xl tracking-tighter">Get in <span className="text-primary italic">Touch</span></h2>
                <p className="text-muted-foreground text-lg leading-relaxed max-w-lg">
                  Can't find what you're looking for? Send us a message and we'll get back to you within 24 hours.
                </p>
              </div>

              <div className="space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Follow the Vibe</h4>
                <div className="flex flex-wrap gap-4">
                  <SocialLink icon={Instagram} href="#" color="bg-[#E4405F]/10 text-[#E4405F]" />
                  <SocialLink icon={Twitter} href="#" color="bg-foreground/10 text-foreground" />
                  <SocialLink icon={Facebook} href="#" color="bg-[#1877F2]/10 text-[#1877F2]" />
                  <SocialLink icon={Linkedin} href="#" color="bg-[#0A66C2]/10 text-[#0A66C2]" />
                  <SocialLink icon={Youtube} href="#" color="bg-[#FF0000]/10 text-[#FF0000]" />
                </div>
              </div>
            </div>

            <Card className="bg-card border-border shadow-2xl rounded-[2.5rem] overflow-hidden">
              <CardContent className="p-8 md:p-12">
                {!submitted ? (
                  <form onSubmit={handleSubmit} className="space-y-6 text-left">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-xs font-black uppercase tracking-widest text-muted-foreground/70 pl-1">Your Name</Label>
                        <Input id="name" placeholder="John Doe" required className="h-12 bg-secondary/30 border-none rounded-xl" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-muted-foreground/70 pl-1">Email Address</Label>
                        <Input id="email" type="email" placeholder="john@example.com" required className="h-12 bg-secondary/30 border-none rounded-xl" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject" className="text-xs font-black uppercase tracking-widest text-muted-foreground/70 pl-1">Reason for Contact</Label>
                      <Select required>
                        <SelectTrigger className="h-12 bg-secondary/30 border-none rounded-xl">
                          <SelectValue placeholder="Select a reason" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border">
                          <SelectItem value="payouts">Payouts & Settlements</SelectItem>
                          <SelectItem value="ticketing">Ticket Issues</SelectItem>
                          <SelectItem value="verification">Organizer Verification</SelectItem>
                          <SelectItem value="technical">Technical Support</SelectItem>
                          <SelectItem value="other">Other Inquiries</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-xs font-black uppercase tracking-widest text-muted-foreground/70 pl-1">Message</Label>
                      <Textarea id="message" placeholder="Tell us how we can help..." className="min-h-[150px] bg-secondary/30 border-none rounded-xl resize-none" required />
                    </div>
                    <Button type="submit" disabled={loading} className="w-full h-14 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 gap-3">
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                      Send Message
                    </Button>
                  </form>
                ) : (
                  <div className="py-12 text-center space-y-8 animate-in zoom-in-95 duration-500">
                    <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto border-4 border-green-500/20">
                      <CheckCircle2 className="w-12 h-12 text-green-500" />
                    </div>
                    <div className="space-y-3">
                      <h3 className="font-headline text-4xl tracking-tight">Message Received!</h3>
                      <p className="text-muted-foreground max-w-sm mx-auto font-medium">
                        Thank you for reaching out. Our team is already on it and will follow up shortly.
                      </p>
                    </div>
                    <div className="flex justify-center">
                      <Button onClick={() => setSubmitted(false)} variant="outline" className="rounded-full px-10 h-11 font-bold border-2">Send another message</Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </section>
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

function SocialLink({ icon: Icon, href, color }: { icon: any, href: string, color: string }) {
  return (
    <Link href={href} className={cn(
      "w-14 h-14 rounded-2xl flex items-center justify-center transition-all hover:-translate-y-1 hover:shadow-lg shadow-black/5 group",
      color
    )}>
      <Icon className="w-6 h-6 transition-transform group-hover:scale-110" />
    </Link>
  );
}
