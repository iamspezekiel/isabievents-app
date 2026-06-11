
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
  const sizeClasses = {
    sm: {
      container: "w-8 h-8 rounded-lg",
      icon: "w-4 h-4",
      text: "text-lg",
    },
    md: {
      container: "w-10 h-10 rounded-xl",
      icon: "w-5 h-5",
      text: "text-2xl",
    },
    lg: {
      container: "w-12 h-12 rounded-2xl",
      icon: "w-6 h-6",
      text: "text-3xl",
    }
  };

  const currentSize = sizeClasses[size];

  return (
    <div className={cn("flex items-center gap-2 group cursor-pointer", className)}>
      <div className={cn(
        "bg-primary/10 border border-primary/20 flex items-center justify-center rotate-3 group-hover:rotate-0 transition-transform duration-300 shadow-xl shadow-primary/5",
        currentSize.container
      )}>
        <Ticket className={cn("text-primary fill-primary/20", currentSize.icon)} />
      </div>
      {!iconOnly && (
        <span className={cn("font-headline tracking-tight text-primary", currentSize.text)}>
          IsabiEvents
        </span>
      )}
    </div>
  );
}
