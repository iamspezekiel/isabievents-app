"use client";

import React from 'react';
import { Ticket } from 'lucide-react';
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className, iconOnly = false, size = 'md' }: LogoProps) {
  const containerClasses = cn(
    "bg-primary flex items-center justify-center -rotate-6 group-hover:rotate-0 transition-all duration-500 shadow-lg shadow-primary/20",
    size === 'sm' ? "w-8 h-8 rounded-lg" : 
    size === 'lg' ? "w-14 h-14 rounded-2xl" : 
    "w-10 h-10 rounded-xl"
  );

  const iconClasses = cn(
    "text-primary-foreground fill-primary-foreground/20",
    size === 'sm' ? "w-4 h-4" : 
    size === 'lg' ? "w-7 h-7" : 
    "w-5 h-5"
  );

  const textClasses = cn(
    "font-headline font-black tracking-tighter leading-none flex items-center text-primary",
    size === 'sm' ? "text-xl" : 
    size === 'lg' ? "text-4xl" : 
    "text-2xl"
  );

  return (
    <div className={cn("flex items-center gap-2.5 group cursor-pointer select-none", className)}>
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
