"use client";

import React from 'react';
import { Star, Quote, Users, MessageSquare } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import Image from 'next/image';
import { cn } from "@/lib/utils";

const TESTIMONIALS = [
  {
    name: "Chioma Okereke",
    quote: "IsabiEvents is a lifesaver. No more worrying about fake tickets outside the venue. The QR system is fast and seamless. I've used it for over 5 concerts this year!",
    avatar: "https://picsum.photos/seed/chioma/100/100",
    rating: 5
  },
  {
    name: "Tunde Bakare",
    quote: "I love the clean interface. Buying tickets for tech conferences in Abuja has never been easier. The transfer feature is also amazing when I buy for my team.",
    avatar: "https://picsum.photos/seed/tunde/100/100",
    rating: 5
  },
  {
    name: "Aisha Bello",
    quote: "The mobile wallet is great because I don't need data to show my ticket at the gate. Very thoughtful design for the Nigerian market.",
    avatar: "https://picsum.photos/seed/aisha/100/100",
    rating: 4
  },
  {
    name: "Emeka Nwosu",
    quote: "Finally, a platform that understands Naija. Payouts for my vendor stall at events are always on time. Highly recommend!",
    avatar: "https://picsum.photos/seed/emeka/100/100",
    rating: 5
  },
  {
    name: "Fatima Yusuf",
    quote: "Super easy to use. I found out about a free cultural expo in Benin that I wouldn't have known about otherwise. The discovery feature is top-notch.",
    avatar: "https://picsum.photos/seed/fatima/100/100",
    rating: 5
  },
  {
    name: "Olumide Williams",
    quote: "Secure and reliable. I've never had an issue with payments using my local card. The verification for organizers gives me peace of mind.",
    avatar: "https://picsum.photos/seed/olumide/100/100",
    rating: 5
  }
];

export default function TestimonialsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <header className="pt-40 pb-8 border-b border-border bg-card/30 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2 -z-10" />
        <div className="container mx-auto px-4 text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <Badge className="bg-accent/20 text-accent border-none py-1.5 px-6 mb-4 font-bold tracking-widest uppercase">TESTIMONIALS</Badge>
          <h1 className="font-headline text-4xl md:text-7xl font-black leading-[1.1] tracking-tighter text-balance">
            Real Stories from <br /> 
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Our Community
            </span>
          </h1>
          <p className="text-muted-foreground max-w-3xl mx-auto">
            See why thousands of Nigerians trust IsabiEvents to discover and share their most memorable experiences.
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-12">
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
        <section className="mt-16 py-16 px-8 bg-card border border-border rounded-[4rem] text-center space-y-10 overflow-hidden relative group">
           {/* Background Glows */}
           <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 blur-[120px] rounded-full -translate-x-1/2 -translate-y-1/2 transition-transform duration-1000 group-hover:scale-110" />
           <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/10 blur-[120px] rounded-full translate-x-1/2 translate-y-1/2 transition-transform duration-1000 group-hover:scale-110" />
           
           <div className="relative z-10 max-w-4xl mx-auto space-y-8">
             <h2 className="font-headline text-3xl md:text-5xl font-black tracking-tighter leading-none">
               Don't just read about it. <br />
               <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent italic">Live it.</span>
             </h2>
             <p className="text-muted-foreground font-medium max-w-2xl mx-auto">
               Find your next favorite memory. Explore trending events in Nigeria today.
             </p>
             
             <div className="flex flex-col sm:flex-row justify-center items-center gap-6 pt-10">
               <Link href="/discover" className="w-full sm:w-auto no-underline">
                 <Button size="lg" className="w-full sm:w-auto rounded-full h-16 px-14 text-lg shadow-2xl shadow-primary/30 hover:-translate-y-2 transition-all duration-300 font-black">
                   Explore Events
                 </Button>
               </Link>
               <Link href="/signup" className="w-full sm:w-auto no-underline">
                 <Button variant="outline" size="lg" className="w-full sm:w-auto rounded-full h-16 px-14 text-lg border-2 bg-background/50 backdrop-blur-sm hover:bg-secondary hover:-translate-y-2 transition-all duration-300 font-black">
                   Join Community
                 </Button>
               </Link>
             </div>
           </div>
        </section>
      </main>
    </div>
  );
}

function StatBox({ icon: Icon, label, value }: any) {
  return (
    <Card className="bg-card border-border hover:border-primary/50 transition-all rounded-[1.5rem]">
      <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
        <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div>
          <div className="text-2xl font-black text-foreground">{value}</div>
          <div className="text-[10px] uppercase font-black text-muted-foreground tracking-widest mt-1">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function TestimonialCard({ name, quote, avatar, rating }: any) {
  return (
    <Card className="bg-card border-border hover:border-primary/50 transition-all group rounded-[2rem] overflow-hidden flex flex-col h-full">
      <CardContent className="p-6 space-y-5 flex-1 flex flex-col justify-between">
        <div className="space-y-3">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={cn(
                  "w-3 h-3",
                  i < rating ? "text-yellow-500 fill-yellow-500" : "text-muted stroke-muted"
                )} 
              />
            ))}
          </div>
          <div className="relative">
            <Quote className="absolute -top-3 -left-4 w-8 h-8 text-primary/5 -z-10" />
            <p className="font-medium italic text-foreground/90">
              "{quote}"
            </p>
          </div>
        </div>
        
        <div className="pt-4 border-t border-border flex items-center gap-3">
          <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 border border-border">
            <Image 
              src={avatar} 
              alt={name} 
              fill 
              className="object-cover" 
            />
          </div>
          <div className="font-headline text-base font-black text-foreground">{name}</div>
        </div>
      </CardContent>
    </Card>
  );
}
