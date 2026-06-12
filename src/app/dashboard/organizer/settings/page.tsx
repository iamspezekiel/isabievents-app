"use client";

import React from 'react';
import { Settings, User, Bell, Lock, CreditCard, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import Link from 'next/link';
import { Logo } from '@/components/logo';
import { SidebarLink } from '../page';

export default function OrganizerSettingsPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row pt-32">
      <aside className="w-64 bg-sidebar border-r border-sidebar-border p-6 flex flex-col hidden md:flex sticky top-0 h-screen">
        <Link href="/" className="mb-10 block"><Logo size="sm" /></Link>
        <nav className="flex-1 space-y-1">
          <SidebarLink icon={Settings} label="Settings" href="/dashboard/organizer/settings" active />
          <Link href="/dashboard/organizer" className="block mt-4 text-xs font-bold text-muted-foreground hover:text-primary transition-colors">← Back to Overview</Link>
        </nav>
      </aside>

      <main className="flex-1 p-4 md:p-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-left">
            <h1 className="font-headline text-3xl mb-2">Account Settings</h1>
            <p className="text-muted-foreground">Manage your brand profile and financial preferences.</p>
          </div>

          <div className="grid gap-8">
            <Card className="border-border bg-card">
              <CardHeader className="text-left">
                <CardTitle className="flex items-center gap-2"><User className="w-5 h-5 text-primary" /> Brand Profile</CardTitle>
                <CardDescription>Public information that attendees will see.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 text-left">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="brand-name">Brand Name</Label>
                    <Input id="brand-name" defaultValue="Smooth Events" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Support Email</Label>
                    <Input id="email" defaultValue="hello@smoothevents.ng" />
                  </div>
                </div>
                <Button className="rounded-full px-8">Save Changes</Button>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader className="text-left">
                <CardTitle className="flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-primary" /> Security & Payouts</CardTitle>
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
