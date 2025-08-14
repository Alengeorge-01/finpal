'use client';

import { useEffect, useState, useCallback } from 'react';
import apiClient from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import { AddLoanDialog } from '@/components/add-loan-dialog';
import { EditLoanDialog } from '@/components/edit-loan-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import Link from 'next/link';
import { differenceInDays, parseISO } from 'date-fns';
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Import Tabs
import DebtOptimizer from '@/components/debt-optimizer';

// --- Type Definitions ---
type LoanPayment = { id: number; date: string; amount: string; };
type LoanDisbursement = { id: number; date: string; amount: string; };
type Loan = {
  id: number;
  name: string;
  slug: string;
  interest_rate: string;
  repayment_start_date: string;
  payments: LoanPayment[];
  disbursements: LoanDisbursement[];
  current_balance?: number;
};

// Generic type for a paginated API response
type PaginatedResponse<T> = {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
};

const PAGE_SIZE = 15;

export default function LoansPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // State for pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const calculateCurrentBalance = (loan: Loan): number => {
    const allEvents = [
      ...loan.disbursements.map(d => ({ type: 'disbursement', date: parseISO(d.date), amount: parseFloat(d.amount) })),
      ...loan.payments.map(p => ({ type: 'payment', date: parseISO(p.date), amount: parseFloat(p.amount) }))
    ].sort((a, b) => a.date.getTime() - b.date.getTime());

    if (allEvents.length === 0) return 0;

    let balance = 0;
    let lastEventDate = allEvents[0].date;
    const dailyRate = parseFloat(loan.interest_rate) / 100 / 365;

    allEvents.forEach(event => {
      const days = differenceInDays(event.date, lastEventDate);
      if (days > 0 && balance > 0) {
        balance += balance * dailyRate * days;
      }
      if (event.type === 'disbursement') {
        balance += event.amount;
      } else {
        balance -= event.amount;
      }
      lastEventDate = event.date;
    });

    const days = differenceInDays(new Date(), lastEventDate);
    if (days > 0 && balance > 0) {
      balance += balance * dailyRate * days;
    }

    return balance > 0 ? balance : 0;
  };

  const fetchLoans = useCallback(async (page: number) => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/loans/?page=${page}`);
      // FIX: Extract the 'results' array from the paginated response
      const paginatedData: PaginatedResponse<Loan> = response.data;
      const loansData = paginatedData.results;
      
      loansData.forEach(loan => {
        loan.current_balance = calculateCurrentBalance(loan);
      });
      setLoans(loansData);
      setTotalCount(paginatedData.count);
    } catch (error) {
      console.error('Failed to fetch loans:', error);
      toast.error("Failed to load loans.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLoans(currentPage);
  }, [currentPage, fetchLoans]);

  const handleDelete = async (loanId: number) => {
    setLoans(currentLoans => currentLoans.filter(l => l.id !== loanId));
    try {
      await apiClient.delete(`/loans/${loanId}/`);
      toast.success("Loan Deleted");
      fetchLoans(currentPage);
    } catch (error) {
      toast.error("Delete Failed");
      fetchLoans(currentPage);
    }
  };

  if (loading) return <div>Loading loan data...</div>;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-brand-secondary">Loans & Debt</h1>
          <p className="mt-2 text-slate-500">Manage your mortgages, car loans, and other debts.</p>
        </div>
        <AddLoanDialog onSuccess={() => fetchLoans(1)} />
      </div>
      <Tabs defaultValue="overview" className="mt-8">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="optimizer">Optimizer</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {loans.map((loan) => {
                const totalDisbursed = loan.disbursements.reduce((sum, d) => sum + parseFloat(d.amount), 0);
                return (
                    <Card key={loan.id} className="flex flex-col">
                        <CardHeader className="flex flex-row items-start justify-between">
                        <div>
                            <CardTitle>{loan.name}</CardTitle>
                            <CardDescription>
                            {loan.interest_rate}% APR
                            </CardDescription>
                        </div>
                        <AlertDialog>
                            <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0">
                                <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <EditLoanDialog loan={loan} onSuccess={() => fetchLoans(currentPage)}>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Edit</DropdownMenuItem>
                                </EditLoanDialog>
                                <AlertDialogTrigger asChild>
                                <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                                </AlertDialogTrigger>
                            </DropdownMenuContent>
                            </DropdownMenu>
                            <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>This action will permanently delete this loan and all of its associated payments.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(loan.id)}>Continue</AlertDialogAction>
                            </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        </CardHeader>
                        <CardContent className="flex flex-grow flex-col justify-end">
                        <Link href={`/loans/${loan.id}`} className="block hover:bg-slate-50/50 p-4 rounded-md -m-4">
                            <div className="text-sm text-slate-500">Current Balance</div>
                            <div className="text-3xl font-bold">
                            {loan.current_balance?.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                            </div>
                            <div className="mt-4 text-sm text-slate-500">Total Disbursed</div>
                            <div className="text-lg font-semibold">
                            {totalDisbursed.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                            </div>
                        </Link>
                        </CardContent>
                    </Card>
                )
            })}
          </div>
        </TabsContent>
        <TabsContent value="optimizer">
          <div className="mt-8">
            <DebtOptimizer />
          </div>
        </TabsContent>
      </Tabs>
      
      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''} />
          </PaginationItem>
          <PaginationItem>
              <span className="p-2 text-sm text-slate-500">Page {currentPage} of {totalPages}</span>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} className={currentPage === totalPages || totalPages === 0 ? 'pointer-events-none opacity-50' : ''} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}