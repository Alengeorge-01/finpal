'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import apiClient from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { DollarSign, CreditCard, Plus } from 'lucide-react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Pie, PieChart, Cell, Legend } from 'recharts';
import { getMonth, parseISO } from 'date-fns';
import { CHART_COLORS } from '@/lib/chart-colors';
import NetWorthChart from '@/components/net-worth-chart';
import UpcomingBills from '@/components/upcoming-bills';
import CashFlowForecastChart from '@/components/cash-flow-forecast-chart';
import SpendingAlerts from '@/components/spending-alerts';

// --- Type Definitions ---
type Account = { id: number; name: string; balance: string; };
type Transaction = { amount: string; transaction_type: 'INCOME' | 'EXPENSE'; date: string; category: number | null; };
type Category = { id: number; name: string; };

// Generic type for a paginated API response
type PaginatedResponse<T> = {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
};

function DashboardSkeleton() {
  return (
    <div>
      <Skeleton className="h-9 w-64" />
      <Skeleton className="mt-2 h-5 w-80" />
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card><CardHeader><Skeleton className="h-5 w-24" /></CardHeader><CardContent><Skeleton className="h-8 w-32" /></CardContent></Card>
        <Card><CardHeader><Skeleton className="h-5 w-24" /></CardHeader><CardContent><Skeleton className="h-8 w-32" /></CardContent></Card>
        <Card><CardHeader><Skeleton className="h-5 w-24" /></CardHeader><CardContent><Skeleton className="h-8 w-32" /></CardContent></Card>
      </div>
      <div className="mt-8">
        <Card>
          <CardHeader><Skeleton className="h-7 w-48" /></CardHeader>
          <CardContent><Skeleton className="h-[350px] w-full" /></CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { status } = useAuthStore();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);


  const fetchData = useCallback(() => {
    if (status !== 'authenticated') return;
    
    setLoading(true);
    
    
    Promise.all([
      apiClient.get('/accounts/'),
      apiClient.get('/transactions/'),
      apiClient.get('/categories/'),
    ]).then(([accountsRes, transactionsRes, categoriesRes]) => {
      // FIX: Extract the 'results' array from the paginated responses
      const paginatedAccounts: PaginatedResponse<Account> = accountsRes.data;
      const paginatedTransactions: PaginatedResponse<Transaction> = transactionsRes.data;
      const paginatedCategories: PaginatedResponse<Category> = categoriesRes.data;

      setAccounts(paginatedAccounts.results);
      setTransactions(paginatedTransactions.results);
      setCategories(paginatedCategories.results);

    }).catch(error => {
      console.error('Failed to fetch dashboard data:', error);
              console.error('Failed to load data:', error);
    }).finally(() => setLoading(false));
  }, [status]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Data Calculations ---
  // This will now work correctly because `accounts` is an array
  const totalBalance = accounts.reduce((sum, account) => sum + parseFloat(account.balance), 0);
  
  const now = new Date();
  const monthlyIncome = transactions
    .filter(t => t.transaction_type === 'INCOME' && new Date(t.date).getMonth() === now.getMonth())
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
  const monthlyExpense = transactions
    .filter(t => t.transaction_type === 'EXPENSE' && new Date(t.date).getMonth() === now.getMonth())
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  
  const pieChartData = useMemo(() => {
    const expenseByCategory: { [key: string]: number } = {};
    transactions
      .filter(t => t.transaction_type === 'EXPENSE' && t.category !== null)
      .forEach(t => {
        const categoryName = categories.find(c => c.id === t.category)?.name || 'Uncategorized';
        if (!expenseByCategory[categoryName]) {
          expenseByCategory[categoryName] = 0;
        }
        expenseByCategory[categoryName] += parseFloat(t.amount);
      });
    return Object.entries(expenseByCategory).map(([name, value]) => ({ name, value }));
  }, [transactions, categories]);

  const barChartData = useMemo(() => {
    const monthlyTotals: { [key: string]: { name: string, income: number, expense: number } } = {};
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    transactions.forEach(t => {
      const monthIndex = getMonth(parseISO(t.date));
      const monthName = monthNames[monthIndex];
      if (!monthlyTotals[monthName]) {
        monthlyTotals[monthName] = { name: monthName, income: 0, expense: 0 };
      }
      if (t.transaction_type === 'INCOME') {
        monthlyTotals[monthName].income += parseFloat(t.amount);
      } else {
        monthlyTotals[monthName].expense += parseFloat(t.amount);
      }
    });
    return Object.values(monthlyTotals);
  }, [transactions]);

  if (loading) return <DashboardSkeleton />;



  return (
    <div>
      <h1 className="text-3xl font-bold text-brand-secondary">Dashboard</h1>
      
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Cash Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalBalance.toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
            <p className="text-xs text-muted-foreground">Across {accounts.length} cash accounts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">This Month's Income</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+${monthlyIncome.toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
            <p className="text-xs text-muted-foreground">Income recorded this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">This Month's Expenses</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">-${monthlyExpense.toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
            <p className="text-xs text-muted-foreground">Expenses recorded this month</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 xl:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
            <CardDescription>Your spending by category for all time.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120}>
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Monthly Overview</CardTitle>
            <CardDescription>Your income vs. expenses per month.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barChartData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                <Tooltip formatter={(value: number) => value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} />
                <Bar dataKey="income" fill="#386BF6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" fill="#111827" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 xl:grid-cols-2">
        <UpcomingBills />
        <SpendingAlerts />
      </div>
      <div className="mt-8 grid grid-cols-1 gap-8 xl:grid-cols-2">
        <NetWorthChart />
        <CashFlowForecastChart />
      </div>

    </div>
  );
}