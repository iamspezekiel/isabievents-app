import React from 'react';
import Link from 'next/link';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Logo } from '@/components/logo';
import { Mail, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-background border-t border-border pt-12 pb-8">
      <div className="container mx-auto px-4">
        {/* Newsletter Section */}
        <div className="max-w-6xl mx-auto bg-primary/5 border border-primary/10 rounded-[2rem] p-6 md:p-8 mb-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-2 text-center lg:text-left">
            <h3 className="font-headline text-xl md:text-2xl font-black tracking-tighter">
              Stay in the <span className="text-primary">Loop</span>
            </h3>
            <p className="text-muted-foreground font-medium">Get first access to Nigerian concerts, festivals, and tech summits.</p>
          </div>
          <div className="w-full lg:max-w-md flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="yourname@example.com" 
                className="h-11 pl-12 rounded-xl bg-background border-border text-sm focus-visible:ring-primary shadow-sm"
              />
            </div>
            <Button className="h-9 md:h-11 px-8 rounded-xl text-xs md:text-sm shadow-lg shadow-primary/20 font-bold">
              Subscribe
            </Button>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div className="col-span-1 md:col-span-1 space-y-4">
            <Link href="/" className="inline-block no-underline">
               <Logo size="sm" />
            </Link>
            <p className="text-muted-foreground leading-relaxed max-w-[180px] md:max-w-xs font-medium text-left text-[10px] text-balance">
              Connecting people to unforgettable experiences across Nigeria.
            </p>
            {/* Social Icons */}
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
          </div>
          <div className="text-left">
            <h4 className="font-headline text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 mb-4">For Attendees</h4>
            <ul className="space-y-2 text-xs font-bold">
              <li><Link href="/discover" className="text-foreground/70 hover:text-primary transition-colors no-underline">Find Events</Link></li>
              <li><Link href="/mobile" className="text-foreground/70 hover:text-primary transition-colors no-underline">Get the App</Link></li>
              <li><Link href="/help/tickets" className="text-foreground/70 hover:text-primary transition-colors no-underline">Ticket Support</Link></li>
              <li><Link href="/testimonials" className="text-foreground/70 hover:text-primary transition-colors no-underline">User Testimonials</Link></li>
            </ul>
          </div>
          <div className="text-left">
            <h4 className="font-headline text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 mb-4">For Organizers</h4>
            <ul className="space-y-2 text-xs font-bold">
              <li><Link href="/pricing" className="text-foreground/70 hover:text-primary transition-colors no-underline">Pricing</Link></li>
              <li><Link href="/host-event" className="text-foreground/70 hover:text-primary transition-colors no-underline">Host Event</Link></li>
              <li><Link href="/docs" className="text-foreground/70 hover:text-primary transition-colors no-underline">Developer API</Link></li>
              <li><Link href="/case-studies" className="text-foreground/70 hover:text-primary transition-colors no-underline">Success Stories</Link></li>
            </ul>
          </div>
          <div className="text-left">
            <h4 className="font-headline text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 mb-4">Legal & Support</h4>
            <ul className="space-y-2 text-xs font-bold">
              <li><Link href="/help" className="text-foreground/70 hover:text-primary transition-colors no-underline">Help Center</Link></li>
              <li><Link href="/help/refunds" className="text-foreground/70 hover:text-primary transition-colors no-underline">Refund Policy</Link></li>
              <li><Link href="/privacy" className="text-foreground/70 hover:text-primary transition-colors no-underline">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-foreground/70 hover:text-primary transition-colors no-underline">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Logos & Copyright on same line for desktop */}
        <div className="border-t border-border pt-8 pb-4 flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Payment Partner Logos */}
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 opacity-60 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-700">
            {/* Paystack */}
            <div className="flex items-center gap-2 group cursor-default">
              <svg className="w-5 h-5 text-[#09A5DB]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 18.75c-3.728 0-6.75-3.022-6.75-6.75s3.022-6.75 6.75-6.75 6.75 3.022 6.75 6.75-3.022 6.75-6.75 6.75z"/>
                <path d="M12 7.5c-2.485 0-4.5 2.015-4.5 4.5s2.015 4.5 4.5 4.5 4.5-2.015 4.5-4.5-2.015-4.5-4.5-4.5zm0 6.75c-1.243 0-2.25-1.007-2.25-2.25s1.007-2.25 2.25-2.25 2.25 1.007 2.25 2.25-1.007 2.25-2.25 2.25z"/>
              </svg>
              <span className="text-[9px] font-black tracking-tighter uppercase text-foreground">Paystack</span>
            </div>
            {/* Flutterwave */}
            <div className="flex items-center gap-2 group cursor-default">
              <div className="w-5 h-5 bg-[#FB9129] rounded-full flex items-center justify-center text-[10px] font-black text-white italic shadow-sm">F</div>
              <span className="text-[9px] font-black tracking-tighter uppercase text-foreground">Flutterwave</span>
            </div>
            {/* SolanaPay */}
            <div className="flex items-center gap-3 group cursor-default">
              <div className="flex items-center -space-x-1.5">
                <div className="w-5 h-5 bg-[#2775CA] rounded-full border-2 border-background flex items-center justify-center shadow-sm">
                  <span className="text-[7px] font-black text-white leading-none">$</span>
                </div>
                <div className="w-5 h-5 bg-[#26A17B] rounded-full border-2 border-background flex items-center justify-center shadow-sm">
                  <span className="text-[7px] font-black text-white leading-none">₮</span>
                </div>
              </div>
              <div className="flex flex-col items-start leading-none">
                <span className="text-[9px] font-black tracking-tighter uppercase text-foreground">SolanaPay</span>
                <span className="text-[6px] font-black uppercase text-muted-foreground tracking-[0.1em]">USDC / USDT</span>
              </div>
            </div>
          </div>
          
          {/* Responsive Copyright */}
          <div className="text-center lg:text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 leading-relaxed text-balance max-w-xs md:max-w-none mx-auto lg:mx-0">
            Copyright © 2026 · IsabiEvents Technology · All Rights Reserved
          </div>
        </div>
      </div>
    </footer>
  );
}
