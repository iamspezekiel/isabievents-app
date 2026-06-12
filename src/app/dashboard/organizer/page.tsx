
"use client";

import React from 'react';
import { LayoutDashboard, Plus, Users, Ticket, BarChart3, Settings, LogOut, TrendingUp, DollarSign, MousePointerClick, RefreshCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Logo } from '@/components/logo';
import Link from 'next/link';

const salesData = [
  { day: 'Mon', sales: 45000 },
  { day: 'Tue', sales: 52000 },
  { day: 'Wed', sales: 38000 },
  { day: 'Thu', sales: 65000 },
  { day: 'Fri', sales: 82000 },
  { day: 'Sat', sales: 120000 },
  { day: 'Sun', sales: 95000 },
];

export default function OrganizerDashboard() {
  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row pt-24">
      {/* Side Navigation */}
      <aside className="w-full md:w-64 bg-sidebar border-r border-sidebar-border p-6 flex flex-col hidden md:flex">
        <Link href="/" className="mb-10 block">
          <Logo size="sm" />
        </Link>

        <nav className="flex-1 space-y-2">
          <SidebarLink icon={LayoutDashboard} label="Dashboard" active />
          <SidebarLink icon={Plus} label="Create Event" href="/dashboard/organizer/create" />
          <SidebarLink icon={Ticket} label="My Events" />
          <SidebarLink icon={Users} label="Vendors" />
          <SidebarLink icon={BarChart3} label="Analytics" />
          <SidebarLink icon={Settings} label="Settings" />
        </nav>

        <div className="pt-6 border-t border-sidebar-border mt-auto">
          <SidebarLink icon={LogOut} label="Log Out" />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-12 overflow-auto">
        <div className="max-w-6xl mx-auto space-y-8">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="font-headline text-3xl mb-1">Organizer Overview</h1>
              <p className="text-muted-foreground text-sm flex items-center gap-2">
                <Badge className="bg-accent/20 text-accent border-none">Verified Merchant</Badge>
                Account Health: 98%
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" className="rounded-full gap-2">
                <RefreshCcw className="w-4 h-4" /> Refresh
              </Button>
              <Link href="/dashboard/organizer/create">
                <Button className="rounded-full gap-2 px-6">
                  <Plus className="w-4 h-4" /> New Event
                </Button>
              </Link>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <AnalyticCard label="Total Revenue" value="₦1,240,000" icon={DollarSign} trend="+12.5%" />
            <AnalyticCard label="Tickets Sold" value="482" icon={Ticket} trend="+5.2%" />
            <AnalyticCard label="Conv. Rate" value="3.8%" icon={TrendingUp} trend="+0.4%" />
            <AnalyticCard label="Page Views" value="12,402" icon={MousePointerClick} trend="-2.1%" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2 border-border bg-card">
              <CardHeader>
                <CardTitle className="text-lg font-headline">Weekly Revenue Flow</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full mt-4">
                   <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2a2a3c" />
                      <XAxis dataKey="day" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₦${v/1000}k`} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1c1c2b', border: '1px solid #2a2a3c', borderRadius: '12px' }}
                        itemStyle={{ color: '#7E7CFF' }}
                      />
                      <Bar dataKey="sales" fill="#7E7CFF" radius={[6, 6, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-lg font-headline">Recent Payouts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <PayoutItem date="24 Oct 2024" amount="₦450,000" status="COMPLETED" />
                <PayoutItem date="18 Oct 2024" amount="₦210,000" status="COMPLETED" />
                <PayoutItem date="12 Oct 2024" amount="₦580,000" status="COMPLETED" />
                <Button variant="ghost" className="w-full text-primary hover:text-primary/80">View Statement</Button>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
             <h2 className="font-headline text-xl">Active Events</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <EventStatusCard title="Lagos Jazz Night" sold={420} total={500} revenue={2100000} />
               <EventStatusCard title="Naija Tech Summit" sold={62} total={1200} revenue={930000} />
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function SidebarLink({ icon: Icon, label, active, href = "#" }: any) {
  return (
    <Link href={href} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${active ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-secondary hover:text-white'}`}>
      <Icon className="w-5 h-5" />
      {label}
    </Link>
  );
}

function AnalyticCard({ label, value, icon: Icon, trend }: any) {
  const isUp = trend.startsWith('+');
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-secondary rounded-lg">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <span className={`text-xs font-bold ${isUp ? 'text-green-500' : 'text-red-500'}`}>{trend}</span>
        </div>
        <div className="text-2xl font-bold mb-1">{value}</div>
        <div className="text-xs text-muted-foreground uppercase tracking-wider font-bold">{label}</div>
      </CardContent>
    </Card>
  );
}

function PayoutItem({ date, amount, status }: any) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="text-sm font-medium">{amount}</div>
        <div className="text-xs text-muted-foreground">{date}</div>
      </div>
      <Badge className="bg-green-500/10 text-green-500 border-none text-[10px]">{status}</Badge>
    </div>
  );
}

function EventStatusCard({ title, sold, total, revenue }: any) {
  const percent = Math.floor((sold / total) * 100);
  return (
    <Card className="bg-card border-border overflow-hidden">
      <CardContent className="p-6 space-y-4">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-lg">{title}</h3>
          <Button variant="ghost" size="sm">Edit</Button>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-muted-foreground">Sales Progress</span>
            <span>{sold} / {total} Tickets</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-primary" style={{ width: `${percent}%` }} />
          </div>
        </div>
        <div className="flex justify-between items-center pt-2">
          <div className="text-xs text-muted-foreground">Gross Revenue</div>
          <div className="font-bold text-lg text-primary">₦{revenue.toLocaleString()}</div>
        </div>
      </CardContent>
    </Card>
  );
}
