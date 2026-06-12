"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardDescription, CardFooter } from "@/components/ui/card";
import Link from 'next/link';
import { Mail, Lock, Loader2, ShieldCheck, User, LayoutDashboard, Eye, EyeOff } from 'lucide-react';
import { Logo } from '@/components/logo';
import { MOCK_USERS } from '@/lib/mock-data';
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading('form');
    
    // Simple mock authentication logic
    const user = MOCK_USERS.find(u => u.email === email && u.password === password);
    
    await new Promise(r => setTimeout(r, 1500));
    
    if (user) {
      toast({
        title: "Login Successful",
        description: `Welcome back, ${user.name}!`,
      });
      router.push(user.dashboard);
    } else {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Invalid email or password. Try a Quick Login.",
      });
    }
    setLoading(null);
  };

  const handleQuickLogin = async (user: typeof MOCK_USERS[0]) => {
    setLoading(user.role);
    await new Promise(r => setTimeout(r, 800));
    toast({
      title: "Quick Login Used",
      description: `Logged in as ${user.role}: ${user.name}`,
    });
    router.push(user.dashboard);
    setLoading(null);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-start p-4 pt-32 pb-20">
      <div className="w-full max-w-md space-y-8 text-left">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block mb-4 no-underline">
            <Logo size="lg" className="mx-auto" />
          </Link>
          <p className="text-muted-foreground">Sign in to access your tickets and experiences</p>
        </div>

        <Card className="bg-card border-border shadow-2xl">
          <CardHeader className="space-y-1 text-center">
            <h4 className="text-xl font-headline font-black">Welcome Back</h4>
            <CardDescription>Enter your credentials to continue</CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="name@example.com" 
                    className="pl-10 h-11 bg-secondary/50" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link href="/forgot-password" summer-hint="forgot password" className="text-xs text-primary no-underline font-bold">Forgot password?</Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="password" 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    className="pl-10 pr-10 h-11 bg-secondary/50" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full h-11 rounded-xl mt-4 no-underline" disabled={!!loading}>
                {loading === 'form' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : 'Sign In'}
              </Button>
            </CardContent>
          </form>
          
          <CardFooter className="flex flex-col gap-6">
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground font-black tracking-widest">Quick Login (Testing Only)</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 w-full">
              {MOCK_USERS.map((user) => (
                <Button 
                  key={user.role}
                  variant="outline" 
                  className="rounded-xl no-underline h-10 px-2 justify-start gap-2 text-[10px] font-black uppercase tracking-tighter"
                  onClick={() => handleQuickLogin(user)}
                  disabled={!!loading}
                >
                  {loading === user.role ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    user.role === 'admin' ? <ShieldCheck className="w-3 h-3 text-primary" /> :
                    user.role === 'organizer' ? <LayoutDashboard className="w-3 h-3 text-primary" /> :
                    user.role === 'staff' ? <ShieldCheck className="w-3 h-3 text-accent" /> :
                    <User className="w-3 h-3 text-muted-foreground" />
                  )}
                  {user.role}
                </Button>
              ))}
            </div>

            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground font-bold">Social Login</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 w-full">
              <Button variant="outline" className="rounded-xl no-underline font-bold">Google</Button>
              <Button variant="outline" className="rounded-xl no-underline font-bold">Apple</Button>
            </div>
          </CardFooter>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account? <Link href="/signup" className="text-primary font-bold no-underline">Create Account</Link>
        </p>
      </div>
    </div>
  );
}
