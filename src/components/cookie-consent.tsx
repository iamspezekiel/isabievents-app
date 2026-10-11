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
      className={`fixed inset-x-0 bottom-0 z-[100] p-4 pb-[max(1rem,env(safe-area-inset-bottom))] transition-all duration-250 ${
        hiding ? 'translate-y-4 opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
      }`}
    >
      <div className="mx-auto max-w-3xl bg-card border border-border rounded-2xl shadow-2xl shadow-black/10 p-5 md:p-6 space-y-4">
        <div className="flex items-start gap-3 text-left">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
            <Cookie className="w-5 h-5 text-primary" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-sm md:text-base">We value your privacy</h3>
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
              IsabiEvents uses essential cookies to keep you signed in, secure checkout and remember your
              preferences. With your permission we may also use cookies to improve recommendations and
              measure campaign performance. Read our{' '}
              <Link href="/privacy" className="text-primary font-bold underline">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
          <Button
            variant="outline"
            className="rounded-full font-bold h-10"
            onClick={() => decide('essential')}
          >
            Essential Only
          </Button>
          <Button
            className="rounded-full font-bold h-10 gap-2"
            onClick={() => decide('all')}
          >
            <Check className="w-4 h-4" /> Accept All Cookies
          </Button>
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
