
"use client";

import React from 'react';
import { Globe, ShieldCheck, Copy, ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Logo } from '@/components/logo';
import Link from 'next/link';

export default function DeveloperApiPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar Nav */}
      <aside className="w-64 border-r border-border hidden lg:block p-8 sticky top-20 h-[calc(100vh-5rem)] overflow-auto">
        <Link href="/" className="mb-12 block">
          <Logo size="sm" />
        </Link>
        <nav className="space-y-8">
          <DocNavGroup title="Getting Started" items={['Introduction', 'Authentication', 'Errors']} />
          <DocNavGroup title="Resources" items={['Events', 'Tickets', 'Organizers', 'Webhooks']} />
          <DocNavGroup title="SDKs" items={['Node.js', 'Python', 'Go']} />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 md:p-16 pt-32 md:pt-40 max-w-5xl">
        <div className="space-y-12">
          <header className="space-y-4">
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="bg-primary/10 text-primary border-none">API V1.2</Badge>
              <span className="text-xs text-muted-foreground font-mono">Updated 2 days ago</span>
            </div>
            <h1 className="font-headline text-5xl">Build with IsabiEvents</h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl">
              Integrate Nigerian event ticketing into your own platforms. From automated ticket generation to custom checkout flows, our REST API handles the heavy lifting.
            </p>
          </header>

          <section className="grid md:grid-cols-2 gap-8">
            <ApiFeatureCard 
              icon={Globe} 
              title="RESTful API" 
              desc="Standard JSON responses and predictable resource-oriented URLs." 
            />
            <ApiFeatureCard 
              icon={ShieldCheck} 
              title="Secure Auth" 
              desc="Token-based authentication with granular permission scopes." 
            />
          </section>

          <section className="space-y-6">
            <h2 className="font-headline text-2xl">Quick Start Example</h2>
            <div className="bg-[#12121a] rounded-2xl border border-border overflow-hidden shadow-2xl">
              <div className="bg-secondary/50 px-6 py-3 flex items-center justify-between border-b border-border">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                  <div className="w-3 h-3 rounded-full bg-green-500/50" />
                </div>
                <Button variant="ghost" size="sm" className="h-8 gap-2 text-xs">
                  <Copy className="w-3 h-3" /> Copy
                </Button>
              </div>
              <pre className="p-8 text-sm font-mono overflow-x-auto text-blue-300">
                <code>{`// List all trending events in Lagos
const response = await fetch('https://api.isabievents.ng/v1/events?city=lagos', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
});

const data = await response.json();
console.log(data.events);`}</code>
              </pre>
            </div>
          </section>

          <section className="bg-primary/10 border border-primary/20 rounded-[2rem] p-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-2">
              <h3 className="font-headline text-2xl">Ready to get your API key?</h3>
              <p className="text-muted-foreground">Sign in to your developer dashboard to start building.</p>
            </div>
            <Button size="lg" className="rounded-full px-10 h-14 text-lg">Get Started <ArrowRight className="w-5 h-5 ml-2" /></Button>
          </section>
        </div>
      </main>
    </div>
  );
}

function DocNavGroup({ title, items }: any) {
  return (
    <div className="space-y-3">
      <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground/50">{title}</h4>
      <ul className="space-y-2">
        {items.map((item: string) => (
          <li key={item}>
            <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">{item}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ApiFeatureCard({ icon: Icon, title, desc }: any) {
  return (
    <Card className="bg-card border-border hover:border-primary/50 transition-all p-8">
      <CardContent className="p-0 space-y-4">
        <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <h3 className="font-bold text-lg">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
      </CardContent>
    </Card>
  );
}
