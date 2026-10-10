import React from 'react';
import Link from 'next/link';
import { Logo } from '@/components/logo';
import { NewsletterForm } from '@/components/newsletter-form';
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-background border-t border-border pt-12 pb-4">
      <div className="container mx-auto px-4">
        {/* Newsletter Section */}
        <div className="max-w-6xl mx-auto bg-primary/5 border border-primary/10 rounded-[2rem] p-6 md:p-8 mb-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-2 text-center lg:text-left">
            <h3 className="font-headline text-4xl md:text-5xl font-black tracking-tighter">
              Stay in the <span className="text-primary">Loop</span>
            </h3>
            <p className="text-muted-foreground font-medium">Get first access to Nigerian concerts, festivals, and tech summits.</p>
          </div>
          <div className="w-full lg:max-w-md">
            <NewsletterForm />
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div className="col-span-1 md:col-span-1 space-y-4">
            <Link href="/" className="inline-block no-underline">
               <Logo size="sm" />
            </Link>
            <p className="text-muted-foreground leading-relaxed max-w-xs font-medium text-left text-[15px] text-balance">
              Connecting people to <br /> unforgettable experiences.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-3">
              <Link href="https://facebook.com/isabievents" target="_blank" className="p-2 rounded-lg bg-secondary hover:bg-primary hover:text-white transition-all group no-underline">
                <Facebook className="w-4 h-4" />
              </Link>
              <Link href="https://twitter.com/isabievents" target="_blank" className="p-2 rounded-lg bg-secondary hover:bg-primary hover:text-white transition-all group no-underline">
                <Twitter className="w-4 h-4" />
              </Link>
              <Link href="https://instagram.com/isabievents" target="_blank" className="p-2 rounded-lg bg-secondary hover:bg-primary hover:text-white transition-all group no-underline">
                <Instagram className="w-4 h-4" />
              </Link>
              <Link href="https://youtube.com/@isabievents" target="_blank" className="p-2 rounded-lg bg-secondary hover:bg-primary hover:text-white transition-all group no-underline">
                <Youtube className="w-4 h-4" />
              </Link>
            </div>
          </div>
          <div className="text-left">
            <h4 className="font-headline text-sm font-black uppercase tracking-widest text-muted-foreground/50 mb-4">For Attendees</h4>
            <ul className="space-y-2 text-base font-bold">
              <li><Link href="/discover" className="text-foreground/70 hover:text-primary transition-colors no-underline">Find Events</Link></li>
              <li><Link href="/mobile" className="text-foreground/70 hover:text-primary transition-colors no-underline">Get the App</Link></li>
              <li><Link href="/help/tickets" className="text-foreground/70 hover:text-primary transition-colors no-underline">Ticket Support</Link></li>
              <li><Link href="/testimonials" className="text-foreground/70 hover:text-primary transition-colors no-underline">Trust &amp; Safety</Link></li>
            </ul>
          </div>
          <div className="text-left">
            <h4 className="font-headline text-sm font-black uppercase tracking-widest text-muted-foreground/50 mb-4">For Organizers</h4>
            <ul className="space-y-2 text-base font-bold">
              <li><Link href="/pricing" className="text-foreground/70 hover:text-primary transition-colors no-underline">Pricing</Link></li>
              <li><Link href="/host-event" className="text-foreground/70 hover:text-primary transition-colors no-underline">Host Event</Link></li>
              <li><Link href="/docs" className="text-foreground/70 hover:text-primary transition-colors no-underline">Developer API</Link></li>
              <li><Link href="/organizer" className="text-foreground/70 hover:text-primary transition-colors no-underline">Why Host with Us</Link></li>
            </ul>
          </div>
          <div className="text-left">
            <h4 className="font-headline text-sm font-black uppercase tracking-widest text-muted-foreground/50 mb-4">Legal & Support</h4>
            <ul className="space-y-2 text-base font-bold">
              <li><Link href="/help" className="text-foreground/70 hover:text-primary transition-colors no-underline">Help Center</Link></li>
              <li><Link href="/help/refunds" className="text-foreground/70 hover:text-primary transition-colors no-underline">Refund Policy</Link></li>
              <li><Link href="/privacy" className="text-foreground/70 hover:text-primary transition-colors no-underline">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-foreground/70 hover:text-primary transition-colors no-underline">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Logos & Copyright on same line for desktop */}
        <div className="border-t border-border pt-8 pb-2 flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Payment Partner Logos */}
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 opacity-60 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-700">
            {/* Bachs */}
            <div className="flex items-center gap-2 group cursor-default">
              <div className="w-5 h-5 bg-[#7E7CFF] rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-sm">B</div>
              <span className="text-[11px] font-black tracking-tighter uppercase text-foreground">Bachs</span>
            </div>
            {/* Crypto (via Bachs) */}
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
                <span className="text-[11px] font-black tracking-tighter uppercase text-foreground">Crypto</span>
                <span className="text-[7px] font-black uppercase text-muted-foreground tracking-[0.1em]">USDC / USDT / SOL</span>
              </div>
            </div>
          </div>
          
          {/* Responsive Copyright */}
          <div className="text-center lg:text-right text-xs font-black uppercase tracking-widest text-muted-foreground/50 leading-relaxed text-balance max-w-xs md:max-w-none mx-auto lg:mx-0">
            Copyright © 2026 · IsabiEvents · All Rights Reserved
          </div>
        </div>
      </div>
    </footer>
  );
}
