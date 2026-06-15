
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Scan, Search, CheckCircle, AlertCircle, RefreshCcw, History, Users, X, ArrowLeft, User, Ticket, Activity, Camera, CameraOff, Bell, FileText } from 'lucide-react';
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
  { name: 'Sylvanus P. Ezekiel', type: 'VIP Pass', id: 'TKT-E1-029' },
  { name: 'Chioma Okereke', type: 'Standard Entry', id: 'TKT-E3-112' },
  { name: 'Tunde Bakare', type: 'Early Bird', id: 'TKT-E2-005' },
  { name: 'Aisha Bello', type: 'VIP Pass', id: 'TKT-E1-088' },
  { name: 'Emeka Nwosu', type: 'Exhibitor', id: 'TKT-V-992' },
  { name: 'Fatima Yusuf', type: 'Standard Entry', id: 'TKT-E10-441' },
  { name: 'Olumide Williams', type: 'Speaker', id: 'TKT-E2-SPK' },
];

export default function StaffCheckIn() {
  const [scanState, setScanState] = useState<'idle' | 'validating' | 'success' | 'error'>('idle');
  const [manualMode, setManualMode] = useState(false);
  const [lookupQuery, setLookupQuery] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historySearch, setHistorySearch] = useState('');
  
  const scannerRef = useRef<Html5Qrcode | null>(null);
  
  const [history, setHistory] = useState<any[]>([
    { id: 'TKT-E1-029', name: 'Sylvanus P. Ezekiel', time: '10:45 AM', type: 'VIP Pass' },
    { id: 'TKT-E3-112', name: 'Chioma Okereke', time: '10:42 AM', type: 'Standard Entry' },
    { id: 'TKT-E2-005', name: 'Tunde Bakare', time: '10:35 AM', type: 'Early Bird' },
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

  const handleValidation = async (ticketId: string) => {
    await stopScanner();
    setScanState('validating');
    
    await new Promise(r => setTimeout(r, 1500));
    
    const attendee = MOCK_ATTENDEES.find(a => 
      ticketId.toUpperCase().includes(a.id.toUpperCase()) || 
      a.id.toUpperCase().includes(ticketId.toUpperCase())
    );

    if (attendee) {
      setScanState('success');
      const entry = {
        id: attendee.id,
        name: attendee.name,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: attendee.type
      };
      setHistory([entry, ...history]);
      toast({ title: "Access Granted", description: `${attendee.name} checked in.` });
    } else {
      if (Math.random() > 0.2) {
         const randomAttendee = MOCK_ATTENDEES[Math.floor(Math.random() * MOCK_ATTENDEES.length)];
         setScanState('success');
         const entry = {
           id: ticketId.substring(0, 10).toUpperCase(),
           name: randomAttendee.name,
           time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
           type: randomAttendee.type
         };
         setHistory([entry, ...history]);
      } else {
        setScanState('error');
        toast({ variant: "destructive", title: "Invalid Ticket", description: "This code does not match any valid records." });
      }
    }
  };

  const handleSimulate = async () => {
    setScanState('validating');
    await new Promise(r => setTimeout(r, 1200));
    const attendee = MOCK_ATTENDEES[Math.floor(Math.random() * MOCK_ATTENDEES.length)];
    setScanState('success');
    setHistory([{
      id: attendee.id,
      name: attendee.name,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: attendee.type
    }, ...history]);
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
      toast({ title: "Found Attendee", description: `${found.name} validated manually.` });
    } else {
      setScanState('error');
      toast({ variant: "destructive", title: "Not Found", description: "No attendee found matching that ID or Name." });
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
          <div className="flex flex-col items-start">
            <h1 className="font-headline text-lg text-left">Gate Check-In</h1>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Session Active</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="ghost" size="icon" className="rounded-full relative" asChild title="Notifications">
            <Link href="/dashboard/attendee/notifications">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-background" />
            </Link>
          </Button>
           <Badge className="bg-primary/20 text-primary border-none hidden sm:inline-flex">Main Entrance</Badge>
           <Badge variant="outline" className="font-mono">GATE-04</Badge>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-4 md:p-8 pt-0">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card className="mt-4 border-border bg-card overflow-hidden rounded-[2.5rem] shadow-2xl relative">
            <CardContent className="p-0">
              <div className={cn(
                "aspect-square relative flex flex-col items-center justify-center transition-colors duration-700",
                scanState === 'success' ? 'bg-green-500/10' : 
                scanState === 'error' ? 'bg-red-500/10' : 
                'bg-black/95'
              )}>
                
                {isCameraActive && scanState === 'idle' && (
                  <div id="reader" className="absolute inset-0 w-full h-full [&_video]:object-cover [&_video]:w-full [&_video]:h-full" />
                )}

                {scanState === 'idle' && !isCameraActive && (
                  <div className="z-10 text-center space-y-6 p-8">
                    <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-primary/20">
                      <Scan className="w-12 h-12 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-white font-bold text-xl">Ready to Scan</p>
                      <p className="text-muted-foreground text-sm">Activate the scanner to process attendees</p>
                    </div>
                    <div className="flex flex-col gap-3">
                      <Button 
                        onClick={startScanner} 
                        className="rounded-full px-12 h-16 text-lg shadow-xl shadow-primary/20 font-black hover:scale-105 transition-transform gap-3"
                      >
                        <Camera className="w-6 h-6" /> Launch Scanner
                      </Button>
                      <Button variant="ghost" onClick={handleSimulate} className="text-muted-foreground hover:text-white">
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
                      <CameraOff className="w-4 h-4" /> Stop Scanner
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
                    <div className="space-y-2">
                      <p className="font-headline text-2xl tracking-tight">Validating...</p>
                      <p className="text-muted-foreground text-xs uppercase font-black tracking-widest">Checking Ledger</p>
                    </div>
                  </div>
                )}

                {scanState === 'success' && (
                  <div className="text-center space-y-6 animate-in zoom-in-95 duration-500 p-8">
                    <div className="w-28 h-28 bg-green-500/20 rounded-full flex items-center justify-center mx-auto border-4 border-green-500/50">
                      <CheckCircle className="w-16 h-16 text-green-500" />
                    </div>
                    <div className="space-y-2">
                      <h2 className="font-headline text-4xl text-green-500 tracking-tighter uppercase italic">Access Granted</h2>
                      <div className="bg-background/80 backdrop-blur-sm border border-border p-4 rounded-2xl inline-block min-w-[240px]">
                        <p className="text-lg font-black">{history[0]?.name}</p>
                        <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">{history[0]?.type}</p>
                      </div>
                    </div>
                    <Button onClick={startScanner} className="mt-4 rounded-full px-10 h-12 font-bold">
                      Scan Next
                    </Button>
                  </div>
                )}

                {scanState === 'error' && (
                  <div className="text-center space-y-6 animate-in zoom-in-95 duration-500 p-8">
                    <div className="w-28 h-28 bg-red-500/20 rounded-full flex items-center justify-center mx-auto border-4 border-green-500/50">
                      <AlertCircle className="w-16 h-16 text-red-500" />
                    </div>
                    <div className="space-y-2">
                      <h2 className="font-headline text-4xl text-red-500 tracking-tighter uppercase italic">Access Denied</h2>
                      <p className="text-muted-foreground font-medium leading-relaxed">Invalid or duplicate ticket ID.</p>
                    </div>
                    <Button onClick={startScanner} variant="outline" className="mt-4 rounded-full px-10 h-12 font-bold border-red-500/50 text-red-500 hover:bg-red-500/5">
                      Try Again
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
              className="h-14 rounded-xl p-2.5 flex items-center justify-start gap-3 border-border border transition-all hover:bg-secondary/80"
            >
              <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                <Search className="w-4 h-4 text-primary" />
              </div>
              <div className="text-left leading-tight overflow-hidden">
                <div className="font-bold text-xs truncate">Manual Lookup</div>
                <div className="text-[8px] text-muted-foreground uppercase font-bold tracking-tight line-clamp-1">Search ID/Name</div>
              </div>
            </Button>
            <div className="h-14 rounded-xl bg-card border border-border flex items-center justify-start gap-3 p-2.5 shadow-sm">
              <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                <Users className="w-4 h-4 text-primary" />
              </div>
              <div className="text-left leading-tight overflow-hidden">
                <div className="font-black text-lg">{history.length + 42}</div>
                <div className="text-[8px] text-muted-foreground uppercase font-black tracking-tighter line-clamp-1">Entries Today</div>
              </div>
            </div>
          </div>

          <section className="space-y-6 text-left pt-2">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="font-headline text-xl flex items-center gap-2 leading-none">
                  <Activity className="w-5 h-5 text-primary" /> Recent Check-ins
                </h3>
                <p className="text-xs text-muted-foreground font-medium">Activity from your current gate</p>
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
                  className="bg-card border border-border p-5 rounded-2xl flex items-center justify-between animate-in slide-in-from-top-4 duration-500 shadow-sm hover:border-primary/30 transition-colors"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                       <User className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-base leading-tight">{entry.name}</div>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="text-[10px] text-muted-foreground font-mono flex items-center gap-1 uppercase font-bold">
                          <Ticket className="w-3 h-3" /> {entry.id}
                        </span>
                        <Badge variant="secondary" className="bg-secondary/80 text-[9px] h-4 py-0 px-2 font-bold uppercase tracking-widest">{entry.type}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-black text-foreground">{entry.time}</div>
                    <div className="flex items-center gap-1 justify-end mt-1">
                       <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                       <span className="text-[8px] font-black uppercase text-green-600 tracking-tighter">Verified</span>
                    </div>
                  </div>
                </div>
              ))}
              
              {history.length === 0 && (
                <div className="text-center py-20 bg-card/40 rounded-[2.5rem] border border-dashed border-border/50">
                  <div className="w-14 h-14 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4 opacity-30">
                    <History className="w-7 h-7" />
                  </div>
                  <p className="text-muted-foreground text-sm font-medium">No check-ins recorded for this session yet.</p>
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
                  <FileText className="w-6 h-6 text-primary" /> Entry History
                </DialogTitle>
                <DialogDescription>Full log of check-ins for the current session.</DialogDescription>
              </div>
              <Badge variant="outline" className="font-mono h-6">{history.length} Entries</Badge>
            </div>
            <div className="relative mt-2 mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search by name or ticket ID..." 
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
                  <p className="text-[8px] text-primary uppercase font-bold">{entry.type}</p>
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

      {/* Manual Lookup Modal */}
      {manualMode && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <Card className="w-full max-w-md bg-card border-border relative rounded-[2rem] shadow-2xl">
            <Button variant="ghost" size="icon" className="absolute top-4 right-4 rounded-full" onClick={() => setManualMode(false)}>
              <X className="w-5 h-5" />
            </Button>
            <CardHeader className="pt-8 px-8 text-left">
              <CardTitle className="font-headline text-2xl">Manual Entry</CardTitle>
              <p className="text-muted-foreground text-sm">Search the digital register by ticket ID or name.</p>
            </CardHeader>
            <CardContent className="space-y-6 p-8">
              <div className="space-y-2 text-left">
                <Input 
                  placeholder="ID (e.g. TKT-E1-029) or Name" 
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
                  Search Register
                </Button>
              </div>
              <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest font-black">
                Pro Tip: Search for "Sylvanus" or "TKT-E1-029"
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Custom Keyframe for Scan Animation */}
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
