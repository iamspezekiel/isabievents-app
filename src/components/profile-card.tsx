'use client';

/**
 * Shared "My Profile" card for roles without a dedicated settings page
 * (staff & vendor). Everyone can update their name and WhatsApp number —
 * only the email address is locked because it is the sign-in identity.
 */
import {useEffect, useState} from 'react';
import {User, Save} from 'lucide-react';
import {Card, CardContent, CardHeader, CardTitle, CardDescription} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {useToast} from '@/hooks/use-toast';
import {useAuth} from '@/components/auth-provider';
import {doc, updateDoc} from 'firebase/firestore';
import {db} from '@/lib/firebase';

export function ProfileCard() {
  const {profile} = useAuth();
  const {toast} = useToast();
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setWhatsapp(profile.whatsapp || '');
    }
  }, [profile]);

  if (!profile) return null;

  const save = async () => {
    if (!name.trim()) {
      toast({variant: 'destructive', title: 'Name required', description: 'Enter your full name.'});
      return;
    }
    if (!db) {
      toast({variant: 'destructive', title: 'Not Available', description: 'Firestore is not configured.'});
      return;
    }
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', profile.uid), {
        name: name.trim(),
        whatsapp: whatsapp.trim(),
      });
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

  return (
    <Card className="bg-card border-border">
      <CardHeader className="text-left">
        <CardTitle className="flex items-center gap-2 text-lg">
          <User className="w-5 h-5 text-primary" /> My Profile
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
        <Button onClick={save} disabled={saving} className="rounded-full font-bold gap-2">
          <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save Changes'}
        </Button>
      </CardContent>
    </Card>
  );
}
