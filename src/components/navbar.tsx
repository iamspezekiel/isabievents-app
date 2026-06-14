
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, User, LayoutDashboard } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Logo } from '@/components/logo';
import { ThemeToggle } from '@/components/theme-toggle';

const NAV_LINKS = [
  { name: 'Discover', href: '/discover' },
  { name: 'Categories', href: '/categories' },
  { name: 'About', href: '/about' },
  { name: 'Host Event', href: '/host-event' },
  { name: 'Pricing', href: '/pricing' },
  { name: 'Support', href: '/contact' },
];

export function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Mock login state for demo purposes
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('attendee');

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    
    // Check for mock login session
    if (typeof window !== 'undefined') {
      const isLogged = localStorage.getItem('isabi_logged_in') === 'true';
      const role = localStorage.getItem('isabi_user_role') || 'attendee';
      setIsLoggedIn(isLogged);
      setUserRole(role);
    }
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getIsActive = (path: string) => pathname === path;

  return (
    <div className={cn(
      "fixed left-1/2 -translate-x-1/2 z-50 transition-all duration-500 w-full max-w-7xl px-4",
      isScrolled ? "top-4" : "top-6"
    )}>
      <nav className={cn(
        "flex items-center justify-between px-6 py-3 rounded-full transition-all duration-500 border shadow-2xl overflow-hidden",
        isScrolled 
          ? "bg-background/70 backdrop-blur-xl border-border/50 h-16" 
          : "bg-background/40 backdrop-blur-md border-white/20 h-20"
      )}>
        {/* Logo */}
        <Link href="/" className="no-underline">
          <Logo size="sm" />
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link 
              key={link.href} 
              href={link.href}
              className={cn(
                "text-sm font-bold tracking-tight transition-colors hover:text-primary no-underline",
                getIsActive(link.href) ? "text-primary" : "text-foreground/70"
              )}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden sm:flex items-center gap-2">
            {mounted && <ThemeToggle />}
            
            {isLoggedIn ? (
              <Button size="sm" className="rounded-full px-6 shadow-xl shadow-primary/20 font-bold no-underline h-9 md:h-11 gap-2" asChild>
                <Link href={userRole === 'organizer' ? '/dashboard/organizer' : '/dashboard/attendee'}>
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" className="font-bold px-4 no-underline h-9 md:h-11 ml-2" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button size="sm" className="rounded-full px-6 shadow-xl shadow-primary/20 font-bold no-underline h-9 md:h-11" asChild>
                  <Link href="/signup">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          <div className="sm:hidden flex items-center gap-2">
             {mounted && <ThemeToggle />}
             <Button variant="ghost" size="icon" asChild className="no-underline">
                <Link href={isLoggedIn ? (userRole === 'organizer' ? '/dashboard/organizer' : '/dashboard/attendee') : '/login'}>
                  {isLoggedIn ? <LayoutDashboard className="w-5 h-5" /> : <User className="w-5 h-5" />}
                </Link>
             </Button>
          </div>

          {/* Mobile Menu Trigger */}
          <div className="flex items-center md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-card/95 backdrop-blur-xl border-border w-[300px] p-8">
                <SheetHeader className="text-left mb-12">
                  <SheetTitle>
                    <Logo size="sm" />
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-6">
                  {NAV_LINKS.map((link) => (
                    <Link 
                      key={link.href} 
                      href={link.href} 
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "text-xl font-black tracking-tighter no-underline",
                        getIsActive(link.href) ? "text-primary" : "text-muted-foreground"
                      )}
                    >
                      {link.name}
                    </Link>
                  ))}
                  <div className="h-px bg-border/50" />
                  <div className="flex flex-col gap-3 pt-6">
                    {isLoggedIn ? (
                      <Button className="w-full rounded-2xl h-12 font-bold shadow-xl shadow-primary/20 no-underline gap-2" asChild onClick={() => setIsOpen(false)}>
                        <Link href={userRole === 'organizer' ? '/dashboard/organizer' : '/dashboard/attendee'}>
                          <LayoutDashboard className="w-5 h-5" /> Dashboard
                        </Link>
                      </Button>
                    ) : (
                      <>
                        <Button variant="outline" className="w-full rounded-2xl h-12 font-bold no-underline" asChild onClick={() => setIsOpen(false)}>
                          <Link href="/login">Sign In</Link>
                        </Button>
                        <Button className="w-full rounded-2xl h-12 font-bold shadow-xl shadow-primary/20 no-underline" asChild onClick={() => setIsOpen(false)}>
                          <Link href="/signup">Create Account</Link>
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </div>
  );
}
