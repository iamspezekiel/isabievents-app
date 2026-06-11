
"use client";

import React from 'react';
import Link from 'next/link';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Logo } from '@/components/logo';

export function Footer() {
  return (
    <footer className="bg-background border-t border-border pt-20 pb-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
             <Link href="/" className="mb-6 block">
               <Logo />
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              The most secure and reliable event ticket marketplace in Nigeria. Connecting people to unforgettable experiences.
            </p>
          </div>
          <div>
            <h4 className="font-headline text-sm uppercase tracking-widest mb-6">For Attendees</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li><Link href="/discover" className="hover:text-primary transition-colors">Find Events</Link></li>
              <li><Link href="/help/tickets" className="hover:text-primary transition-colors">Ticket Support</Link></li>
              <li><Link href="/help/refunds" className="hover:text-primary transition-colors">Refund Policy</Link></li>
              <li><Link href="/mobile" className="hover:text-primary transition-colors">Get the App</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-headline text-sm uppercase tracking-widest mb-6">For Organizers</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li><Link href="/organizer" className="hover:text-primary transition-colors">Host an Event</Link></li>
              <li><Link href="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
              <li><Link href="/docs" className="hover:text-primary transition-colors">Developer API</Link></li>
              <li><Link href="/case-studies" className="hover:text-primary transition-colors">Success Stories</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-headline text-sm uppercase tracking-widest mb-6">Stay Updated</h4>
            <p className="text-sm text-muted-foreground mb-4">Get curated event alerts delivered to your inbox.</p>
            <div className="flex gap-2">
              <Input placeholder="Email address" className="bg-secondary border-none" />
              <Button size="sm">Join</Button>
            </div>
          </div>
        </div>
        <div className="border-t border-border pt-10 text-center text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} IsabiEvents Technologies. All rights reserved. Made in Nigeria.</p>
        </div>
      </div>
    </footer>
  );
}
