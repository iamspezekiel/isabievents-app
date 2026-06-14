
"use client";

import React, { useState } from 'react';
import { Users, Plus, Mail, ShieldCheck, LayoutDashboard, Ticket, BarChart3, Settings, LogOut, Menu, Loader2, User, UserPlus, Trash2, Edit, Phone, Info, ShoppingBag, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Link from 'next/link';
import { Logo } from '@/components/logo';
import { SidebarLink } from '../page';
import { usePathname } from 'next/navigation';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    className={className} 
    fill="currentColor" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.397-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.87 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

export default function VendorsManagementPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const { toast } = useToast();

  const [vendors, setVendors] = useState([
    { id: '1', name: "Main Gate Team", role: "Staff", status: "Active", email: "gate1@isabievents.ng", whatsapp: "+2348000000001" },
    { id: '2', name: "Cold Sips Drinks", role: "Vendor", status: "Active", email: "drinks@vendor.ng", whatsapp: "+2348000000002" },
  ]);

  const [newVendor, setNewVendor] = useState({
    name: '',
    email: '',
    whatsapp: '',
    role: 'Vendor'
  });

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

  const handleAddVendor = async () => {
    if (!newVendor.name || !newVendor.email || !newVendor.whatsapp) {
      toast({
        variant: "destructive",
        title: "Missing fields",
        description: "Please fill in all vendor details including WhatsApp number."
      });
      return;
    }

    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    
    const vendor = {
      id: Math.random().toString(36).substr(2, 9),
      name: newVendor.name,
      email: newVendor.email,
      whatsapp: newVendor.whatsapp,
      role: newVendor.role,
      status: 'Active'
    };

    setVendors([vendor, ...vendors]);
    setIsLoading(false);
    setIsAddDialogOpen(false);
    setNewVendor({ name: '', email: '', whatsapp: '', role: 'Vendor' });
    
    toast({
      title: "Vendor Added",
      description: `${vendor.name} has been invited to manage events.`
    });
  };

  const handleDeleteVendor = (id: string) => {
    setVendors(vendors.filter(v => v.id !== id));
    toast({
      title: "Member Removed",
      description: "The team member has been removed successfully."
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row pt-32">
      {/* Desktop Side Navigation */}
      <aside className="w-64 bg-sidebar border-r border-sidebar-border p-6 flex flex-col hidden md:flex sticky top-0 h-screen overflow-y-auto">
        <Link href="/dashboard/organizer" className="mb-10 block no-underline">
          <Logo size="sm" />
        </Link>
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
            <Button variant="ghost" size="icon">
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
              <h1 className="font-headline mb-2 text-3xl md:text-5xl">Vendors & Staff</h1>
              <p className="text-muted-foreground">Manage service providers and gate staff for your events.</p>
            </div>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-full gap-2 px-6 shadow-lg shadow-primary/20 font-bold h-9 md:h-11">
                  <Plus className="w-4 h-4" /> Add Member
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border sm:rounded-[2rem] max-w-lg w-[94vw] sm:w-full">
                <DialogHeader className="text-left">
                  <DialogTitle className="font-headline text-2xl flex items-center gap-2">
                    <UserPlus className="w-6 h-6 text-primary" /> Invite Team Member
                  </DialogTitle>
                  <DialogDescription>
                    Send an invitation to a vendor or staff member to help manage your event.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-6 text-left">
                  <div className="space-y-2">
                    <Label htmlFor="vendor-name" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Full Name / Brand</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        id="vendor-name" 
                        placeholder="e.g. Sharp Security Ltd" 
                        value={newVendor.name}
                        onChange={(e) => setNewVendor({...newVendor, name: e.target.value})}
                        className="pl-10 h-12 bg-secondary/20 border-border focus-visible:ring-primary rounded-xl"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vendor-email" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        id="vendor-email" 
                        type="email" 
                        placeholder="contact@vendor.ng" 
                        value={newVendor.email}
                        onChange={(e) => setNewVendor({...newVendor, email: e.target.value})}
                        className="pl-10 h-12 bg-secondary/20 border-border focus-visible:ring-primary rounded-xl"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vendor-whatsapp" className="text-xs font-black uppercase tracking-widest text-muted-foreground">WhatsApp Number</Label>
                    <div className="relative">
                      <WhatsAppIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        id="vendor-whatsapp" 
                        placeholder="+234..." 
                        value={newVendor.whatsapp}
                        onChange={(e) => setNewVendor({...newVendor, whatsapp: e.target.value})}
                        className="pl-10 h-12 bg-secondary/20 border-border focus-visible:ring-primary rounded-xl"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vendor-role" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Assigned Role</Label>
                    <div className="relative">
                      <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                      <Select value={newVendor.role} onValueChange={(v) => setNewVendor({...newVendor, role: v})}>
                        <SelectTrigger className="pl-10 h-12 bg-secondary/20 border-border focus:ring-primary rounded-xl">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border">
                          <SelectItem value="Vendor">Vendor (Meals, Merch)</SelectItem>
                          <SelectItem value="Staff">Staff (Gate, Security)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <DialogFooter className="gap-3 sm:gap-0">
                  <Button variant="ghost" onClick={() => setIsAddDialogOpen(false)} className="rounded-full font-bold h-11">Cancel</Button>
                  <Button onClick={handleAddVendor} disabled={isLoading} className="rounded-full px-10 font-bold shadow-xl shadow-primary/20 h-11 flex-1 sm:flex-none">
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Invitation"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </header>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
             {vendors.map((vendor) => (
               <VendorCard 
                 key={vendor.id}
                 vendor={vendor}
                 onDelete={handleDeleteVendor}
               />
             ))}
          </div>

          <Card className="bg-primary/5 border-primary/20 border text-left">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Info className="w-5 h-5 text-primary" /> Role Definitions
              </CardTitle>
              <CardDescription>Understanding the difference between your team members.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-bold flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-primary" /> Staff (Gate Control)</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Staff members manage the attendee flow. They use the Gate Tool to scan entry tickets, verify attendance, and prevent duplicate access.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-bold flex items-center gap-2"><ShoppingBag className="w-4 h-4 text-accent" /> Vendors (On-site Services)</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Vendors verify pre-paid vouchers for items like meals or drinks. Scanning ensures each voucher is fulfilled only once and tracks sales performance.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

function VendorCard({ vendor, onDelete }: any) {
  const { name, role, status } = vendor;
  return (
    <Card className="bg-card border-border hover:border-primary/30 transition-all text-left group">
      <CardContent className="p-6 space-y-6">
        <div className="flex justify-between items-start">
          <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <Badge className={status === 'Active' ? 'bg-green-500/10 text-green-500 border-none' : 'bg-yellow-500/10 text-yellow-500 border-none'}>
            {status}
          </Badge>
        </div>
        <div>
          <h4 className="font-bold text-lg">{name}</h4>
          <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mt-1">{role}</p>
        </div>
        <div className="flex gap-2 pt-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="sm" className="w-full rounded-lg h-9 font-bold">Manage</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-card border-border">
              <DropdownMenuItem className="gap-2 font-bold cursor-pointer">
                <Edit className="w-4 h-4" /> Edit Details
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 font-bold text-red-500 hover:text-red-600 cursor-pointer" onClick={() => onDelete(vendor.id)}>
                <Trash2 className="w-4 h-4" /> Remove Team
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
