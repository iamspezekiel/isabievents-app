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
  Search, 
  Menu, 
  DollarSign,
  TrendingUp,
  Download,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Logo } from '@/components/logo';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SidebarLink } from '../page';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useToast } from "@/hooks/use-toast";

const platformVolume = [
  { name: 'Jan', volume: 12000000 },
  { name: 'Feb', volume: 15500000 },
  { name: 'Mar', volume: 13800000 },
  { name: 'Apr', volume: 22000000 },
  { name: 'May', volume: 18500000 },
  { name: 'Jun', volume: 24800000 },
];

export default function AdminFinancialReports() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const pathname = usePathname();
  const { toast } = useToast();

  const handleExport = async () => {
    setIsExporting(true);
    // Simulate data generation and file download preparation
    await new Promise(r => setTimeout(r, 2000));
    
    try {
      // Create CSV content from platformVolume data
      const headers = "Month,Gross Transaction Volume (NGN)\n";
      const rows = platformVolume.map(item => `${item.name},${item.volume}`).join("\n");
      const csvContent = headers + rows;
      
      // Create blob and download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `IsabiEvents_Financial_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Ledger Exported",
        description: "The platform financial ledger (CSV) has been generated and downloaded.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "There was an error generating the ledger file.",
      });
    } finally {
      setIsExporting(false);
    }
  };

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

      <main className="flex-1 p-4 md:p-12 overflow-x-hidden">
        <div className="max-w-6xl mx-auto space-y-8">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="text-left space-y-1">
              <h1 className="font-headline text-3xl md:text-5xl">Financial Intel</h1>
              <p className="text-muted-foreground font-medium">Global transaction volumes, revenue splits and platform performance.</p>
            </div>
            <Button 
              onClick={handleExport} 
              disabled={isExporting}
              className="rounded-full shadow-lg shadow-primary/20 h-11 font-bold gap-2 min-w-[160px]"
            >
              {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {isExporting ? "Processing..." : "Export Ledger"}
            </Button>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <FinancialStatCard label="Platform GTV" value="₦124.8M" trend="+22%" icon={DollarSign} />
            <FinancialStatCard label="Service Fees" value="₦3.12M" trend="+18%" icon={TrendingUp} />
            <FinancialStatCard label="Avg Ticket" value="₦8,450" trend="-2%" icon={Activity} />
            <FinancialStatCard label="Net Payouts" value="₦118.4M" trend="+25%" icon={ArrowUpRight} />
          </div>

          <Card className="border-border bg-card">
            <CardHeader className="text-left flex flex-row items-center justify-between border-b border-border/50 pb-6 mb-6">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" /> Monthly Transaction Volume
                </CardTitle>
                <CardDescription>Platform-wide gross transaction volume (NGN equivalent).</CardDescription>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <Button variant="ghost" size="sm" className="font-bold text-[10px] uppercase tracking-widest text-primary">6 Months</Button>
                <Button variant="ghost" size="sm" className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground">1 Year</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={platformVolume}>
                    <defs>
                      <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₦${v/1000000}M`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }}
                      itemStyle={{ color: 'hsl(var(--primary))' }}
                      formatter={(v: number) => `₦${(v/1000000).toFixed(1)}M`}
                    />
                    <Area type="monotone" dataKey="volume" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorVolume)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-2 gap-8 text-left">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-lg">Recent Settlements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <SettlementRow organizer="Smooth Events" amount="₦4,250,000" date="Oct 24" status="Success" />
                <SettlementRow organizer="TechNigeria" amount="₦1,820,000" date="Oct 24" status="Pending" />
                <SettlementRow organizer="Eclipse Live" amount="₦12,400,000" date="Oct 23" status="Success" />
                <Button variant="ghost" className="w-full text-primary font-bold text-xs uppercase tracking-widest mt-4">View All Payouts</Button>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-lg">Revenue Split Intel</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase font-black tracking-widest">Platform Fees (2.5%)</p>
                    <p className="text-2xl font-black">₦3,120,000</p>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: '15%' }} />
                </div>
                <p className="text-[10px] text-muted-foreground italic">Platform fees are calculated based on paid ticket volume only. Free events contribute ₦0 revenue.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

function FinancialStatCard({ label, value, trend, icon: Icon }: any) {
  const isUp = trend.startsWith('+');
  return (
    <Card className="bg-card border-border hover:border-primary/20 transition-all">
      <CardContent className="p-6 text-left space-y-2">
        <div className="flex items-center justify-between">
          <div className="p-2 bg-secondary/50 rounded-lg">
            <Icon className="w-4 h-4 text-primary" />
          </div>
          <Badge className={`${isUp ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'} border-none text-[10px] font-black`}>
            {trend}
          </Badge>
        </div>
        <div>
          <div className="text-2xl font-black">{value}</div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function SettlementRow({ organizer, amount, date, status }: any) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl hover:bg-secondary/30 transition-colors">
      <div className="space-y-0.5">
        <p className="text-sm font-bold">{organizer}</p>
        <p className="text-[10px] text-muted-foreground">{date}</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-black">{amount}</p>
        <Badge className={`${status === 'Success' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-600'} border-none text-[8px] font-black uppercase h-5`}>
          {status}
        </Badge>
      </div>
    </div>
  );
}
