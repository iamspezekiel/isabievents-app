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
      <header className="pt-32 pb-8 border-b border-border bg-card/30 overflow-hidden">
        <div className="container mx-auto px-4 text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <Badge className="bg-accent/20 text-accent border-none py-1.5 px-6 mb-4 font-bold tracking-widest uppercase">SUCCESS STORIES</Badge>
          <h1 className="font-headline text-4xl md:text-6xl font-black leading-[1.1] tracking-tighter text-balance">
            Powering Nigeria's <br /> 
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Unforgettable Moments
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            From intimate club nights to sold-out stadiums. See how Nigeria's leading organizers use IsabiEvents to scale their experiences.
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Featured Case Study */}
        <section className="mb-12">
          <div className="grid lg:grid-cols-2 gap-16 items-center bg-card border border-border rounded-[3rem] overflow-hidden hover:border-primary/30 transition-colors">
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
                <h2 className="font-headline text-3xl font-bold">Lagos Jazz Night 2024</h2>
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
        <section className="space-y-8 mb-12">
          <h2 className="font-headline text-3xl text-center font-bold">More Success Stories</h2>
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
        <section className="mt-8 py-8 bg-primary/10 rounded-[3rem] border border-primary/20 text-center space-y-12">
           <h2 className="font-headline text-4xl font-black">Ready to be our next success story?</h2>
           <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
             Join 1,200+ Nigerian organizers who are already scaling their businesses with IsabiEvents.
           </p>
           <div className="flex flex-col sm:flex-row justify-center gap-4">
             <Link href="/signup?role=organizer" className="no-underline">
               <Button size="lg" className="rounded-full h-16 px-12 text-lg shadow-xl shadow-primary/20 hover:-translate-y-0.5 transition-all">Create My First Event</Button>
             </Link>
             <Link href="/help" className="no-underline">
              <Button variant="outline" size="lg" className="rounded-full h-16 px-12 text-lg hover:-translate-y-0.5 transition-all">Book a Demo</Button>
             </Link>
           </div>
        </section>
      </main>
    </div>
  );
}

function CaseCard({ title, stat, metric, img }: any) {
  return (
    <Card className="bg-card border-border hover:border-primary/50 transition-all group rounded-[2rem] overflow-hidden">
      <div className="relative aspect-video overflow-hidden">
        <Image 
          src={`https://picsum.photos/seed/${img}/600/400`} 
          alt={title} 
          fill 
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute bottom-4 left-4">
          <h3 className="font-headline text-xl text-white font-bold">{title}</h3>
        </div>
      </div>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
           <div className="space-y-1">
             <div className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Scale</div>
             <div className="font-bold text-primary">{stat}</div>
           </div>
           <div className="space-y-1 text-right">
             <div className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Growth</div>
             <div className="font-bold text-accent">{metric}</div>
           </div>
        </div>
        <Button variant="ghost" size="sm" className="w-full text-primary hover:text-primary/80 group rounded-full">
          View Details <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </CardContent>
    </Card>
  );
}
