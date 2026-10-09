"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardDescription, CardFooter } from "@/components/ui/card";
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import { Logo } from '@/components/logo';
import { useAuth } from '@/components/auth-provider';
import { useToast } from "@/hooks/use-toast";
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { isFirebaseMode } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isFirebaseMode && auth) {
        // Real Firebase password-reset email to the user's inbox.
        await sendPasswordResetEmail(auth, email.trim());
      } else {
        // Demo mode: no backend — simulate the flow.
        await new Promise(r => setTimeout(r, 1200));
      }
      setLoading(false);
      setSubmitted(true);
      toast({
        title: "Reset link sent",
        description: `If an account exists for ${email}, you will receive a password reset link shortly.`,
      });
    } catch (err) {
      const code = (err as {code?: string})?.code || '';
      const messages: Record<string, string> = {
        'auth/user-not-found': 'No account exists for that email address.',
        'auth/invalid-email': 'That email address is not valid.',
        'auth/too-many-requests': 'Too many attempts — please wait a minute and try again.',
        'auth/unauthorized-domain': 'Add this domain to Firebase → Authentication → Settings → Authorized domains.',
      };
      setLoading(false);
      toast({
        variant: "destructive",
        title: "Could not send reset link",
        description: messages[code] || (err instanceof Error ? err.message : 'Please try again later.'),
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-start p-4 pt-40 pb-20">
      <div className="w-full max-w-md space-y-8 text-left">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block mb-4 no-underline">
            <Logo size="md" className="mx-auto" />
          </Link>
          <p className="text-muted-foreground">We'll send you a link to get back into your account</p>
        </div>

        <Card className="bg-card border-border shadow-2xl overflow-hidden">
          {!submitted ? (
            <>
              <CardHeader className="text-center">
                <h1 className="text-xl font-headline font-black">Reset Password</h1>
                <CardDescription>Enter the email address associated with your account</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="name@example.com" 
                        className="pl-10 h-11 bg-secondary/50" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-11 rounded-xl mt-4 no-underline" disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : 'Send Reset Link'}
                  </Button>
                </CardContent>
              </form>
            </>
          ) : (
            <CardContent className="pt-10 pb-10 text-center space-y-6">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto border-4 border-primary/20">
                <CheckCircle2 className="w-10 h-10 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="font-headline text-2xl">Check your email</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  We've sent a password reset link to <br /><span className="font-bold text-foreground">{email}</span>
                </p>
              </div>
              <Button 
                variant="outline" 
                className="w-full h-11 rounded-xl no-underline"
                onClick={() => setSubmitted(false)}
              >
                Try another email
              </Button>
            </CardContent>
          )}
          <CardFooter className="bg-secondary/30 flex justify-center border-t border-border py-4">
            <Link href="/login" className="text-sm font-bold text-primary flex items-center gap-2 hover:underline no-underline">
              <ArrowLeft className="w-4 h-4" /> Back to Sign In
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
