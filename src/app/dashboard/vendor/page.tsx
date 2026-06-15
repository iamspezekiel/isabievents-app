"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Scan, Store, CheckCircle, AlertCircle, RefreshCcw, History, ShoppingBag, X, ArrowLeft, User, Ticket, Activity, Camera, CameraOff, Bell, FileText, CheckCircle2, AlertTriangle, Sparkles, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import Link from 'next/link';
import { Html5Qrcode } from 'html5-qrcode';
import { cn } from '@/lib/utils';

const MOCK_ATTENDEES = [
  { name: 'Sylvanus P. Ezekiel', type: 'Meal Voucher', id: 'VCH-M-029' },
  { name: 'Chioma Okereke', type: 'Drink Token', id: 'VCH-D-112' },
  { name: 'Tunde Bakare', type: 'VIP Meal', id: 'VCH-V-005' },
  { name: 'Aisha Bello', type: 'Drink Token', id: 'VCH-D-088' },
  { name: 'Emeka Nwosu', type: 'Meal Voucher', id: 'VCH-M-992' },
];

export default function VendorPortal() {
  const [scanState, setScanState] = useState<'idle' | 'validating' | 'success' | 'error'>('idle');
  const [manualMode, setManualMode] = useState(false);
  const [lookupQuery, setLookupQuery] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historySearch, setHistorySearch] = useState('');
  
  const scannerRef = useRef<Html5Qrcode | null>(null);
  
  const [history, setHistory] = useState<any[]>([
    { id: 'VCH-M-029', name: 'Sylvanus P. Ezekiel', time: '12:15 PM', type: 'Meal Voucher' },
    { id: 'VCH-D-112', name: 'Chioma Okereke', time: '12:10 PM', type: 'Drink Token' },
  ]);
  
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
      } catch (err) {
        console.error('Failed to stop scanner', err);
      }
    }
    setIsCameraActive(false);
  };

  const startScanner = async () => {
    setIsCameraActive(true);
    setScanState('idle');
    
    setTimeout(async () => {
      try {
        const html5QrCode = new Html5Qrcode("reader");
        scannerRef.current = html5QrCode;
        
        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            handleValidation(decodedText);
          },
          (errorMessage) => {}
        );
      } catch (err) {
        console.error("Camera start error", err);
        setIsCameraActive(false);
        toast({
          variant: "destructive",
          title: "Camera Error",
          description: "Could not access camera. Please check permissions."
        });
      }
    }, 100);
  };

  const handleSimulate = async () => {
    setScanState('validating');
    await new Promise(r => setTimeout(r, 1200));
    const attendee = MOCK_ATTENDEES[Math.floor(Math.random() * MOCK_ATTENDEES.length)];
    setScanState('success');
    const entry = {
      id: attendee.id,
      name: attendee.name,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: attendee.type
    };
    setHistory([entry, ...history]);
    toast({ title: "Voucher Verified", description: `${attendee.name}'s ${attendee.type} is valid.` });
  };

  const handleValidation = async (ticketId: string) => {
    await stopScanner();
    setScanState('validating');
    
    await new Promise(r => setTimeout(r, 1500));
    
    const found = MOCK_ATTENDEES.find(a => 
      ticketId.toUpperCase().includes(a.id.toUpperCase()) || 
      a.id.toUpperCase().includes(ticketId.toUpperCase())
    );

    if (found) {
      setScanState('success');
      const entry = {
        id: found.id,
        name: found.name,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: found.type
      };
      setHistory([entry, ...history]);
      toast({ title: "Voucher Verified", description: `${found.name}'s ${found.type} is valid.` });
    } else {
      if (Math.random() > 0.2) {
         const random = MOCK_ATTENDEES[Math.floor(Math.random() * MOCK_ATTENDEES.length)];
         setScanState('success');
         const entry = {
           id: ticketId.substring(0, 10).toUpperCase(),
           name: random.name,
           time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
           type: random.type
         };
         setHistory([entry, ...history]);
      } else {
        setScanState('error');
        toast({ variant: "destructive", title: "Invalid Voucher", description: "This code is invalid or has already been used." });
      }
    }
  };

  const handleManualLookup = async () => {
    if (!lookupQuery) return;
    
    setScanState('validating');
    setManualMode(false);
    
    await new Promise(r => setTimeout(r, 1200));
    
    const found = MOCK_ATTENDEES.find(a => 
      a.name.toLowerCase().includes(lookupQuery.toLowerCase()) || 
      a.id.toLowerCase().includes(lookupQuery.toLowerCase())
    );

    if (found) {
      setScanState('success');
      const entry = {
        id: found.id,
        name: found.name,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: found.type
      };
      setHistory([entry, ...history]);
      toast({ title: "Found Voucher", description: `${found.name} validated manually.` });
    } else {
      setScanState('error');
      toast({ variant: "destructive", title: "Not Found", description: "No voucher found matching that ID or Name." });
    }
    setLookupQuery('');
  };

  const filteredHistory = history.filter(item => 
    item.name.toLowerCase().includes(historySearch.toLowerCase()) ||
    item.id.toLowerCase().includes(historySearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col pt-0">
      <header className="border-b border-border p-4 bg-card flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/">
             <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </Link>
          <div className="flex flex-col items-start text-left">
            <h1 className="font-headline text-lg">Vendor Portal</h1>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Voucher Validation</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="ghost" size="icon" className="rounded-full relative" asChild title="Notifications">
            <Link href="/dashboard/attendee/notifications">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-background" />
            </Link>
          </Button>
           <Badge className="bg-primary/20 text-primary border-none hidden sm:inline-flex">Cold Sips Drinks</Badge>
           <Badge variant="outline" className="font-mono">VEN-08</Badge>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-4 md:p-8 pt-0">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card className="m-4 border-border bg-card overflow-hidden rounded-[2.5rem] shadow-2xl relative">
            <CardContent className="p-0">
              <div className={cn(
                "aspect-square relative flex flex-col items-center justify-center transition-all duration-1000",
                scanState === 'success' ? 'bg-gradient-to-br from-green-500/20 via-green-500/5 to-background' : 
                scanState === 'error' ? 'bg-gradient-to-br from-red-500/20 via-red-500/5 to-background' : 
                'bg-black/95'
              )}>
                
                {isCameraActive && scanState === 'idle' && (
                  <div id="reader" className="absolute inset-0 w-full h-full [&_video]:object-cover [&_video]:w-full [&_video]:h-full" />
                )}

                {scanState === 'idle' && !isCameraActive && (
                  <div className="z-10 text-center space-y-6 p-8">
                    <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-primary/20 animate-in fade-in zoom-in duration-500">
                      <ShoppingBag className="w-12 h-12 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-white font-bold text-xl">Ready to Serve</p>
                      <p className="text-muted-foreground text-sm">Scan customer vouchers to fulfill orders</p>
                    </div>
                    <div className="flex flex-col gap-3 items-center">
                      <Button 
                        onClick={startScanner} 
                        className="rounded-full px-6 h-10 text-xs shadow-xl shadow-primary/20 font-black hover:scale-105 transition-transform gap-2.5"
                      >
                        <Camera className="w-4 h-4" /> Open Scanner
                      </Button>
                      <Button variant="ghost" onClick={handleSimulate} className="text-muted-foreground hover:text-white text-[10px]">
                        Simulate Success
                      </Button>
                    </div>
                  </div>
                )}

                {isCameraActive && scanState === 'idle' && (
                  <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-end p-8 pb-12">
                    <div className="w-full max-w-[250px] aspect-square border-2 border-primary/60 border-dashed rounded-3xl relative mb-12">
                        <div className="absolute top-0 left-0 w-full h-0.5 bg-primary animate-[scan_2.5s_ease-in-out_infinite] shadow-[0_0_15px_hsl(var(--primary))]" />
                    </div>
                    <Button 
                      onClick={stopScanner} 
                      variant="destructive" 
                      className="pointer-events-auto rounded-full px-8 h-12 gap-2"
                    >
                      <CameraOff className="w-4 h-4" /> Close Scanner
                    </Button>
                  </div>
                )}

                {scanState === 'validating' && (
                  <div className="text-center space-y-6 animate-in fade-in duration-500">
                    <div className="relative">
                      <RefreshCcw className="w-20 h-20 text-primary animate-spin mx-auto" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10 bg-primary/20 rounded-full animate-ping" />
                      </div>
                    </div>
                    <p className="font-headline text-2xl tracking-tight">Verifying Voucher...</p>
                  </div>
                )}

                {scanState === 'success' && (
                  <div className="text-center space-y-4 animate-in zoom-in-95 duration-500 p-6 w-full max-w-sm">
                    <div className="relative mx-auto w-16 h-16">
                      <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-20" />
                      <div className="relative w-full h-full bg-green-500 rounded-full flex items-center justify-center border-4 border-white dark:border-background shadow-xl">
                        <CheckCircle2 className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <h2 className="font-headline text-2xl text-green-500 tracking-tighter uppercase italic leading-none">Voucher Valid</h2>
                        <p className="text-[9px] font-black tracking-[0.3em] text-green-600/60 uppercase">Well Cooked!</p>
                      </div>
                      
                      <div className="bg-card/40 backdrop-blur-md border border-green-500/20 p-4 rounded-[1.5rem] shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-3 opacity-10">
                          <Sparkles className="w-8 h-8 text-green-500" />
                        </div>
                        <div className="relative z-10 text-left space-y-3">
                          <div className="space-y-0.5">
                            <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Customer Name</p>
                            <p className="text-lg font-black leading-none truncate">{history[0]?.name}</p>
                          </div>
                          <div className="flex items-center justify-between gap-3 pt-3 border-t border-border/50">
                            <div className="space-y-0.5">
                              <p className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">Service</p>
                              <Badge className="bg-green-500/10 text-green-600 border-none px-2 h-4 text-[8px] font-black uppercase tracking-tighter">
                                {history[0]?.type}
                              </Badge>
                            </div>
                            <div className="text-right space-y-0.5">
                              <p className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">Voucher ID</p>
                              <p className="font-mono text-[9px] font-bold opacity-60 uppercase">{history[0]?.id}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button 
                      onClick={startScanner} 
                      className="w-full rounded-full h-11 text-sm font-black bg-green-500 hover:bg-green-600 shadow-xl shadow-green-500/20 gap-2"
                    >
                      <Scan className="w-4 h-4" /> Scan Next
                    </Button>
                  </div>
                )}

                {scanState === 'error' && (
                  <div className="text-center space-y-4 animate-in zoom-in-95 duration-500 p-6 w-full max-w-sm">
                    <div className="relative mx-auto w-16 h-16">
                      <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-20" />
                      <div className="relative w-full h-full bg-red-500 rounded-full flex items-center justify-center border-4 border-white dark:border-background shadow-xl">
                        <AlertTriangle className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <h2 className="font-headline text-2xl text-red-500 tracking-tighter uppercase italic leading-none">Invalid</h2>
                        <p className="text-[9px] font-black tracking-[0.3em] text-red-600/60 uppercase">Verification Failed</p>
                      </div>
                      
                      <div className="bg-card/40 backdrop-blur-md border border-red-500/20 p-6 rounded-[1.5rem] shadow-2xl">
                        <p className="text-xs font-medium text-muted-foreground leading-relaxed">
                          This voucher is either invalid, already fulfilled, or doesn't belong to this vendor.
                        </p>
                      </div>
                    </div>

                    <Button 
                      onClick={startScanner} 
                      variant="outline"
                      className="w-full rounded-full h-11 text-sm font-black border-red-500/50 text-red-500 hover:bg-red-500/5 gap-2"
                    >
                      <RefreshCcw className="w-4 h-4" /> Try Again
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-3">
            <Button 
              onClick={() => setManualMode(true)} 
              variant="secondary" 
              className="h-10 rounded-xl p-2.5 flex items-center justify-start gap-3 border-border border transition-all hover:bg-secondary/80"
            >
              <div className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                <RefreshCcw className="w-3.5 h-3.5 text-primary" />
              </div>
              <div className="text-left leading-tight overflow-hidden">
                <div className="font-bold text-[10px] truncate">Manual Code</div>
                <div className="text-[7px] text-muted-foreground uppercase font-bold line-clamp-1">Input Voucher ID</div>
              </div>
            </Button>
            <div className="h-10 rounded-xl bg-card border border-border flex items-center justify-start gap-3 p-2.5 shadow-sm">
              <div className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                <Store className="w-3.5 h-3.5 text-primary" />
              </div>
              <div className="text-left leading-tight overflow-hidden">
                <div className="font-black text-sm">{history.length + 15}</div>
                <div className="text-[7px] text-muted-foreground uppercase font-black tracking-tighter line-clamp-1">Items Served</div>
              </div>
            </div>
          </div>

          <section className="space-y-6 text-left pt-2">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="font-headline text-xl flex items-center gap-2 leading-none">
                  <Activity className="w-5 h-5 text-primary" /> Fulfillment Log
                </h3>
                <p className="text-xs text-muted-foreground font-medium">Activity from your current station</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs font-bold text-primary rounded-full hover:bg-primary/5 h-8"
                onClick={() => setIsHistoryOpen(true)}
              >
                View Full Log
              </Button>
            </div>
            
            <div className="space-y-3">
              {history.slice(0, 5).map((entry, idx) => (
                <div 
                  key={idx} 
                  className="bg-card border border-border p-5 rounded-2xl flex items-center justify-between animate-in slide-in-from-top-4 duration-500 shadow-sm"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                       <User className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-base leading-tight">{entry.name}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="bg-secondary/80 text-[9px] h-4 py-0 px-2 font-bold uppercase tracking-widest">{entry.type}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-black text-foreground">{entry.time}</div>
                    <div className="flex items-center gap-1 justify-end mt-1">
                       <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                       <span className="text-[8px] font-black uppercase text-green-600 tracking-tighter">Fulfilled</span>
                    </div>
                  </div>
                </div>
              ))}
              
              {history.length === 0 && (
                <div className="text-center py-20 bg-card/40 rounded-[2.5rem] border border-dashed border-border/50">
                  <div className="w-14 h-14 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4 opacity-30">
                    <History className="w-7 h-7" />
                  </div>
                  <p className="text-muted-foreground text-sm font-medium">No fulfillments recorded for this session yet.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* Full History Dialog */}
      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent className="bg-card border-border sm:rounded-[2rem] max-w-2xl w-[94vw] h-[80vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-0 text-left">
            <div className="flex items-center justify-between mb-4">
              <div className="space-y-1">
                <DialogTitle className="font-headline text-2xl flex items-center gap-2">
                  <FileText className="w-6 h-6 text-primary" /> Fulfillment History
                </DialogTitle>
                <DialogDescription>Full log of items served during this session.</DialogDescription>
              </div>
              <Badge variant="outline" className="font-mono h-6">{history.length} Items</Badge>
            </div>
            <div className="relative mt-2 mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search by customer name or voucher ID..." 
                className="pl-10 h-11 bg-secondary/50 border-none rounded-xl"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
              />
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-6 pt-0 space-y-3">
            {filteredHistory.map((entry, idx) => (
              <div key={idx} className="bg-secondary/30 p-4 rounded-xl border border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center shadow-sm">
                    <User className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-sm leading-none">{entry.name}</p>
                    <p className="text-[10px] text-muted-foreground font-mono mt-1 uppercase">{entry.id}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black">{entry.time}</p>
                  <p className="text-[8px] text-green-600 uppercase font-bold">{entry.type}</p>
                </div>
              </div>
            ))}
            {filteredHistory.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-sm italic">No entries found matching your search.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {manualMode && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <Card className="w-full max-w-md bg-card border-border relative rounded-[2rem] shadow-2xl">
            <Button variant="ghost" size="icon" className="absolute top-4 right-4 rounded-full" onClick={() => setManualMode(false)}>
              <X className="w-5 h-5" />
            </Button>
            <CardHeader className="pt-8 px-8 text-left">
              <CardTitle className="font-headline text-2xl">Voucher Lookup</CardTitle>
              <p className="text-muted-foreground text-sm">Enter the code printed under the QR or the customer's name.</p>
            </CardHeader>
            <CardContent className="space-y-6 p-8">
              <div className="space-y-2">
                <Input 
                  placeholder="e.g. VCH-M-029" 
                  className="h-14 bg-secondary border-none text-lg rounded-xl"
                  value={lookupQuery}
                  onChange={(e) => setLookupQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleManualLookup()}
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 h-12 rounded-xl font-bold" onClick={() => setManualMode(false)}>Cancel</Button>
                <Button className="flex-1 h-12 rounded-xl font-bold shadow-lg shadow-primary/20" onClick={handleManualLookup}>
                  Validate Code
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <style jsx global>{`
        @keyframes scan {
          0% { top: 0; }
          50% { top: 100%; }
          100% { top: 0; }
        }
      `}</style>
    </div>
  );
}
