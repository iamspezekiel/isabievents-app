'use client';

/**
 * Ticket confirmation page.
 *
 * Reached after a Bachs checkout redirect (session_id) or a free checkout
 * (order_id). It polls POST /api/checkout/confirm — which verifies the payment
 * with the gateway and reconciles fulfilment idempotently — and ONLY renders
 * the congratulations/success UI once the server reports paid:true. Payment
 * states that are still settling show a "confirming" screen instead.
 */
import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle2, Loader2, CalendarDays, MapPin, ArrowRight, Home,
  Wallet, AlertTriangle, RefreshCcw, Ticket as TicketIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Confetti } from '@/components/confetti';
import { useEvents } from '@/hooks/use-events';
import { formatEventDateTime } from '@/lib/timezone';

interface ConfirmResult {
  paid: boolean;
  status?: string;
  orderId?: string;
  eventId?: string;
  eventTitle?: string;
  quantity?: number;
  tierName?: string;
  amount?: number;
  currency?: string;
  buyerName?: string;
  tickets?: string[];
  paidAt?: string;
  error?: string;
}

const POLL_INTERVAL = 4000;
const MAX_ATTEMPTS = 22; // ~90 seconds of settling time

type Phase = 'confirming' | 'confirmed' | 'pending' | 'failed';
const TERMINAL_FAILURES = ['failed', 'expired', 'cancelled', 'not_found'];

