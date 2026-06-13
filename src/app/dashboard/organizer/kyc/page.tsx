"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  ShieldCheck, 
  Upload, 
  CheckCircle2, 
  Info, 
  FileText, 
  Building2, 
  User,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export default function KYCVerificationPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    idType: '',
    idNumber: '',
    businessType: 'individual',
    businessName: '',
    rcNumber: '',
  });

  const handleSubmit = async () => {
    setLoading(true);
    // Simulate API submission
    await new Promise(r => setTimeout(r, 2000));
    setLoading(false);
    
    toast({
      title: "Verification Submitted",
      description: "Our team will review your documents within 48 hours.",
    });
    router.push('/dashboard/organizer/settings');
  };

  return (
    <div className="min-h-screen bg-background pb-20 pt-24">
      <header className="border-b border-border bg-card sticky top-0 z-50 py-4 mt-16">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="text-left">
              <h1 className="font-headline text-xl md:text-2xl tracking-tighter">Identity Verification</h1>
              <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Optional but Recommended</p>
            </div>
          </div>
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
            Step {step} of 2
          </Badge>
        </div>
      </header>

      <main className="container mx-auto px-4 pt-12 max-w-2xl">
        <div className="space-y-8">
          {/* Why Verify Banner */}
          <div className="bg-primary/5 border border-primary/10 p-6 rounded-3xl flex gap-4 items-start animate-in fade-in slide-in-from-top-4 duration-500">
            <ShieldCheck className="w-6 h-6 text-primary shrink-0" />
            <div className="text-left space-y-1">
              <h4 className="font-bold text-primary">Why verify your account?</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Verified organizers enjoy higher trust scores, featured placement in discovery, and eligibility for instant ticket settlements.
              </p>
            </div>
          </div>

          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <Card className="border-border bg-card">
                <CardHeader className="text-left">
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" /> Personal Identity
                  </CardTitle>
                  <CardDescription>Government-issued identification for the primary account holder.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 text-left">
                  <div className="space-y-2">
                    <Label htmlFor="id-type">ID Document Type</Label>
                    <Select value={formData.idType} onValueChange={(v) => setFormData({...formData, idType: v})}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select document type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nin">National ID (NIN)</SelectItem>
                        <SelectItem value="passport">International Passport</SelectItem>
                        <SelectItem value="voters">Voter's Card</SelectItem>
                        <SelectItem value="drivers">Driver's License</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="id-number">ID Number</Label>
                    <Input 
                      id="id-number" 
                      placeholder="Enter number as on document" 
                      className="h-11"
                      value={formData.idNumber}
                      onChange={(e) => setFormData({...formData, idNumber: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Document Photo</Label>
                    <div className="aspect-video bg-secondary/50 rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-secondary transition-all">
                      <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center shadow-sm">
                        <Upload className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold">Upload front side</p>
                        <p className="text-[10px] text-muted-foreground">PNG, JPG or PDF · Max 5MB</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Button onClick={() => setStep(2)} className="w-full rounded-full h-9 md:h-11 font-bold shadow-xl shadow-primary/20">
                Continue to Business Info
              </Button>
              <Button variant="ghost" onClick={() => router.back()} className="w-full font-bold text-muted-foreground">
                Skip for now
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <Card className="border-border bg-card">
                <CardHeader className="text-left">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-primary" /> Business Details
                  </CardTitle>
                  <CardDescription>Tell us about the entity hosting your events.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 text-left">
                  <div className="space-y-3">
                    <Label>Host Entity Type</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <button 
                        onClick={() => setFormData({...formData, businessType: 'individual'})}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${formData.businessType === 'individual' ? 'border-primary bg-primary/5' : 'border-border hover:bg-secondary'}`}
                      >
                        <div className="font-bold text-sm">Individual</div>
                        <div className="text-[10px] text-muted-foreground">Personal brand or freelancer</div>
                      </button>
                      <button 
                        onClick={() => setFormData({...formData, businessType: 'company'})}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${formData.businessType === 'company' ? 'border-primary bg-primary/5' : 'border-border hover:bg-secondary'}`}
                      >
                        <div className="font-bold text-sm">Registered Co.</div>
                        <div className="text-[10px] text-muted-foreground">LLC, LTD, or NGO</div>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="biz-name">Brand / Business Name</Label>
                    <Input 
                      id="biz-name" 
                      placeholder="e.g. Smooth Events Nigeria" 
                      className="h-11"
                      value={formData.businessName}
                      onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                    />
                  </div>

                  {formData.businessType === 'company' && (
                    <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                      <Label htmlFor="rc-number">CAC Registration (RC/BN Number)</Label>
                      <Input 
                        id="rc-number" 
                        placeholder="e.g. RC 1234567" 
                        className="h-11"
                        value={formData.rcNumber}
                        onChange={(e) => setFormData({...formData, rcNumber: e.target.value})}
                      />
                    </div>
                  )}

                  <div className="pt-4 p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-xl flex gap-3">
                    <AlertCircle className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-yellow-800 leading-relaxed">
                      Please ensure your bank settlement details match the host name provided above to avoid payout delays.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1 rounded-full h-9 md:h-11 font-bold">
                  Back
                </Button>
                <Button onClick={handleSubmit} disabled={loading} className="flex-[2] rounded-full h-9 md:h-11 font-bold shadow-xl shadow-primary/20">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit for Verification"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
