'use client';

/**
 * Cookie consent banner — shown on a visitor's first session until they pick
 * "Essential Only" or "Accept All". The decision is persisted (localStorage +
 * first-party cookie) and can be reopened any time from the footer's
 * "Cookie Settings" link.
 */
import React, {useEffect, useState} from 'react';
import Link from 'next/link';
import {Cookie, Check} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {
  getConsent,
  setConsent,
  OPEN_CONSENT_EVENT,
  type ConsentValue,
} from '@/lib/cookie-consent';

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [hiding, setHiding] = useState(false);

  useEffect(() => {
    // Show the banner shortly after load when no decision has been made yet.
    const t = setTimeout(() => {
      if (!getConsent()) setVisible(true);
    }, 800);

    // The footer "Cookie Settings" control can reopen the banner at any time.
    const reopen = () => {
      setHiding(false);
      setVisible(true);
    };
    window.addEventListener(OPEN_CONSENT_EVENT, reopen);
    return () => {
      clearTimeout(t);
      window.removeEventListener(OPEN_CONSENT_EVENT, reopen);
    };
  }, []);

  const decide = (value: ConsentValue) => {
    setConsent(value);
    setHiding(true);
    setTimeout(() => setVisible(false), 250);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      className={`fixed inset-x-0 bottom-0 z-[100] p-4 pb-[max(1rem,env(safe-area-inset-bottom))] transition-all duration-300 ${
        hiding ? 'translate-y-6 opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
      }`}
    >
      <div className="mx-auto max-w-2xl overflow-hidden rounded-3xl border border-border/60 bg-card/95 shadow-2xl shadow-primary/10 backdrop-blur-xl">
        {/* Accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-primary via-accent to-primary" />
        <div className="p-5 md:p-7 space-y-5">
          <div className="flex items-start gap-4 text-left">
            <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0 ring-1 ring-primary/20">
              <Cookie className="w-6 h-6 text-primary" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-headline text-lg md:text-xl font-black tracking-tight">We value your privacy</h3>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                IsabiEvents uses essential cookies to keep you signed in, secure checkout and remember your
                preferences. With your permission we also use cookies to improve recommendations and measure
                campaign performance. Read our{' '}
                <Link href="/privacy" className="text-primary font-bold underline underline-offset-2 hover:no-underline">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </div>

          <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <li className="flex items-center gap-2 rounded-xl bg-secondary/40 px-3 py-2 font-medium">
              <Check className="w-3.5 h-3.5 text-primary" /> Essential
            </li>
            <li className="flex items-center gap-2 rounded-xl bg-secondary/40 px-3 py-2 font-medium text-muted-foreground">
              <Check className="w-3.5 h-3.5 text-muted-foreground/50" /> Analytics
            </li>
            <li className="flex items-center gap-2 rounded-xl bg-secondary/40 px-3 py-2 font-medium text-muted-foreground">
              <Check className="w-3.5 h-3.5 text-muted-foreground/50" /> Marketing
            </li>
          </ul>

          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
            <Button
              variant="ghost"
              className="rounded-full font-bold h-11 text-muted-foreground hover:text-foreground"
              onClick={() => decide('essential')}
            >
              Essential Only
            </Button>
            <Button
              className="rounded-full font-bold h-11 gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg shadow-primary/25"
              onClick={() => decide('all')}
            >
              <Check className="w-4 h-4" /> Accept All Cookies
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Footer link that reopens the consent banner (usable in server components). */
export function CookieSettingsButton() {
  return (
    <button
      type="button"
      onClick={() => {
        if (typeof window === 'undefined') return;
        window.dispatchEvent(new CustomEvent(OPEN_CONSENT_EVENT));
      }}
      className="text-foreground/70 hover:text-primary transition-colors no-underline text-left"
    >
      Cookie Settings
    </button>
  );
}
