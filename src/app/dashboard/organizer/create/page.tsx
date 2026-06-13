"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  AlertCircle
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { generateEventCopy } from '@/ai/flows/organizer-ai-copy-generator';
import { CATEGORIES } from '@/lib/mock-data';

export default function CreateEventPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [step, setStep] = useState(1);
  const [loadingAI, setLoadingAI] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    summary: '',
    description: '',
    policies: '',
    venue: '',
    date: '',
    time: '',
    price: '',
    capacity: '',
  });

  const [features, setFeatures] = useState<string[]>([]);
  const [currentFeature, setCurrentFeature] = useState('');

  const handleAddFeature = () => {
    if (currentFeature && !features.includes(currentFeature)) {
      setFeatures([...features, currentFeature]);
      setCurrentFeature('');
    }
  };

  const handleUseAI = async () => {
    if (!formData.name || !formData.category || !formData.summary) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in Event Name, Category, and Summary first.",
      });
      return;
    }

    setLoadingAI(true);
    try {
      const result = await generateEventCopy({
        eventName: formData.name,
        eventType: formData.category as any,
        eventSummary: formData.summary,
        keyFeatures: features,
        eventDate: `${formData.date} ${formData.time}`,
        eventVenue: formData.venue,
      });

      setFormData(prev => ({
        ...prev,
        description: result.eventDescription,
        policies: result.eventPolicies
      }));

      toast({
        title: "Content Generated!",
        description: "AI has drafted your description and policies.",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "AI Generation Failed",
        description: "Something went wrong while generating content.",
      });
    } finally {
      setLoadingAI(false);
    }
  };

  const handleSubmit = async () => {
    toast({
      title: "Event Created!",
      description: "Your event is being processed and will be live shortly.",
    });
    router.push('/dashboard/organizer');
  };

  return (
    <div className="min-h-screen bg-background pb-20 pt-20">
      {/* Header with added top spacing and margin */}
      <header className="border-b border-border bg-card sticky top-0 z-50 py-4 mt-16">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-headline text-xl md:text-2xl tracking-tighter">Create New Event</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex gap-1">
              {[1, 2, 3].map(i => (
                <div key={i} className={`h-1.5 w-8 rounded-full transition-colors ${step >= i ? 'bg-primary' : 'bg-secondary'}`} />
              ))}
            </div>
            <Button variant="ghost" className="font-bold">Save Draft</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 pt-12 max-w-4xl">
        {step === 1 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <section className="space-y-6">
              <div className="space-y-2 text-left">
                <h2 className="text-3xl md:text-4xl font-headline tracking-tighter">Basic Information</h2>
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
                          <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
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
                </div>
              </div>
            </section>

            <div className="pt-8 flex justify-end">
              <Button onClick={() => setStep(2)} className="rounded-full px-8 gap-2 font-bold h-11">
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
                  <h2 className="text-3xl md:text-4xl font-headline tracking-tighter">Event Story</h2>
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
                  <Label htmlFor="summary">Brief Summary</Label>
                  <Textarea 
                    id="summary" 
                    placeholder="A catchy 1-2 sentence hook..." 
                    className="h-20"
                    value={formData.summary}
                    onChange={(e) => setFormData({...formData, summary: e.target.value})}
                  />
                  <p className="text-xs text-muted-foreground">This helps the AI generate a better description.</p>
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
                  <Label htmlFor="description">Detailed Description</Label>
                  <Textarea 
                    id="description" 
                    placeholder="What can attendees expect?" 
                    className="min-h-[200px]"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
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

            <div className="pt-8 flex justify-between">
              <Button variant="ghost" onClick={() => setStep(1)} className="rounded-full px-8 font-bold h-11">Back</Button>
              <Button onClick={() => setStep(3)} className="rounded-full px-8 gap-2 font-bold h-11">
                Pricing & Capacity <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <section className="space-y-6">
              <div className="space-y-2 text-left">
                <h2 className="text-3xl md:text-4xl font-headline tracking-tighter">Inventory & Launch</h2>
                <p className="text-muted-foreground">Finalize your event logistics before going live.</p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 text-left">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold">Ticketing</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Base Ticket Price (₦)</Label>
                      <Input id="price" type="number" placeholder="5000" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="h-11" />
                      <p className="text-xs text-muted-foreground">Set to 0 for Free events.</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="capacity">Total Capacity</Label>
                      <Input id="capacity" type="number" placeholder="100" value={formData.capacity} onChange={(e) => setFormData({...formData, capacity: e.target.value})} className="h-11" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold">Media</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video bg-secondary/50 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-secondary transition-colors">
                      <ImageIcon className="w-8 h-8 text-muted-foreground" />
                      <span className="text-base text-muted-foreground font-medium">Upload Event Cover</span>
                      <span className="text-xs text-muted-foreground">Recommended: 1200x600px</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-primary/10 border-primary/20 border text-left">
                <CardContent className="p-6 flex items-start gap-4">
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

            <div className="pt-8 flex justify-between">
              <Button variant="ghost" onClick={() => setStep(2)} className="rounded-full px-8 font-bold h-11">Back</Button>
              <Button onClick={handleSubmit} className="rounded-full px-12 h-11 font-bold gap-2 shadow-xl shadow-primary/20">
                Launch Event <CheckCircle2 className="w-5 h-5" />
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
