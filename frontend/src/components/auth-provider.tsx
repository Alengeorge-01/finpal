'use client';

import { useAuthStore } from '@/store/auth-store';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status, checkAuth } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  // This effect runs once on the client after the initial render
  useEffect(() => {
    console.log('🚀 AuthProvider mounting, calling checkAuth()');
    setIsMounted(true);
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    console.log('🛡️ AuthProvider effect - mounted:', isMounted, 'status:', status, 'pathname:', pathname);
    
    // Wait until the component is mounted and the auth check is complete
    if (isMounted && status === 'unauthenticated') {
      // Protected routes that require authentication
      const protectedRoutes = ['/dashboard', '/accounts', '/transactions', '/budgets', '/goals', '/investments', '/loans', '/settings', '/ai-planner', '/categories', '/subscriptions', '/search'];
      const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
      
      console.log('🔒 Route protection check - isProtected:', isProtectedRoute, 'route:', pathname);
      
      if (isProtectedRoute) {
        console.log('🚫 Redirecting to login - unauthenticated access to protected route:', pathname);
        router.push('/login');
      }
    } else if (isMounted) {
      console.log('✅ Auth check passed - status:', status, 'pathname:', pathname);
    }
  }, [isMounted, status, pathname, router]);

  // Before the component is mounted, render nothing to avoid mismatch
  if (!isMounted) {
    return null;
  }

  // While checking auth on the client, show a loading state
  if (status === 'loading' && pathname.startsWith('/dashboard')) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
}