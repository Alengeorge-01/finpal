'use client';

import { useEffect, useState, useCallback } from 'react';
import apiClient from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, CalendarIcon, MoreHorizontal, Plus } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { EditTransactionDialog } from '@/components/edit-transaction-dialog';
import { TransactionCSVUploadDialog } from '@/components/transaction-csv-upload-dialog';
import { format, parseISO } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from "sonner";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useDebounce } from 'use-debounce';

// Define types for our data
type Account = { id: number; name: string; };
type Category = { id: number; name: string; };
type Transaction = {
  id: number;
  description: string;
  amount: string;
  transaction_type: "INCOME" | "EXPENSE";
  date: string;
  account: number;
  category: number | null;
  account_name?: string;
};

// Generic type for any paginated API response
type PaginatedResponse<T> = {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState<boolean>(false);
  const [newCategoryName, setNewCategoryName] = useState<string>('');

  // State for the "Add Transaction" form
  const [description, setDescription] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [type, setType] = useState<string>('');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [accountId, setAccountId] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');

  // State for pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  const [debouncedDescription] = useDebounce(description, 500); // Wait 500ms after user stops typing

  useEffect(() => {
    const suggestCategory = async () => {
      if (debouncedDescription.length > 3 && isAddDialogOpen) { // Only run when dialog is open
        try {
          const res = await apiClient.get(`/ai/suggest-category/?description=${debouncedDescription}`);
          if (res.data && res.data.id) {
            setCategoryId(String(res.data.id)); // Set the suggested category
            toast.info(`Suggested category: ${res.data.name}`);
          }
        } catch (error) {
          console.error("Category suggestion failed:", error);
        }
      }
    };
    suggestCategory();
  }, [debouncedDescription, isAddDialogOpen]);

  const fetchData = useCallback((page: number) => {
    setLoading(true);
    Promise.all([
      apiClient.get(`/transactions/?page=${page}`),
      apiClient.get('/accounts/'),
      apiClient.get('/categories/'),
    ]).then(([transactionsRes, accountsRes, categoriesRes]) => {
      const paginatedTransactions: PaginatedResponse<Transaction> = transactionsRes.data;
      setTransactions(paginatedTransactions.results);
      setTotalCount(paginatedTransactions.count);
      setTotalPages(Math.ceil(paginatedTransactions.count / 15));

      // FIX: Extract the 'results' array for accounts and categories
      const paginatedAccounts: PaginatedResponse<Account> = accountsRes.data;
      setAccounts(paginatedAccounts.results);
      
      const paginatedCategories: PaginatedResponse<Category> = categoriesRes.data;
      setCategories(paginatedCategories.results);

    }).catch(error => {
      console.error('Failed to fetch data:', error);
      toast.error("Failed to load data.");
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage, fetchData]);


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!date) return;
    try {
      await apiClient.post('/transactions/create/', {
        description, amount, transaction_type: type, date: format(date, 'yyyy-MM-dd'), account: accountId, category: categoryId || null,
      });
      setIsAddDialogOpen(false);
      setDescription(''); setAmount(''); setType(''); setDate(new Date()); setAccountId(''); setCategoryId('');
      fetchData(currentPage);
      toast.success("Transaction Added", { description: `The "${description}" transaction was created.` });
    } catch (error) {
      console.error("Failed to create transaction:", error);
      toast.error("Failed to add transaction.");
    }
  };

  const handleCreateCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await apiClient.post('/categories/', { name: newCategoryName });
      setIsCategoryDialogOpen(false);
      setNewCategoryName('');
      const catResponse = await apiClient.get('/categories/');
      setCategories(catResponse.data);
      toast.success("Category Created", { description: `The "${newCategoryName}" category was added.` });
    } catch (error) {
      console.error("Failed to create category:", error);
      toast.error("Failed to create category.");
    }
  };

// Handle deleting a transaction
  const handleDelete = async (transactionId: number) => {
    setTransactions(currentTransactions =>
      currentTransactions.filter(t => t.id !== transactionId)
    );
    try {
      await apiClient.delete(`/transactions/${transactionId}/`);
      toast.success("Transaction Deleted");
      // FIX: Refresh the current page after deleting
      fetchData(currentPage);
    } catch (error) {
      console.error('Failed to delete transaction:', error);
      toast.error("Delete Failed");
      fetchData(currentPage); // Revert UI on error
    }
  };

  const getCategoryNameById = (id: number | null): string => {
    if (id === null) return 'N/A';
    return categories.find(c => c.id === id)?.name || 'N/A';
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-brand-secondary">Transactions</h1>
          <p className="mt-2 text-slate-500">View and manage your transactions.</p>
        </div>
        <div className="flex items-center gap-2">
          <TransactionCSVUploadDialog accounts={accounts} onSuccess={() => fetchData(1)} />
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button><PlusCircle className="mr-2 h-4 w-4" /> Add Transaction</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add Transaction</DialogTitle>
                <DialogDescription>Enter the details for your new transaction.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="account" className="text-right">Account</Label>
                  <Select onValueChange={setAccountId} value={accountId}>
                    <SelectTrigger className="col-span-3"><SelectValue placeholder="Select an account" /></SelectTrigger>
                    <SelectContent>
                      {accounts.map(acc => <SelectItem key={acc.id} value={String(acc.id)}>{acc.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">Description</Label>
                  <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="amount" className="text-right">Amount</Label>
                  <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="type" className="text-right">Type</Label>
                  <Select onValueChange={setType} value={type}>
                    <SelectTrigger className="col-span-3"><SelectValue placeholder="Select a type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INCOME">Income</SelectItem>
                      <SelectItem value="EXPENSE">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right">Category</Label>
                  <div className="col-span-3 flex items-center gap-2">
                    <Select onValueChange={setCategoryId} value={categoryId}>
                      <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                      <DialogTrigger asChild>
                        <Button type="button" variant="outline" size="icon">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[350px]">
                        <DialogHeader>
                          <DialogTitle>Add New Category</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreateCategory}>
                          <div className="grid gap-4 py-4">
                            <Label htmlFor="new-category-name">Category Name</Label>
                            <Input id="new-category-name" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} />
                          </div>
                          <DialogFooter>
                            <Button type="submit">Save Category</Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="date" className="text-right">Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="col-span-3 justify-start font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, 'PPP') : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={date} onSelect={setDate} initialFocus /></PopoverContent>
                  </Popover>
                </div>
                <DialogFooter>
                  <Button type="submit">Add Transaction</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="mt-8">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.description}</TableCell>
                  <TableCell className="text-slate-500">{t.account_name}</TableCell>
                  <TableCell>{getCategoryNameById(t.category)}</TableCell>
                  <TableCell><Badge variant={t.transaction_type === 'INCOME' ? 'default' : 'outline'}>{t.transaction_type}</Badge></TableCell>
                  <TableCell className="text-slate-500">{format(parseISO(t.date), 'dd MMM, yyyy')}</TableCell>
                  <TableCell className={`text-right font-medium ${t.transaction_type === 'INCOME' ? 'text-green-600' : ''}`}>
                    {t.transaction_type === 'INCOME' ? '+' : '-'}${parseFloat(t.amount).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <AlertDialog>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <EditTransactionDialog transaction={t} accounts={accounts} categories={categories} onSuccess={() => fetchData(currentPage)}>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Edit</DropdownMenuItem>
                          </EditTransactionDialog>
                          <DropdownMenuSeparator />
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                          </AlertDialogTrigger>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>This action cannot be undone. This will permanently delete this transaction.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(t.id)}>Continue</AlertDialogAction>
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
      {/* --- PAGINATION CONTROLS --- */}
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