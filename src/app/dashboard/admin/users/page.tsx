
"use client";

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Mail, 
  UserPlus, 
  Filter, 
  BadgeCheck, 
  Ban, 
  Loader2, 
  User,
  ShieldCheck,
  MoreVertical,
  Settings
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
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
import { apiFetch } from '@/lib/api-fetch';
import { useAuth } from '@/components/auth-provider';
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
import { Trash2, Power, PowerOff } from 'lucide-react';

interface UserRow {
  uid: string;
  name: string;
  email: string;
  role: string;
  disabled?: boolean;
}

export default function AdminUserManagement() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const { profile } = useAuth();

  const [users, setUsers] = useState<UserRow[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [userToDelete, setUserToDelete] = useState<UserRow | null>(null);
  const [busyUid, setBusyUid] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'organizer' | 'attendee'>('all');

  const [newAdmin, setNewAdmin] = useState({
    name: '',
    email: '',
  });

  useEffect(() => {
    apiFetch('/api/admin/users')
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d?.users)) setUsers(d.users as UserRow[]);
        if (d?.error) toast({variant: "destructive", title: "Could not load users", description: d.error});
      })
      .catch(() => undefined)
      .finally(() => setLoadingUsers(false));
  }, [toast]);

  const filteredUsers = users.filter(user => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = user.name.toLowerCase().includes(q) || user.email.toLowerCase().includes(q);
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Activate / deactivate an account in Firebase Auth.
  const handleToggleDisabled = async (user: UserRow) => {
    setBusyUid(user.uid);
    try {
      const next = !user.disabled;
      const res = await apiFetch('/api/admin/users', {
        method: 'PATCH',
        body: JSON.stringify({uid: user.uid, disabled: next}),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to update account.');
      setUsers(prev => prev.map(u => u.uid === user.uid ? {...u, disabled: next} : u));
      toast({
        title: next ? 'Account Deactivated' : 'Account Reactivated',
        description: next
          ? `${user.email} can no longer sign in.`
          : `${user.email} can sign in again.`,
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: err instanceof Error ? err.message : 'Please try again.',
      });
    } finally {
      setBusyUid(null);
    }
  };

  // Permanently delete an account (Firebase Auth + profile doc).
  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    const target = userToDelete;
    setBusyUid(target.uid);
    try {
      const res = await apiFetch('/api/admin/users', {
        method: 'DELETE',
        body: JSON.stringify({uid: target.uid}),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to delete account.');
      setUsers(prev => prev.filter(u => u.uid !== target.uid));
      toast({
        variant: "destructive",
        title: "Account Deleted",
        description: `${target.email} has been permanently removed.`,
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: err instanceof Error ? err.message : 'Please try again.',
      });
    } finally {
      setBusyUid(null);
      setUserToDelete(null);
    }
  };

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
    try {
      const res = await apiFetch('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify(newAdmin),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to create admin.');

      setUsers(prev => [...prev, {uid: data.uid, name: newAdmin.name, email: data.email, role: 'admin'}]
        .sort((a, b) => a.name.localeCompare(b.name)));
      setIsAddDialogOpen(false);
      setNewAdmin({ name: '', email: '' });
      toast({
        title: "Admin Account Created",
        description: `${data.email} — temporary password: ${data.tempPassword}. Share it securely.`
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Failed to Create Admin",
        description: err instanceof Error ? err.message : 'Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 pb-16 md:p-12 md:pb-16 space-y-8">
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
                      placeholder="admin@events.isabi.cloud" 
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
        <CardContent className="p-0 overflow-x-auto">
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="rounded-xl h-11 px-3 md:px-4 gap-2 font-bold">
                    <Filter className="w-4 h-4" /> <span className="hidden sm:inline">{roleFilter === 'all' ? 'Filter' : roleFilter}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-card border-border">
                  {(['all', 'admin', 'organizer', 'attendee'] as const).map((r) => (
                    <DropdownMenuItem
                      key={r}
                      className="gap-2 font-bold cursor-pointer capitalize"
                      onClick={() => setRoleFilter(r)}
                    >
                      {r === 'all' ? 'All Roles' : `${r}s`}
                      {roleFilter === r && <BadgeCheck className="w-4 h-4 text-primary" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          <Table className="min-w-[720px]">
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
                      <div className={`w-2 h-2 rounded-full ${user.disabled ? 'bg-red-500' : 'bg-green-500'}`} />
                      <span className="text-xs font-bold">{user.disabled ? 'Disabled' : 'Active'}</span>
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
                      <DropdownMenuContent align="end" className="w-56 bg-card border-border">
                        <DropdownMenuItem
                          className="gap-2 font-bold cursor-pointer"
                          onClick={() => { window.location.href = `mailto:${user.email}`; }}
                        >
                          <Mail className="w-4 h-4" /> Message User
                        </DropdownMenuItem>
                        {profile?.uid !== user.uid && (
                          <>
                            <DropdownMenuItem
                              className="gap-2 font-bold cursor-pointer"
                              disabled={busyUid === user.uid}
                              onClick={() => handleToggleDisabled(user)}
                            >
                              {user.disabled
                                ? <><Power className="w-4 h-4" /> Reactivate Account</>
                                : <><PowerOff className="w-4 h-4" /> Deactivate Account</>}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="gap-2 font-bold text-red-500 hover:text-red-600 cursor-pointer"
                              onClick={() => setUserToDelete(user)}
                            >
                              <Trash2 className="w-4 h-4" /> Delete Account
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this account?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{userToDelete?.email}&quot; — the Firebase Auth login and
              their profile. Tickets and orders are kept for financial records. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmDeleteUser();
              }}
              className="bg-red-500 hover:bg-red-600 text-white border-none font-bold"
            >
              {busyUid === userToDelete?.uid ? 'Deleting…' : 'Delete Account'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
