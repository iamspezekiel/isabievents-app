"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from 'next/link';
import { Mail, Lock, User, ShieldCheck, Loader2, Eye, EyeOff } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Logo } from '@/components/logo';
import { DASHBOARD_PATHS, useAuth, type Role } from '@/components/auth-provider';
import { useToast } from "@/hooks/use-toast";

function SignupForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const { signUp } = useAuth();
  const [role, setRole] = useState('attendee');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'organizer') {
      setRole('organizer');
    } else if (roleParam === 'attendee') {
      setRole('attendee');
    }
  }, [searchParams]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const form = e.target as HTMLFormElement;
    const data = new FormData(form);
    const name = String(data.get('fullname') || '').trim();
    const email = String(data.get('email') || '').trim();
    const password = String(data.get('password') || '');

    try {
      const profile = await signUp({name, email, password, role: role as Role});
      toast({
        title: "Account Created!",
        description: `Welcome to IsabiEvents as a${role === 'organizer' ? 'n organizer' : 'n attendee'}.`,
      });
      router.push(DASHBOARD_PATHS[profile.role] || '/dashboard/attendee');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not create your account.';
      toast({
        variant: "destructive",
        title: "Signup Failed",
        description: message.replace('Firebase: ', ''),
      });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-start p-4 pt-40 pb-20">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block mb-4 no-underline">
            <Logo size="md" className="mx-auto" />
          </Link>
          <p className="text-muted-foreground">Experience the best events in Nigeria</p>
        </div>

        <Card className="bg-card border-border shadow-2xl overflow-hidden">
          <CardHeader className="text-center">
            <CardTitle>Create Account</CardTitle>
            <CardDescription>Join our community today</CardDescription>
          </CardHeader>
          <form onSubmit={handleSignup}>
            <CardContent className="space-y-6 px-10 md:px-6">
              <div className="space-y-3">
                <Label>I want to join as a...</Label>
                <RadioGroup value={role} onValueChange={setRole} className="grid grid-cols-2 gap-4">
                  <Label htmlFor="attendee" className={`flex items-center justify-center p-3 md:p-4 rounded-xl border-2 cursor-pointer transition-all text-xs md:text-sm ${role === 'attendee' ? 'border-primary bg-primary/5' : 'border-border hover:bg-secondary'}`}>
                    <RadioGroupItem value="attendee" id="attendee" className="sr-only" />
                    <span>Attendee</span>
                  </Label>
                  <Label htmlFor="organizer" className={`flex items-center justify-center p-3 md:p-4 rounded-xl border-2 cursor-pointer transition-all text-xs md:text-sm ${role === 'organizer' ? 'border-primary bg-primary/5' : 'border-border hover:bg-secondary'}`}>
                    <RadioGroupItem value="organizer" id="organizer" className="sr-only" />
                    <span>Organizer</span>
                  </Label>
                </RadioGroup>
              </div>

              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullname">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="fullname" name="fullname" placeholder="John Doe" className="pl-10 h-9 md:h-11 bg-secondary/50" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="email" name="email" type="email" placeholder="john@example.com" className="pl-10 h-9 md:h-11 bg-secondary/50" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      id="password" 
                      name="password"
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••" 
                      className="pl-10 pr-10 h-9 md:h-11 bg-secondary/50" 
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
              </div>

              <div className="flex items-start gap-2 text-[10px] md:text-xs text-muted-foreground mt-4">
                <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                <span>
                  By creating an account, you agree to our{' '}
                  <Link href="/terms" className="text-primary hover:underline no-underline font-bold">Terms of Service</Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-primary hover:underline no-underline font-bold">Privacy Policy</Link>.
                </span>
              </div>

              <Button type="submit" className="w-full rounded-xl mt-6 no-underline h-9 md:h-11" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Create Account"}
              </Button>
            </CardContent>
          </form>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account? <Link href="/login" className="text-primary font-bold no-underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <SignupForm />
    </Suspense>
  );
}
