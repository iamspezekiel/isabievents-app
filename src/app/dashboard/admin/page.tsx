
"use client";

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Ticket, 
  ShieldCheck, 
  Search, 
  DollarSign, 
  CheckCircle2, 
  Activity,
  AlertTriangle,
  Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import Link from 'next/link';
import { useEvents } from '@/hooks/use-events';
import { apiFetch } from '@/lib/api-fetch';
import { useToast } from "@/hooks/use-toast";

interface Stats {
  revenueNgn: number;
  users: number;
  events: number;
  paidOrders: number;
  pendingHosts: number;
  series: {name: string; revenue: number}[];
}

export default function AdminDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const {events, refetch} = useEvents({includeHidden: true});
  const [stats, setStats] = useState<Stats | null>(null);
  const [resolvedIds, setResolvedIds] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    apiFetch('/api/admin/stats')
      .then((r) => r.json())
      .then((d) => {
        if (d && !d.error) setStats(d as Stats);
      })
      .catch(() => undefined);
  }, []);

  // Approve/Reject straight from the overview — same API as Event Moderation.
  const handleModerate = async (id: string, title: string, action: 'approve' | 'reject') => {
    try {
      const res = await apiFetch('/api/admin/events', {
        method: 'PATCH',
        body: JSON.stringify({id, action}),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Action failed.');
      setResolvedIds((prev) => [...prev, id]);
      refetch();
      toast({
        title: action === 'approve' ? 'Event Approved' : 'Event Rejected',
        description: action === 'approve'
          ? `"${title}" is now live on the marketplace.`
          : `"${title}" has been removed from the platform.`,
      });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Action Failed',
        description: err instanceof Error ? err.message : 'Please try again.',
      });
    }
  };

  // Real moderation queue: hosts that are not verified yet.
  const moderationQueue = events.filter(event => {
    const matchesSearch = !searchQuery || 
                         event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (event.organizer?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    return !event.organizer?.verified && matchesSearch && !resolvedIds.includes(event.id);
  });

  return (
    <div className="p-4 pb-16 md:p-12 md:pb-16 space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="text-left space-y-1">
          <h1 className="font-headline text-2xl md:text-4xl">Global Console</h1>
          <p className="text-muted-foreground font-medium">Real-time platform performance across Nigeria.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Global search..." 
              className="pl-9 h-11 w-64 bg-card rounded-full" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Link href="/dashboard/admin/reports" className="no-underline">
            <Button className="rounded-full shadow-lg shadow-primary/20 h-11 font-bold">Generate Report</Button>
          </Link>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminStatCard label="Total Revenue" value={`₦${(stats?.revenueNgn ?? 0).toLocaleString()}`} icon={DollarSign} trend={`${stats?.paidOrders ?? 0} paid orders`} color="primary" />
        <AdminStatCard label="Active Users" value={(stats?.users ?? 0).toLocaleString()} icon={Users} trend="Registered accounts" color="accent" />
        <AdminStatCard label="Live Events" value={(stats?.events ?? 0).toLocaleString()} icon={Ticket} trend="Listed on platform" color="primary" />
        <AdminStatCard label="Hosts Pending" value={(stats?.pendingHosts ?? 0).toLocaleString()} icon={ShieldCheck} trend={stats?.pendingHosts ? 'Action Required' : 'All clear'} color={stats?.pendingHosts ? 'destructive' : 'primary'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2 border-border bg-card">
          <CardHeader className="text-left">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" /> Platform GTV (7 Days)
            </CardTitle>
            <CardDescription>Gross Transaction Volume processed platform-wide.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.series ?? []}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₦${v/1000}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }}
                    itemStyle={{ color: 'hsl(var(--primary))' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Platform Activity */}
        <Card className="border-border bg-card">
          <CardHeader className="text-left">
            <CardTitle className="text-lg">Critical Activity</CardTitle>
            <CardDescription>Events requiring moderation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {events.filter((e) => !e.organizer?.verified).slice(0, 3).map((event) => (
              <ActivityItem
                key={event.id}
                title="Host awaiting review"
                desc={event.title}
                type="warning"
                time="pending"
              />
            ))}
            {events.filter((e) => !e.organizer?.verified).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">Nothing critical right now.</p>
            )}
            <Link href="/dashboard/admin/events">
              <Button variant="ghost" className="w-full text-primary hover:text-primary/80 font-bold h-11">View All Alerts</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Event Moderation List */}
      <div className="space-y-6 text-left">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <h2 className="font-headline text-xl">Event Moderation Queue</h2>
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-lg border border-border">
              <Info className="w-3.5 h-3.5 text-primary" />
              <span>All new events go live immediately. Use Approve/Reject here to moderate - rejected events are hidden from the marketplace until approved again.</span>
            </div>
          </div>
          <Link href="/dashboard/admin/events" className="text-sm font-bold text-primary hover:underline">Manage All</Link>
        </div>
        
        <div className="grid gap-4">
          {moderationQueue.length > 0 ? moderationQueue.slice(0, 5).map((event) => (
            <div key={event.id} className="bg-card border border-border p-5 rounded-2xl flex items-center justify-between group hover:border-primary/30 transition-all">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0">
                  <img src={event.image} alt="" className="object-cover w-full h-full" />
                </div>
                <div className="space-y-1">
                  <div className="font-bold flex items-center gap-2">
                    {event.title}
                    <Badge variant="outline" className="text-[9px] uppercase">{event.category}</Badge>
                    <Badge className="bg-yellow-500/10 text-yellow-600 border-none text-[8px] font-black uppercase">Unverified Host</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Organizer: <span className="text-foreground font-medium">{event.organizer?.name || '—'}</span> · Venue: {event.venue}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full gap-2 border-green-500/20 text-green-500 hover:bg-green-500/5"
                  onClick={() => handleModerate(event.id, event.title, 'approve')}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full gap-2 border-red-500/20 text-red-500 hover:bg-red-500/5"
                  onClick={() => handleModerate(event.id, event.title, 'reject')}
                >
                  <AlertTriangle className="w-3.5 h-3.5" /> Reject
                </Button>
                <Link href={`/dashboard/admin/events?id=${event.id}`} title="View Moderation Details">
                  <Button variant="ghost" size="icon" className="rounded-full"><CheckCircle2 className="w-4 h-4 opacity-0" /></Button>
                </Link>
              </div>
            </div>
          )) : (
            <div className="bg-card border border-dashed border-border py-12 rounded-[2rem] text-center">
              <CheckCircle2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground font-medium">Moderation queue is empty.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AdminStatCard({ label, value, icon: Icon, trend, color }: any) {
  return (
    <Card className="bg-card border-border hover:border-primary/20 transition-all cursor-default">
      <CardContent className="p-6 text-left">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-2 rounded-lg ${color === 'destructive' ? 'bg-red-500/10' : 'bg-primary/10'}`}>
            <Icon className={`w-5 h-5 ${color === 'destructive' ? 'text-red-500' : 'text-primary'}`} />
          </div>
          <span className={`text-[10px] font-black uppercase tracking-tighter ${color === 'destructive' ? 'text-red-500' : 'text-green-500'}`}>
            {trend}
          </span>
        </div>
        <div className="text-2xl md:text-3xl font-black mb-0.5">{value}</div>
        <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">{label}</div>
      </CardContent>
    </Card>
  );
}

function ActivityItem({ title, desc, type, time }: any) {
  const iconBg = type === 'warning' ? 'bg-red-500/10' : type === 'success' ? 'bg-green-500/10' : 'bg-primary/10';
  const iconColor = type === 'warning' ? 'text-red-500' : type === 'success' ? 'text-green-500' : 'text-primary';
  const Icon = type === 'warning' ? AlertTriangle : type === 'success' ? CheckCircle2 : ShieldCheck;

  return (
    <div className="flex items-start gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div className="flex-1 text-left min-w-0">
        <div className="flex justify-between items-start">
          <h4 className="font-bold text-sm truncate">{title}</h4>
          <span className="text-[9px] text-muted-foreground uppercase font-bold">{time}</span>
        </div>
        <p className="text-xs text-muted-foreground truncate">{desc}</p>
      </div>
    </div>
  );
}
