
"use client";

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  FileText, 
  Clock, 
  Eye, 
  Loader2 
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const INITIAL_PENDING_KYC = [
  { id: 'KYC-8821', name: 'Startup Kano Hub', type: 'Company', date: '2024-10-24T14:20:00', document: 'CAC_RC_772.pdf' },
  { id: 'KYC-9012', name: 'Funmi Olabisi', type: 'Individual', date: '2024-10-24T16:45:00', document: 'NIN_VERIFY.jpg' },
  { id: 'KYC-9930', name: 'Gidi Vibes Ent.', type: 'Company', date: '2024-10-23T09:10:00', document: 'LIRS_TAX_CER.pdf' },
];

export default function AdminKYCManagement() {
  const [kycRequests, setKycRequests] = useState(INITIAL_PENDING_KYC);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleAction = async (id: string, name: string, action: 'approve' | 'reject') => {
    setProcessingId(id);
    // Simulate network delay
    await new Promise(r => setTimeout(r, 1200));
    
    setKycRequests(prev => prev.filter(req => req.id !== id));
    setProcessingId(null);

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
  };

  return (
    <div className="p-4 md:p-12 space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="text-left space-y-1">
          <h1 className="font-headline text-3xl md:text-5xl">Organizer Verification</h1>
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
                    <Button variant="ghost" size="icon" className="rounded-full" title="View Document"><Eye className="w-4 h-4" /></Button>
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
      </div>
    </div>
  );
}
