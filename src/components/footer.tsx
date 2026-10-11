import React from 'react';
import Link from 'next/link';
import { Logo } from '@/components/logo';
import { FooterNewsletter } from '@/components/footer-newsletter';
import { Facebook, Twitter, Instagram, Youtube, ArrowUpRight } from 'lucide-react';

const SOCIALS = [
  { href: 'https://facebook.com/isabievents', label: 'Facebook', Icon: Facebook },
  { href: 'https://twitter.com/isabievents', label: 'Twitter', Icon: Twitter },
  { href: 'https://instagram.com/isabievents', label: 'Instagram', Icon: Instagram },
  { href: 'https://youtube.com/@isabievents', label: 'YouTube', Icon: Youtube },
] as const;

function ColumnHeading({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="mb-5 flex items-center gap-2 font-headline text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
      <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
      {children}
    </h4>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className="group inline-flex items-center gap-1 text-[15px] font-semibold text-muted-foreground transition-colors hover:text-primary no-underline"
      >
        {children}
        <ArrowUpRight
          className="h-3.5 w-3.5 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100"
          aria-hidden
        />
      </Link>
    </li>
  );
}

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-background border-t border-border pt-12 pb-4">
      {/* Accent line + ambient glow */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <div aria-hidden className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[42rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      <div className="container relative z-10 mx-auto px-4">
        {/* Newsletter Section (hidden on dashboard routes) */}
        <FooterNewsletter />


        {/* Links Grid */}
        <div className="mb-12 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 text-left">
          {/* Brand */}
          <div className="space-y-5">
            <Link href="/" className="inline-block no-underline">
              <Logo size="sm" />
            </Link>
            <p className="max-w-xs text-[15px] font-medium leading-relaxed text-muted-foreground text-balance">
              Connecting people to <br /> unforgettable experiences.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-3">
              {SOCIALS.map(({ href, label, Icon }) => (
                <Link
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-secondary/60 text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-primary hover:bg-primary/10 hover:text-primary hover:shadow-lg hover:shadow-primary/20 no-underline"
                >
                  <Icon className="h-3.5 w-3.5" />
                </Link>
              ))}
            </div>

          </div>

          {/* For Attendees */}
          <div>
            <ColumnHeading>For Attendees</ColumnHeading>
            <ul className="space-y-3">
              <FooterLink href="/discover">Find Events</FooterLink>
              <FooterLink href="/mobile">Get the App</FooterLink>
              <FooterLink href="/help/tickets">Ticket Support</FooterLink>
              <FooterLink href="/testimonials">Trust &amp; Safety</FooterLink>
            </ul>
          </div>

          {/* For Organizers */}
          <div>
            <ColumnHeading>For Organizers</ColumnHeading>
            <ul className="space-y-3">
              <FooterLink href="/pricing">Pricing</FooterLink>
              <FooterLink href="/host-event">Host Event</FooterLink>
              <FooterLink href="/docs">Developer API</FooterLink>
              <FooterLink href="/organizer">Why Host with Us</FooterLink>
            </ul>
          </div>

          {/* Legal & Support */}
          <div>
            <ColumnHeading>Legal &amp; Support</ColumnHeading>
            <ul className="space-y-3">
              <FooterLink href="/help">Help Center</FooterLink>
              <FooterLink href="/help/refunds">Refund Policy</FooterLink>
              <FooterLink href="/privacy">Privacy Policy</FooterLink>
              <FooterLink href="/terms">Terms of Service</FooterLink>
            </ul>
          </div>


        </div>
        {/* Bottom Bar: Logos & Copyright on same line for desktop */}
        <div className="border-t border-border pt-8 pb-2 flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Payment Partner Logos */}
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 rounded-full border border-border/60 bg-secondary/30 px-6 py-2.5 opacity-60 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-700">
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
