'use client';

import { useEffect, useState, useCallback } from 'react';
import apiClient from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { AddBudgetDialog } from '@/components/add-budget-dialog';
import { MoreHorizontal } from 'lucide-react';
import { EditBudgetDialog } from '@/components/edit-budget-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { format, parseISO, isWithinInterval } from 'date-fns';
import { toast } from "sonner";

// Type definitions
type Category = { id: number; name: string };
type Transaction = {
  amount: string;
  transaction_type: 'INCOME' | 'EXPENSE';
  date: string;
  category: number | null;
};
type Budget = {
  id: number;
  category: number;
  amount: string;
  start_date: string;
  end_date: string;
};

// Generic type for any paginated API response
type PaginatedResponse<T> = {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
};

const PAGE_SIZE = 15; // Should match your backend PAGE_SIZE

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // State for pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const fetchData = useCallback((page: number) => {
    setLoading(true);
    Promise.all([
      apiClient.get(`/budgets/?page=${page}`),
      apiClient.get('/transactions/'), // Note: Fetching all transactions for calculation
      apiClient.get('/categories/'),
    ]).then(([budgetsRes, transactionsRes, categoriesRes]) => {
      const paginatedBudgets: PaginatedResponse<Budget> = budgetsRes.data;
      setBudgets(paginatedBudgets.results);
      setTotalCount(paginatedBudgets.count);

      // We need all transactions for calculations, so we handle its pagination if needed
      setTransactions(transactionsRes.data.results || transactionsRes.data);
      setCategories(categoriesRes.data.results || categoriesRes.data);
    }).catch(error => {
      console.error('Failed to fetch data:', error);
      toast.error("Failed to load data.");
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage, fetchData]);

  const handleDelete = async (budgetId: number) => {
    setBudgets(currentBudgets => currentBudgets.filter(b => b.id !== budgetId));
    try {
      await apiClient.delete(`/budgets/${budgetId}/`);
      toast.success("Budget Deleted");
      fetchData(currentPage);
    } catch (error) {
      console.error('Failed to delete budget:', error);
      toast.error("Delete Failed");
      fetchData(currentPage);
    }
  };

  const getCategoryName = (categoryId: number): string => {
    return categories.find(c => c.id === categoryId)?.name || 'N/A';
  };

  const calculateSpentAmount = (budget: Budget): number => {
    return transactions
      .filter(t => 
        t.category === budget.category &&
        t.transaction_type === 'EXPENSE' &&
        isWithinInterval(parseISO(t.date), {
          start: parseISO(budget.start_date),
          end: parseISO(budget.end_date),
        })
      )
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  };

  if (loading) return <div>Loading budgets...</div>;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-brand-secondary">Budgets</h1>
          <p className="mt-2 text-slate-500">Track your spending against your goals.</p>
        </div>
        <AddBudgetDialog categories={categories} onSuccess={() => fetchData(1)} />
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {budgets.map(budget => {
          const spentAmount = calculateSpentAmount(budget);
          const budgetAmount = parseFloat(budget.amount);
          const progress = budgetAmount > 0 ? (spentAmount / budgetAmount) * 100 : 0;
          const remainingAmount = budgetAmount - spentAmount;

          return (
            <Card key={budget.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{getCategoryName(budget.category)}</span>
                  <AlertDialog>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <EditBudgetDialog budget={budget} categories={categories} onSuccess={() => fetchData(currentPage)}>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Edit</DropdownMenuItem>
                        </EditBudgetDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                        </AlertDialogTrigger>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>This action will permanently delete this budget.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(budget.id)}>Continue</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardTitle>
                <p className={`text-sm ${remainingAmount < 0 ? 'text-red-500' : 'text-slate-500'}`}>
                  {remainingAmount < 0 ? `-$${Math.abs(remainingAmount).toFixed(2)} over budget` : `$${remainingAmount.toFixed(2)} remaining`}
                </p>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-slate-500">
                  ${spentAmount.toFixed(2)} spent of ${budgetAmount.toFixed(2)}
                </div>
                <Progress value={progress > 100 ? 100 : progress} className="mt-2" />
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''} />
          </PaginationItem>
          <PaginationItem>
              <span className="p-2 text-sm text-slate-500">Page {currentPage} of {totalPages}</span>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}