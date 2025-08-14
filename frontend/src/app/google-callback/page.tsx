'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import apiClient from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import { toast } from "sonner";

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuthStore();

  useEffect(() => {
    const code = searchParams.get('code');

    if (code) {
      apiClient.post('/auth/google/', { code })
        .then(response => {
          // The backend returns our app's access and refresh tokens
          const { access, refresh } = response.data;
          login(access, refresh);
          toast.success("Login Successful", {
            description: "Welcome back to FinPal!",
          });
          router.push('/dashboard');
        })
        .catch(error => {
          console.error("Google login failed:", error);
          toast.error("Login Failed", {
            description: "There was a problem logging in with Google. Please try again.",
          });
          router.push('/login');
        });
    }
  }, [searchParams, router, login]);

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <p>Logging you in with Google, please wait...</p>
    </div>
  );
}