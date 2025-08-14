'use client';

import { useState } from 'react';
import apiClient from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { toast } from 'sonner';

// Type definitions
type Account = { id: number; name: string; };
type Category = { id: number; name: string; };
type Transaction = {
  id: number;
  description: string;
  amount: string;
  transaction_type: 'INCOME' | 'EXPENSE';
  date: string;
  account: number;
  category: number | null;
  account_name?: string; // Optional account_name from our API enhancement
};

interface EditTransactionDialogProps {
  transaction: Transaction;
  accounts: Account[];
  categories: Category[];
  onSuccess: () => void;
  children: React.ReactNode;
}

export function EditTransactionDialog({ transaction, accounts, categories, onSuccess, children }: EditTransactionDialogProps) {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  
  // Pre-fill form state with the transaction's existing data
  const [description, setDescription] = useState<string>(transaction.description);
  const [amount, setAmount] = useState<string>(transaction.amount);
  const [type, setType] = useState<string>(transaction.transaction_type);
  const [date, setDate] = useState<Date | undefined>(parseISO(transaction.date));
  const [accountId, setAccountId] = useState<string>(String(transaction.account));
  const [categoryId, setCategoryId] = useState<string>(String(transaction.category || ''));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!date) return;
    try {
      await apiClient.patch(`/transactions/${transaction.id}/`, {
        description,
        amount,
        transaction_type: type,
        date: format(date, 'yyyy-MM-dd'),
        account: accountId,
        category: categoryId || null,
      });
      setIsDialogOpen(false);
      onSuccess();
      toast.success('Transaction updated successfully!', {
        description: `The transaction "${description}" has been updated.`,
      });
    } catch (error) {
      console.error("Failed to update transaction:", error);
      toast.error('Failed to update transaction', {
        description: 'There was an error updating the transaction. Please try again.',
      });
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Transaction</DialogTitle>
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
              <Select onValueChange={setCategoryId} value={categoryId}>
              <SelectTrigger className="col-span-3"><SelectValue placeholder="Select a category" /></SelectTrigger>
              <SelectContent>
                  {categories.map(cat => <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>)}
              </SelectContent>
              </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">Date</Label>
              <Popover>
              <PopoverTrigger asChild>
                  <Button variant="outline" className="col-span-3 justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'PPP') : <span>Pick a date</span>}
                  </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={date} onSelect={setDate} initialFocus /></PopoverContent>
              </Popover>
          </div>
          <DialogFooter>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}