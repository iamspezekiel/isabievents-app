"use client";

import React, { useState, useEffect } from 'react';
import { Scan, Search, CheckCircle, AlertCircle, RefreshCcw, History, Users, X, ArrowLeft, User, Ticket, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';

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
  
  // Pre-populate with some recent check-ins for a "live" feel
  const [history, setHistory] = useState<any[]>([
    { id: 'TKT-E1-029', name: 'Sylvanus P. Ezekiel', time: '10:45 AM', type: 'VIP Pass' },
    { id: 'TKT-E3-112', name: 'Chioma Okereke', time: '10:42 AM', type: 'Standard Entry' },
    { id: 'TKT-E2-005', name: 'Tunde Bakare', time: '10:35 AM', type: 'Early Bird' },
  ]);
  
  const { toast } = useToast();

  const handleScan = async () => {
    setScanState('validating');
    
    // Simulate network/validation delay
    await new Promise(r => setTimeout(r, 1800));
    
    const isSuccess = Math.random() > 0.10; // 90% success rate for simulation
    
    if (isSuccess) {
      const attendee = MOCK_ATTENDEES[Math.floor(Math.random() * MOCK_ATTENDEES.length)];
      setScanState('success');
      
      const entry = {
        id: attendee.id || Math.random().toString(36).substr(2, 9).toUpperCase(),
        name: attendee.name,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: attendee.type
      };
      
      setHistory([entry, ...history]);
      toast({ 
        title: "Access Granted", 
        description: `${attendee.name} has been checked in.` 
      });
    } else {
      setScanState('error');
      toast({ 
        variant: "destructive", 
        title: "Access Denied", 
        description: "This ticket has already been used or is invalid." 
      });
    }
  };

  const handleManualLookup = async () => {
    if (!lookupQuery) return;
    
    setScanState('validating');
    setManualMode(false);
    
    await new Promise(r => setTimeout(r, 1200));
    
    // Check if query matches any name or ID in mock list
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

  const resetScanner = () => setScanState('idle');

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col pt-48">
      <header className="border-b border-border p-4 bg-card flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/">
             <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </Link>
          <div className="flex flex-col items-start">
            <h1 className="font-headline text-lg">Gate Check-In</h1>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Session Active</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <Badge className="bg-primary/20 text-primary border-none hidden sm:inline-flex">Main Entrance</Badge>
           <Badge variant="outline" className="font-mono">GATE-04</Badge>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-4 md:p-8">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Scanner UI */}
          <Card className="border-border bg-card overflow-hidden rounded-[2.5rem] shadow-2xl relative">
            <CardContent className="p-0">
              <div className={`aspect-square relative flex flex-col items-center justify-center transition-colors duration-700 ${
                scanState === 'success' ? 'bg-green-500/10' : 
                scanState === 'error' ? 'bg-red-500/10' : 
                'bg-black/95'
              }`}>
                
                {/* Visual Feedback Overlays */}
                {scanState === 'idle' && (
                  <>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                       <div className="w-72 h-72 border-2 border-primary/40 rounded-[2rem] border-dashed animate-pulse" />
                    </div>
                    {/* Scanning Line Animation */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-[scan_2s_ease-in-out_infinite] opacity-50 shadow-[0_0_15px_rgba(126,124,255,0.8)]" />
                    
                    <div className="z-10 text-center space-y-6">
                      <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-primary/20">
                        <Scan className="w-12 h-12 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-white font-bold text-xl">Ready to Scan</p>
                        <p className="text-muted-foreground text-sm">Position QR Code within the frame</p>
                      </div>
                      <Button 
                        onClick={handleScan} 
                        className="rounded-full px-12 h-16 text-lg shadow-xl shadow-primary/20 font-black hover:scale-105 transition-transform"
                      >
                        Simulate Scan
                      </Button>
                    </div>
                  </>
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
                  <div className="text-center space-y-6 animate-in zoom-in-95 duration-500">
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
                    <Button onClick={resetScanner} className="mt-4 rounded-full px-10 h-12 font-bold">
                      Next Attendee
                    </Button>
                  </div>
                )}

                {scanState === 'error' && (
                  <div className="text-center space-y-6 animate-in zoom-in-95 duration-500">
                    <div className="w-28 h-28 bg-red-500/20 rounded-full flex items-center justify-center mx-auto border-4 border-red-500/50">
                      <AlertCircle className="w-16 h-16 text-red-500" />
                    </div>
                    <div className="space-y-2">
                      <h2 className="font-headline text-4xl text-red-500 tracking-tighter uppercase italic">Access Denied</h2>
                      <p className="text-muted-foreground font-medium px-8 leading-relaxed">Invalid or duplicate ticket ID.</p>
                    </div>
                    <Button onClick={resetScanner} variant="outline" className="mt-4 rounded-full px-10 h-12 font-bold border-red-500/50 text-red-500 hover:bg-red-500/5">
                      Try Again
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats & Search */}
          <div className="grid grid-cols-2 gap-4">
            <Button onClick={() => setManualMode(true)} variant="secondary" className="h-24 rounded-[1.5rem] gap-3 flex-col sm:flex-row border-border border">
              <Search className="w-6 h-6 text-primary" /> 
              <div className="text-left leading-none">
                <div className="font-bold text-sm">Manual Lookup</div>
                <div className="text-[10px] text-muted-foreground mt-1 uppercase font-bold tracking-tight">Search by ID/Name</div>
              </div>
            </Button>
            <div className="h-24 rounded-[1.5rem] bg-card border border-border flex items-center justify-center gap-4 shadow-sm">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div className="text-left leading-tight">
                <div className="font-black text-3xl">{history.length + 42}</div>
                <div className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">Entries Today</div>
              </div>
            </div>
          </div>

          {/* Recent Check-ins List */}
          <section className="space-y-6 text-left pt-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="font-headline text-xl flex items-center gap-2 leading-none">
                  <Activity className="w-5 h-5 text-primary" /> Recent Check-ins
                </h3>
                <p className="text-xs text-muted-foreground font-medium">Activity from your current gate</p>
              </div>
              <Button variant="ghost" size="sm" className="text-xs font-bold text-primary rounded-full hover:bg-primary/5">
                View Full Log
              </Button>
            </div>
            
            <div className="space-y-3">
              {history.map((entry, idx) => (
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
