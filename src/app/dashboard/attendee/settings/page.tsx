
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, ShieldCheck, MapPin, Loader2, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CITIES } from '@/lib/mock-data';
import { useToast } from "@/hooks/use-toast";

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    className={className} 
    fill="currentColor" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.397-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

export default function AttendeeSettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [whatsapp, setWhatsapp] = useState("+2349024244140");
  const [location, setLocation] = useState("Lagos");
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [marketingNotifs, setMarketingNotifs] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 1200));
    setIsSaving(false);
    toast({
      title: "Settings Saved",
      description: "Your profile information has been updated successfully.",
    });
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    // Simulate a secure deletion process
    await new Promise(r => setTimeout(r, 2500));
    
    toast({
      variant: "destructive",
      title: "Account Deleted",
      description: "Your account has been deactivated. Redirecting to login...",
    });

    // Mock logout logic
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isabi_logged_in');
      localStorage.removeItem('isabi_user_role');
    }

    setTimeout(() => {
      setIsDeleting(false);
      router.push('/login');
    }, 1000);
  };

  return (
    <div className="p-4 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-left">
          <h1 className="font-headline mb-2 text-3xl md:text-5xl">Account Settings</h1>
          <p className="text-muted-foreground">Manage your identity, security, and preferences.</p>
        </div>

        <div className="grid gap-8">
          <Card className="border-border bg-card">
            <CardHeader className="text-left">
              <CardTitle className="flex items-center gap-2 text-lg"><User className="w-5 h-5 text-primary" /> Profile Information</CardTitle>
              <CardDescription>Your account details used for ticket issuance.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 text-left">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullname">Full Name</Label>
                  <Input id="fullname" defaultValue="Sylvanus P. Ezekiel" className="h-11 bg-secondary/50 cursor-not-allowed" readOnly />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" defaultValue="attendee@isabievents.ng" className="h-11 bg-secondary/50 cursor-not-allowed" readOnly />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp" className="flex items-center gap-1.5">
                    <WhatsAppIcon className="w-3.5 h-3.5 text-green-500" /> WhatsApp Number
                  </Label>
                  <Input 
                    id="whatsapp" 
                    value={whatsapp} 
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="h-11" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location" className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-primary" /> Location
                  </Label>
                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select your city" />
                    </SelectTrigger>
                    <SelectContent>
                      {CITIES.map(city => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleSave} disabled={isSaving} className="rounded-full px-8 font-bold gap-2">
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Changes
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="text-left">
              <CardTitle className="flex items-center gap-2 text-lg"><ShieldCheck className="w-5 h-5 text-primary" /> Privacy & Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-left">
              <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl">
                <div className="space-y-0.5">
                  <div className="font-bold">Email Notifications</div>
                  <p className="text-xs text-muted-foreground">Receive reminders for your upcoming events.</p>
                </div>
                <Switch checked={emailNotifs} onCheckedChange={setEmailNotifs} />
              </div>
              <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl">
                <div className="space-y-0.5">
                  <div className="font-bold">Marketing Updates</div>
                  <p className="text-xs text-muted-foreground">Get notified about flash sales and trending events.</p>
                </div>
                <Switch checked={marketingNotifs} onCheckedChange={setMarketingNotifs} />
              </div>
              
              <div className="pt-4">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="rounded-full w-full sm:w-auto text-red-500 hover:text-red-600 border-red-200">
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-card border-border sm:rounded-[2rem] p-8 max-w-md w-[94vw] sm:w-full">
                    <AlertDialogHeader className="text-left">
                      <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
                        <AlertTriangle className="w-6 h-6 text-red-500" />
                      </div>
                      <AlertDialogTitle className="font-headline text-2xl">Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription className="text-muted-foreground leading-relaxed">
                        This action cannot be undone. This will permanently delete your account
                        and remove your ticket data from our servers. You will lose access to all active tickets.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-row gap-3 pt-6">
                      <AlertDialogCancel className="flex-1 rounded-full font-bold h-11 border-2">Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={(e) => {
                          e.preventDefault();
                          handleDeleteAccount();
                        }}
                        disabled={isDeleting}
                        className="flex-1 rounded-full font-bold h-11 bg-red-500 hover:bg-red-600 text-white border-none"
                      >
                        {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete Account"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
