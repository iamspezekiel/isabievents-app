"use client";

import React, { useState, useEffect } from 'react';
import { Users, Ticket, DollarSign, Calendar, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area } from 'recharts';
import { useEvents } from '@/hooks/use-events';
import { apiFetch } from '@/lib/api-fetch';
import { useAuth } from '@/components/auth-provider';
import type { EventDoc } from '@/lib/db';

/**
 * Organizer analytics — all figures computed from live events + paid orders.
 * Visitors/conversion mock numbers were removed (no tracking data exists).
 */
export default function AnalyticsPage() {
  const { profile } = useAuth();
  const { events: allEvents } = useEvents();
  const [stats, setStats] = useState<Record<string, {sold: number; revenueNgn: number}>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/api/events/stats')
      .then((r) => r.json())
      .then((d) => { if (d && d.stats) setStats(d.stats); })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  const isMine = (e: EventDoc) => {
    if (!profile) return false;
    if (profile.role === 'admin') return true;
    const meta = e as {organizerEmail?: string; organizerUid?: string};
    return meta.organizerEmail === profile.email || meta.organizerUid === profile.uid;
  };
  const myEvents = allEvents.filter(isMine);
  const totalSold = myEvents.reduce((s, e) => s + (stats[e.id]?.sold || 0), 0);
  const totalRevenue = myEvents.reduce((s, e) => s + (stats[e.id]?.revenueNgn || 0), 0);

  const chartData = myEvents
    .map((e) => ({
      name: (e.title || '').length > 14 ? (e.title || '').slice(0, 14) + '…' : e.title,
      value: stats[e.id]?.revenueNgn || 0,
    }))
    .filter((d) => d.value > 0);

  return (
    <div className="p-4 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="text-left">
            <h1 className="font-headline text-3xl md:text-5xl">Detailed Analytics</h1>
            <p className="text-muted-foreground">Real sales performance across your events.</p>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card className="bg-card border-border">
            <CardContent className="p-8 text-left space-y-4">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                 <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-3xl font-black">{myEvents.length}</div>
                <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">Events Listed</div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-8 text-left space-y-4">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                 <Ticket className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-3xl font-black">{loading ? '…' : totalSold.toLocaleString()}</div>
                <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">Tickets Sold</div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-8 text-left space-y-4">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                 <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-3xl font-black break-all">{loading ? '…' : `₦${totalRevenue.toLocaleString()}`}</div>
                <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">Gross Revenue</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-lg text-left">Revenue by Event</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <div className="h-[400px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `₦${v/1000}k`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }}
                      formatter={(v: number) => [`₦${v.toLocaleString()}`, 'Revenue']}
                    />
                    <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.1)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex flex-col items-center justify-center text-center">
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                ) : (
                  <>
                    <Users className="w-10 h-10 text-muted-foreground/30 mb-3" />
                    <p className="text-sm text-muted-foreground font-medium">No sales data yet.</p>
                    <p className="text-xs text-muted-foreground/70">Analytics populate as soon as tickets sell.</p>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
