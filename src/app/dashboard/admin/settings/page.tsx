
"use client";

import React, { useEffect, useState } from 'react';
import { 
  ShieldAlert, 
  Zap, 
  CreditCard, 
  User, 
  MapPin, 
  AlertTriangle,
  Mail,
  Loader2,
  Send
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { CITIES } from '@/lib/constants';
import { apiFetch } from '@/lib/api-fetch';
import { useAuth } from '@/components/auth-provider';

interface AppSettings {
  fullName: string;
  city: string;
  platformFee: number | string;
  requireKyc: boolean;
  autoSettlements: boolean;
  gatewayBachs: boolean;
  gatewayCrypto: boolean;
  maintenance: boolean;
}

const DEFAULT_APP: AppSettings = {
  fullName: 'Admin Master',
  city: 'Abuja',
  platformFee: '2.5',
  requireKyc: true,
  autoSettlements: true,
  gatewayBachs: true,
  gatewayCrypto: true,
  maintenance: false,
};

export default function AdminSystemSettings() {
  const { toast } = useToast();
  const { loading: authLoading } = useAuth();

  // Platform settings — persisted to Firestore settings/app.
  const [app, setApp] = useState<AppSettings>(DEFAULT_APP);

  // SMTP settings — loaded from the server, saved to Firestore settings/smtp.
  const [smtp, setSmtp] = useState({host: '', port: '', user: '', pass: '', from: '', adminEmail: ''});
  const [hasPassword, setHasPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [smtpStatus, setSmtpStatus] = useState<{ok: boolean; msg: string} | null>(null);

  useEffect(() => {
    if (authLoading) return;
    apiFetch('/api/admin/settings')
      .then((r) => r.json())
      .then((d) => {
        if (d?.settings) {
          setApp({
            fullName: d.settings.fullName || DEFAULT_APP.fullName,
            city: d.settings.city || DEFAULT_APP.city,
            platformFee: String(d.settings.platformFee ?? DEFAULT_APP.platformFee),
            requireKyc: d.settings.requireKyc !== false,
            autoSettlements: d.settings.autoSettlements !== false,
            gatewayBachs: d.settings.gatewayBachs !== false,
            gatewayCrypto: d.settings.gatewayCrypto !== false,
            maintenance: Boolean(d.settings.maintenance),
          });
        }
      })
      .catch(() => undefined);
    apiFetch('/api/admin/smtp')
      .then((r) => r.json())
      .then((d) => {
        if (d?.error) return;
        setSmtp({
          host: d.host || '',
          port: d.port ? String(d.port) : '',
          user: d.user || '',
          pass: '',
          from: d.from || '',
          adminEmail: d.adminEmail || '',
        });
        setHasPassword(Boolean(d.hasPassword));
      })
      .catch(() => undefined);
  }, [authLoading]);

  const setField = (key: keyof typeof smtp, value: string) =>
    setSmtp((prev) => ({...prev, [key]: value}));

  const setAppField = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) =>
    setApp((prev) => ({...prev, [key]: value}));

  const refreshSmtpFromServer = () => {
    apiFetch('/api/admin/smtp')
      .then((r) => r.json())
      .then((d) => {
        if (d?.error) return;
        setSmtp({
          host: d.host || '',
          port: d.port ? String(d.port) : '',
          user: d.user || '',
          pass: '',
          from: d.from || '',
          adminEmail: d.adminEmail || '',
        });
        setHasPassword(Boolean(d.hasPassword));
      })
      .catch(() => undefined);
  };

  /** Header "Save Changes" — persists platform settings AND SMTP together. */
  const handleSaveAll = async () => {
    setSaving(true);
    setSmtpStatus(null);
    try {
      const [settingsRes, smtpRes] = await Promise.all([
        apiFetch('/api/admin/settings', {
          method: 'POST',
          body: JSON.stringify({...app, platformFee: Number(app.platformFee) || 0}),
        }),
        apiFetch('/api/admin/smtp', {
          method: 'POST',
          body: JSON.stringify({
            ...smtp,
            port: smtp.port ? Number(smtp.port) : undefined,
          }),
        }),
      ]);
      const s1 = await settingsRes.json().catch(() => ({}));
      const s2 = await smtpRes.json().catch(() => ({}));
      if (!settingsRes.ok) throw new Error(s1.error || 'Settings save failed.');
      if (!smtpRes.ok) throw new Error(s2.error || 'SMTP save failed.');

      if (smtp.pass) setHasPassword(true);
      setSmtp((prev) => ({...prev, pass: ''}));
      refreshSmtpFromServer();
      setSmtpStatus({ok: true, msg: 'All settings saved.'});
      toast({title: 'Settings Saved', description: 'Platform configuration and SMTP settings were saved.'});
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Save failed.';
      setSmtpStatus({ok: false, msg});
      toast({variant: 'destructive', title: 'Save Failed', description: msg});
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSmtp = async () => {
    setSaving(true);
    setSmtpStatus(null);
    try {
      const res = await apiFetch('/api/admin/smtp', {
        method: 'POST',
        body: JSON.stringify({
          ...smtp,
          port: smtp.port ? Number(smtp.port) : undefined,
        }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error || 'Save failed.');
      if (smtp.pass) setHasPassword(true);
      setSmtp((prev) => ({...prev, pass: ''}));
      refreshSmtpFromServer();
      setSmtpStatus({ok: true, msg: 'SMTP settings saved.'});
      toast({title: 'SMTP Saved', description: 'Server emails now use these settings.'});
    } catch (err) {
      setSmtpStatus({ok: false, msg: err instanceof Error ? err.message : 'Save failed.'});
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    setTesting(true);
    setSmtpStatus(null);
    try {
      const res = await apiFetch('/api/admin/smtp/test', {
        method: 'POST',
        body: JSON.stringify({to: smtp.adminEmail, smtp}),
      });
      const d = await res.json().catch(() => ({}));
      if (!d.ok) throw new Error(d.error || 'Test failed.');
      setSmtpStatus({ok: true, msg: `Test email sent to ${d.to}`});
      toast({title: 'Test Email Sent', description: `Delivered to ${d.to} — check your inbox (and spam).`});
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Test failed.';
      setSmtpStatus({ok: false, msg});
      toast({variant: 'destructive', title: 'Email Test Failed', description: msg});
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="p-4 pb-16 md:p-12 md:pb-16 space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="text-left space-y-1">
          <h1 className="font-headline text-3xl md:text-5xl">System Config</h1>
          <p className="text-muted-foreground font-medium">Control global fees, security protocols, and maintenance modes.</p>
        </div>
        <Button onClick={handleSaveAll} disabled={saving || testing} className="rounded-full shadow-lg shadow-primary/20 h-11 font-bold px-10">
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Save Changes
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
                <Input value={app.fullName} onChange={(e) => setAppField('fullName', e.target.value)} className="h-11 bg-secondary/30 border-none rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-primary" /> Primary Operating Base
                </Label>
                <Select value={app.city} onValueChange={(v) => setAppField('city', v)}>
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
                <Input value={String(app.platformFee)} onChange={(e) => setAppField('platformFee', e.target.value)} className="h-11 bg-secondary/30 border-none rounded-xl" />
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
              <Switch checked={app.requireKyc} onCheckedChange={(v) => setAppField('requireKyc', v)} />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-2xl border border-border">
              <div className="space-y-1">
                <p className="font-bold text-sm">Automated Settlements</p>
                <p className="text-xs text-muted-foreground">Disable manual approval for verified organizer payouts.</p>
              </div>
              <Switch checked={app.autoSettlements} onCheckedChange={(v) => setAppField('autoSettlements', v)} />
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
              <Switch checked={app.gatewayBachs} onCheckedChange={(v) => setAppField('gatewayBachs', v)} />
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
              <Switch checked={app.gatewayCrypto} onCheckedChange={(v) => setAppField('gatewayCrypto', v)} />
            </div>
          </CardContent>
        </Card>

        {/* Email (SMTP) */}
        <Card className="border-border bg-card text-left">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" /> Email (SMTP)
            </CardTitle>
            <CardDescription>
              Change the outbound email settings and send a real test — used for receipts, QR tickets, and admin alerts.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="smtp-host">SMTP Host</Label>
                <Input id="smtp-host" value={smtp.host} onChange={(e) => setField('host', e.target.value)} placeholder="mail.yourdomain.com" className="h-11 bg-secondary/30 border-none rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtp-port">Port</Label>
                <Input id="smtp-port" type="number" value={smtp.port} onChange={(e) => setField('port', e.target.value)} placeholder="465" className="h-11 bg-secondary/30 border-none rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtp-user">Username</Label>
                <Input id="smtp-user" value={smtp.user} onChange={(e) => setField('user', e.target.value)} placeholder="smtp_user" autoComplete="off" className="h-11 bg-secondary/30 border-none rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtp-pass">Password</Label>
                <Input id="smtp-pass" type="password" value={smtp.pass} onChange={(e) => setField('pass', e.target.value)} placeholder={hasPassword ? '•••••••• (saved — leave blank to keep)' : 'SMTP password'} autoComplete="new-password" className="h-11 bg-secondary/30 border-none rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtp-from">From</Label>
                <Input id="smtp-from" value={smtp.from} onChange={(e) => setField('from', e.target.value)} placeholder="Isabi Events &lt;events@yourdomain.com&gt;" className="h-11 bg-secondary/30 border-none rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtp-admin">Admin notifications to</Label>
                <Input id="smtp-admin" type="email" value={smtp.adminEmail} onChange={(e) => setField('adminEmail', e.target.value)} placeholder="admin@example.com" className="h-11 bg-secondary/30 border-none rounded-xl" />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <Button onClick={handleSaveSmtp} disabled={saving || testing} className="rounded-full h-11 font-bold gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Save SMTP Settings
              </Button>
              <Button onClick={handleTestEmail} variant="outline" disabled={saving || testing} className="rounded-full h-11 font-bold gap-2">
                {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Send Test Email
              </Button>
              {smtpStatus && (
                <span className={`text-sm font-bold ${smtpStatus.ok ? 'text-green-500' : 'text-red-500'}`}>
                  {smtpStatus.msg}
                </span>
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              Blank fields fall back to the server (.env) configuration. The saved password is never displayed here.
            </p>
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
              <Switch checked={app.maintenance} onCheckedChange={(v) => setAppField('maintenance', v)} />
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
