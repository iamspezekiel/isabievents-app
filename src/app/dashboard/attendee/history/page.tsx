
"use client";

import React, { useState, useEffect } from 'react';
import { 
  History, 
  Search, 
  Download, 
  Loader2, 
  QrCode, 
  Calendar, 
  MapPin, 
  X,
  CheckCircle2,
  Eye
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useAuth } from '@/components/auth-provider';
import { useEvents } from '@/hooks/use-events';
import { getOrdersForEmail } from '@/lib/client-db';
import type { EventDoc, OrderDoc } from '@/lib/db-types';

export default function OrderHistoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const { profile } = useAuth();
  const { events } = useEvents();
  const [orders, setOrders] = useState<OrderDoc[]>([]);
  const [loading, setLoading] = useState(true);

  // Ticket Preview State
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewTicket, setViewTicket] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!profile?.email) {
      setLoading(false);
      return;
    }
    getOrdersForEmail(profile.email)
      .then(setOrders)
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [profile?.email]);

  const rows = orders
    .filter(o => o.status === 'paid' || o.status === 'refunded')
    .map(o => {
      const ts = o.paidAt || (typeof o.createdAt === 'string' ? o.createdAt : '');
      return {
        id: o.id,
        event: o.eventTitle,
        date: ts ? new Date(ts).toLocaleDateString('en-NG', {dateStyle: 'medium'}) : '—',
        amount: o.currency === 'USD' ? `$${o.amount.toFixed(2)}` : `₦${o.amount.toLocaleString()}`,
        status: o.status === 'paid' ? 'Success' : 'Refunded',
        eventId: o.eventId,
      };
    });

  const filteredOrders = rows.filter(order => 
    order.event.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleView = (eventId: string) => {
    const ev = events.find(e => e.id === eventId || e.slug === eventId) ?? null;
    setViewTicket(ev);
    setIsViewOpen(true);
  };

  return (
    <div className="p-4 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8 text-left">
        <div className="text-left">
          <h1 className="font-headline mb-2 text-3xl md:text-5xl tracking-tighter">Order History</h1>
          <p className="text-muted-foreground font-medium">View and manage all your past ticket purchases and receipts.</p>
        </div>

        <div className="flex gap-4">
           <div className="relative flex-1">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
             <Input 
              placeholder="Search orders by event name or ID..." 
              className="pl-10 h-11 bg-card rounded-xl border-border focus-visible:ring-primary shadow-sm" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
             />
           </div>
        </div>

        <div className="space-y-4">
           {filteredOrders.length > 0 ? (
             filteredOrders.map((order) => (
               <OrderRow 
                key={order.id} 
                {...order} 
                onView={() => handleView(order.eventId)}
               />
             ))
           ) : (
             <div className="text-center py-24 bg-card/20 rounded-[3rem] border border-dashed border-border/50 animate-in fade-in duration-500">
                <History className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
                <p className="text-muted-foreground font-medium">No matching orders found.</p>
             </div>
           )}
        </div>
      </div>

      {/* Ticket Preview Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="bg-card border-border sm:rounded-[2rem] p-0 overflow-hidden max-w-sm w-[94vw] sm:w-full">
          <div className="bg-primary p-6 text-center text-white">
            <DialogTitle className="font-headline text-xl text-white">IsabiEvents</DialogTitle>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Entry Ticket</p>
          </div>
          <div className="p-6 text-center space-y-6">
            <div className="p-4 bg-white rounded-2xl shadow-xl inline-block">
               <QrCode className="w-64 h-64 text-black transition-all" />
            </div>
            
            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Attendee Name</p>
                <p className="text-xl font-bold">{profile?.name || profile?.email || '—'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 border-y border-border/50 py-4">
                <div className="text-left space-y-1">
                  <p className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">Ticket ID</p>
                  <p className="font-mono text-[10px] font-bold uppercase">#TKT-{viewTicket?.id.toUpperCase()}-029</p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">Status</p>
                  <Badge className="bg-green-500/10 text-green-600 border-none px-2 h-4 text-[7px] font-black uppercase">Confirmed</Badge>
                </div>
              </div>

              <div className="space-y-1 text-left">
                <div className="flex items-center justify-between">
                  <h3 className="font-headline text-lg text-primary">{viewTicket?.title}</h3>
                  <Badge variant="outline" className="text-[8px] font-black uppercase border-primary/20 text-primary">Standard Pass</Badge>
                </div>
                <div className="flex flex-col gap-1 mt-2">
                  <p className="text-muted-foreground text-xs flex items-center gap-1.5 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-primary" /> 
                    {mounted ? new Date(viewTicket?.date).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' }) : '...'}
                  </p>
                  <p className="text-muted-foreground text-xs flex items-center gap-1.5 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-accent" /> {viewTicket?.venue}, {viewTicket?.city}
                  </p>
                </div>
              </div>
            </div>

            <Button onClick={() => window.print()} className="w-full rounded-full no-print font-bold shadow-lg shadow-primary/20 h-11">
              <Download className="w-4 h-4 mr-2" /> Download Ticket (PDF)
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function OrderRow({ id, event, date, amount, status, onView }: any) {
  return (
    <div className="bg-card border border-border p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between hover:border-primary/30 transition-all group shadow-sm gap-4">
      <div className="flex items-center gap-4 md:gap-6 text-left">
        <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
           <History className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
        <div className="space-y-1">
          <div className="font-bold text-base md:text-lg leading-tight">{event}</div>
          <div className="flex items-center gap-2 text-[10px] md:text-xs text-muted-foreground font-medium uppercase">
             <span className="font-mono tracking-tighter">{id}</span> 
             <span className="opacity-30">|</span>
             <span>{date}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between w-full sm:w-auto gap-4 sm:gap-6 border-t sm:border-none pt-4 sm:pt-0">
         <div className="text-left sm:text-right">
            <div className="font-black text-primary text-base md:text-lg leading-tight">{amount}</div>
            <Badge variant="secondary" className={cn(
              "text-[9px] md:text-[10px] font-bold uppercase tracking-widest border-none h-5",
              status === 'Success' ? 'bg-green-500/10 text-green-600' : 'bg-secondary text-muted-foreground'
            )}>{status}</Badge>
         </div>
         <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full h-10 w-10 hover:bg-primary/10 hover:text-primary transition-all shrink-0"
              onClick={onView}
              title="View Ticket"
            >
              <Eye className="w-5 h-5" />
            </Button>
         </div>
      </div>
    </div>
  );
}
