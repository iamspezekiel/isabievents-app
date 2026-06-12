"use client";

import React, { useState, useEffect } from 'react';
import { Scan, Search, CheckCircle, AlertCircle, RefreshCcw, History, Users, X, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';

export default function StaffCheckIn() {
  const [scanState, setScanState] = useState<'idle' | 'validating' | 'success' | 'error'>('idle');
  const [manualMode, setManualMode] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const { toast } = useToast();

  const handleScan = async () => {
    setScanState('validating');
    await new Promise(r => setTimeout(r, 1500));
    const isSuccess = Math.random() > 0.2;
    
    if (isSuccess) {
      setScanState('success');
      const entry = {
        id: Math.random().toString(36).substr(2, 9).toUpperCase(),
        name: 'John Doe',
        time: new Date().toLocaleTimeString(),
        type: 'VIP Access'
      };
      setHistory([entry, ...history]);
      toast({ title: "Check-in Successful", description: "VIP Ticket Validated" });
    } else {
      setScanState('error');
      toast({ variant: "destructive", title: "Invalid Ticket", description: "This ticket has already been used or is expired." });
    }
  };

  const resetScanner = () => setScanState('idle');

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col pt-48">
      <header className="border-b border-border p-4 bg-card flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/">
             <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </Link>
          <h1 className="font-headline text-lg">Gate Check-In</h1>
        </div>
        <Badge className="bg-primary/20 text-primary border-none">Main Entrance</Badge>
      </header>

      <main className="flex-1 overflow-auto p-4 md:p-8">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Scanner UI */}
          <Card className="border-border bg-card overflow-hidden rounded-3xl shadow-2xl">
            <CardContent className="p-0">
              <div className={`aspect-square relative flex flex-col items-center justify-center transition-colors duration-500 ${
                scanState === 'success' ? 'bg-primary/20' : 
                scanState === 'error' ? 'bg-red-500/20' : 
                'bg-black/50'
              }`}>
                {scanState === 'idle' && (
                  <>
                    <div className="w-64 h-64 border-2 border-primary/50 rounded-3xl border-dashed flex items-center justify-center animate-pulse">
                      <Scan className="w-20 h-20 text-primary opacity-50" />
                    </div>
                    <p className="mt-8 text-muted-foreground font-medium">Position QR Code within frame</p>
                    <Button onClick={handleScan} className="mt-6 rounded-full px-12 h-14 text-lg">
                      Simulate Scan
                    </Button>
                  </>
                )}

                {scanState === 'validating' && (
                  <div className="text-center space-y-4">
                    <RefreshCcw className="w-16 h-16 text-primary animate-spin mx-auto" />
                    <p className="font-headline text-xl">Validating Ticket...</p>
                  </div>
                )}

                {scanState === 'success' && (
                  <div className="text-center space-y-4 animate-in zoom-in-90 duration-300">
                    <CheckCircle className="w-24 h-24 text-primary mx-auto" />
                    <div>
                      <h2 className="font-headline text-3xl text-primary text-balance">ACCESS GRANTED</h2>
                      <p className="text-lg font-medium mt-2">VIP PASS • ADMIT ONE</p>
                    </div>
                    <Button onClick={resetScanner} variant="outline" className="mt-6 rounded-full px-10 border-primary/50 text-primary hover:bg-primary/10">
                      Next Attendee
                    </Button>
                  </div>
                )}

                {scanState === 'error' && (
                  <div className="text-center space-y-4 animate-in zoom-in-90 duration-300">
                    <AlertCircle className="w-24 h-24 text-red-500 mx-auto" />
                    <div>
                      <h2 className="font-headline text-3xl text-red-500 text-balance">ACCESS DENIED</h2>
                      <p className="text-lg font-medium mt-2">TICKET ALREADY USED</p>
                    </div>
                    <Button onClick={resetScanner} variant="outline" className="mt-6 rounded-full px-10 border-red-500/50 text-red-500 hover:bg-red-500/10">
                      Try Again
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4">
            <Button onClick={() => setManualMode(true)} variant="secondary" className="h-16 rounded-2xl gap-3">
              <Search className="w-5 h-5" /> Manual Lookup
            </Button>
            <div className="h-16 rounded-2xl bg-card border border-border flex items-center justify-center gap-3">
              <Users className="w-5 h-5 text-primary" />
              <div className="text-center leading-tight">
                <div className="font-bold text-lg">{history.length + 124}</div>
                <div className="text-[10px] text-muted-foreground uppercase font-black">Entries</div>
              </div>
            </div>
          </div>

          {/* Recent History */}
          <div className="space-y-4 text-left">
            <h3 className="font-headline text-lg flex items-center gap-2">
              <History className="w-5 h-5 text-muted-foreground" /> Recent Check-ins
            </h3>
            <div className="space-y-3">
              {history.map((entry) => (
                <div key={entry.id} className="bg-card border border-border p-4 rounded-xl flex items-center justify-between animate-in slide-in-from-top-2">
                  <div className="text-left">
                    <div className="font-bold">{entry.name}</div>
                    <div className="text-xs text-muted-foreground">{entry.type} • {entry.id}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{entry.time}</div>
                    <Badge className="bg-primary/10 text-primary border-none text-[10px]">VERIFIED</Badge>
                  </div>
                </div>
              ))}
              {history.length === 0 && (
                <p className="text-center text-muted-foreground text-sm py-8">No scan history for this session yet.</p>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Manual Lookup Modal */}
      {manualMode && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-card border-border relative">
            <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => setManualMode(false)}>
              <X className="w-5 h-5" />
            </Button>
            <CardHeader>
              <CardTitle className="font-headline text-left">Attendee Lookup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2 text-left">
                <Input placeholder="Enter Ticket ID or Email" className="h-12 bg-secondary" />
              </div>
              <Button className="w-full h-12 rounded-full">Search Attendee</Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
