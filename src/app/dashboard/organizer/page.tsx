"use client";

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Ticket, 
  TrendingUp,
  DollarSign,
  Calendar,
  RefreshCcw,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import Link from 'next/link';
import { useToast } from "@/hooks/use-toast";
import { useEvents } from '@/hooks/use-events';
import { apiFetch } from '@/lib/api-fetch';
import { useAuth } from '@/components/auth-provider';
import type { EventDoc } from '@/lib/db';

/**
 * Organizer dashboard — every number on this page is computed from live
 * Firestore data (events + paid orders). No hardcoded/demo values.
 */
export default function OrganizerDashboard() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showTrustTip, setShowTrustTip] = useState(true);
  const { toast } = useToast();
  const { profile } = useAuth();
  const { events: allEvents, refetch } = useEvents();
  const [stats, setStats] = useState<Record<string, {sold: number; revenueNgn: number}>>({});
  const [statsLoaded, setStatsLoaded] = useState(false);

  const loadStats = () =>
    apiFetch('/api/events/stats')
      .then((r) => r.json())
      .then((d) => {
        if (d && d.stats) setStats(d.stats);
      })
      .catch(() => undefined)
      .finally(() => setStatsLoaded(true));

  useEffect(() => {
    loadStats();
  }, []);

  // Owners: admins see every event; organizers see what they created.
  const isMine = (e: EventDoc) => {
    if (!profile) return false;
    if (profile.role === 'admin') return true;
    const meta = e as {organizerEmail?: string; organizerUid?: string};
    return meta.organizerEmail === profile.email || meta.organizerUid === profile.uid;
  };

  const myEvents = allEvents.filter(isMine);
  const now = Date.now();
  const upcoming = myEvents
    .filter((e) => new Date(e.date).getTime() >= now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const totalRevenue = myEvents.reduce((sum, e) => sum + (stats[e.id]?.revenueNgn || 0), 0);
  const totalSold = myEvents.reduce((sum, e) => sum + (stats[e.id]?.sold || 0), 0);

  // Revenue chart: one bar per event (real paid-order revenue).
  const chartData = myEvents
    .map((e) => ({
      day: (e.title || '').length > 12 ? (e.title || '').slice(0, 12) + '…' : e.title,
      sales: stats[e.id]?.revenueNgn || 0,
    }))
    .filter((d) => d.sales > 0)
    .slice(0, 7);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refetch(), loadStats()]);
    setIsRefreshing(false);
    toast({
      title: "Dashboard Refreshed",
      description: "You're viewing the most up-to-date sales data.",
    });
  };

  return (
    <div className="p-4 md:p-12 space-y-8">
      {showTrustTip && (
        <div className="bg-primary/10 border border-primary/20 p-4 px-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
            <p className="text-xs font-medium text-left">Get a verified badge and unlock faster payouts by completing your KYC profile.</p>
          </div>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <Link href="/dashboard/organizer/kyc" className="no-underline flex-1 sm:flex-none">
              <Button size="sm" variant="link" className="text-primary font-bold h-auto p-0">Verify Now <ArrowRight className="w-3 h-3 ml-1" /></Button>
            </Link>
            <button onClick={() => setShowTrustTip(false)} className="text-[10px] font-bold text-muted-foreground hover:text-foreground uppercase tracking-widest">Later</button>
          </div>
        </div>
      )}

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="text-left space-y-2">
          <h1 className="font-headline text-3xl md:text-5xl flex items-center gap-3 break-all">
            {profile?.name || 'Organizer'}
            <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8 text-accent fill-accent text-white shrink-0" />
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            className="rounded-full gap-2 h-11 font-bold"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Link href="/dashboard/organizer/create" className="no-underline">
            <Button className="rounded-full gap-2 px-6 h-11 shadow-lg shadow-primary/20 font-bold">
              <Plus className="w-4 h-4" /> New Event
            </Button>
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <AnalyticCard label="Total Revenue" value={`₦${totalRevenue.toLocaleString()}`} icon={DollarSign} />
        <AnalyticCard label="Tickets Sold" value={totalSold.toLocaleString()} icon={Ticket} />
        <AnalyticCard label="Upcoming Events" value={upcoming.length.toLocaleString()} icon={Calendar} />
        <AnalyticCard label="Events Listed" value={myEvents.length.toLocaleString()} icon={TrendingUp} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-headline text-left">Revenue by Event</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <div className="h-[300px] w-full mt-4">
                 <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₦${v/1000}k`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }}
                      itemStyle={{ color: 'hsl(var(--primary))' }}
                    />
                    <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex flex-col items-center justify-center text-center">
                {!statsLoaded ? (
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                ) : (
                  <>
                    <DollarSign className="w-10 h-10 text-muted-foreground/30 mb-3" />
                    <p className="text-sm text-muted-foreground font-medium">No paid tickets yet.</p>
                    <p className="text-xs text-muted-foreground/70">Revenue appears here once attendees start buying.</p>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-headline text-left">Payouts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-left">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Settlements run automatically <span className="font-bold text-foreground">48 hours after each event</span>,
              straight to your registered bank account.
            </p>
            <p className="text-xs text-muted-foreground/80">
              Complete KYC verification to enable payouts.
            </p>
            <Link href="/dashboard/organizer/kyc" className="no-underline">
              <Button variant="outline" className="w-full text-primary hover:text-primary/80 font-bold h-11 rounded-full">
                Complete KYC
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
         <h2 className="font-headline text-xl text-left">Upcoming Events</h2>
         {upcoming.length > 0 ? (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
             {upcoming.slice(0, 4).map((event) => (
               <EventStatusCard
                 key={event.id}
                 id={event.id}
                 title={event.title}
                 sold={stats[event.id]?.sold || 0}
                 total={event.inventory || 0}
                 revenue={stats[event.id]?.revenueNgn || 0}
               />
             ))}
           </div>
         ) : (
           <div className="bg-card border border-dashed border-border py-16 rounded-[2rem] text-center">
             <Calendar className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
             <p className="text-muted-foreground font-medium">No upcoming events yet.</p>
             <Link href="/dashboard/organizer/create" className="no-underline">
               <Button className="mt-4 rounded-full font-bold gap-2">
                 <Plus className="w-4 h-4" /> Create Your First Event
               </Button>
             </Link>
           </div>
         )}
      </div>
    </div>
  );
}

function AnalyticCard({ label, value, icon: Icon, trend }: {label: string; value: string; icon: any; trend?: string}) {
  const isUp = trend?.startsWith('+');
  return (
    <Card className="bg-card border-border shadow-sm">
      <CardContent className="p-6 text-left">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-secondary rounded-lg">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          {trend && (
            <span className={`text-xs font-black ${isUp ? 'text-green-500' : 'text-red-500'}`}>{trend}</span>
          )}
        </div>
        <div className="text-2xl font-black mb-1 break-all">{value}</div>
        <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">{label}</div>
      </CardContent>
    </Card>
  );
}

function EventStatusCard({ id, title, sold, total, revenue }: {
  id: string; title: string; sold: number; total: number; revenue: number;
}) {
  const percent = total > 0 ? Math.min(100, Math.floor((sold / total) * 100)) : 0;
  return (
    <Card className="bg-card border-border shadow-sm overflow-hidden">
      <CardContent className="p-6 space-y-4">
        <div className="flex justify-between items-start gap-3">
          <h3 className="font-bold text-lg break-words">{title}</h3>
          <Link href={`/dashboard/organizer/create?id=${id}`} className="no-underline shrink-0">
            <Button variant="ghost" size="sm" className="font-bold h-9">Edit</Button>
          </Link>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-[10px] font-black uppercase tracking-wider">
            <span className="text-muted-foreground">Sales Progress</span>
            <span>{sold} / {total > 0 ? total : '—'} Tickets</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all" style={{ width: `${percent}%` }} />
          </div>
        </div>
        <div className="flex justify-between items-center pt-2">
          <div className="text-[10px] text-muted-foreground uppercase font-black">Gross Revenue</div>
          <div className="font-black text-lg text-primary">₦{revenue.toLocaleString()}</div>
        </div>
      </CardContent>
    </Card>
  );
}
