'use client';

/**
 * Footer newsletter subscribe — emails ADMIN_EMAIL and confirms to the
 * subscriber via /api/email/subscribe (no-op without SMTP config).
 */
import React, {useState} from 'react';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
import {Mail, Loader2, CheckCircle2} from 'lucide-react';
import {useToast} from '@/hooks/use-toast';

export function NewsletterForm() {
  const {toast} = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast({variant: 'destructive', title: 'Invalid email', description: 'Enter a valid email address.'});
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/email/subscribe', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email: email.trim()}),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Subscription failed.');
      setDone(true);
      setEmail('');
      toast({title: "You're subscribed!", description: 'Check your inbox — a confirmation is on the way.'});
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Subscription Failed',
        description: err instanceof Error ? err.message : 'Please try again.',
      });
    }
    setLoading(false);
  };

  if (done) {
    return (
      <div className="w-full lg:max-w-md flex items-center justify-center gap-3 h-11 text-sm font-bold text-primary">
        <CheckCircle2 className="w-5 h-5" />
        Thanks — you&apos;re on the list!
      </div>
    );
  }

  return (
    <form onSubmit={handleSubscribe} className="w-full lg:max-w-md flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="email"
          placeholder="yourname@example.com"
          className="h-11 pl-12 rounded-xl bg-background border-border text-sm focus-visible:ring-primary shadow-sm"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <Button type="submit" disabled={loading} className="h-9 md:h-11 px-8 rounded-xl text-xs md:text-sm shadow-lg shadow-primary/20 font-bold">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Subscribe'}
      </Button>
    </form>
  );
}