function SuccessInner() {
  const router = useRouter();
  const params = useSearchParams();
  const sessionId = params.get('session_id') || '';
  const orderId = params.get('order_id') || params.get('orderId') || '';
  const { events } = useEvents();

  const [phase, setPhase] = useState<Phase>('confirming');
  const [data, setData] = useState<ConfirmResult | null>(null);
  const [message, setMessage] = useState('');
  const [runId, setRunId] = useState(0);
  const attempts = useRef(0);

  const check = useCallback(async (): Promise<'paid' | 'pending' | 'failed'> => {
    try {
      const res = await fetch('/api/checkout/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionId ? { session_id: sessionId } : { order_id: orderId }),
      });
      const json = (await res.json().catch(() => ({}))) as ConfirmResult;

      if (res.ok && json.paid) {
        setData(json);
        return 'paid';
      }
      if (res.status === 503) {
        setMessage(json.error || 'Payments are temporarily unavailable.');
        return 'failed';
      }
      if (!res.ok && TERMINAL_FAILURES.includes(json.status || '')) {
        setMessage(json.error || `This payment was ${json.status}. You can try again from the event page.`);
        return 'failed';
      }
      // Everything else (open, unmatched, transient errors) keeps settling.
      if (json.eventTitle) setData(json);
      return 'pending';
    } catch {
      return 'pending';
    }
  }, [sessionId, orderId]);

  useEffect(() => {
    if (!sessionId && !orderId) {
      setMessage('Missing payment reference. Check your order history for your tickets.');
      setPhase('failed');
      return;
    }
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    attempts.current = 0;

    const run = async () => {
      const outcome = await check();
      if (cancelled) return;
      if (outcome === 'paid') return setPhase('confirmed');
      if (outcome === 'failed') return setPhase('failed');
      attempts.current += 1;
      if (attempts.current >= MAX_ATTEMPTS) return setPhase('pending');
      timer = setTimeout(run, POLL_INTERVAL);
    };
    run();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [check, sessionId, orderId, runId]);

  const event = data?.eventId
    ? events.find((e) => e.id === data.eventId || e.slug === data.eventId)
    : undefined;

  const recheck = () => {
    attempts.current = 0;
    setMessage('');
    setPhase('confirming');
    setRunId((n) => n + 1);
  };

  const money =
    data?.amount === undefined
      ? ''
      : data.currency === 'USD'
        ? `$${Number(data.amount).toFixed(2)}`
        : `₦${Number(data.amount).toLocaleString()}`;

  return (
    <div className="relative min-h-screen bg-background text-foreground flex items-center justify-center px-4 pt-32 pb-20 overflow-hidden">
      {phase === 'confirmed' && (
        <Confetti className="pointer-events-none absolute inset-0 h-full w-full" />
      )}

      <div className="relative w-full max-w-xl">
        {phase === 'confirming' && (
          <div className="text-center space-y-6 animate-in fade-in duration-500">
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" />
              <div className="relative w-24 h-24 rounded-full bg-primary/10 border-4 border-primary/20 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
              </div>
            </div>
            <h1 className="font-headline text-2xl md:text-3xl">Confirming your payment…</h1>
            <p className="text-muted-foreground max-w-sm mx-auto leading-relaxed">
              We&apos;re verifying your payment with the gateway and generating your tickets.
              This can take a few moments for bank transfers and crypto.
            </p>
          </div>
        )}

        {phase === 'pending' && (
          <div className="text-center space-y-6 animate-in fade-in duration-500">
            <div className="w-24 h-24 mx-auto rounded-full bg-yellow-500/10 border-4 border-yellow-500/20 flex items-center justify-center">
              <RefreshCcw className="w-10 h-10 text-yellow-500 animate-pulse" />
            </div>
            <h1 className="font-headline text-2xl md:text-3xl">Payment still settling</h1>
            <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
              Your payment hasn&apos;t been confirmed yet. If you completed payment, your tickets
              will appear in your wallet and be emailed to you as soon as it clears. No need to pay again.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
              <Button onClick={recheck} className="rounded-full h-11 font-bold gap-2">
                <RefreshCcw className="w-4 h-4" /> Check Again
              </Button>
              <Button variant="outline" onClick={() => router.push('/dashboard/attendee')} className="rounded-full h-11 font-bold">
                Go to Wallet
              </Button>
            </div>
          </div>
        )}

        {phase === 'failed' && (
          <div className="text-center space-y-6 animate-in fade-in duration-500">
            <div className="w-24 h-24 mx-auto rounded-full bg-red-500/10 border-4 border-red-500/20 flex items-center justify-center">
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
            <h1 className="font-headline text-2xl md:text-3xl">We couldn&apos;t confirm this payment</h1>
            <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
              {message || 'The payment was not completed. You can try again from the event page — you have not been charged for a failed payment.'}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
              <Button onClick={recheck} variant="outline" className="rounded-full h-11 font-bold gap-2">
                <RefreshCcw className="w-4 h-4" /> Try Again
              </Button>
              <Button onClick={() => router.push('/discover')} className="rounded-full h-11 font-bold">
                Browse Events
              </Button>
            </div>
          </div>
        )}

        {phase === 'confirmed' && (
          <div className="space-y-8 animate-in zoom-in-95 duration-500 text-center">
            <div className="space-y-5">
              <div className="relative w-28 h-28 mx-auto">
                <div className="absolute inset-0 rounded-full bg-green-500/15 animate-in zoom-in duration-700" />
                <div className="relative w-28 h-28 rounded-full bg-green-500/10 border-4 border-green-500/30 flex items-center justify-center">
                  <CheckCircle2 className="w-14 h-14 text-green-500" />
                </div>
              </div>
              <div className="space-y-2">
                <h1 className="font-headline text-3xl md:text-4xl">Congratulations! 🎉</h1>
                <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
                  Your payment is confirmed and your ticket{data?.quantity === 1 ? '' : 's'} {data?.quantity === 1 ? 'is' : 'are'} ready.
                  A copy has been emailed to you.
                </p>
              </div>
            </div>

            <Card className="border-border bg-card rounded-[2rem] shadow-2xl overflow-hidden text-left">
              <CardContent className="p-6 md:p-8 space-y-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Event</p>
                    <h2 className="font-headline text-xl leading-tight break-words">{event?.title || data?.eventTitle}</h2>
                  </div>
                  <Badge className="bg-green-500/10 text-green-600 border-none gap-1 font-bold shrink-0">
                    <CheckCircle2 className="w-3 h-3" /> Confirmed
                  </Badge>
                </div>

                <div className="space-y-2 text-sm">
                  {event?.date && (
                    <p className="text-muted-foreground flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-primary shrink-0" />
                      {formatEventDateTime(event.date, { dateStyle: 'medium', timeStyle: 'short' })}
                      {event.endDate && String(event.endDate).slice(0, 10) !== String(event.date).slice(0, 10)
                        ? ` — ${formatEventDateTime(event.endDate, { dateStyle: 'medium' })}`
                        : ''}
                    </p>
                  )}
                  {event?.venue && (
                    <p className="text-muted-foreground flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-accent shrink-0" />
                      {event.venue}{event.city ? `, ${event.city}` : ''}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-border/60 pt-5 text-sm">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Ticket Type</p>
                    <p className="font-bold">{data?.tierName || 'General Admission'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Quantity</p>
                    <p className="font-bold">{data?.quantity || 1}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Amount Paid</p>
                    <p className="font-bold">{money || 'Free'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Order Ref</p>
                    <p className="font-mono text-xs font-bold break-all">{data?.orderId}</p>
                  </div>
                </div>

                {Array.isArray(data?.tickets) && data.tickets.length > 0 && (
                  <div className="border-t border-border/60 pt-5 space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                      <TicketIcon className="w-3.5 h-3.5 text-primary" /> Your Ticket Codes
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {data.tickets.map((code) => (
                        <Badge key={code} variant="secondary" className="font-mono text-[10px] font-bold">{code}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Button onClick={() => router.push('/dashboard/attendee')} className="rounded-full px-8 h-11 font-bold gap-2 shadow-lg shadow-primary/20">
                <Wallet className="w-4 h-4" /> Access My Tickets
              </Button>
              <Link href="/dashboard/attendee/history" className="no-underline">
                <Button variant="outline" className="rounded-full px-8 h-11 font-bold w-full gap-2 border-2">
                  Order History <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/" className="no-underline">
                <Button variant="ghost" className="rounded-full px-6 h-11 font-bold w-full gap-2">
                  <Home className="w-4 h-4" /> Home
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen grid place-items-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <SuccessInner />
    </Suspense>
  );
}
