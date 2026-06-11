
"use client";

import React from 'react';
import { ArrowRight, Star, TrendingUp, Users, Ticket, Award, MessageSquareQuote } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Link from 'next/link';
import Image from 'next/image';

export default function SuccessStoriesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <header className="py-24 border-b border-border bg-card/30">
        <div className="container mx-auto px-4 text-center space-y-6">
          <Badge className="bg-accent/20 text-accent border-none py-1.5 px-4 mb-4">SUCCESS STORIES</Badge>
          <h1 className="font-headline text-5xl md:text-7xl">Powering Nigeria&apos;s <br /> Unforgettable Moments</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            From intimate club nights to sold-out stadiums. See how Nigeria&apos;s leading organizers use IsabiEvents to scale their experiences.
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-24">
        {/* Featured Case Study */}
        <section className="mb-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center bg-card border border-border rounded-[3rem] overflow-hidden">
            <div className="relative aspect-video lg:aspect-square">
               <Image 
                  src="https://picsum.photos/seed/case1/800/800" 
                  alt="Lagos Jazz Festival" 
                  fill 
                  className="object-cover"
                  data-ai-hint="concert crowd"
               />
            </div>
            <div className="p-12 md:p-20 space-y-8">
              <div className="space-y-4">
                <h2 className="font-headline text-4xl">Lagos Jazz Night 2024</h2>
                <p className="text-muted-foreground text-lg leading-relaxed italic">
                  &quot;IsabiEvents transformed our gate management. We processed 5,000 attendees in under 2 hours without a single invalid ticket dispute.&quot;
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-secondary relative overflow-hidden">
                    <Image src="https://picsum.photos/seed/person1/48/48" alt="" fill />
                  </div>
                  <div>
                    <div className="font-bold">Femi Okunnu</div>
                    <div className="text-xs text-muted-foreground font-medium">Head of Operations, Smooth Events</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 pt-8 border-t border-border">
                <div>
                  <div className="text-3xl font-black text-primary">5,200+</div>
                  <div className="text-xs uppercase font-black text-muted-foreground tracking-widest">Tickets Sold</div>
                </div>
                <div>
                  <div className="text-3xl font-black text-primary">₦25M+</div>
                  <div className="text-xs uppercase font-black text-muted-foreground tracking-widest">Gross Revenue</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Success Grid */}
        <section className="space-y-16">
          <h2 className="font-headline text-4xl text-center">More Success Stories</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <CaseCard 
              title="Naija Tech Summit" 
              stat="12k+ Registered" 
              metric="48% Re-engagement" 
              img="tech"
            />
            <CaseCard 
              title="Calabar Carnival" 
              stat="Free Entry" 
              metric="100k+ QR Checks" 
              img="carnival"
            />
            <CaseCard 
              title="Beach Bash Lagos" 
              stat="Sold Out" 
              metric="20min Sell-out" 
              img="beach"
            />
          </div>
        </section>

        {/* Global Impact */}
        <section className="mt-32 py-24 bg-primary/10 rounded-[3rem] border border-primary/20 text-center space-y-12">
           <h2 className="font-headline text-4xl">Ready to be our next success story?</h2>
           <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
             Join 1,200+ Nigerian organizers who are already scaling their businesses with IsabiEvents.
           </p>
           <div className="flex flex-col sm:flex-row justify-center gap-4">
             <Link href="/signup?role=organizer">
               <Button size="lg" className="rounded-full h-16 px-12 text-lg shadow-xl shadow-primary/20">Create My First Event</Button>
             </Link>
             <Button variant="outline" size="lg" className="rounded-full h-16 px-12 text-lg">Book a Demo</Button>
           </div>
        </section>
      </main>
    </div>
  );
}

function CaseCard({ title, stat, metric, img }: any) {
  return (
    <Card className="bg-card border-border hover:border-primary/50 transition-all group">
      <div className="relative aspect-video overflow-hidden">
        <Image 
          src={`https://picsum.photos/seed/${img}/600/400`} 
          alt={title} 
          fill 
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute bottom-4 left-4">
          <h3 className="font-headline text-xl text-white">{title}</h3>
        </div>
      </div>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
           <div className="space-y-1">
             <div className="text-xs text-muted-foreground font-black uppercase tracking-widest">Scale</div>
             <div className="font-bold text-primary">{stat}</div>
           </div>
           <div className="space-y-1 text-right">
             <div className="text-xs text-muted-foreground font-black uppercase tracking-widest">Growth</div>
             <div className="font-bold text-accent">{metric}</div>
           </div>
        </div>
        <Button variant="ghost" size="sm" className="w-full text-primary hover:text-primary/80 group">
          View Details <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </CardContent>
    </Card>
  );
}
