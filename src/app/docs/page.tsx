"use client";

import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  ShieldCheck, 
  Copy, 
  ArrowRight, 
  Code, 
  Key, 
  AlertCircle, 
  Zap, 
  Terminal,
  Menu,
  ChevronDown
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Logo } from '@/components/logo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from 'next/link';
import { cn } from "@/lib/utils";

const SECTIONS = [
  {
    group: "Getting Started",
    items: [
      { id: "introduction", label: "Introduction" },
      { id: "authentication", label: "Authentication" },
      { id: "errors", label: "Errors" }
    ]
  },
  {
    group: "Resources",
    items: [
      { id: "events", label: "Events" },
      { id: "tickets", label: "Tickets" },
      { id: "organizers", label: "Organizers" },
      { id: "webhooks", label: "Webhooks" }
    ]
  }
];

export default function DeveloperApiPage() {
  const [activeSection, setActiveSection] = useState('introduction');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.5 }
    );

    document.querySelectorAll('section[id]').forEach((section) => {
      observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 140; // Account for fixed header and mobile nav
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  const currentLabel = SECTIONS.flatMap(g => g.items).find(i => i.id === activeSection)?.label || "Menu";

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col lg:flex-row">
      {/* Mobile Sticky Section Header */}
      <div className="lg:hidden sticky top-[84px] z-30 w-full bg-background/80 backdrop-blur-md border-b border-border px-4 py-3 flex items-center justify-between mt-28">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Section</span>
          <span className="text-sm font-bold">{currentLabel}</span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="rounded-full h-8 gap-2">
              <Menu className="w-3 h-3" /> Jump to <ChevronDown className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-card border-border">
            {SECTIONS.map((group) => (
              <React.Fragment key={group.group}>
                <div className="px-2 py-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
                  {group.group}
                </div>
                {group.items.map((item) => (
                  <DropdownMenuItem 
                    key={item.id} 
                    onClick={() => scrollToSection(item.id)}
                    className={cn(
                      "text-sm",
                      activeSection === item.id ? "text-primary font-bold bg-primary/5" : "text-muted-foreground"
                    )}
                  >
                    {item.label}
                  </DropdownMenuItem>
                ))}
              </React.Fragment>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Sidebar Nav (Desktop Only) */}
      <aside className="w-64 border-r border-border hidden lg:block p-8 sticky top-0 h-screen overflow-auto pt-32">
        <div className="mb-12">
          <Logo size="sm" />
        </div>
        <nav className="space-y-8">
          {SECTIONS.map((group) => (
            <div key={group.group} className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground/50">{group.group}</h4>
              <ul className="space-y-1">
                {group.items.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => scrollToSection(item.id)}
                      className={cn(
                        "text-sm w-full text-left px-3 py-2 rounded-lg transition-all",
                        activeSection === item.id
                          ? "bg-primary/10 text-primary font-bold"
                          : "text-muted-foreground hover:text-primary hover:bg-secondary/50"
                      )}
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 lg:p-16 lg:pt-32 max-w-5xl">
        <div className="space-y-20 md:space-y-24">
          <header className="space-y-4 pt-8 lg:pt-0">
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="bg-primary/10 text-primary border-none">API V1.2</Badge>
              <span className="text-[10px] md:text-xs text-muted-foreground font-mono">Updated 2 days ago</span>
            </div>
            <h1 className="font-headline text-3xl md:text-5xl lg:text-6xl text-left">Build with IsabiEvents</h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl text-left">
              Integrate Nigerian event ticketing into your own platforms. From automated ticket generation to custom checkout flows, our REST API handles the heavy lifting.
            </p>
          </header>

          <section id="introduction" className="space-y-6 scroll-mt-32">
            <h2 className="font-headline text-2xl md:text-3xl text-left">Introduction</h2>
            <p className="text-muted-foreground leading-relaxed text-left text-sm md:text-base">
              The IsabiEvents API is organized around REST. Our API has predictable resource-oriented URLs, accepts form-encoded request bodies, returns JSON-encoded responses, and uses standard HTTP response codes, authentication, and verbs.
            </p>
            <div className="grid md:grid-cols-2 gap-4 md:gap-8 pt-6">
              <ApiFeatureCard 
                icon={Globe} 
                title="RESTful API" 
                desc="Standard JSON responses and predictable resource-oriented URLs for easy integration." 
              />
              <ApiFeatureCard 
                icon={ShieldCheck} 
                title="Secure Auth" 
                desc="Token-based authentication with granular permission scopes for every environment." 
              />
            </div>
          </section>

          <section id="authentication" className="space-y-6 scroll-mt-32">
            <h2 className="font-headline text-2xl md:text-3xl text-left">Authentication</h2>
            <p className="text-muted-foreground leading-relaxed text-left text-sm md:text-base">
              Authenticate your account by including your secret key in API requests. You can manage your API keys in the Developer Dashboard.
            </p>
            <div className="bg-card border border-border p-4 md:p-6 rounded-2xl flex items-start gap-4">
              <Key className="w-5 h-5 md:w-6 md:h-6 text-primary shrink-0 mt-1" />
              <div className="text-left">
                <h4 className="font-bold mb-1 text-sm md:text-base">Authorization Header</h4>
                <p className="text-xs md:text-sm text-muted-foreground font-mono break-all">Authorization: Bearer YOUR_SECRET_KEY</p>
              </div>
            </div>
            <CodeBlock 
              title="Authenticate with cURL"
              code={`curl https://api.isabievents.ng/v1/events \\
  -H "Authorization: Bearer YOUR_SECRET_KEY"`}
            />
          </section>

          <section id="errors" className="space-y-6 scroll-mt-32">
            <h2 className="font-headline text-2xl md:text-3xl text-left">Errors</h2>
            <p className="text-muted-foreground leading-relaxed text-left text-sm md:text-base">
              IsabiEvents uses conventional HTTP response codes to indicate the success or failure of an API request.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
              <ErrorCard code="200" label="OK" desc="Everything worked as expected." />
              <ErrorCard code="400" label="Bad Request" desc="The request was unacceptable." />
              <ErrorCard code="401" label="Unauthorized" desc="No valid API key provided." />
            </div>
          </section>

          <section id="events" className="space-y-6 scroll-mt-32">
            <h2 className="font-headline text-2xl md:text-3xl text-left">Events</h2>
            <p className="text-muted-foreground leading-relaxed text-left text-sm md:text-base">
              Search and retrieve event details across Nigeria. Use filters for city, category, and date ranges.
            </p>
            <CodeBlock 
              title="GET /v1/events"
              code={`// List all trending events in Lagos
const response = await fetch('https://api.isabievents.ng/v1/events?city=lagos', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
});

const data = await response.json();
console.log(data.events);`}
            />
          </section>

          <section id="tickets" className="space-y-6 scroll-mt-32">
            <h2 className="font-headline text-2xl md:text-3xl text-left">Tickets</h2>
            <p className="text-muted-foreground leading-relaxed text-left text-sm md:text-base">
              Manage ticket generation and verification. Generate unique QR codes for your custom checkout experiences.
            </p>
            <CodeBlock 
              title="POST /v1/tickets/generate"
              code={`const ticket = await fetch('https://api.isabievents.ng/v1/tickets/generate', {
  method: 'POST',
  body: JSON.stringify({
    event_id: 'e1',
    attendee_email: 'tunde@example.com',
    tier: 'vip'
  })
});`}
            />
          </section>

          <section id="organizers" className="space-y-6 scroll-mt-32">
            <h2 className="font-headline text-2xl md:text-3xl text-left">Organizers</h2>
            <p className="text-muted-foreground leading-relaxed text-left text-sm md:text-base">
              Retrieve public profiles and verification status for Nigerian event organizers.
            </p>
          </section>

          <section id="webhooks" className="space-y-6 scroll-mt-32">
            <h2 className="font-headline text-2xl md:text-3xl text-left">Webhooks</h2>
            <p className="text-muted-foreground leading-relaxed text-left text-sm md:text-base">
              IsabiEvents uses webhooks to notify your application when an event happens in your account.
            </p>
            <Card className="bg-primary/5 border-primary/20 p-6 flex items-start gap-4">
              <Zap className="w-5 h-5 md:w-6 md:h-6 text-primary shrink-0 mt-1" />
              <div className="text-left">
                <h4 className="font-bold text-primary text-sm md:text-base">Live Updates</h4>
                <p className="text-xs md:text-sm text-muted-foreground">Configure your webhook URL in the settings to start receiving real-time payloads.</p>
              </div>
            </Card>
          </section>

          <section className="bg-primary/10 border border-primary/20 rounded-[2rem] p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-2 text-center md:text-left">
              <h3 className="font-headline text-xl md:text-2xl">Ready to get your API key?</h3>
              <p className="text-sm md:text-base text-muted-foreground">Sign in to your developer dashboard to start building.</p>
            </div>
            <Link href="/signup" className="w-full md:w-auto">
              <Button size="lg" className="rounded-full px-10 h-14 text-lg w-full">Get Started <ArrowRight className="w-5 h-5 ml-2" /></Button>
            </Link>
          </section>
        </div>
      </main>
    </div>
  );
}

function ApiFeatureCard({ icon: Icon, title, desc }: any) {
  return (
    <Card className="bg-card border-border hover:border-primary/50 transition-all p-6 md:p-8 text-left">
      <CardContent className="p-0 space-y-4">
        <div className="w-10 h-10 md:w-12 md:h-12 bg-secondary rounded-xl flex items-center justify-center">
          <Icon className="w-5 h-5 md:w-6 md:h-6 text-primary" />
        </div>
        <h3 className="font-bold text-base md:text-lg">{title}</h3>
        <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{desc}</p>
      </CardContent>
    </Card>
  );
}

function CodeBlock({ title, code }: { title: string, code: string }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 text-left">
      <div className="flex items-center justify-between">
        <h4 className="text-xs md:text-sm font-bold text-muted-foreground flex items-center gap-2">
          <Terminal className="w-3 h-3 md:w-4 md:h-4" /> {title}
        </h4>
      </div>
      <div className="bg-[#12121a] rounded-2xl border border-border overflow-hidden shadow-2xl">
        <div className="bg-secondary/50 px-4 md:px-6 py-2 md:py-3 flex items-center justify-between border-b border-border">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-red-500/50" />
            <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-yellow-500/50" />
            <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-green-500/50" />
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 md:h-8 gap-2 text-[10px] md:text-xs"
            onClick={copyToClipboard}
          >
            {copied ? "Copied!" : <><Copy className="w-3 h-3" /> Copy</>}
          </Button>
        </div>
        <pre className="p-4 md:p-8 text-[11px] md:text-sm font-mono overflow-x-auto text-blue-300">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}

function ErrorCard({ code, label, desc }: any) {
  return (
    <div className="p-4 bg-secondary/30 rounded-xl border border-border space-y-2 text-left">
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="font-mono text-[10px]">{code}</Badge>
        <span className="font-bold text-xs md:text-sm">{label}</span>
      </div>
      <p className="text-[10px] md:text-xs text-muted-foreground">{desc}</p>
    </div>
  );
}
