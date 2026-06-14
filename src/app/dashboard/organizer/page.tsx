
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
  Loader2,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Info,
  Bell
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Logo } from '@/components/logo';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";

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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showTrustTip, setShowTrustTip] = useState(true);
  const pathname = usePathname();
  const { toast } = useToast();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API fetch delay
    await new Promise(r => setTimeout(r, 1200));
    setIsRefreshing(false);
    toast({
      title: "Dashboard Refreshed",
      description: "You're viewing the most up-to-date sales data.",
    });
  };

  const NavigationLinks = () => (
    <nav className="flex-1 space-y-1">
      <div className="pb-2">
        <SidebarLink icon={LayoutDashboard} label="Dashboard" href="/dashboard/organizer" active={pathname === '/dashboard/organizer'} />
        <SidebarLink icon={Plus} label="Create Event" href="/dashboard/organizer/create" active={pathname === '/dashboard/organizer/create'} />
        <SidebarLink icon={Ticket} label="My Events" href="/dashboard/organizer/events" active={pathname === '/dashboard/organizer/events'} />
        <SidebarLink icon={Users} label="Vendors" href="/dashboard/organizer/vendors" active={pathname === '/dashboard/organizer/vendors'} />
        <SidebarLink icon={BarChart3} label="Analytics" href="/dashboard/organizer/analytics" active={pathname === '/dashboard/organizer/analytics'} />
        <SidebarLink icon={Settings} label="Settings" href="/dashboard/organizer/settings" active={pathname === '/dashboard/organizer/settings'} />
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row pt-40">
      {/* Desktop Side Navigation */}
      <aside className="w-64 bg-sidebar border-r border-sidebar-border p-6 flex flex-col hidden md:flex sticky top-0 h-screen overflow-y-auto">
        <div className="mb-10">
          <Link href="/dashboard/organizer" className="no-underline">
            <Logo size="sm" />
          </Link>
        </div>
        <NavigationLinks />
        <div className="pt-6 border-t border-sidebar-border mt-auto">
          <SidebarLink icon={LogOut} label="Log Out" href="/login" />
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 bg-card border-b border-border sticky top-0 z-40">
        <Link href="/dashboard/organizer" className="no-underline">
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
                  <Link href="/dashboard/organizer" className="no-underline" onClick={() => setIsMobileMenuOpen(false)}>
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
          {/* Trust Banner - Dismissible */}
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
              <h1 className="font-headline text-3xl md:text-5xl flex items-center gap-3">
                Smooth Events
                <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8 text-accent fill-accent text-white" summer-hint="verified-badge" />
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
                <Button variant="ghost" className="w-full text-primary hover:text-primary/80 font-bold h-11">View Statement</Button>
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
          <Button variant="ghost" size="sm" className="font-bold h-9">Edit</Button>
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
