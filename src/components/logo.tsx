
"use client";

import React, { useEffect, useState } from 'react';
import { Ticket } from 'lucide-react';
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: {
    container: "w-8 h-8 rounded-lg",
    icon: "w-4 h-4",
    text: "text-xl",
  },
  md: {
    container: "w-10 h-10 rounded-xl",
    icon: "w-5 h-5",
    text: "text-2xl",
  },
  lg: {
    container: "w-14 h-14 rounded-2xl",
    icon: "w-7 h-7",
    text: "text-4xl",
  }
};

export function Logo({ className, iconOnly = false, size = 'md' }: LogoProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentSize = sizeClasses[size];

  return (
    <div className={cn("flex items-center gap-2.5 group cursor-pointer select-none", className)}>
      <div className={cn(
        "bg-primary flex items-center justify-center -rotate-6 group-hover:rotate-0 transition-all duration-500 shadow-lg shadow-primary/20",
        currentSize.container
      )}>
        <Ticket className={cn("text-primary-foreground fill-primary-foreground/20", currentSize.icon)} />
      </div>
      {!iconOnly && (
        <div className={cn(
          "font-headline font-black tracking-tighter leading-none flex items-center text-primary", 
          currentSize.text,
          !mounted && "opacity-0"
        )}>
          IsabiEvents
        </div>
      )}
    </div>
  );
}
