
"use client";

import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Ticket, 
  BarChart3, 
  Settings, 
  LogOut, 
  ShieldCheck, 
  Globe, 
  AlertTriangle, 
  Search, 
  Menu, 
  TrendingUp, 
  DollarSign, 
  CheckCircle2, 
  ChevronRight,
  UserCheck,
  Ban,
  Activity,
  Info,
  Bell
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Logo } from '@/components/logo';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MOCK_EVENTS } from '@/lib/mock-data';

const performanceData = [
  { name: 'Mon', revenue: 450000 },
  { name: 'Tue', revenue: 520000 },
  { name: 'Wed', revenue: 380000 },
  { name: 'Thu', revenue: 650000 },
  { name: 'Fri', revenue: 820000 },
  { name: 'Sat', revenue: 1200000 },
  { name: 'Sun', revenue: 950000 },
];

export default function AdminDashboard() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const pathname = usePathname();

  // Logic: Auto-approve verified organizers. Only show unverified ones in the queue.
  const moderationQueue = MOCK_EVENTS.filter(event => {
    const matchesSearch = !searchQuery || 
                         event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.organizer.name.toLowerCase().includes(searchQuery.toLowerCase());
    return !event.organizer.verified && matchesSearch;
  });

  const NavigationLinks = () => (
    <nav className="flex-1 space-y-1">
      <div className="pb-2">
        <SidebarLink icon={LayoutDashboard} label="Global Overview" href="/dashboard/admin" active={pathname === '/dashboard/admin'} />
        <SidebarLink icon={Users} label="User Management" href="/dashboard/admin/users" active={pathname === '/dashboard/admin/users'} />
        <SidebarLink icon={ShieldCheck} label="Organizer KYC" href="/dashboard/admin/kyc" active={pathname === '/dashboard/admin/kyc'} />
        <SidebarLink icon={Ticket} label="Event Moderation" href="/dashboard/admin/events" active={pathname === '/dashboard/admin/events'} />
        <SidebarLink icon={BarChart3} label="Financial Reports" href="/dashboard/admin/reports" active={pathname === '/dashboard/admin/reports'} />
        <SidebarLink icon={Settings} label="System Settings" href="/dashboard/admin/settings" active={pathname === '/dashboard/admin/settings'} />
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row pt-40">
      {/* Desktop Side Navigation */}
      <aside className="w-64 bg-sidebar border-r border-sidebar-border p-6 flex flex-col hidden md:flex sticky top-0 h-screen overflow-y-auto">
        <div className="mb-10">
          <Link href="/dashboard/admin" className="no-underline">
            <Logo size="sm" />
          </Link>
          <div className="mt-2 text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-1 rounded inline-block">
            Master Console
          </div>
        </div>
        <NavigationLinks />
        <div className="pt-6 border-t border-sidebar-border mt-auto">
          <SidebarLink icon={LogOut} label="Log Out" href="/login" />
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 bg-card border-b border-border sticky top-0 z-40">
        <Link href="/dashboard/admin" className="no-underline">
          <Logo size="sm" />
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-full relative" asChild title="Notifications">
            <Link href="/dashboard/attendee/notifications">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-background" />
            </Link>
          </Button>
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 bg-card border-border p-6 flex flex-col overflow-y-auto">
              <SheetHeader className="text-left mb-10">
                <SheetTitle>
                  <Link href="/dashboard/admin" className="no-underline" onClick={() => setIsMobileMenuOpen(false)}>
                    <Logo size="sm" />
                  </Link>
                </SheetTitle>
              </SheetHeader>
              <NavigationLinks />
              <div className="pt-6 border-t border-border mt-auto">
                <SidebarLink icon={LogOut} label="Log Out" href="/login" />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-12 overflow-x-hidden">
        <div className="max-w-6xl mx-auto space-y-8">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="text-left space-y-1">
              <h1 className="font-headline text-3xl md:text-5xl">Global Console</h1>
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
              <Button className="rounded-full shadow-lg shadow-primary/20 h-11 font-bold">Generate Report</Button>
            </div>
          </header>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <AdminStatCard label="Total Revenue" value="₦24,840,000" icon={DollarSign} trend="+18% WoW" color="primary" />
            <AdminStatCard label="Active Users" value="52,402" icon={Users} trend="+1,200 New" color="accent" />
            <AdminStatCard label="Live Events" value="1,248" icon={Ticket} trend="+42 Today" color="primary" />
            <AdminStatCard label="KYC Pending" value="18" icon={ShieldCheck} trend="Action Required" color="destructive" />
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
                    <AreaChart data={performanceData}>
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
                <ActivityItem 
                  title="Flagged Event" 
                  desc="Gidi Vibes Party - Lagos" 
                  type="warning" 
                  time="2m ago" 
                />
                <ActivityItem 
                  title="Large Payout" 
                  desc="₦4.2M - Smooth Events" 
                  type="info" 
                  time="15m ago" 
                />
                <ActivityItem 
                  title="KYC Submission" 
                  desc="Startup Kano Hub" 
                  type="success" 
                  time="1h ago" 
                />
                <Button variant="ghost" className="w-full text-primary hover:text-primary/80 font-bold h-11">View All Alerts</Button>
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
                  <span>Verified KYC Organizers bypass moderation and are auto-approved.</span>
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
                        Organizer: <span className="text-foreground font-medium">{event.organizer.name}</span> · Venue: {event.venue}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" className="rounded-full gap-2 border-green-500/20 text-green-500 hover:bg-green-500/5">
                      <UserCheck className="w-3.5 h-3.5" /> Approve
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-full gap-2 border-red-500/20 text-red-500 hover:bg-red-500/5">
                      <Ban className="w-3.5 h-3.5" /> Reject
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-full"><ChevronRight className="w-4 h-4" /></Button>
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
      </main>
    </div>
  );
}

export function SidebarLink({ icon: Icon, label, active, href = "#" }: any) {
  return (
    <Link 
      href={href} 
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-bold no-underline ${
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
