'use client';

/**
 * Shared "My Profile" card for roles without a dedicated settings page
 * (staff & vendor). Everyone can update their name and WhatsApp number —
 * only the email address is locked because it is the sign-in identity.
 *
 * Saves go through /api/account/profile (Admin SDK) so they always land,
 * even when the profile doc is missing or client Firestore rules are strict.
 * Also hosts the Email Notifications / Marketing Updates toggles.
 */
import {useEffect, useState} from 'react';
import {User, Save, Mail, Bell} from 'lucide-react';
import {Card, CardContent, CardHeader, CardTitle, CardDescription} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Switch} from '@/components/ui/switch';
import {useToast} from '@/hooks/use-toast';
import {useAuth} from '@/components/auth-provider';
import {apiFetch} from '@/lib/api-fetch';

export function ProfileCard() {
  const {profile} = useAuth();
  const {toast} = useToast();
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [marketingNotifs, setMarketingNotifs] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setWhatsapp(profile.whatsapp || '');
      const n = profile.notifications;
      if (n) {
        setEmailNotifs(n.email ?? true);
        setMarketingNotifs(n.marketing ?? false);
      }
    }
  }, [profile]);

  if (!profile) return null;

  const save = async (patch: {name?: string; whatsapp?: string; notifications?: {email?: boolean; marketing?: boolean}} = {}) => {
    if (patch.name !== undefined && !patch.name.trim()) {
      toast({variant: 'destructive', title: 'Name required', description: 'Enter your full name.'});
      return;
    }
    setSaving(true);
    try {
      const res = await apiFetch('/api/account/profile', {
        method: 'POST',
        body: JSON.stringify(patch),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.error) throw new Error(data?.error || 'Could not save your changes.');
      toast({title: 'Profile Saved', description: 'Your information has been updated.'});
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: err instanceof Error ? err.message : 'Please try again.',
      });
    }
    setSaving(false);
  };

  const toggleNotif = (key: 'email' | 'marketing', value: boolean) => {
    const next = {email: emailNotifs, marketing: marketingNotifs, [key]: value};
    if (key === 'email') setEmailNotifs(value);
    else setMarketingNotifs(value);
    void save({notifications: next});
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="text-left">
        <CardTitle className="flex items-center gap-2 text-lg">
          <User className="w-5 h-5 text-primary" /> Profile Information
        </CardTitle>
        <CardDescription>
          Keep your details up to date. Your email stays the same — it is used to sign in.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-left">
        <div className="space-y-2">
          <Label htmlFor="profile-name">Full Name</Label>
          <Input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} className="h-11" placeholder="Your full name" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="profile-email">Email (read-only)</Label>
          <Input id="profile-email" value={profile.email} readOnly className="h-11 bg-secondary/50 cursor-not-allowed" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="profile-whatsapp">WhatsApp Number</Label>
          <Input id="profile-whatsapp" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="+234..." className="h-11" />
        </div>
        <Button onClick={() => save({name, whatsapp})} disabled={saving} className="rounded-full font-bold gap-2">
          <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save Changes'}
        </Button>

        <div className="pt-4 mt-4 border-t border-border space-y-4">
          <div className="flex items-center gap-2 font-bold text-sm">
            <Bell className="w-4 h-4 text-primary" /> Notifications
          </div>
          <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl">
            <div className="space-y-0.5">
              <div className="font-bold flex items-center gap-1.5 text-sm">
                <Mail className="w-3.5 h-3.5 text-primary" /> Email Notifications
              </div>
              <p className="text-xs text-muted-foreground">Receive reminders for your upcoming events.</p>
            </div>
            <Switch checked={emailNotifs} onCheckedChange={(v) => toggleNotif('email', v)} />
          </div>
          <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl">
            <div className="space-y-0.5">
              <div className="font-bold text-sm">Marketing Updates</div>
              <p className="text-xs text-muted-foreground">Get notified about flash sales and trending events.</p>
            </div>
            <Switch checked={marketingNotifs} onCheckedChange={(v) => toggleNotif('marketing', v)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
