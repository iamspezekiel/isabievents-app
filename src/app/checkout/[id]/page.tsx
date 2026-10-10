
"use client";

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, 
  CreditCard, 
  Wallet, 
  Landmark, 
  CheckCircle2, 
  Loader2, 
  ArrowRight, 
  Coins, 
  Zap, 
  User, 
  LogIn, 
  Mail, 
  Lock,
  Smartphone,
  Info,
  UserPlus,
  Eye,
  EyeOff
} from 'lucide-react';
import { useEvents } from '@/hooks/use-events';
import { useAuth } from '@/components/auth-provider';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from 'next/link';

const NGN_TO_USD_RATE = 1550; // Fixed display/checkout conversion rate

export default function CheckoutPage(props: { params: Promise<{ id: string }> }) {
  const { id } = use(props.params);
  const router = useRouter();
  const { toast } = useToast();
  const { signIn, signUp, signInWithGoogle, profile, loading: authLoading } = useAuth();
  
  // Load the real event from Firestore by slug or ID.
  const { events: allEvents, loading: eventsLoading } = useEvents();
  const event = allEvents.find(e => e.slug === id || e.id === id) ?? null;
  
  const [step, setStep] = useState(1);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState<boolean | 'form' | 'signup' | 'google' | null>(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank' | 'crypto'>('card');
  const [currency, setCurrency] = useState<'NGN' | 'USD'>('NGN');
  
  // Attendee Info State
  const [checkoutMode, setCheckoutMode] = useState<'guest' | 'login' | 'signup'>('login');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [attendeeInfo, setAttendeeInfo] = useState({
    fullname: '',
    email: '',
    phone: ''
  });

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Checkout-only signup state (distinct from the main /signup page: attendee-only)
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  // Ticket tier selected on the event page (?tier=Name&qty=N).
  const [tierName, setTierName] = useState<string | null>(null);
  const [tierUnitPrice, setTierUnitPrice] = useState<number | null>(null);
  useEffect(() => {
    if (typeof window === 'undefined' || !event) return;
    const qs = new URLSearchParams(window.location.search);
    const t = qs.get('tier');
    if (!t) return;
    setTierName(t);
    const evTiers = (event as unknown as {tiers?: {name: string; price: number}[]}).tiers;
    const found = Array.isArray(evTiers) ? evTiers.find((x) => x.name === t) : undefined;
    setTierUnitPrice(found ? found.price : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event?.id]);
  const unitPrice = tierUnitPrice ?? event?.price.min ?? 0;
  const totalNaira = unitPrice * quantity;
  const totalUsd = (totalNaira / NGN_TO_USD_RATE).toFixed(2);
  const totalToCharge = currency === 'USD' ? Number(totalUsd) : totalNaira;

  // Already signed in? Skip the login/signup step entirely.
  useEffect(() => {
    if (!authLoading && profile) {
      setIsLoggedIn(true);
      setAttendeeInfo(prev => ({
        fullname: prev.fullname || profile.name,
        email: prev.email || profile.email,
        phone: prev.phone
      }));
    }
  }, [authLoading, profile]);

  // Card supports NGN + USD; bank transfer is NGN-only; crypto is USD-only.
  const handleSelectMethod = (method: 'card' | 'bank' | 'crypto') => {
    setPaymentMethod(method);
    if (method === 'bank') setCurrency('NGN');
    if (method === 'crypto') setCurrency('USD');
  };

  const fireWelcomeEmail = (name: string, email: string, method: string) => {
    fetch('/api/email/welcome', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({name, email, role: 'attendee', method}),
    }).catch(() => undefined);
  };

  // Handle return from the hosted Bachs checkout (success_url / cancel_url).
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const qs = new URLSearchParams(window.location.search);
    const sessionId = qs.get('session_id');
    const status = qs.get('status');

    if (status === 'cancelled') {
      toast({ variant: 'destructive', title: 'Payment Cancelled', description: 'You can try again whenever you are ready.' });
      setStep(2);
      return;
    }

    if (sessionId) {
      (async () => {
        setLoading(true);
        try {
          const res = await fetch(`/api/bachs/checkout/verify?session_id=${encodeURIComponent(sessionId)}`);
          const data = await res.json();
          if (data.paid || data.demo) {
            setStep(3);
            toast({ title: 'Payment Successful!', description: 'Your tickets have been generated and sent to your email.' });
          } else {
            setStep(2);
            toast({ variant: 'destructive', title: 'Payment Not Confirmed', description: `Session status: ${data.status || 'unknown'}. You can retry the payment.` });
          }
        } catch {
          setStep(2);
          toast({ variant: 'destructive', title: 'Verification Failed', description: 'Could not confirm your payment. Your ticket will appear once the payment settles.' });
        }
        setLoading(false);
        // Clean the URL so refreshes don't re-verify.
        window.history.replaceState({}, '', window.location.pathname);
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogin = async () => {
    setLoading('form');
    try {
      const profile = await signIn(loginEmail.trim(), loginPassword);
      if (profile.role !== 'attendee') {
        throw new Error('Checkout requires an attendee account.');
      }
      setIsLoggedIn(true);
      setAttendeeInfo({
        fullname: profile.name,
        email: profile.email,
        phone: '+234 812 345 6789'
      });
      toast({
        title: "Logged in successfully",
        description: `Welcome back, ${profile.name}!`,
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: err instanceof Error ? err.message : "Invalid email or password.",
      });
    }
    setLoading(false);
  };

  // Checkout-only signup: instant attendee account, then straight into the order.
  const handleCheckoutSignUp = async () => {
    if (!signupName.trim() || !signupEmail.trim() || signupPassword.length < 6) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Enter your name, a valid email, and a password of at least 6 characters.",
      });
      return;
    }
    setLoading('signup');
    try {
      await signUp({name: signupName.trim(), email: signupEmail.trim(), password: signupPassword, role: 'attendee'});
      fireWelcomeEmail(signupName.trim(), signupEmail.trim(), 'checkout signup');
      setIsLoggedIn(true);
      setAttendeeInfo({fullname: signupName.trim(), email: signupEmail.trim(), phone: ''});
      toast({
        title: "Account Created",
        description: "You're all set — continue to payment below.",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Signup Failed",
        description: err instanceof Error ? err.message.replace('Firebase: ', '') : 'Could not create your account.',
      });
    }
    setLoading(null);
  };

  const handleCheckoutGoogle = async () => {
    setLoading('google');
    try {
      const prof = await signInWithGoogle();
      fireWelcomeEmail(prof.name || '', prof.email, 'google');
      setIsLoggedIn(true);
      setAttendeeInfo(prev => ({...prev, fullname: prof.name, email: prof.email}));
      toast({
        title: "Signed in with Google",
        description: `Welcome${prof.name ? `, ${prof.name}` : ''} — continue to payment below.`,
      });
    } catch (err) {
      const code = (err as {code?: string})?.code || '';
      const messages: Record<string, string> = {
        'auth/popup-closed-by-user': 'The Google popup was closed before sign-in finished.',
        'auth/popup-blocked': 'Popup blocked — allow popups for this site and try again.',
        'auth/cancelled-popup-request': 'Sign-in was cancelled.',
        'auth/unauthorized-domain': 'Add this domain to Firebase → Authentication → Settings → Authorized domains.',
        'auth/operation-not-allowed': 'Google sign-in is not enabled yet — enable it in Firebase → Authentication → Sign-in method.',
      };
      toast({
        variant: "destructive",
        title: "Google Sign-In Failed",
        description: messages[code] || (err instanceof Error ? err.message : 'Could not sign in with Google.'),
      });
    }
    setLoading(null);
  };

  const handlePayment = async () => {
    if (!event) return;
    setLoading(true);
    try {
      const res = await fetch('/api/bachs/checkout', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          eventId: event.id,
          eventSlug: event.slug || event.id,
          eventTitle: event.title,
          quantity,
          unitPrice: currency === 'USD' ? Number((unitPrice / NGN_TO_USD_RATE).toFixed(2)) : unitPrice,
          currency,
          paymentMethod,
          buyer: {
            name: attendeeInfo.fullname,
            email: attendeeInfo.email,
            phone: attendeeInfo.phone,
          },
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || 'Could not start checkout.');
      }

      if (!data.checkoutUrl) {
        // Production requires the hosted Bachs checkout — no demo fallback.
        throw new Error('Payment gateway is not configured. Please try again later or contact support.');
      }

      // Real hosted Bachs checkout — redirect the browser.
      try {
        sessionStorage.setItem('bachs_checkout_id', data.checkoutId || '');
      } catch { /* ignore */ }
      window.location.href = data.checkoutUrl;
      return; // keep loading spinner until navigation takes over
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Payment Could Not Start',
        description: err instanceof Error ? err.message : 'Please try again.',
      });
      setLoading(false);
    }
  };

  const handleContinueToPayment = () => {
    if (!attendeeInfo.fullname || !attendeeInfo.email) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please provide your name and email address.",
      });
      return;
    }
    setStep(2);
  };

  if (!event) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-4 text-center">
        {eventsLoading ? (
          <>
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading checkout…</p>
          </>
        ) : (
          <>
            <h1 className="font-headline text-2xl">Event not found</h1>
            <p className="text-muted-foreground">This event may have been removed or the link is incorrect.</p>
            <Link href="/discover" className="text-primary font-bold">Back to Discover</Link>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pt-48 pb-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Main Checkout Section */}
          <div className="lg:col-span-3 text-left">
            {step === 1 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-2">
                  <h1 className="font-headline">Attendee Information</h1>
                  <p className="text-muted-foreground">Choose how you want to proceed with your ticket purchase.</p>
                </div>

                {!isLoggedIn ? (
                  <Tabs value={checkoutMode} onValueChange={(v: any) => setCheckoutMode(v)} className="w-full">
                    <TabsList className="grid grid-cols-3 bg-secondary/50 p-1 rounded-2xl mb-8">
                      <TabsTrigger value="login" className="rounded-xl font-bold py-3">Sign In</TabsTrigger>
                      <TabsTrigger value="signup" className="rounded-xl font-bold py-3">Sign Up</TabsTrigger>
                      <TabsTrigger value="guest" className="rounded-xl font-bold py-3">Guest</TabsTrigger>
                    </TabsList>

                    <TabsContent value="login" className="space-y-6 mt-0">
                      <Card className="border-border bg-card/50">
                        <CardContent className="pt-6 space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="login-email">Email or Username</Label>
                            <Input 
                              id="login-email" 
                              type="text" 
                              placeholder="Email or 'Attendee'" 
                              className="bg-background h-11" 
                              value={loginEmail}
                              onChange={(e) => setLoginEmail(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="login-password">Password</Label>
                            <div className="relative">
                              <Input 
                                id="login-password" 
                                type={showLoginPassword ? "text" : "password"} 
                                placeholder="••••••••" 
                                className="bg-background h-11 pr-10" 
                                value={loginPassword}
                                onChange={(e) => setLoginPassword(e.target.value)}
                              />
                              <button
                                type="button"
                                onClick={() => setShowLoginPassword(!showLoginPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                              >
                                {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                          <Button 
                            className="w-full rounded-xl font-bold h-11" 
                            onClick={handleLogin}
                            disabled={!!loading}
                          >
                            {loading === 'form' ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In & Continue"}
                          </Button>
                          <div className="relative py-1">
                            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
                            <div className="relative flex justify-center text-[10px] uppercase"><span className="bg-card px-2 text-muted-foreground font-bold">or</span></div>
                          </div>
                          <Button
                            variant="outline"
                            className="w-full rounded-xl font-bold h-11"
                            onClick={handleCheckoutGoogle}
                            disabled={!!loading}
                          >
                            {loading === 'google' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Continue with Google
                          </Button>
                        </CardContent>
                      </Card>
                      <div className="space-y-4">
                        <p className="text-center text-xs text-muted-foreground">
                          Signing in allows you to save this ticket to your digital wallet and track your orders.
                        </p>
                        <p className="text-center text-sm">
                          New here? Use the <button type="button" onClick={() => setCheckoutMode('signup')} className="text-primary font-bold hover:underline bg-transparent border-0 p-0 cursor-pointer">Sign Up</button> tab to create an account in seconds.
                        </p>
                      </div>
                    </TabsContent>

                    <TabsContent value="signup" className="space-y-6 mt-0">
                      <Card className="border-border bg-card/50">
                        <CardContent className="pt-6 space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="signup-name">Full Name</Label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input
                                id="signup-name"
                                placeholder="Enter your full name"
                                className="bg-background h-11 pl-10"
                                value={signupName}
                                onChange={(e) => setSignupName(e.target.value)}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="signup-email">Email Address</Label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input
                                id="signup-email"
                                type="email"
                                placeholder="you@example.com"
                                className="bg-background h-11 pl-10"
                                value={signupEmail}
                                onChange={(e) => setSignupEmail(e.target.value)}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="signup-password">Password</Label>
                            <div className="relative">
                              <Input
                                id="signup-password"
                                type={showSignupPassword ? 'text' : 'password'}
                                placeholder="At least 6 characters"
                                className="bg-background h-11 pr-10"
                                value={signupPassword}
                                onChange={(e) => setSignupPassword(e.target.value)}
                              />
                              <button
                                type="button"
                                onClick={() => setShowSignupPassword(!showSignupPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                              >
                                {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                          <Button
                            className="w-full rounded-xl font-bold h-11"
                            onClick={handleCheckoutSignUp}
                            disabled={!!loading}
                          >
                            {loading === 'signup' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Account & Continue'}
                          </Button>
                          <div className="relative py-1">
                            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
                            <div className="relative flex justify-center text-[10px] uppercase"><span className="bg-card px-2 text-muted-foreground font-bold">or</span></div>
                          </div>
                          <Button
                            variant="outline"
                            className="w-full rounded-xl font-bold h-11"
                            onClick={handleCheckoutGoogle}
                            disabled={!!loading}
                          >
                            {loading === 'google' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Continue with Google
                          </Button>
                        </CardContent>
                      </Card>
                      <p className="text-center text-xs text-muted-foreground">
                        Your account keeps your tickets safe and speeds up your next checkout.
                      </p>
                    </TabsContent>

                    <TabsContent value="guest" className="space-y-6 mt-0">
                      <div className="grid gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="fullname">Full Name</Label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input 
                              id="fullname" 
                              placeholder="Enter your full name" 
                              className="h-11 bg-card pl-10" 
                              value={attendeeInfo.fullname}
                              onChange={(e) => setAttendeeInfo({...attendeeInfo, fullname: e.target.value})}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input 
                              id="email" 
                              type="email" 
                              placeholder="Enter your email" 
                              className="h-11 bg-card pl-10" 
                              value={attendeeInfo.email}
                              onChange={(e) => setAttendeeInfo({...attendeeInfo, email: e.target.value})}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <div className="relative">
                            <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input 
                              id="phone" 
                              placeholder="+234..." 
                              className="h-11 bg-card pl-10" 
                              value={attendeeInfo.phone}
                              onChange={(e) => setAttendeeInfo({...attendeeInfo, phone: e.target.value})}
                            />
                          </div>
                        </div>
                      </div>
                      <Button onClick={handleContinueToPayment} className="w-full rounded-full gap-2 mt-4 h-11">
                        Continue to Payment <ArrowRight className="w-5 h-5" />
                      </Button>
                    </TabsContent>
                  </Tabs>
                ) : (
                  <div className="space-y-6">
                    <Card className="border-primary/20 bg-primary/5 p-6 rounded-3xl">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-7 h-7 text-primary" />
                        </div>
                        <div className="text-left">
                          <p className="text-xs text-muted-foreground uppercase font-black tracking-widest">Logged in as</p>
                          <h3 className="font-headline text-xl">{attendeeInfo.fullname}</h3>
                          <p className="text-sm text-muted-foreground">{attendeeInfo.email}</p>
                        </div>
                      </div>
                      <Separator className="my-6 bg-primary/10" />
                      <div className="space-y-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Account Status</span>
                          <span className="font-bold text-primary">Verified Attendee</span>
                        </div>
                      </div>
                    </Card>
                    <div className="space-y-3">
                      <Button onClick={() => setStep(2)} className="w-full rounded-full gap-2 h-11">
                        Continue to Payment <ArrowRight className="w-5 h-5" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="w-full font-bold text-muted-foreground hover:text-foreground rounded-xl h-11"
                        onClick={() => setIsLoggedIn(false)}
                      >
                        Switch account or checkout as guest
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="text-left">
                  <h1 className="font-headline">Select Payment</h1>
                  <p className="text-xs text-muted-foreground mt-1">Paying as: {attendeeInfo.fullname}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-2 p-1.5 bg-secondary/50 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setCurrency('NGN')}
                    disabled={paymentMethod === 'crypto'}
                    className={`py-2.5 rounded-xl text-sm font-black transition-all disabled:opacity-40 disabled:cursor-not-allowed ${currency === 'NGN' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    ₦ NGN
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrency('USD')}
                    disabled={paymentMethod === 'bank'}
                    className={`py-2.5 rounded-xl text-sm font-black transition-all disabled:opacity-40 disabled:cursor-not-allowed ${currency === 'USD' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    $ USD
                  </button>
                </div>

                <RadioGroup value={paymentMethod} onValueChange={handleSelectMethod} className="grid gap-4">
                  <PaymentOption id="card" label="Card Payment" icon={CreditCard} description="Visa, Mastercard, Verve — NGN or USD" />
                  <PaymentOption id="bank" label="Bank Transfer" icon={Landmark} description="Nigerian bank transfer (NGN)" />
                  <PaymentOption 
                    id="crypto" 
                    label="Crypto" 
                    icon={Coins} 
                    description="USDC, USDT, ETH, SOL & more (USD)" 
                    badge="USD"
                  />
                </RadioGroup>

                <div className="bg-primary/5 border border-primary/10 p-5 rounded-2xl flex gap-4 items-start mt-6">
                  <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-bold">Secure Transaction</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {paymentMethod === 'crypto' 
                        ? "Crypto payments are processed by Bachs. Pay with USDC or USDT and your ticket is issued once the payment settles."
                        : "Your payment is protected by bank-level encryption via Bachs. We do not store your private financial data."}
                    </p>
                  </div>
                </div>

                <div className="pt-6 flex flex-col gap-3">
                  <Button 
                    onClick={handlePayment} 
                    disabled={!!loading}
                    className="w-full rounded-full shadow-xl shadow-primary/20 h-11 font-bold"
                  >
                    {loading ? (
                      <div className="flex items-center gap-3">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Redirecting to Bachs…</span>
                      </div>
                    ) : (
                      paymentMethod === 'crypto'
                        ? `Pay $${Number(totalUsd).toFixed(2)} in Crypto`
                        : currency === 'USD'
                          ? `Pay $${Number(totalUsd).toFixed(2)}`
                          : `Pay ₦${totalNaira.toLocaleString()}`
                    )}
                  </Button>
                  <Button variant="ghost" onClick={() => setStep(1)} className="font-bold h-11">
                    Back to Attendee Details
                  </Button>
                  {paymentMethod === 'crypto' && (
                    <p className="text-[10px] text-center text-muted-foreground mt-4 uppercase font-black tracking-widest">
                      Rate: 1 USD ≈ ₦{NGN_TO_USD_RATE.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="py-12 space-y-6 animate-in zoom-in-95 duration-500 text-center">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6 mx-auto border-4 border-primary/20">
                  <CheckCircle2 className="w-12 h-12 text-primary" />
                </div>
                <h1 className="font-headline">Payment Confirmed!</h1>
                <p className="text-muted-foreground max-md mx-auto leading-relaxed">
                  Thank you for your purchase. Your secure QR code ticket is now available in your digital wallet.
                </p>
                <div className="pt-10 flex flex-col sm:flex-row justify-center gap-4">
                  <Button onClick={() => router.push('/dashboard/attendee')} variant="outline" className="rounded-full px-10 border-2 h-11 font-bold">
                    Go to Wallet
                  </Button>
                  <Button onClick={() => router.push('/')} className="rounded-full px-10 shadow-xl shadow-primary/20 h-11 font-bold">
                    Back to Home
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-2">
            <Card className="border-border bg-card sticky top-32 overflow-hidden rounded-[2rem] shadow-2xl">
              <div className="aspect-[16/10] relative">
                <img src={event.image} alt="" className="object-cover w-full h-full brightness-75" />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
                <div className="absolute bottom-6 left-6 text-left">
                  <h3 className="font-headline text-xl text-white tracking-tight">{event.title}</h3>
                  <p className="text-sm text-white/70 font-medium">{event.venue}</p>
                </div>
              </div>
              <CardContent className="p-8 space-y-8">
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground font-medium">Ticket Type</span>
                    <span className="font-bold">{tierName || 'General Admission'}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground font-medium">Price</span>
                    <span className="font-bold">₦{unitPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground font-medium">Quantity</span>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-primary hover:text-white transition-all disabled:opacity-50"
                        disabled={step >= 3}
                      > - </button>
                      <span className="font-bold w-4 text-center">{quantity}</span>
                      <button 
                         onClick={() => setQuantity(quantity + 1)}
                         className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-primary hover:text-white transition-all"
                         disabled={step >= 3}
                      > + </button>
                    </div>
                  </div>
                  <Separator className="bg-border/50" />
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-baseline">
                      <span className="font-bold text-lg">Total</span>
                      <div className="text-right">
                        <span className="block font-black text-3xl text-primary tracking-tighter">{currency === 'USD' ? `$${Number(totalUsd).toFixed(2)}` : `₦${totalNaira.toLocaleString()}`}</span>
                        {currency === 'NGN' && (
                          <span className="text-xs font-black text-accent uppercase tracking-widest animate-in fade-in">
                            ≈ ${totalUsd} USD
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {step < 3 && (
                  <div className="space-y-4 text-left">
                    <Label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 font-black">Promo Code</Label>
                    <div className="flex gap-2">
                      <Input placeholder="Enter code" className="h-11 bg-secondary/50 border-none rounded-xl" />
                      <Button variant="outline" className="rounded-xl px-6 font-bold h-11">Apply</Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function PaymentOption({ id, label, icon: Icon, description, badge, disabled }: any) {
  return (
    <div className="relative">
      <RadioGroupItem value={id} id={id} className="peer sr-only" disabled={disabled} />
      <Label
        htmlFor={id}
        className={`flex items-center gap-5 p-5 rounded-2xl border-2 border-border bg-card relative overflow-hidden transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-secondary/40'}`}
      >
        <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center peer-data-[state=checked]:bg-primary/20 shrink-0">
          <Icon className="w-6 h-6 text-muted-foreground peer-data-[state=checked]:text-primary" />
        </div>
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg leading-none">{label}</span>
            {badge && (
              <span className={`${disabled ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary'} text-[8px] font-black px-1.5 py-0.5 rounded-sm uppercase tracking-widest`}>
                {badge}
              </span>
            )}
          </div>
          <div className="text-xs text-muted-foreground mt-1 font-medium">{description}</div>
        </div>
        <div className="w-5 h-5 rounded-full border-2 border-border flex items-center justify-center peer-data-[state=checked]:border-primary">
          <div className="w-2.5 h-2.5 rounded-full bg-primary scale-0 peer-data-[state=checked]:scale-100 transition-transform" />
        </div>
      </Label>
    </div>
  );
}
