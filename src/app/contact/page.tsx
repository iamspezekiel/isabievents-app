
"use client";

import React, { useState } from 'react';
import { Mail, MessageSquare, Phone, MapPin, Send, Loader2, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';

export default function ContactPage() {
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
      title: "Message Sent",
      description: "Our support team will get back to you within 24 hours.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="relative pt-48 pb-12 overflow-hidden border-b border-border bg-card/30">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/10 blur-[120px] -z-10 rounded-full" />
        <div className="container mx-auto px-4 text-center space-y-6">
          <h1 className="font-headline tracking-tighter">Get in <span className="text-primary">Touch</span></h1>
          <p className="max-w-2xl mx-auto text-muted-foreground">
            Have a question about tickets, hosting, or a specific experience? We're here to help you navigate the Nigerian event landscape.
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
          <div className="lg:col-span-1 space-y-8">
            <ContactInfo 
              icon={Mail} 
              title="Email Us" 
              value="support@isabievents.ng" 
              desc="For general inquiries and support."
            />
            <ContactInfo 
              icon={MessageSquare} 
              title="Live Chat" 
              value="WhatsApp Support" 
              desc="Available Mon-Fri, 9am - 6pm WAT."
            />
            <ContactInfo 
              icon={Phone} 
              title="Call Us" 
              value="+234 (0) 800-ISABI-HELP" 
              desc="Toll-free within Nigeria."
            />
            <ContactInfo 
              icon={MapPin} 
              title="Headquarters" 
              value="Victoria Island, Lagos" 
              desc="Nigeria's event technology hub."
            />
          </div>

          <div className="lg:col-span-2">
            <Card className="bg-card border-border shadow-2xl rounded-[2.5rem] overflow-hidden">
              <CardContent className="p-8 md:p-12">
                {!submitted ? (
                  <form onSubmit={handleSubmit} className="space-y-6 text-left">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Your Name</Label>
                        <Input id="name" placeholder="John Doe" required className="h-11 bg-secondary/30 border-none" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" type="email" placeholder="john@example.com" required className="h-11 bg-secondary/30 border-none" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Reason for Contact</Label>
                      <Select required>
                        <SelectTrigger className="h-11 bg-secondary/30 border-none">
                          <SelectValue placeholder="Select a reason" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="payouts">Payouts & Settlements</SelectItem>
                          <SelectItem value="ticketing">Ticket Issues</SelectItem>
                          <SelectItem value="verification">Organizer Verification</SelectItem>
                          <SelectItem value="technical">Technical Support</SelectItem>
                          <SelectItem value="other">Other Inquiries</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea id="message" placeholder="Tell us how we can help..." className="min-h-[150px] bg-secondary/30 border-none" required />
                    </div>
                    <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl font-bold shadow-xl shadow-primary/20 gap-2">
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-5 h-5" />}
                      Send Message
                    </Button>
                  </form>
                ) : (
                  <div className="py-12 text-center space-y-8 animate-in zoom-in-95 duration-500">
                    <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto border-4 border-green-500/20">
                      <CheckCircle2 className="w-10 h-10 text-green-500" />
                    </div>
                    <div className="space-y-3">
                      <h3 className="font-headline text-3xl">Message Received!</h3>
                      <p className="text-muted-foreground max-w-sm mx-auto">
                        Thank you for reaching out. We've received your request and will follow up shortly.
                      </p>
                    </div>
                    <div className="flex justify-center">
                      <Button onClick={() => setSubmitted(false)} variant="outline" className="rounded-full px-8">Send another message</Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <section className="bg-primary/5 py-20 border-y border-border">
        <div className="container mx-auto px-4 text-center space-y-8">
           <h2 className="font-headline tracking-tighter">Looking for immediate answers?</h2>
           <p className="text-muted-foreground">Check our Help Center for quick solutions to common issues.</p>
           <Link href="/help" className="inline-block">
             <Button size="lg" className="rounded-full px-12 h-14 font-black shadow-2xl shadow-primary/20 gap-2">
               Browse Help Center <ArrowRight className="w-5 h-5" />
             </Button>
           </Link>
        </div>
      </section>
    </div>
  );
}

function ContactInfo({ icon: Icon, title, value, desc }: any) {
  return (
    <div className="flex items-start gap-4 text-left group">
      <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <div className="space-y-1">
        <h4 className="font-bold text-sm text-muted-foreground uppercase tracking-widest">{title}</h4>
        <p className="font-black text-lg">{value}</p>
        <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
