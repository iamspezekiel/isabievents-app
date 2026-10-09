
"use client";

import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Download, 
  Activity, 
  Loader2, 
  ArrowUpRight 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from '@/lib/api-fetch';

interface ReportStats {
  revenueNgn: number;
  paidOrders: number;
  series: {name: string; revenue: number}[];
  recentSales: {id: string; eventTitle: string; amount: number; currency: string; paidAt: string}[];
}

const money = (n: number, currency?: string) =>
  currency === 'USD' ? `$${n.toFixed(2)}` : `₦${n.toLocaleString()}`;

export default function AdminFinancialReports() {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();
  const [stats, setStats] = useState<ReportStats | null>(null);

  useEffect(() => {
    apiFetch('/api/admin/stats')
      .then((r) => r.json())
      .then((d) => {
        if (d && !d.error) setStats(d as ReportStats);
      })
      .catch(() => undefined);
  }, []);

  const chartData = (stats?.series || []).map((s) => ({name: s.name, volume: s.revenue}));
  const revenue = stats?.revenueNgn ?? 0;
  const fees = Math.round(revenue * 0.025);
  const avgTicket = stats && stats.paidOrders > 0 ? Math.round(revenue / stats.paidOrders) : 0;
  const net = revenue - fees;

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const headers = "Day,Gross Transaction Volume (NGN)\n";
      const rows = chartData.map(item => `${item.name},${item.volume}`).join("\n");
      const csvContent = headers + rows;
      
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

  return (
    <div className="p-4 md:p-12 space-y-8">
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
        <FinancialStatCard label="Platform GTV" value={`₦${revenue.toLocaleString()}`} trend="Live" icon={DollarSign} />
        <FinancialStatCard label="Service Fees (2.5%)" value={`₦${fees.toLocaleString()}`} trend="Live" icon={TrendingUp} />
        <FinancialStatCard label="Avg Ticket" value={`₦${avgTicket.toLocaleString()}`} trend="Live" icon={Activity} />
        <FinancialStatCard label="Net Revenue" value={`₦${net.toLocaleString()}`} trend="Live" icon={ArrowUpRight} />
      </div>

      <Card className="border-border bg-card">
        <CardHeader className="text-left flex flex-row items-center justify-between border-b border-border/50 pb-6 mb-6">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" /> Transaction Volume (Last 7 Days)
            </CardTitle>
            <CardDescription>Platform-wide gross transaction volume from real paid orders (NGN equivalent).</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
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
            <CardTitle className="text-lg">Recent Sales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(stats?.recentSales || []).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">No paid orders yet.</p>
            )}
            {(stats?.recentSales || []).map((sale) => (
              <SettlementRow
                key={sale.id}
                organizer={sale.eventTitle}
                amount={money(sale.amount, sale.currency)}
                date={sale.paidAt ? new Date(sale.paidAt).toLocaleDateString('en-NG', {month: 'short', day: 'numeric'}) : '—'}
                status="Success"
              />
            ))}
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
                <p className="text-2xl font-black">₦{fees.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-primary" style={{ width: '2.5%' }} />
            </div>
            <p className="text-[10px] text-muted-foreground italic">Platform fees are calculated based on paid ticket volume only. Free events contribute ₦0 revenue.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function FinancialStatCard({ label, value, trend, icon: Icon }: any) {
  const isUp = typeof trend === 'string' && trend.startsWith('+');
  const isDown = typeof trend === 'string' && trend.startsWith('-');
  const tone = isUp
    ? 'bg-green-500/10 text-green-500'
    : isDown
      ? 'bg-red-500/10 text-red-500'
      : 'bg-primary/10 text-primary';
  return (
    <Card className="bg-card border-border hover:border-primary/20 transition-all">
      <CardContent className="p-6 text-left space-y-2">
        <div className="flex items-center justify-between">
          <div className="p-2 bg-secondary/50 rounded-lg">
            <Icon className="w-4 h-4 text-primary" />
          </div>
          <Badge className={`${tone} border-none text-[10px] font-black`}>
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
