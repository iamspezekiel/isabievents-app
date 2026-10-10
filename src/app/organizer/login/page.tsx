"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import Link from 'next/link';
import { Mail, Lock, Loader2, Eye, EyeOff, CalendarCheck, ShieldCheck, ArrowLeft } from 'lucide-react';
import { Logo } from '@/components/logo';
import { DASHBOARD_PATHS, useAuth } from '@/components/auth-provider';
import { useToast } from "@/hooks/use-toast";

/**
 * Organizer Portal sign-in — dedicated entrance for event organizers.
 * Attendees are rejected here and pointed to the regular login.
 */
export default function OrganizerLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { signIn, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Two-factor (email code) — activated per-account from Security settings.
  const [tfaStep, setTfaStep] = useState(false);
  const [tfaCode, setTfaCode] = useState('');
  const [tfaResendIn, setTfaResendIn] = useState(0);

  React.useEffect(() => {
    if (tfaResendIn <= 0) return;
    const t = setTimeout(() => setTfaResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [tfaResendIn]);

  const requestTfaCode = async () => {
    setLoading(true);
    try {
      await fetch('/api/auth/tfa', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({action: 'send', email}),
      });
      setTfaResendIn(60);
      toast({title: 'Verification Code Sent', description: `Enter the 6-digit code we emailed to ${email}.`});
    } catch {
      toast({variant: 'destructive', title: 'Could Not Send Code', description: 'Please try again in a moment.'});
    }
    setLoading(false);
  };

  const handleVerifyTfa = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/tfa', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({action: 'verify', email, code: tfaCode}),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || 'Incorrect code.');
      const profile = await signIn(email, password);
      if (profile.role !== 'organizer' && profile.role !== 'admin') {
        await signOut();
        toast({variant: 'destructive', title: 'Not an Organizer', description: 'Attendees should sign in from the regular login page.'});
        setTfaStep(false);
        setLoading(false);
        return;
      }
      toast({title: 'Welcome back, Organizer!', description: `Signed in as ${profile.name}.`});
      router.push(profile.role === 'admin' ? DASHBOARD_PATHS.admin : DASHBOARD_PATHS.organizer);
      return;
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Verification Failed',
        description: err instanceof Error ? err.message : 'Incorrect code.',
      });
    }
    setLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const profile = await signIn(email, password);
      if (profile.role !== 'organizer' && profile.role !== 'admin') {
        await signOut();
        toast({
          variant: "destructive",
          title: "Not an Organizer",
          description: "This is the Organizer Portal. Attendees should sign in from the regular login page.",
        });
        setLoading(false);
        return;
      }
      if ((profile as {twoFactor?: boolean}).twoFactor) {
        // 2FA enabled: sign back out and require the emailed code.
        await signOut();
        setTfaStep(true);
        requestTfaCode();
        return;
      }
      toast({
        title: "Welcome back, Organizer!",
        description: `Signed in as ${profile.name}.`,
      });
      router.push(profile.role === 'admin' ? DASHBOARD_PATHS.admin : DASHBOARD_PATHS.organizer);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: err instanceof Error ? err.message : "Invalid email or password.",
      });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-start p-4 pt-40 pb-20">
      <div className="w-full max-w-md space-y-8 text-left">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block mb-4 no-underline">
            <Logo size="md" className="mx-auto" />
          </Link>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-primary">
            <CalendarCheck className="w-3.5 h-3.5" /> Organizer Portal
          </div>
          <p className="text-muted-foreground">Sign in to create, manage and promote your events</p>
        </div>

        <Card className="bg-card border-border shadow-2xl">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="font-headline text-2xl">Organizer Sign In</CardTitle>
            <CardDescription>Access your organizer dashboard</CardDescription>
          </CardHeader>
          {tfaStep ? (
            <form onSubmit={handleVerifyTfa}>
              <CardContent className="space-y-4 px-10 md:px-6 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-primary" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold">Enter Verification Code</h4>
                  <CardDescription>
                    We emailed a 6-digit code to <span className="font-bold text-foreground">{email}</span>
                  </CardDescription>
                </div>
                <Input
                  id="tfa-code"
                  inputMode="numeric"
                  maxLength={6}
                  autoComplete="one-time-code"
                  placeholder="000000"
                  className="h-12 text-center text-xl font-bold tracking-[0.5em] bg-secondary/50"
                  value={tfaCode}
                  onChange={(e) => setTfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  autoFocus
                />
                <Button type="submit" className="w-full rounded-xl h-9 md:h-11" disabled={loading || tfaCode.length !== 6}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify & Sign In'}
                </Button>
                <div className="flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => { setTfaStep(false); setTfaCode(''); }}
                    className="text-primary font-bold gap-1 inline-flex items-center hover:underline"
                  >
                    <ArrowLeft className="w-3 h-3" /> Different account
                  </button>
                  <button
                    type="button"
                    onClick={requestTfaCode}
                    disabled={tfaResendIn > 0 || loading}
                    className="text-primary font-bold disabled:opacity-50 hover:underline"
                  >
                    {tfaResendIn > 0 ? `Resend in ${tfaResendIn}s` : 'Resend code'}
                  </button>
                </div>
              </CardContent>
            </form>
          ) : (
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4 px-10 md:px-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="organizer@example.com"
                    className="pl-10 h-9 md:h-11 bg-secondary/50"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link href="/forgot-password" className="text-xs text-primary no-underline font-bold">Forgot password?</Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 pr-10 h-9 md:h-11 bg-secondary/50"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full rounded-xl mt-4 no-underline h-9 md:h-11" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : 'Sign In'}
              </Button>
            </CardContent>
          </form>
          )}
          {!tfaStep && (
          <CardFooter className="flex flex-col gap-3 px-10 md:px-6">
            <p className="text-center text-sm text-muted-foreground">
              New organizer? <Link href="/organizer/signup" className="text-primary font-bold no-underline">Create Organizer Account</Link>
            </p>
            <p className="text-center text-sm text-muted-foreground">
              Buying tickets? <Link href="/login" className="text-primary font-bold no-underline">Attendee Login</Link>
            </p>
          </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}
