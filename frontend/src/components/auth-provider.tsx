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
    setIsMounted(true);
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    // Wait until the component is mounted and the auth check is complete
    if (isMounted && status === 'unauthenticated' && pathname.startsWith('/dashboard')) {
      router.push('/login');
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