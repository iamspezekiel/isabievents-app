"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardDescription, CardFooter } from "@/components/ui/card";
import Link from 'next/link';
import { Mail, Lock, Loader2, Eye, EyeOff, ShieldCheck, ArrowLeft } from 'lucide-react';
import { Logo } from '@/components/logo';
import { DASHBOARD_PATHS, useAuth } from '@/components/auth-provider';
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { signIn, signInWithGoogle, signOut } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
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

  const requestTfaCode = async (silent = false) => {
    setLoading('tfa-send');
    try {
      const res = await fetch('/api/auth/tfa', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({action: 'send', email}),
      });
      await res.json().catch(() => ({}));
      setTfaResendIn(60);
      if (!silent) {
        toast({title: 'Verification Code Sent', description: `Enter the 6-digit code we emailed to ${email}.`});
      }
    } catch {
      toast({variant: 'destructive', title: 'Could Not Send Code', description: 'Please try again in a moment.'});
    }
    setLoading(null);
  };

  const handleVerifyTfa = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading('tfa-verify');
    try {
      const res = await fetch('/api/auth/tfa', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({action: 'verify', email, code: tfaCode}),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || 'Incorrect code.');
      const profile = await signIn(email, password);
      toast({title: 'Login Successful', description: `Welcome back, ${profile.name}!`});
      router.push(DASHBOARD_PATHS[profile.role] || '/dashboard/attendee');
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Verification Failed',
        description: err instanceof Error ? err.message : 'Incorrect code.',
      });
    }
    setLoading(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading('form');

    try {
      const profile = await signIn(email, password);
      if ((profile as {twoFactor?: boolean}).twoFactor) {
        // 2FA enabled: sign straight back out and require the emailed code.
        await signOut();
        setTfaStep(true);
        toast({title: 'Two-Factor Verification', description: `Enter the 6-digit code we sent to ${email}.`});
        await requestTfaCode(true);
        return;
      }
      toast({
        title: "Login Successful",
        description: `Welcome back, ${profile.name}!`,
      });
      router.push(DASHBOARD_PATHS[profile.role] || '/dashboard/attendee');
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: err instanceof Error ? err.message : "Invalid email or password.",
      });
    }
    setLoading(null);
  };

  const handleGoogleLogin = async () => {
    setLoading('google');
    try {
      const profile = await signInWithGoogle();
      toast({
        title: "Signed in with Google",
        description: `Welcome, ${profile.name || profile.email}!`,
      });
      router.push(DASHBOARD_PATHS[profile.role] || '/dashboard/attendee');
    } catch (err) {
      const code = (err as {code?: string})?.code || '';
      const messages: Record<string, string> = {
        'auth/popup-closed-by-user': 'The Google popup was closed before sign-in finished.',
        'auth/popup-blocked': 'Popup blocked — allow popups for this site and try again.',
        'auth/cancelled-popup-request': 'Sign-in was cancelled.',
        'auth/unauthorized-domain': 'Add this domain to Firebase → Authentication → Settings → Authorized domains.',
        'auth/operation-not-allowed': 'Google sign-in is not enabled yet — enable it in Firebase → Authentication → Sign-in method.',
        'auth/account-exists-with-different-credential': 'An account with this email already exists — try email/password sign-in.',
      };
      toast({
        variant: "destructive",
        title: "Google Sign-In Failed",
        description: messages[code] || (err instanceof Error ? err.message : 'Could not sign in with Google.'),
      });
    }
    setLoading(null);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-start p-4 pt-40 pb-20">
      <div className="w-full max-w-md space-y-8 text-left">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block mb-4 no-underline">
            <Logo size="md" className="mx-auto" />
          </Link>
          <p className="text-muted-foreground">Sign in to access your tickets and experiences</p>
        </div>

        <Card className="bg-card border-border shadow-2xl">
          <CardHeader className="space-y-1 text-center">
            <h4 className="text-xl font-headline font-black">Welcome Back</h4>
            <CardDescription>Enter your credentials to continue</CardDescription>
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
                <Button type="submit" className="w-full rounded-xl h-9 md:h-11" disabled={!!loading || tfaCode.length !== 6}>
                  {loading === 'tfa-verify' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify & Sign In'}
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
                    onClick={() => requestTfaCode()}
                    disabled={tfaResendIn > 0 || !!loading}
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
                    placeholder="name@example.com" 
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
              <Button type="submit" className="w-full rounded-xl mt-4 no-underline h-9 md:h-11" disabled={!!loading}>
                {loading === 'form' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : 'Sign In'}
              </Button>
            </CardContent>
          </form>
          )}
          
          {!tfaStep && (
          <CardFooter className="flex flex-col gap-6 px-10 md:px-6">
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground font-bold">Social Login</span>
              </div>
            </div>
            <div className="w-full">
              <Button
                variant="outline"
                className="w-full rounded-xl no-underline font-bold h-8 md:h-10 gap-2"
                onClick={handleGoogleLogin}
                disabled={!!loading}
              >
                {loading === 'google' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Continue with Google'}
              </Button>
            </div>
          </CardFooter>
          )}
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account? <Link href="/signup" className="text-primary font-bold no-underline">Create Account</Link>
        </p>
        <p className="text-center text-sm text-muted-foreground">
          Hosting events? <Link href="/organizer/login" className="text-primary font-bold no-underline">Organizer Portal</Link>
        </p>
      </div>
    </div>
  );
}
