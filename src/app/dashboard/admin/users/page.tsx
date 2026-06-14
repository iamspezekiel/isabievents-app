
"use client";

import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Ticket, 
  BarChart3, 
  Settings, 
  LogOut, 
  ShieldCheck, 
  Search, 
  Menu, 
  MoreVertical,
  Mail,
  UserPlus,
  Filter,
  BadgeCheck,
  Ban,
  Clock,
  Loader2,
  CheckCircle2,
  User
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from '@/components/logo';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MOCK_USERS } from '@/lib/mock-data';
import { SidebarLink } from '../page';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

export default function AdminUserManagement() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const pathname = usePathname();
  const { toast } = useToast();

  const [newAdmin, setNewAdmin] = useState({
    name: '',
    email: '',
  });

  const NavigationLinks = () => (
    <nav className="flex-1 space-y-1">
      <div className="pb-2">
        <SidebarLink icon={LayoutDashboard} label="Global Overview" href="/dashboard/admin" active={pathname === '/dashboard/admin'} />
        <SidebarLink icon={Users} label="User Management" href="/dashboard/admin/users" active={pathname === '/dashboard/admin/users'} />
        <SidebarLink icon={ShieldCheck} label="Organizer KYC" href="/dashboard/admin/kyc" active={pathname === '/dashboard/admin/kyc'} />
        <SidebarLink icon={Ticket} label="Event Moderation" href="/dashboard/admin/events" active={pathname === '/dashboard/admin/events'} />
        <SidebarLink icon={BarChart3} label="Financial Reports" href="/dashboard/admin/reports" active={pathname === '/dashboard/admin/reports'} />
        <SidebarLink icon={Settings} label="System Settings" href="/dashboard/admin/settings" active={pathname === '/dashboard/admin/settings'} />
      </div>
    </nav>
  );

  const filteredUsers = MOCK_USERS.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdmin.name || !newAdmin.email) {
      toast({
        variant: "destructive",
        title: "Missing fields",
        description: "Please provide both a name and an email address."
      });
      return;
    }

    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 1500));
    setIsSubmitting(false);
    setIsAddDialogOpen(false);
    setNewAdmin({ name: '', email: '' });

    toast({
      title: "Admin Invited",
      description: `An invitation has been sent to ${newAdmin.email}.`
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row pt-40">
      {/* Desktop Side Navigation */}
      <aside className="w-64 bg-sidebar border-r border-sidebar-border p-6 flex flex-col hidden md:flex sticky top-0 h-screen overflow-y-auto">
        <div className="mb-10">
          <Link href="/dashboard/admin" className="no-underline">
            <Logo size="sm" />
          </Link>
          <div className="mt-2 text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-1 rounded inline-block">
            Master Console
          </div>
        </div>
        <NavigationLinks />
        <div className="pt-6 border-t border-sidebar-border mt-auto">
          <SidebarLink icon={LogOut} label="Log Out" href="/login" />
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 bg-card border-b border-border sticky top-0 z-40">
        <Link href="/dashboard/admin" className="no-underline">
          <Logo size="sm" />
        </Link>
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 bg-card border-border p-6 flex flex-col overflow-y-auto">
            <SheetHeader className="text-left mb-10">
              <SheetTitle>
                <Link href="/dashboard/admin" className="no-underline" onClick={() => setIsMobileMenuOpen(false)}>
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

      <main className="flex-1 p-4 md:p-12 overflow-x-hidden">
        <div className="max-w-6xl mx-auto space-y-8">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="text-left space-y-1">
              <h1 className="font-headline text-3xl md:text-5xl">User Directory</h1>
              <p className="text-muted-foreground font-medium">Manage all platform participants and their permission levels.</p>
            </div>
            <div className="flex items-center gap-3">
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="rounded-full shadow-lg shadow-primary/20 h-11 font-bold gap-2">
                    <UserPlus className="w-4 h-4" /> Add Admin
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-border sm:rounded-[2rem] max-w-md w-[94vw] sm:w-full">
                  <DialogHeader className="text-left">
                    <DialogTitle className="font-headline text-2xl flex items-center gap-2">
                      <ShieldCheck className="w-6 h-6 text-primary" /> Invite New Admin
                    </DialogTitle>
                    <DialogDescription>
                      Assign administrative privileges to a new team member. They will have full access to the Master Console.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddAdmin} className="space-y-6 py-6 text-left">
                    <div className="space-y-2">
                      <Label htmlFor="admin-name" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input 
                          id="admin-name" 
                          placeholder="e.g. Sylvanus Ezekiel" 
                          value={newAdmin.name}
                          onChange={(e) => setNewAdmin({...newAdmin, name: e.target.value})}
                          className="pl-10 h-12 bg-secondary/20 border-border focus-visible:ring-primary rounded-xl"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="admin-email" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input 
                          id="admin-email" 
                          type="email"
                          placeholder="admin@isabievents.ng" 
                          value={newAdmin.email}
                          onChange={(e) => setNewAdmin({...newAdmin, email: e.target.value})}
                          className="pl-10 h-12 bg-secondary/20 border-border focus-visible:ring-primary rounded-xl"
                        />
                      </div>
                    </div>
                    <DialogFooter className="gap-3 sm:gap-0">
                      <Button type="button" variant="ghost" onClick={() => setIsAddDialogOpen(false)} className="rounded-full font-bold h-11">Cancel</Button>
                      <Button type="submit" disabled={isSubmitting} className="rounded-full px-10 font-bold shadow-xl shadow-primary/20 h-11 flex-1 sm:flex-none">
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Invite"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </header>

          <Card className="border-border bg-card">
            <CardContent className="p-0">
              <div className="p-4 md:p-6 border-b border-border flex flex-row gap-3 md:gap-4 justify-between items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search by name, email or ID..." 
                    className="pl-9 h-11 bg-secondary/30 rounded-xl border-none text-xs md:text-sm" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="rounded-xl h-11 px-3 md:px-4 gap-2 font-bold">
                    <Filter className="w-4 h-4" /> <span className="hidden sm:inline">Filter</span>
                  </Button>
                </div>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/20 hover:bg-secondary/20">
                    <TableHead className="font-black text-[10px] uppercase tracking-widest pl-6">User</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-widest">Role</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-widest">Status</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-widest">Verified</TableHead>
                    <TableHead className="text-right pr-6"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.email} className="group hover:bg-secondary/10 transition-colors">
                      <TableCell className="pl-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                            {user.name.charAt(0)}
                          </div>
                          <div className="text-left">
                            <div className="font-bold text-sm">{user.name}</div>
                            <div className="text-xs text-muted-foreground">{user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize font-bold text-[10px] rounded-md border-primary/20 bg-primary/5 text-primary">
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          <span className="text-xs font-bold">Active</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.role === 'organizer' || user.role === 'admin' ? (
                          <BadgeCheck className="w-5 h-5 text-accent" />
                        ) : (
                          <div className="text-muted-foreground/30">—</div>
                        )}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 bg-card border-border">
                            <DropdownMenuItem className="gap-2 font-bold cursor-pointer">
                              <Mail className="w-4 h-4" /> Message User
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 font-bold cursor-pointer">
                              <Settings className="w-4 h-4" /> Edit Permissions
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 font-bold text-red-500 hover:text-red-600 cursor-pointer">
                              <Ban className="w-4 h-4" /> Deactivate Account
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
