'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth-store';
import { isValidEmail, isStrongPassword } from '@/lib/auth-helpers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export function SupabaseAuth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const { loginWithSupabase } = useAuthStore();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!isValidEmail(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (isSignUp) {
      const passwordValidation = isStrongPassword(password);
      if (!passwordValidation.isValid) {
        toast.error(passwordValidation.message);
        return;
      }
    }

    setLoading(true);

    try {
      let result;
      if (isSignUp) {
        result = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: {
            emailRedirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`
          }
        });
      } else {
        result = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });
      }

      if (result.error) {
        toast.error(result.error.message);
      } else if (result.data.user) {
        if (isSignUp && !result.data.user.email_confirmed) {
          toast.success('Please check your email to confirm your account');
        } else {
          loginWithSupabase(result.data.user);
          toast.success(isSignUp ? 'Account created successfully!' : 'Signed in successfully!');
        }
      }
    } catch (error: unknown) {
      toast.error('An unexpected error occurred');
      console.error('Auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/dashboard`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) {
        toast.error(`Google auth failed: ${error.message}`);
        console.error('Google auth error:', error);
      } else if (data?.url) {
        // Redirect will happen automatically
        toast.success('Redirecting to Google...');
      }
    } catch (error: unknown) {
      toast.error('An unexpected error occurred during Google authentication');
      console.error('Google auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Supabase Authentication</CardTitle>
        <CardDescription>
          {isSignUp ? 'Create a new account' : 'Sign in to your account'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleGoogleAuth}
          disabled={loading}
        >
          Continue with Google
        </Button>

        <div className="text-center">
          <Button
            type="button"
            variant="link"
            onClick={() => setIsSignUp(!isSignUp)}
            disabled={loading}
          >
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
