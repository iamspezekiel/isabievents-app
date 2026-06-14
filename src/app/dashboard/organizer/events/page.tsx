"use client";

import React, { useState } from 'react';
import { 
  Ticket, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  ExternalLink, 
  LayoutDashboard, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut, 
  Menu,
  Edit,
  Trash2,
  Eye,
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MOCK_EVENTS } from '@/lib/mock-data';
import Link from 'next/link';
import { Logo } from '@/components/logo';
import { SidebarLink } from '../page';
import { usePathname } from 'next/navigation';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";

export default function MyEventsPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [eventToCancel, setEventToCancel] = useState<any>(null);
  const pathname = usePathname();
  const { toast } = useToast();

  const handleCancelIntent = (event: any) => {
    setEventToCancel(event);
    setIsCancelDialogOpen(true);
  };

  const confirmCancelEvent = () => {
    if (eventToCancel) {
      toast({
        title: "Cancellation Successful",
        description: `"${eventToCancel.title}" has been removed and ticket holders notified.`,
      });
      setIsCancelDialogOpen(false);
      setEventToCancel(null);
    }
  };

  const NavigationLinks = () => (
    <nav className="flex-1 space-y-1">
      <div className="pb-2">
        <SidebarLink icon={LayoutDashboard} label="Dashboard" href="/dashboard/organizer" active={pathname === '/dashboard/organizer'} />
        <SidebarLink icon={Plus} label="Create Event" href="/dashboard/organizer/create" active={pathname === '/dashboard/organizer/create'} />
        <SidebarLink icon={Ticket} label="My Events" href="/dashboard/organizer/events" active={pathname === '/dashboard/organizer/events'} />
        <SidebarLink icon={Users} label="Vendors" href="/dashboard/organizer/vendors" active={pathname === '/dashboard/organizer/vendors'} />
        <SidebarLink icon={BarChart3} label="Analytics" href="/dashboard/organizer/analytics" active={pathname === '/dashboard/organizer/analytics'} />
        <SidebarLink icon={Settings} label="Settings" href="/dashboard/organizer/settings" active={pathname === '/dashboard/organizer/settings'} />
      </div>
    </nav>
  );
  
  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row pt-32">
      {/* Desktop Side Navigation */}
      <aside className="w-64 bg-sidebar border-r border-sidebar-border p-6 flex flex-col hidden md:flex sticky top-0 h-screen overflow-y-auto">
        <div className="mb-10">
          <Link href="/dashboard/organizer" className="no-underline">
            <Logo size="sm" />
          </Link>
        </div>
        <NavigationLinks />
        <div className="pt-6 border-t border-sidebar-border mt-auto">
          <SidebarLink icon={LogOut} label="Log Out" href="/login" />
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 bg-card border-b border-border sticky top-0 z-40">
        <Link href="/dashboard/organizer" className="no-underline">
          <Logo size="sm" />
        </Link>
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" title="Open Menu">
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 bg-card border-border p-6 flex flex-col overflow-y-auto">
            <SheetHeader className="text-left mb-10">
              <SheetTitle>
                <Link href="/dashboard/organizer" className="no-underline" onClick={() => setIsMobileMenuOpen(false)}>
                  <Logo size="sm" />
                </Link>
              </SheetTitle>
            </SheetHeader>
            <NavigationLinks />
            <div className="pt-6 border-t border-border mt-auto">
              <SidebarLink icon={LogOut} label="Log Out" href="/login" />
            </div>
          </SheetContent>
        </Sheet>
      </header>

      <main className="flex-1 p-4 md:p-12">
        <div className="max-w-6xl mx-auto space-y-8">
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="text-left">
              <h1 className="font-headline mb-2 text-3xl md:text-5xl">My Events</h1>
              <p className="text-muted-foreground">Manage your upcoming and past experiences.</p>
            </div>
            <Link href="/dashboard/organizer/create" className="no-underline">
              <Button className="rounded-full gap-2 px-6 shadow-lg shadow-primary/20 font-bold">
                <Plus className="w-4 h-4" /> Create New
              </Button>
            </Link>
          </header>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input placeholder="Search your events..." className="pl-10 h-11 bg-card" />
            </div>
            <Button variant="outline" className="rounded-xl gap-2 h-11">
              <Filter className="w-4 h-4" /> Filters
            </Button>
          </div>

          <div className="grid gap-6">
            {MOCK_EVENTS.slice(0, 4).map((event) => (
              <Card key={event.id} className="overflow-hidden border-border hover:border-primary/30 transition-all shadow-sm">
                <CardContent className="p-0 flex flex-col sm:flex-row">
                  <div className="relative w-full sm:w-48 aspect-video sm:aspect-square">
                    <img src={event.image} alt="" className="object-cover w-full h-full" />
                  </div>
                  <div className="flex-1 p-6 flex flex-col justify-between text-left">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <Badge className="bg-primary/10 text-primary border-none uppercase text-[10px] font-black">{event.category}</Badge>
                        <h3 className="font-headline text-xl font-bold">{event.title}</h3>
                        <p className="text-muted-foreground flex items-center gap-1">{event.venue} · {new Date(event.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex flex-wrap items-center gap-y-6 gap-x-8 border-t border-border pt-6">
                      <div className="flex flex-wrap items-center gap-8 flex-1">
                        <div className="space-y-0.5">
                          <span className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Tickets Sold</span>
                          <div className="font-bold">42/100</div>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Revenue</span>
                          <div className="font-bold text-primary">₦210,000</div>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Status</span>
                          <div className="flex items-center gap-1 text-green-500 font-bold text-sm">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500" /> Live
                          </div>
                        </div>
                      </div>

                      <div className="w-full lg:w-auto flex items-center gap-2 lg:ml-auto">
                        <Link href={`/dashboard/organizer/create?id=${event.id}`} className="flex-1 lg:flex-none">
                          <Button variant="outline" size="sm" className="w-full rounded-full h-10 font-bold px-6">Edit</Button>
                        </Link>
                        <Link href={`/events/${event.slug}`} className="flex-1 lg:flex-none">
                           <Button size="sm" variant="ghost" className="w-full rounded-full gap-2 h-10 font-bold px-6">View <ExternalLink className="w-3.5 h-3.5" /></Button>
                        </Link>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="secondary" size="icon" className="rounded-full h-10 w-10 shrink-0" title="More Options">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-52 bg-card border-border">
                            <DropdownMenuItem className="gap-2 font-bold cursor-pointer" asChild>
                              <Link href={`/dashboard/organizer/analytics?id=${event.id}`}>
                                <BarChart3 className="w-4 h-4" /> Detailed Analytics
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 font-bold cursor-pointer" asChild>
                              <Link href={`/dashboard/organizer/vendors?id=${event.id}`}>
                                <Users className="w-4 h-4" /> Manage Vendors
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="gap-2 font-bold text-red-500 hover:text-red-600 cursor-pointer"
                              onClick={() => handleCancelIntent(event)}
                            >
                              <Trash2 className="w-4 h-4" /> Cancel Event
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      {/* Confirmation Dialog */}
      <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <AlertDialogContent className="bg-card border-border sm:rounded-[2.5rem] p-8">
          <AlertDialogHeader className="text-left">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <AlertDialogTitle className="font-headline text-2xl">Cancel this event?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground leading-relaxed">
              This will immediately unlist <strong>{eventToCancel?.title}</strong> and initiate the refund process for all paid ticket holders. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-3 pt-6">
            <AlertDialogCancel className="flex-1 rounded-full font-bold h-11 border-2">Keep Event</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmCancelEvent}
              className="flex-1 rounded-full font-bold h-11 bg-red-500 hover:bg-red-600 text-white border-none"
            >
              Cancel Event
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
