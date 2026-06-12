"use client";

import React from 'react';
import { Users, Plus, Mail, MessageSquare, ShieldCheck, MoreVertical } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
import { Logo } from '@/components/logo';
import { SidebarLink } from '../page';

export default function VendorsManagementPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row pt-32">
      <aside className="w-64 bg-sidebar border-r border-sidebar-border p-6 flex flex-col hidden md:flex sticky top-0 h-screen">
        <Link href="/" className="mb-10 block"><Logo size="sm" /></Link>
        <nav className="flex-1 space-y-1">
          <SidebarLink icon={Users} label="Vendors" href="/dashboard/organizer/vendors" active />
          <Button variant="ghost" size="sm" className="w-full justify-start text-xs font-bold text-muted-foreground hover:text-primary mt-4 px-4" asChild>
            <Link href="/dashboard/organizer">← Back to Overview</Link>
          </Button>
        </nav>
      </aside>

      <main className="flex-1 p-4 md:p-12">
        <div className="max-w-6xl mx-auto space-y-8">
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="text-left">
              <h1 className="font-headline text-3xl mb-2">Vendors & Staff</h1>
              <p className="text-muted-foreground">Manage service providers and gate staff for your events.</p>
            </div>
            <Button className="rounded-full gap-2 px-6 h-12 shadow-lg shadow-primary/20 font-bold">
              <Plus className="w-4 h-4" /> Add Vendor
            </Button>
          </header>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
             <VendorCard name="Main Gate Team" role="Staff" status="Active" email="gate1@isabievents.ng" />
             <VendorCard name="Cold Sips Drinks" role="Vendor" status="Active" email="drinks@vendor.ng" />
             <VendorCard name="Naija Grills" role="Vendor" status="Pending" email="grills@vendor.ng" />
          </div>

          <Card className="border-dashed border-2 border-border bg-card/50 rounded-[2rem]">
            <CardContent className="p-12 text-center space-y-4">
               <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto">
                 <ShieldCheck className="w-8 h-8 text-muted-foreground opacity-50" />
               </div>
               <div className="space-y-1">
                 <h3 className="font-bold text-xl">On-site Verification</h3>
                 <p className="text-muted-foreground max-w-sm mx-auto">Vendors can use their dedicated portal to scan and verify guest meal vouchers or VIP access.</p>
               </div>
               <Button variant="outline" className="rounded-full">Learn More</Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

function VendorCard({ name, role, status, email }: any) {
  return (
    <Card className="bg-card border-border hover:border-primary/30 transition-all text-left">
      <CardContent className="p-6 space-y-6">
        <div className="flex justify-between items-start">
          <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <Badge className={status === 'Active' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}>
            {status}
          </Badge>
        </div>
        <div>
          <h4 className="font-bold text-lg">{name}</h4>
          <p className="text-xs text-muted-foreground uppercase font-black tracking-widest">{role}</p>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="w-4 h-4" /> {email}
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <Button variant="secondary" size="sm" className="flex-1 rounded-lg">Manage</Button>
          <Button variant="outline" size="sm" className="rounded-lg"><MessageSquare className="w-4 h-4" /></Button>
        </div>
      </CardContent>
    </Card>
  );
}