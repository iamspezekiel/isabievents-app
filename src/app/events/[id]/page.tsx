
"use client";

import React, { useEffect, useState, use } from 'react';
import { Calendar, MapPin, Share2, Heart, ShieldCheck, ChevronRight, Info, Music, Users, Ticket, CheckCircle2, AlertCircle, RefreshCcw, Loader2, Flag, AlertTriangle, UserPlus, UserCheck, Mail, ExternalLink } from 'lucide-react';
import { useEvents } from '@/hooks/use-events';
import { useAuth } from '@/components/auth-provider';
import { toggleFavorite } from '@/lib/favorites';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { renderRichText } from '@/lib/rich-text';
import { DefaultAvatar } from '@/components/default-avatar';
import { apiFetch } from '@/lib/api-fetch';
import Image from 'next/image';
import Link from 'next/link';
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

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

  // Report dialog state.
  const REPORT_REASONS = [
    'Scam or fraud',
    'Misleading information',
    'Inappropriate content',
    'Wrong date or venue',
    'Something else',
  ];
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState(REPORT_REASONS[0]);
  const [reportDetails, setReportDetails] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);

  const openReport = () => {
    setReportReason(REPORT_REASONS[0]);
    setReportDetails('');
    setReportOpen(true);
  };

  const submitReport = async () => {
    if (!event) return;
    const reason = reportDetails.trim() ? `${reportReason}: ${reportDetails.trim()}` : reportReason;
    setReportSubmitting(true);
    try {
      const res = await apiFetch('/api/reports', {
        method: 'POST',
        body: JSON.stringify({ eventId: event.id, eventTitle: event.title, reason }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not submit report.');
      setReportOpen(false);
      toast({ title: 'Report Submitted', description: 'Thanks — our moderation team will review this event.' });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Report Failed',
        description: err instanceof Error ? err.message : 'Please sign in and try again.',
      });
    }
    setReportSubmitting(false);
  };

  // Host-following: attendees follow an organizer to get a dashboard
  // notification + email whenever that host publishes a new event.
  const { profile } = useAuth();
  const [following, setFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followBusy, setFollowBusy] = useState(false);

  // "Contact the Host" / "Invite a Friend" dialogs.
  const [contactOpen, setContactOpen] = useState(false);
  const [contactMessage, setContactMessage] = useState('');
  const [contactBusy, setContactBusy] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [inviteBusy, setInviteBusy] = useState(false);

  // Load the follow state for this event's host once we know who they are.
  useEffect(() => {
    if (!event?.organizerUid || !profile) return;
    let alive = true;
    apiFetch(`/api/follows?organizer=${encodeURIComponent(event.organizerUid)}`)
      .then((r) => r.json())
      .then((d) => {
        if (!alive || d?.error) return;
        setFollowing(!!d.following);
        if (typeof d.count === 'number') setFollowerCount(d.count);
      })
      .catch(() => undefined);
    return () => { alive = false; };
  }, [event?.organizerUid, profile?.uid]);

  const handleFollow = async () => {
    if (!event?.organizerUid) return;
    if (!profile) {
      toast({
        variant: 'destructive',
        title: 'Sign in to follow',
        description: 'Create an account so we can tell you when this host adds a new event.',
      });
      return;
    }
    setFollowBusy(true);
    const wasFollowing = following;
    try {
      const res = await apiFetch('/api/follows', {
        method: 'POST',
        body: JSON.stringify({organizerUid: event.organizerUid}),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.error) throw new Error(data?.error || 'Could not update follow.');
      setFollowing(!!data.following);
      if (typeof data.count === 'number') setFollowerCount(data.count);
      toast(
        wasFollowing
          ? {title: 'Unfollowed', description: `You will no longer hear about new events from ${event.organizer.name}.`}
          : {title: 'Following!', description: `We will notify you when ${event.organizer.name} hosts a new event.`}
      );
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Could not follow',
        description: err instanceof Error ? err.message : 'Please try again.',
      });
    }
    setFollowBusy(false);
  };

  const submitContact = async () => {
    if (!event) return;
    if (!profile) {
      toast({variant: 'destructive', title: 'Sign in first', description: 'Sign in so the host knows who is messaging them.'});
      return;
    }
    if (!contactMessage.trim()) {
      toast({variant: 'destructive', title: 'Message required', description: 'Write a short message for the host.'});
      return;
    }
    setContactBusy(true);
    try {
      const res = await apiFetch('/api/events/contact-host', {
        method: 'POST',
        body: JSON.stringify({eventId: event.id, message: contactMessage}),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.error) throw new Error(data?.error || 'Could not send your message.');
      setContactOpen(false);
      setContactMessage('');
      toast({title: 'Message Sent', description: `${event.organizer.name} will receive it by email.`});
    } catch (err) {
      toast({variant: 'destructive', title: 'Could Not Send', description: err instanceof Error ? err.message : 'Please try again.'});
    }
    setContactBusy(false);
  };

  const submitInvite = async () => {
    if (!event) return;
    const email = inviteEmail.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({variant: 'destructive', title: 'Valid email required', description: "Enter your friend's email address."});
      return;
    }
    setInviteBusy(true);
    try {
      const res = await apiFetch('/api/events/invite', {
        method: 'POST',
        body: JSON.stringify({
          eventId: event.id,
          friendEmail: email,
          friendName: inviteName.trim(),
          message: inviteMessage.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.error) throw new Error(data?.error || 'Could not send the invite.');
      setInviteOpen(false);
      setInviteEmail('');
      setInviteName('');
      setInviteMessage('');
      toast({title: 'Invite Sent!', description: `We emailed ${email} a link to ${event.title}.`});
    } catch (err) {
      toast({variant: 'destructive', title: 'Could Not Send', description: err instanceof Error ? err.message : 'Please try again.'});
    }
    setInviteBusy(false);
  };

  async function fetchFaqs(description: string) {
    setLoadingFaqs(true);
    setFaqError(false);
    try {
      const res = await fetch('/api/ai/faqs', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ description }),
      });
      if (!res.ok) throw new Error('FAQ generation failed');
      const generated = await res.json();
      setFaqs(Array.isArray(generated) ? generated : []);
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
                dangerouslySetInnerHTML={{__html: renderRichText(event.description)}}
              />
              <div className="flex flex-wrap gap-2 mt-8">
                {event.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="rounded-full px-4 py-1">#{tag}</Badge>
                ))}
              </div>
              <button
                type="button"
                onClick={openReport}
                className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-destructive transition-colors underline underline-offset-2"
              >
                <Flag className="w-3.5 h-3.5" /> Report this event
              </button>
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
                {/* Policies render ONLY when the host wrote them — no invented
                    defaults. Without them the Venue Map drops to full width. */}
                <div className={`grid gap-8 ${policies ? 'md:grid-cols-2' : ''}`}>
                  {policies ? (
                    <div className="bg-card border border-border p-6 rounded-2xl text-left">
                      <h3 className="font-headline text-lg mb-4 flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-accent" /> Event Policies
                      </h3>
                      <div
                        className="text-sm text-muted-foreground space-y-2 [&_a]:text-primary [&_a]:underline [&_li]:my-1 [&_ul]:list-disc [&_ul]:ml-5"
                        dangerouslySetInnerHTML={{__html: renderRichText(policies)}}
                      />
                    </div>
                  ) : null}
                  <div className="bg-card border border-border p-6 rounded-2xl text-left">
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <h3 className="font-headline text-lg flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-accent" /> Venue Map
                      </h3>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${event.venue}, ${event.city}, Nigeria`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline shrink-0 no-underline"
                      >
                        Open in Maps <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                    {/* Fixed sizing: the old iframe used h-full inside an
                        auto-height parent, which collapsed the map. */}
                    <div className="relative w-full aspect-video overflow-hidden rounded-xl border border-border bg-secondary">
                      <iframe
                        title="Venue map"
                        src={`https://www.google.com/maps?q=${encodeURIComponent(`${event.venue}, ${event.city}, Nigeria`)}&output=embed`}
                        className="absolute inset-0 h-full w-full border-0"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground">
                      {[event.venue, event.city].filter(Boolean).join(', ')}
                    </p>
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
                    <Button
                      variant="outline"
                      className="rounded-full font-bold h-11 col-span-2"
                      onClick={() => setInviteOpen(true)}
                    >
                      <UserPlus className="w-4 h-4 mr-2" /> Invite a Friend
                    </Button>
                  </div>

                  <p className="text-center text-[10px] text-muted-foreground mt-6 uppercase font-bold tracking-widest">
                    Secured by Bachs
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border bg-card/50 p-6 rounded-2xl hover:border-primary/30 transition-all group">
                <Link href={`/discover?q=${encodeURIComponent(event.organizer.name)}`} className="flex items-center gap-4 no-underline">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-primary/20 shrink-0">
                    {event.organizer.avatar ? (
                      <Image src={event.organizer.avatar} alt={event.organizer.name} fill className="object-cover" />
                    ) : (
                      <DefaultAvatar className="w-full h-full" />
                    )}
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
                </Link>
                {/* Host actions: follow (new-event alerts) + contact the host. */}
                <div className="mt-4 pt-4 border-t border-border space-y-2">
                  {event.organizerUid ? (
                    <Button
                      className={`w-full rounded-full font-bold gap-2 ${following ? '' : 'border-2'}`}
                      variant={following ? 'default' : 'outline'}
                      onClick={handleFollow}
                      disabled={followBusy}
                    >
                      {followBusy ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : following ? (
                        <UserCheck className="w-4 h-4" />
                      ) : (
                        <UserPlus className="w-4 h-4" />
                      )}
                      {following ? 'Following' : 'Follow'}
                    </Button>
                  ) : null}
                  {(followerCount > 0 || following) && (
                    <p className="text-center text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                      {followerCount.toLocaleString()} follower{followerCount === 1 ? '' : 's'}
                    </p>
                  )}
                  <Button
                    variant="outline"
                    className="w-full rounded-full font-bold gap-2"
                    onClick={() => setContactOpen(true)}
                  >
                    <Mail className="w-4 h-4" /> Contact the Host
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Contact the Host dialog */}
        <Dialog open={contactOpen} onOpenChange={setContactOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-headline flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" /> Contact the Host
              </DialogTitle>
              <DialogDescription>
                Send a message to {event.organizer.name} about &quot;{event.title}&quot; — they&apos;ll get it by email.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 text-left">
              <div className="space-y-2">
                <Label htmlFor="host-message">Your message</Label>
                <Textarea
                  id="host-message"
                  placeholder={`Hi ${event.organizer.name}, I'd like to ask about...`}
                  className="min-h-[120px]"
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  maxLength={2000}
                />
              </div>
              {profile && (
                <p className="text-xs text-muted-foreground">
                  Replying to: <span className="font-medium text-foreground">{profile.email}</span>
                </p>
              )}
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setContactOpen(false)}>Cancel</Button>
              <Button onClick={submitContact} disabled={contactBusy || !contactMessage.trim()} className="gap-2">
                {contactBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />} Send Message
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Invite a Friend dialog */}
        <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-headline flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-primary" /> Invite a Friend
              </DialogTitle>
              <DialogDescription>
                We&apos;ll email your friend a personal link to &quot;{event.title}&quot;.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 text-left">
              <div className="space-y-2">
                <Label htmlFor="invite-friend-name">Friend&apos;s name (optional)</Label>
                <Input
                  id="invite-friend-name"
                  placeholder="Ada"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  maxLength={80}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invite-friend-email">Friend&apos;s email</Label>
                <Input
                  id="invite-friend-email"
                  type="email"
                  placeholder="friend@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invite-message">Personal note (optional)</Label>
                <Textarea
                  id="invite-message"
                  placeholder="Let's go to this one!"
                  className="min-h-[80px]"
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                  maxLength={400}
                />
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setInviteOpen(false)}>Cancel</Button>
              <Button onClick={submitInvite} disabled={inviteBusy} className="gap-2">
                {inviteBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />} Send Invite
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Report dialog */}
        <Dialog open={reportOpen} onOpenChange={setReportOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-headline flex items-center gap-2">
                <Flag className="w-5 h-5 text-destructive" /> Report this event
              </DialogTitle>
              <DialogDescription>
                Tell us what&apos;s wrong with &quot;{event.title}&quot;. Our moderation team reviews every report.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Reason</Label>
                <div className="grid gap-2">
                  {REPORT_REASONS.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setReportReason(r)}
                      className={`flex items-center gap-3 rounded-xl border p-3 text-left text-sm font-medium transition-colors ${
                        reportReason === r
                          ? 'border-destructive bg-destructive/5 text-foreground'
                          : 'border-border text-muted-foreground hover:border-primary/40'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-full border-2 shrink-0 ${reportReason === r ? 'border-destructive bg-destructive' : 'border-border'}`} />
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="report-details">Additional details (optional)</Label>
                <Textarea
                  id="report-details"
                  placeholder="Add any extra context that will help us review faster."
                  className="min-h-[90px]"
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  maxLength={600}
                />
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setReportOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={submitReport} disabled={reportSubmitting} className="gap-2">
                {reportSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4" />}
                Submit Report
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
