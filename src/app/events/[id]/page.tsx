
"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Calendar, MapPin, Share2, Heart, ShieldCheck, ChevronRight, Info, Music, Users, Ticket, CheckCircle2 } from 'lucide-react';
import { MOCK_EVENTS } from '@/lib/mock-data';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { generateFaqs } from '@/ai/flows/organizer-ai-faq-generator';
import Image from 'next/image';
import Link from 'next/link';

export default function EventDetailsPage() {
  const { id } = useParams();
  const event = MOCK_EVENTS.find(e => e.id === id) || MOCK_EVENTS[0];
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loadingFaqs, setLoadingFaqs] = useState(true);

  useEffect(() => {
    async function fetchFaqs() {
      try {
        const generated = await generateFaqs({ description: event.description });
        setFaqs(generated);
      } catch (err) {
        console.error("Failed to generate FAQs", err);
      } finally {
        setLoadingFaqs(false);
      }
    }
    fetchFaqs();
  }, [event.description]);

  return (
    <div className="min-h-screen bg-background">
      {/* Dynamic Header */}
      <div className="relative h-[400px] w-full">
        <Image 
          src={event.image} 
          alt={event.title} 
          fill 
          className="object-cover brightness-50"
          data-ai-hint="event cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        <div className="absolute bottom-10 left-0 right-0">
          <div className="container mx-auto px-4">
            <Badge className="mb-4 bg-primary text-white border-none py-1.5 px-4">{event.category.toUpperCase()}</Badge>
            <h1 className="font-headline text-4xl md:text-6xl mb-4 max-w-4xl">{event.title}</h1>
            <div className="flex flex-wrap items-center gap-6 text-sm md:text-base font-medium">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                {new Date(event.date).toLocaleString('en-NG', { dateStyle: 'full', timeStyle: 'short' })}
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                {event.venue}, {event.city}
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            <section>
              <h2 className="font-headline text-2xl mb-6">About Event</h2>
              <p className="text-muted-foreground text-lg leading-relaxed whitespace-pre-wrap">
                {event.description}
              </p>
              <div className="flex flex-wrap gap-2 mt-8">
                {event.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="rounded-full px-4 py-1">#{tag}</Badge>
                ))}
              </div>
            </section>

            <Tabs defaultValue="tickets" className="w-full">
              <TabsList className="bg-secondary p-1 rounded-full w-full max-w-md">
                <TabsTrigger value="tickets" className="rounded-full flex-1">Tickets</TabsTrigger>
                <TabsTrigger value="info" className="rounded-full flex-1">Event Info</TabsTrigger>
                <TabsTrigger value="faq" className="rounded-full flex-1">FAQs</TabsTrigger>
              </TabsList>
              
              <TabsContent value="tickets" className="pt-8 space-y-4">
                <TicketTier 
                  name="Standard Access" 
                  price={event.price.min} 
                  perks={['Standard Seating', 'Gate Entry']} 
                  available={true}
                />
                <TicketTier 
                  name="VIP Experience" 
                  price={event.price.max} 
                  perks={['Front Row Seating', 'VIP Lounge Access', 'Complimentary Drinks', 'Meet & Greet']} 
                  available={true}
                />
                <TicketTier 
                  name="Early Bird" 
                  price={Math.floor(event.price.min * 0.8)} 
                  perks={['Standard Seating', 'Limited Offer']} 
                  available={false}
                />
              </TabsContent>

              <TabsContent value="info" className="pt-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-card border border-border p-6 rounded-2xl">
                    <h3 className="font-headline text-lg mb-4 flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-accent" /> Event Policies
                    </h3>
                    <ul className="space-y-3 text-sm text-muted-foreground">
                      <li>• No refunds after ticket purchase.</li>
                      <li>• Age restriction: 18+ only.</li>
                      <li>• No professional cameras allowed.</li>
                      <li>• Gates close at 8:00 PM.</li>
                    </ul>
                  </div>
                  <div className="bg-card border border-border p-6 rounded-2xl">
                    <h3 className="font-headline text-lg mb-4 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-accent" /> Venue Map
                    </h3>
                    <div className="aspect-video bg-secondary rounded-xl flex items-center justify-center text-muted-foreground text-xs italic">
                      Google Maps Integration Mock
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="faq" className="pt-8">
                {loadingFaqs ? (
                  <div className="space-y-4">
                    {[1,2,3].map(i => <div key={i} className="h-16 bg-card animate-pulse rounded-xl" />)}
                  </div>
                ) : (
                  <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq, idx) => (
                      <AccordionItem key={idx} value={`item-${idx}`} className="border-border">
                        <AccordionTrigger className="text-left font-medium hover:text-primary">{faq.question}</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground leading-relaxed">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar Widget */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 space-y-6">
              <Card className="border-border bg-card shadow-2xl overflow-hidden rounded-2xl">
                <CardContent className="p-8">
                  <div className="flex items-center justify-center mb-6">
                    <span className="text-3xl font-bold text-white">₦{event.price.min.toLocaleString()}</span>
                  </div>
                  
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Ticket className="w-4 h-4 text-primary" />
                      </div>
                      <span>Secure digital ticket delivery</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="w-4 h-4 text-primary" />
                      </div>
                      <span>Easy ticket transfers to friends</span>
                    </div>
                  </div>

                  <Link href={`/checkout/${event.id}`}>
                    <Button size="lg" className="w-full h-14 rounded-full text-lg shadow-lg shadow-primary/20">
                      Get Tickets Now
                    </Button>
                  </Link>
                  <p className="text-center text-xs text-muted-foreground mt-4">
                    Secured by Paystack & Flutterwave
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border bg-card/50 p-6 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-primary/20">
                    <Image src={event.organizer.avatar} alt={event.organizer.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1">
                      <span className="font-bold">{event.organizer.name}</span>
                      {event.organizer.verified && <CheckCircle2 className="w-4 h-4 text-accent fill-accent text-white" />}
                    </div>
                    <span className="text-xs text-muted-foreground">Organizer</span>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-full">Follow</Button>
                </div>
              </Card>

              <div className="flex items-center justify-center gap-4">
                <Button variant="ghost" size="sm" className="rounded-full gap-2">
                  <Share2 className="w-4 h-4" /> Share
                </Button>
                <Button variant="ghost" size="sm" className="rounded-full gap-2">
                  <Heart className="w-4 h-4" /> Save
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function TicketTier({ name, price, perks, available }: any) {
  return (
    <div className={`p-6 border rounded-2xl transition-all ${available ? 'bg-card/50 border-border hover:border-primary/50' : 'bg-secondary/20 border-border opacity-60 pointer-events-none'}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-headline text-lg">{name}</h3>
          {!available && <Badge variant="destructive">Sold Out</Badge>}
        </div>
        <div className="text-right">
          <span className="text-xl font-bold">₦{price.toLocaleString()}</span>
          <span className="block text-xs text-muted-foreground">per ticket</span>
        </div>
      </div>
      <ul className="space-y-2 mb-6">
        {perks.map((perk: string) => (
          <li key={perk} className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="w-4 h-4 text-primary" /> {perk}
          </li>
        ))}
      </ul>
      <Button variant={available ? "secondary" : "ghost"} className="w-full rounded-full" disabled={!available}>
        {available ? 'Select Quantity' : 'Unavailable'}
      </Button>
    </div>
  );
}
