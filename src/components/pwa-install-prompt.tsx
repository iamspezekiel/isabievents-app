
'use client';

import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

/**
 * PWAInstallPrompt handles the 'beforeinstallprompt' event and 
 * shows a custom UI to the user to install the application.
 */
export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Register service worker if supported
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => console.log('SW registered!', reg))
        .catch(err => console.error('Service worker registration failed:', err));
    }

    const handler = (e: any) => {
      // Prevent the default mini-infobar from appearing
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      
      // Check if user has already dismissed it this session
      const dismissed = sessionStorage.getItem('pwa_prompt_dismissed');
      if (!dismissed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Also check if app is already installed
    window.addEventListener('appinstalled', () => {
      console.log('PWA was installed');
      setDeferredPrompt(null);
      setShowPrompt(false);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the PWA install prompt');
    } else {
      console.log('User dismissed the PWA install prompt');
    }
    
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    sessionStorage.setItem('pwa_prompt_dismissed', 'true');
  };

  // Prevent hydration mismatch
  if (!mounted || !showPrompt) return null;

  return (
    <div className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-2rem)] max-w-sm animate-in fade-in slide-in-from-bottom-8 duration-700">
      <Card className="bg-primary text-primary-foreground border-none shadow-2xl overflow-hidden rounded-[2rem]">
        <CardContent className="p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <h4 className="font-bold text-sm leading-tight">Install IsabiEvents</h4>
              <p className="text-[10px] opacity-80 font-medium mt-0.5">Add to your home screen for fast access.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              className="rounded-full bg-white text-primary hover:bg-white/90 font-bold px-4 h-9 text-[11px] shadow-sm"
              onClick={handleInstall}
            >
              Install
            </Button>
            <Button 
              size="icon" 
              variant="ghost" 
              className="rounded-full h-8 w-8 hover:bg-white/10 text-white"
              onClick={handleDismiss}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
