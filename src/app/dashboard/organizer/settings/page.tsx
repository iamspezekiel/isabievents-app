"use client";

import React, { useState } from 'react';
import { Settings, User, ShieldCheck, LogOut, Menu, LayoutDashboard, Plus, Ticket, Users, BarChart3, CheckCircle2, ChevronRight, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
import { Logo } from '@/components/logo';
import { SidebarLink } from '../page';
import { usePathname } from 'next/navigation';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export default function OrganizerSettingsPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

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
    <div className="min-h-screen bg-background flex flex-col md:flex-row pt-32">
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
      </header>

      <main className="flex-1 p-4 md:p-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-left">
            <h1 className="font-headline mb-2 text-3xl md:text-5xl">Account Settings</h1>
            <p className="text-muted-foreground">Manage your brand profile and financial preferences.</p>
          </div>

          <div className="grid gap-8">
            {/* Verification Card */}
            <Card className="border-primary/20 bg-primary/5 overflow-hidden">
              <CardContent className="p-0">
                <div className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 text-left">
                  <div className="flex gap-5 items-start">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-7 h-7 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-xl">Verification Status</h3>
                        <Badge variant="outline" className="text-[10px] font-black uppercase tracking-tighter border-yellow-500/50 text-yellow-600 bg-yellow-500/5">Not Verified</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
                        Verify your identity to get the verified badge and unlock faster payouts for your events.
                      </p>
                    </div>
                  </div>
                  <Link href="/dashboard/organizer/kyc" className="no-underline">
                    <Button className="rounded-full px-8 gap-2 font-bold shadow-lg shadow-primary/20 h-11">
                      Start KYC <ChevronRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader className="text-left">
                <CardTitle className="flex items-center gap-2 text-lg"><User className="w-5 h-5 text-primary" /> Brand Profile</CardTitle>
                <CardDescription>Public information that attendees will see.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 text-left">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="brand-name">Brand Name</Label>
                    <Input id="brand-name" defaultValue="Smooth Events" className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Support Email</Label>
                    <Input id="email" defaultValue="hello@smoothevents.ng" className="h-11" />
                  </div>
                </div>
                <Button className="rounded-full px-8 font-bold">Save Changes</Button>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader className="text-left">
                <CardTitle className="flex items-center gap-2 text-lg"><ShieldCheck className="w-5 h-5 text-primary" /> Security & Payouts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 text-left">
                <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl">
                  <div className="space-y-0.5">
                    <div className="font-bold">Two-Factor Authentication</div>
                    <p className="text-xs text-muted-foreground">Add an extra layer of security to your payouts.</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl">
                  <div className="space-y-0.5">
                    <div className="font-bold">Automated Weekly Settlements</div>
                    <p className="text-xs text-muted-foreground">Withdraw funds every Monday morning.</p>
                  </div>
                  <Switch checked />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
