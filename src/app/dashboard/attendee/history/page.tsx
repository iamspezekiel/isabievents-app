"use client";

import React from 'react';
import { History, Search, Download, ChevronRight } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
import { Logo } from '@/components/logo';
import { SidebarLink } from '../page';

export default function OrderHistoryPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row pt-32">
      <aside className="hidden lg:flex w-72 bg-card/30 border-r border-border p-8 flex-col sticky top-0 h-screen">
        <Link href="/" className="mb-12 block"><Logo size="sm" /></Link>
        <nav className="flex-1 space-y-1">
          <SidebarLink icon={History} label="Order History" href="/dashboard/attendee/history" active />
          <Button variant="ghost" size="sm" className="w-full justify-start text-xs font-bold text-muted-foreground hover:text-primary mt-4 px-4" asChild>
            <Link href="/dashboard/attendee">← Back to Wallet</Link>
          </Button>
        </nav>
      </aside>

      <main className="flex-1 p-4 md:p-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-left">
            <h1 className="font-headline text-3xl mb-2">Order History</h1>
            <p className="text-muted-foreground">View and download invoices for all your past purchases.</p>
          </div>

          <div className="flex gap-4">
             <div className="relative flex-1">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
               <Input placeholder="Search orders..." className="pl-10 h-12 bg-card" />
             </div>
          </div>

          <div className="space-y-4">
             <OrderRow id="ORD-7721" event="Lagos Jazz Night" date="Oct 12, 2024" amount="₦15,000" status="Success" />
             <OrderRow id="ORD-5529" event="Naija Tech Summit" date="Sep 28, 2024" amount="₦0" status="Free" />
             <OrderRow id="ORD-3310" event="Beach Bash Lagos" date="Aug 15, 2024" amount="₦10,000" status="Success" />
          </div>
        </div>
      </main>
    </div>
  );
}

function OrderRow({ id, event, date, amount, status }: any) {
  return (
    <div className="bg-card border border-border p-5 rounded-2xl flex items-center justify-between hover:border-primary/30 transition-colors group">
      <div className="flex items-center gap-6 text-left">
        <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center shrink-0">
           <History className="w-6 h-6 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <div className="font-bold">{event}</div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
             <span>{id}</span> · <span>{date}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-8">
         <div className="text-right">
            <div className="font-black">{amount}</div>
            <Badge className={status === 'Success' ? 'bg-green-500/10 text-green-500' : 'bg-secondary text-muted-foreground'}>{status}</Badge>
         </div>
         <Button variant="ghost" size="icon" className="rounded-full"><Download className="w-4 h-4" /></Button>
      </div>
    </div>
  );
}