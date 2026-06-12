
"use client";

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, ShieldCheck, CreditCard, Wallet, Landmark, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { MOCK_EVENTS } from '@/lib/mock-data';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";

export default function CheckoutPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const event = MOCK_EVENTS.find(e => e.id === id) || MOCK_EVENTS[0];
  
  const [step, setStep] = useState(1);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');

  const handlePayment = async () => {
    setLoading(true);
    // Simulate payment processing
    await new Promise(r => setTimeout(r, 2000));
    setLoading(false);
    setStep(3);
    toast({
      title: "Payment Successful!",
      description: "Your tickets have been generated and sent to your email.",
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground pt-32 pb-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-muted-foreground hover:text-white mb-8 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to Event
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Main Checkout Section */}
          <div className="lg:col-span-3">
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
                  <Button onClick={() => setStep(2)} className="w-full h-14 rounded-full text-lg gap-2">
                    Proceed to Payment <ArrowRight className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <h1 className="font-headline text-3xl">Select Payment Method</h1>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid gap-4">
                  <PaymentOption id="card" label="Card Payment" icon={CreditCard} description="Pay with Visa, Mastercard or Verve" />
                  <PaymentOption id="bank" label="Bank Transfer" icon={Landmark} description="Direct transfer to IsabiEvents escrow" />
                  <PaymentOption id="wallet" label="Isabi Wallet" icon={Wallet} description="Balance: ₦25,000.00" />
                </RadioGroup>

                <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl flex gap-3 items-start mt-6">
                  <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground">
                    Your payment is secure. We use bank-level encryption and do not store your card details.
                  </p>
                </div>

                <div className="pt-6">
                  <Button 
                    onClick={handlePayment} 
                    disabled={loading}
                    className="w-full h-14 rounded-full text-lg"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : `Pay ₦${(event.price.min * quantity).toLocaleString()}`}
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="text-left py-12 space-y-6 animate-in zoom-in-95 duration-500">
                <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-12 h-12 text-accent" />
                </div>
                <h1 className="font-headline text-3xl">Payment Confirmed!</h1>
                <p className="text-muted-foreground text-lg max-w-md">
                  Thank you for your purchase. Your ticket QR code has been sent to your email and is now available in your wallet.
                </p>
                <div className="pt-8 flex flex-col sm:flex-row gap-4">
                  <Button onClick={() => router.push('/dashboard/attendee')} variant="outline" className="rounded-full px-10 h-12">
                    Go to Wallet
                  </Button>
                  <Button onClick={() => router.push('/')} className="rounded-full px-10 h-12">
                    Back to Home
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-2">
            <Card className="border-border bg-card sticky top-32 overflow-hidden rounded-2xl shadow-xl">
              <div className="aspect-video relative">
                <img src={event.image} alt="" className="object-cover w-full h-full brightness-75" />
                <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <h3 className="font-headline text-lg text-white">{event.title}</h3>
                  <p className="text-xs text-white/70">{event.venue}</p>
                </div>
              </div>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Ticket Type</span>
                    <span className="font-medium">Standard Access</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Price</span>
                    <span className="font-medium">₦{event.price.min.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Quantity</span>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-primary transition-colors disabled:opacity-50"
                        disabled={step >= 3}
                      > - </button>
                      <span className="font-bold w-4 text-center">{quantity}</span>
                      <button 
                         onClick={() => setQuantity(quantity + 1)}
                         className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-primary transition-colors"
                         disabled={step >= 3}
                      > + </button>
                    </div>
                  </div>
                  <Separator className="bg-border" />
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-lg">Total</span>
                    <span className="font-bold text-2xl text-primary">₦{(event.price.min * quantity).toLocaleString()}</span>
                  </div>
                </div>

                {step < 3 && (
                  <div className="space-y-3">
                    <Label className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Promo Code</Label>
                    <div className="flex gap-2">
                      <Input placeholder="Enter code" className="h-10 bg-secondary border-none" />
                      <Button variant="outline" className="h-10 rounded-lg">Apply</Button>
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

function PaymentOption({ id, label, icon: Icon, description }: any) {
  return (
    <div className="relative">
      <RadioGroupItem value={id} id={id} className="peer sr-only" />
      <Label
        htmlFor={id}
        className="flex items-center gap-4 p-5 rounded-2xl border-2 border-border bg-card cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:bg-secondary/50"
      >
        <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center peer-data-[state=checked]:bg-primary/20">
          <Icon className="w-6 h-6 text-muted-foreground peer-data-[state=checked]:text-primary" />
        </div>
        <div className="flex-1">
          <div className="font-bold text-lg">{label}</div>
          <div className="text-xs text-muted-foreground">{description}</div>
        </div>
        <div className="w-5 h-5 rounded-full border-2 border-border flex items-center justify-center peer-data-[state=checked]:border-primary">
          <div className="w-2.5 h-2.5 rounded-full bg-primary scale-0 peer-data-[state=checked]:scale-100 transition-transform" />
        </div>
      </Label>
    </div>
  );
}
