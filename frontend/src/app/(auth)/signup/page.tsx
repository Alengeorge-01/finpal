'use client'; // This needs to be a client component to handle user interaction

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
import { toast } from "sonner";




export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent the default form submission
    setError(''); // Reset any previous errors

    try {
      const response = await apiClient.post('/register/', {
        username,
        email,
        password,
      });

      // If registration is successful, redirect to the login page
      if (response.status === 201) {
        router.push('/login');
      }
    } catch (err: any) {
      // Handle errors from the API
      if (err.response && err.response.data) {
        // Extract and display the first error message
        const errorData = err.response.data;
        const firstErrorKey = Object.keys(errorData)[0];
        setError(`${firstErrorKey}: ${errorData[firstErrorKey][0]}`);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
      console.error('Registration failed:', err);
      toast.error("Registration failed", {
        description: "Please check your details and try again.",
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
          Create an Account
        </CardTitle>
        <CardDescription className="pt-2 text-slate-700">
          Start your journey with FinPal today.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* We wrap everything in a form and add the onSubmit handler */}
        <form onSubmit={handleSubmit} className="grid gap-6">
          <div className="grid gap-2 text-left">
            <Label htmlFor="full-name" className="font-semibold text-slate-700">
              Username
            </Label>
            <Input
              id="full-name"
              placeholder="johndoe"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="rounded-lg border-slate-300 bg-slate-50 text-slate-900 focus:ring-brand-primary"
            />
          </div>
          <div className="grid gap-2 text-left">
            <Label htmlFor="email" className="font-semibold text-slate-700">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            Create Account
          </Button>
        </form>



        <div className="mt-6 text-center text-sm text-slate-700">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-semibold text-brand-primary underline-offset-4 hover:underline"
          >
            Log in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}