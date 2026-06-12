"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Logo } from '@/components/logo';
import { Mail, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

export function Footer() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <footer className="bg-background border-t border-border pt-24 pb-12">
      <div className="container mx-auto px-4">
        {/* Newsletter Section */}
        <div className="max-w-6xl mx-auto bg-primary/5 border border-primary/10 rounded-[3rem] p-8 md:p-16 mb-20 flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="space-y-4 text-center lg:text-left">
            <h3 className="font-headline text-3xl md:text-4xl font-black tracking-tighter">Stay in the Loop</h3>
            <p className="text-muted-foreground text-lg font-medium">Get first access to Nigerian concerts, festivals, and tech summits.</p>
          </div>
          <div className="w-full lg:max-w-md flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input 
                placeholder="yourname@example.com" 
                className="h-14 pl-12 rounded-2xl bg-background border-border text-lg focus-visible:ring-primary shadow-xl"
              />
            </div>
            <Button className="h-14 px-8 rounded-2xl text-lg shadow-xl shadow-primary/20 font-bold">
              Subscribe
            </Button>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          <div className="col-span-1 md:col-span-1 space-y-6">
            <Link href="/" className="inline-block no-underline">
               <Logo size="sm" />
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs font-medium text-left">
              Connecting people to unforgettable experiences.
            </p>
            {/* Social Icons - Defer rendering to prevent hydration mismatch */}
            {mounted && (
              <div className="flex items-center gap-3">
                <Link href="#" className="p-2 rounded-lg bg-secondary hover:bg-primary hover:text-white transition-all group no-underline">
                  <Facebook className="w-4 h-4" />
                </Link>
                <Link href="#" className="p-2 rounded-lg bg-secondary hover:bg-primary hover:text-white transition-all group no-underline">
                  <Twitter className="w-4 h-4" />
                </Link>
                <Link href="#" className="p-2 rounded-lg bg-secondary hover:bg-primary hover:text-white transition-all group no-underline">
                  <Instagram className="w-4 h-4" />
                </Link>
                <Link href="#" className="p-2 rounded-lg bg-secondary hover:bg-primary hover:text-white transition-all group no-underline">
                  <Youtube className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
          <div className="text-left">
            <h4 className="font-headline text-xs font-black uppercase tracking-widest text-muted-foreground/50 mb-8">For Attendees</h4>
            <ul className="space-y-4 text-sm font-bold">
              <li><Link href="/discover" className="text-foreground/70 hover:text-primary transition-colors no-underline">Find Events</Link></li>
              <li><Link href="/mobile" className="text-foreground/70 hover:text-primary transition-colors no-underline">Get the App</Link></li>
              <li><Link href="/help/tickets" className="text-foreground/70 hover:text-primary transition-colors no-underline">Ticket Support</Link></li>
              <li><Link href="/testimonials" className="text-foreground/70 hover:text-primary transition-colors no-underline">User Testimonials</Link></li>
            </ul>
          </div>
          <div className="text-left">
            <h4 className="font-headline text-xs font-black uppercase tracking-widest text-muted-foreground/50 mb-8">For Organizers</h4>
            <ul className="space-y-4 text-sm font-bold">
              <li><Link href="/pricing" className="text-foreground/70 hover:text-primary transition-colors no-underline">Pricing</Link></li>
              <li><Link href="/organizer" className="text-foreground/70 hover:text-primary transition-colors no-underline">Host Event</Link></li>
              <li><Link href="/docs" className="text-foreground/70 hover:text-primary transition-colors no-underline">Developer API</Link></li>
              <li><Link href="/case-studies" className="text-foreground/70 hover:text-primary transition-colors no-underline">Success Stories</Link></li>
            </ul>
          </div>
          <div className="text-left">
            <h4 className="font-headline text-xs font-black uppercase tracking-widest text-muted-foreground/50 mb-8">Legal & Support</h4>
            <ul className="space-y-4 text-sm font-bold">
              <li><Link href="/help" className="text-foreground/70 hover:text-primary transition-colors no-underline">Help Center</Link></li>
              <li><Link href="/help/refunds" className="text-foreground/70 hover:text-primary transition-colors no-underline">Refund Policy</Link></li>
              <li><Link href="/privacy" className="text-foreground/70 hover:text-primary transition-colors no-underline">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-foreground/70 hover:text-primary transition-colors no-underline">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border pt-10 text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">
          <p>Copyright © 2026 · IsabiEvents Technology · All Right Reserved</p>
        </div>
      </div>
    </footer>
  );
}
