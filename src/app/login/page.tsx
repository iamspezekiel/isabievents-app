
"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import Link from 'next/link';
import { ArrowLeft, Mail, Lock } from 'lucide-react';
import { Logo } from '@/components/logo';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-start p-4 pt-32 pb-20">
      <div className="w-full max-w-md space-y-8">
        <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors w-fit">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="text-center space-y-2">
          <Link href="/" className="inline-block mb-4">
            <Logo size="lg" className="mx-auto" />
          </Link>
          <h1 className="text-3xl font-headline">Welcome Back</h1>
          <p className="text-muted-foreground">Sign in to access your tickets and experiences</p>
        </div>

        <Card className="bg-card border-border shadow-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Sign In</CardTitle>
            <CardDescription>Enter your credentials to continue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder="name@example.com" className="pl-10 h-11 bg-secondary/50" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="#" className="text-xs text-primary hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="password" type="password" placeholder="••••••••" className="pl-10 h-11 bg-secondary/50" />
              </div>
            </div>
            <Button className="w-full h-11 rounded-xl mt-4">Sign In</Button>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 w-full">
              <Button variant="outline" className="rounded-xl">Google</Button>
              <Button variant="outline" className="rounded-xl">Apple</Button>
            </div>
          </CardFooter>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account? <Link href="/signup" className="text-primary font-bold hover:underline">Create Account</Link>
        </p>
      </div>
    </div>
  );
}
