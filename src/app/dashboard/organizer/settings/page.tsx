
"use client";

import React, { useState } from 'react';
import { Settings, User, ShieldCheck, LogOut, Menu, LayoutDashboard, Plus, Ticket, Users, BarChart3, ChevronRight, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from 'next/link';
import { Logo } from '@/components/logo';
import { SidebarLink } from '../page';
import { usePathname } from 'next/navigation';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { CITIES } from '@/lib/mock-data';

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    className={className} 
    fill="currentColor" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.397-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

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
          <Link href="/dashboard/organizer" className="mb-10 block no-underline">
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
                  <div className="flex gap-5 items-center flex-wrap lg:flex-nowrap">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg whitespace-nowrap">Verification Status</h3>
                        <Badge variant="outline" className="text-[10px] font-black uppercase tracking-tighter border-yellow-500/50 text-yellow-600 bg-yellow-500/5">Not Verified</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Verify your identity to get the verified badge and unlock faster payouts for your events.
                      </p>
                    </div>
                  </div>
                  <Link href="/dashboard/organizer/kyc" className="no-underline shrink-0">
                    <Button className="rounded-full px-8 gap-2 font-bold shadow-lg shadow-primary/20 h-9 md:h-11">
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
                    <Input id="brand-name" defaultValue="Smooth Events" className="h-11 bg-secondary/50 cursor-not-allowed" readOnly />
                    <p className="text-[10px] text-muted-foreground">To change your brand name, please contact support.</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Support Email</Label>
                    <Input id="email" defaultValue="hello@smoothevents.ng" className="h-11 bg-secondary/50 cursor-not-allowed" readOnly />
                    <p className="text-[10px] text-muted-foreground">Primary account email cannot be changed.</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp" className="flex items-center gap-1.5">
                      <WhatsAppIcon className="w-3.5 h-3.5 text-green-500" /> WhatsApp Number
                    </Label>
                    <Input id="whatsapp" defaultValue="+2349024244140" className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location" className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-primary" /> Brand Headquarters
                    </Label>
                    <Select defaultValue="Lagos">
                      <SelectTrigger className="h-11">
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
