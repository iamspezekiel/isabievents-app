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
  HandHeart,
  Sparkles
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
import Image from 'next/image';

const iconMap: any = {
  Music, Trophy, Mic2, GlassWater, Dribbble, Church, Palette, Images, Cpu, Users,
  Laptop, Network, Activity, GraduationCap, HandHeart
};

export default function AllCategoriesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <header className="relative pt-32 pb-8 overflow-hidden border-b border-border bg-card/30">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/10 blur-[120px] -z-10 rounded-full" />
        <div className="container mx-auto px-4 text-center space-y-6">
          <h1 className="font-headline text-4xl md:text-6xl font-black leading-tight tracking-tighter text-balance">
            Find Your Next <br />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent italic">Shared Experience</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
            Explore 15 distinct categories of events happening across Nigeria.
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {CATEGORIES.map((cat) => {
            const IconComp = iconMap[cat.icon] || Music;
            return (
              <Link key={cat.id} href={`/discover?category=${cat.id}`} className="no-underline group">
                <div className="relative h-72 rounded-[2.5rem] overflow-hidden border border-border bg-card transition-all duration-500 group-hover:border-primary/50 group-hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] group-hover:-translate-y-2">
                  {/* Background Image Placeholder */}
                  <div className="absolute inset-0 opacity-10 grayscale group-hover:opacity-20 group-hover:grayscale-0 transition-all duration-700">
                    <Image 
                      src={`https://picsum.photos/seed/${cat.id}/600/400`} 
                      alt="" 
                      fill 
                      className="object-cover scale-110 group-hover:scale-100 transition-transform duration-700"
                    />
                  </div>
                  
                  {/* Content */}
                  <div className="relative h-full p-10 flex flex-col justify-between z-10">
                    <div className="flex justify-between items-start">
                      <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-lg group-hover:shadow-primary/20">
                        <IconComp className="w-8 h-8" />
                      </div>
                      <Badge variant="outline" className="bg-background/50 backdrop-blur-md border-border/50 font-bold group-hover:border-primary/30 transition-colors">
                        100+ Events
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-headline text-3xl font-black tracking-tighter leading-none">{cat.name}</h3>
                      <p className="text-muted-foreground font-medium group-hover:text-foreground transition-colors">Discover trending {cat.name.toLowerCase()} events</p>
                    </div>

                    <div className="absolute bottom-10 right-10 w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 shadow-xl shadow-primary/30">
                      <ChevronRight className="w-6 h-6" />
                    </div>
                  </div>

                  {/* Glass Overlay for Group Hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}