
"use client";

import React, { useState } from 'react';
import { Bell, Ticket, Star, Zap, Clock, CheckCircle2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const INITIAL_NOTIFICATIONS = [
  { 
    id: '1', 
    icon: Ticket, 
    title: "Ticket Confirmed!", 
    desc: "Your ticket for Lagos Jazz Night is now in your digital wallet. You can access it offline if needed.", 
    time: "2 hours ago",
    type: "success",
    unread: true
  },
  { 
    id: '2', 
    icon: Zap, 
    title: "Event Reminder", 
    desc: "Naija Tech Summit starts tomorrow at 9:00 AM. Don't forget your secure entry QR code!", 
    time: "1 day ago",
    type: "info",
    unread: false
  },
  { 
    id: '3', 
    icon: Star, 
    title: "Exclusive Early Access", 
    desc: "Early bird tickets for Gidi Fest are now live for verified members. Grab yours before they sell out.", 
    time: "3 days ago",
    type: "primary",
    unread: false
  }
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const { toast } = useToast();

  const handleMarkAllRead = () => {
    const hasUnread = notifications.some(n => n.unread);
    if (!hasUnread) return;

    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    toast({
      title: "All caught up!",
      description: "All notifications have been marked as read.",
    });
  };

  const toggleRead = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, unread: !n.unread } : n
    ));
  };

  return (
    <div className="p-4 pb-16 md:p-12 md:pb-16">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
          <div className="space-y-1">
            <h1 className="font-headline text-2xl md:text-4xl tracking-tighter">Notifications</h1>
            <p className="text-muted-foreground font-medium">Stay updated on your upcoming experiences.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              className="rounded-full h-10 px-6 font-bold gap-2 text-xs border-primary/20 text-primary hover:bg-primary/5 transition-all"
              onClick={handleMarkAllRead}
              disabled={!notifications.some(n => n.unread)}
            >
              <CheckCircle2 className="w-4 h-4" /> Mark as Read
            </Button>
          </div>
        </header>

        <div className="space-y-4">
           {notifications.length > 0 ? notifications.map((notif) => (
             <NotificationItem 
               key={notif.id} 
               {...notif}
               onClick={() => toggleRead(notif.id)}
             />
           )) : (
             <div className="py-32 text-center bg-card/20 border border-dashed border-border/50 rounded-[3rem] animate-in fade-in duration-700">
                <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                  <Bell className="w-10 h-10 text-muted-foreground/20" />
                </div>
                <h3 className="font-headline text-2xl mb-2">No notifications</h3>
                <p className="text-muted-foreground font-medium max-w-sm mx-auto">
                  You're all caught up! Check back later for updates on your events.
                </p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}

function NotificationItem({ icon: Icon, title, desc, time, type, unread = false, onClick }: any) {
  const typeClasses = 
    type === 'success' ? 'bg-green-500/10 text-green-500' : 
    type === 'primary' ? 'bg-primary/10 text-primary' : 
    'bg-blue-500/10 text-blue-500';
  
  return (
    <div 
      className={cn(
        "group relative bg-card border border-border p-6 rounded-[2rem] flex items-start gap-6 text-left hover:border-primary/30 hover:bg-primary/[0.02] transition-all duration-300 cursor-pointer",
        unread && "border-primary/20 shadow-[0_10px_40px_-15px_rgba(126,124,255,0.1)] bg-primary/[0.01]"
      )}
      onClick={onClick}
    >
       {unread && (
         <div className="absolute top-6 right-6 flex items-center gap-2">
            <span className="text-[10px] font-black text-primary uppercase tracking-widest">New</span>
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
         </div>
       )}

       <div className={cn(
         "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm",
         typeClasses
       )}>
          <Icon className="w-6 h-6" />
       </div>

       <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
             <h4 className={cn(
               "font-bold text-lg leading-tight tracking-tight pr-12 transition-colors",
               unread ? "text-foreground" : "text-foreground/80"
             )}>{title}</h4>
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
