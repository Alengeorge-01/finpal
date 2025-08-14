'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Wallet } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';

export default function Header() {
  const { status } = useAuthStore(); // Use status instead of isLoggedIn
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 p-4 backdrop-blur-sm">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Wallet className="h-6 w-6 text-brand-primary" />
          <span className="text-xl font-bold text-brand-secondary">
            FinPal
          </span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          <Link
            href="/#features"
            className="text-slate-600 transition-colors hover:text-black"
          >
            Features
          </Link>
          <Link
            href="#"
            className="text-slate-600 transition-colors hover:text-black"
          >
            Pricing
          </Link>
          <Link
            href="#"
            className="text-slate-600 transition-colors hover:text-black"
          >
            Contact
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          {status === 'authenticated' ? (
            <Link href="/dashboard">
              <Button>Go to Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="outline">Login</Button>
              </Link>
              <Link href="/signup">
                <Button>Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}