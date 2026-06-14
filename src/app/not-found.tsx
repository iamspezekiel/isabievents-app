"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Search, MapPin, Home } from 'lucide-react';
import { Logo } from '@/components/logo';

/**
 * Custom 404 Page for IsabiEvents.
 * Replaces the default Next.js error page with a branded, helpful experience.
 */
export default function NotFound() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Use useEffect to ensure the component is mounted on the client
  // before rendering to prevent hydration mismatches caused by server/client discrepancies.
  useEffect(() => {
    setMounted(true);
  }, []);

  // During SSR and initial hydration, we render a placeholder to avoid mismatches.
  if (!mounted) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-start p-4 pt-40 pb-20 text-center overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 blur-[120px] -z-10 rounded-full" />
      
      <div className="max-w-md w-full space-y-8 animate-in fade-in zoom-in-95 duration-700">
        <div className="flex justify-center mb-8">
          <Logo size="lg" />
        </div>

        <div className="relative">
          {/* Stylized 404 Background Text */}
          <h1 className="text-[120px] md:text-[160px] font-black tracking-tighter leading-none text-primary/10 select-none">
            404
          </h1>
          {/* Floating Search Icon */}
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-20 h-20 md:w-28 md:h-28 bg-card border border-border rounded-[2.5rem] flex items-center justify-center shadow-2xl animate-bounce duration-[3000ms]">
                <Search className="w-10 h-10 md:w-14 md:h-14 text-primary" />
             </div>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-3xl md:text-4xl font-headline font-black tracking-tight text-foreground">Lost in the crowd?</h2>
          <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
            We couldn't find the page you're looking for. It might have been moved, or the link has expired.
          </p>
        </div>

        <div className="flex flex-col gap-3 pt-6">
          <Button 
            onClick={() => router.back()}
            className="w-full h-12 md:h-14 rounded-2xl font-bold shadow-xl shadow-primary/20 gap-2 text-base"
          >
            <ArrowLeft className="w-5 h-5" /> Go Back
          </Button>
          <Button asChild variant="ghost" className="w-full h-12 rounded-2xl font-bold gap-2 text-muted-foreground hover:text-foreground">
            <Link href="/" className="no-underline">
              <Home className="w-4 h-4" /> Back to Home
            </Link>
          </Button>
        </div>

        <div className="pt-16 flex items-center justify-center gap-6 opacity-30">
           <div className="flex items-center gap-2">
             <MapPin className="w-4 h-4" />
             <span className="text-[10px] font-black uppercase tracking-[0.2em]">Lost?</span>
           </div>
           <div className="h-4 w-px bg-border" />
           <span className="text-[10px] font-black uppercase tracking-widest">IsabiEvents Hub</span>
        </div>
      </div>
    </div>
  );
}
