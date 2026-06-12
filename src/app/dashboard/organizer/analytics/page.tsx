"use client";

import React from 'react';
import { BarChart3, TrendingUp, Users, DollarSign, Calendar, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area } from 'recharts';
import Link from 'next/link';
import { Logo } from '@/components/logo';
import { SidebarLink } from '../page';

const data = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 600 },
  { name: 'Apr', value: 800 },
  { name: 'May', value: 500 },
  { name: 'Jun', value: 900 },
];

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row pt-32">
      <aside className="w-64 bg-sidebar border-r border-sidebar-border p-6 flex flex-col hidden md:flex sticky top-0 h-screen">
        <Link href="/" className="mb-10 block"><Logo size="sm" /></Link>
        <nav className="flex-1 space-y-1">
          <SidebarLink icon={BarChart3} label="Analytics" href="/dashboard/organizer/analytics" active />
          <Button variant="ghost" size="sm" className="w-full justify-start text-xs font-bold text-muted-foreground hover:text-primary mt-4 px-4" asChild>
            <Link href="/dashboard/organizer">← Back to Overview</Link>
          </Button>
        </nav>
      </aside>

      <main className="flex-1 p-4 md:p-12">
        <div className="max-w-6xl mx-auto space-y-8">
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="text-left">
              <h1 className="font-headline text-3xl mb-2">Detailed Analytics</h1>
              <p className="text-muted-foreground">Deep dive into your audience and sales performance.</p>
            </div>
            <Button variant="outline" className="rounded-full">Export PDF</Button>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-card border-border">
              <CardContent className="p-8 text-left space-y-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                   <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-3xl font-black">2.4k</div>
                  <div className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Total Unique Visitors</div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-8 text-left space-y-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                   <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-3xl font-black">15.2%</div>
                  <div className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Avg. Growth Rate</div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-8 text-left space-y-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                   <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-3xl font-black">Lagos</div>
                  <div className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Top Performing City</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border bg-card">
            <CardHeader className="text-left">
              <CardTitle className="text-lg">Growth Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }}
                      itemStyle={{ color: 'hsl(var(--primary))' }}
                    />
                    <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorValue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}