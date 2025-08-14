'use client';

import { useEffect, useState, useCallback } from 'react';
import apiClient from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { AddAccountDialog } from '@/components/add-account-dialog';
import { EditAccountDialog } from '@/components/edit-account-dialog';
import { toast } from "sonner";

// Type definitions
type Account = {
  id: number;
  name: string;
  account_type: string;
  balance: string;
};

// Generic type for a paginated API response
type PaginatedResponse<T> = {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
};

const PAGE_SIZE = 15;

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // State for pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const fetchAccounts = useCallback((page: number) => {
    setLoading(true);
    apiClient.get(`/accounts/?page=${page}`)
      .then(response => {
        const paginatedData: PaginatedResponse<Account> = response.data;
        setAccounts(paginatedData.results);
        setTotalCount(paginatedData.count);
      })
      .catch(error => {
        console.error('Failed to fetch accounts:', error)
        toast.error("Failed to load accounts.");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchAccounts(currentPage);
  }, [currentPage, fetchAccounts]);

  const handleDelete = async (accountId: number) => {
    setAccounts(currentAccounts => currentAccounts.filter(acc => acc.id !== accountId));
    try {
      await apiClient.delete(`/accounts/${accountId}/`);
      toast.success("Account Deleted");
      // Refetch data for the current page to ensure consistency if the page becomes empty
      fetchAccounts(currentPage);
    } catch (error) {
      console.error('Failed to delete account:', error);
      toast.error("Delete Failed");
      fetchAccounts(currentPage);
    }
  };

  if (loading) return <div>Loading accounts...</div>;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-brand-secondary">Accounts</h1>
          <p className="mt-2 text-slate-500">
            Manage your connected financial accounts.
          </p>
        </div>
        <AddAccountDialog onSuccess={() => fetchAccounts(1)} />
      </div>

      <Card className="mt-8">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell className="font-medium">{account.name}</TableCell>
                  <TableCell>{account.account_type}</TableCell>
                  <TableCell className="text-right">${parseFloat(account.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}</TableCell>
                  <TableCell>
                    <AlertDialog>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <EditAccountDialog account={account} onSuccess={() => fetchAccounts(currentPage)}>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Edit</DropdownMenuItem>
                          </EditAccountDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                          </AlertDialogTrigger>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>This action cannot be undone. This will permanently delete this account and all associated transactions.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(account.id)}>Continue</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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