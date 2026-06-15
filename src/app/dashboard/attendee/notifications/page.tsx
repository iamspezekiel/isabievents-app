
"use client";

import React from 'react';
import { Bell, Ticket, Star, Zap, Clock, CheckCircle2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotificationsPage() {
  return (
    <div className="p-4 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
          <div className="space-y-1">
            <h1 className="font-headline text-3xl md:text-5xl tracking-tighter">Notifications</h1>
            <p className="text-muted-foreground font-medium">Stay updated on your upcoming experiences.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="rounded-full h-10 px-6 font-bold gap-2 text-xs border-primary/20 text-primary hover:bg-primary/5">
              <CheckCircle2 className="w-4 h-4" /> Mark as Read
            </Button>
          </div>
        </header>

        <div className="space-y-4">
           <NotificationItem 
             icon={Ticket} 
             title="Ticket Confirmed!" 
             desc="Your ticket for Lagos Jazz Night is now in your digital wallet. You can access it offline if needed." 
             time="2 hours ago"
             type="success"
             unread={true}
           />
           <NotificationItem 
             icon={Zap} 
             title="Event Reminder" 
             desc="Naija Tech Summit starts tomorrow at 9:00 AM. Don't forget your secure entry QR code!" 
             time="1 day ago"
             type="info"
           />
           <NotificationItem 
             icon={Star} 
             title="Exclusive Early Access" 
             desc="Early bird tickets for Gidi Fest are now live for verified members. Grab yours before they sell out." 
             time="3 days ago"
             type="primary"
           />
        </div>
      </div>
    </div>
  );
}

function NotificationItem({ icon: Icon, title, desc, time, type, unread = false }: any) {
  const typeClasses = 
    type === 'success' ? 'bg-green-500/10 text-green-500' : 
    type === 'primary' ? 'bg-primary/10 text-primary' : 
    'bg-blue-500/10 text-blue-500';
  
  return (
    <div className={cn(
      "group relative bg-card border border-border p-6 rounded-[2rem] flex items-start gap-6 text-left hover:border-primary/30 hover:bg-primary/[0.02] transition-all duration-300",
      unread && "border-primary/20 shadow-[0_10px_40px_-15px_rgba(126,124,255,0.1)]"
    )}>
       {unread && (
         <div className="absolute top-6 right-6 flex items-center gap-2">
            <span className="text-[10px] font-black text-primary uppercase tracking-widest">New</span>
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
         </div>
       )}

       <div className={cn(
         "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3",
         typeClasses
       )}>
          <Icon className="w-6 h-6" />
       </div>

       <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
             <h4 className="font-bold text-lg leading-tight tracking-tight pr-12">{title}</h4>
             <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/60 font-black uppercase tracking-widest shrink-0">
                <Clock className="w-3 h-3" />
                {time}
             </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">{desc}</p>
       </div>
    </div>
  );
}
