'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function AuthCallback() {
  const router = useRouter();
  const { loginWithSupabase } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          toast.error('Authentication failed');
          router.push('/login');
          return;
        }

        if (data.session?.user) {
          loginWithSupabase(data.session.user);
          toast.success('Successfully authenticated!');
          router.push('/dashboard');
        } else {
          toast.error('No user session found');
          router.push('/login');
        }
      } catch (error) {
        console.error('Unexpected auth error:', error);
        toast.error('An unexpected error occurred');
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    // Handle the auth callback
    handleAuthCallback();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          loginWithSupabase(session.user);
          router.push('/dashboard');
        } else if (event === 'SIGNED_OUT') {
          router.push('/login');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [router, loginWithSupabase]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Processing Authentication</CardTitle>
            <CardDescription>
              Please wait while we complete your sign-in...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Authentication Complete</CardTitle>
          <CardDescription>
            Redirecting you to the dashboard...
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
