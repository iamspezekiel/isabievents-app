"use client";

import React, { useState, useEffect } from 'react';
import { Ticket } from 'lucide-react';
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Hydration-safe Logo component with responsive branding.
 */
export function Logo({ className, iconOnly = false, size = 'md' }: LogoProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Base classes used for initial SSR and client hydration to prevent mismatch.
  const containerBase = "bg-primary flex items-center justify-center -rotate-6 transition-all duration-500 shadow-lg shadow-primary/20";
  const iconBase = "text-primary-foreground fill-primary-foreground/20";
  const textBase = "font-headline font-black tracking-tighter leading-none flex items-center text-primary";

  // Size configurations
  const sizes = {
    sm: { container: "w-10 h-10 rounded-xl", icon: "w-5 h-5", text: "text-2xl", gap: "gap-2.5" },
    md: { container: "w-12 h-12 rounded-2xl", icon: "w-6 h-6", text: "text-3xl", gap: "gap-3" },
    lg: { container: "w-20 h-20 rounded-[2rem]", icon: "w-10 h-10", text: "text-6xl", gap: "gap-4" },
  };

  const config = sizes[size] || sizes.md;

  // While not mounted, we use a very strictly ordered class string that matches the server's prediction.
  if (!mounted) {
    return (
      <div className={cn("flex items-center gap-2.5 group cursor-pointer select-none", className)}>
        <div className={cn(containerBase, "w-10 h-10 rounded-xl")}>
          <Ticket className={cn(iconBase, "w-5 h-5")} />
        </div>
        {!iconOnly && (
          <div className={cn(textBase, "text-2xl")}>
            IsabiEvents
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("flex items-center group cursor-pointer select-none", config.gap, className)}>
      <div className={cn(containerBase, "group-hover:rotate-0", config.container)}>
        <Ticket className={cn(iconBase, config.icon)} />
      </div>
      {!iconOnly && (
        <div className={cn(textBase, config.text)}>
          IsabiEvents
        </div>
      )}
    </div>
  );
}
