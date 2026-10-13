
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, ShieldCheck, ChevronRight, Trash2, Loader2, CheckCircle2, KeyRound, Copy, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
import { useAuth } from '@/components/auth-provider';
import { apiFetch } from '@/lib/api-fetch';
import { DefaultAvatar } from '@/components/default-avatar';
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    className={className} 
    fill="currentColor" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.397-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

export default function OrganizerSettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { profile, signOut, refreshProfile } = useAuth();
  const isVerified = !!(profile as {verified?: boolean})?.verified;
  const [whatsapp, setWhatsapp] = useState('');
  const [brandName, setBrandName] = useState('');
  const [twoFactor, setTwoFactor] = useState(false);
  const [location, setLocation] = useState('');
  const [avatar, setAvatar] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = React.useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const [apiKeyBusy, setApiKeyBusy] = useState(false);
  const [totpSetup, setTotpSetup] = useState<{secret: string; uri: string} | null>(null);
  const [totpCode, setTotpCode] = useState('');
  const [totpBusy, setTotpBusy] = useState(false);

  // Load the real profile into the form.
  useEffect(() => {
    if (profile) {
      const p = profile as {whatsapp?: string; twoFactor?: boolean; location?: string; avatar?: string;};
      setWhatsapp(p.whatsapp || '');
      setBrandName(profile.name || '');
      setAvatar(p.avatar || '');
      setTwoFactor(!!p.twoFactor);
      setLocation(p.location || '');
    }
  }, [profile]);

  // Load the developer API key for this organizer.
  useEffect(() => { loadApiKey(); }, [profile]);

  // Upload the profile photo to R2, then persist it to the profile + all events.
  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !profile?.uid) return;
    setUploadingAvatar(true);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('folder', 'avatars');
      const upRes = await fetch('/api/upload', {method: 'POST', body: form});
      const upData = await upRes.json().catch(() => ({}));
      if (!upRes.ok) throw new Error(upData.error || 'Upload failed.');
      const url = upData.url as string;
      const res = await apiFetch('/api/organizer/avatar', {method: 'POST', body: JSON.stringify({avatar: url})});
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not save photo.');
      setAvatar(url);
      toast({title: 'Photo Updated', description: 'Your profile photo now appears on your events.'});
    } catch (err) {
      toast({variant: 'destructive', title: 'Upload Failed', description: err instanceof Error ? err.message : 'Please try again.'});
    }
    setUploadingAvatar(false);
  };

  const handleSaveProfile = async () => {
    if (!profile?.uid) return;
    setSaving(true);
    try {
      const res = await apiFetch('/api/organizer/profile', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({name: brandName.trim() || profile.name, whatsapp, location: location.trim()}),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.error) throw new Error(data?.error || 'Could not save your changes.');
      // Re-read the profile from Firestore so the brand name is visible
      // everywhere (header, events, settings) immediately — not after reload.
      await refreshProfile();
      toast({title: 'Profile Saved', description: 'Your brand profile has been updated.'});
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: err instanceof Error ? err.message : 'Could not save your profile.',
      });
    } finally {
      setSaving(false);
    }
  };

  // Persist small preferences instantly (used by the security switches).
  const maskKey = (k: string) => (k.length > 16 ? k.slice(0, 12) + '...' + k.slice(-4) : k);

  const loadApiKey = async () => {
    try {
      const res = await apiFetch('/api/organizer/api-key');
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.apiKey) setApiKey(data.apiKey);
    } catch { /* key loads on next visit */ }
  };

  const regenApiKey = async () => {
    setApiKeyBusy(true);
    try {
      const res = await apiFetch('/api/organizer/api-key', { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.error) throw new Error(data?.error || 'Regenerate failed.');
      setApiKey(data.apiKey);
      setApiKeyVisible(true);
      toast({ title: 'Key regenerated', description: 'Your old key no longer works.' });
    } catch (err) {
      toast({ variant: 'destructive', title: 'Could not regenerate', description: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setApiKeyBusy(false);
    }
  };

  const handleTotpSetup = async () => {
    setTotpBusy(true);
    try {
      const res = await apiFetch('/api/auth/totp', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({action: 'setup'}),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.error) throw new Error(data?.error || 'Setup failed.');
      setTotpSetup({secret: data.secret, uri: data.uri});
      setTotpCode('');
    } catch (err) {
      toast({ variant: 'destructive', title: 'Setup failed', description: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setTotpBusy(false);
    }
  };

  const handleTotpConfirm = async () => {
    setTotpBusy(true);
    try {
      const res = await apiFetch('/api/auth/totp', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({action: 'confirm', code: totpCode}),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.error) throw new Error(data?.error || 'Incorrect code.');
      setTwoFactor(true);
      setTotpSetup(null);
      setTotpCode('');
      toast({ title: 'Two-factor enabled', description: 'You will need a code from your authenticator app at sign-in.' });
    } catch (err) {
      toast({ variant: 'destructive', title: 'Not enabled', description: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setTotpBusy(false);
    }
  };

  const handleTotpDisable = async () => {
    setTotpBusy(true);
    try {
      const res = await apiFetch('/api/auth/totp', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({action: 'disable'}),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.error) throw new Error(data?.error || 'Disable failed.');
      setTwoFactor(false);
      setTotpSetup(null);
      toast({ title: 'Two-factor disabled' });
    } catch (err) {
      toast({ variant: 'destructive', title: 'Could not disable', description: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setTotpBusy(false);
    }
  };

  // Permanently delete this organizer account (Auth + profile).
  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const res = await apiFetch('/api/account', {method: 'DELETE'});
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Account deletion failed.');

      toast({
        variant: 'destructive',
        title: 'Account Deleted',
        description: 'Your organizer account has been deleted. Redirecting…',
      });
      await signOut();
      setTimeout(() => {
        setIsDeleting(false);
        setIsDeleteDialogOpen(false);
        router.push('/organizer/login');
      }, 1000);
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Deletion Failed',
        description: err instanceof Error ? err.message : 'Please try again.',
      });
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <div className="p-4 pb-16 md:p-12 md:pb-16">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-left">
          <h1 className="font-headline mb-2 text-2xl md:text-4xl">Account Settings</h1>
          <p className="text-muted-foreground">Manage your brand profile and financial preferences.</p>
        </div>

        <div className="grid gap-8">
          <Card className="border-primary/20 bg-primary/5 overflow-hidden">
            <CardContent className="p-0">
              <div className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 text-left">
                <div className="flex gap-5 items-center flex-wrap lg:flex-nowrap">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg whitespace-nowrap">Verification Status</h3>
                      {isVerified ? (<Badge className="text-[10px] font-black uppercase tracking-tighter bg-green-500/10 text-green-500 border-none">Verified</Badge>) : (<Badge variant="outline" className="text-[10px] font-black uppercase tracking-tighter border-yellow-500/50 text-yellow-600 bg-yellow-500/5">Not Verified</Badge>)}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Verify your identity to display the verified badge on your profile and events. KYC is optional - it never blocks listings or payouts.
                    </p>
                  </div>
                </div>
                {!isVerified && (
                  <Link href="/dashboard/organizer/kyc" className="no-underline shrink-0">
                    <Button className="rounded-full px-8 gap-2 font-bold shadow-lg shadow-primary/20 h-9 md:h-11">
                      Start KYC <ChevronRight className="w-4 h-4" />
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="text-left">
              <CardTitle className="flex items-center gap-2 text-lg"><User className="w-5 h-5 text-primary" /> Brand Profile</CardTitle>
              <CardDescription>Your public organizer name and contact â€” plus a private location that is never shown to attendees.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 text-left">
              {/* Profile photo */}
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-primary/20 bg-secondary flex items-center justify-center shrink-0">
                  {avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatar} alt={brandName || 'Organizer'} className="w-full h-full object-cover" />
                  ) : (
                    <DefaultAvatar className="w-full h-full" />
                  )}
                  {uploadingAvatar && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Loader2 className="w-5 h-5 text-white animate-spin" />
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-sm">Profile Photo</p>
                  <p className="text-xs text-muted-foreground">Appears on your event pages. JPG or PNG, up to 8MB.</p>
                  <Button type="button" variant="outline" size="sm" className="rounded-full font-bold" disabled={uploadingAvatar} onClick={() => avatarInputRef.current?.click()}>
                    {uploadingAvatar ? 'Uploading...' : avatar ? 'Change Photo' : 'Upload Photo'}
                  </Button>
                </div>
                <input ref={avatarInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" className="hidden" onChange={handleAvatarSelect} />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="brand-name">Brand Name</Label>
                  <Input id="brand-name" value={brandName} onChange={(e) => setBrandName(e.target.value)} className="h-11" placeholder="Your brand or organiser name" />
                  
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Support Email</Label>
                  <Input id="email" value={profile?.email || ''} className="h-11 bg-secondary/50 cursor-not-allowed" readOnly />
                  <p className="text-[10px] text-muted-foreground">Primary account email cannot be changed.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp" className="flex items-center gap-1.5">
                    <WhatsAppIcon className="w-3.5 h-3.5 text-green-500" /> WhatsApp Number
                  </Label>
                  <Input id="whatsapp" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="+234..." className="h-11" />
                </div>
                <div className="space-y-2">

                  <Label htmlFor="location">Location (private)</Label>

                  <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Lagos, Nigeria" className="h-11" />

                  <p className="text-[10px] text-muted-foreground">Kept internal â€” never shown publicly.</p>

                </div>
              </div>
              <Button className="rounded-full px-8 font-bold" onClick={handleSaveProfile} disabled={saving || !profile}>
                {saving ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving…</> : 'Save Changes'}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="text-left">
              <CardTitle className="flex items-center gap-2 text-lg"><ShieldCheck className="w-5 h-5 text-primary" /> Security & Payouts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-left">
              <div className="p-4 bg-secondary/30 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="font-bold">Two-Factor Authentication</div>
                    <p className="text-xs text-muted-foreground">Use Google Authenticator (or any authenticator app) for a 6-digit code at sign-in.</p>
                  </div>
                  <Badge className={twoFactor ? 'bg-green-500/15 text-green-500 border-none' : 'bg-secondary text-muted-foreground border-none'}>
                    {twoFactor ? 'Enabled' : 'Off'}
                  </Badge>
                </div>

                {!twoFactor && !totpSetup && (
                  <Button variant="outline" className="rounded-full font-bold" onClick={handleTotpSetup} disabled={totpBusy}>
                    {totpBusy ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ShieldCheck className="w-4 h-4 mr-2" />}
                    Set up authenticator app
                  </Button>
                )}

                {totpSetup && (
                  <div className="space-y-3 rounded-xl border border-border p-4">
                    <p className="text-xs text-muted-foreground">
                      Scan this QR code in Google Authenticator, or enter the setup key manually. Then enter the 6-digit code to confirm.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={'https://api.qrserver.com/v1/create-qr-code/?size=160x160&margin=0&data=' + encodeURIComponent(totpSetup.uri)}
                        alt="Authenticator QR code"
                        width={160}
                        height={160}
                        className="rounded-lg bg-white p-2"
                      />
                      <div className="space-y-2 text-xs flex-1 min-w-0">
                        <div>
                          <Label className="text-muted-foreground">Setup key</Label>
                          <div className="font-mono break-all select-all">{totpSetup.secret}</div>
                        </div>
                        <Button variant="ghost" size="sm" className="rounded-full" onClick={() => { navigator.clipboard?.writeText(totpSetup.secret); toast({ title: 'Copied', description: 'Setup key copied.' }); }}>
                          <Copy className="w-4 h-4 mr-2" /> Copy key
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 items-end">
                      <div className="space-y-1">
                        <Label htmlFor="totp-code">6-digit code</Label>
                        <Input id="totp-code" inputMode="numeric" maxLength={6} placeholder="123456" value={totpCode} onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))} className="w-40 font-mono" />
                      </div>
                      <Button className="rounded-full font-bold" onClick={handleTotpConfirm} disabled={totpBusy || totpCode.length !== 6}>
                        {totpBusy ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Confirm &amp; enable
                      </Button>
                      <Button variant="ghost" onClick={() => { setTotpSetup(null); setTotpCode(''); }}>Cancel</Button>
                    </div>
                  </div>
                )}

                {twoFactor && (
                  <Button variant="outline" className="rounded-full font-bold border-red-500/40 text-red-500 hover:bg-red-500/10" onClick={handleTotpDisable} disabled={totpBusy}>
                    {totpBusy ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Disable two-factor
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="text-left">
              <CardTitle className="flex items-center gap-2 text-lg"><KeyRound className="w-5 h-5 text-primary" /> Developer API</CardTitle>
              <CardDescription>
                Authenticate requests to the public API (see the <Link href="/docs" className="text-primary underline">API docs</Link>). Keep this key secret.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-left">
              <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                <code className="flex-1 min-w-0 bg-secondary/50 border border-border rounded-xl px-4 py-3 font-mono text-xs break-all select-all">
                  {apiKey ? (apiKeyVisible ? apiKey : maskKey(apiKey)) : 'Loading...'}
                </code>
                <div className="flex gap-2">
                  <Button variant="outline" className="rounded-full font-bold" onClick={() => { navigator.clipboard?.writeText(apiKey); toast({ title: 'Copied', description: 'API key copied.' }); }} disabled={!apiKey}>
                    <Copy className="w-4 h-4 mr-2" /> Copy
                  </Button>
                  <Button variant="outline" className="rounded-full font-bold" onClick={() => setApiKeyVisible((v) => !v)} disabled={!apiKey}>
                    {apiKeyVisible ? 'Hide' : 'Reveal'}
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" className="rounded-full font-bold" onClick={regenApiKey} disabled={apiKeyBusy}>
                  {apiKeyBusy ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />} Regenerate
                </Button>
                <Link href="/docs">
                  <Button variant="ghost" className="rounded-full font-bold">View API docs <ChevronRight className="w-4 h-4 ml-1" /></Button>
                </Link>
              </div>
            </CardContent>
          </Card>
          <Card className="border-red-500/30 bg-red-500/5">
            <CardHeader className="text-left">
              <CardTitle className="flex items-center gap-2 text-lg text-red-500">
                <Trash2 className="w-5 h-5" /> Danger Zone
              </CardTitle>
              <CardDescription>
                Permanently delete your organizer account. Your listed events will remain on the
                platform under admin management. This action cannot be undone.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-left">
              <Button
                variant="outline"
                className="rounded-full px-8 font-bold border-red-500/40 text-red-500 hover:bg-red-500/10 hover:text-red-600"
                onClick={() => setIsDeleteDialogOpen(true)}
                disabled={isDeleting}
              >
                <Trash2 className="w-4 h-4 mr-2" /> Delete Account
              </Button>
            </CardContent>
          </Card>
        </div>

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete your organizer account?</AlertDialogTitle>
              <AlertDialogDescription>
                This permanently deletes your login ({profile?.email}) and profile. You will lose
                access to the organizer dashboard immediately. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault();
                  handleDeleteAccount();
                }}
                className="bg-red-500 hover:bg-red-600 text-white border-none font-bold"
              >
                {isDeleting ? 'Deleting…' : 'Delete My Account'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
