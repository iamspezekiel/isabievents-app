
"use client";

import React, { useState } from 'react';
import { History, Search, Download, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const MOCK_ORDERS = [
  { id: 'ORD-7721', event: 'Lagos Jazz Night', date: 'Oct 12, 2024', amount: '₦15,000', status: 'Success' },
  { id: 'ORD-5529', event: 'Naija Tech Summit', date: 'Sep 28, 2024', amount: '₦0', status: 'Free' },
  { id: 'ORD-3310', event: 'Beach Bash Lagos', date: 'Aug 15, 2024', amount: '₦10,000', status: 'Success' },
  { id: 'ORD-9912', event: 'Calabar Carnival', date: 'Dec 27, 2023', amount: '₦0', status: 'Free' },
];

export default function OrderHistoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const filteredOrders = MOCK_ORDERS.filter(order => 
    order.event.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDownload = async (id: string) => {
    setDownloadingId(id);
    // Simulate network delay for document generation
    await new Promise(r => setTimeout(r, 1500));
    setDownloadingId(null);
    toast({
      title: "Invoice Downloaded",
      description: `Invoice ${id} has been saved to your device.`,
    });
  };

  return (
    <div className="p-4 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8 text-left">
        <div className="text-left">
          <h1 className="font-headline mb-2 text-3xl md:text-5xl tracking-tighter">Order History</h1>
          <p className="text-muted-foreground font-medium">View and download invoices for all your past purchases.</p>
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
                onDownload={() => handleDownload(order.id)}
                isDownloading={downloadingId === order.id}
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
    </div>
  );
}

function OrderRow({ id, event, date, amount, status, onDownload, isDownloading }: any) {
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
      <div className="flex items-center justify-between w-full sm:w-auto gap-4 sm:gap-8 border-t sm:border-none pt-4 sm:pt-0">
         <div className="text-left sm:text-right">
            <div className="font-black text-primary text-base md:text-lg leading-tight">{amount}</div>
            <Badge variant="secondary" className={cn(
              "text-[9px] md:text-[10px] font-bold uppercase tracking-widest border-none h-5",
              status === 'Success' ? 'bg-green-500/10 text-green-600' : 'bg-secondary text-muted-foreground'
            )}>{status}</Badge>
         </div>
         <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full h-11 w-11 hover:bg-primary/10 hover:text-primary transition-all shrink-0"
          onClick={onDownload}
          disabled={isDownloading}
          title="Download Invoice"
         >
          {isDownloading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
         </Button>
      </div>
    </div>
  );
}
