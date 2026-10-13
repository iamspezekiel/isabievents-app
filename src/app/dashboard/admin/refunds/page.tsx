'use client';

/**
 * Admin → Refunds: the review queue for attendee ticket cancellations.
 *
 *  - requested  → approve (ticket becomes 'refunded' & order annotated)
 *                 or decline (ticket restored to 'active')
 *  - approved   → mark completed once the money has been returned
 * Orders and payment records are never deleted — this page only manages the
 * refund workflow on top of them.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { RotateCcw, CheckCircle2, XCircle, Clock, Loader2, RefreshCw, Search, Banknote } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { apiFetch } from '@/lib/api-fetch';
import { formatStamp } from '@/lib/timezone';

interface RefundRow {
  id: string;
  ticketId?: string;
  orderId?: string;
  eventId?: string;
  eventTitle?: string;
  tierName?: string;
  holderName?: string;
  buyerEmail?: string;
  amount?: number;
  currency?: string;
  status?: string;
  deadline?: string;
  requestedAt?: string;
  requestedNote?: string;
  decidedAt?: string;
  note?: string;
  completedAt?: string;
}

const STATUS_STYLES: Record<string, string> = {
  requested: 'bg-yellow-500/10 text-yellow-500',
  approved: 'bg-blue-500/10 text-blue-500',
  completed: 'bg-green-500/10 text-green-500',
  declined: 'bg-red-500/10 text-red-500',
};

const money = (amount: number | undefined, currency?: string) =>
  currency === 'USD' ? `$${Number(amount || 0).toFixed(2)}` : `₦${Number(amount || 0).toLocaleString()}`;

export default function AdminRefundsPage() {
  const { toast } = useToast();
  const [refunds, setRefunds] = useState<RefundRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');

  // Decision dialog state.
  const [deciding, setDeciding] = useState<{refund: RefundRow; action: 'approve' | 'decline' | 'complete'} | null>(null);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(false);
    apiFetch('/api/refunds?scope=admin')
      .then((r) => r.json())
      .then((d) => {
        if (d && Array.isArray(d.refunds)) {
          setRefunds(d.refunds as RefundRow[]);
          setLoading(false);
        } else if (d?.error) {
          throw new Error(d.error);
        }
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  useEffect(() => { load(); }, [load]);

  const openDecision = (refund: RefundRow, action: 'approve' | 'decline' | 'complete') => {
    setDeciding({refund, action});
    setNote('');
  };

  const submitDecision = async () => {
    if (!deciding) return;
    setBusy(true);
    try {
      const res = await apiFetch('/api/refunds', {
        method: 'PATCH',
        body: JSON.stringify({id: deciding.refund.id, action: deciding.action, note}),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.error) throw new Error(data?.error || 'Could not update the refund.');
      toast({
        title:
          deciding.action === 'approve'
            ? 'Refund Approved'
            : deciding.action === 'decline'
              ? 'Refund Declined'
              : 'Refund Completed',
        description: `${deciding.refund.eventTitle} — ${money(deciding.refund.amount, deciding.refund.currency)}.`,
      });
      setDeciding(null);
      setNote('');
      load();
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Action Failed',
        description: err instanceof Error ? err.message : 'Please try again.',
      });
    }
    setBusy(false);
  };

  const q = search.trim().toLowerCase();
  const filtered = refunds.filter(
    (r) =>
      !q ||
      (r.eventTitle || '').toLowerCase().includes(q) ||
      (r.buyerEmail || '').toLowerCase().includes(q) ||
      (r.id || '').toLowerCase().includes(q)
  );
  const byStatus = (status: string) => filtered.filter((r) => (r.status || 'requested') === status);
  const pending = byStatus('requested');
  const refundedTotal = refunds
    .filter((r) => r.status === 'approved' || r.status === 'completed')
    .reduce((sum, r) => sum + (r.currency === 'USD' ? 0 : Number(r.amount) || 0), 0);

  const renderRows = (tab: string) => {
    if (loading) {
      return (
        <div className="py-24 text-center">
          <Loader2 className="w-7 h-7 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground mt-3 text-sm">Loading refunds…</p>
        </div>
      );
    }
    if (error) {
      return (
        <div className="py-24 text-center">
          <p className="text-muted-foreground mb-4">Could not load refund requests.</p>
          <Button variant="outline" className="rounded-full gap-2 font-bold" onClick={load}>
            <RefreshCw className="w-4 h-4" /> Try Again
          </Button>
        </div>
      );
    }
    const rows = tab === 'all' ? filtered : byStatus(tab);
    if (rows.length === 0) {
      return (
        <div className="py-20 text-center bg-card/20 rounded-[2rem] border border-dashed border-border/50">
          <RotateCcw className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">No {tab === 'all' ? '' : `${tab} `}refund requests.</p>
        </div>
      );
    }
    return (
      <div className="space-y-4">
        {rows.map((r) => (
          <Card key={r.id} className="border-border bg-card">
            <CardContent className="p-5 md:p-6 space-y-4 text-left">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold">{r.eventTitle || r.eventId}</h3>
                    <Badge className={`border-none ${STATUS_STYLES[r.status || 'requested'] || ''}`}>
                      {(r.status || 'requested').toUpperCase()}
                    </Badge>
                    {r.tierName && <Badge variant="outline" className="text-[10px]">{r.tierName}</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {r.holderName || '—'} · <span className="font-mono text-xs">{r.buyerEmail}</span>
                  </p>
                </div>
                <div className="md:text-right space-y-1">
                  <p className="text-xl font-black text-primary">{money(r.amount, r.currency)}</p>
                  <p className="text-[11px] text-muted-foreground font-mono">Refund {r.id}</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1 text-[11px] text-muted-foreground">
                <span>Requested: <strong className="text-foreground">{formatStamp(r.requestedAt)}</strong></span>
                <span>
                  Cancellation window closed:{' '}
                  <strong className="text-foreground">{formatStamp(r.deadline)}</strong>
                </span>
                {r.requestedNote && (
                  <span className="sm:col-span-2">
                    Attendee note: <em className="text-foreground">{r.requestedNote}</em>
                  </span>
                )}
                {r.decidedAt && (
                  <span>Decided: <strong className="text-foreground">{formatStamp(r.decidedAt)}</strong></span>
                )}
                {r.completedAt && (
                  <span>Completed: <strong className="text-foreground">{formatStamp(r.completedAt)}</strong></span>
                )}
                {r.note && (
                  <span className="sm:col-span-2">
                    Admin note: <em className="text-foreground">{r.note}</em>
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2 justify-end border-t border-border pt-4">
                {r.status === 'requested' && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full font-bold border-red-500/40 text-red-500 hover:bg-red-500/10 gap-1.5"
                      onClick={() => openDecision(r, 'decline')}
                    >
                      <XCircle className="w-4 h-4" /> Decline
                    </Button>
                    <Button size="sm" className="rounded-full font-bold gap-1.5" onClick={() => openDecision(r, 'approve')}>
                      <CheckCircle2 className="w-4 h-4" /> Approve Refund
                    </Button>
                  </>
                )}
                {r.status === 'approved' && (
                  <Button size="sm" className="rounded-full font-bold gap-1.5" onClick={() => openDecision(r, 'complete')}>
                    <CheckCircle2 className="w-4 h-4" /> Mark as Paid
                  </Button>
                )}
                {(r.status === 'completed' || r.status === 'declined') && (
                  <span className="text-[11px] text-muted-foreground font-medium">
                    {r.status === 'completed'
                      ? 'Refund returned to the buyer — transaction closed.'
                      : 'Declined — the ticket was restored and remains valid for entry.'}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="p-4 pb-16 md:p-12 md:pb-16 space-y-8 text-left">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-headline text-2xl md:text-4xl tracking-tighter">Refund Requests</h1>
          <p className="text-muted-foreground font-medium">
            Review attendee cancellations, track refund status and keep the full transaction record.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search event, buyer or ID…"
              className="pl-9 h-10 w-56 rounded-xl bg-card border-border"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon" className="rounded-full h-10 w-10" onClick={load} title="Refresh">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="border-border bg-card">
          <CardContent className="p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-black">{pending.length}</p>
              <p className="text-[10px] uppercase font-bold text-muted-foreground">Awaiting review</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
              <Banknote className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-black">₦{refundedTotal.toLocaleString()}</p>
              <p className="text-[10px] uppercase font-bold text-muted-foreground">Approved (NGN)</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card col-span-2 md:col-span-1">
          <CardContent className="p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <RotateCcw className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-black">{refunds.length}</p>
              <p className="text-[10px] uppercase font-bold text-muted-foreground">Total records</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="requested" className="w-full">
        <TabsList className="bg-secondary/50 p-1 rounded-2xl w-full sm:w-auto flex sm:inline-flex flex-wrap">
          <TabsTrigger value="requested" className="rounded-xl px-5 font-bold flex-1 sm:flex-none">
            Pending ({byStatus('requested').length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="rounded-xl px-5 font-bold flex-1 sm:flex-none">
            Approved ({byStatus('approved').length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="rounded-xl px-5 font-bold flex-1 sm:flex-none">
            Completed ({byStatus('completed').length})
          </TabsTrigger>
          <TabsTrigger value="declined" className="rounded-xl px-5 font-bold flex-1 sm:flex-none">
            Declined ({byStatus('declined').length})
          </TabsTrigger>
          <TabsTrigger value="all" className="rounded-xl px-5 font-bold flex-1 sm:flex-none">
            All
          </TabsTrigger>
        </TabsList>

        {['requested', 'approved', 'completed', 'declined', 'all'].map((tab) => (
          <TabsContent key={tab} value={tab} className="pt-6">
            {renderRows(tab)}
          </TabsContent>
        ))}
      </Tabs>

      {/* Decision dialog with admin note */}
      <Dialog
        open={!!deciding}
        onOpenChange={(open) => {
          if (!open) {
            setDeciding(null);
            setNote('');
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-left">
            <DialogTitle className="font-headline">
              {deciding?.action === 'approve'
                ? 'Approve this refund?'
                : deciding?.action === 'decline'
                  ? 'Decline this request?'
                  : 'Mark refund as paid?'}
            </DialogTitle>
            <DialogDescription className="text-left">
              {deciding && (
                <>
                  {deciding.refund.eventTitle} — {money(deciding.refund.amount, deciding.refund.currency)} for{' '}
                  {deciding.refund.buyerEmail}.
                  {deciding.action === 'approve' &&
                    ' The ticket becomes invalid for entry immediately and the order is annotated (payment history is kept).'}
                  {deciding.action === 'decline' && ' The ticket is restored to active and stays valid for entry.'}
                  {deciding.action === 'complete' && ' Confirms the money has been returned to the buyer.'}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 text-left">
            <Label htmlFor="refund-note">
              Note {deciding?.action === 'decline' ? '(reason — shared with the attendee)' : '(optional)'}
            </Label>
            <Textarea
              id="refund-note"
              placeholder={
                deciding?.action === 'decline'
                  ? 'Why is this request being declined?'
                  : 'Internal note for the transaction record'
              }
              className="min-h-[80px]"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={500}
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setDeciding(null);
                setNote('');
              }}
            >
              Cancel
            </Button>
            <Button
              className={deciding?.action === 'decline' ? 'bg-red-500 hover:bg-red-600 text-white' : ''}
              onClick={submitDecision}
              disabled={busy || (deciding?.action === 'decline' && !note.trim())}
            >
              {busy && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {deciding?.action === 'approve'
                ? 'Approve Refund'
                : deciding?.action === 'decline'
                  ? 'Decline Request'
                  : 'Mark as Paid'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
