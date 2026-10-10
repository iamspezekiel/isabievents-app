/**
 * Admin Payout Requests — manually review organizer withdrawal requests.
 *  NGN = bank transfer · USD = crypto. Approve only after sending funds;
 *  the organizer is emailed the outcome automatically.
 */
"use client";

import React, { useState, useEffect } from 'react';
import {
  Banknote, Coins, Loader2, Landmark, Bitcoin, Clock,
  CheckCircle2, XCircle, Inbox, Filter
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from '@/lib/api-fetch';

interface WithdrawalRow {
  id: string;
  uid: string;
  organizerName: string;
  organizerEmail: string;
  amount: number;
  currency: 'NGN' | 'USD';
  method: 'bank' | 'crypto';
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  network?: string;
  walletAddress?: string;
  status: 'pending' | 'approved' | 'rejected';
  note?: string;
  createdAt: string;
  processedAt?: string;
}

const money = (amount: number, currency: string) =>
  currency === 'USD' ? `$${amount.toLocaleString()}` : `₦${amount.toLocaleString()}`;

const destination = (w: WithdrawalRow) =>
  w.method === 'bank'
    ? `${w.bankName} · ${w.accountNumber} (${w.accountName})`
    : `${w.network} · ${w.walletAddress}`;

function StatusBadge({status}: {status: string}) {
  if (status === 'approved') {
    return (
      <Badge className="bg-green-500/10 text-green-500 border-none gap-1 font-bold">
        <CheckCircle2 className="w-3 h-3" /> Approved
      </Badge>
    );
  }
  if (status === 'rejected') {
    return (
      <Badge className="bg-red-500/10 text-red-500 border-none gap-1 font-bold">
        <XCircle className="w-3 h-3" /> Declined
      </Badge>
    );
  }
  return (
    <Badge className="bg-yellow-500/10 text-yellow-600 border-none gap-1 font-bold">
      <Clock className="w-3 h-3" /> Pending
    </Badge>
  );
}

export default function AdminPayoutsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<WithdrawalRow[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const [rejectTarget, setRejectTarget] = useState<WithdrawalRow | null>(null);
  const [rejectNote, setRejectNote] = useState('');

  const load = () => {
    apiFetch('/api/withdrawals')
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d?.requests)) setRequests(d.requests as WithdrawalRow[]);
        if (d?.error) toast({variant: 'destructive', title: 'Could not load requests', description: d.error});
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const process = async (id: string, status: 'approved' | 'rejected', note?: string) => {
    setBusyId(id);
    try {
      const res = await apiFetch('/api/withdrawals', {
        method: 'PATCH',
        body: JSON.stringify({id, status, note}),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to update the request.');
      setRequests((prev) => prev.map((r) => (r.id === id ? {...r, status, note: note || r.note} : r)));
      toast({
        title: status === 'approved' ? 'Request Approved' : 'Request Declined',
        description: status === 'approved'
          ? 'Marked as approved — the organizer has been emailed. Remember to send the payout manually.'
          : 'The organizer has been emailed with the outcome.',
      });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: err instanceof Error ? err.message : 'Please try again.',
      });
    } finally {
      setBusyId(null);
      setRejectTarget(null);
      setRejectNote('');
    }
  };

  const visible = requests.filter((r) => {
    const matchesFilter = filter === 'all' || r.status === filter;
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      r.organizerName.toLowerCase().includes(q) ||
      r.organizerEmail.toLowerCase().includes(q) ||
      r.id.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  const pendingCount = requests.filter((r) => r.status === 'pending').length;

  return (
    <div className="p-4 pb-16 md:p-12 md:pb-16 space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 text-left">
        <div className="space-y-1">
          <h1 className="font-headline text-2xl md:text-4xl">Payout Requests</h1>
          <p className="text-muted-foreground">Manual withdrawal review — NGN bank transfers and USD crypto payouts.</p>
        </div>
        <div className="flex items-center gap-3">
          {pendingCount > 0 && (
            <Badge className="bg-yellow-500/10 text-yellow-600 border-none gap-1 font-bold py-2 px-4">
              <Clock className="w-4 h-4" /> {pendingCount} pending
            </Badge>
          )}
          <div className="relative w-full sm:w-64">
            <Input
              placeholder="Search organizer or ref…"
              className="pl-9 h-11 bg-card rounded-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          </div>
        </div>
      </header>

      <div className="flex flex-wrap gap-2">
        {(['pending', 'all', 'approved', 'rejected'] as const).map((f) => (
          <Button
            key={f}
            variant={filter === f ? 'default' : 'outline'}
            className="rounded-full px-5 h-10 font-bold capitalize"
            onClick={() => setFilter(f)}
          >
            {f} {f !== 'all' ? `(${requests.filter((r) => r.status === f).length})` : `(${requests.length})`}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : visible.length === 0 ? (
        <div className="py-20 text-center bg-card border border-dashed border-border rounded-[2rem]">
          <Inbox className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">No {filter !== 'all' ? filter : ''} withdrawal requests.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {visible.map((w) => (
            <Card key={w.id} className="bg-card border-border">
              <CardContent className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-left">
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-black text-xl break-all">{money(w.amount, w.currency)}</span>
                    <StatusBadge status={w.status} />
                    <span className="text-xs text-muted-foreground font-bold">Ref {w.id}</span>
                  </div>
                  <div className="font-bold text-sm break-words">{w.organizerName} · {w.organizerEmail}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1.5 break-words">
                    {w.method === 'bank' ? <Landmark className="w-3.5 h-3.5 shrink-0" /> : <Bitcoin className="w-3.5 h-3.5 shrink-0" />}
                    <span className="break-all">{destination(w)}</span>
                  </div>
                  <div className="text-xs text-muted-foreground/80">
                    Requested {new Date(w.createdAt).toLocaleString('en-NG', {dateStyle: 'medium', timeStyle: 'short'})}
                    {w.processedAt && ` · Processed ${new Date(w.processedAt).toLocaleString('en-NG', {dateStyle: 'medium'})}`}
                    {w.note && ` · Note: ${w.note}`}
                  </div>
                </div>

                {w.status === 'pending' && (
                  <div className="flex items-center gap-3 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-border w-full lg:w-auto">
                    <Button
                      className="flex-1 lg:flex-none rounded-full font-bold h-10 px-6 gap-2"
                      disabled={busyId === w.id}
                      onClick={() => process(w.id, 'approved')}
                    >
                      {busyId === w.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 lg:flex-none rounded-full font-bold h-10 px-6 gap-2 border-red-500/40 text-red-500 hover:bg-red-500/10"
                      disabled={busyId === w.id}
                      onClick={() => setRejectTarget(w)}
                    >
                      <XCircle className="w-4 h-4" /> Decline
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={!!rejectTarget} onOpenChange={(open) => !open && setRejectTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Decline this request?</AlertDialogTitle>
            <AlertDialogDescription>
              {rejectTarget && `${money(rejectTarget.amount, rejectTarget.currency)} to ${rejectTarget.organizerEmail}. `}
              The organizer will be emailed the outcome. An optional reason can be included below.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2 text-left">
            <Label htmlFor="reject-note">Reason (optional)</Label>
            <Textarea
              id="reject-note"
              placeholder="e.g. Account name does not match the organizer profile."
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              rows={3}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                if (rejectTarget) process(rejectTarget.id, 'rejected', rejectNote || undefined);
              }}
              className="bg-red-500 hover:bg-red-600 text-white border-none font-bold"
            >
              Decline Request
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
