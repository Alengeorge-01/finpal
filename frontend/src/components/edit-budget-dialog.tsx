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
type Category = { id: number; name: string; };
type Budget = {
  id: number;
  category: number;
  amount: string;
  start_date: string;
  end_date: string;
};

interface EditBudgetDialogProps {
  budget: Budget;
  categories: Category[];
  onSuccess: () => void;
  children: React.ReactNode;
}

export function EditBudgetDialog({ budget, categories, onSuccess, children }: EditBudgetDialogProps) {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  
  const [categoryId, setCategoryId] = useState<string>(String(budget.category));
  const [amount, setAmount] = useState<string>(budget.amount);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: parseISO(budget.start_date),
    to: parseISO(budget.end_date),
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!categoryId || !amount || !dateRange?.from || !dateRange?.to) {
      alert('Please fill out all fields.');
      return;
    }
    try {
      await apiClient.patch(`/budgets/${budget.id}/`, {
        category: categoryId,
        amount: amount,
        start_date: format(dateRange.from, 'yyyy-MM-dd'),
        end_date: format(dateRange.to, 'yyyy-MM-dd'),
      });
      setIsDialogOpen(false);
      onSuccess();
      toast.success('Budget updated successfully!', {
        description: `The budget for category "${categories.find(cat => cat.id === Number(categoryId))?.name}" has been updated.`,
      });
    } catch (error) {
      console.error('Failed to update budget:', error);
      toast.error('Failed to update budget', {
        description: 'There was an error updating the budget. Please try again.',
      });
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Budget</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
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
              <Label htmlFor="amount" className="text-right">Amount</Label>
              <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">Date Range</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="col-span-3 justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (dateRange.to ? (<>{format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}</>) : (format(dateRange.from, "LLL dd, y"))) : (<span>Pick a date range</span>)}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="range" selected={dateRange} onSelect={setDateRange} numberOfMonths={2} />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}