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
  ShieldAlert,
  Zap,
  Globe,
  Database,
  Lock,
  RefreshCcw,
  AlertTriangle,
  CreditCard,
  User,
  MapPin
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Logo } from '@/components/logo';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SidebarLink } from '../page';
import { useToast } from "@/hooks/use-toast";
import { CITIES } from '@/lib/mock-data';

export default function AdminSystemSettings() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { toast } = useToast();

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

  const handleSave = () => {
    toast({
      title: "System Updated",
      description: "Global platform configuration has been synchronized.",
    });
  };

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
      </header>

      <main className="flex-1 p-4 md:p-12 overflow-x-hidden">
        <div className="max-w-4xl mx-auto space-y-8">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="text-left space-y-1">
              <h1 className="font-headline text-3xl md:text-5xl">System Config</h1>
              <p className="text-muted-foreground font-medium">Control global fees, security protocols, and maintenance modes.</p>
            </div>
            <Button onClick={handleSave} className="rounded-full shadow-lg shadow-primary/20 h-11 font-bold px-10">
              Apply Changes
            </Button>
          </header>

          <div className="grid gap-8 text-left">
            {/* Admin Profile */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" /> Admin Profile
                </CardTitle>
                <CardDescription>Your personal account details for system audit logs.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input defaultValue="Admin Master" className="h-11 bg-secondary/30 border-none rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location" className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-primary" /> Primary Operating Base
                    </Label>
                    <Select defaultValue="Abuja">
                      <SelectTrigger className="h-11 bg-secondary/30 border-none rounded-xl">
                        <SelectValue placeholder="Select your city" />
                      </SelectTrigger>
                      <SelectContent>
                        {CITIES.map(city => (
                          <SelectItem key={city} value={city}>{city}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Global Pricing */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" /> Fee Structure
                </CardTitle>
                <CardDescription>Global service charges applied to all transactions.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Standard Platform Fee (%)</Label>
                    <Input defaultValue="2.5" className="h-11 bg-secondary/30 border-none rounded-xl" />
                    <p className="text-[10px] text-muted-foreground">Commission percentage taken from every paid ticket sold.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Platform Security */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-primary" /> Critical Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-2xl border border-border">
                  <div className="space-y-1">
                    <p className="font-bold text-sm">Require KYC for Listing</p>
                    <p className="text-xs text-muted-foreground">Prevent unverified hosts from creating any events.</p>
                  </div>
                  <Switch checked />
                </div>
                
                <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-2xl border border-border">
                  <div className="space-y-1">
                    <p className="font-bold text-sm">Automated Settlements</p>
                    <p className="text-xs text-muted-foreground">Disable manual approval for verified organizer payouts.</p>
                  </div>
                  <Switch checked />
                </div>
              </CardContent>
            </Card>

            {/* Gateway Management */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" /> Gateway Management
                </CardTitle>
                <CardDescription>Enable or disable active payment processing channels.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-2xl border border-border">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center border border-border">
                      <span className="text-xs font-black text-[#09A5DB]">PY</span>
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-bold text-sm">Paystack</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Standard Gateway</p>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-2xl border border-border">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center border border-border">
                      <span className="text-xs font-black text-[#FB9129]">FW</span>
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-bold text-sm">Flutterwave</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Backup Gateway</p>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-2xl border border-border">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center border border-border">
                      <span className="text-xs font-black text-[#2775CA]">$</span>
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-bold text-sm">SolanaPay (USDC/USDT)</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Web3 Channel</p>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            {/* Maintenance Mode */}
            <Card className="border-red-500/20 bg-red-500/5">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-red-600">
                  <AlertTriangle className="w-5 h-5" /> Danger Zone
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-background border border-red-500/10 rounded-2xl">
                  <div className="space-y-1">
                    <p className="font-bold text-sm text-red-600 uppercase tracking-tighter">Maintenance Mode</p>
                    <p className="text-xs text-muted-foreground">Take the platform offline for scheduled updates.</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex gap-4">
                  <Button variant="outline" className="flex-1 rounded-xl h-11 border-red-500/20 text-red-600 hover:bg-red-500/5 font-bold">
                    Purge System Cache
                  </Button>
                  <Button variant="outline" className="flex-1 rounded-xl h-11 border-red-500/20 text-red-600 hover:bg-red-500/5 font-bold">
                    Re-index Search
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
