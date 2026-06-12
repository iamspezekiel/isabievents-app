
"use client";

import React from 'react';
import { CATEGORIES } from '@/lib/mock-data';
import { 
  Music, 
  Trophy, 
  Mic2, 
  GlassWater, 
  Dribbble, 
  Church, 
  Palette, 
  Images, 
  Cpu, 
  Users,
  ChevronRight,
  Laptop,
  Network,
  Activity,
  GraduationCap,
  HandHeart
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import Image from 'next/image';

const iconMap: any = {
  Music, Trophy, Mic2, GlassWater, Dribbble, Church, Palette, Images, Cpu, Users,
  Laptop, Network, Activity, GraduationCap, HandHeart
};

export default function AllCategoriesPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card pt-40 pb-12">
        <div className="container mx-auto px-4">
          <h1 className="font-headline text-4xl md:text-6xl text-balance">Browse Everything</h1>
          <p className="text-muted-foreground text-lg mt-4">Discover experiences across every interest in Nigeria.</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {CATEGORIES.map((cat) => {
            const IconComp = iconMap[cat.icon] || Music;
            return (
              <Link key={cat.id} href={`/discover?category=${cat.id}`} className="no-underline">
                <div className="group relative h-64 rounded-3xl overflow-hidden border border-border hover:border-primary/50 transition-all bg-card">
                  <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Image 
                      src={`https://picsum.photos/seed/${cat.id}/600/400`} 
                      alt="" 
                      fill 
                      className="object-cover"
                    />
                  </div>
                  <div className="relative h-full p-8 flex flex-col justify-between">
                    <div className="w-14 h-14 bg-secondary rounded-2xl flex items-center justify-center group-hover:bg-primary transition-colors">
                      <IconComp className="w-7 h-7 text-muted-foreground group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <h3 className="font-headline text-2xl mb-1 text-foreground">{cat.name}</h3>
                      <p className="text-sm text-muted-foreground">Explore 100+ events</p>
                    </div>
                    <div className="absolute bottom-8 right-8 w-10 h-10 rounded-full bg-secondary flex items-center justify-center opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all">
                      <ChevronRight className="w-5 h-5 text-foreground" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
