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
  Trash2,
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

/** Quick-add perk suggestions — organizers can also type their own benefits. */
const TIER_BENEFIT_SUGGESTIONS = [
  'VIP access',
  'Complimentary meal',
  'Free drink',
  'Exclusive merch',
  'Priority seating',
  'Meet & greet',
  'VIP lounge',
  'Early entry',
];

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
  // `benefits` are exclusive perks shown on the event page to compare tiers.
  const [tiers, setTiers] = useState<{name: string; price: string; benefits: string[]}[]>([
    {name: 'General Admission', price: '', benefits: []},
  ]);

  // Per-tier drafts for the "add benefit" inputs (keyed by tier index).
  const [benefitDrafts, setBenefitDrafts] = useState<Record<number, string>>({});

  const addTierBenefit = (i: number, text?: string) => {
    const value = (text ?? benefitDrafts[i] ?? '').trim();
    if (!value) return;
    setTiers((prev) =>
      prev.map((t, idx) =>
        idx === i && !(t.benefits || []).includes(value) && (t.benefits || []).length < 10
          ? {...t, benefits: [...(t.benefits || []), value]}
          : t
      )
    );
    if (text === undefined) setBenefitDrafts((prev) => ({...prev, [i]: ''}));
  };

  const removeTierBenefit = (i: number, bIdx: number) => {
    setTiers((prev) =>
      prev.map((t, idx) =>
        idx === i ? {...t, benefits: (t.benefits || []).filter((_, bi) => bi !== bIdx)} : t
      )
    );
  };

  // Live summary for the Ticket Types section (unnamed tiers don't count).
  const namedTiers = tiers.filter((t) => t.name.trim());
  const tierPrices = namedTiers.map((t) => Number(t.price) || 0);
  const minTierPrice = tierPrices.length ? Math.min(...tierPrices) : 0;
  const maxTierPrice = tierPrices.length ? Math.max(...tierPrices) : 0;
  const naira = (n: number) => `₦${n.toLocaleString()}`;
  const tierRangeLabel = !namedTiers.length
    ? ''
    : minTierPrice === maxTierPrice
      ? minTierPrice === 0
        ? 'all free'
        : `${naira(minTierPrice)} each`
      : `${minTierPrice === 0 ? 'Free' : naira(minTierPrice)} – ${naira(maxTierPrice)}`;

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
        const evTiers = (event as {tiers?: {name?: string; price?: number; benefits?: string[]}[]}).tiers;
        if (Array.isArray(evTiers) && evTiers.length) {
          setTiers(
            evTiers.map((t) => ({
              name: String(t.name || 'General Admission'),
              price: String(t.price ?? 0),
              benefits: Array.isArray(t.benefits) ? t.benefits.map((b) => String(b)) : [],
            }))
          );
        } else if ((event.price?.max ?? 0) > (event.price?.min ?? 0)) {
          setTiers([
            {name: 'Standard Access', price: String(event.price?.min ?? 0), benefits: []},
            {name: 'VIP Experience', price: String(event.price?.max ?? 0), benefits: []},
          ]);
        } else {
          setTiers([{name: 'General Admission', price: String(event.price?.min ?? 0), benefits: []}]);
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
        .map((t) => {
          const benefits = (t.benefits || []).map((b) => b.trim()).filter(Boolean).slice(0, 10);
          return {
            name: t.name.trim(),
            price: Number(t.price) || 0,
            ...(benefits.length ? {benefits} : {}),
          };
        })
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
                      <div className="space-y-1.5">
                        <Label>Ticket Types &amp; Prices (₦)</Label>
                        <p className="text-xs text-muted-foreground">
                          {formData.ticketMode === 'external'
                            ? 'Shown on your event page for reference — visitors complete payment on your external ticketing page.'
                            : 'Each type becomes a selectable ticket on your event page. All ticket types follow the event-level Refund Policy above.'}
                        </p>
                      </div>
                      {tiers.map((tier, i) => {
                        const benefitCount = (tier.benefits || []).length;
                        const isFree = tier.price !== '' && Number(tier.price) === 0;
                        const normalized = tier.name.trim().toLowerCase();
                        const duplicateName =
                          !!normalized && tiers.some((t, idx) => idx !== i && t.name.trim().toLowerCase() === normalized);
                        return (
                        <div key={i} className="rounded-xl border border-border bg-card overflow-hidden">
                          {/* Tier header: live name, free flag, perk count, remove */}
                          <div className="flex items-center justify-between gap-2 border-b border-border bg-secondary/40 px-4 py-2.5">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-black flex items-center justify-center shrink-0">
                                {i + 1}
                              </span>
                              <span className="text-xs font-black uppercase tracking-widest text-muted-foreground truncate">
                                {tier.name.trim() || `Ticket Type ${i + 1}`}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              {isFree && (
                                <span className="rounded-full bg-green-500/10 text-green-500 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest">
                                  Free
                                </span>
                              )}
                              {benefitCount > 0 && (
                                <span className="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                                  <Sparkles className="w-3 h-3" /> {benefitCount} {benefitCount === 1 ? 'Perk' : 'Perks'}
                                </span>
                              )}
                              {tiers.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-red-500"
                                  onClick={() => setTiers(tiers.filter((_, idx) => idx !== i))}
                                  aria-label={`Remove ticket type ${i + 1}`}
                                  title="Remove ticket type"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </div>

                          <div className="p-4 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-[1fr_11rem] gap-3">
                              <div className="space-y-1.5">
                                <Label htmlFor={`tier-name-${i}`} className="text-xs uppercase tracking-widest text-muted-foreground/70">
                                  Name
                                </Label>
                                <Input
                                  id={`tier-name-${i}`}
                                  placeholder="e.g. Regular, VIP, Table for 5"
                                  value={tier.name}
                                  onChange={(e) =>
                                    setTiers(tiers.map((t, idx) => (idx === i ? {...t, name: e.target.value} : t)))
                                  }
                                  className={`h-11 ${duplicateName ? 'border-red-500/60 focus-visible:ring-red-500/30' : ''}`}
                                  aria-label={`Ticket type ${i + 1} name`}
                                />
                                {duplicateName && (
                                  <p className="text-xs text-red-500">
                                    Ticket type names must be unique — attendees select by name.
                                  </p>
                                )}
                              </div>
                              <div className="space-y-1.5">
                                <Label htmlFor={`tier-price-${i}`} className="text-xs uppercase tracking-widest text-muted-foreground/70">
                                  Price
                                </Label>
                                <div className="relative">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground pointer-events-none">
                                    ₦
                                  </span>
                                  <Input
                                    id={`tier-price-${i}`}
                                    type="number"
                                    min={0}
                                    placeholder="0"
                                    value={tier.price}
                                    onChange={(e) =>
                                      setTiers(tiers.map((t, idx) => (idx === i ? {...t, price: e.target.value} : t)))
                                    }
                                    className="h-11 pl-7"
                                    aria-label={`Ticket type ${i + 1} price`}
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setTiers(
                                      tiers.map((t, idx) => (idx === i ? {...t, price: isFree ? '' : '0'} : t))
                                    )
                                  }
                                  className={`text-xs font-bold rounded-full px-3 py-1 border transition-colors ${
                                    isFree
                                      ? 'border-green-500/40 bg-green-500/10 text-green-500'
                                      : 'border-border text-muted-foreground hover:border-primary/40 hover:text-primary'
                                  }`}
                                  aria-pressed={isFree}
                                >
                                  {isFree ? 'Free ✓' : 'Mark as free'}
                                </button>
                              </div>
                            </div>

                          {/* Exclusive benefits for this ticket type (VIP access,
                              complimentary meals, merch, priority seating,
                              meet-and-greet…) — shown on the event page so
                              attendees can compare tiers before buying. */}
                          <div className="space-y-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 flex items-center gap-1.5">
                              <Sparkles className="w-3 h-3 text-primary" /> Benefits (optional)
                            </span>
                            {(tier.benefits || []).length > 0 && (
                              <div className="flex flex-wrap gap-1.5">
                                {tier.benefits.map((benefit, bIdx) => (
                                  <span
                                    key={`${benefit}-${bIdx}`}
                                    className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2.5 py-1 text-xs font-bold"
                                  >
                                    {benefit}
                                    <button
                                      type="button"
                                      onClick={() => removeTierBenefit(i, bIdx)}
                                      aria-label={`Remove ${benefit}`}
                                      className="hover:text-red-500 font-bold"
                                    >
                                      ×
                                    </button>
                                  </span>
                                ))}
                              </div>
                            )}
                            <div className="flex flex-wrap sm:flex-nowrap gap-2">
                              <Input
                                value={benefitDrafts[i] ?? ''}
                                onChange={(e) => setBenefitDrafts({...benefitDrafts, [i]: e.target.value})}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    addTierBenefit(i);
                                  }
                                }}
                                placeholder="Add a benefit (e.g. VIP lounge access)"
                                maxLength={80}
                                className="h-10 flex-1 text-sm"
                                aria-label={`Benefits for ticket type ${i + 1}`}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-10 rounded-full px-4 font-bold shrink-0"
                                onClick={() => addTierBenefit(i)}
                              >
                                Add Benefit
                              </Button>
                            </div>
                            {(tier.benefits || []).length === 0 && (
                              <div className="flex flex-wrap gap-1.5">
                                {TIER_BENEFIT_SUGGESTIONS.map((s) => (
                                  <button
                                    key={s}
                                    type="button"
                                    onClick={() => addTierBenefit(i, s)}
                                    className="rounded-full border border-dashed border-border px-2.5 py-1 text-xs text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors"
                                  >
                                    + {s}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          </div>
                        </div>
                        );
                      })}
                      <button
                        type="button"
                        onClick={() => setTiers([...tiers, {name: '', price: '', benefits: []}])}
                        className="w-full rounded-xl border-2 border-dashed border-border py-3.5 text-sm font-bold text-muted-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-colors flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" /> Add Ticket Type
                      </button>
                      {namedTiers.length > 0 && (
                        <p className="text-xs text-muted-foreground pt-1">
                          {namedTiers.length} ticket type{namedTiers.length === 1 ? '' : 's'} · {tierRangeLabel}
                        </p>
                      )}
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
