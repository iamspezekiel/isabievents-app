"use client";

import React, { useState } from 'react';
import { Settings, User, ShieldCheck, LogOut, Menu, Ticket, History, Heart, Bell } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import Link from 'next/link';
import { Logo } from '@/components/logo';
import { SidebarLink } from '../page';
import { usePathname } from 'next/navigation';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export default function AttendeeSettingsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  const Navigation = () => (
    <nav className="flex-1 space-y-1">
      <div className="pb-4">
        <SidebarLink icon={Ticket} label="My Tickets" href="/dashboard/attendee" active={pathname === '/dashboard/attendee'} />
        <SidebarLink icon={History} label="Order History" href="/dashboard/attendee/history" active={pathname === '/dashboard/attendee/history'} />
        <SidebarLink icon={Heart} label="Favorites" href="/dashboard/attendee/favorites" active={pathname === '/dashboard/attendee/favorites'} />
        <SidebarLink icon={Bell} label="Notifications" href="/dashboard/attendee/notifications" active={pathname === '/dashboard/attendee/notifications'} />
        <SidebarLink icon={Settings} label="Account Settings" href="/dashboard/attendee/settings" active={pathname === '/dashboard/attendee/settings'} />
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row pt-32">
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex w-72 bg-card/30 border-r border-border p-8 flex-col sticky top-0 h-screen overflow-y-auto">
        <Link href="/dashboard/attendee" className="mb-12 block no-underline">
          <Logo size="sm" />
        </Link>
        <Navigation />
        <div className="pt-8 border-t border-border mt-auto">
          <SidebarLink icon={LogOut} label="Log Out" href="/login" />
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="lg:hidden flex items-center justify-between p-4 bg-card border-b border-border sticky top-0 z-40">
        <Link href="/dashboard/attendee" className="no-underline">
          <Logo size="sm" />
        </Link>
        <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 bg-card border-border p-8 flex flex-col overflow-y-auto">
            <SheetHeader className="text-left mb-10">
              <SheetTitle>
                <Link href="/dashboard/attendee" className="no-underline" onClick={() => setIsSidebarOpen(false)}>
                  <Logo size="sm" />
                </Link>
              </SheetTitle>
            </SheetHeader>
            <Navigation />
            <div className="pt-8 border-t border-border mt-auto">
              <SidebarLink icon={LogOut} label="Log Out" href="/login" />
            </div>
          </SheetContent>
        </Sheet>
      </header>

      <main className="flex-1 p-4 md:p-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-left">
            <h1 className="font-headline mb-2 text-3xl md:text-5xl">Account Settings</h1>
            <p className="text-muted-foreground">Manage your identity, security, and preferences.</p>
          </div>

          <div className="grid gap-8">
            <Card className="border-border bg-card">
              <CardHeader className="text-left">
                <CardTitle className="flex items-center gap-2"><User className="w-5 h-5 text-primary" /> Profile Information</CardTitle>
                <CardDescription>Your account details used for ticket issuance.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 text-left">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullname">Full Name</Label>
                    <Input id="fullname" defaultValue="Sylvanus P. Ezekiel" className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" defaultValue="attendee@isabievents.ng" className="h-11" />
                  </div>
                </div>
                <Button className="rounded-full px-8">Save Changes</Button>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader className="text-left">
                <CardTitle className="flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-primary" /> Privacy & Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 text-left">
                <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl">
                  <div className="space-y-0.5">
                    <div className="font-bold">Email Notifications</div>
                    <p className="text-xs text-muted-foreground">Receive reminders for your upcoming events.</p>
                  </div>
                  <Switch checked />
                </div>
                <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl">
                  <div className="space-y-0.5">
                    <div className="font-bold">Marketing Updates</div>
                    <p className="text-xs text-muted-foreground">Get notified about flash sales and trending events.</p>
                  </div>
                  <Switch />
                </div>
                <Button variant="outline" className="rounded-full w-full sm:w-auto text-red-500 hover:text-red-600 border-red-200">Delete Account</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
