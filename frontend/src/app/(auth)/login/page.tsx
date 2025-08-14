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

const GoogleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 48 48">
<path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
</svg>
);

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
        
        <div className="my-4 flex items-center">
          <div className="flex-grow border-t border-slate-300"></div>
          <span className="mx-4 flex-shrink text-xs uppercase text-slate-500">Or continue with</span>
          <div className="flex-grow border-t border-slate-300"></div>
        </div>

        <a href="http://localhost:8000/accounts/google/login/?process=login" className="w-full">
          <Button variant="outline" className="w-full">
            <GoogleIcon />
            <span className="ml-2">Sign in with Google</span>
          </Button>
        </a>

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