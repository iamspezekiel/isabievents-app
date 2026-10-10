/**
 * Organizer Payouts — request a manual withdrawal of sales funds.
 *  NGN → bank transfer (all Nigerian banks)   |   USD → crypto wallet
 * Every request is reviewed manually by the admin (email notifications
 * go to both the admin and the organizer).
 */
"use client";

import React, { useState, useEffect } from 'react';
import {
  Wallet, Banknote, Coins, Loader2, Landmark, Bitcoin, Clock,
  CheckCircle2, XCircle, ArrowDownToLine, Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from '@/lib/api-fetch';

/** Every Nigerian bank is supported — full list for the picker. */
const BANKS = [
  'Access Bank', 'Citibank Nigeria', 'Ecobank Nigeria', 'Fidelity Bank',
  'First Bank of Nigeria', 'FCMB (First City Monument Bank)', 'Globus Bank',
  'Guaranty Trust Bank (GTB)', 'Heritage Bank', 'Jaiz Bank', 'Keystone Bank',
  'Kuda Bank', 'Moniepoint MFB', 'Opay (Paycom)', 'PalmPay', 'Polaris Bank',
  'Providus Bank', 'Premium Trust Bank', 'Stanbic IBTC Bank',
  'Standard Chartered Bank', 'Sterling Bank', 'Suntrust Bank',
  'Titan Trust Bank', 'Union Bank', 'Unity Bank', 'VFD Microfinance Bank',
  'Wema Bank', 'Zenith Bank', 'Other / Rural Microfinance Bank',
];

const CRYPTO_NETWORKS = [
  'USDT — TRC20 (Tron)',
  'USDT — ERC20 (Ethereum)',
  'USDT — BEP20 (BNB Chain)',
  'USDC — ERC20 (Ethereum)',
  'ETH — Ethereum',
  'BTC — Bitcoin',
  'SOL — Solana',
];

interface WithdrawalRow {
  id: string;
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

export default function OrganizerPayoutsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<WithdrawalRow[]>([]);
  const [balance, setBalance] = useState({ngn: 0, usd: 0});

  const [currency, setCurrency] = useState<'NGN' | 'USD'>('NGN');
  const [amount, setAmount] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [network, setNetwork] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    apiFetch('/api/withdrawals')
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d?.requests)) setRequests(d.requests as WithdrawalRow[]);
        if (d?.balance) setBalance(d.balance);
        if (d?.error) toast({variant: 'destructive', title: 'Could not load payouts', description: d.error});
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) {
      toast({variant: 'destructive', title: 'Invalid amount', description: 'Enter an amount greater than zero.'});
      return;
    }
    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {amount: amt, currency};
      if (currency === 'NGN') {
        payload.bankName = bankName;
        payload.accountNumber = accountNumber;
        payload.accountName = accountName;
      } else {
        payload.network = network;
        payload.walletAddress = walletAddress;
      }
      const res = await apiFetch('/api/withdrawals', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not submit the request.');

      toast({
        title: 'Withdrawal Request Submitted',
        description: `Your ${currency} request is with our team — you'll get an email when it's processed.`,
      });
      setAmount('');
      setBankName('');
      setAccountNumber('');
      setAccountName('');
      setNetwork('');
      setWalletAddress('');
      load();
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Request Failed',
        description: err instanceof Error ? err.message : 'Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const pendingCount = requests.filter((r) => r.status === 'pending').length;

  return (
    <div className="p-4 pb-16 md:p-12 md:pb-16 space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-left">
        <div className="space-y-1">
          <h1 className="font-headline text-2xl md:text-4xl">Payouts</h1>
          <p className="text-muted-foreground">Withdraw your sales funds — NGN by bank transfer, USD by crypto. Every request is reviewed manually by our team.</p>
        </div>
      </header>

      {pendingCount > 0 && (
        <div className="-mb-4">
          <Badge className="bg-primary/10 text-primary border-none gap-1 font-bold py-2 px-4">
            <Clock className="w-4 h-4" /> {pendingCount} pending request{pendingCount > 1 ? 's' : ''}
          </Badge>
        </div>
      )}

      {/* Balances */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
        <Card className="bg-card border-border">
          <CardContent className="p-6 flex items-center gap-4 text-left">
            <div className="p-3 bg-primary/10 rounded-2xl">
              <Banknote className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-black break-all">{loading ? '…' : `₦${balance.ngn.toLocaleString()}`}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Available (NGN)</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-6 flex items-center gap-4 text-left">
            <div className="p-3 bg-primary/10 rounded-2xl">
              <Coins className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-black break-all">{loading ? '…' : `$${balance.usd.toLocaleString()}`}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Available (USD)</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Request form */}
        <Card className="bg-card border-border">
          <CardHeader className="text-left">
            <CardTitle className="flex items-center gap-2 text-lg">
              <ArrowDownToLine className="w-5 h-5 text-primary" /> Request a Withdrawal
            </CardTitle>
            <CardDescription>NGN pays out to any Nigerian bank · USD pays out to a crypto wallet.</CardDescription>
          </CardHeader>
          <CardContent className="text-left">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant={currency === 'NGN' ? 'default' : 'outline'}
                  className="rounded-xl h-11 font-bold gap-2"
                  onClick={() => setCurrency('NGN')}
                >
                  <Banknote className="w-4 h-4" /> NGN · Bank
                </Button>
                <Button
                  type="button"
                  variant={currency === 'USD' ? 'default' : 'outline'}
                  className="rounded-xl h-11 font-bold gap-2"
                  onClick={() => setCurrency('USD')}
                >
                  <Coins className="w-4 h-4" /> USD · Crypto
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount ({currency})</Label>
                <Input
                  id="amount"
                  type="number"
                  min="1"
                  step={currency === 'USD' ? '0.01' : '1'}
                  inputMode="decimal"
                  placeholder={currency === 'USD' ? 'e.g. 250.00' : 'e.g. 150000'}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="h-11 bg-secondary/50"
                  required
                />
              </div>

              {currency === 'NGN' ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="bank">Bank</Label>
                    <Select value={bankName} onValueChange={setBankName}>
                      <SelectTrigger id="bank" className="h-11 bg-secondary/50">
                        <SelectValue placeholder="Select your bank" />
                      </SelectTrigger>
                      <SelectContent>
                        {BANKS.map((b) => (
                          <SelectItem key={b} value={b}>{b}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="acct">Account Number</Label>
                      <Input
                        id="acct"
                        inputMode="numeric"
                        maxLength={10}
                        placeholder="10 digits"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                        className="h-11 bg-secondary/50"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="acctname">Account Name</Label>
                      <Input
                        id="acctname"
                        placeholder="Name on account"
                        value={accountName}
                        onChange={(e) => setAccountName(e.target.value)}
                        className="h-11 bg-secondary/50"
                        required
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="network">Crypto Network / Asset</Label>
                    <Select value={network} onValueChange={setNetwork}>
                      <SelectTrigger id="network" className="h-11 bg-secondary/50">
                        <SelectValue placeholder="Select network" />
                      </SelectTrigger>
                      <SelectContent>
                        {CRYPTO_NETWORKS.map((n) => (
                          <SelectItem key={n} value={n}>{n}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="wallet">Wallet Address</Label>
                    <Input
                      id="wallet"
                      placeholder="Paste your wallet address"
                      value={walletAddress}
                      onChange={(e) => setWalletAddress(e.target.value.trim())}
                      className="h-11 bg-secondary/50 font-mono text-sm"
                      required
                    />
                  </div>
                </>
              )}

              <div className="flex items-start gap-2 text-xs text-muted-foreground bg-secondary/30 rounded-xl p-3">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Payouts are processed <strong className="text-foreground">manually</strong> by the IsabiEvents team.
                  You&apos;ll receive an email as soon as your request is approved or declined.
                </span>
              </div>

              <Button type="submit" className="w-full rounded-xl h-11 font-bold gap-2" disabled={submitting}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowDownToLine className="w-4 h-4" />}
                Submit Request
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* History */}
        <Card className="bg-card border-border">
          <CardHeader className="text-left">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Wallet className="w-5 h-5 text-primary" /> Withdrawal History
            </CardTitle>
            <CardDescription>Every request you&apos;ve made and its current status.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-left">
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : requests.length === 0 ? (
              <div className="py-10 text-center border border-dashed border-border rounded-2xl">
                <Wallet className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground font-medium">No withdrawal requests yet.</p>
                <p className="text-xs text-muted-foreground/70">Your requests will appear here.</p>
              </div>
            ) : (
              requests.map((w) => (
                <div key={w.id} className="border border-border rounded-2xl p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-black text-lg break-all">{money(w.amount, w.currency)}</div>
                    <StatusBadge status={w.status} />
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1 text-left break-words">
                    <div className="flex items-center gap-1.5">
                      {w.method === 'bank' ? <Landmark className="w-3.5 h-3.5 shrink-0" /> : <Bitcoin className="w-3.5 h-3.5 shrink-0" />}
                      <span className="break-all">{destination(w)}</span>
                    </div>
                    <div>{new Date(w.createdAt).toLocaleString('en-NG', {dateStyle: 'medium', timeStyle: 'short'})} · Ref {w.id}</div>
                    {w.status === 'rejected' && w.note && (
                      <div className="text-red-500 font-medium">Reason: {w.note}</div>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
