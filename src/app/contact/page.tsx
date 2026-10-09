"use client";

import React, { useState } from 'react';
import { Mail, MessageSquare, Phone, MapPin, Send, Loader2, CheckCircle2, ArrowRight, Instagram, Twitter, Facebook, Linkedin, Youtube } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';
import { cn } from "@/lib/utils";
import Script from 'next/script';

export default function ContactPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [subject, setSubject] = useState('');

  const SUBJECT_LABELS: Record<string, string> = {
    payouts: 'Payouts & Settlements',
    ticketing: 'Ticket Issues',
    verification: 'Organizer Verification',
    technical: 'Technical Support',
    other: 'Other Inquiries',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formEl = e.target as HTMLFormElement;
    const data = new FormData(formEl);
    const name = String(data.get('name') || '').trim();
    const email = String(data.get('email') || '').trim();
    const message = String(data.get('message') || '').trim();

    if (!subject) {
      toast({variant: 'destructive', title: 'Select a reason', description: 'Pick why you are contacting us.'});
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/email/contact', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({name, email, subject: SUBJECT_LABELS[subject] || subject, message}),
      });
      const out = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(out.error || 'Could not send your message.');
      setSubmitted(true);
      toast({
        title: "Message Sent",
        description: "Our support team will get back to you within 24 hours.",
      });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Could Not Send Message',
        description: err instanceof Error ? err.message : 'Please try again.',
      });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Script id="getbutton-contact" strategy="lazyOnload">
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

      <header className="relative pt-48 pb-12 overflow-hidden border-b border-border bg-card/30">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/10 blur-[120px] -z-10 rounded-full" />
        <div className="container mx-auto px-4 text-center space-y-6">
          <Badge className="bg-primary/10 text-primary border-none py-1.5 px-4 font-black tracking-widest uppercase">Support Center</Badge>
          <h1 className="font-headline tracking-tighter text-balance">Get in <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent italic">Touch</span></h1>
          <p className="max-w-2xl mx-auto text-muted-foreground font-medium">
            Have a question about tickets, hosting, or a specific experience? We're here to help you navigate the Nigerian event landscape.
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-16 max-w-6xl mx-auto">
          <div className="lg:col-span-1 space-y-12 text-left">
            <div className="space-y-6">
              <ContactInfo 
                icon={Mail} 
                title="Email Us" 
                value="support@isabievents.ng" 
                desc="For general inquiries and support."
                href="mailto:support@isabievents.ng"
              />
              <ContactInfo 
                icon={MessageSquare} 
                title="Live Chat" 
                value="0902 424 4140" 
                desc="Available Mon-Fri, 9am - 6pm WAT via WhatsApp."
                href="https://wa.me/2349024244140"
              />
              <ContactInfo 
                icon={Phone} 
                title="Call Us" 
                value="+234 902 424 4140" 
                desc="Official support line for all inquiries."
                href="tel:+2349024244140"
              />
              <ContactInfo 
                icon={MapPin} 
                title="Headquarters" 
                value="Victoria Island, Lagos" 
                desc="Nigeria's event technology hub."
              />
            </div>

            <div className="space-y-6 pt-8 border-t border-border">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Follow the Vibe</h4>
              <div className="flex flex-wrap gap-2.5">
                <SocialLink icon={Instagram} href="https://instagram.com/isabievents" />
                <SocialLink icon={Twitter} href="https://twitter.com/isabievents" />
                <SocialLink icon={Facebook} href="https://facebook.com/isabievents" />
                <SocialLink icon={Linkedin} href="https://linkedin.com/company/isabievents" />
                <SocialLink icon={Youtube} href="https://youtube.com/@isabievents" />
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <Card className="bg-card border-border shadow-2xl rounded-[2.5rem] overflow-hidden">
              <CardContent className="p-8 md:p-12 mx-2 md:mx-6">
                {!submitted ? (
                  <form onSubmit={handleSubmit} className="space-y-6 text-left">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-xs font-black uppercase tracking-widest text-muted-foreground/70 pl-1">Your Name</Label>
                        <Input id="name" name="name" placeholder="John Doe" required className="h-12 bg-secondary/30 border-none rounded-xl" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-muted-foreground/70 pl-1">Email Address</Label>
                        <Input id="email" name="email" type="email" placeholder="john@example.com" required className="h-12 bg-secondary/30 border-none rounded-xl" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject" className="text-xs font-black uppercase tracking-widest text-muted-foreground/70 pl-1">Reason for Contact</Label>
                      <Select required value={subject} onValueChange={setSubject}>
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
                      <Textarea id="message" name="message" placeholder="Tell us how we can help..." className="min-h-[150px] bg-secondary/30 border-none rounded-xl resize-none" required />
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
                      <p className="text-muted-foreground max-sm mx-auto font-medium">
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
        </div>
      </main>

      <section className="bg-primary/5 py-12 border-y border-border">
        <div className="container mx-auto px-4 text-center space-y-8">
           <h2 className="font-headline tracking-tighter">Frequently Asked Questions</h2>
           <p className="text-muted-foreground max-xl mx-auto">Check our comprehensive knowledge base for quick solutions to common issues.</p>
           <Link href="/help" className="inline-block no-underline">
             <Button size="lg" className="rounded-full px-8 h-12 font-black shadow-2xl shadow-primary/20 gap-3">
               Browse Help Center <ArrowRight className="w-5 h-5" />
             </Button>
           </Link>
        </div>
      </section>
    </div>
  );
}

function ContactInfo({ icon: Icon, title, value, desc, href }: any) {
  const content = (
    <div className="flex items-start gap-4 text-left group">
      <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors shadow-sm">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div className="space-y-0.5">
        <h4 className="font-bold text-xs text-muted-foreground uppercase tracking-widest">{title}</h4>
        <p className="font-black text-lg tracking-tight group-hover:text-primary transition-colors">{value}</p>
        <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">{desc}</p>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="no-underline block" target={href.startsWith('http') ? '_blank' : undefined}>
        {content}
      </Link>
    );
  }

  return content;
}

function SocialLink({ icon: Icon, href }: { icon: any, href: string }) {
  return (
    <Link href={href} target="_blank" className="w-9 h-9 rounded-xl flex items-center justify-center transition-all bg-primary/5 text-primary border border-primary/10 hover:bg-primary hover:text-white hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/20 group">
      <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
    </Link>
  );
}
