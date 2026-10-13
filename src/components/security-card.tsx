'use client';

/**
 * Shared "Two-Factor Authentication" card for roles without a dedicated
 * security page (attendee, staff & vendor). Uses the same TOTP endpoints as
 * the organizer settings (/api/auth/totp) — Google Authenticator / Authy —
 * and the login flow at /login picks the enabled flag up automatically.
 */
import {useEffect, useState} from 'react';
import {ShieldCheck, Copy, Loader2} from 'lucide-react';
import {Card, CardContent, CardHeader, CardTitle, CardDescription} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Badge} from '@/components/ui/badge';
import {useToast} from '@/hooks/use-toast';
import {useAuth} from '@/components/auth-provider';
import {apiFetch} from '@/lib/api-fetch';

export function SecurityCard() {
  const {profile} = useAuth();
  const {toast} = useToast();
  const [twoFactor, setTwoFactor] = useState(false);
  const [totpSetup, setTotpSetup] = useState<{secret: string; uri: string} | null>(null);
  const [totpCode, setTotpCode] = useState('');
  const [totpBusy, setTotpBusy] = useState(false);

  // The profile (loaded from Firestore by the auth provider) carries the
  // stored twoFactor flag, so the badge is accurate right after sign-in.
  useEffect(() => {
    setTwoFactor(profile?.twoFactor === true);
  }, [profile]);

  if (!profile) return null;

  const handleSetup = async () => {
    setTotpBusy(true);
    try {
      const res = await apiFetch('/api/auth/totp', {method: 'POST', body: JSON.stringify({action: 'setup'})});
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.error) throw new Error(data?.error || 'Could not start setup.');
      setTotpSetup({secret: data.secret, uri: data.uri});
      setTotpCode('');
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Setup failed',
        description: err instanceof Error ? err.message : 'Please try again.',
      });
    }
    setTotpBusy(false);
  };

  const handleConfirm = async () => {
    setTotpBusy(true);
    try {
      const res = await apiFetch('/api/auth/totp', {
        method: 'POST',
        body: JSON.stringify({action: 'confirm', code: totpCode}),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.error) throw new Error(data?.error || 'Incorrect code.');
      setTwoFactor(true);
      setTotpSetup(null);
      setTotpCode('');
      toast({
        title: 'Two-factor enabled',
        description: 'You will need a code from your authenticator app at sign-in.',
      });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Not enabled',
        description: err instanceof Error ? err.message : 'Please try again.',
      });
    }
    setTotpBusy(false);
  };

  const handleDisable = async () => {
    setTotpBusy(true);
    try {
      const res = await apiFetch('/api/auth/totp', {method: 'POST', body: JSON.stringify({action: 'disable'})});
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.error) throw new Error(data?.error || 'Could not disable.');
      setTwoFactor(false);
      setTotpSetup(null);
      toast({title: 'Two-factor disabled'});
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Could not disable',
        description: err instanceof Error ? err.message : 'Please try again.',
      });
    }
    setTotpBusy(false);
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader className="text-left">
        <CardTitle className="flex items-center gap-2 text-lg">
          <ShieldCheck className="w-5 h-5 text-primary" /> Two-Factor Authentication
        </CardTitle>
        <CardDescription>
          Use Google Authenticator (or any authenticator app) for a 6-digit code at sign-in.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 text-left">
        <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl">
          <div className="space-y-0.5">
            <div className="font-bold">Authenticator App</div>
            <p className="text-xs text-muted-foreground">
              {twoFactor
                ? 'Codes are required every time you sign in.'
                : 'Add an extra layer of security to your account.'}
            </p>
          </div>
          <Badge
            className={
              twoFactor ? 'bg-green-500/15 text-green-500 border-none' : 'bg-secondary text-muted-foreground border-none'
            }
          >
            {twoFactor ? 'Enabled' : 'Off'}
          </Badge>
        </div>

        {!twoFactor && !totpSetup && (
          <Button variant="outline" className="rounded-full font-bold" onClick={handleSetup} disabled={totpBusy}>
            {totpBusy ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ShieldCheck className="w-4 h-4 mr-2" />}
            Set up authenticator app
          </Button>
        )}

        {totpSetup && (
          <div className="space-y-3 rounded-xl border border-border p-4">
            <p className="text-xs text-muted-foreground">
              Scan this QR code in Google Authenticator, or enter the setup key manually. Then enter the 6-digit code
              to confirm.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={'https://api.qrserver.com/v1/create-qr-code/?size=160x160&margin=0&data=' + encodeURIComponent(totpSetup.uri)}
                alt="Authenticator QR code"
                width={160}
                height={160}
                className="rounded-lg bg-white p-2"
              />
              <div className="space-y-2 text-xs flex-1 min-w-0">
                <div>
                  <Label className="text-muted-foreground">Setup key</Label>
                  <div className="font-mono break-all select-all">{totpSetup.secret}</div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full"
                  onClick={() => {
                    navigator.clipboard?.writeText(totpSetup.secret);
                    toast({title: 'Copied', description: 'Setup key copied.'});
                  }}
                >
                  <Copy className="w-4 h-4 mr-2" /> Copy key
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 items-end">
              <div className="space-y-1">
                <Label htmlFor="security-totp-code">6-digit code</Label>
                <Input
                  id="security-totp-code"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="123456"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                  className="w-40 font-mono"
                />
              </div>
              <Button
                className="rounded-full font-bold"
                onClick={handleConfirm}
                disabled={totpBusy || totpCode.length !== 6}
              >
                {totpBusy ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Confirm &amp; enable
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setTotpSetup(null);
                  setTotpCode('');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {twoFactor && (
          <Button
            variant="outline"
            className="rounded-full font-bold border-red-500/40 text-red-500 hover:bg-red-500/10"
            onClick={handleDisable}
            disabled={totpBusy}
          >
            {totpBusy ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Disable two-factor
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

