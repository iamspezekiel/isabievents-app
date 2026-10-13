"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ArrowLeft, 
  Sparkles, 
  Plus, 
  Calendar as CalendarIcon, 
  MapPin, 
  Image as ImageIcon, 
  Clock, 
  Tag, 
  ChevronRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Video,
  Ticket,
  ExternalLink,
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/rich-text-editor";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CATEGORIES, CITIES, STATES, EVENT_MODES } from '@/lib/constants';
import { getEvent } from '@/lib/client-db';
import { invalidateEventsCache } from '@/hooks/use-events';
import { toRichHtml } from '@/lib/rich-text';
import { apiFetch } from '@/lib/api-fetch';

function CreateEventForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const eventId = searchParams.get('id');
  const isEdit = !!eventId;
  
  const [step, setStep] = useState(1);
  const [loadingAI, setLoadingAI] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    summary: '',
    description: '',
    policies: '',
    venue: '',
    city: '',
    state: '',
    mode: 'physical' as string,
    virtualLink: '',
    date: '',
    time: '',
    // Multi-day events: the last day (empty = single-day, ends at start time).
    endDate: '',
    price: '',
    capacity: '',
    // Where buyers complete their purchase: on IsabiEvents, or on the
    // organizer's own/existing listing (Luma, Eventbrite, Meetup, website).
    ticketMode: 'internal' as string,
    ticketUrl: '',
    // Refund policy chosen BEFORE sales open (default preserves old behaviour).
    refundPolicy: 'non_refundable' as string,
    // Cutoff in hours before the start when cancellation closes.
    refundCutoffHours: '0' as string,
  });

  const [features, setFeatures] = useState<string[]>([]);
  const [currentFeature, setCurrentFeature] = useState('');

  // Ticket types & prices (at least one required). Refundability is a single
  // event-level setting (the Refund Policy block in step 3) — every ticket
  // type follows that policy, and sold tickets keep their purchase snapshot.
  const [tiers, setTiers] = useState<{name: string; price: string}[]>([
    {name: 'General Admission', price: ''},
  ]);

  // Cover image (uploaded to Cloudflare R2 via /api/upload)
  const [coverImage, setCoverImage] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleCoverSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('folder', 'events');
      const res = await fetch('/api/upload', {method: 'POST', body: form});
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Upload failed.');
      setCoverImage(data.url);
      toast({title: 'Cover Uploaded', description: 'Your image is stored on Cloudflare R2.'});
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: err instanceof Error ? err.message : 'Please try again.',
      });
    }
    setUploading(false);
    e.target.value = '';
  };

  // Edit mode: load the real event from Firestore.
  useEffect(() => {
    if (!isEdit || !eventId) return;
    let alive = true;
    getEvent(eventId)
      .then((event) => {
        if (!event || !alive) return;
        const extra = event as {
          summary?: string;
          policies?: string;
          state?: string;
          mode?: string;
          virtualLink?: string;
          ticketMode?: string;
          ticketUrl?: string;
          endDate?: string;
          refundPolicy?: string;
          refundCutoffHours?: number;
        };
        const [datePart, timePart] = String(event.date || '').split('T');
        setFormData({
          name: event.title,
          category: event.category,
          summary: extra.summary || (event.description || '').substring(0, 100),
          description: toRichHtml(event.description || ''),
          policies: extra.policies || '',
          venue: event.venue || '',
          city: event.city || '',
          state: extra.state || '',
          mode: extra.mode || 'physical',
          virtualLink: extra.virtualLink || '',
          date: datePart || '',
          time: (timePart || '').substring(0, 5),
          // Multi-day: only surface the end date when it differs from the start day.
          endDate: extra.endDate && extra.endDate.slice(0, 10) !== datePart ? extra.endDate.slice(0, 10) : '',
          price: String(event.price?.min ?? 0),
          capacity: event.inventory ? String(event.inventory) : '',
          ticketMode: extra.ticketMode === 'external' ? 'external' : 'internal',
          ticketUrl: extra.ticketUrl || '',
          refundPolicy: extra.refundPolicy === 'refundable' ? 'refundable' : 'non_refundable',
          refundCutoffHours: String(Math.max(0, Number(extra.refundCutoffHours) || 0)),
        });
        setCoverImage(event.image || '');
        setFeatures(Array.isArray(event.tags) ? event.tags : []);
        const evTiers = (event as {tiers?: {name?: string; price?: number}[]}).tiers;
        if (Array.isArray(evTiers) && evTiers.length) {
          setTiers(
            evTiers.map((t) => ({
              name: String(t.name || 'General Admission'),
              price: String(t.price ?? 0),
            }))
          );
        } else if ((event.price?.max ?? 0) > (event.price?.min ?? 0)) {
          setTiers([
            {name: 'Standard Access', price: String(event.price?.min ?? 0)},
            {name: 'VIP Experience', price: String(event.price?.max ?? 0)},
          ]);
        } else {
          setTiers([{name: 'General Admission', price: String(event.price?.min ?? 0)}]);
        }
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [isEdit, eventId]);

  const handleAddFeature = () => {
    if (currentFeature && !features.includes(currentFeature)) {
      setFeatures([...features, currentFeature]);
      setCurrentFeature('');
    }
  };

  const handleUseAI = async () => {
    if (!formData.name.trim()) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in the Event Name first so there's something to work with.",
      });
      return;
    }

    setLoadingAI(true);
    try {
      const res = await apiFetch('/api/ai/generate-copy', {
        method: 'POST',
        body: JSON.stringify({
          eventName: formData.name,
          eventType: formData.category,
          eventSummary: formData.summary,
          keyFeatures: features,
          eventDate: `${formData.date} ${formData.time}`.trim(),
          eventVenue: formData.venue,
        }),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(result.error || 'Generation failed.');

      setFormData(prev => ({
        ...prev,
        description: toRichHtml(result.eventDescription || ''),
        policies: result.eventPolicies || prev.policies,
      }));

      toast({
        title: "Content Generated!",
        description: result.source === 'ai'
          ? "AI has drafted your description and policies."
          : "A draft description and policies have been generated.",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: err instanceof Error ? err.message : 'Please try again.',
      });
    } finally {
      setLoadingAI(false);
    }
  };

  const handleSubmit = async () => {
    const needsVenue = formData.mode !== 'virtual';
    const needsLink = formData.mode !== 'physical';
    if (!formData.name.trim() || !formData.date || (needsVenue && !formData.venue.trim()) || (needsLink && !formData.virtualLink.trim())) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: needsLink && !formData.virtualLink.trim()
          ? "Add a join link for virtual & hybrid events."
          : "Event name, venue and date are required.",
      });
      return;
    }
    if (formData.ticketMode === 'external' && !/^https?:\/\/[^\s/]+\.[^\s]+/i.test(formData.ticketUrl.trim())) {
      toast({
        variant: "destructive",
        title: "Ticket link required",
        description: "Add the full link (https://…) to your event page on Luma, Eventbrite, Meetup or your own website.",
      });
      return;
    }
    if (formData.endDate && formData.date && formData.endDate < formData.date) {
      toast({
        variant: "destructive",
        title: "Invalid end date",
        description: "The end date cannot be before the start date.",
      });
      return;
    }
    setSubmitting(true);
    try {
      const validTiers = tiers
        .map((t) => ({
          name: t.name.trim(),
          price: Number(t.price) || 0,
        }))
        .filter((t) => t.name);
      if (!validTiers.length) {
        throw new Error('Add at least one ticket type with a name.');
      }
      const payload = {
        title: formData.name.trim(),
        category: formData.category || 'community',
        city: formData.city,
        state: formData.state,
        mode: formData.mode,
        virtualLink: formData.virtualLink.trim(),
        venue: formData.venue.trim(),
        date: `${formData.date}T${formData.time || '00:00'}:00`,
        // Last day of a multi-day event (empty → the API keeps single-day behaviour).
        endDate: formData.endDate || '',
        // Refund policy (chosen before sales open; snapshotted per ticket).
        refundPolicy: formData.refundPolicy === 'refundable' ? 'refundable' : 'non_refundable',
        refundCutoffHours: Number(formData.refundCutoffHours) || 0,
        image: coverImage,
        description: formData.description.trim() || formData.summary.trim(),
        summary: formData.summary.trim(),
        policies: formData.policies.trim(),
        price: Math.min(...validTiers.map((t) => t.price)),
        tiers: validTiers,
        ticketMode: formData.ticketMode === 'external' ? 'external' : 'internal',
        ticketUrl: formData.ticketMode === 'external' ? formData.ticketUrl.trim() : '',
        inventory: Number(formData.capacity) || 0,
        tags: features,
      };
      const res = await apiFetch('/api/events', {
        method: isEdit ? 'PATCH' : 'POST',
        body: JSON.stringify(isEdit ? {id: eventId, ...payload} : payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not save the event.');

      // Refresh the shared events feed so the new/updated event shows up on
      // the dashboard and the public site immediately (not after the cache TTL).
      invalidateEventsCache();

      toast({
        title: isEdit ? "Event Updated!" : "Event Created!",
        description: isEdit
          ? "Your changes have been saved."
          : "Your event is live on the marketplace.",
      });
      router.push('/dashboard/organizer');
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: err instanceof Error ? err.message : 'Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 pt-0">
      <header className="border-b border-border bg-card sticky top-16 md:top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 md:gap-4 min-w-0">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="shrink-0">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-headline text-lg md:text-2xl tracking-tighter truncate">
              {isEdit ? 'Edit Event' : 'Create New Event'}
            </h1>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <div className="flex gap-1" aria-label={`Step ${step} of 3`}>
              {[1, 2, 3].map(i => (
                <div key={i} className={`h-1.5 w-5 md:w-8 rounded-full transition-colors ${step >= i ? 'bg-primary' : 'bg-secondary'}`} />
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 pt-6 max-w-4xl">
        {step === 1 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <section className="space-y-6">
              <div className="space-y-2 text-left">
                <h2 className="text-2xl md:text-3xl font-headline tracking-tighter">Basic Information</h2>
                <p className="text-muted-foreground">Let&apos;s start with the core details of your event.</p>
              </div>

              <div className="grid gap-6">
                <div className="space-y-2 text-left">
                  <Label htmlFor="name">Event Name</Label>
                  <Input 
                    id="name" 
                    placeholder="e.g. Lagos Jazz Night 2024" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="h-11"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6 text-left">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map(cat => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="venue">Venue</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        id="venue" 
                        placeholder="e.g. Muson Center, Onikan" 
                        className="pl-10 h-11"
                        value={formData.venue}
                        onChange={(e) => setFormData({...formData, venue: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      list="nigeria-cities"
                      placeholder="Search or type a city"
                      className="h-11"
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                    />
                    <datalist id="nigeria-cities">
                      {CITIES.map(city => <option key={city} value={city} />)}
                    </datalist>
                    <p className="text-xs text-muted-foreground">Start typing to search, or enter any city.</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Select value={formData.state} onValueChange={(v) => setFormData({...formData, state: v})}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {STATES.map(st => (
                          <SelectItem key={st} value={st}>{st}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3 text-left">
                  <Label>Event Type</Label>
                  <div className="grid sm:grid-cols-3 gap-3">
                    {EVENT_MODES.map((m) => {
                      const active = formData.mode === m.id;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setFormData({...formData, mode: m.id as string})}
                          className={`p-4 rounded-xl border-2 text-left transition-all ${active ? 'border-primary bg-primary/5' : 'border-border hover:bg-secondary'}`}
                        >
                          <div className="flex items-center gap-2 font-bold">
                            {m.id === 'virtual' ? <Video className="w-4 h-4 text-primary" /> : <MapPin className="w-4 h-4 text-primary" />}
                            {m.name}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{m.description}</p>
                        </button>
                      );
                    })}
                  </div>
                  {formData.mode !== 'physical' && (
                    <div className="space-y-2">
                      <Label htmlFor="virtualLink">Virtual Join Link</Label>
                      <Input
                        id="virtualLink"
                        placeholder="https://zoom.us/j/… or livestream URL"
                        className="h-11"
                        value={formData.virtualLink}
                        onChange={(e) => setFormData({...formData, virtualLink: e.target.value})}
                      />
                      <p className="text-xs text-muted-foreground">Shared with ticket holders after purchase.</p>
                    </div>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-6 text-left">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <div className="relative">
                      <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        id="date" 
                        type="date" 
                        className="pl-10 h-11"
                        value={formData.date}
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Start Time</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        id="time" 
                        type="time" 
                        className="pl-10 h-11"
                        value={formData.time}
                        onChange={(e) => setFormData({...formData, time: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date (multi-day events)</Label>
                    <div className="relative">
                      <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        id="endDate" 
                        type="date" 
                        min={formData.date || undefined}
                        className="pl-10 h-11"
                        value={formData.endDate}
                        onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Optional — for festivals &amp; multi-day events. Leave empty for a single-day event (Africa/Lagos time).
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <div className="pt-8 flex justify-end">
              <Button onClick={() => setStep(2)} className="w-full sm:w-auto rounded-full px-8 gap-2 font-bold h-11">
                Continue to Content <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <section className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-left">
                <div className="space-y-1">
                  <h2 className="text-2xl md:text-3xl font-headline tracking-tighter">Event Story</h2>
                  <p className="text-muted-foreground">Describe your event to attract attendees.</p>
                </div>
                <Button 
                  onClick={handleUseAI} 
                  disabled={loadingAI}
                  className="bg-primary hover:bg-primary/90 rounded-full gap-2 px-6 shadow-lg shadow-primary/20 h-11 font-bold"
                >
                  {loadingAI ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  Generate with AI
                </Button>
              </div>

              <div className="grid gap-6 text-left">
                <div className="space-y-2">
                  <Label htmlFor="description">Detailed Description</Label>
                  <RichTextEditor
                    value={formData.description}
                    onChange={(v) => setFormData({...formData, description: v})}
                    placeholder="Tell attendees everything — what to expect, the schedule, highlights. Use the toolbar for headings, lists, links, photos and videos. You can also paste formatted content straight from another site."
                  />
                  <p className="text-xs text-muted-foreground">
                    Full editor: headings, <strong>bold</strong>, lists, quotes, links, real images and YouTube/Vimeo videos. Copy &amp; paste keeps the formatting.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="summary">Brief Summary</Label>
                  <Textarea 
                    id="summary" 
                    placeholder="A catchy 1-2 sentence hook..." 
                    className="h-20"
                    value={formData.summary}
                    onChange={(e) => setFormData({...formData, summary: e.target.value})}
                  />
                  <p className="text-xs text-muted-foreground">A short hook used for cards and search results.</p>
                </div>

                <div className="space-y-2">
                  <Label>Key Highlights</Label>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="e.g. Free drinks for VIPs" 
                      value={currentFeature}
                      onChange={(e) => setCurrentFeature(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddFeature()}
                      className="h-11"
                    />
                    <Button variant="secondary" onClick={handleAddFeature} className="h-11 font-bold px-6">Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {features.map((f, i) => (
                      <Badge key={i} variant="outline" className="gap-1 pl-3 pr-2 py-1 h-8">
                        {f}
                        <button onClick={() => setFeatures(features.filter((_, idx) => idx !== i))} className="hover:text-red-500 ml-1">×</button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="policies">Event Policies</Label>
                  <Textarea 
                    id="policies" 
                    placeholder="Refunds, age limits, security info..." 
                    className="h-32"
                    value={formData.policies}
                    onChange={(e) => setFormData({...formData, policies: e.target.value})}
                  />
                </div>
              </div>
            </section>

            <div className="pt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
              <Button variant="ghost" onClick={() => setStep(1)} className="w-full sm:w-auto rounded-full px-8 font-bold h-11">Back</Button>
              <Button onClick={() => setStep(3)} className="w-full sm:w-auto rounded-full px-8 gap-2 font-bold h-11">
                Pricing &amp; Capacity <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <section className="space-y-6">
              <div className="space-y-2 text-left">
                <h2 className="text-2xl md:text-3xl font-headline tracking-tighter">Inventory & Launch</h2>
                <p className="text-muted-foreground">Finalize your event logistics before going live.</p>
              </div>

              {/* Ticketing spans the full content width (mobile-friendly single column). */}
              <div className="grid gap-8 text-left">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold">Ticketing</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <Label>Where should visitors get tickets?</Label>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setFormData({...formData, ticketMode: 'internal'})}
                          className={`p-4 rounded-xl border-2 text-left transition-all ${formData.ticketMode !== 'external' ? 'border-primary bg-primary/5' : 'border-border hover:bg-secondary'}`}
                        >
                          <div className="flex items-center gap-2 font-bold">
                            <Ticket className="w-4 h-4 text-primary" /> Sell on IsabiEvents
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Visitors pay here — tickets and QR codes are issued instantly.
                          </p>
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({...formData, ticketMode: 'external'})}
                          className={`p-4 rounded-xl border-2 text-left transition-all ${formData.ticketMode === 'external' ? 'border-primary bg-primary/5' : 'border-border hover:bg-secondary'}`}
                        >
                          <div className="flex items-center gap-2 font-bold">
                            <ExternalLink className="w-4 h-4 text-primary" /> External ticketing page
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Already listed on Luma, Eventbrite, Meetup or your own website? We display the event and send visitors to you.
                          </p>
                        </button>
                      </div>
                      {formData.ticketMode === 'external' && (
                        <div className="space-y-2">
                          <Label htmlFor="ticketUrl">Original event link</Label>
                          <Input
                            id="ticketUrl"
                            type="url"
                            placeholder="https://lu.ma/… · https://eventbrite.com/… · your website"
                            className="h-11"
                            value={formData.ticketUrl}
                            onChange={(e) => setFormData({...formData, ticketUrl: e.target.value})}
                          />
                          <p className="text-xs text-muted-foreground">
                            &ldquo;Get Tickets&rdquo; on your event page opens this link so visitors register or pay with you.
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3 rounded-xl border border-border p-4">
                      <Label>Refund Policy (set before tickets go on sale)</Label>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setFormData({...formData, refundPolicy: 'refundable'})}
                          className={`p-3 rounded-xl border-2 text-left transition-all ${formData.refundPolicy === 'refundable' ? 'border-green-500 bg-green-500/5' : 'border-border hover:bg-secondary'}`}
                        >
                          <div className="font-bold text-sm">Refundable</div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Buyers can cancel before the cutoff below and get their money back.
                          </p>
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({...formData, refundPolicy: 'non_refundable'})}
                          className={`p-3 rounded-xl border-2 text-left transition-all ${formData.refundPolicy !== 'refundable' ? 'border-primary bg-primary/5' : 'border-border hover:bg-secondary'}`}
                        >
                          <div className="font-bold text-sm">Non-refundable</div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            No cancellations or refunds once a ticket is purchased.
                          </p>
                        </button>
                      </div>
                      {formData.refundPolicy === 'refundable' && (
                        <div className="space-y-2">
                          <Label htmlFor="refundCutoff">Cancellation closes</Label>
                          <Select
                            value={formData.refundCutoffHours}
                            onValueChange={(v) => setFormData({...formData, refundCutoffHours: v})}
                          >
                            <SelectTrigger id="refundCutoff" className="h-11">
                              <SelectValue placeholder="Choose a cutoff" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0">When the event starts (Africa/Lagos)</SelectItem>
                              <SelectItem value="24">24 hours before the event</SelectItem>
                              <SelectItem value="48">48 hours before the event</SelectItem>
                              <SelectItem value="72">72 hours before the event</SelectItem>
                              <SelectItem value="168">1 week before the event</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground">
                            Shown to attendees before checkout. Eligibility is locked per ticket at purchase —
                            you can&apos;t remove refunds for tickets already sold.
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <Label>Ticket Types &amp; Prices (₦)</Label>
                      {tiers.map((tier, i) => (
                        <div key={i} className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                          <Input
                            placeholder="e.g. Regular, VIP, Table for 5"
                            value={tier.name}
                            onChange={(e) =>
                              setTiers(tiers.map((t, idx) => (idx === i ? {...t, name: e.target.value} : t)))
                            }
                            className="h-11 w-full sm:w-auto sm:flex-1"
                            aria-label={`Ticket type ${i + 1} name`}
                          />
                          <Input
                            type="number"
                            min={0}
                            placeholder="Price"
                            value={tier.price}
                            onChange={(e) =>
                              setTiers(tiers.map((t, idx) => (idx === i ? {...t, price: e.target.value} : t)))
                            }
                            className="h-11 flex-1 sm:flex-none sm:w-24"
                            aria-label={`Ticket type ${i + 1} price`}
                          />
                          {tiers.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-11 w-11 shrink-0 text-muted-foreground hover:text-red-500"
                              onClick={() => setTiers(tiers.filter((_, idx) => idx !== i))}
                              aria-label="Remove ticket type"
                            >
                              ×
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="rounded-full font-bold gap-2"
                        onClick={() => setTiers([...tiers, {name: '', price: ''}])}
                      >
                        + Add Ticket Type
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        {formData.ticketMode === 'external'
                          ? 'Shown on your event page for reference — visitors complete payment on your external ticketing page.'
                          : 'Each type becomes a selectable ticket on your event page. Use 0 for free entry. All ticket types follow the event-level Refund Policy above.'}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="capacity">Total Capacity</Label>
                      <Input id="capacity" type="number" min={0} placeholder="Unlimited" value={formData.capacity} onChange={(e) => setFormData({...formData, capacity: e.target.value})} className="h-11" />
                      <p className="text-xs text-muted-foreground">Leave empty for unlimited capacity.</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold">Media</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video bg-secondary/50 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-secondary transition-colors overflow-hidden relative"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {coverImage ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={coverImage} alt="Event cover" className="absolute inset-0 w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white font-bold text-sm">Change Cover</span>
                          </div>
                        </>
                      ) : (
                        <>
                          {uploading ? (
                            <Loader2 className="w-8 h-8 text-primary animate-spin" />
                          ) : (
                            <ImageIcon className="w-8 h-8 text-muted-foreground" />
                          )}
                          <span className="text-base text-muted-foreground font-medium">
                            {uploading ? 'Uploading to R2…' : 'Upload Event Cover'}
                          </span>
                          <span className="text-xs text-muted-foreground">Recommended: 1200x600px · stored on Cloudflare R2</span>
                        </>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
                        className="hidden"
                        onChange={handleCoverSelect}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-primary/10 border-primary/20 border text-left">
                <CardContent className="p-6 pb-16 flex items-start gap-4">
                  <AlertCircle className="w-6 h-6 text-primary shrink-0 mt-1" />
                  <div className="space-y-1">
                    <h4 className="font-bold text-primary">Pre-launch Checklist</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Your event description is compelling</li>
                      <li>• Venue and Date are verified</li>
                      <li>• Ticket price includes platform fee</li>
                      <li>• Payout bank account is connected</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </section>

            <div className="pt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
              <Button variant="ghost" onClick={() => setStep(2)} className="w-full sm:w-auto rounded-full px-8 font-bold h-11">Back</Button>
              <Button onClick={handleSubmit} disabled={submitting} className="w-full sm:w-auto rounded-full px-12 h-11 font-bold gap-2 shadow-xl shadow-primary/20">
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : isEdit ? 'Save Changes' : 'Launch Event'}
                {!submitting && <CheckCircle2 className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function CreateEventPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    }>
      <CreateEventForm />
    </Suspense>
  );
}
