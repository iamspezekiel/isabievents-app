"use client";

import React from 'react';
import { Target, Users, ShieldCheck, Zap, Heart, Sparkles, Quote, Globe, Star, CreditCard, Lock, MapPin } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Link from 'next/link';
import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative pt-52 pb-16 overflow-hidden border-b border-border">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/10 blur-[120px] -z-10 rounded-full" />
        <div className="container mx-auto px-4 text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <h1 className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
            Connecting Nigeria through <br />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent italic">Shared Experiences</span>
          </h1>
          <p className="max-w-2xl mx-auto text-muted-foreground text-sm">
            IsabiEvents is more than just a place to buy tickets. We are a digital bridge connecting people to unforgettable experiences across the federation.
          </p>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-8 md:py-12 container mx-auto px-4 relative">
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-accent/5 blur-[120px] rounded-full -z-10" />
        <div className="absolute -bottom-24 left-0 w-72 h-72 bg-primary/5 blur-[100px] rounded-full -z-10" />
        
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-32 items-center">
          <div className="relative order-2 lg:order-1 space-y-12">
            <div className="relative group">
              <div className="relative aspect-[4/5] rounded-[3.5rem] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] z-10 p-6 md:p-6 bg-card">
                <div className="relative w-full h-full rounded-[2.5rem] overflow-hidden">
                  <Image 
                    src="https://picsum.photos/seed/story_v12/800/1000" 
                    alt="The IsabiEvents Story" 
                    fill 
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    data-ai-hint="nigerian festival"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
                </div>
              </div>

              <div className="absolute -top-8 -left-8 w-full h-full border-2 border-primary/20 rounded-[3.5rem] -z-0 hidden md:block transition-transform duration-500 group-hover:-translate-y-2 group-hover:-translate-x-2" />
              
              <div className="absolute -bottom-10 -right-12 bg-card/80 backdrop-blur-2xl border border-white/20 p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-20 hidden md:block max-w-[280px] animate-in zoom-in-90 duration-700 delay-300">
                <div className="space-y-4 text-left">
                  <div className="w-14 h-14 bg-accent/20 rounded-2xl flex items-center justify-center">
                    <Target className="w-7 h-7 text-accent" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-4xl font-black text-foreground tracking-tighter">1.2k+</div>
                    <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Trusted Organizers</p>
                  </div>
                </div>
              </div>

              <div className="absolute top-12 -left-12 bg-primary p-6 rounded-[2rem] shadow-xl z-20 hidden md:flex items-center gap-4 border border-white/10 animate-in slide-in-from-left-8 duration-700 delay-500">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Star className="w-5 h-5 text-white fill-white" />
                </div>
                <div className="text-white text-left">
                  <div className="text-xl font-black leading-none">4.9/5</div>
                  <p className="text-[8px] uppercase font-bold opacity-80 tracking-tighter">User Satisfaction</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-12 text-left order-1 lg:order-2">
            <div className="space-y-4">
              <h2 className="tracking-tight leading-none">Built for the Naija way of life.</h2>
            </div>
            
            <div className="space-y-8">
              <p className="font-medium text-muted-foreground text-sm">
                Founded with a vision to revolutionize the fragmented event landscape in Nigeria, IsabiEvents was born from a simple realization: the most incredible experiences are often the hardest to find and access securely.
              </p>
              
              <div className="relative pl-12 py-4">
                <Quote className="absolute top-0 left-0 w-8 h-8 text-primary/20 rotate-180" />
                <p className="font-headline font-bold tracking-tight leading-snug text-foreground text-lg">
                  "We didn't just build a ticket shop. We built a system that understands the local context—from bank transfers to offline entry."
                </p>
              </div>

              <p className="text-muted-foreground text-sm">
                Today, we empower thousands of creators across the federation, providing them with the professional tools they need to scale their visions while ensuring every attendee enjoys a seamless, fraud-free journey.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 md:gap-6 pt-4">
              <div className="group relative overflow-hidden space-y-4 p-6 md:p-8 bg-secondary/30 backdrop-blur-sm rounded-[2rem] md:rounded-[2.5rem] border border-border/50 text-left transition-all hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center transition-colors group-hover:bg-primary/20">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div className="space-y-1">
                  <div className="text-3xl md:text-4xl font-black text-foreground tracking-tighter">50k+</div>
                  <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Active Users</div>
                </div>
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-2xl rounded-full -translate-y-1/2 translate-x-1/2" />
              </div>
              
              <div className="group relative overflow-hidden space-y-4 p-6 md:p-8 bg-accent/5 backdrop-blur-sm rounded-[2rem] md:rounded-[2.5rem] border border-accent/10 text-left transition-all hover:border-accent/30 hover:shadow-xl hover:shadow-accent/5">
                <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center transition-colors group-hover:bg-accent/20">
                  <Globe className="w-5 h-5 text-accent" />
                </div>
                <div className="space-y-1">
                  <div className="text-3xl md:text-4xl font-black text-foreground tracking-tighter">36</div>
                  <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">States Reached</div>
                </div>
                <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 blur-2xl rounded-full -translate-y-1/2 translate-x-1/2" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="relative py-16 md:py-24 bg-card/30 border-y border-border">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-3xl rounded-full -z-10" />
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="tracking-tighter">What We Stand For</h2>
            <p className="text-muted-foreground text-sm">Our core values guide every line of code we write and every event we power.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            <ValueCard 
              icon={ShieldCheck} 
              title="Radical Trust" 
              desc="We verify every organizer and secure every transaction, so you can book with absolute peace of mind."
            />
            <ValueCard 
              icon={Zap} 
              title="Innovation First" 
              desc="From AI-generated event copy to offline-ready mobile wallets, we're pushing the boundaries of Naija tech."
            />
            <ValueCard 
              icon={Heart} 
              title="Community Spirit" 
              desc="We believe in the power of gathering. We support free community events just as much as stadium-level concerts."
            />
          </div>
        </div>
      </section>

      {/* Why Us Section */}
      <section className="container mx-auto px-4 pt-16 pb-8 md:pt-20 md:pb-8">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <h2 className="tracking-tighter leading-none">Why IsabiEvents?</h2>
        </div>
        <div className="bg-primary/5 border border-primary/10 rounded-[4rem] p-12 md:p-20 flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 space-y-8 text-left">
             <div className="space-y-10">
                <FeatureItem 
                  icon={CreditCard}
                  title="Built for Local Payments" 
                  desc="Seamless integration with Paystack & Flutterwave for Card, Transfer, and USSD." 
                />
                <FeatureItem 
                  icon={Lock}
                  title="Digital-First Security" 
                  desc="Encrypted dynamic QR codes that prevent ticket duplication and fraud." 
                />
                <FeatureItem 
                  icon={Zap}
                  title="Data Efficient" 
                  desc="Optimized for the Nigerian network landscape, ensuring access even on slow connections." 
                />
             </div>
          </div>
          <div className="relative flex-1 w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
            <Image 
              src="https://picsum.photos/seed/why_isabi_v10/800/600" 
              alt="Innovation" 
              fill 
              className="object-cover"
              data-ai-hint="nigerian technology"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 pt-8 pb-20 md:pt-12 md:pb-32 text-center">
        <div className="max-w-4xl mx-auto space-y-12">
          <h2 className="leading-none tracking-tighter text-balance">
            Ready to join the <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent italic">movement?</span>
          </h2>
          <p className="max-w-2xl px-4 mx-auto font-medium text-muted-foreground text-sm">
            Whether you're looking for your next favorite memory or hosting the event of the year, we're here to help you make it happen.
          </p>
          <div className="flex flex-row items-center justify-center gap-4 px-2 md:gap-8 md:px-0">
            <Link href="/discover" className="flex-1 no-underline sm:flex-none">
              <Button className="w-full font-bold rounded-full px-12 shadow-2xl shadow-primary/30 h-11">
                Explore Events
              </Button>
            </Link>
            <Link href="/signup?role=organizer" className="flex-1 no-underline sm:flex-none">
              <Button variant="outline" className="w-full font-bold backdrop-blur-sm bg-background/50 border-2 rounded-full px-12 h-11">
                Host Event
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function ValueCard({ icon: Icon, title, desc }: any) {
  return (
    <Card className="bg-card border-border hover:border-primary/50 transition-all group rounded-[2.5rem] overflow-hidden">
      <CardContent className="p-10 text-center space-y-6">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto group-hover:bg-primary transition-colors">
          <Icon className="w-8 h-8 text-primary group-hover:text-white transition-colors" />
        </div>
        <div className="space-y-2">
          <h3 className="font-headline text-2xl font-bold tracking-tight">{title}</h3>
          <p className="font-medium text-muted-foreground text-sm">{desc}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function FeatureItem({ title, desc, icon: Icon }: any) {
  return (
    <div className="flex items-start gap-4">
       <div className="flex items-center justify-center shrink-0 w-10 h-10 rounded-full bg-primary/10">
          <Icon className="w-5 h-5 text-primary" />
       </div>
       <div className="space-y-1">
          <h3 className="text-xl font-bold">{title}</h3>
          <p className="text-sm text-muted-foreground">{desc}</p>
       </div>
    </div>
  );
}
