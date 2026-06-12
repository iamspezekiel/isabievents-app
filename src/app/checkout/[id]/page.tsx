"use client";

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ShieldCheck, CreditCard, Wallet, Landmark, CheckCircle2, Loader2, ArrowRight, Coins, CircleDollarSign, Zap } from 'lucide-react';
import { MOCK_EVENTS } from '@/lib/mock-data';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";

const NGN_TO_USD_RATE = 1550; // Mock exchange rate

export default function CheckoutPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const event = MOCK_EVENTS.find(e => e.id === id) || MOCK_EVENTS[0];
  
  const [step, setStep] = useState(1);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');

  const totalNaira = event.price.min * quantity;
  const totalUsd = (totalNaira / NGN_TO_USD_RATE).toFixed(2);

  const handlePayment = async () => {
    setLoading(true);
    // Simulate payment processing
    await new Promise(r => setTimeout(r, 2500));
    setLoading(false);
    setStep(3);
    toast({
      title: "Payment Successful!",
      description: paymentMethod === 'solana' 
        ? `Transaction confirmed on Solana. ${totalUsd} USDC received.`
        : "Your tickets have been generated and sent to your email.",
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground pt-48 pb-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Main Checkout Section */}
          <div className="lg:col-span-3 text-left">
            {step === 1 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h1 className="font-headline text-3xl">Attendee Information</h1>
                <div className="grid gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullname">Full Name</Label>
                    <Input id="fullname" placeholder="Enter your full name" className="h-12 bg-card" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" placeholder="Enter your email" className="h-12 bg-card" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" placeholder="+234..." className="h-12 bg-card" />
                  </div>
                </div>

                <div className="pt-6">
                  <Button onClick={() => setStep(2)} className="w-full h-14 rounded-full text-lg gap-2 no-underline">
                    Proceed to Payment <ArrowRight className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center justify-between">
                  <h1 className="font-headline text-3xl">Select Payment</h1>
                  {paymentMethod === 'solana' && (
                    <div className="flex items-center gap-2 text-xs font-black text-primary animate-pulse">
                      <Zap className="w-3 h-3 fill-current" />
                      INSTANT CONFIRMATION
                    </div>
                  )}
                </div>
                
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid gap-4">
                  <PaymentOption id="card" label="Card Payment" icon={CreditCard} description="Visa, Mastercard, Verve" />
                  <PaymentOption id="bank" label="Bank Transfer" icon={Landmark} description="Direct transfer to Escrow" />
                  <PaymentOption 
                    id="solana" 
                    label="SolanaPay" 
                    icon={Coins} 
                    description="Pay with USDC or USDT" 
                    badge="FAST"
                  />
                  <PaymentOption id="wallet" label="Isabi Wallet" icon={Wallet} description="Balance: ₦25,000.00" />
                </RadioGroup>

                <div className="bg-primary/5 border border-primary/10 p-5 rounded-2xl flex gap-4 items-start mt-6">
                  <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-bold">Secure Transaction</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {paymentMethod === 'solana' 
                        ? "SolanaPay uses direct wallet-to-wallet transfers. No middleman, zero fees, near-instant."
                        : "Your payment is protected by bank-level encryption. We do not store your private financial data."}
                    </p>
                  </div>
                </div>

                <div className="pt-6">
                  <Button 
                    onClick={handlePayment} 
                    disabled={loading}
                    className="w-full h-14 rounded-full text-lg no-underline shadow-xl shadow-primary/20"
                  >
                    {loading ? (
                      <div className="flex items-center gap-3">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>{paymentMethod === 'solana' ? 'Confirming on Chain...' : 'Processing...'}</span>
                      </div>
                    ) : (
                      paymentMethod === 'solana' 
                        ? `Pay ${totalUsd} USDC` 
                        : `Pay ₦${totalNaira.toLocaleString()}`
                    )}
                  </Button>
                  {paymentMethod === 'solana' && (
                    <p className="text-[10px] text-center text-muted-foreground mt-4 uppercase font-black tracking-widest">
                      Rate: 1 USD ≈ ₦{NGN_TO_USD_RATE}
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
                <h1 className="font-headline text-4xl">Payment Confirmed!</h1>
                <p className="text-muted-foreground text-lg max-w-md mx-auto leading-relaxed">
                  Thank you for your purchase. Your secure QR code ticket is now available in your digital wallet.
                </p>
                <div className="pt-10 flex flex-col sm:flex-row justify-center gap-4">
                  <Button onClick={() => router.push('/dashboard/attendee')} variant="outline" className="rounded-full px-10 h-14 text-lg no-underline border-2">
                    Go to Wallet
                  </Button>
                  <Button onClick={() => router.push('/')} className="rounded-full px-10 h-14 text-lg no-underline shadow-xl shadow-primary/20">
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
                    <span className="font-bold">Standard Access</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground font-medium">Price</span>
                    <span className="font-bold">₦{event.price.min.toLocaleString()}</span>
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
                        <span className="block font-black text-3xl text-primary tracking-tighter">₦{totalNaira.toLocaleString()}</span>
                        {paymentMethod === 'solana' && (
                          <span className="text-xs font-black text-accent uppercase tracking-widest animate-in fade-in">
                            ≈ {totalUsd} USDC
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
                      <Input placeholder="Enter code" className="h-12 bg-secondary/50 border-none rounded-xl" />
                      <Button variant="outline" className="h-12 rounded-xl px-6 font-bold">Apply</Button>
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

function PaymentOption({ id, label, icon: Icon, description, badge }: any) {
  return (
    <div className="relative">
      <RadioGroupItem value={id} id={id} className="peer sr-only" />
      <Label
        htmlFor={id}
        className="flex items-center gap-5 p-5 rounded-2xl border-2 border-border bg-card cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:bg-secondary/40 relative overflow-hidden"
      >
        <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center peer-data-[state=checked]:bg-primary/20 shrink-0">
          <Icon className="w-6 h-6 text-muted-foreground peer-data-[state=checked]:text-primary" />
        </div>
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg leading-none">{label}</span>
            {badge && (
              <span className="bg-primary/10 text-primary text-[8px] font-black px-1.5 py-0.5 rounded-sm uppercase tracking-widest">
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
