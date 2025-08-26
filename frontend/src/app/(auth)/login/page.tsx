'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import apiClient from '@/lib/api';
import { useAuthStore } from '@/store/auth-store'; // Import the store
import { toast } from "sonner";



export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const { login } = useAuthStore(); // Get the login function from the store

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await apiClient.post('/token/', { username, password });
      if (response.status === 200) {
        // Use the store's login function
        login(response.data.access, response.data.refresh);
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError('Invalid username or password. Please try again.');
      console.error('Login failed:', err);
      toast.error("Login failed", {
        description: "Please check your username and password.",
      });
    }
  };

  return (
    <Card
        className="w-full max-w-sm rounded-3xl border-none bg-[#E0E5EC] p-2 shadow-neumorphic"
        style={{ background: 'bottom' }}
      >
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-brand-primary">
          Welcome Back
        </CardTitle>
        <CardDescription className="pt-2 text-slate-700">
          Sign in to access your FinPal dashboard
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-6">
          <div className="grid gap-2 text-left">
            <Label htmlFor="username" className="font-semibold text-slate-700">
              Username
            </Label>
            <Input
              id="username"
              placeholder="johndoe"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="rounded-lg border-slate-300 bg-slate-50 text-slate-900 focus:ring-brand-primary"
            />
          </div>
          <div className="grid gap-2 text-left">
            <Label htmlFor="password" className="font-semibold text-slate-700">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg border-slate-300 bg-slate-50 text-slate-900 focus:ring-brand-primary"
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button
            type="submit"
            className="w-full rounded-lg bg-brand-primary text-lg text-white shadow-lg hover:bg-brand-primary/90"
          >
            Login
          </Button>
        </form>
        


        <div className="mt-6 text-center text-sm text-slate-700">
          Don&apos;t have an account?{' '}
          <Link
            href="/signup"
            className="font-semibold text-brand-primary underline-offset-4 hover:underline"
          >
            Sign up
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}