'use client'; 

import Link from 'next/link';
import { usePathname } from 'next/navigation'; // Import the hook
import {
  ArrowLeftRight,
  Landmark,
  LayoutDashboard,
  Wallet,
  Target,
  Tags,
  TrendingUp,
  ReceiptText,
  Repeat,
  BrainCircuit,
  Award,
  Search,
} from 'lucide-react';
import { useSidebarStore } from '@/store/sidebar-store';
import { cn } from '@/lib/utils';

export default function Sidebar() {
  const { isCollapsed } = useSidebarStore();
  const pathname = usePathname(); // Get the current path

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col border-r bg-white p-6 transition-all duration-300',
        isCollapsed ? 'w-20 items-center' : 'w-64'
      )}
    >
      <Link href="/dashboard" className={cn('mb-12 flex items-center', isCollapsed ? 'justify-center' : '')}>
        <Wallet className="h-8 w-8 text-brand-primary" />
        <span className={cn('ml-2 text-2xl font-bold text-brand-secondary', isCollapsed && 'hidden')}>
          FinPal
        </span>
      </Link>
      <nav className="flex flex-col gap-4">
        <Link
          href="/dashboard"
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 font-semibold',
            isCollapsed && 'justify-center',
            // Conditionally apply active styles
            pathname === '/dashboard'
              ? 'bg-brand-primary text-white'
              : 'text-slate-500 transition-all hover:bg-brand-primary/10 hover:text-brand-primary'
          )}
        >
          <LayoutDashboard className="h-5 w-5" />
          <span className={cn(isCollapsed && 'hidden')}>Dashboard</span>
        </Link>
        <Link
          href="/transactions"
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 font-semibold',
            isCollapsed && 'justify-center',
            // Conditionally apply active styles
            pathname === '/transactions'
              ? 'bg-brand-primary text-white'
              : 'text-slate-500 transition-all hover:bg-brand-primary/10 hover:text-brand-primary'
          )}
        >
          <ArrowLeftRight className="h-5 w-5" />
          <span className={cn(isCollapsed && 'hidden')}>Transactions</span>
        </Link>
        <Link
          href="/accounts"
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 font-semibold',
            isCollapsed && 'justify-center',
            // Conditionally apply active styles for the accounts page later
            pathname === '/accounts'
              ? 'bg-brand-primary text-white'
              : 'text-slate-500 transition-all hover:bg-brand-primary/10 hover:text-brand-primary'
          )}
        >
          <Landmark className="h-5 w-5" />
          <span className={cn(isCollapsed && 'hidden')}>Accounts</span>
        </Link>
        <Link
          href="/budgets"
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 font-semibold',
            isCollapsed && 'justify-center',
            pathname === '/budgets'
              ? 'bg-brand-primary text-white'
              : 'text-slate-500 transition-all hover:bg-brand-primary/10 hover:text-brand-primary'
          )}
        >
          <Target className="h-5 w-5" />
          <span className={cn(isCollapsed && 'hidden')}>Budgets</span>
        </Link>
        <Link
          href="/categories"
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 font-semibold',
            isCollapsed && 'justify-center',
            pathname === '/categories'
              ? 'bg-brand-primary text-white'
              : 'text-slate-500 transition-all hover:bg-brand-primary/10 hover:text-brand-primary'
          )}
        >
          <Tags className="h-5 w-5" />
          <span className={cn(isCollapsed && 'hidden')}>Categories</span>
        </Link>
        <Link
          href="/investments"
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 font-semibold',
            isCollapsed && 'justify-center',
            pathname === '/investments'
              ? 'bg-brand-primary text-white'
              : 'text-slate-500 transition-all hover:bg-brand-primary/10 hover:text-brand-primary'
          )}
        >
          <TrendingUp className="h-5 w-5" />
          <span className={cn(isCollapsed && 'hidden')}>Investments</span>
        </Link>
        <Link
          href="/loans"
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 font-semibold',
            isCollapsed && 'justify-center',
            pathname === '/loans'
              ? 'bg-brand-primary text-white'
              : 'text-slate-500 transition-all hover:bg-brand-primary/10 hover:text-brand-primary'
          )}
        >
          <ReceiptText className="h-5 w-5" />
          <span className={cn(isCollapsed && 'hidden')}>Loans</span>
        </Link>
        <Link
          href="/subscriptions"
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 font-semibold',
            isCollapsed && 'justify-center',
            pathname === '/subscriptions'
              ? 'bg-brand-primary text-white'
              : 'text-slate-500 transition-all hover:bg-brand-primary/10 hover:text-brand-primary'
          )}
        >
          <Repeat className="h-5 w-5" />
          <span className={cn(isCollapsed && 'hidden')}>Subscriptions</span>
        </Link>
        <Link
          href="/ai-planner"
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 font-semibold',
            isCollapsed && 'justify-center',
            pathname === '/ai-planner'
              ? 'bg-brand-primary text-white'
              : 'text-slate-500 transition-all hover:bg-brand-primary/10 hover:text-brand-primary'
          )}
        >
          <BrainCircuit className="h-5 w-5" />
          <span className={cn(isCollapsed && 'hidden')}>AI Planner</span>
        </Link>
        <Link
          href="/goals"
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 font-semibold',
            isCollapsed && 'justify-center',
            pathname === '/goals'
              ? 'bg-brand-primary text-white'
              : 'text-slate-500 transition-all hover:bg-brand-primary/10 hover:text-brand-primary'
          )}
        >
          <Award className="h-5 w-5" />
          <span className={cn(isCollapsed && 'hidden')}>Goals</span>
        </Link>
        <Link
          href="/search"
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 font-semibold',
            isCollapsed && 'justify-center',
            pathname === '/search'
              ? 'bg-brand-primary text-white'
              : 'text-slate-500 transition-all hover:bg-brand-primary/10 hover:text-brand-primary'
          )}
        >
          <Search className="h-5 w-5" />
          <span className={cn(isCollapsed && 'hidden')}>Search</span>
        </Link>
      </nav>
    </aside>
  );
}