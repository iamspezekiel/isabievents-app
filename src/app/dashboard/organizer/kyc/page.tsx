/**
 * Identity Verification (KYC) — organizer side.
 *  - Fixed spacing: sits inside the organizer dashboard layout (no extra
 *    top padding / duplicate sticky header).
 *  - Loads the organizer's own submission so pending/approved/rejected
 *    states are shown instead of a blind form.
 *  - Real document photo upload (client-side compression → stored with
 *    the submission and shown to the admin reviewer).
 */
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  ShieldCheck, 
  Upload, 
  CheckCircle2, 
  FileText, 
  Building2, 
  User,
  Loader2,
  AlertCircle,
  Clock,
  X
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from '@/lib/api-fetch';

interface KycSubmission {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  date: string;
  document?: string;
  documentPhoto?: string;
}

export default function KYCVerificationPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [step, setStep] = useState(1);
  const [mySubmission, setMySubmission] = useState<KycSubmission | null>(null);
  const [documentPhoto, setDocumentPhoto] = useState('');

  const [formData, setFormData] = useState({
    idType: '',
    idNumber: '',
    businessType: 'individual',
    businessName: '',
    rcNumber: '',
  });

  // Load the organizer's own latest submission (pending/approved/rejected).
  useEffect(() => {
    apiFetch('/api/kyc')
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d?.mine) && d.mine.length > 0) {
          setMySubmission(d.mine[0] as KycSubmission);
        }
      })
      .catch(() => undefined)
      .finally(() => setChecking(false));
  }, []);

  // Real file upload: validate → compress via canvas → dataURL preview.
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast({variant: 'destructive', title: 'Unsupported File', description: 'Please upload a PNG or JPG image of your document.'});
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({variant: 'destructive', title: 'File Too Large', description: 'Maximum size is 5MB.'});
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.onload = () => {
        const scale = Math.min(1, 1000 / img.width);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        setDocumentPhoto(canvas.toDataURL('image/jpeg', 0.75));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!formData.idType || !formData.idNumber) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please select an ID type and enter the ID number.",
      });
      return;
    }
    setLoading(true);
    try {
      const res = await apiFetch('/api/kyc', {
        method: 'POST',
        body: JSON.stringify({...formData, documentPhoto}),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Submission failed.');

      // Stay on this page and switch to the "under review" state.
      setMySubmission({
        id: data.id || '',
        status: 'pending',
        date: new Date().toISOString(),
        document: `${formData.idType.toUpperCase()} · ${formData.idNumber}`,
        documentPhoto,
      });
      toast({
        title: "Verification Submitted",
        description: "Our team will review your documents within 48 hours — you'll get an email.",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: err instanceof Error ? err.message : 'Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const status = mySubmission?.status;

  return (
    <div className="p-4 pb-16 md:p-12 md:pb-16 space-y-6">
      <header className="pb-4 border-b border-border flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-left">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-headline text-xl md:text-2xl tracking-tighter">Identity Verification</h1>
            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Optional but Recommended</p>
          </div>
        </div>
        {checking ? null : status === 'pending' ? (
          <Badge className="bg-yellow-500/10 text-yellow-600 border-none gap-1 font-bold shrink-0">
            <Clock className="w-3 h-3" /> Under Review
          </Badge>
        ) : status === 'approved' ? (
          <Badge className="bg-green-500/10 text-green-500 border-none gap-1 font-bold shrink-0">
            <CheckCircle2 className="w-3 h-3" /> Verified
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 shrink-0">
            Step {step} of 2
          </Badge>
        )}
      </header>

      <main className="max-w-2xl mx-auto pt-2 space-y-8">
        {checking && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        )}

        {/* Pending: submission is with the review team */}
        {!checking && status === 'pending' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
            <Card className="border-yellow-500/30 bg-yellow-500/5">
              <CardContent className="p-8 text-left space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-yellow-500/10 flex items-center justify-center">
                  <Clock className="w-7 h-7 text-yellow-600" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-headline text-2xl">Verification under review</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Our team is reviewing your submission ({mySubmission?.document || 'ID document'}). You&apos;ll receive an email
                    as soon as a decision is made — usually within 48 hours.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  {mySubmission?.date && (
                    <span>Submitted {new Date(mySubmission.date).toLocaleString('en-NG', {dateStyle: 'medium', timeStyle: 'short'})}</span>
                  )}
                  {mySubmission?.id && <span className="font-mono">Ref {mySubmission.id}</span>}
                </div>
                <Button variant="outline" className="rounded-full font-bold h-11 px-8" onClick={() => router.push('/dashboard/organizer')}>
                  Back to Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Approved: verified */}
        {!checking && status === 'approved' && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
            <Card className="border-green-500/30 bg-green-500/5">
              <CardContent className="p-8 text-left space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7 text-green-600" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-headline text-2xl">You&apos;re verified! 🎉</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Your identity has been confirmed. You now get the verified badge, featured placement in discovery,
                    and eligibility for instant ticket settlements. Your new events are auto-approved.
                  </p>
                </div>
                <Button className="rounded-full font-bold h-11 px-8" onClick={() => router.push('/dashboard/organizer')}>
                  Back to Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Rejected: allow resubmission */}
        {!checking && status === 'rejected' && (
          <div className="bg-yellow-500/5 border border-yellow-500/20 p-4 rounded-2xl flex gap-3 items-start animate-in fade-in slide-in-from-top-4 duration-500">
            <AlertCircle className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
            <p className="text-xs text-yellow-800 leading-relaxed text-left">
              Your previous submission was declined. Please double-check your details and document photo below, then submit again.
            </p>
          </div>
        )}

        {/* The form: shown when nothing is pending or previously approved */}
        {!checking && (!status || status === 'rejected') && (
          <>
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
                      <Label htmlFor="doc-photo">Document Photo</Label>
                      <input
                        id="doc-photo"
                        type="file"
                        accept="image/png,image/jpeg"
                        className="sr-only"
                        onChange={handleFileChange}
                      />
                      <label
                        htmlFor="doc-photo"
                        className="aspect-video bg-secondary/50 rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-secondary transition-all overflow-hidden"
                      >
                        {documentPhoto ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={documentPhoto} alt="Document preview" className="w-full h-full object-contain" />
                        ) : (
                          <>
                            <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center shadow-sm">
                              <Upload className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-bold">Upload front side</p>
                              <p className="text-[10px] text-muted-foreground">PNG or JPG · Max 5MB (auto-compressed)</p>
                            </div>
                          </>
                        )}
                      </label>
                      {documentPhoto && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full gap-2 font-bold h-9"
                          onClick={() => setDocumentPhoto('')}
                        >
                          <X className="w-4 h-4" /> Remove Photo
                        </Button>
                      )}
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
                          type="button"
                          onClick={() => setFormData({...formData, businessType: 'individual'})}
                          className={`p-4 rounded-xl border-2 text-left transition-all ${formData.businessType === 'individual' ? 'border-primary bg-primary/5' : 'border-border hover:bg-secondary'}`}
                        >
                          <div className="font-bold text-sm">Individual</div>
                          <div className="text-[10px] text-muted-foreground">Personal brand or freelancer</div>
                        </button>
                        <button 
                          type="button"
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
                        placeholder="e.g. Your brand name" 
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

                    <div className="p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-xl flex gap-3">
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
          </>
        )}
      </main>
    </div>
  );
}
