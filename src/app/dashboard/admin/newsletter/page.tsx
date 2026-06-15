
"use client";

import React, { useState } from 'react';
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

const INITIAL_HISTORY = [
  { id: 'NSL-001', subject: 'Lagos Jazz Night 2026 - Early Bird Access', audience: 'All Users', sentDate: '2024-10-20', openRate: '42%' },
  { id: 'NSL-002', subject: 'New Guidelines for Organizers', audience: 'Organizers', sentDate: '2024-10-15', openRate: '68%' },
  { id: 'NSL-003', subject: 'Exclusive: Naija Tech Summit Speakers', audience: 'Attendees', sentDate: '2024-10-10', openRate: '35%' },
];

export default function AdminNewsletterPage() {
  const [loading, setLoading] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const { toast } = useToast();
  const [history, setHistory] = useState(INITIAL_HISTORY);

  const [formData, setFormData] = useState({
    audience: 'all',
    subject: '',
    content: ''
  });

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
    await new Promise(r => setTimeout(r, 2000));
    
    const newEntry = {
      id: `NSL-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      subject: formData.subject,
      audience: formData.audience === 'all' ? 'All Users' : formData.audience.charAt(0).toUpperCase() + formData.audience.slice(1),
      sentDate: new Date().toISOString().split('T')[0],
      openRate: '0%' // New campaigns start at 0%
    };

    setHistory([newEntry, ...history]);
    setLoading(false);
    
    toast({
      title: "Newsletter Sent",
      description: `Your campaign has been queued for ${formData.audience} users.`,
    });
    setFormData({ audience: 'all', subject: '', content: '' });
  };

  const handleDelete = (id: string) => {
    setHistory(history.filter(item => item.id !== id));
    toast({
      title: "Campaign Deleted",
      description: "The newsletter record has been removed from history."
    });
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
    // Simulation of AI content generation
    await new Promise(r => setTimeout(r, 1500));
    setLoadingAI(false);
    
    setFormData({
      ...formData,
      content: `Hello IsabiEvents Community!\n\nWe are excited to share some updates regarding: ${formData.subject}.\n\nIt's a vibrant time for events across Nigeria, and we want to ensure you don't miss out on the latest shared experiences.\n\nStay tuned for more updates and see you at the next event!\n\nBest regards,\nThe IsabiEvents Team`
    });

    toast({
      title: "AI Draft Generated",
      description: "You can now edit the generated content."
    });
  };

  return (
    <div className="p-4 md:p-12 space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="text-left space-y-1">
          <h1 className="font-headline text-3xl md:text-5xl">Newsletter</h1>
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
                        <SelectItem value="all">All Users (50,000+)</SelectItem>
                        <SelectItem value="attendees">Attendees (48,000+)</SelectItem>
                        <SelectItem value="organizers">Organizers (1,200+)</SelectItem>
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
                  <Button type="button" variant="outline" className="rounded-full h-12 px-8 border-2">Save Draft</Button>
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
                  <p className="text-3xl font-black">52,402</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Email Deliverability</span>
                  <span className="font-bold text-green-500">99.2%</span>
                </div>
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 w-[99%]" />
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
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/20 hover:bg-secondary/20 border-none">
                  <TableHead className="font-black text-[10px] uppercase tracking-widest pl-6 py-4">Subject</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest">Audience</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest">Sent Date</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest">Open Rate</TableHead>
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
                        <span className="font-black text-sm">{item.openRate}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" className="rounded-full h-8 w-8"><Eye className="w-4 h-4" /></Button>
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
