"use client";

import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Plus, 
  Users, 
  Ticket, 
  BarChart3, 
  Settings, 
  LogOut, 
  TrendingUp, 
  DollarSign, 
  MousePointerClick, 
  RefreshCcw,
  Menu,
  ShieldCheck,
  User,
  Smartphone
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Logo } from '@/components/logo';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const NavigationLinks = () => (
    <nav className="flex-1 space-y-1">
      <div className="pb-2">
        <SidebarLink icon={LayoutDashboard} label="Dashboard" active />
        <SidebarLink icon={Plus} label="Create Event" href="/dashboard/organizer/create" />
        <SidebarLink icon={Ticket} label="My Events" />
        <SidebarLink icon={Users} label="Vendors" />
        <SidebarLink icon={BarChart3} label="Analytics" />
        <SidebarLink icon={Settings} label="Settings" />
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row pt-48">
      {/* Desktop Side Navigation */}
      <aside className="w-64 bg-sidebar border-r border-sidebar-border p-6 flex flex-col hidden md:flex sticky top-0 h-screen overflow-y-auto">
        <Link href="/" className="mb-10 block">
          <Logo size="sm" />
        </Link>
        <NavigationLinks />
        <div className="pt-6 border-t border-sidebar-border mt-auto">
          <SidebarLink icon={LogOut} label="Log Out" href="/login" />
        </div>
      </aside>

      {/* Mobile Header with Menu Trigger */}
      <header className="md:hidden flex items-center justify-between p-4 bg-card border-b border-border sticky top-0 z-40">
        <Logo size="sm" />
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 bg-card border-border p-6 flex flex-col overflow-y-auto">
            <div className="mb-10">
              <Logo size="sm" />
            </div>
            <NavigationLinks />
            <div className="pt-6 border-t border-border mt-auto">
              <SidebarLink icon={LogOut} label="Log Out" href="/login" />
            </div>
          </SheetContent>
        </Sheet>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-12 overflow-x-hidden">
        <div className="max-w-6xl mx-auto space-y-8">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="text-left">
              <h1 className="font-headline text-3xl mb-2">Organizer Overview</h1>
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-accent/20 text-accent border-none font-bold">Verified Merchant</Badge>
                <span className="text-muted-foreground text-xs font-medium bg-secondary/50 px-2 py-0.5 rounded-full">Account Health: 98%</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="rounded-full gap-2 h-11">
                <RefreshCcw className="w-4 h-4" /> <span className="hidden sm:inline">Refresh</span>
              </Button>
              <Link href="/dashboard/organizer/create">
                <Button className="rounded-full gap-2 px-6 h-11 shadow-lg shadow-primary/20 font-bold">
                  <Plus className="w-4 h-4" /> New Event
                </Button>
              </Link>
            </div>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <AnalyticCard label="Total Revenue" value="₦1,240,000" icon={DollarSign} trend="+12.5%" />
            <AnalyticCard label="Tickets Sold" value="482" icon={Ticket} trend="+5.2%" />
            <AnalyticCard label="Conv. Rate" value="3.8%" icon={TrendingUp} trend="+0.4%" />
            <AnalyticCard label="Page Views" value="12,402" icon={MousePointerClick} trend="-2.1%" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2 border-border bg-card shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-headline text-left">Weekly Revenue Flow</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full mt-4">
                   <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={salesData}>
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
              </CardContent>
            </Card>

            <Card className="border-border bg-card shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-headline text-left">Recent Payouts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <PayoutItem date="24 Oct 2024" amount="₦450,000" status="COMPLETED" />
                <PayoutItem date="18 Oct 2024" amount="₦210,000" status="COMPLETED" />
                <PayoutItem date="12 Oct 2024" amount="₦580,000" status="COMPLETED" />
                <Button variant="ghost" className="w-full text-primary hover:text-primary/80 font-bold">View Statement</Button>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
             <h2 className="font-headline text-xl text-left">Active Events</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
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
    <Link 
      href={href} 
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-bold ${
        active 
          ? 'bg-primary text-white shadow-lg shadow-primary/20' 
          : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
      }`}
    >
      <Icon className="w-5 h-5 shrink-0" />
      <span>{label}</span>
    </Link>
  );
}

function AnalyticCard({ label, value, icon: Icon, trend }: any) {
  const isUp = trend.startsWith('+');
  return (
    <Card className="bg-card border-border shadow-sm">
      <CardContent className="p-6 text-left">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-secondary rounded-lg">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <span className={`text-xs font-black ${isUp ? 'text-green-500' : 'text-red-500'}`}>{trend}</span>
        </div>
        <div className="text-2xl font-black mb-1">{value}</div>
        <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">{label}</div>
      </CardContent>
    </Card>
  );
}

function PayoutItem({ date, amount, status }: any) {
  return (
    <div className="flex items-center justify-between">
      <div className="text-left">
        <div className="text-sm font-bold">{amount}</div>
        <div className="text-xs text-muted-foreground">{date}</div>
      </div>
      <Badge className="bg-green-500/10 text-green-500 border-none text-[10px] font-bold">{status}</Badge>
    </div>
  );
}

function EventStatusCard({ title, sold, total, revenue }: any) {
  const percent = Math.floor((sold / total) * 100);
  return (
    <Card className="bg-card border-border shadow-sm overflow-hidden">
      <CardContent className="p-6 space-y-4">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-lg">{title}</h3>
          <Button variant="ghost" size="sm" className="font-bold">Edit</Button>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-[10px] font-black uppercase tracking-wider">
            <span className="text-muted-foreground">Sales Progress</span>
            <span>{sold} / {total} Tickets</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-primary" style={{ width: `${percent}%` }} />
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