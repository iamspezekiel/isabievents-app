"use client";

import React from 'react';
import { Target, Users, ShieldCheck, Zap, Heart, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Link from 'next/link';
import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative pt-48 pb-32 overflow-hidden border-b border-border">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/10 blur-[120px] -z-10 rounded-full" />
        <div className="container mx-auto px-4 text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <Badge className="bg-primary/20 text-primary border-none py-1.5 px-6 font-bold tracking-widest uppercase">ABOUT</Badge>
          <h4 className="font-headline text-3xl md:text-5xl font-black leading-none tracking-tighter text-balance">
            Connecting Nigeria through <br />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent italic">Shared Experiences</span>
          </h4>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-medium">
            IsabiEvents transcends simple ticketing. We are the bridge between world-class creators and their communities, fueled by the vibrant, unyielding spirit of Naija.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-24 container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative aspect-square rounded-[3rem] overflow-hidden border border-border shadow-2xl">
            <Image 
              src="https://picsum.photos/seed/story_v2/800/800" 
              alt="The IsabiEvents Story" 
              fill 
              className="object-cover"
              data-ai-hint="nigerian festival"
            />
          </div>
          <div className="space-y-8 text-left">
            <h5 className="font-headline text-2xl md:text-3xl font-black tracking-tighter leading-none">Our Story</h5>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Founded with the vision to solve the fragmented event landscape in Nigeria, IsabiEvents emerged from a simple observation: there are thousands of incredible experiences happening every day, but finding and accessing them shouldn't be a struggle.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              We've built a platform that understands the local context—from payment reliability to offline access—ensuring that every attendee and organizer has a world-class experience right here at home.
            </p>
            <div className="grid grid-cols-2 gap-8 pt-8">
              <div className="space-y-1">
                <h2 className="text-4xl font-black text-primary">50k+</h2>
                <p className="text-xs uppercase font-black text-muted-foreground tracking-widest">Active Users</p>
              </div>
              <div className="space-y-1">
                <h2 className="text-4xl font-black text-primary">1.2k+</h2>
                <p className="text-xs uppercase font-black text-muted-foreground tracking-widest">Organizers</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-card/30 border-y border-border relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-3xl rounded-full -z-10" />
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <h2 className="font-headline text-4xl font-black tracking-tighter">What We Stand For</h2>
            <p className="text-muted-foreground text-lg">Our core values guide every line of code we write and every event we power.</p>
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
      <section className="py-24 container mx-auto px-4">
        <div className="bg-primary/5 border border-primary/10 rounded-[4rem] p-12 md:p-20 flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 space-y-8 text-left">
             <h2 className="font-headline text-4xl font-black tracking-tighter leading-none">Why IsabiEvents?</h2>
             <div className="space-y-6">
                <FeatureItem title="Built for Local Payments" desc="Seamless integration with Paystack & Flutterwave for Card, Transfer, and USSD." />
                <FeatureItem title="Digital-First Security" desc="Encrypted dynamic QR codes that prevent ticket duplication and fraud." />
                <FeatureItem title="Data Efficient" desc="Optimized for the Nigerian network landscape, ensuring access even on slow connections." />
             </div>
          </div>
          <div className="flex-1 relative w-full aspect-video rounded-3xl overflow-hidden shadow-2xl">
            <Image 
              src="https://picsum.photos/seed/aboutwhy/800/450" 
              alt="Innovation" 
              fill 
              className="object-cover"
              data-ai-hint="technology event"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-12">
          <h2 className="font-headline text-4xl md:text-7xl font-black tracking-tighter leading-none text-balance">
            Ready to join the <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent italic">movement?</span>
          </h2>
          <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
            Whether you're looking for your next favorite memory or hosting the event of the year, we're here to help you make it happen.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
            <Link href="/discover" className="no-underline w-full sm:w-auto">
              <Button size="lg" className="rounded-full h-16 px-12 text-lg shadow-2xl shadow-primary/30 font-bold w-full">
                Explore Events
              </Button>
            </Link>
            <Link href="/signup?role=organizer" className="no-underline w-full sm:w-auto">
              <Button variant="outline" size="lg" className="rounded-full h-16 px-12 text-lg border-2 bg-background/50 backdrop-blur-sm font-bold w-full">
                Host an Event
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
          <h2 className="font-headline text-2xl font-bold tracking-tight">{title}</h2>
          <p className="text-muted-foreground leading-relaxed font-medium">{desc}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function FeatureItem({ title, desc }: any) {
  return (
    <div className="flex items-start gap-4">
       <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5 text-primary" />
       </div>
       <div className="space-y-1">
          <h2 className="font-bold text-xl">{title}</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
       </div>
    </div>
  );
}