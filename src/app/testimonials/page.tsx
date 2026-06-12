"use client";

import React from 'react';
import { Star, Quote, Users, MessageSquare } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from 'next/link';

const TESTIMONIALS = [
  {
    name: "Chioma Okereke",
    quote: "IsabiEvents is a lifesaver. No more worrying about fake tickets outside the venue. The QR system is fast and seamless. I've used it for over 5 concerts this year!"
  },
  {
    name: "Tunde Bakare",
    quote: "I love the clean interface. Buying tickets for tech conferences in Abuja has never been easier. The transfer feature is also amazing when I buy for my team."
  },
  {
    name: "Aisha Bello",
    quote: "The mobile wallet is great because I don't need data to show my ticket at the gate. Very thoughtful design for the Nigerian market."
  },
  {
    name: "Emeka Nwosu",
    quote: "Finally, a platform that understands Naija. Payouts for my vendor stall at events are always on time. Highly recommend!"
  },
  {
    name: "Fatima Yusuf",
    quote: "Super easy to use. I found out about a free cultural expo in Benin that I wouldn't have known about otherwise. The discovery feature is top-notch."
  },
  {
    name: "Olumide Williams",
    quote: "Secure and reliable. I've never had an issue with payments using my local card. The verification for organizers gives me peace of mind."
  }
];

export default function TestimonialsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <header className="pt-40 pb-24 border-b border-border bg-card/30 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2 -z-10" />
        <div className="container mx-auto px-4 text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <Badge className="bg-accent/20 text-accent border-none py-1.5 px-6 mb-4 font-bold tracking-widest uppercase">TESTIMONIALS</Badge>
          <h1 className="font-headline text-4xl md:text-7xl font-black leading-[1.1] tracking-tighter text-balance">
            Real Stories from <br /> 
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Our Community
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            See why thousands of Nigerians trust IsabiEvents to discover and share their most memorable experiences.
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-24">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-24">
          <StatBox icon={Users} label="Happy Attendees" value="50k+" />
          <StatBox icon={Star} label="Average Rating" value="4.8/5" />
          <StatBox icon={MessageSquare} label="Verified Reviews" value="12k+" />
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {TESTIMONIALS.map((testimonial, idx) => (
            <TestimonialCard key={idx} {...testimonial} />
          ))}
        </div>

        {/* Call to Action */}
        <section className="mt-32 py-24 bg-primary/10 rounded-[3rem] border border-primary/20 text-center space-y-12 overflow-hidden relative">
           <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/20 blur-[100px] rounded-full -translate-x-1/2 translate-y-1/2 -z-10" />
           <h2 className="font-headline text-4xl font-black">Ready to join the experience?</h2>
           <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
             Find your next favorite memory. Explore trending events in Nigeria today.
           </p>
           <div className="flex flex-col sm:flex-row justify-center gap-4">
             <Link href="/discover">
               <Button size="lg" className="rounded-full h-16 px-12 text-lg shadow-xl shadow-primary/20 hover:-translate-y-1 transition-all">Explore Events</Button>
             </Link>
             <Link href="/signup">
               <Button variant="outline" size="lg" className="rounded-full h-16 px-12 text-lg hover:-translate-y-1 transition-all">Get Started Free</Button>
             </Link>
           </div>
        </section>
      </main>
    </div>
  );
}

function StatBox({ icon: Icon, label, value }: any) {
  return (
    <Card className="bg-card border-border hover:border-primary/50 transition-all rounded-[2rem]">
      <CardContent className="p-10 flex flex-col items-center text-center space-y-4">
        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
          <Icon className="w-7 h-7 text-primary" />
        </div>
        <div>
          <div className="text-3xl font-black text-foreground">{value}</div>
          <div className="text-xs uppercase font-black text-muted-foreground tracking-widest mt-1">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function TestimonialCard({ name, quote }: any) {
  return (
    <Card className="bg-card border-border hover:border-primary/50 transition-all group rounded-[2.5rem] overflow-hidden flex flex-col h-full">
      <CardContent className="p-10 space-y-6 flex-1 flex flex-col justify-between">
        <div className="relative">
          <Quote className="absolute -top-4 -left-6 w-12 h-12 text-primary/5 -z-10" />
          <p className="text-lg leading-relaxed font-medium italic text-foreground/90">
            "{quote}"
          </p>
        </div>
        
        <div className="pt-8 border-t border-border">
          <div className="font-headline text-xl font-black text-foreground">{name}</div>
        </div>
      </CardContent>
    </Card>
  );
}
