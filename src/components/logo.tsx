"use client";

import React from 'react';
import { Ticket } from 'lucide-react';
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Enhanced Logo component with deterministic sizing to prevent hydration mismatches.
 * Sizes have been increased for stronger brand presence.
 */
export function Logo({ className, iconOnly = false, size = 'md' }: LogoProps) {
  // Use deterministic class strings to ensure server/client consistency
  const containerClasses = cn(
    "bg-primary flex items-center justify-center -rotate-6 group-hover:rotate-0 transition-all duration-500 shadow-lg shadow-primary/20",
    size === 'sm' ? "w-10 h-10 rounded-xl" : 
    size === 'lg' ? "w-20 h-20 rounded-[2rem]" : 
    "w-12 h-12 rounded-2xl"
  );

  const iconClasses = cn(
    "text-primary-foreground fill-primary-foreground/20",
    size === 'sm' ? "w-5 h-5" : 
    size === 'lg' ? "w-10 h-10" : 
    "w-6 h-6"
  );

  const textClasses = cn(
    "font-headline font-black tracking-tighter leading-none flex items-center text-primary",
    size === 'sm' ? "text-2xl" : 
    size === 'lg' ? "text-6xl" : 
    "text-3xl"
  );

  const gapClass = size === 'lg' ? "gap-4" : "gap-3";

  return (
    <div className={cn("flex items-center group cursor-pointer select-none", gapClass, className)}>
      <div className={containerClasses}>
        <Ticket className={iconClasses} />
      </div>
      {!iconOnly && (
        <div className={textClasses}>
          IsabiEvents
        </div>
      )}
    </div>
  );
}
