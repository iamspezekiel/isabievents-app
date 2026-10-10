
"use client";

import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Send, 
  Users, 
  Sparkles, 
  History, 
  Eye, 
  BarChart3, 
  Loader2, 
  Search,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from '@/lib/api-fetch';

interface Campaign {
  id: string;
  subject: string;
  audience: string;
  sentDate: string;
  recipients: number;
}

export default function AdminNewsletterPage() {
  const [loading, setLoading] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const { toast } = useToast();
  const [history, setHistory] = useState<Campaign[]>([]);
  const [reach, setReach] = useState({users: 0, subscribers: 0});

  const [formData, setFormData] = useState({
    audience: 'all',
    subject: '',
    content: ''
  });

  useEffect(() => {
    apiFetch('/api/newsletter')
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d?.campaigns)) setHistory(d.campaigns as Campaign[]);
        if (d?.reach) setReach(d.reach);
      })
      .catch(() => undefined);
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject || !formData.content) {
      toast({
        variant: "destructive",
        title: "Incomplete Campaign",
        description: "Please provide a subject and content for your newsletter."
      });
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch('/api/newsletter', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Campaign failed.');

      if (data.campaign) setHistory((prev) => [data.campaign as Campaign, ...prev]);
      toast({
        title: "Newsletter Sent",
        description: data.warning
          ? data.warning
          : `Campaign delivered to ${data.campaign?.recipients ?? 0} recipient(s).`,
      });
      setFormData({ audience: 'all', subject: '', content: '' });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Campaign Failed",
        description: err instanceof Error ? err.message : 'Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await apiFetch('/api/newsletter', {
        method: 'DELETE',
        body: JSON.stringify({id}),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Delete failed.');
      setHistory(prev => prev.filter(item => item.id !== id));
      toast({
        title: "Campaign Deleted",
        description: "The newsletter record has been removed from history."
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: err instanceof Error ? err.message : 'Please try again.'
      });
    }
  };

  const handleUseAI = async () => {
    if (!formData.subject) {
      toast({
        variant: "destructive",
        title: "Subject Required",
        description: "Please enter a subject so the AI knows what to write about."
      });
      return;
    }

    setLoadingAI(true);
    // Deterministic auto-draft template (instant — no external AI call).
    setFormData(prev => ({
      ...prev,
      content: `Hello IsabiEvents Community!\n\nWe are excited to share some updates regarding: ${prev.subject}.\n\nIt's a vibrant time for events across Nigeria, and we want to ensure you don't miss out on the latest shared experiences.\n\nStay tuned for more updates and see you at the next event!\n\nBest regards,\nThe IsabiEvents Team`
    }));
    setLoadingAI(false);
    
    toast({
      title: "Draft Generated",
      description: "You can now edit the generated content."
    });
  };

  return (
    <div className="p-4 pb-16 md:p-12 md:pb-16 space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="text-left space-y-1">
          <h1 className="font-headline text-2xl md:text-4xl">Newsletter</h1>
          <p className="text-muted-foreground font-medium">Reach out to your community with announcements and updates.</p>
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Composer */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border bg-card">
            <CardHeader className="text-left">
              <CardTitle className="text-xl flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" /> Compose Campaign
              </CardTitle>
              <CardDescription>Draft and send a message to your users.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSend} className="space-y-6 text-left">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="audience">Target Audience</Label>
                    <Select value={formData.audience} onValueChange={(v) => setFormData({...formData, audience: v})}>
                      <SelectTrigger className="h-11 bg-secondary/30 border-none rounded-xl">
                        <SelectValue placeholder="Select audience" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="attendees">Attendees</SelectItem>
                        <SelectItem value="organizers">Organizers</SelectItem>
                        <SelectItem value="staff">Staff & Vendors</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject Line</Label>
                    <Input 
                      id="subject"
                      placeholder="e.g. Big News for November!"
                      className="h-11 bg-secondary/30 border-none rounded-xl"
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="content">Newsletter Content</Label>
                    <Button 
                      type="button"
                      variant="ghost" 
                      size="sm" 
                      onClick={handleUseAI}
                      disabled={loadingAI}
                      className="text-primary font-bold gap-2 h-8 rounded-full"
                    >
                      {loadingAI ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                      Write with AI
                    </Button>
                  </div>
                  <Textarea 
                    id="content"
                    placeholder="Write your message here..."
                    className="min-h-[250px] bg-secondary/30 border-none rounded-2xl resize-none p-6"
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                  />
                </div>

                <div className="flex gap-4">
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="flex-1 rounded-full h-12 font-bold shadow-xl shadow-primary/20 gap-2"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    Launch Campaign
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Stats & Tips */}
        <div className="space-y-6">
          <Card className="border-border bg-card">
            <CardHeader className="text-left">
              <CardTitle className="text-lg">Audience Insight</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5 text-left">
                  <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Total Reach</p>
                  <p className="text-3xl font-black">{(reach.users + reach.subscribers).toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Registered users</span>
                  <span className="font-bold text-primary">{reach.users.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Newsletter subscribers</span>
                  <span className="font-bold text-green-500">{reach.subscribers.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="text-left">
              <CardTitle className="text-lg">Best Practices</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-left">
              <div className="flex gap-3">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <p className="text-xs text-muted-foreground leading-relaxed">Personalize subject lines to increase open rates by up to 26%.</p>
              </div>
              <div className="flex gap-3">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <p className="text-xs text-muted-foreground leading-relaxed">The best time to send newsletters in Nigeria is Tuesday at 10:00 AM WAT.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* History */}
      <div className="space-y-6 text-left pt-6">
        <h2 className="font-headline text-2xl flex items-center gap-2">
          <History className="w-6 h-6 text-primary" /> Sent Campaigns
        </h2>
        <Card className="border-border bg-card overflow-hidden">
          <CardContent className="p-0 overflow-x-auto">
            <Table className="min-w-[720px]">
              <TableHeader>
                <TableRow className="bg-secondary/20 hover:bg-secondary/20 border-none">
                  <TableHead className="font-black text-[10px] uppercase tracking-widest pl-6 py-4">Subject</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest">Audience</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest">Sent Date</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest">Recipients</TableHead>
                  <TableHead className="text-right pr-6"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((item) => (
                  <TableRow key={item.id} className="group hover:bg-secondary/10 border-border/50">
                    <TableCell className="pl-6 font-bold py-4">{item.subject}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="rounded-md font-bold text-[10px]">{item.audience}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{new Date(item.sentDate).toLocaleDateString('en-NG', { dateStyle: 'medium' })}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-3.5 h-3.5 text-primary" />
                        <span className="font-black text-sm">{item.recipients} sent</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="rounded-full h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-500/5"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
