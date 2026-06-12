"use client";

import React from 'react';
import { Bell, Ticket, Star, Zap, Info } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
import { Logo } from '@/components/logo';
import { SidebarLink } from '../page';

export default function NotificationsPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row pt-32">
      <aside className="hidden lg:flex w-72 bg-card/30 border-r border-border p-8 flex-col sticky top-0 h-screen">
        <Link href="/" className="mb-12 block"><Logo size="sm" /></Link>
        <nav className="flex-1 space-y-1">
          <SidebarLink icon={Bell} label="Notifications" href="/dashboard/attendee/notifications" active />
          <Link href="/dashboard/attendee" className="block mt-4 text-xs font-bold text-muted-foreground hover:text-primary transition-colors">← Back to Wallet</Link>
        </nav>
      </aside>

      <main className="flex-1 p-4 md:p-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <header className="flex items-center justify-between text-left">
            <div className="space-y-1">
              <h1 className="font-headline text-3xl">Notifications</h1>
              <p className="text-muted-foreground font-medium">Stay updated on your upcoming experiences.</p>
            </div>
            <Button variant="ghost" className="text-xs font-bold text-primary">Mark all as read</Button>
          </header>

          <div className="space-y-4">
             <NotificationItem 
               icon={Ticket} 
               title="Ticket Confirmed!" 
               desc="Your ticket for Lagos Jazz Night is now in your digital wallet." 
               time="2 hours ago"
               type="success"
             />
             <NotificationItem 
               icon={Zap} 
               title="Event Reminder" 
               desc="Naija Tech Summit starts tomorrow at 9:00 AM. Don't forget your QR code!" 
               time="1 day ago"
               type="info"
             />
             <NotificationItem 
               icon={Star} 
               title="Exclusive Offer" 
               desc="Early bird tickets for Gidi Fest are now live. Grab yours before they sell out." 
               time="3 days ago"
               type="primary"
             />
          </div>
        </div>
      </main>
    </div>
  );
}

function NotificationItem({ icon: Icon, title, desc, time, type }: any) {
  const typeClasses = type === 'success' ? 'bg-green-500/10 text-green-500' : type === 'primary' ? 'bg-primary/10 text-primary' : 'bg-blue-500/10 text-blue-500';
  
  return (
    <div className="bg-card border border-border p-6 rounded-2xl flex items-start gap-6 text-left hover:border-primary/20 transition-colors">
       <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${typeClasses}`}>
          <Icon className="w-6 h-6" />
       </div>
       <div className="flex-1 space-y-1">
          <div className="flex justify-between items-start">
             <h4 className="font-bold text-lg">{title}</h4>
             <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{time}</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
          <div className="pt-2">
            <Button variant="ghost" size="sm" className="h-8 px-0 text-primary font-bold hover:bg-transparent">View Details</Button>
          </div>
       </div>
    </div>
  );
}
