
"use client";

import React, { useEffect, useState, use } from 'react';
import { Calendar, MapPin, Share2, Heart, ShieldCheck, ChevronRight, Info, Music, Users, Ticket, CheckCircle2, AlertCircle, RefreshCcw, Loader2 } from 'lucide-react';
import { useEvents } from '@/hooks/use-events';
import { toggleFavorite } from '@/lib/favorites';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { generateFaqs } from '@/ai/flows/organizer-ai-faq-generator';
import { renderMarkdown } from '@/lib/markdown';
import Image from 'next/image';
import Link from 'next/link';
import { useToast } from "@/hooks/use-toast";

export default function EventDetailsPage(props: { params: Promise<{ id: string }> }) {
  const { id } = use(props.params);
  const { toast } = useToast();
  
  const { events, loading } = useEvents();

  // Find the real event by slug or ID (backward compatibility).
  const event = events.find(e => e.slug === id || e.id === id) ?? null;
  
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loadingFaqs, setLoadingFaqs] = useState(true);
  const [faqError, setFaqError] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [tierPrice, setTierPrice] = useState(0);

  async function fetchFaqs(description: string) {
    setLoadingFaqs(true);
    setFaqError(false);
    try {
      const generated = await generateFaqs({ description });
      setFaqs(generated);
    } catch (err: any) {
      setFaqError(true);
    } finally {
      setLoadingFaqs(false);
    }
  }

  useEffect(() => {
    setMounted(true);
    if (event) fetchFaqs(event.description);
    else setLoadingFaqs(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event?.description]);

  const handleTierSelect = (name: string | null, price: number = 0) => {
    if (selectedTier === name) {
      setSelectedTier(null);
      setTierPrice(0);
      setQuantity(1);
    } else {
      setSelectedTier(name);
      setTierPrice(price);
      setQuantity(1);
    }
  };

  const handleBookmark = () => {
    if (!event) return;
    const added = toggleFavorite(event.id);
    toast({
      title: added ? "Saved to Favorites" : "Removed from Favorites",
      description: added ? "This event has been added to your saved list." : "This event was removed from your favorites."
    });
  };

  const handleShare = () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    navigator.clipboard.writeText(url);
    toast({
      title: "Link Copied!",
      description: "Event link has been copied to your clipboard."
    });
  };

  if (!event) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-4 text-center pt-20">
        {loading ? (
          <>
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading event…</p>
          </>
        ) : (
          <>
            <h1 className="font-headline text-3xl">Event not found</h1>
            <p className="text-muted-foreground">This event may have been removed or the link is incorrect.</p>
            <Link href="/discover" className="text-primary font-bold">Back to Discover</Link>
          </>
        )}
      </div>
    );
  }

  // Ticket types: organizer-defined tiers, with a sensible fallback for older
  // events that only have a single min/max price.
  const rawTiers = (event as unknown as {tiers?: {name: string; price: number}[]}).tiers;
  const tiers: {name: string; price: number}[] =
    Array.isArray(rawTiers) && rawTiers.length
      ? rawTiers
      : event.price.min === event.price.max
        ? [{name: 'General Admission', price: event.price.min}]
        : [
            {name: 'Standard Access', price: event.price.min},
            {name: 'VIP Experience', price: event.price.max},
          ];
  const policies = (event as unknown as {policies?: string}).policies || '';

  return (
    <div className="min-h-screen bg-background">
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
                {mounted ? new Date(event.date).toLocaleString('en-NG', { dateStyle: 'full', timeStyle: 'short' }) : 'Loading schedule...'}
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
          <div className="lg:col-span-2 space-y-12">
            <section>
              <h2 className="font-headline text-2xl mb-6">About Event</h2>
              <div
                className="text-muted-foreground [&_a]:text-primary [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:my-4 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:my-3 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:my-2 [&_hr]:border-border [&_img]:rounded-2xl [&_img]:my-4 [&_iframe]:aspect-video [&_iframe]:w-full [&_iframe]:rounded-2xl [&_li]:my-1 [&_p]:my-3 [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:my-4 [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:my-4 [&_.md-embed]:my-6"
                dangerouslySetInnerHTML={{__html: renderMarkdown(event.description)}}
              />
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
                {tiers.map((tier) => (
                  <TicketTier
                    key={tier.name}
                    name={tier.name}
                    price={tier.price}
                    perks={tier.price === 0 ? ['Free Entry', 'Gate Entry'] : ['Gate Entry', 'Standard Admission']}
                    available={true}
                    isSelected={selectedTier === tier.name}
                    quantity={quantity}
                    onSelect={() => handleTierSelect(tier.name, tier.price)}
                    onQuantityChange={setQuantity}
                  />
                ))}
              </TabsContent>

              <TabsContent value="info" className="pt-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-card border border-border p-6 rounded-2xl">
                    <h3 className="font-headline text-lg mb-4 flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-accent" /> Event Policies
                    </h3>
                    {policies ? (
                      <div
                        className="text-sm text-muted-foreground space-y-2 [&_a]:text-primary [&_a]:underline [&_li]:my-1 [&_ul]:list-disc [&_ul]:ml-5"
                        dangerouslySetInnerHTML={{__html: renderMarkdown(policies)}}
                      />
                    ) : (
                      <ul className="space-y-3 text-sm text-muted-foreground">
                        <li>&bull; No refunds after ticket purchase.</li>
                        <li>&bull; Age restriction: 18+ only.</li>
                        <li>&bull; Gates close at 8:00 PM.</li>
                      </ul>
                    )}
                  </div>
                  <div className="bg-card border border-border p-6 rounded-2xl">
                    <h3 className="font-headline text-lg mb-4 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-accent" /> Venue Map
                    </h3>
                    <iframe
                        title="Venue map"
                        src={`https://www.google.com/maps?q=${encodeURIComponent(`${event.venue}, ${event.city}, Nigeria`)}&output=embed`}
                        className="w-full h-full rounded-xl border-0"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="faq" className="pt-8">
                {loadingFaqs ? (
                  <div className="space-y-4">
                    {[1,2,3].map(i => <div key={i} className="h-16 bg-card animate-pulse rounded-xl" />)}
                  </div>
                ) : faqError ? (
                  <div className="text-center py-12 bg-secondary/20 rounded-2xl border border-dashed border-border/50">
                    <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h4 className="font-bold mb-2 text-sm">Service Temporarily Busy</h4>
                    <Button variant="outline" size="sm" onClick={() => event && fetchFaqs(event.description)} className="rounded-full gap-2">
                      <RefreshCcw className="w-4 h-4" /> Retry AI FAQs
                    </Button>
                  </div>
                ) : (
                  <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq, idx) => (
                      <AccordionItem key={idx} value={`item-${idx}`} className="border-border">
                        <AccordionTrigger className="text-left text-sm font-bold hover:text-primary py-3">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-xs leading-relaxed">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </TabsContent>
            </Tabs>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-32 space-y-6">
              <Card className="border-border bg-card shadow-2xl overflow-hidden rounded-2xl">
                <CardContent className="p-8">
                  <div className="flex flex-col items-center justify-center mb-6 text-center">
                    <span className="text-sm text-muted-foreground font-medium mb-1">
                      {selectedTier ? `Selected: ${selectedTier}` : 'Tickets Starting At'}
                    </span>
                    <span className="text-3xl font-black text-primary">
                      {selectedTier ? `₦${(tierPrice * quantity).toLocaleString()}` : `₦${event.price.min.toLocaleString()}`}
                    </span>
                  </div>
                  
                  <Link href={selectedTier ? `/checkout/${event.slug}?tier=${encodeURIComponent(selectedTier)}&qty=${quantity}` : `/checkout/${event.slug}`}>
                    <Button size="lg" className="w-full rounded-full shadow-lg shadow-primary/20 font-bold">
                      {selectedTier ? 'Proceed to Checkout' : 'Get Tickets Now'}
                    </Button>
                  </Link>

                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <Button variant="outline" className="rounded-full font-bold h-11" onClick={handleBookmark}>
                      <Heart className="w-4 h-4 mr-2" /> Save
                    </Button>
                    <Button variant="outline" className="rounded-full font-bold h-11" onClick={handleShare}>
                      <Share2 className="w-4 h-4 mr-2" /> Share
                    </Button>
                  </div>

                  <p className="text-center text-[10px] text-muted-foreground mt-6 uppercase font-bold tracking-widest">
                    Secured by Bachs
                  </p>
                </CardContent>
              </Card>

              <Link href={`/discover?q=${encodeURIComponent(event.organizer.name)}`} className="block no-underline">
                <Card className="border-border bg-card/50 p-6 rounded-2xl hover:border-primary/30 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-primary/20">
                      <Image src={event.organizer.avatar || 'https://placehold.co/100x100?text=Org'} alt={event.organizer.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <span className="font-bold group-hover:text-primary transition-colors">{event.organizer.name}</span>
                          {event.organizer.verified && <CheckCircle2 className="w-4 h-4 text-accent fill-accent text-white" />}
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-all group-hover:translate-x-1" />
                      </div>
                      <span className="text-xs text-muted-foreground">Organizer</span>
                    </div>
                  </div>
                </Card>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function TicketTier({ name, price, perks, available, isSelected, quantity, onSelect, onQuantityChange }: any) {
  return (
    <div className={`p-6 border rounded-2xl transition-all duration-300 ${
      available 
        ? (isSelected ? 'border-primary bg-primary/5 shadow-lg ring-1 ring-primary/20' : 'bg-card/50 border-border hover:border-primary/50') 
        : 'bg-secondary/20 border-border opacity-60 pointer-events-none'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'border-primary bg-primary' : 'border-muted'}`}>
            {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
          </div>
          <div>
            <h3 className="font-headline text-lg">{name}</h3>
            {!available && <Badge variant="destructive">Sold Out</Badge>}
          </div>
        </div>
        <div className="text-right">
          <span className="text-xl font-bold text-primary">₦{price.toLocaleString()}</span>
        </div>
      </div>
      <ul className="space-y-2 mb-6">
        {perks.map((perk: string) => (
          <li key={perk} className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="w-4 h-4 text-primary" /> {perk}
          </li>
        ))}
      </ul>
      <div className="flex items-center gap-4">
        <Button 
          variant={available ? "secondary" : "ghost"} 
          className="flex-1 rounded-full font-bold" 
          disabled={!available}
          onClick={onSelect}
        >
          {available ? 'Select Tier' : 'Unavailable'}
        </Button>
        {isSelected && (
          <div className="flex items-center gap-3 bg-secondary rounded-full px-4 h-11">
            <button 
              onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
              className="w-6 h-6 flex items-center justify-center hover:text-primary font-bold"
            >-</button>
            <span className="font-bold text-sm min-w-[1ch] text-center">{quantity}</span>
            <button 
              onClick={() => onQuantityChange(quantity + 1)}
              className="w-6 h-6 flex items-center justify-center hover:text-primary font-bold"
            >+</button>
          </div>
        )}
      </div>
    </div>
  );
}
