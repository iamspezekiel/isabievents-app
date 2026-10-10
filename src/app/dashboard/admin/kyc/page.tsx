
"use client";

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  FileText, 
  Clock, 
  Eye, 
  Loader2,
  Copy
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from '@/lib/api-fetch';

interface KycRow {
  id: string;
  name: string;
  type: string;
  date: string;
  document: string;
  email?: string;
  businessName?: string;
  rcNumber?: string;
  idType?: string;
  idNumber?: string;
  documentPhoto?: string;
}

export default function AdminKYCManagement() {
  const [kycRequests, setKycRequests] = useState<KycRow[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [viewRow, setViewRow] = useState<KycRow | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    apiFetch('/api/kyc')
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d?.submissions)) setKycRequests(d.submissions as KycRow[]);
      })
      .catch(() => undefined);
  }, []);

  const handleAction = async (id: string, name: string, action: 'approve' | 'reject') => {
    setProcessingId(id);
    try {
      const res = await apiFetch('/api/kyc', {
        method: 'PATCH',
        body: JSON.stringify({id, action}),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Review action failed.');

      setKycRequests(prev => prev.filter(req => req.id !== id));
      if (action === 'approve') {
        toast({
          title: "KYC Approved",
          description: `${name} has been upgraded to a verified organizer status.`
        });
      } else {
        toast({
          variant: "destructive",
          title: "Verification Declined",
          description: `The KYC request for ${name} has been rejected.`
        });
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Action Failed",
        description: err instanceof Error ? err.message : 'Please try again.'
      });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="p-4 pb-16 md:p-12 md:pb-16 space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="text-left space-y-1">
          <h1 className="font-headline text-2xl md:text-4xl">Organizer Verification</h1>
          <p className="text-muted-foreground font-medium">Review identity documents and business registrations for host approval.</p>
        </div>
      </header>

      <div className="grid gap-6">
        <div className="flex items-center justify-between">
          <h3 className="font-headline text-xl text-left">Pending Approval ({kycRequests.length})</h3>
          <Badge className="bg-yellow-500/10 text-yellow-600 border-none font-black uppercase text-[10px] tracking-widest px-4 py-1.5">
            Priority Reviews
          </Badge>
        </div>

        {kycRequests.map((kyc) => (
          <Card key={kyc.id} className="border-border bg-card group hover:border-primary/30 transition-all overflow-hidden">
            <CardContent className="p-0 flex flex-col lg:flex-row">
              <div className="p-8 flex-1 text-left space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-bold text-xl">{kyc.name}</h4>
                      <Badge variant="secondary" className="rounded-md font-bold text-[10px]">{kyc.type}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" /> Received {new Date(kyc.date).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })}
                    </div>
                  </div>
                  <Badge variant="outline" className="font-mono text-[10px] opacity-60">ID: {kyc.id}</Badge>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-3 bg-secondary/30 p-3 rounded-xl border border-border flex-1">
                    <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center border border-border">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Main Doc</p>
                      <p className="text-xs font-bold truncate max-w-[150px]">{kyc.document}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full"
                      title="View Document"
                      onClick={() => setViewRow(kyc)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button 
                      onClick={() => handleAction(kyc.id, kyc.name, 'approve')}
                      disabled={processingId === kyc.id}
                      className="flex-1 sm:flex-none rounded-full bg-green-500 hover:bg-green-600 font-bold px-8 h-11 gap-2 shadow-lg shadow-green-500/10 min-w-[160px]"
                    >
                      {processingId === kyc.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      Approve KYC
                    </Button>
                    <Button 
                      onClick={() => handleAction(kyc.id, kyc.name, 'reject')}
                      disabled={processingId === kyc.id}
                      variant="outline" 
                      className="flex-1 sm:flex-none rounded-full text-red-500 border-red-500/20 hover:bg-red-500/5 font-bold h-11 px-6 min-w-[100px]"
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {kycRequests.length === 0 && (
          <div className="bg-card border border-dashed border-border py-24 rounded-[3rem] text-center">
            <CheckCircle2 className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">All KYC requests have been processed.</p>
          </div>
        )}

        <Dialog open={!!viewRow} onOpenChange={(open) => !open && setViewRow(null)}>
          <DialogContent className="bg-card border-border sm:rounded-[2rem] p-8 max-w-md w-[94vw] sm:w-full">
            <DialogHeader className="text-left">
              <DialogTitle className="font-headline text-2xl flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" /> Submission Document
              </DialogTitle>
              <DialogDescription>Full details of this KYC submission.</DialogDescription>
            </DialogHeader>
            {viewRow?.documentPhoto && (
              <div className="border border-border rounded-xl overflow-hidden bg-secondary/30">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={viewRow.documentPhoto} alt="Submitted document" className="w-full max-h-72 object-contain" />
              </div>
            )}
            {viewRow && (
              <div className="space-y-3 text-left text-sm">
                <div className="flex justify-between gap-4"><span className="text-muted-foreground font-bold">Name</span><span className="font-bold text-right break-words">{viewRow.name}</span></div>
                <div className="flex justify-between gap-4"><span className="text-muted-foreground font-bold">Type</span><span className="font-bold">{viewRow.type}</span></div>
                {viewRow.email && (<div className="flex justify-between gap-4"><span className="text-muted-foreground font-bold">Email</span><span className="font-bold text-right break-all">{viewRow.email}</span></div>)}
                {viewRow.businessName && (<div className="flex justify-between gap-4"><span className="text-muted-foreground font-bold">Business</span><span className="font-bold text-right break-words">{viewRow.businessName}</span></div>)}
                {viewRow.rcNumber && (<div className="flex justify-between gap-4"><span className="text-muted-foreground font-bold">RC Number</span><span className="font-mono font-bold">{viewRow.rcNumber}</span></div>)}
                <div className="flex justify-between gap-4"><span className="text-muted-foreground font-bold">ID Type</span><span className="font-bold">{viewRow.idType || "-"}</span></div>
                <div className="flex justify-between gap-4"><span className="text-muted-foreground font-bold">ID Number</span><span className="font-mono font-bold">{viewRow.idNumber || "-"}</span></div>
                <div className="flex justify-between gap-4"><span className="text-muted-foreground font-bold">Received</span><span className="font-bold text-right">{new Date(viewRow.date).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}</span></div>
                <div className="flex justify-between gap-4"><span className="text-muted-foreground font-bold">Ref</span><span className="font-mono text-xs break-all">{viewRow.id}</span></div>
                <Button
                  variant="outline"
                  className="w-full rounded-xl gap-2 font-bold mt-2"
                  onClick={() => {
                    navigator.clipboard.writeText(viewRow.idNumber || viewRow.id);
                    toast({ title: "Copied", description: "Reference copied to clipboard." });
                  }}
                >
                  <Copy className="w-4 h-4" /> Copy ID / Reference
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
