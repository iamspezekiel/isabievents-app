
"use client";

import React from 'react';
import { 
  ShieldAlert, 
  Zap, 
  CreditCard, 
  User, 
  MapPin, 
  AlertTriangle 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { CITIES } from '@/lib/mock-data';

export default function AdminSystemSettings() {
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: "System Updated",
      description: "Global platform configuration has been synchronized.",
    });
  };

  return (
    <div className="p-4 md:p-12 space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="text-left space-y-1">
          <h1 className="font-headline text-3xl md:text-5xl">System Config</h1>
          <p className="text-muted-foreground font-medium">Control global fees, security protocols, and maintenance modes.</p>
        </div>
        <Button onClick={handleSave} className="rounded-full shadow-lg shadow-primary/20 h-11 font-bold px-10">
          Apply Changes
        </Button>
      </header>

      <div className="grid gap-8 text-left max-w-4xl">
        {/* Admin Profile */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-5 h-5 text-primary" /> Admin Profile
            </CardTitle>
            <CardDescription>Your personal account details for system audit logs.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input defaultValue="Admin Master" className="h-11 bg-secondary/30 border-none rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-primary" /> Primary Operating Base
                </Label>
                <Select defaultValue="Abuja">
                  <SelectTrigger className="h-11 bg-secondary/30 border-none rounded-xl">
                    <SelectValue placeholder="Select your city" />
                  </SelectTrigger>
                  <SelectContent>
                    {CITIES.map(city => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Global Pricing */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" /> Fee Structure
            </CardTitle>
            <CardDescription>Global service charges applied to all transactions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Standard Platform Fee (%)</Label>
                <Input defaultValue="2.5" className="h-11 bg-secondary/30 border-none rounded-xl" />
                <p className="text-[10px] text-muted-foreground">Commission percentage taken from every paid ticket sold.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Platform Security */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-primary" /> Critical Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-2xl border border-border">
              <div className="space-y-1">
                <p className="font-bold text-sm">Require KYC for Listing</p>
                <p className="text-xs text-muted-foreground">Prevent unverified hosts from creating any events.</p>
              </div>
              <Switch checked />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-2xl border border-border">
              <div className="space-y-1">
                <p className="font-bold text-sm">Automated Settlements</p>
                <p className="text-xs text-muted-foreground">Disable manual approval for verified organizer payouts.</p>
              </div>
              <Switch checked />
            </div>
          </CardContent>
        </Card>

        {/* Gateway Management */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" /> Gateway Management
            </CardTitle>
            <CardDescription>Enable or disable active payment processing channels.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-2xl border border-border">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center border border-border">
                  <span className="text-xs font-black text-[#7E7CFF]">BA</span>
                </div>
                <div className="space-y-0.5">
                  <p className="font-bold text-sm">Bachs</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Primary Gateway (NGN & USD)</p>
                </div>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-2xl border border-border">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center border border-border">
                  <span className="text-xs font-black text-[#2775CA]">$</span>
                </div>
                <div className="space-y-0.5">
                  <p className="font-bold text-sm">Crypto (USDC / USDT / ETH / SOL)</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Bachs Crypto Corridor (USD)</p>
                </div>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Maintenance Mode */}
        <Card className="border-red-500/20 bg-red-500/5">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" /> Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-background border border-red-500/10 rounded-2xl">
              <div className="space-y-1">
                <p className="font-bold text-sm text-red-600 uppercase tracking-tighter">Maintenance Mode</p>
                <p className="text-xs text-muted-foreground">Take the platform offline for scheduled updates.</p>
              </div>
              <Switch />
            </div>
            <div className="flex gap-4">
              <Button variant="outline" className="flex-1 rounded-xl h-11 border-red-500/20 text-red-600 hover:bg-red-500/5 font-bold">
                Purge System Cache
              </Button>
              <Button variant="outline" className="flex-1 rounded-xl h-11 border-red-500/20 text-red-600 hover:bg-red-500/5 font-bold">
                Re-index Search
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
