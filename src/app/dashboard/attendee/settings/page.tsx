"use client";

import React from 'react';
import { Settings, User, ShieldCheck, CreditCard, Bell, LogOut } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import Link from 'next/link';
import { Logo } from '@/components/logo';
import { SidebarLink } from '../page';

export default function AttendeeSettingsPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row pt-32">
      <aside className="hidden lg:flex w-72 bg-card/30 border-r border-border p-8 flex-col sticky top-0 h-screen">
        <Link href="/" className="mb-12 block"><Logo size="sm" /></Link>
        <nav className="flex-1 space-y-1">
          <SidebarLink icon={Settings} label="Account Settings" href="/dashboard/attendee/settings" active />
          <Button variant="ghost" size="sm" className="w-full justify-start text-xs font-bold text-muted-foreground hover:text-primary mt-4 px-4" asChild>
            <Link href="/dashboard/attendee">← Back to Wallet</Link>
          </Button>
        </nav>
      </aside>

      <main className="flex-1 p-4 md:p-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-left">
            <h1 className="font-headline text-3xl mb-2">Account Settings</h1>
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
                    <Input id="fullname" defaultValue="Sylvanus P. Ezekiel" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" defaultValue="attendee@isabievents.ng" />
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